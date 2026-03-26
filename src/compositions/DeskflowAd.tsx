/**
 * DeskflowAd — "The Invisible Bleed" SaaS Paid Ad
 *
 * Client: Deskflow — modern helpdesk platform for growing teams.
 * Angle: The Invisible Bleed — customers leave and you don't even know why.
 * Tagline: "Stop the silent churn."
 *
 * Primitives imported from ad-primitives:
 *   SceneFade, BlurWord, WordLine, GlowCard, GlowOrb,
 *   AnimatedConnector, ProgressRing, DashboardShell
 *
 * Novel components (story-specific):
 *   EmailGhost     — S1: email card aging with timestamp colour shift
 *   ChurnCard      — S2: customer card that slides out with ghost trail
 *   RevenueCounter — S2: counter that ticks DOWN as customers leave
 *   PerceptionGauge— S3: split gauge showing perception vs reality
 *   TicketRow      — S4: helpdesk ticket with SLA timer and status pill
 *   TrendArrow     — S5: animated trend indicator showing improvement
 *
 * Scenes:
 *   S1 "The Accusation"    — Hook with aging email mockup
 *   S2 "The Silent Exit"   — Customers ghosting + revenue bleeding
 *   S3 "The Visibility Gap" — Perception vs reality confrontation
 *   S4 "The Control Shift" — Deskflow inbox in action
 *   S5 "The Proof"         — Metrics dashboard with hard numbers
 *   S6 "Tagline"           — "Stop the silent churn."
 *   S7 "CTA"               — Brand close
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 600 frames @ 30fps = 20 seconds
 * Category: saas
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

import {
  SceneFade,
  BlurWord,
  WordLine,
  GlowCard,
  GlowOrb,
  AnimatedConnector,
  ProgressRing,
  DashboardShell,
} from "../components/ad-primitives";

// ─── Design Tokens (from storyboard palette) ────────────────────────────────

const C = {
  bg:        "#0B1120",
  surface:   "#162032",
  surfaceHi: "#1E2D45",
  accent:    "#0EA5E9",
  accentGlow:"#0EA5E930",
  warning:   "#F59E0B",
  warningGlow:"#F59E0B30",
  danger:    "#EF4444",
  dangerGlow:"#EF444430",
  text:      "#F1F5F9",
  textMid:   "#94A3B8",
  textDim:   "#64748B",
  white:     "#FFFFFF",
  black:     "#000000",
  success:   "#10B981",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

// ─── Spring Presets (snappy-saas profile) ────────────────────────────────────

const SPR = {
  text: { stiffness: 180, damping: 25, mass: 0.8 },
  card: { stiffness: 150, damping: 22, mass: 0.9 },
  ui:   { stiffness: 170, damping: 24, mass: 0.85 },
  glow: { stiffness: 80,  damping: 26, mass: 1.1 },
  snap: { stiffness: 220, damping: 22, mass: 0.7 },
};

function useSpr(delay = 0, config = SPR.text) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.max(0, frame - delay), fps, config });
}

// ─── Easing helper for clip-path transition ──────────────────────────────────

function easeInOut3(t: number) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

// ═════════════════════════════════════════════════════════════════════════════
// NOVEL COMPONENTS — story-specific, not in the primitives library
// ═════════════════════════════════════════════════════════════════════════════

// ─── EmailGhost — aging email card (S1) ──────────────────────────────────────

const EmailGhost: React.FC<{
  progress: number;
  ageProgress: number;
}> = ({ progress, ageProgress }) => {
  const frame = useCurrentFrame();
  const glowPulse = Math.sin(frame * 0.04) * 0.3 + 0.7;

  const timestampColor = interpolate(
    ageProgress,
    [0, 0.4, 0.7, 1],
    [0, 0, 1, 1],
  );
  const tsR = Math.round(interpolate(timestampColor, [0, 1], [148, 245]));
  const tsG = Math.round(interpolate(timestampColor, [0, 1], [163, 158]));
  const tsB = Math.round(interpolate(timestampColor, [0, 1], [184, 11]));
  const tsColor = `rgb(${tsR}, ${tsG}, ${tsB})`;

  const dangerPhase = ageProgress > 0.7;
  const pulseBorder = dangerPhase
    ? `2px solid rgba(239, 68, 68, ${0.3 + Math.sin(frame * 0.08) * 0.2})`
    : `1px solid ${C.warning}30`;

  const ghostOpacity = interpolate(ageProgress, [0.5, 1], [1, 0.3], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: CX - 700,
        top: CY - 180,
        width: 1400,
        height: 280,
        borderRadius: 32,
        background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
        border: pulseBorder,
        boxShadow: [
          `0 0 ${30 * glowPulse}px ${dangerPhase ? C.dangerGlow : C.warningGlow}`,
          `0 16px 48px rgba(0,0,0,0.4)`,
          `inset 0 1px 0 rgba(255,255,255,0.05)`,
        ].join(", "),
        transform: `translateY(${(1 - progress) * 60}px) scale(${0.85 + progress * 0.15})`,
        opacity: progress * ghostOpacity,
        display: "flex",
        alignItems: "center",
        padding: "0 56px",
        gap: 32,
        overflow: "hidden",
      }}
    >
      {/* Sender avatar */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 20,
          background: `${C.warning}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 700,
          color: C.warning,
          flexShrink: 0,
        }}
      >
        SM
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 600, color: C.text }}>
          Quick question about billing
        </div>
        <div style={{ fontFamily: FONT, fontSize: 28, color: C.textMid, marginTop: 6 }}>
          Sarah M. · Pro Plan
        </div>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 600,
          color: tsColor,
          whiteSpace: "nowrap" as const,
        }}
      >
        3 days ago
      </div>
      {/* Inner radial glow */}
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: "20%",
          width: "60%",
          height: "50%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${dangerPhase ? C.dangerGlow : C.warningGlow}, transparent 70%)`,
          opacity: 0.12 * glowPulse,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

