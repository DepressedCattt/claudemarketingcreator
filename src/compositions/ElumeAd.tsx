/**
 * ElumeAd — "You were meant to shine."
 *
 * Premium beauty salon ad for Élume. Luxe social-first energy.
 * Near-black silk canvas, champagne type, rose-gold accents.
 * Editorial luxury meets addictive short-form energy.
 * Focus: transformation, confidence, before→after emotional payoff.
 *
 * Format:  9:16 vertical (1080 × 1920)
 * Duration: 540 frames @ 30fps = 18 seconds
 * BPM:     120 — 1 bar = 2s
 *
 * Scene breakdown:
 *  S1  Hook           (  0– 90f  3.0s)  "ÉLUME." slams in — champagne on near-black silk
 *  S2  Transformation ( 90–240f  5.0s)  Dark glass transformation card, arc entry from bottom-left
 *  S3  Services       (240–360f  4.0s)  Three luxury services reveal from left, card recedes
 *  S4  Social Proof   (360–450f  3.0s)  Three metric rows — each owns 640px of canvas
 *  S5  CTA            (450–540f  3.0s)  Rose-gold glow on near-black — confident close
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
  bg:        "#0C0A0D",             // Near-black with silk purple undertone
  bgMid:     "#111018",             // Slightly lighter for inner scenes
  surface:   "#1D1820",             // Card surface — deep plum-black
  champagne: "#F0E6D3",             // Warm luminous champagne
  rose:      "#C9837A",             // Dusty rose / rose-gold
  roseSoft:  "rgba(201,131,122,0.16)",
  gold:      "#D4A870",             // Warm amber-gold accent
  body:      "rgba(240,230,211,0.44)",
  bodyMid:   "rgba(240,230,211,0.24)",
  border:    "rgba(212,168,112,0.14)",
  borderRose: "rgba(201,131,122,0.18)",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const SERIF = '"Georgia", "Times New Roman", serif';

// ─── Transformation Card ──────────────────────────────────────────────────────
const TransformationCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;

  return (
    <div
      style={{
        width: 680 * S,
        background: `linear-gradient(148deg, ${C.surface} 0%, #14101A 100%)`,
        borderRadius: 28 * S,
        border: `1px solid ${C.borderRose}`,
        boxShadow: `
          0 ${52 * S}px ${104 * S}px rgba(0,0,0,0.65),
          0 ${8 * S}px ${28 * S}px rgba(201,131,122,0.07),
          inset 0 1px 0 rgba(240,230,211,0.06)
        `,
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      {/* Rose-gold shimmer top bar */}
      <div
        style={{
          height: 3 * S,
          background: `linear-gradient(90deg, ${C.rose}AA, ${C.gold}CC, ${C.rose}AA)`,
        }}
      />

      {/* Hair shine visual — abstract dimensional texture */}
      <div
        style={{
          height: 200 * S,
          position: "relative",
          overflow: "hidden",
          background: `linear-gradient(160deg, #1A1220 0%, #201828 60%, #180F15 100%)`,
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {/* Layered gradient ellipses simulating hair dimension and shine */}
        {[
          { w: 360, h: 70, x: -30, y: 40, rot: -12, c: `rgba(212,168,112,0.28)` },
          { w: 280, h: 55, x: 80,  y: 65, rot: -8,  c: `rgba(201,131,122,0.22)` },
          { w: 420, h: 60, x: -60, y: 90, rot: -15, c: `rgba(240,230,211,0.10)` },
          { w: 310, h: 50, x: 120, y: 120, rot: -6, c: `rgba(212,168,112,0.18)` },
          { w: 500, h: 80, x: -80, y: 150, rot: -10, c: `rgba(201,131,122,0.15)` },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: s.w * S,
              height: s.h * S,
              left: s.x * S,
              top: s.y * S,
              borderRadius: "50%",
              background: s.c,
              transform: `rotate(${s.rot}deg)`,
            }}
          />
        ))}

        {/* Gloss sweep — horizontal light reflection */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "22%",
            width: "18%",
            background: `linear-gradient(90deg, transparent, rgba(240,230,211,0.12), transparent)`,
            transform: "skewX(-10deg)",
          }}
        />

        {/* After badge — top right */}
        <div
          style={{
            position: "absolute",
            top: 16 * S,
            right: 18 * S,
            display: "flex",
            alignItems: "center",
            gap: 6 * S,
            background: `rgba(201,131,122,0.18)`,
            border: `1px solid ${C.borderRose}`,
            borderRadius: 100,
            padding: `${6 * S}px ${12 * S}px`,
          }}
        >
          <span style={{ fontSize: 9 * S, color: C.rose, fontWeight: 700, letterSpacing: "0.12em" }}>
            ✦ AFTER
          </span>
        </div>

        {/* Collection label */}
        <div
          style={{
            position: "absolute",
            bottom: 16 * S,
            left: 20 * S,
            fontSize: 9 * S,
            fontWeight: 700,
            color: C.gold,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            opacity: 0.70,
          }}
        >
          The Élume Transformation
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: `${26 * S}px ${30 * S}px` }}>
        {/* Client & service header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 * S }}>
          <div>
            <div
              style={{
                fontSize: 9 * S,
                fontWeight: 700,
                color: C.rose,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 6 * S,
              }}
            >
              CLIENT
            </div>
            <div
              style={{
                fontSize: 22 * S,
                fontWeight: 800,
                color: C.champagne,
                letterSpacing: -0.6 * S,
              }}
            >
              Isabelle D.
            </div>
          </div>
          <div
            style={{
              background: `rgba(212,168,112,0.10)`,
              border: `1px solid ${C.border}`,
              borderRadius: 10 * S,
              padding: `${8 * S}px ${14 * S}px`,
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: 8 * S, color: C.body, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 3 * S }}>
              Starting from
            </div>
            <div style={{ fontSize: 20 * S, fontWeight: 800, color: C.gold }}>$295</div>
          </div>
        </div>

        {/* Service tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8 * S,
            background: C.roseSoft,
            border: `1px solid ${C.borderRose}`,
            borderRadius: 8 * S,
            padding: `${9 * S}px ${16 * S}px`,
            marginBottom: 20 * S,
          }}
        >
          <span style={{ fontSize: 11 * S, fontWeight: 700, color: C.rose, letterSpacing: "0.04em" }}>
            Full Balayage + Hydration Treatment
          </span>
        </div>

        {/* Detail row */}
        <div
          style={{
            display: "flex",
            gap: 6 * S,
            flexWrap: "wrap" as const,
          }}
        >
          {["Dimensional colour", "Glossing treatment", "Blow-dry finish"].map((tag, i) => (
            <div
              key={i}
              style={{
                fontSize: 9 * S,
                fontWeight: 600,
                color: C.body,
                background: "rgba(240,230,211,0.05)",
                border: `1px solid rgba(240,230,211,0.08)`,
                borderRadius: 6 * S,
                padding: `${5 * S}px ${10 * S}px`,
                letterSpacing: "0.04em",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–90, 3s)
//
// Near-black silk. Champagne "ÉLUME." slams from above.
// A horizontal light sweep signals the "shine" motif before anything lands.
// Restraint: type is the hero. Nothing competes with it.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 12);

  // Horizontal light sweep — left→right over first 24 frames
  const sweepT = easeOut5(clamp(frame / 22, 0, 1));
  const sweepX = -15 + sweepT * 115; // -15% → 100%

  const badge = useCinematicTextReveal(4, 12, 5);
  const elume = useCinematicTextReveal(14, 22, 10);
  const wipe  = usePremiumWipe(32, 30);
  const sub   = useCinematicTextReveal(46, 14, 6);

  const bgGlow = easeOut3(clamp(frame / 30, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Deep rose glow — top area */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 700px at 55% 20%,
            rgba(201,131,122,${0.048 * bgGlow}) 0%, transparent 65%)`,
        }}
      />
      {/* Gold warmth — lower left */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 700px 600px at 20% 75%,
            rgba(212,168,112,${0.036 * bgGlow}) 0%, transparent 65%)`,
        }}
      />

      {/* Horizontal light sweep — the "shine" signal */}
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `${sweepX}%`,
          width: "28%",
          background: `linear-gradient(90deg, transparent, rgba(240,230,211,0.055), transparent)`,
          transform: "skewX(-6deg)",
          pointerEvents: "none",
        }}
      />

      {/* Content — left editorial layout with right padding for breathing room */}
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
            background: C.roseSoft,
            border: `1.5px solid ${C.borderRose}`,
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 48,
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
            filter: `blur(${badge.blur}px)`,
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.rose }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.rose,
              fontFamily: SANS,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
            }}
          >
            Élume · Luxury Hair Salon
          </span>
        </div>

        {/* Hero word — "ÉLUME." */}
        <div
          style={{
            fontSize: 170,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.champagne,
            letterSpacing: -9,
            lineHeight: 0.82,
            opacity: elume.opacity,
            transform: `translateY(${elume.translateY}px)`,
            filter: `blur(${elume.blur}px)`,
            marginBottom: 40,
          }}
        >
          ÉLUME.
        </div>

        {/* Rose-gold wipe rule */}
        <div
          style={{
            width: `${wipe}%`,
            maxWidth: 280,
            height: 2.5,
            background: `linear-gradient(90deg, ${C.rose}, ${C.rose}22)`,
            borderRadius: 2,
            marginBottom: 32,
          }}
        />

        {/* Sub copy */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            fontFamily: SANS,
            color: C.body,
            lineHeight: 1.60,
            maxWidth: 480,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          You were meant to shine.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — TRANSFORMATION (frames 90–240, 5s)
//
// The dark glass transformation card arrives from bottom-left arc.
// Blur resolves on settle — rack focus hierarchy signal.
// Float begins delayed after card seats. Context copy enters last.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneTransformation: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(150, 14);

  // Arc entry from bottom-left
  const arc = useArcEntry(0, 105, -120, PREMIUM_SPRING.hero);
  const cardBlur = useBlurResolve(0, 32, 18);
  const cardOpacity = easeOut3(clamp(frame / 18, 0, 1));
  const cardScale = useSoftScaleIn(0, 0.88, 28);

  // Float — X-axis sway for elegant salon card feel
  const floatY = useHeroFloatDelayed(40, 5.5, 92);
  const floatX = useHeroFloat(2.2, 128, Math.PI / 2.3);

  // Context copy
  const ctxEye   = useCinematicTextReveal(38, 12, 5);
  const ctxLine1 = useCinematicTextReveal(48, 16, 7);
  const ctxLine2 = useCinematicTextReveal(62, 16, 7);

  const glow = useBreathingGlow(108, 0.48, 0.95);
  const glowT = easeOut3(clamp(frame / 40, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Rose glow behind card */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 760px 760px at 50% 44%,
            rgba(201,131,122,${0.058 * glowT * glow}) 0%, transparent 60%)`,
        }}
      />

      {/* Hero transformation card — centred */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
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
        <TransformationCard scale={1.15} />
      </div>

      {/* Context copy — below card (bottom zone) */}
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 88,
          bottom: 100,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.gold,
            fontFamily: SANS,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            marginBottom: 12,
            opacity: ctxEye.opacity,
            transform: `translateY(${ctxEye.translateY}px)`,
          }}
        >
          The Élume transformation
        </div>
        {["From first appointment", "to your best hair ever."].map((text, i) => {
          const t = i === 0 ? ctxLine1 : ctxLine2;
          return (
            <div
              key={i}
              style={{
                fontSize: 40,
                fontWeight: 800,
                fontFamily: SANS,
                color: i === 1 ? C.rose : C.champagne,
                letterSpacing: -1.8,
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

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — SERVICES (frames 240–360, 4s)
//
// Card recedes to right via depthDeemphasis (depth anchor).
// Three luxury services reveal from left — editorial menu format.
// Each feature: icon chip, title, one-line body, brief underline wipe.
// ═══════════════════════════════════════════════════════════════════════════════
const SERVICES = [
  {
    icon: "◐",
    title: "Precision Cut & Style",
    body: "Sculpted to your face shape. Tailored to your life.",
    delay: 6,
  },
  {
    icon: "✦",
    title: "Color & Highlights",
    body: "Dimensional. Lived-in. Naturally luminous.",
    delay: 22,
  },
  {
    icon: "◈",
    title: "Scalp & Treatment",
    body: "The foundation of beautiful, healthy hair.",
    delay: 38,
  },
];

const SceneServices: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  const deempT   = clamp(frame / 20, 0, 1);
  const deemph   = depthDeemphasis(easeInOut3(deempT));
  const floatY   = useHeroFloat(5.5, 90);
  const floatX   = useHeroFloat(2.2, 128, Math.PI / 2.3);
  const eyebrow  = useCinematicTextReveal(4, 12, 4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* De-emphasised card — right anchor */}
      <div
        style={{
          position: "absolute",
          right: 48,
          top: "50%",
          opacity: deemph.opacity,
          filter: `blur(${deemph.blur}px)`,
          transform: `translateY(calc(-50% + ${floatY}px)) translateX(${floatX}px) scale(${deemph.scale})`,
          transformOrigin: "right center",
        }}
      >
        <TransformationCard scale={0.70} />
      </div>

      {/* Services list — left */}
      <div
        style={{
          position: "absolute",
          left: 88,
          top: "50%",
          transform: "translateY(-50%)",
          width: 500,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.gold,
            fontFamily: SANS,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            marginBottom: 24,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          Signature services
        </div>

        {SERVICES.map((svc, i) => {
          const t = easeOut4(clamp((frame - svc.delay) / 24, 0, 1));
          const wipeW = easeInOut3(clamp((frame - svc.delay - 14) / 22, 0, 1)) * 100;
          const op = clamp(t / 0.28, 0, 1);

          return (
            <div
              key={i}
              style={{
                marginBottom: i < 2 ? 38 : 0,
                opacity: op,
                transform: `translateX(${(1 - t) * -42}px)`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: C.roseSoft,
                    border: `1.5px solid ${C.borderRose}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: C.rose,
                    flexShrink: 0,
                  }}
                >
                  {svc.icon}
                </div>
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    color: C.champagne,
                    fontFamily: SANS,
                    letterSpacing: -0.6,
                  }}
                >
                  {svc.title}
                </div>
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: C.body,
                  fontFamily: SANS,
                  lineHeight: 1.58,
                  paddingLeft: 48,
                  marginBottom: 12,
                }}
              >
                {svc.body}
              </div>
              <div
                style={{
                  marginLeft: 48,
                  width: `${wipeW}%`,
                  maxWidth: 140,
                  height: 1.5,
                  background: `linear-gradient(90deg, ${C.rose}66, transparent)`,
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
// SCENE 4 — SOCIAL PROOF (frames 360–450, 3s)
//
// Three metrics. Each owns exactly 640px of 1920px canvas.
// Rose-gold, champagne, gold values at 152px. Clean, centred, confident.
// ═══════════════════════════════════════════════════════════════════════════════
const METRICS = [
  { value: "98%+",  label: "client satisfaction",   sub: "across 650+ completed transformations", color: C.rose,      delay: 4  },
  { value: "5.0★",  label: "average rating",         sub: "on Google & Fresha combined",           color: C.champagne, delay: 18 },
  { value: "650+",  label: "transformations",        sub: "and counting. Yours is next.",           color: C.gold,      delay: 32 },
];

const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bgMid }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 900px at 50% 50%,
            rgba(201,131,122,0.044) 0%, transparent 62%)`,
        }}
      />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {METRICS.map((m, i) => {
          const t = easeOut4(clamp((frame - m.delay) / 28, 0, 1));
          const wipeW = easeInOut3(clamp((frame - m.delay - 8) / 24, 0, 1)) * 100;
          const op = clamp(t / 0.24, 0, 1);

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
                borderBottom: i < 2 ? `1px solid rgba(212,168,112,0.10)` : "none",
                opacity: op,
                transform: `translateY(${(1 - t) * 38}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 152,
                  fontWeight: 900,
                  fontFamily: SANS,
                  color: m.color,
                  letterSpacing: -7,
                  lineHeight: 0.80,
                  marginBottom: 14,
                }}
              >
                {m.value}
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.champagne,
                  fontFamily: SANS,
                  letterSpacing: -0.5,
                  marginBottom: 7,
                }}
              >
                {m.label}
              </div>
              <div style={{ fontSize: 16, color: C.body, fontFamily: SANS, marginBottom: 20 }}>
                {m.sub}
              </div>
              <div
                style={{
                  width: `${wipeW * 0.32}%`,
                  maxWidth: 160,
                  height: 1.5,
                  background: m.color,
                  borderRadius: 1,
                  opacity: 0.38,
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
// SCENE 5 — CTA (frames 450–540, 3s)
//
// Near-black with rose-gold breathing glow. The emotional resolution.
// "You were meant to shine." — the payoff of the whole ad.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const bgT  = easeOut3(clamp(frame / 18, 0, 1));
  const line1 = useCinematicTextReveal(8, 18, 8);
  const line2 = useCinematicTextReveal(22, 18, 8);
  const sub   = useCinematicTextReveal(40, 12, 5);
  const btn   = easeOut4(clamp((frame - 52) / 20, 0, 1));
  const url   = useCinematicTextReveal(68, 10, 4);
  const glow  = useBreathingGlow(90, 0.52, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${C.bg} 0%, #100A0E 100%)`,
          opacity: bgT,
        }}
      />

      {/* Rose-gold ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(201,131,122,${0.10 * glow}) 0%, transparent 65%)`,
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
        {/* Brand eyebrow */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: `rgba(201,131,122,0.34)`,
            fontFamily: SANS,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            marginBottom: 48,
            opacity: line1.opacity,
          }}
        >
          Élume · Luxury Hair Salon
        </div>

        {/* Headline */}
        {[
          { text: "You were meant", color: `rgba(240,230,211,0.90)`, t: line1 },
          { text: "to shine.",      color: C.rose,                   t: line2 },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 76,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -3.8,
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
            color: C.body,
            fontFamily: SANS,
            lineHeight: 1.65,
            marginTop: 34,
            marginBottom: 52,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Book online in under a minute.
        </div>

        {/* CTA button */}
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
              background: C.rose,
              borderRadius: 18,
              padding: "22px 52px",
              boxShadow: `0 16px 48px rgba(201,131,122,0.28)`,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: "white", fontFamily: SANS }}>
              Book your transformation
            </span>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.68)", fontWeight: 700 }}>
              →
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: 15,
            color: "rgba(240,230,211,0.20)",
            fontFamily: SANS,
            letterSpacing: "0.06em",
            opacity: url.opacity,
          }}
        >
          elume.co
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const ElumeAd: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = 540;

  // Camera motion wrapper — slow dolly + roll + pan (linear)
  const zoom = 1.0 + (frame / TOTAL) * 0.060;
  const roll = interpolate(
    frame,
    [0, 72, 175, 360, TOTAL],
    [-0.80, -0.20, 0.48, 0.72, 0.28],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const panX = interpolate(frame, [0, TOTAL], [12, -9], {
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
        <Sequence from={0}   durationInFrames={90}><SceneHook           /></Sequence>
        <Sequence from={90}  durationInFrames={150}><SceneTransformation /></Sequence>
        <Sequence from={240} durationInFrames={120}><SceneServices       /></Sequence>
        <Sequence from={360} durationInFrames={90}><SceneProof          /></Sequence>
        <Sequence from={450} durationInFrames={90}><SceneCTA            /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
