/**
 * AuraSalonAd — "Transform Your Look."
 *
 * High-end beauty salon ad for Aurore Hair & Beauty.
 * Kinetic object-based transitions — every cut is motivated by something in the scene.
 * One continuous flowing visual journey through a luxury salon.
 *
 * Transition system:
 *  T1→2  Scissors wipe      — blades slice a vertical slit that expands into salon interior
 *  T2→3  Blow dryer entry   — dryer enters right side of frame, Scene 2 yields
 *  T3→4  Airflow diagonal   — air particles sweep diagonally, diagonal wipe reveals hair scene
 *  T4→5  Hair diagonal sweep— flowing strands wipe diagonally to reveal curl close-up
 *  T5→6  Spiral iris        — spiral expands to circular iris that opens CTA
 *
 * Format:  9:16 vertical (1080 × 1920)
 * Duration: 540 frames @ 30fps = 18 seconds
 *
 * Scene breakdown:
 *  S1  Scissors  (  0– 90f  3.0s)  Scissors snap + vertical wipe entrance
 *  S2  Salon     ( 90–225f  4.5s)  Salon interior — parallax glide, mirrors, warm light
 *  S3  BlowDryer (225–315f  3.0s)  Blow dryer hero + airflow particle burst
 *  S4  HairFlow  (315–405f  3.0s)  Flowing hair strands — diagonal wipe morph
 *  S5  Curl      (405–480f  2.5s)  Curling iron + spiral drawing — expands to iris
 *  S6  CTA       (480–540f  2.0s)  Mirror iris opens → brand outro + CTA
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
  useBreathingGlow,
  usePremiumFadeOut,
} from "../utils/premiumMotion";
import { ThreeScene, ParticleField } from "../utils/three";

// ─── 3D Particle constants for AuraSalonAd (1080×1920 canvas) ────────────────
// Camera: fov=40, cameraZ=6 → frustum height = 4.37 units at z=0
// 1920px canvas height → 1 world unit = 1920/4.37 ≈ 439px (vertical)
// 1080px canvas width  → 1 world unit = 1080/2.46 ≈ 439px (horizontal, same PPU)
const AURA_PPU = 439;

// NOZZLE_X=500, NOZZLE_Y=680 on 1080×1920 canvas.
// Canvas center: (540, 960). CSS offset: (-40, -280).
// World coords: x=-40/439≈-0.091, y=+280/439≈0.638 (Three.js Y is up, flip CSS Y).
const NOZZLE_WORLD: [number, number, number] = [-40 / AURA_PPU, 280 / AURA_PPU, 0];

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        "#F8F4EF",
  bgWarm:    "#F0EAE0",
  dark:      "#18130F",
  darkCTA:   "#110D0A",
  gold:      "#C49552",
  goldSoft:  "rgba(196,149,82,0.18)",
  goldMid:   "rgba(196,149,82,0.40)",
  ink:       "#18130F",
  body:      "rgba(24,19,15,0.44)",
  bodyLight: "rgba(248,244,239,0.52)",
  white:     "#FEFDFB",
  mirror:    "#ECE7E0",
} as const;

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── Stable Pseudo-Random (avoids Math.random() in render) ───────────────────
const sr = (seed: number): number => ((seed * 1.6180339887) % 1 + 1) % 1;

// ─── Pre-computed Data Arrays ─────────────────────────────────────────────────
// Blow dryer nozzle is at approx canvas pos (500, 680) based on dryer placement
const NOZZLE_X = 500;
const NOZZLE_Y = 680;

const AIR_PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  angleRad: (sr(i * 7)  * 70 - 35) * (Math.PI / 180),
  size:      5 + sr(i * 17) * 13,
  delay:     Math.floor(sr(i * 5)  * 22),
  alpha:     0.40 + sr(i * 19) * 0.40,
  xOff:      sr(i * 23) * 60 - 30,
  yOff:      sr(i * 29) * 50 - 25,
}));

const HAIR_STRANDS = Array.from({ length: 20 }, (_, i) => ({
  xPct:     (i / 20) * 112 - 6,
  angleDeg: -17 - sr(i * 7) * 9,
  widthPx:  1 + sr(i * 11) * 3,
  delay:    Math.floor(sr(i * 5) * 14),
  opacity:  0.52 + sr(i * 13) * 0.42,
  colorIdx: i % 3,
  drift:    sr(i * 17) * 8 - 4,
}));

const STRAND_COLORS = ["#2A1810", C.gold, "#5A3420"];

const SPARKLES = Array.from({ length: 16 }, (_, i) => ({
  xPct:   12 + sr(i * 7)  * 76,
  yPct:   12 + sr(i * 11) * 76,
  size:   2.5 + sr(i * 5)  * 5,
  delay:  Math.floor(sr(i * 3) * 20),
  period: 55 + sr(i * 13) * 70,
  phase:  sr(i * 17) * Math.PI * 2,
}));

// ─── Spiral Path Generator ────────────────────────────────────────────────────
function spiralD(
  cx: number, cy: number,
  turns: number, startR: number, endR: number,
  steps = 120,
): string {
  const totalAngle = turns * 2 * Math.PI;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t     = i / steps;
    const angle = t * totalAngle - Math.PI / 2;
    const r     = startR + (endR - startR) * t;
    const x     = cx + Math.cos(angle) * r;
    const y     = cy + Math.sin(angle) * r;
    pts.push(i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `L ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return pts.join(" ");
}

function spiralLength(
  cx: number, cy: number,
  turns: number, startR: number, endR: number,
  steps = 120,
): number {
  const totalAngle = turns * 2 * Math.PI;
  let len = 0;
  let prevX = cx;
  let prevY = cy - startR;
  for (let i = 1; i <= steps; i++) {
    const t     = i / steps;
    const angle = t * totalAngle - Math.PI / 2;
    const r     = startR + (endR - startR) * t;
    const x     = cx + Math.cos(angle) * r;
    const y     = cy + Math.sin(angle) * r;
    const dx    = x - prevX;
    const dy    = y - prevY;
    len        += Math.sqrt(dx * dx + dy * dy);
    prevX = x;
    prevY = y;
  }
  return len;
}

// Pre-compute spiral at module load (cheap — 120 iterations)
const CURL_CX   = 540;
const CURL_CY   = 720;
const SPIRAL_D  = spiralD(CURL_CX, CURL_CY, 3, 18, 200);
const SPIRAL_LEN = spiralLength(CURL_CX, CURL_CY, 3, 18, 200);

// ─── Sub-component: Scissors SVG ──────────────────────────────────────────────
const ScissorsSVG: React.FC<{ angle: number }> = ({ angle }) => (
  <svg width="260" height="500" viewBox="0 0 200 440" overflow="visible">
    {/* UPPER BLADE — rotates upward */}
    <g transform={`rotate(${-angle} 100 240)`}>
      <path
        d="M 94 240 L 96 100 C 97 65 100 45 100 45 C 100 45 103 65 104 100 L 106 240 Z"
        fill={C.ink}
        opacity={0.88}
      />
      <path
        d="M 100 45 C 103 65 104 100 106 240"
        stroke="rgba(220,210,200,0.28)"
        strokeWidth={1.5}
        fill="none"
      />
      <path
        d="M 100 45 C 97 65 96 100 95 240"
        stroke={C.gold}
        strokeWidth={0.9}
        fill="none"
        opacity={0.55}
      />
      <circle cx="100" cy="340" r="38" fill="none" stroke={C.ink} strokeWidth={13} />
      <path
        d="M 72 325 Q 78 312 87 318"
        stroke="rgba(210,205,198,0.42)"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
    </g>

    {/* LOWER BLADE — rotates downward */}
    <g transform={`rotate(${angle} 100 240)`}>
      <path
        d="M 94 240 L 96 100 C 97 65 100 45 100 45 C 100 45 103 65 104 100 L 106 240 Z"
        fill={C.ink}
        opacity={0.82}
      />
      <path
        d="M 100 45 C 97 65 96 100 94 240"
        stroke="rgba(255,252,248,0.18)"
        strokeWidth={1.5}
        fill="none"
      />
      <circle cx="100" cy="340" r="38" fill="none" stroke={C.ink} strokeWidth={13} />
      <path
        d="M 72 325 Q 78 312 87 318"
        stroke="rgba(210,205,198,0.32)"
        strokeWidth={3.5}
        fill="none"
        strokeLinecap="round"
      />
    </g>

    {/* Pivot bar */}
    <rect x="85" y="232" width="30" height="16" rx="5" fill={C.ink} opacity={0.55} />

    {/* Gold screw */}
    <circle cx="100" cy="240" r="9" fill={C.gold} />
    <circle cx="100" cy="240" r="3.5" fill={C.dark} opacity={0.75} />
    <line x1="96.5" y1="240" x2="103.5" y2="240" stroke={C.dark} strokeWidth={1.2} opacity={0.6} />
  </svg>
);

