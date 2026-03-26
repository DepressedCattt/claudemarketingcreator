import React, { useState, useEffect } from "react";
import type { CueEvent, CueEventType, CueIntensity } from "../types";
import { buildElevenLabsPrompt, CUE_COLORS } from "../utils/sfxPromptBuilder";

const CUE_TYPES: CueEventType[] = [
  "SCENE_CUT", "TEXT_REVEAL", "TEXT_IMPACT", "HERO_ENTRY",
  "OBJECT_LAND", "WIPE", "BEAT_LOCK", "STAT_BUILD",
  "CTA_REVEAL", "AMBIENT",
];

const CUE_INTENSITIES: CueIntensity[] = ["hard", "medium", "soft"];

const fieldLabel: React.CSSProperties = {
  fontSize: 10, color: "#888", fontWeight: 500,
  letterSpacing: "0.04em", marginBottom: 3,
};

const fieldInput: React.CSSProperties = {
  width: "100%", height: 26, background: "#222",
  border: "1px solid #383838", borderRadius: 3,
  color: "#ddd", fontSize: 11, fontFamily: "monospace",
  padding: "0 6px", boxSizing: "border-box",
};

export const CueDetailPopup: React.FC<{
  cue:      CueEvent;
  fps:      number;
  profile?: string;
  onSave:   (updated: CueEvent) => void;
  onDelete: (id: string) => void;
  onClose:  () => void;
}> = ({ cue, fps, profile, onSave, onDelete, onClose }) => {
  const [local, setLocal] = useState<CueEvent>({ ...cue });

  useEffect(() => { setLocal({ ...cue }); }, [cue]);

  const patch = (p: Partial<CueEvent>) => {
    const next = { ...local, ...p } as CueEvent;
    setLocal(next);
    onSave(next);
  };

  const c = CUE_COLORS[local.type] ?? "#888";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position:    "fixed",
        top:         "50%",
        left:        "50%",
        transform:   "translate(-50%, -50%)",
        width:       360,
        background:  "#1a1a1a",
        border:      `1px solid ${c}55`,
        borderRadius: 8,
        zIndex:      1000,
        boxShadow:   `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${c}22`,
        padding:     16,
        display:     "flex",
        flexDirection: "column",
        gap:         10,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: c, letterSpacing: "0.06em" }}>
          CUE EDITOR
        </span>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", color: "#666",
            fontSize: 16, cursor: "pointer", padding: "0 4px",
          }}
        >&times;</button>
      </div>

      {/* Type + Intensity */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 2 }}>
          <div style={fieldLabel}>Type</div>
          <select
            value={local.type}
            onChange={(e) => patch({ type: e.target.value as CueEventType })}
            style={{ ...fieldInput, cursor: "pointer" }}
          >
            {CUE_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={fieldLabel}>Intensity</div>
          <select
            value={local.intensity}
            onChange={(e) => patch({ intensity: e.target.value as CueIntensity })}
            style={{ ...fieldInput, cursor: "pointer" }}
          >
            {CUE_INTENSITIES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Label */}
      <div>
        <div style={fieldLabel}>Label</div>
        <input
          value={local.label}
          onChange={(e) => patch({ label: e.target.value })}
          style={fieldInput}
          placeholder="Short label"
        />
      </div>

      {/* Frame + Duration */}
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <div style={fieldLabel}>Start Frame</div>
          <input
            type="number" min={0}
            value={local.frame}
            onChange={(e) => patch({ frame: Math.max(0, Number(e.target.value) || 0) })}
            style={fieldInput}
          />
          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
            {(local.frame / fps).toFixed(2)}s
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={fieldLabel}>Duration (frames)</div>
          <input
            type="number" min={1}
            value={local.duration}
            onChange={(e) => patch({ duration: Math.max(1, Number(e.target.value) || 1) })}
            style={fieldInput}
          />
          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>
            {(local.duration / fps).toFixed(2)}s
          </div>
        </div>
      </div>

      {/* SFX Description */}
      <div>
        <div style={fieldLabel}>SFX Description</div>
        <input
          value={local.sfxDescription ?? ""}
          onChange={(e) => patch({ sfxDescription: e.target.value || undefined })}
          style={fieldInput}
          placeholder="e.g. metallic sweep with reverb tail"
        />
      </div>

      {/* ElevenLabs Prompt */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={fieldLabel}>ElevenLabs Prompt</div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => {
                const generated = buildElevenLabsPrompt(local, fps, profile);
                if (generated) patch({ elevenLabsPrompt: generated });
              }}
              title="Auto-generate from SFX description"
              style={{
                background: "#1e293b", border: "1px solid #334155",
                borderRadius: 3, color: "#94a3b8", fontSize: 9,
                padding: "1px 6px", cursor: "pointer",
              }}
            >
              Generate
            </button>
            <button
              onClick={() => {
                const text = local.elevenLabsPrompt;
                if (text) navigator.clipboard.writeText(text);
              }}
              title="Copy to clipboard"
              style={{
                background: "#14532d", border: "1px solid #22c55e",
                borderRadius: 3, color: "#4ade80", fontSize: 9,
                padding: "1px 6px", cursor: "pointer",
              }}
            >
              Copy
            </button>
          </div>
        </div>
        <textarea
          value={local.elevenLabsPrompt ?? ""}
          onChange={(e) => patch({ elevenLabsPrompt: e.target.value || undefined })}
          rows={2}
          style={{
            ...fieldInput,
            height: "auto", resize: "vertical",
            fontFamily: "inherit", padding: "4px 6px",
            marginTop: 3,
          }}
          placeholder="Click Generate or write your own ElevenLabs prompt"
        />
      </div>

      {/* Notes */}
      <div>
        <div style={fieldLabel}>Notes</div>
        <textarea
          value={local.notes ?? ""}
          onChange={(e) => patch({ notes: e.target.value || undefined })}
          rows={2}
          style={{
            ...fieldInput,
            height: "auto", resize: "vertical",
            fontFamily: "inherit", padding: "4px 6px",
          }}
          placeholder="Optional notes for sound designer"
        />
      </div>

      {/* Delete */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
        <button
          onClick={() => onDelete(local.id)}
          style={{
            background: "#450a0a", border: "1px solid #ef4444",
            borderRadius: 3, color: "#f87171", fontSize: 10,
            padding: "4px 12px", cursor: "pointer",
          }}
        >
          Delete Cue
        </button>
      </div>
    </div>
  );
};

/** Backdrop overlay for the popup */
export const CuePopupBackdrop: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.4)",
      zIndex: 999,
    }}
  />
);
