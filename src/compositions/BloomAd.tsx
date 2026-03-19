/**
 * BloomAd — "Where nature becomes art."
 *
 * Premium floral design studio ad for Bloom.
 * Warm cream canvas, deep forest green, amber gold accents.
 * The visual language of botanical luxury — florist meets fine art gallery.
 *
 * Format:  1:1 square (1080 × 1080)
 * Duration: 540 frames @ 30fps = 18 seconds
 * BPM:     120 — 1 bar = 2s
 *
 * Scene breakdown:
 *  S1  Hook         (  0– 90f  3.0s)  Restrained typographic opener — cream canvas, forest green type
 *  S2  Arrangement  ( 90–240f  5.0s)  Arrangement card arcs in from bottom-right, blur-resolve + float
 *  S3  Services     (240–360f  4.0s)  Three feature lines from left, card recedes right
 *  S4  Proof        (360–450f  3.0s)  Three centred metric rows own the full canvas
 *  S5  CTA          (450–540f  3.0s)  Deep forest green close — amber glow, confident resolution
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
  rawProgress,
} from "../utils/premiumMotion";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      "#F7F4EE",          // Warm parchment — botanical, considered
  bgMid:   "#EEE9DE",          // Slightly deeper for scene contrast
  dark:    "#1A2B1E",          // Deep forest — warm, organic
  darkCTA: "#121E16",          // Deeper for CTA
  primary: "#3D6B4F",          // Forest green — differentiated from corporate green
  amber:   "#C17B2C",          // Warm amber — handcrafted warmth, not gold
  surface: "#FFFFFF",
  text:    "#1A2B1E",
  body:    "#5E7466",          // Muted green-grey body text
  border:  "#D8E6DC",
  soft:    "rgba(61,107,79,0.08)",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── Arrangement Card Hero ────────────────────────────────────────────────────
const ArrangementCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;
  const FLOWERS = ["Garden roses", "White ranunculus", "Dusty eucalyptus"];

  return (
    <div
      style={{
        width: 380 * S,
        background: C.surface,
        borderRadius: 26 * S,
        boxShadow: `0 ${38 * S}px ${90 * S}px rgba(26,43,30,0.14),
                    0 ${6 * S}px ${22 * S}px rgba(26,43,30,0.07)`,
        border: `1px solid ${C.border}`,
        fontFamily: SANS,
        overflow: "hidden",
      }}
    >
      {/* Forest green top accent bar */}
      <div
        style={{
          height: 4 * S,
          background: `linear-gradient(90deg, ${C.primary}, #4E8B64)`,
        }}
      />

      {/* Botanical illustration area — abstract color field */}
      <div
        style={{
          height: 140 * S,
          background: `linear-gradient(160deg,
            rgba(61,107,79,0.08) 0%,
            rgba(78,139,100,0.14) 40%,
            rgba(193,123,44,0.07) 100%)`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {/* Abstract petal shapes using CSS — three overlapping ellipses */}
        <div style={{ position: "relative", width: 120 * S, height: 80 * S }}>
          {[
            { w: 40, h: 64, left: 22, top: 8, rot: -20, color: `${C.primary}30` },
            { w: 48, h: 72, left: 38, top: 4, rot: 10,  color: `${C.primary}40` },
            { w: 36, h: 60, left: 56, top: 10, rot: 30, color: `${C.amber}25` },
            { w: 42, h: 68, left: 44, top: 6,  rot: -5, color: `${C.primary}20` },
          ].map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: p.w * S,
                height: p.h * S,
                left: p.left * S,
                top: p.top * S,
                borderRadius: "50% 40% 50% 40%",
                background: p.color,
                transform: `rotate(${p.rot}deg)`,
              }}
            />
          ))}
          {/* Stem */}
          <div
            style={{
              position: "absolute",
              width: 1.5 * S,
              height: 40 * S,
              left: 59 * S,
              top: 40 * S,
              background: `${C.primary}60`,
              borderRadius: 1,
            }}
          />
        </div>

        {/* Collection label — top left */}
        <div
          style={{
            position: "absolute",
            top: 12 * S,
            left: 18 * S,
            fontSize: 9 * S,
            fontWeight: 700,
            color: C.primary,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.65,
          }}
        >
          The Margaux
        </div>
      </div>

      <div style={{ padding: `${22 * S}px ${24 * S}px` }}>
        {/* Arrangement name */}
        <div
          style={{
            fontSize: 10 * S,
            fontWeight: 700,
            color: C.primary,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 8 * S,
          }}
        >
          Curated Bouquet
        </div>
        <div
          style={{
            fontSize: 22 * S,
            fontWeight: 800,
            color: C.dark,
            letterSpacing: -0.8 * S,
            lineHeight: 1.1,
            marginBottom: 14 * S,
          }}
        >
          The Margaux
          <br />
          Arrangement
        </div>

        {/* Flower list */}
        <div style={{ marginBottom: 18 * S }}>
          {FLOWERS.map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8 * S,
                marginBottom: 5 * S,
              }}
            >
              <div
                style={{
                  width: 4 * S,
                  height: 4 * S,
                  borderRadius: "50%",
                  background: C.primary,
                  opacity: 0.6,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontSize: 12 * S,
                  color: C.body,
                  fontWeight: 500,
                }}
              >
                {f}
              </div>
            </div>
          ))}
        </div>

        {/* Price row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `rgba(61,107,79,0.06)`,
            border: `1px solid ${C.border}`,
            borderRadius: 10 * S,
            padding: `${10 * S}px ${14 * S}px`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9 * S,
                color: C.primary,
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                marginBottom: 2 * S,
              }}
            >
              Starting from
            </div>
            <div
              style={{
                fontSize: 20 * S,
                fontWeight: 800,
                color: C.amber,
              }}
            >
              $185
            </div>
          </div>
          <div
            style={{
              fontSize: 9 * S,
              color: C.primary,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: "right",
              lineHeight: 1.4,
            }}
          >
            Same-day
            <br />
            delivery
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–90, 3s)
//
// Warm cream canvas. Forest green hero type. Amber wipe rule.
// Restraint signals quality. No background animation — type is the star.
// The botanical world in a single word: "BLOOM."
// ═══════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 12);

  const badge = useCinematicTextReveal(0, 12, 5);
  const line1 = useCinematicTextReveal(10, 20, 8);
  const wipe = usePremiumWipe(24, 28);
  const sub = useCinematicTextReveal(38, 14, 5);

  const bgT = easeOut3(clamp(frame / 22, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Soft green bloom in top-right */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 820px 700px at 72% 28%,
            rgba(61,107,79,0.055) 0%, transparent 70%)`,
          opacity: bgT,
        }}
      />
      {/* Warm amber hint bottom-left */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 600px 500px at 18% 78%,
            rgba(193,123,44,0.038) 0%, transparent 70%)`,
          opacity: bgT,
        }}
      />

      {/* Content — left-anchored for editorial feel */}
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
            background: `rgba(61,107,79,0.08)`,
            border: `1.5px solid rgba(61,107,79,0.18)`,
            borderRadius: 100,
            padding: "7px 20px",
            marginBottom: 44,
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: C.primary,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.primary,
              fontFamily: SANS,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Bloom · Bespoke Florals
          </span>
        </div>

        {/* Hero word */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.primary,
            letterSpacing: -6,
            lineHeight: 0.85,
            opacity: line1.opacity,
            transform: `translateY(${line1.translateY}px)`,
            filter: `blur(${line1.blur}px)`,
            marginBottom: 36,
          }}
        >
          BLOOM.
        </div>

        {/* Amber accent rule */}
        <div
          style={{
            width: `${wipe}%`,
            maxWidth: 300,
            height: 3,
            background: `linear-gradient(90deg, ${C.amber}, ${C.amber}22)`,
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
            maxWidth: 500,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          Where nature becomes art.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — ARRANGEMENT (frames 90–240, 5s)
//
// Arrangement card glides in from bottom-right on a curved arc.
// Blur resolves as the card seats. Float begins after.
// Context copy enters only after the hero is fully present.
// ═══════════════════════════════════════════════════════════════════════════

const SceneArrangement: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(150, 14);

  // Arc from bottom-right
  const arc = useArcEntry(0, 100, 140, PREMIUM_SPRING.hero);
  const cardBlur = useBlurResolve(0, 30, 16);
  const cardOpacity = easeOut3(clamp(frame / 20, 0, 1));
  const cardScale = useSoftScaleIn(0, 0.88, 28);

  // Float — X-axis phase offset for botanical sway feel
  const floatY = useHeroFloatDelayed(38, 6, 88);
  const floatX = useHeroFloat(2.5, 125, Math.PI / 2.5);

  // Context
  const ctxLabel = useCinematicTextReveal(36, 12, 5);
  const ctxLine1 = useCinematicTextReveal(46, 16, 7);
  const ctxLine2 = useCinematicTextReveal(60, 16, 7);

  const glowT = easeOut3(clamp(frame / 44, 0, 1));
  const glow = useBreathingGlow(105, 0.52, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Soft green glow behind card */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 720px 720px at 50% 48%,
            rgba(61,107,79,${0.062 * glowT * glow}) 0%, transparent 62%)`,
        }}
      />

      {/* Hero arrangement card — centred */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "47%",
          transform: `
            translateX(calc(-50% + ${arc.translateX + floatX}px))
            translateY(calc(-50% + ${arc.translateY + floatY}px))
            scale(${cardScale})
          `,
          transformOrigin: "50% 50%",
          opacity: cardOpacity,
          filter: `blur(${cardBlur}px)`,
        }}
      >
        <ArrangementCard scale={1.2} />
      </div>

      {/* Context copy — bottom */}
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
            fontSize: 11,
            fontWeight: 700,
            color: C.amber,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: 12,
            opacity: ctxLabel.opacity,
            transform: `translateY(${ctxLabel.translateY}px)`,
          }}
        >
          Every arrangement tells a story
        </div>
        {["Handcrafted", "for your moment."].map((text, i) => {
          const t = i === 0 ? ctxLine1 : ctxLine2;
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
// SCENE 3 — SERVICES (frames 240–360, 4s)
//
// Arrangement card de-emphasises to the right.
// Three service categories reveal from the left.
// Split composition: left = services, right = receding card (depth anchor).
// ═══════════════════════════════════════════════════════════════════════════

const SERVICES = [
  {
    icon: "✿",
    title: "Wedding Florals",
    body: "Full consultation. Bespoke arrangements. Every detail considered.",
    delay: 4,
  },
  {
    icon: "◈",
    title: "Corporate Events",
    body: "Bulk ordering. Venue installation. Same-day available.",
    delay: 18,
  },
  {
    icon: "◇",
    title: "Everyday Gifting",
    body: "From $65. Same-day delivery. Because any day is the day.",
    delay: 32,
  },
];

const SceneServices: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  const deempT = clamp(frame / 22, 0, 1);
  const deemph = depthDeemphasis(easeInOut3(deempT));

  const floatY = useHeroFloat(6, 88);
  const floatX = useHeroFloat(2.5, 125, Math.PI / 2.5);

  const eyebrow = useCinematicTextReveal(4, 12, 4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* De-emphasised card — right side, continuity */}
      <div
        style={{
          position: "absolute",
          right: 56,
          top: "50%",
          opacity: deemph.opacity,
          filter: `blur(${deemph.blur}px)`,
          transform: `translateY(calc(-50% + ${floatY}px)) translateX(${floatX}px) scale(${deemph.scale})`,
          transformOrigin: "right center",
        }}
      >
        <ArrangementCard scale={0.72} />
      </div>

      {/* Feature list — left side */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: "50%",
          transform: "translateY(-50%)",
          width: 510,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.amber,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginBottom: 18,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          What we offer
        </div>

        {SERVICES.map((svc, i) => {
          const startF = svc.delay;
          const t = easeOut4(clamp((frame - startF) / 24, 0, 1));
          const wipeW = easeInOut3(clamp((frame - startF - 14) / 22, 0, 1)) * 100;
          const opacity = clamp(t / 0.28, 0, 1);

          return (
            <div
              key={i}
              style={{
                marginBottom: i < 2 ? 36 : 0,
                opacity,
                transform: `translateX(${(1 - t) * -38}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: `rgba(61,107,79,0.10)`,
                    border: `1.5px solid rgba(61,107,79,0.18)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: C.primary,
                    flexShrink: 0,
                  }}
                >
                  {svc.icon}
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
                  {svc.title}
                </div>
              </div>
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
                {svc.body}
              </div>
              <div
                style={{
                  marginLeft: 44,
                  width: `${wipeW}%`,
                  maxWidth: 160,
                  height: 1.5,
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
// SCENE 4 — PROOF (frames 360–450, 3s)
//
// Three proof metrics. Each owns exactly 360px of the 1080px canvas.
// Forest green values at 148px. Clean, centred, no clutter.
// ═══════════════════════════════════════════════════════════════════════════

const METRICS = [
  { value: "600+", label: "events styled", sub: "weddings, galas, and corporate", color: C.primary, delay: 4 },
  { value: "48h", label: "or less delivery", sub: "for all metro area orders", color: C.amber, delay: 18 },
  { value: "100%", label: "satisfaction", sub: "guaranteed on every arrangement", color: C.primary, delay: 32 },
];

const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bgMid }} />

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 800px at 50% 50%,
            rgba(61,107,79,0.048) 0%, transparent 65%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {METRICS.map((m, i) => {
          const t = easeOut4(clamp((frame - m.delay) / 26, 0, 1));
          const wipeW = easeInOut3(clamp((frame - m.delay - 8) / 24, 0, 1)) * 100;
          const opacity = clamp(t / 0.25, 0, 1);

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                borderBottom: i < 2 ? `1.5px solid ${C.border}` : "none",
                opacity,
                transform: `translateY(${(1 - t) * 36}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 148,
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
              <div
                style={{
                  fontSize: 27,
                  fontWeight: 700,
                  color: C.dark,
                  fontFamily: SANS,
                  letterSpacing: -0.5,
                  marginBottom: 5,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: C.body,
                  fontFamily: SANS,
                  marginBottom: 18,
                }}
              >
                {m.sub}
              </div>
              <div
                style={{
                  width: `${wipeW * 0.38}%`,
                  maxWidth: 180,
                  height: 2,
                  background: m.color,
                  borderRadius: 1,
                  opacity: 0.40,
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
// Deep forest green. Amber breathing glow. Two headline lines.
// The warm dark close signals resolution — the emotional payoff.
// ═══════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const bgT = easeOut3(clamp(frame / 18, 0, 1));
  const line1 = useCinematicTextReveal(8, 18, 8);
  const line2 = useCinematicTextReveal(22, 18, 8);
  const sub = useCinematicTextReveal(38, 12, 5);
  const btnScale = easeOut4(clamp((frame - 50) / 20, 0, 1));
  const urlT = useCinematicTextReveal(66, 10, 4);

  const glow = useBreathingGlow(88, 0.50, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(155deg, ${C.dark} 0%, ${C.darkCTA} 100%)`,
          opacity: bgT,
        }}
      />

      {/* Amber glow — warm amber for this dark close */}
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
            rgba(193,123,44,${0.10 * glow}) 0%, transparent 68%)`,
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
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "rgba(193,123,44,0.36)",
            fontFamily: SANS,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: 44,
            opacity: line1.opacity,
          }}
        >
          Bloom · Bespoke Florals
        </div>

        {[
          { text: "Order today.", t: line1, color: "rgba(247,244,238,0.92)" },
          { text: "Wow them tomorrow.", t: line2, color: C.amber },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 72,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -3.5,
              lineHeight: 0.88,
              opacity: l.t.opacity,
              transform: `translateY(${l.t.translateY}px)`,
              filter: `blur(${l.t.blur}px)`,
            }}
          >
            {l.text}
          </div>
        ))}

        <div
          style={{
            fontSize: 20,
            color: "rgba(247,244,238,0.38)",
            fontFamily: SANS,
            lineHeight: 1.65,
            marginTop: 32,
            marginBottom: 48,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Fresh for 7+ days. Guaranteed.
        </div>

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
              background: C.amber,
              borderRadius: 18,
              padding: "20px 46px",
              boxShadow: `0 14px 44px rgba(193,123,44,0.30)`,
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
              Design yours
            </span>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.68)", fontWeight: 700 }}>
              →
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: 15,
            color: "rgba(247,244,238,0.22)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
            opacity: urlT.opacity,
          }}
        >
          bloomstudio.co
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const BloomAd: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = 540;

  const zoom = 1.0 + (frame / TOTAL) * 0.062;
  const roll = interpolate(
    frame,
    [0, 70, 170, 350, TOTAL],
    [-0.75, -0.18, 0.52, 0.72, 0.30],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const panX = interpolate(frame, [0, TOTAL], [10, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, TOTAL], [6, -5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom}) rotateZ(${roll}deg) translateX(${panX}px) translateY(${panY}px)`,
          transformOrigin: "center center",
        }}
      >
        <Sequence from={0}   durationInFrames={90}><SceneHook        /></Sequence>
        <Sequence from={90}  durationInFrames={150}><SceneArrangement /></Sequence>
        <Sequence from={240} durationInFrames={120}><SceneServices    /></Sequence>
        <Sequence from={360} durationInFrames={90}><SceneProof       /></Sequence>
        <Sequence from={450} durationInFrames={90}><SceneCTA         /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
