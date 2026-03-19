/**
 * SharedSalonCinemaAd — "The Cinematic Reveal"
 *
 * Building sequence-by-sequence. Each sequence is committed before the next begins.
 *
 * ── Sequence 1 (f0–120, 4 seconds @ 30fps) ───────────────────────────────────
 *   f0–60   Camera Rise: phone revealed from bottom upward — starts at
 *           ground level looking up at the device (rotateX -22°, zoomed in,
 *           clip-path hides the top), then rises to eye level.
 *   f60–120 Pivot & Pull Back: camera steps back (scale 1.6 → 0.95) and arcs
 *           to a 3D angle (rotateY 22°) revealing the full titanium iPhone
 *           floating in dimensional space.
 *
 * Format:  9:16 portrait (1080 × 1920)
 * Duration: 120 frames @ 30fps = 4 seconds (grows as sequences are added)
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       "#07101F",
  primary:  "#2563EB",
  accent:   "#E7D3A7",
  text:     "#FAF8F5",
  body:     "#66758F",
  border:   "#D8DEE8",
  appBg:    "#FAF8F5",
  appText:  "#0B1730",
  dark:     "#060D1A",
} as const;

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';

// ─── Easing helpers ───────────────────────────────────────────────────────────
const cl   = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const eo3  = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 3);
const eo4  = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 4);
const eo5  = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 5);
const pr   = (f: number, s: number, d: number) => cl((f - s) / d, 0, 1);

// ─── Phone dimensions ─────────────────────────────────────────────────────────
const PH_W  = 390;
const PH_H  = 820;
const PH_CR = 50;
const SC_LR = 9;
const SC_T  = 15;
const SC_B  = 11;
const SC_W  = PH_W - SC_LR * 2;
const SC_H  = PH_H - SC_T - SC_B;

// ─── Shared Salon App Screen ──────────────────────────────────────────────────
// Shows the product from bottom (CTAs) → middle (headline) → top (nav)
// so the rising camera naturally reveals the story in the right order.
const AppScreen: React.FC = () => (
  <div style={{ width: SC_W, height: SC_H, background: C.appBg, fontFamily: SANS, overflow: "hidden" }}>
    {/* Status bar */}
    <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: C.appText }}>9:41</span>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {[4, 6, 8, 10].map((h, i) => (
          <div key={i} style={{ width: 2.5, height: h, borderRadius: 1.5, background: C.appText }} />
        ))}
        <div style={{ width: 20, height: 10, border: `1.5px solid ${C.appText}`, borderRadius: 3, marginLeft: 4, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, right: 5, background: C.appText, borderRadius: 1 }} />
        </div>
      </div>
    </div>

    {/* Nav */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 16px 8px" }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: C.primary, letterSpacing: "-0.02em" }}>Shared Salon</div>
      <div style={{ display: "flex", gap: 12 }}>
        {["List", "Find", "Login"].map(l => (
          <span key={l} style={{ fontSize: 9, color: C.body, fontWeight: 500 }}>{l}</span>
        ))}
      </div>
    </div>

    {/* Hero badge */}
    <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        background: `${C.primary}12`, border: `1px solid ${C.primary}30`,
        borderRadius: 100, padding: "4px 12px",
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.primary }} />
        <span style={{ fontSize: 8, fontWeight: 700, color: C.primary, letterSpacing: "0.06em" }}>For freelance stylists &amp; salons</span>
      </div>
    </div>

    {/* Hero headline */}
    <div style={{ textAlign: "center", padding: "10px 14px 0" }}>
      <div style={{ fontSize: 24, fontWeight: 900, color: C.appText, letterSpacing: "-0.03em", lineHeight: 1.12 }}>
        Rent a Chair<br /><span style={{ color: C.primary }}>Without a Care</span>
      </div>
      <div style={{ fontSize: 9, color: C.body, lineHeight: 1.55, marginTop: 7 }}>
        Find and rent salon chairs near you,<br />or list your unused space to earn.
      </div>
    </div>

    {/* Chair icon */}
    <div style={{ display: "flex", justifyContent: "center", marginTop: 12, marginBottom: 4 }}>
      <div style={{ fontSize: 46, lineHeight: 1 }}>💺</div>
    </div>

    {/* CTA buttons */}
    <div style={{ display: "flex", gap: 8, padding: "8px 14px 0" }}>
      <div style={{ flex: 1, background: C.primary, borderRadius: 10, padding: "11px 6px", textAlign: "center", boxShadow: "0 4px 14px rgba(37,99,235,0.30)" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>List Your Space</span>
      </div>
      <div style={{ flex: 1, border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: "11px 6px", textAlign: "center" }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: C.primary }}>Find a Space</span>
      </div>
    </div>

    {/* Trust badges */}
    <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 10 }}>
      {["✓ Verified", "⚡ Instant", "🔒 Secure"].map(b => (
        <span key={b} style={{ fontSize: 7.5, fontWeight: 600, color: C.body }}>{b}</span>
      ))}
    </div>

    {/* Divider */}
    <div style={{ height: 1, background: C.border, margin: "14px 14px 0", opacity: 0.6 }} />

    {/* Nearby listings */}
    <div style={{ padding: "10px 14px 0" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: C.appText, marginBottom: 8, letterSpacing: "-0.01em" }}>Nearby Spaces</div>
      {[
        { name: "The Styling Co.",   price: "$85/day", dist: "0.3 km", rating: "4.9" },
        { name: "Luxe Hair Studio",  price: "$90/day", dist: "0.7 km", rating: "4.8" },
        { name: "Maison Barbershop", price: "$75/day", dist: "1.1 km", rating: "4.7" },
      ].map((l, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 0", borderBottom: `1px solid ${C.border}40`,
        }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.appText }}>{l.name}</div>
            <div style={{ fontSize: 8, color: C.body, marginTop: 2 }}>⭐ {l.rating} · {l.dist}</div>
          </div>
          <div style={{ fontSize: 9, fontWeight: 800, color: C.primary }}>{l.price}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── iPhone Frame ─────────────────────────────────────────────────────────────
