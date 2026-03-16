/**
 * Shared Salon — Freelancer Ad
 * "Stop chasing. Start booking."
 *
 * 16:9 landscape (1920×1080), 450 frames (15s) @30fps
 *
 * Scene 1 (0–90f,   3.0s): CHAOS    — "Facebook groups", "word of mouth" etc. swept away by Shared Salon
 * Scene 2 (90–255f,  5.5s): DISCOVER — 3 full-height venue cards filling the entire landscape
 * Scene 3 (255–390f, 4.5s): TRUST   — Booking confirmation, verification, editorial proof
 * Scene 4 (390–450f, 2.0s): CTA     — "Find your space"
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

const easeOut3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const easeOut4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const easeSnap = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);

/* ═══════════════════ SCENE 1: CHAOS → CLARITY ═══════════════════ */

// Deterministic "chaos" words — old way of finding salon spaces
const CHAOS_WORDS = [
  { text: "Facebook Groups",   x: 68,   y: 140, rot: -8,  size: 52, color: "#6B7280" },
  { text: "Word of Mouth",     x: 820,  y: 80,  rot: 6,   size: 44, color: "#6B7280" },
  { text: "Cold DMs",          x: 1460, y: 160, rot: -14, size: 48, color: "#6B7280" },
  { text: "NO REPLIES",        x: 280,  y: 380, rot: 10,  size: 58, color: "#DC2626" },
  { text: "Last Minute",       x: 980,  y: 320, rot: -6,  size: 46, color: "#6B7280" },
  { text: "Overpriced",        x: 1560, y: 380, rot: 11,  size: 50, color: "#6B7280" },
  { text: "Unreliable",        x: 140,  y: 600, rot: -4,  size: 54, color: "#6B7280" },
  { text: "Outdated listings", x: 760,  y: 640, rot: 8,   size: 42, color: "#6B7280" },
  { text: "Time Wasted",       x: 1300, y: 580, rot: -9,  size: 48, color: "#DC2626" },
  { text: "No contracts",      x: 380,  y: 820, rot: 5,   size: 44, color: "#6B7280" },
  { text: "Uncertainty",       x: 1050, y: 860, rot: -12, size: 50, color: "#6B7280" },
  { text: "Guesswork",         x: 1620, y: 720, rot: 7,   size: 46, color: "#6B7280" },
];

const SceneChaos: React.FC = () => {
  const frame = useCurrentFrame();

  // Blue wipe sweeps from left to right starting at frame 50
  const wipeProgress = easeOut3(Math.max(0, Math.min((frame - 48) / 22, 1)));
  const wipeX = wipeProgress * 2200; // wipe beyond right edge

  // Clarity text appears after wipe
  const clarityT = easeOut4(Math.max(0, Math.min((frame - 74) / 16, 1)));
  const sub1T    = easeOut3(Math.max(0, Math.min((frame - 80) / 16, 1)));

  return (
    <AbsoluteFill style={{ background: C.text }}>
      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(220,232,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Chaos words — appear then get wiped */}
      {CHAOS_WORDS.map((w, i) => {
        const wordT = easeOut3(Math.max(0, Math.min((frame - i * 2) / 12, 1)));
        // Words to the left of the wipe get pushed away
        const isWiped = w.x < wipeX - 200;
        const wipeOffset = isWiped ? -Math.min((wipeX - 200 - w.x) * 0.6, 400) : 0;

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: w.x + wipeOffset,
              top: w.y,
              fontSize: w.size,
              fontWeight: 700,
              color: w.color,
              fontFamily: "system-ui, sans-serif",
              transform: `rotate(${w.rot}deg)`,
              opacity: wordT * (1 - Math.min(Math.abs(wipeOffset) / 300, 1)),
              whiteSpace: "nowrap",
            }}
          >
            {w.text}
          </div>
        );
      })}

      {/* Blue wipe bar */}
      <div style={{
        position: "absolute",
        top: 0, bottom: 0,
        left: wipeX - 8,
        width: 8,
        background: C.primary,
        boxShadow: `0 0 40px 20px rgba(37,99,235,0.6)`,
        opacity: wipeProgress > 0 && wipeProgress < 1 ? 1 : 0,
      }} />

      {/* "There's a better way." — appears post-wipe */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: clarityT,
        transform: `scale(${0.85 + clarityT * 0.15})`,
      }}>
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: 4,
          marginBottom: 20,
          opacity: sub1T,
        }}>
          Introducing Shared Salon
        </div>
        <div style={{
          fontSize: 160,
          fontWeight: 900,
          color: "white",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -7,
          lineHeight: 0.92,
          textAlign: "center",
          textTransform: "uppercase",
        }}>
          THERE'S A
          <br />
          <span style={{ color: C.primary }}>BETTER WAY.</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 2: VENUE DISCOVERY ═══════════════════ */

