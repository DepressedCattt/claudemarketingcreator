/**
 * SharedSalonOneShot — "The Long Take"
 *
 * A true one-shot ad: no scene cuts, no canvas wipes.
 * Every transition is driven by an on-screen element transforming into
 * the next element. The phone, headline text, step cards, and marketplace
 * panel all have continuous lifecycles across the entire 26 seconds.
 *
 * ELEMENT LIFECYCLES
 * ──────────────────
 * Phone       → Enters (clip reveal) → Hero → Zooms in (cinematic push) →
 *               Zooms back → Recedes to bg → Returns for brand close
 *
 * Hero text   → "Rent a Chair" materialises as phone zooms back →
 *               Physically rises and morphs into "Three simple steps" header
 *
 * Step cards  → Appear below morphed header → Compress toward each other →
 *               Dissolve into marketplace flip panel
 *
 * Flip panel  → Flips to dark venue side → Expands to fill entire canvas →
 *               The dark backdrop IS now the listing scene
 *
 * Listing     → Progress, checklist, button press, listed card →
 *               Canvas brightens, dark dissolves → booking cards fly in
 *
 * Brand close → "SHARED SALON" resolves, phone returns as depth anchor
 *
 * Format:  9:16 portrait (1080 × 1920)
 * Duration: 780 frames @ 30fps = 26 seconds
 */

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
} from "remotion";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      "#FAF8F5",
  primary: "#2563EB",
  accent:  "#E7D3A7",
  text:    "#0B1730",
  body:    "#66758F",
  border:  "#D8DEE8",
  dark:    "#060D1A",
  success: "#16A34A",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';

// ─── Phase boundaries ─────────────────────────────────────────────────────────
// Every major element transition starts at one of these markers.
// Nothing hard-cuts — elements have overlapping fade windows around each marker.
const P_PHONE_ENTER   = 0;    // f0    phone clips in
const P_ZOOM_IN       = 60;   // f60   camera pushes into phone
const P_ZOOM_BACK     = 130;  // f130  camera pulls back, text materialises
const P_TEXT_MORPH    = 190;  // f190  "Rent a Chair" rises → becomes header
const P_CARDS         = 270;  // f270  step cards appear under header
const P_COMPRESS      = 375;  // f375  cards squeeze together
const P_PANEL         = 425;  // f425  panel materialises from compressed cards → flips
const P_DARK_EXPAND   = 500;  // f500  venue panel expands to fill canvas
const P_LISTING       = 555;  // f555  listing content animates in (dark scene)
const P_PAYOFF        = 645;  // f645  dark lifts, booking cards / revenue
const P_BRAND         = 720;  // f720  brand close
const TOTAL           = 780;  // f780

