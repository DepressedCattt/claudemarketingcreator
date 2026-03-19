/**
 * IPhoneAd — "The most personal device. Ever made."
 *
 * A 15-second Apple-style product reveal built entirely from Three.js primitives.
 * No imported models — the iPhone is constructed from RoundedBox, CylinderGeometry,
 * BoxGeometry, and PlaneGeometry, with MeshPhysicalMaterial for titanium + glass.
 *
 * The screen texture is drawn with the Canvas 2D API (iOS lockscreen: aurora
 * wallpaper, Dynamic Island, "9:41", notification cards, dock) then converted to
 * a THREE.CanvasTexture — giving a realistic, lit-from-within display.
 *
 * Format:  1:1 (1080 × 1080)
 * Duration: 450 frames @ 30fps = 15 seconds
 * Camera:  cameraZ=5, fov=36 — telephoto product-photography feel
 *
 * ─── Animation Timeline ─────────────────────────────────────────────────────
 * f0–30    Dark reveal: phone fades in showing titanium back + camera system
 * f30–155  Epic turn:   180° rotation from back → front (the "wow" moment)
 * f155–290 Front hero:  screen glowing, subtle float, text: "iPhone 17 Pro."
 * f290–375 Camera show: tilt reveals Pro camera system, then returns front
 * f375–450 CTA:         final beauty shot, text, soft fade
 *
 * ─── 3D Layer Architecture ──────────────────────────────────────────────────
 * Layer 1: CSS background gradient (below ThreeScene)
 * Layer 2: ThreeScene (transparent, single canvas), with:
 *            - IPhoneModel (body, screen, camera module, buttons)
 *            - Product lighting rig (key, fill, rim, sweep)
 *            - Ambient particle dust
 * Layer 3: CSS text overlay (after ThreeScene in DOM)
 */

import React, { useRef, useEffect, useMemo } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  useVideoConfig,
} from "remotion";
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
} from "../utils/premiumMotion";
import { ThreeScene } from "../utils/three";

// ─── Design tokens ────────────────────────────────────────────────────────────
const SANS  = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO  = '"SF Mono", "Fira Code", monospace';
const TEXT  = "#FAFAF9";
const BODY  = "#A1A1AA";
const ACC   = "#F97316";

// ─── Phone dimensions (world units) ──────────────────────────────────────────
// Calibrated to cameraZ=5, fov=36 → 1 unit ≈ 332px on 1080px canvas
// Phone fills ~60% of frame height for a strong product hero.
const PH   = 1.85;                   // height
const PW   = PH * (77.6 / 163);     // width  ≈ 0.881  (iPhone 16 Pro aspect)
const PD   = PH * (8.25 / 163);     // depth  ≈ 0.094
const CR   = 0.082;                  // corner radius (≈ 4.4% of height)

// Screen area (leaves bezels)
const SW   = PW - 0.030;            // screen width
const SH   = PH - 0.038;            // screen height (minimal bezel iPhone)

// Camera module (back, upper area)
const CM   = PH * (40.4 / 163);     // module square size ≈ 0.458
const CMT  = PH * (4.2 / 163);      // module protrusion ≈ 0.048
const CMX  = -0.095;                 // module X center (slightly left)
const CMY  = PH / 2 - PH * (14.5 / 163) - CM / 2; // module Y center ≈ 0.540

// Camera lenses (relative to module center)
const LR   = PH * (6.2 / 163);      // lens inner radius ≈ 0.070
const LROUT= LR + 0.018;            // lens ring outer radius
const LT   = CMT + 0.012;           // lens protrusion (above module)

// ─── Canvas 2D helpers ────────────────────────────────────────────────────────
function rrect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

