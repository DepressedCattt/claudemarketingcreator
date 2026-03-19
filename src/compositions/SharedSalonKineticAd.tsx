/**
 * SharedSalonKineticAd — "The Kinetic Chain" (v2)
 *
 * Core rule: nothing appears from nowhere.
 * Every scene is born from an existing on-screen object.
 *
 * FIXES v2:
 *  - Camera scale removed entirely (was sending content off-screen)
 *  - Camera rotX capped at ±4° (was -22°, distorting the whole scene)
 *  - Bezel-tilt effect moved onto the PHONE ELEMENT (rotateX + translateY on phone)
 *  - c2Appear / c3Appear formulas corrected (were inverted — cards appeared backwards)
 *  - Dark expansion now uses clip-path inset from panel bounds (not just opacity)
 *  - Portal blue fill separated from button element (button fades, solid fill takes over)
 *  - Chair flip completes before Card 1 starts appearing (timing fixed)
 *  - Card/panel positioned at vertical center (top: 700 instead of 588)
 *
 * CAMERA PERSONALITY (subtle but intentional):
 *  f0-96    Phone tilt: phone element rotates from -20° → level as it rises
 *  f124-172 Portal: camera drifts with gentle dutch (rotZ ±1.8°)
 *  f200-240 Dimensional orbit: rotY −4° (camera arcs left)
 *  f322-366 Card 1 flip: rotX dips −5° + lateral rotY (tracks the flip)
 *  f366-410 Card 2 flip: opposite lateral (tracks in the other direction)
 *  f444-492 Panel orbit: rotY swings −5° → +5° (camera arcs around panel)
 *  f540-606 Listing: translateX tracking shot follows progress bar
 *
 * Format:  9:16 portrait (1080 × 1920)
 * Duration: 756 frames @ 30fps = 25.2 seconds
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:       "#FAF8F5",
  primary:  "#2563EB",
  accent:   "#E7D3A7",
  text:     "#0B1730",
  body:     "#66758F",
  border:   "#D8DEE8",
  dark:     "#060D1A",
  warmDark: "#1C1917",
  success:  "#16A34A",
  purple:   "#7C3AED",
  green:    "#059669",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';

// ─── Phase markers ──────────────────────────────────────────────────────────
const P_ENTER    = 0;    // Phone element rises + tilts
const P_REVEAL   = 96;   // Full phone visible
const P_EXPAND   = 124;  // Portal expansion begins
const P_THRU     = 172;  // Through portal → dimensional space
const P_ORBIT    = 200;  // Camera orbits left, chair floats
const P_CHAIR    = 240;  // Chair lifts
const P_CARD1    = 312;  // Chair flip done — Card 1 materialises (fixed: after chair completes at ~304)
const P_FLIP1    = 352;  // Card 1 flips → Card 2
const P_FLIP2    = 396;  // Card 2 flips → Card 3
const P_MORPH    = 440;  // Card 3 over-rotates → marketplace panel
const P_ORBIT2   = 472;  // Panel orbit (stylist → venue)
const P_VENUE    = 520;  // Venue face revealed
const P_PUSH     = 538;  // Camera pushes into venue panel
const P_LIST     = 570;  // Listing UI
const P_STRETCH  = 636;  // Button stretch
const P_LIVE     = 666;  // Live listing card
const P_BLOOM    = 684;  // Bloom
const P_COLLAPSE = 718;  // Collapse
const P_BRAND    = 732;  // Brand lockup
const TOTAL      = 756;

// ─── Easing ─────────────────────────────────────────────────────────────────
const cl   = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const eo3  = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 3);
const eo4  = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 4);
const eo5  = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 5);
const eio3 = (t: number) => {
  const c = cl(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
const pr = (f: number, s: number, d: number) => cl((f - s) / d, 0, 1);

// ─── Phone dimensions ────────────────────────────────────────────────────────
const PH_W  = 390;
const PH_H  = 820;
const PH_CR = 50;
const SC_LR = 9;
const SC_T  = 15;
const SC_B  = 11;
const SC_W  = PH_W - SC_LR * 2;
const SC_H  = PH_H - SC_T - SC_B;

// ─── App screen ──────────────────────────────────────────────────────────────
const AppScreen: React.FC<{ scrollY?: number }> = ({ scrollY = 0 }) => (
  <div style={{ width: SC_W, height: SC_H, background: C.bg, fontFamily: SANS, overflow: "hidden" }}>
    <div style={{ transform: `translateY(${-scrollY}px)` }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[4, 6, 8, 10].map((h, i) => (
            <div key={i} style={{ width: 2.5, height: h, borderRadius: 1.5, background: C.text }} />
          ))}
          <div style={{ width: 20, height: 10, border: `1.5px solid ${C.text}`, borderRadius: 3, marginLeft: 4, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, right: 5, background: C.text, borderRadius: 1 }} />
          </div>
        </div>
      </div>
      <div style={{ height: 44 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.primary }}>Shared Salon</div>
        <div style={{ display: "flex", gap: 10 }}>
          {["List", "Find", "Login"].map(l => (
            <span key={l} style={{ fontSize: 9, color: C.body, fontWeight: 500 }}>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${C.primary}12`, border: `1px solid ${C.primary}30`, borderRadius: 100, padding: "4px 12px" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.primary }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: C.primary, letterSpacing: "0.06em" }}>For freelance stylists &amp; salons</span>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "12px 14px 0" }}>
        <div style={{ fontSize: 23, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1.12 }}>
          Rent a Chair<br /><span style={{ color: C.primary }}>Without a Care</span>
        </div>
        <div style={{ fontSize: 9, color: C.body, lineHeight: 1.55, marginTop: 8 }}>
          Find and rent salon chairs near you,<br />or list your unused space to earn.
        </div>
      </div>
      {/* Chair — the kinetic anchor */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14, marginBottom: 4 }}>
        <div style={{ fontSize: 42, lineHeight: 1 }}>💺</div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "8px 14px 0" }}>
        <div style={{ flex: 1, background: C.primary, borderRadius: 10, padding: "10px 6px", textAlign: "center", boxShadow: "0 4px 14px rgba(37,99,235,0.30)" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: "white" }}>List Your Space</span>
        </div>
        <div style={{ flex: 1, border: `1.5px solid ${C.primary}`, borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: C.primary }}>Find a Space</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 10 }}>
        {["✓ Verified", "⚡ Instant", "🔒 Secure"].map(b => (
          <span key={b} style={{ fontSize: 7.5, fontWeight: 600, color: C.body }}>{b}</span>
        ))}
      </div>
    </div>
  </div>
);

