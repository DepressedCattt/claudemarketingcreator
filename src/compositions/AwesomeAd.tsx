/**
 * AwesomeAd — Scene 1: "Rise & Reveal" (5 seconds)
 *
 * ── Camera Path ────────────────────────────────────────────────────────────────
 * Phase 1  (f0–90,  3s):  RISE — camera starts below the phone, close and low,
 *                          looking up at the screen. It slowly tracks upward
 *                          along the phone face, scanning the screen content.
 *                          Tight FOV (28°) gives a cinematic close-up feel.
 *
 * Phase 2  (f90–150, 2s): PULL BACK — camera eases back and re-centres to a
 *                          flat-on position showing the entire phone face.
 *                          FOV widens slightly (36°) for the full reveal.
 *
 * ── Screen Content ─────────────────────────────────────────────────────────────
 * Image is NOT scrolled — it is shown statically from the top of the page.
 * The camera rise naturally reveals different parts of the screen (bottom first,
 * then hero content at top) which IS the storytelling mechanism of this shot.
 *
 * Format:   9:16 (1080 × 1920)
 * Duration: 150 frames @ 30fps = 5 seconds
 */

import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  staticFile, delayRender, continueRender, getRemotionEnvironment,
} from "remotion";
import { ThreeCanvas }         from "@remotion/three";
import { Environment, RoundedBox } from "@react-three/drei";
import { useThree }            from "@react-three/fiber";
import { EffectComposer, SMAA } from "@react-three/postprocessing";
import * as THREE              from "three";
import { GLTFLoader }          from "three/examples/jsm/loaders/GLTFLoader.js";

// ─── Asset URLs ───────────────────────────────────────────────────────────────
const MODEL_URL      = staticFile("models/iphone17.glb");
const SCREEN_IMG_URL = staticFile("images/shared-salon.png");

// ─── Module-level GLB + image cache ──────────────────────────────────────────
// Separate from CinemaRevealAd's cache; browser HTTP-cache keeps GLB fast after
// the first load. Bump CACHE_VER to force fresh material application.
const CACHE_VER = 10;
let cachedSceneVer  = 0;
let cachedScene:     THREE.Group | null = null;
let cachedScreenImg: HTMLImageElement | null = null;

// ─── Easing helpers ───────────────────────────────────────────────────────────
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const eo3 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 5);
const pr  = (f: number, s: number, d: number) => cl((f - s) / d, 0, 1);

// ─── Phone world-space dimensions (matches CinemaRevealAd exactly) ────────────
const PH         = 1.85;
const PW         = PH * (77.6  / 163);
const PD         = PH * (8.25  / 163);
const CR         = 0.082;
const PHONE_HALF_H = PH / 2;

// Camera bump geometry
const CM  = PH * (40.4 / 163);
const CMT = PH * (4.2  / 163);
const CMX = -0.095;
const CMY = PH / 2 - PH * (14.5 / 163) - CM / 2;
const LR    = PH * (6.2 / 163);
const LROUT = LR + 0.018;
const LT    = CMT + 0.012;

// ─── Screen canvas dimensions ─────────────────────────────────────────────────
const SCR_W = 2048;
const SCR_H = 4428;

// ─── Screen overlay plane dimensions ─────────────────────────────────────────
const SCREEN_PLANE_X      = -0.085;
// Inset from the GLB screen mesh so the Black Titanium bezel shows clearly.
// Side gap = (PW 0.880 - 0.816) / 2 = 0.032 per side
// Top/btm  = (PH 1.850 - 1.778) / 2 = 0.036 per side
const SCREEN_PLANE_WIDTH  = 0.816;
const SCREEN_PLANE_HEIGHT = 1.778;

