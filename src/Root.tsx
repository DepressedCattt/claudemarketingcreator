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
import { LangEaseAd }          from "./compositions/LangEaseAd";
import { SaasExplainerAd }     from "./compositions/SaasExplainerAd";
import { SaasExplainerV2 }    from "./compositions/SaasExplainerV2";
import { SaasShowcaseAd }     from "./compositions/SaasShowcaseAd";
import { SaasShowcase2Ad }    from "./compositions/SaasShowcase2Ad";
import { SaasPlaygroundAd }  from "./compositions/SaasPlaygroundAd";
import { SaasCameraAd }     from "./compositions/SaasCameraAd";
import { Saas3DRealmAd }   from "./compositions/Saas3DRealmAd";
import { Saas3DRealm2Ad } from "./compositions/Saas3DRealm2Ad";
import { SaasSimpleComponentAd } from "./compositions/SaasSimpleComponentAd";
import { SaasMediumComponentAd } from "./compositions/SaasMediumComponentAd";
import { TerrraSurfaceAd } from "./compositions/TerrraSurfaceAd";
import { FlowPilotAd } from "./compositions/FlowPilotAd";
import { FlowPilotV2Ad } from "./compositions/FlowPilotV2Ad";
import { DeskflowAd } from "./compositions/DeskflowAd";
import { AnimTestAd } from "./compositions/AnimTestAd";
import { AeReplicaAd } from "./compositions/AeReplicaAd";
import { CalmlyAd } from "./compositions/CalmlyAd";
import { GreenTaskAd } from "./compositions/GreenTaskAd";
import { AnimDrillAd } from "./compositions/AnimDrillAd";
import { AnimlyAd } from "./compositions/AnimlyAd";
import { SmallSpotAd } from "./compositions/SmallSpotAd";
import { AudioEditor, AudioEditorDefaultProps } from "./compositions/AudioEditor";
import { withAudio } from "./components/AudioLayer";
import { activeAd } from "./data/activeAd";
import { getTotalDuration } from "./utils/timing";

