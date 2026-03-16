/**
 * ParticleScene
 *
 * Full-screen particle spectacle with an optional headline overlay.
 * Perfect for celebration moments, dramatic hooks, or brand energy.
 *
 * Required sceneProps (ParticleSceneProps):
 *   effect    — "confetti" | "embers" | "sparks" | "bubbles" | "matrix"
 *   count     — number of particles (default: 80)
 *   headline  — optional text overlay
 *   subtext   — optional supporting text
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { AdConfig, ParticleSceneProps } from "../data/types";
import { ParticleSystem } from "../components/ParticleSystem";
import { GradientText } from "../components/GradientText";
import { FilmGrain } from "../components/FilmGrain";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const ParticleScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as ParticleSceneProps;
  const effect   = props.effect   ?? "confetti";
  const count    = props.count    ?? 80;
  const headline = props.headline;
  const subtext  = props.subtext;

  const sceneOpacity   = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(10, 18);
  const subtextOpacity  = useFadeIn(26, 16);

  // Pick particle colours from brand palette
  const particleColors = [
    brand.colors.accent,
    brand.colors.primary,
    brand.colors.text,
    brand.colors.textSecondary,
  ];

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <AbsoluteFill style={{ background: brand.colors.background }} />

      {/* Particle layer */}
      <ParticleSystem effect={effect} count={count} colors={particleColors} />

      {/* Film grain over everything for texture */}
      <FilmGrain opacity={0.05} />

      {/* Text overlay */}
      {(headline || subtext) && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 24,
            padding: "80px 72px",
            pointerEvents: "none",
          }}
        >
          {headline && (
            <div style={{ opacity: headlineOpacity, width: "100%", textAlign: "center" }}>
              <GradientText
                text={headline}
                gradientColors={[brand.colors.accent, brand.colors.text, brand.colors.textSecondary]}
                fontSize={typo.headline}
                fontFamily={brand.typography.headlineFont || typo.headlineFont}
                fontWeight={typo.headlineWeight}
                letterSpacing={typo.headlineLetterSpacing}
                lineHeight={typo.headlineLineHeight}
                animated
              />
            </div>
          )}

          {subtext && (
            <div
              style={{
                opacity: subtextOpacity,
                fontFamily: typo.bodyFont,
                fontSize: typo.body,
                fontWeight: 400,
                color: brand.colors.textSecondary,
                textAlign: "center",
                lineHeight: 1.5,
                maxWidth: 860,
              }}
            >
              {subtext}
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
