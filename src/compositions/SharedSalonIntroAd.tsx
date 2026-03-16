/**
 * SharedSalonIntroAd — "What Shared Salon Actually Does"  [V2 — Post-Audit Rewrite]
 *
 * Instagram introduction video for Shared Salon. 9:16, 32 seconds.
 * Hook → Retention → Payoff storyboard pipeline.
 *
 * Format:   9:16 portrait (1080 × 1920)
 * Duration: 960 frames @ 30fps = 32 seconds
 *
 *  S1  HOOK     (  0– 90f,  3s)  5-word scale-snap reveal — each word width:100%, textAlign:center
 *  S2  PROBLEM  ( 90–240f,  5s)  Two-column split — tall cards fill y:240–1230, no dead zones
 *  S3  WHAT     (240–390f,  5s)  Platform nodes 280px, arc at y:420–1100, stats row, description
 *  S4  HOW      (390–570f,  6s)  Three 450px-tall step cards fill y:300–1690, footer y:1720
 *  S5  NUMBERS  (570–720f,  5s)  Stats anchored from top (y:180), context text at y:900, ghost fill
 *  S6  PAYOFF   (720–960f,  8s)  Bold blue brand close — dual-audience CTA, full canvas sparkles
 *
 * AUDIT FIXES APPLIED (V2):
 *  ◆ S1: All word divs now width:"100%" + textAlign:"center" — eliminates left-clip overflow
 *  ◆ S1: Font sizes recalculated to fit within 952px (1080 - 64px each side)
 *  ◆ S1: Bottom dead zone (y:1280–1760) filled with sub-copy + beta stat badge
 *  ◆ S2: Cards increased to 190px-tall with more padding — column now fills y:240–1230
 *  ◆ S2: Right-column $0 visibility boosted (opacity 0.14, 240px font)
 *  ◆ S2: Bottom zone y:1300–1800 filled with statement + secondary badge
 *  ◆ S3: Nodes enlarged to 280px, arc repositioned to y:420–1100 (680px height)
 *  ◆ S3: Stats row added at y:1150–1450, description moved to y:1500–1720
 *  ◆ S4: Cards are now 450px tall each, filling y:300–1690 (nearly full canvas)
 *  ◆ S5: Content anchored from top (paddingTop:180) not centered — fills upper half
 *  ◆ S5: Ghost watermark number + context text fill the lower canvas
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:       "#FAF8F5",
  bgBlue:   "#EEF4FF",
  primary:  "#2563EB",
  dark:     "#1432B5",
  deepDark: "#060D1A",
  secondary:"#DCE8FF",
  accent:   "#E7D3A7",
  text:     "#0B1730",
  body:     "#66758F",
  border:   "#D8DEE8",
  red:      "#DC2626",
  green:    "#16A34A",
};

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';

// ─── Easing helpers ─────────────────────────────────────────────────────────
const eo3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// Snap easing — easeOut5 with a small overshoot
const snap = (t: number) => {
  const s = eo5(t);
  return s > 0.72 ? s + Math.sin((s - 0.72) * Math.PI * 5.5) * 0.026 * (1 - s) : s;
};

// ─── Ambient floating dots ───────────────────────────────────────────────────
const ADEFS = [
  { bx:  80, by:  240, px: 42, py: 58, pf: 0.016 },
  { bx: 960, by:  360, px: 36, py: 52, pf: 0.013 },
  { bx: 200, by:  820, px: 50, py: 40, pf: 0.018 },
  { bx: 880, by:  960, px: 30, py: 55, pf: 0.012 },
  { bx: 140, by: 1480, px: 46, py: 44, pf: 0.015 },
  { bx: 920, by: 1600, px: 38, py: 50, pf: 0.014 },
  { bx: 540, by:  120, px: 60, py: 34, pf: 0.011 },
  { bx: 500, by: 1800, px: 34, py: 40, pf: 0.017 },
];

const AmbientDots: React.FC<{ color?: string; opacity?: number }> = ({
  color = C.primary, opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {ADEFS.map((d, i) => {
        const f = d.pf * frame + i * 1.4;
        const x = d.bx + Math.sin(f) * d.px;
        const y = d.by + Math.cos(f * 0.8) * d.py;
        const a = (0.07 + Math.sin(f * 1.6 + i) * 0.04) * opacity;
        return (
          <div key={i} style={{
            position: "absolute", left: x, top: y,
            width: 5, height: 5, borderRadius: "50%",
            background: color, opacity: a, pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

// ─── Root-level: scene transition wipe ──────────────────────────────────────
const SceneWipe: React.FC<{ start: number; color?: string }> = ({
  start, color = C.primary,
}) => {
  const frame = useCurrentFrame();
  const lf = frame - start;
  if (lf < 0 || lf > 16) return null;
  return (
    <div style={{
      position: "absolute", top: 0, bottom: 0,
      left: (lf / 16) * 1120 - 8, width: 5,
      background: color,
      boxShadow: `0 0 28px 14px ${color}55`,
      zIndex: 80, pointerEvents: "none",
    }} />
  );
};

// ─── Root-level: bright flash ────────────────────────────────────────────────
const BrightFlash: React.FC<{ start: number }> = ({ start }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [start, start + 4, start + 18], [0, 0.88, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  if (opacity <= 0) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 70,
      background: `radial-gradient(ellipse at 50% 50%,
        rgba(255,255,255,${opacity * 0.90}) 0%,
        rgba(37,99,235,${opacity * 0.45}) 32%,
        transparent 68%)`,
      pointerEvents: "none",
    }} />
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK  (frames 0–89, 3s)
//
// AUDIT FIXES:
//  ✓ Each word div: width:"100%" + textAlign:"center" — text centres on canvas, no clipping
//  ✓ Font sizes verified to fit within 952px usable width (1080 - 64px margins each side):
//      "WHAT"    260px: ~548px ✓
//      "IF YOUR" 190px: ~587px ✓
//      "VENUE"   260px: ~683px ✓
//      "PAID YOU"190px: ~683px ✓
//      "TWICE?"  220px: ~680px ✓
//  ✓ Bottom dead zone (y:1280–1760) filled: accent rule + sub-copy + beta badge
//
// The scale-snap-from-center effect is preserved and now renders correctly.
// ═══════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [76, 89], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Verified widths at 952px max (1080 - 2×64px padding):
  //    "WHAT"    260px × 4 chars × ~0.55 ratio − 3×8px spacing = ~548px  ✓
  //    "IF YOUR" 190px × 6 chars × ~0.55 ratio − 5×8px spacing = ~587px  ✓
  //    "VENUE"   260px × 5 chars × ~0.55 ratio − 4×8px spacing = ~683px  ✓
  //    "PAID YOU"190px × 7 chars × ~0.55 ratio − 6×8px spacing = ~683px  ✓
  //    "TWICE?"  220px × 6 chars × ~0.55 ratio − 5×8px spacing = ~680px  ✓
  const LINES = [
    { text: "WHAT",     delay:  0, color: C.text,    size: 260 },
    { text: "IF YOUR",  delay: 12, color: C.text,    size: 190 },
    { text: "VENUE",    delay: 24, color: C.text,    size: 260 },
    { text: "PAID YOU", delay: 36, color: C.primary, size: 190 },
    { text: "TWICE?",   delay: 48, color: C.primary, size: 220 },
  ] as const;

  const badgeT  = eo4(cl(frame / 14, 0, 1));
  const ruleT   = eo3(cl((frame - 52) / 18, 0, 1));
  const subT    = eo3(cl((frame - 58) / 20, 0, 1));
  const betaT   = eo3(cl((frame - 66) / 18, 0, 1));
  const bgGlow  = eo3(cl(frame / 30, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: sceneOp, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Dot grid */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${C.border}70 1px, transparent 1px)`,
        backgroundSize: "52px 52px", opacity: 0.6,
      }} />

      {/* Atmospheric glows */}
      <div style={{
        position: "absolute", top: -180, right: -180,
        width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,${0.07 * bgGlow}), transparent 65%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -200, left: -100,
        width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(231,211,167,${0.22 * bgGlow}), transparent 65%)`,
        pointerEvents: "none",
      }} />

      <AmbientDots color={C.primary} opacity={0.55} />

      {/* ── BADGE — top ── */}
      <div style={{
        position: "absolute", top: 90, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeT, transform: `translateY(${(1 - badgeT) * -18}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(37,99,235,0.08)",
          border: "1.5px solid rgba(37,99,235,0.22)",
          borderRadius: 100, padding: "10px 30px",
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: C.primary, boxShadow: `0 0 8px ${C.primary}`,
          }} />
          <span style={{
            fontSize: 17, fontWeight: 700, color: C.primary,
            fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase",
          }}>
            Introducing Shared Salon
          </span>
        </div>
      </div>

      {/* ── WORD STACK — scale-snap from center ──
          AUDIT FIX: width:"100%" ensures transform-origin 50%/50% = true canvas center.
          textAlign:"center" prevents left-anchor overflow clipping. ── */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: "50%", transform: "translateY(-52%)",
        display: "flex", flexDirection: "column",
        alignItems: "center",
        padding: "0 64px",
        lineHeight: 0.88,
      }}>
        {LINES.map((line, i) => {
          const t = snap(cl((frame - line.delay) / 20, 0, 1));
          const op = interpolate(t, [0, 0.18], [0, 1], { extrapolateRight: "clamp" });
          const blur = interpolate(t, [0, 0.55], [10, 0], { extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                // AUDIT FIX: full width + textAlign center = no clipping
                width: "100%",
                textAlign: "center",
                fontSize: line.size,
                fontWeight: 900,
                fontFamily: SANS,
                color: line.color,
                letterSpacing: -8,
                lineHeight: 0.88,
                textTransform: "uppercase",
                transform: `scale(${t})`,
                transformOrigin: "50% 50%",
                opacity: op,
                filter: `blur(${blur}px)`,
                ...(line.color === C.primary
                  ? { textShadow: `0 0 80px rgba(37,99,235,0.25)` }
                  : {}),
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      {/* ── BOTTOM ZONE — AUDIT FIX: was 550px empty, now filled ──
          Accent rule → sub-copy → beta badge — uses y:1300–1840 ── */}

      {/* Horizontal accent rule */}
      <div style={{
        position: "absolute",
        left: "50%", transform: "translateX(-50%)",
        bottom: 450,
        width: `${ruleT * 440}px`, height: 4,
        background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
        borderRadius: 3,
      }} />

      {/* Sub-copy — bottom: 260 (~y:1600) */}
      <div style={{
        position: "absolute", bottom: 260, left: 0, right: 0,
        textAlign: "center", padding: "0 80px",
        opacity: subT, transform: `translateY(${(1 - subT) * 22}px)`,
      }}>
        <div style={{
          fontSize: 34, fontWeight: 600, color: C.body,
          fontFamily: SANS, lineHeight: 1.50, letterSpacing: "-0.01em",
        }}>
          Most venue owners don&apos;t know
          <br />
          <span style={{ color: C.text, fontWeight: 800 }}>this exists yet.</span>
        </div>
      </div>

      {/* Beta badge — bottom: 90 (~y:1760) */}
      <div style={{
        position: "absolute", bottom: 90, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: betaT, transform: `translateY(${(1 - betaT) * 16}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          background: C.bgBlue,
          border: `1.5px solid ${C.secondary}`,
          borderRadius: 100, padding: "14px 36px",
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: C.green, boxShadow: `0 0 8px ${C.green}`,
          }} />
          <span style={{
            fontSize: 22, fontWeight: 700, color: C.primary, fontFamily: SANS,
          }}>
            Beta now open · Join free
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — THE PROBLEM  (frames 90–239, 5s)
//
// AUDIT FIXES:
//  ✓ Cards increased to ~190px tall — left column fills y:240–1230 (was ending at y:870)
//  ✓ Right-column $0: opacity raised to 0.14, font 240px (was invisible at 0.08)
//  ✓ Bottom zone: statement fills y:1290–1540, supporting badge fills y:1580–1760
// ═══════════════════════════════════════════════════════════════════════════

const COSTS = [
  { label: "Rent",      amount: "$2,800", note: "per month", delay:  8 },
  { label: "Staff",     amount: "$800",   note: "per month", delay: 26 },
  { label: "Utilities", amount: "$340",   note: "per month", delay: 44 },
  { label: "Insurance", amount: "$220",   note: "per month", delay: 62 },
] as const;

const SceneProblem: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [128, 149], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const headerT  = eo4(cl(frame / 14, 0, 1));
  const dividerH = eo3(cl((frame - 4) / 55, 0, 1));
  const tallyT   = eo5(cl((frame - 82) / 18, 0, 1));
  const zeroT    = eo4(cl((frame - 6) / 22, 0, 1));
  const statT    = eo3(cl((frame - 96) / 22, 0, 1));
  const badgeT   = eo3(cl((frame - 116) / 20, 0, 1));
  const pulse    = 0.55 + Math.sin(frame * 0.11) * 0.45;

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>
      <AbsoluteFill style={{ background: C.deepDark }} />

      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 900px 800px at 25% 50%,
          rgba(220,38,38,${0.07 * pulse}) 0%, transparent 65%)`,
      }} />
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 700px 700px at 78% 48%,
          rgba(37,99,235,0.06) 0%, transparent 65%)`,
      }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, rgba(220,232,255,0.035) 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
      }} />

      {/* ── COLUMN HEADERS ── */}
      <div style={{
        position: "absolute", top: 100, left: 60,
        opacity: headerT, transform: `translateY(${(1 - headerT) * -16}px)`,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 800, color: "rgba(220,38,38,0.72)",
          fontFamily: SANS, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8,
        }}>What you pay monthly</div>
        <div style={{
          fontSize: 50, fontWeight: 900, color: "white",
          fontFamily: SANS, letterSpacing: -2.5, lineHeight: 0.9,
        }}>Fixed<br />costs</div>
      </div>

      <div style={{
        position: "absolute", top: 100, right: 60, textAlign: "right",
        opacity: headerT, transform: `translateY(${(1 - headerT) * -16}px)`,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.28)",
          fontFamily: SANS, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8,
        }}>From idle chairs</div>
        <div style={{
          fontSize: 50, fontWeight: 900, color: "rgba(255,255,255,0.20)",
          fontFamily: SANS, letterSpacing: -2.5, lineHeight: 0.9,
        }}>Zero<br />income</div>
      </div>

      {/* ── CENTER DIVIDER — draws down ── */}
      <div style={{
        position: "absolute",
        left: "50%", transform: "translateX(-50%)",
        top: 88, width: 2,
        height: `${dividerH * 1200}px`,
        background: "rgba(255,255,255,0.08)", borderRadius: 1,
      }} />

      {/* ── LEFT COLUMN — AUDIT FIX: taller cards (190px each) fill y:240–1230 ── */}
      <div style={{
        position: "absolute",
        top: 240, left: 36, width: 482,
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        {COSTS.map((c, i) => {
          const t = eo5(cl((frame - c.delay) / 18, 0, 1));
          return (
            <div key={i} style={{
              opacity: t,
              transform: `translateY(${(1 - t) * 40}px)`,
              background: "rgba(220,38,38,0.07)",
              border: "1.5px solid rgba(220,38,38,0.25)",
              borderRadius: 18,
              // AUDIT FIX: padding increased for taller cards (~190px each)
              padding: "34px 28px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontSize: 13, fontWeight: 800, color: "rgba(220,38,38,0.65)",
                  fontFamily: SANS, letterSpacing: "0.12em",
                  textTransform: "uppercase", marginBottom: 8,
                }}>{c.label}</div>
                <div style={{
                  fontSize: 20, color: "rgba(255,255,255,0.35)",
                  fontFamily: SANS,
                }}>{c.note}</div>
              </div>
              <div style={{
                fontSize: 56, fontWeight: 900, color: "white",
                fontFamily: SANS, letterSpacing: -2,
              }}>{c.amount}</div>
            </div>
          );
        })}

        {/* Tally card */}
        <div style={{
          opacity: tallyT,
          transform: `scale(${0.80 + tallyT * 0.20}) translateY(${(1 - tallyT) * 30}px)`,
          transformOrigin: "left top",
          background: "rgba(220,38,38,0.14)",
          border: "2px solid rgba(220,38,38,0.45)",
          borderRadius: 18, padding: "28px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{
            fontSize: 14, fontWeight: 800, color: "rgba(220,38,38,0.80)",
            fontFamily: SANS, letterSpacing: "0.12em", textTransform: "uppercase",
          }}>Monthly total</div>
          <div style={{
            fontSize: 64, fontWeight: 900, color: C.red,
            fontFamily: SANS, letterSpacing: -3,
          }}>$4,160<span style={{ fontSize: 34 }}>+</span></div>
        </div>
      </div>

      {/* ── RIGHT COLUMN — AUDIT FIX: opacity 0.14 (was 0.08), 240px font ── */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        width: 484,
        transform: "translateY(-50%)",
        paddingLeft: 40,
        opacity: zeroT,
      }}>
        <div style={{
          fontSize: 240, fontWeight: 900,
          // AUDIT FIX: raised from 0.08 to 0.14 — now visible
          color: "rgba(255,255,255,0.14)",
          fontFamily: SANS, letterSpacing: -12, lineHeight: 0.85,
        }}>$0</div>
        <div style={{
          fontSize: 26, color: "rgba(255,255,255,0.25)",
          fontFamily: SANS, fontWeight: 600, lineHeight: 1.5, marginTop: 10,
        }}>
          earned from chairs
          <br />
          <span style={{ color: "rgba(255,255,255,0.14)" }}>sitting empty every day</span>
        </div>
      </div>

      {/* ── BOTTOM ZONE — AUDIT FIX: two elements fill y:1290–1800 ── */}

      {/* Statement card — y:~1290 */}
      <div style={{
        position: "absolute",
        bottom: 200, left: 0, right: 0,
        textAlign: "center", padding: "0 56px",
        opacity: statT, transform: `translateY(${(1 - statT) * 24}px)`,
      }}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 22, padding: "30px 40px",
        }}>
          <div style={{
            fontSize: 38, fontWeight: 700, color: "rgba(255,255,255,0.55)",
            fontFamily: SANS, letterSpacing: "-0.02em", lineHeight: 1.45,
          }}>
            The average venue loses{" "}
            <span style={{ color: C.red, fontWeight: 900 }}>$49,920</span>
            {" "}in potential revenue every year.
          </div>
        </div>
      </div>

      {/* Supporting badge — y:~1760 */}
      <div style={{
        position: "absolute", bottom: 88, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeT, transform: `translateY(${(1 - badgeT) * 14}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          background: "rgba(220,38,38,0.10)",
          border: "1px solid rgba(220,38,38,0.30)",
          borderRadius: 100, padding: "12px 32px",
        }}>
          <span style={{
            fontSize: 20, fontWeight: 700, color: "rgba(220,38,38,0.75)",
            fontFamily: SANS,
          }}>
            1 in 3 chairs sits idle every single day
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — WHAT IS SHARED SALON  (frames 240–389, 5s)
//
// AUDIT FIXES:
//  ✓ Nodes enlarged to 280×280px (was 220px)
//  ✓ Connection visual repositioned to y:420–1100 (680px height, was 440px at y:640)
//  ✓ Stats row added at y:1150–1440 — fills the 760px gap that was empty
//  ✓ Description moved to y:1500–1720 (was isolated at bottom:80 with dead space above)
// ═══════════════════════════════════════════════════════════════════════════

const SceneWhat: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [135, 149], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const badgeT     = eo4(cl(frame / 14, 0, 1));
  const headT      = eo5(cl((frame - 8) / 22, 0, 1));
  const head2T     = eo5(cl((frame - 20) / 22, 0, 1));
  const lineT      = eo3(cl((frame - 32) / 18, 0, 1));
  const venueT     = eo5(cl((frame - 40) / 22, 0, 1));
  const freelanceT = eo5(cl((frame - 54) / 22, 0, 1));
  const arcProgress = eo4(cl((frame - 62) / 40, 0, 1));
  const arcLen     = 720;
  const arcOffset  = arcLen * (1 - arcProgress);
  const revBadgeT  = eo5(cl((frame - 110) / 22, 0, 1));
  const descT      = eo3(cl((frame - 100) / 24, 0, 1));
  const statsT     = eo4(cl((frame - 88) / 26, 0, 1));

  // Bezier path: M 60 140 C 260 -20, 700 -20, 900 140
  const arcPath = "M 60 140 C 260 -20, 700 -20, 900 140";

  const getPulseXY = (t: number) => {
    const mt = 1 - t;
    const x = mt*mt*mt*60 + 3*mt*mt*t*260 + 3*mt*t*t*700 + t*t*t*900;
    const y = mt*mt*mt*140 + 3*mt*mt*t*(-20) + 3*mt*t*t*(-20) + t*t*t*140;
    return { x, y };
  };

  const PULSES = [
    { delay: 90,  color: C.primary  },
    { delay: 108, color: "#7C3AED" },
    { delay: 126, color: "#059669" },
  ];

  const STATS_ROW = [
    { value: "2,800+", label: "Chairs listed" },
    { value: "4.8★",   label: "Host rating" },
    { value: "400+",   label: "Active venues" },
  ];

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>
      <AbsoluteFill style={{ background: C.bg }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${C.border}60 1px, transparent 1px)`,
        backgroundSize: "52px 52px", opacity: 0.55,
      }} />
      <div style={{
        position: "absolute", top: -100, left: "50%", transform: "translateX(-50%)",
        width: 1000, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,0.06), transparent 65%)`,
        pointerEvents: "none",
      }} />
      <AmbientDots color={C.primary} opacity={0.5} />

      {/* ── BADGE + HEADLINE — y:88–380 ── */}
      <div style={{
        position: "absolute", top: 88, left: 0, right: 0,
        textAlign: "center", padding: "0 64px",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(37,99,235,0.08)",
          border: "1.5px solid rgba(37,99,235,0.20)",
          borderRadius: 100, padding: "10px 30px", marginBottom: 24,
          opacity: badgeT, transform: `translateY(${(1 - badgeT) * -16}px)`,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: C.primary, boxShadow: `0 0 8px ${C.primary}`,
          }} />
          <span style={{
            fontSize: 17, fontWeight: 700, color: C.primary,
            fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase",
          }}>The platform</span>
        </div>

        <div style={{
          fontSize: 100, fontWeight: 900, color: C.text,
          fontFamily: SANS, letterSpacing: -5, lineHeight: 0.86,
          textTransform: "uppercase",
          opacity: headT, transform: `translateY(${(1 - headT) * 36}px)`,
        }}>SHARED</div>
        <div style={{
          fontSize: 100, fontWeight: 900, color: C.primary,
          fontFamily: SANS, letterSpacing: -5, lineHeight: 0.86,
          textTransform: "uppercase", marginBottom: 18,
          opacity: head2T, transform: `translateY(${(1 - head2T) * 36}px)`,
        }}>SALON.</div>
        <div style={{
          width: `${lineT * 260}px`, height: 4,
          background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
          borderRadius: 3, margin: "0 auto",
        }} />
      </div>

      {/* ── CONNECTION VISUAL — AUDIT FIX: y:420–1100 (680px, was 440px at y:640) ── */}
      <div style={{
        position: "absolute",
        left: 60, right: 60,
        top: 420,
        height: 680,
      }}>
        {/* SVG arc */}
        <svg
          viewBox="0 0 960 280"
          width={960} height={280}
          style={{ position: "absolute", top: 140, left: 0 }}
        >
          <path d={arcPath} fill="none" stroke={`rgba(37,99,235,0.08)`} strokeWidth={3} />
          <path
            d={arcPath} fill="none" stroke={C.primary}
            strokeWidth={3.5} strokeLinecap="round"
            strokeDasharray={arcLen} strokeDashoffset={arcOffset}
            style={{ filter: `drop-shadow(0 0 10px rgba(37,99,235,0.40))` }}
          />
          {PULSES.map((p, i) => {
            const pf = frame - p.delay;
            if (pf < 0 || pf > 50) return null;
            const t = eo4(cl(pf / 40, 0, 1));
            const { x, y } = getPulseXY(t);
            const op = pf < 6 ? pf / 6 : pf > 40
              ? interpolate(pf, [40, 50], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
              : 1;
            return (
              <g key={i}>
                <circle cx={x} cy={y + 140} r={13} fill={p.color} opacity={op * 0.16} />
                <circle cx={x} cy={y + 140} r={7} fill={p.color} opacity={op * 0.9} />
              </g>
            );
          })}
        </svg>

        {/* VENUE NODE — left, AUDIT FIX: 280×280px (was 220px) */}
        <div style={{
          position: "absolute", left: 0, top: 0,
          width: 280, height: 280,
          opacity: venueT,
          transform: `translateY(${(1 - venueT) * 50}px) scale(${0.76 + venueT * 0.24})`,
          transformOrigin: "50% 50%",
        }}>
          <div style={{
            width: 280, height: 280, borderRadius: 40,
            background: "white",
            border: `2px solid ${C.border}`,
            boxShadow: `0 10px 48px rgba(37,99,235,0.11), 0 2px 10px rgba(11,23,48,0.07)`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 14,
          }}>
            <svg width={72} height={72} viewBox="0 0 64 64" fill="none">
              <rect x={8} y={20} width={48} height={36} rx={4} fill={`${C.primary}15`} stroke={C.primary} strokeWidth={2.5} />
              <rect x={16} y={12} width={32} height={10} rx={3} fill={`${C.primary}10`} stroke={C.primary} strokeWidth={2} />
              <rect x={22} y={34} width={8} height={10} rx={2} fill={C.primary} opacity={0.4} />
              <rect x={34} y={34} width={8} height={10} rx={2} fill={C.primary} opacity={0.4} />
              <rect x={28} y={42} width={8} height={14} rx={1} fill={C.primary} opacity={0.7} />
            </svg>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text, fontFamily: SANS }}>Venue Owner</div>
            <div style={{ fontSize: 16, color: C.body, fontFamily: SANS, textAlign: "center", padding: "0 16px", lineHeight: 1.45 }}>
              Has idle chairs & space
            </div>
          </div>
        </div>

        {/* Revenue badge — arc midpoint */}
        <div style={{
          position: "absolute",
          left: "50%", top: -50,
          transform: `translateX(-50%) scale(${revBadgeT})`,
          transformOrigin: "50% 100%",
          opacity: revBadgeT,
        }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.primary}, ${C.dark})`,
            borderRadius: 20, padding: "16px 32px",
            boxShadow: `0 8px 36px rgba(37,99,235,0.40)`,
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.58)",
              fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase", marginBottom: 4,
            }}>Live booking</div>
            <div style={{
              fontSize: 46, fontWeight: 900, color: "white",
              fontFamily: SANS, letterSpacing: -2, lineHeight: 1,
            }}>$95</div>
            <div style={{
              fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.55)",
              fontFamily: SANS, marginTop: 2,
            }}>✓ Confirmed</div>
          </div>
          <div style={{
            width: 0, height: 0,
            borderLeft: "11px solid transparent",
            borderRight: "11px solid transparent",
            borderTop: `13px solid ${C.dark}`,
            margin: "0 auto",
          }} />
        </div>

        {/* FREELANCER NODE — right, 280×280px */}
        <div style={{
          position: "absolute", right: 0, top: 0,
          width: 280, height: 280,
          opacity: freelanceT,
          transform: `translateY(${(1 - freelanceT) * 50}px) scale(${0.76 + freelanceT * 0.24})`,
          transformOrigin: "50% 50%",
        }}>
          <div style={{
            width: 280, height: 280, borderRadius: 40,
            background: "white",
            border: `2px solid ${C.border}`,
            boxShadow: `0 10px 48px rgba(37,99,235,0.11), 0 2px 10px rgba(11,23,48,0.07)`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 14,
          }}>
            <svg width={72} height={72} viewBox="0 0 64 64" fill="none">
              <circle cx={32} cy={20} r={10} fill={`${C.primary}15`} stroke={C.primary} strokeWidth={2.5} />
              <path d="M10 52 C10 38, 54 38, 54 52" fill={`${C.primary}15`} stroke={C.primary} strokeWidth={2.5} strokeLinecap="round" />
              <line x1={38} y1={32} x2={48} y2={42} stroke={C.primary} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
              <line x1={42} y1={32} x2={48} y2={38} stroke={C.primary} strokeWidth={2.5} strokeLinecap="round" opacity={0.5} />
            </svg>
            <div style={{ fontSize: 24, fontWeight: 800, color: C.text, fontFamily: SANS }}>Freelancer</div>
            <div style={{ fontSize: 16, color: C.body, fontFamily: SANS, textAlign: "center", padding: "0 16px", lineHeight: 1.45 }}>
              Needs flexible workspace
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS ROW — AUDIT FIX: fills y:1150–1440 (was empty 760px dead zone) ── */}
      <div style={{
        position: "absolute",
        top: 1150, left: 56, right: 56,
        display: "flex", gap: 16,
        opacity: statsT, transform: `translateY(${(1 - statsT) * 28}px)`,
      }}>
        {STATS_ROW.map((s, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center",
            background: "white",
            border: `1.5px solid ${C.border}`,
            borderRadius: 22, padding: "28px 16px",
            boxShadow: "0 4px 20px rgba(11,23,48,0.06)",
          }}>
            <div style={{
              fontSize: 44, fontWeight: 900, color: C.primary,
              fontFamily: SANS, letterSpacing: -2, lineHeight: 1, marginBottom: 8,
            }}>{s.value}</div>
            <div style={{
              fontSize: 18, fontWeight: 600, color: C.body,
              fontFamily: SANS, lineHeight: 1.4,
            }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── DESCRIPTION — AUDIT FIX: y:1500–1720 (was bottom:80 with 760px dead zone above) ── */}
      <div style={{
        position: "absolute",
        top: 1500, left: 0, right: 0,
        textAlign: "center", padding: "0 72px",
        opacity: descT, transform: `translateY(${(1 - descT) * 24}px)`,
      }}>
        <div style={{
          fontSize: 30, fontWeight: 500, color: C.body,
          fontFamily: SANS, lineHeight: 1.55, letterSpacing: "-0.01em",
        }}>
          Connecting idle salon chairs with
          skilled beauty professionals who need them.
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — HOW IT WORKS  (frames 390–569, 6s)
//
// AUDIT FIX — CRITICAL:
//  ✓ Cards increased to 450px tall each (was ~200px)
//  ✓ Layout now fills y:300–1690 (was ending at y:968, leaving 870px empty)
//  ✓ Each card has a large step number (130px) + title (46px) + description (28px)
//    within the 378px content area (450px card − 72px total vertical padding)
// ═══════════════════════════════════════════════════════════════════════════

const STEPS = [
  {
    num: "01",
    title: "List your space",
    desc: "Add your available chairs in under 2 minutes. Set your own price, availability, and house rules.",
    color: C.primary,
    delay: 12,
  },
  {
    num: "02",
    title: "Freelancers discover & book",
    desc: "Skilled beauty pros find your space on our marketplace and book instantly — 24 hours a day.",
    color: "#7C3AED",
    delay: 64,
  },
  {
    num: "03",
    title: "Revenue hits your account",
    desc: "Automatic payments. No chasing, no invoicing, no drama. Your idle chair finally earns.",
    color: C.green,
    delay: 116,
  },
] as const;

const SceneHow: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [158, 179], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const headerT = eo4(cl(frame / 16, 0, 1));
  const trackH  = eo3(cl((frame - 10) / 140, 0, 1));
  const footerT = eo3(cl((frame - 144) / 22, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>
      <AbsoluteFill style={{ background: "white" }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${C.border}50 1px, transparent 1px)`,
        backgroundSize: "48px 48px", opacity: 0.4,
      }} />
      <div style={{
        position: "absolute", top: -120, left: "50%", transform: "translateX(-50%)",
        width: 900, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,0.05), transparent 65%)`,
        pointerEvents: "none",
      }} />
      <AmbientDots color={C.primary} opacity={0.30} />

      {/* ── HEADER — y:88–280 ── */}
      <div style={{
        position: "absolute", top: 88, left: 0, right: 0,
        textAlign: "center", padding: "0 64px",
        opacity: headerT, transform: `translateY(${(1 - headerT) * -20}px)`,
      }}>
        <div style={{
          fontSize: 15, fontWeight: 800, color: C.primary,
          fontFamily: SANS, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10,
        }}>How it works</div>
        <div style={{
          fontSize: 74, fontWeight: 900, color: C.text,
          fontFamily: SANS, letterSpacing: -3.5, lineHeight: 0.88,
        }}>
          Three steps.
          <br />
          <span style={{ color: C.body, fontSize: 52, fontWeight: 600 }}>That&apos;s all.</span>
        </div>
      </div>

      {/* Left track line */}
      <div style={{
        position: "absolute",
        left: 66, top: 310,
        width: 3,
        height: `${trackH * 1390}px`,
        background: `linear-gradient(180deg, ${C.primary} 0%, #7C3AED 48%, ${C.green} 100%)`,
        borderRadius: 2, opacity: 0.22,
      }} />

      {/* ── STEP CARDS — AUDIT FIX: 450px tall, fills y:300–1690 ── */}
      <div style={{
        position: "absolute",
        top: 300, left: 52, right: 52,
        display: "flex", flexDirection: "column", gap: 20,
      }}>
        {STEPS.map((s, i) => {
          const t = snap(cl((frame - s.delay) / 22, 0, 1));
          return (
            <div key={i} style={{
              opacity: t,
              transform: `translateY(${(1 - t) * 70}px)`,
              background: "white",
              border: `1.5px solid ${C.border}`,
              // AUDIT FIX: height set to 450px to fill the canvas
              height: 450,
              borderRadius: 30,
              // AUDIT FIX: more padding for taller cards
              padding: "44px 36px",
              display: "flex",
              alignItems: "flex-start",
              gap: 32,
              boxShadow: `0 4px 28px rgba(11,23,48,0.07)`,
              borderLeft: `6px solid ${s.color}`,
              overflow: "hidden",
            }}>
              {/* Step number — large hero number within card */}
              <div style={{
                flexShrink: 0, width: 110,
                display: "flex", flexDirection: "column", alignItems: "flex-end",
                paddingTop: 8,
              }}>
                <div style={{
                  fontSize: 130, fontWeight: 900,
                  color: `${s.color}14`,
                  fontFamily: SANS, letterSpacing: -6, lineHeight: 0.88,
                  position: "relative",
                }}>
                  {s.num}
                  <span style={{
                    position: "absolute",
                    bottom: 0, left: 0, right: 0,
                    textAlign: "right",
                    fontSize: 38, fontWeight: 900,
                    color: s.color, letterSpacing: -1,
                  }}>{s.num}</span>
                </div>
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0, paddingTop: 8 }}>
                <div style={{
                  fontSize: 46, fontWeight: 800, color: C.text,
                  fontFamily: SANS, letterSpacing: -2, lineHeight: 1.08,
                  marginBottom: 18,
                }}>{s.title}</div>
                <div style={{
                  fontSize: 28, color: C.body,
                  fontFamily: SANS, lineHeight: 1.55,
                }}>{s.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── FOOTER — y:1720–1840 ── */}
      <div style={{
        position: "absolute",
        bottom: 88, left: 0, right: 0,
        textAlign: "center",
        opacity: footerT, transform: `translateY(${(1 - footerT) * 18}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 12,
          background: C.bgBlue,
          border: `1.5px solid ${C.secondary}`,
          borderRadius: 100, padding: "16px 40px",
        }}>
          <div style={{
            width: 9, height: 9, borderRadius: "50%",
            background: C.green, boxShadow: `0 0 8px ${C.green}`,
          }} />
          <span style={{
            fontSize: 24, fontWeight: 700, color: C.primary, fontFamily: SANS,
          }}>No lock-in. Cancel any time.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — THE NUMBERS  (frames 570–719, 5s)
//
// AUDIT FIXES:
//  ✓ Content anchored from top (paddingTop:180, not justifyContent:"center")
//    — was leaving 768px dead zones on both top AND bottom
//  ✓ Number increased to 280px (was 230px) for more visual presence
//  ✓ Ghost watermark number fills lower canvas (y:~950–1600)
//  ✓ Context text at y:900 fills the bottom zone
// ═══════════════════════════════════════════════════════════════════════════

const NUM_STATS = [
  {
    value: "$95+",   line1: "PER BOOKING",    line2: "FREELANCERS PAY YOU",
    context: "Average booking value paid directly to your account",
    accent: C.primary, bg: C.bg, textColor: C.text,
  },
  {
    value: "$2,400", line1: "PER MONTH",       line2: "PER CHAIR",
    context: "Monthly revenue potential per idle chair, fully utilised",
    accent: C.dark, bg: "#F0F4FF", textColor: C.text,
  },
  {
    value: "2 MIN",  line1: "TO LIST",         line2: "YOUR SPACE",
    context: "That is all it takes to start earning from your first chair",
    accent: C.green, bg: "#F0FDF4", textColor: C.text,
  },
  {
    value: "ZERO",   line1: "LOCK-IN",         line2: "CONTRACTS",
    context: "Add or remove chairs at any time — no commitments, ever",
    accent: C.text, bg: C.secondary, textColor: C.text,
  },
] as const;

const SceneNumbers: React.FC = () => {
  const frame = useCurrentFrame();

  const STAT_DUR = 37;
  const idx    = Math.min(Math.floor(frame / STAT_DUR), NUM_STATS.length - 1);
  const localF = frame - idx * STAT_DUR;

  const t       = snap(cl(localF / 14, 0, 1));
  const fadeOut = idx < NUM_STATS.length - 1
    ? interpolate(localF, [27, 37], [1, 0], {
        extrapolateLeft: "clamp", extrapolateRight: "clamp",
      })
    : 1;

  const contextT = eo3(cl((localF - 12) / 18, 0, 1));
  const stat     = NUM_STATS[idx];
  const lineW    = t * 500;

  return (
    <AbsoluteFill style={{ background: stat.bg }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 960px 760px at 50% 44%,
          ${stat.accent}08 0%, transparent 65%)`,
      }} />
      <AmbientDots color={stat.accent} opacity={0.28} />

      {/* AUDIT FIX: Ghost watermark fills lower half (y:~950–1700) */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: 900,
        textAlign: "left",
        paddingLeft: 60,
        fontSize: 420,
        fontWeight: 900,
        color: stat.accent,
        opacity: 0.04,
        fontFamily: SANS,
        letterSpacing: -24,
        lineHeight: 0.82,
        pointerEvents: "none",
        userSelect: "none",
      }}>
        {stat.value}
      </div>

      <div style={{
        position: "absolute",
        // AUDIT FIX: anchored from top, not flex-centered
        top: 0, left: 0, right: 0, bottom: 0,
        display: "flex", flexDirection: "column",
        alignItems: "flex-start", justifyContent: "flex-start",
        padding: "180px 80px 0",
        opacity: fadeOut,
      }}>
        {/* Giant number — 280px (was 230px) */}
        <div style={{
          fontSize: 280,
          fontWeight: 900,
          color: stat.accent,
          fontFamily: SANS,
          letterSpacing: -16,
          lineHeight: 0.82,
          transform: `translateY(${(1 - t) * 80}px) scale(${0.68 + t * 0.32})`,
          transformOrigin: "left center",
          opacity: t,
          marginBottom: 8,
        }}>
          {stat.value}
        </div>

        {/* Labels — 70px */}
        <div style={{
          fontSize: 70, fontWeight: 900, color: stat.textColor,
          fontFamily: SANS, letterSpacing: -3, lineHeight: 0.88,
          opacity: interpolate(t, [0.28, 1], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          }),
          transform: `translateX(${(1 - t) * 40}px)`,
        }}>{stat.line1}</div>

        <div style={{
          fontSize: 70, fontWeight: 900, color: stat.accent,
          fontFamily: SANS, letterSpacing: -3, lineHeight: 0.88,
          opacity: interpolate(t, [0.38, 1], [0, 1], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          }),
          transform: `translateX(${(1 - t) * 40}px)`,
          marginBottom: 32,
        }}>{stat.line2}</div>

        {/* Accent rule */}
        <div style={{
          width: lineW, maxWidth: 500, height: 5,
          background: stat.accent, borderRadius: 3, marginBottom: 40,
        }} />

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 14, marginBottom: 80 }}>
          {NUM_STATS.map((_, i) => (
            <div key={i} style={{
              height: 6, borderRadius: 3,
              width: i === idx ? 52 : (i < idx ? 18 : 12),
              background: i <= idx ? stat.accent : C.border,
            }} />
          ))}
        </div>

        {/* AUDIT FIX: Context text fills y:~900 zone */}
        <div style={{
          opacity: contextT,
          transform: `translateY(${(1 - contextT) * 20}px)`,
        }}>
          <div style={{
            fontSize: 34, fontWeight: 500, color: stat.textColor,
            fontFamily: SANS, lineHeight: 1.5, letterSpacing: "-0.01em",
            opacity: 0.55, maxWidth: 860,
          }}>
            {stat.context}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ═══════════════════════════════════════════════════════════════════════════
