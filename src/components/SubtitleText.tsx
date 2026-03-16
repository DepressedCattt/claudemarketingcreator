/**
 * SubtitleText
 *
 * Animated supporting text — subheadlines, body copy, captions.
 * Appears slightly after the headline with a gentler animation.
 */

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ColorConfig, TypographyConfig } from "../data/types";
import { useFadeIn } from "../utils/animation";
import { getTypography } from "../utils/typography";

type TextSize = "subheadline" | "body" | "caption";

interface Props {
  text: string;
  size?: TextSize;
  color?: string;
  align?: "left" | "center" | "right";
  delay?: number;
  typography: TypographyConfig;
  colors: ColorConfig;
  maxWidth?: number;
}

export const SubtitleText: React.FC<Props> = ({
  text,
  size = "body",
  color,
  align = "center",
  delay = 0,
  typography,
  colors,
  maxWidth = 900,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = getTypography(typography.preset);

  const opacity = useFadeIn(delay, 14);

  const translateY = spring({
    frame: frame - delay,
    fps,
    config: { damping: 16, stiffness: 90, mass: 0.9 },
    from: 24,
    to: 0,
  });

  const textColor = color || colors.textSecondary;
  const fontFamily = typography.bodyFont || scale.bodyFont;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily,
        fontSize: scale[size],
        fontWeight: scale.bodyWeight,
        color: textColor,
        textAlign: align,
        lineHeight: 1.5,
        letterSpacing: "0.01em",
        maxWidth,
        width: "100%",
      }}
    >
      {text}
    </div>
  );
};
