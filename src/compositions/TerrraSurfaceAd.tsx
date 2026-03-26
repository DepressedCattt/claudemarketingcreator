/**
 * TerrraSurfaceAd — "Terrra" Plant-Based Software as a Surface
 *
 * A narrative-driven ad for a fictional biotech SaaS that transforms physical
 * surfaces into living, plant-powered computing interfaces.
 *
 * Story arc (not a technique showcase):
 *   S1  "Your desk does nothing."         (  0–105f)  Provocative hook — dead grey rectangle
 *   S2  "47 billion sq ft, wasted."       ( 97–210f)  Problem scale — counter + lifeless grids
 *   S3  "What if it grew?"                (202–330f)  The seed — a dot blooms into living 3D matter
 *   S4  "Meet your living workspace."     (322–450f)  Product reveal — dashboard grows from surface
 *   S5  "Surfaces that talk."             (442–570f)  Ecosystem — connected surfaces, data vines
 *   S6  "The numbers speak for themselves."(562–690f)  Impact — organic data viz
 *   S7  "Grow your workspace."            (682–810f)  Benefit — ambient, emotional
 *   S8  CTA                               (802–900f)  Brand close
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 900 frames @ 30fps = 30 seconds
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

// ─── Design Tokens ──────────────────────────────────────────────────────────

const C = {
  deadGray:    "#B0B0B0",
  warmWhite:   "#F6FAF7",
  bgLight:     "#F0FAF4",
  bgDark:      "#070E0A",
  bgDarkMid:   "#0D1A12",
  surface:     "#132A1C",
  surfaceHi:   "#1C3D28",
  emerald:     "#10B981",
  emeraldSoft: "#10B98130",
  green:       "#22C55E",
  greenDark:   "#059669",
  teal:        "#14B8A6",
  tealSoft:    "#14B8A630",
  lime:        "#84CC16",
  limeSoft:    "#84CC1630",
  mint:        "#34D399",
  sage:        "#6EE7B7",
  forest:      "#065F46",
  white:       "#FFFFFF",
  black:       "#1A2E23",
  textDark:    "#1A2E23",
  textMid:     "#5A7D6A",
  textDim:     "#8CA89A",
  muted:       "#C6DDD0",
  gray:        "#4B5563",
  grayLight:   "#9CA3AF",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

const SPR = {
  text:    { stiffness: 170, damping: 25, mass: 0.8  },
  hero:    { stiffness: 100, damping: 24, mass: 1.1  },
  ui:      { stiffness: 155, damping: 22, mass: 0.85 },
  bg:      { stiffness: 45,  damping: 24, mass: 1.4  },
  card:    { stiffness: 150, damping: 22, mass: 0.9  },
  glow:    { stiffness: 80,  damping: 26, mass: 1.1  },
  connect: { stiffness: 100, damping: 24, mass: 0.95 },
  seed:    { stiffness: 60,  damping: 20, mass: 1.3  },
  cta:     { stiffness: 120, damping: 18, mass: 0.9  },
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const easeInOut4 = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 8 * c * c * c * c : 1 - Math.pow(-2 * c + 2, 4) / 2;
};

// ─── Shared Primitives ──────────────────────────────────────────────────────

const SceneFade: React.FC<{
  children: React.ReactNode; dur: number; fadeIn?: number; fadeOut?: number;
}> = ({ children, dur, fadeIn = 8, fadeOut = 10 }) => {
  const frame = useCurrentFrame();
  const inOp = fadeIn > 0 ? Math.min(1, frame / fadeIn) : 1;
  const outOp = fadeOut > 0 ? Math.min(1, (dur - frame) / fadeOut) : 1;
  const exitScale = fadeOut > 0 && dur - frame < fadeOut
    ? interpolate(frame, [dur - fadeOut, dur], [1, 0.97], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.max(0, Math.min(inOp, outOp)), transform: `scale(${exitScale})` }}>
      {children}
    </AbsoluteFill>
  );
};

function useSpr(delay = 0, config = SPR.text) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.max(0, frame - delay), fps, config });
}

const BlurText: React.FC<{
  children: React.ReactNode; delay?: number; y?: number;
  size?: number; weight?: number; color?: string; align?: string;
}> = ({ children, delay = 0, y = CY, size = 140, weight = 400, color = C.textDark, align = "center" }) => {
  const p = useSpr(delay);
  const blur = (1 - p) * 10;
  return (
    <div style={{
      position: "absolute", left: 0, right: 0, top: y,
      transform: `translateY(-50%) scale(${0.94 + p * 0.06})`,
      textAlign: align as React.CSSProperties["textAlign"],
      fontFamily: FONT, fontSize: size, fontWeight: weight, color,
      opacity: p, letterSpacing: weight >= 600 ? -4 : -1,
      filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
    }}>
      {children}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S1: HOOK — "Your desk does nothing."
// A single dead grey rectangle sits lifeless. Bleak. Flat.
// ═════════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rectP = spring({ frame: Math.max(0, frame - 8), fps, config: SPR.hero });
  const textP = spring({ frame: Math.max(0, frame - 20), fps, config: SPR.text });
  const textBlur = (1 - textP) * 10;

  const subP = spring({ frame: Math.max(0, frame - 40), fps, config: SPR.text });

  return (
    <SceneFade dur={105} fadeIn={1} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.warmWhite }}>
        {/* Dead desk rectangle */}
        <div style={{
          position: "absolute",
          left: CX - 700, top: CY - 80,
          width: 1400, height: 400,
          borderRadius: 16,
          background: `linear-gradient(180deg, #D1D5DB, #B0B0B0)`,
          opacity: rectP * 0.7,
          transform: `perspective(1200px) rotateX(15deg) scale(${0.8 + rectP * 0.2})`,
          boxShadow: "0 40px 80px rgba(0,0,0,0.08)",
        }} />

        {/* Headline */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: CY - 400,
          textAlign: "center", fontFamily: FONT,
          fontSize: 180, fontWeight: 300, color: C.gray,
          opacity: textP,
          filter: textBlur > 0.3 ? `blur(${textBlur}px)` : undefined,
          transform: `scale(${0.94 + textP * 0.06})`,
          letterSpacing: -3,
        }}>
          Your desk does <span style={{ fontWeight: 700, color: C.black }}>nothing.</span>
        </div>

        {/* Subtle subtext */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: CY + 420,
          textAlign: "center", fontFamily: FONT,
          fontSize: 48, fontWeight: 400, color: C.grayLight,
          opacity: subP * 0.6, letterSpacing: 2,
        }}>
          It just sits there.
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S2: PROBLEM — "47 billion sq ft, wasted."
// Counter animates up. Dead surface tiles float lifelessly.
// ═════════════════════════════════════════════════════════════════════════════