// Audio-wrapped variants — accept audioTracks prop at render time via --props.
// Every composition is wrapped so that CLI renders include audio tracks from
// the Studio's state.json automatically.
const w = withAudio;
const PulseAdWithAudio           = w(PulseAd);
const FormaAd2WithAudio          = w(FormaAd2);
const ApexAdWithAudio            = w(ApexAd);
const ApexAd3DWithAudio          = w(ApexAd3D);
const Dimension3DAdWithAudio     = w(Dimension3DAd);
const IPhoneAdWithAudio          = w(IPhoneAd);
const VelourAdWithAudio          = w(VelourAd);
const BloomAdWithAudio           = w(BloomAd);
const MaisonCielAdWithAudio      = w(MaisonCielAd);
const ElumeAdWithAudio           = w(ElumeAd);
const HavenAdWithAudio           = w(HavenAd);
const LumenAdWithAudio           = w(LumenAd);
const AuraSalonAdWithAudio       = w(AuraSalonAd);
const SeriAdWithAudio            = w(SeriAd);
const SharedSalonFinalAdAudio    = w(SharedSalonFinalAd);
const SharedSalonOneShotAudio    = w(SharedSalonOneShot);
const SharedSalonKineticAdAudio  = w(SharedSalonKineticAd);
const SharedSalonCinemaAdAudio   = w(SharedSalonCinemaAd);
const CinemaRevealAdWithAudio    = w(CinemaRevealAd);
const AwesomeAdWithAudio         = w(AwesomeAd);
const LangEaseAdWithAudio        = w(LangEaseAd);
const SaasExplainerAdWithAudio   = w(SaasExplainerAd);
const SaasExplainerV2WithAudio   = w(SaasExplainerV2);
const SaasShowcaseAdWithAudio    = w(SaasShowcaseAd);
const SaasShowcase2AdWithAudio   = w(SaasShowcase2Ad);
const SaasPlaygroundAdWithAudio  = w(SaasPlaygroundAd);
const SaasCameraAdWithAudio      = w(SaasCameraAd);
const Saas3DRealmAdWithAudio     = w(Saas3DRealmAd);
const Saas3DRealm2AdWithAudio    = w(Saas3DRealm2Ad);
const SaasSimpleComponentWithAudio = w(SaasSimpleComponentAd);
const SaasMediumComponentWithAudio = w(SaasMediumComponentAd);
const TerrraSurfaceAdWithAudio   = w(TerrraSurfaceAd);
const FlowPilotAdWithAudio       = w(FlowPilotAd);
const FlowPilotV2AdWithAudio     = w(FlowPilotV2Ad);
const DeskflowAdWithAudio        = w(DeskflowAd);
const AeReplicaAdWithAudio       = w(AeReplicaAd);
const AnimTestAdWithAudio        = w(AnimTestAd);
const CalmlyAdWithAudio          = w(CalmlyAd);
const GreenTaskAdWithAudio       = w(GreenTaskAd);
const AnimDrillAdWithAudio       = w(AnimDrillAd);
const AnimlyAdWithAudio          = w(AnimlyAd);
const SmallSpotAdWithAudio       = w(SmallSpotAd);
const ArcflowAdWithAudio         = w(ArcflowAd);
const CrestAdWithAudio           = w(CrestAd);
const FlowDeskAdWithAudio        = w(FlowDeskAd);
const HeroExpansionAdWithAudio   = w(HeroExpansionAd);
const KineticTypographyAdAudio   = w(KineticTypographyAd);
const LuminaryAdWithAudio        = w(LuminaryAd);
const MeridianAdWithAudio        = w(MeridianAd);
const NovaSkinAdWithAudio        = w(NovaSkinAd);
const SolaceAdWithAudio          = w(SolaceAd);
const TrailBlazeAdWithAudio      = w(TrailBlazeAd);
const VeridianAdWithAudio        = w(VeridianAdComp);

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

      {/* FormaAd2 — 1:1 square, 21s — LangEase SaaS recreation, iter2 rebuild */}
      <Composition id="forma2-v1" component={FormaAd2WithAudio} durationInFrames={630} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />

      {/* PulseAd — 1:1, 18s, 120 BPM */}
      <Composition id="pulse-v1"  component={PulseAdWithAudio}  durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />

      {/* ApexAd — 1:1, 18s, 120 BPM — SaaS CRM "Close faster." */}
      <Composition id="apex-v1"   component={ApexAdWithAudio}   durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      {/* ApexAd3D — 1:1, 18s — same as apex-v1 but with real Three.js GlassCard + Bloom */}
      <Composition id="apex-3d-v1" component={ApexAd3DWithAudio} durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      {/* Dimension3DAd — 1:1, 15s — 5-scene showcase of new 3D capabilities */}
      <Composition id="dimension-3d-v1" component={Dimension3DAdWithAudio} durationInFrames={450} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      {/* IPhoneAd — 1:1, 15s — realistic iPhone 17 Pro product reveal */}
      <Composition id="iphone-v1" component={IPhoneAdWithAudio} durationInFrames={450} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />

      {/* ── Beauty Industry Ads ───────────────────────────────────────────── */}
      <Composition id="velour-v1" component={VelourAdWithAudio} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="bloom-v1"  component={BloomAdWithAudio}  durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="maison-ciel-v1" component={MaisonCielAdWithAudio} durationInFrames={540} fps={30} width={1920} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="elume-v1" component={ElumeAdWithAudio} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="haven-v1" component={HavenAdWithAudio} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="lumen-v1" component={LumenAdWithAudio} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="aura-salon-v1" component={AuraSalonAdWithAudio} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="seri-v1" component={SeriAdWithAudio} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="shared-salon-final" component={SharedSalonFinalAdAudio} durationInFrames={780} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="shared-salon-oneshot" component={SharedSalonOneShotAudio} durationInFrames={780} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="shared-salon-kinetic" component={SharedSalonKineticAdAudio} durationInFrames={756} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="shared-salon-cinema" component={SharedSalonCinemaAdAudio} durationInFrames={120} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="cinema-reveal" component={CinemaRevealAdWithAudio} durationInFrames={480} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="awesome-ad" component={AwesomeAdWithAudio} durationInFrames={150} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="langease-v1" component={LangEaseAdWithAudio} durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-explainer" component={SaasExplainerAdWithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-explainer-v2" component={SaasExplainerV2WithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-showcase" component={SaasShowcaseAdWithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-showcase-2" component={SaasShowcase2AdWithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-playground" component={SaasPlaygroundAdWithAudio} durationInFrames={1120} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-camera" component={SaasCameraAdWithAudio} durationInFrames={450} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-3d-realm" component={Saas3DRealmAdWithAudio} durationInFrames={540} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-3d-realm-2" component={Saas3DRealm2AdWithAudio} durationInFrames={540} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-simple-component" component={SaasSimpleComponentWithAudio} durationInFrames={540} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="saas-medium-component" component={SaasMediumComponentWithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="terrra-surface-v1" component={TerrraSurfaceAdWithAudio} durationInFrames={900} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />

      <Composition id="flowpilot-v1" component={FlowPilotAdWithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="flowpilot-v2" component={FlowPilotV2AdWithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="deskflow-v1" component={DeskflowAdWithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />

      <Composition id="ae-replica" component={AeReplicaAdWithAudio} durationInFrames={150} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="anim-test" component={AnimTestAdWithAudio} durationInFrames={600} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="calmly-v1" component={CalmlyAdWithAudio} durationInFrames={390} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="greentask-v1" component={GreenTaskAdWithAudio} durationInFrames={670} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="anim-drill" component={AnimDrillAdWithAudio} durationInFrames={150} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="animly-v1" component={AnimlyAdWithAudio} durationInFrames={706} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />
      <Composition id="smallspot-v1" component={SmallSpotAdWithAudio} durationInFrames={706} fps={30} width={3840} height={2160} defaultProps={{ audioTracks: [] }} />

      {/* ── Existing compositions ─────────────────────────────────────────── */}
      <Composition id="arcflow"           component={ArcflowAdWithAudio}       durationInFrames={600} fps={30} width={1920} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="crest"             component={CrestAdWithAudio}         durationInFrames={450} fps={30} width={1920} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="flowdesk"          component={FlowDeskAdWithAudio}      durationInFrames={450} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="hero-expansion"    component={HeroExpansionAdWithAudio} durationInFrames={300} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="kinetic-type"      component={KineticTypographyAdAudio} durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="luminary"          component={LuminaryAdWithAudio}      durationInFrames={540} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="meridian"          component={MeridianAdWithAudio}      durationInFrames={540} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="nova-skin"         component={NovaSkinAdWithAudio}      durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />
      <Composition id="solace"            component={SolaceAdWithAudio}        durationInFrames={450} fps={30} width={1080} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="trailblaze"        component={TrailBlazeAdWithAudio}    durationInFrames={450} fps={30} width={1920} height={1080} defaultProps={{ audioTracks: [] }} />
      <Composition id="veridian"          component={VeridianAdWithAudio}      durationInFrames={450} fps={30} width={1080} height={1920} defaultProps={{ audioTracks: [] }} />

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