// ─── ChurnCard — customer card with ghost trail exit (S2) ────────────────────

const ChurnCard: React.FC<{
  name: string;
  plan: string;
  mrr: string;
  enterDelay: number;
  exitFrame: number;
  index: number;
}> = ({ name, plan, mrr, enterDelay, exitFrame, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterP = spring({ frame: Math.max(0, frame - enterDelay), fps, config: SPR.card });

  const exitProgress = clamp((frame - exitFrame) / 18, 0, 1);
  const exitEased = easeInOut3(exitProgress);

  const isExiting = frame >= exitFrame;
  const slideX = isExiting ? exitEased * 800 : 0;
  const fadeOut = isExiting ? 1 - exitEased : 1;

  return (
    <>
      {/* Ghost trail — visible during exit */}
      {isExiting && exitProgress < 1 && (
        <div
          style={{
            position: "absolute",
            left: 240,
            top: 450 + index * 260,
            width: 1100,
            height: 200,
            borderRadius: 24,
            background: `linear-gradient(90deg, ${C.danger}08, transparent)`,
            border: `1px dashed ${C.danger}15`,
            opacity: (1 - exitProgress) * 0.5,
          }}
        />
      )}
      {/* Main card */}
      <div
        style={{
          position: "absolute",
          left: 240 + slideX,
          top: 450 + index * 260,
          width: 1100,
          height: 200,
          borderRadius: 24,
          background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
          border: `1px solid ${C.danger}20`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
          display: "flex",
          alignItems: "center",
          padding: "0 40px",
          gap: 28,
          opacity: enterP * fadeOut,
          transform: `translateX(${(1 - enterP) * -200}px)`,
        }}
      >
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 16,
            background: `${C.danger}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontSize: 24,
            fontWeight: 700,
            color: C.danger,
          }}
        >
          {name.charAt(0)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 600, color: C.text }}>
            {name}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 24, color: C.textMid }}>{plan}</div>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 700, color: C.danger }}>
          {mrr}
        </div>
      </div>
    </>
  );
};

// ─── RevenueCounter — counter that ticks DOWN (S2) ───────────────────────────

const RevenueCounter: React.FC<{
  start: number;
  losses: number[];
  lossFrames: number[];
}> = ({ start, losses, lossFrames }) => {
  const frame = useCurrentFrame();
  const enterP = useSpr(4, SPR.text);

  let total = start;
  for (let i = 0; i < losses.length; i++) {
    if (frame >= lossFrames[i]) {
      const t = clamp((frame - lossFrames[i]) / 12, 0, 1);
      total -= Math.round(losses[i] * t);
    }
  }

  const formatted = `$${total.toLocaleString()}`;

  return (
    <div
      style={{
        position: "absolute",
        right: 300,
        top: 350,
        textAlign: "right",
        opacity: enterP,
        transform: `translateY(${(1 - enterP) * 30}px)`,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 500, color: C.textMid, letterSpacing: 2, textTransform: "uppercase" as const }}>
        Monthly Revenue
      </div>
      <div style={{ fontFamily: FONT, fontSize: 120, fontWeight: 800, color: C.danger, letterSpacing: -4, marginTop: 8 }}>
        {formatted}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 28, color: C.danger, opacity: 0.7, marginTop: 4 }}>
        ↓ bleeding
      </div>
    </div>
  );
};

// ─── PerceptionGauge — split perception vs reality (S3) ──────────────────────

const PerceptionGauge: React.FC<{
  label: string;
  value: string;
  color: string;
  isReality?: boolean;
  progress: number;
  x: number;
}> = ({ label, value, color, isReality = false, progress, x }) => {
  const frame = useCurrentFrame();

  const barFill = isReality ? 0.82 : 0.18;
  const fillWidth = interpolate(progress, [0, 1], [0, barFill * 100]);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: CY - 300,
        width: 1500,
        opacity: progress,
        transform: isReality
          ? `translateX(${(1 - progress) * 200}px)`
          : `translateX(${(1 - progress) * -200}px)`,
      }}
    >
      <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 500, color: C.textMid, letterSpacing: 2, textTransform: "uppercase" as const }}>
        {label}
      </div>
      <div
        style={{
          marginTop: 24,
          width: "100%",
          height: 60,
          borderRadius: 16,
          background: `${color}12`,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${fillWidth}%`,
            borderRadius: 16,
            background: `linear-gradient(90deg, ${color}, ${color}90)`,
            boxShadow: isReality ? `0 0 20px ${color}40` : undefined,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 100,
          fontWeight: 800,
          color,
          marginTop: 24,
          letterSpacing: -4,
        }}
      >
        {value}
      </div>
      <div style={{ fontFamily: FONT, fontSize: 32, color: C.textMid, marginTop: 8 }}>
        {isReality ? "average first reply" : "what the team assumes"}
      </div>
    </div>
  );
};

