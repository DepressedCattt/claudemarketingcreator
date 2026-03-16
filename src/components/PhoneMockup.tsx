/**
 * PhoneMockup
 *
 * A CSS-rendered phone frame with a screenshot or gradient placeholder inside.
 * Used in product UI showcase scenes.
 * Scales in with a spring animation and adds subtle floating motion.
 */

import React from "react";
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ColorConfig } from "../data/types";

interface Props {
  screenshotSrc?: string;
  colors: ColorConfig;
  delay?: number;
  /** Width of the phone frame (height calculated at 2:1 ratio) */
  width?: number;
  /** Subtle floating animation after entrance */
  floating?: boolean;
}

export const PhoneMockup: React.FC<Props> = ({
  screenshotSrc,
  colors,
  delay = 0,
  width = 300,
  floating = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const height = width * 2.1;
  const borderWidth = Math.round(width * 0.04);

  const opacity = interpolate(
    frame,
    [delay, delay + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const scaleIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 90, mass: 0.9 },
    from: 0.75,
    to: 1,
  });

  // Gentle floating bob after entrance
  const floatY = floating
    ? interpolate(
        frame,
        [0, 45, 90, 135, 180],
        [0, -8, 0, -8, 0],
        { extrapolateRight: "clamp" }
      )
    : 0;

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scaleIn}) translateY(${floatY}px)`,
        width,
        height,
        borderRadius: width * 0.13,
        background: "#1C1C2E",
        border: `${borderWidth}px solid #2D2D4E`,
        boxShadow: `
          0 ${width * 0.15}px ${width * 0.35}px rgba(0,0,0,0.6),
          inset 0 1px 0 rgba(255,255,255,0.08)
        `,
        overflow: "hidden",
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Dynamic island / notch */}
      <div
        style={{
          position: "absolute",
          top: borderWidth,
          left: "50%",
          transform: "translateX(-50%)",
          width: width * 0.25,
          height: width * 0.07,
          background: "#0A0A14",
          borderRadius: 100,
          zIndex: 10,
        }}
      />

      {/* Screen content */}
      {screenshotSrc ? (
        <Img
          src={screenshotSrc}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        /* Gradient placeholder with UI chrome hint */
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(180deg, ${colors.primary}30 0%, ${colors.background} 40%, ${colors.secondary}20 100%)`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          {/* Fake UI bars */}
          {[0.7, 0.5, 0.6, 0.4].map((opacity, i) => (
            <div
              key={i}
              style={{
                width: `${55 + i * 8}%`,
                height: 12,
                borderRadius: 8,
                background: colors.primary,
                opacity,
              }}
            />
          ))}
          <div style={{
            marginTop: 12,
            width: 64,
            height: 64,
            borderRadius: 18,
            background: colors.accent,
            opacity: 0.7,
          }} />
        </div>
      )}
    </div>
  );
};
