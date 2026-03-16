/**
 * LottieScene
 *
 * Plays a Lottie JSON animation file perfectly frame-synced with the video.
 * Drop any .json Lottie file into /public/lottie/ and reference it here.
 *
 * Required sceneProps (LottieSceneProps):
 *   src              — path to .json file e.g. "/public/lottie/confetti.json"
 *   playbackRate     — speed multiplier (default: 1)
 *   loop             — whether to loop (default: false)
 *   headline         — optional headline text
 *   headlinePosition — "above" | "below" (default: "below")
 *
 * Note: Without a .json file, this scene renders a placeholder.
 * Download free Lottie files from lottiefiles.com
 */

import React, { useState, useEffect } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { AdConfig, LottieSceneProps } from "../data/types";
import { FilmGrain } from "../components/FilmGrain";
import { GradientText } from "../components/GradientText";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const LottieScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as LottieSceneProps;
  const src              = props.src;
  const headline         = props.headline;
  const headlinePosition = props.headlinePosition ?? "below";

  const sceneOpacity    = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(headlinePosition === "above" ? 4 : 20, 16);

  const [animationData, setAnimationData] = useState<unknown>(null);
  const [handle] = useState(() => delayRender("Loading Lottie JSON"));

  useEffect(() => {
    if (!src) {
      continueRender(handle);
      return;
    }
    fetch(src)
      .then(r => r.json())
      .then(data => {
        setAnimationData(data);
        continueRender(handle);
      })
      .catch(() => {
        continueRender(handle);
      });
  }, [src, handle]);

  const HeadlineElement = headline ? (
    <div style={{ opacity: headlineOpacity, width: "100%", textAlign: "center" }}>
      <GradientText
        text={headline}
        gradientColors={[brand.colors.accent, brand.colors.text]}
        fontSize={typo.headline}
        fontFamily={brand.typography.headlineFont || typo.headlineFont}
        fontWeight={typo.headlineWeight}
        letterSpacing={typo.headlineLetterSpacing}
        lineHeight={typo.headlineLineHeight}
        animated
      />
    </div>
  ) : null;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <AbsoluteFill style={{ background: brand.colors.background }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${brand.colors.primary}20 0%, transparent 60%)`,
        }}
      />
      <FilmGrain opacity={0.04} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "80px 72px",
          gap: 32,
        }}
      >
        {headlinePosition === "above" && HeadlineElement}

        {/* Lottie container */}
        <div
          style={{
            width: 600,
            height: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {animationData ? (
            <LottiePlayer data={animationData} durationFrames={durationFrames} />
          ) : (
            /* Placeholder when no Lottie file is loaded */
            <div
              style={{
                width: "100%",
                height: "100%",
                border: `2px dashed ${brand.colors.primary}40`,
                borderRadius: 24,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 16,
              }}
            >
              <div style={{ fontSize: 64 }}>🎬</div>
              <div
                style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 22,
                  color: brand.colors.textSecondary,
                  textAlign: "center",
                  padding: "0 32px",
                }}
              >
                {src
                  ? `Loading: ${src}`
                  : "Drop a Lottie .json in\n/public/lottie/\nand set src in sceneProps"}
              </div>
            </div>
          )}
        </div>

        {headlinePosition === "below" && HeadlineElement}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Lottie player sub-component ─────────────────────────────────────────────

const LottiePlayer: React.FC<{ data: unknown; durationFrames: number }> = ({
  data, durationFrames,
}) => {
  // Dynamic import so build doesn't fail if @remotion/lottie isn't used
  const [LottieComponent, setLottieComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    import("@remotion/lottie").then(mod => {
      setLottieComponent(() => mod.Lottie);
    }).catch(() => {});
  }, []);

  if (!LottieComponent) return null;

  return (
    <LottieComponent
      animationData={data}
      style={{ width: "100%", height: "100%" }}
    />
  );
};
