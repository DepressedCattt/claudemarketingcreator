/**
 * CalmlyAd — 10-second SaaS ad built from learned AE animation principles
 *
 * Product: "Calmly" — a team focus/productivity app
 * Theme:   Chaos → Calm (noise → clarity)
 * Format:  16:9 4K (3840 × 2160), 300 frames @ 30fps
 *
 * 3-Act structure:
 *   Act 1 (f0–90):    "Your inbox never stops" — chaotic notification swarm
 *   Act 2 (f90–160):  The Click — directional blob burst sweeps away chaos
 *   Act 3 (f160–300): Calm — clean dashboard unfurls, brand tagline settles
 *
 * Animation principles applied (learned from FINAL_RENDER_4K AE analysis):
 *   - Spring-driven text with bounce overshoot (low damping)
 *   - Blur-to-sharp progressive reveal on text entry
 *   - Metaball blobs via pulsing circles + SVG goo filter
 *   - Directional burst from a single origin point (narrative transition)
 *   - Expanding shockwave rings to mark the transformation moment
 *   - Clip-path unfurl reveals for UI elements
 *   - Cursor interaction as a storytelling device
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── Design tokens ───────────────────────────────────────────────────────────

const C = {
  bg:      "#F5F0EB",
  white:   "#FFFFFF",
  blue:    "#4A6CF7",
  pink:    "#FF6B8A",
  amber:   "#FFB74D",
  teal:    "#26C6A0",
  text:    "#1A1A2E",
  textMid: "#7B7B90",
  textLt:  "#B0B0C0",
};

const FONT = `"Inter", "SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

// ─── 1. SpringText ───────────────────────────────────────────────────────────
// Text element with spring-driven entry from a direction, blur reveal,
// optional wobble, and configurable exit (scale-down + fly-out).

const SpringText: React.FC<{
  text: string;
  x: number;
  y: number;
  enterFrame: number;
  exitFrame?: number;
  exitEndFrame?: number;
  fromX?: number;
  fromY?: number;
  exitToX?: number;
  exitToY?: number;
  size?: number;
  weight?: number;
  color?: string;
  italic?: boolean;
  wobbleAmplitude?: number;
  wobbleSpeed?: number;
  springConfig?: { stiffness: number; damping: number; mass: number };
}> = ({
  text, x, y, enterFrame,
  exitFrame = 999, exitEndFrame = 999,
  fromX, fromY,
  exitToX, exitToY,
  size = 160, weight = 400, color = C.text,
  italic = false,
  wobbleAmplitude = 0, wobbleSpeed = 0.08,
  springConfig = { stiffness: 180, damping: 14, mass: 0.8 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < enterFrame - 2) return null;

  const enterP = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: springConfig,
  });

  const startX = fromX ?? x + 600;
  const startY = fromY ?? y;

  let curX = startX + (x - startX) * enterP;
  let curY = startY + (y - startY) * enterP;
  let scale = enterP;
  let opacity = clamp01(enterP * 3);

  // Wobble after settling
  if (frame > enterFrame + 15 && wobbleAmplitude > 0) {
    const wt = (frame - enterFrame - 15) * wobbleSpeed;
    curY += Math.sin(wt) * wobbleAmplitude * Math.exp(-wt * 0.15);
    curX += Math.cos(wt * 0.7) * wobbleAmplitude * 0.3 * Math.exp(-wt * 0.15);
  }

  // Exit animation
  if (frame >= exitFrame && exitEndFrame > exitFrame) {
    const exitP = clamp01((frame - exitFrame) / (exitEndFrame - exitFrame));
    const eased = exitP * exitP;
    const toX = exitToX ?? x;
    const toY = exitToY ?? y - 200;
    curX = curX + (toX - curX) * eased;
    curY = curY + (toY - curY) * eased;
    scale = scale * (1 - eased * 0.6);
    opacity = opacity * (1 - eased);
  }

  if (opacity <= 0.01) return null;

  // Blur reveal — sharp over ~12 frames after entry
  const blurP = clamp01((frame - enterFrame) / 12);
  const blur = interpolate(blurP, [0, 0.5, 1], [10, 3, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: curX,
        top: curY,
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        color,
        whiteSpace: "nowrap" as const,
        letterSpacing: -2,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
        filter: blur > 0.2 ? `blur(${blur}px)` : "none",
        willChange: "transform, filter, opacity",
      }}
    >
      {text}
    </div>
  );
};


// ─── 2. MetaBlob ─────────────────────────────────────────────────────────────
// Head + Trail model: the head is its own object moving on a smooth trajectory.
// The tail is circles placed at the head's previous positions, naturally curving
// behind the head's path. The goo filter merges everything into one smooth shape.

const MetaBlob: React.FC<{
  targetX: number;
  targetY: number;
  originX?: number;
  originY?: number;
  enterFrame: number;
  exitFrame: number;
  color: string;
  dotRadius?: number;
  blobScale?: number;
  filterId: string;
  flightDuration?: number;
  convergeFrame?: number;
  convergeDuration?: number;
  convergeRotations?: number;
}> = ({
  targetX, targetY,
  originX = CX, originY = CY,
  enterFrame, exitFrame, color,
  dotRadius = 55, blobScale = 1,
  filterId, flightDuration = 14,
  convergeFrame, convergeDuration = 22, convergeRotations = 1.5,
}) => {
  const frame = useCurrentFrame();

  const visibleEnd = convergeFrame != null
    ? convergeFrame + convergeDuration
    : exitFrame;
  if (frame < enterFrame || frame > visibleEnd) return null;

  const idNum = parseInt(filterId.replace(/\D/g, "")) || 0;
  const variant = idNum % 6;
  const phaseOff = idNum * 1.9;
  const driftStart = enterFrame + flightDuration;
  const isStreaker = variant % 2 === 0;

  // Epicycle parameters (constant per blob, hoisted for reuse across phases)
  let R1: number, w1: number, R2: number, w2: number;
  switch (variant) {
    case 0: R1 = 280; w1 = 0.033; R2 = 25; w2 = 0.13; break;
    case 1: R1 = 150; w1 = 0.042; R2 = 22; w2 = 0.11; break;
    case 2: R1 = 300; w1 = 0.026; R2 = 18; w2 = 0.19; break;
    case 3: R1 = 130; w1 = 0.048; R2 = 20; w2 = 0.15; break;
    case 4: R1 = 250; w1 = 0.030; R2 = 30; w2 = 0.085; break;
    default: R1 = 140; w1 = 0.040; R2 = 18; w2 = 0.12; break;
  }
  // Set phi1 so the epicycle's initial velocity points in the flight direction.
  // Epicycle velocity = (-R1*w1*sin(f*w1+phi1), R1*w1*cos(f*w1+phi1)).
  // For this to align with the flight angle θ at driftStart: phi1 = θ + π/2 - driftStart*w1
  const flightAngle = Math.atan2(targetY - originY, targetX - originX);
  const phi1 = flightAngle + Math.PI / 2 - driftStart * w1;
  const phi2 = phi1 + phaseOff * 1.7;

  // Combined drift offset: outward coast + epicycle orbit.
  // Coast pushes outward in flight direction for ~20 frames then holds.
  // Epicycle orbital motion ramps in over the same period.
  const COAST_DUR = 18;
  const coastSpeed = R1 * w1 * 1.4;
  const coastFinalDist = coastSpeed * COAST_DUR / 2;
  const cosFA = Math.cos(flightAngle);
  const sinFA = Math.sin(flightAngle);

  const driftOffset = (f: number) => {
    const df = Math.max(0, f - driftStart);

    // Coast: decelerating outward push in flight direction
    const coastDist = df < COAST_DUR
      ? coastSpeed * (df - df * df / (2 * COAST_DUR))
      : coastFinalDist;
    const cx = cosFA * coastDist;
    const cy = sinFA * coastDist;

    // Epicycle: orbital motion, ramps in over COAST_DUR
    const epDx = R1 * Math.cos(f * w1 + phi1) + R2 * Math.cos(f * w2 + phi2)
               - R1 * Math.cos(driftStart * w1 + phi1) - R2 * Math.cos(driftStart * w2 + phi2);
    const epDy = R1 * Math.sin(f * w1 + phi1) + R2 * Math.sin(f * w2 + phi2)
               - R1 * Math.sin(driftStart * w1 + phi1) - R2 * Math.sin(driftStart * w2 + phi2);
    const easeIn = clamp01(df / COAST_DUR);

    return { dx: cx + epDx * easeIn, dy: cy + epDy * easeIn };
  };

  // ── Pure function: head position at any frame f ──
  const getHeadPos = (f: number): { x: number; y: number } => {
    const lf = f - enterFrame;
    const fp = clamp01(lf / flightDuration);
    const fe = 1 - Math.pow(1 - fp, 3);
    let hx = originX + (targetX - originX) * fe;
    let hy = originY + (targetY - originY) * fe;

    // Drift phase — coast outward then orbital motion takes over
    if (convergeFrame != null && f >= driftStart && f < convergeFrame) {
      const { dx, dy } = driftOffset(f);
      hx = targetX + dx;
      hy = targetY + dy;
    }

    // Convergence phase — starts from the blob's ACTUAL drift position
    if (convergeFrame != null && f >= convergeFrame) {
      const drift0 = driftOffset(convergeFrame);
      const startX = targetX + drift0.dx;
      const startY = targetY + drift0.dy;

      const ct = clamp01((f - convergeFrame) / convergeDuration);
      const initAngle = Math.atan2(startY - CY, startX - CX);
      const initRadius = Math.hypot(startX - CX, startY - CY);
      // Linear+power blend: nonzero derivative at ct=0 → immediate motion
      const radiusDecay = 1 - (0.12 * ct + 0.88 * ct * ct);
      const angleProg = 0.08 * ct + 0.92 * ct * ct;
      const radius = initRadius * radiusDecay;
      const spiralAngle = initAngle + convergeRotations * 2 * Math.PI * angleProg;
      hx = CX + radius * Math.cos(spiralAngle);
      hy = CY + radius * Math.sin(spiralAngle);
    }

    return { x: hx, y: hy };
  };

  // ── Current head state ──
  const head = getHeadPos(frame);
  const localF = frame - enterFrame;
  const flightP = clamp01(localF / flightDuration);
  const flightEased = 1 - Math.pow(1 - flightP, 3);

  // Scale: grow during flight, settle smoothly at full size (no overshoot pop)
  let s = blobScale;
  if (localF < flightDuration) {
    s = blobScale * (0.2 + 0.8 * flightEased);
  }

  // Opacity & convergence scale
  let opacity = 1;
  const isConverging = convergeFrame != null && frame >= convergeFrame;
  if (isConverging) {
    const ct = clamp01((frame - convergeFrame!) / convergeDuration);
    s = blobScale * Math.max(0.15, 1 - Math.pow(ct, 2.5));
    opacity = ct > 0.75 ? 1 - (ct - 0.75) / 0.25 : 1;
  } else {
    opacity = frame > exitFrame - 10 ? clamp01((exitFrame - frame) / 10) : 1;
  }

  const isDrifting = convergeFrame != null && frame >= driftStart && frame < convergeFrame;

  // Subtle head pulse
  const pulse = 0.92 + 0.08 * Math.cos((localF % 30) / 30 * Math.PI * 2);
  const headR = dotRadius * s * pulse;

  // ── Trail: circles at the head's historical positions ──
  // Streakers get long dense trails; orbiters get short subtle ones.
  // Convergence always gets full trails.
  const TRAIL_SAMPLES = isConverging ? 18 : (isDrifting && isStreaker) ? 16 : (isDrifting ? 8 : 0);
  const TRAIL_STEP = isConverging ? 1.2 : isStreaker ? 1.5 : 2;

  const trailCircles: { x: number; y: number; r: number }[] = [];
  for (let i = 1; i <= TRAIL_SAMPLES; i++) {
    const pastF = frame - i * TRAIL_STEP;
    // Only show trail from drift/convergence motion, never the inbound flight
    if (pastF < driftStart) break;
    const pos = getHeadPos(pastF);
    const t = i / TRAIL_SAMPLES;
    const taper = Math.pow(1 - t, 1.6);
    const r = dotRadius * s * taper * 0.8;
    if (r < 3) break;
    trailCircles.push({ x: pos.x, y: pos.y, r });
  }

  // During flight, stretch the head in the direction of travel
  let flightStretch = "";
  if (flightP < 1) {
    const a = Math.atan2(targetY - originY, targetX - originX) * 180 / Math.PI;
    const stretch = 1 + (1 - flightP) * 0.5;
    const squish = 1 - (1 - flightP) * 0.15;
    flightStretch = `rotate(${a}) scale(${stretch}, ${squish}) rotate(${-a})`;
  }

  return (
    <svg
      width={W} height={H}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
          <feColorMatrix in="blur" mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} opacity={opacity}>
        {/* Trail circles at historical positions — naturally curves behind head */}
        {trailCircles.map((c, i) => (
          <circle key={`t${i}`} cx={c.x} cy={c.y} r={c.r} fill={color} />
        ))}
        {/* Head: the primary blob, its own object */}
        <g transform={`translate(${head.x}, ${head.y}) ${flightStretch}`}>
          <circle cx={0} cy={0} r={headR} fill={color} />
        </g>
      </g>
    </svg>
  );
};


