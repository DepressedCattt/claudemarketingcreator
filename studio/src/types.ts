import type React from "react";

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
