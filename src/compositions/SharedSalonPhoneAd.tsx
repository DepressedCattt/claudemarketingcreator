/**
 * Shared Salon — 30-Second Phone Ad
 * "What if your quiet days paid you?"
 *
 * 9:16 vertical (1080×1920), 900 frames (30s) @30fps
 *
 * Scene 1  (0–90f,    3s): HOOK         — Light cream bg, question-based hook, slides up
 * Scene 2  (90–180f,  3s): COST         — Dark bg, $80/day per idle chair slams in
 * Scene 3  (180–300f, 4s): CHAOS→SOLVE  — Facebook groups wiped by blue sweep, Shared Salon reveals
 * Scene 4  (300–450f, 5s): VENUE        — 6 booking cards filling frame, revenue climbing
 * Scene 5  (450–600f, 5s): FREELANCER   — 2 large venue cards stacked, verified badges
 * Scene 6  (600–720f, 4s): TRUST        — 4 editorial stats cycling full-screen
 * Scene 7  (720–900f, 6s): CTA          — Premium close, dual audience, strong button
 */

import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";

/* ─── BRAND TOKENS ─── */
const C = {
  bg:       "#FAF8F5",
  primary:  "#2563EB",
  secondary:"#DCE8FF",
  accent:   "#E7D3A7",
  text:     "#0B1730",
  body:     "#66758F",
  border:   "#D8DEE8",
  surface:  "#F4F7FC",
};

