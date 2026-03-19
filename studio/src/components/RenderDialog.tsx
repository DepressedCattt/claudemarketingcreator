/**
 * RenderDialog — full render configuration popup.
 *
 * Tabs:
 *   Render  — composition picker, quality presets, advanced options
 *   History — past render log with timing, settings, and performance data
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import { REGISTRY }       from "../registry";
import { startRender, getRenderStatus, getRenderHistory, previewUrl } from "../api";
import type { RenderOptions, RenderStatus, RenderHistoryEntry } from "../api";
import type { CompMeta }  from "../types";

// ─── Palette / tokens ─────────────────────────────────────────────────────────
const C = {
  bg:       "#111113",
  panel:    "#18181b",
  border:   "#2a2a2e",
  text:     "#e4e4e7",
  muted:    "#71717a",
  accent:   "#0070f3",
  green:    "#059669",
  amber:    "#d97706",
  red:      "#dc2626",
  inputBg:  "#09090b",
};

// ─── Quality presets ──────────────────────────────────────────────────────────
interface Preset { id: string; label: string; tag: string; desc: string; color: string; scale: number; crf: number; jpegQuality: number; everyNthFrame: number; codec: string }
const PRESETS: Preset[] = [
  { id: "draft",  label: "Draft",  tag: "Fastest",  desc: "Every 2nd frame · low compression. Quick preview.", color: "#3f3f46", scale: 1, crf: 32, jpegQuality: 70,  everyNthFrame: 2, codec: "h264" },
  { id: "normal", label: "Normal", tag: "Balanced", desc: "Full frames · standard compression.",                color: "#1d4ed8", scale: 1, crf: 18, jpegQuality: 90,  everyNthFrame: 1, codec: "h264" },
  { id: "hq",     label: "HQ",     tag: "2× scale", desc: "2× resolution · sharp output.",                     color: "#7c3aed", scale: 2, crf: 12, jpegQuality: 95,  everyNthFrame: 1, codec: "h264" },
  { id: "master", label: "Master", tag: "Archival", desc: "2× scale · near-lossless for editing.",              color: "#b45309", scale: 2, crf: 8,  jpegQuality: 100, everyNthFrame: 1, codec: "h264" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatSeconds = (frames: number, fps: number) => {
  const s = frames / fps;
  return s < 60 ? `${s.toFixed(1)}s` : `${Math.floor(s / 60)}m ${(s % 60).toFixed(0)}s`;
};
const formatRes = (w: number, h: number, scale: number) =>
  `${w * scale} × ${h * scale}`;

// ─── Small primitives ─────────────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
    {children}
  </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    style={{
      width: "100%", boxSizing: "border-box",
      background: C.inputBg, border: `1px solid ${C.border}`,
      borderRadius: 6, color: C.text, fontSize: 12,
      padding: "6px 10px", outline: "none",
      ...props.style,
    }}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select
    {...props}
    style={{
      width: "100%", boxSizing: "border-box",
      background: C.inputBg, border: `1px solid ${C.border}`,
      borderRadius: 6, color: C.text, fontSize: 12,
      padding: "6px 10px", outline: "none", cursor: "pointer",
      ...props.style,
    }}
  />
);

const Divider = () => <div style={{ borderTop: `1px solid ${C.border}`, margin: "16px 0" }} />;

// ─── Thin animated progress bar ───────────────────────────────────────────────
const ProgressBar: React.FC<{ pct: number; indeterminate: boolean }> = ({ pct, indeterminate }) => (
  <div style={{ height: 4, borderRadius: 2, background: "#27272a", overflow: "hidden", marginTop: 12 }}>
    <div style={{
      height: "100%", borderRadius: 2,
      width:  indeterminate ? "35%" : `${pct}%`,
      background: C.accent,
      transition: indeterminate ? "none" : "width 0.5s ease",
      animation: indeterminate ? "rds 1.4s ease-in-out infinite" : "none",
    }} />
    <style>{`@keyframes rds{0%{transform:translateX(-100%)}100%{transform:translateX(390%)}}`}</style>
  </div>
);

// ─── Video preview overlay ────────────────────────────────────────────────────
const VideoModal: React.FC<{ src: string; onClose: () => void }> = ({ src, onClose }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 10001, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", borderRadius: 12, overflow: "hidden", boxShadow: "0 30px 100px rgba(0,0,0,0.8)", maxWidth: "min(88vw,520px)", maxHeight: "92vh", background: "#000" }}>
        <video src={src} controls autoPlay style={{ display: "block", width: "100%", maxHeight: "92vh" }} />
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.65)", border: "none", color: "#fff", borderRadius: "50%", width: 28, height: 28, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
      </div>
    </div>
  );
};

// ─── Main dialog ─────────────────────────────────────────────────────────────
export interface RenderDialogProps {
  /** Pre-select the active comp when opening. */
  initialCompId?: string;
  onClose: () => void;
}

