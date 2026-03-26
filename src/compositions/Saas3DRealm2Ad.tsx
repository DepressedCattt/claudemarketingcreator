/**
 * Saas3DRealm2Ad — "Aether" 3D Realm Camera Movement Showcase
 *
 * Warm coral/gold/sage palette on cream — same architecture as Prism.
 * Two shape types only: TrueCube (6-face CSS 3D box) and TrueDiamond
 * (same cube rotated 45°Z + 54.74°X to sit on vertex).
 * All shapes render at full opacity/scale from frame 0 — NO spring
 * entrance, NO stagger delays, NO FlatSphere/gradient circles.
 * Camera movement is the only animated transform on the wrapper;
 * shapes only self-rotate slowly and bob via sine.
 * NO filter:blur on any camera wrapper (causes flicker/rasterization).
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 540 frames @ 30fps = 18 seconds
 * Category: saas (3d-realm-camera)
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

// ─── Design Tokens (warm palette) ───────────────────────────────────────────

const C = {
  bg: "#FBF7F0",
  coral: "#E8624A",
  coralDark: "#C74530",
  gold: "#D4A853",
  goldDark: "#B08A3A",
  blush: "#F2A6A0",
  blushDark: "#D88A84",
  terracotta: "#C67B5C",
  terracottaDark: "#A66040",
  sage: "#6B9B7D",
  sageDark: "#4A7A5E",
  plum: "#8E4585",
  plumDark: "#6E2F68",
  navy: "#2C3E6B",
  navyDark: "#1E2D52",
  cream: "#FAF0E4",
  warmGray: "#8B7E74",
  dark: "#2A1F1A",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

// ─── Spring Presets (text + CTA camera — shapes don't use springs) ─────────

const SPR = {
  text: { stiffness: 170, damping: 25, mass: 0.8 },
  camera: { stiffness: 50, damping: 28, mass: 1.3 },
};

// ─── Easing ─────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const easeInOut4 = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 8 * c * c * c * c : 1 - Math.pow(-2 * c + 2, 4) / 2;
};

// ─── Scene Fade ─────────────────────────────────────────────────────────────

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

// ─── TRUE 3D PRIMITIVES (warm palette — always fully visible, no spring) ───

const TrueCube: React.FC<{
  x: number; y: number; z: number; size: number;
  color: string; colorDark: string;
  spinSpeed?: number; phaseOffset?: number;
}> = ({ x, y, z, size, color, colorDark, spinSpeed = 0.15, phaseOffset = 0 }) => {
  const frame = useCurrentFrame();
  const half = size / 2;
  const rX = (frame * spinSpeed * 0.7) + phaseOffset;
  const rY = (frame * spinSpeed) + phaseOffset * 1.3;
  const bob = Math.sin(frame * 0.015 + phaseOffset * 0.01) * 4;

  const faces: { transform: string; bg: string; opacity: number }[] = [
    { transform: `rotateY(0deg) translateZ(${half}px)`,   bg: color,       opacity: 1.0 },
    { transform: `rotateY(180deg) translateZ(${half}px)`, bg: colorDark,   opacity: 0.85 },
    { transform: `rotateY(90deg) translateZ(${half}px)`,  bg: `${color}dd`, opacity: 0.9 },
    { transform: `rotateY(-90deg) translateZ(${half}px)`, bg: `${color}cc`, opacity: 0.9 },
    { transform: `rotateX(90deg) translateZ(${half}px)`,  bg: `${color}ee`, opacity: 0.95 },
    { transform: `rotateX(-90deg) translateZ(${half}px)`, bg: colorDark,   opacity: 0.8 },
  ];

  return (
    <div style={{
      position: "absolute",
      left: x - half,
      top: y - half + bob,
      width: size,
      height: size,
      transformStyle: "preserve-3d" as const,
      transform: `translateZ(${z}px) rotateX(${rX}deg) rotateY(${rY}deg)`,
    }}>
      {faces.map((f, i) => (
        <div key={i} style={{
          position: "absolute",
          width: size,
          height: size,
          transform: f.transform,
          background: f.bg,
          opacity: f.opacity,
          borderRadius: size * 0.08,
          backfaceVisibility: "hidden" as const,
          boxShadow: `inset 0 0 ${size * 0.15}px rgba(0,0,0,0.1)`,
        }} />
      ))}
    </div>
  );
};

/**
 * Diamond — a TrueCube rotated 45° on Z so it balances on a vertex.
 * Reuses proven 6-face cube geometry (no broken angles or clip-paths).
 */