// ─── Draw screen content ──────────────────────────────────────────────────────
// Scene 1 specific: NO SCROLL. Image is shown statically from the top of the
// page. The camera rise is what creates the reveal — no need for scroll.
function drawScreenContent(
  ctx: CanvasRenderingContext2D,
  screenImg: HTMLImageElement | null,
): void {
  // Read from the canvas directly so this works at any resolution.
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const S = W / 1024; // scale factor for all hard-coded pixel constants

  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  (ctx as CanvasRenderingContext2D & { roundRect:(x:number,y:number,w:number,h:number,r:number)=>void })
    .roundRect(0, 0, W, H, 175 * S);
  ctx.clip();

  if (screenImg && screenImg.complete && screenImg.naturalWidth > 0) {
    // White bg
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);

    // Scale image to fill width exactly — no scroll offset (scrollY = 0)
    const scale = W / screenImg.naturalWidth;
    const imgH  = screenImg.naturalHeight * scale;
    ctx.filter = "contrast(1.18) saturate(1.22)";
    ctx.drawImage(screenImg, 0, 0, W, imgH);
    ctx.filter = "none";

    // Status bar strip
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(0, 0, W, 130 * S);
  } else {
    // Fallback while loading — clean white
    ctx.fillStyle = "#F5F5F7";
    ctx.fillRect(0, 0, W, H);
  }

  ctx.restore();

  // Dynamic Island
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect((W - 448 * S) / 2, 28 * S, 448 * S, 80 * S, 40 * S);
  ctx.fill();
  ctx.restore();

  // Home indicator
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 144 * S, H - 36 * S, 288 * S, 14 * S, 7 * S);
  ctx.fill();
  ctx.restore();
}

// ─── Camera Rig ───────────────────────────────────────────────────────────────
// Phase 1 (0–90):  RISE — dramatic worm's-eye start, camera sweeps up the phone
// Phase 2 (90–150): PULL BACK — retreats to flat-on full-phone reveal
//
// Start geometry (f0):
//   cam  = [0, -3.0, 2.0]  — well below phone bottom (-0.925), further back
//   look = [0,  1.5, 0]    — aimed past the phone top toward sky
//   → effective upward pitch ≈ 66°  (worm's-eye / ~80° visual feel)
//
// End of rise (f90):
//   cam  = [0, +0.5, 2.0]  — just above phone centre height
//   look = [0,  0.5, 0]    — now looking straight at the screen face
//
// End of pull-back (f150):
//   cam  = [0,  0.0, 5.6]  — centred, flat-on, full phone in frame
//   look = [0,  0.0, 0]
function CameraRig() {
  const frame = useCurrentFrame();
  const { camera } = useThree();

  // ── Catmull-Rom spline ────────────────────────────────────────────────────
  // Interpolates p1→p2 using p0/p3 as tangent guides.
  // Unlike lerp-per-segment, this guarantees C1 continuity — velocity never
  // resets to zero at intermediate waypoints, giving naturally fluid motion.
  const crm = (t: number, p0: number, p1: number, p2: number, p3: number): number =>
    0.5 * (
       2 * p1 +
      (-p0 + p2)               * t +
      (2*p0 - 5*p1 + 4*p2 - p3) * t * t +
      (-p0 + 3*p1 - 3*p2 + p3) * t * t * t
    );

  // Evaluate an evenly-spaced catmull-rom arc with any number of waypoints.
  // t = 0 → first waypoint, t = 1 → last waypoint.
  const spline = (t: number, pts: number[]): number => {
    const segs = pts.length - 1;
    const si   = Math.min(segs - 1, Math.floor(t * segs));
    const lt   = t * segs - si;
    return crm(
      lt,
      pts[Math.max(0, si - 1)],
      pts[si],
      pts[si + 1],
      pts[Math.min(pts.length - 1, si + 2)],
    );
  };

  let cy = 0, cz = 0;
  const lx = 0, ly = 0.04, lz = 0.22;

  if (frame <= 90) {
    // Scene 1 — Rise (Camera Scan Up): 4 waypoints at f0 / f30 / f60 / f90
    const t = frame / 90;
    cy = spline(t, [-1.40, -0.76, -0.06,  0.58]);
    cz = spline(t, [ 0.55,  0.62,  0.82,  0.99]);
  } else {
    // Scene 2 — Pull Back (Full Reveal): 3 waypoints at f90 / f120 / f150
    const t = (frame - 90) / 60;
    cy = spline(t, [ 0.04, -0.01, -0.06]);
    cz = spline(t, [ 1.46,  3.08,  4.63]);
  }

  camera.position.set(0, cy, cz);
  (camera as THREE.PerspectiveCamera).lookAt(lx, ly, lz);
  (camera as THREE.PerspectiveCamera).fov  = 36;
  (camera as THREE.PerspectiveCamera).near = 0.05;
  (camera as THREE.PerspectiveCamera).far  = 40;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  return null;
}

