/**
 * AudioLayer — renders audio tracks on top of any composition.
 *
 * Usage in Root.tsx:
 *   <Composition component={WithAudio(MyComp)} defaultProps={{ audioTracks: [] }} ... />
 *
 * At render time, pass tracks via:
 *   npx remotion render ... --props '{"audioTracks":[...]}'
 *
 * Each track shape (matches studio/state.json):
 *   src       — path relative to public/, e.g. "/audio/track.mp3"
 *   offset    — composition frame at which the audio starts playing
 *   startFrom — skip this many frames into the audio file before playing
 *   endAt     — stop the audio at this frame (relative to audio file start)
 *   volume    — 0–1
 *   loop      — whether the audio should loop
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";

export interface AudioTrack {
  src: string;
  offset: number;
  startFrom: number;
  endAt: number;
  volume: number;
  loop: boolean;
}

interface AudioLayerProps {
  tracks: AudioTrack[];
}

/** Renders one <Audio> per track, wrapped in a <Sequence> for timing offset. */
export const AudioLayer: React.FC<AudioLayerProps> = ({ tracks }) => {
  if (!tracks || tracks.length === 0) return null;

  return (
    <>
      {tracks.map((track, i) => {
        // Convert "/audio/foo.mp3" → staticFile("audio/foo.mp3")
        const resolvedSrc = track.src.startsWith("/")
          ? staticFile(track.src.slice(1))
          : staticFile(track.src);

        return (
          <Sequence key={i} from={track.offset ?? 0} layout="none">
            <Audio
              src={resolvedSrc}
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
