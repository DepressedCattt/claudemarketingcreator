/**
 * PRISM — Luxury Jewellery Brand
 *
 * A cinematic dark-luxury ad built around the new diamond-3d scene.
 * Showcases the React Three Fiber crystal gem with bloom, sparkles,
 * iridescent glass material, and a starfield background.
 *
 * Scenes:
 *   1. diamond-3d  — opening gem reveal (slow rotation, brand logo text)
 *   2. kinetic-text — punchy brand statement
 *   3. diamond-3d  — second gem pass (faster, more bloom, feature headline)
 *   4. split-reveal — before/after: lab vs PRISM
 *   5. diamond-3d  — closing CTA gem (larger scale)
 *   6. logo-end-card
 */

import {
  AdConfig,
  Diamond3DSceneProps,
  KineticTextProps,
  SplitRevealProps,
} from "../../data/types";

export const prismAd: AdConfig = {
  id: "prism-luxury-v1",
  name: "PRISM — Luxury Jewellery",
  template: "luxury-brand",
  aspectRatio: "9:16",

  brand: {
    name: "PRISM",
    tagline: "Crafted in light.",
    colors: {
      primary:       "#6B21A8",  // Deep violet
      secondary:     "#1E1B4B",  // Indigo-950
      accent:        "#E9C46A",  // Antique gold
      background:    "#050507",  // Near-black with cool undertone
      text:          "#F5F3FF",  // Violet-50
      textSecondary: "#A78BFA",  // Violet-400
    },
    typography: {
      preset: "luxury",
      headlineFont: "Georgia, 'Times New Roman', serif",
    },
  },

  media: {},

  content: {
    headline: "Every facet tells a story.",
    subheadline: "Lab-grown diamonds. Celestial clarity. Worn forever.",
    targetAudience: "Luxury jewellery buyers",
    painPoints: [
      "Conflict diamonds with hidden costs",
      "Same generic designs in every jeweller",
      "Paying for prestige, not purity",
    ],
    valueProp: "PRISM creates precision-cut lab diamonds — chemically identical, ethically certain, and impossibly beautiful.",
    features: [
      { icon: "💎", title: "Lab-Grown Purity",    description: "D-colour, IF clarity. Identical to mined diamonds at the atomic level." },
      { icon: "✨", title: "PRISM Cut™",           description: "Our 91-facet proprietary cut. 3× more light return than traditional brilliant." },
      { icon: "🌱", title: "Zero Conflict",        description: "No mines, no harm. Every stone comes with an ethical certificate." },
    ],
    testimonials: [
      {
        quote: "People stop me in the street to ask about this ring. It's pure light.",
        author: "Isabella K.",
        role: "London",
        rating: 5,
      },
    ],
    stats: [
      { value: "91",    label: "Facets per PRISM Cut™" },
      { value: "3×",    label: "More light return" },
      { value: "D/IF",  label: "Colour and clarity grade" },
    ],
    cta: {
      primary: "Find Your Stone",
      secondary: "Free bespoke consultation · Ships insured worldwide",
      url: "prismdiamonds.com",
    },
    offer: "Complimentary engraving on all bespoke orders",
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. OPENING GEM REVEAL ────────────────────────────────────────────
      {
        type: "diamond-3d",
        durationInSeconds: 5,
        transition: "fade",
        props: {
          headline: "PRISM",
          subtext: "Crafted in light.",
          diamondScale: 1.0,
          rotationSpeed: 0.25,
          bloomIntensity: 1.6,
          sparkleCount: 50,
        } satisfies Diamond3DSceneProps,
      },

      // ── 2. KINETIC BRAND STATEMENT ───────────────────────────────────────
      {
        type: "kinetic-text",
        durationInSeconds: 3.5,
        transition: "blur-in",
        props: {
          lines: ["91 facets.", "3× the light.", "Zero compromise."],
          style: "slam",
          fontSize: 82,
          lineDelay: 28,
          highlightLines: [2],
          highlightColor: "#E9C46A",
        } satisfies KineticTextProps,
      },

      // ── 3. GEM PASS 2 — feature reveal ────────────────────────────────────
      {
        type: "diamond-3d",
        durationInSeconds: 4.5,
        transition: "scale-in",
        props: {
          headline: "The PRISM Cut™",
          subtext: "91 precision facets. Engineered for maximum light return.",
          diamondScale: 0.85,
          rotationSpeed: 0.5,
          bloomIntensity: 2.0,
          sparkleCount: 65,
        } satisfies Diamond3DSceneProps,
      },

      // ── 4. BEFORE / AFTER SPLIT ───────────────────────────────────────────
      {
        type: "split-reveal",
        durationInSeconds: 4,
        transition: "wipe-right",
        props: {
          leftLabel: "Traditional Cut",
          leftText: "57 facets · Standard brilliance · Mined",
          leftEmoji: "💎",
          rightLabel: "PRISM Cut™",
          rightText: "91 facets · 3× light return · Lab-grown",
          rightEmoji: "✨",
        } satisfies SplitRevealProps,
      },

      // ── 5. CLOSING GEM — CTA ─────────────────────────────────────────────
      {
        type: "diamond-3d",
        durationInSeconds: 5,
        transition: "zoom-out",
        props: {
          headline: "Find Your Stone.",
          subtext: "Free bespoke consultation · Ships insured worldwide · prismdiamonds.com",
          diamondScale: 1.15,
          rotationSpeed: 0.18,
          bloomIntensity: 1.8,
          sparkleCount: 80,
          color: "#7C3AED",
        } satisfies Diamond3DSceneProps,
      },

      // ── 6. END CARD ──────────────────────────────────────────────────────
      {
        type: "logo-end-card",
        durationInSeconds: 2.5,
        transition: "fade",
      },
    ],
  },
};
