/**
 * ThreeScene — reusable R3F canvas wrapper for Remotion compositions.
 *
 * Provides the foundation layer for all 3D compositions:
 *   - ThreeCanvas from @remotion/three (connects R3F to Remotion's frame system)
 *   - PerspectiveCamera at a calibrated distance
 *   - Drei Environment preset for reflections and ambient lighting
 *   - Optional Bloom post-processing via @react-three/postprocessing
 *   - Transparent canvas background (gl.alpha = true) — CSS layers behind show through
 *
 * Architecture note:
 *   ThreeScene is intended to be ONE layer in a multi-layer composition:
 *
 *     [Layer 1] CSS background divs, glow gradients     ← positioned behind ThreeScene
 *     [Layer 2] ThreeScene (transparent bg)             ← 3D objects rendered here
 *     [Layer 3] CSS text + UI overlays                  ← positioned after ThreeScene in DOM
 *
 *   DOM order (later = on top) handles the z-layering without needing explicit z-index.
 *   Place all text/UI divs AFTER the ThreeScene in the JSX tree.
 *
 * Coordinate system (fov=40, cameraZ=6, 1080px canvas):
 *   1 world unit ≈ 247px. Y axis is UP (inverted vs CSS Y-down).
 *   Use pxToWorldX / pxToWorldY from useRemotionFrame.ts for conversions.
 *
 * @example
 * <ThreeScene enableBloom bloomIntensity={1.2}>
 *   <GlassCard entryFrame={0} accentColor="#F97316" />
 *   <ParticleField count={400} mode="ambient" color="#F97316" opacity={0.15} />
 *   <pointLight position={[0, 1, 2]} color="#F97316" intensity={3} />
 * </ThreeScene>
 */

import React from "react";
import { useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Environment, PerspectiveCamera } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// Available Drei environment presets
export type EnvironmentPreset =
  | "sunset"
  | "dawn"
  | "night"
  | "warehouse"
  | "forest"
  | "apartment"
  | "studio"
  | "city"
  | "park"
  | "lobby";

export interface ThreeSceneProps {
  children: React.ReactNode;
  /**
   * Camera Z position (distance from origin, default 6).
   * Increase to zoom out (shows more world). Decrease to zoom in.
   * Standard calibration: cameraZ=6, fov=40 → 1 unit = 247px on 1080px canvas.
   */
  cameraZ?: number;
  /**
   * Perspective camera field-of-view in degrees (default 40).
   * Lower values = longer focal length / narrower FOV (more telephoto feel).
   */
  fov?: number;
  /**
   * Drei environment preset for image-based lighting and reflections (default "studio").
   * "studio" is ideal for product/card ads — neutral, professional.
   * "sunset" / "dawn" add warm tints to metallic surfaces.
   */
  environment?: EnvironmentPreset;
  /**
   * Ambient light intensity (default 0.15).
   * Keep low — the Environment IBL provides most of the fill light.
   */
  ambientIntensity?: number;
  /**
   * Enable Bloom post-processing (default false).
   * Adds a cinematic glow to bright emissive surfaces.
   * Carry: adds ~2ms to render time per frame. Keep disabled if not needed.
   */
  enableBloom?: boolean;
  /**
   * Bloom glow intensity (default 0.8).
   * Values 0.6–1.2 are cinematic; above 2.0 reads as over-done.
   */
  bloomIntensity?: number;
  /**
   * Bloom luminance threshold (default 0.35).
   * Only areas brighter than this value bloom. Lower = more bloom spread.
   */
  bloomThreshold?: number;
  /**
   * Bloom luminance smoothing (default 0.9).
   * Controls transition width at the threshold.
   */
  bloomSmoothing?: number;
}

export const ThreeScene: React.FC<ThreeSceneProps> = ({
  children,
  cameraZ = 6,
  fov = 40,
  environment = "studio",
  ambientIntensity = 0.15,
  enableBloom = false,
  bloomIntensity = 0.8,
  bloomThreshold = 0.35,
  bloomSmoothing = 0.9,
}) => {
  const { width, height } = useVideoConfig();

  return (
    // position: absolute + inset: 0 makes ThreeCanvas fill the parent container.
    // No background on this wrapper — the WebGL canvas has alpha: true,
    // making transparent areas see-through to whatever CSS layers are behind it.
    <div style={{ position: "absolute", inset: 0 }}>
      <ThreeCanvas
        width={width}
        height={height}
        gl={{
          antialias: false, // disabled for performance; Bloom compensates visually
          alpha: true,      // transparent canvas — CSS backgrounds show through
        }}
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, cameraZ]}
          fov={fov}
          near={0.1}
          far={100}
        />
        <ambientLight intensity={ambientIntensity} />
        <Environment preset={environment} />

        {children}

        {enableBloom && (
          <EffectComposer>
            <Bloom
              intensity={bloomIntensity}
              luminanceThreshold={bloomThreshold}
              luminanceSmoothing={bloomSmoothing}
              mipmapBlur
            />
          </EffectComposer>
        )}
      </ThreeCanvas>
    </div>
  );
};