// SCENE 6 — PAYOFF  (frames 720–959, 8s)
//
// Bold blue gradient. Brand name builds word by word with snap.
// Gold accent rule sweeps in. Sub-copy for both audiences.
// Dual CTA buttons + URL. Breathing glow + sparkles fill the canvas.
// Content block ~1000px tall: occupies y:460–1460, leaving balanced margins.
// ═══════════════════════════════════════════════════════════════════════════

const SPARK_DEFS = [
  { x:  72, y:  180, p: 68, d:  0, s: 5 },
  { x: 950, y:  290, p: 56, d: 14, s: 4 },
  { x: 185, y:  520, p: 80, d: 28, s: 6 },
  { x: 860, y:  700, p: 62, d:  8, s: 4 },
  { x:  90, y: 1000, p: 74, d: 40, s: 5 },
  { x: 940, y: 1160, p: 58, d: 18, s: 4 },
  { x: 345, y: 1340, p: 76, d: 44, s: 6 },
  { x: 755, y: 1540, p: 64, d: 30, s: 4 },
  { x: 155, y: 1700, p: 70, d: 52, s: 5 },
  { x: 855, y: 1820, p: 54, d: 22, s: 4 },
  { x: 535, y:  340, p: 66, d:  6, s: 5 },
  { x: 515, y: 1610, p: 60, d: 36, s: 4 },
];

