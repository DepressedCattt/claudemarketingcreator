import React, { useState } from "react";
import { useStudio }       from "../store/useStudio";
import { getComp }         from "../registry";
import { renderComp }      from "../api";
import { buildCueSheet, downloadText } from "../utils/exportCues";
import { RenderDialog }       from "./RenderDialog";
import { CameraPrototyper }  from "./CameraPrototyper";

// ─── Shared button ────────────────────────────────────────────────────────────
const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { accent?: boolean }> = ({
  accent, style, ...rest
}) => (
  <button
    style={{
      height:       28,
      padding:      "0 12px",
      borderRadius: 4,
      border:       accent ? "none" : "1px solid #333",
      background:   accent ? "#0070f3" : "#222",
      color:        accent ? "#fff"    : "#ccc",
      fontSize:     12,
      fontWeight:   accent ? 600 : 400,
      display:      "flex",
      alignItems:   "center",
      gap:          6,
      cursor:       rest.disabled ? "not-allowed" : "pointer",
      opacity:      rest.disabled ? 0.5 : 1,
      transition:   "opacity 0.1s",
      ...style,
    }}
    onMouseEnter={(e) => { if (!rest.disabled) e.currentTarget.style.opacity = "0.82"; }}
    onMouseLeave={(e) => { if (!rest.disabled) e.currentTarget.style.opacity = "1"; }}
    {...rest}
  />
);

// ─── Header ───────────────────────────────────────────────────────────────────
export const Header: React.FC = () => {
  const { activeCompId, frame, playing, serverOnline } = useStudio();
  const comp = getComp(activeCompId);

  const [rendering,       setRendering]       = useState(false);
  const [renderMsg,       setRenderMsg]       = useState("");
  const [cueFlash,        setCueFlash]        = useState(false);
  const [showDialog,      setShowDialog]      = useState(false);
  const [showCamTool,     setShowCamTool]     = useState(false);

  const fps = comp?.fps ?? 30;
  const sec = (frame / fps).toFixed(2);

  const handleExportCues = () => {
    if (!comp) return;
    const text = buildCueSheet(comp);
    downloadText(`${comp.id}-cues.txt`, text);
    setCueFlash(true);
    setTimeout(() => setCueFlash(false), 2000);
  };

  // Quick "Export MP4" — normal quality, no dialog
  const handleQuickExport = async () => {
    if (!comp) return;
    setRendering(true);
    setRenderMsg("Starting…");
    try {
      const res = await renderComp(comp.id, `out/${comp.id}.mp4`);
      setRenderMsg(res.message);
    } catch {
      setRenderMsg("Render failed — check terminal");
    }
    setTimeout(() => { setRendering(false); setRenderMsg(""); }, 5000);
  };

  return (
    <>
      <div style={{
        height:         44,
        background:     "#191919",
        borderBottom:   "1px solid #2a2a2a",
        display:        "flex",
        alignItems:     "center",
        padding:        "0 16px",
        gap:            12,
        userSelect:     "none",
        position:       "relative",
      }}>
        {/* Logo */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0070f3", letterSpacing: "0.05em", marginRight: 4 }}>
          ◈ Ad Studio
        </div>

        <div style={{ width: 1, height: 20, background: "#333" }} />

        {/* Active comp */}
        {comp && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#888", fontSize: 11 }}>{comp.format}</span>
            <span style={{ color: "#ddd", fontSize: 12, fontWeight: 500 }}>{comp.label}</span>
          </div>
        )}

        <div style={{ flex: 1 }} />

        {/* Quick render feedback */}
        {renderMsg && (
          <span style={{ fontSize: 11, color: rendering ? "#f59e0b" : "#10b981" }}>
            {renderMsg}
          </span>
        )}

        {/* Server status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: serverOnline ? "#10b981" : "#555" }} />
          <span style={{ fontSize: 11, color: serverOnline ? "#10b981" : "#666" }}>
            {serverOnline ? "Server" : "No server"}
          </span>
        </div>

        <div style={{ width: 1, height: 20, background: "#333" }} />

        {/* Timecode */}
        <div style={{ fontFamily: "monospace", fontSize: 13, color: playing ? "#0ea5e9" : "#888", minWidth: 88, textAlign: "right" }}>
          {sec}s / f{frame}
        </div>

        <div style={{ width: 1, height: 20, background: "#333" }} />

        {/* Export Cues */}
        {comp?.cues && comp.cues.length > 0 && (
          <Btn
            onClick={handleExportCues}
            title={`Export ${comp.cues.length} animation cue events`}
            style={{ borderColor: cueFlash ? "#8b5cf6" : undefined, color: cueFlash ? "#a78bfa" : undefined }}
          >
            {cueFlash ? "✓ Saved" : "♩ Export Cues"}
          </Btn>
        )}

        {/* Camera prototyper */}
        <Btn
          onClick={() => setShowCamTool(true)}
          title="Interactive camera path builder — drag positions, copy generated CameraRig code"
          style={{ borderColor: "#312e81", color: "#818cf8" }}
        >
          🎥 Camera
        </Btn>

        {/* Render dialog button — always openable; server check is inside the dialog */}
        <Btn
          onClick={() => setShowDialog(true)}
          title="Open render settings — choose composition, quality preset, codec and more"
          style={{ borderColor: "#334155", color: "#94a3b8" }}
        >
          ⬆ Render…
        </Btn>

        {/* Quick export */}
        <Btn accent onClick={handleQuickExport} disabled={rendering || !serverOnline}>
          {rendering ? "⏳ Exporting…" : "▶ Export MP4"}
        </Btn>
      </div>

      {/* Full render dialog */}
      {showDialog && (
        <RenderDialog
          initialCompId={activeCompId ?? undefined}
          onClose={() => setShowDialog(false)}
        />
      )}

      {/* Camera prototyper */}
      {showCamTool && (
        <CameraPrototyper onClose={() => setShowCamTool(false)} />
      )}
    </>
  );
};
