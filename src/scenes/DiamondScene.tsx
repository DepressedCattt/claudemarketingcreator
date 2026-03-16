/**
 * DiamondScene
 *
 * Full 3D crystal/gem rendered with React Three Fiber inside Remotion.
 * Uses @remotion/three's ThreeCanvas for perfectly frame-synced rendering.
 *
 * Visual features:
 *   - LatheGeometry diamond profile (8 facet columns, proper crown + pavilion)
 *   - MeshPhysicalMaterial: glass transmission, IOR 2.42, iridescence
 *   - Flat shading for crisp facet reflections
 *   - 6-point coloured lighting rig (no HDRI needed)
 *   - Orbiting sparkle particles with per-particle hue shift
 *   - drei Stars starfield background
 *   - Bloom post-processing from @react-three/postprocessing
 *   - All motion driven by useCurrentFrame — deterministic, render-safe
 *
 * Required sceneProps (Diamond3DSceneProps):
 *   headline     — text below the gem
 *   subtext      — supporting line
 *   diamondScale — size multiplier (default: 1)
 *   rotationSpeed— radians/second (default: 0.3)
 *   bloomIntensity — glow strength (default: 1.4)
 *   sparkleCount — orbiting particles (default: 40)
 */

import React, { Suspense, useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { Stars, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { AdConfig, Diamond3DSceneProps } from "../data/types";
import { GradientText } from "../components/GradientText";
import { FilmGrain } from "../components/FilmGrain";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

// ─── Seeded random ───────────────────────────────────────────────────────────

function rand(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// ─── Diamond Mesh ─────────────────────────────────────────────────────────────

interface DiamondMeshProps {
  frame: number;
  fps: number;
  primaryColor: string;
  accentColor: string;
  scale: number;
  rotationSpeed: number;
}

const DiamondMesh: React.FC<DiamondMeshProps> = ({
  frame,
  fps,
  primaryColor,
  accentColor,
  scale,
  rotationSpeed,
}) => {
  const t = frame / fps;

  // Diamond lathe profile — (radius from Y axis, height on Y axis)
  const points = useMemo<THREE.Vector2[]>(
    () => [
      new THREE.Vector2(0.0,   1.0),   // apex (top point)
      new THREE.Vector2(0.28,  0.65),  // upper crown
      new THREE.Vector2(0.52,  0.08),  // girdle (widest)
      new THREE.Vector2(0.44, -0.12),  // upper pavilion
      new THREE.Vector2(0.22, -0.52),  // lower pavilion
      new THREE.Vector2(0.0,  -0.92),  // culet (bottom point)
    ],
    []
  );

  const rotY = t * Math.PI * rotationSpeed;
  const rotX = Math.sin(t * 0.35) * 0.1;
  const bobY = Math.sin(t * Math.PI * 0.55) * 0.09;

  // Spring-style entrance (first 25 frames)
  const entryScale = interpolate(frame, [0, 28], [0.001, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (x: number) => 1 - Math.pow(1 - x, 3),
  });

  const baseColor = useMemo(
    () => new THREE.Color(primaryColor).lerp(new THREE.Color("#ffffff"), 0.55),
    [primaryColor]
  );
  const glowColor = useMemo(() => new THREE.Color(accentColor), [accentColor]);

  return (
    <group
      rotation={[rotX, rotY, 0] as [number, number, number]}
      position={[0, bobY, 0]}
      scale={scale * entryScale}
    >
      {/* Primary crystal body — smooth glass with full refraction */}
      <mesh>
        <latheGeometry args={[points, 8]} />
        <meshPhysicalMaterial
          color={baseColor}
          metalness={0.0}
          roughness={0.0}
          transmission={0.98}
          thickness={2.5}
          ior={2.42}
          iridescence={0.8}
          iridescenceIOR={1.8}
          // @ts-ignore
          iridescenceThicknessRange={[100, 500]}
          reflectivity={1.0}
          envMapIntensity={3.5}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          transparent
          opacity={0.98}
        />
      </mesh>

      {/* Edge highlight shell — catches specular light on facet edges */}
      <mesh scale={1.005}>
        <latheGeometry args={[points, 8]} />
        <meshPhysicalMaterial
          color={baseColor}
          metalness={0.9}
          roughness={0.05}
          envMapIntensity={4.0}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner emissive core for the inner glow */}
      <mesh scale={0.55}>
        <latheGeometry args={[points, 8]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.08 + Math.sin(t * 2.2) * 0.04}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
};

// ─── Sparkle Particles ───────────────────────────────────────────────────────

interface SparklesProps {
  frame: number;
  fps: number;
  accentColor: string;
  count: number;
}

const DiamondSparkles: React.FC<SparklesProps> = ({
  frame,
  fps,
  accentColor,
  count,
}) => {
  const t = frame / fps;
  const base = useMemo(() => new THREE.Color(accentColor), [accentColor]);

  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        radius:    rand(i * 7 + 1) * 1.8 + 0.9,
        height:    (rand(i * 7 + 2) - 0.5) * 3.2,
        angle0:    rand(i * 7 + 3) * Math.PI * 2,
        orbitSpeed:(rand(i * 7 + 4) - 0.5) * 1.4 + 0.3,
        size:      rand(i * 7 + 5) * 0.038 + 0.012,
        phase:     rand(i * 7 + 6) * Math.PI * 2,
        hueOffset: rand(i * 7 + 7) * 0.4 - 0.2,
      })),
    [count]
  );

  return (
    <>
      {particles.map((p, i) => {
        const angle = p.angle0 + t * p.orbitSpeed;
        const x = Math.cos(angle) * p.radius;
        const z = Math.sin(angle) * p.radius;
        const opacity = 0.3 + Math.sin(t * 3.2 + p.phase) * 0.38;

        const c = base.clone();
        c.offsetHSL(p.hueOffset, 0, 0);

        return (
          <mesh key={i} position={[x, p.height, z]}>
            <sphereGeometry args={[p.size, 4, 4]} />
            <meshBasicMaterial color={c} transparent opacity={opacity} />
          </mesh>
        );
      })}
    </>
  );
};

