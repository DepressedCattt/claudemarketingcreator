import { create } from "zustand";
import type { AudioFile, AudioTrack } from "../types";

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
}

export const useStudio = create<StudioStore>((set) => ({
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
}));
