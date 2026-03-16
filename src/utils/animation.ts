/**
 * AD ENGINE — Animation Utilities
 *
 * Reusable animation hooks and helpers built on Remotion primitives.
 * All animations here use spring physics for a premium, polished feel.
 *
 * IMPORTANT: These hooks read useCurrentFrame() internally.
 * Use them only inside Remotion components.
 */

import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// ─── Spring Config Presets ────────────────────────────────────────────────────

/** Spring physics configuration presets */
export const SPRING = {
  /** Smooth and gentle — good for backgrounds, large elements */
  gentle: { damping: 18, stiffness: 80, mass: 1 },
  /** Default — balanced snap with slight overshoot */
  snappy: { damping: 14, stiffness: 100, mass: 0.8 },
  /** Quick and crisp — good for text entrances */
  crisp: { damping: 20, stiffness: 160, mass: 0.6 },
  /** Slight bounce — good for cards and CTAs */
  bouncy: { damping: 10, stiffness: 120, mass: 0.9 },
} as const;

// ─── Animation Hooks ──────────────────────────────────────────────────────────

/**
 * Fade from 0 → 1 starting at `startFrame`
 */
export function useFadeIn(startFrame: number, durationFrames = 15): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

/**
 * Fade from 1 → 0 at the end of a scene
 * @param totalFrames  Total frames in the current <Sequence>
 */
export function useFadeOut(totalFrames: number, durationFrames = 10): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [totalFrames - durationFrames, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

/**
 * Spring-driven upward translate — element slides up from below on enter
 * Returns a translateY value (pixels). Add to CSS transform.
 */
export function useSlideUp(
  startFrame: number,
  distancePx = 40,
  config = SPRING.snappy
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({
    frame: frame - startFrame,
    fps,
    config,
  });
  return (1 - progress) * distancePx;
}

/**
 * Spring-driven scale — element scales in from `from` to 1
 */
export function useScaleIn(
  startFrame: number,
  from = 0.85,
  config = SPRING.snappy
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({
    frame: frame - startFrame,
    fps,
    config,
    from,
    to: 1,
  });
}

/**
 * Combined fade + slide — most common text entrance
 * Returns { opacity, translateY }
 */
export function useTextEntrance(
  startFrame: number,
  slideDistance = 30
): { opacity: number; translateY: number } {
  const opacity = useFadeIn(startFrame, 12);
  const translateY = useSlideUp(startFrame, slideDistance);
  return { opacity, translateY };
}

// ─── Stagger Helpers ─────────────────────────────────────────────────────────

/**
 * Get a staggered frame delay for the nth element in a list.
 * Use this when animating multiple items with a cascade effect.
 *
 * Example:
 *   features.map((f, i) => {
 *     const delay = staggerDelay(i); // 0, 8, 16, 24...
 *   })
 */
export function staggerDelay(index: number, framesPerItem = 8): number {
  return index * framesPerItem;
}

// ─── Value Interpolation Helpers ──────────────────────────────────────────────

/**
 * Smooth 0→1 progress value that peaks at a given frame.
 * Useful for driving percentage-based animations.
 */
export function useProgress(startFrame: number, durationFrames: number): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

// ─── Kinetic / Slam Animations ────────────────────────────────────────────────

/**
 * Word slam entrance — scales from large to 1 with a hard-stopping spring.
 * Use for kinetic text where each word punches onto screen.
 * Returns { scale, opacity, translateY }
 */
export function useWordSlam(
  startFrame: number,
  config = SPRING.bouncy
): { scale: number; opacity: number; translateY: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({
    frame: frame - startFrame,
    fps,
    config,
    from: 1.45,
    to: 1,
  });

  const opacity = interpolate(frame, [startFrame, startFrame + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = spring({
    frame: frame - startFrame,
    fps,
    config: SPRING.crisp,
    from: -24,
    to: 0,
  });

  return { scale, opacity, translateY };
}

/**
 * Drift entrance — gentle float up with eased fade.
 * Softer alternative to useWordSlam for premium feels.
 */
export function useWordDrift(startFrame: number): { opacity: number; translateY: number } {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [startFrame, startFrame + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const translateY = interpolate(frame, [startFrame, startFrame + 24], [28, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return { opacity, translateY };
}

/**
 * Character typewriter — returns how many characters of a string to reveal.
 * Feed the result to `text.slice(0, visibleChars)`.
 */
export function useTypewriter(
  text: string,
  startFrame: number,
  charsPerFrame = 1.5
): number {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - startFrame);
  return Math.min(text.length, Math.floor(elapsed * charsPerFrame));
}

// ─── Counter Animation ────────────────────────────────────────────────────────

/**
 * Animated count-up from `from` to `to`.
 * Uses an eased cubic progress curve so it starts fast and eases into the target.
 * Returns the current integer value to display.
 */
export function useCountUp(
  from: number,
  to: number,
  startFrame: number,
  durationFrames: number
): number {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  return Math.round(from + (to - from) * progress);
}

// ─── Wipe / Reveal ───────────────────────────────────────────────────────────

/**
 * Horizontal wipe: returns a 0–100 percentage that represents how much of
 * an element's width has been revealed. Use as `clipPath: inset(0 ${100 - pct}% 0 0)`.
 */
export function useWipeIn(startFrame: number, durationFrames = 20): number {
  const frame = useCurrentFrame();
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
}

/**
 * Strikethrough wipe: returns 0–100 width percentage for a line crossing text.
 */
export function useStrikethrough(startFrame: number, durationFrames = 18): number {
  return useWipeIn(startFrame, durationFrames);
}

// ─── Pulse / Loop Animations ─────────────────────────────────────────────────

/**
 * Sinusoidal pulse — returns a scale value that breathes up and down.
 * Good for attention-grabbing badges and highlights.
 */
export function usePulse(periodFrames = 60, amplitude = 0.04): number {
  const frame = useCurrentFrame();
  return 1 + Math.sin((frame / periodFrames) * 2 * Math.PI) * amplitude;
}

/**
 * Rotation loop — returns degrees, rotating endlessly.
 * Good for spinner / loading indicators or decorative elements.
 */
export function useRotate(degreesPerFrame = 1): number {
  const frame = useCurrentFrame();
  return frame * degreesPerFrame;
}

// ─── Slide Variants ───────────────────────────────────────────────────────────

/**
 * Spring-driven slide from the right.
 * Returns translateX (starts positive = offscreen right, springs to 0).
 */
export function useSlideInRight(
  startFrame: number,
  distancePx = 60,
  config = SPRING.snappy
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config });
  return (1 - progress) * distancePx;
}

/**
 * Spring-driven slide from the left.
 * Returns translateX (starts negative = offscreen left, springs to 0).
 */
export function useSlideInLeft(
  startFrame: number,
  distancePx = 60,
  config = SPRING.snappy
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - startFrame, fps, config });
  return -(1 - progress) * distancePx;
}
