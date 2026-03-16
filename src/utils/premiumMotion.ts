/**
 * Premium Motion Primitives — SaaS Commercial Quality Standards
 *
 * Implements the "disciplined motion" approach from Apple HIG, Material Design,
 * and Nielsen Norman Group guidance.
 *
 * Core philosophy:
 *   Motion clarifies hierarchy. It never decorates.
 *   One focal point at a time. Ease-out for arrivals. Linear = cheap.
 *   Blur resolves as elements become important (rack-focus signalling).
 *   Hero objects float; background objects de-emphasize.
 *   Curved paths feel physical. Straight paths feel robotic.
 *
 * Self-check before finalising any composition using these:
 *   1. Is there one obvious focal point in every shot?
 *   2. Are transitions led by a shared element or visual thread?
 *   3. Does motion feel eased/natural vs linear or bouncy?
 *   4. Is the hero more physically present than background elements?
 *   5. Are background elements de-emphasised when hero takes focus?
 *   6. Is the scene restrained, spacious, and uncluttered?
 *   7. Would this feel premium with the sound off?
 *   8. Did we avoid overusing bounce, blur, and flashy transitions?
 */

import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// ─── Premium Spring Configs ──────────────────────────────────────────────────
//
// Tuned for controlled deceleration over bounce/snap.
// The goal is "physical weight" not "spring toy" energy.

export const PREMIUM_SPRING = {
  /** Hero object arrival — smooth settle, near-zero overshoot. Use for main focal elements. */
  hero: { damping: 22, stiffness: 90, mass: 1.1 },
  /** Text entrance — quick but soft. No bounce whatsoever. */
  text: { damping: 28, stiffness: 120, mass: 0.7 },
  /** UI element — controlled snap. The tiniest acceptable settle. */
  ui: { damping: 20, stiffness: 110, mass: 0.9 },
  /** Background element — slow and soft, barely noticeable. */
  bg: { damping: 30, stiffness: 60, mass: 1.2 },
  /** Hero settle — just enough physical weight to feel real, never toy-like. */
  settle: { damping: 18, stiffness: 88, mass: 1.05 },
} as const;

// ─── Easing Curves ───────────────────────────────────────────────────────────
//
// All curves assume input t ∈ [0, 1] clamped.
// Prefer easeOut for arrivals. Prefer easeInOut for state transitions.
// Never use linear motion on hero or text elements.

/** Utility: clamp to [lo, hi] */
export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

/** Progress value from raw frame, clamped 0→1 */
export const rawProgress = (frame: number, start: number, dur: number): number =>
  clamp((frame - start) / dur, 0, 1);

/** Cubic ease-out — decisive arrival, smooth deceleration. Primary tool. */
export const easeOut3 = (t: number): number =>
  1 - Math.pow(1 - clamp(t, 0, 1), 3);

/** Quartic ease-out — stronger deceleration, good for large objects. */
export const easeOut4 = (t: number): number =>
  1 - Math.pow(1 - clamp(t, 0, 1), 4);

/** Quintic ease-out — most emphatic. Use for hero impact moments only. */
export const easeOut5 = (t: number): number =>
  1 - Math.pow(1 - clamp(t, 0, 1), 5);

/** Smooth ease-in-out — for state transitions between focused elements. */
export const easeInOut2 = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
};

/** Gentle ease-in-out cubic — softer transitions, background movements. */
export const easeInOut3 = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

// ─── Hooks ───────────────────────────────────────────────────────────────────
//
// All hooks call useCurrentFrame() internally.
// Use only inside Remotion components.

/**
 * Smooth 0→1 progress with premium cubic ease-out.
 * The foundation for most entrance animations.
 */
export function usePremiumProgress(
  startFrame: number,
  durationFrames: number,
  easingFn: (t: number) => number = easeOut3
): number {
  const frame = useCurrentFrame();
  return easingFn(rawProgress(frame, startFrame, durationFrames));
}

