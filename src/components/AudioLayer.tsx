/**
 * AudioLayer — renders audio tracks on top of any composition.
 *
 * Used by the CLI render path (Root.tsx → withAudio).
 * The Studio player uses CompositionWithAudio instead, but the math is identical.
 *
 * Each track shape (matches studio/state.json):
 *   src       — path relative to public/, e.g. "/audio/track.mp3"
 *   offset    — composition frame at which the audio starts playing
 *   startFrom — skip this many frames into the audio file before playing
 *   endAt     — composition frame at which the audio stops (absolute)
 *   volume    — 0–1
 *   loop      — whether the audio should loop
 *   pitchedSrc — optional pitch-shifted variant (takes priority over src)
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";

export interface AudioTrack {
  src:             string;
  offset:          number;
  startFrom:       number;
  endAt:           number;
  volume:          number;
  loop:            boolean;
  pitchSemitones?: number;
  pitchedSrc?:     string;
}

interface AudioLayerProps {
  tracks: AudioTrack[];
}

function resolveSrc(raw: string): string {
  const path = raw.startsWith("/") ? raw.slice(1) : raw;
  return staticFile(path);
}

/** Renders one <Audio> per track, wrapped in a <Sequence> for timing offset. */
export const AudioLayer: React.FC<AudioLayerProps> = ({ tracks }) => {
  if (!tracks || tracks.length === 0) return null;

  return (
    <>
      {tracks.map((track, i) => {
        const src = resolveSrc(track.pitchedSrc ?? track.src);

        // Remotion's <Audio endAt={E}> internally wraps in
        //   <Sequence from={-startFrom} durationInFrames={E}>
        // Inside our outer <Sequence from={offset}>, the audio ends at comp frame:
        //   offset + (E - startFrom) = track.endAt
        // Solving: E = endAt - offset + startFrom
        const audioEndAt = track.endAt - (track.offset ?? 0) + (track.startFrom ?? 0);

        return (
          <Sequence key={i} from={track.offset ?? 0} layout="none">
            <Audio
              src={src}
              startFrom={track.startFrom ?? 0}
              endAt={audioEndAt > 0 ? audioEndAt : undefined}
              volume={Math.min(1, track.volume ?? 1)}
              loop={track.loop ?? false}
            />
          </Sequence>
        );
      })}
    </>
  );
};

/**
 * Higher-order component that wraps any composition with audio track support.
 *
 * The wrapped component accepts an optional `audioTracks` prop.
 * When rendering via CLI, pass: --props '{"audioTracks":[...]}'
 */
export function withAudio<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { audioTracks?: AudioTrack[] }> {
  const WrappedWithAudio: React.FC<P & { audioTracks?: AudioTrack[] }> = ({
    audioTracks,
    ...props
  }) => (
    <AbsoluteFill>
      <Component {...(props as P)} />
      <AudioLayer tracks={audioTracks ?? []} />
    </AbsoluteFill>
  );

  WrappedWithAudio.displayName = `WithAudio(${Component.displayName ?? Component.name ?? "Component"})`;
  return WrappedWithAudio;
}
