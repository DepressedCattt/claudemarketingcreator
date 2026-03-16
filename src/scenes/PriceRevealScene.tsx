/**
 * PriceRevealScene
 *
 * Dramatic price/offer reveal sequence:
 *   1. Old price appears (crossed out with an animated strike-through line)
 *   2. New price slams up from below with spring physics
 *   3. Savings badge spins and scales into view
 *   4. Subtext fades in with the brand CTA
 *
 * Required sceneProps (PriceRevealProps):
 *   originalPrice — e.g. "£3,000/mo"
 *   newPrice      — e.g. "£0 upfront"
 *   savings       — e.g. "Save £800/month"
 *   badge         — e.g. "Limited Time"
 *   subtext       — e.g. "Pay only for the hours you use"
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { PriceRevealProps } from "../data/types";
import { AdConfig } from "../data/types";
import {
  useFadeIn,
  useFadeOut,
  useStrikethrough,
  usePulse,
  useScaleIn,
  useSlideUp,
} from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const PriceRevealScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand, content } = config;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as PriceRevealProps;
  const originalPrice = props.originalPrice ?? "£3,000/mo";
  const newPrice = props.newPrice ?? "Pay per hour";
  const savings = props.savings ?? "Save hundreds every month";
  const badge = props.badge ?? "Offer";
  const subtext = props.subtext ?? content.cta.secondary ?? "";

  // ── Timing ──────────────────────────────────────────────────────────────────
  const OLD_PRICE_IN  = 6;   // old price fades in
  const STRIKE_START  = 22;  // strikethrough wipe begins
  const NEW_PRICE_IN  = 38;  // new price slams up
  const BADGE_IN      = 52;  // badge pops in
  const SUBTEXT_IN    = 62;  // subtext fades in

  // ── Old price ────────────────────────────────────────────────────────────────
  const oldOpacity   = useFadeIn(OLD_PRICE_IN, 14);
  const oldSlideUp   = useSlideUp(OLD_PRICE_IN, 30);
  const strikeWidth  = useStrikethrough(STRIKE_START, 22);

  // Old price dims as strike lands
  const oldDimOpacity = interpolate(
    frame,
    [STRIKE_START + 10, STRIKE_START + 28],
    [1, 0.35],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── New price ─────────────────────────────────────────────────────────────
  const newPriceScale = spring({
    frame: frame - NEW_PRICE_IN,
    fps,
    config: { damping: 11, stiffness: 130, mass: 0.8 },
    from: 0.6,
    to: 1,
  });
  const newPriceOpacity = useFadeIn(NEW_PRICE_IN, 10);
  const newPriceY = useSlideUp(NEW_PRICE_IN, 50);

  // Screen flash on new price reveal
  const flashOpacity = interpolate(
    frame,
    [NEW_PRICE_IN, NEW_PRICE_IN + 4, NEW_PRICE_IN + 16],
    [0, 0.18, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Badge ────────────────────────────────────────────────────────────────────
  const badgeScale = spring({
    frame: frame - BADGE_IN,
    fps,
    config: { damping: 9, stiffness: 150, mass: 0.7 },
    from: 0,
    to: 1,
  });
  const badgePulse  = usePulse(80, 0.03);
  const badgeOpacity = useFadeIn(BADGE_IN, 8);

  // Badge rotation — snaps then settles
  const badgeRotation = spring({
    frame: frame - BADGE_IN,
    fps,
    config: { damping: 10, stiffness: 120 },
    from: -12,
    to: 0,
  });

  // ── Subtext ──────────────────────────────────────────────────────────────────
  const subtextOpacity = useFadeIn(SUBTEXT_IN, 16);

  // ── Scene fade ───────────────────────────────────────────────────────────────
  const sceneOpacity = useFadeOut(durationFrames, 10);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Background */}
      <AbsoluteFill style={{ background: brand.colors.background }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${brand.colors.primary}22 0%, transparent 65%)`,
        }}
      />

      {/* Flash on new price reveal */}
      <AbsoluteFill
        style={{
          background: brand.colors.accent,
          opacity: flashOpacity,
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 32,
          padding: "80px 72px",
        }}
      >
        {/* "Instead of paying..." label */}
        <div
          style={{
            opacity: oldOpacity,
            fontFamily: typo.bodyFont,
            fontSize: typo.caption,
            fontWeight: 500,
            color: brand.colors.textSecondary,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          Instead of
        </div>

        {/* Old price with animated strikethrough */}
        <div
          style={{
            position: "relative",
            opacity: oldOpacity * oldDimOpacity,
            transform: `translateY(${oldSlideUp}px)`,
          }}
        >
          <div
            style={{
              fontFamily: brand.typography.headlineFont || typo.headlineFont,
              fontSize: typo.display,
              fontWeight: 900,
              color: brand.colors.textSecondary,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              textAlign: "center",
            }}
          >
            {originalPrice}
          </div>

          {/* Strikethrough line */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "-4%",
              height: 5,
              borderRadius: 3,
              background: "#ef4444",
              width: `${strikeWidth + 8}%`,
              transform: "translateY(-50%)",
              boxShadow: "0 0 12px #ef444480",
            }}
          />
        </div>

        {/* New price */}
        <div
          style={{
            opacity: newPriceOpacity,
            transform: `scale(${newPriceScale}) translateY(${newPriceY}px)`,
          }}
        >
          <div
            style={{
              fontFamily: brand.typography.headlineFont || typo.headlineFont,
              fontSize: typo.display,
              fontWeight: 900,
              color: brand.colors.accent,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              textAlign: "center",
              textShadow: `0 0 40px ${brand.colors.accent}60`,
            }}
          >
            {newPrice}
          </div>
        </div>

        {/* Savings badge */}
        {savings && (
          <div
            style={{
              opacity: badgeOpacity,
              transform: `scale(${badgeScale * badgePulse}) rotate(${badgeRotation}deg)`,
              background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})`,
              border: `2px solid ${brand.colors.accent}50`,
              borderRadius: 50,
              padding: "14px 36px",
              boxShadow: `0 0 24px ${brand.colors.primary}60`,
            }}
          >
            <span
              style={{
                fontFamily: typo.bodyFont,
                fontSize: typo.body,
                fontWeight: 700,
                color: brand.colors.text,
                letterSpacing: "0.02em",
              }}
            >
              {savings}
            </span>
          </div>
        )}

        {/* Badge label */}
        {badge && (
          <div
            style={{
              opacity: badgeOpacity,
              transform: `scale(${badgeScale})`,
              fontFamily: typo.bodyFont,
              fontSize: typo.caption - 2,
              fontWeight: 700,
              color: brand.colors.accent,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            ⚡ {badge} ⚡
          </div>
        )}

        {/* Subtext */}
        {subtext && (
          <div
            style={{
              opacity: subtextOpacity,
              fontFamily: typo.bodyFont,
              fontSize: typo.caption,
              fontWeight: 400,
              color: brand.colors.textSecondary,
              textAlign: "center",
              lineHeight: 1.5,
              maxWidth: 700,
            }}
          >
            {subtext}
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