// ─── TicketRow — helpdesk ticket with SLA and status (S4) ────────────────────

const TicketRow: React.FC<{
  subject: string;
  customer: string;
  owner: string;
  ownerInitials: string;
  sla: string;
  status: string;
  statusColor: string;
  delay: number;
  y: number;
}> = ({ subject, customer, owner, ownerInitials, sla, status, statusColor, delay, y }) => {
  const p = useSpr(delay, SPR.ui);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        top: y,
        height: 100,
        borderRadius: 16,
        background: `${C.surfaceHi}`,
        border: `1px solid ${C.textDim}10`,
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        gap: 24,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {/* Owner avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: `${C.accent}20`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 700,
          color: C.accent,
          flexShrink: 0,
        }}
      >
        {ownerInitials}
      </div>
      {/* Subject + customer */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
          {subject}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 18, color: C.textMid }}>
          {customer} · assigned to {owner}
        </div>
      </div>
      {/* SLA badge */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 18,
          fontWeight: 600,
          color: C.accent,
          background: `${C.accent}12`,
          padding: "6px 16px",
          borderRadius: 10,
          whiteSpace: "nowrap" as const,
        }}
      >
        {sla}
      </div>
      {/* Status pill */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 17,
          fontWeight: 600,
          color: statusColor,
          background: `${statusColor}15`,
          padding: "6px 16px",
          borderRadius: 10,
          whiteSpace: "nowrap" as const,
        }}
      >
        {status}
      </div>
    </div>
  );
};

