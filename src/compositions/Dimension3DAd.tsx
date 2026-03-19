/**
 * Dimension3DAd — "A New Dimension."
 *
 * Five sequential scenes, each showcasing a specific capability that was impossible
 * or severely degraded in the CSS-only approach.
 *
 * Format:  1:1 (1080 × 1080)
 * Duration: 450 frames @ 30fps = 15 seconds
 * Scenes:  5 × 90 frames (3s each)
 *
 * ─── Architecture ──────────────────────────────────────────────────────────────
 * ONE persistent ThreeScene spans all 450 frames — no ThreeCanvas thrashing.
 * Each 3D component calls useCurrentFrame() internally and self-manages visibility.
 * CSS text overlay sits AFTER ThreeScene in JSX (DOM order = always on top).
 * Camera motion: subtle linear dolly applied to outer CSS wrapper.
 *
 * ─── Scene Map ─────────────────────────────────────────────────────────────────
 * f0–90    Scene 1 — GLASS ORBITS       3 cards orbiting Y: glass, metal, matte.
 *                                        Real IBL reflections. Impossible in CSS.
 *
 * f90–180  Scene 2 — PARTICLE STORM     1,200 GPU particles, sphere burst.
 *                                        InstancedMesh: 1 draw call, any count.
 *
 * f180–270 Scene 3 — MATERIAL LIVE      Roughness/metalness/transmission animated.
 *                                        Matte → Glass → Mirror. No CSS equivalent.
 *
 * f270–360 Scene 4 — HELIX DEPTH        800 particles in a rotating double helix.
 *                                        True Z-depth. CSS particles are always flat.
 *
 * f360–450 Scene 5 — BLOOM BURST        Emissive geometry + real post-processing.
 *                                        Light halos. Not box-shadow. Not radial-gradient.
 */

import React, { useRef, useEffect, useMemo } from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { RoundedBox } from "@react-three/drei";
import {
  clamp,
  easeOut3,
  easeOut4,
  easeInOut3,
  rawProgress,
  useCinematicTextReveal,
  usePremiumFadeOut,
  usePremiumWipe,
  useBreathingGlow,
} from "../utils/premiumMotion";
import { ThreeScene } from "../utils/three";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      "#070709",
  accent:  "#F97316",
  accent2: "#FBBF24",
  blue:    "#60A5FA",
  text:    "#FAFAF9",
  body:    "#A1A1AA",
  border:  "#27272A",
  white:   "#FFFFFF",
} as const;

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';
const TOTAL_FRAMES = 450;

// ─── Stable pseudo-random ─────────────────────────────────────────────────────
const sr = (seed: number): number => ((seed * 1.6180339887) % 1 + 1) % 1;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/**
 * Computes a smooth 0→1→0 opacity envelope for a 3D component.
 * The component is visible in [start, end) and fades in/out at the edges.
 * Call with the GLOBAL frame (not Sequence-local).
 */
function sceneOpacity(
  frame: number,
  start: number,
  end: number,
  fadeIn = 12,
  fadeOut = 14,
): number {
  const inT  = easeOut3(clamp((frame - start) / fadeIn, 0, 1));
  const outT = easeOut3(clamp((frame - (end - fadeOut)) / fadeOut, 0, 1));
  return inT * (1 - outT);
}

// ══════════════════════════════════════════════════════════════════════════════
// 3D SCENE COMPONENTS
// All call useCurrentFrame() internally — fully deterministic.
// Return null when outside their visible window to skip GPU work.
// ══════════════════════════════════════════════════════════════════════════════

// ─── Scene 1: Glass Orbits ────────────────────────────────────────────────────
// Three RoundedBox cards orbiting the Y axis — glass, polished metal, dark matte.
// The same geometry with different MeshPhysicalMaterial properties creates completely
// different visual behaviour under IBL. CSS rotateY was always flat; this is not.
//
// CSS before: boxShadow "prism rim" hack, filter:blur breaks preserve-3d entirely.
// Three.js now: real material responses, environment reflections, actual normals.

const ORBIT_MATS = [
  // glass — shows environment through refraction, internal reflections
  { roughness: 0.05, metalness: 0.05, transmission: 0.82, color: "#1A1A2A", envMapIntensity: 2.4, label: "Glass" },
  // polished brushed metal — full environment reflection, no transmission
  { roughness: 0.04, metalness: 0.95, transmission: 0.0,  color: "#1E1410", envMapIntensity: 2.0, label: "Metal" },
  // matte ceramic — diffuse, no specular, no reflection
  { roughness: 0.82, metalness: 0.02, transmission: 0.0,  color: "#12121A", envMapIntensity: 0.5, label: "Matte" },
] as const;

