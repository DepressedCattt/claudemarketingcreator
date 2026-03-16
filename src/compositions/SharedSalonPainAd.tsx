/**
 * SharedSalonPainAd — "The Cost of Empty Chairs"
 *
 *  S1  HOOK+PAIN  (  0–159f, 5.3s)  MaskReveal word-by-word. No text overlap.
 *  S2  NUMBERS    (160–299f, 4.7s)  Count-up animations + MaskReveal
 *  S3  PIVOT      (300–379f, 2.6s)  MaskReveal headline
 *  S4  SOLUTION   (380–509f, 4.3s)  MaskReveal beats
 *  S5  CTA        (510–659f, 5.0s)  Gold shimmer on brand. No arrow buttons.
 *
 * Format:   9:16 vertical (1080 × 1920) | 660 frames @ 30fps ≈ 22 seconds
 *
 * TRANSITIONS:
 *   FlashFrame white : 157  (S1→S2)
 *   FlashFrame cream : 297  (S2→S3)
 *
 * CHAIR (root-level, single instance):
 *   0–80f:    Full colour, floating, blue glow
 *   80–160f:  Progressive desaturation
 *   160–200f: Fade out
 *   460–514f: Returns with green glow (booked state)
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SalonChairIllustration } from "../components/salon/SalonChairIllustration";

/* ─── PALETTE ──────────────────────────────────────────────────────────── */
const C = {
  bg:        "#FAF8F5",
  bgCool:    "#F3F3F8",
  primary:   "#2563EB",
  navy:      "#1432B5",
  text:      "#0B1730",
  body:      "#66758F",
  accent:    "#E7D3A7",
  border:    "#D8DEE8",
  red:       "#DC2626",
  green:     "#16A34A",
};

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';

/* ─── EASING ───────────────────────────────────────────────────────────── */
const eo3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ─── MASK REVEAL ──────────────────────────────────────────────────────── */
// The premium reveal: text slides up from behind a hard clip edge.
// No opacity — full colour from the first visible pixel.
const MaskReveal: React.FC<{
  progress: number;
  overshoot?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ progress, overshoot = 110, children, style }) => (
  <div style={{ overflow: "hidden", ...style }}>
    <div style={{ transform: `translateY(${(1 - progress) * overshoot}%)` }}>
      {children}
    </div>
  </div>
);

/* ─── COUNT-UP ─────────────────────────────────────────────────────────── */
const countUp = (frame: number, startFrame: number, dur: number, target: number) =>
  Math.round(eo4(cl((frame - startFrame) / dur, 0, 1)) * target);

const fmtMoney = (n: number) =>
  n >= 1000 ? `$${Math.floor(n / 1000)},${String(n % 1000).padStart(3, "0")}` : `$${n}`;

/* ─── CHAIR LAYOUT ─────────────────────────────────────────────────────── */
const CHAIR_SCALE = 1.35;
const CHAIR_TOP   = 760;

/* ─── AMBIENT DOTS ─────────────────────────────────────────────────────── */
const DOT_DEFS = [
  { bx:  80, by:  200, px: 44, py: 60, pf: 0.016 },
  { bx: 960, by:  320, px: 38, py: 54, pf: 0.013 },
  { bx: 160, by:  860, px: 52, py: 42, pf: 0.018 },
  { bx: 900, by: 1020, px: 32, py: 58, pf: 0.012 },
  { bx: 120, by: 1480, px: 48, py: 46, pf: 0.015 },
  { bx: 940, by: 1620, px: 40, py: 52, pf: 0.014 },
  { bx: 540, by:  100, px: 62, py: 36, pf: 0.011 },
  { bx: 520, by: 1800, px: 36, py: 42, pf: 0.017 },
];

