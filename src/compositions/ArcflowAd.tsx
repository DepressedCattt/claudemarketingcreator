/**
 * ArcflowAd — "Work moves differently now."
 *
 * Showcase ad for Arcflow, a placeholder project-management SaaS.
 * Demonstrates premium motion: arc entry, blur-resolve, hero float,
 * shared-element continuity, and depth de-emphasis.
 *
 * Format:  16:9 landscape (1920 × 1080)
 * Duration: 600 frames @ 30fps = 20 seconds
 *
 * Scene breakdown:
 *  S1  Hook       (   0–100f  3.3s)  Premium text reveal — spacious typography, breathing room
 *  S2  Hero Demo  ( 100–220f  4.0s)  Kanban board glides in on arc with blur-resolve + hero float
 *  S3  Features   ( 220–340f  4.0s)  Board de-emphasises left; 3 features wipe in right staggered
 *  S4  Proof      ( 340–460f  4.0s)  Board exits; social proof + 3 logos + quote builds left-to-right
 *  S5  CTA        ( 460–600f  4.7s)  Dark navy close — clean, restrained, premium CTA
 *
 * Premium motion techniques demonstrated:
 *  ◆ useArcEntry      — hero object approaches on a curved path, not straight line
 *  ◆ useBlurResolve   — hero sharpens on settle (rack focus = hierarchy signal)
 *  ◆ useHeroFloat     — subtle sinusoidal float loop keeps the hero alive
 *  ◆ depthDeemphasis  — board recedes when features become focal (opacity + blur)
 *  ◆ useCinematicTextReveal — text drifts, fades, and sharpens — never slams
 *  ◆ usePremiumWipe   — accent rules use ease-in-out, not linear draws
 *  ◆ premiumStagger   — elements enter in readable hierarchy, 12 frames apart
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import {
  clamp,
  easeOut3,
  easeOut4,
  easeOut5,
  easeInOut3,
  PREMIUM_SPRING,
  useCinematicTextReveal,
  useBlurResolve,
  useArcEntry,
  useHeroFloat,
  useHeroFloatDelayed,
  depthDeemphasis,
  useSoftScaleIn,
  usePremiumWipe,
  useBreathingGlow,
  usePremiumFadeOut,
  premiumStagger,
} from "../utils/premiumMotion";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const C = {
  bg:      "#F8F7F5",        // Warm white — spacious, premium
  bgDeep:  "#F2F0EB",        // Slightly deeper for scene variety
  dark:    "#16213E",        // Deep navy — authority
  darkCTA: "#0D1526",        // Darker CTA background
  primary: "#4F46E5",        // Indigo — modern SaaS blue
  surface: "#FFFFFF",        // Card surfaces
  text:    "#16213E",        // Body text
  body:    "#6B7280",        // Secondary text
  border:  "#E5E7EB",        // Subtle borders
  green:   "#10B981",        // Success / done states
  amber:   "#F59E0B",        // Warning / in-progress states
};
const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", "Cascadia Code", monospace';
const W = 1920;
const H = 1080;

// ─── Shared: Kanban Board Hero ────────────────────────────────────────────────
//
// The hero UI object that carries the viewer through scenes 2 and 3.
// Kept minimal and clean — real-looking without being over-engineered.

const KanbanBoard: React.FC<{ scale?: number }> = ({ scale = 1 }) => {
  const S = scale;
  const COLS = [
    {
      title: "To Do",
      color: C.body,
      dot: "#9CA3AF",
      tasks: ["Write copy", "Design mockups", "API docs"],
    },
    {
      title: "In Progress",
      color: C.primary,
      dot: C.primary,
      tasks: ["Backend auth", "Dashboard V2"],
    },
    {
      title: "Done",
      color: C.green,
      dot: C.green,
      tasks: ["DB schema", "User auth", "Deploy CI"],
    },
  ];

  return (
    <div
      style={{
        width: 640 * S,
        background: C.surface,
        borderRadius: 20 * S,
        boxShadow: `0 ${32 * S}px ${80 * S}px rgba(22,33,62,0.16), 0 ${8 * S}px ${24 * S}px rgba(22,33,62,0.09)`,
        border: `1.5px solid ${C.border}`,
        overflow: "hidden",
        fontFamily: SANS,
      }}
    >
      {/* Title bar */}
      <div
        style={{
          padding: `${18 * S}px ${24 * S}px`,
          borderBottom: `1.5px solid rgba(22,33,62,0.06)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: C.surface,
        }}
      >
        <div
          style={{
            fontSize: 14 * S,
            fontWeight: 700,
            color: C.text,
            letterSpacing: "0.01em",
          }}
        >
          🚀 Q4 Launch Sprint
        </div>
        <div style={{ display: "flex", gap: 6 * S, alignItems: "center" }}>
          <div
            style={{
              fontSize: 11 * S,
              color: C.body,
              fontWeight: 600,
              marginRight: 8 * S,
            }}
          >
            12 tasks
          </div>
          {[C.primary, C.green, C.amber].map((col, i) => (
            <div
              key={i}
              style={{
                width: 8 * S,
                height: 8 * S,
                borderRadius: "50%",
                background: col,
              }}
            />
          ))}
        </div>
      </div>

      {/* Three columns */}
      <div
        style={{
          display: "flex",
          gap: 12 * S,
          padding: `${18 * S}px ${20 * S}px ${20 * S}px`,
          background: `#F8F7F5`,
        }}
      >
        {COLS.map((col, ci) => (
          <div key={ci} style={{ flex: 1 }}>
            {/* Column header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6 * S,
                marginBottom: 10 * S,
              }}
            >
              <div
                style={{
                  width: 7 * S,
                  height: 7 * S,
                  borderRadius: "50%",
                  background: col.dot,
                }}
              />
              <div
                style={{
                  fontSize: 10 * S,
                  fontWeight: 700,
                  color: col.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {col.title}
              </div>
              <div
                style={{
                  fontSize: 10 * S,
                  fontWeight: 700,
                  color: col.color,
                  background: `${col.dot}18`,
                  borderRadius: 20 * S,
                  padding: `1px ${5 * S}px`,
                  marginLeft: "auto",
                }}
              >
                {col.tasks.length}
              </div>
            </div>

            {/* Task cards */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6 * S,
              }}
            >
              {col.tasks.slice(0, 2).map((task, ti) => (
                <div
                  key={ti}
                  style={{
                    background: C.surface,
                    border: `1px solid rgba(22,33,62,0.06)`,
                    borderRadius: 8 * S,
                    padding: `${9 * S}px ${11 * S}px`,
                    fontSize: 11 * S,
                    fontWeight: 500,
                    color: C.text,
                    lineHeight: 1.4,
                    boxShadow: `0 ${1 * S}px ${4 * S}px rgba(22,33,62,0.04)`,
                  }}
                >
                  {task}
                </div>
              ))}
              {/* Third task — slightly muted for depth */}
              {col.tasks[2] && (
                <div
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    border: `1px solid rgba(22,33,62,0.04)`,
                    borderRadius: 8 * S,
                    padding: `${9 * S}px ${11 * S}px`,
                    fontSize: 11 * S,
                    fontWeight: 500,
                    color: `${C.text}88`,
                  }}
                >
                  {col.tasks[2]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer bar */}
      <div
        style={{
          padding: `${12 * S}px ${20 * S}px`,
          borderTop: `1px solid rgba(22,33,62,0.06)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: C.surface,
        }}
      >
        <div
          style={{
            fontSize: 10 * S,
            color: C.body,
            fontWeight: 600,
            letterSpacing: "0.04em",
          }}
        >
          arcflow.io
        </div>
        <div
          style={{
            fontSize: 10 * S,
            fontWeight: 700,
            color: C.green,
            background: `${C.green}12`,
            borderRadius: 20 * S,
            padding: `2px ${8 * S}px`,
            display: "flex",
            alignItems: "center",
            gap: 4 * S,
          }}
        >
          <div
            style={{
              width: 5 * S,
              height: 5 * S,
              borderRadius: "50%",
              background: C.green,
            }}
          />
          Live
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–100, 3.33s)
//
// Pure typography on a warm white canvas. Lots of breathing room.
// Three lines reveal with cinematic text entrance — drift, fade, blur-resolve.
// No hero object yet. The restraint IS the message.
//
// Premium principle: "Leave breathing room between beats."
// ═══════════════════════════════════════════════════════════════════════════

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(100, 12);

  const badge = useCinematicTextReveal(0, 12, 5);
  const line1 = useCinematicTextReveal(8, 16, 7);
  const line2 = useCinematicTextReveal(20, 16, 7);
  const line3 = useCinematicTextReveal(32, 16, 8);
  const sub = useCinematicTextReveal(54, 14, 5);
  const wipe = usePremiumWipe(58, 28);

  // Background soft radial
  const bgGlow = easeOut3(clamp(frame / 30, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Radial glow — barely perceptible, adds warmth */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1400px 900px at 50% 48%,
            rgba(79,70,229,0.055) 0%, transparent 70%)`,
          opacity: bgGlow,
        }}
      />

      {/* Subtle dot texture — depth without noise */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, rgba(22,33,62,0.028) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Vertical centred content block */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 160px",
        }}
      >
        {/* Brand badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: `rgba(79,70,229,0.08)`,
            border: `1.5px solid rgba(79,70,229,0.20)`,
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 44,
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
            filter: `blur(${badge.blur}px)`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.primary,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.primary,
              fontFamily: SANS,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}
          >
            Arcflow · Project Intelligence
          </span>
        </div>

        {/* Three-line headline */}
        {[
          { text: "Work moves", t: line1, size: 128, color: C.text },
          { text: "differently", t: line2, size: 128, color: C.text },
          {
            text: "now.",
            t: line3,
            size: 128,
            color: C.primary,
          },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: l.size,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -5,
              lineHeight: 0.9,
              opacity: l.t.opacity,
              transform: `translateY(${l.t.translateY}px)`,
              filter: `blur(${l.t.blur}px)`,
              ...(i === 2
                ? {
                    textShadow: `0 0 80px rgba(79,70,229,0.18)`,
                    marginBottom: 48,
                  }
                : {}),
            }}
          >
            {l.text}
          </div>
        ))}

        {/* Accent rule — wipes in, tied to sub-copy */}
        <div
          style={{
            width: `${wipe}%`,
            maxWidth: 360,
            height: 3,
            background: `linear-gradient(90deg, ${C.primary}, rgba(79,70,229,0.25))`,
            borderRadius: 2,
            marginBottom: 28,
          }}
        />

        {/* Sub copy */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: C.body,
            fontFamily: SANS,
            lineHeight: 1.65,
            maxWidth: 600,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          The platform for teams that ship.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — HERO DEMO (frames 100–220, 4s)
//
// The kanban board hero arrives. This is the arc-entry + blur-resolve demo.
//
// Motion story:
//  1. Board glides in from bottom-right on a curved arc (X spring, Y ease-out5)
//  2. Blur resolves from 16px → 0 as board settles — signals importance
//  3. Board then enters a gentle float loop — keeps the scene alive
//  4. Left copy drifts in staggered — never competes with board entry
//
// Premium principle: "One hero at a time. Background de-emphasises."
// ═══════════════════════════════════════════════════════════════════════════

const SceneHeroDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  // Board entrance — arc from bottom-right
  const boardArc = useArcEntry(0, 180, 120, PREMIUM_SPRING.hero);
  const boardBlur = useBlurResolve(0, 30, 16);
  const boardOpacity = easeOut3(clamp(frame / 18, 0, 1));

  // Board scale-in
  const boardScale = useSoftScaleIn(0, 0.90, 28);

  // Float begins after entrance settles (~frame 35)
  const boardFloat = useHeroFloatDelayed(35, 7, 90);

  // Left copy — staggered, waits for board to start settling
  const labelT = useCinematicTextReveal(28, 14, 6);
  const line1 = useCinematicTextReveal(36, 14, 6);
  const line2 = useCinematicTextReveal(50, 14, 6);
  const badge = useCinematicTextReveal(66, 10, 5);

  // Background glow blooms as board arrives
  const glowT = easeOut3(clamp(frame / 40, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Indigo glow behind where board will settle */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 700px at 72% 52%,
            rgba(79,70,229,${0.07 * glowT}) 0%, transparent 65%)`,
        }}
      />

      {/* Left side — contextual copy */}
      <div
        style={{
          position: "absolute",
          left: 160,
          top: "50%",
          transform: "translateY(-50%)",
          width: 560,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: C.primary,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 20,
            opacity: labelT.opacity,
            transform: `translateY(${labelT.translateY}px)`,
            filter: `blur(${labelT.blur}px)`,
          }}
        >
          See your work clearly
        </div>

        {/* Main copy */}
        {["3 columns.", "Zero chaos."].map((text, i) => {
          const t = i === 0 ? line1 : line2;
          return (
            <div
              key={i}
              style={{
                fontSize: 72,
                fontWeight: 900,
                fontFamily: SANS,
                color: i === 1 ? C.primary : C.text,
                letterSpacing: -3,
                lineHeight: 0.92,
                opacity: t.opacity,
                transform: `translateY(${t.translateY}px)`,
                filter: `blur(${t.blur}px)`,
              }}
            >
              {text}
            </div>
          );
        })}

        {/* Active projects badge */}
        <div
          style={{
            marginTop: 36,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: C.surface,
            border: `1.5px solid ${C.border}`,
            borderRadius: 100,
            padding: "10px 22px",
            boxShadow: "0 2px 12px rgba(22,33,62,0.07)",
            opacity: badge.opacity,
            transform: `translateY(${badge.translateY}px)`,
            filter: `blur(${badge.blur}px)`,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 8px ${C.green}`,
            }}
          />
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: C.text,
              fontFamily: SANS,
            }}
          >
            12 projects active now
          </span>
        </div>
      </div>

      {/* Hero kanban board — arc entry + blur-resolve + float */}
      <div
        style={{
          position: "absolute",
          right: 140,
          top: "50%",
          transform: `
            translateX(${boardArc.translateX}px)
            translateY(calc(-50% + ${boardArc.translateY + boardFloat}px))
            scale(${boardScale})
          `,
          transformOrigin: "50% 50%",
          opacity: boardOpacity,
          filter: `blur(${boardBlur}px)`,
        }}
      >
        <KanbanBoard scale={1.18} />
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — FEATURES (frames 220–340, 4s)
//
// The board persists but de-emphasises to the LEFT side of the frame
// as three feature rows become the focal point on the right.
//
// This demonstrates shared-element continuity + depth de-emphasis.
// The same board from S2 is now "background depth" anchoring the composition
// while the features command attention.
//
// Premium principle: "Background elements de-emphasise when hero takes focus."
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant sync",
    body: "Every update reflected across your team in real time.",
    delay: 0,
  },
  {
    icon: "👁",
    title: "Cross-team visibility",
    body: "One view. Every project. No more status meetings.",
    delay: 14,
  },
  {
    icon: "🚀",
    title: "Ship 2× faster",
    body: "Teams on Arcflow close sprints ahead of schedule.",
    delay: 28,
  },
];

