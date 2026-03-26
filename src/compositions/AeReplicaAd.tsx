/**
 * AeReplicaAd — Learning animation style from FINAL_RENDER_4K (first 5s)
 *
 * ITERATION 4 — Key fix: blobs now BURST OUTWARD from center like a
 * directional shockwave, matching the AE reference where a click/interaction
 * triggers an explosion of shapes that fly outward with velocity.
 *
 * Three animation techniques:
 *   1. Text — multi-keyframe slide-in, wobble, recenter (exact AE data)
 *   2. Directional Blob Burst — shapes fly from center to their positions
 *   3. Transmutation — UI widgets + cursor drag
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 150 frames @ 30fps = 5 seconds
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

const C = {
  bg:      "#F5F5F5",
  white:   "#FFFFFF",
  blue:    "#4A5AFF",
  pink:    "#FF6584",
  amber:   "#FFB830",
  teal:    "#4ECDC4",
  text:    "#1A1A2E",
  textMid: "#6B6B80",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }

function kf(frame: number, keyframes: [number, number][]): number {
  if (keyframes.length === 0) return 0;
  if (frame <= keyframes[0][0]) return keyframes[0][1];
  if (frame >= keyframes[keyframes.length - 1][0]) return keyframes[keyframes.length - 1][1];
  for (let i = 0; i < keyframes.length - 1; i++) {
    const [f0, v0] = keyframes[i];
    const [f1, v1] = keyframes[i + 1];
    if (frame >= f0 && frame <= f1) {
      const t = (frame - f0) / (f1 - f0);
      const eased = t * t * (3 - 2 * t);
      return v0 + (v1 - v0) * eased;
    }
  }
  return keyframes[keyframes.length - 1][1];
}

// ═══════════════════════════════════════════════════════════════════════════
// TEXT ANIMATION
// ═══════════════════════════════════════════════════════════════════════════

const AeText: React.FC<{
  text: string;
  posXKeys: [number, number][];
  posYKeys: [number, number][];
  rotKeys?: [number, number][];
  scaleKeys?: [number, number][];
  inFrame: number;
  outFrame: number;
  swapFrame: number;
  size?: number;
  weight?: number;
  color?: string;
  filterId: string;
}> = ({
  text, posXKeys, posYKeys, rotKeys, scaleKeys,
  inFrame, outFrame, swapFrame, size = 200, weight = 300,
  color = C.text, filterId,
}) => {
  const frame = useCurrentFrame();
  if (frame < inFrame || frame > outFrame) return null;

  const x = kf(frame, posXKeys);
  const y = kf(frame, posYKeys);
  const rot = rotKeys ? kf(frame, rotKeys) : 0;
  const scale = scaleKeys ? kf(frame, scaleKeys) / 100 : 1;

  const revealP = clamp01((frame - inFrame) / Math.max(1, swapFrame - inFrame));
  const blur = interpolate(revealP, [0, 0.4, 0.7, 1], [8, 5, 2, 0]);

  return (
    <>
      {blur > 0.3 && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <defs>
            <filter id={filterId} x="-10%" y="-20%" width="120%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="b" />
              <feColorMatrix in="b" type="matrix"
                values={`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${5 + blur} ${-1.5 - blur * 0.2}`} />
            </filter>
          </defs>
        </svg>
      )}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          fontFamily: FONT,
          fontStyle: "italic",
          fontSize: size,
          fontWeight: weight,
          color,
          whiteSpace: "nowrap" as const,
          letterSpacing: -2,
          transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${scale})`,
          filter: blur > 0.3 ? `url(#${filterId})` : "none",
          willChange: "transform, filter",
        }}
      >
        {text}
      </div>
    </>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// DIRECTIONAL BLOB BURST — shapes fly outward from center
// ═══════════════════════════════════════════════════════════════════════════

/**
 * BurstBlob: A metaball blob that FLIES from the burst origin point to its
 * final destination. Contains pulsing dots + goo filter for organic shape.
 * The directional flight is what was missing — blobs aren't random, they
 * have trajectory.
 */
