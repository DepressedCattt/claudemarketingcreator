import { create } from "zustand";
import type { AudioFile, AudioTrack, CueEvent } from "../types";

/** Maps "TYPE:intensity" → public file path */
export type SfxMap = Record<string, string>;

const MAX_UNDO = 50;

interface StudioStore {
  // Active composition
  activeCompId:    string;
  setActiveCompId: (id: string) => void;

  // Playback (mirrored from the Player ref)
  frame:      number;
  setFrame:   (f: number) => void;
  playing:    boolean;
  setPlaying: (p: boolean) => void;

  // Timeline view
  zoom:    number;
  setZoom: (z: number) => void;

  // Audio library
  audioFiles:    AudioFile[];
  setAudioFiles: (files: AudioFile[]) => void;
  serverOnline:    boolean;
  setServerOnline: (ok: boolean) => void;

  // Per-composition audio tracks (loaded from API / edited in the studio)
  audioTracks:    Record<string, AudioTrack[]>;
  setAudioTracks: (compId: string, tracks: AudioTrack[]) => void;

  // Which audio track is being edited (index into audioTracks[activeCompId])
  editingTrackIdx:    number;
  setEditingTrackIdx: (i: number) => void;

  // ── Undo / Redo ──
  undoStack:  Record<string, AudioTrack[][]>;
  redoStack:  Record<string, AudioTrack[][]>;
  pushUndo:   (compId: string) => void;
  undo:       (compId: string) => void;
  redo:       (compId: string) => void;

  // ── Clipboard ──
  clipboard:    AudioTrack | null;
  setClipboard: (t: AudioTrack | null) => void;

  // ── Composition duration overrides (runtime, not persisted to registry) ──
  durationOverrides:    Record<string, number>;
  setDurationOverride:  (compId: string, frames: number) => void;

  // Cue sheets (per-composition, loaded from API / registry seed)
  cues:    Record<string, CueEvent[]>;
  setCues: (compId: string, cues: CueEvent[]) => void;

  // SFX preview
  sfxEnabled:    boolean;
  setSfxEnabled: (on: boolean) => void;
  sfxMap:        SfxMap;
  setSfxMap:     (map: SfxMap) => void;
  sfxVolume:     number;
  setSfxVolume:  (v: number) => void;
}

export const useStudio = create<StudioStore>((set, get) => ({
  activeCompId:    "forma2-v1",
  setActiveCompId: (id) => set({ activeCompId: id, frame: 0, playing: false }),

  frame:      0,
  setFrame:   (frame) => set({ frame }),
  playing:    false,
  setPlaying: (playing) => set({ playing }),

  zoom:    1,
  setZoom: (zoom) => set({ zoom: Math.max(0.2, Math.min(zoom, 8)) }),

  audioFiles:    [],
  setAudioFiles: (audioFiles) => set({ audioFiles }),
  serverOnline:    false,
  setServerOnline: (serverOnline) => set({ serverOnline }),

  audioTracks:    {},
  setAudioTracks: (compId, tracks) =>
    set((s) => ({ audioTracks: { ...s.audioTracks, [compId]: tracks } })),

  editingTrackIdx:    0,
  setEditingTrackIdx: (i) => set({ editingTrackIdx: i }),

  // ── Undo / Redo ──────────────────────────────────────────────────────────
  undoStack: {},
  redoStack: {},

  pushUndo: (compId) => {
    const s = get();
    const current = s.audioTracks[compId] ?? [];
    const stack = s.undoStack[compId] ?? [];
    const trimmed = stack.length >= MAX_UNDO ? stack.slice(1) : stack;
    set({
      undoStack: { ...s.undoStack, [compId]: [...trimmed, current.map(t => ({ ...t }))] },
      redoStack: { ...s.redoStack, [compId]: [] },
    });
  },

  undo: (compId) => {
    const s = get();
    const uStack = s.undoStack[compId] ?? [];
    if (uStack.length === 0) return;
    const current = s.audioTracks[compId] ?? [];
    const prev = uStack[uStack.length - 1];
    set({
      audioTracks: { ...s.audioTracks, [compId]: prev },
      undoStack:   { ...s.undoStack, [compId]: uStack.slice(0, -1) },
      redoStack:   { ...s.redoStack, [compId]: [...(s.redoStack[compId] ?? []), current] },
    });
  },

  redo: (compId) => {
    const s = get();
    const rStack = s.redoStack[compId] ?? [];
    if (rStack.length === 0) return;
    const current = s.audioTracks[compId] ?? [];
    const next = rStack[rStack.length - 1];
    set({
      audioTracks: { ...s.audioTracks, [compId]: next },
      redoStack:   { ...s.redoStack, [compId]: rStack.slice(0, -1) },
      undoStack:   { ...s.undoStack, [compId]: [...(s.undoStack[compId] ?? []), current] },
    });
  },

  // ── Clipboard ────────────────────────────────────────────────────────────
  clipboard:    null,
  setClipboard: (clipboard) => set({ clipboard }),

  // ── Duration overrides ───────────────────────────────────────────────────
  durationOverrides: {},
  setDurationOverride: (compId, frames) =>
    set((s) => ({ durationOverrides: { ...s.durationOverrides, [compId]: Math.max(1, Math.round(frames)) } })),

  cues:    {},
  setCues: (compId, cues) =>
    set((s) => ({ cues: { ...s.cues, [compId]: cues } })),

  sfxEnabled:    false,
  setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
  sfxMap:        {},
  setSfxMap:     (sfxMap) => set({ sfxMap }),
  sfxVolume:     0.8,
  setSfxVolume:  (sfxVolume) => set({ sfxVolume }),
}));
