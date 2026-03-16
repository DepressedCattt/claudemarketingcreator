/**
 * Flip3DScene
 *
 * Cards start showing their "back" (teaser/question side), then
 * spring-flip in sequence to reveal their "front" (answer/content).
 * Uses CSS 3D transforms with perspective for depth.
 *
 * Required sceneProps (FlipCardSceneProps):
 *   cards      — array of { backIcon, backText, frontIcon, frontTitle, frontBody }
 *   flipDelay  — frames between each card flip (default: 18)
 *   headline   — optional headline above the cards
 */

import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AdConfig, FlipCardSceneProps, FlipCardItem } from "../data/types";
import { GlassCard } from "../components/GlassCard";
import { FilmGrain } from "../components/FilmGrain";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

// ─── Single flipping card ─────────────────────────────────────────────────────

const FlipCard: React.FC<{
  card: FlipCardItem;
  flipFrame: number;
  brand: AdConfig["brand"];
  typo: ReturnType<typeof getTypography>;
}> = ({ card, flipFrame, brand, typo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rotationY = spring({
    frame: frame - flipFrame,
    fps,
    config: { damping: 13, stiffness: 100, mass: 0.9 },
    from: 180,
    to: 0,
  });

  const showFront = rotationY <= 90;
  const accentColor = card.accentColor || brand.colors.accent;

  return (
    <div
      style={{
        width: "100%",
        height: 260,
        perspective: 1200,
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotationY}deg)`,
          transition: "none",
        }}
      >
        {/* BACK face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `${brand.colors.text}06`,
            border: `1px solid ${brand.colors.text}15`,
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 12,
            padding: "24px 28px",
          }}
        >
          <div style={{ fontSize: 52 }}>{card.backIcon}</div>
          <div
            style={{
              fontFamily: typo.bodyFont,
              fontSize: typo.body,
              fontWeight: 600,
              color: brand.colors.textSecondary,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {card.backText}
          </div>
        </div>

        {/* FRONT face */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            background: `linear-gradient(135deg, ${accentColor}18, ${brand.colors.primary}18)`,
            border: `1px solid ${accentColor}30`,
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 10,
            padding: "28px 32px",
            boxShadow: `0 0 30px ${accentColor}20`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: `${accentColor}25`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 28,
                flexShrink: 0,
              }}
            >
              {card.frontIcon}
            </div>
            <div
              style={{
                fontFamily: brand.typography.headlineFont || typo.headlineFont,
                fontSize: typo.body,
                fontWeight: 700,
                color: brand.colors.text,
                lineHeight: 1.2,
              }}
            >
              {card.frontTitle}
            </div>
          </div>
          <div
            style={{
              fontFamily: typo.bodyFont,
              fontSize: typo.caption,
              fontWeight: 400,
              color: brand.colors.textSecondary,
              lineHeight: 1.45,
              paddingLeft: 68,
            }}
          >
            {card.frontBody}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const Flip3DScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as FlipCardSceneProps;
  const cards     = props.cards     ?? [];
  const flipDelay = props.flipDelay ?? 18;
  const headline  = props.headline;

  const sceneOpacity    = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(4, 14);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <AbsoluteFill style={{ background: brand.colors.background }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${brand.colors.primary}15 0%, transparent 60%)`,
        }}
      />
      <FilmGrain opacity={0.04} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 64px",
          gap: 28,
        }}
      >
        {headline && (
          <div
            style={{
              opacity: headlineOpacity,
              fontFamily: brand.typography.headlineFont || typo.headlineFont,
              fontSize: typo.subheadline,
              fontWeight: typo.headlineWeight,
              color: brand.colors.text,
              lineHeight: 1.15,
              letterSpacing: typo.headlineLetterSpacing,
              marginBottom: 8,
            }}
          >
            {headline}
          </div>
        )}

        {cards.map((card, i) => (
          <FlipCard
            key={i}
            card={card}
            flipFrame={6 + i * flipDelay}
            brand={brand}
            typo={typo}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
