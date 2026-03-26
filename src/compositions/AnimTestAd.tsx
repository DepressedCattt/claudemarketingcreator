/**
 * AnimTestAd — Animation Complexity Test
 *
 * A test composition focused purely on demonstrating complex animation
 * techniques learned from FINAL_RENDER_4K.ae-extract.json.
 *
 * Techniques demonstrated:
 *   1. Liquid blob transition (SVG filter goo effect)
 *   2. Procedural dot grid background (radial wave entrance)
 *   3. Magnet-snap floating cards (drift + rotation + snap)
 *   4. Unfurl reveal (clip-path bottom-to-top)
 *   5. Bounce pop stagger (low-damping spring overshoot)
 *   6. Tapered draw-on strokes
 *   7. Horizontal card scroll carousel
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 600 frames @ 30fps = 20 seconds
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

import { SceneFade, BlurWord, WordLine } from "../components/ad-primitives";

// ─── Design Tokens ───────────────────────────────────────────────────────────

const C = {
  bg:        "#0C0F1A",
  bgWarm:    "#1A0F0C",
  surface:   "#151A2E",
  surfaceHi: "#1E2644",
  accent:    "#6366F1",
  accentGlow:"#6366F130",
  cyan:      "#06B6D4",
  cyanGlow:  "#06B6D430",
  amber:     "#F59E0B",
  rose:      "#F43F5E",
  emerald:   "#10B981",
  text:      "#F1F5F9",
  textMid:   "#94A3B8",
  textDim:   "#475569",
  white:     "#FFFFFF",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

const SPR = {
  text:   { stiffness: 180, damping: 25, mass: 0.8 },
  card:   { stiffness: 150, damping: 22, mass: 0.9 },
  bounce: { stiffness: 240, damping: 14, mass: 0.7 },
  snap:   { stiffness: 130, damping: 18, mass: 0.85 },
  glow:   { stiffness: 80,  damping: 26, mass: 1.1 },
};

function useSpr(delay = 0, config = SPR.text) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.max(0, frame - delay), fps, config });
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ═════════════════════════════════════════════════════════════════════════════
// COMPLEX ANIMATION COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. Procedural Dot Grid ─────────────────────────────────────────────────

const DotGrid: React.FC<{
  progress: number;
  color?: string;
  cols?: number;
  rows?: number;
  spacing?: number;
}> = ({ progress, color = C.textDim, cols = 32, rows = 20, spacing = 110 }) => {
  const frame = useCurrentFrame();
  const totalW = cols * spacing;
  const totalH = rows * spacing;
  const startX = (W - totalW) / 2;
  const startY = (H - totalH) / 2;
  const maxDist = Math.sqrt((totalW / 2) ** 2 + (totalH / 2) ** 2);

  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * spacing;
      const y = startY + r * spacing;
      const dist = Math.sqrt((x - CX) ** 2 + (y - CY) ** 2);
      const normalDist = dist / maxDist;
      const dotP = clamp(progress * 2.5 - normalDist, 0, 1);
      const breathe = Math.sin(frame * 0.02 + c * 0.3 + r * 0.2) * 0.15 + 0.85;

      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={x}
          cy={y}
          r={4 * Math.min(1, dotP)}
          fill={color}
          opacity={Math.min(0.2, dotP * 0.2) * breathe}
        />
      );
    }
  }

  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {dots}
    </svg>
  );
};

// ─── 2. Liquid Blob Transition ──────────────────────────────────────────────

const LiquidBlob: React.FC<{
  progress: number;
  color: string;
  filterId: string;
}> = ({ progress, color, filterId }) => {
  const frame = useCurrentFrame();

  const blobs = [
    { cx: 1200, cy: 1800, r: 420, phase: 0, speed: 0.04 },
    { cx: 1920, cy: 1950, r: 380, phase: 1.5, speed: 0.035 },
    { cx: 2600, cy: 1750, r: 340, phase: 3.0, speed: 0.045 },
    { cx: 1600, cy: 2050, r: 280, phase: 4.5, speed: 0.03 },
    { cx: 2200, cy: 1850, r: 260, phase: 2.2, speed: 0.038 },
  ];

  const translateY = interpolate(progress, [0, 1], [900, -700]);

  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0 }}>
      <defs>
        <filter id={filterId}>
          <feGaussianBlur in="SourceGraphic" stdDeviation="45" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 22 -10"
            result="goo"
          />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`} transform={`translate(0, ${translateY})`}>
        {blobs.map((b, i) => {
          const scale = 1 + Math.sin(frame * b.speed + b.phase) * 0.35;
          const wobbleX = Math.sin(frame * 0.02 + b.phase) * 80;
          const wobbleY = Math.cos(frame * 0.025 + b.phase * 0.7) * 50;
          return (
            <ellipse
              key={i}
              cx={b.cx + wobbleX}
              cy={b.cy + wobbleY}
              rx={b.r * scale}
              ry={b.r * scale * 0.8}
              fill={color}
            />
          );
        })}
        <rect x={0} y={1400} width={W} height={1800} fill={color} />
      </g>
    </svg>
  );
};

// ─── 3. Unfurl Reveal ───────────────────────────────────────────────────────

const UnfurlReveal: React.FC<{
  progress: number;
  children: React.ReactNode;
  from?: "bottom" | "top";
}> = ({ progress, children, from = "bottom" }) => {
  const clipPct = (1 - progress) * 100;
  const inset = from === "bottom"
    ? `${clipPct}% 0 0 0`
    : `0 0 ${clipPct}% 0`;
  const scale = 0.94 + progress * 0.06;
  const origin = from === "bottom" ? "bottom center" : "top center";

  return (
    <div
      style={{
        clipPath: `inset(${inset})`,
        transform: `scale(${scale})`,
        transformOrigin: origin,
        opacity: progress > 0.02 ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};

// ─── 4. Magnet Snap Card ────────────────────────────────────────────────────

const MagnetCard: React.FC<{
  children: React.ReactNode;
  progress: number;
  driftX?: number;
  driftY?: number;
  driftRot?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  bgColor?: string;
}> = ({ children, progress, driftX = -200, driftY = 150, driftRot = -8, x, y, w, h, bgColor = C.surface }) => {
  const frame = useCurrentFrame();
  const tx = (1 - progress) * driftX;
  const ty = (1 - progress) * driftY;
  const rot = (1 - progress) * driftRot;
  const shadowBlur = 20 + progress * 40;
  const shadowY = 8 + progress * 22;
  const floatY = progress > 0.95 ? Math.sin(frame * 0.015) * 4 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 28,
        background: bgColor,
        transform: `translate(${tx}px, ${ty + floatY}px) rotate(${rot}deg)`,
        boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.3)`,
        opacity: clamp(progress * 2.5, 0, 1),
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};

// ─── 5. Bounce Pop ──────────────────────────────────────────────────────────

const BouncePop: React.FC<{
  delay: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay, children, style }) => {
  const p = useSpr(delay, SPR.bounce);
  return (
    <div
      style={{
        transform: `scale(${p})`,
        opacity: p > 0.01 ? 1 : 0,
        transformOrigin: "center center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── 6. Tapered Stroke ──────────────────────────────────────────────────────

const TaperedStroke: React.FC<{
  pathD: string;
  progress: number;
  color: string;
  pathLength?: number;
}> = ({ pathD, progress, color, pathLength = 800 }) => {
  const layers = 5;
  return (
    <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {Array.from({ length: layers }).map((_, i) => {
        const lp = clamp(progress - i * 0.03, 0, 1);
        const width = 10 - (i / layers) * 7;
        return (
          <path
            key={i}
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - lp)}
            opacity={(1 - i / layers * 0.4) * progress}
            filter={i === 0 ? `drop-shadow(0 0 8px ${color}80)` : undefined}
          />
        );
      })}
    </svg>
  );
};

// ─── Widget Cards (for the unfurl & scroll showcase) ────────────────────────

const WidgetChart: React.FC<{ progress: number }> = ({ progress }) => {
  const bars = [
    { h: 0.5, color: C.accent },
    { h: 0.75, color: C.cyan },
    { h: 0.6, color: C.accent },
    { h: 0.9, color: C.emerald },
  ];
  return (
    <div style={{ padding: 32, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.textMid, marginBottom: 20, letterSpacing: 2, textTransform: "uppercase" as const }}>
        Revenue
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 24, height: 300 }}>
        {bars.map((b, i) => (
          <BouncePop key={i} delay={i * 3} style={{ flex: 1 }}>
            <div
              style={{
                height: b.h * 300 * progress,
                background: `linear-gradient(180deg, ${b.color}, ${b.color}60)`,
                borderRadius: "8px 8px 4px 4px",
                transition: "height 0.1s",
              }}
            />
          </BouncePop>
        ))}
      </div>
    </div>
  );
};

const WidgetChecklist: React.FC<{ progress: number }> = ({ progress }) => {
  const items = ["Design system", "API endpoints", "User testing", "Launch prep"];
  return (
    <div style={{ padding: 32 }}>
      <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.textMid, marginBottom: 20, letterSpacing: 2, textTransform: "uppercase" as const }}>
        Sprint Tasks
      </div>
      {items.map((item, i) => {
        const done = i < 2;
        return (
          <BouncePop key={i} delay={i * 4}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: done ? C.emerald : `${C.textDim}20`,
                  border: done ? "none" : `2px solid ${C.textDim}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontSize: 18,
                  color: C.white,
                }}
              >
                {done ? "✓" : ""}
              </div>
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 28,
                  color: done ? C.textMid : C.text,
                  textDecoration: done ? "line-through" : "none",
                }}
              >
                {item}
              </span>
            </div>
          </BouncePop>
        );
      })}
    </div>
  );
};

const WidgetChat: React.FC<{ progress: number }> = ({ progress }) => {
  const msgs = [
    { text: "Ship the update today?", align: "left" as const, color: C.surfaceHi },
    { text: "Already deployed! 🚀", align: "right" as const, color: C.accent },
    { text: "Nice, CSAT is up 12%", align: "left" as const, color: C.surfaceHi },
  ];
  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.textMid, marginBottom: 8, letterSpacing: 2, textTransform: "uppercase" as const }}>
        Team Chat
      </div>
      {msgs.map((m, i) => (
        <BouncePop key={i} delay={i * 5}>
          <div style={{ display: "flex", justifyContent: m.align === "right" ? "flex-end" : "flex-start" }}>
            <div
              style={{
                background: m.color,
                borderRadius: 16,
                padding: "12px 20px",
                fontFamily: FONT,
                fontSize: 26,
                color: C.text,
                maxWidth: "70%",
              }}
            >
              {m.text}
            </div>
          </div>
        </BouncePop>
      ))}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENES
// ═════════════════════════════════════════════════════════════════════════════

// S1: Dot Grid + Text intro (0–100f)
const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const gridP = clamp(frame / 40, 0, 1);

  return (
    <SceneFade dur={100} fadeIn={0} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <DotGrid progress={gridP} color={C.accent} />

        <WordLine
          words={[
            { text: "Built", weight: 400 },
            { text: "for", weight: 400 },
            { text: "teams", weight: 700, color: C.accent },
            { text: "that", weight: 400 },
            { text: "move.", weight: 700, color: C.accent },
          ]}
          y={CY - 100}
          size={140}
          stagger={5}
          baseDelay={15}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* Tapered connecting line */}
        <TaperedStroke
          pathD={`M ${CX - 400} ${CY + 100} Q ${CX} ${CY + 200} ${CX + 400} ${CY + 100}`}
          progress={clamp((frame - 30) / 20, 0, 1)}
          color={C.accent}
          pathLength={900}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// S2: Liquid Blob Transition (95–145f)
