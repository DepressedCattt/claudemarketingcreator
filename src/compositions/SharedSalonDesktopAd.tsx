/**
 * Shared Salon — 30-Second Desktop Ad
 * "The platform connecting both sides of the salon industry."
 *
 * 16:9 landscape (1920×1080), 900 frames (30s) @30fps
 *
 * Scene 1  (0–90f,    3s): HOOK         — Full-width light editorial, two problems stated
 * Scene 2  (90–240f,  5s): TWO SIDES    — Left=venue revenue, Right=freelancer discovery
 * Scene 3  (240–390f, 5s): CHAOS→SOLVE  — Full-width chaos wipe → Shared Salon platform reveal
 * Scene 4  (390–540f, 5s): VENUE DEEP   — Left: before/after calendar | Right: booking ticker
 * Scene 5  (540–690f, 5s): FREELANCER   — 3 venue cards filling the landscape
 * Scene 6  (690–810f, 4s): STATS        — 4 massive stat columns across full 1920px
 * Scene 7  (810–900f, 3s): CTA          — Full-bleed landscape CTA, dual buttons
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
    { x: 80,   y: 80,  p: 70, d: 0,  s: 5 },
    { x: 960,  y: 60,  p: 58, d: 12, s: 4 },
    { x: 1760, y: 90,  p: 82, d: 24, s: 5 },
    { x: 200,  y: 500, p: 66, d: 8,  s: 4 },
    { x: 940,  y: 480, p: 74, d: 36, s: 6 },
    { x: 1700, y: 540, p: 62, d: 18, s: 4 },
    { x: 80,   y: 940, p: 76, d: 44, s: 5 },
    { x: 960,  y: 980, p: 64, d: 30, s: 4 },
    { x: 1820, y: 940, p: 70, d: 52, s: 5 },
    { x: 480,  y: 260, p: 60, d: 22, s: 4 },
    { x: 1440, y: 260, p: 68, d: 38, s: 4 },
    { x: 720,  y: 760, p: 78, d: 6,  s: 5 },
  ];
  return (
    <>
      {defs.slice(0, count).map((s, i) => {
        const phase = ((frame + s.d * 4) % s.p) / s.p;
        return (
          <div key={i} style={{
            position: "absolute", left: s.x, top: s.y,
            width: s.s, height: s.s, borderRadius: "50%",
            background: color, opacity: Math.sin(phase * Math.PI) * 0.5,
            pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 1: HOOK — Full-width, two-problem statement
══════════════════════════════════════════════════════ */
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();

  const line1T = eo4(cl(frame / 16, 0, 1));
  const line2T = eo4(cl((frame - 12) / 16, 0, 1));
  const line3T = eo3(cl((frame - 26) / 18, 0, 1));
  const sub1T  = eo3(cl((frame - 48) / 18, 0, 1));
  const divT   = eo3(cl((frame - 40) / 22, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Radial glow — top */}
      <div style={{
        position: "absolute", left: "50%", top: 0,
        transform: "translateX(-50%)",
        width: 1400, height: 600, borderRadius: "50%",
        background: `radial-gradient(ellipse at 50% 0%, ${C.secondary}90 0%, transparent 70%)`,
      }} />

      <Sparkles color={C.accent} count={10} />

      {/* Left side: big problem statement */}
      <div style={{
        position: "absolute",
        left: 100, top: "50%",
        transform: "translateY(-54%)",
        width: 860,
      }}>
        {/* Line 1 */}
        <div style={{
          fontSize: 160,
          fontWeight: 900,
          color: C.text,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -7,
          lineHeight: 0.9,
          textTransform: "uppercase",
          opacity: line1T,
          transform: `translateY(${(1 - line1T) * 50}px)`,
        }}>
          EMPTY CHAIRS.
        </div>

        {/* Gold divider — left-aligned */}
        <div style={{ width: `${divT * 520}px`, height: 5, background: C.accent, borderRadius: 3, marginTop: 22, marginBottom: 22 }} />

        {/* Line 2 */}
        <div style={{
          fontSize: 110,
          fontWeight: 900,
          color: C.primary,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -5,
          lineHeight: 0.9,
          textTransform: "uppercase",
          opacity: line2T,
          transform: `translateY(${(1 - line2T) * 40}px)`,
        }}>
          NO PLACES TO WORK.
        </div>

        {/* Line 3 — the resolution */}
        <div style={{
          marginTop: 32,
          fontSize: 52,
          fontWeight: 400,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.5,
          opacity: line3T,
          transform: `translateY(${(1 - line3T) * 24}px)`,
        }}>
          Two problems. One industry.{" "}
          <span style={{ color: C.text, fontWeight: 700 }}>One platform.</span>
        </div>
      </div>

      {/* Right side: two stats side by side */}
      <div style={{
        position: "absolute",
        right: 100, top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: 24,
        opacity: sub1T,
        transform: `translateY(calc(-50% + ${(1 - sub1T) * 30}px))`,
      }}>
        {[
          { n: "3",       label: "Idle days per week for most salons",    color: C.text,    note: "Average chair utilization" },
          { n: "127",     label: "Freelancers searching in your city",    color: C.primary, note: "Waiting for a verified space" },
        ].map((stat) => (
          <div key={stat.n} style={{
            background: "white", border: `1.5px solid ${C.border}`,
            borderRadius: 24, padding: "30px 36px",
            boxShadow: "0 6px 28px rgba(11,23,48,0.08)",
            width: 480,
          }}>
            <div style={{ fontSize: 100, fontWeight: 900, color: stat.color, fontFamily: "system-ui, sans-serif", letterSpacing: -4, lineHeight: 1, marginBottom: 6 }}>
              {stat.n}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>{stat.note}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 2: TWO SIDES — Left=venue, Right=freelancer
══════════════════════════════════════════════════════ */
const SceneTwoSides: React.FC = () => {
  const frame = useCurrentFrame();

  const leftT  = eo5(cl(frame / 22, 0, 1));
  const rightT = eo5(cl((frame - 10) / 22, 0, 1));

  const leftContentT  = eo3(cl((frame - 24) / 18, 0, 1));
  const rightContentT = eo3(cl((frame - 32) / 18, 0, 1));

  // Revenue counter for venue side
  const revenueT = eo3(cl((frame - 40) / 80, 0, 1));
  const revenue  = Math.round(2400 * revenueT);

  // Booking cards stagger
  const book1T = eo5(cl((frame - 50) / 18, 0, 1));
  const book2T = eo5(cl((frame - 68) / 18, 0, 1));
  const book3T = eo5(cl((frame - 86) / 18, 0, 1));

  // Venue count counter for freelancer side
  const countT   = eo3(cl((frame - 44) / 80, 0, 1));
  const venueCount = Math.round(127 * countT);

  // Venue card stagger
  const vcard1T = eo5(cl((frame - 56) / 20, 0, 1));
  const vcard2T = eo5(cl((frame - 76) / 20, 0, 1));
  const vcard3T = eo5(cl((frame - 96) / 20, 0, 1));

  // Divider pulse
  const pulse = 0.65 + Math.sin(frame * 0.06) * 0.35;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* LEFT HALF — Venue owner, dark navy */}
      <div style={{
        position: "absolute", top: 0, left: 0, bottom: 0, width: "50%",
        background: C.text,
        transform: `translateX(${(1 - leftT) * -60}px)`,
        opacity: leftT,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 25% 50%, rgba(37,99,235,0.12) 0%, transparent 65%)`,
        }} />
        <Sparkles color={C.accent} count={5} />

        <div style={{
          position: "absolute", left: 60, top: "50%",
          transform: `translateY(calc(-50% + ${(1 - leftContentT) * -24}px))`,
          opacity: leftContentT,
        }}>
          <div style={{ fontSize: 15, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 8 }}>Venue Owners</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif", letterSpacing: -3, lineHeight: 1, marginBottom: 8 }}>
            TURN IDLE<br /><span style={{ color: C.secondary }}>INTO INCOME.</span>
          </div>

          {/* Revenue counter */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: C.accent, fontFamily: "system-ui, sans-serif", letterSpacing: -4, lineHeight: 1 }}>
              ${revenue.toLocaleString()}
            </div>
            <div style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>avg. monthly per chair</div>
          </div>

          {/* Mini booking cards */}
          {[
            { t: book1T, name: "Jessica M.", amount: 95,  color: C.primary },
            { t: book2T, name: "Sophie L.",  amount: 85,  color: "#7C3AED" },
            { t: book3T, name: "Marcus R.",  amount: 110, color: "#0891B2" },
          ].map((b) => (
            <div key={b.name} style={{
              transform: `translateX(${(1 - b.t) * 60}px)`, opacity: b.t,
              display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 12, padding: "12px 18px",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#16A34A", boxShadow: "0 0 6px #16A34A" }} />
              <span style={{ fontSize: 18, color: "white", fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>{b.name}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 22, fontWeight: 900, color: b.color, fontFamily: "system-ui, sans-serif" }}>${b.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT HALF — Freelancer, pale blue */}
      <div style={{
        position: "absolute", top: 0, right: 0, bottom: 0, width: "50%",
        background: C.secondary,
        transform: `translateX(${(1 - rightT) * 60}px)`,
        opacity: rightT,
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle, ${C.primary}0A 1px, transparent 1px)`,
          backgroundSize: "42px 42px",
        }} />
        <Sparkles color={C.primary} count={5} />

        <div style={{
          position: "absolute", left: 60, top: "50%",
          transform: `translateY(calc(-50% + ${(1 - rightContentT) * 24}px))`,
          opacity: rightContentT,
        }}>
          <div style={{ fontSize: 15, color: C.primary, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 8 }}>Freelancers</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -3, lineHeight: 1, marginBottom: 8 }}>
            FIND SPACES<br /><span style={{ color: C.primary }}>YOU TRUST.</span>
          </div>

          {/* Venue count */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 80, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -4, lineHeight: 1 }}>
              {venueCount}+
            </div>
            <div style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>verified venues near you</div>
          </div>

          {/* Mini venue cards */}
          {[
            { t: vcard1T, name: "Bliss Beauty Studio",  price: "$85/day", color: C.primary },
            { t: vcard2T, name: "Luxe Salon & Co.",      price: "$110/day", color: "#059669" },
            { t: vcard3T, name: "The Styling Room",      price: "$75/day",  color: "#7C3AED" },
          ].map((v) => (
            <div key={v.name} style={{
              transform: `translateX(${(1 - v.t) * 60}px)`, opacity: v.t,
              display: "flex", alignItems: "center", gap: 12, marginBottom: 8,
              background: "rgba(255,255,255,0.7)", border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "12px 18px",
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: v.color }} />
              <span style={{ fontSize: 18, color: C.text, fontFamily: "system-ui, sans-serif", fontWeight: 600 }}>{v.name}</span>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: 20, fontWeight: 800, color: v.color, fontFamily: "system-ui, sans-serif" }}>{v.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Center divider */}
      <div style={{
        position: "absolute", top: 0, bottom: 0, left: "50%",
        width: 2, background: C.border,
        boxShadow: `0 0 0 ${6 * pulse}px rgba(37,99,235,0.08)`,
        transform: "translateX(-50%)",
      }}>
        {/* Center badge */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          background: "white", border: `2px solid ${C.border}`, borderRadius: 100,
          padding: "12px 26px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: `0 0 0 ${5 * pulse}px rgba(37,99,235,0.09)`,
          whiteSpace: "nowrap",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary, boxShadow: `0 0 8px ${C.primary}` }} />
          <span style={{ fontSize: 20, fontWeight: 800, color: C.primary, fontFamily: "system-ui, sans-serif" }}>Shared Salon</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 3: CHAOS WIPE → PLATFORM REVEAL
