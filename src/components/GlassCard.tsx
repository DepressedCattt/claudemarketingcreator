/**
 * GlassCard
 *
 * Frosted glass panel using CSS backdrop-filter.
 * Renders a translucent, blurred panel — works over any background or video.
 *
 * Usage:
 *   <GlassCard tint="#ffffff" tintOpacity={0.08} blur={20}>
 *     <YourContent />
 *   </GlassCard>
 */

import React from "react";

interface Props {
  children: React.ReactNode;
  /** Glass tint colour (default: white) */
  tint?: string;
  /** Opacity of the tint fill (default: 0.08) */
  tintOpacity?: number;
  /** Blur amount in px (default: 20) */
  blur?: number;
  /** Border colour (default: semi-transparent white) */
  borderColor?: string;
  borderRadius?: number;
  padding?: number | string;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<Props> = ({
  children,
  tint = "#ffffff",
  tintOpacity = 0.08,
  blur = 20,
  borderColor = "rgba(255,255,255,0.14)",
  borderRadius = 24,
  padding = 32,
  style,
}) => {
  // Convert hex tint + opacity to rgba
  const fill = hexToRgba(tint, tintOpacity);

  return (
    <div
      style={{
        background: fill,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        border: `1px solid ${borderColor}`,
        borderRadius,
        padding,
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, opacity: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
