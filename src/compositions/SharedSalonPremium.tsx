/**
 * SharedSalonPremium — Bespoke 15-second vertical ad composition.
 *
 * A fully custom, hand-art-directed Remotion composition for Shared Salon.
 * Each of the 5 scenes has its own motion design system — no generic templates.
 *
 * Scene layout (30 fps):
 *   Scene 1 — Hook / Symbolic Reveal   frames   0–89   (3s)
 *   Scene 2 — Before vs After          frames  90–179  (3s)
 *   Scene 3 — Feature Cards            frames 180–299  (4s)
 *   Scene 4 — Kinetic Text Payoff      frames 300–389  (3s)
 *   Scene 5 — CTA End Card             frames 390–449  (2s)
 *
 * Custom motion systems used:
 *   • SalonChairIllustration — premium vector SVG chair with float + glow
 *   • SparkleSystem          — deterministic gold sparkle particles
 *   • CombWipe               — salon comb teeth scene entrance transition
 *   • ReflectionSweep        — diagonal gloss sweep for premium moments
 *   • SalonFeatureCard       — spring-physics SaaS card with shadow bloom
 *   • ScissorReveal          — diagonal clip-path blade reveal (inline)
 *   • AirflowParticles       — soft floating wisps (inline)
 *   • Editorial text split   — staggered word-group spring animation (inline)
 *   • Revenue transformation — grayscale→colour + glow pulse effect (inline)
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
import { SparkleSystem } from "../components/salon/SparkleSystem";
import { CombWipe } from "../components/salon/CombWipe";
import { ReflectionSweep } from "../components/salon/ReflectionSweep";
import { SalonFeatureCard } from "../components/salon/SalonFeatureCard";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  primary: "#2563EB",
  secondary: "#DCE8FF",
  accent: "#E7D3A7",
  background: "#FAF8F5",
  text: "#0B1730",
  bodyText: "#66758F",
  border: "#D8DEE8",
  surface: "#F4F7FC",
  softGlow: "rgba(37,99,235,0.12)",
};
const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const W = 1080;
const H = 1920;

// ─── Scene timing ─────────────────────────────────────────────────────────────
// S2 (scissors reveal) extended to 150 frames (5s) so the "after" state
// is comfortably readable before transitioning to features.
const S1_START = 0;
const S2_START = 90;
const S3_START = 240;  // S2 end (90+150)
const S4_START = 360;  // S3 end (240+120)
const S5_START = 450;  // S4 end (360+90)
// Total: S5 + 60 = 510 frames (17s)

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 1 — HOOK / SYMBOLIC REVEAL (frames 0–89)
// ─────────────────────────────────────────────────────────────────────────────

const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Scene fade out ────────────────────────────────────────────────────────
  const sceneOpacity = interpolate(frame, [78, 89], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Background glow build-up ──────────────────────────────────────────────
  const bgGlow = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });

  // ── Brand label (top-centre) ──────────────────────────────────────────────
  const labelOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  // ── Chair entrance (springs up, then floats) ──────────────────────────────
  // SalonChairIllustration handles its own spring internally via startFrame

  // ── Line 1: "Turn Empty Chairs" — springs up as one unit ─────────────────
  const line1Spring = spring({
    frame: frame - 8,
    fps,
    config: { damping: 16, stiffness: 120, mass: 0.95 },
    from: 0, to: 1,
  });
  const line1Y = interpolate(line1Spring, [0, 1], [36, 0]);
  const line1Op = interpolate(line1Spring, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });

  // ── Line 2: "Into Revenue" — diagonal scissor-slice reveal ───────────────
  const sliceStart = 28;
  const sliceProgress = spring({
    frame: frame - sliceStart,
    fps,
    config: { damping: 18, stiffness: 150, mass: 0.85 },
    from: 0, to: 1,
  });
  // Diagonal clip sweeps left-to-right with a slight angle
  const sliceX = interpolate(sliceProgress, [0, 1], [-5, 110]);
  const sliceClip = `polygon(0% -10%, ${sliceX}% -10%, ${sliceX - 4}% 110%, 0% 110%)`;

  // ── Accent rule grows below headline ─────────────────────────────────────
  const ruleWidth = interpolate(sliceProgress, [0.4, 1], [0, 300], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Tagline fades in last ─────────────────────────────────────────────────
  const tagOp = interpolate(frame, [50, 64], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const tagY = interpolate(frame, [50, 64], [16, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Reflection sweep across chair ─────────────────────────────────────────
  const sweepProgress = interpolate(frame, [56, 74], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* ── Background ─────────────────────────────────────────────────── */}
      <AbsoluteFill style={{ background: C.background }} />
      {/* Central blue atmosphere */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 800px at 50% 38%, rgba(37,99,235,0.1) 0%, transparent 65%)`,
          opacity: bgGlow,
        }}
      />
      {/* Warm soft wash bottom */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 700px 500px at 50% 85%, rgba(220,232,255,0.28) 0%, transparent 65%)`,
          opacity: bgGlow,
        }}
      />

      {/* ── Sparkles ───────────────────────────────────────────────────── */}
      <SparkleSystem count={20} color={C.accent} width={W} height={H} globalOpacity={0.6} />

      {/* ── Brand label — top centre ────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 100,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: SANS,
          color: C.primary,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: labelOpacity,
        }}
      >
        Shared Salon
      </div>

      {/* ── Salon chair — centred, upper portion of canvas ──────────────── */}
      <div
        style={{
          position: "absolute",
          top: 340,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        {/* Radial glow disc behind chair */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            height: 360,
            borderRadius: "50%",
            background: `radial-gradient(ellipse, ${C.secondary} 0%, transparent 65%)`,
            opacity: 0.6 * bgGlow,
            filter: "blur(22px)",
            zIndex: 0,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SalonChairIllustration
            scale={1.38}
            startFrame={4}
            showGlow={true}
            instanceId="hook"
          />
          {/* Gloss sweep */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <ReflectionSweep progress={sweepProgress} intensity={0.2} angle={18} />
          </div>
        </div>
      </div>

      {/* ── Headline block — centred, below chair ───────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 910,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 3,
          padding: "0 70px",
        }}
      >
        {/* Line 1: "Turn Empty Chairs" — springs up as one block */}
        <div
          style={{
            fontSize: 90,
            fontWeight: 700,
            fontFamily: SERIF,
            color: C.text,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            textAlign: "center",
            opacity: line1Op,
            transform: `translateY(${line1Y}px)`,
            marginBottom: 4,
          }}
        >
          Turn Empty Chairs
        </div>

        {/* Line 2: "Into Revenue" — scissor slice reveal, "Revenue" in blue italic */}
        <div
          style={{
            position: "relative",
            fontSize: 90,
            fontWeight: 700,
            fontFamily: SERIF,
            letterSpacing: "-0.025em",
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          {/* Ghost (invisible) to hold layout space */}
          <span style={{ opacity: 0 }}>
            Into{" "}
            <span style={{ fontStyle: "italic" }}>Revenue</span>
          </span>
          {/* Revealed copy via scissor-diagonal clip */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: sliceClip,
              whiteSpace: "nowrap",
            }}
          >
            <span style={{ color: C.text }}>Into </span>
            <span style={{ color: C.primary, fontStyle: "italic" }}>Revenue</span>
          </div>
        </div>

        {/* Blue accent rule */}
        <div
          style={{
            marginTop: 36,
            width: ruleWidth,
            height: 3,
            borderRadius: 2,
            background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
            opacity: 0.85,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            marginTop: 30,
            fontSize: 28,
            fontWeight: 400,
            fontFamily: SANS,
            color: C.bodyText,
            letterSpacing: "0.01em",
            lineHeight: 1.55,
            textAlign: "center",
            opacity: tagOp,
            transform: `translateY(${tagY}px)`,
            maxWidth: 620,
          }}
        >
          List your unused chairs and earn during quieter periods.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCISSORS ICON — inline SVG component (natural orientation: tips point UP)
// Rotate 225° on usage to point tips toward bottom-left (cut direction)
// ─────────────────────────────────────────────────────────────────────────────

interface ScissorsIconProps {
  /** Drives the blade open/close snipping motion */
  snipPhase?: number;
  size?: number;
}

/**
 * ScissorsIcon — two blades forming a proper X crossing, with finger rings.
 *
 * Design: viewBox 0 0 100 190
 *  • Left blade:  thin quadrilateral from (29,8)–(37,8) top to (64,172)–(72,172) bottom-right
 *  • Right blade: thin quadrilateral from (63,8)–(71,8) top to (28,172)–(36,172) bottom-left
 *  • The two quads cross each other at roughly y=90, forming a clear X
 *  • Pivot screw sits at the crossing point (50, 90)
 *  • Each blade + its ring rotate independently around the pivot for the snip
 *
 * Rotation of 225° applied by the caller to point the tips toward bottom-left.
 */
const ScissorsIcon: React.FC<ScissorsIconProps> = ({ snipPhase = 0, size = 260 }) => {
  // Blades gently open and close while cutting — oscillates ±7° from centre
  const openAngle = Math.sin(snipPhase * Math.PI * 2) * 7 + 3;
  const PX = 50, PY = 90; // pivot

  return (
    <svg width={size} height={size * 1.9} viewBox="0 0 100 190" fill="none">
      {/* ── Left blade + ring — rotates counter-clockwise to open ─────── */}
      <g transform={`rotate(${-openAngle}, ${PX}, ${PY})`}>
        {/* Blade: thin quad from upper-left area down to lower-right area */}
        <polygon
          points="29,8 37,8 72,172 64,172"
          fill="#0D1525"
          stroke="#2563EB"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Chrome edge highlight along the cutting edge */}
        <line x1="33" y1="9" x2="68" y2="171" stroke="#2563EB" strokeWidth="1.2" strokeOpacity="0.35" />
        {/* Tip shine */}
        <polygon points="30,8 36,8 33,18" fill="#2563EB" opacity="0.25" />
        {/* Ring (lower-right end of this blade) */}
        <circle cx="68" cy="174" r="15" fill="#0D1525" stroke="#2563EB" strokeWidth="3" />
        <circle cx="68" cy="174" r="9"  fill="none"    stroke="#2563EB" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="68" cy="174" r="3"  fill="#2563EB" opacity="0.4" />
      </g>

      {/* ── Right blade + ring — rotates clockwise to open ───────────── */}
      <g transform={`rotate(${+openAngle}, ${PX}, ${PY})`}>
        {/* Blade: thin quad from upper-right area down to lower-left area */}
        <polygon
          points="63,8 71,8 36,172 28,172"
          fill="#0D1525"
          stroke="#2563EB"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Chrome edge highlight */}
        <line x1="67" y1="9" x2="32" y2="171" stroke="#2563EB" strokeWidth="1.2" strokeOpacity="0.35" />
        {/* Tip shine */}
        <polygon points="64,8 70,8 67,18" fill="#2563EB" opacity="0.25" />
        {/* Ring (lower-left end of this blade) */}
        <circle cx="32" cy="174" r="15" fill="#0D1525" stroke="#2563EB" strokeWidth="3" />
        <circle cx="32" cy="174" r="9"  fill="none"    stroke="#2563EB" strokeWidth="1.5" strokeOpacity="0.5" />
        <circle cx="32" cy="174" r="3"  fill="#2563EB" opacity="0.4" />
      </g>

      {/* ── Pivot screw — sits on top of both blades ─────────────────── */}
      <circle cx={PX} cy={PY} r="8"  fill="#1A2A40" stroke="#2563EB" strokeWidth="2.5" />
      <circle cx={PX} cy={PY} r="3.5" fill="#2563EB" />
      {/* Screw slot detail */}
      <line x1={PX - 4} y1={PY} x2={PX + 4} y2={PY} stroke="#2563EB" strokeWidth="1" strokeOpacity="0.7" />
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 2 — SCISSORS CUT REVEAL (frames 90–179)
//
// Phase 1 (0–12):  Fade in — muted unused chair centred on cream bg
// Phase 2 (12–52): Scissors descend diagonally from top-right to bottom-left,
//                  leaving a glowing cut-line trail behind them
// Phase 3 (52–72): Paper peel — two triangular halves slide apart revealing
//                  the monetised chair underneath
// Phase 4 (72–90): After state holds — active chair + revenue indicators
// ─────────────────────────────────────────────────────────────────────────────

const ScissorsRevealScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase timing ──────────────────────────────────────────────────────────
  const CUT_START  = 12;
  const CUT_END    = 52;
  const PEEL_START = 52;
  const PEEL_END   = 72;
  const AFTER_HOLD = 72;

  // ── Scissors cut progress ──────────────────────────────────────────────────
  const cutProgress = interpolate(frame, [CUT_START, CUT_END], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Scissors travel from top-right to bottom-left
  const SCISS_X0 = 1260, SCISS_Y0 = -220;
  const SCISS_X1 = -220,  SCISS_Y1 = 2120;
  const scissorsX = SCISS_X0 + cutProgress * (SCISS_X1 - SCISS_X0);
  const scissorsY = SCISS_Y0 + cutProgress * (SCISS_Y1 - SCISS_Y0);

  // Blade snipping phase (oscillates with each "snip")
  const snipPhase = (frame - CUT_START) * 0.18;

  // ── Paper peel animation ───────────────────────────────────────────────────
  const peelRaw = interpolate(frame, [PEEL_START, PEEL_END], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  // Ease-in-out for peel
  const peel = peelRaw < 0.5 ? 2 * peelRaw * peelRaw : 1 - Math.pow(-2 * peelRaw + 2, 2) / 2;

  // ── After content spring (labels, badge etc.) ──────────────────────────────
  const afterSp = spring({ frame: frame - AFTER_HOLD, fps, config: { damping: 14, stiffness: 100 }, from: 0, to: 1 });
  const afterOp = interpolate(afterSp, [0, 0.25], [0, 1], { extrapolateRight: "clamp" });
  const afterY  = interpolate(afterSp, [0, 1], [28, 0]);

  // ── Before content fade-in ─────────────────────────────────────────────────
  const beforeFade = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Scene exit (scene is 150f total — fade over last 12 frames) ─────────────
  const sceneOpacity = interpolate(frame, [138, 149], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Reusable "before" content — rendered in BOTH clip triangles ────────────
  const BeforePanel = (
    <>
      {/* Background — slightly muted warm cream */}
      <AbsoluteFill style={{ background: "#EDEAE5" }} />
      {/* Subtle vignette */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.14) 100%)",
        }}
      />
      {/* Muted chair centered */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <SalonChairIllustration
          scale={1.18}
          startFrame={0}
          showGlow={false}
          muted={true}
          instanceId="sc-before1"
          float={false}
        />
      </div>
      {/* Label */}
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 46,
            fontWeight: 700,
            fontFamily: SERIF,
            color: "#8A9AB0",
            letterSpacing: "-0.01em",
          }}
        >
          Empty Chair
        </div>
        <div
          style={{
            fontSize: 28,
            fontFamily: SANS,
            color: "#A8B4C0",
            marginTop: 16,
            letterSpacing: "0.01em",
          }}
        >
          No income during quiet periods
        </div>
      </div>
    </>
  );

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>

      {/* ── Layer 0: "After" content — always present underneath ─────────── */}
      <AbsoluteFill style={{ zIndex: 0 }}>
        {/* Active background */}
        <AbsoluteFill
          style={{
            background: "linear-gradient(155deg, #FAF8F5 0%, #EBF2FF 60%, #DCE8FF 100%)",
          }}
        />
        {/* Blue atmosphere */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 660px 600px at 50% 42%, rgba(37,99,235,0.14) 0%, transparent 65%)`,
          }}
        />
        {/* Active chair */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "42%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <SalonChairIllustration
            scale={1.18}
            startFrame={AFTER_HOLD}
            showGlow={true}
            instanceId="sc-after"
            float={true}
          />
        </div>
        {/* Revenue badge — floats in after peel */}
        <div
          style={{
            position: "absolute",
            top: "22%",
            right: 90,
            opacity: afterOp,
            transform: `translateY(${afterY}px)`,
            background: "white",
            border: `2px solid ${C.primary}`,
            borderRadius: 20,
            padding: "22px 32px",
            boxShadow: `0 12px 48px rgba(37,99,235,0.18), 0 3px 10px rgba(0,0,0,0.07)`,
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              fontFamily: SANS,
              color: C.primary,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Listed ✓
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: SANS, color: C.text }}>
            Chair #1
          </div>
          <div
            style={{
              marginTop: 12,
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})`,
            }}
          />
          <div
            style={{
              marginTop: 12,
              fontSize: 17,
              fontFamily: SANS,
              color: C.bodyText,
              fontWeight: 500,
            }}
          >
            Earning now 💸
          </div>
        </div>
        {/* After label */}
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: afterOp,
            transform: `translateY(${-afterY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              fontFamily: SERIF,
              color: C.text,
              letterSpacing: "-0.01em",
            }}
          >
            Now Earning
          </div>
          <div
            style={{
              fontSize: 28,
              fontFamily: SANS,
              color: C.primary,
              marginTop: 16,
              fontWeight: 600,
            }}
          >
            Listed on Shared Salon ✨
          </div>
        </div>
        {/* Ambient sparkles after reveal */}
        <SparkleSystem
          count={14}
          color={C.accent}
          width={W}
          height={H}
          globalOpacity={interpolate(frame, [AFTER_HOLD, AFTER_HOLD + 15], [0, 0.6], {
            extrapolateLeft: "clamp", extrapolateRight: "clamp",
          })}
          speedScale={0.9}
        />
      </AbsoluteFill>

      {/* ── Layer 1: "Before" — upper-left triangle (peels up-left) ─────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)",
          transform: `translate(${-peel * 62}%, ${-peel * 42}%) rotate(${-peel * 14}deg)`,
          transformOrigin: "0% 0%",
          opacity: beforeFade,
        }}
      >
        {BeforePanel}
      </div>

      {/* ── Layer 2: "Before" — lower-right triangle (peels down-right) ──── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          clipPath: "polygon(100% 0%, 100% 100%, 0% 100%)",
          transform: `translate(${peel * 62}%, ${peel * 42}%) rotate(${peel * 14}deg)`,
          transformOrigin: "100% 100%",
          opacity: beforeFade,
        }}
      >
        {BeforePanel}
      </div>

      {/* ── Cut edge glow line (appears as peel starts) ───────────────────── */}
      {peel > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 7, pointerEvents: "none" }}>
          <svg width={W} height={H}>
            <line
              x1={W} y1={0}
              x2={0} y2={H}
              stroke={C.primary}
              strokeWidth="3"
              opacity={interpolate(peel, [0, 0.3, 1], [0, 0.7, 0])}
              filter="url(#glow-line)"
            />
            <defs>
              <filter id="glow-line">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
          </svg>
        </div>
      )}

      {/* ── Scissors SVG — travels the diagonal cut path ──────────────────── */}
      {cutProgress > 0 && cutProgress < 1.02 && (
        <div
          style={{
            position: "absolute",
            left: scissorsX,
            top: scissorsY,
            zIndex: 12,
            pointerEvents: "none",
            transform: "translate(-50%, -50%) rotate(225deg)",
          }}
        >
          <ScissorsIcon snipPhase={snipPhase} size={240} />
        </div>
      )}

      {/* ── Cut-line trail behind scissors ────────────────────────────────── */}
      {cutProgress > 0 && cutProgress < 1 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 11, pointerEvents: "none" }}>
          <svg width={W} height={H}>
            <line
              x1={SCISS_X0} y1={SCISS_Y0}
              x2={scissorsX} y2={scissorsY}
              stroke={C.primary}
              strokeWidth="2.5"
              strokeDasharray="10 6"
              opacity="0.55"
            />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 3 — FEATURE CARDS (frames 180–299)
// ─────────────────────────────────────────────────────────────────────────────

const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Comb wipe entrance ────────────────────────────────────────────────────
  const combProgress = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });

  // ── Scene exit ────────────────────────────────────────────────────────────
  const sceneOpacity = interpolate(frame, [108, 119], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Cards enter at staggered global frames offset within this scene
  const CARD_STARTS = [22, 48, 74]; // local frame offsets

  const features = [
    {
      icon: "💸",
      title: "Extra Revenue",
      description: "Monetise chairs that would otherwise sit empty",
    },
    {
      icon: "⚡",
      title: "Under 2 Minutes",
      description: "Create a listing fast — no complex setup required",
    },
    {
      icon: "✅",
      title: "Verified Professionals",
      description: "Built for trusted industry connections",
    },
  ];

  // ── Section header spring ─────────────────────────────────────────────────
  const { fps } = useVideoConfig();
  const headerProgress = spring({ frame: frame - 14, fps, config: { damping: 16, stiffness: 120 }, from: 0, to: 1 });

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      {/* ── Background ─────────────────────────────────────────────────── */}
      <AbsoluteFill style={{ background: C.background }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 600px at 50% 0%, rgba(220,232,255,0.38) 0%, transparent 70%)`,
        }}
      />

      {/* Subtle sparkles */}
      <SparkleSystem count={12} color={C.accent} width={W} height={H} globalOpacity={0.35} speedScale={0.6} />

      {/* ── Vertically centred content block ───────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 110px",
          gap: 36,
        }}
      >
        {/* Section header */}
        <div
          style={{
            width: "100%",
            opacity: interpolate(headerProgress, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(headerProgress, [0, 1], [22, 0])}px)`,
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 600,
              fontFamily: SANS,
              color: C.primary,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Why Shared Salon
          </div>
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              fontFamily: SERIF,
              color: C.text,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            Platform{" "}
            <span style={{ fontStyle: "italic", color: C.primary }}>Benefits</span>
          </div>
        </div>

        {/* Feature cards — staggered spring entrance */}
        {features.map((f, i) => (
          <SalonFeatureCard
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.description}
            startFrame={CARD_STARTS[i]}
            zDepth={[20, 10, 0][i]}
            width={860}
            primaryColor={C.primary}
            index={i}
          />
        ))}
      </div>

      {/* ── Bottom brand stamp ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 110,
          left: 110,
          right: 110,
          opacity: interpolate(frame, [80, 100], [0, 0.7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          display: "flex",
          gap: 32,
          alignItems: "center",
        }}
      >
        <div style={{ width: 180, height: 1.5, background: C.border }} />
        <div
          style={{
            fontSize: 19,
            fontFamily: SANS,
            fontWeight: 500,
            color: C.bodyText,
            letterSpacing: "0.04em",
          }}
        >
          sharedsalon.com.au
        </div>
        <div style={{ flex: 1, height: 1.5, background: C.border }} />
      </div>

      {/* ── Comb wipe entrance ──────────────────────────────────────────── */}
      <CombWipe progress={combProgress} stripColor={C.background} teethCount={20} />
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 4 — KINETIC TEXT PAYOFF (frames 300–389)
// ─────────────────────────────────────────────────────────────────────────────

const KineticScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Line timings (local frames within this scene)
  const LINE_FRAMES = [8, 36, 64];

  // Per-line slam springs — tight, punchy physics
  const slamSprings = LINE_FRAMES.map((sf) =>
    spring({
      frame: frame - sf,
      fps,
      config: { damping: 10, stiffness: 220, mass: 0.55 },
      from: 0, to: 1,
    })
  );

  // ── Scene entrance: sharp vertical cut ────────────────────────────────────
  const cutProgress = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const cutClipY = interpolate(cutProgress, [0, 1], [100, 0]);

  // ── Scene exit ────────────────────────────────────────────────────────────
  const sceneOpacity = interpolate(frame, [78, 89], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Background pulse on each line hit ─────────────────────────────────────
  const bgPulse = (lineIdx: number) => {
    const afterHit = Math.max(0, frame - LINE_FRAMES[lineIdx]);
    return interpolate(afterHit, [0, 8], [1, 0], { extrapolateRight: "clamp" });
  };

  const lines = [
    { text: "Empty chairs.", color: C.text, size: 106, style: "normal" as const },
    { text: "Quiet periods.", color: "#4A6FA5", size: 106, style: "normal" as const },
    { text: "New revenue.", color: C.primary, size: 110, style: "italic" as const },
  ];

  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity,
        clipPath: `inset(${cutClipY}% 0 0 0)`,
      }}
    >
      {/* ── Background ─────────────────────────────────────────────────── */}
      <AbsoluteFill style={{ background: C.background }} />

      {/* Dynamic background tints on each line hit */}
      {LINE_FRAMES.map((_, i) => (
        <AbsoluteFill
          key={i}
          style={{
            background:
              i === 2
                ? `radial-gradient(ellipse 700px 500px at 50% 55%, rgba(37,99,235,0.09) 0%, transparent 65%)`
                : `radial-gradient(ellipse 500px 400px at 50% 55%, rgba(11,23,48,0.03) 0%, transparent 65%)`,
            opacity: bgPulse(i),
          }}
        />
      ))}

      {/* ── Kinetic text lines ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          paddingLeft: 90,
          gap: 16,
        }}
      >
        {lines.map((line, i) => {
          const sp = slamSprings[i];
          const scaleX = interpolate(sp, [0, 0.6, 1], [0.6, 1.06, 1.0]);
          const scaleY = interpolate(sp, [0, 0.6, 1], [1.5, 0.94, 1.0]);
          const opacity = interpolate(sp, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });
          const blur = interpolate(sp, [0, 0.4], [6, 0], { extrapolateRight: "clamp" });

          // On "New revenue." — extra glow halo behind the text
          const isPayoff = i === 2;

          return (
            <div
              key={line.text}
              style={{
                opacity,
                transform: `scaleX(${scaleX}) scaleY(${scaleY})`,
                transformOrigin: "left center",
                filter: `blur(${blur}px)`,
                position: "relative",
              }}
            >
              {/* Glow halo behind payoff line */}
              {isPayoff && (
                <div
                  style={{
                    position: "absolute",
                    inset: "-20px -30px",
                    background: `radial-gradient(ellipse, rgba(37,99,235,0.18) 0%, transparent 65%)`,
                    filter: "blur(18px)",
                    zIndex: 0,
                  }}
                />
              )}
              <span
                style={{
                  fontSize: line.size,
                  fontWeight: 800,
                  fontFamily: SERIF,
                  fontStyle: line.style,
                  color: line.color,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.0,
                  position: "relative",
                  zIndex: 1,
                  display: "block",
                }}
              >
                {line.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Sparkles — activated after payoff line lands ─────────────────── */}
      {frame >= LINE_FRAMES[2] && (
        <SparkleSystem
          count={14}
          color={C.accent}
          width={W}
          height={H}
          globalOpacity={interpolate(frame, [LINE_FRAMES[2], LINE_FRAMES[2] + 15], [0, 0.55], { extrapolateRight: "clamp" })}
          speedScale={1.2}
        />
      )}

      {/* ── Bottom brand attribution ─────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 130,
          right: 90,
          fontSize: 22,
          fontFamily: SANS,
          fontWeight: 500,
          color: C.primary,
          letterSpacing: "0.06em",
          opacity: interpolate(slamSprings[2], [0.4, 1], [0, 0.8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}
      >
        — Shared Salon
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE 5 — CTA END CARD (frames 390–449)
// ─────────────────────────────────────────────────────────────────────────────

const CTAEndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Entrance: scale-in + fade from bottom ─────────────────────────────────
  const entranceProgress = spring({
    frame: frame - 0,
    fps,
    config: { damping: 16, stiffness: 100, mass: 1.0 },
    from: 0, to: 1,
  });
  const entryY = interpolate(entranceProgress, [0, 1], [40, 0]);
  const entryOpacity = interpolate(entranceProgress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });

  // ── Headline spring ───────────────────────────────────────────────────────
  const headlineProgress = spring({
    frame: frame - 6,
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.9 },
    from: 0, to: 1,
  });

  // ── CTA button spring ─────────────────────────────────────────────────────
  const btnProgress = spring({
    frame: frame - 16,
    fps,
    config: { damping: 13, stiffness: 130, mass: 0.85 },
    from: 0, to: 1,
  });
  const btnScale = interpolate(btnProgress, [0, 1], [0.88, 1]);
  const btnOpacity = interpolate(btnProgress, [0, 0.2], [0, 1], { extrapolateRight: "clamp" });

  // ── Button reflection sweep ───────────────────────────────────────────────
  const sweepProgress = interpolate(frame, [26, 46], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── URL reveal ────────────────────────────────────────────────────────────
  const urlOpacity = interpolate(frame, [32, 46], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Ambient sparkle throughout ────────────────────────────────────────────
  const sparkleOpacity = interpolate(frame, [0, 20], [0, 0.45], { extrapolateRight: "clamp" });

  // ── Mini chair on CTA (brand stamp) ──────────────────────────────────────
  const chairOpacity = interpolate(frame, [22, 38], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      {/* ── Background: cream-to-pale-blue gradient ─────────────────────── */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${C.background} 0%, #EBF2FF 55%, #DCE8FF 100%)`,
        }}
      />
      {/* Central glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 700px 600px at 50% 45%, rgba(37,99,235,0.1) 0%, transparent 65%)`,
        }}
      />

      {/* ── Ambient sparkles ────────────────────────────────────────────── */}
      <SparkleSystem
        count={18}
        color={C.accent}
        width={W}
        height={H}
        globalOpacity={sparkleOpacity}
        speedScale={0.8}
      />

      {/* ── Mini salon chair watermark (top-right, subtle brand stamp) ───── */}
      <div
        style={{
          position: "absolute",
          top: 130,
          right: 80,
          opacity: chairOpacity * 0.22,
          transform: `scale(0.52)`,
          transformOrigin: "top right",
        }}
      >
        <SalonChairIllustration
          scale={1}
          startFrame={0}
          showGlow={false}
          instanceId="cta-stamp"
          float={true}
        />
      </div>

      {/* ── Main content block ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 90,
          right: 90,
          top: "50%",
          transform: `translateY(calc(-50% + ${entryY}px))`,
          opacity: entryOpacity,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 0,
        }}
      >
        {/* Brand badge */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 600,
            fontFamily: SANS,
            color: C.primary,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: 28,
            opacity: interpolate(headlineProgress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          Shared Salon
        </div>

        {/* Headline "Join the Beta" */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            fontFamily: SERIF,
            color: C.text,
            letterSpacing: "-0.025em",
            lineHeight: 1.0,
            marginBottom: 4,
            opacity: interpolate(headlineProgress, [0, 0.25], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(headlineProgress, [0, 1], [24, 0])}px)`,
          }}
        >
          Join the
        </div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            fontFamily: SERIF,
            fontStyle: "italic",
            color: C.primary,
            letterSpacing: "-0.025em",
            lineHeight: 1.0,
            marginBottom: 36,
            opacity: interpolate(headlineProgress, [0.1, 0.35], [0, 1], { extrapolateRight: "clamp" }),
            transform: `translateY(${interpolate(headlineProgress, [0.1, 1], [20, 0])}px)`,
          }}
        >
          Beta.
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 400,
            fontFamily: SANS,
            color: C.bodyText,
            letterSpacing: "0.005em",
            lineHeight: 1.6,
            marginBottom: 56,
            opacity: interpolate(headlineProgress, [0.3, 0.6], [0, 1], { extrapolateRight: "clamp" }),
            maxWidth: 560,
          }}
        >
          List your chair with Shared Salon
          <br />
          and earn during quieter periods.
        </div>

        {/* CTA Button */}
        <div
          style={{
            position: "relative",
            opacity: btnOpacity,
            transform: `scale(${btnScale})`,
            transformOrigin: "left center",
          }}
        >
          {/* Button */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: C.primary,
              borderRadius: 18,
              padding: "28px 56px",
              overflow: "hidden",
              position: "relative",
              boxShadow: `0 16px 48px rgba(37,99,235,0.35), 0 4px 12px rgba(37,99,235,0.25)`,
            }}
          >
            <ReflectionSweep
              progress={sweepProgress}
              intensity={0.28}
              angle={20}
              borderRadius={18}
            />
            <span
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: SANS,
                color: "white",
                letterSpacing: "-0.01em",
                position: "relative",
                zIndex: 1,
              }}
            >
              Join the Beta
            </span>
            <span
              style={{
                fontSize: 26,
                position: "relative",
                zIndex: 1,
              }}
            >
              →
            </span>
          </div>

          {/* Button subtext */}
          <div
            style={{
              marginTop: 18,
              fontSize: 22,
              fontFamily: SANS,
              fontWeight: 500,
              color: C.bodyText,
              letterSpacing: "0.01em",
            }}
          >
            For salon owners ready to earn more
          </div>
        </div>
      </div>

      {/* ── URL — bottom of frame ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: 90,
          right: 90,
          display: "flex",
          alignItems: "center",
          gap: 20,
          opacity: urlOpacity,
        }}
      >
        <div style={{ flex: 1, height: 1.5, background: C.border }} />
        <div
          style={{
            fontSize: 24,
            fontFamily: SANS,
            fontWeight: 600,
            color: C.primary,
            letterSpacing: "0.04em",
          }}
        >
          sharedsalon.com.au
        </div>
        <div style={{ flex: 1, height: 1.5, background: C.border }} />
      </div>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export const SharedSalonPremium: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.background }}>
      <Sequence from={S1_START} durationInFrames={90}>
        <HookScene />
      </Sequence>

      <Sequence from={S2_START} durationInFrames={150}>
        <ScissorsRevealScene />
      </Sequence>

      <Sequence from={S3_START} durationInFrames={120}>
        <FeaturesScene />
      </Sequence>

      <Sequence from={S4_START} durationInFrames={90}>
        <KineticScene />
      </Sequence>

      <Sequence from={S5_START} durationInFrames={60}>
        <CTAEndCard />
      </Sequence>
    </AbsoluteFill>
  );
};
