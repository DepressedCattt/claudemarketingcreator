/**
 * CompositionWithAudio
 *
 * A thin Remotion composition wrapper that renders any inner composition
 * and stacks <Audio> tracks on top of it.  This is what the Player
 * receives as its `component` prop whenever the active composition has
 * audio tracks assigned in the Studio.
 *
 * Props are passed as Remotion `inputProps` so the Player can serialise them:
 *   inputProps = {
 *     innerComponent: FormaAd2,
 *     innerProps: {},
 *     audioTracks: [{ src, startFrom, endAt, offset, volume, loop }, …]
 *   }
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import type { AudioTrack } from "../types";

export type CompositionWithAudioProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  innerComponent: React.ComponentType<any>;
  innerProps:     Record<string, unknown>;
  audioTracks:    AudioTrack[];
};

export const CompositionWithAudio: React.FC<CompositionWithAudioProps> = ({
  innerComponent: Inner,
  innerProps,
  audioTracks,
}) => (
  <AbsoluteFill>
    {/* Render the actual composition */}
    <Inner {...innerProps} />

    {/* Overlay audio tracks — each wrapped in a Sequence so `offset`
        controls when playback starts within the composition timeline. */}
    {audioTracks.map((track, i) => {
      // endAt inside the Sequence is relative to the Sequence's own frame 0,
      // which equals composition frame `track.offset`.
      const seqEndAt = track.endAt - track.offset;

      return (
        <Sequence key={i} from={track.offset} layout="none">
          <Audio
            src={track.src}
            startFrom={track.startFrom}
            endAt={seqEndAt > 0 ? seqEndAt : undefined}
            volume={track.volume}
            loop={track.loop}
          />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