// ─── 3. VortexCore ───────────────────────────────────────────────────────────
// Spinning conic-gradient disc at center during vortex convergence.
// Grows as blobs spiral in, then bursts outward when the dashboard emerges.

const VortexCore: React.FC<{
  appearFrame: number;
  burstFrame: number;
}> = ({ appearFrame, burstFrame }) => {
  const frame = useCurrentFrame();
  const BURST_DUR = 12;
  if (frame < appearFrame || frame > burstFrame + BURST_DUR) return null;

  const isBursting = frame >= burstFrame;

  let scale: number;
  let opacity: number;

  if (!isBursting) {
    const t = clamp01((frame - appearFrame) / (burstFrame - appearFrame));
    scale = 0.1 + t * t * 0.9;
    opacity = t;
  } else {
    const t = clamp01((frame - burstFrame) / BURST_DUR);
    scale = 1 + t * 3;
    opacity = 1 - t * t;
  }

  const elapsed = frame - appearFrame;
  const rotation = elapsed * elapsed * 0.7;

  return (
    <div style={{
      position: "absolute",
      left: CX - 180, top: CY - 180,
      width: 360, height: 360,
      borderRadius: "50%",
      transform: `scale(${scale}) rotate(${rotation}deg)`,
      transformOrigin: "center center",
      opacity,
      pointerEvents: "none",
      background: `conic-gradient(
        ${C.pink}90, ${C.blue}90, ${C.teal}90, ${C.amber}90, ${C.pink}90
      )`,
      filter: `blur(${isBursting ? 20 + (frame - burstFrame) * 4 : 14}px)`,
    }} />
  );
};


// ─── 4. ShockwaveRing ────────────────────────────────────────────────────────
// Expanding concentric ring that marks a transition moment.

const ShockwaveRing: React.FC<{
  enterFrame: number;
  duration: number;
  color: string;
  maxRadius?: number;
  strokeWidth?: number;
  cx?: number;
  cy?: number;
}> = ({ enterFrame, duration, color, maxRadius = 1000, strokeWidth = 6, cx = CX, cy = CY }) => {
  const frame = useCurrentFrame();
  const localF = frame - enterFrame;
  if (localF < 0 || localF > duration) return null;

  const p = clamp01(localF / duration);
  const eased = 1 - Math.pow(1 - p, 2.5);
  const r = maxRadius * eased;
  const opacity = (1 - p) * 0.7;

  return (
    <svg
      width={W} height={H}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      <circle
        cx={cx} cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth * (1 - p * 0.5)}
        opacity={opacity}
      />
    </svg>
  );
};


// ─── 5. Envelope ─────────────────────────────────────────────────────────────
// SVG envelope with animated flap that opens to reveal the word "inbox".

