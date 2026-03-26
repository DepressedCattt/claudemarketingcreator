/**
 * FormaAd2 — LangEase SaaS faithful recreation
 *
 * // Last comparison: iter1, score 8/100. Full ground-up rebuild.
 * // Applied: P1 (spring physics on all animations, stiffness 200 damping 25),
 * //          P2 (reference storyboard: Turn Books → Audio → Any Language → tunnel → demo → tagline),
 * //          P3 (blur 10px→0 + scale 0.95→1.0 on every text reveal),
 * //          P4 (blue gradient #629DFF→#2076FF for hero words, black #1E1E1E for secondary),
 * //          P5 (CSS 3D phone tunnel with preserve-3d, camera flight through Z-axis).
 *
 * Reference: H.1 — videoplayback (1) (2026-03-20), LEARNINGS.md §3389
 *
 * Format:   1:1 square (1080 × 1080)
 * Duration: 630 frames @ 30fps = 21 seconds
 * Spring:   { stiffness: 200, damping: 25, mass: 0.8 } — critically damped, zero bounce
 * Font:     fontWeight 700 (Bold, NOT Black/900 — key Gemini finding)
 *
 * Scene map (matches reference storyboard sequence):
 *  S1  Hook       (  0– 90f,  3s)  Rapid-fire: "Turn Books" → "Audio" → "Any Language"
 *  S2  UI Intro   ( 90–180f,  3s)  "Instantly" + folder icon + "Just drop and" + window wipe
 *  S3  Tunnel     (180–360f,  6s)  CSS 3D phone tunnel — "Books." / "Audio. Video." / "Platform."
 *  S4  Demo       (360–480f,  4s)  Progress bar 0→99% + checkmark + 4 flying media cards
 *  S5  Tagline    (480–570f,  3s)  "Translate." "Dub." "Distribute." word-by-word spring reveal
 *  S6  CTA        (570–630f,  2s)  LangEase logo + langease.ai URL
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
import {
  clamp,
  easeOut3,
  easeOut4,
  easeInOut3,
  usePremiumFadeOut,
  useBreathingGlow,
} from "../utils/premiumMotion";

// ─── Design tokens — P4 fix ───────────────────────────────────────────────────
const C = {
  bg:        "#FDFDFE",        // off-white background (matches reference)
  text:      "#1E1E1E",        // near-black for secondary words (not pure black)
  body:      "#6B7280",        // muted gray for supporting copy
  blue:      "#2076FF",        // brand blue (darker end of gradient)
  blueLight: "#629DFF",        // light blue (lighter end of gradient)
  success:   "#10B981",        // green for checkmark
  cardBg:    "#FFFFFF",        // media card background
  cardBorder: "rgba(58,97,255,0.12)",
};

// P4: Blue gradient applied to hero/key words via CSS clip
const BLUE_GRAD: React.CSSProperties = {
  background:              "linear-gradient(90deg, #629DFF, #2076FF)",
  WebkitBackgroundClip:    "text",
  WebkitTextFillColor:     "transparent",
  backgroundClip:          "text",
};

const SANS = '-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif';
const MONO = '"SF Mono", "Fira Code", monospace';

// P1 fix: critically damped spring — no bounce, snappy and precise
const SNAP = { stiffness: 200, damping: 25, mass: 0.8 };

// ─── Spring reveal hook — P1 + P3 combined ────────────────────────────────────
// Every text entrance: opacity 0→1, scale 0.95→1.0, blur 10px→0 via spring.
// This replaces all interpolate+ease patterns from the previous attempt.
function useSnapReveal(startF: number) {
  const frame       = useCurrentFrame();
  const { fps }     = useVideoConfig();
  const s = spring({ frame: Math.max(0, frame - startF), fps, config: SNAP });
  return {
    s,
    opacity:   s,
    scale:     0.95 + s * 0.05,
    blurPx:    (1 - s) * 10,
    transform: `scale(${(0.95 + s * 0.05).toFixed(4)})`,
    filter:    `blur(${((1 - s) * 10).toFixed(2)}px)`,
  };
}

// ─── Soft glow background ─────────────────────────────────────────────────────
const SoftGlow: React.FC = () => (
  <AbsoluteFill style={{
    background: "radial-gradient(ellipse 720px 620px at 50% 46%, rgba(58,97,255,0.04) 0%, transparent 65%)",
    pointerEvents: "none",
  }} />
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 1 — HOOK  (frames 0–90, 3s)
//
// Rapid-fire text beats synced to music: 30f per concept.
// Each beat hard-cuts to the next — no crossfade, pure cut.
// "Turn" → small gradient; "Books" → large black hero.
// "Audio" → large gradient hero.
// "Any" → small black; "Language" → large gradient hero.
//
// P3: every word enters with blur(10px)→blur(0) + scale(0.95→1.0) spring.
// P4: gradient on Turn, Audio, Language; black (#1E1E1E) on Books, Any.
// ═══════════════════════════════════════════════════════════════════════════════

const HookBeat: React.FC<{
  top?:     string;  topGrad?:  boolean;
  hero:     string;  heroGrad?: boolean;
}> = ({ top, topGrad, hero, heroGrad }) => {
  const topReveal  = useSnapReveal(0);
  const heroReveal = useSnapReveal(3);          // 3-frame stagger between lines

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <SoftGlow />
      <div style={{
        position: "absolute", left: 0, right: 0, top: "50%",
        transform: "translateY(-50%)",
        padding: "0 80px", textAlign: "center",
      }}>
        {/* Top line — secondary word */}
        {top && (
          <div style={{
            fontSize: 56, fontWeight: 600, fontFamily: SANS,
            letterSpacing: -1.5, lineHeight: 1.0, marginBottom: 6,
            opacity:   topReveal.opacity,
            transform: topReveal.transform,
            filter:    topReveal.filter,
            ...(topGrad ? BLUE_GRAD : { color: C.body }),
          }}>
            {top}
          </div>
        )}
        {/* Hero word — dominant */}
        <div style={{
          fontSize: 128, fontWeight: 700, fontFamily: SANS,
          letterSpacing: -6, lineHeight: 0.88,
          opacity:   heroReveal.opacity,
          transform: heroReveal.transform,
          filter:    heroReveal.filter,
          ...(heroGrad ? BLUE_GRAD : { color: C.text }),
        }}>
          {hero}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const SceneHook: React.FC = () => (
  <AbsoluteFill>
    {/* Beat 1 (0–30f): "Turn" + "Books" — reference 00:00 */}
    <Sequence from={0}  durationInFrames={30}>
      <HookBeat top="Turn" topGrad hero="Books" />
    </Sequence>
    {/* Beat 2 (30–60f): "Audio" — reference 00:01 */}
    <Sequence from={30} durationInFrames={30}>
      <HookBeat hero="Audio" heroGrad />
    </Sequence>
    {/* Beat 3 (60–90f): "Any" + "Language" — reference 00:02 */}
    <Sequence from={60} durationInFrames={30}>
      <HookBeat top="Any" hero="Language" heroGrad />
    </Sequence>
  </AbsoluteFill>
);

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 2 — UI INTRO  (frames 90–180, 3s)
//
// Reference 00:03–00:06: "Instantly" text → folder icon → "Just drop and"
// + glassmorphic window wipes in from center outward.
// ═══════════════════════════════════════════════════════════════════════════════

