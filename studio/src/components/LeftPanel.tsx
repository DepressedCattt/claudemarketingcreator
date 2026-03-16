import React, { useState, useRef, useCallback } from "react";
import { useStudio }                            from "../store/useStudio";
import { REGISTRY }                             from "../registry";
import { uploadAudioFiles, deleteAudioFile, saveAudioTracks } from "../api";
import type { AudioFile }                       from "../types";

type Tab = "comps" | "audio";

const FORMAT_COLORS: Record<string, string> = {
  "9:16": "#8b5cf6",
  "1:1":  "#0ea5e9",
  "16:9": "#10b981",
};

// ─── Composition list ─────────────────────────────────────────────────────────
const CompList: React.FC = () => {
  const { activeCompId, setActiveCompId } = useStudio();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "8px 8px" }}>
      {REGISTRY.map((c) => {
        const active = c.id === activeCompId;
        const durationSec = (c.durationInFrames / c.fps).toFixed(1);
        return (
          <div
            key={c.id}
            onClick={() => setActiveCompId(c.id)}
            style={{
              padding:      "7px 10px",
              borderRadius: 5,
              background:   active ? "#1e3a5f" : "transparent",
              border:       `1px solid ${active ? "#0070f3" : "transparent"}`,
              cursor:       "pointer",
              transition:   "background 0.1s",
            }}
            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#222"; }}
            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {/* Format badge */}
              <div style={{
                fontSize:     9,
                fontWeight:   700,
                color:        FORMAT_COLORS[c.format] ?? "#888",
                background:   `${FORMAT_COLORS[c.format] ?? "#888"}18`,
                border:       `1px solid ${FORMAT_COLORS[c.format] ?? "#888"}33`,
                borderRadius: 3,
                padding:      "1px 5px",
                letterSpacing: "0.05em",
              }}>
                {c.format}
              </div>
              <span style={{
                fontSize:   12,
                color:      active ? "#fff" : "#ccc",
                fontWeight: active ? 500 : 400,
              }}>
                {c.label}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "#555" }}>
                {durationSec}s
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Audio library ────────────────────────────────────────────────────────────
const AudioLibrary: React.FC = () => {
  const { audioFiles, setAudioFiles, serverOnline, activeCompId, audioTracks, setAudioTracks } = useStudio();
  const [dragging,   setDragging]   = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [statusMsg,  setStatusMsg]  = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const toast = (msg: string, ms = 3000) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), ms);
  };

  const doUpload = useCallback(async (files: FileList) => {
    if (!serverOnline || files.length === 0) return;
    setUploading(true);
    try {
      const res = await uploadAudioFiles(files);
      setAudioFiles(res.files);
      toast(`✓ Imported ${res.uploaded.length} file(s)`);
    } catch {
      toast("✗ Upload failed — is npm run studio running?");
    }
    setUploading(false);
  }, [serverOnline, setAudioFiles]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) doUpload(e.dataTransfer.files);
  }, [doUpload]);

  const handleDelete = useCallback(async (file: AudioFile) => {
    try {
      const updated = await deleteAudioFile(file.name);
      setAudioFiles(updated);
      // Remove from any composition that references this file
      const newTracks = { ...audioTracks };
      Object.keys(newTracks).forEach((id) => {
        newTracks[id] = newTracks[id].filter((t) => t.src !== file.path);
      });
      Object.entries(newTracks).forEach(([id, tracks]) => setAudioTracks(id, tracks));
    } catch { /* ignore */ }
  }, [audioTracks, setAudioFiles, setAudioTracks]);

  // Add audio file to the active composition's track list.
  // We detect the real audio duration via the HTML5 Audio API so the clip
  // spans the full file (not just the composition length).  The comp-end
  // marker on the timeline shows the export boundary.
  const addToComp = useCallback((file: AudioFile) => {
    const comp = REGISTRY.find((c) => c.id === activeCompId);
    if (!comp) return;
    const existing = audioTracks[activeCompId] ?? [];

    // Placeholder endAt while we detect the real duration (5 min @ comp fps)
    const placeholderEnd = comp.fps * 60 * 5;
    const track = {
      src:       file.path,
      startFrom: 0,
      endAt:     placeholderEnd,
      offset:    0,
      volume:    1.0,
      loop:      false,
    };
    const withNew = [...existing, track];
    setAudioTracks(activeCompId, withNew);
    toast(`✓ Added to ${comp.label}`);

    // Async: update endAt to actual file duration once metadata loads
    const audio = new window.Audio(file.path);
    audio.addEventListener("loadedmetadata", async () => {
      const durationFrames = Math.ceil(audio.duration * comp.fps);
      // Replace the track we just added (last item) with real endAt
      const updated = withNew.map((t, i) =>
        i === withNew.length - 1 ? { ...t, endAt: durationFrames } : t
      );
      setAudioTracks(activeCompId, updated);
      try { await saveAudioTracks(activeCompId, updated); } catch { /* offline */ }
    }, { once: true });
  }, [activeCompId, audioTracks, setAudioTracks]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onClick={() => serverOnline && inputRef.current?.click()}
        style={{
          margin:       "8px",
          height:       76,
          borderRadius: 6,
          border:       `2px dashed ${dragging ? "#0070f3" : serverOnline ? "#333" : "#252525"}`,
          background:   dragging ? "#0070f318" : "#181818",
          display:      "flex",
          flexDirection: "column",
          alignItems:   "center",
          justifyContent: "center",
          gap:          4,
          cursor:       serverOnline ? "pointer" : "default",
          transition:   "all 0.15s",
          flexShrink:   0,
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.aac,.ogg,.flac,.m4a"
          multiple
          style={{ display: "none" }}
          onChange={(e) => e.target.files && doUpload(e.target.files)}
        />
        {uploading ? (
          <span style={{ fontSize: 11, color: "#888" }}>Uploading…</span>
        ) : (
          <>
            <span style={{ fontSize: 16, opacity: serverOnline ? 0.9 : 0.3 }}>🎵</span>
            <span style={{ fontSize: 11, color: serverOnline ? "#777" : "#444", textAlign: "center" }}>
              {serverOnline ? "Drop audio or click to browse" : "Run: npm run studio"}
            </span>
          </>
        )}
      </div>

      {/* Status toast */}
      {statusMsg && (
        <div style={{
          margin:     "0 8px 4px",
          padding:    "5px 10px",
          borderRadius: 4,
          background: statusMsg.startsWith("✓") ? "#064e3b" : "#450a0a",
          fontSize:   11,
          color:      statusMsg.startsWith("✓") ? "#6ee7b7" : "#fca5a5",
        }}>
          {statusMsg}
        </div>
      )}

      {/* File list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px" }}>
        {audioFiles.length === 0 ? (
          <div style={{ padding: "16px 8px", textAlign: "center", color: "#444", fontSize: 11 }}>
            {serverOnline ? "No audio files yet" : "Audio server offline"}
          </div>
        ) : (
          audioFiles.map((f) => (
            <div
              key={f.name}
              style={{
                display:      "flex",
                alignItems:   "center",
                gap:          8,
                padding:      "6px 8px",
                borderRadius: 4,
                marginBottom: 2,
                background:   "#181818",
                border:       "1px solid #262626",
              }}
            >
              <span style={{ fontSize: 13, flexShrink: 0 }}>🎵</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize:     11,
                  color:        "#ccc",
                  fontFamily:   "monospace",
                  overflow:     "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace:   "nowrap",
                }}>
                  {f.name}
                </div>
                <div style={{ fontSize: 10, color: "#555" }}>{f.sizeHuman}</div>
              </div>
              {/* Add to comp */}
              <button
                onClick={() => addToComp(f)}
                title="Add to active composition"
                style={{
                  background:   "#1e3a5f",
                  border:       "1px solid #0070f3",
                  borderRadius: 3,
                  color:        "#60a5fa",
                  fontSize:     10,
                  padding:      "2px 6px",
                  cursor:       "pointer",
                  flexShrink:   0,
                }}
              >
                + Add
              </button>
              {/* Delete */}
              <button
                onClick={() => handleDelete(f)}
                style={{
                  background: "transparent",
                  border:     "none",
                  color:      "#555",
                  fontSize:   12,
                  padding:    "2px",
                  cursor:     "pointer",
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Left panel ───────────────────────────────────────────────────────────────
export const LeftPanel: React.FC = () => {
  const [tab, setTab] = useState<Tab>("comps");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#161616" }}>
      {/* Tab bar */}
      <div style={{
        display:       "flex",
        borderBottom:  "1px solid #2a2a2a",
        flexShrink:    0,
      }}>
        {(["comps", "audio"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex:        1,
              height:      34,
              background:  "transparent",
              border:      "none",
              borderBottom: tab === t ? "2px solid #0070f3" : "2px solid transparent",
              color:        tab === t ? "#fff" : "#666",
              fontSize:     11,
              fontWeight:   tab === t ? 600 : 400,
              cursor:       "pointer",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {t === "comps" ? "Compositions" : "Audio"}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "comps" ? <CompList /> : <AudioLibrary />}
      </div>
    </div>
  );
};
