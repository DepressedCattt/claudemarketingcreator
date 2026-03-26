import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  interpolateColors,
} from "remotion";

const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

const C = {
  bg: "#f2f2f2",
  blue: "#4b63e9",
  pink: "#f75d7f",
  yellow: "#fcbc05",
  white: "#ffffff",
  black: "#000000",
  nearWhite: "#fefefe",
  gray: "#c8c9c3",
  darkBlue: "#3b53e9",
};

// ═══════ Spring presets — consistent across all components ═══════
const SPR = {
  enter: { stiffness: 100, damping: 20 },
  exit: { stiffness: 200, damping: 28 },
  bounce: { stiffness: 120, damping: 14, mass: 0.8 },
  soft: { stiffness: 60, damping: 18, mass: 1.2 },
  snappy: { stiffness: 180, damping: 22 },
};

// ═══════ SVG Paths extracted from AE ═══════
const HAND_SVG =
  "M 272.0,57.9 C 271.1,60.3 312.0,229.1 312.0,229.1 C 312.0,229.1 334.4,304.8 334.4,304.8 C 334.4,304.8 275.0,237.8 274.4,237.2 C 263.6,232.0 247.8,234.4 236.6,245.3 C 220.2,261.1 240.1,287.0 240.1,287.0 C 240.1,287.0 346.8,408.7 353.8,412.2 C 360.8,415.7 378.7,404.0 381.5,408.9 C 384.3,413.9 392.8,456.2 394.7,461.9 C 395.2,463.3 536.9,425.7 540.4,424.3 C 543.9,422.9 525.4,382.0 530.3,376.4 C 535.2,370.7 554.8,367.9 559.6,360.9 C 559.7,360.7 530.4,235.5 530.4,235.5 C 530.4,235.5 519.6,181.3 502.8,179.8 C 479.8,177.8 474.3,212.8 474.3,212.8 C 474.3,212.8 471.3,163.2 443.2,160.5 C 418.3,158.0 418.3,199.9 418.3,199.9 C 418.3,199.9 410.7,150.7 386.8,149.0 C 346.3,146.1 368.7,211.9 368.7,211.9 C 368.7,211.9 329.2,52.6 329.4,51.8 C 322.9,30.5 284.6,23.4 272.0,57.9 Z";
const ARROW_SVG =
  "M -368.0,688.0 L -378.7,882.7 L -330.7,818.7 L -245.3,845.3 Z";
const LINE_6 =
  "M 33.2,22.6 C 33.2,22.6 274.3,-421.7 -278.3,-329.6 C -831.0,-237.5 -997.5,1149.7 -333.6,773.9 C 453.1,328.7 -829.7,-1018.3 -2092.5,-818.3";
const LINE_7 =
  "M -633.5,8.9 C -633.5,8.9 1786.7,384.0 512.7,12.7 C -71.9,-157.7 3632.0,-572.0 2432.7,-1174.6";
const LINE_8 =
  "M 893.3,-542.6 C 893.3,-542.6 944.2,-427.1 1017.7,-430.2 C 1091.2,-433.4 1087.0,-518.6 1183.5,-519.6 C 1296.0,-520.9 1276.9,-413.1 1389.1,-411.6 C 1501.3,-410.0 1555.3,-452.7 1555.3,-452.7";
const LINE_9 =
  "M 882.6,-393.4 C 882.6,-393.4 917.3,-473.2 990.8,-476.3 C 1064.3,-479.5 1090.7,-415.1 1187.2,-416.2 C 1299.7,-417.5 1325.0,-576.7 1437.2,-575.1 C 1549.4,-573.5 1549.4,-471.6 1549.4,-471.6";

// ═══════ Text System Types ═══════

interface WordDef {
  text: string;
  enter: number;
  font: "light" | "semi" | "bold" | "boldIt" | "normal";
  colorShifts: { f: number; c: string }[];
}

interface PhraseConfig {
  words: WordDef[];
  sceneStart: number;
  sceneEnd: number;
  y?: number;
  fontSize?: number;
  gap?: number;
}

const FONT_STYLES: Record<string, React.CSSProperties> = {
  light: { fontWeight: 300, fontStyle: "italic" },
  semi: { fontWeight: 600, fontStyle: "italic" },
  bold: { fontWeight: 700, fontStyle: "normal" },
  boldIt: { fontWeight: 700, fontStyle: "italic" },
  normal: { fontWeight: 400, fontStyle: "italic" },
};