// ─── iOS Lockscreen Canvas ────────────────────────────────────────────────────
// Drawn at 512×1108 (maintains iPhone 390:844 aspect ratio at retina density).
// Converted to THREE.CanvasTexture and used on the screen plane + emissiveMap.
function buildScreenCanvas(): HTMLCanvasElement {
  const W = 512, H = 1108;
  const c  = document.createElement("canvas");
  c.width  = W;
  c.height = H;
  const ctx = c.getContext("2d")!;

  // ── Aurora wallpaper ─────────────────────────────────────────────────────
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0,   "#0B0A1E");
  bg.addColorStop(0.28,"#130820");
  bg.addColorStop(0.6, "#0C1326");
  bg.addColorStop(1,   "#070B18");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Aurora blobs — large soft radial gradients
  const blob = (x: number, y: number, r: number, hex: string, a: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const alpha = Math.round(a).toString(16).padStart(2, "0");
    g.addColorStop(0,   hex + alpha);
    g.addColorStop(0.45, hex + Math.round(a * 0.35).toString(16).padStart(2, "0"));
    g.addColorStop(1,   "#00000000");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  };
  blob(115, 360, 320, "#6D28D9", 110);
  blob(390, 580, 300, "#1D4ED8", 95);
  blob(280, 220, 250, "#7C3AED", 80);
  blob(80,  720, 270, "#2563EB", 70);
  blob(420, 220, 200, "#4F46E5", 55);

  // Top soft highlight
  const topG = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 340);
  topG.addColorStop(0, "rgba(255,255,255,0.07)");
  topG.addColorStop(1, "transparent");
  ctx.fillStyle = topG;
  ctx.fillRect(0, 0, W, H);

  // ── Dynamic Island ────────────────────────────────────────────────────────
  ctx.fillStyle = "#000";
  rrect(ctx, W / 2 - 112, 14, 224, 40, 20);
  ctx.fill();

  // Status: battery (right of screen, outside DI zone)
  ctx.font         = "bold 13px -apple-system, Helvetica, Arial, sans-serif";
  ctx.fillStyle    = "rgba(255,255,255,0.78)";
  ctx.textAlign    = "right";
  ctx.fillText("100%", W - 22, 42);

  // ── Large time display ────────────────────────────────────────────────────
  ctx.font         = "700 108px -apple-system, Helvetica, Arial, sans-serif";
  ctx.fillStyle    = "#FFFFFF";
  ctx.textAlign    = "center";
  ctx.shadowColor  = "rgba(139,92,246,0.4)";
  ctx.shadowBlur   = 28;
  ctx.fillText("9:41", W / 2, 218);
  ctx.shadowBlur   = 0;

  // ── Date ──────────────────────────────────────────────────────────────────
  ctx.font      = "300 24px -apple-system, Helvetica, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText("Monday, March 17", W / 2, 258);

  // ── Notification cards ────────────────────────────────────────────────────
  const card = (
    y: number, iconColor: string, iconGlyph: string,
    app: string, title: string, time: string,
  ) => {
    // Frosted background
    ctx.save();
    ctx.globalAlpha = 0.92;
    const cg = ctx.createLinearGradient(0, y, 0, y + 96);
    cg.addColorStop(0, "rgba(255,255,255,0.13)");
    cg.addColorStop(1, "rgba(255,255,255,0.08)");
    ctx.fillStyle = cg;
    rrect(ctx, 26, y, W - 52, 96, 20);
    ctx.fill();
    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth   = 1;
    rrect(ctx, 26, y, W - 52, 96, 20);
    ctx.stroke();
    ctx.restore();

    // App icon
    ctx.fillStyle = iconColor;
    circle(ctx, 70, y + 44, 22);
    ctx.fill();
    // Icon glyph (simplified)
    ctx.fillStyle   = "#fff";
    ctx.font        = "bold 18px -apple-system, Helvetica, Arial, sans-serif";
    ctx.textAlign   = "center";
    ctx.fillText(iconGlyph, 70, y + 51);

    // App name
    ctx.font        = "700 15px -apple-system, Helvetica, Arial, sans-serif";
    ctx.fillStyle   = "rgba(255,255,255,0.90)";
    ctx.textAlign   = "left";
    ctx.fillText(app, 104, y + 32);

    // Title
    ctx.font      = "400 15px -apple-system, Helvetica, Arial, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.64)";
    ctx.fillText(title, 104, y + 56);

    // Time
    ctx.font        = "400 13px -apple-system, Helvetica, Arial, sans-serif";
    ctx.fillStyle   = "rgba(255,255,255,0.38)";
    ctx.textAlign   = "right";
    ctx.fillText(time, W - 42, y + 32);
  };

  card(295, "#34C759", "✓", "Messages",    "You have a new message",   "now");
  card(405, "#FF3B30", "●", "Calendar",    "Meeting in 49 minutes",    "9:52 AM");
  card(515, "#2196F3", "✉", "Mail",        "2 unread messages",        "9:38 AM");

  // ── Dock ──────────────────────────────────────────────────────────────────
  const dockY = H - 144;
  const dockG = ctx.createLinearGradient(0, dockY, 0, dockY + 112);
  dockG.addColorStop(0, "rgba(255,255,255,0.12)");
  dockG.addColorStop(1, "rgba(255,255,255,0.06)");
  ctx.fillStyle = dockG;
  rrect(ctx, 26, dockY, W - 52, 112, 30);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth   = 1;
  rrect(ctx, 26, dockY, W - 52, 112, 30);
  ctx.stroke();

  // Dock icons
  const dockIcons = ["#34C759", "#0A84FF", "#30D158", "#FF453A"];
  const iconGlyphs = ["📞", "🌐", "💬", "📩"];
  dockIcons.forEach((col, i) => {
    const ix = 60 + i * ((W - 120) / 3);
    const iy = dockY + 24;
    ctx.fillStyle = col;
    rrect(ctx, ix - 28, iy, 56, 56, 14);
    ctx.fill();
    // Highlight on icon
    const hg = ctx.createLinearGradient(ix - 28, iy, ix + 28, iy + 56);
    hg.addColorStop(0,   "rgba(255,255,255,0.30)");
    hg.addColorStop(0.45,"rgba(255,255,255,0)");
    ctx.fillStyle = hg;
    rrect(ctx, ix - 28, iy, 56, 56, 14);
    ctx.fill();
  });

  // ── Home indicator ────────────────────────────────────────────────────────
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  rrect(ctx, W / 2 - 72, H - 18, 144, 7, 3.5);
  ctx.fill();

  return c;
}

