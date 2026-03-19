/**
 * SharedSalonFinalAd — "The Platform" (v3 — seamless element-driven transitions)
 *
 * Transition philosophy:
 *   Every cut uses an on-screen element to motivate the change.
 *   No opacity fades to black. Each scene "delivers" the next.
 *
 *   S1→S2  Phone zoom-wipe: phone grows to fill canvas → S2 opens from that zoom
 *   S2→S3  Blue canvas wipe: collapse orb expands to C.primary → S3 resolves blue
 *   S3→S4  White flash wipe: cards sweep right → white → S4 panel enters
 *   S4→S5  Dark fill wipe: venue panel fills C.dark → S5 already dark
 *   S5→S6  Overexposure flash: success glow → white → S6 cream resolves
 *   S6→S7  Blue hero wipe: revenue number motivates blue fill → S7 brand through blue
 *
 * Format:  9:16 portrait (1080 × 1920)
 * Duration: 780 frames @ 30fps = 26 seconds (13 bars @ 120 BPM)
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
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

// ─── 120 BPM rhythm grid ──────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const BAR = 60; // 1 bar = 2s = 60f @ 30fps

// ─── Scene boundaries ─────────────────────────────────────────────────────────
const S1    = 0;
const S2    = 120;
const S3    = 240;
const S4    = 360;
const S5    = 480;
const S6    = 600;
const S7    = 720;
const TOTAL = 780;

// ─── Wipe duration ────────────────────────────────────────────────────────────
const WD = 22;

// ─── Easing helpers ───────────────────────────────────────────────────────────
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const eo3 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - cl(t, 0, 1), 5);
const eio3 = (t: number) => {
  const c = cl(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
const pr  = (f: number, s: number, d: number) => cl((f - s) / d, 0, 1);

// ─── Canvas wipe helpers ──────────────────────────────────────────────────────
// WipeIn: colored overlay at frame 0 that clears over WD frames (scene receives wipe)
const WipeIn: React.FC<{ color: string; dur?: number }> = ({ color, dur = WD }) => {
  const frame = useCurrentFrame();
  const op = 1 - eo4(pr(frame, 0, dur));
  if (op <= 0.004) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, background: color,
      opacity: op, pointerEvents: "none", zIndex: 1000,
    }} />
  );
};

// WipeOut: fills to color starting at `offset` over `dur` frames (scene sends wipe)
const WipeOut: React.FC<{ color: string; offset?: number; dur?: number }> = ({
  color, offset = 98, dur = WD,
}) => {
  const frame = useCurrentFrame();
  const op = eo4(pr(frame, offset, dur));
  if (op <= 0.004) return null;
  return (
    <div style={{
      position: "absolute", inset: 0, background: color,
      opacity: op, pointerEvents: "none", zIndex: 1000,
    }} />
  );
};

// ─── Camera motion wrapper ────────────────────────────────────────────────────
interface CameraWrapProps {
  frame: number; dur: number;
  zoom?: number; rollRange?: [number, number];
  panX?: [number, number]; panY?: [number, number];
  children: React.ReactNode;
}
const CameraWrap: React.FC<CameraWrapProps> = ({
  frame, dur, zoom = 3, rollRange = [-0.3, 0.3],
  panX = [8, -8], panY = [4, -4], children,
}) => {
  const t = frame / dur;
  return (
    <div style={{
      position: "absolute", inset: 0,
      transform: [
        `scale(${1 + (t * zoom) / 100})`,
        `rotateZ(${rollRange[0] + t * (rollRange[1] - rollRange[0])}deg)`,
        `translateX(${panX[0] + t * (panX[1] - panX[0])}px)`,
        `translateY(${panY[0] + t * (panY[1] - panY[0])}px)`,
      ].join(" "),
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
  { x: 120, y:  990, p: 76, d: 40, s: 5 }, { x: 940, y: 1100, p: 62, d: 18, s: 4 },
  { x: 350, y: 1300, p: 80, d: 44, s: 6 }, { x: 760, y: 1520, p: 68, d: 30, s: 4 },
  { x: 160, y: 1700, p: 74, d: 52, s: 5 }, { x: 870, y: 1800, p: 58, d: 22, s: 4 },
];
const Sparkles: React.FC<{ color?: string; count?: number; opacity?: number }> = ({
  color = C.accent, count = 10, opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {SPARKS.slice(0, count).map((s, i) => {
        const phase = ((frame + s.d * 4) % s.p) / s.p;
        return (
          <div key={i} style={{
            position: "absolute", left: s.x, top: s.y,
            width: s.s, height: s.s, borderRadius: "50%",
            background: color,
            opacity: Math.sin(phase * Math.PI) * 0.55 * opacity,
            pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHONE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════
const PH_W  = 412;
const PH_H  = 870;
const PH_CR = 52;
const SC_LR = 10;
const SC_T  = 16;
const SC_B  = 12;
const SC_W  = PH_W - SC_LR * 2;
const SC_H  = PH_H - SC_T - SC_B;

const AppScreen: React.FC<{ scrollY?: number }> = ({ scrollY = 0 }) => (
  <div style={{ width: SC_W, height: SC_H, background: C.bg, fontFamily: SANS, position: "relative", overflow: "hidden" }}>
    <div style={{ transform: `translateY(${-scrollY}px)`, position: "relative" }}>
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
        <div style={{ flex: 1, background: C.primary, borderRadius: 11, padding: "11px 6px", textAlign: "center", boxShadow: `0 4px 14px rgba(37,99,235,0.30)` }}>
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
      <div style={{ height: 1, background: C.border, margin: "18px 14px 0" }} />
      <div style={{ padding: "14px 14px 0" }}>
        <div style={{ fontSize: 8, fontWeight: 700, color: C.primary, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
          Up &amp; running in minutes
        </div>
        {[
          { n: "1", title: "Create an account", desc: "Sign up in seconds" },
          { n: "2", title: "Browse or list",    desc: "Find or post a chair" },
          { n: "3", title: "Book & connect",    desc: "Confirm and get working" },
        ].map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "white", borderRadius: 9, border: `1px solid ${C.border}`,
            padding: "9px 11px", marginBottom: 8,
            boxShadow: "0 1px 4px rgba(11,23,48,0.05)",
          }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 8, fontWeight: 800, color: "white" }}>{s.n}</span>
            </div>
            <div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: C.text }}>{s.title}</div>
              <div style={{ fontSize: 8, color: C.body, marginTop: 1 }}>{s.desc}</div>
            </div>
            <div style={{ marginLeft: "auto", color: C.primary, fontSize: 10, fontWeight: 700 }}>&#x2192;</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const IPhoneFrame: React.FC<{ scrollY?: number; gloss?: number }> = ({ scrollY = 0, gloss = 1 }) => (
  <div style={{
    width: PH_W, height: PH_H, borderRadius: PH_CR,
    background: `linear-gradient(160deg, #3A3D4A 0%, #1C1E27 30%, #1A1C24 55%, #252830 80%, #2E313C 100%)`,
    position: "relative",
    boxShadow: [
      "0 70px 130px rgba(0,0,0,0.70)", "0 24px 48px rgba(0,0,0,0.50)",
      "10px 0 20px rgba(0,0,0,0.28)", "-10px 0 20px rgba(0,0,0,0.28)",
      "inset 0 0 0 1.5px rgba(255,255,255,0.10)", "inset 0 1px 0 rgba(255,255,255,0.16)",
    ].join(", "),
  }}>
    <div style={{ position: "absolute", top: "8%", bottom: "8%", left: 0, width: "5%", borderRadius: `${PH_CR}px 0 0 ${PH_CR}px`, background: `linear-gradient(90deg, rgba(255,255,255,${0.07 * gloss}) 0%, transparent 100%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", top: "8%", bottom: "8%", right: 0, width: "3.5%", borderRadius: `0 ${PH_CR}px ${PH_CR}px 0`, background: `linear-gradient(270deg, rgba(255,255,255,${0.04 * gloss}) 0%, transparent 100%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", right: -3.5, top: "28%", width: 4, height: 76, borderRadius: "0 3px 3px 0", background: `linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)`, boxShadow: "2px 0 5px rgba(0,0,0,0.35)" }} />
    <div style={{ position: "absolute", left: -3.5, top: "23%", width: 4, height: 58, borderRadius: "3px 0 0 3px", background: `linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)`, boxShadow: "-2px 0 5px rgba(0,0,0,0.35)" }} />
    <div style={{ position: "absolute", left: -3.5, top: "32%", width: 4, height: 58, borderRadius: "3px 0 0 3px", background: `linear-gradient(180deg, #2A2D3A, #3C3F50, #2A2D3A)`, boxShadow: "-2px 0 5px rgba(0,0,0,0.35)" }} />
    <div style={{ position: "absolute", top: SC_T, bottom: SC_B, left: SC_LR, right: SC_LR, borderRadius: 42, overflow: "hidden", background: C.bg }}>
      <div style={{ position: "absolute", top: 13, left: "50%", transform: "translateX(-50%)", width: 128, height: 34, borderRadius: 20, background: "#0B0D14", zIndex: 20, boxShadow: "0 2px 14px rgba(0,0,0,0.6)" }} />
      <AppScreen scrollY={scrollY} />
    </div>
    <div style={{ position: "absolute", inset: 0, borderRadius: PH_CR, background: `linear-gradient(145deg, rgba(255,255,255,${0.035 * gloss}) 0%, transparent 45%, transparent 60%, rgba(255,255,255,${0.015 * gloss}) 100%)`, pointerEvents: "none" }} />
    <div style={{ position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", width: 138, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.28)" }} />
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HERO PHONE REVEAL  (f0–119)
//
// Phone is 1.85× base size — fills ~70% of canvas width, fully legible.
// Reveal is 2× faster than previous version.
// EXIT: phone scales 1.85 → 4.0 (fills entire canvas). The titanium body color
//   floods the frame. S2 opens from this same zoom state and zooms back out,
//   making the cut invisible.
// ═══════════════════════════════════════════════════════════════════════════════
const PHONE_BASE = 1.85;
const PHONE_ZOOM = 4.0;

const ScenePhoneReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const dur   = S2 - S1;

  // 2× faster clip reveal
  const trackT   = eo5(pr(frame, 0, 44));
  const clipTop  = (1 - trackT) * 72;

  // Arc entry — X easeOut3, Y easeOut5 → concave path
  const arcX     = (1 - eo3(pr(frame, 0, 30))) * -44;
  const phoneRise = (1 - eo5(pr(frame, 0, 38))) * 130;

  // Blur-resolve rack focus
  const blurR    = (1 - eo4(pr(frame, 4, 30))) * 12;

  // Parallax app scroll
  const scrollY  = (1 - eo4(pr(frame, 0, 44))) * 380;

  // Float during hold
  const holdT    = pr(frame, 44, 32);
  const floatY   = holdT > 0 ? Math.sin(holdT * Math.PI * 0.9) * 5 : 0;

  // EXIT ZOOM: phone grows to PHONE_ZOOM, flooding the canvas
  const exitT    = eo4(pr(frame, dur - WD, WD));
  const phoneScale = PHONE_BASE + exitT * (PHONE_ZOOM - PHONE_BASE);

  // Supporting content fades as phone zooms toward viewer
  const contentOp = 1 - eo3(pr(frame, dur - WD, WD));

  const atmT       = eo3(pr(frame, 0, 40));
  const glowBreath = 0.55 + Math.sin(frame * 0.07) * 0.45;
  const glossT     = eo3(pr(frame, 44, 20));
  const badgeT     = eo4(pr(frame, 44, 20)) * contentOp;

  return (
    <AbsoluteFill>
      <CameraWrap frame={frame} dur={dur} zoom={2} rollRange={[-0.2, 0.2]} panX={[6, -6]} panY={[3, -3]}>
        <AbsoluteFill style={{ background: C.bg }} />
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 860px 740px at 50% 46%, rgba(37,99,235,${0.07 * atmT * glowBreath}) 0%, transparent 65%)`,
        }} />
        <AbsoluteFill style={{
          backgroundImage: "radial-gradient(circle, rgba(11,23,48,0.028) 1px, transparent 1px)",
          backgroundSize: "52px 52px", opacity: atmT,
        }} />
        <Sparkles color={C.accent} count={8} opacity={0.4 * atmT * contentOp} />

        {/* PHONE — large format, fast reveal, exits by zooming to fill canvas */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: `translate(calc(-50% + ${arcX}px), calc(-50% + ${phoneRise + floatY}px)) scale(${phoneScale})`,
          transformOrigin: "center center",
          clipPath: `inset(${clipTop}% 0 0 0 round ${PH_CR}px)`,
          filter: `blur(${blurR}px)`,
        }}>
          <IPhoneFrame scrollY={scrollY} gloss={trackT * 0.85 + glossT * 0.15} />
        </div>

        {/* Headline — lifts to motivate S2 */}
        <div style={{
          position: "absolute", left: "50%", top: 300,
          transform: "translateX(-50%)",
          opacity: eo4(pr(frame, 44, 16)) * contentOp,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: "-0.03em" }}>
            Rent a Chair
          </div>
        </div>

        {/* Brand badge */}
        <div style={{
          position: "absolute", bottom: 100, left: 0, right: 0,
          display: "flex", justifyContent: "center",
          opacity: badgeT,
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.20)",
            borderRadius: 100, padding: "10px 28px",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.primary, boxShadow: `0 0 8px ${C.primary}60` }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: C.primary, fontFamily: SANS, letterSpacing: "0.06em" }}>
              Shared Salon
            </span>
          </div>
        </div>
      </CameraWrap>
      {/* Titanium overlay rises as phone zooms — makes the canvas fill feel motivated */}
      <div style={{
        position: "absolute", inset: 0,
        background: "#1C1E27",
        opacity: exitT * 0.5,
        pointerEvents: "none",
        zIndex: 999,
      }} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — UI COMES ALIVE  (f120–239)