const Envelope: React.FC<{
  x: number;
  y: number;
  enterFrame: number;
  exitFrame: number;
  exitEndFrame: number;
  scale?: number;
}> = ({
  x, y, enterFrame, exitFrame, exitEndFrame,
  scale: baseScale = 2.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < enterFrame || frame > exitEndFrame) return null;

  const enterP = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: { stiffness: 140, damping: 18, mass: 0.9 },
  });

  // Flap opens starting 4 frames after entrance
  const flapStart = enterFrame + 4;
  const flapRaw = spring({
    frame: Math.max(0, frame - flapStart),
    fps,
    config: { stiffness: 80, damping: 14, mass: 1.0 },
  });
  const flapOpen = clamp01(flapRaw);

  // Letter rises out of envelope as flap opens
  const letterRise = clamp01((flapOpen - 0.3) / 0.7);

  // Exit
  let exitScale = 1;
  let exitDx = 0;
  let exitDy = 0;
  if (frame >= exitFrame) {
    const ep = clamp01((frame - exitFrame) / (exitEndFrame - exitFrame));
    const eased = ep * ep * ep;
    exitScale = 1 - eased;
    exitDx = (CX - x) * 0.3 * eased;
    exitDy = (CY - y) * 0.3 * eased;
  }

  const s = enterP * exitScale * baseScale;
  if (s <= 0.01) return null;

  // Envelope dimensions (in SVG units, scaled by baseScale)
  const ew = 120;
  const eh = 80;
  const flapH = 45;

  return (
    <div style={{
      position: "absolute",
      left: x + exitDx,
      top: y + exitDy,
      transform: `translate(-50%, -50%) scale(${s})`,
      willChange: "transform",
    }}>
      <svg width={ew} height={eh + flapH} viewBox={`0 0 ${ew} ${eh + flapH}`}
        style={{ overflow: "visible", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.12))" }}>

        {/* Letter/paper peeking out — rises as flap opens */}
        <rect
          x={12} y={flapH + 8 - letterRise * 35}
          width={ew - 24} height={eh - 16}
          rx={4}
          fill="#FFFFFF"
          stroke="#E0E0E8"
          strokeWidth={1}
        />
        {/* Lines on the letter */}
        <rect x={22} y={flapH + 18 - letterRise * 35} width={50} height={4} rx={2} fill="#D0D0DA" />
        <rect x={22} y={flapH + 28 - letterRise * 35} width={35} height={4} rx={2} fill="#D0D0DA" />
        <rect x={22} y={flapH + 38 - letterRise * 35} width={45} height={4} rx={2} fill="#D0D0DA" />

        {/* Envelope body — back panel */}
        <rect
          x={0} y={flapH}
          width={ew} height={eh}
          rx={6}
          fill="#E8E4DF"
        />

        {/* Envelope interior (visible when flap is open) */}
        <rect
          x={3} y={flapH + 3}
          width={ew - 6} height={eh - 6}
          rx={4}
          fill="#F5F0EB"
        />

        {/* Envelope front V-fold — two diagonal panels */}
        <path
          d={`M 0 ${flapH + eh} L ${ew / 2} ${flapH + eh * 0.4} L ${ew} ${flapH + eh} Z`}
          fill="#EDE8E2"
        />
        <path
          d={`M 0 ${flapH} L ${ew / 2} ${flapH + eh * 0.55} L 0 ${flapH + eh} Z`}
          fill="#E2DDD6"
        />
        <path
          d={`M ${ew} ${flapH} L ${ew / 2} ${flapH + eh * 0.55} L ${ew} ${flapH + eh} Z`}
          fill="#DDD8D1"
        />

        {/* Flap — rotates open via scaleY to simulate 3D flip */}
        <g transform={`translate(0, ${flapH})`}>
          <g transform={`scale(1, ${1 - flapOpen * 2})`}>
            <path
              d={`M 0 0 L ${ew / 2} ${-flapH} L ${ew} 0 Z`}
              fill={flapOpen > 0.5 ? "#D5D0C9" : "#E8E4DF"}
              stroke="#D0CBC4"
              strokeWidth={0.5}
            />
          </g>
        </g>

      </svg>
    </div>
  );
};


// ─── 6. NotifWidget ──────────────────────────────────────────────────────────
// Small bouncy UI notification widget that pops in for Act 1 chaos.

const NotifWidget: React.FC<{
  x: number;
  y: number;
  enterFrame: number;
  exitFrame: number;
  exitEndFrame: number;
  type: "badge" | "message" | "alert" | "bell" | "mail" | "calendar";
  accentColor?: string;
  scale?: number;
}> = ({
  x, y, enterFrame, exitFrame, exitEndFrame,
  type, accentColor = C.pink, scale: baseScale = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < enterFrame || frame > exitEndFrame) return null;

  // Bouncy spring entrance (low damping = overshoot)
  const enterP = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: { stiffness: 200, damping: 12, mass: 0.6 },
  });

  // Anxiety vibration after settling
  const vibeAmp = frame > enterFrame + 20 && frame < exitFrame ? 3 : 0;
  const vibeX = Math.sin(frame * 0.5 + x) * vibeAmp;
  const vibeY = Math.cos(frame * 0.4 + y) * vibeAmp;

  // Exit: scale down + fly toward center (swept away by burst)
  let exitP = 0;
  let exitScale = 1;
  let exitDx = 0;
  let exitDy = 0;
  if (frame >= exitFrame) {
    exitP = clamp01((frame - exitFrame) / (exitEndFrame - exitFrame));
    const eased = exitP * exitP * exitP;
    exitScale = 1 - eased;
    const toCenterX = (CX - x) * 0.3;
    const toCenterY = (CY - y) * 0.3;
    exitDx = toCenterX * eased;
    exitDy = toCenterY * eased;
  }

  const finalScale = enterP * exitScale * baseScale;
  if (finalScale <= 0.01) return null;

  const widgetContent = () => {
    const base: React.CSSProperties = {
      background: C.white,
      borderRadius: 24,
      boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    };

    switch (type) {
      case "badge":
        return (
          <div style={{ ...base, width: 100, height: 100, borderRadius: "50%", background: accentColor }}>
            <span style={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, color: C.white }}>3</span>
          </div>
        );
      case "message":
        return (
          <div style={{ ...base, width: 260, height: 80, gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: accentColor }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: "80%", height: 10, borderRadius: 5, background: C.textLt, marginBottom: 6 }} />
              <div style={{ width: "55%", height: 10, borderRadius: 5, background: `${C.textLt}80` }} />
            </div>
          </div>
        );
      case "alert":
        return (
          <div style={{ ...base, width: 220, height: 70, background: `${accentColor}18`, border: `2px solid ${accentColor}` }}>
            <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: accentColor }}>! Alert</span>
          </div>
        );
      case "bell":
        return (
          <div style={{ ...base, width: 90, height: 90, borderRadius: "50%" }}>
            <svg width={40} height={40} viewBox="0 0 24 24" fill="none">
              <path d="M12 2C8.69 2 6 4.69 6 8v4l-2 2v1h16v-1l-2-2V8c0-3.31-2.69-6-6-6zm0 20c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z" fill={accentColor} />
            </svg>
            <div style={{
              position: "absolute", top: -4, right: -4,
              width: 24, height: 24, borderRadius: "50%",
              background: C.pink, border: `3px solid ${C.white}`,
            }} />
          </div>
        );
      case "mail":
        return (
          <div style={{ ...base, width: 240, height: 70, gap: 10 }}>
            <svg width={32} height={32} viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" fill={accentColor} opacity={0.2} stroke={accentColor} strokeWidth={1.5} />
              <path d="M2 7l10 7 10-7" stroke={accentColor} strokeWidth={1.5} />
            </svg>
            <div style={{ flex: 1 }}>
              <div style={{ width: "70%", height: 10, borderRadius: 5, background: C.textLt }} />
            </div>
          </div>
        );
      case "calendar":
        return (
          <div style={{ ...base, width: 110, height: 110, flexDirection: "column", gap: 4 }}>
            <div style={{ width: "100%", height: 28, background: accentColor, borderRadius: "12px 12px 0 0", marginTop: -20 }} />
            <span style={{ fontFamily: FONT, fontSize: 36, fontWeight: 700, color: C.text }}>17</span>
          </div>
        );
    }
  };

  return (
    <div style={{
      position: "absolute",
      left: x + vibeX + exitDx,
      top: y + vibeY + exitDy,
      transform: `translate(-50%, -50%) scale(${finalScale})`,
      opacity: clamp01(enterP * 3) * (1 - exitP),
      transformOrigin: "center center",
      willChange: "transform, opacity",
    }}>
      {widgetContent()}
    </div>
  );
};


