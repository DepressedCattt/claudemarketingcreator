/**
 * VelourAd — "Cut above the rest."
 *
 * Premium barbershop / hair studio ad for Velour.
 * Editorial dark aesthetic — GQ meets luxury salon. Near-black canvas,
 * warm gold accents, cream type. The visual language of exclusive grooming.
 *
 * Format:  9:16 vertical (1080 × 1920)
 * Duration: 540 frames @ 30fps = 18 seconds
 * BPM:     120 — 1 bar = 2s
 *
 * Scene breakdown:
 *  S1  Hook         (  0– 90f  3.0s)  "VELOUR" word slam from above + gold rule wipe
 *  S2  Booking      ( 90–240f  5.0s)  Dark glass booking card, arc entry from bottom-left
 *  S3  Services     (240–360f  4.0s)  Three service panels reveal from left — editorial menu
 *  S4  Social Proof (360–450f  3.0s)  Three metric rows own the full 1920px canvas
 *  S5  CTA          (450–540f  3.0s)  Gold glow on dark — "Your next cut. Perfected."
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
  bg:       "#0A0A0A",
  bgMid:    "#0F0F0F",
  darkCTA:  "#060606",
  gold:     "#C9A84C",
  goldSoft: "rgba(201,168,76,0.18)",
  cream:    "#F5F0E8",
  surface:  "#1A1918",
  body:     "rgba(245,240,232,0.42)",
  bodyMid:  "rgba(245,240,232,0.25)",
  border:   "rgba(201,168,76,0.14)",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── Booking Card Hero ────────────────────────────────────────────────────────
const BookingCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;
  return (
    <div
      style={{
        width: 720 * S,
        background: `linear-gradient(145deg, ${C.surface}, #141210)`,
        borderRadius: 24 * S,
        border: `1px solid ${C.goldSoft}`,
        boxShadow: `0 ${44 * S}px ${88 * S}px rgba(0,0,0,0.55),
                    0 ${6 * S}px ${22 * S}px rgba(201,168,76,0.06)`,
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      {/* Gold accent top bar */}
      <div
        style={{
          height: 3 * S,
          background: `linear-gradient(90deg, ${C.gold}, #E5C974, ${C.gold})`,
        }}
      />

      <div style={{ padding: `${32 * S}px ${36 * S}px` }}>
        {/* Header row: brand + status badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32 * S,
          }}
        >
          <div
            style={{
              fontSize: 11 * S,
              fontWeight: 700,
              color: C.gold,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            VELOUR STUDIO
          </div>
          <div
            style={{
              background: "rgba(201,168,76,0.10)",
              border: `1px solid rgba(201,168,76,0.28)`,
              borderRadius: 100 * S,
              padding: `${5 * S}px ${14 * S}px`,
              display: "flex",
              alignItems: "center",
              gap: 7 * S,
            }}
          >
            <div
              style={{
                width: 5 * S,
                height: 5 * S,
                borderRadius: "50%",
                background: C.gold,
              }}
            />
            <span
              style={{
                fontSize: 10 * S,
                fontWeight: 700,
                color: C.gold,
                letterSpacing: "0.10em",
              }}
            >
              CONFIRMED
            </span>
          </div>
        </div>

        {/* Service hero text */}
        <div
          style={{
            fontSize: 34 * S,
            fontWeight: 900,
            color: C.cream,
            letterSpacing: -1.5 * S,
            lineHeight: 1,
            marginBottom: 6 * S,
          }}
        >
          SIGNATURE FADE
        </div>
        <div
          style={{
            fontSize: 18 * S,
            fontWeight: 400,
            color: C.body,
            letterSpacing: 1 * S,
            textTransform: "uppercase",
            marginBottom: 30 * S,
          }}
        >
          + Beard Sculpt
        </div>

        {/* Gold rule */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, ${C.gold}30, transparent)`,
            marginBottom: 26 * S,
          }}
        />

        {/* Detail columns */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 26 * S,
          }}
        >
          {[
            { label: "Stylist", value: "Marcus D." },
            { label: "Date & Time", value: "Sat 22 Mar · 2:00 PM" },
            { label: "Total", value: "$85", accent: true },
          ].map((d, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 9 * S,
                  color: C.bodyMid,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 5 * S,
                }}
              >
                {d.label}
              </div>
              <div
                style={{
                  fontSize: 15 * S,
                  fontWeight: 700,
                  color: d.accent ? C.gold : C.cream,
                }}
              >
                {d.value}
              </div>
            </div>
          ))}
        </div>

        {/* Location row */}
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 10 * S,
            padding: `${11 * S}px ${14 * S}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 12 * S,
              color: C.bodyMid,
              fontWeight: 500,
            }}
          >
            Velour Studio · Soho, New York
          </div>
          <div
            style={{
              fontSize: 14 * S,
              color: C.gold,
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
// "VELOUR" crashes in from above with a long drift + blur resolve.
// Gold rule wipes across full canvas width. Sub-text reveals clean.
// Dark bg. Pure typography. Restraint signals quality.
// ═══════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 12);

  const hero = useCinematicTextReveal(0, 44, 14);
  const rule = usePremiumWipe(22, 28);
  const sub = useCinematicTextReveal(34, 16, 6);
  const url = useCinematicTextReveal(52, 12, 4);

  const bgT = easeOut3(clamp(frame / 20, 0, 1));
  const glowA = useBreathingGlow(110, 0.4, 0.9);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Gold glow — bottom-centre */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 700px at 50% 80%,
            rgba(201,168,76,${0.055 * bgT * glowA}) 0%, transparent 70%)`,
        }}
      />

      {/* Centred content column */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Brand label */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.gold,
            fontFamily: SANS,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 52,
            opacity: url.opacity,
            transform: `translateY(${url.translateY}px)`,
          }}
        >
          Velour · New York
        </div>

        {/* Hero word */}
        <div
          style={{
            fontSize: 164,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.cream,
            letterSpacing: -9,
            lineHeight: 0.85,
            opacity: hero.opacity,
            transform: `translateY(${hero.translateY}px)`,
            filter: `blur(${hero.blur}px)`,
            marginBottom: 36,
          }}
        >
          VELOUR
        </div>

        {/* Gold rule — full width */}
        <div
          style={{
            width: `${rule}%`,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
            borderRadius: 1,
            marginBottom: 36,
            marginLeft: "auto",
            marginRight: "auto",
            maxWidth: 600,
          }}
        />

        {/* Sub copy */}
        <div
          style={{
            fontSize: 22,
            fontWeight: 300,
            color: C.body,
            fontFamily: SANS,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          Premier Hair Studio
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — BOOKING (frames 90–240, 5s)
//
// Dark glass booking card enters from bottom-left arc — variation in direction.
// Blur resolves as the card settles. Float loop begins after settle.
// Context copy waits until the card is seated before entering.
// ═══════════════════════════════════════════════════════════════════════════

const SceneBooking: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(150, 14);

  // Arc from bottom-left
  const arc = useArcEntry(0, -100, 140, PREMIUM_SPRING.hero);
  const cardBlur = useBlurResolve(0, 28, 16);
  const cardOpacity = easeOut3(clamp(frame / 18, 0, 1));
  const cardScale = useSoftScaleIn(0, 0.90, 26);

  const floatY = useHeroFloatDelayed(36, 6, 90);
  const floatX = useHeroFloat(3, 120, Math.PI / 3);

  const ctxLabel = useCinematicTextReveal(40, 14, 5);
  const ctxLine = useCinematicTextReveal(52, 18, 7);
  const ctxSub = useCinematicTextReveal(66, 14, 5);

  const glow = useBreathingGlow(100, 0.5, 1.0);
  const glowT = easeOut3(clamp(frame / 40, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Gold radial glow behind card */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 800px at 50% 42%,
            rgba(201,168,76,${0.07 * glowT * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Hero booking card — centred on canvas */}
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
        <BookingCard scale={1.0} />
      </div>

      {/* Context copy — lower third */}
      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 160,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: C.gold,
            fontFamily: SANS,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 14,
            opacity: ctxLabel.opacity,
            transform: `translateY(${ctxLabel.translateY}px)`,
          }}
        >
          Effortless booking
        </div>
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            fontFamily: SANS,
            color: C.cream,
            letterSpacing: -2,
            lineHeight: 0.92,
            marginBottom: 12,
            opacity: ctxLine.opacity,
            transform: `translateY(${ctxLine.translateY}px)`,
            filter: `blur(${ctxLine.blur}px)`,
          }}
        >
          Book in 30 seconds.
        </div>
        <div
          style={{
            fontSize: 20,
            color: C.body,
            fontFamily: SANS,
            opacity: ctxSub.opacity,
            transform: `translateY(${ctxSub.translateY}px)`,
          }}
        >
          3 master stylists · same-day available
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — SERVICES (frames 240–360, 4s)
//
// Three signature services as full-width editorial panels.
// Each panel is a numbered row with name, tagline, and price.
// Staggered entrance from the left — reads like a high-end service menu.
// ═══════════════════════════════════════════════════════════════════════════

const SERVICES = [
  {
    num: "01",
    name: "Signature Fade",
    tagline: "The definitive Velour cut. Tailored to your face.",
    price: "from $65",
    delay: 6,
  },
  {
    num: "02",
    name: "Beard Sculpt",
    tagline: "Precision edge work. Clean lines. No compromise.",
    price: "from $35",
    delay: 20,
  },
  {
    num: "03",
    name: "Color Craft",
    tagline: "Custom tone and texture. Formulated for you.",
    price: "from $120",
    delay: 34,
  },
];

const SceneServices: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  const eyebrow = useCinematicTextReveal(0, 12, 4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bgMid }} />

      {/* Eyebrow */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 80,
          fontSize: 11,
          fontWeight: 700,
          color: C.gold,
          fontFamily: SANS,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          opacity: eyebrow.opacity,
          transform: `translateY(${eyebrow.translateY}px)`,
        }}
      >
        Signature Services
      </div>

      {/* Service panels — stacked in the vertical canvas */}
      <div
        style={{
          position: "absolute",
          top: 220,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {SERVICES.map((s, i) => {
          const startF = s.delay;
          const t = easeOut4(clamp((frame - startF) / 26, 0, 1));
          const opacity = clamp(t / 0.28, 0, 1);
          const wipeW = easeInOut3(clamp((frame - startF - 10) / 24, 0, 1)) * 100;

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 80px",
                borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                opacity,
                transform: `translateX(${(1 - t) * -52}px)`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ flex: 1 }}>
                  {/* Service number */}
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.gold,
                      fontFamily: SANS,
                      letterSpacing: "0.14em",
                      marginBottom: 10,
                    }}
                  >
                    {s.num}
                  </div>
                  {/* Service name */}
                  <div
                    style={{
                      fontSize: 64,
                      fontWeight: 900,
                      color: C.cream,
                      fontFamily: SANS,
                      letterSpacing: -3,
                      lineHeight: 0.9,
                      marginBottom: 14,
                    }}
                  >
                    {s.name}
                  </div>
                  {/* Tagline */}
                  <div
                    style={{
                      fontSize: 18,
                      color: C.body,
                      fontFamily: SANS,
                      lineHeight: 1.5,
                      marginBottom: 16,
                    }}
                  >
                    {s.tagline}
                  </div>
                  {/* Wipe underline */}
                  <div
                    style={{
                      width: `${wipeW * 0.55}%`,
                      maxWidth: 220,
                      height: 1.5,
                      background: `linear-gradient(90deg, ${C.gold}66, transparent)`,
                      borderRadius: 1,
                    }}
                  />
                </div>

                {/* Price */}
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: C.gold,
                    fontFamily: SANS,
                    letterSpacing: -1,
                    marginLeft: 32,
                    marginTop: 36,
                    flexShrink: 0,
                  }}
                >
                  {s.price}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — SOCIAL PROOF (frames 360–450, 3s)
//
// Three metric rows — each row owns exactly 640px of the 1920px canvas.
// Gold values at 164px dominate each zone. Clean, centred, premium.
// Following the exact flex-1 centred pattern from the Meridian benchmark.
// ═══════════════════════════════════════════════════════════════════════════

const STATS = [
  { value: "4.9★", label: "from 2,340+ reviews", sub: "consistently rated best in class", delay: 4 },
  { value: "3", label: "master stylists", sub: "each with 10+ years of craft", delay: 18 },
  { value: "<10min", label: "to book", sub: "including same-day availability", delay: 32 },
];

const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bgMid }} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {STATS.map((s, i) => {
          const startF = s.delay;
          const t = easeOut4(clamp((frame - startF) / 26, 0, 1));
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
                alignItems: "center",
                textAlign: "center",
                borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                opacity,
                transform: `translateY(${(1 - t) * 36}px)`,
              }}
            >
              <div
                style={{
                  fontSize: 148,
                  fontWeight: 900,
                  fontFamily: SANS,
                  color: C.gold,
                  letterSpacing: -7,
                  lineHeight: 0.82,
                  marginBottom: 14,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: C.cream,
                  fontFamily: SANS,
                  letterSpacing: -0.5,
                  marginBottom: 6,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: C.body,
                  fontFamily: SANS,
                  marginBottom: 18,
                }}
              >
                {s.sub}
              </div>
              <div
                style={{
                  width: `${wipeW * 0.38}%`,
                  maxWidth: 180,
                  height: 1.5,
                  background: C.gold,
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
// Deepest dark. Gold breathing glow. Two headline lines.
// Single button. URL. Clean and decisive.
// The trust was built in the previous four scenes.
// ═══════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const bgT = easeOut3(clamp(frame / 18, 0, 1));
  const line1 = useCinematicTextReveal(8, 20, 9);
  const line2 = useCinematicTextReveal(22, 20, 9);
  const sub = useCinematicTextReveal(38, 12, 5);
  const btnScale = easeOut4(clamp((frame - 50) / 20, 0, 1));
  const urlT = useCinematicTextReveal(66, 10, 4);

  const glow = useBreathingGlow(90, 0.48, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${C.bg} 0%, ${C.darkCTA} 100%)`,
          opacity: bgT,
        }}
      />

      {/* Gold ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%, -50%)",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(201,168,76,${0.10 * glow}) 0%, transparent 68%)`,
        }}
      />

      {/* Content centred */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "rgba(201,168,76,0.38)",
            fontFamily: SANS,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginBottom: 52,
            opacity: line1.opacity,
          }}
        >
          VELOUR · NEW YORK
        </div>

        {/* Headline */}
        {[
          { text: "Your next cut.", t: line1, color: C.cream },
          { text: "Perfected.", t: line2, color: C.gold },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 88,
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
            color: C.body,
            fontFamily: SANS,
            lineHeight: 1.65,
            marginTop: 32,
            marginBottom: 52,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          First-time clients receive 20% off.
        </div>

        {/* CTA button */}
        <div
          style={{
            transform: `scale(${btnScale})`,
            transformOrigin: "center center",
            display: "inline-block",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: C.gold,
              borderRadius: 18,
              padding: "22px 52px",
              boxShadow: `0 16px 48px rgba(201,168,76,0.28)`,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0A0A0A",
                fontFamily: SANS,
                letterSpacing: -0.5,
              }}
            >
              Book Now
            </span>
            <span style={{ fontSize: 18, color: "rgba(10,10,10,0.6)", fontWeight: 700 }}>
              →
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 15,
            color: "rgba(201,168,76,0.26)",
            fontFamily: MONO,
            letterSpacing: "0.05em",
            opacity: urlT.opacity,
          }}
        >
          velour.studio
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const VelourAd: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = 540;

  // Camera motion — linear dolly-in + subtle roll + pan
  const zoom = 1.0 + (frame / TOTAL) * 0.065;
  const roll = interpolate(
    frame,
    [0, 70, 170, 350, TOTAL],
    [-0.8, -0.20, 0.48, 0.70, 0.28],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const panX = interpolate(frame, [0, TOTAL], [12, -8], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, TOTAL], [6, -4], {
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
        <Sequence from={0}   durationInFrames={90}><SceneHook     /></Sequence>
        <Sequence from={90}  durationInFrames={150}><SceneBooking  /></Sequence>
        <Sequence from={240} durationInFrames={120}><SceneServices /></Sequence>
        <Sequence from={360} durationInFrames={90}><SceneStats    /></Sequence>
        <Sequence from={450} durationInFrames={90}><SceneCTA      /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
