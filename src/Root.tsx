/**
 * Root — Remotion Composition Registry
 *
 * This file registers all Remotion compositions.
 * Each composition corresponds to one renderable output format.
 *
 * HOW TO CHANGE THE ACTIVE AD:
 *   1. Edit src/data/activeAd.ts to import a different example
 *   2. Or create a new AdConfig object and export it from activeAd.ts
 *   3. The composition will auto-size its duration to match your scene config
 *
 * TO ADD A NEW COMPOSITION FORMAT (e.g. square):
 *   Add a new <Composition> block below with the appropriate dimensions.
 */

import React from "react";
import { Composition } from "remotion";
import { VerticalAd } from "./compositions/VerticalAd";
import { FormaAd2 } from "./compositions/FormaAd2";
import { ArcflowAd } from "./compositions/ArcflowAd";
import { CrestAd } from "./compositions/CrestAd";
import { FlowDeskAd } from "./compositions/FlowDeskAd";
import { HeroExpansionAd } from "./compositions/HeroExpansionAd";
import { KineticTypographyAd } from "./compositions/KineticTypographyAd";
import { LuminaryAd } from "./compositions/LuminaryAd";
import { MeridianAd } from "./compositions/MeridianAd";
import { NovaSkinAd } from "./compositions/NovaSkinAd";
import { SolaceAd } from "./compositions/SolaceAd";
import { TrailBlazeAd } from "./compositions/TrailBlazeAd";
import { VeridianAd as VeridianAdComp } from "./compositions/VeridianAd";
import { AudioEditor, AudioEditorDefaultProps } from "./compositions/AudioEditor";
import { activeAd } from "./data/activeAd";
import { getTotalDuration } from "./utils/timing";

// Remotion's Composition component requires a loosely-typed component reference.
// We cast to any here to satisfy the generic constraint while keeping
// full type safety inside the VerticalAd component itself.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdComposition = VerticalAd as React.ComponentType<any>;

export const RemotionRoot: React.FC = () => {
  const totalFrames = getTotalDuration(activeAd.timing.scenes, activeAd.timing.fps);

  return (
    <>
      {/*
       * PRIMARY: Vertical 9:16 — for TikTok, Reels, YouTube Shorts, Stories
       */}
      <Composition
        id="VerticalAd"
        component={AdComposition}
        durationInFrames={totalFrames}
        fps={activeAd.timing.fps}
        width={1080}
        height={1920}
        defaultProps={{ config: activeAd }}
      />

      {/*
       * OPTIONAL: Square 1:1 — for Instagram Feed, Twitter
       * Uncomment to enable.
       *
       * <Composition
       *   id="SquareAd"
       *   component={AdComposition}
       *   durationInFrames={totalFrames}
       *   fps={activeAd.timing.fps}
       *   width={1080}
       *   height={1080}
       *   defaultProps={{ config: activeAd }}
       * />
       */}

      {/* FormaAd2 — 1:1 square, 17.3s */}
      <Composition id="forma2-v1"         component={FormaAd2}          durationInFrames={519} fps={30} width={1080} height={1080} defaultProps={{}} />

      {/* ── Existing compositions ─────────────────────────────────────────── */}
      {/* ArcflowAd — 16:9, 20s */}
      <Composition id="arcflow"           component={ArcflowAd}         durationInFrames={600} fps={30} width={1920} height={1080} defaultProps={{}} />
      {/* CrestAd — 16:9, 15s */}
      <Composition id="crest"             component={CrestAd}           durationInFrames={450} fps={30} width={1920} height={1080} defaultProps={{}} />
      {/* FlowDeskAd — 1:1, 15s */}
      <Composition id="flowdesk"          component={FlowDeskAd}        durationInFrames={450} fps={30} width={1080} height={1080} defaultProps={{}} />
      {/* HeroExpansionAd — 1:1, 10s */}
      <Composition id="hero-expansion"    component={HeroExpansionAd}   durationInFrames={300} fps={30} width={1080} height={1080} defaultProps={{}} />
      {/* KineticTypographyAd — 16:9, 10s */}
      <Composition id="kinetic-type"      component={KineticTypographyAd} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{}} />
      {/* LuminaryAd — 9:16, 18s */}
      <Composition id="luminary"          component={LuminaryAd}        durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* MeridianAd — 1:1, 18s */}
      <Composition id="meridian"          component={MeridianAd}        durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{}} />
      {/* NovaSkinAd — 9:16, 15s */}
      <Composition id="nova-skin"         component={NovaSkinAd}        durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* SolaceAd — 1:1, 15s */}
      <Composition id="solace"            component={SolaceAd}          durationInFrames={450} fps={30} width={1080} height={1080} defaultProps={{}} />
      {/* TrailBlazeAd — 16:9, 15s */}
      <Composition id="trailblaze"        component={TrailBlazeAd}      durationInFrames={450} fps={30} width={1920} height={1080} defaultProps={{}} />
      {/* VeridianAd — 9:16, 15s */}
      <Composition id="veridian"          component={VeridianAdComp}    durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={{}} />

      {/* ── Audio Editor ─────────────────────────────────────────────────── */}
      {/* 16:9, 60s scrubbing range — set audioSrc + props in the Props panel */}
      <Composition
        id="audio-editor"
        component={AudioEditor as React.ComponentType<Record<string, unknown>>}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={AudioEditorDefaultProps as unknown as Record<string, unknown>}
      />
    </>
  );
};
