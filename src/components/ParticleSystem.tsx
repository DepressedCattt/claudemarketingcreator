/**
 * ParticleSystem
 *
 * Deterministic particle engine built on useCurrentFrame.
 * Every particle's position is computed from frame number — perfectly
 * reproducible across renders with no Math.random() calls.
 *
 * Supports: confetti | embers | sparks | bubbles | matrix
 *
 * Usage:
 *   <ParticleSystem effect="confetti" count={80} colors={["#f59e0b","#6366f1"]} />
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

interface Props {
  effect: "confetti" | "embers" | "sparks" | "bubbles" | "matrix";
  count?: number;
  colors?: string[];
  width?: number;
  height?: number;
}

// ─── Seeded deterministic random ─────────────────────────────────────────────
// Using a simple hash so position is always a pure function of (index, offset).

function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─── Effect renderers ────────────────────────────────────────────────────────

const Confetti: React.FC<{ count: number; colors: string[]; frame: number }> = ({
  count, colors, frame,
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => {
      const startX = rand(i * 7 + 1) * 1080;
      const startY = -20 - rand(i * 7 + 2) * 300;  // start above viewport
      const vx     = (rand(i * 7 + 3) - 0.5) * 6;
      const vy     =  rand(i * 7 + 4) * 4 + 2;     // fall speed
      const gravity = 0.06;
      const size   =  rand(i * 7 + 5) * 14 + 6;
      const rot0   =  rand(i * 7 + 6) * 360;
      const rotV   = (rand(i * 7 + 7) - 0.5) * 10;
      const color  = colors[Math.floor(rand(i * 7 + 8) * colors.length)];
      const delay  = Math.floor(rand(i * 7 + 9) * 40); // stagger starts
      const f = Math.max(0, frame - delay);

      const x   = startX + vx * f;
      const y   = startY + vy * f + gravity * f * f;
      const rot = rot0 + rotV * f;
      const opacity = y > 1980 ? 0 : 1;

      const isRect = rand(i * 7 + 10) > 0.5;

      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: isRect ? size * 1.6 : size,
            height: size,
            background: color,
            borderRadius: isRect ? 2 : "50%",
            opacity,
            transform: `rotate(${rot}deg)`,
          }}
        />
      );
    })}
  </>
);

const Embers: React.FC<{ count: number; colors: string[]; frame: number }> = ({
  count, colors, frame,
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => {
      const startX = rand(i * 5 + 1) * 1080;
      const startY = 1920 + rand(i * 5 + 2) * 200;
      const vx     = (rand(i * 5 + 3) - 0.5) * 3;
      const vy     = -(rand(i * 5 + 4) * 3 + 1);   // float upward
      const size   =  rand(i * 5 + 5) * 8 + 2;
      const color  = colors[Math.floor(rand(i * 5 + 6) * colors.length)];
      const delay  = Math.floor(rand(i * 5 + 7) * 60);
      const life   = rand(i * 5 + 8) * 60 + 80;
      const f = Math.max(0, frame - delay);

      const x = startX + vx * f;
      const y = startY + vy * f;
      const opacity = Math.max(0, 1 - f / life);

      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            opacity,
            filter: `blur(${size * 0.3}px)`,
            boxShadow: `0 0 ${size * 2}px ${color}`,
          }}
        />
      );
    })}
  </>
);

const Sparks: React.FC<{ count: number; colors: string[]; frame: number }> = ({
  count, colors, frame,
}) => {
  const cx = 540;
  const cy = 960;
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle  = rand(i * 6 + 1) * Math.PI * 2;
        const speed  = rand(i * 6 + 2) * 12 + 4;
        const length = rand(i * 6 + 3) * 60 + 20;
        const color  = colors[Math.floor(rand(i * 6 + 4) * colors.length)];
        const delay  = Math.floor(rand(i * 6 + 5) * 20);
        const life   = rand(i * 6 + 6) * 30 + 20;
        const f = Math.max(0, frame - delay);

        const dist = speed * f;
        const x1 = cx + Math.cos(angle) * dist;
        const y1 = cy + Math.sin(angle) * dist;
        const x2 = cx + Math.cos(angle) * (dist + length);
        const y2 = cy + Math.sin(angle) * (dist + length);
        const opacity = Math.max(0, 1 - f / life);

        return (
          <svg
            key={i}
            style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
            width={1080}
            height={1920}
          >
            <line
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              opacity={opacity}
              style={{ filter: `drop-shadow(0 0 4px ${color})` }}
            />
          </svg>
        );
      })}
    </>
  );
};

const Bubbles: React.FC<{ count: number; colors: string[]; frame: number }> = ({
  count, colors, frame,
}) => (
  <>
    {Array.from({ length: count }).map((_, i) => {
      const startX = rand(i * 6 + 1) * 1080;
      const startY = 1920 + rand(i * 6 + 2) * 400;
      const vy     = -(rand(i * 6 + 3) * 2 + 0.5);
      const vx     = Math.sin(frame * 0.05 + rand(i * 6 + 4) * 10) * 1.5;
      const size   = rand(i * 6 + 5) * 40 + 10;
      const color  = colors[Math.floor(rand(i * 6 + 6) * colors.length)];
      const delay  = Math.floor(rand(i * 6 + 7) * 80);
      const f = Math.max(0, frame - delay);

      const x = startX + vx * f;
      const y = startY + vy * f;
      const opacity = y < -size ? 0 : 0.4 + rand(i * 6 + 8) * 0.3;

      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: size,
            height: size,
            borderRadius: "50%",
            border: `2px solid ${color}`,
            background: `${color}15`,
            opacity,
            backdropFilter: "blur(2px)",
          }}
        />
      );
    })}
  </>
);

const Matrix: React.FC<{ count: number; colors: string[]; frame: number }> = ({
  count, colors, frame,
}) => {
  const cols = 20;
  const colWidth = 1080 / cols;

  return (
    <>
      {Array.from({ length: cols }).map((_, col) => {
        const startY  = -rand(col * 3 + 1) * 600;
        const speed   =  rand(col * 3 + 2) * 8 + 4;
        const chars   = "01アイウエオカキクケコサシスセソ";
        const color   = colors[Math.floor(rand(col * 3 + 3) * colors.length)];
        const numChars = Math.floor(rand(col * 3 + 4) * 12 + 4);

        return Array.from({ length: numChars }).map((_, row) => {
          const charIndex = (frame + col * 7 + row * 3) % chars.length;
          const y = startY + speed * frame + row * 40;
          const opacity = row === numChars - 1 ? 1 : Math.max(0, 1 - row / numChars) * 0.7;
          const isHead  = row === numChars - 1;

          return (
            <div
              key={`${col}-${row}`}
              style={{
                position: "absolute",
                left: col * colWidth,
                top: y,
                width: colWidth,
                height: 36,
                fontFamily: "'Courier New', monospace",
                fontSize: 24,
                fontWeight: isHead ? 900 : 400,
                color: isHead ? "#ffffff" : color,
                opacity,
                textAlign: "center",
                textShadow: isHead ? `0 0 10px ${color}` : undefined,
              }}
            >
              {chars[charIndex]}
            </div>
          );
        });
      })}
    </>
  );
};

// ─── Main export ─────────────────────────────────────────────────────────────

export const ParticleSystem: React.FC<Props> = ({
  effect,
  count = 80,
  colors = ["#6366f1", "#f59e0b", "#34d399", "#f43f5e", "#60a5fa"],
  width = 1080,
  height = 1920,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {effect === "confetti" && <Confetti count={count} colors={colors} frame={frame} />}
      {effect === "embers"   && <Embers   count={count} colors={colors} frame={frame} />}
      {effect === "sparks"   && <Sparks   count={count} colors={colors} frame={frame} />}
      {effect === "bubbles"  && <Bubbles  count={count} colors={colors} frame={frame} />}
      {effect === "matrix"   && <Matrix   count={count} colors={colors} frame={frame} />}
    </AbsoluteFill>
  );
};