const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const blobP = clamp(frame / 35, 0, 1);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: C.bg }} />
      <LiquidBlob progress={blobP} color={C.surface} filterId="goo1" />
    </AbsoluteFill>
  );
};

// S3: Magnet-Snap Floating Cards (140–280f)
const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number) =>
    spring({ frame: Math.max(0, frame - d), fps, config: SPR.snap });

  return (
    <SceneFade dur={140} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.surface }}>
        <DotGrid progress={clamp(frame / 30, 0, 1)} color={C.textDim} spacing={130} cols={28} rows={16} />

        <WordLine
          words={[
            { text: "Everything", weight: 400 },
            { text: "in", weight: 400 },
            { text: "its", weight: 400 },
            { text: "place.", weight: 700, color: C.cyan },
          ]}
          y={250}
          size={110}
          stagger={5}
          baseDelay={4}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* Card 1: Chart — drifts from top-left */}
        <MagnetCard
          progress={s(10)}
          x={280} y={500}
          w={900} h={450}
          driftX={-300} driftY={-200} driftRot={12}
          bgColor={C.surfaceHi}
        >
          <UnfurlReveal progress={s(14)}>
            <WidgetChart progress={s(18)} />
          </UnfurlReveal>
        </MagnetCard>

        {/* Card 2: Checklist — drifts from right */}
        <MagnetCard
          progress={s(18)}
          x={1320} y={550}
          w={900} h={450}
          driftX={250} driftY={-150} driftRot={-10}
          bgColor={C.surfaceHi}
        >
          <UnfurlReveal progress={s(22)}>
            <WidgetChecklist progress={s(26)} />
          </UnfurlReveal>
        </MagnetCard>

        {/* Card 3: Chat — drifts from bottom */}
        <MagnetCard
          progress={s(26)}
          x={2360} y={480}
          w={900} h={450}
          driftX={200} driftY={250} driftRot={-6}
          bgColor={C.surfaceHi}
        >
          <UnfurlReveal progress={s(30)}>
            <WidgetChat progress={s(34)} />
          </UnfurlReveal>
        </MagnetCard>

        {/* Tapered connectors between cards */}
        <TaperedStroke
          pathD={`M 1180 720 Q 1250 650 1320 720`}
          progress={clamp((frame - 50) / 18, 0, 1)}
          color={C.cyan}
          pathLength={200}
        />
        <TaperedStroke
          pathD={`M 2220 770 Q 2290 700 2360 770`}
          progress={clamp((frame - 60) / 18, 0, 1)}
          color={C.cyan}
          pathLength={200}
        />

        {/* Bounce-pop avatar dots below the cards */}
        {[0, 1, 2, 3, 4].map((i) => (
          <BouncePop key={i} delay={70 + i * 3} style={{
            position: "absolute",
            left: 600 + i * 200,
            top: 1100,
          }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: [C.accent, C.cyan, C.emerald, C.amber, C.rose][i],
                border: `3px solid ${C.surface}`,
              }}
            />
          </BouncePop>
        ))}
      </AbsoluteFill>
    </SceneFade>
  );
};

