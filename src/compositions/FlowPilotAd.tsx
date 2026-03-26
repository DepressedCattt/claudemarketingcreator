/**
 * FlowPilotAd — "Chaos to Control" SaaS Paid Ad
 *
 * Client: FlowPilot — workflow & client management for service businesses.
 * Angle: Chaos to Control — scattered systems → unified platform.
 * Tagline: "Less admin. More momentum."
 *
 * Every visual element directly illustrates the text on screen:
 *   S1: Revenue line climbing + overdue notifications piling up
 *   S2: Literal browser tabs multiplying, recognizable tool windows
 *   S3: Chaos collapses into a single unified interface card
 *   S4: Real-looking product dashboard (pipeline kanban, client cards)
 *   S5: A lead card flowing through pipeline stages with contextual widgets
 *   S6: Social proof stats inside a believable dashboard context
 *   S7: Crossed-out chaos vs clean checkmarks — visual split
 *   S8: Brand close with CTA
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
  amberGlow: "#F59E0B30",
  rose: "#FB7185",
  text: "#F8FAFC",
  textMid: "#94A3B8",
  textDim: "#64748B",
  white: "#F8FAFC",
  red: "#EF4444",
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
  glow: { stiffness: 80, damping: 26, mass: 1.1 },
  settle: { stiffness: 90, damping: 19, mass: 1.05 },
  snap: { stiffness: 220, damping: 22, mass: 0.7 },
};

function useSpr(delay = 0, config = SPR.text) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: Math.max(0, frame - delay), fps, config });
}

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

// ─── Blur Word ──────────────────────────────────────────────────────────────

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

// ═════════════════════════════════════════════════════════════════════════════
// S1: HOOK — "Your business is growing. Your systems haven't caught up."
//
// Visuals: A revenue chart line climbing upward (growth),
// paired with overdue task badges and notification pills piling up
// at the bottom (systems failing to keep pace).
// ═════════════════════════════════════════════════════════════════════════════

const RevenueChart: React.FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const points = [
    { x: 0, y: 320 },
    { x: 120, y: 290 },
    { x: 240, y: 260 },
    { x: 360, y: 210 },
    { x: 480, y: 230 },
    { x: 600, y: 170 },
    { x: 720, y: 120 },
    { x: 840, y: 60 },
    { x: 960, y: 30 },
  ];

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");
  const totalLen = 1400;
  const bob = Math.sin(frame * 0.02) * 3;

  return (
    <div
      style={{
        position: "absolute",
        left: 240,
        top: 520 + bob,
        opacity: progress,
        transform: `scale(${0.9 + progress * 0.1})`,
      }}
    >
      {/* Y-axis labels */}
      {["$0", "$50K", "$100K", "$150K"].map((label, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: -120,
            top: 320 - i * 100 - 12,
            fontFamily: FONT,
            fontSize: 24,
            color: C.textDim,
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      ))}
      {/* Grid lines */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 320 - i * 100,
            width: 960,
            height: 1,
            background: `${C.textDim}20`,
          }}
        />
      ))}
      {/* Chart line */}
      <svg width={960} height={360} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.green} stopOpacity={0.25} />
            <stop offset="100%" stopColor={C.green} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={pathD + " L 960 360 L 0 360 Z"}
          fill="url(#chartFill)"
          opacity={progress}
        />
        <path
          d={pathD}
          fill="none"
          stroke={C.green}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={totalLen}
          strokeDashoffset={totalLen * (1 - progress)}
          filter={`drop-shadow(0 0 8px ${C.green}60)`}
        />
        {/* Dot at tip */}
        {progress > 0.9 && (
          <circle
            cx={960}
            cy={30}
            r={10}
            fill={C.green}
            filter={`drop-shadow(0 0 10px ${C.green})`}
          >
            <animate
              attributeName="r"
              values="8;12;8"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>
      {/* "Revenue" label */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -50,
          fontFamily: FONT,
          fontSize: 32,
          fontWeight: 600,
          color: C.green,
          letterSpacing: 1,
        }}
      >
        ↑ REVENUE
      </div>
    </div>
  );
};

const OverdueItem: React.FC<{
  x: number;
  y: number;
  label: string;
  days: string;
  delay: number;
}> = ({ x, y, label, days, delay }) => {
  const frame = useCurrentFrame();
  const p = useSpr(delay, SPR.ui);
  const shake = p > 0.9 ? Math.sin(frame * 0.15 + x) * 2 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: p,
        transform: `translateX(${(1 - p) * 60 + shake}px)`,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${C.red}20`,
          border: `1.5px solid ${C.red}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 20,
          color: C.red,
          fontWeight: 700,
        }}
      >
        !
      </div>
      <div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 500,
            color: C.textMid,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 20,
            fontWeight: 600,
            color: C.red,
          }}
        >
          {days}
        </div>
      </div>
    </div>
  );
};

