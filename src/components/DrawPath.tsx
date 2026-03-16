/**
 * DrawPath
 *
 * Animates an SVG path drawing itself onto screen using stroke-dashoffset.
 * Includes a set of pre-built shapes with known path lengths.
 *
 * Usage:
 *   <DrawPath shape="checkmark" startFrame={10} color="#34d399" size={120} />
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Easing } from "remotion";
import type { DrawShape } from "../data/types";

interface Props {
  shape: DrawShape;
  /** Frame to start drawing */
  startFrame?: number;
  /** How many frames to complete the drawing */
  durationFrames?: number;
  color?: string;
  strokeWidth?: number;
  /** Overall size of the SVG bounding box */
  size?: number;
  style?: React.CSSProperties;
}

// ─── Shape definitions ────────────────────────────────────────────────────────
// Each shape: { viewBox, d, length }
// Length must match the actual path length for the animation to work correctly.

const SHAPES: Record<DrawShape, { viewBox: string; d: string; length: number }> = {
  checkmark: {
    viewBox: "0 0 120 120",
    d: "M 15 60 L 45 90 L 105 25",
    length: 115,
  },
  circle: {
    viewBox: "0 0 120 120",
    d: "M 60 10 A 50 50 0 1 1 59.99 10",
    length: 314,
  },
  underline: {
    viewBox: "0 0 200 20",
    d: "M 0 10 L 200 10",
    length: 200,
  },
  "arrow-right": {
    viewBox: "0 0 200 80",
    d: "M 10 40 L 160 40 M 130 15 L 165 40 L 130 65",
    length: 230,
  },
  cross: {
    viewBox: "0 0 120 120",
    d: "M 20 20 L 100 100 M 100 20 L 20 100",
    length: 226,
  },
  heart: {
    viewBox: "0 0 120 120",
    d: "M 60 95 C 10 65 10 20 35 20 C 47 20 55 28 60 35 C 65 28 73 20 85 20 C 110 20 110 65 60 95 Z",
    length: 280,
  },
  star: {
    viewBox: "0 0 120 120",
    d: "M 60 10 L 73 44 L 109 44 L 80 66 L 91 100 L 60 79 L 29 100 L 40 66 L 11 44 L 47 44 Z",
    length: 330,
  },
};

export const DrawPath: React.FC<Props> = ({
  shape,
  startFrame = 0,
  durationFrames = 30,
  color = "#ffffff",
  strokeWidth = 5,
  size = 120,
  style,
}) => {
  const frame = useCurrentFrame();
  const { viewBox, d, length } = SHAPES[shape];

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const strokeDashoffset = length * (1 - progress);

  // Opacity: fade in as path starts drawing
  const opacity = interpolate(frame, [startFrame, startFrame + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <svg
      viewBox={viewBox}
      width={size}
      height={shape === "underline" ? size * 0.12 : size}
      style={{ overflow: "visible", opacity, ...style }}
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={length}
        strokeDashoffset={strokeDashoffset}
        style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
      />
    </svg>
  );
};
