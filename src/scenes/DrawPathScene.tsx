/**
 * DrawPathScene
 *
 * SVG shapes draw themselves onto screen one by one.
 * Each shape uses stroke-dashoffset animation for authentic path-drawing.
 * Includes checkmarks, circles, underlines, arrows, crosses, hearts, stars.
 *
 * Required sceneProps (DrawPathSceneProps):
 *   items      — array of { shape, label?, color? }
 *   headline   — optional headline
 *   itemDelay  — frames between each shape starting to draw (default: 20)
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { AdConfig, DrawPathSceneProps } from "../data/types";
import { DrawPath } from "../components/DrawPath";
import { FilmGrain } from "../components/FilmGrain";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const DrawPathScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as DrawPathSceneProps;
  const items     = props.items     ?? [];
  const headline  = props.headline;
  const itemDelay = props.itemDelay ?? 20;

  const sceneOpacity    = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(4, 14);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <AbsoluteFill style={{ background: brand.colors.background }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 30% 50%, ${brand.colors.primary}18 0%, transparent 55%)`,
        }}
      />
      <FilmGrain opacity={0.04} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          gap: 36,
        }}
      >
        {headline && (
          <div
            style={{
              opacity: headlineOpacity,
              fontFamily: brand.typography.headlineFont || typo.headlineFont,
              fontSize: typo.subheadline,
              fontWeight: typo.headlineWeight,
              color: brand.colors.text,
              lineHeight: 1.15,
              letterSpacing: typo.headlineLetterSpacing,
              marginBottom: 8,
            }}
          >
            {headline}
          </div>
        )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 40,
            width: "100%",
          }}
        >
          {items.map((item, i) => {
            const startFrame = 8 + i * itemDelay;
            const color = item.color || brand.colors.accent;

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 32,
                }}
              >
                <DrawPath
                  shape={item.shape}
                  startFrame={startFrame}
                  durationFrames={24}
                  color={color}
                  strokeWidth={6}
                  size={item.shape === "underline" ? 100 : 80}
                />

                {item.label && (
                  <div
                    style={{
                      fontFamily: brand.typography.headlineFont || typo.headlineFont,
                      fontSize: typo.body,
                      fontWeight: 600,
                      color: brand.colors.text,
                      lineHeight: 1.3,
                      flex: 1,
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