const NotificationPill: React.FC<{
  x: number;
  y: number;
  count: number;
  label: string;
  color: string;
  delay: number;
}> = ({ x, y, count, label, color, delay }) => {
  const p = useSpr(delay, SPR.snap);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 20px",
        borderRadius: 100,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        opacity: p,
        transform: `scale(${0.6 + p * 0.4}) translateY(${(1 - p) * 20}px)`,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          fontSize: 16,
          fontWeight: 700,
          color: C.white,
          boxShadow: `0 0 8px ${color}`,
        }}
      >
        {count}
      </div>
      <span style={{ fontFamily: FONT, fontSize: 22, color, fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
};

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const chartP = spring({
    frame: Math.max(0, frame - 6),
    fps,
    config: { stiffness: 40, damping: 30, mass: 1.3 },
  });

  return (
    <SceneFade dur={95} fadeIn={6} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Revenue chart — illustrates "your business is growing" */}
        <RevenueChart progress={chartP} />

        {/* Text — right side */}
        <WordLine
          y={640}
          words={[
            { text: "Your", weight: 300, color: C.textMid },
            { text: "business", weight: 700, color: C.text },
            { text: "is", weight: 300, color: C.textMid },
            { text: "growing.", weight: 700, color: C.green },
          ]}
          size={140}
          stagger={5}
          baseDelay={0}
        />

        {/* Overdue tasks — illustrate "systems haven't caught up" */}
        <OverdueItem
          x={2200}
          y={380}
          label="Follow up: Smith & Co"
          days="Overdue 5 days"
          delay={20}
        />
        <OverdueItem
          x={2200}
          y={470}
          label="Send quote: DataTech"
          days="Overdue 3 days"
          delay={23}
        />
        <OverdueItem
          x={2200}
          y={560}
          label="Onboard: MakerStudio"
          days="Overdue 8 days"
          delay={26}
        />
        <OverdueItem
          x={2200}
          y={650}
          label="Invoice: ClearPath"
          days="Overdue 12 days"
          delay={29}
        />

        {/* Notification pills piling up */}
        <NotificationPill
          x={2200}
          y={780}
          count={14}
          label="unread emails"
          color={C.amber}
          delay={32}
        />
        <NotificationPill
          x={2600}
          y={780}
          count={7}
          label="missed calls"
          color={C.red}
          delay={35}
        />
        <NotificationPill
          x={2200}
          y={850}
          count={23}
          label="pending tasks"
          color={C.rose}
          delay={38}
        />

        <SingleText
          delay={22}
          y={1100}
          size={64}
          weight={400}
          color={C.textMid}
        >
          Your systems haven't caught up.
        </SingleText>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S2: PROBLEM — "5 tools. 12 tabs. Zero clarity."
//
// Visuals: A literal browser bar with tabs multiplying across the top.
// Below it, recognizable mini app windows: a spreadsheet grid,
// an email inbox, chat message bubbles, a calendar, a notes app.
// They overlap, crowd each other, and the cursor bounces between them.
// ═════════════════════════════════════════════════════════════════════════════

const BrowserTab: React.FC<{
  x: number;
  label: string;
  active?: boolean;
  delay: number;
  color: string;
}> = ({ x, label, active = false, delay, color }) => {
  const p = useSpr(delay, SPR.snap);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: 260,
        height: 56,
        borderRadius: "12px 12px 0 0",
        background: active ? C.surface : `${C.surface}80`,
        border: `1px solid ${active ? `${color}40` : `${C.textDim}20`}`,
        borderBottom: active ? `2px solid ${color}` : "none",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 10,
        opacity: p,
        transform: `translateY(${(1 - p) * -30}px) scale(${0.8 + p * 0.2})`,
      }}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: color,
        }}
      />
      <span
        style={{
          fontFamily: FONT,
          fontSize: 18,
          color: active ? C.text : C.textDim,
          fontWeight: active ? 600 : 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          marginLeft: "auto",
          fontFamily: FONT,
          fontSize: 16,
          color: C.textDim,
        }}
      >
        ×
      </span>
    </div>
  );
};