// ══════════════════════════════════════════════════════════════════════════════
// 3D COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// ─── Camera module lenses ─────────────────────────────────────────────────────
// Three Pro cameras (main, ultra-wide, telephoto) + flash + LiDAR.
// Cylinders rotated 90° on X to face the Z axis (back of phone).

function CameraModule() {
  // Lens positions relative to module center
  const lenses = [
    { x: -0.104, y:  0.104, label: "main"  },
    { x:  0.104, y:  0.104, label: "ultra" },
    { x: -0.012, y: -0.118, label: "tele"  },
  ];

  const titaniumMat = {
    color:          "#B2B2B2",
    metalness:      0.88,
    roughness:      0.10,
    envMapIntensity:1.6,
  };
  const glassMat = {
    color:          "#050507",
    roughness:      0.02,
    metalness:      0.08,
    transmission:   0.22,
    thickness:      0.05,
    envMapIntensity:1.2,
  };
  const lensInnerMat = {
    color:   "#020204",
    roughness: 0.01,
    metalness: 0.02,
    transmission: 0.70,
    thickness: 0.12,
    envMapIntensity: 2.0,
  };

  return (
    <group position={[CMX, CMY, -PD / 2 - CMT / 2 - 0.001]}>
      {/* Module housing */}
      <RoundedBox args={[CM, CM, CMT]} radius={0.040} smoothness={4}>
        <meshPhysicalMaterial {...titaniumMat} color="#1C1C1E" roughness={0.18} />
      </RoundedBox>

      {/* Three camera lenses */}
      {lenses.map((l) => (
        <group key={l.label} position={[l.x, l.y, CMT / 2]}>
          {/* Outer metallic ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[LROUT, LROUT, LT, 48]} />
            <meshPhysicalMaterial {...titaniumMat} color="#A8A8A8" />
          </mesh>
          {/* Lens glass */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[LR, LR, LT + 0.004, 48]} />
            <meshPhysicalMaterial {...glassMat} />
          </mesh>
          {/* Inner lens element (deep, dark) */}
          <mesh position={[0, 0, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[LR * 0.72, LR * 0.72, 0.008, 48]} />
            <meshPhysicalMaterial {...lensInnerMat} />
          </mesh>
        </group>
      ))}

      {/* Flash (warm LED, top-right of module) */}
      <group position={[0.166, 0.048, CMT / 2 + 0.006]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.020, 0.020, 0.016, 20]} />
          <meshStandardMaterial color="#FFF5E0" emissive="#FFF5E0" emissiveIntensity={0.6} roughness={0.8} />
        </mesh>
      </group>

      {/* LiDAR (smaller circle, below flash) */}
      <group position={[0.166, -0.024, CMT / 2 + 0.004]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, 0.010, 20]} />
          <meshPhysicalMaterial color="#0A0A0C" roughness={0.05} metalness={0.1} transmission={0.5} />
        </mesh>
        {/* LiDAR ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.019, 0.019, 0.008, 20]} />
          <meshPhysicalMaterial color="#888" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Apple logo engraving area (subtle matte inset) */}
      <mesh position={[0.115, -0.150, CMT / 2 + 0.001]}>
        <planeGeometry args={[0.080, 0.090]} />
        <meshStandardMaterial color="#1A1A1C" roughness={0.35} metalness={0.3} />
      </mesh>
    </group>
  );
}

