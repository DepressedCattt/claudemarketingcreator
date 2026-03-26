/**
 * Cue Sheet Types
 *
 * A CueEvent marks a specific animation moment (frame + second) with a
 * type, intensity, and label. These are collected into a cue sheet that
 * can be exported as a text file for music generators and sound designers.
 *
 * Every composition should export a `<Name>Cues: CueEvent[]` alongside
 * its component so the studio can surface an "Export Cues" button.
 *
 * Usage in a composition file:
 *   import type { CueEvent } from "@utils/cueTypes";
 *   export const MyAdCues: CueEvent[] = [
 *     { frame: 0,   type: "SCENE_CUT",   label: "Hook begins",  intensity: "hard" },
 *     { frame: 15,  type: "TEXT_REVEAL", label: "Badge enters", intensity: "soft" },
 *     ...
 *   ];
 */

/** The type of animation event — used to recommend SFX category. */
export type CueEventType =
  | "SCENE_CUT"    // Hard cut to a new scene — always a hard landmark
  | "TEXT_REVEAL"  // Body/supporting text enters via cinematic reveal
  | "TEXT_IMPACT"  // Dominant headline slams or snaps into place
  | "HERO_ENTRY"   // Hero object (card, product, image) enters the scene
  | "OBJECT_LAND"  // Secondary UI object lands (feature row, stat card)
  | "WIPE"         // Directional wipe or reveal (accent line, underline)
  | "BEAT_LOCK"    // Rhythmic/BPM element appears and establishes tempo
  | "STAT_BUILD"   // Counter, number, or metric builds in
  | "CTA_REVEAL"   // CTA button or URL appears
  | "AMBIENT";     // Ambient motion (glow settle, float start, background shift)

/**
 * How prominent the sound event should be.
 * - hard:   kick/impact/hit — the viewer's eye snaps here
 * - medium: click/whoosh/sweep — clear but not dominant
 * - soft:   shimmer/air/subtle pop — ear candy only
 */
export type CueIntensity = "hard" | "medium" | "soft";

export interface CueEvent {
  /** Unique identifier for this cue (used as React key and for editing). */
  id:              string;
  /** Global frame number within the composition (0-based). */
  frame:           number;
  /** Duration of the cue in frames. */
  duration:        number;
  /** Category of animation event. */
  type:            CueEventType;
  /** Short human-readable label for the event. */
  label:           string;
  /** Suggested sound intensity. */
  intensity:       CueIntensity;
  /** Suggested SFX characteristics (e.g. "metallic sweep with reverb tail"). */
  sfxDescription?: string;
  /** Ready-to-paste ElevenLabs SFX generation prompt. */
  elevenLabsPrompt?: string;
  /** Optional notes for the sound designer / music generator. */
  notes?:          string;
}