const MiniAppWindow: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  color: string;
  delay: number;
  rot?: number;
  children: React.ReactNode;
}> = ({ x, y, w, h, title, color, delay, rot = 0, children }) => {
  const frame = useCurrentFrame();
  const p = useSpr(delay, SPR.ui);
  const drift = Math.sin(frame * 0.02 + x * 0.005) * 4;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y + drift,
        width: w,
        height: h,
        borderRadius: 20,
        background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
        border: `1px solid ${color}25`,
        boxShadow: `0 16px 48px rgba(0,0,0,0.4)`,
        opacity: p,
        transform: `scale(${0.7 + p * 0.3}) rotate(${rot * p}deg)`,
        overflow: "hidden",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          height: 44,
          background: `${C.bgMid}`,
          borderBottom: `1px solid ${C.textDim}15`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 8,
        }}
      >
        <div
          style={{ width: 10, height: 10, borderRadius: "50%", background: C.red }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: C.amber,
          }}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: C.green,
          }}
        />
        <span
          style={{
            marginLeft: 12,
            fontFamily: FONT,
            fontSize: 16,
            color: C.textDim,
            fontWeight: 500,
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
};

const SceneProblem: React.FC = () => {
  const tabs = [
    { x: 20, label: "Google Sheets", color: C.green, delay: 2 },
    { x: 280, label: "Gmail — Inbox (47)", color: C.red, delay: 4 },
    { x: 540, label: "Slack #general", color: "#E01E5A", delay: 6 },
    { x: 800, label: "Trello Board", color: C.accent, delay: 8 },
    { x: 1060, label: "Calendar", color: C.cyan, delay: 10 },
    { x: 1320, label: "Google Docs", color: C.accent, delay: 12 },
    { x: 1580, label: "Invoice App", color: C.amber, delay: 14 },
    { x: 1840, label: "WhatsApp", color: C.green, delay: 16 },
    { x: 2100, label: "Notion", color: C.text, delay: 18 },
    { x: 2360, label: "Xero", color: C.cyan, delay: 20 },
    { x: 2620, label: "HubSpot CRM", color: "#FF7A59", delay: 22 },
    { x: 2880, label: "Reminders", color: C.amber, delay: 24 },
  ];

  return (
    <SceneFade dur={97} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Browser tab bar */}
        <div style={{ position: "absolute", left: 160, top: 140, width: 3520 }}>
          {/* Address bar background */}
          <div
            style={{
              position: "absolute",
              left: -20,
              top: -20,
              width: 3560,
              height: 96,
              background: C.bgMid,
              borderRadius: "16px 16px 0 0",
              border: `1px solid ${C.textDim}15`,
            }}
          />
          {tabs.map((tab, i) => (
            <BrowserTab
              key={i}
              x={tab.x}
              label={tab.label}
              active={i === 0}
              delay={tab.delay}
              color={tab.color}
            />
          ))}
        </div>

        {/* Mini app windows — overlapping, crowding the screen */}
        {/* Spreadsheet */}
        <MiniAppWindow
          x={160}
          y={380}
          w={900}
          h={580}
          title="Client Tracker.xlsx"
          color={C.green}
          delay={6}
          rot={-2}
        >
          {/* Spreadsheet grid */}
          {Array.from({ length: 6 }).map((_, row) => (
            <div key={row} style={{ display: "flex", gap: 2, marginBottom: 2 }}>
              {Array.from({ length: 5 }).map((_, col) => (
                <div
                  key={col}
                  style={{
                    flex: 1,
                    height: row === 0 ? 28 : 32,
                    borderRadius: 4,
                    background:
                      row === 0
                        ? `${C.green}20`
                        : col === 0
                          ? `${C.textDim}10`
                          : `${C.textDim}06`,
                    border: `1px solid ${C.textDim}10`,
                  }}
                />
              ))}
            </div>
          ))}
        </MiniAppWindow>

        {/* Email inbox */}
        <MiniAppWindow
          x={950}
          y={340}
          w={880}
          h={560}
          title="Inbox — 47 unread"
          color={C.red}
          delay={10}
          rot={1}
        >
          {[
            { from: "Smith & Co", subj: "Re: Quote follow-up", unread: true },
            { from: "DataTech", subj: "Urgent: Project delay", unread: true },
            { from: "MakerStudio", subj: "Onboarding docs?", unread: true },
            { from: "ClearPath", subj: "Invoice overdue", unread: true },
            { from: "BlueLine", subj: "Meeting reschedule", unread: false },
          ].map((email, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: `1px solid ${C.textDim}10`,
              }}
            >
              {email.unread && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: C.accent,
                    flexShrink: 0,
                  }}
                />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 18,
                    fontWeight: email.unread ? 700 : 400,
                    color: email.unread ? C.text : C.textDim,
                  }}
                >
                  {email.from}
                </div>
                <div
                  style={{
                    fontFamily: FONT,
                    fontSize: 15,
                    color: C.textDim,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {email.subj}
                </div>
              </div>
            </div>
          ))}
        </MiniAppWindow>

        {/* Chat messages */}
        <MiniAppWindow
          x={1750}
          y={420}
          w={700}
          h={500}
          title="#team-ops — Slack"
          color="#E01E5A"
          delay={14}
          rot={2}
        >
          {[
            { msg: "Did anyone follow up with Smith?", time: "9:14 AM" },
            { msg: "Where's the client list?", time: "9:32 AM" },
            { msg: "Check the spreadsheet", time: "9:33 AM" },
            { msg: "Which spreadsheet? 😅", time: "9:35 AM" },
            { msg: "The one in the shared drive", time: "9:36 AM" },
          ].map((chat, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: `${[C.accent, C.green, C.amber, C.cyan, C.rose][i]}30`,
                    flexShrink: 0,
                  }}
                />
                <div>
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: 15,
                      color: C.textMid,
                    }}
                  >
                    {chat.msg}
                  </span>
                  <span
                    style={{
                      fontFamily: FONT,
                      fontSize: 12,
                      color: C.textDim,
                      marginLeft: 8,
                    }}
                  >
                    {chat.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </MiniAppWindow>

        {/* Calendar (partially behind chat) */}
        <MiniAppWindow
          x={2480}
          y={350}
          w={660}
          h={480}
          title="Calendar — March"
          color={C.cyan}
          delay={18}
          rot={-1}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 48,
                  borderRadius: 8,
                  background:
                    i === 3 || i === 7 || i === 12
                      ? `${C.accent}20`
                      : i === 5
                        ? `${C.red}20`
                        : `${C.textDim}06`,
                  border:
                    i === 3 || i === 7 || i === 12
                      ? `1px solid ${C.accent}30`
                      : i === 5
                        ? `1px solid ${C.red}30`
                        : `1px solid ${C.textDim}08`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT,
                  fontSize: 14,
                  color: C.textDim,
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </MiniAppWindow>

        {/* Sticky notes window */}
        <MiniAppWindow
          x={300}
          y={1100}
          w={520}
          h={380}
          title="Reminders"
          color={C.amber}
          delay={20}
          rot={3}
        >
          {["Call DataTech re: scope", "Update pipeline", "Send invoice #247", "Book team meeting"].map(
            (note, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px",
                  marginBottom: 6,
                  borderRadius: 8,
                  background: `${C.amber}10`,
                  border: `1px solid ${C.amber}15`,
                  fontFamily: FONT,
                  fontSize: 16,
                  color: C.textMid,
                }}
              >
                {note}
              </div>
            ),
          )}
        </MiniAppWindow>

        {/* Text overlay */}
        <WordLine
          y={1550}
          words={[
            { text: "5 tools.", weight: 700, color: C.amber },
            { text: "12 tabs.", weight: 700, color: C.rose },
            { text: "Zero", weight: 700, color: C.text },
            { text: "clarity.", weight: 700, color: C.text },
          ]}
          size={140}
          stagger={5}
          baseDelay={16}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S3: THE SHIFT — "What if it all just... worked?"
