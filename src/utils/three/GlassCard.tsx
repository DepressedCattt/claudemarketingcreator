/**
 * GlassCard — 3D rounded-box card with MeshPhysicalMaterial.
 *
 * Replaces the CSS prism-rim card + CSS rotateX/Y "3D" technique.
 * Provides real material depth:
 *   - MeshPhysicalMaterial: roughness, metalness, transmission (glass refraction)
 *   - Environment IBL reflections on card surface
 *   - Emissive accent rim strip (top edge) — matches brand accent color
 *   - Real geometry depth — no preserve-3d limitations, no boxShadow math
 *
 * Animation replicates the CSS patterns from premiumMotion.ts exactly:
 *   - useArcEntry: same arc path from same pixel offset values, converted to world units
 *   - Directional drift: constant-direction spin (not oscillation) — born moving
 *   - useHeroFloatDelayed: Y float starts after card settles
 *   - depthDeemphasis: card shifts right and de-emphasises when features take focus
 *
 * Coordinate system note:
 *   CSS Y-down is negated for Three.js Y-up. All arc/float CSS px values are
 *   divided by PPU_1080 (247) to convert to world units.
 *
 * @example
 * // Inside a ThreeScene, local frame 0 = when Sequence begins
 * <GlassCard
 *   entryFrame={0}
 *   fromX={-110} fromY={150}
 *   accentColor="#F97316"
 *   exitFrame={120}
 * />
 */

import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { RoundedBox } from "@react-three/drei";
import {
  useArcEntry,
  useBlurResolve,
  useHeroFloatDelayed,
  useSoftScaleIn,
  rawProgress,
  easeInOut3,
  depthDeemphasis,
  PREMIUM_SPRING,
} from "../premiumMotion";
import { PPU_1080 } from "./useRemotionFrame";

const PPU = PPU_1080; // 1 world unit = 247px on a 1080px canvas (fov=40, cameraZ=6)
const DEG = Math.PI / 180; // degrees to radians

// ─── Card geometry constants ───────────────────────────────────────────────────
// Match the CSS DealCard dimensions on 1080px canvas:
//   CSS card: 360px wide × ~295px tall → 1.46w × 1.19h world units
//   Add rim padding: ~370px wide × ~305px → 1.50w × 1.24h
const CARD_W = 1.5;
const CARD_H = 1.24;
const CARD_D = 0.06; // card depth (thickness)
const CARD_R = 0.09; // corner radius

// ─── Directional drift calibration (matches ApexAd CSS values) ───────────────
// Spin rate: 0.065°/frame Y, 0.026°/frame X → same as ApexAd SceneDemo
const SPIN_Y = 0.065;  // degrees per frame
const SPIN_X = 0.026;  // degrees per frame

export interface GlassCardProps {
  /** Local frame (within Sequence) at which the card enters. Default 0. */
  entryFrame?: number;
  /** Frame at which de-emphasis begins (card shifts right, fades slightly). */
  deemphasizeFrame?: number;
  /** Frame at which card fully disappears (fade out over 12 frames). */
  exitFrame?: number;
  /** Initial horizontal arc offset in canvas pixels. Negative = from left. Default -110. */
  fromX?: number;
  /** Initial vertical arc offset in canvas pixels. Positive = from below. Default 150. */
  fromY?: number;
  /** Initial Y rotation angle in degrees (born-moving direction). Default -8. */
  startRotY?: number;
  /** Initial X rotation angle in degrees. Default 3. */
  startRotX?: number;
  /** Brand accent color — tints the rim strip and point light. */
  accentColor?: string;
  /** Card body color (dark surface behind material). Default "#18181B". */
  cardColor?: string;
  /** Material roughness 0–1. 0.06 = glass-smooth. Default 0.06. */
  roughness?: number;
  /** Material metalness 0–1. Slight metalness adds subtle reflective sheen. Default 0.1. */
  metalness?: number;
  /**
   * Glass transmission 0–1. 0 = fully opaque, 1 = fully transparent glass.
   * 0.15–0.35 gives a dark smoked-glass look while keeping the card readable.
   * Default 0.20.
   */
  transmission?: number;
  /** Environment map intensity multiplier. Default 1.8. */
  envMapIntensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  entryFrame = 0,
  deemphasizeFrame,
  exitFrame,
  fromX = -110,
  fromY = 150,
  startRotY = -8,
  startRotX = 3,
  accentColor = "#F97316",
  cardColor = "#18181B",
  roughness = 0.06,
  metalness = 0.1,
  transmission = 0.20,
  envMapIntensity = 1.8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── Entry animation ──────────────────────────────────────────────────────
  // Reuse premiumMotion arc entry — returns CSS px values, divide by PPU for world units
  const arc = useArcEntry(entryFrame, fromX, fromY, PREMIUM_SPRING.hero);
  const cardScale = useSoftScaleIn(entryFrame, 0.88, 32);
  const floatY = useHeroFloatDelayed(entryFrame + 40, 6, 88);

