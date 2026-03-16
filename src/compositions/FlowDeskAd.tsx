/**
 * FlowDesk V2 — "YOUR WORK. SIMPLIFIED."
 *
 * Productivity SaaS, 1:1 square (1080×1080)
 * Concept: Bold editorial — chaos → clarity, not dashboard screenshots
 * Palette: Light editorial (near-white + deep indigo + hot pink)
 * Motion: Word-slam reveal, full-screen kanban fill, editorial stat moments, full-bleed CTA
 *
 * Scene layout (30 fps, 450 total = 15s):
 *   Scene 1   0–90f   (3.0s) WORD SLAM  — "YOUR WORK. SIMPLIFIED." — editorial, full-canvas
 *   Scene 2  90–255f  (5.5s) KANBAN     — Full-screen board fills with large real-looking tasks
 *   Scene 3 255–390f  (4.5s) STATS      — One massive editorial stat per beat
 *   Scene 4 390–450f  (2.0s) CTA        — Full-bleed, minimal, confident
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

/* ─── BRAND TOKENS ─── */
const C = {
  bg:      "#F7F4FF",   // soft lavender-white
  surface: "#EDE8FC",
  card:    "#FFFFFF",
  primary: "#3B1F5E",   // deep plum-purple
  accent:  "#7C3AED",   // vivid violet
  hot:     "#F72585",   // hot pink
  text:    "#1A0A2E",   // near-black purple
  body:    "#8B7BA8",   // muted purple
  border:  "#DDD5F5",
  dim:     "#B8B0CC",
  lime:    "#84CC16",   // bright lime (done)
  amber:   "#F59E0B",   // amber (in-progress)
  coral:   "#FF6B6B",   // coral (blocked)
};

/* ─── EASING ─── */
const easeOut3  = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const easeOut4  = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const easeSnap  = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);

/* ─── SUBTLE GRID BACKGROUND ─── */
const GridBg: React.FC<{ color?: string; opacity?: number }> = ({
  color = C.accent,
  opacity = 0.055,
}) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `
        linear-gradient(${color}22 1px, transparent 1px),
        linear-gradient(90deg, ${color}22 1px, transparent 1px)
      `,
      backgroundSize: "54px 54px",
      opacity,
      pointerEvents: "none",
    }}
  />
);

