/**
 * AnimDrillAd — Single-technique animation test bench.
 *
 * A short sandbox for practicing one animation technique at a time.
 * Swap the active drill scene to test different techniques in isolation.
 *
 * Format:   16:9 4K (3840 x 2160)
 * Duration: 150 frames @ 30fps = 5 seconds
 */

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  spring,
  useVideoConfig,
  interpolate,
} from "remotion";

const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;
const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;

const C = {
  bg: "#0F172A",
  surface: "#1E293B",
  accent: "#6366F1",
  text: "#F1F5F9",
  textDim: "#94A3B8",
  green: "#22C55E",
  amber: "#F59E0B",
  rose: "#F43F5E",
  cyan: "#06B6D4",
};

// ---------------------------------------------------------------------------
// Drill: Spring Entrance Comparison
// Shows 5 boxes entering with different spring configs side by side
// so you can directly compare the feel of different physics.
// ---------------------------------------------------------------------------
const DrillSpringCompare: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const configs = [
    { label: "Stiff & Snappy",  cfg: { stiffness: 260, damping: 20, mass: 0.5 }, color: C.accent },
    { label: "Bouncy",          cfg: { stiffness: 120, damping: 10, mass: 0.8 }, color: C.green },
    { label: "Heavy & Slow",    cfg: { stiffness: 40,  damping: 14, mass: 1.4 }, color: C.amber },
    { label: "Critically Damped", cfg: { stiffness: 180, damping: 26, mass: 0.9 }, color: C.cyan },
    { label: "Wild Overshoot",  cfg: { stiffness: 200, damping: 8,  mass: 0.6 }, color: C.rose },
  ];

  const boxW = 480;
  const boxH = 600;
  const gap = 80;
  const totalW = configs.length * boxW + (configs.length - 1) * gap;
  const startX = (W - totalW) / 2;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 140,
        textAlign: "center", fontFamily: FONT, fontSize: 72,
        fontWeight: 700, color: C.text, letterSpacing: -2,
      }}>
        Spring Entrance Comparison
      </div>

      {configs.map((item, i) => {
        const delay = 20 + i * 6;
        const p = spring({ frame: Math.max(0, frame - delay), fps, config: item.cfg });

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: startX + i * (boxW + gap),
              top: CY - boxH / 2 + 60,
              width: boxW,
              height: boxH,
              borderRadius: 32,
              background: C.surface,
              border: `3px solid ${item.color}40`,
              boxShadow: `0 0 40px ${item.color}20`,
              opacity: p,
              transform: `translateY(${(1 - p) * 200}px) scale(${0.85 + p * 0.15})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 32,
            }}
          >
            <div style={{
              width: 120, height: 120, borderRadius: 28,
              background: item.color,
              transform: `scale(${0.5 + p * 0.5}) rotate(${(1 - p) * 45}deg)`,
            }} />
            <div style={{
              fontFamily: FONT, fontSize: 32, fontWeight: 600,
              color: C.text, textAlign: "center", padding: "0 24px",
            }}>
              {item.label}
            </div>
            <div style={{
              fontFamily: FONT, fontSize: 22, color: C.textDim,
              textAlign: "center", lineHeight: 1.5, padding: "0 24px",
            }}>
              S:{item.cfg.stiffness} D:{item.cfg.damping} M:{item.cfg.mass}
            </div>
          </div>
        );
      })}

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 100,
        textAlign: "center", fontFamily: FONT, fontSize: 36,
        color: C.textDim, letterSpacing: 1,
      }}>
        {`frame ${frame} / 150`}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Drill: Stagger Patterns
// Same elements, different stagger approaches to compare visual rhythm.
// ---------------------------------------------------------------------------
const DrillStaggerPatterns: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cfg = { stiffness: 160, damping: 18, mass: 0.8 };

  const patterns = [
    { label: "Linear (i*8)", getDelay: (i: number) => 15 + i * 8 },
    { label: "Accelerating", getDelay: (i: number) => 15 + i * i * 2 },
    { label: "Decelerating", getDelay: (i: number) => 15 + Math.sqrt(i) * 14 },
    { label: "Center-out",   getDelay: (i: number) => 15 + Math.abs(i - 3) * 10 },
  ];

  const rowH = 400;
  const startY = 320;
  const itemW = 200;
  const itemH = 200;
  const itemGap = 40;
  const count = 7;
  const rowW = count * itemW + (count - 1) * itemGap;
  const rowStartX = (W - rowW) / 2;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 100,
        textAlign: "center", fontFamily: FONT, fontSize: 72,
        fontWeight: 700, color: C.text, letterSpacing: -2,
      }}>
        Stagger Patterns
      </div>

      {patterns.map((pat, pi) => (
        <div key={pi}>
          <div style={{
            position: "absolute",
            left: 120, top: startY + pi * rowH + 70,
            fontFamily: FONT, fontSize: 30, fontWeight: 600,
            color: C.textDim, width: 300,
          }}>
            {pat.label}
          </div>
          {Array.from({ length: count }, (_, i) => {
            const delay = pat.getDelay(i);
            const p = spring({ frame: Math.max(0, frame - delay), fps, config: cfg });
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: rowStartX + i * (itemW + itemGap),
                  top: startY + pi * rowH,
                  width: itemW, height: itemH,
                  borderRadius: 20,
                  background: C.surface,
                  border: `2px solid ${C.accent}30`,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 80}px) scale(${0.8 + p * 0.2})`,
                }}
              />
            );
          })}
        </div>
      ))}

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 80,
        textAlign: "center", fontFamily: FONT, fontSize: 36,
        color: C.textDim,
      }}>
        {`frame ${frame} / 150`}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Drill: Transform Origin Study
