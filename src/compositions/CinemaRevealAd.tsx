/**
 * CinemaRevealAd — Simulated Cinematography (iPhone 17 Pro Max GLB + Three.js)
 *
 * ── What this demonstrates ────────────────────────────────────────────────────
 * Real camera motion through a 3D scene using a Sketchfab iPhone 17 Pro Max GLB.
 * CameraRig physically moves camera.position and camera.lookAt() every frame.
 *
 * ── GLB Loading Strategy ──────────────────────────────────────────────────────
 * Loaded via GLTFLoader in the DOM React context (outside ThreeCanvas) using
 * Remotion's delayRender/continueRender so the renderer waits for the asset.
 * On load:
 *   1. Rotate gltf.scene by [-π/2, π/2, 0] — corrects FBX→GLTF axis offset
 *      (phone long-axis was Z, becomes Y; screen was -X-facing, becomes +Z-facing)
 *   2. Boost envMapIntensity on all materials so IBL drives the metal look
 *   3. Replace the "screen.001" mesh material with our canvas aurora texture
 *   4. Compute Box3 after rotation, scale + offset to centre at world origin
 *
 * ── Camera Path ───────────────────────────────────────────────────────────────
 * Phase 1  (f0–80):    RISE   — pedestal up from phone bottom to eye-level
 * Phase 2  (f80–160):  PIVOT  — orbit right, reveals depth & side thickness
 * Phase 3  (f160–300): DOLLY  — pull back, re-centres for wide reveal shot
 * Phase 4  (f300–480): ORBIT  — full 360° fly-around, returns to front
 *
 * ── 3D Depth Layer Architecture ──────────────────────────────────────────────
 * z = -9      Background grid plane
 * z = -5…-7   Far background particles   (slowest parallax)
 * z = -1.5…-3 Midground particles
 * z =  0      Hero device
 * z = +1.2…+1.8 Foreground particles    (fastest parallax — proves real depth)
 *
 * Format:   9:16 (1080 × 1920)
 * Duration: 480 frames @ 30fps = 16 seconds
 */

import React, { useMemo, useRef, useEffect, useState } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, staticFile, delayRender, continueRender, getRemotionEnvironment } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Environment, RoundedBox } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { EffectComposer, SMAA, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// ─── GLB source URL ───────────────────────────────────────────────────────────
const MODEL_URL = staticFile("models/iphone17.glb");

// ─── Module-level cache ───────────────────────────────────────────────────────
// Lives outside React so it survives hot-reloads. Loaded once per page session.
// Bump CACHE_VER whenever bindScreenMat logic changes to force a fresh GLB load.
const CACHE_VER = 10;
let cachedSceneVer = 0;
let cachedScene: THREE.Group | null = null;
let cachedScreenImg: HTMLImageElement | null = null;

// ─── Screen image URL ─────────────────────────────────────────────────────────
const SCREEN_IMG_URL = staticFile("images/shared-salon.png");

// ─── Easing helpers ───────────────────────────────────────────────────────────
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const eo3 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 5);
const pr  = (f: number, s: number, d: number) => cl((f - s) / d, 0, 1);

// ─── Stable pseudo-random ─────────────────────────────────────────────────────
const sr = (seed: number) => ((seed * 1.6180339887) % 1 + 1) % 1;

// ─── Phone world-space dimensions ─────────────────────────────────────────────
// Calibrated for the camera path: cameraZ starts at 2.5 and pulls to 6.8.
// Phone fills ~70% of frame height at the start, ~45% at the end.
const PH  = 1.85;                       // phone height  (world units)
const PW  = PH * (77.6  / 163);        // phone width   ≈ 0.881
const PD  = PH * (8.25  / 163);        // phone depth   ≈ 0.094
const CR  = 0.082;                      // corner radius
const PHONE_HALF_H = PH / 2;           // ≈ 0.925

// Screen area (minimal bezels, iPhone Pro style)
const SW  = PW - 0.030;
const SH  = PH - 0.038;

// Camera module
const CM  = PH * (40.4 / 163);         // module square  ≈ 0.458
const CMT = PH * (4.2  / 163);         // module protrusion ≈ 0.048
const CMX = -0.095;
const CMY = PH / 2 - PH * (14.5 / 163) - CM / 2;

// Lens radii
const LR    = PH * (6.2 / 163);        // inner ≈ 0.070
const LROUT = LR + 0.018;              // outer ring
const LT    = CMT + 0.012;

// ─── Screen canvas dimensions ─────────────────────────────────────────────────
// 2048 × 4428 — 4× pixel density vs the visible plane size.
// At 1080-wide output the screen plane fills ~900px → 2048/900 ≈ 2.3× oversampled.
// That headroom lets LinearFilter (no mipmaps) sample sharply without blur.
const SCR_W = 2048;
const SCR_H = 4428;

