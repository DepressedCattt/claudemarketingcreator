/**
 * SaasCameraAd — "Corner Growth" Camera Movement Showcase
 *
 * Demonstrates fluid camera angles with corner-growth sweeps extracted from
 * the SimpleShapes AE template. Each scene holds center for ~2s while shapes
 * enter, then the camera explosively sweeps toward a corner along a curved
 * bezier-style path — quintic ease-out for snappy departure, smooth landing.
 *
 * Camera pattern per scene:
 *   1. Hold: camera at center, shapes spring-enter
 *   2. Sweep: rapid pan + zoom to a corner (15–20 frames, easeOut5)
 *   3. Cut: next scene begins from a new centered position
 *
 * AE reference values (SimpleShapes extraction):
 *   Camera zoom: 1866.67 (fixed)
 *   Sweep displacement: 1500–5000px in XY
 *   Sweep duration: 10–22 frames @ 24fps → 12–28 frames @ 30fps
 *   Easing: outEase speed 200–570 influence 100% → easeOut5
 *   Corner targets vary per shot: BR, TR, BL, TL
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 450 frames @ 30fps = 15 seconds
 * Category: saas (camera-movement)
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

// ─── Design Tokens (from AE SimpleShapes palette) ───────────────────────────

const C = {
  bg: "#F5EEC9",
  lavender: "#C49EE0",
  teal: "#76C0D0",
  tealLight: "#92D3E1",
  periwinkle: "#879FF7",
  skyBlue: "#A1CEE5",
  mauve: "#CFA6CB",
  lilac: "#ABAFD7",
  coral: "#DE7850",
  gold: "#D7A855",
  purple: "#BD90F3",
  deepPurple: "#9785ED",
  navy: "#424E9D",
  plum: "#8F305F",
  sage: "#5AA6A8",
  cornflower: "#8BA5F6",
  indigo: "#5C68CF",
  magenta: "#E79FE6",
  white: "#ffffff",
  dark: "#1c1c1c",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

// ─── Spring Presets (camera-movement subcategory) ────────────────────────────

const SPR = {
  camera: { stiffness: 55, damping: 28, mass: 1.2 },
  shape: { stiffness: 120, damping: 22, mass: 0.85 },
  text: { stiffness: 170, damping: 25, mass: 0.8 },
};

// ─── Easing ──────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Softer cubic ease-out — less explosive than quintic, more fluid feel. */
const easeOut3 = (t: number): number => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

const easeInOut3 = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};

/** Smooth S-curve for the sweep — accelerates gently, decelerates gently. */
const easeInOut4 = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 8 * c * c * c * c : 1 - Math.pow(-2 * c + 2, 4) / 2;
};

// ─── Camera System ───────────────────────────────────────────────────────────

interface CameraTarget {
  x: number; // -1 (left) to 1 (right)
  y: number; // -1 (top) to 1 (bottom)
}

/**
 * Core camera hook — simulates the AE corner-growth sweep.
 * Returns { transform, motionBlur } for a wrapper div.
 *
 * During hold phase: camera sits at center with gentle drift.
 * During sweep phase: camera pans toward target corner with easeInOut4
 *   for a fluid acceleration/deceleration curve. Motion blur scales
 *   with instantaneous velocity during the sweep.
 */
function useCornerSweep(
  sceneDuration: number,
  holdFrames: number,
  sweepFrames: number,
  target: CameraTarget,
  maxScale = 2.4
): { transform: string; motionBlur: number } {
  const frame = useCurrentFrame();

  const sweepStart = holdFrames;
  const raw = clamp((frame - sweepStart) / sweepFrames, 0, 1);
  const t = easeInOut4(raw);

  // Velocity approximation: derivative of easeInOut4 at current point
  const dt = 0.01;
  const tNext = easeInOut4(clamp(raw + dt, 0, 1));
  const velocity = Math.abs(tNext - t) / dt;
  const motionBlur = velocity * 3.5;

  const scale = 1 + t * (maxScale - 1);
  const tx = t * target.x * W * 0.28;
  const ty = t * target.y * H * 0.28;

  const holdDrift = Math.min(frame / holdFrames, 1);
  const gentleX = easeInOut3(holdDrift) * target.x * 25;
  const gentleY = easeInOut3(holdDrift) * target.y * 18;
  const gentleRoll = easeInOut3(holdDrift) * target.x * -0.4;

  const transform = `scale(${scale}) translateX(${-(tx + gentleX)}px) translateY(${-(ty + gentleY)}px) rotateZ(${gentleRoll}deg)`;
  return { transform, motionBlur };
}

