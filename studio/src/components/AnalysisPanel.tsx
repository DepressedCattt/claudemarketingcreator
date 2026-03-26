/**
 * AnalysisPanel — modal dialog for uploading reference MP4 ads and
 * triggering Gemini 1.5 Pro video analysis.
 *
 * Workflow:
 *   1. Drop or pick an MP4 / MOV file
 *   2. Optionally name the ad
 *   3. Click "Analyse" → uploads to server → spawns analyze-ad.js
 *   4. Progress stages: Uploading → Processing → Analysing → Writing → Done
 *   5. Result preview with link to LEARNINGS.md section
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import { startAnalysis, getAnalysisStatus } from "../api";
import type { AnalysisStatus } from "../api";

// ─── Design tokens (match RenderDialog) ──────────────────────────────────────
const C = {
  bg:      "#111113",
  panel:   "#18181b",
  border:  "#2a2a2e",
  text:    "#e4e4e7",
  muted:   "#71717a",
  accent:  "#8b5cf6",   // purple — distinguishes from render (blue)
  green:   "#059669",
  amber:   "#d97706",
  red:     "#dc2626",
  inputBg: "#09090b",
};

// ─── Stage config ─────────────────────────────────────────────────────────────
const STAGES: { id: string; label: string; desc: string }[] = [
  { id: "uploading",  label: "Uploading",  desc: "Sending video to Gemini File API" },
  { id: "processing", label: "Processing", desc: "Gemini is processing the video file" },
  { id: "analysing",  label: "Analysing",  desc: "Gemini 1.5 Pro is watching and reasoning" },
  { id: "writing",    label: "Writing",    desc: "Appending results to LEARNINGS.md" },
];

// ─── Small shared primitives ──────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
    {children}
  </div>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { accent?: boolean; danger?: boolean }> = ({
  accent, danger, style, children, ...rest
}) => {
  const bg     = accent ? C.accent : danger ? "#3f0a0a" : "#27272a";
  const border = accent ? "none"   : danger ? `1px solid #7f1d1d` : `1px solid ${C.border}`;
  const color  = accent ? "#fff"   : danger ? "#fca5a5" : C.text;
  return (
    <button
      style={{
        height: 32, padding: "0 14px", borderRadius: 6,
        background: bg, border, color, fontSize: 12, fontWeight: accent ? 600 : 400,
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
};

// ─── Pulsing dot indicator ─────────────────────────────────────────────────────
const PulseDot: React.FC<{ active: boolean; done: boolean; failed: boolean }> = ({ active, done, failed }) => {
  const bg = failed ? C.red : done ? C.green : active ? C.accent : "#333";
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%", background: bg, flexShrink: 0,
      boxShadow: active && !done ? `0 0 0 3px ${C.accent}33` : "none",
      transition: "background 0.3s, box-shadow 0.3s",
    }} />
  );
};

// ─── Drop zone ────────────────────────────────────────────────────────────────
const DropZone: React.FC<{
  file:     File | null;
  onFile:   (f: File) => void;
}> = ({ file, onFile }) => {
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

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        border:       `2px dashed ${dragging ? C.accent : file ? "#3b3052" : C.border}`,
        borderRadius: 10,
        padding:      "28px 20px",
        textAlign:    "center",
        cursor:       "pointer",
        background:   dragging ? "#1a1626" : file ? "#13101e" : "#0e0e10",
        transition:   "all 0.15s",
        userSelect:   "none",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
        style={{ display: "none" }}
        onChange={handleChange}
      />
      {file ? (
        <>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🎬</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
            {file.name}
          </div>
          <div style={{ fontSize: 11, color: C.muted }}>
            {(file.size / (1024 * 1024)).toFixed(1)} MB · Click to change
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📹</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.muted, marginBottom: 4 }}>
            Drop an MP4 / MOV here
          </div>
          <div style={{ fontSize: 11, color: "#444" }}>or click to browse</div>
        </>
      )}
    </div>
  );
};

// ─── Progress view ─────────────────────────────────────────────────────────────
const ProgressView: React.FC<{ status: AnalysisStatus | null }> = ({ status }) => {
  if (!status) return null;

  const currentStageIdx = STAGES.findIndex((s) => s.id === status.stage);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Stage pipeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {STAGES.map((s, i) => {
          const isPast   = i < currentStageIdx || status.done;
          const isActive = !status.done && s.id === status.stage;
          const isFailed = status.failed && s.id === status.stage;
          return (
            <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PulseDot active={isActive} done={isPast && !isFailed} failed={isFailed} />
              <div style={{ flex: 1 }}>
                <span style={{
                  fontSize: 12, fontWeight: isActive ? 600 : 400,
                  color: isActive ? C.text : isPast ? C.green : "#444",
                }}>
                  {s.label}
                </span>
                {isActive && (
                  <span style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{s.desc}</span>
                )}
              </div>
              {isPast && !status.failed && (
                <span style={{ fontSize: 11, color: C.green }}>✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Processing tick counter */}
      {status.stage === "processing" && status.ticks > 0 && (
        <div style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
          Processing… {status.ticks * 4}s elapsed
        </div>
      )}

      {/* Log tail */}
      {status.logs.length > 0 && (
        <div style={{
          background:   C.inputBg,
          border:       `1px solid ${C.border}`,
          borderRadius: 6,
          padding:      "8px 10px",
          maxHeight:    100,
          overflowY:    "auto",
          display:      "flex",
          flexDirection: "column",
          gap:          3,
        }}>
          {status.logs.slice(-8).map((l, i) => (
            <div key={i} style={{ fontSize: 10, color: "#555", fontFamily: "monospace", lineHeight: 1.4 }}>
              {l}
            </div>
          ))}
        </div>
      )}

      {/* Elapsed */}
      <div style={{ fontSize: 11, color: "#444", fontFamily: "monospace" }}>
        {status.elapsed}s elapsed
      </div>
    </div>
  );
};

