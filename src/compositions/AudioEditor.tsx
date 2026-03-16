/**
 * AudioEditor — Visual audio timeline editor + file importer.
 *
 * OPEN in Remotion Studio as "audio-editor".
 *
 * STEP 1 ─ Start the audio server in a separate terminal:
 *   npm run audio
 *
 * STEP 2 ─ Open "audio-editor" in Remotion Studio.
 *   The Import panel will appear and show your /public/audio/ files.
 *   Drag audio files onto the drop zone or click "Browse Files" to upload.
 *
 * STEP 3 ─ Click any file in the library to load it into the timeline.
 *   Then use the Props panel (top-right in Studio) to fine-tune startFrom,
 *   endAt, volume, offset.
 *
 * STEP 4 ─ Scrub/play to hear the audio in sync with your composition length.
 *
 * STEP 5 ─ Copy the Generated Config and paste into src/data/audioConfig.ts.
 *   Then add <AudioTrack compositionId="..." /> to your composition.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
} from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";

const SERVER = "http://localhost:3001";

// ─── Types ─────────────────────────────────────────────────────────────────
type AudioFile = {
  name: string;
  path: string;
  size: number;
  sizeHuman: string;
  modified: string;
};

type UploadStatus = "idle" | "uploading" | "success" | "error";

// ─── Color palette ──────────────────────────────────────────────────────────
const C = {
  bg:          "#08080E",
  surface:     "#0F0F1A",
  surfaceHigh: "#16162A",
  surfaceHov:  "#1E1E35",
  border:      "#252538",
  borderHov:   "#3A3A60",
  accent:      "#06B6D4",
  accentDim:   "#0891B2",
  accentGlow:  "#06B6D418",
  warn:        "#F59E0B",
  warnBg:      "#F59E0B10",
  ok:          "#10B981",
  okBg:        "#10B98110",
  err:         "#F43F5E",
  errBg:       "#F43F5E10",
  text:        "#F1F5F9",
  textSub:     "#94A3B8",
  textMuted:   "#475569",
  textDim:     "#1E293B",
  playhead:    "#F43F5E",
  trimIn:      "#10B981",
  trimOut:     "#F43F5E",
  waveform:    "#06B6D4",
  selected:    "#06B6D420",
  selectedBorder: "#06B6D460",
};

// ─── Editor props ────────────────────────────────────────────────────────────
export type AudioEditorProps = {
  compositionId:     string;
  audioSrc:          string;
  startFrom:         number;
  endAt:             number;
  offset:            number;
  volume:            number;
  loop:              boolean;
  compositionFrames: number;
  fps:               number;
};

export const AudioEditorDefaultProps: AudioEditorProps = {
  compositionId:     "forma2-v1",
  audioSrc:          "",
  startFrom:         0,
  endAt:             519,
  offset:            0,
  volume:            1.0,
  loop:              false,
  compositionFrames: 519,
  fps:               30,
};

// ─── Shared style helpers ────────────────────────────────────────────────────
const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace" };
const sans: React.CSSProperties = { fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" };

const sectionLabel = (text: string) => (
  <div style={{
    ...sans,
    fontSize: 10,
    color: C.textMuted,
    textTransform: "uppercase" as const,
    letterSpacing: "0.14em",
    marginBottom: 12,
  }}>
    {text}
  </div>
);

// ─── Sub-component: Header bar ───────────────────────────────────────────────
const Header: React.FC<{ compId: string; src: string; serverOk: boolean }> = ({
  compId, src, serverOk,
}) => (
  <div style={{
    position: "absolute",
    top: 0, left: 0, right: 0, height: 56,
    background: C.surface,
    borderBottom: `1px solid ${C.border}`,
    display: "flex", alignItems: "center",
    padding: "0 28px", gap: 20, zIndex: 20,
    ...sans,
  }}>
    <div style={{ ...mono, fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: "0.18em" }}>
      ◈ AUDIO EDITOR
    </div>

    <div style={{ width: 1, height: 24, background: C.border }} />

    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Comp</div>
      <div style={{
        background: C.accentGlow, border: `1px solid ${C.selectedBorder}`,
        borderRadius: 5, padding: "2px 9px",
        ...mono, fontSize: 11, color: C.accent,
      }}>
        {compId || "—"}
      </div>
    </div>

    {src && <>
      <div style={{ width: 1, height: 24, background: C.border }} />
      <div style={{ ...mono, fontSize: 11, color: C.textSub }}>
        {src.split("/").pop()}
      </div>
    </>}

    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: serverOk ? C.okBg : C.warnBg,
        border: `1px solid ${serverOk ? C.ok + "40" : C.warn + "40"}`,
        borderRadius: 20, padding: "3px 10px",
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: serverOk ? C.ok : C.warn,
        }} />
        <div style={{ fontSize: 10, color: serverOk ? C.ok : C.warn }}>
          {serverOk ? "Server online" : "Run: npm run audio"}
        </div>
      </div>
    </div>
  </div>
);

// ─── Sub-component: Drop zone + file browser ─────────────────────────────────
const ImportPanel: React.FC<{
  files: AudioFile[];
  uploading: boolean;
  uploadStatus: UploadStatus;
  uploadMsg: string;
  serverOk: boolean;
  activeFile: string;
  onUpload: (files: FileList) => void;
  onSelect: (file: AudioFile) => void;
  onDelete: (file: AudioFile) => void;
  onRefresh: () => void;
}> = ({
  files, uploading, uploadStatus, uploadMsg, serverOk,
  activeFile, onUpload, onSelect, onDelete, onRefresh,
}) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) onUpload(e.dataTransfer.files);
  }, [onUpload]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      {/* ─ Drop zone ─ */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => serverOk && inputRef.current?.click()}
        style={{
          width: 260, minHeight: 140,
          border: `2px dashed ${dragging ? C.accent : serverOk ? C.borderHov : C.border}`,
          borderRadius: 10,
          background: dragging ? C.accentGlow : C.surfaceHigh,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 10,
          cursor: serverOk ? "pointer" : "not-allowed",
          transition: "all 0.15s ease",
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.aac,.ogg,.flac,.m4a,.opus"
          multiple
          style={{ display: "none" }}
          onChange={(e) => e.target.files && onUpload(e.target.files)}
        />

        {uploading ? (
          <>
            <div style={{ fontSize: 28 }}>⏳</div>
            <div style={{ ...sans, fontSize: 12, color: C.textSub }}>Uploading...</div>
          </>
        ) : uploadStatus === "success" ? (
          <>
            <div style={{ fontSize: 28 }}>✓</div>
            <div style={{ ...sans, fontSize: 12, color: C.ok }}>{uploadMsg}</div>
          </>
        ) : uploadStatus === "error" ? (
          <>
            <div style={{ fontSize: 28 }}>✗</div>
            <div style={{ ...sans, fontSize: 11, color: C.err, textAlign: "center", padding: "0 16px" }}>{uploadMsg}</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 32, opacity: serverOk ? 1 : 0.3 }}>🎵</div>
            <div style={{ ...sans, fontSize: 12, color: serverOk ? C.textSub : C.textMuted, textAlign: "center", lineHeight: 1.5, padding: "0 12px" }}>
              {serverOk
                ? "Drag & drop audio here\nor click to browse"
                : "Start the audio server\nnpm run audio"}
            </div>
            {serverOk && (
              <div style={{ ...sans, fontSize: 10, color: C.textMuted }}>
                MP3, WAV, AAC, OGG, FLAC, M4A
              </div>
            )}
          </>
        )}
      </div>

      {/* ─ File library ─ */}
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 8 }}>
          <div style={{ ...sans, fontSize: 10, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Library ({files.length})
          </div>
          <button
            onClick={onRefresh}
            style={{
              marginLeft: "auto",
              background: "none", border: `1px solid ${C.border}`,
              borderRadius: 4, padding: "2px 8px",
              ...sans, fontSize: 10, color: C.textMuted,
              cursor: "pointer",
            }}
          >
            ↺ Refresh
          </button>
        </div>

        {files.length === 0 ? (
          <div style={{
            padding: 20, borderRadius: 8,
            border: `1px dashed ${C.border}`,
            background: C.surfaceHigh,
            ...sans, fontSize: 12, color: C.textMuted,
            textAlign: "center",
          }}>
            {serverOk ? "No audio files yet — drag one in to get started" : "Audio server not running"}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {files.map((f) => {
              const isActive = activeFile === f.path;
              return (
                <div
                  key={f.name}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 7,
                    background: isActive ? C.selected : C.surfaceHigh,
                    border: `1px solid ${isActive ? C.selectedBorder : C.border}`,
                    cursor: "pointer",
                    transition: "all 0.1s ease",
                  }}
                  onClick={() => onSelect(f)}
                >
                  <div style={{ fontSize: 14 }}>🎵</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ ...mono, fontSize: 11, color: isActive ? C.accent : C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </div>
                    <div style={{ ...sans, fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                      {f.sizeHuman}
                    </div>
                  </div>
                  {isActive && (
                    <div style={{
                      ...sans, fontSize: 9, color: C.accent,
                      background: C.accentGlow, border: `1px solid ${C.selectedBorder}`,
                      borderRadius: 3, padding: "2px 6px",
                    }}>
                      LOADED
                    </div>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(f); }}
                    style={{
                      background: "none", border: "none",
                      color: C.textMuted, cursor: "pointer",
                      fontSize: 13, padding: "0 2px",
                      lineHeight: 1,
                    }}
                    title="Delete file"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Sub-component: Frame ruler ──────────────────────────────────────────────
const Ruler: React.FC<{ totalFrames: number; fps: number; width: number }> = ({
  totalFrames, fps, width,
}) => {
  const ticks = Math.floor(totalFrames / fps);
  return (
    <div style={{ position: "relative", height: 26 }}>
      <div style={{ position: "absolute", inset: 0, background: C.surface, borderBottom: `1px solid ${C.border}` }} />
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const frame = i * fps;
        const x = (frame / totalFrames) * width;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: x, top: 14, width: 1, height: 6, background: C.textDim }} />
            <div style={{ position: "absolute", left: x + 3, top: 7, ...mono, fontSize: 9, color: C.textMuted, whiteSpace: "nowrap" }}>
              {i}s
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Sub-component: Waveform display ─────────────────────────────────────────
// Inner component — only mounted when src is a non-empty string so that
// useAudioData is always called with a valid argument (no conditional hook).
const WaveformWithData: React.FC<{
  src: string; fps: number; totalFrames: number;
  width: number; height: number;
  startFrom: number; endAt: number; offset: number;
}> = ({ src, fps, totalFrames, width, height, startFrom, endAt, offset }) => {
  const audioData = useAudioData(src);
  const frame     = useCurrentFrame();

  // Downsampled static waveform
  const bars = React.useMemo(() => {
    if (!audioData?.channelWaveforms?.length) return null;
    const raw    = audioData.channelWaveforms[0];
    const n      = 500;
    const block  = Math.floor(raw.length / n);
    const result: number[] = [];
    for (let i = 0; i < n; i++) {
      let max = 0;
      for (let j = 0; j < block; j++) {
        const v = Math.abs(raw[i * block + j] || 0);
        if (v > max) max = v;
      }
      result.push(max);
    }
    return result;
  }, [audioData]);

  // Live frequency bars
  const live = (audioData && src)
    ? visualizeAudio({ fps, frame, audioData, numberOfSamples: 40 })
    : null;

  const offsetX   = (offset / totalFrames) * width;
  const endAtX    = (Math.min(endAt, totalFrames) / totalFrames) * width;
  const playheadX = (frame / totalFrames) * width;
  const isPlaying = frame >= offset && frame <= endAt;

  if (!audioData) {
    return (
      <div style={{
        width, height, borderRadius: 8,
        background: C.surfaceHigh, border: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        ...sans, fontSize: 12, color: C.textMuted,
      }}>
        Loading waveform…
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width, height, borderRadius: 8, overflow: "hidden" }}>
      {/* Track BG */}
      <div style={{ position: "absolute", inset: 0, background: C.surfaceHigh, border: `1px solid ${C.border}`, borderRadius: 8 }} />

      {/* Inactive regions */}
      <div style={{ position: "absolute", top: 0, left: 0, width: offsetX, height, background: "rgba(0,0,0,0.45)", zIndex: 1 }} />
      <div style={{ position: "absolute", top: 0, left: endAtX, right: 0, height, background: "rgba(0,0,0,0.45)", zIndex: 1 }} />

      {/* Active region tint */}
      <div style={{ position: "absolute", top: 0, left: offsetX, width: endAtX - offsetX, height, background: `${C.accent}07`, zIndex: 1 }} />

      {/* Waveform bars */}
      {bars && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 0.5, padding: "0 2px", zIndex: 2 }}>
          {bars.map((amp, i) => {
            const px = (i / bars.length) * width;
            const active = px >= offsetX && px <= endAtX;
            const barH = Math.max(2, amp * height * 0.88);
            return (
              <div key={i} style={{
                width: Math.max(1, (width / bars.length) - 0.5),
                height: barH,
                background: active ? C.waveform : C.textMuted,
                borderRadius: 1,
                opacity: active ? 0.8 : 0.2,
              }} />
            );
          })}
        </div>
      )}

      {/* Trim IN marker */}
      <div style={{ position: "absolute", top: 0, left: offsetX, width: 2, height, background: C.trimIn, zIndex: 4 }} />
      <div style={{ position: "absolute", top: 4, left: offsetX + 5, ...mono, fontSize: 9, color: C.trimIn, fontWeight: 700, zIndex: 5, background: `${C.bg}CC`, padding: "1px 4px", borderRadius: 3 }}>
        IN f{offset}
      </div>

      {/* Trim OUT marker */}
      <div style={{ position: "absolute", top: 0, left: endAtX - 1, width: 2, height, background: C.trimOut, zIndex: 4 }} />
      <div style={{ position: "absolute", top: 4, left: endAtX - 54, ...mono, fontSize: 9, color: C.trimOut, fontWeight: 700, zIndex: 5, background: `${C.bg}CC`, padding: "1px 4px", borderRadius: 3 }}>
        OUT f{endAt}
      </div>

      {/* startFrom marker (offset INTO audio file) */}
      {startFrom > 0 && (
        <div style={{ position: "absolute", top: 0, left: offsetX + 2, width: 1, height, background: C.warn, opacity: 0.5, zIndex: 3 }} />
      )}

      {/* Playhead */}
      <div style={{
        position: "absolute", top: 0, left: playheadX, width: 1.5, height,
        background: C.playhead, zIndex: 6,
        boxShadow: `0 0 8px ${C.playhead}88`,
      }} />

      {/* Live frequency strip */}
      {live && isPlaying && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, width, height: 22,
          display: "flex", alignItems: "flex-end", gap: 1, padding: "0 2px",
          zIndex: 7,
          background: `linear-gradient(transparent, ${C.bg}BB)`,
        }}>
          {live.map((amp, i) => (
            <div key={i} style={{
              flex: 1, height: Math.max(1, amp * 20),
              background: C.accent, borderRadius: "1px 1px 0 0", opacity: 0.9,
            }} />
          ))}
        </div>
      )}
    </div>
  );
};

// Outer wrapper — handles the empty-src case without violating hook rules
const WaveformDisplay: React.FC<{
  src: string; fps: number; totalFrames: number;
  width: number; height: number;
  startFrom: number; endAt: number; offset: number;
}> = (props) => {
  if (!props.src) {
    return (
      <div style={{
        width: props.width, height: props.height, borderRadius: 8,
        border: `1px dashed ${C.border}`,
        background: C.surfaceHigh,
        display: "flex", alignItems: "center", justifyContent: "center",
        ...sans, fontSize: 12, color: C.textDim, fontStyle: "italic",
      }}>
        Select a file from the library to load it into the timeline
      </div>
    );
  }
  return <WaveformWithData {...props} />;
};

// ─── Sub-component: Config output ────────────────────────────────────────────
const ConfigOutput: React.FC<AudioEditorProps & { copied: boolean; onCopy: () => void }> = (props) => {
  const { compositionId, audioSrc, startFrom, endAt, offset, volume, loop, fps, copied, onCopy } = props;
  const durationSec = ((endAt - offset) / fps).toFixed(2);

  const cfgObj = { src: audioSrc, startFrom, endAt, offset, volume, loop };
  const json = JSON.stringify(cfgObj, null, 2);
  const full = `"${compositionId}": [\n  ${json.replace(/\n/g, "\n  ")}\n],`;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`,
      borderRadius: 10, padding: 20,
    }}>
      {sectionLabel("Generated Config — paste into src/data/audioConfig.ts")}

      <div style={{ position: "relative" }}>
        {/* JSON block */}
        <div style={{
          background: C.bg, border: `1px solid ${C.border}`,
          borderRadius: 7, padding: "14px 16px",
          ...mono, fontSize: 11, color: C.text,
          lineHeight: 1.75, whiteSpace: "pre",
          overflowX: "auto",
        }}>
          {full}
        </div>

        {/* Copy button */}
        <button
          onClick={onCopy}
          style={{
            position: "absolute", top: 8, right: 8,
            background: copied ? C.okBg : C.surfaceHov,
            border: `1px solid ${copied ? C.ok + "50" : C.border}`,
            borderRadius: 5, padding: "4px 12px",
            ...sans, fontSize: 10, color: copied ? C.ok : C.textSub,
            cursor: "pointer",
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {[
          ["Duration", `${durationSec}s`],
          ["Audio IN", `f${startFrom}`],
          ["Comp offset", `f${offset}`],
          ["Volume", `${Math.round(volume * 100)}%`],
          ["Loop", loop ? "Yes" : "No"],
        ].map(([label, val]) => (
          <div key={label} style={{
            background: C.surfaceHigh, border: `1px solid ${C.border}`,
            borderRadius: 5, padding: "4px 10px",
            display: "flex", gap: 6, alignItems: "center",
          }}>
            <span style={{ ...sans, fontSize: 10, color: C.textMuted }}>{label}</span>
            <span style={{ ...mono, fontSize: 11, color: C.text }}>{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main composition ─────────────────────────────────────────────────────────
export const AudioEditor: React.FC<AudioEditorProps> = (props) => {
  const {
    compositionId, audioSrc, startFrom, endAt,
    offset, volume, loop, compositionFrames, fps,
  } = props;

  const { width } = useVideoConfig();
  const frame = useCurrentFrame();

  // ── Server state
  const [serverOk,     setServerOk]     = useState(false);
  const [files,        setFiles]        = useState<AudioFile[]>([]);
  const [activeFile,   setActiveFile]   = useState(audioSrc);
  const [uploading,    setUploading]    = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadMsg,    setUploadMsg]    = useState("");
  const [copied,       setCopied]       = useState(false);

  const HEADER_H  = 56;
  const PAD       = 24;
  const TL_WIDTH  = width - PAD * 2;

  // ── Poll server health & file list
  const refresh = useCallback(async () => {
    try {
      const r = await fetch(`${SERVER}/health`, { signal: AbortSignal.timeout(2000) });
      if (r.ok) {
        setServerOk(true);
        const fr = await fetch(`${SERVER}/files`);
        if (fr.ok) setFiles(await fr.json());
      }
    } catch {
      setServerOk(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, [refresh]);

  // ── Upload handler
  const handleUpload = useCallback(async (fileList: FileList) => {
    if (!serverOk) return;
    setUploading(true);
    setUploadStatus("idle");

    const formData = new FormData();
    Array.from(fileList).forEach((f) => formData.append("file", f));

    try {
      const r    = await fetch(`${SERVER}/upload`, { method: "POST", body: formData });
      const data = await r.json();
      if (r.ok && data.uploaded?.length > 0) {
        setUploadStatus("success");
        setUploadMsg(`✓ Imported: ${data.uploaded.map((u: { name: string }) => u.name).join(", ")}`);
        setFiles(data.files);
        // Auto-select the first uploaded file
        if (data.uploaded[0]) setActiveFile(data.uploaded[0].path);
      } else {
        setUploadStatus("error");
        setUploadMsg(data.error || "Upload failed");
      }
    } catch (err) {
      setUploadStatus("error");
      setUploadMsg("Could not reach audio server. Is npm run audio running?");
    }

    setUploading(false);
    setTimeout(() => setUploadStatus("idle"), 4000);
  }, [serverOk]);

  // ── Delete handler
  const handleDelete = useCallback(async (file: AudioFile) => {
    try {
      const r    = await fetch(`${SERVER}/files/${encodeURIComponent(file.name)}`, { method: "DELETE" });
      const data = await r.json();
      if (r.ok) {
        setFiles(data.files);
        if (activeFile === file.path) setActiveFile("");
      }
    } catch {}
  }, [activeFile]);

  // ── Copy config
  const handleCopy = useCallback(() => {
    const cfgObj = { src: activeFile || audioSrc, startFrom, endAt, offset, volume, loop };
    const json = JSON.stringify(cfgObj, null, 2);
    const full = `"${compositionId}": [\n  ${json.replace(/\n/g, "\n  ")}\n],`;
    navigator.clipboard?.writeText(full).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, [activeFile, audioSrc, startFrom, endAt, offset, volume, loop, compositionId]);

  const liveAudioSrc = activeFile || audioSrc;

  return (
    <AbsoluteFill style={{ background: C.bg, ...sans }}>

      {/* ── Live audio playback ── */}
      {liveAudioSrc && (
        <Sequence from={offset} layout="none">
          <Audio
            src={liveAudioSrc}
            startFrom={startFrom}
            endAt={endAt}
            volume={volume}
            loop={loop}
          />
        </Sequence>
      )}

      {/* ── Header ── */}
      <Header compId={compositionId} src={liveAudioSrc} serverOk={serverOk} />

      {/* ── Scrollable content ── */}
      <div style={{
        position: "absolute",
        top: HEADER_H, left: 0, right: 0, bottom: 0,
        overflowY: "auto",
        padding: PAD,
        display: "flex", flexDirection: "column", gap: 24,
      }}>

        {/* ══ SECTION: Import ══════════════════════════════════════════════ */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: 20,
        }}>
          {sectionLabel("Import Audio")}
          <ImportPanel
            files={files}
            uploading={uploading}
            uploadStatus={uploadStatus}
            uploadMsg={uploadMsg}
            serverOk={serverOk}
            activeFile={liveAudioSrc}
            onUpload={handleUpload}
            onSelect={(f) => setActiveFile(f.path)}
            onDelete={handleDelete}
            onRefresh={refresh}
          />
        </div>

        {/* ══ SECTION: Timeline ════════════════════════════════════════════ */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12, gap: 10 }}>
            {sectionLabel("Timeline")}
            <div style={{ flex: 1 }} />
            {/* Playhead readout */}
            <div style={{
              ...mono, fontSize: 11,
              color: (frame >= offset && frame <= endAt) ? C.accent : C.textMuted,
              background: C.surfaceHigh, border: `1px solid ${C.border}`,
              borderRadius: 4, padding: "3px 10px",
            }}>
              ▶ f{frame} / {(frame / fps).toFixed(2)}s
              {frame >= offset && frame <= endAt && (
                <span style={{ marginLeft: 8, color: C.ok }}>● playing</span>
              )}
            </div>
          </div>

          {/* Track row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 5,
              background: C.accentGlow, border: `1px solid ${C.selectedBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13,
            }}>🎵</div>
            <div style={{ ...mono, fontSize: 11, color: C.textSub }}>
              {liveAudioSrc ? liveAudioSrc.split("/").pop() : "Audio Track 1"}
            </div>
            <div style={{ marginLeft: "auto", ...sans, fontSize: 10, color: C.textMuted }}>
              Vol {Math.round(volume * 100)}%
            </div>
          </div>

          <Ruler totalFrames={compositionFrames} fps={fps} width={TL_WIDTH} />

          <div style={{ marginTop: 4 }}>
            <WaveformDisplay
              src={liveAudioSrc}
              fps={fps}
              totalFrames={compositionFrames}
              width={TL_WIDTH}
              height={100}
              startFrom={startFrom}
              endAt={endAt}
              offset={offset}
            />
          </div>

          {/* Props hint */}
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: C.warnBg, border: `1px solid ${C.warn}30`,
            borderRadius: 6, ...sans, fontSize: 11, color: C.warn, lineHeight: 1.6,
          }}>
            <strong>To adjust trim / sync:</strong> open the <strong>Props panel</strong> (↗ top-right in Studio)
            and change <code style={mono}>startFrom</code>, <code style={mono}>endAt</code>, <code style={mono}>offset</code>, or <code style={mono}>volume</code>.
            Scrub the playhead to hear the result in real time.
          </div>
        </div>

        {/* ══ SECTION: Config output ═══════════════════════════════════════ */}
        <ConfigOutput
          {...props}
          audioSrc={liveAudioSrc}
          copied={copied}
          onCopy={handleCopy}
        />

        {/* ══ SECTION: Props reference ══════════════════════════════════════ */}
        <div style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 10, padding: 20,
        }}>
          {sectionLabel("Props Reference")}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {([
              ["compositionId",     "ID of the composition this audio belongs to (e.g. forma2-v1)"],
              ["audioSrc",          "Path to audio — e.g. /audio/beat.mp3  (or click a file above)"],
              ["startFrom",         "Frame offset INTO the audio file — skips that many frames of audio"],
              ["endAt",             "Frame in the COMPOSITION where the audio stops"],
              ["offset",            "Frame in the COMPOSITION where the audio starts playing"],
              ["volume",            "0.0 – 1.0   (supports per-frame keyframing in audioConfig.ts)"],
              ["loop",              "Repeat the audio if it ends before the composition does"],
              ["compositionFrames", "Total frame count of the target composition"],
            ] as [string, string][]).map(([prop, desc]) => (
              <div key={prop} style={{ display: "flex", gap: 12, padding: "5px 0", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ ...mono, fontSize: 11, color: C.accent, width: 160, flexShrink: 0 }}>{prop}</div>
                <div style={{ ...sans, fontSize: 11, color: C.textSub, lineHeight: 1.5 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>
    </AbsoluteFill>
  );
};
