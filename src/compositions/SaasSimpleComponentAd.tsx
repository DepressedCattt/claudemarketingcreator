/**
 * SaasSimpleComponentAd — "MotionRam" Simple Component Animation Showcase
 *
 * Demonstrates simple animated UI components inspired by the SaaS Product Promo
 * Final AE extract. Each scene showcases a different class of basic component
 * animation: pill buttons, stat cards, testimonial widgets, form elements, and CTA.
 * "Simple" = spring-driven slide + scale + opacity with stagger. Future "complex"
 * versions will add inter-component choreography and micro-interactions.
 *
 * Scenes:
 *   S1 "Build"   — Pill-shaped feature buttons stagger in from the right
 *   S2 "Measure" — Stat cards with animated counters and progress bars
 *   S3 "Connect" — Testimonial cards, star ratings, user badges
 *   S4 "Ship"    — Toggle switches, notification badges, action cards
 *   S5 CTA       — Brand close with MotionRam title and tagline
 *
 * AE reference:
 *   Source: SaaS_Product_Promo_Final.ae-extract.json
 *   BG color: [0.3709, 0.6947, 1] → #5EB1FF
 *   Card fill: [0.9725, 0.9725, 0.9725] → #F8F8F8
 *   Accent text: [0.1059, 0.3647, 1] → #1B5DFF
 *   Card roundness: 603 (pill), 60 (card)
 *   Font: Inter Medium/SemiBold
 *
 * Format:   16:9 4K (3840 × 2160)
 * Duration: 540 frames @ 30fps = 18 seconds
 * Category: saas (component-animation)
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

// ─── Design Tokens (from AE extract) ────────────────────────────────────────

const C = {
  bg:          "#5EB1FF",
  bgDark:      "#3A8FE0",
  bgDeep:      "#2E6FC0",
  bgPale:      "#B6D8F8",
  card:        "#F8F8F8",
  cardStroke:  "#83BBFF",
  accent:      "#1B5DFF",
  accentLight: "#4F8CFF",
  text:        "#131313",
  textMid:     "#666666",
  textLight:   "#F5FCFF",
  white:       "#FFFFFF",
  green:       "#22C55E",
  greenDark:   "#16A34A",
  star:        "#FBBF24",
  red:         "#EF4444",
  orange:      "#F97316",
  purple:      "#8B5CF6",
};

const FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;
const W = 3840;
const H = 2160;
const CX = W / 2;
const CY = H / 2;

// ─── Spring Presets ─────────────────────────────────────────────────────────

const SPR = {
  pill:  { stiffness: 160, damping: 24, mass: 0.85 },
  card:  { stiffness: 140, damping: 22, mass: 0.9 },
  text:  { stiffness: 170, damping: 25, mass: 0.8 },
  cta:   { stiffness: 120, damping: 18, mass: 0.9 },
  icon:  { stiffness: 200, damping: 20, mass: 0.7 },
};

// ─── Scene Fade ─────────────────────────────────────────────────────────────

const SceneFade: React.FC<{
  children: React.ReactNode;
  dur: number;
  fadeIn?: number;
  fadeOut?: number;
}> = ({ children, dur, fadeIn = 8, fadeOut = 10 }) => {
  const frame = useCurrentFrame();
  const inOp = fadeIn > 0 ? Math.min(1, frame / fadeIn) : 1;
  const outOp = fadeOut > 0 ? Math.min(1, (dur - frame) / fadeOut) : 1;
  const exitScale = fadeOut > 0 && dur - frame < fadeOut
    ? interpolate(frame, [dur - fadeOut, dur], [1, 0.97], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  return (
    <AbsoluteFill style={{ opacity: Math.max(0, Math.min(inOp, outOp)), transform: `scale(${exitScale})` }}>
      {children}
    </AbsoluteFill>
  );
};

// ─── Shared Primitives ──────────────────────────────────────────────────────

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
      fill={filled ? C.star : "transparent"}
      stroke={C.star}
      strokeWidth={1}
    />
  </svg>
);

const BgCircles: React.FC<{ color?: string }> = ({ color = C.white }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {[
        { x: 300, y: 400, size: 500, opacity: 0.12 },
        { x: 3200, y: 1600, size: 600, opacity: 0.1 },
        { x: 1800, y: 1800, size: 400, opacity: 0.08 },
        { x: 3400, y: 300, size: 350, opacity: 0.07 },
      ].map(({ x, y, size, opacity }, i) => (
        <div key={i} style={{
          position: "absolute",
          left: x - size / 2,
          top: y - size / 2 + Math.sin(frame * 0.02 + i * 2) * 6,
          width: size, height: size, borderRadius: "50%",
          background: `radial-gradient(circle, ${color}, transparent)`,
          opacity,
        }} />
      ))}
    </>
  );
};

const TitleBlock: React.FC<{
  title: string; subtitle: string; x?: number; y?: number;
  titleColor?: string; subtitleColor?: string;
}> = ({ title, subtitle, x = 200, y = 180, titleColor = C.white, subtitleColor = C.textLight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tp = spring({ frame: Math.max(0, frame - 4), fps, config: SPR.text });
  const blur = (1 - tp) * 10;

  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translateY(${(1 - tp) * 40}px)`,
      opacity: tp,
      filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
    }}>
      <div style={{
        fontFamily: FONT, fontSize: 160, fontWeight: 700,
        color: titleColor, letterSpacing: -4,
      }}>
        {title}
      </div>
      <div style={{
        fontFamily: FONT, fontSize: 48, fontWeight: 400,
        color: subtitleColor, opacity: 0.7,
        letterSpacing: 2, textTransform: "uppercase" as const, marginTop: 8,
      }}>
        {subtitle}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 1: "Build" — Pill buttons with staggered slide-in + checkmarks
// ═════════════════════════════════════════════════════════════════════════════

const SceneBuild: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pill = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.pill });
  const check = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.icon });

  const buttons = [
    { label: "Add project",    delay: 10, checkDelay: 30 },
    { label: "Assign tasks",   delay: 16, checkDelay: 36 },
    { label: "Track progress", delay: 22, checkDelay: 42 },
  ];

  return (
    <SceneFade dur={100} fadeIn={1} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <BgCircles />
        <TitleBlock title="Build" subtitle="feature buttons" />

        {/* Pill buttons — right column */}
        {buttons.map(({ label, delay, checkDelay }, i) => {
          const p = pill(delay);
          const cp = check(checkDelay);
          const yPos = 560 + i * 240;
          return (
            <div key={i} style={{
              position: "absolute", right: 300, top: yPos,
              width: 1000, height: 200, borderRadius: 200,
              background: C.card,
              boxShadow: `0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)`,
              border: `2px solid ${C.cardStroke}`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 28,
              transform: `translateX(${(1 - p) * 600}px) scale(${0.85 + p * 0.15})`,
              opacity: p,
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                background: `${C.green}18`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Checkmark size={32} color={C.green} progress={cp} />
              </div>
              <span style={{
                fontFamily: FONT, fontSize: 80, fontWeight: 500,
                color: C.accent, letterSpacing: -2,
              }}>
                {label}
              </span>
            </div>
          );
        })}

        {/* Arrow connectors */}
        {[0, 1].map(i => {
          const p = pill(buttons[i + 1].delay);
          return (
            <div key={`a${i}`} style={{
              position: "absolute", right: 800, top: 770 + i * 240,
              opacity: p * 0.5,
              transform: `scaleY(${p})`, transformOrigin: "top center",
            }}>
              <svg width={40} height={120} viewBox="0 0 40 120">
                <line x1={20} y1={0} x2={20} y2={100} stroke={C.white} strokeWidth={3} strokeDasharray="8 6" />
                <path d="M12 92 L20 108 L28 92" fill="none" stroke={C.white} strokeWidth={3} strokeLinecap="round" />
              </svg>
            </div>
          );
        })}

        {/* Large decorative card behind buttons */}
        {(() => {
          const p = pill(6);
          return (
            <div style={{
              position: "absolute", right: 180, top: 460,
              width: 1240, height: 900, borderRadius: 80,
              background: `${C.white}12`,
              border: `1.5px solid ${C.white}25`,
              transform: `scale(${0.95 + p * 0.05})`,
              opacity: p * 0.4,
            }} />
          );
        })()}

        {/* Floating label badges */}
        {[
          { label: "v2.1", x: 200, y: 700, delay: 35 },
          { label: "PRO", x: 200, y: 900, delay: 40 },
        ].map(({ label, x, y, delay }, i) => {
          const p = pill(delay);
          return (
            <div key={`badge${i}`} style={{
              position: "absolute", left: x, top: y,
              borderRadius: 60, padding: "16px 48px",
              background: `${C.white}20`,
              border: `1.5px solid ${C.white}40`,
              transform: `scale(${0.7 + p * 0.3})`, opacity: p,
            }}>
              <span style={{
                fontFamily: FONT, fontSize: 48, fontWeight: 600,
                color: C.white, letterSpacing: 1,
              }}>
                {label}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 2: "Measure" — Stat cards with animated counters and progress bars
// ═════════════════════════════════════════════════════════════════════════════

const SceneMeasure: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.card });
  const icon = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.icon });

  const statProgress = card(20);
  const statVal = Math.round(95 * statProgress);

  const stats = [
    { value: "1,200+", label: "Active Users", delay: 20, bg: C.accent },
    { value: "99.9%",  label: "Uptime",       delay: 28, bg: C.green },
    { value: "4.8★",   label: "Rating",       delay: 36, bg: C.purple },
  ];

  return (
    <SceneFade dur={110} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bgDark }}>
        <BgCircles color={C.bgPale} />
        <TitleBlock title="Measure" subtitle="stats & data cards" />

        {/* Large stat card */}
        {(() => {
          const p = card(12);
          return (
            <div style={{
              position: "absolute", left: 200, top: 560,
              width: 1200, height: 600,
              borderRadius: 60, background: C.card,
              boxShadow: `0 16px 64px rgba(0,0,0,0.12)`,
              border: `2px solid ${C.cardStroke}`,
              transform: `translateY(${(1 - p) * 80}px) scale(${0.9 + p * 0.1})`,
              opacity: p,
              display: "flex", flexDirection: "column" as const,
              alignItems: "center", justifyContent: "center",
              padding: 48,
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 200, fontWeight: 700,
                color: C.text, letterSpacing: -6, lineHeight: 1,
              }}>
                {statVal}<span style={{ fontSize: 110, color: "#999" }}>/100</span>
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 56, fontWeight: 500,
                color: C.textMid, letterSpacing: -1, marginTop: 16,
              }}>
                Satisfied Customers
              </div>
              <div style={{
                width: "85%", height: 20, borderRadius: 10,
                background: "#E8E8E8", marginTop: 36, overflow: "hidden",
              }}>
                <div style={{
                  width: `${statProgress * 95}%`, height: "100%",
                  borderRadius: 10,
                  background: `linear-gradient(90deg, ${C.accent}, ${C.accentLight})`,
                }} />
              </div>
            </div>
          );
        })()}

        {/* Mini stat pills — right column */}
        {stats.map(({ value, label, delay, bg }, i) => {
          const p = card(delay);
          return (
            <div key={i} style={{
              position: "absolute", right: 300, top: 560 + i * 210,
              width: 900, height: 180,
              borderRadius: 48, background: C.white,
              boxShadow: `0 8px 32px rgba(0,0,0,0.06)`,
              border: `2px solid ${C.cardStroke}`,
              transform: `translateX(${(1 - p) * 400}px)`,
              opacity: p,
              display: "flex", alignItems: "center", padding: "0 48px", gap: 28,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: `${bg}15`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: bg,
                  transform: `scale(${icon(delay + 8)})`,
                }} />
              </div>
              <div>
                <div style={{
                  fontFamily: FONT, fontSize: 72, fontWeight: 700,
                  color: C.text, letterSpacing: -2,
                }}>
                  {value}
                </div>
                <div style={{
                  fontFamily: FONT, fontSize: 36, fontWeight: 400, color: "#999",
                }}>
                  {label}
                </div>
              </div>
            </div>
          );
        })}

        {/* Animated ring */}
        {(() => {
          const p = card(15);
          const circumference = 2 * Math.PI * 80;
          return (
            <svg style={{ position: "absolute", left: 200, top: 1260 }}
              width={200} height={200} viewBox="0 0 200 200">
              <circle cx={100} cy={100} r={80}
                fill="none" stroke={`${C.white}30`} strokeWidth={12} />
              <circle cx={100} cy={100} r={80}
                fill="none" stroke={C.white} strokeWidth={12}
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - p * 0.95)}
                strokeLinecap="round"
                transform="rotate(-90 100 100)" />
            </svg>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 3: "Connect" — Testimonial cards + star ratings + social proof
// ═════════════════════════════════════════════════════════════════════════════

const SceneConnect: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.card });
  const pill = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.pill });

  const testimonials = [
    { quote: "\"Game changer for our team.\"", author: "Sarah Chen", role: "CTO, Nexus", delay: 12 },
    { quote: "\"Saved us 3 hours daily.\"", author: "Robert Laurence", role: "PM, Vertex", delay: 22 },
  ];

  return (
    <SceneFade dur={100} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
        <BgCircles />
        <TitleBlock title="Connect" subtitle="social proof & reviews" />

        {/* Testimonial cards */}
        {testimonials.map(({ quote, author, role, delay }, i) => {
          const p = card(delay);
          const yPos = 560 + i * 520;
          return (
            <div key={i} style={{
              position: "absolute", left: 200, top: yPos,
              width: 1400, height: 440,
              borderRadius: 60, background: C.white,
              boxShadow: `0 12px 48px rgba(0,0,0,0.08)`,
              border: `2px solid ${C.cardStroke}`,
              transform: `translateX(${(1 - p) * (i % 2 === 0 ? -200 : 200)}px) scale(${0.9 + p * 0.1})`,
              opacity: p,
              padding: "48px 64px",
              display: "flex", flexDirection: "column" as const,
              justifyContent: "center",
            }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {[0, 1, 2, 3, 4].map(j => {
                  const starP = pill(delay + 10 + j * 3);
                  return (
                    <div key={j} style={{ transform: `scale(${starP})`, opacity: starP }}>
                      <StarIcon size={52} filled />
                    </div>
                  );
                })}
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 80, fontWeight: 600,
                color: C.text, letterSpacing: -2, lineHeight: 1.2,
              }}>
                {quote}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.accent}, ${C.accentLight})`,
                }} />
                <div>
                  <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 600, color: C.text }}>
                    {author}
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 400, color: "#888" }}>
                    {role}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Users count badge — right side */}
        {(() => {
          const p = card(35);
          return (
            <div style={{
              position: "absolute", right: 300, top: 600,
              borderRadius: 100,
              background: `linear-gradient(135deg, ${C.accent}, #4F6CFF)`,
              padding: "36px 72px",
              boxShadow: `0 12px 48px ${C.accent}40`,
              transform: `scale(${0.5 + p * 0.5})`, opacity: p,
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 80, fontWeight: 700,
                color: C.white, letterSpacing: -2,
              }}>
                1,200+ users
              </div>
            </div>
          );
        })()}

        {/* Trust badge */}
        {(() => {
          const p = card(42);
          return (
            <div style={{
              position: "absolute", right: 300, top: 840,
              width: 700, height: 180,
              borderRadius: 90, background: C.card,
              border: `2px solid ${C.cardStroke}`,
              boxShadow: `0 8px 32px rgba(0,0,0,0.06)`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 20,
              transform: `translateY(${(1 - p) * 40}px)`, opacity: p,
            }}>
              <Checkmark size={40} color={C.green} progress={pill(50)} />
              <span style={{
                fontFamily: FONT, fontSize: 52, fontWeight: 600,
                color: C.text,
              }}>
                SOC 2 Certified
              </span>
            </div>
          );
        })()}

        {/* Rating summary */}
        {(() => {
          const p = card(48);
          return (
            <div style={{
              position: "absolute", right: 340, top: 1100,
              width: 620, height: 400,
              borderRadius: 48, background: C.white,
              boxShadow: `0 8px 32px rgba(0,0,0,0.06)`,
              border: `2px solid ${C.cardStroke}`,
              transform: `scale(${0.9 + p * 0.1})`, opacity: p,
              display: "flex", flexDirection: "column" as const,
              alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                fontFamily: FONT, fontSize: 120, fontWeight: 700,
                color: C.text, letterSpacing: -4,
              }}>
                4.9
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {[0, 1, 2, 3, 4].map(j => (
                  <StarIcon key={j} size={40} filled />
                ))}
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 36, fontWeight: 400,
                color: "#999", marginTop: 12,
              }}>
                2,847 reviews
              </div>
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 4: "Ship" — Toggle switches, notification badges, action cards
// ═════════════════════════════════════════════════════════════════════════════

const ToggleSwitch: React.FC<{
  x: number; y: number; label: string;
  delay: number; activateDelay: number;
}> = ({ x, y, label, delay, activateDelay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const appear = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.card });
  const active = spring({ frame: Math.max(0, frame - activateDelay), fps, config: SPR.icon });

  const trackW = 140;
  const trackH = 72;
  const knobSize = 60;
  const knobX = 6 + active * (trackW - knobSize - 12);
  const trackColor = interpolate(active, [0, 1], [0, 1]);

  return (
    <div style={{
      position: "absolute", left: x, top: y,
      display: "flex", alignItems: "center", gap: 28,
      transform: `translateY(${(1 - appear) * 50}px)`,
      opacity: appear,
    }}>
      <div style={{
        width: trackW, height: trackH, borderRadius: trackH,
        background: trackColor > 0.5 ? C.green : "#D1D5DB",
        position: "relative",
        transition: "background 0.2s",
      }}>
        <div style={{
          position: "absolute", left: knobX, top: 6,
          width: knobSize, height: knobSize, borderRadius: "50%",
          background: C.white,
          boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
        }} />
      </div>
      <span style={{
        fontFamily: FONT, fontSize: 56, fontWeight: 500,
        color: C.white,
      }}>
        {label}
      </span>
    </div>
  );
};

const SceneShip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const card = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.card });
  const pill = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.pill });

  const notifications = [
    { icon: "📦", text: "Build deployed to production", time: "Just now", delay: 25 },
    { icon: "✅", text: "All 47 tests passing", time: "2m ago", delay: 32 },
    { icon: "🚀", text: "v2.1 released to 1,200 users", time: "5m ago", delay: 39 },
  ];

  return (
    <SceneFade dur={100} fadeIn={8} fadeOut={10}>
      <AbsoluteFill style={{ backgroundColor: C.bgDeep }}>
        <BgCircles color={C.bgPale} />
        <TitleBlock title="Ship" subtitle="toggles & notifications" />

        {/* Toggle switches */}
        <ToggleSwitch x={200} y={560} label="Auto Deploy" delay={8} activateDelay={30} />
        <ToggleSwitch x={200} y={680} label="Notifications" delay={12} activateDelay={34} />
        <ToggleSwitch x={200} y={800} label="Analytics" delay={16} activateDelay={38} />

        {/* Notification cards */}
        {notifications.map(({ icon, text, time, delay }, i) => {
          const p = card(delay);
          return (
            <div key={i} style={{
              position: "absolute", right: 200, top: 560 + i * 220,
              width: 1200, height: 190,
              borderRadius: 40, background: C.card,
              boxShadow: `0 8px 32px rgba(0,0,0,0.08)`,
              border: `2px solid ${C.cardStroke}`,
              display: "flex", alignItems: "center", padding: "0 40px", gap: 28,
              transform: `translateX(${(1 - p) * 500}px)`,
              opacity: p,
            }}>
              <div style={{
                fontSize: 56, width: 80, height: 80, borderRadius: 20,
                background: `${C.accent}10`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: FONT, fontSize: 52, fontWeight: 600,
                  color: C.text, letterSpacing: -1,
                }}>
                  {text}
                </div>
                <div style={{
                  fontFamily: FONT, fontSize: 36, fontWeight: 400,
                  color: "#999", marginTop: 4,
                }}>
                  {time}
                </div>
              </div>
            </div>
          );
        })}

        {/* Subscribe CTA button */}
        {(() => {
          const p = pill(45);
          const pulse = 1 + Math.sin(frame * 0.06) * 0.012 * p;
          return (
            <div style={{
              position: "absolute", left: CX, bottom: 300,
              transform: `translateX(-50%) scale(${(0.7 + p * 0.3) * pulse})`,
              opacity: p,
            }}>
              <div style={{
                width: 900, height: 180,
                borderRadius: 180,
                background: `linear-gradient(135deg, #1B4DFF, ${C.accent})`,
                boxShadow: `0 12px 48px ${C.accent}50`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{
                  fontFamily: FONT, fontSize: 72, fontWeight: 600,
                  color: C.white, letterSpacing: -2,
                }}>
                  Subscribe Now
                </span>
              </div>
            </div>
          );
        })()}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// SCENE 5: CTA — Brand close with gentle breathing
// ═════════════════════════════════════════════════════════════════════════════

const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const txt = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.text });
  const cta = (d: number) => spring({ frame: Math.max(0, frame - d), fps, config: SPR.cta });

  const breathe = Math.sin(frame * 0.04) * 0.006;

  return (
    <SceneFade dur={130} fadeIn={8} fadeOut={1}>
      <AbsoluteFill style={{
        backgroundColor: C.bg,
        transform: `scale(${1 + breathe})`,
      }}>
        <BgCircles />

        {/* Brand name */}
        {(() => {
          const p = txt(6);
          const blur = (1 - p) * 12;
          return (
            <div style={{
              position: "absolute", left: CX, top: CY - 200,
              transform: `translate(-50%, -50%) scale(${0.9 + p * 0.1})`,
              fontFamily: FONT, fontSize: 280, fontWeight: 700,
              color: C.white, letterSpacing: -8,
              opacity: p,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
            }}>
              MotionRam
            </div>
          );
        })()}

        {/* Tagline */}
        {(() => {
          const p = txt(14);
          return (
            <div style={{
              position: "absolute", left: CX, top: CY - 20,
              transform: "translate(-50%, -50%)",
              fontFamily: FONT, fontSize: 72, fontWeight: 400,
              color: C.textLight, opacity: p * 0.8,
              letterSpacing: 2,
            }}>
              Organize your work in minutes.
            </div>
          );
        })()}

        {/* CTA button */}
        {(() => {
          const p = cta(22);
          const pulse = 1 + Math.sin(frame * 0.05) * 0.015 * p;
          return (
            <div style={{
              position: "absolute", left: CX, top: CY + 140,
              transform: `translate(-50%, -50%) scale(${(0.7 + p * 0.3) * pulse})`,
              opacity: p,
            }}>
              <div style={{
                padding: "40px 100px",
                borderRadius: 200,
                background: C.white,
                boxShadow: `0 12px 48px rgba(0,0,0,0.15)`,
              }}>
                <span style={{
                  fontFamily: FONT, fontSize: 80, fontWeight: 600,
                  color: C.accent, letterSpacing: -2,
                }}>
                  Get Started Free
                </span>
              </div>
            </div>
          );
        })()}

        {/* Small social proof line */}
        {(() => {
          const p = txt(30);
          return (
            <div style={{
              position: "absolute", left: CX, top: CY + 340,
              transform: "translate(-50%, -50%)",
              display: "flex", alignItems: "center", gap: 16,
              opacity: p * 0.6,
            }}>
              <div style={{ display: "flex", gap: 4 }}>
                {[0, 1, 2, 3, 4].map(i => (
                  <StarIcon key={i} size={32} filled />
                ))}
              </div>
              <span style={{
                fontFamily: FONT, fontSize: 40, fontWeight: 400,
                color: C.white, opacity: 0.8,
              }}>
                Loved by 1,200+ teams
              </span>
            </div>
          );
        })()}

        {/* Floating component ghost elements for visual interest */}
        {[
          { x: 300, y: 500, w: 500, h: 120, r: 60, delay: 10 },
          { x: 3100, y: 400, w: 400, h: 100, r: 50, delay: 14 },
          { x: 400, y: 1600, w: 450, h: 110, r: 55, delay: 18 },
          { x: 3200, y: 1700, w: 380, h: 100, r: 50, delay: 22 },
        ].map(({ x, y, w, h, r, delay }, i) => {
          const p = txt(delay);
          return (
            <div key={`ghost${i}`} style={{
              position: "absolute", left: x, top: y + Math.sin(frame * 0.02 + i * 1.5) * 8,
              width: w, height: h, borderRadius: r,
              background: `${C.white}10`,
              border: `1px solid ${C.white}20`,
              opacity: p * 0.3,
            }} />
          );
        })}
      </AbsoluteFill>
    </SceneFade>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPOSITION
// ═════════════════════════════════════════════════════════════════════════════

export const SaasSimpleComponentAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, overflow: "hidden" }}>
      {/* S1: Build — pill buttons stagger in */}
      <Sequence from={0} durationInFrames={100}>
        <SceneBuild />
      </Sequence>

      {/* S2: Measure — stat cards + counters */}
      <Sequence from={92} durationInFrames={110}>
        <SceneMeasure />
      </Sequence>

      {/* S3: Connect — testimonials + social proof */}
      <Sequence from={195} durationInFrames={100}>
        <SceneConnect />
      </Sequence>

      {/* S4: Ship — toggles + notifications */}
      <Sequence from={288} durationInFrames={100}>
        <SceneShip />
      </Sequence>

      {/* S5: CTA — brand close */}
      <Sequence from={380} durationInFrames={160}>
        <SceneCTA />
      </Sequence>
    </AbsoluteFill>
  );
};
