/**
 * SolaceAd v2 — "Sleep better. Perform better."
 *
 * Solace — sleep & recovery tracking app. 1:1 square, 15s @ 30fps.
 * Closest to the Meridian benchmark — warm palette, pure restraint in S1.
 *
 * Techniques from the approved library — all applied:
 *  ◆ Camera motion wrapper — zoom + roll + pan (full duration, linear)
 *  ◆ Meridian-quality hook: badge + 2-line headline (staggered 12f) + wipe rule + sub
 *  ◆ Bottom-left arc entry + blur-resolve 16px→0 (proven Meridian direction)
 *  ◆ Hero float with Y + X phase offset (starts after settle, frame 38+)
 *  ◆ Card expansion burst S2→S3: sleep card sweeps rotateY → edge-on,
 *    blur peaks at 28px (hides split), 3 stat clone cards spring-diverge to
 *    triangle positions, each born blurry, each with unique prism rotation
 *  ◆ Depth de-emphasis: hero card recedes during final layout
 *  ◆ useCinematicTextReveal on all text, staggered 12–14f
 *  ◆ usePremiumFadeOut on every scene
 *  ◆ Breathing glow on warm dark CTA close
 *
 * Scene breakdown (450f = 15s):
 *  S1  Hook       (  0–105f  3.5s)  Pure typography — restraint IS quality
 *  S2  Hero       (105–235f  4.3s)  Sleep card arc-in → settle → burst starts at frame 90
 *  S3  Expansion  (235–360f  4.2s)  3 stat cards in triangle → headline arrives last
 *  S4  CTA        (360–450f  3.0s)  Warm dark close, amber glow
 */

import React from "react";
import {
  AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig,
} from "remotion";
import {
  clamp, easeOut3, easeOut4, easeOut5, easeInOut3, rawProgress,
  useCinematicTextReveal, useBlurResolve, useArcEntry,
  depthDeemphasis, usePremiumWipe, useBreathingGlow, usePremiumFadeOut,
  premiumStagger, PREMIUM_SPRING,
} from "../utils/premiumMotion";