// ─── Scene Fade ──────────────────────────────────────────────────────────────

const SceneFade: React.FC<{
  children: React.ReactNode;
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, dur, fadeIn = 6, fadeOut = 8 }) => {
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

// ─── Shape Primitives ────────────────────────────────────────────────────────

const GradientCircle: React.FC<{
  x: number; y: number; size: number;
  color1: string; color2: string;
  delay: number; fromX?: number; fromY?: number;
}> = ({ x, y, size, color1, color2, delay, fromX = 0, fromY = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.shape });
  const bob = Math.sin(frame * 0.025 + x * 0.002) * 4;

  return (
    <div style={{
      position: "absolute",
      left: x - size / 2 + (1 - p) * fromX,
      top: y - size / 2 + (1 - p) * fromY + bob,
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 35% 30%, ${color1}, ${color2})`,
      opacity: p,
      transform: `scale(${0.3 + p * 0.7})`,
      boxShadow: `0 ${20 * (1 - p)}px ${50 * (1 - p)}px ${color2}40`,
    }} />
  );
};

const GradientOval: React.FC<{
  x: number; y: number; w: number; h: number;
  color1: string; color2: string;
  delay: number; rotation?: number;
  fromX?: number; fromY?: number;
}> = ({ x, y, w, h, color1, color2, delay, rotation = 0, fromX = 0, fromY = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.shape });
  const rot = rotation + frame * 0.08;

  return (
    <div style={{
      position: "absolute",
      left: x - w / 2 + (1 - p) * fromX,
      top: y - h / 2 + (1 - p) * fromY,
      width: w,
      height: h,
      borderRadius: "50%",
      background: `linear-gradient(135deg, ${color1}, ${color2})`,
      opacity: p,
      transform: `scale(${0.4 + p * 0.6}) rotate(${rot}deg)`,
    }} />
  );
};

const GradientTriangle: React.FC<{
  x: number; y: number; size: number;
  color1: string; color2: string;
  delay: number; rotation?: number;
}> = ({ x, y, size, color1, color2, delay, rotation = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.shape });
  const rot = rotation + frame * 0.06;

  return (
    <div style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
      background: `linear-gradient(180deg, ${color1}, ${color2})`,
      opacity: p,
      transform: `scale(${0.3 + p * 0.7}) rotate(${rot}deg)`,
    }} />
  );
};

const HalfCircle: React.FC<{
  x: number; y: number; size: number;
  color1: string; color2: string;
  delay: number; rotation?: number;
}> = ({ x, y, size, color1, color2, delay, rotation = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.shape });
  const rot = rotation + Math.sin(frame * 0.02) * 8;

  return (
    <div style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 4,
      width: size,
      height: size / 2,
      borderRadius: `${size}px ${size}px 0 0`,
      background: `linear-gradient(90deg, ${color1}, ${color2})`,
      opacity: p,
      transform: `scale(${0.4 + p * 0.6}) rotate(${rot}deg)`,
      transformOrigin: "center bottom",
    }} />
  );
};

const BgGridLines: React.FC<{ color?: string }> = ({ color = C.coral }) => {
  const frame = useCurrentFrame();
  const drift = frame * 0.15;

  return (
    <svg
      style={{ position: "absolute", inset: 0, opacity: 0.06 }}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      {Array.from({ length: 20 }, (_, i) => {
        const spacing = W / 18;
        const x = spacing * i + drift;
        return (
          <line
            key={`v${i}`}
            x1={x % W} y1={0} x2={x % W} y2={H}
            stroke={color} strokeWidth={2}
          />
        );
      })}
      {Array.from({ length: 12 }, (_, i) => {
        const spacing = H / 10;
        const y = spacing * i - drift * 0.6;
        return (
          <line
            key={`h${i}`}
            x1={0} y1={((y % H) + H) % H} x2={W} y2={((y % H) + H) % H}
            stroke={color} strokeWidth={2}
          />
        );
      })}
    </svg>
  );
};

// ─── Title Text ──────────────────────────────────────────────────────────────

const TitleWord: React.FC<{
  children: string;
  x: number; y: number;
  size?: number; weight?: number; color?: string;
  delay?: number;
}> = ({ children, x, y, size = 220, weight = 700, color = C.dark, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.text });
  const blur = (1 - p) * 10;

  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${0.92 + p * 0.08})`,
      fontFamily: FONT,
      fontSize: size,
      fontWeight: weight,
      color,
      letterSpacing: -5,
      opacity: p,
      filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
    }}>
      {children}
    </div>
  );
};