function wordColor(frame: number, shifts: { f: number; c: string }[]): string {
  if (shifts.length === 0) return C.black;
  if (shifts.length === 1) return shifts[0].c;
  if (frame <= shifts[0].f) return shifts[0].c;
  if (frame >= shifts[shifts.length - 1].f) return shifts[shifts.length - 1].c;
  for (let i = 0; i < shifts.length - 1; i++) {
    if (frame >= shifts[i].f && frame <= shifts[i + 1].f) {
      return interpolateColors(
        frame,
        [shifts[i].f, shifts[i + 1].f],
        [shifts[i].c, shifts[i + 1].c],
      );
    }
  }
  return shifts[shifts.length - 1].c;
}

// ═══════ SceneText — phrase-based text with spring enter/exit ═══════

const SceneText: React.FC<{ phrase: PhraseConfig }> = ({ phrase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = phrase.sceneEnd - phrase.sceneStart;
  const fontSize = phrase.fontSize ?? 200;
  const y = phrase.y ?? CY;

  const exitFade = interpolate(frame, [dur - 10, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitSlide = interpolate(frame, [dur - 10, dur], [0, -200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: exitFade }}>
      {phrase.words.map((w, i) => {
        const p = spring({
          frame: Math.max(0, frame - w.enter),
          fps,
          config: SPR.enter,
        });
        const slideX = (1 - p) * 400 + exitSlide * (1 - exitFade < 0.01 ? 0 : 1);
        const scaleOvershoot = interpolate(p, [0, 0.7, 1], [0.8, 1.06, 1]);
        const clr = wordColor(frame, w.colorShifts);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left:
                CX +
                (i - (phrase.words.length - 1) / 2) * (phrase.gap ?? 500),
              top: y,
              transform: `translate(-50%, -50%) translateX(${slideX}px) scale(${scaleOvershoot})`,
              fontFamily: "Gibson, 'Segoe UI', system-ui, sans-serif",
              fontSize,
              ...FONT_STYLES[w.font],
              color: clr,
              whiteSpace: "pre",
              lineHeight: 1,
              opacity: p,
              textShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            {w.text}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════ 8 Scene Phrase Definitions ═══════

const SCENES: PhraseConfig[] = [
  {
    sceneStart: 0,
    sceneEnd: 78,
    y: CY,
    gap: 420,
    words: [
      {
        text: "Most",
        enter: 0,
        font: "light",
        colorShifts: [
          { f: 0, c: C.yellow },
          { f: 10, c: C.black },
        ],
      },
      {
        text: "workdays",
        enter: 9,
        font: "light",
        colorShifts: [
          { f: 0, c: C.pink },
          { f: 8, c: C.black },
        ],
      },
      {
        text: "start",
        enter: 16,
        font: "light",
        colorShifts: [{ f: 0, c: C.black }],
      },
      {
        text: "with noise.",
        enter: 24,
        font: "semi",
        colorShifts: [
          { f: 0, c: C.blue },
          { f: 12, c: C.black },
          { f: 23, c: C.blue },
        ],
      },
    ],
  },
  {
    sceneStart: 78,
    sceneEnd: 140,
    y: CY,
    gap: 500,
    words: [
      {
        text: "Not enough",
        enter: 0,
        font: "light",
        colorShifts: [{ f: 0, c: C.nearWhite }],
      },
      {
        text: "focus?",
        enter: 4,
        font: "semi",
        colorShifts: [{ f: 0, c: C.nearWhite }],
      },
    ],
  },
  {
    sceneStart: 140,
    sceneEnd: 205,
    y: CY - 20,
    gap: 440,
    words: [
      {
        text: "Drag your",
        enter: 0,
        font: "light",
        colorShifts: [
          { f: 0, c: C.blue },
          { f: 8, c: C.black },
          { f: 15, c: C.yellow },
          { f: 25, c: C.black },
        ],
      },
      {
        text: "tasks",
        enter: 4,
        font: "semi",
        colorShifts: [
          { f: 0, c: C.blue },
          { f: 6, c: C.black },
          { f: 27, c: C.blue },
        ],
      },
    ],
  },
  {
    sceneStart: 205,
    sceneEnd: 278,
    y: CY,
    gap: 460,
    words: [
      {
        text: "switch",
        enter: 0,
        font: "light",
        colorShifts: [
          { f: 0, c: C.yellow },
          { f: 6, c: C.black },
          { f: 66, c: C.blue },
        ],
      },
      {
        text: "focus",
        enter: 2,
        font: "semi",
        colorShifts: [
          { f: 0, c: C.pink },
          { f: 8, c: C.black },
          { f: 26, c: C.blue },
          { f: 32, c: C.black },
          { f: 58, c: C.blue },
        ],
      },
    ],
  },
  {
    sceneStart: 278,
    sceneEnd: 421,
    y: CY,
    fontSize: 175,
    gap: 0,
    words: [
      {
        text: "Teams using",
        enter: 0,
        font: "light",
        colorShifts: [{ f: 0, c: C.white }],
      },
      {
        text: "Focusly",
        enter: 3,
        font: "semi",
        colorShifts: [{ f: 0, c: C.white }],
      },
    ],
  },
  {
    sceneStart: 370,
    sceneEnd: 450,
    y: CY,
    gap: 520,
    words: [
      {
        text: "Used by",
        enter: 0,
        font: "light",
        colorShifts: [
          { f: 0, c: C.yellow },
          { f: 10, c: C.black },
        ],
      },
      {
        text: "2,000+ teams",
        enter: 7,
        font: "boldIt",
        colorShifts: [
          { f: 0, c: C.pink },
          { f: 8, c: C.blue },
        ],
      },
    ],
  },
  {
    sceneStart: 442,
    sceneEnd: 525,
    y: CY,
    gap: 420,
    words: [
      {
        text: "More",
        enter: 0,
        font: "normal",
        colorShifts: [{ f: 0, c: C.black }],
      },
      {
        text: "deep work.",
        enter: 8,
        font: "semi",
        colorShifts: [{ f: 0, c: C.blue }],
      },
      {
        text: "Fewer pings.",
        enter: 18,
        font: "normal",
        colorShifts: [{ f: 0, c: C.black }],
      },
    ],
  },
  {
    sceneStart: 525,
    sceneEnd: 600,
    y: CY,
    gap: 400,
    words: [
      {
        text: "Try Focusly",
        enter: 0,
        font: "normal",
        colorShifts: [{ f: 0, c: C.blue }],
      },
      {
        text: "for free",
        enter: 5,
        font: "semi",
        colorShifts: [
          { f: 0, c: C.blue },
          { f: 15, c: C.pink },
        ],
      },
    ],
  },
];

// ═══════ Scene 5 stacked text — "Teams using / Focusly" ═══════

const BrandText: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p1 = spring({ frame, fps, config: SPR.enter });
  const p2 = spring({
    frame: Math.max(0, frame - 3),
    fps,
    config: SPR.enter,
  });
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: CX,
          top: CY - 100,
          transform: `translate(-50%, -50%) translateY(${(1 - p1) * 60}px)`,
          fontFamily: "Gibson, 'Segoe UI', system-ui, sans-serif",
          fontSize: 175,
          fontWeight: 300,
          fontStyle: "italic",
          color: C.white,
          opacity: p1,
          textShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        Teams using
      </div>
      <div
        style={{
          position: "absolute",
          left: CX + 4,
          top: CY + 100,
          transform: `translate(-50%, -50%) translateY(${(1 - p2) * 60}px)`,
          fontFamily: "Gibson, 'Segoe UI', system-ui, sans-serif",
          fontSize: 175,
          fontWeight: 600,
          fontStyle: "italic",
          color: C.white,
          opacity: p2,
          textShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
      >
        Focusly
      </div>
    </>
  );
};

// ═══════ "daily tasks" label on folder ═══════

const FolderLabel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: SPR.enter,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: CX + 6,
        top: CY + 305,
        transform: `translate(-50%, -50%) scale(${p})`,
        fontFamily: "Gibson, 'Segoe UI', system-ui, sans-serif",
        fontSize: 107,
        fontWeight: 700,
        color: C.white,
        opacity: p,
        textShadow: "0 2px 8px rgba(0,0,0,0.2)",
      }}
    >
      daily tasks
    </div>
  );
};

// ═══════ Scene Transition Wrapper ═══════

const SceneFade: React.FC<{
  children: React.ReactNode;
  fadeIn?: number;
  fadeOut?: number;
  dur: number;
}> = ({ children, fadeIn = 8, fadeOut = 8, dur }) => {
  const frame = useCurrentFrame();
  const enterOp =
    fadeIn > 0
      ? interpolate(frame, [0, fadeIn], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const exitOp =
    fadeOut > 0
      ? interpolate(frame, [dur - fadeOut, dur], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  const exitScale =
    fadeOut > 0
      ? interpolate(frame, [dur - fadeOut, dur], [1, 0.97], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;
  return (
    <AbsoluteFill
      style={{
        opacity: Math.min(enterOp, exitOp),
        transform: `scale(${exitScale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

// ═══════ Decorative Stroke Lines (draw-on effect) ═══════

const StrokeLine: React.FC<{
  d: string;
  color: string;
  strokeW: number;
}> = ({ d, color, strokeW }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: SPR.soft });
  return (
    <svg
      style={{
        position: "absolute",
        left: CX,
        top: CY,
        overflow: "visible",
        opacity: p * 0.6,
      }}
      width="1"
      height="1"
      viewBox="0 0 1 1"
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeDasharray="2000"
        strokeDashoffset={2000 * (1 - p)}
        strokeLinecap="round"
      />
    </svg>
  );
};

// ═══════ Soft Blob (replaces InkDot with radial gradient blur) ═══════

const SoftBlob: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay?: number;
}> = ({ x, y, size, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPR.soft,
  });
  const pulse = 1 + Math.sin(frame * 0.06) * 0.08;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}35 0%, ${color}00 70%)`,
        transform: `scale(${p * pulse})`,
        opacity: p * 0.7,
        filter: "blur(40px)",
      }}
    />
  );
};

// ═══════ Liquid Blobs (simplified: 2-3 per layer) ═══════

const LiquidBlobs: React.FC<{
  color: string;
  count: number;
  seed: number;
}> = ({ color, count, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const s = seed + i * 11.7;
        const cx = (Math.sin(s * 3.7) * 0.35 + 0.5) * W;
        const cy = (Math.cos(s * 2.3) * 0.35 + 0.5) * H;
        const size = 250 + (i % 3) * 140;
        const p = spring({
          frame: Math.max(0, frame - i * 4),
          fps,
          config: SPR.soft,
        });
        const mx = Math.sin(frame * 0.03 + s) * 50;
        const my = Math.cos(frame * 0.025 + s * 1.4) * 40;
        const b1 = 40 + Math.sin(frame * 0.04 + s * 2) * 10;
        const b2 = 60 - Math.sin(frame * 0.035 + s * 3) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + mx,
              top: cy + my - (1 - p) * 400,
              width: size * p,
              height: size * p,
              borderRadius: `${b1}% ${b2}% ${b1}% ${b2}%`,
              background: `radial-gradient(circle at 35% 35%, ${color}45, ${color}00)`,
              filter: "blur(40px)",
              transform: `rotate(${frame * 0.4 + s * 15}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

// ═══════ Arrow Cursor (clean motion path) ═══════

const ArrowCursor: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation?: number;
}> = ({ startX, startY, endX, endY, rotation = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: SPR.bounce });
  const x = startX + (endX - startX) * p;
  const y = startY + (endY - startY) * p;
  const rot = rotation * p;
  return (
    <svg
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `rotate(${rot}deg) scale(0.5)`,
        opacity: Math.min(1, p * 2),
        overflow: "visible",
      }}
      width="200"
      height="250"
      viewBox="-400 650 200 250"
    >
      <path d={ARROW_SVG} fill={C.black} stroke={C.white} strokeWidth={3} />
    </svg>
  );
};

// ═══════ UI Cards with frosted glass (scene 2) ═══════

const UICard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
}> = ({ x, y, w, h, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: SPR.bounce,
  });
  const wy = Math.sin(frame * 0.04 + x * 0.003) * 8;
  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2 + wy,
        width: w,
        height: h,
        borderRadius: 18,
        background: `linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(248,248,250,0.75) 100%)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1.5px solid rgba(255,255,255,0.4)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)",
        opacity: p,
        transform: `scale(${0.6 + p * 0.4}) translateY(${(1 - p) * 40}px)`,
        padding: 14,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: C.pink,
          }}
        />
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: C.yellow,
          }}
        />
        <div
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: C.gray,
          }}
        />
      </div>
      {[0, 1, 2, 3].map((j) => (
        <div
          key={j}
          style={{
            height: 20,
            borderRadius: 8,
            marginBottom: 6,
            background:
              j === 0
                ? `${C.blue}18`
                : j === 1
                  ? `${C.yellow}12`
                  : "#f0f0f0",
            width: j === 3 ? "55%" : "90%",
          }}
        />
      ))}
    </div>
  );
};

