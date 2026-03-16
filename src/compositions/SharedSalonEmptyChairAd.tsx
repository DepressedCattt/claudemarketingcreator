/**
 * Shared Salon — "The Empty Chair Is Not Neutral"
 * Reel 1: Business insight ad targeting venue owners
 *
 * 9:16 vertical (1080×1920), 600 frames @30fps (~20 seconds)
 *
 * Scene 1  (0–80f):    HOOK        — Chair centered vertically, word-slam headline + bottom stats
 * Scene 2  (80–250f):  COSTS       — 6 cost cards, chair progressively desaturates, tally slam
 * Scene 3  (250–370f): COUNTDOWN   — $250 drains to $0, screen shake at zero
 * Scene 4  (370–490f): SOLUTION    — No chair. 4 solid booking requests stack in, revenue climbs
 * Scene 5  (490–600f): CTA         — No chair. Clean brand lockup.
 *
 * ROOT-LEVEL TRANSITIONS (absolute frames):
 *   SceneTransitionLine blue:  76–90   (Scene 1→2)
 *   DarknessSlam:             246–258  (Scene 2→3)
 *   BrightFlash:              366–380  (Scene 3→4 pivot)
 *   SceneTransitionLine gold:  487–501  (Scene 4→5)
 *   ScreenShake:              318–330  ($0 moment)
 *
 * VERTICAL LAYOUT (1080×1920):
 *   Chair centered at screen midpoint: CHAIR_TOP=760, CHAIR_CY=960
 *   Chair visual: top=640, bottom=1280, center=(540,960)
 *   Top text zone: 0–640px  |  Bottom text zone: 1280–1920px
 *
 * CENTERING RULE:
 *   All hero elements use left "50%" + translateX(-50%) — never hardcoded pixel left values.
 */

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SalonChairIllustration } from "../components/salon/SalonChairIllustration";

/* ─── PALETTE ─── */
const D = {
  bg:       "#070D16",
  primary:  "#2563EB",
  gold:     "#E7D3A7",
  white:    "#FFFFFF",
  offwhite: "#F8F9FC",
  textDark: "#0B1730",
  muted:    "rgba(255,255,255,0.50)",
  dim:      "rgba(255,255,255,0.30)",
  red:      "#EF4444",
  green:    "#22C55E",
  border:   "#D8DEE8",
};

/* ─── EASING ─── */
const eo3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ─── CHAIR LAYOUT ─── */
// Chair div: 300×400px. Scale 1.6 from center.
// Centered at screen midpoint (960px vertical) using CHAIR_TOP = 960 - 200 = 760
const CHAIR_SCALE = 1.6;
const CHAIR_TOP   = 760;   // top of the 400px div
const CHAIR_CX    = 540;   // horizontal center (always 1080/2)
const CHAIR_CY    = 960;   // CHAIR_TOP + 200 = true vertical screen center
// Visual extents at scale 1.6: top=640, bottom=1280, left=300, right=780

/* ═══════════════════════════════════════════════════
   AMBIENT PARTICLES
══════════════════════════════════════════════════════ */
const PDEFS = [
  { bx:90,   by:260,  r:1.6, px:90,  py:70,  pfx:0.018, pfy:0.013 },
  { bx:960,  by:340,  r:1.2, px:50,  py:80,  pfx:0.014, pfy:0.019 },
  { bx:70,   by:700,  r:2.0, px:60,  py:40,  pfx:0.011, pfy:0.016 },
  { bx:990,  by:800,  r:1.4, px:40,  py:65,  pfx:0.017, pfy:0.012 },
  { bx:180,  by:1300, r:1.8, px:70,  py:50,  pfx:0.013, pfy:0.018 },
  { bx:900,  by:1450, r:1.2, px:45,  py:75,  pfx:0.016, pfy:0.011 },
  { bx:500,  by:140,  r:2.2, px:80,  py:55,  pfx:0.012, pfy:0.015 },
  { bx:580,  by:1760, r:1.5, px:55,  py:60,  pfx:0.015, pfy:0.014 },
];

