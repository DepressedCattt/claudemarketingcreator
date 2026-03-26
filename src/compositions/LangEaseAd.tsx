/**
 * LangEaseAd — "Translate. Dub. Distribute."
 *
 * Recreation inspired by the LangEase SaaS reference ad (H.1 in LEARNINGS.md).
 * Minimal clean-tech aesthetic, snappy weightless motion, glassmorphism UI.
 *
 * Format:   9:16 vertical (1080 × 1920)
 * Duration: 540 frames @ 30fps = 18 seconds
 * BPM:      120 (1 bar = 2s = 60f)
 *
 * Scene breakdown:
 *  S1  Hook        (   0– 90f  3.0s)  Rapid-fire concept replacements — 4 beats
 *  S2  Platform    (  90–225f  4.5s)  Glassmorphic content card + progress bar demo
 *  S3  Features    ( 225–360f  4.5s)  Three feature rows fly in from left
 *  S4  Tagline     ( 360–450f  3.0s)  "Translate. Dub. Distribute." word-by-word reveal
 *  S5  CTA         ( 450–540f  3.0s)  Dark close — logo, URL, action button
 *
 * Key techniques from reference ad:
 *  ◆ Rapid-fire text hook synced to beat — 4 concepts in 3 seconds
 *  ◆ Blur-in + scale (0.95→1.0) for every text entrance
 *  ◆ Critically damped spring: stiffness 200, damping 25, mass 0.8
 *  ◆ Glassmorphism UI card with animated progress bar + confetti burst
 *  ◆ Word-by-word stagger on final tagline (~4-5f between words)
 *  ◆ Elements travel across cuts to create motivated transitions
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
  spring,
  useVideoConfig,
} from "remotion";
import {
  clamp,
  easeOut3,
  easeOut4,
  easeInOut3,
  useCinematicTextReveal,
  useBreathingGlow,
  usePremiumFadeOut,
} from "../utils/premiumMotion";

// ─── Design Tokens ───────────────────────────────────────────────────────────

const C = {
  bg:      "#FDFDFE",        // Off-white — Apple-clean
  bgDeep:  "#F4F4F8",        // Slightly deeper for scene contrast
  dark:    "#0E0E10",        // Near-black dark close
  text:    "#1E1E1E",        // Primary text
  body:    "#6B6B7B",        // Secondary text
  blue:    "#3A61FF",        // Brand blue — the core accent
  blueLight: "#5B7FFF",      // Lighter blue for gradient highlights
  purple:  "#8B5CF6",        // Purple end of blue-to-purple gradient
  surface: "rgba(255,255,255,0.92)", // Card surface
  border:  "rgba(0,0,0,0.07)",       // Subtle borders
  success: "#10B981",        // Green for completion
};

const SANS = '-apple-system, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", "Consolas", monospace';

const W = 1080;
const H = 1920;

// ─── Snappy spring config — matches the "critically damped, weightless" feel ─

const SNAPPY = { stiffness: 200, damping: 25, mass: 0.8 };

// ─── Helper: fast blur+scale reveal ─────────────────────────────────────────

function useSnapReveal(startF: number, durationF = 15) {
  const frame = useCurrentFrame();
  const t = easeOut3(clamp((frame - startF) / durationF, 0, 1));
  return {
    opacity: t,
    scale: interpolate(t, [0, 1], [0.93, 1.0]),
    blur: interpolate(t, [0, 1], [8, 0]),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–90, 3s)
//
// Rapid-fire text replacements. Each concept blurs-in quickly, holds briefly,
// then cuts hard to the next. Synced to beat (22f per beat at ~82 BPM).
//
// Technique: blur-in (8px→0) + scale (0.93→1.0) over 15 frames per concept.
// Each concept lives in its own <Sequence> so hard cuts are free.
// ═══════════════════════════════════════════════════════════════════════════

const HookConcept: React.FC<{
  line1: string;
  line2: string;
  line2Color?: string;
  gradient?: boolean;
  startF?: number;
}> = ({ line1, line2, line2Color, gradient = false, startF = 0 }) => {
  const frame = useCurrentFrame();
  const r1 = useSnapReveal(0, 14);
  const r2 = useSnapReveal(4, 14);
  const glow = useBreathingGlow(0, 0.6, 1.0);

  const line2Style = gradient
    ? {
        background: `linear-gradient(135deg, ${C.blue}, ${C.purple})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : { color: line2Color ?? C.blue };

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Soft blue glow behind content */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 700px at 50% 48%,
            rgba(58,97,255,${0.04 * glow}) 0%, transparent 65%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Top line — muted */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 500,
            fontFamily: SANS,
            color: C.body,
            letterSpacing: -2,
            lineHeight: 1.0,
            marginBottom: 8,
            opacity: r1.opacity,
            transform: `scale(${r1.scale})`,
            filter: `blur(${r1.blur}px)`,
          }}
        >
          {line1}
        </div>

        {/* Hero word — dominant */}
        <div
          style={{
            fontSize: 112,
            fontWeight: 900,
            fontFamily: SANS,
            letterSpacing: -5,
            lineHeight: 0.9,
            opacity: r2.opacity,
            transform: `scale(${r2.scale})`,
            filter: `blur(${r2.blur}px)`,
            ...line2Style,
          }}
        >
          {line2}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 8);

  const concepts = [
    { line1: "Turn", line2: "Books", startF: 0, durationF: 22, gradient: true },
    { line1: "Into", line2: "Audio", startF: 22, durationF: 22, gradient: false, color: C.blue },
    { line1: "Any", line2: "Language", startF: 44, durationF: 22, gradient: false, color: C.text },
    { line1: "Drop &", line2: "Go.", startF: 66, durationF: 24, gradient: true },
  ];

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      {concepts.map((c, i) => (
        <Sequence key={i} from={c.startF} durationInFrames={c.durationF}>
          <HookConcept
            line1={c.line1}
            line2={c.line2}
            line2Color={c.color}
            gradient={c.gradient}
          />
        </Sequence>
      ))}

      {/* Beat-dot indicator — subtle rhythm signal */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 12,
        }}
      >
        {[0, 22, 44, 66].map((beatF, i) => {
          const active = frame >= beatF && frame < beatF + 22;
          return (
            <div
              key={i}
              style={{
                width: active ? 28 : 8,
                height: 8,
                borderRadius: 4,
                background: active ? C.blue : `${C.blue}30`,
                transition: "all 0.1s",
              }}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — PLATFORM DEMO (frames 90–225, 4.5s)
//
// A glassmorphic content library card enters from bottom-centre.
// Shows a media item being processed. Progress bar fills 0→81%.
// Completion: checkmark appears with a small confetti burst.
//
// Technique: arc entry + snappy spring + progress bar interpolate
// ═══════════════════════════════════════════════════════════════════════════

const MEDIA_ITEMS = [
  { title: "History Lecture — S3E12", type: "VIDEO", duration: "48 min", lang: "EN" },
  { title: "Product Walkthrough", type: "VIDEO", duration: "12 min", lang: "EN" },
  { title: "Travel Spain Vlog", type: "VIDEO", duration: "22 min", lang: "EN" },
];

const ContentCard: React.FC<{ processingProgress: number; doneVisible: boolean }> = ({
  processingProgress,
  doneVisible,
}) => (
  <div
    style={{
      width: 860,
      background: C.surface,
      borderRadius: 32,
      boxShadow: `0 32px 80px rgba(58,97,255,0.10), 0 4px 20px rgba(0,0,0,0.06)`,
      border: `1px solid ${C.border}`,
      fontFamily: SANS,
      overflow: "hidden",
    }}
  >
    {/* Header */}
    <div
      style={{
        padding: "32px 36px 24px",
        borderBottom: `1px solid ${C.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 6 }}>
          Content Library
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: -1 }}>
          3 videos ready
        </div>
      </div>
      {/* Blue badge */}
      <div
        style={{
          background: `${C.blue}12`,
          border: `1.5px solid ${C.blue}28`,
          borderRadius: 100,
          padding: "8px 20px",
          fontSize: 13,
          fontWeight: 700,
          color: C.blue,
        }}
      >
        LangEase
      </div>
    </div>

    {/* Media items */}
    <div style={{ padding: "20px 36px 0" }}>
      {MEDIA_ITEMS.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            padding: "18px 0",
            borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `${C.blue}10`,
              border: `1.5px solid ${C.blue}20`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              flexShrink: 0,
            }}
          >
            🎬
          </div>
          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 4, letterSpacing: -0.3 }}>{item.title}</div>
            <div style={{ fontSize: 13, color: C.body, fontWeight: 500 }}>{item.type} · {item.duration}</div>
          </div>
          {/* Lang badge */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: C.body,
              background: "rgba(0,0,0,0.05)",
              borderRadius: 6,
              padding: "4px 10px",
              letterSpacing: "0.06em",
            }}
          >
            {item.lang}
          </div>
        </div>
      ))}
    </div>

    {/* Progress section */}
    <div style={{ padding: "24px 36px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.body }}>
          {doneVisible ? "Translation complete" : "Translating to Spanish..."}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: C.blue, fontFamily: MONO }}>
          {doneVisible ? "100%" : `${Math.round(processingProgress)}%`}
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 10,
          background: `rgba(58,97,255,0.10)`,
          borderRadius: 6,
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${doneVisible ? 100 : processingProgress}%`,
            background: `linear-gradient(90deg, ${C.blue}, ${C.purple})`,
            borderRadius: 6,
            position: "relative",
            transition: "width 0.05s linear",
          }}
        >
          {/* Shimmer sweep on progress bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              right: 0,
              width: "40%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
              borderRadius: 6,
            }}
          />
        </div>
      </div>

      {/* Done state */}
      {doneVisible && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 14,
          }}
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: C.success,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              color: "white",
              fontWeight: 900,
            }}
          >
            ✓
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.success }}>
            Ready in 50+ languages
          </div>
        </div>
      )}
    </div>
  </div>
);