export const RenderDialog: React.FC<RenderDialogProps> = ({ initialCompId, onClose }) => {
  // ── state ────────────────────────────────────────────────────────────────────
  const [activeTab,   setActiveTab]   = useState<"render" | "history">("render");
  const [selectedId,  setSelectedId]  = useState(initialCompId ?? REGISTRY[0]?.id ?? "");
  const [presetId,    setPresetId]    = useState("hq");
  const [showAdv,     setShowAdv]     = useState(false);
  const [formatFilter, setFormatFilter] = useState<string>("all");

  // History
  const [history,     setHistory]     = useState<RenderHistoryEntry[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  // Advanced overrides (null = use preset default)
  const [scaleOvr,   setScaleOvr]   = useState<string>("");
  const [crfOvr,     setCrfOvr]     = useState<string>("");
  const [jpegOvr,    setJpegOvr]    = useState<string>("");
  const [codecOvr,   setCodecOvr]   = useState<string>("");
  const [nthOvr,     setNthOvr]     = useState<string>("");
  const [startFrOvr, setStartFrOvr] = useState<string>("");
  const [endFrOvr,   setEndFrOvr]   = useState<string>("");
  const [filenameOvr, setFilenameOvr] = useState<string>("");

  // Job / progress state
  const [jobId,       setJobId]       = useState<string | null>(null);
  const [status,      setStatus]      = useState<RenderStatus | null>(null);
  const [renderDone,  setRenderDone]  = useState(false);
  const [renderFailed, setRenderFailed] = useState(false);
  const [outputPath,  setOutputPath]  = useState("");
  const [showVideo,   setShowVideo]   = useState(false);
  const [errorMsg,    setErrorMsg]    = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = useCallback(() => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }, []);
  useEffect(() => () => stopPoll(), [stopPoll]);

  // Close on Escape (when not rendering)
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape" && !jobId) onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, jobId]);

  // Load history whenever the History tab is opened, and after a render finishes
  const loadHistory = useCallback(async () => {
    setHistLoading(true);
    try { setHistory(await getRenderHistory()); } catch { /* server may be offline */ }
    finally { setHistLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === "history") loadHistory();
  }, [activeTab, loadHistory]);

  // Also refresh history when a render completes
  useEffect(() => {
    if (renderDone || renderFailed) loadHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderDone, renderFailed]);

  // ── derived ──────────────────────────────────────────────────────────────────
  const comp    = REGISTRY.find((c) => c.id === selectedId);
  const preset  = PRESETS.find((p) => p.id === presetId)!;

  const effectiveScale  = scaleOvr  ? Number(scaleOvr)  : preset.scale;
  const effectiveCrf    = crfOvr    ? Number(crfOvr)     : preset.crf;
  const effectiveJpeg   = jpegOvr   ? Number(jpegOvr)    : preset.jpegQuality;
  const effectiveCodec  = codecOvr  || preset.codec;
  const effectiveNth    = nthOvr    ? Number(nthOvr)     : preset.everyNthFrame;

  const outRes  = comp ? formatRes(comp.width, comp.height, effectiveScale) : "–";
  const durText = comp ? formatSeconds(comp.durationInFrames, comp.fps) : "–";
  const totalFrames = comp ? Math.ceil(comp.durationInFrames / effectiveNth) : 0;

  const isRendering = !!jobId && !renderDone && !renderFailed;
  const pct = status
    ? (status.totalFrames > 0 ? Math.round((status.frames / status.totalFrames) * 100) : status.pct)
    : 0;

  const filteredComps = formatFilter === "all"
    ? REGISTRY
    : REGISTRY.filter((c) => c.format === formatFilter);

  // ── handlers ─────────────────────────────────────────────────────────────────
  const handleRender = async () => {
    if (!comp) return;
    setErrorMsg("");
    setJobId(null);
    setStatus(null);
    setRenderDone(false);
    setRenderFailed(false);
    setOutputPath("");
    stopPoll();

    const suffix   = presetId !== "normal" ? `-${presetId}` : "";
    const outFile  = filenameOvr
      ? (filenameOvr.endsWith(".mp4") ? `out/${filenameOvr}` : `out/${filenameOvr}.mp4`)
      : `out/${comp.id}${suffix}.mp4`;

    const opts: RenderOptions = {
      compId:       comp.id,
      outFile,
      scale:        effectiveScale !== 1 ? effectiveScale : undefined,
      crf:          effectiveCrf,
      jpegQuality:  effectiveJpeg,
      codec:        effectiveCodec !== "h264" ? effectiveCodec : undefined,
      everyNthFrame: effectiveNth > 1 ? effectiveNth : undefined,
      startFrame:   startFrOvr ? Number(startFrOvr) : undefined,
      endFrame:     endFrOvr   ? Number(endFrOvr)   : undefined,
    };

    try {
      const res = await startRender(opts);
      setJobId(res.jobId);

      pollRef.current = setInterval(async () => {
        try {
          const s = await getRenderStatus(res.jobId);
          setStatus(s);
          if (s.done) {
            stopPoll();
            if (s.failed) { setRenderFailed(true); }
            else          { setRenderDone(true); setOutputPath(s.output); }
          }
        } catch { /* keep polling */ }
      }, 1200);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Could not start render");
    }
  };

  const handleCancel = () => {
    if (isRendering) return; // don't close mid-render
    stopPoll();
    onClose();
  };

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleCancel}
        style={{ position: "fixed", inset: 0, zIndex: 9998, background: "rgba(0,0,0,0.72)" }}
      />

      {/* Dialog */}
      <div style={{
        position: "fixed", zIndex: 9999,
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 840, maxWidth: "96vw",
        maxHeight: "92vh",
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 32px 96px rgba(0,0,0,0.9)",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: C.text,
        userSelect: "none",
      }}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", padding: "0 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0, height: 48 }}>
          <span style={{ fontSize: 15, fontWeight: 700, marginRight: 20 }}>Render</span>

          {/* Tab switcher */}
          {(["render", "history"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                color: activeTab === tab ? C.text : C.muted,
                padding: "0 2px", marginRight: 18, height: "100%",
                borderBottom: activeTab === tab ? `2px solid ${C.accent}` : "2px solid transparent",
                transition: "color 0.12s",
              }}
            >
              {tab === "render" ? "Configure" : "History"}
              {tab === "history" && history.length > 0 && (
                <span style={{ marginLeft: 5, fontSize: 10, background: C.border, color: C.muted, borderRadius: 8, padding: "1px 5px" }}>
                  {history.length}
                </span>
              )}
            </button>
          ))}

          <div style={{ flex: 1 }} />
          {!isRendering && (
            <button onClick={handleCancel} style={{ background: "none", border: "none", color: C.muted, fontSize: 18, cursor: "pointer", padding: "0 4px" }}>✕</button>
          )}
        </div>

        {/* ── History tab ─────────────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            <HistoryPanel entries={history} loading={histLoading} onReload={loadHistory} onPreview={(f) => { setShowVideo(true); setOutputPath(f); }} />
          </div>
        )}

        {/* ── Configure tab (body) — scrollable ───────────────────────────────── */}
        <div style={{ flex: activeTab === "render" ? 1 : 0, overflow: activeTab === "render" ? "auto" : "hidden", height: activeTab === "render" ? undefined : 0, padding: activeTab === "render" ? "20px 20px 0" : 0 }}>

          {/* ①  Composition picker */}
          <Label>Composition</Label>
          {/* Format filter tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {(["all", "9:16", "1:1", "16:9"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormatFilter(f)}
                style={{
                  padding: "3px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                  border: `1px solid ${f === formatFilter ? C.accent : C.border}`,
                  background: f === formatFilter ? "rgba(0,112,243,0.15)" : C.panel,
                  color: f === formatFilter ? C.accent : C.muted,
                  fontWeight: f === formatFilter ? 600 : 400,
                }}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>

          {/* Comp list */}
          <div style={{
            maxHeight: 188,
            overflowY: "auto",
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            marginBottom: 18,
          }}>
            {filteredComps.map((c, i) => {
              const active = c.id === selectedId;
              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "9px 12px",
                    cursor: "pointer",
                    background: active ? "rgba(0,112,243,0.12)" : i % 2 === 0 ? C.panel : C.bg,
                    borderLeft: `3px solid ${active ? C.accent : "transparent"}`,
                    transition: "background 0.1s",
                  }}
                >
                  {/* Format badge */}
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4,
                    background: C.border, color: C.muted, flexShrink: 0,
                  }}>
                    {c.format}
                  </span>
                  {/* Label */}
                  <span style={{ fontSize: 12, color: active ? "#fff" : C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.label}
                  </span>
                  {/* Duration */}
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>
                    {formatSeconds(c.durationInFrames, c.fps)}
                  </span>
                  {/* Resolution */}
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0, minWidth: 76, textAlign: "right" }}>
                    {c.width}×{c.height}
                  </span>
                </div>
              );
            })}
            {filteredComps.length === 0 && (
              <div style={{ padding: 16, textAlign: "center", color: C.muted, fontSize: 12 }}>
                No compositions in this format.
              </div>
            )}
          </div>

          {/* ②  Quality presets */}
          <Label>Quality Preset</Label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
            {PRESETS.map((p) => {
              const active = p.id === presetId;
              return (
                <div
                  key={p.id}
                  onClick={() => setPresetId(p.id)}
                  style={{
                    border: `1.5px solid ${active ? p.color : C.border}`,
                    borderRadius: 8, padding: "10px 12px",
                    cursor: "pointer",
                    background: active ? `${p.color}22` : C.panel,
                    transition: "all 0.12s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: active ? "#fff" : C.text }}>{p.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: active ? p.color : C.muted, background: active ? `${p.color}33` : C.border, padding: "1px 5px", borderRadius: 3 }}>{p.tag}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{p.desc}</div>
                  <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                    {[`${p.scale}×`, `CRF ${p.crf}`, p.everyNthFrame > 1 ? `÷${p.everyNthFrame}` : null].filter(Boolean).map((t) => (
                      <span key={t} style={{ fontSize: 10, color: C.muted, background: C.inputBg, padding: "1px 5px", borderRadius: 3 }}>{t}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ③  Advanced options (collapsible) */}
          <button
            onClick={() => setShowAdv((v) => !v)}
            style={{
              width: "100%", textAlign: "left", background: C.panel, border: `1px solid ${C.border}`,
              borderRadius: 6, padding: "8px 12px", cursor: "pointer",
              color: C.muted, fontSize: 12, display: "flex", justifyContent: "space-between",
              marginBottom: showAdv ? 12 : 0,
            }}
          >
            <span>Advanced Options</span>
            <span style={{ transition: "transform 0.2s", transform: showAdv ? "rotate(180deg)" : "none" }}>▾</span>
          </button>

          {showAdv && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px 14px", marginBottom: 4, padding: "14px", background: C.panel, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div>
                <Label>Scale override</Label>
                <Input type="number" min="1" max="4" step="0.5" placeholder={String(preset.scale)} value={scaleOvr} onChange={(e) => setScaleOvr(e.target.value)} />
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>1 = original · 2 = 2× resolution</div>
              </div>
              <div>
                <Label>CRF</Label>
                <Input type="number" min="0" max="51" placeholder={String(preset.crf)} value={crfOvr} onChange={(e) => setCrfOvr(e.target.value)} />
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>0 = lossless · 51 = smallest</div>
              </div>
              <div>
                <Label>JPEG quality</Label>
                <Input type="number" min="1" max="100" placeholder={String(preset.jpegQuality)} value={jpegOvr} onChange={(e) => setJpegOvr(e.target.value)} />
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>1–100 (100 = best)</div>
              </div>
              <div>
                <Label>Codec</Label>
                <Select value={codecOvr || preset.codec} onChange={(e) => setCodecOvr(e.target.value)}>
                  <option value="h264">H.264 (MP4)</option>
                  <option value="h265">H.265 / HEVC</option>
                  <option value="vp9">VP9 (WebM)</option>
                  <option value="prores">ProRes (MOV)</option>
                </Select>
              </div>
              <div>
                <Label>Every N-th frame</Label>
                <Input type="number" min="1" max="10" placeholder={String(preset.everyNthFrame)} value={nthOvr} onChange={(e) => setNthOvr(e.target.value)} />
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>2 = half frames (2× faster draft)</div>
              </div>
              <div>
                <Label>Output filename</Label>
                <Input type="text" placeholder={`${selectedId}-${presetId}.mp4`} value={filenameOvr} onChange={(e) => setFilenameOvr(e.target.value)} />
                <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>Saved to /out/</div>
              </div>
              <div>
                <Label>Start frame</Label>
                <Input type="number" min="0" placeholder="0" value={startFrOvr} onChange={(e) => setStartFrOvr(e.target.value)} />
              </div>
              <div>
                <Label>End frame</Label>
                <Input type="number" min="0" placeholder={comp ? String(comp.durationInFrames - 1) : ""} value={endFrOvr} onChange={(e) => setEndFrOvr(e.target.value)} />
              </div>
            </div>
          )}

          {/* Progress section (shown while/after rendering) */}
          {jobId && (
            <div style={{ marginTop: 16, background: C.panel, borderRadius: 8, padding: 14, border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: renderDone ? C.green : renderFailed ? C.red : "#f59e0b" }}>
                  {renderDone ? "✓ Render complete" : renderFailed ? "✗ Render failed" : `Rendering… ${pct > 0 ? `${pct}%` : ""}`}
                </span>
                {status && (
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}>
                    {status.totalFrames > 0 ? `${status.frames} / ${status.totalFrames} frames` : `${status.elapsed}s elapsed`}
                  </span>
                )}
              </div>
              {!renderDone && !renderFailed && (
                <ProgressBar pct={pct} indeterminate={pct === 0} />
              )}
              {renderFailed && (
                <div style={{ fontSize: 11, color: C.red, marginTop: 6 }}>
                  Check the terminal for error details.
                </div>
              )}
              {renderDone && outputPath && (
                <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: 11, color: C.muted, flex: 1, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {outputPath}
                  </span>
                  <button
                    onClick={() => setShowVideo(true)}
                    style={{
                      padding: "5px 14px", borderRadius: 6, border: "none",
                      background: C.green, color: "#fff", fontSize: 12, fontWeight: 600,
                      cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    ▶ Watch Preview
                  </button>
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div style={{ marginTop: 12, padding: "8px 12px", background: "#450a0a", border: `1px solid ${C.red}`, borderRadius: 6, fontSize: 12, color: "#fca5a5" }}>
              {errorMsg}
            </div>
          )}

          {/* Padding at bottom of scroll area */}
          <div style={{ height: 20 }} />
        </div>

        {/* ── Footer — only shown on Configure tab ────────────────────────────── */}
        {activeTab === "render" && <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: C.panel,
          flexShrink: 0,
        }}>
          {/* Summary chips */}
          {comp && (
            <>
              <Chip label="Comp"    value={comp.label.split("—")[0].trim()} />
              <Chip label="Output"  value={outRes} />
              <Chip label="Duration" value={`${durText} (${totalFrames} frames)`} />
              <Chip label="Codec"   value={effectiveCodec.toUpperCase()} />
            </>
          )}

          <div style={{ flex: 1 }} />

          {/* Cancel */}
          <button
            onClick={handleCancel}
            disabled={isRendering}
            style={{
              padding: "7px 18px", borderRadius: 6, border: `1px solid ${C.border}`,
              background: "transparent", color: C.muted, fontSize: 13,
              cursor: isRendering ? "not-allowed" : "pointer", opacity: isRendering ? 0.4 : 1,
            }}
          >
            {renderDone ? "Close" : "Cancel"}
          </button>

          {/* Render / Re-render button */}
          {!renderDone && (
            <button
              onClick={handleRender}
              disabled={!comp || isRendering}
              style={{
                padding: "7px 22px", borderRadius: 6, border: "none",
                background: (!comp || isRendering) ? "#1e3a5f" : C.accent,
                color: (!comp || isRendering) ? "#4a7dbd" : "#fff",
                fontSize: 13, fontWeight: 600,
                cursor: (!comp || isRendering) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {isRendering ? (
                <>
                  <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", border: "2px solid #4a7dbd", borderTopColor: "#93c5fd", animation: "spin 0.7s linear infinite" }} />
                  Rendering…
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </>
              ) : "▶ Start Render"}
            </button>
          )}
          {renderDone && (
            <button
              onClick={() => { setJobId(null); setStatus(null); setRenderDone(false); setRenderFailed(false); }}
              style={{ padding: "7px 22px", borderRadius: 6, border: `1px solid ${C.border}`, background: "transparent", color: C.text, fontSize: 13, cursor: "pointer" }}
            >
              ↻ Render Again
            </button>
          )}
        </div>}
      </div>

      {showVideo && outputPath && (
        <VideoModal src={previewUrl(outputPath)} onClose={() => setShowVideo(false)} />
      )}
    </>
  );
};

// ─── Tiny summary chip ────────────────────────────────────────────────────────
const Chip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
    <span style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
    <span style={{ fontSize: 12, color: C.text }}>{value}</span>
  </div>
);

// ─── History panel ────────────────────────────────────────────────────────────
function fmtDuration(sec: number): string {
  if (sec < 60)  return `${sec}s`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ${sec % 60}s`;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m}m`;
}

function fmtBytes(bytes: number | null): string {
  if (!bytes) return "–";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    + " " + d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

const HistoryPanel: React.FC<{
  entries:   RenderHistoryEntry[];
  loading:   boolean;
  onReload:  () => void;
  onPreview: (file: string) => void;
}> = ({ entries, loading, onReload, onPreview }) => {
  if (loading) return (
    <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>Loading history…</div>
  );
  if (entries.length === 0) return (
    <div style={{ textAlign: "center", padding: 40, color: C.muted, fontSize: 13 }}>
      No renders yet. Complete a render to see timing and settings here.
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: C.muted }}>{entries.length} render{entries.length !== 1 ? "s" : ""} logged</span>
        <button onClick={onReload} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, fontSize: 11, padding: "3px 8px", cursor: "pointer" }}>↻ Refresh</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map((e) => {
          const comp = REGISTRY.find((c) => c.id === e.compId);
          const scale = e.settings.scale ?? 1;
          return (
            <div key={e.id} style={{
              background: C.panel, border: `1px solid ${e.success ? C.border : "#3f1010"}`,
              borderLeft: `3px solid ${e.success ? C.green : C.red}`,
              borderRadius: 8, padding: "10px 14px",
            }}>
              {/* Row 1: comp + date + duration */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.text, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {comp?.label.split("—")[0].trim() ?? e.compId}
                </span>
                <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{fmtDate(e.startedAt)}</span>
                <span style={{
                  fontSize: 11, fontWeight: 700, flexShrink: 0,
                  color: e.success ? C.green : C.red,
                }}>
                  {e.success ? `✓ ${fmtDuration(e.durationSec)}` : `✗ ${fmtDuration(e.durationSec)}`}
                </span>
              </div>

              {/* Row 2: settings chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                {[
                  { label: "preset",   val: e.settings.preset },
                  { label: "scale",    val: `${scale}×` },
                  { label: "CRF",      val: String(e.settings.crf) },
                  { label: "codec",    val: e.settings.codec.toUpperCase() },
                  { label: "÷frames",  val: e.settings.everyNthFrame > 1 ? `every ${e.settings.everyNthFrame}` : "all frames" },
                  ...(e.settings.startFrame != null ? [{ label: "range", val: `${e.settings.startFrame}–${e.settings.endFrame ?? "end"}` }] : []),
                ].map(({ label, val }) => (
                  <span key={label} style={{ fontSize: 10, background: C.inputBg, color: C.muted, borderRadius: 4, padding: "2px 6px" }}>
                    <span style={{ color: "#52525b" }}>{label} </span>{val}
                  </span>
                ))}
              </div>

              {/* Row 3: performance + output */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {e.framesPerSec != null && (
                  <span style={{ fontSize: 11, color: C.muted }}>
                    ⚡ <span style={{ color: C.text, fontWeight: 600 }}>{e.framesPerSec}</span> fps render speed
                  </span>
                )}
                {e.totalFrames > 0 && (
                  <span style={{ fontSize: 11, color: C.muted }}>
                    {e.totalFrames} frames
                  </span>
                )}
                {e.outputSizeBytes != null && (
                  <span style={{ fontSize: 11, color: C.muted }}>
                    {fmtBytes(e.outputSizeBytes)}
                  </span>
                )}
                <span style={{ fontSize: 11, color: "#3f3f46", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                  {e.outputFile}
                </span>
                {e.success && (
                  <button
                    onClick={() => onPreview(e.outputFile)}
                    style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, fontSize: 11, padding: "2px 8px", cursor: "pointer", flexShrink: 0 }}
                  >
                    ▶ Preview
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
