/**
 * GreenTaskAd — "What if your to-do list could save the planet?"
 *
 * Transformation-angle ad for GreenTask, an eco-conscious task management SaaS.
 * Snappy SaaS profile: critically damped springs, light warm background,
 * green accent (#22C55E) threading through every scene.
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 670 frames @ 30fps ≈ 22.3 seconds
 *
 * Scene breakdown:
 *  S1  Hook            (  0–135f  4.5s)  "Checkbox Sprout" — vine grows from checked task
 *  S2  The Gap         (128–257f  4.3s)  "You check tasks off. But do you see the impact?"
 *  S3  The Reveal      (235–370f  4.5s)  "GreenTask — Productivity that cares."
 *  S4  Impact Dashboard(360–490f  4.3s)  "Track your impact in real time." — 3 stat cards
 *  S5  Gamification    (480–595f  3.8s)  "Compete. Challenge. Lead." — leaderboard + badges
 *  S6  CTA             (588–670f  2.7s)  "Get things done, greenly."
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";

import {
  SceneFade,
  BlurWord,
  WordLine,
  ProgressRing,
  DashboardShell,
} from "../components/ad-primitives";

// ─── Color Palette (from storyboard) ──────────────────────────────────────────
const C = {
  bg: "#FAFDF7",
  surface: "#FFFFFF",
  accent: "#22C55E",
  accent2: "#3B82F6",
  text: "#065F46",
  textMuted: "#6B7280",
  success: "#10B981",
  warning: "#F59E0B",
  ctaBg: "#065F46",
  leaf: "#A7F3D0",
};

const W = 3840;
const CX = W / 2;
const CY = 2160 / 2;

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;

// ─── Spring presets (snappy-saas profile) ─────────────────────────────────────
const SPR = {
  text: { stiffness: 200, damping: 25, mass: 0.8 },
  hero: { stiffness: 180, damping: 24, mass: 0.85 },
  ui: { stiffness: 160, damping: 22, mass: 0.9 },
  bg: { stiffness: 60, damping: 28, mass: 1.2 },
  cta: { stiffness: 140, damping: 20, mass: 0.85 },
};

function useSpr(delay = 0, config = SPR.text) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.max(0, frame - delay), fps, config });
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const easeOut4 = (t: number) => 1 - Math.pow(1 - t, 4);
const easeInOut3 = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// ─── Novel Component: TaskChecklist ───────────────────────────────────────────
const TASKS = [
  "Review Q3 report",
  "Schedule team standup",
  "Update project brief",
  "Reply to client email",
  "Finalize budget draft",
];

const TaskChecklist: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        width: 920,
        background: C.surface,
        borderRadius: 32,
        padding: "48px 56px",
        boxShadow: "0 12px 48px rgba(0,0,0,0.08)",
        transform: `translateX(${(1 - progress) * 400}px)`,
        opacity: progress,
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 700,
          color: C.text,
          marginBottom: 32,
        }}
      >
        Today&apos;s Tasks
      </div>
      {TASKS.map((task, i) => {
        const itemDelay = 30 + i * 12;
        const checkP = spring({
          frame: Math.max(0, frame - itemDelay),
          fps,
          config: SPR.ui,
        });
        const enterT = easeOut4(clamp01((frame - (10 + i * 12)) / 18));
        const checked = checkP > 0.5;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "20px 0",
              borderBottom:
                i < TASKS.length - 1
                  ? `1px solid ${C.textMuted}20`
                  : "none",
              opacity: enterT,
              transform: `translateX(${(1 - enterT) * -40}px)`,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                border: `2px solid ${checked ? C.accent : C.textMuted}60`,
                background: checked ? C.accent : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "none",
              }}
            >
              {checked && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 12l5 5L19 7"
                    stroke={C.surface}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={30}
                    strokeDashoffset={30 * (1 - checkP)}
                  />
                </svg>
              )}
            </div>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 32,
                fontWeight: 500,
                color: checked ? C.textMuted : C.text,
                textDecoration: checked ? "line-through" : "none",
              }}
            >
              {task}
            </span>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 32,
          textAlign: "center",
          fontFamily: FONT,
          fontSize: 28,
          color: `${C.textMuted}80`,
          opacity: clamp01((frame - 85) / 12),
        }}
      >
        Tasks done. But what&apos;s the impact?
      </div>
    </div>
  );
};

// ─── Novel Component: EcoTaskBoard ────────────────────────────────────────────
const BOARD_COLS = [
  {
    title: "To Do",
    cards: [
      { name: "Design sprint", eco: false },
      { name: "Write docs", eco: false },
    ],
  },
  {
    title: "In Progress",
    cards: [
      { name: "API review", eco: true },
      { name: "Deploy v2.1", eco: false },
    ],
  },
  {
    title: "Done",
    cards: [
      { name: "Migrate DB", eco: true },
      { name: "Setup CI/CD", eco: true },
    ],
  },
];

const EcoTaskBoard: React.FC<{ baseDelay: number }> = ({ baseDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div style={{ display: "flex", gap: 24, height: "100%" }}>
      {BOARD_COLS.map((col, ci) => {
        const colP = spring({
          frame: Math.max(0, frame - (baseDelay + ci * 8)),
          fps,
          config: SPR.ui,
        });
        return (
          <div
            key={ci}
            style={{
              flex: 1,
              background: `${C.bg}`,
              borderRadius: 16,
              padding: "20px 16px",
              opacity: colP,
              transform: `translateY(${(1 - colP) * 30}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontSize: 28,
                fontWeight: 700,
                color: C.text,
                marginBottom: 20,
                letterSpacing: 1,
                textTransform: "uppercase",
              }}
            >
              {col.title}
            </div>
            {col.cards.map((card, cardi) => (
              <div
                key={cardi}
                style={{
                  background: C.surface,
                  borderRadius: 14,
                  padding: "20px 18px",
                  marginBottom: 14,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 26,
                    fontWeight: 500,
                    color: C.text,
                  }}
                >
                  {card.name}
                </span>
                {card.eco && (
                  <span
                    style={{
                      fontSize: 22,
                      background: `${C.accent}20`,
                      color: C.accent,
                      borderRadius: 10,
                      padding: "4px 10px",
                      fontWeight: 600,
                      fontFamily: FONT,
                    }}
                  >
                    🌱
                  </span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ─── Novel Component: LightStatCard ───────────────────────────────────────────
const LightStatCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  accentColor: string;
  progress: number;
  depth?: number;
  children: React.ReactNode;
}> = ({ x, y, w, h, accentColor, progress, depth = 0, children }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame * 0.04 + depth) * 0.3 + 0.7;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 32,
        background: C.surface,
        border: `2px solid ${accentColor}25`,
        boxShadow: [
          `0 0 ${24 * breathe}px ${accentColor}18`,
          `0 8px 32px rgba(0,0,0,0.06)`,
          `0 2px 8px rgba(0,0,0,0.04)`,
        ].join(", "),
        transform: `translateY(${(1 - progress) * 60}px) scale(${0.92 + progress * 0.08})`,
        opacity: progress,
        overflow: "hidden",
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${accentColor}00, ${accentColor}, ${accentColor}00)`,
          opacity: 0.5 * breathe,
        }}
      />
      {children}
    </div>
  );
};

// ─── Novel Component: ImpactCounter ───────────────────────────────────────────
const ImpactCounter: React.FC<{
  value: number;
  unit: string;
  label: string;
  delay: number;
  color: string;
}> = ({ value, unit, label, delay, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPR.hero,
  });
  const count = p * value;
  const displayVal =
    value >= 100
      ? Math.round(count).toLocaleString()
      : count.toFixed(1);

  return (
    <div
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 160,
          fontWeight: 800,
          color,
          letterSpacing: -6,
          lineHeight: 1,
        }}
      >
        {displayVal}
        <span style={{ fontSize: 72, fontWeight: 600, marginLeft: 12 }}>
          {unit}
        </span>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 40,
          fontWeight: 600,
          color: C.textMuted,
          marginTop: 20,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          width: 160,
          height: 6,
          background: `${color}20`,
          borderRadius: 3,
          margin: "20px auto 0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${p * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
};

// ─── Novel Component: TeamLeaderboard ─────────────────────────────────────────
const LEADERS = [
  { name: "Sarah K.", pts: 2340, pct: 92, isYou: false },
  { name: "James L.", pts: 2180, pct: 86, isYou: false },
  { name: "Priya M.", pts: 1960, pct: 78, isYou: false },
  { name: "You", pts: 1840, pct: 73, isYou: true },
];

const TeamLeaderboard: React.FC<{ baseDelay: number }> = ({ baseDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardP = spring({
    frame: Math.max(0, frame - baseDelay),
    fps,
    config: SPR.ui,
  });

  return (
    <div
      style={{
        width: 1200,
        background: C.surface,
        borderRadius: 32,
        padding: "52px 56px",
        boxShadow: "0 16px 64px rgba(0,0,0,0.08)",
        transform: `translateY(${(1 - cardP) * 200}px)`,
        opacity: cardP,
        willChange: "transform, opacity",
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 700,
          color: C.text,
          marginBottom: 36,
        }}
      >
        🏆 Eco Leaderboard
      </div>
      {LEADERS.map((l, i) => {
        const rowDelay = baseDelay + 10 + i * 10;
        const rowP = spring({
          frame: Math.max(0, frame - rowDelay),
          fps,
          config: SPR.ui,
        });
        const barDelay = baseDelay + 16 + i * 10;
        const barP = spring({
          frame: Math.max(0, frame - barDelay),
          fps,
          config: SPR.hero,
        });

        const youPulse = l.isYou
          ? Math.sin(frame * 0.06) * 0.4 + 0.6
          : 0;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "22px 24px",
              marginBottom: 12,
              borderRadius: 18,
              background: l.isYou ? `${C.accent}12` : "transparent",
              border: l.isYou
                ? `2px solid ${C.accent}${Math.round(40 + youPulse * 40)
                    .toString(16)
                    .padStart(2, "0")}`
                : "2px solid transparent",
              opacity: rowP,
              transform: `translateX(${(1 - rowP) * -30}px)`,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background:
                  i === 0
                    ? C.accent
                    : i === 1
                      ? C.accent2
                      : i === 2
                        ? C.warning
                        : C.success,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: FONT,
                fontSize: 22,
                fontWeight: 700,
                color: C.surface,
              }}
            >
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 28,
                    fontWeight: l.isYou ? 700 : 600,
                    color: C.text,
                  }}
                >
                  {l.name}
                </span>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 24,
                    fontWeight: 600,
                    color: C.textMuted,
                  }}
                >
                  {Math.round(barP * l.pts).toLocaleString()} pts
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  background: `${C.accent}15`,
                  borderRadius: 5,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${barP * l.pct}%`,
                    background: `linear-gradient(90deg, ${C.leaf}, ${C.accent})`,
                    borderRadius: 5,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Novel Component: EcoBadge ────────────────────────────────────────────────
const BADGES = [
  { icon: "🌱", label: "First Green Week", color: C.accent },
  { icon: "⚡", label: "Energy Saver", color: C.accent2 },
  { icon: "🏆", label: "Team Champion", color: C.warning },
];

const EcoBadges: React.FC<{ baseDelay: number }> = ({ baseDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      {BADGES.map((b, i) => {
        const p = spring({
          frame: Math.max(0, frame - (baseDelay + i * 8)),
          fps,
          config: { stiffness: 200, damping: 18, mass: 0.7 },
        });
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              background: C.surface,
              borderRadius: 60,
              padding: "24px 48px 24px 32px",
              boxShadow: `0 4px 20px ${b.color}25, 0 8px 32px rgba(0,0,0,0.06)`,
              border: `2px solid ${b.color}30`,
              opacity: p,
              transform: `scale(${0.85 + p * 0.15})`,
              filter: p < 0.95 ? `blur(${(1 - p) * 6}px)` : undefined,
              willChange: "transform, opacity, filter",
            }}
          >
            <span style={{ fontSize: 48 }}>{b.icon}</span>
            <span
              style={{
                fontFamily: FONT,
                fontSize: 36,
                fontWeight: 600,
                color: C.text,
              }}
            >
              {b.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Novel Component: CTAButton ───────────────────────────────────────────────
const CTAButton: React.FC<{ delay: number }> = ({ delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPR.cta,
  });
  const breathe = Math.sin(frame * 0.05) * 0.3 + 0.7;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 72px",
        borderRadius: 60,
        background: C.accent,
        fontFamily: FONT,
        fontSize: 48,
        fontWeight: 600,
        color: C.surface,
        letterSpacing: -1,
        boxShadow: `0 0 ${30 * breathe}px ${C.accent}50, 0 12px 40px rgba(0,0,0,0.15)`,
        transform: `scale(${0.9 + p * 0.1})`,
        opacity: p,
      }}
    >
      Start free →
    </div>
  );
};

// ─── Novel Component: CarbonWidget ────────────────────────────────────────────
const CarbonWidget: React.FC<{ baseDelay: number }> = ({ baseDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ringP = spring({
    frame: Math.max(0, frame - (baseDelay + 5)),
    fps,
    config: SPR.hero,
  });

  const counterP = spring({
    frame: Math.max(0, frame - (baseDelay + 7)),
    fps,
    config: SPR.hero,
  });

  const ringR = 100;
  const ringSW = 14;
  const ringSize = (ringR + ringSW) * 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        position: "relative",
        width: ringSize,
        minHeight: ringSize + 140,
      }}
    >
      <div style={{ position: "relative", width: ringSize, height: ringSize }}>
        <ProgressRing
          x={ringSize / 2}
          y={ringSize / 2}
          radius={ringR}
          strokeWidth={ringSW}
          color={C.accent}
          progress={ringP}
          value={`${Math.round(ringP * 73)}%`}
          label="Eco Score"
          fillRatio={0.73}
          textColor={C.text}
          labelColor={C.textMuted}
          fontFamily={FONT}
          valueFontSize={52}
          labelFontSize={22}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 56,
            fontWeight: 800,
            color: C.accent,
          }}
        >
          {(counterP * 1.2).toFixed(1)}t
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 28,
            fontWeight: 500,
            color: C.textMuted,
          }}
        >
          CO₂ Saved
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── SCENES ────────────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─── S1: Hook — "Checkbox Sprout" (Camera-Tracked) ────────────────────────────
// Camera starts ZOOMED IN on the checkbox. "What if your to-do list could..."
// appears below it. Checkbox checks → plant grows upward from the SVG asset
// (public/svg/green-task/checkbox-plant.svg) → camera pans up following growth
// → "save", "the", "planet?" appear at branch tips.

// Traced SVG native viewBox: 0 0 1376 768 (from vtracer on the AI reference image)
const TRACED_W = 1376;
const TRACED_H = 768;
const PLANT_W = 1600;
const PLANT_H = Math.round(PLANT_W * TRACED_H / TRACED_W);
const PS = PLANT_W / TRACED_W;

const PLANT_CB_CY = 1450;
const PLANT_TOP = PLANT_CB_CY - PLANT_H + 20;
const PLANT_LEFT = CX - PLANT_W / 2;
const CB_SCREEN = Math.round(90 * PS);

const MID = "#22C55E";

const S1Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const camP = clamp01((frame - 48) / 70);
  const camScale = 1.5 - camP * 0.5;
  const camTY = -370 + camP * 570;

  const checkboxP = spring({ frame, fps, config: { stiffness: 180, damping: 14, mass: 0.8 } });
  const fillP = spring({ frame: Math.max(0, frame - 50), fps, config: { stiffness: 120, damping: 22, mass: 1 } });
  const checkP = spring({ frame: Math.max(0, frame - 54), fps, config: SPR.ui });
  const checkBounce = frame >= 62 ? spring({ frame: frame - 62, fps, config: { stiffness: 300, damping: 12, mass: 0.5 } }) : 0;
  const bounceFade = frame >= 62 ? Math.max(0, 1 - (frame - 62) / 12) : 0;
  const bounceScale = 1 + checkBounce * 0.06 * bounceFade;

  const LAYERS = [
    { src: "/svg/green-task/layers/pot.svg",      delay: 55, cfg: { stiffness: 200, damping: 16, mass: 0.6 }, originY: "100%", scaleAxis: "scaleY" },
    { src: "/svg/green-task/layers/stem.svg",     delay: 58, cfg: { stiffness: 140, damping: 20, mass: 0.9 }, originY: "100%", scaleAxis: "scaleY" },
    { src: "/svg/green-task/layers/branches.svg", delay: 66, cfg: { stiffness: 100, damping: 16, mass: 0.7 }, originY: "60%",  scaleAxis: "scale"  },
    { src: "/svg/green-task/layers/leaves.svg",   delay: 74, cfg: { stiffness: 80,  damping: 14, mass: 0.6 }, originY: "50%",  scaleAxis: "scale"  },
    { src: "/svg/green-task/layers/buds.svg",     delay: 82, cfg: { stiffness: 260, damping: 12, mass: 0.4 }, originY: "50%",  scaleAxis: "scale"  },
  ] as const;

  const layerSprings = LAYERS.map((l) =>
    spring({ frame: Math.max(0, frame - l.delay), fps, config: l.cfg }),
  );

  const glowP = easeOut4(clamp01((frame - 55) / 45));
  const glowBreath = Math.sin(frame * 0.035) * 0.015 + 0.04;
  const crownGlowP = frame >= 92
    ? spring({ frame: frame - 92, fps, config: { stiffness: 60, damping: 18, mass: 1.2 } })
    : 0;

  const bR = Math.round(6 + (34 - 6) * fillP);
  const bG = Math.round(95 + (197 - 95) * fillP);
  const bB = Math.round(70 + (94 - 70) * fillP);
  const borderColor = `rgb(${bR},${bG},${bB})`;

  const swayIn = clamp01((frame - 105) / 10);
  const sway = swayIn * Math.sin(frame * 0.05) * 1.2;
  const breathe = 1 + swayIn * Math.sin(frame * 0.03) * 0.008;

  return (
    <SceneFade dur={135}>
      <AbsoluteFill style={{ background: C.bg }}>
        <div style={{
          position: "absolute", inset: 0,
          transform: `scale(${camScale}) translateY(${camTY}px)`,
          transformOrigin: `${CX}px ${CY}px`,
          willChange: "transform",
        }}>
          {/* Ambient glow */}
          <div style={{
            position: "absolute", left: CX - 700, top: PLANT_CB_CY - 600,
            width: 1400, height: 1200, borderRadius: "50%",
            background: `radial-gradient(circle, ${C.accent}, transparent 65%)`,
            opacity: glowBreath + glowP * 0.04, filter: "blur(120px)",
          }} />
          {crownGlowP > 0.01 && (
            <div style={{
              position: "absolute", left: CX - 500, top: PLANT_TOP - 40,
              width: 1000, height: 500, borderRadius: "50%",
              background: `radial-gradient(circle, ${C.accent}, transparent 60%)`,
              opacity: crownGlowP * 0.06, filter: "blur(80px)",
            }} />
          )}

          {/* Question text below checkbox */}
          <WordLine
            words={[
              { text: "What", weight: 400, color: C.text },
              { text: "if", weight: 400, color: C.text },
              { text: "your", weight: 400, color: C.text },
            ]}
            y={PLANT_CB_CY + CB_SCREEN / 2 + 60}
            size={120}
            stagger={8}
            baseDelay={8}
            defaultColor={C.text}
            fontFamily={FONT}
            springConfig={SPR.text}
          />
          <WordLine
            words={[
              { text: "to-do", weight: 700, color: C.text },
              { text: "list", weight: 700, color: C.text },
              { text: "could...", weight: 400, color: C.textMuted },
            ]}
            y={PLANT_CB_CY + CB_SCREEN / 2 + 200}
            size={120}
            stagger={8}
            baseDelay={22}
            defaultColor={C.text}
            fontFamily={FONT}
            springConfig={SPR.text}
          />

          {/* Plant container — semantic layer growth animation */}
          <div style={{
            position: "absolute",
            left: PLANT_LEFT, top: PLANT_TOP,
            width: PLANT_W, height: PLANT_H,
            overflow: "visible",
            transform: `rotate(${sway}deg) scale(${breathe})`,
            transformOrigin: `${PLANT_W / 2}px ${PLANT_H}px`,
            willChange: "transform",
          }}>
            {LAYERS.map((layer, i) => {
              const sp = layerSprings[i];
              if (sp < 0.01) return null;
              const scaleVal = 0.3 + sp * 0.7;
              const tf = layer.scaleAxis === "scaleY"
                ? `scaleY(${scaleVal})`
                : `scale(${scaleVal})`;
              return (
                <img
                  key={layer.src}
                  src={layer.src}
                  width={PLANT_W}
                  height={PLANT_H}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "block",
                    opacity: sp,
                    transform: tf,
                    transformOrigin: `50% ${layer.originY}`,
                    willChange: "transform, opacity",
                  }}
                />
              );
            })}

            {/* Branch text — positioned in plant container space */}
            <div style={{ position: "absolute", right: 20, top: Math.round(PLANT_H * 0.35), width: 500, textAlign: "left" }}>
              <BlurWord text="save" delay={84} size={130} fontWeight={700} color={MID} fontFamily={FONT} springConfig={SPR.text} />
            </div>
            <div style={{ position: "absolute", left: 20, top: Math.round(PLANT_H * 0.3), width: 300, textAlign: "right" }}>
              <BlurWord text="the" delay={90} size={100} fontWeight={500} color={C.textMuted} fontFamily={FONT} springConfig={SPR.text} />
            </div>
            <div style={{ position: "absolute", left: PLANT_W / 2 - 400, top: -120, width: 800, textAlign: "center" }}>
              <BlurWord text="planet?" delay={98} size={170} fontWeight={800} color={MID} fontFamily={FONT} springConfig={SPR.text} />
            </div>
          </div>

          {/* Checkbox — separate for rich entrance animation */}
          <div style={{
            position: "absolute",
            left: CX - CB_SCREEN / 2,
            top: PLANT_CB_CY - CB_SCREEN / 2,
            width: CB_SCREEN, height: CB_SCREEN,
            borderRadius: Math.round(18 * PS),
            background: C.surface,
            border: `5px solid ${borderColor}`,
            transform: `scale(${checkboxP * bounceScale})`,
            boxShadow: "0 10px 48px rgba(0,0,0,0.08)",
            willChange: "transform",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: Math.round(14 * PS),
              background: C.text,
              opacity: fillP,
            }} />
            <svg viewBox={`0 0 ${CB_SCREEN} ${CB_SCREEN}`} width={CB_SCREEN} height={CB_SCREEN} fill="none"
              style={{ position: "absolute", left: 0, top: 0 }}>
              <path
                d={`M ${CB_SCREEN * 0.26} ${CB_SCREEN * 0.52} L ${CB_SCREEN * 0.43} ${CB_SCREEN * 0.69} L ${CB_SCREEN * 0.76} ${CB_SCREEN * 0.32}`}
                stroke={fillP > 0.5 ? "#FFFFFF" : C.accent}
                strokeWidth={Math.round(CB_SCREEN * 0.06)}
                strokeLinecap="round" strokeLinejoin="round"
                strokeDasharray={300} strokeDashoffset={300 * (1 - checkP)}
              />
            </svg>
          </div>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S2: The Gap ──────────────────────────────────────────────────────────────