const AmbientParticles: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {PDEFS.map((p, i) => {
        const fx = p.pfx * frame + i * 1.2;
        const fy = p.pfy * frame + i * 0.9;
        const x  = p.bx + Math.sin(fx) * p.px + Math.cos(fx * 0.7) * (p.px * 0.3);
        const y  = p.by + Math.cos(fy) * p.py + Math.sin(fy * 1.3) * (p.py * 0.3);
        const a  = (0.10 + Math.sin(fx * 1.8 + i) * 0.05) * opacity;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: p.r * 2, height: p.r * 2, borderRadius: "50%",
            background: D.primary, opacity: a, pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

/* ═══════════════════════════════════════════════════
   ROOT-LEVEL: scene transition line
══════════════════════════════════════════════════════ */
const SceneTransitionLine: React.FC<{ start: number; color?: string }> = ({ start, color = "#2563EB" }) => {
  const frame = useCurrentFrame();
  const lf = frame - start;
  if (lf < 0 || lf > 14) return null;
  return (
    <div style={{
      position: "absolute", top: 0, bottom: 0,
      left: (lf / 14) * 1100 - 10, width: 4,
      background: color,
      boxShadow: `0 0 28px 14px ${color}66`,
      zIndex: 80, pointerEvents: "none",
    }} />
  );
};

/* ═══════════════════════════════════════════════════
   ROOT-LEVEL: darkness slam
══════════════════════════════════════════════════════ */
const DarknessSlam: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 5, start + 12], [0, 0.92, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 70, background: `rgba(3,6,12,${opacity})`, pointerEvents: "none" }} />
  );
};

/* ═══════════════════════════════════════════════════
   ROOT-LEVEL: bright flash pivot (Scene 3→4)
══════════════════════════════════════════════════════ */
const BrightFlash: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 4, start + 14], [0, 0.90, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 70,
      background: `radial-gradient(ellipse at 50% 50%, rgba(255,255,255,${opacity * 0.88}) 0%, rgba(37,99,235,${opacity * 0.52}) 30%, rgba(231,211,167,${opacity * 0.28}) 55%, transparent 76%)`,
      pointerEvents: "none",
    }} />
  );
};

/* ═══════════════════════════════════════════════════
   SALON ROOM background
══════════════════════════════════════════════════════ */
const SalonRoom: React.FC<{ pushScale: number }> = ({ pushScale }) => (
  <div style={{
    position: "absolute", inset: 0, background: D.bg,
    transform: `scale(${pushScale})`, transformOrigin: "50% 55%", overflow: "hidden",
  }}>
    <div style={{
      position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-48%)",
      width: 840, height: 960, borderRadius: "50%",
      background: "radial-gradient(ellipse, rgba(37,99,235,0.055) 0%, transparent 68%)",
      pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: "radial-gradient(circle, rgba(37,99,235,0.042) 1px, transparent 1px)",
      backgroundSize: "58px 58px",
    }} />
    <div style={{
      position: "absolute", left: "50%", top: 0, transform: "translateX(-50%)",
      width: 600, height: 1100,
      background: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.016) 0%, transparent 64%)",
      pointerEvents: "none",
    }} />
    <div style={{
      position: "absolute", inset: 0,
      background: "radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(3,6,12,0.82) 78%)",
      pointerEvents: "none",
    }} />
  </div>
);

/* ═══════════════════════════════════════════════════
   COST CARD (Scene 2)
══════════════════════════════════════════════════════ */
interface CostCardProps {
  label: string; amount: string; note: string;
  x: number; y: number; startFrame: number; fromSide: "left" | "right";
}

