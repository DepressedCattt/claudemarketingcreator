/**
 * NotificationBadge — pulsing circular count indicator.
 *
 * A small glowing circle with a number inside. Uses `Math.sin`
 * for a continuous pulse that modulates scale, creating a
 * "live indicator" feel.
 */

import React from "react";
import { useCurrentFrame } from "remotion";

const DEFAULT_FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;

interface Props {
  count: number;
  x: number;
  y: number;
  color: string;
  /** Spring progress 0→1 controlling the entrance. */
  progress: number;
  /** Diameter in px (default 56). */
  size?: number;
  fontFamily?: string;
  /** Text colour inside the badge (default white). */
  textColor?: string;
}

export const NotificationBadge: React.FC<Props> = ({
  count,
  x,
  y,
  color,
  progress,
  size = 56,
  fontFamily = DEFAULT_FONT,
  textColor = "#FFFFFF",
}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + Math.sin(frame * 0.08) * 0.08 * progress;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: `scale(${progress * pulse})`,
        boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
        zIndex: 10,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: size * 0.5,
          fontWeight: 700,
          color: textColor,
        }}
      >
        {count}
      </span>
    </div>
  );
};