// ─── Side buttons ──────────────────────────────────────────────────────────────
function SideButtons() {
  const btnMat = {
    color:          "#B0B0B0",
    metalness:      0.90,
    roughness:      0.12,
    envMapIntensity:1.4,
  } as const;
  const BW = 0.034; // button protrusion from frame

  return (
    <>
      {/* Right side: Power / side button */}
      <mesh position={[PW / 2 + BW / 2, -0.095, 0]}>
        <boxGeometry args={[BW, 0.255, 0.050]} />
        <meshPhysicalMaterial {...btnMat} />
      </mesh>

      {/* Left side: Action button (short, top) */}
      <mesh position={[-PW / 2 - BW / 2, 0.295, 0]}>
        <boxGeometry args={[BW, 0.130, 0.050]} />
        <meshPhysicalMaterial {...btnMat} />
      </mesh>
      {/* Left side: Volume up */}
      <mesh position={[-PW / 2 - BW / 2, 0.105, 0]}>
        <boxGeometry args={[BW, 0.205, 0.050]} />
        <meshPhysicalMaterial {...btnMat} />
      </mesh>
      {/* Left side: Volume down */}
      <mesh position={[-PW / 2 - BW / 2, -0.140, 0]}>
        <boxGeometry args={[BW, 0.205, 0.050]} />
        <meshPhysicalMaterial {...btnMat} />
      </mesh>
    </>
  );
}

