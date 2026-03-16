/**
 * VeridianAd v2 — "Ship without the chaos."
 *
 * Veridian — project management SaaS. 9:16 portrait, 15s @ 30fps.
 *
 * Techniques from the approved library — all applied:
 *  ◆ Camera motion wrapper (zoom + roll + pan — the #1 quality signal)
 *  ◆ Layout-aware blur reveal hook (KineticTypography pattern)
 *  ◆ Arc entry + blur-resolve on hero card (bottom-left)
 *  ◆ Hero float with X+Y phase offset
 *  ◆ Card expansion burst (1 → 3 cards, triangle layout)
 *     - Hero sweeps rotateY → 90° (edge-on) with blur peak at split
 *     - Three clone cards spring-diverge from burst center, each born blurry
 *     - Prism edge shadow on all 3D-rotated cards
 *  ◆ Depth de-emphasis: hero card recedes as clones take focus
 *  ◆ useCinematicTextReveal on every text line, staggered 12f
 *  ◆ usePremiumFadeOut on every scene
 *  ◆ Breathing glow behind dark CTA
 *
 * Scene breakdown (450f @ 30fps = 15s):
 *  S1  Hook       (  0–105f  3.5s)  Blur reveal: "Ship" · logo · "faster."
 *  S2  Expansion  (105–300f  6.5s)  Hero card arcs in → burst → 3 clones diverge → headline
 *  S3  CTA        (300–450f  5.0s)  Dark close, amber glow, headline + button
 */

import React from "react";
import {
  AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig,
} from "remotion";
import {
  clamp, easeOut3, easeOut4, easeOut5, easeInOut3, rawProgress,
  useCinematicTextReveal, useBlurResolve, useArcEntry,
  useBreathingGlow, usePremiumFadeOut, PREMIUM_SPRING,
} from "../utils/premiumMotion";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:      "#F5F6FA",
  dark:    "#0D0F14",
  text:    "#0D0F14",
  accent:  "#5B47F5",
  accentL: "#EDE9FF",
  surface: "#FFFFFF",
  border:  "#E2E4EA",
  muted:   "#8B8FA8",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const W = 1080;
const H = 1920;
const TOTAL = 450;

// ─── WordReveal (layout-aware blur reveal) ────────────────────────────────────
const WordReveal: React.FC<{
  frame: number; revealStart: number;
  driftX?: number; blurMax?: number; revealDur?: number;
  children: React.ReactNode;
}> = ({ frame, revealStart, driftX = 28, blurMax = 10, revealDur = 26, children }) => {
  const t     = easeOut4(rawProgress(frame, revealStart, revealDur));
  const tOpac = easeOut3(rawProgress(frame, revealStart, revealDur * 0.6));
  return (
    <span style={{
      display: "inline-block",
      transform: `translateX(${(1 - t) * driftX}px)`,
      filter: `blur(${(1 - t) * blurMax}px)`,
      opacity: clamp(tOpac, 0, 1),
    }}>
      {children}
    </span>
  );
};

// ─── Veridian logo ────────────────────────────────────────────────────────────
const VLogo: React.FC<{ size: number }> = ({ size: S }) => (
  <svg width={S} height={S} viewBox="0 0 64 64" fill="none">
    <path d="M16 18 L32 46 L48 18" stroke={C.accent} strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="46" r="4.5" fill={C.accent} />
  </svg>
);

// ─── Project card ─────────────────────────────────────────────────────────────
const CARD_W = 560;
const CARD_H = 340;
const CARD_RADIUS = 22;
const CARD_RIM = 6;
const DEPTH_MULT = 20;

function prismEdge(rotYDeg: number, rotXDeg: number, accent: string): string {
  const sx = -Math.sin(rotYDeg * Math.PI / 180) * DEPTH_MULT;
  const sy = -Math.sin(rotXDeg * Math.PI / 180) * DEPTH_MULT;
  return [
    `${sx.toFixed(1)}px ${sy.toFixed(1)}px 0px 0px ${accent}CC`,
    `${(sx*1.8).toFixed(1)}px ${(sy*1.8).toFixed(1)}px 3px -1px ${accent}44`,
  ].join(", ");
}