function GlassOrbits3D() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, 0, 90);
  if (opacity < 0.01) return null;

  // Born moving — directional orbit never stops
  const groupRotY = frame * 0.022;
  // Gentle tilt for visual interest — reveals the card face at different angles
  const groupTiltX = Math.sin(frame * 0.018) * 0.15;

  return (
    <group rotation={[groupTiltX, groupRotY, 0]}>
      {/* Three orbiting point lights — create dynamic specular highlights */}
      {[0, 120, 240].map((baseDeg, li) => {
        const la = (baseDeg * Math.PI / 180) + frame * 0.04;
        const lColors = ["#F97316", "#FBBF24", "#60A5FA"];
        return (
          <pointLight
            key={li}
            position={[Math.cos(la) * 2.2, Math.sin(la * 0.7) * 0.6, Math.sin(la) * 2.2]}
            color={lColors[li]}
            intensity={2.8 * opacity}
            distance={5}
            decay={2}
          />
        );
      })}

      {ORBIT_MATS.map((mat, i) => {
        const baseAngle = (i * 120 * Math.PI) / 180;
        // Cards at radius 1.1 — fills the frame nicely at fov=40, z=6
        const cx = Math.cos(baseAngle) * 1.1;
        const cz = Math.sin(baseAngle) * 1.1;
        // Each card counter-rotates slightly so its face stays readable
        const cardRotY = -groupRotY * 0.6 + i * 0.4;

        return (
          <group key={i} position={[cx, 0, cz]} rotation={[0, cardRotY, 0]}>
            <RoundedBox args={[0.78, 1.0, 0.06]} radius={0.07} smoothness={4}>
              <meshPhysicalMaterial
                color={mat.color}
                roughness={mat.roughness}
                metalness={mat.metalness}
                transmission={mat.transmission}
                thickness={0.4}
                envMapIntensity={mat.envMapIntensity}
                transparent
                opacity={opacity}
              />
            </RoundedBox>
            {/* Accent rim strip — emissive, blooms */}
            <mesh position={[0, 0.49, 0.032]}>
              <planeGeometry args={[0.75, 0.014]} />
              <meshStandardMaterial
                color={C.accent}
                emissive={C.accent}
                emissiveIntensity={2.5}
                transparent
                opacity={opacity * 0.9}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// ─── Scene 2: Sphere Particle Storm ───────────────────────────────────────────
// 1,200 particles burst outward from a central origin in a sphere distribution.
// Per-instance color transitions from orange (fast/close) to amber (mid) to white.
// GPU InstancedMesh: same cost regardless of count. CSS caps at ~20 before frame drops.

function SphereParticles3D() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, 90, 180);

  const meshRef  = useRef<THREE.InstancedMesh>(null);
  const dummy    = useRef(new THREE.Object3D());
  const colorRef = useRef(new THREE.Color());
  const COUNT    = 1200;

  const particles = useMemo(() => {
    return Array.from({ length: COUNT }, (_, i) => {
      // Uniform sphere surface distribution (Marsaglia method via sr())
      const u = sr(i * 7) * 2 - 1;
      const t = sr(i * 11) * 2 * Math.PI;
      const r = Math.sqrt(1 - u * u);
      const speed = (0.013 + sr(i * 13) * 0.016);
      const delay = Math.floor(sr(i * 17) * 28);
      const life  = 42 + Math.floor(sr(i * 19) * 20);
      // Color tier: fast = orange, medium = amber, slow = white
      const tier = i < 400 ? 0 : i < 850 ? 1 : 2;
      return {
        dx: r * Math.cos(t) * speed,
        dy: u * speed,
        dz: r * Math.sin(t) * speed,
        delay,
        life,
        tier,
        baseScale: 0.4 + sr(i * 23) * 0.8,
      };
    });
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || opacity < 0.01) return;

    const localFrame = Math.max(0, frame - 90);
    const tierColors = [
      new THREE.Color(C.accent),   // orange
      new THREE.Color(C.accent2),  // amber
      new THREE.Color("#FAFAF9"),  // near white
    ];

    particles.forEach((p, i) => {
      const age     = Math.max(0, localFrame - p.delay);
      const lifePct = Math.min(1, age / p.life);
      const scale   = Math.sin(lifePct * Math.PI) * p.baseScale;

      if (lifePct <= 0 || lifePct >= 1 || scale < 0.001) {
        dummy.current.position.set(0, -999, 0);
        dummy.current.scale.setScalar(0.0001);
      } else {
        dummy.current.position.set(p.dx * age, p.dy * age, p.dz * age);
        dummy.current.scale.setScalar(0.019 * scale);
        mesh.setColorAt(i, colorRef.current.copy(tierColors[p.tier]));
      }

      dummy.current.updateMatrix();
      mesh.setMatrixAt(i, dummy.current.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  if (opacity < 0.01) return null;

  return (
    <>
      {/* Central flash point */}
      <pointLight position={[0, 0, 0]} color={C.accent} intensity={6 * opacity} distance={3} decay={2} />
      <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
        <sphereGeometry args={[1, 5, 5]} />
        <meshBasicMaterial vertexColors transparent opacity={opacity * 0.88} depthWrite={false} />
      </instancedMesh>
    </>
  );
}

// ─── Scene 3: Material Live ────────────────────────────────────────────────────
// A single card cycles through three material states in real-time.
// roughness, metalness, and transmission update every frame.
// CSS has zero equivalent — there is no material model in CSS.

function MaterialLiveCard3D() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, 180, 270);
  if (opacity < 0.01) return null;

  const localFrame = Math.max(0, frame - 180);

  // Phase transitions: matte (0-30) → glass (35-65) → mirror metal (70-90)
  const t1 = easeInOut3(rawProgress(localFrame, 0, 34));   // matte → glass
  const t2 = easeInOut3(rawProgress(localFrame, 42, 32));  // glass → metal

  // Material properties morph between three presets
  const roughness    = lerp(lerp(0.78, 0.04, t1), 0.02, t2);
  const metalness    = lerp(lerp(0.05, 0.05, t1), 0.95, t2);
  const transmission = lerp(lerp(0.0,  0.82, t1), 0.0,  t2);
  const envMap       = lerp(lerp(0.4,  2.2,  t1), 2.8,  t2);

  // Accent rim light also transitions: warm orange → cool blue → hot white
  const rimR = lerp(lerp(249, 96,  t1), 255, t2) / 255;
  const rimG = lerp(lerp(115, 165, t1), 255, t2) / 255;
  const rimB = lerp(lerp(22,  250, t1), 255, t2) / 255;
  const rimColor = new THREE.Color(rimR, rimG, rimB);

  // Directional drift — card born moving (same calibration as premium CSS cards)
  const rotY = localFrame * 0.055;
  const rotX = Math.sin(localFrame * 0.03) * 0.18;

  return (
    <group rotation={[rotX, rotY, 0]}>
      <pointLight position={[0.6, 0.5, 2.0]} color={rimColor} intensity={4.0 * opacity} distance={5} decay={2} />
      <pointLight position={[-0.8, -0.3, 1.6]} color="#FBBF24" intensity={1.5 * opacity} distance={4} decay={2} />

      <RoundedBox args={[1.62, 1.24, 0.07]} radius={0.09} smoothness={5}>
        <meshPhysicalMaterial
          color="#14141C"
          roughness={roughness}
          metalness={metalness}
          transmission={transmission}
          thickness={0.45}
          envMapIntensity={envMap}
          transparent
          opacity={opacity}
        />
      </RoundedBox>

      {/* Top accent strip — emissive color transitions with material phase */}
      <mesh position={[0, 0.615, 0.038]}>
        <planeGeometry args={[1.58, 0.016]} />
        <meshStandardMaterial
          color={rimColor}
          emissive={rimColor}
          emissiveIntensity={3.5}
          transparent
          opacity={opacity}
        />
      </mesh>
    </group>
  );
}

// ─── Scene 4: Helix Depth ─────────────────────────────────────────────────────
// 800 particles arranged in a double-helix, rotating around the Y axis.
// Particles at different Z positions create REAL perspective foreshortening — near
// particles appear larger, far particles smaller. CSS z-index is binary, not physical.
// Strand A = orange, Strand B = amber — per-instance colour distinguishes geometry.

function HelixField3D() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, 270, 360);

  const meshRef  = useRef<THREE.InstancedMesh>(null);
  const dummy    = useRef(new THREE.Object3D());
  const COUNT    = 800;

  const helix = useMemo(() => {
    const colorA = new THREE.Color(C.accent);
    const colorB = new THREE.Color(C.accent2);
    return Array.from({ length: COUNT }, (_, i) => {
      const t      = i / COUNT;
      const strand = i % 2;                           // 0 = orange, 1 = amber
      const angle  = t * Math.PI * 12;               // 6 full turns
      const height = (t - 0.5) * 3.2;               // spans -1.6 to +1.6 world units
      const radius = 0.88 + Math.sin(t * Math.PI * 4) * 0.08;
      const phi    = angle + strand * Math.PI;       // strands offset by 180°
      return {
        bx: Math.cos(phi) * radius,
        by: height,
        bz: Math.sin(phi) * radius,
        size: 0.5 + sr(i * 7) * 0.6,
        phase: sr(i * 11) * Math.PI * 2,
        color: strand === 0 ? colorA : colorB,
      };
    });
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || opacity < 0.01) return;

    const localFrame = Math.max(0, frame - 270);
    // Slow directional rotation — reads as "object in 3D space", not "animation loop"
    const rotY = localFrame * 0.022;
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);
    // Slight tilt to reveal 3D structure more clearly
    const tiltCos = Math.cos(0.28);
    const tiltSin = Math.sin(0.28);

    // Fade-in: particles appear from center outward over first 20 local frames
    const appear = easeOut4(clamp(localFrame / 20, 0, 1));

    helix.forEach((p, i) => {
      // Rotate around Y axis
      const rx = p.bx * cosR - p.bz * sinR;
      const rz = p.bx * sinR + p.bz * cosR;
      // Apply X tilt (for 3D depth reveal)
      const ry_tilt = p.by * tiltCos - rz * tiltSin;
      const rz_tilt = p.by * tiltSin + rz * tiltCos;

      const twinkle = 0.55 + 0.45 * Math.sin((localFrame / 48) * Math.PI * 2 + p.phase);
      const entryFade = clamp(appear * (1 + sr(i * 29)), 0, 1); // staggered appear

      dummy.current.position.set(rx, ry_tilt, rz_tilt);
      dummy.current.scale.setScalar(0.020 * p.size * twinkle * entryFade);
      dummy.current.updateMatrix();
      mesh.setMatrixAt(i, dummy.current.matrix);
      mesh.setColorAt(i, p.color);
    });

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  if (opacity < 0.01) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial vertexColors transparent opacity={opacity * 0.90} depthWrite={false} />
    </instancedMesh>
  );
}

// ─── Scene 5: Bloom Burst ─────────────────────────────────────────────────────
// A central icosahedron with high emissive intensity, surrounded by 5 orbiting
// satellite octahedra and 3 point lights. The ThreeScene's Bloom post-processing
// creates real light halos from these emissive surfaces — not box-shadow, not
// radial-gradient. The glow physically spreads into the surrounding space.

function BloomBurst3D() {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, 360, 450, 14, 16);
  if (opacity < 0.01) return null;

  const localFrame = Math.max(0, frame - 360);
  const appearT = easeOut4(clamp(localFrame / 22, 0, 1));
  // Breathing pulse — modulates emissive intensity
  const pulse = 0.72 + 0.28 * Math.sin((localFrame / 20) * Math.PI * 2);
  // Directional spin — icosahedron tumbles continuously
  const rotX = localFrame * 0.026;
  const rotY = localFrame * 0.038;
  const rotZ = localFrame * 0.012;

  const satColors = [C.accent, C.accent2, C.blue, C.accent, C.accent2];

  return (
    <group scale={[appearT, appearT, appearT]}>
      {/* Orbiting point lights — create dynamic specular hits on the icosahedron surface */}
      {[0, 120, 240].map((baseDeg, li) => {
        const la = (baseDeg * Math.PI / 180) + localFrame * 0.068;
        const lc = li === 0 ? "#FF7A30" : li === 1 ? "#FFD060" : "#80C0FF";
        return (
          <pointLight
            key={li}
            position={[
              Math.cos(la) * 1.7,
              Math.sin(la * 0.55 + li) * 0.6,
              Math.sin(la) * 1.7,
            ]}
            color={lc}
            intensity={5.5 * pulse * opacity}
            distance={4.5}
            decay={2}
          />
        );
      })}

      {/* Central icosahedron — the bloom source */}
      <mesh rotation={[rotX, rotY, rotZ]}>
        <icosahedronGeometry args={[0.72, 1]} />
        <meshStandardMaterial
          color="#FF5500"
          emissive="#F97316"
          emissiveIntensity={2.8 * pulse}
          roughness={0.22}
          metalness={0.75}
          transparent
          opacity={opacity}
        />
      </mesh>

      {/* Inner wire frame overlay — adds geometric complexity without extra bloom */}
      <mesh rotation={[rotX * 1.3, -rotY * 0.8, rotZ * 1.5]}>
        <icosahedronGeometry args={[0.76, 1]} />
        <meshBasicMaterial
          color={C.accent2}
          transparent
          opacity={opacity * 0.18}
          wireframe
        />
      </mesh>

      {/* 5 orbiting satellite octahedra — each highly emissive for secondary bloom sources */}
      {[0, 72, 144, 216, 288].map((baseDeg, si) => {
        const sa = (baseDeg * Math.PI / 180) + localFrame * 0.052;
        const oy = Math.sin(sa * 1.3 + si) * 0.55;
        return (
          <mesh
            key={si}
            position={[Math.cos(sa) * 1.18, oy, Math.sin(sa) * 1.18]}
            rotation={[sa * 0.8, sa * 1.2, sa * 0.4]}
          >
            <octahedronGeometry args={[0.11, 0]} />
            <meshStandardMaterial
              color={satColors[si]}
              emissive={satColors[si]}
              emissiveIntensity={3.2 * pulse}
              roughness={0.08}
              metalness={0.85}
              transparent
              opacity={opacity * 0.92}
            />
          </mesh>
        );
      })}

      {/* Outer ring of dim particles — gives scale to the central burst */}
      {Array.from({ length: 28 }, (_, ri) => {
        const ra = (ri / 28) * Math.PI * 2 + localFrame * 0.015;
        const ry2 = Math.sin(ra * 2.1 + ri) * 0.3;
        const ringR = 1.55 + Math.sin(localFrame * 0.04 + ri) * 0.08;
        return (
          <mesh key={ri} position={[Math.cos(ra) * ringR, ry2, Math.sin(ra) * ringR]}>
            <sphereGeometry args={[0.028, 5, 5]} />
            <meshBasicMaterial
              color={ri % 2 === 0 ? C.accent : C.accent2}
              transparent
              opacity={opacity * 0.55}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CSS TEXT OVERLAY COMPONENTS
// Inside Sequence tags — useCurrentFrame() returns LOCAL frame (0-89).
// These render on top of ThreeScene via DOM order (positioned after ThreeScene in JSX).
// ══════════════════════════════════════════════════════════════════════════════

const SceneLabel: React.FC<{ n: number; category: string }> = ({ n, category }) => {
  const frame = useCurrentFrame();
  const t = useCinematicTextReveal(0, 10, 5);
  return (
    <div
      style={{
        opacity: t.opacity,
        transform: `translateY(${t.translateY}px)`,
        filter: `blur(${t.blur}px)`,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          color: C.accent,
          letterSpacing: "0.18em",
          background: `${C.accent}14`,
          border: `1px solid ${C.accent}30`,
          borderRadius: 4,
          padding: "3px 8px",
        }}
      >
        {String(n).padStart(2, "0")}
      </div>
      <span
        style={{
          fontFamily: SANS,
          fontSize: 11,
          fontWeight: 700,
          color: C.body,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {category}
      </span>
    </div>
  );
};

// Horizontal wipe rule between sections
const WipeRule: React.FC<{ startFrame?: number; color?: string }> = ({
  startFrame = 8,
  color = C.accent,
}) => {
  const pct = usePremiumWipe(startFrame, 20);
  return (
    <div
      style={{
        width: `${pct}%`,
        maxWidth: 240,
        height: 1.5,
        background: `linear-gradient(90deg, ${color}, ${color}33)`,
        borderRadius: 1,
        margin: "16px 0",
      }}
    />
  );
};

// ─── Scene 1 Text ─────────────────────────────────────────────────────────────
const Scene1Text: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 14);
  const h1 = useCinematicTextReveal(6,  20, 10);
  const h2 = useCinematicTextReveal(14, 20, 10);
  const h3 = useCinematicTextReveal(22, 20, 10);
  const s1 = useCinematicTextReveal(30, 14, 6);
  const s2 = useCinematicTextReveal(38, 14, 6);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div
        style={{
          position: "absolute",
          left: 72,
          right: 72,
          bottom: 96,
        }}
      >
        <SceneLabel n={1} category="Real Materials" />
        <WipeRule />

        {/* Three material names — each animates independently */}
        <div style={{ display: "flex", gap: 18, marginBottom: 14 }}>
          {[
            { text: "Glass.",  t: h1, color: C.text   },
            { text: "Metal.",  t: h2, color: C.accent2 },
            { text: "Matte.",  t: h3, color: C.body    },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: 52,
                fontWeight: 900,
                fontFamily: SANS,
                color: item.color,
                letterSpacing: -2.5,
                lineHeight: 0.92,
                opacity: item.t.opacity,
                transform: `translateY(${item.t.translateY}px)`,
                filter: `blur(${item.t.blur}px)`,
              }}
            >
              {item.text}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 15,
            color: C.body,
            fontFamily: SANS,
            lineHeight: 1.55,
            opacity: s1.opacity,
            transform: `translateY(${s1.translateY}px)`,
            filter: `blur(${s1.blur}px)`,
          }}
        >
          Real IBL reflections from environment maps.
        </div>
        <div
          style={{
            fontSize: 13,
            color: `${C.accent}80`,
            fontFamily: MONO,
            marginTop: 6,
            opacity: s2.opacity,
            transform: `translateY(${s2.translateY}px)`,
          }}
        >
          Previously: filter:blur breaks preserve-3d entirely.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2 Text ─────────────────────────────────────────────────────────────
const Scene2Text: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 14);
  const num = useCinematicTextReveal(6, 22, 12);
  const lbl = useCinematicTextReveal(16, 16, 7);
  const s1  = useCinematicTextReveal(28, 14, 6);
  const s2  = useCinematicTextReveal(36, 14, 6);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 96 }}>
        <SceneLabel n={2} category="GPU Particles" />
        <WipeRule />

        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 10 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              fontFamily: MONO,
              color: C.text,
              letterSpacing: -5,
              lineHeight: 0.88,
              opacity: num.opacity,
              transform: `translateY(${num.translateY}px)`,
              filter: `blur(${num.blur}px)`,
            }}
          >
            1,200
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontFamily: SANS,
              color: C.accent,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: lbl.opacity,
              transform: `translateY(${lbl.translateY}px)`,
            }}
          >
            Particles
          </div>
        </div>

        <div style={{ fontSize: 15, color: C.body, fontFamily: SANS, lineHeight: 1.55, opacity: s1.opacity, transform: `translateY(${s1.translateY}px)`, filter: `blur(${s1.blur}px)` }}>
          One InstancedMesh draw call. Any count.
        </div>
        <div style={{ fontSize: 13, color: `${C.accent}80`, fontFamily: MONO, marginTop: 6, opacity: s2.opacity, transform: `translateY(${s2.translateY}px)` }}>
          Previously: 22 CSS div radial-gradients. Max ~30 before slowdown.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3 Text ─────────────────────────────────────────────────────────────