/**
 * Cinematic text reveal — the premium text entrance pattern.
 * Combines opacity fade, subtle vertical drift, and blur resolve.
 * The blur resolution is what signals "this is important now."
 *
 * Returns { opacity, translateY, blur } — apply all three.
 *
 * @param startFrame   When the entrance begins
 * @param driftPx      Vertical drift distance in px (keep ≤ 20 for text)
 * @param blurMax      Starting blur in px (6–10 is cinematic; >14 is excessive)
 */
export function useCinematicTextReveal(
  startFrame: number,
  driftPx = 16,
  blurMax = 7
): { opacity: number; translateY: number; blur: number } {
  const frame = useCurrentFrame();
  const tOpacity = easeOut3(rawProgress(frame, startFrame, 20));
  const tDrift = easeOut4(rawProgress(frame, startFrame, 26));
  const tBlur = easeOut4(rawProgress(frame, startFrame, 32));
  return {
    opacity: clamp(tOpacity / 0.35, 0, 1),
    translateY: (1 - tDrift) * driftPx,
    blur: (1 - tBlur) * blurMax,
  };
}

/**
 * Blur-resolve entrance — element arrives softly focused and sharpens on settle.
 * This is the "rack focus" signal: sharp = the camera cares about this now.
 * Returns a CSS blur value in px (apply as filter: blur(Xpx)).
 *
 * @param startFrame     When blur starts resolving
 * @param durationFrames How long until fully sharp
 * @param maxBlur        Starting blur amount (12–18 for hero objects)
 */
export function useBlurResolve(
  startFrame: number,
  durationFrames = 24,
  maxBlur = 14
): number {
  const frame = useCurrentFrame();
  const t = easeOut4(rawProgress(frame, startFrame, durationFrames));
  return (1 - t) * maxBlur;
}

/**
 * Arc entry — returns { translateX, translateY } for a slightly curved
 * approach path. The Y axis decelerates slightly faster than X, creating
 * a natural concave arc that feels physical rather than robotic.
 *
 * This is what separates premium motion from generic slide animations.
 *
 * @param startFrame  When motion begins
 * @param fromX       Starting X offset in px (positive = from right)
 * @param fromY       Starting Y offset in px (positive = from below)
 * @param config      Spring config (use PREMIUM_SPRING.hero for hero objects)
 */
export function useArcEntry(
  startFrame: number,
  fromX: number,
  fromY: number,
  config = PREMIUM_SPRING.hero
): { translateX: number; translateY: number } {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // X axis follows spring physics (natural settle with micro-overshoot)
  const springProgress = spring({ frame: frame - startFrame, fps, config });
  // Y axis follows a stronger ease-out (decelerates faster = arc effect)
  const arcProgress = easeOut5(rawProgress(frame, startFrame, 28));
  return {
    translateX: (1 - springProgress) * fromX,
    translateY: (1 - arcProgress) * fromY,
  };
}

/**
 * Hero float — subtle sinusoidal float loop for hero objects.
 * Keeps the hero visually alive without mechanical bouncing.
 * Returns a translateY offset in px.
 *
 * Rules: amplitude ≤ 8px. Period ≥ 70 frames (≥ 2.3s @ 30fps).
 * Any faster or larger reads as cheap/template-like.
 *
 * @param amplitude    Max displacement in px (default 6 — barely perceptible)
 * @param periodFrames Full cycle duration (default 80 = 2.67s @ 30fps)
 * @param phaseOffset  Phase offset in radians (for multiple floating elements)
 */
export function useHeroFloat(
  amplitude = 6,
  periodFrames = 80,
  phaseOffset = 0
): number {
  const frame = useCurrentFrame();
  return Math.sin(((frame / periodFrames) * 2 * Math.PI) + phaseOffset) * amplitude;
}

/**
 * Hero float with settle delay — float only begins after the hero has
 * finished its entrance animation. Prevents motion-on-motion confusion.
 *
 * @param settleFrame  Frame when float begins (after entrance completes)
 */
