/**
 * TimelineScene
 *
 * A "how it works" step-by-step timeline. Steps cascade in from the right,
 * one at a time, while a vertical line grows downward to connect them.
 * Clean, reassuring, converts skeptics into believers.
 *
 * Required sceneProps (TimelineProps):
 *   steps      — array of { icon, title, subtitle?, time? }
 *   headline   — optional headline above the timeline
 *   stepDelay  — frames between steps (default: 16)
 */

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TimelineProps, TimelineStep } from "../data/types";
import { AdConfig } from "../data/types";
import { useFadeIn, useFadeOut, useSlideInRight } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

// ─── Single Step Card ─────────────────────────────────────────────────────────

const TimelineStepCard: React.FC<{
  step: TimelineStep;
  index: number;
  startFrame: number;
  isLast: boolean;
  colors: AdConfig["brand"]["colors"];
  typography: AdConfig["brand"]["typography"];
  lineProgress: number;
}> = ({ step, index, startFrame, isLast, colors, typography, lineProgress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(typography.preset);

  const cardOpacity = useFadeIn(startFrame, 14);
  const cardX = useSlideInRight(startFrame, 60);

  // Node dot scale-in
  const dotScale = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 12, stiffness: 140, mass: 0.7 },
    from: 0,
    to: 1,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 24,
        alignItems: "flex-start",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Left column: dot + line segment */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: 48,
          flexShrink: 0,
        }}
      >
        {/* Node circle */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            transform: `scale(${dotScale})`,
            boxShadow: `0 0 16px ${colors.accent}50`,
            flexShrink: 0,
            zIndex: 2,
          }}
        >
          {step.icon}
        </div>

        {/* Connector line below (hidden for last item) */}
        {!isLast && (
          <div
            style={{
              width: 2,
              flex: 1,
              minHeight: 24,
              background: `linear-gradient(180deg, ${colors.accent}60, ${colors.primary}20)`,
              marginTop: 4,
            }}
          />
        )}
      </div>

      {/* Right column: card content */}
      <div
        style={{
          opacity: cardOpacity,
          transform: `translateX(${cardX}px)`,
          flex: 1,
          background: `${colors.text}06`,
          border: `1px solid ${colors.primary}25`,
          borderRadius: 20,
          padding: "20px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginBottom: isLast ? 0 : 8,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontFamily: typography.headlineFont || typo.headlineFont,
              fontSize: typo.body,
              fontWeight: 700,
              color: colors.text,
              lineHeight: 1.2,
            }}
          >
            {step.title}
          </div>
          {step.time && (
            <div
              style={{
                fontFamily: typo.bodyFont,
                fontSize: typo.caption - 4,
                fontWeight: 600,
                color: colors.accent,
                background: `${colors.accent}18`,
                border: `1px solid ${colors.accent}30`,
                borderRadius: 20,
                padding: "4px 12px",
                whiteSpace: "nowrap",
              }}
            >
              {step.time}
            </div>
          )}
        </div>

        {step.subtitle && (
          <div
            style={{
              fontFamily: typo.bodyFont,
              fontSize: typo.caption,
              fontWeight: 400,
              color: colors.textSecondary,
              lineHeight: 1.4,
            }}
          >
            {step.subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const TimelineScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as TimelineProps;
  const steps = props.steps ?? [];
  const headline = props.headline;
  const stepDelay = props.stepDelay ?? 16;

  const sceneOpacity = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(4, 14);
  const headlineY = interpolate(frame, [4, 20], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <AbsoluteFill style={{ background: brand.colors.background }} />
      {/* Subtle top gradient accent */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${brand.colors.primary}18 0%, transparent 35%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 64px",
          gap: 36,
        }}
      >
        {/* Headline */}
        {headline && (
          <div
            style={{
              opacity: headlineOpacity,
              transform: `translateY(${headlineY}px)`,
              fontFamily: brand.typography.headlineFont || typo.headlineFont,
              fontSize: typo.subheadline,
              fontWeight: typo.headlineWeight,
              color: brand.colors.text,
              lineHeight: 1.15,
              letterSpacing: typo.headlineLetterSpacing,
            }}
          >
            {headline}
          </div>
        )}

        {/* Steps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            width: "100%",
          }}
        >
          {steps.map((step, i) => (
            <TimelineStepCard
              key={i}
              step={step}
              index={i}
              startFrame={8 + i * stepDelay}
              isLast={i === steps.length - 1}
              colors={brand.colors}
              typography={brand.typography}
              lineProgress={1}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