// ─── GLB Phone Model ──────────────────────────────────────────────────────────
function GLBPhoneModel({ scene, texture }: { scene: THREE.Group; texture: THREE.Texture }) {
  const frame = useCurrentFrame();
  const fadeIn = eo3(pr(frame, 0, 20));

  const glassAlphaMap = useMemo(() => {
    const W = 256;
    const H = Math.round(W * (SCREEN_PLANE_HEIGHT / SCREEN_PLANE_WIDTH));
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx2 = c.getContext("2d")!;
    ctx2.fillStyle = "#000";
    ctx2.fillRect(0, 0, W, H);
    ctx2.fillStyle = "#fff";
    ctx2.beginPath();
    const r = Math.round(175 * (W / SCR_W));
    (ctx2 as CanvasRenderingContext2D & { roundRect:(x:number,y:number,w:number,h:number,r:number)=>void })
      .roundRect(0, 0, W, H, r);
    ctx2.fill();
    return new THREE.CanvasTexture(c);
  }, []);

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <group visible={fadeIn > 0.01}>
        {/* Screen glow — cool OLED blue-white spill onto bezels */}
        <pointLight position={[SCREEN_PLANE_X - 0.08, 0, 0]} color="#B8D4FF" intensity={fadeIn * 0.5} distance={2.0} decay={2} />
        <pointLight position={[SCREEN_PLANE_X - 0.35, 0, 0]} color="#C8DEFF" intensity={fadeIn * 0.2} distance={4.0} decay={2} />

        {/* GLB phone body */}
        <primitive object={scene} />

        {/* Screen content plane */}
        <mesh position={[SCREEN_PLANE_X, 0, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={1}>
          <planeGeometry args={[SCREEN_PLANE_WIDTH, SCREEN_PLANE_HEIGHT]} />
          <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
        </mesh>

        {/* Glass gloss overlay */}
        <mesh position={[SCREEN_PLANE_X - 0.002, 0, 0]} rotation={[0, -Math.PI / 2, 0]} renderOrder={2}>
          <planeGeometry args={[SCREEN_PLANE_WIDTH, SCREEN_PLANE_HEIGHT]} />
          <meshPhysicalMaterial
            color="#F8FBFF" transparent opacity={0.02}
            alphaMap={glassAlphaMap}
            roughness={0.04} metalness={0}
            ior={1.52} reflectivity={0.6}
            envMapIntensity={1.6}
            clearcoat={1.0} clearcoatRoughness={0.18}
            depthWrite={false} toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ─── Fallback placeholder (shown while GLB loads) ────────────────────────────
function IPhoneModel() {
  const frame  = useCurrentFrame();
  const fadeIn = eo3(pr(frame, 0, 20));
  return (
    <group>
      <RoundedBox args={[PW, PH, PD]} radius={CR} smoothness={8}>
        <meshPhysicalMaterial color="#B8B8B8" metalness={0.92} roughness={0.10} transparent opacity={fadeIn} />
      </RoundedBox>
    </group>
  );
}

// ─── Product Lighting (white studio) ─────────────────────────────────────────
function ProductLighting() {
  return (
    <>
      <directionalLight
        castShadow position={[-3.0, 8.0, 5.0]} color="#FFFFFF" intensity={2.2}
        shadow-mapSize-width={2048} shadow-mapSize-height={2048}
        shadow-camera-near={0.5} shadow-camera-far={28}
        shadow-camera-left={-3} shadow-camera-right={3}
        shadow-camera-top={4}   shadow-camera-bottom={-4}
        shadow-radius={6} shadow-bias={-0.0005}
      />
      <directionalLight position={[3.5, 6.0, 3.0]}  color="#F8FAFF" intensity={1.2} />
      <pointLight position={[0.0, 1.0, 5.0]}  color="#FFFFFF" intensity={1.0} distance={12} decay={2} />
      <pointLight position={[0.2, 1.5, -4.5]} color="#F0F4FF" intensity={3.0} distance={10} decay={1.8} />
      <pointLight position={[0.0, 6.0, 1.2]}  color="#FFFFFF" intensity={14.0} distance={14} decay={1.6} />
    </>
  );
}

// ─── Studio Floor (shadow receiver) ──────────────────────────────────────────
function StudioFloor() {
  const frame  = useCurrentFrame();
  const fadeIn = eo4(pr(frame, 10, 50));
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -PHONE_HALF_H - 0.18, 0]}>
      <planeGeometry args={[30, 30]} />
      <shadowMaterial transparent opacity={0.18 * fadeIn} />
    </mesh>
  );
}

