/**
 * SharedSalonBooking — "The Booking Effect"
 *
 * Brand new bespoke Shared Salon ad built from motion-design first principles.
 * Motion language extracted from the five reference Lottie files:
 *
 *   Be Bold    → cubic-bezier(0, 0.647, 0.36, 1) decelerate curve on every text entrance.
 *                Words stagger 15–17 frames. Scene exits: dramatic scale punch-out.
 *
 *   broom      → Extreme easing asymmetry (0.892,0)→(0,1): instant departure, glacial arrival.
 *                High intermediate-keyframe density makes motion feel physically alive.
 *
 *   Confetti   → Parabolic arc trajectories. Squash-stretch on every particle:
 *                scaleX:50 scaleY:100 when moving fast → 100,100 at apex.
 *                Primary particle + 50%-opacity shadow copy for depth.
 *                Stagger launches 2–3 frames apart.
 *
 * Scene layout (30 fps, 450 total = 15s):
 *   Scene 1  0–74    (2.5s) THE PING     — Chair idles; notification badge DROPS with squash landing
 *   Scene 2  75–164  (3.0s) THE BURST    — Confetti erupts; revenue counter slams in
 *   Scene 3  165–254 (3.0s) PROOF        — 3 stat pills arc-fly in from different vectors
 *   Scene 4  255–344 (3.0s) THE MESSAGE  — Kinetic text stagger with Be Bold deceleration
 *   Scene 5  345–449 (3.5s) THE CTA      — CTA card drops, squashes, confetti micro-burst
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";

/* ─────────────────────────────── SCHEMA ─────────────────────────────────── */

export const bookingSchema = z.object({
  // Brand colors
  primaryColor: zColor(),
  bgColor: zColor(),
  textColor: zColor(),
  accentColor: zColor(),
  // Scene 1 — Hook
  headlineLine1: z.string(),
  headlineLine2: z.string(),
  // Scene 4 — Kinetic text
  kineticLine1: z.string(),
  kineticLine2: z.string(),
  kineticLine3: z.string(),
  // Scene 5 — CTA
  ctaBadge: z.string(),
  ctaHeadline: z.string(),
  ctaSubtext: z.string(),
  ctaButtonText: z.string(),
  ctaUrl: z.string(),
});

export type BookingProps = z.infer<typeof bookingSchema>;

export const bookingDefaultProps: BookingProps = {
  primaryColor: "#2563EB",
  bgColor: "#FAF8F5",
  textColor: "#0B1730",
  accentColor: "#E7D3A7",
  headlineLine1: "Turn Empty Chairs",
  headlineLine2: "Into Revenue",
  kineticLine1: "Empty chairs.",
  kineticLine2: "Quiet periods.",
  kineticLine3: "Not anymore.",
  ctaBadge: "Beta Access Now Open ✨",
  ctaHeadline: "Join the Beta",
  ctaSubtext: "List your chair with Shared Salon",
  ctaButtonText: "Join the Beta →",
  ctaUrl: "sharedsalon.com.au",
};

/* ─────────────────────────────── BRAND TOKENS ─────────────────────────────── */

// Fallback defaults — overridden at runtime via ColorsContext
const DEFAULT_C = {
  primary: "#2563EB",
  secondary: "#DCE8FF",
  accent: "#E7D3A7",
  bg: "#FAF8F5",
  text: "#0B1730",
  body: "#66758F",
  border: "#D8DEE8",
  surface: "#F4F7FC",
  glow: "rgba(37,99,235,0.12)",
  glowStrong: "rgba(37,99,235,0.25)",
};

type BrandColors = typeof DEFAULT_C;
const ColorsContext = React.createContext<BrandColors>(DEFAULT_C);

// Convenience alias — components inside the composition use useColors()
const useColors = () => React.useContext(ColorsContext);

/* ─────────────────────────────── EASING CURVES ────────────────────────────── */

// Cubic bezier Y interpolation (treating time as Bezier parameter — good approximation for easing)
const bezierY = (t: number, p1y: number, p2y: number): number => {
  const u = 1 - t;
  return 3 * u * u * t * p1y + 3 * u * t * t * p2y + t * t * t;
};

// Be Bold deceleration: cubic-bezier(0, 0.647, 0.36, 1)
// Fast initial velocity, strong deceleration to rest — luxurious landing feel
const easeDecelerate = (t: number) => bezierY(Math.max(0, Math.min(1, t)), 0.647, 1.0);

// Snap: fast out, overshooting arrive — inspired by broom easing (0.892,0)→(0,1)
const easeSnap = (t: number) => {
  const clamped = Math.max(0, Math.min(1, t));
  // Fast early progress, slow arrival
  return 1 - Math.pow(1 - clamped, 3.5);
};

// Standard ease for subtle motion
const easeStandard = (t: number) => bezierY(Math.max(0, Math.min(1, t)), 0, 1.0);

/* ─────────────────────────────── HELPERS ───────────────────────────────────── */

// Deterministic pseudo-random (no Math.random() in Remotion rendering)
const seededRand = (seed: number): number => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ─────────────────────────────────────────────────────────────────────────────
   CONFETTI BURST SYSTEM
   Replicates the parabolic arc + squash-stretch physics from the reference files.
   Primary particle + 50%-opacity shadow copy for depth (from confetti JSON pattern).
   ───────────────────────────────────────────────────────────────────────────── */

type ParticleShape = "circle" | "star" | "rect" | "square";

interface ParticleState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  size: number;
}

const BRAND_COLORS = [
  DEFAULT_C.primary, DEFAULT_C.accent, "#F59E0B", "#34D399", "#EC4899", "#8B5CF6",
  DEFAULT_C.secondary, "#10B981",
];

