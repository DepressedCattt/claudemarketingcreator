/**
 * KineticTypographyAd — "Layout-Aware Blur Reveal Typography"
 *
 * Premium SaaS kinetic typography showcase.
 * New words reveal from soft-focus blur into crisp clarity.
 * Existing words continuously glide to make room — never stagnate.
 * A placeholder logo object is invited into the gap between text groups.
 *
 * Format:  16:9 landscape (1920 × 1080)
 * Duration: 300 frames @ 30fps = 10 seconds
 *
 * Narrative:
 *   0–50f   "Move"    centres and sharpens
 *   50–105f "fast"    resolves right of "Move"; "Move" begins continuous left drift
 *   105–170f logo icon slides into gap; both words spread outward to invite it
 *   170–240f logo holds centre; "effortlessly." fades in beneath as a sub-line
 *   240–300f all elements settle into final composition, hold
 *
 * Key technique: ALL positions driven by interpolate() across the full 300f
 * timeline — motion is always live, never snaps between states.
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { clamp, easeOut3, easeOut4, easeInOut3, rawProgress } from "../utils/premiumMotion";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       "#F7F7F5",
  text:     "#0C0C0C",
  accent:   "#1B4FD8",
  muted:    "#9CA3AF",
  surface:  "#FFFFFF",
  border:   "#E5E7EB",
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", Menlo, monospace';

// ─── Beat timestamps (frames @ 30fps) ──────────────────────────────────────────
const T = {
  moveIn:     0,    // "Move" enters centre
  spreadStart:28,   // "Move" begins drifting left before "fast" appears
  fastIn:     52,   // "fast" appears — spread already in motion, no snap
  spreadEnd:  175,  // Spread finishes — ONE continuous motion, no restarts
  logoIn:     120,  // Logo enters gap (spread still moving, not stopped)
  logoSettle: 162,  // Logo fully landed
  subIn:      185,  // "effortlessly." sub-line
  hold:       240,  // Final composition — breathe
  end:        300,
};

// ─── Continuous easing helper ──────────────────────────────────────────────────
// All position/opacity calculations use interpolate() across a global keyframe
// array so motion is always live and never snaps between branches.
function ci(
  frame: number,
  frames: number[],
  values: number[],
  easing: (t: number) => number = easeOut4
): number {
  // Find surrounding segment and apply per-segment easing
  for (let i = 0; i < frames.length - 1; i++) {
    if (frame >= frames[i] && frame <= frames[i + 1]) {
      const t = (frame - frames[i]) / (frames[i + 1] - frames[i]);
      const easedT = easing(t);
      return values[i] + (values[i + 1] - values[i]) * easedT;
    }
  }
  if (frame < frames[0]) return values[0];
  return values[values.length - 1];
}

// ─── WordReveal component ──────────────────────────────────────────────────────
// Blur + drift + opacity resolve. The entry animation plays once and resolves
// cleanly — the POSITION after reveal is handled by the parent's continuous ci().

interface WordRevealProps {
  frame:       number;
  revealStart: number;
  driftX?:     number;
  blurMax?:    number;
  revealDur?:  number;
  children:    React.ReactNode;
}

const WordReveal: React.FC<WordRevealProps> = ({
  frame,
  revealStart,
  driftX    = 30,
  blurMax   = 10,
  revealDur = 28,
  children,
}) => {
  const t       = easeOut4(rawProgress(frame, revealStart, revealDur));
  const tOpac   = easeOut3(rawProgress(frame, revealStart, revealDur * 0.65));
  return (
    <span
      style={{
        display:   "inline-block",
        transform: `translateX(${(1 - t) * driftX}px)`,
        filter:    `blur(${(1 - t) * blurMax}px)`,
        opacity:   clamp(tOpac, 0, 1),
        willChange: "transform, filter, opacity",
      }}
    >
      {children}
    </span>
  );
};

// ─── Placeholder Logo ──────────────────────────────────────────────────────────
// A clean, minimal product icon — represents the object being "invited" into
// the layout gap. Uses the same blur-resolve entry as word reveals.

const LogoMark: React.FC<{ size: number }> = ({ size: S }) => (
  <svg width={S} height={S} viewBox="0 0 64 64" fill="none">
    {/* Outer ring */}
    <circle cx="32" cy="32" r="30" stroke={C.accent} strokeWidth="2.5" opacity="0.25" />
    {/* Inner filled circle */}
    <circle cx="32" cy="32" r="18" fill={C.accent} opacity="0.12" />
    {/* Abstract mark — three arcs suggesting motion/flow */}
    <path
      d="M20 32 C20 24 26 18 32 18"
      stroke={C.accent}
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M44 32 C44 40 38 46 32 46"
      stroke={C.accent}
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M26 38 C26 34 29 31 32 31 C35 31 38 34 38 38"
      stroke={C.accent}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.55"
    />
    {/* Center dot */}
    <circle cx="32" cy="32" r="3.5" fill={C.accent} />
  </svg>
);

// ─── Main Composition ──────────────────────────────────────────────────────────

