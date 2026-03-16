/**
 * SharedSalonCinematicAd — "The Revenue Shift"
 *
 * A cinematic 27-second vertical ad for Shared Salon targeting venue owners.
 * Tells the transformation story: empty chairs → real revenue.
 *
 * Format:  9:16 portrait (1080 × 1920)
 * Duration: 810 frames @ 30fps = 27 seconds
 *
 * Scene breakdown:
 *  S1  Hook   (  0– 90f  3s)  Dark bg — six words slam full-screen one by one
 *  S2  Drain  ( 90–210f  4s)  The cost made visceral — $80/day bleeding red counter
 *  S3  Flip   (210–300f  3s)  3D CSS card flip — problem face / solution face
 *  S4  Flood  (300–480f  6s)  Six booking cards from L/R + live revenue + ticker
 *  S5  Proof  (480–600f  4s)  Machine-gun full-screen stats — four in four seconds
 *  S6  CTA    (600–810f  7s)  Premium dual-audience close on bold blue
 *
 * First-of-its-kind techniques (not in any prior ad):
 *  ◆ True CSS 3D card flip (perspective + rotateY + backfaceVisibility: hidden)
 *  ◆ Alternating left/right booking card entries (not just bottom-up)
 *  ◆ Scrolling revenue ticker at the bottom (like a stock ticker)
 *  ◆ Words at 280px filling the ENTIRE vertical canvas on the hook scene
 *  ◆ Flatline heartbeat SVG — revenue vs empty chairs story
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

// ─── Design tokens ─────────────────────────────────────────────────────────
const C = {
  bg:        "#FAF8F5",
  primary:   "#2563EB",
  secondary: "#DCE8FF",
  accent:    "#E7D3A7",
  text:      "#0B1730",
  body:      "#66758F",
  border:    "#D8DEE8",
  dark:      "#060D1A",
  red:       "#DC2626",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const W = 1080;
const H = 1920;

// ─── Easing helpers ────────────────────────────────────────────────────────
const eo3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ─── Ambient sparkles (deterministic, single definition) ──────────────────
const SPARK_DEFS = [
  { x:  68, y:  190, p: 72, d:  0, s: 5 },
  { x: 952, y:  290, p: 60, d: 14, s: 4 },
  { x: 170, y:  510, p: 84, d: 28, s: 6 },
  { x: 880, y:  690, p: 66, d:  8, s: 4 },
  { x: 110, y:  890, p: 76, d: 40, s: 5 },
  { x: 920, y: 1040, p: 62, d: 18, s: 4 },
  { x: 340, y: 1200, p: 80, d: 44, s: 6 },
  { x: 780, y: 1420, p: 68, d: 30, s: 4 },
  { x: 150, y: 1640, p: 74, d: 52, s: 5 },
  { x: 860, y: 1760, p: 58, d: 22, s: 4 },
  { x: 540, y:  300, p: 70, d:  6, s: 5 },
  { x: 500, y: 1500, p: 64, d: 36, s: 4 },
];

const Sparkles: React.FC<{ color?: string; count?: number; opacity?: number }> = ({
  color = C.accent, count = 10, opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <>
      {SPARK_DEFS.slice(0, count).map((s, i) => {
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

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–89, 3s)
//
// Six oversized words slam in from alternating sides, each filling the
// full canvas width. Words cascade at 12-frame intervals. The effect is
// a monumental, fill-every-pixel typographic reveal.
// ═══════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();

  // Scene exit fade
  const sceneOp = interpolate(frame, [78, 89], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Words — each full width, staggered, alternating directions
  const LINES = [
    { text: "WHAT",    delay:  0, size: 280, color: "white",      from: -W  },
    { text: "IF YOUR", delay: 12, size: 196, color: C.primary,    from: +W  },
    { text: "QUIET",   delay: 24, size: 280, color: "white",      from: -W  },
    { text: "DAYS",    delay: 36, size: 280, color: C.secondary,  from: +W  },
    { text: "PAID",    delay: 52, size: 280, color: C.accent,     from: -W  },
    { text: "YOU?",    delay: 62, size: 280, color: "white",      from: +W  },
  ];

  const bgGlow = eo3(cl(frame / 32, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>
      {/* Deep dark background */}
      <AbsoluteFill style={{ background: C.dark }} />
      {/* Blue atmosphere */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 1000px 900px at 50% 50%,
          rgba(37,99,235,0.15) 0%, transparent 65%)`,
        opacity: bgGlow,
      }} />
      {/* Dot grid texture */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, rgba(220,232,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
      }} />

      <Sparkles color={C.accent} count={8} opacity={0.5} />

      {/* Word stack — fills entire vertical canvas */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        paddingLeft: 64,
        paddingRight: 64,
        gap: 0,
        lineHeight: 0.9,
      }}>
        {LINES.map((line, i) => {
          const t = eo5(cl((frame - line.delay) / 14, 0, 1));
          const tx = (1 - t) * (line.from > 0 ? 220 : -220);
          const op = interpolate(t, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });
          // Blur burns off on entry
          const blur = interpolate(t, [0, 0.5], [8, 0], { extrapolateRight: "clamp" });
          return (
            <div
              key={i}
              style={{
                fontSize: line.size,
                fontWeight: 900,
                fontFamily: SANS,
                color: line.color,
                letterSpacing: -10,
                lineHeight: 0.9,
                textTransform: "uppercase",
                transform: `translateX(${tx}px)`,
                opacity: op,
                filter: `blur(${blur}px)`,
                // Glow on accent line
                ...(line.color === C.accent ? {
                  textShadow: `0 0 80px rgba(231,211,167,0.35)`,
                } : {}),
                // Glow on blue line
                ...(line.color === C.primary ? {
                  textShadow: `0 0 80px rgba(37,99,235,0.35)`,
                } : {}),
              }}
            >
              {line.text}
            </div>
          );
        })}
      </div>

      {/* Audience badge — top, appears before word slam begins */}
      <div style={{
        position: "absolute", top: 90, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: eo3(cl(frame / 10, 0, 1)),
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(37,99,235,0.20)",
          border: "1.5px solid rgba(37,99,235,0.45)",
          borderRadius: 100, padding: "10px 28px",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary }} />
          <span style={{
            fontSize: 17, fontWeight: 700, color: "rgba(220,232,255,0.90)",
            fontFamily: SANS, letterSpacing: "0.10em", textTransform: "uppercase",
          }}>
            For salon venue owners
          </span>
        </div>
      </div>

      {/* Brand byline — bottom */}
      <div style={{
        position: "absolute", bottom: 90, left: 0, right: 0, textAlign: "center",
        opacity: eo3(cl((frame - 72) / 14, 0, 1)),
      }}>
        <span style={{
          fontSize: 20, fontWeight: 600, color: "rgba(255,255,255,0.28)",
          fontFamily: SANS, letterSpacing: "0.14em", textTransform: "uppercase",
        }}>
          Shared Salon makes it possible.
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — DRAIN (frames 90–209, 4s)
//
// "$80 per idle day" fills the canvas. A red pulse glow breathes behind it.
// A flatline heartbeat SVG appears at the bottom — revenue flatlining.
// Math equation builds below: ×250 days = $12,480 gone.
// ═══════════════════════════════════════════════════════════════════════════

const SceneDrain: React.FC = () => {
  const frame = useCurrentFrame();

  const sceneOp = interpolate(frame, [108, 119], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const labelT    = eo4(cl(frame / 12, 0, 1));
  const numT      = eo5(cl((frame - 8) / 20, 0, 1));
  const mathT     = eo3(cl((frame - 48) / 22, 0, 1));
  const lineT     = eo3(cl((frame - 32) / 22, 0, 1));
  const heartbeatT = eo3(cl((frame - 64) / 20, 0, 1));

  // Breathing red pulse
  const pulse = 0.55 + Math.sin(frame * 0.13) * 0.45;

  // Flatline wave: builds across the canvas as progress advances
  const waveProgress = cl((frame - 64) / 48, 0, 1);
  const waveW = (W - 120) * waveProgress;
  const spikeX = (W - 120) * 0.38;
  const showSpike = waveProgress > 0.38;
  const showTailLine = waveProgress > 0.44;

  return (
    <AbsoluteFill style={{ opacity: sceneOp }}>
      <AbsoluteFill style={{ background: C.dark }} />
      {/* Red atmospheric glow — breathes */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 900px 750px at 50% 48%,
          rgba(220,38,38,${0.10 * pulse}) 0%, transparent 65%)`,
      }} />
      <Sparkles color="#DC2626" count={6} opacity={0.25} />

      {/* Top label — contextualises the cost */}
      <div style={{
        position: "absolute", top: 130, left: 72, right: 72, textAlign: "center",
        opacity: labelT, transform: `translateY(${(1 - labelT) * -18}px)`,
      }}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: "rgba(220,38,38,0.72)",
          fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.14em",
          lineHeight: 1.5,
        }}>
          Every chair a freelancer
          <br />
          <span style={{ color: "rgba(220,38,38,0.55)" }}>could have rented today</span>
        </div>
      </div>

      {/* Massive $80 figure — fills the canvas centre */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: "50%",
        transform: `translateY(-60%) scale(${0.62 + numT * 0.38})`,
        transformOrigin: "center center",
        opacity: numT,
        textAlign: "center",
      }}>
        {/* Red glow halo */}
        <div style={{
          position: "absolute", left: "50%", top: "40%",
          transform: "translate(-50%, -50%)",
          width: 720, height: 600, borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(220,38,38,${0.18 * pulse}) 0%, transparent 65%)`,
          filter: "blur(28px)",
          pointerEvents: "none",
        }} />

        {/* Dollar prefix + number */}
        <div style={{ position: "relative", display: "inline-flex", alignItems: "flex-start" }}>
          <span style={{
            fontSize: 110, fontWeight: 900, color: C.red,
            fontFamily: SANS, lineHeight: 1.2, marginTop: 14,
          }}>$</span>
          <span style={{
            fontSize: 300, fontWeight: 900, color: "white",
            fontFamily: SANS, letterSpacing: -14, lineHeight: 1,
          }}>80</span>
        </div>

        {/* "per day not rented" below */}
        <div style={{
          fontSize: 44, fontWeight: 500, color: "rgba(255,255,255,0.45)",
          fontFamily: SANS, letterSpacing: "-0.01em", marginTop: -10,
          lineHeight: 1.4,
        }}>
          per day not rented
          <br />
          <span style={{ fontSize: 28, color: "rgba(255,255,255,0.28)" }}>
            to a freelancer
          </span>
        </div>
      </div>

      {/* Math callout — bottom third */}
      <div style={{
        position: "absolute",
        bottom: 280, left: 72, right: 72,
        opacity: mathT,
        transform: `translateY(${(1 - mathT) * 28}px)`,
      }}>
        {/* Thin red divider */}
        <div style={{
          width: `${lineT * 100}%`, height: 1.5,
          background: "rgba(220,38,38,0.35)", borderRadius: 1,
          marginBottom: 24,
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{
              fontSize: 22, color: "rgba(255,255,255,0.38)", fontFamily: SANS,
              lineHeight: 1.6,
            }}>
              What freelancers pay to rent
            </div>
            <div style={{
              fontSize: 21, color: "rgba(255,255,255,0.25)", fontFamily: SANS,
            }}>
              × 250 quiet days / year
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 14, color: C.red, fontFamily: SANS, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4,
            }}>
              Annual loss
            </div>
            <div style={{
              fontSize: 72, fontWeight: 900, color: C.red,
              fontFamily: SANS, letterSpacing: -3, lineHeight: 1,
            }}>
              $12,480
            </div>
          </div>
        </div>
      </div>

      {/* Heartbeat / flatline — absolute bottom */}
      <div style={{
        position: "absolute", bottom: 100, left: 60, right: 60,
        opacity: heartbeatT,
      }}>
        <svg width={W - 120} height={72} viewBox={`0 0 ${W - 120} 72`}>
          {/* Left flatline segment */}
          <line
            x1={0} y1={36}
            x2={Math.min(waveW, spikeX - 8)} y2={36}
            stroke="rgba(220,38,38,0.55)" strokeWidth={2.5} strokeLinecap="round"
          />
          {/* Spike — the one "heartbeat" that dies */}
          {showSpike && (
            <polyline
              points={`${spikeX - 8},36 ${spikeX},4 ${spikeX + 8},68 ${spikeX + 18},36`}
              fill="none"
              stroke={C.red}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {/* Right flatline — after spike */}
          {showTailLine && (
            <line
              x1={spikeX + 18} y1={36}
              x2={waveW} y2={36}
              stroke="rgba(220,38,38,0.28)" strokeWidth={2.5} strokeLinecap="round"
            />
          )}
        </svg>
        <div style={{
          textAlign: "center", fontSize: 15, color: "rgba(220,38,38,0.42)",
          fontFamily: SANS, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", marginTop: 6,
        }}>
          Revenue flatline
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — FLIP (frames 210–299, 3s)
//
// THE SIGNATURE MOMENT. A genuine CSS 3D card flip.
//   Front face: The dark "problem" ($80 drain) — rotateY 0°
//   Back face:  The bright "solution" (Shared Salon) — pre-rotated 180°
//
// Implementation: perspective wrapper → preserve-3d container → rotateY(0→180)
// Both faces use backfaceVisibility: hidden to hide while rotated away.
// A blue glow peaks at the 90° midpoint as the "energy" of the flip.
// ═══════════════════════════════════════════════════════════════════════════

const SceneFlip: React.FC = () => {
  const frame = useCurrentFrame();

  // Hold front 0–10, flip 10–76, hold back 76–90
  const flipRaw = cl((frame - 10) / 66, 0, 1);
  // Ease-in-out — physical card feel
  const eased = flipRaw < 0.5
    ? 2 * flipRaw * flipRaw
    : 1 - Math.pow(-2 * flipRaw + 2, 2) / 2;
  const rotY = eased * 180;

  // Midpoint glow flare (peaks at rotY = 90)
  const midGlow = interpolate(rotY, [60, 90, 120], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const pulse = 0.6 + Math.sin(frame * 0.1) * 0.4;

  return (
    <AbsoluteFill>
      {/* Blue energy burst at the flip midpoint */}
      <AbsoluteFill style={{
        background: `radial-gradient(circle at 50% 50%,
          rgba(37,99,235,${0.55 * midGlow}) 0%, transparent 55%)`,
        filter: "blur(60px)",
        zIndex: 20,
        pointerEvents: "none",
      }} />

      {/* 3D Perspective container */}
      <div style={{
        position: "absolute", inset: 0,
        perspective: "2200px",
        perspectiveOrigin: "50% 50%",
      }}>
        {/* The rotating card — preserve-3d needed for child faces */}
        <div style={{
          position: "absolute", inset: 0,
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotY}deg)`,
        }}>

          {/* ── FRONT FACE: Problem (dark) ────────────────────────── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            background: C.dark,
          }}>
            {/* Red breathing glow */}
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse 700px 600px at 50% 48%,
                rgba(220,38,38,${0.09 * pulse}) 0%, transparent 65%)`,
            }} />
            {/* $80 centered */}
            <div style={{
              position: "absolute", left: 0, right: 0,
              top: "50%", transform: "translateY(-58%)",
              textAlign: "center",
            }}>
              <div style={{ display: "inline-flex", alignItems: "flex-start" }}>
                <span style={{
                  fontSize: 100, fontWeight: 900, color: C.red,
                  fontFamily: SANS, lineHeight: 1.25, marginTop: 16,
                }}>$</span>
                <span style={{
                  fontSize: 270, fontWeight: 900, color: "white",
                  fontFamily: SANS, letterSpacing: -12, lineHeight: 1,
                }}>80</span>
              </div>
              <div style={{
                fontSize: 34, color: "rgba(255,255,255,0.38)", fontFamily: SANS,
                marginTop: -10, lineHeight: 1.45,
              }}>
                per day not rented
                <br />
                <span style={{ fontSize: 24, color: "rgba(255,255,255,0.24)" }}>to a freelancer</span>
              </div>
            </div>
            {/* Bottom label */}
            <div style={{
              position: "absolute", bottom: 180, left: 0, right: 0, textAlign: "center",
              fontSize: 20, fontWeight: 700, color: "rgba(220,38,38,0.55)",
              fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em",
            }}>
              Before Shared Salon
            </div>
          </div>

          {/* ── BACK FACE: Solution (light) — pre-rotated 180° ──── */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `linear-gradient(145deg, ${C.bg} 0%, #E8F0FF 55%, ${C.secondary} 100%)`,
          }}>
            {/* Blue atmosphere */}
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse 900px 800px at 50% 48%,
                rgba(37,99,235,0.13) 0%, transparent 65%)`,
            }} />
            {/* SHARED SALON centred */}
            <div style={{
              position: "absolute", left: 0, right: 0,
              top: "50%", transform: "translateY(-55%)",
              textAlign: "center", padding: "0 60px",
            }}>
              <div style={{
                fontSize: 22, fontWeight: 700, color: C.primary,
                fontFamily: SANS, letterSpacing: "0.14em",
                textTransform: "uppercase", marginBottom: 20,
              }}>
                Introducing
              </div>
              <div style={{
                fontSize: 160, fontWeight: 900, color: C.text,
                fontFamily: SANS, letterSpacing: -8, lineHeight: 0.86,
                textTransform: "uppercase",
              }}>
                SHARED
              </div>
              <div style={{
                fontSize: 160, fontWeight: 900, color: C.primary,
                fontFamily: SANS, letterSpacing: -8, lineHeight: 0.86,
                textTransform: "uppercase", marginBottom: 30,
              }}>
                SALON.
              </div>
              {/* Gold + blue gradient rule */}
              <div style={{
                height: 5, borderRadius: 3,
                background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
              }} />
            </div>
            {/* Bottom label */}
            <div style={{
              position: "absolute", bottom: 180, left: 0, right: 0, textAlign: "center",
              fontSize: 20, fontWeight: 700, color: C.primary,
              fontFamily: SANS, textTransform: "uppercase", letterSpacing: "0.12em",
            }}>
              The revenue shift starts here
            </div>
          </div>

        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — FLOOD (frames 300–479, 6s)
//
// Six booking cards arrive from ALTERNATING sides (left/right) — a first
// for this project. Revenue counter top-right climbs continuously.
// A scrolling REVENUE TICKER (like a stock ticker) runs along the very bottom.
// ═══════════════════════════════════════════════════════════════════════════

const BOOKINGS = [
  { name: "Jessica M.", initials: "JM", service: "Balayage · Colour",   day: "Monday",    time: "9:00 AM",  amount:  95, color: C.primary,  delay:  8, fromLeft: true  },
  { name: "Sophie L.",  initials: "SL", service: "Cut & Style",         day: "Tuesday",   time: "2:00 PM",  amount:  85, color: "#7C3AED",  delay: 26, fromLeft: false },
  { name: "Marcus R.",  initials: "MR", service: "Colour Treatment",    day: "Wednesday", time: "10:00 AM", amount: 110, color: "#0891B2",  delay: 44, fromLeft: true  },
  { name: "Anna K.",    initials: "AK", service: "Braiding & Style",    day: "Thursday",  time: "1:00 PM",  amount:  90, color: "#059669",  delay: 62, fromLeft: false },
  { name: "Tom B.",     initials: "TB", service: "Men's Cut & Finish",  day: "Friday",    time: "11:00 AM", amount: 100, color: "#D97706",  delay: 80, fromLeft: true  },
  { name: "Lara S.",    initials: "LS", service: "Blowout & Style",     day: "Saturday",  time: "9:00 AM",  amount: 120, color: "#BE185D",  delay: 98, fromLeft: false },
] as const;

const BookingCard: React.FC<{
  name: string; initials: string; service: string; day: string;
  time: string; amount: number; color: string; delay: number; fromLeft: boolean;
}> = ({ name, initials, service, day, time, amount, color, delay, fromLeft }) => {
  const frame = useCurrentFrame();
  const t = eo5(cl((frame - delay) / 22, 0, 1));
  const tx = (1 - t) * (fromLeft ? -W : W);

  return (
    <div style={{
      transform: `translateX(${tx}px)`,
      opacity: interpolate(t, [0, 0.15], [0, 1], { extrapolateRight: "clamp" }),
      background: "white",
      border: `1.5px solid ${C.border}`,
      borderRadius: 22,
      padding: "22px 28px",
      display: "flex",
      alignItems: "center",
      gap: 22,
      boxShadow: "0 4px 20px rgba(11,23,48,0.08)",
    }}>
      {/* Avatar */}
      <div style={{
        width: 74, height: 74, borderRadius: "50%",
        background: `${color}12`, border: `2.5px solid ${color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, fontWeight: 800, color, fontFamily: SANS, flexShrink: 0,
      }}>{initials}</div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, color, fontFamily: SANS, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3,
        }}>{service}</div>
        <div style={{
          fontSize: 26, fontWeight: 700, color: C.text,
          fontFamily: SANS, marginBottom: 3,
        }}>{name}</div>
        <div style={{ fontSize: 17, color: C.body, fontFamily: SANS }}>
          {day} · {time}
        </div>
      </div>
      {/* Amount */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{
          fontSize: 42, fontWeight: 900, color: C.primary,
          fontFamily: SANS, letterSpacing: -1.5, lineHeight: 1,
        }}>
          ${amount}
        </div>
        <div style={{
          fontSize: 12, color: "#16A34A", fontFamily: SANS,
          fontWeight: 700, letterSpacing: "0.08em", marginTop: 3,
        }}>
          ✓ CONFIRMED
        </div>
      </div>
    </div>
  );
};

