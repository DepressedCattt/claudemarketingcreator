/**
 * ComparePanel — modal for comparing a reference ad against a Remotion render.
 *
 * Workflow:
 *   1. Upload or pick a reference ad  (drop zone — any MP4/MOV from your filesystem)
 *   2. Upload or pick a rendered output  (drop zone OR select from out/ if already rendered)
 *   3. Click "Compare" → both videos uploaded to Gemini 2.5 Pro for visual diff
 *   4. Results: overall score (0–100), 5 category bars, prioritised fix list
 *   5. "Copy Agent Context" copies a compact prompt block for Claude to apply fixes
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  listRenderedFiles,
  startComparison,
  getComparisonStatus,
  getComparisonResult,
} from "../api";
import type {
  RenderedFile,
  ComparisonStatus,
  ComparisonResult,
  ComparisonFix,
} from "../api";
import { useStudio } from "../store/useStudio";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      "#111113",
  panel:   "#18181b",
  border:  "#2a2a2e",
  text:    "#e4e4e7",
  muted:   "#71717a",
  green:   "#059669",
  amber:   "#d97706",
  red:     "#dc2626",
  blue:    "#0ea5e9",
  accent:  "#f59e0b",
  inputBg: "#09090b",
};

function scoreColor(score: number): string {
  if (score >= 80) return C.green;
  if (score >= 55) return C.amber;
  return C.red;
}

const CAT_LABELS: Record<string, string> = {
  colors:        "Color fidelity",
  motionTiming:  "Motion timing",
  typography:    "Typography",
  layout:        "Layout & composition",
  kineticEnergy: "Kinetic energy",
};

// ─── Shared primitives ────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontSize: 11, fontWeight: 600, color: C.muted,
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
  }}>
    {children}
  </div>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { accent?: boolean }> = ({
  accent, style, children, ...rest
}) => (
  <button
    style={{
      height: 32, padding: "0 14px", borderRadius: 6,
      border:      accent ? "none" : `1px solid ${C.border}`,
      background:  accent ? C.accent : "#27272a",
      color:       accent ? "#000"   : C.text,
      fontSize: 12, fontWeight: accent ? 700 : 400,
      cursor: rest.disabled ? "not-allowed" : "pointer",
      opacity: rest.disabled ? 0.45 : 1, transition: "opacity 0.12s",
      display: "flex", alignItems: "center", gap: 6,
      ...style,
    }}
    onMouseEnter={(e) => { if (!rest.disabled) e.currentTarget.style.opacity = "0.8"; }}
    onMouseLeave={(e) => { if (!rest.disabled) e.currentTarget.style.opacity = "1"; }}
    {...rest}
  >
    {children}
  </button>
);

// ─── Video drop zone ──────────────────────────────────────────────────────────

const VideoDropZone: React.FC<{
  file:        File | null;
  fallbackName?: string;
  onFile:      (f: File) => void;
  label:       string;
  sublabel?:   string;
}> = ({ file, fallbackName, onFile, label, sublabel }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && /\.(mp4|mov|webm)$/i.test(f.name)) onFile(f);
  }, [onFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  const displayFile = file ?? (fallbackName ? { name: fallbackName, size: 0 } as File : null);
  const isReady     = !!displayFile;

  return (
    <div>
      <Label>{label}</Label>
      {sublabel && (
        <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>{sublabel}</div>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border:       `2px dashed ${dragging ? C.accent : isReady ? "#3b2e00" : C.border}`,
          borderRadius: 10,
          padding:      "20px 16px",
          textAlign:    "center",
          cursor:       "pointer",
          background:   dragging ? "#1a1300" : isReady ? "#13100a" : "#0e0e10",
          transition:   "all 0.15s",
          userSelect:   "none",
          minHeight:    96,
          display:      "flex",
          flexDirection: "column",
          alignItems:   "center",
          justifyContent: "center",
          gap:          6,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
          style={{ display: "none" }}
          onChange={handleChange}
        />
        {displayFile ? (
          <>
            <div style={{ fontSize: 22 }}>🎬</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>
              {displayFile.name}
            </div>
            {displayFile.size > 0 && (
              <div style={{ fontSize: 10, color: C.muted }}>
                {(displayFile.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            )}
            <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>
              Click or drop to replace
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 22 }}>📹</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: C.muted }}>
              Drop an MP4 / MOV here
            </div>
            <div style={{ fontSize: 10, color: "#444" }}>or click to browse</div>
          </>
        )}
      </div>
    </div>
  );
};

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGES = [
  { id: "uploading_reference", label: "Uploading reference",  desc: "Sending reference ad to Gemini" },
  { id: "uploading_rendered",  label: "Uploading render",     desc: "Sending rendered ad to Gemini" },
  { id: "processing",          label: "Processing videos",    desc: "Gemini is processing both files" },
  { id: "comparing",           label: "Comparing",            desc: "Gemini 2.5 Pro is watching both and scoring" },
  { id: "writing",             label: "Writing results",      desc: "Saving comparison JSON to compare-results/" },
];

// ─── Progress view ────────────────────────────────────────────────────────────

const ProgressView: React.FC<{ status: ComparisonStatus }> = ({ status }) => {
  const currentIdx = STAGES.findIndex((s) => s.id === status.stage);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STAGES.map((s, i) => {
          const isPast   = i < currentIdx || status.done;
          const isActive = !status.done && s.id === status.stage;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                background: status.failed && isActive ? C.red : isPast ? C.green : isActive ? C.accent : "#333",
                boxShadow:  isActive && !status.done ? `0 0 0 3px ${C.accent}33` : "none",
                transition: "background 0.3s",
              }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 400, color: isActive ? C.text : isPast ? C.green : "#444" }}>
                  {s.label}
                </span>
                {isActive && <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{s.desc}</span>}
              </div>
              {isPast && !status.failed && <span style={{ fontSize: 11, color: C.green }}>✓</span>}
            </div>
          );
        })}
      </div>
      {status.logs.length > 0 && (
        <div style={{ background: C.inputBg, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", maxHeight: 80, overflowY: "auto" }}>
          {status.logs.slice(-6).map((l, i) => (
            <div key={i} style={{ fontSize: 10, color: "#555", fontFamily: "monospace", lineHeight: 1.4 }}>{l}</div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>{status.elapsed}s elapsed</div>
    </div>
  );
};

// ─── Score ring ───────────────────────────────────────────────────────────────

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const r    = 32;
  const circ = 2 * Math.PI * r;
  const dash = circ * (1 - score / 100);
  const col  = scoreColor(score);
  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={40} cy={40} r={r} fill="none" stroke="#27272a" strokeWidth={7} />
        <circle cx={40} cy={40} r={r} fill="none" stroke={col} strokeWidth={7}
          strokeDasharray={circ} strokeDashoffset={dash} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: col, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.06em" }}>/ 100</div>
      </div>
    </div>
  );
};

// ─── Category bars ────────────────────────────────────────────────────────────

const CategoryBars: React.FC<{ categories: ComparisonResult["categories"] }> = ({ categories }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {Object.entries(categories).map(([key, cat]) => {
      const pct   = (cat.score / cat.max) * 100;
      const color = scoreColor(pct);
      return (
        <div key={key}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: C.muted }}>{CAT_LABELS[key] ?? key}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color, fontFamily: "monospace" }}>
              {cat.score}/{cat.max}
            </span>
          </div>
          <div style={{ height: 5, background: "#27272a", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
          </div>
          {cat.note && (
            <div style={{ fontSize: 10, color: "#555", marginTop: 3, lineHeight: 1.4 }}>{cat.note}</div>
          )}
        </div>
      );
    })}
  </div>
);

// ─── Fix list ─────────────────────────────────────────────────────────────────

const FixList: React.FC<{ fixes: ComparisonFix[] }> = ({ fixes }) => {
  const borderColor = (p: number) => p === 1 ? C.red : p === 2 ? C.amber : C.muted;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {fixes.map((fix, i) => (
        <div key={i} style={{
          background: C.inputBg,
          border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${borderColor(fix.priority)}`,
          borderRadius: "0 6px 6px 0",
          padding: "10px 12px",
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: borderColor(fix.priority), textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
            P{fix.priority} — {CAT_LABELS[fix.category] ?? fix.category}
          </div>
          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5, marginBottom: 6 }}>{fix.issue}</div>
          <div style={{ fontSize: 11, color: C.blue, fontFamily: "monospace", lineHeight: 1.5, background: "#0a1626", padding: "6px 8px", borderRadius: 4 }}>
            {fix.codeHint}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Result view ──────────────────────────────────────────────────────────────

const ResultView: React.FC<{ result: ComparisonResult; onReset: () => void }> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const lines = [
      `## Visual Comparison Result — ${result.compId} (Iteration ${result.iterN})`,
      ``,
      `**Overall score: ${result.overallScore}/100**`,
      ``,
      `### Category scores`,
      ...Object.entries(result.categories).map(([k, v]) => `- ${CAT_LABELS[k] ?? k}: ${v.score}/${v.max} — ${v.note}`),
      ``,
      `### Key finding`,
      result.iterationNote,
      ``,
      `### Fixes to apply (priority order)`,
      ...result.fixes.map((f, i) => `${i + 1}. [P${f.priority} – ${CAT_LABELS[f.category] ?? f.category}]\n   Issue: ${f.issue}\n   Fix: ${f.codeHint}`),
      ``,
      `Please apply these fixes to \`src/compositions/${result.compId}.tsx\` in priority order.`,
      `Start with fix #1, then re-render and compare again.`,
    ];
    navigator.clipboard.writeText(lines.join("\n")).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }, [result]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Score header */}
      <div style={{
        background: "#0a1000", border: `1px solid ${scoreColor(result.overallScore)}44`,
        borderRadius: 10, padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <ScoreRing score={result.overallScore} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>
            Iteration {result.iterN} complete
          </div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6, marginBottom: 8 }}>
            {result.iterationNote}
          </div>
          <div style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>
            {result.referenceFile} vs {result.renderedFile}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div>
        <Label>Score breakdown</Label>
        <CategoryBars categories={result.categories} />
      </div>

      {/* Fix list */}
      {result.fixes.length > 0 && (
        <div>
          <Label>Fixes — apply in order ({result.fixes.length} items)</Label>
          <FixList fixes={result.fixes} />
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
        <Btn accent onClick={handleCopy} style={{ flex: 1, justifyContent: "center" }}>
          {copied ? "✓ Copied!" : "📋 Copy agent context"}
        </Btn>
        <Btn onClick={onReset}>Compare again</Btn>
      </div>

      <div style={{
        background: "#13111e", border: `1px solid #2d1f5e`,
        borderRadius: 8, padding: "10px 12px",
        fontSize: 11, color: "#a78bfa", lineHeight: 1.6,
      }}>
        Paste the copied context into a Cursor chat with your composition open.
        Claude applies the fixes → you re-render → click Compare again.
      </div>
    </div>
  );
};

