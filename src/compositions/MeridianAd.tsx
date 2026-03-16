/**
 * MeridianAd — "People-first. Finally."
 *
 * Showcase ad for Meridian, a placeholder HR / people-operations SaaS.
 * Demonstrates the full premium motion vocabulary in the 1:1 square format:
 * restrained hook, physical hero entry, feature-list choreography, metrics
 * build, and a warm dark close.
 *
 * Format:  1:1 square (1080 × 1080)
 * Duration: 540 frames @ 30fps = 18 seconds
 *
 * Scene breakdown:
 *  S1  Hook       (   0– 90f  3.0s)  Warm typographic opener — restraint signals quality
 *  S2  Hero Demo  (  90–240f  5.0s)  Profile card glides in on arc + blur-resolve + float loop
 *  S3  Features   ( 240–360f  4.0s)  Three features wipe in from left, card de-emphasised right
 *  S4  Metrics    ( 360–450f  3.0s)  Three metrics build from bottom — card exits gracefully
 *  S5  CTA        ( 450–540f  3.0s)  Warm dark close — confident, simple, premium
 *
 * Premium motion techniques demonstrated:
 *  ◆ Warm-palette premium typography — elevated without loud effects
 *  ◆ Arc entry from bottom-left — variation on entry direction (not always bottom-right)
 *  ◆ Float with phase offset — card sways slightly different axis for variety
 *  ◆ Left-anchored feature choreography — features reveal left-to-right like reading
 *  ◆ Graceful hero exit — card doesn't just disappear, it fades + scales away
 *  ◆ Metric build from below — each metric has its own brief act
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
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
  rawProgress,
} from "../utils/premiumMotion";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg:      "#F9F6F1",        // Warm cream — differentiated from white, premium warmth
  bgMid:   "#F2EDE4",        // Deeper cream for scene contrast
  dark:    "#1C1917",        // Warm near-black (stone-900)
  darkCTA: "#141210",        // Deeper for CTA
  primary: "#C2410C",        // Terracotta/orange — warm, human, distinctive
  surface: "#FFFFFF",        // Card surfaces
  text:    "#1C1917",        // Body text
  body:    "#78716C",        // Secondary text (warm stone)
  border:  "#E7E5E4",        // Warm stone borders
  green:   "#16A34A",        // Active/success
  blue:    "#2563EB",        // Project accent
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';
const W = 1080;
const H = 1080;

// ─── Shared: Profile Card Hero ────────────────────────────────────────────────

const ProfileCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;
  const METRICS = [
    { value: "5",   label: "Reports" },
    { value: "3",   label: "Projects" },
    { value: "94%", label: "Satisfaction" },
  ];

  return (
    <div
      style={{
        width: 380 * S,
        background: C.surface,
        borderRadius: 28 * S,
        boxShadow: `0 ${36 * S}px ${88 * S}px rgba(28,25,23,0.13), 0 ${6 * S}px ${22 * S}px rgba(28,25,23,0.07)`,
        border: `1px solid ${C.border}`,
        fontFamily: SANS,
        overflow: "hidden",
      }}
    >
      {/* Top accent bar */}
      <div
        style={{
          height: 4 * S,
          background: `linear-gradient(90deg, ${C.primary}, #EA580C)`,
        }}
      />

      <div style={{ padding: `${26 * S}px ${28 * S}px` }}>
        {/* Avatar + info */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16 * S,
            marginBottom: 22 * S,
          }}
        >
          <div
            style={{
              width: 60 * S,
              height: 60 * S,
              borderRadius: "50%",
              background: `${C.primary}12`,
              border: `2px solid ${C.primary}28`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20 * S,
              fontWeight: 800,
              color: C.primary,
              flexShrink: 0,
            }}
          >
            SC
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 18 * S,
                fontWeight: 700,
                color: C.dark,
                marginBottom: 3 * S,
                lineHeight: 1.1,
              }}
            >
              Sarah Chen
            </div>
            <div
              style={{
                fontSize: 13 * S,
                color: C.body,
                marginBottom: 10 * S,
              }}
            >
              Design Lead · Product
            </div>
            {/* Active badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5 * S,
                background: "rgba(22,163,74,0.09)",
                borderRadius: 100 * S,
                padding: `3px ${8 * S}px`,
              }}
            >
              <div
                style={{
                  width: 5 * S,
                  height: 5 * S,
                  borderRadius: "50%",
                  background: C.green,
                }}
              />
              <span
                style={{
                  fontSize: 11 * S,
                  fontWeight: 700,
                  color: C.green,
                }}
              >
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 0,
            borderTop: `1px solid ${C.border}`,
            borderBottom: `1px solid ${C.border}`,
            marginBottom: 20 * S,
          }}
        >
          {METRICS.map((m, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                textAlign: "center",
                padding: `${14 * S}px ${8 * S}px`,
                borderRight: i < 2 ? `1px solid ${C.border}` : "none",
              }}
            >
              <div
                style={{
                  fontSize: 22 * S,
                  fontWeight: 800,
                  color: C.dark,
                  lineHeight: 1,
                  marginBottom: 3 * S,
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: 10 * S,
                  color: C.body,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {m.label}
              </div>
            </div>
          ))}
        </div>

        {/* Review chip */}
        <div
          style={{
            background: `${C.primary}08`,
            border: `1px solid ${C.primary}18`,
            borderRadius: 12 * S,
            padding: `${10 * S}px ${14 * S}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10 * S,
                color: C.primary,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 2 * S,
              }}
            >
              Next review
            </div>
            <div
              style={{
                fontSize: 14 * S,
                fontWeight: 700,
                color: C.dark,
              }}
            >
              Oct 15 · Annual
            </div>
          </div>
          <div
            style={{
              fontSize: 18 * S,
              color: C.primary,
              fontWeight: 700,
            }}
          >
            →
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–90, 3s)
//
// Warm typographic opener. Clean, spacious, considered.
// Nothing animates aggressively. Everything drifts into place.
//
// Premium principle: "Text animation should feel premium and understated."
// ═══════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 12);

  const badge = useCinematicTextReveal(0, 14, 5);
  const line1 = useCinematicTextReveal(10, 18, 7);
  const line2 = useCinematicTextReveal(24, 18, 7);
  const sub = useCinematicTextReveal(48, 14, 5);
  const wipe = usePremiumWipe(52, 26);

  const bgT = easeOut3(clamp(frame / 24, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Warm glow — top centre */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 800px at 50% 40%,
            rgba(194,65,12,0.045) 0%, transparent 70%)`,
          opacity: bgT,
        }}
      />

      {/* Content — centred in square canvas */}
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
            background: `${C.primary}0C`,
            border: `1.5px solid ${C.primary}22`,
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 48,
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
              fontSize: 13,
              fontWeight: 700,
              color: C.primary,
              fontFamily: SANS,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}
          >
            Meridian · People Ops
          </span>
        </div>

        {/* Headline */}
        {[
          { text: "People-first.", t: line1, color: C.dark },
          { text: "Finally.", t: line2, color: C.primary },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 108,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -5,
              lineHeight: 0.88,
              opacity: l.t.opacity,
              transform: `translateY(${l.t.translateY}px)`,
              filter: `blur(${l.t.blur}px)`,
              marginBottom: i === 1 ? 40 : 4,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* Accent rule */}
        <div
          style={{
            width: `${wipe}%`,
            maxWidth: 280,
            height: 3,
            background: `linear-gradient(90deg, ${C.primary}, ${C.primary}22)`,
            borderRadius: 2,
            marginBottom: 28,
          }}
        />

        {/* Sub copy */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: C.body,
            fontFamily: SANS,
            lineHeight: 1.65,
            maxWidth: 540,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          HR that works the way your team does.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — HERO DEMO (frames 90–240, 5s)
//
// Profile card hero. Arc entry from BOTTOM-LEFT (variation: not always right).
// Blur resolves on settle. Hero float loop with slight X-axis sway.
// Headline text context fades in after card is seated.
//
// Premium principle: "Vary entry direction. Not every hero enters from right."
// ═══════════════════════════════════════════════════════════════════════════

const SceneHeroDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(150, 14);

  // Card from bottom-left arc
  const cardArc = useArcEntry(0, -110, 130, PREMIUM_SPRING.hero);
  const cardBlur = useBlurResolve(0, 30, 16);
  const cardOpacity = easeOut3(clamp(frame / 20, 0, 1));
  const cardScale = useSoftScaleIn(0, 0.88, 28);

  // Float — slight X-axis for variety (different from Luminary/Arcflow)
  const floatY = useHeroFloatDelayed(38, 6, 90);
  const floatX = useHeroFloat(3, 130, Math.PI / 2); // Phase shifted

  // Context copy
  const contextLabel = useCinematicTextReveal(36, 14, 5);
  const contextLine1 = useCinematicTextReveal(46, 14, 6);
  const contextLine2 = useCinematicTextReveal(60, 14, 6);

  // Warm glow blooms
  const glowT = easeOut3(clamp(frame / 45, 0, 1));
  const glow = useBreathingGlow(100, 0.55, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Warm glow behind hero */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 800px at 50% 52%,
            rgba(194,65,12,${0.065 * glowT * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Hero card — centred in square canvas */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `
            translateX(calc(-50% + ${cardArc.translateX + floatX}px))
            translateY(calc(-50% + ${cardArc.translateY + floatY}px))
            scale(${cardScale})
          `,
          transformOrigin: "50% 50%",
          opacity: cardOpacity,
          filter: `blur(${cardBlur}px)`,
        }}
      >
        <ProfileCard scale={1.18} />
      </div>

      {/* Context copy — bottom, after card seats */}
      <div
        style={{
          position: "absolute",
          left: 80,
          bottom: 80,
          right: 80,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.primary,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 12,
            opacity: contextLabel.opacity,
            transform: `translateY(${contextLabel.translateY}px)`,
          }}
        >
          Know your people
        </div>
        {["Every person.", "One clear picture."].map((text, i) => {
          const t = i === 0 ? contextLine1 : contextLine2;
          return (
            <div
              key={i}
              style={{
                fontSize: 44,
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
// Card de-emphasises to the right. Three feature lines reveal on the left.
// Each feature has an icon, title, and a wipe-in underline.
//
// Premium principle: "Left-to-right feature choreography — natural reading order."
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: "👤",
    title: "One profile per person",
    body: "Everything in one place. Role, reviews, projects, goals.",
    delay: 4,
  },
  {
    icon: "🗂",
    title: "Real-time org chart",
    body: "Always accurate. Automatically synced.",
    delay: 18,
  },
  {
    icon: "✓",
    title: "Smart onboarding flows",
    body: "New hires up to speed in days, not weeks.",
    delay: 32,
  },
];

const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  // Card continues — de-emphasised, right side
  const deempT = clamp(frame / 22, 0, 1);
  const deemph = depthDeemphasis(easeInOut3(deempT));

  // Card float continues
  const floatY = useHeroFloat(6, 90);
  const floatX = useHeroFloat(3, 130, Math.PI / 2);

  const eyebrow = useCinematicTextReveal(4, 12, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* De-emphasised card — right side, continuity element */}
      <div
        style={{
          position: "absolute",
          right: 60,
          top: "50%",
          opacity: deemph.opacity,
          filter: `blur(${deemph.blur}px)`,
          transform: `translateY(calc(-50% + ${floatY}px)) scale(${deemph.scale})`,
          transformOrigin: "right center",
        }}
      >
        <ProfileCard scale={0.75} />
      </div>

      {/* Feature list — left side */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "50%",
          transform: "translateY(-50%)",
          width: 520,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.primary,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 16,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          What's inside
        </div>

        {/* Three features — staggered */}
        {FEATURES.map((feat, i) => {
          const startF = feat.delay;
          const t = easeOut4(clamp((frame - startF) / 24, 0, 1));
          const wipeW = easeInOut3(clamp((frame - startF - 14) / 22, 0, 1)) * 100;
          const opacity = clamp(t / 0.28, 0, 1);

          return (
            <div
              key={i}
              style={{
                marginBottom: i < 2 ? 36 : 0,
                opacity,
                transform: `translateX(${(1 - t) * -36}px)`,
              }}
            >
              {/* Icon + title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: `${C.primary}12`,
                    border: `1.5px solid ${C.primary}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 15,
                    flexShrink: 0,
                  }}
                >
                  {feat.icon}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.dark,
                    fontFamily: SANS,
                    letterSpacing: -0.5,
                  }}
                >
                  {feat.title}
                </div>
              </div>

              {/* Body */}
              <div
                style={{
                  fontSize: 15,
                  color: C.body,
                  fontFamily: SANS,
                  lineHeight: 1.6,
                  paddingLeft: 44,
                  marginBottom: 10,
                }}
              >
                {feat.body}
              </div>

              {/* Wipe underline */}
              <div
                style={{
                  marginLeft: 44,
                  width: `${wipeW}%`,
                  maxWidth: 180,
                  height: 2,
                  background: `linear-gradient(90deg, ${C.primary}55, transparent)`,
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
// SCENE 4 — METRICS (frames 360–450, 3s)
//
// Three metrics, each owning exactly one third of the 1080×1080 canvas.
// Every pixel is accounted for. The rule: if a scene has N items, each
// item gets (canvas height ÷ N) of space — no more, no less.
//
// Layout: AbsoluteFill → 3 flex rows, each flex:1 (= 360px each at 1080px).
// Typography scales UP to fill that vertical space — value at 164px fills ~55%
// of each row, label + sub fill the lower ~30%, leaving intentional padding.
//
// Premium principle: "Fill every pixel with intention. Dead zones = amateur."
// ═══════════════════════════════════════════════════════════════════════════

const METRICS = [
  {
    value: "40%",
    label: "faster onboarding",
    sub: "avg. vs prior tools",
    color: C.primary,
    delay: 4,
  },
  {
    value: "3×",
    label: "team visibility",
    sub: "across departments",
    color: "#2563EB",
    delay: 18,
  },
  {
    value: "92%",
    label: "user satisfaction",
    sub: "after 6 months",
    color: "#16A34A",
    delay: 32,
  },
];

const SceneMetrics: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const bgT = easeOut3(clamp(frame / 20, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bgMid }} />

      {/* Warm radial — centre-weighted, stays subtle */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1000px 900px at 50% 50%,
            rgba(194,65,12,0.052) 0%, transparent 65%)`,
          opacity: bgT,
        }}
      />

      {/* Three rows — each flex:1 = 360px on a 1080px canvas */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {METRICS.map((m, i) => {
          const startF = m.delay;
          const t = easeOut4(clamp((frame - startF) / 26, 0, 1));
          // Wipe spans full canvas width — no maxWidth cap
          const wipeW = easeInOut3(clamp((frame - startF - 8) / 24, 0, 1)) * 100;
          const opacity = clamp(t / 0.25, 0, 1);

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",   // Centre horizontally — number is the hero
                textAlign: "center",
                // Divider signals the boundary, keeps rows distinct
                borderBottom: i < 2 ? `1.5px solid ${C.border}` : "none",
                opacity,
                transform: `translateY(${(1 - t) * 36}px)`,
              }}
            >
              {/* Value — centred and dominant. This is the only thing the
                   viewer needs to read. Make it impossible to miss. */}
              <div
                style={{
                  fontSize: 164,
                  fontWeight: 900,
                  fontFamily: SANS,
                  color: m.color,
                  letterSpacing: -7,
                  lineHeight: 0.82,
                  marginBottom: 12,
                }}
              >
                {m.value}
              </div>

              {/* Label — clearly subordinate in size, centred below the number */}
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.dark,
                  fontFamily: SANS,
                  letterSpacing: -0.5,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {m.label}
              </div>

              {/* Sub — quietest element, supporting context only */}
              <div
                style={{
                  fontSize: 17,
                  color: C.body,
                  fontFamily: SANS,
                  fontWeight: 400,
                  marginBottom: 18,
                }}
              >
                {m.sub}
              </div>

              {/* Short centred wipe — accent, not structure */}
              <div
                style={{
                  width: `${wipeW * 0.4}%`,  // 40% of canvas — centred accent, not full-bleed
                  maxWidth: 200,
                  height: 2,
                  background: m.color,
                  borderRadius: 1,
                  opacity: 0.45,
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
// Warm dark close. Confident, simple.
// The dark background contrasts the warm cream of previous scenes.
// A terracotta glow. Two lines. One button.
//
// Premium principle: "Short CTA. Trust was built before this scene."
// ═══════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const bgT = easeOut3(clamp(frame / 18, 0, 1));
  const line1 = useCinematicTextReveal(8, 18, 8);
  const line2 = useCinematicTextReveal(20, 18, 8);
  const sub = useCinematicTextReveal(36, 12, 5);
  const btnScale = easeOut4(clamp((frame - 48) / 20, 0, 1));
  const urlT = useCinematicTextReveal(64, 10, 4);

  const glow = useBreathingGlow(90, 0.5, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(150deg, ${C.dark} 0%, ${C.darkCTA} 100%)`,
          opacity: bgT,
        }}
      />

      {/* Warm terracotta glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%, -50%)",
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(194,65,12,${0.11 * glow}) 0%, transparent 70%)`,
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
            fontSize: 14,
            fontWeight: 700,
            color: "rgba(255,255,255,0.32)",
            fontFamily: SANS,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 44,
            opacity: line1.opacity,
          }}
        >
          Meridian
        </div>

        {/* Headline */}
        {[
          { text: "Built for people", t: line1, color: "white" },
          {
            text: "who build teams.",
            t: line2,
            color: C.primary,
          },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 80,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -4,
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
            fontSize: 20,
            color: "rgba(255,255,255,0.40)",
            fontFamily: SANS,
            lineHeight: 1.65,
            marginTop: 30,
            marginBottom: 46,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Free for up to 25 people. No credit card.
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${btnScale})`,
            transformOrigin: "left center",
            display: "inline-block",
            marginBottom: 44,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: C.primary,
              borderRadius: 18,
              padding: "20px 44px",
              boxShadow: `0 14px 44px rgba(194,65,12,0.30)`,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "white",
                fontFamily: SANS,
              }}
            >
              Start free trial
            </span>
            <span
              style={{
                fontSize: 18,
                color: "rgba(255,255,255,0.7)",
                fontWeight: 700,
              }}
            >
              →
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.24)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
            opacity: urlT.opacity,
          }}
        >
          meridian.io
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const MeridianAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneHook     /></Sequence>
    <Sequence from={90}  durationInFrames={150}><SceneHeroDemo /></Sequence>
    <Sequence from={240} durationInFrames={120}><SceneFeatures /></Sequence>
    <Sequence from={360} durationInFrames={90}><SceneMetrics  /></Sequence>
    <Sequence from={450} durationInFrames={90}><SceneCTA      /></Sequence>
  </AbsoluteFill>
);