// ─── Per-frame screen draw function ──────────────────────────────────────────
// Called every frame. Redraws the canvas so the phone screen animates live.
//
// ┌─────────────────────────────────────────────────────────────────────────────┐
// │ HOW TO PUT YOUR OWN VIDEO ON THE SCREEN                                     │
// │                                                                             │
// │  1. Add an <OffthreadVideo src={...} /> outside ThreeCanvas in the JSX.    │
// │  2. Render it to a hidden <video> ref via useRef<HTMLVideoElement>().        │
// │  3. In this function, replace the aurora blobs section with:                │
// │       ctx.drawImage(videoRef.current, 0, 0, SCR_W, SCR_H);                 │
// │  4. Leave the Dynamic Island + home-indicator overlays below so they sit    │
// │     on top of your video and the phone still looks like a real phone.       │
// └─────────────────────────────────────────────────────────────────────────────┘
function drawScreenFrame(
  ctx: CanvasRenderingContext2D,
  frame: number,
  screenImg: HTMLImageElement | null,
): void {
  // Read dimensions from the canvas itself so the function works at any
  // resolution — full quality (SCR_W×SCR_H) for render, small for preview.
  const W = ctx.canvas.width, H = ctx.canvas.height;
  // Scale factor — all pixel constants below were authored at 1024px wide.
  // Multiply by S so they stay proportionally correct at any SCR_W.
  const S = W / 1024;

  // Clear canvas then clip to rounded iPhone screen shape.
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  ctx.beginPath();
  (ctx as CanvasRenderingContext2D & { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void })
    .roundRect(0, 0, W, H, 175 * S);
  ctx.clip();

  // ── ▼ IMAGE CONTENT (your custom screenshot / video goes here) ─────────────
  if (screenImg && screenImg.complete && screenImg.naturalWidth > 0) {
    // White background behind the image
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, W, H);

    // Scale image to fill the canvas width exactly
    const scale   = W / screenImg.naturalWidth;
    const imgH    = screenImg.naturalHeight * scale;

    // Slow scroll: starts after frame 20, completes around frame 260.
    // Uses ease-out-quart so it decelerates naturally at the bottom.
    const scrollDuration = 240;
    const rawT   = Math.max(0, frame - 20) / scrollDuration;
    const eased  = 1 - Math.pow(1 - Math.min(1, rawT), 4); // eo4
    const maxScroll = Math.max(0, imgH - H + 160 * S); // leave 160px margin at bottom
    const scrollY   = -eased * maxScroll;

    // Real OLED displays are punchier than paper — contrast darkens darks and
    // brightens whites simultaneously (improves both vibrancy AND legibility).
    // No brightness shift: that pushes light text into the background.
    ctx.filter = "contrast(1.18) saturate(1.22)";
    ctx.drawImage(screenImg, 0, scrollY, W, imgH);
    ctx.filter = "none";

    // Subtle bottom fade to avoid a hard cutoff
    const fadeH = 220 * S;
    const fadeY = H - fadeH;
    const botFade = ctx.createLinearGradient(0, fadeY, 0, H);
    botFade.addColorStop(0, "rgba(255,255,255,0)");
    botFade.addColorStop(1, "rgba(255,255,255,0.85)");
    ctx.fillStyle = botFade;
    ctx.fillRect(0, fadeY, W, fadeH);

    // Status bar background — thin strip so the Dynamic Island looks clean
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fillRect(0, 0, W, 130 * S);
  } else {
    // ── Fallback aurora (shown while image is loading) ─────────────────────
    const t  = frame * 0.008;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,    "#0A0919");
    bg.addColorStop(0.30, "#110720");
    bg.addColorStop(0.65, "#0A1224");
    bg.addColorStop(1,    "#060A16");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const blobs = [
      { bx: 0.20, by: 0.28, rx: 0.32, ry: 0.20, col: "#5B21B6", a: 140, sp: 0.70, ph: 0.0 },
      { bx: 0.78, by: 0.20, rx: 0.28, ry: 0.16, col: "#1D4ED8", a: 120, sp: 0.50, ph: 1.3 },
      { bx: 0.45, by: 0.50, rx: 0.38, ry: 0.24, col: "#6D28D9", a: 105, sp: 0.40, ph: 2.6 },
      { bx: 0.18, by: 0.72, rx: 0.28, ry: 0.18, col: "#2563EB", a: 112, sp: 0.60, ph: 0.8 },
      { bx: 0.75, by: 0.62, rx: 0.30, ry: 0.20, col: "#4338CA", a: 100, sp: 0.35, ph: 3.8 },
    ];
    blobs.forEach((b) => {
      const px = (b.bx + Math.sin(t * b.sp       + b.ph) * 0.06) * W;
      const py = (b.by + Math.cos(t * b.sp * 0.8 + b.ph) * 0.04) * H;
      const rx = b.rx * W, ry = b.ry * H;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, Math.max(rx, ry));
      const a0 = b.a.toString(16).padStart(2, "0");
      grad.addColorStop(0, b.col + a0);
      grad.addColorStop(1, b.col + "00");
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, Math.sin(t * 0.25 + b.ph) * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });
  }
  // ── ▲ CUSTOM APP CONTENT ENDS HERE ──────────────────────────────────────

  // Release the rounded clip — overlays below are drawn on top of clipped content
  ctx.restore();

  // ── No canvas glass overlays ────────────────────────────────────────────
  // All glass / reflection effects are handled by the MeshPhysicalMaterial
  // clearcoat layer in Three.js. Canvas overlays on a white-background screen
  // only add unwanted white wash — the physics-based clearcoat is the right tool.

  // ── Dynamic Island — always drawn on top ──────────────────────────────────
  ctx.save();
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.roundRect((W - 448 * S) / 2, 28 * S, 448 * S, 80 * S, 40 * S);
  ctx.fill();
  ctx.restore();

  // ── Home indicator ────────────────────────────────────────────────────────
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.roundRect(W / 2 - 144 * S, H - 36 * S, 288 * S, 14 * S, 7 * S);
  ctx.fill();
  ctx.restore();
}