// ─── Done view ────────────────────────────────────────────────────────────────
const DoneView: React.FC<{ status: AnalysisStatus; onReset: () => void }> = ({ status, onReset }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    <div style={{
      background:   "#0a1f0f",
      border:       `1px solid #1a4d2a`,
      borderRadius: 10,
      padding:      "16px 18px",
      display:      "flex",
      flexDirection: "column",
      gap:          8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 18 }}>✅</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Analysis complete</span>
      </div>
      <div style={{ fontSize: 12, color: "#86efac" }}>
        <strong>{status.adName}</strong> has been analysed and appended to{" "}
        <code style={{ background: "#0f2d1a", padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>
          LEARNINGS.md
        </code>{" "}
        as section{" "}
        <code style={{ background: "#0f2d1a", padding: "1px 5px", borderRadius: 3, fontSize: 11 }}>
          G.{status.sectionIndex}
        </code>
      </div>
    </div>

    <div style={{
      background:   "#18181b",
      border:       `1px solid ${C.border}`,
      borderRadius: 8,
      padding:      "12px 14px",
      fontSize:     12,
      color:        C.muted,
      lineHeight:   1.6,
    }}>
      Open <strong style={{ color: C.text }}>LEARNINGS.md</strong> in your editor to see the full analysis,
      then reference it in your next Claude conversation to recreate the ad.
    </div>

    <Btn onClick={onReset} style={{ alignSelf: "flex-start" }}>
      ← Analyse another ad
    </Btn>
  </div>
);

// ─── Error view ───────────────────────────────────────────────────────────────
const ErrorView: React.FC<{ msg: string; onReset: () => void }> = ({ msg, onReset }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    <div style={{
      background:   "#1f0a0a",
      border:       `1px solid #7f1d1d`,
      borderRadius: 10,
      padding:      "14px 16px",
      display:      "flex",
      flexDirection: "column",
      gap:          6,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.red }}>✗ Analysis failed</div>
      <div style={{ fontSize: 11, color: "#fca5a5", fontFamily: "monospace", lineHeight: 1.5 }}>
        {msg}
      </div>
    </div>
    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
      Common causes: missing <code>GEMINI_API_KEY</code> in <code>.env</code>,
      corrupt video file, or network timeout during upload.
    </div>
    <Btn onClick={onReset} style={{ alignSelf: "flex-start" }}>
      ← Try again
    </Btn>
  </div>
);

// ─── Main panel ───────────────────────────────────────────────────────────────
export const AnalysisPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [file,    setFile]    = useState<File | null>(null);
  const [adName,  setAdName]  = useState("");
  const [jobId,   setJobId]   = useState<string | null>(null);
  const [status,  setStatus]  = useState<AnalysisStatus | null>(null);
  const [err,     setErr]     = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Stop polling on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const startPolling = useCallback((id: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const s = await getAnalysisStatus(id);
        setStatus(s);
        if (s.done || s.failed) {
          clearInterval(pollRef.current!);
          setRunning(false);
        }
      } catch { /* server briefly unavailable */ }
    }, 2500);
  }, []);

  const handleAnalyse = useCallback(async () => {
    if (!file) return;
    setErr(null);
    setRunning(true);
    setStatus(null);

    const name = adName.trim() || file.name.replace(/\.[^.]+$/, "");

    try {
      const res = await startAnalysis(file, name);
      setJobId(res.jobId);
      setStatus({ done: false, failed: false, stage: "uploading", ticks: 0,
        adName: res.adName, sectionIndex: null, errorMsg: null, elapsed: 0, logs: [] });
      startPolling(res.jobId);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
      setRunning(false);
    }
  }, [file, adName, startPolling]);

  const handleReset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setFile(null); setAdName(""); setJobId(null);
    setStatus(null); setErr(null); setRunning(false);
  }, []);

  const isDone   = status?.done  && !status?.failed;
  const isFailed = status?.failed || !!err;
  const errorMsg = status?.errorMsg ?? err ?? "Unknown error";

  return (
    // ── Backdrop ────────────────────────────────────────────────────────────────
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.72)", display: "flex",
        alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(3px)",
      }}
    >
      {/* ── Dialog ────────────────────────────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width:        540,
          maxHeight:    "85vh",
          background:   C.bg,
          border:       `1px solid ${C.border}`,
          borderRadius: 14,
          display:      "flex",
          flexDirection: "column",
          overflow:     "hidden",
          boxShadow:    "0 24px 80px #000a",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div style={{
          padding:      "14px 18px",
          borderBottom: `1px solid ${C.border}`,
          display:      "flex",
          alignItems:   "center",
          gap:          10,
          flexShrink:   0,
        }}>
          <span style={{ fontSize: 15 }}>🔬</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Analyse Reference Ad</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
              Gemini 2.5 Pro · Writes to LEARNINGS.md
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: "2px 6px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 6px" }}>
          {isDone ? (
            <DoneView status={status!} onReset={handleReset} />
          ) : isFailed ? (
            <ErrorView msg={errorMsg} onReset={handleReset} />
          ) : running ? (
            <ProgressView status={status} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Drop zone */}
              <div>
                <Label>Video file</Label>
                <DropZone file={file} onFile={setFile} />
              </div>

              {/* Ad name */}
              <div>
                <Label>Ad name (optional)</Label>
                <input
                  type="text"
                  placeholder={file ? file.name.replace(/\.[^.]+$/, "") : "e.g. Competitor SaaS Q1 2026"}
                  value={adName}
                  onChange={(e) => setAdName(e.target.value)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: C.inputBg, border: `1px solid ${C.border}`,
                    borderRadius: 6, color: C.text, fontSize: 12,
                    padding: "7px 10px", outline: "none",
                  }}
                />
              </div>

              {/* Info box */}
              <div style={{
                background:   "#13111e",
                border:       `1px solid #2d1f5e`,
                borderRadius: 8,
                padding:      "10px 12px",
                fontSize:     11,
                color:        "#a78bfa",
                lineHeight:   1.6,
                display:      "flex",
                gap:          8,
              }}>
                <span style={{ flexShrink: 0 }}>ℹ</span>
                <span>
                  Gemini will analyse the video natively — no frame extraction needed.
                  The full analysis is appended to <strong>LEARNINGS.md</strong> for
                  use in future ad creation sessions.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        {!isDone && !isFailed && !running && (
          <div style={{
            padding:   "12px 18px",
            borderTop: `1px solid ${C.border}`,
            display:   "flex",
            justifyContent: "flex-end",
            gap:       8,
            flexShrink: 0,
          }}>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn accent disabled={!file || running} onClick={handleAnalyse}>
              🔍 Analyse
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
};
