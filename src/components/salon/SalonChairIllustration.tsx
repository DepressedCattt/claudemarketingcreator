/**
 * SalonChairIllustration — Premium vector salon chair.
 *
 * Redesigned to match the brand reference: dark navy body, electric blue
 * outlines, tufted quilted backrest, circular disc base, two locking-ring
 * details at the seat front, curved armrests, and a hydraulic adjustment lever.
 *
 * Animation systems:
 *  - Spring entrance (rises from blur)
 *  - Continuous float hover (sine-wave)
 *  - Shadow breath (pulsing drop shadow)
 *  - Blue glow ring (animated radial)
 *  - Muted mode (grayscale filter for "before/unused" state)
 *  - Unique SVG def IDs via `instanceId` to avoid gradient conflicts
 */

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

interface SalonChairIllustrationProps {
  scale?: number;
  startFrame?: number;
  showGlow?: boolean;
  glowColor?: string;
  muted?: boolean;
  outlineMode?: boolean;
  instanceId?: string;
  float?: boolean;
}

// Tuft button positions: intersections of horizontal/vertical grid lines
const TUFT_INTERSECTIONS = [
  [112, 112], [150, 112], [188, 112],
  [112, 148], [150, 148], [188, 148],
  [112, 184], [150, 184], [188, 184],
  [112, 218], [150, 218], [188, 218],
];

