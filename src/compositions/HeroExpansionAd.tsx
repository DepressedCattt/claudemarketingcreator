/**
 * HeroExpansionAd — "Hero Component Expansion Transition" (v2)
 *
 * V2 changes:
 *  ◆ Dark premium background — deep indigo/violet gradient with color pockets
 *  ◆ Larger cards (290×350) that command more of the frame
 *  ◆ Continuous 3D rotation on all settled cards — they live in space, not on a plane
 *  ◆ Hero card has slow 3D sway before the burst
 *  ◆ Dynamic drop-shadow shifts with rotation angle — reinforces depth
 *  ◆ Brighter burst ring with glow — reads on dark background
 *  ◆ Updated headline + brand for dark theme
 *
 * Format:  1:1 square (1080 × 1080)
 * Duration: 300 frames @ 30fps = 10 seconds
 */

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import {
  clamp,
  easeOut3,
  easeOut4,
  easeOut5,
  easeInOut3,
  PREMIUM_SPRING,
  useCinematicTextReveal,
  usePremiumFadeOut,
} from "../utils/premiumMotion";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const W = 1080;
const H = 1080;

// ─── UI Card Component ────────────────────────────────────────────────────────

interface UICardProps {
  label:   string;
  value:   string;
  change:  string;
  accent:  string;
  curve:   string;
  width?:  number;
  height?: number;
}

const UICard: React.FC<UICardProps> = ({
  label, value, change, accent, curve,
  width = 290, height = 350,
}) => {
  const svgW = width - 44;
  return (
    <div
      style={{
        width,
        height,
        background: "#FFFFFF",
        borderRadius: CARD_RADIUS,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontFamily: SANS,
        // Subtle inset highlight — makes face feel lit from above
        boxShadow: "inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.04)",
      }}
    >
      {/* Accent top bar */}
      <div style={{ height: 4, background: accent, flexShrink: 0 }} />

      {/* Body */}
      <div
        style={{
          padding: "22px 24px 24px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Label row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            style={{
              fontSize: 11,
              color: "#94A3B8",
              letterSpacing: "0.09em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {label}
          </div>
          {/* Accent dot */}
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent, opacity: 0.7 }} />
        </div>

        {/* Value + change */}
        <div>
          <div
            style={{
              fontSize: 46,
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1,
              marginBottom: 8,
              letterSpacing: "-0.03em",
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontSize: 13,
              color: accent,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: `${accent}14`,
              borderRadius: 6,
              padding: "3px 8px",
              width: "fit-content",
            }}
          >
            <span>↑</span>
            <span>{change}</span>
          </div>
        </div>

        {/* Mini sparkline */}
        <svg
          width={svgW}
          height={44}
          viewBox={`0 0 ${svgW} 44`}
        >
          <defs>
            <linearGradient
              id={`g${label.replace(/\s/g, "")}`}
              x1="0" y1="0" x2="0" y2="1"
            >
              <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
              <stop offset="100%" stopColor={accent} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <path
            d={curve}
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <path
            d={`${curve} L${svgW},44 L0,44 Z`}
            fill={`url(#g${label.replace(/\s/g, "")})`}
          />
        </svg>
      </div>
    </div>
  );
};

// ─── Card configuration ───────────────────────────────────────────────────────

const CARD_W = 290;
const CARD_H = 350;
const PAD    = 40;
const T_TOP  = 74;
const T_BOT  = H - PAD - CARD_H;       // 690
const T_LEFT = PAD;                      // 40
const T_RIGHT = W - PAD - CARD_W;       // 750

const HERO_LEFT = (W - CARD_W) / 2;     // 395
const HERO_TOP  = (H - CARD_H) / 2;     // 365

interface CardConfig {
  left:        number;
  top:         number;
  restRotZ:    number;
  restRotX:    number;
  restRotY:    number;
  // Directional spin rate (°/frame) — positive or negative, never reverses
  contRotYAmp: number;
  contRotXAmp: number;
  // Outward drift velocity (px/frame) — card slowly floats away from center
  driftVX:     number;
  driftVY:     number;
  label:       string;
  value:       string;
  change:      string;
  accent:      string;
  curve:       string;
  delay:       number;
  floatPhase:  number;
}