// ─── 6. DashboardCard ────────────────────────────────────────────────────────
// Clean UI dashboard with clip-path unfurl reveal.
// Has a 4th "drop zone" task slot: shows empty placeholder before `dropFrame`,
// then the dropped card springs in with a success checkmark after the drop.

const EXISTING_TASKS = [
  { title: "Q1 Planning", tag: "Strategy", tagColor: C.blue },
  { title: "Design Review", tag: "Design", tagColor: C.pink },
  { title: "Ship v2.4", tag: "Eng", tagColor: C.teal },
];

const DROPPED_TASK = { title: "API Migration", tag: "Urgent", tagColor: C.amber };

const TaskRow: React.FC<{
  title: string; tag: string; tagColor: string;
  checked?: boolean; checkP?: number;
}> = ({ title, tag, tagColor, checked = false, checkP = 0 }) => (
  <div style={{
    padding: "20px 24px",
    borderRadius: 16,
    background: `${C.bg}80`,
    display: "flex", alignItems: "center", justifyContent: "space-between",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        border: `2px solid ${checked ? C.teal : C.textLt}`,
        background: checked ? `${C.teal}20` : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {checked && (
          <svg width={14} height={14} viewBox="0 0 14 14" style={{ opacity: checkP }}>
            <path d="M2 7l3 3 7-7" fill="none" stroke={C.teal}
              strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 500, color: C.text }}>{title}</span>
    </div>
    <div style={{
      padding: "6px 14px", borderRadius: 8,
      background: `${tagColor}18`,
    }}>
      <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: tagColor }}>{tag}</span>
    </div>
  </div>
);

const DashboardCard: React.FC<{
  enterFrame: number;
  dropFrame: number;
  x: number;
  y: number;
  width: number;
  height: number;
}> = ({ enterFrame, dropFrame, x, y, width: w, height: h }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < enterFrame) return null;

  const revealP = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: { stiffness: 80, damping: 18, mass: 1.2 },
  });

  const inset = interpolate(revealP, [0, 1], [50, 0]);

  // Scale-up entrance: dashboard grows out of the vortex center
  const entranceScale = interpolate(revealP, [0, 0.5, 1], [0.3, 0.85, 1.0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const hasDropped = frame >= dropFrame;
  const dropLocalF = hasDropped ? frame - dropFrame : -1;

  // Two-phase drop: squish down on impact (f0-6), then bounce back up (f6+)
  const dropP = hasDropped ? spring({
    frame: dropLocalF,
    fps,
    config: { stiffness: 200, damping: 12, mass: 0.7 },
  }) : 0;

  // Vertical squish: compresses to 85% height on impact, springs back to 100%
  let dropScaleY = 1;
  let dropScaleX = 1;
  let dropTranslateY = 0;
  if (hasDropped) {
    if (dropLocalF < 5) {
      // Impact phase: card squishes down
      const impactP = dropLocalF / 5;
      const squish = Math.sin(impactP * Math.PI);
      dropScaleY = 1 - squish * 0.18;
      dropScaleX = 1 + squish * 0.06;
      dropTranslateY = squish * 6;
    } else {
      // Recovery phase: bouncy spring back to normal
      const recoveryP = spring({
        frame: dropLocalF - 5,
        fps,
        config: { stiffness: 280, damping: 10, mass: 0.5 },
      });
      dropScaleY = 0.82 + recoveryP * 0.18;
      dropScaleX = 1.06 - recoveryP * 0.06;
      dropTranslateY = 6 * (1 - recoveryP);
    }
  }

  // Counter ticks from 14 → 15 after drop
  const counterVal = hasDropped ? Math.round(14 + dropP) : 14;

  return (
    <div style={{
      position: "absolute",
      left: x, top: y,
      width: w, height: h,
      clipPath: `inset(${inset}% ${inset}% ${inset}% ${inset}% round 32px)`,
      transform: `scale(${entranceScale})`,
      transformOrigin: "center center",
      willChange: "clip-path, transform",
    }}>
      <div style={{
        width: "100%", height: "100%",
        background: C.white,
        borderRadius: 32,
        boxShadow: "0 12px 60px rgba(0,0,0,0.08)",
        padding: 60,
        display: "flex",
        flexDirection: "column",
        gap: 30,
      }}>
        {/* Header bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: C.blue }} />
          <div style={{ flex: 1 }}>
            <div style={{ width: 200, height: 16, borderRadius: 8, background: C.text, marginBottom: 8 }} />
            <div style={{ width: 130, height: 12, borderRadius: 6, background: C.textLt }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[C.teal, C.amber, C.pink].map((c, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: "100%", height: 2, background: `${C.textLt}40` }} />

        {/* Content grid */}
        <div style={{ display: "flex", gap: 24, flex: 1 }}>
          {/* Sidebar */}
          <div style={{ width: 220, display: "flex", flexDirection: "column", gap: 14 }}>
            {["Inbox", "Focus", "Tasks", "Archive"].map((label, i) => (
              <div key={i} style={{
                padding: "14px 18px",
                borderRadius: 12,
                background: i === 1 ? `${C.blue}15` : "transparent",
                display: "flex", alignItems: "center", gap: 12,
              }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: i === 1 ? C.blue : C.textLt,
                }} />
                <span style={{
                  fontFamily: FONT, fontSize: 16,
                  fontWeight: i === 1 ? 600 : 400,
                  color: i === 1 ? C.blue : C.textMid,
                }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Main area — task cards */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {EXISTING_TASKS.map((item, i) => (
              <TaskRow key={i} {...item} />
            ))}

            {/* 4th slot: empty placeholder → filled after drop */}
            {!hasDropped ? (
              <div style={{
                padding: "20px 24px",
                borderRadius: 16,
                border: `2px dashed ${C.textLt}60`,
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 66,
              }}>
                <span style={{
                  fontFamily: FONT, fontSize: 14, fontWeight: 500,
                  color: C.textLt, letterSpacing: 1,
                }}>Drop task here</span>
              </div>
            ) : (
              <div style={{
                transform: `scaleX(${dropScaleX}) scaleY(${dropScaleY}) translateY(${dropTranslateY}px)`,
                transformOrigin: "center bottom",
                opacity: clamp01(dropP * 2.5),
              }}>
                <TaskRow
                  title={DROPPED_TASK.title}
                  tag={DROPPED_TASK.tag}
                  tagColor={DROPPED_TASK.tagColor}
                  checked={dropP > 0.8}
                  checkP={clamp01((dropP - 0.8) / 0.2)}
                />
              </div>
            )}
          </div>

          {/* Right stats panel */}
          <div style={{ width: 200, display: "flex", flexDirection: "column", gap: 20, paddingTop: 10 }}>
            {[
              { label: "Focus Score", value: "92%", color: C.teal },
              { label: "Tasks Done", value: `${counterVal}`, color: C.blue },
              { label: "Streak", value: "7d", color: C.amber },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: "center" as const }}>
                <div style={{
                  fontFamily: FONT, fontSize: 32, fontWeight: 700,
                  color: stat.color, marginBottom: 4,
                }}>{stat.value}</div>
                <div style={{
                  fontFamily: FONT, fontSize: 12, fontWeight: 500,
                  color: C.textMid,
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Drop success flash */}
        {hasDropped && dropP < 0.95 && (
          <div style={{
            position: "absolute",
            inset: 0,
            borderRadius: 32,
            background: `${C.teal}08`,
            opacity: (1 - dropP) * 0.8,
            pointerEvents: "none",
          }} />
        )}
      </div>
    </div>
  );
};


// ─── 7. AnimCursor ───────────────────────────────────────────────────────────
// Animated cursor with click effect and optional drag payload.

const AnimCursor: React.FC<{
  enterFrame: number;
  exitFrame?: number;
  positionKeys: { frame: number; x: number; y: number }[];
  clickFrame?: number;
}> = ({ enterFrame, exitFrame = 999, positionKeys, clickFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Render a few frames beyond exit for the fade-out to complete
  const EXIT_FADE = 10;
  if (frame < enterFrame || frame > exitFrame + EXIT_FADE) return null;

  // Interpolate position along keyframe path
  let cx = positionKeys[0].x;
  let cy = positionKeys[0].y;
  for (let i = 0; i < positionKeys.length - 1; i++) {
    const a = positionKeys[i];
    const b = positionKeys[i + 1];
    if (frame >= a.frame && frame <= b.frame) {
      const t = (frame - a.frame) / (b.frame - a.frame);
      const eased = t * t * (3 - 2 * t);
      cx = a.x + (b.x - a.x) * eased;
      cy = a.y + (b.y - a.y) * eased;
      break;
    }
    if (frame > b.frame) {
      cx = b.x;
      cy = b.y;
    }
  }

  // Smooth spring entrance — scale up from small + fade in over ~12 frames
  const enterP = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: { stiffness: 200, damping: 16, mass: 0.6 },
  });

  // Smooth exit — fade out + scale down over EXIT_FADE frames
  const exitP = frame > exitFrame
    ? clamp01((frame - exitFrame) / EXIT_FADE)
    : 0;
  const exitScale = 1 - exitP * 0.4;
  const exitOpacity = 1 - exitP;

  const cursorScale = enterP * exitScale;
  const cursorOpacity = clamp01(enterP * 2) * exitOpacity;

  if (cursorOpacity <= 0.01) return null;

  // Click ripple
  let clickScale = 0;
  if (clickFrame && frame >= clickFrame && frame < clickFrame + 15) {
    const cp = (frame - clickFrame) / 15;
    clickScale = Math.sin(cp * Math.PI) * 36;
  }

  return (
    <>
      {/* Click ripple — expands and fades */}
      {clickScale > 0 && (
        <div style={{
          position: "absolute",
          left: cx - clickScale, top: cy - clickScale,
          width: clickScale * 2, height: clickScale * 2,
          borderRadius: "50%",
          border: `3px solid ${C.blue}`,
          opacity: 0.6 * (1 - (frame - clickFrame!) / 15),
          pointerEvents: "none",
        }} />
      )}

      {/* Cursor arrow — springs in, fades out smoothly */}
      <div style={{
        position: "absolute",
        left: cx, top: cy,
        opacity: cursorOpacity,
        transform: `scale(${cursorScale})`,
        transformOrigin: "top left",
        filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.2))",
        pointerEvents: "none",
        willChange: "transform, opacity",
      }}>
        <svg width={48} height={56} viewBox="0 0 24 28" fill="none">
          <path
            d="M5 2L5 22L10 17L15 26L18 24.5L13 16L20 16L5 2Z"
            fill={C.text}
            stroke={C.white}
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </>
  );
};


// ─── FloatingTask ────────────────────────────────────────────────────────────
// A loose, unorganized task card floating to the right of the dashboard.
// Represents chaos — this is what the cursor will pick up and drag into
// the dashboard. It bobs gently and is slightly tilted to look "messy."

const FLOAT_X = CX + 650;
const FLOAT_Y = CY + 80;

const FloatingTask: React.FC<{
  enterFrame: number;
  grabFrame: number;
}> = ({ enterFrame, grabFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Extend visibility a few frames past grab for shrink-out animation
  const SHRINK_FRAMES = 4;
  if (frame < enterFrame || frame >= grabFrame + SHRINK_FRAMES) return null;

  const enterP = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: { stiffness: 140, damping: 15, mass: 0.8 },
  });

  // Shrink toward cursor on grab
  const grabP = frame >= grabFrame ? clamp01((frame - grabFrame) / SHRINK_FRAMES) : 0;
  const grabScale = 1 - grabP * 0.5;
  const grabOpacity = 1 - grabP;

  const bobY = Math.sin(frame * 0.06) * 8 * (1 - grabP);
  const bobRot = Math.sin(frame * 0.04 + 1) * 2 * (1 - grabP);

  return (
    <div style={{
      position: "absolute",
      left: FLOAT_X - 190, top: FLOAT_Y - 55 + bobY,
      width: 380, height: 110,
      background: C.white,
      borderRadius: 22,
      boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
      padding: "20px 26px",
      display: "flex", alignItems: "center", gap: 18,
      transform: `scale(${enterP * grabScale}) rotate(${5 + bobRot}deg)`,
      opacity: enterP * grabOpacity,
      border: `2px solid ${C.amber}40`,
      willChange: "transform",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: C.amber, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 18, color: C.white, fontWeight: 700 }}>!</span>
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: C.text }}>
          API Migration
        </div>
        <div style={{ fontFamily: FONT, fontSize: 14, color: C.textMid }}>
          Due tomorrow
        </div>
      </div>
      <div style={{
        marginLeft: "auto",
        padding: "6px 14px", borderRadius: 8,
        background: `${C.amber}20`,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.amber }}>Urgent</span>
      </div>
    </div>
  );
};


