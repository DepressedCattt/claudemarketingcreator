/**
 * Shared Salon — Venue Owner Problem Revelation Ad V2
 * "The Math Your Salon Is Ignoring"
 *
 * 9:16 vertical (1080×1920), 610 frames (~20s) @30fps
 * Instagram / Facebook — targeted at salon venue owners
 *
 * Scene 1 (0–140f,   4.7s): HOOK  — Full-screen reframe. $20,800 slams. Bottom panel locks it in.
 * Scene 2 (140–340f,  6.7s): MATH  — Slow receipt build. Each line holds. $12,480 hits hard.
 * Scene 3 (340–520f,  6s):  FLIP  — Full-screen revenue fill. Cards + massive counter.
 * Scene 4 (520–610f,  3s):  CTA   — Premium full-bleed blue close.
 */

import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";

/* ─── BRAND TOKENS ─── */
const C = {
  bg:      "#FAF8F5",
  primary: "#2563EB",
  dark:    "#1A3CC7",
  secondary:"#DCE8FF",
  accent:  "#E7D3A7",
  text:    "#0B1730",
  body:    "#66758F",
  border:  "#D8DEE8",
};

/* ─── EASING ─── */
const eo3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const eo4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);
const eo5 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 5);
const cl  = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const snap = (t: number) => {
  const s = eo5(t);
  return s > 0.72 ? s + Math.sin((s - 0.72) * Math.PI * 5.5) * 0.026 * (1 - s) : s;
};