══════════════════════════════════════════════════════ */
const CHAOS_LANDSCAPE = [
  { text: "Facebook Groups",   x: 60,   y: 80,  rot: -8,  size: 54, red: false },
  { text: "Word of Mouth",     x: 780,  y: 60,  rot: 6,   size: 46, red: false },
  { text: "Cold DMs",          x: 1500, y: 90,  rot: -14, size: 52, red: false },
  { text: "NO REPLIES",        x: 260,  y: 320, rot: 10,  size: 62, red: true  },
  { text: "Last Minute",       x: 980,  y: 280, rot: -6,  size: 48, red: false },
  { text: "Overpriced",        x: 1620, y: 360, rot: 11,  size: 54, red: false },
  { text: "Unreliable",        x: 120,  y: 560, rot: -4,  size: 58, red: false },
  { text: "No contracts",      x: 740,  y: 620, rot: 8,   size: 44, red: false },
  { text: "Time Wasted",       x: 1320, y: 580, rot: -9,  size: 52, red: true  },
  { text: "Uncertainty",       x: 380,  y: 820, rot: 5,   size: 50, red: false },
  { text: "Guesswork",         x: 1060, y: 860, rot: -12, size: 48, red: false },
  { text: "Outdated listings", x: 1660, y: 760, rot: 7,   size: 44, red: false },
];