// ─── Main panel ───────────────────────────────────────────────────────────────

export const ComparePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activeCompId } = useStudio();

  const [refFile,      setRefFile]      = useState<File | null>(null);
  const [renFile,      setRenFile]      = useState<File | null>(null);
  const [renPick,      setRenPick]      = useState("");           // select from out/
  const [renFiles,     setRenFiles]     = useState<RenderedFile[]>([]);
  const [compIdField,  setCompIdField]  = useState(activeCompId ?? "");
  const [jobId,        setJobId]        = useState<string | null>(null);
  const [status,       setStatus]       = useState<ComparisonStatus | null>(null);
  const [result,       setResult]       = useState<ComparisonResult | null>(null);
  const [err,          setErr]          = useState<string | null>(null);
  const [running,      setRunning]      = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // Load rendered files on open
  useEffect(() => {
    (async () => {
      try {
        const ren = await listRenderedFiles();
        setRenFiles(ren);
        if (activeCompId) {
          const match = ren.find((f) => f.name.includes(activeCompId));
          if (match) setRenPick(match.name);
        }
      } catch { /* server offline */ }
      setLoadingFiles(false);
    })();
  }, [activeCompId]);

  const startPolling = useCallback((id: string, cId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const s = await getComparisonStatus(id);
        setStatus(s);
        if (s.done && !s.failed) {
          clearInterval(pollRef.current!);
          setRunning(false);
          try {
            const r = await getComparisonResult(cId);
            if (r.latest) setResult(r.latest);
          } catch {}
        } else if (s.failed) {
          clearInterval(pollRef.current!);
          setRunning(false);
          setErr(s.errorMsg ?? "Comparison failed");
        }
      } catch { /* briefly offline */ }
    }, 2500);
  }, []);

  const handleCompare = useCallback(async () => {
    const cId = compIdField.trim();
    if (!refFile) { setErr("Please select a reference ad."); return; }
    if (!renFile && !renPick) { setErr("Please select or upload a rendered output."); return; }
    if (!cId) { setErr("Please enter a composition ID."); return; }

    setErr(null);
    setRunning(true);
    setStatus(null);
    setResult(null);

    try {
      const res = await startComparison(
        cId,
        refFile,
        null,
        renFile,
        renPick || null,
      );
      setJobId(res.jobId);
      setStatus({
        done: false, failed: false, stage: "uploading_reference", ticks: 0,
        compId: cId, iterN: null, filename: null,
        overallScore: null, fixCount: null, errorMsg: null, elapsed: 0, logs: [],
      });
      startPolling(res.jobId, cId);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setRunning(false);
    }
  }, [refFile, renFile, renPick, compIdField, startPolling]);

  const handleReset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setJobId(null); setStatus(null); setResult(null);
    setErr(null); setRunning(false);
    setRefFile(null); setRenFile(null);
  }, []);

  const canStart = !!refFile && (!!renFile || !!renPick) && !!compIdField.trim() && !running;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.72)", display: "flex",
        alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 580, maxHeight: "92vh",
          background: C.bg, border: `1px solid ${C.border}`,
          borderRadius: 14, display: "flex", flexDirection: "column",
          overflow: "hidden", boxShadow: "0 24px 80px #000a",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: 15 }}>⚖</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Compare Ads</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
              Gemini 2.5 Pro · Scores your render against a reference
            </div>
          </div>
          {result && (
            <div style={{
              fontSize: 11, fontWeight: 700, color: scoreColor(result.overallScore),
              fontFamily: "monospace", padding: "2px 8px",
              background: `${scoreColor(result.overallScore)}18`, borderRadius: 4,
            }}>
              {result.overallScore}/100
            </div>
          )}
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: "2px 6px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 6px" }}>
          {err && !running ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{
                background: "#1f0a0a", border: `1px solid #7f1d1d`,
                borderRadius: 10, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.red, marginBottom: 6 }}>✗ Error</div>
                <div style={{ fontSize: 11, color: "#fca5a5", fontFamily: "monospace", lineHeight: 1.5 }}>{err}</div>
              </div>
              <Btn onClick={() => setErr(null)} style={{ alignSelf: "flex-start" }}>← Try again</Btn>
            </div>
          ) : result ? (
            <ResultView result={result} onReset={handleReset} />
          ) : running && status ? (
            <ProgressView status={status} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Comp ID */}
              <div>
                <Label>Composition ID</Label>
                <input
                  type="text"
                  value={compIdField}
                  onChange={(e) => setCompIdField(e.target.value)}
                  placeholder="e.g. langease-v1"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: C.inputBg, border: `1px solid ${C.border}`,
                    borderRadius: 6, color: C.text, fontSize: 12,
                    padding: "7px 10px", outline: "none",
                  }}
                />
              </div>

              {/* Reference drop zone */}
              <VideoDropZone
                file={refFile}
                onFile={setRefFile}
                label="Reference ad"
                sublabel="The original ad you want to match — drop any MP4 or MOV from your file system"
              />

              {/* Rendered output */}
              <div>
                <Label>Rendered output</Label>
                <div style={{ fontSize: 10, color: "#555", marginBottom: 8 }}>
                  Your Remotion render — select from <code style={{ color: "#666" }}>out/</code> or drop an MP4 below
                </div>

                {/* Select from out/ (if files exist) */}
                {!loadingFiles && renFiles.length > 0 && !renFile && (
                  <div style={{ marginBottom: 10 }}>
                    <select
                      value={renPick}
                      onChange={(e) => setRenPick(e.target.value)}
                      style={{
                        width: "100%", background: C.inputBg, border: `1px solid ${renPick ? "#3b2e00" : C.border}`,
                        borderRadius: 6, color: C.text, fontSize: 12, padding: "7px 10px",
                        outline: "none", cursor: "pointer",
                      }}
                    >
                      <option value="">— select a rendered file —</option>
                      {renFiles.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.name} ({f.sizeHuman}) · {new Date(f.modified).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                    <div style={{ fontSize: 10, color: "#444", marginTop: 5, textAlign: "center" }}>
                      — or drop a different file below —
                    </div>
                  </div>
                )}

                <VideoDropZone
                  file={renFile}
                  fallbackName={renPick || undefined}
                  onFile={(f) => { setRenFile(f); setRenPick(""); }}
                  label=""
                  sublabel=""
                />
              </div>

              {/* Info */}
              <div style={{
                background: "#131000", border: `1px solid #2d2000`,
                borderRadius: 8, padding: "10px 12px",
                fontSize: 11, color: C.amber, lineHeight: 1.6,
                display: "flex", gap: 8,
              }}>
                <span style={{ flexShrink: 0 }}>ℹ</span>
                <span>
                  Both videos are uploaded to Gemini 2.5 Pro which watches them simultaneously.
                  Results are saved to <strong>compare-results/</strong> so the agent can read them
                  and apply targeted code fixes.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!result && !running && !err && (
          <div style={{
            padding: "12px 18px", borderTop: `1px solid ${C.border}`,
            display: "flex", justifyContent: "flex-end", gap: 8, flexShrink: 0,
          }}>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn accent disabled={!canStart} onClick={handleCompare}>
              ⚖ Compare
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
};
