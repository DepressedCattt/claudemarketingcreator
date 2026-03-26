import React, {
  useRef, useCallback, useEffect, useState,
} from "react";
import { useStudio }        from "../store/useStudio";
import { getComp }          from "../registry";
import { saveAudioTracks, saveCues, pitchShiftAudio } from "../api";
import type { AudioTrack, CueEvent } from "../types";
import { CueDetailPopup, CuePopupBackdrop } from "./CueDetailPopup";

const TRACK_H    = 28;    // px per track row
const CUE_ROW_H  = 22;   // px for the cue marker row
const RULER_H    = 22;    // px for the time ruler
const LABEL_W    = 90;    // px left label column
const HANDLE_W   = 6;     // px trim-handle hit area
const MIN_PPF    = 0.05;  // pixels per frame minimum

function framesToPx(frames: number, ppf: number) {
  return frames * ppf;
}
function pxToFrames(px: number, ppf: number) {
  return Math.round(px / ppf);
}

// ─── Time ruler ───────────────────────────────────────────────────────────────
const Ruler: React.FC<{
  timelineFrames: number;  // total scrollable width in frames
  compFrames:     number;  // export boundary
  fps:            number;
  ppf:            number;
  onSeek:         (frame: number) => void;
}> = ({ timelineFrames, compFrames, fps, ppf, onSeek }) => {
  const totalW    = framesToPx(timelineFrames, ppf);
  const compEndX  = framesToPx(compFrames, ppf);
  const tickSec   = ppf * fps < 12 ? 5 : 1;

  const ticks: { frame: number; label: string }[] = [];
  for (let s = 0; s * fps <= timelineFrames; s += tickSec) {
    ticks.push({ frame: s * fps, label: `${s}s` });
  }

  return (
    <div
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const frame = Math.round((e.clientX - rect.left) / ppf);
        onSeek(Math.max(0, Math.min(frame, timelineFrames - 1)));
      }}
      style={{
        position:     "relative",
        width:        totalW,
        height:       RULER_H,
        background:   "#1a1a1a",
        borderBottom: "1px solid #2a2a2a",
        cursor:       "pointer",
        userSelect:   "none",
        flexShrink:   0,
      }}
    >
      {/* Out-of-comp shading */}
      <div style={{
        position:   "absolute",
        left:       compEndX,
        top:        0,
        width:      totalW - compEndX,
        height:     "100%",
        background: "rgba(0,0,0,0.35)",
        pointerEvents: "none",
      }} />

      {ticks.map(({ frame, label }) => (
        <React.Fragment key={frame}>
          <div style={{
            position:   "absolute",
            left:       framesToPx(frame, ppf),
            top:        10, width: 1, height: 8,
            background: frame <= compFrames ? "#3a3a3a" : "#282828",
          }} />
          <div style={{
            position:   "absolute",
            left:       framesToPx(frame, ppf) + 3,
            top:        5,
            fontSize:   9,
            color:      frame <= compFrames ? "#555" : "#333",
            fontFamily: "monospace",
            whiteSpace: "nowrap",
          }}>
            {label}
          </div>
        </React.Fragment>
      ))}

      {/* Comp-end marker line */}
      <div style={{
        position:   "absolute",
        left:       compEndX,
        top:        0,
        width:      2,
        height:     "100%",
        background: "#ef444466",
        pointerEvents: "none",
      }} />
      <div style={{
        position:   "absolute",
        left:       compEndX + 4,
        top:        4,
        fontSize:   8,
        color:      "#ef4444aa",
        fontFamily: "monospace",
        whiteSpace: "nowrap",
        pointerEvents: "none",
      }}>
        OUT
      </div>
    </div>
  );
};

// ─── Sequence block (read-only visual) ────────────────────────────────────────
const SequenceBlock: React.FC<{
  label:    string;
  color:    string;
  from:     number;
  duration: number;
  ppf:      number;
  onSeek:   (frame: number) => void;
}> = ({ label, color, from, duration, ppf, onSeek }) => {
  const x = framesToPx(from, ppf);
  const w = Math.max(2, framesToPx(duration, ppf));

  return (
    <div
      onClick={() => onSeek(from)}
      title={`${label} — click to seek`}
      style={{
        position:     "absolute",
        left:         x,
        width:        w,
        top:          2,
        height:       TRACK_H - 4,
        background:   `${color}22`,
        border:       `1px solid ${color}55`,
        borderRadius: 3,
        overflow:     "hidden",
        cursor:       "pointer",
        userSelect:   "none",
        display:      "flex",
        alignItems:   "center",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = `${color}33`)}
      onMouseLeave={(e) => (e.currentTarget.style.background = `${color}22`)}
    >
      {w > 30 && (
        <span style={{
          fontSize:     9,
          color:        color,
          fontWeight:   600,
          padding:      "0 5px",
          overflow:     "hidden",
          textOverflow: "ellipsis",
          whiteSpace:   "nowrap",
          letterSpacing: "0.04em",
        }}>
          {label}
        </span>
      )}
    </div>
  );
};

// ─── Cue type colors ─────────────────────────────────────────────────────────
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

// ─── Draggable/resizable cue bar ─────────────────────────────────────────────
const CUE_BAR_H   = 18;   // bar height inside the CUE_ROW_H row
const CUE_HANDLE  = 5;    // px edge resize hit area

