/**
 * MaisonCielAd — "Style is a language."
 *
 * Premium fashion boutique ad for Maison Ciel.
 * Deep navy canvas, champagne gold accents, ivory type.
 * The visual language of Parisian ready-to-wear — Dior meets editorial photography.
 *
 * Format:  16:9 landscape (1920 × 1080)
 * Duration: 540 frames @ 30fps = 18 seconds
 * BPM:     120 — 1 bar = 2s
 *
 * Scene breakdown:
 *  S1  Hook         (  0– 90f  3.0s)  Split-word convergence — MAISON slams left, CIEL right
 *  S2  Collection   ( 90–240f  5.0s)  Lookbook card enters from TOP arc — unique direction
 *  S3  Features     (240–360f  4.0s)  Three brand pillars left, card recedes right
 *  S4  Editorial    (360–450f  3.0s)  Three metric rows fill the 1080px canvas
 *  S5  CTA          (450–540f  3.0s)  Near-black close — champagne glow, decisive
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
  bg:       "#0C0E14",          // Deep navy — haute couture depth
  bgMid:    "#0F1118",          // Slightly warmer for scene variation
  darkCTA:  "#080A10",          // Deepest for CTA
  champagne:"#C8A876",          // Warm champagne gold — not yellow, not orange
  champSoft:"rgba(200,168,118,0.16)",
  ivory:    "#F2EDE3",          // Warm ivory for headline type
  ivoryDim: "rgba(242,237,227,0.44)",  // Subordinate body text
  ivoryFaint:"rgba(242,237,227,0.20)", // URL / quiet labels
  surface:  "#141720",          // Card surface — warmer navy
  border:   "rgba(200,168,118,0.14)",
  subtle:   "rgba(200,168,118,0.08)",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── Collection Card Hero ─────────────────────────────────────────────────────
const CollectionCard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;

  return (
    <div
      style={{
        width: 420 * S,
        background: `linear-gradient(155deg, ${C.surface}, #101318)`,
        borderRadius: 20 * S,
        boxShadow: `0 ${40 * S}px ${84 * S}px rgba(0,0,0,0.60),
                    0 ${6 * S}px ${20 * S}px rgba(200,168,118,0.07)`,
        border: `1px solid ${C.border}`,
        fontFamily: SANS,
        overflow: "hidden",
      }}
    >
      {/* Champagne accent bar */}
      <div
        style={{
          height: 3 * S,
          background: `linear-gradient(90deg, ${C.champagne}66, ${C.champagne}, ${C.champagne}66)`,
        }}
      />

      {/* Editorial image area — abstract fabric texture via layered divs */}
      <div
        style={{
          height: 180 * S,
          background: `linear-gradient(145deg, rgba(20,23,32,1) 0%, rgba(26,30,46,0.95) 100%)`,
          position: "relative",
          overflow: "hidden",
          borderBottom: `1px solid ${C.border}`,
        }}
      >
        {/* Diagonal accent lines — like fabric grain */}
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 200 * S,
              height: 1,
              background: `linear-gradient(90deg, transparent, rgba(200,168,118,${0.04 + i * 0.015}), transparent)`,
              top: `${20 + i * 32}%`,
              left: `-${10 * S}px`,
              transform: "rotate(-14deg)",
              transformOrigin: "left center",
            }}
          />
        ))}

        {/* Season label — large, editorial */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 10 * S,
              fontWeight: 700,
              color: `${C.champagne}60`,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: 10 * S,
            }}
          >
            Spring / Summer 2026
          </div>
          <div
            style={{
              fontSize: 28 * S,
              fontWeight: 900,
              color: C.ivory,
              letterSpacing: -1.5 * S,
              lineHeight: 1,
              textAlign: "center",
            }}
          >
            THE RIVIERA
          </div>
          <div
            style={{
              width: 40 * S,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${C.champagne}80, transparent)`,
              marginTop: 12 * S,
            }}
          />
        </div>
      </div>

      <div style={{ padding: `${20 * S}px ${22 * S}px` }}>
        {/* Collection meta */}
        <div
          style={{
            fontSize: 10 * S,
            fontWeight: 700,
            color: C.champagne,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            marginBottom: 8 * S,
          }}
        >
          New Collection
        </div>
        <div
          style={{
            fontSize: 20 * S,
            fontWeight: 800,
            color: C.ivory,
            letterSpacing: -0.8 * S,
            lineHeight: 1.15,
            marginBottom: 12 * S,
          }}
        >
          The Riviera
          <br />
          Collection
        </div>

        {/* Material details */}
        <div
          style={{
            fontSize: 11 * S,
            color: C.ivoryDim,
            fontFamily: SANS,
            lineHeight: 1.7,
            marginBottom: 16 * S,
          }}
        >
          Italian linen · French silk · Portuguese cotton
        </div>

        {/* Price + availability */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: C.subtle,
            border: `1px solid ${C.border}`,
            borderRadius: 10 * S,
            padding: `${10 * S}px ${14 * S}px`,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 9 * S,
                color: `${C.champagne}80`,
                fontWeight: 700,
                letterSpacing: "0.10em",
                textTransform: "uppercase",
                marginBottom: 3 * S,
              }}
            >
              Starting from
            </div>
            <div
              style={{
                fontSize: 18 * S,
                fontWeight: 800,
                color: C.champagne,
              }}
            >
              £195
            </div>
          </div>
          <div
            style={{
              fontSize: 9 * S,
              color: C.ivoryDim,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.10em",
              textAlign: "right",
              lineHeight: 1.5,
            }}
          >
            Free
            <br />
            worldwide
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–90, 3s)
//
// Split-word convergence — MAISON slams in from the left, CIEL from the right.
// Both words approach center simultaneously, meeting on the central axis.
// A champagne rule wipes across the bottom after they seat.
// Sub-text: Paris · Ready-to-Wear — arrives last.
//
// This is unique: a two-element symmetric convergence instead of standard
// single-word vertical drop. Signals editorial fashion without a product shot.
// ═══════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 12);

  // MAISON from left — spring on X, easeOut5 on opacity
  const maisonSpring = clamp(easeOut5(rawProgress(frame, 0, 28)), 0, 1);
  const maisonX = (1 - maisonSpring) * -280;
  const maisonOpacity = clamp(easeOut3(rawProgress(frame, 0, 14)) / 0.35, 0, 1);
  const maisonBlur = (1 - easeOut4(rawProgress(frame, 0, 32))) * 12;

  // CIEL from right — same timing, opposite direction
  const cielX = (1 - maisonSpring) * 280;
  const cielOpacity = maisonOpacity;
  const cielBlur = maisonBlur;

  // Separator "/" — appears when words are near-seated
  const sepOpacity = clamp(easeOut3(rawProgress(frame, 18, 16)) / 0.35, 0, 1);

  // Wipe rule — after words settle
  const wipe = usePremiumWipe(30, 26);

  // Sub-text — arrives last
  const sub = useCinematicTextReveal(44, 13, 5);

  const bgT = easeOut3(clamp(frame / 24, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Champagne glow — wide, horizontal band */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1400px 600px at 50% 50%,
            rgba(200,168,118,${0.048 * bgT}) 0%, transparent 68%)`,
        }}
      />

      {/* Converging wordmark — uses 0×0 absolute anchor at canvas centre */}
      <div
        style={{
          position: "absolute",
          top: "44%",
          left: "50%",
          width: 0,
          height: 0,
        }}
      >
        {/* MAISON — right edge anchored to centre, moves left */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate(calc(-100% + ${maisonX}px), -50%)`,
            opacity: maisonOpacity,
            filter: `blur(${maisonBlur}px)`,
          }}
        >
          <div
            style={{
              fontSize: 148,
              fontWeight: 900,
              fontFamily: SANS,
              color: C.ivory,
              letterSpacing: -8,
              lineHeight: 0.85,
              whiteSpace: "nowrap",
            }}
          >
            MAISON
          </div>
        </div>

        {/* Separator — "·" at the centre seam */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "translate(-50%, -62%)",
            opacity: sepOpacity,
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: C.champagne,
              fontFamily: SANS,
              fontWeight: 300,
              letterSpacing: 2,
            }}
          >
            ·
          </div>
        </div>

        {/* CIEL — left edge anchored to centre, moves right */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: `translate(${cielX + 6}px, -50%)`,
            opacity: cielOpacity,
            filter: `blur(${cielBlur}px)`,
          }}
        >
          <div
            style={{
              fontSize: 148,
              fontWeight: 900,
              fontFamily: SANS,
              color: C.champagne,
              letterSpacing: -8,
              lineHeight: 0.85,
              whiteSpace: "nowrap",
            }}
          >
            CIEL
          </div>
        </div>
      </div>

      {/* Champagne rule + sub — below the wordmark */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "62%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: `${wipe}%`,
            maxWidth: 480,
            height: 1.5,
            background: `linear-gradient(90deg, transparent, ${C.champagne}80, transparent)`,
            borderRadius: 1,
          }}
        />
        <div
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: C.ivoryDim,
            fontFamily: SANS,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Paris · Ready-to-Wear · Est. 2016
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — COLLECTION (frames 90–240, 5s)
//
// Collection card enters from TOP arc — variation from the standard below-entry.
// Arc path: fromX=80, fromY=-160 → card drops in from upper-right.
// This feels like a product being placed onto a display surface.
// Blur resolves on settle. Float loop begins after.
// Context reveals from the right side to complement the card position.
// ═══════════════════════════════════════════════════════════════════════════

const SceneCollection: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(150, 14);

  // Arc from TOP — unique direction: fromX positive (from right side), fromY negative (from above)
  const arc = useArcEntry(0, 80, -160, PREMIUM_SPRING.hero);
  const cardBlur = useBlurResolve(0, 30, 18);
  const cardOpacity = easeOut3(clamp(frame / 20, 0, 1));
  const cardScale = useSoftScaleIn(0, 0.90, 28);

  const floatY = useHeroFloatDelayed(38, 6, 92);
  const floatX = useHeroFloat(2.5, 128, Math.PI / 3);

  // Context — left of card, arrives after card seated
  const ctxLabel = useCinematicTextReveal(38, 12, 5);
  const ctxLine1 = useCinematicTextReveal(50, 18, 7);
  const ctxLine2 = useCinematicTextReveal(64, 18, 7);

  const glowT = easeOut3(clamp(frame / 42, 0, 1));
  const glow = useBreathingGlow(106, 0.50, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Champagne radial glow behind card */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 800px at 60% 50%,
            rgba(200,168,118,${0.058 * glowT * glow}) 0%, transparent 62%)`,
        }}
      />

      {/* Hero collection card — centred slightly right for rule-of-thirds balance */}
      <div
        style={{
          position: "absolute",
          left: "62%",
          top: "50%",
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
        <CollectionCard scale={1.1} />
      </div>

      {/* Context copy — left third, arrives after card */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: "50%",
          transform: "translateY(-50%)",
          width: 460,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.champagne,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            marginBottom: 18,
            opacity: ctxLabel.opacity,
            transform: `translateY(${ctxLabel.translateY}px)`,
          }}
        >
          Now available
        </div>
        {["The collection", "you've been waiting for."].map((text, i) => {
          const t = i === 0 ? ctxLine1 : ctxLine2;
          return (
            <div
              key={i}
              style={{
                fontSize: 52,
                fontWeight: 900,
                fontFamily: SANS,
                color: i === 1 ? C.champagne : C.ivory,
                letterSpacing: -2.5,
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

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — FEATURES (frames 240–360, 4s)
//
// Card de-emphasises to the right. Three brand pillars reveal left-to-right.
// Each pillar: icon chip + title + body + wipe underline.
// Stagger: 14 frames. Left-to-right reading order.
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: "◈",
    title: "European Craft",
    body: "Italian linen. French silk. Portuguese cotton. Made to last.",
    delay: 4,
  },
  {
    icon: "◇",
    title: "Capsule Drops",
    body: "42 exclusive pieces per release. Never mass-produced.",
    delay: 18,
  },
  {
    icon: "◉",
    title: "Personal Styling",
    body: "Complimentary with your first order. Curated for your life.",
    delay: 32,
  },
];

const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  const deempT = clamp(frame / 22, 0, 1);
  const deemph = depthDeemphasis(easeInOut3(deempT));

  const floatY = useHeroFloat(6, 92);
  const floatX = useHeroFloat(2.5, 128, Math.PI / 3);

  const eyebrow = useCinematicTextReveal(4, 12, 4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* De-emphasised card — right side anchor */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: "50%",
          opacity: deemph.opacity,
          filter: `blur(${deemph.blur}px)`,
          transform: `translateY(calc(-50% + ${floatY}px)) translateX(${floatX}px) scale(${deemph.scale})`,
          transformOrigin: "right center",
        }}
      >
        <CollectionCard scale={0.80} />
      </div>

      {/* Feature list — left side */}
      <div
        style={{
          position: "absolute",
          left: 120,
          top: "50%",
          transform: "translateY(-50%)",
          width: 580,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: C.champagne,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            marginBottom: 18,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          Why Maison Ciel
        </div>

        {FEATURES.map((feat, i) => {
          const t = easeOut4(clamp((frame - feat.delay) / 24, 0, 1));
          const wipeW = easeInOut3(clamp((frame - feat.delay - 14) / 22, 0, 1)) * 100;
          const opacity = clamp(t / 0.28, 0, 1);

          return (
            <div
              key={i}
              style={{
                marginBottom: i < 2 ? 38 : 0,
                opacity,
                transform: `translateX(${(1 - t) * -40}px)`,
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
                    background: `rgba(200,168,118,0.10)`,
                    border: `1.5px solid rgba(200,168,118,0.18)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: C.champagne,
                    flexShrink: 0,
                  }}
                >
                  {feat.icon}
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: C.ivory,
                    fontFamily: SANS,
                    letterSpacing: -0.5,
                  }}
                >
                  {feat.title}
                </div>
              </div>
              <div
                style={{
                  fontSize: 15,
                  color: C.ivoryDim,
                  fontFamily: SANS,
                  lineHeight: 1.6,
                  paddingLeft: 44,
                  marginBottom: 10,
                }}
              >
                {feat.body}
              </div>
              <div
                style={{
                  marginLeft: 44,
                  width: `${wipeW}%`,
                  maxWidth: 170,
                  height: 1.5,
                  background: `linear-gradient(90deg, ${C.champagne}55, transparent)`,
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
// SCENE 4 — EDITORIAL (frames 360–450, 3s)
//
// Three metrics. Each owns 360px of the 1080px canvas.
// Champagne values at 148px. Ivory labels. Precise, editorial, confident.
// ═══════════════════════════════════════════════════════════════════════════

const METRICS = [
  { value: "42", label: "pieces per collection", sub: "designed in Paris, made in Europe", color: C.champagne, delay: 4 },
  { value: "7", label: "exclusive colorways", sub: "available this season only", color: C.champagne, delay: 18 },
  { value: "Free", label: "worldwide delivery", sub: "express in 3–5 business days", color: C.champagne, delay: 32 },
];

const SceneEditorial: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bgMid }} />

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1100px 800px at 50% 50%,
            rgba(200,168,118,0.040) 0%, transparent 65%)`,
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
                  fontSize: 28,
                  fontWeight: 700,
                  color: C.ivory,
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
                  color: C.ivoryDim,
                  fontFamily: SANS,
                  marginBottom: 18,
                }}
              >
                {m.sub}
              </div>
              <div
                style={{
                  width: `${wipeW * 0.35}%`,
                  maxWidth: 160,
                  height: 1.5,
                  background: C.champagne,
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

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA (frames 450–540, 3s)
//
// Near-black. Champagne breathing glow.
// Two headline lines. The fashion philosophy, distilled.
// One button. One URL. No clutter.
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

  const glow = useBreathingGlow(92, 0.46, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${C.bg} 0%, ${C.darkCTA} 100%)`,
          opacity: bgT,
        }}
      />

      {/* Champagne ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%, -50%)",
          width: 1200,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(200,168,118,${0.08 * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Content — centred in landscape canvas */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 160px",
          textAlign: "center",
        }}
      >
        {/* Wordmark */}
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: `rgba(200,168,118,0.32)`,
            fontFamily: SANS,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            marginBottom: 52,
            opacity: line1.opacity,
          }}
        >
          Maison Ciel · Paris
        </div>

        {/* Headline — fashion philosophy */}
        {[
          { text: "Style is a language.", t: line1, color: C.ivory },
          { text: "Learn yours.", t: line2, color: C.champagne },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 96,
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
            fontSize: 20,
            color: C.ivoryFaint,
            fontFamily: SANS,
            lineHeight: 1.65,
            marginTop: 36,
            marginBottom: 52,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Free worldwide delivery. 30-day returns.
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
              gap: 16,
              background: C.champagne,
              borderRadius: 18,
              padding: "22px 56px",
              boxShadow: `0 16px 48px rgba(200,168,118,0.25)`,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: C.bg,
                fontFamily: SANS,
                letterSpacing: -0.5,
              }}
            >
              Explore Collection
            </span>
            <span style={{ fontSize: 18, color: `${C.bg}88`, fontWeight: 700 }}>
              →
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 14,
            color: C.ivoryFaint,
            fontFamily: MONO,
            letterSpacing: "0.05em",
            opacity: urlT.opacity,
          }}
        >
          maison-ciel.com
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const MaisonCielAd: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = 540;

  const zoom = 1.0 + (frame / TOTAL) * 0.062;
  const roll = interpolate(
    frame,
    [0, 70, 170, 350, TOTAL],
    [-0.85, -0.22, 0.50, 0.75, 0.32],
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
        <Sequence from={0}   durationInFrames={90}><SceneHook       /></Sequence>
        <Sequence from={90}  durationInFrames={150}><SceneCollection /></Sequence>
        <Sequence from={240} durationInFrames={120}><SceneFeatures   /></Sequence>
        <Sequence from={360} durationInFrames={90}><SceneEditorial  /></Sequence>
        <Sequence from={450} durationInFrames={90}><SceneCTA        /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
