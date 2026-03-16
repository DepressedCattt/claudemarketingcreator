/**
 * GlbModelScene
 *
 * Renders any Spline-exported (or other) .glb file inside Remotion's
 * ThreeCanvas and optionally re-applies vertex-distortion animation that
 * Spline's GLB exporter cannot carry.
 *
 * Key design decisions
 * ────────────────────
 * • Auto-fit  — bounding box is computed in useMemo so the model always
 *   fills the frame regardless of Spline's export scale (which tends to be
 *   orders of magnitude larger than Three.js world units).
 *
 * • Synchronous uniform updates — shader uTime is set inside useMemo, which
 *   runs synchronously during React's render phase *before* ThreeCanvas
 *   flushes the WebGL draw.  This gives frame-perfect distortion in both
 *   Remotion Studio preview and the exported video.
 *
 * • Background hiding — checks the Object3D itself, its parent, AND its
 *   grandparent for the name "Background" because Spline's GLTF nests meshes
 *   inside unnamed wrapper nodes.
 */

import React, { useMemo, useRef, useEffect } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  continueRender,
  delayRender,
  staticFile,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { AdConfig, GlbModelSceneProps } from "../data/types";
import { GradientText } from "../components/GradientText";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

// ─── Vertex distortion shader ────────────────────────────────────────────────

const distortVert = /* glsl */ `
  uniform float uTime;
  uniform float uStrength;
  uniform float uFrequency;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i),            hash(i+vec3(1,0,0)), f.x),
          mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)), f.x),
          mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)), f.x), f.y),
      f.z);
  }

  float fbm(vec3 p) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    vec3 pos = position;
    float n = fbm(pos * uFrequency + uTime);
    pos += normal * n * uStrength;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const distortFrag = /* glsl */ `
  uniform vec3  uColor;
  uniform float uOpacity;
  void main() { gl_FragColor = vec4(uColor, uOpacity); }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns true if the object or any ancestor has the given name. */
function ancestorNamed(obj: THREE.Object3D, name: string, depth = 3): boolean {
  const lower = name.toLowerCase();
  let cur: THREE.Object3D | null = obj;
  let d = 0;
  while (cur && d < depth) {
    if (cur.name?.toLowerCase() === lower) return true;
    cur = cur.parent;
    d++;
  }
  return false;
}

// ─── Inner Three-canvas content ───────────────────────────────────────────────

interface ModelProps {
  glbPath: string;
  animationMode: "none" | "rotate" | "float" | "distort";
  time: number;          // seconds, deterministic from useCurrentFrame
  distortTime: number;   // time * distortSpeed
  userScale: number;
  userPosition: [number, number, number];
  rotationSpeed: number;
  distortStrength: number;
  distortFrequency: number;
  colorOverride?: string;
  ambientIntensity: number;
  showBackground: boolean;
}