// ─── Full iPhone Model ─────────────────────────────────────────────────────────
function IPhoneModel() {
  const frame = useCurrentFrame();

  // Screen canvas texture — built once, never rebuilt
  const screenTexture = useMemo(() => {
    const canvas = buildScreenCanvas();
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);

  useEffect(() => () => { screenTexture.dispose(); }, [screenTexture]);

  // ── Animation ──────────────────────────────────────────────────────────────
  // f0–30:   dark reveal (back visible)
  // f30–155: epic back → front turn
  // f155–290: front hero with float
  // f290–375: camera tilt and return
  // f375–450: CTA beauty shot

  const TURN_START = 30;
  const TURN_END   = 155;
  const HERO_END   = 290;
  const SWING_S    = 300;
  const SWING_MID  = 338;
  const SWING_E    = 375;

  // Y rotation
  let rotY = 0;
  if (frame < TURN_START) {
    rotY = Math.PI * 0.88;
  } else if (frame < TURN_END) {
    const t = easeInOut3((frame - TURN_START) / (TURN_END - TURN_START));
    rotY = (1 - t) * Math.PI * 0.88;
  } else if (frame < HERO_END) {
    // Slow oscillation while front-facing
    const lf = frame - TURN_END;
    const settle = easeOut4(Math.min(1, lf / 35));
    rotY = Math.sin(lf / 88 * Math.PI) * 0.065 * settle;
  } else if (frame < SWING_S) {
    rotY = 0;
  } else if (frame < SWING_MID) {
    // Tilt to show camera
    const t = easeInOut3((frame - SWING_S) / (SWING_MID - SWING_S));
    rotY = t * (-Math.PI * 0.78);
  } else if (frame < SWING_E) {
    // Return to front
    const t = easeInOut3((frame - SWING_MID) / (SWING_E - SWING_MID));
    rotY = (1 - t) * (-Math.PI * 0.78);
  } else {
    const lf = frame - SWING_E;
    rotY = Math.sin(lf / 90 * Math.PI) * 0.040;
  }

  // X tilt: very subtle breathing tilt for "alive" feel
  const rotX = Math.sin(frame / 95 * Math.PI) * 0.030;

  // Vertical float
  const floatY = Math.sin(frame / 82 * Math.PI) * 0.028;

  // Screen opacity (fades on when phone is turning front-side)
  const screenOpacity = clamp(
    (frame - TURN_END + 12) / 28,
    0, 1,
  );
  // Screen emit intensity (breathes gently once visible)
  const screenEmit = screenOpacity * (0.45 + Math.sin(frame / 110 * Math.PI) * 0.06);

  // Global fade
  const fadeIn  = easeOut3(clamp(frame / 22, 0, 1));
  const fadeOut = 1 - easeOut3(clamp((frame - 430) / 20, 0, 1));
  const opacity = fadeIn * fadeOut;

  if (opacity < 0.01) return null;

  const titaniumMat = {
    color:          "#ABABAB",
    metalness:      0.88,
    roughness:      0.14,
    envMapIntensity:2.0,
    transparent:    true as const,
    opacity,
  };
  const frontGlassMat = {
    color:          "#050506",
    roughness:      0.015,
    metalness:      0.0,
    transmission:   0.08,
    thickness:      0.06,
    envMapIntensity:1.6,
    transparent:    true as const,
    opacity,
  };

  return (
    <group position={[0, floatY, 0]} rotation={[rotX, rotY, 0]}>
      {/* ── Main body — Natural Titanium ──────────────────────────────── */}
      <RoundedBox args={[PW, PH, PD]} radius={CR} smoothness={6}>
        <meshPhysicalMaterial {...titaniumMat} />
      </RoundedBox>

      {/* ── Front face glass (covers most of front, slight reflection) ── */}
      <mesh position={[0, 0, PD / 2 + 0.0008]}>
        <planeGeometry args={[SW, SH]} />
        <meshPhysicalMaterial {...frontGlassMat} />
      </mesh>

      {/* ── Screen texture ────────────────────────────────────────────── */}
      <mesh position={[0, 0, PD / 2 + 0.001]}>
        <planeGeometry args={[SW, SH]} />
        <meshStandardMaterial
          map={screenTexture}
          emissiveMap={screenTexture}
          emissive={new THREE.Color(1, 1, 1)}
          emissiveIntensity={screenEmit}
          roughness={0.04}
          metalness={0}
          transparent
          opacity={screenOpacity * opacity}
        />
      </mesh>

      {/* ── Dynamic Island — front ────────────────────────────────────── */}
      <mesh position={[0, SH / 2 - 0.030, PD / 2 + 0.002]}>
        <planeGeometry args={[0.182, 0.032]} />
        <meshStandardMaterial color="#000" roughness={0.5} transparent opacity={opacity} />
      </mesh>

      {/* ── Screen glow point light (illuminates front face from within) ─ */}
      <pointLight
        position={[0, 0, PD / 2 + 0.15]}
        color="#8B5CF6"
        intensity={screenOpacity * 1.4 * (0.88 + Math.sin(frame / 105 * Math.PI) * 0.12)}
        distance={2.2}
        decay={2}
      />

      {/* ── Back: very subtle Apple logo mark ───────────────────────── */}
      <mesh position={[0.055, -0.10, -PD / 2 - 0.0005]}>
        <planeGeometry args={[0.195, 0.225]} />
        <meshPhysicalMaterial
          color="#A5A5A5"
          metalness={0.95}
          roughness={0.06}
          envMapIntensity={2.8}
          transparent
          opacity={opacity * 0.65}
        />
      </mesh>

      {/* ── Camera module ─────────────────────────────────────────────── */}
      <CameraModule />

      {/* ── Side buttons ─────────────────────────────────────────────── */}
      <SideButtons />

      {/* ── USB-C port (bottom center, subtle) ───────────────────────── */}
      <mesh position={[0, -PH / 2 + 0.001, 0]}>
        <boxGeometry args={[0.088, 0.006, PD * 0.55]} />
        <meshStandardMaterial color="#1A1A1A" roughness={0.7} metalness={0.3} transparent opacity={opacity} />
      </mesh>
      {/* Speaker grilles (left & right of port) */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.210, -PH / 2 + 0.001, 0]}>
          <boxGeometry args={[0.075, 0.005, PD * 0.50]} />
          <meshStandardMaterial color="#1E1E1E" roughness={0.6} metalness={0.4} transparent opacity={opacity} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Product lighting rig ─────────────────────────────────────────────────────
// Key, fill, rim, and animated reveal sweep — professional product photography.
function ProductLighting() {
  const frame = useCurrentFrame();

  // Reveal sweep: bright light sweeps left→right as phone turns (f30–155)
  const sweepX = interpolate(frame, [30, 155], [-2.8, 2.8], {
    extrapolateLeft:  "clamp",
    extrapolateRight: "clamp",
  });
  const sweepIntensity = Math.max(
    0,
    3.2 * (1 - Math.abs(sweepX) / 3.0) + 0.8,
  );

  // Rim light pulses subtly for the hero section
  const rimPulse = 1 + 0.15 * Math.sin(frame / 90 * Math.PI);

  return (
    <>
      {/* Key light — warm, upper right, slightly front */}
      <pointLight position={[1.8, 2.2, 2.8]} color="#FFF8F0" intensity={5.5} distance={9} decay={1.5} />

      {/* Fill light — cool, left, lower */}
      <pointLight position={[-2.5, 0.4, 1.8]} color="#EEF4FF" intensity={2.0} distance={8} decay={2} />

      {/* Rim light — from behind, creates titanium edge highlights */}
      <pointLight position={[0.5, 0.8, -3.2]} color="#FFFFFF" intensity={4.0 * rimPulse} distance={7} decay={1.8} />
      <pointLight position={[-0.8, -0.5, -2.8]} color="#F0F4FF" intensity={2.8} distance={6} decay={2} />

      {/* Reveal sweep light */}
      <pointLight position={[sweepX, 1.5, 2.2]} color="#FFFFFF" intensity={sweepIntensity} distance={5} decay={2} />

      {/* Camera module accent (warms up when back is visible) */}
      <pointLight position={[CMX, CMY, -PD / 2 - 0.5]} color="#F97316" intensity={0.8} distance={2.5} decay={2} />
    </>
  );
}

// ─── Ambient dust particles ───────────────────────────────────────────────────
// 350 tiny bokeh particles — adds depth and cinematic quality.
function DustParticles() {
  const frame  = useCurrentFrame();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy  = useRef(new THREE.Object3D());
  const COUNT  = 350;

  const sr = (s: number) => ((s * 1.6180339887) % 1 + 1) % 1;

  const particles = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    x:     (sr(i * 7)  - 0.5) * 4.2,
    y:     (sr(i * 11) - 0.5) * 4.8,
    z:     (sr(i * 13) - 0.5) * 2.5,
    size:  0.004 + sr(i * 17) * 0.012,
    speed: 0.0006 + sr(i * 19) * 0.0008,
    phase: sr(i * 23)  * Math.PI * 2,
    drift: (sr(i * 29) - 0.5) * 0.0004,
  })), []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    particles.forEach((p, i) => {
      const t       = frame * p.speed + p.phase;
      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(t));
      dummy.current.position.set(
        p.x + Math.sin(t * 1.3) * 0.08,
        p.y + Math.cos(t * 0.9) * 0.06,
        p.z,
      );
      dummy.current.scale.setScalar(p.size * twinkle);
      dummy.current.updateMatrix();
      mesh.setMatrixAt(i, dummy.current.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 5, 5]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.22} depthWrite={false} />
    </instancedMesh>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// CSS TEXT PHASES
