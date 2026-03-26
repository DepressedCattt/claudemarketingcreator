/**
 * ProgressRing — circular progress indicator with glow filter.
 *
 * Draws a background track ring and an animated foreground arc
 * driven by `progress` (0→1). Optionally shows a centred value
 * label and a description beneath it.
 */

import React from "react";

const DEFAULT_FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;

interface Props {
  x: number;
  y: number;
  radius: number;
  strokeWidth: number;
  color: string;
  /** Spring progress 0→1. */
  progress: number;
  /** Small label shown beneath the value (e.g. "Uptime"). */
  label?: string;
  /** Main value shown in the centre (e.g. "97%"). */
  value?: string;
  /** Fill ratio — how much of the ring to fill at progress = 1 (default 0.88 = 88%). */
  fillRatio?: number;
  textColor?: string;
  labelColor?: string;
  fontFamily?: string;
  /** Value font size in px (default 56). */
  valueFontSize?: number;
  /** Label font size in px (default 24). */
  labelFontSize?: number;
}

export const ProgressRing: React.FC<Props> = ({
  x,
  y,
  radius,
  strokeWidth,
  color,
  progress,
  label,
  value,
  fillRatio = 0.88,
  textColor = "#F8FAFC",
  labelColor = "#94A3B8",
  fontFamily = DEFAULT_FONT,
  valueFontSize = 56,
  labelFontSize = 24,
}) => {
  const circumference = 2 * Math.PI * radius;
  const size = (radius + strokeWidth) * 2;

  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2 }}>
      <svg width={size} height={size}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`${color}20`}
          strokeWidth={strokeWidth}
        />
        {/* Animated foreground arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress * fillRatio)}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          filter={`drop-shadow(0 0 8px ${color}80)`}
        />
      </svg>
      {value && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: valueFontSize,
              fontWeight: 700,
              color: textColor,
              letterSpacing: -2,
            }}
          >
            {value}
          </span>
          {label && (
            <span
              style={{
                fontFamily,
                fontSize: labelFontSize,
                fontWeight: 400,
                color: labelColor,
                marginTop: 4,
              }}
            >
              {label}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