/* ─── EASING ─── */
const eo3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ─── SPARKLES ─── */
const Sparkles: React.FC<{ color?: string; count?: number }> = ({ color = C.accent, count = 10 }) => {
  const frame = useCurrentFrame();
  const defs = [
    { x: 68,  y: 200,  p: 72, d: 0,  s: 5 },
    { x: 950, y: 300,  p: 60, d: 14, s: 4 },
    { x: 180, y: 520,  p: 84, d: 28, s: 6 },
    { x: 880, y: 700,  p: 66, d: 8,  s: 4 },
    { x: 110, y: 900,  p: 76, d: 40, s: 5 },
    { x: 920, y: 1040, p: 62, d: 18, s: 4 },
    { x: 340, y: 1200, p: 80, d: 44, s: 6 },
    { x: 780, y: 1420, p: 68, d: 30, s: 4 },
    { x: 150, y: 1640, p: 74, d: 52, s: 5 },
    { x: 860, y: 1760, p: 58, d: 22, s: 4 },
  ];
  return (
    <>
      {defs.slice(0, count).map((s, i) => {
        const phase = ((frame + s.d * 4) % s.p) / s.p;
        return (
          <div key={i} style={{
            position: "absolute", left: s.x, top: s.y,
            width: s.s, height: s.s, borderRadius: "50%",
            background: color,
            opacity: Math.sin(phase * Math.PI) * 0.55,
            pointerEvents: "none",
          }} />
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
  color: string;
}> = ({ startFrame, name, initials, service, day, time, amount, color }) => {
  const frame = useCurrentFrame();
  const t = eo5(cl((frame - startFrame) / 20, 0, 1));
  return (
    <div style={{
      transform: `translateY(${(1 - t) * 60}px)`,
      opacity: t,
      background: "white",
      border: `1.5px solid ${C.border}`,
      borderRadius: 22,
      padding: "24px 32px",
      display: "flex",
      alignItems: "center",
      gap: 24,
      boxShadow: "0 4px 20px rgba(11,23,48,0.07)",
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: `${color}14`, border: `2px solid ${color}35`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, fontWeight: 800, color, fontFamily: "system-ui, sans-serif", flexShrink: 0,
      }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 3 }}>{service}</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif", marginBottom: 3 }}>{name}</div>
        <div style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>{day} · {time}</div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1 }}>${amount}</div>
        <div style={{ fontSize: 13, color: "#16A34A", fontFamily: "system-ui, sans-serif", fontWeight: 700, letterSpacing: 1, marginTop: 3 }}>✓ CONFIRMED</div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 1: HOOK — Light bg, question hook (slides UP)
══════════════════════════════════════════════════════ */
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();

  const lines = [
    { text: "WHAT IF YOUR",  delay: 0,  size: 96,  color: C.text },
    { text: "QUIET DAYS",    delay: 12, size: 130, color: C.primary },
    { text: "PAID YOU?",     delay: 24, size: 130, color: C.text },
  ];

  const subT   = eo3(cl((frame - 48) / 20, 0, 1));
  const badgeT = eo3(cl((frame - 62) / 18, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Soft pale blue gradient wash at top */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 800,
        background: `radial-gradient(ellipse at 50% 0%, ${C.secondary}90 0%, transparent 70%)`,
      }} />

      <Sparkles color={C.accent} count={10} />

      {/* Centered headline block */}
      <div style={{
        position: "absolute",
        left: 72, right: 72,
        top: "50%",
        transform: "translateY(-54%)",
      }}>
        {lines.map((line, i) => {
          const t = eo4(cl((frame - line.delay) / 18, 0, 1));
          return (
            <div key={i} style={{
              fontSize: line.size,
              fontWeight: 900,
              color: line.color,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -4,
              lineHeight: 0.94,
              textTransform: "uppercase",
              transform: `translateY(${(1 - t) * 50}px)`,
              opacity: t,
              marginBottom: 4,
            }}>
              {line.text}
              {/* Accent underline on last line */}
              {i === 2 && (
                <div style={{
                  width: `${t * 100}%`, height: 5,
                  background: C.accent, borderRadius: 3, marginTop: 10,
                }} />
              )}
            </div>
          );
        })}

        {/* Sub copy */}
        <div style={{
          marginTop: 36,
          fontSize: 30,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
          lineHeight: 1.55,
          opacity: subT,
          transform: `translateY(${(1 - subT) * 24}px)`,
        }}>
          Shared Salon helps venue owners earn from
          unused chairs — and helps freelancers find
          trusted spaces to work.
        </div>
      </div>

      {/* Beta badge — bottom */}
      <div style={{
        position: "absolute", bottom: 80, left: 0, right: 0,
        display: "flex", justifyContent: "center",
        opacity: badgeT, transform: `translateY(${(1 - badgeT) * 16}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: `${C.primary}10`, border: `1.5px solid ${C.primary}30`,
          borderRadius: 100, padding: "14px 32px",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: C.primary, fontFamily: "system-ui, sans-serif" }}>
            Beta now open · sharedsalon.com.au
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 2: COST — Dark bg, $80/day per idle chair
══════════════════════════════════════════════════════ */
const SceneCost: React.FC = () => {
  const frame = useCurrentFrame();

  const labelT = eo4(cl(frame / 12, 0, 1));
  const numT   = eo5(cl((frame - 6) / 20, 0, 1));
  const sub1T  = eo3(cl((frame - 30) / 16, 0, 1));
  const sub2T  = eo3(cl((frame - 56) / 16, 0, 1));
  const barT   = eo3(cl((frame - 44) / 26, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.text }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 45%, rgba(37,99,235,0.10) 0%, transparent 60%)`,
      }} />
      <Sparkles color={C.accent} count={8} />

      {/* Label */}
      <div style={{
        position: "absolute", top: 160, left: 0, right: 0, textAlign: "center",
        opacity: labelT, transform: `translateY(${(1 - labelT) * -16}px)`,
      }}>
        <span style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 4 }}>
          Every idle chair costs you
        </span>
      </div>

      {/* Big number */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: "50%",
        transform: `translateY(-62%) scale(${0.7 + numT * 0.3})`,
        opacity: numT,
        textAlign: "center",
      }}>
        <div style={{ fontSize: 230, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif", letterSpacing: -10, lineHeight: 1 }}>
          <span style={{ color: C.accent, fontSize: 130, verticalAlign: "top", lineHeight: 1.42 }}>$</span>80
        </div>
        <div style={{ fontSize: 52, fontWeight: 700, color: C.secondary, fontFamily: "system-ui, sans-serif", letterSpacing: -1, marginTop: -8 }}>
          per day
        </div>
      </div>

      {/* Progress bar — cost building up */}
      <div style={{
        position: "absolute", bottom: 420, left: 80, right: 80,
        opacity: sub1T,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>Daily loss</span>
          <span style={{ fontSize: 18, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif" }}>Annual loss</span>
        </div>
        <div style={{ height: 12, background: "rgba(255,255,255,0.10)", borderRadius: 6, overflow: "hidden" }}>
          <div style={{ width: `${barT * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`, borderRadius: 6 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.primary, fontFamily: "system-ui, sans-serif" }}>$80</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: C.accent, fontFamily: "system-ui, sans-serif", opacity: barT }}>$12,480+</span>
        </div>
      </div>

      {/* Teaser */}
      <div style={{
        position: "absolute", bottom: 100, left: 0, right: 0, textAlign: "center",
        opacity: sub2T, transform: `translateY(${(1 - sub2T) * 16}px)`,
      }}>
        <div style={{
          display: "inline-block",
          background: `${C.primary}25`, border: `1.5px solid ${C.primary}45`,
          borderRadius: 100, padding: "14px 40px",
          fontSize: 22, fontWeight: 700, color: C.secondary, fontFamily: "system-ui, sans-serif",
        }}>
          Shared Salon turns that around →
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 3: CHAOS → PLATFORM
══════════════════════════════════════════════════════ */
const CHAOS = [
  { text: "Facebook Groups",   x: 30,  y: 80,   rot: -8,  size: 44, red: false },
  { text: "Word of Mouth",     x: 460, y: 150,  rot: 6,   size: 38, red: false },
  { text: "Cold DMs",          x: 110, y: 300,  rot: -14, size: 48, red: false },
  { text: "NO REPLIES",        x: 550, y: 400,  rot: 10,  size: 52, red: true  },
  { text: "Last Minute",       x: 40,  y: 530,  rot: -6,  size: 42, red: false },
  { text: "Overpriced",        x: 580, y: 650,  rot: 11,  size: 44, red: false },
  { text: "Unreliable",        x: 60,  y: 780,  rot: -4,  size: 48, red: false },
  { text: "No contracts",      x: 490, y: 900,  rot: 8,   size: 38, red: false },
  { text: "Time Wasted",       x: 90,  y: 1030, rot: -9,  size: 46, red: true  },
  { text: "Uncertainty",       x: 530, y: 1160, rot: 5,   size: 46, red: false },
  { text: "Guesswork",         x: 50,  y: 1290, rot: -12, size: 42, red: false },
  { text: "Bad Vibes",         x: 560, y: 1410, rot: 9,   size: 40, red: false },
  { text: "Outdated listings", x: 80,  y: 1540, rot: -7,  size: 36, red: false },
  { text: "GHOSTED",           x: 500, y: 1650, rot: 12,  size: 50, red: true  },
  { text: "No show renters",   x: 40,  y: 1780, rot: -5,  size: 38, red: false },
  { text: "Wasted days",       x: 520, y: 1860, rot: 8,   size: 42, red: false },
];

const SceneChaos: React.FC = () => {
  const frame = useCurrentFrame();

  // Wipe from left at frame 60
  const wipeProgress = eo3(cl((frame - 56) / 24, 0, 1));
  const wipeX = wipeProgress * 1240;

  const clarityT = eo4(cl((frame - 84) / 16, 0, 1));
  const subT     = eo3(cl((frame - 90) / 16, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.text }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(220,232,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
      }} />

      {/* Chaos words */}
      {CHAOS.map((w, i) => {
        const wordT = eo3(cl((frame - i * 1.5) / 10, 0, 1));
        const isWiped = w.x < wipeX - 160;
        const offset = isWiped ? -Math.min((wipeX - 160 - w.x) * 0.55, 350) : 0;
        return (
          <div key={i} style={{
            position: "absolute", left: w.x + offset, top: w.y,
            fontSize: w.size, fontWeight: 700,
            color: w.red ? "#DC2626" : "#4B5563",
            fontFamily: "system-ui, sans-serif",
            transform: `rotate(${w.rot}deg)`,
            opacity: wordT * (1 - Math.min(Math.abs(offset) / 280, 1)),
            whiteSpace: "nowrap",
          }}>{w.text}</div>
        );
      })}

      {/* Blue wipe bar */}
      {wipeProgress > 0 && wipeProgress < 1 && (
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: wipeX - 6, width: 6,
          background: C.primary, boxShadow: `0 0 36px 18px rgba(37,99,235,0.55)`,
        }} />
      )}

      {/* Clarity reveal */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 72px", textAlign: "center",
        opacity: clarityT, transform: `scale(${0.88 + clarityT * 0.12})`,
      }}>
        <div style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 4, marginBottom: 20, opacity: subT }}>
          Introducing
        </div>
        <div style={{ fontSize: 140, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif", letterSpacing: -6, lineHeight: 0.9, textTransform: "uppercase" }}>
          SHARED
          <br />
          <span style={{ color: C.primary }}>SALON.</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 30, color: "rgba(255,255,255,0.55)", fontFamily: "system-ui, sans-serif", lineHeight: 1.5, opacity: subT }}>
          The platform that connects salon owners
          with freelance beauty professionals.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 4: VENUE BOOKINGS — Proven best scene
══════════════════════════════════════════════════════ */
const SceneVenue: React.FC = () => {
  const frame = useCurrentFrame();

  const BOOKINGS = [
    { name: "Jessica M.", initials: "JM", service: "Balayage · Colour",   day: "Monday",    time: "9:00 AM",  amount: 95,  color: C.primary,  delay: 8  },
    { name: "Sophie L.",  initials: "SL", service: "Cut & Style",         day: "Tuesday",   time: "2:00 PM",  amount: 85,  color: "#7C3AED",  delay: 24 },
    { name: "Marcus R.",  initials: "MR", service: "Colour Treatment",    day: "Wednesday", time: "10:00 AM", amount: 110, color: "#0891B2",  delay: 40 },
    { name: "Anna K.",    initials: "AK", service: "Braiding & Style",    day: "Thursday",  time: "1:00 PM",  amount: 90,  color: "#059669",  delay: 56 },
    { name: "Tom B.",     initials: "TB", service: "Men's Cut & Finish",  day: "Friday",    time: "11:00 AM", amount: 100, color: "#DC2626",  delay: 72 },
    { name: "Lara S.",    initials: "LS", service: "Blowout & Style",     day: "Saturday",  time: "9:00 AM",  amount: 120, color: "#B45309",  delay: 88 },
  ];

  const total = BOOKINGS.reduce((s, b) => s + (frame > b.delay + 20 ? b.amount : 0), 0);
  const headerT = eo4(cl(frame / 14, 0, 1));
  const projT   = eo3(cl((frame - 110) / 20, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 480,
        background: `linear-gradient(180deg, ${C.secondary}55 0%, transparent 100%)`,
      }} />
      <Sparkles color={C.accent} count={8} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 60, left: 72, right: 72,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        opacity: headerT, transform: `translateY(${(1 - headerT) * -20}px)`,
      }}>
        <div>
          <div style={{ fontSize: 16, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 4 }}>Venue Bookings</div>
          <div style={{ fontSize: 50, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1 }}>This week</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 600, marginBottom: 2 }}>EARNED</div>
          <div style={{ fontSize: 72, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -3, lineHeight: 1 }}>${total}</div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 220, left: 72, right: 72, height: 1.5, background: C.border, opacity: headerT }} />

      {/* Cards */}
      <div style={{ position: "absolute", top: 236, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 14 }}>
        {BOOKINGS.map((b, i) => <BookingRow key={i} startFrame={b.delay} {...b} />)}
      </div>

      {/* Monthly projection */}
      <div style={{
        position: "absolute", bottom: 40, left: 60, right: 60,
        opacity: projT, transform: `translateY(${(1 - projT) * 26}px)`,
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${C.primary} 0%, #1D4ED8 100%)`,
          borderRadius: 26, padding: "28px 36px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          boxShadow: `0 10px 36px rgba(37,99,235,0.28)`,
        }}>
          <div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.65)", fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Projected monthly</div>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.75)", fontFamily: "system-ui, sans-serif" }}>per chair · one venue</div>
          </div>
          <div style={{ fontSize: 80, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif", letterSpacing: -4, lineHeight: 1 }}>$2,400</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 5: FREELANCER — 2 large venue cards stacked
══════════════════════════════════════════════════════ */
const VenueCardTall: React.FC<{
  startFrame: number;
  name: string;
  suburb: string;
  price: number;
  rating: number;
  reviews: number;
  chairs: number;
  tags: string[];
  gradFrom: string;
  gradTo: string;
}> = ({ startFrame, name, suburb, price, rating, reviews, chairs, tags, gradFrom, gradTo }) => {
  const frame = useCurrentFrame();
  const t = eo5(cl((frame - startFrame) / 26, 0, 1));
  return (
    <div style={{
      transform: `translateY(${(1 - t) * 80}px)`, opacity: t,
      background: "white", border: `1.5px solid ${C.border}`,
      borderRadius: 28, overflow: "hidden",
      boxShadow: "0 8px 36px rgba(11,23,48,0.10)",
    }}>
      {/* Photo */}
      <div style={{
        height: 340, background: `linear-gradient(145deg, ${gradFrom} 0%, ${gradTo} 100%)`,
        position: "relative", display: "flex", flexDirection: "column",
        justifyContent: "flex-end", padding: 28,
      }}>
        {/* Verified */}
        <div style={{
          position: "absolute", top: 22, right: 22,
          display: "flex", alignItems: "center", gap: 7,
          background: "rgba(255,255,255,0.96)", borderRadius: 100, padding: "8px 16px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16A34A" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: "#166534", fontFamily: "system-ui, sans-serif" }}>Verified</span>
        </div>
        {/* Chairs available */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: `rgba(37,99,235,0.88)`, borderRadius: 12, padding: "10px 18px",
          width: "fit-content",
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif" }}>{chairs}</span>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", fontFamily: "system-ui, sans-serif" }}>chair{chairs > 1 ? "s" : ""} available</span>
        </div>
      </div>
      {/* Info */}
      <div style={{ padding: "26px 30px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -0.5, marginBottom: 6 }}>{name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.primary }} />
            <span style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>{suburb}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>{"★".repeat(Math.round(rating))}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif" }}>{rating}</span>
            <span style={{ fontSize: 16, color: C.body, fontFamily: "system-ui, sans-serif" }}>({reviews} reviews)</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {tags.map((tag) => (
              <span key={tag} style={{ fontSize: 14, fontWeight: 600, color: C.primary, background: `${C.primary}10`, border: `1px solid ${C.primary}22`, borderRadius: 7, padding: "5px 12px", fontFamily: "system-ui, sans-serif" }}>{tag}</span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <div>
            <span style={{ fontSize: 40, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -1 }}>${price}</span>
            <span style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>/day</span>
          </div>
          <div style={{ background: C.primary, borderRadius: 14, padding: "14px 28px", fontSize: 20, fontWeight: 700, color: "white", fontFamily: "system-ui, sans-serif" }}>
            Book Now
          </div>
        </div>
      </div>
    </div>
  );
};

const SceneFreelancer: React.FC = () => {
  const frame = useCurrentFrame();
  const headerT = eo4(cl(frame / 12, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 400,
        background: `linear-gradient(180deg, ${C.secondary}55 0%, transparent 100%)`,
      }} />
      <Sparkles color={C.accent} count={7} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 56, left: 72, right: 72,
        opacity: headerT, transform: `translateY(${(1 - headerT) * -20}px)`,
      }}>
        <div style={{ fontSize: 16, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 4 }}>
          Find your space
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 48, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -2 }}>127 Venues Near You</div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${C.secondary}`, border: `1px solid ${C.border}`, borderRadius: 100, padding: "8px 18px",
          }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16A34A", boxShadow: "0 0 6px #16A34A" }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: C.primary, fontFamily: "system-ui, sans-serif" }}>LIVE</span>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 196, left: 60, right: 60, display: "flex", flexDirection: "column", gap: 16 }}>
        <VenueCardTall
          startFrame={12}
          name="Bliss Beauty Studio"
          suburb="Bondi Junction, NSW"
          price={85} rating={4.9} reviews={42} chairs={2}
          tags={["Hair", "Colour", "Full Kit"]}
          gradFrom={C.secondary} gradTo="#B8D1FF"
        />
        <VenueCardTall
          startFrame={32}
          name="Luxe Salon & Co."
          suburb="South Yarra, VIC"
          price={110} rating={5.0} reviews={28} chairs={1}
          tags={["Premium", "Backwash", "Walk-in Friendly"]}
          gradFrom="#F0FDF4" gradTo="#BBF7D0"
        />
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 6: TRUST — 4 stats cycling full-screen
══════════════════════════════════════════════════════ */
const TRUST_STATS = [
  { value: "200+",    label: "VERIFIED VENUES",          sub: "And growing every week",  color: C.primary },
  { value: "$2,400",  label: "AVERAGE MONTHLY PER CHAIR", sub: "For venue owners",       color: C.text    },
  { value: "2 MIN",   label: "TO BOOK A SPACE",           sub: "Search, confirm, done",  color: "#059669" },
  { value: "100%",    label: "VERIFIED PROFESSIONALS",    sub: "Only trusted providers", color: C.primary },
];

const SceneTrust: React.FC = () => {
  const frame = useCurrentFrame();
  const idx = Math.min(Math.floor(frame / 30), TRUST_STATS.length - 1);
  const localF = frame - idx * 30;
  const t = eo5(cl(localF / 16, 0, 1));
  const fadeOut = idx < TRUST_STATS.length - 1
    ? interpolate(localF, [22, 30], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  const stat = TRUST_STATS[idx];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${stat.color}0C 0%, transparent 60%)`,
      }} />
      <Sparkles color={C.accent} count={8} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "flex-start", justifyContent: "center",
        padding: "0 72px",
        opacity: fadeOut,
      }}>
        <div style={{ fontSize: 17, color: stat.color, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 4, marginBottom: 16, opacity: t, transform: `translateY(${(1 - t) * -16}px)` }}>
          {stat.label}
        </div>
        <div style={{
          fontSize: 220,
          fontWeight: 900,
          color: stat.color,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -10,
          lineHeight: 0.88,
          transform: `scale(${0.75 + t * 0.25}) translateY(${(1 - t) * 40}px)`,
          transformOrigin: "left center",
          opacity: t,
          marginBottom: 28,
        }}>
          {stat.value}
        </div>
        <div style={{ width: `${t * 480}px`, height: 4, background: stat.color, borderRadius: 2, marginBottom: 24 }} />
        <div style={{ fontSize: 36, color: C.body, fontFamily: "system-ui, sans-serif", opacity: t, transform: `translateY(${(1 - t) * 20}px)` }}>
          {stat.sub}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 10, marginTop: 60 }}>
          {TRUST_STATS.map((_, i) => (
            <div key={i} style={{ height: 5, borderRadius: 2.5, width: i === idx ? 44 : 12, background: i === idx ? stat.color : C.border }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 7: CTA — Premium 6-second close
══════════════════════════════════════════════════════ */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT   = eo3(cl(frame / 18, 0, 1));
  const h1T   = eo4(cl((frame - 6)  / 20, 0, 1));
  const h2T   = eo4(cl((frame - 14) / 20, 0, 1));
  const lineT = eo3(cl((frame - 20) / 22, 0, 1));
  const sub1T = eo3(cl((frame - 30) / 18, 0, 1));
  const btn1T = eo5(cl((frame - 44) / 16, 0, 1));
  const btn2T = eo5(cl((frame - 56) / 16, 0, 1));
  const urlT  = eo3(cl((frame - 80) / 14, 0, 1));
  const glowP = 0.6 + Math.sin(frame * 0.07) * 0.4;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: bgT }}>
      {/* Blue top gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 700,
        background: `linear-gradient(180deg, ${C.secondary}70 0%, transparent 100%)`,
      }} />
      {/* Glow pulse */}
      <div style={{
        position: "absolute", left: "50%", top: "32%",
        transform: "translate(-50%, -50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,${0.12 * glowP}) 0%, transparent 70%)`,
      }} />

      <Sparkles color={C.accent} count={12} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "flex-start", justifyContent: "center",
        padding: "0 72px",
      }}>
        {/* Small tag */}
        <div style={{
          display: "inline-block", background: `${C.accent}55`, border: `1.5px solid ${C.accent}80`,
          borderRadius: 100, padding: "9px 26px", fontSize: 18, fontWeight: 700, color: "#7A5C14",
          fontFamily: "system-ui, sans-serif", marginBottom: 30,
          opacity: h1T, transform: `translateY(${(1 - h1T) * -16}px)`,
        }}>
          Beta Access · Now Open
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 130, fontWeight: 900, color: C.text,
          fontFamily: "system-ui, sans-serif", letterSpacing: -6, lineHeight: 0.9,
          textTransform: "uppercase",
          opacity: h1T, transform: `translateY(${(1 - h1T) * 50}px)`,
          marginBottom: 4,
        }}>
          JOIN
        </div>
        <div style={{
          fontSize: 130, fontWeight: 900, color: C.primary,
          fontFamily: "system-ui, sans-serif", letterSpacing: -6, lineHeight: 0.9,
          textTransform: "uppercase",
          opacity: h2T, transform: `translateY(${(1 - h2T) * 50}px)`,
          marginBottom: 32,
        }}>
          SHARED SALON.
        </div>

        {/* Gold divider */}
        <div style={{ width: `${lineT * 100}%`, maxWidth: 400, height: 4, background: C.accent, borderRadius: 2, marginBottom: 30 }} />

        {/* Sub */}
        <div style={{
          fontSize: 28, color: C.body, fontFamily: "system-ui, sans-serif",
          lineHeight: 1.6, marginBottom: 48, opacity: sub1T,
        }}>
          For venue owners looking to earn from idle chairs.
          <br />
          For freelancers looking for trusted, flexible spaces.
        </div>

        {/* Dual buttons */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
          <div style={{ transform: `scale(${btn1T})`, opacity: btn1T, transformOrigin: "left center" }}>
            <div style={{
              background: `linear-gradient(135deg, ${C.primary} 0%, #1D4ED8 100%)`,
              borderRadius: 20, padding: "26px 48px",
              fontSize: 28, fontWeight: 800, color: "white",
              fontFamily: "system-ui, sans-serif",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: `0 10px 36px rgba(37,99,235,0.38)`,
            }}>
              <span>I'm a Venue Owner</span>
              <span>→</span>
            </div>
          </div>
          <div style={{ transform: `scale(${btn2T})`, opacity: btn2T, transformOrigin: "left center" }}>
            <div style={{
              background: "white", border: `2px solid ${C.border}`,
              borderRadius: 20, padding: "26px 48px",
              fontSize: 28, fontWeight: 800, color: C.text,
              fontFamily: "system-ui, sans-serif",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: "0 4px 18px rgba(11,23,48,0.07)",
            }}>
              <span>I'm a Freelancer</span>
              <span style={{ color: C.primary }}>→</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 20, color: C.body, fontFamily: "monospace", opacity: urlT }}>
          sharedsalon.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── ROOT ─── */
export const SharedSalonPhoneAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneHook /></Sequence>
    <Sequence from={90}  durationInFrames={90}><SceneCost /></Sequence>
    <Sequence from={180} durationInFrames={120}><SceneChaos /></Sequence>
    <Sequence from={300} durationInFrames={150}><SceneVenue /></Sequence>
    <Sequence from={450} durationInFrames={150}><SceneFreelancer /></Sequence>
    <Sequence from={600} durationInFrames={120}><SceneTrust /></Sequence>
    <Sequence from={720} durationInFrames={180}><SceneCTA /></Sequence>
  </AbsoluteFill>
);
