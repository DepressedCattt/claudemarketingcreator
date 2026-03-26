/**
 * AnimlyAd — Animation Training Playground (v2 — full technique showcase)
 *
 * Product: "Animly" — a motion design platform (fictional, meta concept)
 * Angle: Transformation — "Your animations are stuck in 2015."
 * Tagline: "Motion, perfected."
 *
 * Techniques integrated:
 *   1. Procedural dot grid background (S1, S4) — radial wave entrance
 *   2. Typography flood transition (S1→S2) — "2015." scales to consume frame
 *   3. Vortex convergence transition (S2→S3) — cards spiral, burst, shockwaves
 *   4. Metaball morphing brand reveal (S3) — SVG goo filter, blob convergence
 *   5. 3D CSS rotating crystalline icon (S3) — perspective + preserve-3d
 *   6. Animated cursor interaction (S3) — keyframed path, click ripple
 *   7. Tapered draw-on accent lines (S1, S4)
 *   8. Spring physics live demos (S4) — cards demo their own features
 *
 * Scenes:
 *   S1 Hook         (  0-130f  4.3s)  Bold text + dot grid + tapered line
 *   S2 Problem      (115-240f  4.2s)  Bad motion cards + vortex exit
 *   S3 Reveal       (230-380f  5.0s)  Metaball brand + 3D icon + cursor + UI
 *   S4 Features     (370-510f  4.7s)  Live spring demos + dot grid + draw-on
 *   S5 CTA          (500-600f  3.3s)  "Motion, perfected." + CTA
 *
 * Format:   16:9 4K (3840 x 2160)
 * Duration: 600 frames @ 30fps = 20 seconds
 */

import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  staticFile,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

import { SceneFade, BlurWord, WordLine } from "../components/ad-primitives";
import { FilmGrain } from "../components/FilmGrain";
import type { CueEvent } from "../utils/cueTypes";

const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;
const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;

const C = {
  bg: "#08090E",
  surface: "#14151F",
  surfaceHi: "#1C1D2E",
  accent: "#8B5CF6",
  accentGlow: "#8B5CF640",
  cyan: "#06B6D4",
  amber: "#F59E0B",
  rose: "#F43F5E",
  emerald: "#10B981",
  text: "#F1F5F9",
  textMid: "#94A3B8",
  textDim: "#475569",
};

const SPR = {
  text: { stiffness: 200, damping: 24, mass: 0.8 },
  hero: { stiffness: 160, damping: 18, mass: 0.9 },
  ui: { stiffness: 140, damping: 20, mass: 0.85 },
  bounce: { stiffness: 120, damping: 10, mass: 0.7 },
  heavy: { stiffness: 50, damping: 16, mass: 1.3 },
  snap: { stiffness: 280, damping: 22, mass: 0.5 },
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut4 = (t: number) => 1 - Math.pow(1 - t, 4);

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Procedural Dot Grid ─────────────────────────────────────────────────────
const DotGrid: React.FC<{
  progress: number;
  originX?: number;
  originY?: number;
  cols?: number;
  rows?: number;
  dotColor?: string;
  breatheFrame?: number;
}> = ({ progress, originX = CX, originY = CY, cols = 32, rows = 18, dotColor = C.accent, breatheFrame = 0 }) => {
  const cellW = W / cols;
  const cellH = H / rows;
  const maxDist = Math.hypot(W, H) * 0.5;
  const dots: React.ReactNode[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = cellW * (c + 0.5);
      const y = cellH * (r + 0.5);
      const dist = Math.hypot(x - originX, y - originY) / maxDist;
      const dotP = clamp01(progress * 2.5 - dist);
      if (dotP <= 0) continue;
      const breathe = breatheFrame > 0
        ? 0.6 + 0.4 * Math.sin(breatheFrame * 0.03 + c * 0.5 + r * 0.7)
        : 1;
      const radius = (2 + dotP * 2) * breathe;
      const opacity = dotP * 0.25 * breathe;
      dots.push(
        <circle key={`${r}-${c}`} cx={x} cy={y} r={radius} fill={dotColor} opacity={opacity} />,
      );
    }
  }

  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {dots}
    </svg>
  );
};

// ─── Tapered Draw-On Stroke ──────────────────────────────────────────────────
const TaperedLine: React.FC<{
  x1: number; y1: number; x2: number; y2: number;
  progress: number;
  color?: string;
  maxWidth?: number;
}> = ({ x1, y1, x2, y2, progress, color = C.accent, maxWidth = 6 }) => {
  if (progress <= 0) return null;
  const d = `M${x1},${y1} L${x2},${y2}`;
  const len = Math.hypot(x2 - x1, y2 - y1);
  const layers = [
    { width: maxWidth, opacity: 0.15, delay: 0 },
    { width: maxWidth * 0.7, opacity: 0.3, delay: 0.05 },
    { width: maxWidth * 0.4, opacity: 0.6, delay: 0.1 },
    { width: maxWidth * 0.15, opacity: 1, delay: 0.15 },
  ];

  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {layers.map((l, i) => {
        const p = clamp01((progress - l.delay) / (1 - l.delay));
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={l.width}
            strokeLinecap="round"
            opacity={l.opacity * p}
            strokeDasharray={len}
            strokeDashoffset={len * (1 - p)}
          />
        );
      })}
      {progress > 0.5 && (
        <path d={d} fill="none" stroke={color} strokeWidth={maxWidth * 1.5} opacity={0.08}
          strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - progress)}
          filter="url(#taperedGlow)" />
      )}
    </svg>
  );
};

// ─── Shockwave Ring ──────────────────────────────────────────────────────────
const ShockwaveRing: React.FC<{
  enterFrame: number; duration: number; color: string;
  maxRadius?: number; strokeWidth?: number;
}> = ({ enterFrame, duration, color, maxRadius = 1200, strokeWidth = 6 }) => {
  const frame = useCurrentFrame();
  const lf = frame - enterFrame;
  if (lf < 0 || lf > duration) return null;
  const p = clamp01(lf / duration);
  const eased = 1 - Math.pow(1 - p, 2.5);
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <circle cx={CX} cy={CY} r={maxRadius * eased} fill="none"
        stroke={color} strokeWidth={strokeWidth * (1 - p * 0.5)} opacity={(1 - p) * 0.7} />
    </svg>
  );
};

// ─── Animated Cursor ─────────────────────────────────────────────────────────
const AnimCursor: React.FC<{
  enterFrame: number; exitFrame?: number;
  keys: { frame: number; x: number; y: number }[];
  clickFrame?: number;
}> = ({ enterFrame, exitFrame = 999, keys, clickFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < enterFrame || frame > exitFrame + 10) return null;

  let cx = keys[0].x;
  let cy = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = (frame - a.frame) / (b.frame - a.frame);
      const e = t * t * (3 - 2 * t);
      cx = a.x + (b.x - a.x) * e;
      cy = a.y + (b.y - a.y) * e;
      break;
    }
    if (frame > b.frame) { cx = b.x; cy = b.y; }
  }

  const enterP = spring({ frame: Math.max(0, frame - enterFrame), fps, config: { stiffness: 200, damping: 16, mass: 0.6 } });
  const exitP = frame > exitFrame ? clamp01((frame - exitFrame) / 10) : 0;
  const opacity = clamp01(enterP * 2) * (1 - exitP);
  if (opacity <= 0.01) return null;

  let clickR = 0;
  if (clickFrame && frame >= clickFrame && frame < clickFrame + 15) {
    clickR = Math.sin(((frame - clickFrame) / 15) * Math.PI) * 36;
  }

  return (
    <>
      {clickR > 0 && (
        <div style={{
          position: "absolute", left: cx - clickR, top: cy - clickR,
          width: clickR * 2, height: clickR * 2, borderRadius: "50%",
          border: `3px solid ${C.accent}`, opacity: 0.6 * (1 - (frame - clickFrame!) / 15),
          pointerEvents: "none",
        }} />
      )}
      <div style={{
        position: "absolute", left: cx, top: cy, opacity,
        transform: `scale(${enterP * (1 - exitP * 0.4)})`,
        transformOrigin: "top left",
        filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.3))",
        pointerEvents: "none",
      }}>
        <svg width={48} height={56} viewBox="0 0 24 28" fill="none">
          <path d="M5 2L5 22L10 17L15 26L18 24.5L13 16L20 16L5 2Z"
            fill={C.text} stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      </div>
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S1: HOOK — CRT Monitor: "Your animations are outdated."
// Techniques: Retro CRT aesthetic, bad motion demos, typewriter text,
//             glitch transition (RGB split, scanline tear, static noise)
// ═══════════════════════════════════════════════════════════════════════════════

const CRT_SCREEN_BG = "#0a1a0a";
const CRT_PHOSPHOR = "#33ff66";
const CRT_AMBER = "#ffaa33";

// Photo screen overlay — bounding box from flood-fill contour trace
const PHOTO_SCREEN_LEFT = 1329;
const PHOTO_SCREEN_TOP = 497;
const PHOTO_SCREEN_W = 1182;
const PHOTO_SCREEN_H = 929;

