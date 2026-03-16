/**
 * CircleProgress
 *
 * Animated circular progress ring that fills from 0 to a target percentage.
 * Useful in ChartScene, social-proof stats, or any metric display.
 *
 * Usage:
 *   <CircleProgress
 *     value={78}          // 0-100
 *     startFrame={10}
 *     durationFrames={45}
 *     label="Satisfaction"
 *     color="#6366F1"
 *   />
 */

import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Easing } from "remotion";

interface Props {
  /** Target percentage 0–100 */
  value: number;
  /** Frame to start filling */
  startFrame?: number;
  /** How many frames to animate the fill */
  durationFrames?: number;
  /** Ring color */
  color?: string;
  /** Track (background ring) color */
  trackColor?: string;
  /** Diameter in px (default: 200) */
  size?: number;
  /** Stroke width (default: 14) */
  strokeWidth?: number;
  /** Label below the percentage */
  label?: string;
  /** Font for the percentage number */
  fontFamily?: string;
  textColor?: string;
  labelColor?: string;
  /** Whether to show the % number inside */
  showValue?: boolean;
}

export const CircleProgress: React.FC<Props> = ({
  value,
  startFrame = 0,
  durationFrames = 45,
  color = "#6366F1",
  trackColor = "rgba(255,255,255,0.1)",
  size = 200,
  strokeWidth = 14,
  label,
  fontFamily = "Inter, system-ui, sans-serif",
  textColor = "#ffffff",
  labelColor = "rgba(255,255,255,0.6)",
  showValue = true,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, value / 100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const currentValue = Math.round(progress * value / (value / 100));
  const displayValue = Math.round(progress * 100);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        position: "relative",
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>

        {/* Centre value */}
        {showValue && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily,
              fontSize: size * 0.26,
              fontWeight: 800,
              color: textColor,
              letterSpacing: "-0.03em",
            }}
          >
            {displayValue}%
          </div>
        )}
      </div>

      {label && (
        <div
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 500,
            color: labelColor,
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: size,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
