/**
 * HavenAd — "Your chair is waiting."
 *
 * Warm trust-building beauty salon ad for Haven Salon & Spa.
 * Human. Reassuring. Emotionally believable. Skilled professionals,
 * genuine care, real results. The salon people return to.
 *
 * Palette: Warm ivory + blush terracotta + deep espresso.
 * Mood: A welcoming, intimate space where expertise meets care.
 *
 * Format:  9:16 vertical (1080 × 1920)
 * Duration: 540 frames @ 30fps = 18 seconds
 * BPM:     116 — slightly under 120 for a more organic, unhurried feel
 *
 * Scene breakdown:
 *  S1  Hook           (  0– 90f  3.0s)  Warm ivory open — "YOU'RE IN GOOD HANDS." — light hook
 *  S2  Consultation   ( 90–240f  5.0s)  Appointment card — real detail, warm intimacy
 *  S3  Moments        (240–360f  4.0s)  Three authentic salon moments, left reveal
 *  S4  Trust          (360–450f  3.0s)  Three proof metrics — warm palette maintained
 *  S5  CTA            (450–540f  3.0s)  Deep espresso close — "Ready when you are."
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { VideoPlate } from "../components/VideoPlate";
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
  bg:      "#FAF7F3",             // Warm ivory — light hook background
  bgMid:   "#F5EFE8",             // Slightly deeper warm cream
  bgCTA:   "#281F1A",             // Deep espresso for close
  dark:    "#2A1F1A",             // Deep warm espresso
  terra:   "#BC7558",             // Warm terracotta
  terracSoft: "rgba(188,117,88,0.10)",
  rose:    "#D9A994",             // Soft dusty rose
  roseSoft: "rgba(217,169,148,0.16)",
  body:    "#9A7060",             // Warm muted body
  bodyDim: "rgba(154,112,96,0.60)",
  surface: "#FFFFFF",             // Appointment card surface
  border:  "rgba(188,117,88,0.16)",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── Appointment Card ─────────────────────────────────────────────────────────
// Warm, human, detailed — looks like a real booking
const AppointmentCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;

  return (
    <div
      style={{
        width: 700 * S,
        background: C.surface,
        borderRadius: 26 * S,
        boxShadow: `
          0 ${44 * S}px ${88 * S}px rgba(42,31,26,0.12),
          0 ${6 * S}px ${24 * S}px rgba(188,117,88,0.08),
          0 1px 0 rgba(255,255,255,0.90) inset
        `,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      {/* Warm terracotta top bar */}
      <div style={{ height: 4 * S, background: `linear-gradient(90deg, ${C.terra}, #D4957A, ${C.terra})` }} />

      <div style={{ padding: `${30 * S}px ${32 * S}px` }}>
        {/* Card header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 26 * S }}>
          <div>
            <div
              style={{
                fontSize: 10 * S,
                fontWeight: 700,
                color: C.terra,
                letterSpacing: "0.14em",
                textTransform: "uppercase" as const,
                marginBottom: 4 * S,
              }}
            >
              Haven · Salon & Spa
            </div>
            <div style={{ fontSize: 20 * S, fontWeight: 800, color: C.dark, letterSpacing: -0.5 * S }}>
              Your appointment
            </div>
          </div>

          {/* Live status indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7 * S,
              background: "rgba(72,187,120,0.10)",
              border: "1.5px solid rgba(72,187,120,0.24)",
              borderRadius: 100,
              padding: `${6 * S}px ${13 * S}px`,
            }}
          >
            <div style={{ width: 7 * S, height: 7 * S, borderRadius: "50%", background: "#48BB78" }} />
            <span style={{ fontSize: 10 * S, fontWeight: 700, color: "#2F855A", letterSpacing: "0.06em" }}>
              Confirmed
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: `rgba(188,117,88,0.10)`, marginBottom: 24 * S }} />

        {/* Date / time row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14 * S,
            marginBottom: 18 * S,
            background: C.terracSoft,
            borderRadius: 12 * S,
            border: `1px solid ${C.border}`,
            padding: `${14 * S}px ${18 * S}px`,
          }}
        >
          <div
            style={{
              width: 38 * S,
              height: 38 * S,
              borderRadius: 10 * S,
              background: C.terra,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 16 * S, color: "white" }}>◷</span>
          </div>
          <div>
            <div style={{ fontSize: 10 * S, fontWeight: 600, color: C.body, letterSpacing: "0.06em", marginBottom: 3 * S }}>
              DATE & TIME
            </div>
            <div style={{ fontSize: 16 * S, fontWeight: 700, color: C.dark }}>
              Saturday, 11:00am
            </div>
          </div>
        </div>

        {/* Service row */}
        <div style={{ marginBottom: 18 * S }}>
          <div style={{ fontSize: 10 * S, fontWeight: 600, color: C.body, letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 7 * S }}>
            Service
          </div>
          <div style={{ fontSize: 17 * S, fontWeight: 700, color: C.dark, letterSpacing: -0.3 * S }}>
            Cut & Color Consultation
          </div>
        </div>

        {/* Stylist row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12 * S,
            marginBottom: 20 * S,
            paddingBottom: 20 * S,
            borderBottom: `1px solid rgba(188,117,88,0.08)`,
          }}
        >
          {/* Stylist avatar placeholder */}
          <div
            style={{
              width: 42 * S,
              height: 42 * S,
              borderRadius: "50%",
              background: `linear-gradient(145deg, ${C.rose}, #C8826A)`,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16 * S,
              color: "white",
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div>
            <div style={{ fontSize: 14 * S, fontWeight: 700, color: C.dark }}>Laura M.</div>
            <div style={{ fontSize: 11 * S, color: C.body, fontWeight: 500 }}>9 years experience · Senior Stylist</div>
          </div>
        </div>

        {/* First visit note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10 * S,
          }}
        >
          <span style={{ fontSize: 14 * S, color: C.terra }}>☁</span>
          <div style={{ fontSize: 13 * S, color: C.body, fontWeight: 500, lineHeight: 1.5 }}>
            First visit? <strong style={{ color: C.terra, fontWeight: 700 }}>We'll take care of everything.</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–90, 3s)
//
// Warm ivory — LIGHT hook (proven to land better for social opening).
// "YOU'RE IN GOOD HANDS." — the entire emotional promise in 4 words.
// Soft warm glow top-right. No hard edges. This is a welcoming space.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 12);

  const badge  = useCinematicTextReveal(0, 12, 5);
  const line1  = useCinematicTextReveal(10, 22, 9);
  const line2  = useCinematicTextReveal(22, 22, 9);
  const wipe   = usePremiumWipe(36, 28);
  const sub    = useCinematicTextReveal(50, 14, 5);

  const bgT = easeOut3(clamp(frame / 26, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Soft warm bloom — upper right */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 880px 700px at 70% 22%,
            rgba(188,117,88,${0.06 * bgT}) 0%, transparent 65%)`,
        }}
      />
      {/* Subtle warmth — lower left */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 640px 540px at 16% 78%,
            rgba(217,169,148,${0.044 * bgT}) 0%, transparent 65%)`,
        }}
      />

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
            background: C.terracSoft,
            border: `1.5px solid ${C.border}`,
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 48,
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
            filter: `blur(${badge.blur}px)`,
          }}
        >
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.terra }} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.terra,
              fontFamily: SANS,
              letterSpacing: "0.14em",
              textTransform: "uppercase" as const,
            }}
          >
            Haven · Salon & Spa
          </span>
        </div>

        {/* Headline — two lines for warm conversational feel */}
        {[
          { text: "You're in",      t: line1 },
          { text: "good hands.",    t: line2 },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 108,
              fontWeight: 900,
              fontFamily: SANS,
              color: C.dark,
              letterSpacing: -5,
              lineHeight: 0.86,
              opacity: l.t.opacity,
              transform: `translateY(${l.t.translateY}px)`,
              filter: `blur(${l.t.blur}px)`,
              marginBottom: i === 0 ? 4 : 36,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* Terracotta wipe rule */}
        <div
          style={{
            width: `${wipe}%`,
            maxWidth: 260,
            height: 3,
            background: `linear-gradient(90deg, ${C.terra}, ${C.terra}22)`,
            borderRadius: 2,
            marginBottom: 30,
          }}
        />

        {/* Sub copy — warm, direct */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            fontFamily: SANS,
            color: C.body,
            lineHeight: 1.65,
            maxWidth: 460,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          Skilled professionals. Real results. Every time.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — CONSULTATION (frames 90–240, 5s)
//
// The appointment card arrives from bottom-right — intimate, detailed.
// Context copy emphasises the personal, tailored experience.
// This scene sells: "they take care of everything."
// ═══════════════════════════════════════════════════════════════════════════════
const SceneConsultation: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(150, 14);

  // Arc from bottom-right — different direction to Élume (variation matters)
  const arc = useArcEntry(0, 110, 130, PREMIUM_SPRING.hero);
  const cardBlur = useBlurResolve(0, 30, 16);
  const cardOpacity = easeOut3(clamp(frame / 18, 0, 1));
  const cardScale = useSoftScaleIn(0, 0.90, 28);

  const floatY = useHeroFloatDelayed(38, 5, 94);
  const floatX = useHeroFloat(2.0, 122, Math.PI / 2.8);

  const ctxEye  = useCinematicTextReveal(38, 12, 5);
  const ctxLine1 = useCinematicTextReveal(50, 16, 7);
  const ctxLine2 = useCinematicTextReveal(64, 16, 7);

  const glow  = useBreathingGlow(110, 0.44, 0.95);
  const glowT = easeOut3(clamp(frame / 38, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Warm glow behind card */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 720px 680px at 50% 43%,
            rgba(188,117,88,${0.055 * glowT * glow}) 0%, transparent 60%)`,
        }}
      />

      {/* Hero appointment card — centred */}
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
        <AppointmentCard scale={1.10} />
      </div>

      {/* Context copy — bottom */}
      <div style={{ position: "absolute", left: 88, right: 88, bottom: 96 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.terra,
            fontFamily: SANS,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            marginBottom: 12,
            opacity: ctxEye.opacity,
            transform: `translateY(${ctxEye.translateY}px)`,
          }}
        >
          Personalised from the start
        </div>
        {["Tailored to you,", "every single time."].map((text, i) => {
          const t = i === 0 ? ctxLine1 : ctxLine2;
          return (
            <div
              key={i}
              style={{
                fontSize: 42,
                fontWeight: 800,
                fontFamily: SANS,
                color: i === 1 ? C.terra : C.dark,
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
// SCENE 3 — MOMENTS (frames 240–360, 4s)
//
// Three authentic care moments — the emotional story of what Haven does.
// Card recedes. Moments slide in from left with soft organic timing.
// This is the "show don't sell" scene.
// ═══════════════════════════════════════════════════════════════════════════════
const MOMENTS = [
  {
    icon: "☁",
    title: "Personal Consultation",
    body: "We listen before we do anything. Your hair, your life, your goals.",
    delay: 6,
  },
  {
    icon: "✂",
    title: "Expert, Caring Hands",
    body: "Precision built on real experience. Never rushed, always right.",
    delay: 22,
  },
  {
    icon: "✦",
    title: "That Feeling",
    body: "Leaving more confident than when you arrived. Every time.",
    delay: 38,
  },
];

const SceneMoments: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  const deempT  = clamp(frame / 20, 0, 1);
  const deemph  = depthDeemphasis(easeInOut3(deempT));
  const floatY  = useHeroFloat(5, 92);
  const floatX  = useHeroFloat(2.0, 122, Math.PI / 2.8);
  const eyebrow = useCinematicTextReveal(4, 12, 4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* De-emphasised card — right anchor */}
      <div
        style={{
          position: "absolute",
          right: 40,
          top: "50%",
          opacity: deemph.opacity,
          filter: `blur(${deemph.blur}px)`,
          transform: `translateY(calc(-50% + ${floatY}px)) translateX(${floatX}px) scale(${deemph.scale})`,
          transformOrigin: "right center",
        }}
      >
        <AppointmentCard scale={0.68} />
      </div>

      {/* Moments list — left */}
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
            color: C.terra,
            fontFamily: SANS,
            textTransform: "uppercase" as const,
            letterSpacing: "0.16em",
            marginBottom: 24,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          The Haven experience
        </div>

        {MOMENTS.map((m, i) => {
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
                    background: C.terracSoft,
                    border: `1.5px solid ${C.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: C.terra,
                    flexShrink: 0,
                  }}
                >
                  {m.icon}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.dark,
                    fontFamily: SANS,
                    letterSpacing: -0.4,
                  }}
                >
                  {m.title}
                </div>
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: C.body,
                  fontFamily: SANS,
                  lineHeight: 1.60,
                  paddingLeft: 48,
                  marginBottom: 12,
                }}
              >
                {m.body}
              </div>
              <div
                style={{
                  marginLeft: 48,
                  width: `${wipeW}%`,
                  maxWidth: 130,
                  height: 1.5,
                  background: `linear-gradient(90deg, ${C.terra}55, transparent)`,
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
// SCENE 4 — TRUST (frames 360–450, 3s)
//
// Three proof metrics. Warm palette maintained — this ad never goes dark
// until the CTA. The warmth consistency signals authentic confidence.
// ═══════════════════════════════════════════════════════════════════════════════
const TRUST_METRICS = [
  { value: "12 yrs",  label: "of real expertise",   sub: "every stylist trained to the highest standard", color: C.terra, delay: 4  },
  { value: "4.9★",    label: "average rating",       sub: "across 1,200+ verified Google reviews",         color: C.dark,  delay: 18 },
  { value: "4,200+",  label: "clients looked after", sub: "and a waiting list to prove it",                color: C.terra, delay: 32 },
];

const SceneTrust: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bgMid }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 800px at 50% 50%,
            rgba(188,117,88,0.04) 0%, transparent 64%)`,
        }}
      />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {TRUST_METRICS.map((m, i) => {
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
                borderBottom: i < 2 ? `1px solid rgba(188,117,88,0.10)` : "none",
                opacity: op,
                transform: `translateY(${(1 - t) * 36}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 148,
                  fontWeight: 900,
                  fontFamily: SANS,
                  color: m.color,
                  letterSpacing: -6,
                  lineHeight: 0.80,
                  marginBottom: 14,
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
                  letterSpacing: -0.4,
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
                  width: `${wipeW * 0.34}%`,
                  maxWidth: 140,
                  height: 1.5,
                  background: m.color,
                  borderRadius: 1,
                  opacity: 0.36,
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
// Deep espresso close — warm dark tone shift signals resolution.
// Soft terracotta glow. "Your chair is waiting." — confident but gentle.
// The CTA feels like an invitation, not a push.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const bgT  = easeOut3(clamp(frame / 18, 0, 1));
  const eyebrow = useCinematicTextReveal(6, 12, 5);
  const line1 = useCinematicTextReveal(10, 18, 8);
  const line2 = useCinematicTextReveal(24, 18, 8);
  const sub   = useCinematicTextReveal(42, 12, 5);
  const btn   = easeOut4(clamp((frame - 54) / 20, 0, 1));
  const url   = useCinematicTextReveal(70, 10, 4);
  const glow  = useBreathingGlow(92, 0.46, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(162deg, #281F1A 0%, #1C1410 100%)`,
          opacity: bgT,
        }}
      />

      {/* Terracotta ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(188,117,88,${0.10 * glow}) 0%, transparent 66%)`,
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
            color: `rgba(188,117,88,0.34)`,
            fontFamily: SANS,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            marginBottom: 48,
            opacity: eyebrow.opacity,
          }}
        >
          Haven · Salon & Spa
        </div>

        {[
          { text: "Your chair",    color: `rgba(250,247,243,0.92)`, t: line1 },
          { text: "is waiting.",   color: C.terra,                  t: line2 },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 78,
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

        <div
          style={{
            fontSize: 22,
            color: "rgba(250,247,243,0.38)",
            fontFamily: SANS,
            lineHeight: 1.65,
            marginTop: 34,
            marginBottom: 52,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Ready when you are.
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
              background: C.terra,
              borderRadius: 18,
              padding: "22px 52px",
              boxShadow: `0 16px 48px rgba(188,117,88,0.26)`,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 800, color: "white", fontFamily: SANS }}>
              Book or enquire
            </span>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.66)", fontWeight: 700 }}>→</span>
          </div>
        </div>

        <div
          style={{
            fontSize: 15,
            color: "rgba(250,247,243,0.20)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
            opacity: url.opacity,
          }}
        >
          haven-salon.co
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const HavenAd: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = 540;

  // Camera motion — slightly gentler than Élume to match the warm, organic feel
  const zoom = 1.0 + (frame / TOTAL) * 0.055;
  const roll = interpolate(
    frame,
    [0, 68, 170, 350, TOTAL],
    [-0.65, -0.14, 0.44, 0.68, 0.22],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const panX = interpolate(frame, [0, TOTAL], [10, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, TOTAL], [5, -4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Video background plate — atmospheric depth layer */}
      <VideoPlate plateId="haven-warm" scrimColor={C.bg} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${zoom}) rotateZ(${roll}deg) translateX(${panX}px) translateY(${panY}px)`,
          transformOrigin: "center center",
        }}
      >
        <Sequence from={0}   durationInFrames={90}><SceneHook         /></Sequence>
        <Sequence from={90}  durationInFrames={150}><SceneConsultation /></Sequence>
        <Sequence from={240} durationInFrames={120}><SceneMoments      /></Sequence>
        <Sequence from={360} durationInFrames={90}><SceneTrust        /></Sequence>
        <Sequence from={450} durationInFrames={90}><SceneCTA          /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