const BurstBlob: React.FC<{
  targetX: number;
  targetY: number;
  originX?: number;
  originY?: number;
  inFrame: number;
  outFrame: number;
  color: string;
  dotRadius?: number;
  dotSpacing?: number;
  blobScale?: number;
  filterId: string;
  flightDuration?: number;
}> = ({
  targetX, targetY,
  originX = CX, originY = CY,
  inFrame, outFrame, color,
  dotRadius = 50, dotSpacing = 45, blobScale = 1,
  filterId, flightDuration = 12,
}) => {
  const frame = useCurrentFrame();
  if (frame < inFrame || frame > outFrame) return null;

  const localF = frame - inFrame;

  // Flight: blob starts at origin and flies to target position
  const flightP = clamp01(localF / flightDuration);
  // Ease out cubic for decelerating arrival
  const eased = 1 - Math.pow(1 - flightP, 3);
  const cx = originX + (targetX - originX) * eased;
  const cy = originY + (targetY - originY) * eased;

  // Scale: starts small, grows during flight, slight overshoot then settle
  const scaleP = localF < flightDuration
    ? 0.3 + 0.7 * eased
    : localF < flightDuration + 5
      ? 1 + 0.15 * (1 - (localF - flightDuration) / 5) // overshoot
      : 1;

  const exitP = frame > outFrame - 8 ? clamp01((outFrame - frame) / 8) : 1;

  // Pulsing dots for organic morphing
  const dotScale = (phase: number) => {
    const t = ((localF + phase) % 30) / 30;
    return 0.5 + 0.5 * Math.cos(t * Math.PI * 2);
  };

  const dots = [
    { dx: -dotSpacing, dy: 0, phase: 0 },
    { dx: dotSpacing * 0.5, dy: -dotSpacing * 0.5, phase: 10 },
    { dx: dotSpacing * 0.3, dy: dotSpacing * 0.6, phase: 20 },
  ];

  // Directional stretch during flight (elongate toward direction of travel)
  const angle = Math.atan2(targetY - originY, targetX - originX);
  const stretchX = flightP < 1 ? 1 + (1 - flightP) * 0.4 : 1;
  const stretchY = flightP < 1 ? 1 - (1 - flightP) * 0.15 : 1;

  return (
    <svg
      width={W} height={H}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="blur" />
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
        </filter>
      </defs>
      <g
        filter={`url(#${filterId})`}
        opacity={exitP}
        transform={`translate(${cx}, ${cy}) rotate(${(angle * 180) / Math.PI}) scale(${blobScale * scaleP * stretchX}, ${blobScale * scaleP * stretchY}) rotate(${(-angle * 180) / Math.PI})`}
      >
        {dots.map((d, i) => (
          <circle
            key={i}
            cx={d.dx}
            cy={d.dy}
            r={dotRadius * dotScale(d.phase)}
            fill={color}
          />
        ))}
      </g>
    </svg>
  );
};

/**
 * BurstDotRow: Elongated metaball (row of dots) that flies outward.
 */
const BurstDotRow: React.FC<{
  targetX: number;
  targetY: number;
  originX?: number;
  originY?: number;
  inFrame: number;
  outFrame: number;
  color: string;
  dotCount?: number;
  dotRadius?: number;
  dotGap?: number;
  angle?: number;
  filterId: string;
  flightDuration?: number;
}> = ({
  targetX, targetY,
  originX = CX, originY = CY,
  inFrame, outFrame, color,
  dotCount = 5, dotRadius = 25, dotGap = 35,
  angle = 0, filterId, flightDuration = 14,
}) => {
  const frame = useCurrentFrame();
  if (frame < inFrame || frame > outFrame) return null;

  const localF = frame - inFrame;
  const flightP = clamp01(localF / flightDuration);
  const eased = 1 - Math.pow(1 - flightP, 3);
  const cx = originX + (targetX - originX) * eased;
  const cy = originY + (targetY - originY) * eased;
  const exitP = frame > outFrame - 8 ? clamp01((outFrame - frame) / 8) : 1;

  return (
    <svg
      width={W} height={H}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} opacity={exitP}
        transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
        {Array.from({ length: dotCount }).map((_, i) => {
          const stagger = i;
          const dotF = localF - stagger;
          let s = 0;
          if (dotF > 0) {
            if (dotF < 8) s = (dotF / 8) * 1.3;
            else if (dotF < 13) s = 1.3 - (dotF - 8) / 5 * 0.3;
            else if (dotF < 22) s = 1.0;
            else if (dotF < 28) s = 1 + (dotF - 22) / 6 * 0.2;
            else if (dotF < 37) s = 1.2 * (1 - (dotF - 28) / 9);
            else s = 0;
          }
          return (
            <circle
              key={i}
              cx={(i - dotCount / 2) * dotGap}
              cy={0}
              r={dotRadius * Math.max(0, s)}
              fill={color}
            />
          );
        })}
      </g>
    </svg>
  );
};

