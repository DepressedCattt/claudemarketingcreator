/**
 * SaasPlaygroundAd — THE canonical feature playground.
 *
 * This is the single source of truth for demonstrating every feature in the
 * category taxonomy. When a new subcategory or technique is added to the
 * library, it gets a dedicated scene here FIRST.
 *
 * Scenes S1–S8 are the original SaasShowcaseAd "Vertex" scenes.
 * Scene S9 demonstrates the camera-movement subcategory (corner growth sweep).
 * Scene S10 demonstrates the 3d-realm-camera subcategory (3D orbit + objects).
 * Scene S11 demonstrates simple component animation (pills, stats, testimonial sampler).
 * Scene S12 demonstrates medium component animation (glow cards, data-flow sampler).
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 1120 frames @ 30fps ≈ 37 seconds
 * Category: saas (all subcategories)
 * Role:     playground (gold in Studio UI)
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
import { SaasShowcaseAd } from "./SaasShowcaseAd";

// ─── Design Tokens (matching SaasCameraAd palette) ──────────────────────────

const CAM_C = {
  bg: "#F5EEC9",
  lavender: "#C49EE0",
  teal: "#76C0D0",
  tealLight: "#92D3E1",
  periwinkle: "#879FF7",
  coral: "#DE7850",
  gold: "#D7A855",
  purple: "#BD90F3",
  deepPurple: "#9785ED",
  navy: "#424E9D",
  indigo: "#5C68CF",
  magenta: "#E79FE6",
  mauve: "#CFA6CB",
  cornflower: "#8BA5F6",
  sage: "#5AA6A8",
  dark: "#1c1c1c",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

const SPR_CAM = {
  shape: { stiffness: 120, damping: 22, mass: 0.85 },
  text: { stiffness: 170, damping: 25, mass: 0.8 },
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const easeInOut3 = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
};
const easeInOut4 = (t: number): number => {
  const c = clamp(t, 0, 1);
  return c < 0.5 ? 8 * c * c * c * c : 1 - Math.pow(-2 * c + 2, 4) / 2;
};

// ─── Component Animation Tokens (from SaaS Product Promo AE extract) ────────

const COMP_C = {
  bg: "#5EB1FF",
  bgPale: "#B6D8F8",
  card: "#F8F8F8",
  cardStroke: "#83BBFF",
  accent: "#1B5DFF",
  text: "#131313",
  textLight: "#F5FCFF",
  white: "#FFFFFF",
  green: "#22C55E",
  star: "#FBBF24",
};

const SPR_COMP = {
  pill:  { stiffness: 160, damping: 24, mass: 0.85 },
  card:  { stiffness: 140, damping: 22, mass: 0.9 },
  text:  { stiffness: 170, damping: 25, mass: 0.8 },
  cta:   { stiffness: 120, damping: 18, mass: 0.9 },
};

// ─── 3D Realm Tokens ────────────────────────────────────────────────────────

const REALM_C = {
  bg: "#08080e",
  violet: "#8B5CF6",
  violetDark: "#7243DB",
  purple: "#A855F7",
  cyan: "#40E0D0",
  cyanDark: "#2BB5A6",
  teal: "#14B8A6",
  rose: "#FB7185",
  roseDark: "#E11D48",
  magenta: "#E879F9",
  magentaDark: "#C959DB",
  indigo: "#4b63e9",
  blue: "#3B82F6",
  blueDark: "#2563EB",
  white: "#F8FAFC",
  muted: "#94A3B8",
  glow: "#6366f1",
};

const SPR_REALM = {
  shape: { stiffness: 110, damping: 22, mass: 0.9 },
  text: { stiffness: 170, damping: 25, mass: 0.8 },
};

// ─── Camera Demo Scene ──────────────────────────────────────────────────────

function useDemoCornerSweep(holdFrames: number, sweepFrames: number): { transform: string; motionBlur: number } {
  const frame = useCurrentFrame();
  const raw = clamp((frame - holdFrames) / sweepFrames, 0, 1);
  const t = easeInOut4(raw);

  const dt = 0.01;
  const tNext = easeInOut4(clamp(raw + dt, 0, 1));
  const velocity = Math.abs(tNext - t) / dt;
  const motionBlur = velocity * 3.5;

  const scale = 1 + t * 1.4;
  const tx = t * W * 0.28;
  const ty = t * H * 0.28;

  const holdDrift = Math.min(frame / holdFrames, 1);
  const gentleX = easeInOut3(holdDrift) * 25;
  const gentleY = easeInOut3(holdDrift) * 18;
  const roll = easeInOut3(holdDrift) * -0.4;

  const transform = `scale(${scale}) translateX(${-(tx + gentleX)}px) translateY(${-(ty + gentleY)}px) rotateZ(${roll}deg)`;
  return { transform, motionBlur };
}

const CameraMovementDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = 100;
  const { transform: cam, motionBlur } = useDemoCornerSweep(56, 26);

  const fadeIn = Math.min(1, frame / 8);
  const fadeOut = Math.min(1, (dur - frame) / 10);
  const exitScale = dur - frame < 10
    ? interpolate(frame, [dur - 10, dur], [1, 0.97], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const spr = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR_CAM.shape });
  const textSpr = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR_CAM.text });

  return (
    <AbsoluteFill style={{ opacity: Math.max(0, Math.min(fadeIn, fadeOut)), transform: `scale(${exitScale})` }}>
      <AbsoluteFill style={{ backgroundColor: CAM_C.bg }}>
        <div style={{ position: "absolute", inset: 0, transform: cam, transformOrigin: "center center", willChange: "transform", filter: motionBlur > 0.3 ? `blur(${motionBlur}px)` : undefined }}>
          {/* Central shapes */}
          {[
            { x: CX - 350, y: CY - 180, size: 450, c1: CAM_C.lavender, c2: CAM_C.deepPurple, d: 2 },
            { x: CX + 500, y: CY + 80, size: 350, c1: CAM_C.teal, c2: CAM_C.sage, d: 5 },
            { x: CX, y: CY + 380, size: 400, c1: CAM_C.coral, c2: CAM_C.gold, d: 3 },
            { x: CX - 600, y: CY + 300, size: 280, c1: CAM_C.periwinkle, c2: CAM_C.cornflower, d: 7 },
            { x: CX + 300, y: CY - 380, size: 320, c1: CAM_C.magenta, c2: CAM_C.mauve, d: 9 },
          ].map(({ x, y, size, c1, c2, d }, i) => {
            const p = spr(d);
            return (
              <div key={i} style={{
                position: "absolute",
                left: x - size / 2,
                top: y - size / 2 + Math.sin(frame * 0.025 + i) * 4,
                width: size,
                height: size,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 30%, ${c1}, ${c2})`,
                opacity: p,
                transform: `scale(${0.3 + p * 0.7})`,
                boxShadow: `0 ${20 * (1 - p)}px ${50 * (1 - p)}px ${c2}40`,
              }} />
            );
          })}

          {/* Bottom-right corner cluster — grows during sweep */}
          {[
            { x: W - 450, y: H - 350, size: 650, c1: CAM_C.purple, c2: CAM_C.indigo, d: 4 },
            { x: W - 250, y: H - 200, size: 400, c1: CAM_C.coral, c2: CAM_C.lavender, d: 8 },
          ].map(({ x, y, size, c1, c2, d }, i) => {
            const p = spr(d);
            return (
              <div key={`br${i}`} style={{
                position: "absolute",
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
                borderRadius: "50%",
                background: `radial-gradient(circle at 40% 35%, ${c1}, ${c2})`,
                opacity: p,
                transform: `scale(${0.4 + p * 0.6})`,
              }} />
            );
          })}

          {/* Title */}
          {(() => {
            const tp = textSpr(4);
            const blur = (1 - tp) * 10;
            return (
              <div style={{
                position: "absolute", left: CX, top: CY - 60,
                transform: `translate(-50%, -50%) scale(${0.92 + tp * 0.08})`,
                fontFamily: FONT, fontSize: 180, fontWeight: 700,
                color: CAM_C.navy, letterSpacing: -5,
                opacity: tp,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              }}>
                Camera
              </div>
            );
          })()}
          {(() => {
            const tp = textSpr(8);
            return (
              <div style={{
                position: "absolute", left: CX, top: CY + 100,
                transform: "translate(-50%, -50%)",
                fontFamily: FONT, fontSize: 48, fontWeight: 400,
                color: CAM_C.indigo, opacity: tp * 0.6,
                letterSpacing: 2, textTransform: "uppercase" as const,
              }}>
                corner growth sweep
              </div>
            );
          })()}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── 3D Realm Demo Scene (cubes + diamonds, no springs on shapes) ───────────

const RealmDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = 110;

  const holdFrames = 45;
  const orbitRaw = clamp((frame - holdFrames) / 50, 0, 1);
  const orbitT = easeInOut4(orbitRaw);

  const camRotY = orbitT * 30;
  const camRotX = orbitT * -6;
  const camScale = 1 + orbitT * 0.12;

  const fadeIn = Math.min(1, frame / 8);
  const fadeOut = Math.min(1, (dur - frame) / 10);
  const exitScale = dur - frame < 10
    ? interpolate(frame, [dur - 10, dur], [1, 0.97], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const textSpr = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR_REALM.text });

  const cubeData = [
    { x: CX - 400, y: CY - 180, z: 120, sz: 240, c: REALM_C.violet, cd: REALM_C.violetDark, sp: 0.18, ph: 0 },
    { x: CX + 480, y: CY + 120, z: -160, sz: 200, c: REALM_C.cyan, cd: REALM_C.cyanDark, sp: 0.12, ph: 90 },
    { x: CX - 620, y: CY + 280, z: -80, sz: 160, c: REALM_C.indigo, cd: REALM_C.blueDark, sp: 0.2, ph: 180 },
  ];

  return (
    <AbsoluteFill style={{ opacity: Math.max(0, Math.min(fadeIn, fadeOut)), transform: `scale(${exitScale})` }}>
      <AbsoluteFill style={{ backgroundColor: REALM_C.bg }}>
        <div style={{
          position: "absolute", inset: 0,
          perspective: "2400px",
          perspectiveOrigin: "50% 50%",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            transformStyle: "preserve-3d" as const,
            transform: `rotateY(${camRotY}deg) rotateX(${camRotX}deg) scale(${camScale})`,
            transformOrigin: "center center",
            willChange: "transform",
          }}>
            {/* True 3D cubes */}
            {cubeData.map(({ x, y, z, sz, c, cd, sp, ph }, i) => {
              const half = sz / 2;
              const rX = (frame * sp * 0.7) + ph;
              const rY = (frame * sp) + ph * 1.3;
              const bob = Math.sin(frame * 0.015 + ph * 0.01) * 4;
              const faces = [
                { t: `rotateY(0deg) translateZ(${half}px)`, bg: c, op: 1.0 },
                { t: `rotateY(180deg) translateZ(${half}px)`, bg: cd, op: 0.85 },
                { t: `rotateY(90deg) translateZ(${half}px)`, bg: `${c}dd`, op: 0.9 },
                { t: `rotateY(-90deg) translateZ(${half}px)`, bg: `${c}cc`, op: 0.9 },
                { t: `rotateX(90deg) translateZ(${half}px)`, bg: `${c}ee`, op: 0.95 },
                { t: `rotateX(-90deg) translateZ(${half}px)`, bg: cd, op: 0.8 },
              ];
              return (
                <div key={`cube${i}`} style={{
                  position: "absolute", left: x - half, top: y - half + bob,
                  width: sz, height: sz,
                  transformStyle: "preserve-3d" as const,
                  transform: `translateZ(${z}px) rotateX(${rX}deg) rotateY(${rY}deg)`,
                }}>
                  {faces.map((f, fi) => (
                    <div key={fi} style={{
                      position: "absolute", width: sz, height: sz,
                      transform: f.t, background: f.bg, opacity: f.op,
                      borderRadius: sz * 0.08,
                      backfaceVisibility: "hidden" as const,
                      boxShadow: `inset 0 0 ${sz * 0.15}px rgba(0,0,0,0.15)`,
                    }} />
                  ))}
                </div>
              );
            })}

            {/* Diamonds (cubes rotated 45° on vertex) */}
            {[
              { x: CX, y: CY + 380, z: 60, sz: 260, c: REALM_C.rose, cd: REALM_C.roseDark, sp: 0.1, ph: 200 },
              { x: CX + 350, y: CY - 360, z: 150, sz: 180, c: REALM_C.magenta, cd: REALM_C.magentaDark, sp: 0.14, ph: 100 },
            ].map(({ x, y, z, sz, c, cd, sp, ph }, i) => {
              const half = sz / 2;
              const rY = (frame * sp) + ph;
              const bob = Math.sin(frame * 0.018 + ph * 0.01) * 3;
              const faces = [
                { t: `rotateY(0deg) translateZ(${half}px)`, bg: c, op: 1.0 },
                { t: `rotateY(180deg) translateZ(${half}px)`, bg: cd, op: 0.85 },
                { t: `rotateY(90deg) translateZ(${half}px)`, bg: `${c}dd`, op: 0.9 },
                { t: `rotateY(-90deg) translateZ(${half}px)`, bg: `${c}cc`, op: 0.9 },
                { t: `rotateX(90deg) translateZ(${half}px)`, bg: `${c}ee`, op: 0.95 },
                { t: `rotateX(-90deg) translateZ(${half}px)`, bg: cd, op: 0.8 },
              ];
              return (
                <div key={`dia${i}`} style={{
                  position: "absolute", left: x - half, top: y - half + bob,
                  width: sz, height: sz,
                  transformStyle: "preserve-3d" as const,
                  transform: `translateZ(${z}px) rotateZ(45deg) rotateX(${54.74 + frame * sp * 0.3}deg) rotateY(${rY}deg)`,
                }}>
                  {faces.map((f, fi) => (
                    <div key={fi} style={{
                      position: "absolute", width: sz, height: sz,
                      transform: f.t, background: f.bg, opacity: f.op,
                      borderRadius: sz * 0.08,
                      backfaceVisibility: "hidden" as const,
                      boxShadow: `inset 0 0 ${sz * 0.15}px rgba(0,0,0,0.15)`,
                    }} />
                  ))}
                </div>
              );
            })}

            {/* Orbital ring */}
            {(() => {
              const spin = frame * 0.4;
              return (
                <div style={{
                  position: "absolute", left: CX - 500, top: CY - 500,
                  width: 1000, height: 1000, borderRadius: "50%",
                  border: `3px solid ${REALM_C.violet}`,
                  opacity: 0.4,
                  transformStyle: "preserve-3d" as const,
                  transform: `translateZ(-300px) rotateX(75deg) rotateY(${spin}deg)`,
                }} />
              );
            })()}
          </div>
        </div>

        {/* Title */}
        {(() => {
          const tp = textSpr(4);
          const blur = (1 - tp) * 10;
          return (
            <div style={{
              position: "absolute", left: CX, top: CY - 60,
              transform: `translate(-50%, -50%) scale(${0.92 + tp * 0.08})`,
              fontFamily: FONT, fontSize: 180, fontWeight: 700,
              color: REALM_C.white, letterSpacing: -5,
              opacity: tp,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              textShadow: `0 0 60px ${REALM_C.glow}40`,
            }}>
              3D Realm
            </div>
          );
        })()}
        {(() => {
          const tp = textSpr(8);
          return (
            <div style={{
              position: "absolute", left: CX, top: CY + 100,
              transform: "translate(-50%, -50%)",
              fontFamily: FONT, fontSize: 48, fontWeight: 400,
              color: REALM_C.muted, opacity: tp * 0.6,
              letterSpacing: 2, textTransform: "uppercase" as const,
            }}>
              3d orbit + perspective camera
            </div>
          );
        })()}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Component Animation Demo Scene ─────────────────────────────────────────
// Inspired by SaaS Product Promo Final AE extract — animated UI components:
// pill buttons, stat cards, testimonial cards, CTA with staggered spring entries.

const Checkmark: React.FC<{ size: number; color: string; progress: number }> = ({ size, color, progress }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M5 13l4 4L19 7"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={24}
      strokeDashoffset={24 * (1 - progress)}
    />
  </svg>
);

const StarIcon: React.FC<{ size: number; filled: boolean }> = ({ size, filled }) => (
  <svg width={size} height={size} viewBox="0 0 20 20">
    <path
      d="M10 1l2.39 4.84L18 6.71l-4 3.9.94 5.5L10 13.42 5.06 16.1l.94-5.5-4-3.9 5.61-.87z"
      fill={filled ? COMP_C.star : "transparent"}
      stroke={COMP_C.star}
      strokeWidth={1}
    />
  </svg>
);

const PillButton: React.FC<{
  label: string; x: number; y: number; w: number; h: number;
  progress: number; hasCheck?: boolean; checkProgress?: number;
}> = ({ label, x, y, w, h, progress, hasCheck, checkProgress = 0 }) => (
  <div style={{
    position: "absolute", left: x, top: y, width: w, height: h,
    borderRadius: h,
    background: COMP_C.card,
    boxShadow: `0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
    border: `2px solid ${COMP_C.cardStroke}`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 24,
    transform: `translateX(${(1 - progress) * 600}px) scale(${0.85 + progress * 0.15})`,
    opacity: progress,
  }}>
    {hasCheck && (
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: `${COMP_C.green}18`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Checkmark size={32} color={COMP_C.green} progress={checkProgress} />
      </div>
    )}
    <span style={{
      fontFamily: FONT, fontSize: 80, fontWeight: 500,
      color: COMP_C.accent, letterSpacing: -2,
    }}>
      {label}
    </span>
  </div>
);

const ComponentAnimationDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = 150;

  const fadeIn = Math.min(1, frame / 8);
  const fadeOut = Math.min(1, (dur - frame) / 10);
  const exitScale = dur - frame < 10
    ? interpolate(frame, [dur - 10, dur], [1, 0.97], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const pill = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR_COMP.pill });
  const card = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR_COMP.card });
  const txt = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR_COMP.text });
  const cta = (delay: number) => spring({ frame: Math.max(0, frame - delay), fps, config: SPR_COMP.cta });

  const float = (phase: number, amp: number) => Math.sin(frame * 0.02 + phase) * amp;

  const pillButtons = [
    { label: "Add project",   delay: 12, y: 540  },
    { label: "Assign tasks",  delay: 18, y: 740  },
    { label: "Track progress", delay: 24, y: 940 },
  ];

  const counterTarget = 95;
  const counterProgress = card(45);
  const counterValue = Math.round(counterTarget * counterProgress);

  return (
    <AbsoluteFill style={{
      opacity: Math.max(0, Math.min(fadeIn, fadeOut)),
      transform: `scale(${exitScale})`,
    }}>
      <AbsoluteFill style={{ backgroundColor: COMP_C.bg }}>
        {/* Decorative bg circles */}
        {[
          { x: 300, y: 400, size: 500, opacity: 0.12 },
          { x: 3200, y: 1600, size: 600, opacity: 0.1 },
          { x: 1800, y: 1800, size: 400, opacity: 0.08 },
        ].map(({ x, y, size, opacity }, i) => (
          <div key={`bg${i}`} style={{
            position: "absolute", left: x - size / 2, top: y - size / 2 + float(i * 2, 6),
            width: size, height: size, borderRadius: "50%",
            background: `radial-gradient(circle, ${COMP_C.white}, transparent)`,
            opacity: opacity * txt(4),
          }} />
        ))}

        {/* ── Title ──────────────────────────────────────────────── */}
        {(() => {
          const tp = txt(4);
          const blur = (1 - tp) * 10;
          return (
            <div style={{
              position: "absolute", left: 200, top: 180,
              transform: `translateY(${(1 - tp) * 40}px)`,
              opacity: tp,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 160, fontWeight: 700,
                color: COMP_C.white, letterSpacing: -4,
              }}>
                Components
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 48, fontWeight: 400,
                color: COMP_C.textLight, opacity: 0.7,
                letterSpacing: 2, textTransform: "uppercase" as const, marginTop: 8,
              }}>
                animated UI elements
              </div>
            </div>
          );
        })()}

        {/* ── Pill Buttons (right column) ────────────────────────── */}
        <div style={{ position: "absolute", right: 300, top: 160 }}>
          {pillButtons.map(({ label, delay, y }, i) => {
            const p = pill(delay);
            const checkP = pill(delay + 20);
            return (
              <PillButton
                key={i}
                label={label}
                x={0} y={y - 540}
                w={900} h={200}
                progress={p}
                hasCheck
                checkProgress={checkP}
              />
            );
          })}
        </div>

        {/* ── Arrow connectors between pills ─────────────────────── */}
        {[0, 1].map(i => {
          const p = pill(pillButtons[i + 1].delay);
          return (
            <div key={`arrow${i}`} style={{
              position: "absolute",
              right: 750, top: 390 + i * 200,
              opacity: p * 0.5,
              transform: `scaleY(${p})`,
              transformOrigin: "top center",
            }}>
              <svg width={40} height={100} viewBox="0 0 40 100">
                <line x1={20} y1={0} x2={20} y2={80} stroke={COMP_C.white} strokeWidth={3} strokeDasharray="8 6" />
                <path d="M12 72 L20 88 L28 72" fill="none" stroke={COMP_C.white} strokeWidth={3} strokeLinecap="round" />
              </svg>
            </div>
          );
        })}

        {/* ── Stat Card ──────────────────────────────────────────── */}
        {(() => {
          const p = card(35);
          return (
            <div style={{
              position: "absolute", left: 200, top: 900,
              width: 900, height: 500,
              borderRadius: 60,
              background: COMP_C.card,
              boxShadow: `0 16px 64px rgba(0,0,0,0.1)`,
              border: `2px solid ${COMP_C.cardStroke}`,
              transform: `translateY(${(1 - p) * 80}px) scale(${0.9 + p * 0.1})`,
              opacity: p,
              display: "flex", flexDirection: "column" as const,
              alignItems: "center", justifyContent: "center",
              padding: 40,
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 180, fontWeight: 600,
                color: COMP_C.text, letterSpacing: -6,
                lineHeight: 1,
              }}>
                {counterValue}<span style={{ fontSize: 100, color: "#999" }}>/100</span>
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 52, fontWeight: 500,
                color: "#666", letterSpacing: -1, marginTop: 16,
              }}>
                Satisfied Customers
              </div>
              {/* Progress bar */}
              <div style={{
                width: "80%", height: 16, borderRadius: 8,
                background: "#E8E8E8", marginTop: 32, overflow: "hidden",
              }}>
                <div style={{
                  width: `${counterProgress * 95}%`, height: "100%",
                  borderRadius: 8, background: `linear-gradient(90deg, ${COMP_C.accent}, #4F8CFF)`,
                  transition: "width 0.1s",
                }} />
              </div>
            </div>
          );
        })()}

        {/* ── Testimonial Card ───────────────────────────────────── */}
        {(() => {
          const p = card(50);
          return (
            <div style={{
              position: "absolute", left: 200, top: 1480,
              width: 900, height: 400,
              borderRadius: 60,
              background: COMP_C.white,
              boxShadow: `0 12px 48px rgba(0,0,0,0.08)`,
              border: `2px solid ${COMP_C.cardStroke}`,
              transform: `translateX(${(1 - p) * -120}px) scale(${0.9 + p * 0.1})`,
              opacity: p,
              padding: "48px 64px",
              display: "flex", flexDirection: "column" as const,
              justifyContent: "center",
            }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
                {[0, 1, 2, 3, 4].map(i => {
                  const starP = pill(55 + i * 3);
                  return (
                    <div key={i} style={{ transform: `scale(${starP})`, opacity: starP }}>
                      <StarIcon size={44} filled />
                    </div>
                  );
                })}
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 96, fontWeight: 600,
                color: COMP_C.text, letterSpacing: -3, lineHeight: 1.1,
              }}>
                Great Stuff
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 44, fontWeight: 400,
                color: "#888", marginTop: 12,
              }}>
                Robert Laurence
              </div>
            </div>
          );
        })()}

        {/* ── Users Badge ────────────────────────────────────────── */}
        {(() => {
          const p = cta(60);
          return (
            <div style={{
              position: "absolute", right: 340, top: 1080,
              borderRadius: 100,
              background: `linear-gradient(135deg, ${COMP_C.accent}, #4F6CFF)`,
              padding: "28px 64px",
              boxShadow: `0 8px 32px ${COMP_C.accent}40`,
              transform: `scale(${0.5 + p * 0.5})`,
              opacity: p,
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 72, fontWeight: 600,
                color: COMP_C.white, letterSpacing: -2,
              }}>
                1,200+ users
              </div>
            </div>
          );
        })()}

        {/* ── Checkout / CTA Button ──────────────────────────────── */}
        {(() => {
          const p = cta(70);
          const pulse = 1 + Math.sin(frame * 0.06) * 0.015 * p;
          return (
            <div style={{
              position: "absolute", right: 300, top: 1300,
              width: 900, height: 200,
              borderRadius: 200,
              background: `linear-gradient(135deg, #1B4DFF, ${COMP_C.accent})`,
              boxShadow: `0 12px 48px ${COMP_C.accent}50`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transform: `scale(${(0.7 + p * 0.3) * pulse})`,
              opacity: p,
            }}>
              <span style={{
                fontFamily: FONT, fontSize: 80, fontWeight: 600,
                color: COMP_C.white, letterSpacing: -2,
              }}>
                Subscribe Now
              </span>
            </div>
          );
        })()}

        {/* ── Small action card ───────────────────────────────────── */}
        {(() => {
          const p = card(65);
          return (
            <div style={{
              position: "absolute", right: 340, top: 1580,
              width: 820, height: 280,
              borderRadius: 48,
              background: COMP_C.card,
              boxShadow: `0 8px 32px rgba(0,0,0,0.06)`,
              border: `2px solid ${COMP_C.cardStroke}`,
              transform: `translateY(${(1 - p) * 60}px)`,
              opacity: p,
              display: "flex", alignItems: "center",
              padding: "0 56px", gap: 32,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: `${COMP_C.accent}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Checkmark size={48} color={COMP_C.accent} progress={card(75)} />
              </div>
              <div>
                <div style={{
                  fontFamily: FONT, fontSize: 72, fontWeight: 600,
                  color: COMP_C.text, letterSpacing: -2,
                }}>
                  Checkout
                </div>
                <div style={{
                  fontFamily: FONT, fontSize: 40, fontWeight: 400,
                  color: "#999",
                }}>
                  Complete your setup
                </div>
              </div>
            </div>
          );
        })()}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Medium Component Animation Demo Scene ──────────────────────────────────
// Condensed sampler: glow-lit dashboard cards + animated SVG connector.
// Shows the step-up from simple components: dark palette, glow effects, choreography.

const MED_C = {
  bg:          "#0F172A",
  surface:     "#1E293B",
  surfaceHi:   "#2D3B50",
  accent:      "#3B82F6",
  accentGlow:  "#3B82F640",
  cyan:        "#22D3EE",
  cyanGlow:    "#22D3EE30",
  emerald:     "#10B981",
  emeraldGlow: "#10B98130",
  violet:      "#8B5CF6",
  violetGlow:  "#8B5CF630",
  amber:       "#F59E0B",
  amberGlow:   "#F59E0B30",
  text:        "#F8FAFC",
  textMid:     "#94A3B8",
  white:       "#FFFFFF",
};

const SPR_MED = {
  card: { stiffness: 150, damping: 22, mass: 0.9 },
  glow: { stiffness: 80, damping: 26, mass: 1.1 },
  text: { stiffness: 170, damping: 25, mass: 0.8 },
  conn: { stiffness: 100, damping: 24, mass: 0.95 },
};

const MediumComponentDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dur = 160;

  const fadeIn = Math.min(1, frame / 8);
  const fadeOut = Math.min(1, (dur - frame) / 10);
  const exitScale = dur - frame < 10
    ? interpolate(frame, [dur - 10, dur], [1, 0.97], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const s = (delay: number, config = SPR_MED.card) =>
    spring({ frame: Math.max(0, frame - delay), fps, config });
  const txt = (delay: number) => s(delay, SPR_MED.text);

  const cards = [
    { x: 200, y: 480, w: 1060, h: 440, color: MED_C.accent, glow: MED_C.accentGlow, title: "Revenue", value: "$124.8K", delta: "+12.3%", delay: 8 },
    { x: 1340, y: 480, w: 1060, h: 440, color: MED_C.emerald, glow: MED_C.emeraldGlow, title: "Conversions", value: "2,847", delta: "+8.1%", delay: 14 },
    { x: 2480, y: 480, w: 1160, h: 440, color: MED_C.cyan, glow: MED_C.cyanGlow, title: "Active Users", value: "14.2K", delta: "+23.5%", delay: 20 },
  ];

  const connectorNodes = [
    { x: 600, y: 1200, w: 750, h: 340, color: MED_C.cyan, title: "Source", icon: "⬡", delay: 28 },
    { x: 1550, y: 1100, w: 750, h: 340, color: MED_C.accent, title: "Transform", icon: "⚙", delay: 34 },
    { x: 2500, y: 1200, w: 750, h: 340, color: MED_C.violet, title: "Output", icon: "✦", delay: 40 },
  ];

  return (
    <AbsoluteFill style={{
      opacity: Math.max(0, Math.min(fadeIn, fadeOut)),
      transform: `scale(${exitScale})`,
    }}>
      <AbsoluteFill style={{ backgroundColor: MED_C.bg }}>
        {/* Ambient glow orbs */}
        {[
          { x: 400, y: 350, size: 500, color: MED_C.accent, glow: MED_C.accentGlow, phase: 0, delay: 4 },
          { x: 3400, y: 300, size: 400, color: MED_C.cyan, glow: MED_C.cyanGlow, phase: 2, delay: 8 },
          { x: 1900, y: 1700, size: 600, color: MED_C.violet, glow: MED_C.violetGlow, phase: 4, delay: 12 },
        ].map(({ x, y, size, color, glow, phase, delay }, i) => {
          const p = s(delay, SPR_MED.glow);
          const breathe = Math.sin(frame * 0.03 + phase) * 0.15 + 0.85;
          return (
            <div key={`orb${i}`} style={{
              position: "absolute", left: x - size / 2, top: y - size / 2 + Math.sin(frame * 0.015 + phase) * 6,
              width: size, height: size, borderRadius: "50%",
              background: `radial-gradient(circle at 40% 35%, ${color}, transparent 70%)`,
              boxShadow: `0 0 ${size * 0.8}px ${size * 0.3}px ${glow}`,
              opacity: p * breathe * 0.6,
              transform: `scale(${0.5 + p * 0.5})`,
            }} />
          );
        })}

        {/* Title */}
        {(() => {
          const tp = txt(4);
          const blur = (1 - tp) * 10;
          return (
            <div style={{
              position: "absolute", left: 200, top: 160,
              transform: `translateY(${(1 - tp) * 40}px)`,
              opacity: tp,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
            }}>
              <div style={{ fontFamily: FONT, fontSize: 140, fontWeight: 700, color: MED_C.text, letterSpacing: -4 }}>
                Medium Components
              </div>
              <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 400, color: MED_C.textMid, letterSpacing: 2, textTransform: "uppercase" as const, marginTop: 8 }}>
                glow cards + data-flow choreography
              </div>
            </div>
          );
        })()}

        {/* Glow Dashboard Cards */}
        {cards.map(({ x, y, w, h, color, glow, title, value, delta, delay }, i) => {
          const p = s(delay);
          const glowPulse = Math.sin(frame * 0.04 + i) * 0.3 + 0.7;
          return (
            <div key={`card${i}`} style={{
              position: "absolute", left: x, top: y, width: w, height: h,
              borderRadius: 40,
              background: `linear-gradient(145deg, ${MED_C.surfaceHi}, ${MED_C.surface})`,
              border: `1px solid ${glow}`,
              boxShadow: `0 0 ${40 * glowPulse}px ${glow}, 0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
              transform: `translateY(${(1 - p) * 60}px) scale(${0.85 + p * 0.15})`,
              opacity: p,
              overflow: "hidden",
            }}>
              {/* Inner light */}
              <div style={{
                position: "absolute", top: -h * 0.3, left: "20%", width: w * 0.6, height: h * 0.5,
                borderRadius: "50%", background: `radial-gradient(circle, ${glow}, transparent 70%)`,
                opacity: 0.15 * glowPulse, pointerEvents: "none",
              }} />
              <div style={{ padding: "40px 48px", position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
                  <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 500, color: MED_C.textMid, letterSpacing: 1, textTransform: "uppercase" as const }}>{title}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                  <span style={{ fontFamily: FONT, fontSize: 96, fontWeight: 700, color: MED_C.text, letterSpacing: -4 }}>{value}</span>
                  <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 600, color }}>{delta}</span>
                </div>
                <div style={{ marginTop: 20, height: 8, borderRadius: 4, background: `${color}15`, overflow: "hidden", width: "80%" }}>
                  <div style={{ width: `${s(delay + 12) * 75}%`, height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${color}, ${color}80)`, boxShadow: `0 0 8px ${color}60` }} />
                </div>
              </div>
            </div>
          );
        })}

        {/* SVG Connectors between bottom nodes */}
        {[0, 1].map(i => {
          const n1 = connectorNodes[i];
          const n2 = connectorNodes[i + 1];
          const connP = s(44 + i * 6, SPR_MED.conn);
          const x1 = n1.x + n1.w;
          const y1 = n1.y + n1.h / 2;
          const x2 = n2.x;
          const y2 = n2.y + n2.h / 2;
          const dx = x2 - x1;
          const dy = y2 - y1;
          const pathLen = Math.sqrt(dx * dx + dy * dy) * 1.2;
          const mx = (x1 + x2) / 2 + dy * 0.25;
          const my = (y1 + y2) / 2 - dx * 0.15;
          const pathD = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
          return (
            <svg key={`conn${i}`} style={{ position: "absolute", left: 0, top: 0, width: W, height: H, pointerEvents: "none" }}>
              <path d={pathD} fill="none" stroke={`${connectorNodes[i].color}20`} strokeWidth={3} />
              <path d={pathD} fill="none" stroke={connectorNodes[i].color} strokeWidth={3} strokeLinecap="round"
                strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - connP)}
                filter={`drop-shadow(0 0 6px ${connectorNodes[i].color})`} />
              <circle
                cx={interpolate(connP, [0, 1], [x1, x2])}
                cy={interpolate(connP, [0, 1], [y1, y2])}
                r={5} fill={connectorNodes[i].color}
                opacity={connP > 0.05 && connP < 0.95 ? 1 : 0}
                filter={`drop-shadow(0 0 8px ${connectorNodes[i].color})`} />
            </svg>
          );
        })}

        {/* Data-flow node cards */}
        {connectorNodes.map(({ x, y, w, h, color, title, icon, delay }, i) => {
          const p = s(delay);
          const glowPulse = Math.sin(frame * 0.04 + i * 2) * 0.3 + 0.7;
          return (
            <div key={`node${i}`} style={{
              position: "absolute", left: x, top: y, width: w, height: h,
              borderRadius: 32,
              background: `linear-gradient(145deg, ${MED_C.surfaceHi}, ${MED_C.surface})`,
              border: `1px solid ${color}40`,
              boxShadow: `0 0 ${30 * glowPulse}px ${color}30, 0 12px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)`,
              transform: `translateY(${(1 - p) * 50}px) scale(${0.88 + p * 0.12})`,
              opacity: p,
              display: "flex", alignItems: "center", padding: "0 40px", gap: 28,
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 22,
                background: `${color}15`, border: `1px solid ${color}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 40, boxShadow: `0 0 16px ${color}20`, flexShrink: 0,
              }}>{icon}</div>
              <div>
                <div style={{ fontFamily: FONT, fontSize: 48, fontWeight: 600, color: MED_C.text, letterSpacing: -1 }}>{title}</div>
                <div style={{ fontFamily: FONT, fontSize: 28, fontWeight: 400, color: MED_C.textMid, marginTop: 4 }}>
                  {i === 0 ? "PostgreSQL, APIs" : i === 1 ? "ETL + Enrichment" : "Real-time sync"}
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: MED_C.emerald, boxShadow: `0 0 8px ${MED_C.emerald}` }} />
                <span style={{ fontFamily: FONT, fontSize: 24, color: MED_C.emerald, fontWeight: 500 }}>Active</span>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const SaasPlaygroundAd: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* S1–S8: Original Vertex showcase (text-anim, ui, data-viz, spring, bg-fx, transitions, combined, cta) */}
      <Sequence from={0} durationInFrames={600}>
        <SaasShowcaseAd />
      </Sequence>

      {/* S9: Camera Movement Demo — corner growth sweep */}
      <Sequence from={592} durationInFrames={108}>
        <CameraMovementDemo />
      </Sequence>

      {/* S10: 3D Realm Demo — 3D orbit + perspective camera */}
      <Sequence from={692} durationInFrames={118}>
        <RealmDemo />
      </Sequence>

      {/* S11: Simple Component Animation — condensed sampler (pills, stats, testimonial) */}
      <Sequence from={802} durationInFrames={158}>
        <ComponentAnimationDemo />
      </Sequence>

      {/* S12: Medium Component Animation — condensed sampler (glow cards, data-flow) */}
      <Sequence from={952} durationInFrames={168}>
        <MediumComponentDemo />
      </Sequence>
    </AbsoluteFill>
  );
};
