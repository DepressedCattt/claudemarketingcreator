/**
 * @remotion/three utilities — barrel export.
 *
 * Import from this path to access all 3D composition utilities:
 *   import { ThreeScene, GlassCard, ParticleField } from "../utils/three";
 *
 * Architecture: two-layer composition pattern
 *   ┌─────────────────────────────────────────────────────┐
 *   │  [Layer 1] CSS: background gradients, glow divs     │
 *   │  [Layer 2] ThreeScene (alpha=true, shows L1 thru)   │
 *   │              GlassCard, ParticleField, lights, etc. │
 *   │  [Layer 3] CSS: text, UI overlays, buttons          │
 *   └─────────────────────────────────────────────────────┘
 *   DOM order (later in JSX = on top) handles z-layering.
 *   Always place text/UI divs AFTER ThreeScene in JSX.
 */

export { ThreeScene } from "./ThreeScene";
export type { ThreeSceneProps, EnvironmentPreset } from "./ThreeScene";

export { GlassCard } from "./GlassCard";
export type { GlassCardProps } from "./GlassCard";

export { ParticleField } from "./ParticleField";
export type { ParticleFieldProps, ParticleMode } from "./ParticleField";

export {
  useRemotionThreeFrame,
  pxToWorldX,
  pxToWorldY,
  canvasPosToWorld,
  PPU_1080,
  PPU_1920,
} from "./useRemotionFrame";
export type { RemotionThreeFrame } from "./useRemotionFrame";