// Same scale animation but different transform origins to show the impact.
// ---------------------------------------------------------------------------
const DrillTransformOrigin: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const origins = [
    { label: "center center", origin: "center center" },
    { label: "bottom center", origin: "bottom center" },
    { label: "top left", origin: "top left" },
    { label: "center right", origin: "center right" },
    { label: "50% 80%", origin: "50% 80%" },
  ];

  const cfg = { stiffness: 100, damping: 14, mass: 0.7 };
  const p = spring({ frame: Math.max(0, frame - 20), fps, config: cfg });

  const boxW = 500;
  const boxH = 500;
  const gap = 80;
  const totalW = origins.length * boxW + (origins.length - 1) * gap;
  const startX = (W - totalW) / 2;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: 120,
        textAlign: "center", fontFamily: FONT, fontSize: 72,
        fontWeight: 700, color: C.text, letterSpacing: -2,
      }}>
        Transform Origin Study
      </div>

      {origins.map((item, i) => (
        <div key={i} style={{
          position: "absolute",
          left: startX + i * (boxW + gap),
          top: CY - boxH / 2 + 80,
          width: boxW, height: boxH,
        }}>
          <div style={{
            width: "100%", height: "100%",
            borderRadius: 28,
            background: `linear-gradient(135deg, ${C.accent}, ${C.cyan})`,
            transform: `scale(${0.3 + p * 0.7})`,
            transformOrigin: item.origin,
            opacity: 0.3 + p * 0.7,
          }}>
            <div style={{
              position: "absolute",
              left: item.origin.includes("left") ? 16 : item.origin.includes("right") ? undefined : "50%",
              right: item.origin.includes("right") ? 16 : undefined,
              top: item.origin.includes("top") ? 16 : item.origin.includes("bottom") ? undefined : "50%",
              bottom: item.origin.includes("bottom") ? 16 : undefined,
              transform: item.origin.includes("center") && !item.origin.includes("left") && !item.origin.includes("right")
                ? "translate(-50%, -50%)" : undefined,
              width: 16, height: 16, borderRadius: 8,
              background: C.rose,
              boxShadow: `0 0 12px ${C.rose}`,
            }} />
          </div>
          <div style={{
            textAlign: "center", marginTop: 20,
            fontFamily: FONT, fontSize: 28, fontWeight: 600, color: C.textDim,
          }}>
            {item.label}
          </div>
        </div>
      ))}

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 80,
        textAlign: "center", fontFamily: FONT, fontSize: 36, color: C.textDim,
      }}>
        {`frame ${frame} / 150`}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Drill: Empty Canvas (for free-form practice)
// ---------------------------------------------------------------------------
const DrillFreeform: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: "absolute", left: 0, right: 0, top: CY - 80,
        textAlign: "center", fontFamily: FONT, fontSize: 64,
        fontWeight: 600, color: C.textDim,
      }}>
        Freeform Drill Canvas
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, top: CY + 20,
        textAlign: "center", fontFamily: FONT, fontSize: 36,
        color: `${C.textDim}80`,
      }}>
        Replace this scene with the technique under practice
      </div>
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 80,
        textAlign: "center", fontFamily: FONT, fontSize: 36, color: C.textDim,
      }}>
        {`frame ${frame} / 150`}
      </div>
    </AbsoluteFill>
  );
};

// ===========================================================================
// MAIN — Swap the active drill here
// ===========================================================================

// Change this to the drill you want to practice:
//   DrillSpringCompare    — compare 5 spring configs side by side
//   DrillStaggerPatterns  — compare stagger timing approaches
//   DrillTransformOrigin  — see how transform-origin changes scale animations
//   DrillFreeform         — empty canvas for ad-hoc practice
const ActiveDrill = DrillSpringCompare;

export const AnimDrillAd: React.FC = () => <ActiveDrill />;
