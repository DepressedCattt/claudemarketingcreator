/**
 * PulseAd — "Find your rhythm."
 *
 * A 120 BPM-structured ad where every scene cut, text reveal, and object
 * impact lands on a beat. The visual language mirrors the product concept:
 * rhythm, flow, pulse.
 *
 * Format:  1:1 square (1080 × 1080)
 * Duration: 480 frames @ 30fps = 16 seconds
 * BPM:     120 (1 beat = 15 frames, 1 bar = 60 frames)
 *
 * Beat grid — all HARD SYNC points:
 *   f0:   PULSE title enters (bar 1 beat 1)
 *   f15:  Badge enters (bar 1 beat 2)
 *   f30:  Sub copy enters (bar 1 beat 3)
 *   f45:  Accent rule wipes (bar 1 beat 4)
 *   f60:  Waveform reveals (bar 2 beat 1)
 *   f120: Scene cut → Focus card arc entry (bar 3 beat 1)
 *   f150: Context copy enters (bar 3 beat 3)
 *   f240: Scene cut → Feature 1 (bar 5 beat 1)
 *   f255: Feature 2 (bar 5 beat 2)
 *   f270: Feature 3 (bar 5 beat 3)
 *   f300: Features headline (bar 6 beat 1)
 *   f360: Scene cut → Stat 1 builds (bar 7 beat 1)
 *   f375: Stat 2 builds (bar 7 beat 2)
 *   f390: Stat 3 builds (bar 7 beat 3)
 *   f420: Scene cut → CTA dark shift (bar 8 beat 1)
 *   f435: CTA headline (bar 8 beat 2)
 *   f450: Sub + button (bar 8 beat 3)
 *
 * All learnings applied:
 *  ◆ Camera motion wrapper (6.2% linear zoom + roll + pan over full duration)
 *  ◆ Dark premium background — depth for free
 *  ◆ useCinematicTextReveal on all text entrances
 *  ◆ useArcEntry (bottom-left) + useBlurResolve (rack focus) on hero card
 *  ◆ Directional 3D rotation (not oscillation) — card born moving
 *  ◆ Prism rim technique — simulated card thickness via rim + computed shadow
 *  ◆ depthDeemphasis for hero card in features scene
 *  ◆ usePremiumFadeOut on every scene
 *  ◆ Flex-row metric layout (each metric owns exactly 360px)
 *  ◆ useBreathingGlow on all ambient glows
 *  ◆ Burst-then-calm: card enter → hold → de-emphasise → features land
 *  ◆ Text arrives last (card fully settled before copy appears)
 *  ◆ Beat-synced waveform that visually establishes 120 BPM
 *  ◆ BPM displayed in hero card (120 BPM focus score)
 *  ◆ Pre-motion: spread begins before new element appears
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CueEvent } from "../utils/cueTypes";
import {
  clamp,
  easeOut3,
  easeOut4,
  easeOut5,
  easeInOut3,
  PREMIUM_SPRING,
  rawProgress,
  useCinematicTextReveal,
  useBlurResolve,
  useArcEntry,
  useHeroFloatDelayed,
  depthDeemphasis,
  useSoftScaleIn,
  usePremiumWipe,
  useBreathingGlow,
  usePremiumFadeOut,
} from "../utils/premiumMotion";

// ─── Design Tokens ────────────────────────────────────────────────────────────

const C = {
  bg:      "#080B14",   // Deep near-black with blue tint
  surface: "#11102A",   // Dark card surface
  accent:  "#7C6BFF",   // Violet — distinctive, not generic indigo
  accent2: "#E879F9",   // Fuchsia — energy, secondary
  text:    "#F0EEFF",   // Near-white with violet cast
  body:    "#8B82B8",   // Muted violet-gray
  border:  "#1E1C3A",   // Subtle dark border
  green:   "#34D399",   // Emerald — focus/success
  white:   "#FFFFFF",
} as const;

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── BPM Constants ────────────────────────────────────────────────────────────
// 120 BPM @ 30fps: 1 beat = 15 frames, 1 bar (4 beats) = 60 frames

const BPM  = 120;
const BEAT = 15;   // frames per beat
// const BAR  = 60;   // frames per bar (4 beats) — reserved for documentation

/** Triangle-wave spike at every beat boundary. Returns 0–1. */
function beatPulse(frame: number): number {
  const phase = frame % BEAT;
  return phase < 6 ? Math.sin((phase / 6) * Math.PI) : 0;
}

