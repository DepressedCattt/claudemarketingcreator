/**
 * LumenAd — "The full experience."
 *
 * Kinetic one-shot beauty salon ad for Lumen.
 * Every scene flows seamlessly into the next through visually motivated
 * clip-path transitions. The entire ad reads as one continuous camera move.
 *
 * Transition system:
 *  T1→2  Circular brush sweep  — a round brush sweeping left-to-right reveals S2
 *  T2→3  Vertical hair sweep   — hair lifted upward from bottom reveals S3
 *  T3→4  Diagonal slash        — mirror edge wipes top-left to bottom-right to reveal S4
 *  T4→5  Iris close            — black circle grows from center, then CTA emerges
 *
 * Format:  9:16 vertical (1080 × 1920)
 * Duration: 540 frames @ 30fps = 18 seconds
 * BPM:     122 — energetic but controlled
 *
 * Scene breakdown:
 *  S1  Arrival     (  0– 90f  3.0s)  Architectural white — "LUMEN" commands the frame
 *  S2  Detail      ( 90–240f  5.0s)  Signature service card — brush sweep entrance
 *  S3  Craft       (240–360f  4.0s)  Three precision moments — hair sweep entrance
 *  S4  Confidence  (360–450f  3.0s)  "TRANSFORMED." — diagonal slash entrance
 *  S5  CTA         (450–540f  3.0s)  Jet black + copper glow — iris open from close
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  clamp,
  easeOut3,
  easeOut4,
  easeOut5,
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
  bg:       "#F9F9F8",             // Architectural near-white
  ink:      "#080808",             // Jet black
  dark:     "#111111",             // Near-black for card surface
  darkCTA:  "#060606",             // Deepest for CTA
  copper:   "#B97C56",             // Burnished copper
  copperSoft: "rgba(185,124,86,0.12)",
  copperMid:  "rgba(185,124,86,0.28)",
  surface:  "#FFFFFF",             // Pure white card
  body:     "rgba(8,8,8,0.46)",
  bodyMid:  "rgba(8,8,8,0.28)",
  bodyLight: "rgba(249,249,248,0.44)", // Light body for dark scenes
  border:   "rgba(8,8,8,0.08)",
  borderCopper: "rgba(185,124,86,0.20)",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── Diagonal Wipe Clip Constants ─────────────────────────────────────────────
// For 9:16, a visually diagonal slash:
// To cover full 1080×1920 canvas, at 45° visual angle:
// every 100% of width traversed = 100%*(1920/1080) = 177.8% of height
// For a "slash" that sweeps across, we use DIAG_SLANT = 55 (empirical for premium 9:16)
const DIAG_SLANT = 55;

// ─── Service Card (used in S2) ────────────────────────────────────────────────
const ServiceCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;

  return (
    <div
      style={{
        width: 720 * S,
        background: `linear-gradient(148deg, ${C.dark} 0%, #0D0D0D 100%)`,
        borderRadius: 26 * S,
        border: `1px solid ${C.borderCopper}`,
        boxShadow: `
          0 ${52 * S}px ${110 * S}px rgba(0,0,0,0.52),
          0 ${8 * S}px ${28 * S}px rgba(185,124,86,0.08),
          inset 0 1px 0 rgba(249,249,248,0.05)
        `,
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      {/* Copper shimmer top bar */}
      <div style={{ height: 3 * S, background: `linear-gradient(90deg, ${C.copper}AA, ${C.copper}EE, ${C.copper}AA)` }} />

      {/* Hair texture visual — architectural abstract */}
      <div
        style={{
          height: 220 * S,
          position: "relative",
          overflow: "hidden",
          background: `#0A0A0A`,
          borderBottom: `1px solid ${C.borderCopper}`,
        }}
      >
        {/* Diagonal hair strand layers — graduated, dimensional */}
        {[
          { y: -20,  w: 900, h: 70, rot: -14, op: 0.22, c: C.copper },
          { y: 20,   w: 800, h: 55, rot: -11, op: 0.16, c: "#E8C89A" },
          { y: 50,   w: 950, h: 65, rot: -16, op: 0.14, c: C.copper },
          { y: 85,   w: 860, h: 60, rot: -12, op: 0.20, c: "#D4A870" },
          { y: 130,  w: 920, h: 50, rot: -13, op: 0.13, c: C.copper },
          { y: 165,  w: 780, h: 68, rot: -10, op: 0.18, c: "#E8C89A" },
        ].map((layer, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -20 * S,
              top: layer.y * S,
              width: layer.w * S,
              height: layer.h * S,
              borderRadius: `${layer.h * 0.5 * S}px`,
              background: layer.c,
              opacity: layer.op,
              transform: `rotate(${layer.rot}deg)`,
            }}
          />
        ))}

        {/* Primary gloss streak — the money shot */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "28%",
            width: "12%",
            background: `linear-gradient(90deg, transparent, rgba(249,249,248,0.16), transparent)`,
            transform: "skewX(-12deg)",
          }}
        />
        {/* Secondary gloss hint */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "58%",
            width: "7%",
            background: `linear-gradient(90deg, transparent, rgba(185,124,86,0.14), transparent)`,
            transform: "skewX(-10deg)",
          }}
        />

        {/* Badge — top left */}
        <div
          style={{
            position: "absolute",
            top: 16 * S,
            left: 18 * S,
            fontSize: 9 * S,
            fontWeight: 700,
            color: C.copper,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            opacity: 0.80,
          }}
        >
          Lumen Signature
        </div>

        {/* Dimension label — bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: 14 * S,
            right: 18 * S,
            display: "flex",
            alignItems: "center",
            gap: 6 * S,
            opacity: 0.55,
          }}
        >
          {["Dimension", "·", "Shine", "·", "Precision"].map((w, i) => (
            <span
              key={i}
              style={{
                fontSize: 8 * S,
                fontWeight: i % 2 === 0 ? 600 : 400,
                color: i % 2 === 0 ? C.copper : "rgba(185,124,86,0.50)",
                letterSpacing: "0.08em",
              }}
            >
              {w}
            </span>
          ))}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: `${28 * S}px ${30 * S}px` }}>
        {/* Service label */}
        <div
          style={{
            fontSize: 9 * S,
            fontWeight: 700,
            color: C.copper,
            letterSpacing: "0.16em",
            textTransform: "uppercase" as const,
            marginBottom: 10 * S,
          }}
        >
          Signature Service
        </div>

        {/* Service name */}
        <div
          style={{
            fontSize: 26 * S,
            fontWeight: 800,
            color: `rgba(249,249,248,0.96)`,
            letterSpacing: -1 * S,
            lineHeight: 1.1,
            marginBottom: 16 * S,
          }}
        >
          Lumen Gloss
          <br />
          Treatment
        </div>

        {/* Benefit chips */}
        <div style={{ display: "flex", gap: 8 * S, flexWrap: "wrap" as const, marginBottom: 20 * S }}>
          {["Colour-safe", "4-week shine", "Deep repair"].map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 9 * S,
                fontWeight: 600,
                color: C.bodyLight,
                background: "rgba(249,249,248,0.06)",
                border: `1px solid rgba(185,124,86,0.14)`,
                borderRadius: 6 * S,
                padding: `${5 * S}px ${10 * S}px`,
                letterSpacing: "0.04em",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Price row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `rgba(185,124,86,0.08)`,
            border: `1px solid ${C.borderCopper}`,
            borderRadius: 10 * S,
            padding: `${12 * S}px ${16 * S}px`,
          }}
        >
          <div>
            <div style={{ fontSize: 8 * S, color: C.bodyLight, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 3 * S }}>
              From
            </div>
            <div style={{ fontSize: 22 * S, fontWeight: 800, color: C.copper }}>£185</div>
          </div>
          <div style={{ textAlign: "right" as const }}>
            <div style={{ fontSize: 10 * S, color: C.copper, fontWeight: 700, letterSpacing: "0.06em", marginBottom: 2 * S }}>
              60–90 min
            </div>
            <div style={{ fontSize: 9 * S, color: C.bodyLight, fontWeight: 500 }}>
              includes consultation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — ARRIVAL (frames 0–90, 3s)
