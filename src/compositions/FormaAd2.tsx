/**
 * FormaAd2 — "Design at the speed of shipping."
 *
 * Placeholder ad for Forma, an enterprise design-system platform.
 * Canvas: 1080 × 1080 (1:1 square). Duration: 519 frames @ 30fps ≈ 17.3s.
 *
 * ─── NOVEL TRANSITION ARCHITECTURE ──────────────────────────────────────────
 *
 *  S1 → S2 │ HEADLINE SCATTER (novel)
 *    Three headline lines exit simultaneously in THREE DIFFERENT directions.
 *    • Line 1 ("Design at")    → slides upper-left  (dx -130, dy -140)
 *    • Line 2 ("the speed")    → straight up         (dx  -20, dy -160)
 *    • Line 3 ("of shipping.") → slides lower-right  (dx +120, dy +130)
 *    The diverging velocity vectors create an explosion — not a push.
 *    S1's cream bg also fades to transparent, revealing S2's dark bg below.
 *    z-index: S1=5 — S2's dark bg shows through S1's transparent bg
 *    while fragments are still mid-flight.
 *
 *  S2 → S3 │ VERTICAL PUSH RHYTHM
 *    Card exits UPWARD (translateY 0 → -1200). S3's full-canvas feature
 *    rows enter from BELOW (all rows start at translateY +80, settle to 0).
 *    Consistent upward direction — the outgoing motion defines the incoming.
 *    S3 starts at root 217 (the exact frame the card clears the canvas top).
 *    S2's ambient glow expands LINEARLY throughout S2, arriving at S3's exact
 *    glow size (900×700px, 5% opacity) at the handoff frame — zero discontinuity.
 *
 *  S3 → S4 │ ELEMENT ACTIVATION (novel)
 *    The two divider lines between S3's feature rows are quiet all scene
 *    (height: 1px, opacity: 0–0.08 — fade in softly over first 20 frames).
 *    At S3 local frame 88: they ACTIVATE — opacity → 1.0, height → 3px,
 *    color: white → cyan (#06B6D4). They announce themselves.
 *    S4 starts with identical dividers (cyan, 3px, full opacity) at Y=360, 720.
 *
 *  S4 → S5 │ TYPOGRAPHY FLOOD (novel)
 *    "12K" (the middle row metric, centred at canvas centre Y=540) scales
 *    continuously from local frame 79 onward with no upper clamp — linear growth,
 *    no deceleration, always accelerating. Blur grows with scale (motion blur).
 *    Cream bg stays cream throughout S4 (dark-on-cream = always opaque).
 *    S5's dark bg fades in over 14 frames, covering everything.
 *
 * ─── CANVAS MATH ─────────────────────────────────────────────────────────────
 *
 *  Canvas: 1080 × 1080. Centre: 540 × 540.
 *
 *  S3 / S4 row structure (3 rows × 360px each):
 *    Row 1: Y 0–360,   centre at Y 180
 *    Row 2: Y 360–720, centre at Y 540 (= canvas centre — flood source ✓)
 *    Row 3: Y 720–1080,centre at Y 900
 *    Dividers: Y=360 and Y=720 (shared between S3 and S4 ✓)
 *
 *  Sequence overlaps and z-indices:
 *    S1 (0–112,  z=5)  ← on top during S1→S2 scatter
 *    S2 (90–252, z=4)
 *    S3 (217–345,z=3)  ← starts the moment S2's card clears the canvas top
 *    S4 (331–443,z=2)
 *    S5 (427–519,z=1)
 */

import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import {
  PREMIUM_SPRING,
  clamp,
  easeOut3,
  easeOut4,
  easeOut5,
  easeInOut3,
  useCinematicTextReveal,
  useBlurResolve,
  useArcEntry,
  useHeroFloatDelayed,
  useSoftScaleIn,
  usePremiumWipe,
  useBreathingGlow,
  usePremiumFadeOut,
} from "../utils/premiumMotion";