//
// Visuals: The scattered app windows from S2 shrink and fly toward center,
// collapsing into a single clean unified app icon/card.
// ═════════════════════════════════════════════════════════════════════════════

const SceneShift: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const converge = spring({
    frame: Math.max(0, frame - 16),
    fps,
    config: { stiffness: 60, damping: 26, mass: 1.2 },
  });
  const iconAppear = spring({
    frame: Math.max(0, frame - 35),
    fps,
    config: SPR.hero,
  });

  const fragments = [
    { startX: 400, startY: 400, color: C.green, label: "📊" },
    { startX: 1200, startY: 300, color: C.red, label: "✉" },
    { startX: 2000, startY: 500, color: "#E01E5A", label: "💬" },
    { startX: 2800, startY: 350, color: C.cyan, label: "📅" },
    { startX: 600, startY: 1400, color: C.amber, label: "📝" },
    { startX: 1600, startY: 1500, color: C.accent, label: "✓" },
    { startX: 2600, startY: 1300, color: C.text, label: "📋" },
    { startX: 3200, startY: 800, color: "#FF7A59", label: "👤" },
  ];

  return (
    <SceneFade dur={87} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Fragments converging to center */}
        {fragments.map((frag, i) => {
          const curX = frag.startX + (CX - 40 - frag.startX) * converge;
          const curY = frag.startY + (CY - 40 - frag.startY) * converge;
          const fragScale = 1 - converge * 0.6;
          const fragOpacity = 1 - converge * 0.7;

          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: curX,
                top: curY,
                width: 80,
                height: 80,
                borderRadius: 18,
                background: `${frag.color}20`,
                border: `1px solid ${frag.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                opacity: fragOpacity,
                transform: `scale(${fragScale}) rotate(${converge * 360}deg)`,
                boxShadow: `0 0 20px ${frag.color}20`,
              }}
            >
              {frag.label}
            </div>
          );
        })}

        {/* Central unified icon — appears after convergence */}
        <div
          style={{
            position: "absolute",
            left: CX - 100,
            top: CY - 140,
            width: 200,
            height: 200,
            borderRadius: 48,
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            boxShadow: `0 0 80px ${C.accent}50, 0 20px 60px rgba(0,0,0,0.4)`,
            opacity: iconAppear,
            transform: `scale(${0.5 + iconAppear * 0.5})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 80,
              fontWeight: 800,
              color: C.white,
              letterSpacing: -4,
            }}
          >
            FP
          </div>
        </div>

        {/* Text */}
        <WordLine
          y={CY + 120}
          words={[
            { text: "What if", weight: 300, color: C.textMid },
            { text: "it all", weight: 300, color: C.textMid },
            { text: "just", weight: 300, color: C.textMid },
          ]}
          size={120}
          stagger={5}
          baseDelay={4}
        />
        <WordLine
          y={CY + 280}
          words={[{ text: "worked?", weight: 700, color: C.cyan }]}
          size={140}
          stagger={5}
          baseDelay={16}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S4: PRODUCT REVEAL — "Meet FlowPilot"
//
// Visuals: A believable product dashboard with a kanban pipeline view
// (columns: New Lead, Contacted, Quoted, Won) with client cards,
// and a sidebar showing an active client detail panel.
// ═════════════════════════════════════════════════════════════════════════════

const KanbanCard: React.FC<{
  name: string;
  company: string;
  value: string;
  delay: number;
  color: string;
}> = ({ name, company, value, delay, color }) => {
  const p = useSpr(delay, SPR.ui);
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRadius: 14,
        background: C.bgMid,
        border: `1px solid ${C.textDim}12`,
        marginBottom: 10,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            color,
          }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 17,
              fontWeight: 600,
              color: C.text,
            }}
          >
            {name}
          </div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: C.textDim }}>
            {company}
          </div>
        </div>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontSize: 15,
          fontWeight: 600,
          color,
        }}
      >
        {value}
      </div>
    </div>
  );
};

