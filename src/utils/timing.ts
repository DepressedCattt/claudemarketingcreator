/**
 * AD ENGINE — Timing Utilities
 *
 * Helpers for converting between seconds and frames,
 * and for computing scene layout from a scene config array.
 */

import { SceneConfig, TransitionMode } from "../data/types";

export const DEFAULT_FPS = 30;

/** Convert seconds to frames */
export const toFrames = (seconds: number, fps = DEFAULT_FPS): number =>
  Math.round(seconds * fps);

/** Convert frames to seconds */
export const toSeconds = (frames: number, fps = DEFAULT_FPS): number =>
  frames / fps;

// ─── Scene Layout ────────────────────────────────────────────────────────────

/** Computed layout for a single scene, ready to pass to <Sequence> */
export interface SceneLayout {
  type: string;
  startFrame: number;
  durationFrames: number;
  transition: TransitionMode;
  props?: Record<string, unknown>;
}

/**
 * Takes the raw scene config array and computes start frames
 * by accumulating durations.
 *
 * Example:
 *   scenes = [{ type: 'hook', durationInSeconds: 3 }, { type: 'cta', durationInSeconds: 3 }]
 *   → [{ type: 'hook', startFrame: 0, durationFrames: 90 },
 *      { type: 'cta', startFrame: 90, durationFrames: 90 }]
 */
export function buildSceneLayout(
  scenes: SceneConfig[],
  fps: number
): SceneLayout[] {
  let cursor = 0;
  return scenes.map((scene) => {
    const durationFrames = toFrames(scene.durationInSeconds, fps);
    const layout: SceneLayout = {
      type: scene.type,
      startFrame: cursor,
      durationFrames,
      transition: scene.transition ?? "fade",
      props: scene.props,
    };
    cursor += durationFrames;
    return layout;
  });
}

/** Sum all scene durations to get total ad duration in frames */
export function getTotalDuration(scenes: SceneConfig[], fps: number): number {
  return scenes.reduce(
    (total, scene) => total + toFrames(scene.durationInSeconds, fps),
    0
  );
}

// ─── Default Scene Durations ─────────────────────────────────────────────────

/**
 * Sensible default durations per scene type.
 * Use these when building quick configs or templates.
 */
export const DEFAULT_SCENE_DURATIONS: Record<string, number> = {
  hook: 3,
  problem: 3.5,
  solution: 3.5,
  feature: 4,
  "social-proof": 3.5,
  cta: 3,
  "logo-end-card": 2,
};
