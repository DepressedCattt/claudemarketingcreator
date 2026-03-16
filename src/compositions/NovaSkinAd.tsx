/**
 * NovaSkin — "Your Skin's Daily Ritual"
 *
 * Skincare brand, 9:16 vertical (1080×1920)
 * Energy: Slow, luxurious, aspirational
 * Palette: Warm ivory, deep mauve, soft rose, warm gold
 * Motion: Organic floating, soft blur reveals, petal particles
 * Typography: Italic serif headlines, clean sans body
 *
 * Scene layout (30 fps, 450 total = 15s):
 *   Scene 1  0–90f    (3.0s) HOOK         — Serum bottle floats up; headline sweeps in
 *   Scene 2  90–240f  (5.0s) INGREDIENTS  — Three ingredient orbs arc in with descriptions
 *   Scene 3  240–360f (4.0s) KINETIC      — "Fed up with dull skin? We fixed that."
 *   Scene 4  360–450f (3.0s) CTA          — Soft card drops in; Shop Now button
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

/* ─── BRAND TOKENS ─── */
const C = {
  bg: "#FBF7F2",
  mauve: "#6B3E52",
  rose: "#F2C4CE",
  gold: "#D4A849",
  text: "#2C1810",
  body: "#9C7A6E",
  border: "#EDD9CE",
  glow: "rgba(212,168,73,0.14)",
};

/* ─── EASING ─── */
const easeOut3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const easeOut4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);

/* ─── SERUM BOTTLE ─── */
const SerumBottle: React.FC<{ startFrame: number; size?: number }> = ({ startFrame, size = 1 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const enterT = easeOut3(Math.min(localFrame / 28, 1));
  const floatY = Math.sin(localFrame * 0.032) * 10;
  const glowPulse = 0.7 + Math.sin(localFrame * 0.05) * 0.3;

  const w = Math.round(300 * size);
  const h = Math.round(510 * size);

  const y = (1 - enterT) * 100 + floatY;
  const opacity = interpolate(enterT, [0, 0.25], [0, 1]);

  return (
    <div style={{ opacity, transform: `translateY(${y}px)` }}>
      {/* Glow halo */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: w * 2,
          height: w * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(212,168,73,${0.15 * glowPulse}) 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      {/* Scaled bottle SVG via viewBox proportional scaling */}
      <svg width={w} height={h} viewBox="0 0 170 290">
        {/* Dropper cap */}
        <rect x={70} y={0} width={30} height={18} rx={7} fill={C.mauve} />
        <rect x={78} y={18} width={14} height={36} rx={4} fill={C.mauve} />
        {/* Shoulder */}
        <path
          d="M55,54 C55,44 75,47 85,47 C95,47 115,44 115,54 L120,96 C122,106 118,116 110,116 L60,116 C52,116 48,106 50,96 Z"
          fill={C.mauve}
        />
        {/* Body */}
        <rect x={48} y={112} width={74} height={148} rx={18} fill={C.mauve} />
        {/* Glass highlight left */}
        <rect x={54} y={118} width={16} height={130} rx={8} fill="rgba(255,255,255,0.14)" />
        {/* Glass highlight right */}
        <rect x={100} y={130} width={8} height={100} rx={4} fill="rgba(255,255,255,0.07)" />
        {/* Label card */}
        <rect x={53} y={148} width={64} height={88} rx={10} fill="rgba(255,255,255,0.10)" />
        {/* Label lines */}
        <rect x={60} y={158} width={50} height={4} rx={2} fill="rgba(255,255,255,0.55)" />
        <rect x={65} y={168} width={40} height={3} rx={1.5} fill="rgba(255,255,255,0.35)" />
        {/* Gold label band */}
        <rect x={60} y={180} width={50} height={10} rx={5} fill={`${C.gold}CC`} />
        <rect x={65} y={197} width={40} height={3} rx={1.5} fill="rgba(255,255,255,0.25)" />
        {/* Base shadow */}
        <ellipse cx={85} cy={272} rx={55} ry={7} fill="rgba(107,62,82,0.10)" />
      </svg>
    </div>
  );
};

/* ─── PETAL PARTICLES ─── */
const PetalSystem: React.FC = () => {
  const frame = useCurrentFrame();

  const PETALS = [
    { x: 90,  y: 220,  period: 88,  delay: 0,  size: 8,  color: C.rose },
    { x: 960, y: 380,  period: 72,  delay: 14, size: 6,  color: C.gold },
    { x: 180, y: 640,  period: 95,  delay: 28, size: 10, color: C.mauve },
    { x: 880, y: 780,  period: 66,  delay: 7,  size: 7,  color: C.rose },
    { x: 340, y: 1100, period: 82,  delay: 40, size: 5,  color: C.gold },
    { x: 760, y: 1250, period: 58,  delay: 20, size: 9,  color: C.rose },
    { x: 120, y: 1480, period: 74,  delay: 33, size: 7,  color: C.mauve },
    { x: 920, y: 1620, period: 90,  delay: 10, size: 6,  color: C.gold },
  ];

  return (
    <>
      {PETALS.map((p, i) => {
        const phase = ((frame + p.delay) % p.period) / p.period;
        const opacity = Math.sin(phase * Math.PI) * 0.45;
        const xDrift = Math.sin(phase * Math.PI * 1.5) * 18;
        const yDrift = phase * 35;
        const rot = frame * (i % 2 === 0 ? 1.2 : -0.9);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x + xDrift,
              top: p.y - yDrift,
              width: p.size,
              height: p.size,
              opacity,
              transform: `rotate(${rot}deg)`,
              transformOrigin: "center",
              pointerEvents: "none",
            }}
          >
            <svg viewBox="0 0 24 24" width={p.size} height={p.size}>
              <ellipse cx={12} cy={7}  rx={4.5} ry={8.5} fill={p.color} transform="rotate(0   12 12)" />
              <ellipse cx={12} cy={7}  rx={4.5} ry={8.5} fill={p.color} transform="rotate(72  12 12)" />
              <ellipse cx={12} cy={7}  rx={4.5} ry={8.5} fill={p.color} transform="rotate(144 12 12)" />
              <ellipse cx={12} cy={7}  rx={4.5} ry={8.5} fill={p.color} transform="rotate(216 12 12)" />
              <ellipse cx={12} cy={7}  rx={4.5} ry={8.5} fill={p.color} transform="rotate(288 12 12)" />
            </svg>
          </div>
        );
      })}
    </>
  );
};