const Scene3Text: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 14);
  const h1 = useCinematicTextReveal(6,  18, 8);
  const h2 = useCinematicTextReveal(14, 18, 8);
  const h3 = useCinematicTextReveal(22, 18, 8);
  const s1 = useCinematicTextReveal(30, 14, 6);
  const s2 = useCinematicTextReveal(38, 12, 5);

  const arrow = useCinematicTextReveal(18, 12, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 96 }}>
        <SceneLabel n={3} category="Live Materials" />
        <WipeRule />

        {/* Matte → Glass → Metal transition labels */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          {[
            { text: "Matte", t: h1, color: C.body   },
            { text: "→",     t: arrow, color: `${C.accent}55` },
            { text: "Glass", t: h2, color: C.blue   },
            { text: "→",     t: arrow, color: `${C.accent}55` },
            { text: "Mirror",t: h3, color: C.accent2 },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                fontSize: i % 2 === 1 ? 24 : 44,
                fontWeight: i % 2 === 1 ? 300 : 900,
                fontFamily: SANS,
                color: item.color,
                letterSpacing: i % 2 === 1 ? 0 : -1.8,
                lineHeight: 0.92,
                opacity: item.t.opacity,
                transform: `translateY(${item.t.translateY}px)`,
                filter: `blur(${item.t.blur}px)`,
              }}
            >
              {item.text}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 15, color: C.body, fontFamily: SANS, lineHeight: 1.55, opacity: s1.opacity, transform: `translateY(${s1.translateY}px)`, filter: `blur(${s1.blur}px)` }}>
          roughness · metalness · transmission — animated every frame.
        </div>
        <div style={{ fontSize: 13, color: `${C.accent}80`, fontFamily: MONO, marginTop: 6, opacity: s2.opacity, transform: `translateY(${s2.translateY}px)` }}>
          Previously: CSS has no material model. Impossible.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 4 Text ─────────────────────────────────────────────────────────────