const CueBar: React.FC<{
  cue:       CueEvent;
  ppf:       number;
  selected:  boolean;
  onSeek:    (frame: number) => void;
  onClick:   (cue: CueEvent) => void;
  onUpdate:  (updated: CueEvent) => void;
  onCommit:  (updated: CueEvent) => void;
}> = ({ cue, ppf, selected, onSeek, onClick, onUpdate, onCommit }) => {
  const x     = framesToPx(cue.frame, ppf);
  const dur   = cue.duration ?? 1;
  const w     = Math.max(CUE_HANDLE * 3, framesToPx(dur, ppf));
  const c     = CUE_COLORS[cue.type] ?? "#888";
  const [hovered, setHovered] = useState(false);

  const startDrag = (e: React.MouseEvent, mode: "move" | "left" | "right") => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const snap = { ...cue };

    const onMove = (me: MouseEvent) => {
      const delta = pxToFrames(me.clientX - startX, ppf);
      if (mode === "move") {
        onUpdate({ ...snap, frame: Math.max(0, snap.frame + delta) });
      } else if (mode === "left") {
        const newFrame = Math.max(0, Math.min(snap.frame + (snap.duration ?? 1) - 1, snap.frame + delta));
        const newDur   = (snap.duration ?? 1) - (newFrame - snap.frame);
        onUpdate({ ...snap, frame: newFrame, duration: Math.max(1, newDur) });
      } else {
        onUpdate({ ...snap, duration: Math.max(1, (snap.duration ?? 1) + delta) });
      }
    };

    const onUp = (me: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
      const delta = pxToFrames(me.clientX - startX, ppf);
      let final = { ...snap };
      if (mode === "move") {
        final = { ...snap, frame: Math.max(0, snap.frame + delta) };
      } else if (mode === "left") {
        const newFrame = Math.max(0, Math.min(snap.frame + (snap.duration ?? 1) - 1, snap.frame + delta));
        final = { ...snap, frame: newFrame, duration: Math.max(1, (snap.duration ?? 1) - (newFrame - snap.frame)) };
      } else {
        final = { ...snap, duration: Math.max(1, (snap.duration ?? 1) + delta) };
      }
      onCommit(final);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  const handleStyle: React.CSSProperties = {
    position: "absolute", top: 0, width: CUE_HANDLE, height: "100%",
    cursor: "ew-resize", zIndex: 2, background: "transparent",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={`${cue.type} · ${cue.intensity} · f${cue.frame} (${dur}f)\n${cue.label}${cue.sfxDescription ? "\nSFX: " + cue.sfxDescription : ""}${cue.notes ? "\n" + cue.notes : ""}`}
      style={{
        position:     "absolute",
        left:         x,
        top:          (CUE_ROW_H - CUE_BAR_H) / 2,
        width:        w,
        height:       CUE_BAR_H,
        background:   selected ? `${c}44` : `${c}22`,
        border:       `1px solid ${selected ? c : `${c}88`}`,
        borderRadius: 3,
        cursor:       "grab",
        userSelect:   "none",
        zIndex:       3,
        overflow:     "hidden",
        opacity:      hovered || selected ? 1 : 0.85,
        transition:   "opacity 0.1s, background 0.1s",
        boxShadow:    selected ? `0 0 6px ${c}55` : "none",
      }}
      onMouseDown={(e) => {
        const localX = e.clientX - e.currentTarget.getBoundingClientRect().left;
        if (localX <= CUE_HANDLE || localX >= w - CUE_HANDLE) return;
        startDrag(e, "move");
        onSeek(cue.frame);
      }}
      onClick={(e) => { e.stopPropagation(); onClick(cue); }}
    >
      {/* Left resize handle */}
      <div style={{ ...handleStyle, left: 0 }} onMouseDown={(e) => startDrag(e, "left")} />

      {/* Label */}
      {w > 24 && (
        <span style={{
          position:     "absolute",
          left:         CUE_HANDLE + 2,
          right:        CUE_HANDLE + 2,
          fontSize:     8,
          color:        c,
          fontWeight:   600,
          overflow:     "hidden",
          textOverflow: "ellipsis",
          whiteSpace:   "nowrap",
          lineHeight:   `${CUE_BAR_H - 2}px`,
          letterSpacing: "0.03em",
        }}>
          {cue.label}
        </span>
      )}

      {/* Right resize handle */}
      <div style={{ ...handleStyle, right: 0, left: "auto" }} onMouseDown={(e) => startDrag(e, "right")} />
    </div>
  );
};

// ─── Draggable audio bar ───────────────────────────────────────────────────────
// Drag zones:
//  Left  HANDLE_W px  → trim-in  (moves offset + startFrom)
//  Right HANDLE_W px  → trim-out (moves endAt)
//  Middle              → move     (shifts offset, keeps duration)

type DraggableAudioBarProps = {
  track:     AudioTrack;
  total:     number;         // total composition frames (clamp guard)
  ppf:       number;
  selected:  boolean;
  onSelect:  () => void;
  onSeek:    (f: number) => void;
  onChange:  (t: AudioTrack) => void;  // live update during drag
  onCommit:  (t: AudioTrack) => void;  // called once on mouseup → save to disk
};

const DraggableAudioBar: React.FC<DraggableAudioBarProps> = ({
  track, total, ppf, selected, onSelect, onSeek, onChange, onCommit,
}) => {
  const offsetX  = framesToPx(track.offset,                     ppf);
  const endX     = framesToPx(Math.min(track.endAt, total),     ppf);
  const w        = Math.max(HANDLE_W * 3, endX - offsetX);
  const filename = track.src.split("/").pop() ?? track.src;

  const startDrag = (
    e: React.MouseEvent,
    mode: "move" | "trim-left" | "trim-right",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();

    const startClientX = e.clientX;
    const snap = { ...track };  // snapshot at drag start

    const onMove = (me: MouseEvent) => {
      const deltaF = pxToFrames(me.clientX - startClientX, ppf);

      if (mode === "move") {
        const duration  = snap.endAt - snap.offset;
        const newOffset = Math.max(0, snap.offset + deltaF);
        onChange({ ...snap, offset: newOffset, endAt: newOffset + duration });

      } else if (mode === "trim-left") {
        // Standard NLE left-edge trim.  Right edge (endAt) stays fixed.
        // Bar visually shrinks/grows from the left.  Source audio is
        // preserved — drag back to reveal trimmed frames.
        const newOffset    = Math.max(0, Math.min(snap.endAt - 1, snap.offset + deltaF));
        const trimDelta    = newOffset - snap.offset;
        const newStartFrom = Math.max(0, snap.startFrom + trimDelta);
        onChange({ ...snap, offset: newOffset, startFrom: newStartFrom });

      } else {
        // Standard NLE right-edge trim.  Left edge (offset) stays fixed.
        // Bar visually shrinks/grows from the right.  No hard clamp —
        // clips can extend past the comp-end line (Remotion just won't render past it).
        const newEndAt = Math.max(snap.offset + 1, snap.endAt + deltaF);
        onChange({ ...snap, endAt: newEndAt });
      }
    };

    const onUp = (me: MouseEvent) => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);

      // Reconstruct final track from the same math as onMove
      const deltaF = pxToFrames(me.clientX - startClientX, ppf);
      let final = { ...snap };
      if (mode === "move") {
        const duration  = snap.endAt - snap.offset;
        const newOffset = Math.max(0, snap.offset + deltaF);
        final = { ...snap, offset: newOffset, endAt: newOffset + duration };
      } else if (mode === "trim-left") {
        const newOffset    = Math.max(0, Math.min(snap.endAt - 1, snap.offset + deltaF));
        const trimDelta    = newOffset - snap.offset;
        const newStartFrom = Math.max(0, snap.startFrom + trimDelta);
        final = { ...snap, offset: newOffset, startFrom: newStartFrom };
      } else {
        const newEndAt = Math.max(snap.offset + 1, snap.endAt + deltaF);
        final = { ...snap, endAt: newEndAt };
      }
      onCommit(final);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  };

  const handleStyle: React.CSSProperties = {
    position:   "absolute",
    top:        0,
    width:      HANDLE_W,
    height:     "100%",
    cursor:     "col-resize",
    zIndex:     2,
    background: "transparent",
    borderLeft: `2px solid ${selected ? "#10b981" : "#065f46"}`,
  };

  const isMuted = track.volume === 0;

  return (
    <div
      title={`${filename}${isMuted ? " (muted)" : ""}`}
      style={{
        position:     "absolute",
        left:         offsetX,
        width:        w,
        top:          2,
        height:       TRACK_H - 4,
        background:   isMuted ? "#1a1a1a" : (selected ? "#16524a" : "#0f3330"),
        border:       `1px solid ${isMuted ? "#333" : (selected ? "#10b981" : "#065f46")}`,
        borderRadius: 3,
        userSelect:   "none",
        overflow:     "hidden",
        display:      "flex",
        alignItems:   "center",
        cursor:       "grab",
        opacity:      isMuted ? 0.5 : 1,
      }}
      onMouseDown={(e) => {
        const localX = e.clientX - e.currentTarget.getBoundingClientRect().left;
        if (localX <= HANDLE_W) return;
        if (localX >= w - HANDLE_W) return;
        startDrag(e, "move");
        onSeek(track.offset);
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "#16524a")}
      onMouseLeave={(e) => (e.currentTarget.style.background = selected ? "#16524a" : "#0f3330")}
    >
      {/* Left trim handle */}
      <div
        style={{ ...handleStyle, left: 0, borderLeft: "2px solid #10b981", borderRight: "none" }}
        onMouseDown={(e) => startDrag(e, "trim-left")}
        title="Drag to trim start"
      />

      {/* Label */}
      {w > 50 && (
        <span style={{
          position:     "absolute",
          left:         HANDLE_W + 4,
          right:        HANDLE_W + 4,
          fontSize:     9,
          color:        "#6ee7b7",
          fontFamily:   "monospace",
          overflow:     "hidden",
          textOverflow: "ellipsis",
          whiteSpace:   "nowrap",
        }}>
          {filename}
        </span>
      )}

      {/* Right trim handle */}
      <div
        style={{
          ...handleStyle,
          right: 0,
          left:  "auto",
          borderLeft:  "none",
          borderRight: "2px solid #10b981",
        }}
        onMouseDown={(e) => startDrag(e, "trim-right")}
        title="Drag to trim end"
      />
    </div>
  );
};

