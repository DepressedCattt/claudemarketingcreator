/**
 * SocialProofScene
 *
 * Displays social proof: testimonials and/or stats.
 * Automatically adapts layout based on what's available in the config.
 *
 * Config fields used:
 *   content.testimonials, content.stats, content.trustBadges
 *   brand.colors, brand.typography
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { AdConfig } from "../data/types";
import { GradientBackground } from "../components/GradientBackground";
import { SceneWrapper } from "../components/SceneWrapper";
import { StatCard } from "../components/StatCard";
import { SubtitleText } from "../components/SubtitleText";
import { TestimonialCard } from "../components/TestimonialCard";
import { staggerDelay } from "../utils/animation";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const SocialProofScene: React.FC<Props> = ({ config, durationFrames }) => {
  const { brand, content } = config;
  const testimonials = content.testimonials ?? [];
  const stats = content.stats ?? [];

  // Choose layout based on available content
  const hasTestimonial = testimonials.length > 0;
  const hasStats = stats.length > 0;

  return (
    <AbsoluteFill>
      <GradientBackground colors={brand.colors} style="radial" animated />

      <SceneWrapper
        durationFrames={durationFrames}
        padding={72}
        justify="center"
        align="center"
      >
        {/* Section label */}
        <SubtitleText
          text="Trusted by thousands"
          size="caption"
          align="center"
          delay={4}
          typography={brand.typography}
          colors={{
            ...brand.colors,
            textSecondary: brand.colors.accent,
          }}
        />

        {/* Stats row */}
        {hasStats && (
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 24,
              justifyContent: "center",
              flexWrap: "wrap",
              width: "100%",
            }}
          >
            {stats.slice(0, 3).map((stat, i) => (
              <StatCard
                key={i}
                stat={stat}
                colors={brand.colors}
                typography={brand.typography}
                delay={12 + staggerDelay(i, 10)}
                direction="up"
              />
            ))}
          </div>
        )}

        {/* Testimonial */}
        {hasTestimonial && (
          <TestimonialCard
            testimonial={testimonials[0]}
            colors={brand.colors}
            typography={brand.typography}
            delay={hasStats ? 30 : 12}
          />
        )}

        {/* Trust badges */}
        {content.trustBadges && content.trustBadges.length > 0 && (
          <SubtitleText
            text={content.trustBadges.join("  ·  ")}
            size="caption"
            align="center"
            delay={hasStats || hasTestimonial ? 40 : 12}
            typography={brand.typography}
            colors={brand.colors}
          />
        )}
      </SceneWrapper>
    </AbsoluteFill>
  );
};
