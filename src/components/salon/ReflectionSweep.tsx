/**
 * ReflectionSweep — Premium diagonal gloss sweep.
 *
 * A refined glossy highlight that travels across its container from left to right.
 * Use it on buttons, cards, the chair illustration, or any surface during a
 * "hero moment" to add editorial polish and a luxury-brand sheen.
 *
 * Usage:
 *   <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16 }}>
 *     <ReflectionSweep progress={0.5} />
 *     {children}
 *   </div>
 *
 * progress 0 → highlight fully off-screen left
 * progress 1 → highlight fully off-screen right
 */

import React from "react";
import { interpolate } from "remotion";

interface ReflectionSweepProps {
  /** 0–1 drives the sweep position. Animate this with spring or interpolate. */
  progress: number;
  /** CSS width of the container (used for absolute positioning context). */
  width?: number | string;
  /** CSS height of the container. */
  height?: number | string;
  /** Skew angle in degrees — positive skews the highlight right. */
  angle?: number;
  /** Peak opacity of the gloss highlight at its centre. */
  intensity?: number;
  /** Border radius to clip the sweep (match the parent container). */
  borderRadius?: number | string;
}

export const ReflectionSweep: React.FC<ReflectionSweepProps> = ({
  progress,
  width = "100%",
  height = "100%",
  angle = 22,
  intensity = 0.32,
  borderRadius = 0,
}) => {
  // Map progress 0→1 to left-offset −60% → +160%
  const leftPct = interpolate(progress, [0, 1], [-60, 160]);

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width,
        height,
        overflow: "hidden",
        borderRadius,
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: `${leftPct}%`,
          width: "55%",
          height: "160%",
          transform: `skewX(${-angle}deg)`,
          background: [
            `linear-gradient(`,
            `  ${angle}deg,`,
            `  transparent 0%,`,
            `  rgba(255,255,255,${intensity * 0.4}) 30%,`,
            `  rgba(255,255,255,${intensity}) 50%,`,
            `  rgba(255,255,255,${intensity * 0.4}) 70%,`,
            `  transparent 100%`,
            `)`,
          ].join(""),
          pointerEvents: "none",
        }}
      />
    </div>
  );
};