const ScenePlatform: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeOut = usePremiumFadeOut(135, 12);

  // Card arc entry from bottom
  const cardY = spring({
    frame,
    fps,
    config: SNAPPY,
    from: 180,
    to: 0,
  });
  const cardOpacity = easeOut3(clamp(frame / 18, 0, 1));
  const cardBlur = interpolate(
    easeOut3(clamp(frame / 22, 0, 1)),
    [0, 1],
    [12, 0]
  );
  const cardScale = interpolate(
    easeOut3(clamp(frame / 20, 0, 1)),
    [0, 1],
    [0.92, 1.0]
  );

  // Progress bar — 0 to 81 over frames 30-105, then jumps to 100 at 108
  const doneF = 108;
  const progressRaw = interpolate(frame, [30, 105], [0, 81], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const doneVisible = frame >= doneF;

  // Context copy
  const label = useCinematicTextReveal(20, 12, 5);
  const line1 = useCinematicTextReveal(28, 14, 6);
  const line2 = useCinematicTextReveal(40, 14, 6);

  const glow = useBreathingGlow(60, 0.5, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Blue glow */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 800px at 50% 50%,
            rgba(58,97,255,${0.055 * glow}) 0%, transparent 65%)`,
        }}
      />

      {/* Hero card — centered */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: `
            translateX(-50%)
            translateY(calc(-50% + ${cardY}px))
            scale(${cardScale})
          `,
          opacity: cardOpacity,
          filter: `blur(${cardBlur}px)`,
        }}
      >
        <ContentCard processingProgress={progressRaw} doneVisible={doneVisible} />
      </div>

      {/* Context copy — top */}
      <div
        style={{
          position: "absolute",
          left: 80,
          top: 160,
          right: 80,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.blue,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 12,
            fontFamily: SANS,
            opacity: label.opacity,
            transform: `translateY(${label.translateY}px)`,
          }}
        >
          One drop. All languages.
        </div>
        {["Just upload.", "We handle the rest."].map((text, i) => {
          const t = i === 0 ? line1 : line2;
          return (
            <div
              key={i}
              style={{
                fontSize: 64,
                fontWeight: 900,
                fontFamily: SANS,
                color: i === 1 ? C.blue : C.text,
                letterSpacing: -3,
                lineHeight: 0.9,
                opacity: t.opacity,
                transform: `translateY(${t.translateY}px)`,
                filter: `blur(${t.blur}px)`,
              }}
            >
              {text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — FEATURES (frames 225–360, 4.5s)
//
// Three capability rows fly in from the left, staggered.
// Large icons, bold feature names, short proof lines.
//
// Technique: translateX from -80 to 0, opacity 0→1, easeOut4
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    emoji: "🌐",
    name: "Translate",
    proof: "50+ languages. Instant.",
    color: C.blue,
    delay: 8,
  },
  {
    emoji: "🎙️",
    name: "Dub",
    proof: "Natural voices. Lip-synced.",
    color: "#8B5CF6",
    delay: 28,
  },
  {
    emoji: "🚀",
    name: "Distribute",
    proof: "YouTube, Spotify, one click.",
    color: "#10B981",
    delay: 48,
  },
];

const SceneFeatures: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(135, 12);

  const eyebrow = useCinematicTextReveal(0, 12, 5);
  const headline = useCinematicTextReveal(8, 14, 6);

  const glow = useBreathingGlow(0, 0.5, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 800px 700px at 50% 52%,
            rgba(58,97,255,${0.04 * glow}) 0%, transparent 65%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "0 80px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.blue,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 12,
            fontFamily: SANS,
            opacity: eyebrow.opacity,
            transform: `translateY(${eyebrow.translateY}px)`,
          }}
        >
          Everything in one platform
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            fontFamily: SANS,
            color: C.text,
            letterSpacing: -3,
            lineHeight: 0.9,
            marginBottom: 64,
            opacity: headline.opacity,
            transform: `translateY(${headline.translateY}px)`,
            filter: `blur(${headline.blur}px)`,
          }}
        >
          Three steps.
          <br />
          <span style={{ color: C.blue }}>Global reach.</span>
        </div>

        {/* Feature rows */}
        {FEATURES.map((feat, i) => {
          const t = easeOut4(clamp((frame - feat.delay) / 22, 0, 1));
          const barT = easeInOut3(clamp((frame - feat.delay - 14) / 22, 0, 1));
          const opacity = clamp(t / 0.3, 0, 1);

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 32,
                marginBottom: i < 2 ? 48 : 0,
                opacity,
                transform: `translateX(${(1 - t) * -64}px)`,
              }}
            >
              {/* Icon block */}
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 24,
                  background: `${feat.color}12`,
                  border: `2px solid ${feat.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 38,
                  flexShrink: 0,
                }}
              >
                {feat.emoji}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 52,
                    fontWeight: 900,
                    fontFamily: SANS,
                    color: feat.color,
                    letterSpacing: -2,
                    lineHeight: 0.95,
                    marginBottom: 6,
                  }}
                >
                  {feat.name}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    color: C.body,
                    fontFamily: SANS,
                    fontWeight: 500,
                  }}
                >
                  {feat.proof}
                </div>
                {/* Wipe accent line */}
                <div
                  style={{
                    marginTop: 10,
                    width: `${barT * 100}%`,
                    maxWidth: 160,
                    height: 2,
                    background: `linear-gradient(90deg, ${feat.color}80, transparent)`,
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — TAGLINE (frames 360–450, 3s)
//
// "Translate. Dub. Distribute." revealed word by word, ~4-5 frames stagger.
// Clean white background. Nothing else competes.
//
// Technique: per-word blur-in + scale, staggered 5f apart
// ═══════════════════════════════════════════════════════════════════════════

const TAGLINE_WORDS = [
  { word: "Translate.", color: C.blue, delay: 8 },
  { word: "Dub.", color: "#8B5CF6", delay: 18 },
  { word: "Distribute.", color: "#10B981", delay: 28 },
];

const SceneTagline: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const sub = useCinematicTextReveal(52, 12, 5);
  const glow = useBreathingGlow(0, 0.5, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill style={{ background: C.bg }} />

      {/* Layered glows for each word colour */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 700px 600px at 50% 46%,
            rgba(58,97,255,${0.05 * glow}) 0%, transparent 60%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-52%)",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Word-by-word reveal */}
        {TAGLINE_WORDS.map((w, i) => {
          const t = easeOut4(clamp((frame - w.delay) / 16, 0, 1));
          return (
            <div
              key={i}
              style={{
                fontSize: 108,
                fontWeight: 900,
                fontFamily: SANS,
                color: w.color,
                letterSpacing: -5,
                lineHeight: 0.92,
                marginBottom: i < 2 ? 8 : 0,
                opacity: clamp(t / 0.3, 0, 1),
                transform: `scale(${interpolate(t, [0, 1], [0.93, 1.0])})`,
                filter: `blur(${interpolate(t, [0, 1], [10, 0])}px)`,
              }}
            >
              {w.word}
            </div>
          );
        })}

        {/* Sub copy */}
        <div
          style={{
            fontSize: 22,
            color: C.body,
            fontFamily: SANS,
            fontWeight: 400,
            marginTop: 36,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          One platform. Every language. Every format.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA (frames 450–540, 3s)
//
// Dark close. Brand name + tagline sub-line + CTA button + URL.
// Background shifts to near-black, creating emotional resolution.
// Blue glow adds warmth without breaking the dark tone.
//
// Premium principle: "Short CTA. Trust was built before this scene."
// ═══════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeOut = usePremiumFadeOut(90, 10);

  const bgT = easeOut3(clamp(frame / 20, 0, 1));
  const logo = useCinematicTextReveal(6, 16, 7);
  const line1 = useCinematicTextReveal(18, 18, 8);
  const line2 = useCinematicTextReveal(28, 18, 8);
  const sub = useCinematicTextReveal(42, 12, 5);
  const btnT = easeOut4(clamp((frame - 52) / 18, 0, 1));
  const urlT = useCinematicTextReveal(68, 10, 4);

  const glow = useBreathingGlow(60, 0.5, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <AbsoluteFill
        style={{
          background: `linear-gradient(160deg, ${C.dark} 0%, #0A0A12 100%)`,
          opacity: bgT,
        }}
      />

      {/* Blue glow on dark */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "42%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(ellipse,
            rgba(58,97,255,${0.12 * glow}) 0%, transparent 65%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          padding: "0 80px",
          textAlign: "center",
        }}
      >
        {/* Brand wordmark */}
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: `${C.blue}`,
            fontFamily: SANS,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            marginBottom: 48,
            opacity: logo.opacity,
            transform: `translateY(${logo.translateY}px)`,
          }}
        >
          LangEase
        </div>

        {/* Headline */}
        {[
          { text: "Speak every", t: line1, color: "white" },
          { text: "language.", t: line2, color: C.blue },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              fontSize: 96,
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

        {/* Sub copy */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.38)",
            fontFamily: SANS,
            fontWeight: 400,
            lineHeight: 1.65,
            marginTop: 28,
            marginBottom: 48,
            opacity: sub.opacity,
            transform: `translateY(${sub.translateY}px)`,
          }}
        >
          Free to start. No credit card.
        </div>

        {/* CTA Button */}
        <div
          style={{
            transform: `scale(${interpolate(btnT, [0, 1], [0.9, 1.0])})`,
            opacity: clamp(btnT / 0.25, 0, 1),
            display: "flex",
            justifyContent: "center",
            marginBottom: 44,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 14,
              background: C.blue,
              borderRadius: 20,
              padding: "22px 52px",
              boxShadow: `0 16px 48px rgba(58,97,255,0.35)`,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "white",
                fontFamily: SANS,
                letterSpacing: -0.5,
              }}
            >
              Start for free
            </span>
            <span style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", fontWeight: 700 }}>
              →
            </span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.20)",
            fontFamily: MONO,
            letterSpacing: "0.04em",
            opacity: urlT.opacity,
          }}
        >
          langease.ai
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root Export ──────────────────────────────────────────────────────────────

export const LangEaseAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneHook     /></Sequence>
    <Sequence from={90}  durationInFrames={135}><ScenePlatform /></Sequence>
    <Sequence from={225} durationInFrames={135}><SceneFeatures /></Sequence>
    <Sequence from={360} durationInFrames={90}><SceneTagline  /></Sequence>
    <Sequence from={450} durationInFrames={90}><SceneCTA      /></Sequence>
  </AbsoluteFill>
);