const Scene4Text: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 14);
  const h1 = useCinematicTextReveal(6,  20, 9);
  const s1 = useCinematicTextReveal(20, 16, 7);
  const s2 = useCinematicTextReveal(28, 14, 6);
  const s3 = useCinematicTextReveal(36, 12, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 96 }}>
        <SceneLabel n={4} category="True Z-Depth" />
        <WipeRule />

        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 14 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              fontFamily: MONO,
              color: C.text,
              letterSpacing: -5,
              lineHeight: 0.88,
              opacity: h1.opacity,
              transform: `translateY(${h1.translateY}px)`,
              filter: `blur(${h1.blur}px)`,
            }}
          >
            800
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.body, fontFamily: SANS, letterSpacing: "0.08em", textTransform: "uppercase", opacity: s1.opacity, transform: `translateY(${s1.translateY}px)` }}>
            Particles · Double Helix
          </div>
        </div>

        <div style={{ fontSize: 15, color: C.body, fontFamily: SANS, lineHeight: 1.55, opacity: s2.opacity, transform: `translateY(${s2.translateY}px)`, filter: `blur(${s2.blur}px)` }}>
          Real perspective foreshortening — near particles larger, far particles smaller.
        </div>
        <div style={{ fontSize: 13, color: `${C.accent}80`, fontFamily: MONO, marginTop: 6, opacity: s3.opacity, transform: `translateY(${s3.translateY}px)` }}>
          Previously: CSS z-index is binary. No physical depth.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5 Text ─────────────────────────────────────────────────────────────
