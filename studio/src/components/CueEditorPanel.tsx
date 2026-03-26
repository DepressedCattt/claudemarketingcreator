import React, { useState, useMemo } from "react";
import { useStudio } from "../store/useStudio";
import { getComp }   from "../registry";
import type { CueEvent, CueEventType, CueIntensity } from "../types";

const CUE_TYPES: CueEventType[] = [
  "SCENE_CUT", "TEXT_REVEAL", "TEXT_IMPACT", "HERO_ENTRY",
  "OBJECT_LAND", "WIPE", "STAT_BUILD", "CTA_REVEAL", "AMBIENT", "BEAT_LOCK",
];

const CUE_COLORS: Record<string, string> = {
  SCENE_CUT:  "#ef4444",
  TEXT_REVEAL: "#8b5cf6",
  TEXT_IMPACT: "#f97316",
  HERO_ENTRY:  "#0ea5e9",
  OBJECT_LAND: "#10b981",
  WIPE:        "#ec4899",
  STAT_BUILD:  "#eab308",
  CTA_REVEAL:  "#06b6d4",
  AMBIENT:     "#6366f1",
  BEAT_LOCK:   "#a855f7",
};

const INT_COLORS: Record<string, string> = {
  hard:   "#ef4444",
  medium: "#f59e0b",
  soft:   "#6ee7b7",
};

const PRIORITY: Record<string, number> = {
  SCENE_CUT: 10, HERO_ENTRY: 9, TEXT_IMPACT: 8, CTA_REVEAL: 7,
  STAT_BUILD: 6, WIPE: 5, TEXT_REVEAL: 4, OBJECT_LAND: 3,
  BEAT_LOCK: 5, AMBIENT: 1,
};