const S2Gap: React.FC = () => {
  const p1 = useSpr(6);
  const p2 = useSpr(18);
  const checklistP = useSpr(20, SPR.ui);

  return (
    <SceneFade dur={129} fadeOut={0}>
      <AbsoluteFill style={{ background: C.bg }}>
        {/* Left half — headline text, centered in the left half */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: W / 2,
            height: 2160,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 200,
            paddingRight: 80,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 108,
              fontWeight: 700,
              color: C.text,
              letterSpacing: -4,
              lineHeight: 1.1,
              opacity: p1,
              transform: `scale(${0.95 + p1 * 0.05})`,
              filter: p1 < 0.95 ? `blur(${(1 - p1) * 10}px)` : undefined,
              willChange: "transform, opacity, filter",
            }}
          >
            You check tasks off.
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 80,
              fontWeight: 500,
              color: C.textMuted,
              letterSpacing: -2,
              lineHeight: 1.2,
              marginTop: 24,
              opacity: p2,
              transform: `scale(${0.95 + p2 * 0.05})`,
              filter: p2 < 0.95 ? `blur(${(1 - p2) * 10}px)` : undefined,
              willChange: "transform, opacity, filter",
            }}
          >
            But do you see the impact?
          </div>
        </div>

        {/* Right half — task checklist, centered in the right half */}
        <div
          style={{
            position: "absolute",
            left: W / 2,
            top: 0,
            width: W / 2,
            height: 2160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TaskChecklist progress={checklistP} />
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S3: The Reveal ───────────────────────────────────────────────────────────
const S3Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const clipT = easeOut4(clamp01(frame / 22));
  const dashP = spring({
    frame: Math.max(0, frame - 35),
    fps,
    config: SPR.ui,
  });

  const textDeemph = clamp01((frame - 40) / 20);
  const textOpacity = 1 - textDeemph * 0.7;
  const textScale = 1 - textDeemph * 0.03;

  const camZoom = 1 + (frame / 135) * 0.02;

  return (
    <SceneFade dur={135}>
      <AbsoluteFill
        style={{
          background: C.bg,
          transform: `scale(${camZoom})`,
          transformOrigin: "center center",
          clipPath: `polygon(0 0, ${clipT * 100}% 0, ${clipT * 100}% 100%, 0 100%)`,
        }}
      >
        {/* Brand name + tagline (de-emphasise after dashboard enters) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: CY * 0.55,
            textAlign: "center",
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            zIndex: 2,
          }}
        >
          <BlurWord
            text="GreenTask"
            delay={0}
            size={180}
            fontWeight={800}
            color={C.text}
            fontFamily={FONT}
            springConfig={SPR.text}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: CY * 0.55 + 220,
            height: 100,
            textAlign: "center",
            opacity: textOpacity,
            transform: `scale(${textScale})`,
            zIndex: 2,
          }}
        >
          <WordLine
            words={[
              { text: "Productivity", weight: 500, color: C.textMuted },
              { text: "that", weight: 500, color: C.textMuted },
              { text: "cares.", weight: 600, color: C.accent },
            ]}
            y={50}
            size={64}
            stagger={8}
            baseDelay={12}
            defaultColor={C.textMuted}
            fontFamily={FONT}
            springConfig={SPR.text}
          />
        </div>

        {/* Dashboard shell */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            opacity: dashP,
            transform: `translateY(${(1 - dashP) * 400}px)`,
          }}
        >
          <DashboardShell
            progress={dashP}
            brandName="GreenTask"
            navItems={["Tasks", "Dashboard", "Challenges", "Teams"]}
            activeNavIndex={1}
            accentColor={C.accent}
            surfaceColor={C.surface}
            bgColor={C.bg}
            textColor={C.text}
            textDimColor={C.textMuted}
            fontFamily={FONT}
            inset={240}
            navHeight={80}
            springConfig={SPR.ui}
          >
            <div
              style={{
                display: "flex",
                gap: 32,
                height: "100%",
                padding: "24px 32px",
              }}
            >
              {/* Left: task board */}
              <div style={{ flex: 2 }}>
                <EcoTaskBoard baseDelay={55} />
              </div>
              {/* Right: carbon widget */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CarbonWidget baseDelay={65} />
              </div>
            </div>
          </DashboardShell>
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S4: Impact Dashboard ─────────────────────────────────────────────────────
const STATS = [
  {
    value: 2.4,
    unit: "tonnes",
    label: "CO₂ Saved",
    color: C.accent,
    glowColor: C.accent,
  },
  {
    value: 847,
    unit: "kWh",
    label: "Energy Reduced",
    color: C.accent2,
    glowColor: C.accent2,
  },
  {
    value: 156,
    unit: "kg",
    label: "Waste Diverted",
    color: C.success,
    glowColor: C.success,
  },
];

const S4Impact: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const h1P = useSpr(0);
  const h2P = useSpr(10);
  const camZoom = 1.02 + (frame / 130) * 0.015;

  const ringP = spring({
    frame: Math.max(0, frame - 36),
    fps,
    config: SPR.hero,
  });

  return (
    <SceneFade dur={130}>
      <AbsoluteFill
        style={{
          background: C.bg,
          transform: `scale(${camZoom})`,
          transformOrigin: "center center",
        }}
      >
        {/* Headline — editorial top-left */}
        <div style={{ position: "absolute", left: 200, top: 180 }}>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 108,
              fontWeight: 700,
              color: C.text,
              letterSpacing: -4,
              opacity: h1P,
              transform: `scale(${0.95 + h1P * 0.05})`,
              filter: h1P < 0.95 ? `blur(${(1 - h1P) * 10}px)` : undefined,
            }}
          >
            Track your impact
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 80,
              fontWeight: 500,
              color: C.textMuted,
              letterSpacing: -2,
              marginTop: 12,
              opacity: h2P,
              transform: `scale(${0.95 + h2P * 0.05})`,
              filter: h2P < 0.95 ? `blur(${(1 - h2P) * 10}px)` : undefined,
            }}
          >
            in real time.
          </div>
        </div>

        {/* Three impact stat cards — absolute positioned */}
        {STATS.map((stat, i) => {
          const cardW = 1040;
          const cardH = 520;
          const gap = 80;
          const totalW = 3 * cardW + 2 * gap;
          const startX = (W - totalW) / 2;
          const cardX = startX + i * (cardW + gap);
          const cardY = 560;

          const cardP = spring({
            frame: Math.max(0, frame - (14 + i * 8)),
            fps,
            config: SPR.ui,
          });
          return (
            <LightStatCard
              key={i}
              x={cardX}
              y={cardY}
              w={cardW}
              h={cardH}
              accentColor={stat.glowColor}
              progress={cardP}
              depth={i}
            >
              <ImpactCounter
                value={stat.value}
                unit={stat.unit}
                label={stat.label}
                delay={20 + i * 8}
                color={stat.color}
              />
            </LightStatCard>
          );
        })}

        {/* Eco-score ring — centered below cards */}
        <ProgressRing
          x={CX}
          y={1300}
          radius={160}
          strokeWidth={20}
          color={C.accent}
          progress={ringP}
          value={`${Math.round(ringP * 87)}%`}
          label="Team Eco Score"
          fillRatio={0.87}
          textColor={C.text}
          labelColor={C.textMuted}
          fontFamily={FONT}
          valueFontSize={72}
          labelFontSize={32}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S5: Gamification ─────────────────────────────────────────────────────────