// ─── Easing ───────────────────────────────────────────────────────────────────
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const eo3 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 5);
const eio3 = (t: number) => {
  const c = cl(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
const pr  = (f: number, s: number, d: number) => cl((f - s) / d, 0, 1);

// ─── Camera wrapper ───────────────────────────────────────────────────────────
const CamDrift: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const t = frame / TOTAL;
  return (
    <div style={{
      position: "absolute", inset: 0,
      transform: `scale(${1 + t * 0.018}) rotateZ(${-0.2 + t * 0.4}deg) translateX(${5 - t * 10}px) translateY(${3 - t * 6}px)`,
      transformOrigin: "center center",
    }}>
      {children}
    </div>
  );
};

// ─── Sparkles ────────────────────────────────────────────────────────────────
const SPARKS = [
  { x:  68, y:  250, p: 72, d:  0, s: 5 }, { x: 980, y:  360, p: 60, d: 14, s: 4 },
  { x: 180, y:  580, p: 84, d: 28, s: 6 }, { x: 900, y:  780, p: 66, d:  8, s: 4 },
  { x: 120, y:  990, p: 76, d: 40, s: 5 }, { x: 350, y: 1300, p: 80, d: 44, s: 6 },
];

// ─── Phone components ────────────────────────────────────────────────────────
const PH_W = 412;
const PH_H = 870;
const PH_CR = 52;
const SC_LR = 10;
const SC_T  = 16;
const SC_B  = 12;
const SC_W  = PH_W - SC_LR * 2;
const SC_H  = PH_H - SC_T - SC_B;

const AppScreen: React.FC<{ scrollY?: number }> = ({ scrollY = 0 }) => (
  <div style={{ width: SC_W, height: SC_H, background: C.bg, fontFamily: SANS, overflow: "hidden" }}>
    <div style={{ transform: `translateY(${-scrollY}px)` }}>
      <div style={{ height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>9:41</span>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {[4, 6, 8, 10].map((h, i) => <div key={i} style={{ width: 2.5, height: h, borderRadius: 1.5, background: C.text }} />)}
          <div style={{ width: 20, height: 10, border: `1.5px solid ${C.text}`, borderRadius: 3, marginLeft: 4, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 2, top: 2, bottom: 2, right: 5, background: C.text, borderRadius: 1 }} />
          </div>
        </div>
      </div>
      <div style={{ height: 48 }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: C.primary }}>Shared Salon</div>
        <div style={{ display: "flex", gap: 10 }}>
          {["List", "Find", "Login"].map(l => <span key={l} style={{ fontSize: 9, color: C.body, fontWeight: 500 }}>{l}</span>)}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${C.primary}12`, border: `1px solid ${C.primary}30`, borderRadius: 100, padding: "4px 12px" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.primary }} />
          <span style={{ fontSize: 8, fontWeight: 700, color: C.primary, letterSpacing: "0.06em" }}>The Marketplace for Salon Spaces</span>
        </div>
      </div>
      <div style={{ textAlign: "center", padding: "14px 16px 0" }}>
        <div style={{ fontSize: 25, fontWeight: 900, color: C.text, letterSpacing: "-0.03em", lineHeight: 1.08 }}>
          Rent a Chair<br /><span style={{ color: C.primary }}>Without a Care</span>
        </div>
        <div style={{ fontSize: 9.5, color: C.body, lineHeight: 1.55, marginTop: 10 }}>
          Find and rent salon chairs near you,<br />or list your unused space to earn.
        </div>
      </div>
      <div style={{ display: "flex", gap: 9, padding: "14px 14px 0" }}>
        <div style={{ flex: 1, background: C.primary, borderRadius: 11, padding: "11px 6px", textAlign: "center", boxShadow: "0 4px 14px rgba(37,99,235,0.30)" }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: "white" }}>List Your Space</span>
        </div>
        <div style={{ flex: 1, border: `1.5px solid ${C.primary}`, borderRadius: 11, padding: "11px 6px", textAlign: "center" }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: C.primary }}>Find a Space</span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 14 }}>
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
    boxShadow: "0 70px 130px rgba(0,0,0,0.70), 0 24px 48px rgba(0,0,0,0.50), inset 0 0 0 1.5px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.16)",
  }}>
    <div style={{ position: "absolute", top: "8%", bottom: "8%", left: 0, width: "5%", borderRadius: `${PH_CR}px 0 0 ${PH_CR}px`, background: `linear-gradient(90deg, rgba(255,255,255,${0.07 * gloss}) 0%, transparent 100%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", right: -3.5, top: "28%", width: 4, height: 76, borderRadius: "0 3px 3px 0", background: "linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)", boxShadow: "2px 0 5px rgba(0,0,0,0.35)" }} />
    <div style={{ position: "absolute", left: -3.5, top: "23%", width: 4, height: 58, borderRadius: "3px 0 0 3px", background: "linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)" }} />
    <div style={{ position: "absolute", left: -3.5, top: "32%", width: 4, height: 58, borderRadius: "3px 0 0 3px", background: "linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)" }} />
    <div style={{ position: "absolute", top: SC_T, bottom: SC_B, left: SC_LR, right: SC_LR, borderRadius: 42, overflow: "hidden", background: C.bg }}>
      <div style={{ position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 128, height: 34, borderRadius: 20, background: "#0B0D14", zIndex: 20, boxShadow: "0 2px 14px rgba(0,0,0,0.6)" }} />
      <AppScreen scrollY={scrollY} />
    </div>
    <div style={{ position: "absolute", inset: 0, borderRadius: PH_CR, background: `linear-gradient(145deg, rgba(255,255,255,${0.035 * gloss}) 0%, transparent 45%, transparent 60%, rgba(255,255,255,${0.015 * gloss}) 100%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 138, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.28)" }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export const SharedSalonOneShot: React.FC = () => {
  const frame = useCurrentFrame();

  // ─── Global atmosphere ────────────────────────────────────────────────────
  const atmT       = eo4(pr(frame, 0, 30));
  const glowBreath = 0.55 + Math.sin(frame * 0.07) * 0.45;

  // ─── PHONE — scale and opacity lifecycle ──────────────────────────────────
  // The phone is one continuous element that changes state over time.
  // It never disappears; it just changes role (hero → background → anchor).

  // Phase 1: clip reveal + arc entry (f0-44)
  const revealT  = eo5(pr(frame, P_PHONE_ENTER, 44));
  const clipTop  = (1 - revealT) * 72;
  const arcX     = (1 - eo3(pr(frame, P_PHONE_ENTER, 30))) * -44;
  const arcY     = (1 - eo5(pr(frame, P_PHONE_ENTER, 38))) * 120;
  const blurR    = (1 - eo4(pr(frame, P_PHONE_ENTER + 4, 30))) * 12;
  const floatY   = Math.sin((frame / 110) * Math.PI * 2) * 5;

  // Phone scale: multi-phase keyframe logic (no accumulation bugs)
  let phoneScale: number;
  let phoneOp: number;
  if (frame < P_ZOOM_IN) {
    phoneScale = 1.85;
    phoneOp = 1.0;
  } else if (frame < P_ZOOM_BACK) {
    // Camera pushes in — phone grows toward viewer
    phoneScale = 1.85 + eo4(pr(frame, P_ZOOM_IN, P_ZOOM_BACK - P_ZOOM_IN)) * 1.35;
    phoneOp = 1.0;
  } else if (frame < P_TEXT_MORPH) {
    // Camera pulls back — phone shrinks
    phoneScale = 3.2 - eo5(pr(frame, P_ZOOM_BACK, P_TEXT_MORPH - P_ZOOM_BACK)) * 1.80;
    phoneOp = 1.0;
  } else if (frame < P_CARDS) {
    // Phone recedes to background depth
    const t = eo4(pr(frame, P_TEXT_MORPH, P_CARDS - P_TEXT_MORPH));
    phoneScale = 1.4 - t * 0.55;
    phoneOp = 1.0 - t * 0.76;
  } else if (frame < P_BRAND) {
    // Phone holds in deep background — continuous visual anchor
    phoneScale = 0.85;
    phoneOp = 0.20;
  } else {
    // Brand close: phone rises back as depth anchor
    const t = eo5(pr(frame, P_BRAND, 50));
    phoneScale = 0.85 - t * (0.85 - 0.72);
    phoneOp = 0.20 + t * (0.55 - 0.20);
  }

  // Scroll: parallax app content scrolling during entry
  const scrollY = (1 - eo4(pr(frame, P_PHONE_ENTER, 80))) * 380;

  // Combined arc offset (only active during entry)
  const entryArcX = frame < P_ZOOM_IN ? arcX : 0;
  const entryArcY = frame < P_ZOOM_IN
    ? arcY + floatY
    : floatY * (1 - eo4(pr(frame, P_ZOOM_IN, 20)));

  // ─── HERO TEXT — "Rent a Chair" → header morph ───────────────────────────
  // Text materialises as phone zooms back (P_ZOOM_BACK).
  // Then it physically floats upward and morphs into the "Three steps" header.

  // Materialise timing
  const heroAT = eo4(pr(frame, P_ZOOM_BACK + 28, 40));  // "Rent a Chair"
  const heroBT = eo4(pr(frame, P_ZOOM_BACK + 44, 40));  // "Without a Care"

  // Morph timing — elements rise and cross-fade
  const morphT = eo5(pr(frame, P_TEXT_MORPH + 10, 60));

  // Y positions: float zone (y≈400) → header zone (y≈110)
  const heroAY = 400 - morphT * (400 - 110);   // "Rent a Chair" → label zone
  const heroBY = 475 - morphT * (475 - 178);   // "Without a Care" → headline zone

  // Opacity: old content fades as morph begins, new content fades in at midpoint
  const oldContentOp = heroAT * (1 - cl(morphT * 2.2, 0, 1));
  const newLabelOp   = cl((morphT - 0.45) * 3.0, 0, 1);   // "Up & running..." label
  const newHeadOp    = cl((morphT - 0.55) * 3.0, 0, 1);   // "Three simple steps"

  // Hero text overall opacity (used to hide during dark phase)
  const heroRegion = 1 - cl(eo4(pr(frame, P_DARK_EXPAND, 30)) * 2.5, 0, 1);

  // Brand badge (bottom of phone during entry)
  const badgeT  = eo4(pr(frame, 50, 20));
  const badgeOp = badgeT * (1 - eo3(pr(frame, P_ZOOM_IN, 25)));

  // ─── STEP CARDS ──────────────────────────────────────────────────────────
  const CARD_H = 220;
  const CARD_GAP = 24;
  const c1NatY = 295;
  const c2NatY = c1NatY + CARD_H + CARD_GAP;  // 539
  const c3NatY = c2NatY + CARD_H + CARD_GAP;  // 783
  const COMPRESS_Y = c2NatY;                   // all compress to card 2's position

  // Cards appear (staggered deck-peel)
  const c1T = eo5(pr(frame, P_CARDS + 18, 38));
  const c2T = eo5(pr(frame, P_CARDS + 38, 38));
  const c3T = eo5(pr(frame, P_CARDS + 58, 38));

  // Cards compress toward each other (P_COMPRESS)
  const compressT = eo5(pr(frame, P_COMPRESS, 48));

  // Y position for each card during compression
  const c1Y = c1NatY + compressT * (COMPRESS_Y - c1NatY);
  const c2Y = c2NatY;
  const c3Y = c3NatY - compressT * (c3NatY - COMPRESS_Y);

  // Deck-peel entry animation (rotateX from bottom)
  const c1RX = (1 - c1T) * -68;
  const c2RX = (1 - c2T) * -68;
  const c3RX = (1 - c3T) * -68;

  // Cards fade out as panel takes over
  const cardsOp = cl(c1T * 4, 0, 1) * (1 - eo4(pr(frame, P_COMPRESS + 32, 18)));

  // ─── MARKETPLACE PANEL ────────────────────────────────────────────────────
  // Panel materialises at the EXACT position where the compressed cards are.
  // Center of cards (c2NatY + CARD_H/2) = 539 + 110 = 649
  // Panel: height 570, so top = 649 - 285 = 364
  const PANEL_TOP  = 364;
  const PANEL_H    = 570;
  const PANEL_W    = 900;
  const PANEL_L    = (1080 - PANEL_W) / 2;  // 90

  // Panel appears as cards dissolve
  const panelT = eo5(pr(frame, P_PANEL, 24));

  // Flip animation
  const flipRaw = pr(frame, P_PANEL + 18, 60);
  const rotY    = eio3(flipRaw) * 180;
  const midGlow = interpolate(rotY, [60, 90, 120], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Panel is hidden once dark expansion is complete
  const panelOp = panelT * (1 - eo5(pr(frame, P_DARK_EXPAND + 30, 20)));

  // ─── DARK EXPANSION ──────────────────────────────────────────────────────
  // The venue panel's dark background expands outward from the panel's bounds
  // until it fills the entire canvas. This IS the transition to the listing scene.
  const DARK_INS_T = PANEL_TOP;
  const DARK_INS_R = PANEL_L;
  const DARK_INS_B = 1920 - PANEL_TOP - PANEL_H;  // 1920 - 364 - 570 = 986
  const DARK_INS_L = PANEL_L;

  const darkExpandT = eo5(pr(frame, P_DARK_EXPAND, 44));
  // clip-path: inset shrinks from panel-edges inward toward 0 (full canvas)
  const dInsT = DARK_INS_T * (1 - darkExpandT);
  const dInsR = DARK_INS_R * (1 - darkExpandT);
  const dInsB = DARK_INS_B * (1 - darkExpandT);
  const dInsL = DARK_INS_L * (1 - darkExpandT);

  // Dark lifts for payoff scene
  const darkLiftT = eo4(pr(frame, P_PAYOFF, 44));
  const darkTotalOp = cl(darkExpandT, 0, 1) * (1 - darkLiftT);

  // ─── LISTING CONTENT (dark phase) ────────────────────────────────────────
  const listHdrT = eo4(pr(frame, P_LISTING, 20));
  const prog1T   = eo5(pr(frame, P_LISTING + 14, 22));
  const prog2T   = eo5(pr(frame, P_LISTING + 26, 22));
  const prog3T   = eo5(pr(frame, P_LISTING + 40, 22));
  const progressPct = interpolate(
    frame, [P_LISTING + 14, P_LISTING + 26, P_LISTING + 40, P_LISTING + 56],
    [0, 33, 66, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const lBtnT    = eo4(pr(frame, P_LISTING + 56, 14));
  const lBtnGlow = eo4(pr(frame, P_LISTING + 60, 14));
  const lCardT   = eo5(pr(frame, P_LISTING + 66, 22));
  const lPulse   = 0.7 + Math.sin(frame * 0.18) * 0.3;
  const notif1T  = eo5(pr(frame, P_LISTING + 78, 16));
  const notif2T  = eo5(pr(frame, P_LISTING + 92, 16));

  // ─── PAYOFF ───────────────────────────────────────────────────────────────
  const brightT  = eo5(pr(frame, P_PAYOFF, 44));
  const payHdrT  = eo4(pr(frame, P_PAYOFF + 44, 22));
  const bk1T     = eo5(pr(frame, P_PAYOFF + 52, 28));
  const bk2T     = eo5(pr(frame, P_PAYOFF + 66, 28));
  const bk3T     = eo5(pr(frame, P_PAYOFF + 80, 28));
  const revenue  = interpolate(
    frame, [P_PAYOFF + 42, P_PAYOFF + 62, P_PAYOFF + 72], [0, 420, 1260],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ben1T    = eo4(pr(frame, P_PAYOFF + 72, 18));
  const ben2T    = eo4(pr(frame, P_PAYOFF + 82, 18));
  const bannerT  = eo5(pr(frame, P_PAYOFF + 92, 18));

  // ─── BRAND CLOSE ──────────────────────────────────────────────────────────
  const brT1     = eo4(pr(frame, P_BRAND, 18));
  const brT2     = eo4(pr(frame, P_BRAND + 10, 18));
  const brSubT   = eo3(pr(frame, P_BRAND + 22, 16));
  const brLineT  = eo3(pr(frame, P_BRAND + 28, 16));
  const brBtnT   = eo5(pr(frame, P_BRAND + 36, 16));
  const brUrlT   = eo3(pr(frame, P_BRAND + 48, 12));
  const brGlow   = 0.35 + Math.sin(frame * 0.10) * 0.20;

  // ─── RENDERING ────────────────────────────────────────────────────────────
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <CamDrift>

        {/* ── BACKGROUND ATMOSPHERE ──────────────────────────────────────── */}
        <AbsoluteFill style={{ background: C.bg }} />
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 900px 760px at 50% 44%, rgba(37,99,235,${0.08 * atmT * glowBreath}) 0%, transparent 65%)`,
        }} />
        <AbsoluteFill style={{
          backgroundImage: "radial-gradient(circle, rgba(11,23,48,0.025) 1px, transparent 1px)",
          backgroundSize: "52px 52px", opacity: atmT * heroRegion,
        }} />

        {/* Sparkles — only in bright phases */}
        {SPARKS.map((s, i) => {
          const phase = ((frame + s.d * 4) % s.p) / s.p;
          return (
            <div key={i} style={{
              position: "absolute", left: s.x, top: s.y,
              width: s.s, height: s.s, borderRadius: "50%",
              background: C.accent,
              opacity: Math.sin(phase * Math.PI) * 0.5 * atmT * heroRegion,
              pointerEvents: "none",
            }} />
          );
        })}

        {/* ── THE PHONE — one element, continuous lifecycle ───────────────── */}
        {/* z=10 — sits behind most content but above background */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: `translate(calc(-50% + ${entryArcX}px), calc(-50% + ${entryArcY}px)) scale(${phoneScale})`,
          transformOrigin: "center center",
          clipPath: `inset(${clipTop}% 0 0 0 round ${PH_CR}px)`,
          filter: `blur(${blurR}px)`,
          opacity: phoneOp,
          zIndex: 10,
        }}>
          <IPhoneFrame scrollY={scrollY} gloss={revealT * 0.9} />
        </div>

        {/* Brand badge — only during phone entry */}
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

        {/* ── HERO TEXT A — "Rent a Chair" → header label ────────────────── */}
        {/* This element physically moves UP and cross-fades into the S3 header */}
        <div style={{
          position: "absolute", left: "50%",
          top: heroAY,
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: heroRegion,
          zIndex: 20,
        }}>
          {/* OLD content: "Rent a Chair" — fades out as element rises */}
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            opacity: oldContentOp, whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 58, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: "-0.04em" }}>
              Rent a Chair
            </div>
          </div>
          {/* NEW content: header label — fades in during rise */}
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            opacity: newLabelOp, whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em" }}>
              Up &amp; running in minutes
            </div>
          </div>
        </div>

        {/* ── HERO TEXT B — "Without a Care" → "Three simple steps" ─────── */}
        <div style={{
          position: "absolute", left: "50%",
          top: heroBY,
          transform: "translateX(-50%)",
          textAlign: "center",
          opacity: heroRegion,
          zIndex: 20,
        }}>
          {/* OLD: "Without a Care" */}
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            opacity: heroBT * (1 - cl(morphT * 2.2, 0, 1)), whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 58, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: "-0.04em" }}>
              Without a Care
            </div>
          </div>
          {/* NEW: "Three simple steps" */}
          <div style={{
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            opacity: newHeadOp, whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 54, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: "-0.03em" }}>
              Three simple steps
            </div>
          </div>
        </div>

        {/* ── STEP CARDS ─────────────────────────────────────────────────── */}
        {/* Each card enters with a deck-peel rotateX, then all three compress toward c2Y */}
        {[
          { natY: c1Y, rotX: c1RX, t: c1T, icon: "✉️", step: "1", title: "Create an account",  desc: "Sign up in seconds — no credit card needed", col: C.primary },
          { natY: c2Y, rotX: c2RX, t: c2T, icon: "📍", step: "2", title: "Browse or list",       desc: "Find chairs nearby or post your space",         col: "#7C3AED" },
          { natY: c3Y, rotX: c3RX, t: c3T, icon: "📅", step: "3", title: "Book & connect",       desc: "Confirm the booking and get to work",            col: "#059669" },
        ].map((card, i) => (
          <div key={i} style={{
            position: "absolute", left: "50%",
            top: card.natY,
            transform: `translateX(-50%) perspective(1400px) rotateX(${card.rotX}deg)`,
            transformOrigin: "bottom center",
            width: 880, opacity: cardsOp,
            zIndex: 20,
          }}>
            {/* Deck depth peek — visible before reveal completes */}
            {card.t < 0.85 && (
              <>
                <div style={{ position: "absolute", top: -10, left: 16, right: 16, height: "100%", background: "rgba(220,232,255,0.55)", borderRadius: 22, zIndex: -1, opacity: 1 - card.t }} />
                <div style={{ position: "absolute", top: -18, left: 28, right: 28, height: "100%", background: "rgba(220,232,255,0.30)", borderRadius: 22, zIndex: -2, opacity: 1 - card.t }} />
              </>
            )}
            <div style={{
              background: "white", border: `1.5px solid ${C.border}`, borderRadius: 24, padding: "28px 40px",
              boxShadow: "0 16px 48px rgba(11,23,48,0.09)",
              display: "flex", alignItems: "center", gap: 28,
            }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: `${card.col}12`, border: `2px solid ${card.col}28`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 26 }}>
                {card.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: card.col, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5 }}>Step {card.step}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: C.text, fontFamily: SANS, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 6 }}>{card.title}</div>
                <div style={{ fontSize: 18, color: C.body, fontFamily: SANS }}>{card.desc}</div>
              </div>
              <div style={{ fontSize: 28, color: `${card.col}80`, fontWeight: 700 }}>&#x2192;</div>
            </div>
          </div>
        ))}

        {/* ── MARKETPLACE PANEL ──────────────────────────────────────────── */}
        {/* Appears at EXACTLY the position where the compressed cards were.
            Then flips (showing stylist → venue) before expanding to fill canvas. */}
        <div style={{
          position: "absolute", left: PANEL_L, top: PANEL_TOP,
          width: PANEL_W,
          opacity: panelOp,
          perspective: 2200, perspectiveOrigin: "50% 50%",
          zIndex: 25,
        }}>
          {/* Flip midpoint energy */}
          {midGlow > 0.05 && (
            <div style={{
              position: "absolute", inset: -50,
              background: `radial-gradient(circle at 50% 50%, rgba(37,99,235,${0.55 * midGlow}) 0%, transparent 58%)`,
              filter: "blur(40px)", pointerEvents: "none", zIndex: 30, borderRadius: 28,
            }} />
          )}
          <div style={{ transformStyle: "preserve-3d", transform: `rotateY(${rotY}deg)`, width: PANEL_W }}>

            {/* Front face — Stylist (blue) */}
            <div style={{ position: "absolute", width: PANEL_W, backfaceVisibility: "hidden" }}>
              <div style={{
                background: `linear-gradient(145deg, ${C.primary} 0%, #1A3FC7 100%)`,
                borderRadius: 28, padding: "44px 52px", minHeight: PANEL_H,
                boxShadow: "0 28px 70px rgba(37,99,235,0.35)",
              }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.14)", borderRadius: 100, padding: "8px 20px", marginBottom: 26 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: SANS }}>For Stylists &amp; Freelancers</span>
                </div>
                <div style={{ fontSize: 58, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 22 }}>Find Your<br />Perfect Chair</div>
                <div style={{ fontSize: 22, color: "rgba(255,255,255,0.68)", fontFamily: SANS, lineHeight: 1.6, marginBottom: 36 }}>
                  Browse trusted salon spaces — book by the day,<br />week, or month. No long-term commitment.
                </div>
                {["✓ Verified salon venues", "✓ Flexible booking durations", "✓ Fair, transparent pricing"].map((b, i) => (
                  <div key={i} style={{ fontSize: 20, color: "rgba(255,255,255,0.82)", fontFamily: SANS, marginBottom: 12, fontWeight: 500 }}>{b}</div>
                ))}
                <div style={{ marginTop: 34, display: "inline-flex", alignItems: "center", gap: 12, background: "white", borderRadius: 16, padding: "18px 36px", boxShadow: "0 10px 30px rgba(0,0,0,0.20)" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: C.primary, fontFamily: SANS }}>Find a Chair &#x2192;</span>
                </div>
              </div>
            </div>

            {/* Back face — Venue (dark warm) */}
            {/* This face's dark background is what "expands" to fill the canvas */}
            <div style={{ position: "absolute", width: PANEL_W, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div style={{
                background: "linear-gradient(145deg, #1C1917 0%, #2A2520 100%)",
                borderRadius: 28, padding: "44px 52px", minHeight: PANEL_H,
                boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
                border: "1.5px solid rgba(231,211,167,0.20)",
              }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(231,211,167,0.12)", borderRadius: 100, padding: "8px 20px", marginBottom: 26, border: "1px solid rgba(231,211,167,0.25)" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.accent, fontFamily: SANS }}>For Salon Venues &amp; Owners</span>
                </div>
                <div style={{ fontSize: 58, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 22 }}>List Your<br />Unused Chairs</div>
                <div style={{ fontSize: 22, color: "rgba(255,255,255,0.60)", fontFamily: SANS, lineHeight: 1.6, marginBottom: 36 }}>
                  Turn quiet periods into consistent income.<br />Connect with verified professionals.
                </div>
                {["✓ Create a listing in 2 minutes", "✓ You control the schedule", "✓ Earn during quieter periods"].map((b, i) => (
                  <div key={i} style={{ fontSize: 20, color: "rgba(255,255,255,0.78)", fontFamily: SANS, marginBottom: 12, fontWeight: 500 }}>{b}</div>
                ))}
                <div style={{ marginTop: 34, display: "inline-flex", alignItems: "center", gap: 12, background: C.accent, borderRadius: 16, padding: "18px 36px", boxShadow: "0 10px 30px rgba(231,211,167,0.25)" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#1C1917", fontFamily: SANS }}>List Your Space &#x2192;</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── DARK EXPANSION — the venue panel's darkness floods the canvas ── */}
        {/* This IS the transition from marketplace to listing. No cut, no wipe. */}
        {/* The clip-path opens from the panel's exact bounds outward to fill all. */}
        <div style={{
          position: "absolute", inset: 0,
          background: C.dark,
          clipPath: darkExpandT > 0.005
            ? `inset(${dInsT}px ${dInsR}px ${dInsB}px ${dInsL}px)`
            : "inset(100%)",
          opacity: darkTotalOp,
          zIndex: 50,
          pointerEvents: "none",
        }} />

        {/* Dark atmosphere glow (behind listing content) */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 55, pointerEvents: "none",
          opacity: darkTotalOp,
          background: `radial-gradient(ellipse 880px 720px at 50% 44%, rgba(37,99,235,0.13) 0%, transparent 65%)`,
        }} />

        {/* ── LISTING CONTENT (dark phase, z=60) ─────────────────────────── */}
        <div style={{
          position: "absolute", inset: 0,
          opacity: darkTotalOp,
          zIndex: 60,
          pointerEvents: "none",
        }}>
          {/* Header */}
          <div style={{ position: "absolute", top: 100, left: 80, right: 80, opacity: listHdrT, transform: `translateY(${(1 - listHdrT) * -18}px)` }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "rgba(37,99,235,0.80)", fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>List your space</div>
            <div style={{ fontSize: 56, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0 }}>Two minutes<br />to listing</div>
          </div>

          {/* Progress */}
          <div style={{ position: "absolute", top: 358, left: 80, right: 80, opacity: listHdrT }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontFamily: SANS }}>Setup progress</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.primary, fontFamily: SANS }}>{Math.round(progressPct)}%</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
              <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: 6, background: `linear-gradient(90deg, ${C.primary}, #60A5FA)`, boxShadow: "0 0 16px rgba(37,99,235,0.55)" }} />
            </div>
          </div>

          {/* Checklist */}
          <div style={{ position: "absolute", top: 418, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { label: "Add venue photos", sub: "3 photos added",      t: prog1T },
              { label: "Set your price",   sub: "$85 / day per chair", t: prog2T },
              { label: "Set availability", sub: "Mon–Sat, 9am–6pm",    t: prog3T },
            ].map((c, i) => (
              <div key={i} style={{ transform: `translateY(${(1 - c.t) * 28}px)`, opacity: c.t }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.09)", borderRadius: 18, padding: "18px 24px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${C.success}18`, border: `2px solid ${C.success}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 20, color: C.success }}>✓</span>
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
          <div style={{ position: "absolute", top: 710, left: 80, right: 80, opacity: lBtnT }}>
            <div style={{
              background: C.primary, borderRadius: 22, padding: "26px", textAlign: "center",
              boxShadow: `0 ${16 + lBtnGlow * 24}px ${48 + lBtnGlow * 48}px rgba(37,99,235,${0.35 + lBtnGlow * 0.25})`,
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "white", fontFamily: SANS }}>Create Listing &#x2192;</div>
            </div>
          </div>

          {/* Listed & Live card */}
          <div style={{ position: "absolute", top: 858, left: 80, right: 80, transform: `translateY(${(1 - lCardT) * 60}px)`, opacity: lCardT }}>
            <div style={{
              background: "rgba(255,255,255,0.06)", border: `1.5px solid rgba(22,163,74,${0.4 * lCardT})`, borderRadius: 22, padding: "22px 28px",
              boxShadow: `0 0 60px rgba(22,163,74,${0.18 * lPulse * lCardT})`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.success, boxShadow: `0 0 ${14 * lPulse}px ${C.success}` }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.success, fontFamily: SANS, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>Listed &amp; Live ✓</div>
                  <div style={{ fontSize: 25, fontWeight: 700, color: "white", fontFamily: SANS }}>The Styling Co. · Chair #1</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", fontFamily: SANS, marginTop: 2 }}>$85/day · Mon–Sat · Available now</div>
                </div>
                <div style={{ fontSize: 36, fontWeight: 900, color: C.success, fontFamily: SANS }}>$85</div>
              </div>
            </div>
          </div>

          {/* Enquiry notifications */}
          <div style={{ position: "absolute", top: 1040, left: 80, right: 80 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.35)", fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14, opacity: notif1T }}>
              First enquiries arriving
            </div>
            {[
              { init: "SL", name: "Sophie L. viewed your listing",    sub: "Just now · Balayage",     col: C.primary, t: notif1T },
              { init: "MR", name: "Marcus R. sent a booking request", sub: "2 min ago · Colour Tmt.", col: "#7C3AED",  t: notif2T },
            ].map((n, i) => (
              <div key={i} style={{ opacity: n.t, transform: `translateX(${(1 - n.t) * 55}px)`, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 18px" }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${n.col}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: n.col, fontFamily: SANS, flexShrink: 0 }}>{n.init}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "white", fontFamily: SANS }}>{n.name}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", fontFamily: SANS }}>{n.sub}</div>
                  </div>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.col, boxShadow: `0 0 8px ${n.col}` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PAYOFF — cream returns, booking cards, revenue (z=70) ─────── */}
        {/* The canvas brightens directly, no cut — the dark opacity lifts,
            cream background underneath naturally reveals the payoff content. */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 70, pointerEvents: "none",
          opacity: brightT,
        }}>
          <AbsoluteFill style={{ background: C.bg }} />
          <AbsoluteFill style={{
            background: `radial-gradient(ellipse 1000px 800px at 50% 38%, rgba(37,99,235,0.09) 0%, transparent 65%)`,
          }} />

          {/* Revenue header */}
          <div style={{
            position: "absolute", top: 80, left: 80, right: 80,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            opacity: payHdrT,
          }}>
            <div>
              <div style={{ fontSize: 14, color: C.body, fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Your listing is live</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: "-0.04em" }}>This week</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: C.body, fontFamily: SANS, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Earned</div>
              <div style={{ fontSize: 84, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -4, lineHeight: 1 }}>
                ${Math.round(revenue)}
              </div>
            </div>
          </div>

          <div style={{ position: "absolute", top: 254, left: 80, right: 80, height: 1.5, background: C.border, opacity: payHdrT }} />

          {/* Booking cards */}
          {[
            { name: "Sophie L.", init: "SL", svc: "Cut & Style",      day: "Monday",   time: "9:00 AM",  amt: 95,  col: C.primary, t: bk1T, left: true  },
            { name: "Marcus R.", init: "MR", svc: "Colour Treatment",  day: "Tuesday",  time: "2:00 PM",  amt: 110, col: "#7C3AED", t: bk2T, left: false },
            { name: "Anna K.",   init: "AK", svc: "Braiding & Style",  day: "Thursday", time: "10:00 AM", amt: 90,  col: "#059669", t: bk3T, left: true  },
          ].map((b, i) => {
            const tx = (1 - b.t) * (b.left ? -800 : 800);
            return (
              <div key={i} style={{
                position: "absolute", left: 64, right: 64,
                top: 272 + i * (100 + 14),
                transform: `translateX(${tx}px)`, opacity: cl(b.t * 3.5, 0, 1),
                background: "white", border: `1.5px solid ${C.border}`,
                borderRadius: 20, padding: "18px 24px",
                display: "flex", alignItems: "center", gap: 16,
                boxShadow: "0 6px 28px rgba(11,23,48,0.07)",
              }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${b.col}14`, border: `2px solid ${b.col}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: b.col, fontFamily: SANS, flexShrink: 0 }}>{b.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: b.col, fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 2 }}>{b.svc}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: SANS, marginBottom: 2 }}>{b.name}</div>
                  <div style={{ fontSize: 14, color: C.body, fontFamily: SANS }}>{b.day} · {b.time}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -1, lineHeight: 1 }}>${b.amt}</div>
                  <div style={{ fontSize: 10, color: C.success, fontFamily: SANS, fontWeight: 700, marginTop: 2 }}>✓ CONFIRMED</div>
                </div>
              </div>
            );
          })}

          {/* Benefits */}
          <div style={{ position: "absolute", top: 610, left: 80, right: 80 }}>
            {[
              { text: "Turn idle chairs into income",       t: ben1T, color: C.primary },
              { text: "Connect with trusted professionals", t: ben2T, color: C.text    },
            ].map((b, i) => (
              <div key={i} style={{ opacity: b.t, transform: `translateY(${(1 - b.t) * 18}px)`, marginBottom: 8 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: b.color, fontFamily: SANS, letterSpacing: "-0.02em" }}>{b.text}</div>
              </div>
            ))}
          </div>

          {/* Monthly projection banner */}
          <div style={{ position: "absolute", top: 770, left: 80, right: 80, opacity: bannerT, transform: `translateY(${(1 - bannerT) * 24}px)` }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, #1A3FC7 100%)`,
              borderRadius: 24, padding: "22px 32px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: "0 14px 44px rgba(37,99,235,0.26)",
            }}>
              <div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 4 }}>Projected monthly</div>
                <div style={{ fontSize: 19, color: "rgba(255,255,255,0.65)", fontFamily: SANS }}>per chair · one venue</div>
              </div>
              <div style={{ fontSize: 64, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: -3, lineHeight: 1 }}>$2,400</div>
            </div>
          </div>
        </div>

        {/* ── BRAND CLOSE (z=80) ─────────────────────────────────────────── */}
        {/* Rises over the payoff — the phone anchor (z=10) is already
            receding back to its brand-close position. Brand text is z=80. */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 80, pointerEvents: "none",
          opacity: brT1,
        }}>
          <AbsoluteFill style={{ background: C.bg }} />
          <AbsoluteFill style={{
            background: `radial-gradient(ellipse 900px 750px at 50% 44%, rgba(37,99,235,${0.08 * (0.55 + Math.sin(frame * 0.07) * 0.45)}) 0%, transparent 65%)`,
          }} />

          <div style={{
            position: "absolute", left: 0, right: 0, top: "50%",
            transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            padding: "0 90px",
          }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 24, opacity: brT1 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, boxShadow: `0 0 10px ${C.primary}` }} />
              <span style={{ fontSize: 17, fontWeight: 700, color: C.primary, fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase" }}>Beta Access · Now Open</span>
            </div>
            <div style={{ fontSize: 122, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: -6, lineHeight: 0.86, textTransform: "uppercase", opacity: brT1, transform: `translateY(${(1 - brT1) * 40}px)` }}>
              SHARED
            </div>
            <div style={{ fontSize: 122, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -6, lineHeight: 0.86, textTransform: "uppercase", marginBottom: 26, opacity: brT2, transform: `translateY(${(1 - brT2) * 40}px)` }}>
              SALON
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: SANS, lineHeight: 1.3, marginBottom: 16, opacity: brSubT }}>
              List your space.<br /><span style={{ color: C.primary }}>Find your people.</span>
            </div>
            <div style={{ width: `${brLineT * 300}px`, height: 4, borderRadius: 3, background: `linear-gradient(90deg, ${C.accent}, rgba(231,211,167,0.3))`, marginBottom: 20 }} />
            <div style={{ fontSize: 19, color: C.body, fontFamily: SANS, lineHeight: 1.6, marginBottom: 32, maxWidth: 620, opacity: brSubT }}>
              For venue owners. For freelancers. One platform.
            </div>
            <div style={{ opacity: brBtnT, transform: `scale(${0.82 + brBtnT * 0.18})`, transformOrigin: "center", marginBottom: 20 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                background: C.primary, borderRadius: 20, padding: "24px 56px",
                boxShadow: `0 0 ${36 * brGlow}px rgba(37,99,235,${brGlow}), 0 14px 44px rgba(37,99,235,0.33)`,
              }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: "white", fontFamily: SANS }}>Join the Beta</span>
                <span style={{ fontSize: 24, color: "rgba(255,255,255,0.72)" }}>&#x2192;</span>
              </div>
            </div>
            <div style={{ fontSize: 19, color: C.body, fontFamily: "monospace", letterSpacing: "0.04em", opacity: brUrlT }}>
              sharedsalon.com.au
            </div>
          </div>
        </div>

      </CamDrift>
    </AbsoluteFill>
  );
};