// ═══════ Counter ═══════

const Counter: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: SPR.enter });
  const val = Math.round(p * 43);
  return (
    <div
      style={{
        position: "absolute",
        left: CX,
        top: CY,
        transform: `translate(-50%, -50%) scale(${0.8 + p * 0.2})`,
        fontFamily: "Gibson, 'Segoe UI', system-ui, sans-serif",
        fontSize: 350,
        fontWeight: 500,
        color: C.white,
        opacity: p,
        textShadow: "0 4px 20px rgba(0,0,0,0.12)",
      }}
    >
      {`${val}%`}
    </div>
  );
};

// ═══════ Hand Cursor with drag animation toward folder ═══════

const HandCursor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterP = spring({ frame, fps, config: SPR.enter });
  const dragP = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { stiffness: 40, damping: 16, mass: 1.5 },
  });
  const x = 2500 + (2100 - 2500) * dragP;
  const y = 1600 + (1300 - 1600) * dragP;
  return (
    <svg
      style={{
        position: "absolute",
        left: x - 200,
        top: y - 130,
        transform: `scale(${0.45 * enterP})`,
        opacity: enterP,
        filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.12))",
      }}
      width="788"
      height="475"
      viewBox="0 0 788 475"
      overflow="visible"
    >
      <path d={HAND_SVG} fill={C.white} stroke={C.black} strokeWidth={5} />
    </svg>
  );
};

