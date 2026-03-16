/**
 * AnimatedHeadline
 *
 * Spring-animated heading text. Slides up from below and fades in.
 * Supports accent-colored words and multiple size tiers.
 */

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ColorConfig, TypographyConfig } from "../data/types";
import { useFadeIn } from "../utils/animation";
import { getTypography } from "../utils/typography";

type HeadlineSize = "display" | "headline" | "subheadline";

interface Props {
  text: string;
  size?: HeadlineSize;
  /** Explicit color override — defaults to colors.text */
  color?: string;
  align?: "left" | "center" | "right";
  /** Frame at which to start the entrance animation */
  delay?: number;
  typography: TypographyConfig;
  colors: ColorConfig;
  /**
   * Words in this array will be rendered in colors.accent.
   * Must match exactly (case-sensitive).
   */
  accentWords?: string[];
  /** Override font weight */
  weight?: number;
}

export const AnimatedHeadline: React.FC<Props> = ({
  text,
  size = "headline",
  color,
  align = "center",
  delay = 0,
  typography,
  colors,
  accentWords = [],
  weight,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = getTypography(typography.preset);

  const opacity = useFadeIn(delay, 12);

  const translateY = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.8 },
    from: 40,
    to: 0,
  });

  const textColor = color || colors.text;
  const fontFamily = typography.headlineFont || scale.headlineFont;

  // Split by spaces while preserving newlines
  const words = text.split(" ");

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        fontFamily,
        fontSize: scale[size],
        fontWeight: weight ?? scale.headlineWeight,
        color: textColor,
        textAlign: align,
        lineHeight: scale.headlineLineHeight,
        letterSpacing: scale.headlineLetterSpacing,
        width: "100%",
      }}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            color: accentWords.includes(word) ? colors.accent : textColor,
            display: "inline",
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
};
