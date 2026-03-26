/**
 * FilmGrain — SVG feTurbulence dither overlay to combat gradient banding.
 *
 * H.264's 8-bit 4:2:0 encoding crushes subtle dark gradients into visible
 * "steps" (banding). A noise overlay breaks up the uniform areas so the
 * encoder preserves smooth transitions instead of quantizing them.
 *
 * Uses luminance noise with `overlay` blend mode so it affects both darks
 * and lights equally — unlike `screen` which is invisible on dark backgrounds.
 *
 * Usage:  <FilmGrain />   (place as the LAST child in AbsoluteFill)
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

interface Props {
  /** Grain intensity. 0.06–0.12 is a good range. Default: 0.08 */
  opacity?: number;
  /** feTurbulence base frequency. Higher = finer grain. Default: 0.7 */
  frequency?: number;
  /** Whether the grain pattern shifts each frame. Default: true */
  animated?: boolean;
}

export const FilmGrain: React.FC<Props> = ({
  opacity = 0.08,
  frequency = 0.7,
  animated = true,
}) => {
  const frame = useCurrentFrame();
  const seed = animated ? (frame % 120) + 1 : 1;
  const filterId = `dither-${seed}`;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg
        width="100%"
        height="100%"
        style={{ display: "block", position: "absolute", inset: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id={filterId} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={4}
            seed={seed}
            stitchTiles="stitch"
            result="noise"
          />
          <feColorMatrix
            type="saturate"
            values="0"
            in="noise"
            result="mono"
          />
        </filter>
        <rect
          width="100%"
          height="100%"
          filter={`url(#${filterId})`}
          style={{ opacity, mixBlendMode: "overlay" }}
        />
      </svg>
    </AbsoluteFill>
  );
};
