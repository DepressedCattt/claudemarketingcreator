/**
 * ProblemScene
 *
 * Identifies the pain point the audience faces.
 * Uses a darker treatment to convey tension, then builds into bullet points.
 *
 * Config fields used:
 *   content.painPoints, content.targetAudience
 *   brand.colors, brand.typography
 */

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AdConfig } from "../data/types";
import { AnimatedHeadline } from "../components/AnimatedHeadline";
import { GradientBackground } from "../components/GradientBackground";
import { SceneWrapper } from "../components/SceneWrapper";
import { getTypography } from "../utils/typography";
import { staggerDelay } from "../utils/animation";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

/** A single pain point bullet with staggered entrance */
const PainBullet: React.FC<{
  text: string;
  delay: number;
  colors: AdConfig["brand"]["colors"];
  typography: AdConfig["brand"]["typography"];
}> = ({ text, delay, colors, typography }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(typography.preset);

  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateX = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100 },
    from: -40,
    to: 0,
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        width: "100%",
      }}
    >
      {/* Emoji cross / X indicator */}
      <span style={{ fontSize: typo.body, lineHeight: 1.5, flexShrink: 0 }}>❌</span>
      <span
        style={{
          fontFamily: typo.bodyFont,
          fontSize: typo.body,
          fontWeight: 500,
          color: colors.text,
          lineHeight: 1.5,
          opacity: 0.9,
        }}
      >
        {text}
      </span>
    </div>
  );
};

export const ProblemScene: React.FC<Props> = ({ config, durationFrames }) => {
  const { brand, content } = config;
  const painPoints = content.painPoints ?? [];

  return (
    <AbsoluteFill>
      {/* Darker, more muted background for tension */}
      <GradientBackground
        colors={brand.colors}
        style="solid"
        animated={false}
        baseColor={brand.colors.background}
      />
      {/* Subtle dark overlay */}
      <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />

      <SceneWrapper
        durationFrames={durationFrames}
        padding={80}
        justify="center"
        align="flex-start"
      >
        {/* Section label */}
        <div
          style={{
            fontFamily: getTypography(brand.typography.preset).bodyFont,
            fontSize: getTypography(brand.typography.preset).caption,
            fontWeight: 600,
            color: brand.colors.accent,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Sound familiar?
        </div>

        {/* Problem headline */}
        <AnimatedHeadline
          text={content.targetAudience
            ? `${content.targetAudience} deal with this every day.`
            : "Here's the problem."}
          size="subheadline"
          align="left"
          delay={6}
          typography={brand.typography}
          colors={brand.colors}
        />

        {/* Pain point bullets */}
        {painPoints.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              marginTop: 16,
              width: "100%",
            }}
          >
            {painPoints.map((point, i) => (
              <PainBullet
                key={i}
                text={point}
                delay={20 + staggerDelay(i, 12)}
                colors={brand.colors}
                typography={brand.typography}
              />
            ))}
          </div>
        )}
      </SceneWrapper>
    </AbsoluteFill>
  );
};