//
// Architectural white. "LUMEN" dominates the frame in jet black.
// Copper wipe rule. Restrained and confident.
// This is a salon that doesn't need to shout. It just is.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneArrival: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 14);

  const badge  = useCinematicTextReveal(4, 12, 5);
  const lumen  = useCinematicTextReveal(14, 24, 11);
  const wipe   = usePremiumWipe(36, 32);
  const sub    = useCinematicTextReveal(52, 14, 6);

  const bgT = easeOut3(clamp(frame / 28, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Subtle architectural depth — very slight copper warmth at bottom-left */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 700px 600px at 18% 80%,
            rgba(185,124,86,${0.04 * bgT}) 0%, transparent 65%)`,
        }}
      />

      {/* Content — left editorial layout */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 88px",
        }}
      >
        {/* Brand badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: C.copperSoft,
            border: `1.5px solid ${C.borderCopper}`,
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 48,
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
            filter: `blur(${badge.blur}px)`,
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.copper }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.copper, fontFamily: SANS, letterSpacing: "0.14em", textTransform: "uppercase" as const }}>
            Lumen · Hair Studio
          </span>
        </div>

        {/* "LUMEN" — architectural and commanding */}
        <div
          style={{
            fontSize: 192,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.ink,
            letterSpacing: -12,
            lineHeight: 0.80,
            opacity: lumen.opacity,
            transform: `translateY(${lumen.translateY}px)`,
            filter: `blur(${lumen.blur}px)`,
            marginBottom: 40,
          }}
        >
          LUMEN.
        </div>

        {/* Copper wipe rule */}
        <div
          style={{
            width: `${wipe}%`,
            maxWidth: 220,
            height: 2.5,
            background: `linear-gradient(90deg, ${C.copper}, ${C.copper}22)`,
            borderRadius: 2,
            marginBottom: 32,
          }}
        />

        {/* Sub copy — clean, confident, no fluff */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            fontFamily: SANS,
            color: C.body,
            lineHeight: 1.60,
            maxWidth: 440,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          The salon experience, elevated.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — DETAIL (frames 90–240, 5s)
//
// ENTRANCE: Circular brush sweep from left — an expanding ellipse
// reveals the scene like a round brush being swept across the frame.
// The dark service card establishes Lumen's signature treatment.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneDetail: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(150, 14);

  // === Kinetic entrance: circular brush sweep from left ===
  // An ellipse expands from the left edge, sweeping rightward
  const brushT = easeOut5(clamp(frame / 26, 0, 1));
  const brushW  = brushT * 220;           // 0% → 220% width
  const brushX  = -15 + brushT * 65;     // -15% → 50% — center moves right
  const clipPath = `ellipse(${brushW}% 75% at ${brushX}% 50%)`;

  // Card animation
  const arc = useArcEntry(0, 108, 120, PREMIUM_SPRING.hero);
  const cardBlur = useBlurResolve(0, 30, 16);
  const cardOpacity = easeOut3(clamp(frame / 20, 0, 1));
  const cardScale = useSoftScaleIn(0, 0.88, 28);

  const floatY = useHeroFloatDelayed(42, 5, 92);
  const floatX = useHeroFloat(2.0, 130, Math.PI / 2.5);

  const ctxEye   = useCinematicTextReveal(40, 12, 5);
  const ctxLine1 = useCinematicTextReveal(52, 16, 7);
  const ctxLine2 = useCinematicTextReveal(66, 16, 7);

  const glow  = useBreathingGlow(108, 0.50, 0.96);
  const glowT = easeOut3(clamp(frame / 36, 0, 1));

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        clipPath,           // Kinetic brush sweep entrance
        WebkitClipPath: clipPath,
      }}
    >
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Subtle copper warmth glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 700px at 50% 43%,
            rgba(185,124,86,${0.05 * glowT * glow}) 0%, transparent 62%)`,
        }}
      />

      {/* Hero service card — centred */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "43%",
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
        <ServiceCard scale={1.10} />
      </div>

      {/* Context copy — bottom */}
      <div style={{ position: "absolute", left: 88, right: 88, bottom: 96 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.copper,
            fontFamily: SANS,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            marginBottom: 12,
            opacity: ctxEye.opacity,
            transform: `translateY(${ctxEye.translateY}px)`,
          }}
        >
          One service. Lasting impression.
        </div>
        {["Engineered for", "visible results."].map((text, i) => {
          const t = i === 0 ? ctxLine1 : ctxLine2;
          return (
            <div
              key={i}
              style={{
                fontSize: 42,
                fontWeight: 800,
                fontFamily: SANS,
                color: i === 1 ? C.copper : C.ink,
                letterSpacing: -2,
                lineHeight: 0.90,
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

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — CRAFT (frames 240–360, 4s)
//
// ENTRANCE: Vertical hair sweep upward — the scene reveals from the bottom,
// as if hair being lifted by a blow-dryer sweeps away Scene 2.
// Three precision moments. Card recedes. Architectural white returns.
// ═══════════════════════════════════════════════════════════════════════════════
const CRAFT_MOMENTS = [
  {
    icon: "⊙",
    title: "Consultation & Analysis",
    body: "Every appointment begins with listening. Your hair, your goals, our plan.",
    delay: 8,
  },
  {
    icon: "◈",
    title: "Precision Technique",
    body: "Trained. Refined. Exact. Craft without compromise, every single time.",
    delay: 24,
  },
  {
    icon: "✦",
    title: "Finish & Perfection",
    body: "The final detail that separates good from unforgettable.",
    delay: 40,
  },
];

const SceneCraft: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  // === Kinetic entrance: vertical hair sweep upward ===
  const sweepT = easeOut4(clamp(frame / 24, 0, 1));
  const insetTop = (1 - sweepT) * 108; // 108% → 0% — reveals from bottom
  const clipPath = `inset(${insetTop}% 0 0 0)`;

  const deempT  = clamp(frame / 20, 0, 1);
  const deemph  = depthDeemphasis(easeInOut3(deempT));
  const floatY  = useHeroFloat(5, 90);
  const floatX  = useHeroFloat(2.0, 130, Math.PI / 2.5);
  const eyebrow = useCinematicTextReveal(8, 12, 4);

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      <AbsoluteFill style={{ background: C.bg }} />

      {/* De-emphasised card — right depth anchor */}
      <div
        style={{
          position: "absolute",
          right: 44,
          top: "50%",
          opacity: deemph.opacity,
          filter: `blur(${deemph.blur}px)`,
          transform: `translateY(calc(-50% + ${floatY}px)) translateX(${floatX}px) scale(${deemph.scale})`,
          transformOrigin: "right center",
        }}
      >
        <ServiceCard scale={0.68} />
      </div>

      {/* Craft list — left */}
      <div
        style={{
          position: "absolute",
          left: 88,
          top: "50%",
          transform: "translateY(-50%)",
          width: 490,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.copper,
            fontFamily: SANS,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            marginBottom: 26,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          The craft behind Lumen
        </div>

        {CRAFT_MOMENTS.map((m, i) => {
          const t = easeOut4(clamp((frame - m.delay) / 24, 0, 1));
          const wipeW = easeInOut3(clamp((frame - m.delay - 14) / 22, 0, 1)) * 100;
          const op = clamp(t / 0.28, 0, 1);

          return (
            <div
              key={i}
              style={{
                marginBottom: i < 2 ? 36 : 0,
                opacity: op,
                transform: `translateX(${(1 - t) * -38}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: C.copperSoft,
                    border: `1.5px solid ${C.borderCopper}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: C.copper,
                    flexShrink: 0,
                  }}
                >
                  {m.icon}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: C.ink, fontFamily: SANS, letterSpacing: -0.4 }}>
                  {m.title}
                </div>
              </div>
              <div style={{ fontSize: 15, color: C.body, fontFamily: SANS, lineHeight: 1.60, paddingLeft: 48, marginBottom: 12 }}>
                {m.body}
              </div>
              <div
                style={{
                  marginLeft: 48,
                  width: `${wipeW}%`,
                  maxWidth: 130,
                  height: 1.5,
                  background: `linear-gradient(90deg, ${C.copper}55, transparent)`,
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

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — CONFIDENCE (frames 360–450, 3s)
//
// ENTRANCE: Diagonal slash — the mirror edge wipes from top-left to
// bottom-right, like catching sunlight on a salon mirror.
// "TRANSFORMED." — singular, architectural, decisive.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneConfidence: React.FC = () => {
  const frame = useCurrentFrame();
  // Custom fade: use opacity for the iris lead-in but keep mostly opaque
  const baseFade = usePremiumFadeOut(90, 12);

  // === Kinetic entrance: diagonal slash top-left → bottom-right ===
  const slashT = easeOut5(clamp(frame / 26, 0, 1));
  const rawTop = slashT * (100 + DIAG_SLANT);
  const topX   = Math.min(100, rawTop);
  const botX   = Math.max(0, rawTop - DIAG_SLANT);
  const clipPath = `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;

  const mainWord = useCinematicTextReveal(20, 24, 12);
  const sub1     = useCinematicTextReveal(40, 16, 7);
  const sub2     = useCinematicTextReveal(52, 16, 7);
  const metaBadge = useCinematicTextReveal(62, 12, 5);

  const bgT = easeOut3(clamp(frame / 22, 0, 1));
  const glow = useBreathingGlow(100, 0.44, 0.96);

  return (
    <AbsoluteFill
      style={{
        opacity: baseFade,
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Subtle copper warmth — this is the payoff scene */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 800px at 50% 48%,
            rgba(185,124,86,${0.06 * bgT * glow}) 0%, transparent 60%)`,
        }}
      />

      {/* "TRANSFORMED." — centred, massive, decisive */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "44%",
          transform: "translateY(-50%)",
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontSize: 148,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.ink,
            letterSpacing: -8,
            lineHeight: 0.82,
            opacity: mainWord.opacity,
            transform: `translateY(${mainWord.translateY}px)`,
            filter: `blur(${mainWord.blur}px)`,
            marginBottom: 36,
          }}
        >
          TRANS
          <br />
          FORMED.
        </div>

        {/* Copper accent divider */}
        <div
          style={{
            width: 120,
            height: 2,
            background: C.copper,
            borderRadius: 1,
            margin: "0 auto 32px",
            opacity: sub1.opacity,
          }}
        />

        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            fontFamily: SANS,
            color: C.body,
            letterSpacing: 0,
            lineHeight: 1.65,
            opacity: sub1.opacity,
            transform: `translateY(${sub1.translateY}px)`,
            filter: `blur(${sub1.blur}px)`,
            marginBottom: 8,
          }}
        >
          This is what Lumen does.
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: SANS,
            color: C.copper,
            letterSpacing: -0.3,
            opacity: sub2.opacity,
            transform: `translateY(${sub2.translateY}px)`,
            filter: `blur(${sub2.blur}px)`,
          }}
        >
          Every appointment. Every time.
        </div>
      </div>

      {/* Meta badge — bottom proof */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 100,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          opacity: metaBadge.opacity,
          transform: `translateY(${metaBadge.translateY}px)`,
        }}
      >
        {[
          { v: "4.9★", l: "rating" },
          { v: "800+", l: "clients" },
          { v: "10 yrs", l: "expertise" },
        ].map((m, i) => (
          <div key={i} style={{ textAlign: "center" as const }}>
            <div style={{ fontSize: 32, fontWeight: 900, fontFamily: SANS, color: C.ink, letterSpacing: -1.5, lineHeight: 1 }}>{m.v}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.body, fontFamily: SANS, letterSpacing: "0.06em", textTransform: "uppercase" as const, marginTop: 4 }}>{m.l}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// IRIS CLOSE — transition between S4 and S5
//
// A black disc grows from center, covering the Confidence scene.
// Renders above all scene content via z-index at the root level.
// ═══════════════════════════════════════════════════════════════════════════════
const IrisClose: React.FC = () => {
  const frame = useCurrentFrame();
  const t = easeInOut3(clamp(frame / 22, 0, 1));
  const size = t * 220; // 0% → 220% covers entire frame

  return (
    <AbsoluteFill
      style={{
        background: C.darkCTA,
        clipPath: `circle(${size}% at 50% 50%)`,
        WebkitClipPath: `circle(${size}% at 50% 50%)`,
        zIndex: 99,
      }}
    />
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA (frames 450–540, 3s)
//
// Jet black. Copper breathing glow. The iris has closed —
// now we're in the Lumen world completely.
// "Book the experience." — measured, confident, final.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  // The iris close covers frames 0-24 of this scene, so content starts at ~f16
  const bgT  = easeOut3(clamp(frame / 16, 0, 1));
  const line1 = useCinematicTextReveal(16, 18, 8);
  const line2 = useCinematicTextReveal(30, 18, 8);
  const sub   = useCinematicTextReveal(46, 12, 5);
  const btn   = easeOut4(clamp((frame - 56) / 20, 0, 1));
  const url   = useCinematicTextReveal(72, 10, 4);
  const glow  = useBreathingGlow(90, 0.54, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(165deg, #111111 0%, ${C.darkCTA} 100%)`,
          opacity: bgT,
        }}
      />

      {/* Copper breathing glow — the warmth in the dark */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(185,124,86,${0.11 * glow}) 0%, transparent 62%)`,
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
          padding: "0 88px",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: `rgba(185,124,86,0.34)`,
            fontFamily: SANS,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            marginBottom: 48,
            opacity: line1.opacity,
          }}
        >
          Lumen · Hair Studio
        </div>

        {[
          { text: "Book the",     color: `rgba(249,249,248,0.92)`, t: line1 },
          { text: "experience.",  color: C.copper,                 t: line2 },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 80,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -4.2,
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
            color: "rgba(249,249,248,0.30)",
            fontFamily: SANS,
            lineHeight: 1.65,
            marginTop: 34,
            marginBottom: 52,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Limited appointments. Worth every moment.
        </div>

        <div
          style={{
            transform: `scale(${btn})`,
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
              background: C.copper,
              borderRadius: 18,
              padding: "22px 52px",
              boxShadow: `0 18px 50px rgba(185,124,86,0.28)`,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: "white", fontFamily: SANS }}>
              Book now
            </span>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.66)", fontWeight: 700 }}>→</span>
          </div>
        </div>

        <div
          style={{
            fontSize: 15,
            color: "rgba(249,249,248,0.18)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
            opacity: url.opacity,
          }}
        >
          lumen-salon.co
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const LumenAd: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = 540;

  // Camera motion — slightly more assertive for kinetic energy
  const zoom = 1.0 + (frame / TOTAL) * 0.065;
  const roll = interpolate(
    frame,
    [0, 80, 180, 370, TOTAL],
    [-0.85, -0.18, 0.52, 0.78, 0.30],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const panX = interpolate(frame, [0, TOTAL], [14, -10], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, TOTAL], [7, -5], {
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
        {/* Main scenes */}
        <Sequence from={0}   durationInFrames={90}><SceneArrival    /></Sequence>
        <Sequence from={90}  durationInFrames={150}><SceneDetail     /></Sequence>
        <Sequence from={240} durationInFrames={120}><SceneCraft      /></Sequence>
        <Sequence from={360} durationInFrames={90}><SceneConfidence /></Sequence>
        <Sequence from={450} durationInFrames={90}><SceneCTA        /></Sequence>

        {/* Iris close transition — renders on top of S4→S5 boundary */}
        <Sequence from={440} durationInFrames={24}><IrisClose /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