const IPhoneFrame: React.FC<{ scrollY?: number; gloss?: number }> = ({ scrollY = 0, gloss = 1 }) => (
  <div style={{
    width: PH_W, height: PH_H, borderRadius: PH_CR,
    background: "linear-gradient(160deg, #3A3D4A 0%, #1C1E27 30%, #1A1C24 55%, #252830 80%, #2E313C 100%)",
    position: "relative",
    boxShadow: "0 60px 120px rgba(0,0,0,0.70), 0 20px 40px rgba(0,0,0,0.50), inset 0 0 0 1.5px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.16)",
  }}>
    <div style={{ position: "absolute", top: "8%", bottom: "8%", left: 0, width: "5%", borderRadius: `${PH_CR}px 0 0 ${PH_CR}px`, background: `linear-gradient(90deg, rgba(255,255,255,${0.07 * gloss}) 0%, transparent 100%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", right: -3.5, top: "28%", width: 4, height: 72, borderRadius: "0 3px 3px 0", background: "linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)", boxShadow: "2px 0 4px rgba(0,0,0,0.35)" }} />
    <div style={{ position: "absolute", left: -3.5, top: "23%", width: 4, height: 54, borderRadius: "3px 0 0 3px", background: "linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)" }} />
    <div style={{ position: "absolute", left: -3.5, top: "32%", width: 4, height: 54, borderRadius: "3px 0 0 3px", background: "linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)" }} />
    <div style={{ position: "absolute", top: SC_T, bottom: SC_B, left: SC_LR, right: SC_LR, borderRadius: 40, overflow: "hidden", background: C.bg }}>
      <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", width: 120, height: 32, borderRadius: 18, background: "#0B0D14", zIndex: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.6)" }} />
      <AppScreen scrollY={scrollY} />
    </div>
    <div style={{ position: "absolute", inset: 0, borderRadius: PH_CR, background: `linear-gradient(145deg, rgba(255,255,255,${0.035 * gloss}) 0%, transparent 45%, transparent 60%, rgba(255,255,255,${0.015 * gloss}) 100%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 130, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.28)" }} />
  </div>
);

// ─── Pulse ring ──────────────────────────────────────────────────────────────
const PulseRing: React.FC<{ elapsed: number; delay: number; color?: string; maxR?: number }> = ({
  elapsed, delay, color = C.primary, maxR = 440,
}) => {
  const t = cl((elapsed - delay) / 62, 0, 1);
  if (t <= 0 || t >= 1) return null;
  const r = t * maxR;
  return (
    <div style={{
      position: "absolute", left: "50%", top: "50%",
      width: r * 2, height: r * 2, borderRadius: "50%",
      border: `2px solid ${color}`,
      transform: "translate(-50%, -50%)",
      opacity: (1 - t) * 0.55,
      pointerEvents: "none",
    }} />
  );
};

// ─── Activity card (blooms outward from listing card center) ─────────────────
interface ACardProps {
  frame: number; startFrame: number; collapseFrame: number;
  dx: number; dy: number;
  initials: string; name: string; service: string;
  amount: number; color: string;
}
const ActivityCard: React.FC<ACardProps> = ({
  frame, startFrame, collapseFrame, dx, dy,
  initials, name, service, amount, color,
}) => {
  const appear   = eo5(pr(frame, startFrame, 30));
  const collapse = eo5(pr(frame, collapseFrame, 26));
  const t = appear * (1 - collapse);
  if (t < 0.02) return null;
  // Card CENTER travels from canvas-center to (540+dx, 960+dy)
  const cx = 540 + dx * t;  // left edge = cx - 160 (card is 320px wide)
  const cy = 960 + dy * t;  // top edge = cy - 48  (card is ~96px tall)
  return (
    <div style={{
      position: "absolute",
      left: cx - 160,
      top:  cy - 48,
      opacity: t,
      transform: `scale(${0.72 + t * 0.28})`,
      transformOrigin: "center",
      background: "white", border: `1.5px solid ${C.border}`,
      borderRadius: 18, padding: "14px 20px",
      display: "flex", alignItems: "center", gap: 14,
      boxShadow: "0 8px 28px rgba(11,23,48,0.09)",
      width: 320,
      pointerEvents: "none",
    }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", background: `${color}16`, border: `2px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color, fontFamily: SANS, flexShrink: 0 }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, color, fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>{service}</div>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: SANS }}>{name}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 26, fontWeight: 900, color: C.primary, fontFamily: SANS, lineHeight: 1 }}>${amount}</div>
        <div style={{ fontSize: 9, color: C.success, fontFamily: SANS, fontWeight: 700, marginTop: 1 }}>✓ CONFIRMED</div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const SharedSalonKineticAd: React.FC = () => {
  const frame = useCurrentFrame();

  // ─── Micro-drift: handheld organic feel (always on) ─────────────────────
  // Kept very small — this should feel like breathing, not shaking
  const driftRX = Math.sin(frame * 0.021) * 0.22 + Math.sin(frame * 0.037) * 0.12;
  const driftRY = Math.sin(frame * 0.028) * 0.18 + Math.sin(frame * 0.043) * 0.10;
  const driftRZ = Math.sin(frame * 0.019) * 0.14;

  // ─── Intentional camera movements ───────────────────────────────────────
  // FIX: Scale REMOVED — it was the primary jankiness cause.
  //      Camera stays at scale 1.0; element animations provide all "push/pull" feeling.
  //      Max rotation angles capped at ±5° so content never leaves screen.
  let camRX = 0, camRY = 0, camRZ = 0, camTX = 0;

  if (frame < P_REVEAL) {
    // Nothing from camera here — the PHONE ELEMENT handles the bezel-tilt effect
    camRY = 0;
  } else if (frame < P_EXPAND) {
    const t = pr(frame, P_REVEAL, P_EXPAND - P_REVEAL);
    camRY   = Math.sin(t * Math.PI * 1.5) * 1.2;  // gentle sway
  } else if (frame < P_THRU) {
    // Portal rush — subtle dutch tilt (feels like momentum through the button)
    const t = pr(frame, P_EXPAND, P_THRU - P_EXPAND);
    camRZ   =  Math.sin(t * Math.PI) * 1.8;
    camRX   = -Math.sin(t * Math.PI) * 1.5;
  } else if (frame < P_ORBIT) {
    // Settle into dimensional space — dutch resolves
    const t = eo5(pr(frame, P_THRU, P_ORBIT - P_THRU));
    camRZ   = 1.8 * (1 - t);
    camRX   = -1.5 * (1 - t);
  } else if (frame < P_CHAIR) {
    // Orbit left — camera arcs to see chair from slight angle
    const t = eo3(pr(frame, P_ORBIT, P_CHAIR - P_ORBIT));
    camRY   = -t * 4;
  } else if (frame < P_CARD1) {
    camRY   = -4;
  } else if (frame < P_FLIP1) {
    // Card 1 resolves — camera centers up, tilts slightly down toward card
    const t = eo5(pr(frame, P_CARD1, P_FLIP1 - P_CARD1));
    camRY   = -4 + t * 4;
    camRX   = -t * 3;
  } else if (frame < P_FLIP2) {
    // Card 1 flips Y (side-flip) — camera rolls Z slightly to "track" the lateral flip,
    // with a gentle lateral pan. No rotX dip (was fighting the Y-axis card rotation).
    const ft = eio3(pr(frame, P_FLIP1, P_FLIP2 - P_FLIP1));
    camRX   = -2.5;
    camRZ   =  Math.sin(ft * Math.PI) * 1.8;   // roll to the left with the flip
    camRY   = -Math.sin(ft * Math.PI) * 2.5;   // slight pull toward flip direction
  } else if (frame < P_MORPH) {
    // Card 2 flips Y — camera rolls opposite direction (mirrors the flip)
    const ft = eio3(pr(frame, P_FLIP2, P_MORPH - P_FLIP2));
    camRX   = -2.5;
    camRZ   = -Math.sin(ft * Math.PI) * 1.8;
    camRY   =  Math.sin(ft * Math.PI) * 2.5;
  } else if (frame < P_ORBIT2) {
    // Card 3 → panel morph — camera levels out
    const t = eo4(pr(frame, P_MORPH, P_ORBIT2 - P_MORPH));
    camRX   = -3 + t * 3;
  } else if (frame < P_VENUE) {
    // PANEL ORBIT — camera swings from −5° to +5° (left-to-right arc)
    const t = eio3(pr(frame, P_ORBIT2, P_VENUE - P_ORBIT2));
    camRY   = -5 + t * 10;
    camRX   =  Math.sin(t * Math.PI) * 3;
  } else if (frame < P_PUSH) {
    // Hold on venue side — slight up-tilt (low angle on venue panel)
    const t = eo4(pr(frame, P_VENUE, P_PUSH - P_VENUE));
    camRY   =  5 - t * 2;
    camRX   = -t * 3;
  } else if (frame < P_LIST) {
    // Push into panel — dutch tilt
    const t = eo5(pr(frame, P_PUSH, P_LIST - P_PUSH));
    camRY   =  3 - t * 3;
    camRX   = -3 + t * 3;
    camRZ   =  Math.sin(t * Math.PI) * 1.5;
  } else if (frame < P_STRETCH) {
    // Listing — TRACKING SHOT pans slightly right with progress bar
    const track = pr(frame, P_LIST + 18, 56);
    camTX       = -eo3(track) * 28;
    camRX       =  1.5;
    camRY       =  eo3(pr(frame, P_LIST, 50)) * 2;
  } else if (frame < P_LIVE) {
    const t = pr(frame, P_STRETCH, P_LIVE - P_STRETCH);
    camTX   = -28 + eo4(t) * 28;
    camRX   =  1.5;
    camRY   =  2 - eo3(t) * 2;
  } else if (frame < P_COLLAPSE) {
    // Bloom — gentle pull back (camera, not scale change)
    const t = eo4(pr(frame, P_LIVE, P_COLLAPSE - P_LIVE));
    camRX   =  1.5 - t * 2.5;
    camRY   =  t * 3;
  } else if (frame < P_BRAND) {
    const t = eo4(pr(frame, P_COLLAPSE, P_BRAND - P_COLLAPSE));
    camRY   =  3 - t * 3;
  } else {
    const bt = pr(frame, P_BRAND, TOTAL - P_BRAND);
    camRX   = Math.sin(bt * Math.PI * 0.5) * 0.3;
  }

  const camFinalRX = camRX + driftRX;
  const camFinalRY = camRY + driftRY;
  const camFinalRZ = camRZ + driftRZ;

  // ─── Global atmosphere ───────────────────────────────────────────────────
  const atmT       = eo4(pr(frame, 0, 30));
  const glowBreath = 0.55 + Math.sin(frame * 0.07) * 0.45;
  const brightBg   = 1 - eo4(pr(frame, P_PUSH, 28));

  // ─── Phone lifecycle ─────────────────────────────────────────────────────
  // FIX: Bezel-tilt effect is on the PHONE ELEMENT, not the camera wrapper.
  // The phone starts tilted back (-20° rotX) and below center (+220px),
  // simulating the camera looking up at the bottom bezel.
  const revealT   = eo5(pr(frame, P_ENTER, P_REVEAL - P_ENTER));
  const phoneRise = (1 - revealT) * 220;       // rises 220px into position
  const phoneTilt = (1 - eo4(pr(frame, P_ENTER, P_REVEAL - P_ENTER))) * -20; // tilts from -20° → 0°
  const clipTop   = (1 - revealT) * 68;        // clip reveals from bottom upward

  const arcX     = (1 - eo3(pr(frame, P_ENTER, 28))) * -32;
  const blurR    = (1 - eo4(pr(frame, P_ENTER + 4, 28))) * 8;
  const scrollY  = (1 - eo4(pr(frame, P_ENTER, 88))) * 340;
  const floatY   = Math.sin((frame / 108) * Math.PI * 2) * 4;

  let phoneScale: number, phoneOp: number;
  if (frame < P_EXPAND) {
    phoneScale = 1.82; phoneOp = 1.0;
  } else if (frame < P_ORBIT) {
    const t    = eo4(pr(frame, P_EXPAND, P_ORBIT - P_EXPAND));
    phoneScale = 1.82 - t * 0.82; phoneOp = 1.0 - t * 0.76;
  } else if (frame < P_PUSH) {
    phoneScale = 1.0; phoneOp = 0.16;
  } else if (frame < P_COLLAPSE) {
    phoneScale = 0; phoneOp = 0;
  } else {
    const t    = eo5(pr(frame, P_COLLAPSE, 36));
    phoneScale = t * 0.72; phoneOp = t * 0.50;
  }

  const entryTY = frame < P_REVEAL ? phoneRise + floatY : floatY * (1 - eo4(pr(frame, P_EXPAND, 18)));

  // ─── Portal (CTA button → blue fill) ────────────────────────────────────
  // FIX: Separated into two distinct elements:
  //   1. The button itself scales up and fades (visual of button expanding)
  //   2. A separate solid blue fill covers the canvas
  const btnAppear   = eo5(pr(frame, P_REVEAL + 6, 20));
  const btnScaleAmt = interpolate(frame, [P_EXPAND, P_THRU - 8], [1, 38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const btnOp       = btnAppear * cl(1 - eo4(pr(frame, P_EXPAND + 20, 30)), 0, 1);

  // Solid blue portal fill: ramps up cleanly and holds until settled
  const portalFill  = eo5(pr(frame, P_EXPAND + 28, 22)) * (1 - eo4(pr(frame, P_THRU, 24)));

  // ─── Dimensional space content ───────────────────────────────────────────
  // Start appearing at P_THRU (172) not P_ORBIT (200) — overlaps with portal fade,
  // eliminating the dead zone between "blue portal" and "dimensional space"
  const heroAT  = eo4(pr(frame, P_THRU + 6, 28));
  const heroBT  = eo4(pr(frame, P_THRU + 20, 28));
  const chip1T  = eo4(pr(frame, P_THRU + 34, 22));
  const chip2T  = eo4(pr(frame, P_THRU + 44, 22));
  const heroOp  = heroAT * (1 - eo4(pr(frame, P_CHAIR, 22)));
  const chipOp  = chip1T * (1 - eo4(pr(frame, P_CHAIR, 18)));
  const badgeOp = eo4(pr(frame, 52, 20)) * (1 - eo3(pr(frame, P_EXPAND, 16)));

  // ─── Chair element ───────────────────────────────────────────────────────
  // Chair flip: eio3 over 58 frames from P_CHAIR+6=246 → completes at frame 304
  // P_CARD1 is now 312 — 8 frames of clean overlap for chair fade + card fade in
  const chairAppear = eo5(pr(frame, P_ORBIT + 10, 30));
  const chairLiftY  = -eo4(pr(frame, P_CHAIR, 48)) * 76;
  const chairFlipY  = eio3(pr(frame, P_CHAIR + 6, 58)) * 180;  // 246→304
  const chairOrbit  = Math.sin((frame / 130) * Math.PI * 2) * 4;
  const chairOp     = chairAppear * (1 - eo5(pr(frame, P_CARD1, 18)));  // fades as card1 appears

  // ─── Panel dimensions (declared early — referenced by both cards and panel sections) ──
  const PANEL_H = 560;
  const PANEL_W = 900;

  // ─── Step cards ─────────────────────────────────────────────────────────
  // CARD_Y 800: card center at y=901, below canvas center (960). Less dead space below.
  const CARD_Y = 800;
  const CARD_W = 860;
  const CARD_H = 202;

  const c1Appear  = eo5(pr(frame, P_CARD1, 26));
  // rotateY (horizontal / side-flip) — matches the card-deck mental model far better than rotateX.
  // rotateX ("forward flip") rotates around bottom edge, feels like a page on a table.
  // rotateY ("side flip") looks like turning a playing card — natural for a "kinetic deck".
  const c1FlipY   = eio3(pr(frame, P_FLIP1, P_FLIP2 - P_FLIP1)) * -180;
  // Fade starts immediately as flip begins (no 4-frame delay) — eliminates the card hanging visible
  const c1Visible = c1Appear * (1 - eo5(pr(frame, P_FLIP1, 20)));

  // TIME-BASED appear (18 frames into the flip = midway). Cleaner than angle-based which could blink.
  // Card 2 starts at rotateY(180°) = facing away → unfolds to 0° as c2Appear → 1
  const c2Appear  = eo5(pr(frame, P_FLIP1 + 18, 26));
  const c2FlipY   = eio3(pr(frame, P_FLIP2, P_MORPH - P_FLIP2)) * -180;
  const c2Visible = c2Appear * (1 - eo5(pr(frame, P_FLIP2, 20)));

  // Time-based: card 3 appears 18 frames into flip 2
  const c3Appear  = eo5(pr(frame, P_FLIP2 + 18, 26));
  // Card 3 morphs width/height as card 3 → panel (same morph concept, just no over-rotation)
  const c3MorphW  = CARD_W + eo4(pr(frame, P_MORPH, P_ORBIT2 - P_MORPH)) * (PANEL_W - CARD_W);
  const c3MorphH  = CARD_H + eo4(pr(frame, P_MORPH, P_ORBIT2 - P_MORPH)) * (PANEL_H - CARD_H);
  const c3Visible = c3Appear * (1 - eo4(pr(frame, P_ORBIT2, 22)));

  const cardsAlpha = 1 - eo4(pr(frame, P_ORBIT2, 20));

  // ─── Marketplace panel ───────────────────────────────────────────────────
  // NOTE: PANEL_W and PANEL_H are also referenced above in c3MorphW/c3MorphH —
  // they were hoisted here to avoid forward-reference TS errors.
  const PANEL_TOP = CARD_Y;
  const PANEL_L   = (1080 - PANEL_W) / 2;  // 90px

  const panelAppear = eo5(pr(frame, P_ORBIT2, 20));
  const panelFlipY  = eio3(pr(frame, P_ORBIT2 + 6, P_VENUE - P_ORBIT2 - 12)) * 180;
  const midGlow     = interpolate(panelFlipY, [60, 90, 120], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panelOp     = panelAppear * (1 - eo5(pr(frame, P_PUSH + 4, 22)));

  // ─── Dark expansion — clip-path grows from panel bounds ──────────────────
  // FIX: Instead of opacity fade, the dark surface expands from the panel's exact
  // position using inset() clip-path (same technique as SharedSalonOneShot).
  const DARK_INS_T = PANEL_TOP;
  const DARK_INS_R = PANEL_L;
  const DARK_INS_B = 1920 - PANEL_TOP - PANEL_H;  // 1920 - 690 - 560 = 670
  const DARK_INS_L = PANEL_L;

  const darkExpandT = eo5(pr(frame, P_PUSH, 40));
  const darkLiftT   = eo4(pr(frame, P_BLOOM, 44));
  const darkTotal   = darkExpandT * (1 - darkLiftT);

  // Clip-path shrinks insets from panel bounds → 0 (full canvas)
  const dInsT = DARK_INS_T * (1 - darkExpandT);
  const dInsR = DARK_INS_R * (1 - darkExpandT);
  const dInsB = DARK_INS_B * (1 - darkExpandT);
  const dInsL = DARK_INS_L * (1 - darkExpandT);

  // ─── Listing content ─────────────────────────────────────────────────────
  const listHdr  = eo4(pr(frame, P_LIST + 4, 20));
  const progPct  = interpolate(frame,
    [P_LIST + 18, P_LIST + 32, P_LIST + 48, P_LIST + 62],
    [0, 33, 66, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const check1   = eo5(pr(frame, P_LIST + 18, 22));
  const check2   = eo5(pr(frame, P_LIST + 34, 22));
  const check3   = eo5(pr(frame, P_LIST + 50, 22));
  const btnPress = interpolate(frame, [P_STRETCH, P_STRETCH + 6, P_STRETCH + 12], [1, 0.93, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const btnGlow  = eo4(pr(frame, P_STRETCH, 18));

  const btnStretchW = interpolate(frame, [P_STRETCH + 8, P_LIVE], [220, 920], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const btnStretchH = interpolate(frame, [P_STRETCH + 14, P_LIVE], [82, 110], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stretchOp   = eo4(pr(frame, P_STRETCH, 8)) * (1 - eo3(pr(frame, P_LIVE - 4, 10)));

  const lCardT = eo5(pr(frame, P_LIVE, 24));
  const lPulse = 0.7 + Math.sin(frame * 0.17) * 0.3;

  // ─── Bloom ───────────────────────────────────────────────────────────────
  const bloomElapsed = frame - P_BLOOM;
  const bloomAlpha   = eo4(pr(frame, P_BLOOM, 28));
  const payOp        = 1 - eo4(pr(frame, P_COLLAPSE, 26));
  const revenue      = interpolate(frame,
    [P_BLOOM + 10, P_BLOOM + 28, P_BLOOM + 48],
    [0, 420, 1260],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ─── Brand close ─────────────────────────────────────────────────────────
  const brT1   = eo4(pr(frame, P_BRAND, 18));
  const brT2   = eo4(pr(frame, P_BRAND + 10, 18));
  const brSub  = eo3(pr(frame, P_BRAND + 22, 16));
  const brLine = eo3(pr(frame, P_BRAND + 28, 16));
  const brBtn  = eo5(pr(frame, P_BRAND + 36, 16));
  const brUrl  = eo3(pr(frame, P_BRAND + 46, 12));
  const brGlow = 0.35 + Math.sin(frame * 0.10) * 0.20;

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>

      {/* ── CAMERA WRAPPER (subtle — no scale) ───────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, perspective: "2800px", perspectiveOrigin: "50% 50%" }}>
        <div style={{
          position: "absolute", inset: 0,
          transform: `rotateX(${camFinalRX}deg) rotateY(${camFinalRY}deg) rotateZ(${camFinalRZ}deg) translateX(${camTX}px)`,
          transformOrigin: "center center",
        }}>

          {/* ── BACKGROUND ──────────────────────────────────────────────── */}
          <AbsoluteFill style={{ background: C.bg }} />
          <AbsoluteFill style={{
            background: `radial-gradient(ellipse 880px 740px at 50% 44%, rgba(37,99,235,${0.09 * atmT * glowBreath}) 0%, transparent 65%)`,
            opacity: brightBg,
          }} />
          <AbsoluteFill style={{
            backgroundImage: "radial-gradient(circle, rgba(11,23,48,0.024) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
            opacity: atmT * brightBg,
          }} />
          {[
            { x: 72,  y: 280,  p: 72, d: 0,  s: 5 },
            { x: 984, y: 400,  p: 60, d: 14, s: 4 },
            { x: 188, y: 620,  p: 84, d: 28, s: 6 },
            { x: 916, y: 840,  p: 66, d: 8,  s: 4 },
            { x: 128, y: 1280, p: 76, d: 40, s: 5 },
            { x: 365, y: 1540, p: 80, d: 44, s: 6 },
          ].map((s, i) => {
            const phase = ((frame + s.d * 4) % s.p) / s.p;
            return (
              <div key={i} style={{
                position: "absolute", left: s.x, top: s.y,
                width: s.s, height: s.s, borderRadius: "50%",
                background: C.accent,
                opacity: Math.sin(phase * Math.PI) * 0.48 * atmT * brightBg,
                pointerEvents: "none",
              }} />
            );
          })}

          {/* ── PHONE — with bezel-tilt on the element itself ─────────────── */}
          {phoneOp > 0.01 && (
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: `
                translate(calc(-50% + ${arcX}px), calc(-50% + ${entryTY}px))
                perspective(1800px)
                rotateX(${phoneTilt}deg)
                scale(${phoneScale})
              `,
              clipPath: `inset(${clipTop}% 0 0 0 round ${PH_CR}px)`,
              filter: `blur(${blurR}px)`,
              opacity: phoneOp,
              zIndex: 10,
            }}>
              <IPhoneFrame scrollY={scrollY} gloss={revealT * 0.85 + (1 - revealT) * 0.15} />
            </div>
          )}

          {/* Brand badge — entry only */}
          {badgeOp > 0.01 && (
            <div style={{
              position: "absolute", bottom: 100, left: 0, right: 0,
              display: "flex", justifyContent: "center",
              opacity: badgeOp, zIndex: 15,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.20)",
                borderRadius: 100, padding: "10px 28px",
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, boxShadow: `0 0 8px ${C.primary}60` }} />
                <span style={{ fontSize: 16, fontWeight: 700, color: C.primary, fontFamily: SANS, letterSpacing: "0.06em" }}>Shared Salon</span>
              </div>
            </div>
          )}

          {/* ── PORTAL — button scale + separate solid fill ───────────────── */}
          {/* Button itself scales (fades before reaching full scale) */}
          {btnOp > 0.01 && (
            <div style={{
              position: "absolute", left: "50%", top: 980,
              transform: `translate(-50%, -50%) scale(${btnScaleAmt})`,
              opacity: btnOp,
              transformOrigin: "center center",
              zIndex: 20,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 14,
                background: C.primary, borderRadius: 22, padding: "22px 56px",
                boxShadow: "0 20px 56px rgba(37,99,235,0.44)",
                whiteSpace: "nowrap",
              }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: "white", fontFamily: SANS }}>List Your Space</span>
                <span style={{ fontSize: 26, color: "rgba(255,255,255,0.72)" }}>&#x2192;</span>
              </div>
            </div>
          )}
          {/* Solid blue fill — independent of button, covers canvas cleanly */}
          {portalFill > 0.01 && (
            <div style={{
              position: "absolute", inset: 0,
              background: C.primary,
              opacity: portalFill,
              zIndex: 21,
              pointerEvents: "none",
            }} />
          )}

          {/* ── DIMENSIONAL SPACE ─────────────────────────────────────────── */}
          {heroOp > 0.01 && (
            <>
              <div style={{
                position: "absolute", left: "50%", top: 420,
                transform: "translateX(-50%)",
                opacity: heroOp, textAlign: "center", zIndex: 25,
              }}>
                <div style={{ fontSize: 60, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: "-0.04em", opacity: heroAT }}>
                  Rent a Chair
                </div>
                <div style={{ fontSize: 60, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: "-0.04em", marginTop: 2, opacity: heroBT }}>
                  Without a Care
                </div>
              </div>
              <div style={{
                position: "absolute", left: 148, top: 1100,
                opacity: chipOp * (1 - eo4(pr(frame, P_CHAIR, 18))),
                zIndex: 25, transform: `translateY(${(1 - chip1T) * 20}px)`,
              }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px 20px", boxShadow: "0 8px 24px rgba(11,23,48,0.10)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.success, boxShadow: `0 0 8px ${C.success}60` }} />
                  <span style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: SANS }}>&#x2713; Verified Venues</span>
                </div>
              </div>
              <div style={{
                position: "absolute", right: 108, top: 1160,
                opacity: chipOp * (1 - eo4(pr(frame, P_CHAIR, 18))),
                zIndex: 25, transform: `translateY(${(1 - chip2T) * 20}px)`,
              }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px 20px", boxShadow: "0 8px 24px rgba(11,23,48,0.10)" }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: C.primary, fontFamily: SANS }}>&#x26A1; Instant Booking</span>
                </div>
              </div>
            </>
          )}

          {/* ── CHAIR — lifts, spins Y, back-face IS Card 1 ──────────────── */}
          {chairOp > 0.01 && (
            <div style={{
              position: "absolute", left: "50%", top: 920,
              transform: `translate(-50%, ${chairLiftY}px)`,
              opacity: chairOp, perspective: 1600, perspectiveOrigin: "50% 50%", zIndex: 30,
            }}>
              <div style={{
                transformStyle: "preserve-3d",
                transform: `rotateY(${chairFlipY + chairOrbit}deg)`,
                width: 260, height: 260,
              }}>
                <div style={{
                  position: "absolute", width: 260, height: 260,
                  backfaceVisibility: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `radial-gradient(ellipse at 42% 38%, rgba(37,99,235,0.13) 0%, rgba(37,99,235,0.04) 58%, transparent 100%)`,
                  borderRadius: "50%",
                  border: `2px solid rgba(37,99,235,0.16)`,
                  boxShadow: "0 20px 56px rgba(37,99,235,0.15)",
                }}>
                  <div style={{ fontSize: 88, lineHeight: 1 }}>💺</div>
                </div>
                <div style={{
                  position: "absolute", width: 260, height: 260,
                  backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexDirection: "column", gap: 8,
                  background: "white", borderRadius: 24, border: `1.5px solid ${C.border}`,
                  boxShadow: "0 20px 52px rgba(11,23,48,0.12)",
                }}>
                  <div style={{ fontSize: 34 }}>✉️</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, fontFamily: SANS, textAlign: "center", padding: "0 16px" }}>Create an Account</div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP CARDS — kinetic flip chain ──────────────────────────── */}
          {c1Appear > 0.01 && (
            <div style={{
              position: "absolute", left: "50%", top: CARD_Y,
              transform: `translateX(-50%) perspective(1800px) rotateY(${c1FlipY}deg)`,
              transformOrigin: "center center",
              width: CARD_W, opacity: c1Visible * cardsAlpha, zIndex: 32,
            }}>
              <div style={{
                backfaceVisibility: "hidden",
                background: "white", border: `1.5px solid ${C.border}`, borderRadius: 24, padding: "30px 44px",
                boxShadow: "0 18px 52px rgba(11,23,48,0.10)", display: "flex", alignItems: "center", gap: 30,
              }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.primary}12`, border: `2px solid ${C.primary}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>✉️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.primary, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5 }}>Step 1</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: C.text, fontFamily: SANS, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>Create an account</div>
                  <div style={{ fontSize: 18, color: C.body, fontFamily: SANS }}>Sign up in seconds — no credit card needed</div>
                </div>
                <div style={{ fontSize: 28, color: `${C.primary}80`, fontWeight: 700 }}>&#x2192;</div>
              </div>
            </div>
          )}

          {c2Appear > 0.01 && (
            <div style={{
              position: "absolute", left: "50%", top: CARD_Y,
              // Starts at rotateY(180°) = invisible (backfaceVisibility hides it), unfolds to 0° + then own flip
              transform: `translateX(-50%) perspective(1800px) rotateY(${(1 - c2Appear) * 180 + c2FlipY}deg)`,
              transformOrigin: "center center",
              width: CARD_W, opacity: c2Visible * cardsAlpha, zIndex: 32,
            }}>
              <div style={{
                backfaceVisibility: "hidden",
                background: "white", border: `1.5px solid ${C.border}`, borderRadius: 24, padding: "30px 44px",
                boxShadow: "0 18px 52px rgba(11,23,48,0.10)", display: "flex", alignItems: "center", gap: 30,
              }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.purple}12`, border: `2px solid ${C.purple}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>📍</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5 }}>Step 2</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: C.text, fontFamily: SANS, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>Browse or list</div>
                  <div style={{ fontSize: 18, color: C.body, fontFamily: SANS }}>Find a chair nearby or post your space</div>
                </div>
                <div style={{ fontSize: 28, color: `${C.purple}80`, fontWeight: 700 }}>&#x2192;</div>
              </div>
            </div>
          )}

          {c3Appear > 0.01 && (
            <div style={{
              position: "absolute", left: "50%", top: CARD_Y,
              // No over-rotation: card 3 simply unfolds from 180°→0°, then morphs width/height into panel
              transform: `translateX(-50%) perspective(1800px) rotateY(${(1 - c3Appear) * 180}deg)`,
              transformOrigin: "center center",
              width: c3MorphW, height: c3MorphH > CARD_H ? c3MorphH : undefined, overflow: "hidden",
              opacity: c3Visible * cardsAlpha, zIndex: 32,
            }}>
              <div style={{
                backfaceVisibility: "hidden",
                background: "white", border: `1.5px solid ${C.border}`, borderRadius: 24, padding: "30px 44px",
                boxShadow: "0 18px 52px rgba(11,23,48,0.10)",
                width: "100%", height: "100%",
                display: "flex", alignItems: c3MorphH > CARD_H + 60 ? "flex-start" : "center", gap: 30,
              }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: `${C.green}12`, border: `2px solid ${C.green}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 28 }}>📅</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.green, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5 }}>Step 3</div>
                  <div style={{ fontSize: 34, fontWeight: 800, color: C.text, fontFamily: SANS, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>Book &amp; connect</div>
                  <div style={{ fontSize: 18, color: C.body, fontFamily: SANS }}>Confirm the booking and get to work</div>
                </div>
                <div style={{ fontSize: 28, color: `${C.green}80`, fontWeight: 700 }}>&#x2192;</div>
              </div>
            </div>
          )}

          {/* ── MARKETPLACE PANEL ─────────────────────────────────────────── */}
          {panelOp > 0.01 && (
            <div style={{
              position: "absolute", left: PANEL_L, top: PANEL_TOP,
              width: PANEL_W, opacity: panelOp,
              perspective: 2400, perspectiveOrigin: "50% 50%", zIndex: 35,
            }}>
              {midGlow > 0.05 && (
                <div style={{
                  position: "absolute", inset: -60,
                  background: `radial-gradient(circle at 50% 50%, rgba(37,99,235,${0.52 * midGlow}) 0%, transparent 55%)`,
                  filter: "blur(44px)", pointerEvents: "none", zIndex: 30, borderRadius: 30,
                }} />
              )}
              <div style={{ transformStyle: "preserve-3d", transform: `rotateY(${panelFlipY}deg)`, width: PANEL_W }}>
                <div style={{ position: "absolute", width: PANEL_W, backfaceVisibility: "hidden" }}>
                  <div style={{
                    background: `linear-gradient(145deg, ${C.primary} 0%, #1A3FC7 100%)`,
                    borderRadius: 28, padding: "44px 52px", minHeight: PANEL_H,
                    boxShadow: "0 30px 80px rgba(37,99,235,0.38)",
                  }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.14)", borderRadius: 100, padding: "8px 20px", marginBottom: 24 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: SANS }}>For Stylists &amp; Freelancers</span>
                    </div>
                    <div style={{ fontSize: 56, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 20 }}>
                      Find Your<br />Perfect Chair
                    </div>
                    <div style={{ fontSize: 20, color: "rgba(255,255,255,0.68)", fontFamily: SANS, lineHeight: 1.6, marginBottom: 32 }}>
                      Browse trusted salon spaces — book by the day,<br />week, or month.
                    </div>
                    {["&#x2713; Verified salon venues", "&#x2713; Flexible booking durations", "&#x2713; Fair, transparent pricing"].map((b, i) => (
                      <div key={i} style={{ fontSize: 18, color: "rgba(255,255,255,0.82)", fontFamily: SANS, marginBottom: 10, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: b }} />
                    ))}
                    <div style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 12, background: "white", borderRadius: 16, padding: "16px 32px", boxShadow: "0 10px 32px rgba(0,0,0,0.22)" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: C.primary, fontFamily: SANS }}>Find a Chair &#x2192;</span>
                    </div>
                  </div>
                </div>
                <div style={{ position: "absolute", width: PANEL_W, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <div style={{
                    background: `linear-gradient(145deg, ${C.warmDark} 0%, #2A2520 100%)`,
                    borderRadius: 28, padding: "44px 52px", minHeight: PANEL_H,
                    boxShadow: "0 30px 80px rgba(0,0,0,0.55)",
                    border: "1.5px solid rgba(231,211,167,0.20)",
                  }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(231,211,167,0.12)", borderRadius: 100, padding: "8px 20px", marginBottom: 24, border: "1px solid rgba(231,211,167,0.25)" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: C.accent, fontFamily: SANS }}>For Salon Venues &amp; Owners</span>
                    </div>
                    <div style={{ fontSize: 56, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 20 }}>
                      List Your<br />Unused Chairs
                    </div>
                    <div style={{ fontSize: 20, color: "rgba(255,255,255,0.60)", fontFamily: SANS, lineHeight: 1.6, marginBottom: 32 }}>
                      Turn quiet periods into consistent income.<br />Connect with verified professionals.
                    </div>
                    {["&#x2713; Create a listing in 2 minutes", "&#x2713; You control the schedule", "&#x2713; Earn during quieter periods"].map((b, i) => (
                      <div key={i} style={{ fontSize: 18, color: "rgba(255,255,255,0.78)", fontFamily: SANS, marginBottom: 10, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: b }} />
                    ))}
                    <div style={{ marginTop: 32, display: "inline-flex", alignItems: "center", gap: 12, background: C.accent, borderRadius: 16, padding: "16px 32px", boxShadow: "0 10px 32px rgba(231,211,167,0.28)" }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: C.warmDark, fontFamily: SANS }}>List Your Space &#x2192;</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DARK EXPANSION — clip-path from panel bounds ──────────────── */}
          {/* FIX: Uses inset() that shrinks from panel edges to 0, so it looks
              like the venue panel's dark surface physically floods outward */}
          {darkTotal > 0.002 && (
            <>
              <div style={{
                position: "absolute", inset: 0,
                background: C.dark,
                clipPath: darkExpandT > 0.01
                  ? `inset(${dInsT}px ${dInsR}px ${dInsB}px ${dInsL}px)`
                  : "inset(100%)",
                opacity: darkTotal,
                zIndex: 50, pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", inset: 0,
                background: `radial-gradient(ellipse 880px 720px at 50% 44%, rgba(37,99,235,0.14) 0%, transparent 65%)`,
                clipPath: darkExpandT > 0.01
                  ? `inset(${dInsT}px ${dInsR}px ${dInsB}px ${dInsL}px)`
                  : "inset(100%)",
                opacity: darkTotal, zIndex: 52, pointerEvents: "none",
              }} />
            </>
          )}

          {/* ── LISTING CONTENT ───────────────────────────────────────────── */}
          <div style={{ position: "absolute", inset: 0, opacity: darkTotal, zIndex: 55, pointerEvents: "none" }}>
            <div style={{ position: "absolute", top: 100, left: 80, right: 80, opacity: listHdr, transform: `translateY(${(1 - listHdr) * -18}px)` }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(37,99,235,0.80)", fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>List your space</div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0 }}>Two minutes<br />to listing</div>
            </div>

            {/* Progress bar — camera pans right with this (tracking shot) */}
            <div style={{ position: "absolute", top: 335, left: 80, right: 80, opacity: listHdr }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: SANS }}>Setup progress</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.primary, fontFamily: SANS }}>{Math.round(progPct)}%</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
                <div style={{
                  height: "100%", width: `${progPct}%`, borderRadius: 6,
                  background: `linear-gradient(90deg, ${C.primary}, #60A5FA)`,
                  boxShadow: "0 0 18px rgba(37,99,235,0.60)",
                }} />
              </div>
            </div>

            <div style={{ position: "absolute", top: 392, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 15 }}>
              {[
                { label: "Add venue photos", sub: "3 photos added",       t: check1 },
                { label: "Set your price",   sub: "$85 / day per chair",  t: check2 },
                { label: "Set availability", sub: "Mon–Sat, 9am–6pm",     t: check3 },
              ].map((c, i) => (
                <div key={i} style={{ transform: `translateY(${(1 - c.t) * 28}px)`, opacity: c.t }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.09)", borderRadius: 18, padding: "18px 24px" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${C.success}18`, border: `2px solid ${C.success}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 20, color: C.success }}>&#x2713;</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "white", fontFamily: SANS }}>{c.label}</div>
                      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: SANS, marginTop: 3 }}>{c.sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Listing button */}
            <div style={{
              position: "absolute", top: 695, left: 80, right: 80,
              opacity: check3 * (1 - eo3(pr(frame, P_STRETCH, 10))),
              transform: `scale(${btnPress})`, transformOrigin: "center",
            }}>
              <div style={{
                background: C.primary, borderRadius: 22, padding: "26px", textAlign: "center",
                boxShadow: `0 ${16 + btnGlow * 24}px ${48 + btnGlow * 48}px rgba(37,99,235,${0.35 + btnGlow * 0.25})`,
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: "white", fontFamily: SANS }}>Create Listing &#x2192;</div>
              </div>
            </div>

            {/* Stretching button morph */}
            {stretchOp > 0.01 && (
              <div style={{
                position: "absolute", left: "50%", top: 737,
                transform: "translate(-50%, -50%)",
                width: btnStretchW, height: btnStretchH, borderRadius: 22,
                background: C.primary,
                opacity: stretchOp,
                boxShadow: `0 0 ${50 + btnGlow * 40}px rgba(37,99,235,${0.52 + btnGlow * 0.3})`,
              }} />
            )}
          </div>

          {/* ── LIVE LISTING CARD ─────────────────────────────────────────── */}
          <div style={{ position: "absolute", inset: 0, opacity: darkTotal * (1 - eo5(pr(frame, P_BLOOM + 34, 28))), zIndex: 56, pointerEvents: "none" }}>
            <div style={{
              position: "absolute", top: 737, left: 80, right: 80,
              transform: `translateY(${(1 - lCardT) * 60}px) scale(${0.88 + lCardT * 0.12})`,
              opacity: lCardT,
            }}>
              <div style={{
                background: "rgba(255,255,255,0.06)", border: `1.5px solid rgba(22,163,74,${0.4 * lCardT})`,
                borderRadius: 22, padding: "22px 28px",
                boxShadow: `0 0 60px rgba(22,163,74,${0.18 * lPulse * lCardT})`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.success, boxShadow: `0 0 ${14 * lPulse}px ${C.success}` }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C.success, fontFamily: SANS, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Listed &amp; Live &#x2713;</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "white", fontFamily: SANS }}>The Styling Co. · Chair #1</div>
                    <div style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", fontFamily: SANS, marginTop: 2 }}>$85/day · Mon–Sat · Available now</div>
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: C.success, fontFamily: SANS }}>$85</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── BLOOM — dark lifts, listing card blooms into activity ecosystem ─ */}
          <div style={{ position: "absolute", inset: 0, opacity: bloomAlpha, zIndex: 65, pointerEvents: "none" }}>
            <AbsoluteFill style={{ background: C.bg }} />
            <AbsoluteFill style={{
              background: `radial-gradient(ellipse 1000px 840px at 50% 50%, rgba(37,99,235,0.10) 0%, transparent 65%)`,
            }} />

            {/* Revenue counter — top right */}
            <div style={{
              position: "absolute", top: 88, right: 80,
              opacity: eo4(pr(frame, P_BLOOM + 12, 22)) * payOp,
              textAlign: "right",
            }}>
              <div style={{ fontSize: 12, color: C.body, fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 4 }}>This week · earned</div>
              <div style={{ fontSize: 80, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -4, lineHeight: 1 }}>
                ${Math.round(revenue)}
              </div>
            </div>

            {/* Central listing card */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)",
              width: 660,
              opacity: eo5(pr(frame, P_BLOOM, 20)),
            }}>
              <div style={{
                background: "white", border: `1.5px solid ${C.border}`,
                borderRadius: 24, padding: "28px 34px",
                boxShadow: `0 24px 64px rgba(37,99,235,0.13), 0 0 42px rgba(22,163,74,${0.13 * lPulse})`,
                display: "flex", alignItems: "center", gap: 18,
              }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${C.success}14`, border: `2px solid ${C.success}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.success, boxShadow: `0 0 ${14 * lPulse}px ${C.success}` }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.success, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Live Now · The Styling Co.</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: SANS }}>Chair #1 · Available</div>
                  <div style={{ fontSize: 13, color: C.body, fontFamily: SANS }}>$85/day · Mon–Sat</div>
                </div>
                <div style={{ fontSize: 44, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -2 }}>$85</div>
              </div>
            </div>

            {/* Pulse rings from center */}
            <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
              <PulseRing elapsed={bloomElapsed} delay={0}  color={C.primary}        maxR={420} />
              <PulseRing elapsed={bloomElapsed} delay={20} color={C.primary}        maxR={520} />
              <PulseRing elapsed={bloomElapsed} delay={40} color={`${C.primary}50`} maxR={620} />
            </div>

            {/* Activity cards bloom outward from listing card */}
            <ActivityCard frame={frame} startFrame={P_BLOOM + 16} collapseFrame={P_COLLAPSE}
              dx={-380} dy={-300} name="Sophie L." initials="SL" service="Cut & Style" amount={95} color={C.primary} />
            <ActivityCard frame={frame} startFrame={P_BLOOM + 28} collapseFrame={P_COLLAPSE}
              dx={380}  dy={-280} name="Marcus R." initials="MR" service="Colour Treatment" amount={110} color={C.purple} />
            <ActivityCard frame={frame} startFrame={P_BLOOM + 40} collapseFrame={P_COLLAPSE}
              dx={-360} dy={310}  name="Anna K."   initials="AK" service="Braiding &amp; Style" amount={90} color={C.green} />

            {/* Monthly projection banner */}
            <div style={{
              position: "absolute", left: 80, right: 80, top: 1310,
              opacity: eo5(pr(frame, P_BLOOM + 48, 18)) * payOp,
              transform: `translateY(${(1 - eo5(pr(frame, P_BLOOM + 48, 18))) * 28}px)`,
            }}>
              <div style={{
                background: `linear-gradient(135deg, ${C.primary} 0%, #1A3FC7 100%)`,
                borderRadius: 24, padding: "20px 30px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                boxShadow: "0 14px 44px rgba(37,99,235,0.24)",
              }}>
                <div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 4 }}>Projected monthly</div>
                  <div style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", fontFamily: SANS }}>per chair · one venue</div>
                </div>
                <div style={{ fontSize: 62, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: -3, lineHeight: 1 }}>$2,400</div>
              </div>
            </div>
          </div>

          {/* ── BRAND CLOSE ───────────────────────────────────────────────── */}
          <div style={{ position: "absolute", inset: 0, opacity: brT1, zIndex: 80, pointerEvents: "none" }}>
            <AbsoluteFill style={{ background: C.bg }} />
            <AbsoluteFill style={{
              background: `radial-gradient(ellipse 920px 760px at 50% 44%, rgba(37,99,235,${0.09 * glowBreath}) 0%, transparent 65%)`,
            }} />
            <div style={{
              position: "absolute", left: 0, right: 0, top: "50%",
              transform: "translateY(-50%)",
              display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
              padding: "0 90px",
            }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 26, opacity: brT1 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, boxShadow: `0 0 10px ${C.primary}` }} />
                <span style={{ fontSize: 17, fontWeight: 700, color: C.primary, fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase" }}>Beta Access · Now Open</span>
              </div>
              <div style={{ fontSize: 122, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86, textTransform: "uppercase", opacity: brT1, transform: `translateY(${(1 - brT1) * 40}px)` }}>
                SHARED
              </div>
              <div style={{ fontSize: 122, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86, textTransform: "uppercase", marginBottom: 28, opacity: brT2, transform: `translateY(${(1 - brT2) * 40}px)` }}>
                SALON
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: SANS, lineHeight: 1.3, marginBottom: 16, opacity: brSub }}>
                List your space.<br /><span style={{ color: C.primary }}>Find your people.</span>
              </div>
              <div style={{ width: `${brLine * 310}px`, height: 4, borderRadius: 3, background: `linear-gradient(90deg, ${C.accent}, rgba(231,211,167,0.3))`, marginBottom: 22 }} />
              <div style={{ fontSize: 18, color: C.body, fontFamily: SANS, lineHeight: 1.6, marginBottom: 34, maxWidth: 600, opacity: brSub }}>
                For venue owners. For freelancers. One platform.
              </div>
              <div style={{ opacity: brBtn, transform: `scale(${0.82 + brBtn * 0.18})`, transformOrigin: "center", marginBottom: 22 }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 14,
                  background: C.primary, borderRadius: 22, padding: "26px 60px",
                  boxShadow: `0 0 ${40 * brGlow}px rgba(37,99,235,${brGlow}), 0 16px 48px rgba(37,99,235,0.35)`,
                }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: "white", fontFamily: SANS }}>Join the Beta</span>
                  <span style={{ fontSize: 26, color: "rgba(255,255,255,0.72)" }}>&#x2192;</span>
                </div>
              </div>
              <div style={{ fontSize: 19, color: C.body, fontFamily: "monospace", letterSpacing: "0.04em", opacity: brUrl }}>
                sharedsalon.com.au
              </div>
            </div>
          </div>

        </div>
      </div>
    </AbsoluteFill>
  );
};
