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
  /** Category ID from the category taxonomy (e.g. "saas") */
  category?:        string;
  /** Subcategory IDs this composition demonstrates */
  subcategories?:   string[];
  /** Canonical feature playground — highlighted in gold in the Studio UI */
  playground?:      boolean;
  /** Style profile from docs/profiles/ (e.g. "dark-tech", "snappy-saas") */
  profile?:         string;
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
  src:             string;
  startFrom:       number;
  endAt:           number;
  offset:          number;
  volume:          number;
  loop:            boolean;
  pitchSemitones?: number;
  pitchedSrc?:     string;
};

// ─── Studio state saved to disk ──────────────────────────────────────────────

export type StudioState = {
  audioTracks: Record<string, AudioTrack[]>;
};