// Apple-style: minimal, large, white, generous negative space.
// Text sits in the lower third so it doesn't compete with the phone.
// ══════════════════════════════════════════════════════════════════════════════

interface TextPhaseProps {
  totalFrames: number;
}

// Phase 1 (f50–125): "Titanium." — back still visible
const TextTitanium: React.FC<TextPhaseProps> = ({ totalFrames }) => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(totalFrames, 14);
  const h1      = useCinematicTextReveal(0,  18, 8);
  const s1      = useCinematicTextReveal(12, 14, 6);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 88 }}>
        <div style={{ height: 1.5, width: 48, background: `linear-gradient(90deg, #888, transparent)`, marginBottom: 18 }} />
        <div style={{ fontSize: 68, fontWeight: 900, fontFamily: SANS, color: TEXT, letterSpacing: -3, lineHeight: 0.9, opacity: h1.opacity, transform: `translateY(${h1.translateY}px)`, filter: `blur(${h1.blur}px)` }}>
          Titanium.
        </div>
        <div style={{ fontSize: 16, color: BODY, fontFamily: SANS, marginTop: 12, opacity: s1.opacity, transform: `translateY(${s1.translateY}px)` }}>
          Aerospace-grade. Incredibly light.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Phase 2 (f155–270): "iPhone 17 Pro." — front hero