const TrueDiamond: React.FC<{
  x: number; y: number; z: number; size: number;
  color: string; colorDark: string;
  spinSpeed?: number; phaseOffset?: number;
}> = ({ x, y, z, size, color, colorDark, spinSpeed = 0.12, phaseOffset = 0 }) => {
  const frame = useCurrentFrame();
  const half = size / 2;
  const rY = (frame * spinSpeed) + phaseOffset;
  const bob = Math.sin(frame * 0.018 + phaseOffset * 0.01) * 3;

  const faces: { transform: string; bg: string; opacity: number }[] = [
    { transform: `rotateY(0deg) translateZ(${half}px)`,   bg: color,        opacity: 1.0 },
    { transform: `rotateY(180deg) translateZ(${half}px)`, bg: colorDark,    opacity: 0.85 },
    { transform: `rotateY(90deg) translateZ(${half}px)`,  bg: `${color}dd`, opacity: 0.9 },
    { transform: `rotateY(-90deg) translateZ(${half}px)`, bg: `${color}cc`, opacity: 0.9 },
    { transform: `rotateX(90deg) translateZ(${half}px)`,  bg: `${color}ee`, opacity: 0.95 },
    { transform: `rotateX(-90deg) translateZ(${half}px)`, bg: colorDark,    opacity: 0.8 },
  ];

  return (
    <div style={{
      position: "absolute",
      left: x - half,
      top: y - half + bob,
      width: size,
      height: size,
      transformStyle: "preserve-3d" as const,
      transform: `translateZ(${z}px) rotateZ(45deg) rotateX(${54.74 + frame * spinSpeed * 0.3}deg) rotateY(${rY}deg)`,
    }}>
      {faces.map((f, i) => (
        <div key={i} style={{
          position: "absolute",
          width: size,
          height: size,
          transform: f.transform,
          background: f.bg,
          opacity: f.opacity,
          borderRadius: size * 0.08,
          backfaceVisibility: "hidden" as const,
          boxShadow: `inset 0 0 ${size * 0.15}px rgba(0,0,0,0.1)`,
        }} />
      ))}
    </div>
  );
};



const OrbitalRing: React.FC<{
  x: number; y: number; z: number; radius: number;
  color: string; tiltX?: number;
}> = ({ x, y, z, radius, color, tiltX = 70 }) => {
  const frame = useCurrentFrame();
  const spin = frame * 0.4;

  return (
    <div style={{
      position: "absolute",
      left: x - radius,
      top: y - radius,
      width: radius * 2,
      height: radius * 2,
      borderRadius: "50%",
      border: `3px solid ${color}`,
      opacity: 0.35,
      transformStyle: "preserve-3d" as const,
      transform: `translateZ(${z}px) rotateX(${tiltX}deg) rotateY(${spin}deg)`,
      boxShadow: `0 0 20px ${color}15`,
    }} />
  );
};

// ─── Title Text ─────────────────────────────────────────────────────────────

const TitleWord: React.FC<{
  children: string;
  x: number; y: number;
  size?: number; weight?: number; color?: string;
  delay?: number;
}> = ({ children, x, y, size = 200, weight = 700, color = C.dark, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.text });
  const blur = (1 - p) * 12;

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
}> = ({ children, x, y, delay = 12, color = C.warmGray }) => {
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
      opacity: p * 0.7,
      letterSpacing: 3,
      textTransform: "uppercase" as const,
    }}>
      {children}
    </div>
  );
};

// ─── Ambient Grid ───────────────────────────────────────────────────────────