const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const counterP = spring({ frame: Math.max(0, frame - 6), fps, config: SPR.hero });
  const val = Math.round(counterP * 47);
  const counterBlur = (1 - counterP) * 8;

  const textP = spring({ frame: Math.max(0, frame - 30), fps, config: SPR.text });

  const tiles = [
    { x: 400,  y: 500,  w: 360, h: 220, delay: 8,  rot: -4 },
    { x: 1100, y: 380,  w: 320, h: 200, delay: 12, rot: 3 },
    { x: 2700, y: 450,  w: 340, h: 210, delay: 10, rot: -2 },
    { x: 3300, y: 580,  w: 300, h: 190, delay: 14, rot: 5 },
    { x: 600,  y: 1600, w: 380, h: 230, delay: 16, rot: -6 },
    { x: 2200, y: 1700, w: 350, h: 200, delay: 18, rot: 4 },
    { x: 3400, y: 1500, w: 310, h: 195, delay: 20, rot: -3 },
  ];

  return (
    <SceneFade dur={120} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.warmWhite }}>
        {/* Lifeless surface tiles floating */}
        {tiles.map(({ x, y, w, h, delay, rot }, i) => {
          const tp = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.ui });
          const bob = Math.sin(frame * 0.02 + i * 1.5) * 4;
          return (
            <div key={i} style={{
              position: "absolute", left: x - w / 2, top: y - h / 2 + bob,
              width: w, height: h, borderRadius: 12,
              background: `linear-gradient(180deg, #E5E7EB, #D1D5DB)`,
              opacity: tp * 0.4,
              transform: `scale(${0.6 + tp * 0.4}) rotate(${rot * tp}deg)`,
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
            }} />
          );
        })}

        {/* Hero counter */}
        <div style={{
          position: "absolute", left: CX, top: CY - 80,
          transform: `translate(-50%, -50%) scale(${0.88 + counterP * 0.12})`,
          fontFamily: FONT, fontSize: 400, fontWeight: 700,
          color: C.gray, opacity: counterP, letterSpacing: -12,
          filter: counterBlur > 0.3 ? `blur(${counterBlur}px)` : undefined,
        }}>
          {val}B
        </div>

        <div style={{
          position: "absolute", left: CX, top: CY + 200,
          transform: "translate(-50%, -50%)",
          fontFamily: FONT, fontSize: 80, fontWeight: 300,
          color: C.grayLight, opacity: textP, letterSpacing: -1,
        }}>
          square feet of surface, <span style={{ fontWeight: 700, color: C.gray }}>wasted.</span>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S3: THE SEED — "What if it grew?"
// A green dot appears, blooms into 3D living matter.
// Dark bg. 3D cubes/diamonds emerge like organic crystalline growth.
// ═════════════════════════════════════════════════════════════════════════════

