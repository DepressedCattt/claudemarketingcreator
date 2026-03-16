/**
 * SolutionScene
 *
 * Introduces the brand as the solution to the problem.
 * Uses a bright, hopeful gradient and the brand name prominently.
 *
 * Config fields used:
 *   brand.name, content.valueProp
 *   brand.colors, brand.typography
 */

import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AdConfig } from "../data/types";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { GradientBackground } from "../components/GradientBackground";
import { LogoLockup } from "../components/LogoLockup";
import { SceneWrapper } from "../components/SceneWrapper";
import { SubtitleText } from "../components/SubtitleText";
import { useFadeIn } from "../utils/animation";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const SolutionScene: React.FC<Props> = ({ config, durationFrames }) => {
  const { brand, content } = config;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Divider line animation
  const lineWidth = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16, stiffness: 80, mass: 1 },
    from: 0,
    to: 200,
  });

  const lineOpacity = useFadeIn(10, 10);

  return (
    <AbsoluteFill>
      <GradientBackground colors={brand.colors} style="linear" animated />

      <SceneWrapper
        durationFrames={durationFrames}
        padding={80}
        justify="center"
        align="center"
      >
        {/* Introducing label */}
        <div
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: 28,
            fontWeight: 500,
            color: brand.colors.textSecondary,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          Introducing
        </div>

        {/* Brand logo + name */}
        <LogoLockup
          brand={brand}
          delay={8}
          showImage
          showName
          showTagline={!!brand.tagline}
          size="large"
        />

        {/* Decorative line */}
        <div
          style={{
            opacity: lineOpacity,
            width: lineWidth,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${brand.colors.accent}, transparent)`,
            borderRadius: 4,
          }}
        />

        {/* Value prop */}
        {content.valueProp && (
          <SubtitleText
            text={content.valueProp}
            size="body"
            align="center"
            delay={24}
            typography={brand.typography}
            colors={brand.colors}
            maxWidth={860}
          />
        )}
      </SceneWrapper>
    </AbsoluteFill>
  );
};