const getParticleState = (
  index: number,
  localFrame: number,
  count: number
): ParticleState => {
  const r = (s: number) => seededRand(index * 37.3 + s);

  // Stagger launch by 2-3 frames (from Lottie pattern)
  const launchDelay = Math.floor(index / 2) * 2;
  const adjusted = localFrame - launchDelay;
  if (adjusted <= 0) return { x: 0, y: 0, scaleX: 0, scaleY: 0, rotation: 0, opacity: 0, size: 0 };

  const angle = (index / count) * Math.PI * 2 + r(3.1) * 0.6;
  const maxDist = 120 + r(5.1) * 200;
  const duration = 35 + r(2.3) * 30;
  const t = Math.min(adjusted / duration, 1);

  // Parabolic trajectory (from confetti file physics)
  const xPos = Math.cos(angle) * maxDist * t;
  const gravity = maxDist * 0.5 * t * t;
  const yPos = -(maxDist * 0.8) * Math.sin(Math.PI * t * 0.85) + gravity;

  // Squash-stretch based on y-velocity (from confetti JSON squash pattern)
  // At launch: tall/narrow (scaleX:50 scaleY:100 in Lottie terms)
  // At apex: round (100,100)
  // On descent: tall again then wide on "landing"
  const yVel = Math.abs(Math.cos(Math.PI * t * 0.85));
  const scaleX = 1 - yVel * 0.4;  // narrow when fast, round at apex
  const scaleY = 1 + yVel * 0.5;  // tall when fast

  // Continuous rotation throughout flight (from Lottie rotation property)
  const rotDir = index % 2 === 0 ? 1 : -1;
  const rotSpeed = 8 + r(9.1) * 15;
  const rotation = adjusted * rotSpeed * rotDir;

  // Opacity: quick fade-in, hold, fade-out at end
  const opacity = t < 0.1
    ? t / 0.1
    : t > 0.75
    ? 1 - (t - 0.75) / 0.25
    : 1;

  // Shadow copy: 50% opacity (from Lottie "b" layer pattern)
  const isShadow = index % 2 === 1;
  const finalOpacity = opacity * (isShadow ? 0.5 : 1.0);

  const size = 8 + r(11.7) * 10;

  return { x: xPos, y: yPos, scaleX, scaleY, rotation, opacity: finalOpacity, size };
};

const PARTICLE_SHAPES: ParticleShape[] = ["circle", "star", "rect", "square", "circle", "star"];

const ParticleDot: React.FC<{
  state: ParticleState;
  shape: ParticleShape;
  color: string;
}> = ({ state, shape, color }) => {
  if (state.opacity <= 0) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    transformOrigin: "center center",
    transform: `translate(${state.x}px, ${state.y}px) scaleX(${state.scaleX}) scaleY(${state.scaleY}) rotate(${state.rotation}deg)`,
    opacity: state.opacity,
  };

  if (shape === "circle") {
    return (
      <div style={{
        ...style,
        width: state.size,
        height: state.size,
        borderRadius: "50%",
        backgroundColor: color,
        marginLeft: -state.size / 2,
        marginTop: -state.size / 2,
      }} />
    );
  }

  if (shape === "rect") {
    return (
      <div style={{
        ...style,
        width: state.size * 1.8,
        height: state.size * 0.9,
        borderRadius: 2,
        backgroundColor: color,
        marginLeft: -(state.size * 1.8) / 2,
        marginTop: -state.size / 2,
      }} />
    );
  }

  if (shape === "square") {
    return (
      <div style={{
        ...style,
        width: state.size,
        height: state.size,
        borderRadius: 3,
        backgroundColor: color,
        marginLeft: -state.size / 2,
        marginTop: -state.size / 2,
      }} />
    );
  }

  // Star shape (SVG)
  const s = state.size * 1.4;
  return (
    <div style={{ ...style, width: s, height: s, marginLeft: -s / 2, marginTop: -s / 2 }}>
      <svg viewBox="0 0 24 24" width={s} height={s}>
        <polygon
          points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
          fill={color}
        />
      </svg>
    </div>
  );
};

