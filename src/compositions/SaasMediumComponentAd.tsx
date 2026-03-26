/**
 * SaasMediumComponentAd — "ComponentForge" Medium-Complexity Component Animation
 *
 * Steps up from SaasSimpleComponentAd by adding:
 *   - Glow effects (box-shadow color spread, CSS filter glow)
 *   - Inter-component choreography (data-flow connectors, cascading state changes)
 *   - Richer lighting (radiant gradient overlays, ambient glow orbs, light-source sim)
 *   - Layered depth (parallax-like stagger, overlapping cards with z-depth)
 *   - Micro-interactions (animated toggles triggering card state, pulse indicators)
 *   - Draw-on SVG connectors between components
 *
 * AE reference:
 *   Source: Final_Comp_1–10.ae-extract.json
 *   All comps: 3840×2160, 30fps, glow effects (ADBE Glo2), drop shadows,
 *   inner shadows, nested precomps with shape layers.
 *
 * Scenes:
 *   S1 "Orchestrate" — Dashboard card grid with glow-lit entrances + ambient light orbs
 *   S2 "Connect"     — Data-flow: cards linked by animated SVG connectors, state cascade
 *   S3 "Illuminate"  — Notification stack with glow pulse + expanding ring indicators
 *   S4 "Compose"     — Multi-card assembly: cards slide, overlap, reorder with depth shadows
 *   S5 CTA           — Brand close with glowing brand mark + ambient light breathing
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 600 frames @ 30fps = 20 seconds
 * Category: saas (component-animation-medium)
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
  bg:          "#0F172A",
  bgMid:       "#1E293B",
  bgLight:     "#334155",
  surface:     "#1E293B",
  surfaceHi:   "#2D3B50",
  card:        "#F8FAFC",
  cardDark:    "#0F172A",
  accent:      "#3B82F6",
  accentLight: "#60A5FA",
  accentGlow:  "#3B82F640",
  cyan:        "#22D3EE",
  cyanGlow:    "#22D3EE30",
  emerald:     "#10B981",
  emeraldGlow: "#10B98130",
  amber:       "#F59E0B",
  amberGlow:   "#F59E0B30",
  rose:        "#FB7185",
  roseGlow:    "#FB718530",
  violet:      "#8B5CF6",
  violetGlow:  "#8B5CF630",
  text:        "#F8FAFC",
  textMid:     "#94A3B8",
  textDim:     "#64748B",
  white:       "#FFFFFF",
  black:       "#000000",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

// ─── Spring Presets (medium complexity — slightly bouncier for choreography) ─

const SPR = {
  card:    { stiffness: 150, damping: 22, mass: 0.9  },
  glow:    { stiffness: 80,  damping: 26, mass: 1.1  },
  text:    { stiffness: 170, damping: 25, mass: 0.8  },
  icon:    { stiffness: 200, damping: 20, mass: 0.7  },
  cta:     { stiffness: 120, damping: 18, mass: 0.9  },
  connect: { stiffness: 100, damping: 24, mass: 0.95 },
};

// ─── Scene Fade ─────────────────────────────────────────────────────────────

const SceneFade: React.FC<{
  children: React.ReactNode;
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, dur, fadeIn = 8, fadeOut = 10 }) => {
  const frame = useCurrentFrame();
  const inOp = fadeIn > 0 ? Math.min(1, frame / fadeIn) : 1;
  const outOp = fadeOut > 0 ? Math.min(1, (dur - frame) / fadeOut) : 1;
  const exitScale =
    fadeOut > 0 && dur - frame < fadeOut
      ? interpolate(frame, [dur - fadeOut, dur], [1, 0.97], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  return (
    <AbsoluteFill
      style={{
        opacity: Math.max(0, Math.min(inOp, outOp)),
        transform: `scale(${exitScale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ─── Ambient Glow Orb ───────────────────────────────────────────────────────

const GlowOrb: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  progress: number;
  phase?: number;
}> = ({ x, y, size, color, glowColor, progress, phase = 0 }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame * 0.03 + phase) * 0.15 + 0.85;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2 + Math.sin(frame * 0.015 + phase) * 6,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 40% 35%, ${color}, transparent 70%)`,
        boxShadow: `0 0 ${size * 0.8}px ${size * 0.3}px ${glowColor}`,
        opacity: progress * breathe * 0.6,
        transform: `scale(${0.5 + progress * 0.5})`,
      }}
    />
  );
};

// ─── Glow Card ──────────────────────────────────────────────────────────────

const GlowCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  glowColor: string;
  progress: number;
  children: React.ReactNode;
  radius?: number;
  depth?: number;
}> = ({ x, y, w, h, glowColor, progress, children, radius = 32, depth = 0 }) => {
  const frame = useCurrentFrame();
  const glowPulse = Math.sin(frame * 0.04 + depth) * 0.3 + 0.7;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
        border: `1px solid ${glowColor}40`,
        boxShadow: [
          `0 0 ${40 * glowPulse}px ${glowColor}`,
          `0 ${16 + depth * 4}px ${48 + depth * 8}px rgba(0,0,0,0.4)`,
          `inset 0 1px 0 rgba(255,255,255,0.06)`,
          `inset 0 -1px 0 rgba(0,0,0,0.2)`,
        ].join(", "),
        transform: `translateY(${(1 - progress) * 60}px) scale(${0.85 + progress * 0.15})`,
        opacity: progress,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -h * 0.3,
          left: "20%",
          width: w * 0.6,
          height: h * 0.5,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
          opacity: 0.15 * glowPulse,
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
};

// ─── SVG Connector ──────────────────────────────────────────────────────────

const AnimatedConnector: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  progress: number;
  curved?: boolean;
}> = ({ x1, y1, x2, y2, color, progress, curved = true }) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = curved ? mx + dy * 0.25 : mx;
  const cy = curved ? my - dx * 0.15 : my;

  const pathD = curved
    ? `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  const pathLength = Math.sqrt(dx * dx + dy * dy) * (curved ? 1.2 : 1);

  return (
    <svg
      style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none" }}
    >
      <path
        d={pathD}
        fill="none"
        stroke={`${color}20`}
        strokeWidth={3}
      />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress)}
        filter={`drop-shadow(0 0 6px ${color})`}
      />
      <circle
        cx={interpolate(progress, [0, 1], [x1, x2])}
        cy={interpolate(progress, [0, 1], [y1, y2])}
        r={6}
        fill={color}
        opacity={progress > 0.05 && progress < 0.95 ? 1 : 0}
        filter={`drop-shadow(0 0 8px ${color})`}
      />
    </svg>
  );
};

// ─── Progress Ring ──────────────────────────────────────────────────────────

const ProgressRing: React.FC<{
  x: number;
  y: number;
  radius: number;
  strokeWidth: number;
  color: string;
  progress: number;
  label?: string;
  value?: string;
}> = ({ x, y, radius, strokeWidth, color, progress, label, value }) => {
  const circumference = 2 * Math.PI * radius;
  const size = (radius + strokeWidth) * 2;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2 }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`${color}20`}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress * 0.88)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={`drop-shadow(0 0 8px ${color}80)`}
        />
      </svg>
      {value && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: FONT,
              fontSize: 56,
              fontWeight: 700,
              color: C.text,
              letterSpacing: -2,
            }}
          >
            {value}
          </span>
          {label && (
            <span
              style={{
                fontFamily: FONT,
                fontSize: 24,
                fontWeight: 400,
                color: C.textMid,
                marginTop: 4,
              }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Notification Badge ─────────────────────────────────────────────────────

const NotificationBadge: React.FC<{
  count: number;
  x: number;
  y: number;
  color: string;
  progress: number;
}> = ({ count, x, y, color, progress }) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame * 0.08) * 0.08 * progress;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${progress * pulse})`,
        boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
        zIndex: 10,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 700,
          color: C.white,
        }}
      >
        {count}
      </span>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 1: "Orchestrate" — Dashboard cards with glow-lit entrances
// ═════════════════════════════════════════════════════════════════════════════

const SceneOrchestrate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = (delay: number, config = SPR.card) =>
    spring({ frame: Math.max(0, frame - delay), fps, config });
  const txt = (delay: number) => s(delay, SPR.text);

  const cards = [
    { x: 200, y: 480, w: 1060, h: 480, glow: C.accentGlow, color: C.accent, title: "Revenue", value: "$124.8K", delta: "+12.3%", delay: 8 },
    { x: 1340, y: 480, w: 1060, h: 480, glow: C.emeraldGlow, color: C.emerald, title: "Conversions", value: "2,847", delta: "+8.1%", delay: 14 },
    { x: 2480, y: 480, w: 1160, h: 480, glow: C.cyanGlow, color: C.cyan, title: "Active Users", value: "14.2K", delta: "+23.5%", delay: 20 },
    { x: 200, y: 1040, w: 1620, h: 520, glow: C.violetGlow, color: C.violet, title: "Engagement Score", value: "94", delta: "/100", delay: 26 },
    { x: 1900, y: 1040, w: 1740, h: 520, glow: C.amberGlow, color: C.amber, title: "Pipeline Value", value: "$2.4M", delta: "+31%", delay: 32 },
  ];

  return (
    <SceneFade dur={120} fadeIn={6} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Ambient glow orbs */}
        <GlowOrb x={400} y={350} size={600} color={C.accent} glowColor={C.accentGlow} progress={s(4, SPR.glow)} phase={0} />
        <GlowOrb x={3400} y={300} size={500} color={C.cyan} glowColor={C.cyanGlow} progress={s(8, SPR.glow)} phase={2} />
        <GlowOrb x={1900} y={1800} size={700} color={C.violet} glowColor={C.violetGlow} progress={s(12, SPR.glow)} phase={4} />

        {/* Radiant light source (top center) */}
        <div
          style={{
            position: "absolute",
            left: CX - 600,
            top: -200,
            width: 1200,
            height: 600,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.accent}15, transparent 70%)`,
            opacity: txt(4),
            filter: "blur(60px)",
          }}
        />

        {/* Title */}
        {(() => {
          const tp = txt(4);
          const blur = (1 - tp) * 10;
          return (
            <div
              style={{
                position: "absolute",
                left: 200,
                top: 160,
                transform: `translateY(${(1 - tp) * 40}px)`,
                opacity: tp,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 140,
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: -4,
                }}
              >
                Orchestrate
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 44,
                  fontWeight: 400,
                  color: C.textMid,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                  marginTop: 8,
                }}
              >
                glow-lit dashboard cards
              </div>
            </div>
          );
        })()}

        {/* Dashboard Cards */}
        {cards.map(({ x, y, w, h, glow, color, title, value, delta, delay }, i) => (
          <GlowCard
            key={i}
            x={x}
            y={y}
            w={w}
            h={h}
            glowColor={glow}
            progress={s(delay)}
            radius={40}
            depth={i}
          >
            <div style={{ padding: "48px 56px", position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: color,
                    boxShadow: `0 0 12px ${color}`,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 36,
                    fontWeight: 500,
                    color: C.textMid,
                    letterSpacing: 1,
                    textTransform: "uppercase" as const,
                  }}
                >
                  {title}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: w > 1200 ? 120 : 100,
                    fontWeight: 700,
                    color: C.text,
                    letterSpacing: -4,
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 44,
                    fontWeight: 600,
                    color: color,
                  }}
                >
                  {delta}
                </span>
              </div>
              {/* Mini sparkline bar */}
              <div
                style={{
                  marginTop: 24,
                  height: 8,
                  borderRadius: 4,
                  background: `${color}15`,
                  overflow: "hidden",
                  width: "80%",
                }}
              >
                <div
                  style={{
                    width: `${s(delay + 15) * 75}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${color}, ${color}80)`,
                    boxShadow: `0 0 8px ${color}60`,
                  }}
                />
              </div>
            </div>
          </GlowCard>
        ))}

        {/* Notification badges */}
        <NotificationBadge count={3} x={1200} y={460} color={C.rose} progress={s(40, SPR.icon)} />
        <NotificationBadge count={7} x={3580} y={460} color={C.accent} progress={s(44, SPR.icon)} />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 2: "Connect" — Data-flow with animated SVG connectors
// ═════════════════════════════════════════════════════════════════════════════

const SceneConnect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = (delay: number, config = SPR.card) =>
    spring({ frame: Math.max(0, frame - delay), fps, config });
  const conn = (delay: number) => s(delay, SPR.connect);
  const txt = (delay: number) => s(delay, SPR.text);

  const nodes = [
    { id: "input", x: 300, y: 680, w: 800, h: 360, title: "Data Source", icon: "⬡", color: C.cyan, delay: 8 },
    { id: "process", x: 1520, y: 480, w: 800, h: 360, title: "Transform", icon: "⚙", color: C.accent, delay: 16 },
    { id: "output1", x: 2740, y: 280, w: 800, h: 360, title: "Dashboard", icon: "📊", color: C.emerald, delay: 24 },
    { id: "output2", x: 2740, y: 780, w: 800, h: 360, title: "Alerts", icon: "🔔", color: C.amber, delay: 28 },
    { id: "ml", x: 1520, y: 1200, w: 800, h: 360, title: "ML Pipeline", icon: "🧠", color: C.violet, delay: 20 },
    { id: "output3", x: 2740, y: 1280, w: 800, h: 360, title: "Predictions", icon: "✦", color: C.rose, delay: 32 },
  ];

  const connections = [
    { from: 0, to: 1, delay: 30, color: C.cyan },
    { from: 0, to: 4, delay: 34, color: C.cyan },
    { from: 1, to: 2, delay: 38, color: C.accent },
    { from: 1, to: 3, delay: 42, color: C.accent },
    { from: 4, to: 5, delay: 46, color: C.violet },
  ];

  return (
    <SceneFade dur={120} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <GlowOrb x={CX} y={CY} size={900} color={C.accent} glowColor={C.accentGlow} progress={s(4, SPR.glow)} phase={1} />

        {/* Grid lines */}
        <div style={{ position: "absolute", inset: 0, opacity: txt(6) * 0.04 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`h${i}`} style={{ position: "absolute", left: 0, top: i * (H / 20), width: W, height: 1, background: C.textMid }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`v${i}`} style={{ position: "absolute", left: i * (W / 20), top: 0, width: 1, height: H, background: C.textMid }} />
          ))}
        </div>

        {/* Title */}
        {(() => {
          const tp = txt(4);
          const blur = (1 - tp) * 10;
          return (
            <div
              style={{
                position: "absolute",
                left: 200,
                top: 120,
                transform: `translateY(${(1 - tp) * 40}px)`,
                opacity: tp,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              }}
            >
              <div style={{ fontFamily: FONT, fontSize: 140, fontWeight: 700, color: C.text, letterSpacing: -4 }}>
                Connect
              </div>
              <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 400, color: C.textMid, letterSpacing: 2, textTransform: "uppercase" as const, marginTop: 8 }}>
                data-flow choreography
              </div>
            </div>
          );
        })()}

        {/* Connectors (drawn behind cards) */}
        {connections.map(({ from, to, delay, color }, i) => {
          const n1 = nodes[from];
          const n2 = nodes[to];
          return (
            <AnimatedConnector
              key={`conn${i}`}
              x1={n1.x + n1.w}
              y1={n1.y + n1.h / 2}
              x2={n2.x}
              y2={n2.y + n2.h / 2}
              color={color}
              progress={conn(delay)}
            />
          );
        })}

        {/* Node cards */}
        {nodes.map(({ x, y, w, h, title, icon, color, delay }, i) => (
          <GlowCard key={i} x={x} y={y} w={w} h={h} glowColor={`${color}40`} progress={s(delay)} radius={32} depth={i}>
            <div style={{ padding: "40px 48px", position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 32 }}>
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 28,
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                  boxShadow: `0 0 20px ${color}20`,
                }}
              >
                {icon}
              </div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 56, fontWeight: 600, color: C.text, letterSpacing: -2 }}>
                  {title}
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 30,
                    fontWeight: 400,
                    color: C.textMid,
                    marginTop: 8,
                  }}
                >
                  {i === 0 ? "PostgreSQL, APIs" : i === 1 ? "ETL + Enrichment" : i === 4 ? "AutoML v3.2" : "Real-time sync"}
                </div>
              </div>
              {/* Status indicator */}
              <div
                style={{
                  position: "absolute",
                  right: 48,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: C.emerald,
                    boxShadow: `0 0 10px ${C.emerald}`,
                  }}
                />
                <span style={{ fontFamily: FONT, fontSize: 28, color: C.emerald, fontWeight: 500 }}>
                  Active
                </span>
              </div>
            </div>
          </GlowCard>
        ))}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 3: "Illuminate" — Notification stack with glow pulse + ring indicators
// ═════════════════════════════════════════════════════════════════════════════

const SceneIlluminate: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = (delay: number, config = SPR.card) =>
    spring({ frame: Math.max(0, frame - delay), fps, config });
  const txt = (delay: number) => s(delay, SPR.text);

  const notifications = [
    { title: "Build Deployed", desc: "v2.4.1 pushed to production", icon: "🚀", color: C.emerald, delay: 10 },
    { title: "Alert Triggered", desc: "CPU usage exceeded 85% threshold", icon: "⚠", color: C.amber, delay: 18 },
    { title: "PR Merged", desc: "#847 Feature: dark mode toggle", icon: "✓", color: C.accent, delay: 26 },
    { title: "Incident Resolved", desc: "API latency back to normal", icon: "✦", color: C.cyan, delay: 34 },
  ];

  return (
    <SceneFade dur={120} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <GlowOrb x={500} y={CY} size={800} color={C.emerald} glowColor={C.emeraldGlow} progress={s(4, SPR.glow)} phase={0} />
        <GlowOrb x={3300} y={600} size={600} color={C.amber} glowColor={C.amberGlow} progress={s(8, SPR.glow)} phase={3} />

        {/* Title */}
        {(() => {
          const tp = txt(4);
          const blur = (1 - tp) * 10;
          return (
            <div
              style={{
                position: "absolute",
                left: 200,
                top: 160,
                transform: `translateY(${(1 - tp) * 40}px)`,
                opacity: tp,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              }}
            >
              <div style={{ fontFamily: FONT, fontSize: 140, fontWeight: 700, color: C.text, letterSpacing: -4 }}>
                Illuminate
              </div>
              <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 400, color: C.textMid, letterSpacing: 2, textTransform: "uppercase" as const, marginTop: 8 }}>
                notification stack + pulse indicators
              </div>
            </div>
          );
        })()}

        {/* Notification stack */}
        {notifications.map(({ title, desc, icon, color, delay }, i) => {
          const p = s(delay);
          const glowPulse = Math.sin(frame * 0.05 + i * 1.5) * 0.3 + 0.7;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 200,
                top: 500 + i * 320,
                width: 1600,
                height: 260,
                borderRadius: 40,
                background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
                border: `1px solid ${color}30`,
                boxShadow: [
                  `0 0 ${30 * glowPulse}px ${color}30`,
                  `0 16px 48px rgba(0,0,0,0.3)`,
                  `inset 0 1px 0 rgba(255,255,255,0.05)`,
                ].join(", "),
                transform: `translateX(${(1 - p) * -400}px) scale(${0.9 + p * 0.1})`,
                opacity: p,
                display: "flex",
                alignItems: "center",
                padding: "0 56px",
                gap: 36,
              }}
            >
              <div
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 28,
                  background: `${color}15`,
                  border: `1px solid ${color}30`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 48,
                  boxShadow: `0 0 16px ${color}25`,
                  flexShrink: 0,
                }}
              >
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT, fontSize: 52, fontWeight: 600, color: C.text, letterSpacing: -1 }}>
                  {title}
                </div>
                <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 400, color: C.textMid, marginTop: 6 }}>
                  {desc}
                </div>
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 28,
                  fontWeight: 500,
                  color: C.textDim,
                  whiteSpace: "nowrap" as const,
                }}
              >
                {i === 0 ? "Just now" : `${i * 3}m ago`}
              </div>
              {/* Expanding ring */}
              <div
                style={{
                  position: "absolute",
                  left: 248,
                  top: 80,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  border: `2px solid ${color}`,
                  opacity: Math.max(0, Math.sin(frame * 0.06 + i * 2) * 0.4),
                  transform: `scale(${1 + Math.sin(frame * 0.06 + i * 2) * 0.5})`,
                  pointerEvents: "none",
                }}
              />
            </div>
          );
        })}

        {/* Progress rings on the right */}
        <ProgressRing x={2600} y={680} radius={140} strokeWidth={14} color={C.accent} progress={s(20)} value="97%" label="Uptime" />
        <ProgressRing x={3200} y={680} radius={140} strokeWidth={14} color={C.emerald} progress={s(26)} value="142" label="Deploys" />
        <ProgressRing x={2900} y={1100} radius={160} strokeWidth={16} color={C.violet} progress={s(32)} value="4.9" label="Satisfaction" />

        {/* Live indicator */}
        {(() => {
          const p = s(38, SPR.icon);
          const blink = Math.sin(frame * 0.1) > 0;
          return (
            <div
              style={{
                position: "absolute",
                right: 300,
                top: 1450,
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: p,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: blink ? C.emerald : `${C.emerald}80`,
                  boxShadow: blink ? `0 0 16px ${C.emerald}` : "none",
                }}
              />
              <span style={{ fontFamily: FONT, fontSize: 36, fontWeight: 500, color: C.emerald }}>
                LIVE
              </span>
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 4: "Compose" — Multi-card assembly with depth + reordering
// ═════════════════════════════════════════════════════════════════════════════

const SceneCompose: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = (delay: number, config = SPR.card) =>
    spring({ frame: Math.max(0, frame - delay), fps, config });
  const txt = (delay: number) => s(delay, SPR.text);

  const layers = [
    {
      x: 400, y: 500, w: 1200, h: 700, color: C.accent, glowColor: C.accentGlow,
      title: "Authentication", items: ["OAuth 2.0", "SSO", "MFA"], delay: 10,
      depth: 0,
    },
    {
      x: 800, y: 600, w: 1200, h: 700, color: C.emerald, glowColor: C.emeraldGlow,
      title: "API Gateway", items: ["Rate Limiting", "Caching", "Load Balance"], delay: 18,
      depth: 1,
    },
    {
      x: 1200, y: 700, w: 1200, h: 700, color: C.violet, glowColor: C.violetGlow,
      title: "Data Layer", items: ["PostgreSQL", "Redis", "S3"], delay: 26,
      depth: 2,
    },
  ];

  const assembleProgress = s(50, SPR.connect);
  const assembled = assembleProgress > 0.5;

  return (
    <SceneFade dur={120} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <GlowOrb x={CX} y={CY} size={1000} color={C.violet} glowColor={C.violetGlow} progress={s(4, SPR.glow)} phase={2} />

        {/* Title */}
        {(() => {
          const tp = txt(4);
          const blur = (1 - tp) * 10;
          return (
            <div
              style={{
                position: "absolute",
                left: 200,
                top: 160,
                transform: `translateY(${(1 - tp) * 40}px)`,
                opacity: tp,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              }}
            >
              <div style={{ fontFamily: FONT, fontSize: 140, fontWeight: 700, color: C.text, letterSpacing: -4 }}>
                Compose
              </div>
              <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 400, color: C.textMid, letterSpacing: 2, textTransform: "uppercase" as const, marginTop: 8 }}>
                layered architecture assembly
              </div>
            </div>
          );
        })()}

        {/* Stacked cards that assemble */}
        {layers.map(({ x, y, w, h, color, glowColor, title, items, delay, depth }, i) => {
          const p = s(delay);
          const stackOffset = assembled
            ? interpolate(assembleProgress, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
            : 0;

          const finalX = 400 + i * 100;
          const finalY = 500 + i * 100;
          const spreadX = 200 + i * 600;
          const spreadY = 600;

          const currentX = interpolate(stackOffset, [0, 1], [x, finalX]);
          const currentY = interpolate(stackOffset, [0, 1], [y, finalY]);
          const offsetX = assembled ? currentX : spreadX;
          const offsetY = assembled ? currentY : spreadY;

          return (
            <GlowCard
              key={i}
              x={assembled ? offsetX : x}
              y={assembled ? offsetY : y}
              w={w}
              h={h}
              glowColor={glowColor}
              progress={p}
              radius={40}
              depth={depth}
            >
              <div style={{ padding: "48px 56px", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: `${color}20`,
                      border: `1px solid ${color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: color, boxShadow: `0 0 10px ${color}` }} />
                  </div>
                  <span style={{ fontFamily: FONT, fontSize: 56, fontWeight: 600, color: C.text, letterSpacing: -2 }}>
                    {title}
                  </span>
                </div>
                {items.map((item, j) => {
                  const itemP = s(delay + 8 + j * 4, SPR.icon);
                  return (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginBottom: 16,
                        opacity: itemP,
                        transform: `translateX(${(1 - itemP) * 30}px)`,
                      }}
                    >
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, opacity: 0.6 }} />
                      <span style={{ fontFamily: FONT, fontSize: 38, fontWeight: 400, color: C.textMid }}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlowCard>
          );
        })}

        {/* Assembly status */}
        {(() => {
          const p = s(55, SPR.text);
          return (
            <div
              style={{
                position: "absolute",
                right: 300,
                top: 600,
                opacity: p,
                transform: `translateY(${(1 - p) * 30}px)`,
              }}
            >
              <div
                style={{
                  width: 800,
                  padding: "48px 56px",
                  borderRadius: 40,
                  background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
                  border: `1px solid ${C.emerald}30`,
                  boxShadow: `0 0 30px ${C.emeraldGlow}, 0 16px 48px rgba(0,0,0,0.3)`,
                }}
              >
                <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 600, color: C.text, marginBottom: 24 }}>
                  Stack Status
                </div>
                {["Authentication", "API Gateway", "Data Layer"].map((name, j) => {
                  const ip = s(60 + j * 6, SPR.icon);
                  return (
                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: ip > 0.8 ? C.emerald : `${C.textDim}40`,
                          boxShadow: ip > 0.8 ? `0 0 10px ${C.emerald}` : "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {ip > 0.8 && (
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <span style={{ fontFamily: FONT, fontSize: 36, fontWeight: 500, color: ip > 0.8 ? C.text : C.textDim }}>
                        {name}
                      </span>
                      <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 500, color: C.emerald, marginLeft: "auto" }}>
                        {ip > 0.8 ? "Ready" : "..."}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 5: CTA — Brand close with ambient glow breathing
// ═════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const txt = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR.text });
  const cta = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR.cta });
  const glow = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR.glow });

  const breathe = Math.sin(frame * 0.03) * 0.008;

  return (
    <SceneFade dur={120} fadeIn={8} fadeOut={1}>
      <AbsoluteFill
        style={{
          backgroundColor: C.bg,
          transform: `scale(${1 + breathe})`,
        }}
      >
        {/* Multiple ambient glow orbs */}
        <GlowOrb x={CX - 400} y={CY - 200} size={700} color={C.accent} glowColor={C.accentGlow} progress={glow(4)} phase={0} />
        <GlowOrb x={CX + 400} y={CY + 200} size={600} color={C.violet} glowColor={C.violetGlow} progress={glow(8)} phase={2} />
        <GlowOrb x={CX} y={CY} size={500} color={C.cyan} glowColor={C.cyanGlow} progress={glow(6)} phase={4} />

        {/* Central radiant light */}
        <div
          style={{
            position: "absolute",
            left: CX - 500,
            top: CY - 500,
            width: 1000,
            height: 1000,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.accent}12, transparent 70%)`,
            opacity: txt(4),
            filter: "blur(40px)",
          }}
        />

        {/* Brand name */}
        {(() => {
          const p = txt(6);
          const blur = (1 - p) * 12;
          return (
            <div
              style={{
                position: "absolute",
                left: CX,
                top: CY - 180,
                transform: `translate(-50%, -50%) scale(${0.9 + p * 0.1})`,
                fontFamily: FONT,
                fontSize: 260,
                fontWeight: 700,
                color: C.text,
                letterSpacing: -8,
                opacity: p,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                textShadow: `0 0 80px ${C.accent}30`,
              }}
            >
              ComponentForge
            </div>
          );
        })()}

        {/* Tagline */}
        {(() => {
          const p = txt(14);
          return (
            <div
              style={{
                position: "absolute",
                left: CX,
                top: CY,
                transform: "translate(-50%, -50%)",
                fontFamily: FONT,
                fontSize: 64,
                fontWeight: 400,
                color: C.textMid,
                opacity: p * 0.8,
                letterSpacing: 4,
                textTransform: "uppercase" as const,
              }}
            >
              Build with brilliance.
            </div>
          );
        })()}

        {/* CTA button */}
        {(() => {
          const p = cta(22);
          const pulse = 1 + Math.sin(frame * 0.05) * 0.015 * p;
          return (
            <div
              style={{
                position: "absolute",
                left: CX,
                top: CY + 160,
                transform: `translate(-50%, -50%) scale(${(0.7 + p * 0.3) * pulse})`,
                opacity: p,
              }}
            >
              <div
                style={{
                  padding: "40px 100px",
                  borderRadius: 200,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.violet})`,
                  boxShadow: `0 0 40px ${C.accent}40, 0 12px 48px rgba(0,0,0,0.3)`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 72,
                    fontWeight: 600,
                    color: C.white,
                    letterSpacing: -2,
                  }}
                >
                  Start Building
                </span>
              </div>
            </div>
          );
        })()}

        {/* Subtle tech decoration */}
        {[
          { x: 300, y: 500, w: 400, h: 80, r: 40, delay: 10 },
          { x: 3200, y: 400, w: 350, h: 70, r: 35, delay: 14 },
          { x: 400, y: 1600, w: 380, h: 75, r: 38, delay: 18 },
          { x: 3100, y: 1700, w: 320, h: 65, r: 32, delay: 22 },
        ].map(({ x, y, w, h, r, delay }, i) => {
          const p = txt(delay);
          return (
            <div
              key={`deco${i}`}
              style={{
                position: "absolute",
                left: x,
                top: y + Math.sin(frame * 0.02 + i * 1.5) * 6,
                width: w,
                height: h,
                borderRadius: r,
                background: `${C.textMid}08`,
                border: `1px solid ${C.textMid}12`,
                opacity: p * 0.3,
              }}
            />
          );
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const SaasMediumComponentAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* S1: Orchestrate — glow-lit dashboard cards */}
      <Sequence from={0} durationInFrames={120}>
        <SceneOrchestrate />
      </Sequence>

      {/* S2: Connect — data-flow choreography */}
      <Sequence from={112} durationInFrames={120}>
        <SceneConnect />
      </Sequence>

      {/* S3: Illuminate — notification stack + glow pulse */}
      <Sequence from={225} durationInFrames={120}>
        <SceneIlluminate />
      </Sequence>

      {/* S4: Compose — layered architecture assembly */}
      <Sequence from={338} durationInFrames={120}>
        <SceneCompose />
      </Sequence>

      {/* S5: CTA — brand close */}
      <Sequence from={450} durationInFrames={150}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
