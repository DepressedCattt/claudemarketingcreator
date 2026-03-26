/**
 * GlowCard — card with pulsing glow border, inner radial highlight,
 * and layered depth shadows.
 *
 * Implements the `glow-card-entrance` recipe: the card scales in
 * with a spring, while a `Math.sin`-driven pulse modulates the
 * glow intensity and inner highlight opacity.
 */

import React from "react";
import { useCurrentFrame } from "remotion";

interface Props {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Accent colour for the glow (e.g. "#3B82F6"). */
  glowColor: string;
  /** Spring progress 0→1 controlling the entrance. */
  progress: number;
  children: React.ReactNode;
  radius?: number;
  /** Stagger index — offsets the glow pulse phase. */
  depth?: number;
  /** Card surface gradient — array of two hex colours [light, dark]. */
  bgGradient?: [string, string];
}

export const GlowCard: React.FC<Props> = ({
  x,
  y,
  w,
  h,
  glowColor,
  progress,
  children,
  radius = 32,
  depth = 0,
  bgGradient = ["#2D3B50", "#1E293B"],
}) => {
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
        background: `linear-gradient(145deg, ${bgGradient[0]}, ${bgGradient[1]})`,
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
      {/* Inner radial highlight */}
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
