import React, { useState } from "react";
import { useStudio }       from "../store/useStudio";
import { getComp }         from "../registry";
import { buildCueSheet, downloadText } from "../utils/exportCues";
import { RenderDialog }       from "./RenderDialog";
import { CameraPrototyper }  from "./CameraPrototyper";
import { AnalysisPanel }     from "./AnalysisPanel";
import { ComparePanel }      from "./ComparePanel";
import { ImportPanel }       from "./ImportPanel";
import { FeatureLibraryPanel } from "./FeatureLibraryPanel";
import { AssetPreviewPanel }  from "./AssetPreviewPanel";
import { CueEditorPanel }     from "./CueEditorPanel";

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

  const [cueFlash,        setCueFlash]        = useState(false);
  const [showDialog,      setShowDialog]      = useState(false);
  const [showCamTool,     setShowCamTool]     = useState(false);
  const [showAnalysis,    setShowAnalysis]    = useState(false);
  const [showCompare,     setShowCompare]     = useState(false);
  const [showImport,      setShowImport]      = useState(false);
  const [showLibrary,     setShowLibrary]     = useState(false);
  const [showAssets,      setShowAssets]      = useState(false);
  const [showCueEditor,  setShowCueEditor]  = useState(false);

  const fps = comp?.fps ?? 30;
  const sec = (frame / fps).toFixed(2);

  const handleExportCues = () => {
    if (!comp) return;
    const text = buildCueSheet(comp);
    downloadText(`${comp.id}-cues.txt`, text);
    setCueFlash(true);
    setTimeout(() => setCueFlash(false), 2000);
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

        {/* Feature library */}
        <Btn
          onClick={() => setShowLibrary(true)}
          title="Browse the category taxonomy — subcategories, parameter ranges, techniques, and composition guidelines"
          style={{ borderColor: "#1e3a5f", color: "#38bdf8" }}
        >
          📚 Library
        </Btn>

        {/* Export Cues */}
        {comp?.cues && comp.cues.length > 0 && (
          <>
            <Btn
              onClick={() => setShowCueEditor(true)}
              title={`View and filter ${comp.cues.length} animation cue events`}
              style={{ borderColor: "#78350f", color: "#f97316" }}
            >
              ♩ Cues ({comp.cues.length})
            </Btn>
            <Btn
              onClick={handleExportCues}
              title={`Export ${comp.cues.length} animation cue events`}
              style={{ borderColor: cueFlash ? "#8b5cf6" : undefined, color: cueFlash ? "#a78bfa" : undefined }}
            >
              {cueFlash ? "✓ Saved" : "↓ Export"}
            </Btn>
          </>
        )}

        {/* Camera prototyper */}
        <Btn
          onClick={() => setShowCamTool(true)}
          title="Interactive camera path builder — drag positions, copy generated CameraRig code"
          style={{ borderColor: "#312e81", color: "#818cf8" }}
        >
          🎥 Camera
        </Btn>

        {/* Analyse reference ad */}
        <Btn
          onClick={() => setShowAnalysis(true)}
          title="Analyse a reference MP4 ad with Gemini 1.5 Pro — results appended to LEARNINGS.md"
          style={{ borderColor: "#3b1f5e", color: "#a78bfa" }}
        >
          🔬 Analyse Ad
        </Btn>

        {/* Import AE template */}
        <Btn
          onClick={() => setShowImport(true)}
          title="Import a Lottie JSON exported from After Effects — extract animation parameters and generate a Remotion composition"
          style={{ borderColor: "#052e16", color: "#059669" }}
        >
          Import AE
        </Btn>

        {/* Compare reference vs render */}
        <Btn
          onClick={() => setShowCompare(true)}
          title="Compare your render against a reference ad — Gemini scores the visual diff and outputs prioritised fixes"
          style={{ borderColor: "#2d2000", color: "#d97706" }}
        >
          ⚖ Compare
        </Btn>

        {/* Asset preview panel */}
        <Btn
          onClick={() => setShowAssets(true)}
          title="Browse SVG assets and AI-generated reference images — compare side-by-side"
          style={{ borderColor: "#065f46", color: "#10b981" }}
        >
          🎨 Assets
        </Btn>

        {/* Export — opens full render dialog with quality, codec, audio options */}
        <Btn accent onClick={() => setShowDialog(true)}>
          ▶ Export
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

      {/* Analysis panel */}
      {showAnalysis && (
        <AnalysisPanel onClose={() => setShowAnalysis(false)} />
      )}

      {/* Compare panel */}
      {showCompare && (
        <ComparePanel onClose={() => setShowCompare(false)} />
      )}

      {/* Import panel */}
      {showImport && (
        <ImportPanel onClose={() => setShowImport(false)} />
      )}

      {/* Feature library */}
      {showLibrary && (
        <FeatureLibraryPanel onClose={() => setShowLibrary(false)} />
      )}

      {/* Asset preview */}
      {showAssets && (
        <AssetPreviewPanel onClose={() => setShowAssets(false)} />
      )}

      {/* Cue editor */}
      {showCueEditor && (
        <CueEditorPanel onClose={() => setShowCueEditor(false)} />
      )}
    </>
  );
};
