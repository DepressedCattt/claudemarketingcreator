/**
 * SeriAd — "Your best self begins here."
 *
 * Premium hair & beauty salon ad for SERI Studio.
 * Built as high-end motion design — masks, wipes, parallax, shape morphs, gloss sweeps.
 * One clear focal point per scene. Restrained, editorial, polished.
 *
 * Palette: warm off-white · dusty mauve · champagne gold
 * Format:  9:16 vertical (1080 × 1920)
 * Duration: 540 frames @ 30fps = 18 seconds
 *
 * Scene breakdown:
 *  S1  Opening   (  0– 90f  3.0s)  Brand reveal — ring arc draws, editorial typography
 *  S2  Salon     ( 90–225f  4.5s)  Depth-layered salon interior — parallax + mirror sheen
 *  S3  Tools     (225–360f  4.5s)  Scissors cutout hero — comb wipe exit
 *  S4  Transform (360–450f  3.0s)  Dark payoff — ring frame + "TRANSFORMED." reveal
 *  S5  CTA       (450–540f  3.0s)  Brand outro — logo, CTA, glow ring
 *
 * Transition overlays (rendered on top of scene stack):
 *  ScissorCutOverlay  (62–106f)   Two converging lines + snip flash at S1→S2 boundary
 *  GlossStreakOverlay (434–474f)  Diagonal bright sweep bridging S4→S5
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  clamp,
  easeOut3,
  easeOut4,
  easeOut5,
  easeInOut3,
  useCinematicTextReveal,
  useHeroFloat,
  useBreathingGlow,
  usePremiumFadeOut,
  rawProgress,
} from "../utils/premiumMotion";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        "#F6F3F0",
  bgLight:   "#FAF8F5",
  dark:      "#1A1614",
  darkMid:   "#241E1C",
  mauve:     "#A07890",
  mauveSoft: "rgba(160,120,144,0.16)",
  mauveMid:  "rgba(160,120,144,0.42)",
  champagne: "#C8B898",
  cream:     "#F8F5F2",
  ink:       "#1A1614",
  body:      "rgba(26,22,20,0.44)",
  bodyLight: "rgba(248,245,241,0.52)",
  white:     "#FEFCFA",
} as const;

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── SVG Ring Math ────────────────────────────────────────────────────────────
const RING1_R   = 300;
const RING1_C   = RING1_R * 2 * Math.PI;  // scene-1 ring circumference

const RING4_R   = 220;
const RING4_C   = RING4_R * 2 * Math.PI;  // scene-4 ring circumference

// ─── Sub-component: Scissors (large flat-design cutout) ──────────────────────
const ScissorsCutout: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;
  return (
    <svg
      width={440 * S}
      height={400 * S}
      viewBox="0 0 440 400"
      overflow="visible"
    >
      {/* === Blade A (points upper-right) at +22deg === */}
      <g transform="rotate(22 220 200)">
        <path
          d="M 208 200 L 210 60 C 211 35 215 20 215 20 C 215 20 225 35 226 60 L 228 200 Z"
          fill={C.ink}
          opacity={0.90}
        />
        {/* Cutting edge sheen */}
        <path
          d="M 215 20 C 225 35 226 60 228 200"
          stroke="rgba(220,212,204,0.30)"
          strokeWidth={1.8}
          fill="none"
        />
        {/* Champagne edge flash */}
        <path
          d="M 215 20 C 211 35 210 60 209 200"
          stroke={C.champagne}
          strokeWidth={1.1}
          fill="none"
          opacity={0.60}
        />
        {/* Handle ring */}
        <circle cx="215" cy="308" r="44" fill="none" stroke={C.ink} strokeWidth={15} />
        {/* Handle sheen */}
        <path
          d="M 183 292 Q 190 278 200 284"
          stroke="rgba(210,205,200,0.45)"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* === Blade B (points lower-right) at -22deg === */}
      <g transform="rotate(-22 220 200)">
        <path
          d="M 208 200 L 210 60 C 211 35 215 20 215 20 C 215 20 225 35 226 60 L 228 200 Z"
          fill={C.ink}
          opacity={0.82}
        />
        <path
          d="M 215 20 C 211 35 210 60 208 200"
          stroke="rgba(255,252,248,0.18)"
          strokeWidth={1.8}
          fill="none"
        />
        <circle cx="215" cy="308" r="44" fill="none" stroke={C.ink} strokeWidth={15} />
        <path
          d="M 183 292 Q 190 278 200 284"
          stroke="rgba(210,205,200,0.32)"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* Pivot bar */}
      <rect x="200" y="192" width="30" height="18" rx="6" fill={C.ink} opacity={0.55} />

      {/* Champagne screw */}
      <circle cx="215" cy="201" r="11" fill={C.champagne} />
      <circle cx="215" cy="201" r="4.5" fill={C.dark} opacity={0.70} />
      <line x1="211" y1="201" x2="219" y2="201" stroke={C.dark} strokeWidth={1.5} opacity={0.55} />
    </svg>
  );
};