/**
 * Expanding ring that accompanies the burst — matches the pink ring
 * visible in the AE reference.
 */
const BurstRing: React.FC<{
  inFrame: number;
  duration: number;
  color: string;
  maxRadius?: number;
  strokeWidth?: number;
}> = ({ inFrame, duration, color, maxRadius = 900, strokeWidth = 8 }) => {
  const frame = useCurrentFrame();
  const localF = frame - inFrame;
  if (localF < 0 || localF > duration) return null;

  const p = clamp01(localF / duration);
  const eased = 1 - Math.pow(1 - p, 2);
  const r = maxRadius * eased;
  const opacity = 1 - p;

  return (
    <svg
      width={W} height={H}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <circle
        cx={CX} cy={CY}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        opacity={opacity * 0.6}
      />
    </svg>
  );
};

/**
 * Splash shape — organic blob at a fixed position (for the centered splashes).
 */
const SplashShape: React.FC<{
  cx: number; cy: number;
  inFrame: number; outFrame: number;
  color: string; size: number;
  rotation?: number; elongated?: boolean;
}> = ({ cx, cy, inFrame, outFrame, color, size, rotation = 0, elongated = false }) => {
  const frame = useCurrentFrame();
  if (frame < inFrame || frame > outFrame) return null;
  const localF = frame - inFrame;
  const dur = outFrame - inFrame;
  const enterP = clamp01(localF / 5);
  const exitP = clamp01((dur - localF) / 5);
  const s = enterP * exitP;

  return (
    <div style={{
      position: "absolute",
      left: cx - size / 2, top: cy - (elongated ? size * 0.15 : size / 2),
      width: size, height: elongated ? size * 0.3 : size,
      borderRadius: elongated
        ? "50% 50% 50% 50% / 40% 40% 60% 60%"
        : "42% 58% 63% 37% / 45% 52% 48% 55%",
      backgroundColor: color,
      opacity: s * 0.8,
      transform: `scale(${s}) rotate(${rotation}deg)`,
      transformOrigin: "center center",
    }} />
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// UI WIDGETS + CURSOR + FOLDER
// ═══════════════════════════════════════════════════════════════════════════

const MiniWidget: React.FC<{
  x: number; y: number; scale: number;
  inFrame: number; outFrame: number;
  children: React.ReactNode;
}> = ({ x, y, scale, inFrame, outFrame, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < inFrame || frame > outFrame) return null;
  const p = spring({ frame: frame - inFrame, fps, config: { stiffness: 220, damping: 14, mass: 0.7 } });
  const bob = Math.sin(frame * 0.04 + inFrame) * 4;
  return (
    <div style={{
      position: "absolute", left: x, top: y + bob,
      transform: `scale(${scale * p / 100})`, opacity: p,
      transformOrigin: "center center",
    }}>
      {children}
    </div>
  );
};

const IconChart: React.FC = () => (
  <div style={{ width: 800, height: 680, background: `${C.white}E0`, borderRadius: 30, padding: 40,
    display: "flex", alignItems: "flex-end", gap: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
    {[0.45, 0.7, 0.5, 0.85].map((h, i) => (
      <div key={i} style={{ flex: 1, height: `${h * 100}%`, background: C.blue, borderRadius: 8 }} />
    ))}
  </div>
);

const IconCheckbox: React.FC = () => {
  const frame = useCurrentFrame();
  const pulse = 0.7 + 0.3 * Math.cos(frame * 0.13);
  return (
    <div style={{ width: 650, height: 650, background: `${C.white}E0`, borderRadius: 40, padding: 40,
      display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ width: 200, height: 200, borderRadius: 30, background: C.teal,
        transform: `scale(${pulse})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 100, color: C.white, fontWeight: 700 }}>✓</span>
      </div>
    </div>
  );
};

const IconDialog: React.FC<{ accent: string }> = ({ accent }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width: 1000, height: 650, background: `${C.white}E0`, borderRadius: 40, padding: 40,
      display: "flex", flexDirection: "column", gap: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <div style={{ width: "70%", height: 40, borderRadius: 20, background: `${accent}40` }} />
      <div style={{ width: "50%", height: 40, borderRadius: 20, background: `${C.blue}40`, alignSelf: "flex-end" }} />
      <div style={{ display: "flex", gap: 12, paddingTop: 10 }}>
        {[0, 10, 20].map((d, i) => {
          const s = 0.5 + 0.5 * Math.cos((frame - d) * 0.2);
          return <div key={i} style={{ width: 20, height: 20, borderRadius: "50%", background: accent, transform: `scale(${s})` }} />;
        })}
      </div>
    </div>
  );
};

const IconFolder: React.FC = () => (
  <div style={{ width: 1000, height: 650, background: `${C.white}E0`, borderRadius: 40, padding: 40,
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
    <div style={{ width: "35%", height: 40, borderRadius: "18px 18px 0 0", background: C.amber, marginBottom: 10 }} />
    <div style={{ width: "100%", height: 400, borderRadius: 20, background: `${C.amber}12` }} />
  </div>
);

const IconHearts: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ width: 1000, height: 650, background: `${C.white}E0`, borderRadius: 40, padding: 40,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 30,
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      {[0, 2, 4].map((d, i) => {
        const s = 0.85 + 0.23 * Math.cos((frame + d * 5) * 0.13);
        return <div key={i} style={{ fontSize: 100, transform: `scale(${s})` }}>❤️</div>;
      })}
    </div>
  );
};

const HandCursor: React.FC<{
  x: number; y: number; rotation: number; opacity: number; phase: number;
}> = ({ x, y, rotation, opacity, phase }) => {
  const paths = [
    "M50 75 L50 35 C50 25 60 20 65 30 L65 55 M65 55 L65 28 C65 18 75 15 80 25 L80 55 M80 55 L80 32 C80 22 90 20 95 30 L95 55 M95 55 L95 40 C95 30 105 30 110 40 L110 70 C110 95 100 110 75 110 L55 110 C40 110 35 100 35 90 L35 75 C35 65 45 65 50 75",
    "M55 78 L55 30 C55 18 70 18 70 30 L70 60 M70 48 C70 38 83 38 83 48 L83 68 M83 48 C83 38 96 38 96 48 L96 68 M96 52 C96 42 109 42 109 52 L109 75 C109 100 95 115 75 115 L60 115 C42 115 38 102 38 90 L38 78 C38 68 48 68 55 78",
    "M48 65 C48 55 58 52 63 60 L63 50 C63 40 73 38 78 48 L78 50 C78 40 88 38 93 48 L93 55 C93 45 103 45 108 55 L108 78 C108 100 95 112 75 112 L58 112 C42 112 38 100 38 88 L38 72 C38 62 45 60 48 65",
  ];
  const idx = phase < 10 ? 0 : phase < 16 ? 1 : 2;
  return (
    <div style={{
      position: "absolute", left: x - 50, top: y - 50, width: 100, height: 100,
      opacity, transform: `rotate(${rotation}deg)`,
      filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.25))",
    }}>
      <svg viewBox="25 10 100 115" width={100} height={100}>
        <path d={paths[idx]} fill={C.text} stroke="#FFF" strokeWidth={2}
          strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
};

const DraggedFolder: React.FC<{
  x: number; y: number; scaleP: number;
}> = ({ x, y, scaleP }) => {
  if (scaleP <= 0) return null;
  const scale = scaleP * 3.03;
  return (
    <div style={{
      position: "absolute", left: x - 180, top: y - 320, width: 160,
      opacity: clamp01(scaleP * 3),
      transform: `scale(${scale}) rotate(17deg)`, transformOrigin: "bottom center",
    }}>
      <div style={{
        background: C.white, borderRadius: 14, padding: 14,
        border: `2px solid ${C.amber}50`,
        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <div style={{ width: 28, height: 10, borderRadius: "6px 6px 0 0", background: C.amber }} />
        </div>
        {["Design review", "API deploy", "Sprint retro"].map((label, i) => {
          const rowP = clamp01((scaleP - 0.4 - i * 0.12) / 0.25);
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5, marginBottom: 4,
              opacity: rowP, transform: `translateX(${(1 - rowP) * 8}px)`,
            }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: [C.teal, C.blue, C.pink][i] }} />
              <span style={{ fontFamily: FONT, fontSize: 10, color: C.textMid }}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dot: React.FC<{
  x: number; y: number; inFrame: number; outFrame: number;
  color?: string; size?: number;
}> = ({ x, y, inFrame, outFrame, color = C.text, size = 18 }) => {
  const frame = useCurrentFrame();
  if (frame < inFrame || frame > outFrame) return null;
  const p = clamp01((frame - inFrame) / 4);
  const exit = clamp01((outFrame - frame) / 4);
  return (
    <div style={{
      position: "absolute", left: x - size / 2, top: y - size / 2,
      width: size, height: size, borderRadius: "50%", background: color,
      opacity: 0.6 * p * exit, transform: `scale(${p * exit})`,
    }} />
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════

export const AeReplicaAd: React.FC = () => {
  const frame = useCurrentFrame();

  // Arrow path (exact AE keyframes)
  const arrowX = kf(frame, [[16, 910], [31, 2116], [39, 2127], [47, 2116], [53, 2116], [63, 2067], [65, 2067], [74, 1910]]);
  const arrowY = kf(frame, [[16, -129], [31, 804], [39, 1060], [47, 804], [53, 804], [63, 1093], [65, 1093], [74, 1075]]);
  const arrowVisible = frame >= 16 && frame <= 78;

  // Cursor (exact AE path)
  const cursorX = kf(frame, [[131, 3132], [170, 2311]]);
  const cursorY = kf(frame, [[131, 2356], [170, 1364]]);
  const cursorVisible = frame >= 130;
  const cursorPhase = frame - 130;
  const folderScaleP = kf(frame, [[142, 0], [155, 100]]) / 100;

  // The burst origin: where blobs explode FROM (center of the text area)
  const burstOX = CX;
  const burstOY = CY;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>

      {/* ═══ EXPANDING BURST RINGS (visible in AE reference as pink ring) ═══ */}
      <BurstRing inFrame={65} duration={30} color={C.pink} maxRadius={1200} strokeWidth={6} />
      <BurstRing inFrame={68} duration={25} color={C.blue} maxRadius={800} strokeWidth={4} />
      <BurstRing inFrame={72} duration={20} color={C.amber} maxRadius={600} strokeWidth={3} />

      {/* ═══ DIRECTIONAL BLOB BURST ═══ */}
      {/* All blobs originate from center and FLY to their target positions */}
      {/* This creates the "explosion" / "shockwave" transition effect */}

      {/* Large white background blobs — fly outward to fill screen */}
      <BurstBlob targetX={700}  targetY={800}  originX={burstOX} originY={burstOY}
        inFrame={67} outFrame={150} color={C.white}
        dotRadius={180} dotSpacing={220} blobScale={3} filterId="lb1" flightDuration={16} />
      <BurstBlob targetX={2900} targetY={1300} originX={burstOX} originY={burstOY}
        inFrame={70} outFrame={150} color={C.white}
        dotRadius={160} dotSpacing={200} blobScale={2.8} filterId="lb2" flightDuration={18} />
      <BurstBlob targetX={1800} targetY={1700} originX={burstOX} originY={burstOY}
        inFrame={74} outFrame={150} color={C.white}
        dotRadius={140} dotSpacing={180} blobScale={2.5} filterId="lb3" flightDuration={14} />

      {/* Blue blobs — various directions outward */}
      <BurstBlob targetX={1304} targetY={1600} originX={burstOX} originY={burstOY}
        inFrame={68} outFrame={150} color={C.blue}
        dotRadius={70} dotSpacing={85} blobScale={1.5} filterId="bu1" flightDuration={14} />
      <BurstBlob targetX={3355} targetY={331}  originX={burstOX} originY={burstOY}
        inFrame={75} outFrame={150} color={C.blue}
        dotRadius={50} dotSpacing={55} blobScale={1.3} filterId="bu2" flightDuration={12} />
      <BurstBlob targetX={1917} targetY={1500} originX={burstOX} originY={burstOY}
        inFrame={79} outFrame={150} color={C.blue}
        dotRadius={55} dotSpacing={60} blobScale={1.2} filterId="bu3" flightDuration={13} />

      {/* Pink blobs — fly to corners */}
      <BurstBlob targetX={2452} targetY={400}  originX={burstOX} originY={burstOY}
        inFrame={72} outFrame={150} color={C.pink}
        dotRadius={45} dotSpacing={50} blobScale={1.4} filterId="bp1" flightDuration={13} />
      <BurstBlob targetX={581}  targetY={237}  originX={burstOX} originY={burstOY}
        inFrame={78} outFrame={150} color={C.pink}
        dotRadius={40} dotSpacing={45} blobScale={1.2} filterId="bp2" flightDuration={11} />

      {/* Amber blobs — scattered outward */}
      <BurstBlob targetX={840}  targetY={474}  originX={burstOX} originY={burstOY}
        inFrame={71} outFrame={150} color={C.amber}
        dotRadius={55} dotSpacing={65} blobScale={1.3} filterId="ba1" flightDuration={12} />
      <BurstBlob targetX={3140} targetY={1545} originX={burstOX} originY={burstOY}
        inFrame={76} outFrame={150} color={C.amber}
        dotRadius={60} dotSpacing={70} blobScale={1.4} filterId="ba2" flightDuration={14} />
      <BurstBlob targetX={667}  targetY={1700} originX={burstOX} originY={burstOY}
        inFrame={80} outFrame={150} color={C.amber}
        dotRadius={45} dotSpacing={50} blobScale={1.1} filterId="ba3" flightDuration={13} />

      {/* Teal elongated strokes — fly outward at angles */}
      <BurstDotRow targetX={272}  targetY={1392} originX={burstOX} originY={burstOY}
        inFrame={73} outFrame={150} color={C.teal}
        dotCount={5} dotRadius={22} dotGap={38} angle={-30} filterId="bt1" flightDuration={15} />
      <BurstDotRow targetX={2593} targetY={600}  originX={burstOX} originY={burstOY}
        inFrame={77} outFrame={150} color={C.teal}
        dotCount={4} dotRadius={18} dotGap={35} angle={20} filterId="bt2" flightDuration={13} />
      <BurstDotRow targetX={1829} targetY={392}  originX={burstOX} originY={burstOY}
        inFrame={82} outFrame={150} color={C.teal}
        dotCount={3} dotRadius={16} dotGap={40} angle={-10} filterId="bt3" flightDuration={11} />

      {/* ═══ SPLASH SHAPES (centered organic blobs) ═══ */}
      <SplashShape cx={CX} cy={CY} inFrame={72} outFrame={103} color={C.blue} size={280} rotation={15} />
      <SplashShape cx={CX + 100} cy={CY - 50} inFrame={73} outFrame={105} color={C.pink} size={220} rotation={-25} elongated />
      <SplashShape cx={CX - 80} cy={CY + 100} inFrame={76} outFrame={109} color={C.amber} size={260} rotation={40} elongated />
      <SplashShape cx={2437} cy={1088} inFrame={81} outFrame={107} color={C.teal} size={180} rotation={-10} />

      {/* ═══ DOTS ═══ */}
      <Dot x={CX} y={CY} inFrame={19} outFrame={35} />
      <Dot x={CX} y={CY} inFrame={35} outFrame={40} size={24} />
      <Dot x={CX} y={CY} inFrame={40} outFrame={75} color={C.blue} />
      <Dot x={CX - 200} y={CY + 100} inFrame={40} outFrame={75} color={C.pink} size={14} />

      {/* ═══ ARROW ═══ */}
      {arrowVisible && (
        <svg width={160} height={60}
          style={{
            position: "absolute", left: arrowX - 80, top: arrowY - 30,
            opacity: clamp01((frame - 16) / 4),
          }}>
          <line x1={10} y1={30} x2={120} y2={30} stroke={C.text} strokeWidth={5} strokeLinecap="round" />
          <polyline points="105,14 130,30 105,46" fill="none" stroke={C.text}
            strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* ═══ TEXT — Act 1: "Most workdays start with noise." (f0-78) ═══ */}
      <AeText text="Most" filterId="t1"
        posXKeys={[[0, 2137], [21, 1114], [56, 1114], [61, 846], [70, 846], [78, 1916]]}
        posYKeys={[[0, 1069], [78, 1069]]}
        inFrame={0} outFrame={66} swapFrame={10}
        size={200} weight={300} />
      <AeText text="workdays" filterId="t2"
        posXKeys={[[9, 2523], [29, 1729], [37, 1705], [44, 1729], [56, 1729], [61, 1461], [66, 1461]]}
        posYKeys={[[9, 1088], [33, 1088], [37, 1137], [44, 1088], [66, 1088]]}
        rotKeys={[[33, 0], [37, 7], [48, 0]]}
        inFrame={9} outFrame={66} swapFrame={17}
        size={200} weight={300} />
      <AeText text="start" filterId="t3"
        posXKeys={[[16, arrowX - 399], [66, arrowX - 399]]}
        posYKeys={[[16, arrowY + 673], [66, arrowY + 673]]}
        rotKeys={[[56, 0], [59, 19], [62, 0]]}
        inFrame={16} outFrame={64} swapFrame={30}
        size={200} weight={300} color={C.textMid} />
      <AeText text="with noise." filterId="t4"
        posXKeys={[[24, 3522], [35, 2643], [41, 2647], [47, 2643], [56, 2643], [61, 2727], [66, 2727]]}
        posYKeys={[[24, 1066], [35, 1066], [41, 1137], [47, 1066], [66, 1066]]}
        rotKeys={[[35, 0], [39, -4], [50, 0]]}
        inFrame={24} outFrame={66} swapFrame={36}
        size={200} weight={600} color={C.pink} />

      {/* ═══ TEXT — Act 2: "Not enough focus?" (f69-128) ═══ */}
      <AeText text="Not enough" filterId="t5"
        posXKeys={[[85, 1659], [89, 1654], [94, 1659], [101, 1659], [104, 1654], [107, 1659], [116, 1659], [128, 2027]]}
        posYKeys={[[85, 1080], [89, 1062], [94, 1080], [101, 1080], [104, 1078], [107, 1080], [128, 1080]]}
        rotKeys={[[85, 0], [89, -2], [94, 0], [101, 0], [104, 1], [107, 0]]}
        inFrame={69} outFrame={128} swapFrame={84}
        size={200} weight={300} />
      <AeText text="focus?" filterId="t6"
        posXKeys={[[91, 2483], [96, 2495], [100, 2483], [115, 2483], [127, 2191]]}
        posYKeys={[[91, 1080], [96, 1056], [100, 1080], [127, 1080]]}
        scaleKeys={[[73, 50], [94, 100]]}
        rotKeys={[[91, 0], [96, 2], [100, 0]]}
        inFrame={73} outFrame={127} swapFrame={100}
        size={200} weight={600} color={C.blue} />

      {/* ═══ TEXT — Act 3: "Drag your tasks" (f124+) ═══ */}
      <AeText text="Drag your" filterId="t7"
        posXKeys={[[139, 1930], [150, 1538]]}
        posYKeys={[[124, 1081], [150, 1081]]}
        scaleKeys={[[121, 135], [143, 90]]}
        inFrame={124} outFrame={150} swapFrame={132}
        size={200} weight={300} />
      <AeText text="tasks" filterId="t8"
        posXKeys={[[140, 1929], [150, 2286]]}
        posYKeys={[[140, 1062], [150, 1062]]}
        inFrame={140} outFrame={150} swapFrame={144}
        size={200} weight={600} color={C.amber} />

      {/* ═══ UI WIDGETS (at AE positions and scales) ═══ */}
      <MiniWidget x={1481} y={675}  scale={15} inFrame={90}  outFrame={139}><IconChart /></MiniWidget>
      <MiniWidget x={2526} y={273}  scale={25} inFrame={92}  outFrame={141}><IconCheckbox /></MiniWidget>
      <MiniWidget x={695}  y={1890} scale={25} inFrame={94}  outFrame={143}><IconDialog accent={C.pink} /></MiniWidget>
      <MiniWidget x={2904} y={984}  scale={20} inFrame={96}  outFrame={145}><IconDialog accent={C.blue} /></MiniWidget>
      <MiniWidget x={342}  y={821}  scale={15} inFrame={98}  outFrame={147}><IconFolder /></MiniWidget>
      <MiniWidget x={3316} y={1162} scale={37} inFrame={100} outFrame={149}><IconHearts /></MiniWidget>

      {/* ═══ CURSOR + DRAGGED FOLDER ═══ */}
      {cursorVisible && (
        <>
          <DraggedFolder x={cursorX} y={cursorY} scaleP={folderScaleP} />
          <HandCursor x={cursorX} y={cursorY} rotation={-17}
            opacity={clamp01((frame - 130) / 4)} phase={cursorPhase} />
        </>
      )}
    </AbsoluteFill>
  );
};