// ─── Prism Rim Technique ─────────────────────────────────────────────────────
// Simulates physical card thickness without CSS preserve-3d
// (which breaks when filter: blur is applied on parent elements).

const CARD_RIM    = 5;
const DEPTH_MULT  = 18;
const CARD_RADIUS = 20;

function prismEdgeShadow(rotYDeg: number, rotXDeg: number, accent: string): string {
  const sx = -Math.sin((rotYDeg * Math.PI) / 180) * DEPTH_MULT;
  const sy = -Math.sin((rotXDeg * Math.PI) / 180) * DEPTH_MULT;
  return (
    `${sx.toFixed(1)}px ${sy.toFixed(1)}px 0px 0px ${accent}CC, ` +
    `${(sx * 1.8).toFixed(1)}px ${(sy * 1.8).toFixed(1)}px 3px -1px ${accent}44`
  );
}

// ─── Focus Card (Hero UI Component) ──────────────────────────────────────────

interface FocusCardProps {
  rotY?:  number;
  rotX?:  number;
  scale?: number;
}

const FocusCard: React.FC<FocusCardProps> = ({ rotY = 0, rotX = 0, scale = 1 }) => {
  const S = scale;
  return (
    // Rim wrapper — creates prism depth effect
    <div
      style={{
        padding: CARD_RIM * S,
        background: `linear-gradient(150deg, ${C.accent}FF, ${C.accent2}99)`,
        borderRadius: (CARD_RADIUS + CARD_RIM) * S,
        boxShadow: prismEdgeShadow(rotY, rotX, C.accent),
      }}
    >
      <div
        style={{
          width: 360 * S,
          background: C.surface,
          borderRadius: CARD_RADIUS * S,
          overflow: "hidden",
          fontFamily: SANS,
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Top gradient stripe */}
        <div
          style={{
            height: 3 * S,
            background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
          }}
        />

        <div style={{ padding: `${22 * S}px ${24 * S}px` }}>
          {/* Session status header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16 * S,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 * S }}>
              <div
                style={{
                  width: 8 * S,
                  height: 8 * S,
                  borderRadius: "50%",
                  background: C.green,
                  boxShadow: `0 0 ${6 * S}px ${C.green}88`,
                }}
              />
              <span
                style={{
                  fontSize: 11 * S,
                  fontWeight: 700,
                  color: C.body,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Deep Work
              </span>
            </div>
            <span style={{ fontSize: 11 * S, color: C.body, fontFamily: MONO }}>
              LIVE
            </span>
          </div>

          {/* Session title + person */}
          <div
            style={{
              fontSize: 18 * S,
              fontWeight: 800,
              color: C.text,
              letterSpacing: -0.5,
              marginBottom: 4 * S,
              lineHeight: 1.2,
            }}
          >
            Design System Overhaul
          </div>
          <div style={{ fontSize: 13 * S, color: C.body, marginBottom: 20 * S }}>
            Alex Rivera · Tue 9:00–11:00 AM
          </div>

          {/* Session timer */}
          <div
            style={{
              fontSize: 42 * S,
              fontWeight: 900,
              color: C.text,
              fontFamily: MONO,
              letterSpacing: -1,
              marginBottom: 16 * S,
              lineHeight: 1,
            }}
          >
            1:47:23
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 20 * S }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6 * S,
              }}
            >
              <span style={{ fontSize: 11 * S, color: C.body }}>
                Session progress
              </span>
              <span
                style={{
                  fontSize: 11 * S,
                  color: C.accent,
                  fontWeight: 700,
                }}
              >
                82%
              </span>
            </div>
            <div
              style={{
                height: 4 * S,
                background: C.border,
                borderRadius: 2 * S,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "82%",
                  height: "100%",
                  background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
                  borderRadius: 2 * S,
                }}
              />
            </div>
          </div>

          {/* BPM stat row — THE visual anchor that establishes 120 BPM */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `${10 * S}px ${14 * S}px`,
              background: `${C.accent}12`,
              borderRadius: 10 * S,
              border: `1px solid ${C.accent}20`,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 22 * S,
                  fontWeight: 900,
                  color: C.accent,
                  fontFamily: MONO,
                  lineHeight: 1,
                }}
              >
                120
              </div>
              <div
                style={{
                  fontSize: 9 * S,
                  color: C.body,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 2 * S,
                }}
              >
                BPM
              </div>
            </div>
            <div style={{ width: 1, height: 28 * S, background: C.border }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 22 * S,
                  fontWeight: 900,
                  color: C.green,
                  lineHeight: 1,
                }}
              >
                94
              </div>
              <div
                style={{
                  fontSize: 9 * S,
                  color: C.body,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 2 * S,
                }}
              >
                Flow
              </div>
            </div>
            <div style={{ width: 1, height: 28 * S, background: C.border }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: 22 * S,
                  fontWeight: 900,
                  color: C.text,
                  lineHeight: 1,
                }}
              >
                3
              </div>
              <div
                style={{
                  fontSize: 9 * S,
                  color: C.body,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop: 2 * S,
                }}
              >
                Tasks
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Beat Waveform ────────────────────────────────────────────────────────────
// Animated bar chart that cycles through beat positions at exactly 120 BPM.
// Each bar represents one beat. The active beat spikes up, then recedes.
// This visually "establishes the BPM" — a viewer can count along.