// ─── Track row wrapper with label ─────────────────────────────────────────────
const TrackRow: React.FC<{
  label:      string;
  children:   React.ReactNode;
  totalW:     number;
  compEndX?:  number;   // px position of the comp-end boundary line
  accent?:    string;
}> = ({ label, children, totalW, compEndX, accent }) => (
  <div style={{ display: "flex", flexShrink: 0 }}>
    <div style={{
      width:       LABEL_W,
      height:      TRACK_H,
      flexShrink:  0,
      display:     "flex",
      alignItems:  "center",
      padding:     "0 8px",
      borderRight: "1px solid #2a2a2a",
      background:  "#181818",
    }}>
      <span style={{
        fontSize:     10,
        color:        accent ?? "#555",
        fontWeight:   500,
        overflow:     "hidden",
        textOverflow: "ellipsis",
        whiteSpace:   "nowrap",
      }}>
        {label}
      </span>
    </div>
    <div style={{ position: "relative", width: totalW, height: TRACK_H, flexShrink: 0 }}>
      {/* Out-of-comp shading — striped to indicate non-rendered area */}
      {compEndX !== undefined && (
        <div style={{
          position:      "absolute",
          left:          compEndX,
          top:           0,
          width:         totalW - compEndX,
          height:        "100%",
          background:    "repeating-linear-gradient(135deg, transparent, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 8px)",
          pointerEvents: "none",
          zIndex:        1,
        }} />
      )}
      {/* Comp-end boundary line */}
      {compEndX !== undefined && (
        <div style={{
          position:      "absolute",
          left:          compEndX - 1,
          top:           0,
          width:         2,
          height:        "100%",
          background:    "#ef4444",
          opacity:       0.45,
          pointerEvents: "none",
          zIndex:        2,
        }} />
      )}
      {children}
    </div>
  </div>
);

// ─── Playhead ─────────────────────────────────────────────────────────────────
const Playhead: React.FC<{
  frame: number; ppf: number; height: number; flash?: boolean;
}> = ({ frame, ppf, height, flash }) => {
  const color = flash ? "#ffffff" : "#ef4444";
  return (
    <div style={{
      position:      "absolute",
      top:           0,
      left:          framesToPx(frame, ppf),
      width:         flash ? 2 : 1,
      height,
      background:    color,
      pointerEvents: "none",
      zIndex:        20,
      transition:    "background 0.05s, width 0.05s",
    }}>
      <div style={{
        position:    "absolute",
        top:         0,
        left:        -4,
        width:       0,
        height:      0,
        borderLeft:  "4px solid transparent",
        borderRight: "4px solid transparent",
        borderTop:   `6px solid ${color}`,
        transition:  "border-top-color 0.05s",
      }} />
    </div>
  );
};

// ─── Inline numeric input ────────────────────────────────────────────────────
const NumInput: React.FC<{
  label:    string;
  value:    number;
  onChange: (v: number) => void;
  min?:     number;
  max?:     number;
  step?:    number;
  width?:   number;
  suffix?:  string;
}> = ({ label, value, onChange, min = 0, max = 999999, step = 1, width = 56, suffix }) => {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null) {
      onChange(Math.max(min, Math.min(max, Number(draft) || 0)));
      setDraft(null);
    }
  };
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#888" }}>
      {label}
      <input
        type="number"
        value={draft ?? value}
        min={min} max={max} step={step}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
        style={{
          width, height: 22, background: "#222", border: "1px solid #383838",
          borderRadius: 3, color: "#ddd", fontSize: 11, fontFamily: "monospace",
          padding: "0 4px", textAlign: "right",
        }}
      />
      {suffix && <span style={{ color: "#555", fontSize: 9 }}>{suffix}</span>}
    </label>
  );
};

