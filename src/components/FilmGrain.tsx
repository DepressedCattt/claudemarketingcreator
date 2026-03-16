/**
 * FilmGrain
 *
 * Adds an animated film grain / noise texture over any scene.
 * Uses an SVG feTurbulence filter that shifts its seed each frame
 * to produce authentic animated grain.
 *
 * Drop this as a child anywhere — it's absolutely positioned.
 *
 * Usage:
 *   <AbsoluteFill>
 *     <YourScene />
 *     <FilmGrain opacity={0.06} />
 *   </AbsoluteFill>
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

interface Props {
  /** Grain opacity (default: 0.06) */
  opacity?: number;
  /** CSS blend mode (default: "overlay") */
  blendMode?: React.CSSProperties["mixBlendMode"];
  /** Grain frequency — higher = finer grain (default: 0.65) */
  frequency?: number;
}

export const FilmGrain: React.FC<Props> = ({
  opacity = 0.06,
  blendMode = "overlay",
  frequency = 0.65,
}) => {
  const frame = useCurrentFrame();
  // Shift seed each frame so grain animates (doesn't freeze)
  const seed = frame % 100;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id={`film-grain-${seed}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={frequency}
              numOctaves={4}
              seed={seed}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" in="noise" result="greyNoise" />
            <feBlend in="SourceGraphic" in2="greyNoise" mode="overlay" />
          </filter>
        </defs>
      </svg>

      <AbsoluteFill
        style={{
          filter: `url(#film-grain-${seed})`,
          opacity,
          mixBlendMode: blendMode,
        }}
      >
        <div style={{ width: "100%", height: "100%", background: "#888888" }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
