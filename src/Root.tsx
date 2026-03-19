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
import { PulseAd } from "./compositions/PulseAd";
import { ApexAd } from "./compositions/ApexAd";
import { ApexAd3D } from "./compositions/ApexAd3D";
import { Dimension3DAd } from "./compositions/Dimension3DAd";
import { IPhoneAd } from "./compositions/IPhoneAd";
import { VelourAd } from "./compositions/VelourAd";
import { BloomAd } from "./compositions/BloomAd";
import { MaisonCielAd } from "./compositions/MaisonCielAd";
import { ElumeAd } from "./compositions/ElumeAd";
import { HavenAd } from "./compositions/HavenAd";
import { LumenAd } from "./compositions/LumenAd";
import { AuraSalonAd } from "./compositions/AuraSalonAd";
import { SeriAd }      from "./compositions/SeriAd";
import { SharedSalonFinalAd } from "./compositions/SharedSalonFinalAd";
import { SharedSalonOneShot }   from "./compositions/SharedSalonOneShot";
import { SharedSalonKineticAd } from "./compositions/SharedSalonKineticAd";
import { SharedSalonCinemaAd }  from "./compositions/SharedSalonCinemaAd";
import { CinemaRevealAd }       from "./compositions/CinemaRevealAd";
import { AwesomeAd }            from "./compositions/AwesomeAd";
import { AudioEditor, AudioEditorDefaultProps } from "./compositions/AudioEditor";
import { withAudio } from "./components/AudioLayer";
import { activeAd } from "./data/activeAd";
import { getTotalDuration } from "./utils/timing";

// Audio-wrapped variants — accept audioTracks prop at render time via --props
const PulseAdWithAudio  = withAudio(PulseAd);
const FormaAd2WithAudio = withAudio(FormaAd2);
const ApexAdWithAudio   = withAudio(ApexAd);

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
      <Composition id="forma2-v1" component={FormaAd2WithAudio} durationInFrames={519} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />

      {/* PulseAd — 1:1, 18s, 120 BPM */}
      <Composition id="pulse-v1"  component={PulseAdWithAudio}  durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />

      {/* ApexAd — 1:1, 18s, 120 BPM — SaaS CRM "Close faster." */}
      <Composition id="apex-v1"   component={ApexAdWithAudio}   durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      {/* ApexAd3D — 1:1, 18s — same as apex-v1 but with real Three.js GlassCard + Bloom */}
      <Composition id="apex-3d-v1" component={ApexAd3D}         durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{}} />
      {/* Dimension3DAd — 1:1, 15s — 5-scene showcase of new 3D capabilities */}
      <Composition id="dimension-3d-v1" component={Dimension3DAd} durationInFrames={450} fps={30} width={1080} height={1080} defaultProps={{}} />
      {/* IPhoneAd — 1:1, 15s — realistic iPhone 17 Pro product reveal */}
      <Composition id="iphone-v1" component={IPhoneAd} durationInFrames={450} fps={30} width={1080} height={1080} defaultProps={{}} />

      {/* ── Beauty Industry Ads ───────────────────────────────────────────── */}
      {/* VelourAd — 9:16, 18s — luxury barbershop/salon, editorial dark gold */}
      <Composition id="velour-v1" component={VelourAd} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* BloomAd — 1:1, 18s — bespoke floral design studio, cream/forest green */}
      <Composition id="bloom-v1"  component={BloomAd}  durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{}} />
      {/* MaisonCielAd — 16:9, 18s — fashion boutique, deep navy/champagne */}
      <Composition id="maison-ciel-v1" component={MaisonCielAd} durationInFrames={540} fps={30} width={1920} height={1080} defaultProps={{}} />
      {/* ElumeAd — 9:16, 18s — luxe social transformation, silk black + champagne + rose-gold */}
      <Composition id="elume-v1" component={ElumeAd} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* HavenAd — 9:16, 18s — warm trust-building, ivory + terracotta + espresso */}
      <Composition id="haven-v1" component={HavenAd} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* LumenAd — 9:16, 18s — kinetic one-shot, clip-path match transitions, copper */}
      <Composition id="lumen-v1" component={LumenAd} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* AuraSalonAd — 9:16, 18s — kinetic object-based transitions, salon journey */}
      <Composition id="aura-salon-v1" component={AuraSalonAd} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* SeriAd — 9:16, 18s — layered motion design, masks/wipes/parallax, dusty mauve */}
      <Composition id="seri-v1" component={SeriAd} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* SharedSalonFinalAd — 9:16, 26s — premium product commercial, Apple-style cinematography, 120 BPM */}
      <Composition id="shared-salon-final" component={SharedSalonFinalAd} durationInFrames={780} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* SharedSalonOneShot — 9:16, 26s — true one-shot, element-driven transitions, no cuts */}
      <Composition id="shared-salon-oneshot" component={SharedSalonOneShot} durationInFrames={780} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* SharedSalonKineticAd — 9:16, 25s — playful camera: tilt-up, dutch, orbital arc, tracking shot */}
      <Composition id="shared-salon-kinetic" component={SharedSalonKineticAd} durationInFrames={756} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* SharedSalonCinemaAd — 9:16, 4s (Seq 1) — 3D iPhone camera rise + dimensional pull-back */}
      <Composition id="shared-salon-cinema" component={SharedSalonCinemaAd} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* CinemaRevealAd — 9:16, 10s — simulated cinematography reference: depth tiers + parallax */}
      <Composition id="cinema-reveal" component={CinemaRevealAd} durationInFrames={480} fps={30} width={1080} height={1920} defaultProps={{}} />
      {/* AwesomeAd — 9:16, 5s — Scene 1: camera rises up the phone face then pulls back to full reveal */}
      <Composition id="awesome-ad" component={AwesomeAd} durationInFrames={150} fps={30} width={1080} height={1920} defaultProps={{}} />

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
