/**
 * GradientText
 *
 * Renders text with a gradient fill using CSS background-clip.
 * Supports animated gradient angle drift for a holographic/iridescent feel.
 *
 * Usage:
 *   <GradientText
 *     text="Hello World"
 *     colors={brand.colors}
 *     fontSize={96}
 *     animated       // optional — slowly shifts the gradient angle
 *   />
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface Props {
  text: string;
  /** Gradient colour stops — defaults to accent → primary → secondary */
  gradientColors?: string[];
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  letterSpacing?: string;
  lineHeight?: number;
  textAlign?: "left" | "center" | "right";
  /** Slowly animates the gradient angle for holographic shimmer */
  animated?: boolean;
  /** Additional wrapper styles */
  style?: React.CSSProperties;
}

export const GradientText: React.FC<Props> = ({
  text,
  gradientColors = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24"],
  fontSize = 72,
  fontFamily = "Inter, system-ui, sans-serif",
  fontWeight = 800,
  letterSpacing = "-0.025em",
  lineHeight = 1.05,
  textAlign = "center",
  animated = false,
  style,
}) => {
  const frame = useCurrentFrame();

  const angle = animated
    ? interpolate(frame, [0, 300], [135, 195], { extrapolateRight: "clamp" })
    : 135;

  const gradient = `linear-gradient(${angle}deg, ${gradientColors.join(", ")})`;

  return (
    <div
      style={{
        fontFamily,
        fontSize,
        fontWeight,
        letterSpacing,
        lineHeight,
        textAlign,
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent",
        width: "100%",
        ...style,
      }}
    >
      {text}
    </div>
  );
};