// ═══════ Folder + Sheets with wobble ═══════

const FolderScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterP = spring({ frame, fps, config: SPR.bounce });
  const exitP = spring({
    frame: Math.max(0, frame - 50),
    fps,
    config: SPR.exit,
  });
  const folderScale = enterP * (1 - Math.max(0, exitP - 0.3) * 1.4) * 3;

  const sheets = [
    { delay: 8, pos: [-24, 228], rot0: -27, rot1: -6, accent: C.blue },
    { delay: 12, pos: [42, 252], rot0: -25, rot1: -4, accent: C.yellow },
    { delay: 16, pos: [77, 222], rot0: -19, rot1: 2, accent: C.pink },
    { delay: 20, pos: [116, 253], rot0: -19, rot1: 9, accent: C.blue },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: CX - 426,
        top: CY - 817,
        transform: `scale(${folderScale})`,
        transformOrigin: "center center",
      }}
    >
      {/* Folder shadow */}
      <div
        style={{
          position: "absolute",
          left: 10,
          top: 10,
          width: 200,
          height: 150,
          borderRadius: 24,
          background: `${C.blue}25`,
          filter: "blur(32px)",
        }}
      />
      {/* Folder body */}
      <div
        style={{
          position: "absolute",
          width: 200,
          height: 150,
          borderRadius: 24,
          background: `linear-gradient(145deg, ${C.blue} 0%, ${C.darkBlue} 100%)`,
          boxShadow: `0 20px 60px ${C.black}25, inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      />

      {sheets.map((sh, i) => {
        const sp = spring({
          frame: Math.max(0, frame - sh.delay),
          fps,
          config: SPR.bounce,
        });
        const rot = sh.rot0 + (sh.rot1 - sh.rot0) * sp;
        const wobble = Math.sin(frame * 0.06 + i * 2) * 1.5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sh.pos[0] - 80,
              top: sh.pos[1] - 80,
              width: 160,
              height: 160,
              borderRadius: 16,
              background: `linear-gradient(180deg, ${C.white} 0%, #f9f9fb 100%)`,
              border: "1.5px solid rgba(0,0,0,0.06)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
              transform: `scale(${sp * 0.95}) rotate(${rot + wobble}deg)`,
              opacity: sp,
              padding: 12,
            }}
          >
            <div
              style={{
                height: 5,
                width: "65%",
                borderRadius: 3,
                background: sh.accent,
                marginBottom: 10,
              }}
            />
            {[0, 1, 2, 3].map((j) => (
              <div
                key={j}
                style={{
                  height: 13,
                  borderRadius: 5,
                  marginBottom: 5,
                  background: j < 2 ? `${sh.accent}12` : "#f3f3f5",
                  width: j === 3 ? "45%" : "88%",
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ═══════ Kanban Card with shimmer gradient ═══════

const KanbanCard: React.FC<{ w: number; h: number; barCount?: number }> = ({
  w,
  h,
  barCount = 4,
}) => {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 18,
        background: `linear-gradient(180deg, ${C.white} 0%, #fafafa 100%)`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.6)",
        padding: 14,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>
        {[C.pink, C.yellow, C.gray].map((c, i) => (
          <div
            key={i}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
      </div>
      {Array.from({ length: barCount }, (_, j) => {
        const colors = [C.yellow, C.pink, `${C.blue}15`, "#f0f0f0"];
        return (
          <div
            key={j}
            style={{
              height: Math.max(10, h * 0.08),
              borderRadius: 5,
              marginBottom: 5,
              background: colors[j % colors.length],
              width: j === barCount - 1 ? "50%" : "82%",
              opacity: 0.7,
            }}
          />
        );
      })}
    </div>
  );
};

// ═══════ Scene 4: Kanban Boards ═══════

const BOARDS_S4 = [
  { delay: 0, x: 700, y: 600, w: 200, h: 130, rot: -12 },
  { delay: 3, x: 1200, y: 500, w: 200, h: 130, rot: 5 },
  { delay: 6, x: 2500, y: 700, w: 140, h: 140, rot: -8 },
  { delay: 9, x: 3000, y: 500, w: 140, h: 140, rot: 10 },
  { delay: 12, x: 1800, y: 1500, w: 180, h: 120, rot: -15 },
];

const KanbanBoards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {BOARDS_S4.map((b, i) => {
        const p = spring({
          frame: Math.max(0, frame - b.delay),
          fps,
          config: SPR.bounce,
        });
        const wy = Math.sin(frame * 0.03 + i * 2) * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x,
              top: b.y + wy,
              transform: `translate(-50%, -50%) scale(${p}) rotate(${b.rot * p}deg)`,
              opacity: p,
            }}
          >
            <KanbanCard w={b.w} h={b.h} barCount={b.w > 150 ? 5 : 3} />
          </div>
        );
      })}
    </>
  );
};

// ═══════ Scene 5: Concentric Circles with radial glow + pulsing rings ═══════

const ConcentricCircles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterP = spring({ frame, fps, config: SPR.soft });
  const pulse = 1 + Math.sin(frame * 0.04) * 0.03;
  const circleSizes = [800, 1050, 1300];
  const circleRots = [-90.8, 131.6, 0];

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: CX,
          top: CY,
          width: 1600,
          height: 1600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.blue}20 0%, ${C.blue}05 50%, transparent 70%)`,
          transform: `translate(-50%, -50%) scale(${enterP * 1.2})`,
          filter: "blur(60px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: CX,
          top: CY,
          width: 1138,
          height: 1138,
          borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, #5b73f9 0%, ${C.blue} 50%, ${C.darkBlue} 100%)`,
          transform: `translate(-50%, -50%) scale(${enterP * 0.65 * pulse})`,
          boxShadow: `0 0 120px ${C.blue}30`,
        }}
      />

      {circleSizes.map((size, i) => {
        const rp = spring({
          frame: Math.max(0, frame - 5 - i * 4),
          fps,
          config: SPR.soft,
        });
        const opPulse = 0.3 + Math.sin(frame * 0.05 + i * 1.5) * 0.1;
        return (
          <svg
            key={i}
            style={{
              position: "absolute",
              left: CX - size / 2,
              top: CY - size / 2,
              width: size,
              height: size,
              opacity: rp * opPulse,
              transform: `rotate(${circleRots[i] + frame * (i === 1 ? 0.25 : -0.15)}deg)`,
            }}
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={size / 2 - 3}
              fill="none"
              stroke={C.blue}
              strokeWidth={2.5}
              strokeDasharray={`${18 + i * 10} ${10 + i * 5}`}
            />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

// ═══════ Orbiting Icons ═══════

const ORBIT_ICONS = [
  { ox: 700, oy: -250, rot: 2, delay: 14 },
  { ox: 280, oy: 350, rot: 1, delay: 16 },
  { ox: -630, oy: -450, rot: 2, delay: 20 },
  { ox: 30, oy: -450, rot: 1, delay: 21 },
  { ox: -530, oy: 580, rot: 2, delay: 27 },
  { ox: -360, oy: 270, rot: 1, delay: 27 },
];

const OrbitIcons: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rot1 =
    (interpolate(frame, [0, 135], [0, 360], { extrapolateRight: "extend" }) *
      Math.PI) /
    180;
  const rot2 =
    (interpolate(frame, [0, 135], [0, 176], { extrapolateRight: "extend" }) *
      Math.PI) /
    180;

  return (
    <>
      {ORBIT_ICONS.map((ic, i) => {
        const p = spring({
          frame: Math.max(0, frame - ic.delay),
          fps,
          config: SPR.bounce,
        });
        const angle = ic.rot === 2 ? rot2 : rot1;
        const rx =
          Math.cos(angle) * ic.ox - Math.sin(angle) * ic.oy + CX;
        const ry =
          Math.sin(angle) * ic.ox + Math.cos(angle) * ic.oy + CY;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: rx - 48,
              top: ry - 48,
              width: 96,
              height: 96,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${C.white} 0%, #f0f2ff 100%)`,
              border: `1.5px solid rgba(75,99,233,0.1)`,
              boxShadow: `0 6px 24px rgba(75,99,233,0.08)`,
              opacity: p * 0.85,
              transform: `scale(${p * 0.8})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40">
              <rect
                x="8"
                y="12"
                width="24"
                height="16"
                rx="3"
                fill="none"
                stroke={C.blue}
                strokeWidth="2"
                opacity={0.4}
              />
              <circle cx="20" cy="20" r="6" fill={C.blue} opacity={0.2} />
            </svg>
          </div>
        );
      })}
    </>
  );
};

// ═══════ Scene 6: Floating 3D Board Cards ═══════

const BOARDS_3D = [
  { delay: 0, x: 916, yStart: 2800, yEnd: 1281 },
  { delay: 2, x: 1322, yStart: 3200, yEnd: 1881 },
  { delay: 4, x: 2162, yStart: 2800, yEnd: 1292 },
  { delay: 8, x: 3160, yStart: 2400, yEnd: 731 },
  { delay: 10, x: 1246, yStart: 2500, yEnd: 809 },
  { delay: 12, x: 2847, yStart: 3000, yEnd: 1487 },
];

const FloatingBoards: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {BOARDS_3D.map((b, i) => {
        const p = spring({
          frame: Math.max(0, frame - b.delay),
          fps,
          config: SPR.soft,
        });
        const y = b.yStart + (b.yEnd - b.yStart) * p;
        const tiltX = (i % 3 - 1) * 6;
        const exitP = spring({
          frame: Math.max(0, frame - 80),
          fps,
          config: SPR.exit,
        });
        const exitY = exitP * 800;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: b.x - 100,
              top: y + exitY - 130,
              width: 200,
              height: 260,
              borderRadius: 18,
              background: `linear-gradient(180deg, ${C.white} 0%, #fafafa 100%)`,
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow:
                "0 16px 48px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.04)",
              transform: `perspective(1000px) rotateX(${tiltX}deg)`,
              padding: 12,
              overflow: "hidden",
              opacity:
                Math.min(1, p * 2) *
                (1 - Math.max(0, exitP - 0.2) * 1.25),
            }}
          >
            <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
              {[C.pink, C.yellow, C.gray].map((c, j) => (
                <div
                  key={j}
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                height: 14,
                borderRadius: 5,
                background: `${C.blue}12`,
                marginBottom: 6,
                width: "55%",
              }}
            />
            {[0, 1, 2, 3, 4].map((j) => (
              <div
                key={j}
                style={{
                  height: 28,
                  borderRadius: 8,
                  marginBottom: 6,
                  background:
                    j === 0
                      ? `${C.yellow}10`
                      : j === 1
                        ? `${C.blue}06`
                        : "#f5f5f5",
                  border: "1px solid rgba(0,0,0,0.03)",
                }}
              />
            ))}
          </div>
        );
      })}
    </>
  );
};

// ═══════ Drop Circle (scene 7) — increased rings, opacity gradient ═══════

const DropCircle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame,
    fps,
    config: { stiffness: 30, damping: 16, mass: 1.8 },
  });
  const ringCount = 8;
  return (
    <AbsoluteFill>
      {Array.from({ length: ringCount }, (_, i) => {
        const delay = i * 4;
        const rp = spring({
          frame: Math.max(0, frame - delay),
          fps,
          config: { stiffness: 25, damping: 14, mass: 1.5 },
        });
        const r = (160 + i * 65) * rp;
        const op = (1 - i / ringCount) * rp * 0.5;
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
              border: `${Math.max(1, 3 - i * 0.3)}px solid ${C.blue}`,
              opacity: op,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: CX - 10,
          top: CY - 10,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: C.blue,
          opacity: p * 0.7,
          boxShadow: `0 0 60px ${C.blue}50`,
        }}
      />
    </AbsoluteFill>
  );
};