const KanbanColumn: React.FC<{
  x: number;
  y: number;
  w: number;
  title: string;
  count: number;
  color: string;
  delay: number;
  cards: Array<{ name: string; company: string; value: string }>;
}> = ({ x, y, w, title, count, color, delay, cards }) => {
  const p = useSpr(delay, SPR.ui);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        opacity: p,
        transform: `translateY(${(1 - p) * 40}px)`,
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          padding: "0 4px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: color,
            }}
          />
          <span
            style={{
              fontFamily: FONT,
              fontSize: 20,
              fontWeight: 600,
              color: C.text,
            }}
          >
            {title}
          </span>
        </div>
        <span
          style={{
            fontFamily: FONT,
            fontSize: 16,
            fontWeight: 500,
            color: C.textDim,
            background: `${C.textDim}15`,
            padding: "2px 10px",
            borderRadius: 8,
          }}
        >
          {count}
        </span>
      </div>
      {/* Cards */}
      {cards.map((card, i) => (
        <KanbanCard
          key={i}
          name={card.name}
          company={card.company}
          value={card.value}
          delay={delay + 6 + i * 4}
          color={color}
        />
      ))}
    </div>
  );
};

const SceneProduct: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  return (
    <SceneFade dur={97} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* App chrome — top nav bar */}
        {(() => {
          const p = s(2, SPR.ui);
          return (
            <div
              style={{
                position: "absolute",
                left: 160,
                top: 100,
                right: 160,
                height: 72,
                borderRadius: "18px 18px 0 0",
                background: C.bgMid,
                border: `1px solid ${C.textDim}12`,
                borderBottom: "none",
                display: "flex",
                alignItems: "center",
                padding: "0 32px",
                gap: 24,
                opacity: p,
                transform: `translateY(${(1 - p) * -20}px)`,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 22,
                  fontWeight: 700,
                  color: C.accent,
                  letterSpacing: -0.5,
                }}
              >
                FlowPilot
              </div>
              <div
                style={{
                  width: 1,
                  height: 28,
                  background: `${C.textDim}20`,
                }}
              />
              {["Pipeline", "Jobs", "Tasks", "Clients", "Reports"].map(
                (item, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: FONT,
                      fontSize: 17,
                      fontWeight: i === 0 ? 600 : 400,
                      color: i === 0 ? C.accent : C.textDim,
                    }}
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          );
        })()}

        {/* Main content area */}
        {(() => {
          const p = s(4, SPR.ui);
          return (
            <div
              style={{
                position: "absolute",
                left: 160,
                top: 172,
                right: 160,
                bottom: 100,
                borderRadius: "0 0 18px 18px",
                background: `${C.surface}`,
                border: `1px solid ${C.textDim}12`,
                borderTop: `1px solid ${C.textDim}08`,
                opacity: p,
                overflow: "hidden",
              }}
            />
          );
        })()}

        {/* Page title inside dashboard */}
        {(() => {
          const tp = s(6, SPR.text);
          return (
            <div
              style={{
                position: "absolute",
                left: 220,
                top: 210,
                opacity: tp,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 40,
                  fontWeight: 700,
                  color: C.text,
                  letterSpacing: -1,
                }}
              >
                Pipeline
              </div>
              <div
                style={{
                  fontFamily: FONT,
                  fontSize: 18,
                  color: C.textDim,
                  marginTop: 4,
                }}
              >
                47 active leads · $184K total value
              </div>
            </div>
          );
        })()}

        {/* Kanban columns */}
        <KanbanColumn
          x={220}
          y={320}
          w={780}
          title="New Lead"
          count={12}
          color={C.accent}
          delay={8}
          cards={[
            { name: "Sarah Chen", company: "PixelForge", value: "$4,200" },
            { name: "Mark Torres", company: "Clearway", value: "$8,500" },
            { name: "Lisa Park", company: "NorthStar", value: "$3,100" },
          ]}
        />
        <KanbanColumn
          x={1060}
          y={320}
          w={780}
          title="Contacted"
          count={8}
          color={C.amber}
          delay={12}
          cards={[
            { name: "James Miller", company: "DataTech", value: "$12,000" },
            { name: "Amy Walsh", company: "BrightSide", value: "$6,800" },
          ]}
        />
        <KanbanColumn
          x={1900}
          y={320}
          w={780}
          title="Quoted"
          count={6}
          color={C.cyan}
          delay={16}
          cards={[
            { name: "Tom Nguyen", company: "GridBase", value: "$22,500" },
            { name: "Priya Sharma", company: "OmniFlow", value: "$15,000" },
          ]}
        />
        <KanbanColumn
          x={2740}
          y={320}
          w={780}
          title="Won"
          count={4}
          color={C.green}
          delay={20}
          cards={[
            { name: "Rachel Adams", company: "MakerLab", value: "$18,400" },
            { name: "Dan Cooper", company: "ArcPoint", value: "$9,200" },
          ]}
        />

        {/* "Meet FlowPilot" text overlay at bottom */}
        {(() => {
          const tp = s(4, SPR.text);
          const blur = (1 - tp) * 10;
          return (
            <div
              style={{
                position: "absolute",
                left: CX,
                bottom: 160,
                transform: `translate(-50%, 0) translateY(${(1 - tp) * 20}px)`,
                opacity: tp * 0.9,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 36,
                  fontWeight: 400,
                  color: C.textDim,
                  letterSpacing: 3,
                  textTransform: "uppercase" as const,
                }}
              >
                Meet
              </span>
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 36,
                  fontWeight: 700,
                  color: C.accent,
                  marginLeft: 16,
                  letterSpacing: 1,
                }}
              >
                FlowPilot
              </span>
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S5: FEATURES — "One flow. Every stage."
//
// Visuals: A horizontal workflow with contextual mini-widgets at each stage:
//   Lead (contact card) → Job (project brief) → Task (checklist) → Follow-up (sent email)
// Connected by animated flow lines.
// ═════════════════════════════════════════════════════════════════════════════

const WorkflowStage: React.FC<{
  x: number;
  y: number;
  title: string;
  color: string;
  delay: number;
  children: React.ReactNode;
}> = ({ x, y, title, color, delay, children }) => {
  const p = useSpr(delay, SPR.ui);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: 680,
        opacity: p,
        transform: `translateY(${(1 - p) * 50}px) scale(${0.88 + p * 0.12})`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
        <span
          style={{
            fontFamily: FONT,
            fontSize: 34,
            fontWeight: 600,
            color,
            letterSpacing: 1,
            textTransform: "uppercase" as const,
          }}
        >
          {title}
        </span>
      </div>
      <div
        style={{
          borderRadius: 24,
          background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
          border: `1px solid ${color}25`,
          boxShadow: `0 0 24px ${color}15, 0 12px 36px rgba(0,0,0,0.3)`,
          padding: "28px 32px",
          minHeight: 320,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const FlowArrow: React.FC<{
  x: number;
  y: number;
  delay: number;
  color: string;
}> = ({ x, y, delay, color }) => {
  const p = useSpr(delay, SPR.settle);
  return (
    <svg
      style={{
        position: "absolute",
        left: x,
        top: y,
        opacity: p,
      }}
      width={100}
      height={40}
    >
      <line
        x1={0}
        y1={20}
        x2={70}
        y2={20}
        stroke={color}
        strokeWidth={3}
        strokeDasharray={70}
        strokeDashoffset={70 * (1 - p)}
        strokeLinecap="round"
        filter={`drop-shadow(0 0 4px ${color})`}
      />
      <polygon
        points="70,10 90,20 70,30"
        fill={color}
        opacity={p}
      />
    </svg>
  );
};

const SceneFeatures: React.FC = () => {
  return (
    <SceneFade dur={92} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Title */}
        <WordLine
          y={240}
          words={[
            { text: "One", weight: 300, color: C.textMid },
            { text: "flow.", weight: 700, color: C.text },
            { text: "Every", weight: 300, color: C.textMid },
            { text: "stage.", weight: 700, color: C.cyan },
          ]}
          size={110}
          stagger={5}
          baseDelay={4}
        />

        {/* Stage 1: Lead — contact card */}
        <WorkflowStage
          x={160}
          y={500}
          title="Lead"
          color={C.accent}
          delay={10}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${C.accent}20`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.accent }}>SC</div>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, color: C.text }}>Sarah Chen</div>
              <div style={{ fontFamily: FONT, fontSize: 16, color: C.textDim }}>PixelForge Design</div>
            </div>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 15, color: C.textDim, marginBottom: 6 }}>sarah@pixelforge.co</div>
          <div style={{ fontFamily: FONT, fontSize: 15, color: C.textDim, marginBottom: 12 }}>+61 400 123 456</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: `${C.accent}15`, fontFamily: FONT, fontSize: 14, color: C.accent, fontWeight: 500 }}>Website Redesign</div>
            <div style={{ padding: "6px 14px", borderRadius: 8, background: `${C.green}15`, fontFamily: FONT, fontSize: 14, color: C.green, fontWeight: 500 }}>$4,200</div>
          </div>
        </WorkflowStage>

        {/* Arrow 1→2 */}
        <FlowArrow x={840} y={700} delay={18} color={C.accent} />

        {/* Stage 2: Job — project brief */}
        <WorkflowStage
          x={960}
          y={500}
          title="Job"
          color={C.green}
          delay={16}
        >
          <div style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: C.text, marginBottom: 12 }}>Website Redesign</div>
          <div style={{ fontFamily: FONT, fontSize: 15, color: C.textDim, marginBottom: 16 }}>Client: PixelForge · Due: Apr 12</div>
          <div style={{ height: 8, borderRadius: 4, background: `${C.green}15`, overflow: "hidden", marginBottom: 16 }}>
            <div style={{ width: "35%", height: "100%", borderRadius: 4, background: C.green }} />
          </div>
          <div style={{ fontFamily: FONT, fontSize: 14, color: C.textDim }}>3 of 8 tasks complete</div>
        </WorkflowStage>

        {/* Arrow 2→3 */}
        <FlowArrow x={1640} y={700} delay={24} color={C.green} />

        {/* Stage 3: Task — checklist */}
        <WorkflowStage
          x={1760}
          y={500}
          title="Tasks"
          color={C.cyan}
          delay={22}
        >
          {[
            { text: "Wireframe review", done: true },
            { text: "Design mockups", done: true },
            { text: "Client feedback", done: true },
            { text: "Build homepage", done: false },
            { text: "Mobile responsive", done: false },
          ].map((task, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: task.done ? C.green : "transparent", border: `2px solid ${task.done ? C.green : C.textDim}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {task.done && (
                  <svg width={14} height={14} viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" /></svg>
                )}
              </div>
              <span style={{ fontFamily: FONT, fontSize: 18, color: task.done ? C.textDim : C.text, fontWeight: 400, textDecoration: task.done ? "line-through" : "none" }}>{task.text}</span>
            </div>
          ))}
        </WorkflowStage>

        {/* Arrow 3→4 */}
        <FlowArrow x={2440} y={700} delay={30} color={C.cyan} />

        {/* Stage 4: Follow-up — sent email */}
        <WorkflowStage
          x={2560}
          y={500}
          title="Follow-up"
          color={C.amber}
          delay={28}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.green }} />
            <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 500, color: C.green }}>Sent automatically</span>
          </div>
          <div style={{ padding: "14px 18px", borderRadius: 14, background: `${C.amber}08`, border: `1px solid ${C.amber}15` }}>
            <div style={{ fontFamily: FONT, fontSize: 14, color: C.textDim, marginBottom: 6 }}>To: sarah@pixelforge.co</div>
            <div style={{ fontFamily: FONT, fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 6 }}>Re: Website Redesign Update</div>
            <div style={{ fontFamily: FONT, fontSize: 14, color: C.textMid, lineHeight: "1.4" }}>
              Hi Sarah, just checking in on the homepage mockups. We've completed 3 of 8 tasks and are on track for...
            </div>
          </div>
          <div style={{ fontFamily: FONT, fontSize: 13, color: C.textDim, marginTop: 10 }}>Sent 2 hours ago · Next: 3 days</div>
        </WorkflowStage>

        <SingleText delay={34} y={1680} size={52} weight={500} color={C.textMid}>
          From first contact to final follow-up — all in one place.
        </SingleText>
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S6: STATS — "2,400+ service businesses"
//
// Visuals: Stats displayed inside a dashboard metrics panel, not floating
// abstractly. Progress rings show actual business metrics.
// ═════════════════════════════════════════════════════════════════════════════

