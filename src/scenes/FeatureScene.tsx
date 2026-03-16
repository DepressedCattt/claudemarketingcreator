/**
 * FeatureScene
 *
 * Displays key features/benefits in a staggered list.
 * Optionally shows a phone mockup alongside the feature list
 * when app screenshots are available.
 *
 * Config fields used:
 *   content.features, media.appScreenshots
 *   brand.colors, brand.typography
 */

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AdConfig } from "../data/types";
import { GradientBackground } from "../components/GradientBackground";
import { PhoneMockup } from "../components/PhoneMockup";
import { SceneWrapper } from "../components/SceneWrapper";
import { getTypography } from "../utils/typography";
import { staggerDelay } from "../utils/animation";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

/** A single feature row with icon, title, description */
const FeatureRow: React.FC<{
  icon?: string;
  title: string;
  description?: string;
  delay: number;
  colors: AdConfig["brand"]["colors"];
  typography: AdConfig["brand"]["typography"];
}> = ({ icon, title, description, delay, colors, typography }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(typography.preset);

  const opacity = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 100 },
    from: 24,
    to: 0,
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        width: "100%",
        background: `${colors.text}06`,
        border: `1px solid ${colors.text}12`,
        borderRadius: 20,
        padding: "28px 32px",
      }}
    >
      {/* Icon / checkmark */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: `${colors.accent}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          flexShrink: 0,
        }}
      >
        {icon || "✓"}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div
          style={{
            fontFamily: typo.headlineFont,
            fontSize: typo.body,
            fontWeight: 700,
            color: colors.text,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontFamily: typo.bodyFont,
              fontSize: typo.caption,
              fontWeight: 400,
              color: colors.textSecondary,
              lineHeight: 1.5,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export const FeatureScene: React.FC<Props> = ({ config, durationFrames }) => {
  const { brand, content, media } = config;
  const features = content.features ?? [];
  const hasScreenshot = !!media.appScreenshots?.[0];

  return (
    <AbsoluteFill>
      <GradientBackground colors={brand.colors} style="solid" animated={false} />
      {/* Subtle top gradient overlay */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${brand.colors.primary}15 0%, transparent 50%)`,
        }}
      />

      {hasScreenshot ? (
        /* Side-by-side layout when we have a screenshot */
        <SceneWrapper
          durationFrames={durationFrames}
          padding={60}
          justify="center"
          align="center"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 40,
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Feature list (left) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                flex: 1,
              }}
            >
              {features.slice(0, 3).map((feature, i) => (
                <FeatureRow
                  key={i}
                  {...feature}
                  delay={8 + staggerDelay(i, 14)}
                  colors={brand.colors}
                  typography={brand.typography}
                />
              ))}
            </div>

            {/* Phone mockup (right) */}
            <PhoneMockup
              screenshotSrc={media.appScreenshots![0]}
              colors={brand.colors}
              delay={4}
              width={240}
              floating
            />
          </div>
        </SceneWrapper>
      ) : (
        /* Stacked list layout when no screenshot */
        <SceneWrapper
          durationFrames={durationFrames}
          padding={72}
          justify="center"
          align="flex-start"
        >
          {features.slice(0, 4).map((feature, i) => (
            <FeatureRow
              key={i}
              {...feature}
              delay={6 + staggerDelay(i, 14)}
              colors={brand.colors}
              typography={brand.typography}
            />
          ))}
        </SceneWrapper>
      )}
    </AbsoluteFill>
  );
};
