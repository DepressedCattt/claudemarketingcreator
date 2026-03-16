import React, { useState } from "react";
import { useStudio }       from "../store/useStudio";
import { getComp }         from "../registry";
import { renderComp }      from "../api";

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
      transition:   "opacity 0.1s",
      ...style,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
    onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    {...rest}
  />
);

export const Header: React.FC = () => {
  const { activeCompId, frame, playing, serverOnline } = useStudio();
  const comp = getComp(activeCompId);

  const [rendering,   setRendering]   = useState(false);
  const [renderMsg,   setRenderMsg]   = useState("");

  const fps = comp?.fps ?? 30;
  const sec = (frame / fps).toFixed(2);

  const handleRender = async () => {
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
    <div style={{
      height:         44,
      background:     "#191919",
      borderBottom:   "1px solid #2a2a2a",
      display:        "flex",
      alignItems:     "center",
      padding:        "0 16px",
      gap:            16,
      userSelect:     "none",
    }}>
      {/* Logo */}
      <div style={{
        fontSize:      13,
        fontWeight:    700,
        color:         "#0070f3",
        letterSpacing: "0.05em",
        marginRight:   4,
      }}>
        ◈ Ad Studio
      </div>

      <div style={{ width: 1, height: 20, background: "#333" }} />

      {/* Active comp name */}
      {comp && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#888", fontSize: 11 }}>
            {comp.format}
          </span>
          <span style={{ color: "#ddd", fontSize: 12, fontWeight: 500 }}>
            {comp.label}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Render message */}
      {renderMsg && (
        <span style={{ fontSize: 11, color: rendering ? "#f59e0b" : "#10b981" }}>
          {renderMsg}
        </span>
      )}

      {/* Server status */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: serverOnline ? "#10b981" : "#555",
        }} />
        <span style={{ fontSize: 11, color: serverOnline ? "#10b981" : "#666" }}>
          {serverOnline ? "Server" : "No server"}
        </span>
      </div>

      <div style={{ width: 1, height: 20, background: "#333" }} />

      {/* Timecode */}
      <div style={{
        fontFamily:  "monospace",
        fontSize:    13,
        color:       playing ? "#0ea5e9" : "#888",
        minWidth:    88,
        textAlign:   "right",
      }}>
        {sec}s / f{frame}
      </div>

      <div style={{ width: 1, height: 20, background: "#333" }} />

      {/* Render button */}
      <Btn accent onClick={handleRender} disabled={rendering || !serverOnline}>
        {rendering ? "⏳ Rendering…" : "▶ Export MP4"}
      </Btn>
    </div>
  );
};