// ─── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        "#F6F4EF",               // warm cream
  dark:      "#0B0F1E",               // deep dark navy
  darkDeep:  "#070A14",
  cyan:      "#06B6D4",               // primary accent
  cyanLight: "#A5F3FC",
  teal:      "#0D9488",
  surface:   "#141C2E",               // card surface
  text:      "#0B0F1E",
  body:      "#64748B",
  border:    "#E2E8F0",
  dimBorder: "rgba(255,255,255,0.08)",
};

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// ─── Camera ────────────────────────────────────────────────────────────────────
function useCameraTransform(totalFrames: number) {
  const frame = useCurrentFrame();
  const zoom  = 1.0 + (frame / totalFrames) * 0.050;
  const panX  = interpolate(frame, [0, totalFrames], [6, -5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY  = interpolate(frame, [0, totalFrames], [4, -3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const roll  = interpolate(frame, [0, 80, 240, totalFrames], [-0.4, -0.1, 0.1, 0.25], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return `scale(${zoom}) rotateZ(${roll}deg) translateX(${panX}px) translateY(${panY}px)`;
}

// ─── UI Preview Card (for S2) ─────────────────────────────────────────────────
const TREE_ITEMS = [
  { name: "Button",  active: true  },
  { name: "Input",   active: false },
  { name: "Badge",   active: false },
  { name: "Modal",   active: false },
  { name: "Tooltip", active: false },
];

const UiPreviewCard: React.FC = () => (
  <div
    style={{
      width: 460,
      background: C.surface,
      borderRadius: 22,
      overflow: "hidden",
      // 0-offset ambient cyan halo — no downward band that reads as a border stripe
      boxShadow: `0 0 80px rgba(6,182,212,0.10),
                  0 8px 24px rgba(0,0,0,0.35)`,
      fontFamily: SANS,
    }}
  >
    {/* Title bar */}
    <div
      style={{
        height: 40,
        background: "#0D1424",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 8,
        borderBottom: `1px solid ${C.dimBorder}`,
      }}
    >
      {["#FF5F57", "#FFBD2E", "#27C93F"].map((c, i) => (
        <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
      ))}
      <span style={{ fontSize: 11, color: "#4B5563", fontFamily: MONO, marginLeft: 8, letterSpacing: "0.05em" }}>
        forma / components / Button
      </span>
    </div>

    {/* Body */}
    <div style={{ display: "flex", height: 280 }}>
      {/* Sidebar */}
      <div
        style={{
          width: 140,
          borderRight: `1px solid ${C.dimBorder}`,
          padding: "14px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {TREE_ITEMS.map((item, i) => (
          <div
            key={i}
            style={{
              fontSize: 11,
              fontFamily: MONO,
              color: item.active ? C.cyan : "#4B5563",
              background: item.active ? `${C.cyan}14` : "transparent",
              borderRadius: 6,
              padding: "5px 8px",
              letterSpacing: "0.02em",
            }}
          >
            {item.name}
          </div>
        ))}
      </div>

      {/* Preview panel */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: "0 28px",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {[
            { label: "Primary",   bg: C.cyan,                  color: C.dark,   border: "none" },
            { label: "Secondary", bg: "transparent",            color: "#9CA3AF", border: `1.5px solid #374151` },
            { label: "Disabled",  bg: "rgba(255,255,255,0.04)", color: "#374151", border: "none" },
          ].map(({ label, bg, color, border }, i) => (
            <div
              key={i}
              style={{
                padding: "9px 18px",
                background: bg,
                border,
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                color,
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, fontFamily: MONO, color: "#374151", letterSpacing: "0.06em" }}>
          variant="primary"  size="md"  state="default"
        </div>
      </div>
    </div>

    {/* Status bar */}
    <div
      style={{
        height: 32,
        background: "#0D1424",
        borderTop: `1px solid ${C.dimBorder}`,
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#27C93F" }} />
        <span style={{ fontSize: 10, color: "#4B5563", fontFamily: MONO }}>3 variants · 4 sizes</span>
      </div>
      <span style={{ fontSize: 10, color: "#2D3748", fontFamily: MONO, marginLeft: "auto" }}>v2.4.1</span>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK (frames 0–112, 3.7s)
// ═══════════════════════════════════════════════════════════════════════════

const SCATTER_LINES: Array<{ text: string; dx: number; dy: number }> = [
  { text: "Design at",    dx: -130, dy: -140 },
  { text: "the speed",    dx:  -20, dy: -160 },
  { text: "of shipping.", dx:  120, dy:  130 },
];

const SceneHook: React.FC<{ cam: string }> = ({ cam }) => {
  const frame = useCurrentFrame();
  const TOTAL = 112;

  const badge = useCinematicTextReveal(0,  14, 5);
  const sub   = useCinematicTextReveal(44, 14, 5);
  const wipe  = usePremiumWipe(50, 26);
  const bgT   = easeOut3(clamp(frame / 18, 0, 1));

  // Rules of Hooks: pre-compute all three reveals outside .map()
  const enter0 = useCinematicTextReveal(8,  22, 9);
  const enter1 = useCinematicTextReveal(22, 22, 9);
  const enter2 = useCinematicTextReveal(36, 22, 9);
  const enters = [enter0, enter1, enter2];

  const SCATTER_START = 80;
  const SCATTER_DUR   = 14;

  const bgFadeOut = 1 - easeOut4(clamp((frame - SCATTER_START) / SCATTER_DUR, 0, 1));

  return (
    <AbsoluteFill>
      {/* Cream bg — fades to transparent during scatter, revealing S2's dark bg */}
      <AbsoluteFill
        style={{
          background: C.bg,
          opacity: bgFadeOut,
          transform: cam,
          transformOrigin: "center center",
        }}
      />

      {/* Warm radial ambient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 900px 800px at 50% 42%,
            rgba(6,182,212,0.06) 0%, transparent 68%)`,
          opacity: bgT * bgFadeOut,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          transform: `translateY(-50%)`,
          padding: "0 88px",
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: `${C.cyan}0E`,
            border: `1.5px solid ${C.cyan}20`,
            borderRadius: 100,
            padding: "8px 22px",
            marginBottom: 44,
            opacity: badge.opacity * bgFadeOut,
            transform: `translateY(${badge.translateY}px)`,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: C.cyan,
              boxShadow: `0 0 10px ${C.cyan}80`,
            }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.cyan,
              fontFamily: SANS,
              letterSpacing: "0.09em",
              textTransform: "uppercase",
            }}
          >
            Forma · Design Systems
          </span>
        </div>

        {/* Scatter headlines */}
        {SCATTER_LINES.map((line, i) => {
          const enter    = enters[i];
          const scatterT = easeOut3(clamp((frame - SCATTER_START) / SCATTER_DUR, 0, 1));

          return (
            <div
              key={i}
              style={{
                fontSize: 112,
                fontWeight: 900,
                fontFamily: SANS,
                color: i === 2 ? C.cyan : C.text,
                letterSpacing: -5,
                lineHeight: 0.95,
                marginBottom: i === 2 ? 0 : 6,
                opacity: enter.opacity * (1 - scatterT * 1.2),
                filter: `blur(${enter.blur + scatterT * 4}px)`,
                transform: `
                  translateX(${scatterT * line.dx}px)
                  translateY(${enter.translateY + scatterT * line.dy}px)
                `,
              }}
            >
              {line.text}
            </div>
          );
        })}

        {/* Accent rule */}
        <div
          style={{
            width: `${wipe}%`,
            maxWidth: 220,
            height: 3,
            background: `linear-gradient(90deg, ${C.cyan}, ${C.cyan}18)`,
            borderRadius: 2,
            marginTop: 36,
            marginBottom: 20,
            opacity: bgFadeOut,
          }}
        />

        {/* Sub */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: C.body,
            fontFamily: SANS,
            lineHeight: 1.5,
            maxWidth: 520,
            opacity: sub.opacity * bgFadeOut,
            transform: `translateY(${sub.translateY}px)`,
            filter: `blur(${sub.blur}px)`,
          }}
        >
          One platform. Every component. Zero drift between design and code.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 2 — PRODUCT HERO (frames 90–252, local 162 frames)
// ═══════════════════════════════════════════════════════════════════════════

const SceneProduct: React.FC<{ cam: string }> = ({ cam }) => {
  const frame = useCurrentFrame();
  const TOTAL  = 162;
  const fadeOut = usePremiumFadeOut(TOTAL, 12);

  const cardArc    = useArcEntry(0, 100, 120, PREMIUM_SPRING.hero);
  const cardBlur   = useBlurResolve(0, 24, 14);
  const cardScale  = useSoftScaleIn(0, 0.88, 28);
  const cardOpacity = easeOut3(clamp(frame / 18, 0, 1));
  const floatY     = useHeroFloatDelayed(38, 5, 84);

  // Ambient glow expands LINEARLY so that at frame 127 (the handoff to S3)
  // it exactly matches S3's steady-state glow: 900×700px at 5% opacity.
  // Frame 0:   400×400px, 13% — tight, bright, focused on card.
  // Frame 127: 900×700px, 5%  — identical to S3's opening glow.
  const HANDOFF = 127;
  const linearT = Math.min(frame / HANDOFF, 1);
  const glowW   = Math.round(400 + linearT * 500);
  const glowH   = Math.round(400 + linearT * 300);
  const glowOp  = (0.13 - linearT * 0.08).toFixed(3);

  // Context labels
  const ctx1 = useCinematicTextReveal(44, 14, 5);
  const ctx2 = useCinematicTextReveal(54, 14, 5);

  // Card exits UPWARD. -1200px ensures center reaches Y=-660 (bottom at -484),
  // completely off the 1080px canvas with no partial-card artifact.
  const UP_START = 120;
  const UP_DUR   = 28;
  const exitUpT  = easeOut4(clamp((frame - UP_START) / UP_DUR, 0, 1));
  const cardExitY = exitUpT * -1200;

  // Context fades out BEFORE the card exits. Starts at local 98, gone by 114.
  const ctxFade = 1 - easeOut3(clamp((frame - 98) / 16, 0, 1));

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", inset: 0, transform: cam, transformOrigin: "center center" }}>
        <AbsoluteFill style={{ background: C.dark }} />

        {/* Ambient cyan glow — expands linearly to match S3 at handoff */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse ${glowW}px ${glowH}px at 50% 50%,
              rgba(6,182,212,${glowOp}) 0%, transparent 65%)`,
          }}
        />

        {/* Hero card */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: `
              translateX(calc(-50% + ${cardArc.translateX}px))
              translateY(calc(-50% + ${cardArc.translateY + floatY + cardExitY}px))
              scale(${cardScale})
            `,
            opacity: cardOpacity,
            filter: `blur(${cardBlur}px)`,
          }}
        >
          <UiPreviewCard />
        </div>

        {/* Context copy */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 92,
            textAlign: "center",
            padding: "0 90px",
            opacity: ctxFade,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.cyanLight,
              fontFamily: SANS,
              textTransform: "uppercase",
              letterSpacing: "0.11em",
              marginBottom: 14,
              opacity: ctx1.opacity,
              transform: `translateY(${ctx1.translateY}px)`,
            }}
          >
            The component library that ships with you
          </div>
          {["Typed. Composable.", "Ready from day one."].map((text, i) => {
            const t = i === 0 ? ctx1 : ctx2;
            return (
              <div
                key={i}
                style={{
                  fontSize: 46,
                  fontWeight: 900,
                  fontFamily: SANS,
                  color: i === 0 ? "white" : C.cyanLight,
                  letterSpacing: -2,
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
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 3 — FEATURES (frames 217–345, local 128 frames)
// ═══════════════════════════════════════════════════════════════════════════

const FEATURES = [
  {
    icon: "⬡",
    title: "Token System",
    body:  "Design tokens that sync from Figma to code in one click. No more copy-pasting hex values.",
    delay: 0,
  },
  {
    icon: "◈",
    title: "Component API",
    body:  "Typed React components with zero-config theming. Drop in and go.",
    delay: 14,
  },
  {
    icon: "✦",
    title: "Live Playground",
    body:  "Test components in isolation. See prop changes in real time. Ship with confidence.",
    delay: 32,
  },
];

const SceneFeatures: React.FC<{ cam: string }> = ({ cam }) => {
  const frame = useCurrentFrame();
  const TOTAL = 128;
  const fadeOut = usePremiumFadeOut(TOTAL, 10);

  // ── ELEMENT ACTIVATION — row dividers ──
  // Phase 1 (0–20f):  fade-in 0 → 0.08 — lines enter softly, not instantly.
  // Phase 2 (20–88f): hold at 0.08 — quiet structural markers.
  // Phase 3 (88–110f): activate 0.08 → 1.0 — transition seed for S3→S4.
  const ACT_START  = 88;
  const ACT_DUR    = 22;
  const actT       = easeOut4(clamp((frame - ACT_START) / ACT_DUR, 0, 1));
  const divFadeIn  = easeOut3(clamp(frame / 20, 0, 1));
  const divQuiet   = 0.08 * divFadeIn;
  const divOpacity = divQuiet + actT * 0.92;
  const divHeight  = 1 + actT * 2;
  const divR = Math.round(255 * (1 - actT) + 6   * actT);
  const divG = Math.round(255 * (1 - actT) + 182  * actT);
  const divB = Math.round(255 * (1 - actT) + 212  * actT);
  const divColor = `rgba(${divR},${divG},${divB},1)`;

  const eyebrow = useCinematicTextReveal(2, 12, 4);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: cam,
          transformOrigin: "center center",
        }}
      >
        {/* Content (inside fadeOut) */}
        <div style={{ position: "absolute", inset: 0, opacity: fadeOut }}>
          <AbsoluteFill style={{ background: C.dark }} />

          {/* Ambient glow — matches S2's handoff state */}
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 900px 700px at 50% 50%,
                rgba(6,182,212,0.05) 0%, transparent 65%)`,
            }}
          />

          {/* Eyebrow */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 26,
              textAlign: "center",
              fontSize: 12,
              fontWeight: 700,
              color: C.cyanLight,
              fontFamily: SANS,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              opacity: eyebrow.opacity,
              transform: `translateY(${eyebrow.translateY}px)`,
            }}
          >
            Why teams choose Forma
          </div>

          {/* Feature rows */}
          {FEATURES.map((feat, i) => {
            const rowTop  = i * 360;
            const t       = easeOut4(clamp((frame - feat.delay) / 26, 0, 1));
            const wipeW   = easeInOut3(clamp((frame - feat.delay - 14) / 20, 0, 1)) * 200;
            const opacity = clamp(t / 0.30, 0, 1);
            const enterY  = (1 - easeOut4(clamp((frame - feat.delay) / 28, 0, 1))) * 80;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: rowTop,
                  height: 360,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 80px",
                  opacity,
                  transform: `translateY(${enterY}px)`,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 15,
                    background: `${C.cyan}18`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    color: C.cyanLight,
                    fontWeight: 900,
                    flexShrink: 0,
                    marginRight: 32,
                  }}
                >
                  {feat.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 800,
                      color: "white",
                      fontFamily: SANS,
                      letterSpacing: -1.5,
                      lineHeight: 1.0,
                      marginBottom: 10,
                    }}
                  >
                    {feat.title}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      color: "rgba(255,255,255,0.40)",
                      fontFamily: SANS,
                      lineHeight: 1.55,
                      maxWidth: 680,
                      marginBottom: 14,
                    }}
                  >
                    {feat.body}
                  </div>
                  <div
                    style={{
                      width: wipeW,
                      height: 2,
                      background: `linear-gradient(90deg, ${C.cyan}60, transparent)`,
                      borderRadius: 1,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Element Activation dividers — outside fadeOut, persist through transition */}
        {[360, 720].map((y, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: y,
              height: divHeight,
              background: divColor,
              opacity: divOpacity,
              pointerEvents: "none",
              boxShadow: actT > 0.2
                ? `0 0 ${actT * 16}px rgba(6,182,212,${actT * 0.45})`
                : "none",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 4 — METRICS (frames 331–443, local 112 frames)
// ═══════════════════════════════════════════════════════════════════════════

const METRICS = [
  { value: "3.2×", label: "faster component shipping", sub: "vs. handmade systems",  row: 0, fontSize: 84,  color: C.cyan    },
  { value: "12K",  label: "teams rely on Forma",        sub: "across 80 countries",   row: 1, fontSize: 148, color: C.text    },
  { value: "98%",  label: "token adoption rate",        sub: "within first sprint",   row: 2, fontSize: 84,  color: "#10B981" },
];

const SceneMetrics: React.FC<{ cam: string }> = ({ cam }) => {
  const frame = useCurrentFrame();
  const TOTAL = 112;
  const fadeOut = usePremiumFadeOut(TOTAL, 8);

  const bgT = easeOut4(clamp((frame - 6) / 24, 0, 1));

  // ── TYPOGRAPHY FLOOD ──
  // floodRaw is NOT upper-clamped — "12K" keeps enlarging past FLOOD_START+FLOOD_DUR.
  // Linear growth = constant velocity = no deceleration, no visible "stop".
  // Frame 79: scale 1. Frame ~88: scale ~18. Frame 96 (S5 starts): scale ~32.
  const FLOOD_START = 79;
  const FLOOD_DUR   = 9;
  const floodRaw    = Math.max(0, (frame - FLOOD_START) / FLOOD_DUR);
  const floodT      = floodRaw;
  const floodScale  = 1 + floodRaw * 17;

  // Cream bg stays cream throughout S4 — dark-navy "12K" on cream is always
  // fully opaque. Only starts fading at frame 96 when S5 covers everything.
  const creamFadeOut = easeOut3(clamp((frame - 96) / 10, 0, 1));
  const creamOpacity = bgT * (1 - creamFadeOut);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", inset: 0, transform: cam, transformOrigin: "center center" }}>
        <AbsoluteFill style={{ background: C.dark }} />
        <AbsoluteFill style={{ background: C.bg, opacity: creamOpacity }} />

        {/* Warm radial glow — fades with cream */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse 900px 900px at 50% 50%,
              rgba(6,182,212,0.04) 0%, transparent 65%)`,
            opacity: creamOpacity,
          }}
        />

        {/* Inherited dividers — match S3's activated state (cyan, 3px) */}
        {[360, 720].map((y) => (
          <div
            key={y}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: y,
              height: 3,
              background: C.cyan,
              opacity: 1.0,
              boxShadow: `0 0 14px rgba(6,182,212,0.40)`,
            }}
          />
        ))}

        {/* Secondary metrics and 12K label — inside fadeOut */}
        <div style={{ opacity: fadeOut }}>
          {METRICS.map((m, i) => {
            if (m.row === 1) return null;

            const rowTop  = m.row * 360;
            const enterT  = easeOut4(clamp((frame - i * 10) / 28, 0, 1));
            const opacity = clamp(enterT / 0.28, 0, 1);
            const enterY  = (1 - enterT) * 40;

            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: rowTop,
                  height: 360,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `translateY(${enterY}px)`,
                  opacity: opacity * (1 - floodT * 1.2),
                }}
              >
                <div
                  style={{
                    fontSize: m.fontSize,
                    fontWeight: 900,
                    fontFamily: SANS,
                    color: m.color,
                    letterSpacing: -3,
                    lineHeight: 0.82,
                    marginBottom: 12,
                  }}
                >
                  {m.value}
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: SANS,
                    letterSpacing: -0.5,
                    marginBottom: 4,
                  }}
                >
                  {m.label}
                </div>
                <div style={{ fontSize: 15, color: C.body, fontFamily: SANS }}>
                  {m.sub}
                </div>
              </div>
            );
          })}

          {/* 12K label/sub — fades as flood intensifies */}
          {(() => {
            const m = METRICS[1];
            const enterT = easeOut4(clamp((frame - 10) / 28, 0, 1));
            const enterY = (1 - enterT) * 40;
            return (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 360 + 228,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transform: `translateY(${enterY}px)`,
                  opacity: clamp(enterT / 0.28, 0, 1) * (1 - floodT * 2),
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: C.text,
                    fontFamily: SANS,
                    letterSpacing: -0.5,
                    marginBottom: 4,
                  }}
                >
                  {m.label}
                </div>
                <div style={{ fontSize: 15, color: C.body, fontFamily: SANS }}>
                  {m.sub}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Typography Flood number — outside fadeOut, persists and scales */}
        {(() => {
          const enterT = easeOut4(clamp((frame - 10) / 28, 0, 1));
          const enterY = (1 - enterT) * 40;
          const entryOpacity = clamp(enterT / 0.28, 0, 1);
          return (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 360,
                height: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `translateY(${floodT > 0 ? 0 : enterY}px) scale(${floodScale})`,
                transformOrigin: "50% 50%",
                opacity: entryOpacity,
                filter: `blur(${Math.min(floodRaw * 2.5, 5).toFixed(1)}px)`,
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  fontSize: 148,
                  fontWeight: 900,
                  fontFamily: SANS,
                  color: C.dark,
                  letterSpacing: -7,
                  lineHeight: 0.82,
                }}
              >
                12K
              </div>
            </div>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENE 5 — CTA (frames 427–519, local 92 frames)
// ═══════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC<{ cam: string }> = ({ cam }) => {
  const frame = useCurrentFrame();
  const TOTAL  = 92;
  const fadeOut = usePremiumFadeOut(TOTAL, 8);

  const bgT   = easeOut3(clamp(frame / 14, 0, 1));
  const line1 = useCinematicTextReveal(0,  0, 12); // blur handoff from flood
  const line2 = useCinematicTextReveal(12, 0, 12);
  const sub   = useCinematicTextReveal(28, 14, 5);
  const btn   = easeOut5(clamp((frame - 38) / 18, 0, 1));
  const url   = useCinematicTextReveal(52, 8, 3);
  const glow  = useBreathingGlow(88, 0.45, 1.0);

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>
      <div style={{ position: "absolute", inset: 0, transform: cam, transformOrigin: "center center" }}>
        <AbsoluteFill
          style={{
            background: `linear-gradient(150deg, ${C.dark} 0%, ${C.darkDeep} 100%)`,
            opacity: bgT,
          }}
        />

        {/* Cyan radial */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "44%",
            transform: "translate(-50%, -50%)",
            width: 900,
            height: 900,
            borderRadius: "50%",
            background: `radial-gradient(ellipse,
              rgba(6,182,212,${0.11 * glow}) 0%, transparent 68%)`,
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
            padding: "0 88px",
            textAlign: "center",
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: C.cyan,
              fontFamily: SANS,
              textTransform: "uppercase",
              letterSpacing: "0.11em",
              marginBottom: 28,
              opacity: line1.opacity,
              transform: `translateY(${line1.translateY}px)`,
              filter: `blur(${line1.blur}px)`,
            }}
          >
            Start building today
          </div>

          {/* Headline */}
          {["Ship your design", "system in a week."].map((text, i) => {
            const t = i === 0 ? line1 : line2;
            return (
              <div
                key={i}
                style={{
                  fontSize: 76,
                  fontWeight: 900,
                  fontFamily: SANS,
                  color: "white",
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

          {/* Sub */}
          <div
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: "rgba(255,255,255,0.50)",
              fontFamily: SANS,
              lineHeight: 1.5,
              marginTop: 28,
              opacity: sub.opacity,
              transform: `translateY(${sub.translateY}px)`,
              filter: `blur(${sub.blur}px)`,
            }}
          >
            Trusted by 12,000 teams across 80 countries.
          </div>

          {/* CTA button */}
          <div
            style={{
              marginTop: 44,
              opacity: btn,
              transform: `translateY(${(1 - btn) * 18}px)`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                background: C.cyan,
                color: C.dark,
                fontFamily: SANS,
                fontWeight: 800,
                fontSize: 18,
                letterSpacing: "-0.3px",
                padding: "18px 40px",
                borderRadius: 14,
              }}
            >
              Get started free
              <span style={{ fontSize: 20 }}>→</span>
            </div>
          </div>

          {/* URL */}
          <div
            style={{
              marginTop: 28,
              fontSize: 14,
              color: "rgba(255,255,255,0.28)",
              fontFamily: MONO,
              letterSpacing: "0.08em",
              opacity: url.opacity,
              transform: `translateY(${url.translateY}px)`,
            }}
          >
            forma.design
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export const FormaAd2: React.FC = () => {
  const TOTAL = 519;
  const cam   = useCameraTransform(TOTAL);

  return (
    <AbsoluteFill style={{ background: C.dark }}>
      {/* S1 — z=5: scatter fragments float over S2's revealed dark bg */}
      <Sequence from={0}   durationInFrames={112} style={{ zIndex: 5 }}>
        <SceneHook cam={cam} />
      </Sequence>

      {/* S2 — starts at 90, natural DOM stacking */}
      <Sequence from={90}  durationInFrames={162}>
        <SceneProduct cam={cam} />
      </Sequence>

      {/* S3 — starts at 217 (card exits canvas at root ~216) */}
      <Sequence from={217} durationInFrames={128}>
        <SceneFeatures cam={cam} />
      </Sequence>

      {/* S4 — starts at 331 (S3 ends at 345 — 14-frame overlap) */}
      <Sequence from={331} durationInFrames={112}>
        <SceneMetrics cam={cam} />
      </Sequence>

      {/* S5 — starts at 427 (S4 ends at 443 — 16-frame overlap) */}
      <Sequence from={427} durationInFrames={92}>
        <SceneCTA cam={cam} />
      </Sequence>
    </AbsoluteFill>
  );
};