interface PCardProps {
  label: string; value: string; sub: string; accent: string;
  width?: number; height?: number;
}
const PCard: React.FC<PCardProps> = ({ label, value, sub, accent, width = CARD_W, height = CARD_H }) => (
  <div style={{ width, height, background: C.surface, borderRadius: CARD_RADIUS, overflow: "hidden", fontFamily: SANS, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 4, background: accent, flexShrink: 0 }} />
    <div style={{ padding: "22px 26px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      <div>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
        <div style={{ marginTop: 6, fontSize: 13, color: accent, fontWeight: 600, background: `${accent}18`, borderRadius: 6, padding: "3px 8px", display: "inline-block" }}>{sub}</div>
      </div>
    </div>
  </div>
);

// ─── Clone card configs (triangle layout around centre) ───────────────────────
const HERO_LEFT = (W - CARD_W) / 2;
const HERO_TOP  = (H - CARD_H) / 2 - 80;

const CLONE_CONFIGS = [
  { left: 80,             top: HERO_TOP - 320, rotZ: -5,  rotX:  3, rotY: -7,  accent: "#5B47F5", label: "Active tasks",    value: "24",    sub: "↑ 6 this week",  delay: 0,  phase: 0 },
  { left: W-CARD_W-80,   top: HERO_TOP - 180, rotZ:  6,  rotX:  2, rotY:  8,  accent: "#10B981", label: "On track",        value: "91%",   sub: "↑ 4% vs last",   delay: 6,  phase: Math.PI * 0.6 },
  { left: (W-CARD_W)/2,  top: HERO_TOP + 380, rotZ: -3,  rotX: -3, rotY: -5,  accent: "#F59E0B", label: "Sprint velocity", value: "38 pts",sub: "Best sprint yet",  delay: 12, phase: Math.PI * 1.3 },
];

// ─── Timing ──────────────────────────────────────────────────────────────────
const S1_END    = 105;
const S2_END    = 300;
// S2 internal
const HERO_IN   = 0;
const CURSOR_IN = 44;
const BURST_S   = 62;
const BURST_P   = 76;
const BURST_E   = 92;
const CLONE_S   = 72;
const CLONE_DUR = 52;
const HEAD_IN   = 175;

// ─── Scene 1: Hook ─────────────────────────────────────────────────────────
const S1Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeOut = usePremiumFadeOut(S1_END, 14);
  const SPREAD_FINAL = 188;
  const spread = easeInOut3(rawProgress(frame, 22, 140)) * SPREAD_FINAL;
  const logoBlur  = (1 - easeOut4(rawProgress(frame, 72, 30))) * 11;
  const logoOpacity = clamp(easeOut3(rawProgress(frame, 72, 20)), 0, 1);
  const logoScale = 0.86 + 0.14 * easeOut4(rawProgress(frame, 72, 30));
  const logoY     = (1 - easeOut4(rawProgress(frame, 72, 34))) * 20;
  const sub = useCinematicTextReveal(84, 12, 5);
  const FS = 140;

  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeOut }}>
      {/* 0×0 anchor */}
      <div style={{ position: "absolute", top: "48%", left: "50%", width: 0, height: 0 }}>
        {/* "Ship" */}
        <div style={{ position: "absolute", top: "50%", left: 0, transform: `translate(calc(-100% + ${-spread}px), -50%)` }}>
          {frame >= 2 && (
            <WordReveal frame={frame} revealStart={2} driftX={-22} blurMax={8} revealDur={28}>
              <span style={{ fontFamily: SANS, fontSize: FS, fontWeight: 600, letterSpacing: "-0.035em", color: C.text, display: "block", lineHeight: 1, paddingRight: 14, whiteSpace: "nowrap" }}>Ship</span>
            </WordReveal>
          )}
        </div>
        {/* Logo card */}
        {frame >= 72 && (
          <div style={{ position: "absolute", top: "50%", left: 0, transform: `translate(-50%, calc(-50% + ${logoY}px)) scale(${logoScale})`, filter: `blur(${logoBlur}px)`, opacity: logoOpacity }}>
            <div style={{ width: 118, height: 118, borderRadius: 28, background: C.surface, border: `1.5px solid ${C.border}`, boxShadow: "0 12px 48px rgba(91,71,245,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <VLogo size={66} />
            </div>
          </div>
        )}
        {/* "faster." */}
        <div style={{ position: "absolute", top: "50%", left: 0, transform: `translate(${spread}px, -50%)` }}>
          {frame >= 48 && (
            <WordReveal frame={frame} revealStart={48} driftX={28} blurMax={10} revealDur={26}>
              <span style={{ fontFamily: SANS, fontSize: FS, fontWeight: 700, letterSpacing: "-0.04em", color: C.accent, display: "block", lineHeight: 1, paddingLeft: 14, whiteSpace: "nowrap" }}>faster.</span>
            </WordReveal>
          )}
        </div>
      </div>
      {/* Sub */}
      {frame >= 84 && (
        <div style={{ position: "absolute", top: "63%", left: "50%", transform: `translateX(-50%) translateY(${sub.translateY}px)`, opacity: sub.opacity, filter: `blur(${sub.blur}px)`, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: SANS, fontSize: 26, fontWeight: 300, letterSpacing: "0.01em", color: C.muted }}>Project management without the noise.</span>
        </div>
      )}
    </div>
  );
};

