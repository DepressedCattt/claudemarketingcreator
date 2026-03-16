/**
 * SceneWrapper
 *
 * Wraps every scene with consistent fade-in / fade-out transitions
 * and layout padding. Every scene component should render this at its root.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  children: React.ReactNode;
  /** Total frames for this scene (passed from the parent Sequence) */
  durationFrames: number;
  /** Frames to spend fading in at scene start */
  fadeInFrames?: number;
  /** Frames to spend fading out at scene end */
  fadeOutFrames?: number;
  /** Horizontal + vertical padding (px) */
  padding?: number;
  /** Vertical alignment of content */
  justify?: "center" | "flex-start" | "flex-end" | "space-between";
  /** Horizontal alignment */
  align?: "center" | "flex-start" | "flex-end";
}

export const SceneWrapper: React.FC<Props> = ({
  children,
  durationFrames,
  fadeInFrames = 12,
  fadeOutFrames = 8,
  padding = 72,
  justify = "center",
  align = "center",
}) => {
  const frame = useCurrentFrame();

  // Build the range dynamically to avoid duplicate values when fadeOutFrames is 0
  const inputRange = fadeOutFrames > 0
    ? [0, fadeInFrames, durationFrames - fadeOutFrames, durationFrames]
    : [0, fadeInFrames];
  const outputRange = fadeOutFrames > 0 ? [0, 1, 1, 0] : [0, 1];

  const opacity = interpolate(frame, inputRange, outputRange, {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        opacity,
        padding,
        display: "flex",
        flexDirection: "column",
        justifyContent: justify,
        alignItems: align,
        gap: 24,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
