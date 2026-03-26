/**
 * FlowPilotV2Ad — "Professionalise the Business" SaaS Paid Ad
 *
 * Client: FlowPilot — workflow & client management for service businesses.
 * Angle: Professionalise — what your clients see matters.
 * Tagline: "Run it like you mean it."
 *
 * Distinct from V1 (Chaos to Control): this ad focuses on EXTERNAL
 * perception (how clients experience your business) rather than
 * INTERNAL pain (too many tools). The emotional driver is professional
 * pride, not operational frustration.
 *
 * Every visual element shows the CLIENT's perspective:
 *   S1: Hook — sloppy email thread the client actually receives
 *   S2: The Cringe — three client-experience failure cards
 *   S3: The Pivot — a single polished automated notification
 *   S4: Professional Experience — client timeline (enquiry → invoice)
 *   S5: Behind the Scenes — automation rules dashboard
 *   S6: Tagline — "Run it like you mean it."
 *   S7: CTA — brand close with trust indicators
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

// ─── Palette ─────────────────────────────────────────────────────────────────

const C = {
  bg: "#0F172A",
  bgMid: "#1E293B",
  surface: "#1E293B",
  surfaceHi: "#2D3B50",
  accent: "#3B82F6",
  accentLight: "#60A5FA",
  accentGlow: "#3B82F640",
  cyan: "#22D3EE",
  cyanGlow: "#22D3EE30",
  green: "#10B981",
  greenGlow: "#10B98130",
  amber: "#F59E0B",
  rose: "#FB7185",
  red: "#EF4444",
  text: "#F8FAFC",
  textMid: "#94A3B8",
  textDim: "#64748B",
  white: "#F8FAFC",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

// ─── Spring Presets ──────────────────────────────────────────────────────────

const SPR = {
  text: { stiffness: 180, damping: 26, mass: 0.8 },
  hero: { stiffness: 100, damping: 24, mass: 1.1 },
  ui: { stiffness: 160, damping: 23, mass: 0.85 },
  bg: { stiffness: 50, damping: 28, mass: 1.3 },
  snap: { stiffness: 220, damping: 24, mass: 0.7 },
  settle: { stiffness: 90, damping: 20, mass: 1.0 },
};

function useSpr(delay = 0, config = SPR.text) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.max(0, frame - delay), fps, config });
}

// ─── Scene Fade ──────────────────────────────────────────────────────────────

const SceneFade: React.FC<{
  children: React.ReactNode;
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, dur, fadeIn = 8, fadeOut = 10 }) => {
  const frame = useCurrentFrame();
  const inOp = fadeIn > 0 ? Math.min(1, frame / fadeIn) : 1;
  const outOp = fadeOut > 0 ? Math.min(1, (dur - frame) / fadeOut) : 1;
  const op = Math.max(0, Math.min(inOp, outOp));
  const exitScale =
    fadeOut > 0 && dur - frame < fadeOut
      ? interpolate(frame, [dur - fadeOut, dur], [1, 0.97], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  return (
    <AbsoluteFill style={{ opacity: op, transform: `scale(${exitScale})` }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── Blur Word ───────────────────────────────────────────────────────────────

const BlurWord: React.FC<{
  text: string;
  delay: number;
  weight?: number;
  color?: string;
  size?: number;
}> = ({ text, delay, weight = 400, color = C.text, size = 160 }) => {
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

interface WordCfg {
  text: string;
  weight?: number;
  color?: string;
}

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
        color={w.color ?? C.text}
        size={size}
      />
    ))}
  </div>
);

// ─── Single Text (centered block) ────────────────────────────────────────────

const SingleText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  size?: number;
  weight?: number;
  color?: string;
}> = ({
  children,
  delay = 0,
  y = CY,
  size = 140,
  weight = 400,
  color = C.text,
}) => {
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

// ═══════════════════════════════════════════════════════════════════════════════
// S1: HOOK — "Your clients can tell when you're winging it."
//
// Visual: A phone frame showing a sloppy email thread from the client's POV.
// Three embarrassing messages that cascade in with stagger.
// ═══════════════════════════════════════════════════════════════════════════════

const EmailRow: React.FC<{
  subject: string;
  time: string;
  delay: number;
  isLate?: boolean;
}> = ({ subject, time, delay, isLate = false }) => {
  const p = useSpr(delay, SPR.ui);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${(1 - p) * 60}px)`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "28px 40px",
        borderBottom: `1px solid ${C.surfaceHi}`,
        fontFamily: FONT,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: C.text,
            letterSpacing: -0.5,
          }}
        >
          {subject}
        </div>
        <div
          style={{
            fontSize: 28,
            color: C.textDim,
          }}
        >
          From: Your Business
        </div>
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 500,
          color: isLate ? C.amber : C.textDim,
          whiteSpace: "nowrap",
        }}
      >
        {time}
      </div>
    </div>
  );
};

const SceneHook: React.FC = () => {
  return (
    <SceneFade dur={100} fadeIn={8} fadeOut={10}>
      <AbsoluteFill>
        {/* Text above phone */}
        <WordLine
          words={[
            { text: "Your", weight: 400 },
            { text: "clients", weight: 700 },
            { text: "can", weight: 400 },
            { text: "tell", weight: 700, color: C.accent },
          ]}
          y={380}
          size={140}
          stagger={4}
          baseDelay={0}
        />
        <SingleText delay={8} y={530} size={100} weight={400} color={C.textMid}>
          when you're winging it.
        </SingleText>

        {/* Phone / inbox mockup */}
        {(() => {
          const p = useSpr(12, SPR.hero);
          return (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 720,
                transform: `translateX(-50%) scale(${0.92 + p * 0.08})`,
                opacity: p,
                width: 1600,
                borderRadius: 40,
                background: C.surface,
                border: `2px solid ${C.surfaceHi}`,
                overflow: "hidden",
                boxShadow: `0 40px 120px rgba(0,0,0,0.5), 0 0 200px ${C.accentGlow}`,
              }}
            >
              {/* Inbox header */}
              <div
                style={{
                  padding: "28px 40px",
                  borderBottom: `2px solid ${C.surfaceHi}`,
                  fontFamily: FONT,
                  fontSize: 32,
                  fontWeight: 600,
                  color: C.textMid,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                Client Inbox — Your Business
              </div>

              <EmailRow
                subject="Re: Re: Re: Quote request"
                time="4 days ago"
                delay={18}
                isLate
              />
              <EmailRow
                subject="Sorry for the delay..."
                time="2 days ago"
                delay={24}
                isLate
              />
              <EmailRow
                subject="Following up on my follow-up"
                time="1 day ago"
                delay={30}
                isLate
              />
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S2: THE CRINGE — "Missed follow-ups. Lost details."
//
// Three client-experience failure cards showing specific embarrassments.
// ═══════════════════════════════════════════════════════════════════════════════

const FailureCard: React.FC<{
  icon: string;
  title: string;
  detail: string;
  problem: string;
  x: number;
  delay: number;
}> = ({ icon, title, detail, problem, x, delay }) => {
  const p = useSpr(delay, SPR.ui);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: "50%",
        transform: `translateY(-50%) translateY(${(1 - p) * 80}px) scale(${0.92 + p * 0.08})`,
        opacity: p,
        width: 1000,
        borderRadius: 32,
        background: C.surface,
        border: `2px solid ${C.surfaceHi}`,
        overflow: "hidden",
        boxShadow: `0 24px 80px rgba(0,0,0,0.4)`,
      }}
    >
      {/* Red accent border */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: C.red,
          borderRadius: "32px 0 0 32px",
        }}
      />
      <div style={{ padding: "48px 56px 48px 72px" }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 56,
            marginBottom: 12,
          }}
        >
          {icon}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 44,
            fontWeight: 700,
            color: C.text,
            marginBottom: 16,
            letterSpacing: -1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 34,
            color: C.textMid,
            marginBottom: 24,
            lineHeight: 1.4,
          }}
        >
          {detail}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 30,
            fontWeight: 600,
            color: C.red,
            letterSpacing: 0.5,
          }}
        >
          {problem}
        </div>
      </div>
    </div>
  );
};