// ─── TrendArrow — animated improvement indicator (S5) ────────────────────────

const TrendArrow: React.FC<{
  from: string;
  to: string;
  progress: number;
  x: number;
  y: number;
}> = ({ from, to, progress, x, y }) => {
  const drawOn = clamp(progress * 1.5, 0, 1);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: progress,
      }}
    >
      <span style={{ fontFamily: FONT, fontSize: 28, color: C.textDim, textDecoration: "line-through" }}>
        {from}
      </span>
      <svg width={60} height={24} style={{ overflow: "visible" }}>
        <line
          x1={0} y1={12} x2={50} y2={12}
          stroke={C.success}
          strokeWidth={3}
          strokeDasharray={50}
          strokeDashoffset={50 * (1 - drawOn)}
          strokeLinecap="round"
        />
        <polygon
          points="45,4 58,12 45,20"
          fill={C.success}
          opacity={drawOn}
        />
      </svg>
      <span style={{ fontFamily: FONT, fontSize: 28, fontWeight: 700, color: C.success }}>
        {to}
      </span>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── S1: The Accusation ──────────────────────────────────────────────────────

const SceneAccusation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  const emailP = s(12, SPR.card);
  const ageP = clamp((frame - 20) / 60, 0, 1);

  return (
    <SceneFade dur={95} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <GlowOrb x={W - 600} y={400} size={700} color={C.warning} glowColor={C.warningGlow} progress={s(20, SPR.glow)} phase={0} />

        {/* Line 1 */}
        <WordLine
          words={[
            { text: "A", weight: 400 },
            { text: "customer", weight: 400 },
            { text: "emailed", weight: 600, color: C.warning },
            { text: "you", weight: 400 },
            { text: "3 days ago.", weight: 600, color: C.warning },
          ]}
          y={CY - 400}
          size={120}
          stagger={4}
          baseDelay={0}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* Email card */}
        <EmailGhost progress={emailP} ageProgress={ageP} />

        {/* Line 2 — heavier, warning colour */}
        <WordLine
          words={[
            { text: "You", weight: 400 },
            { text: "never", weight: 800, color: C.danger },
            { text: "replied.", weight: 800, color: C.danger },
          ]}
          y={CY + 280}
          size={130}
          stagger={5}
          baseDelay={45}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S2: The Silent Exit ─────────────────────────────────────────────────────

const SceneSilentExit: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  return (
    <SceneFade dur={100} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <GlowOrb x={300} y={CY} size={600} color={C.danger} glowColor={C.dangerGlow} progress={s(10, SPR.glow)} phase={1.5} />

        {/* Line 1 */}
        <WordLine
          words={[
            { text: "They", weight: 400 },
            { text: "didn't", weight: 600 },
            { text: "complain.", weight: 600 },
          ]}
          y={260}
          size={110}
          stagger={5}
          baseDelay={0}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* Churn cards */}
        <ChurnCard name="Marcus T." plan="Pro · Monthly" mrr="$149/mo" enterDelay={6} exitFrame={30} index={0} />
        <ChurnCard name="Elena K." plan="Team · Annual" mrr="$249/mo" enterDelay={14} exitFrame={45} index={1} />
        <ChurnCard name="David R." plan="Business" mrr="$399/mo" enterDelay={22} exitFrame={60} index={2} />

        {/* Revenue counter */}
        <RevenueCounter
          start={12400}
          losses={[149, 249, 399]}
          lossFrames={[30, 45, 60]}
        />

        {/* Line 2 */}
        <WordLine
          words={[
            { text: "They", weight: 400 },
            { text: "just", weight: 600 },
            { text: "left.", weight: 800, color: C.danger },
          ]}
          y={H - 350}
          size={130}
          stagger={5}
          baseDelay={20}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S3: The Visibility Gap ──────────────────────────────────────────────────