// ─── Sub-component: Comb (flat design) ───────────────────────────────────────
const CombCutout: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;
  return (
    <svg width={200 * S} height={90 * S} viewBox="0 0 200 90" overflow="visible">
      {/* Body */}
      <rect x={0} y={0} width={200} height={44} rx={7} fill={C.ink} opacity={0.86} />
      {/* Surface sheen */}
      <rect x={5} y={5} width={100} height={14} rx={5} fill="rgba(255,255,255,0.09)" />
      {/* Champagne accent line */}
      <rect
        x={0}
        y={40}
        width={200}
        height={3}
        fill={C.champagne}
        opacity={0.50}
      />
      {/* Teeth — 15 teeth */}
      {Array.from({ length: 15 }, (_, i) => (
        <rect
          key={i}
          x={7 + i * 13}
          y={44}
          width={7}
          height={40}
          rx={3.5}
          fill={C.ink}
          opacity={0.84}
        />
      ))}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// OVERLAY: Scissor Cut Lines  (absolute 62–106, 44 frames)
//
// Two diagonal lines sweep inward from opposite corners. When they meet,
// a snip flash fires. Both lines then fade. This motivates Scene 2's
// diagonal-wipe entrance — it looks like the scissors just cut the frame open.
// ═══════════════════════════════════════════════════════════════════════════════
const ScissorCutOverlay: React.FC = () => {
  const frame     = useCurrentFrame();
  const convergeT = easeOut4(clamp(frame / 20, 0, 1));
  const lineAlpha = 1 - easeOut3(clamp((frame - 22) / 18, 0, 1));
  const snipFlash = Math.max(0, 1 - Math.abs(frame - 20) / 5) * 0.55;

  // Line 1: starts at (100%, 0%) sweeping toward center (50%, 50%)
  const l1x = 100 - convergeT * 50;   // 100 → 50
  const l1y = convergeT * 50;         //   0 → 50 (as %)

  // Line 2: starts at (0%, 100%) sweeping toward center
  const l2x = convergeT * 50;         //   0 → 50
  const l2y = 100 - convergeT * 50;   // 100 → 50

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Thin diagonal cut lines */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: lineAlpha }}
        viewBox="0 0 1080 1920"
        width={1080}
        height={1920}
      >
        {/* Line A: from top-right corner toward center */}
        <line
          x1={1080}
          y1={0}
          x2={l1x * 10.8}
          y2={l1y * 19.2}
          stroke={C.champagne}
          strokeWidth={1.8}
          opacity={0.70}
        />
        {/* Line B: from bottom-left corner toward center */}
        <line
          x1={0}
          y1={1920}
          x2={l2x * 10.8}
          y2={l2y * 19.2}
          stroke={C.champagne}
          strokeWidth={1.8}
          opacity={0.70}
        />
        {/* Bright dot at convergence point (the "snip") */}
        {convergeT > 0.85 && (
          <circle
            cx={540}
            cy={960}
            r={12 * (1 - easeOut3(clamp((frame - 22) / 14, 0, 1)))}
            fill={C.champagne}
            opacity={0.55 * lineAlpha}
          />
        )}
      </svg>

      {/* Snip flash */}
      {snipFlash > 0 && (
        <AbsoluteFill
          style={{ background: `rgba(255,252,248,${snipFlash})` }}
        />
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// OVERLAY: Gloss Streak  (absolute 434–474, 40 frames)
//
// A diagonal bright streak — a tilted gloss bar — sweeps from top-left
// to bottom-right. Keeps it subtle and luxury, not a camera flash.
// Bridges Scene 4's fade-out with Scene 5's entrance.
// ═══════════════════════════════════════════════════════════════════════════════
const GlossStreakOverlay: React.FC = () => {
  const frame   = useCurrentFrame();
  const sweepT  = easeInOut3(clamp(frame / 32, 0, 1));
  const xPos    = -280 + sweepT * 1680;
  const opacity = Math.sin(sweepT * Math.PI) * 0.45;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" as const }}>
      <div
        style={{
          position: "absolute",
          left: xPos,
          top: -300,
          width: 110,
          height: 2600,
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255,248,236,${opacity * 0.6}) 30%,
            rgba(255,252,244,${opacity}) 50%,
            rgba(255,248,236,${opacity * 0.6}) 70%,
            transparent 100%)`,
          transform: "rotate(-26deg)",
          transformOrigin: "center center",
        }}
      />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — OPENING  (frames 0–90, 3s)
//
// Clean warm background. A partial ring arc draws itself (SVG strokeDashoffset).
// "SERI" slams in via cinematic reveal. Gold rule wipes across.
// Tagline and badge enter with stagger.
// A soft diagonal light sweep crosses the top half of the frame.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneOpening: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 16);
  const bgT     = easeOut3(clamp(frame / 20, 0, 1));
  const glow    = useBreathingGlow(110, 0.5, 1.0);

  // Ring arc draws (75% of the circle)
  const ringT       = easeOut4(rawProgress(frame, 6, 42));
  const ringDashOff = RING1_C * (1 - ringT * 0.76);

  // Light sweep across the upper half
  const sweepT = easeInOut3(rawProgress(frame, 12, 38));
  const sweepX = -400 + sweepT * 1880;

  // Slow scale-in (camera drift simulation)
  const scaleIn = 1.0 + easeOut3(clamp(frame / 70, 0, 1)) * 0.018;

  const badge    = useCinematicTextReveal(6,  10, 4);
  const hero     = useCinematicTextReveal(18, 26, 11);
  const rule     = easeInOut3(rawProgress(frame, 34, 26)) * 100;
  const tagline  = useCinematicTextReveal(48, 16, 7);
  const sub      = useCinematicTextReveal(60, 12, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${C.bgLight} 0%, ${C.bg} 55%, #EDE9E4 100%)`,
          transform: `scale(${scaleIn})`,
          transformOrigin: "center center",
        }}
      />

      {/* Warm centre glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 700px at 50% 46%,
            rgba(160,120,144,${0.055 * bgT * glow}) 0%, transparent 60%)`,
        }}
      />

      {/* Diagonal light sweep */}
      <div
        style={{
          position: "absolute",
          left: sweepX,
          top: -200,
          width: 90,
          height: 1400,
          background: `linear-gradient(90deg,
            transparent, rgba(255,252,248,0.22), transparent)`,
          transform: "rotate(-30deg)",
          transformOrigin: "center center",
          pointerEvents: "none",
        }}
      />

      {/* Ring arc — SVG, centred on brand block */}
      <svg
        style={{ position: "absolute", inset: 0 }}
        viewBox="0 0 1080 1920"
        width={1080}
        height={1920}
      >
        {/* Soft outer glow ring */}
        <circle
          cx={540}
          cy={900}
          r={RING1_R + 8}
          fill="none"
          stroke={`rgba(160,120,144,${0.10 * glow})`}
          strokeWidth={18}
          strokeDasharray={RING1_C}
          strokeDashoffset={ringDashOff * 0.92}
        />
        {/* Main champagne ring */}
        <circle
          cx={540}
          cy={900}
          r={RING1_R}
          fill="none"
          stroke={C.champagne}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={RING1_C}
          strokeDashoffset={ringDashOff}
          opacity={0.55}
        />
        {/* Inner mauve ring — slightly smaller, slightly delayed */}
        <circle
          cx={540}
          cy={900}
          r={RING1_R - 12}
          fill="none"
          stroke={C.mauve}
          strokeWidth={0.8}
          strokeLinecap="round"
          strokeDasharray={RING1_C}
          strokeDashoffset={ringDashOff * 1.08}
          opacity={0.28}
        />
      </svg>

      {/* Content block — centred on canvas */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0,
          top: "50%", transform: "translateY(-54%)",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: C.mauveSoft,
            border: `1.5px solid ${C.mauveMid}`,
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 52,
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
            filter: `blur(${badge.blur}px)`,
          }}
        >
          <div
            style={{
              width: 5, height: 5, borderRadius: "50%",
              background: C.mauve,
            }}
          />
          <span
            style={{
              fontSize: 12, fontWeight: 700, color: C.mauve, fontFamily: SANS,
              letterSpacing: "0.16em", textTransform: "uppercase" as const,
            }}
          >
            Seri · Hair & Beauty
          </span>
        </div>

        {/* "SERI" hero */}
        <div
          style={{
            fontSize: 148, fontWeight: 900, fontFamily: SANS,
            color: C.ink, letterSpacing: -8, lineHeight: 0.82,
            opacity: hero.opacity,
            transform: `translateY(${hero.translateY}px)`,
            filter: `blur(${hero.blur}px)`,
            marginBottom: 32,
          }}
        >
          SERI
        </div>

        {/* Mauve rule wipe */}
        <div
          style={{
            width: `${rule * 0.68}%`,
            maxWidth: 210,
            height: 2,
            background: `linear-gradient(90deg, ${C.mauve}, ${C.champagne})`,
            borderRadius: 1,
            margin: "0 auto 32px",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: 26, fontWeight: 300, fontFamily: SANS,
            color: C.body, letterSpacing: "0.06em", lineHeight: 1.5,
            marginBottom: 14,
            opacity: tagline.opacity,
            transform: `translateY(${tagline.translateY}px)`,
            filter: `blur(${tagline.blur}px)`,
          }}
        >
          Your best self begins here.
        </div>

        {/* Sub / location hint */}
        <div
          style={{
            fontSize: 14, fontWeight: 500, fontFamily: SANS,
            color: "rgba(26,22,20,0.28)", letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            opacity: sub.opacity,
          }}
        >
          Hair Studio · Est. 2018
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — SALON INTERIOR  (frames 90–225, 4.5s)
//
// ENTRANCE: Diagonal mask wipe from left (the scissor cut "opens").
// Three-layer parallax composition:
//   BG layer  — warm cream wall + ceiling light (moves at 0.28×)
//   MID layer — tall rectangular mirror (gold frame, reflective sheen) +
//               simplified chair silhouette (moves at 0.55×)
//   FG layer  — headline + subtext (moves at 1.0×)
// Mirror gets a slow gloss sweep to stay alive throughout the scene.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneSalon: React.FC = () => {
  const frame      = useCurrentFrame();
  const fadeOut    = usePremiumFadeOut(135, 18);
  const mirrorGlow = useBreathingGlow(140, 0.55, 1.0);
  const eyebrow    = useCinematicTextReveal(22, 12, 5);
  const headline   = useCinematicTextReveal(32, 22, 10);
  const sub        = useCinematicTextReveal(50, 14, 6);

  // ENTRANCE: diagonal wipe from left (the "cut" opening)
  const SLANT    = 52;
  const wipeT    = easeOut5(clamp(frame / 24, 0, 1));
  const raw      = wipeT * (100 + SLANT);
  const topX     = Math.min(100, raw);
  const botX     = Math.max(0, raw - SLANT);
  const clipPath = `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;

  // Slow camera glide (leftward)
  const glideT = easeInOut3(clamp(frame / 135, 0, 1));
  const camX   = glideT * -50;

  // Mirror gloss sweep — animated back and forth within scene
  const glossT  = easeInOut3(rawProgress(frame, 28, 70));
  const glossX2 = -30 + glossT * 80; // sweeps from -30% to 50% of mirror width

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      {/* === BG LAYER — wall === */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(185deg, #EDE8E2 0%, ${C.bg} 40%, #E6E0D8 100%)`,
          transform: `translateX(${camX * 0.28}px)`,
        }}
      />

      {/* Warm ceiling light bloom */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 480px at 50% 0%,
            rgba(255,238,195,0.14) 0%, transparent 55%)`,
          transform: `translateX(${camX * 0.28}px)`,
        }}
      />

      {/* === MID LAYER — mirror + chair === */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${camX * 0.55}px)`,
        }}
      >
        {/* PRIMARY MIRROR — tall floor-to-ceiling, left-center */}
        <div
          style={{
            position: "absolute",
            left: 100, top: 230, width: 420, height: 680,
            borderRadius: 6,
            background: `linear-gradient(148deg,
              rgba(248,244,240,0.92) 0%,
              rgba(255,255,253,0.82) 45%,
              rgba(240,234,227,0.90) 100%)`,
            border: `2.5px solid rgba(200,184,152,0.40)`,
            boxShadow: `0 4px 50px rgba(0,0,0,0.07),
              inset 0 1px 0 rgba(255,255,255,0.80)`,
            overflow: "hidden",
          }}
        >
          {/* Moving gloss sweep */}
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0,
              left: `${glossX2}%`, width: "18%",
              background: `linear-gradient(90deg,
                transparent,
                rgba(255,255,255,${0.30 * mirrorGlow}),
                transparent)`,
              transform: "skewX(-6deg)",
            }}
          />
          {/* Secondary sheen */}
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0, left: "62%", width: "11%",
              background: `linear-gradient(90deg,
                transparent,
                rgba(255,255,255,${0.16 * mirrorGlow}),
                transparent)`,
              transform: "skewX(-5deg)",
            }}
          />
          {/* Gold top accent bar */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg,
                rgba(200,184,152,0.35), rgba(200,184,152,0.72), rgba(200,184,152,0.35))`,
            }}
          />
          {/* Gold bottom accent bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg,
                rgba(200,184,152,0.22), rgba(200,184,152,0.52), rgba(200,184,152,0.22))`,
            }}
          />
          {/* Mirror frame side accent (left) */}
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0, left: 0, width: 3,
              background: `linear-gradient(180deg,
                rgba(200,184,152,0.50) 0%, rgba(200,184,152,0.25) 50%, rgba(200,184,152,0.50) 100%)`,
            }}
          />
        </div>

        {/* SECOND MIRROR — smaller, right side */}
        <div
          style={{
            position: "absolute",
            right: 100, top: 280, width: 290, height: 560,
            borderRadius: 6,
            background: `linear-gradient(148deg,
              rgba(244,240,235,0.88) 0%,
              rgba(255,253,251,0.76) 50%,
              rgba(238,232,225,0.86) 100%)`,
            border: `2px solid rgba(200,184,152,0.30)`,
            overflow: "hidden",
            opacity: 0.80,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0, left: "20%", width: "20%",
              background: `linear-gradient(90deg,
                transparent, rgba(255,255,255,${0.22 * mirrorGlow}), transparent)`,
              transform: "skewX(-6deg)",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg,
                rgba(200,184,152,0.25), rgba(200,184,152,0.60), rgba(200,184,152,0.25))`,
            }}
          />
        </div>

        {/* Styling counter */}
        <div
          style={{
            position: "absolute",
            bottom: 0, left: -60, right: -60, height: 480,
          }}
        >
          {/* Counter top */}
          <div
            style={{
              position: "absolute",
              top: 0, left: 0, right: 0, height: 56,
              background: `linear-gradient(180deg, #D8D2C8 0%, #C8C2B6 100%)`,
              borderTop: `2px solid rgba(200,184,152,0.40)`,
            }}
          >
            {/* Tool shapes on counter */}
            {[
              { left: 110, w: 54, h: 22, rot: -12 },
              { left: 230, w: 11, h: 52, rot: -20 },
              { left: 560, w: 44, h: 20, rot:   7 },
            ].map((t, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: t.left, bottom: 5, width: t.w, height: t.h,
                  borderRadius: Math.min(t.w, t.h) / 2,
                  background: `linear-gradient(135deg, #2A1E18, #1A1614)`,
                  transform: `rotate(${t.rot}deg)`,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
                }}
              />
            ))}
          </div>
          {/* Cabinet body */}
          <div
            style={{
              position: "absolute",
              top: 56, left: 0, right: 0, bottom: 0,
              background: `linear-gradient(180deg, #CCC6BC 0%, #B8B2A6 100%)`,
            }}
          >
            {[65, 265, 465, 665, 865].map((x, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: x, top: 18, width: 160, bottom: 20,
                  border: "1px solid rgba(0,0,0,0.07)",
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        </div>

        {/* Floor line */}
        <div
          style={{
            position: "absolute",
            bottom: 480, left: 0, right: 0, height: 1,
            background: "rgba(200,184,152,0.20)",
          }}
        />
      </div>

      {/* === FG LAYER — text === */}
      <div
        style={{
          position: "absolute",
          left: 80, right: 80, bottom: 160,
          transform: `translateX(${camX * 1.0}px)`,
        }}
      >
        <div
          style={{
            fontSize: 12, fontWeight: 700, color: C.mauve, fontFamily: SANS,
            letterSpacing: "0.20em", textTransform: "uppercase" as const,
            marginBottom: 18,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          Premium Studio
        </div>

        {["Where your best", "self begins."].map((line, i) => {
          const t = i === 0 ? headline : sub;
          return (
            <div
              key={i}
              style={{
                fontSize: 60, fontWeight: 800, fontFamily: SANS,
                color: i === 0 ? C.ink : C.mauve,
                letterSpacing: -2.5, lineHeight: 0.92,
                marginBottom: i === 0 ? 4 : 20,
                opacity: t.opacity,
                transform: `translateY(${t.translateY}px)`,
                filter: `blur(${t.blur}px)`,
              }}
            >
              {line}
            </div>
          );
        })}

        <div
          style={{
            fontSize: 18, fontWeight: 400, fontFamily: SANS, color: C.body,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Expert stylists. Elevated results.
        </div>
      </div>

      {/* Diagonal cut-edge highlight (visible during wipe entrance only) */}
      {topX < 100 && (
        <div
          style={{
            position: "absolute",
            top: 0, bottom: 0,
            left: `calc(${topX}% - 1px)`,
            width: 2,
            background: `linear-gradient(to bottom,
              transparent 5%, rgba(200,184,152,0.60) 15%,
              rgba(200,184,152,0.60) 85%, transparent 95%)`,
            opacity: 1 - wipeT,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — TOOLS  (frames 225–360, 4.5s)
//
// ENTRANCE: Circular mirror reveal — iris expands from center.
// Hero: Large scissors cutout (flat design) slides in from above, slight
//       rotation from -22° → -5°, settles with natural ease.
// Support: Comb cutout enters from the right, smaller and offset.
// Two accent lines follow the scissors' angle.
// Text enters after scissors settle.
//
// EXIT: Comb-line wipe — 5 cream-coloured vertical panels sweep UPWARD
//       with progressive stagger, revealing Scene 4's dark bg beneath.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneTools: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(135, 14);
  const bgT     = easeOut3(clamp(frame / 18, 0, 1));

  // ENTRANCE: circle iris from center
  const irisT    = easeOut5(clamp(frame / 26, 0, 1));
  const irisR    = irisT * 180;
  const irisClip = `circle(${irisR}% at 50% 50%)`;

  // Scissors entrance: slides down from above + rotation settle
  const scissorT   = easeOut4(clamp(frame / 38, 0, 1));
  const scissorY   = (1 - scissorT) * -580;
  const scissorRot = interpolate(frame, [0, 38, 55], [-22, -5.5, -5.5], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const floatY     = useHeroFloat(5, 92);

  // Comb entrance: slides from right
  const combT    = easeOut4(clamp((frame - 18) / 30, 0, 1));
  const combX    = (1 - combT) * 280;
  const combRot  = interpolate(frame, [18, 50], [14, 6], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Accent lines (follow scissors angle)
  const lineT = easeOut3(clamp((frame - 30) / 22, 0, 1));

  // Text
  const eyebrow  = useCinematicTextReveal(48, 12, 5);
  const headline = useCinematicTextReveal(58, 20, 9);
  const sub      = useCinematicTextReveal(72, 14, 6);

  // COMB-WIPE EXIT: 5 cream panels slide upward, staggered left→right
  // Starts at frame 108 (leaves 27 frames before scene ends at 135)
  const COMB_PANELS = 5;
  const combWipeStart = 108;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        clipPath: irisClip,
        WebkitClipPath: irisClip,
      }}
    >
      {/* Warm bg */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, ${C.bgLight} 0%, ${C.bg} 55%, #EDE8E3 100%)`,
        }}
      />

      {/* Subtle warm glow behind scissors */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 700px 600px at 50% 44%,
            rgba(160,120,144,${0.055 * bgT}) 0%, transparent 60%)`,
        }}
      />

      {/* Accent lines — diagonal, follow scissors angle */}
      {[
        { x: 100, y: 680, len: 520, rot: -6 },
        { x: 60,  y: 730, len: 380, rot: -6 },
      ].map((l, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: l.x,
            top: l.y,
            width: l.len * lineT,
            height: 1.5,
            background: `linear-gradient(90deg,
              transparent,
              rgba(160,120,144,${0.35 - i * 0.10}),
              transparent)`,
            transform: `rotate(${l.rot}deg)`,
            transformOrigin: "left center",
          }}
        />
      ))}

      {/* Comb secondary element */}
      <div
        style={{
          position: "absolute",
          right: 80, top: 680,
          opacity: combT,
          transform: `translateX(${combX}px) rotate(${combRot}deg)`,
          filter: `drop-shadow(0 6px 18px rgba(0,0,0,0.16))`,
        }}
      >
        <CombCutout scale={1.2} />
      </div>

      {/* Scissors hero — large centred cutout */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "36%",
          transform: `translateX(-50%) translateY(calc(-50% + ${scissorY + floatY}px)) rotate(${scissorRot}deg)`,
          transformOrigin: "center center",
          opacity: scissorT,
          filter: `drop-shadow(0 24px 50px rgba(26,22,20,0.22))`,
        }}
      >
        <ScissorsCutout scale={1.25} />
      </div>

      {/* Text — lower third */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 200 }}>
        <div
          style={{
            fontSize: 12, fontWeight: 700, color: C.mauve, fontFamily: SANS,
            letterSpacing: "0.20em", textTransform: "uppercase" as const,
            marginBottom: 16,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          The Tools of the Trade
        </div>

        {["Precision.", "Every cut."].map((line, i) => {
          const t = i === 0 ? headline : sub;
          return (
            <div
              key={i}
              style={{
                fontSize: 64, fontWeight: 900, fontFamily: SANS,
                color: i === 0 ? C.ink : C.mauve,
                letterSpacing: -3, lineHeight: 0.90,
                marginBottom: i === 0 ? 6 : 0,
                opacity: t.opacity,
                transform: `translateY(${t.translateY}px)`,
                filter: `blur(${t.blur}px)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* COMB-LINE WIPE EXIT — 5 cream panels slide upward with stagger */}
      {[0, 1, 2, 3, 4].map((i) => {
        const delay = combWipeStart + i * 5;
        const t     = easeInOut3(clamp((frame - delay) / 22, 0, 1));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${i * 20}%`,
              top: 0, bottom: 0, width: "20%",
              background: C.bg,
              transform: `translateY(${t * -110}%)`,
              pointerEvents: "none",
            }}
          />
        );
      })}

      {/* Thin divider lines between comb panels (visible during wipe) */}
      {frame > combWipeStart && [1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${i * 20}%`,
            top: 0, bottom: 0, width: 1,
            background: "rgba(200,184,152,0.25)",
            pointerEvents: "none",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — TRANSFORMATION  (frames 360–450, 3s)
//
// ENTRANCE: The comb-panels have fully swept away (they're Scene 3 elements).
// Scene 4 starts already revealed — dark warm bg instantly establishes contrast.
//
// Motion design:
//   • Thin ring arc draws itself as a framing device (centered upper area)
//   • "TRANSFORMED." slams in with blur-resolve
//   • Three quiet metric rows enter with stagger
//   • Very still, very calm — this is the visual payoff
// ═══════════════════════════════════════════════════════════════════════════════
const SceneTransformation: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 14);
  const glow    = useBreathingGlow(100, 0.48, 0.96);
  const bgT     = easeOut3(clamp(frame / 16, 0, 1));
  const ringT   = easeOut4(clamp(frame / 40, 0, 1));
  const ringDashOff = RING4_C * (1 - ringT);
  const floatRing = useHeroFloat(4, 88);

  const hero  = useCinematicTextReveal(24, 26, 12);
  const sub1  = useCinematicTextReveal(40, 16, 7);
  const sub2  = useCinematicTextReveal(50, 16, 7);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Dark warm background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(155deg, #1E1816 0%, ${C.dark} 100%)`,
          opacity: bgT,
        }}
      />

      {/* Mauve ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "50%", top: "40%",
          width: 900, height: 900,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(160,120,144,${0.09 * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Ring arc — draws itself, then floats */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${floatRing}px)`,
        }}
        viewBox="0 0 1080 1920"
        width={1080}
        height={1920}
      >
        {/* Outer glow ring */}
        <circle
          cx={540}
          cy={760}
          r={RING4_R + 10}
          fill="none"
          stroke={`rgba(160,120,144,${0.10 * glow})`}
          strokeWidth={20}
          strokeDasharray={RING4_C}
          strokeDashoffset={ringDashOff * 0.88}
        />
        {/* Main ring */}
        <circle
          cx={540}
          cy={760}
          r={RING4_R}
          fill="none"
          stroke={C.champagne}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeDasharray={RING4_C}
          strokeDashoffset={ringDashOff}
          opacity={0.48}
        />
        {/* Mauve inner ring — slightly smaller */}
        <circle
          cx={540}
          cy={760}
          r={RING4_R - 10}
          fill="none"
          stroke={C.mauve}
          strokeWidth={0.8}
          strokeLinecap="round"
          strokeDasharray={RING4_C}
          strokeDashoffset={ringDashOff * 1.12}
          opacity={0.25}
        />
      </svg>

      {/* "TRANSFORMED." — centred, massive */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0,
          top: "44%", transform: "translateY(-50%)",
          textAlign: "center",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            fontSize: 104, fontWeight: 900, fontFamily: SANS,
            color: C.cream, letterSpacing: -5.5, lineHeight: 0.84,
            opacity: hero.opacity,
            transform: `translateY(${hero.translateY}px)`,
            filter: `blur(${hero.blur}px)`,
            marginBottom: 32,
          }}
        >
          TRANS
          <br />
          FORMED.
        </div>

        {/* Mauve accent rule */}
        <div
          style={{
            width: 100, height: 2,
            background: `linear-gradient(90deg, transparent, ${C.mauve}, transparent)`,
            margin: "0 auto 30px",
            borderRadius: 1,
            opacity: sub1.opacity,
          }}
        />

        <div
          style={{
            fontSize: 26, fontWeight: 300, fontFamily: SANS,
            color: C.bodyLight, letterSpacing: "0.04em",
            lineHeight: 1.65, marginBottom: 8,
            opacity: sub1.opacity,
            transform: `translateY(${sub1.translateY}px)`,
            filter: `blur(${sub1.blur}px)`,
          }}
        >
          This is what Seri delivers.
        </div>

        <div
          style={{
            fontSize: 20, fontWeight: 700, fontFamily: SANS,
            color: C.mauve, letterSpacing: -0.3,
            opacity: sub2.opacity,
            transform: `translateY(${sub2.translateY}px)`,
            filter: `blur(${sub2.blur}px)`,
          }}
        >
          Every appointment. Every time.
        </div>
      </div>

      {/* Proof badges — lower third */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0, bottom: 120,
          display: "flex",
          justifyContent: "center",
          gap: 40,
          opacity: sub2.opacity,
          transform: `translateY(${sub2.translateY}px)`,
        }}
      >
        {[
          { v: "4.9★", l: "rating" },
          { v: "850+", l: "clients" },
          { v: "7 yrs", l: "expertise" },
        ].map((m, i) => (
          <div key={i} style={{ textAlign: "center" as const }}>
            <div
              style={{
                fontSize: 30, fontWeight: 900, fontFamily: SANS,
                color: C.champagne, letterSpacing: -1.2, lineHeight: 1,
              }}
            >
              {m.v}
            </div>
            <div
              style={{
                fontSize: 12, fontWeight: 600, color: "rgba(248,245,242,0.35)",
                fontFamily: SANS, letterSpacing: "0.08em",
                textTransform: "uppercase" as const, marginTop: 4,
              }}
            >
              {m.l}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA  (frames 450–540, 3s)
//
// The gloss streak has just passed. Dark warm background remains.
// "SERI" brand mark appears with slow upward drift + glow settle.
// Mauve rule wipes in.
// "Transform Your Look" — clean medium-weight.
// CTA button scales in after the headline settles.
// Subtle ring glow pulses.
// URL closes the spot.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCTA: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);
  const glow    = useBreathingGlow(82, 0.52, 1.0);

  const brand = useCinematicTextReveal(8,  22, 10);
  const rule  = easeInOut3(rawProgress(frame, 24, 20)) * 100;
  const line1 = useCinematicTextReveal(26, 18,  8);
  const line2 = useCinematicTextReveal(36, 16,  7);
  const btn   = easeOut4(clamp((frame - 44) / 18, 0, 1));
  const url   = useCinematicTextReveal(58, 10,  4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Dark warm base */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, #1E1816 0%, ${C.dark} 100%)`,
        }}
      />

      {/* Mauve breathing glow */}
      <div
        style={{
          position: "absolute",
          left: "50%", top: "42%",
          width: 1000, height: 1000,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(160,120,144,${0.08 * glow}) 0%, transparent 62%)`,
        }}
      />

      {/* Decorative ring glow — large, behind logo */}
      <svg
        style={{ position: "absolute", inset: 0, opacity: 0.18 * glow }}
        viewBox="0 0 1080 1920"
        width={1080}
        height={1920}
      >
        <circle
          cx={540}
          cy={820}
          r={360}
          fill="none"
          stroke={C.mauve}
          strokeWidth={1.2}
        />
        <circle
          cx={540}
          cy={820}
          r={380}
          fill="none"
          stroke={C.champagne}
          strokeWidth={0.7}
          opacity={0.5}
        />
      </svg>

      {/* Content */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0,
          top: "50%", transform: "translateY(-50%)",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Brand mark */}
        <div
          style={{
            fontSize: 14, fontWeight: 700, color: "rgba(160,120,144,0.38)",
            fontFamily: SANS, letterSpacing: "0.22em",
            textTransform: "uppercase" as const, marginBottom: 52,
            opacity: brand.opacity,
          }}
        >
          SERI · HAIR & BEAUTY
        </div>

        {/* "SERI" large */}
        <div
          style={{
            fontSize: 108, fontWeight: 900, fontFamily: SANS,
            color: C.white, letterSpacing: -6, lineHeight: 0.82,
            marginBottom: 10,
            opacity: brand.opacity,
            transform: `translateY(${brand.translateY}px)`,
            filter: `blur(${brand.blur}px)`,
          }}
        >
          SERI
        </div>

        {/* Light sweep on brand name */}
        <div
          style={{
            position: "absolute",
            left: 0, right: 0,
            top: "13%", height: "28%",
            background: `linear-gradient(90deg,
              transparent, rgba(255,255,255,${0.03 * glow}), transparent)`,
            pointerEvents: "none",
          }}
        />

        {/* Mauve rule wipe */}
        <div
          style={{
            width: `${rule * 0.70}%`,
            maxWidth: 200,
            height: 2,
            background: `linear-gradient(90deg, ${C.mauve}, ${C.champagne})`,
            borderRadius: 1,
            margin: "18px auto 28px",
            opacity: brand.opacity,
          }}
        />

        {/* "Transform Your Look" */}
        <div
          style={{
            fontSize: 30, fontWeight: 400, fontFamily: SANS,
            color: C.bodyLight, letterSpacing: "0.03em",
            marginBottom: 8,
            opacity: line1.opacity,
            transform: `translateY(${line1.translateY}px)`,
            filter: `blur(${line1.blur}px)`,
          }}
        >
          Transform Your Look
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: 13, fontWeight: 600, fontFamily: SANS,
            color: "rgba(160,120,144,0.44)",
            letterSpacing: "0.14em", textTransform: "uppercase" as const,
            marginBottom: 48,
            opacity: line2.opacity,
            transform: `translateY(${line2.translateY}px)`,
          }}
        >
          Hair Studio · Est. 2018
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${btn})`,
            transformOrigin: "center center",
            display: "inline-block",
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: C.mauve,
              borderRadius: 18,
              padding: "22px 52px",
              boxShadow: `0 16px 50px rgba(160,120,144,0.30)`,
            }}
          >
            <span
              style={{
                fontSize: 20, fontWeight: 800, fontFamily: SANS,
                color: C.white, letterSpacing: -0.4,
              }}
            >
              Book Your Appointment Today
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 14, fontFamily: MONO,
            color: "rgba(160,120,144,0.28)",
            letterSpacing: "0.04em",
            opacity: url.opacity,
          }}
        >
          seri.studio
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────
export const SeriAd: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = 540;

  // Subtle global camera — slow dolly-in
  const zoom = 1.0 + (frame / TOTAL) * 0.048;
  const roll = interpolate(
    frame,
    [0, 90, 200, 370, TOTAL],
    [-0.60, -0.12, 0.38, 0.65, 0.20],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const panX = interpolate(frame, [0, TOTAL], [9, -7], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, TOTAL], [4, -3], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
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
        {/* ── Main scenes ── */}
        <Sequence from={0}   durationInFrames={90} ><SceneOpening       /></Sequence>
        <Sequence from={90}  durationInFrames={135}><SceneSalon         /></Sequence>
        <Sequence from={225} durationInFrames={135}><SceneTools         /></Sequence>
        <Sequence from={360} durationInFrames={90} ><SceneTransformation /></Sequence>
        <Sequence from={450} durationInFrames={90} ><SceneCTA           /></Sequence>

        {/* ── Transition overlays — render on top of scene stack ── */}
        {/* Scissor cut lines: bridge S1→S2 boundary */}
        <Sequence from={62} durationInFrames={44}><ScissorCutOverlay /></Sequence>
        {/* Gloss streak: bridge S4→S5 boundary */}
        <Sequence from={434} durationInFrames={40}><GlossStreakOverlay /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