export function useHeroFloatDelayed(
  settleFrame: number,
  amplitude = 6,
  periodFrames = 80
): number {
  const frame = useCurrentFrame();
  const fadeIn = clamp((frame - settleFrame) / 20, 0, 1);
  return Math.sin((frame / periodFrames) * 2 * Math.PI) * amplitude * easeOut3(fadeIn);
}

/**
 * Depth de-emphasis values — returns CSS values for background elements
 * that should recede when the hero takes focus.
 *
 * This is how professional SaaS ads enforce "one focal point at a time"
 * without hiding content — they simply lower its visual weight.
 *
 * @param deemphasizeProgress  0 = full emphasis, 1 = fully de-emphasised
 */
export function depthDeemphasis(deemphasizeProgress: number): {
  opacity: number;
  scale: number;
  blur: number;
} {
  const t = clamp(deemphasizeProgress, 0, 1);
  return {
    opacity: 1 - t * 0.62,      // From 1.0 → 0.38
    scale: 1 - t * 0.03,        // From 1.0 → 0.97  (barely perceptible)
    blur: t * 2.5,               // From 0px → 2.5px (cinematic softening)
  };
}

/**
 * Soft scale-in — element grows from `from` to 1.0 with premium easing.
 * No bounce. Just controlled, smooth arrival.
 * The "from" value should be 0.88–0.96 for the most premium feel.
 */
export function useSoftScaleIn(
  startFrame: number,
  from = 0.92,
  durationFrames = 26,
  easingFn: (t: number) => number = easeOut4
): number {
  const frame = useCurrentFrame();
  const t = easingFn(rawProgress(frame, startFrame, durationFrames));
  return from + (1 - from) * t;
}

/**
 * Premium wipe — clean left-to-right reveal using ease-in-out.
 * Good for accent rules, underlines, progress bars.
 * Returns 0→100 percentage (use as `width: \`${pct}%\``).
 */
export function usePremiumWipe(
  startFrame: number,
  durationFrames = 22
): number {
  const frame = useCurrentFrame();
  return easeInOut3(rawProgress(frame, startFrame, durationFrames)) * 100;
}

/**
 * Breathing glow — slow sinusoidal pulse for ambient glow/light effects.
 * Returns a 0→1 value. Multiply into rgba alpha channels.
 *
 * Rule: keep period ≥ 60 frames. Faster = anxiety-inducing.
 */
export function useBreathingGlow(
  periodFrames = 90,
  minVal = 0.55,
  maxVal = 1.0
): number {
  const frame = useCurrentFrame();
  const t = (Math.sin((frame / periodFrames) * 2 * Math.PI) + 1) / 2;
  return minVal + (maxVal - minVal) * t;
}

/**
 * Scene fade out — smooth opacity drop at the end of a scene's Sequence.
 * Call in every scene component to ensure clean transitions.
 *
 * @param totalFrames   Total durationInFrames for this Sequence
 * @param durationFrames How many frames the fade takes
 */
export function usePremiumFadeOut(
  totalFrames: number,
  durationFrames = 12
): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [totalFrames - durationFrames, totalFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

/**
 * Stagger start frame — returns the frame number when the nth element
 * in a staggered group should begin its entrance.
 *
 * Premium stagger uses 10–14 frames between items.
 * Any faster and the eye can't track hierarchy.
 * Any slower and the scene drags.
 */
export function premiumStagger(
  index: number,
  baseFrame: number,
  framesPerItem = 12
): number {
  return baseFrame + index * framesPerItem;
}

/**
 * Shared element scale — scales a hero element from one scene's final
 * state into the next scene's starting state. Creates the illusion that
 * the same object carries you across the cut.
 *
 * @param sceneProgress  0→1 progress of the current scene
 * @param fromScale      Scale at scene start (typically where prev scene left off)
 * @param toScale        Scale at scene end
 */
export function sharedElementScale(
  sceneProgress: number,
  fromScale: number,
  toScale: number
): number {
  const t = easeInOut3(clamp(sceneProgress, 0, 1));
  return fromScale + (toScale - fromScale) * t;
}