const SceneVisibilityGap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  const leftP = s(4, SPR.ui);
  const rightP = s(25, SPR.snap);
  const dividerDraw = clamp((frame - 15) / 20, 0, 1);

  const leftDim = interpolate(frame, [60, 80], [1, 0.35], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneFade dur={95} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Line 1 */}
        <WordLine
          words={[
            { text: "You", weight: 400 },
            { text: "think", weight: 400 },
            { text: "response times", weight: 600 },
            { text: "are fine.", weight: 400 },
          ]}
          y={250}
          size={100}
          stagger={4}
          baseDelay={8}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* Left gauge — perception (comfortable) */}
        <div style={{ opacity: leftDim }}>
          <PerceptionGauge
            label="Team Perception"
            value="~2 hours"
            color={C.success}
            progress={leftP}
            x={200}
          />
        </div>

        {/* Vertical divider */}
        <svg style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none" }}>
          <line
            x1={CX} y1={CY - 350}
            x2={CX} y2={CY + 350}
            stroke={C.textDim}
            strokeWidth={2}
            strokeDasharray={700}
            strokeDashoffset={700 * (1 - dividerDraw)}
            opacity={0.4}
          />
        </svg>

        {/* Right gauge — reality (harsh) */}
        <PerceptionGauge
          label="Actual Data"
          value="14h 22m"
          color={C.warning}
          isReality
          progress={rightP}
          x={CX + 200}
        />

        {/* Line 2 */}
        <WordLine
          words={[
            { text: "They're", weight: 400 },
            { text: "14 hours.", weight: 800, color: C.warning },
          ]}
          y={H - 350}
          size={140}
          stagger={6}
          baseDelay={30}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S4: The Control Shift ───────────────────────────────────────────────────

const SceneControlShift: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  const cameraScale = interpolate(frame, [25, 100], [1, 1.015], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const tickets = [
    { subject: "Can't access premium features", customer: "Sarah M.", owner: "Alex", ownerInitials: "AK", sla: "Reply in 2h 14m", status: "Open", statusColor: C.accent, delay: 12 },
    { subject: "Billing discrepancy on invoice #4821", customer: "Marcus T.", owner: "Jamie", ownerInitials: "JL", sla: "Reply in 1h 05m", status: "In Progress", statusColor: C.warning, delay: 18 },
    { subject: "Integration setup help needed", customer: "Elena K.", owner: "Sam", ownerInitials: "SR", sla: "Reply in 3h 42m", status: "Waiting", statusColor: C.textMid, delay: 24 },
    { subject: "Account upgrade confirmation", customer: "David R.", owner: "Alex", ownerInitials: "AK", sla: "Resolved", status: "Resolved", statusColor: C.success, delay: 30 },
  ];

  return (
    <SceneFade dur={110} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg, transform: `scale(${cameraScale})` }}>
        <GlowOrb x={CX} y={CY} size={900} color={C.accent} glowColor={C.accentGlow} progress={s(4, SPR.glow)} phase={0} />

        {/* Text line 1 */}
        <WordLine
          words={[
            { text: "Every", weight: 400 },
            { text: "ticket.", weight: 700, color: C.accent },
            { text: "Owned.", weight: 700, color: C.accent },
          ]}
          y={160}
          size={110}
          stagger={5}
          baseDelay={6}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* Dashboard shell */}
        <DashboardShell
          progress={s(4, SPR.ui)}
          brandName="Deskflow"
          navItems={["Inbox", "Tickets", "Analytics", "Settings"]}
          activeNavIndex={1}
          accentColor={C.accent}
          surfaceColor={C.surface}
          bgColor={C.bg}
          textColor={C.text}
          textDimColor={C.textDim}
          fontFamily={FONT}
          inset={200}
          navHeight={64}
          springConfig={SPR.ui}
        >
          {/* Page header inside dashboard */}
          {(() => {
            const hp = s(8, SPR.text);
            return (
              <div style={{ padding: "24px 32px 0", opacity: hp }}>
                <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 700, color: C.text }}>
                  Active Tickets
                </div>
                <div style={{ fontFamily: FONT, fontSize: 18, color: C.textMid, marginTop: 4 }}>
                  4 tickets · 2 awaiting reply
                </div>
              </div>
            );
          })()}

          {/* Ticket rows */}
          {tickets.map((t, i) => (
            <TicketRow key={i} {...t} y={120 + i * 120} />
          ))}
        </DashboardShell>

        {/* SVG connector from resolved ticket to CSAT indicator */}
        <AnimatedConnector
          x1={W - 460}
          y1={720}
          x2={W - 300}
          y2={820}
          color={C.success}
          progress={s(40, SPR.card)}
          curved
          width={W}
          height={H}
        />

        {/* CSAT sent indicator */}
        {(() => {
          const cp = s(45, SPR.snap);
          return (
            <div
              style={{
                position: "absolute",
                right: 240,
                top: 800,
                background: `${C.success}15`,
                border: `1px solid ${C.success}30`,
                borderRadius: 12,
                padding: "8px 20px",
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 600,
                color: C.success,
                opacity: cp,
                transform: `scale(${0.8 + cp * 0.2})`,
              }}
            >
              ✓ CSAT survey sent
            </div>
          );
        })()}

        {/* Text line 2 */}
        <WordLine
          words={[
            { text: "Every", weight: 400 },
            { text: "SLA.", weight: 700, color: C.accent },
            { text: "Tracked.", weight: 700, color: C.accent },
          ]}
          y={H - 200}
          size={110}
          stagger={5}
          baseDelay={30}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S5: The Proof ───────────────────────────────────────────────────────────

