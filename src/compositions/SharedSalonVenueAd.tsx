/**
 * Shared Salon — Venue Owner Ad
 * "Your chairs sit empty. That's $12,480/year you're not earning."
 *
 * 9:16 vertical (1080×1920), 450 frames (15s) @30fps
 *
 * Scene 1 (0–90f,   3.0s): HOOK      — Dark dramatic: word slam + empty chair
 * Scene 2 (90–210f,  4.0s): COST     — $12,480 slams to full screen
 * Scene 3 (210–375f, 5.5s): SOLUTION — Bookings fill the frame, revenue climbs
 * Scene 4 (375–450f, 2.5s): CTA      — "List your chairs. Start earning."
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

/* ─── SHARED SALON BRAND TOKENS ─── */
const C = {
  bg:       "#FAF8F5",
  primary:  "#2563EB",
  secondary:"#DCE8FF",
  accent:   "#E7D3A7",
  text:     "#0B1730",
  body:     "#66758F",
  border:   "#D8DEE8",
  surface:  "#F4F7FC",
  glow:     "rgba(37,99,235,0.14)",
};

/* ─── EASING ─── */
const easeOut3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const easeOut4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const easeSnap = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);

/* ─── SALON CHAIR SVG ─── */
const SalonChair: React.FC<{ color?: string; size?: number; frame?: number }> = ({
  color = C.primary,
  size = 1,
  frame = 0,
}) => {
  const w = Math.round(240 * size);
  const h = Math.round(340 * size);
  const pulse = 0.65 + Math.sin(frame * 0.04) * 0.35;

  return (
    <div style={{ position: "relative", width: w, height: h }}>
      {/* Ambient glow halo */}
      <div style={{
        position: "absolute", left: "50%", top: "40%",
        transform: "translate(-50%, -50%)",
        width: w * 2, height: w * 2, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,${0.22 * pulse}) 0%, transparent 68%)`,
        pointerEvents: "none",
      }} />
      <svg width={w} height={h} viewBox="0 0 240 340">
        {/* Shadow */}
        <ellipse cx={120} cy={334} rx={88} ry={7} fill={`${color}1A`} />
        {/* Head cushion */}
        <rect x={82} y={8} width={76} height={34} rx={13} fill={color} />
        {/* Backrest */}
        <rect x={55} y={38} width={130} height={148} rx={18} fill={color} />
        {/* Highlight stripe */}
        <rect x={66} y={50} width={20} height={118} rx={10} fill="rgba(255,255,255,0.13)" />
        {/* Seat */}
        <rect x={36} y={178} width={168} height={70} rx={14} fill={color} />
        {/* Seat highlight */}
        <rect x={46} y={184} width={148} height={18} rx={9} fill="rgba(255,255,255,0.07)" />
        {/* Left arm */}
        <rect x={10} y={180} width={36} height={14} rx={7} fill={color} opacity={0.82} />
        <rect x={10} y={178} width={14} height={34} rx={7} fill={color} opacity={0.82} />
        {/* Right arm */}
        <rect x={194} y={180} width={36} height={14} rx={7} fill={color} opacity={0.82} />
        <rect x={216} y={178} width={14} height={34} rx={7} fill={color} opacity={0.82} />
        {/* Column */}
        <rect x={106} y={248} width={28} height={58} rx={7} fill={color} opacity={0.65} />
        {/* 5-star base */}
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          return (
            <React.Fragment key={i}>
              <line
                x1={120} y1={308}
                x2={120 + Math.cos(rad) * 74}
                y2={308 + Math.sin(rad) * 12}
                stroke={color} strokeWidth={11} strokeLinecap="round" opacity={0.6}
              />
              <circle
                cx={120 + Math.cos(rad) * 74}
                cy={308 + Math.sin(rad) * 12}
                r={7} fill={color} opacity={0.42}
              />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

/* ─── AMBIENT SPARKLES ─── */
const Sparkles: React.FC<{ color?: string; count?: number }> = ({
  color = C.accent,
  count = 10,
}) => {
  const frame = useCurrentFrame();
  const defs = [
    { x: 74,  y: 220,  p: 72, d: 0,  s: 5 },
    { x: 960, y: 340,  p: 60, d: 14, s: 4 },
    { x: 200, y: 560,  p: 84, d: 28, s: 6 },
    { x: 880, y: 720,  p: 66, d: 8,  s: 4 },
    { x: 130, y: 920,  p: 76, d: 40, s: 5 },
    { x: 930, y: 1060, p: 62, d: 18, s: 4 },
    { x: 360, y: 1240, p: 80, d: 44, s: 6 },
    { x: 800, y: 1440, p: 68, d: 30, s: 4 },
    { x: 160, y: 1620, p: 74, d: 52, s: 5 },
    { x: 880, y: 1760, p: 58, d: 22, s: 4 },
  ];
  return (
    <>
      {defs.slice(0, count).map((s, i) => {
        const phase = ((frame + s.d * 4) % s.p) / s.p;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: s.x, top: s.y,
              width: s.s, height: s.s, borderRadius: "50%",
              background: color,
              opacity: Math.sin(phase * Math.PI) * 0.55,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};

/* ─── BOOKING ROW ─── */
const BookingRow: React.FC<{
  startFrame: number;
  name: string;
  initials: string;
  service: string;
  day: string;
  time: string;
  amount: number;
  avatarColor: string;
}> = ({ startFrame, name, initials, service, day, time, amount, avatarColor }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const t = easeSnap(Math.max(0, Math.min(localFrame / 22, 1)));
  const opacity = interpolate(t, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        transform: `translateX(${(1 - t) * 260}px)`,
        opacity,
        background: "white",
        border: `1.5px solid ${C.border}`,
        borderRadius: 24,
        padding: "28px 36px",
        display: "flex",
        alignItems: "center",
        gap: 28,
        boxShadow: "0 6px 28px rgba(11,23,48,0.08)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 88, height: 88, borderRadius: "50%",
          background: `${avatarColor}14`,
          border: `2px solid ${avatarColor}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 800, color: avatarColor,
          fontFamily: "system-ui, sans-serif", flexShrink: 0,
        }}
      >
        {initials}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: avatarColor, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>
          {service}
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>
          {name}
        </div>
        <div style={{ fontSize: 20, color: C.body, fontFamily: "system-ui, sans-serif" }}>
          {day} · {time}
        </div>
      </div>

      {/* Amount + status */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 48, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1 }}>
          ${amount}
        </div>
        <div style={{ fontSize: 14, color: "#16A34A", fontFamily: "system-ui, sans-serif", fontWeight: 700, letterSpacing: 1, marginTop: 4 }}>
          ✓ CONFIRMED
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════ SCENE 1: HOOK ═══════════════════ */
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();

  const words = [
    { text: "YOUR",    delay: 0,  size: 168, color: "rgba(255,255,255,0.95)" },
    { text: "CHAIRS",  delay: 10, size: 168, color: C.secondary },
    { text: "SIT",     delay: 22, size: 120, color: "rgba(255,255,255,0.45)" },
    { text: "EMPTY.",  delay: 32, size: 168, color: C.accent },
  ];

  const chairT = easeOut3(Math.min(frame / 30, 1));
  const subT   = easeOut3(Math.max(0, Math.min((frame - 56) / 20, 1)));
  const floatY = Math.sin(frame * 0.028) * 8;

  return (
    <AbsoluteFill style={{ background: C.text }}>
      {/* Deep blue glow */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 800, height: 800, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,0.09) 0%, transparent 70%)`,
      }} />

      <Sparkles color={C.accent} count={8} />

      {/* Left: word slam */}
      <div style={{
        position: "absolute",
        left: 72, right: "40%",
        top: "50%",
        transform: "translateY(-52%)",
      }}>
        {words.map((word, i) => {
          const t = easeOut4(Math.max(0, Math.min((frame - word.delay) / 16, 1)));
          return (
            <div key={i} style={{ overflow: "hidden" }}>
              <div style={{
                fontSize: word.size,
                fontWeight: 900,
                color: word.color,
                fontFamily: "system-ui, sans-serif",
                letterSpacing: -6,
                lineHeight: 0.9,
                textTransform: "uppercase",
                transform: `translateX(${(1 - t) * -110}px)`,
                opacity: interpolate(t, [0, 0.2], [0, 1]),
              }}>
                {word.text}
              </div>
            </div>
          );
        })}

        {/* Sub */}
        <div style={{
          marginTop: 36,
          fontSize: 26,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 500,
          lineHeight: 1.6,
          opacity: subT,
          transform: `translateY(${(1 - subT) * 20}px)`,
          borderLeft: `3px solid ${C.primary}`,
          paddingLeft: 20,
        }}>
          Every idle chair is<br />potential revenue leaving<br />through the door.
        </div>
      </div>

      {/* Right: Muted/empty chair */}
      <div style={{
        position: "absolute",
        right: 40, top: "50%",
        transform: `translateY(calc(-50% + ${floatY}px)) scale(${0.8 + chairT * 0.2})`,
        opacity: chairT * 0.55,
      }}>
        <SalonChair color="rgba(220,232,255,0.25)" size={1.4} frame={frame} />
      </div>

      {/* "IDLE" badge on chair */}
      <div style={{
        position: "absolute",
        right: 100, top: "56%",
        fontSize: 26, fontWeight: 700,
        color: "rgba(255,255,255,0.28)",
        fontFamily: "system-ui, sans-serif",
        letterSpacing: 4, textTransform: "uppercase",
        opacity: easeOut3(Math.max(0, Math.min((frame - 42) / 16, 1))),
      }}>
        IDLE
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 2: COST ═══════════════════ */
const SceneCost: React.FC = () => {
  const frame = useCurrentFrame();

  const labelT  = easeOut4(Math.min(frame / 14, 1));
  const numT    = easeSnap(Math.max(0, Math.min((frame - 8) / 22, 1)));
  const sub1T   = easeOut3(Math.max(0, Math.min((frame - 36) / 18, 1)));
  const sub2T   = easeOut3(Math.max(0, Math.min((frame - 80) / 16, 1)));
  const teaserT = easeOut3(Math.max(0, Math.min((frame - 96) / 16, 1)));

  return (
    <AbsoluteFill style={{ background: C.text }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 50%, rgba(37,99,235,0.09) 0%, transparent 60%)`,
      }} />

      <Sparkles color={C.accent} count={10} />

      {/* Label */}
      <div style={{
        position: "absolute",
        top: 140, left: 0, right: 0, textAlign: "center",
        opacity: labelT,
        transform: `translateY(${(1 - labelT) * -18}px)`,
      }}>
        <span style={{
          display: "inline-block",
          fontSize: 19,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 4,
          borderBottom: `1px solid ${C.border}40`,
          paddingBottom: 8,
        }}>
          Annual cost of one idle chair
        </span>
      </div>

      {/* The number */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: "50%", transform: "translateY(-56%)",
        textAlign: "center",
        transform: `translateY(-56%) scale(${0.7 + numT * 0.3})`,
        opacity: numT,
      }}>
        <div style={{
          fontSize: 240,
          fontWeight: 900,
          color: "white",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -12,
          lineHeight: 1,
        }}>
          <span style={{ color: C.accent, fontSize: 140, verticalAlign: "top", lineHeight: 1.35 }}>$</span>
          12,480
        </div>
      </div>

      {/* Sub lines */}
      <div style={{
        position: "absolute",
        bottom: 340, left: 0, right: 0,
        textAlign: "center",
        opacity: sub1T,
        transform: `translateY(${(1 - sub1T) * 20}px)`,
      }}>
        <div style={{ fontSize: 34, color: C.secondary, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>
          in lost revenue per year
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: 270, left: 0, right: 0,
        textAlign: "center",
        opacity: sub2T,
      }}>
        <div style={{ fontSize: 22, color: "rgba(255,255,255,0.35)", fontFamily: "system-ui, sans-serif" }}>
          3 idle days per week · $80/day · 52 weeks
        </div>
      </div>

      {/* Solution teaser */}
      <div style={{
        position: "absolute",
        bottom: 130, left: 0, right: 0,
        textAlign: "center",
        opacity: teaserT,
        transform: `translateY(${(1 - teaserT) * 18}px)`,
      }}>
        <div style={{
          display: "inline-block",
          background: `${C.primary}25`,
          border: `1.5px solid ${C.primary}45`,
          borderRadius: 100,
          padding: "14px 40px",
          fontSize: 22,
          fontWeight: 700,
          color: C.secondary,
          fontFamily: "system-ui, sans-serif",
        }}>
          Shared Salon fills those gaps →
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 3: SOLUTION ═══════════════════ */
const SceneSolution: React.FC = () => {
  const frame = useCurrentFrame();

  const BOOKINGS = [
    { name: "Jessica M.", initials: "JM", service: "Balayage · Colour", day: "Monday",    time: "9:00 AM",  amount: 95,  color: C.primary,   delay: 8   },
    { name: "Sophie L.",  initials: "SL", service: "Cut & Style",       day: "Tuesday",   time: "2:00 PM",  amount: 85,  color: "#7C3AED",   delay: 24  },
    { name: "Marcus R.",  initials: "MR", service: "Colour Treatment",   day: "Wednesday", time: "10:00 AM", amount: 110, color: "#0891B2",   delay: 42  },
    { name: "Anna K.",    initials: "AK", service: "Braiding & Style",   day: "Thursday",  time: "1:00 PM",  amount: 90,  color: "#059669",   delay: 60  },
    { name: "Tom B.",     initials: "TB", service: "Men's Cut & Finish", day: "Friday",    time: "11:00 AM", amount: 100, color: "#DC2626",   delay: 78  },
    { name: "Lara S.",    initials: "LS", service: "Blowout & Style",    day: "Saturday",  time: "9:00 AM",  amount: 120, color: "#B45309",   delay: 96  },
  ];

  const total = BOOKINGS.reduce((sum, b) => sum + (frame > b.delay + 22 ? b.amount : 0), 0);

  const headerT = easeOut4(Math.min(frame / 14, 1));
  const projT   = easeOut3(Math.max(0, Math.min((frame - 120) / 20, 1)));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Top gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 500,
        background: `linear-gradient(180deg, ${C.secondary}55 0%, transparent 100%)`,
      }} />

      <Sparkles color={C.accent} count={8} />

      {/* Header row */}
      <div style={{
        position: "absolute",
        top: 60, left: 72, right: 72,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        opacity: headerT,
        transform: `translateY(${(1 - headerT) * -22}px)`,
      }}>
        <div>
          <div style={{ fontSize: 17, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 4 }}>
            Shared Salon Bookings
          </div>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1 }}>
            This week
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 15, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 600, marginBottom: 2 }}>EARNED</div>
          <div style={{ fontSize: 76, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -3, lineHeight: 1 }}>
            ${total}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        position: "absolute", top: 224, left: 72, right: 72,
        height: 1.5, background: C.border, opacity: headerT,
      }} />

      {/* Booking rows */}
      <div style={{
        position: "absolute",
        top: 240, left: 60, right: 60,
        display: "flex", flexDirection: "column", gap: 14,
      }}>
        {BOOKINGS.map((b, i) => (
          <BookingRow key={i} startFrame={b.delay} {...b} avatarColor={b.color} />
        ))}
      </div>

      {/* Monthly projection panel */}
      <div style={{
        position: "absolute",
        bottom: 40, left: 60, right: 60,
        opacity: projT,
        transform: `translateY(${(1 - projT) * 28}px)`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, #1D4ED8 100%)`,
          borderRadius: 28,
          padding: "32px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: `0 12px 40px rgba(37,99,235,0.30)`,
        }}>
          <div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.65)", fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 4 }}>
              Projected monthly
            </div>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.75)", fontFamily: "system-ui, sans-serif" }}>
              per chair · one venue
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 88, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif", letterSpacing: -4, lineHeight: 1 }}>
              $2,400
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 4: CTA ═══════════════════ */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT  = easeOut3(Math.min(frame / 14, 1));
  const h1T  = easeOut4(Math.max(0, Math.min((frame - 4)  / 18, 1)));
  const h2T  = easeOut4(Math.max(0, Math.min((frame - 12) / 18, 1)));
  const btnT = easeSnap(Math.max(0, Math.min((frame - 22) / 16, 1)));
  const urlT = easeOut3(Math.max(0, Math.min((frame - 42) / 14, 1)));

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: bgT }}>
      {/* Blue gradient wash */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 700,
        background: `linear-gradient(180deg, ${C.secondary}65 0%, transparent 100%)`,
      }} />

      <Sparkles color={C.accent} count={10} />

      {/* Chair — right side, glowing, active */}
      <div style={{
        position: "absolute", right: 60, top: "50%",
        transform: "translateY(-55%)",
        opacity: bgT * 0.85,
      }}>
        <SalonChair color={C.primary} size={1.35} frame={frame + 60} />
      </div>

      {/* Left content */}
      <div style={{
        position: "absolute",
        left: 72, right: "44%",
        top: "50%",
        transform: "translateY(-50%)",
      }}>
        {/* Beta badge */}
        <div style={{
          display: "inline-block",
          background: `${C.accent}55`,
          border: `1.5px solid ${C.accent}88`,
          borderRadius: 100,
          padding: "8px 24px",
          fontSize: 18,
          fontWeight: 700,
          color: "#7A5C14",
          fontFamily: "system-ui, sans-serif",
          marginBottom: 28,
          opacity: h1T,
        }}>
          Beta Access Open
        </div>

        {/* Headline */}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            fontSize: 108,
            fontWeight: 900,
            color: C.text,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -5,
            lineHeight: 0.92,
            textTransform: "uppercase",
            opacity: h1T,
            transform: `translateY(${(1 - h1T) * 60}px)`,
          }}>
            JOIN
          </div>
        </div>
        <div style={{ overflow: "hidden" }}>
          <div style={{
            fontSize: 108,
            fontWeight: 900,
            color: C.text,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -5,
            lineHeight: 0.92,
            textTransform: "uppercase",
            opacity: h1T,
            transform: `translateY(${(1 - h1T) * 60}px)`,
          }}>
            THE
          </div>
        </div>
        <div style={{ overflow: "hidden", marginBottom: 32 }}>
          <div style={{
            fontSize: 108,
            fontWeight: 900,
            color: C.primary,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -5,
            lineHeight: 0.92,
            textTransform: "uppercase",
            opacity: h2T,
            transform: `translateY(${(1 - h2T) * 60}px)`,
          }}>
            BETA.
          </div>
        </div>

        {/* Gold divider */}
        <div style={{ width: `${h2T * 100}%`, maxWidth: 180, height: 3, background: C.accent, borderRadius: 2, marginBottom: 28 }} />

        <div style={{
          fontSize: 24,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.65,
          marginBottom: 44,
          opacity: h2T,
        }}>
          List your chairs for free.
          <br />
          Start earning immediately.
        </div>

        {/* Button */}
        <div style={{ transform: `scale(${btnT})`, opacity: btnT, transformOrigin: "left center", marginBottom: 20 }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.primary} 0%, #1D4ED8 100%)`,
            borderRadius: 18,
            padding: "26px 44px",
            fontSize: 28,
            fontWeight: 800,
            color: "white",
            fontFamily: "system-ui, sans-serif",
            display: "inline-block",
            boxShadow: `0 10px 36px rgba(37,99,235,0.40)`,
          }}>
            List Your Chairs →
          </div>
        </div>

        <div style={{ fontSize: 20, color: C.body, fontFamily: "system-ui, sans-serif", opacity: urlT }}>
          sharedsalon.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── ROOT ─── */
export const SharedSalonVenueAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneHook /></Sequence>
    <Sequence from={90}  durationInFrames={120}><SceneCost /></Sequence>
    <Sequence from={210} durationInFrames={165}><SceneSolution /></Sequence>
    <Sequence from={375} durationInFrames={75}><SceneCTA /></Sequence>
  </AbsoluteFill>
);