// ─── DragCard ────────────────────────────────────────────────────────────────
// The task card being dragged by the cursor. Picks up from the FloatingTask
// position and travels to the dashboard drop zone. Disappears on drop
// (the dashboard's 4th row takes over with a spring-in).

const DragCard: React.FC<{
  grabFrame: number;
  dropFrame: number;
}> = ({ grabFrame, dropFrame }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < grabFrame || frame >= dropFrame) return null;

  const totalFlight = dropFrame - grabFrame;
  const flightP = clamp01((frame - grabFrame) / totalFlight);
  const eased = flightP * flightP * (3 - 2 * flightP);

  // From floating position to dashboard drop zone (4th task row area)
  const dropTargetX = CX - 60;
  const dropTargetY = CY + 100;

  const cx = FLOAT_X + (dropTargetX - FLOAT_X) * eased;
  const cy = FLOAT_Y + (dropTargetY - FLOAT_Y) * eased;

  // Rotation straightens out as it approaches dashboard
  const rot = interpolate(eased, [0, 0.5, 1], [5, 2, 0]);
  // Scale shrinks slightly as it "enters" the dashboard context
  const scale = interpolate(eased, [0, 0.8, 1], [1, 0.95, 0.85]);
  // Shadow intensifies during drag
  const shadowIntensity = interpolate(eased, [0, 0.5, 1], [0.12, 0.25, 0.1]);

  // Pickup spring
  const pickupP = spring({
    frame: Math.max(0, frame - grabFrame),
    fps,
    config: { stiffness: 300, damping: 18, mass: 0.5 },
  });

  return (
    <div style={{
      position: "absolute",
      left: cx - 190, top: cy - 55,
      width: 380, height: 110,
      background: C.white,
      borderRadius: 22,
      boxShadow: `0 ${12 + shadowIntensity * 20}px ${32 + shadowIntensity * 30}px rgba(0,0,0,${shadowIntensity})`,
      padding: "20px 26px",
      display: "flex", alignItems: "center", gap: 18,
      transform: `scale(${scale * pickupP}) rotate(${rot}deg)`,
      opacity: pickupP,
      border: `2px solid ${C.amber}50`,
      willChange: "transform",
      zIndex: 10,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: C.amber, display: "flex",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 18, color: C.white, fontWeight: 700 }}>!</span>
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: C.text }}>
          API Migration
        </div>
        <div style={{ fontFamily: FONT, fontSize: 14, color: C.textMid }}>
          Due tomorrow
        </div>
      </div>
      <div style={{
        marginLeft: "auto",
        padding: "6px 14px", borderRadius: 8,
        background: `${C.amber}20`,
      }}>
        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: C.amber }}>Urgent</span>
      </div>
    </div>
  );
};


// ─── Ambient dots (subtle background texture) ────────────────────────────────

