/**
 * DashboardShell — app chrome frame with top nav bar and content area.
 *
 * Renders a realistic SaaS dashboard container: a rounded top bar
 * with a brand name + nav items, and a large content area below.
 * Both the nav and content animate in via spring progress.
 *
 * All interior content is passed via `children` and rendered inside
 * the content area.
 */

import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

const DEFAULT_FONT = `"SF Pro Display", -apple-system, "Segoe UI", system-ui, sans-serif`;

interface Props {
  children: React.ReactNode;
  /** Spring progress 0→1 for the entrance animation. */
  progress: number;
  /** Brand name shown in the top-left of the nav bar. */
  brandName?: string;
  /** Navigation items rendered in the top bar. */
  navItems?: string[];
  /** Index of the active nav item (highlighted). */
  activeNavIndex?: number;
  /** Accent colour for brand name and active nav item. */
  accentColor?: string;
  /** Nav bar + content area background. */
  surfaceColor?: string;
  /** Outer background colour (visible as the "page" behind the shell). */
  bgColor?: string;
  /** Text colours. */
  textColor?: string;
  textDimColor?: string;
  fontFamily?: string;
  /** Inset from the edges of the viewport. */
  inset?: number;
  /** Height of the top nav bar in px. */
  navHeight?: number;
  springConfig?: { stiffness: number; damping: number; mass: number };
}

export const DashboardShell: React.FC<Props> = ({
  children,
  progress,
  brandName = "App",
  navItems = [],
  activeNavIndex = 0,
  accentColor = "#3B82F6",
  surfaceColor = "#1E293B",
  bgColor = "#0F172A",
  textColor = "#F8FAFC",
  textDimColor = "#64748B",
  fontFamily = DEFAULT_FONT,
  inset = 160,
  navHeight = 72,
  springConfig = { stiffness: 155, damping: 22, mass: 0.85 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const navP = spring({
    frame: Math.max(0, frame - 2),
    fps,
    config: springConfig,
  });
  const contentP = spring({
    frame: Math.max(0, frame - 4),
    fps,
    config: springConfig,
  });

  const np = navP * progress;
  const cp = contentP * progress;

  return (
    <>
      {/* Top nav bar */}
      <div
        style={{
          position: "absolute",
          left: inset,
          top: inset * 0.625,
          right: inset,
          height: navHeight,
          borderRadius: `18px 18px 0 0`,
          background: surfaceColor,
          border: `1px solid ${textDimColor}12`,
          borderBottom: "none",
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          gap: 24,
          opacity: np,
          transform: `translateY(${(1 - np) * -20}px)`,
        }}
      >
        <div
          style={{
            fontFamily,
            fontSize: 22,
            fontWeight: 700,
            color: accentColor,
            letterSpacing: -0.5,
          }}
        >
          {brandName}
        </div>
        {navItems.length > 0 && (
          <div
            style={{
              width: 1,
              height: 28,
              background: `${textDimColor}20`,
            }}
          />
        )}
        {navItems.map((item, i) => (
          <span
            key={i}
            style={{
              fontFamily,
              fontSize: 17,
              fontWeight: i === activeNavIndex ? 600 : 400,
              color: i === activeNavIndex ? accentColor : textDimColor,
            }}
          >
            {item}
          </span>
        ))}
      </div>

      {/* Content area */}
      <div
        style={{
          position: "absolute",
          left: inset,
          top: inset * 0.625 + navHeight,
          right: inset,
          bottom: inset * 0.625,
          borderRadius: "0 0 18px 18px",
          background: surfaceColor,
          border: `1px solid ${textDimColor}12`,
          borderTop: `1px solid ${textDimColor}08`,
          opacity: cp,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </>
  );
};