/* ═══════════════════════════════════════════════════════════
   SCENE 1 — HOOK
   Full 1920px height used intentionally.
   Top: headline. Middle: the number. Bottom: the locked-in math panel.
══════════════════════════════════════════════════════════ */
const SceneHook: React.FC = () => {
  const frame = useCurrentFrame();

  const eyeT  = eo3(cl((frame - 4)  / 14, 0, 1));
  const l1T   = eo4(cl((frame - 12) / 20, 0, 1));
  const l2T   = eo4(cl((frame - 24) / 20, 0, 1));
  const l3T   = eo4(cl((frame - 36) / 20, 0, 1));
  const divT  = eo3(cl((frame - 52) / 14, 0, 1));
  const costT = eo3(cl((frame - 58) / 16, 0, 1));
  const numS  = snap(cl((frame - 66) / 24, 0, 1));
  const numA  = eo5(cl((frame - 66) / 20, 0, 1));
  const subT  = eo3(cl((frame - 88) / 14, 0, 1));
  const panT  = eo4(cl((frame - 78) / 20, 0, 1));

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>

      {/* Dot grid — full screen */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, ${C.border}80 1px, transparent 1px)`,
        backgroundSize: "52px 52px",
        opacity: 0.5,
      }} />

      {/* Soft blue radial top-right */}
      <div style={{
        position: "absolute", top: -200, right: -200,
        width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,0.06), transparent 65%)`,
        pointerEvents: "none",
      }} />

      {/* ── EYEBROW — top ── */}
      <div style={{
        position: "absolute", top: 80, left: 64,
        fontSize: 13, fontWeight: 700, letterSpacing: 3,
        textTransform: "uppercase", color: C.body,
        fontFamily: "system-ui, sans-serif",
        opacity: eyeT,
      }}>
        For salon venue owners
      </div>

      {/* ── HEADLINE — upper third ── */}
      <div style={{ position: "absolute", top: 136, left: 64, right: 64 }}>

        <div style={{
          fontSize: 108, fontWeight: 900, lineHeight: 1.02,
          color: C.text, fontFamily: "system-ui, sans-serif",
          letterSpacing: -4,
          opacity: l1T, transform: `translateY(${(1 - l1T) * 32}px)`,
        }}>
          Your empty
        </div>

        <div style={{
          fontSize: 108, fontWeight: 900, lineHeight: 1.02,
          color: C.text, fontFamily: "system-ui, sans-serif",
          letterSpacing: -4,
          opacity: l2T, transform: `translateY(${(1 - l2T) * 32}px)`,
        }}>
          chairs aren't
        </div>

        <div style={{
          fontSize: 116, fontWeight: 900, lineHeight: 1.02,
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -5,
          opacity: l3T, transform: `translateY(${(1 - l3T) * 32}px)`,
        }}>
          <span style={{ color: C.primary, fontStyle: "italic" }}>just idle.</span>
        </div>
      </div>

      {/* ── DIVIDER ── */}
      <div style={{
        position: "absolute", top: 520, left: 64,
        width: `${divT * 140}px`, height: 3,
        background: `linear-gradient(90deg, ${C.primary}, transparent)`,
        borderRadius: 2,
      }} />

      {/* ── REFRAME + NUMBER — middle ── */}
      <div style={{ position: "absolute", top: 560, left: 64, right: 64 }}>

        <div style={{
          fontSize: 32, fontWeight: 600, color: C.body,
          fontFamily: "system-ui, sans-serif",
          marginBottom: 12,
          opacity: costT, transform: `translateY(${(1 - costT) * 16}px)`,
        }}>
          They're costing you
        </div>

        <div style={{
          fontSize: 196, fontWeight: 900, lineHeight: 0.88,
          color: C.primary, fontFamily: "system-ui, sans-serif",
          letterSpacing: -10,
          transform: `scale(${0.78 + numS * 0.22})`,
          opacity: numA,
          transformOrigin: "left center",
        }}>
          $20,800
        </div>
      </div>

      {/* ── PER YEAR LABEL ── */}
      <div style={{
        position: "absolute", top: 840, left: 64,
        opacity: subT, transform: `translateY(${(1 - subT) * 10}px)`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.primary }} />
        <div style={{
          fontSize: 24, fontWeight: 600, color: C.body,
          fontFamily: "system-ui, sans-serif",
        }}>
          per idle chair · per year
        </div>
      </div>

      {/* ── BOTTOM PANEL — anchors the bottom third ── */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: C.text,
        padding: "56px 64px 72px",
        opacity: panT,
        transform: `translateY(${(1 - panT) * 40}px)`,
      }}>
        <div style={{
          fontSize: 13, fontWeight: 700, letterSpacing: 3,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
          fontFamily: "system-ui, sans-serif",
          marginBottom: 24,
        }}>
          The math
        </div>
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center",
        }}>
          <div>
            <div style={{
              fontSize: 28, fontWeight: 700, color: "white",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.5,
            }}>
              5 idle days
              <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 12px" }}>×</span>
              $80 / day
            </div>
            <div style={{
              fontSize: 28, fontWeight: 700, color: "white",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.5,
            }}>
              <span style={{ color: "rgba(255,255,255,0.3)", marginRight: 12 }}>×</span>
              52 weeks
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 13, fontWeight: 700, letterSpacing: 2,
              textTransform: "uppercase",
              color: "#EF4444",
              fontFamily: "system-ui, sans-serif",
              marginBottom: 6,
            }}>= gone</div>
            <div style={{
              fontSize: 68, fontWeight: 900, color: "#EF4444",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -3,
            }}>$20,800</div>
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════
   SCENE 2 — MATH RECEIPT
   Slow. Each line appears and HOLDS before the next.
   Viewer reads each step. $12,480 lands hard.
