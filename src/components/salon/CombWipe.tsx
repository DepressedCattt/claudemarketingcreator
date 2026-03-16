/**
 * CombWipe — Salon comb-inspired scene entrance transition.
 *
 * Evenly-spaced strips (teeth) slide away in alternating directions,
 * revealing the scene underneath — like a salon comb being drawn across
 * the frame. Even-indexed teeth slide right, odd-indexed teeth slide left.
 *
 * progress 0 → all strips cover the scene (solid overlay)
 * progress 1 → all strips fully retracted (scene fully visible)
 *
 * Mount this over your scene content, pass a progress value driven by
 * interpolate() or spring(). Remove it from the DOM when progress reaches 1
 * to avoid a zero-opacity invisible layer blocking interaction.
 */

import React from "react";
import { interpolate } from "remotion";

interface CombWipeProps {
  /** 0–1 — drives how far the comb teeth have retracted. */
  progress: number;
  /** Colour of the strips (should match the PREVIOUS scene's background). */
  stripColor?: string;
  /** Number of comb teeth / strips. More = finer, more detailed effect. */
  teethCount?: number;
}

export const CombWipe: React.FC<CombWipeProps> = ({
  progress,
  stripColor = "#FAF8F5",
  teethCount = 22,
}) => {
  if (progress >= 1) return null; // Fully revealed — remove overlay entirely

  const stripHeightPct = 100 / teethCount;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {Array.from({ length: teethCount }, (_, i) => {
        // Stagger each tooth: earlier teeth start moving sooner
        const stagger = (i / teethCount) * 0.45;
        const localProg = Math.max(0, Math.min(1, (progress - stagger) / 0.55));
        const easedProg = localProg < 0.5
          ? 2 * localProg * localProg
          : 1 - Math.pow(-2 * localProg + 2, 2) / 2; // ease-in-out quad

        // Alternating direction: even → slide right, odd → slide left
        const direction = i % 2 === 0 ? 1 : -1;
        const translateX = easedProg * direction * 105; // % of width, 5% overshoot

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${i * stripHeightPct}%`,
              left: 0,
              width: "100%",
              height: `${stripHeightPct + 0.3}%`, // tiny overlap prevents seams
              background: stripColor,
              transform: `translateX(${translateX}%)`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
};