const WarmGrid: React.FC<{ color?: string }> = ({ color = C.coral }) => {
  const frame = useCurrentFrame();
  const drift = frame * 0.08;

  return (
    <svg
      style={{ position: "absolute", inset: 0, opacity: 0.04 }}
      width={W} height={H} viewBox={`0 0 ${W} ${H}`}
    >
      {Array.from({ length: 24 }, (_, i) => {
        const spacing = W / 22;
        const x = spacing * i + drift;
        return (
          <line key={`v${i}`} x1={x % W} y1={0} x2={x % W} y2={H}
            stroke={color} strokeWidth={1.5} />
        );
      })}
      {Array.from({ length: 14 }, (_, i) => {
        const spacing = H / 12;
        const y = spacing * i - drift * 0.5;
        return (
          <line key={`h${i}`} x1={0} y1={((y % H) + H) % H} x2={W} y2={((y % H) + H) % H}
            stroke={color} strokeWidth={1.5} />
        );
      })}
    </svg>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 1: "Orbit"
// ═════════════════════════════════════════════════════════════════════════════

const SceneOrbit: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = 110;

  const holdFrames = 50;
  const orbitRaw = clamp((frame - holdFrames) / 50, 0, 1);
  const orbitT = easeInOut4(orbitRaw);

  const camRotY = orbitT * 35;
  const camRotX = orbitT * -8;
  const camScale = 1 + orbitT * 0.12;
  const camTx = orbitT * -100;

  return (
    <SceneFade dur={dur} fadeIn={1} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <WarmGrid />
        <div style={{
          position: "absolute", inset: 0,
          perspective: "2400px",
          perspectiveOrigin: "50% 50%",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d" as const,
            transform: `rotateY(${camRotY}deg) rotateX(${camRotX}deg) scale(${camScale}) translateX(${camTx}px)`,
            transformOrigin: "center center",
            willChange: "transform",
          }}>
            <TrueCube x={CX - 400} y={CY - 180} z={120} size={280} color={C.coral} colorDark={C.coralDark} spinSpeed={0.18} phaseOffset={0} />
            <TrueCube x={CX + 500} y={CY + 120} z={-180} size={220} color={C.gold} colorDark={C.goldDark} spinSpeed={0.12} phaseOffset={90} />
            <TrueCube x={CX - 650} y={CY + 300} z={-80} size={160} color={C.sage} colorDark={C.sageDark} spinSpeed={0.2} phaseOffset={180} />

            <TrueDiamond x={CX + 300} y={CY - 350} z={200} size={200} color={C.plum} colorDark={C.plumDark} spinSpeed={0.14} phaseOffset={45} />

            <TrueDiamond x={CX} y={CY + 380} z={60} size={280} color={C.blush} colorDark={C.blushDark} spinSpeed={0.1} phaseOffset={200} />
            <TrueCube x={CX + 750} y={CY - 200} z={-250} size={200} color={C.sage} colorDark={C.sageDark} spinSpeed={0.1} phaseOffset={150} />

            <OrbitalRing x={CX} y={CY} z={-300} radius={550} color={C.coral} tiltX={75} />
            <OrbitalRing x={CX} y={CY} z={-500} radius={750} color={C.terracotta} tiltX={80} />
          </div>
        </div>

        <TitleWord x={CX} y={CY - 60} delay={4}>Orbit</TitleWord>
        <SubtitleText x={CX} y={CY + 100} delay={10}>3d camera rotation</SubtitleText>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 2: "Depth"
// ═════════════════════════════════════════════════════════════════════════════

const SceneDepth: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = 108;

  const holdFrames = 45;
  const dollyRaw = clamp((frame - holdFrames) / 45, 0, 1);
  const dollyT = easeInOut4(dollyRaw);

  const camZ = dollyT * 500;
  const camScale = 1 + dollyT * 0.4;
  const camTy = dollyT * -60;

  return (
    <SceneFade dur={dur} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <WarmGrid color={C.sage} />
        <div style={{
          position: "absolute", inset: 0,
          perspective: "2200px",
          perspectiveOrigin: "50% 45%",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d" as const,
            transform: `translateZ(${camZ}px) translateY(${camTy}px) scale(${camScale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}>
            <TrueCube x={CX - 550} y={CY - 280} z={400} size={240} color={C.blush} colorDark={C.blushDark} spinSpeed={0.16} phaseOffset={20} />
            <TrueCube x={CX + 550} y={CY + 250} z={350} size={200} color={C.sage} colorDark={C.sageDark} spinSpeed={0.13} phaseOffset={120} />

            <TrueDiamond x={CX - 200} y={CY + 300} z={0} size={260} color={C.coral} colorDark={C.coralDark} spinSpeed={0.1} phaseOffset={60} />
            <TrueDiamond x={CX + 300} y={CY - 200} z={-100} size={260} color={C.gold} colorDark={C.goldDark} spinSpeed={0.11} phaseOffset={80} />

            <TrueCube x={CX} y={CY} z={-400} size={320} color={C.plum} colorDark={C.plumDark} spinSpeed={0.08} phaseOffset={200} />
            <TrueCube x={CX - 400} y={CY + 100} z={-600} size={280} color={C.coral} colorDark={C.coralDark} spinSpeed={0.07} phaseOffset={250} />

            <TrueDiamond x={CX + 600} y={CY - 100} z={250} size={180} color={C.terracotta} colorDark={C.terracottaDark} spinSpeed={0.15} phaseOffset={150} />

            <OrbitalRing x={CX} y={CY} z={-500} radius={600} color={C.gold} tiltX={85} />
          </div>
        </div>

        <TitleWord x={CX} y={CY - 60} delay={4}>Depth</TitleWord>
        <SubtitleText x={CX} y={CY + 100} delay={10}>camera dolly z-space</SubtitleText>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 3: "Tumble"
// ═════════════════════════════════════════════════════════════════════════════

const SceneTumble: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = 108;

  const breatheScale = 1 + Math.sin(frame * 0.03) * 0.015;
  const gentleTilt = Math.sin(frame * 0.02) * 2.5;
  const gentlePan = Math.sin(frame * 0.015) * 1.5;

  return (
    <SceneFade dur={dur} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <WarmGrid color={C.plum} />
        <div style={{
          position: "absolute", inset: 0,
          perspective: "2400px",
          perspectiveOrigin: "50% 50%",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d" as const,
            transform: `rotateX(${gentleTilt}deg) rotateY(${gentlePan}deg) scale(${breatheScale})`,
            transformOrigin: "center center",
          }}>
            <TrueCube x={CX - 450} y={CY - 200} z={150} size={300} color={C.coral} colorDark={C.coralDark} spinSpeed={0.35} phaseOffset={0} />
            <TrueCube x={CX + 450} y={CY + 50} z={-100} size={250} color={C.gold} colorDark={C.goldDark} spinSpeed={0.25} phaseOffset={90} />
            <TrueCube x={CX - 200} y={CY + 400} z={80} size={200} color={C.sage} colorDark={C.sageDark} spinSpeed={0.45} phaseOffset={180} />

            <TrueDiamond x={CX + 600} y={CY - 350} z={200} size={220} color={C.plum} colorDark={C.plumDark} spinSpeed={0.3} phaseOffset={45} />
            <TrueDiamond x={CX - 600} y={CY + 300} z={-50} size={180} color={C.terracotta} colorDark={C.terracottaDark} spinSpeed={0.2} phaseOffset={270} />

            <TrueCube x={CX + 200} y={CY - 450} z={-200} size={180} color={C.blush} colorDark={C.blushDark} spinSpeed={0.15} phaseOffset={130} />
            <TrueDiamond x={CX - 700} y={CY - 100} z={100} size={170} color={C.gold} colorDark={C.goldDark} spinSpeed={0.18} phaseOffset={220} />

            <OrbitalRing x={CX} y={CY} z={0} radius={650} color={C.coral} tiltX={60} />
          </div>
        </div>

        <TitleWord x={CX} y={CY - 60} delay={4}>Tumble</TitleWord>
        <SubtitleText x={CX} y={CY + 100} delay={10}>multi-axis object rotation</SubtitleText>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 4: "Fly-Through"
// ═════════════════════════════════════════════════════════════════════════════

const SceneFlyThrough: React.FC = () => {
  const frame = useCurrentFrame();
  const dur = 112;

  const holdFrames = 40;
  const flyRaw = clamp((frame - holdFrames) / 55, 0, 1);
  const flyT = easeInOut4(flyRaw);

  const camZ = flyT * 900;
  const camRotX = flyT * -8;
  const camScale = 1 + flyT * 0.5;

  return (
    <SceneFade dur={dur} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <WarmGrid color={C.gold} />
        <div style={{
          position: "absolute", inset: 0,
          perspective: "2000px",
          perspectiveOrigin: "50% 50%",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d" as const,
            transform: `translateZ(${camZ}px) rotateX(${camRotX}deg) scale(${camScale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}>
            <TrueCube x={CX - 500} y={CY - 350} z={-900} size={200} color={C.coral} colorDark={C.coralDark} spinSpeed={0.1} phaseOffset={0} />
            <TrueDiamond x={CX + 500} y={CY + 350} z={-750} size={200} color={C.gold} colorDark={C.goldDark} spinSpeed={0.11} phaseOffset={30} />
            <TrueDiamond x={CX - 350} y={CY + 250} z={-600} size={220} color={C.plum} colorDark={C.plumDark} spinSpeed={0.12} phaseOffset={60} />
            <TrueCube x={CX + 350} y={CY - 250} z={-450} size={240} color={C.sage} colorDark={C.sageDark} spinSpeed={0.14} phaseOffset={120} />
            <TrueCube x={CX - 200} y={CY - 100} z={-300} size={220} color={C.blush} colorDark={C.blushDark} spinSpeed={0.09} phaseOffset={160} />
            <TrueCube x={CX + 200} y={CY + 100} z={-150} size={260} color={C.terracotta} colorDark={C.terracottaDark} spinSpeed={0.16} phaseOffset={180} />
            <TrueDiamond x={CX} y={CY} z={0} size={300} color={C.coral} colorDark={C.coralDark} spinSpeed={0.1} phaseOffset={240} />
            <TrueDiamond x={CX - 400} y={CY + 200} z={150} size={180} color={C.sage} colorDark={C.sageDark} spinSpeed={0.13} phaseOffset={90} />
            <TrueCube x={CX + 400} y={CY - 200} z={300} size={180} color={C.plum} colorDark={C.plumDark} spinSpeed={0.18} phaseOffset={300} />
          </div>
        </div>

        <TitleWord x={CX} y={CY - 60} delay={4}>Fly-Through</TitleWord>
        <SubtitleText x={CX} y={CY + 100} delay={10}>depth corridor rush</SubtitleText>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 5: CTA
// ═════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: SPR.camera });

  const breathe = Math.sin(frame * 0.03) * 0.006;
  const gentleRotY = Math.sin(frame * 0.02) * 1.8;
  const gentleRotX = Math.sin(frame * 0.015) * 1.2;

  return (
    <SceneFade dur={100} fadeIn={8} fadeOut={1}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <div style={{
          position: "absolute", inset: 0,
          perspective: "2400px",
          perspectiveOrigin: "50% 50%",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d" as const,
            transform: `rotateY(${gentleRotY}deg) rotateX(${gentleRotX}deg) scale(${1 + breathe})`,
            transformOrigin: "center center",
          }}>
            <TrueCube x={CX - 700} y={CY - 200} z={-150} size={200} color={C.coral} colorDark={C.coralDark} spinSpeed={0.08} phaseOffset={0} />
            <TrueCube x={CX + 700} y={CY + 200} z={-80} size={180} color={C.gold} colorDark={C.goldDark} spinSpeed={0.06} phaseOffset={90} />
            <TrueDiamond x={CX} y={CY - 450} z={100} size={180} color={C.blush} colorDark={C.blushDark} spinSpeed={0.04} phaseOffset={60} />
            <TrueDiamond x={CX - 400} y={CY + 380} z={-100} size={160} color={C.sage} colorDark={C.sageDark} spinSpeed={0.05} phaseOffset={180} />
            <TrueCube x={CX + 500} y={CY - 350} z={50} size={160} color={C.plum} colorDark={C.plumDark} spinSpeed={0.05} phaseOffset={120} />
            <OrbitalRing x={CX} y={CY} z={-350} radius={700} color={C.coral} tiltX={80} />
          </div>
        </div>

        <div style={{
          position: "absolute",
          left: CX, top: CY - 80,
          transform: `translate(-50%, -50%) scale(${0.9 + p * 0.1})`,
          fontFamily: FONT,
          fontSize: 260,
          fontWeight: 700,
          color: C.dark,
          letterSpacing: -6,
          opacity: p,
          filter: `blur(${(1 - p) * 12}px)`,
        }}>
          Aether
        </div>
        <div style={{
          position: "absolute",
          left: CX, top: CY + 120,
          transform: "translate(-50%, -50%)",
          fontFamily: FONT,
          fontSize: 64,
          fontWeight: 400,
          color: C.warmGray,
          opacity: spring({ frame: Math.max(0, frame - 12), fps, config: SPR.text }),
          letterSpacing: 3,
        }}>
          Where realms converge.
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const Saas3DRealm2Ad: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={110}>
        <SceneOrbit />
      </Sequence>

      <Sequence from={102} durationInFrames={108}>
        <SceneDepth />
      </Sequence>

      <Sequence from={203} durationInFrames={108}>
        <SceneTumble />
      </Sequence>

      <Sequence from={304} durationInFrames={112}>
        <SceneFlyThrough />
      </Sequence>

      <Sequence from={410} durationInFrames={130}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