const SceneCringe: React.FC = () => {
  return (
    <SceneFade dur={90} fadeIn={8} fadeOut={10}>
      <AbsoluteFill>
        <WordLine
          words={[
            { text: "Missed", weight: 700 },
            { text: "follow-ups.", weight: 400 },
            { text: "Lost", weight: 700, color: C.red },
            { text: "details.", weight: 400 },
          ]}
          y={310}
          size={120}
          stagger={4}
          baseDelay={0}
        />
        <SingleText delay={8} y={450} size={72} weight={400} color={C.textMid}>
          A great service, buried in bad admin.
        </SingleText>

        <FailureCard
          icon="📞"
          title="Missed callback"
          detail="Callback requested: Monday"
          problem="Still waiting: Thursday"
          x={180}
          delay={10}
        />
        <FailureCard
          icon="📋"
          title="Wrong details"
          detail='Quote sent to "Mark Ellis"'
          problem='Client name: "Mike Ellis"'
          x={1400}
          delay={16}
        />
        <FailureCard
          icon="💬"
          title="Radio silence"
          detail='"Hi, any update on the project?"'
          problem="Seen 3 days ago · No reply"
          x={2620}
          delay={22}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S3: THE PIVOT — "Now imagine the opposite."
//
// A single polished client notification replaces the chaos.
// Background lifts subtly with a blue accent glow.
// ═══════════════════════════════════════════════════════════════════════════════

const ScenePivot: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgLift = spring({
    frame,
    fps,
    config: SPR.bg,
  });

  return (
    <SceneFade dur={80} fadeIn={8} fadeOut={10}>
      <AbsoluteFill>
        {/* Background glow shift */}
        <div
          style={{
            position: "absolute",
            left: CX - 600,
            top: CY - 400,
            width: 1200,
            height: 800,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${C.accentGlow} 0%, transparent 70%)`,
            opacity: bgLift * 0.5,
          }}
        />

        <SingleText delay={0} y={440} size={140} weight={500} color={C.text}>
          Now imagine the opposite.
        </SingleText>

        {/* Polished notification card */}
        {(() => {
          const p = useSpr(14, SPR.hero);
          return (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: CY + 60,
                transform: `translateX(-50%) translateY(-50%) scale(${0.92 + p * 0.08})`,
                opacity: p,
                width: 1400,
                borderRadius: 32,
                background: C.bgMid,
                border: `2px solid ${C.accent}40`,
                overflow: "hidden",
                boxShadow: `0 32px 100px rgba(0,0,0,0.4), 0 0 120px ${C.accentGlow}`,
              }}
            >
              {/* Green accent border */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 6,
                  background: C.green,
                  borderRadius: "32px 0 0 32px",
                }}
              />
              <div style={{ padding: "48px 56px 48px 72px" }}>
                {/* FP logo mark */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 24,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: FONT,
                      fontSize: 24,
                      fontWeight: 800,
                      color: C.white,
                    }}
                  >
                    FP
                  </div>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 28,
                      color: C.textDim,
                    }}
                  >
                    FlowPilot · Just now
                  </div>
                </div>

                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 48,
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 16,
                    letterSpacing: -1,
                  }}
                >
                  Your project update is ready
                </div>

                {/* CTA link */}
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 36,
                    fontWeight: 500,
                    color: C.accent,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  View your project timeline →
                </div>
              </div>
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S4: PROFESSIONAL EXPERIENCE — "Automated updates. Instant follow-ups."
//
// Client timeline: 5 steps showing the polished client journey.
// Each step connected by a vertical line that draws on.
// ═══════════════════════════════════════════════════════════════════════════════

const TimelineStep: React.FC<{
  icon: string;
  label: string;
  timestamp: string;
  y: number;
  delay: number;
  isLast?: boolean;
}> = ({ icon, label, timestamp, y, delay, isLast = false }) => {
  const p = useSpr(delay, SPR.ui);
  const lineP = useSpr(delay + 8, SPR.settle);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CX - 700,
          top: y,
          opacity: p,
          transform: `translateX(${(1 - p) * -60}px)`,
          display: "flex",
          alignItems: "center",
          gap: 36,
        }}
      >
        {/* Dot */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            flexShrink: 0,
            boxShadow: `0 0 24px ${C.accentGlow}`,
          }}
        >
          {icon}
        </div>
        {/* Label */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 48,
            fontWeight: 600,
            color: C.text,
            letterSpacing: -1,
          }}
        >
          {label}
        </div>
        {/* Timestamp */}
        <div
          style={{
            fontFamily: FONT,
            fontSize: 36,
            fontWeight: 500,
            color: C.green,
            marginLeft: 24,
          }}
        >
          {timestamp}
        </div>
      </div>

      {/* Connecting line */}
      {!isLast && (
        <div
          style={{
            position: "absolute",
            left: CX - 700 + 27,
            top: y + 56,
            width: 3,
            height: 100 * lineP,
            background: `linear-gradient(to bottom, ${C.accent}80, ${C.accent}20)`,
          }}
        />
      )}
    </>
  );
};

const SceneProfessional: React.FC = () => {
  const STEP_GAP = 150;
  const START_Y = 660;

  return (
    <SceneFade dur={105} fadeIn={8} fadeOut={10}>
      <AbsoluteFill>
        <WordLine
          words={[
            { text: "Automated", weight: 700, color: C.accent },
            { text: "updates.", weight: 400 },
            { text: "Instant", weight: 700, color: C.accent },
            { text: "follow-ups.", weight: 400 },
          ]}
          y={310}
          size={110}
          stagger={4}
          baseDelay={0}
        />
        <SingleText delay={10} y={450} size={68} weight={400} color={C.textMid}>
          Every client feels like your only client.
        </SingleText>

        <TimelineStep icon="✉️" label="Enquiry received" timestamp="< 1 min" y={START_Y} delay={14} />
        <TimelineStep icon="📄" label="Quote sent" timestamp="Same day" y={START_Y + STEP_GAP} delay={22} />
        <TimelineStep icon="📅" label="Job scheduled" timestamp="Confirmed" y={START_Y + STEP_GAP * 2} delay={30} />
        <TimelineStep icon="🔗" label="Update shared" timestamp="Automatic" y={START_Y + STEP_GAP * 3} delay={38} />
        <TimelineStep icon="🧾" label="Invoice sent" timestamp="On completion" y={START_Y + STEP_GAP * 4} delay={46} isLast />

        {/* Powered by badge */}
        {(() => {
          const p = useSpr(54, SPR.text);
          return (
            <div
              style={{
                position: "absolute",
                left: CX - 700 + 10,
                top: START_Y + STEP_GAP * 4 + 100,
                opacity: p * 0.6,
                fontFamily: FONT,
                fontSize: 28,
                color: C.textDim,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Powered by FlowPilot
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S5: BEHIND THE SCENES — "One dashboard. Zero manual work."
//
// Automation rules dashboard showing the operator's view.
// ═══════════════════════════════════════════════════════════════════════════════

const AutomationRule: React.FC<{
  trigger: string;
  actions: string;
  y: number;
  delay: number;
}> = ({ trigger, actions, y, delay }) => {
  const p = useSpr(delay, SPR.ui);
  const dotP = useSpr(delay + 10, SPR.settle);

  return (
    <div
      style={{
        position: "absolute",
        left: 920,
        right: 400,
        top: y,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "36px 44px",
        borderRadius: 24,
        background: C.surfaceHi,
        border: `1px solid ${C.accent}20`,
      }}
    >
      {/* Active dot */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: C.green,
          boxShadow: `0 0 12px ${C.greenGlow}`,
          opacity: 0.5 + dotP * 0.5,
          flexShrink: 0,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 36,
            fontWeight: 600,
            color: C.text,
            letterSpacing: -0.5,
            marginBottom: 8,
          }}
        >
          When: {trigger}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 30,
            color: C.textMid,
          }}
        >
          → {actions}
        </div>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 24,
          fontWeight: 600,
          color: C.green,
          letterSpacing: 1,
          textTransform: "uppercase",
          flexShrink: 0,
        }}
      >
        Active
      </div>
    </div>
  );
};

const SceneBehind: React.FC = () => {
  const sidebarP = useSpr(4, SPR.ui);

  const navItems = [
    { label: "Pipeline", active: false },
    { label: "Clients", active: false },
    { label: "Tasks", active: false },
    { label: "Automations", active: true },
    { label: "Reports", active: false },
  ];

  return (
    <SceneFade dur={92} fadeIn={8} fadeOut={10}>
      <AbsoluteFill>
        <SingleText delay={0} y={280} size={120} weight={700}>
          One dashboard. Zero manual work.
        </SingleText>

        {/* Dashboard frame */}
        <div
          style={{
            position: "absolute",
            left: 320,
            top: 460,
            right: 320,
            bottom: 200,
            borderRadius: 32,
            background: C.surface,
            border: `2px solid ${C.surfaceHi}`,
            overflow: "hidden",
            opacity: sidebarP,
            transform: `scale(${0.95 + sidebarP * 0.05})`,
            boxShadow: `0 40px 120px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Left sidebar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 560,
              borderRight: `2px solid ${C.surfaceHi}`,
              padding: "48px 0",
            }}
          >
            {navItems.map((item, i) => {
              const itemP = useSpr(10 + i * 4, SPR.ui);
              return (
                <div
                  key={item.label}
                  style={{
                    padding: "24px 44px",
                    fontFamily: FONT,
                    fontSize: 36,
                    fontWeight: item.active ? 700 : 400,
                    color: item.active ? C.accent : C.textMid,
                    background: item.active ? `${C.accent}12` : "transparent",
                    borderLeft: item.active
                      ? `4px solid ${C.accent}`
                      : "4px solid transparent",
                    opacity: itemP,
                    transform: `translateX(${(1 - itemP) * -20}px)`,
                  }}
                >
                  {item.label}
                </div>
              );
            })}
          </div>

          {/* Main area — automation rules */}
          <AutomationRule
            trigger="New enquiry"
            actions="Send welcome email + Create task"
            y={530}
            delay={18}
          />
          <AutomationRule
            trigger="Job completed"
            actions="Send invoice + Request review"
            y={690}
            delay={24}
          />
          <AutomationRule
            trigger="No reply in 48h"
            actions="Send follow-up reminder"
            y={850}
            delay={30}
          />
        </div>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S6: TAGLINE — "Run it like you mean it."
//
// Large centered typography with word-by-word reveal.
// Small before/after badge row below.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneTagline: React.FC = () => {
  return (
    <SceneFade dur={92} fadeIn={8} fadeOut={10}>
      <AbsoluteFill>
        <WordLine
          words={[
            { text: "Run", weight: 800 },
            { text: "it", weight: 800 },
            { text: "like", weight: 800 },
            { text: "you", weight: 800 },
            { text: "mean", weight: 800, color: C.accent },
            { text: "it.", weight: 800, color: C.accent },
          ]}
          y={CY - 100}
          size={180}
          stagger={5}
          baseDelay={0}
        />

        {/* Before/after badge row */}
        {(() => {
          const p = useSpr(35, SPR.text);
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: CY + 160,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 80,
                opacity: p * 0.7,
              }}
            >
              {/* Before */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  fontFamily: FONT,
                  fontSize: 40,
                  color: C.textDim,
                }}
              >
                <span style={{ fontSize: 48, opacity: 0.6 }}>✕</span>
                Messy inbox
              </div>

              {/* Arrow */}
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 48,
                  color: C.accent,
                }}
              >
                →
              </div>

              {/* After */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  fontFamily: FONT,
                  fontSize: 40,
                  color: C.green,
                  fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 48 }}>✓</span>
                Clean timeline
              </div>
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// S7: CTA — "FlowPilot" + "Start Free Today" + trust indicators
// ═══════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  return (
    <SceneFade dur={77} fadeIn={8} fadeOut={0}>
      <AbsoluteFill>
        {/* Brand name */}
        {(() => {
          const p = useSpr(0, SPR.snap);
          const blur = (1 - p) * 10;
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: CY - 260,
                textAlign: "center",
                fontFamily: FONT,
                fontSize: 200,
                fontWeight: 700,
                color: C.text,
                opacity: p,
                transform: `scale(${0.92 + p * 0.08})`,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                letterSpacing: -6,
              }}
            >
              Flow
              <span style={{ color: C.accent }}>Pilot</span>
            </div>
          );
        })()}

        {/* CTA button */}
        {(() => {
          const p = useSpr(8, SPR.snap);
          return (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: CY - 10,
                transform: `translateX(-50%) scale(${0.88 + p * 0.12})`,
                opacity: p,
                padding: "36px 100px",
                borderRadius: 80,
                background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
                fontFamily: FONT,
                fontSize: 52,
                fontWeight: 700,
                color: C.white,
                letterSpacing: 0.5,
                boxShadow: `0 12px 40px ${C.accentGlow}, 0 0 80px ${C.cyanGlow}`,
              }}
            >
              Start Free Today
            </div>
          );
        })()}

        {/* Tagline echo */}
        {(() => {
          const p = useSpr(16, SPR.text);
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: CY + 120,
                textAlign: "center",
                fontFamily: FONT,
                fontSize: 44,
                fontWeight: 400,
                color: C.textMid,
                opacity: p * 0.7,
                letterSpacing: 2,
              }}
            >
              Less admin. More momentum.
            </div>
          );
        })()}

        {/* Trust indicators */}
        {(() => {
          const p = useSpr(22, SPR.text);
          const items = [
            "Free 14-day trial",
            "No credit card",
            "Setup in 2 minutes",
          ];
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: CY + 260,
                display: "flex",
                justifyContent: "center",
                gap: 60,
                opacity: p * 0.5,
              }}
            >
              {items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: FONT,
                    fontSize: 32,
                    color: C.textDim,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ color: C.green, fontSize: 28 }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const FlowPilotV2Ad: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={100}>
        <SceneHook />
      </Sequence>

      <Sequence from={95} durationInFrames={90}>
        <SceneCringe />
      </Sequence>

      <Sequence from={180} durationInFrames={80}>
        <ScenePivot />
      </Sequence>

      <Sequence from={255} durationInFrames={105}>
        <SceneProfessional />
      </Sequence>

      <Sequence from={353} durationInFrames={92}>
        <SceneBehind />
      </Sequence>

      <Sequence from={438} durationInFrames={92}>
        <SceneTagline />
      </Sequence>

      <Sequence from={523} durationInFrames={77}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