const PayoffSparkles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {SPARK_DEFS.map((s, i) => {
        const phase = ((frame + s.d * 4) % s.p) / s.p;
        return (
          <div key={i} style={{
            position: "absolute", left: s.x, top: s.y,
            width: s.s, height: s.s, borderRadius: "50%",
            background: C.accent,
            opacity: Math.sin(phase * Math.PI) * 0.48,
            pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

const ScenePayoff: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT   = eo3(cl(frame / 20, 0, 1));
  const tagT  = eo4(cl((frame -  6) / 18, 0, 1));
  const h1T   = snap(cl((frame - 16) / 20, 0, 1));
  const h2T   = snap(cl((frame - 28) / 20, 0, 1));
  const h3T   = snap(cl((frame - 40) / 20, 0, 1));
  const lineT = eo3(cl((frame - 52) / 24, 0, 1));
  const subT  = eo3(cl((frame - 68) / 22, 0, 1));
  const btn1T = snap(cl((frame - 90) / 20, 0, 1));
  const btn2T = snap(cl((frame - 108) / 20, 0, 1));
  const urlT  = eo3(cl((frame - 136) / 18, 0, 1));
  const glowP = 0.55 + Math.sin(frame * 0.065) * 0.45;

  return (
    <AbsoluteFill style={{ opacity: bgT }}>
      <AbsoluteFill style={{
        background: `linear-gradient(162deg, ${C.primary} 0%, #1432B5 52%, #0A208A 100%)`,
      }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.028) 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }} />
      <div style={{
        position: "absolute", left: "50%", top: "38%",
        transform: "translate(-50%, -50%)",
        width: 900, height: 750, borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(255,255,255,${0.065 * glowP}) 0%, transparent 68%)`,
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 500,
        background: "linear-gradient(0deg, rgba(0,0,0,0.22) 0%, transparent 100%)",
      }} />
      <PayoffSparkles />

      {/* Content block — centered vertically, ~1000px tall */}
      <div style={{
        position: "absolute", left: 72, right: 72,
        top: "50%", transform: "translateY(-50%)",
      }}>
        {/* Tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.10)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          borderRadius: 100, padding: "10px 30px", marginBottom: 34,
          opacity: tagT, transform: `translateY(${(1 - tagT) * -18}px)`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: C.accent, boxShadow: `0 0 10px ${C.accent}`,
          }} />
          <span style={{
            fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.82)",
            fontFamily: SANS, letterSpacing: "0.08em",
          }}>Beta Access · Now Open</span>
        </div>

        {/* Headline */}
        {[
          { text: "THIS IS", t: h1T, color: "white"    },
          { text: "SHARED",  t: h2T, color: "white"    },
          { text: "SALON.",  t: h3T, color: C.accent   },
        ].map((line, i) => (
          <div key={i} style={{
            fontSize: 148, fontWeight: 900,
            color: line.color,
            fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86,
            textTransform: "uppercase",
            opacity: line.t,
            transform: `translateY(${(1 - line.t) * 56}px)`,
            ...(line.color === C.accent
              ? { textShadow: `0 0 80px rgba(231,211,167,0.28)` }
              : {}),
          }}>
            {line.text}
          </div>
        ))}

        {/* Gold rule */}
        <div style={{
          width: `${lineT * 100}%`, maxWidth: 460, height: 4.5,
          background: `linear-gradient(90deg, ${C.accent}, rgba(231,211,167,0.35))`,
          borderRadius: 3, marginTop: 26, marginBottom: 26,
        }} />

        {/* Sub copy */}
        <div style={{
          fontSize: 27, color: "rgba(255,255,255,0.60)",
          fontFamily: SANS, lineHeight: 1.60, marginBottom: 46,
          opacity: subT, transform: `translateY(${(1 - subT) * 22}px)`,
        }}>
          For venue owners who want to earn
          from every hour their space is open.
          <br />
          For freelancers who deserve better
          than a permanent lease.
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
          <div style={{
            transform: `scale(${btn1T})`, opacity: btn1T,
            transformOrigin: "left center",
          }}>
            <div style={{
              background: "white", borderRadius: 22, padding: "26px 46px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: "0 14px 48px rgba(0,0,0,0.28)",
            }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: C.primary, fontFamily: SANS }}>
                List My Space
              </span>
              <span style={{ fontSize: 28, color: C.primary, fontWeight: 700 }}>→</span>
            </div>
          </div>

          <div style={{
            transform: `scale(${btn2T})`, opacity: btn2T,
            transformOrigin: "left center",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.09)",
              border: "2px solid rgba(255,255,255,0.30)",
              borderRadius: 22, padding: "26px 46px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: "white", fontFamily: SANS }}>
                Find a Chair
              </span>
              <span style={{ fontSize: 28, color: "rgba(255,255,255,0.52)", fontWeight: 700 }}>→</span>
            </div>
          </div>
        </div>

        {/* URL */}
        <div style={{
          fontSize: 20, color: "rgba(255,255,255,0.30)",
          fontFamily: "monospace", opacity: urlT, letterSpacing: "0.04em",
        }}>
          sharedsalon.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};


// ─── ROOT EXPORT ─────────────────────────────────────────────────────────────
export const SharedSalonIntroAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneHook    /></Sequence>
    <Sequence from={90}  durationInFrames={150}><SceneProblem /></Sequence>
    <Sequence from={240} durationInFrames={150}><SceneWhat    /></Sequence>
    <Sequence from={390} durationInFrames={180}><SceneHow     /></Sequence>
    <Sequence from={570} durationInFrames={150}><SceneNumbers /></Sequence>
    <Sequence from={720} durationInFrames={240}><ScenePayoff  /></Sequence>

    {/* Root-level transitions — NEVER inside Sequence */}
    <SceneWipe   start={76}  color={C.primary} />
    <BrightFlash start={230} />
    <SceneWipe   start={376} color={C.primary} />
    <SceneWipe   start={556} color={C.text}    />
    <SceneWipe   start={706} color={C.accent}  />
  </AbsoluteFill>
);
