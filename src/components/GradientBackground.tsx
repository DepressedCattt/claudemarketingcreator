/**
 * GradientBackground
 *
 * Animated full-screen gradient background.
 * Supports linear, radial, mesh, and solid styles.
 * Optionally renders a video background with a gradient overlay on top.
 */

import React from "react";
import { AbsoluteFill, interpolate, OffthreadVideo, useCurrentFrame } from "remotion";
import { ColorConfig } from "../data/types";

export type GradientStyle =
  // ── Original 4 ──────────────────────────────────────────────────────────
  | "solid"            // Flat colour
  | "linear"           // Diagonal gradient primary → secondary
  | "radial"           // Ellipse radiating from centre
  | "mesh"             // Multi-orb colour mesh overlay
  // ── New 6 ───────────────────────────────────────────────────────────────
  | "aurora"           // Northern-lights sweep: 3 animated colour orbs
  | "diagonal"         // Clean 45° hard diagonal two-tone
  | "glow-center"      // Strong accent halo blooming from centre
  | "duotone"          // Bold horizontal colour split with soft feather
  | "vignette"         // Solid base with deep dark edge vignette
  | "conic";           // Conic sweep gradient (colour-wheel feel)

interface Props {
  colors: ColorConfig;
  /** Whether the gradient slowly shifts/animates over time */
  animated?: boolean;
  style?: GradientStyle;
  /** Override the base background color */
  baseColor?: string;
  /**
   * Optional path to a background video (mp4/webm).
   * Place video files in public/video/ and reference via staticFile("video/myfile.mp4")
   */
  videoSrc?: string;
  /** 0–1 opacity of the video layer (default: 0.35) */
  videoOpacity?: number;
}

export const GradientBackground: React.FC<Props> = ({
  colors,
  animated = true,
  style = "linear",
  baseColor,
  videoSrc,
  videoOpacity = 0.35,
}) => {
  const frame = useCurrentFrame();

  const base = baseColor || colors.background;

  // ── Shared animation values ──────────────────────────────────────────────
  const angle = animated
    ? interpolate(frame, [0, 300], [135, 155], { extrapolateRight: "clamp" })
    : 135;

  const radialY = animated
    ? interpolate(frame, [0, 300], [40, 60], { extrapolateRight: "clamp" })
    : 50;

  // Aurora: three orbs drift independently
  const auroraX1 = animated ? interpolate(frame, [0, 240], [15, 30], { extrapolateRight: "clamp" }) : 20;
  const auroraY1 = animated ? interpolate(frame, [0, 180], [20, 40], { extrapolateRight: "clamp" }) : 25;
  const auroraX2 = animated ? interpolate(frame, [0, 200], [75, 60], { extrapolateRight: "clamp" }) : 75;
  const auroraY2 = animated ? interpolate(frame, [0, 220], [70, 50], { extrapolateRight: "clamp" }) : 65;

  // Glow-center pulse
  const glowSize = animated
    ? interpolate(frame, [0, 120, 240], [30, 45, 30], { extrapolateRight: "clamp" })
    : 38;

  // Conic rotation
  const conicAngle = animated
    ? interpolate(frame, [0, 300], [0, 30], { extrapolateRight: "clamp" })
    : 0;

  // ── Gradient definitions ─────────────────────────────────────────────────
  const getBackground = (): string => {
    switch (style) {
      case "solid":
        return base;

      case "linear":
        return `linear-gradient(${angle}deg, ${colors.primary}, ${colors.secondary})`;

      case "radial":
        return `radial-gradient(ellipse at 50% ${radialY}%, ${colors.primary}CC, ${base})`;

      case "mesh":
        return [
          `radial-gradient(ellipse at 20% 20%, ${colors.primary}80 0%, transparent 50%)`,
          `radial-gradient(ellipse at 80% 80%, ${colors.secondary}80 0%, transparent 50%)`,
          `radial-gradient(ellipse at 50% 50%, ${colors.accent}40 0%, transparent 60%)`,
          base,
        ].join(", ");

      case "aurora":
        return [
          `radial-gradient(ellipse at ${auroraX1}% ${auroraY1}%, ${colors.primary}70 0%, transparent 45%)`,
          `radial-gradient(ellipse at ${auroraX2}% ${auroraY2}%, ${colors.secondary}60 0%, transparent 45%)`,
          `radial-gradient(ellipse at 50% 50%, ${colors.accent}30 0%, transparent 40%)`,
          base,
        ].join(", ");

      case "diagonal":
        return `linear-gradient(45deg, ${colors.primary} 0%, ${colors.primary} 49%, ${colors.secondary} 51%, ${colors.secondary} 100%)`;

      case "glow-center":
        return [
          `radial-gradient(ellipse at 50% 50%, ${colors.accent}50 0%, ${colors.primary}40 ${glowSize}%, transparent 65%)`,
          base,
        ].join(", ");

      case "duotone":
        return `linear-gradient(180deg, ${colors.primary} 0%, ${colors.primary} 48%, ${colors.secondary} 52%, ${colors.secondary} 100%)`;

      case "vignette":
        return [
          `radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.72) 100%)`,
          base,
        ].join(", ");

      case "conic":
        return `conic-gradient(from ${conicAngle}deg at 50% 50%, ${colors.primary}, ${colors.secondary}, ${colors.accent}60, ${colors.secondary}, ${colors.primary})`;

      default:
        return base;
    }
  };

  return (
    <>
      {/* Solid base colour always underneath */}
      <AbsoluteFill style={{ background: base }} />

      {/* Optional video layer */}
      {videoSrc && (
        <AbsoluteFill style={{ opacity: videoOpacity }}>
          <OffthreadVideo
            src={videoSrc}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            muted
            loop
          />
        </AbsoluteFill>
      )}

      {/* Gradient overlay */}
      <AbsoluteFill style={{ background: getBackground() }} />
    </>
  );
};
