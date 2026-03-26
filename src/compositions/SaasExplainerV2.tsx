/**
 * SaasExplainerV2 — "Focusly" SaaS Explainer (clean recreation)
 *
 * Inspired by the AE template's style: italic Gibson typography, color-cycling
 * text reveals, decorative stroke lines, kanban boards, concentric circles,
 * ripple effects. Built with clean Remotion-native spring animations.
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 600 frames @ 30fps = 20 seconds
 *
 * Scene breakdown:
 *  S1  Hook         (  0– 90f  3.0s)  "Most workdays start with noise."
 *  S2  Problem      ( 78–168f  3.0s)  "Not enough focus?" — dark bg, counter, floating cards
 *  S3  Feature A    (160–248f  2.9s)  "Drag your tasks" — folder + hand cursor
 *  S4  Feature B    (240–330f  3.0s)  "switch focus" — kanban boards
 *  S5  Social proof (322–440f  3.9s)  "Teams using Focusly" — blue circle, orbiting icons
 *  S6  Stats        (432–510f  2.6s)  "Used by 2,000+ teams" — rising boards
 *  S7  Benefit      (502–568f  2.2s)  "More deep work. Fewer pings." — ripple
 *  S8  CTA          (560–600f  1.3s)  "Try Focusly for free"
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
  bg: "#f2f2f2",
  dark: "#08080e",
  blue: "#4b63e9",
  darkBlue: "#3b53e9",
  pink: "#f75d7f",
  yellow: "#fcbc05",
  white: "#ffffff",
  black: "#1c1c1c",
  offWhite: "#fefefe",
  gray: "#c8c9c3",
};

const FONT = `Gibson, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

const SPR = {
  text: { damping: 28, stiffness: 120, mass: 0.7 },
  hero: { damping: 22, stiffness: 90, mass: 1.1 },
  ui: { damping: 20, stiffness: 110, mass: 0.9 },
  bg: { damping: 30, stiffness: 60, mass: 1.2 },
};

function useSpring(delay = 0, config = SPR.text) {
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

// ─── TextLine: blur-scale entrance ──────────────────────────────────────────

const TextLine: React.FC<{
  children: React.ReactNode;
  delay?: number;
  y?: number;
  size?: number;
  weight?: number;
  italic?: boolean;
  color?: string;
}> = ({
  children,
  delay = 0,
  y = CY,
  size = 200,
  weight = 300,
  italic = true,
  color = C.black,
}) => {
  const p = useSpring(delay, SPR.text);
  const blur = (1 - p) * 12;
  const scale = 0.92 + p * 0.08;
  const slideY = (1 - p) * 40;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        transform: `translateY(${-50 + slideY}%) scale(${scale})`,
        textAlign: "center",
        fontFamily: FONT,
        fontSize: size,
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        color,
        opacity: p,
        filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
        willChange: "transform, opacity, filter",
      }}
    >
      {children}
    </div>
  );
};

// ─── Phrase: staggered word reveal ──────────────────────────────────────────

interface WordConfig {
  text: string;
  weight?: number;
  color?: string;
  italic?: boolean;
}

const PhraseWord: React.FC<{
  text: string;
  delay: number;
  weight: number;
  italic: boolean;
  color: string;
}> = ({ text, delay, weight, italic, color }) => {
  const p = useSpring(delay, SPR.text);
  const blur = (1 - p) * 10;
  const slideX = (1 - p) * 60;

  return (
    <span
      style={{
        fontWeight: weight,
        fontStyle: italic ? "italic" : "normal",
        color,
        opacity: p,
        transform: `translateX(${slideX}px)`,
        filter: blur > 0.5 ? `blur(${blur}px)` : undefined,
        display: "inline-block",
        textShadow: "0 2px 16px rgba(0,0,0,0.04)",
      }}
    >
      {text}
    </span>
  );
};

const Phrase: React.FC<{
  words: WordConfig[];
  y?: number;
  size?: number;
  stagger?: number;
  baseDelay?: number;
}> = ({ words, y = CY, size = 200, stagger = 5, baseDelay = 0 }) => {
  return (
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
        gap: size * 0.35,
        fontFamily: FONT,
        fontSize: size,
        whiteSpace: "pre",
      }}
    >
      {words.map((w, i) => (
        <PhraseWord
          key={i}
          text={w.text}
          delay={baseDelay + i * stagger}
          weight={w.weight ?? 300}
          italic={w.italic ?? true}
          color={w.color ?? C.black}
        />
      ))}
    </div>
  );
};

// ─── FadeWrap ───────────────────────────────────────────────────────────────

const FadeWrap: React.FC<{
  children: React.ReactNode;
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, dur, fadeIn = 8, fadeOut = 8 }) => {
  const op = useFade(dur, fadeIn, fadeOut);
  return <AbsoluteFill style={{ opacity: op }}>{children}</AbsoluteFill>;
};

// ─── Draw-on stroke line ────────────────────────────────────────────────────

const SWIRL_D =
  "M 33.2,22.6 C 33.2,22.6 274.3,-421.7 -278.3,-329.6 C -831.0,-237.5 -997.5,1149.7 -333.6,773.9 C 453.1,328.7 -829.7,-1018.3 -2092.5,-818.3";
const WAVE_D =
  "M -633.5,8.9 C -633.5,8.9 1786.7,384.0 512.7,12.7 C -71.9,-157.7 3632.0,-572.0 2432.7,-1174.6";

const DrawLine: React.FC<{
  d: string;
  color: string;
  width?: number;
  delay?: number;
}> = ({ d, color, width = 6, delay = 0 }) => {
  const p = useSpring(delay, SPR.bg);
  return (
    <svg
      style={{
        position: "absolute",
        left: CX,
        top: CY,
        overflow: "visible",
        opacity: p * 0.5,
      }}
      width="1"
      height="1"
      viewBox="0 0 1 1"
    >
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeDasharray="3000"
        strokeDashoffset={3000 * (1 - p)}
        strokeLinecap="round"
      />
    </svg>
  );
};

// ─── Floating UI Card (frosted glass) ───────────────────────────────────────

const FloatCard: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  delay: number;
  tilt?: number;
}> = ({ x, y, w, h, delay, tilt = 0 }) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, SPR.ui);
  const bob = Math.sin(frame * 0.035 + x * 0.01) * 6;

  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2 + bob,
        width: w,
        height: h,
        borderRadius: 20,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1.5px solid rgba(255,255,255,0.4)",
        boxShadow:
          "0 16px 48px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)",
        opacity: p,
        transform: `scale(${0.7 + p * 0.3}) rotate(${tilt * p}deg)`,
        padding: 16,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[C.pink, C.yellow, C.gray].map((c, i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
      </div>
      {[C.blue, C.yellow, C.pink, C.gray].map((c, i) => (
        <div
          key={i}
          style={{
            height: h * 0.09,
            borderRadius: 6,
            marginBottom: 6,
            background: `${c}${i < 2 ? "20" : "0c"}`,
            width: i === 3 ? "50%" : "85%",
          }}
        />
      ))}
    </div>
  );
};

// ─── Counter ────────────────────────────────────────────────────────────────

const Counter: React.FC = () => {
  const p = useSpring(0, SPR.hero);
  const val = Math.round(p * 43);
  return (
    <div
      style={{
        position: "absolute",
        left: CX,
        top: CY,
        transform: `translate(-50%, -50%) scale(${0.85 + p * 0.15})`,
        fontFamily: FONT,
        fontSize: 380,
        fontWeight: 500,
        color: C.white,
        opacity: p,
        textShadow: "0 4px 24px rgba(0,0,0,0.15)",
      }}
    >
      {val}%
    </div>
  );
};

// ─── Hand Cursor SVG ────────────────────────────────────────────────────────

const HAND_D =
  "M 272.0,57.9 C 271.1,60.3 312.0,229.1 312.0,229.1 C 312.0,229.1 334.4,304.8 334.4,304.8 C 334.4,304.8 275.0,237.8 274.4,237.2 C 263.6,232.0 247.8,234.4 236.6,245.3 C 220.2,261.1 240.1,287.0 240.1,287.0 C 240.1,287.0 346.8,408.7 353.8,412.2 C 360.8,415.7 378.7,404.0 381.5,408.9 C 384.3,413.9 392.8,456.2 394.7,461.9 C 395.2,463.3 536.9,425.7 540.4,424.3 C 543.9,422.9 525.4,382.0 530.3,376.4 C 535.2,370.7 554.8,367.9 559.6,360.9 C 559.7,360.7 530.4,235.5 530.4,235.5 C 530.4,235.5 519.6,181.3 502.8,179.8 C 479.8,177.8 474.3,212.8 474.3,212.8 C 474.3,212.8 471.3,163.2 443.2,160.5 C 418.3,158.0 418.3,199.9 418.3,199.9 C 418.3,199.9 410.7,150.7 386.8,149.0 C 346.3,146.1 368.7,211.9 368.7,211.9 C 368.7,211.9 329.2,52.6 329.4,51.8 C 322.9,30.5 284.6,23.4 272.0,57.9 Z";

const HandCursor: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterP = spring({ frame, fps, config: SPR.hero });
  const dragP = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 24, stiffness: 40, mass: 1.4 },
  });
  const x = interpolate(dragP, [0, 1], [CX + 500, CX + 200]);
  const y = interpolate(dragP, [0, 1], [CY + 350, CY + 50]);

  return (
    <svg
      style={{
        position: "absolute",
        left: x - 150,
        top: y - 100,
        transform: `scale(${0.4 * enterP})`,
        opacity: enterP,
        filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))",
      }}
      width="788"
      height="475"
      viewBox="0 0 788 475"
    >
      <path d={HAND_D} fill={C.white} stroke={C.black} strokeWidth={4} />
    </svg>
  );
};

// ─── Folder + Sheets ────────────────────────────────────────────────────────

const Folder: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterP = spring({ frame, fps, config: SPR.hero });

  const sheets = [
    { delay: 6, x: -40, y: -120, rot: -18, accent: C.blue },
    { delay: 10, x: 20, y: -90, rot: -8, accent: C.yellow },
    { delay: 14, x: 70, y: -130, rot: 4, accent: C.pink },
    { delay: 18, x: 120, y: -100, rot: 12, accent: C.blue },
  ];

  return (
    <div
      style={{
        position: "absolute",
        left: CX - 150,
        top: CY - 200,
        transform: `scale(${enterP * 2.8})`,
        transformOrigin: "center bottom",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 220,
          height: 160,
          borderRadius: 28,
          background: `${C.blue}20`,
          filter: "blur(30px)",
          left: 8,
          top: 8,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 220,
          height: 160,
          borderRadius: 28,
          background: `linear-gradient(140deg, #5a73f9 0%, ${C.darkBlue} 100%)`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      />
      {sheets.map((sh, i) => {
        const sp = spring({
          frame: Math.max(0, frame - sh.delay),
          fps,
          config: { damping: 16, stiffness: 100, mass: 0.8 },
        });
        const wobble = Math.sin(frame * 0.05 + i * 2) * 1.2;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: sh.x,
              top: sh.y,
              width: 150,
              height: 150,
              borderRadius: 16,
              background: `linear-gradient(180deg, ${C.white} 0%, #f8f8fb 100%)`,
              border: "1px solid rgba(0,0,0,0.05)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.08)",
              transform: `scale(${sp}) rotate(${sh.rot * sp + wobble}deg)`,
              opacity: sp,
              padding: 12,
            }}
          >
            <div
              style={{
                height: 5,
                width: "60%",
                borderRadius: 4,
                background: sh.accent,
                marginBottom: 10,
              }}
            />
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                style={{
                  height: 12,
                  borderRadius: 5,
                  marginBottom: 5,
                  background: j === 0 ? `${sh.accent}15` : "#f0f0f2",
                  width: j === 2 ? "45%" : "80%",
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
};

// ─── Board Card ─────────────────────────────────────────────────────────────

const BoardCard: React.FC<{
  x: number;
  y: number;
  w?: number;
  h?: number;
  delay: number;
  rot?: number;
}> = ({ x, y, w = 200, h = 160, delay, rot = 0 }) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, SPR.ui);
  const bob = Math.sin(frame * 0.03 + x * 0.005) * 8;

  return (
    <div
      style={{
        position: "absolute",
        left: x - w / 2,
        top: y - h / 2 + bob,
        width: w,
        height: h,
        borderRadius: 18,
        background: "linear-gradient(180deg, #fff 0%, #fafafa 100%)",
        backdropFilter: "blur(6px)",
        border: "1px solid rgba(0,0,0,0.05)",
        boxShadow:
          "0 10px 36px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.6)",
        opacity: p,
        transform: `scale(${0.6 + p * 0.4}) rotate(${rot * p}deg)`,
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
      {[C.yellow, C.pink, `${C.blue}15`, "#eee"].map((clr, i) => (
        <div
          key={i}
          style={{
            height: Math.max(10, h * 0.08),
            borderRadius: 5,
            marginBottom: 5,
            background: clr,
            width: i === 3 ? "50%" : "82%",
            opacity: 0.65,
          }}
        />
      ))}
    </div>
  );
};

// ─── Concentric Circles ─────────────────────────────────────────────────────

const Circles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enterP = spring({ frame, fps, config: SPR.bg });
  const pulse = 1 + Math.sin(frame * 0.04) * 0.02;
  const rings = [820, 1080, 1340];

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: CX - 800,
          top: CY - 800,
          width: 1600,
          height: 1600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.blue}18 0%, transparent 60%)`,
          transform: `scale(${enterP * 1.2})`,
          filter: "blur(50px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CX - 570,
          top: CY - 570,
          width: 1140,
          height: 1140,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 32%, #5b73f9, ${C.blue}, ${C.darkBlue})`,
          transform: `scale(${enterP * 0.65 * pulse})`,
          boxShadow: `0 0 100px ${C.blue}25`,
        }}
      />
      {rings.map((r, i) => {
        const rp = spring({
          frame: Math.max(0, frame - 6 - i * 5),
          fps,
          config: SPR.bg,
        });
        const opPulse = 0.25 + Math.sin(frame * 0.045 + i * 1.5) * 0.08;
        return (
          <svg
            key={i}
            style={{
              position: "absolute",
              left: CX - r / 2,
              top: CY - r / 2,
              width: r,
              height: r,
              opacity: rp * opPulse,
              transform: `rotate(${frame * (i % 2 === 0 ? -0.15 : 0.2)}deg)`,
            }}
          >
            <circle
              cx={r / 2}
              cy={r / 2}
              r={r / 2 - 2}
              fill="none"
              stroke={C.blue}
              strokeWidth={2.5}
              strokeDasharray={`${20 + i * 12} ${12 + i * 6}`}
            />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── Orbiting Icon ──────────────────────────────────────────────────────────

const OrbitIcon: React.FC<{
  angle: number;
  radius: number;
  delay: number;
}> = ({ angle, radius, delay }) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, SPR.ui);
  const a = angle + frame * 0.008;
  const x = CX + Math.cos(a) * radius;
  const y = CY + Math.sin(a) * radius;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 48,
        top: y - 48,
        width: 96,
        height: 96,
        borderRadius: 22,
        background: "linear-gradient(135deg, #fff, #f0f2ff)",
        border: "1.5px solid rgba(75,99,233,0.12)",
        boxShadow: "0 6px 20px rgba(75,99,233,0.08)",
        opacity: p * 0.8,
        transform: `scale(${p * 0.75})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 36,
          height: 24,
          borderRadius: 6,
          background: `${C.blue}15`,
          border: `1.5px solid ${C.blue}25`,
        }}
      />
    </div>
  );
};

// ─── Ripple ─────────────────────────────────────────────────────────────────

const Ripple: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: SPR.bg });
  const count = 7;

  return (
    <AbsoluteFill>
      {Array.from({ length: count }, (_, i) => {
        const rp = spring({
          frame: Math.max(0, frame - i * 4),
          fps,
          config: { damping: 18, stiffness: 30, mass: 1.6 },
        });
        const r = (180 + i * 70) * rp;
        const op = (1 - i / count) * rp * 0.4;
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
          left: CX - 12,
          top: CY - 12,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: C.blue,
          opacity: p * 0.6,
          boxShadow: `0 0 50px ${C.blue}40`,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Rising Board (scene 6) ─────────────────────────────────────────────────

const RisingBoard: React.FC<{
  x: number;
  yEnd: number;
  delay: number;
  tiltX?: number;
}> = ({ x, yEnd, delay, tiltX = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.bg });
  const y = H + 200 + (yEnd - H - 200) * p;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 100,
        top: y,
        width: 200,
        height: 260,
        borderRadius: 18,
        background: "linear-gradient(180deg, #fff, #fafafa)",
        border: "1px solid rgba(0,0,0,0.04)",
        boxShadow: "0 16px 48px rgba(0,0,0,0.1)",
        transform: `perspective(800px) rotateX(${tiltX}deg)`,
        opacity: Math.min(1, p * 2.5),
        padding: 12,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[C.pink, C.yellow, C.gray].map((c, i) => (
          <div
            key={i}
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
      </div>
      {[0, 1, 2, 3, 4].map((j) => (
        <div
          key={j}
          style={{
            height: 26,
            borderRadius: 8,
            marginBottom: 6,
            background:
              j === 0 ? `${C.yellow}10` : j === 1 ? `${C.blue}08` : "#f5f5f5",
            border: "1px solid rgba(0,0,0,0.025)",
          }}
        />
      ))}
    </div>
  );
};

// ─── Background blob ────────────────────────────────────────────────────────

const BgBlob: React.FC<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay?: number;
}> = ({ x, y, size, color, delay = 0 }) => {
  const frame = useCurrentFrame();
  const p = useSpring(delay, SPR.bg);
  const pulse = 1 + Math.sin(frame * 0.05) * 0.06;
  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color}30 0%, transparent 65%)`,
        transform: `scale(${p * pulse})`,
        opacity: p * 0.6,
        filter: "blur(50px)",
      }}
    />
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const SaasExplainerV2: React.FC = () => {
  const frame = useCurrentFrame();

  const darkOverlay =
    frame >= 70 && frame <= 175
      ? interpolate(frame, [70, 84, 158, 175], [0, 0.9, 0.9, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 25% 30%, rgba(75,99,233,0.015) 0%, transparent 50%), radial-gradient(circle at 75% 65%, rgba(247,93,127,0.01) 0%, transparent 50%)",
        }}
      />

      {/* S1: "Most workdays start with noise." (0–90) */}
      <Sequence from={0} durationInFrames={90}>
        <FadeWrap dur={90} fadeIn={1} fadeOut={12}>
          <Phrase
            y={CY}
            words={[
              { text: "Most", color: C.yellow },
              { text: "workdays", color: C.pink },
              { text: "start" },
              { text: "with noise.", weight: 600, color: C.blue },
            ]}
            stagger={7}
          />
          <BgBlob x={700} y={500} size={400} color={C.blue} delay={12} />
          <BgBlob x={3100} y={500} size={350} color={C.pink} delay={18} />
          <BgBlob x={600} y={1700} size={280} color={C.yellow} delay={24} />
        </FadeWrap>
      </Sequence>

      {/* Dark overlay */}
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

      {/* S2: "Not enough focus?" (78–168) */}
      <Sequence from={78} durationInFrames={90} style={{ zIndex: 2 }}>
        <FadeWrap dur={90} fadeIn={8} fadeOut={10}>
          <Sequence from={4}>
            <DrawLine d={SWIRL_D} color={C.pink} delay={0} />
          </Sequence>
          <Sequence from={10}>
            <DrawLine d={WAVE_D} color={C.blue} width={5} delay={0} />
          </Sequence>
          <FloatCard x={1500} y={650} w={220} h={180} delay={10} tilt={-5} />
          <FloatCard x={2600} y={420} w={190} h={175} delay={14} tilt={3} />
          <FloatCard x={700} y={1650} w={250} h={180} delay={16} tilt={-8} />
          <FloatCard x={2950} y={1000} w={240} h={170} delay={18} tilt={5} />
          <FloatCard x={400} y={800} w={230} h={165} delay={20} tilt={-3} />
          <FloatCard x={3350} y={1200} w={250} h={175} delay={22} tilt={6} />
          <Sequence from={0} durationInFrames={40}>
            <Counter />
          </Sequence>
          <Phrase
            y={CY}
            words={[
              { text: "Not enough", color: C.offWhite },
              { text: "focus?", weight: 600, color: C.offWhite },
            ]}
            stagger={5}
            baseDelay={4}
          />
        </FadeWrap>
      </Sequence>

      {/* S3: "Drag your tasks" + folder (160–248) */}
      <Sequence from={160} durationInFrames={88}>
        <FadeWrap dur={88} fadeIn={8} fadeOut={10}>
          <Phrase
            y={CY - 40}
            words={[
              { text: "Drag your", color: C.blue },
              { text: "tasks", weight: 600, color: C.blue },
            ]}
            stagger={5}
          />
          <Folder />
          <TextLine
            delay={10}
            y={CY + 300}
            size={107}
            weight={700}
            italic={false}
            color={C.white}
          >
            daily tasks
          </TextLine>
          <HandCursor />
        </FadeWrap>
      </Sequence>

      {/* S4: "switch focus" + boards (240–330) */}
      <Sequence from={240} durationInFrames={90}>
        <FadeWrap dur={90} fadeIn={8} fadeOut={10}>
          <BoardCard x={700} y={550} w={220} h={160} delay={0} rot={-10} />
          <BoardCard x={1250} y={480} w={200} h={150} delay={3} rot={5} />
          <BoardCard x={2550} y={620} w={180} h={160} delay={6} rot={-7} />
          <BoardCard x={3050} y={480} w={180} h={150} delay={9} rot={8} />
          <BoardCard x={1850} y={1550} w={200} h={140} delay={12} rot={-12} />
          <Phrase
            y={CY}
            words={[
              { text: "switch", color: C.yellow },
              { text: "focus", weight: 600, color: C.pink },
            ]}
            stagger={4}
            baseDelay={5}
          />
        </FadeWrap>
      </Sequence>

      {/* S5: Blue circle + "Teams using Focusly" (322–440) */}
      <Sequence from={322} durationInFrames={118}>
        <FadeWrap dur={118} fadeIn={10} fadeOut={12}>
          <Circles />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <OrbitIcon
              key={i}
              angle={(Math.PI * 2 * i) / 6}
              radius={380 + (i % 2) * 100}
              delay={14 + i * 2}
            />
          ))}
          <TextLine delay={4} y={CY - 100} size={175} weight={300} color={C.white}>
            Teams using
          </TextLine>
          <TextLine delay={7} y={CY + 100} size={175} weight={600} color={C.white}>
            Focusly
          </TextLine>
        </FadeWrap>
      </Sequence>

      {/* S6: "Used by 2,000+ teams" (432–510) */}
      <Sequence from={432} durationInFrames={78}>
        <FadeWrap dur={78} fadeIn={10} fadeOut={10}>
          <RisingBoard x={900} yEnd={1200} delay={0} tiltX={-5} />
          <RisingBoard x={1350} yEnd={1800} delay={3} tiltX={3} />
          <RisingBoard x={2200} yEnd={1250} delay={5} tiltX={-4} />
          <RisingBoard x={3100} yEnd={750} delay={8} tiltX={5} />
          <RisingBoard x={1250} yEnd={800} delay={10} tiltX={-6} />
          <RisingBoard x={2850} yEnd={1450} delay={12} tiltX={3} />
          <Sequence from={20}>
            <Phrase
              y={CY}
              words={[
                { text: "Used by", color: C.yellow },
                { text: "2,000+ teams", weight: 700, color: C.pink },
              ]}
              stagger={6}
            />
          </Sequence>
        </FadeWrap>
      </Sequence>

      {/* S7: "More deep work. Fewer pings." (502–568) */}
      <Sequence from={502} durationInFrames={66}>
        <FadeWrap dur={66} fadeIn={8} fadeOut={8}>
          <BgBlob x={CX} y={CY} size={600} color={C.blue} delay={0} />
          <Ripple />
          <Sequence from={12}>
            <Phrase
              y={CY}
              words={[
                { text: "More" },
                { text: "deep work.", weight: 600, color: C.blue },
                { text: "Fewer pings." },
              ]}
              stagger={8}
            />
          </Sequence>
        </FadeWrap>
      </Sequence>

      {/* S8: "Try Focusly for free" (560–600) */}
      <Sequence from={560} durationInFrames={40}>
        <FadeWrap dur={40} fadeIn={6} fadeOut={1}>
          <BgBlob x={CX - 400} y={CY + 180} size={350} color={C.blue} delay={5} />
          <BgBlob x={CX + 400} y={CY - 180} size={300} color={C.pink} delay={8} />
          <Phrase
            y={CY}
            words={[
              { text: "Try Focusly", color: C.blue },
              { text: "for free", weight: 600, color: C.pink },
            ]}
            stagger={5}
          />
        </FadeWrap>
      </Sequence>
    </AbsoluteFill>
  );
};