const IPhoneFrame: React.FC<{ gloss?: number; screenGlow?: number }> = ({
  gloss = 1,
  screenGlow = 0,
}) => (
  <div style={{
    width: PH_W, height: PH_H, borderRadius: PH_CR,
    background: "linear-gradient(160deg, #3E414E 0%, #1C1E27 28%, #191B23 55%, #252830 80%, #30333E 100%)",
    position: "relative",
    boxShadow: [
      "0 70px 140px rgba(0,0,0,0.85)",
      "0 24px 48px rgba(0,0,0,0.65)",
      "inset 0 0 0 1.5px rgba(255,255,255,0.10)",
      "inset 0 1px 0 rgba(255,255,255,0.20)",
    ].join(", "),
  }}>
    {/* Left-edge titanium gloss */}
    <div style={{
      position: "absolute", top: "8%", bottom: "8%", left: 0, width: "5%",
      borderRadius: `${PH_CR}px 0 0 ${PH_CR}px`,
      background: `linear-gradient(90deg, rgba(255,255,255,${0.08 * gloss}) 0%, transparent 100%)`,
      pointerEvents: "none",
    }} />

    {/* Right-edge gloss (catches light when rotateY > 0) */}
    <div style={{
      position: "absolute", top: "8%", bottom: "8%", right: 0, width: "6%",
      borderRadius: `0 ${PH_CR}px ${PH_CR}px 0`,
      background: `linear-gradient(270deg, rgba(255,255,255,${0.06 * gloss}) 0%, transparent 100%)`,
      pointerEvents: "none",
    }} />

    {/* Right side button (power) */}
    <div style={{
      position: "absolute", right: -4, top: "28%", width: 4, height: 72,
      borderRadius: "0 3px 3px 0",
      background: "linear-gradient(180deg, #28293A, #3C3F52, #28293A)",
      boxShadow: "2px 0 5px rgba(0,0,0,0.40)",
    }} />

    {/* Left side buttons (action + vol up + vol down) */}
    <div style={{ position: "absolute", left: -4, top: "22%", width: 4, height: 50, borderRadius: "3px 0 0 3px", background: "linear-gradient(180deg, #28293A, #3C3F52, #28293A)" }} />
    <div style={{ position: "absolute", left: -4, top: "31%", width: 4, height: 56, borderRadius: "3px 0 0 3px", background: "linear-gradient(180deg, #28293A, #3C3F52, #28293A)" }} />
    <div style={{ position: "absolute", left: -4, top: "41%", width: 4, height: 56, borderRadius: "3px 0 0 3px", background: "linear-gradient(180deg, #28293A, #3C3F52, #28293A)" }} />

    {/* Screen inset */}
    <div style={{
      position: "absolute", top: SC_T, bottom: SC_B, left: SC_LR, right: SC_LR,
      borderRadius: 40, overflow: "hidden", background: C.appBg,
    }}>
      {/* Dynamic Island */}
      <div style={{
        position: "absolute", top: 12, left: "50%",
        transform: "translateX(-50%)",
        width: 124, height: 34, borderRadius: 18,
        background: "#080A10", zIndex: 20,
        boxShadow: "0 2px 14px rgba(0,0,0,0.70)",
      }} />
      <AppScreen />
    </div>

    {/* Front glass gloss */}
    <div style={{
      position: "absolute", inset: 0, borderRadius: PH_CR,
      background: `linear-gradient(148deg,
        rgba(255,255,255,${0.04 * gloss}) 0%,
        transparent 40%,
        transparent 58%,
        rgba(255,255,255,${0.018 * gloss}) 100%)`,
      pointerEvents: "none",
    }} />

    {/* Home indicator */}
    <div style={{
      position: "absolute", bottom: 8, left: "50%",
      transform: "translateX(-50%)",
      width: 134, height: 4, borderRadius: 3,
      background: "rgba(255,255,255,0.30)",
    }} />

    {/* Screen light emission halo (on screen edge) */}
    {screenGlow > 0.02 && (
      <div style={{
        position: "absolute", top: SC_T, bottom: SC_B, left: SC_LR, right: SC_LR,
        borderRadius: 40,
        boxShadow: `0 0 28px rgba(37,99,235,${0.22 * screenGlow}), 0 0 56px rgba(37,99,235,${0.10 * screenGlow})`,
        pointerEvents: "none", zIndex: 5,
      }} />
    )}
  </div>
);