const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  const heroP = s(6, SPR.hero);
  const heroVal = Math.round(heroP * 2400);

  return (
    <SceneFade dur={77} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Hero stat */}
        <div
          style={{
            position: "absolute",
            left: CX,
            top: CY - 280,
            transform: `translate(-50%, -50%) scale(${0.9 + heroP * 0.1})`,
            textAlign: "center",
            opacity: heroP,
          }}
        >
          <div
            style={{
              fontFamily: FONT,
              fontSize: 300,
              fontWeight: 700,
              color: C.text,
              letterSpacing: -8,
              textShadow: `0 0 60px ${C.accent}20`,
              filter:
                (1 - heroP) * 8 > 0.3
                  ? `blur(${(1 - heroP) * 8}px)`
                  : undefined,
            }}
          >
            {heroVal.toLocaleString()}+
          </div>
          <div
            style={{
              fontFamily: FONT,
              fontSize: 64,
              fontWeight: 400,
              color: C.textMid,
              marginTop: -20,
            }}
          >
            service businesses trust FlowPilot
          </div>
        </div>

        {/* Metric cards — real dashboard context */}
        {[
          { label: "Customer satisfaction", value: "94%", fillW: 94, color: C.green, delay: 14, x: 300 },
          { label: "Admin time saved", value: "68%", fillW: 68, color: C.cyan, delay: 18, x: 1340 },
          { label: "Faster follow-ups", value: "3×", fillW: 85, color: C.amber, delay: 22, x: 2380 },
        ].map((stat, i) => {
          const p = s(stat.delay, SPR.ui);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: stat.x,
                top: CY + 140,
                width: 980,
                padding: "44px 48px",
                borderRadius: 28,
                background: `linear-gradient(145deg, ${C.surfaceHi}, ${C.surface})`,
                border: `1px solid ${stat.color}20`,
                boxShadow: `0 0 20px ${stat.color}10, 0 12px 36px rgba(0,0,0,0.3)`,
                opacity: p,
                transform: `translateY(${(1 - p) * 40}px)`,
              }}
            >
              <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 500, color: C.textMid, letterSpacing: 1, marginBottom: 12 }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: FONT, fontSize: 80, fontWeight: 700, color: C.text, letterSpacing: -3, marginBottom: 16 }}>
                {stat.value}
              </div>
              <div style={{ height: 10, borderRadius: 5, background: `${stat.color}15`, overflow: "hidden" }}>
                <div style={{ width: `${s(stat.delay + 8) * stat.fillW}%`, height: "100%", borderRadius: 5, background: `linear-gradient(90deg, ${stat.color}, ${stat.color}aa)`, boxShadow: `0 0 8px ${stat.color}40` }} />
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S7: TAGLINE — "Less admin. More momentum."
//
// Visuals: Left side shows admin items being crossed out (email chains,
// manual entry, scattered notes). Right side shows clean forward motion
// (checkmarks, green status, pipeline flowing).
// ═════════════════════════════════════════════════════════════════════════════

