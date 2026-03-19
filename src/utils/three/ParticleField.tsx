/**
 * ParticleField — GPU-accelerated InstancedMesh particle system for Remotion.
 *
 * Replaces the inline <div> particle arrays (22–16 particles) in existing compositions
 * with a Three.js InstancedMesh system supporting 100–2000+ particles at similar
 * or better GPU cost.
 *
 * Two modes:
 *
 *   "ambient" — Slowly drifting atmospheric particles. Great for background atmosphere
 *               in any scene. Particles spread across a defined volume and drift with
 *               a slow sinusoidal Y oscillation + gentle XY velocity.
 *
 *   "burst"   — Directional spray from an emitter position. Replicates the blow-dryer
 *               airflow particle pattern in AuraSalonAd, but with 10× more particles.
 *               Particles fade in/out via scale (InstancedMesh has no per-instance opacity).
 *
 * Stable pseudo-random (golden ratio) is used for all initial positions — no Math.random()
 * during render. Animation is driven by useCurrentFrame() — fully deterministic.
 *
 * Note on per-instance opacity:
 *   THREE.InstancedMesh supports per-instance COLOR via setColorAt, but not per-instance
 *   opacity (that requires a custom shader). Fade effects are approximated via scale:
 *   scaling a particle to 0 hides it; scaling from 0→full→0 over its life simulates fade.
 *
 * @example
 * // Ambient atmospheric particles (background atmosphere)
 * <ParticleField
 *   count={600}
 *   mode="ambient"
 *   spread={3.2}
 *   color="#F97316"
 *   size={0.018}
 *   opacity={0.2}
 * />
 *
 * // Directed burst (blow dryer airflow)
 * <ParticleField
 *   count={300}
 *   mode="burst"
 *   emitterPos={[-0.09, 0.64, 0]}
 *   burstAngle={Math.PI}
 *   burstSpread={0.7}
 *   burstFrame={0}
 *   burstDuration={90}
 *   color="#C49552"
 *   size={0.022}
 *   opacity={0.55}
 * />
 */

