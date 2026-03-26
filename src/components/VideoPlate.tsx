/**
 * VideoPlate
 *
 * Passive video background layer for Remotion compositions.
 * Renders an AI-generated background plate beneath all composition content.
 *
 * ── Usage (registry reference — recommended) ──────────────────────────────
 *
 *   import { VideoPlate } from "../components/VideoPlate";
 *
 *   // In your composition root, as the FIRST child of the outer AbsoluteFill:
 *   <VideoPlate plateId="haven-warm" scrimColor={C.bg} />
 *
 *   The registry supplies pre-tuned opacity and scrimOpacity values.
 *   Override scrimColor with your composition's C.bg token — this color-grades
 *   the video to feel native to your palette.
 *
 * ── Usage (manual props) ───────────────────────────────────────────────────
 *
 *   <VideoPlate
 *     src={staticFile("video/custom-bg.mp4")}
 *     opacity={0.35}
 *     scrimColor="#0C0A0D"
 *     scrimOpacity={0.45}
 *   />
 *
 * ── Layer order inside this component ─────────────────────────────────────
 *   1. OffthreadVideo  — the plate, looping, muted, objectFit cover
 *   2. Scrim div       — flat color at scrimOpacity, acts as palette color grade
 *
 * ── Placement in composition ──────────────────────────────────────────────
 *   Always place VideoPlate BEFORE any camera motion wrapper divs and scene
 *   Sequences. Never place it inside a <Sequence>.
 *
 * ── Scrim tuning guide ────────────────────────────────────────────────────
 *   Light palette ads (cream, ivory, white bg):  scrimOpacity 0.55–0.65
 *   Dark palette ads (navy, black, espresso bg):  scrimOpacity 0.35–0.45
 *   When in doubt, start at 0.55 and reduce until background reads as depth.
 */

import React from "react";
import { AbsoluteFill, OffthreadVideo } from "remotion";
import { VIDEO_PLATES, VideoPlateId } from "../data/videoPlates";

// ─── Prop Types ───────────────────────────────────────────────────────────────

type RegistryProps = {
  /** Reference a pre-registered plate from src/data/videoPlates.ts */
  plateId: VideoPlateId;
  /** Override the scrim color (defaults to registry paletteHint).
   *  Set to your composition's C.bg token for automatic palette matching. */
  scrimColor?: string;
  /** Override the scrim opacity (defaults to registry defaultScrimOpacity). */
  scrimOpacity?: number;
  /** Override the video opacity (defaults to registry defaultOpacity). */
  opacity?: number;
};

type ManualProps = {
  plateId?: never;
  /** Path from staticFile() — e.g. staticFile("video/my-plate.mp4") */
  src: string;
  /** Video layer opacity 0–1 (default: 0.40) */
  opacity?: number;
  /** Flat color scrim rendered over the video for palette color grading.
   *  Use your composition's C.bg token. */
  scrimColor?: string;
  /** Scrim opacity 0–1 (default: 0.55) */
  scrimOpacity?: number;
};

type VideoPlateProps = RegistryProps | ManualProps;

// ─── Component ───────────────────────────────────────────────────────────────

export const VideoPlate: React.FC<VideoPlateProps> = (props) => {
  let src: string;
  let opacity: number;
  let scrimColor: string;
  let scrimOpacity: number;

  if ("plateId" in props && props.plateId !== undefined) {
    // Registry reference — load defaults from the registry entry
    const entry = VIDEO_PLATES[props.plateId];
    src         = entry.src;
    opacity     = props.opacity      ?? entry.defaultOpacity;
    scrimColor  = props.scrimColor   ?? entry.paletteHint;
    scrimOpacity = props.scrimOpacity ?? entry.defaultScrimOpacity;
  } else {
    // Manual props
    const p     = props as ManualProps;
    src         = p.src;
    opacity     = p.opacity      ?? 0.40;
    scrimColor  = p.scrimColor   ?? "#000000";
    scrimOpacity = p.scrimOpacity ?? 0.55;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* Layer 1 — Video plate */}
      <AbsoluteFill style={{ opacity }}>
        <OffthreadVideo
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
          loop
        />
      </AbsoluteFill>

      {/* Layer 2 — Palette scrim / color grade */}
      {scrimOpacity > 0 && (
        <AbsoluteFill
          style={{
            background: scrimColor,
            opacity: scrimOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
