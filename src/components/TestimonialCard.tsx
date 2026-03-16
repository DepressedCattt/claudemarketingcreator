/**
 * TestimonialCard
 *
 * Displays a user testimonial with quote, author, role, and star rating.
 * Animates in with a scale + fade spring.
 */

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ColorConfig, Testimonial, TypographyConfig } from "../data/types";
import { useFadeIn } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  testimonial: Testimonial;
  colors: ColorConfig;
  typography: TypographyConfig;
  delay?: number;
}

/** Renders 1–5 filled stars */
const StarRating: React.FC<{ rating: number; color: string; size: number }> = ({
  rating,
  color,
  size,
}) => (
  <div style={{ display: "flex", gap: 6 }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        style={{
          fontSize: size,
          color: i < rating ? "#F59E0B" : color + "40",
        }}
      >
        ★
      </span>
    ))}
  </div>
);

export const TestimonialCard: React.FC<Props> = ({
  testimonial,
  colors,
  typography,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = getTypography(typography.preset);

  const opacity = useFadeIn(delay, 15);

  const scaleIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.9 },
    from: 0.88,
    to: 1,
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scaleIn})`,
        background: `${colors.text}08`,
        border: `1px solid ${colors.text}18`,
        borderRadius: 24,
        padding: "48px 56px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
        width: "100%",
        boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
      }}
    >
      {/* Stars */}
      {testimonial.rating && (
        <StarRating
          rating={testimonial.rating}
          color={colors.text}
          size={scale.body}
        />
      )}

      {/* Quote */}
      <div
        style={{
          fontFamily: typography.bodyFont || scale.bodyFont,
          fontSize: scale.body,
          fontWeight: 500,
          color: colors.text,
          lineHeight: 1.6,
          fontStyle: "italic",
        }}
      >
        "{testimonial.quote}"
      </div>

      {/* Author */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div
          style={{
            fontFamily: scale.headlineFont,
            fontSize: scale.caption,
            fontWeight: 700,
            color: colors.text,
          }}
        >
          {testimonial.author}
        </div>
        {testimonial.role && (
          <div
            style={{
              fontFamily: scale.bodyFont,
              fontSize: scale.caption,
              fontWeight: 400,
              color: colors.textSecondary,
            }}
          >
            {testimonial.role}
          </div>
        )}
      </div>
    </div>
  );
};