/* ─── SCENE 1: WORD SLAM ─── */
const SceneWordSlam: React.FC = () => {
  const frame = useCurrentFrame();

  const yourT  = easeOut4(Math.min(frame / 14, 1));
  const workT  = easeOut4(Math.max(0, Math.min((frame - 10) / 14, 1)));
  const lineT  = easeOut3(Math.max(0, Math.min((frame - 22) / 12, 1)));
  const simpT  = easeSnap(Math.max(0, Math.min((frame - 26) / 14, 1)));
  const badgeT = easeOut3(Math.max(0, Math.min((frame - 52) / 18, 1)));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <GridBg opacity={0.05} />

      {/* Watermark glyph */}
      <div
        style={{
          position: "absolute",
          right: -80,
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: 680,
          fontWeight: 900,
          color: C.accent,
          fontFamily: "system-ui, sans-serif",
          opacity: 0.035,
          letterSpacing: -30,
          lineHeight: 1,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        F
      </div>

      {/* Main text block — left-anchored, vertical center */}
      <div
        style={{
          position: "absolute",
          left: 72, right: 72,
          top: "50%",
          transform: "translateY(-52%)",
        }}
      >
        {/* "YOUR" */}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontSize: 196,
              fontWeight: 900,
              color: C.text,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -8,
              lineHeight: 0.92,
              textTransform: "uppercase",
              transform: `translateX(${(1 - yourT) * 180}px)`,
              opacity: yourT,
            }}
          >
            YOUR
          </div>
        </div>

        {/* "WORK." */}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontSize: 196,
              fontWeight: 900,
              color: C.accent,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -8,
              lineHeight: 0.92,
              textTransform: "uppercase",
              transform: `translateX(${(1 - workT) * 180}px)`,
              opacity: workT,
            }}
          >
            WORK.
          </div>
        </div>

        {/* Divider line — sweeps in */}
        <div
          style={{
            height: 5,
            background: C.hot,
            borderRadius: 3,
            marginTop: 28,
            marginBottom: 28,
            width: `${lineT * 100}%`,
            maxWidth: 900,
          }}
        />

        {/* "SIMPLIFIED." */}
        <div style={{ overflow: "hidden" }}>
          <div
            style={{
              fontSize: 112,
              fontWeight: 900,
              color: C.primary,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -4,
              lineHeight: 1,
              textTransform: "uppercase",
              transform: `translateY(${(1 - simpT) * 90}px)`,
              opacity: simpT,
            }}
          >
            SIMPLIFIED.
          </div>
        </div>
      </div>

      {/* FlowDesk badge — bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: 72,
          right: 72,
          opacity: badgeT,
          transform: `translateY(${(1 - badgeT) * 18}px)`,
          textAlign: "right",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: `${C.accent}12`,
            border: `1.5px solid ${C.border}`,
            borderRadius: 100,
            padding: "12px 28px",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.accent }} />
          <span style={{ fontSize: 22, fontWeight: 800, color: C.accent, fontFamily: "system-ui, sans-serif" }}>
            FlowDesk
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── KANBAN CARD ─── */
const KanbanCard: React.FC<{
  title: string;
  tag: string;
  tagColor: string;
  statusDot: string;
  startFrame: number;
  fromDir: "top" | "bottom";
}> = ({ title, tag, tagColor, statusDot, startFrame, fromDir }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const t = easeSnap(Math.max(0, Math.min(localFrame / 18, 1)));
  const fromY = fromDir === "top" ? -60 : 60;
  const opacity = interpolate(t, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        background: C.card,
        border: `1.5px solid ${C.border}`,
        borderRadius: 18,
        padding: "20px 22px",
        transform: `translateY(${fromY * (1 - t)}px)`,
        opacity,
        boxShadow: `0 4px 20px rgba(60,31,94,0.07)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: statusDot }} />
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: tagColor,
            fontFamily: "system-ui, sans-serif",
            background: `${tagColor}14`,
            border: `1px solid ${tagColor}30`,
            borderRadius: 8,
            padding: "3px 10px",
          }}
        >
          {tag}
        </span>
      </div>
      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: C.text,
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.35,
        }}
      >
        {title}
      </div>
    </div>
  );
};

/* ─── SCENE 2: KANBAN (fills entire 1080×1080) ─── */
const SceneKanban: React.FC = () => {
  const frame = useCurrentFrame();

  const headerT = easeOut3(Math.min(frame / 14, 1));

  const COLUMNS = [
    {
      label: "📋 TO DO",
      color: C.body,
      colDelay: 0,
      cards: [
        { title: "User research interviews", tag: "Research", tagColor: C.accent, dot: C.body, delay: 6, dir: "top" as const },
        { title: "Redesign onboarding flow", tag: "Design", tagColor: C.hot, dot: C.body, delay: 16, dir: "bottom" as const },
        { title: "Q4 budget planning", tag: "Finance", tagColor: C.amber, dot: C.body, delay: 26, dir: "top" as const },
      ],
    },
    {
      label: "⚡ IN PROGRESS",
      color: C.amber,
      colDelay: 14,
      cards: [
        { title: "API integrations v2", tag: "Engineering", tagColor: C.accent, dot: C.amber, delay: 20, dir: "top" as const },
        { title: "Marketing campaign Q4", tag: "Marketing", tagColor: C.hot, dot: C.amber, delay: 30, dir: "bottom" as const },
        { title: "Dashboard redesign", tag: "Design", tagColor: C.lime, dot: C.amber, delay: 40, dir: "top" as const },
      ],
    },
    {
      label: "✅ DONE",
      color: C.lime,
      colDelay: 28,
      cards: [
        { title: "Team kick-off & alignment", tag: "Strategy", tagColor: C.accent, dot: C.lime, delay: 34, dir: "top" as const },
        { title: "Design system v1.0", tag: "Design", tagColor: C.hot, dot: C.lime, delay: 44, dir: "bottom" as const },
        { title: "Beta launch — 500 users", tag: "Growth", tagColor: C.lime, dot: C.lime, delay: 54, dir: "top" as const },
      ],
    },
  ];

  // Column width: (1080 - 48 - 32) / 3 = 333px each (48 = side pads, 32 = 2 gaps)
  const colW = 333;
  const colGap = 16;
  const sidePad = 24;
  const headerH = 80;
  const colHeaderH = 52;
  const cardGap = 12;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <GridBg opacity={0.04} />

      {/* App header */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: headerH,
          background: `${C.card}F8`,
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          padding: "0 24px",
          gap: 20,
          opacity: headerT,
          transform: `translateY(${(1 - headerT) * -20}px)`,
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 900, color: C.accent, fontFamily: "system-ui, sans-serif" }}>
          FlowDesk
        </span>
        <div style={{ flex: 1 }} />
        {["Board", "Timeline", "Reports"].map((item) => (
          <span key={item} style={{ fontSize: 16, color: item === "Board" ? C.accent : C.body, fontFamily: "system-ui, sans-serif", fontWeight: item === "Board" ? 700 : 500 }}>
            {item}
          </span>
        ))}
        {/* Avatar dots */}
        {[C.accent, C.hot, C.lime].map((col, i) => (
          <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", background: col, border: "2px solid white", marginLeft: i > 0 ? -10 : 8 }} />
        ))}
      </div>

      {/* Three kanban columns */}
      {COLUMNS.map((col, ci) => {
        const colT = easeOut3(Math.max(0, Math.min((frame - col.colDelay) / 16, 1)));
        const left = sidePad + ci * (colW + colGap);

        return (
          <div
            key={ci}
            style={{
              position: "absolute",
              left,
              top: headerH + 16,
              width: colW,
              bottom: 20,
              opacity: colT,
              transform: `translateY(${(1 - colT) * 24}px)`,
            }}
          >
            {/* Column header */}
            <div
              style={{
                height: colHeaderH,
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingBottom: 12,
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 800, color: col.color, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 0.8 }}>
                {col.label}
              </span>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: col.color,
                  fontFamily: "system-ui, sans-serif",
                  background: `${col.color}16`,
                  border: `1px solid ${col.color}30`,
                  borderRadius: 100,
                  padding: "2px 10px",
                }}
              >
                {col.cards.length}
              </div>
            </div>

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: cardGap }}>
              {col.cards.map((card, ki) => (
                <KanbanCard
                  key={ki}
                  title={card.title}
                  tag={card.tag}
                  tagColor={card.tagColor}
                  statusDot={card.dot}
                  startFrame={card.delay}
                  fromDir={card.dir}
                />
              ))}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ─── SCENE 3: EDITORIAL STATS — one massive moment per beat ─── */
const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();

  const BEATS = [
    { number: "3",  unit: "hrs",    label: "saved per person, every day",  color: C.accent, start: 0,  end: 44 },
    { number: "47", unit: "%",      label: "faster project completion",     color: C.hot,    start: 44, end: 90 },
    { number: "0",  unit: "",       label: "missed deadlines. Guaranteed.", color: C.lime,   start: 90, end: 135 },
  ];

  const activeBeat = BEATS.find((b) => frame >= b.start && frame < b.end) ?? BEATS[BEATS.length - 1];
  const localFrame = frame - activeBeat.start;
  const beatT = easeSnap(Math.min(localFrame / 18, 1));
  const fadeOut = activeBeat.end !== 135 ? interpolate(localFrame, [activeBeat.end - activeBeat.start - 10, activeBeat.end - activeBeat.start], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  const numT = easeOut4(Math.min(localFrame / 14, 1));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <GridBg opacity={0.04} />

      {/* Full-screen radial glow per beat */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${activeBeat.color}10 0%, transparent 65%)`,
          opacity: beatT,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: fadeOut,
        }}
      >
        {/* Label above */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: activeBeat.color,
            fontFamily: "system-ui, sans-serif",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 16,
            opacity: beatT,
            transform: `translateY(${(1 - beatT) * -20}px)`,
          }}
        >
          FlowDesk teams see
        </div>

        {/* Giant number */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
            transform: `scale(${0.7 + numT * 0.3})`,
            opacity: numT,
          }}
        >
          <span
            style={{
              fontSize: 340,
              fontWeight: 900,
              color: activeBeat.color,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -16,
              lineHeight: 0.85,
            }}
          >
            {activeBeat.number}
          </span>
          {activeBeat.unit && (
            <span
              style={{
                fontSize: 100,
                fontWeight: 700,
                color: activeBeat.color,
                fontFamily: "system-ui, sans-serif",
                marginTop: 32,
                opacity: 0.8,
              }}
            >
              {activeBeat.unit}
            </span>
          )}
        </div>

        {/* Label below */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: C.body,
            fontFamily: "system-ui, sans-serif",
            marginTop: 24,
            opacity: beatT,
            transform: `translateY(${(1 - beatT) * 24}px)`,
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          {activeBeat.label}
        </div>

        {/* Dot progress indicator */}
        <div style={{ display: "flex", gap: 12, marginTop: 56 }}>
          {BEATS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === BEATS.indexOf(activeBeat) ? 32 : 10,
                height: 10,
                borderRadius: 5,
                background: i === BEATS.indexOf(activeBeat) ? activeBeat.color : C.border,
                transition: "none",
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── SCENE 4: CTA — full bleed, confident ─── */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT  = easeOut3(Math.min(frame / 16, 1));
  const h1T  = easeOut4(Math.max(0, Math.min((frame - 4)  / 18, 1)));
  const h2T  = easeOut4(Math.max(0, Math.min((frame - 10) / 18, 1)));
  const btnT = easeSnap(Math.max(0, Math.min((frame - 20) / 14, 1)));
  const urlT = easeOut3(Math.max(0, Math.min((frame - 36) / 14, 1)));

  return (
    <AbsoluteFill
      style={{
        background: C.primary,
        opacity: bgT,
      }}
    >
      {/* Subtle grid on dark background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "54px 54px",
        }}
      />

      {/* Glow circle */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.accent}30 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Content — vertically and horizontally centered */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: `${C.accent}CC`,
            fontFamily: "system-ui, sans-serif",
            textTransform: "uppercase",
            letterSpacing: 4,
            marginBottom: 24,
            opacity: h1T,
            transform: `translateY(${(1 - h1T) * -20}px)`,
          }}
        >
          Free to start
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 120,
            fontWeight: 900,
            color: "white",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -5,
            lineHeight: 0.95,
            marginBottom: 12,
            opacity: h1T,
            transform: `translateY(${(1 - h1T) * 40}px)`,
          }}
        >
          FlowDesk
        </div>

        <div
          style={{
            fontSize: 40,
            fontWeight: 500,
            color: "rgba(255,255,255,0.6)",
            fontFamily: "system-ui, sans-serif",
            marginBottom: 60,
            opacity: h2T,
            transform: `translateY(${(1 - h2T) * 30}px)`,
          }}
        >
          Work without the chaos.
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${btnT})`,
            opacity: btnT,
            transformOrigin: "center",
          }}
        >
          <div
            style={{
              background: C.hot,
              borderRadius: 24,
              padding: "28px 88px",
              fontSize: 32,
              fontWeight: 900,
              color: "white",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -0.5,
              boxShadow: `0 12px 40px ${C.hot}50`,
            }}
          >
            Start Free →
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: 28,
            fontSize: 20,
            color: "rgba(255,255,255,0.35)",
            fontFamily: "monospace",
            opacity: urlT,
          }}
        >
          flowdesk.io · No credit card needed
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── ROOT ─── */
export const FlowDeskAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence from={0}   durationInFrames={90}><SceneWordSlam /></Sequence>
      <Sequence from={90}  durationInFrames={165}><SceneKanban /></Sequence>
      <Sequence from={255} durationInFrames={135}><SceneStats /></Sequence>
      <Sequence from={390} durationInFrames={60}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
};