// Ticker items
const TICKER_CHUNK =
  "✓ CONFIRMED · Jessica M · $95     " +
  "✓ CONFIRMED · Sophie L · $85     " +
  "✓ CONFIRMED · Marcus R · $110     " +
  "✓ CONFIRMED · Anna K · $90     " +
  "✓ CONFIRMED · Tom B · $100     " +
  "✓ CONFIRMED · Lara S · $120     ";
const TICKER_FULL = TICKER_CHUNK + TICKER_CHUNK + TICKER_CHUNK;

const SceneFlood: React.FC = () => {
  const frame = useCurrentFrame();

  const headerT = eo4(cl(frame / 14, 0, 1));

  // Live revenue — climbs smoothly with each booking's confirmation
  const continuousRevenue = BOOKINGS.reduce((sum, b) => {
    const confirmTime = b.delay + 22;
    const t = cl((frame - confirmTime) / 10, 0, 1);
    return sum + b.amount * eo3(t);
  }, 0);

  // Projection fade
  const projT = eo3(cl((frame - 120) / 22, 0, 1));

  // Ticker scrolls left at 3.5px/frame
  const tickerX = -(frame * 3.5);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Top gradient wash */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 500,
        background: `linear-gradient(180deg, ${C.secondary}60 0%, transparent 100%)`,
      }} />
      <Sparkles color={C.accent} count={8} />

      {/* Header: "Your bookings this week" + live revenue counter */}
      <div style={{
        position: "absolute", top: 54, left: 68, right: 68,
        opacity: headerT, transform: `translateY(${(1 - headerT) * -20}px)`,
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      }}>
        <div>
          <div style={{
            fontSize: 15, color: C.body, fontFamily: SANS, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4,
          }}>
            Your bookings
          </div>
          <div style={{
            fontSize: 58, fontWeight: 900, color: C.text,
            fontFamily: SANS, letterSpacing: -2.5, lineHeight: 1,
          }}>
            This week
          </div>
        </div>
        {/* Live climbing revenue counter */}
        <div style={{ textAlign: "right" }}>
          <div style={{
            fontSize: 14, color: C.body, fontFamily: SANS, fontWeight: 600,
            textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
          }}>
            Earned
          </div>
          <div style={{
            fontSize: 78, fontWeight: 900, color: C.primary,
            fontFamily: SANS, letterSpacing: -3.5, lineHeight: 1,
          }}>
            ${Math.round(continuousRevenue)}
          </div>
        </div>
      </div>

      {/* Divider line */}
      <div style={{
        position: "absolute", top: 220, left: 68, right: 68,
        height: 1.5, background: C.border, opacity: headerT,
      }} />

      {/* Six booking cards — alternating L/R entry directions */}
      <div style={{
        position: "absolute",
        top: 234, left: 56, right: 56,
        display: "flex", flexDirection: "column", gap: 12,
        overflow: "hidden",
      }}>
        {BOOKINGS.map((b, i) => (
          <BookingCard key={i} {...b} />
        ))}
      </div>

      {/* Monthly projection banner */}
      <div style={{
        position: "absolute",
        bottom: 70, left: 56, right: 56,
        opacity: projT, transform: `translateY(${(1 - projT) * 32}px)`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, #1A3FC7 100%)`,
          borderRadius: 26, padding: "22px 34px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: `0 12px 44px rgba(37,99,235,0.30)`,
        }}>
          <div>
            <div style={{
              fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: SANS,
              fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em",
              marginBottom: 5,
            }}>
              Projected monthly
            </div>
            <div style={{
              fontSize: 24, color: "rgba(255,255,255,0.65)", fontFamily: SANS,
            }}>
              per chair · one venue
            </div>
          </div>
          <div style={{
            fontSize: 76, fontWeight: 900, color: "white",
            fontFamily: SANS, letterSpacing: -3.5, lineHeight: 1,
          }}>
            $2,400
          </div>
        </div>
      </div>

      {/* ── SCROLLING REVENUE TICKER — absolute bottom ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 54, background: C.primary,
        display: "flex", alignItems: "center",
        overflow: "hidden",
      }}>
        <div style={{
          display: "flex",
          whiteSpace: "nowrap",
          transform: `translateX(${tickerX}px)`,
          fontSize: 17, fontWeight: 700, color: "white",
          fontFamily: SANS, letterSpacing: "0.03em",
        }}>
          {TICKER_FULL}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — PROOF (frames 480–599, 4s)
//
// Four full-screen stats, machine-gun paced (30f each = 1s each).
// Each stat fills the entire canvas with a 240px number. The background,
// accent color, and sub-label change for each stat — making each one feel
// like its own scene within the scene.
// ═══════════════════════════════════════════════════════════════════════════

const STATS = [
  { value: "$95+",   label: "PER BOOKING", sub: "FROM FREELANCERS", accent: C.primary, bg: C.bg,       textColor: C.text },
  { value: "$2,400", label: "PER MONTH",   sub: "PER CHAIR",        accent: C.text,    bg: "#F0F4FF",   textColor: C.text },
  { value: "2 MIN",  label: "TO LIST",     sub: "YOUR CHAIR",       accent: "#059669", bg: "#F0FDF4",   textColor: C.text },
  { value: "BETA",   label: "NOW OPEN",    sub: "JOIN FREE",        accent: C.primary, bg: C.secondary, textColor: C.text },
] as const;

const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();

  const STAT_DUR = 30;
  const idx = Math.min(Math.floor(frame / STAT_DUR), STATS.length - 1);
  const localF = frame - idx * STAT_DUR;

  const t = eo5(cl(localF / 13, 0, 1));
  const fadeOut = idx < STATS.length - 1
    ? interpolate(localF, [22, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const stat = STATS[idx];
  const lineW = t * 560;

  return (
    <AbsoluteFill style={{ background: stat.bg }}>
      {/* Per-stat atmosphere */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse 950px 750px at 50% 42%,
          ${stat.accent}0A 0%, transparent 65%)`,
      }} />
      <Sparkles color={C.accent} count={8} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "flex-start", justifyContent: "center",
        padding: "0 76px",
        opacity: fadeOut,
      }}>
        {/* Giant stat number — 240px, fills the frame */}
        <div style={{
          fontSize: 248,
          fontWeight: 900,
          color: stat.accent,
          fontFamily: SANS,
          letterSpacing: -14,
          lineHeight: 0.82,
          transform: `translateY(${(1 - t) * 70}px) scale(${0.72 + t * 0.28})`,
          transformOrigin: "left center",
          opacity: t,
          marginBottom: 0,
        }}>
          {stat.value}
        </div>

        {/* Two-line label below */}
        <div style={{
          fontSize: 68, fontWeight: 900, color: stat.textColor,
          fontFamily: SANS, letterSpacing: -3, lineHeight: 0.88,
          opacity: interpolate(t, [0.25, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateX(${(1 - t) * 36}px)`,
          marginBottom: 0,
        }}>
          {stat.label}
        </div>
        <div style={{
          fontSize: 68, fontWeight: 900, color: stat.accent,
          fontFamily: SANS, letterSpacing: -3, lineHeight: 0.88,
          opacity: interpolate(t, [0.35, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          transform: `translateX(${(1 - t) * 36}px)`,
          marginBottom: 36,
        }}>
          {stat.sub}
        </div>

        {/* Animated accent rule */}
        <div style={{
          width: lineW, maxWidth: 560, height: 5,
          background: stat.accent, borderRadius: 3, marginBottom: 36,
        }} />

        {/* Progress dots — shows position in sequence */}
        <div style={{ display: "flex", gap: 14 }}>
          {STATS.map((_, i) => (
            <div key={i} style={{
              height: 6, borderRadius: 3,
              width: i === idx ? 52 : (i < idx ? 18 : 12),
              background: i <= idx ? stat.accent : C.border,
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 6 — CTA (frames 600–809, 7s)
//
// Bold blue gradient full-bleed. Headline builds word by word.
// Gold accent rule sweeps across. Two audience buttons snap in.
// Sparkles orbit. A breathing glow pulse keeps the frame alive.
// ═══════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT   = eo3(cl(frame / 22, 0, 1));
  const tagT  = eo4(cl((frame -  6) / 18, 0, 1));
  const h1T   = eo5(cl((frame - 18) / 22, 0, 1));
  const h2T   = eo5(cl((frame - 30) / 22, 0, 1));
  const h3T   = eo5(cl((frame - 42) / 22, 0, 1));
  const lineT = eo3(cl((frame - 54) / 24, 0, 1));
  const subT  = eo3(cl((frame - 68) / 20, 0, 1));
  const btn1T = eo5(cl((frame - 90) / 18, 0, 1));
  const btn2T = eo5(cl((frame - 108) / 18, 0, 1));
  const urlT  = eo3(cl((frame - 136) / 16, 0, 1));

  // Breathing glow
  const glowP = 0.55 + Math.sin(frame * 0.07) * 0.45;

  return (
    <AbsoluteFill style={{ opacity: bgT }}>
      {/* Bold blue gradient */}
      <AbsoluteFill style={{
        background: `linear-gradient(160deg, ${C.primary} 0%, #1432B5 50%, #0A228A 100%)`,
      }} />
      {/* Subtle dot grid */}
      <AbsoluteFill style={{
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
      }} />
      {/* Central breathing glow */}
      <div style={{
        position: "absolute", left: "50%", top: "36%",
        transform: "translate(-50%, -50%)",
        width: 860, height: 720, borderRadius: "50%",
        background: `radial-gradient(ellipse,
          rgba(255,255,255,${0.07 * glowP}) 0%, transparent 70%)`,
      }} />
      {/* Bottom blue fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 400,
        background: "linear-gradient(0deg, rgba(0,0,0,0.20) 0%, transparent 100%)",
      }} />

      <Sparkles color={C.accent} count={12} opacity={0.7} />

      {/* Content block */}
      <div style={{
        position: "absolute", left: 72, right: 72,
        top: "50%", transform: "translateY(-50%)",
      }}>

        {/* Beta tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(255,255,255,0.10)",
          border: "1.5px solid rgba(255,255,255,0.22)",
          borderRadius: 100, padding: "10px 28px", marginBottom: 34,
          opacity: tagT, transform: `translateY(${(1 - tagT) * -18}px)`,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%", background: C.accent,
            boxShadow: `0 0 10px ${C.accent}`,
          }} />
          <span style={{
            fontSize: 17, fontWeight: 700, color: "rgba(255,255,255,0.82)",
            fontFamily: SANS, letterSpacing: "0.08em",
          }}>
            Beta Access · Now Open
          </span>
        </div>

        {/* Three-line headline: "JOIN / SHARED / SALON." */}
        <div style={{
          fontSize: 148, fontWeight: 900, color: "white",
          fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86,
          textTransform: "uppercase",
          opacity: h1T, transform: `translateY(${(1 - h1T) * 55}px)`,
        }}>
          JOIN
        </div>
        <div style={{
          fontSize: 148, fontWeight: 900, color: "white",
          fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86,
          textTransform: "uppercase",
          opacity: h2T, transform: `translateY(${(1 - h2T) * 55}px)`,
        }}>
          SHARED
        </div>
        <div style={{
          fontSize: 148, fontWeight: 900, color: C.accent,
          fontFamily: SANS, letterSpacing: -7, lineHeight: 0.86,
          textTransform: "uppercase",
          opacity: h3T, transform: `translateY(${(1 - h3T) * 55}px)`,
          marginBottom: 32,
          textShadow: `0 0 80px rgba(231,211,167,0.30)`,
        }}>
          SALON.
        </div>

        {/* Gold accent rule sweeps in */}
        <div style={{
          width: `${lineT * 100}%`, maxWidth: 440, height: 4.5,
          background: `linear-gradient(90deg, ${C.accent}, rgba(231,211,167,0.4))`,
          borderRadius: 3, marginBottom: 30,
        }} />

        {/* Sub copy */}
        <div style={{
          fontSize: 27, color: "rgba(255,255,255,0.62)",
          fontFamily: SANS, lineHeight: 1.62, marginBottom: 50,
          opacity: subT, transform: `translateY(${(1 - subT) * 20}px)`,
        }}>
          For venue owners who want to earn from idle chairs.
          <br />
          For freelancers who need trusted, flexible spaces.
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 36 }}>
          {/* Primary — Venue Owner */}
          <div style={{
            transform: `scale(${btn1T})`, opacity: btn1T,
            transformOrigin: "left center",
          }}>
            <div style={{
              background: "white",
              borderRadius: 22, padding: "26px 46px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: "0 14px 48px rgba(0,0,0,0.28)",
            }}>
              <span style={{
                fontSize: 30, fontWeight: 800, color: C.primary, fontFamily: SANS,
              }}>
                I'm a Venue Owner
              </span>
              <span style={{ fontSize: 28, color: C.primary, fontWeight: 700 }}>→</span>
            </div>
          </div>
          {/* Secondary — Freelancer */}
          <div style={{
            transform: `scale(${btn2T})`, opacity: btn2T,
            transformOrigin: "left center",
          }}>
            <div style={{
              background: "rgba(255,255,255,0.10)",
              border: "2px solid rgba(255,255,255,0.32)",
              borderRadius: 22, padding: "26px 46px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{
                fontSize: 30, fontWeight: 800, color: "white", fontFamily: SANS,
              }}>
                I'm a Freelancer
              </span>
              <span style={{ fontSize: 28, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>→</span>
            </div>
          </div>
        </div>

        {/* URL */}
        <div style={{
          fontSize: 20, color: "rgba(255,255,255,0.32)",
          fontFamily: "monospace", opacity: urlT, letterSpacing: "0.04em",
        }}>
          sharedsalon.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── ROOT EXPORT ───────────────────────────────────────────────────────────
export const SharedSalonCinematicAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.dark }}>
    <Sequence from={0}   durationInFrames={90}><SceneHook  /></Sequence>
    <Sequence from={90}  durationInFrames={120}><SceneDrain /></Sequence>
    <Sequence from={210} durationInFrames={90}><SceneFlip  /></Sequence>
    <Sequence from={300} durationInFrames={180}><SceneFlood /></Sequence>
    <Sequence from={480} durationInFrames={120}><SceneProof /></Sequence>
    <Sequence from={600} durationInFrames={210}><SceneCTA   /></Sequence>
  </AbsoluteFill>
);
