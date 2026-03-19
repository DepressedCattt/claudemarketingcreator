/**
 * ApexAd — "Close faster."
 *
 * Format:  1:1 square (1080 × 1080)
 * Duration: 540 frames @ 30fps = 18 seconds
 * BPM:     120 (1 beat = 15 frames, 1 bar = 60 frames)
 * Target:  Instagram Feed, Facebook Feed (1:1 placement)
 *
 * ─── Commercial Brief ────────────────────────────────────────────────────────
 * Brand:   Apex — Sales CRM for closers
 * Promise: Close more deals, faster. (ONE promise, every scene points here)
 * Hook:    "42% of deals die before closing." — a specific, alarming pain stat
 * Proof:   The deal card (Acme Corp, $840K, 94% win prob, Closing stage)
 * Pivot:   "Not with Apex." — immediate resolution of the pain
 * Features: AI Scoring, Stall Detection, Revenue Forecasting
 * Metrics: 43% faster close, 2.1× more deals, 31 days saved (concrete, not hype)
 * CTA:     "Try Apex free" → apex.io
 *
 * ─── Beat Grid — Hard Sync Points ────────────────────────────────────────────
 *   f0:   Badge "Apex CRM" + pain stat "42%" (bar 1 beat 1)
 *   f15:  Sub copy "of deals die before closing." (bar 1 beat 2)
 *   f30:  Accent rule wipes (bar 1 beat 3)
 *   f45:  Pivot "Not with Apex." (bar 1 beat 4)
 *   f60:  Pipeline funnel bars reveal (bar 2 beat 1)
 *   f120: Scene cut → Deal card arc entry (bar 3 beat 1)
 *   f150: Context copy "Every deal, always visible." (bar 3 beat 3)
 *   f240: Scene cut → Feature 1 (bar 5 beat 1)
 *   f255: Feature 2 (bar 5 beat 2)
 *   f270: Feature 3 (bar 5 beat 3)
 *   f300: Features headline (bar 6 beat 1)
 *   f360: Scene cut → Metric 1 builds (bar 7 beat 1)
 *   f375: Metric 2 builds (bar 7 beat 2)
 *   f390: Metric 3 builds (bar 7 beat 3)
 *   f420: Scene cut → CTA background deepens (bar 8 beat 1)
 *   f435: Headline "Close / faster." enters (bar 8 beat 2)
 *   f450: Sub + button (bar 8 beat 3)
 *
 * ─── Motion Craft Learnings Applied ─────────────────────────────────────────
 *   ◆ Camera wrapper: 6.2% linear dolly + roll + pan over full 18s
 *   ◆ Dark premium background — depth and brand signal from f0
 *   ◆ useCinematicTextReveal on all text entrances
 *   ◆ useArcEntry (bottom-left) + useBlurResolve on deal card (rack focus)
 *   ◆ Directional 3D rotation — card born moving, no oscillation
 *   ◆ Prism rim technique — simulated card thickness via rim + computed shadow
 *   ◆ depthDeemphasis — card recedes when features need focus
 *   ◆ usePremiumFadeOut on every scene
 *   ◆ Flex-row metric layout (each metric owns exactly 360px = 1080÷3)
 *   ◆ useBreathingGlow — ambient glow always alive
 *   ◆ Burst-then-calm: card enter → hold → de-emphasise → features land
 *   ◆ Text arrives last — only after the key visual has resolved
 *   ◆ Hard sync: cuts, title hits, stats. Soft sync: glow, float, ambient
 *
 * ─── Commercial Layer Learnings Applied ──────────────────────────────────────
 *   ◆ Brand through palette from f0: orange glow = Apex before logo appears
 *   ◆ Pain stat "42%" is mute-proof — visually compelling at 0s with no audio
 *   ◆ Product (deal card) is scene 2's hero — specific, credible, legible
 *   ◆ One promise per ad: "Close faster." (hook → proof → features → CTA)
 *   ◆ Concrete metrics: 43%, 2.1×, 31 days — not "work better" hype
 *   ◆ Hero line 2–6 words: "42%", "Not with Apex.", "Close / faster."
 *   ◆ Text lands on resolved frames — layout never fights copy for attention
 *   ◆ Safe zone: all key content central, away from platform UI chrome
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
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
// Orange/amber palette — distinctive, zero overlap with existing ads.
// Orange signals urgency, deals, money, fire. Immediately recognisable.

const C = {
  bg:      "#09090B",   // zinc-950 — near black, warm undertone
  surface: "#18181B",   // zinc-900 — dark card surface
  accent:  "#F97316",   // orange-500 — energy, deals, brand color
  accent2: "#FBBF24",   // amber-400 — value, money, gradient partner
  text:    "#FAFAF9",   // zinc-50 — near white
  body:    "#A1A1AA",   // zinc-400 — muted supporting text
  border:  "#3F3F46",   // zinc-700 — subtle dark border
  green:   "#22C55E",   // green-500 — won deals, success
  white:   "#FFFFFF",
} as const;

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── BPM Constants ────────────────────────────────────────────────────────────
// 120 BPM @ 30fps: 1 beat = 15 frames, 1 bar (4 beats) = 60 frames

const BEAT = 15;

/** Triangle-wave spike at every beat boundary. Returns 0–1. */
function beatPulse(frame: number): number {
  const phase = frame % BEAT;
  return phase < 6 ? Math.sin((phase / 6) * Math.PI) : 0;
}

