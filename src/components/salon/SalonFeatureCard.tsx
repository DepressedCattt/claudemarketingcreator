/**
 * SalonFeatureCard — Premium spring-physics feature card.
 *
 * Enters with spring overshoot, shadow bloom, and a one-time reflection sweep.
 * Designed to feel like a polished SaaS UI component floating in Z-space.
 *
 * Cards are layered in depth using `zDepth` for parallax — higher zDepth values
 * appear closer and slightly larger.
 */

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ReflectionSweep } from "./ReflectionSweep";

export interface SalonFeatureCardProps {
  icon: string;
  title: string;
  description: string;
  /** Global frame at which the card entrance spring begins */
  startFrame: number;
  /** Z-depth offset in px for perspective layering (0 = flat, 30 = closest) */
  zDepth?: number;
  /** Card width in px */
  width?: number;
  /** Primary brand color for icon glow */
  primaryColor?: string;
  /** Index used to stagger icon pulse phase */
  index?: number;
}

export const SalonFeatureCard: React.FC<SalonFeatureCardProps> = ({
  icon,
  title,
  description,
  startFrame,
  zDepth = 0,
  width = 860,
  primaryColor = "#2563EB",
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Entrance spring ──────────────────────────────────────────────────────
  const entryProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 13, stiffness: 110, mass: 0.85 },
    from: 0,
    to: 1,
  });

  const translateY = interpolate(entryProgress, [0, 1], [72, 0]);
  const opacity = interpolate(entryProgress, [0, 0.18], [0, 1], {
    extrapolateRight: "clamp",
  });
  const cardScale = interpolate(entryProgress, [0, 1], [0.93, 1]);

  // ── Shadow bloom on entry ─────────────────────────────────────────────────
  const shadowBlur = interpolate(entryProgress, [0, 1], [4, 36]);
  const shadowOpacity = interpolate(entryProgress, [0.5, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Reflection sweep — fires once as the card settles ────────────────────
  // Sweep travels across during frames entryProgress 0.7→1.0
  const sweepProgress = interpolate(entryProgress, [0.65, 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Subtle icon breathe ───────────────────────────────────────────────────
  const iconScale = 1 + Math.sin(frame * 0.07 + index * 2.1) * 0.035;
  const iconGlowOpacity = 0.15 + Math.sin(frame * 0.07 + index * 2.1) * 0.08;

  // ── Depth perspective ─────────────────────────────────────────────────────
  const depthScale = 1 + zDepth * 0.0008;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${cardScale * depthScale})`,
        width,
        position: "relative",
        overflow: "hidden",
        borderRadius: 22,
        border: "1.5px solid #D8DEE8",
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: [
          `0 ${shadowBlur * 0.3}px ${shadowBlur}px rgba(37,99,235,${0.055 + shadowOpacity * 0.07})`,
          `0 2px 8px rgba(11,23,48,0.055)`,
        ].join(", "),
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "32px 36px",
      }}
    >
      {/* ── Reflection sweep ─────────────────────────────────────────────── */}
      <ReflectionSweep
        progress={sweepProgress}
        borderRadius={22}
        intensity={0.28}
        angle={20}
      />

      {/* ── Icon ─────────────────────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          position: "relative",
          width: 72,
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Icon glow disc */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: primaryColor,
            opacity: iconGlowOpacity,
            filter: "blur(10px)",
          }}
        />
        {/* Icon background circle */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "#EEF4FF",
            border: "1px solid #DDEAFF",
          }}
        />
        <span
          style={{
            fontSize: 32,
            lineHeight: 1,
            transform: `scale(${iconScale})`,
            position: "relative",
            zIndex: 1,
          }}
        >
          {icon}
        </span>
      </div>

      {/* ── Text block ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: "#0B1730",
            fontFamily: '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif',
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
            marginBottom: 10,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 21,
            fontWeight: 400,
            color: "#66758F",
            fontFamily: '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif',
            lineHeight: 1.55,
            letterSpacing: "0.005em",
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
};
