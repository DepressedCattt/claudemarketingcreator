/**
 * ChartScene
 *
 * Animated data visualisation — bar chart or line chart.
 * Bars grow up from 0. Line charts draw themselves left to right.
 * Each element staggers in with eased cubic motion.
 *
 * Required sceneProps (ChartSceneProps):
 *   type        — "bar" | "line"
 *   data        — array of { label, value, color? }
 *   headline    — optional headline above the chart
 *   unit        — units label e.g. "£", "%"
 *   maxValue    — override y-axis max
 *   enterDelay  — frames between each bar entering
 */

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Easing } from "remotion";
import { AdConfig, ChartSceneProps } from "../data/types";
import { GlassCard } from "../components/GlassCard";
import { FilmGrain } from "../components/FilmGrain";
import { useFadeIn, useFadeOut } from "../utils/animation";
import { getTypography } from "../utils/typography";

interface Props {
  config: AdConfig;
  durationFrames: number;
  sceneProps?: Record<string, unknown>;
}

export const ChartScene: React.FC<Props> = ({ config, durationFrames, sceneProps }) => {
  const { brand } = config;
  const frame = useCurrentFrame();
  const typo = getTypography(brand.typography.preset);

  const props = (sceneProps ?? {}) as unknown as ChartSceneProps;
  const type       = props.type       ?? "bar";
  const data       = props.data       ?? [];
  const headline   = props.headline;
  const unit       = props.unit       ?? "";
  const enterDelay = props.enterDelay ?? 10;
  const maxValue   = props.maxValue   ?? Math.max(...data.map(d => d.value)) * 1.15;

  const sceneOpacity = useFadeOut(durationFrames, 10);
  const headlineOpacity = useFadeIn(4, 14);

  // Colour palette cycling
  const defaultColors = [
    brand.colors.accent,
    brand.colors.primary,
    brand.colors.secondary,
    brand.colors.textSecondary,
  ];

  const CHART_HEIGHT = 520;
  const CHART_WIDTH  = 860;
  const BAR_GAP      = 16;
  const barWidth = (CHART_WIDTH - BAR_GAP * (data.length + 1)) / data.length;

  return (
    <AbsoluteFill style={{ opacity: sceneOpacity }}>
      <AbsoluteFill style={{ background: brand.colors.background }} />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 100%, ${brand.colors.primary}20 0%, transparent 55%)`,
        }}
      />
      <FilmGrain opacity={0.04} />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "72px 60px",
          gap: 36,
        }}
      >
        {headline && (
          <div
            style={{
              opacity: headlineOpacity,
              fontFamily: brand.typography.headlineFont || typo.headlineFont,
              fontSize: typo.subheadline,
              fontWeight: typo.headlineWeight,
              color: brand.colors.text,
              textAlign: "center",
              letterSpacing: typo.headlineLetterSpacing,
              lineHeight: 1.15,
            }}
          >
            {headline}
          </div>
        )}

        <GlassCard
          tint={brand.colors.primary}
          tintOpacity={0.06}
          blur={16}
          borderRadius={28}
          padding={40}
          style={{ width: "100%" }}
        >
          {type === "bar" ? (
            <BarChart
              data={data}
              maxValue={maxValue}
              unit={unit}
              chartHeight={CHART_HEIGHT}
              chartWidth={CHART_WIDTH}
              barWidth={barWidth}
              barGap={BAR_GAP}
              enterDelay={enterDelay}
              colors={defaultColors}
              frame={frame}
              brand={brand}
              typo={typo}
            />
          ) : (
            <LineChart
              data={data}
              maxValue={maxValue}
              unit={unit}
              chartHeight={CHART_HEIGHT}
              chartWidth={CHART_WIDTH}
              enterDelay={enterDelay}
              colors={defaultColors}
              frame={frame}
              brand={brand}
              typo={typo}
            />
          )}
        </GlassCard>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Shared point type ───────────────────────────────────────────────────────

interface ChartPoint {
  x: number;
  y: number;
  value: number;
  label: string;
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

const BarChart: React.FC<any> = ({
  data, maxValue, unit, chartHeight, chartWidth, barWidth, barGap, enterDelay, colors, frame, brand, typo,
}) => {
  return (
    <div style={{ position: "relative", width: chartWidth, height: chartHeight + 80 }}>
      {/* Y-axis grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
        <div
          key={pct}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 60 + pct * chartHeight,
            height: 1,
            background: `${brand.colors.text}10`,
          }}
        />
      ))}

      {/* Bars */}
      {data.map((d: any, i: number) => {
        const startFrame = 8 + i * enterDelay;
        const progress = interpolate(frame, [startFrame, startFrame + 30], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.out(Easing.cubic),
        });
        const barH = (d.value / maxValue) * chartHeight * progress;
        const x = barGap + i * (barWidth + barGap);
        const color = d.color || colors[i % colors.length];

        const valueOpacity = interpolate(frame, [startFrame + 24, startFrame + 36], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <React.Fragment key={i}>
            {/* Bar */}
            <div
              style={{
                position: "absolute",
                left: x,
                bottom: 60,
                width: barWidth,
                height: barH,
                background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
                borderRadius: "8px 8px 0 0",
                boxShadow: `0 0 20px ${color}40`,
              }}
            />
            {/* Value label above bar */}
            <div
              style={{
                position: "absolute",
                left: x,
                bottom: 60 + barH + 8,
                width: barWidth,
                textAlign: "center",
                fontFamily: typo.headlineFont,
                fontSize: 24,
                fontWeight: 700,
                color: color,
                opacity: valueOpacity,
              }}
            >
              {unit}{typeof d.value === "number" && d.value >= 1000
                ? d.value.toLocaleString()
                : d.value}
            </div>
            {/* X label */}
            <div
              style={{
                position: "absolute",
                left: x,
                bottom: 8,
                width: barWidth,
                textAlign: "center",
                fontFamily: typo.bodyFont,
                fontSize: 20,
                fontWeight: 500,
                color: brand.colors.textSecondary,
              }}
            >
              {d.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Line Chart ───────────────────────────────────────────────────────────────

const LineChart: React.FC<any> = ({
  data, maxValue, unit, chartHeight, chartWidth, enterDelay, colors, frame, brand, typo,
}) => {
  if (data.length < 2) return null;

  const totalFrames = 8 + (data.length - 1) * enterDelay + 30;
  const drawProgress = interpolate(frame, [8, totalFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const PAD = 40;
  const W = chartWidth - PAD * 2;
  const H = chartHeight;

  const points: ChartPoint[] = data.map((d: any, i: number) => ({
    x: PAD + (i / (data.length - 1)) * W,
    y: H - (d.value / maxValue) * (H - PAD) - PAD / 2,
    value: d.value,
    label: d.label,
  }));

  // Build SVG polyline up to drawProgress
  const visibleCount = Math.max(2, Math.ceil(drawProgress * (points.length - 1)) + 1);
  const visiblePoints: ChartPoint[] = points.slice(0, visibleCount);
  const lastFraction  = (drawProgress * (points.length - 1)) % 1;
  const lastIdx = visibleCount - 1;

  // Interpolate last point
  if (lastIdx < points.length - 1 && lastFraction > 0) {
    const from = points[lastIdx - 1] || points[0];
    const to   = points[lastIdx];
    visiblePoints[lastIdx] = {
      x: from.x + (to.x - from.x) * lastFraction,
      y: from.y + (to.y - from.y) * lastFraction,
      value: to.value,
      label: to.label,
    };
  }

  const polylinePoints = visiblePoints.map((p: ChartPoint) => `${p.x},${p.y}`).join(" ");
  const color = colors[0];

  return (
    <div style={{ position: "relative", width: chartWidth, height: chartHeight + 60 }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <div
          key={pct}
          style={{
            position: "absolute",
            left: PAD,
            right: PAD,
            top: H * (1 - pct),
            height: 1,
            background: `${brand.colors.text}10`,
          }}
        />
      ))}

      <svg
        width={chartWidth}
        height={chartHeight + 60}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        {/* Area fill */}
        <defs>
          <linearGradient id="line-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polyline
          points={`${visiblePoints[0].x},${H} ${polylinePoints} ${visiblePoints[visiblePoints.length - 1].x},${H}`}
          fill="url(#line-fill)"
          stroke="none"
        />
        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
        {/* Dots */}
        {visiblePoints.map((p: ChartPoint, i: number) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={7}
            fill={color}
            stroke={brand.colors.background}
            strokeWidth={3}
            style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          />
        ))}
      </svg>

      {/* X labels */}
      {data.map((d: any, i: number) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: points[i].x - 50,
            top: H + 16,
            width: 100,
            textAlign: "center",
            fontFamily: typo.bodyFont,
            fontSize: 20,
            color: brand.colors.textSecondary,
          }}
        >
          {d.label}
        </div>
      ))}
    </div>
  );
};