/* ─── INGREDIENT HERO CARD ─── */
const IngredientHero: React.FC<{
  startFrame: number;
  icon: string;
  name: string;
  benefit: string;
  detail: string;
  accentColor: string;
  index: number;
  top: number;
}> = ({ startFrame, icon, name, benefit, detail, accentColor, index, top }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const t = easeOut4(Math.max(0, Math.min(localFrame / 28, 1)));
  const fromY = index % 2 === 0 ? 80 : -80;
  const opacity = interpolate(t, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
  const floatY = Math.sin(frame * 0.028 + index * 1.2) * 6;

  return (
    <div
      style={{
        position: "absolute",
        left: 64, right: 64,
        top,
        transform: `translateY(${fromY * (1 - t) + floatY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.96)",
          border: `2px solid ${accentColor}30`,
          borderRadius: 36,
          padding: "36px 44px",
          display: "flex",
          alignItems: "center",
          gap: 36,
          boxShadow: `0 20px 60px ${accentColor}16, 0 4px 16px rgba(0,0,0,0.06)`,
        }}
      >
        {/* Icon circle */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: `${accentColor}12`,
            border: `2.5px solid ${accentColor}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 46,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        {/* Text block */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: accentColor, fontFamily: "system-ui, sans-serif", fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 8 }}>
            Key Ingredient
          </div>
          <div style={{ fontSize: 52, fontWeight: 800, color: C.text, fontFamily: "Georgia, serif", letterSpacing: -1.5, lineHeight: 1, marginBottom: 10 }}>
            {name}
          </div>
          <div style={{ fontSize: 28, color: C.body, fontFamily: "system-ui, sans-serif", lineHeight: 1.4, marginBottom: 12 }}>
            {benefit}
          </div>
          <div style={{ fontSize: 20, color: accentColor, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── SCENE 1: HOOK ─── */
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();

  const tagT  = easeOut3(Math.min(frame / 18, 1));
  const h1T   = easeOut3(Math.max(0, Math.min((frame - 10) / 20, 1)));
  const h2T   = easeOut3(Math.max(0, Math.min((frame - 22) / 20, 1)));
  const subT  = easeOut3(Math.max(0, Math.min((frame - 46) / 18, 1)));
  const bottleT = easeOut3(Math.min(frame / 26, 1));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Glow: left side for text, right side for bottle */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 70% 55%, rgba(212,168,73,0.14) 0%, transparent 55%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 20% 50%, rgba(242,196,206,0.12) 0%, transparent 45%)` }} />

      <PetalSystem />

      {/* ── LEFT SIDE: Editorial text block ── */}
      <div
        style={{
          position: "absolute",
          left: 72, right: "50%",
          top: "50%",
          transform: "translateY(-50%)",
          paddingRight: 32,
        }}
      >
        {/* Tag */}
        <div style={{ opacity: tagT, transform: `translateY(${(1 - tagT) * -20}px)`, marginBottom: 40 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 18,
              fontWeight: 600,
              color: C.mauve,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: 3,
              textTransform: "uppercase",
              background: `${C.rose}40`,
              border: `1px solid ${C.rose}60`,
              borderRadius: 100,
              padding: "8px 24px",
            }}
          >
            Introducing NovaSkin
          </span>
        </div>

        {/* Headline */}
        <div style={{ overflow: "hidden", marginBottom: 4 }}>
          <div
            style={{
              fontSize: 108,
              fontWeight: 800,
              color: C.text,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              letterSpacing: -4,
              lineHeight: 1,
              transform: `translateY(${(1 - h1T) * 80}px)`,
              opacity: h1T,
            }}
          >
            Your
          </div>
        </div>
        <div style={{ overflow: "hidden", marginBottom: 4 }}>
          <div
            style={{
              fontSize: 108,
              fontWeight: 800,
              color: C.text,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              letterSpacing: -4,
              lineHeight: 1,
              transform: `translateY(${(1 - h1T) * 80}px)`,
              opacity: h1T,
            }}
          >
            skin's
          </div>
        </div>
        <div style={{ overflow: "hidden", marginBottom: 48 }}>
          <div
            style={{
              fontSize: 108,
              fontWeight: 800,
              color: C.mauve,
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              letterSpacing: -4,
              lineHeight: 1,
              transform: `translateY(${(1 - h2T) * 80}px)`,
              opacity: h2T,
            }}
          >
            daily ritual.
          </div>
        </div>

        {/* Gold divider */}
        <div style={{ width: `${subT * 100}%`, maxWidth: 200, height: 3, background: C.gold, borderRadius: 2, marginBottom: 28 }} />

        {/* Sub */}
        <div
          style={{
            fontSize: 24,
            color: C.body,
            fontFamily: "system-ui, sans-serif",
            lineHeight: 1.65,
            opacity: subT,
            transform: `translateY(${(1 - subT) * 20}px)`,
          }}
        >
          Science-backed skincare
          <br />
          for visibly healthier skin.
        </div>
      </div>

      {/* ── RIGHT SIDE: Large floating bottle ── */}
      <div
        style={{
          position: "absolute",
          left: "50%", right: 0,
          top: 0, bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: bottleT,
          transform: `translateY(${(1 - bottleT) * 60}px)`,
        }}
      >
        <SerumBottle startFrame={0} size={1} />
      </div>
    </AbsoluteFill>
  );
};

/* ─── SCENE 2: INGREDIENTS ─── */
const SceneIngredients: React.FC = () => {
  const frame = useCurrentFrame();

  const headerT = easeOut3(Math.min(frame / 18, 1));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${C.glow} 0%, transparent 60%)` }} />
      <PetalSystem />

      {/* Header */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0, right: 0,
          textAlign: "center",
          opacity: headerT,
          transform: `translateY(${(1 - headerT) * -20}px)`,
        }}
      >
        <div style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif", letterSpacing: 3.5, textTransform: "uppercase", fontWeight: 700 }}>
          What's inside
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: C.text,
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            letterSpacing: -2.5,
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          Key ingredients.
        </div>
      </div>

      {/* Full-width hero ingredient cards — distributed across the vertical canvas */}
      <IngredientHero
        startFrame={12}
        icon="✨"
        name="Vitamin C"
        benefit="Brightens & evens skin tone with visible results in 2 weeks"
        detail="15% L-Ascorbic Acid · Clinically proven"
        accentColor={C.gold}
        index={0}
        top={310}
      />
      <IngredientHero
        startFrame={46}
        icon="💧"
        name="Hyaluronic Acid"
        benefit="Deep, long-lasting hydration that plumps and restores"
        detail="Triple-weight formula · 24-hour moisture lock"
        accentColor={C.mauve}
        index={1}
        top={760}
      />
      <IngredientHero
        startFrame={86}
        icon="🌿"
        name="Retinol"
        benefit="Reduces fine lines, wrinkles and uneven texture"
        detail="0.3% Encapsulated Retinol · Dermatologist tested"
        accentColor={C.rose}
        index={2}
        top={1210}
      />
    </AbsoluteFill>
  );
};