const Model: React.FC<ModelProps> = ({
  glbPath,
  animationMode,
  time,
  distortTime,
  userScale,
  userPosition,
  rotationSpeed,
  distortStrength,
  distortFrequency,
  colorOverride,
  ambientIntensity,
  showBackground,
}) => {
  const gltf = useGLTF(glbPath);

  // ── 1. Compute auto-fit from the raw (uncloned) scene ──────────────────
  const { fitScale, fitCenter } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(gltf.scene);
    if (box.isEmpty()) return { fitScale: 1, fitCenter: new THREE.Vector3() };

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Target: fill about 4 world units (camera is at z=10, fov=45)
    const TARGET = 4;
    const scale = maxDim > 0.001 ? (TARGET / maxDim) * userScale : userScale;
    return { fitScale: scale, fitCenter: center };
  }, [gltf.scene, userScale]);

  // ── 2. Clone + patch materials ─────────────────────────────────────────
  const patchedScene = useMemo(() => {
    const s = gltf.scene.clone(true);

    s.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;

      // Hide the Spline background object
      if (!showBackground && ancestorNamed(obj, "Background")) {
        obj.visible = false;
        return;
      }

      if (animationMode === "distort") {
        const origColor = colorOverride
          ? new THREE.Color(colorOverride)
          : obj.material instanceof THREE.MeshStandardMaterial
          ? (obj.material as THREE.MeshStandardMaterial).color.clone()
          : new THREE.Color("#d0c0ff");

        obj.material = new THREE.ShaderMaterial({
          vertexShader: distortVert,
          fragmentShader: distortFrag,
          uniforms: {
            uTime:      { value: distortTime },
            uStrength:  { value: distortStrength },
            uFrequency: { value: distortFrequency },
            uColor:     { value: origColor },
            uOpacity:   { value: 1.0 },
          },
          side: THREE.DoubleSide,
        });
      } else if (colorOverride && obj.material instanceof THREE.MeshStandardMaterial) {
        obj.material = (obj.material as THREE.MeshStandardMaterial).clone();
        (obj.material as THREE.MeshStandardMaterial).color.set(colorOverride);
      }
    });

    return s;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf.scene, animationMode, colorOverride, showBackground, distortStrength, distortFrequency]);

  // ── 3. Update distort uTime synchronously every render ─────────────────
  // useMemo runs during React's render phase, BEFORE ThreeCanvas flushes
  // the WebGL draw — so the time value is always correct for the current frame.
  useMemo(() => {
    if (animationMode !== "distort") return;
    patchedScene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && (obj.material as THREE.ShaderMaterial)?.isShaderMaterial) {
        (obj.material as THREE.ShaderMaterial).uniforms.uTime.value = distortTime;
      }
    });
  }, [patchedScene, animationMode, distortTime]);

  // ── 4. Compute animated transform values ──────────────────────────────
  const rotY   = animationMode === "rotate" ? time * rotationSpeed : 0;
  const floatY = animationMode === "float"  ? Math.sin(time * 1.5) * 0.25 : 0;

  // Centre the model then apply user position offset
  const px = -fitCenter.x * fitScale + userPosition[0];
  const py = -fitCenter.y * fitScale + userPosition[1] + floatY;
  const pz = -fitCenter.z * fitScale + userPosition[2];

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <directionalLight position={[5, 8, 5]}   intensity={1.2} />
      <directionalLight position={[-4, -3, -3]} intensity={0.4} color="#8888ff" />

      <group
        rotation-y={rotY}
        position={[px, py, pz]}
        scale={fitScale}
      >
        <primitive object={patchedScene} />
      </group>
    </>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const GlbModelScene: React.FC<Props> = ({
  config,
  durationFrames,
  sceneProps,
}) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typo = getTypography(brand.typography.preset);
  const time = frame / fps;

  const p = (sceneProps ?? {}) as unknown as GlbModelSceneProps;
  const src              = p.src            ?? "";
  const animationMode    = p.animationMode  ?? "distort";
  const userScale        = p.scale          ?? 1;
  const userPosition     = p.position       ?? ([0, 0, 0] as [number, number, number]);
  const rotationSpeed    = p.rotationSpeed  ?? 0.5;
  const distortStrength  = p.distortStrength  ?? 0.15;
  const distortFrequency = p.distortFrequency ?? 1.2;
  const distortSpeed     = p.distortSpeed     ?? 0.6;
  const colorOverride    = p.colorOverride;
  const ambientIntensity = p.ambientIntensity ?? 1.0;
  const headline         = p.headline;
  const subtext          = p.subtext;
  const headlinePosition = p.headlinePosition ?? "bottom";
  const showBackground   = p.showBackground   ?? false; // off by default

  const distortTime = time * distortSpeed;

  // ── delayRender until GLB is fetched ──────────────────────────────────
  const [renderHandle] = React.useState(() => delayRender("Loading GLB model"));
  const glbPath = src ? staticFile(src) : "";

  useEffect(() => {
    if (!glbPath) { continueRender(renderHandle); return; }
    // Preload is async; poll until drei's internal cache has it
    let attempts = 0;
    const check = () => {
      try {
        useGLTF.preload(glbPath);
        continueRender(renderHandle);
      } catch {
        if (attempts++ < 20) setTimeout(check, 200);
        else continueRender(renderHandle); // give up after 4s
      }
    };
    setTimeout(check, 150);
    return () => continueRender(renderHandle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [glbPath]);

  const sceneOpacity    = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(20, 18);
  const subtextOpacity  = useFadeIn(36, 16);

  const headlineJustify: Record<string, string> = {
    top: "flex-start", center: "center", bottom: "flex-end",
  };
  const headlinePadding: Record<string, string> = {
    top: "120px 72px 0", center: "0 72px", bottom: "0 72px 160px",
  };

  // Ref used to keep a stable renderHandle reference for cleanup
  const handleRef = useRef(renderHandle);
  handleRef.current = renderHandle;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity, background: brand.colors.background }}>
      {/* 3-D canvas — camera pulled back so auto-fit works correctly */}
      <AbsoluteFill>
        <ThreeCanvas
          width={1080}
          height={1920}
          camera={{ position: [0, 0, 10], fov: 45 } as unknown as THREE.PerspectiveCamera}
          style={{ width: "100%", height: "100%" }}
        >
          {glbPath && (
            <React.Suspense fallback={null}>
              <Model
                glbPath={glbPath}
                animationMode={animationMode}
                time={time}
                distortTime={distortTime}
                userScale={userScale}
                userPosition={userPosition}
                rotationSpeed={rotationSpeed}
                distortStrength={distortStrength}
                distortFrequency={distortFrequency}
                colorOverride={colorOverride}
                ambientIntensity={ambientIntensity}
                showBackground={showBackground}
              />
            </React.Suspense>
          )}
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Text overlay */}
      {(headline || subtext) && (
        <AbsoluteFill
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: headlineJustify[headlinePosition],
            alignItems: "center",
            padding: headlinePadding[headlinePosition],
            gap: 18,
            pointerEvents: "none",
          }}
        >
          {headline && (
            <div style={{ opacity: headlineOpacity, width: "100%", textAlign: "center" }}>
              <GradientText
                text={headline}
                gradientColors={[brand.colors.accent, brand.colors.text, brand.colors.primary]}
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