const CostCard: React.FC<CostCardProps> = ({ label, amount, note, x, y, startFrame, fromSide }) => {
  const frame = useCurrentFrame();
  const t = eo5(cl((frame - startFrame) / 20, 0, 1));
  const slideX = (1 - t) * (fromSide === "left" ? -80 : 80);
  const breathe = t > 0.95 ? 0.18 + Math.sin((frame - startFrame) * 0.06) * 0.10 : 0;

  return (
    <div style={{
      position: "absolute", left: x, top: y, width: 248,
      opacity: t, transform: `translateX(${slideX}px)`,
      background: "rgba(239,68,68,0.07)",
      border: "1.5px solid rgba(239,68,68,0.32)",
      borderRadius: 14, padding: "16px 20px 18px",
      boxShadow: `0 0 0 1px rgba(239,68,68,${breathe}), 0 4px 24px rgba(239,68,68,${breathe * 0.5})`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: D.red, boxShadow: `0 0 6px ${D.red}`, flexShrink: 0 }} />
        <span style={{ fontSize: 12, fontWeight: 800, color: "rgba(239,68,68,0.82)", fontFamily: "system-ui, sans-serif", letterSpacing: 2.4, textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: 44, fontWeight: 900, color: D.white, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1 }}>
        {amount}
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.36)", fontFamily: "system-ui, sans-serif", marginTop: 4 }}>
        {note}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   BOOKING REQUEST CARD (Scene 4) — solid white, real UI feel
══════════════════════════════════════════════════════ */
interface BookingReqProps {
  initials: string; name: string; service: string;
  day: string; time: string; amount: number;
  accentColor: string; startFrame: number; index: number;
}

const BookingRequestCard: React.FC<BookingReqProps> = ({
  initials, name, service, day, time, amount, accentColor, startFrame, index,
}) => {
  const frame = useCurrentFrame();
  const t = eo5(cl((frame - startFrame) / 20, 0, 1));

  return (
    <div style={{
      opacity: t,
      transform: `translateY(${(1 - t) * 50}px) scale(${0.92 + t * 0.08})`,
      background: D.offwhite,
      borderRadius: 18,
      padding: "20px 26px",
      display: "flex", alignItems: "center", gap: 20,
      boxShadow: "0 3px 20px rgba(0,0,0,0.14)",
      marginBottom: 0,
    }}>
      {/* Avatar */}
      <div style={{
        width: 68, height: 68, borderRadius: "50%", flexShrink: 0,
        background: `${accentColor}18`,
        border: `2px solid ${accentColor}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, fontWeight: 900, color: accentColor, fontFamily: "system-ui, sans-serif",
      }}>
        {initials}
      </div>

      {/* Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: accentColor, fontFamily: "system-ui, sans-serif", letterSpacing: 2, textTransform: "uppercase", marginBottom: 3 }}>
          {service}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: D.textDark, fontFamily: "system-ui, sans-serif", letterSpacing: -0.3, marginBottom: 2 }}>
          {name}
        </div>
        <div style={{ fontSize: 17, color: "#64748B", fontFamily: "system-ui, sans-serif" }}>
          {day} · {time}
        </div>
      </div>

      {/* Amount + status */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: D.textDark, fontFamily: "system-ui, sans-serif", letterSpacing: -1.5, lineHeight: 1 }}>
          ${amount}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: `${accentColor}14`, borderRadius: 100,
          padding: "3px 10px", marginTop: 4,
        }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: accentColor }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: accentColor, fontFamily: "system-ui, sans-serif", letterSpacing: 1.5, textTransform: "uppercase" }}>Request</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 1 — Hook: three-zone layout (headline / chair / stats)
══════════════════════════════════════════════════════ */
const SceneHookText: React.FC = () => {
  const frame = useCurrentFrame();

  // TOP ZONE: badge + headline
  const badgeT  = eo4(cl((frame - 4)  / 16, 0, 1));
  const line1T  = eo5(cl((frame - 14) / 14, 0, 1));
  const line2T  = eo5(cl((frame - 23) / 14, 0, 1));
  const lineW   = eo3(cl((frame - 34) / 22, 0, 1));

  // BOTTOM ZONE: 3 stat pills appear after headline
  const stat1T  = eo3(cl((frame - 40) / 18, 0, 1));
  const stat2T  = eo3(cl((frame - 50) / 18, 0, 1));
  const stat3T  = eo3(cl((frame - 60) / 18, 0, 1));

  const stats = [
    { label: "$4,160/mo", sub: "overhead per chair", t: stat1T },
    { label: "1-in-3", sub: "chairs sit idle", t: stat2T },
    { label: "$0 earned", sub: "while empty", t: stat3T },
  ];

  return (
    <>
      {/* ── TOP ZONE: 0–640px ── */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 88, textAlign: "center", padding: "0 60px" }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(37,99,235,0.12)", border: "1px solid rgba(37,99,235,0.28)",
          borderRadius: 100, padding: "10px 28px", marginBottom: 28,
          opacity: badgeT, transform: `translateY(${(1 - badgeT) * -16}px)`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: D.primary }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: D.primary, fontFamily: "system-ui, sans-serif", letterSpacing: 2.8, textTransform: "uppercase" }}>
            The Empty Chair
          </span>
        </div>

        {/* Headline SLAM line 1 */}
        <div style={{
          fontSize: 108, fontWeight: 900, color: D.white,
          fontFamily: "system-ui, sans-serif", letterSpacing: -6, lineHeight: 0.90,
          textTransform: "uppercase",
          opacity: line1T,
          transform: `translateY(${(1 - line1T) * 46}px) scale(${0.76 + line1T * 0.24})`,
          transformOrigin: "center bottom",
        }}>
          An empty chair
        </div>

        {/* Headline SLAM line 2 */}
        <div style={{
          fontSize: 108, fontWeight: 900, color: D.gold,
          fontFamily: "system-ui, sans-serif", letterSpacing: -6, lineHeight: 0.90,
          textTransform: "uppercase", marginTop: 6,
          opacity: line2T,
          transform: `translateY(${(1 - line2T) * 46}px) scale(${0.76 + line2T * 0.24})`,
          transformOrigin: "center bottom",
        }}>
          isn't harmless.
        </div>

        {/* Gold underline */}
        <div style={{ width: `${lineW * 235}px`, height: 4, background: D.gold, borderRadius: 2, margin: "16px auto 0" }} />
      </div>

      {/* ── BOTTOM ZONE: 1280–1920px — 3 stat pills ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 100,
        display: "flex", justifyContent: "center", gap: 24, padding: "0 48px",
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center",
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 16, padding: "22px 16px",
            opacity: s.t, transform: `translateY(${(1 - s.t) * 24}px)`,
          }}>
            <div style={{ fontSize: 36, fontWeight: 900, color: D.white, fontFamily: "system-ui, sans-serif", letterSpacing: -1.5, lineHeight: 1, marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500, color: D.muted, fontFamily: "system-ui, sans-serif", lineHeight: 1.4 }}>
              {s.sub}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 2 — Costs: cards in side zones, tally below chair
══════════════════════════════════════════════════════ */
const SceneCostOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  // Tally slams in after all cards
  const tallyT     = eo5(cl((frame - 76) / 16, 0, 1));
  const tallyScale = 0.72 + tallyT * 0.28;
  const lineW      = eo3(cl((frame - 90) / 16, 0, 1));
  const breakdownT = eo3(cl((frame - 100) / 18, 0, 1));
  const subT       = eo3(cl((frame - 116) / 20, 0, 1));

  return (
    <>
      {/* LEFT COLUMN — in the 300px band left of chair (x: 0–300) */}
      {/* Cards positioned in the chair's vertical range: 640–1280 */}
      <CostCard label="Rent"      amount="$2,800" note="per month"  x={18}  y={645} startFrame={6}  fromSide="left" />
      <CostCard label="Utilities" amount="$340"   note="per month"  x={18}  y={865} startFrame={26} fromSide="left" />
      <CostCard label="Fit-out"   amount="$15k+"  note="amortised"  x={18}  y={1085} startFrame={46} fromSide="left" />

      {/* RIGHT COLUMN — in the 300px band right of chair (x: 780–1080) */}
      <CostCard label="Insurance" amount="$180"   note="per month"  x={814} y={645} startFrame={16} fromSide="right" />
      <CostCard label="Staff"     amount="$800"   note="per month"  x={814} y={865} startFrame={36} fromSide="right" />
      <CostCard label="Floor"     amount="$220"   note="per month"  x={814} y={1085} startFrame={56} fromSide="right" />

      {/* TALLY — centered, below chair visual bottom (1280px) */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 1320,
        textAlign: "center",
        opacity: tallyT,
        transform: `scale(${tallyScale})`,
        transformOrigin: "center top",
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(239,68,68,0.10)", border: "1.5px solid rgba(239,68,68,0.32)",
          borderRadius: 16, padding: "18px 50px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(239,68,68,0.72)", fontFamily: "system-ui, sans-serif", letterSpacing: 3.5, textTransform: "uppercase", marginBottom: 6 }}>
            Monthly overhead
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: D.white, fontFamily: "system-ui, sans-serif", letterSpacing: -3.5 }}>
            $4,160<span style={{ fontSize: 40, color: D.red }}>+</span>
          </div>
        </div>
        <div style={{ width: `${lineW * 340}px`, height: 2, background: "rgba(239,68,68,0.45)", borderRadius: 1, margin: "12px auto 0" }} />
        <div style={{
          marginTop: 10, fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.30)",
          fontFamily: "system-ui, sans-serif",
          opacity: breakdownT, transform: `translateY(${(1 - breakdownT) * 10}px)`,
        }}>
          Daily: $137 · Weekly: $960 · Yearly: $49,920
        </div>
      </div>

      {/* Bottom statement */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 80,
        textAlign: "center", padding: "0 72px",
        opacity: subT, transform: `translateY(${(1 - subT) * 16}px)`,
      }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: D.muted, fontFamily: "system-ui, sans-serif", letterSpacing: -0.5, lineHeight: 1.45 }}>
          You're already paying for every empty hour.
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 3 — Countdown: $250 → $0
══════════════════════════════════════════════════════ */
const SceneCountdownOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  const drainT = interpolate(frame, [15, 75], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const rawVal    = interpolate(frame, [15, 75], [250, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.in(Easing.cubic),
  });
  const displayVal = Math.max(0, Math.round(rawVal));
  const isFrozen   = frame >= 76;
  const counterT   = eo4(cl((frame - 8) / 14, 0, 1));

  // Color bleeds red in last 30%
  const redBlend = Math.max(0, (0.3 - drainT) / 0.3);
  const numColor = isFrozen ? "rgba(100,116,139,0.60)" : `rgb(${Math.round(255 * redBlend + 255 * (1 - redBlend))},${Math.round(255 * (1 - redBlend * 0.7))},${Math.round(255 * (1 - redBlend))})`;

  const frozenT  = eo4(cl((frame - 77) / 12, 0, 1));
  const vigD     = cl((frame - 10) / 72, 0, 0.65);
  const flashO   = interpolate(frame, [75, 78, 86], [0, 0.38, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subT     = eo3(cl((frame - 85) / 20, 0, 1));

  return (
    <>
      {flashO > 0 && <div style={{ position: "absolute", inset: 0, zIndex: 10, background: `rgba(239,68,68,${flashO})`, pointerEvents: "none" }} />}

      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 520px 640px at ${CHAIR_CX}px ${CHAIR_CY}px, transparent 26%, rgba(3,6,12,${vigD}) 68%)`,
        pointerEvents: "none",
      }} />

      {/* Drain bar */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 60, height: 5, background: "rgba(255,255,255,0.08)" }}>
        <div style={{
          width: `${drainT * 100}%`, height: "100%",
          background: "linear-gradient(90deg, #2563EB 0%, #E7D3A7 55%, #EF4444 100%)",
          borderRadius: "0 3px 3px 0",
          boxShadow: `0 0 10px 3px rgba(37,99,235,${drainT * 0.6})`,
        }} />
      </div>

      {/* Counter */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 88, textAlign: "center", opacity: counterT, pointerEvents: "none" }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.38)", fontFamily: "system-ui, sans-serif", letterSpacing: 4.5, textTransform: "uppercase", marginBottom: 4 }}>
          Potential hourly rate
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 4 }}>
          <span style={{ fontSize: 68, fontWeight: 900, color: numColor, fontFamily: "system-ui, sans-serif", lineHeight: 1.18, marginTop: 22 }}>$</span>
          <span style={{ fontSize: 224, fontWeight: 900, color: numColor, fontFamily: "system-ui, sans-serif", letterSpacing: -11, lineHeight: 1 }}>
            {displayVal}
          </span>
        </div>
        {isFrozen && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(239,68,68,0.12)", border: "1.5px solid rgba(239,68,68,0.38)",
            borderRadius: 100, padding: "10px 24px", marginTop: 8,
            opacity: frozenT,
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: D.red, boxShadow: `0 0 7px ${D.red}` }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: D.red, fontFamily: "system-ui, sans-serif", letterSpacing: 2.5, textTransform: "uppercase" }}>
              Earning: $0
            </span>
          </div>
        )}
      </div>

      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 90,
        textAlign: "center", padding: "0 72px",
        opacity: subT, transform: `translateY(${(1 - subT) * 16}px)`,
      }}>
        <div style={{ fontSize: 38, fontWeight: 700, color: D.muted, fontFamily: "system-ui, sans-serif", letterSpacing: -0.5 }}>
          An empty hour generates nothing.
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 4 — SOLUTION: 4 real booking requests + revenue
   No chair. Solid white cards — real app feel, not glassy.
