/**
 * VerticalAd — Main Composition
 *
 * This is the core rendering engine. It receives an AdConfig,
 * computes the scene layout, and sequences each scene in order.
 *
 * To render a different ad, change the config passed to defaultProps
 * in Root.tsx (or in the Composition registration).
 *
 * SCENE REGISTRY: To add a new scene type, add it to SCENE_MAP below.
 */

import React from "react";
import { AbsoluteFill, Audio, Sequence } from "remotion";
import { AdConfig, SceneType, TransitionMode } from "../data/types";
import { SceneTransition } from "../components/SceneTransition";
import { CTAScene } from "../scenes/CTAScene";
import { FeatureScene } from "../scenes/FeatureScene";
import { HookScene } from "../scenes/HookScene";
import { LogoEndCard } from "../scenes/LogoEndCard";
import { ProblemScene } from "../scenes/ProblemScene";
import { SocialProofScene } from "../scenes/SocialProofScene";
import { SolutionScene } from "../scenes/SolutionScene";
import { KineticTextScene } from "../scenes/KineticTextScene";
import { CounterRevealScene } from "../scenes/CounterRevealScene";
import { SplitRevealScene } from "../scenes/SplitRevealScene";
import { TimelineScene } from "../scenes/TimelineScene";
import { PriceRevealScene } from "../scenes/PriceRevealScene";
import { ChartScene } from "../scenes/ChartScene";
import { ParticleScene } from "../scenes/ParticleScene";
import { Flip3DScene } from "../scenes/Flip3DScene";
import { DrawPathScene } from "../scenes/DrawPathScene";
import { CodeRevealScene } from "../scenes/CodeRevealScene";
import { ParallaxScene } from "../scenes/ParallaxScene";
import { LottieScene } from "../scenes/LottieScene";
import { DiamondScene } from "../scenes/DiamondScene";
import { GlbModelScene } from "../scenes/GlbModelScene";
import { buildSceneLayout } from "../utils/timing";

// ─── Scene Registry ───────────────────────────────────────────────────────────
// Maps SceneType strings → React scene components.
// Add new scene types here as you create them.

type SceneComponent = React.FC<{
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}>;

const SCENE_MAP: Record<SceneType, SceneComponent> = {
  // Core scenes
  hook:             HookScene,
  problem:          ProblemScene,
  solution:         SolutionScene,
  feature:          FeatureScene,
  "social-proof":   SocialProofScene,
  cta:              CTAScene,
  "logo-end-card":  LogoEndCard,
  // Motion / text
  "kinetic-text":   KineticTextScene,
  "counter-reveal": CounterRevealScene,
  "split-reveal":   SplitRevealScene,
  "timeline":       TimelineScene,
  "price-reveal":   PriceRevealScene,
  // Data & charts
  "chart":          ChartScene,
  // Visual spectacle
  "particle":       ParticleScene,
  "flip-card":      Flip3DScene,
  "draw-path":      DrawPathScene,
  "code-reveal":    CodeRevealScene,
  "parallax":       ParallaxScene,
  "lottie":         LottieScene,
  "diamond-3d":     DiamondScene,
  "glb-model":      GlbModelScene,
};

// ─── Props ────────────────────────────────────────────────────────────────────

export interface VerticalAdProps {
  config: AdConfig;
}

// ─── Composition ─────────────────────────────────────────────────────────────

export const VerticalAd: React.FC<VerticalAdProps> = ({ config }) => {
  const { timing, brand } = config;

  // Build the frame layout from the scene config array
  const layout = buildSceneLayout(timing.scenes, timing.fps);

  return (
    <AbsoluteFill style={{ backgroundColor: brand.colors.background }}>
      {/* Background audio track */}
      {config.media.audio && (
        <Audio
          src={config.media.audio.src}
          volume={config.media.audio.volume ?? 0.6}
          startFrom={config.media.audio.startFrom ?? 0}
          {...(config.media.audio.endAt !== undefined
            ? { endAt: config.media.audio.endAt }
            : {})}
        />
      )}
      {layout.map((scene, i) => {
        const SceneComponent = SCENE_MAP[scene.type as SceneType];

        if (!SceneComponent) {
          console.warn(`[AdEngine] Unknown scene type: "${scene.type}". Skipping.`);
          return null;
        }

        const transition: TransitionMode = scene.transition ?? "fade";

        return (
          <Sequence
            key={`${scene.type}-${i}`}
            from={scene.startFrame}
            durationInFrames={scene.durationFrames}
          >
            <SceneTransition transition={transition} durationFrames={scene.durationFrames}>
              <SceneComponent
                config={config}
                durationFrames={scene.durationFrames}
                sceneProps={scene.props}
              />
            </SceneTransition>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