const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  // Board is de-emphasised — continuity from S2, but it's no longer the focal point
  // It stays visible (not hidden), just visually receded
  const deempT = clamp(frame / 20, 0, 1);
  const deemph = depthDeemphasis(easeInOut3(deempT));

  const eyebrow = useCinematicTextReveal(6, 12, 5);
  const headline = useCinematicTextReveal(18, 14, 6);

  // Subtle background glow shift from right to left as focus moves
  const glowT = easeOut3(clamp(frame / 35, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Glow follows the features (right side) */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 700px at 68% 50%,
            rgba(79,70,229,${0.065 * glowT}) 0%, transparent 65%)`,
        }}
      />

      {/* Board — de-emphasised, centred in the LEFT HALF of the 1920px canvas.
           Left half = 0–960px. Board width at scale 0.82 = ~525px.
           Centred: left = (960/2) - (525/2) = 218px ≈ 220px.
           This eliminates the 535px dead-zone gap that formed when left: 100. */}
      <div
        style={{
          position: "absolute",
          left: 220,
          top: "50%",
          transform: `translateY(-50%) scale(${deemph.scale})`,
          transformOrigin: "center center",
          opacity: deemph.opacity,
          filter: `blur(${deemph.blur}px)`,
        }}
      >
        <KanbanBoard scale={0.82} />
      </div>

      {/* Vertical divider — makes the split intentional, fills the centre alley */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 80,
          bottom: 80,
          width: 1,
          background: `linear-gradient(180deg, transparent, ${C.border} 20%, ${C.border} 80%, transparent)`,
          opacity: easeOut3(clamp(frame / 28, 0, 1)),
        }}
      />

      {/* Feature list — centred in the RIGHT HALF (960–1920px).
           Width 680px centred in right half: left = 960 + (960/2) - (680/2) = 1300px, right = 1920-1300-680=−60? No.
           Let's use right: 120, width: 680 → left edge at 1920-120-680=1120, centre at 1460. Good. */}
      <div
        style={{
          position: "absolute",
          right: 120,
          top: "50%",
          transform: "translateY(-50%)",
          width: 680,
        }}
      >
        {/* Section label */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.primary,
            fontFamily: SANS,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 14,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          Why teams switch
        </div>

        {/* Headline — scaled up to use the wider 680px column */}
        <div
          style={{
            fontSize: 66,
            fontWeight: 900,
            color: C.text,
            fontFamily: SANS,
            letterSpacing: -2.5,
            lineHeight: 0.92,
            marginBottom: 50,
            opacity: headline.opacity,
            transform: `translateY(${headline.translateY}px)`,
            filter: `blur(${headline.blur}px)`,
          }}
        >
          Built for
          <br />
          <span style={{ color: C.primary }}>how teams work.</span>
        </div>

        {/* Three feature rows — staggered */}
        {FEATURES.map((feat, i) => {
          const startF = feat.delay;
          const t = easeOut4(clamp((frame - startF) / 22, 0, 1));
          const wipeWidth = easeInOut3(clamp((frame - startF - 16) / 20, 0, 1)) * 100;
          const opacity = clamp(t / 0.3, 0, 1);

          return (
            <div
              key={i}
              style={{
                marginBottom: i < 2 ? 36 : 0,
                opacity,
                transform: `translateX(${(1 - t) * 44}px)`,
              }}
            >
              {/* Icon + title row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  marginBottom: 8,
                }}
              >
                <span style={{ fontSize: 24, lineHeight: 1 }}>{feat.icon}</span>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 800,
                    color: C.text,
                    fontFamily: SANS,
                    letterSpacing: -0.5,
                  }}
                >
                  {feat.title}
                </span>
              </div>

              {/* Body */}
              <div
                style={{
                  fontSize: 19,
                  color: C.body,
                  fontFamily: SANS,
                  lineHeight: 1.6,
                  paddingLeft: 36,
                  marginBottom: 12,
                }}
              >
                {feat.body}
              </div>

              {/* Accent underline — wipes in */}
              <div
                style={{
                  marginLeft: 36,
                  width: `${wipeWidth}%`,
                  maxWidth: 200,
                  height: 2,
                  background: `linear-gradient(90deg, ${C.primary}60, transparent)`,
                  borderRadius: 1,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — PROOF (frames 340–460, 4s)
//
// Social proof scene. Board exits gracefully.
// A large number leads the composition, followed by supporting logos
// and a testimonial chip.
//
// Premium principle: "Animate fewer elements. Stagger at readable pace."
// ═══════════════════════════════════════════════════════════════════════════

const LOGOS = [
  { name: "Meridian", initials: "ME", color: "#C2410C" },
  { name: "Luminary", initials: "LU", color: "#2563EB" },
  { name: "TrailBlaze", initials: "TB", color: "#059669" },
];

const SceneProof: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(120, 12);

  const numberT = useCinematicTextReveal(8, 20, 10);
  const labelT = useCinematicTextReveal(22, 16, 6);
  const dividerW = usePremiumWipe(36, 28);
  const subT = useCinematicTextReveal(42, 14, 5);
  const quoteT = useCinematicTextReveal(80, 12, 5);

  // Background glow blooms left as content is left-dominant
  const glowT = easeOut3(clamp(frame / 40, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bgDeep }} />

      {/* Glow — left-anchored since content is left-heavy */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 1100px 800px at 32% 50%,
            rgba(79,70,229,${0.055 * glowT}) 0%, transparent 65%)`,
        }}
      />

      {/* Large content block — left aligned, fills the left two-thirds */}
      <div
        style={{
          position: "absolute",
          left: 160,
          right: "50%",
          top: "50%",
          transform: "translateY(-50%)",
          paddingRight: 80,
        }}
      >
        {/* Giant number */}
        <div
          style={{
            fontSize: 200,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.primary,
            letterSpacing: -10,
            lineHeight: 0.82,
            opacity: numberT.opacity,
            transform: `translateY(${numberT.translateY}px)`,
            filter: `blur(${numberT.blur}px)`,
            marginBottom: 0,
          }}
        >
          47k
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 800,
            fontFamily: SANS,
            color: C.text,
            letterSpacing: -2,
            lineHeight: 0.95,
            opacity: labelT.opacity,
            transform: `translateY(${labelT.translateY}px)`,
            filter: `blur(${labelT.blur}px)`,
            marginBottom: 36,
          }}
        >
          teams shipping
          <br />
          <span style={{ color: C.primary }}>faster.</span>
        </div>

        {/* Accent rule */}
        <div
          style={{
            width: `${dividerW}%`,
            maxWidth: 280,
            height: 3,
            background: `linear-gradient(90deg, ${C.primary}, rgba(79,70,229,0.2))`,
            borderRadius: 2,
            marginBottom: 28,
          }}
        />

        {/* Sub copy */}
        <div
          style={{
            fontSize: 20,
            color: C.body,
            fontFamily: SANS,
            lineHeight: 1.65,
            maxWidth: 440,
            opacity: subT.opacity,
            transform: `translateY(${subT.translateY}px)`,
          }}
        >
          Trusted by high-performing teams across product, design,
          and engineering.
        </div>
      </div>

      {/* Right half — logos + testimonial */}
      <div
        style={{
          position: "absolute",
          left: "54%",
          right: 140,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        {/* Logo chips — staggered */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginBottom: 40,
          }}
        >
          {LOGOS.map((logo, i) => {
            const startF = 50 + i * 14;
            const t = easeOut4(clamp((frame - startF) / 20, 0, 1));
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: C.surface,
                  border: `1.5px solid ${C.border}`,
                  borderRadius: 16,
                  padding: "16px 22px",
                  boxShadow: "0 2px 12px rgba(22,33,62,0.06)",
                  opacity: clamp(t / 0.3, 0, 1),
                  transform: `translateX(${(1 - t) * 50}px)`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: `${logo.color}14`,
                    border: `2px solid ${logo.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 800,
                    color: logo.color,
                    fontFamily: SANS,
                    flexShrink: 0,
                  }}
                >
                  {logo.initials}
                </div>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: SANS,
                  }}
                >
                  {logo.name}
                </span>
                <div
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.green,
                    background: `${C.green}12`,
                    borderRadius: 100,
                    padding: "3px 10px",
                  }}
                >
                  ✓ Verified
                </div>
              </div>
            );
          })}
        </div>

        {/* Quote chip */}
        <div
          style={{
            background: `rgba(79,70,229,0.06)`,
            border: `1.5px solid rgba(79,70,229,0.18)`,
            borderRadius: 20,
            padding: "22px 28px",
            opacity: quoteT.opacity,
            transform: `translateY(${quoteT.translateY}px)`,
          }}
        >
          <div
            style={{
              fontSize: 17,
              color: C.text,
              fontFamily: SANS,
              lineHeight: 1.65,
              marginBottom: 16,
              fontStyle: "italic",
            }}
          >
            "Arcflow changed how we think about delivery. We shipped our last
            three releases ahead of schedule."
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.primary,
              fontFamily: SANS,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            James K. — Head of Product, Meridian
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA (frames 460–600, 4.7s)
//
// Dark navy close. Restrained, premium, trustworthy.
// The tone shift (light → dark) signals resolution and confidence.
//
// Premium principle: "The finished ad feels calm, precise, and trustworthy."
// ═══════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(140, 12);

  const bgT = easeOut3(clamp(frame / 24, 0, 1));
  const badgeT = useCinematicTextReveal(10, 14, 5);
  const line1 = useCinematicTextReveal(22, 18, 7);
  const line2 = useCinematicTextReveal(34, 18, 7);
  const sub = useCinematicTextReveal(52, 14, 5);
  const wipe = usePremiumWipe(60, 26);
  const btnT = useSoftScaleIn(76, 0.88, 24);
  const urlT = useCinematicTextReveal(100, 10, 4);

  const glow = useBreathingGlow(100, 0.55, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {/* Background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(155deg, ${C.dark} 0%, ${C.darkCTA} 100%)`,
          opacity: bgT,
        }}
      />

      {/* Dot texture */}
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Central breathing glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "45%",
          transform: "translate(-50%, -50%)",
          width: 1100,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(79,70,229,${0.10 * glow}) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 160px",
        }}
      >
        {/* Free tier badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: "rgba(255,255,255,0.08)",
            border: "1.5px solid rgba(255,255,255,0.16)",
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 44,
            opacity: badgeT.opacity,
            transform: `translateY(${badgeT.translateY}px)`,
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: C.green,
              boxShadow: `0 0 8px ${C.green}`,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "rgba(255,255,255,0.80)",
              fontFamily: SANS,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
            }}
          >
            Free plan · No credit card
          </span>
        </div>

        {/* Headline */}
        {[
          { text: "Start for free.", t: line1, color: "white" },
          { text: "Ship faster.", t: line2, color: `rgba(79,70,229,0.85)` },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 110,
              fontWeight: 900,
              fontFamily: SANS,
              color: l.color,
              letterSpacing: -5,
              lineHeight: 0.88,
              opacity: l.t.opacity,
              transform: `translateY(${l.t.translateY}px)`,
              filter: `blur(${l.t.blur}px)`,
            }}
          >
            {l.text}
          </div>
        ))}

        {/* Accent rule */}
        <div
          style={{
            marginTop: 40,
            width: `${wipe}%`,
            maxWidth: 340,
            height: 3,
            background: `linear-gradient(90deg, ${C.primary}, rgba(79,70,229,0.2))`,
            borderRadius: 2,
            marginBottom: 30,
          }}
        />

        {/* Sub copy */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.50)",
            fontFamily: SANS,
            lineHeight: 1.65,
            marginBottom: 52,
            maxWidth: 560,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Instant setup. No credit card. Cancel anytime.
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${btnT})`,
            transformOrigin: "left center",
            display: "inline-block",
            marginBottom: 48,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: "white",
              borderRadius: 18,
              padding: "20px 44px",
              boxShadow: "0 16px 52px rgba(0,0,0,0.30)",
            }}
          >
            <span
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: C.primary,
                fontFamily: SANS,
              }}
            >
              Get started free
            </span>
            <span style={{ fontSize: 20, color: C.primary, fontWeight: 700 }}>
              →
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.28)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
            opacity: urlT.opacity,
          }}
        >
          arcflow.io
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const ArcflowAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={100}><SceneHook     /></Sequence>
    <Sequence from={100} durationInFrames={120}><SceneHeroDemo /></Sequence>
    <Sequence from={220} durationInFrames={120}><SceneFeatures /></Sequence>
    <Sequence from={340} durationInFrames={120}><SceneProof    /></Sequence>
    <Sequence from={460} durationInFrames={140}><SceneCTA      /></Sequence>
  </AbsoluteFill>
);
