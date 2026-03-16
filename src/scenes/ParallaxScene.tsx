/**
 * ParallaxScene
 *
 * Multiple text layers scroll at different speeds to create depth.
 * Front layers move faster, back layers drift slowly.
 * Creates a cinematic parallax effect with genuine perceived 3D depth.
 *
 * Required sceneProps (ParallaxSceneProps):
 *   layers     — array of { text, fontSize?, opacity?, speed?, color? }
 *   direction  — "up" | "down" (default: "up")
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AdConfig, ParallaxSceneProps } from "../data/types";
import { GradientText } from "../components/GradientText";
import { FilmGrain } from "../components/FilmGrain";
import { useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";
import { Easing } from "remotion";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const ParallaxScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as ParallaxSceneProps;
  const layers    = props.layers    ?? [];
  const direction = props.direction ?? "up";

  const sceneOpacity = useFadeOut(durationFrames, 10);

  // Global scroll progress over the scene
  const scrollProgress = interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  const scrollAmount = 200; // max px to travel
  const dir = direction === "up" ? -1 : 1;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: brand.colors.background }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${brand.colors.primary}20 0%, transparent 65%)`,
        }}
      />
      <FilmGrain opacity={0.05} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
          padding: "80px 72px",
        }}
      >
        {layers.map((layer, i) => {
          const speed       = layer.speed ?? (0.2 + i * 0.3); // back layers slower
          const translateY  = dir * scrollProgress * scrollAmount * speed;
          const opacity     = layer.opacity ?? (1 - i * 0.12);
          const fontSize    = layer.fontSize ?? (typo.display - i * 16);
          const color       = layer.color ?? (i === 0 ? brand.colors.text : brand.colors.textSecondary);
          const isGradient  = i === 0; // Front layer gets gradient text treatment

          return (
            <div
              key={i}
              style={{
                transform: `translateY(${translateY}px)`,
                opacity,
                width: "100%",
                textAlign: "center",
                position: "relative",
                zIndex: layers.length - i,
              }}
            >
              {isGradient ? (
                <GradientText
                  text={layer.text}
                  gradientColors={[brand.colors.accent, brand.colors.text, brand.colors.textSecondary]}
                  fontSize={fontSize}
                  fontFamily={brand.typography.headlineFont || typo.headlineFont}
                  fontWeight={typo.headlineWeight}
                  letterSpacing={typo.headlineLetterSpacing}
                  lineHeight={typo.headlineLineHeight}
                  animated
                />
              ) : (
                <div
                  style={{
                    fontFamily: brand.typography.headlineFont || typo.headlineFont,
                    fontSize,
                    fontWeight: i === 0 ? typo.headlineWeight : 400,
                    color,
                    lineHeight: typo.headlineLineHeight,
                    letterSpacing: typo.headlineLetterSpacing,
                    filter: i > 1 ? `blur(${(i - 1) * 1.5}px)` : undefined,
                  }}
                >
                  {layer.text}
                </div>
              )}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