// ─── GLB material setup ───────────────────────────────────────────────────────
function bindScreenMat(scene: THREE.Group) {
  scene.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    const m    = mesh.material as THREE.MeshStandardMaterial;
    if (!m?.isMeshStandardMaterial) return;
    mesh.castShadow = true;

    const n = mesh.name.toLowerCase();
    if (n.includes("glass") || (m.transparent && m.opacity < 0.5)) {
      m.roughness = 0.04; m.envMapIntensity = 0.06; m.needsUpdate = true; return;
    }
    const orig = m.metalness;
    if (orig > 0.65) {
      m.color.set("#252528"); m.metalness = 0.88; m.roughness = 0.20; m.envMapIntensity = 0.20;
    } else if (orig < 0.25) {
      m.color.set("#111114"); m.metalness = 0.10; m.roughness = 0.08; m.envMapIntensity = 0.30;
    } else {
      m.color.set("#1C1C1E"); m.metalness = 0.45; m.roughness = 0.48; m.envMapIntensity = 0.08;
    }
    m.needsUpdate = true;
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export const AwesomeAd: React.FC = () => {
  // Invalidate cache when material logic changes (bump CACHE_VER above)
  if (cachedSceneVer !== CACHE_VER) {
    cachedScene    = null;
    cachedSceneVer = CACHE_VER;
  }

  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Determine quality tier early — must be before useMemo so canvas uses the
  // right size from creation. isRendering is constant per page session.
  const { isRendering } = getRemotionEnvironment();
  // Preview canvas is 4× smaller → 16× fewer pixels to upload per frame
  const canvasW = isRendering ? SCR_W : SCR_W / 4;  // 2048 → 512
  const canvasH = isRendering ? SCR_H : SCR_H / 4;  // 4428 → 1107

  // ── Screen canvas + texture ────────────────────────────────────────────────
  const [screenCanvas, screenTexture] = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width  = canvasW;
    canvas.height = canvasH;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace      = THREE.SRGBColorSpace;
    t.minFilter       = THREE.LinearFilter;
    t.magFilter       = THREE.LinearFilter;
    t.generateMipmaps = false;
    t.anisotropy      = isRendering ? 16 : 1;
    return [canvas, t] as const;
  // isRendering is constant per session — no need to re-create on change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Screen image load ──────────────────────────────────────────────────────
  const [imgHandle] = useState(() =>
    cachedScreenImg ? null : delayRender("Loading screen image", { timeoutInMilliseconds: 60_000 })
  );
  const [screenImg, setScreenImg] = useState<HTMLImageElement | null>(cachedScreenImg);
  useEffect(() => {
    if (cachedScreenImg) { setScreenImg(cachedScreenImg); return; }
    const img = new Image();
    img.onload  = () => { cachedScreenImg = img; setScreenImg(img); if (imgHandle !== null) continueRender(imgHandle); };
    img.onerror = () => { if (imgHandle !== null) continueRender(imgHandle); };
    img.src = SCREEN_IMG_URL;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GLB load ───────────────────────────────────────────────────────────────
  const [handle] = useState(() =>
    cachedScene ? null : delayRender("Loading iPhone GLB", { timeoutInMilliseconds: 120_000 })
  );
  const [phoneScene, setPhoneScene] = useState<THREE.Group | null>(cachedScene);
  const colorAppliedRef = useRef(-1);

  useEffect(() => {
    if (cachedScene) {
      bindScreenMat(cachedScene);
      setPhoneScene(cachedScene);
      if (handle !== null) continueRender(handle);
      return;
    }
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        const scene = gltf.scene;
        bindScreenMat(scene);
        scene.updateWorldMatrix(true, true);
        const box    = new THREE.Box3().setFromObject(scene);
        const size   = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        scene.scale.setScalar(1.85 / size.y);
        scene.updateWorldMatrix(true, true);
        box.setFromObject(scene);
        box.getCenter(center);
        scene.position.sub(center);
        cachedScene = scene;
        setPhoneScene(scene);
        if (handle !== null) continueRender(handle);
      },
      undefined,
      (err) => {
        console.error("[AwesomeAd] GLB load failed:", err);
        if (handle !== null) continueRender(handle);
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render-body colour patch ───────────────────────────────────────────────
  if (phoneScene && colorAppliedRef.current !== CACHE_VER) {
    colorAppliedRef.current = CACHE_VER;
    phoneScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (!m?.isMeshStandardMaterial) return;
      const n = mesh.name.toLowerCase();
      if (n.includes("glass") || (m.transparent && m.opacity < 0.5)) {
        m.roughness = 0.04; m.envMapIntensity = 0.06; m.needsUpdate = true; return;
      }
      const orig = m.metalness;
      if (orig > 0.65)      { m.color.set("#252528"); m.metalness = 0.88; m.roughness = 0.20; m.envMapIntensity = 0.20; }
      else if (orig < 0.25) { m.color.set("#111114"); m.metalness = 0.10; m.roughness = 0.08; m.envMapIntensity = 0.30; }
      else                  { m.color.set("#1C1C1E"); m.metalness = 0.45; m.roughness = 0.48; m.envMapIntensity = 0.08; }
      m.needsUpdate = true;
    });
  }

  // ── Screen canvas draw ────────────────────────────────────────────────────
  // Redraw every frame. The canvas is only 512×1107 in preview (vs 2048×4428
  // at render-time) so the CPU draw + GPU upload cost is already very low.
  // Skipping redraws via a ref is fragile across React Fast Refresh hot-reloads
  // (refs survive but useMemo recreates a blank canvas → blank screen).
  const screenCtx = screenCanvas.getContext("2d")!;
  drawScreenContent(screenCtx, screenImg);
  screenTexture.needsUpdate = true;

  // ── Scene fade-in ──────────────────────────────────────────────────────────
  const fadeIn = eo3(pr(frame, 0, 12));

  return (
    <AbsoluteFill style={{ background: "#EDEDED", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: fadeIn }}>
        <ThreeCanvas
          width={width}
          height={height}
          shadows={isRendering ? { type: THREE.PCFShadowMap } : false}
          dpr={isRendering ? [1, 2] : [1, 1]}
          gl={{
            antialias:           isRendering,
            alpha:               true,
            powerPreference:     "high-performance",
            toneMapping:         THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.82,
          }}
        >
          <CameraRig />
          <ambientLight intensity={0.40} color="#FFFFFF" />
          <Environment preset="studio" resolution={isRendering ? 512 : 64} background={false} />
          <ProductLighting />
          <StudioFloor />
          {phoneScene
            ? <GLBPhoneModel scene={phoneScene} texture={screenTexture} />
            : <IPhoneModel />
          }
          {/* Post-processing only during final render — too expensive for preview */}
          {isRendering && <EffectComposer multisampling={4}><SMAA /></EffectComposer>}
        </ThreeCanvas>
      </div>
    </AbsoluteFill>
  );
};
