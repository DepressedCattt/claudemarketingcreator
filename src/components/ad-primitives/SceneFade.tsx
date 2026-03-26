/**
 * SceneFade — scene wrapper with fade-in/out and subtle exit scale-down.
 *
 * Wrap each `<Sequence>` scene's content in `<SceneFade>` to get
 * consistent opacity ramps and the premium 0.97-scale exit that
 * prevents hard cuts.
 *
 * `dur` must match the Sequence's `durationInFrames`.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface Props {
  children: React.ReactNode;
  /** Total duration of this scene in frames — must match the Sequence length. */
  dur: number;
  /** Frames over which the scene fades in (default 8). */
  fadeIn?: number;
  /** Frames over which the scene fades out (default 10). */
  fadeOut?: number;
  /** Scale at the very last frame of the fade-out (default 0.97). */
  exitScale?: number;
}

export const SceneFade: React.FC<Props> = ({
  children,
  dur,
  fadeIn = 8,
  fadeOut = 10,
  exitScale = 0.97,
}) => {
  const frame = useCurrentFrame();
  const inOp = fadeIn > 0 ? Math.min(1, frame / fadeIn) : 1;
  const outOp = fadeOut > 0 ? Math.min(1, (dur - frame) / fadeOut) : 1;
  const opacity = Math.max(0, Math.min(inOp, outOp));

  const scale =
    fadeOut > 0 && dur - frame < fadeOut
      ? interpolate(frame, [dur - fadeOut, dur], [1, exitScale], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  return (
    <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>
      {children}
    </AbsoluteFill>
  );
};