const SceneChaos: React.FC = () => {
  const frame = useCurrentFrame();

  const wipeProgress = eo3(cl((frame - 56) / 26, 0, 1));
  const wipeX = wipeProgress * 2200;
  const clarityT = eo4(cl((frame - 86) / 18, 0, 1));
  const subT     = eo3(cl((frame - 96) / 16, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.text }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(220,232,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {CHAOS_LANDSCAPE.map((w, i) => {
        const wordT = eo3(cl((frame - i * 1.5) / 10, 0, 1));
        const isWiped = w.x < wipeX - 200;
        const offset = isWiped ? -Math.min((wipeX - 200 - w.x) * 0.55, 500) : 0;
        return (
          <div key={i} style={{
            position: "absolute", left: w.x + offset, top: w.y,
            fontSize: w.size, fontWeight: 700,
            color: w.red ? "#DC2626" : "#374151",
            fontFamily: "system-ui, sans-serif",
            transform: `rotate(${w.rot}deg)`,
            opacity: wordT * (1 - Math.min(Math.abs(offset) / 320, 1)),
            whiteSpace: "nowrap",
          }}>{w.text}</div>
        );
      })}

      {wipeProgress > 0 && wipeProgress < 1 && (
        <div style={{
          position: "absolute", top: 0, bottom: 0, left: wipeX - 7, width: 7,
          background: C.primary, boxShadow: `0 0 44px 22px rgba(37,99,235,0.58)`,
        }} />
      )}

      {/* Platform reveal */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        opacity: clarityT, transform: `scale(${0.88 + clarityT * 0.12})`,
      }}>
        <div style={{ fontSize: 16, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 5, marginBottom: 24, opacity: subT }}>
          The professional alternative
        </div>
        <div style={{
          fontSize: 200, fontWeight: 900, color: "white",
          fontFamily: "system-ui, sans-serif", letterSpacing: -9, lineHeight: 0.88,
          textAlign: "center", textTransform: "uppercase",
        }}>
          SHARED <span style={{ color: C.primary }}>SALON.</span>
        </div>
        <div style={{ marginTop: 32, fontSize: 38, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif", opacity: subT, textAlign: "center" }}>
          Venues. Freelancers. One platform. Built for trust.
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 4: VENUE DEEP — Calendar + scrolling ticker
══════════════════════════════════════════════════════ */

// Calendar week view — before/after
const WeekCalendar: React.FC<{ active: boolean; fillProgress: number }> = ({ active, fillProgress }) => {
  const DAYS = ["MON", "TUE", "WED", "THU", "FRI"];
  const names = ["Jessica M.", "Sophie L.", "Marcus R.", "Anna K.", "Tom B."];
  const amounts = [95, 85, 110, 90, 100];

  return (
    <div style={{ display: "flex", gap: 12 }}>
      {DAYS.map((day, i) => {
        const filled = active && fillProgress > i * 0.2;
        const fillT = active ? cl((fillProgress - i * 0.2) / 0.2, 0, 1) : 0;

        return (
          <div key={day} style={{
            flex: 1, borderRadius: 18, overflow: "hidden",
            border: `2px solid ${filled ? C.primary : C.border}`,
            background: filled ? `${C.primary}10` : "rgba(255,255,255,0.5)",
            transition: "none",
          }}>
            {/* Day header */}
            <div style={{
              padding: "14px 0", textAlign: "center",
              background: filled ? C.primary : C.border,
            }}>
              <span style={{ fontSize: 17, fontWeight: 700, color: "white", fontFamily: "system-ui, sans-serif" }}>{day}</span>
            </div>
            {/* Content */}
            <div style={{ padding: "16px 14px", height: 160, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
              {filled ? (
                <div style={{ opacity: fillT, transform: `scale(${0.8 + fillT * 0.2})` }}>
                  <div style={{ fontSize: 13, color: C.primary, fontFamily: "system-ui, sans-serif", fontWeight: 600, marginBottom: 4 }}>BOOKED</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif", marginBottom: 4 }}>{names[i]}</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -1 }}>${amounts[i]}</div>
                </div>
              ) : (
                <div style={{ opacity: active ? 0 : 0.4 }}>
                  <div style={{ fontSize: 28, marginBottom: 4 }}>💺</div>
                  <div style={{ fontSize: 16, color: C.body, fontFamily: "system-ui, sans-serif" }}>Empty</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.border, fontFamily: "system-ui, sans-serif" }}>$0</div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Horizontal scrolling booking ticker
const BookingTicker: React.FC<{ frame: number }> = ({ frame }) => {
  const CARDS = [
    { name: "Jessica M.", service: "Balayage",   day: "Mon",  time: "9am",  amount: 95,  color: C.primary  },
    { name: "Sophie L.",  service: "Cut & Style", day: "Tue",  time: "2pm",  amount: 85,  color: "#7C3AED" },
    { name: "Marcus R.",  service: "Colour",      day: "Wed",  time: "10am", amount: 110, color: "#0891B2" },
    { name: "Anna K.",    service: "Braiding",    day: "Thu",  time: "1pm",  amount: 90,  color: "#059669" },
    { name: "Tom B.",     service: "Men's Cut",   day: "Fri",  time: "11am", amount: 100, color: "#DC2626" },
    { name: "Lara S.",    service: "Blowout",     day: "Sat",  time: "9am",  amount: 120, color: "#B45309" },
    { name: "Emma V.",    service: "Highlights",  day: "Mon",  time: "1pm",  amount: 95,  color: C.primary  },
    { name: "Ryan T.",    service: "Fade & Style",day: "Tue",  time: "10am", amount: 80,  color: "#0891B2" },
  ];

  // Smooth linear scroll
  const scrollX = interpolate(frame, [10, 150], [0, -1320], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const CARD_W = 300;
  const CARD_GAP = 14;

  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <div style={{
        display: "flex", gap: CARD_GAP,
        transform: `translateX(${scrollX}px)`,
        width: CARDS.length * (CARD_W + CARD_GAP),
      }}>
        {CARDS.map((c, i) => (
          <div key={i} style={{
            width: CARD_W, flexShrink: 0,
            background: "white", border: `1.5px solid ${C.border}`,
            borderRadius: 20, padding: "22px 22px",
            boxShadow: "0 4px 18px rgba(11,23,48,0.07)",
          }}>
            <div style={{ fontSize: 12, color: c.color, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>{c.service}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif", marginBottom: 3 }}>{c.name}</div>
            <div style={{ fontSize: 15, color: C.body, fontFamily: "system-ui, sans-serif", marginBottom: 10 }}>{c.day} · {c.time}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -1 }}>${c.amount}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#F0FDF4", borderRadius: 8, padding: "5px 10px" }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16A34A" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#166534", fontFamily: "system-ui, sans-serif" }}>CONFIRMED</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SceneVenueDeep: React.FC = () => {
  const frame = useCurrentFrame();

  const headerT = eo4(cl(frame / 14, 0, 1));
  const beforeT = eo3(cl((frame - 8)  / 18, 0, 1));
  const afterT  = eo3(cl((frame - 28) / 18, 0, 1));
  const fillP   = cl((frame - 48) / 70, 0, 1);
  const tickerT = eo4(cl((frame - 36) / 18, 0, 1));

  // Running total
  const amounts = [95, 85, 110, 90, 100];
  const total = amounts.reduce((s, a, i) => s + (fillP > i * 0.2 ? a : 0), 0);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 360,
        background: `linear-gradient(180deg, ${C.secondary}50 0%, transparent 100%)`,
      }} />
      <Sparkles color={C.accent} count={8} />

      {/* Header */}
      <div style={{
        position: "absolute", top: 44, left: 80, right: 80,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        opacity: headerT,
      }}>
        <div>
          <div style={{ fontSize: 15, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 4 }}>Venue owner view</div>
          <div style={{ fontSize: 52, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -2 }}>Your week, transformed.</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 600, marginBottom: 2 }}>WEEK EARNED</div>
          <div style={{ fontSize: 68, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -3, lineHeight: 1 }}>${total}</div>
        </div>
      </div>

      {/* Calendar — before/after side by side */}
      <div style={{
        position: "absolute", top: 188, left: 80, right: 80,
      }}>
        {/* Before */}
        <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 12, opacity: beforeT, transform: `translateY(${(1 - beforeT) * 20}px)` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#9CA3AF", fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 2, width: 100, flexShrink: 0 }}>BEFORE</div>
          <div style={{ flex: 1 }}>
            <WeekCalendar active={false} fillProgress={0} />
          </div>
        </div>

        {/* After */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: afterT, transform: `translateY(${(1 - afterT) * 20}px)` }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.primary, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 2, width: 100, flexShrink: 0 }}>AFTER</div>
          <div style={{ flex: 1 }}>
            <WeekCalendar active={true} fillProgress={fillP} />
          </div>
        </div>
      </div>

      {/* Booking ticker */}
      <div style={{
        position: "absolute", bottom: 40, left: 80, right: 0,
        opacity: tickerT, transform: `translateY(${(1 - tickerT) * 20}px)`,
      }}>
        <div style={{ fontSize: 13, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>
          Live bookings →
        </div>
        <BookingTicker frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 5: FREELANCER — 3 venue cards filling landscape
══════════════════════════════════════════════════════ */
const SceneFreelancer: React.FC = () => {
  const frame = useCurrentFrame();
  const headerT = eo3(cl(frame / 14, 0, 1));

  const VENUES = [
    {
      start: 10, name: "Bliss Beauty Studio", suburb: "Bondi Junction, NSW",
      price: 85, rating: 4.9, reviews: 42, chairs: 2,
      tags: ["Hair", "Colour", "Full Kit"],
      gFrom: C.secondary, gTo: "#B8D1FF",
    },
    {
      start: 22, name: "Luxe Salon & Co.", suburb: "South Yarra, VIC",
      price: 110, rating: 5.0, reviews: 28, chairs: 1,
      tags: ["Premium", "Backwash", "Walk-in Friendly"],
      gFrom: "#F0FDF4", gTo: "#BBF7D0",
    },
    {
      start: 36, name: "The Styling Room", suburb: "Paddington, QLD",
      price: 75, rating: 4.8, reviews: 61, chairs: 3,
      tags: ["Flexible Hours", "Parking", "Coffee Bar"],
      gFrom: "#FFF7ED", gTo: "#FED7AA",
    },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Top bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 72,
        background: `${C.surface}F5`, borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", padding: "0 48px", gap: 24,
        opacity: headerT, transform: `translateY(${(1 - headerT) * -20}px)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.primary }} />
          <span style={{ fontSize: 22, fontWeight: 800, color: C.primary, fontFamily: "system-ui, sans-serif" }}>Shared Salon</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: C.secondary, border: `1px solid ${C.border}`,
          borderRadius: 100, padding: "8px 20px",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.primary, fontFamily: "system-ui, sans-serif" }}>127 venues near you</span>
        </div>
        {["All Venues", "Hair", "Nails", "Beauty", "Barber"].map((tab) => (
          <span key={tab} style={{
            fontSize: 16, color: tab === "Hair" ? C.primary : C.body,
            fontFamily: "system-ui, sans-serif", fontWeight: tab === "Hair" ? 700 : 500,
          }}>{tab}</span>
        ))}
      </div>

      {/* 3 venue cards */}
      <div style={{
        position: "absolute", top: 80, left: 24, right: 24, bottom: 24,
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18,
      }}>
        {VENUES.map((v) => {
          const t = eo5(cl((frame - v.start) / 26, 0, 1));
          return (
            <div key={v.name} style={{
              transform: `translateY(${(1 - t) * 60}px)`, opacity: t,
              display: "flex", flexDirection: "column",
              background: "white", borderRadius: 26, overflow: "hidden",
              border: `1.5px solid ${C.border}`,
              boxShadow: "0 8px 36px rgba(11,23,48,0.10)",
            }}>
              {/* Gradient photo */}
              <div style={{
                flex: "0 0 380px",
                background: `linear-gradient(145deg, ${v.gFrom} 0%, ${v.gTo} 100%)`,
                position: "relative", display: "flex", flexDirection: "column",
                justifyContent: "flex-end", padding: 24,
              }}>
                <div style={{
                  position: "absolute", top: 20, right: 20,
                  display: "flex", alignItems: "center", gap: 6,
                  background: "rgba(255,255,255,0.96)", borderRadius: 100, padding: "7px 14px",
                }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#16A34A" }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#166534", fontFamily: "system-ui, sans-serif" }}>Verified</span>
                </div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(37,99,235,0.88)", borderRadius: 11, padding: "9px 16px", width: "fit-content",
                }}>
                  <span style={{ fontSize: 20, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif" }}>{v.chairs}</span>
                  <span style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", fontFamily: "system-ui, sans-serif" }}>chair{v.chairs > 1 ? "s" : ""} available</span>
                </div>
              </div>
              {/* Info */}
              <div style={{ flex: 1, padding: "24px 24px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -0.5, marginBottom: 6 }}>{v.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 11, height: 11, borderRadius: "50%", background: C.primary }} />
                    <span style={{ fontSize: 17, color: C.body, fontFamily: "system-ui, sans-serif" }}>{v.suburb}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <span>{"★".repeat(Math.round(v.rating))}</span>
                    <span style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif" }}>{v.rating}</span>
                    <span style={{ fontSize: 15, color: C.body, fontFamily: "system-ui, sans-serif" }}>({v.reviews})</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {v.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 13, fontWeight: 600, color: C.primary, background: `${C.primary}10`, border: `1px solid ${C.primary}22`, borderRadius: 7, padding: "4px 11px", fontFamily: "system-ui, sans-serif" }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  <div>
                    <span style={{ fontSize: 36, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -1 }}>${v.price}</span>
                    <span style={{ fontSize: 16, color: C.body, fontFamily: "system-ui, sans-serif" }}>/day</span>
                  </div>
                  <div style={{ background: C.primary, borderRadius: 13, padding: "12px 24px", fontSize: 18, fontWeight: 700, color: "white", fontFamily: "system-ui, sans-serif" }}>
                    Book Now
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 6: 4 STAT COLUMNS — Full 1920px width
══════════════════════════════════════════════════════ */
const STATS = [
  { value: "200+",   label: "Verified venues", sub: "And growing every week", bg: C.text,    fg: "white",    accent: C.secondary },
  { value: "$2,400", label: "Avg monthly earn", sub: "Per chair, per venue",  bg: C.primary, fg: "white",    accent: C.accent   },
  { value: "2 min",  label: "To book a space",  sub: "Search → confirm",      bg: C.accent,  fg: C.text,     accent: C.primary  },
  { value: "100%",   label: "Professionals",    sub: "Verified and trusted",  bg: C.secondary, fg: C.text,   accent: C.primary  },
];

const SceneStats: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: C.bg, display: "flex" }}>
      {STATS.map((s, i) => {
        const t = eo5(cl((frame - i * 14) / 20, 0, 1));
        return (
          <div key={i} style={{
            flex: 1, background: s.bg, borderRight: i < 3 ? `2px solid rgba(255,255,255,0.15)` : "none",
            display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "flex-start",
            padding: "0 56px",
            transform: `translateY(${(1 - t) * 60}px)`, opacity: t,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: s.accent,
              fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 3.5,
              marginBottom: 14,
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 110,
              fontWeight: 900,
              color: s.fg,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -4,
              lineHeight: 0.9,
              marginBottom: 16,
            }}>
              {s.value}
            </div>
            <div style={{ width: `${t * 80}%`, maxWidth: 240, height: 3, background: s.accent, borderRadius: 2, marginBottom: 16 }} />
            <div style={{ fontSize: 26, color: `${s.fg}88`, fontFamily: "system-ui, sans-serif" }}>{s.sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════
   SCENE 7: CTA — Full-bleed landscape close
══════════════════════════════════════════════════════ */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT   = eo3(cl(frame / 16, 0, 1));
  const h1T   = eo4(cl((frame - 4)  / 18, 0, 1));
  const h2T   = eo4(cl((frame - 12) / 18, 0, 1));
  const lineT = eo3(cl((frame - 18) / 20, 0, 1));
  const subT  = eo3(cl((frame - 26) / 16, 0, 1));
  const btn1T = eo5(cl((frame - 36) / 14, 0, 1));
  const btn2T = eo5(cl((frame - 46) / 14, 0, 1));
  const urlT  = eo3(cl((frame - 64) / 12, 0, 1));
  const glowP = 0.6 + Math.sin(frame * 0.07) * 0.4;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${C.primary} 0%, #1A3CC7 100%)`,
      opacity: bgT,
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "58px 58px",
      }} />
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 1200, height: 700, borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(255,255,255,${0.07 * glowP}) 0%, transparent 70%)`,
      }} />

      {/* Left: headline copy */}
      <div style={{
        position: "absolute",
        left: 100, top: "50%",
        transform: "translateY(-50%)",
        width: 780,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.45)",
          fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 5,
          marginBottom: 20, opacity: h1T,
        }}>
          Beta access · Now open
        </div>

        <div style={{
          fontSize: 130, fontWeight: 900, color: "white",
          fontFamily: "system-ui, sans-serif", letterSpacing: -6, lineHeight: 0.88,
          textTransform: "uppercase",
          opacity: h1T, transform: `translateY(${(1 - h1T) * 40}px)`, marginBottom: 4,
        }}>
          JOIN
        </div>
        <div style={{
          fontSize: 130, fontWeight: 900, color: "white",
          fontFamily: "system-ui, sans-serif", letterSpacing: -6, lineHeight: 0.88,
          textTransform: "uppercase",
          opacity: h2T, transform: `translateY(${(1 - h2T) * 40}px)`, marginBottom: 30,
        }}>
          SHARED SALON.
        </div>

        <div style={{ width: `${lineT * 320}px`, height: 4, background: C.accent, borderRadius: 2, marginBottom: 26 }} />

        <div style={{
          fontSize: 26, color: "rgba(255,255,255,0.55)",
          fontFamily: "system-ui, sans-serif", lineHeight: 1.6,
          opacity: subT,
        }}>
          For venue owners earning from idle chairs.
          <br />
          For freelancers finding trusted spaces.
        </div>

        <div style={{ marginTop: 16, fontSize: 18, color: "rgba(255,255,255,0.28)", fontFamily: "monospace", opacity: urlT }}>
          sharedsalon.com.au
        </div>
      </div>

      {/* Right: CTA buttons */}
      <div style={{
        position: "absolute",
        right: 100, top: "50%",
        transform: "translateY(-50%)",
        display: "flex", flexDirection: "column", gap: 20,
        width: 560,
      }}>
        <div style={{ transform: `scale(${btn1T})`, opacity: btn1T, transformOrigin: "right center" }}>
          <div style={{
            background: "white", borderRadius: 22,
            padding: "28px 44px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>For salon venues</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: C.primary, fontFamily: "system-ui, sans-serif" }}>List Your Chairs</div>
            </div>
            <div style={{ fontSize: 32, color: C.primary }}>→</div>
          </div>
        </div>

        <div style={{ transform: `scale(${btn2T})`, opacity: btn2T, transformOrigin: "right center" }}>
          <div style={{
            background: "rgba(255,255,255,0.12)",
            border: "2px solid rgba(255,255,255,0.35)",
            borderRadius: 22, padding: "28px 44px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 4 }}>For freelancers</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "white", fontFamily: "system-ui, sans-serif" }}>Find Your Space</div>
            </div>
            <div style={{ fontSize: 32, color: "rgba(255,255,255,0.6)" }}>→</div>
          </div>
        </div>

        {/* Platform reassurance */}
        <div style={{ opacity: urlT, display: "flex", gap: 20, justifyContent: "flex-end", paddingRight: 4, marginTop: 4 }}>
          {["Free to join", "No lock-ins", "Beta access"].map((tag) => (
            <div key={tag} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent }} />
              <span style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, sans-serif" }}>{tag}</span>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── ROOT ─── */
export const SharedSalonDesktopAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneHook /></Sequence>
    <Sequence from={90}  durationInFrames={150}><SceneTwoSides /></Sequence>
    <Sequence from={240} durationInFrames={150}><SceneChaos /></Sequence>
    <Sequence from={390} durationInFrames={150}><SceneVenueDeep /></Sequence>
    <Sequence from={540} durationInFrames={150}><SceneFreelancer /></Sequence>
    <Sequence from={690} durationInFrames={120}><SceneStats /></Sequence>
    <Sequence from={810} durationInFrames={90}><SceneCTA /></Sequence>
  </AbsoluteFill>
);