const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  return (
    <SceneFade dur={100} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <GlowOrb x={600} y={CY - 200} size={700} color={C.accent} glowColor={C.accentGlow} progress={s(4, SPR.glow)} phase={0} />
        <GlowOrb x={W - 500} y={CY + 100} size={500} color={C.accent} glowColor={C.accentGlow} progress={s(8, SPR.glow)} phase={2} />

        {/* Headline */}
        <WordLine
          words={[
            { text: "See", weight: 400 },
            { text: "everything.", weight: 700, color: C.accent },
            { text: "Fix", weight: 400 },
            { text: "anything.", weight: 700, color: C.accent },
          ]}
          y={300}
          size={120}
          stagger={5}
          baseDelay={0}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />

        {/* Card 1: CSAT */}
        <GlowCard
          x={240}
          y={600}
          w={1040}
          h={620}
          glowColor={C.accent}
          progress={s(10, SPR.card)}
          bgGradient={[C.surfaceHi, C.surface]}
          depth={0}
        >
          <div style={{ padding: 48, height: "100%" }}>
            <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 500, color: C.textMid, letterSpacing: 2, textTransform: "uppercase" as const }}>
              CSAT Score
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <ProgressRing
                x={520}
                y={380}
                radius={140}
                strokeWidth={16}
                color={C.accent}
                progress={s(18, SPR.card)}
                value="94%"
                label="Satisfaction"
                textColor={C.text}
                labelColor={C.textMid}
                fontFamily={FONT}
              />
            </div>
          </div>
        </GlowCard>

        {/* Card 2: Avg First Reply */}
        <GlowCard
          x={1400}
          y={600}
          w={1040}
          h={620}
          glowColor={C.success}
          progress={s(18, SPR.card)}
          bgGradient={[C.surfaceHi, C.surface]}
          depth={1}
        >
          <div style={{ padding: 48 }}>
            <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 500, color: C.textMid, letterSpacing: 2, textTransform: "uppercase" as const }}>
              Avg First Reply
            </div>
            <div style={{ fontFamily: FONT, fontSize: 140, fontWeight: 800, color: C.success, marginTop: 40, letterSpacing: -6 }}>
              8 min
            </div>
            <TrendArrow from="14h" to="8 min" progress={s(28, SPR.ui)} x={48} y={380} />
          </div>
        </GlowCard>

        {/* Card 3: Resolution Rate */}
        <GlowCard
          x={2560}
          y={600}
          w={1040}
          h={620}
          glowColor={C.accent}
          progress={s(26, SPR.card)}
          bgGradient={[C.surfaceHi, C.surface]}
          depth={2}
        >
          <div style={{ padding: 48, height: "100%" }}>
            <div style={{ fontFamily: FONT, fontSize: 32, fontWeight: 500, color: C.textMid, letterSpacing: 2, textTransform: "uppercase" as const }}>
              Resolution Rate
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
              <ProgressRing
                x={520}
                y={380}
                radius={140}
                strokeWidth={16}
                color={C.accent}
                progress={s(30, SPR.card)}
                value="97%"
                label="Resolved"
                textColor={C.text}
                labelColor={C.textMid}
                fontFamily={FONT}
              />
            </div>
          </div>
        </GlowCard>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S6: Tagline ─────────────────────────────────────────────────────────────

const SceneTagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.glow) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  return (
    <SceneFade dur={55} fadeIn={6} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <GlowOrb x={CX} y={CY} size={800} color={C.accent} glowColor={C.accentGlow} progress={s(0)} phase={0} />

        <WordLine
          words={[
            { text: "Stop", weight: 700, color: C.accent },
            { text: "the", weight: 400 },
            { text: "silent", weight: 700, color: C.accent },
            { text: "churn.", weight: 700, color: C.accent },
          ]}
          y={CY}
          size={180}
          stagger={5}
          baseDelay={2}
          fontFamily={FONT}
          defaultColor={C.text}
          springConfig={SPR.text}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ─── S7: CTA ─────────────────────────────────────────────────────────────────

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  const btnP = s(8, SPR.snap);
  const btnPulse = 1 + Math.sin(frame * 0.06) * 0.02 * btnP;

  return (
    <SceneFade dur={45} fadeIn={6} fadeOut={0}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Brand name */}
        <div style={{ position: "absolute", left: 0, right: 0, top: CY - 220, textAlign: "center" }}>
          <BlurWord
            text="Deskflow"
            delay={0}
            fontWeight={800}
            color={C.accent}
            size={200}
            fontFamily={FONT}
            springConfig={SPR.text}
          />
        </div>

        {/* CTA button */}
        <div
          style={{
            position: "absolute",
            left: CX - 320,
            top: CY + 30,
            width: 640,
            height: 100,
            borderRadius: 50,
            background: C.accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontSize: 40,
            fontWeight: 600,
            color: C.white,
            boxShadow: `0 0 40px ${C.accentGlow}, 0 8px 32px rgba(0,0,0,0.3)`,
            opacity: btnP,
            transform: `scale(${(0.85 + btnP * 0.15) * btnPulse})`,
          }}
        >
          Start your free trial
        </div>

        {/* URL */}
        <div style={{ position: "absolute", left: 0, right: 0, top: CY + 170, textAlign: "center" }}>
          <BlurWord
            text="deskflow.io"
            delay={14}
            fontWeight={400}
            color={C.textMid}
            size={48}
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

export const DeskflowAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* S1: The Accusation (0–95f) */}
      <Sequence from={0} durationInFrames={95}>
        <SceneAccusation />
      </Sequence>

      {/* S2: The Silent Exit (90–195f) — 5f overlap for cross-fade */}
      <Sequence from={90} durationInFrames={105}>
        <SceneSilentExit />
      </Sequence>

      {/* S3: The Visibility Gap (190–290f) — 5f overlap */}
      <Sequence from={190} durationInFrames={100}>
        <SceneVisibilityGap />
      </Sequence>

      {/* S4: The Control Shift (285–400f) — 5f overlap */}
      <Sequence from={285} durationInFrames={115}>
        <SceneControlShift />
      </Sequence>

      {/* S5: The Proof (395–500f) — 5f overlap */}
      <Sequence from={395} durationInFrames={105}>
        <SceneProof />
      </Sequence>

      {/* S6: Tagline (495–555f) — 5f overlap */}
      <Sequence from={495} durationInFrames={60}>
        <SceneTagline />
      </Sequence>

      {/* S7: CTA (550–600f) — 5f overlap */}
      <Sequence from={550} durationInFrames={50}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
