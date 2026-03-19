/**
 * useRemotionFrame — R3F-compatible frame utilities for @remotion/three.
 *
 * Use inside ThreeCanvas components instead of useFrame() from @react-three/fiber.
 * useCurrentFrame() works natively inside @remotion/three's ThreeCanvas context.
 *
 * Coordinate system reference (fov=40, cameraZ=6):
 *   For a 1080px-wide canvas:  1 world unit ≈ 247px  (PPU_1080_FOV40)
 *   For a 1080px-tall canvas:  1 world unit ≈ 247px  (same — square canvas)
 *   For a 1920px-tall canvas:  1 world unit ≈ 439px  (PPU_1920_FOV40)
 *
 *   CSS Y is down (+ve = lower on screen).
 *   Three.js Y is up (+ve = higher in 3D space).
 *   Always negate Y when converting: worldY = -cssOffsetY / PPU
 */

import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, rawProgress } from "../premiumMotion";

// ─── Pixels-per-unit constants ─────────────────────────────────────────────────
// At fov=40, cameraZ=6: frustum height = 2*6*tan(20°) ≈ 4.37 world units.
// For a 1080px canvas height: 1 unit = 1080/4.37 ≈ 247px.
// For a 1920px canvas height: 1 unit = 1920/4.37 ≈ 439px.
// The horizontal PPU equals vertical PPU when aspect matches the camera frustum aspect.

/** Pixels per world unit for a 1080px dimension at fov=40, cameraZ=6. */
export const PPU_1080 = 247;

/** Pixels per world unit for a 1920px dimension at fov=40, cameraZ=6. */
export const PPU_1920 = 439;

// ─── Coordinate helpers ────────────────────────────────────────────────────────

/**
 * Convert CSS pixel offset (from canvas center) to Three.js world unit on X axis.
 * Positive CSS-X (right) = positive world-X (right). Same direction.
 */
export function pxToWorldX(px: number, ppu = PPU_1080): number {
  return px / ppu;
}

/**
 * Convert CSS pixel offset (from canvas center) to Three.js world unit on Y axis.
 * CSS Y is inverted vs Three.js Y, so this negates.
 * Positive CSS-Y (down) = negative world-Y (down in 3D).
 */
export function pxToWorldY(px: number, ppu = PPU_1080): number {
  return -px / ppu;
}

/**
 * Convert canvas absolute position (top-left origin) to Three.js world coords.
 * @param canvasX  Pixel X on canvas (left=0)
 * @param canvasY  Pixel Y on canvas (top=0)
 * @param width    Canvas width in pixels
 * @param height   Canvas height in pixels
 * @param ppu      Pixels per world unit (use PPU_1080 or PPU_1920)
 */
export function canvasPosToWorld(
  canvasX: number,
  canvasY: number,
  width: number,
  height: number,
  ppu = PPU_1080,
): { x: number; y: number } {
  const offsetX = canvasX - width / 2;
  const offsetY = canvasY - height / 2;
  return { x: offsetX / ppu, y: -offsetY / ppu };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface RemotionThreeFrame {
  /** Current frame number (global or local depending on Sequence context). */
  frame: number;
  /** Frames per second. */
  fps: number;
  /** Composition width in pixels. */
  width: number;
  /** Composition height in pixels. */
  height: number;
  /** Total frames in composition. */
  durationInFrames: number;
  /**
   * Clamped progress 0→1 starting at `start`, lasting `dur` frames.
   * Equivalent to premiumMotion's rawProgress().
   */
  progress: (start: number, dur: number) => number;
  /**
   * True if current frame is within [from, to).
   * Use to conditionally render 3D elements.
   */
  inRange: (from: number, to: number) => boolean;
  /**
   * Smooth 0→1→0 opacity envelope for [from, to) with optional fade durations.
   * Useful for fading 3D objects in/out to match CSS Sequence timing.
   */
  rangeOpacity: (from: number, to: number, fadeIn?: number, fadeOut?: number) => number;
}

/**
 * useRemotionThreeFrame — composite hook for R3F components inside ThreeCanvas.
 *
 * Provides the current frame plus coordinate and timing utilities.
 * Call this instead of useFrame() from @react-three/fiber.
 *
 * @example
 * function MyMesh() {
 *   const { frame, progress, inRange } = useRemotionThreeFrame();
 *   const t = progress(0, 30); // 0→1 over 30 frames
 *   return <mesh position-y={t * 2} />;
 * }
 */
export function useRemotionThreeFrame(): RemotionThreeFrame {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();

  const progress = (start: number, dur: number) => rawProgress(frame, start, dur);

  const inRange = (from: number, to: number) => frame >= from && frame < to;

  const rangeOpacity = (
    from: number,
    to: number,
    fadeIn = 8,
    fadeOut = 10,
  ) =>
    interpolate(
      frame,
      [from, from + fadeIn, Math.max(from + fadeIn + 1, to - fadeOut), to],
      [0, 1, 1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );

  return { frame, fps, width, height, durationInFrames, progress, inRange, rangeOpacity };
}