// ─── Prism Rim Technique ─────────────────────────────────────────────────────
// Simulates physical card thickness without preserve-3d
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

// ─── Deal Card (Hero UI Component) ───────────────────────────────────────────
// A specific, credible CRM deal view. Acme Corp Q1 Expansion — $840K — Closing.
// Specificity signals confidence. Generic cards signal "mock-up."

interface DealCardProps {
  rotY?:  number;
  rotX?:  number;
  scale?: number;
}

const PIPELINE_STAGES = ["Prospect", "Qualified", "Proposal", "Closing", "Won"] as const;
const ACTIVE_STAGE    = 3; // "Closing"

const DealCard: React.FC<DealCardProps> = ({ rotY = 0, rotX = 0, scale = 1 }) => {
  const S = scale;
  return (
    // Rim wrapper — orange gradient rim creates prism depth effect
    <div
      style={{
        padding:      CARD_RIM * S,
        background:   `linear-gradient(150deg, ${C.accent}FF, ${C.accent2}99)`,
        borderRadius: (CARD_RADIUS + CARD_RIM) * S,
        boxShadow:    prismEdgeShadow(rotY, rotX, C.accent),
      }}
    >
      <div
        style={{
          width:        360 * S,
          background:   C.surface,
          borderRadius: CARD_RADIUS * S,
          overflow:     "hidden",
          fontFamily:   SANS,
          border:       `1px solid ${C.border}`,
        }}
      >
        {/* Top accent stripe */}
        <div
          style={{
            height:     3 * S,
            background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
          }}
        />

        <div style={{ padding: `${22 * S}px ${24 * S}px` }}>
          {/* Header row: status dot + label / LIVE chip */}
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              marginBottom:   14 * S,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 * S }}>
              <div
                style={{
                  width:        8 * S,
                  height:       8 * S,
                  borderRadius: "50%",
                  background:   C.green,
                  boxShadow:    `0 0 ${6 * S}px ${C.green}88`,
                }}
              />
              <span
                style={{
                  fontSize:      11 * S,
                  fontWeight:    700,
                  color:         C.body,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Active Deal
              </span>
            </div>
            <span style={{ fontSize: 11 * S, color: C.body, fontFamily: MONO }}>
              LIVE
            </span>
          </div>

          {/* Deal name + owner */}
          <div
            style={{
              fontSize:      17 * S,
              fontWeight:    800,
              color:         C.text,
              letterSpacing: -0.4,
              marginBottom:  3 * S,
              lineHeight:    1.2,
            }}
          >
            Acme Corp · Q1 Expansion
          </div>
          <div style={{ fontSize: 12 * S, color: C.body, marginBottom: 18 * S }}>
            Jamie K. · Closes Mar 28, 2026
          </div>

          {/* Deal value — the dominant number. The eye goes here first. */}
          <div
            style={{
              fontSize:      44 * S,
              fontWeight:    900,
              color:         C.text,
              fontFamily:    MONO,
              letterSpacing: -2,
              marginBottom:  16 * S,
              lineHeight:    1,
            }}
          >
            $840,000
          </div>

          {/* Pipeline stage progress bars */}
          <div style={{ marginBottom: 18 * S }}>
            <div
              style={{
                display:      "flex",
                gap:          4 * S,
                marginBottom: 6 * S,
              }}
            >
              {PIPELINE_STAGES.map((_, i) => (
                <div
                  key={i}
                  style={{
                    flex:         1,
                    height:       3 * S,
                    background:
                      i < ACTIVE_STAGE
                        ? `${C.accent}55`
                        : i === ACTIVE_STAGE
                        ? C.accent
                        : C.border,
                    borderRadius: 2 * S,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  fontSize:      9 * S,
                  color:         C.body,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {PIPELINE_STAGES[0]}
              </span>
              <span
                style={{
                  fontSize:      9 * S,
                  color:         C.accent,
                  fontWeight:    700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {PIPELINE_STAGES[ACTIVE_STAGE]} ←
              </span>
              <span
                style={{
                  fontSize:      9 * S,
                  color:         C.body,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {PIPELINE_STAGES[PIPELINE_STAGES.length - 1]}
              </span>
            </div>
          </div>

          {/* Stat row — Win Prob | Days Left | Deals Won */}
          <div
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "space-between",
              padding:        `${10 * S}px ${14 * S}px`,
              background:     `${C.accent}12`,
              borderRadius:   10 * S,
              border:         `1px solid ${C.accent}20`,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize:   22 * S,
                  fontWeight: 900,
                  color:      C.green,
                  fontFamily: MONO,
                  lineHeight: 1,
                }}
              >
                94%
              </div>
              <div
                style={{
                  fontSize:      9 * S,
                  color:         C.body,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop:     2 * S,
                }}
              >
                Win Prob
              </div>
            </div>

            <div style={{ width: 1, height: 28 * S, background: C.border }} />

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize:   22 * S,
                  fontWeight: 900,
                  color:      C.accent,
                  lineHeight: 1,
                }}
              >
                12
              </div>
              <div
                style={{
                  fontSize:      9 * S,
                  color:         C.body,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop:     2 * S,
                }}
              >
                Days Left
              </div>
            </div>

            <div style={{ width: 1, height: 28 * S, background: C.border }} />

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize:   22 * S,
                  fontWeight: 900,
                  color:      C.text,
                  lineHeight: 1,
                }}
              >
                3
              </div>
              <div
                style={{
                  fontSize:      9 * S,
                  color:         C.body,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginTop:     2 * S,
                }}
              >
                Deals Won
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Pipeline Funnel Bars ─────────────────────────────────────────────────────
// Visualises the deal funnel — fewer deals survive to each later stage.
// The "Closing" bar glows orange to anchor Apex's focus zone visually.
// Appears at local f60 (bar 2) in the hook scene — adds depth without clutter.

interface PipelineFunnelProps {
  /** Local frame counter starting from 0 when funnel begins revealing. */
  frame: number;
}

const FUNNEL_BARS = [
  { label: "Prospect",  height: 130, color: C.body,   isHero: false },
  { label: "Qualified", height: 104, color: C.body,   isHero: false },
  { label: "Proposal",  height:  76, color: C.body,   isHero: false },
  { label: "Closing",   height:  48, color: C.accent, isHero: true  },
  { label: "Won",       height:  24, color: C.green,  isHero: false },
] as const;

const PipelineFunnel: React.FC<PipelineFunnelProps> = ({ frame }) => (
  <div
    style={{
      display:    "flex",
      alignItems: "flex-end",
      gap:        18,
      justifyContent: "center",
    }}
  >
    {FUNNEL_BARS.map((bar, i) => {
      // Each bar staggered by 7 frames so they reveal left-to-right
      const t = easeOut4(rawProgress(frame, i * 7, 20));
      return (
        <div
          key={i}
          style={{
            display:        "flex",
            flexDirection:  "column",
            alignItems:     "center",
            gap:            10,
            opacity:        t,
          }}
        >
          <div
            style={{
              width:      26,
              height:     bar.height * t,
              background: bar.isHero
                ? `linear-gradient(180deg, ${bar.color}66 0%, ${bar.color} 100%)`
                : `linear-gradient(180deg, ${bar.color}28 0%, ${bar.color}60 100%)`,
              borderRadius: 5,
              boxShadow: bar.isHero ? `0 0 16px ${C.accent}44` : undefined,
            }}
          />
          <span
            style={{
              fontSize:      10,
              color:         bar.isHero ? C.accent : C.body,
              fontWeight:    bar.isHero ? 700 : 400,
              letterSpacing: "0.07em",
              textTransform: "uppercase",
              fontFamily:    SANS,
            }}
          >
            {bar.label}
          </span>
        </div>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK  (local 0–120f · 4s · 2 bars)
//
// The pain stat "42%" is the dominant focal point from frame 0.
// Restraint is the quality signal: badge → stat → sub → rule → pivot → funnel.
// Orange glow brands the space before the logo appears.
// Mute test: "42%" is impossible to misread. The proposition is immediately clear.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 14);
  const glow    = useBreathingGlow(90, 0.40, 1.0);
  const beat    = beatPulse(frame) * 0.10;

  // Hard-synced reveals — one concept per beat
  const badge    = useCinematicTextReveal(0,  14, 7);    // beat 1 — brand first
  const pain     = useCinematicTextReveal(5,  20, 12);   // beat 1+ — pain stat (dominant)
  const sub      = useCinematicTextReveal(15, 16, 8);    // beat 2 — context line
  const wipeRule = usePremiumWipe(30, 22);                // beat 3 — accent rule
  const pivot    = useCinematicTextReveal(45, 16, 8);    // beat 4 — resolution pivot

  // Pipeline funnel: bar 2 beat 1 = local f60
  const funnelLocalFrame   = Math.max(0, frame - 60);
  const funnelContainerT   = easeOut3(rawProgress(frame, 60, 20));
  const funnelOpacity      = clamp(funnelContainerT * 3, 0, 1);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Orange breathing glow — brand signal from frame 0.
          The palette establishes Apex before a single word appears. */}
      <div
        style={{
          position:     "absolute",
          left:         "50%",
          top:          "42%",
          transform:    "translate(-50%, -50%)",
          width:        880,
          height:       880,
          borderRadius: "50%",
          background:   `radial-gradient(ellipse,
            rgba(249,115,22,${0.14 * glow + beat}) 0%,
            rgba(251,191,36,${0.05 * glow}) 45%,
            transparent 70%)`,
        }}
      />

      {/* Centred column — focal hierarchy: badge → stat → sub → rule → pivot → funnel */}
      <div
        style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          textAlign:      "center",
          padding:        "0 90px",
        }}
      >
        {/* Badge — beat 1 — brand first, even before the stat */}
        <div
          style={{
            display:      "inline-flex",
            alignItems:   "center",
            gap:          7,
            background:   `${C.accent}18`,
            border:       `1px solid ${C.accent}30`,
            borderRadius: 100,
            padding:      "6px 16px",
            marginBottom: 36,
            opacity:      badge.opacity,
            transform:    `translateY(${badge.translateY}px)`,
            filter:       `blur(${badge.blur}px)`,
          }}
        >
          <div
            style={{
              width:        6,
              height:       6,
              borderRadius: "50%",
              background:   C.accent,
            }}
          />
          <span
            style={{
              fontSize:      12,
              fontWeight:    700,
              color:         C.accent,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              fontFamily:    SANS,
            }}
          >
            Apex CRM
          </span>
        </div>

        {/* Pain stat "42%" — dominant focal point. 168px — impossible to miss. */}
        <div
          style={{
            fontSize:      168,
            fontWeight:    900,
            fontFamily:    SANS,
            color:         C.text,
            letterSpacing: -10,
            lineHeight:    0.88,
            opacity:       pain.opacity,
            transform:     `translateY(${pain.translateY}px)`,
            filter:        `blur(${pain.blur}px)`,
          }}
        >
          42%
        </div>

        {/* Accent rule — beat 3 */}
        <div
          style={{
            width:         `${wipeRule}%`,
            maxWidth:      200,
            height:        2,
            background:    `linear-gradient(90deg, ${C.accent}, ${C.accent2})`,
            borderRadius:  1,
            marginTop:     18,
            marginBottom:  22,
          }}
        />

        {/* Sub copy — beat 2 — one idea only */}
        <div
          style={{
            fontSize:      22,
            fontWeight:    400,
            fontFamily:    SANS,
            color:         C.body,
            letterSpacing: -0.2,
            lineHeight:    1.5,
            opacity:       sub.opacity,
            transform:     `translateY(${sub.translateY}px)`,
            filter:        `blur(${sub.blur}px)`,
          }}
        >
          of deals die before closing.
        </div>

        {/* Pivot — beat 4 — resolves the pain with the brand */}
        <div
          style={{
            fontSize:      26,
            fontWeight:    700,
            fontFamily:    SANS,
            color:         C.accent,
            letterSpacing: -0.5,
            marginTop:     14,
            opacity:       pivot.opacity,
            transform:     `translateY(${pivot.translateY}px)`,
            filter:        `blur(${pivot.blur}px)`,
          }}
        >
          Not with Apex.
        </div>

        {/* Pipeline funnel — bar 2 beat 1 (f60). Previews product domain. */}
        <div style={{ marginTop: 52, opacity: funnelOpacity }}>
          <PipelineFunnel frame={funnelLocalFrame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — DEMO  (local 0–120f · 4s · 2 bars)
//
// The deal card arcs in from bottom-left — product becomes the hero.
// Blur resolves on settle (rack focus — the camera found its subject).
// Directional 3D rotation, born moving from frame 1. Prism rim for depth.
// Text arrives AFTER the card has settled — spatial hierarchy precedes message.
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

  // Directional drift — born moving from frame 1, never oscillates
  const rotY = -8 + frame * 0.065;   // drifts from -8° toward positive
  const rotX =  3 - frame * 0.026;   // slight tilt decays through 0°

  // Float starts only after card settles (f40) — no motion-on-motion chaos
  const floatY = useHeroFloatDelayed(40, 6, 88);

  // Context copy — beat 3 of bar 3 = local f30 (text arrives last — after card settles)
  const labelT = useCinematicTextReveal(30, 14, 6);
  const subT   = useCinematicTextReveal(42, 12, 5);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Orange glow trails behind card's resting position */}
      <div
        style={{
          position:     "absolute",
          left:         "50%",
          top:          "50%",
          transform:    "translate(-50%, -50%)",
          width:        860,
          height:       860,
          borderRadius: "50%",
          background:   `radial-gradient(ellipse,
            rgba(249,115,22,${0.10 * glow + beat}) 0%, transparent 65%)`,
        }}
      />

      {/* Card — centered with arc offset + float + 3D rotation.
          Three nested divs: position / arc+float / 3D rotation. */}
      <div
        style={{
          position:    "absolute",
          left:        "50%",
          top:         "50%",
          transform:   "translateX(-50%) translateY(-50%)",
          perspective: "1100px",
        }}
      >
        <div
          style={{
            transform: `
              translateX(${arcEntry.translateX}px)
              translateY(${arcEntry.translateY + floatY}px)
              scale(${cardScale})
            `,
            filter: `blur(${cardBlur}px) drop-shadow(0 24px 64px rgba(249,115,22,0.22))`,
          }}
        >
          <div
            style={{
              transform: `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
            }}
          >
            <DealCard rotY={rotY} rotX={rotX} scale={1} />
          </div>
        </div>
      </div>

      {/* Label above card — text arrives after card settles */}
      <div
        style={{
          position:  "absolute",
          left:      0,
          right:     0,
          top:       "15%",
          textAlign: "center",
          opacity:   labelT.opacity,
          transform: `translateY(${labelT.translateY}px)`,
          filter:    `blur(${labelT.blur}px)`,
        }}
      >
        <div
          style={{
            display:       "inline-flex",
            alignItems:    "center",
            gap:           8,
            fontSize:      13,
            fontWeight:    700,
            color:         C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily:    SANS,
          }}
        >
          <div
            style={{
              width:        7,
              height:       7,
              borderRadius: "50%",
              background:   C.green,
              boxShadow:    `0 0 6px ${C.green}`,
            }}
          />
          Your next big close
        </div>
      </div>

      {/* Supporting detail — below card */}
      <div
        style={{
          position:  "absolute",
          left:      0,
          right:     0,
          bottom:    "13%",
          textAlign: "center",
          opacity:   subT.opacity,
          transform: `translateY(${subT.translateY}px)`,
          filter:    `blur(${subT.blur}px)`,
        }}
      >
        <div
          style={{
            fontSize:      18,
            color:         C.body,
            fontFamily:    SANS,
            letterSpacing: -0.2,
          }}
        >
          Every deal, always visible.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Features Data ────────────────────────────────────────────────────────────
// Three features that directly address the "42% die" pain.
// Each body is one idea only. Concrete, not abstract.

const FEATURES = [
  {
    icon:  "◈",
    title: "AI Deal Scoring",
    body:  "Know which deals will close weeks in advance.",
    delay: 0,    // beat 1 of bar 5
  },
  {
    icon:  "♦",
    title: "Stall Detection",
    body:  "Get alerted before a deal goes cold.",
    delay: 15,   // beat 2 of bar 5
  },
  {
    icon:  "◎",
    title: "Revenue Forecast",
    body:  "Accurate pipeline revenue, every month.",
    delay: 30,   // beat 3 of bar 5
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — FEATURES  (local 0–120f · 4s · 2 bars)
//
// Card persists but recedes via depthDeemphasis — becomes the depth anchor.
// Three features enter left-to-right, one per beat (f0, f15, f30).
// Section headline appears at bar 6 beat 1 (local f60).
// Motion makes room: card steps back AS features arrive.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneFeatures: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 14);
  const glow    = useBreathingGlow(85, 0.35, 0.88);

  // Card de-emphasis — smooth over 28 frames from local f0
  const deempT = easeInOut3(rawProgress(frame, 0, 28));
  const deemph = depthDeemphasis(deempT);

  // Continues directional drift from where scene 2 left off.
  // Scene 2 ended at frame 120: rotY ≈ -8+120*0.065=−0.2°, rotX≈3−120*0.026=−0.12°
  const rotY  = -0.2 + frame * 0.04;
  const rotX  = -0.12 - frame * 0.012;
  const floatY = Math.sin((frame / 88) * 2 * Math.PI + 1.4) * 5; // phase offset for variety

  // Section headline — bar 6 beat 1 = local f60
  const headlineT = useCinematicTextReveal(60, 16, 7);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Glow shifts right to support card's receded position */}
      <div
        style={{
          position:     "absolute",
          right:        -80,
          top:          "35%",
          width:        700,
          height:       700,
          borderRadius: "50%",
          background:   `radial-gradient(ellipse,
            rgba(249,115,22,${0.06 * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Card — right half, de-emphasised depth anchor.
          When a new hero arrives, the card must make room. */}
      <div
        style={{
          position:  "absolute",
          left:      "55%",
          top:       "50%",
          transform: "translateY(-50%)",
          perspective: "1100px",
          opacity:   deemph.opacity,
          filter:    `blur(${deemph.blur}px)`,
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
          <DealCard rotY={rotY} rotX={rotX} scale={0.82} />
        </div>
      </div>

      {/* Features list — left half */}
      <div
        style={{
          position:  "absolute",
          left:      64,
          top:       "50%",
          transform: "translateY(-50%)",
          width:     480,
        }}
      >
        {/* Section headline — bar 6 beat 1 */}
        <div
          style={{
            fontSize:      13,
            fontWeight:    700,
            color:         C.accent,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontFamily:    SANS,
            marginBottom:  38,
            opacity:       headlineT.opacity,
            transform:     `translateY(${headlineT.translateY}px)`,
            filter:        `blur(${headlineT.blur}px)`,
          }}
        >
          Built for closers
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
                transform:    `translateX(${(1 - t) * -40}px)`,
              }}
            >
              {/* Icon chip + title */}
              <div
                style={{
                  display:     "flex",
                  alignItems:  "center",
                  gap:         12,
                  marginBottom: 7,
                }}
              >
                <div
                  style={{
                    width:          34,
                    height:         34,
                    borderRadius:   10,
                    background:     `${C.accent}14`,
                    border:         `1.5px solid ${C.accent}28`,
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    fontSize:       14,
                    color:          C.accent,
                    flexShrink:     0,
                  }}
                >
                  {feat.icon}
                </div>
                <div
                  style={{
                    fontSize:      22,
                    fontWeight:    800,
                    color:         C.text,
                    fontFamily:    SANS,
                    letterSpacing: -0.4,
                  }}
                >
                  {feat.title}
                </div>
              </div>

              {/* Body — one idea per feature */}
              <div
                style={{
                  fontSize:    15,
                  color:       C.body,
                  fontFamily:  SANS,
                  lineHeight:  1.6,
                  paddingLeft: 46,
                  marginBottom: 10,
                }}
              >
                {feat.body}
              </div>

              {/* Wipe underline — hard-synced to follow the feature entrance */}
              <div
                style={{
                  marginLeft:   46,
                  width:        `${wipeW}%`,
                  maxWidth:     200,
                  height:       1.5,
                  background:   `linear-gradient(90deg, ${C.accent}66, transparent)`,
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

// ─── Metrics Data ─────────────────────────────────────────────────────────────
// Concrete, specific — not "work better" but actual numbers.
// "43% faster" > "much faster". "2.1×" > "more deals". "31 days" > "saves time".

const METRICS = [
  { value: "43%",  label: "FASTER CLOSE",  sub: "vs. industry average" },
  { value: "2.1×", label: "MORE DEALS",    sub: "closed per rep per quarter" },
  { value: "31",   label: "DAYS SAVED",    sub: "per rep every quarter" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — METRICS  (local 0–60f · 2s · 1 bar)
//
// Three proof stats. Each owns exactly one third of 1080px canvas = 360px.
// Built on the proven flex-row metric pattern — 140px dominants fill each row.
// Hard-synced one per beat: f0, f15, f30. Nothing else competes.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneMetrics: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(60, 12);
  const glow    = useBreathingGlow(60, 0.48, 1.0);
  const beat    = beatPulse(frame) * 0.07;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Central orange glow — pulses with the beat */}
      <div
        style={{
          position:     "absolute",
          left:         "50%",
          top:          "50%",
          transform:    "translate(-50%, -50%)",
          width:        800,
          height:       800,
          borderRadius: "50%",
          background:   `radial-gradient(ellipse,
            rgba(249,115,22,${0.08 * glow + beat}) 0%, transparent 65%)`,
        }}
      />

      {/* Three metric rows — each owns exactly 360px (1080 ÷ 3) */}
      <div
        style={{
          position:      "absolute",
          inset:         0,
          display:       "flex",
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
                flex:           1,             // each row = exactly 360px
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                textAlign:      "center",
                borderBottom:   i < 2 ? `1px solid ${C.border}` : "none",
                opacity,
                transform:      `translateY(${translateY}px)`,
                filter:         `blur(${blur}px)`,
              }}
            >
              {/* Dominant value — 140px, the only focal point */}
              <div
                style={{
                  fontSize:      140,
                  fontWeight:    900,
                  fontFamily:    SANS,
                  color:         C.text,
                  letterSpacing: -6,
                  lineHeight:    0.88,
                  marginBottom:  10,
                }}
              >
                {m.value}
              </div>

              {/* Label */}
              <div
                style={{
                  fontSize:      21,
                  fontWeight:    700,
                  fontFamily:    SANS,
                  color:         C.accent,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom:  6,
                }}
              >
                {m.label}
              </div>

              {/* Context sub */}
              <div
                style={{
                  fontSize:      15,
                  color:         C.body,
                  fontFamily:    SANS,
                  letterSpacing: -0.1,
                }}
              >
                {m.sub}
              </div>

              {/* Accent dot — brief centred separator */}
              <div
                style={{
                  width:        5,
                  height:       5,
                  borderRadius: "50%",
                  background:   C.accent,
                  marginTop:    14,
                  opacity:      0.5,
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
// SCENE 5 — CTA  (local 0–120f · 4s · 2 bars)
//
// Background warms and deepens — tone-shift signals resolution and confidence.
// "Close / faster." in two lines. One button. One URL. Nothing extra.
// Trust was built in the preceding four scenes. This just needs to convert.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 10);
  const glow    = useBreathingGlow(80, 0.55, 1.0);
  const beat    = beatPulse(frame) * 0.14;

  // Glow settles to zero by local f30 — clean still background at the end
  const glowFade = 1 - easeInOut3(rawProgress(frame, 0, 30));

  // Background warms from C.bg to a slightly deeper near-black
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
      {/* Background deepens warmly */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(145deg, #060403 0%, #0D0A06 100%)`,
          opacity:    bgT,
        }}
      />
      <AbsoluteFill style={{ background: C.bg, opacity: 1 - bgT }} />

      {/* Orange + amber glow — breathes warmly before fading */}
      <div
        style={{
          position:     "absolute",
          left:         "50%",
          top:          "46%",
          transform:    "translate(-50%, -50%)",
          width:        880,
          height:       880,
          borderRadius: "50%",
          background:   `radial-gradient(ellipse,
            rgba(249,115,22,${(0.16 * glow + beat) * glowFade}) 0%,
            rgba(251,191,36,${0.06 * glow * glowFade}) 45%,
            transparent 70%)`,
        }}
      />

      {/* Content — vertically centred, inside safe zone */}
      <div
        style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
          textAlign:      "center",
          padding:        "0 80px",
        }}
      >
        {/* Wordmark — very subtle brand echo above the headline */}
        <div
          style={{
            fontSize:      12,
            fontWeight:    700,
            color:         `${C.accent}55`,
            fontFamily:    SANS,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            marginBottom:  44,
            opacity:       line1.opacity,
          }}
        >
          Apex
        </div>

        {/* Headline — two lines, hero + accent */}
        {[
          { text: "Close",   t: line1, color: C.text   },
          { text: "faster.", t: line2, color: C.accent },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize:      96,
              fontWeight:    900,
              fontFamily:    SANS,
              color:         l.color,
              letterSpacing: -5,
              lineHeight:    0.88,
              marginBottom:  i === 0 ? 6 : 0,
              opacity:       l.t.opacity,
              transform:     `translateY(${l.t.translateY}px)`,
              filter:        `blur(${l.t.blur}px)`,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* Sub copy — start free, no friction */}
        <div
          style={{
            fontSize:     19,
            color:        C.body,
            fontFamily:   SANS,
            marginTop:    28,
            marginBottom: 44,
            opacity:      sub.opacity,
            transform:    `translateY(${sub.translateY}px)`,
            filter:       `blur(${sub.blur}px)`,
          }}
        >
          Start free. No card needed.
        </div>

        {/* CTA Button */}
        <div
          style={{
            display:         "inline-flex",
            alignItems:      "center",
            gap:             10,
            background:      C.accent,
            borderRadius:    100,
            padding:         "18px 48px",
            boxShadow:       `0 0 44px ${C.accent}44, 0 4px 20px rgba(0,0,0,0.32)`,
            marginBottom:    22,
            opacity:         btnT,
            transform:       `scale(${0.88 + btnT * 0.12})`,
            transformOrigin: "center",
          }}
        >
          <span
            style={{
              fontSize:      20,
              fontWeight:    800,
              color:         C.white,
              fontFamily:    SANS,
              letterSpacing: -0.3,
            }}
          >
            Try Apex free
          </span>
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.70)", fontWeight: 700 }}>
            →
          </span>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize:      15,
            color:         "rgba(250,250,249,0.22)",
            fontFamily:    MONO,
            letterSpacing: "0.04em",
            opacity:       urlT.opacity,
            transform:     `translateY(${urlT.translateY}px)`,
          }}
        >
          apex.io
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Cue Sheet ────────────────────────────────────────────────────────────────
// Every frame-level animation event labelled for music/SFX generation.
// At 30fps, 120 BPM: 1 beat = 15 frames, 1 bar = 60 frames.

export const ApexAdCues: CueEvent[] = [
  // ── Scene 1: Hook (f0–f120) ──────────────────────────────────────────────
  { frame: 0,   type: "SCENE_CUT",   label: 'Hook begins — "42%" pain stat on dark',        intensity: "hard",   notes: "Strong impact hit. Orange glow pulses as brand signal from frame 0." },
  { frame: 0,   type: "TEXT_IMPACT", label: '"42%" dominant stat enters',                    intensity: "hard",   notes: "168px number. Blur-resolve from 12px. Mute-proof hook." },
  { frame: 15,  type: "TEXT_REVEAL", label: '"of deals die before closing." enters',         intensity: "soft",   notes: "Beat 2. Supporting context. One idea only." },
  { frame: 30,  type: "WIPE",        label: "Accent gradient rule wipes left→right",          intensity: "medium", notes: "Beat 3. Short directional sweep sound." },
  { frame: 45,  type: "TEXT_REVEAL", label: '"Not with Apex." pivot',                        intensity: "medium", notes: "Beat 4. Brand resolution of the pain. Orange accent." },
  { frame: 60,  type: "BEAT_LOCK",   label: "Pipeline funnel bars reveal staggered",          intensity: "medium", notes: "Bar 2. Bars build left-to-right. Closing bar glows orange." },

  // ── Scene 2: Demo (f120–f240) ─────────────────────────────────────────────
  { frame: 120, type: "SCENE_CUT",   label: "→ Demo: Deal card arc entry begins",            intensity: "hard",   notes: "Bar 3. Hard cut. Card swoops in from bottom-left. Product becomes hero." },
  { frame: 120, type: "HERO_ENTRY",  label: "Deal card (Acme Corp $840K) arcs in",           intensity: "hard",   notes: "Rising swoosh + impact on settle (~f150). Blur resolves over 28 frames." },
  { frame: 135, type: "AMBIENT",     label: "Card blur resolves — rack focus",                intensity: "soft",   notes: "Beat 2 bar 3. Soft shimmer as card sharpens." },
  { frame: 150, type: "TEXT_REVEAL", label: '"Your next big close" + "Every deal visible."', intensity: "soft",   notes: "Beat 3 bar 3. Text arrives after card settled. Hierarchy is temporal." },

  // ── Scene 3: Features (f240–f360) ─────────────────────────────────────────
  { frame: 240, type: "SCENE_CUT",   label: "→ Features: Card recedes, list enters",         intensity: "hard",   notes: "Bar 5. Hard cut. Card de-emphasises — motion makes room for incoming." },
  { frame: 240, type: "OBJECT_LAND", label: 'Feature 1: "AI Deal Scoring"',                  intensity: "medium", notes: "Beat 1 bar 5. Left slide + wipe underline. UI click or soft snap." },
  { frame: 255, type: "OBJECT_LAND", label: 'Feature 2: "Stall Detection"',                  intensity: "medium", notes: "Beat 2. Staggered entrance." },
  { frame: 270, type: "OBJECT_LAND", label: 'Feature 3: "Revenue Forecast"',                 intensity: "medium", notes: "Beat 3. Final feature of the three." },
  { frame: 300, type: "TEXT_REVEAL", label: '"Built for closers" headline',                   intensity: "soft",   notes: "Bar 6. Section headline appears after features settled." },

  // ── Scene 4: Metrics (f360–f420) ──────────────────────────────────────────
  { frame: 360, type: "SCENE_CUT",   label: '→ Metrics: "43%" enters',                       intensity: "hard",   notes: "Bar 7. Hard impact. Proof scene. Each metric gets its beat." },
  { frame: 360, type: "STAT_BUILD",  label: '"43% Faster Close Rate"',                       intensity: "hard",   notes: "Beat 1. 140px dominant value. Heavy impact + decay." },
  { frame: 375, type: "STAT_BUILD",  label: '"2.1× More Deals"',                             intensity: "hard",   notes: "Beat 2. Echo of beat 1." },
  { frame: 390, type: "STAT_BUILD",  label: '"31 Days Saved"',                               intensity: "hard",   notes: "Beat 3. Third and final metric." },

  // ── Scene 5: CTA (f420–f540) ──────────────────────────────────────────────
  { frame: 420, type: "SCENE_CUT",   label: "→ CTA: Background warms and deepens",           intensity: "hard",   notes: "Bar 8. Tone shift — resolution. Warmly darker. Feels decisive." },
  { frame: 435, type: "TEXT_IMPACT", label: '"Close / faster." headline',                    intensity: "medium", notes: "Beat 2. Two-line hero. Cinematic blur-reveal." },
  { frame: 450, type: "CTA_REVEAL",  label: '"Try Apex free" button + apex.io URL',          intensity: "medium", notes: "Beat 3. Direct CTA. Ad ends at f540." },
];

// ─── Root Export ──────────────────────────────────────────────────────────────
// Camera motion wrapper applied to ALL scene content via a single outer div.
// Linear interpolation only — no easing on camera (easing reads as consumer Ken Burns).
// 6.2% dolly push-in + ±0.7° roll + 22px pan over 18 seconds.
// Roll passes near 0° during the metrics scene (numbers must stay level).

const TOTAL_FRAMES = 540;

export const ApexAd: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraProg = frame / TOTAL_FRAMES;
  const cameraZoom = 1.0 + cameraProg * 0.062;  // linear dolly push-in

  // Roll passes near 0° at f360 (metrics) so numbers stay legible
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
      {/* ONE camera motion wrapper — all scene content lives inside this */}
      <div
        style={{
          position:        "absolute",
          inset:           0,
          transform:       `scale(${cameraZoom}) rotateZ(${cameraRoll}deg) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`,
          transformOrigin: "center center",
        }}
      >
        <Sequence from={0}   durationInFrames={120}><SceneHook     /></Sequence>
        <Sequence from={120} durationInFrames={120}><SceneDemo     /></Sequence>
        <Sequence from={240} durationInFrames={120}><SceneFeatures /></Sequence>
        <Sequence from={360} durationInFrames={60}> <SceneMetrics  /></Sequence>
        <Sequence from={420} durationInFrames={120}><SceneCTA      /></Sequence>
      </div>
    </AbsoluteFill>
  );
};
