/**
 * TrailBlaze — "Run Further. Run Smarter."
 *
 * Running/fitness app, 16:9 landscape (1920×1080)
 * Energy: High-velocity, athletic, data-rich
 * Palette: Dark forest, electric orange, fresh green, crisp white
 * Motion: GPS route drawing, heart rate wave, stat counters, speed lines
 * Typography: Heavy bold sans, all-caps power words
 *
 * Scene layout (30 fps, 450 total = 15s):
 *   Scene 1   0–90f   (3.0s) ROUTE    — GPS line draws across screen; headline punches in
 *   Scene 2  90–255f  (5.5s) METRICS  — Live running dashboard: HR wave + stat counters
 *   Scene 3 255–375f  (4.0s) KINETIC  — "Miles Logged." / "Limits Broken." / "TrailBlaze."
 *   Scene 4 375–450f  (2.5s) CTA      — "Join 500K runners" end card
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
  bg: "#080F0A",
  surface: "#0D1A10",
  card: "#111F15",
  orange: "#FF6B35",
  green: "#3DBA6F",
  text: "#F5FFF7",
  body: "#7A9E82",
  border: "#1A3020",
  dim: "#2C4A35",
  yellow: "#F6C90E",
};

/* ─── EASING ─── */
const easeOut3 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);
const easeOut4 = (t: number) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 4);

/* ─── SPEED LINES ─── */
const SpeedLines: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const frame = useCurrentFrame();

  const LINES = [
    { y: 120,  length: 280, delay: 0 },
    { y: 280,  length: 380, delay: 4 },
    { y: 440,  length: 220, delay: 8 },
    { y: 600,  length: 340, delay: 2 },
    { y: 760,  length: 260, delay: 6 },
    { y: 900,  length: 420, delay: 10 },
  ];

  return (
    <>
      {LINES.map((line, i) => {
        const phase = ((frame + line.delay * 3) % 22) / 22;
        const opacity = Math.sin(phase * Math.PI) * 0.2 * intensity;
        const x = 1920 - (phase * (line.length + 300));

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: line.y,
              width: line.length,
              height: 2,
              background: `linear-gradient(90deg, transparent, ${C.orange}60, transparent)`,
              opacity,
              borderRadius: 1,
            }}
          />
        );
      })}
    </>
  );
};

/* ─── GPS ROUTE LINE ─── */
const GPSRoute: React.FC<{ progress: number }> = ({ progress }) => {
  // A path that looks like a running route across the landscape
  const path = "M 60,540 C 160,480 280,420 400,460 C 520,500 600,380 720,340 C 840,300 940,360 1060,320 C 1180,280 1300,240 1440,280 C 1560,320 1640,400 1760,360 C 1820,340 1870,320 1900,310";

  return (
    <svg
      viewBox="0 0 1920 1080"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      {/* Background glow trail */}
      <path
        d={path}
        fill="none"
        stroke={`${C.orange}20`}
        strokeWidth={12}
        strokeLinecap="round"
      />
      {/* Active route */}
      <path
        d={path}
        fill="none"
        stroke={C.orange}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray="2200"
        strokeDashoffset={2200 - 2200 * progress}
      />
      {/* Pulse dot at front of route */}
      {progress > 0.02 && (
        <>
          <circle r={10} fill={C.orange} opacity={0.6}>
            <animateMotion dur="0s" fill="freeze">
              <mpath href="#routePath" />
            </animateMotion>
          </circle>
        </>
      )}
    </svg>
  );
};

/* ─── HEART RATE WAVE ─── */
const HeartRateWave: React.FC<{ startFrame: number; width?: number; height?: number }> = ({
  startFrame,
  width = 480,
  height = 100,
}) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const points: string[] = [];

  for (let x = 0; x <= width; x += 3) {
    const t = x / width;
    const base = Math.sin(t * Math.PI * 8 + localFrame * 0.3) * (height * 0.2);
    const spike = Math.exp(-Math.pow(((t * 8 + localFrame * 0.1) % 1) - 0.5, 2) * 30) * (height * 0.45);
    const y = height / 2 - base - spike;
    points.push(`${x},${Math.max(8, Math.min(height - 8, y))}`);
  }

  const revealWidth = Math.min(localFrame / 30, 1) * width;

  return (
    <div style={{ position: "relative", width, height, overflow: "hidden" }}>
      <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={`${C.green}40`}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke={C.green}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={width * 2}
          strokeDashoffset={width * 2 - revealWidth * 2}
        />
      </svg>
    </div>
  );
};