// ─── Selected track editor bar ──────────────────────────────────────────────
const SelectedTrackEditor: React.FC<{
  track:          AudioTrack;
  idx:            number;
  fps:            number;
  onFieldChange:  (field: keyof AudioTrack, value: number) => void;
  onFieldsChange: (patch: Partial<AudioTrack>) => void;
  onDelete:       () => void;
}> = ({ track, idx, fps, onFieldChange, onFieldsChange, onDelete }) => {
  const filename = track.src.split("/").pop() ?? track.src;
  const durationFrames = track.endAt - track.offset;
  const durationSec    = (durationFrames / fps).toFixed(2);
  const offsetSec      = (track.offset / fps).toFixed(2);

  return (
    <div style={{
      height:      36,
      background:  "#1a1a1a",
      borderTop:   "1px solid #10b98133",
      display:     "flex",
      alignItems:  "center",
      padding:     "0 12px",
      gap:         14,
      flexShrink:  0,
    }}>
      <span style={{
        fontSize: 10, color: "#10b981", fontWeight: 600,
        letterSpacing: "0.06em", textTransform: "uppercase",
        flexShrink: 0,
      }}>
        Audio {idx + 1}
      </span>
      <span style={{
        fontSize: 10, color: "#6ee7b7", fontFamily: "monospace",
        maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap", flexShrink: 0,
      }}>
        {filename}
      </span>

      <div style={{ width: 1, height: 18, background: "#2a2a2a" }} />

      <NumInput label="Start:" value={track.offset}
        onChange={(v) => {
          const dur = track.endAt - track.offset;
          onFieldsChange({ offset: v, endAt: v + dur });
        }}
        suffix="f"
      />
      <span style={{ fontSize: 9, color: "#555" }}>({offsetSec}s)</span>

      <NumInput label="Duration:" value={durationFrames}
        onChange={(v) => onFieldChange("endAt", track.offset + Math.max(1, v))}
        min={1} suffix="f"
      />
      <span style={{ fontSize: 9, color: "#555" }}>({durationSec}s)</span>

      <NumInput label="Trim in:" value={track.startFrom}
        onChange={(v) => onFieldChange("startFrom", v)}
        suffix="f"
      />

      <NumInput label="Vol:" value={Math.round(track.volume * 100)}
        onChange={(v) => {
          const vol = v / 100;
          const semitones = track.pitchSemitones ?? 0;
          const needsGain = vol > 1;
          const needsProcessing = needsGain || semitones !== 0;

          onFieldsChange({ volume: vol });

          if (!needsProcessing) {
            onFieldsChange({ volume: vol, pitchedSrc: undefined });
            return;
          }

          const gainDb = needsGain ? 20 * Math.log10(vol) : undefined;
          pitchShiftAudio(track.src, semitones, gainDb)
            .then(({ pitchedSrc }) => onFieldsChange({ volume: vol, pitchedSrc }))
            .catch((err) => console.error("Audio processing failed:", err));
        }}
        min={0} max={200} width={44} suffix="%"
      />

      <NumInput label="Pitch:" value={track.pitchSemitones ?? 0}
        onChange={(v) => {
          if (v === (track.pitchSemitones ?? 0)) return;
          const vol = track.volume;
          const needsGain = vol > 1;
          const needsProcessing = v !== 0 || needsGain;

          onFieldsChange({ pitchSemitones: v });

          if (!needsProcessing) {
            onFieldsChange({ pitchSemitones: 0, pitchedSrc: undefined });
            return;
          }

          const gainDb = needsGain ? 20 * Math.log10(vol) : undefined;
          pitchShiftAudio(track.src, v, gainDb)
            .then(({ pitchedSrc }) => onFieldsChange({ pitchSemitones: v, pitchedSrc }))
            .catch((err) => console.error("Audio processing failed:", err));
        }}
        min={-12} max={12} step={1} width={36} suffix="st"
      />

      <div style={{ flex: 1 }} />

      <button
        onClick={onDelete}
        title="Remove this audio track"
        style={{
          background: "#450a0a", border: "1px solid #ef4444",
          borderRadius: 3, color: "#f87171", fontSize: 10,
          padding: "2px 8px", cursor: "pointer",
        }}
      >
        Remove
      </button>
    </div>
  );
};

// ─── Toolbar helpers ────────────────────────────────────────────────────────────

const toolbarBtnStyle: React.CSSProperties = {
  background: "#222", border: "1px solid #333", color: "#888",
  width: 22, height: 22, borderRadius: 3, cursor: "pointer",
  fontSize: 13, lineHeight: 1, display: "inline-flex",
  alignItems: "center", justifyContent: "center", padding: 0,
};

const ToolbarBtn: React.FC<{
  children: React.ReactNode; title?: string; onClick: () => void; wide?: boolean;
}> = ({ children, title, onClick, wide }) => (
  <button
    title={title}
    onClick={onClick}
    style={{ ...toolbarBtnStyle, ...(wide ? { width: "auto", padding: "0 8px", fontSize: 10 } : {}) }}
  >{children}</button>
);

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd style={{
    background: "#252525", border: "1px solid #383838", borderRadius: 3,
    padding: "0 3px", fontFamily: "monospace", color: "#555", fontSize: 9,
    marginRight: 2,
  }}>{children}</kbd>
);

const DurationInput: React.FC<{
  value: number; fps: number; onChange: (frames: number) => void;
}> = ({ value, fps, onChange }) => {
  const secs = (value / fps).toFixed(1);
  const [draft, setDraft] = useState(secs);
  const [focused, setFocused] = useState(false);

  useEffect(() => { if (!focused) setDraft((value / fps).toFixed(1)); }, [value, fps, focused]);

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n > 0) onChange(Math.round(n * fps));
    setFocused(false);
  };

  return (
    <input
      value={focused ? draft : `${secs}s`}
      onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ""))}
      onFocus={() => { setFocused(true); setDraft(secs); }}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") { commit(); (e.target as HTMLInputElement).blur(); } }}
      style={{
        width: 52, height: 20, background: "#222", border: "1px solid #333",
        borderRadius: 3, color: "#aaa", fontSize: 10, fontFamily: "monospace",
        textAlign: "center", outline: "none", padding: 0,
      }}
    />
  );
};

