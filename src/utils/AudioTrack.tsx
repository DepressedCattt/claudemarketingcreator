/**
 * AudioTrack — Drop-in audio layer for any Remotion composition.
 *
 * Usage inside a composition:
 *   <AudioTrack compositionId="forma2-v1" />
 *
 * The component reads from audioConfig.ts and renders one <Audio> element
 * per configured track, with correct trim (startFrom / endAt) and timing.
 */

import React from "react";
import { Audio, Sequence } from "remotion";
import { getAudioTracks, AudioTrackConfig } from "../data/audioConfig";

interface AudioTrackProps {
  compositionId: string;
  /** Override tracks at runtime (used by AudioEditor preview) */
  overrideTracks?: AudioTrackConfig[];
}

export const AudioTrack: React.FC<AudioTrackProps> = ({
  compositionId,
  overrideTracks,
}) => {
  const tracks = overrideTracks ?? getAudioTracks(compositionId);

  if (tracks.length === 0) return null;

  return (
    <>
      {tracks.map((track, i) => {
        const offset = track.offset ?? 0;

        return (
          <Sequence key={i} from={offset} layout="none">
            <Audio
              src={track.src}
              startFrom={track.startFrom ?? 0}
              endAt={track.endAt}
              volume={track.volume ?? 1}
              loop={track.loop ?? false}
            />
          </Sequence>
        );
      })}
    </>
  );
};
