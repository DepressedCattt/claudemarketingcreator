/**
 * SplitRevealScene
 *
 * Phase 1 (frames 0 → splitFrame): Full-screen "Before" state.
 * Phase 2 (splitFrame → end): Screen divides — left panel clips to 50%,
 *   right panel grows from 0% → 50% with spring physics.
 *   A glowing divider line pulses at the join.
 *
 * Required sceneProps (SplitRevealProps):
 *   leftLabel, leftText, leftEmoji   — the "before" side
 *   rightLabel, rightText, rightEmoji — the "after" side
 *   splitFrame                        — frame at which split begins (default: 20)
 */

import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SplitRevealProps } from "../data/types";
import { AdConfig } from "../data/types";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const SplitRevealScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as SplitRevealProps;
  const splitFrame = props.splitFrame ?? 20;

  const leftLabel  = props.leftLabel  ?? "Before";
  const leftText   = props.leftText   ?? "";
  const leftEmoji  = props.leftEmoji  ?? "😫";
  const rightLabel = props.rightLabel ?? "After";
  const rightText  = props.rightText  ?? "";
  const rightEmoji = props.rightEmoji ?? "✨";

  // Spring from 0 → 1 starting at splitFrame
  const splitProgress = spring({
    frame: frame - splitFrame,
    fps,
    config: { damping: 16, stiffness: 90, mass: 1 },
    from: 0,
    to: 1,
  });

  // Left panel fills 100% before split, shrinks to 50% after
  const leftWidth  = 100 - splitProgress * 50;  // 100% → 50%
  const rightWidth = splitProgress * 50;          // 0%   → 50%

  // Divider line fades in as split starts
  const dividerOpacity = interpolate(frame, [splitFrame, splitFrame + 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Left content fades in from the start
  const leftContentOpacity = useFadeIn(4, 14);

  // Right content waits for the panel to be wide enough before fading in
  const rightContentOpacity = interpolate(
    frame,
    [splitFrame + 14, splitFrame + 28],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const sceneOpacity = useFadeOut(durationFrames, 10);

  const labelStyle: React.CSSProperties = {
    fontFamily: typo.bodyFont,
    fontSize: typo.caption,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
  };

  const mainTextStyle: React.CSSProperties = {
    fontFamily: brand.typography.headlineFont || typo.headlineFont,
    fontSize: typo.subheadline,
    fontWeight: typo.headlineWeight,
    lineHeight: 1.15,
    letterSpacing: typo.headlineLetterSpacing,
    textAlign: "center" as const,
  };

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, overflow: "hidden" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${leftWidth}%`,
          height: "100%",
          overflow: "hidden",
          background: `linear-gradient(160deg, #0a0a0a 0%, ${brand.colors.background} 100%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 28,
          padding: "80px 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Vignette overlay */}
        <AbsoluteFill
          style={{
            background: "radial-gradient(ellipse at 30% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ opacity: leftContentOpacity, ...labelStyle, color: "#ef4444", position: "relative", zIndex: 1 }}>
          {leftLabel}
        </div>
        <div style={{ opacity: leftContentOpacity, fontSize: 80, lineHeight: 1, position: "relative", zIndex: 1 }}>
          {leftEmoji}
        </div>
        <div style={{ ...mainTextStyle, color: brand.colors.text, opacity: leftContentOpacity * 0.85, position: "relative", zIndex: 1, width: "100%" }}>
          {leftText}
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${rightWidth}%`,
          height: "100%",
          overflow: "hidden",
          background: `linear-gradient(160deg, ${brand.colors.primary} 0%, ${brand.colors.secondary} 100%)`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 28,
          padding: "80px 40px",
          boxSizing: "border-box",
        }}
      >
        {/* Glow inside right panel */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at 60% 40%, ${brand.colors.accent}35 0%, transparent 60%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ opacity: rightContentOpacity, ...labelStyle, color: brand.colors.accent, whiteSpace: "nowrap", position: "relative", zIndex: 1 }}>
          {rightLabel}
        </div>
        <div style={{ opacity: rightContentOpacity, fontSize: 80, lineHeight: 1, position: "relative", zIndex: 1 }}>
          {rightEmoji}
        </div>
        <div style={{ ...mainTextStyle, color: "#fff", opacity: rightContentOpacity, position: "relative", zIndex: 1, width: "100%" }}>
          {rightText}
        </div>
      </div>

      {/* ── DIVIDER LINE ───────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${leftWidth}%`,
          width: 3,
          opacity: dividerOpacity,
          background: `linear-gradient(180deg, transparent 0%, ${brand.colors.accent} 25%, ${brand.colors.accent} 75%, transparent 100%)`,
          boxShadow: `0 0 24px ${brand.colors.accent}90`,
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      />
    </AbsoluteFill>
  );
};