// 168-point clip-path traced via flood-fill from screen center.
// Perfectly captures barrel curvature + rounded corners of the CRT.
const CRT_SCREEN_CLIP = `polygon(
  34.3% 0.1%, 11.9% 1.3%, 2.9% 2.5%, 1.9% 3.7%, 1.5% 4.9%,
  1.2% 6.1%, 1.0% 7.4%, 1.0% 8.6%, 1.0% 9.8%, 1.0% 11.0%,
  1.0% 12.2%, 0.7% 13.4%, 0.7% 14.6%, 0.7% 15.8%, 0.7% 17.0%,
  0.7% 18.3%, 0.7% 19.5%, 0.5% 20.7%, 0.5% 21.9%, 0.5% 23.1%,
  0.5% 24.3%, 0.5% 25.5%, 0.5% 26.7%, 0.3% 27.9%, 0.3% 29.2%,
  0.3% 30.4%, 0.3% 31.6%, 0.3% 32.8%, 0.3% 34.0%, 0.3% 35.2%,
  0.3% 36.4%, 0.3% 37.6%, 0.0% 38.8%, 0.0% 40.0%, 0.0% 41.3%,
  0.0% 42.5%, 0.0% 43.7%, 0.0% 44.9%, 0.0% 46.1%, 0.0% 47.3%,
  0.0% 48.5%, 0.0% 49.7%, 0.0% 50.9%, 0.0% 52.2%, 0.0% 53.4%,
  0.0% 54.6%, 0.0% 55.8%, 0.0% 57.0%, 0.0% 58.2%, 0.3% 59.4%,
  0.3% 60.6%, 0.3% 61.8%, 0.3% 63.1%, 0.3% 64.3%, 0.3% 65.5%,
  0.3% 66.7%, 0.5% 67.9%, 0.5% 69.1%, 0.5% 70.3%, 0.5% 71.5%,
  0.5% 72.7%, 0.7% 74.0%, 0.7% 75.2%, 0.7% 76.4%, 0.7% 77.6%,
  1.0% 78.8%, 1.0% 80.0%, 1.0% 81.2%, 1.0% 82.4%, 1.2% 83.6%,
  1.2% 84.9%, 1.2% 86.1%, 1.2% 87.3%, 1.5% 88.5%, 1.5% 89.7%,
  1.5% 90.9%, 1.7% 92.1%, 1.7% 93.3%, 1.9% 94.5%, 2.4% 95.8%,
  3.4% 97.0%, 8.6% 98.2%, 22.6% 99.4%, 34.8% 100.0%, 64.8% 100.0%,
  76.6% 99.4%, 91.2% 98.2%, 96.9% 97.0%, 97.6% 95.8%, 98.1% 94.5%,
  98.3% 93.3%, 98.3% 92.1%, 98.5% 90.9%, 98.5% 89.7%, 98.5% 88.5%,
  98.5% 87.3%, 98.8% 86.1%, 98.8% 84.9%, 98.8% 83.6%, 99.0% 82.4%,
  99.0% 81.2%, 99.0% 80.0%, 99.0% 78.8%, 99.3% 77.6%, 99.3% 76.4%,
  99.3% 75.2%, 99.3% 74.0%, 99.3% 72.7%, 99.5% 71.5%, 99.5% 70.3%,
  99.5% 69.1%, 99.5% 67.9%, 99.5% 66.7%, 99.5% 65.5%, 99.7% 64.3%,
  99.7% 63.1%, 99.7% 61.8%, 99.7% 60.6%, 99.7% 59.4%, 99.7% 58.2%,
  99.7% 57.0%, 99.7% 55.8%, 99.7% 54.6%, 100.0% 53.4%, 100.0% 52.2%,
  100.0% 50.9%, 100.0% 49.7%, 100.0% 48.5%, 100.0% 47.3%, 100.0% 46.1%,
  100.0% 44.9%, 100.0% 43.7%, 99.7% 42.5%, 99.7% 41.3%, 99.7% 40.0%,
  99.7% 38.8%, 99.7% 37.6%, 99.7% 36.4%, 99.7% 35.2%, 99.7% 34.0%,
  99.7% 32.8%, 99.7% 31.6%, 99.7% 30.4%, 99.5% 29.2%, 99.5% 27.9%,
  99.5% 26.7%, 99.5% 25.5%, 99.5% 24.3%, 99.5% 23.1%, 99.3% 21.9%,
  99.3% 20.7%, 99.3% 19.5%, 99.3% 18.3%, 99.3% 17.0%, 99.0% 15.8%,
  99.0% 14.6%, 99.0% 13.4%, 99.0% 12.2%, 99.0% 11.0%, 98.8% 9.8%,
  98.8% 8.6%, 98.8% 7.4%, 98.8% 6.1%, 98.5% 4.9%, 98.3% 3.7%,
  97.1% 2.5%, 87.6% 1.3%, 65.7% 0.1%
)`;

const S1_STATIC_FILTER_ID = "s1-tv-static";