// ─── Sequence timing ──────────────────────────────────────────────────────────
const S1_RISE  = 0;
const S1_PIVOT = 60;
const S1_END   = 120;

// ─── Total (grows as sequences are added) ─────────────────────────────────────
const TOTAL = 120;

// ════════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════════
export const SharedSalonCinemaAd: React.FC = () => {
  const frame = useCurrentFrame();

  // ─── Organic handheld micro-drift ─────────────────────────────────────────
  const driftRX = Math.sin(frame * 0.022) * 0.22 + Math.sin(frame * 0.039) * 0.10;
  const driftRY = Math.sin(frame * 0.029) * 0.18 + Math.sin(frame * 0.044) * 0.08;
  const driftRZ = Math.sin(frame * 0.017) * 0.12;

  // ─── Phase progress ───────────────────────────────────────────────────────
  const riseT = eo4(pr(frame, S1_RISE, S1_PIVOT));   // 0→1 over first 2 seconds
  const pullT = eo5(pr(frame, S1_PIVOT, S1_END - S1_PIVOT)); // 0→1 over second 2 seconds

  // ─── Sequence 1: Phone transforms ────────────────────────────────────────
  // Phase 1 — Camera Rise
  //   The phone's top 80% is clipped initially (we see only the bottom).
  //   rotateX -22° tilts the phone away at the top (low angle / looking up).
  //   As riseT → 1, the clip opens, tilt levels out, scale eases back.
  //
  // Phase 2 — Pivot & Pull Back
  //   Clip is fully open. Scale pulls back (1.65 → 0.96).
  //   rotateY opens to 22° — the full titanium form floats in 3D space.

  let clipTop: number, translateY: number, scale: number;
  let rotX: number, rotY: number, rotZ: number, blurR: number;

  if (frame < S1_PIVOT) {
    clipTop    = (1 - eo5(riseT)) * 80;        // 80% → 0%  (top clip opens)
    translateY = (1 - eo4(riseT)) * 360;       // 360 → 0px (phone rises into center)
    scale      = 2.25 - eo3(riseT) * 0.60;     // 2.25 → 1.65
    rotX       = -22 + eo4(riseT) * 19;        // -22° → -3° (level out)
    rotY       = (1 - eo3(riseT)) * -6;        // -6° → 0° (subtle yaw resolves)
    rotZ       = 0;
    blurR      = (1 - eo4(pr(frame, 0, 20))) * 5; // entry blur sharpens in 20f
  } else {
    clipTop    = 0;
    translateY = 0 + eo3(pullT) * -12;         // lift 12px for elegance
    scale      = 1.65 - eo4(pullT) * 0.69;     // 1.65 → 0.96
    rotX       = -3 + eo4(pullT) * 7;          // -3° → 4° (slight low angle at rest)
    rotY       = eo5(pullT) * 22;              // 0° → 22° (3D dimensional pivot)
    rotZ       = eo3(pullT) * -1.2;            // subtle roll into the angle
    blurR      = 0;
  }

  // ─── Background atmosphere ────────────────────────────────────────────────
  const atmT     = eo4(pr(frame, 0, 36));
  const glowBreath = 0.10 + Math.sin(frame * 0.055) * 0.025;
  const glowPull   = eo3(pullT) * 0.06;       // glow deepens as phone reveals
  const floorOp   = eo4(pr(frame, S1_PIVOT + 12, 40));

  // Screen glow fades in after the rise
  const screenGlow = eo5(pr(frame, 6, 30));

  // Entry fade
  const fadeIn = eo4(pr(frame, 0, 14));

  return (
    <AbsoluteFill style={{ background: C.dark, overflow: "hidden" }}>

      {/* ── Background: radial brand glow ─────────────────────────────────── */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 820px 740px at 50% 48%,
          rgba(37,99,235,${glowBreath + glowPull}) 0%,
          transparent 66%)`,
        opacity: atmT,
      }} />

      {/* Subtle dot grid — adds dimensional depth to the dark bg */}
      <AbsoluteFill style={{
        backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.09) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        opacity: atmT * 0.55,
      }} />

      {/* ── Phone 3D container ─────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: `
          translate(-50%, calc(-50% + ${translateY}px))
          perspective(2600px)
          rotateX(${rotX + driftRX}deg)
          rotateY(${rotY + driftRY}deg)
          rotateZ(${rotZ + driftRZ}deg)
          scale(${scale})
        `,
        // Clip reveals phone from bottom upward during Phase 1
        clipPath: clipTop > 0.1
          ? `inset(${clipTop}% 0 0 0 round ${PH_CR}px)`
          : undefined,
        filter: blurR > 0.1 ? `blur(${blurR}px)` : undefined,
        opacity: fadeIn,
        zIndex: 10,
      }}>
        <IPhoneFrame gloss={0.7 + riseT * 0.3} screenGlow={screenGlow} />
      </div>

      {/* ── Outer screen glow halo (light spilling onto bg) ───────────────── */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: `translate(-50%, calc(-50% + ${translateY}px)) scale(${scale})`,
        width: PH_W + 100,
        height: PH_H + 100,
        borderRadius: PH_CR + 24,
        boxShadow: [
          `0 0 80px rgba(37,99,235,${0.20 * screenGlow})`,
          `0 0 160px rgba(37,99,235,${0.10 * screenGlow})`,
        ].join(", "),
        opacity: fadeIn,
        pointerEvents: "none",
        zIndex: 9,
      }} />

      {/* ── Ground shadow / floor reflection (Phase 2 only) ──────────────── */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        // Offset below phone center: half phone height * scale + small gap
        transform: `translate(-50%, calc(${(PH_H * 0.96 * scale) / 2}px + 8px))`,
        width: PH_W * 0.88 * scale,
        height: 50,
        background: `radial-gradient(ellipse at 50% 0%,
          rgba(37,99,235,0.32) 0%,
          transparent 72%)`,
        filter: "blur(18px)",
        opacity: floorOp * fadeIn,
        pointerEvents: "none",
        zIndex: 8,
      }} />

      {/* ── Ambient particles (subtle depth cues) ─────────────────────────── */}
      {[
        { x: 132,  y: 340,  s: 2.5, a: 0.30, p: 58, d: 0  },
        { x: 928,  y: 480,  s: 2,   a: 0.22, p: 46, d: 12 },
        { x: 210,  y: 1350, s: 3,   a: 0.20, p: 68, d: 24 },
        { x: 874,  y: 1220, s: 2,   a: 0.25, p: 54, d: 6  },
        { x: 540,  y: 260,  s: 2.5, a: 0.18, p: 62, d: 18 },
        { x: 306,  y: 1580, s: 2,   a: 0.22, p: 50, d: 32 },
        { x: 768,  y: 1520, s: 1.5, a: 0.16, p: 74, d: 44 },
      ].map((p, i) => {
        const phase = ((frame + p.d * 3) % p.p) / p.p;
        return (
          <div key={i} style={{
            position: "absolute", left: p.x, top: p.y,
            width: p.s, height: p.s, borderRadius: "50%",
            background: C.primary,
            opacity: Math.sin(phase * Math.PI) * p.a * atmT,
            pointerEvents: "none",
          }} />
        );
      })}

    </AbsoluteFill>
  );
};
