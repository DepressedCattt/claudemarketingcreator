/**
 * Distorting Typography — Spline GLB showcase
 *
 * Uses the Spline-exported GLB ("distorting_typography.glb") loaded into
 * React Three Fiber via GlbModelScene.  The vertex distortion animation
 * that Spline's GLB exporter can't carry is re-applied in-engine via a
 * custom ShaderMaterial driven frame-perfectly by useCurrentFrame.
 *
 * All .glb files should live in public/models/ so Remotion can serve them.
 */

import { AdConfig, GlbModelSceneProps, KineticTextProps } from "../../data/types";

const GLB = "/models/distorting_typography.glb";

export const distortingTypographyAd: AdConfig = {
  id: "distorting-typography",
  name: "✦ Distorting Typography — Spline GLB",
  template: "dark-cinematic",
  aspectRatio: "9:16",

  brand: {
    name: "VOID",
    tagline: "Beyond form.",
    colors: {
      primary:       "#a855f7",
      secondary:     "#1e1b4b",
      accent:        "#e879f9",
      background:    "#050507",
      text:          "#f5f3ff",
      textSecondary: "#a78bfa",
    },
    typography: {
      preset: "luxury",
      headlineFont: "Georgia, 'Times New Roman', serif",
    },
  },

  media: {},

  content: {
    headline: "Beyond form.",
    subheadline: "Language in flux.",
    targetAudience: "Design / art direction",
    painPoints: [],
    valueProp: "VOID — where typography meets motion.",
    features: [],
    testimonials: [],
    stats: [],
    cta: {
      primary: "Explore the work",
      secondary: "void.studio",
      url: "void.studio",
    },
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. Distorting — original Spline mesh colours, full warp ────────
      {
        type: "glb-model",
        durationInSeconds: 5,
        transition: "fade",
        props: {
          src: GLB,
          animationMode: "distort",
          scale: 1.0,
          distortStrength: 0.18,
          distortFrequency: 1.4,
          distortSpeed: 0.5,
          showBackground: false,
          headline: "Language in flux.",
          headlinePosition: "bottom",
        } satisfies GlbModelSceneProps,
      },

      // ── 2. Kinetic statement ────────────────────────────────────────────
      {
        type: "kinetic-text",
        durationInSeconds: 3,
        transition: "blur-in",
        props: {
          lines: ["Type.", "Distorted.", "Alive."],
          style: "slam",
          fontSize: 96,
          lineDelay: 22,
          highlightLines: [1],
          highlightColor: "#e879f9",
        } satisfies KineticTextProps,
      },

      // ── 3. Gentle float — low distortion, readable ─────────────────────
      {
        type: "glb-model",
        durationInSeconds: 5,
        transition: "scale-in",
        props: {
          src: GLB,
          animationMode: "float",
          scale: 1.05,
          showBackground: false,
          headline: "VOID Studio",
          subtext: "Motion-first design. void.studio",
          headlinePosition: "bottom",
        } satisfies GlbModelSceneProps,
      },

      // ── 4. High distortion — dramatic, glitchy ──────────────────────────
      {
        type: "glb-model",
        durationInSeconds: 4,
        transition: "rotate-in",
        props: {
          src: GLB,
          animationMode: "distort",
          scale: 1.1,
          distortStrength: 0.35,
          distortFrequency: 2.0,
          distortSpeed: 0.9,
          colorOverride: "#a855f7",
          showBackground: false,
          headline: "Explore the work.",
          headlinePosition: "bottom",
        } satisfies GlbModelSceneProps,
      },

      // ── 5. Slow rotation — let viewers read the form ────────────────────
      {
        type: "glb-model",
        durationInSeconds: 4,
        transition: "zoom-out",
        props: {
          src: GLB,
          animationMode: "rotate",
          scale: 0.95,
          rotationSpeed: 0.4,
          showBackground: false,
          subtext: "void.studio · Free bespoke consultation",
          headlinePosition: "bottom",
        } satisfies GlbModelSceneProps,
      },

      // ── 6. End card ─────────────────────────────────────────────────────
      {
        type: "logo-end-card",
        durationInSeconds: 2.5,
        transition: "fade",
      },
    ],
  },
};
