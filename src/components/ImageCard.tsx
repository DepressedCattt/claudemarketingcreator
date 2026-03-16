/**
 * ImageCard
 *
 * A rounded image container that scales in with a spring animation.
 * Shows a placeholder gradient when no image path is provided.
 */

import React from "react";
import { Img, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ColorConfig } from "../data/types";
import { useFadeIn } from "../utils/animation";

interface Props {
  src?: string;
  colors: ColorConfig;
  delay?: number;
  width?: number;
  height?: number;
  borderRadius?: number;
  /** Alt placeholder text when no image */
  placeholderLabel?: string;
  objectFit?: "cover" | "contain" | "fill";
}

export const ImageCard: React.FC<Props> = ({
  src,
  colors,
  delay = 0,
  width = 900,
  height = 600,
  borderRadius = 28,
  placeholderLabel = "Image",
  objectFit = "cover",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = useFadeIn(delay, 15);

  const scaleIn = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, stiffness: 90, mass: 0.9 },
    from: 0.88,
    to: 1,
  });

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scaleIn})`,
        width,
        height,
        borderRadius,
        overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.35)",
        flexShrink: 0,
      }}
    >
      {src ? (
        <Img
          src={src}
          style={{ width: "100%", height: "100%", objectFit }}
        />
      ) : (
        /* Placeholder — gradient with label */
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(135deg, ${colors.primary}60, ${colors.secondary}80)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            fontSize: 28,
            color: colors.text,
            opacity: 0.5,
          }}
        >
          {placeholderLabel}
        </div>
      )}
    </div>
  );
};