/* ─── STAT COUNTER ─── */
const StatCounter: React.FC<{
  startFrame: number;
  endValue: number;
  unit: string;
  label: string;
  color: string;
  decimals?: number;
}> = ({ startFrame, endValue, unit, label, color, decimals = 0 }) => {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  const t = easeOut4(Math.max(0, Math.min(localFrame / 50, 1)));
  const value = endValue * t;
  const displayValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

  const opacity = interpolate(t, [0, 0.15], [0, 1], { extrapolateRight: "clamp" });
  const scaleY = 0.8 + t * 0.2;

  return (
    <div style={{ opacity, transform: `scaleY(${scaleY})`, transformOrigin: "bottom" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
        <span style={{ fontSize: 72, fontWeight: 900, color, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1 }}>
          {displayValue}
        </span>
        <span style={{ fontSize: 36, fontWeight: 700, color, fontFamily: "system-ui, sans-serif", marginBottom: 8 }}>
          {unit}
        </span>
      </div>
      <div style={{ fontSize: 18, color: C.body, fontFamily: "system-ui, sans-serif", fontWeight: 500, marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
};

/* ─── SCENE 1: ROUTE ─── */
const SceneRoute: React.FC = () => {
  const frame = useCurrentFrame();

  const routeProgress = easeOut3(Math.min(frame / 55, 1));
  const headlineT = easeOut4(Math.max(0, Math.min((frame - 30) / 22, 1)));
  const subT = easeOut3(Math.max(0, Math.min((frame - 52) / 18, 1)));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Subtle terrain texture gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${C.bg} 0%, #0A1A0D 50%, ${C.bg} 100%)`,
        }}
      />

      {/* GPS Route */}
      <GPSRoute progress={routeProgress} />

      <SpeedLines intensity={0.6} />

      {/* Headline — left side */}
      <div
        style={{
          position: "absolute",
          left: 100,
          top: "50%",
          transform: `translateY(-50%) translateX(${(1 - headlineT) * -80}px)`,
          opacity: headlineT,
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: C.text,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: -4,
            lineHeight: 0.95,
            textTransform: "uppercase",
          }}
        >
          RUN
          <br />
          <span style={{ color: C.orange }}>SMARTER.</span>
        </div>

        <div
          style={{
            marginTop: 24,
            fontSize: 26,
            color: C.body,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
            transform: `translateY(${(1 - subT) * 20}px)`,
            opacity: subT,
          }}
        >
          Every mile tracked. Every PR celebrated.
        </div>
      </div>

      {/* Small "GPS active" badge */}
      {routeProgress > 0.3 && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 80,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: `${C.orange}18`,
            border: `1px solid ${C.orange}40`,
            borderRadius: 100,
            padding: "10px 22px",
            opacity: easeOut3(Math.min((routeProgress - 0.3) / 0.3, 1)),
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: C.orange,
              animation: "none",
              boxShadow: `0 0 8px ${C.orange}`,
            }}
          />
          <span style={{ fontSize: 18, fontWeight: 700, color: C.orange, fontFamily: "monospace" }}>
            GPS ACTIVE
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ─── SCENE 2: METRICS ─── */
const SceneMetrics: React.FC = () => {
  const frame = useCurrentFrame();

  const headerT = easeOut3(Math.min(frame / 15, 1));
  const distT   = easeOut4(Math.max(0, Math.min((frame - 4)  / 24, 1)));
  const paceT   = easeOut4(Math.max(0, Math.min((frame - 10) / 24, 1)));
  const hrT     = easeOut3(Math.max(0, Math.min((frame - 18) / 22, 1)));
  const calT    = easeOut4(Math.max(0, Math.min((frame - 28) / 22, 1)));
  const eleT    = easeOut4(Math.max(0, Math.min((frame - 36) / 22, 1)));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      {/* Subtle GPS route — very faint in background */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.08 }}>
        <GPSRoute progress={1} />
      </div>

      <SpeedLines intensity={0.35} />

      {/* Header bar */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 78,
          background: `${C.surface}F0`,
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center",
          padding: "0 60px", gap: 16,
          opacity: headerT,
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 900, color: C.orange, fontFamily: "system-ui, sans-serif", letterSpacing: -0.5 }}>
          TRAILBLAZE
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, background: `${C.green}18`, border: `1px solid ${C.green}40`, borderRadius: 100, padding: "8px 22px" }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
          <span style={{ fontSize: 16, fontWeight: 700, color: C.green, fontFamily: "monospace" }}>LIVE RUN</span>
        </div>
      </div>

      {/* ── TOP-LEFT: DISTANCE (hero stat) ── */}
      <div
        style={{
          position: "absolute",
          top: 108, left: 60,
          opacity: distT,
          transform: `translateX(${(1 - distT) * -60}px)`,
        }}
      >
        <div style={{ fontSize: 13, color: C.body, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 2 }}>
          DISTANCE
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, lineHeight: 1 }}>
          <span style={{ fontSize: 210, fontWeight: 900, color: C.orange, fontFamily: "system-ui, sans-serif", letterSpacing: -10, lineHeight: 1 }}>
            8.4
          </span>
          <span style={{ fontSize: 66, fontWeight: 700, color: C.orange, fontFamily: "system-ui, sans-serif", marginBottom: 22 }}>
            km
          </span>
        </div>
      </div>

      {/* ── TOP-RIGHT: PACE ── */}
      <div
        style={{
          position: "absolute",
          top: 108, right: 60,
          opacity: paceT,
          transform: `translateX(${(1 - paceT) * 60}px)`,
          textAlign: "right",
        }}
      >
        <div style={{ fontSize: 13, color: C.body, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 2 }}>
          PACE
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, justifyContent: "flex-end", lineHeight: 1 }}>
          <span style={{ fontSize: 210, fontWeight: 900, color: C.green, fontFamily: "system-ui, sans-serif", letterSpacing: -10, lineHeight: 1 }}>
            4:32
          </span>
          <span style={{ fontSize: 44, fontWeight: 700, color: C.green, fontFamily: "system-ui, sans-serif", marginBottom: 22 }}>
            /km
          </span>
        </div>
      </div>

      {/* ── BOTTOM BAND: HR wave + secondary stats ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: 310,
          background: `linear-gradient(0deg, ${C.surface} 0%, ${C.surface}F2 60%, transparent 100%)`,
          borderTop: `1px solid ${C.border}40`,
          display: "flex",
          alignItems: "center",
          padding: "0 60px",
          gap: 48,
          opacity: hrT,
          transform: `translateY(${(1 - hrT) * 40}px)`,
        }}
      >
        {/* HR */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontSize: 12, color: C.body, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
            HEART RATE
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 112, fontWeight: 900, color: C.orange, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>
              162
            </span>
            <span style={{ fontSize: 32, color: C.body, fontFamily: "system-ui, sans-serif" }}>bpm</span>
          </div>
          <div style={{ fontSize: 16, color: C.green, fontFamily: "system-ui, sans-serif", fontWeight: 700, marginTop: 2 }}>
            Zone 4 — Threshold
          </div>
        </div>

        {/* HR Wave — full remaining width */}
        <div style={{ flex: 1 }}>
          <HeartRateWave startFrame={18} width={900} height={140} />
        </div>

        {/* Calories + Elevation */}
        <div style={{ display: "flex", gap: 40, flexShrink: 0 }}>
          {[
            { label: "CALORIES", value: "412", unit: "kcal", color: C.yellow, t: calT },
            { label: "ELEVATION", value: "284", unit: "m",  color: C.body,   t: eleT },
          ].map((s) => (
            <div key={s.label} style={{ opacity: s.t, transform: `translateY(${(1-s.t)*24}px)` }}>
              <div style={{ fontSize: 12, color: C.body, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>
                {s.label}
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontSize: 80, fontWeight: 900, color: s.color, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>
                  {s.value}
                </span>
                <span style={{ fontSize: 28, color: C.body, fontFamily: "system-ui, sans-serif", marginBottom: 10 }}>
                  {s.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── SCENE 3: KINETIC ─── */
const SceneKinetic: React.FC = () => {
  const frame = useCurrentFrame();

  const lines = [
    { text: "MILES",    color: "rgba(255,255,255,0.3)",  delay: 0,  size: 140, italic: false },
    { text: "LOGGED.",  color: C.orange,                 delay: 10, size: 140, italic: false },
    { text: "LIMITS",   color: "rgba(255,255,255,0.3)",  delay: 30, size: 140, italic: false },
    { text: "BROKEN.",  color: C.green,                  delay: 40, size: 140, italic: false },
    { text: "TRAILBLAZE.", color: C.text,                delay: 62, size: 80,  italic: false },
  ];

  return (
    <AbsoluteFill style={{ background: "#040A06" }}>
      {/* Fast speed lines — very energetic */}
      <SpeedLines intensity={1.5} />

      {/* Orange glow */}
      <div
        style={{
          position: "absolute",
          left: -200,
          top: "50%",
          transform: "translateY(-50%)",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,107,53,0.08) 0%, transparent 70%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 80,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {lines.map((line, i) => {
          const t = easeOut4(Math.max(0, Math.min((frame - line.delay) / 16, 1)));
          return (
            <div key={i} style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: line.size,
                  fontWeight: 900,
                  fontFamily: "system-ui, sans-serif",
                  letterSpacing: i < 4 ? -4 : -2,
                  lineHeight: i < 4 ? 1 : 1.2,
                  color: line.color,
                  textTransform: "uppercase",
                  transform: `translateX(${(1 - t) * -120}px)`,
                  opacity: interpolate(t, [0, 0.2], [0, 1]),
                }}
              >
                {line.text}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ─── SCENE 4: CTA ─── */
const SceneCTA: React.FC = () => {
  const frame = useCurrentFrame();

  const leftT  = easeOut4(Math.min(frame / 20, 1));
  const cardT  = easeOut4(Math.max(0, Math.min((frame - 6)  / 22, 1)));
  const btnT   = easeOut3(Math.max(0, Math.min((frame - 24) / 16, 1)));
  const urlT   = easeOut3(Math.max(0, Math.min((frame - 40) / 14, 1)));

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <SpeedLines intensity={0.45} />

      {/* Dual glow — orange left, green right */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 22% 50%, rgba(255,107,53,0.10) 0%, transparent 50%)` }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 78% 50%, rgba(61,186,111,0.07) 0%, transparent 50%)` }} />

      {/* ── LEFT HALF: Big headline ── */}
      <div
        style={{
          position: "absolute",
          left: 72, right: "50%",
          top: "50%",
          transform: `translateY(-50%) translateX(${(1 - leftT) * -80}px)`,
          opacity: leftT,
          paddingRight: 40,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 800, color: C.orange, fontFamily: "system-ui, sans-serif", textTransform: "uppercase", letterSpacing: 4, marginBottom: 16 }}>
          Join the pack
        </div>

        <div style={{ fontSize: 180, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -8, lineHeight: 0.9, textTransform: "uppercase" }}>
          500K
        </div>
        <div style={{ fontSize: 80, fontWeight: 900, color: C.orange, fontFamily: "system-ui, sans-serif", letterSpacing: -3, textTransform: "uppercase" }}>
          RUNNERS
        </div>

        <div style={{ marginTop: 28, fontSize: 26, color: C.body, fontFamily: "system-ui, sans-serif", lineHeight: 1.5 }}>
          and counting.
          <br />
          Your next PR is waiting.
        </div>

        {/* GPS dot trail decoration */}
        <div style={{ marginTop: 36, display: "flex", gap: 10 }}>
          {[C.orange, C.green, C.yellow, C.orange, C.green].map((col, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: col, opacity: 0.7 }} />
          ))}
        </div>
      </div>

      {/* ── RIGHT HALF: CTA card ── */}
      <div
        style={{
          position: "absolute",
          left: "50%", right: 60,
          top: "50%",
          transform: `translateY(-50%) scale(${cardT})`,
          opacity: cardT,
          transformOrigin: "center left",
        }}
      >
        <div
          style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 32,
            padding: "56px 52px",
            textAlign: "center",
            boxShadow: `0 0 80px rgba(255,107,53,0.12), 0 4px 24px rgba(0,0,0,0.3)`,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 800, color: C.body, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 3, marginBottom: 16 }}>
            Free on iOS & Android
          </div>
          <div style={{ fontSize: 72, fontWeight: 900, color: C.text, fontFamily: "system-ui, sans-serif", letterSpacing: -2, lineHeight: 1, marginBottom: 40 }}>
            TrailBlaze
          </div>

          {/* Button */}
          <div style={{ transform: `scale(${btnT})`, opacity: btnT, transformOrigin: "center" }}>
            <div
              style={{
                background: `linear-gradient(135deg, ${C.orange} 0%, #E8571E 100%)`,
                borderRadius: 20,
                padding: "26px 0",
                fontSize: 30,
                fontWeight: 900,
                color: "white",
                fontFamily: "system-ui, sans-serif",
                letterSpacing: -0.5,
                boxShadow: `0 8px 32px rgba(255,107,53,0.45)`,
              }}
            >
              Download Free →
            </div>
          </div>

          <div style={{ marginTop: 24, fontSize: 18, color: C.dim, fontFamily: "monospace", opacity: urlT }}>
            trailblaze.app
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ─── ROOT ─── */
export const TrailBlazeAd: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Sequence from={0}   durationInFrames={90}><SceneRoute /></Sequence>
      <Sequence from={90}  durationInFrames={165}><SceneMetrics /></Sequence>
      <Sequence from={255} durationInFrames={120}><SceneKinetic /></Sequence>
      <Sequence from={375} durationInFrames={75}><SceneCTA /></Sequence>
    </AbsoluteFill>
  );
};