const S5Gamify: React.FC = () => {
  const leaderW = 1200;
  const badgeColW = 520;
  const gap = 120;
  const totalW = leaderW + gap + badgeColW;
  const startX = (W - totalW) / 2;

  return (
    <SceneFade dur={115}>
      <AbsoluteFill style={{ background: C.bg }}>
        {/* Headline */}
        <WordLine
          words={[
            { text: "Compete.", weight: 700, color: C.accent },
            { text: "Challenge.", weight: 700, color: C.accent2 },
            { text: "Lead.", weight: 700, color: C.text },
          ]}
          y={220}
          size={128}
          stagger={12}
          baseDelay={0}
          defaultColor={C.text}
          fontFamily={FONT}
          springConfig={SPR.text}
        />

        {/* Leaderboard — centered left half */}
        <div style={{ position: "absolute", left: startX, top: 520 }}>
          <TeamLeaderboard baseDelay={16} />
        </div>

        {/* Badges — right of leaderboard, vertically centered */}
        <div
          style={{
            position: "absolute",
            left: startX + leaderW + gap,
            top: 640,
          }}
        >
          <EcoBadges baseDelay={50} />
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S6: CTA ──────────────────────────────────────────────────────────────────
const S6CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const bgShift = easeInOut3(clamp01(frame / 12));

  const glowBreath = Math.sin(frame * 0.04) * 0.03 + 0.08;

  const lerpColor = (
    c1: [number, number, number],
    c2: [number, number, number],
    t: number,
  ): string => {
    const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
    const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
    const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
    return `rgb(${r},${g},${b})`;
  };

  const bgColor = lerpColor([250, 253, 247], [6, 95, 70], bgShift);

  return (
    <SceneFade dur={82}>
      <AbsoluteFill style={{ background: bgColor }}>
        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            left: CX - 600,
            top: CY - 500,
            width: 1200,
            height: 1000,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${C.accent}, transparent 70%)`,
            opacity: glowBreath,
            filter: "blur(100px)",
          }}
        />

        {/* Brand name — delayed until bg is mostly dark (frame 14) */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: CY - 260,
            textAlign: "center",
          }}
        >
          <BlurWord
            text="GreenTask"
            delay={14}
            size={160}
            fontWeight={800}
            color={C.surface}
            fontFamily={FONT}
            springConfig={SPR.text}
          />
        </div>

        {/* Tagline */}
        <WordLine
          words={[
            { text: "Get", weight: 500, color: C.leaf },
            { text: "things", weight: 500, color: C.leaf },
            { text: "done,", weight: 500, color: C.leaf },
            { text: "greenly.", weight: 700, color: C.surface },
          ]}
          y={CY - 40}
          size={72}
          stagger={8}
          baseDelay={24}
          defaultColor={C.leaf}
          fontFamily={FONT}
          springConfig={SPR.text}
        />

        {/* CTA Button */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: CY + 140,
            textAlign: "center",
          }}
        >
          <CTAButton delay={42} />
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── MAIN COMPOSITION ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

export const GreenTaskAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT }}>
      {/* S1 — Hook: Checkbox Sprout */}
      <Sequence from={0} durationInFrames={135}>
        <S1Hook />
      </Sequence>

      {/* S2 — The Gap (extends 22f into S3 range so clip-path wipe covers it) */}
      <Sequence from={128} durationInFrames={129}>
        <S2Gap />
      </Sequence>

      {/* S3 — The Reveal (diagonal clip-path wipe over S2 during first 22f) */}
      <Sequence from={235} durationInFrames={135}>
        <S3Reveal />
      </Sequence>

      {/* S4 — Impact Dashboard */}
      <Sequence from={360} durationInFrames={130}>
        <S4Impact />
      </Sequence>

      {/* S5 — Gamification */}
      <Sequence from={480} durationInFrames={115}>
        <S5Gamify />
      </Sequence>

      {/* S6 — CTA */}
      <Sequence from={588} durationInFrames={82}>
        <S6CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