const SceneTagline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = (d: number, c = SPR.text) =>
    spring({ frame: Math.max(0, frame - d), fps, config: c });

  const strikeP = s(18, SPR.snap);

  const adminItems = [
    "Manual data entry",
    "Chasing follow-ups",
    "Scattered notes",
    "Missed callbacks",
  ];

  const momentumItems = [
    "Automated reminders",
    "Clear pipeline",
    "Team visibility",
    "Happy clients",
  ];

  return (
    <SceneFade dur={65} fadeIn={8} fadeOut={8}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* "Less admin" — left side with strike-throughs */}
        <div style={{ position: "absolute", left: 480, top: CY - 300 }}>
          {adminItems.map((item, i) => {
            const itemP = s(8 + i * 4, SPR.ui);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 28,
                  opacity: itemP,
                  transform: `translateX(${(1 - itemP) * -40}px)`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: `${C.red}15`,
                    border: `1.5px solid ${C.red}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24">
                    <path d="M6 6l12 12M6 18L18 6" stroke={C.red} strokeWidth={2.5} strokeLinecap="round" opacity={strikeP} />
                  </svg>
                </div>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 40,
                    fontWeight: 400,
                    color: C.textDim,
                    textDecoration: strikeP > 0.5 ? "line-through" : "none",
                    textDecorationColor: C.red,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>

        {/* "More momentum" — right side with checkmarks */}
        <div style={{ position: "absolute", left: 2100, top: CY - 300 }}>
          {momentumItems.map((item, i) => {
            const itemP = s(14 + i * 4, SPR.ui);
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 28,
                  opacity: itemP,
                  transform: `translateX(${(1 - itemP) * 40}px)`,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: itemP > 0.8 ? C.green : "transparent",
                    border: `1.5px solid ${C.green}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: itemP > 0.8 ? `0 0 12px ${C.green}40` : "none",
                  }}
                >
                  {itemP > 0.8 && (
                    <svg width={18} height={18} viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 40,
                    fontWeight: 500,
                    color: C.text,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>

        {/* Tagline */}
        <WordLine
          y={CY + 280}
          words={[
            { text: "Less", weight: 300, color: C.textDim },
            { text: "admin.", weight: 700, color: C.red },
            { text: "More", weight: 300, color: C.textDim },
            { text: "momentum.", weight: 700, color: C.green },
          ]}
          size={140}
          stagger={6}
          baseDelay={8}
        />
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// S8: CTA — "Try FlowPilot free"
// ═════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const txt = (d: number) =>
    spring({ frame: Math.max(0, frame - d), fps, config: SPR.text });
  const cta = (d: number) =>
    spring({
      frame: Math.max(0, frame - d),
      fps,
      config: { stiffness: 120, damping: 18, mass: 0.9 },
    });

  return (
    <SceneFade dur={40} fadeIn={6} fadeOut={1}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        {/* Brand name */}
        {(() => {
          const p = txt(3);
          const blur = (1 - p) * 12;
          return (
            <div
              style={{
                position: "absolute",
                left: CX,
                top: CY - 180,
                transform: `translate(-50%, -50%) scale(${0.9 + p * 0.1})`,
                fontFamily: FONT,
                fontSize: 220,
                fontWeight: 700,
                color: C.text,
                letterSpacing: -6,
                opacity: p,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
                textShadow: `0 0 60px ${C.accent}25`,
              }}
            >
              FlowPilot
            </div>
          );
        })()}

        {/* CTA button */}
        {(() => {
          const p = cta(8);
          const pulse = 1 + Math.sin(frame * 0.05) * 0.012 * p;
          return (
            <div
              style={{
                position: "absolute",
                left: CX,
                top: CY + 40,
                transform: `translate(-50%, -50%) scale(${(0.7 + p * 0.3) * pulse})`,
                opacity: p,
              }}
            >
              <div
                style={{
                  padding: "36px 90px",
                  borderRadius: 200,
                  background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
                  boxShadow: `0 0 40px ${C.accent}40, 0 12px 48px rgba(0,0,0,0.3)`,
                }}
              >
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 64,
                    fontWeight: 600,
                    color: C.white,
                    letterSpacing: -1,
                  }}
                >
                  Try FlowPilot Free
                </span>
              </div>
            </div>
          );
        })()}

        {/* Tagline echo */}
        {(() => {
          const p = txt(12);
          return (
            <div
              style={{
                position: "absolute",
                left: CX,
                top: CY + 200,
                transform: "translate(-50%, -50%)",
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
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const FlowPilotAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <Sequence from={0} durationInFrames={95}>
        <SceneHook />
      </Sequence>

      <Sequence from={88} durationInFrames={97}>
        <SceneProblem />
      </Sequence>

      <Sequence from={178} durationInFrames={87}>
        <SceneShift />
      </Sequence>

      <Sequence from={258} durationInFrames={97}>
        <SceneProduct />
      </Sequence>

      <Sequence from={348} durationInFrames={92}>
        <SceneFeatures />
      </Sequence>

      <Sequence from={433} durationInFrames={77}>
        <SceneStats />
      </Sequence>

      <Sequence from={503} durationInFrames={65}>
        <SceneTagline />
      </Sequence>

      <Sequence from={560} durationInFrames={40}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