import React, { useRef, useEffect, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";

// ─── Stable pseudo-random ─────────────────────────────────────────────────────
// Golden ratio fractional part — same approach as AuraSalonAd's sr() function.
// Produces evenly-distributed values in [0, 1) for any integer seed.
const sr = (seed: number): number => ((seed * 1.6180339887) % 1 + 1) % 1;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ParticleMode = "ambient" | "burst";

interface ParticleData {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  phase: number;
  period: number;
  baseScale: number;
  delay: number;
}

export interface ParticleFieldProps {
  /**
   * Number of particles. More = denser field, higher GPU cost.
   * Recommended: 400–800 ambient, 150–400 burst.
   */
  count?: number;
  /** Visual mode: "ambient" = slow drift, "burst" = directed spray. */
  mode?: ParticleMode;
  /**
   * Spread radius in world units for ambient mode (default 3.0).
   * For a 1080px canvas: 3.0 ≈ 741px spread from centre.
   */
  spread?: number;
  /** Spread in Z axis (default spread * 0.25). */
  spreadZ?: number;
  /** Speed multiplier for all particle movement (default 1.0). */
  speed?: number;
  /**
   * Particle sphere radius in world units (default 0.018).
   * 0.018 ≈ 4.4px on a 1080px canvas — sub-pixel: visible as dots, not blobs.
   */
  size?: number;
  /** CSS color string for particle material. */
  color?: string;
  /**
   * Overall opacity of the particle material.
   * Per-instance opacity isn't supported — this is global to all particles.
   * Life-cycle fade is approximated via scale.
   */
  opacity?: number;
  // ── Burst-mode props ──────────────────────────────────────────────────────
  /** Local frame when burst starts (default 0). */
  burstFrame?: number;
  /** Duration of one burst cycle in frames (default 60). */
  burstDuration?: number;
  /**
   * Whether to loop the burst continuously (default true for burst mode).
   * Set false for a one-shot burst.
   */
  burstLoop?: boolean;
  /**
   * World-space position of the burst emitter [x, y, z].
   * Use canvasPosToWorld() from useRemotionFrame to convert CSS coordinates.
   */
  emitterPos?: [number, number, number];
  /**
   * Primary burst direction in radians (0 = +X right, Math.PI/2 = +Y up, Math.PI = -X left).
   * Default Math.PI (going left, matching blow-dryer nozzle direction).
   */
  burstAngle?: number;
  /**
   * Half-angle spread of burst in radians (default 0.55 ≈ 31°).
   * Particles are distributed within [burstAngle ± burstSpread].
   */
  burstSpread?: number;
  /**
   * Particle travel distance per frame in world units (default 0.022).
   * 0.022 ≈ 5.4px/frame on a 1080px canvas.
   */
  burstVelocity?: number;
  /** Stagger delay range for burst particles in frames (default burstDuration * 0.6). */
  burstDelayRange?: number;
}

export const ParticleField: React.FC<ParticleFieldProps> = ({
  count = 500,
  mode = "ambient",
  spread = 3.0,
  spreadZ,
  speed = 1.0,
  size = 0.018,
  color = "#ffffff",
  opacity = 0.3,
  burstFrame = 0,
  burstDuration = 60,
  burstLoop = true,
  emitterPos = [0, 0, 0],
  burstAngle = Math.PI,
  burstSpread = 0.55,
  burstVelocity = 0.022,
  burstDelayRange,
}) => {
  const frame = useCurrentFrame();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useRef(new THREE.Object3D());

  const zSpread = spreadZ ?? spread * 0.25;
  const delayRange = burstDelayRange ?? burstDuration * 0.6;

  // Pre-compute stable per-particle data at mount
  const particles = useMemo<ParticleData[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      if (mode === "ambient") {
        return {
          x: (sr(i * 7) * 2 - 1) * spread,
          y: (sr(i * 11) * 2 - 1) * spread,
          z: (sr(i * 13) * 2 - 1) * zSpread,
          vx: (sr(i * 17) * 2 - 1) * 0.0035 * speed,
          vy: (sr(i * 19) * 2 - 1) * 0.0025 * speed,
          phase: sr(i * 23) * Math.PI * 2,
          period: 65 + sr(i * 29) * 110,
          baseScale: 0.5 + sr(i * 31) * 1.0,
          delay: Math.floor(sr(i * 37) * 40),
        };
      } else {
        // Burst mode
        const spreadAngle = burstAngle + (sr(i * 7) * 2 - 1) * burstSpread;
        const vel = (0.8 + sr(i * 11) * 0.5) * burstVelocity * speed;
        return {
          x: emitterPos[0] + (sr(i * 17) * 2 - 1) * 0.08,
          y: emitterPos[1] + (sr(i * 19) * 2 - 1) * 0.08,
          z: emitterPos[2] + (sr(i * 41) * 2 - 1) * 0.05,
          vx: Math.cos(spreadAngle) * vel,
          vy: Math.sin(spreadAngle) * vel,
          phase: sr(i * 23) * Math.PI * 2,
          period: 35 + sr(i * 29) * 35,
          baseScale: 0.4 + sr(i * 31) * 0.9,
          delay: Math.floor(sr(i * 37) * delayRange),
        };
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, mode, spread, zSpread, speed, burstAngle, burstSpread, burstVelocity,
      emitterPos[0], emitterPos[1], emitterPos[2], burstDuration, delayRange]);

  // Update instanced mesh matrices every render (= every Remotion frame)
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    particles.forEach((p, i) => {
      let px: number, py: number, pz: number, scale: number;

      if (mode === "ambient") {
        // Drift with slow sinusoidal Y oscillation + gentle XY velocity
        const t = frame + p.delay;
        const oscY = Math.sin((t / p.period) * Math.PI * 2 + p.phase) * 0.12;
        // Twinkle via scale modulation
        const twinkle = 0.45 + 0.55 * ((Math.sin((frame / (p.period * 0.65)) * Math.PI * 2 + p.phase * 1.4) + 1) / 2);

        px = p.x + p.vx * frame;
        py = p.y + p.vy * frame + oscY;
        pz = p.z;
        scale = size * p.baseScale * twinkle;

      } else {
        // Burst mode: particle has a life cycle within [burstFrame + delay, burstFrame + delay + burstDuration]
        // With burstLoop, wrap using modulo on (frame - burstFrame)
        const cycleFrame = burstLoop
          ? ((frame - burstFrame) % (burstDuration + Math.floor(delayRange))) + burstFrame
          : frame;
        const age = cycleFrame - burstFrame - p.delay;
        const lifePct = age / burstDuration;

        if (age < 0 || lifePct >= 1) {
          // Particle not yet born or already dead — hide by scaling to near-zero
          dummy.current.position.set(0, -9999, 0);
          dummy.current.scale.setScalar(0.0001);
          dummy.current.updateMatrix();
          mesh.setMatrixAt(i, dummy.current.matrix);
          return;
        }

        // Scale particle in/out over its lifetime (approximates opacity fade)
        const scaleLife = Math.sin(Math.min(lifePct, 1) * Math.PI);
        // Add slight sinusoidal oscillation for organic feel
        const oscY = Math.sin((age / p.period) * Math.PI * 2 + p.phase) * 0.04;

        px = p.x + p.vx * age;
        py = p.y + p.vy * age + oscY;
        pz = p.z;
        scale = size * p.baseScale * scaleLife;
      }

      dummy.current.position.set(px, py, pz);
      dummy.current.scale.setScalar(Math.max(0.0001, scale));
      dummy.current.updateMatrix();
      mesh.setMatrixAt(i, dummy.current.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }); // no deps — runs every render (= every Remotion frame)

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    [color, opacity],
  );

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      {/* Low-poly sphere — 5 segments is visually indistinguishable from higher poly at particle sizes */}
      <sphereGeometry args={[1, 5, 5]} />
      <primitive object={material} />
    </instancedMesh>
  );
};
