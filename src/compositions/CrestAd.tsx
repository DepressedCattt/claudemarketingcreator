/**
 * CrestAd v2 — "Your finances, finally clear."
 *
 * Crest — personal finance / wealth analytics. 16:9, 15s @ 30fps.
 *
 * Techniques from the approved library — all applied:
 *  ◆ Camera motion wrapper — zoom + roll + pan (linear, professional dolly)
 *  ◆ Word slam hook: "Finally." crashes in from left at easeOut5; "clear." blur-reveals
 *  ◆ Arc entry for metric card (bottom-right — variation from other ads)
 *  ◆ Blur-resolve 16px→0 on card settle
 *  ◆ Hero float (Y + X phase offset)
 *  ◆ Stat chips with prism 3D tilt entering from three directions (top/right/bottom)
 *  ◆ Depth de-emphasis: card recedes when chart scene takes focus
 *  ◆ Animated bar chart — bars rise sequentially with easeOut4
 *  ◆ useCinematicTextReveal on all supporting text, staggered
 *  ◆ usePremiumFadeOut on every scene
 *  ◆ Breathing glow on dark CTA close
 *
 * Scene breakdown:
 *  S1  Hook        (  0– 95f  3.2s)  Word slam + blur reveal
 *  S2  Hero        ( 95–230f  4.5s)  Card arc entry + stat chips orbit
 *  S3  Chart       (230–355f  4.2s)  Two-column: feature copy left / animated chart right
 *  S4  CTA         (355–450f  3.2s)  Dark close, emerald glow
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

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:      "#F3F7F3",
  dark:    "#0A1628",
  text:    "#0A1628",
  accent:  "#059669",
  accentL: "#D1FAE5",
  surface: "#FFFFFF",
  border:  "#DDE8E0",
  muted:   "#5D7A6A",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const W = 1920;
const H = 1080;
const TOTAL = 450;

const CARD_W = 480;
const CARD_H = 360;
const CARD_RADIUS = 26;
const CARD_RIM = 6;
const DEPTH_MULT = 18;

function prismEdge(rotYDeg: number, rotXDeg: number, accent: string): string {
  const sx = -Math.sin(rotYDeg * Math.PI / 180) * DEPTH_MULT;
  const sy = -Math.sin(rotXDeg * Math.PI / 180) * DEPTH_MULT;
  return [`${sx.toFixed(1)}px ${sy.toFixed(1)}px 0px 0px ${accent}CC`, `${(sx*1.8).toFixed(1)}px ${(sy*1.8).toFixed(1)}px 3px -1px ${accent}44`].join(", ");
}

// ─── Metric card ──────────────────────────────────────────────────────────────
const MetricCard: React.FC<{ rotY?: number; rotX?: number }> = ({ rotY = -8, rotX = 3 }) => (
  <div style={{
    padding: CARD_RIM, borderRadius: CARD_RADIUS + CARD_RIM,
    background: C.accent,
    boxShadow: prismEdge(rotY, rotX, C.accent),
    transform: `perspective(1100px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
  }}>
    <div style={{ width: CARD_W, height: CARD_H, background: C.surface, borderRadius: CARD_RADIUS, overflow: "hidden", fontFamily: SANS, display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: C.accent }} />
      <div style={{ padding: "24px 28px 20px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em" }}>Net Worth</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, background: C.accentL, borderRadius: 100, padding: "2px 10px" }}>+18.4% YTD</span>
        </div>
        <div>
          <div style={{ fontSize: 66, fontWeight: 900, color: C.text, letterSpacing: "-0.035em", lineHeight: 1 }}>$284,190</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
            <svg width="13" height="13" viewBox="0 0 14 14"><path d="M2 10L7 4L12 10" stroke={C.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
            <span style={{ fontSize: 13, color: C.accent, fontWeight: 600 }}>$43,210 this year</span>
          </div>
        </div>
        {/* Mini sparkline */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 44 }}>
          {[22,31,28,42,38,55,52,68,61,74,70,91].map((h, i) => (
            <div key={i} style={{ flex: 1, background: i === 11 ? C.accent : C.accentL, borderRadius: "2px 2px 0 0", height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── Stat chip (3D prism tilt) ────────────────────────────────────────────────
const StatChip: React.FC<{ label: string; value: string; frame: number; startF: number; fromX: number; fromY: number; rotY?: number; rotX?: number }> = ({
  label, value, frame, startF, fromX, fromY, rotY = 5, rotX = -3,
}) => {
  const t     = easeOut4(rawProgress(frame, startF, 26));
  const tOpac = easeOut3(rawProgress(frame, startF, 18));
  return (
    <div style={{
      transform: `translateX(${(1-t)*fromX}px) translateY(${(1-t)*fromY}px)`,
      opacity: clamp(tOpac, 0, 1),
    }}>
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`,
        borderRadius: 14, padding: "11px 20px",
        boxShadow: prismEdge(rotY, rotX, C.accent) + ", 0 4px 16px rgba(10,22,40,0.07)",
        transform: `perspective(800px) rotateY(${rotY}deg) rotateX(${rotX}deg)`,
        fontFamily: SANS, whiteSpace: "nowrap",
      }}>
        <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.02em" }}>{value}</div>
      </div>
    </div>
  );
};

// ─── Bar chart ────────────────────────────────────────────────────────────────
const BarChart: React.FC<{ frame: number; startF: number }> = ({ frame, startF }) => {
  const months  = ["Sep","Oct","Nov","Dec","Jan","Feb"];
  const heights = [42, 56, 49, 70, 65, 92];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 160 }}>
      {heights.map((h, i) => {
        const barT = easeOut4(rawProgress(frame, startF + i * 9, 22));
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
            <div style={{ width: "100%", background: i === 5 ? C.accent : C.accentL, borderRadius: "5px 5px 0 0", height: h * 1.6 * barT }} />
            <span style={{ fontSize: 11, color: C.muted, fontFamily: SANS }}>{months[i]}</span>
          </div>
        );
      })}
    </div>
  );
};

// ─── Timing ──────────────────────────────────────────────────────────────────
const S1_END = 95;
const S2_END = 230;
const S3_END = 355;

// ─── Scene 1: Hook ────────────────────────────────────────────────────────────
const S1Hook: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeOut = usePremiumFadeOut(S1_END, 14);
  // "Finally." — word slam from left
  const slamT = easeOut5(rawProgress(frame, 2, 18));
  const slamX = (1 - slamT) * -240;
  const slamO = clamp(easeOut3(rawProgress(frame, 2, 12)), 0, 1);
  // "clear." — blur reveal beneath, offset right (editorial stagger)
  const clearT    = easeOut4(rawProgress(frame, 36, 26));
  const clearBlur = (1 - clearT) * 11;
  const clearDX   = (1 - clearT) * 32;
  const clearO    = clamp(easeOut3(rawProgress(frame, 36, 18)), 0, 1);
  const sub = useCinematicTextReveal(56, 12, 5);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: fadeOut }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ transform: `translateX(${slamX}px)`, opacity: slamO }}>
          <span style={{ fontFamily: SANS, fontSize: 160, fontWeight: 800, letterSpacing: "-0.045em", color: C.text, display: "block", lineHeight: 0.92 }}>Finally.</span>
        </div>
        <div style={{ transform: `translateX(${clearDX}px)`, filter: `blur(${clearBlur}px)`, opacity: clearO, alignSelf: "flex-end" }}>
          <span style={{ fontFamily: SANS, fontSize: 160, fontWeight: 300, letterSpacing: "-0.045em", color: C.accent, display: "block", lineHeight: 0.92 }}>clear.</span>
        </div>
      </div>
      {frame >= 56 && (
        <div style={{ marginTop: 30, transform: `translateY(${sub.translateY}px)`, opacity: sub.opacity * 0.65, filter: `blur(${sub.blur}px)` }}>
          <span style={{ fontFamily: SANS, fontSize: 24, fontWeight: 300, color: C.muted }}>Your complete financial picture, in one place.</span>
        </div>
      )}
    </div>
  );
};

// ─── Scene 2: Hero card + stat chips ─────────────────────────────────────────
const S2Hero: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const fadeOut = usePremiumFadeOut(S2_END - S1_END, 14);

  // Arc from bottom-right
  const arcX = (1 - easeOut4(rawProgress(frame, 0, 34))) * 110;
  const arcY = (1 - easeOut5(rawProgress(frame, 0, 28))) * 110;
  const heroBlur = (1 - easeOut4(rawProgress(frame, 14, 30))) * 16;
  const heroScale = 0.88 + 0.12 * easeOut4(rawProgress(frame, 0, 30));

  // Live prism rotation
  const heroRotY = -8 + frame * 0.08;
  const heroRotX = 3 + Math.sin(frame * 0.02) * 1.4;

  // Float
  const floatY = frame > 38 ? Math.sin((frame / 90) * 2 * Math.PI) * 5 * clamp((frame-38)/18, 0, 1) : 0;
  const floatX = frame > 38 ? Math.sin((frame / 90) * 2 * Math.PI + Math.PI/2) * 2.2 * clamp((frame-38)/18, 0, 1) : 0;

  const label = useCinematicTextReveal(32, 14, 6);

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: fadeOut }}>
      {/* Left label */}
      {frame >= 32 && (
        <div style={{ position: "absolute", left: 120, top: "50%", transform: `translateY(calc(-50% + ${label.translateY}px))`, opacity: label.opacity, filter: `blur(${label.blur}px)` }}>
          <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 12 }}>Your dashboard</div>
          <div style={{ fontFamily: SANS, fontSize: 58, fontWeight: 700, color: C.text, letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: 400 }}>See the<br/>full picture.</div>
        </div>
      )}
      {/* Hero card */}
      <div style={{ transform: `translateX(${arcX + floatX}px) translateY(${arcY + floatY}px) scale(${heroScale})`, filter: `blur(${heroBlur}px)`, marginLeft: 180 }}>
        <MetricCard rotY={heroRotY} rotX={heroRotX} />
      </div>
      {/* Chips from three directions */}
      {frame >= 55 && <div style={{ position: "absolute", right: 180, top: "24%" }}><StatChip label="Savings rate" value="31.2%" frame={frame} startF={55} fromX={40} fromY={-22} rotY={6} rotX={-4} /></div>}
      {frame >= 70 && <div style={{ position: "absolute", right: 110, bottom: "26%" }}><StatChip label="Monthly spend" value="$3,840" frame={frame} startF={70} fromX={40} fromY={22} rotY={-5} rotX={3} /></div>}
      {frame >= 85 && <div style={{ position: "absolute", right: 300, top: "60%" }}><StatChip label="Investments" value="$142K" frame={frame} startF={85} fromX={-28} fromY={22} rotY={7} rotX={-3} /></div>}
    </div>
  );
};

// ─── Scene 3: Chart + copy ────────────────────────────────────────────────────
const S3Chart: React.FC<{ frame: number }> = ({ frame }) => {
  const fadeOut = usePremiumFadeOut(S3_END - S2_END, 14);
  const badge = useCinematicTextReveal(6, 10, 4);
  const h1    = useCinematicTextReveal(14, 14, 6);
  const h2    = useCinematicTextReveal(24, 14, 6);
  const body  = useCinematicTextReveal(34, 12, 5);
  const wipe1 = easeInOut3(rawProgress(frame, 18, 22)) * 100;

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", opacity: fadeOut }}>
      {/* Left — copy */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 80px 0 120px" }}>
        <div style={{ transform: `translateY(${badge.translateY}px)`, opacity: badge.opacity, filter: `blur(${badge.blur}px)`, marginBottom: 20 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accentL, borderRadius: 100, padding: "6px 16px" }}>
            <div style={{ width: 6, height: 6, borderRadius: 6, background: C.accent }} />
            <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.12em" }}>Insights</span>
          </div>
        </div>
        <div style={{ transform: `translateY(${h1.translateY}px)`, opacity: h1.opacity, filter: `blur(${h1.blur}px)` }}>
          <div style={{ fontFamily: SANS, fontSize: 62, fontWeight: 700, color: C.text, letterSpacing: "-0.03em", lineHeight: 1.05 }}>Know where</div>
        </div>
        <div style={{ transform: `translateY(${h2.translateY}px)`, opacity: h2.opacity, filter: `blur(${h2.blur}px)`, marginBottom: 10 }}>
          <div style={{ fontFamily: SANS, fontSize: 62, fontWeight: 700, color: C.text, letterSpacing: "-0.03em", lineHeight: 1.05 }}>every dollar goes.</div>
        </div>
        <div style={{ height: 2, background: C.accentL, borderRadius: 2, overflow: "hidden", width: 360, marginBottom: 22 }}>
          <div style={{ height: 2, width: `${wipe1}%`, background: C.accent, borderRadius: 2 }} />
        </div>
        <div style={{ transform: `translateY(${body.translateY}px)`, opacity: body.opacity * 0.62, filter: `blur(${body.blur}px)` }}>
          <div style={{ fontFamily: SANS, fontSize: 19, color: C.muted, lineHeight: 1.6, maxWidth: 360 }}>AI-categorised transactions, automatic budgets, real-time net worth tracking.</div>
        </div>
      </div>
      {/* Right — chart card */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 120px 0 60px" }}>
        <div style={{ background: C.surface, borderRadius: 24, padding: "32px 32px 26px", border: `1px solid ${C.border}`, boxShadow: "0 8px 32px rgba(10,22,40,0.07)" }}>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Monthly savings</div>
          <div style={{ fontFamily: SANS, fontSize: 30, fontWeight: 800, color: C.text, letterSpacing: "-0.025em", marginBottom: 24 }}>↑ 18% vs last year</div>
          <BarChart frame={frame} startF={16} />
        </div>
      </div>
    </div>
  );
};

// ─── Scene 4: CTA ─────────────────────────────────────────────────────────────
const S4CTA: React.FC<{ frame: number }> = ({ frame }) => {
  const glow = useBreathingGlow(88, 0.35, 0.72);
  const h1   = useCinematicTextReveal(8);
  const h2   = useCinematicTextReveal(18);
  const btn  = useCinematicTextReveal(32);
  const url  = useCinematicTextReveal(44);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 55% 50% at 50% 50%, rgba(5,150,105,${glow * 0.22}) 0%, transparent 70%)` }} />
      <div style={{ transform: `translateY(${h1.translateY}px)`, opacity: h1.opacity, filter: `blur(${h1.blur}px)` }}>
        <div style={{ fontFamily: SANS, fontSize: 96, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1 }}>Your finances,</div>
      </div>
      <div style={{ transform: `translateY(${h2.translateY}px)`, opacity: h2.opacity, filter: `blur(${h2.blur}px)`, marginBottom: 48 }}>
        <div style={{ fontFamily: SANS, fontSize: 96, fontWeight: 700, color: C.accent, letterSpacing: "-0.04em", textAlign: "center", lineHeight: 1 }}>finally clear.</div>
      </div>
      <div style={{ transform: `translateY(${btn.translateY}px)`, opacity: btn.opacity, filter: `blur(${btn.blur}px)`, marginBottom: 18 }}>
        <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: "#FFFFFF", background: C.accent, borderRadius: 16, padding: "18px 52px", boxShadow: `0 0 48px rgba(5,150,105,0.45)`, letterSpacing: "-0.01em" }}>Try Crest free</div>
      </div>
      <div style={{ transform: `translateY(${url.translateY}px)`, opacity: url.opacity * 0.4, filter: `blur(${url.blur}px)` }}>
        <div style={{ fontFamily: SANS, fontSize: 17, color: "#FFFFFF", letterSpacing: "0.08em" }}>crest.finance</div>
      </div>
    </div>
  );
};

// ─── Root — camera motion wraps everything ────────────────────────────────────
export const CrestAd: React.FC = () => {
  const frame = useCurrentFrame();

  const cameraZoom = 1.0 + (frame / TOTAL) * 0.058;
  const cameraRoll = interpolate(frame, [0, 65, 160, 270, TOTAL], [-0.7, -0.15, 0.45, 0.72, 0.28], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraPanX = interpolate(frame, [0, TOTAL], [14, -8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cameraPanY = interpolate(frame, [0, TOTAL], [7, -5],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
          <S3Chart frame={frame - S2_END} />
        </Sequence>
        <Sequence from={S3_END} durationInFrames={TOTAL - S3_END}>
          <S4CTA frame={frame - S3_END} />
        </Sequence>
      </div>
    </AbsoluteFill>
  );
};
