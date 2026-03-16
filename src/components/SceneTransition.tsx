/**
 * SceneTransition
 *
 * Wraps any scene with a configurable entrance + exit animation.
 * Set `transition` on any SceneConfig to apply it automatically.
 *
 * 10 transition modes:
 *   fade       — opacity only (default, no cost)
 *   slide-up   — scene slides up from +80px below
 *   slide-down — scene slides down from -80px above
 *   scale-in   — scene scales from 0.93 → 1 (zoom-in feel)
 *   zoom-out   — scene scales from 1.07 → 1 (push-back feel)
 *   blur-in    — CSS blur 10px → 0 as scene enters
 *   wipe-right — clipPath reveals content left → right
 *   rotate-in  — 3° CW rotation corrects on enter
 *   bounce-in  — bouncy spring scale from 0.82
 *   flash-in   — white flash burst then dissolves into content
 *
 * All transitions share the same clean fade-out at scene end.
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TransitionMode } from "../data/types";
import { Easing } from "remotion";

interface Props {
  children: React.ReactNode;
  transition: TransitionMode;
  durationFrames: number;
  /** Frames for the entrance animation (default: 18) */
  enterFrames?: number;
  /** Frames for the exit fade-out (default: 10) */
  exitFrames?: number;
}

export const SceneTransition: React.FC<Props> = ({
  children,
  transition,
  durationFrames,
  enterFrames = 18,
  exitFrames = 10,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Universal fade-out at scene end ────────────────────────────────────────
  const fadeOut = interpolate(
    frame,
    [durationFrames - exitFrames, durationFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Per-transition entrance calculations ───────────────────────────────────

  if (transition === "fade") {
    const opacity = interpolate(frame, [0, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }) * fadeOut;
    return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
  }

  if (transition === "slide-up") {
    const opacity = interpolate(frame, [0, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;
    const ty = spring({ frame, fps, config: { damping: 16, stiffness: 90 }, from: 80, to: 0 });
    return (
      <AbsoluteFill style={{ opacity, transform: `translateY(${ty}px)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (transition === "slide-down") {
    const opacity = interpolate(frame, [0, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;
    const ty = spring({ frame, fps, config: { damping: 16, stiffness: 90 }, from: -80, to: 0 });
    return (
      <AbsoluteFill style={{ opacity, transform: `translateY(${ty}px)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (transition === "scale-in") {
    const opacity = interpolate(frame, [0, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;
    const scale = spring({ frame, fps, config: { damping: 18, stiffness: 100 }, from: 0.93, to: 1 });
    return (
      <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (transition === "zoom-out") {
    const opacity = interpolate(frame, [0, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;
    const scale = spring({ frame, fps, config: { damping: 20, stiffness: 80 }, from: 1.07, to: 1 });
    return (
      <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (transition === "blur-in") {
    const opacity = interpolate(frame, [0, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;
    const blur = interpolate(frame, [0, enterFrames], [10, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return (
      <AbsoluteFill style={{ opacity, filter: `blur(${blur}px)` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (transition === "wipe-right") {
    const clipProgress = interpolate(frame, [0, enterFrames + 6], [100, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    return (
      <AbsoluteFill
        style={{
          opacity: fadeOut,
          clipPath: `inset(0 ${clipProgress}% 0 0)`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  if (transition === "rotate-in") {
    const opacity = interpolate(frame, [0, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;
    const rotate = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, from: 3, to: 0 });
    const scale  = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, from: 0.95, to: 1 });
    return (
      <AbsoluteFill style={{ opacity, transform: `rotate(${rotate}deg) scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (transition === "bounce-in") {
    const opacity = interpolate(frame, [0, 8], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;
    const scale = spring({
      frame,
      fps,
      config: { damping: 9, stiffness: 140, mass: 0.8 },
      from: 0.82,
      to: 1,
    });
    return (
      <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
        {children}
      </AbsoluteFill>
    );
  }

  if (transition === "flash-in") {
    // Content fades in normally
    const contentOpacity = interpolate(frame, [6, enterFrames], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) * fadeOut;
    // White flash decays quickly
    const flashOpacity = interpolate(frame, [0, 2, 14], [1, 0.85, 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{ opacity: contentOpacity }}>{children}</AbsoluteFill>
        <AbsoluteFill style={{ background: "#ffffff", opacity: flashOpacity, pointerEvents: "none" }} />
      </AbsoluteFill>
    );
  }

  // Fallback — plain fade
  const fallbackOpacity = interpolate(frame, [0, enterFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  }) * fadeOut;
  return <AbsoluteFill style={{ opacity: fallbackOpacity }}>{children}</AbsoluteFill>;
};
