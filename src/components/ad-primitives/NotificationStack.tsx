/**
 * NotificationStack — cascading notification cards with glow pulse
 * and expanding ring indicators.
 *
 * Implements the `notification-pulse-stack` recipe: cards slide in
 * from the left with staggered delays, each with a pulsing glow
 * border and an expanding ring animation on the icon.
 */

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const DEFAULT_FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const DEFAULT_SPRING = { stiffness: 150, damping: 22, mass: 0.9 };

export interface NotificationItem {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
}

interface Props {
  notifications: NotificationItem[];
  /** Spring progress 0→1 controlling the overall entrance. */
  progress: number;
  /** Absolute left position (default 200). */
  x?: number;
  /** Top position of the first notification (default 500). */
  y?: number;
  /** Vertical spacing between cards (default 320). */
  spacing?: number;
  /** Width of each card (default 1600). */
  cardWidth?: number;
  /** Height of each card (default 260). */
  cardHeight?: number;
  /** Frame stagger between cards (default 8). */
  stagger?: number;
  surfaceGradient?: [string, string];
  textColor?: string;
  textDimColor?: string;
  fontFamily?: string;
  springConfig?: { stiffness: number; damping: number; mass: number };
}

export const NotificationStack: React.FC<Props> = ({
  notifications,
  progress,
  x = 200,
  y = 500,
  spacing = 320,
  cardWidth = 1600,
  cardHeight = 260,
  stagger = 8,
  surfaceGradient = ["#2D3B50", "#1E293B"],
  textColor = "#F8FAFC",
  textDimColor = "#94A3B8",
  fontFamily = DEFAULT_FONT,
  springConfig = DEFAULT_SPRING,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <>
      {notifications.map((notif, i) => {
        const delay = i * stagger;
        const p =
          spring({
            frame: Math.max(0, frame - delay),
            fps,
            config: springConfig,
          }) * progress;

        const glowPulse = Math.sin(frame * 0.05 + i * 1.5) * 0.3 + 0.7;
        const ringPhase = Math.sin(frame * 0.06 + i * 2);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y + i * spacing,
              width: cardWidth,
              height: cardHeight,
              borderRadius: 40,
              background: `linear-gradient(145deg, ${surfaceGradient[0]}, ${surfaceGradient[1]})`,
              border: `1px solid ${notif.color}30`,
              boxShadow: [
                `0 0 ${30 * glowPulse}px ${notif.color}30`,
                `0 16px 48px rgba(0,0,0,0.3)`,
                `inset 0 1px 0 rgba(255,255,255,0.05)`,
              ].join(", "),
              transform: `translateX(${(1 - p) * -400}px) scale(${0.9 + p * 0.1})`,
              opacity: p,
              display: "flex",
              alignItems: "center",
              padding: "0 56px",
              gap: 36,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 100,
                height: 100,
                borderRadius: 28,
                background: `${notif.color}15`,
                border: `1px solid ${notif.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                boxShadow: `0 0 16px ${notif.color}25`,
                flexShrink: 0,
                position: "relative",
              }}
            >
              {notif.icon}
              {/* Expanding ring */}
              <div
                style={{
                  position: "absolute",
                  inset: -10,
                  borderRadius: "50%",
                  border: `2px solid ${notif.color}`,
                  opacity: Math.max(0, ringPhase * 0.4),
                  transform: `scale(${1 + ringPhase * 0.5})`,
                  pointerEvents: "none",
                }}
              />
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily,
                  fontSize: 52,
                  fontWeight: 600,
                  color: textColor,
                  letterSpacing: -1,
                }}
              >
                {notif.title}
              </div>
              <div
                style={{
                  fontFamily,
                  fontSize: 34,
                  fontWeight: 400,
                  color: textDimColor,
                  marginTop: 6,
                }}
              >
                {notif.subtitle}
              </div>
            </div>

            {/* Timestamp */}
            <div
              style={{
                fontFamily,
                fontSize: 28,
                fontWeight: 500,
                color: `${textDimColor}80`,
                whiteSpace: "nowrap" as const,
              }}
            >
              {i === 0 ? "Just now" : `${i * 3}m ago`}
            </div>
          </div>
        );
      })}
    </>
  );
};
