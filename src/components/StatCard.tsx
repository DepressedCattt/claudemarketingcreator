/**
 * StatCard
 *
 * Displays a single stat/metric (e.g. "$2.4B — Capital Deployed").
 * Slides in from the side with a spring animation.
 * Used in social-proof scenes.
 */

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ColorConfig, StatItem, TypographyConfig } from "../data/types";
import { useFadeIn } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  stat: StatItem;
  colors: ColorConfig;
  typography: TypographyConfig;
  delay?: number;
  /** Direction the card slides in from */
  direction?: "left" | "right" | "up";
}

export const StatCard: React.FC<Props> = ({
  stat,
  colors,
  typography,
  delay = 0,
  direction = "up",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = getTypography(typography.preset);

  const opacity = useFadeIn(delay, 12);

  const slideProgress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
  });

  const SLIDE = 50;
  const translateX =
    direction === "left"
      ? (1 - slideProgress) * -SLIDE
      : direction === "right"
      ? (1 - slideProgress) * SLIDE
      : 0;

  const translateY = direction === "up" ? (1 - slideProgress) * SLIDE : 0;

  return (
    <div
      style={{
        opacity,
        transform: `translate(${translateX}px, ${translateY}px)`,
        background: `${colors.primary}18`,
        border: `1px solid ${colors.primary}40`,
        borderRadius: 20,
        padding: "32px 48px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        minWidth: 220,
      }}
    >
      {/* Value */}
      <div
        style={{
          fontFamily: typography.headlineFont || scale.headlineFont,
          fontSize: scale.headline,
          fontWeight: 800,
          color: colors.text,
          letterSpacing: scale.headlineLetterSpacing,
          lineHeight: 1,
        }}
      >
        {stat.value}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: scale.bodyFont,
          fontSize: scale.caption,
          fontWeight: 500,
          color: colors.textSecondary,
          textAlign: "center",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        {stat.label}
      </div>
    </div>
  );
};