const SubtitleText: React.FC<{
  children: string;
  x: number; y: number;
  delay?: number; color?: string;
}> = ({ children, x, y, delay = 12, color = C.dark }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.text });

  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      transform: "translate(-50%, -50%)",
      fontFamily: FONT,
      fontSize: 48,
      fontWeight: 400,
      color,
      opacity: p * 0.6,
      letterSpacing: 2,
      textTransform: "uppercase" as const,
    }}>
      {children}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 1: "Dynamic" — Hold center, sweep to bottom-right
// ═════════════════════════════════════════════════════════════════════════════

const SceneDynamic: React.FC = () => {
  const { transform, motionBlur } = useCornerSweep(90, 58, 24, { x: 1, y: 1 }, 2.4);

  return (
    <SceneFade dur={90} fadeIn={1} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <BgGridLines color={C.coral} />
        <div style={{ position: "absolute", inset: 0, transform, transformOrigin: "center center", willChange: "transform", filter: motionBlur > 0.3 ? `blur(${motionBlur}px)` : undefined }}>
          <GradientCircle x={CX - 400} y={CY - 200} size={520} color1={C.lavender} color2={C.deepPurple} delay={2} fromY={200} />
          <GradientCircle x={CX + 600} y={CY + 100} size={380} color1={C.teal} color2={C.tealLight} delay={6} fromX={150} />
          <GradientOval x={CX - 100} y={CY + 350} w={600} h={320} color1={C.coral} color2={C.gold} delay={4} rotation={-15} fromY={180} />
          <GradientTriangle x={CX + 300} y={CY - 400} size={400} color1={C.periwinkle} color2={C.cornflower} delay={8} rotation={20} />
          <HalfCircle x={CX - 700} y={CY + 200} size={350} color1={C.mauve} color2={C.magenta} delay={10} rotation={-30} />
          <GradientCircle x={CX + 900} y={CY - 350} size={260} color1={C.sage} color2={C.teal} delay={12} fromX={-100} />

          {/* Bottom-right cluster — grows as camera sweeps here */}
          <GradientCircle x={W - 500} y={H - 400} size={700} color1={C.purple} color2={C.indigo} delay={4} fromY={300} />
          <GradientOval x={W - 300} y={H - 250} w={500} h={280} color1={C.coral} color2={C.lavender} delay={8} rotation={45} />

          <TitleWord x={CX} y={CY - 50} delay={4} color={C.dark}>Dynamic</TitleWord>
          <SubtitleText x={CX} y={CY + 130} delay={10}>corner growth camera</SubtitleText>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 2: "Creative" — Hold center, sweep to top-right
// ═════════════════════════════════════════════════════════════════════════════

const SceneCreative: React.FC = () => {
  const { transform, motionBlur } = useCornerSweep(93, 60, 22, { x: 1, y: -1 }, 2.6);

  return (
    <SceneFade dur={93} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <BgGridLines color={C.periwinkle} />
        <div style={{ position: "absolute", inset: 0, transform, transformOrigin: "center center", willChange: "transform", filter: motionBlur > 0.3 ? `blur(${motionBlur}px)` : undefined }}>
          <GradientCircle x={CX + 200} y={CY} size={480} color1={C.teal} color2={C.sage} delay={0} fromY={-200} />
          <GradientCircle x={CX - 500} y={CY - 100} size={350} color1={C.mauve} color2={C.plum} delay={4} fromX={-200} />
          <GradientOval x={CX + 100} y={CY + 400} w={550} h={300} color1={C.gold} color2={C.coral} delay={6} rotation={25} fromY={150} />
          <GradientTriangle x={CX - 300} y={CY + 300} size={450} color1={C.indigo} color2={C.navy} delay={8} rotation={-10} />
          <HalfCircle x={CX + 700} y={CY - 200} size={400} color1={C.periwinkle} color2={C.skyBlue} delay={10} rotation={60} />

          {/* Top-right cluster */}
          <GradientCircle x={W - 400} y={350} size={650} color1={C.lavender} color2={C.purple} delay={2} fromX={200} />
          <GradientTriangle x={W - 600} y={200} size={500} color1={C.cornflower} color2={C.deepPurple} delay={6} rotation={-25} />
          <GradientCircle x={W - 200} y={500} size={300} color1={C.magenta} color2={C.mauve} delay={10} />

          <TitleWord x={CX} y={CY - 50} delay={4} color={C.navy}>Creative</TitleWord>
          <SubtitleText x={CX} y={CY + 130} delay={10} color={C.navy}>fluid camera angles</SubtitleText>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 3: "Bold" — Hold center, sweep to bottom-left
// ═════════════════════════════════════════════════════════════════════════════

const SceneBold: React.FC = () => {
  const { transform, motionBlur } = useCornerSweep(92, 58, 26, { x: -1, y: 1 }, 2.3);

  return (
    <SceneFade dur={92} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <BgGridLines color={C.mauve} />
        <div style={{ position: "absolute", inset: 0, transform, transformOrigin: "center center", willChange: "transform", filter: motionBlur > 0.3 ? `blur(${motionBlur}px)` : undefined }}>
          <GradientCircle x={CX} y={CY - 150} size={550} color1={C.coral} color2={C.gold} delay={0} fromY={250} />
          <GradientOval x={CX + 500} y={CY + 200} w={480} h={260} color1={C.tealLight} color2={C.teal} delay={4} rotation={-20} fromX={200} />
          <GradientCircle x={CX - 400} y={CY + 100} size={320} color1={C.periwinkle} color2={C.indigo} delay={6} fromX={-150} />
          <HalfCircle x={CX + 300} y={CY - 350} size={380} color1={C.lavender} color2={C.deepPurple} delay={8} rotation={120} />
          <GradientTriangle x={CX - 200} y={CY - 380} size={350} color1={C.sage} color2={C.teal} delay={10} rotation={40} />

          {/* Bottom-left cluster */}
          <GradientCircle x={400} y={H - 350} size={700} color1={C.deepPurple} color2={C.navy} delay={2} fromY={250} />
          <GradientOval x={350} y={H - 500} w={550} h={300} color1={C.magenta} color2={C.plum} delay={6} rotation={-35} />
          <GradientCircle x={600} y={H - 200} size={350} color1={C.lilac} color2={C.cornflower} delay={10} />

          <TitleWord x={CX} y={CY - 50} delay={4} color={C.plum}>Bold</TitleWord>
          <SubtitleText x={CX} y={CY + 130} delay={10} color={C.plum}>explosive sweep</SubtitleText>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 4: "Fluid" — Hold center, sweep to top-left
// ═════════════════════════════════════════════════════════════════════════════

const SceneFluid: React.FC = () => {
  const { transform, motionBlur } = useCornerSweep(97, 62, 24, { x: -1, y: -1 }, 2.5);

  return (
    <SceneFade dur={97} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <BgGridLines color={C.teal} />
        <div style={{ position: "absolute", inset: 0, transform, transformOrigin: "center center", willChange: "transform", filter: motionBlur > 0.3 ? `blur(${motionBlur}px)` : undefined }}>
          <GradientCircle x={CX - 200} y={CY + 100} size={500} color1={C.cornflower} color2={C.periwinkle} delay={0} fromY={-180} />
          <GradientOval x={CX + 400} y={CY - 200} w={520} h={280} color1={C.coral} color2={C.gold} delay={4} rotation={30} fromX={200} />
          <GradientCircle x={CX + 200} y={CY + 350} size={360} color1={C.sage} color2={C.tealLight} delay={6} fromY={200} />
          <GradientTriangle x={CX - 500} y={CY + 400} size={400} color1={C.mauve} color2={C.lavender} delay={8} rotation={-50} />
          <HalfCircle x={CX + 600} y={CY + 100} size={350} color1={C.purple} color2={C.deepPurple} delay={10} rotation={-45} />

          {/* Top-left cluster */}
          <GradientCircle x={400} y={400} size={680} color1={C.teal} color2={C.sage} delay={2} fromX={-200} />
          <GradientTriangle x={300} y={350} size={550} color1={C.skyBlue} color2={C.cornflower} delay={6} rotation={15} />
          <GradientOval x={550} y={250} w={400} h={220} color1={C.magenta} color2={C.lavender} delay={10} rotation={-20} />

          <TitleWord x={CX} y={CY - 50} delay={4} color={C.indigo}>Fluid</TitleWord>
          <SubtitleText x={CX} y={CY + 130} delay={10} color={C.indigo}>orbital drift</SubtitleText>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 5: CTA — Camera settles center, gentle breathing
// ═════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: SPR.camera });

  const breathe = Math.sin(frame * 0.04) * 0.008;
  const gentleScale = 1 + breathe;
  const roll = Math.sin(frame * 0.025) * 0.2;

  return (
    <SceneFade dur={90} fadeIn={8} fadeOut={1}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <div style={{
          position: "absolute", inset: 0,
          transform: `scale(${gentleScale}) rotateZ(${roll}deg)`,
          transformOrigin: "center center",
        }}>
          <GradientCircle x={CX - 600} y={CY - 200} size={400} color1={C.lavender} color2={C.purple} delay={0} />
          <GradientCircle x={CX + 600} y={CY + 200} size={380} color1={C.teal} color2={C.sage} delay={4} />
          <GradientCircle x={CX} y={CY - 500} size={300} color1={C.coral} color2={C.gold} delay={8} />
          <GradientCircle x={CX - 400} y={CY + 400} size={280} color1={C.periwinkle} color2={C.cornflower} delay={6} />
          <GradientCircle x={CX + 500} y={CY - 400} size={320} color1={C.magenta} color2={C.mauve} delay={10} />

          <div style={{
            position: "absolute",
            left: CX, top: CY - 80,
            transform: `translate(-50%, -50%) scale(${0.9 + p * 0.1})`,
            fontFamily: FONT,
            fontSize: 260,
            fontWeight: 700,
            color: C.navy,
            letterSpacing: -6,
            opacity: p,
            filter: `blur(${(1 - p) * 12}px)`,
          }}>
            SimpleShapes
          </div>
          <div style={{
            position: "absolute",
            left: CX, top: CY + 120,
            transform: "translate(-50%, -50%)",
            fontFamily: FONT,
            fontSize: 64,
            fontWeight: 400,
            color: C.indigo,
            opacity: spring({ frame: Math.max(0, frame - 12), fps, config: SPR.text }),
            letterSpacing: 3,
          }}>
            Motion design in every direction.
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const SaasCameraAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* S1: Dynamic — sweep to bottom-right */}
      <Sequence from={0} durationInFrames={90}>
        <SceneDynamic />
      </Sequence>

      {/* S2: Creative — sweep to top-right */}
      <Sequence from={82} durationInFrames={93}>
        <SceneCreative />
      </Sequence>

      {/* S3: Bold — sweep to bottom-left */}
      <Sequence from={168} durationInFrames={92}>
        <SceneBold />
      </Sequence>

      {/* S4: Fluid — sweep to top-left */}
      <Sequence from={253} durationInFrames={97}>
        <SceneFluid />
      </Sequence>

      {/* S5: CTA — camera settles */}
      <Sequence from={343} durationInFrames={107}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
