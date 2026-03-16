/**
 * SparkleSystem — Premium beauty-editorial sparkle particle effect.
 *
 * Deterministic 4-pointed star sparkles that slowly drift and twinkle.
 * Uses gold accent color by default. Fully seeded — no randomness per render.
 */

import React from "react";
import { useCurrentFrame } from "remotion";

interface SparkleSystemProps {
  count?: number;
  color?: string;
  width?: number;
  height?: number;
  globalOpacity?: number;
  speedScale?: number;
}

// Deterministic hash-based pseudo-random number [0, 1)
const rand = (seed: number): number => {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export const SparkleSystem: React.FC<SparkleSystemProps> = ({
  count = 20,
  color = "#E7D3A7",
  width = 1080,
  height = 1920,
  globalOpacity = 1,
  speedScale = 1,
}) => {
  const frame = useCurrentFrame();

  return (
    <svg
      style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {Array.from({ length: count }, (_, i) => {
        const baseX = rand(i * 3.17) * width;
        const baseY = rand(i * 7.41) * height;
        const size = 3 + rand(i * 11.73) * 8;
        const speed = (0.3 + rand(i * 5.19) * 1.0) * speedScale;
        const phase = rand(i * 17.83) * Math.PI * 2;

        // Slow upward drift, looped
        const driftY = (frame * speed * 0.22) % height;
        const driftX = Math.sin(frame * 0.018 * speed + phase) * 18;

        const y = ((baseY - driftY + height) % height);
        const x = baseX + driftX;

        // Twinkle: fade in/out on a sine cycle
        const twinkle = 0.25 + Math.abs(Math.sin(frame * 0.06 * speed + phase)) * 0.75;

        // Slow rotation
        const rotation = (frame * speed * 0.4 + i * 37) % 360;

        // 4-pointed diamond star path
        const s = size;
        const inner = size * 0.12;
        const d = `M 0 ${-s} L ${inner} ${-inner} L ${s} 0 L ${inner} ${inner} L 0 ${s} L ${-inner} ${inner} L ${-s} 0 L ${-inner} ${-inner} Z`;

        return (
          <g
            key={i}
            transform={`translate(${x}, ${y}) rotate(${rotation})`}
            opacity={twinkle * globalOpacity}
          >
            <path d={d} fill={color} />
          </g>
        );
      })}
    </svg>
  );
};