const FolderIcon: React.FC<{ scale: number; opacity: number; blur: number }> = ({ scale, opacity, blur }) => (
  <div style={{
    width: 120, height: 120,
    borderRadius: 28,
    background: `linear-gradient(135deg, ${C.blueLight}18, ${C.blue}18)`,
    border: `2px solid ${C.blue}22`,
    boxShadow: `0 0 48px ${C.blue}22, 0 8px 24px rgba(0,0,0,0.08)`,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 52,
    opacity,
    transform: `scale(${scale})`,
    filter: `blur(${blur}px)`,
  }}>
    📁
  </div>
);

const GlassWindow: React.FC<{ wipe: number; opacity: number }> = ({ wipe, opacity }) => (
  <div style={{
    width: Math.round(540 * wipe), height: 200,
    overflow: "hidden",
    borderRadius: 18,
    background: "rgba(255,255,255,0.82)",
    border: "1.5px solid rgba(58,97,255,0.12)",
    boxShadow: "0 24px 64px rgba(58,97,255,0.08), 0 4px 16px rgba(0,0,0,0.06)",
    backdropFilter: "blur(12px)",
    opacity,
    display: "flex", alignItems: "center", padding: "0 28px", gap: 16,
  }}>
    <div style={{ flex: 1 }}>
      <div style={{ height: 10, background: `${C.blue}20`, borderRadius: 5, marginBottom: 10, width: "70%" }} />
      <div style={{ height: 8,  background: `${C.text}10`, borderRadius: 4, marginBottom: 8,  width: "90%" }} />
      <div style={{ height: 8,  background: `${C.text}10`, borderRadius: 4, width: "55%"  }} />
    </div>
    <div style={{
      width: 72, height: 36, borderRadius: 10,
      background: `linear-gradient(90deg, ${C.blueLight}, ${C.blue})`,
      flexShrink: 0,
    }} />
  </div>
);