export const SalonChairIllustration: React.FC<SalonChairIllustrationProps> = ({
  scale = 1,
  startFrame = 0,
  showGlow = true,
  glowColor = "#2563EB",
  muted = false,
  outlineMode = false,
  instanceId = "a",
  float = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Entrance spring ──────────────────────────────────────────────────────
  const entryProgress = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 70, mass: 1.1 },
    from: 0, to: 1,
  });
  const entryY = interpolate(entryProgress, [0, 1], [55, 0]);
  const entryOpacity = interpolate(entryProgress, [0, 0.25], [0, 1], {
    extrapolateRight: "clamp",
  });

  // ── Float loop ─────────────────────────────────────────────────────────
  const floatAmp = float ? 9 : 0;
  const floatY = Math.sin((frame - startFrame) * 0.036) * floatAmp;

  // ── Shadow and glow pulse ──────────────────────────────────────────────
  const pulse = Math.sin((frame - startFrame) * 0.04);
  const shadowScaleX = 1 + pulse * 0.045;
  const shadowOpacity = muted ? 0.07 : 0.18 + pulse * 0.05;
  const glowOpacity = !muted && showGlow ? 0.32 + pulse * 0.12 : 0;

  const cssFilter = outlineMode
    ? "drop-shadow(0 0 5px #2563EB) drop-shadow(0 0 16px rgba(37,99,235,0.45))"
    : muted
    ? "saturate(0) brightness(0.55)"
    : "none";
  const id = instanceId;

  // Outline mode fill helpers — transparent fills, keep strokes for wireframe look
  const bgFill   = outlineMode ? "transparent" : "#0D1525";
  const darkFill = outlineMode ? "transparent" : "#1A2A40";
  const gradCol  = outlineMode ? "transparent" : `url(#col-${id})`;
  const gradSeat = outlineMode ? "transparent" : `url(#seat-top-${id})`;

  return (
    <div
      style={{
        position: "relative",
        width: 300,
        height: 400,
        opacity: entryOpacity,
        transform: `translateY(${entryY + floatY}px) scale(${scale})`,
        filter: cssFilter,
        flexShrink: 0,
      }}
    >
      {/* ── Blue glow ───────────────────────────────────────────────────── */}
      {!muted && showGlow && (
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: "50%",
            transform: "translateX(-50%)",
            width: 240,
            height: 210,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 68%)`,
            opacity: glowOpacity,
            filter: "blur(28px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
      )}

      {/* ── Drop shadow ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: "50%",
          transform: `translateX(-50%) scaleX(${shadowScaleX})`,
          width: 160,
          height: 20,
          borderRadius: "50%",
          background: `rgba(11,23,48,${shadowOpacity})`,
          filter: "blur(14px)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── Chair SVG ───────────────────────────────────────────────────── */}
      <svg
        width="300"
        height="390"
        viewBox="0 0 300 390"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "relative", zIndex: 1 }}
      >
        <defs>
          <linearGradient id={`col-${id}`} x1="128" y1="0" x2="172" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#2563EB" stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`seat-top-${id}`} x1="50" y1="255" x2="250" y2="255" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.15" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* ── Disc base ────────────────────────────────────────────────── */}
        <ellipse cx="150" cy="374" rx="122" ry="16" fill={bgFill} stroke="#2563EB" strokeWidth="3" />
        {/* Base inner detail ring */}
        <ellipse cx="150" cy="374" rx="78" ry="10" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.4" />
        {/* Base highlight gloss */}
        <ellipse cx="120" cy="370" rx="44" ry="5" fill="#2563EB" opacity="0.1" />

        {/* ── Hydraulic column ─────────────────────────────────────────── */}
        <rect x="128" y="298" width="44" height="78" rx="7" fill={bgFill} stroke="#2563EB" strokeWidth="2.5" />
        {/* Column chrome highlight */}
        <rect x="131" y="300" width="12" height="74" rx="4" fill={gradCol} />

        {/* ── Seat cushion ─────────────────────────────────────────────── */}
        <rect x="46" y="258" width="208" height="50" rx="20" fill={bgFill} stroke="#2563EB" strokeWidth="2.5" />
        {/* Seat surface highlight */}
        <rect x="58" y="264" width="96" height="14" rx="7" fill={gradSeat} />

        {/* ── Two circular locking-ring details (seat front) ────────────── */}
        {/* Left ring */}
        <circle cx="100" cy="303" r="18" fill={bgFill} stroke="#2563EB" strokeWidth="2.5" />
        <circle cx="100" cy="303" r="11" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.55" />
        <circle cx="100" cy="303" r="4.5" fill="#2563EB" opacity="0.45" />
        {/* Right ring */}
        <circle cx="200" cy="303" r="18" fill={bgFill} stroke="#2563EB" strokeWidth="2.5" />
        <circle cx="200" cy="303" r="11" fill="none" stroke="#2563EB" strokeWidth="1.5" opacity="0.55" />
        <circle cx="200" cy="303" r="4.5" fill="#2563EB" opacity="0.45" />

        {/* ── Left armrest ─────────────────────────────────────────────── */}
        {/* Body */}
        <path
          d="M 55 270 Q 38 248 42 215 Q 44 190 58 180 L 74 180 Q 60 190 58 215 Q 54 246 70 270 Z"
          fill={bgFill}
          stroke="#2563EB"
          strokeWidth="2"
        />
        {/* Arm cap */}
        <rect x="32" y="167" width="52" height="19" rx="9.5" fill={bgFill} stroke="#2563EB" strokeWidth="2" />
        {/* Cap highlight */}
        <rect x="38" y="171" width="24" height="8" rx="4" fill="#2563EB" opacity="0.12" />

        {/* ── Right armrest ─────────────────────────────────────────────── */}
        {/* Body */}
        <path
          d="M 245 270 Q 262 248 258 215 Q 256 190 242 180 L 226 180 Q 240 190 242 215 Q 246 246 230 270 Z"
          fill={bgFill}
          stroke="#2563EB"
          strokeWidth="2"
        />
        {/* Arm cap */}
        <rect x="216" y="167" width="52" height="19" rx="9.5" fill={bgFill} stroke="#2563EB" strokeWidth="2" />
        {/* Cap highlight */}
        <rect x="222" y="171" width="24" height="8" rx="4" fill="#2563EB" opacity="0.12" />

        {/* ── Hydraulic adjustment lever (right side) ───────────────────── */}
        <path
          d="M 258 258 L 284 250 Q 296 248 294 263 L 280 270 Q 278 280 266 276"
          fill="none"
          stroke="#2563EB"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Lever base pivot */}
        <circle cx="258" cy="258" r="6" fill="#2563EB" />
        {/* Lever grip knob */}
        <circle cx="290" cy="256" r="5" fill={bgFill} stroke="#2563EB" strokeWidth="2" />

        {/* ── Backrest body ─────────────────────────────────────────────── */}
        <rect x="68" y="68" width="164" height="198" rx="24" fill={bgFill} stroke="#2563EB" strokeWidth="2.5" />

        {/* ── Tufted quilted grid on backrest ──────────────────────────── */}
        {/* Horizontal stitch lines */}
        <line x1="86" y1="112" x2="214" y2="112" stroke={outlineMode ? "#2563EB" : "#1E3460"} strokeWidth="1.8" strokeLinecap="round" opacity={outlineMode ? 0.5 : 1} />
        <line x1="86" y1="148" x2="214" y2="148" stroke={outlineMode ? "#2563EB" : "#1E3460"} strokeWidth="1.8" strokeLinecap="round" opacity={outlineMode ? 0.5 : 1} />
        <line x1="86" y1="184" x2="214" y2="184" stroke={outlineMode ? "#2563EB" : "#1E3460"} strokeWidth="1.8" strokeLinecap="round" opacity={outlineMode ? 0.5 : 1} />
        <line x1="86" y1="218" x2="214" y2="218" stroke={outlineMode ? "#2563EB" : "#1E3460"} strokeWidth="1.8" strokeLinecap="round" opacity={outlineMode ? 0.5 : 1} />
        {/* Vertical stitch lines */}
        <line x1="112" y1="82" x2="112" y2="258" stroke={outlineMode ? "#2563EB" : "#1E3460"} strokeWidth="1.8" strokeLinecap="round" opacity={outlineMode ? 0.5 : 1} />
        <line x1="150" y1="82" x2="150" y2="258" stroke={outlineMode ? "#2563EB" : "#1E3460"} strokeWidth="1.8" strokeLinecap="round" opacity={outlineMode ? 0.5 : 1} />
        <line x1="188" y1="82" x2="188" y2="258" stroke={outlineMode ? "#2563EB" : "#1E3460"} strokeWidth="1.8" strokeLinecap="round" opacity={outlineMode ? 0.5 : 1} />
        {/* Tuft buttons at grid intersections */}
        {TUFT_INTERSECTIONS.map(([tx, ty]) => (
          <circle key={`${tx}-${ty}`} cx={tx} cy={ty} r={3} fill="#2563EB" opacity={outlineMode ? 0.8 : 0.5} />
        ))}

        {/* ── Backrest top highlight ────────────────────────────────────── */}
        <rect x="78" y="76" width="84" height="18" rx="8" fill="#2563EB" opacity="0.1" />

        {/* ── Brand accent stripe across bottom of backrest ─────────────── */}
        <rect x="68" y="246" width="164" height="5" rx="2.5" fill="#2563EB" opacity={muted ? 0.2 : 0.65} />

        {/* ── Backrest–seat connector ───────────────────────────────────── */}
        <rect x="118" y="258" width="64" height="14" rx="5" fill={darkFill} stroke="#2563EB" strokeWidth="1.5" />

        {/* ── Headrest ──────────────────────────────────────────────────── */}
        <rect x="84" y="20" width="132" height="58" rx="20" fill={bgFill} stroke="#2563EB" strokeWidth="2.5" />
        {/* Headrest highlight */}
        <rect x="94" y="28" width="72" height="16" rx="8" fill="#2563EB" opacity="0.1" />
        {/* Horizontal stitch line on headrest */}
        <line x1="96" y1="50" x2="204" y2="50" stroke={outlineMode ? "#2563EB" : "#1E3460"} strokeWidth="1.5" strokeLinecap="round" opacity={outlineMode ? 0.5 : 1} />

        {/* ── Headrest–backrest neck ─────────────────────────────────────── */}
        <rect x="118" y="68" width="64" height="12" rx="4" fill={darkFill} stroke="#2563EB" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