// ═══════ MapBlur (kept with increased opacity per plan) ═══════

const MapBlur: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: SPR.soft });
  const pulse = 1 + Math.sin(frame * 0.03) * 0.05;
  return (
    <div
      style={{
        position: "absolute",
        left: CX - 300,
        top: CY - 300,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${C.blue}30 0%, ${C.blue}08 40%, transparent 70%)`,
        transform: `scale(${p * pulse})`,
        opacity: p * 0.5,
        filter: "blur(50px)",
      }}
    />
  );
};

// ═══════ Background Texture ═══════

const BgTexture: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at 20% 30%, rgba(75,99,233,0.02) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(247,93,127,0.015) 0%, transparent 50%)`,
        pointerEvents: "none",
      }}
    />
  );
};

// ═══════ MAIN COMPOSITION ═══════

export const SaasExplainerAd: React.FC = () => {
  const frame = useCurrentFrame();

  const darkOverlay =
    frame >= 68 && frame <= 145
      ? interpolate(frame, [68, 82, 128, 145], [0, 0.88, 0.88, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <BgTexture />

      {/* ═══ SCENE 1: "Most workdays start with noise." (f0–78) ═══ */}
      <Sequence from={0} durationInFrames={78}>
        <SceneFade dur={78} fadeIn={0} fadeOut={10}>
          <SceneText phrase={SCENES[0]} />
          <Sequence from={16} durationInFrames={50}>
            <ArrowCursor
              startX={3200}
              startY={400}
              endX={1800}
              endY={950}
              rotation={25}
            />
          </Sequence>
          <SoftBlob x={800} y={600} size={300} color={C.blue} delay={10} />
          <SoftBlob x={3000} y={400} size={250} color={C.pink} delay={20} />
          <SoftBlob x={600} y={1600} size={200} color={C.yellow} delay={30} />
        </SceneFade>
      </Sequence>

      {/* ═══ DARK OVERLAY (scene 1→2 transition) ═══ */}
      {darkOverlay > 0 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(8,8,14,${darkOverlay})`,
            zIndex: 1,
          }}
        />
      )}

      {/* ═══ SCENE 2: "Not enough focus?" (f72–145) ═══ */}
      <Sequence from={72} durationInFrames={73} style={{ zIndex: 2 }}>
        <SceneFade dur={73} fadeIn={8} fadeOut={8}>
          <Sequence from={4} durationInFrames={40}>
            <StrokeLine d={LINE_6} color={C.pink} strokeW={7} />
          </Sequence>
          <Sequence from={8} durationInFrames={40}>
            <StrokeLine d={LINE_7} color={C.pink} strokeW={5} />
          </Sequence>
          <Sequence from={14} durationInFrames={40}>
            <StrokeLine d={LINE_8} color={C.blue} strokeW={5} />
          </Sequence>
          <Sequence from={32} durationInFrames={40}>
            <StrokeLine d={LINE_9} color={C.blue} strokeW={4} />
          </Sequence>
          <LiquidBlobs color={C.blue} count={3} seed={1} />
          <Sequence from={10} durationInFrames={60}>
            <LiquidBlobs color={C.pink} count={2} seed={20} />
          </Sequence>
          <UICard x={1481} y={675} w={210} h={175} delay={12} />
          <UICard x={2526} y={373} w={170} h={170} delay={14} />
          <UICard x={695} y={1700} w={260} h={170} delay={16} />
          <UICard x={2904} y={984} w={260} h={170} delay={18} />
          <UICard x={342} y={821} w={260} h={170} delay={20} />
          <UICard x={3316} y={1162} w={260} h={170} delay={22} />
          <Sequence from={0} durationInFrames={35}>
            <Counter />
          </Sequence>
          <SceneText phrase={SCENES[1]} />
        </SceneFade>
      </Sequence>

      {/* ═══ SCENE 3: "Drag your tasks" + folder (f140–205) ═══ */}
      <Sequence from={140} durationInFrames={65}>
        <SceneFade dur={65} fadeIn={6} fadeOut={8}>
          <SceneText phrase={SCENES[2]} />
          <FolderScene />
          <FolderLabel />
          <HandCursor />
        </SceneFade>
      </Sequence>

      {/* ═══ SCENE 4: "switch focus" + kanban boards (f205–278) ═══ */}
      <Sequence from={200} durationInFrames={78}>
        <SceneFade dur={78} fadeIn={6} fadeOut={10}>
          <KanbanBoards />
          <Sequence from={12} durationInFrames={55}>
            <ArrowCursor
              startX={3600}
              startY={1500}
              endX={1400}
              endY={900}
              rotation={-40}
            />
          </Sequence>
          <SceneText phrase={SCENES[3]} />
        </SceneFade>
      </Sequence>

      {/* ═══ SCENE 5: Concentric circles + "Teams using Focusly" (f270–421) ═══ */}
      <Sequence from={270} durationInFrames={151}>
        <SceneFade dur={151} fadeIn={10} fadeOut={12}>
          <ConcentricCircles />
          <Sequence from={7} durationInFrames={130}>
            <OrbitIcons />
          </Sequence>
          <BrandText />
        </SceneFade>
      </Sequence>

      {/* ═══ SCENE 6: Floating boards + "Used by 2,000+ teams" (f340–450) ═══ */}
      <Sequence from={340} durationInFrames={110}>
        <SceneFade dur={110} fadeIn={10} fadeOut={10}>
          <FloatingBoards />
          <Sequence from={30} durationInFrames={80}>
            <SceneText phrase={SCENES[5]} />
          </Sequence>
        </SceneFade>
      </Sequence>

      {/* ═══ SCENE 7: "More deep work. Fewer pings." + drop circle (f420–525) ═══ */}
      <Sequence from={420} durationInFrames={105}>
        <SceneFade dur={105} fadeIn={8} fadeOut={10}>
          <MapBlur />
          <DropCircle />
          <Sequence from={16} durationInFrames={83}>
            <SceneText phrase={SCENES[6]} />
          </Sequence>
        </SceneFade>
      </Sequence>

      {/* ═══ SCENE 8: "Try Focusly for free" (f520–600) ═══ */}
      <Sequence from={520} durationInFrames={80}>
        <SceneFade dur={80} fadeIn={8} fadeOut={0}>
          <SceneText phrase={SCENES[7]} />
          <SoftBlob x={CX - 400} y={CY + 200} size={350} color={C.blue} delay={10} />
          <SoftBlob x={CX + 400} y={CY - 200} size={300} color={C.pink} delay={15} />
        </SceneFade>
      </Sequence>
    </AbsoluteFill>
  );
};