// ── Modal overlay (reusable) ────────────────────────────────────────────────
const Overlay: React.FC<{
  title: string;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, width = 640, onClose, children }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        width, maxWidth: "92vw", maxHeight: "85vh",
        background: "#1a1a1a", border: "1px solid #333",
        borderRadius: 10, display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", padding: "12px 16px",
        borderBottom: "1px solid #2a2a2a",
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", flex: 1 }}>{title}</span>
        <button
          onClick={onClose}
          style={{
            background: "transparent", border: "none",
            color: "#555", fontSize: 18, cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
      {/* Body */}
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {children}
      </div>
    </div>
  </div>
);

// ── Cue row ─────────────────────────────────────────────────────────────────
const CueRow: React.FC<{
  cue: CueEvent;
  fps: number;
  idx: number;
  onSeek: (f: number) => void;
}> = ({ cue, fps, idx, onSeek }) => {
  const sec = (cue.frame / fps).toFixed(2);
  const catColor = CUE_COLORS[cue.type] ?? "#888";
  const intColor = INT_COLORS[cue.intensity] ?? "#888";
  const priority = PRIORITY[cue.type] ?? 3;

  return (
    <div
      onClick={() => onSeek(cue.frame)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "5px 8px", borderRadius: 4,
        background: "#181818", border: "1px solid #262626",
        cursor: "pointer", marginBottom: 2,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#222")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "#181818")}
    >
      {/* Index */}
      <span style={{
        fontSize: 9, color: "#444", fontFamily: "monospace",
        width: 24, textAlign: "right", flexShrink: 0,
      }}>
        {idx + 1}
      </span>

      {/* Frame / time */}
      <div style={{ width: 70, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#ccc", fontFamily: "monospace" }}>
          f{cue.frame}
        </div>
        <div style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>
          {sec}s
        </div>
      </div>

      {/* Type badge */}
      <span style={{
        fontSize: 8, fontWeight: 700, color: catColor,
        background: `${catColor}18`, border: `1px solid ${catColor}33`,
        borderRadius: 3, padding: "1px 5px", letterSpacing: "0.05em",
        flexShrink: 0,
      }}>
        {cue.type}
      </span>

      {/* Intensity badge */}
      <span style={{
        fontSize: 8, fontWeight: 600, color: intColor,
        background: `${intColor}18`, border: `1px solid ${intColor}33`,
        borderRadius: 3, padding: "1px 4px", flexShrink: 0,
      }}>
        {cue.intensity}
      </span>

      {/* Priority */}
      <span style={{
        fontSize: 9, color: priority >= 8 ? "#ef4444" : priority >= 5 ? "#f59e0b" : "#555",
        fontWeight: 600, width: 16, textAlign: "center", flexShrink: 0,
      }}>
        P{priority}
      </span>

      {/* Label */}
      <span style={{
        flex: 1, fontSize: 11, color: "#aaa",
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {cue.label}
      </span>

      {/* Notes */}
      {cue.notes && (
        <span style={{
          fontSize: 9, color: "#555", fontStyle: "italic",
          maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}>
          {cue.notes}
        </span>
      )}
    </div>
  );
};

// ── Main panel ──────────────────────────────────────────────────────────────
export const CueEditorPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { activeCompId, setFrame } = useStudio();
  const comp = getComp(activeCompId);
  const cues = comp?.cues ?? [];
  const fps  = comp?.fps ?? 30;

  const [filterType, setFilterType]         = useState<string>("all");
  const [filterIntensity, setFilterIntensity] = useState<string>("all");
  const [densityPreset, setDensityPreset]   = useState<string>("normal");

  const densityThresholds: Record<string, number> = {
    minimal: 9, normal: 6, detailed: 4, maximal: 1,
  };

  const minPriority = densityThresholds[densityPreset] ?? 6;

  const filtered = useMemo(() => {
    return cues
      .filter((c) => filterType === "all" || c.type === filterType)
      .filter((c) => filterIntensity === "all" || c.intensity === filterIntensity)
      .filter((c) => (PRIORITY[c.type] ?? 3) >= minPriority)
      .sort((a, b) => a.frame - b.frame);
  }, [cues, filterType, filterIntensity, minPriority]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of cues) {
      counts[c.type] = (counts[c.type] || 0) + 1;
    }
    return counts;
  }, [cues]);

  if (!comp || cues.length === 0) {
    return (
      <Overlay title="Cue Editor" onClose={onClose}>
        <div style={{ textAlign: "center", padding: 32, color: "#555" }}>
          <div style={{ fontSize: 14, marginBottom: 8 }}>No cues defined</div>
          <div style={{ fontSize: 11 }}>
            Add a <code>cues: CueEvent[]</code> export to this composition,
            then register it in <code>registry.ts</code>.
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay title={`Cue Editor — ${comp.label} (${cues.length} cues)`} width={760} onClose={onClose}>
      {/* Toolbar */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12,
        alignItems: "center",
      }}>
        {/* Density */}
        <span style={{ fontSize: 10, color: "#666", marginRight: 2 }}>Density:</span>
        {(["minimal", "normal", "detailed", "maximal"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setDensityPreset(d)}
            style={{
              background: densityPreset === d ? "#333" : "transparent",
              border: `1px solid ${densityPreset === d ? "#555" : "#2a2a2a"}`,
              borderRadius: 3, color: densityPreset === d ? "#fff" : "#555",
              fontSize: 9, padding: "2px 6px", cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {d}
          </button>
        ))}

        <div style={{ width: 1, height: 16, background: "#333", margin: "0 4px" }} />

        {/* Intensity filter */}
        <span style={{ fontSize: 10, color: "#666", marginRight: 2 }}>Intensity:</span>
        {(["all", "hard", "medium", "soft"] as const).map((i) => (
          <button
            key={i}
            onClick={() => setFilterIntensity(i)}
            style={{
              background: filterIntensity === i ? (i === "all" ? "#333" : `${INT_COLORS[i]}22`) : "transparent",
              border: `1px solid ${filterIntensity === i ? (INT_COLORS[i] || "#555") : "#2a2a2a"}`,
              borderRadius: 3,
              color: filterIntensity === i ? (INT_COLORS[i] || "#fff") : "#555",
              fontSize: 9, padding: "2px 6px", cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {i}
          </button>
        ))}
      </div>

      {/* Type filter chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 10 }}>
        <button
          onClick={() => setFilterType("all")}
          style={{
            background: filterType === "all" ? "#333" : "transparent",
            border: `1px solid ${filterType === "all" ? "#555" : "#2a2a2a"}`,
            borderRadius: 3, color: filterType === "all" ? "#fff" : "#555",
            fontSize: 9, padding: "2px 6px", cursor: "pointer",
          }}
        >
          ALL ({cues.length})
        </button>
        {CUE_TYPES.map((t) => {
          const count = typeCounts[t] || 0;
          if (count === 0) return null;
          const c = CUE_COLORS[t];
          return (
            <button
              key={t}
              onClick={() => setFilterType(filterType === t ? "all" : t)}
              style={{
                background: filterType === t ? `${c}22` : "transparent",
                border: `1px solid ${filterType === t ? c : "#2a2a2a"}`,
                borderRadius: 3,
                color: filterType === t ? c : "#555",
                fontSize: 9, padding: "2px 5px", cursor: "pointer",
              }}
            >
              {t.replace("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{
        display: "flex", gap: 12, marginBottom: 10,
        padding: "6px 10px", background: "#111", borderRadius: 4,
        border: "1px solid #262626",
      }}>
        <span style={{ fontSize: 10, color: "#888" }}>
          Showing <strong style={{ color: "#fff" }}>{filtered.length}</strong> / {cues.length} cues
        </span>
        <span style={{ fontSize: 10, color: "#555" }}>
          Priority &ge; {minPriority}
        </span>
        <span style={{ fontSize: 10, color: "#555" }}>
          Duration: {(comp.durationInFrames / fps).toFixed(1)}s
        </span>
        <span style={{ fontSize: 10, color: "#555" }}>
          Density: ~{(filtered.length / (comp.durationInFrames / fps)).toFixed(1)} cues/sec
        </span>
      </div>

      {/* Cue list */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {filtered.map((cue, i) => (
          <CueRow
            key={`${cue.frame}-${cue.type}-${i}`}
            cue={cue}
            fps={fps}
            idx={i}
            onSeek={(f) => setFrame(f)}
          />
        ))}
      </div>
    </Overlay>
  );
};