══════════════════════════════════════════════════════════ */
const SceneMath: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT   = eo3(cl(frame / 10, 0, 1));
  const tagT  = eo3(cl((frame - 6)  / 14, 0, 1));

  /* Each line staggered with generous hold time */
  const a = (start: number, dur = 18) => eo4(cl((frame - start) / dur, 0, 1));

  const l0T  = a(16);       // "1 idle chair in your salon"      → holds until ~f55
  const l1T  = a(52);       // "× 3 empty days / week @ $80"    → holds until ~f96
  const box1T = a(76, 20);  // "= −$240 per week"               → holds until ~f130
  const sepT  = eo3(cl((frame - 110) / 16, 0, 1));
  const l2T  = a(120);      // "× 52 weeks"                      → holds until ~f158
  const numS  = snap(cl((frame - 150) / 28, 0, 1));
  const numA  = eo5(cl((frame - 150) / 24, 0, 1));
  const noteT = eo3(cl((frame - 176) / 18, 0, 1));

  return (
    <AbsoluteFill style={{
      background: C.text,
      opacity: bgT,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      padding: "80px 64px",
    }}>

      {/* Radial glow bottom-left */}
      <div style={{
        position: "absolute", bottom: -300, left: -200,
        width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(37,99,235,0.09), transparent 65%)`,
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Tag */}
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: "uppercase", color: C.body,
          fontFamily: "system-ui, sans-serif", marginBottom: 60,
          opacity: tagT,
        }}>
          The real calculation
        </div>

        {/* Line 0 — 1 idle chair */}
        <div style={{
          opacity: l0T,
          transform: `translateX(${(1 - l0T) * -28}px)`,
          marginBottom: 36,
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{
            fontSize: 18, fontWeight: 800, color: C.body,
            fontFamily: "system-ui, sans-serif",
            width: 36, textAlign: "center",
          }}>1</div>
          <div style={{
            fontSize: 52, fontWeight: 800, color: "white",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -1,
          }}>idle chair in your salon</div>
        </div>

        {/* Line 1 — × 3 days */}
        <div style={{
          opacity: l1T,
          transform: `translateX(${(1 - l1T) * -28}px)`,
          marginBottom: 24,
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{
            fontSize: 36, fontWeight: 900, color: C.primary,
            fontFamily: "system-ui, sans-serif",
            width: 36, textAlign: "center",
          }}>×</div>
          <div>
            <span style={{
              fontSize: 52, fontWeight: 800, color: "white",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: -1,
            }}>3 empty days </span>
            <span style={{
              fontSize: 28, fontWeight: 600, color: C.body,
              fontFamily: "system-ui, sans-serif",
            }}>/ week</span>
          </div>
        </div>

        {/* Sub — @ $80/day */}
        <div style={{
          opacity: l1T,
          marginBottom: 28, marginLeft: 56,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{
            width: 4, height: 4, borderRadius: "50%",
            background: C.body, opacity: 0.5,
          }} />
          <div style={{
            fontSize: 24, fontWeight: 600, color: C.body,
            fontFamily: "system-ui, sans-serif",
          }}>@ $80 per booking / per day</div>
        </div>

        {/* Result box 1 — $240/week */}
        <div style={{
          opacity: box1T,
          transform: `translateY(${(1 - box1T) * 16}px)`,
          marginBottom: 52,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 16,
          padding: "22px 28px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{
            fontSize: 22, fontWeight: 600, color: "#FCA5A5",
            fontFamily: "system-ui, sans-serif",
          }}>per week not earned</div>
          <div style={{
            fontSize: 52, fontWeight: 900, color: "#EF4444",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -2,
          }}>−$240</div>
        </div>

        {/* Separator */}
        <div style={{
          width: `${sepT * 100}%`, height: 1,
          background: "rgba(255,255,255,0.08)", marginBottom: 48,
        }} />

        {/* Line 2 — × 52 weeks */}
        <div style={{
          opacity: l2T,
          transform: `translateX(${(1 - l2T) * -28}px)`,
          marginBottom: 32,
          display: "flex", alignItems: "center", gap: 20,
        }}>
          <div style={{
            fontSize: 36, fontWeight: 900, color: C.primary,
            fontFamily: "system-ui, sans-serif",
            width: 36, textAlign: "center",
          }}>×</div>
          <div style={{
            fontSize: 52, fontWeight: 800, color: "white",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -1,
          }}>52 weeks</div>
        </div>

        {/* THE TOTAL — $12,480 */}
        <div style={{
          opacity: numA,
          transform: `scale(${0.72 + numS * 0.28})`,
          transformOrigin: "left center",
          marginBottom: 40,
          display: "flex", alignItems: "baseline", gap: 14,
        }}>
          <div style={{
            fontSize: 24, fontWeight: 700, color: C.body,
            fontFamily: "system-ui, sans-serif",
          }}>=</div>
          <div style={{
            fontSize: 148, fontWeight: 900, lineHeight: 0.88,
            color: "#EF4444",
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -7,
          }}>$12,480</div>
        </div>

        {/* Footnote box */}
        <div style={{
          opacity: noteT,
          transform: `translateY(${(1 - noteT) * 12}px)`,
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: 14,
          padding: "22px 28px",
        }}>
          <div style={{
            fontSize: 24, fontWeight: 600, color: "#FCA5A5",
            fontFamily: "system-ui, sans-serif",
            fontStyle: "italic", lineHeight: 1.45,
          }}>
            One chair. Three quiet days a week.
            <br />
            Doing nothing. Every year.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════
   BOOKING CARD — Scene 3 helper
══════════════════════════════════════════════════════════ */
interface Booking { name: string; service: string; time: string; amount: number }

const BookingCard: React.FC<{ booking: Booking; appearFrame: number }> = ({ booking, appearFrame }) => {
  const frame = useCurrentFrame();
  const t = snap(cl((frame - appearFrame) / 24, 0, 1));
  const a = eo4(cl((frame - appearFrame) / 20, 0, 1));

  return (
    <div style={{
      transform: `translateY(${(1 - t) * 56}px) scale(${0.93 + t * 0.07})`,
      opacity: a,
      position: "relative",
      width: "100%",
      background: "white",
      borderRadius: 22,
      border: `1.5px solid ${C.border}`,
      overflow: "hidden",
      boxShadow: `0 10px 36px rgba(37,99,235,0.11), 0 2px 8px rgba(11,23,48,0.05)`,
      padding: "32px 36px 32px 50px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      minHeight: 190,
    }}>
      {/* Blue left border */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 7,
        background: C.primary,
      }} />

      <div>
        {/* Confirmed tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: `${C.primary}12`, borderRadius: 7,
          padding: "5px 12px", marginBottom: 14,
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981" }} />
          <span style={{
            fontSize: 12, fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase", color: C.primary,
            fontFamily: "system-ui, sans-serif",
          }}>Confirmed · Shared Salon</span>
        </div>

        <div style={{
          fontSize: 42, fontWeight: 800, color: C.text,
          fontFamily: "system-ui, sans-serif", marginBottom: 10,
          letterSpacing: -1,
        }}>{booking.name}</div>

        <div style={{
          fontSize: 22, color: C.body,
          fontFamily: "system-ui, sans-serif",
        }}>{booking.service} · {booking.time}</div>
      </div>

      <div style={{
        fontSize: 80, fontWeight: 900, color: C.primary,
        fontFamily: "system-ui, sans-serif",
        letterSpacing: -3,
      }}>
        ${booking.amount}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SCENE 3 — THE FLIP
   Full screen. 3 cards + massive revenue counter + monthly/annual.
══════════════════════════════════════════════════════════ */
const BOOKINGS: Booking[] = [
  { name: "Sarah M.",  service: "Cut & Style",     time: "10:00 AM", amount: 85  },
  { name: "Jake R.",   service: "Men's Cut",        time: "9:30 AM",  amount: 75  },
  { name: "Emma L.",   service: "Colour Treatment", time: "1:00 PM",  amount: 90  },
];
const CARD_FRAMES = [10, 46, 82];

const SceneFlip: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT    = eo3(cl(frame / 10, 0, 1));
  const labelT = eo3(cl((frame - 4) / 14, 0, 1));

  /* Revenue counter climbs with each card */
  const revenue = Math.round(
    interpolate(frame, [28, 62, 98], [0, 85, 160], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    }) + (frame >= 98 ? eo3(cl((frame - 98) / 22, 0, 1)) * 90 : 0),
  );

  const counterT  = eo3(cl((frame - 10) / 20, 0, 1));
  const monthlyT  = eo4(cl((frame - 118) / 22, 0, 1));
  const annualT   = eo3(cl((frame - 138) / 18, 0, 1));
  const taglineT  = eo3(cl((frame - 155) / 16, 0, 1));

  return (
    <AbsoluteFill style={{
      background: C.bg,
      opacity: bgT,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, ${C.border}65 1px, transparent 1px)`,
        backgroundSize: "52px 52px", opacity: 0.4,
        pointerEvents: "none",
      }} />

      {/* ── TOP: label + cards — flex:1 fills remaining space ── */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "68px 64px 24px",
        position: "relative",
        zIndex: 1,
      }}>
        {/* Label */}
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 2.5,
          textTransform: "uppercase", color: C.primary,
          fontFamily: "system-ui, sans-serif",
          marginBottom: 28,
          opacity: labelT,
        }}>
          Those 3 days · now filled via Shared Salon
        </div>

        {/* Cards evenly fill remaining space */}
        <div style={{
          flex: 1,
          display: "flex", flexDirection: "column",
          justifyContent: "space-evenly",
        }}>
          {BOOKINGS.map((b, i) => (
            <BookingCard key={i} booking={b} appearFrame={CARD_FRAMES[i]} />
          ))}
        </div>
      </div>

      {/* ── BOTTOM: revenue panel — sits flush, no gap ── */}
      <div style={{
        background: C.text,
        padding: "44px 64px 64px",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
        opacity: counterT,
      }}>
        {/* Label */}
        <div style={{
          fontSize: 12, fontWeight: 700, letterSpacing: 3,
          textTransform: "uppercase", color: "rgba(255,255,255,0.35)",
          fontFamily: "system-ui, sans-serif",
          marginBottom: 6,
        }}>
          Earned this week
        </div>

        {/* Counter */}
        <div style={{
          fontSize: 148, fontWeight: 900, lineHeight: 0.88,
          color: revenue > 0 ? "#10B981" : "rgba(255,255,255,0.15)",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -7,
          marginBottom: 28,
        }}>
          ${revenue}
        </div>

        {/* Monthly + Annual row */}
        <div style={{
          display: "flex", gap: 0,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 20,
          marginBottom: 20,
        }}>
          <div style={{
            flex: 1,
            opacity: monthlyT,
            transform: `translateY(${(1 - monthlyT) * 10}px)`,
          }}>
            <div style={{
              fontSize: 13, color: "rgba(255,255,255,0.35)",
              fontFamily: "system-ui, sans-serif", marginBottom: 4,
            }}>Monthly</div>
            <div style={{
              fontSize: 38, fontWeight: 800, color: "white",
              fontFamily: "system-ui, sans-serif", letterSpacing: -1,
            }}>$1,000</div>
          </div>
          <div style={{
            width: 1, background: "rgba(255,255,255,0.08)", margin: "0 24px",
          }} />
          <div style={{
            flex: 1,
            opacity: annualT,
            transform: `translateY(${(1 - annualT) * 10}px)`,
          }}>
            <div style={{
              fontSize: 13, color: "rgba(255,255,255,0.35)",
              fontFamily: "system-ui, sans-serif", marginBottom: 4,
            }}>Annual</div>
            <div style={{
              fontSize: 38, fontWeight: 800, color: "#10B981",
              fontFamily: "system-ui, sans-serif", letterSpacing: -1,
            }}>$13,000</div>
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: taglineT,
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.2)",
          borderRadius: 12,
          padding: "12px 20px",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
          <div style={{
            fontSize: 17, fontWeight: 700, color: "#6EE7B7",
            fontFamily: "system-ui, sans-serif",
          }}>
            Same chair. Completely different outcome.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════
   SCENE 4 — CTA
   Premium full-bleed blue. Bold. Conversion-ready.
   Inspired by the desktop ad's close.