// S4: Second Liquid Blob Transition (275–325f)
const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const blobP = clamp(frame / 35, 0, 1);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: C.surface }} />
      <LiquidBlob progress={blobP} color={C.bg} filterId="goo2" />
    </AbsoluteFill>
  );
};

// S5: Horizontal Card Scroll (320–490f)
const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const scrollP = clamp((frame - 15) / 140, 0, 1);

  const cardW = 850;
  const gap = 80;
  const cards = [
    { label: "Analytics", color: C.accent, content: <WidgetChart progress={1} /> },
    { label: "Tasks", color: C.emerald, content: <WidgetChecklist progress={1} /> },
    { label: "Messages", color: C.cyan, content: <WidgetChat progress={1} /> },
    { label: "Reports", color: C.amber, content: <WidgetChart progress={1} /> },
    { label: "Planning", color: C.rose, content: <WidgetChecklist progress={1} /> },
  ];

  const totalW = cards.length * (cardW + gap);
  const scrollX = interpolate(scrollP, [0, 1], [W, -totalW + W * 0.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFade dur={170} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <DotGrid progress={clamp(frame / 25, 0, 1)} color={C.textDim} />

        <WordLine
          words={[
            { text: "Your", weight: 400 },
            { text: "workspace.", weight: 700, color: C.accent },
            { text: "Your", weight: 400 },
            { text: "way.", weight: 700, color: C.cyan },
          ]}
          y={300}
          size={120}
          stagger={5}
          baseDelay={4}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* Horizontal scrolling cards */}
        <div style={{ position: "absolute", left: 0, top: 550, width: W, height: 600, overflow: "hidden" }}>
          <div style={{ display: "flex", gap, position: "absolute", top: 0, transform: `translateX(${scrollX}px)` }}>
            {cards.map((card, i) => (
              <div
                key={i}
                style={{
                  width: cardW,
                  height: 520,
                  flexShrink: 0,
                  borderRadius: 28,
                  background: C.surfaceHi,
                  border: `1px solid ${card.color}20`,
                  overflow: "hidden",
                  boxShadow: `0 20px 60px rgba(0,0,0,0.3)`,
                }}
              >
                <div style={{
                  height: 6,
                  background: `linear-gradient(90deg, ${card.color}, ${card.color}60)`,
                }} />
                {card.content}
              </div>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// S6: Tagline + CTA (485–600f)
const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  const gridP = clamp(frame / 30, 0, 1);
  const btnP = s(20, SPR.bounce);
  const btnPulse = 1 + Math.sin(frame * 0.06) * 0.015 * btnP;

  return (
    <SceneFade dur={115} fadeIn={8} fadeOut={0}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <DotGrid progress={gridP} color={C.accent} spacing={140} cols={26} rows={14} />

        {/* Tapered decorative arcs */}
        <TaperedStroke
          pathD={`M 800 ${CY - 300} Q ${CX} ${CY - 500} ${W - 800} ${CY - 300}`}
          progress={clamp(frame / 25, 0, 1)}
          color={C.accent}
          pathLength={2400}
        />
        <TaperedStroke
          pathD={`M 800 ${CY + 300} Q ${CX} ${CY + 500} ${W - 800} ${CY + 300}`}
          progress={clamp((frame - 5) / 25, 0, 1)}
          color={C.cyan}
          pathLength={2400}
        />

        <WordLine
          words={[
            { text: "Ship", weight: 700, color: C.accent },
            { text: "faster.", weight: 700, color: C.cyan },
            { text: "Together.", weight: 700, color: C.emerald },
          ]}
          y={CY - 120}
          size={170}
          stagger={6}
          baseDelay={6}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* CTA button */}
        <div
          style={{
            position: "absolute",
            left: CX - 280,
            top: CY + 100,
            width: 560,
            height: 90,
            borderRadius: 45,
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontSize: 36,
            fontWeight: 600,
            color: C.white,
            boxShadow: `0 0 40px ${C.accentGlow}, 0 8px 32px rgba(0,0,0,0.3)`,
            opacity: btnP,
            transform: `scale(${(0.85 + btnP * 0.15) * btnPulse})`,
          }}
        >
          Start building free
        </div>

        <div style={{ position: "absolute", left: 0, right: 0, top: CY + 230, textAlign: "center" }}>
          <BlurWord
            text="teamflow.dev"
            delay={28}
            fontWeight={400}
            color={C.textMid}
            size={44}
            fontFamily={FONT}
            springConfig={SPR.text}
          />
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const AnimTestAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* S1: Dot Grid + Text (0–100f) */}
      <Sequence from={0} durationInFrames={100}>
        <Scene1 />
      </Sequence>

      {/* S2: Liquid Blob Transition (95–145f) */}
      <Sequence from={95} durationInFrames={50}>
        <Scene2 />
      </Sequence>

      {/* S3: Magnet-Snap Cards (140–280f) */}
      <Sequence from={140} durationInFrames={140}>
        <Scene3 />
      </Sequence>

      {/* S4: Liquid Blob Transition 2 (275–325f) */}
      <Sequence from={275} durationInFrames={50}>
        <Scene4 />
      </Sequence>

      {/* S5: Horizontal Card Scroll (320–490f) */}
      <Sequence from={320} durationInFrames={170}>
        <Scene5 />
      </Sequence>

      {/* S6: Tagline + CTA (485–600f) */}
      <Sequence from={485} durationInFrames={115}>
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};