// ─── Scene 2: Hero arc-in → burst → clones ──────────────────────────────────
const S2Expansion: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const fadeOut = usePremiumFadeOut(S2_END - S1_END, 14);
  const prog = (s: number, d: number) => clamp((frame - s) / d, 0, 1);

  // Hero card arc entry
  const arcX = (1 - easeOut4(prog(HERO_IN, 34))) * -90;
  const arcY = (1 - easeOut5(prog(HERO_IN, 28))) * 120;
  const heroEntryBlur = (1 - easeOut4(prog(HERO_IN + 14, 30))) * 16;
  const heroScale0    = 0.90 + 0.10 * easeOut4(prog(HERO_IN, 30));

  // Hero float (begins after settle)
  const floatY = frame > 38 ? Math.sin((frame / 90) * 2 * Math.PI) * 5 * clamp((frame-38)/18, 0, 1) : 0;
  const floatX = frame > 38 ? Math.sin((frame / 90) * 2 * Math.PI + Math.PI/2) * 2 * clamp((frame-38)/18, 0, 1) : 0;

  // Burst
  const burstT     = easeOut5(prog(BURST_S, BURST_P - BURST_S));
  const heroRotY   = -10 + frame * 0.09;
  const heroRotX   = 4 + Math.sin(frame * 0.02) * 1.5;
  const heroRotYB  = frame >= BURST_S ? heroRotY + burstT * (90 - heroRotY) : heroRotY;
  const burstBlur  = easeInOut3(prog(BURST_S, BURST_P - BURST_S)) * 28;
  const heroVisible = frame < BURST_E;

  // Ring
  const ringProg  = easeOut4(prog(BURST_S, 30));
  const ringScale = 0.4 + ringProg * 2.8;
  const ringOpac  = ringProg < 0.5 ? ringProg * 2 : (1 - (ringProg - 0.5) * 2);

  // Clone cards
  const clonesVisible = frame >= CLONE_S;

  // Context headline
  const headlineVisible = frame >= HEAD_IN;
  const h1 = useCinematicTextReveal(HEAD_IN, 14, 6);
  const h2 = useCinematicTextReveal(HEAD_IN + 14, 14, 6);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeOut }}>

      {/* Clone cards */}
      {clonesVisible && CLONE_CONFIGS.map((cfg, i) => {
        const startF = CLONE_S + cfg.delay;
        const flySpring = spring({ frame: Math.max(0, frame - startF), fps, config: PREMIUM_SPRING.settle });
        const dx = HERO_LEFT - cfg.left;
        const dy = HERO_TOP  - cfg.top;
        const tx = dx * (1 - flySpring);
        const ty = dy * (1 - flySpring);
        const blurC = (1 - easeOut4(clamp((frame - startF) / 38, 0, 1))) * 26;
        const opacC = clamp(easeOut3(clamp((frame - startF) / 18, 0, 1)), 0, 1);
        const settled = Math.max(0, frame - (startF + CLONE_DUR));
        const liveRotY = cfg.rotY + settled * (cfg.phase < Math.PI ? 0.055 : -0.055);
        const liveRotX = cfg.rotX + Math.sin(frame * 0.018 + cfg.phase) * 1.2;
        const floatCY  = Math.sin((frame / 88 + cfg.phase) * 2 * Math.PI) * 5;
        return (
          <div key={i} style={{
            position: "absolute",
            left: cfg.left,
            top: cfg.top,
            transform: `translateX(${tx}px) translateY(${ty + floatCY}px) rotateZ(${cfg.rotZ}deg)`,
            filter: `blur(${blurC}px)`,
            opacity: opacC,
            perspective: "1100px",
          }}>
            <div style={{
              padding: CARD_RIM,
              borderRadius: CARD_RADIUS + CARD_RIM,
              background: cfg.accent,
              boxShadow: prismEdge(liveRotY, liveRotX, cfg.accent),
              transform: `perspective(1100px) rotateY(${liveRotY}deg) rotateX(${liveRotX}deg)`,
            }}>
              <PCard label={cfg.label} value={cfg.value} sub={cfg.sub} accent={cfg.accent} width={CARD_W * 0.62} height={CARD_H * 0.68} />
            </div>
          </div>
        );
      })}

      {/* Hero card */}
      {heroVisible && (
        <div style={{
          position: "absolute",
          left: HERO_LEFT,
          top: HERO_TOP,
          transform: `translateX(${arcX + floatX}px) translateY(${arcY + floatY}px) scale(${heroScale0})`,
          filter: `blur(${heroEntryBlur + burstBlur}px)`,
          perspective: "1100px",
        }}>
          <div style={{
            padding: CARD_RIM, borderRadius: CARD_RADIUS + CARD_RIM, background: C.accent,
            boxShadow: prismEdge(heroRotYB, heroRotX, C.accent),
            transform: `perspective(1100px) rotateY(${heroRotYB}deg) rotateX(${heroRotX}deg)`,
          }}>
            <PCard label="Q2 Sprint" value="73%" sub="On track · 6 days left" accent={C.accent} />
          </div>
        </div>
      )}

      {/* Burst ring */}
      {frame >= BURST_S && frame < BURST_S + 40 && (
        <div style={{
          position: "absolute",
          left: HERO_LEFT + CARD_W / 2,
          top: HERO_TOP + CARD_H / 2,
          transform: `translate(-50%, -50%) scale(${ringScale})`,
          width: 120, height: 120, borderRadius: "50%",
          border: `2px solid ${C.accent}`,
          opacity: ringOpac * 0.5,
        }} />
      )}

      {/* Headline (arrives after clones settle) */}
      {headlineVisible && (
        <div style={{
          position: "absolute", left: "50%",
          top: "78%",
          transform: `translateX(-50%) translateY(${h1.translateY}px)`,
          opacity: h1.opacity, filter: `blur(${h1.blur}px)`,
          whiteSpace: "nowrap", textAlign: "center",
        }}>
          <div style={{ fontFamily: SANS, fontSize: 52, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>Your whole team.</div>
          <div style={{ transform: `translateY(${h2.translateY - h1.translateY}px)`, opacity: h2.opacity / Math.max(h1.opacity, 0.01) }}>
            <div style={{ fontFamily: SANS, fontSize: 52, fontWeight: 300, color: C.accent, letterSpacing: "-0.03em" }}>One workspace.</div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Scene 3: CTA ─────────────────────────────────────────────────────────────
const S3CTA: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = useBreathingGlow(90, 0.4, 0.8);
  const h1   = useCinematicTextReveal(8);
  const h2   = useCinematicTextReveal(20);
  const btn  = useCinematicTextReveal(34);
  const url  = useCinematicTextReveal(46);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 45% at 50% 50%, rgba(91,71,245,${glow * 0.3}) 0%, transparent 70%)` }} />
      <div style={{ transform: `translateY(${h1.translateY}px)`, opacity: h1.opacity, filter: `blur(${h1.blur}px)` }}>
        <div style={{ fontFamily: SANS, fontSize: 92, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1 }}>Ship without</div>
      </div>
      <div style={{ transform: `translateY(${h2.translateY}px)`, opacity: h2.opacity, filter: `blur(${h2.blur}px)`, marginBottom: 52 }}>
        <div style={{ fontFamily: SANS, fontSize: 92, fontWeight: 700, color: C.accent, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1 }}>the chaos.</div>
      </div>
      <div style={{ transform: `translateY(${btn.translateY}px)`, opacity: btn.opacity, filter: `blur(${btn.blur}px)`, marginBottom: 20 }}>
        <div style={{ fontFamily: SANS, fontSize: 24, fontWeight: 700, color: "#FFFFFF", background: C.accent, borderRadius: 18, padding: "20px 52px", boxShadow: `0 0 48px rgba(91,71,245,0.55)`, letterSpacing: "-0.01em" }}>Start free today</div>
      </div>
      <div style={{ transform: `translateY(${url.translateY}px)`, opacity: url.opacity * 0.45, filter: `blur(${url.blur}px)` }}>
        <div style={{ fontFamily: SANS, fontSize: 18, color: "#FFFFFF", letterSpacing: "0.08em" }}>veridian.app</div>
      </div>
    </div>
  );
};

// ─── Root — camera motion wraps everything ────────────────────────────────────
export const VeridianAd: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraZoom = 1.0 + (frame / TOTAL) * 0.062;
  const cameraRoll = interpolate(frame, [0, 60, 150, 250, TOTAL], [-0.8, -0.2, 0.5, 0.75, 0.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraPanX = interpolate(frame, [0, TOTAL], [12, -10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraPanY = interpolate(frame, [0, TOTAL], [8, -6],   { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        transform: `scale(${cameraZoom}) rotateZ(${cameraRoll}deg) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`,
        transformOrigin: "center center",
      }}>
        <Sequence from={0} durationInFrames={S1_END + 14}>
          <S1Hook frame={frame} />
        </Sequence>
        <Sequence from={S1_END} durationInFrames={S2_END - S1_END + 14}>
          <S2Expansion frame={frame - S1_END} />
        </Sequence>
        <Sequence from={S2_END} durationInFrames={TOTAL - S2_END}>
          <S3CTA frame={frame - S2_END} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
