/**
 * SaasShowcaseAd — "Vertex" SaaS Technique Showcase
 *
 * A portfolio piece demonstrating every SaaS category technique at peak quality.
 * Each scene is designed to push a specific subcategory to its limits:
 *
 *   S1  text-animation     (  0– 90f)  Staggered blur-scale word reveal with color cycling
 *   S2  ui-elements        ( 82–185f)  Frosted glass dashboard cards, spring-from-offscreen
 *   S3  data-viz           (178–268f)  Animated counter + progress ring + stat grid
 *   S4  spring-physics     (260–355f)  Multi-preset spring comparison — hero/text/ui/bg all visible
 *   S5  background-effects (348–445f)  Draw-on strokes + radial blobs + concentric circles + ripple
 *   S6  transitions        (438–508f)  Clean hard-cut rhythm with cross-fade polish
 *   S7  combined           (500–570f)  All techniques layered — the full SaaS stack
 *   S8  CTA                (562–600f)  Final brand moment
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 600 frames @ 30fps = 20 seconds
 * Category: saas (all subcategories)
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
  bg: "#FDFDFE",
  dark: "#0a0a12",
  blue: "#2076FF",
  blueLight: "#629DFF",
  indigo: "#4b63e9",
  pink: "#f75d7f",
  green: "#10B981",
  yellow: "#fcbc05",
  orange: "#f97316",
  white: "#ffffff",
  black: "#1E1E1E",
  gray: "#6B7280",
  muted: "#e5e7eb",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

// ─── Spring Presets (from saas.json spring-physics subcategory) ──────────────

const SPR = {
  text: { stiffness: 170, damping: 25, mass: 0.8 },
  hero: { stiffness: 100, damping: 24, mass: 1.1 },
  ui: { stiffness: 155, damping: 22, mass: 0.85 },
  bg: { stiffness: 45, damping: 24, mass: 1.4 },
  settle: { stiffness: 90, damping: 19, mass: 1.05 },
};

function useSpr(delay = 0, config = SPR.text) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.max(0, frame - delay), fps, config });
}

function useFade(dur: number, fadeIn = 8, fadeOut = 8) {
  const frame = useCurrentFrame();
  const inOp = fadeIn > 0 ? Math.min(1, frame / fadeIn) : 1;
  const outOp = fadeOut > 0 ? Math.min(1, (dur - frame) / fadeOut) : 1;
  return Math.max(0, Math.min(inOp, outOp));
}

// ═════════════════════════════════════════════════════════════════════════════
// SUBCATEGORY: text-animation
// ═════════════════════════════════════════════════════════════════════════════

interface WordCfg {
  text: string;
  weight?: number;
  color?: string;
  size?: number;
}

const BlurWord: React.FC<{
  text: string;
  delay: number;
  weight: number;
  color: string;
  size: number;
}> = ({ text, delay, weight, color, size }) => {
  const p = useSpr(delay, SPR.text);
  const blur = (1 - p) * 10;
  const scale = 0.94 + p * 0.06;
  const slideY = (1 - p) * 30;

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        opacity: p,
        transform: `translateY(${slideY}px) scale(${scale})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        willChange: "transform, opacity, filter",
        letterSpacing: weight >= 600 ? -3 : -1,
      }}
    >
      {text}
    </span>
  );
};

const WordLine: React.FC<{
  words: WordCfg[];
  y: number;
  size?: number;
  stagger?: number;
  baseDelay?: number;
}> = ({ words, y, size = 160, stagger = 5, baseDelay = 0 }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: y,
      transform: "translateY(-50%)",
      textAlign: "center",
      display: "flex",
      justifyContent: "center",
      gap: size * 0.3,
      whiteSpace: "pre",
    }}
  >
    {words.map((w, i) => (
      <BlurWord
        key={i}
        text={w.text}
        delay={baseDelay + i * stagger}
        weight={w.weight ?? 400}
        color={w.color ?? C.black}
        size={w.size ?? size}
      />
    ))}
  </div>
);

const SingleText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  size?: number;
  weight?: number;
  color?: string;
}> = ({ children, delay = 0, y = CY, size = 140, weight = 400, color = C.black }) => {
  const p = useSpr(delay, SPR.text);
  const blur = (1 - p) * 10;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(-50%) scale(${0.94 + p * 0.06})`,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        opacity: p,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        letterSpacing: weight >= 600 ? -4 : -1,
      }}
    >
      {children}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SUBCATEGORY: ui-elements
// ═════════════════════════════════════════════════════════════════════════════

const GlassCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  fromX?: number;
  fromY?: number;
  accent?: string;
}> = ({ x, y, w, h, delay, fromX = 0, fromY = 200, accent = C.blue }) => {
  const frame = useCurrentFrame();
  const p = useSpr(delay, SPR.ui);
  const bob = Math.sin(frame * 0.03 + x * 0.003) * 5;
  const cx = x + (1 - p) * fromX;
  const cy = y + (1 - p) * fromY + bob;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        borderRadius: 24,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.6)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        opacity: p,
        transform: `scale(${0.65 + p * 0.35})`,
        padding: 20,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[C.pink, C.yellow, C.green].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ height: 6, width: "70%", borderRadius: 4, background: accent, marginBottom: 12, opacity: 0.8 }} />
      {[0.85, 0.6, 0.4].map((w2, i) => (
        <div key={i} style={{ height: h * 0.07, borderRadius: 6, marginBottom: 6, background: i === 0 ? `${accent}12` : "#f3f4f6", width: `${w2 * 100}%` }} />
      ))}
    </div>
  );
};

const DashboardWidget: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  label: string;
  value: string;
  accent: string;
}> = ({ x, y, w, h, delay, label, value, accent }) => {
  const p = useSpr(delay, SPR.ui);
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        borderRadius: 20,
        background: C.white,
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
        opacity: p,
        transform: `scale(${0.7 + p * 0.3}) translateY(${(1 - p) * 40}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: h * 0.14, color: C.gray, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" as const }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: h * 0.35, fontWeight: 700, color: accent, letterSpacing: -4 }}>{value}</div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SUBCATEGORY: data-viz
// ═════════════════════════════════════════════════════════════════════════════

const AnimatedCounter: React.FC<{
  target: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  size?: number;
  color?: string;
}> = ({ target, suffix = "", prefix = "", delay = 0, size = 280, color = C.blue }) => {
  const p = useSpr(delay, SPR.hero);
  const val = Math.round(p * target);
  const blur = (1 - p) * 8;
  return (
    <div
      style={{
        fontFamily: FONT,
        fontSize: size,
        fontWeight: 700,
        color,
        opacity: p,
        transform: `scale(${0.88 + p * 0.12})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        letterSpacing: -6,
        textShadow: `0 4px 30px ${color}20`,
      }}
    >
      {prefix}{val.toLocaleString()}{suffix}
    </div>
  );
};

const ProgressRing: React.FC<{
  x: number;
  y: number;
  radius: number;
  progress: number;
  delay: number;
  color: string;
  strokeWidth?: number;
}> = ({ x, y, radius, progress, delay, color, strokeWidth = 12 }) => {
  const p = useSpr(delay, SPR.hero);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - p * progress);

  return (
    <svg
      style={{
        position: "absolute",
        left: x - radius - strokeWidth,
        top: y - radius - strokeWidth,
        width: (radius + strokeWidth) * 2,
        height: (radius + strokeWidth) * 2,
        transform: "rotate(-90deg)",
      }}
    >
      <circle
        cx={radius + strokeWidth}
        cy={radius + strokeWidth}
        r={radius}
        fill="none"
        stroke={`${color}15`}
        strokeWidth={strokeWidth}
      />
      <circle
        cx={radius + strokeWidth}
        cy={radius + strokeWidth}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ opacity: p }}
      />
    </svg>
  );
};

const StatBar: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  fill: number;
  delay: number;
  color: string;
  label: string;
}> = ({ x, y, w, h, fill, delay, color, label }) => {
  const p = useSpr(delay, SPR.ui);
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: p, transform: `translateX(${(1 - p) * 60}px)` }}>
      <div style={{ fontFamily: FONT, fontSize: 32, color: C.gray, marginBottom: 10, fontWeight: 500 }}>{label}</div>
      <div style={{ width: w, height: h, borderRadius: h / 2, background: `${color}12`, overflow: "hidden" }}>
        <div style={{ width: w * fill * p, height: h, borderRadius: h / 2, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SUBCATEGORY: background-effects
// ═════════════════════════════════════════════════════════════════════════════

const BgBlob: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay?: number;
}> = ({ x, y, size, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = useSpr(delay, SPR.bg);
  const pulse = 1 + Math.sin(frame * 0.04) * 0.05;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}25 0%, transparent 60%)`,
        transform: `scale(${p * pulse})`,
        opacity: p * 0.55,
        filter: "blur(40px)",
      }}
    />
  );
};

const DrawStroke: React.FC<{
  d: string;
  color: string;
  width?: number;
  delay?: number;
  x?: number;
  y?: number;
}> = ({ d, color, width = 5, delay = 0, x = CX, y = CY }) => {
  const p = useSpr(delay, SPR.bg);
  return (
    <svg style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity: p * 0.4 }} width="1" height="1" viewBox="0 0 1 1">
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray="4000" strokeDashoffset={4000 * (1 - p)} strokeLinecap="round" />
    </svg>
  );
};

const ConcentricRings: React.FC<{ cx?: number; cy?: number; delay?: number }> = ({
  cx = CX,
  cy = CY,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rings = [600, 820, 1040, 1260];

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: cx - 420,
          top: cy - 420,
          width: 840,
          height: 840,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${C.blueLight}, ${C.blue}, ${C.indigo})`,
          transform: `scale(${spring({ frame: Math.max(0, frame - delay), fps, config: SPR.bg }) * 0.55 * (1 + Math.sin(frame * 0.035) * 0.015)})`,
          boxShadow: `0 0 120px ${C.blue}20`,
        }}
      />
      {rings.map((r, i) => {
        const rp = spring({ frame: Math.max(0, frame - delay - 5 - i * 4), fps, config: SPR.bg });
        const opPulse = 0.2 + Math.sin(frame * 0.04 + i * 1.8) * 0.06;
        return (
          <svg
            key={i}
            style={{
              position: "absolute",
              left: cx - r / 2,
              top: cy - r / 2,
              width: r,
              height: r,
              opacity: rp * opPulse,
              transform: `rotate(${frame * (i % 2 === 0 ? -0.12 : 0.15)}deg)`,
            }}
          >
            <circle cx={r / 2} cy={r / 2} r={r / 2 - 2} fill="none" stroke={C.blue} strokeWidth={2} strokeDasharray={`${16 + i * 10} ${10 + i * 5}`} />
          </svg>
        );
      })}
    </>
  );
};

const RippleWave: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const rp = spring({ frame: Math.max(0, frame - delay - i * 3), fps, config: { damping: 16, stiffness: 25, mass: 1.5 } });
        const r = (140 + i * 55) * rp;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CX - r,
              top: CY - r,
              width: r * 2,
              height: r * 2,
              borderRadius: "50%",
              border: `${Math.max(1, 2.5 - i * 0.25)}px solid ${C.indigo}`,
              opacity: (1 - i / 8) * rp * 0.35,
            }}
          />
        );
      })}
    </>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SUBCATEGORY: transitions
// ═════════════════════════════════════════════════════════════════════════════

const FadeWrap: React.FC<{
  children: React.ReactNode;
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, dur, fadeIn = 8, fadeOut = 10 }) => {
  const op = useFade(dur, fadeIn, fadeOut);
  const frame = useCurrentFrame();
  const exitScale = fadeOut > 0 && dur - frame < fadeOut
    ? interpolate(frame, [dur - fadeOut, dur], [1, 0.97], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return <AbsoluteFill style={{ opacity: op, transform: `scale(${exitScale})` }}>{children}</AbsoluteFill>;
};

// ═════════════════════════════════════════════════════════════════════════════
// SVG PATHS
// ═════════════════════════════════════════════════════════════════════════════

const SWOOP_D = "M -800,-200 C -400,-600 200,-400 600,-100 C 1000,200 1400,-300 1800,-500";
const WAVE_D = "M -900,100 C -300,400 300,-200 900,100 C 1500,400 2100,-200 2700,100";
const SPIRAL_D = "M 0,0 C 100,-200 300,-100 200,100 C 100,300 -100,200 0,0";

// ═════════════════════════════════════════════════════════════════════════════
// SPRING SHOWCASE COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

const SpringBall: React.FC<{
  x: number;
  y: number;
  config: { stiffness: number; damping: number; mass: number };
  delay: number;
  color: string;
  label: string;
  size?: number;
}> = ({ x, y, config, delay, color, label, size = 80 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config });
  const targetY = y - 500;
  const currentY = y + (targetY - y) * p;

  return (
    <div style={{ position: "absolute", left: x - size / 2, top: currentY - size / 2 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle at 35% 30%, ${color}dd, ${color})`,
          boxShadow: `0 ${16 * (1 - p)}px ${40 * (1 - p)}px ${color}40`,
          opacity: Math.min(1, p * 3),
        }}
      />
      <div
        style={{
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 600,
          color,
          textAlign: "center",
          marginTop: 16,
          opacity: p,
          letterSpacing: 1,
          textTransform: "uppercase" as const,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const SaasShowcaseAd: React.FC = () => {
  const frame = useCurrentFrame();

  const darkPhase =
    frame >= 255 && frame <= 360
      ? interpolate(frame, [255, 268, 348, 360], [0, 0.92, 0.92, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* Subtle ambient gradients */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 25%, rgba(32,118,255,0.012) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(247,93,127,0.008) 0%, transparent 45%)",
        }}
      />

      {/* ═══ S1: TEXT ANIMATION SHOWCASE (0–90f) ═══ */}
      <Sequence from={0} durationInFrames={90}>
        <FadeWrap dur={90} fadeIn={1} fadeOut={10}>
          <BgBlob x={600} y={400} size={500} color={C.blue} delay={8} />
          <BgBlob x={3200} y={600} size={400} color={C.pink} delay={14} />
          <BgBlob x={500} y={1800} size={350} color={C.yellow} delay={20} />

          <WordLine
            y={CY - 180}
            words={[
              { text: "Every", weight: 300, color: C.gray },
              { text: "pixel", weight: 700, color: C.blue },
              { text: "has", weight: 300, color: C.gray },
            ]}
            size={180}
            stagger={6}
          />
          <WordLine
            y={CY + 50}
            words={[
              { text: "a", weight: 300, color: C.gray },
              { text: "purpose.", weight: 700, color: C.pink },
            ]}
            size={180}
            stagger={6}
            baseDelay={12}
          />
          <SingleText delay={24} y={CY + 280} size={52} weight={500} color={C.gray}>
            Blur-scale reveals with staggered word entrance
          </SingleText>
        </FadeWrap>
      </Sequence>

      {/* ═══ S2: UI ELEMENTS SHOWCASE (82–185f) ═══ */}
      <Sequence from={82} durationInFrames={103}>
        <FadeWrap dur={103} fadeIn={8} fadeOut={10}>
          {/* Supporting: glass cards — larger, spread across full canvas */}
          <GlassCard x={450} y={420} w={520} h={380} delay={0} fromX={-300} fromY={200} accent={C.blue} />
          <GlassCard x={1350} y={320} w={480} h={350} delay={4} fromX={-150} fromY={250} accent={C.indigo} />
          <GlassCard x={2550} y={400} w={500} h={370} delay={8} fromX={150} fromY={220} accent={C.pink} />
          <GlassCard x={3400} y={350} w={460} h={340} delay={12} fromX={250} fromY={200} accent={C.green} />
          <GlassCard x={650} y={1650} w={540} h={390} delay={6} fromX={-200} fromY={250} accent={C.orange} />
          <GlassCard x={3150} y={1600} w={500} h={360} delay={10} fromX={180} fromY={230} accent={C.blue} />

          {/* Focal: dashboard KPIs — hero-sized, center stage */}
          <DashboardWidget x={CX - 580} y={CY} w={460} h={320} delay={14} label="Revenue" value="$4.2M" accent={C.green} />
          <DashboardWidget x={CX} y={CY} w={460} h={320} delay={17} label="Users" value="12,847" accent={C.blue} />
          <DashboardWidget x={CX + 580} y={CY} w={460} h={320} delay={20} label="Growth" value="+38%" accent={C.pink} />

          {/* Subtitle: bottom 15% of frame, out of focal zone */}
          <SingleText delay={24} y={H - 160} size={52} weight={500} color={C.gray}>
            Frosted glass cards with spring-from-offscreen
          </SingleText>
        </FadeWrap>
      </Sequence>

      {/* ═══ S3: DATA-VIZ SHOWCASE (178–268f) ═══ */}
      <Sequence from={178} durationInFrames={90}>
        <FadeWrap dur={90} fadeIn={8} fadeOut={10}>
          {/* Focal: hero progress ring — 40%+ of canvas height */}
          <div style={{ position: "absolute", left: CX, top: CY - 120, transform: "translate(-50%, -50%)", textAlign: "center" }}>
            <ProgressRing x={0} y={0} radius={320} progress={0.87} delay={0} color={C.blue} strokeWidth={22} />
            <div style={{ position: "absolute", left: -320, top: -320, width: 640, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AnimatedCounter target={87} suffix="%" delay={4} size={320} color={C.blue} />
            </div>
          </div>

          {/* Secondary rings: flanking, proportionally sized */}
          <ProgressRing x={CX - 800} y={CY - 200} radius={160} progress={0.62} delay={8} color={C.green} strokeWidth={14} />
          <div style={{ position: "absolute", left: CX - 960, top: CY - 360, width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatedCounter target={62} suffix="%" delay={10} size={120} color={C.green} />
          </div>

          <ProgressRing x={CX + 800} y={CY - 200} radius={160} progress={0.94} delay={12} color={C.pink} strokeWidth={14} />
          <div style={{ position: "absolute", left: CX + 640, top: CY - 360, width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimatedCounter target={94} suffix="%" delay={14} size={120} color={C.pink} />
          </div>

          {/* Stat bars: wider, taller, with larger labels */}
          <StatBar x={CX - 600} y={CY + 340} w={520} h={24} fill={0.85} delay={16} color={C.blue} label="Conversion" />
          <StatBar x={CX - 600} y={CY + 440} w={520} h={24} fill={0.72} delay={19} color={C.green} label="Retention" />
          <StatBar x={CX - 600} y={CY + 540} w={520} h={24} fill={0.93} delay={22} color={C.indigo} label="Satisfaction" />

          <StatBar x={CX + 80} y={CY + 340} w={520} h={24} fill={0.68} delay={18} color={C.orange} label="Engagement" />
          <StatBar x={CX + 80} y={CY + 440} w={520} h={24} fill={0.91} delay={21} color={C.pink} label="Performance" />
          <StatBar x={CX + 80} y={CY + 540} w={520} h={24} fill={0.56} delay={24} color={C.yellow} label="Adoption" />
        </FadeWrap>
      </Sequence>

      {/* Dark overlay for S4 */}
      {darkPhase > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(10,10,18,${darkPhase})`, zIndex: 1 }} />
      )}

      {/* ═══ S4: SPRING PHYSICS SHOWCASE (260–355f) ═══ */}
      <Sequence from={260} durationInFrames={95} style={{ zIndex: 2 }}>
        <FadeWrap dur={95} fadeIn={8} fadeOut={10}>
          {/* Title zone: top 25% of frame — clear of ball area */}
          <SingleText delay={6} y={280} size={160} weight={700} color={C.white}>
            Spring Physics
          </SingleText>
          <SingleText delay={10} y={480} size={56} weight={400} color={`${C.white}88`}>
            Each element type gets its own critically-tuned spring preset
          </SingleText>

          {/* Ball zone: center-to-bottom — balls travel from CY+400 up to CY, well below text */}
          <SpringBall x={CX - 650} y={CY + 400} config={SPR.text} delay={4} color={C.blue} label="Text" size={120} />
          <SpringBall x={CX - 220} y={CY + 400} config={SPR.hero} delay={4} color={C.pink} label="Hero" size={120} />
          <SpringBall x={CX + 220} y={CY + 400} config={SPR.ui} delay={4} color={C.green} label="UI" size={120} />
          <SpringBall x={CX + 650} y={CY + 400} config={SPR.bg} delay={4} color={C.yellow} label="BG" size={120} />
        </FadeWrap>
      </Sequence>

      {/* ═══ S5: BACKGROUND EFFECTS SHOWCASE (348–445f) ═══ */}
      <Sequence from={348} durationInFrames={97}>
        <FadeWrap dur={97} fadeIn={10} fadeOut={12}>
          <ConcentricRings delay={0} />

          <DrawStroke d={SWOOP_D} color={C.pink} delay={6} x={CX - 200} y={CY - 300} />
          <DrawStroke d={WAVE_D} color={C.blue} width={4} delay={10} x={CX - 400} y={CY + 200} />
          <DrawStroke d={SPIRAL_D} color={C.green} width={3} delay={14} x={CX + 500} y={CY - 100} />

          <BgBlob x={400} y={400} size={500} color={C.pink} delay={4} />
          <BgBlob x={3400} y={1800} size={450} color={C.blue} delay={8} />
          <BgBlob x={500} y={1700} size={380} color={C.yellow} delay={12} />

          {/* Text placed above the blue sphere — dark on light bg for contrast */}
          <SingleText delay={18} y={340} size={140} weight={300} color={C.black}>
            Ambient layers that
          </SingleText>
          <SingleText delay={22} y={530} size={140} weight={700} color={C.blue}>
            breathe and pulse
          </SingleText>
        </FadeWrap>
      </Sequence>

      {/* ═══ S6: TRANSITIONS SHOWCASE (438–508f) ═══ */}
      <Sequence from={438} durationInFrames={70}>
        <FadeWrap dur={70} fadeIn={8} fadeOut={10}>
          <BgBlob x={CX} y={CY} size={700} color={C.blue} delay={0} />
          <RippleWave delay={4} />

          <WordLine
            y={CY - 100}
            words={[
              { text: "Hard", weight: 300, color: C.gray },
              { text: "cuts.", weight: 700, color: C.blue },
            ]}
            size={160}
            stagger={5}
            baseDelay={8}
          />
          <WordLine
            y={CY + 80}
            words={[
              { text: "Soft", weight: 300, color: C.gray },
              { text: "fades.", weight: 700, color: C.pink },
            ]}
            size={160}
            stagger={5}
            baseDelay={14}
          />
          <SingleText delay={22} y={CY + 280} size={52} weight={500} color={C.gray}>
            8–10 frame cross-fades with 0.97 exit scale
          </SingleText>
        </FadeWrap>
      </Sequence>

      {/* ═══ S7: COMBINED — ALL TECHNIQUES (500–570f) ═══ */}
      <Sequence from={500} durationInFrames={70}>
        <FadeWrap dur={70} fadeIn={8} fadeOut={10}>
          <BgBlob x={500} y={400} size={600} color={C.blue} delay={0} />
          <BgBlob x={3300} y={1800} size={500} color={C.pink} delay={4} />
          <DrawStroke d={WAVE_D} color={C.indigo} width={4} delay={6} x={CX - 600} y={CY + 400} />

          {/* Cards: larger, spread to corners */}
          <GlassCard x={450} y={420} w={450} h={330} delay={2} fromX={-200} fromY={160} accent={C.blue} />
          <GlassCard x={3400} y={450} w={420} h={310} delay={6} fromX={200} fromY={180} accent={C.pink} />
          <GlassCard x={500} y={1700} w={460} h={340} delay={10} fromX={-180} fromY={200} accent={C.green} />
          <GlassCard x={3350} y={1650} w={430} h={320} delay={14} fromX={180} fromY={190} accent={C.orange} />

          {/* Progress rings: larger, flanking the text */}
          <ProgressRing x={CX - 600} y={CY} radius={140} progress={0.78} delay={8} color={C.green} strokeWidth={12} />
          <ProgressRing x={CX + 600} y={CY} radius={140} progress={0.91} delay={12} color={C.blue} strokeWidth={12} />

          {/* Focal text: center, hero-sized */}
          <WordLine
            y={CY}
            words={[
              { text: "The", weight: 300, color: C.gray },
              { text: "full", weight: 700, color: C.blue },
              { text: "SaaS", weight: 700, color: C.indigo },
              { text: "stack.", weight: 700, color: C.pink },
            ]}
            size={200}
            stagger={5}
            baseDelay={4}
          />
        </FadeWrap>
      </Sequence>

      {/* ═══ S8: CTA (562–600f) ═══ */}
      <Sequence from={562} durationInFrames={38}>
        <FadeWrap dur={38} fadeIn={6} fadeOut={1}>
          <BgBlob x={CX - 500} y={CY + 200} size={400} color={C.blue} delay={3} />
          <BgBlob x={CX + 500} y={CY - 200} size={350} color={C.pink} delay={6} />

          <WordLine
            y={CY - 60}
            words={[
              { text: "Vertex", weight: 700, color: C.blue },
            ]}
            size={220}
            stagger={0}
            baseDelay={0}
          />
          <SingleText delay={6} y={CY + 120} size={64} weight={400} color={C.gray}>
            Motion design, perfected.
          </SingleText>
        </FadeWrap>
      </Sequence>
    </AbsoluteFill>
  );
};