const SceneUIIntro: React.FC = () => {
  const frame = useCurrentFrame();

  // "Instantly" (local 0–30f)
  const instantlyReveal = useSnapReveal(0);
  const instantlyFade   = 1 - easeOut3(clamp((frame - 26) / 6, 0, 1));

  // Folder icon (local 30–60f)
  const folderReveal = useSnapReveal(30);
  const folderFade   = 1 - easeOut3(clamp((frame - 58) / 6, 0, 1));

  // "Just drop and" (local 55+)
  const dropReveal = useSnapReveal(55);

  // Glassmorphic window wipes in from center (local 62+)
  const wipeRaw  = easeOut3(clamp((frame - 62) / 14, 0, 1));
  const wipeOp   = easeOut3(clamp((frame - 62) / 8, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <SoftGlow />

      {/* "Instantly" — frames 0–30 */}
      {frame < 55 && (
        <div style={{
          position: "absolute", left: 0, right: 0, top: "50%",
          transform: `translateY(-50%)`,
          textAlign: "center", padding: "0 80px",
          opacity:   instantlyReveal.opacity * instantlyFade,
          transform: `translateY(-50%) ${instantlyReveal.transform}`,
          filter:    instantlyReveal.filter,
        }}>
          <div style={{
            fontSize: 112, fontWeight: 700, fontFamily: SANS,
            letterSpacing: -5, lineHeight: 0.9,
            ...BLUE_GRAD,
          }}>
            Instantly.
          </div>
        </div>
      )}

      {/* Folder icon — frames 30–60 */}
      {frame >= 28 && frame < 60 && (
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <FolderIcon
            scale={folderReveal.scale}
            opacity={folderReveal.opacity * folderFade}
            blur={folderReveal.blurPx}
          />
        </div>
      )}

      {/* "Just drop and" + window — frames 55+ */}
      {frame >= 53 && (
        <div style={{
          position: "absolute", left: 0, right: 0,
          top: "50%", transform: "translateY(-54%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 32,
        }}>
          <div style={{
            fontSize: 72, fontWeight: 700, fontFamily: SANS,
            letterSpacing: -3, lineHeight: 0.9,
            color: C.text,
            opacity:   dropReveal.opacity,
            transform: dropReveal.transform,
            filter:    dropReveal.filter,
            textAlign: "center",
          }}>
            Just <span style={BLUE_GRAD}>drop</span> and.
          </div>
          <GlassWindow wipe={wipeRaw} opacity={wipeOp} />
        </div>
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 3 — 3D PHONE TUNNEL  (frames 180–360, 6s)
//
// P5 fix: CSS 3D tunnel using preserve-3d.
// 7 phone frames at Z depths 0, -280, -560 ... -1680.
// Camera (world translateZ) flies from 0 → 1680 over ~145 frames.
// Text overlays appear progressively:
//   frame 20: "Books."        (black hero)
//   frame 60: "Audio. Video." (gradient + black)
//   frame 110: "All In One" + "Platform." (gradient)
//   frame 148: transition — last phone fills camera with blue radial
// ═══════════════════════════════════════════════════════════════════════════════

const PHONE_W   = 185;
const PHONE_H   = 330;
const PHONE_GAP = 280;        // Z-depth spacing between phones
const N_PHONES  = 7;

const PhoneFrame: React.FC<{ zDepth: number; index: number }> = ({ zDepth, index }) => (
  <div style={{
    position: "absolute",
    left: "50%", top: "50%",
    width:  PHONE_W,
    height: PHONE_H,
    transform: `translateX(-50%) translateY(-50%) translateZ(${zDepth}px)`,
    borderRadius: 26,
    background: "#FDFDFE",
    border: `2px solid ${C.cardBorder}`,
    boxShadow: `0 0 40px rgba(58,97,255,0.10), 0 8px 32px rgba(0,0,0,0.10)`,
    overflow: "hidden",
    backfaceVisibility: "hidden",
  }}>
    {/* Blue header bar */}
    <div style={{
      height: 50,
      background: `linear-gradient(135deg, ${C.blueLight}, ${C.blue})`,
    }} />
    {/* Status bar dots */}
    <div style={{ display: "flex", gap: 5, padding: "8px 12px" }}>
      {["#FF5F57","#FFBD2E","#27C93F"].map((c, i) => (
        <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: c }} />
      ))}
    </div>
    {/* Content lines */}
    {[70, 85, 50, 65].map((w, i) => (
      <div key={i} style={{
        height: 7, margin: "6px 12px",
        borderRadius: 4,
        background: i === 0 ? `${C.blue}25` : `${C.text}10`,
        width: `${w}%`,
      }} />
    ))}
    {/* Blue CTA */}
    <div style={{
      position: "absolute", bottom: 14, left: 12, right: 12,
      height: 32, borderRadius: 9,
      background: `linear-gradient(90deg, ${C.blueLight}, ${C.blue})`,
    }} />
  </div>
);

const SceneTunnel: React.FC = () => {
  const frame       = useCurrentFrame();
  const TOTAL_DEPTH = PHONE_GAP * (N_PHONES - 1); // 1680

  // Camera flight: easeInOut through the full tunnel depth
  const cameraProgress = easeInOut3(clamp(frame / 145, 0, 1));
  const worldZ         = interpolate(cameraProgress, [0, 1], [0, TOTAL_DEPTH]);

  // Text overlays — all hooks called unconditionally (P1+P3)
  const t1 = useSnapReveal(20);   // "Books."
  const t2 = useSnapReveal(60);   // "Audio. Video."
  const t3 = useSnapReveal(110);  // "All In One Platform."

  // Cross-fade between text stages
  const t1fade = 1 - easeOut3(clamp((frame - 55)  / 8, 0, 1));
  const t2fade = 1 - easeOut3(clamp((frame - 105) / 8, 0, 1));

  // Transition flash: last phone fills camera — bright blue radial from frame 148
  const flashT = easeOut3(clamp((frame - 148) / 12, 0, 1));

  return (
    <AbsoluteFill>
      {/* Slight blue tint bg during tunnel */}
      <AbsoluteFill style={{ background: "#F5F7FF" }} />

      {/* ── 3D tunnel ── */}
      <div style={{
        position: "absolute", inset: 0,
        perspective: 950,
        perspectiveOrigin: "50% 50%",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          transformStyle: "preserve-3d",
          transform: `translateZ(${worldZ}px)`,
        }}>
          {Array.from({ length: N_PHONES }, (_, i) => {
            const zDepth   = -i * PHONE_GAP;
            const effZ     = zDepth + worldZ;
            // Fade phone in as it approaches, fade out as it passes camera
            const phoneOp  = clamp(
              interpolate(effZ, [-560, -140, 0, 160], [0.2, 1, 1, 0]),
              0, 1
            );
            return (
              <div key={i} style={{ opacity: phoneOp }}>
                <PhoneFrame zDepth={zDepth} index={i} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Text overlays (centered over tunnel) ── */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        {/* "Books." */}
        <div style={{
          position: "absolute",
          fontSize: 96, fontWeight: 700, fontFamily: SANS,
          color: C.text, letterSpacing: -4,
          opacity:   t1.opacity * t1fade,
          transform: t1.transform,
          filter:    t1.filter,
          textShadow: "0 2px 20px rgba(255,255,255,0.9)",
        }}>Books.</div>

        {/* "Audio. Video." */}
        <div style={{
          position: "absolute",
          fontSize: 84, fontWeight: 700, fontFamily: SANS,
          letterSpacing: -3,
          opacity:   t2.opacity * t2fade,
          transform: t2.transform,
          filter:    t2.filter,
        }}>
          <span style={BLUE_GRAD}>Audio. </span>
          <span style={{ color: C.text, textShadow: "0 2px 20px rgba(255,255,255,0.9)" }}>Video.</span>
        </div>

        {/* "All In One Platform." */}
        <div style={{
          position: "absolute",
          fontSize: 70, fontWeight: 700, fontFamily: SANS,
          color: C.text, letterSpacing: -3, lineHeight: 0.92,
          textAlign: "center",
          opacity:   t3.opacity,
          transform: t3.transform,
          filter:    t3.filter,
        }}>
          All In One<br />
          <span style={BLUE_GRAD}>Platform.</span>
        </div>
      </div>

      {/* Transition flash — last phone flies into camera, screen-fills with blue */}
      {flashT > 0 && (
        <AbsoluteFill style={{
          background: `radial-gradient(ellipse 800px 800px at 50% 50%,
            rgba(32,118,255,${flashT * 0.85}) 0%,
            rgba(99,157,255,${flashT * 0.4}) 45%,
            rgba(253,253,254,0) 80%)`,
        }} />
      )}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 4 — DEMO  (frames 360–480, 4s)
//
// Reference 00:11–00:18:
//   • Progress bar fills 0→81, counter ticks up, jumps to 99%
//   • Checkmark circle scales in, confetti dots burst outward
//   • 4 media cards fly in from off-screen to form a 2×2 grid
// ═══════════════════════════════════════════════════════════════════════════════

const MEDIA_CARDS = [
  { title: "History Lecture — S3E12", type: "VIDEO", lang: "EN", dur: "48 min" },
  { title: "Spain Travel Vlog",        type: "VIDEO", lang: "EN", dur: "22 min" },
  { title: "Product Walkthrough",      type: "VIDEO", lang: "EN", dur: "12 min" },
  { title: "How-to Guide Series",      type: "VIDEO", lang: "EN", dur: "35 min" },
];

// Entry vectors for each card (off-screen origin offset in px)
const CARD_FROM = [
  { dx: -160, dy: -120 },  // top-left
  { dx:  160, dy: -120 },  // top-right
  { dx: -160, dy:  120 },  // bottom-left
  { dx:  160, dy:  120 },  // bottom-right
];

const SceneDemo: React.FC = () => {
  const frame       = useCurrentFrame();
  const { fps }     = useVideoConfig();
  const fadeOut     = usePremiumFadeOut(120, 10);

  // Progress bar: 0 → 81% from frame 10→65, then snaps to 99% at frame 68
  const progressRaw = interpolate(frame, [10, 65], [0, 81], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const isDone      = frame >= 68;
  const progress    = isDone ? 99 : progressRaw;

  // Checkmark spring-in at frame 72
  const checkS = spring({ frame: Math.max(0, frame - 72), fps, config: SNAP });

  // "Confetti" dots burst at frame 72
  const confettiDots = [
    { angle: 0,   dist: 70 }, { angle: 45,  dist: 60 }, { angle: 90,  dist: 75 },
    { angle: 135, dist: 65 }, { angle: 180, dist: 70 }, { angle: 225, dist: 60 },
    { angle: 270, dist: 75 }, { angle: 315, dist: 65 },
  ];
  const confettiT = easeOut4(clamp((frame - 72) / 16, 0, 1));
  const confettiColors = [C.blue, C.blueLight, "#EC4899", "#10B981", "#F59E0B", "#8B5CF6"];

  // Cards fly in: stagger from frame 82
  const cardSprings = [0, 10, 20, 30].map((delay) =>
    spring({ frame: Math.max(0, frame - (82 + delay)), fps, config: SNAP })
  );

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fadeOut }}>
      <SoftGlow />

      {/* ── Top half: progress section ── */}
      <div style={{
        position: "absolute", left: 80, right: 80, top: 80,
        background: "white",
        borderRadius: 24,
        padding: "32px 36px",
        boxShadow: "0 24px 64px rgba(58,97,255,0.08), 0 4px 16px rgba(0,0,0,0.05)",
        border: `1.5px solid ${C.cardBorder}`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, letterSpacing: "0.10em", textTransform: "uppercase", fontFamily: SANS, marginBottom: 6 }}>
              Content Library
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: C.text, letterSpacing: -1, fontFamily: SANS }}>
              Translating to Spanish
            </div>
          </div>
          <div style={{
            fontSize: 28, fontWeight: 700, fontFamily: MONO,
            ...BLUE_GRAD,
          }}>
            {isDone ? "99%" : `${Math.round(progress)}%`}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 10, background: `${C.blue}12`,
          borderRadius: 6, overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${isDone ? 99 : progress}%`,
            background: `linear-gradient(90deg, ${C.blueLight}, ${C.blue})`,
            borderRadius: 6,
            position: "relative",
            transition: "width 0.033s linear",
          }}>
            {/* Shimmer */}
            <div style={{
              position: "absolute", top: 0, bottom: 0, right: 0, width: "40%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              borderRadius: 6,
            }} />
          </div>
        </div>

        {/* Done state */}
        {isDone && (
          <div style={{
            display: "flex", alignItems: "center", gap: 12, marginTop: 14,
            opacity: checkS, transform: `scale(${0.92 + checkS * 0.08})`,
          }}>
            {/* Checkmark circle + confetti */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: C.success,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color: "white", fontWeight: 900,
              }}>✓</div>
              {/* Confetti burst */}
              {confettiDots.map((dot, i) => {
                const rad = (dot.angle * Math.PI) / 180;
                return (
                  <div key={i} style={{
                    position: "absolute",
                    top: 14, left: 14,
                    width: 5, height: 5,
                    borderRadius: "50%",
                    background: confettiColors[i % confettiColors.length],
                    transform: `translate(${Math.cos(rad) * dot.dist * confettiT}px, ${Math.sin(rad) * dot.dist * confettiT}px)`,
                    opacity: 1 - confettiT * 0.6,
                  }} />
                );
              })}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.success, fontFamily: SANS }}>
              Ready in 50+ languages
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom half: 4 media cards in 2×2 grid ── */}
      <div style={{
        position: "absolute",
        left: 80, right: 80,
        top: 344, bottom: 50,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 16,
      }}>
        {MEDIA_CARDS.map((card, i) => {
          const s   = cardSprings[i];
          const from = CARD_FROM[i];
          return (
            <div key={i} style={{
              background: "white",
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: "0 8px 24px rgba(58,97,255,0.06), 0 2px 8px rgba(0,0,0,0.04)",
              border: `1.5px solid ${C.cardBorder}`,
              display: "flex", alignItems: "center", gap: 12,
              opacity: s,
              transform: `
                translateX(${(1 - s) * from.dx}px)
                translateY(${(1 - s) * from.dy}px)
                scale(${0.94 + s * 0.06})
              `,
              filter: `blur(${((1 - s) * 5).toFixed(1)}px)`,
            }}>
              {/* Thumbnail */}
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${C.blueLight}20, ${C.blue}20)`,
                border: `1.5px solid ${C.blue}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>🎬</div>
              {/* Info */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: C.text,
                  fontFamily: SANS, letterSpacing: -0.2,
                  whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  marginBottom: 3,
                }}>
                  {card.title}
                </div>
                <div style={{ fontSize: 10, color: C.body, fontFamily: SANS, fontWeight: 500 }}>
                  {card.type} · {card.dur}
                </div>
              </div>
              {/* Lang badge */}
              <div style={{
                fontSize: 9, fontWeight: 800, color: C.body,
                background: "rgba(0,0,0,0.05)", borderRadius: 5,
                padding: "3px 7px", letterSpacing: "0.06em", flexShrink: 0,
              }}>
                {card.lang}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 5 — TAGLINE  (frames 480–570, 3s)
//
// Reference 00:25–00:27: "Translate." "Dub." "Distribute." revealed word-by-word.
// Each word gets a spring blur+scale reveal with 10-frame stagger.
// Sparkle glow pulses on each word after it's revealed.
// ═══════════════════════════════════════════════════════════════════════════════

const TAGLINE_WORDS = [
  { word: "Translate.", startF: 8,  color: C.blue             },
  { word: "Dub.",       startF: 22, color: "#8B5CF6"           },
  { word: "Distribute.",startF: 36, color: C.blue, grad: true  },
];

const SceneTagline: React.FC = () => {
  const frame    = useCurrentFrame();
  const { fps }  = useVideoConfig();
  const fadeOut  = usePremiumFadeOut(90, 8);
  const glow     = useBreathingGlow(30, 0.5, 1.0);

  // Per-word spring reveals
  const word0 = spring({ frame: Math.max(0, frame - 8),  fps, config: SNAP });
  const word1 = spring({ frame: Math.max(0, frame - 22), fps, config: SNAP });
  const word2 = spring({ frame: Math.max(0, frame - 36), fps, config: SNAP });
  const words  = [word0, word1, word2];

  // Sub-copy
  const subReveal = useSnapReveal(54);

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: fadeOut }}>
      {/* Layered glow in brand blue + purple */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 700px 600px at 50% 44%,
          rgba(58,97,255,${0.05 * glow}) 0%, transparent 60%)`,
      }} />

      <div style={{
        position: "absolute", left: 0, right: 0, top: "50%",
        transform: "translateY(-52%)",
        padding: "0 80px", textAlign: "center",
      }}>
        {/* Word-by-word reveals */}
        {TAGLINE_WORDS.map((w, i) => {
          const s = words[i];
          const style: React.CSSProperties = w.grad
            ? { ...BLUE_GRAD }
            : { color: w.color };
          return (
            <div key={i} style={{
              fontSize: 108, fontWeight: 700, fontFamily: SANS,
              letterSpacing: -5, lineHeight: 0.92,
              marginBottom: i < 2 ? 6 : 0,
              opacity:   s,
              transform: `scale(${0.95 + s * 0.05})`,
              filter:    `blur(${((1 - s) * 10).toFixed(2)}px)`,
              ...style,
            }}>
              {w.word}
            </div>
          );
        })}

        {/* Sub copy */}
        <div style={{
          fontSize: 20, color: C.body, fontFamily: SANS, fontWeight: 400,
          marginTop: 36,
          opacity:   subReveal.opacity,
          transform: subReveal.transform,
          filter:    subReveal.filter,
        }}>
          One platform. Every language. Every format.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE 6 — CTA  (frames 570–630, 2s)
//
// Reference 00:28–00:30: Logo "LangEase" fades in, URL below.
// Clean white background — pure resolution close.
// ═══════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame   = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow    = useBreathingGlow(20, 0.5, 1.0);

  const logoS = spring({ frame: Math.max(0, frame - 4),  fps, config: SNAP });
  const urlS  = spring({ frame: Math.max(0, frame - 22), fps, config: SNAP });
  const subS  = spring({ frame: Math.max(0, frame - 14), fps, config: SNAP });

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse 640px 540px at 50% 46%,
          rgba(58,97,255,${0.055 * glow}) 0%, transparent 62%)`,
      }} />

      <div style={{
        position: "absolute", left: 0, right: 0, top: "50%",
        transform: "translateY(-50%)",
        textAlign: "center", padding: "0 80px",
      }}>
        {/* Wordmark */}
        <div style={{
          fontSize: 72, fontWeight: 700, fontFamily: SANS,
          letterSpacing: -3, lineHeight: 0.9, marginBottom: 16,
          opacity:   logoS,
          transform: `translateY(${(1 - logoS) * 18}px) scale(${0.95 + logoS * 0.05})`,
          filter:    `blur(${((1 - logoS) * 10).toFixed(2)}px)`,
          ...BLUE_GRAD,
        }}>
          LangEase
        </div>

        {/* Tagline sub */}
        <div style={{
          fontSize: 18, color: C.body, fontFamily: SANS, fontWeight: 400,
          marginBottom: 36,
          opacity:   subS,
          transform: `translateY(${(1 - subS) * 12}px)`,
          filter:    `blur(${((1 - subS) * 6).toFixed(2)}px)`,
        }}>
          Translate. Dub. Distribute.
        </div>

        {/* URL */}
        <div style={{
          fontSize: 16, color: `${C.blue}88`, fontFamily: MONO,
          letterSpacing: "0.06em",
          opacity:   urlS,
          transform: `translateY(${(1 - urlS) * 10}px)`,
        }}>
          langease.ai
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Root export ─────────────────────────────────────────────────────────────

export const FormaAd2: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}  ><SceneHook     /></Sequence>
    <Sequence from={90}  durationInFrames={90}  ><SceneUIIntro  /></Sequence>
    <Sequence from={180} durationInFrames={180} ><SceneTunnel   /></Sequence>
    <Sequence from={360} durationInFrames={120} ><SceneDemo     /></Sequence>
    <Sequence from={480} durationInFrames={90}  ><SceneTagline  /></Sequence>
    <Sequence from={570} durationInFrames={60}  ><SceneCTA      /></Sequence>
  </AbsoluteFill>
);
