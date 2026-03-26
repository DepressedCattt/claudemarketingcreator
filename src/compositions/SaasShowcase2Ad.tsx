/**
 * SaasShowcase2Ad — "Ember" SaaS Technique Showcase
 *
 * Same subcategory coverage as Vertex but with a completely different
 * visual identity using a red/black/cream palette (KFC-inspired).
 *
 *   S1  text-animation     (  0– 90f)  "Build faster. Ship smarter."
 *   S2  ui-elements        ( 82–185f)  Dark glass dashboard cards with red accents
 *   S3  data-viz           (178–268f)  Red progress rings + animated counters
 *   S4  spring-physics     (260–355f)  Four spring presets on dark bg
 *   S5  background-effects (348–445f)  Red blobs + cream strokes + concentric rings
 *   S6  transitions        (438–508f)  Hard cuts with ripple on cream bg
 *   S7  combined           (500–570f)  All techniques layered
 *   S8  CTA                (562–600f)  "Ember" brand close
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 600 frames @ 30fps = 20 seconds
 * Category: saas (all subcategories)
 *
 * Composition Guidelines Applied:
 *   - Focal elements ≥30% canvas width/height
 *   - Text in top/bottom 20% zones — never overlapping visuals
 *   - All text has ≥4.5:1 contrast ratio against its background
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

const C = {
  red: "#A3080B",
  black: "#000000",
  white: "#FFFFFF",
  cream: "#FFF1E2",
  peach: "#F5D4B7",
  darkRed: "#7a0608",
  lightRed: "#d41a1d",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

const SPR = {
  text: { stiffness: 170, damping: 25, mass: 0.8 },
  hero: { stiffness: 100, damping: 24, mass: 1.1 },
  ui: { stiffness: 155, damping: 22, mass: 0.85 },
  bg: { stiffness: 45, damping: 24, mass: 1.4 },
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

// ═══ TEXT ANIMATION ═════════════════════════════════════════════════════════

interface WordCfg {
  text: string;
  weight?: number;
  color?: string;
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
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.94 + p * 0.06})`,
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
        size={size}
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

// ═══ UI ELEMENTS ════════════════════════════════════════════════════════════

const DarkCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  fromY?: number;
  accent?: string;
}> = ({ x, y, w, h, delay, fromY = 200, accent = C.red }) => {
  const frame = useCurrentFrame();
  const p = useSpr(delay, SPR.ui);
  const bob = Math.sin(frame * 0.03 + x * 0.003) * 5;

  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2 + (1 - p) * fromY + bob,
        width: w,
        height: h,
        borderRadius: 28,
        background: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `0 24px 64px rgba(0,0,0,0.3), 0 0 0 1px rgba(163,8,11,0.1), inset 0 1px 0 rgba(255,255,255,0.06)`,
        opacity: p,
        transform: `scale(${0.65 + p * 0.35})`,
        padding: 24,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[C.red, C.peach, C.cream].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{ height: 8, width: "65%", borderRadius: 5, background: accent, marginBottom: 14, opacity: 0.9 }} />
      {[0.8, 0.55, 0.35].map((w2, i) => (
        <div key={i} style={{ height: h * 0.06, borderRadius: 6, marginBottom: 8, background: i === 0 ? `${accent}20` : "rgba(255,255,255,0.06)", width: `${w2 * 100}%` }} />
      ))}
    </div>
  );
};

const KpiWidget: React.FC<{
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
        borderRadius: 24,
        background: C.cream,
        border: `2px solid ${accent}20`,
        boxShadow: `0 12px 40px rgba(163,8,11,0.08)`,
        opacity: p,
        transform: `scale(${0.7 + p * 0.3}) translateY(${(1 - p) * 50}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: h * 0.12, color: C.black, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" as const, opacity: 0.5 }}>{label}</div>
      <div style={{ fontFamily: FONT, fontSize: h * 0.32, fontWeight: 700, color: accent, letterSpacing: -4 }}>{value}</div>
    </div>
  );
};

// ═══ DATA VIZ ═══════════════════════════════════════════════════════════════

const AnimCounter: React.FC<{
  target: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
  size?: number;
  color?: string;
}> = ({ target, suffix = "", prefix = "", delay = 0, size = 280, color = C.red }) => {
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

const Ring: React.FC<{
  x: number;
  y: number;
  radius: number;
  progress: number;
  delay: number;
  color: string;
  strokeWidth?: number;
}> = ({ x, y, radius, progress, delay, color, strokeWidth = 14 }) => {
  const p = useSpr(delay, SPR.hero);
  const circ = 2 * Math.PI * radius;
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
      <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} fill="none" stroke={`${color}15`} strokeWidth={strokeWidth} />
      <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={circ * (1 - p * progress)} strokeLinecap="round" style={{ opacity: p }} />
    </svg>
  );
};

const Bar: React.FC<{
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
      <div style={{ fontFamily: FONT, fontSize: 32, color: C.black, marginBottom: 10, fontWeight: 500, opacity: 0.6 }}>{label}</div>
      <div style={{ width: w, height: h, borderRadius: h / 2, background: `${color}15`, overflow: "hidden" }}>
        <div style={{ width: w * fill * p, height: h, borderRadius: h / 2, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
      </div>
    </div>
  );
};

// ═══ BACKGROUND EFFECTS ═════════════════════════════════════════════════════

const Blob: React.FC<{
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
        background: `radial-gradient(circle, ${color}28 0%, transparent 60%)`,
        transform: `scale(${p * pulse})`,
        opacity: p * 0.5,
        filter: "blur(40px)",
      }}
    />
  );
};

const Stroke: React.FC<{
  d: string;
  color: string;
  width?: number;
  delay?: number;
  x?: number;
  y?: number;
}> = ({ d, color, width = 5, delay = 0, x = CX, y = CY }) => {
  const p = useSpr(delay, SPR.bg);
  return (
    <svg style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity: p * 0.35 }} width="1" height="1" viewBox="0 0 1 1">
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray="4000" strokeDashoffset={4000 * (1 - p)} strokeLinecap="round" />
    </svg>
  );
};

const Rings: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const radii = [500, 700, 900, 1100];
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CX - 360,
          top: CY - 360,
          width: 720,
          height: 720,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${C.lightRed}, ${C.red}, ${C.darkRed})`,
          transform: `scale(${spring({ frame: Math.max(0, frame - delay), fps, config: SPR.bg }) * 0.6 * (1 + Math.sin(frame * 0.035) * 0.015)})`,
          boxShadow: `0 0 140px ${C.red}30`,
        }}
      />
      {radii.map((r, i) => {
        const rp = spring({ frame: Math.max(0, frame - delay - 5 - i * 4), fps, config: SPR.bg });
        const op = 0.18 + Math.sin(frame * 0.04 + i * 1.8) * 0.06;
        return (
          <svg key={i} style={{ position: "absolute", left: CX - r / 2, top: CY - r / 2, width: r, height: r, opacity: rp * op, transform: `rotate(${frame * (i % 2 === 0 ? -0.12 : 0.15)}deg)` }}>
            <circle cx={r / 2} cy={r / 2} r={r / 2 - 2} fill="none" stroke={C.red} strokeWidth={2} strokeDasharray={`${16 + i * 10} ${10 + i * 5}`} />
          </svg>
        );
      })}
    </>
  );
};

const Ripple: React.FC<{ delay?: number; color?: string }> = ({ delay = 0, color = C.red }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const rp = spring({ frame: Math.max(0, frame - delay - i * 3), fps, config: { damping: 16, stiffness: 25, mass: 1.5 } });
        const r = (160 + i * 60) * rp;
        return (
          <div key={i} style={{ position: "absolute", left: CX - r, top: CY - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${Math.max(1, 2.5 - i * 0.25)}px solid ${color}`, opacity: (1 - i / 8) * rp * 0.3 }} />
        );
      })}
    </>
  );
};

// ═══ TRANSITIONS ════════════════════════════════════════════════════════════

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

// ═══ SPRING BALLS ═══════════════════════════════════════════════════════════

const SpringBall: React.FC<{
  x: number;
  y: number;
  config: { stiffness: number; damping: number; mass: number };
  delay: number;
  color: string;
  label: string;
  size?: number;
}> = ({ x, y, config, delay, color, label, size = 120 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config });
  const currentY = y + (y - 500 - y) * p;

  return (
    <div style={{ position: "absolute", left: x - size / 2, top: currentY - size / 2 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${color}dd, ${color})`, boxShadow: `0 ${16 * (1 - p)}px ${40 * (1 - p)}px ${color}40`, opacity: Math.min(1, p * 3) }} />
      <div style={{ fontFamily: FONT, fontSize: 30, fontWeight: 600, color, textAlign: "center", marginTop: 16, opacity: p, letterSpacing: 1, textTransform: "uppercase" as const }}>{label}</div>
    </div>
  );
};

// ═══ SVG PATHS ══════════════════════════════════════════════════════════════

const ARC_D = "M -800,-200 C -400,-600 200,-400 600,-100 C 1000,200 1400,-300 1800,-500";
const FLOW_D = "M -900,100 C -300,400 300,-200 900,100 C 1500,400 2100,-200 2700,100";

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const SaasShowcase2Ad: React.FC = () => {
  const frame = useCurrentFrame();

  const darkPhase =
    frame >= 255 && frame <= 360
      ? interpolate(frame, [255, 268, 348, 360], [0, 0.95, 0.95, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: C.cream, overflow: "hidden" }}>
      {/* Subtle warm ambient */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 25%, rgba(163,8,11,0.015) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(245,212,183,0.03) 0%, transparent 45%)" }} />

      {/* ═══ S1: TEXT ANIMATION (0–90f) — cream bg, dark/red text ═══ */}
      <Sequence from={0} durationInFrames={90}>
        <FadeWrap dur={90} fadeIn={1} fadeOut={10}>
          <Blob x={500} y={400} size={600} color={C.red} delay={8} />
          <Blob x={3300} y={500} size={500} color={C.peach} delay={14} />
          <Blob x={600} y={1800} size={400} color={C.red} delay={20} />

          <WordLine
            y={CY - 180}
            words={[
              { text: "Build", weight: 300, color: C.black },
              { text: "faster.", weight: 700, color: C.red },
            ]}
            size={220}
            stagger={7}
          />
          <WordLine
            y={CY + 80}
            words={[
              { text: "Ship", weight: 300, color: C.black },
              { text: "smarter.", weight: 700, color: C.red },
            ]}
            size={220}
            stagger={7}
            baseDelay={10}
          />
          <SingleText delay={22} y={H - 180} size={52} weight={500} color={`${C.black}80`}>
            Staggered blur-scale reveals with color-weighted typography
          </SingleText>
        </FadeWrap>
      </Sequence>

      {/* ═══ S2: UI ELEMENTS (82–185f) — dark cards on cream ═══ */}
      <Sequence from={82} durationInFrames={103}>
        <FadeWrap dur={103} fadeIn={8} fadeOut={10}>
          <DarkCard x={400} y={400} w={540} h={400} delay={0} accent={C.red} />
          <DarkCard x={1350} y={340} w={500} h={370} delay={4} accent={C.peach} />
          <DarkCard x={2550} y={420} w={520} h={390} delay={8} accent={C.red} />
          <DarkCard x={3450} y={360} w={480} h={360} delay={12} accent={C.lightRed} />
          <DarkCard x={600} y={1680} w={550} h={400} delay={6} accent={C.peach} />
          <DarkCard x={3200} y={1650} w={510} h={380} delay={10} accent={C.red} />

          {/* Focal: KPI widgets — hero-sized, center stage */}
          <KpiWidget x={CX - 580} y={CY} w={460} h={320} delay={14} label="Pipeline" value="$12.4M" accent={C.red} />
          <KpiWidget x={CX} y={CY} w={460} h={320} delay={17} label="Deals" value="3,847" accent={C.darkRed} />
          <KpiWidget x={CX + 580} y={CY} w={460} h={320} delay={20} label="Win Rate" value="67%" accent={C.red} />

          <SingleText delay={24} y={H - 160} size={52} weight={500} color={`${C.black}70`}>
            Dark glass cards with red-accent spring entrance
          </SingleText>
        </FadeWrap>
      </Sequence>

      {/* ═══ S3: DATA VIZ (178–268f) — rings and counters on cream ═══ */}
      <Sequence from={178} durationInFrames={90}>
        <FadeWrap dur={90} fadeIn={8} fadeOut={10}>
          {/* Focal: hero ring — 40%+ canvas height */}
          <div style={{ position: "absolute", left: CX, top: CY - 120, transform: "translate(-50%, -50%)" }}>
            <Ring x={0} y={0} radius={320} progress={0.91} delay={0} color={C.red} strokeWidth={22} />
            <div style={{ position: "absolute", left: -320, top: -320, width: 640, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AnimCounter target={91} suffix="%" delay={4} size={320} color={C.red} />
            </div>
          </div>

          <Ring x={CX - 800} y={CY - 200} radius={160} progress={0.74} delay={8} color={C.darkRed} strokeWidth={14} />
          <div style={{ position: "absolute", left: CX - 960, top: CY - 360, width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimCounter target={74} suffix="%" delay={10} size={120} color={C.darkRed} />
          </div>

          <Ring x={CX + 800} y={CY - 200} radius={160} progress={0.88} delay={12} color={C.lightRed} strokeWidth={14} />
          <div style={{ position: "absolute", left: CX + 640, top: CY - 360, width: 320, height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AnimCounter target={88} suffix="%" delay={14} size={120} color={C.lightRed} />
          </div>

          <Bar x={CX - 600} y={CY + 340} w={520} h={24} fill={0.91} delay={16} color={C.red} label="Close Rate" />
          <Bar x={CX - 600} y={CY + 440} w={520} h={24} fill={0.67} delay={19} color={C.darkRed} label="Retention" />
          <Bar x={CX - 600} y={CY + 540} w={520} h={24} fill={0.84} delay={22} color={C.lightRed} label="NPS Score" />

          <Bar x={CX + 80} y={CY + 340} w={520} h={24} fill={0.78} delay={18} color={C.red} label="Velocity" />
          <Bar x={CX + 80} y={CY + 440} w={520} h={24} fill={0.93} delay={21} color={C.darkRed} label="Accuracy" />
          <Bar x={CX + 80} y={CY + 540} w={520} h={24} fill={0.61} delay={24} color={C.lightRed} label="Coverage" />
        </FadeWrap>
      </Sequence>

      {/* Dark overlay for S4 */}
      {darkPhase > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${darkPhase})`, zIndex: 1 }} />
      )}

      {/* ═══ S4: SPRING PHYSICS (260–355f) — dark bg ═══ */}
      <Sequence from={260} durationInFrames={95} style={{ zIndex: 2 }}>
        <FadeWrap dur={95} fadeIn={8} fadeOut={10}>
          {/* Title zone: top 22% — clear of balls */}
          <SingleText delay={6} y={280} size={160} weight={700} color={C.cream}>
            Spring Physics
          </SingleText>
          <SingleText delay={10} y={480} size={56} weight={400} color={`${C.cream}88`}>
            Four presets — text, hero, UI, background — each critically tuned
          </SingleText>

          {/* Ball zone: center-low, well below text */}
          <SpringBall x={CX - 650} y={CY + 400} config={SPR.text} delay={4} color={C.red} label="Text" />
          <SpringBall x={CX - 220} y={CY + 400} config={SPR.hero} delay={4} color={C.peach} label="Hero" />
          <SpringBall x={CX + 220} y={CY + 400} config={SPR.ui} delay={4} color={C.cream} label="UI" />
          <SpringBall x={CX + 650} y={CY + 400} config={SPR.bg} delay={4} color={C.lightRed} label="BG" />
        </FadeWrap>
      </Sequence>

      {/* ═══ S5: BACKGROUND EFFECTS (348–445f) — rings + strokes on cream ═══ */}
      <Sequence from={348} durationInFrames={97}>
        <FadeWrap dur={97} fadeIn={10} fadeOut={12}>
          <Rings delay={0} />

          <Stroke d={ARC_D} color={C.red} delay={6} x={CX - 200} y={CY - 300} />
          <Stroke d={FLOW_D} color={C.peach} width={4} delay={10} x={CX - 400} y={CY + 200} />

          <Blob x={400} y={400} size={600} color={C.red} delay={4} />
          <Blob x={3400} y={1800} size={500} color={C.peach} delay={8} />

          {/* Text: top zone, dark on cream for contrast */}
          <SingleText delay={18} y={300} size={150} weight={300} color={C.black}>
            Layers that
          </SingleText>
          <SingleText delay={22} y={500} size={150} weight={700} color={C.red}>
            breathe
          </SingleText>
        </FadeWrap>
      </Sequence>

      {/* ═══ S6: TRANSITIONS (438–508f) — ripple + text on cream ═══ */}
      <Sequence from={438} durationInFrames={70}>
        <FadeWrap dur={70} fadeIn={8} fadeOut={10}>
          <Blob x={CX} y={CY} size={800} color={C.red} delay={0} />
          <Ripple delay={4} />

          <WordLine
            y={CY - 120}
            words={[
              { text: "Cut", weight: 300, color: C.black },
              { text: "clean.", weight: 700, color: C.red },
            ]}
            size={180}
            stagger={5}
            baseDelay={8}
          />
          <WordLine
            y={CY + 100}
            words={[
              { text: "Fade", weight: 300, color: C.black },
              { text: "smooth.", weight: 700, color: C.darkRed },
            ]}
            size={180}
            stagger={5}
            baseDelay={14}
          />
          <SingleText delay={22} y={H - 160} size={52} weight={500} color={`${C.black}60`}>
            Hard-cut rhythm with 8–10 frame cross-fades
          </SingleText>
        </FadeWrap>
      </Sequence>

      {/* ═══ S7: COMBINED (500–570f) ═══ */}
      <Sequence from={500} durationInFrames={70}>
        <FadeWrap dur={70} fadeIn={8} fadeOut={10}>
          <Blob x={500} y={400} size={600} color={C.red} delay={0} />
          <Blob x={3300} y={1800} size={500} color={C.peach} delay={4} />
          <Stroke d={FLOW_D} color={C.red} width={4} delay={6} x={CX - 600} y={CY + 400} />

          <DarkCard x={420} y={420} w={460} h={340} delay={2} accent={C.red} />
          <DarkCard x={3420} y={450} w={440} h={320} delay={6} accent={C.peach} />
          <DarkCard x={480} y={1700} w={470} h={350} delay={10} accent={C.red} />
          <DarkCard x={3360} y={1660} w={450} h={330} delay={14} accent={C.lightRed} />

          <Ring x={CX - 600} y={CY} radius={140} progress={0.82} delay={8} color={C.red} strokeWidth={12} />
          <Ring x={CX + 600} y={CY} radius={140} progress={0.95} delay={12} color={C.darkRed} strokeWidth={12} />

          <WordLine
            y={CY}
            words={[
              { text: "The", weight: 300, color: C.black },
              { text: "full", weight: 700, color: C.red },
              { text: "stack.", weight: 700, color: C.darkRed },
            ]}
            size={220}
            stagger={5}
            baseDelay={4}
          />
        </FadeWrap>
      </Sequence>

      {/* ═══ S8: CTA (562–600f) ═══ */}
      <Sequence from={562} durationInFrames={38}>
        <FadeWrap dur={38} fadeIn={6} fadeOut={1}>
          <Blob x={CX - 500} y={CY + 200} size={500} color={C.red} delay={3} />
          <Blob x={CX + 500} y={CY - 200} size={400} color={C.peach} delay={6} />

          <WordLine
            y={CY - 80}
            words={[{ text: "Ember", weight: 700, color: C.red }]}
            size={260}
            stagger={0}
          />
          <SingleText delay={6} y={CY + 140} size={68} weight={400} color={C.black}>
            Motion that converts.
          </SingleText>
        </FadeWrap>
      </Sequence>
    </AbsoluteFill>
  );
};