const TextHero: React.FC<TextPhaseProps> = ({ totalFrames }) => {
  const fadeOut = usePremiumFadeOut(totalFrames, 16);
  const h1      = useCinematicTextReveal(0,  20, 10);
  const h2      = useCinematicTextReveal(10, 20, 10);
  const s1      = useCinematicTextReveal(22, 14, 6);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 88 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { text: "iPhone 17", t: h1, size: 60, color: TEXT },
            { text: "Pro.",      t: h2, size: 60, color: TEXT },
          ].map((item, i) => (
            <div key={i} style={{ fontSize: item.size, fontWeight: 900, fontFamily: SANS, color: item.color, letterSpacing: -2.8, lineHeight: 1.0, opacity: item.t.opacity, transform: `translateY(${item.t.translateY}px)`, filter: `blur(${item.t.blur}px)` }}>
              {item.text}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 15, color: BODY, fontFamily: SANS, marginTop: 12, opacity: s1.opacity, transform: `translateY(${s1.translateY}px)` }}>
          The most powerful iPhone ever made.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Phase 3 (f295–370): "Pro camera." — camera close-up
const TextCamera: React.FC<TextPhaseProps> = ({ totalFrames }) => {
  const fadeOut = usePremiumFadeOut(totalFrames, 14);
  const h1      = useCinematicTextReveal(0,  18, 8);
  const h2      = useCinematicTextReveal(10, 16, 7);
  const s1      = useCinematicTextReveal(20, 12, 5);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 88 }}>
        <div style={{ fontSize: 62, fontWeight: 900, fontFamily: SANS, color: TEXT, letterSpacing: -2.5, lineHeight: 0.92, opacity: h1.opacity, transform: `translateY(${h1.translateY}px)`, filter: `blur(${h1.blur}px)` }}>
          Pro camera.
        </div>
        <div style={{ fontSize: 62, fontWeight: 900, fontFamily: SANS, color: `${TEXT}55`, letterSpacing: -2.5, lineHeight: 0.92, marginTop: 2, opacity: h2.opacity, transform: `translateY(${h2.translateY}px)`, filter: `blur(${h2.blur}px)` }}>
          Pure clarity.
        </div>
        <div style={{ fontSize: 15, color: BODY, fontFamily: SANS, marginTop: 14, opacity: s1.opacity, transform: `translateY(${s1.translateY}px)` }}>
          48 MP Fusion · 5× Optical Zoom · LiDAR Scanner
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Phase 4 (f378–445): Final CTA
const TextCTA: React.FC<TextPhaseProps> = ({ totalFrames }) => {
  const fadeOut = usePremiumFadeOut(totalFrames, 18);
  const h1      = useCinematicTextReveal(0,  20, 9);
  const h2      = useCinematicTextReveal(10, 18, 8);
  const s1      = useCinematicTextReveal(22, 14, 6);
  const s2      = useCinematicTextReveal(30, 12, 5);
  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", left: 72, right: 72, bottom: 88 }}>
        <div style={{ fontSize: 52, fontWeight: 900, fontFamily: SANS, color: TEXT, letterSpacing: -2, lineHeight: 1.0, opacity: h1.opacity, transform: `translateY(${h1.translateY}px)`, filter: `blur(${h1.blur}px)` }}>
          The most personal
        </div>
        <div style={{ fontSize: 52, fontWeight: 900, fontFamily: SANS, color: TEXT, letterSpacing: -2, lineHeight: 1.0, opacity: h2.opacity, transform: `translateY(${h2.translateY}px)`, filter: `blur(${h2.blur}px)` }}>
          device. Ever made.
        </div>
        <div style={{ height: 1.5, width: 0, background: "none", marginTop: 14, marginBottom: 6 }} />
        <div style={{ fontSize: 15, color: BODY, fontFamily: SANS, opacity: s1.opacity, transform: `translateY(${s1.translateY}px)` }}>
          From $999 — Apple.com
        </div>
        <div style={{ fontSize: 12, color: `${BODY}66`, fontFamily: SANS, marginTop: 5, opacity: s2.opacity, transform: `translateY(${s2.translateY}px)` }}>
          Available now in Natural, Black, Desert, and White Titanium.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// ROOT EXPORT
// ══════════════════════════════════════════════════════════════════════════════

export const IPhoneAd: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Subtle CSS camera dolly — very slow inward drift
  const zoom  = 1.0 + (frame / 450) * 0.055;
  const panX  = interpolate(frame, [0, 450], [5, -4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY  = interpolate(frame, [0, 450], [3, -2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Background: deep space gradient, shifts slightly between phases
  const bgPhase = clamp((frame - 155) / 80, 0, 1); // 0 = back (dark), 1 = front (richer)
  const bgRed   = Math.round(7  + bgPhase * 4);
  const bgGreen = Math.round(6  + bgPhase * 3);
  const bgBlue  = Math.round(10 + bgPhase * 8);

  return (
    <AbsoluteFill style={{ background: `rgb(${bgRed},${bgGreen},${bgBlue})` }}>
      {/* Ambient depth gradient — purple-blue tint that matches screen aurora */}
      <div
        style={{
          position:   "absolute",
          inset:      0,
          background: `radial-gradient(ellipse 900px 900px at 50% 42%, rgba(109,40,217,${0.04 + bgPhase * 0.06}) 0%, rgba(37,99,235,${0.03 + bgPhase * 0.04}) 45%, transparent 70%)`,
        }}
      />

      <div
        style={{
          position:        "absolute",
          inset:           0,
          transform:       `scale(${zoom}) translateX(${panX}px) translateY(${panY}px)`,
          transformOrigin: "center center",
        }}
      >
        {/* ── ThreeScene — single persistent canvas ─────────────────────── */}
        <ThreeScene
          enableBloom
          bloomIntensity={0.95}
          bloomThreshold={0.30}
          bloomSmoothing={0.85}
          environment="studio"
          ambientIntensity={0.06}
          cameraZ={5}
          fov={36}
        >
          <ProductLighting />
          <IPhoneModel />
          <DustParticles />
        </ThreeScene>

        {/* ── CSS text overlay — always on top (DOM order) ──────────────── */}
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          {/* Phase 1: "Titanium." */}
          {frame >= 50 && frame < 130 && (
            <TextTitanium totalFrames={80} />
          )}
          {/* Phase 2: "iPhone 17 Pro." */}
          {frame >= 155 && frame < 278 && (
            <TextHero totalFrames={123} />
          )}
          {/* Phase 3: "Pro camera." */}
          {frame >= 295 && frame < 378 && (
            <TextCamera totalFrames={83} />
          )}
          {/* Phase 4: CTA */}
          {frame >= 378 && frame < 450 && (
            <TextCTA totalFrames={72} />
          )}

          {/* Wordmark — top right, always present */}
          <div
            style={{
              position:      "absolute",
              top:           46,
              right:         68,
              fontSize:      11,
              fontWeight:    700,
              color:         `rgba(250,250,249,0.28)`,
              fontFamily:    MONO,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              opacity:       easeOut3(clamp(frame / 25, 0, 1)),
            }}
          >
            iPhone 17 Pro
          </div>
        </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};