//
// ENTRY: phone opens at PHONE_ZOOM (4.0) and zooms back — S1's exit state
//   continues seamlessly. The dark titanium overlay clears as it zooms back.
// EXIT: primary blue fills canvas (collapse orb blooms) — S3 resolves through blue.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneUIAlive: React.FC = () => {
  const frame = useCurrentFrame();
  const dur   = S3 - S2;

  // ENTRY: phone zooms back from PHONE_ZOOM to resting depth
  const zoomBack   = eo5(pr(frame, 0, WD));
  const phoneScale = PHONE_ZOOM - zoomBack * (PHONE_ZOOM - 0.82);
  const phoneOp    = 1 - eo4(pr(frame, WD, 28)) * 0.65;
  const phoneBlr   = eo4(pr(frame, WD, 28)) * 3;

  // Dark titanium overlay clears as phone zooms back
  const entryDark  = Math.max(0, 1 - zoomBack * 1.6);

  const atmT       = eo4(pr(frame, WD, 20));
  const glowBreath = 0.55 + Math.sin(frame * 0.08) * 0.45;

  // Floating content (appears after zoom-back completes)
  const h1T    = eo5(pr(frame, WD + 4,  24));
  const h2T    = eo5(pr(frame, WD + 16, 24));
  const ctaT   = eo5(pr(frame, WD + 30, 24));
  const chip1T = eo4(pr(frame, WD + 42, 20));
  const chip2T = eo4(pr(frame, WD + 50, 20));

  const flt = (amp: number, period: number, phase: number) =>
    Math.sin((frame / period) * Math.PI * 2 + phase) * amp;

  // Elements compress toward center before the blue wipe
  const compressT = eo5(pr(frame, 86, 24));

  // Collapse orb — becomes the blue wipe
  const orbT = eo4(pr(frame, 104, 16));

  return (
    <AbsoluteFill>
      <CameraWrap frame={frame} dur={dur} zoom={2.5} rollRange={[0.2, -0.2]} panX={[-6, 6]} panY={[-3, 3]}>
        {/* Background resolves from dark → cream as phone zooms back */}
        <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg} 0%, #EBF2FF 55%, #DCE8FF 100%)`, opacity: atmT }} />
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 900px 800px at 50% 44%, rgba(37,99,235,${0.08 * glowBreath}) 0%, transparent 65%)`,
          opacity: atmT,
        }} />
        <Sparkles color={C.accent} count={9} opacity={0.45 * atmT * (1 - compressT)} />

        {/* Phone — continues from S1's exit zoom, zooms back to background depth */}
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: `translate(-50%, -50%) scale(${phoneScale})`,
          opacity: phoneOp,
          filter: `blur(${phoneBlr}px)`,
        }}>
          <IPhoneFrame scrollY={0} gloss={0.4} />
        </div>

        {/* Headline 1 */}
        <div style={{
          position: "absolute", left: "50%",
          top: 440 + flt(6, 110, 0) * (1 - compressT) + compressT * (960 - 440),
          transform: `translateX(-50%) translateY(${(1 - h1T) * -50}px) scale(${1 - compressT * 0.3})`,
          opacity: h1T * (1 - compressT * 0.9),
          filter: `blur(${(1 - h1T) * 8 + compressT * 4}px)`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: "-0.035em" }}>
            Rent a Chair
          </div>
        </div>

        {/* Headline 2 */}
        <div style={{
          position: "absolute", left: "50%",
          top: 510 + flt(8, 95, Math.PI * 0.4) * (1 - compressT) + compressT * (960 - 510),
          transform: `translateX(-50%) translateY(${(1 - h2T) * -40}px) scale(${1 - compressT * 0.3})`,
          opacity: h2T * (1 - compressT * 0.9),
          filter: `blur(${(1 - h2T) * 6 + compressT * 4}px)`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: "-0.035em" }}>
            Without a Care
          </div>
        </div>

        {/* CTA button */}
        <div style={{
          position: "absolute", left: "50%",
          top: 650 + flt(5, 120, Math.PI * 0.7) * (1 - compressT) + compressT * (960 - 650),
          transform: `translateX(-50%) scale(${(0.72 + ctaT * 0.28) * (1 - compressT * 0.4)}) translateY(${(1 - ctaT) * 30}px)`,
          opacity: ctaT * (1 - compressT * 0.9),
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            background: C.primary, borderRadius: 20, padding: "22px 56px",
            boxShadow: "0 16px 48px rgba(37,99,235,0.38)",
          }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: "white", fontFamily: SANS }}>List Your Space</span>
            <span style={{ fontSize: 24, color: "rgba(255,255,255,0.7)" }}>&#x2192;</span>
          </div>
        </div>

        {/* Chip 1 */}
        <div style={{
          position: "absolute",
          left: 160 + flt(4, 88, Math.PI * 0.3) * (1 - compressT) + compressT * (540 - 160),
          top: 780 + flt(6, 100, 0) * (1 - compressT) + compressT * (960 - 780),
          transform: `scale(${(0.6 + chip1T * 0.4) * (1 - compressT * 0.5)}) translateY(${(1 - chip1T) * 24}px)`,
          opacity: chip1T * (1 - compressT * 0.9),
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px 20px", boxShadow: "0 8px 24px rgba(11,23,48,0.10)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.success, boxShadow: `0 0 8px ${C.success}60` }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: C.text, fontFamily: SANS }}>&#x2713; Verified Venues</span>
          </div>
        </div>

        {/* Chip 2 */}
        <div style={{
          position: "absolute",
          left: 590 + flt(4, 92, Math.PI * 0.8) * (1 - compressT) + compressT * (540 - 590),
          top: 820 + flt(6, 105, Math.PI * 0.5) * (1 - compressT) + compressT * (960 - 820),
          transform: `scale(${(0.6 + chip2T * 0.4) * (1 - compressT * 0.5)}) translateY(${(1 - chip2T) * 24}px)`,
          opacity: chip2T * (1 - compressT * 0.9),
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "12px 20px", boxShadow: "0 8px 24px rgba(11,23,48,0.10)" }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: C.primary, fontFamily: SANS }}>&#x26A1; Fast Booking</span>
          </div>
        </div>

        {/* Collapse orb — energy node, becomes the blue wipe */}
        <div style={{
          position: "absolute", left: "50%", top: 960,
          transform: `translate(-50%, -50%) scale(${orbT})`,
          width: 120, height: 120, borderRadius: "50%",
          background: C.primary,
          opacity: orbT * 0.85,
          boxShadow: `0 0 ${80 * orbT}px ${C.primary}, 0 0 ${180 * orbT}px rgba(37,99,235,0.4)`,
          pointerEvents: "none",
        }} />
      </CameraWrap>

      {/* Dark titanium overlay clears as the zoom-back completes */}
      <div style={{ position: "absolute", inset: 0, background: "#1C1E27", opacity: entryDark, pointerEvents: "none", zIndex: 500 }} />

      {/* EXIT: primary blue fills canvas — S3 receives this wipe */}
      <WipeOut color={C.primary} offset={dur - WD} dur={WD} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — CARD FLIP DECK  (f240–359)
//
// ENTRY: WipeIn from C.primary — cards appear as blue resolves.
// EXIT: WipeOut to white — cards sweep right as white fills in.
// ═══════════════════════════════════════════════════════════════════════════════
interface StepCardProps {
  icon: string; num: string; title: string; desc: string;
  delay: number; accent?: string; exitOffset?: number;
}

const StepCard: React.FC<StepCardProps> = ({
  icon, num, title, desc, delay, accent = C.primary, exitOffset = 1.0,
}) => {
  const frame = useCurrentFrame();
  const dur   = S4 - S3;
  const t     = eo5(pr(frame, delay, 40));
  const rotX  = (1 - t) * -68;
  const op    = cl(t * 4, 0, 1);
  const exitT = eo4(pr(frame, dur - WD, WD));
  const exitX = exitT * 1300 * exitOffset;

  return (
    <div style={{
      width: 880,
      transform: `perspective(1400px) rotateX(${rotX}deg) translateX(${exitX}px)`,
      transformOrigin: "bottom center",
      opacity: op * (1 - exitT * 0.5),
      marginBottom: 24, position: "relative",
    }}>
      {t < 0.85 && (
        <>
          <div style={{ position: "absolute", top: -12, left: 16, right: 16, height: "100%", background: "rgba(220,232,255,0.55)", borderRadius: 26, zIndex: -1, opacity: 1 - t }} />
          <div style={{ position: "absolute", top: -22, left: 30, right: 30, height: "100%", background: "rgba(220,232,255,0.30)", borderRadius: 26, zIndex: -2, opacity: 1 - t }} />
        </>
      )}
      <div style={{
        background: "white", border: `1.5px solid ${C.border}`, borderRadius: 26, padding: "36px 44px",
        boxShadow: "0 20px 52px rgba(11,23,48,0.10), 0 4px 14px rgba(11,23,48,0.06)",
        display: "flex", alignItems: "center", gap: 32,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `${accent}12`, border: `2px solid ${accent}28`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, fontSize: 30,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: accent, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 6 }}>Step {num}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: C.text, fontFamily: SANS, letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 21, color: C.body, fontFamily: SANS, lineHeight: 1.55 }}>{desc}</div>
        </div>
        <div style={{ fontSize: 30, color: `${accent}80`, fontWeight: 700, flexShrink: 0 }}>&#x2192;</div>
      </div>
    </div>
  );
};

const SceneCardFlip: React.FC = () => {
  const frame = useCurrentFrame();
  const dur   = S4 - S3;

  const headerT    = eo4(pr(frame, WD, 24));
  const glowBreath = 0.55 + Math.sin(frame * 0.07) * 0.45;
  const orbFade    = 1 - eo3(pr(frame, 0, 40));
  const exitT      = eo4(pr(frame, dur - WD, WD));
  const ctaT       = eo4(pr(frame, 100, 18)) * (1 - exitT);
  const btnT       = eo5(pr(frame, 108, 18)) * (1 - exitT);

  return (
    <AbsoluteFill>
      <CameraWrap frame={frame} dur={dur} zoom={2} rollRange={[-0.15, 0.15]} panX={[5, -5]} panY={[3, -3]}>
        <AbsoluteFill style={{ background: "#F5F8FF" }} />
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 1000px 800px at 50% 38%, rgba(37,99,235,${0.07 * glowBreath}) 0%, transparent 65%)`,
        }} />
        <Sparkles color={C.accent} count={7} opacity={0.35 * (1 - exitT)} />

        {/* Residual orb from S2 blue wipe */}
        <div style={{
          position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
          width: 400, height: 400, borderRadius: "50%",
          background: `radial-gradient(ellipse, rgba(37,99,235,${0.35 * orbFade}) 0%, transparent 70%)`,
          filter: `blur(${40 * orbFade + 10}px)`, pointerEvents: "none",
        }} />

        {/* Header */}
        <div style={{
          position: "absolute", top: 100, left: 0, right: 0, textAlign: "center",
          opacity: headerT * (1 - exitT), transform: `translateY(${(1 - headerT) * -18}px)`,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.primary, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            Up &amp; running in minutes
          </div>
          <div style={{ fontSize: 54, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: "-0.03em" }}>Three simple steps</div>
        </div>

        {/* Cards with deck-depth and sweep exit */}
        <div style={{ position: "absolute", left: "50%", top: 310, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <StepCard icon="&#x2709;" num="1" title="Create an account"  desc="Sign up in seconds — no credit card needed"       delay={WD + 8}  accent={C.primary} exitOffset={0.9} />
          <StepCard icon="&#x1F4CD;" num="2" title="Browse or list"  desc="Find available chairs nearby or post your space"  delay={WD + 44} accent="#7C3AED"  exitOffset={1.0} />
          <StepCard icon="&#x1F4C5;" num="3" title="Book &amp; connect" desc="Confirm the booking, meet your match, get to work" delay={WD + 80} accent="#059669"  exitOffset={1.1} />
        </div>

        {/* Bottom CTA zone */}
        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ opacity: ctaT, textAlign: "center" }}>
            <div style={{ fontSize: 26, fontWeight: 500, color: C.body, fontFamily: SANS }}>No long-term contracts. Free to sign up.</div>
          </div>
          <div style={{ opacity: btnT, transform: `scale(${0.84 + btnT * 0.16})`, transformOrigin: "center" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 12,
              background: C.primary, borderRadius: 20, padding: "22px 52px",
              boxShadow: "0 14px 44px rgba(37,99,235,0.30)",
            }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: "white", fontFamily: SANS }}>Join the Beta</span>
              <span style={{ fontSize: 22, color: "rgba(255,255,255,0.7)" }}>&#x2192;</span>
            </div>
          </div>
          <div style={{ fontSize: 19, color: C.body, fontFamily: SANS, opacity: ctaT }}>sharedsalon.com.au</div>
        </div>
      </CameraWrap>

      <WipeIn color={C.primary} dur={WD} />
      <WipeOut color="white" offset={dur - WD} dur={WD} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — MARKETPLACE PANEL REVEAL  (f360–479)
//
// ENTRY: WipeIn from white.
// EXIT: WipeOut to C.dark — venue panel's dark color fills canvas.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneMarketplace: React.FC = () => {
  const frame = useCurrentFrame();
  const dur   = S5 - S4;

  const headerT    = eo4(pr(frame, WD, 22));
  const flipRaw    = pr(frame, WD + 8, 56);
  const rotY       = eio3(flipRaw) * 180;
  const glowBreath = 0.55 + Math.sin(frame * 0.06) * 0.45;
  const labelT     = eo4(pr(frame, 86, 20));
  const txt1T      = eo3(pr(frame, 92, 18));
  const txt2T      = eo3(pr(frame, 100, 18));
  const midGlow    = interpolate(rotY, [60, 90, 120], [0, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const exitT      = eo4(pr(frame, dur - WD, WD));

  return (
    <AbsoluteFill>
      <CameraWrap frame={frame} dur={dur} zoom={2.5} rollRange={[0.25, -0.25]} panX={[-7, 7]} panY={[-3, 3]}>
        <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.bg} 0%, #F0F5FF 60%, #E8F0FF 100%)` }} />
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 900px 700px at 50% 44%, rgba(37,99,235,${0.09 * glowBreath}) 0%, transparent 65%)`,
        }} />
        <Sparkles color={C.accent} count={8} opacity={0.4 * (1 - exitT)} />

        <div style={{
          position: "absolute", top: 120, left: 0, right: 0, textAlign: "center",
          opacity: headerT * (1 - exitT), transform: `translateY(${(1 - headerT) * -18}px)`,
        }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.primary, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            One platform. Both sides.
          </div>
        </div>

        {/* Flip midpoint energy */}
        <AbsoluteFill style={{
          background: `radial-gradient(circle at 50% 50%, rgba(37,99,235,${0.45 * midGlow}) 0%, transparent 55%)`,
          filter: "blur(60px)", pointerEvents: "none", zIndex: 30,
        }} />

        {/* 3D flip panel */}
        <div style={{
          position: "absolute", left: "50%", top: 440,
          transform: `translateX(-50%) translateX(${exitT * 1100}px)`,
          width: 900, perspective: 2200,
        }}>
          <div style={{ transformStyle: "preserve-3d", transform: `rotateY(${rotY}deg)`, width: 900 }}>
            <div style={{ position: "absolute", width: 900, backfaceVisibility: "hidden" }}>
              <div style={{
                background: `linear-gradient(145deg, ${C.primary} 0%, #1A3FC7 100%)`,
                borderRadius: 30, padding: "50px 56px",
                boxShadow: "0 32px 80px rgba(37,99,235,0.36)", minHeight: 680,
              }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.14)", borderRadius: 100, padding: "8px 20px", marginBottom: 30 }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: SANS }}>For Stylists &amp; Freelancers</span>
                </div>
                <div style={{ fontSize: 66, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>
                  Find Your<br />Perfect Chair
                </div>
                <div style={{ fontSize: 26, color: "rgba(255,255,255,0.68)", fontFamily: SANS, lineHeight: 1.6, marginBottom: 44 }}>
                  Browse trusted salon spaces, book by the day,<br />week, or month. No long-term commitment.
                </div>
                {["&#x2713; Verified salon venues", "&#x2713; Flexible booking durations", "&#x2713; Fair, transparent pricing"].map((b, i) => (
                  <div key={i} style={{ fontSize: 22, color: "rgba(255,255,255,0.82)", fontFamily: SANS, marginBottom: 14, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: b }} />
                ))}
                <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 14, background: "white", borderRadius: 18, padding: "20px 40px", boxShadow: "0 12px 36px rgba(0,0,0,0.22)" }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: C.primary, fontFamily: SANS }}>Find a Chair</span>
                  <span style={{ fontSize: 22, color: C.primary }}>&#x2192;</span>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", width: 900, backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div style={{
                background: "linear-gradient(145deg, #1C1917 0%, #2A2520 100%)",
                borderRadius: 30, padding: "50px 56px",
                boxShadow: "0 32px 80px rgba(0,0,0,0.55)", minHeight: 680,
                border: "1.5px solid rgba(231,211,167,0.20)",
              }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(231,211,167,0.12)", borderRadius: 100, padding: "8px 20px", marginBottom: 30, border: "1px solid rgba(231,211,167,0.25)" }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: C.accent, fontFamily: SANS }}>For Salon Venues &amp; Owners</span>
                </div>
                <div style={{ fontSize: 66, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0, marginBottom: 24 }}>
                  List Your<br />Unused Chairs
                </div>
                <div style={{ fontSize: 26, color: "rgba(255,255,255,0.60)", fontFamily: SANS, lineHeight: 1.6, marginBottom: 44 }}>
                  Turn quiet periods into consistent income.<br />Connect with verified professionals.
                </div>
                {["&#x2713; Create a listing in 2 minutes", "&#x2713; You control the schedule", "&#x2713; Earn during quieter periods"].map((b, i) => (
                  <div key={i} style={{ fontSize: 22, color: "rgba(255,255,255,0.78)", fontFamily: SANS, marginBottom: 14, fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: b }} />
                ))}
                <div style={{ marginTop: 40, display: "inline-flex", alignItems: "center", gap: 14, background: C.accent, borderRadius: 18, padding: "20px 40px", boxShadow: "0 12px 36px rgba(231,211,167,0.28)" }}>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#1C1917", fontFamily: SANS }}>List Your Space</span>
                  <span style={{ fontSize: 22, color: "#1C1917" }}>&#x2192;</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          position: "absolute", bottom: 110, left: 0, right: 0, textAlign: "center",
          opacity: labelT * (1 - exitT), transform: `translateY(${(1 - labelT) * 18}px)`,
        }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: C.text, fontFamily: SANS }}>
            <span style={{ opacity: txt1T }}>For stylists.</span>{" "}
            <span style={{ opacity: txt2T, color: C.primary }}>For venues.</span>
          </div>
        </div>
      </CameraWrap>

      <WipeIn color="white" dur={WD} />
      <WipeOut color={C.dark} offset={dur - WD} dur={WD} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — CREATE THE LISTING  (f480–599)