// ─── Sub-component: Blow Dryer ────────────────────────────────────────────────
const BlowDryer: React.FC = () => (
  <div style={{ position: "relative", width: 340, height: 240 }}>
    {/* Barrel */}
    <div
      style={{
        position: "absolute",
        width: 260, height: 100,
        borderRadius: 50,
        background: `linear-gradient(135deg, #2E2420 0%, ${C.dark} 100%)`,
        top: 20, left: 0,
        boxShadow: `0 8px 32px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {/* Nozzle end */}
      <div
        style={{
          position: "absolute",
          left: -14, top: "18%", bottom: "18%",
          width: 24, borderRadius: "8px 0 0 8px",
          background: `linear-gradient(90deg, #3A2E28, #2A2018)`,
          boxShadow: `-2px 0 8px rgba(0,0,0,0.20)`,
        }}
      />
      {/* Ventilation slits */}
      {[0.28, 0.42, 0.56].map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${x * 100}%`,
            top: "22%", bottom: "22%",
            width: 3, borderRadius: 2,
            background: "rgba(0,0,0,0.35)",
          }}
        />
      ))}
      {/* Gold accent band */}
      <div
        style={{
          position: "absolute",
          top: "35%", bottom: "35%",
          left: "65%", width: "10%",
          background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)`,
          borderRadius: 4,
        }}
      />
      {/* Surface sheen */}
      <div
        style={{
          position: "absolute",
          top: 0, bottom: 0, left: "5%", width: "35%",
          borderRadius: "inherit",
          background: `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 60%)`,
        }}
      />
    </div>

    {/* Handle */}
    <div
      style={{
        position: "absolute",
        width: 68, height: 160,
        borderRadius: 34,
        background: `linear-gradient(180deg, #2E2420 0%, #1A130E 100%)`,
        top: 95, left: 170,
        transform: "rotate(-8deg)",
        boxShadow: `3px 6px 18px rgba(0,0,0,0.28)`,
      }}
    >
      {[0.35, 0.52, 0.68].map((y, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${y * 100}%`, left: "18%", right: "18%",
            height: 2.5, borderRadius: 2,
            background: "rgba(0,0,0,0.30)",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          top: "22%", left: "20%", right: "20%", height: 1.5,
          background: `linear-gradient(90deg, transparent, ${C.gold}55, transparent)`,
        }}
      />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — SCISSORS  (frames 0–90, 3s)
//
// Cream background. "AURORE · HAIR & BEAUTY" eyebrow. Large SVG scissors.
// Blades open slowly → snap shut (the snip) → spring open wide.
// Flash at snip. A thin vertical cut-line appears then expands —
// the cut becomes Scene 2's entrance trigger.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneScissors: React.FC = () => {
  const frame    = useCurrentFrame();
  const fadeOut  = usePremiumFadeOut(90, 18);
  const appear   = easeOut4(clamp(frame / 18, 0, 1));
  const glow     = useBreathingGlow(100, 0.5, 1.0);
  const bgT      = easeOut3(clamp(frame / 22, 0, 1));
  const eyebrow  = useCinematicTextReveal(4, 10, 4);
  const subText  = useCinematicTextReveal(16, 14, 6);

  // Blade angle: slightly open → snip close → spring open wide
  const bladeAngle = interpolate(
    frame,
    [0, 14, 28, 44, 60, 90],
    [24, 22,  3, 50, 57, 62],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Flash at snip moment (frame 28)
  const snipFlash = Math.max(0, 1 - Math.abs(frame - 28) / 5) * 0.50;

  // Vertical cut line after snip
  const vertLineA = easeOut3(clamp((frame - 34) / 10, 0, 1)) *
    (1 - easeOut3(clamp((frame - 56) / 20, 0, 1)));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Warm ambient ceiling light */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 500px at 50% 5%,
            rgba(196,149,82,${0.07 * bgT * glow}) 0%, transparent 60%)`,
        }}
      />

      {/* Snip flash */}
      {snipFlash > 0 && (
        <AbsoluteFill
          style={{ background: `rgba(255,252,248,${snipFlash})` }}
        />
      )}

      {/* Vertical cut line */}
      <div
        style={{
          position: "absolute", left: "50%", top: 0, bottom: 0, width: 1.5,
          transform: "translateX(-50%)",
          background: `linear-gradient(to bottom,
            transparent 8%, ${C.ink} 18%, ${C.ink} 82%, transparent 92%)`,
          opacity: vertLineA,
        }}
      />

      {/* Eyebrow */}
      <div
        style={{
          position: "absolute", top: 160, left: 0, right: 0, textAlign: "center",
          opacity: eyebrow.opacity,
          transform: `translateY(${eyebrow.translateY}px)`,
          filter: `blur(${eyebrow.blur}px)`,
        }}
      >
        <span
          style={{
            fontSize: 13, fontWeight: 700, color: C.gold, fontFamily: SANS,
            letterSpacing: "0.22em", textTransform: "uppercase" as const,
          }}
        >
          Aurore · Hair & Beauty
        </span>
      </div>

      {/* Scissors */}
      <div
        style={{
          position: "absolute", left: "50%", top: "46%",
          transform: `translateX(-50%) translateY(-50%) scale(${0.15 + appear * 0.85})`,
          opacity: appear,
          filter: `drop-shadow(0 20px 40px rgba(24,19,15,0.18))`,
        }}
      >
        <ScissorsSVG angle={bladeAngle} />
      </div>

      {/* Sub copy */}
      <div
        style={{
          position: "absolute", bottom: 240, left: 0, right: 0, textAlign: "center",
          opacity: subText.opacity * (1 - easeOut3(clamp((frame - 62) / 18, 0, 1))),
          transform: `translateY(${subText.translateY}px)`,
          filter: `blur(${subText.blur}px)`,
        }}
      >
        <div
          style={{
            fontSize: 24, fontWeight: 300, fontFamily: SANS, color: C.body,
            letterSpacing: "0.10em",
          }}
        >
          Precision. Art. Transformation.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — SALON INTERIOR  (frames 90–225, 4.5s)
//
// ENTRANCE: Vertical wipe expanding from center — the scissors cut "opens"
// revealing the salon interior through the gap.
// Warm salon: two large floor-to-ceiling mirrors, styling counter, warm ceiling.
// Camera glide leftward (slow horizontal pan) with 3-layer parallax.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneSalon: React.FC = () => {
  const frame      = useCurrentFrame();
  const fadeOut    = usePremiumFadeOut(135, 18);
  const mirrorGlow = useBreathingGlow(130, 0.55, 1.0);
  const eyebrow    = useCinematicTextReveal(22, 12, 5);
  const headline   = useCinematicTextReveal(32, 20, 9);
  const sub        = useCinematicTextReveal(50, 14, 6);

  // ENTRANCE: vertical wipe from center (scissors cut opening)
  const wipeT    = easeOut5(clamp(frame / 22, 0, 1));
  const halfW    = wipeT * 52;
  const clipPath = `polygon(${50 - halfW}% 0%, ${50 + halfW}% 0%, ${50 + halfW}% 100%, ${50 - halfW}% 100%)`;

  // Slow horizontal camera glide: content drifts left
  const glideT   = easeInOut3(clamp(frame / 135, 0, 1));
  const camX     = glideT * -55;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      {/* === BACKGROUND — warm salon wall === */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, #EDE7DC 0%, ${C.bg} 40%, #E8DFD0 100%)`,
          transform: `translateX(${camX * 0.28}px)`,
        }}
      />

      {/* Warm ceiling light bloom */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 500px at 50% 0%,
            rgba(255,235,185,0.15) 0%, transparent 55%)`,
          transform: `translateX(${camX * 0.28}px)`,
        }}
      />

      {/* === WALL MIRRORS — background layer === */}
      {[
        { left: 55,  top: 260, w: 360, h: 580, speed: 0.32 },
        { left: 490, top: 260, w: 360, h: 580, speed: 0.36 },
        { left: 930, top: 290, w: 210, h: 500, speed: 0.40, opacity: 0.6 },
      ].map((m, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: m.left, top: m.top, width: m.w, height: m.h,
            borderRadius: 6,
            background: `linear-gradient(148deg,
              rgba(245,240,234,0.90) 0%,
              rgba(255,254,252,0.80) 45%,
              rgba(238,232,224,0.88) 100%)`,
            border: `2.5px solid rgba(196,149,82,0.28)`,
            boxShadow: `0 4px 40px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.75)`,
            overflow: "hidden",
            opacity: m.opacity ?? 1,
            transform: `translateX(${camX * m.speed}px)`,
          }}
        >
          {/* Mirror sheen sweep 1 */}
          <div
            style={{
              position: "absolute", top: 0, bottom: 0, left: "12%", width: "22%",
              background: `linear-gradient(90deg, transparent,
                rgba(255,255,255,${0.32 * mirrorGlow}), transparent)`,
              transform: "skewX(-7deg)",
            }}
          />
          {/* Mirror sheen sweep 2 */}
          <div
            style={{
              position: "absolute", top: 0, bottom: 0, left: "55%", width: "12%",
              background: `linear-gradient(90deg, transparent,
                rgba(255,255,255,${0.18 * mirrorGlow}), transparent)`,
              transform: "skewX(-5deg)",
            }}
          />
          {/* Gold top accent bar */}
          <div
            style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 4,
              background: `linear-gradient(90deg,
                rgba(196,149,82,0.30), rgba(196,149,82,0.70), rgba(196,149,82,0.30))`,
            }}
          />
          {/* Gold bottom accent bar */}
          <div
            style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(90deg,
                rgba(196,149,82,0.20), rgba(196,149,82,0.50), rgba(196,149,82,0.20))`,
            }}
          />
        </div>
      ))}

      {/* === STYLING COUNTER — midground layer === */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: -60, right: -60, height: 540,
          transform: `translateX(${camX * 0.55}px)`,
        }}
      >
        {/* Counter top surface */}
        <div
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, height: 60,
            background: `linear-gradient(180deg, #DACED8 0%, #C8C0B4 100%)`,
            borderTop: `2px solid rgba(196,149,82,0.38)`,
            boxShadow: `0 -4px 20px rgba(0,0,0,0.07)`,
          }}
        >
          {/* Tool silhouettes on counter */}
          {[
            { left: 80,  w: 52, h: 24, rot: -14 },
            { left: 190, w: 12, h: 54, rot: -22 },
            { left: 480, w: 46, h: 22, rot:   8 },
            { left: 680, w: 36, h: 18, rot:  -6 },
          ].map((t, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: t.left, bottom: 6, width: t.w, height: t.h,
                borderRadius: Math.min(t.w, t.h) / 2,
                background: `linear-gradient(135deg, #2A1E18, #18130F)`,
                transform: `rotate(${t.rot}deg)`,
                boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
              }}
            />
          ))}
        </div>

        {/* Cabinet body */}
        <div
          style={{
            position: "absolute",
            top: 60, left: 0, right: 0, bottom: 0,
            background: `linear-gradient(180deg, #D0C8BC 0%, #B8B0A4 100%)`,
          }}
        >
          {/* Cabinet door panels */}
          {[70, 270, 470, 670, 870].map((x, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x, top: 18, width: 165, bottom: 20,
                border: `1px solid rgba(0,0,0,0.08)`,
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
          bottom: 540, left: 0, right: 0, height: 1,
          background: `rgba(196,149,82,0.18)`,
        }}
      />

      {/* === FOREGROUND TEXT — closest to camera === */}
      <div
        style={{
          position: "absolute",
          left: 80, right: 80, bottom: 165,
          transform: `translateX(${camX * 1.0}px)`,
        }}
      >
        <div
          style={{
            fontSize: 12, fontWeight: 700, color: C.gold, fontFamily: SANS,
            letterSpacing: "0.20em", textTransform: "uppercase" as const,
            marginBottom: 18,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          Premium Experience
        </div>

        {["Where beauty", "is perfected."].map((line, i) => {
          const t = i === 0 ? headline : sub;
          return (
            <div
              key={i}
              style={{
                fontSize: 62, fontWeight: 800, fontFamily: SANS,
                color: i === 0 ? C.ink : C.gold,
                letterSpacing: -2.8, lineHeight: 0.92,
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
            letterSpacing: "0.02em",
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          A sanctuary of style and elegance.
        </div>
      </div>

      {/* Scissors-wipe gold edge lines — visible while wipe is still expanding */}
      {halfW < 52 && halfW > 0 && (
        <>
          <div
            style={{
              position: "absolute", top: 0, bottom: 0,
              left: `calc(${50 - halfW}% - 1px)`, width: 2,
              background: `linear-gradient(to bottom,
                transparent 6%, ${C.goldMid} 16%, ${C.goldMid} 84%, transparent 94%)`,
              opacity: 1 - wipeT,
            }}
          />
          <div
            style={{
              position: "absolute", top: 0, bottom: 0,
              left: `calc(${50 + halfW}% - 1px)`, width: 2,
              background: `linear-gradient(to bottom,
                transparent 6%, ${C.goldMid} 16%, ${C.goldMid} 84%, transparent 94%)`,
              opacity: 1 - wipeT,
            }}
          />
        </>
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — BLOW DRYER  (frames 225–315, 3s)
//
// Dark warm background. Blow dryer is the unmistakable hero.
// Slides in from right. Air flow lines emerge from the nozzle.
// 22 pre-defined golden "airflow" particles burst outward — elongated and
// glowing, they resemble both sparks and hair fibers.
// Scene fades; particles fill frame and hand off to diagonal wipe of Scene 4.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneBlowDryer: React.FC = () => {
  const frame    = useCurrentFrame();
  const fadeOut  = usePremiumFadeOut(90, 16);
  const bgT      = easeOut3(clamp(frame / 18, 0, 1));
  const dryerIn  = easeOut4(clamp(frame / 20, 0, 1));
  const blastT   = easeOut3(clamp((frame - 8) / 20, 0, 1));
  const glow     = useBreathingGlow(90, 0.48, 0.96);
  const headline = useCinematicTextReveal(16, 18, 8);
  const sub      = useCinematicTextReveal(30, 14, 6);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Warm dark background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, #1E1610 0%, ${C.dark} 100%)`,
          opacity: bgT,
        }}
      />

      {/* Gold glow halo near nozzle */}
      <div
        style={{
          position: "absolute",
          left: NOZZLE_X - 220, top: NOZZLE_Y - 220,
          width: 440, height: 440,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(196,149,82,${0.14 * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Air flow lines from nozzle (leftward) */}
      {[-30, -15, 0, 15, 30].map((yOff, i) => {
        const lineLen = blastT * (220 + Math.abs(i) * 20);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: NOZZLE_X - lineLen,
              top: NOZZLE_Y + yOff - 1.5,
              width: lineLen,
              height: 2,
              borderRadius: 2,
              background: `linear-gradient(90deg,
                transparent, rgba(196,149,82,${0.36 - Math.abs(i) * 0.06}))`,
              transform: `rotate(${yOff * -0.25}deg)`,
              transformOrigin: "right center",
            }}
          />
        );
      })}

      {/* Airflow particles — GPU-accelerated InstancedMesh via ThreeScene.
          Replaces the 22 inline <div> particles with 350 Three.js particles.
          ThreeCanvas is transparent (alpha=true) so the CSS glow/bg shows through.
          Particle text overlays positioned AFTER ThreeScene in DOM stay on top. */}
      <ThreeScene environment="studio" ambientIntensity={0}>
        {/* Primary gold airflow burst — mimics the original AngleRad spray pattern */}
        <ParticleField
          count={350}
          mode="burst"
          emitterPos={NOZZLE_WORLD}
          burstAngle={Math.PI}
          burstSpread={0.62}
          burstFrame={6}
          burstDuration={52}
          burstDelayRange={22}
          burstLoop={false}
          burstVelocity={0.022}
          color="#FFF0D2"
          size={0.024}
          opacity={0.72}
          speed={1.0}
        />
        {/* Secondary softer gold layer — adds visual depth */}
        <ParticleField
          count={160}
          mode="burst"
          emitterPos={NOZZLE_WORLD}
          burstAngle={Math.PI}
          burstSpread={0.45}
          burstFrame={10}
          burstDuration={48}
          burstDelayRange={18}
          burstLoop={false}
          burstVelocity={0.016}
          color="#C49552"
          size={0.018}
          opacity={0.55}
          speed={0.8}
        />
      </ThreeScene>

      {/* Blow dryer — slides in from right */}
      <div
        style={{
          position: "absolute",
          left: 514, top: 610,
          opacity: dryerIn,
          transform: `translateX(${(1 - dryerIn) * 240}px)`,
          filter: `drop-shadow(0 16px 40px rgba(0,0,0,0.40))`,
        }}
      >
        <BlowDryer />
      </div>

      {/* Text — lower third */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 185 }}>
        <div
          style={{
            fontSize: 12, fontWeight: 700, color: C.gold, fontFamily: SANS,
            letterSpacing: "0.18em", textTransform: "uppercase" as const,
            marginBottom: 16,
            opacity: headline.opacity,
            transform: `translateY(${headline.translateY}px)`,
          }}
        >
          The Art of Styling
        </div>

        {["Feel the", "difference."].map((line, i) => {
          const t = i === 0 ? headline : sub;
          return (
            <div
              key={i}
              style={{
                fontSize: 58, fontWeight: 800, fontFamily: SANS,
                color: i === 0 ? C.white : C.gold,
                letterSpacing: -2.5, lineHeight: 0.92,
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
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — HAIR FLOW  (frames 315–405, 3s)
//
// ENTRANCE: Diagonal wipe from right edge to left (like hair swept by dryer wind).
// 20 hair strands fill the full canvas in a diagonal arrangement — dark browns,
// warm golds. Each strand has a slow sinusoidal drift. Elegant slow motion.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneHairFlow: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 18);
  const bgT     = easeOut3(clamp(frame / 22, 0, 1));
  const glow    = useBreathingGlow(100, 0.5, 0.95);
  const eyebrow  = useCinematicTextReveal(22, 12, 5);
  const headline = useCinematicTextReveal(32, 20, 9);
  const sub      = useCinematicTextReveal(50, 14, 6);

  // ENTRANCE: diagonal wipe — reveals from right edge leftward
  const SLANT = 48;
  const diagT = easeOut5(clamp(frame / 24, 0, 1));
  const raw   = diagT * (100 + SLANT);
  const topX  = 100 - Math.min(100, raw);
  const botX  = 100 - Math.max(0, raw - SLANT);
  const clipPath = `polygon(${topX}% 0%, 100% 0%, 100% 100%, ${botX}% 100%)`;

  return (
    <AbsoluteFill
      style={{
        opacity: fadeOut,
        clipPath,
        WebkitClipPath: clipPath,
      }}
    >
      {/* Warm cream background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, #EDE5D5 0%, ${C.bg} 60%, #E8DFD0 100%)`,
        }}
      />

      {/* Ambient warm glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 600px at 50% 40%,
            rgba(196,149,82,${0.06 * bgT * glow}) 0%, transparent 60%)`,
        }}
      />

      {/* Hair strands — full canvas diagonal arrangement */}
      {HAIR_STRANDS.map((s, i) => {
        const age    = Math.max(0, frame - s.delay - 8);
        const t      = easeOut4(clamp(age / 30, 0, 1));
        const floatY = Math.sin(frame / 80 + s.drift) * 6;
        const blurPx = (1 - t) * 8 + 0.5;
        const hexOp  = Math.round(s.opacity * 255).toString(16).padStart(2, "0");
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${s.xPct}%`,
              top: "-10%",
              width: s.widthPx,
              height: "125%",
              background: `linear-gradient(to bottom,
                transparent 0%,
                ${STRAND_COLORS[s.colorIdx]}${hexOp} 15%,
                ${STRAND_COLORS[s.colorIdx]}${hexOp} 85%,
                transparent 100%)`,
              transform: `rotate(${s.angleDeg}deg) translateY(${floatY}px)`,
              transformOrigin: "center center",
              opacity: t,
              filter: `blur(${blurPx}px)`,
            }}
          />
        );
      })}

      {/* Overlay glow to unify strands */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 600px 800px at 50% 50%,
            rgba(196,149,82,${0.04 * glow}) 0%, transparent 55%)`,
          mixBlendMode: "overlay" as const,
        }}
      />

      {/* Text overlay */}
      <div style={{ position: "absolute", left: 80, right: 80, bottom: 200 }}>
        <div
          style={{
            fontSize: 12, fontWeight: 700, color: C.gold, fontFamily: SANS,
            letterSpacing: "0.20em", textTransform: "uppercase" as const,
            marginBottom: 18,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          Crafted for You
        </div>

        {["Every strand,", "intentional."].map((line, i) => {
          const t = i === 0 ? headline : sub;
          return (
            <div
              key={i}
              style={{
                fontSize: 60, fontWeight: 800, fontFamily: SANS,
                color: i === 0 ? C.ink : C.gold,
                letterSpacing: -2.6, lineHeight: 0.92,
                marginBottom: i === 0 ? 4 : 18,
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
          Hair that moves with you.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — CURL  (frames 405–480, 2.5s)
//
// ENTRANCE: Continues diagonal wipe into styling close-up.
// Curling iron barrel (vertical) in center of canvas.
// An SVG spiral path draws itself progressively around the barrel —
// stroke-dashoffset animation makes the gold curl appear stroke by stroke.
// At frame 48: circular iris expands from barrel center — dark CTA color
// bleeds in from the curl point, preparing Scene 6's entrance.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCurl: React.FC = () => {
  const frame   = useCurrentFrame();
  const bgT     = easeOut3(clamp(frame / 18, 0, 1));
  const glow    = useBreathingGlow(90, 0.5, 1.0);
  const ironIn  = easeOut4(clamp(frame / 18, 0, 1));
  const headline = useCinematicTextReveal(14, 18, 8);
  const sub      = useCinematicTextReveal(28, 14, 6);

  // Spiral draws itself: 0→58f
  const drawT      = easeOut4(clamp(frame / 58, 0, 1));
  const dashOffset = SPIRAL_LEN * (1 - drawT);

  // Iris expand: 48→75f — dark CTA colour grows from curl center
  const irisT = easeInOut3(clamp((frame - 48) / 22, 0, 1));
  const irisR = irisT * 180; // 0 → 180% — fully covers the frame
  const irisCx = (CURL_CX / 1080) * 100;
  const irisCy = (CURL_CY / 1920) * 100;
  const irisClip  = irisR > 0 ? `circle(${irisR}% at ${irisCx}% ${irisCy}%)` : undefined;

  // Diagonal entrance wipe — same direction as S4's exit
  const SLANT  = 48;
  const entryT = easeOut5(clamp(frame / 22, 0, 1));
  const rawE   = entryT * (100 + SLANT);
  const topX   = 100 - Math.min(100, rawE);
  const botX   = 100 - Math.max(0, rawE - SLANT);
  const entryClip = `polygon(${topX}% 0%, 100% 0%, 100% 100%, ${botX}% 100%)`;

  return (
    <AbsoluteFill
      style={{
        clipPath: entryClip,
        WebkitClipPath: entryClip,
      }}
    >
      {/* Main scene content */}
      <AbsoluteFill style={{ background: C.bg }}>
        {/* Ambient glow around barrel */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 800px 700px at ${CURL_CX}px ${CURL_CY}px,
              rgba(196,149,82,${0.07 * bgT * glow}) 0%, transparent 62%)`,
          }}
        />

        {/* Curling iron barrel — vertical chrome cylinder */}
        <div
          style={{
            position: "absolute",
            left: CURL_CX - 22,
            top:  CURL_CY - 320,
            width:  44,
            height: 380,
            borderRadius: 22,
            background: `linear-gradient(90deg,
              rgba(155,150,145,0.85) 0%,
              rgba(225,220,215,0.95) 30%,
              rgba(195,190,183,0.90) 60%,
              rgba(145,140,133,0.80) 100%)`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.18),
              inset 0 0 0 1px rgba(255,255,255,0.12)`,
            opacity: ironIn,
          }}
        >
          {/* Clip at top of barrel */}
          <div
            style={{
              position: "absolute",
              left: -8, top: 20, width: 8, height: 120,
              borderRadius: "8px 0 0 8px",
              background: `linear-gradient(90deg, #2A2018, #18130F)`,
            }}
          />
          {/* Heat indicator band */}
          <div
            style={{
              position: "absolute",
              top: "18%", left: "15%", right: "15%", height: 3,
              background: `linear-gradient(90deg, ${C.gold}55, ${C.gold}CC, ${C.gold}55)`,
              borderRadius: 2,
            }}
          />
          {/* Surface sheen */}
          <div
            style={{
              position: "absolute",
              top: 0, bottom: 0, left: "10%", width: "25%",
              background: `linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 55%)`,
              borderRadius: "inherit",
            }}
          />
        </div>

        {/* Spiral SVG — hair coiling around barrel, draws progressively */}
        <svg
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
          width={1080}
          height={1920}
          viewBox="0 0 1080 1920"
        >
          {/* Soft glow layer under spiral */}
          <path
            d={SPIRAL_D}
            fill="none"
            stroke="rgba(255,220,160,0.32)"
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={SPIRAL_LEN}
            strokeDashoffset={dashOffset * 1.1}
          />
          {/* Dark hair base */}
          <path
            d={SPIRAL_D}
            fill="none"
            stroke="#3A2410"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={SPIRAL_LEN}
            strokeDashoffset={dashOffset * 0.92}
            opacity={0.35}
          />
          {/* Main gold spiral — the star */}
          <path
            d={SPIRAL_D}
            fill="none"
            stroke={C.gold}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray={SPIRAL_LEN}
            strokeDashoffset={dashOffset}
            opacity={0.85}
          />
        </svg>

        {/* Text — lower third */}
        <div style={{ position: "absolute", left: 80, right: 80, bottom: 200 }}>
          <div
            style={{
              fontSize: 12, fontWeight: 700, color: C.gold, fontFamily: SANS,
              letterSpacing: "0.20em", textTransform: "uppercase" as const,
              marginBottom: 18,
              opacity: headline.opacity,
              transform: `translateY(${headline.translateY}px)`,
            }}
          >
            Signature Technique
          </div>

          {["The perfect", "curl, every time."].map((line, i) => {
            const t = i === 0 ? headline : sub;
            return (
              <div
                key={i}
                style={{
                  fontSize: i === 0 ? 60 : 52, fontWeight: 800, fontFamily: SANS,
                  color: i === 0 ? C.ink : C.gold,
                  letterSpacing: -2.4, lineHeight: 0.92,
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
      </AbsoluteFill>

      {/* Iris overlay — dark CTA colour expanding from curl center */}
      {irisClip && (
        <div
          style={{
            position: "absolute", inset: 0,
            background: C.darkCTA,
            clipPath:        irisClip,
            WebkitClipPath:  irisClip,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — CTA  (frames 480–540, 2s)
//
// The iris has covered Scene 5 with dark. Scene 6 opens onto jet black.
// A decorative salon mirror circle grows in — echoing the spiral from Scene 5.
// "AURORE" slams in with a cinematic reveal. Gold rule wipes.
// "Transform Your Look" fades in.
// CTA button scales in.
// Sparkle particles float quietly.
// "Book Your Appointment Today" + URL close the spot.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCTA: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(60, 10);
  const glow    = useBreathingGlow(80, 0.52, 1.0);

  // Mirror decorative circle grows in
  const mirrorR = easeOut4(clamp(frame / 22, 0, 1)) * 320;

  // Content reveals
  const brand = useCinematicTextReveal(8,  22, 10);
  const rule  = easeInOut3(clamp((frame - 22) / 18, 0, 1)) * 100;
  const line1 = useCinematicTextReveal(24, 18,  8);
  const line2 = useCinematicTextReveal(36, 16,  7);
  const btn   = easeOut4(clamp((frame - 44) / 18, 0, 1));
  const url   = useCinematicTextReveal(56, 10,  4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Jet black base */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, #1A1410 0%, ${C.darkCTA} 100%)`,
        }}
      />

      {/* Gold breathing ambient glow */}
      <div
        style={{
          position: "absolute",
          left: "50%", top: "42%",
          width: 1000, height: 1000,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(196,149,82,${0.09 * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Decorative salon mirror circle */}
      {mirrorR > 0 && (
        <div
          style={{
            position: "absolute",
            left: "50%", top: "30%",
            width: mirrorR * 2, height: mirrorR * 2,
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            border: `2.5px solid rgba(196,149,82,0.28)`,
            background: `radial-gradient(ellipse at 35% 35%,
              rgba(240,235,228,0.06) 0%,
              rgba(200,195,188,0.02) 50%,
              transparent 75%)`,
            boxShadow: `0 0 60px rgba(196,149,82,0.08),
              inset 0 0 40px rgba(0,0,0,0.15)`,
            overflow: "hidden",
          }}
        >
          {/* Mirror inner sheen */}
          <div
            style={{
              position: "absolute",
              top: "8%", left: "12%", width: "35%", bottom: "8%",
              background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%)`,
              borderRadius: "50%",
            }}
          />
          {/* Gold arc at top of mirror */}
          <div
            style={{
              position: "absolute",
              top: 0, left: "15%", right: "15%", height: 3,
              background: `linear-gradient(90deg,
                transparent, rgba(196,149,82,0.55), transparent)`,
            }}
          />
        </div>
      )}

      {/* Floating sparkles */}
      {SPARKLES.map((sp, i) => {
        if (frame < sp.delay + 10) return null;
        const t           = (frame - sp.delay) / sp.period;
        const sparkOpacity = Math.sin(t * Math.PI * 2 + sp.phase) * 0.5 + 0.5;
        const sparkScale   = 0.6 + sparkOpacity * 0.4;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${sp.xPct}%`,
              top:  `${sp.yPct}%`,
              width:  sp.size,
              height: sp.size,
              transform: `translate(-50%, -50%) scale(${sparkScale})`,
              opacity: sparkOpacity * 0.45,
            }}
          >
            {/* Vertical arm */}
            <div
              style={{
                position: "absolute",
                left: "50%", top: 0, bottom: 0,
                width: sp.size * 0.25,
                transform: "translateX(-50%)",
                background: `linear-gradient(to bottom, transparent, ${C.gold}, transparent)`,
                borderRadius: 2,
              }}
            />
            {/* Horizontal arm */}
            <div
              style={{
                position: "absolute",
                top: "50%", left: 0, right: 0,
                height: sp.size * 0.25,
                transform: "translateY(-50%)",
                background: `linear-gradient(to right, transparent, ${C.gold}, transparent)`,
                borderRadius: 2,
              }}
            />
          </div>
        );
      })}

      {/* Content block */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0,
          top: "50%", transform: "translateY(-50%)",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Brand name */}
        <div
          style={{
            fontSize: 100, fontWeight: 900, fontFamily: SANS,
            color: C.white,
            letterSpacing: -5.5, lineHeight: 0.82,
            marginBottom: 8,
            opacity: brand.opacity,
            transform: `translateY(${brand.translateY}px)`,
            filter: `blur(${brand.blur}px)`,
          }}
        >
          AURORE
        </div>

        {/* Light sweep across brand name */}
        <div
          style={{
            position: "absolute",
            left: 0, right: 0,
            top: "12%",
            height: "26%",
            background: `linear-gradient(90deg,
              transparent, rgba(255,255,255,${0.04 * glow}), transparent)`,
            pointerEvents: "none",
          }}
        />

        {/* Gold rule wipe */}
        <div
          style={{
            width: `${rule * 0.72}%`,
            maxWidth: 200,
            height: 2,
            background: C.gold,
            borderRadius: 1,
            margin: "20px auto 28px",
            opacity: brand.opacity,
          }}
        />

        {/* "Transform Your Look" */}
        <div
          style={{
            fontSize: 30, fontWeight: 400, fontFamily: SANS,
            color: C.bodyLight,
            letterSpacing: "0.04em",
            marginBottom: 12,
            opacity: line1.opacity,
            transform: `translateY(${line1.translateY}px)`,
            filter: `blur(${line1.blur}px)`,
          }}
        >
          Transform Your Look
        </div>

        {/* Eyebrow detail */}
        <div
          style={{
            fontSize: 11, fontWeight: 700, color: "rgba(196,149,82,0.40)",
            fontFamily: SANS,
            letterSpacing: "0.16em", textTransform: "uppercase" as const,
            marginBottom: 36,
            opacity: line2.opacity,
            transform: `translateY(${line2.translateY}px)`,
          }}
        >
          Aurore · Hair & Beauty
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
              background: C.gold,
              borderRadius: 18,
              padding: "22px 48px",
              boxShadow: `0 16px 48px rgba(196,149,82,0.30)`,
            }}
          >
            <span
              style={{
                fontSize: 20, fontWeight: 800, fontFamily: SANS,
                color: C.dark,
                letterSpacing: -0.4,
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
            color: "rgba(196,149,82,0.28)",
            letterSpacing: "0.04em",
            opacity: url.opacity,
          }}
        >
          aurore.salon
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────
export const AuraSalonAd: React.FC = () => {
  const frame = useCurrentFrame();
  const TOTAL = 540;

  // Subtle global camera — slow dolly-in with gentle drift
  const zoom  = 1.0 + (frame / TOTAL) * 0.055;
  const roll  = interpolate(
    frame,
    [0, 80, 180, 360, TOTAL],
    [-0.65, -0.14, 0.42, 0.68, 0.22],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const panX = interpolate(frame, [0, TOTAL], [10, -8], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const panY = interpolate(frame, [0, TOTAL], [5, -4], {
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
        <Sequence from={0}   durationInFrames={90} ><SceneScissors  /></Sequence>
        <Sequence from={90}  durationInFrames={135}><SceneSalon     /></Sequence>
        <Sequence from={225} durationInFrames={90} ><SceneBlowDryer /></Sequence>
        <Sequence from={315} durationInFrames={90} ><SceneHairFlow  /></Sequence>
        <Sequence from={405} durationInFrames={75} ><SceneCurl      /></Sequence>
        <Sequence from={480} durationInFrames={60} ><SceneCTA       /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