const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screen flicker
  const flicker = 0.96 + 0.04 * Math.sin(frame * 0.8);

  // ── Typewriter ──
  const TYPE_START = 15;
  const fullText = "Your animations are outdated.";
  const charsShown = Math.min(fullText.length, Math.max(0, Math.floor((frame - TYPE_START) * 0.55)));
  const typedText = fullText.slice(0, charsShown);
  const cursorVisible = frame >= TYPE_START && (Math.floor(frame / 15) % 2 === 0 || charsShown < fullText.length);
  const typeFinished = charsShown >= fullText.length;
  const outdatedIdx = fullText.indexOf("outdated");

  const SUB_START = 68;
  const subP = frame >= SUB_START ? clamp01((frame - SUB_START) / 12) : 0;

  // ── CRT Static Death transition ──
  const GLITCH_START = 95;
  const STATIC_START = 107;
  const POWEROFF_START = 119;

  const glitchP = clamp01((frame - GLITCH_START) / 12);
  const staticP = clamp01((frame - STATIC_START) / 12);
  const poweroffP = clamp01((frame - POWEROFF_START) / 9);

  // Power-off: vertical collapse -> horizontal line shrink -> phosphor dot fade
  const collapseY = poweroffP < 0.6
    ? (poweroffP / 0.6) * 49
    : 49;
  const collapseX = poweroffP >= 0.6 && poweroffP < 0.9
    ? ((poweroffP - 0.6) / 0.3) * 49
    : poweroffP >= 0.9 ? 49 : 0;
  const dotFade = poweroffP >= 0.6 ? 1 : 0;

  // Pseudo-random for glitch bars (deterministic from frame)
  const rand = (seed: number) => {
    const x = Math.sin(seed * 127.1 + frame * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };

  // ── Bad animation demos ──
  const bouncePeriod = 40;
  const bounceT = (frame % bouncePeriod) / bouncePeriod;
  const ballY = Math.abs(bounceT * 2 - 1);

  const popPeriod = 30;
  const popPhase = frame % popPeriod;
  const squareVisible = popPhase < 15;

  const sliderPeriod = 50;
  const sliderT = (frame % sliderPeriod) / sliderPeriod;
  const sliderX = sliderT < 0.5 ? sliderT * 2 : 2 - sliderT * 2;

  // ── REC indicator ──
  const recBlink = Math.floor(frame / 20) % 2 === 0;
  const recSeconds = Math.floor(frame / 30);
  const recMinutes = Math.floor(recSeconds / 60);
  const recTimestamp = `${String(recMinutes).padStart(2, "0")}:${String(recSeconds % 60).padStart(2, "0")}:${String(frame % 30).padStart(2, "0")}`;

  // ── Zoom: slow push, then rush into screen after power-off ──
  const ZOOM_DUR = 95;
  const RUSH_START = 128;
  const RUSH_DUR = 20;
  const ambientP = easeOut4(clamp01(frame / ZOOM_DUR));
  const rushP = clamp01((frame - RUSH_START) / RUSH_DUR);
  const rushEased = rushP * rushP * rushP;
  const zoom = 1 + ambientP * 0.45 + rushEased * 4.0;
  const SCREEN_CX = PHOTO_SCREEN_LEFT + PHOTO_SCREEN_W / 2;
  const SCREEN_CY = PHOTO_SCREEN_TOP + PHOTO_SCREEN_H / 2;

  // Handheld camera shake — gentle organic drift (fades out during rush zoom)
  const shakeAmt = clamp01(1 - rushP * 2);
  const shakeX = (Math.sin(frame * 0.09) * 2.5 + Math.sin(frame * 0.19 + 1.7) * 1.5) * shakeAmt;
  const shakeY = (Math.cos(frame * 0.08 + 0.5) * 2.0 + Math.cos(frame * 0.17 + 2.3) * 1.2) * shakeAmt;
  const shakeRot = (Math.sin(frame * 0.07 + 0.8) * 0.1 + Math.sin(frame * 0.15 + 3.1) * 0.06) * shakeAmt;

  // Screen fills canvas at zoom ≈ 3.25 (3840/1182).
  // rushP = 0.8 (frame 144) → zoom = 3.50. Start gradient there.
  const GRADIENT_START = 144;
  const GRADIENT_DUR = 8;
  const gradientP = clamp01((frame - GRADIENT_START) / GRADIENT_DUR);
  const colorShift = clamp01((frame - GRADIENT_START) / 12);

  // Screen inner dimensions
  const screenInnerW = PHOTO_SCREEN_W - 32;
  const screenInnerH = PHOTO_SCREEN_H - 32;
  const demoAreaTop = screenInnerH * 0.12;
  const demoAreaH = screenInnerH * 0.38;
  const demoColW = screenInnerW / 3;

  // SVG feTurbulence seed for animated static noise
  const noiseSeed = frame % 997;

  return (
    <SceneFade dur={156} fadeOut={8}>
      <AbsoluteFill style={{ background: "#020304" }}>

        {/* ══ Zoom wrapper — slow push toward the CRT screen + handheld shake ══ */}
        <div style={{
          position: "absolute", inset: 0,
          transform: `scale(${zoom}) translate(${shakeX}px, ${shakeY}px) rotate(${shakeRot}deg)`,
          transformOrigin: `${SCREEN_CX}px ${SCREEN_CY}px`,
          willChange: "transform",
          background: "#020304",
        }}>

        {/* ══ Photo layer — always visible, no transforms ══ */}
        <img
          src={staticFile("images/s1-crt-background.png")}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%", objectFit: "cover",
          }}
        />

        {/* ══ Screen content overlay — positioned over photo's screen ══ */}
        <div style={{
          position: "absolute",
          left: PHOTO_SCREEN_LEFT, top: PHOTO_SCREEN_TOP,
          width: PHOTO_SCREEN_W, height: PHOTO_SCREEN_H,
          clipPath: CRT_SCREEN_CLIP,
          perspective: 2200,
        }}>
          {/* ── Transform wrapper (perspective warp for screen surface) ── */}
          <div style={{
            width: "100%", height: "100%",
            transform: "rotateX(1deg)",
            transformOrigin: "center center",
          }}>

            {/* ═══ SIGNAL LAYER — collapses during power-off ═══ */}
            <div style={{
              position: "absolute", inset: 0,
              opacity: flicker,
              clipPath: poweroffP > 0
                ? `inset(${collapseY}% ${collapseX}% ${collapseY}% ${collapseX}%)`
                : undefined,
            }}>
              {/* ── Bad Animation Demos ── */}
              <div style={{
                position: "absolute", left: 16, top: demoAreaTop,
                width: screenInnerW, height: demoAreaH,
                display: "flex",
              }}>
                {/* 1. Linear Bounce Ball */}
                <div style={{ width: demoColW, position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    left: demoColW / 2 - 22,
                    top: demoAreaH - 50 - ballY * (demoAreaH - 90) - 44,
                    width: 44, height: 44, borderRadius: "50%",
                    background: CRT_PHOSPHOR, opacity: 0.8,
                    boxShadow: `0 0 18px ${CRT_PHOSPHOR}50`,
                    border: `2px solid ${CRT_PHOSPHOR}40`,
                  }} />
                  <div style={{
                    position: "absolute", bottom: 50, left: demoColW * 0.12,
                    width: demoColW * 0.76, height: 2,
                    background: `${CRT_PHOSPHOR}25`,
                  }} />
                  <div style={{
                    position: "absolute", bottom: 14, width: "100%",
                    textAlign: "center", fontFamily: `"Courier New", monospace`,
                    fontSize: 16, color: `${CRT_PHOSPHOR}50`, letterSpacing: 3,
                  }}>LINEAR</div>
                </div>

                {/* 2. Instant Pop Square */}
                <div style={{ width: demoColW, position: "relative" }}>
                  {squareVisible && (
                    <div style={{
                      position: "absolute",
                      left: demoColW / 2 - 44, top: demoAreaH / 2 - 70,
                      width: 88, height: 88,
                      background: CRT_AMBER, opacity: 0.6,
                      boxShadow: `0 0 16px ${CRT_AMBER}30`,
                      border: `2px solid ${CRT_AMBER}40`,
                    }} />
                  )}
                  {!squareVisible && (
                    <div style={{
                      position: "absolute",
                      left: demoColW / 2 - 44, top: demoAreaH / 2 - 70,
                      width: 88, height: 88,
                      border: `1px dashed ${CRT_AMBER}20`,
                    }} />
                  )}
                  <div style={{
                    position: "absolute", bottom: 14, width: "100%",
                    textAlign: "center", fontFamily: `"Courier New", monospace`,
                    fontSize: 16, color: `${CRT_AMBER}50`, letterSpacing: 3,
                  }}>POP-IN</div>
                </div>

                {/* 3. Robotic Slider */}
                <div style={{ width: demoColW, position: "relative" }}>
                  <div style={{
                    position: "absolute",
                    top: demoAreaH / 2 - 30,
                    left: 24, width: demoColW - 48, height: 10,
                    background: `${CRT_PHOSPHOR}12`, borderRadius: 5,
                  }}>
                    <div style={{
                      position: "absolute", top: -8, height: 26, width: 56,
                      borderRadius: 4,
                      left: sliderX * (demoColW - 104),
                      background: CRT_PHOSPHOR, opacity: 0.6,
                      boxShadow: `0 0 12px ${CRT_PHOSPHOR}30`,
                      border: `1px solid ${CRT_PHOSPHOR}40`,
                    }} />
                  </div>
                  <div style={{
                    position: "absolute", bottom: 14, width: "100%",
                    textAlign: "center", fontFamily: `"Courier New", monospace`,
                    fontSize: 16, color: `${CRT_PHOSPHOR}50`, letterSpacing: 3,
                  }}>ROBOTIC</div>
                </div>
              </div>

              {/* ── Typewriter Text ── */}
              <div style={{
              position: "absolute", left: 40, right: 40,
              top: screenInnerH * 0.54,
              }}>
              <div style={{
                fontFamily: `"Courier New", "Consolas", monospace`,
                fontSize: 54, fontWeight: 700,
                color: CRT_PHOSPHOR, letterSpacing: 2,
                textShadow: `0 0 20px ${CRT_PHOSPHOR}60, 0 0 40px ${CRT_PHOSPHOR}20`,
                whiteSpace: "pre-wrap",
                lineHeight: 1.3,
              }}>
                {typedText.includes("outdated")
                  ? <>
                      {typedText.slice(0, outdatedIdx)}
                      <span style={{
                        color: CRT_AMBER,
                        textShadow: `0 0 20px ${CRT_AMBER}60`,
                      }}>
                        {typedText.slice(outdatedIdx, outdatedIdx + 9)}
                      </span>
                    </>
                  : typedText
                }
                {cursorVisible && (
                  <span style={{ color: CRT_PHOSPHOR, opacity: 0.8 }}>|</span>
                )}
              </div>

              {subP > 0 && typeFinished && (
                <div style={{
                  marginTop: 20,
                  fontFamily: `"Courier New", "Consolas", monospace`,
                  fontSize: 30, fontWeight: 400,
                  color: `${CRT_PHOSPHOR}80`,
                  opacity: subP,
                  textShadow: `0 0 12px ${CRT_PHOSPHOR}30`,
                }}>
                  {">"} time to evolve_
                </div>
              )}
              </div>

              {/* ── REC Indicator ── */}
              <div style={{
              position: "absolute", top: 36, left: 36,
              display: "flex", alignItems: "center", gap: 10,
              fontFamily: `"Courier New", monospace`,
              fontSize: 24, color: "#ff3333",
              textShadow: "0 0 8px rgba(255,50,50,0.5)",
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: "50%",
                background: recBlink ? "#ff3333" : "#ff333340",
                boxShadow: recBlink ? "0 0 10px #ff3333" : "none",
              }} />
              <span style={{ opacity: recBlink ? 1 : 0.4 }}>REC</span>
              <span style={{ color: `${CRT_PHOSPHOR}60`, marginLeft: 12, fontSize: 20 }}>
                {recTimestamp}
              </span>
              </div>

              {/* ── Glitch: Horizontal Tear Bars ── */}
              {glitchP > 0.05 && Array.from({ length: 5 }, (_, gi) => {
                const barY = rand(gi) * screenInnerH;
                const barH = 6 + rand(gi + 50) * 20 * glitchP;
                const offsetX = (rand(gi + 100) - 0.5) * 80 * glitchP;
                return (
                  <div key={`tear-${gi}`} style={{
                    position: "absolute",
                    left: 0, width: "100%",
                    top: barY, height: barH,
                    background: `${CRT_PHOSPHOR}${Math.floor(glitchP * 25).toString(16).padStart(2, "0")}`,
                    transform: `translateX(${offsetX}px)`,
                    mixBlendMode: "screen",
                    pointerEvents: "none",
                  }} />
                );
              })}

              {/* ── Glitch: Static Noise Strips ── */}
              {glitchP > 0.1 && Array.from({ length: 12 }, (_, ni) => {
                const noiseY = rand(ni + 200) * screenInnerH;
                const noiseH = 2 + rand(ni + 250) * 4;
                return (
                  <div key={`noise-${ni}`} style={{
                    position: "absolute",
                    left: 0, width: "100%",
                    top: noiseY, height: noiseH,
                    background: `rgba(255,255,255,${0.03 + glitchP * 0.15})`,
                    pointerEvents: "none",
                  }} />
                );
              })}

              {/* ── Glitch: RGB Split ── */}
              {glitchP > 0.15 && (
                <>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: CRT_SCREEN_BG,
                    transform: `translateX(${-glitchP * 12}px)`,
                    opacity: glitchP * 0.35,
                    mixBlendMode: "screen",
                    boxShadow: `inset 0 0 0 2000px rgba(255,0,0,${glitchP * 0.15})`,
                    pointerEvents: "none",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0,
                    transform: `translateX(${glitchP * 12}px)`,
                    opacity: glitchP * 0.35,
                    mixBlendMode: "screen",
                    boxShadow: `inset 0 0 0 2000px rgba(0,100,255,${glitchP * 0.15})`,
                    pointerEvents: "none",
                  }} />
                </>
              )}

              {/* ── TV Static Flood (SVG feTurbulence) ── */}
              {staticP > 0 && (
                <>
                  <svg style={{ position: "absolute", width: 0, height: 0 }}>
                    <defs>
                      <filter id={S1_STATIC_FILTER_ID} x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence
                          type="fractalNoise"
                          baseFrequency={0.85}
                          numOctaves={3}
                          seed={noiseSeed}
                          stitchTiles="stitch"
                        />
                        <feColorMatrix type="saturate" values="0" />
                      </filter>
                    </defs>
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0,
                    filter: `url(#${S1_STATIC_FILTER_ID})`,
                    opacity: staticP,
                    pointerEvents: "none",
                  }}>
                    <div style={{ width: "100%", height: "100%", background: "#aaa" }} />
                  </div>
                </>
              )}
            </div>

            {/* ═══ SCREEN GLASS LAYER — stays full-size during power-off ═══ */}

            {/* ── Scanline Overlay (physical screen property) ── */}
            <div style={{
              position: "absolute", inset: 0,
              background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.12) 3px, rgba(0,0,0,0.12) 6px)",
              pointerEvents: "none",
              opacity: flicker,
            }} />

            {/* ── Screen Curvature Vignette (glass property) ── */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)",
              pointerEvents: "none",
            }} />

            {/* ── CRT Power-Off: phosphor line + dot ── */}
            {poweroffP >= 0.6 && (
              <div style={{
                position: "absolute",
                left: 0, top: "50%",
                width: "100%", height: 0,
                display: "flex", justifyContent: "center", alignItems: "center",
                pointerEvents: "none",
              }}>
                <div style={{
                  width: Math.max(10, (1 - (collapseX / 49)) * PHOTO_SCREEN_W),
                  height: poweroffP >= 0.9 ? 6 : 3,
                  borderRadius: 3,
                  background: CRT_PHOSPHOR,
                  opacity: dotFade,
                  boxShadow: `0 0 20px ${CRT_PHOSPHOR}, 0 0 60px ${CRT_PHOSPHOR}80, 0 0 120px ${CRT_PHOSPHOR}40`,
                }} />
              </div>
            )}
          </div>
        </div>

        </div>{/* close zoom wrapper */}

        {/* ══ Gradient bridge: CRT green → S2 dark background ══ */}
        {gradientP > 0 && (() => {
          const r = Math.round(10 + colorShift * -2);
          const g = Math.round(18 + colorShift * -9);
          const b = 14;
          const center = `rgb(${r},${g},${b})`;
          const edge = `rgb(${Math.round(6 + colorShift * 2)},${Math.round(7 + colorShift * 2)},${Math.round(11 + colorShift * 3)})`;
          return (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 45%, ${center} 0%, ${edge} 60%, ${C.bg} 100%)`,
              opacity: easeOut4(gradientP),
              pointerEvents: "none",
            }} />
          );
        })()}

        {/* ══ Transition dot — sits ABOVE gradient, matches zoomed phosphor dot ══ */}
        {gradientP > 0 && (() => {
          const gs = zoom;
          const morphP = clamp01((frame - 148) / 8);
          const dotW = 10 * gs * (1 - morphP * 0.7);
          const dotH = 6 * gs * (1 + morphP * 3.5);
          const glowFade = 1 - morphP * 0.7;
          return (
            <div style={{
              position: "absolute",
              left: "50%",
              top: `${(SCREEN_CY / H) * 100}%`,
              transform: "translate(-50%, -50%)",
              width: dotW,
              height: dotH,
              borderRadius: 3 * gs * (1 - morphP * 0.5),
              background: CRT_PHOSPHOR,
              boxShadow: `0 0 ${20 * gs * glowFade}px ${CRT_PHOSPHOR}, 0 0 ${60 * gs * glowFade}px ${CRT_PHOSPHOR}80, 0 0 ${120 * gs * glowFade}px ${CRT_PHOSPHOR}40`,
              pointerEvents: "none",
            }} />
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S2: PROBLEM — "Stiff. Robotic. Forgettable." + Vortex exit
// Techniques: Bad motion demos, vortex convergence, shockwave rings
// ═══════════════════════════════════════════════════════════════════════════════

const S2_GOO_ID = "s2-goo";

const S2Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CARD_COLORS = [C.rose, C.amber, C.textDim] as const;
  const problems = [
    { label: "Stiff.", desc: "Linear easing.\nNo personality.", bad: "linear" as const, color: CARD_COLORS[0] },
    { label: "Robotic.", desc: "Every element moves\nidentically.", bad: "uniform" as const, color: CARD_COLORS[1] },
    { label: "Forgettable.", desc: "Pop in, pop out.\nNo craft.", bad: "instant" as const, color: CARD_COLORS[2] },
  ];

  const boxW = 1040;
  const cardH = 1100;
  const gap = 60;
  const totalW = 3 * boxW + 2 * gap;
  const startX = (W - totalW) / 2;

  const CARD_STAGGER = 30;
  const CARD_BASE_ENTER = 62;

  // Melt + vortex start together — cards morph AND move simultaneously
  const MELT_START = 155;
  const MELT_DUR = 30;
  const meltP = clamp01((frame - MELT_START) / MELT_DUR);
  const meltEased = meltP * meltP * (3 - 2 * meltP);

  // Vortex begins at the same moment as melt so movement is continuous
  const VORTEX_START = MELT_START;
  const VORTEX_DUR = 75;
  const vortexP = clamp01((frame - VORTEX_START) / VORTEX_DUR);
  const vortexEased = vortexP * vortexP * (3 - 2 * vortexP);

  const BURST_FRAME = VORTEX_START + VORTEX_DUR;

  const BLOB_DIAMETER = 520;
  // Cards visible until melt nearly done; blobs fade in to match
  const cardVis = clamp01(1 - (meltEased - 0.85) / 0.15);
  const blobVis = clamp01((meltEased - 0.7) / 0.2);

  const gooBlur = 8 + meltEased * 6 + vortexEased * 10;

  const headerFade = frame >= MELT_START - 10
    ? Math.max(0, 1 - clamp01((frame - (MELT_START - 10)) / 15))
    : 1;

  // Positions: cards start moving immediately as they morph
  const vortexSpeeds = [1.0, 1.35, 0.8];
  const vortexDirs = [1, -1, 1];
  const wobbleFreqs = [0.12, 0.09, 0.15];
  const centers = problems.map((_, i) => {
    const restX = startX + i * (boxW + gap) + boxW / 2;
    const restY = 500 + cardH / 2;
    if (vortexP <= 0) return { cx: restX, cy: restY };

    const initAngle = Math.atan2(restY - CY, restX - CX);
    const initRadius = Math.hypot(restX - CX, restY - CY);
    const radiusDecay = 1 - vortexEased;
    const rampIn = clamp01(vortexP * 5);
    const radius = Math.max(0, initRadius * radiusDecay + Math.sin(vortexP * 12 + i * 2.5) * 40 * rampIn * (1 - vortexP));
    const angle = initAngle + 3.0 * Math.PI * vortexEased * vortexSpeeds[i] * vortexDirs[i];
    const wobbleX = Math.sin(frame * wobbleFreqs[i] + i * 4) * 60 * rampIn * (1 - vortexP);
    const wobbleY = Math.cos(frame * wobbleFreqs[i] * 1.3 + i * 2) * 40 * rampIn * (1 - vortexP);
    return {
      cx: CX + radius * Math.cos(angle) + wobbleX,
      cy: CY + radius * Math.sin(angle) + wobbleY,
    };
  });

  // ── Typewriter header — single continuous element ──
  const FULL_TEXT = "Does this look familiar?";
  const TYPE_START = 14;
  const TYPE_DUR = 36;
  const TYPE_END = TYPE_START + TYPE_DUR;
  const charsVisible = frame < TYPE_START
    ? 0
    : Math.min(FULL_TEXT.length, Math.floor((frame - TYPE_START) / (TYPE_DUR / FULL_TEXT.length)));
  const typedText = FULL_TEXT.slice(0, charsVisible);

  // Continuous morph: dot → cursor (0 at frame 0, 1 at frame 14)
  const morphP = clamp01(frame / 14);
  const dotOpacity = clamp01(frame / 6);

  // Position: types at CRT screen center, then slides up to header after typing
  const SLIDE_START = TYPE_END + 4;
  const slideP = spring({ frame: Math.max(0, frame - SLIDE_START), fps, config: { damping: 16, stiffness: 80, mass: 0.8 } });
  const DOT_ORIGIN_Y = PHOTO_SCREEN_TOP + PHOTO_SCREEN_H / 2;
  const HEADER_Y = 240;
  const textY = DOT_ORIGIN_Y + (HEADER_Y - DOT_ORIGIN_Y) * slideP;

  // Cursor geometry: dot shape → tall thin cursor
  const cursorW = 10 * (1 - morphP * 0.7);
  const cursorH = 6 + morphP * 74;
  const cursorBR = 3 * (1 - morphP * 0.8);
  const glowFade = 1 - morphP * 0.85;

  // Color transition: CRT green → text colors
  const colorTransP = clamp01((frame - TYPE_START) / TYPE_DUR);
  const greenR = 51, greenG = 255, greenB = 102;
  const midR = 160, midG = 165, midB = 180;
  const typedColorR = Math.round(greenR + colorTransP * (midR - greenR));
  const typedColorG = Math.round(greenG + colorTransP * (midG - greenG));
  const typedColorB = Math.round(greenB + colorTransP * (midB - greenB));
  const typedColor = `rgb(${typedColorR},${typedColorG},${typedColorB})`;

  // Cursor blink & fade-out after typing completes
  const cursorBlink = Math.floor(frame / 15) % 2 === 0;
  const cursorFadeP = clamp01((frame - 54) / 8);
  const cursorBlinkOpacity = charsVisible >= FULL_TEXT.length
    ? (cursorBlink ? 1 : 0.2) * (1 - cursorFadeP)
    : (cursorBlink ? 1 : 0.2);

  return (
    <SceneFade dur={258} fadeOut={14}>
      <AbsoluteFill style={{
        background: C.bg,
        transform: (() => {
          const burstLocal = frame - BURST_FRAME;
          if (burstLocal >= 0 && burstLocal < 20) {
            const impact = Math.exp(-burstLocal * 0.25) * 18;
            const hx = Math.sin(burstLocal * 3.7) * impact;
            const hy = Math.cos(burstLocal * 2.9) * impact;
            return `translate(${hx}px, ${hy}px)`;
          }
          if (vortexP > 0.5) {
            return `translate(${Math.sin(frame * 1.7) * vortexEased * 6}px, ${Math.cos(frame * 1.3) * vortexEased * 4}px)`;
          }
          return undefined;
        })(),
      }}>
        <DotGrid progress={easeOut4(clamp01(frame / 40))} originX={CX} originY={CY} dotColor={C.rose} breatheFrame={frame} />

        <div style={{ opacity: headerFade }}>

          {/* ── Single element: dot → cursor → typewriter → slide up ── */}
          <div style={{
            position: "absolute",
            left: 0, right: 0, top: textY,
            transform: "translateY(-50%)",
            textAlign: "center",
            fontFamily: FONT,
            fontSize: 96,
            letterSpacing: -2,
            lineHeight: 1,
            whiteSpace: "pre",
            opacity: dotOpacity,
          }}>
            {charsVisible > 0 && typedText.split("").map((ch, i) => {
              const isFamiliar = i >= FULL_TEXT.indexOf("familiar?");
              const charColorP = clamp01((charsVisible - i) / 8);
              const cR = Math.round(greenR + charColorP * ((isFamiliar ? 240 : midR) - greenR));
              const cG = Math.round(greenG + charColorP * ((isFamiliar ? 242 : midG) - greenG));
              const cB = Math.round(greenB + charColorP * ((isFamiliar ? 245 : midB) - greenB));
              return (
                <span key={i} style={{
                  color: `rgb(${cR},${cG},${cB})`,
                  fontWeight: isFamiliar ? 700 : 400,
                }}>{ch}</span>
              );
            })}
            <span style={{
              display: "inline-block",
              width: cursorW,
              height: cursorH,
              marginLeft: charsVisible > 0 ? 4 : 0,
              verticalAlign: "middle",
              borderRadius: cursorBR,
              background: CRT_PHOSPHOR,
              opacity: cursorBlinkOpacity,
              boxShadow: glowFade > 0.01
                ? `0 0 ${20 * glowFade}px ${CRT_PHOSPHOR}, 0 0 ${60 * glowFade}px ${CRT_PHOSPHOR}80, 0 0 ${120 * glowFade}px ${CRT_PHOSPHOR}40`
                : "none",
              transition: charsVisible > 0 ? "width 0.1s, height 0.1s, border-radius 0.1s" : "none",
            }} />
          </div>
        </div>

        {/* ── Phase 1: HTML Cards — sequential reveal, melt into blobs ──────── */}
        {cardVis > 0.01 && problems.map((p, i) => {
          const cardEnterFrame = CARD_BASE_ENTER + i * CARD_STAGGER;
          const enterP = spring({
            frame: Math.max(0, frame - cardEnterFrame),
            fps, config: SPR.ui,
          });
          const { cx, cy } = centers[i];
          const cardScale = 0.92 + enterP * 0.08;

          const demoFrame = Math.max(0, frame - cardEnterFrame - 12);
          const demoW = boxW - 96;
          const demoH = 620;
          const breathe = Math.sin(frame * 0.03 + i * 1.5) * 0.3 + 0.7;

          // Melt: card shrinks to match blob circle exactly
          const meltW = boxW + meltEased * (BLOB_DIAMETER - boxW);
          const meltH = cardH + meltEased * (BLOB_DIAMETER - cardH);
          const contentOpacity = Math.max(0, 1 - meltEased * 2);
          const bgR = 18, bgG = 19, bgB = 26;
          const colHex = p.color;
          const cR = parseInt(colHex.slice(1, 3), 16);
          const cG = parseInt(colHex.slice(3, 5), 16);
          const cB = parseInt(colHex.slice(5, 7), 16);
          const mBgR = Math.round(bgR + meltEased * (cR - bgR));
          const mBgG = Math.round(bgG + meltEased * (cG - bgG));
          const mBgB = Math.round(bgB + meltEased * (cB - bgB));

          // borderRadius: smooth from 40px → half of the smaller dimension (fully circular)
          const targetBR = Math.min(meltW, meltH) / 2;
          const smoothBR = 40 + meltEased * (targetBR - 40);

          // Blur ramps up during morph to mask shape inconsistencies
          const meltBlur = meltEased * 12;
          const meltGlow = meltEased * 80;

          return (
            <div key={i} style={{
              position: "absolute",
              left: cx - meltW / 2, top: cy - meltH / 2,
              width: meltW, height: meltH,
              borderRadius: smoothBR,
              background: `rgb(${mBgR},${mBgG},${mBgB})`,
              border: meltEased < 0.7 ? `2px solid ${p.color}20` : "none",
              boxShadow: `0 0 ${30 * breathe + meltGlow}px ${p.color}${meltEased > 0.3 ? "50" : "15"}, 0 0 ${meltGlow * 2}px ${p.color}20, 0 16px 64px rgba(0,0,0,0.3)`,
              filter: meltBlur > 0.5 ? `blur(${meltBlur}px)` : undefined,
              opacity: enterP * cardVis,
              transform: `translateY(${(1 - enterP) * 120}px) scale(${cardScale * (1 + meltEased * 0.05)})`,
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "48px 48px 40px", gap: 24, overflow: "hidden",
            }}>
              {/* Top glow bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 5,
                background: `linear-gradient(90deg, transparent, ${p.color}, transparent)`,
                opacity: enterP * 0.4 * breathe * contentOpacity, borderRadius: "40px 40px 0 0",
              }} />

              <div style={{ opacity: contentOpacity }}>
              <div style={{ fontFamily: FONT, fontSize: 52, fontWeight: 700, color: p.color, letterSpacing: -1 }}>{p.label}</div>

              {/* Accent line */}
              <div style={{
                width: 60, height: 3, borderRadius: 2, background: p.color,
                opacity: enterP * 0.5, transform: `scaleX(${enterP})`,
              }} />

              {/* ── Demo area ── */}
              <div style={{
                width: demoW, height: demoH, background: `${p.color}06`, borderRadius: 24,
                position: "relative", overflow: "hidden", border: `1px solid ${p.color}15`,
              }}>
                {p.bad === "linear" && (() => {
                  const items = [
                    { w: 0.7, label: "Header", h: 44 },
                    { w: 0.5, label: "Subtitle", h: 36 },
                    { w: 0.85, label: "Image", h: 220 },
                    { w: 0.4, label: "Button", h: 56 },
                  ];
                  return items.map((item, j) => {
                    const linearT = clamp01((demoFrame - j * 8) / 25);
                    const x = (1 - linearT) * (demoW + 40);
                    return (
                      <div key={j} style={{
                        position: "absolute",
                        left: 28 + x, top: 28 + j * (demoH / 4.5),
                        width: (demoW - 56) * item.w, height: item.h,
                        borderRadius: item.label === "Button" ? 28 : 14,
                        background: item.label === "Image"
                          ? `linear-gradient(135deg, ${p.color}18, ${p.color}08)`
                          : `${p.color}${item.label === "Button" ? "30" : "20"}`,
                        border: `1px solid ${p.color}25`,
                      }}>
                        <div style={{
                          fontFamily: FONT, fontSize: 18, fontWeight: 600, color: `${p.color}90`,
                          padding: "8px 16px",
                        }}>{item.label}</div>
                      </div>
                    );
                  });
                })()}

                {p.bad === "uniform" && (() => {
                  const t = clamp01(demoFrame / 20);
                  const rows = 3, cols = 3;
                  const cellW = (demoW - 70) / cols;
                  const cellH = (demoH - 70) / rows;
                  return Array.from({ length: rows * cols }, (_, j) => {
                    const col = j % cols, row = Math.floor(j / cols);
                    return (
                      <div key={j} style={{
                        position: "absolute",
                        left: 20 + col * (cellW + 15),
                        top: 20 + row * (cellH + 15),
                        width: cellW, height: cellH, borderRadius: 16,
                        background: `${p.color}15`, border: `1px solid ${p.color}20`,
                        transform: `scale(${0.3 + t * 0.7}) translateY(${(1 - t) * 30}px)`,
                        opacity: t,
                      }}>
                        <div style={{
                          width: "60%", height: 12, borderRadius: 6,
                          background: `${p.color}30`, margin: "24px auto 10px",
                        }} />
                        <div style={{
                          width: "40%", height: 10, borderRadius: 5,
                          background: `${p.color}18`, margin: "0 auto",
                        }} />
                      </div>
                    );
                  });
                })()}

                {p.bad === "instant" && (() => {
                  const marks = [
                    { x: 0.5, y: 0.32, size: 180, delay: 0 },
                    { x: 0.22, y: 0.55, size: 110, delay: 6 },
                    { x: 0.78, y: 0.55, size: 110, delay: 10 },
                    { x: 0.35, y: 0.18, size: 72, delay: 14 },
                    { x: 0.68, y: 0.78, size: 72, delay: 18 },
                  ];
                  return marks.map((m, j) => {
                    const vis = demoFrame >= m.delay;
                    return (
                      <div key={j} style={{
                        position: "absolute",
                        left: m.x * demoW - m.size / 2,
                        top: m.y * demoH - m.size / 2,
                        width: m.size, height: m.size,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: FONT, fontSize: m.size * 0.8, fontWeight: 800,
                        color: `${p.color}${j === 0 ? "40" : "25"}`,
                        opacity: vis ? 1 : 0,
                        transform: vis ? "scale(1)" : "scale(0)",
                      }}>?</div>
                    );
                  });
                })()}
              </div>

              <div style={{
                fontFamily: FONT, fontSize: 30, fontWeight: 400, color: C.textDim,
                textAlign: "center", lineHeight: 1.6, whiteSpace: "pre-line",
                opacity: enterP * 0.8,
              }}>{p.desc}</div>
              </div>{/* close content opacity wrapper */}
            </div>
          );
        })}

        {/* ── Phase 2: SVG Blobs — cards melt into these, then spiral ─── */}
        {blobVis > 0.01 && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
            <defs>
              <filter id={S2_GOO_ID}>
                <feGaussianBlur in="SourceGraphic" stdDeviation={gooBlur} result="blur" />
                <feColorMatrix in="blur" mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
              </filter>
            </defs>
            <g filter={`url(#${S2_GOO_ID})`}
               opacity={blobVis}>
              {problems.map((p, i) => {
                const { cx, cy } = centers[i];
                const blobR = BLOB_DIAMETER / 2 * (1 - vortexEased * 0.7);
                const pulse = 0.97 + 0.03 * Math.sin(frame * 0.08 + i * 2.1);
                return (
                  <circle key={i} cx={cx} cy={cy}
                    r={Math.max(40, blobR * pulse)}
                    fill={p.color} opacity={0.85} />
                );
              })}
            </g>
          </svg>
        )}

        {/* ── Vortex FX: colorful convergence glow — expands & brightens as blobs converge ── */}
        {vortexP > 0.1 && (() => {
          const glowSize = 600 + vortexEased * 1400;
          const glowOpacity = vortexEased * 0.7;
          return (
            <>
              {/* Rose layer */}
              <div style={{
                position: "absolute",
                left: CX - glowSize / 2, top: CY - glowSize / 2,
                width: glowSize, height: glowSize, borderRadius: "50%",
                background: `radial-gradient(circle, ${C.rose}40 0%, ${C.rose}10 40%, transparent 70%)`,
                opacity: glowOpacity,
                pointerEvents: "none",
              }} />
              {/* Amber layer — offset slightly for color separation */}
              <div style={{
                position: "absolute",
                left: CX - glowSize * 0.45, top: CY - glowSize * 0.35,
                width: glowSize * 0.9, height: glowSize * 0.9, borderRadius: "50%",
                background: `radial-gradient(circle, ${C.amber}35 0%, ${C.amber}0a 45%, transparent 70%)`,
                opacity: glowOpacity * 0.9,
                pointerEvents: "none",
              }} />
              {/* Combined conic sweep for color blend */}
              <div style={{
                position: "absolute",
                left: CX - glowSize * 0.4, top: CY - glowSize * 0.4,
                width: glowSize * 0.8, height: glowSize * 0.8, borderRadius: "50%",
                background: `conic-gradient(from ${vortexP * 120}deg, ${C.rose}30, ${C.amber}25, ${C.textDim}20, ${C.rose}30)`,
                filter: `blur(${40 + vortexEased * 60}px)`,
                opacity: glowOpacity * 0.5,
                pointerEvents: "none",
              }} />
            </>
          );
        })()}

        {/* ── Vortex FX: blob motion trails ── */}
        {vortexP > 0.1 && (
          <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
            {problems.map((p, i) => {
              const { cx, cy } = centers[i];
              const restX = startX + i * (boxW + gap) + boxW / 2;
              const restY = 500 + cardH / 2;
              const dx = cx - (vortexP > 0 ? CX + (restX - CX) * (1 - vortexEased) : restX);
              const dy = cy - (vortexP > 0 ? CY + (restY - CY) * (1 - vortexEased) : restY);
              const speed = Math.hypot(dx, dy);
              const trailOpacity = clamp01(speed / 200) * vortexEased * 0.4;
              const trailAngle = Math.atan2(dy, dx);
              const trailLen = Math.min(speed * 1.5, 300) * vortexEased;
              const blobR = BLOB_DIAMETER / 2 * (1 - vortexEased * 0.7);
              return Array.from({ length: 4 }).map((_, t) => {
                const offset = (t + 1) * trailLen * 0.25;
                const trailX = cx - Math.cos(trailAngle) * offset;
                const trailY = cy - Math.sin(trailAngle) * offset;
                return (
                  <circle key={`${i}-${t}`}
                    cx={trailX} cy={trailY}
                    r={Math.max(10, blobR * (0.7 - t * 0.15))}
                    fill={p.color}
                    opacity={trailOpacity * (1 - t * 0.25)} />
                );
              });
            })}
          </svg>
        )}

        {/* ── Burst: bright flash on impact ── */}
        {(() => {
          const bl = frame - BURST_FRAME;
          if (bl < 0 || bl > 12) return null;
          const flashP = clamp01(bl / 3);
          const flashDecay = Math.exp(-bl * 0.4);
          return (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.9 * flashDecay}) 0%, rgba(255,200,180,${0.4 * flashDecay}) 30%, transparent 60%)`,
              pointerEvents: "none",
              opacity: flashP,
            }} />
          );
        })()}

        {/* ── Burst: multi-layered shockwave rings ── */}
        <ShockwaveRing enterFrame={BURST_FRAME} duration={18} color={CARD_COLORS[0]} maxRadius={1200} strokeWidth={8} />
        <ShockwaveRing enterFrame={BURST_FRAME} duration={24} color={"#ffffff"} maxRadius={1000} strokeWidth={3} />
        <ShockwaveRing enterFrame={BURST_FRAME + 2} duration={22} color={CARD_COLORS[1]} maxRadius={1500} strokeWidth={6} />
        <ShockwaveRing enterFrame={BURST_FRAME + 3} duration={20} color={"#ffffff"} maxRadius={800} strokeWidth={2} />
        <ShockwaveRing enterFrame={BURST_FRAME + 5} duration={26} color={CARD_COLORS[2]} maxRadius={1800} strokeWidth={5} />
        <ShockwaveRing enterFrame={BURST_FRAME + 6} duration={22} color={CARD_COLORS[0]} maxRadius={2200} strokeWidth={3} />
        <ShockwaveRing enterFrame={BURST_FRAME + 8} duration={28} color={CARD_COLORS[1]} maxRadius={2600} strokeWidth={4} />
        <ShockwaveRing enterFrame={BURST_FRAME + 10} duration={30} color={"#ffffff"} maxRadius={2800} strokeWidth={2} />

        {/* ── Burst: expanding particle debris ── */}
        {(() => {
          const bl = frame - BURST_FRAME;
          if (bl < 0 || bl > 30) return null;
          const debrisP = clamp01(bl / 30);
          return (
            <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = (i / 18) * Math.PI * 2 + i * 0.3;
                const speed = 300 + (i % 5) * 200;
                const particleR = debrisP * speed * (1 + 0.3 * Math.sin(i * 4.1));
                const size = (4 + (i % 3) * 3) * (1 - debrisP * 0.7);
                const col = CARD_COLORS[i % 3];
                return (
                  <circle key={i}
                    cx={CX + Math.cos(angle) * particleR}
                    cy={CY + Math.sin(angle) * particleR}
                    r={size} fill={col}
                    opacity={(1 - debrisP) * 0.8} />
                );
              })}
            </svg>
          );
        })()}

        {/* ── Burst: color wash ring ── */}
        {(() => {
          const bl = frame - BURST_FRAME;
          if (bl < 0 || bl > 20) return null;
          const washP = clamp01(bl / 20);
          const washEased = 1 - Math.pow(1 - washP, 3);
          const washSize = 400 + washEased * 3000;
          return (
            <div style={{
              position: "absolute",
              left: CX - washSize / 2, top: CY - washSize / 2,
              width: washSize, height: washSize, borderRadius: "50%",
              background: `conic-gradient(from ${bl * 15}deg, ${C.rose}60, ${C.amber}50, ${C.textDim}40, ${C.rose}60)`,
              filter: `blur(${60 + washEased * 40}px)`,
              opacity: (1 - washP) * 0.4,
              pointerEvents: "none",
            }} />
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S3: REVEAL — Metaball brand + 3D icon + cursor interaction
// Techniques: SVG goo filter metaballs, CSS 3D cube, animated cursor
// ═══════════════════════════════════════════════════════════════════════════════

const GOO_FILTER_ID = "animly-goo";

const S3Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase timing ──
  // Fly (burst from center + wander) → Converge → Morph → Solidify → Brand
  const FLY_DUR = 120;
  const CONVERGE_START = FLY_DUR;
  const CONVERGE_DUR = 30;
  const MORPH_START = CONVERGE_START + CONVERGE_DUR;
  const MORPH_DUR = 25;
  const SOLIDIFY_START = MORPH_START + MORPH_DUR;
  const SOLIDIFY_DUR = 12;
  const BRAND_SOLID = SOLIDIFY_START + SOLIDIFY_DUR;

  const blobSeeds = [
    { tx: CX - 700, ty: CY - 400, color: C.accent, r: 90 },
    { tx: CX + 650, ty: CY - 300, color: C.cyan, r: 75 },
    { tx: CX - 500, ty: CY + 350, color: C.emerald, r: 82 },
    { tx: CX + 350, ty: CY - 500, color: C.rose, r: 68 },
    { tx: CX - 150, ty: CY + 450, color: C.amber, r: 98 },
    { tx: CX + 750, ty: CY + 350, color: C.accent, r: 75 },
  ];

  // Per-blob full trajectories: center → burst out → sweep the screen
  // First point is always center (burst origin), second is the seed (burst direction)
  const BLOB_PATHS: [number, number][][] = [
    [[CX, CY], [CX - 700, CY - 400], [CX + 200, CY - 600], [CX + 800, CY - 100], [CX + 300, CY + 500], [CX - 500, CY + 200], [CX - 600, CY - 300]],
    [[CX, CY], [CX + 650, CY - 300], [CX + 100, CY + 400], [CX - 700, CY + 100], [CX - 300, CY - 500], [CX + 400, CY - 600], [CX + 700, CY - 200]],
    [[CX, CY], [CX - 500, CY + 350], [CX - 200, CY - 400], [CX + 600, CY - 350], [CX + 700, CY + 300], [CX, CY + 600], [CX - 400, CY + 300]],
    [[CX, CY], [CX + 350, CY - 500], [CX - 600, CY - 350], [CX - 750, CY + 200], [CX, CY + 550], [CX + 650, CY + 100], [CX + 400, CY - 400]],
    [[CX, CY], [CX - 150, CY + 450], [CX + 500, CY + 500], [CX + 800, CY - 200], [CX - 100, CY - 600], [CX - 700, CY], [CX - 200, CY + 400]],
    [[CX, CY], [CX + 750, CY + 350], [CX + 300, CY - 500], [CX - 400, CY - 400], [CX - 750, CY + 100], [CX - 200, CY + 600], [CX + 600, CY + 300]],
  ];

  // Approximate letter-center positions along "Animly" at fontSize 200
  const textTargets = [
    { x: CX - 280, y: CY },
    { x: CX - 168, y: CY },
    { x: CX - 56,  y: CY },
    { x: CX + 56,  y: CY },
    { x: CX + 168, y: CY },
    { x: CX + 280, y: CY },
  ];

  // ── Zoom: cinematic push during convergence, hold during morph, pull back ──
  let zoomLevel = 1;
  if (frame >= CONVERGE_START && frame < MORPH_START) {
    const zt = clamp01((frame - CONVERGE_START) / CONVERGE_DUR);
    zoomLevel = 1 + (1 - Math.pow(1 - zt, 3)) * 0.6;
  } else if (frame >= MORPH_START && frame < SOLIDIFY_START) {
    zoomLevel = 1.6;
  } else if (frame >= SOLIDIFY_START) {
    const zo = clamp01((frame - SOLIDIFY_START) / 20);
    zoomLevel = 1.6 - (1 - Math.pow(1 - zo, 3)) * 0.6;
  }

  // ── Goo blur: varies per phase ──
  let gooBlur: number;
  if (frame < 18) {
    gooBlur = 26;
  } else if (frame < CONVERGE_START) {
    gooBlur = 26 - clamp01((frame - 18) / 24) * 8;
  } else if (frame < MORPH_START) {
    gooBlur = 18 + clamp01((frame - CONVERGE_START) / CONVERGE_DUR) * 8;
  } else if (frame < SOLIDIFY_START) {
    gooBlur = 26 - clamp01((frame - MORPH_START) / MORPH_DUR) * 16;
  } else {
    gooBlur = 10 - clamp01((frame - SOLIDIFY_START) / SOLIDIFY_DUR) * 10;
  }

  // ── Phase progress values ──
  const morphT = clamp01((frame - MORPH_START) / MORPH_DUR);
  const morphEased = 1 - Math.pow(1 - morphT, 2);
  const solidifyT = clamp01((frame - SOLIDIFY_START) / SOLIDIFY_DUR);

  // SVG text morph: rendered inside goo filter, fades in during morph, instant-off at BRAND_SOLID
  const textMorphOpacity = frame >= BRAND_SOLID ? 0
    : frame >= MORPH_START ? clamp01((frame - MORPH_START) / (MORPH_DUR * 0.5))
    : 0;

  // ── Post-solidify springs ──

  const glowBreath = Math.sin(frame * 0.035) * 0.015 + 0.05;

  // ── Blob circles: fly (burst + wander) → converge → morph to text positions ──
  // Catmull-Rom evaluator + arc-length LUT built once per blob
  const catmull = (a: number, b: number, c: number, d: number, u: number) => {
    const u2 = u * u, u3 = u2 * u;
    return 0.5 * ((-a + 3*b - 3*c + d)*u3 + (2*a - 5*b + 4*c - d)*u2 + (-a + c)*u + 2*b);
  };
  const splineAt = (pts: [number,number][], t: number) => {
    const n = pts.length;
    const seg = t * (n - 1);
    const idx = Math.min(Math.floor(seg), n - 2);
    const lt = seg - idx;
    const p0 = pts[Math.max(0, idx-1)], p1 = pts[idx];
    const p2 = pts[Math.min(n-1, idx+1)], p3 = pts[Math.min(n-1, idx+2)];
    return { x: catmull(p0[0],p1[0],p2[0],p3[0],lt), y: catmull(p0[1],p1[1],p2[1],p3[1],lt) };
  };

  // Pre-build arc-length LUT per blob for constant-speed parameterization
  const SAMPLES = 200;
  const blobLUTs = BLOB_PATHS.map((pts) => {
    const lut: number[] = [0];
    let prev = splineAt(pts, 0);
    for (let s = 1; s <= SAMPLES; s++) {
      const cur = splineAt(pts, s / SAMPLES);
      lut.push(lut[s-1] + Math.hypot(cur.x - prev.x, cur.y - prev.y));
      prev = cur;
    }
    return lut;
  });

  const uniformToT = (lut: number[], u: number) => {
    const target = u * lut[SAMPLES];
    let lo = 0, hi = SAMPLES;
    while (lo < hi - 1) {
      const mid = (lo + hi) >> 1;
      if (lut[mid] < target) lo = mid; else hi = mid;
    }
    const segLen = lut[hi] - lut[lo];
    const frac = segLen > 0 ? (target - lut[lo]) / segLen : 0;
    return (lo + frac) / SAMPLES;
  };

  const blobCircles = blobSeeds.map((seed, i) => {
    const pts = BLOB_PATHS[i];
    const lut = blobLUTs[i];

    // flyPos: constant-speed position along the full spline (center → burst → wander)
    const flyPos = (f: number) => {
      const u = clamp01(f / FLY_DUR);
      return splineAt(pts, uniformToT(lut, u));
    };

    let bx: number, by: number;

    if (frame < CONVERGE_START) {
      const pos = flyPos(frame);
      bx = pos.x;
      by = pos.y;
    } else if (frame < MORPH_START) {
      // Convergence: carries fly velocity then curves toward center
      const flyEnd = flyPos(FLY_DUR);
      const flyPrev = flyPos(FLY_DUR - 1);
      const velX = flyEnd.x - flyPrev.x;
      const velY = flyEnd.y - flyPrev.y;

      const cf = frame - CONVERGE_START;
      const ct = clamp01(cf / CONVERGE_DUR);

      const inertiaX = flyEnd.x + velX * cf;
      const inertiaY = flyEnd.y + velY * cf;

      const initAngle = Math.atan2(flyEnd.y - CY, flyEnd.x - CX);
      const initRadius = Math.hypot(flyEnd.x - CX, flyEnd.y - CY);
      const radius = initRadius * (1 - ct * ct);
      const angle = initAngle + 1.8 * Math.PI * ct;
      const spiralX = CX + radius * Math.cos(angle);
      const spiralY = CY + radius * Math.sin(angle);

      const blend = ct * ct;
      bx = inertiaX * (1 - blend) + spiralX * blend;
      by = inertiaY * (1 - blend) + spiralY * blend;
    } else {
      // Morph: blobs at center spread to letter positions
      const tt = textTargets[i];
      bx = CX + (tt.x - CX) * morphEased;
      by = CY + (tt.y - CY) * morphEased;
    }

    // Opacity: full until solidify, then fade as CSS text takes over
    let opacity = 1;
    if (frame >= SOLIDIFY_START) {
      opacity = Math.max(0, 1 - solidifyT);
    }

    const burstScale = frame < 18 ? 1.4 - clamp01(frame / 18) * 0.4 : 1;
    const morphShrink = frame >= MORPH_START ? 1 - morphT * 0.4 : 1;
    const pulse = 0.92 + 0.08 * Math.cos((frame % 30) / 30 * Math.PI * 2 + i);
    return (
      <circle key={i} cx={bx} cy={by}
        r={seed.r * pulse * burstScale * morphShrink}
        fill={seed.color} opacity={opacity} />
    );
  });

  // Blob layer opacity: quick fade-in over 3 frames so it seamlessly
  // takes over from S2's fading merged blob at the same position
  const blobFadeIn = clamp01(frame / 3);

  return (
    <div style={{
      position: "absolute", left: 0, top: 0, width: W, height: H,
      transform: `scale(${zoomLevel})`,
      transformOrigin: `${CX}px ${CY}px`,
    }}>
      {/* ── Scene content (behind blobs) ── */}
      <SceneFade dur={330} fadeIn={8}>
        <AbsoluteFill style={{ background: C.bg }}>
          {/* ── Animated background: slow-drifting gradient nebula ── */}
          {(() => {
            const drift = frame * 0.15;
            const g1x = 35 + Math.sin(drift * 0.07) * 15;
            const g1y = 30 + Math.cos(drift * 0.05) * 12;
            const g2x = 65 + Math.cos(drift * 0.06) * 18;
            const g2y = 70 + Math.sin(drift * 0.08) * 14;
            const g3x = 50 + Math.sin(drift * 0.04 + 2) * 20;
            const g3y = 50 + Math.cos(drift * 0.09 + 1) * 10;
            const pulse1 = 0.06 + Math.sin(frame * 0.025) * 0.015;
            const pulse2 = 0.04 + Math.cos(frame * 0.03) * 0.012;
            const pulse3 = 0.035 + Math.sin(frame * 0.02 + 1.5) * 0.01;
            return (
              <>
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse at ${g1x}% ${g1y}%, ${C.accent}28 0%, transparent 55%)`,
                  opacity: pulse1 / 0.06, filter: "blur(80px)",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse at ${g2x}% ${g2y}%, ${C.cyan}20 0%, transparent 50%)`,
                  opacity: pulse2 / 0.04, filter: "blur(100px)",
                }} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse at ${g3x}% ${g3y}%, ${C.rose}18 0%, transparent 45%)`,
                  opacity: pulse3 / 0.035, filter: "blur(120px)",
                }} />
              </>
            );
          })()}
          {/* Accent glow */}
          <div style={{
            position: "absolute", left: CX - 500, top: CY - 600,
            width: 1000, height: 800, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.accent}, transparent 65%)`,
            opacity: glowBreath, filter: "blur(100px)",
          }} />

          {/* ── Slogan: appears after burst, holds, fades before converge ── */}
          {frame >= 25 && frame < CONVERGE_START + 10 && (() => {
            const fadeIn = clamp01((frame - 25) / 18);
            const fadeOut = clamp01((frame - (CONVERGE_START - 15)) / 15);
            const sloganOpacity = fadeIn * (1 - fadeOut);
            const slideY = (1 - fadeIn) * 30;
            return (
              <div style={{
                position: "absolute", left: 0, right: 0, top: CY - 40,
                textAlign: "center",
                opacity: sloganOpacity,
                transform: `translateY(${slideY}px)`,
                pointerEvents: "none",
              }}>
                <span style={{
                  fontFamily: FONT, fontSize: 80, fontWeight: 600,
                  color: C.text, letterSpacing: -1,
                }}>Actualize your vision.</span>
              </div>
            );
          })()}

          {/* ── CTA: "Animly" with perspective tilt + letter color wash ── */}
          {frame >= BRAND_SOLID && (() => {
            const bf = frame - BRAND_SOLID;
            const LETTERS = ["A","n","i","m","l","y"];
            const TILT_DELAY = 8;
            const tiltP = bf >= TILT_DELAY
              ? spring({ frame: bf - TILT_DELAY, fps, config: { stiffness: 80, damping: 12, mass: 0.8 } })
              : 0;
            const tiltX = tiltP * 6;
            const tiltY = tiltP * -3;

            return (
              <div style={{
                position: "absolute", left: 0, right: 0,
                top: 0, height: H,
                display: "flex", alignItems: "center", justifyContent: "center",
                perspective: "2000px",
                pointerEvents: "none",
              }}>
                <div style={{
                  display: "inline-flex",
                  transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                  transformStyle: "preserve-3d" as const,
                }}>
                  {LETTERS.map((ch, li) => {
                    const washCenter = 16 + li * 4;
                    const washSpread = 7;
                    const dist = (bf - washCenter) / washSpread;
                    const washBright = Math.exp(-dist * dist * 2.5);
                    const gR = 255, gG = Math.round(255 - washBright * 95), gB = Math.round(255 - washBright * 170);
                    const scaleKick = 1 + washBright * 0.04;
                    const glowAmt = washBright * 35;
                    return (
                      <span key={li} style={{
                        fontFamily: FONT, fontSize: 200, fontWeight: 800,
                        color: `rgb(${gR},${gG},${gB})`,
                        letterSpacing: -8,
                        display: "inline-block",
                        transform: `scale(${scaleKick})`,
                        textShadow: glowAmt > 1 ? `0 0 ${glowAmt}px ${C.accent}80, 0 0 ${glowAmt * 2.5}px ${C.accent}30` : undefined,
                      }}>{ch}</span>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* ── CTA: Tagline word-by-word unfurl ── */}
          {frame >= BRAND_SOLID + 20 && (() => {
            const WORDS = ["Motion", "Design", "Platform"];
            const bf = frame - BRAND_SOLID - 20;
            return (
              <div style={{
                position: "absolute", left: 0, right: 0, top: CY + 120,
                textAlign: "center",
                display: "flex", justifyContent: "center", gap: 20,
              }}>
                {WORDS.map((w, wi) => {
                  const wordP = spring({ frame: Math.max(0, bf - wi * 8), fps, config: { stiffness: 100, damping: 14, mass: 0.7 } });
                  const blurAmt = (1 - wordP) * 6;
                  return (
                    <span key={wi} style={{
                      fontFamily: FONT, fontSize: 56, fontWeight: 500,
                      color: C.textMid, letterSpacing: 4, textTransform: "uppercase" as const,
                      opacity: wordP,
                      transform: `translateY(${(1 - wordP) * 40}px)`,
                      filter: blurAmt > 0.5 ? `blur(${blurAmt}px)` : undefined,
                      display: "inline-block",
                    }}>{w}</span>
                  );
                })}
              </div>
            );
          })()}

          {/* ── CTA: Draw-on accent line ── */}
          {frame >= BRAND_SOLID + 35 && (() => {
            const lineP = clamp01((frame - BRAND_SOLID - 35) / 20);
            const lineEased = 1 - Math.pow(1 - lineP, 3);
            const lineW = lineEased * 600;
            return (
              <div style={{
                position: "absolute",
                left: CX - lineW / 2, top: CY + 90,
                width: lineW, height: 3, borderRadius: 2,
                background: `linear-gradient(90deg, transparent, ${C.accent}, transparent)`,
                opacity: lineEased * 0.7,
                boxShadow: `0 0 ${lineEased * 20}px ${C.accent}40`,
              }} />
            );
          })()}

          {/* ── CTA: Orbiting colored dots ── */}
          {frame >= BRAND_SOLID + 40 && (() => {
            const dotColors = [C.accent, C.cyan, C.emerald, C.rose, C.amber];
            const orbitP = clamp01((frame - BRAND_SOLID - 40) / 20);
            return dotColors.map((col, di) => {
              const orbitR = 320 + di * 50;
              const speed = 0.008 + di * 0.003;
              const phase = (di / dotColors.length) * Math.PI * 2;
              const angle = frame * speed + phase;
              const dx = CX + orbitR * Math.cos(angle);
              const dy = CY - 10 + (orbitR * 0.35) * Math.sin(angle);
              const dotSize = 6 + (di % 3) * 3;
              const behind = Math.sin(angle) > 0;
              return (
                <div key={di} style={{
                  position: "absolute",
                  left: dx - dotSize / 2, top: dy - dotSize / 2,
                  width: dotSize, height: dotSize, borderRadius: "50%",
                  background: col,
                  opacity: orbitP * (behind ? 0.25 : 0.6),
                  boxShadow: `0 0 ${dotSize * 2}px ${col}50`,
                  pointerEvents: "none",
                }} />
              );
            });
          })()}

        </AbsoluteFill>
      </SceneFade>

      {/* ── Blob + goo morph text layer (ON TOP) — SVG text IS the brand ── */}
      <svg width={W} height={H} style={{
        position: "absolute", left: 0, top: 0, pointerEvents: "none",
        opacity: blobFadeIn,
      }}>
        <defs>
          <filter id={GOO_FILTER_ID}>
            <feGaussianBlur in="SourceGraphic" stdDeviation={Math.max(0, gooBlur)} result="blur" />
            <feColorMatrix in="blur" mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -10" />
          </filter>
        </defs>
        <g filter={frame < BRAND_SOLID ? `url(#${GOO_FILTER_ID})` : undefined}>
          {blobCircles}
          {textMorphOpacity > 0.01 && (
            <text x={CX} y={CY} textAnchor="middle" dominantBaseline="central"
              fontSize={200} fontWeight={800} fontFamily={FONT}
              fill={C.text} fillOpacity={textMorphOpacity}
              letterSpacing={-8}>
              Animly
            </text>
          )}
        </g>
      </svg>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S4: FEATURES — Live spring demos inside cards + dot grid + draw-on
// Techniques: Spring physics demos, procedural dot grid, tapered draw-on
// ═══════════════════════════════════════════════════════════════════════════════

// Mini spring demo: a ball bouncing on a spring
const SpringDemo: React.FC<{ frame: number; fps: number; active: boolean }> = ({ frame: f, fps, active }) => {
  if (!active) return null;
  const p = spring({ frame: f, fps, config: { stiffness: 120, damping: 8, mass: 0.6 } });
  const y = 120 - p * 100;
  const squish = p > 0.95 ? 1 : 1 + (1 - p) * 0.15;
  return (
    <svg width={200} height={160} viewBox="0 0 200 160">
      {/* Spring coils */}
      <path d={`M100,140 ${Array.from({ length: 6 }, (_, i) => {
        const cy = 140 - (i + 1) * (120 - y) / 7;
        const cx = i % 2 === 0 ? 70 : 130;
        return `L${cx},${cy}`;
      }).join(" ")} L100,${y + 14}`}
        fill="none" stroke={C.accent} strokeWidth={3} opacity={0.5} />
      {/* Ball */}
      <ellipse cx={100} cy={y} rx={14 * squish} ry={14 / squish} fill={C.accent} />
      {/* Ground line */}
      <line x1={40} y1={142} x2={160} y2={142} stroke={C.textDim} strokeWidth={2} opacity={0.3} />
    </svg>
  );
};

// Mini stagger demo: 3 elements cascading in
const StaggerDemo: React.FC<{ frame: number; fps: number; active: boolean }> = ({ frame: f, fps, active }) => {
  if (!active) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-end", height: 120 }}>
      {[0, 1, 2].map(i => {
        const p = spring({ frame: Math.max(0, f - i * 8), fps, config: SPR.ui });
        return (
          <div key={i} style={{
            width: 48, height: 30 + i * 20, borderRadius: 8,
            background: [C.accent, C.cyan, C.emerald][i],
            opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${0.8 + p * 0.2})`,
          }} />
        );
      })}
    </div>
  );
};

// Mini glow demo: breathing glow with dual frequency
const GlowDemo: React.FC<{ frame: number; active: boolean }> = ({ frame: f, active }) => {
  if (!active) return null;
  const glow = 0.4 + 0.35 * Math.sin(f * 0.06) + 0.25 * Math.sin(f * 0.11);
  return (
    <div style={{
      width: 80, height: 80, borderRadius: 40,
      background: C.accent,
      boxShadow: `0 0 ${20 + glow * 40}px ${C.accent}, 0 0 ${40 + glow * 60}px ${C.accentGlow}`,
      opacity: 0.6 + glow * 0.4,
      transform: `scale(${0.9 + glow * 0.15})`,
    }} />
  );
};

const FEATURES = [
  { icon: null, title: "Spring Physics", desc: "Real mass, damping,\nand stiffness.", color: C.accent, demo: "spring" },
  { icon: null, title: "Smart Choreography", desc: "Elements that know\nabout each other.", color: C.cyan, demo: "stagger" },
  { icon: null, title: "Polish Engine", desc: "Secondary motion,\nglow, depth.", color: C.emerald, demo: "glow" },
] as const;

const S4Features: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const gridP = easeOut4(clamp01(frame / 40));

  const boxW = 960;
  const gap = 80;
  const totalW = 3 * boxW + 2 * gap;
  const startX = (W - totalW) / 2;

  return (
    <SceneFade dur={140}>
      <AbsoluteFill style={{ background: C.bg }}>
        {/* Dot grid — waves from headline position */}
        <DotGrid progress={gridP} originX={CX} originY={260} dotColor={C.cyan} breatheFrame={frame} />

        <WordLine
          words={[
            { text: "Built", weight: 400, color: C.textMid },
            { text: "for", weight: 400, color: C.textMid },
            { text: "motion", weight: 700, color: C.accent },
            { text: "designers.", weight: 700, color: C.text },
          ]}
          y={260} size={108} stagger={8} baseDelay={4}
          defaultColor={C.text} fontFamily={FONT} springConfig={SPR.text}
        />

        {/* Tapered accent lines under headline */}
        <TaperedLine x1={CX - 300} y1={380} x2={CX + 300} y2={380}
          progress={spring({ frame: Math.max(0, frame - 30), fps, config: SPR.heavy })}
          color={C.accent} maxWidth={4} />

        {/* Feature cards with live demos */}
        {FEATURES.map((f, i) => {
          const delay = 18 + i * 10;
          const cardP = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.ui });
          const demoActive = frame > delay + 15;
          const demoFrame = Math.max(0, frame - delay - 15);

          const breathe = Math.sin(frame * 0.03 + i * 1.5) * 0.3 + 0.7;

          return (
            <div key={i} style={{
              position: "absolute",
              left: startX + i * (boxW + gap), top: 480,
              width: boxW, height: 820, borderRadius: 40,
              background: C.surface, border: `2px solid ${f.color}20`,
              boxShadow: `0 0 ${30 * breathe}px ${f.color}15, 0 16px 64px rgba(0,0,0,0.3)`,
              opacity: cardP,
              transform: `translateY(${(1 - cardP) * 120}px) scale(${0.92 + cardP * 0.08})`,
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "56px 48px", gap: 28,
            }}>
              {/* Live demo area */}
              <div style={{
                width: 240, height: 180, borderRadius: 20,
                background: `${f.color}08`, border: `1px solid ${f.color}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {f.demo === "spring" && <SpringDemo frame={demoFrame} fps={fps} active={demoActive} />}
                {f.demo === "stagger" && <StaggerDemo frame={demoFrame} fps={fps} active={demoActive} />}
                {f.demo === "glow" && <GlowDemo frame={demoFrame} active={demoActive} />}
              </div>

              {/* Title */}
              <div style={{
                fontFamily: FONT, fontSize: 48, fontWeight: 700,
                color: C.text, textAlign: "center",
                opacity: cardP, transform: `translateY(${(1 - cardP) * 16}px)`,
              }}>{f.title}</div>

              {/* Accent line under title */}
              <div style={{
                width: 60, height: 3, borderRadius: 2, background: f.color,
                opacity: cardP * 0.5, transform: `scaleX(${cardP})`,
              }} />

              {/* Description */}
              <div style={{
                fontFamily: FONT, fontSize: 30, fontWeight: 400, color: C.textDim,
                textAlign: "center", lineHeight: 1.6, whiteSpace: "pre-line",
                opacity: cardP * 0.8,
              }}>{f.desc}</div>

              {/* Top glow bar */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 5,
                background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
                opacity: cardP * 0.4 * breathe, borderRadius: "40px 40px 0 0",
              }} />
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S5: CTA — "Motion, perfected."
// ═══════════════════════════════════════════════════════════════════════════════

const S5CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgP = easeOut4(clamp01(frame / 15));
  const bgR = Math.round(8 + (139 - 8) * bgP * 0.35);
  const bgG = Math.round(9 + (92 - 9) * bgP * 0.35);
  const bgB = Math.round(14 + (246 - 14) * bgP * 0.35);

  const brandP = spring({ frame: Math.max(0, frame - 10), fps, config: SPR.hero });
  const ctaP = spring({ frame: Math.max(0, frame - 35), fps, config: { stiffness: 180, damping: 16, mass: 0.7 } });
  const glowBreath = Math.sin(frame * 0.05) * 0.3 + 0.7;

  return (
    <SceneFade dur={100}>
      <AbsoluteFill style={{ background: `rgb(${bgR},${bgG},${bgB})` }}>
        <div style={{
          position: "absolute", left: CX - 500, top: CY - 400,
          width: 1000, height: 800, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accent}, transparent 65%)`,
          opacity: 0.08 * glowBreath, filter: "blur(80px)",
        }} />

        <div style={{
          position: "absolute", left: 0, right: 0, top: CY - 300, textAlign: "center",
          opacity: brandP, transform: `scale(${0.95 + brandP * 0.05})`,
          filter: brandP < 0.95 ? `blur(${(1 - brandP) * 8}px)` : undefined,
        }}>
          <span style={{ fontFamily: FONT, fontSize: 180, fontWeight: 800, color: C.text, letterSpacing: -6 }}>
            Animly
          </span>
        </div>

        {/* Tagline — 100px below brand bottom edge */}
        <div style={{ position: "absolute", left: 0, right: 0, top: CY + 10, textAlign: "center" }}>
          <WordLine
            words={[
              { text: "Motion,", weight: 600, color: C.textMid },
              { text: "perfected.", weight: 700, color: C.text },
            ]}
            y={0} size={72} stagger={12} baseDelay={20}
            defaultColor={C.textMid} fontFamily={FONT} springConfig={SPR.text}
          />
        </div>

        {/* CTA button — 130px below tagline */}
        <div style={{ position: "absolute", left: 0, right: 0, top: CY + 180, textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            padding: "28px 80px", borderRadius: 60, background: C.accent,
            fontFamily: FONT, fontSize: 48, fontWeight: 600, color: C.text, letterSpacing: -1,
            boxShadow: `0 0 ${30 * glowBreath}px ${C.accentGlow}, 0 12px 40px rgba(0,0,0,0.3)`,
            opacity: ctaP, transform: `scale(${0.9 + ctaP * 0.1})`,
          }}>
            Try Animly free →
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════

export const AnimlyAdCues: CueEvent[] = [
  { id: "animly-cue-1", frame: 0,   duration: 1,  type: "SCENE_CUT",  label: "S1 Hook — CRT screen boots",          intensity: "hard",
    notes: "cinematic low hit with CRT hum" },
  { id: "animly-cue-2", frame: 128, duration: 15, type: "HERO_ENTRY",  label: "Rush zoom pulls camera in",           intensity: "hard",
    notes: "rising whoosh building to impact" },
  { id: "animly-cue-3", frame: 146, duration: 1,  type: "SCENE_CUT",  label: "S2 Problem — cursor appears",          intensity: "hard",
    notes: "transition whoosh, clean cut" },
  { id: "animly-cue-4", frame: 208, duration: 15, type: "HERO_ENTRY",  label: "First bad-motion card enters",        intensity: "medium",
    notes: "card slide in, UI element arrival" },
  { id: "animly-cue-5", frame: 301, duration: 15, type: "WIPE",        label: "Cards melt + vortex begins",          intensity: "hard",
    notes: "metallic sweep, distortion onset" },
  { id: "animly-cue-6", frame: 376, duration: 1,  type: "SCENE_CUT",  label: "S3 Reveal — vortex explosion",         intensity: "hard",
    notes: "deep boom + shockwave reverb tail" },
  { id: "animly-cue-7", frame: 496, duration: 15, type: "HERO_ENTRY",  label: "Blobs converge to letter positions",  intensity: "medium",
    notes: "accelerating swirl, gathering energy" },
  { id: "animly-cue-8", frame: 563, duration: 15, type: "TEXT_IMPACT", label: "Animly brand solidifies",              intensity: "hard",
    notes: "sharp snap impact, crystalline lock" },
  { id: "animly-cue-9", frame: 583, duration: 15, type: "CTA_REVEAL",  label: "Tagline — Motion Design Platform",    intensity: "medium",
    notes: "bright chime, inviting resolution" },
];

export const AnimlyAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      <Sequence from={0} durationInFrames={156}>
        <S1Hook />
      </Sequence>
      <Sequence from={146} durationInFrames={258}>
        <S2Problem />
      </Sequence>
      <Sequence from={376} durationInFrames={330}>
        <S3Reveal />
      </Sequence>
      <FilmGrain opacity={0.16} />
    </AbsoluteFill>
  );
};
