/**
 * CTACard
 *
 * The call-to-action button card shown in the CTA scene.
 * Scales in with a spring animation and pulses subtly.
 */

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ColorConfig, CTAConfig, TypographyConfig } from "../data/types";
import { getTypography } from "../utils/typography";

interface Props {
  cta: CTAConfig;
  colors: ColorConfig;
  typography: TypographyConfig;
  delay?: number;
}

export const CTACard: React.FC<Props> = ({
  cta,
  colors,
  typography,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = getTypography(typography.preset);

  // Entrance scale spring
  const scaleIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 120, mass: 0.8 },
    from: 0.7,
    to: 1,
  });

  // Subtle pulse after entrance
  const pulse = interpolate(
    frame,
    [delay + 20, delay + 50, delay + 80],
    [1, 1.02, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    frame,
    [delay, delay + 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scaleIn * pulse})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* Primary CTA button */}
      <div
        style={{
          background: colors.accent,
          color: "#FFFFFF",
          fontFamily: typography.headlineFont || scale.headlineFont,
          fontSize: scale.subheadline,
          fontWeight: 700,
          paddingTop: 32,
          paddingBottom: 32,
          paddingLeft: 72,
          paddingRight: 72,
          borderRadius: 100,
          letterSpacing: "-0.01em",
          boxShadow: `0 20px 60px ${colors.accent}60`,
          whiteSpace: "nowrap",
        }}
      >
        {cta.primary}
      </div>

      {/* Secondary text */}
      {cta.secondary && (
        <div
          style={{
            fontFamily: scale.bodyFont,
            fontSize: scale.caption,
            fontWeight: 500,
            color: colors.textSecondary,
            letterSpacing: "0.02em",
          }}
        >
          {cta.secondary}
        </div>
      )}

      {/* URL */}
      {cta.url && (
        <div
          style={{
            fontFamily: scale.bodyFont,
            fontSize: scale.caption,
            fontWeight: 400,
            color: colors.textSecondary,
            opacity: 0.6,
          }}
        >
          {cta.url}
        </div>
      )}
    </div>
  );
};
