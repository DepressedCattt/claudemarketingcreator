/**
 * LuminaryAd — "Your data has a story."
 *
 * Showcase ad for Luminary, a placeholder analytics / business-intelligence SaaS.
 * Demonstrates the depth-of-field emphasis technique: a single metric-card hero
 * becomes the clear focal point while surrounding text and context recede.
 *
 * Format:  9:16 portrait (1080 × 1920)
 * Duration: 540 frames @ 30fps = 18 seconds
 *
 * Scene breakdown:
 *  S1  Hook       (   0– 90f  3.0s)  Pure typography — restrained, spacious, premium
 *  S2  Hero       (  90–240f  5.0s)  Metric card glides in on arc + blur-resolve + hero float
 *  S3  Features   ( 240–360f  4.0s)  Three insight chips orbit the hero — staggered from 3 sides
 *  S4  Proof      ( 360–450f  3.0s)  Dark close — social-proof stats fill the frame
 *  S5  CTA        ( 450–540f  3.0s)  Restrained dark close, "See your story."
 *
 * Premium motion techniques demonstrated:
 *  ◆ Pure typography hook — restraint IS the signal of quality
 *  ◆ Arc entry with blur-resolve — hero card arrives with cinematic focus pull
 *  ◆ Hero float continuity — card persists across S2 and S3 with gentle float
 *  ◆ Depth de-emphasis — hook text recedes when hero takes focus
 *  ◆ Three-direction orbit reveal — chips enter from top/left/bottom, not all from same side
 *  ◆ Breathing glow — ambient light behind hero, slow pulse
 */

import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import {
  clamp,
  easeOut3,
  easeOut4,
  easeInOut3,
  PREMIUM_SPRING,
  useCinematicTextReveal,
  useBlurResolve,
  useArcEntry,
  useHeroFloat,
  useHeroFloatDelayed,
  depthDeemphasis,
  useSoftScaleIn,
  usePremiumWipe,
  useBreathingGlow,
  usePremiumFadeOut,
  premiumStagger,
} from "../utils/premiumMotion";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg:      "#FAFAF8",        // Near-white — very clean, Apple-like
  bgDeep:  "#F4F3EF",        // Slight warmth for scene contrast
  dark:    "#09090B",        // Near-black — Vercel-style
  darkBg:  "#0C0E16",        // Deep navy for dark scenes
  primary: "#2563EB",        // Electric blue — data energy
  surface: "#FFFFFF",        // Card surfaces
  text:    "#09090B",        // Body text
  body:    "#71717A",        // Secondary text
  border:  "#E4E4E7",        // Subtle borders
  green:   "#16A34A",        // Growth / positive metrics
  red:     "#DC2626",        // Warning / negative
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';
const W = 1080;
const H = 1920;

// ─── Shared: Metric Card Hero ─────────────────────────────────────────────────
//
// The hero UI object — a clean analytics card showing $4.2M pipeline.
// The simplicity is intentional: the motion does the work.

const MetricCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;

  // Sparkline points
  const sparkPoints = [
    [0, 38], [55, 34], [110, 28], [165, 22], [220, 30], [275, 16], [330, 9],
  ]
    .map(([x, y]) => `${x * S},${y * S}`)
    .join(" ");

  return (
    <div
      style={{
        width: 480 * S,
        background: C.surface,
        borderRadius: 28 * S,
        boxShadow: `0 ${44 * S}px ${100 * S}px rgba(9,9,11,0.14), 0 ${8 * S}px ${28 * S}px rgba(9,9,11,0.08)`,
        border: `1px solid ${C.border}`,
        fontFamily: SANS,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${28 * S}px ${32 * S}px ${0}px`,
        }}
      >
        {/* Label + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6 * S,
          }}
        >
          <div
            style={{
              fontSize: 12 * S,
              fontWeight: 700,
              color: C.body,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Total Pipeline
          </div>
          <div
            style={{
              fontSize: 10 * S,
              fontWeight: 700,
              color: C.primary,
              background: `rgba(37,99,235,0.09)`,
              borderRadius: 100 * S,
              padding: `2px ${8 * S}px`,
              letterSpacing: "0.04em",
            }}
          >
            LIVE
          </div>
        </div>

        {/* Main metric */}
        <div
          style={{
            fontSize: 72 * S,
            fontWeight: 900,
            color: C.dark,
            letterSpacing: -3 * S,
            lineHeight: 1,
            marginBottom: 8 * S,
          }}
        >
          $4.2M
        </div>

        {/* Growth */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6 * S,
            marginBottom: 24 * S,
          }}
        >
          <div
            style={{
              fontSize: 13 * S,
              fontWeight: 700,
              color: C.green,
              display: "flex",
              alignItems: "center",
              gap: 4 * S,
            }}
          >
            <span>↑</span>
            <span>23.4%</span>
          </div>
          <div
            style={{
              fontSize: 13 * S,
              color: C.body,
              fontWeight: 500,
            }}
          >
            vs last quarter
          </div>
        </div>

        {/* Sparkline */}
        <svg
          width={414 * S}
          height={48 * S}
          style={{ display: "block", marginBottom: 20 * S }}
        >
          {/* Area fill */}
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={C.primary} stopOpacity="0.15" />
              <stop offset="100%" stopColor={C.primary} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${48 * S} ${sparkPoints} ${330 * S},${48 * S}`}
            fill="url(#sparkGrad)"
          />
          <polyline
            points={sparkPoints}
            fill="none"
            stroke={C.primary}
            strokeWidth={2.5 * S}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Endpoint dot */}
          <circle
            cx={330 * S}
            cy={9 * S}
            r={5 * S}
            fill={C.primary}
          />
        </svg>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: `${14 * S}px ${32 * S}px ${22 * S}px`,
          borderTop: `1px solid ${C.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#FAFAFA",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11 * S,
              color: C.body,
              fontWeight: 600,
              marginBottom: 2 * S,
            }}
          >
            Q3 Target
          </div>
          <div
            style={{
              fontSize: 16 * S,
              fontWeight: 700,
              color: C.dark,
            }}
          >
            $3.8M
          </div>
        </div>
        <div
          style={{
            fontSize: 12 * S,
            fontWeight: 700,
            color: C.green,
            background: `rgba(22,163,74,0.10)`,
            borderRadius: 100 * S,
            padding: `5px ${12 * S}px`,
            display: "flex",
            alignItems: "center",
            gap: 5 * S,
          }}
        >
          <span>✓</span>
          <span>Target achieved</span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–90, 3s)
//
// Pure typography on a very clean light background.
// Maximum breathing room. No hero object yet.
// The restraint is the statement — this is premium before anything moves.
//
// Premium principle: "Leave breathing room. Not every scene needs a hero."
// ═══════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 12);

  const badge = useCinematicTextReveal(0, 14, 5);
  const line1 = useCinematicTextReveal(10, 18, 8);
  const line2 = useCinematicTextReveal(24, 18, 8);
  const sub = useCinematicTextReveal(46, 14, 5);

  const bgT = easeOut3(clamp(frame / 28, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Very subtle blue atmosphere */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1000px 1100px at 50% 42%,
            rgba(37,99,235,0.045) 0%, transparent 70%)`,
          opacity: bgT,
        }}
      />

      {/* Content block — centred vertically, left-anchored */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 80px",
        }}
      >
        {/* Brand badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: `rgba(37,99,235,0.07)`,
            border: `1.5px solid rgba(37,99,235,0.18)`,
            borderRadius: 100,
            padding: "9px 22px",
            marginBottom: 52,
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
            filter: `blur(${badge.blur}px)`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.primary,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.primary,
              fontFamily: SANS,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}
          >
            Luminary Analytics
          </span>
        </div>

        {/* Two-line headline */}
        {[
          { text: "Your data", t: line1, color: C.dark },
          { text: "has a story.", t: line2, color: C.primary },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 120,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -5,
              lineHeight: 0.88,
              opacity: l.t.opacity,
              transform: `translateY(${l.t.translateY}px)`,
              filter: `blur(${l.t.blur}px)`,
              marginBottom: i === 1 ? 52 : 4,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* Sub copy */}
        <div
          style={{
            fontSize: 30,
            fontWeight: 400,
            color: C.body,
            fontFamily: SANS,
            lineHeight: 1.60,
            maxWidth: 660,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          Luminary turns raw numbers into
          <br />
          decisions your team can act on.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — HERO (frames 90–240, 5s)
//
// The metric card hero arrives. Arc entry from bottom-right.
// Blur resolves as it settles — the rack-focus signal.
// The hook text (from S1) is re-rendered at de-emphasised opacity/blur
// behind the card to show depth and continuity.
//
// Premium principle: "Hero sharpens. Background softens. Focal hierarchy clear."
// ═══════════════════════════════════════════════════════════════════════════

const SceneHero: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(150, 14);

  // Card arrival
  const cardArc = useArcEntry(0, 140, 160, PREMIUM_SPRING.hero);
  const cardBlur = useBlurResolve(0, 32, 18);
  const cardOpacity = easeOut3(clamp(frame / 20, 0, 1));
  const cardScale = useSoftScaleIn(0, 0.88, 30);

  // Float starts after card settles (~frame 40)
  const cardFloat = useHeroFloatDelayed(40, 8, 95);

  // Background text de-emphasis — these are echoes of the hook text
  const bgDeempT = clamp(frame / 22, 0, 1);
  const bgDeemph = depthDeemphasis(easeInOut3(bgDeempT) * 0.85);

  // Context copy reveals on right side
  const contextLabel = useCinematicTextReveal(32, 14, 5);
  const contextLine1 = useCinematicTextReveal(42, 14, 6);
  const contextLine2 = useCinematicTextReveal(55, 14, 6);

  // Blue glow blooms around hero
  const glowT = easeOut3(clamp(frame / 50, 0, 1));
  const glow = useBreathingGlow(110, 0.6, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Glow behind hero card — slow, ambient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 900px at 50% 54%,
            rgba(37,99,235,${0.08 * glowT * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* De-emphasised background text — continuity from S1 */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 200,
          opacity: bgDeemph.opacity * 0.55,
          filter: `blur(${bgDeemph.blur + 3}px)`,
          transform: `scale(${bgDeemph.scale})`,
          transformOrigin: "left top",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.dark,
            letterSpacing: -4,
            lineHeight: 0.88,
          }}
        >
          Your data
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.primary,
            letterSpacing: -4,
            lineHeight: 0.88,
          }}
        >
          has a story.
        </div>
      </div>

      {/* Hero metric card — arc entry + blur resolve */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `
            translateX(calc(-50% + ${cardArc.translateX}px))
            translateY(calc(-48% + ${cardArc.translateY + cardFloat}px))
            scale(${cardScale})
          `,
          transformOrigin: "50% 50%",
          opacity: cardOpacity,
          filter: `blur(${cardBlur}px)`,
        }}
      >
        <MetricCard scale={1.22} />
      </div>

      {/* Context copy — right/below card, reveals after card settles */}
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 220,
          right: 80,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.primary,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 14,
            opacity: contextLabel.opacity,
            transform: `translateY(${contextLabel.translateY}px)`,
          }}
        >
          Real-time intelligence
        </div>
        {["See your entire business", "in one place."].map((text, i) => {
          const t = i === 0 ? contextLine1 : contextLine2;
          return (
            <div
              key={i}
              style={{
                fontSize: 48,
                fontWeight: 800,
                fontFamily: SANS,
                color: i === 1 ? C.primary : C.dark,
                letterSpacing: -2,
                lineHeight: 0.92,
                opacity: t.opacity,
                transform: `translateY(${t.translateY}px)`,
                filter: `blur(${t.blur}px)`,
              }}
            >
              {text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — FEATURES (frames 240–360, 4s)
//
// The hero card persists and continues floating (shared element continuity).
// Three insight chips appear from three different directions — top, left, bottom.
// Each chip is a different piece of intelligence anchored around the hero.
//
// Premium principle: "The same hero carries you. Orbiting elements explain it."
// ═══════════════════════════════════════════════════════════════════════════

const CHIPS = [
  {
    label: "Pipeline health",
    value: "87%",
    trend: "↑ Healthy",
    trendColor: "#16A34A",
    fromX: 0,
    fromY: -80,
    position: { top: 130, left: "50%", transform: "translateX(-50%)" },
    delay: 0,
  },
  {
    label: "Q3 outlook",
    value: "On track",
    trend: "3 deals closing",
    trendColor: C.primary,
    fromX: -80,
    fromY: 0,
    position: { top: "50%", left: 60, transform: "translateY(-50%)" },
    delay: 14,
  },
  {
    label: "This week",
    value: "5 deals",
    trend: "$890K potential",
    trendColor: "#D97706",
    fromX: 0,
    fromY: 80,
    position: { bottom: 130, left: "50%", transform: "translateX(-50%)" },
    delay: 28,
  },
];

const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  // Card continues floating — shared element from S2
  const cardFloat = useHeroFloat(8, 95);
  const glow = useBreathingGlow(110, 0.5, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Persistent glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 900px at 50% 52%,
            rgba(37,99,235,${0.07 * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Hero card — persists from S2, same position */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `
            translate(-50%, calc(-48% + ${cardFloat}px))
          `,
        }}
      >
        <MetricCard scale={1.22} />
      </div>

      {/* Insight chips — three directions */}
      {CHIPS.map((chip, i) => {
        const startF = chip.delay;
        const t = easeOut4(clamp((frame - startF) / 24, 0, 1));
        const opacity = clamp(t / 0.28, 0, 1);
        const tx = (1 - t) * chip.fromX;
        const ty = (1 - t) * chip.fromY;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              ...chip.position,
              opacity,
              transform: `${chip.position.transform || ""} translate(${tx}px, ${ty}px)`,
            }}
          >
            <div
              style={{
                background: C.surface,
                border: `1.5px solid ${C.border}`,
                borderRadius: 20,
                padding: "18px 26px",
                boxShadow: `0 8px 32px rgba(9,9,11,0.09), 0 2px 8px rgba(9,9,11,0.05)`,
                minWidth: 210,
                fontFamily: SANS,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.body,
                  textTransform: "uppercase",
                  letterSpacing: "0.10em",
                  marginBottom: 4,
                }}
              >
                {chip.label}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  color: C.dark,
                  letterSpacing: -0.5,
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {chip.value}
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: chip.trendColor,
                }}
              >
                {chip.trend}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — PROOF (frames 360–450, 3s)
//
// Transition to dark. Social proof fills the frame.
// Three stats build left-to-right with staggered cinematic reveals.
//
// Premium principle: "Background elements stay de-emphasised. Stats take focus."
// ═══════════════════════════════════════════════════════════════════════════

const PROOF_STATS = [
  { value: "89%", label: "hit quarterly targets", sub: "after switching" },
  { value: "3×",  label: "faster reporting",       sub: "vs spreadsheets" },
  { value: "2wk", label: "average time",            sub: "to first insight" },
];

const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 12);

  const bgT = easeOut3(clamp(frame / 22, 0, 1));
  const headline = useCinematicTextReveal(8, 18, 7);
  const quoteT = useCinematicTextReveal(68, 12, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: C.darkBg,
          opacity: bgT,
        }}
      />

      {/* Blue glow — top third */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 700px at 50% 28%,
            rgba(37,99,235,0.12) 0%, transparent 60%)`,
          opacity: bgT,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {/* Small headline */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: "rgba(255,255,255,0.42)",
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 56,
            opacity: headline.opacity,
            transform: `translateY(${headline.translateY}px)`,
          }}
        >
          What teams see after switching
        </div>

        {/* Three stacked stats */}
        {PROOF_STATS.map((stat, i) => {
          const startF = i * 16 + 12;
          const t = easeOut4(clamp((frame - startF) / 24, 0, 1));
          const wipeW = easeOut3(clamp((frame - startF - 14) / 20, 0, 1)) * 100;
          return (
            <div
              key={i}
              style={{
                marginBottom: i < 2 ? 48 : 0,
                opacity: clamp(t / 0.25, 0, 1),
                transform: `translateY(${(1 - t) * 32}px)`,
              }}
            >
              {/* Value */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 18,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 88,
                    fontWeight: 900,
                    fontFamily: SANS,
                    color: "white",
                    letterSpacing: -4,
                    lineHeight: 0.9,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{ paddingBottom: 8 }}>
                  <div
                    style={{
                      fontSize: 26,
                      fontWeight: 800,
                      color: "rgba(255,255,255,0.82)",
                      fontFamily: SANS,
                      lineHeight: 1,
                      letterSpacing: -0.5,
                    }}
                  >
                    {stat.label}
                  </div>
                  <div
                    style={{
                      fontSize: 16,
                      color: "rgba(255,255,255,0.40)",
                      fontFamily: SANS,
                      marginTop: 4,
                    }}
                  >
                    {stat.sub}
                  </div>
                </div>
              </div>

              {/* Wipe accent line */}
              <div
                style={{
                  width: `${wipeW}%`,
                  maxWidth: 900,
                  height: 1.5,
                  background: `rgba(37,99,235,0.45)`,
                  borderRadius: 1,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA (frames 450–540, 3s)
//
// Restrained, dark, premium close. "See your story."
// Luminary wordmark. One button. URL.
//
// Premium principle: "CTA at 2–3 seconds. If the ad was good, they already know."
// ═══════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const bgT = easeOut3(clamp(frame / 18, 0, 1));
  const line1 = useCinematicTextReveal(10, 18, 8);
  const line2 = useCinematicTextReveal(22, 18, 8);
  const sub = useCinematicTextReveal(38, 12, 5);
  const btnScale = easeOut4(clamp((frame - 50) / 22, 0, 1));
  const urlT = useCinematicTextReveal(68, 10, 4);

  const glow = useBreathingGlow(90, 0.5, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(168deg, ${C.darkBg} 0%, #050810 100%)`,
          opacity: bgT,
        }}
      />

      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(37,99,235,${0.12 * glow}) 0%, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 80px",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "rgba(255,255,255,0.35)",
            fontFamily: SANS,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 44,
            opacity: line1.opacity,
          }}
        >
          Luminary
        </div>

        {/* Headline */}
        {[
          { text: "See your", t: line1, color: "white" },
          { text: "story.", t: line2, color: C.primary },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 110,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -5,
              lineHeight: 0.88,
              opacity: l.t.opacity,
              transform: `translateY(${l.t.translateY}px)`,
              filter: `blur(${l.t.blur}px)`,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* Sub copy */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.42)",
            fontFamily: SANS,
            lineHeight: 1.65,
            marginTop: 36,
            marginBottom: 52,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Try free for 14 days. No credit card required.
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${btnScale})`,
            transformOrigin: "left center",
            display: "inline-block",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: C.primary,
              borderRadius: 18,
              padding: "22px 46px",
              boxShadow: `0 16px 52px rgba(37,99,235,0.35)`,
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "white",
                fontFamily: SANS,
              }}
            >
              Start free trial
            </span>
            <span
              style={{ fontSize: 20, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}
            >
              →
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 17,
            color: "rgba(255,255,255,0.25)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
            opacity: urlT.opacity,
          }}
        >
          luminary.io
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const LuminaryAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneHook     /></Sequence>
    <Sequence from={90}  durationInFrames={150}><SceneHero     /></Sequence>
    <Sequence from={240} durationInFrames={120}><SceneFeatures /></Sequence>
    <Sequence from={360} durationInFrames={90}><SceneProof    /></Sequence>
    <Sequence from={450} durationInFrames={90}><SceneCTA      /></Sequence>
  </AbsoluteFill>
);
