/**
 * BlurWord — single word with a blur-scale-fade entrance.
 *
 * Each word racks into focus like a camera pull: blur 10 → 0,
 * translateY slides up, scale pops from 0.94 → 1. All driven
 * by a Remotion spring.
 *
 * Typically composed inside `<WordLine>` for staggered multi-word
 * headlines, but can be used standalone.
 */

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const DEFAULT_FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const DEFAULT_SPRING = { stiffness: 170, damping: 25, mass: 0.8 };

interface Props {
  text: string;
  /** Frame delay before this word starts animating. */
  delay: number;
  fontWeight?: number;
  color?: string;
  /** Font size in px (default 160). */
  size?: number;
  fontFamily?: string;
  springConfig?: { stiffness: number; damping: number; mass: number };
}

export const BlurWord: React.FC<Props> = ({
  text,
  delay,
  fontWeight = 400,
  color = "#F8FAFC",
  size = 160,
  fontFamily = DEFAULT_FONT,
  springConfig = DEFAULT_SPRING,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: springConfig,
  });
  const blur = (1 - p) * 10;

  return (
    <span
      style={{
        display: "inline-block",
        fontFamily,
        fontSize: size,
        fontWeight,
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px) scale(${0.94 + p * 0.06})`,
        filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
        willChange: "transform, opacity, filter",
        letterSpacing: fontWeight >= 600 ? -3 : -1,
      }}
    >
      {text}
    </span>
  );
};