const ConfettiBurst: React.FC<{
  startFrame: number;
  count?: number;
  cx?: number; // center x (px from left)
  cy?: number; // center y (px from top)
}> = ({ startFrame, count = 28, cx = 540, cy = 960 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0 || localFrame > 80) return null;

  return (
    <div style={{ position: "absolute", left: cx, top: cy, width: 0, height: 0 }}>
      {Array.from({ length: count }, (_, i) => {
        const state = getParticleState(i, localFrame, count);
        const shape = PARTICLE_SHAPES[i % PARTICLE_SHAPES.length];
        const color = BRAND_COLORS[i % BRAND_COLORS.length];
        return <ParticleDot key={i} state={state} shape={shape} color={color} />;
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SQUASH-DROP ELEMENT
   Element drops from above and squashes on landing.
   Physics inspired by Be Bold text entrance + confetti particle landing.
   ───────────────────────────────────────────────────────────────────────────── */

const useSquashDrop = (
  startFrame: number,
  opts: { dropDistance?: number; duration?: number } = {}
) => {
  const frame = useCurrentFrame();
  const { dropDistance = 180, duration = 22 } = opts;

  const localFrame = frame - startFrame;
  if (localFrame < 0) return { y: -dropDistance, scaleX: 1, scaleY: 1, opacity: 0 };

  const t = Math.min(localFrame / duration, 1);
  const IMPACT = 0.65; // 65% through animation = impact point

  if (t < IMPACT) {
    // Drop phase: gravity-accelerated fall (quadratic)
    const dropT = t / IMPACT;
    const y = -dropDistance * (1 - dropT * dropT);
    return { y, scaleX: 1, scaleY: 1, opacity: interpolate(t, [0, 0.1], [0, 1]) };
  }

  // Impact and settle phase
  const impactT = (t - IMPACT) / (1 - IMPACT); // 0→1 after impact
  const SQUASH_END = 0.3;
  const OVERSHOOT_END = 0.65;

  const scaleY =
    impactT < SQUASH_END
      ? interpolate(impactT / SQUASH_END, [0, 1], [0.72, 1.06]) // squash then overshoot Y
      : impactT < OVERSHOOT_END
      ? interpolate((impactT - SQUASH_END) / (OVERSHOOT_END - SQUASH_END), [0, 1], [1.06, 0.98])
      : interpolate((impactT - OVERSHOOT_END) / (1 - OVERSHOOT_END), [0, 1], [0.98, 1.0]);

  const scaleX =
    impactT < SQUASH_END
      ? interpolate(impactT / SQUASH_END, [0, 1], [1.28, 0.96]) // squash X expands, then contracts
      : impactT < OVERSHOOT_END
      ? interpolate((impactT - SQUASH_END) / (OVERSHOOT_END - SQUASH_END), [0, 1], [0.96, 1.02])
      : interpolate((impactT - OVERSHOOT_END) / (1 - OVERSHOOT_END), [0, 1], [1.02, 1.0]);

  return { y: 0, scaleX, scaleY, opacity: 1 };
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAGGER TEXT (Be Bold style)
   Each line slides up from +56px below with easeDecelerate curve.
   Stagger: 25 frames between lines (Be Bold used 15–17f at 60fps → 8–9f at 30fps,
   but for more drama we use 20–25f).
   ───────────────────────────────────────────────────────────────────────────── */

const StaggerLine: React.FC<{
  startFrame: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  delay?: number;
}> = ({ startFrame, children, style = {}, delay = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame - delay;
  const duration = 28;

  const t = Math.max(0, Math.min(localFrame / duration, 1));
  const eased = easeDecelerate(t);

  const y = (1 - eased) * 56;
  const opacity = interpolate(t, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        transform: `translateY(${y}px)`,
        opacity,
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ARC FLY-IN (stat pills)
   Element travels a curved parabolic arc to its resting position.
   Landing uses squash-stretch physics.
   Vector direction configurable per pill.
   ───────────────────────────────────────────────────────────────────────────── */

const useArcFlyIn = (startFrame: number, opts: {
  fromX?: number;
  fromY?: number;
  arcHeight?: number;
  duration?: number;
} = {}) => {
  const frame = useCurrentFrame();
  const { fromX = -300, fromY = -200, arcHeight = -120, duration = 30 } = opts;
  const localFrame = frame - startFrame;

  if (localFrame < 0) return { x: fromX, y: fromY, scaleX: 1, scaleY: 1, opacity: 0 };

  const t = Math.min(localFrame / duration, 1);
  const eased = easeSnap(t);

  // Parabolic arc: x interpolates linearly, y follows a sine arc
  const x = fromX * (1 - eased);
  const yLinear = fromY * (1 - eased);
  const yCurve = arcHeight * Math.sin(Math.PI * eased); // arc peak at midpoint
  const y = yLinear + yCurve;

  const IMPACT = 0.85;
  const impactT = Math.max(0, (t - IMPACT) / (1 - IMPACT));

  const scaleY =
    impactT < 0.4
      ? interpolate(impactT / 0.4, [0, 1], [0.78, 1.05])
      : interpolate((impactT - 0.4) / 0.6, [0, 1], [1.05, 1.0]);

  const scaleX =
    impactT < 0.4
      ? interpolate(impactT / 0.4, [0, 1], [1.22, 0.97])
      : interpolate((impactT - 0.4) / 0.6, [0, 1], [0.97, 1.0]);

  const opacity = interpolate(t, [0, 0.08], [0, 1], { extrapolateRight: "clamp" });

  return { x, y, scaleX, scaleY, opacity };
};

/* ─────────────────────────────────────────────────────────────────────────────
   AMBIENT SPARKLES (subtle background layer)
   ───────────────────────────────────────────────────────────────────────────── */

const AmbientSparkles: React.FC = () => {
  const frame = useCurrentFrame();
  const C = useColors();

  const SPARKLES = [
    { x: 80, y: 280, period: 60, size: 8, delay: 0 },
    { x: 980, y: 420, period: 75, size: 6, delay: 15 },
    { x: 150, y: 700, period: 50, size: 10, delay: 8 },
    { x: 900, y: 800, period: 65, size: 7, delay: 22 },
    { x: 400, y: 180, period: 80, size: 5, delay: 35 },
    { x: 700, y: 300, period: 55, size: 9, delay: 12 },
    { x: 200, y: 1200, period: 70, size: 6, delay: 40 },
    { x: 850, y: 1300, period: 45, size: 8, delay: 5 },
  ];

  return (
    <>
      {SPARKLES.map((sp, i) => {
        const phase = ((frame + sp.delay) % sp.period) / sp.period;
        const opacity = Math.sin(phase * Math.PI) * 0.7;
        const scale = 0.6 + Math.sin(phase * Math.PI) * 0.4;
        const rot = frame * (i % 2 === 0 ? 2 : -1.5);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sp.x,
              top: sp.y,
              width: sp.size,
              height: sp.size,
              opacity,
              transform: `rotate(${rot}deg) scale(${scale})`,
              transformOrigin: "center",
            }}
          >
            <svg viewBox="0 0 24 24" width={sp.size} height={sp.size}>
              <path
                d="M12 2L13.4 9.3L20 8L14.9 13.1L18 19.9L12 16L6 19.9L9.1 13.1L4 8L10.6 9.3Z"
                fill={C.accent}
              />
            </svg>
          </div>
        );
      })}
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   NOTIFICATION BADGE
   Drops with squash landing, has push notification design
   ───────────────────────────────────────────────────────────────────────────── */

const NotificationBadge: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const { y, scaleX, scaleY, opacity } = useSquashDrop(startFrame, { dropDistance: 220, duration: 24 });
  const frame = useCurrentFrame();
  const C = useColors();

  // Subtle bounce of the badge after landing
  const bouncePhase = Math.max(0, frame - startFrame - 24);
  const bounce = bouncePhase > 0 ? Math.sin(bouncePhase * 0.4) * 3 * Math.exp(-bouncePhase * 0.08) : 0;

  // Ping ripple effect on landing
  const rippleStart = startFrame + 15;
  const rippleFrame = Math.max(0, frame - rippleStart);
  const rippleT = Math.min(rippleFrame / 20, 1);
  const rippleScale = 1 + rippleT * 1.5;
  const rippleOpacity = (1 - rippleT) * 0.4;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 340,
        transform: `translateX(-50%) translateY(${y + bounce}px) scaleX(${scaleX}) scaleY(${scaleY})`,
        opacity,
        transformOrigin: "bottom center",
        zIndex: 10,
      }}
    >
      {/* Ping ripple */}
      {rippleT < 1 && (
        <div style={{
          position: "absolute",
          inset: -10,
          borderRadius: 24,
          border: `2px solid ${C.primary}`,
          transform: `scale(${rippleScale})`,
          opacity: rippleOpacity,
          pointerEvents: "none",
        }} />
      )}

      {/* Badge body */}
      <div
        style={{
          background: "white",
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          padding: "18px 28px 18px 22px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 8px 40px rgba(37,99,235,0.18), 0 2px 8px rgba(0,0,0,0.08)",
          minWidth: 380,
        }}
      >
        {/* App icon */}
        <div style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: `linear-gradient(135deg, ${C.primary} 0%, #1d4ed8 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 26,
        }}>✂</div>

        <div>
          <div style={{
            fontSize: 22,
            fontWeight: 700,
            color: C.text,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -0.3,
          }}>
            Shared Salon
          </div>
          <div style={{
            fontSize: 19,
            color: C.body,
            fontFamily: "system-ui, sans-serif",
            marginTop: 2,
            fontWeight: 500,
          }}>
            💸 New booking — <span style={{ color: C.primary, fontWeight: 700 }}>+$120 earned</span>
          </div>
        </div>

        {/* Unread dot */}
        <div style={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          background: C.primary,
          flexShrink: 0,
          marginLeft: "auto",
        }} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SALON CHAIR (simplified clean version)
   ───────────────────────────────────────────────────────────────────────────── */

const ChairHero: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const C = useColors();
  const localFrame = frame - startFrame;

  const floatY = Math.sin(localFrame * 0.04) * 8;
  const glowPulse = 0.6 + Math.sin(localFrame * 0.05) * 0.4;

  const enterT = Math.min(localFrame / 20, 1);
  const enterEased = easeDecelerate(enterT);
  const enterY = (1 - enterEased) * 60;
  const enterOpacity = interpolate(enterT, [0, 0.3], [0, 1]);

  // React to notification at frame 24
  const reactionFrame = Math.max(0, localFrame - 28);
  const reactionBob = reactionFrame > 0
    ? Math.sin(reactionFrame * 0.5) * 12 * Math.exp(-reactionFrame * 0.06)
    : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 700,
        transform: `translateX(-50%) translateY(${floatY + enterY + reactionBob}px)`,
        opacity: enterOpacity,
      }}
    >
      {/* Glow halo */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: 340,
        height: 340,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,${0.08 * glowPulse}) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Chair SVG */}
      <svg width={260} height={300} viewBox="0 0 260 300">
        {/* Base */}
        <ellipse cx={130} cy={280} rx={80} ry={10} fill="rgba(37,99,235,0.12)" />
        <rect x={110} y={255} width={40} height={30} rx={8} fill="#0D1525" />
        {/* Stem */}
        <rect x={122} y={200} width={16} height={60} rx={4} fill="#1a2540" />
        {/* Seat */}
        <rect x={70} y={185} width={120} height={30} rx={10} fill="#0D1525" />
        {/* Armrests */}
        <rect x={55} y={150} width={18} height={45} rx={6} fill="#1a2540" />
        <rect x={187} y={150} width={18} height={45} rx={6} fill="#1a2540" />
        {/* Backrest */}
        <rect x={75} y={75} width={110} height={120} rx={14} fill="#0D1525" />
        {/* Tufted grid highlight lines */}
        {[95, 115, 135, 155].map((y, i) => (
          <line key={i} x1={85} y1={y} x2={175} y2={y}
            stroke="#2563EB" strokeWidth={1.5} strokeOpacity={0.4} />
        ))}
        {[105, 130, 155].map((x, i) => (
          <line key={i} x1={x} y1={80} x2={x} y2={195}
            stroke="#2563EB" strokeWidth={1.5} strokeOpacity={0.4} />
        ))}
        {/* Headrest */}
        <rect x={90} y={55} width={80} height={35} rx={10} fill="#0D1525" />
        {/* Blue outline accent */}
        <rect x={75} y={75} width={110} height={120} rx={14} fill="none"
          stroke="#2563EB" strokeWidth={2} strokeOpacity={0.6} />
        <rect x={90} y={55} width={80} height={35} rx={10} fill="none"
          stroke="#2563EB" strokeWidth={2} strokeOpacity={0.6} />
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   REVENUE COUNTER
   Number counts up with squash-stretch on each digit increment.
   ───────────────────────────────────────────────────────────────────────────── */

const RevenueCounter: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const frame = useCurrentFrame();
  const C = useColors();
  // useSquashDrop must be called unconditionally before any early return
  const cardDrop = useSquashDrop(startFrame, { dropDistance: 150, duration: 20 });
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;

  const duration = 45;
  const t = Math.min(localFrame / duration, 1);
  const eased = easeDecelerate(t);
  const amount = Math.floor(eased * 120);

  // Squash-stretch on the number as it changes (inspired by Be Bold number animation)
  const digitPhase = (amount % 10) / 10;
  const digitScaleY = 1 + Math.sin(digitPhase * Math.PI) * 0.08;
  const digitScaleX = 1 - Math.sin(digitPhase * Math.PI) * 0.04;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: 460,
        transform: `translateX(-50%) translateY(${cardDrop.y}px) scaleX(${cardDrop.scaleX}) scaleY(${cardDrop.scaleY})`,
        opacity: cardDrop.opacity,
        transformOrigin: "top center",
      }}
    >
      <div style={{
        background: `linear-gradient(135deg, ${C.primary} 0%, #1d4ed8 100%)`,
        borderRadius: 28,
        padding: "32px 52px",
        textAlign: "center",
        boxShadow: `0 20px 60px rgba(37,99,235,0.4), 0 4px 12px rgba(0,0,0,0.15)`,
        minWidth: 320,
      }}>
        <div style={{
          fontSize: 22,
          color: "rgba(255,255,255,0.7)",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
          marginBottom: 8,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        }}>
          This month
        </div>

        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          gap: 4,
        }}>
          <span style={{
            fontSize: 42,
            color: C.accent,
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            lineHeight: 1,
            marginTop: 8,
          }}>$</span>
          <div style={{
            fontSize: 88,
            color: "white",
            fontFamily: "Georgia, serif",
            fontWeight: 700,
            lineHeight: 1,
            transform: `scaleX(${digitScaleX}) scaleY(${digitScaleY})`,
            transformOrigin: "center bottom",
          }}>
            {amount.toString().padStart(3, "0")}
          </div>
        </div>

        <div style={{
          fontSize: 20,
          color: "rgba(255,255,255,0.6)",
          fontFamily: "system-ui, sans-serif",
          marginTop: 8,
        }}>
          earned from unused chairs
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   STAT PILL — arc fly-in with squash landing
   ───────────────────────────────────────────────────────────────────────────── */

interface StatPillProps {
  startFrame: number;
  icon: string;
  label: string;
  sub: string;
  fromX: number;
  fromY: number;
  arcHeight: number;
  top: number;
  left: string | number;
  accentColor?: string;
}

const StatPill: React.FC<StatPillProps> = ({
  startFrame, icon, label, sub, fromX, fromY, arcHeight, top, left, accentColor,
}) => {
  const arcState = useArcFlyIn(startFrame, { fromX, fromY, arcHeight, duration: 28 });
  const C = useColors();
  const resolvedAccent = accentColor ?? C.primary;

  return (
    <div style={{
      position: "absolute",
      top,
      left,
      transform: `translate(${arcState.x}px, ${arcState.y}px) scaleX(${arcState.scaleX}) scaleY(${arcState.scaleY})`,
      opacity: arcState.opacity,
      transformOrigin: "center center",
    }}>
      <div style={{
        background: "white",
        border: `1.5px solid ${C.border}`,
        borderRadius: 20,
        padding: "20px 28px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.06)",
        minWidth: 280,
      }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: `${resolvedAccent}18`,
          border: `1.5px solid ${resolvedAccent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{
            fontSize: 28,
            fontWeight: 800,
            color: resolvedAccent,
            fontFamily: "Georgia, serif",
            lineHeight: 1.1,
          }}>
            {label}
          </div>
          <div style={{
            fontSize: 17,
            color: C.body,
            fontFamily: "system-ui, sans-serif",
            marginTop: 2,
          }}>
            {sub}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   CTA CARD — drops with squash landing, confetti micro-burst
   ───────────────────────────────────────────────────────────────────────────── */

const CTACard: React.FC<{
  startFrame: number;
  ctaHeadline: string;
  ctaSubtext: string;
  ctaButtonText: string;
  ctaUrl: string;
}> = ({ startFrame, ctaHeadline, ctaSubtext, ctaButtonText, ctaUrl }) => {
  const frame = useCurrentFrame();
  const C = useColors();
  const { y, scaleX, scaleY, opacity } = useSquashDrop(startFrame, {
    dropDistance: 280,
    duration: 26,
  });

  const localFrame = frame - startFrame;

  // Button scale-in after card lands (frame 26+)
  const btnT = Math.max(0, Math.min((localFrame - 26) / 18, 1));
  const btnScale = easeDecelerate(btnT);
  const btnOpacity = interpolate(btnT, [0, 0.2], [0, 1]);

  // URL fades in last
  const urlT = Math.max(0, Math.min((localFrame - 40) / 15, 1));
  const urlOpacity = easeStandard(urlT);

  // Reflection sweep across button (like Be Bold gradient stroke)
  const sweepT = Math.max(0, Math.min((localFrame - 30) / 25, 1));
  const sweepX = interpolate(sweepT, [0, 1], [-100, 400]);

  return (
    <>
      {/* Confetti micro-burst when card lands */}
      <ConfettiBurst startFrame={startFrame + 15} count={20} cx={540} cy={980} />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 600,
          transform: `translateX(-50%) translateY(${y}px) scaleX(${scaleX}) scaleY(${scaleY})`,
          opacity,
          transformOrigin: "top center",
          width: 820,
        }}
      >
        <div style={{
          background: "white",
          border: `1.5px solid ${C.border}`,
          borderRadius: 36,
          padding: "56px 60px",
          textAlign: "center",
          boxShadow: "0 24px 80px rgba(37,99,235,0.15), 0 4px 16px rgba(0,0,0,0.08)",
          overflow: "hidden",
          position: "relative",
        }}>
          {/* Subtle blue background wash */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 60%)`,
            pointerEvents: "none",
          }} />

          {/* Headline */}
          <div style={{
            fontSize: 68,
            fontWeight: 800,
            color: C.text,
            fontFamily: "Georgia, serif",
            letterSpacing: -1.5,
            lineHeight: 1.1,
            marginBottom: 16,
          }}>
            {ctaHeadline}
          </div>

          <div style={{
            fontSize: 28,
            color: C.body,
            fontFamily: "system-ui, sans-serif",
            marginBottom: 40,
          }}>
            {ctaSubtext}
          </div>

          {/* CTA Button */}
          <div style={{
            transform: `scale(${btnScale})`,
            opacity: btnOpacity,
            transformOrigin: "center",
            position: "relative",
            display: "inline-block",
            overflow: "hidden",
            borderRadius: 18,
          }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, #1d4ed8 100%)`,
              borderRadius: 18,
              padding: "26px 64px",
              fontSize: 32,
              fontWeight: 700,
              color: "white",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -0.3,
              position: "relative",
            }}>
              {ctaButtonText}

              {/* Reflection sweep (from Be Bold gradient stroke pattern) */}
              <div style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: sweepX,
                width: 80,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                transform: "skewX(-20deg)",
                pointerEvents: "none",
              }} />
            </div>
          </div>

          {/* URL */}
          <div style={{
            marginTop: 28,
            fontSize: 22,
            color: C.body,
            fontFamily: "system-ui, sans-serif",
            opacity: urlOpacity,
          }}>
            {ctaUrl}
          </div>
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SCENE 1 — THE PING (0–74f)
   Chair floats; notification badge drops with squash landing
   ───────────────────────────────────────────────────────────────────────────── */

const ScenePing: React.FC<{ headlineLine1: string; headlineLine2: string }> = ({ headlineLine1, headlineLine2 }) => {
  const frame = useCurrentFrame();
  const C = useColors();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Atmospheric blue glow (top) */}
      <div style={{
        position: "absolute",
        top: -200,
        left: "50%",
        transform: "translateX(-50%)",
        width: 900,
        height: 600,
        background: `radial-gradient(ellipse, rgba(37,99,235,0.10) 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <AmbientSparkles />
      <ChairHero startFrame={0} />
      <NotificationBadge startFrame={18} />

      {/* Headline that appears underneath */}
      <StaggerLine
        startFrame={40}
        style={{
          position: "absolute",
          bottom: 200,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{
          fontSize: 52,
          fontWeight: 800,
          color: C.text,
          fontFamily: "Georgia, serif",
          letterSpacing: -1,
        }}>
          {headlineLine1}
        </div>
      </StaggerLine>

      <StaggerLine
        startFrame={40}
        delay={20}
        style={{
          position: "absolute",
          bottom: 138,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{
          fontSize: 52,
          fontWeight: 800,
          color: C.primary,
          fontFamily: "Georgia, serif",
          letterSpacing: -1,
        }}>
          {headlineLine2}
        </div>
      </StaggerLine>
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SCENE 2 — THE BURST (75–164f)
   Confetti erupts from chair; revenue counter slams in
   ───────────────────────────────────────────────────────────────────────────── */

const SceneBurst: React.FC = () => {
  const frame = useCurrentFrame();
  const C = useColors();

  // Brief blue wash on confetti burst — fades in over 15f then out over 20f
  const pulseT = Math.min(frame / 15, 1);
  const pulseOut = Math.max(0, Math.min((frame - 15) / 20, 1));
  const glowOpacity = (easeDecelerate(pulseT) - easeDecelerate(pulseOut)) * 0.08;

  // Radial burst expands from 0 to full size over 12 frames, then fades
  const burstRadius = interpolate(Math.min(frame / 12, 1), [0, 1], [0, 1400]);
  const burstOpacity = (1 - easeDecelerate(Math.min(frame / 30, 1)) * 0.5) * 0.5;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Blue flash overlay on burst (properly layered, no z-index tricks) */}
      {glowOpacity > 0.001 && (
        <div style={{
          position: "absolute",
          inset: 0,
          background: `rgba(37, 99, 235, ${glowOpacity})`,
          pointerEvents: "none",
        }} />
      )}

      {/* Expanding radial glow from chair position */}
      {burstRadius > 0 && (
        <div style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: burstRadius,
          height: burstRadius,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)`,
          opacity: burstOpacity,
          pointerEvents: "none",
        }} />
      )}

      <AmbientSparkles />

      {/* Chair in bg (continuity) */}
      <div style={{ opacity: 0.3 }}>
        <ChairHero startFrame={0} />
      </div>

      {/* Main confetti burst from chair position */}
      <ConfettiBurst startFrame={0} count={36} cx={540} cy={900} />

      {/* Revenue counter */}
      <RevenueCounter startFrame={8} />

      {/* Sub label */}
      <StaggerLine
        startFrame={30}
        style={{
          position: "absolute",
          bottom: 160,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{
          fontSize: 30,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
        }}>
          from chairs that would otherwise sit empty
        </div>
      </StaggerLine>

      {/* Tagline */}
      <StaggerLine
        startFrame={50}
        style={{
          position: "absolute",
          bottom: 100,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{
          fontSize: 24,
          color: `${C.primary}`,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          letterSpacing: 0.5,
        }}>
          sharedsalon.com.au
        </div>
      </StaggerLine>
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SCENE 3 — PROOF (165–254f)
   3 stat pills arc-fly in from different vectors, staggered
   ───────────────────────────────────────────────────────────────────────────── */

const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const C = useColors();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Top header */}
      <StaggerLine
        startFrame={0}
        style={{
          position: "absolute",
          top: 180,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{
          fontSize: 28,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 3,
        }}>
          Why it works
        </div>
      </StaggerLine>

      <StaggerLine
        startFrame={0}
        delay={12}
        style={{
          position: "absolute",
          top: 228,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{
          fontSize: 56,
          fontWeight: 800,
          color: C.text,
          fontFamily: "Georgia, serif",
          letterSpacing: -1.2,
        }}>
          Built for salon owners
        </div>
      </StaggerLine>

      <AmbientSparkles />

      {/* Pill 1: from left side — arc trajectory (fromX: -400, fromY: -100, arc upward) */}
      <StatPill
        startFrame={15}
        icon="⚡"
        label="2 min"
        sub="to create a listing"
        fromX={-500}
        fromY={0}
        arcHeight={-150}
        top={460}
        left={80}
        accentColor={C.primary}
      />

      {/* Pill 2: from above-right */}
      <StatPill
        startFrame={30}
        icon="✅"
        label="Verified"
        sub="professionals only"
        fromX={200}
        fromY={-400}
        arcHeight={-80}
        top={680}
        left="50%"
        accentColor="#10B981"
      />

      {/* Pill 3: from right side */}
      <StatPill
        startFrame={45}
        icon="💸"
        label="$0"
        sub="to join the platform"
        fromX={500}
        fromY={100}
        arcHeight={-180}
        top={900}
        left={80}
        accentColor="#F59E0B"
      />

      {/* Background connector dots */}
      <div style={{
        position: "absolute",
        left: 370,
        top: 590,
        width: 2,
        height: 280,
        background: `linear-gradient(to bottom, ${C.border} 0%, transparent 100%)`,
        opacity: Math.min(frame / 60, 1) * 0.6,
      }} />
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SCENE 4 — THE MESSAGE (255–344f)
   Kinetic full-screen text, Be Bold stagger & decelerate easing
   Lines: "Empty chairs." / "Quiet periods." / "Not anymore."
   ───────────────────────────────────────────────────────────────────────────── */

const SceneMessage: React.FC<{
  kineticLine1: string;
  kineticLine2: string;
  kineticLine3: string;
}> = ({ kineticLine1, kineticLine2, kineticLine3 }) => {
  const frame = useCurrentFrame();
  const C = useColors();

  // Scale-punch OUT for each line (inspired by Be Bold exit: 100→42 rapid scale)
  const line1T = Math.min(frame / 12, 1);
  const line2T = Math.max(0, Math.min((frame - 20) / 12, 1));
  const line3T = Math.max(0, Math.min((frame - 40) / 16, 1));

  // Line exits (after they've been on screen a bit)
  const line1Exit = Math.max(0, Math.min((frame - 20) / 8, 1));
  const line2Exit = Math.max(0, Math.min((frame - 40) / 8, 1));

  const lineStyle = (t: number, exitT: number, color: string): React.CSSProperties => {
    const enterY = (1 - easeDecelerate(t)) * 64;
    const opacity = interpolate(t, [0, 0.15], [0, 1]) * (1 - exitT);
    // Scale-up on enter, scale-down on exit (Be Bold style)
    const scale = easeDecelerate(t) < 1 ? 1 : (1 - exitT * 0.15);

    return {
      transform: `translateY(${enterY}px) scale(${scale})`,
      opacity,
      color,
    };
  };

  return (
    <AbsoluteFill style={{ background: C.text }}>
      {/* Ambient white particles */}
      {[...Array(6)].map((_, i) => {
        const phase = ((frame + i * 23) % 60) / 60;
        const opacity = Math.sin(phase * Math.PI) * 0.15;
        const x = 60 + i * 170;
        const y = 200 + Math.sin(frame * 0.03 + i) * 40;
        return (
          <div key={i} style={{
            position: "absolute",
            left: x,
            top: y,
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "white",
            opacity,
          }} />
        );
      })}

      {/* Lines of text */}
      <div style={{
        position: "absolute",
        left: 80,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}>
        {/* Line 1 */}
        <div style={{ overflow: "hidden" }}>
          <div style={lineStyle(line1T, line1Exit, "rgba(255,255,255,0.5)")}>
            <span style={{
              fontSize: 92,
              fontWeight: 800,
              fontFamily: "Georgia, serif",
              letterSpacing: -2,
              lineHeight: 1,
            }}>
              {kineticLine1}
            </span>
          </div>
        </div>

        {/* Line 2 */}
        <div style={{ overflow: "hidden" }}>
          <div style={lineStyle(line2T, line2Exit, "rgba(255,255,255,0.6)")}>
            <span style={{
              fontSize: 92,
              fontWeight: 800,
              fontFamily: "Georgia, serif",
              letterSpacing: -2,
              lineHeight: 1,
            }}>
              {kineticLine2}
            </span>
          </div>
        </div>

        {/* Line 3 — highlighted in blue, stronger entrance, no exit */}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            transform: `translateY(${(1 - easeDecelerate(line3T)) * 64}px)`,
            opacity: interpolate(line3T, [0, 0.15], [0, 1]),
          }}>
            <span style={{
              fontSize: 92,
              fontWeight: 800,
              fontFamily: "Georgia, serif",
              letterSpacing: -2,
              lineHeight: 1,
              color: C.primary,
              display: "inline-block",
            }}>
              {kineticLine3}
            </span>
            {/* Underline that draws on */}
            <div style={{
              height: 5,
              background: C.primary,
              borderRadius: 3,
              width: `${interpolate(line3T, [0.5, 1], [0, 100], { extrapolateLeft: "clamp" })}%`,
              marginTop: 8,
            }} />
          </div>
        </div>
      </div>

      {/* Corner brand mark */}
      <div style={{
        position: "absolute",
        bottom: 120,
        right: 80,
        opacity: interpolate(Math.min(frame / 30, 1), [0, 1], [0, 0.4]),
        fontSize: 22,
        color: "white",
        fontFamily: "system-ui, sans-serif",
        fontWeight: 600,
        letterSpacing: 1,
      }}>
        Shared Salon
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SCENE 5 — THE CTA (345–449f)
   Premium end card; CTA card drops with squash landing + confetti burst
   ───────────────────────────────────────────────────────────────────────────── */

const SceneCTA: React.FC<{
  ctaBadge: string;
  ctaHeadline: string;
  ctaSubtext: string;
  ctaButtonText: string;
  ctaUrl: string;
}> = ({ ctaBadge, ctaHeadline, ctaSubtext, ctaButtonText, ctaUrl }) => {
  const frame = useCurrentFrame();
  const C = useColors();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Background gradient */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: `
          radial-gradient(ellipse at 50% -10%, rgba(37,99,235,0.12) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 110%, rgba(37,99,235,0.08) 0%, transparent 55%)
        `,
        pointerEvents: "none",
      }} />

      <AmbientSparkles />

      {/* Top tag */}
      <StaggerLine
        startFrame={0}
        style={{
          position: "absolute",
          top: 240,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div style={{
          display: "inline-block",
          background: `${C.primary}15`,
          border: `1.5px solid ${C.primary}30`,
          borderRadius: 100,
          padding: "10px 28px",
          fontSize: 22,
          fontWeight: 600,
          color: C.primary,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: 0.5,
        }}>
          {ctaBadge}
        </div>
      </StaggerLine>

      {/* CTA Card */}
      <CTACard
        startFrame={12}
        ctaHeadline={ctaHeadline}
        ctaSubtext={ctaSubtext}
        ctaButtonText={ctaButtonText}
        ctaUrl={ctaUrl}
      />

      {/* Bottom ambient confetti sparkle persistence */}
      <div style={{ opacity: 0.4 }}>
        <ConfettiBurst startFrame={25} count={14} cx={200} cy={1700} />
        <ConfettiBurst startFrame={35} count={14} cx={880} cy={1700} />
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   SCENE TRANSITION — soft cross fade with blue flash
   ───────────────────────────────────────────────────────────────────────────── */

const SceneTransition: React.FC<{ transitionFrame: number; color?: string }> = ({
  transitionFrame,
  color = DEFAULT_C.primary,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - transitionFrame;
  const HALF = 8;

  if (localFrame < -HALF || localFrame > HALF) return null;

  const opacity =
    localFrame < 0
      ? interpolate(localFrame, [-HALF, 0], [0, 0.4])
      : interpolate(localFrame, [0, HALF], [0.4, 0]);

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: color,
      opacity,
      pointerEvents: "none",
      zIndex: 100,
    }} />
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   ROOT COMPOSITION
   ───────────────────────────────────────────────────────────────────────────── */

export const SharedSalonBooking: React.FC<BookingProps> = ({
  primaryColor,
  bgColor,
  textColor,
  accentColor,
  headlineLine1,
  headlineLine2,
  kineticLine1,
  kineticLine2,
  kineticLine3,
  ctaBadge,
  ctaHeadline,
  ctaSubtext,
  ctaButtonText,
  ctaUrl,
}) => {
  // Build a live color object from editable props, falling back to defaults
  const colors: BrandColors = {
    primary: primaryColor,
    secondary: DEFAULT_C.secondary,
    accent: accentColor,
    bg: bgColor,
    text: textColor,
    body: DEFAULT_C.body,
    border: DEFAULT_C.border,
    surface: DEFAULT_C.surface,
    glow: `${primaryColor}1F`,
    glowStrong: `${primaryColor}3F`,
  };

  return (
    <ColorsContext.Provider value={colors}>
      <AbsoluteFill style={{ background: bgColor, fontFamily: "system-ui, sans-serif" }}>
        {/* Scene 1: 0–74 */}
        <Sequence from={0} durationInFrames={75}>
          <ScenePing headlineLine1={headlineLine1} headlineLine2={headlineLine2} />
        </Sequence>

        {/* Scene 2: 75–164 */}
        <Sequence from={75} durationInFrames={90}>
          <SceneBurst />
        </Sequence>

        {/* Scene 3: 165–254 */}
        <Sequence from={165} durationInFrames={90}>
          <SceneProof />
        </Sequence>

        {/* Scene 4: 255–344 */}
        <Sequence from={255} durationInFrames={90}>
          <SceneMessage
            kineticLine1={kineticLine1}
            kineticLine2={kineticLine2}
            kineticLine3={kineticLine3}
          />
        </Sequence>

        {/* Scene 5: 345–449 */}
        <Sequence from={345} durationInFrames={105}>
          <SceneCTA
            ctaBadge={ctaBadge}
            ctaHeadline={ctaHeadline}
            ctaSubtext={ctaSubtext}
            ctaButtonText={ctaButtonText}
            ctaUrl={ctaUrl}
          />
        </Sequence>

        {/* Transitions — brief flash between scenes */}
        <SceneTransition transitionFrame={75} color={primaryColor} />
        <SceneTransition transitionFrame={165} color={primaryColor} />
        <SceneTransition transitionFrame={255} color={textColor} />
        <SceneTransition transitionFrame={345} color={textColor} />
      </AbsoluteFill>
    </ColorsContext.Provider>
  );
};