  // Convert CSS pixel offsets to Three.js world units (negate Y for axis flip)
  const posX = arc.translateX / PPU;
  const posY = -(arc.translateY + floatY) / PPU;

  // ─── Directional rotation ────────────────────────────────────────────────
  // Card born moving from frame 1 — directional drift, never oscillation.
  // Continues the spin rate calibrated for premium cinematic feel (LEARNINGS §586–600).
  const age = Math.max(0, frame - entryFrame);
  const rotY = (startRotY + age * SPIN_Y) * DEG;
  const rotX = (startRotX - age * SPIN_X) * DEG;

  // ─── De-emphasis (card recedes when new content takes focus) ──────────────
  let deemphProgress = 0;
  if (deemphasizeFrame !== undefined) {
    deemphProgress = easeInOut3(rawProgress(frame, deemphasizeFrame, 28));
  }
  const deemph = depthDeemphasis(deemphProgress);
  // Shift right when de-emphasised — same visual rhythm as CSS SceneFeatures
  const deemphShiftX = deemphProgress * 0.82;

  // ─── Visibility envelope ──────────────────────────────────────────────────
  const entryOpacity = rawProgress(frame, entryFrame, 10);
  const exitOpacity =
    exitFrame !== undefined
      ? 1 - rawProgress(frame, exitFrame - 12, 12)
      : 1;
  const opacity = Math.min(entryOpacity, exitOpacity) * deemph.opacity;

  if (opacity <= 0.01) return null;

  const worldScale = cardScale * deemph.scale;

  return (
    <group
      position={[posX + deemphShiftX, posY, 0]}
      rotation={[rotX, rotY, 0]}
      scale={[worldScale, worldScale, worldScale]}
    >
      {/* Accent point light — casts orange light from in front of card, matching brand glow */}
      <pointLight
        position={[0.3, 0.4, 1.8]}
        color={accentColor}
        intensity={2.5 * opacity}
        distance={5}
        decay={2}
      />

      {/* Secondary fill light from opposite angle — creates highlight on opposite rim */}
      <pointLight
        position={[-0.5, -0.3, 1.4]}
        color="#FBBF24"
        intensity={0.8 * opacity}
        distance={3}
        decay={2}
      />

      {/* ── Card body — MeshPhysicalMaterial for real glass/depth ──────────── */}
      <RoundedBox args={[CARD_W, CARD_H, CARD_D]} radius={CARD_R} smoothness={4}>
        <meshPhysicalMaterial
          color={cardColor}
          roughness={roughness}
          metalness={metalness}
          transmission={transmission}
          thickness={0.4}
          envMapIntensity={envMapIntensity}
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* ── Card surface panel — slightly lighter dark surface on the front face ── */}
      {/* This separates the "body" dark colour from the rim, adding visual depth */}
      <mesh position={[0, 0, CARD_D / 2 + 0.001]}>
        <planeGeometry args={[CARD_W - 0.04, CARD_H - 0.04]} />
        <meshStandardMaterial
          color="#1C1C22"
          roughness={0.35}
          metalness={0.25}
          envMapIntensity={1.0}
          transparent
          opacity={opacity * 0.95}
        />
      </mesh>

      {/* ── Accent rim strip — top edge emissive glow, matches brand accent color ── */}
      {/* Equivalent to the CSS gradient top stripe on the DealCard */}
      <mesh position={[0, CARD_H / 2 - 0.008, CARD_D / 2 + 0.003]}>
        <planeGeometry args={[CARD_W - 0.04, 0.018]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={3.0}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* ── Rim gradient overlay on front face — simulates the CSS gradient rim ── */}
      {/* A very slightly larger plane behind the card face, tinted accent color */}
      <mesh position={[0, 0, -CARD_D / 2 - 0.001]}>
        <planeGeometry args={[CARD_W + 0.012, CARD_H + 0.012]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.6}
          transparent
          opacity={opacity * 0.55}
        />
      </mesh>
    </group>
  );
};
