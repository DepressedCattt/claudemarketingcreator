/**
 * ENGINE SHOWCASE AD
 *
 * Demonstrates every new capability added in this build:
 *   ✓ ParticleScene   — sparks opener, confetti closer
 *   ✓ ParallaxScene   — depth layers scrolling
 *   ✓ ChartScene      — animated bar chart
 *   ✓ Flip3DScene     — CSS 3D card flips
 *   ✓ DrawPathScene   — self-drawing SVG checkmarks
 *   ✓ CodeRevealScene — typewriter code block with syntax highlighting
 *   ✓ GradientText    — holographic animated text
 *   ✓ GlassCard       — frosted glass panels
 *   ✓ FilmGrain       — noise texture overlay
 *   ✓ CircleProgress  — animated ring progress
 *   ✓ Audio           — (commented out — drop an MP3 in /public/audio/)
 *
 * Scene transitions used: flash-in, blur-in, wipe-right, slide-up,
 *                          rotate-in, bounce-in, scale-in, fade
 */

import {
  AdConfig,
  ChartSceneProps,
  ParticleSceneProps,
  FlipCardSceneProps,
  DrawPathSceneProps,
  CodeRevealSceneProps,
  ParallaxSceneProps,
} from "../../data/types";

export const engineShowcaseAd: AdConfig = {
  id: "engine-showcase-v1",
  name: "⚡ Engine Showcase — All Features",
  template: "startup-explainer",
  aspectRatio: "9:16",

  brand: {
    name: "REMOTION ENGINE",
    tagline: "One config. Any ad. No limits.",
    colors: {
      primary:       "#7C3AED",
      secondary:     "#2563EB",
      accent:        "#F59E0B",
      background:    "#09090B",
      text:          "#FAFAFA",
      textSecondary: "#A1A1AA",
    },
    typography: {
      preset: "futurist",
      headlineFont: "system-ui, sans-serif",
    },
  },

  media: {
    // Uncomment to add background audio:
    // audio: { src: "/public/audio/background.mp3", volume: 0.5 },
  },

  content: {
    headline: "One config. Any ad.",
    subheadline: "Every tool. Zero limits.",
    targetAudience: "Developers building with Remotion",
    painPoints: ["Manual video editing is slow", "Every ad looks the same", "No dev-friendly workflow"],
    valueProp: "Config-driven ad creation with particles, charts, 3D, SVG drawing, code reveals, and more.",
    features: [
      { icon: "✨", title: "Particle Systems",    description: "Confetti, embers, sparks, bubbles, matrix rain" },
      { icon: "📊", title: "Live Charts",         description: "Bar + line charts that animate with easing" },
      { icon: "🎴", title: "3D Card Flips",       description: "CSS perspective flips with spring physics" },
      { icon: "✏️", title: "SVG Path Drawing",    description: "Self-drawing shapes — checkmarks, circles, hearts" },
      { icon: "💻", title: "Code Reveal",         description: "Syntax-highlighted typewriter IDE window" },
      { icon: "🌀", title: "Parallax Depth",      description: "Multi-layer text scrolling at different speeds" },
    ],
    testimonials: [],
    stats: [
      { value: "12",  label: "Scene types" },
      { value: "10",  label: "Transitions" },
      { value: "10",  label: "Typography presets" },
    ],
    cta: {
      primary: "Build your ad now",
      secondary: "Open Remotion Studio",
      url: "remotion.dev",
    },
    offer: "All features · zero extra config",
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. SPARK OPENER ──────────────────────────────────────────────────
      {
        type: "particle",
        durationInSeconds: 3,
        transition: "flash-in",
        props: {
          effect: "sparks",
          count: 120,
          headline: "THE ENGINE",
          subtext: "Every tool. One config.",
        } satisfies ParticleSceneProps,
      },

      // ── 2. PARALLAX DEPTH ─────────────────────────────────────────────────
      {
        type: "parallax",
        durationInSeconds: 3.5,
        transition: "blur-in",
        props: {
          direction: "up",
          layers: [
            { text: "BUILT FOR",  fontSize: 96, speed: 1.0,  opacity: 1.0 },
            { text: "any brand.", fontSize: 64, speed: 0.55, opacity: 0.7 },
            { text: "any story.", fontSize: 44, speed: 0.28, opacity: 0.42 },
            { text: "any ad.",    fontSize: 30, speed: 0.12, opacity: 0.22 },
          ],
        } satisfies ParallaxSceneProps,
      },

      // ── 3. CHART — live data bars ──────────────────────────────────────────
      {
        type: "chart",
        durationInSeconds: 4.5,
        transition: "wipe-right",
        props: {
          type: "bar",
          headline: "Ads that actually perform.",
          unit: "×",
          enterDelay: 14,
          data: [
            { label: "Reach",       value: 4.2 },
            { label: "Clicks",      value: 6.8 },
            { label: "Conversions", value: 9.1 },
            { label: "ROAS",        value: 12.4 },
          ],
        } satisfies ChartSceneProps,
      },

      // ── 4. DRAW-PATH CHECKLIST ─────────────────────────────────────────────
      {
        type: "draw-path",
        durationInSeconds: 5,
        transition: "slide-up",
        props: {
          headline: "What we built:",
          itemDelay: 22,
          items: [
            { shape: "checkmark", label: "10 typography presets",  color: "#34D399" },
            { shape: "checkmark", label: "10 background styles",   color: "#60A5FA" },
            { shape: "checkmark", label: "10 scene transitions",   color: "#A78BFA" },
            { shape: "checkmark", label: "12 scene types",         color: "#F59E0B" },
            { shape: "checkmark", label: "Particle systems",       color: "#F87171" },
            { shape: "checkmark", label: "SVG path drawing",       color: "#34D399" },
          ],
        } satisfies DrawPathSceneProps,
      },

      // ── 5. 3D FLIP CARDS ──────────────────────────────────────────────────
      {
        type: "flip-card",
        durationInSeconds: 5,
        transition: "rotate-in",
        props: {
          headline: "Inside every config:",
          flipDelay: 22,
          cards: [
            {
              backIcon: "?",
              backText: "Charts?",
              frontIcon: "📊",
              frontTitle: "Live Data Charts",
              frontBody: "Bar and line charts animate from zero with perfect easing + glowing drop shadows.",
              accentColor: "#60A5FA",
            },
            {
              backIcon: "?",
              backText: "3D effects?",
              frontIcon: "🎴",
              frontTitle: "CSS 3D Flip Cards",
              frontBody: "Perspective card flips driven by Remotion spring physics. Full backface-visibility support.",
              accentColor: "#A78BFA",
            },
            {
              backIcon: "?",
              backText: "Particles?",
              frontIcon: "✨",
              frontTitle: "Deterministic Particles",
              frontBody: "Confetti, embers, sparks, bubbles, matrix rain — reproducible across every render frame.",
              accentColor: "#F59E0B",
            },
          ],
        } satisfies FlipCardSceneProps,
      },

      // ── 6. CODE REVEAL ────────────────────────────────────────────────────
      {
        type: "code-reveal",
        durationInSeconds: 6,
        transition: "bounce-in",
        props: {
          headline: "// One config. Infinite ads.",
          language: "typescript",
          charsPerFrame: 3,
          lineDelay: 28,
          lines: [
            `import { engineShowcaseAd } from "./data/examples";`,
            ``,
            `// Every detail is data-driven`,
            `const ad: AdConfig = {`,
            `  brand: { name: "YOUR BRAND" },`,
            `  scenes: [`,
            `    { type: "particle",   effect: "confetti" },`,
            `    { type: "chart",      data: yourMetrics  },`,
            `    { type: "flip-card",  cards: yourCards   },`,
            `    { type: "draw-path",  items: yourList    },`,
            `    { type: "code-reveal",lines: yourCode    },`,
            `  ],`,
            `};`,
          ],
        } satisfies CodeRevealSceneProps,
      },

      // ── 7. CONFETTI CELEBRATION CTA ───────────────────────────────────────
      {
        type: "particle",
        durationInSeconds: 3,
        transition: "scale-in",
        props: {
          effect: "confetti",
          count: 160,
          headline: "CREATE ANYTHING.",
          subtext: "Open Remotion Studio and build.",
        } satisfies ParticleSceneProps,
      },

      // ── 8. END CARD ───────────────────────────────────────────────────────
      {
        type: "logo-end-card",
        durationInSeconds: 2,
        transition: "fade",
      },
    ],
  },
};
