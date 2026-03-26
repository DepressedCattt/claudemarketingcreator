/**
 * AnimatedConnector — SVG draw-on connector with traveling dot.
 *
 * Implements the `svg-connector-draw` recipe: a quadratic Bézier
 * (or straight line) that draws on via `strokeDashoffset`, with a
 * glowing circle that rides along the path.
 *
 * The SVG fills the full `width` × `height` viewport so multiple
 * connectors can share the same coordinate space.
 */

import React from "react";
import { interpolate } from "remotion";

interface Props {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  /** Spring progress 0→1 controlling the draw-on. */
  progress: number;
  /** Use a curved (quadratic Bézier) path instead of a straight line. */
  curved?: boolean;
  /** SVG viewport width  (default 3840). */
  width?: number;
  /** SVG viewport height (default 2160). */
  height?: number;
  /** Stroke thickness (default 3). */
  strokeWidth?: number;
  /** Traveling dot radius (default 6). */
  dotRadius?: number;
}

export const AnimatedConnector: React.FC<Props> = ({
  x1,
  y1,
  x2,
  y2,
  color,
  progress,
  curved = true,
  width = 3840,
  height = 2160,
  strokeWidth = 3,
  dotRadius = 6,
}) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = curved ? mx + dy * 0.25 : mx;
  const cy = curved ? my - dx * 0.15 : my;

  const pathD = curved
    ? `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  const pathLength = Math.sqrt(dx * dx + dy * dy) * (curved ? 1.2 : 1);

  const dotX = interpolate(progress, [0, 1], [x1, x2]);
  const dotY = interpolate(progress, [0, 1], [y1, y2]);

  return (
    <svg
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height,
        pointerEvents: "none",
      }}
    >
      {/* Ghost track */}
      <path d={pathD} fill="none" stroke={`${color}20`} strokeWidth={strokeWidth} />
      {/* Animated draw-on */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - progress)}
        filter={`drop-shadow(0 0 6px ${color})`}
      />
      {/* Traveling dot */}
      <circle
        cx={dotX}
        cy={dotY}
        r={dotRadius}
        fill={color}
        opacity={progress > 0.05 && progress < 0.95 ? 1 : 0}
        filter={`drop-shadow(0 0 8px ${color})`}
      />
    </svg>
  );
};