interface BeatWaveformProps {
  frame: number;
}

const BeatWaveform: React.FC<BeatWaveformProps> = ({ frame }) => {
  const SVG_W    = 300;
  const SVG_H    = 50;
  const MID      = SVG_H / 2;
  const NUM_BARS = 8;   // 2 bars × 4 beats
  const spacing  = SVG_W / NUM_BARS;

  const beatIndex = Math.floor(frame / BEAT) % NUM_BARS;
  const phase     = frame % BEAT;   // 0–14 within current beat

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        {Array.from({ length: NUM_BARS }, (_, i) => {
          const x        = i * spacing + spacing / 2;
          const isActive = i === beatIndex;
          const isPrev   = i === (beatIndex - 1 + NUM_BARS) % NUM_BARS;

          // Active beat spikes via sine envelope, prev decays
          const spike     = isActive ? Math.sin((phase / BEAT) * Math.PI) : 0;
          const barHeight = isActive ? 18 + spike * 10 : isPrev ? 11 : 6;
          const barOpacity = isActive ? 1 : 0.3;
          const fill      = isActive ? C.accent : C.body;

          return (
            <rect
              key={i}
              x={x - 1.5}
              y={MID - barHeight}
              width={3}
              height={barHeight * 2}
              rx={1.5}
              fill={fill}
              opacity={barOpacity}
            />
          );
        })}
      </svg>
      <div
        style={{
          fontSize: 11,
          color: C.body,
          fontFamily: MONO,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {BPM} BPM — Focus Tempo
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK  (local 0–120f · 4s · 2 bars)
//
// Restraint is the quality signal here. One word. One sub. One waveform.
// Every element lands on a beat. Nothing fights for attention.
// Dark background with breathing violet glow.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 14);
  const glow    = useBreathingGlow(90, 0.40, 1.0);
  const beat    = beatPulse(frame) * 0.12;

  // All reveals locked to beats — beat 1 f0, beat 2 f15, beat 3 f30, beat 4 f45
  const badge    = useCinematicTextReveal(15, 14, 6);   // beat 2
  const title    = useCinematicTextReveal(0,  18, 10);  // beat 1
  const sub      = useCinematicTextReveal(30, 16, 8);   // beat 3
  const wipeRule = usePremiumWipe(45, 24);               // beat 4

  // Waveform reveals at bar 2 beat 1 (local f60)
  const waveT    = easeOut4(rawProgress(frame, 60, 22));
  const waveOpacity = clamp(waveT * 3.5, 0, 1);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Ambient violet breathing glow — always moving */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
          width: 920,
          height: 920,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(124,107,255,${0.13 * glow + beat}) 0%,
            rgba(232,121,249,${0.05 * glow}) 45%,
            transparent 70%)`,
        }}
      />

      {/* Centred column — focal hierarchy: badge → title → rule → sub → waveform */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {/* Badge — beat 2 */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: `${C.accent}18`,
            border: `1px solid ${C.accent}30`,
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 32,
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
            filter: `blur(${badge.blur}px)`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.accent,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily: SANS,
            }}
          >
            Deep Work OS
          </span>
        </div>

        {/* Hero title "PULSE" — beat 1, dominant focal point */}
        <div
          style={{
            fontSize: 158,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.text,
            letterSpacing: -8,
            lineHeight: 0.88,
            opacity: title.opacity,
            transform: `translateY(${title.translateY}px)`,
            filter: `blur(${title.blur}px)`,
          }}
        >
          PULSE
        </div>

        {/* Accent gradient rule — beat 4 */}
        <div
          style={{
            width: `${wipeRule}%`,
            maxWidth: 220,
            height: 2,
            background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
            borderRadius: 1,
            marginTop: 18,
            marginBottom: 26,
          }}
        />

        {/* Sub copy — beat 3 */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            fontFamily: SANS,
            color: C.body,
            letterSpacing: -0.3,
            lineHeight: 1.5,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          Your work has a rhythm.
        </div>

        {/* Beat waveform — bar 2 beat 1 (local f60). Establishes 120 BPM. */}
        <div style={{ marginTop: 52, opacity: waveOpacity }}>
          <BeatWaveform frame={frame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — DEMO  (local 0–120f · 4s · 2 bars)
//
// Focus card glides in from bottom-left on an arc path.
// Blur resolves as it settles (rack focus: "the camera found its subject").
// Slight 3D rotation — directional drift, born moving from frame 1.
// Prism rim simulates physical card depth.
// Context copy appears AFTER the card has settled (text arrives last).
// ═══════════════════════════════════════════════════════════════════════════════

const SceneDemo: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 14);
  const glow    = useBreathingGlow(80, 0.45, 1.0);
  const beat    = beatPulse(frame) * 0.10;

  // Arc entry from bottom-left — beat 1 of bar 3 = local f0
  const arcEntry  = useArcEntry(0, -110, 150, PREMIUM_SPRING.hero);
  const cardBlur  = useBlurResolve(0, 30, 16);
  const cardScale = useSoftScaleIn(0, 0.88, 32);

  // Directional 3D rotation — born at frame 1, never stops (no oscillation)
  // Continues from rest angle through the scene with consistent velocity
  const rotY = -8 + frame * 0.065;   // drifts from -8° toward positive
  const rotX =  3 - frame * 0.026;   // slight tilt decays to 0° then below

  // Float — only starts after card settles (local f40) — motion-on-motion avoided
  const floatY = useHeroFloatDelayed(40, 6, 88);

  // Context copy — beat 3 of bar 3 = local f30 (hard sync)
  const labelT = useCinematicTextReveal(30, 14, 6);
  const subT   = useCinematicTextReveal(42, 12, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Breathing glow shifts toward card's resting zone */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 860,
          height: 860,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(124,107,255,${0.10 * glow + beat}) 0%,
            transparent 65%)`,
        }}
      />

      {/* Card — centered with arc offset + float + 3D rotation */}
      {/* Three nested divs: position / arc+float / 3D rotation */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          // Center the card, then apply arc offset
          transform: "translateX(-50%) translateY(-50%)",
          perspective: "1100px",
        }}
      >
        {/* Arc entry animation + float + scale */}
        <div
          style={{
            transform: `
              translateX(${arcEntry.translateX}px)
              translateY(${arcEntry.translateY + floatY}px)
              scale(${cardScale})
            `,
            filter: `blur(${cardBlur}px) drop-shadow(0 24px 64px rgba(124,107,255,0.26))`,
          }}
        >
          {/* 3D rotation wrapper */}
          <div
            style={{
              transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
            }}
          >
            <FocusCard rotY={rotY} rotX={rotX} scale={1} />
          </div>
        </div>
      </div>

      {/* "In session" label — above card — text arrives after card settles */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "17%",
          textAlign: "center",
          opacity: labelT.opacity,
          transform: `translateY(${labelT.translateY}px)`,
          filter: `blur(${labelT.blur}px)`,
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 700,
            color: C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily: SANS,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 6px ${C.green}`,
            }}
          />
          In session
        </div>
      </div>

      {/* Supporting detail — below card */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "13%",
          textAlign: "center",
          opacity: subT.opacity,
          transform: `translateY(${subT.translateY}px)`,
          filter: `blur(${subT.blur}px)`,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: C.body,
            fontFamily: SANS,
            letterSpacing: -0.2,
          }}
        >
          3 active tasks · Tuesday
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — FEATURES  (local 0–120f · 4s · 2 bars)
//
// Card persists but recedes via depthDeemphasis — it becomes the depth anchor.
// Three features enter left-to-right, each on a beat (f0, f15, f30).
// Section headline appears at bar 6 beat 1 (local f60).
// Pre-motion: card de-emphasises from local f0 (before features arrive).
// ═══════════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: "◈",
    title: "Flow Detection",
    body: "AI tracks when you enter the zone — and guards it.",
    delay: 0,    // beat 1 of bar 5
  },
  {
    icon: "♦",
    title: "Beat-sync Scheduling",
    body: "Work blocks that match your natural energy rhythm.",
    delay: 15,   // beat 2 of bar 5
  },
  {
    icon: "◎",
    title: "Rhythm Analytics",
    body: "Weekly patterns that compound over time.",
    delay: 30,   // beat 3 of bar 5
  },
] as const;

const SceneFeatures: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 14);
  const glow    = useBreathingGlow(85, 0.38, 0.88);

  // Card de-emphasis — smooth over 28 frames from local f0
  const deempT  = easeInOut3(rawProgress(frame, 0, 28));
  const deemph  = depthDeemphasis(deempT);

  // Card continues its directional drift from where scene 2 left off
  // Scene 2 ended at frame 120: rotY ≈ -8 + 120*0.065 = -0.2°, rotX ≈ 3 - 120*0.026 = -0.12°
  const rotY  = -0.2 + frame * 0.04;
  const rotX  = -0.12 - frame * 0.012;
  const floatY = Math.sin((frame / 88) * 2 * Math.PI + 1.4) * 5;  // phase offset for variety

  // Section headline — bar 6 beat 1 = local f60
  const headlineT = useCinematicTextReveal(60, 16, 7);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Glow shifted to the right to support card position */}
      <div
        style={{
          position: "absolute",
          right: -80,
          top: "35%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(124,107,255,${0.07 * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Card — right half, de-emphasised depth anchor */}
      <div
        style={{
          position: "absolute",
          left: "56%",
          top: "50%",
          transform: `translateY(-50%)`,
          perspective: "1100px",
          opacity: deemph.opacity,
          filter: `blur(${deemph.blur}px)`,
        }}
      >
        <div
          style={{
            transform: `
              translateY(${floatY}px)
              rotateY(${rotY}deg)
              rotateX(${rotX}deg)
              scale(${deemph.scale})
            `,
          }}
        >
          <FocusCard rotY={rotY} rotX={rotX} scale={0.82} />
        </div>
      </div>

      {/* Features list — left half */}
      <div
        style={{
          position: "absolute",
          left: 64,
          top: "50%",
          transform: "translateY(-50%)",
          width: 482,
        }}
      >
        {/* Section headline — bar 6 beat 1 */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily: SANS,
            marginBottom: 38,
            opacity: headlineT.opacity,
            transform: `translateY(${headlineT.translateY}px)`,
            filter: `blur(${headlineT.blur}px)`,
          }}
        >
          Three pillars of flow
        </div>

        {FEATURES.map((feat, i) => {
          const t      = easeOut4(rawProgress(frame, feat.delay, 24));
          const wipeW  = easeInOut3(rawProgress(frame, feat.delay + 14, 22)) * 100;
          const opacity = clamp(t / 0.25, 0, 1);

          return (
            <div
              key={i}
              style={{
                marginBottom: i < 2 ? 36 : 0,
                opacity,
                transform: `translateX(${(1 - t) * -40}px)`,
              }}
            >
              {/* Icon chip + title */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 10,
                    background: `${C.accent}14`,
                    border: `1.5px solid ${C.accent}28`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    color: C.accent,
                    flexShrink: 0,
                  }}
                >
                  {feat.icon}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: C.text,
                    fontFamily: SANS,
                    letterSpacing: -0.4,
                  }}
                >
                  {feat.title}
                </div>
              </div>

              {/* Body */}
              <div
                style={{
                  fontSize: 15,
                  color: C.body,
                  fontFamily: SANS,
                  lineHeight: 1.6,
                  paddingLeft: 46,
                  marginBottom: 10,
                }}
              >
                {feat.body}
              </div>

              {/* Wipe underline */}
              <div
                style={{
                  marginLeft: 46,
                  width: `${wipeW}%`,
                  maxWidth: 200,
                  height: 1.5,
                  background: `linear-gradient(90deg, ${C.accent}66, transparent)`,
                  borderRadius: 1,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — METRICS  (local 0–60f · 2s · 1 bar)
//
// Three stats, each owning exactly one third of the 1080×1080 canvas = 360px.
// Built strictly on the Meridian flex-row pattern — the proven metric layout.
// Each stat builds on a beat: f0, f15, f30.
// 140px dominant values fill each row. Nothing else competes.
// ═══════════════════════════════════════════════════════════════════════════════

const METRICS = [
  { value: "2.4×",  label: "DEEPER FOCUS",  sub: "vs. unfocused sessions" },
  { value: "94%",   label: "FLOW RATE",     sub: "sessions reaching deep work" },
  { value: "47min", label: "AVG SESSION",   sub: "uninterrupted focus blocks" },
] as const;

const SceneMetrics: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(60, 12);
  const glow    = useBreathingGlow(60, 0.50, 1.0);
  const beat    = beatPulse(frame) * 0.07;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Central breathing glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(124,107,255,${0.09 * glow + beat}) 0%, transparent 65%)`,
        }}
      />

      {/* Three metric rows — each owns exactly 360px (= 1080 ÷ 3) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {METRICS.map((m, i) => {
          // Each stat hard-synced to a beat: 0, 15, 30
          const startF     = i * BEAT;
          const tOpacity   = easeOut3(rawProgress(frame, startF, 22));
          const tTranslate = easeOut5(rawProgress(frame, startF, 26));
          const tBlur      = easeOut4(rawProgress(frame, startF, 30));

          const opacity    = clamp(tOpacity * 3, 0, 1);
          const translateY = (1 - tTranslate) * 28;
          const blur       = (1 - tBlur) * 10;

          return (
            <div
              key={i}
              style={{
                flex: 1,                          // each row = exactly 360px
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                opacity,
                transform: `translateY(${translateY}px)`,
                filter: `blur(${blur}px)`,
              }}
            >
              {/* Dominant value — 140px, the focal point */}
              <div
                style={{
                  fontSize: 140,
                  fontWeight: 900,
                  fontFamily: SANS,
                  color: C.text,
                  letterSpacing: -6,
                  lineHeight: 0.88,
                  marginBottom: 10,
                }}
              >
                {m.value}
              </div>

              {/* Label */}
              <div
                style={{
                  fontSize: 21,
                  fontWeight: 700,
                  fontFamily: SANS,
                  color: C.accent,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {m.label}
              </div>

              {/* Context sub */}
              <div
                style={{
                  fontSize: 15,
                  color: C.body,
                  fontFamily: SANS,
                  letterSpacing: -0.1,
                }}
              >
                {m.sub}
              </div>

              {/* Accent dot — short centred separator */}
              <div
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: C.accent,
                  marginTop: 14,
                  opacity: 0.5,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA  (local 0–60f · 2s · 1 bar)
//
// Background darkens further — confident tone-shift signals resolution.
// Warm violet glow breathes. Two headline lines. One button. URL.
// Nothing extra. Trust was built in the previous four scenes.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 10);
  const glow    = useBreathingGlow(80, 0.55, 1.0);
  const beat    = beatPulse(frame) * 0.14;

  // Glow fades to zero by local f30 = global f450 = exactly 15 seconds.
  // After that the background is a clean, still dark — no more pulse.
  const glowFade = 1 - easeInOut3(rawProgress(frame, 0, 30));

  // Background deepens from local f0
  const bgT = easeOut3(rawProgress(frame, 0, 20));

  // Headline — beat 2 (local f15)
  const line1 = useCinematicTextReveal(15, 18, 9);
  const line2 = useCinematicTextReveal(23, 18, 9);

  // Sub copy — beat 3 (local f30)
  const sub = useCinematicTextReveal(30, 12, 5);

  // Button + URL — beat 4 (local f45)
  const btnT = easeOut4(rawProgress(frame, 45, 18));
  const urlT = useCinematicTextReveal(50, 10, 4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Base dark */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(145deg, #070614 0%, #0C0B20 100%)`,
          opacity: bgT,
        }}
      />
      <AbsoluteFill
        style={{ background: C.bg, opacity: 1 - bgT }}
      />

      {/* Violet + fuchsia glow — breathes warmly */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "46%",
          transform: "translate(-50%, -50%)",
          width: 880,
          height: 880,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(124,107,255,${(0.15 * glow + beat) * glowFade}) 0%,
            rgba(232,121,249,${0.06 * glow * glowFade}) 45%,
            transparent 70%)`,
        }}
      />

      {/* Content — vertically centred */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {/* Wordmark above — very subtle */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: `${C.accent}55`,
            fontFamily: SANS,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom: 44,
            opacity: line1.opacity,
          }}
        >
          Pulse
        </div>

        {/* Headline — two lines */}
        {[
          { text: "Find your",  t: line1, color: C.text },
          { text: "rhythm.",    t: line2, color: C.accent },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 96,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -5,
              lineHeight: 0.88,
              marginBottom: i === 0 ? 6 : 0,
              opacity: l.t.opacity,
              transform: `translateY(${l.t.translateY}px)`,
              filter: `blur(${l.t.blur}px)`,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* Sub copy */}
        <div
          style={{
            fontSize: 19,
            color: C.body,
            fontFamily: SANS,
            marginTop: 28,
            marginBottom: 44,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          Start free. No credit card needed.
        </div>

        {/* CTA Button */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: C.accent,
            borderRadius: 100,
            padding: "18px 48px",
            boxShadow: `0 0 44px ${C.accent}44, 0 4px 20px rgba(0,0,0,0.32)`,
            marginBottom: 22,
            opacity: btnT,
            transform: `scale(${0.88 + btnT * 0.12})`,
            transformOrigin: "center",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: C.white,
              fontFamily: SANS,
              letterSpacing: -0.3,
            }}
          >
            Start free trial
          </span>
          <span
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.70)",
              fontWeight: 700,
            }}
          >
            →
          </span>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 15,
            color: "rgba(240,238,255,0.22)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
            opacity: urlT.opacity,
            transform: `translateY(${urlT.translateY}px)`,
          }}
        >
          pulse.app
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Cue Sheet ───────────────────────────────────────────────────────────────
// Every frame-level animation event, labelled for music/SFX generation.
// Import this array in studio/src/registry.ts alongside the component.
// At 30fps, 120 BPM: 1 beat = 15 frames, 1 bar = 60 frames.

export const PulseAdCues: CueEvent[] = [
  // ── Scene 1: Hook (f0–f120) ──────────────────────────────────────────────
  { frame: 0,   type: "SCENE_CUT",   label: 'Hook begins — "PULSE" on dark',        intensity: "hard",   notes: "Strong impact hit. This is the opening frame — make it land." },
  { frame: 0,   type: "TEXT_IMPACT", label: '"PULSE" title enters',                  intensity: "hard",   notes: "160px dominant headline. Blur-resolves from 10px." },
  { frame: 15,  type: "TEXT_REVEAL", label: '"Deep Work OS" badge',                  intensity: "soft",   notes: "Beat 2. Small badge fades in. Subtle shimmer or air." },
  { frame: 30,  type: "TEXT_REVEAL", label: '"Your work has a rhythm." sub copy',    intensity: "soft",   notes: "Beat 3. Supporting copy." },
  { frame: 45,  type: "WIPE",        label: "Accent gradient rule wipes left→right", intensity: "medium", notes: "Beat 4. Short directional sweep sound." },
  { frame: 60,  type: "BEAT_LOCK",   label: "Beat waveform appears — 120 BPM set",  intensity: "medium", notes: "Bar 2. THIS is the moment the BPM identity locks in. Rhythmic click or pulse sequence." },

  // ── Scene 2: Demo (f120–f240) ─────────────────────────────────────────────
  { frame: 120, type: "SCENE_CUT",   label: "→ Demo: Focus card begins arc entry",   intensity: "hard",   notes: "Bar 3. Hard cut. Card swoops in from bottom-left." },
  { frame: 120, type: "HERO_ENTRY",  label: "Focus card arc from bottom-left",       intensity: "hard",   notes: "Rising swoosh + impact on settle (~f150). Blur resolves over 28 frames." },
  { frame: 135, type: "AMBIENT",     label: "Card blur resolves — rack focus",       intensity: "soft",   notes: "Beat 2 of bar 3. Soft shimmer as card sharpens." },
  { frame: 150, type: "TEXT_REVEAL", label: '"In session" + task sub copy',          intensity: "soft",   notes: "Beat 3 of bar 3. Card has settled. Context copy drifts in." },

  // ── Scene 3: Features (f240–f360) ─────────────────────────────────────────
  { frame: 240, type: "SCENE_CUT",   label: "→ Features: Card recedes, list enters", intensity: "hard",   notes: "Bar 5. Hard cut. Card de-emphasises smoothly." },
  { frame: 240, type: "OBJECT_LAND", label: 'Feature 1 lands: "Flow Detection"',     intensity: "medium", notes: "Beat 1 of bar 5. Slides from left. UI click or soft snap." },
  { frame: 255, type: "OBJECT_LAND", label: 'Feature 2 lands: "Beat-sync Scheduling"', intensity: "medium", notes: "Beat 2. Same gesture, staggered." },
  { frame: 270, type: "OBJECT_LAND", label: 'Feature 3 lands: "Rhythm Analytics"',  intensity: "medium", notes: "Beat 3. Final feature of the three." },
  { frame: 300, type: "TEXT_REVEAL", label: '"Three pillars of flow" headline',      intensity: "soft",   notes: "Bar 6. Section context line appears after features settled." },

  // ── Scene 4: Metrics (f360–f420) ──────────────────────────────────────────
  { frame: 360, type: "SCENE_CUT",   label: '→ Metrics: "2.4×" stat builds',        intensity: "hard",   notes: "Bar 7. Impact. Each metric gets its own beat." },
  { frame: 360, type: "STAT_BUILD",  label: '"2.4× Deeper Focus" enters',           intensity: "hard",   notes: "Beat 1. 140px dominant number. Heavy impact + decay." },
  { frame: 375, type: "STAT_BUILD",  label: '"94% Flow Rate" enters',               intensity: "hard",   notes: "Beat 2. Second metric. Echo of beat 1." },
  { frame: 390, type: "STAT_BUILD",  label: '"47min Avg Session" enters',           intensity: "hard",   notes: "Beat 3. Third and final metric." },

  // ── Scene 5: CTA (f420–f480) ──────────────────────────────────────────────
  { frame: 420, type: "SCENE_CUT",   label: "→ CTA: Background darkens",            intensity: "hard",   notes: "Bar 8. Final scene. Tone shift — feels like resolution." },
  { frame: 435, type: "TEXT_IMPACT", label: '"Find your rhythm." headline',         intensity: "medium", notes: "Beat 2. Two-line headline enters. Cinematic blur-reveal." },
  { frame: 450, type: "CTA_REVEAL",  label: "Button + URL reveals",                 intensity: "medium", notes: "Beat 3. Call-to-action. Clean, decisive. Ad ends at f480." },
];

// ─── Root Export ──────────────────────────────────────────────────────────────
// Camera motion wrapper applied to ALL scene content.
// Linear interpolation only — no easing on camera (easing reads as consumer Ken Burns).
// 6.2% dolly push-in + ±0.7° roll + 22px pan over 16 seconds.
// Roll keyframed to pass near 0° during the metrics scene (text must stay legible).

const TOTAL_FRAMES = 540;

export const PulseAd: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraProg = frame / TOTAL_FRAMES;
  const cameraZoom = 1.0 + cameraProg * 0.062;  // linear dolly push-in

  // Roll passes near 0° at f360 (metrics scene) so numbers stay level
  const cameraRoll = interpolate(
    frame,
    [0, 80, 200, 360, 420, TOTAL_FRAMES],
    [-0.7, -0.12, 0.50, 0.05, 0.55, 0.22],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const cameraPanX = interpolate(
    frame,
    [0, TOTAL_FRAMES],
    [12, -10],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const cameraPanY = interpolate(
    frame,
    [0, TOTAL_FRAMES],
    [7, -6],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Camera motion wrapper — ONE div around ALL content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${cameraZoom}) rotateZ(${cameraRoll}deg) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`,
          transformOrigin: "center center",
        }}
      >
        <Sequence from={0}   durationInFrames={120}><SceneHook     /></Sequence>
        <Sequence from={120} durationInFrames={120}><SceneDemo     /></Sequence>
        <Sequence from={240} durationInFrames={120}><SceneFeatures /></Sequence>
        <Sequence from={360} durationInFrames={60}> <SceneMetrics  /></Sequence>
        <Sequence from={420} durationInFrames={120}> <SceneCTA      /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
