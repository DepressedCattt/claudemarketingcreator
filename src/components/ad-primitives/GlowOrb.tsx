/**
 * GlowOrb — ambient breathing glow sphere.
 *
 * A radial-gradient circle with sinusoidal breathing (scale + opacity)
 * and gentle vertical float. Use 2-3 per scene as atmospheric lighting;
 * vary `phase` to desynchronise them.
 */

import React from "react";
import { useCurrentFrame } from "remotion";

interface Props {
  x: number;
  y: number;
  /** Diameter in px. */
  size: number;
  /** Core colour of the gradient (e.g. "#10B981"). */
  color: string;
  /** Box-shadow glow colour — usually the core colour at ~20% opacity (e.g. "#10B98130"). */
  glowColor: string;
  /** Spring progress 0→1 controlling the entrance. */
  progress: number;
  /** Phase offset for `Math.sin` — desynchronise multiple orbs. */
  phase?: number;
}

export const GlowOrb: React.FC<Props> = ({
  x,
  y,
  size,
  color,
  glowColor,
  progress,
  phase = 0,
}) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame * 0.03 + phase) * 0.15 + 0.85;

  return (
    <div
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2 + Math.sin(frame * 0.015 + phase) * 6,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle at 40% 35%, ${color}, transparent 70%)`,
        boxShadow: `0 0 ${size * 0.8}px ${size * 0.3}px ${glowColor}`,
        opacity: progress * breathe * 0.6,
        transform: `scale(${0.5 + progress * 0.5})`,
      }}
    />
  );
};
