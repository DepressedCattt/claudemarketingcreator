import type React from "react";
export type { CueEvent, CueEventType, CueIntensity } from "@utils/cueTypes";

// ─── Composition registry ────────────────────────────────────────────────────

export type SequenceMeta = {
  id:               string;
  label:            string;
  from:             number;   // start frame (global, within composition)
  durationInFrames: number;
  color:            string;   // timeline clip colour
};

export type CompMeta = {
  id:               string;
  label:            string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component:        React.ComponentType<any>;
  durationInFrames: number;
  fps:              number;
  width:            number;
  height:           number;
  defaultProps:     Record<string, unknown>;
  format:           "9:16" | "1:1" | "16:9";
  sequences?:       SequenceMeta[];
  /** Optional animation cue sheet for music/SFX export. */
  cues?:            import("@utils/cueTypes").CueEvent[];
};

// ─── Audio ───────────────────────────────────────────────────────────────────

export type AudioFile = {
  name:      string;
  path:      string;
  size:      number;
  sizeHuman: string;
  modified:  string;
};

export type AudioTrack = {
  src:       string;
  startFrom: number;
  endAt:     number;
  offset:    number;
  volume:    number;
  loop:      boolean;
};

// ─── Studio state saved to disk ──────────────────────────────────────────────

export type StudioState = {
  audioTracks: Record<string, AudioTrack[]>;
};