const AmbientDots: React.FC<{ color?: string; opacity?: number }> = ({
  color = C.primary, opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {DOT_DEFS.map((d, i) => {
        const f = d.pf * frame + i * 1.4;
        const x = d.bx + Math.sin(f) * d.px;
        const y = d.by + Math.cos(f * 0.8) * d.py;
        const a = (0.055 + Math.sin(f * 1.6 + i) * 0.028) * opacity;
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

/* ─── FLASH FRAME TRANSITION ───────────────────────────────────────────── */
const FlashFrame: React.FC<{ start: number; hold?: number; color?: string }> = ({
  start, hold = 2, color = "rgba(255,255,255,0.96)",
}) => {
  const frame = useCurrentFrame();
  const lf = frame - start;
  if (lf < 0 || lf > hold + 5) return null;
  const opacity = lf <= 2
    ? interpolate(lf, [0, 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : lf <= hold + 2 ? 1
    : interpolate(lf, [hold + 2, hold + 5], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", inset: 0, zIndex: 80,
      background: color, opacity, pointerEvents: "none",
    }} />
  );
};


/* ═══════════════════════════════════════════════════════════════════════════
   SCENE 1 — HOOK + PAIN  (local frames 0–159)

   Top zone: word-by-word clip-reveals — one word per line, no wrapping.
     "EMPTY" / "CHAIRS" / "aren't just sitting there."

   Bottom zone: three-line staggered reveals
     "THEY'RE" / "COSTING YOUR" / "SALON  MONEY."

   No translateY opacity fades — purely MaskReveal clip transitions.
══════════════════════════════════════════════════════════════════════════════ */
const SceneHookPain: React.FC = () => {
  const frame = useCurrentFrame();

  const bgGlow = eo3(cl(frame / 32, 0, 1));
  const pulse  = 0.55 + Math.sin(frame * 0.06) * 0.45;

  /* Phase 1 — hook reveals */
  const badgeT = eo4(cl(frame / 16, 0, 1));
  const h1T    = eo5(cl((frame -  6) / 14, 0, 1));   // "EMPTY"
  const h2T    = eo5(cl((frame - 14) / 14, 0, 1));   // "CHAIRS"
  const ruleT  = eo3(cl((frame - 24) / 16, 0, 1));
  const h3T    = eo5(cl((frame - 30) / 16, 0, 1));   // subtitle

  /* Phase 2 — pain reveals (frame 80+) */
  const redGlow = eo3(cl((frame - 80) / 60, 0, 1));
  const p1T     = eo5(cl((frame -  86) / 14, 0, 1)); // "THEY'RE"
  const p2T     = eo5(cl((frame - 100) / 14, 0, 1)); // "COSTING YOUR"
  const p3T     = eo5(cl((frame - 114) / 14, 0, 1)); // "SALON  MONEY."

  /* URL pill — fills the dead zone below pain text */
  const urlT = eo3(cl((frame - 118) / 16, 0, 1));

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: C.bg }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${C.border}55 1px, transparent 1px)`,
        backgroundSize: "52px 52px", opacity: 0.50,
      }} />

      {/* Blue glow top-right */}
      <div style={{
        position: "absolute", top: -140, right: -120,
        width: 760, height: 760, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,${0.058 * bgGlow}), transparent 60%)`,
        pointerEvents: "none",
      }} />

      {/* Gold glow bottom-left — fades when pain phase begins */}
      <div style={{
        position: "absolute", bottom: -160, left: -80,
        width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(231,211,167,${0.24 * bgGlow * Math.max(0, 1 - redGlow)}), transparent 60%)`,
        pointerEvents: "none",
      }} />

      {/* Red tension glow — builds from frame 80 */}
      <div style={{
        position: "absolute", bottom: -200, left: "50%", transform: "translateX(-50%)",
        width: 900, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(220,38,38,${0.06 * pulse * redGlow}), transparent 60%)`,
        pointerEvents: "none",
      }} />

      <AmbientDots color={C.primary} opacity={0.46} />

      {/* ── TOP ZONE ── */}

      {/* Badge — disappears when pain lands */}
      <div style={{
        position: "absolute", top: 88, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeT * Math.max(0, 1 - redGlow * 1.6),
        transform: `translateY(${(1 - badgeT) * -14}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(37,99,235,0.08)",
          border: "1.5px solid rgba(37,99,235,0.20)",
          borderRadius: 100, padding: "10px 32px",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary }} />
          <span style={{
            fontSize: 17, fontWeight: 700, color: C.primary,
            fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase",
          }}>For Salon Owners</span>
        </div>
      </div>

      {/* "EMPTY" — clip reveal */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 182, textAlign: "center", padding: "0 72px" }}>
        <MaskReveal progress={h1T}>
          <div style={{
            fontSize: 170, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -9, lineHeight: 1.0,
            textTransform: "uppercase",
          }}>EMPTY</div>
        </MaskReveal>
      </div>

      {/* "CHAIRS" — clip reveal, staggered */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 352, textAlign: "center", padding: "0 72px" }}>
        <MaskReveal progress={h2T}>
          <div style={{
            fontSize: 170, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -9, lineHeight: 1.0,
            textTransform: "uppercase",
          }}>CHAIRS</div>
        </MaskReveal>
      </div>

      {/* Animated rule */}
      <div style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        top: 532,
        width: `${ruleT * 310}px`, height: 3,
        background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
        borderRadius: 2,
      }} />

      {/* "aren't just sitting there." */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 554, textAlign: "center", padding: "0 80px" }}>
        <MaskReveal progress={h3T}>
          <div style={{
            fontSize: 44, fontWeight: 600, color: C.body,
            fontFamily: SANS, letterSpacing: -1.2, lineHeight: 1.3,
          }}>aren&apos;t just sitting there.</div>
        </MaskReveal>
      </div>

      {/* ── BOTTOM ZONE — pain text ── */}

      {/* "THEY'RE" */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1316, textAlign: "center", padding: "0 72px" }}>
        <MaskReveal progress={p1T}>
          <div style={{
            fontSize: 118, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -6, lineHeight: 1.0,
            textTransform: "uppercase",
          }}>THEY&apos;RE</div>
        </MaskReveal>
      </div>

      {/* "COSTING YOUR" */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1434, textAlign: "center", padding: "0 72px" }}>
        <MaskReveal progress={p2T}>
          <div style={{
            fontSize: 118, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -6, lineHeight: 1.0,
            textTransform: "uppercase",
          }}>COSTING YOUR</div>
        </MaskReveal>
      </div>

      {/* "SALON  MONEY." — "MONEY." highlighted red */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1552, textAlign: "center", padding: "0 72px" }}>
        <MaskReveal progress={p3T}>
          <div style={{
            fontSize: 118, fontWeight: 900,
            fontFamily: SANS, letterSpacing: -6, lineHeight: 1.0,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}>
            <span style={{ color: C.text }}>SALON </span>
            <span style={{ color: C.red }}>MONEY.</span>
          </div>
        </MaskReveal>
      </div>

      {/* URL pill — anchors the bottom, softens with the red glow */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: urlT * Math.max(0, 1 - redGlow * 0.5),
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(11,23,48,0.05)",
          border: "1px solid rgba(11,23,48,0.10)",
          borderRadius: 100, padding: "10px 28px",
        }}>
          <span style={{
            fontSize: 18, fontWeight: 500, color: C.body,
            fontFamily: "monospace", letterSpacing: "0.04em",
          }}>sharedsalon.com.au</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};


/* ═══════════════════════════════════════════════════════════════════════════
   SCENE 2 — NUMBERS  (local frames 0–139)
   Count-up animations for $80, $240, $12,480.
   MaskReveal for all text. Spring slam on the big number.
══════════════════════════════════════════════════════════════════════════════ */
const MONEY_DOTS = [
  { x: 110, speed: 11, phase:  0, size: 5 },
  { x: 260, speed: 14, phase: 22, size: 4 },
  { x: 430, speed: 12, phase: 45, size: 6 },
  { x: 590, speed: 13, phase: 11, size: 4 },
  { x: 740, speed: 11, phase: 33, size: 5 },
  { x: 900, speed: 15, phase: 58, size: 4 },
  { x: 195, speed: 13, phase: 70, size: 5 },
  { x: 840, speed: 12, phase: 15, size: 4 },
  { x: 500, speed: 14, phase: 38, size: 5 },
  { x: 670, speed: 11, phase: 82, size: 4 },
];

const FloatingMoneyDots: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {MONEY_DOTS.map((d, i) => {
        const y = 1920 - ((frame * d.speed + d.phase * d.speed) % 1920);
        const a = (0.06 + Math.sin(frame * 0.08 + i * 1.3) * 0.03) * opacity;
        return (
          <div key={i} style={{
            position: "absolute", left: d.x, top: y,
            width: d.size, height: d.size, borderRadius: "50%",
            background: C.red, opacity: a, pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

const SceneNumbers: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgT    = eo3(cl(frame / 16, 0, 1));
  const pulse  = 0.55 + Math.sin(frame * 0.07) * 0.45;
  const ghostT = eo3(cl((frame - 20) / 60, 0, 1));

  /* Row 1 — $80 */
  const r1T      = eo5(cl((frame - 6) / 14, 0, 1));
  const r1LabelT = eo3(cl((frame - 16) / 14, 0, 1));
  const val1     = countUp(frame, 6, 22, 80);

  const div1W    = eo3(cl((frame - 24) / 20, 0, 1));

  /* Row 2 — $240 */
  const r2T      = eo5(cl((frame - 40) / 14, 0, 1));
  const r2LabelT = eo3(cl((frame - 50) / 14, 0, 1));
  const val2     = countUp(frame, 40, 24, 240);

  const div2W    = eo3(cl((frame - 58) / 20, 0, 1));

  /* Row 3 — $12,480 — spring slam + count-up */
  const slamY     = spring({ frame: frame - 78, fps, config: { damping: 9, stiffness: 200, mass: 0.75 }, from: 70, to: 0 });
  const slamScale = spring({ frame: frame - 78, fps, config: { damping: 10, stiffness: 180, mass: 0.8 }, from: 1.05, to: 1.0 });
  const slamOp    = eo4(cl((frame - 78) / 12, 0, 1));
  const slamLabelT = eo3(cl((frame - 90) / 14, 0, 1));
  const val3      = countUp(frame, 78, 30, 12480);

  const summaryT = eo4(cl((frame - 112) / 20, 0, 1));

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: C.bgCool, opacity: bgT }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${C.border}42 1px, transparent 1px)`,
        backgroundSize: "52px 52px", opacity: 0.36 * bgT,
      }} />

      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(220,38,38,${0.042 * pulse * bgT}), transparent 62%)`,
        pointerEvents: "none",
      }} />

      {/* Ghost $12,480 watermark */}
      <div style={{
        position: "absolute", left: "50%",
        top: 1100, transform: "translateX(-50%)",
        fontSize: 360, fontWeight: 900, color: C.red,
        fontFamily: SANS, letterSpacing: -20, lineHeight: 1,
        opacity: ghostT * 0.045, pointerEvents: "none", userSelect: "none",
        whiteSpace: "nowrap",
      }}>$12,480</div>

      <FloatingMoneyDots opacity={bgT * 0.9} />

      {/* ── ROW 1: $80 ── */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 188, textAlign: "center", padding: "0 80px" }}>
        <MaskReveal progress={r1T}>
          <div style={{
            fontSize: 148, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -8, lineHeight: 1.0,
          }}>{fmtMoney(val1)}</div>
        </MaskReveal>
        <MaskReveal progress={r1LabelT} style={{ marginTop: 8 }}>
          <div style={{
            fontSize: 26, fontWeight: 500, color: C.body,
            fontFamily: SANS, letterSpacing: 2.5, textTransform: "uppercase",
          }}>a booking, uncollected</div>
        </MaskReveal>
      </div>

      {/* Divider 1 */}
      <div style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        top: 448, width: `${div1W * 340}px`, height: 1,
        background: "rgba(11,23,48,0.08)", borderRadius: 1,
      }} />

      {/* ── ROW 2: $240 ── */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", padding: "0 80px" }}>
        <MaskReveal progress={r2T}>
          <div style={{
            fontSize: 186, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -10, lineHeight: 1.0,
          }}>{fmtMoney(val2)}</div>
        </MaskReveal>
        <MaskReveal progress={r2LabelT} style={{ marginTop: 10 }}>
          <div style={{
            fontSize: 32, fontWeight: 500, color: C.body,
            fontFamily: SANS, letterSpacing: 2.5, textTransform: "uppercase",
          }}>a week, walking out</div>
        </MaskReveal>
      </div>

      {/* Divider 2 */}
      <div style={{
        position: "absolute", left: "50%", transform: "translateX(-50%)",
        top: 1060, width: `${div2W * 390}px`, height: 1,
        background: "rgba(11,23,48,0.08)", borderRadius: 1,
      }} />

      {/* ── ROW 3: $12,480 — spring slam ── */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 1090,
        textAlign: "center", padding: "0 80px",
        opacity: slamOp,
        transform: `translateY(${slamY}px) scale(${slamScale})`,
        transformOrigin: "center top",
      }}>
        <div style={{
          fontSize: 218, fontWeight: 900, color: C.red,
          fontFamily: SANS, letterSpacing: -12, lineHeight: 0.88,
        }}>{fmtMoney(val3)}</div>
        <div style={{
          fontSize: 46, fontWeight: 700, color: C.red,
          fontFamily: SANS, letterSpacing: 1.5, textTransform: "uppercase",
          marginTop: 12, opacity: 0.82 * slamLabelT,
          transform: `translateY(${(1 - slamLabelT) * 12}px)`,
        }}>a year. Per chair.</div>
      </div>

      {/* Summary badge */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        textAlign: "center", padding: "0 80px",
        opacity: summaryT, transform: `translateY(${(1 - summaryT) * 16}px)`,
      }}>
        <div style={{
          display: "inline-block",
          background: "rgba(220,38,38,0.07)",
          border: "1px solid rgba(220,38,38,0.18)",
          borderRadius: 100, padding: "14px 40px",
        }}>
          <span style={{
            fontSize: 24, fontWeight: 700, color: "rgba(220,38,38,0.75)", fontFamily: SANS,
          }}>Lost. Every year. From one idle chair.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};


/* ═══════════════════════════════════════════════════════════════════════════
   SCENE 3 — PIVOT  (local frames 0–79)
══════════════════════════════════════════════════════════════════════════════ */
const ScenePivot: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT    = eo3(cl(frame / 18, 0, 1));
  const bgGlow = eo3(cl(frame / 28, 0, 1));
  const ghostT = eo3(cl((frame - 4) / 24, 0, 1));
  const badgeT = eo4(cl((frame - 4) / 14, 0, 1));
  const line1T = eo5(cl((frame - 12) / 18, 0, 1));
  const line2T = eo5(cl((frame - 22) / 18, 0, 1));
  const card1T = eo4(cl((frame - 34) / 22, 0, 1));
  const card2T = eo4(cl((frame - 46) / 22, 0, 1));

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: C.bg, opacity: bgT }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${C.border}55 1px, transparent 1px)`,
        backgroundSize: "52px 52px", opacity: 0.46 * bgT,
      }} />

      <div style={{
        position: "absolute", top: -160, left: "50%", transform: "translateX(-50%)",
        width: 800, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(231,211,167,${0.20 * bgGlow}), transparent 60%)`,
        pointerEvents: "none",
      }} />

      {/* "MEANWHILE" ghost watermark */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 80, textAlign: "center",
        fontSize: 168, fontWeight: 900, color: C.text,
        fontFamily: SANS, letterSpacing: -8, lineHeight: 0.88,
        textTransform: "uppercase",
        opacity: ghostT * 0.06, pointerEvents: "none", userSelect: "none",
        whiteSpace: "nowrap",
      }}>MEANWHILE</div>

      <AmbientDots color={C.primary} opacity={0.40 * bgT} />

      {/* Badge */}
      <div style={{
        position: "absolute", top: 88, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeT, transform: `translateY(${(1 - badgeT) * -14}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(37,99,235,0.07)",
          border: "1.5px solid rgba(37,99,235,0.18)",
          borderRadius: 100, padding: "10px 32px",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary }} />
          <span style={{
            fontSize: 17, fontWeight: 700, color: C.primary,
            fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase",
          }}>The other side</span>
        </div>
      </div>

      {/* Centred headline — MaskReveal lines */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: "50%", transform: "translateY(-54%)",
        textAlign: "center", padding: "0 72px",
      }}>
        <MaskReveal progress={line1T}>
          <div style={{
            fontSize: 132, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -6.5, lineHeight: 1.0,
            textTransform: "uppercase",
          }}>Meanwhile,</div>
        </MaskReveal>
        <MaskReveal progress={line2T} style={{ marginTop: 12 }}>
          <div style={{
            fontSize: 88, fontWeight: 800, color: C.primary,
            fontFamily: SANS, letterSpacing: -4, lineHeight: 1.1,
          }}>freelancers<br />need space.</div>
        </MaskReveal>
      </div>

      {/* Supply / Demand cards */}
      <div style={{
        position: "absolute", left: 60, right: 60, top: 1220,
        display: "flex", gap: 20,
      }}>
        <div style={{
          flex: 1, textAlign: "center",
          background: "rgba(220,38,38,0.05)",
          border: "1.5px solid rgba(220,38,38,0.16)",
          borderRadius: 22, padding: "28px 20px",
          opacity: card1T, transform: `translateY(${(1 - card1T) * 28}px)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(220,38,38,0.65)", fontFamily: SANS, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>Supply</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: -2, lineHeight: 1, marginBottom: 6 }}>Empty<br />chairs</div>
          <div style={{ fontSize: 16, color: C.body, fontFamily: SANS, lineHeight: 1.4 }}>sitting idle across the country</div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: 44, opacity: Math.min(card1T, card2T) }}>
          <div style={{ width: 2, height: 60, background: `linear-gradient(180deg, transparent, ${C.border}, transparent)` }} />
        </div>

        <div style={{
          flex: 1, textAlign: "center",
          background: "rgba(37,99,235,0.05)",
          border: "1.5px solid rgba(37,99,235,0.16)",
          borderRadius: 22, padding: "28px 20px",
          opacity: card2T, transform: `translateY(${(1 - card2T) * 28}px)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(37,99,235,0.65)", fontFamily: SANS, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 }}>Demand</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: -2, lineHeight: 1, marginBottom: 6 }}>Active<br />freelancers</div>
          <div style={{ fontSize: 16, color: C.body, fontFamily: SANS, lineHeight: 1.4 }}>searching for a place to work</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};


/* ═══════════════════════════════════════════════════════════════════════════
   SCENE 4 — SOLUTION  (local frames 0–129)
   Beat 1 (0–74f):   "That's where / Shared Salon / comes in."
   Beat 2 (76–129f): "Helping salons / fill spare chairs" + booking badge
══════════════════════════════════════════════════════════════════════════════ */
const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT    = eo3(cl(frame / 16, 0, 1));
  const bgGlow = eo3(cl(frame / 24, 0, 1));

  /* Beat 1 */
  const b1badgeT = eo4(cl(frame / 14, 0, 1));
  const b1line1T = eo5(cl((frame - 10) / 16, 0, 1));
  const b1line2T = eo5(cl((frame - 20) / 16, 0, 1));
  const b1line3T = eo5(cl((frame - 30) / 16, 0, 1));
  const b1Out    = interpolate(frame, [60, 74], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  /* Beat 2 */
  const b2T        = eo4(cl((frame - 76) / 18, 0, 1));
  const b2line1T   = eo5(cl((frame - 86) / 18, 0, 1));
  const b2line2T   = eo5(cl((frame - 98) / 18, 0, 1));
  const b2ruleT    = eo3(cl((frame - 110) / 16, 0, 1));
  const badgeCardT = eo5(cl((frame - 96) / 26, 0, 1));

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ background: C.bg, opacity: bgT }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, ${C.border}55 1px, transparent 1px)`,
        backgroundSize: "52px 52px", opacity: 0.46 * bgT,
      }} />
      <div style={{
        position: "absolute", top: "28%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 820, height: 680, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,${0.050 * bgGlow}), transparent 60%)`,
        pointerEvents: "none",
      }} />
      <AmbientDots color={C.primary} opacity={0.40 * bgT} />

      {/* Beat 1 */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: "50%", transform: "translateY(-50%)",
        textAlign: "center", padding: "0 72px",
        opacity: b1Out,
        pointerEvents: b1Out < 0.05 ? "none" : "auto",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(37,99,235,0.08)",
          border: "1.5px solid rgba(37,99,235,0.20)",
          borderRadius: 100, padding: "10px 32px", marginBottom: 28,
          opacity: b1badgeT, transform: `translateY(${(1 - b1badgeT) * -14}px)`,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: C.primary, fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase" }}>The solution</span>
        </div>

        <MaskReveal progress={b1line1T} style={{ marginBottom: 4 }}>
          <div style={{
            fontSize: 90, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -4.5, lineHeight: 0.96,
            textTransform: "uppercase",
          }}>That&apos;s where</div>
        </MaskReveal>

        <MaskReveal progress={b1line2T} style={{ marginBottom: 4 }}>
          <div style={{
            fontSize: 90, fontWeight: 900, color: C.primary,
            fontFamily: SANS, letterSpacing: -4.5, lineHeight: 0.96,
            textTransform: "uppercase",
          }}>Shared Salon</div>
        </MaskReveal>

        <MaskReveal progress={b1line3T}>
          <div style={{
            fontSize: 90, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -4.5, lineHeight: 0.96,
            textTransform: "uppercase",
          }}>comes in.</div>
        </MaskReveal>
      </div>

      {/* Beat 2 */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 88,
        textAlign: "center", padding: "0 72px",
        opacity: b2T, transform: `translateY(${(1 - b2T) * 22}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(22,163,74,0.08)",
          border: "1.5px solid rgba(22,163,74,0.22)",
          borderRadius: 100, padding: "10px 32px", marginBottom: 24,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: C.green, fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase" }}>For salon owners</span>
        </div>

        <MaskReveal progress={b2line1T}>
          <div style={{
            fontSize: 100, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -5, lineHeight: 1.0,
            textTransform: "uppercase",
          }}>Helping salons</div>
        </MaskReveal>

        <MaskReveal progress={b2line2T} style={{ marginBottom: 0 }}>
          <div style={{
            fontSize: 100, fontWeight: 900, color: C.primary,
            fontFamily: SANS, letterSpacing: -4, lineHeight: 0.96,
          }}>fill spare chairs.</div>
        </MaskReveal>

        <div style={{
          width: `${b2ruleT * 260}px`, height: 4,
          background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
          borderRadius: 2, margin: "20px auto 0",
        }} />
      </div>

      {/* Booking badge */}
      <div style={{
        position: "absolute", left: "50%", top: 840,
        transform: `translateX(55px) translateY(${(1 - badgeCardT) * 24}px)`,
        opacity: badgeCardT, zIndex: 10,
      }}>
        <div style={{
          background: "white", border: `1.5px solid ${C.border}`,
          borderRadius: 20, padding: "20px 28px",
          boxShadow: "0 8px 32px rgba(37,99,235,0.12), 0 2px 8px rgba(11,23,48,0.07)",
          display: "flex", alignItems: "center", gap: 16, minWidth: 290,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: `${C.green}15`, border: `2px solid ${C.green}28`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke={C.green} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, fontFamily: SANS, letterSpacing: 2, textTransform: "uppercase", marginBottom: 2 }}>Booked</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.text, fontFamily: SANS, letterSpacing: -0.5 }}>Chair 2 · Mon 10am</div>
            <div style={{ fontSize: 16, color: C.body, fontFamily: SANS }}>Emma T. · $95</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};


/* ═══════════════════════════════════════════════════════════════════════════
   SCENE 5 — CTA  (local frames 0–149)
   Gold shimmer sweep on SHARED / SALON brand name.
   Buttons: no arrow icons — clean centred text.
   MaskReveal for freelancer lines and CTA label.
══════════════════════════════════════════════════════════════════════════════ */
const SPARK_DEFS = [
  { x:  72, y:  160, p: 68, d:  0, s: 5 }, { x: 960, y:  280, p: 56, d: 14, s: 4 },
  { x: 200, y:  560, p: 80, d: 28, s: 6 }, { x: 840, y:  740, p: 62, d:  8, s: 4 },
  { x:  80, y: 1080, p: 74, d: 40, s: 5 }, { x: 960, y: 1200, p: 58, d: 18, s: 4 },
  { x: 360, y: 1380, p: 76, d: 44, s: 6 }, { x: 740, y: 1560, p: 64, d: 30, s: 4 },
  { x: 140, y: 1720, p: 70, d: 52, s: 5 }, { x: 870, y: 1840, p: 54, d: 22, s: 4 },
  { x: 540, y:  360, p: 66, d:  6, s: 5 }, { x: 510, y: 1640, p: 60, d: 36, s: 4 },
];

const CTASparkles: React.FC = () => {
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

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgT   = eo4(cl(frame / 22, 0, 1));
  const glowP = 0.55 + Math.sin(frame * 0.065) * 0.45;

  const tagT        = eo4(cl((frame -  4) / 16, 0, 1));
  const freelance1T = eo5(cl((frame - 14) / 20, 0, 1));
  const freelance2T = eo5(cl((frame - 26) / 20, 0, 1));
  const ruleT       = eo3(cl((frame - 40) / 18, 0, 1));

  const brandY1  = spring({ frame: frame - 56, fps, config: { damping: 11, stiffness: 160, mass: 0.8 }, from: 50, to: 0 });
  const brandOp1 = eo4(cl((frame - 56) / 14, 0, 1));
  const brandY2  = spring({ frame: frame - 70, fps, config: { damping: 11, stiffness: 160, mass: 0.8 }, from: 50, to: 0 });
  const brandOp2 = eo4(cl((frame - 70) / 14, 0, 1));

  /* Gold shimmer sweep — travels left-to-right across the brand name */
  const shimmerPos = interpolate(
    eo4(cl((frame - 76) / 28, 0, 1)),
    [0, 1], [-28, 132]
  );

  const ctaLabelT = eo3(cl((frame - 94) / 16, 0, 1));
  const btn1T     = eo5(cl((frame - 106) / 20, 0, 1));
  const btn2T     = eo5(cl((frame - 120) / 20, 0, 1));
  const urlT      = eo3(cl((frame - 138) / 16, 0, 1));

  /* Shared gradient helper */
  const shimmerGradWhite = `linear-gradient(108deg,
    rgba(255,255,255,0.86) ${shimmerPos - 28}%,
    rgba(255,255,255,1.00) ${shimmerPos -  8}%,
    rgba(255,226,128,0.96) ${shimmerPos     }%,
    rgba(255,255,255,1.00) ${shimmerPos +  8}%,
    rgba(255,255,255,0.86) ${shimmerPos + 28}%
  )`;
  const shimmerGradGold = `linear-gradient(108deg,
    #C9A96E ${shimmerPos - 24}%,
    ${C.accent} ${shimmerPos -  6}%,
    #FFF4C2 ${shimmerPos + 10}%,
    ${C.accent} ${shimmerPos + 24}%,
    #C9A96E ${shimmerPos + 40}%
  )`;

  return (
    <AbsoluteFill style={{ opacity: bgT }}>
      <AbsoluteFill style={{
        background: `linear-gradient(162deg, #2563EB 0%, #1432B5 52%, #0A208A 100%)`,
      }} />
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.024) 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }} />
      <div style={{
        position: "absolute", left: "50%", top: "42%",
        transform: "translate(-50%, -50%)",
        width: 820, height: 700, borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(255,255,255,${0.058 * glowP}) 0%, transparent 68%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 460,
        background: "linear-gradient(0deg, rgba(0,0,0,0.20) 0%, transparent 100%)",
      }} />
      <CTASparkles />

      <div style={{ position: "absolute", left: 72, right: 72, top: "50%", transform: "translateY(-50%)" }}>

        {/* Tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.10)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          borderRadius: 100, padding: "10px 30px", marginBottom: 24,
          opacity: tagT, transform: `translateY(${(1 - tagT) * -14}px)`,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.accent, boxShadow: `0 0 10px ${C.accent}` }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.82)", fontFamily: SANS, letterSpacing: "0.08em" }}>
            And for freelancers
          </span>
        </div>

        {/* Freelancer line — two-line MaskReveal */}
        <MaskReveal progress={freelance1T}>
          <div style={{
            fontSize: 66, fontWeight: 800, color: "rgba(255,255,255,0.92)",
            fontFamily: SANS, letterSpacing: -2.6, lineHeight: 1.1,
          }}>Helping freelancers</div>
        </MaskReveal>
        <MaskReveal progress={freelance2T} style={{ marginBottom: 4 }}>
          <div style={{
            fontSize: 66, fontWeight: 800, color: "rgba(255,255,255,0.92)",
            fontFamily: SANS, letterSpacing: -2.6, lineHeight: 1.1,
          }}>find the space they need.</div>
        </MaskReveal>

        {/* Rule */}
        <div style={{
          width: `${ruleT * 100}%`, maxWidth: 360, height: 4,
          background: `linear-gradient(90deg, ${C.accent}, rgba(231,211,167,0.2))`,
          borderRadius: 3, marginTop: 18, marginBottom: 20,
        }} />

        {/* Brand slam — "SHARED" with gold shimmer */}
        <div style={{ opacity: brandOp1, transform: `translateY(${brandY1}px)` }}>
          <div style={{
            fontSize: 148, fontWeight: 900,
            fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86, textTransform: "uppercase",
            background: shimmerGradWhite,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          } as React.CSSProperties}>SHARED</div>
        </div>

        {/* "SALON." — gold with shimmer */}
        <div style={{ opacity: brandOp2, transform: `translateY(${brandY2}px)`, marginBottom: 22 }}>
          <div style={{
            fontSize: 148, fontWeight: 900,
            fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86, textTransform: "uppercase",
            background: shimmerGradGold,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          } as React.CSSProperties}>SALON.</div>
        </div>

        {/* CTA label */}
        <MaskReveal progress={ctaLabelT} style={{ marginBottom: 14 }}>
          <div style={{
            fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.48)",
            fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase",
          }}>Join the beta</div>
        </MaskReveal>

        {/* Buttons — clean, no arrows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
          <div style={{
            opacity: btn1T,
            transform: `translateY(${(1 - btn1T) * 22}px) scale(${0.94 + btn1T * 0.06})`,
            transformOrigin: "center center",
          }}>
            <div style={{
              background: "white", borderRadius: 22, padding: "28px 46px",
              display: "flex", justifyContent: "center", alignItems: "center",
              boxShadow: "0 14px 44px rgba(0,0,0,0.26)",
            }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: C.primary, fontFamily: SANS }}>List My Space</span>
            </div>
          </div>
          <div style={{
            opacity: btn2T,
            transform: `translateY(${(1 - btn2T) * 22}px) scale(${0.94 + btn2T * 0.06})`,
            transformOrigin: "center center",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.09)",
              border: "2px solid rgba(255,255,255,0.28)",
              borderRadius: 22, padding: "28px 46px",
              display: "flex", justifyContent: "center", alignItems: "center",
            }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: "white", fontFamily: SANS }}>Find a Chair</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 20, color: "rgba(255,255,255,0.28)", fontFamily: "monospace", letterSpacing: "0.04em", opacity: urlT }}>
          sharedsalon.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};


/* ═══════════════════════════════════════════════════════════════════════════
   ROOT COMPOSITION — 660 frames (22 seconds)
══════════════════════════════════════════════════════════════════════════════ */
export const SharedSalonPainAd: React.FC = () => {
  const frame = useCurrentFrame();

  const chairOpacity = (() => {
    if (frame <= 160) return 1;
    if (frame <= 200) return interpolate(frame, [160, 200], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (frame < 460) return 0;
    if (frame <= 478) return interpolate(frame, [460, 478], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    if (frame <= 502) return 1;
    if (frame <= 514) return interpolate(frame, [502, 514], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return 0;
  })();

  const desat       = cl((frame - 80) / 80, 0, 1);
  const saturate    = interpolate(desat, [0, 1], [1, 0.32]);
  const bright      = interpolate(desat, [0, 1], [1, 0.66]);
  const isActive    = frame >= 460 && frame <= 514;
  const chairFilter = isActive ? "none" : `saturate(${saturate}) brightness(${bright})`;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>

      {/* ── SCENES ── */}
      <Sequence from={0}   durationInFrames={160}><SceneHookPain  /></Sequence>
      <Sequence from={160} durationInFrames={140}><SceneNumbers   /></Sequence>
      <Sequence from={300} durationInFrames={80}> <ScenePivot     /></Sequence>
      <Sequence from={380} durationInFrames={130}><SceneSolution  /></Sequence>
      <Sequence from={510} durationInFrames={150}><SceneCTA       /></Sequence>

      {/* ── CHAIR ── */}
      <div style={{
        position: "absolute", left: "50%", top: CHAIR_TOP,
        transform: "translateX(-50%)",
        opacity: chairOpacity, filter: chairFilter,
        pointerEvents: "none", zIndex: 5,
      }}>
        <SalonChairIllustration
          scale={CHAIR_SCALE}
          startFrame={0}
          showGlow={isActive}
          glowColor={isActive ? C.green : C.primary}
          muted={false}
          outlineMode={false}
          float={frame < 160 || isActive}
          instanceId="pain-v3"
        />
      </div>

      {/* ── TRANSITIONS ── */}
      <FlashFrame start={157} hold={2} color="rgba(255,255,255,0.97)" />
      <FlashFrame start={297} hold={3} color="rgba(252,249,245,0.98)" />

    </AbsoluteFill>
  );
};