// ──────────────────────────────────────────────────────────────────────────────
// CAMERA RIG — four cinematic phases
//   0–80    Rise        camera lifts up the phone face
//   80–160  Pivot       arcs sideways to reveal depth
//   160–300 Dolly       pulls back to wide product reveal
//   300–480 Orbit       smooth 360° fly-around back to front
// ──────────────────────────────────────────────────────────────────────────────
const ORBIT_START = 300;
const ORBIT_DUR   = 180;
// Orbit radius chosen to match the dolly end-point: r ≈ 8.2 world units.
// dolly: camZ_pivot(~4.4) + 3.8 = 8.2; camX=0 → r=8.2
const ORBIT_R = 8.2;

function CameraRig() {
  const frame = useCurrentFrame();
  const { camera } = useThree();

  // ── Phase progress ───────────────────────────────────────────────────────
  const riseT  = eo5(pr(frame, 0,   80));
  const pivotT = eo4(pr(frame, 80,  80));
  const dollyT = eo4(pr(frame, 160, 140));

  // Orbit uses a full-cycle sine ease-in-out:
  //   theta = π·(1 − cos(t·π))  →  0 at t=0, 2π at t=1
  // This gives slow start & end (camera loiters at front facing the screen)
  // and peak speed on the sides — feels like a smooth product fly-around.
  const orbitRaw   = pr(frame, ORBIT_START, ORBIT_DUR);
  const orbitTheta = Math.PI * (1 - Math.cos(orbitRaw * Math.PI)); // 0 → 2π

  // ── Phase 1: Rise ────────────────────────────────────────────────────────
  const camY_rise = -2.0 + eo4(riseT) * 2.0;
  const camZ_rise =  3.4 + eo3(riseT) * 0.3;

  // ── Phase 2: Pivot ───────────────────────────────────────────────────────
  const camX_pivot = eo5(pivotT) * 0.72;
  const camZ_pivot = camZ_rise + eo4(pivotT) * 0.7;

  // ── Phase 3: Dolly ───────────────────────────────────────────────────────
  const camX_dolly = 0.72 - eo4(dollyT) * 0.72;        // returns to X=0
  const camZ_dolly = camZ_pivot + eo5(dollyT) * 3.8;   // pulls back to ~8.2
  const camY_dolly = camY_rise  + eo3(dollyT) * 0.3;   // settles at Y≈0.3

  // ── Phase 4: Orbit ───────────────────────────────────────────────────────
  // Spherical orbit: X = r·sin(θ), Z = r·cos(θ)
  // At θ=0 (start/end): camera at (0, 0.3, 8.2) == dolly end ✓  (continuous)
  // At θ=π (back):      camera at (0, 0.65, -8.2)  ← sees Apple logo
  const camX_orbit = ORBIT_R * Math.sin(orbitTheta);
  const camZ_orbit = ORBIT_R * Math.cos(orbitTheta);
  // Y elevation: rises at back of phone for a slightly high angle on the logo,
  // then descends back to frontal level.  0.3 + 0.35·(1−cos θ)/2
  const camY_orbit = 0.3 + 0.35 * (1 - Math.cos(orbitTheta)) * 0.5;

  // ── Select active phase ──────────────────────────────────────────────────
  let camX: number, camY: number, camZ: number;
  if (frame < 80) {
    camX = 0;        camY = camY_rise;  camZ = camZ_rise;
  } else if (frame < 160) {
    camX = camX_pivot; camY = 0;          camZ = camZ_pivot;
  } else if (frame < ORBIT_START) {
    camX = camX_dolly; camY = camY_dolly; camZ = camZ_dolly;
  } else {
    camX = camX_orbit; camY = camY_orbit; camZ = camZ_orbit;
  }

  // Micro-drift: organic handheld feel during non-orbit phases only
  const driftScale = frame < ORBIT_START ? 1.0 : 0.0;
  const driftX = (Math.sin(frame * 0.018) * 0.022 + Math.sin(frame * 0.037) * 0.010) * driftScale;
  const driftY = (Math.sin(frame * 0.025) * 0.016 + Math.sin(frame * 0.044) * 0.007) * driftScale;

  // LookAt: tilts up from low-angle during rise, centres for orbit
  const lookAtY = frame < ORBIT_START
    ? -0.6 + eo4(riseT) * 0.6
    : 0;

  // Narrow FOV slightly during orbit for cinematic telephoto feel
  const fov = frame < ORBIT_START ? 38 : 34;

  camera.position.set(camX + driftX, camY + driftY, camZ);
  (camera as THREE.PerspectiveCamera).lookAt(0, lookAtY, 0);
  (camera as THREE.PerspectiveCamera).fov  = fov;
  (camera as THREE.PerspectiveCamera).near = 0.1;
  (camera as THREE.PerspectiveCamera).far  = 60;
  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

  return null;
}

