/**
 * CTAScene
 *
 * Final call-to-action scene. Bold headline + CTA button + optional offer.
 * Uses the accent color for maximum impact.
 *
 * Config fields used:
 *   content.cta, content.offer
 *   brand.colors, brand.typography, brand.name
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { AdConfig } from "../data/types";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { CTACard } from "../components/CTACard";
import { GradientBackground } from "../components/GradientBackground";
import { SceneWrapper } from "../components/SceneWrapper";
import { SubtitleText } from "../components/SubtitleText";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const CTAScene: React.FC<Props> = ({ config, durationFrames }) => {
  const { brand, content } = config;

  return (
    <AbsoluteFill>
      <GradientBackground colors={brand.colors} style="mesh" animated />

      <SceneWrapper
        durationFrames={durationFrames}
        padding={80}
        justify="center"
        align="center"
      >
        {/* Urgency / closing headline */}
        <AnimatedHeadline
          text={content.offer
            ? content.offer
            : `Ready to try ${brand.name}?`}
          size="headline"
          align="center"
          delay={4}
          typography={brand.typography}
          colors={brand.colors}
        />

        {/* Value reminder */}
        {content.valueProp && (
          <SubtitleText
            text={content.valueProp}
            size="body"
            align="center"
            delay={16}
            typography={brand.typography}
            colors={brand.colors}
            maxWidth={820}
          />
        )}

        {/* CTA button */}
        <CTACard
          cta={content.cta}
          colors={brand.colors}
          typography={brand.typography}
          delay={24}
        />
      </SceneWrapper>
    </AbsoluteFill>
  );
};
