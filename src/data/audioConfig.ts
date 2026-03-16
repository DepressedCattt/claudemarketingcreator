/**
 * audioConfig — per-composition audio track settings.
 *
 * HOW TO USE:
 *   1. Drop an audio file into /public/audio/  (e.g. "beat.mp3")
 *   2. Open the "audio-editor" composition in Remotion Studio
 *   3. Use the timeline UI to set your trim points and sync offset
 *   4. Copy the generated config JSON and paste it into the matching
 *      entry below, then save. The composition will instantly pick it up.
 *
 * FIELD REFERENCE:
 *   src        Path relative to /public — e.g. "/audio/beat.mp3"
 *   startFrom  Frame offset INTO the audio file where playback begins.
 *              e.g. startFrom=90 skips the first 3s of audio (at 30fps).
 *   endAt      Frame (relative to the composition start) where audio stops.
 *              Leave undefined to play until the audio or composition ends.
 *   volume     0.0 – 1.0. Supports a function: (frame) => number for keyframes.
 *   loop       Whether to loop the track if it's shorter than the composition.
 *   offset     Frame in the composition where the audio track starts.
 *              e.g. offset=60 means audio is silent for the first 2s.
 */

export type VolumeCallback = (frame: number) => number;

export type AudioTrackConfig = {
  src: string;
  startFrom?: number;
  endAt?: number;
  volume?: number | VolumeCallback;
  loop?: boolean;
  offset?: number;   // frame in the composition where this track begins
};

// ─── Per-composition audio assignments ────────────────────────────────────────
// Set a composition's entry to null to disable audio for it.
// Multiple tracks per composition: use an array.

export const audioConfig: Record<string, AudioTrackConfig[] | null> = {
  "VerticalAd":      null,
  "forma2-v1":       null,
  "arcflow":         null,
  "crest":           null,
  "flowdesk":        null,
  "hero-expansion":  null,
  "kinetic-type":    null,
  "luminary":        null,
  "meridian":        null,
  "nova-skin":       null,
  "solace":          null,
  "trailblaze":      null,
  "veridian":        null,
};

// ─── Helper ───────────────────────────────────────────────────────────────────
/** Returns the tracks for a composition, or an empty array if none set. */
export function getAudioTracks(compositionId: string): AudioTrackConfig[] {
  return audioConfig[compositionId] ?? [];
}