// ─── Main Timeline ─────────────────────────────────────────────────────────────
export const Timeline: React.FC = () => {
  const {
    activeCompId,
    frame, zoom, setZoom, setFrame,
    audioTracks, setAudioTracks,
    editingTrackIdx, setEditingTrackIdx,
    cues: cuesMap, setCues,
    pushUndo, undo, redo,
    clipboard, setClipboard,
    durationOverrides, setDurationOverride,
  } = useStudio();

  const comp      = getComp(activeCompId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);
  const [dropFrame, setDropFrame] = useState<number | null>(null);
  const [selectedCueId, setSelectedCueId] = useState<string | null>(null);
  const [editingCue, setEditingCue]       = useState<CueEvent | null>(null);

  const tracks      = audioTracks[activeCompId] ?? [];
  const baseDuration = comp?.durationInFrames ?? 1;
  const totalFrames = durationOverrides[activeCompId] ?? baseDuration;
  const fps         = comp?.fps ?? 30;
  const sequences   = comp?.sequences ?? [];
  const cues        = cuesMap[activeCompId] ?? [];

  const ppf    = Math.max(MIN_PPF, 1.5 * zoom);

  // Timeline extends well beyond the comp boundary so audio clips can live
  // at their full file length.  The comp-end line marks the export boundary.
  const maxClipEnd     = tracks.reduce((m, t) => Math.max(m, t.endAt), 0);
  const timelineFrames = Math.max(totalFrames * 2, maxClipEnd + fps * 10);
  const totalW         = framesToPx(timelineFrames, ppf);
  const compEndX       = framesToPx(totalFrames, ppf);

  const seqRows    = Math.max(1, sequences.length);
  const trackAreaH = (seqRows + tracks.length + (tracks.length === 0 ? 1 : 0)) * TRACK_H + CUE_ROW_H;
  useEffect(() => setContentH(RULER_H + trackAreaH), [trackAreaH]);

  const seek = useCallback((f: number) => {
    setFrame(Math.max(0, Math.min(f, totalFrames - 1)));
  }, [setFrame, totalFrames]);

  // Scroll to keep playhead visible
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const px = framesToPx(frame, ppf) + LABEL_W;
    const { scrollLeft, clientWidth } = el;
    if (px < scrollLeft + 20 || px > scrollLeft + clientWidth - 40) {
      el.scrollLeft = px - clientWidth / 2;
    }
  }, [frame, ppf]);

  // Ctrl+scroll to zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      setZoom(zoom * (e.deltaY < 0 ? 1.15 : 0.87));
    }
  }, [zoom, setZoom]);

  // Live update a single audio track (called on every mousemove during drag)
  const handleTrackChange = useCallback((idx: number, updated: AudioTrack) => {
    if (!activeCompId) return;
    const next = tracks.map((t, i) => (i === idx ? updated : t));
    setAudioTracks(activeCompId, next);
  }, [activeCompId, tracks, setAudioTracks]);

  // Persist to disk when drag ends
  const handleTrackCommit = useCallback(async (idx: number, updated: AudioTrack) => {
    if (!activeCompId) return;
    pushUndo(activeCompId);
    const next = tracks.map((t, i) => (i === idx ? updated : t));
    setAudioTracks(activeCompId, next);
    try { await saveAudioTracks(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, tracks, setAudioTracks, pushUndo]);

  // ── Cut at playhead (C) ───────────────────────────────────────────────────
  // Only cuts the SELECTED audio clip at the current playhead frame.
  // Does nothing if no audio clip is selected — click a clip first.
  // Sequences (composition code) are never affected.
  const [cutFlash, setCutFlash] = useState(false);

  const handleCut = useCallback(async () => {
    if (!activeCompId) return;
    const idx = editingTrackIdx;
    if (idx < 0 || idx >= tracks.length) return;

    const t = tracks[idx];
    const f = frame;
    if (f <= t.offset || f >= t.endAt) return;

    pushUndo(activeCompId);

    const left:  AudioTrack = { ...t, endAt: f };
    const right: AudioTrack = { ...t, offset: f, startFrom: t.startFrom + (f - t.offset) };

    const next = [
      ...tracks.slice(0, idx),
      left,
      right,
      ...tracks.slice(idx + 1),
    ];

    setAudioTracks(activeCompId, next);
    setEditingTrackIdx(idx);
    setCutFlash(true);
    setTimeout(() => setCutFlash(false), 200);
    try { await saveAudioTracks(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, tracks, frame, editingTrackIdx, setAudioTracks, setEditingTrackIdx, pushUndo]);

  // ── Delete selected track (Delete / Backspace) ────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!activeCompId || editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    pushUndo(activeCompId);
    const next = tracks.filter((_, i) => i !== editingTrackIdx);
    setAudioTracks(activeCompId, next);
    setEditingTrackIdx(Math.min(editingTrackIdx, next.length - 1));
    try { await saveAudioTracks(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, tracks, editingTrackIdx, setAudioTracks, setEditingTrackIdx, pushUndo]);

  // ── Copy / Paste / Duplicate ────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    if (editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    setClipboard({ ...tracks[editingTrackIdx] });
  }, [editingTrackIdx, tracks, setClipboard]);

  const handlePaste = useCallback(async () => {
    if (!activeCompId || !clipboard) return;
    pushUndo(activeCompId);
    const duration = clipboard.endAt - clipboard.offset;
    const pasted: AudioTrack = {
      ...clipboard,
      offset:    frame,
      endAt:     frame + duration,
    };
    const next = [...tracks, pasted];
    setAudioTracks(activeCompId, next);
    setEditingTrackIdx(next.length - 1);
    try { await saveAudioTracks(activeCompId, next); } catch {}
  }, [activeCompId, clipboard, frame, tracks, setAudioTracks, setEditingTrackIdx, pushUndo]);

  const handleDuplicate = useCallback(async () => {
    if (!activeCompId || editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    pushUndo(activeCompId);
    const src = tracks[editingTrackIdx];
    const duration = src.endAt - src.offset;
    const dup: AudioTrack = { ...src, offset: src.endAt, endAt: src.endAt + duration };
    const next = [...tracks, dup];
    setAudioTracks(activeCompId, next);
    setEditingTrackIdx(next.length - 1);
    try { await saveAudioTracks(activeCompId, next); } catch {}
  }, [activeCompId, editingTrackIdx, tracks, setAudioTracks, setEditingTrackIdx, pushUndo]);

  // ── Mute toggle (M) ───────────────────────────────────────────────────────
  const handleMuteToggle = useCallback(async () => {
    if (!activeCompId || editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    pushUndo(activeCompId);
    const t = tracks[editingTrackIdx];
    const updated = { ...t, volume: t.volume === 0 ? 1 : 0 };
    const next = tracks.map((tr, i) => (i === editingTrackIdx ? updated : tr));
    setAudioTracks(activeCompId, next);
    try { await saveAudioTracks(activeCompId, next); } catch {}
  }, [activeCompId, editingTrackIdx, tracks, setAudioTracks, pushUndo]);

  // ── Trim-to-playhead ([ and ]) ─────────────────────────────────────────
  const handleTrimHead = useCallback(async () => {
    if (!activeCompId || editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    const t = tracks[editingTrackIdx];
    if (frame <= t.offset || frame >= t.endAt) return;
    pushUndo(activeCompId);
    const trimDelta = frame - t.offset;
    const updated = { ...t, offset: frame, startFrom: t.startFrom + trimDelta };
    const next = tracks.map((tr, i) => (i === editingTrackIdx ? updated : tr));
    setAudioTracks(activeCompId, next);
    try { await saveAudioTracks(activeCompId, next); } catch {}
  }, [activeCompId, editingTrackIdx, tracks, frame, setAudioTracks, pushUndo]);

  const handleTrimTail = useCallback(async () => {
    if (!activeCompId || editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    const t = tracks[editingTrackIdx];
    if (frame <= t.offset || frame >= t.endAt) return;
    pushUndo(activeCompId);
    const updated = { ...t, endAt: frame };
    const next = tracks.map((tr, i) => (i === editingTrackIdx ? updated : tr));
    setAudioTracks(activeCompId, next);
    try { await saveAudioTracks(activeCompId, next); } catch {}
  }, [activeCompId, editingTrackIdx, tracks, frame, setAudioTracks, pushUndo]);

  // ── Undo / Redo handlers ──────────────────────────────────────────────────
  const handleUndo = useCallback(async () => {
    if (!activeCompId) return;
    undo(activeCompId);
    const s = useStudio.getState();
    try { await saveAudioTracks(activeCompId, s.audioTracks[activeCompId] ?? []); } catch {}
  }, [activeCompId, undo]);

  const handleRedo = useCallback(async () => {
    if (!activeCompId) return;
    redo(activeCompId);
    const s = useStudio.getState();
    try { await saveAudioTracks(activeCompId, s.audioTracks[activeCompId] ?? []); } catch {}
  }, [activeCompId, redo]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+Z → undo
      if (ctrl && !e.shiftKey && e.code === "KeyZ") { e.preventDefault(); handleUndo(); return; }
      // Ctrl+Shift+Z → redo
      if (ctrl && e.shiftKey && e.code === "KeyZ") { e.preventDefault(); handleRedo(); return; }
      // Ctrl+C → copy
      if (ctrl && e.code === "KeyC") { e.preventDefault(); handleCopy(); return; }
      // Ctrl+V → paste
      if (ctrl && e.code === "KeyV") { e.preventDefault(); handlePaste(); return; }
      // Ctrl+D → duplicate
      if (ctrl && e.code === "KeyD") { e.preventDefault(); handleDuplicate(); return; }

      // Non-modifier shortcuts:
      if (ctrl) return;

      // C → cut at playhead
      if (e.code === "KeyC") { e.preventDefault(); handleCut(); return; }
      // Delete / Backspace → remove
      if (e.code === "Delete" || e.code === "Backspace") { e.preventDefault(); handleDelete(); return; }
      // M → mute/unmute
      if (e.code === "KeyM") { e.preventDefault(); handleMuteToggle(); return; }
      // [ → trim head to playhead
      if (e.code === "BracketLeft") { e.preventDefault(); handleTrimHead(); return; }
      // ] → trim tail to playhead
      if (e.code === "BracketRight") { e.preventDefault(); handleTrimTail(); return; }
      // Left / Right → nudge playhead
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        setFrame(Math.max(0, frame - (e.shiftKey ? 10 : 1)));
        return;
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        setFrame(Math.min(totalFrames - 1, frame + (e.shiftKey ? 10 : 1)));
        return;
      }
      // Home / End → jump to start / end
      if (e.code === "Home") { e.preventDefault(); setFrame(0); return; }
      if (e.code === "End") { e.preventDefault(); setFrame(totalFrames - 1); return; }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleCut, handleDelete, handleUndo, handleRedo, handleCopy, handlePaste,
      handleDuplicate, handleMuteToggle, handleTrimHead, handleTrimTail,
      frame, totalFrames, setFrame]);

  // ── Drop handler — accept audio files dragged from left panel ────────────
  const handleTimelineDragOver = useCallback((e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes("application/x-studio-audio")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    const rect = e.currentTarget.getBoundingClientRect();
    const xInTimeline = e.clientX - rect.left + (scrollRef.current?.scrollLeft ?? 0) - LABEL_W;
    setDropFrame(Math.max(0, pxToFrames(xInTimeline, ppf)));
  }, [ppf]);

  const handleTimelineDragLeave = useCallback(() => setDropFrame(null), []);

  const handleTimelineDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setDropFrame(null);
    const raw = e.dataTransfer.getData("application/x-studio-audio");
    if (!raw || !activeCompId || !comp) return;

    const { path: filePath } = JSON.parse(raw) as { path: string; name: string };
    const rect = e.currentTarget.getBoundingClientRect();
    const xInTimeline = e.clientX - rect.left + (scrollRef.current?.scrollLeft ?? 0) - LABEL_W;
    const dropAtFrame = Math.max(0, pxToFrames(xInTimeline, ppf));

    pushUndo(activeCompId);
    const placeholderEnd = dropAtFrame + comp.fps * 60 * 5;
    const newTrack: AudioTrack = {
      src: filePath, startFrom: 0, endAt: placeholderEnd,
      offset: dropAtFrame, volume: 1.0, loop: false,
    };
    const withNew = [...tracks, newTrack];
    setAudioTracks(activeCompId, withNew);
    setEditingTrackIdx(withNew.length - 1);

    const audio = new window.Audio(filePath);
    audio.addEventListener("loadedmetadata", async () => {
      const durationFrames = Math.ceil(audio.duration * comp.fps);
      const updated = withNew.map((t, i) =>
        i === withNew.length - 1 ? { ...t, endAt: dropAtFrame + durationFrames } : t,
      );
      setAudioTracks(activeCompId, updated);
      try { await saveAudioTracks(activeCompId, updated); } catch {}
    }, { once: true });
  }, [activeCompId, comp, ppf, tracks, setAudioTracks, setEditingTrackIdx, pushUndo]);

  // ── Cue CRUD helpers ─────────────────────────────────────────────────────
  const handleCueUpdate = useCallback((updated: CueEvent) => {
    if (!activeCompId) return;
    const next = cues.map((c) => (c.id === updated.id ? updated : c));
    setCues(activeCompId, next);
  }, [activeCompId, cues, setCues]);

  const handleCueCommit = useCallback(async (updated: CueEvent) => {
    if (!activeCompId) return;
    const next = cues.map((c) => (c.id === updated.id ? updated : c));
    setCues(activeCompId, next);
    try { await saveCues(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, cues, setCues]);

  const handleAddCue = useCallback(async () => {
    if (!activeCompId) return;
    const newCue: CueEvent = {
      id:        `cue-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      frame:     frame,
      duration:  Math.round(fps / 2),
      type:      "AMBIENT",
      label:     "New cue",
      intensity: "medium",
    };
    const next = [...cues, newCue];
    setCues(activeCompId, next);
    setSelectedCueId(newCue.id);
    setEditingCue(newCue);
    try { await saveCues(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, cues, frame, fps, setCues]);

  const handleDeleteCue = useCallback(async (id: string) => {
    if (!activeCompId) return;
    const next = cues.filter((c) => c.id !== id);
    setCues(activeCompId, next);
    if (selectedCueId === id) { setSelectedCueId(null); setEditingCue(null); }
    try { await saveCues(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, cues, selectedCueId, setCues]);

  const handleSaveCueEdit = useCallback(async (updated: CueEvent) => {
    if (!activeCompId) return;
    const next = cues.map((c) => (c.id === updated.id ? updated : c));
    setCues(activeCompId, next);
    setEditingCue(updated);
    try { await saveCues(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, cues, setCues]);

  // ── Selected track editor helpers ───────────────────────────────────────
  const selectedTrack = editingTrackIdx >= 0 && editingTrackIdx < tracks.length
    ? tracks[editingTrackIdx] : null;

  const updateSelectedField = useCallback(async (field: keyof AudioTrack, value: number) => {
    if (!activeCompId || editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    pushUndo(activeCompId);
    const updated = { ...tracks[editingTrackIdx], [field]: value };
    const next = tracks.map((t, i) => (i === editingTrackIdx ? updated : t));
    setAudioTracks(activeCompId, next);
    try { await saveAudioTracks(activeCompId, next); } catch {}
  }, [activeCompId, editingTrackIdx, tracks, setAudioTracks, pushUndo]);

  const updateSelectedFields = useCallback(async (patch: Partial<AudioTrack>) => {
    if (!activeCompId || editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    pushUndo(activeCompId);
    const updated = { ...tracks[editingTrackIdx], ...patch };
    const next = tracks.map((t, i) => (i === editingTrackIdx ? updated : t));
    setAudioTracks(activeCompId, next);
    try { await saveAudioTracks(activeCompId, next); } catch {}
  }, [activeCompId, editingTrackIdx, tracks, setAudioTracks, pushUndo]);

  return (
    <div style={{
      display:       "flex",
      flexDirection: "column",
      height:        "100%",
      background:    "#141414",
      overflow:      "hidden",
    }}>
      {/* ── Toolbar ── */}
      <div style={{
        height:       32,
        background:   "#191919",
        borderBottom: "1px solid #2a2a2a",
        display:      "flex",
        alignItems:   "center",
        padding:      "0 8px",
        gap:          6,
        flexShrink:   0,
      }}>
        <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Timeline
        </span>

        {/* Separator */}
        <div style={{ width: 1, height: 16, background: "#333", margin: "0 4px" }} />

        {/* Undo / Redo */}
        <ToolbarBtn title="Undo (Ctrl+Z)" onClick={handleUndo}>↩</ToolbarBtn>
        <ToolbarBtn title="Redo (Ctrl+Shift+Z)" onClick={handleRedo}>↪</ToolbarBtn>

        <div style={{ width: 1, height: 16, background: "#333", margin: "0 2px" }} />

        {/* Duration editor */}
        <span style={{ fontSize: 10, color: "#555" }}>Dur</span>
        <DurationInput
          value={totalFrames}
          fps={fps}
          onChange={(v) => setDurationOverride(activeCompId, v)}
        />

        <div style={{ flex: 1 }} />

        {/* Shortcut hints */}
        <span style={{ fontSize: 9, color: "#333" }}>
          <Kbd>C</Kbd>cut <Kbd>[</Kbd><Kbd>]</Kbd>trim <Kbd>M</Kbd>mute <Kbd>Del</Kbd>remove
        </span>

        <div style={{ width: 1, height: 16, background: "#333", margin: "0 4px" }} />

        {/* Zoom */}
        <span style={{ fontSize: 10, color: "#555" }}>Zoom</span>
        <ToolbarBtn onClick={() => setZoom(zoom / 1.3)}>−</ToolbarBtn>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#666", minWidth: 36, textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <ToolbarBtn onClick={() => setZoom(zoom * 1.3)}>+</ToolbarBtn>
        <ToolbarBtn onClick={() => setZoom(1)} wide>Fit</ToolbarBtn>
      </div>

      {/* ── Scrollable track area ── */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
        onDragOver={handleTimelineDragOver}
        onDragLeave={handleTimelineDragLeave}
        onDrop={handleTimelineDrop}
        style={{
          flex:      1,
          overflowX: "auto",
          overflowY: "auto",
          position:  "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", minWidth: totalW + LABEL_W }}>

          {/* ── Ruler ── */}
          <div style={{ display: "flex", flexShrink: 0 }}>
            <div style={{ width: LABEL_W, height: RULER_H, background: "#181818", borderRight: "1px solid #2a2a2a", flexShrink: 0 }} />
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Ruler
                timelineFrames={timelineFrames}
                compFrames={totalFrames}
                fps={fps} ppf={ppf} onSeek={seek}
              />
            </div>
          </div>

          {/* ── Sequence rows (read-only) ── */}
          {sequences.length > 0 ? (
            sequences.map((s) => (
              <TrackRow key={s.id} label={s.label} totalW={totalW} compEndX={compEndX} accent={s.color}>
                <SequenceBlock
                  label={s.label} color={s.color}
                  from={s.from} duration={s.durationInFrames}
                  ppf={ppf} onSeek={seek}
                />
              </TrackRow>
            ))
          ) : (
            <TrackRow label={comp?.label ?? "Sequence"} totalW={totalW} compEndX={compEndX} accent="#6366f1">
              <SequenceBlock
                label={comp?.label ?? ""} color="#6366f1"
                from={0} duration={totalFrames}
                ppf={ppf} onSeek={seek}
              />
            </TrackRow>
          )}

          {/* ── Cue bar row ── */}
          <div style={{ display: "flex", flexShrink: 0 }}>
            <div style={{
              width: LABEL_W, height: CUE_ROW_H, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0 8px",
              borderRight: "1px solid #2a2a2a", background: "#181818",
            }}>
              <span style={{
                fontSize: 9, color: "#f97316", fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Cues ({cues.length})
              </span>
              <button
                onClick={handleAddCue}
                title="Add cue at playhead"
                style={{
                  width: 16, height: 16, borderRadius: 3,
                  background: "#2a2200", border: "1px solid #f9731644",
                  color: "#f97316", fontSize: 12, lineHeight: 1,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0,
                }}
              >+</button>
            </div>
            <div style={{
              position: "relative", width: totalW, height: CUE_ROW_H, flexShrink: 0,
              background: "#1a1408",
              borderBottom: "1px solid #2a2200",
            }}>
              {/* Comp-end shading */}
              <div style={{
                position: "absolute", left: compEndX, top: 0,
                width: totalW - compEndX, height: "100%",
                background: "rgba(0,0,0,0.25)", pointerEvents: "none", zIndex: 1,
              }} />
              <div style={{
                position: "absolute", left: compEndX, top: 0,
                width: 1, height: "100%",
                background: "#ef444455", pointerEvents: "none", zIndex: 2,
              }} />
              {cues.map((cue) => (
                <CueBar
                  key={cue.id}
                  cue={cue}
                  ppf={ppf}
                  selected={selectedCueId === cue.id}
                  onSeek={seek}
                  onClick={(c) => { setSelectedCueId(c.id); setEditingCue(c); }}
                  onUpdate={handleCueUpdate}
                  onCommit={handleCueCommit}
                />
              ))}
            </div>
          </div>

          {/* ── Audio track rows ── */}
          {tracks.map((track, i) => (
            <TrackRow key={i} label={`Audio ${i + 1}`} totalW={totalW} compEndX={compEndX} accent="#10b981">
              <DraggableAudioBar
                track={track}
                total={timelineFrames}
                ppf={ppf}
                selected={editingTrackIdx === i}
                onSelect={() => setEditingTrackIdx(i)}
                onSeek={seek}
                onChange={(t) => handleTrackChange(i, t)}
                onCommit={(t) => handleTrackCommit(i, t)}
              />
            </TrackRow>
          ))}

          {/* Empty audio hint */}
          {tracks.length === 0 && (
            <div style={{ display: "flex", flexShrink: 0 }}>
              <div style={{ width: LABEL_W, height: TRACK_H, background: "#181818", borderRight: "1px solid #2a2a2a", flexShrink: 0 }} />
              <div style={{
                flex: 1, height: TRACK_H,
                display: "flex", alignItems: "center",
                padding: "0 12px", fontSize: 10, color: "#333", fontStyle: "italic",
              }}>
                Drag audio from the left panel onto the timeline
              </div>
            </div>
          )}

        </div>

        {/* ── Drop indicator ── */}
        {dropFrame !== null && (
          <div style={{
            position:      "absolute",
            top:           0,
            left:          LABEL_W + framesToPx(dropFrame, ppf),
            width:         2,
            height:        contentH,
            background:    "#0070f3",
            pointerEvents: "none",
            zIndex:        25,
            boxShadow:     "0 0 8px #0070f388",
          }}>
            <div style={{
              position:   "absolute",
              top:        2,
              left:       6,
              fontSize:   9,
              color:      "#60a5fa",
              fontFamily: "monospace",
              whiteSpace: "nowrap",
              background: "#0d1b2a",
              padding:    "1px 4px",
              borderRadius: 3,
              border:     "1px solid #0070f366",
            }}>
              f{dropFrame}
            </div>
          </div>
        )}

        {/* ── Draggable comp-end handle ── */}
        <div
          style={{
            position:      "absolute",
            top:           0,
            left:          LABEL_W + compEndX - 4,
            width:         8,
            height:        contentH,
            cursor:        "col-resize",
            zIndex:        20,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startDur = totalFrames;
            const onMove = (me: MouseEvent) => {
              const deltaF = pxToFrames(me.clientX - startX, ppf);
              setDurationOverride(activeCompId, Math.max(fps, startDur + deltaF));
            };
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          title={`Comp duration: ${totalFrames}f (${(totalFrames / fps).toFixed(1)}s) — drag to resize`}
        >
          <div style={{
            position: "absolute", left: 3, top: 0,
            width: 2, height: "100%",
            background: "#ef4444", opacity: 0.6,
          }} />
        </div>

        {/* ── Playhead overlay ── */}
        <div style={{
          position:      "absolute",
          top:           0,
          left:          LABEL_W,
          width:         totalW,
          height:        contentH,
          pointerEvents: "none",
        }}>
          <Playhead frame={frame} ppf={ppf} height={contentH} flash={cutFlash} />
        </div>
      </div>

      {/* ── Selected track editor bar ── */}
      {selectedTrack && (
        <SelectedTrackEditor
          track={selectedTrack}
          idx={editingTrackIdx}
          fps={fps}
          onFieldChange={updateSelectedField}
          onFieldsChange={updateSelectedFields}
          onDelete={handleDelete}
        />
      )}

      {/* ── Cue detail popup ── */}
      {editingCue && (
        <>
          <CuePopupBackdrop onClose={() => { setEditingCue(null); setSelectedCueId(null); }} />
          <CueDetailPopup
            cue={editingCue}
            fps={fps}
            profile={comp?.profile}
            onSave={handleSaveCueEdit}
            onDelete={(id) => { handleDeleteCue(id); setEditingCue(null); }}
            onClose={() => { setEditingCue(null); setSelectedCueId(null); }}
          />
        </>
      )}
    </div>
  );
};