══════════════════════════════════════════════════════ */

// Revenue steps up as each booking card arrives
const getRevenueValue = (f: number): number => {
  if (f < 26) return 0;
  if (f <= 34) return Math.round(interpolate(f, [26, 34], [0, 95],   { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  if (f < 42)  return 95;
  if (f <= 50) return Math.round(interpolate(f, [42, 50], [95, 170], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  if (f < 58)  return 170;
  if (f <= 66) return Math.round(interpolate(f, [58, 66], [170, 280],{ extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  if (f < 74)  return 280;
  if (f <= 82) return Math.round(interpolate(f, [74, 82], [280, 370],{ extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  return 370;
};

const SceneSolutionOverlay: React.FC = () => {
  const frame = useCurrentFrame();

  const revenue  = getRevenueValue(frame);
  const revenueT = eo4(cl((frame - 4) / 16, 0, 1));

  // Header
  const headT   = eo5(cl((frame - 6) / 14, 0, 1));

  // Bottom projection
  const projT   = eo3(cl((frame - 90) / 18, 0, 1));

  const REQUESTS = [
    { initials: "ET", name: "Emma T.",   service: "Balayage & Colour",   day: "Mon", time: "10:00 AM", amount: 95,  color: D.primary,  sf: 10 },
    { initials: "RK", name: "Riley K.",  service: "Cut & Blowout",       day: "Mon", time: "1:00 PM",  amount: 75,  color: "#7C3AED",  sf: 26 },
    { initials: "JM", name: "Jordan M.", service: "Colour Treatment",    day: "Tue", time: "9:00 AM",  amount: 110, color: "#0891B2",  sf: 42 },
    { initials: "PS", name: "Priya S.",  service: "Braiding & Style",    day: "Tue", time: "2:00 PM",  amount: 90,  color: "#059669",  sf: 58 },
  ];

  return (
    <>
      {/* ── REVENUE HEADER — top zone ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 80,
        textAlign: "center", padding: "0 60px",
      }}>
        {/* "Booking requests" label */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.28)",
          borderRadius: 100, padding: "10px 28px", marginBottom: 22,
          opacity: headT, transform: `translateY(${(1 - headT) * -16}px)`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: D.green, boxShadow: `0 0 6px ${D.green}` }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: D.green, fontFamily: "system-ui, sans-serif", letterSpacing: 2.5, textTransform: "uppercase" }}>
            New requests incoming
          </span>
        </div>

        {/* Revenue counter */}
        <div style={{ opacity: revenueT, transform: `translateY(${(1 - revenueT) * 20}px)` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.36)", fontFamily: "system-ui, sans-serif", letterSpacing: 4, textTransform: "uppercase", marginBottom: 4 }}>
            Revenue today
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 2 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: D.green, fontFamily: "system-ui, sans-serif", lineHeight: 1.15, marginTop: 14 }}>$</span>
            <span style={{ fontSize: 166, fontWeight: 900, color: D.green, fontFamily: "system-ui, sans-serif", letterSpacing: -8, lineHeight: 1 }}>
              {revenue}
            </span>
          </div>
          <div style={{ width: `${revenueT * 180}px`, height: 3, background: D.green, borderRadius: 2, margin: "6px auto 0", opacity: 0.45 }} />
        </div>
      </div>

      {/* ── BOOKING REQUEST CARDS ── */}
      {/* Stacked in the center zone, left:60/right:60 margins */}
      <div style={{
        position: "absolute", left: 60, right: 60, top: 490,
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        {REQUESTS.map((r, i) => (
          <BookingRequestCard key={i}
            initials={r.initials} name={r.name} service={r.service}
            day={r.day} time={r.time} amount={r.amount}
            accentColor={r.color} startFrame={r.sf} index={i}
          />
        ))}
      </div>

      {/* ── BOTTOM PROJECTION ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 80,
        textAlign: "center",
        opacity: projT, transform: `translateY(${(1 - projT) * 16}px)`,
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(34,197,94,0.08)", border: "1.5px solid rgba(34,197,94,0.25)",
          borderRadius: 16, padding: "18px 48px",
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(34,197,94,0.65)", fontFamily: "system-ui, sans-serif", letterSpacing: 3, textTransform: "uppercase", marginBottom: 6 }}>
            Projected monthly · 1 chair
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, color: D.white, fontFamily: "system-ui, sans-serif", letterSpacing: -2.5 }}>
            $2,400<span style={{ fontSize: 28, color: "rgba(34,197,94,0.7)", marginLeft: 4 }}>avg</span>
          </div>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 5 — CTA: clean brand lockup, no chair
══════════════════════════════════════════════════════ */
const SceneCTAOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const badgeT    = eo3(cl((frame - 4)  / 18, 0, 1));
  const headSpring = spring({ frame: frame - 14, fps, config: { damping: 12, stiffness: 110, mass: 0.9 }, from: 0, to: 1 });
  const subT      = eo3(cl((frame - 32) / 20, 0, 1));
  const urlT      = eo3(cl((frame - 48) / 16, 0, 1));
  const glowO     = eo3(cl(frame / 24, 0, 1));

  return (
    <>
      {/* Ambient centred glow — not tied to chair position */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(231,211,167,${glowO * 0.12}) 0%, rgba(37,99,235,${glowO * 0.08}) 38%, transparent 65%)`,
        filter: "blur(50px)", pointerEvents: "none",
      }} />

      {/* Brand lockup — top, centered */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 88, textAlign: "center", padding: "0 60px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(231,211,167,0.10)", border: "1px solid rgba(231,211,167,0.28)",
          borderRadius: 100, padding: "10px 28px", marginBottom: 24,
          opacity: badgeT, transform: `translateY(${(1 - badgeT) * -14}px)`,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: D.gold }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: D.gold, fontFamily: "system-ui, sans-serif", letterSpacing: 2.8, textTransform: "uppercase" }}>
            Beta now open
          </span>
        </div>

        <div style={{ opacity: headSpring, transform: `translateY(${(1 - headSpring) * 38}px)` }}>
          <div style={{ fontSize: 100, fontWeight: 900, color: D.white, fontFamily: "system-ui, sans-serif", letterSpacing: -5, lineHeight: 0.88, textTransform: "uppercase" }}>
            SHARED
          </div>
          <div style={{ fontSize: 100, fontWeight: 900, color: D.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -5, lineHeight: 0.88, textTransform: "uppercase" }}>
            SALON.
          </div>
          <div style={{ width: `${headSpring * 220}px`, height: 3, background: D.gold, borderRadius: 2, margin: "16px auto 0" }} />
        </div>
      </div>

      {/* Subtext — centered vertically in lower half */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: "55%", transform: "translateY(-50%)",
        textAlign: "center", padding: "0 72px",
        opacity: subT,
      }}>
        <div style={{ fontSize: 36, fontWeight: 700, color: D.white, fontFamily: "system-ui, sans-serif", letterSpacing: -1, lineHeight: 1.45 }}>
          That's the gap Shared Salon
          <br />is built to help fill.
        </div>
      </div>

      {/* URL — bottom */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 80, textAlign: "center", opacity: urlT }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 14, padding: "16px 38px",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: D.green, boxShadow: `0 0 8px ${D.green}` }} />
          <span style={{ fontSize: 26, fontWeight: 700, color: D.white, fontFamily: "system-ui, sans-serif", letterSpacing: 0.5 }}>
            sharedsalon.com.au
          </span>
        </div>
      </div>
    </>
  );
};

/* ═══════════════════════════════════════════════════
   ROOT COMPOSITION — 600 frames (~20 seconds)
   Chair visible in Scenes 1–3 only (frames 0–370)
   Scenes 4–5 are chairless
══════════════════════════════════════════════════════ */
export const SharedSalonEmptyChairAd: React.FC = () => {
  const frame = useCurrentFrame();

  const pushScale = interpolate(frame, [0, 80], [1.0, 1.075], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  /*
   * Chair state machine — chair only exists in Scenes 1–3
   *
   * Normal:  full for Scenes 1–2 (0–180), fades out entering Scene 3 (180–250), gone by 250
   * Muted:   builds across Scene 2 as costs stack (100–250), full for Scene 3 (250–370),
   *          fades out completely at Scene 3→4 transition (365–380)
   */
  const normalOpacity = (() => {
    if (frame <= 180) return 1;
    if (frame <= 250) return interpolate(frame, [180, 250], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return 0;
  })();

  const mutedOpacity = (() => {
    if (frame < 100) return 0;
    if (frame <= 250) return interpolate(frame, [100, 250], [0, 0.55], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (frame <= 268) return interpolate(frame, [250, 268], [0.55, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (frame <= 365) return 1;
    if (frame <= 380) return interpolate(frame, [365, 380], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return 0; // Completely gone for Scenes 4 and 5
  })();

  /* Screen shake at $0 (absolute frames 318–330) */
  const shakeX = (() => {
    if (frame < 318 || frame > 330) return 0;
    const t = frame - 318;
    return Math.sin(t * 3.2) * 5 * Math.max(0, 1 - t / 12);
  })();
  const shakeY = (() => {
    if (frame < 318 || frame > 330) return 0;
    const t = frame - 318;
    return Math.sin(t * 2.5 + 1.1) * 3 * Math.max(0, 1 - t / 12);
  })();

  /* Particles suppressed during Scene 3 (stark mood) */
  const particleOpacity = (() => {
    if (frame < 250) return 1;
    if (frame < 270) return interpolate(frame, [250, 270], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (frame < 370) return 0;
    return interpolate(frame, [370, 392], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  })();

  const chairStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    top: CHAIR_TOP,
    transform: "translateX(-50%)",
    pointerEvents: "none",
  };

  return (
    <AbsoluteFill style={{ background: D.bg, overflow: "hidden" }}>

      {/* ── BACKGROUND ── */}
      <SalonRoom pushScale={pushScale} />
      <div style={{ position: "absolute", inset: 0, opacity: particleOpacity, pointerEvents: "none" }}>
        <AmbientParticles />
      </div>

      {/* ── SCREEN SHAKE WRAPPER (only affects chair, keeps UI stable) ── */}
      <div style={{
        position: "absolute", inset: 0,
        transform: `translateX(${shakeX}px) translateY(${shakeY}px)`,
        pointerEvents: "none",
      }}>
        {/* CHAIR: NORMAL */}
        <div style={{ ...chairStyle, opacity: normalOpacity }}>
          <SalonChairIllustration
            scale={CHAIR_SCALE} startFrame={0}
            showGlow={frame < 200} muted={false} outlineMode={false} float={true}
            instanceId="chair-n"
          />
        </div>
        {/* CHAIR: MUTED (progressive desaturation overlay) */}
        <div style={{ ...chairStyle, opacity: mutedOpacity }}>
          <SalonChairIllustration
            scale={CHAIR_SCALE} startFrame={0}
            showGlow={false} muted={true} outlineMode={false} float={false}
            instanceId="chair-m"
          />
        </div>
      </div>

      {/* ── SCENE OVERLAYS ── */}
      <Sequence from={0}   durationInFrames={80}>  <SceneHookText />      </Sequence>
      <Sequence from={80}  durationInFrames={170}> <SceneCostOverlay />   </Sequence>
      <Sequence from={250} durationInFrames={120}> <SceneCountdownOverlay /> </Sequence>
      <Sequence from={370} durationInFrames={120}> <SceneSolutionOverlay /> </Sequence>
      <Sequence from={490} durationInFrames={110}> <SceneCTAOverlay />    </Sequence>

      {/* ── ROOT-LEVEL TRANSITIONS (absolute frame, never inside Sequence) ── */}
      <SceneTransitionLine start={76}  color={D.primary} />
      <DarknessSlam        start={246} />
      <BrightFlash         start={366} />
      <SceneTransitionLine start={487} color={D.gold} />

    </AbsoluteFill>
  );
};
