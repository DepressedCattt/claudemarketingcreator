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
    <Inner {...innerProps} />

    {audioTracks.map((track, i) => {
      // Remotion's <Audio endAt={E}> internally wraps in
      //   <Sequence from={-startFrom} durationInFrames={E}>
      // Inside our outer <Sequence from={offset}>, the audio ends at comp frame:
      //   offset + (E - startFrom) = track.endAt   →   E = endAt - offset + startFrom
      // Remotion naturally stops rendering past the composition boundary.
      const audioEndAt = track.endAt - track.offset + track.startFrom;
      return (
        <Sequence key={i} from={track.offset} layout="none">
          <Audio
            src={track.pitchedSrc ?? track.src}
            startFrom={track.startFrom}
            endAt={audioEndAt > 0 ? audioEndAt : undefined}
            volume={Math.min(1, track.volume)}
            loop={track.loop}
          />
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