//
// ENTRY: C.dark overlay clears (S4 exited to dark).
// EXIT: overexposure white flash — success glow motivates it.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneCreateListing: React.FC = () => {
  const frame = useCurrentFrame();
  const dur   = S6 - S5;

  const headerT    = eo4(pr(frame, WD, 20));
  const glowBreath = 0.55 + Math.sin(frame * 0.08) * 0.45;
  const check1T    = eo5(pr(frame, WD + 8,  22));
  const check2T    = eo5(pr(frame, WD + 24, 22));
  const check3T    = eo5(pr(frame, WD + 40, 22));
  const progressPct = interpolate(
    frame, [WD + 8, WD + 28, WD + 44, WD + 58], [0, 33, 66, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const btnPress = interpolate(frame, [WD + 60, WD + 64, WD + 68], [1, 0.92, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const btnGlow  = eo4(pr(frame, WD + 60, 14));
  const cardT    = eo5(pr(frame, WD + 68, 28));
  const pulseT   = 0.7 + Math.sin(frame * 0.18) * 0.3;
  const actT     = eo4(pr(frame, WD + 88, 14));
  const notif1T  = eo5(pr(frame, WD + 92, 16));
  const notif2T  = eo5(pr(frame, WD + 102, 16));
  const exitT    = eo4(pr(frame, dur - WD, WD));

  return (
    <AbsoluteFill>
      <CameraWrap frame={frame} dur={dur} zoom={2.5} rollRange={[-0.2, 0.2]} panX={[6, -6]} panY={[3, -3]}>
        <AbsoluteFill style={{ background: C.dark }} />
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 880px 720px at 50% 44%, rgba(37,99,235,${0.12 * glowBreath}) 0%, transparent 65%)`,
        }} />
        <AbsoluteFill style={{ backgroundImage: "radial-gradient(circle, rgba(220,232,255,0.03) 1px, transparent 1px)", backgroundSize: "52px 52px" }} />
        <Sparkles color={C.accent} count={8} opacity={0.5 * (1 - exitT)} />

        <div style={{ position: "absolute", top: 100, left: 80, right: 80, opacity: headerT, transform: `translateY(${(1 - headerT) * -18}px)` }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(37,99,235,0.80)", fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
            List your space
          </div>
          <div style={{ fontSize: 60, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1.0 }}>
            Two minutes<br />to listing
          </div>
        </div>

        <div style={{ position: "absolute", top: 358, left: 80, right: 80, opacity: headerT }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontFamily: SANS }}>Setup progress</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: C.primary, fontFamily: SANS }}>{Math.round(progressPct)}%</span>
          </div>
          <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
            <div style={{ height: "100%", width: `${progressPct}%`, borderRadius: 6, background: `linear-gradient(90deg, ${C.primary}, #60A5FA)`, boxShadow: "0 0 16px rgba(37,99,235,0.55)" }} />
          </div>
        </div>

        <div style={{ position: "absolute", top: 420, left: 80, right: 80, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Add venue photos", sub: "3 photos added",      t: check1T },
            { label: "Set your price",   sub: "$85 / day per chair", t: check2T },
            { label: "Set availability", sub: "Mon–Sat, 9am–6pm",    t: check3T },
          ].map((c, i) => (
            <div key={i} style={{ transform: `translateY(${(1 - c.t) * 28}px)`, opacity: c.t }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(255,255,255,0.05)", border: "1.5px solid rgba(255,255,255,0.09)", borderRadius: 18, padding: "20px 26px" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${C.success}18`, border: `2px solid ${C.success}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 22, color: C.success }}>&#x2713;</span>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: "white", fontFamily: SANS }}>{c.label}</div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontFamily: SANS, marginTop: 3 }}>{c.sub}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: 720, left: 80, right: 80, opacity: check3T, transform: `scale(${btnPress})`, transformOrigin: "center" }}>
          <div style={{
            background: C.primary, borderRadius: 22, padding: "28px", textAlign: "center",
            boxShadow: `0 ${16 + btnGlow * 24}px ${48 + btnGlow * 48}px rgba(37,99,235,${0.35 + btnGlow * 0.25})`,
          }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "white", fontFamily: SANS }}>Create Listing &#x2192;</div>
          </div>
        </div>

        <div style={{ position: "absolute", top: 870, left: 80, right: 80, transform: `translateY(${(1 - cardT) * 60}px)`, opacity: cardT }}>
          <div style={{
            background: "rgba(255,255,255,0.06)", border: `1.5px solid rgba(22,163,74,${0.4 * cardT})`, borderRadius: 22, padding: "26px 30px",
            boxShadow: `0 0 60px rgba(22,163,74,${0.18 * pulseT * cardT})`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.success, boxShadow: `0 0 ${14 * pulseT}px ${C.success}` }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.success, fontFamily: SANS, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Listed &amp; Live &#x2713;</div>
                <div style={{ fontSize: 27, fontWeight: 700, color: "white", fontFamily: SANS }}>The Styling Co. &#xB7; Chair #1</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.50)", fontFamily: SANS, marginTop: 3 }}>$85/day &#xB7; Mon&#x2013;Sat &#xB7; Available now</div>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: C.success, fontFamily: SANS }}>$85</div>
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", top: 1040, left: 80, right: 80, opacity: actT, transform: `translateY(${(1 - actT) * 20}px)` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.35)", fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 16 }}>
            First enquiries arriving
          </div>
          {[
            { init: "SL", name: "Sophie L. viewed your listing",    sub: "Just now · Balayage Specialist",  color: C.primary, t: notif1T },
            { init: "MR", name: "Marcus R. sent a booking request", sub: "2 min ago · Colour Treatment",    color: "#7C3AED",  t: notif2T },
          ].map((n, i) => (
            <div key={i} style={{ opacity: n.t, transform: `translateX(${(1 - n.t) * 60}px)`, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px 20px" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `${n.color}20`, border: `1.5px solid ${n.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: n.color, fontFamily: SANS, flexShrink: 0 }}>{n.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "white", fontFamily: SANS }}>{n.name}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.40)", fontFamily: SANS, marginTop: 2 }}>{n.sub}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.color, boxShadow: `0 0 8px ${n.color}` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, textAlign: "center", opacity: eo3(pr(frame, WD + 88, 14)) * (1 - exitT) }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: "rgba(255,255,255,0.28)", fontFamily: SANS }}>sharedsalon.com.au</div>
        </div>
      </CameraWrap>

      <WipeIn color={C.dark} dur={WD} />
      <WipeOut color="white" offset={dur - WD} dur={WD} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — RESULTS / PAYOFF  (f600–719)
//
// ENTRY: WipeIn from white — overexposure resolves to cream.
// EXIT: WipeOut to C.primary blue.
// ═══════════════════════════════════════════════════════════════════════════════
interface BookingCardProps {
  name: string; initials: string; service: string;
  day: string; time: string; amount: number;
  color: string; delay: number; fromLeft: boolean;
}

const BookingCard: React.FC<BookingCardProps> = ({
  name, initials, service, day, time, amount, color, delay, fromLeft,
}) => {
  const frame = useCurrentFrame();
  const t  = eo5(pr(frame, delay, 26));
  const tx = (1 - t) * (fromLeft ? -800 : 800);
  return (
    <div style={{
      transform: `translateX(${tx}px)`, opacity: cl(t * 3.5, 0, 1),
      background: "white", border: `1.5px solid ${C.border}`,
      borderRadius: 22, padding: "22px 28px",
      display: "flex", alignItems: "center", gap: 18,
      boxShadow: "0 8px 32px rgba(11,23,48,0.08)", marginBottom: 16,
    }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: `${color}14`, border: `2px solid ${color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color, fontFamily: SANS, flexShrink: 0 }}>
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, color, fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 2 }}>{service}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: SANS, marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 15, color: C.body, fontFamily: SANS }}>{day} · {time}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -1, lineHeight: 1 }}>${amount}</div>
        <div style={{ fontSize: 11, color: C.success, fontFamily: SANS, fontWeight: 700, letterSpacing: "0.07em", marginTop: 2 }}>&#x2713; CONFIRMED</div>
      </div>
    </div>
  );
};

const ScenePayoff: React.FC = () => {
  const frame = useCurrentFrame();
  const dur   = S7 - S6;

  const headerT    = eo4(pr(frame, WD, 20));
  const glowBreath = 0.55 + Math.sin(frame * 0.07) * 0.45;
  const revenue    = interpolate(
    frame, [WD, WD + 28, WD + 53, WD + 83, WD + 98], [0, 95, 205, 810, 1260],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const ben1T  = eo4(pr(frame, 80, 18));
  const ben2T  = eo4(pr(frame, 92, 18));
  const ben3T  = eo4(pr(frame, 100, 16));
  const stat1T = eo5(pr(frame, 104, 16));
  const stat2T = eo5(pr(frame, 110, 16));
  const pulse  = 0.7 + Math.sin(frame * 0.16) * 0.3;
  const exitT  = eo4(pr(frame, dur - WD, WD));

  return (
    <AbsoluteFill>
      <CameraWrap frame={frame} dur={dur} zoom={3} rollRange={[0.15, -0.15]} panX={[-6, 6]} panY={[-4, 4]}>
        <AbsoluteFill style={{ background: C.bg }} />
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 1000px 800px at 50% 38%, rgba(37,99,235,${0.09 * glowBreath}) 0%, transparent 65%)`,
        }} />
        <Sparkles color={C.accent} count={10} opacity={0.5 * (1 - exitT)} />

        <div style={{
          position: "absolute", top: 80, left: 80, right: 80,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          opacity: headerT, transform: `translateY(${(1 - headerT) * -18}px)`,
        }}>
          <div>
            <div style={{ fontSize: 15, color: C.body, fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>Your listing is live</div>
            <div style={{ fontSize: 52, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: "-0.04em", lineHeight: 1 }}>This week</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: C.body, fontFamily: SANS, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>Earned</div>
            <div style={{ fontSize: 92, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -4, lineHeight: 1 }}>
              ${Math.round(revenue)}
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", top: 260, left: 80, right: 80, height: 1.5, background: C.border, opacity: headerT }} />

        <div style={{ position: "absolute", top: 276, left: 64, right: 64 }}>
          <BookingCard name="Sophie L." initials="SL" service="Cut &amp; Style"     day="Monday"   time="9:00 AM"  amount={95}  color={C.primary} delay={WD + 8}  fromLeft />
          <BookingCard name="Marcus R." initials="MR" service="Colour Treatment"    day="Tuesday"  time="2:00 PM"  amount={110} color="#7C3AED"  delay={WD + 28} fromLeft={false} />
          <BookingCard name="Anna K."   initials="AK" service="Braiding &amp; Style" day="Thursday" time="10:00 AM" amount={90}  color="#059669"  delay={WD + 48} fromLeft />
        </div>

        <div style={{ position: "absolute", top: 796, left: 80, right: 80 }}>
          {[
            { text: "Turn idle chairs into income",        t: ben1T, color: C.primary },
            { text: "Connect with trusted professionals",  t: ben2T, color: C.text    },
          ].map((b, i) => (
            <div key={i} style={{ opacity: b.t * (1 - exitT), transform: `translateY(${(1 - b.t) * 18}px)`, marginBottom: 10 }}>
              <div style={{ fontSize: 31, fontWeight: 800, color: b.color, fontFamily: SANS, letterSpacing: "-0.02em" }}>{b.text}</div>
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", top: 1000, left: 80, right: 80, opacity: ben3T * (1 - exitT), transform: `translateY(${(1 - ben3T) * 28}px)` }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.primary} 0%, #1A3FC7 100%)`,
            borderRadius: 26, padding: "24px 36px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            boxShadow: `0 0 ${40 * pulse}px rgba(37,99,235,${0.25 * pulse}), 0 16px 48px rgba(37,99,235,0.28)`,
          }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: SANS, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5 }}>Projected monthly</div>
              <div style={{ fontSize: 21, color: "rgba(255,255,255,0.65)", fontFamily: SANS }}>per chair · one venue</div>
            </div>
            <div style={{ fontSize: 70, fontWeight: 900, color: "white", fontFamily: SANS, letterSpacing: -3, lineHeight: 1 }}>$2,400</div>
          </div>
        </div>

        <div style={{ position: "absolute", top: 1196, left: 80, right: 80, display: "flex", gap: 18, opacity: stat1T * (1 - exitT), transform: `translateY(${(1 - stat1T) * 24}px)` }}>
          <div style={{ flex: 1, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 22, padding: "28px 24px", textAlign: "center", boxShadow: "0 6px 24px rgba(11,23,48,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.body, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 8 }}>Beta access</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -2, lineHeight: 1, marginBottom: 6 }}>FREE</div>
            <div style={{ fontSize: 15, color: C.body, fontFamily: SANS }}>No setup fees</div>
          </div>
          <div style={{ flex: 1, background: "white", border: `1.5px solid ${C.border}`, borderRadius: 22, padding: "28px 24px", textAlign: "center", boxShadow: "0 6px 24px rgba(11,23,48,0.06)", opacity: stat2T }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.body, fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 8 }}>First listing</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -2, lineHeight: 1, marginBottom: 6 }}>2 min</div>
            <div style={{ fontSize: 15, color: C.body, fontFamily: SANS }}>Average setup time</div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 80, left: 0, right: 0, textAlign: "center", opacity: eo3(pr(frame, WD + 100, 12)) * (1 - exitT) }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: C.body, fontFamily: SANS }}>sharedsalon.com.au</div>
        </div>
      </CameraWrap>

      <WipeIn color="white" dur={WD} />
      <WipeOut color={C.primary} offset={dur - WD} dur={WD} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 7 — CLOSING BRAND MOMENT  (f720–779)
//
// ENTRY: WipeIn from C.primary — brand lockup appears as blue resolves to cream.
// Phone at 55% opacity — visible, anchoring depth.
// ═══════════════════════════════════════════════════════════════════════════════
const SceneClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const dur   = TOTAL - S7;

  const glowBreath = 0.55 + Math.sin(frame * 0.07) * 0.45;
  const phoneT     = eo5(pr(frame, WD, 24));
  const floatY     = Math.sin((frame / 100) * Math.PI * 2) * 6;
  const phoneBlr   = (1 - phoneT) * 4;
  const brand1T    = eo4(pr(frame, WD, 16));
  const brand2T    = eo4(pr(frame, WD + 8, 16));
  const tagT       = eo4(pr(frame, WD + 14, 14));
  const lineT      = eo3(pr(frame, WD + 20, 14));
  const subT       = eo3(pr(frame, WD + 26, 12));
  const btnT       = eo5(pr(frame, WD + 32, 14));
  const urlT       = eo3(pr(frame, WD + 42, 10));
  const btnGlow    = 0.35 + Math.sin(frame * 0.10) * 0.20;

  return (
    <AbsoluteFill>
      <CameraWrap frame={frame} dur={dur} zoom={1.5} rollRange={[-0.1, 0.1]} panX={[3, -3]} panY={[2, -2]}>
        <AbsoluteFill style={{ background: C.bg }} />
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 900px 750px at 50% 44%, rgba(37,99,235,${0.08 * glowBreath}) 0%, transparent 65%)`,
        }} />
        <Sparkles color={C.accent} count={8} opacity={0.40} />

        {/* Phone depth anchor — 55% opacity, low blur */}
        <div style={{
          position: "absolute", left: "50%", top: 660,
          transform: `translate(-50%, calc(-50% + ${floatY}px)) scale(0.72)`,
          opacity: phoneT * 0.55, filter: `blur(${phoneBlr}px)`,
        }}>
          <IPhoneFrame scrollY={0} gloss={0.5} />
        </div>

        {/* Brand lockup — emerges through the resolving blue */}
        <div style={{
          position: "absolute", left: 0, right: 0, top: "50%",
          transform: "translateY(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          padding: "0 90px",
        }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 26, opacity: brand1T, transform: `translateY(${(1 - brand1T) * -16}px)` }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, boxShadow: `0 0 10px ${C.primary}` }} />
            <span style={{ fontSize: 18, fontWeight: 700, color: C.primary, fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase" }}>
              Beta Access · Now Open
            </span>
          </div>
          <div style={{ fontSize: 130, fontWeight: 900, color: C.text, fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86, textTransform: "uppercase", opacity: brand1T, transform: `translateY(${(1 - brand1T) * 40}px)` }}>
            SHARED
          </div>
          <div style={{ fontSize: 130, fontWeight: 900, color: C.primary, fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86, textTransform: "uppercase", marginBottom: 28, opacity: brand2T, transform: `translateY(${(1 - brand2T) * 40}px)` }}>
            SALON
          </div>
          <div style={{ fontSize: 30, fontWeight: 700, color: C.text, fontFamily: SANS, letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 18, opacity: tagT }}>
            List your space.<br /><span style={{ color: C.primary }}>Find your people.</span>
          </div>
          <div style={{ width: `${lineT * 320}px`, height: 4, borderRadius: 3, background: `linear-gradient(90deg, ${C.accent}, rgba(231,211,167,0.3))`, marginBottom: 22 }} />
          <div style={{ fontSize: 20, color: C.body, fontFamily: SANS, lineHeight: 1.6, marginBottom: 36, maxWidth: 660, opacity: subT }}>
            For venue owners who want to earn from idle chairs.<br />
            For freelancers who need trusted, flexible spaces.
          </div>
          <div style={{ opacity: btnT, transform: `scale(${0.82 + btnT * 0.18})`, transformOrigin: "center", marginBottom: 22 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 14,
              background: C.primary, borderRadius: 22, padding: "26px 60px",
              boxShadow: `0 0 ${40 * btnGlow}px rgba(37,99,235,${btnGlow}), 0 16px 48px rgba(37,99,235,0.35)`,
            }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: "white", fontFamily: SANS }}>Join the Beta</span>
              <span style={{ fontSize: 26, color: "rgba(255,255,255,0.72)" }}>&#x2192;</span>
            </div>
          </div>
          <div style={{ fontSize: 20, color: C.body, fontFamily: "monospace", letterSpacing: "0.04em", opacity: urlT }}>
            sharedsalon.com.au
          </div>
        </div>
      </CameraWrap>

      {/* Entry: primary blue resolves — brand appears through it */}
      <WipeIn color={C.primary} dur={WD} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════════
export const SharedSalonFinalAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={S1} durationInFrames={S2 - S1}><ScenePhoneReveal /></Sequence>
    <Sequence from={S2} durationInFrames={S3 - S2}><SceneUIAlive /></Sequence>
    <Sequence from={S3} durationInFrames={S4 - S3}><SceneCardFlip /></Sequence>
    <Sequence from={S4} durationInFrames={S5 - S4}><SceneMarketplace /></Sequence>
    <Sequence from={S5} durationInFrames={S6 - S5}><SceneCreateListing /></Sequence>
    <Sequence from={S6} durationInFrames={S7 - S6}><ScenePayoff /></Sequence>
    <Sequence from={S7} durationInFrames={TOTAL - S7}><SceneClosing /></Sequence>
  </AbsoluteFill>
);