// ─── Inner R3F Scene ─────────────────────────────────────────────────────────

interface R3FSceneProps {
  frame: number;
  fps: number;
  primaryColor: string;
  accentColor: string;
  diamondScale: number;
  rotationSpeed: number;
  bloomIntensity: number;
  sparkleCount: number;
}

const R3FScene: React.FC<R3FSceneProps> = ({
  frame,
  fps,
  primaryColor,
  accentColor,
  diamondScale,
  rotationSpeed,
  bloomIntensity,
  sparkleCount,
}) => {
  return (
    <>
      {/* Lighting — complements the environment map */}
      <ambientLight color="#ffffff" intensity={0.2} />
      <pointLight position={[0,   5,  3]} color="#ffffff"  intensity={15} />
      <pointLight position={[5,   2,  3]} color="#c080ff"  intensity={8}  />
      <pointLight position={[-5,  2,  3]} color="#80c0ff"  intensity={8}  />
      <pointLight position={[0,  -5,  2]} color="#ff80c0"  intensity={6}  />
      <pointLight position={[3,   4, -3]} color="#ffd700"  intensity={5}  />
      <pointLight position={[-3, -3, -3]} color="#80ffcc"  intensity={4}  />

      {/* HDRI environment — THIS is what makes glass/transmission materials work.
          Without it, the material has nothing to refract and looks grey/flat. */}
      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
      </Suspense>

      {/* Starfield */}
      <Suspense fallback={null}>
        <Stars
          radius={25}
          depth={18}
          count={500}
          factor={2}
          saturation={0.6}
          fade
        />
      </Suspense>

      {/* Crystal gem */}
      <DiamondMesh
        frame={frame}
        fps={fps}
        primaryColor={primaryColor}
        accentColor={accentColor}
        scale={diamondScale}
        rotationSpeed={rotationSpeed}
      />

      {/* Orbiting sparkles */}
      <DiamondSparkles
        frame={frame}
        fps={fps}
        accentColor={accentColor}
        count={sparkleCount}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.5}
          // @ts-ignore
          mipmapBlur
        />
        {/* Chromatic aberration — the RGB edge split that makes glass look real */}
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          // @ts-ignore — offset accepts Vector2-like
          offset={[0.003, 0.003]}
        />
      </EffectComposer>
    </>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const DiamondScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const typo = getTypography(brand.typography.preset);

  const p = (sceneProps ?? {}) as unknown as Diamond3DSceneProps;
  const headline       = p.headline;
  const subtext        = p.subtext;
  const diamondScale   = p.diamondScale   ?? 1;
  const rotationSpeed  = p.rotationSpeed  ?? 0.3;
  const bloomIntensity = p.bloomIntensity ?? 1.4;
  const sparkleCount   = p.sparkleCount   ?? 40;
  const crystalColor   = p.color          ?? brand.colors.primary;

  const sceneOpacity    = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(22, 18);
  const subtextOpacity  = useFadeIn(38, 16);

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* Deep space gradient background */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 42%, ${brand.colors.primary}35 0%, ${brand.colors.background} 62%)`,
        }}
      />

      {/* R3F canvas — frame-synced via @remotion/three */}
      <ThreeCanvas
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0 }}
        camera={{ position: [0, 0.3, 4.5], fov: 48 }}
      >
        <R3FScene
          frame={frame}
          fps={fps}
          primaryColor={crystalColor}
          accentColor={brand.colors.accent}
          diamondScale={diamondScale}
          rotationSpeed={rotationSpeed}
          bloomIntensity={bloomIntensity}
          sparkleCount={sparkleCount}
        />
      </ThreeCanvas>

      {/* Film grain over everything */}
      <FilmGrain opacity={0.04} />

      {/* Text overlay — rendered in React above the canvas */}
      {(headline || subtext) && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 72px 172px",
            gap: 18,
            pointerEvents: "none",
          }}
        >
          {headline && (
            <div style={{ opacity: headlineOpacity, width: "100%", textAlign: "center" }}>
              <GradientText
                text={headline}
                gradientColors={[
                  brand.colors.accent,
                  brand.colors.text,
                  brand.colors.primary,
                ]}
                fontSize={typo.headline}
                fontFamily={brand.typography.headlineFont || typo.headlineFont}
                fontWeight={typo.headlineWeight}
                letterSpacing={typo.headlineLetterSpacing}
                lineHeight={typo.headlineLineHeight}
                animated
              />
            </div>
          )}

          {subtext && (
            <div
              style={{
                opacity: subtextOpacity,
                fontFamily: typo.bodyFont,
                fontSize: typo.body,
                fontWeight: 400,
                color: brand.colors.textSecondary,
                textAlign: "center",
                lineHeight: 1.55,
                maxWidth: 820,
              }}
            >
              {subtext}
            </div>
          )}
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