const svgW = CARD_W - 44;  // 246

const CARD_CONFIGS: CardConfig[] = [
  {
    left: T_LEFT, top: T_TOP,
    restRotZ: -6, restRotX:  4, restRotY: -8,
    // Continuous directional spin (°/frame) — never reverses
    contRotYAmp: -0.065, contRotXAmp:  0.038,
    label: "Active Users",  value: "12,847", change: "+18%", accent: "#6366F1",
    curve: `M0,34 C30,30 55,25 85,20 C115,15 145,10 ${svgW},4`,
    delay: 0, floatPhase: 0,
    // Outward diagonal drift (px/frame) — each card drifts away from center
    driftVX: -0.38, driftVY: -0.32,
  },
  {
    left: T_RIGHT, top: T_TOP,
    restRotZ:  7, restRotX:  3, restRotY:  9,
    contRotYAmp:  0.058, contRotXAmp:  0.042,
    label: "Revenue MRR",   value: "$84.2K", change: "+24%", accent: "#10B981",
    curve: `M0,36 C40,30 65,24 95,18 C125,12 160,7 ${svgW},3`,
    delay: 5, floatPhase: Math.PI * 0.5,
    driftVX:  0.38, driftVY: -0.32,
  },
  {
    left: T_LEFT, top: T_BOT,
    restRotZ:  5, restRotX: -4, restRotY: -7,
    contRotYAmp:  0.060, contRotXAmp: -0.035,
    label: "Conversion",    value: "6.8%",   change: "+12%", accent: "#A855F7",
    curve: `M0,30 C50,26 80,22 110,18 C140,14 170,10 ${svgW},5`,
    delay: 9, floatPhase: Math.PI,
    driftVX: -0.38, driftVY:  0.32,
  },
  {
    left: T_RIGHT, top: T_BOT,
    restRotZ: -8, restRotX: -3, restRotY:  8,
    contRotYAmp: -0.055, contRotXAmp: -0.040,
    label: "Retention",     value: "94.2%",  change: "+3%",  accent: "#0EA5E9",
    curve: `M0,38 C35,32 60,26 90,20 C120,14 160,9 ${svgW},5`,
    delay: 13, floatPhase: Math.PI * 1.5,
    driftVX:  0.38, driftVY:  0.32,
  },
];

// ─── Prism constants ─────────────────────────────────────────────────────────
//
// The "3D prism" illusion is achieved without CSS preserve-3d (which breaks
// when a parent uses filter:). Instead we use:
//   1. A colored padding wrapper ("rim") that acts as the physical card edge.
//   2. A hard box-shadow (0px blur) extending in the direction the current
//      rotation would expose the card's physical side, computed from sin(angle).
//      When rotateY > 0: right face is receding → left edge visible → shadow extends left.
//      When rotateY < 0: left face is receding → right edge visible → shadow extends right.
//
// prismEdgeShadow() maps the live rotation angles to the correct shadow vector.

const CARD_RIM    = 7;   // px — visible colored rim around the card face
const DEPTH_MULT  = 22;  // px per unit sin — shadow reach for "thickness" illusion
const CARD_RADIUS = 20;  // matches UICard borderRadius

function prismEdgeShadow(rotYDeg: number, rotXDeg: number, accent: string): string {
  const sx = -Math.sin(rotYDeg * Math.PI / 180) * DEPTH_MULT;
  const sy = -Math.sin(rotXDeg * Math.PI / 180) * DEPTH_MULT;
  return [
    `${sx.toFixed(1)}px ${sy.toFixed(1)}px 0px 0px ${accent}CC`,        // primary edge
    `${(sx * 1.8).toFixed(1)}px ${(sy * 1.8).toFixed(1)}px 3px -1px ${accent}44`,  // falloff
  ].join(", ");
}