const AmbientDots: React.FC<{
  enterFrame: number;
  exitFrame: number;
}> = ({ enterFrame, exitFrame }) => {
  const frame = useCurrentFrame();
  if (frame < enterFrame || frame > exitFrame) return null;

  const opacity = interpolate(frame,
    [enterFrame, enterFrame + 20, exitFrame - 20, exitFrame],
    [0, 0.15, 0.15, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const dots: { x: number; y: number; r: number; delay: number }[] = [];
  for (let i = 0; i < 40; i++) {
    const seed = i * 137.508;
    dots.push({
      x: (seed * 3.7 + 200) % W,
      y: (seed * 2.3 + 150) % H,
      r: 3 + (i % 4) * 2,
      delay: i * 2,
    });
  }

  return (
    <svg
      width={W} height={H}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity }}
    >
      {dots.map((d, i) => {
        const pulse = 0.5 + 0.5 * Math.sin((frame + d.delay) * 0.06);
        return (
          <circle
            key={i}
            cx={d.x} cy={d.y}
            r={d.r * pulse}
            fill={C.textLt}
          />
        );
      })}
    </svg>
  );
};


// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═══════════════════════════════════════════════════════════════════════════════

export const CalmlyAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Act boundaries ──
  const ACT2_START = 90;
  const ACT3_START = 220;
  const BURST_FRAME = 98;
  const EXIT_START = ACT2_START;
  const EXIT_END = ACT2_START + 18;

  // ── Background transition ──
  const bgProgress = interpolate(frame,
    [BURST_FRAME, BURST_FRAME + 30],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }
  );
  const bgColor = bgProgress < 0.01 ? C.bg : `rgb(${
    Math.round(245 - bgProgress * 8)}, ${
    Math.round(240 - bgProgress * 4)}, ${
    Math.round(235 + bgProgress * 10)})`;

  // Screen shake when "stops." lands (~frame 34, a few frames after its spring starts)
  const SHAKE_FRAME = 34;
  const SHAKE_DUR = 8;
  const shakeActive = frame >= SHAKE_FRAME && frame < SHAKE_FRAME + SHAKE_DUR;
  let shakeX = 0, shakeY = 0;
  if (shakeActive) {
    const st = frame - SHAKE_FRAME;
    const decay = Math.exp(-st * 0.5);
    shakeX = Math.sin(st * 4.2) * 6 * decay;
    shakeY = Math.cos(st * 5.7) * 4 * decay;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: bgColor, overflow: "hidden" }}>

      {/* ═══ AMBIENT DOTS (subtle background texture) ═══ */}
      <AmbientDots enterFrame={0} exitFrame={95} />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ACT 1: CHAOS — "Your inbox never stops" (f0–90)                    */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Kinetic Typography Cascade — each word enters from a different
          direction with different energy, creating visual chaos.
          The first 3 words + notifs are in a shake container that jolts
          when "stops." slams in from below. */}

      {/* Shake container: affected by "stops." impact */}
      <div style={{
        position: "absolute", inset: 0,
        transform: shakeActive ? `translate(${shakeX}px, ${shakeY}px)` : "none",
        willChange: shakeActive ? "transform" : "auto",
      }}>
        {/* "Your" drops from above with gravity */}
        <SpringText
          text="Your"
          x={CX - 500} y={CY - 40}
          enterFrame={0}
          exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          fromX={CX - 500} fromY={CY - 700}
          exitToX={CX - 600} exitToY={CY - 200}
          size={180} weight={500} italic
          wobbleAmplitude={4} wobbleSpeed={0.07}
          springConfig={{ stiffness: 120, damping: 18, mass: 1.0 }}
        />
        {/* Envelope opens above, then "inbox" emerges and flies to position */}
        <Envelope
          x={CX - 30} y={CY - 350}
          enterFrame={3}
          exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          scale={2.5}
        />
        {/* "inbox" flies out of the envelope to its text position */}
        <SpringText
          text="inbox"
          x={CX - 30} y={CY - 40}
          enterFrame={10}
          exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          fromX={CX - 30} fromY={CY - 320}
          exitToX={CX + 200} exitToY={CY - 300}
          size={180} weight={700} italic
          color={C.blue}
          wobbleAmplitude={3} wobbleSpeed={0.09}
          springConfig={{ stiffness: 60, damping: 9, mass: 1.4 }}
        />
        {/* "never" scales up from nothing at its position (emerges from within) */}
        <SpringText
          text="never"
          x={CX + 500} y={CY - 40}
          enterFrame={22}
          exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          fromX={CX + 500} fromY={CY - 40}
          exitToX={CX + 700} exitToY={CY - 250}
          size={180} weight={500} italic
          wobbleAmplitude={3} wobbleSpeed={0.06}
          springConfig={{ stiffness: 140, damping: 16, mass: 0.7 }}
        />

        {/* Notification widgets — chaotic swarm around the text */}
        <NotifWidget x={600}  y={400}  enterFrame={34} exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          type="badge" accentColor={C.pink} scale={2.8} />
        <NotifWidget x={3200} y={500}  enterFrame={38} exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          type="message" accentColor={C.blue} scale={2.5} />
        <NotifWidget x={900}  y={1700} enterFrame={42} exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          type="alert" accentColor={C.amber} scale={2.8} />
        <NotifWidget x={3000} y={1600} enterFrame={46} exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          type="bell" accentColor={C.blue} scale={3.0} />
        <NotifWidget x={500}  y={1100} enterFrame={50} exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          type="mail" accentColor={C.teal} scale={2.6} />
        <NotifWidget x={3300} y={1100} enterFrame={54} exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          type="calendar" accentColor={C.pink} scale={2.8} />
        <NotifWidget x={1600} y={350}  enterFrame={58} exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          type="message" accentColor={C.pink} scale={2.2} />
        <NotifWidget x={2400} y={1800} enterFrame={62} exitFrame={EXIT_START} exitEndFrame={EXIT_END}
          type="badge" accentColor={C.amber} scale={2.4} />
      </div>

      {/* "stops." slams in from below — OUTSIDE shake container (it causes the shake) */}
      <SpringText
        text="stops."
        x={CX + 250} y={CY + 160}
        enterFrame={30}
        exitFrame={EXIT_START} exitEndFrame={EXIT_END}
        fromX={CX + 250} fromY={CY + 600}
        exitToX={CX - 100} exitToY={CY + 400}
        size={200} weight={800} color={C.pink}
        wobbleAmplitude={4} wobbleSpeed={0.05}
        springConfig={{ stiffness: 160, damping: 20, mass: 1.0 }}
      />


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ACT 2: THE CLICK — Burst transition (f90–220)                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* Cursor approaches center and clicks */}
      <AnimCursor
        enterFrame={ACT2_START}
        exitFrame={BURST_FRAME + 30}
        positionKeys={[
          { frame: ACT2_START, x: CX + 400, y: CY + 300 },
          { frame: BURST_FRAME - 1, x: CX, y: CY },
          { frame: BURST_FRAME + 20, x: CX - 100, y: CY - 100 },
        ]}
        clickFrame={BURST_FRAME}
      />

      {/* Shockwave rings — expanding from click point */}
      <ShockwaveRing enterFrame={BURST_FRAME}     duration={28} color={C.pink}  maxRadius={1400} strokeWidth={8} />
      <ShockwaveRing enterFrame={BURST_FRAME + 3}  duration={24} color={C.blue}  maxRadius={1000} strokeWidth={5} />
      <ShockwaveRing enterFrame={BURST_FRAME + 6}  duration={20} color={C.amber} maxRadius={700}  strokeWidth={4} />

      {/* MetaBlobs — burst outward from center, then spiral back in (vortex) */}
      {/* Phase 1: directional burst to corners (f98–f115) */}
      {/* Phase 2: settle at target positions (f115–f190) */}
      {/* Phase 3: converge back to center in spiral (f190–f218) */}

      {/* Large soft blobs — burst atmosphere only, fade out before vortex */}
      <MetaBlob targetX={500}  targetY={500}  enterFrame={BURST_FRAME}     exitFrame={180}
        color={`${C.blue}40`} dotRadius={100} blobScale={3} filterId="cb1" flightDuration={16} />
      <MetaBlob targetX={3300} targetY={600}  enterFrame={BURST_FRAME + 2} exitFrame={180}
        color={`${C.pink}40`} dotRadius={90}  blobScale={2.8} filterId="cb2" flightDuration={18} />
      <MetaBlob targetX={1000} targetY={1800} enterFrame={BURST_FRAME + 4} exitFrame={180}
        color={`${C.amber}40`} dotRadius={85} blobScale={2.5} filterId="cb3" flightDuration={15} />
      <MetaBlob targetX={3000} targetY={1700} enterFrame={BURST_FRAME + 3} exitFrame={180}
        color={`${C.teal}40`} dotRadius={80}  blobScale={2.3} filterId="cb4" flightDuration={17} />

      {/* Vivid accent blobs — bigger, tighter orbits, varied rotations */}
      <MetaBlob targetX={800}  targetY={900}  enterFrame={BURST_FRAME + 1} exitFrame={ACT3_START + 5}
        color={C.blue} dotRadius={65} blobScale={2.0} filterId="ab1" flightDuration={11}
        convergeFrame={194} convergeDuration={23} convergeRotations={1.3} />
      <MetaBlob targetX={3100} targetY={1000} enterFrame={BURST_FRAME + 3} exitFrame={ACT3_START + 5}
        color={C.pink} dotRadius={60} blobScale={1.9} filterId="ab2" flightDuration={12}
        convergeFrame={193} convergeDuration={24} convergeRotations={1.6} />
      <MetaBlob targetX={2000} targetY={400}  enterFrame={BURST_FRAME + 5} exitFrame={ACT3_START + 5}
        color={C.amber} dotRadius={55} blobScale={1.8} filterId="ab3" flightDuration={10}
        convergeFrame={196} convergeDuration={20} convergeRotations={1.0} />
      <MetaBlob targetX={1400} targetY={1600} enterFrame={BURST_FRAME + 2} exitFrame={ACT3_START + 5}
        color={C.teal} dotRadius={58} blobScale={1.7} filterId="ab4" flightDuration={13}
        convergeFrame={195} convergeDuration={22} convergeRotations={1.2} />
      <MetaBlob targetX={2800} targetY={350}  enterFrame={BURST_FRAME + 6} exitFrame={ACT3_START + 5}
        color={C.pink} dotRadius={50} blobScale={1.6} filterId="ab5" flightDuration={9}
        convergeFrame={194} convergeDuration={23} convergeRotations={1.4} />
      <MetaBlob targetX={600}  targetY={1500} enterFrame={BURST_FRAME + 4} exitFrame={ACT3_START + 5}
        color={C.blue} dotRadius={52} blobScale={1.5} filterId="ab6" flightDuration={11}
        convergeFrame={195} convergeDuration={22} convergeRotations={1.5} />

      {/* VortexCore — spinning disc at center, grows as blobs converge, bursts when dashboard emerges */}
      <VortexCore appearFrame={202} burstFrame={217} />

      {/* Act 2 text — "What if it could?" — exits before vortex peak */}
      <SpringText
        text="What if"
        x={CX - 200} y={CY - 30}
        enterFrame={BURST_FRAME + 18}
        exitFrame={192} exitEndFrame={206}
        fromX={CX - 200} fromY={CY + 100}
        size={180} weight={300} italic
        springConfig={{ stiffness: 120, damping: 16, mass: 1.0 }}
      />
      <SpringText
        text="it could?"
        x={CX + 250} y={CY + 130}
        enterFrame={BURST_FRAME + 24}
        exitFrame={192} exitEndFrame={206}
        fromX={CX + 250} fromY={CY + 250}
        size={200} weight={700} color={C.blue}
        springConfig={{ stiffness: 100, damping: 14, mass: 1.1 }}
      />


      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ACT 3: CALM — Dashboard + brand (f220–360)                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Act 3: Spring-based camera zoom with natural overshoot/bounce      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {(() => {
        const DROP_F = 315;
        const GRAB_F = 288;
        const ZOOM_IN_FRAME = 260;
        const ZOOM_OUT_FRAME = 340;
        const ZOOM_TARGET = 0.6;

        // ── Zoom in — targets the floating card area ──
        const zoomInP = frame >= ZOOM_IN_FRAME
          ? spring({
              frame: frame - ZOOM_IN_FRAME,
              fps,
              config: { stiffness: 60, damping: 12, mass: 1.0 },
            })
          : 0;

        // ── Zoom out — last second, cinematic pull-back for CTA ──
        const zoomOutP = frame >= ZOOM_OUT_FRAME
          ? spring({
              frame: frame - ZOOM_OUT_FRAME,
              fps,
              config: { stiffness: 55, damping: 14, mass: 1.2 },
            })
          : 0;

        // ── Drop punch — brief scale pop on successful drop ──
        const punchP = frame >= DROP_F
          ? spring({
              frame: frame - DROP_F,
              fps,
              config: { stiffness: 220, damping: 18, mass: 0.6 },
            })
          : 0;
        const punch = punchP * 0.035 * Math.max(0, 1 - (frame - DROP_F) / 12);

        const zoom = (1 + ZOOM_TARGET * zoomInP - ZOOM_TARGET * zoomOutP) * (1 + punch);

        // ── Camera focus tracking ──
        const dropTargetX = CX - 60;
        const dropTargetY = CY + 100;

        const dragFlightP = clamp01((frame - GRAB_F) / (DROP_F - GRAB_F));
        const dragEased = dragFlightP * dragFlightP * (3 - 2 * dragFlightP);
        const cardX = FLOAT_X + (dropTargetX - FLOAT_X) * dragEased;
        const cardY = FLOAT_Y + (dropTargetY - FLOAT_Y) * dragEased;

        let focusX: number;
        let focusY: number;

        if (frame < GRAB_F) {
          focusX = FLOAT_X;
          focusY = FLOAT_Y;
        } else if (frame < DROP_F) {
          focusX = cardX;
          focusY = cardY;
        } else {
          const settleP = spring({
            frame: frame - DROP_F,
            fps,
            config: { stiffness: 30, damping: 16, mass: 1.5 },
          });
          focusX = dropTargetX + (CX - dropTargetX) * settleP;
          focusY = dropTargetY + (CY - dropTargetY) * settleP;
        }

        const panStrength = zoomInP * (1 - zoomOutP);
        const panX = -(focusX - CX) * panStrength * 0.45;
        const panY = -(focusY - CY) * panStrength * 0.45;

        // ── Micro handheld drift — subtle breathing so zoomed hold feels alive ──
        const driftEnvelope = zoomInP * (1 - zoomOutP * 0.8);
        const driftX = (Math.sin(frame * 0.11) * 1.5 + Math.sin(frame * 0.073) * 1.0) * driftEnvelope;
        const driftY = (Math.sin(frame * 0.089 + 1.3) * 1.2 + Math.cos(frame * 0.061) * 0.8) * driftEnvelope;
        const driftRot = Math.sin(frame * 0.09) * 0.12 * driftEnvelope;

        // ── Camera tilt — slight roll during drag for tracking feel ──
        let dragTilt = 0;
        if (frame >= GRAB_F && frame < DROP_F) {
          const dt = clamp01((frame - GRAB_F) / (DROP_F - GRAB_F));
          dragTilt = Math.sin(dt * Math.PI) * -0.4;
        }

        // ── Success shake on drop ──
        let shakeX = 0;
        if (frame >= DROP_F && frame < DROP_F + 14) {
          const shakeT = (frame - DROP_F) / 14;
          const decay = Math.exp(-shakeT * 4);
          shakeX = Math.sin(shakeT * Math.PI * 6) * 12 * decay;
        }

        const totalRot = driftRot + dragTilt;

        return (
          <>
          {/* Vignette — darkened edges during zoom, guides the eye */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.18) 100%)",
            opacity: 0.9 * zoomInP * (1 - zoomOutP),
            pointerEvents: "none",
            zIndex: 50,
          }} />
          <div style={{
            position: "absolute",
            inset: 0,
            transform: `scale(${zoom}) translate(${panX + shakeX + driftX}px, ${panY + driftY}px) rotate(${totalRot}deg)`,
            transformOrigin: `${focusX}px ${focusY}px`,
            willChange: "transform",
          }}>
            {/* Dashboard emerges from the vortex — scale-up + clip unfurl */}
            <DashboardCard
              enterFrame={215}
              dropFrame={DROP_F}
              x={CX - 500} y={CY - 250}
              width={1000} height={560}
            />

            {/* Success glow ring — expands outward from dashboard on drop */}
            {frame >= DROP_F && frame < DROP_F + 22 && (
              <div style={{
                position: "absolute",
                left: CX - 550, top: CY - 300,
                width: 1100, height: 660,
                borderRadius: 40,
                border: `4px solid ${C.teal}`,
                opacity: clamp01(1 - (frame - DROP_F) / 22) * 0.7,
                transform: `scale(${1 + (frame - DROP_F) / 22 * 0.08})`,
                pointerEvents: "none",
                boxShadow: `0 0 ${30 + (frame - DROP_F) * 3}px ${C.teal}40,
                            inset 0 0 ${20 + (frame - DROP_F) * 2}px ${C.teal}15`,
              }} />
            )}

            {/* Second ring — slightly delayed */}
            {frame >= DROP_F + 4 && frame < DROP_F + 24 && (
              <div style={{
                position: "absolute",
                left: CX - 560, top: CY - 310,
                width: 1120, height: 680,
                borderRadius: 44,
                border: `2px solid ${C.blue}`,
                opacity: clamp01(1 - (frame - DROP_F - 4) / 20) * 0.4,
                transform: `scale(${1 + (frame - DROP_F - 4) / 20 * 0.1})`,
                pointerEvents: "none",
              }} />
            )}

            {/* "Calmly." — heavy, satisfying spring settle */}
            <SpringText
              text="Calmly."
              x={CX} y={CY - 400}
              enterFrame={ACT3_START + 15}
              fromX={CX} fromY={CY - 300}
              size={220} weight={800} color={C.text}
              springConfig={{ stiffness: 60, damping: 10, mass: 1.5 }}
            />

            {/* FloatingTask — the loose, unorganized card (visible until cursor grabs it) */}
            <FloatingTask enterFrame={250} grabFrame={288} />

            {/* DragCard — follows cursor from float position into dashboard drop zone */}
            <DragCard grabFrame={288} dropFrame={DROP_F} />

            {/* Cursor: enters near floating task → hovers → grabs → drags to dashboard → exits */}
            <AnimCursor
              enterFrame={280}
              exitFrame={325}
              positionKeys={[
                { frame: 280, x: FLOAT_X + 100, y: FLOAT_Y + 100 },
                { frame: 286, x: FLOAT_X, y: FLOAT_Y },
                { frame: 288, x: FLOAT_X, y: FLOAT_Y },
                { frame: 302, x: CX + 200, y: CY + 50 },
                { frame: 315, x: CX - 60, y: CY + 100 },
                { frame: 325, x: CX - 200, y: CY + 180 },
              ]}
              clickFrame={288}
            />

            {/* Tagline: "Focus, finally." with pen-drawn underline */}
            {(() => {
              const TAG_Y = CY + 380;
              const FOCUS_ENTER = 352;
              const FINALLY_ENTER = 358;
              const UNDERLINE_START = 366;
              const DOT_ENTER = 374;
              const UNDERLINE_DUR = 10;

              // "Focus," spring
              const focusP = frame >= FOCUS_ENTER
                ? spring({ frame: frame - FOCUS_ENTER, fps,
                    config: { stiffness: 140, damping: 16, mass: 0.8 } })
                : 0;
              const focusBlurP = clamp01((frame - FOCUS_ENTER) / 12);
              const focusBlur = interpolate(focusBlurP, [0, 0.5, 1], [10, 3, 0]);

              // "finally" spring
              const finallyP = frame >= FINALLY_ENTER
                ? spring({ frame: frame - FINALLY_ENTER, fps,
                    config: { stiffness: 120, damping: 13, mass: 0.9 } })
                : 0;
              const finallyBlurP = clamp01((frame - FINALLY_ENTER) / 12);
              const finallyBlur = interpolate(finallyBlurP, [0, 0.5, 1], [10, 3, 0]);

              // Underline draw progress (0→1)
              const ulRaw = clamp01((frame - UNDERLINE_START) / UNDERLINE_DUR);
              const ulP = ulRaw * ulRaw * (3 - 2 * ulRaw);

              // Full stop spring — falls in from above with bounce
              const dotP = frame >= DOT_ENTER
                ? spring({ frame: frame - DOT_ENTER, fps,
                    config: { stiffness: 160, damping: 10, mass: 0.8 } })
                : 0;

              // Layout: "Focus," at left, "finally" at right, centered as a group
              const focusFromY = TAG_Y + 70;
              const finallyFromY = TAG_Y + 70;
              const focusCurY = focusFromY + (TAG_Y - focusFromY) * focusP;
              const finallyCurY = finallyFromY + (TAG_Y - finallyFromY) * finallyP;

              return (
                <>
                  {/* "Focus," */}
                  {focusP > 0.01 && (
                    <div style={{
                      position: "absolute",
                      left: CX - 190, top: focusCurY,
                      fontFamily: FONT, fontSize: 100, fontWeight: 400,
                      color: C.textMid, whiteSpace: "nowrap",
                      letterSpacing: -2,
                      transform: `translate(-50%, -50%) scale(${focusP})`,
                      opacity: clamp01(focusP * 3),
                      filter: focusBlur > 0.2 ? `blur(${focusBlur}px)` : "none",
                      willChange: "transform, filter, opacity",
                    }}>
                      Focus,
                    </div>
                  )}

                  {/* "finally" (no period — the dot comes separately) */}
                  {finallyP > 0.01 && (
                    <div style={{
                      position: "absolute",
                      left: CX + 130, top: finallyCurY,
                      fontFamily: FONT, fontSize: 100, fontWeight: 700,
                      color: C.teal, whiteSpace: "nowrap",
                      letterSpacing: -2,
                      transform: `translate(-50%, -50%) scale(${finallyP})`,
                      opacity: clamp01(finallyP * 3),
                      filter: finallyBlur > 0.2 ? `blur(${finallyBlur}px)` : "none",
                      willChange: "transform, filter, opacity",
                    }}>
                      finally
                    </div>
                  )}

                  {/* Straight underline beneath "finally" — slides in from left */}
                  {ulP > 0 && (
                    <div style={{
                      position: "absolute",
                      left: CX + 25, top: TAG_Y + 40,
                      width: 210,
                      height: 4,
                      borderRadius: 2,
                      background: C.teal,
                      transformOrigin: "left center",
                      transform: `scaleX(${ulP})`,
                      opacity: 0.85,
                      pointerEvents: "none",
                    }} />
                  )}

                  {/* Full stop "." — falls in from above with spring bounce */}
                  {dotP > 0.01 && (() => {
                    const dotFromY = TAG_Y - 80;
                    const dotCurY = dotFromY + (TAG_Y - dotFromY) * dotP;
                    return (
                      <div style={{
                        position: "absolute",
                        left: CX + 280, top: dotCurY,
                        fontFamily: FONT, fontSize: 100, fontWeight: 700,
                        color: C.teal, whiteSpace: "nowrap",
                        transform: "translate(-50%, -50%)",
                        opacity: clamp01(dotP * 3),
                        willChange: "transform, opacity",
                      }}>
                        .
                      </div>
                    );
                  })()}
                </>
              );
            })()}

            {/* Ambient glow pulse — appears after the drop */}
            {frame > 322 && (
              <div style={{
                position: "absolute",
                left: CX - 350, top: CY - 200,
                width: 700, height: 400,
                borderRadius: "50%",
                background: `radial-gradient(circle, ${C.teal}06 0%, transparent 70%)`,
                opacity: clamp01((frame - 322) / 15) * (0.4 + 0.2 * Math.sin(frame * 0.04)),
                pointerEvents: "none",
              }} />
            )}
          </div>
          </>
        );
      })()}

    </AbsoluteFill>
  );
};
