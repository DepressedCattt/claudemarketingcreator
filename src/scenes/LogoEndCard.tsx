/**
 * LogoEndCard
 *
 * Clean final frame with brand logo, name, and website URL.
 * Stays on screen long enough for the viewer to register the brand.
 *
 * Config fields used:
 *   brand.name, brand.tagline, brand.logoPath, content.cta.url
 *   brand.colors, brand.typography
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { AdConfig } from "../data/types";
import { GradientBackground } from "../components/GradientBackground";
import { LogoLockup } from "../components/LogoLockup";
import { SceneWrapper } from "../components/SceneWrapper";
import { SubtitleText } from "../components/SubtitleText";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const LogoEndCard: React.FC<Props> = ({ config, durationFrames }) => {
  const { brand, content } = config;

  return (
    <AbsoluteFill>
      <GradientBackground colors={brand.colors} style="linear" animated />

      <SceneWrapper
        durationFrames={durationFrames}
        padding={80}
        justify="center"
        align="center"
        fadeOutFrames={0}
      >
        {/* Centered logo + name + tagline */}
        <LogoLockup
          brand={brand}
          delay={4}
          showImage
          showName
          showTagline
          size="large"
        />

        {/* Website URL */}
        {content.cta.url && (
          <SubtitleText
            text={content.cta.url}
            size="caption"
            align="center"
            delay={20}
            typography={brand.typography}
            colors={{
              ...brand.colors,
              textSecondary: brand.colors.accent,
            }}
          />
        )}
      </SceneWrapper>
    </AbsoluteFill>
  );
};