// Each venue card: 600px wide × full height — fills the landscape
const VenueCard: React.FC<{
  startFrame: number;
  venueName: string;
  suburb: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  chairsAvailable: number;
  tags: string[];
  gradientFrom: string;
  gradientTo: string;
  index: number;
}> = ({
  startFrame, venueName, suburb, pricePerDay, rating, reviewCount,
  chairsAvailable, tags, gradientFrom, gradientTo, index,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;
  const t = easeSnap(Math.max(0, Math.min(localFrame / 26, 1)));
  const opacity = interpolate(t, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });

  const stars = Math.round(rating);

  return (
    <div style={{
      transform: `translateY(${(1 - t) * 80}px)`,
      opacity,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "white",
      borderRadius: 28,
      overflow: "hidden",
      boxShadow: "0 8px 40px rgba(11,23,48,0.12)",
      border: `1.5px solid ${C.border}`,
    }}>
      {/* Venue "photo" — rich gradient with venue silhouette */}
      <div style={{
        flex: "0 0 400px",
        background: `linear-gradient(145deg, ${gradientFrom} 0%, ${gradientTo} 100%)`,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "28px",
      }}>
        {/* Verification badge */}
        <div style={{
          position: "absolute", top: 24, right: 24,
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.95)",
          border: `1px solid ${C.border}`,
          borderRadius: 100,
          padding: "8px 16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16A34A" }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: "#166534", fontFamily: "system-ui, sans-serif" }}>
            Verified
          </span>
        </div>

        {/* Abstract chair silhouette in gradient */}
        <svg width={180} height={220} viewBox="0 0 240 340" style={{ position: "absolute", right: 32, top: 80, opacity: 0.18 }}>
          <rect x={82} y={8} width={76} height={34} rx={13} fill="white" />
          <rect x={55} y={38} width={130} height={148} rx={18} fill="white" />
          <rect x={36} y={178} width={168} height={70} rx={14} fill="white" />
          <rect x={106} y={248} width={28} height={58} rx={7} fill="white" />
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const rad = ((deg - 90) * Math.PI) / 180;
            return <line key={i} x1={120} y1={308} x2={120 + Math.cos(rad) * 74} y2={308 + Math.sin(rad) * 12} stroke="white" strokeWidth={11} strokeLinecap="round" />;
          })}
        </svg>

        {/* Chairs available badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          background: `rgba(37,99,235,0.9)`,
          borderRadius: 12,
          padding: "10px 18px",
          marginBottom: 12,
          width: "fit-content",
        }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif" }}>
            {chairsAvailable}
          </span>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,0.85)", fontFamily: "system-ui, sans-serif" }}>
            {chairsAvailable === 1 ? "chair" : "chairs"} available
          </span>
        </div>
      </div>

      {/* Venue info */}
      <div style={{ flex: 1, padding: "28px 28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -0.5, lineHeight: 1.15, marginBottom: 8 }}>
            {venueName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: C.primary }} />
            <span style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>{suburb}</span>
          </div>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 2 }}>
              {[1,2,3,4,5].map((s) => (
                <span key={s} style={{ fontSize: 18, color: s <= stars ? "#F59E0B" : C.border }}>★</span>
              ))}
            </div>
            <span style={{ fontSize: 18, fontWeight: 700, color: C.text, fontFamily: "system-ui, sans-serif" }}>{rating}</span>
            <span style={{ fontSize: 16, color: C.body, fontFamily: "system-ui, sans-serif" }}>({reviewCount})</span>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            {tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 14, fontWeight: 600, color: C.primary,
                background: `${C.primary}10`, border: `1px solid ${C.primary}25`,
                borderRadius: 8, padding: "5px 12px",
                fontFamily: "system-ui, sans-serif",
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
          <div>
            <span style={{ fontSize: 40, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -1 }}>
              ${pricePerDay}
            </span>
            <span style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif" }}>/day</span>
          </div>
          <div style={{
            background: C.primary, borderRadius: 14,
            padding: "14px 28px",
            fontSize: 20, fontWeight: 700,
            color: "white", fontFamily: "system-ui, sans-serif",
          }}>
            Book Now
          </div>
        </div>
      </div>
    </div>
  );
};

