/**
 * ApexAd3D — "Close faster." — Reference 3D Architecture Implementation
 *
 * Format:  1:1 square (1080 × 1080)
 * Duration: 540 frames @ 30fps = 18 seconds
 *
 * ─── What's Different from ApexAd.tsx ──────────────────────────────────────────
 *
 * TWO-LAYER ARCHITECTURE:
 *   [Layer 1] CSS backgrounds + glow divs (behind ThreeScene)
 *   [Layer 2] ThreeScene (transparent canvas — real 3D card + particles + lights)
 *   [Layer 3] CSS text + UI overlays (always on top, DOM order handles z-layering)
 *
 * SCENE 2 (Demo) — The key upgrade:
 *   CSS prism-rim card  →  GlassCard (MeshPhysicalMaterial: transmission, roughness, metalness)
 *   CSS rotateX/Y fake 3D  →  Real Three.js geometry with Environment IBL reflections
 *   CSS radial glow  →  Point lights in R3F scene (glow visible through transparent canvas)
 *   22 div particles (later scenes)  →  InstancedMesh ParticleField (ambient)
 *
 * ALL OTHER SCENES (Hook, Features, Metrics, CTA) are identical to ApexAd.tsx.
 * The CSS prism card is retained for SceneFeatures (de-emphasised on right).
 *
 * ─── Architecture Pattern for SceneDemo ────────────────────────────────────────
 *
 *   <AbsoluteFill opacity={fadeOut}>
 *     <AbsoluteFill background />          ← CSS (Layer 1)
 *     <OrangeGlowDiv />                    ← CSS visible through ThreeScene
 *     <ThreeScene enableBloom>             ← Layer 2 (DOM order: below text)
 *       <GlassCard />
 *       <ParticleField mode="ambient" />
 *     </ThreeScene>
 *     <TextLabel top="15%" />              ← Layer 3 (DOM order: above ThreeScene)
 *     <TextLabel bottom="13%" />           ← Layer 3
 *   </AbsoluteFill>
 *
 * DOM order is the z-ordering mechanism — no explicit z-index needed.
 * ThreeCanvas (alpha=true) is transparent, so CSS glow div behind it shows through.
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
import { ThreeScene, GlassCard, ParticleField } from "../utils/three";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      "#09090B",
  surface: "#18181B",
  accent:  "#F97316",
  accent2: "#FBBF24",
  text:    "#FAFAF9",
  body:    "#A1A1AA",
  border:  "#3F3F46",
  green:   "#22C55E",
  white:   "#FFFFFF",
} as const;

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

const BEAT = 15; // 120 BPM @ 30fps

function beatPulse(frame: number): number {
  const phase = frame % BEAT;
  return phase < 6 ? Math.sin((phase / 6) * Math.PI) : 0;
}

// ─── Prism Rim (still used in SceneFeatures CSS card) ─────────────────────────
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

// ─── CSS DealCard (used only in SceneFeatures as de-emphasised card) ──────────
interface DealCardProps { rotY?: number; rotX?: number; scale?: number; }
const PIPELINE_STAGES = ["Prospect", "Qualified", "Proposal", "Closing", "Won"] as const;
const ACTIVE_STAGE = 3;

const DealCard: React.FC<DealCardProps> = ({ rotY = 0, rotX = 0, scale = 1 }) => {
  const S = scale;
  return (
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
        <div style={{ height: 3 * S, background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})` }} />
        <div style={{ padding: `${22 * S}px ${24 * S}px` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 * S }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 * S }}>
              <div style={{ width: 8 * S, height: 8 * S, borderRadius: "50%", background: C.green, boxShadow: `0 0 ${6 * S}px ${C.green}88` }} />
              <span style={{ fontSize: 11 * S, fontWeight: 700, color: C.body, letterSpacing: "0.1em", textTransform: "uppercase" }}>Active Deal</span>
            </div>
            <span style={{ fontSize: 11 * S, color: C.body, fontFamily: MONO }}>LIVE</span>
          </div>
          <div style={{ fontSize: 17 * S, fontWeight: 800, color: C.text, letterSpacing: -0.4, marginBottom: 3 * S, lineHeight: 1.2 }}>
            Acme Corp · Q1 Expansion
          </div>
          <div style={{ fontSize: 12 * S, color: C.body, marginBottom: 18 * S }}>Jamie K. · Closes Mar 28, 2026</div>
          <div style={{ fontSize: 44 * S, fontWeight: 900, color: C.text, fontFamily: MONO, letterSpacing: -2, marginBottom: 16 * S, lineHeight: 1 }}>
            $840,000
          </div>
          <div style={{ marginBottom: 18 * S }}>
            <div style={{ display: "flex", gap: 4 * S, marginBottom: 6 * S }}>
              {PIPELINE_STAGES.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3 * S, background: i < ACTIVE_STAGE ? `${C.accent}55` : i === ACTIVE_STAGE ? C.accent : C.border, borderRadius: 2 * S }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 9 * S, color: C.body, letterSpacing: "0.06em", textTransform: "uppercase" }}>{PIPELINE_STAGES[0]}</span>
              <span style={{ fontSize: 9 * S, color: C.accent, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>{PIPELINE_STAGES[ACTIVE_STAGE]} ←</span>
              <span style={{ fontSize: 9 * S, color: C.body, letterSpacing: "0.06em", textTransform: "uppercase" }}>{PIPELINE_STAGES[PIPELINE_STAGES.length - 1]}</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: `${10 * S}px ${14 * S}px`, background: `${C.accent}12`, borderRadius: 10 * S, border: `1px solid ${C.accent}20` }}>
            {[{ val: "94%", label: "Win Prob", color: C.green }, { val: "12", label: "Days Left", color: C.accent }, { val: "3", label: "Deals Won", color: C.text }].map((stat, si) => (
              <React.Fragment key={si}>
                {si > 0 && <div style={{ width: 1, height: 28 * S, background: C.border }} />}
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22 * S, fontWeight: 900, color: stat.color, fontFamily: si === 0 ? SANS : SANS, lineHeight: 1 }}>{stat.val}</div>
                  <div style={{ fontSize: 9 * S, color: C.body, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 * S }}>{stat.label}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Pipeline Funnel ──────────────────────────────────────────────────────────
const FUNNEL_BARS = [
  { label: "Prospect",  height: 130, color: C.body,   isHero: false },
  { label: "Qualified", height: 104, color: C.body,   isHero: false },
  { label: "Proposal",  height:  76, color: C.body,   isHero: false },
  { label: "Closing",   height:  48, color: C.accent, isHero: true  },
  { label: "Won",       height:  24, color: C.green,  isHero: false },
] as const;

const PipelineFunnel: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 18, justifyContent: "center" }}>
    {FUNNEL_BARS.map((bar, i) => {
      const t = easeOut4(rawProgress(frame, i * 7, 20));
      return (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: t }}>
          <div style={{ width: 26, height: bar.height * t, background: bar.isHero ? `linear-gradient(180deg, ${bar.color}66 0%, ${bar.color} 100%)` : `linear-gradient(180deg, ${bar.color}28 0%, ${bar.color}60 100%)`, borderRadius: 5, boxShadow: bar.isHero ? `0 0 16px ${C.accent}44` : undefined }} />
          <span style={{ fontSize: 10, color: bar.isHero ? C.accent : C.body, fontWeight: bar.isHero ? 700 : 400, letterSpacing: "0.07em", textTransform: "uppercase", fontFamily: SANS }}>{bar.label}</span>
        </div>
      );
    })}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK  (identical to ApexAd.tsx)
// ═══════════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 14);
  const glow    = useBreathingGlow(90, 0.40, 1.0);
  const beat    = beatPulse(frame) * 0.10;

  const badge    = useCinematicTextReveal(0,  14, 7);
  const pain     = useCinematicTextReveal(5,  20, 12);
  const sub      = useCinematicTextReveal(15, 16, 8);
  const wipeRule = usePremiumWipe(30, 22);
  const pivot    = useCinematicTextReveal(45, 16, 8);

  const funnelLocalFrame = Math.max(0, frame - 60);
  const funnelOpacity    = clamp(easeOut3(rawProgress(frame, 60, 20)) * 3, 0, 1);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />
      <div style={{ position: "absolute", left: "50%", top: "42%", transform: "translate(-50%, -50%)", width: 880, height: 880, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(249,115,22,${0.14 * glow + beat}) 0%, rgba(251,191,36,${0.05 * glow}) 45%, transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 90px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `${C.accent}18`, border: `1px solid ${C.accent}30`, borderRadius: 100, padding: "6px 16px", marginBottom: 36, opacity: badge.opacity, transform: `translateY(${badge.translateY}px)`, filter: `blur(${badge.blur}px)` }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: SANS }}>Apex CRM</span>
        </div>
        <div style={{ fontSize: 168, fontWeight: 900, fontFamily: SANS, color: C.text, letterSpacing: -10, lineHeight: 0.88, opacity: pain.opacity, transform: `translateY(${pain.translateY}px)`, filter: `blur(${pain.blur}px)` }}>42%</div>
        <div style={{ width: `${wipeRule}%`, maxWidth: 200, height: 2, background: `linear-gradient(90deg, ${C.accent}, ${C.accent2})`, borderRadius: 1, marginTop: 18, marginBottom: 22 }} />
        <div style={{ fontSize: 22, fontWeight: 400, fontFamily: SANS, color: C.body, letterSpacing: -0.2, lineHeight: 1.5, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)`, filter: `blur(${sub.blur}px)` }}>of deals die before closing.</div>
        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: SANS, color: C.accent, letterSpacing: -0.5, marginTop: 14, opacity: pivot.opacity, transform: `translateY(${pivot.translateY}px)`, filter: `blur(${pivot.blur}px)` }}>Not with Apex.</div>
        <div style={{ marginTop: 52, opacity: funnelOpacity }}>
          <PipelineFunnel frame={funnelLocalFrame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — DEMO  — 3D UPGRADE
//
// The CSS prism-rim card is replaced by a GlassCard (MeshPhysicalMaterial).
// Three-layer pattern:
//   CSS background + glow  →  ThreeScene (GlassCard + particles)  →  CSS text
//
// The orange glow div is positioned BEFORE the ThreeScene in DOM order,
// so it renders BEHIND the ThreeCanvas. Since ThreeCanvas has alpha=true,
// the glow shows through the transparent areas of the canvas around the card.
//
// Text labels are positioned AFTER the ThreeScene in DOM order,
// so they render ON TOP of the canvas and its 3D content.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneDemo: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 14);
  const glow    = useBreathingGlow(80, 0.45, 1.0);
  const beat    = beatPulse(frame) * 0.10;

  // Context copy — text arrives after card settles (same timing as ApexAd)
  const labelT = useCinematicTextReveal(30, 14, 6);
  const subT   = useCinematicTextReveal(42, 12, 5);

  // Deal data overlay — appears on top of the 3D card (centered, matching card position)
  // Card arcs in and settles at center; this overlay tracks the same reveal timing
  const dataReveal = useSoftScaleIn(14, 0.92, 24);
  const dataOpacity = clamp(easeOut3(rawProgress(frame, 10, 22)) * 2.5, 0, 1);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* ── Layer 1: CSS background ─────────────────────────────────────────── */}
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Orange glow — positioned BEFORE ThreeScene so it renders behind it.
          With alpha=true on ThreeCanvas, this glow shows through the transparent
          canvas areas around the 3D card. */}
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

      {/* ── Layer 2: ThreeScene — transparent, renders 3D card + particles ──── */}
      {/* GlassCard replaces the CSS prism-rim DealCard.
          ParticleField adds ambient atmospheric depth. */}
      <ThreeScene enableBloom bloomIntensity={0.9} bloomThreshold={0.3}>
        <GlassCard
          entryFrame={0}
          fromX={-110}
          fromY={150}
          exitFrame={120}
          accentColor={C.accent}
          cardColor="#15151A"
          roughness={0.07}
          metalness={0.12}
          transmission={0.18}
          envMapIntensity={2.0}
        />
        {/* Ambient particles — subtle floating dots that fill the 3D space */}
        <ParticleField
          count={420}
          mode="ambient"
          spread={2.8}
          color={C.accent}
          size={0.016}
          opacity={0.18}
        />
        {/* Secondary warm particle layer */}
        <ParticleField
          count={180}
          mode="ambient"
          spread={2.2}
          spreadZ={0.1}
          color={C.accent2}
          size={0.012}
          opacity={0.12}
          speed={0.7}
        />
      </ThreeScene>

      {/* ── Layer 3: CSS text overlays — positioned AFTER ThreeScene ──────────
          DOM order ensures these render ON TOP of the ThreeCanvas. */}

      {/* "Your next big close" label — top of frame */}
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
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: SANS }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          Your next big close
        </div>
      </div>

      {/* Deal data panel — floats over the 3D card at center
          Shows key deal numbers on top of the glass surface */}
      <div
        style={{
          position:        "absolute",
          left:            "50%",
          top:             "50%",
          transform:       `translate(-50%, -50%) scale(${dataReveal})`,
          transformOrigin: "center center",
          opacity:         dataOpacity,
          textAlign:       "center",
          pointerEvents:   "none",
        }}
      >
        {/* Company + deal info — displayed as white text over the glass card */}
        <div style={{ fontSize: 13, fontWeight: 700, color: C.body, letterSpacing: "0.10em", textTransform: "uppercase", fontFamily: SANS, marginBottom: 8 }}>
          Acme Corp · Q1 Expansion
        </div>
        <div style={{ fontSize: 64, fontWeight: 900, color: C.text, fontFamily: MONO, letterSpacing: -3, lineHeight: 1, marginBottom: 6 }}>
          $840K
        </div>
        <div style={{ display: "inline-flex", gap: 24, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.green, fontFamily: MONO }}>94%</div>
            <div style={{ fontSize: 9, color: C.body, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Win Prob</div>
          </div>
          <div style={{ width: 1, height: 32, background: C.border }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.accent, fontFamily: SANS }}>Closing</div>
            <div style={{ fontSize: 9, color: C.body, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>Stage</div>
          </div>
        </div>
      </div>

      {/* "Every deal, always visible." — below card */}
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
        <div style={{ fontSize: 18, color: C.body, fontFamily: SANS, letterSpacing: -0.2 }}>
          Every deal, always visible.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Features Data ────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: "◈", title: "AI Deal Scoring",  body: "Know which deals will close weeks in advance.", delay: 0  },
  { icon: "♦", title: "Stall Detection",  body: "Get alerted before a deal goes cold.",          delay: 15 },
  { icon: "◎", title: "Revenue Forecast", body: "Accurate pipeline revenue, every month.",        delay: 30 },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — FEATURES  (CSS DealCard retained as de-emphasised depth anchor)
// ═══════════════════════════════════════════════════════════════════════════════

const SceneFeatures: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 14);
  const glow    = useBreathingGlow(85, 0.35, 0.88);

  const deempT  = easeInOut3(rawProgress(frame, 0, 28));
  const deemph  = depthDeemphasis(deempT);

  // Continues directional drift from Scene 2 end: rotY ≈ -8+120*0.065 ≈ -0.2°
  const rotY  = -0.2 + frame * 0.04;
  const rotX  = -0.12 - frame * 0.012;
  const floatY = Math.sin((frame / 88) * 2 * Math.PI + 1.4) * 5;

  const headlineT = useCinematicTextReveal(60, 16, 7);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />
      <div style={{ position: "absolute", right: -80, top: "35%", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(249,115,22,${0.06 * glow}) 0%, transparent 65%)` }} />

      {/* CSS DealCard retained for this scene — de-emphasised on right side */}
      <div style={{ position: "absolute", left: "55%", top: "50%", transform: "translateY(-50%)", perspective: "1100px", opacity: deemph.opacity, filter: `blur(${deemph.blur}px)` }}>
        <div style={{ transform: `translateY(${floatY}px) rotateY(${rotY}deg) rotateX(${rotX}deg) scale(${deemph.scale})` }}>
          <DealCard rotY={rotY} rotX={rotX} scale={0.82} />
        </div>
      </div>

      <div style={{ position: "absolute", left: 64, top: "50%", transform: "translateY(-50%)", width: 480 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: SANS, marginBottom: 38, opacity: headlineT.opacity, transform: `translateY(${headlineT.translateY}px)`, filter: `blur(${headlineT.blur}px)` }}>
          Built for closers
        </div>
        {FEATURES.map((feat, i) => {
          const t      = easeOut4(rawProgress(frame, feat.delay, 24));
          const wipeW  = easeInOut3(rawProgress(frame, feat.delay + 14, 22)) * 100;
          const opacity = clamp(t / 0.25, 0, 1);
          return (
            <div key={i} style={{ marginBottom: i < 2 ? 36 : 0, opacity, transform: `translateX(${(1 - t) * -40}px)` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 7 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: `${C.accent}14`, border: `1.5px solid ${C.accent}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: C.accent, flexShrink: 0 }}>{feat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: SANS, letterSpacing: -0.4 }}>{feat.title}</div>
              </div>
              <div style={{ fontSize: 15, color: C.body, fontFamily: SANS, lineHeight: 1.6, paddingLeft: 46, marginBottom: 10 }}>{feat.body}</div>
              <div style={{ marginLeft: 46, width: `${wipeW}%`, maxWidth: 200, height: 1.5, background: `linear-gradient(90deg, ${C.accent}66, transparent)`, borderRadius: 1 }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Metrics Data ─────────────────────────────────────────────────────────────
const METRICS = [
  { value: "43%",  label: "FASTER CLOSE",  sub: "vs. industry average" },
  { value: "2.1×", label: "MORE DEALS",    sub: "closed per rep per quarter" },
  { value: "31",   label: "DAYS SAVED",    sub: "per rep every quarter" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — METRICS  (identical to ApexAd.tsx)
// ═══════════════════════════════════════════════════════════════════════════════

const SceneMetrics: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(60, 12);
  const glow    = useBreathingGlow(60, 0.48, 1.0);
  const beat    = beatPulse(frame) * 0.07;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />
      <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 800, height: 800, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(249,115,22,${0.08 * glow + beat}) 0%, transparent 65%)` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        {METRICS.map((m, i) => {
          const startF     = i * BEAT;
          const tOpacity   = easeOut3(rawProgress(frame, startF, 22));
          const tTranslate = easeOut5(rawProgress(frame, startF, 26));
          const tBlur      = easeOut4(rawProgress(frame, startF, 30));
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", opacity: clamp(tOpacity * 3, 0, 1), transform: `translateY(${(1 - tTranslate) * 28}px)`, filter: `blur(${(1 - tBlur) * 10}px)` }}>
              <div style={{ fontSize: 140, fontWeight: 900, fontFamily: SANS, color: C.text, letterSpacing: -6, lineHeight: 0.88, marginBottom: 10 }}>{m.value}</div>
              <div style={{ fontSize: 21, fontWeight: 700, fontFamily: SANS, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 15, color: C.body, fontFamily: SANS, letterSpacing: -0.1 }}>{m.sub}</div>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, marginTop: 14, opacity: 0.5 }} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA  (identical to ApexAd.tsx)
// ═══════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame   = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 10);
  const glow    = useBreathingGlow(80, 0.55, 1.0);
  const beat    = beatPulse(frame) * 0.14;

  const glowFade = 1 - easeInOut3(rawProgress(frame, 0, 30));
  const bgT      = easeOut3(rawProgress(frame, 0, 20));

  const line1 = useCinematicTextReveal(15, 18, 9);
  const line2 = useCinematicTextReveal(23, 18, 9);
  const sub   = useCinematicTextReveal(30, 12, 5);
  const btnT  = easeOut4(rawProgress(frame, 45, 18));
  const urlT  = useCinematicTextReveal(50, 10, 4);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: `linear-gradient(145deg, #060403 0%, #0D0A06 100%)`, opacity: bgT }} />
      <AbsoluteFill style={{ background: C.bg, opacity: 1 - bgT }} />
      <div style={{ position: "absolute", left: "50%", top: "46%", transform: "translate(-50%, -50%)", width: 880, height: 880, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(249,115,22,${(0.16 * glow + beat) * glowFade}) 0%, rgba(251,191,36,${0.06 * glow * glowFade}) 45%, transparent 70%)` }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 80px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: `${C.accent}55`, fontFamily: SANS, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 44, opacity: line1.opacity }}>Apex</div>
        {[{ text: "Close",   t: line1, color: C.text   }, { text: "faster.", t: line2, color: C.accent }].map((l, i) => (
          <div key={i} style={{ fontSize: 96, fontWeight: 900, fontFamily: SANS, color: l.color, letterSpacing: -5, lineHeight: 0.88, marginBottom: i === 0 ? 6 : 0, opacity: l.t.opacity, transform: `translateY(${l.t.translateY}px)`, filter: `blur(${l.t.blur}px)` }}>{l.text}</div>
        ))}
        <div style={{ fontSize: 19, color: C.body, fontFamily: SANS, marginTop: 28, marginBottom: 44, opacity: sub.opacity, transform: `translateY(${sub.translateY}px)`, filter: `blur(${sub.blur}px)` }}>Start free. No card needed.</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: C.accent, borderRadius: 100, padding: "18px 48px", boxShadow: `0 0 44px ${C.accent}44, 0 4px 20px rgba(0,0,0,0.32)`, marginBottom: 22, opacity: btnT, transform: `scale(${0.88 + btnT * 0.12})`, transformOrigin: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.white, fontFamily: SANS, letterSpacing: -0.3 }}>Try Apex free</span>
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.70)", fontWeight: 700 }}>→</span>
        </div>
        <div style={{ fontSize: 15, color: "rgba(250,250,249,0.22)", fontFamily: MONO, letterSpacing: "0.04em", opacity: urlT.opacity, transform: `translateY(${urlT.translateY}px)` }}>apex.io</div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Cue Sheet ────────────────────────────────────────────────────────────────
export const ApexAd3DCues: CueEvent[] = [
  { frame: 0,   type: "SCENE_CUT",   label: 'Hook begins — "42%" pain stat on dark',        intensity: "hard",   notes: "Same as ApexAd. 3D card not yet visible." },
  { frame: 120, type: "SCENE_CUT",   label: "→ Demo: GlassCard arc entry (3D)",              intensity: "hard",   notes: "MeshPhysicalMaterial card arcs in. Bloom glow around it. Real IBL reflections." },
  { frame: 120, type: "HERO_ENTRY",  label: "GlassCard (Acme Corp $840K) arcs in via R3F",  intensity: "hard",   notes: "Same arc math as CSS version but real 3D geometry." },
  { frame: 240, type: "SCENE_CUT",   label: "→ Features: CSS card de-emphasised (right)",   intensity: "hard",   notes: "CSS DealCard retained for Features scene." },
  { frame: 360, type: "SCENE_CUT",   label: '→ Metrics: "43%" enters',                      intensity: "hard",   notes: "Same as ApexAd." },
  { frame: 420, type: "SCENE_CUT",   label: "→ CTA: Background warms and deepens",          intensity: "hard",   notes: "Same as ApexAd." },
];

// ─── Root Export ──────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 540;

export const ApexAd3D: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraProg = frame / TOTAL_FRAMES;
  const cameraZoom = 1.0 + cameraProg * 0.062; // linear dolly push-in

  const cameraRoll = interpolate(
    frame,
    [0, 80, 200, 360, 420, TOTAL_FRAMES],
    [-0.7, -0.12, 0.50, 0.05, 0.55, 0.22],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const cameraPanX = interpolate(frame, [0, TOTAL_FRAMES], [12, -10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraPanY = interpolate(frame, [0, TOTAL_FRAMES], [7, -6],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
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
