import React, {
  useRef, useCallback, useEffect, useState,
} from "react";
import { useStudio }        from "../store/useStudio";
import { getComp }          from "../registry";
import { saveAudioTracks }  from "../api";
import type { AudioTrack }  from "../types";

const TRACK_H    = 28;    // px per track row
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
        // Trim-in: move the start point.  endAt stays fixed.
        const minOffset = 0;
        const maxOffset = snap.endAt - 1;
        const newOffset    = Math.max(minOffset, Math.min(maxOffset, snap.offset + deltaF));
        const trimDelta    = newOffset - snap.offset;
        const newStartFrom = Math.max(0, snap.startFrom + trimDelta);
        onChange({ ...snap, offset: newOffset, startFrom: newStartFrom });

      } else {
        // Trim-out: move the end point.  offset stays fixed.
        const minEnd    = snap.offset + 1;
        const newEndAt  = Math.max(minEnd, Math.min(total, snap.endAt + deltaF));
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
        const newEndAt = Math.max(snap.offset + 1, Math.min(total, snap.endAt + deltaF));
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
    cursor:     "ew-resize",
    zIndex:     2,
    background: "transparent",
    // Visible accent stripe
    borderLeft: `2px solid ${selected ? "#10b981" : "#065f46"}`,
  };

  return (
    <div
      title={filename}
      style={{
        position:     "absolute",
        left:         offsetX,
        width:        w,
        top:          2,
        height:       TRACK_H - 4,
        background:   selected ? "#16524a" : "#0f3330",
        border:       `1px solid ${selected ? "#10b981" : "#065f46"}`,
        borderRadius: 3,
        userSelect:   "none",
        overflow:     "hidden",
        display:      "flex",
        alignItems:   "center",
        cursor:       "grab",
      }}
      onMouseDown={(e) => {
        // Middle of bar → move
        const localX = e.clientX - e.currentTarget.getBoundingClientRect().left;
        if (localX <= HANDLE_W) return; // handled by left handle
        if (localX >= w - HANDLE_W) return; // handled by right handle
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
      {/* Out-of-comp shading */}
      {compEndX !== undefined && (
        <div style={{
          position:      "absolute",
          left:          compEndX,
          top:           0,
          width:         totalW - compEndX,
          height:        "100%",
          background:    "rgba(0,0,0,0.25)",
          pointerEvents: "none",
          zIndex:        1,
        }} />
      )}
      {/* Comp-end boundary line */}
      {compEndX !== undefined && (
        <div style={{
          position:      "absolute",
          left:          compEndX,
          top:           0,
          width:         1,
          height:        "100%",
          background:    "#ef444455",
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

// ─── Main Timeline ─────────────────────────────────────────────────────────────
export const Timeline: React.FC = () => {
  const {
    activeCompId,
    frame, zoom, setZoom, setFrame,
    audioTracks, setAudioTracks,
    editingTrackIdx, setEditingTrackIdx,
  } = useStudio();

  const comp      = getComp(activeCompId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [contentH, setContentH] = useState(0);

  const tracks      = audioTracks[activeCompId] ?? [];
  const totalFrames = comp?.durationInFrames ?? 1;  // composition / export boundary
  const fps         = comp?.fps ?? 30;
  const sequences   = comp?.sequences ?? [];

  const ppf    = Math.max(MIN_PPF, 1.5 * zoom);

  // Timeline extends well beyond the comp boundary so audio clips can live
  // at their full file length.  The comp-end line marks the export boundary.
  const maxClipEnd     = tracks.reduce((m, t) => Math.max(m, t.endAt), 0);
  const timelineFrames = Math.max(totalFrames * 2, maxClipEnd + fps * 10);
  const totalW         = framesToPx(timelineFrames, ppf);
  const compEndX       = framesToPx(totalFrames, ppf);

  const seqRows    = Math.max(1, sequences.length);
  const trackAreaH = (seqRows + tracks.length + (tracks.length === 0 ? 1 : 0)) * TRACK_H;
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
    const next = tracks.map((t, i) => (i === idx ? updated : t));
    setAudioTracks(activeCompId, next);
    try { await saveAudioTracks(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, tracks, setAudioTracks]);

  // ── Cut at playhead (C) ───────────────────────────────────────────────────
  // Only cuts the SELECTED audio clip at the current playhead frame.
  // Does nothing if no audio clip is selected — click a clip first.
  // Sequences (composition code) are never affected.
  const [cutFlash, setCutFlash] = useState(false);

  const handleCut = useCallback(async () => {
    if (!activeCompId) return;

    // Require a selected audio track — no silent "cut everything"
    const idx = editingTrackIdx;
    if (idx < 0 || idx >= tracks.length) return;

    const t = tracks[idx];
    const f = frame;

    // Playhead must be strictly inside the clip to produce a valid split
    if (f <= t.offset || f >= t.endAt) return;

    const left:  AudioTrack = { ...t, endAt: f };
    const right: AudioTrack = { ...t, offset: f, startFrom: t.startFrom + (f - t.offset) };

    const next = [
      ...tracks.slice(0, idx),
      left,
      right,
      ...tracks.slice(idx + 1),
    ];

    setAudioTracks(activeCompId, next);
    // Keep focus on the left (earlier) half
    setEditingTrackIdx(idx);
    setCutFlash(true);
    setTimeout(() => setCutFlash(false), 200);
    try { await saveAudioTracks(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, tracks, frame, editingTrackIdx, setAudioTracks, setEditingTrackIdx]);

  // ── Delete selected track (Delete / Backspace) ────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!activeCompId || editingTrackIdx < 0 || editingTrackIdx >= tracks.length) return;
    const next = tracks.filter((_, i) => i !== editingTrackIdx);
    setAudioTracks(activeCompId, next);
    setEditingTrackIdx(Math.min(editingTrackIdx, next.length - 1));
    try { await saveAudioTracks(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, tracks, editingTrackIdx, setAudioTracks, setEditingTrackIdx]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "KeyC" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleCut();
      }
      if ((e.code === "Delete" || e.code === "Backspace") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleDelete();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleCut, handleDelete]);

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
        height:       30,
        background:   "#191919",
        borderBottom: "1px solid #2a2a2a",
        display:      "flex",
        alignItems:   "center",
        padding:      "0 12px",
        gap:          10,
        flexShrink:   0,
      }}>
        <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Timeline
        </span>
        <span style={{ fontSize: 10, color: "#383838", marginLeft: 6 }}>
          drag to reposition · drag edges to trim · <kbd style={{ background: "#252525", border: "1px solid #383838", borderRadius: 3, padding: "0 4px", fontFamily: "monospace", color: "#555" }}>C</kbd> cut · <kbd style={{ background: "#252525", border: "1px solid #383838", borderRadius: 3, padding: "0 4px", fontFamily: "monospace", color: "#555" }}>Del</kbd> delete
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: "#555" }}>Zoom</span>
        <button
          onClick={() => setZoom(zoom / 1.3)}
          style={{ background: "#222", border: "1px solid #333", color: "#888", width: 22, height: 22, borderRadius: 3, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
        >−</button>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#666", minWidth: 36, textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(zoom * 1.3)}
          style={{ background: "#222", border: "1px solid #333", color: "#888", width: 22, height: 22, borderRadius: 3, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
        >+</button>
        <button
          onClick={() => setZoom(1)}
          style={{ background: "#222", border: "1px solid #333", color: "#666", height: 22, padding: "0 8px", borderRadius: 3, cursor: "pointer", fontSize: 10 }}
        >Fit</button>
      </div>

      {/* ── Scrollable track area ── */}
      <div
        ref={scrollRef}
        onWheel={handleWheel}
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
                No audio tracks — click "+ Add" on an audio file to add one
              </div>
            </div>
          )}

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
    </div>
  );
};