/* ─── SCENE 3: KINETIC TEXT ─── */
const SceneKinetic: React.FC = () => {
  const frame = useCurrentFrame();

  const lines = [
    { text: "Fed up with",  color: "rgba(255,255,255,0.45)", delay: 0,  size: 78 },
    { text: "dull skin?",   color: "rgba(255,255,255,0.65)", delay: 18, size: 78 },
    { text: "We fixed",     color: C.rose,                   delay: 38, size: 90 },
    { text: "that.",        color: C.gold,                   delay: 54, size: 104 },
  ];

  return (
    <AbsoluteFill style={{ background: C.mauve }}>
      {/* Subtle texture */}
      {[...Array(5)].map((_, i) => {
        const phase = ((frame + i * 22) % 80) / 80;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 120 + i * 190,
              top: 260 + Math.sin(i * 1.4) * 180,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.rose,
              opacity: Math.sin(phase * Math.PI) * 0.18,
            }}
          />
        );
      })}

      {/* Gold accent bars */}
      <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 5, background: C.gold, transformOrigin: "left", transform: `scaleX(${easeOut3(Math.min(frame / 20, 1))})` }} />
      <div style={{ position: "absolute", left: 0, bottom: 0, right: 0, height: 5, background: C.gold, transformOrigin: "right", transform: `scaleX(${easeOut3(Math.min(frame / 20, 1))})` }} />

      <div
        style={{
          position: "absolute",
          left: 72,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {lines.map((line, i) => {
          const t = easeOut3(Math.max(0, Math.min((frame - line.delay) / 18, 1)));
          return (
            <div key={i} style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: line.size,
                  fontWeight: 800,
                  fontFamily: "Georgia, serif",
                  fontStyle: "italic",
                  letterSpacing: -2,
                  lineHeight: 1.05,
                  color: line.color,
                  transform: `translateY(${(1 - t) * 72}px)`,
                  opacity: interpolate(t, [0, 0.2], [0, 1]),
                }}
              >
                {line.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Brand mark */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          right: 72,
          opacity: easeOut3(Math.max(0, Math.min((frame - 60) / 20, 1))) * 0.55,
          fontSize: 22,
          color: "white",
          fontFamily: "Georgia, serif",
          fontStyle: "italic",
          letterSpacing: 2,
        }}
      >
        NovaSkin
      </div>
    </AbsoluteFill>
  );
};

/* ─── SCENE 4: CTA ─── */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const cardT = easeOut4(Math.min(frame / 28, 1));
  const btnT  = easeOut3(Math.max(0, Math.min((frame - 28) / 20, 1)));
  const urlT  = easeOut3(Math.max(0, Math.min((frame - 46) / 16, 1)));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${C.glow} 0%, transparent 55%)`,
        }}
      />
      <PetalSystem />

      {/* Card */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) scale(${cardT})`,
          opacity: cardT,
          width: 840,
          transformOrigin: "center",
        }}
      >
        <div
          style={{
            background: "white",
            border: `1.5px solid ${C.rose}55`,
            borderRadius: 40,
            padding: "56px 64px",
            textAlign: "center",
            boxShadow: `0 28px 80px ${C.mauve}16, 0 4px 16px rgba(0,0,0,0.06)`,
          }}
        >
          <div style={{ fontSize: 22, color: C.body, fontFamily: "system-ui, sans-serif", letterSpacing: 2.5, textTransform: "uppercase", fontWeight: 600, marginBottom: 12 }}>
            Start your ritual
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: C.text, fontFamily: "Georgia, serif", fontStyle: "italic", letterSpacing: -2, lineHeight: 1.1, marginBottom: 8 }}>
            Try NovaSkin
          </div>
          <div style={{ fontSize: 38, color: C.mauve, fontFamily: "Georgia, serif", fontStyle: "italic", marginBottom: 36 }}>
            30-day free trial
          </div>

          {/* Button */}
          <div style={{ transform: `scale(${btnT})`, opacity: btnT, display: "inline-block", transformOrigin: "center" }}>
            <div
              style={{
                background: `linear-gradient(135deg, ${C.mauve} 0%, #8B4E65 100%)`,
                borderRadius: 20,
                padding: "26px 72px",
                fontSize: 30,
                fontWeight: 700,
                color: "white",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: -0.3,
              }}
            >
              Shop Now →
            </div>
          </div>

          {/* URL */}
          <div style={{ marginTop: 24, fontSize: 20, color: C.body, fontFamily: "system-ui, sans-serif", opacity: urlT }}>
            novaskinsociety.com
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── ROOT ─── */
export const NovaSkinAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence from={0}   durationInFrames={90}><SceneHook /></Sequence>
      <Sequence from={90}  durationInFrames={150}><SceneIngredients /></Sequence>
      <Sequence from={240} durationInFrames={120}><SceneKinetic /></Sequence>
      <Sequence from={360} durationInFrames={90}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
};