// ─── Timing constants ─────────────────────────────────────────────────────────
const HERO_ENTER_DUR     = 34;
const HERO_BLUR_START    = 20;
const HERO_BLUR_DUR      = 32;
const CURSOR_START       = 44;
const CURSOR_DUR         = 16;
const CURSOR_CLICK_START = 62;
const CURSOR_CLICK_DUR   = 10;
const BURST_START        = 68;
const BURST_PEAK         = 82;
const BURST_FADE_START   = 79;
const BURST_END          = 97;
const CLONE_BASE_START   = 76;
const CLONE_FLY_DUR      = 55;
const CLONE_BLUR_DUR     = 40;
const HEADLINE_START     = 178;
const TOTAL_FRAMES       = 300;

// ─── Composition ──────────────────────────────────────────────────────────────

export const HeroExpansionAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const prog = (start: number, dur: number) =>
    clamp((frame - start) / dur, 0, 1);

  // ── Phase 1: Hero card entrance ──────────────────────────────────────────
  const heroEnterT       = easeOut4(prog(0, HERO_ENTER_DUR));
  const heroEntryY       = (1 - heroEnterT) * 36;
  const heroEntryOpacity = clamp(heroEnterT / 0.38, 0, 1);

  // Hero scale grows slowly from the very first frame — never static
  // 0.88 entry → grows ~8% over its visible lifetime
  const heroScale = 0.88 + heroEnterT * 0.08 + frame * 0.00085;

  const heroBlurResolveT = easeOut4(prog(HERO_BLUR_START, HERO_BLUR_DUR));
  const heroBlurSettle   = (1 - heroBlurResolveT) * 16;

  // Hero continuous rotation from frame 0 — directional, not oscillating
  // Y drifts slowly (makes the card feel like it's revolving in space)
  // X has a gentle slow oscillation (barely perceptible tilt variation)
  const heroRotY_base = -10 + frame * 0.09;
  const heroRotX_base =   4 + Math.sin(frame * 0.022) * 1.8;

  // ── Phase 3: Burst sweep ─────────────────────────────────────────────────
  const burstSweepT     = easeOut5(prog(BURST_START, BURST_PEAK - BURST_START));
  const heroRotYBurst   = heroRotY_base + burstSweepT * (90 - heroRotY_base);
  const heroCurrentRotY = frame >= BURST_START ? heroRotYBurst : heroRotY_base;

  const heroBurstBlurT  = easeInOut3(prog(BURST_START, BURST_PEAK - BURST_START));
  const heroBurstBlur   = frame >= BURST_START ? heroBurstBlurT * 32 : 0;
  const heroCurrentBlur = frame >= BURST_START ? heroBurstBlur : heroBlurSettle;

  const heroFadeT    = easeOut4(prog(BURST_FADE_START, BURST_END - BURST_FADE_START));
  const heroOpacity  = frame >= BURST_FADE_START
    ? Math.max(0, heroEntryOpacity * (1 - heroFadeT))
    : heroEntryOpacity;
  const heroVisible  = heroOpacity > 0.01;

  // Slight horizontal stretch during sweep
  const heroScaleX = frame >= BURST_START
    ? 1 + Math.sin(burstSweepT * Math.PI) * 0.07
    : 1;

  // ── Phase 2: Cursor interaction cue ─────────────────────────────────────
  const cursorT          = easeOut3(prog(CURSOR_START, CURSOR_DUR));
  const cursorX          = W / 2 + 28 + (1 - cursorT) * 155;
  const cursorY          = H / 2 - 40 + (1 - cursorT) * 32;
  const cursorVisible    = frame >= CURSOR_START && frame < BURST_START + 6;
  const clickT           = easeInOut3(prog(CURSOR_CLICK_START, CURSOR_CLICK_DUR));
  const cursorClickScale = frame >= CURSOR_CLICK_START
    ? 1 - Math.sin(clickT * Math.PI) * 0.35
    : 1;
  const cursorOpacity    = frame >= CURSOR_START && frame < BURST_START
    ? clamp(easeOut3(prog(CURSOR_START, 10)), 0, 1)
    : Math.max(0, 1 - prog(BURST_START, 8));

  // ── Burst rings ──────────────────────────────────────────────────────────
  const burstRingT       = easeOut5(prog(BURST_START, 42));
  const burstRingScale   = 0.35 + burstRingT * 2.2;
  const burstRingOpacity = interpolate(
    frame,
    [BURST_START, BURST_START + 5, BURST_START + 44],
    [0, 0.75, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Phase 4 + 5: Clone cards ─────────────────────────────────────────────
  //
  // Key design decision: motion starts from the MOMENT of birth, not after landing.
  // There is zero settle-then-animate delay. Cards are born spinning and drifting.
  //
  // Three simultaneous motions per card:
  //  1. Spring fly-in: born at hero center, springs to corner (settles over ~55 frames)
  //  2. Directional spin: rotY/rotX increase linearly — one direction, never reverses
  //  3. Outward drift: slow XY translation away from center, continues indefinitely

  const cloneStates = CARD_CONFIGS.map((card) => {
    const start    = CLONE_BASE_START + card.delay;
    const cardAge  = Math.max(0, frame - start);  // age since this card was born

    // 1. Spring fly-in from hero center to corner
    const flySpring = spring({ frame: cardAge, fps, config: PREMIUM_SPRING.settle });
    const dx = HERO_LEFT - card.left;
    const dy = HERO_TOP  - card.top;

    // 2. Outward drift (starts immediately, slow and unidirectional)
    //    Multiplied by flySpring so drift only accumulates once card is near its position
    const drift = flySpring;  // 0→1, ramps up as spring settles
    const driftX = cardAge * card.driftVX * drift;
    const driftY = cardAge * card.driftVY * drift;

    const tx = dx * (1 - flySpring) + driftX;
    const ty = dy * (1 - flySpring) + driftY;

    // Blur resolves — born blurry from the burst cloud
    const blurT = easeOut4(prog(start, CLONE_BLUR_DUR));
    const blur  = Math.max(0, (1 - blurT) * 28);

    const opacity = frame < start ? 0 : clamp(easeOut3(prog(start, 10)) / 0.55, 0, 1);

    // 3. Directional rotation — starts from rest angle and continuously drifts
    //    cardAge * spinRate ensures the card is already moving at frame 1
    //    No contBlend — no waiting, no settle period, no oscillation
    const totalRotZ = card.restRotZ;
    const totalRotX = card.restRotX + cardAge * card.contRotXAmp;
    const totalRotY = card.restRotY + cardAge * card.contRotYAmp;

    // Dynamic drop-shadow — shifts with rotation so depth reads convincingly
    const shadowX = -totalRotY * 0.5;
    const shadowY =  totalRotX * 0.6 + 10;

    return {
      tx, ty, blur, opacity,
      rotZ: totalRotZ, rotX: totalRotX, rotY: totalRotY,
      shadowX, shadowY,
    };
  });

  // ── Phase 5: Headline ────────────────────────────────────────────────────
  const headline1 = useCinematicTextReveal(HEADLINE_START,      18, 8);
  const headline2 = useCinematicTextReveal(HEADLINE_START + 18, 18, 8);
  const tagline   = useCinematicTextReveal(HEADLINE_START + 40, 14, 5);

  const sceneFade = usePremiumFadeOut(TOTAL_FRAMES, 22);

  // ── Ambient bg glow intensity — peaks at burst ───────────────────────────
  const bgGlowIntensity = interpolate(
    frame,
    [BURST_START - 8, BURST_PEAK, BURST_END + 25, HEADLINE_START],
    [0.5, 1.0, 0.65, 0.65],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Camera motion — the entire scene is "photographed", not statically rendered ─
  //
  // Three simultaneous camera motions applied to the whole scene:
  //   1. Slow dolly/push-in  (scale 1.0 → 1.065)  — camera moving toward subject
  //   2. Gentle camera roll  (rotateZ ±0.9°)       — camera operator's slight tilt drift
  //   3. Subtle pan          (translateX/Y)         — camera drifting sideways/vertically
  //
  // Combined these make the scene feel physically captured rather than computer-rendered.
  // Values are calibrated to be felt subconsciously, not seen consciously.
  // Linear interpolation is intentional — easing on camera movement looks like a cheap
  // Ken Burns effect; linear reads as a controlled professional dolly.

  const cameraProg  = frame / TOTAL_FRAMES;
  const cameraZoom  = 1.0 + cameraProg * 0.065;   // +6.5% total push-in over 10s

  // Roll: starts slightly tilted one way, drifts through the other way
  // Keyframed so it passes near 0° while headline is on screen (text stays readable)
  const cameraRoll  = interpolate(
    frame,
    [0,    70,    170,   260,   TOTAL_FRAMES],
    [-0.9, -0.25,  0.55,  0.80,  0.35],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Pan: slow drift — crosses center so elements feel tracked, not static
  const cameraPanX  = interpolate(frame, [0, TOTAL_FRAMES], [14, -10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraPanY  = interpolate(frame, [0, TOTAL_FRAMES], [8,   -6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <AbsoluteFill
      style={{
        overflow: "hidden",
        opacity: sceneFade,
        background: "#07060E",
      }}
    >

      {/* ── Camera wrapper — all scene content moves together ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraZoom}) rotateZ(${cameraRoll}deg) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`,
          transformOrigin: "center center",
        }}
      >

      {/* ── Layered background — deep dark with color pockets ── */}
      {/* Upper-right indigo pocket */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 55% 45% at 80% 8%, rgba(99,102,241,${0.28 * bgGlowIntensity}) 0%, transparent 60%)`,
      }} />
      {/* Lower-left violet pocket */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 50% 42% at 18% 92%, rgba(168,85,247,${0.20 * bgGlowIntensity}) 0%, transparent 58%)`,
      }} />
      {/* Center depth gradient */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 90% 80% at 50% 50%, #0E0B1C 0%, #07060E 70%)",
      }} />
      {/* Subtle top-center hot spot */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 40% 25% at 50% 0%, rgba(99,102,241,${0.12 * bgGlowIntensity}) 0%, transparent 70%)`,
      }} />

      {/* ── Brand mark ── */}
      <div style={{
        position: "absolute",
        top: 44,
        left: "50%",
        transform: "translateX(-50%)",
        fontSize: 12,
        fontWeight: 700,
        fontFamily: SANS,
        letterSpacing: "0.28em",
        color: "rgba(255,255,255,0.35)",
        textTransform: "uppercase",
        opacity: clamp(easeOut3(prog(6, 18)), 0, 1),
      }}>
        PRISM
      </div>

      {/* ── Burst: center glow blooms at split moment ── */}
      <div style={{
        position: "absolute",
        left: "50%", top: "50%",
        width: 520, height: 520,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 65%)",
        opacity: interpolate(
          frame,
          [BURST_START - 6, BURST_PEAK, BURST_END + 18, HEADLINE_START - 5, HEADLINE_START + 15],
          [0, 1, 0.28, 0.28, 0.10],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        ),
        pointerEvents: "none",
      }} />

      {/* ── Burst rings — concentric, glowing ── */}
      {[
        { size: 300, scale: burstRingScale,        opacity: burstRingOpacity,        border: "rgba(139,92,246,0.7)",  glow: "rgba(139,92,246,0.4)" },
        { size: 460, scale: burstRingScale * 0.68, opacity: burstRingOpacity * 0.55, border: "rgba(99,102,241,0.45)", glow: "rgba(99,102,241,0.2)" },
      ].map((r, i) => (
        <div key={i} style={{
          position: "absolute",
          left: "50%", top: "50%",
          width: r.size, height: r.size,
          transform: `translate(-50%, -50%) scale(${r.scale})`,
          borderRadius: "50%",
          border: `1.5px solid ${r.border}`,
          boxShadow: `0 0 12px 2px ${r.glow}`,
          opacity: r.opacity,
          pointerEvents: "none",
        }} />
      ))}

      {/* ── Hero card ── */}
      {heroVisible && (
        <div style={{
          position: "absolute",
          left: HERO_LEFT,
          top: HERO_TOP,
          filter: `blur(${heroCurrentBlur}px) drop-shadow(0px 16px 40px rgba(0,0,0,0.7))`,
          opacity: heroOpacity,
          transform: `
            perspective(1100px)
            translateY(${heroEntryY}px)
            scale(${heroScale})
            scaleX(${heroScaleX})
            rotateX(${heroRotX_base}deg)
            rotateY(${heroCurrentRotY}deg)
          `,
          transformOrigin: "center center",
          willChange: "transform, filter, opacity",
        }}>
          {/* Prism rim — colored padding that becomes the visible edge when rotated */}
          <div style={{
            padding: CARD_RIM,
            background: `linear-gradient(150deg, #818CF8 0%, #6366F1 60%, #4F46E5 100%)`,
            borderRadius: CARD_RADIUS + CARD_RIM,
            boxShadow: prismEdgeShadow(heroCurrentRotY, heroRotX_base, "#6366F1"),
          }}>
            <UICard
              label="Active Users"
              value="12,847"
              change="+18%"
              accent="#6366F1"
              curve={`M0,34 C30,30 55,25 85,20 C115,15 145,10 ${svgW},4`}
            />
          </div>
        </div>
      )}

      {/* ── Cursor ── */}
      {cursorVisible && (
        <div style={{
          position: "absolute",
          left: cursorX, top: cursorY,
          transform: `translate(-2px, -2px) scale(${cursorClickScale})`,
          opacity: cursorOpacity,
          pointerEvents: "none",
          zIndex: 50,
        }}>
          <svg width="20" height="26" viewBox="0 0 20 26" fill="none">
            <path
              d="M2 2 L2 20 L7 14.5 L10.5 22.5 L13 21.5 L9.5 13.5 L15.5 13.5 Z"
              fill="rgba(255,255,255,0.95)"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="1.2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* ── Four clone cards ── */}
      {CARD_CONFIGS.map((card, i) => {
        const s = cloneStates[i];
        return (
          <div
            key={card.label}
            style={{
              position: "absolute",
              left: card.left,
              top: card.top,
              // Drop-shadow shifts with rotation — the primary 3D depth cue
              filter: `blur(${s.blur}px) drop-shadow(${s.shadowX}px ${s.shadowY}px 28px rgba(0,0,0,0.65))`,
              opacity: s.opacity,
              transform: `
                perspective(1000px)
                translateX(${s.tx}px)
                translateY(${s.ty}px)
                rotateZ(${s.rotZ}deg)
                rotateX(${s.rotX}deg)
                rotateY(${s.rotY}deg)
              `,
              transformOrigin: "center center",
              willChange: "transform, filter, opacity",
            }}
          >
            {/* Prism rim — live edge shadow tracks the card's current rotation */}
            <div style={{
              padding: CARD_RIM,
              background: `linear-gradient(150deg, ${card.accent}FF 0%, ${card.accent}CC 60%, ${card.accent}AA 100%)`,
              borderRadius: CARD_RADIUS + CARD_RIM,
              boxShadow: prismEdgeShadow(s.rotY, s.rotX, card.accent),
            }}>
              <UICard
                label={card.label}
                value={card.value}
                change={card.change}
                accent={card.accent}
                curve={card.curve}
              />
            </div>
          </div>
        );
      })}

      {/* ── Central headline ── */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: H / 2 - 58,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        pointerEvents: "none",
      }}>
        {/* Line 1 — white */}
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#F1F5F9",
          fontFamily: SANS,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          opacity: headline1.opacity,
          transform: `translateY(${headline1.translateY}px)`,
          filter: `blur(${headline1.blur}px)`,
        }}>
          One platform.
        </div>

        {/* Line 2 — gradient accent */}
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          fontFamily: SANS,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          opacity: headline2.opacity,
          transform: `translateY(${headline2.translateY}px)`,
          filter: `blur(${headline2.blur}px)`,
          background: "linear-gradient(92deg, #818CF8 0%, #A78BFA 50%, #38BDF8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Total clarity.
        </div>

        {/* Tagline */}
        <div style={{
          marginTop: 14,
          fontSize: 14,
          fontWeight: 500,
          color: "rgba(148,163,184,0.85)",
          fontFamily: SANS,
          letterSpacing: "0.05em",
          opacity: tagline.opacity,
          transform: `translateY(${tagline.translateY}px)`,
          filter: `blur(${tagline.blur}px)`,
        }}>
          Every metric. Always visible.
        </div>
      </div>

      </div>{/* end camera wrapper */}

    </AbsoluteFill>
  );
};