const SceneSeed: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dotP = spring({ frame: Math.max(0, frame - 10), fps, config: SPR.seed });
  const bloomP = spring({ frame: Math.max(0, frame - 35), fps, config: SPR.seed });
  const textP = spring({ frame: Math.max(0, frame - 5), fps, config: SPR.text });
  const textBlur = (1 - textP) * 12;

  const bloomScale = bloomP * 1.2;
  const glowRadius = bloomP * 800;

  const holdFrames = 50;
  const orbitRaw = clamp((frame - holdFrames) / 60, 0, 1);
  const orbitT = easeInOut4(orbitRaw);
  const camRotY = orbitT * 25;
  const camRotX = orbitT * -6;

  return (
    <SceneFade dur={135} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bgDark }}>
        {/* Central bloom glow */}
        <div style={{
          position: "absolute",
          left: CX - glowRadius, top: CY - glowRadius,
          width: glowRadius * 2, height: glowRadius * 2,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.emerald}18, transparent 70%)`,
          opacity: bloomP, filter: "blur(60px)",
        }} />

        {/* The seed dot that expands */}
        <div style={{
          position: "absolute",
          left: CX - 15 * dotP, top: CY - 15 * dotP,
          width: 30 * dotP, height: 30 * dotP,
          borderRadius: "50%",
          background: C.emerald,
          boxShadow: `0 0 ${60 * dotP}px ${C.emerald}60, 0 0 ${120 * dotP}px ${C.emerald}30`,
          opacity: dotP * (1 - bloomP * 0.8),
        }} />

        {/* 3D crystalline growth — emerges with bloom */}
        {bloomP > 0.05 && (
          <div style={{
            position: "absolute", inset: 0,
            perspective: "2400px", perspectiveOrigin: "50% 50%",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              transformStyle: "preserve-3d" as const,
              transform: `rotateY(${camRotY}deg) rotateX(${camRotX}deg) scale(${0.6 + bloomScale * 0.4})`,
              transformOrigin: "center center",
              willChange: "transform", opacity: bloomP,
            }}>
              {/* Cubes growing from center */}
              {[
                { x: CX - 300, y: CY - 150, z: 100, size: 200, color: C.emerald, dark: C.greenDark, sp: 0.12, ph: 0 },
                { x: CX + 350, y: CY + 80,  z: -120, size: 160, color: C.teal, dark: C.forest, sp: 0.1, ph: 90 },
                { x: CX - 100, y: CY + 280, z: 40,  size: 240, color: C.mint, dark: C.greenDark, sp: 0.08, ph: 180 },
                { x: CX + 500, y: CY - 280, z: 150, size: 140, color: C.lime, dark: C.forest, sp: 0.14, ph: 45 },
              ].map(({ x, y, z, size, color, dark, sp, ph }, i) => {
                const half = size / 2;
                const rX = (frame * sp * 0.7) + ph;
                const rY = (frame * sp) + ph * 1.3;
                const bob = Math.sin(frame * 0.015 + ph * 0.01) * 4;
                const faces = [
                  { t: `rotateY(0deg) translateZ(${half}px)`, bg: color, op: 1 },
                  { t: `rotateY(180deg) translateZ(${half}px)`, bg: dark, op: 0.85 },
                  { t: `rotateY(90deg) translateZ(${half}px)`, bg: `${color}dd`, op: 0.9 },
                  { t: `rotateY(-90deg) translateZ(${half}px)`, bg: `${color}cc`, op: 0.9 },
                  { t: `rotateX(90deg) translateZ(${half}px)`, bg: `${color}ee`, op: 0.95 },
                  { t: `rotateX(-90deg) translateZ(${half}px)`, bg: dark, op: 0.8 },
                ];
                return (
                  <div key={i} style={{
                    position: "absolute", left: x - half, top: y - half + bob,
                    width: size, height: size,
                    transformStyle: "preserve-3d" as const,
                    transform: `translateZ(${z}px) rotateX(${rX}deg) rotateY(${rY}deg)`,
                  }}>
                    {faces.map((f, j) => (
                      <div key={j} style={{
                        position: "absolute", width: size, height: size,
                        transform: f.t, background: f.bg, opacity: f.op,
                        borderRadius: size * 0.08,
                        backfaceVisibility: "hidden" as const,
                        boxShadow: `inset 0 0 ${size * 0.15}px rgba(0,0,0,0.15)`,
                      }} />
                    ))}
                  </div>
                );
              })}

              {/* Diamond — balanced on vertex, like a crystal forming */}
              {(() => {
                const size = 200;
                const half = size / 2;
                const rY = (frame * 0.1) + 60;
                const bob = Math.sin(frame * 0.018 + 0.01) * 3;
                const faces = [
                  { t: `rotateY(0deg) translateZ(${half}px)`, bg: C.sage, op: 1 },
                  { t: `rotateY(180deg) translateZ(${half}px)`, bg: C.greenDark, op: 0.85 },
                  { t: `rotateY(90deg) translateZ(${half}px)`, bg: `${C.sage}dd`, op: 0.9 },
                  { t: `rotateY(-90deg) translateZ(${half}px)`, bg: `${C.sage}cc`, op: 0.9 },
                  { t: `rotateX(90deg) translateZ(${half}px)`, bg: `${C.sage}ee`, op: 0.95 },
                  { t: `rotateX(-90deg) translateZ(${half}px)`, bg: C.greenDark, op: 0.8 },
                ];
                return (
                  <div style={{
                    position: "absolute", left: CX + 150 - half, top: CY - 50 - half + bob,
                    width: size, height: size,
                    transformStyle: "preserve-3d" as const,
                    transform: `translateZ(80px) rotateZ(45deg) rotateX(${54.74 + frame * 0.03}deg) rotateY(${rY}deg)`,
                  }}>
                    {faces.map((f, j) => (
                      <div key={j} style={{
                        position: "absolute", width: size, height: size,
                        transform: f.t, background: f.bg, opacity: f.op,
                        borderRadius: size * 0.08,
                        backfaceVisibility: "hidden" as const,
                      }} />
                    ))}
                  </div>
                );
              })()}

              {/* Orbital rings — like growth rings */}
              {[450, 650].map((r, i) => (
                <div key={`ring${i}`} style={{
                  position: "absolute", left: CX - r, top: CY - r,
                  width: r * 2, height: r * 2, borderRadius: "50%",
                  border: `2px solid ${C.emerald}`,
                  opacity: bloomP * 0.3,
                  transformStyle: "preserve-3d" as const,
                  transform: `translateZ(${-200 - i * 200}px) rotateX(${75 + i * 5}deg) rotateY(${frame * 0.4}deg)`,
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Text overlay */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: 280,
          textAlign: "center", fontFamily: FONT,
          fontSize: 160, fontWeight: 300, color: C.muted,
          opacity: textP,
          filter: textBlur > 0.3 ? `blur(${textBlur}px)` : undefined,
          transform: `scale(${0.94 + textP * 0.06})`,
        }}>
          What if it <span style={{ fontWeight: 700, color: C.emerald }}>grew?</span>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S4: PRODUCT — "Meet your living workspace."
// Dashboard UI blooms from the surface. Cards grow in like leaves.
// Camera sweeps to reveal the full interface.
// ═════════════════════════════════════════════════════════════════════════════

const SceneProduct: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = (delay: number, config = SPR.card) =>
    spring({ frame: Math.max(0, frame - delay), fps, config });

  const sweepRaw = clamp((frame - 20) / 80, 0, 1);
  const sweepT = easeInOut4(sweepRaw);
  const camScale = interpolate(sweepT, [0, 1], [1.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const camTx = interpolate(sweepT, [0, 1], [300, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cards = [
    { x: 200,  y: 520,  w: 1000, h: 440, title: "Air Quality",   val: "98.4%", delta: "+3.2%",  color: C.emerald, delay: 15 },
    { x: 1280, y: 520,  w: 1000, h: 440, title: "Energy Harvest", val: "2.1kW", delta: "+12%",   color: C.teal,    delay: 22 },
    { x: 2560, y: 520,  w: 1080, h: 440, title: "Surface Health",  val: "A+",    delta: "optimal", color: C.green,   delay: 29 },
    { x: 200,  y: 1060, w: 1600, h: 520, title: "Photosynthesis Output", val: "847 μmol/m²/s", delta: "peak", color: C.lime, delay: 36 },
    { x: 1880, y: 1060, w: 1760, h: 520, title: "Root Network Latency",  val: "0.3ms",         delta: "real-time", color: C.mint, delay: 42 },
  ];

  return (
    <SceneFade dur={135} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bgDark }}>
        <div style={{
          position: "absolute", inset: 0,
          transform: `scale(${camScale}) translateX(${camTx}px)`,
          transformOrigin: "center center", willChange: "transform",
        }}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", left: CX - 600, top: -200, width: 1200, height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.emerald}12, transparent 70%)`,
            opacity: s(10, SPR.glow), filter: "blur(60px)",
          }} />

          {/* Product dashboard cards — growing in like leaves */}
          {cards.map(({ x, y, w, h, title, val, delta, color, delay }, i) => {
            const p = s(delay);
            const glowPulse = Math.sin(frame * 0.04 + i) * 0.3 + 0.7;
            return (
              <div key={i} style={{
                position: "absolute", left: x, top: y, width: w, height: h,
                borderRadius: 36,
                background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
                border: `1px solid ${color}30`,
                boxShadow: `0 0 ${30 * glowPulse}px ${color}25, 0 16px 48px rgba(0,0,0,0.4)`,
                transform: `translateY(${(1 - p) * 80}px) scale(${0.8 + p * 0.2})`,
                opacity: p, overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: -h * 0.3, left: "20%",
                  width: w * 0.6, height: h * 0.5, borderRadius: "50%",
                  background: `radial-gradient(circle, ${color}20, transparent 70%)`,
                  opacity: 0.15 * glowPulse, pointerEvents: "none",
                }} />
                <div style={{ padding: "44px 52px", position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
                    <span style={{ fontFamily: FONT, fontSize: 34, fontWeight: 500, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" as const }}>
                      {title}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
                    <span style={{ fontFamily: FONT, fontSize: w > 1200 ? 110 : 90, fontWeight: 700, color: C.white, letterSpacing: -3 }}>
                      {val}
                    </span>
                    <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 600, color }}>
                      {delta}
                    </span>
                  </div>
                  <div style={{
                    marginTop: 20, height: 8, borderRadius: 4,
                    background: `${color}15`, overflow: "hidden", width: "75%",
                  }}>
                    <div style={{
                      width: `${s(delay + 12) * 80}%`, height: "100%", borderRadius: 4,
                      background: `linear-gradient(90deg, ${color}, ${color}80)`,
                      boxShadow: `0 0 8px ${color}50`,
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Title — positioned above the UI */}
        <BlurText delay={4} y={180} size={130} weight={300} color={C.muted}>
          Meet your <span style={{ fontWeight: 700, color: C.emerald }}>living workspace.</span>
        </BlurText>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S5: ECOSYSTEM — "Surfaces that talk."
// Multiple surfaces connected by glowing vine-like SVG connectors.
// ═════════════════════════════════════════════════════════════════════════════

const SceneEcosystem: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = (delay: number, config = SPR.card) =>
    spring({ frame: Math.max(0, frame - delay), fps, config });
  const conn = (delay: number) => s(delay, SPR.connect);

  const surfaces = [
    { x: 200,  y: 600,  w: 880,  h: 380, title: "Standing Desk",  sub: "Living surface A",  color: C.emerald, delay: 10 },
    { x: 1480, y: 440,  w: 880,  h: 380, title: "Conference Wall", sub: "Living surface B",  color: C.teal,    delay: 16 },
    { x: 2760, y: 520,  w: 880,  h: 380, title: "Kitchen Counter", sub: "Living surface C",  color: C.lime,    delay: 22 },
    { x: 880,  y: 1200, w: 880,  h: 380, title: "Lobby Floor",     sub: "Living surface D",  color: C.green,   delay: 18 },
    { x: 2160, y: 1200, w: 880,  h: 380, title: "Rooftop Panel",   sub: "Living surface E",  color: C.mint,    delay: 26 },
  ];

  const connections = [
    { from: 0, to: 1, delay: 32, color: C.emerald },
    { from: 1, to: 2, delay: 36, color: C.teal },
    { from: 0, to: 3, delay: 40, color: C.emerald },
    { from: 3, to: 4, delay: 44, color: C.green },
    { from: 1, to: 4, delay: 48, color: C.teal },
  ];

  return (
    <SceneFade dur={135} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bgDark }}>
        {/* Ambient glow orbs */}
        {[
          { x: 500, y: CY, size: 700, color: C.emerald, glow: C.emeraldSoft, phase: 0, delay: 4 },
          { x: 3300, y: 500, size: 500, color: C.teal, glow: C.tealSoft, phase: 2, delay: 8 },
          { x: CX, y: 1800, size: 600, color: C.lime, glow: C.limeSoft, phase: 4, delay: 12 },
        ].map(({ x, y, size, color, glow, phase, delay }, i) => {
          const p = s(delay, SPR.glow);
          const breathe = Math.sin(frame * 0.03 + phase) * 0.15 + 0.85;
          return (
            <div key={`orb${i}`} style={{
              position: "absolute", left: x - size / 2,
              top: y - size / 2 + Math.sin(frame * 0.015 + phase) * 6,
              width: size, height: size, borderRadius: "50%",
              background: `radial-gradient(circle at 40% 35%, ${color}, transparent 70%)`,
              boxShadow: `0 0 ${size * 0.8}px ${size * 0.3}px ${glow}`,
              opacity: p * breathe * 0.5, transform: `scale(${0.5 + p * 0.5})`,
            }} />
          );
        })}

        {/* Title */}
        <BlurText delay={4} y={160} size={130} weight={300} color={C.muted}>
          Surfaces that <span style={{ fontWeight: 700, color: C.teal }}>talk.</span>
        </BlurText>

        {/* Data vine connectors */}
        {connections.map(({ from, to, delay, color }, i) => {
          const n1 = surfaces[from];
          const n2 = surfaces[to];
          const p = conn(delay);
          const x1 = n1.x + n1.w;
          const y1 = n1.y + n1.h / 2;
          const x2 = n2.x;
          const y2 = n2.y + n2.h / 2;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const mx = (x1 + x2) / 2 + dy * 0.25;
          const my = (y1 + y2) / 2 - dx * 0.15;
          const pathD = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
          const pathLen = Math.sqrt(dx * dx + dy * dy) * 1.2;

          return (
            <svg key={`c${i}`} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none" }}>
              <path d={pathD} fill="none" stroke={`${color}20`} strokeWidth={3} />
              <path d={pathD} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round"
                strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - p)}
                filter={`drop-shadow(0 0 6px ${color})`} />
              <circle
                cx={interpolate(p, [0, 1], [x1, x2])}
                cy={interpolate(p, [0, 1], [y1, y2])}
                r={5} fill={color}
                opacity={p > 0.05 && p < 0.95 ? 1 : 0}
                filter={`drop-shadow(0 0 8px ${color})`} />
            </svg>
          );
        })}

        {/* Surface nodes */}
        {surfaces.map(({ x, y, w, h, title, sub, color, delay }, i) => {
          const p = s(delay);
          const glowPulse = Math.sin(frame * 0.04 + i * 1.5) * 0.3 + 0.7;
          return (
            <div key={i} style={{
              position: "absolute", left: x, top: y, width: w, height: h,
              borderRadius: 32,
              background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
              border: `1px solid ${color}30`,
              boxShadow: `0 0 ${30 * glowPulse}px ${color}20, 0 16px 48px rgba(0,0,0,0.4)`,
              transform: `translateY(${(1 - p) * 60}px) scale(${0.85 + p * 0.15})`,
              opacity: p, display: "flex", alignItems: "center", padding: "0 48px", gap: 28,
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: 24, flexShrink: 0,
                background: `${color}15`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 16px ${color}15`,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: color, boxShadow: `0 0 12px ${color}` }} />
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 52, fontWeight: 600, color: C.white, letterSpacing: -1 }}>{title}</div>
                <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 400, color: C.textDim, marginTop: 6 }}>{sub}</div>
              </div>
              <div style={{
                position: "absolute", right: 48, top: "50%", transform: "translateY(-50%)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.emerald, boxShadow: `0 0 8px ${C.emerald}` }} />
                <span style={{ fontFamily: FONT, fontSize: 26, color: C.emerald, fontWeight: 500 }}>Online</span>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S6: IMPACT — "The numbers speak for themselves."
// Organic data viz — progress rings like tree rings, counters growing.
// ═════════════════════════════════════════════════════════════════════════════

const SceneImpact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = (delay: number) =>
    spring({ frame: Math.max(0, frame - delay), fps, config: SPR.hero });

  const rings = [
    { x: CX - 700, y: CY + 50,  r: 220, progress: 0.94, color: C.emerald, val: "94%",   label: "Carbon Capture",  delay: 8 },
    { x: CX,       y: CY - 30,  r: 280, progress: 0.87, color: C.teal,    val: "12.4t",  label: "CO₂ Offset/yr",   delay: 14 },
    { x: CX + 700, y: CY + 50,  r: 220, progress: 0.96, color: C.green,   val: "96%",   label: "Surface Uptime",  delay: 20 },
  ];

  const stats = [
    { label: "Energy Generated",   val: "2,400 kWh", x: CX - 600, y: CY + 450, color: C.lime,    delay: 26 },
    { label: "Water Saved",        val: "18,000 gal", x: CX,       y: CY + 450, color: C.mint,    delay: 30 },
    { label: "Surfaces Activated", val: "8,412",     x: CX + 600, y: CY + 450, color: C.emerald, delay: 34 },
  ];

  return (
    <SceneFade dur={135} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bgDark }}>
        {/* Ambient */}
        <div style={{
          position: "absolute", left: CX - 800, top: CY - 800, width: 1600, height: 1600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.emerald}08, transparent 60%)`,
          filter: "blur(80px)", opacity: s(4),
        }} />

        <BlurText delay={4} y={240} size={100} weight={300} color={C.muted}>
          The numbers speak for <span style={{ fontWeight: 700, color: C.emerald }}>themselves.</span>
        </BlurText>

        {/* Tree-ring progress rings */}
        {rings.map(({ x, y, r, progress, color, val, label, delay }, i) => {
          const p = s(delay);
          const circ = 2 * Math.PI * r;
          const size = (r + 18) * 2;
          return (
            <div key={i} style={{ position: "absolute", left: x - size / 2, top: y - size / 2 }}>
              <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`${color}15`} strokeWidth={18} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={18}
                  strokeDasharray={circ} strokeDashoffset={circ * (1 - p * progress)}
                  strokeLinecap="round" style={{ opacity: p }}
                  filter={`drop-shadow(0 0 10px ${color}60)`} />
              </svg>
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ fontFamily: FONT, fontSize: 72, fontWeight: 700, color: C.white, letterSpacing: -3, opacity: p }}>
                  {val}
                </span>
                <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: C.textDim, marginTop: 4, opacity: p }}>
                  {label}
                </span>
              </div>
            </div>
          );
        })}

        {/* Stat widgets */}
        {stats.map(({ label, val, x, y, color, delay }, i) => {
          const p = s(delay);
          return (
            <div key={`stat${i}`} style={{
              position: "absolute", left: x, top: y,
              transform: `translate(-50%, 0) translateY(${(1 - p) * 40}px)`,
              opacity: p, textAlign: "center",
            }}>
              <div style={{ fontFamily: FONT, fontSize: 68, fontWeight: 700, color: C.white, letterSpacing: -2 }}>{val}</div>
              <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 400, color, marginTop: 8, letterSpacing: 1, textTransform: "uppercase" as const }}>{label}</div>
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S7: BENEFIT — "Grow your workspace."
// Ambient, emotional. Concentric rings expand like growth rings of a tree.
// Background blobs breathe. Draw-on vine strokes.
// ═════════════════════════════════════════════════════════════════════════════

const SceneBenefit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgS = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR.bg });

  const rings = [600, 820, 1040, 1260];
  const VINE_D = "M -800,-200 C -400,-500 200,-300 600,-100 C 1000,100 1200,-200 1600,-400";
  const LEAF_D = "M 0,0 C 200,-300 500,-200 600,0 C 500,200 200,300 0,0";

  return (
    <SceneFade dur={135} fadeIn={10} fadeOut={12}>
      <AbsoluteFill style={{ backgroundColor: C.bgLight }}>
        {/* Central living sphere */}
        <div style={{
          position: "absolute",
          left: CX - 420, top: CY - 420, width: 840, height: 840,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${C.mint}, ${C.emerald}, ${C.forest})`,
          transform: `scale(${bgS(0) * 0.55 * (1 + Math.sin(frame * 0.035) * 0.015)})`,
          boxShadow: `0 0 120px ${C.emerald}25`,
        }} />

        {/* Concentric growth rings */}
        {rings.map((r, i) => {
          const rp = bgS(5 + i * 4);
          const opPulse = 0.2 + Math.sin(frame * 0.04 + i * 1.8) * 0.06;
          return (
            <svg key={i} style={{
              position: "absolute", left: CX - r / 2, top: CY - r / 2,
              width: r, height: r, opacity: rp * opPulse,
              transform: `rotate(${frame * (i % 2 === 0 ? -0.12 : 0.15)}deg)`,
            }}>
              <circle cx={r / 2} cy={r / 2} r={r / 2 - 2} fill="none" stroke={C.emerald} strokeWidth={2} strokeDasharray={`${16 + i * 10} ${10 + i * 5}`} />
            </svg>
          );
        })}

        {/* Draw-on vine strokes */}
        {[
          { d: VINE_D, color: C.teal, w: 4, delay: 10, x: CX - 400, y: CY + 200 },
          { d: LEAF_D, color: C.emerald, w: 5, delay: 14, x: CX - 200, y: CY - 300 },
        ].map(({ d, color, w, delay, x, y }, i) => {
          const p = bgS(delay);
          return (
            <svg key={`stroke${i}`} style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity: p * 0.4 }} width="1" height="1" viewBox="0 0 1 1">
              <path d={d} fill="none" stroke={color} strokeWidth={w} strokeDasharray="4000" strokeDashoffset={4000 * (1 - p)} strokeLinecap="round" />
            </svg>
          );
        })}

        {/* Radial blobs */}
        {[
          { x: 400, y: 400, size: 500, color: C.emerald, delay: 4 },
          { x: 3400, y: 1800, size: 450, color: C.teal, delay: 8 },
          { x: 500, y: 1700, size: 380, color: C.lime, delay: 12 },
        ].map(({ x, y, size, color, delay }, i) => {
          const p = bgS(delay);
          const pulse = 1 + Math.sin(frame * 0.04) * 0.05;
          return (
            <div key={`blob${i}`} style={{
              position: "absolute", left: x - size / 2, top: y - size / 2,
              width: size, height: size, borderRadius: "50%",
              background: `radial-gradient(circle, ${color}25 0%, transparent 60%)`,
              transform: `scale(${p * pulse})`, opacity: p * 0.55, filter: "blur(40px)",
            }} />
          );
        })}

        {/* Ripple rings */}
        {Array.from({ length: 6 }, (_, i) => {
          const rp = spring({ frame: Math.max(0, frame - 20 - i * 3), fps, config: { damping: 16, stiffness: 25, mass: 1.5 } });
          const r = (140 + i * 55) * rp;
          return (
            <div key={`rip${i}`} style={{
              position: "absolute", left: CX - r, top: CY - r, width: r * 2, height: r * 2,
              borderRadius: "50%",
              border: `${Math.max(1, 2.5 - i * 0.3)}px solid ${C.emerald}`,
              opacity: (1 - i / 6) * rp * 0.3,
            }} />
          );
        })}

        {/* Text */}
        <BlurText delay={18} y={350} size={160} weight={300} color={C.textDark}>
          Grow your
        </BlurText>
        <BlurText delay={22} y={550} size={160} weight={700} color={C.emerald}>
          workspace.
        </BlurText>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S8: CTA — Brand close
// ═════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const txt = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR.text });
  const cta = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR.cta });
  const glow = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR.glow });

  const breathe = Math.sin(frame * 0.03) * 0.006;

  return (
    <SceneFade dur={105} fadeIn={8} fadeOut={1}>
      <AbsoluteFill style={{ backgroundColor: C.bgDark, transform: `scale(${1 + breathe})` }}>
        {/* Ambient orbs */}
        {[
          { x: CX - 400, y: CY - 200, size: 600, color: C.emerald, glow: C.emeraldSoft, delay: 4, phase: 0 },
          { x: CX + 400, y: CY + 200, size: 500, color: C.teal, glow: C.tealSoft, delay: 8, phase: 2 },
          { x: CX, y: CY, size: 400, color: C.mint, glow: `${C.mint}30`, delay: 6, phase: 4 },
        ].map(({ x, y, size, color, glow: g, delay, phase }, i) => {
          const p = glow(delay);
          const b = Math.sin(frame * 0.03 + phase) * 0.15 + 0.85;
          return (
            <div key={i} style={{
              position: "absolute", left: x - size / 2,
              top: y - size / 2 + Math.sin(frame * 0.015 + phase) * 6,
              width: size, height: size, borderRadius: "50%",
              background: `radial-gradient(circle at 40% 35%, ${color}, transparent 70%)`,
              boxShadow: `0 0 ${size * 0.8}px ${size * 0.3}px ${g}`,
              opacity: p * b * 0.5, transform: `scale(${0.5 + p * 0.5})`,
            }} />
          );
        })}

        {/* Brand name */}
        {(() => {
          const p = txt(6);
          const blur = (1 - p) * 12;
          return (
            <div style={{
              position: "absolute", left: CX, top: CY - 160,
              transform: `translate(-50%, -50%) scale(${0.9 + p * 0.1})`,
              fontFamily: FONT, fontSize: 300, fontWeight: 700,
              color: C.white, letterSpacing: -10, opacity: p,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              textShadow: `0 0 80px ${C.emerald}30`,
            }}>
              Terrra
            </div>
          );
        })()}

        {/* Tagline */}
        <div style={{
          position: "absolute", left: CX, top: CY + 30,
          transform: "translate(-50%, -50%)",
          fontFamily: FONT, fontSize: 64, fontWeight: 400,
          color: C.muted, opacity: txt(14) * 0.8,
          letterSpacing: 4, textTransform: "uppercase" as const,
        }}>
          Software as a Surface.
        </div>

        {/* CTA button */}
        {(() => {
          const p = cta(22);
          const pulse = 1 + Math.sin(frame * 0.05) * 0.012 * p;
          return (
            <div style={{
              position: "absolute", left: CX, top: CY + 200,
              transform: `translate(-50%, -50%) scale(${(0.7 + p * 0.3) * pulse})`,
              opacity: p,
            }}>
              <div style={{
                padding: "40px 100px", borderRadius: 200,
                background: `linear-gradient(135deg, ${C.emerald}, ${C.teal})`,
                boxShadow: `0 0 40px ${C.emerald}40, 0 12px 48px rgba(0,0,0,0.3)`,
              }}>
                <span style={{ fontFamily: FONT, fontSize: 72, fontWeight: 600, color: C.white, letterSpacing: -2 }}>
                  Start Growing
                </span>
              </div>
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const TerrraSurfaceAd: React.FC = () => {
  const frame = useCurrentFrame();

  // Dark overlay transition from light (S1–S2) to dark (S3+)
  const darkTransition =
    frame >= 190 && frame <= 220
      ? interpolate(frame, [190, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      : frame > 220 && frame <= 670
        ? 1
        : frame > 670 && frame <= 700
          ? interpolate(frame, [670, 690], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : frame > 700
            ? 0
            : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: C.warmWhite, overflow: "hidden" }}>
      {/* S1: Hook — "Your desk does nothing." */}
      <Sequence from={0} durationInFrames={105}>
        <SceneHook />
      </Sequence>

      {/* S2: Problem — "47 billion sq ft, wasted." */}
      <Sequence from={97} durationInFrames={120}>
        <SceneProblem />
      </Sequence>

      {/* Dark overlay for transition to dark scenes */}
      {darkTransition > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(7,14,10,${darkTransition})`, zIndex: 1 }} />
      )}

      {/* S3: The Seed — "What if it grew?" */}
      <Sequence from={202} durationInFrames={135} style={{ zIndex: 2 }}>
        <SceneSeed />
      </Sequence>

      {/* S4: Product — "Meet your living workspace." */}
      <Sequence from={322} durationInFrames={135} style={{ zIndex: 2 }}>
        <SceneProduct />
      </Sequence>

      {/* S5: Ecosystem — "Surfaces that talk." */}
      <Sequence from={442} durationInFrames={135} style={{ zIndex: 2 }}>
        <SceneEcosystem />
      </Sequence>

      {/* S6: Impact — "The numbers speak for themselves." */}
      <Sequence from={562} durationInFrames={135} style={{ zIndex: 2 }}>
        <SceneImpact />
      </Sequence>

      {/* S7: Benefit — "Grow your workspace." */}
      <Sequence from={682} durationInFrames={135}>
        <SceneBenefit />
      </Sequence>

      {/* S8: CTA */}
      <Sequence from={802} durationInFrames={105}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
