/**
 * HookScene
 *
 * Opening scene — grabs attention in the first 2–3 seconds.
 * Shows the main headline and subheadline over an animated gradient.
 *
 * Config fields used:
 *   content.headline, content.subheadline
 *   brand.colors, brand.typography
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { AdConfig } from "../data/types";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { GradientBackground } from "../components/GradientBackground";
import { SceneWrapper } from "../components/SceneWrapper";
import { SubtitleText } from "../components/SubtitleText";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const HookScene: React.FC<Props> = ({ config, durationFrames }) => {
  const { brand, content } = config;

  // Detect high-contrast template styles that need a light background
  const useLight = brand.colors.background === "#FFFFFF";

  return (
    <AbsoluteFill>
      <GradientBackground
        colors={brand.colors}
        style={useLight ? "radial" : "mesh"}
        animated
      />

      <SceneWrapper
        durationFrames={durationFrames}
        padding={80}
        justify="center"
        align="center"
      >
        {/* Main hook headline */}
        <AnimatedHeadline
          text={content.headline}
          size="headline"
          align="center"
          delay={6}
          typography={brand.typography}
          colors={brand.colors}
        />

        {/* Supporting subheadline */}
        {content.subheadline && (
          <SubtitleText
            text={content.subheadline}
            size="body"
            align="center"
            delay={20}
            typography={brand.typography}
            colors={brand.colors}
            maxWidth={880}
          />
        )}
      </SceneWrapper>
    </AbsoluteFill>
  );
};
