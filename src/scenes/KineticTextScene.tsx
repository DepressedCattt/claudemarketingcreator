/**
 * KineticTextScene
 *
 * Full-screen word/line-by-line text animation — TikTok/Reels energy.
 * Each line slams, drifts, or types onto screen with spring physics.
 *
 * Required sceneProps (KineticTextProps):
 *   lines        — array of text strings, each appears in sequence
 *   style        — "slam" | "drift" | "typewriter" (default: "slam")
 *   fontSize     — px override (default: 96)
 *   lineDelay    — frames between each line appearing (default: 18)
 *   highlightLines — indices of lines to colour in brand.accent
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { KineticTextProps } from "../data/types";
import { AdConfig } from "../data/types";
import { useWordDrift, useWordSlam, useTypewriter, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

// ─── Individual Line ──────────────────────────────────────────────────────────

const KineticLine: React.FC<{
  text: string;
  startFrame: number;
  style: "slam" | "drift" | "typewriter";
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: number;
  align: "center" | "left";
}> = ({ text, startFrame, style, fontSize, color, fontFamily, fontWeight, align }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slam
  const slam = useWordSlam(startFrame);

  // Drift
  const drift = useWordDrift(startFrame);

  // Typewriter
  const visibleChars = useTypewriter(text, startFrame, 2.2);

  const sharedStyle: React.CSSProperties = {
    fontFamily,
    fontSize,
    fontWeight,
    color,
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    textAlign: align,
    width: "100%",
    padding: "0 60px",
    willChange: "transform, opacity",
  };

  if (style === "slam") {
    return (
      <div
        style={{
          ...sharedStyle,
          opacity: slam.opacity,
          transform: `scale(${slam.scale}) translateY(${slam.translateY}px)`,
        }}
      >
        {text}
      </div>
    );
  }

  if (style === "drift") {
    return (
      <div
        style={{
          ...sharedStyle,
          opacity: drift.opacity,
          transform: `translateY(${drift.translateY}px)`,
        }}
      >
        {text}
      </div>
    );
  }

  // Typewriter
  const cursorOpacity = interpolate(
    frame % 30,
    [0, 15, 16, 29],
    [1, 1, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const isComplete = visibleChars >= text.length;

  return (
    <div style={{ ...sharedStyle, opacity: frame >= startFrame ? 1 : 0 }}>
      {text.slice(0, visibleChars)}
      {!isComplete && (
        <span style={{ opacity: cursorOpacity, color: "inherit" }}>|</span>
      )}
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const KineticTextScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as KineticTextProps;
  const lines = props.lines ?? ["No lines", "configured"];
  const style = props.style ?? "slam";
  const fontSize = props.fontSize ?? 96;
  const lineDelay = props.lineDelay ?? 18;
  const highlightLines = props.highlightLines ?? [];

  // Scene fade out
  const fadeOut = useFadeOut(durationFrames, 10);

  // Background — solid dark with subtle primary orb
  const orbOpacity = interpolate(frame, [0, 20], [0, 0.25], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Subtle background flash on first slam
  const flashOpacity = style === "slam"
    ? interpolate(frame, [0, 3, 12], [0.12, 0.12, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 0;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Base background */}
      <AbsoluteFill style={{ background: brand.colors.background }} />

      {/* Ambient orb */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${brand.colors.primary} 0%, transparent 65%)`,
          opacity: orbOpacity,
        }}
      />

      {/* Flash on slam */}
      <AbsoluteFill
        style={{
          background: brand.colors.accent,
          opacity: flashOpacity,
        }}
      />

      {/* Lines — stacked vertically, centered */}
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: style === "typewriter" ? 12 : 24,
        }}
      >
        {lines.map((line, i) => {
          const startFrame = i * lineDelay;
          const isHighlighted = highlightLines.includes(i);
          const color = isHighlighted ? brand.colors.accent : brand.colors.text;

          return (
            <KineticLine
              key={i}
              text={line}
              startFrame={startFrame}
              style={style}
              fontSize={fontSize}
              color={color}
              fontFamily={brand.typography.headlineFont || typo.headlineFont}
              fontWeight={typo.headlineWeight}
              align="center"
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