export const KineticTypographyAd: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Symmetric spread — ONE continuous motion, no intermediate stops ───────────
  //
  // A single easeInOut arc from 0 → finalSpread.
  // Starts rising at T.spreadStart (before "fast" appears), finishes at
  // T.spreadEnd. No chained segments — no decelerate-then-re-accelerate.
  //
  // Final spread = 220px: each word sits 220px from centre.
  // Logo card is 88px wide, so visible gap = 440 - 88 = 352px → plenty of air,
  // not a chasm.
  const FINAL_SPREAD = 220;
  const spreadRaw = easeInOut3(rawProgress(frame, T.spreadStart, T.spreadEnd - T.spreadStart));
  const spread = spreadRaw * FINAL_SPREAD;

  const moveX = -spread;
  const fastX =  spread;

  // ── Logo — enters during the spread, settles gently ─────────────────────────
  const logoY = ci(
    frame,
    [T.logoIn, T.logoSettle, T.hold],
    [20,       0,            0],
    easeOut4
  );
  const logoBlur = (1 - easeOut4(rawProgress(frame, T.logoIn, 38))) * 12;
  const logoOpacity = clamp(easeOut3(rawProgress(frame, T.logoIn, 22)), 0, 1);
  const logoScale = 0.88 + 0.12 * easeOut4(rawProgress(frame, T.logoIn, 38));

  // ── Sub-line "effortlessly." — fades + rises in after logo settles ───────────
  const subOpacity = clamp(easeOut3(rawProgress(frame, T.subIn, 26)), 0, 1);
  const subY = (1 - easeOut4(rawProgress(frame, T.subIn, 26))) * 18;

  // ── Full composition fade-in from frame 0 (prevents hard start) ─────────────
  const globalOpacity = clamp(easeOut3(rawProgress(frame, 0, 12)), 0, 1);

  // ── Font size — large, airy ──────────────────────────────────────────────────
  const FS = 138;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden", opacity: globalOpacity }}>

      {/* ── Ambient vignette ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 65% at 50% 50%, transparent 50%, rgba(180,178,170,0.14) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Main typography row ───────────────────────────────────────────────── */}
      {/*
        Both words and logo are absolutely positioned from the screen centre.
        The container is fixed 0×0 at centre — transforms push outward symmetrically.
        This prevents flexbox reflow from causing layout jumps when "fast" mounts.
      */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 0,
          height: 0,
        }}
      >
        {/* "Move" — always at -spread from centre */}
        <div
          style={{
            position:  "absolute",
            top:       "50%",
            left:      0,
            transform: `translate(calc(-100% + ${moveX}px), -50%)`,
            willChange: "transform",
          }}
        >
          {frame >= T.moveIn && (
            <WordReveal frame={frame} revealStart={T.moveIn} driftX={-26} blurMax={9} revealDur={30}>
              <span
                style={{
                  fontFamily:    SANS,
                  fontSize:      FS,
                  fontWeight:    600,
                  letterSpacing: "-0.035em",
                  color:         C.text,
                  display:       "block",
                  lineHeight:    1,
                  paddingRight:  16,
                  userSelect:    "none",
                  whiteSpace:    "nowrap",
                }}
              >
                Move
              </span>
            </WordReveal>
          )}
        </div>

        {/* Logo — always at exact centre */}
        {frame >= T.logoIn && (
          <div
            style={{
              position:  "absolute",
              top:       "50%",
              left:      0,
              transform: `translate(-50%, calc(-50% + ${logoY}px)) scale(${logoScale})`,
              filter:    `blur(${logoBlur}px)`,
              opacity:   logoOpacity,
              willChange: "transform, filter, opacity",
              display:   "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width:        160,
                height:       160,
                borderRadius: 36,
                background:   C.surface,
                border:       `1.5px solid ${C.border}`,
                boxShadow:    "0 8px 40px rgba(0,0,0,0.09), 0 2px 8px rgba(0,0,0,0.05)",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "center",
              }}
            >
              <LogoMark size={96} />
            </div>
          </div>
        )}

        {/* "fast" — always at +spread from centre */}
        <div
          style={{
            position:  "absolute",
            top:       "50%",
            left:      0,
            transform: `translate(${fastX}px, -50%)`,
            willChange: "transform",
          }}
        >
          {frame >= T.fastIn && (
            <WordReveal frame={frame} revealStart={T.fastIn} driftX={28} blurMax={11} revealDur={28}>
              <span
                style={{
                  fontFamily:    SANS,
                  fontSize:      FS,
                  fontWeight:    700,
                  letterSpacing: "-0.04em",
                  color:         C.accent,
                  display:       "block",
                  lineHeight:    1,
                  paddingLeft:   16,
                  userSelect:    "none",
                  whiteSpace:    "nowrap",
                }}
              >
                fast
              </span>
            </WordReveal>
          )}
        </div>
      </div>

      {/* ── Sub-line: "effortlessly." ─────────────────────────────────────────── */}
      {frame >= T.subIn && (
        <div
          style={{
            position:   "absolute",
            bottom:     "30%",
            left:       "50%",
            transform:  `translateX(-50%) translateY(${subY}px)`,
            opacity:    subOpacity,
            whiteSpace: "nowrap",
            userSelect: "none",
          }}
        >
          <span
            style={{
              fontFamily:    SANS,
              fontSize:      38,
              fontWeight:    300,
              letterSpacing: "0.01em",
              color:         C.muted,
            }}
          >
            effortlessly.
          </span>
        </div>
      )}

      {/* ── Brand label — barely there, bottom-left ───────────────────────────── */}
      {frame >= T.hold && (
        <div
          style={{
            position:   "absolute",
            bottom:     64,
            left:       80,
            opacity:    clamp(easeOut3(rawProgress(frame, T.hold, 24)) * 0.4, 0, 0.4),
            fontFamily: MONO,
            fontSize:   18,
            fontWeight: 400,
            letterSpacing: "0.12em",
            color:      C.text,
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          flowdesk
        </div>
      )}

    </AbsoluteFill>
  );
};