// ──────────────────────────────────────────────────────────────────────────────
// CAMERA MODULE — three Pro lenses + flash + LiDAR (back of phone)
// ──────────────────────────────────────────────────────────────────────────────
function CameraModule() {
  const lenses = [
    { x: -0.104, y:  0.104 },
    { x:  0.104, y:  0.104 },
    { x: -0.012, y: -0.118 },
  ];

  const titaniumMat = {
    color: "#B8B8B8", metalness: 0.92, roughness: 0.08,
    clearcoat: 0.3, clearcoatRoughness: 0.06, envMapIntensity: 2.8,
  };
  const glassMat = {
    color: "#050507", roughness: 0.02, metalness: 0.08,
    transmission: 0.22, thickness: 0.05, envMapIntensity: 1.2,
  };
  const lensInnerMat = {
    color: "#020204", roughness: 0.01, metalness: 0.02,
    transmission: 0.70, thickness: 0.12, envMapIntensity: 2.0,
  };

  return (
    <group position={[CMX, CMY, -PD / 2 - CMT / 2 - 0.001]}>
      <RoundedBox args={[CM, CM, CMT]} radius={0.040} smoothness={4}>
        <meshPhysicalMaterial {...titaniumMat} color="#1C1C1E" roughness={0.18} />
      </RoundedBox>

      {lenses.map((l, i) => (
        <group key={i} position={[l.x, l.y, CMT / 2]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[LROUT, LROUT, LT, 48]} />
            <meshPhysicalMaterial {...titaniumMat} color="#A8A8A8" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[LR, LR, LT + 0.004, 48]} />
            <meshPhysicalMaterial {...glassMat} />
          </mesh>
          <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[LR * 0.72, LR * 0.72, 0.008, 48]} />
            <meshPhysicalMaterial {...lensInnerMat} />
          </mesh>
        </group>
      ))}

      {/* Flash */}
      <group position={[0.166, 0.048, CMT / 2 + 0.006]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.020, 0.020, 0.016, 20]} />
          <meshStandardMaterial color="#FFF5E0" emissive="#FFF5E0" emissiveIntensity={0.6} roughness={0.8} />
        </mesh>
      </group>

      {/* LiDAR */}
      <group position={[0.166, -0.024, CMT / 2 + 0.004]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.010, 20]} />
          <meshPhysicalMaterial color="#0A0A0C" roughness={0.05} metalness={0.1} transmission={0.5} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.019, 0.019, 0.008, 20]} />
          <meshPhysicalMaterial color="#888" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// IPHONE MODEL — entirely from Three.js primitives; no external assets
// ──────────────────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────────────────────────────────────
// GLB PHONE MODEL — renders the loaded Sketchfab iPhone 17 Pro Max scene.
// Receives the already-prepared scene (transformed, enhanced) as a prop.
// ──────────────────────────────────────────────────────────────────────────────
// Screen overlay dimensions derived from iphone17.glb bounding box inspection:
//   Glass front face at GLB local X = -0.04 (unchanged by root rotX(-90°))
//   After scale 1.099:  world X = -0.0440
//   Full bbox X: -0.0440 to +0.0989 → center = 0.0275 → scene offset = -0.0275
//   Screen face in float-group local X = -0.0440 + (-0.0275) = -0.0715
//   Outer rotY(+π/2) maps floatGroupX → worldZ via worldZ = -floatGroupX
//   → screen face at worldZ = +0.0715
//   Plane must be at floatGroupX < -0.0715 (more negative = in front of screen).
//   Using -0.085 gives worldZ = +0.085, i.e. 13.5mm clearance from the glass surface.
const SCREEN_PLANE_X      = -0.085;
// Inset from the GLB screen mesh so the Black Titanium bezel shows clearly.
// Side bezel gap  = (PW 0.880 - 0.816) / 2 = 0.032 per side
// Top/btm gap     = (PH 1.850 - 1.778) / 2 = 0.036 per side
const SCREEN_PLANE_WIDTH  = 0.816;
const SCREEN_PLANE_HEIGHT = 1.778;