const Scene5Text: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 14);
  const h1 = useCinematicTextReveal(6,  20, 10);
  const h2 = useCinematicTextReveal(14, 20, 10);
  const s1 = useCinematicTextReveal(26, 14, 6);
  const s2 = useCinematicTextReveal(34, 12, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 96 }}>
        <SceneLabel n={5} category="Post-Processing" />
        <WipeRule color={C.accent2} />

        <div
          style={{
            fontSize: 68,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.text,
            letterSpacing: -3.5,
            lineHeight: 0.9,
            marginBottom: 6,
            opacity: h1.opacity,
            transform: `translateY(${h1.translateY}px)`,
            filter: `blur(${h1.blur}px)`,
          }}
        >
          Real Bloom.
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            fontFamily: SANS,
            color: C.accent,
            letterSpacing: -1.2,
            lineHeight: 1,
            marginBottom: 14,
            opacity: h2.opacity,
            transform: `translateY(${h2.translateY}px)`,
            filter: `blur(${h2.blur}px)`,
          }}
        >
          Real Light.
        </div>

        <div style={{ fontSize: 15, color: C.body, fontFamily: SANS, lineHeight: 1.55, opacity: s1.opacity, transform: `translateY(${s1.translateY}px)`, filter: `blur(${s1.blur}px)` }}>
          Post-processing light bleed from emissive surfaces.
        </div>
        <div style={{ fontSize: 13, color: `${C.accent}80`, fontFamily: MONO, marginTop: 6, opacity: s2.opacity, transform: `translateY(${s2.translateY}px)` }}>
          Previously: box-shadow · radial-gradient. Not real light.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export const Dimension3DAd: React.FC = () => {
  const frame = useCurrentFrame();

  // Subtle linear camera dolly — same principle as all other compositions
  const zoom = 1.0 + (frame / TOTAL_FRAMES) * 0.045;
  const roll = interpolate(
    frame,
    [0, 90, 180, 270, 360, TOTAL_FRAMES],
    [-0.5, -0.08, 0.35, 0.02, 0.42, 0.18],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const panX = interpolate(frame, [0, TOTAL_FRAMES], [8, -7],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(frame, [0, TOTAL_FRAMES], [5, -4],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div
        style={{
          position:        "absolute",
          inset:           0,
          transform:       `scale(${zoom}) rotateZ(${roll}deg) translateX(${panX}px) translateY(${panY}px)`,
          transformOrigin: "center center",
        }}
      >
        {/* ── Layer 1: CSS background per scene ────────────────────────────── */}
        {/* Subtle scene-matched gradients that show through the ThreeScene */}
        <Sequence from={0}   durationInFrames={90}>
          <AbsoluteFill style={{ opacity: 1 - rawProgress(frame, 76, 14) }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 1000px 800px at 50% 35%, rgba(249,115,22,0.06) 0%, transparent 60%)` }} />
          </AbsoluteFill>
        </Sequence>
        <Sequence from={90}  durationInFrames={90}>
          <AbsoluteFill style={{ opacity: 1 - rawProgress(frame - 90, 76, 14) }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 900px 900px at 50% 40%, rgba(249,115,22,0.08) 0%, rgba(251,191,36,0.04) 40%, transparent 65%)` }} />
          </AbsoluteFill>
        </Sequence>
        <Sequence from={180} durationInFrames={90}>
          <AbsoluteFill style={{ opacity: 1 - rawProgress(frame - 180, 76, 14) }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 1000px 700px at 50% 40%, rgba(96,165,250,0.05) 0%, rgba(249,115,22,0.04) 40%, transparent 62%)` }} />
          </AbsoluteFill>
        </Sequence>
        <Sequence from={270} durationInFrames={90}>
          <AbsoluteFill style={{ opacity: 1 - rawProgress(frame - 270, 76, 14) }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 800px 900px at 50% 40%, rgba(251,191,36,0.06) 0%, rgba(249,115,22,0.03) 40%, transparent 60%)` }} />
          </AbsoluteFill>
        </Sequence>
        <Sequence from={360} durationInFrames={90}>
          <AbsoluteFill>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 1100px 1100px at 50% 38%, rgba(249,115,22,0.10) 0%, rgba(251,191,36,0.05) 38%, transparent 62%)` }} />
          </AbsoluteFill>
        </Sequence>

        {/* ── Layer 2: ThreeScene — single persistent canvas, transparent bg ── */}
        {/* All 5 3D components self-manage visibility via sceneOpacity() */}
        <ThreeScene
          enableBloom
          bloomIntensity={1.15}
          bloomThreshold={0.26}
          bloomSmoothing={0.88}
          environment="studio"
          ambientIntensity={0.1}
          cameraZ={6}
          fov={40}
        >
          <GlassOrbits3D />
          <SphereParticles3D />
          <MaterialLiveCard3D />
          <HelixField3D />
          <BloomBurst3D />
        </ThreeScene>

        {/* ── Layer 3: CSS text overlay — always on top (DOM order) ─────────── */}
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <Sequence from={0}   durationInFrames={90}><Scene1Text /></Sequence>
          <Sequence from={90}  durationInFrames={90}><Scene2Text /></Sequence>
          <Sequence from={180} durationInFrames={90}><Scene3Text /></Sequence>
          <Sequence from={270} durationInFrames={90}><Scene4Text /></Sequence>
          <Sequence from={360} durationInFrames={90}><Scene5Text /></Sequence>

          {/* Scene counter dots — persistent nav indicator */}
          <div
            style={{
              position:       "absolute",
              top:            52,
              left:           0,
              right:          0,
              display:        "flex",
              justifyContent: "center",
              gap:            10,
            }}
          >
            {[0, 1, 2, 3, 4].map((si) => {
              const isActive = frame >= si * 90 && frame < (si + 1) * 90;
              const dotOpacity = isActive ? 1 : 0.22;
              return (
                <div
                  key={si}
                  style={{
                    width:        isActive ? 22 : 6,
                    height:       6,
                    borderRadius: 3,
                    background:   isActive ? C.accent : C.body,
                    opacity:      dotOpacity,
                    transition:   "none",
                  }}
                />
              );
            })}
          </div>

          {/* Persistent top label */}
          <div
            style={{
              position:      "absolute",
              top:           44,
              right:         72,
              fontSize:      11,
              fontWeight:    700,
              color:         `${C.body}66`,
              fontFamily:    MONO,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            3D · Remotion
          </div>
        </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
