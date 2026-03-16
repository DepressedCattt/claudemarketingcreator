import React, { useCallback, useState } from "react";
import { useStudio }                    from "../store/useStudio";
import { getComp }                      from "../registry";
import { saveAudioTracks }              from "../api";
import type { AudioTrack }              from "../types";

// ─── Reusable field row ───────────────────────────────────────────────────────
const Field: React.FC<{
  label:    string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <label style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
      {label}
    </label>
    {children}
  </div>
);

const NumInput: React.FC<{
  value:    number;
  min?:     number;
  max?:     number;
  step?:    number;
  onChange: (v: number) => void;
}> = ({ value, min, max, step = 1, onChange }) => (
  <input
    type="number"
    value={value}
    min={min}
    max={max}
    step={step}
    onChange={(e) => onChange(Number(e.target.value))}
    style={{
      background:   "#1a1a1a",
      border:       "1px solid #333",
      borderRadius: 4,
      color:        "#ddd",
      fontSize:     12,
      fontFamily:   "monospace",
      padding:      "5px 8px",
      width:        "100%",
    }}
  />
);

const Divider: React.FC<{ label?: string }> = ({ label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
    {label && <span style={{ fontSize: 10, color: "#444", whiteSpace: "nowrap" }}>{label}</span>}
    <div style={{ flex: 1, height: 1, background: "#222" }} />
  </div>
);

// ─── Composition info section ─────────────────────────────────────────────────
const CompInfo: React.FC = () => {
  const { activeCompId } = useStudio();
  const comp = getComp(activeCompId);
  if (!comp) return null;

  const durationSec = (comp.durationInFrames / comp.fps).toFixed(2);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#ccc" }}>{comp.label}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
        {[
          ["ID",       comp.id],
          ["Format",   comp.format],
          ["Size",     `${comp.width}×${comp.height}`],
          ["FPS",      String(comp.fps)],
          ["Frames",   String(comp.durationInFrames)],
          ["Duration", `${durationSec}s`],
        ].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</div>
            <div style={{ fontSize: 11, color: "#bbb", fontFamily: "monospace", marginTop: 2 }}>{v}</div>
          </div>
        ))}
      </div>
      {comp.sequences && (
        <div>
          <div style={{ fontSize: 9, color: "#444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Sequences</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {comp.sequences.map((s) => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: "#888", flex: 1 }}>{s.label}</span>
                <span style={{ fontSize: 10, color: "#444", fontFamily: "monospace" }}>
                  f{s.from}–{s.from + s.durationInFrames}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Audio track editor ───────────────────────────────────────────────────────
const AudioTrackEditor: React.FC = () => {
  const {
    activeCompId, audioTracks, editingTrackIdx,
    setAudioTracks, setEditingTrackIdx,
  } = useStudio();

  const comp   = getComp(activeCompId);
  const tracks = audioTracks[activeCompId] ?? [];
  const track  = tracks[editingTrackIdx];

  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState("");

  const update = useCallback((patch: Partial<AudioTrack>) => {
    const next = tracks.map((t, i) =>
      i === editingTrackIdx ? { ...t, ...patch } : t,
    );
    setAudioTracks(activeCompId, next);
  }, [tracks, editingTrackIdx, activeCompId, setAudioTracks]);

  const removeTrack = useCallback(() => {
    const next = tracks.filter((_, i) => i !== editingTrackIdx);
    setAudioTracks(activeCompId, next);
    setEditingTrackIdx(Math.max(0, editingTrackIdx - 1));
  }, [tracks, editingTrackIdx, activeCompId, setAudioTracks, setEditingTrackIdx]);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      await saveAudioTracks(activeCompId, tracks);
      setSaveMsg("✓ Saved");
    } catch {
      setSaveMsg("✗ Save failed");
    }
    setSaving(false);
    setTimeout(() => setSaveMsg(""), 2500);
  }, [activeCompId, tracks]);

  if (tracks.length === 0) {
    return (
      <div style={{
        padding:   "16px 0",
        textAlign: "center",
        color:     "#444",
        fontSize:  11,
        fontStyle: "italic",
        lineHeight: 1.6,
      }}>
        No audio tracks.<br />
        Add one from the Audio tab →
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Track selector */}
      {tracks.length > 1 && (
        <div style={{ display: "flex", gap: 4 }}>
          {tracks.map((_, i) => (
            <button
              key={i}
              onClick={() => setEditingTrackIdx(i)}
              style={{
                flex:         1,
                height:       24,
                borderRadius: 3,
                border:       `1px solid ${editingTrackIdx === i ? "#10b981" : "#333"}`,
                background:   editingTrackIdx === i ? "#0f3330" : "#1a1a1a",
                color:        editingTrackIdx === i ? "#6ee7b7" : "#666",
                fontSize:     10,
                cursor:       "pointer",
              }}
            >
              Track {i + 1}
            </button>
          ))}
        </div>
      )}

      {track && (
        <>
          {/* File path */}
          <Field label="File">
            <div style={{
              background:   "#1a1a1a",
              border:       "1px solid #333",
              borderRadius: 4,
              padding:      "5px 8px",
              fontSize:     11,
              color:        "#10b981",
              fontFamily:   "monospace",
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}>
              {track.src}
            </div>
          </Field>

          <Divider label="Timing" />

          {/* Offset */}
          <Field label={`Start at (frame) — where in comp audio begins`}>
            <NumInput
              value={track.offset}
              min={0}
              max={comp?.durationInFrames ?? 9999}
              onChange={(v) => update({ offset: v })}
            />
          </Field>

          {/* End at */}
          <Field label={`End at (frame) — where audio stops`}>
            <NumInput
              value={track.endAt}
              min={track.offset}
              max={comp?.durationInFrames ?? 9999}
              onChange={(v) => update({ endAt: v })}
            />
          </Field>

          {/* startFrom */}
          <Field label={`Trim in (frame) — skip into audio file`}>
            <NumInput
              value={track.startFrom}
              min={0}
              onChange={(v) => update({ startFrom: v })}
            />
          </Field>

          <Divider label="Mix" />

          {/* Volume */}
          <Field label={`Volume (${Math.round(track.volume * 100)}%)`}>
            <input
              type="range"
              min={0} max={1} step={0.01}
              value={track.volume}
              onChange={(e) => update({ volume: Number(e.target.value) })}
              style={{ width: "100%", accentColor: "#0070f3" }}
            />
          </Field>

          {/* Loop */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, color: "#888" }}>Loop</span>
            <input
              type="checkbox"
              checked={track.loop}
              onChange={(e) => update({ loop: e.target.checked })}
              style={{ accentColor: "#0070f3", width: 14, height: 14, cursor: "pointer" }}
            />
          </div>

          {/* Remove */}
          <button
            onClick={removeTrack}
            style={{
              background:   "#1a0a0a",
              border:       "1px solid #450a0a",
              borderRadius: 4,
              color:        "#f87171",
              fontSize:     11,
              padding:      "5px 0",
              cursor:       "pointer",
              marginTop:    4,
            }}
          >
            ✕ Remove track
          </button>
        </>
      )}

      {/* Save */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={save}
          disabled={saving}
          style={{
            flex:         1,
            height:       30,
            borderRadius: 4,
            border:       "none",
            background:   "#0070f3",
            color:        "#fff",
            fontSize:     12,
            fontWeight:   600,
            cursor:       "pointer",
            opacity:      saving ? 0.6 : 1,
          }}
        >
          {saving ? "Saving…" : "Save to project"}
        </button>
        {saveMsg && <span style={{ fontSize: 11, color: saveMsg.startsWith("✓") ? "#10b981" : "#ef4444" }}>{saveMsg}</span>}
      </div>
    </div>
  );
};

// ─── Properties panel ─────────────────────────────────────────────────────────
export const PropertiesPanel: React.FC = () => {
  const [section, setSection] = useState<"comp" | "audio">("comp");

  return (
    <div style={{
      display:        "flex",
      flexDirection:  "column",
      height:         "100%",
      background:     "#161616",
      overflow:       "hidden",
    }}>
      {/* Section tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #2a2a2a", flexShrink: 0 }}>
        {(["comp", "audio"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            style={{
              flex:         1,
              height:       34,
              background:   "transparent",
              border:       "none",
              borderBottom: section === s ? "2px solid #0070f3" : "2px solid transparent",
              color:        section === s ? "#fff" : "#666",
              fontSize:     11,
              fontWeight:   section === s ? 600 : 400,
              cursor:       "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {s === "comp" ? "Info" : "Audio"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
        {section === "comp" ? <CompInfo /> : <AudioTrackEditor />}
      </div>
    </div>
  );
};
