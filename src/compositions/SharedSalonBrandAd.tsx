/**
 * Shared Salon — Brand / Marketplace Ad
 * "Two sides. One platform."
 *
 * 1:1 square (1080×1080), 450 frames (15s) @30fps
 *
 * Scene 1 (0–90f,   3.0s): WORD SLAM    — "SHARED" / "SALON." editorial reveal
 * Scene 2 (90–240f, 5.0s): TWO SIDES    — Split screen: venue owners ↔ freelancers
 * Scene 3 (240–375f, 4.5s): CONNECTION  — The match animation, platform reveal, stats
 * Scene 4 (375–450f, 2.5s): CTA         — Both sides invited — "Join Shared Salon"
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

/* ─── SALON CHAIR SVG (compact) ─── */
const ChairMark: React.FC<{ color?: string; size?: number; frame?: number }> = ({
  color = C.primary, size = 1, frame = 0,
}) => {
  const w = Math.round(160 * size);
  const h = Math.round(220 * size);
  const pulse = 0.65 + Math.sin(frame * 0.05) * 0.35;

  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{
        position: "absolute", left: "50%", top: "40%",
        transform: "translate(-50%, -50%)",
        width: w * 2.2, height: w * 2.2, borderRadius: "50%",
        background: `radial-gradient(circle, ${color}${Math.round(0.18 * pulse * 255).toString(16).padStart(2, "0")} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <svg width={w} height={h} viewBox="0 0 160 220">
        <rect x={56} y={5} width={48} height={22} rx={8} fill={color} />
        <rect x={38} y={24} width={84} height={94} rx={12} fill={color} />
        <rect x={46} y={32} width={14} height={74} rx={7} fill="rgba(255,255,255,0.14)" />
        <rect x={24} y={112} width={112} height={44} rx={10} fill={color} />
        <rect x={7} y={114} width={24} height={10} rx={5} fill={color} opacity={0.82} />
        <rect x={129} y={114} width={24} height={10} rx={5} fill={color} opacity={0.82} />
        <rect x={72} y={156} width={16} height={36} rx={5} fill={color} opacity={0.65} />
        {[0, 72, 144, 216, 288].map((deg, i) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          return (
            <React.Fragment key={i}>
              <line x1={80} y1={196} x2={80 + Math.cos(rad) * 46} y2={196 + Math.sin(rad) * 8} stroke={color} strokeWidth={7} strokeLinecap="round" opacity={0.6} />
              <circle cx={80 + Math.cos(rad) * 46} cy={196 + Math.sin(rad) * 8} r={4} fill={color} opacity={0.4} />
            </React.Fragment>
          );
        })}
      </svg>
    </div>
  );
};

/* ─── PARTICLE FIELD ─── */
const ParticleField: React.FC<{ color?: string; count?: number; animate?: boolean }> = ({
  color = C.accent, count = 12, animate = true,
}) => {
  const frame = useCurrentFrame();
  const DEFS = [
    { x: 60,  y: 80,  p: 68, d: 0,  s: 5 },
    { x: 840, y: 60,  p: 54, d: 12, s: 4 },
    { x: 160, y: 300, p: 80, d: 24, s: 6 },
    { x: 920, y: 280, p: 62, d: 8,  s: 4 },
    { x: 90,  y: 540, p: 72, d: 36, s: 5 },
    { x: 950, y: 520, p: 58, d: 18, s: 4 },
    { x: 280, y: 760, p: 76, d: 44, s: 6 },
    { x: 780, y: 800, p: 64, d: 28, s: 4 },
    { x: 120, y: 960, p: 70, d: 52, s: 5 },
    { x: 880, y: 940, p: 56, d: 20, s: 4 },
    { x: 520, y: 180, p: 74, d: 6,  s: 5 },
    { x: 500, y: 900, p: 60, d: 38, s: 4 },
  ];
  return (
    <>
      {DEFS.slice(0, count).map((s, i) => {
        const phase = ((frame + s.d * 4) % s.p) / s.p;
        return (
          <div key={i} style={{
            position: "absolute", left: s.x, top: s.y,
            width: s.s, height: s.s, borderRadius: "50%",
            background: color,
            opacity: animate ? Math.sin(phase * Math.PI) * 0.55 : 0.3,
            pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

/* ═══════════════════ SCENE 1: WORD SLAM ═══════════════════ */
const SceneWordSlam: React.FC = () => {
  const frame = useCurrentFrame();

  // "SHARED" converges from the left
  const sharedT = easeOut4(Math.min(frame / 16, 1));
  // "SALON." converges from the right
  const salonT  = easeOut4(Math.max(0, Math.min((frame - 8) / 16, 1)));
  // Divider line
  const lineT   = easeOut3(Math.max(0, Math.min((frame - 22) / 14, 1)));
  // Tagline
  const tagT    = easeOut3(Math.max(0, Math.min((frame - 46) / 18, 1)));
  // Badge
  const badgeT  = easeOut3(Math.max(0, Math.min((frame - 60) / 16, 1)));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Faint grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, ${C.border} 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
        opacity: 0.5,
      }} />

      {/* Background glow */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 900, height: 600, borderRadius: "50%",
        background: `radial-gradient(ellipse, ${C.secondary}80 0%, transparent 70%)`,
      }} />

      <ParticleField color={C.accent} count={10} />

      {/* Main headline block — vertically centered */}
      <div style={{
        position: "absolute",
        left: 56, right: 56,
        top: "50%",
        transform: "translateY(-56%)",
      }}>
        {/* "SHARED" from left */}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            fontSize: 210,
            fontWeight: 900,
            color: C.text,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -10,
            lineHeight: 0.88,
            textTransform: "uppercase",
            transform: `translateX(${(1 - sharedT) * -300}px)`,
            opacity: sharedT,
          }}>
            SHARED
          </div>
        </div>

        {/* "SALON." from right */}
        <div style={{ overflow: "hidden" }}>
          <div style={{
            fontSize: 210,
            fontWeight: 900,
            color: C.primary,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -10,
            lineHeight: 0.88,
            textTransform: "uppercase",
            transform: `translateX(${(1 - salonT) * 300}px)`,
            opacity: salonT,
          }}>
            SALON.
          </div>
        </div>

        {/* Gold divider */}
        <div style={{
          width: `${lineT * 100}%`,
          height: 5,
          background: C.accent,
          borderRadius: 3,
          marginTop: 28,
          marginBottom: 32,
        }} />

        {/* Tagline */}
        <div style={{
          fontSize: 44,
          fontWeight: 500,
          color: C.body,
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.45,
          opacity: tagT,
          transform: `translateY(${(1 - tagT) * 24}px)`,
        }}>
          The marketplace connecting
          <br />
          <strong style={{ color: C.text, fontWeight: 700 }}>salon owners</strong> and{" "}
          <strong style={{ color: C.primary, fontWeight: 700 }}>freelancers</strong>.
        </div>
      </div>

      {/* Beta badge — bottom right */}
      <div style={{
        position: "absolute", bottom: 64, right: 60,
        opacity: badgeT,
        transform: `translateY(${(1 - badgeT) * 14}px)`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: `${C.accent}55`,
          border: `1.5px solid ${C.accent}80`,
          borderRadius: 100, padding: "10px 26px",
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7A5C14" }} />
          <span style={{ fontSize: 18, fontWeight: 700, color: "#7A5C14", fontFamily: "system-ui, sans-serif" }}>
            Beta · sharedsalon.com.au
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 2: TWO SIDES ═══════════════════ */
const SceneTwoSides: React.FC = () => {
  const frame = useCurrentFrame();

  // Both halves slide in from opposite directions
  const topT    = easeSnap(Math.min(frame / 22, 1));
  const bottomT = easeSnap(Math.max(0, Math.min((frame - 8) / 22, 1)));

  // Content within each half staggers in
  const topContentT    = easeOut3(Math.max(0, Math.min((frame - 20) / 18, 1)));
  const bottomContentT = easeOut3(Math.max(0, Math.min((frame - 28) / 18, 1)));

  // Divider pulse
  const divPulse = 0.7 + Math.sin(frame * 0.06) * 0.3;

  // Venue stats that count up
  const venueStatT = easeOut3(Math.max(0, Math.min((frame - 40) / 60, 1)));
  const freeStatT  = easeOut3(Math.max(0, Math.min((frame - 50) / 60, 1)));

  const chairFloat = Math.sin(frame * 0.035) * 6;
  const scissors1  = Math.sin(frame * 0.04 + 1.2) * 5;

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* TOP HALF — Venue Owner (dark navy) */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0, height: "50%",
        background: C.text,
        transform: `translateY(${(1 - topT) * -100}px)`,
        opacity: topT,
        overflow: "hidden",
      }}>
        {/* Subtle blue glow */}
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 30% 50%, rgba(37,99,235,0.12) 0%, transparent 65%)`,
        }} />

        <ParticleField color={C.accent} count={6} />

        {/* Left: text content */}
        <div style={{
          position: "absolute",
          left: 56, top: "50%",
          transform: "translateY(-50%)",
          opacity: topContentT,
          transform: `translateY(calc(-50% + ${(1 - topContentT) * -20}px))`,
        }}>
          <div style={{ fontSize: 16, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>
            Venue Owners
          </div>
          <div style={{ fontSize: 68, fontWeight: 900, color: "white", fontFamily: "system-ui, sans-serif", letterSpacing: -3, lineHeight: 1, marginBottom: 10 }}>
            TURN EMPTY
            <br />
            <span style={{ color: C.secondary }}>INTO INCOME.</span>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 52, fontWeight: 900, color: C.accent, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1 }}>
                ${Math.round(2400 * venueStatT).toLocaleString()}
              </div>
              <div style={{ fontSize: 15, color: C.body, fontFamily: "system-ui, sans-serif" }}>avg/month per chair</div>
            </div>
          </div>
        </div>

        {/* Right: Chair illustration floating */}
        <div style={{
          position: "absolute",
          right: 48, top: "50%",
          transform: `translateY(calc(-50% + ${chairFloat}px))`,
          opacity: topContentT,
        }}>
          <ChairMark color={C.primary} size={1.1} frame={frame} />
        </div>
      </div>

      {/* BOTTOM HALF — Freelancer (pale blue) */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0, height: "50%",
        background: C.secondary,
        transform: `translateY(${(1 - bottomT) * 100}px)`,
        opacity: bottomT,
        overflow: "hidden",
      }}>
        {/* Subtle texture */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(circle, ${C.primary}0A 1px, transparent 1px)`,
          backgroundSize: "44px 44px",
        }} />

        {/* Left: text content */}
        <div style={{
          position: "absolute",
          left: 56, top: "50%",
          transform: `translateY(calc(-50% + ${(1 - bottomContentT) * 20}px))`,
          opacity: bottomContentT,
        }}>
          <div style={{ fontSize: 16, color: C.primary, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>
            Freelancers
          </div>
          <div style={{ fontSize: 68, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -3, lineHeight: 1, marginBottom: 10 }}>
            FIND TRUSTED
            <br />
            <span style={{ color: C.primary }}>SPACES FAST.</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 52, fontWeight: 900, color: C.primary, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1 }}>
              {Math.round(127 * freeStatT)}+
            </div>
            <div style={{ fontSize: 15, color: C.body, fontFamily: "system-ui, sans-serif" }}>verified venues near you</div>
          </div>
        </div>

        {/* Right: Scissors / beauty tool visual */}
        <div style={{
          position: "absolute",
          right: 56, top: "50%",
          transform: `translateY(calc(-50% + ${scissors1}px))`,
          opacity: bottomContentT,
        }}>
          {/* Scissors SVG — minimal, elegant */}
          <svg width={140} height={200} viewBox="0 0 140 200">
            {/* Handle 1 */}
            <circle cx={30} cy={30} r={24} fill="none" stroke={C.primary} strokeWidth={8} />
            <circle cx={30} cy={30} r={12} fill={C.primary} opacity={0.25} />
            {/* Handle 2 */}
            <circle cx={110} cy={30} r={24} fill="none" stroke={C.primary} strokeWidth={8} />
            <circle cx={110} cy={30} r={12} fill={C.primary} opacity={0.25} />
            {/* Blade 1: from handle 1 down-right to tip */}
            <line x1={47} y1={46} x2={95} y2={148} stroke={C.primary} strokeWidth={9} strokeLinecap="round" />
            {/* Blade 2: from handle 2 down-left to tip */}
            <line x1={93} y1={46} x2={45} y2={148} stroke={C.text} strokeWidth={9} strokeLinecap="round" />
            {/* Pivot screw */}
            <circle cx={69} cy={96} r={9} fill={C.accent} stroke={C.primary} strokeWidth={2} />
            {/* Tip glow */}
            <circle cx={70} cy={152} r={6} fill={C.primary} opacity={0.4} />
          </svg>
        </div>
      </div>

      {/* Center divider with Shared Salon mark */}
      <div style={{
        position: "absolute",
        left: 0, right: 0,
        top: "50%",
        transform: "translateY(-50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
      }}>
        {/* Left rule */}
        <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, transparent, ${C.border})`, marginRight: 20 }} />

        {/* Center mark */}
        <div style={{
          background: "white",
          border: `2px solid ${C.border}`,
          borderRadius: 100,
          padding: "12px 28px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: `0 0 0 ${6 * divPulse}px rgba(37,99,235,0.08)`,
        }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.primary, boxShadow: `0 0 8px ${C.primary}` }} />
          <span style={{ fontSize: 22, fontWeight: 800, color: C.primary, fontFamily: "system-ui, sans-serif" }}>
            Shared Salon
          </span>
        </div>

        {/* Right rule */}
        <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${C.border}, transparent)`, marginLeft: 20 }} />
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 3: CONNECTION ═══════════════════ */
const SceneConnection: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT   = easeOut3(Math.min(frame / 16, 1));
  const h1T   = easeOut4(Math.max(0, Math.min((frame - 10) / 18, 1)));
  const h2T   = easeOut4(Math.max(0, Math.min((frame - 18) / 18, 1)));

  // Stat cards
  const stat1T = easeSnap(Math.max(0, Math.min((frame - 36) / 18, 1)));
  const stat2T = easeSnap(Math.max(0, Math.min((frame - 52) / 18, 1)));
  const stat3T = easeSnap(Math.max(0, Math.min((frame - 68) / 18, 1)));

  // Connection animation — two arcs converge
  const arcT   = easeOut3(Math.max(0, Math.min((frame - 26) / 30, 1)));
  const glowPulse = 0.6 + Math.sin(frame * 0.07) * 0.4;

  return (
    <AbsoluteFill style={{ background: C.bg, opacity: bgT }}>
      {/* Top blue gradient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 400,
        background: `linear-gradient(180deg, ${C.secondary}60 0%, transparent 100%)`,
      }} />

      <ParticleField color={C.accent} count={10} />

      {/* Central platform glow */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,${0.10 * glowPulse}) 0%, transparent 70%)`,
      }} />

      {/* Headline */}
      <div style={{
        position: "absolute", top: 80, left: 60, right: 60,
        opacity: h1T,
        transform: `translateY(${(1 - h1T) * -24}px)`,
      }}>
        <div style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: 3, marginBottom: 10 }}>
          One platform. Both sides.
        </div>
        <div style={{
          fontSize: 90,
          fontWeight: 900,
          color: C.text,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -4,
          lineHeight: 0.92,
        }}>
          WHERE SALONS
          <br />
          <span style={{ color: C.primary }}>MEET</span> TALENT.
        </div>
      </div>

      {/* Connection arc SVG */}
      <svg
        viewBox="0 0 1080 1080"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {/* Venue arc (from left) */}
        <path
          d="M 180 540 Q 380 380 540 540"
          fill="none"
          stroke={C.text}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="400"
          strokeDashoffset={400 - 400 * arcT}
          opacity={0.4}
        />
        {/* Freelancer arc (from right) */}
        <path
          d="M 900 540 Q 700 700 540 540"
          fill="none"
          stroke={C.primary}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="400"
          strokeDashoffset={400 - 400 * arcT}
          opacity={0.6}
        />
        {/* Center connection dot */}
        {arcT > 0.85 && (
          <circle cx={540} cy={540} r={12 * glowPulse} fill={C.primary} opacity={0.8} />
        )}
      </svg>

      {/* Stat cards — full width at bottom */}
      <div style={{
        position: "absolute",
        bottom: 60, left: 60, right: 60,
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 20,
      }}>
        {[
          { label: "Venues listed", value: "200+", color: C.text, t: stat1T, desc: "and growing weekly" },
          { label: "Avg monthly earn", value: "$2,400", color: C.primary, t: stat2T, desc: "per chair listed" },
          { label: "Booking time", value: "2 min", color: "#059669", t: stat3T, desc: "start to confirmed" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: "white",
              border: `1.5px solid ${C.border}`,
              borderRadius: 22,
              padding: "28px 28px",
              transform: `scale(${s.t})`,
              opacity: s.t,
              transformOrigin: "bottom center",
              boxShadow: "0 6px 24px rgba(11,23,48,0.08)",
            }}
          >
            <div style={{ fontSize: 15, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 62, fontWeight: 900, color: s.color, fontFamily: "system-ui, sans-serif", letterSpacing: -2.5, lineHeight: 1, marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 17, color: C.body, fontFamily: "system-ui, sans-serif" }}>
              {s.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Left label */}
      {h2T > 0 && (
        <div style={{
          position: "absolute", left: 60, top: "50%", transform: "translateY(-50%)",
          textAlign: "center",
          opacity: h2T,
        }}>
          <div style={{
            background: C.text, borderRadius: 100, padding: "10px 22px",
            fontSize: 16, fontWeight: 700, color: "white",
            fontFamily: "system-ui, sans-serif", marginBottom: 8,
          }}>Venue Owners</div>
          <ChairMark color={C.text} size={0.55} frame={frame} />
        </div>
      )}

      {/* Right label */}
      {h2T > 0 && (
        <div style={{
          position: "absolute", right: 60, top: "50%", transform: "translateY(-50%)",
          textAlign: "center",
          opacity: h2T,
        }}>
          <div style={{
            background: C.primary, borderRadius: 100, padding: "10px 22px",
            fontSize: 16, fontWeight: 700, color: "white",
            fontFamily: "system-ui, sans-serif", marginBottom: 8,
          }}>Freelancers</div>
          <svg width={88} height={110} viewBox="0 0 140 200" style={{ opacity: 0.85 }}>
            <circle cx={30} cy={30} r={24} fill="none" stroke={C.primary} strokeWidth={8} />
            <circle cx={110} cy={30} r={24} fill="none" stroke={C.primary} strokeWidth={8} />
            <line x1={47} y1={46} x2={95} y2={148} stroke={C.primary} strokeWidth={9} strokeLinecap="round" />
            <line x1={93} y1={46} x2={45} y2={148} stroke={C.text} strokeWidth={9} strokeLinecap="round" />
            <circle cx={69} cy={96} r={9} fill={C.accent} stroke={C.primary} strokeWidth={2} />
          </svg>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ═══════════════════ SCENE 4: CTA ═══════════════════ */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT   = easeOut3(Math.min(frame / 16, 1));
  const h1T   = easeOut4(Math.max(0, Math.min((frame - 4)  / 18, 1)));
  const btn1T = easeSnap(Math.max(0, Math.min((frame - 20) / 14, 1)));
  const btn2T = easeSnap(Math.max(0, Math.min((frame - 28) / 14, 1)));
  const urlT  = easeOut3(Math.max(0, Math.min((frame - 44) / 12, 1)));

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(155deg, ${C.primary} 0%, #1A3CC7 100%)`,
      opacity: bgT,
    }}>
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
        backgroundSize: "54px 54px",
      }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute", left: "50%", top: "40%",
        transform: "translate(-50%, -50%)",
        width: 800, height: 600, borderRadius: "50%",
        background: `radial-gradient(ellipse, rgba(255,255,255,0.08) 0%, transparent 70%)`,
      }} />

      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "0 80px",
      }}>
        <div style={{
          fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.55)",
          fontFamily: "system-ui, sans-serif", textTransform: "uppercase",
          letterSpacing: 4, marginBottom: 20,
          opacity: h1T, transform: `translateY(${(1 - h1T) * -16}px)`,
        }}>
          Beta access now open
        </div>

        <div style={{
          fontSize: 108,
          fontWeight: 900,
          color: "white",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -5,
          lineHeight: 0.9,
          marginBottom: 16,
          opacity: h1T,
          transform: `translateY(${(1 - h1T) * 40}px)`,
        }}>
          SHARED
          <br />
          SALON.
        </div>

        <div style={{
          fontSize: 26, color: "rgba(255,255,255,0.55)",
          fontFamily: "system-ui, sans-serif", marginBottom: 48,
          opacity: h1T,
        }}>
          The platform connecting both sides of the salon industry.
        </div>

        {/* Two CTAs — venue and freelancer */}
        <div style={{ display: "flex", gap: 20, width: "100%" }}>
          <div style={{ flex: 1, transform: `scale(${btn1T})`, opacity: btn1T, transformOrigin: "right center" }}>
            <div style={{
              background: "white",
              borderRadius: 20, padding: "24px 0",
              fontSize: 24, fontWeight: 800,
              color: C.primary, fontFamily: "system-ui, sans-serif",
              textAlign: "center",
            }}>
              I'm a Venue Owner
            </div>
          </div>
          <div style={{ flex: 1, transform: `scale(${btn2T})`, opacity: btn2T, transformOrigin: "left center" }}>
            <div style={{
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.4)",
              borderRadius: 20, padding: "24px 0",
              fontSize: 24, fontWeight: 800,
              color: "white", fontFamily: "system-ui, sans-serif",
              textAlign: "center",
            }}>
              I'm a Freelancer
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, fontSize: 18, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", opacity: urlT }}>
          sharedsalon.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── ROOT ─── */
export const SharedSalonBrandAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={90}><SceneWordSlam /></Sequence>
    <Sequence from={90}  durationInFrames={150}><SceneTwoSides /></Sequence>
    <Sequence from={240} durationInFrames={135}><SceneConnection /></Sequence>
    <Sequence from={375} durationInFrames={75}><SceneCTA /></Sequence>
  </AbsoluteFill>
);