function GLBPhoneModel({ scene, texture }: { scene: THREE.Group; texture: THREE.Texture }) {
  const frame = useCurrentFrame();

  const floatY    = Math.sin(frame / 85  * Math.PI) * 0.022;
  const floatTilt = Math.sin(frame / 110 * Math.PI) * 0.008;
  const fadeIn    = eo3(pr(frame, 0, 20));

  // ── Glass overlay alpha mask ────────────────────────────────────────────────
  // A small canvas baked once: white inside the rounded-rect, black outside.
  // Applied as alphaMap so the MeshPhysicalMaterial glass is clipped to the
  // exact iPhone screen corners (matches the 175px radius used in drawScreenFrame).
  const glassAlphaMap = useMemo(() => {
    const W = 256;
    const H = Math.round(W * (SCREEN_PLANE_HEIGHT / SCREEN_PLANE_WIDTH)); // ≈ 548
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx2 = c.getContext("2d")!;
    ctx2.fillStyle = "#000";
    ctx2.fillRect(0, 0, W, H);
    ctx2.fillStyle = "#fff";
    ctx2.beginPath();
    const r = Math.round(175 * (W / SCR_W)); // scale 175 px @ 1024 → ≈ 43 px @ 256
    (ctx2 as CanvasRenderingContext2D & { roundRect:(x:number,y:number,w:number,h:number,r:number)=>void })
      .roundRect(0, 0, W, H, r);
    ctx2.fill();
    const t = new THREE.CanvasTexture(c);
    return t;
  }, []);

  // rotY(+π/2): turns the phone so the screen (natural -X face) faces +Z camera
  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      <group
        position={[0, floatY, 0]}
        rotation={[floatTilt, 0, 0]}
        visible={fadeIn > 0.01}
      >
        {/* Screen glow — sits 8 cm in front of the glass plane (local -X = world +Z).
            Illuminates the titanium bezels & camera island with cool OLED light,
            exactly the blue-white spill you see on a real iPhone in a dark room.
            clearcoatRoughness=0.18 means any glass specular from this will be a
            broad soft glow, not a dot.                                           */}
        <pointLight
          position={[SCREEN_PLANE_X - 0.08, 0, 0]}
          color="#B8D4FF"
          intensity={fadeIn * 0.5}
          distance={2.0}
          decay={2}
        />
        {/* Wider secondary fill — reaches further around the phone body sides */}
        <pointLight
          position={[SCREEN_PLANE_X - 0.35, 0, 0]}
          color="#C8DEFF"
          intensity={fadeIn * 0.2}
          distance={4.0}
          decay={2}
        />

        {/* GLB phone body */}
        <primitive object={scene} />

        {/* ── Screen overlay plane ─────────────────────────────────────────────
            Positioned in the float-group's local space (before the outer +π/2 Y
            rotation is applied).  After the outer rotation:
              X = SCREEN_PLANE_X  →  world Z ≈ +0.085  (just in front of phone face)
              normal faces -X  →  faces +Z (toward camera) ✓
            The canvas texture has alpha=0 outside the rounded clip region, so the
            transparent corners reveal the phone body behind the plane.            */}
        <mesh
          position={[SCREEN_PLANE_X, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          renderOrder={1}
        >
          <planeGeometry args={[SCREEN_PLANE_WIDTH, SCREEN_PLANE_HEIGHT]} />
          <meshBasicMaterial
            map={texture}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        {/* ── Screen glass gloss layer ──────────────────────────────────────────
            A MeshPhysicalMaterial plane 2 mm in front of the content plane.
            clearcoat=1 simulates the thin optical glass over the OLED panel.
            alphaMap clips it to the same rounded-rect shape as the screen content
            so it never bleeds outside the phone bezels.                          */}
        <mesh
          position={[SCREEN_PLANE_X - 0.002, 0, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          renderOrder={2}
        >
          <planeGeometry args={[SCREEN_PLANE_WIDTH, SCREEN_PLANE_HEIGHT]} />
          <meshPhysicalMaterial
            color="#F8FBFF"
            transparent
            opacity={0.02}
            alphaMap={glassAlphaMap}
            roughness={0.04}
            metalness={0}
            ior={1.52}
            reflectivity={0.6}
            envMapIntensity={1.6}
            clearcoat={1.0}
            clearcoatRoughness={0.18}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PRIMITIVE FALLBACK — shown only while the GLB is loading (studio preview).
// Remotion's delayRender holds real renders until the GLB is ready, so this
// is only visible during interactive preview before the asset loads.
// ──────────────────────────────────────────────────────────────────────────────
function IPhoneModel() {
  const frame = useCurrentFrame();
  const floatY    = Math.sin(frame / 85 * Math.PI) * 0.022;
  const floatTilt = Math.sin(frame / 110 * Math.PI) * 0.008;
  const fadeIn    = eo3(pr(frame, 0, 20));

  const titaniumMat = {
    color: "#B8B8B8", metalness: 0.92, roughness: 0.10,
    clearcoat: 0.35, clearcoatRoughness: 0.08, envMapIntensity: 3.0,
    transparent: true as const, opacity: fadeIn,
  };

  return (
    <group position={[0, floatY, 0]} rotation={[floatTilt, 0, 0]}>
      <RoundedBox args={[PW, PH, PD]} radius={CR} smoothness={8}>
        <meshPhysicalMaterial {...titaniumMat} />
      </RoundedBox>
    </group>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// PRODUCT LIGHTING — key + fill + rim + screen-sympathetic warm light
// ──────────────────────────────────────────────────────────────────────────────
function ProductLighting() {
  return (
    <>
      {/* ── Primary key — upper-left, casts the main product shadow onto floor.
          Shadow frustum covers phone bounding box with a little margin.         */}
      <directionalLight
        castShadow
        position={[-3.0, 8.0, 5.0]}
        color="#FFFFFF"
        intensity={2.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={28}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-radius={6}
        shadow-bias={-0.0005}
      />
      {/* ── Secondary key — upper-right, fills the opposite face */}
      <directionalLight
        position={[3.5, 6.0, 3.0]}
        color="#F8FAFF"
        intensity={1.2}
      />
      {/* ── Soft front fill — keeps screen-side frame from going fully black */}
      <pointLight position={[0.0, 1.0, 5.0]} color="#FFFFFF" intensity={1.0} distance={12} decay={2} />
      {/* ── Rim / back separation — thin edge highlight on titanium frame */}
      <pointLight position={[0.2, 1.5, -4.5]} color="#F0F4FF" intensity={3.0} distance={10} decay={1.8} />
      {/* ── Glass softbox — overhead, wide spread via clearcoatRoughness=0.18 */}
      <pointLight position={[0.0, 6.0, 1.2]} color="#FFFFFF" intensity={14.0} distance={14} decay={1.6} />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// BACKGROUND GRID
// ──────────────────────────────────────────────────────────────────────────────
function BackgroundPlane() {
  const frame = useCurrentFrame();
  const fadeIn = eo4(pr(frame, 0, 40));

  const gridTexture = useMemo(() => {
    const S = 512;
    const c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#060508";
    ctx.fillRect(0, 0, S, S);
    ctx.strokeStyle = "rgba(180,150,100,0.045)";
    ctx.lineWidth   = 0.5;
    const STEP = 32;
    for (let i = 0; i <= S; i += STEP) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, S); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(S, i); ctx.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(8, 16);
    return t;
  }, []);

  return (
    <mesh position={[0, 0, -9]}>
      <planeGeometry args={[28, 56]} />
      <meshStandardMaterial
        map={gridTexture}
        emissiveMap={gridTexture}
        emissive={new THREE.Color(1, 1, 1)}
        emissiveIntensity={0.25}
        roughness={1}
        metalness={0}
        transparent
        opacity={0.82 * fadeIn}
      />
    </mesh>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// DEPTH PARTICLES — 3 tiers; real parallax proves the scene has actual depth
// ──────────────────────────────────────────────────────────────────────────────
function DepthParticles() {
  const frame = useCurrentFrame();

  const tiers = useMemo(() => [
    { count: 200, zMin: -7, zMax: -5,   spread: 6, size: 0.012, color: "#C8B88A", opacity: 0.18 },
    { count: 150, zMin: -3, zMax: -1.5, spread: 5, size: 0.016, color: "#8898CC", opacity: 0.16 },
    { count:  80, zMin: 1.2, zMax: 1.8, spread: 4, size: 0.022, color: "#FFFFFF", opacity: 0.12 },
  ], []);

  const allParticles = useMemo(() =>
    tiers.flatMap((tier, ti) =>
      Array.from({ length: tier.count }, (_, i) => {
        const seed = ti * 10000 + i;
        return {
          x:     (sr(seed * 7)  - 0.5) * tier.spread,
          y:     (sr(seed * 11) - 0.5) * tier.spread * 2,
          z:     tier.zMin + sr(seed * 13) * (tier.zMax - tier.zMin),
          size:  tier.size * (0.6 + sr(seed * 17) * 0.8),
          speed: 0.0004 + sr(seed * 19) * 0.0004,
          phase: sr(seed * 23) * Math.PI * 2,
          color: tier.color,
          opacity: tier.opacity,
        };
      })
    ),
  [tiers]);

  const fadeIn = eo4(pr(frame, 0, 45));

  return (
    <>
      {allParticles.map((p, i) => {
        const t       = frame * p.speed + p.phase;
        const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(t));
        return (
          <mesh
            key={i}
            position={[
              p.x + Math.sin(t * 1.1) * 0.04,
              p.y + Math.cos(t * 0.8) * 0.03,
              p.z,
            ]}
          >
            <sphereGeometry args={[p.size, 4, 4]} />
            <meshBasicMaterial
              color={p.color}
              transparent
              opacity={p.opacity * twinkle * fadeIn}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// GROUND REFLECTION — elliptical glow below the device
// ──────────────────────────────────────────────────────────────────────────────
function GroundReflection() {
  const frame   = useCurrentFrame();
  const opacity = eo4(pr(frame, 60, 60));
  return (
    <mesh position={[0, -PHONE_HALF_H - 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.0, 1.0]} />
      <meshBasicMaterial color="#3060C0" transparent opacity={0.10 * opacity} />
    </mesh>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// STUDIO FLOOR — large white plane that only renders shadows (shadowMaterial).
// The CSS background shows through; the phone shadow appears on top of it.
// ──────────────────────────────────────────────────────────────────────────────
function StudioFloor() {
  const frame = useCurrentFrame();
  const fadeIn = eo4(pr(frame, 10, 50));
  return (
    <mesh
      receiveShadow
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -PHONE_HALF_H - 0.18, 0]}
    >
      <planeGeometry args={[30, 30]} />
      {/* shadowMaterial is transparent except where shadows fall — perfectly
          matches a white studio background with no colour bleed.              */}
      <shadowMaterial transparent opacity={0.18 * fadeIn} />
    </mesh>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// CSS TEXT OVERLAY — appears when camera settles in the dolly-back phase
// ──────────────────────────────────────────────────────────────────────────────
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';

function TextOverlay() {
  const frame   = useCurrentFrame();
  const headT   = eo4(pr(frame, 200, 55));
  const subT    = eo4(pr(frame, 230, 45));
  const ctaT    = eo4(pr(frame, 255, 35));
  const fadeOut = 1 - eo3(pr(frame, 285, 15));

  if (headT < 0.01) return null;

  return (
    <div style={{
      position:      "absolute",
      left:          0,
      right:         0,
      bottom:        96,
      padding:       "0 64px",
      opacity:       fadeOut,
      pointerEvents: "none",
    }}>
      <div style={{
        fontSize:      10,
        fontWeight:    700,
        fontFamily:    SANS,
        color:         "rgba(40,100,220,0.90)",
        letterSpacing: "0.32em",
        textTransform: "uppercase" as const,
        opacity:       headT,
        transform:     `translateY(${(1 - headT) * 18}px)`,
        marginBottom:  12,
      }}>
        Cinema Reveal
      </div>
      <div style={{
        fontSize:      56,
        fontWeight:    300,
        fontFamily:    SANS,
        color:         "#111111",
        letterSpacing: "-0.025em",
        lineHeight:    1.06,
        opacity:       headT,
        transform:     `translateY(${(1 - headT) * 28}px)`,
      }}>
        Designed for
      </div>
      <div style={{
        fontSize:      56,
        fontWeight:    700,
        fontFamily:    SANS,
        color:         "#111111",
        letterSpacing: "-0.035em",
        lineHeight:    1.04,
        opacity:       headT,
        transform:     `translateY(${(1 - headT) * 28}px)`,
        marginBottom:  22,
      }}>
        everything.
      </div>
      <div style={{
        width:        `${subT * 56}px`,
        height:       0.5,
        background:   "rgba(40,100,220,0.60)",
        marginBottom: 14,
      }} />
      <div style={{
        fontSize:      14,
        fontFamily:    SANS,
        color:         "rgba(60,80,120,0.80)",
        letterSpacing: "0.02em",
        opacity:       subT,
        transform:     `translateY(${(1 - subT) * 14}px)`,
        marginBottom:  32,
      }}>
        A showcase of simulated cinematography in Three.js.
      </div>
      <div style={{
        display:    "inline-flex",
        alignItems: "center",
        gap:        14,
        opacity:    ctaT,
        transform:  `translateY(${(1 - ctaT) * 12}px)`,
      }}>
        <div style={{
          background:    "rgba(20,20,20,0.90)",
          border:        "1px solid rgba(20,20,20,0.15)",
          borderRadius:  4,
          padding:       "14px 34px",
          fontSize:      11,
          fontWeight:    700,
          fontFamily:    SANS,
          color:         "#FFFFFF",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}>
          Explore
        </div>
        <div style={{
          fontSize:      11,
          fontFamily:    SANS,
          color:         "rgba(60,80,120,0.65)",
          letterSpacing: "0.06em",
        }}>
          device.example
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════
export const CinemaRevealAd: React.FC = () => {
  // Invalidate module-level cache when bindScreenMat logic is updated.
  // Bump CACHE_VER (top of file) to force a fresh GLB re-load after material changes.
  if (cachedSceneVer !== CACHE_VER) {
    cachedScene    = null;
    cachedSceneVer = CACHE_VER;
  }

  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Determine quality tier early — must be before useMemo so canvas uses the
  // right size from creation. isRendering is constant per page session.
  const { isRendering } = getRemotionEnvironment();
  // Preview canvas is 4× smaller in each dimension → 16× fewer pixels to upload
  const canvasW = isRendering ? SCR_W       : SCR_W / 4;  // 2048 → 512
  const canvasH = isRendering ? SCR_H       : SCR_H / 4;  // 4428 → 1107

  // ── Screen canvas + texture ────────────────────────────────────────────────
  // Canvas and texture are created once; the canvas is redrawn every frame
  // so the phone screen is fully animated. Set texture.needsUpdate = true after
  // each draw to push the new pixels to the GPU.
  const [screenCanvas, screenTexture] = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width  = canvasW;
    canvas.height = canvasH;
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace      = THREE.SRGBColorSpace;
    // LinearFilter (no mipmaps) is sharper for text at close range.
    // Mipmaps cause trilinear blur when the rendered size is slightly smaller
    // than the source canvas, which is exactly what makes text illegible.
    t.minFilter       = THREE.LinearFilter;
    t.magFilter       = THREE.LinearFilter;
    t.generateMipmaps = false;
    t.anisotropy      = isRendering ? 16 : 1;
    return [canvas, t] as const;
  // canvasW/H are derived from isRendering which is constant per session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Screen image loading ──────────────────────────────────────────────────
  const [imgHandle] = useState(() =>
    cachedScreenImg ? null : delayRender("Loading screen image", { timeoutInMilliseconds: 60_000 })
  );
  const [screenImg, setScreenImg] = useState<HTMLImageElement | null>(cachedScreenImg);

  useEffect(() => {
    if (cachedScreenImg) { setScreenImg(cachedScreenImg); return; }
    const img = new Image();
    img.onload = () => {
      cachedScreenImg = img;
      setScreenImg(img);
      if (imgHandle !== null) continueRender(imgHandle);
    };
    img.onerror = () => { if (imgHandle !== null) continueRender(imgHandle); };
    img.src = SCREEN_IMG_URL;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── GLB loading — delayRender in useState so Remotion holds frames ────────
  // Increased to 120s: the GLB is large (~20 MB) and Remotion's headless
  // Puppeteer renderer must fetch it over localhost on first load, which can
  // easily exceed the 33s default on slower machines.
  const [handle] = useState(() =>
    cachedScene ? null : delayRender("Loading iPhone 17 Pro Max GLB", { timeoutInMilliseconds: 120_000 })
  );
  const [phoneScene, setPhoneScene] = useState<THREE.Group | null>(cachedScene);

  // Tracks which CACHE_VER the Black Titanium colours were last applied to the scene.
  // We apply in the RENDER BODY (not in useEffect) so React Fast Refresh soft-updates
  // — which skip useEffect([], []) — still pick up colour changes without a hard refresh.
  const colorAppliedRef = useRef(-1);

  // Fix GLB materials — only adjust what matters for the render.
  // The screen canvas is injected via a separate overlay <mesh> inside GLBPhoneModel,
  // so we do NOT touch the screen/glass meshes with the canvas texture here.
  // This avoids all the stale-texture-cache and UV-ordering issues we hit before.
  const bindScreenMat = (scene: THREE.Group) => {
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (!m?.isMeshStandardMaterial) return;

      // All meshes cast shadows onto the studio floor
      mesh.castShadow = true;

      const n = mesh.name.toLowerCase();
      if (n.includes("glass") || (m.transparent && m.opacity < 0.5)) {
        // Keep the screen/cover glass transparent but clean up roughness
        m.roughness       = 0.04;
        m.envMapIntensity = 0.06;
        m.needsUpdate     = true;
        return;
      }

      // Read the GLB artist's original metalness BEFORE we override anything.
      // High metalness in the GLB → this mesh was meant to look metallic (frame, rails).
      // Low-to-medium metalness → body, back panel, camera ring (more matte finish).
      const origMetal = m.metalness;

      if (origMetal > 0.65) {
        // Titanium rails / frame — brushed metallic Black Titanium
        m.color.set("#252528");
        m.metalness       = 0.88;
        m.roughness       = 0.20;
        m.envMapIntensity = 0.20;
      } else if (origMetal < 0.25) {
        // Camera glass / sensor covers — very dark glossy
        m.color.set("#111114");
        m.metalness       = 0.10;
        m.roughness       = 0.08;
        m.envMapIntensity = 0.30;
      } else {
        // Body + back panel — matte-dark Black Titanium
        m.color.set("#1C1C1E");
        m.metalness       = 0.45;
        m.roughness       = 0.48;
        m.envMapIntensity = 0.08;
      }
      m.needsUpdate = true;
    });
  };

  useEffect(() => {
    if (cachedScene) {
      // Rebind screenTexture — after a hot-reload the cached scene's material
      // still points to the old (stale) texture object. Recreate it fresh.
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

        // ── Step 1: Bind screen material + boost IBL on body materials ───────
        bindScreenMat(scene);

        // ── Step 2: Auto-scale and centre via bounding box ──────────────────
        // Natural Sketchfab state: height is along world Y (size.y ≈ 1.68).
        // Scale to 1.85 world-units tall, then centre.
        scene.updateWorldMatrix(true, true);
        const box    = new THREE.Box3().setFromObject(scene);
        const size   = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const targetHeight = 1.85;
        const scale        = targetHeight / size.y;
        scene.scale.setScalar(scale);

        // Re-measure at new scale — must call updateWorldMatrix again so
        // the child matrixWorlds reflect the new scale before re-boxing.
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
        console.error("[CinemaRevealAd] GLB load failed:", err);
        if (handle !== null) continueRender(handle);
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw the screen canvas for this frame — all hooks are above this line
  const screenCtx = screenCanvas.getContext("2d")!;
  drawScreenFrame(screenCtx, frame, screenImg);
  screenTexture.needsUpdate = true;

  // ── Render-body colour patch ─────────────────────────────────────────────
  // Name-agnostic: overrides EVERY solid mesh to Black Titanium.
  // Runs once per CACHE_VER (not every frame) even through Fast Refresh soft-updates.
  if (phoneScene && colorAppliedRef.current !== CACHE_VER) {
    colorAppliedRef.current = CACHE_VER;
    const seen: string[] = [];
    phoneScene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      seen.push(`"${mesh.name}" metal=${((mesh.material as THREE.MeshStandardMaterial)?.metalness ?? -1).toFixed(2)}`);
      const m = mesh.material as THREE.MeshStandardMaterial;
      if (!m?.isMeshStandardMaterial) return;

      const n = mesh.name.toLowerCase();
      if (n.includes("glass") || (m.transparent && m.opacity < 0.5)) {
        m.roughness       = 0.04;
        m.envMapIntensity = 0.06;
        m.needsUpdate     = true;
        return;
      }

      // Mirror bindScreenMat differentiation — same thresholds
      const origMetal = m.metalness;
      if (origMetal > 0.65) {
        m.color.set("#252528");
        m.metalness       = 0.88;
        m.roughness       = 0.20;
        m.envMapIntensity = 0.20;
      } else if (origMetal < 0.25) {
        m.color.set("#111114");
        m.metalness       = 0.10;
        m.roughness       = 0.08;
        m.envMapIntensity = 0.30;
      } else {
        m.color.set("#1C1C1E");
        m.metalness       = 0.45;
        m.roughness       = 0.48;
        m.envMapIntensity = 0.08;
      }
      m.needsUpdate = true;
    });
    // eslint-disable-next-line no-console
    console.log("[CinemaRevealAd] GLB meshes:", seen.join(" | "));
  }

  const fadeIn = eo3(pr(frame, 0, 16));

  return (
    <AbsoluteFill style={{ background: "#EDEDED", overflow: "hidden" }}>

      {/* Three.js scene */}
      <div style={{ position: "absolute", inset: 0 }}>
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
          {/* Studio IBL — lower resolution in preview for faster scrubbing */}
          <Environment preset="studio" resolution={isRendering ? 512 : 64} background={false} />

          <ProductLighting />

          {/* Studio floor — receives phone shadow via shadowMaterial */}
          <StudioFloor />

          {/* Render GLB if loaded, otherwise show the primitive placeholder */}
          {phoneScene
            ? <GLBPhoneModel scene={phoneScene} texture={screenTexture} />
            : <IPhoneModel />
          }

          {/* Post-processing: full AA+SMAA on final render; skip in preview */}
          {isRendering && (
            <EffectComposer multisampling={4}>
              <SMAA />
            </EffectComposer>
          )}
        </ThreeCanvas>
      </div>

      <TextOverlay />

      <div style={{
        position:      "absolute",
        top:           58,
        left:          64,
        fontSize:      9,
        fontWeight:    700,
        fontFamily:    SANS,
        color:         "rgba(40,80,180,0.35)",
        letterSpacing: "0.30em",
        textTransform: "uppercase",
        opacity:       eo3(pr(frame, 18, 28)),
        zIndex:        30,
      }}>
        Cinema Reveal
      </div>

    </AbsoluteFill>
  );
};
