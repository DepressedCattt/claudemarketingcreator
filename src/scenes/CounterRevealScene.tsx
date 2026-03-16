/**
 * CounterRevealScene
 *
 * Dramatic animated number counters that count up live on screen.
 * Numbers ease in fast and decelerate into their target — feels like watching
 * a live scoreboard or revenue ticker.
 *
 * Required sceneProps (CounterRevealProps):
 *   counters     — array of { from?, to, prefix?, suffix?, label }
 *   headline     — optional headline above the counters
 *   startDelay   — frames before counting begins (default: 10)
 *   countDuration— frames the count animation takes (default: 60)
 */

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CounterRevealProps, CounterItem } from "../data/types";
import { AdConfig } from "../data/types";
import { useCountUp, useFadeIn, useFadeOut, useScaleIn, staggerDelay } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

// ─── Single Counter ───────────────────────────────────────────────────────────

const AnimatedCounter: React.FC<{
  counter: CounterItem;
  delay: number;
  startDelay: number;
  countDuration: number;
  colors: AdConfig["brand"]["colors"];
  typography: AdConfig["brand"]["typography"];
}> = ({ counter, delay, startDelay, countDuration, colors, typography }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(typography.preset);

  const from = counter.from ?? 0;
  const to = counter.to;

  const cardEntranceFrame = delay;
  const countStart = startDelay + delay;

  // Card entrance
  const cardOpacity = useFadeIn(cardEntranceFrame, 14);
  const cardScale = useScaleIn(cardEntranceFrame, 0.8);

  // Number count-up
  const currentValue = useCountUp(from, to, countStart, countDuration);

  // Glow pulse on the number as it finishes counting
  const glowOpacity = interpolate(
    frame,
    [countStart + countDuration, countStart + countDuration + 10, countStart + countDuration + 30],
    [0, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Format the number with commas if large
  const formatted = to >= 1000
    ? currentValue.toLocaleString()
    : currentValue.toString();

  return (
    <div
      style={{
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        flex: 1,
        minWidth: 200,
        padding: "40px 24px",
        background: `${colors.primary}18`,
        border: `1px solid ${colors.primary}30`,
        borderRadius: 28,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow flash when count finishes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${colors.accent}60 0%, transparent 70%)`,
          opacity: glowOpacity,
          borderRadius: 28,
        }}
      />

      {/* Number */}
      <div
        style={{
          fontFamily: typography.headlineFont || typo.headlineFont,
          fontSize: typo.display,
          fontWeight: 900,
          color: colors.accent,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          position: "relative",
          zIndex: 1,
        }}
      >
        {counter.prefix ?? ""}{formatted}{counter.suffix ?? ""}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: typo.bodyFont,
          fontSize: typo.caption,
          fontWeight: 500,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 1.3,
          position: "relative",
          zIndex: 1,
        }}
      >
        {counter.label}
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const CounterRevealScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as CounterRevealProps;
  const counters = props.counters ?? [];
  const headline = props.headline;
  const startDelay = props.startDelay ?? 10;
  const countDuration = props.countDuration ?? 60;

  const fadeOut = useFadeOut(durationFrames, 10);

  // Headline entrance
  const headlineOpacity = useFadeIn(4, 14);
  const headlineY = interpolate(frame, [4, 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Animated background lines (decorative)
  const lineProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Deep dark background */}
      <AbsoluteFill style={{ background: brand.colors.background }} />

      {/* Decorative grid lines */}
      <AbsoluteFill style={{ opacity: 0.06 }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${(i + 1) * 12.5}%`,
              height: 1,
              background: brand.colors.primary,
              opacity: lineProgress,
            }}
          />
        ))}
      </AbsoluteFill>

      {/* Bottom accent gradient */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(0deg, ${brand.colors.primary}20 0%, transparent 40%)`,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 48,
          padding: "80px 60px",
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
              textAlign: "center",
              lineHeight: 1.15,
              letterSpacing: typo.headlineLetterSpacing,
            }}
          >
            {headline}
          </div>
        )}

        {/* Counter cards */}
        <div
          style={{
            display: "flex",
            flexDirection: counters.length > 2 ? "column" : "row",
            gap: 20,
            width: "100%",
          }}
        >
          {counters.map((counter, i) => (
            <AnimatedCounter
              key={i}
              counter={counter}
              delay={8 + staggerDelay(i, 12)}
              startDelay={startDelay}
              countDuration={countDuration}
              colors={brand.colors}
              typography={brand.typography}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