const SceneDiscovery: React.FC = () => {
  const frame = useCurrentFrame();

  const headerT = easeOut3(Math.min(frame / 14, 1));

  const VENUES = [
    {
      startFrame: 8,
      venueName: "Bliss Beauty Studio",
      suburb: "Bondi Junction, NSW",
      pricePerDay: 85,
      rating: 4.9,
      reviewCount: 42,
      chairsAvailable: 2,
      tags: ["Hair", "Colour", "Full Kit"],
      gradientFrom: "#DCE8FF",
      gradientTo: "#B8D1FF",
      index: 0,
    },
    {
      startFrame: 20,
      venueName: "Luxe Salon & Co.",
      suburb: "South Yarra, VIC",
      pricePerDay: 110,
      rating: 5.0,
      reviewCount: 28,
      chairsAvailable: 1,
      tags: ["Premium", "Backwash", "Walk-in Friendly"],
      gradientFrom: "#F0FDF4",
      gradientTo: "#BBF7D0",
      index: 1,
    },
    {
      startFrame: 34,
      venueName: "The Styling Room",
      suburb: "Paddington, QLD",
      pricePerDay: 75,
      rating: 4.8,
      reviewCount: 61,
      chairsAvailable: 3,
      tags: ["Flexible Hours", "Parking", "Coffee Bar"],
      gradientFrom: "#FFF7ED",
      gradientTo: "#FED7AA",
      index: 2,
    },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Soft gradient header */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 72,
        background: `${C.surface}F5`,
        borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center",
        padding: "0 48px", gap: 24,
        opacity: headerT,
        transform: `translateY(${(1 - headerT) * -20}px)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.primary }} />
          <span style={{ fontSize: 22, fontWeight: 800, color: C.primary, fontFamily: "system-ui, sans-serif" }}>
            Shared Salon
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: C.secondary, border: `1px solid ${C.border}`,
          borderRadius: 100, padding: "8px 20px",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.primary }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: C.primary, fontFamily: "system-ui, sans-serif" }}>
            127 venues near you
          </span>
        </div>
        {["All", "Hair", "Nails", "Beauty", "Barber"].map((tab) => (
          <span key={tab} style={{
            fontSize: 16, color: tab === "Hair" ? C.primary : C.body,
            fontFamily: "system-ui, sans-serif", fontWeight: tab === "Hair" ? 700 : 500,
          }}>{tab}</span>
        ))}
      </div>

      {/* 3 Venue cards filling full landscape */}
      <div style={{
        position: "absolute",
        top: 80, left: 24, right: 24, bottom: 24,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 18,
      }}>
        {VENUES.map((v, i) => (
          <VenueCard key={i} {...v} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 3: TRUST ═══════════════════ */
const SceneTrust: React.FC = () => {
  const frame = useCurrentFrame();

  // Three editorial trust moments — each ~45 frames
  const MOMENTS = [
    { start: 0,  end: 44,  color: C.primary,    label: "EVERY VENUE IS", headline: "VERIFIED.", sub: "Identity-checked owners. Professional-grade spaces. No surprises." },
    { start: 44, end: 88,  color: "#059669",     label: "BOOKING TAKES", headline: "2 MINUTES.", sub: "Search, pick a date, confirm. No back-and-forth, no ghosting." },
    { start: 88, end: 135, color: C.text,        label: "NO MORE RELYING ON", headline: "LUCK.", sub: "Shared Salon replaces guesswork with clarity, trust, and real listings." },
  ];

  const active = MOMENTS.find((m) => frame >= m.start && frame < m.end) ?? MOMENTS[MOMENTS.length - 1];
  const localF = frame - active.start;
  const mT = easeSnap(Math.min(localF / 18, 1));
  const fadeOut = active.end < 135
    ? interpolate(localF, [active.end - active.start - 8, active.end - active.start], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Radial glow per moment */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, ${active.color}0D 0%, transparent 60%)`,
      }} />

      {/* Top gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 300,
        background: `linear-gradient(180deg, ${C.secondary}40 0%, transparent 100%)`,
      }} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "flex-start", justifyContent: "center",
        padding: "0 120px",
        opacity: fadeOut,
      }}>
        {/* Small label */}
        <div style={{
          fontSize: 20, fontWeight: 700, color: active.color,
          fontFamily: "system-ui, sans-serif", textTransform: "uppercase",
          letterSpacing: 4, marginBottom: 20,
          opacity: mT, transform: `translateY(${(1 - mT) * -20}px)`,
        }}>
          {active.label}
        </div>

        {/* HUGE word */}
        <div style={{
          fontSize: 220,
          fontWeight: 900,
          color: active.color,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -10,
          lineHeight: 0.88,
          textTransform: "uppercase",
          transform: `scale(${0.75 + mT * 0.25})`,
          transformOrigin: "left center",
          opacity: mT,
          marginBottom: 40,
        }}>
          {active.headline}
        </div>

        {/* Divider */}
        <div style={{
          width: `${mT * 560}px`, height: 4,
          background: active.color, borderRadius: 2, marginBottom: 32,
        }} />

        {/* Supporting text */}
        <div style={{
          fontSize: 36,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
          lineHeight: 1.55,
          maxWidth: 1100,
          opacity: mT,
          transform: `translateY(${(1 - mT) * 24}px)`,
        }}>
          {active.sub}
        </div>

        {/* Progress dots */}
        <div style={{ display: "flex", gap: 12, marginTop: 64 }}>
          {MOMENTS.map((_, i) => (
            <div key={i} style={{
              height: 6, borderRadius: 3,
              width: i === MOMENTS.indexOf(active) ? 48 : 14,
              background: i === MOMENTS.indexOf(active) ? active.color : C.border,
            }} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 4: CTA ═══════════════════ */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const t    = easeOut4(Math.min(frame / 18, 1));
  const h1T  = easeOut4(Math.max(0, Math.min((frame - 4)  / 16, 1)));
  const btnT = easeSnap(Math.max(0, Math.min((frame - 18) / 14, 1)));
  const urlT = easeOut3(Math.max(0, Math.min((frame - 36) / 12, 1)));

  return (
    <AbsoluteFill style={{ background: C.text, opacity: t }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(220,232,255,0.05) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Glow */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 1000, height: 600, borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(37,99,235,0.16) 0%, transparent 70%)`,
      }} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 120px",
      }}>
        <div style={{
          fontSize: 20, fontWeight: 700, color: `${C.primary}CC`,
          fontFamily: "system-ui, sans-serif", textTransform: "uppercase",
          letterSpacing: 4, marginBottom: 24,
          opacity: h1T, transform: `translateY(${(1 - h1T) * -16}px)`,
        }}>
          Free to join · Beta now open
        </div>

        <div style={{
          fontSize: 140,
          fontWeight: 900,
          color: "white",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -6,
          lineHeight: 0.9,
          marginBottom: 16,
          opacity: h1T,
          transform: `translateY(${(1 - h1T) * 40}px)`,
        }}>
          FIND YOUR
          <br />
          <span style={{ color: C.primary }}>SPACE.</span>
        </div>

        <div style={{
          fontSize: 34, color: "rgba(255,255,255,0.55)",
          fontFamily: "system-ui, sans-serif", marginBottom: 56,
          opacity: h1T,
        }}>
          Trusted venues. Flexible bookings. No hassle.
        </div>

        <div style={{ transform: `scale(${btnT})`, opacity: btnT, transformOrigin: "center" }}>
          <div style={{
            background: C.primary,
            borderRadius: 22, padding: "28px 80px",
            fontSize: 32, fontWeight: 900,
            color: "white", fontFamily: "system-ui, sans-serif",
            boxShadow: `0 12px 44px rgba(37,99,235,0.50)`,
            letterSpacing: -0.5,
          }}>
            Find a Space Now →
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 20, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", opacity: urlT }}>
          sharedsalon.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── ROOT ─── */
export const SharedSalonFreelancerAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneChaos /></Sequence>
    <Sequence from={90}  durationInFrames={165}><SceneDiscovery /></Sequence>
    <Sequence from={255} durationInFrames={135}><SceneTrust /></Sequence>
    <Sequence from={390} durationInFrames={60}><SceneCTA /></Sequence>
  </AbsoluteFill>
);