// ─── Tokens — warm palette (Meridian-proven) ──────────────────────────────────
const C = {
  bg:      "#FAF7F2",
  dark:    "#1C1410",
  text:    "#1C1410",
  accent:  "#B45309",
  accentL: "#FEF3C7",
  surface: "#FFFFFF",
  border:  "#EDE8DF",
  muted:   "#8C7B6B",
  lavender:"#6D5B8A",
  lavL:    "#F0EBFF",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const W = 1080;
const H = 1080;
const TOTAL = 450;

// ─── Card geometry ────────────────────────────────────────────────────────────
const CARD_W = 560;
const CARD_H = 340;
const CARD_RADIUS = 22;
const CARD_RIM = 6;
const DEPTH_MULT = 20;

function prismEdge(rotYDeg: number, rotXDeg: number, accent: string): string {
  const sx = -Math.sin(rotYDeg * Math.PI / 180) * DEPTH_MULT;
  const sy = -Math.sin(rotXDeg * Math.PI / 180) * DEPTH_MULT;
  return [`${sx.toFixed(1)}px ${sy.toFixed(1)}px 0px 0px ${accent}CC`, `${(sx*1.8).toFixed(1)}px ${(sy*1.8).toFixed(1)}px 3px -1px ${accent}44`].join(", ");
}

// ─── Sleep card face ──────────────────────────────────────────────────────────
const SleepCardFace: React.FC<{ width?: number; height?: number }> = ({ width = CARD_W, height = CARD_H }) => {
  const stages = [
    { label: "Awake", pct: 8,  color: "#FCA5A5" },
    { label: "Light", pct: 32, color: "#93C5FD" },
    { label: "Deep",  pct: 28, color: C.lavender },
    { label: "REM",   pct: 32, color: "#6D5B8A" },
  ];
  const scale = width / CARD_W;
  return (
    <div style={{ width, height, background: C.surface, borderRadius: CARD_RADIUS, overflow: "hidden", fontFamily: SANS, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: C.lavender }} />
      <div style={{ padding: `${20*scale}px ${24*scale}px`, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10*scale, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>Last night</div>
            <div style={{ fontSize: 11*scale, color: C.muted, marginTop: 2 }}>Mon, Mar 11 · 10:42 PM – 6:18 AM</div>
          </div>
          <div style={{ fontSize: 10*scale, fontWeight: 700, color: C.lavender, background: C.lavL, borderRadius: 100, padding: `2px ${10*scale}px` }}>Great sleep</div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8*scale }}>
          <span style={{ fontSize: 72*scale, fontWeight: 900, color: C.text, letterSpacing: "-0.04em", lineHeight: 1 }}>87</span>
          <span style={{ fontSize: 18*scale, color: C.muted }}>/100</span>
          <span style={{ fontSize: 14*scale, color: C.accent, fontWeight: 600, marginLeft: 6*scale }}>↑ +6 vs avg</span>
        </div>
        {/* Stage bar */}
        <div>
          <div style={{ display: "flex", height: 8*scale, borderRadius: 6, overflow: "hidden", gap: 1.5 }}>
            {stages.map((s, i) => (
              <div key={i} style={{ flex: s.pct, background: s.color, borderRadius: i === 0 ? "6px 0 0 6px" : i === stages.length-1 ? "0 6px 6px 0" : 0 }} />
            ))}
          </div>
          <div style={{ display: "flex", marginTop: 6 }}>
            {stages.map((s, i) => (
              <div key={i} style={{ flex: s.pct, display: "flex", alignItems: "center", gap: 3 }}>
                <div style={{ width: 5*scale, height: 5*scale, borderRadius: 5, background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 9*scale, color: C.muted }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Clone stat card ──────────────────────────────────────────────────────────
interface StatCardProps { label: string; value: string; sub: string; accent: string; }
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, accent }) => (
  <div style={{ width: 260, background: C.surface, borderRadius: 18, overflow: "hidden", fontFamily: SANS, display: "flex", flexDirection: "column" }}>
    <div style={{ height: 4, background: accent }} />
    <div style={{ padding: "16px 20px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: accent, fontWeight: 600, background: `${accent}18`, borderRadius: 6, padding: "2px 8px", display: "inline-block" }}>{sub}</div>
    </div>
  </div>
);

// Clone positions — triangle layout
const CLONE_W = 260;
const CLONE_H = 160;
const HERO_L = (W - CARD_W) / 2;
const HERO_T = (H - CARD_H) / 2 - 20;

const CLONES = [
  { left: 80,         top: 80,         rotZ: -5, rotX:  3, rotY: -7,  accent: C.lavender, label: "Deep sleep",    value: "2h 8m",  sub: "+22 min vs avg", delay: 0,  phase: 0 },
  { left: W-CLONE_W-80, top: 80,       rotZ:  6, rotX:  2, rotY:  9,  accent: C.accent,   label: "HRV",          value: "52 ms",  sub: "Excellent",      delay: 7,  phase: Math.PI * 0.6 },
  { left: (W-CLONE_W)/2, top: H-CLONE_H-80, rotZ: -3, rotX: -3, rotY:-5, accent: "#6D5B8A", label: "Sleep score", value: "87",     sub: "Best this month", delay: 13, phase: Math.PI * 1.3 },
];

// ─── Timing ──────────────────────────────────────────────────────────────────
const S1_END   = 105;
const S2_END   = 235;
const S3_END   = 360;
// S2 internal burst
const BURST_S  = 88;
const BURST_P  = 102;
const BURST_E  = 118;
const CLONE_S  = 95;
const CLONE_DUR = 50;
const HEAD_IN  = 185; // relative to S3 start

// ─── Scene 1: Hook (Meridian-quality) ─────────────────────────────────────────
const S1Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeOut = usePremiumFadeOut(S1_END, 14);
  const badge = useCinematicTextReveal(4, 12, 5);
  const line1 = useCinematicTextReveal(16, 16, 7);
  const line2 = useCinematicTextReveal(28, 16, 7);
  const wipe  = usePremiumWipe(36, 24);
  const sub   = useCinematicTextReveal(46, 12, 5);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", width: 860 }}>
        {/* Badge */}
        <div style={{ transform: `translateY(${badge.translateY}px)`, opacity: badge.opacity, filter: `blur(${badge.blur}px)`, marginBottom: 22 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentL, borderRadius: 100, padding: "6px 18px" }}>
            <div style={{ width: 7, height: 7, borderRadius: 7, background: C.accent }} />
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.13em" }}>Sleep intelligence</span>
          </div>
        </div>
        {/* Headlines — staggered 12f, Meridian proven */}
        <div style={{ transform: `translateY(${line1.translateY}px)`, opacity: line1.opacity, filter: `blur(${line1.blur}px)` }}>
          <div style={{ fontFamily: SANS, fontSize: 108, fontWeight: 700, color: C.text, letterSpacing: "-0.04em", lineHeight: 0.95 }}>Rest is</div>
        </div>
        <div style={{ transform: `translateY(${line2.translateY}px)`, opacity: line2.opacity, filter: `blur(${line2.blur}px)`, marginBottom: 26 }}>
          <div style={{ fontFamily: SANS, fontSize: 108, fontWeight: 300, color: C.accent, letterSpacing: "-0.04em", lineHeight: 0.95 }}>productive.</div>
        </div>
        {/* Wipe rule */}
        <div style={{ height: 2, background: C.accentL, borderRadius: 2, overflow: "hidden", width: 480, marginBottom: 24 }}>
          <div style={{ height: 2, width: `${wipe}%`, background: C.accent, borderRadius: 2 }} />
        </div>
        {/* Sub */}
        <div style={{ transform: `translateY(${sub.translateY}px)`, opacity: sub.opacity * 0.62, filter: `blur(${sub.blur}px)` }}>
          <div style={{ fontFamily: SANS, fontSize: 22, color: C.muted, lineHeight: 1.5 }}>Science-backed sleep tracking for people who perform.</div>
        </div>
      </div>
    </div>
  );
};

// ─── Scene 2: Hero arc + burst ────────────────────────────────────────────────
const S2Hero: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const fadeOut = usePremiumFadeOut(S2_END - S1_END, 14);
  const prog = (s: number, d: number) => clamp((frame - s) / d, 0, 1);

  // Bottom-left arc (Meridian direction)
  const arcX = (1 - easeOut4(prog(0, 34))) * -110;
  const arcY = (1 - easeOut5(prog(0, 28))) * 130;
  const heroBlur = (1 - easeOut4(prog(14, 30))) * 16;
  const heroSc   = 0.90 + 0.10 * easeOut4(prog(0, 30));

  // Live prism rotation
  const heroRotY = -10 + frame * 0.08;
  const heroRotX = 4  + Math.sin(frame * 0.022) * 1.5;

  // Float
  const floatY = frame > 38 ? Math.sin((frame / 90) * 2 * Math.PI) * 5.5 * clamp((frame-38)/18, 0, 1) : 0;
  const floatX = frame > 38 ? Math.sin((frame / 90) * 2 * Math.PI + Math.PI/2) * 2.2 * clamp((frame-38)/18, 0, 1) : 0;

  // Context copy — waits 36f after card appears (hierarchy: card first)
  const label = useCinematicTextReveal(36, 14, 6);

  // Burst
  const burstT    = easeOut5(prog(BURST_S, BURST_P - BURST_S));
  const heroRotYB = frame >= BURST_S ? heroRotY + burstT * (90 - heroRotY) : heroRotY;
  const burstBlur = easeInOut3(prog(BURST_S, BURST_P - BURST_S)) * 28;
  const heroVis   = frame < BURST_E;

  // Ring
  const ringP  = easeOut4(prog(BURST_S, 30));
  const rScale = 0.4 + ringP * 2.4;
  const rOpac  = ringP < 0.5 ? ringP * 2 : (1 - (ringP - 0.5) * 2);

  return (
    <div style={{ position: "absolute", inset: 0, opacity: fadeOut }}>
      {/* Context copy — top left, waits */}
      {frame >= 36 && (
        <div style={{ position: "absolute", top: 80, left: 80, transform: `translateY(${label.translateY}px)`, opacity: label.opacity, filter: `blur(${label.blur}px)` }}>
          <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 10 }}>Your sleep report</div>
          <div style={{ fontFamily: SANS, fontSize: 46, fontWeight: 700, color: C.text, letterSpacing: "-0.03em", lineHeight: 1.1 }}>Wake up<br/>feeling it.</div>
        </div>
      )}

      {/* Hero card — disappears at burst */}
      {heroVis && (
        <div style={{
          position: "absolute", left: HERO_L, top: HERO_T,
          transform: `translateX(${arcX + floatX}px) translateY(${arcY + floatY}px) scale(${heroSc})`,
          filter: `blur(${heroBlur + burstBlur}px)`,
        }}>
          <div style={{ padding: CARD_RIM, borderRadius: CARD_RADIUS + CARD_RIM, background: C.lavender, boxShadow: prismEdge(heroRotYB, heroRotX, C.lavender), transform: `perspective(1100px) rotateY(${heroRotYB}deg) rotateX(${heroRotX}deg)` }}>
            <SleepCardFace />
          </div>
        </div>
      )}

      {/* Burst ring */}
      {frame >= BURST_S && frame < BURST_S + 38 && (
        <div style={{
          position: "absolute",
          left: HERO_L + CARD_W / 2, top: HERO_T + CARD_H / 2,
          transform: `translate(-50%, -50%) scale(${rScale})`,
          width: 110, height: 110, borderRadius: "50%",
          border: `2px solid ${C.lavender}`,
          opacity: rOpac * 0.55,
        }} />
      )}

      {/* Clone cards spring out from burst centre */}
      {frame >= CLONE_S && CLONES.map((cfg, i) => {
        const startF = CLONE_S + cfg.delay;
        const flyS   = spring({ frame: Math.max(0, frame - startF), fps, config: PREMIUM_SPRING.settle });
        const dx = HERO_L - cfg.left;
        const dy = HERO_T  - cfg.top;
        const tx = dx * (1 - flyS);
        const ty = dy * (1 - flyS);
        const blurC = (1 - easeOut4(clamp((frame - startF) / 36, 0, 1))) * 24;
        const opacC = clamp(easeOut3(clamp((frame - startF) / 16, 0, 1)), 0, 1);
        const settled = Math.max(0, frame - (startF + CLONE_DUR));
        const liveRotY = cfg.rotY + settled * (cfg.phase < Math.PI ? 0.05 : -0.05);
        const liveRotX = cfg.rotX + Math.sin(frame * 0.018 + cfg.phase) * 1.1;
        const fY = Math.sin((frame / 88 + cfg.phase) * 2 * Math.PI) * 4.5;
        return (
          <div key={i} style={{ position: "absolute", left: cfg.left, top: cfg.top, transform: `translateX(${tx}px) translateY(${ty + fY}px) rotateZ(${cfg.rotZ}deg)`, filter: `blur(${blurC}px)`, opacity: opacC }}>
            <div style={{ padding: CARD_RIM - 2, borderRadius: 22, background: cfg.accent, boxShadow: prismEdge(liveRotY, liveRotX, cfg.accent), transform: `perspective(1100px) rotateY(${liveRotY}deg) rotateX(${liveRotX}deg)` }}>
              <StatCard label={cfg.label} value={cfg.value} sub={cfg.sub} accent={cfg.accent} />
            </div>
          </div>
        );
      })}

      {/* Headline — arrives AFTER eye understands the expansion */}
      {frame >= HEAD_IN && (() => {
        const h1 = useCinematicTextReveal(HEAD_IN, 12, 5);
        const h2 = useCinematicTextReveal(HEAD_IN + 12, 12, 5);
        return (
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: `translateX(-50%) translateY(${h1.translateY}px)`, opacity: h1.opacity, filter: `blur(${h1.blur}px)`, whiteSpace: "nowrap", textAlign: "center" }}>
            <div style={{ fontFamily: SANS, fontSize: 48, fontWeight: 700, color: C.text, letterSpacing: "-0.03em" }}>Track every night.</div>
            <div style={{ transform: `translateY(${h2.translateY - h1.translateY}px)`, opacity: h2.opacity / Math.max(h1.opacity, 0.01) }}>
              <div style={{ fontFamily: SANS, fontSize: 48, fontWeight: 300, color: C.accent, letterSpacing: "-0.03em" }}>Level every day.</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ─── Scene 3: Stats (Meridian three-row pattern) ───────────────────────────────
const S3Stats: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeOut = usePremiumFadeOut(S3_END - S2_END, 14);
  const stats = [
    { value: "94%",    label: "Report better recovery",  sub: "after 2 weeks" },
    { value: "41 min", label: "More deep sleep avg",     sub: "vs baseline" },
    { value: "4.9★",   label: "App Store rating",        sub: "12,000+ reviews" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", opacity: fadeOut }}>
      {stats.map((s, i) => {
        const t     = easeOut4(rawProgress(frame, premiumStagger(i, 6, 20), 28));
        const tOpac = easeOut3(rawProgress(frame, premiumStagger(i, 6, 20), 20));
        const wipeW = easeInOut3(rawProgress(frame, premiumStagger(i, 6, 20) + 14, 22)) * 52;
        return (
          <div key={i} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column",
            borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
            transform: `translateY(${(1-t)*18}px)`, opacity: clamp(tOpac, 0, 1),
          }}>
            <div style={{ fontFamily: SANS, fontSize: 158, fontWeight: 900, color: C.text, letterSpacing: "-0.045em", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 500, color: C.muted, marginTop: 2 }}>{s.label}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <div style={{ height: 2, width: wipeW, borderRadius: 2, background: C.accent }} />
              <span style={{ fontFamily: SANS, fontSize: 14, color: C.accent, fontWeight: 600 }}>{s.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Scene 4: CTA ─────────────────────────────────────────────────────────────
const S4CTA: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = useBreathingGlow(88, 0.4, 0.8);
  const h1   = useCinematicTextReveal(8);
  const h2   = useCinematicTextReveal(20);
  const btn  = useCinematicTextReveal(34);
  const url  = useCinematicTextReveal(46);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 55% at 50% 50%, rgba(180,83,9,${glow * 0.26}) 0%, transparent 70%)` }} />
      <div style={{ transform: `translateY(${h1.translateY}px)`, opacity: h1.opacity, filter: `blur(${h1.blur}px)` }}>
        <div style={{ fontFamily: SANS, fontSize: 84, fontWeight: 700, color: "#FFF8F0", letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1 }}>Sleep better.</div>
      </div>
      <div style={{ transform: `translateY(${h2.translateY}px)`, opacity: h2.opacity, filter: `blur(${h2.blur}px)`, marginBottom: 48 }}>
        <div style={{ fontFamily: SANS, fontSize: 84, fontWeight: 300, color: C.accent, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1 }}>Perform better.</div>
      </div>
      <div style={{ transform: `translateY(${btn.translateY}px)`, opacity: btn.opacity, filter: `blur(${btn.blur}px)`, marginBottom: 18 }}>
        <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: "#1C1410", background: C.accent, borderRadius: 16, padding: "18px 50px", boxShadow: `0 0 44px rgba(180,83,9,0.52)`, letterSpacing: "-0.01em" }}>Download Solace — free</div>
      </div>
      <div style={{ transform: `translateY(${url.translateY}px)`, opacity: url.opacity * 0.38, filter: `blur(${url.blur}px)` }}>
        <div style={{ fontFamily: SANS, fontSize: 16, color: "#FFF8F0", letterSpacing: "0.1em" }}>solace.app</div>
      </div>
    </div>
  );
};

// ─── Root — camera motion wraps everything ────────────────────────────────────
export const SolaceAd: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraZoom = 1.0 + (frame / TOTAL) * 0.060;
  const cameraRoll = interpolate(frame, [0, 55, 145, 255, TOTAL], [-0.85, -0.2, 0.5, 0.78, 0.32], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraPanX = interpolate(frame, [0, TOTAL], [13, -9],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraPanY = interpolate(frame, [0, TOTAL], [7,  -5],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
          <S2Hero frame={frame - S1_END} />
        </Sequence>
        <Sequence from={S2_END} durationInFrames={S3_END - S2_END + 14}>
          <S3Stats frame={frame - S2_END} />
        </Sequence>
        <Sequence from={S3_END} durationInFrames={TOTAL - S3_END}>
          <S4CTA frame={frame - S3_END} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