══════════════════════════════════════════════════════════ */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const bgT   = eo3(cl(frame / 12, 0, 1));
  const eyeT  = eo3(cl((frame - 6)  / 14, 0, 1));
  const h1T   = eo4(cl((frame - 10) / 20, 0, 1));
  const h2T   = eo4(cl((frame - 20) / 20, 0, 1));
  const lineT = eo3(cl((frame - 32) / 16, 0, 1));
  const subT  = eo3(cl((frame - 40) / 16, 0, 1));
  const btnS  = snap(cl((frame - 50) / 22, 0, 1));
  const btnA  = eo4(cl((frame - 50) / 18, 0, 1));
  const urlT  = eo3(cl((frame - 66) / 14, 0, 1));
  const glowP = 0.6 + Math.sin(frame * 0.08) * 0.4;

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(160deg, ${C.primary} 0%, ${C.dark} 100%)`,
      opacity: bgT,
      overflow: "hidden",
    }}>

      {/* Dot grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)`,
        backgroundSize: "56px 56px",
      }} />

      {/* Pulsing center glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1100, height: 1100, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(255,255,255,${0.06 * glowP}), transparent 65%)`,
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "absolute",
        top: "50%", left: 64, right: 64,
        transform: "translateY(-50%)",
      }}>

        {/* Eyebrow */}
        <div style={{
          fontSize: 14, fontWeight: 700, letterSpacing: 4,
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.45)",
          fontFamily: "system-ui, sans-serif",
          marginBottom: 24,
          opacity: eyeT,
        }}>
          Beta access · Now open
        </div>

        {/* JOIN */}
        <div style={{
          fontSize: 168, fontWeight: 900, color: "white",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -8, lineHeight: 0.88,
          textTransform: "uppercase",
          opacity: h1T, transform: `translateY(${(1 - h1T) * 44}px)`,
        }}>
          JOIN
        </div>

        {/* SHARED SALON. */}
        <div style={{
          fontSize: 110, fontWeight: 900, color: "white",
          fontFamily: "system-ui, sans-serif",
          letterSpacing: -5, lineHeight: 0.88,
          textTransform: "uppercase",
          opacity: h2T, transform: `translateY(${(1 - h2T) * 44}px)`,
          marginBottom: 36,
        }}>
          SHARED SALON.
        </div>

        {/* Gold accent line */}
        <div style={{
          width: `${lineT * 300}px`, height: 4,
          background: C.accent, borderRadius: 2,
          marginBottom: 32,
        }} />

        {/* Sub copy */}
        <div style={{
          fontSize: 28, color: "rgba(255,255,255,0.55)",
          fontFamily: "system-ui, sans-serif",
          lineHeight: 1.6, marginBottom: 52,
          opacity: subT,
        }}>
          List your chairs for free.
          <br />
          Start earning from idle space.
        </div>

        {/* Button */}
        <div style={{
          background: "white",
          borderRadius: 20,
          padding: "32px 0",
          textAlign: "center",
          transform: `scale(${0.8 + btnS * 0.2})`,
          opacity: btnA,
          transformOrigin: "center center",
          marginBottom: 28,
          boxShadow: `0 16px 48px rgba(0,0,0,0.24)`,
        }}>
          <div style={{
            fontSize: 32, fontWeight: 800, color: C.primary,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -0.5,
          }}>
            Join the Beta →
          </div>
        </div>

        {/* URL */}
        <div style={{
          textAlign: "center",
          fontSize: 18, color: "rgba(255,255,255,0.35)",
          fontFamily: "monospace",
          letterSpacing: 1,
          opacity: urlT,
        }}>
          sharedsalon.com.au
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ═══════════════════════════════════════════════════════════
   ROOT COMPOSITION  — ~20 seconds
══════════════════════════════════════════════════════════ */
export const SharedSalonMathAd: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    <Sequence from={0}   durationInFrames={140}><SceneHook /></Sequence>
    <Sequence from={140} durationInFrames={200}><SceneMath /></Sequence>
    <Sequence from={340} durationInFrames={180}><SceneFlip /></Sequence>
    <Sequence from={520} durationInFrames={90}> <SceneCTA  /></Sequence>
  </AbsoluteFill>
);
