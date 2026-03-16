/**
 * GridIron — Ad: "The Fantasy App That Actually Respects Your Intelligence"
 *
 * Brand: GridIron — a premium fantasy football app with real-time
 * injury data, AI lineup suggestions and zero ads.
 *
 * New features showcased:
 *   Typography : condensed (tall narrow — dense stats, Bloomberg terminal energy)
 *   Backgrounds: diagonal (hook — hard two-tone), conic (counter — colour-wheel sweep)
 *   Transitions: bounce-in (hook), flash-in (counter-reveal), slide-up (feature), rotate-in (cta)
 *   Scenes     : kinetic-text (slam, huge), counter-reveal, feature, cta
 */

import { AdConfig, KineticTextProps, CounterRevealProps } from "../../data/types";

export const gridIronAd: AdConfig = {
  id: "gridiron-fantasy-v1",
  name: "GridIron — Fantasy Football That Respects You",
  template: "sports-hype",
  aspectRatio: "9:16",

  brand: {
    name: "GridIron",
    tagline: "Real data. Smart lines. Zero noise.",
    colors: {
      primary: "#15803D",       // Green-700 — turf
      secondary: "#14532D",     // Green-900 — deep pitch
      accent: "#FDE047",        // Yellow-300 — scoreboard flash
      background: "#030A04",    // Near-black with green tint
      text: "#F0FDF4",          // Green-50 — bright white with warmth
      textSecondary: "#86EFAC", // Green-300
    },
    typography: {
      preset: "condensed",      // ← NEW: tall narrow, dense information
    },
  },

  media: {},

  content: {
    headline: "Your Rivals Are Guessing. You Won't Be.",
    subheadline: "Real-time injury data, AI lineup optimizer, zero ads. Fantasy football for people who take it seriously.",
    targetAudience: "Competitive fantasy football managers",

    painPoints: [
      "Finding out about an injury at kickoff — not before it",
      "Lineup tools that haven't updated since 2019",
      "Paying £9.99/month for an app that runs ads at you",
    ],

    valueProp:
      "GridIron pulls live injury reports, weather data and matchup analytics to suggest your optimal lineup — updated every 4 minutes until kickoff.",

    features: [
      { icon: "⚡", title: "4-Min Data Refresh",  description: "Injury status, depth charts and weather — live until the whistle" },
      { icon: "🧠", title: "AI Lineup Engine",    description: "Analyses 200+ data points per player. Suggests. Never decides for you." },
      { icon: "🚫", title: "Zero Ads. Ever.",     description: "You pay £4.99/month. That's it. No upsells, no banners." },
    ],

    testimonials: [
      {
        quote: "I won my 14-team league last season. GridIron's injury alerts alone are worth the subscription 10 times over.",
        author: "Dom T.",
        role: "Engineer, 4x league winner",
        rating: 5,
      },
    ],

    stats: [
      { value: "4",    label: "Minutes between data updates" },
      { value: "200+", label: "Data points analysed per player" },
      { value: "68%",  label: "GridIron users placed in top 3 last season" },
    ],

    cta: {
      primary: "Get The Edge. £4.99/mo.",
      secondary: "First month free · cancel before it ends",
      url: "gridiron.app/try",
    },

    offer: "First Month Free",
  },

  timing: {
    fps: 30,
    scenes: [
      {
        type: "kinetic-text",
        durationInSeconds: 2.5,
        transition: "bounce-in",          // ← NEW: bouncy spring entrance
        props: {
          lines: ["THEY'RE GUESSING.", "YOU WON'T BE."],
          style: "slam",
          fontSize: 100,
          lineDelay: 20,
          highlightLines: [1],
        } satisfies KineticTextProps,
      },
      {
        type: "counter-reveal",
        durationInSeconds: 4,
        transition: "flash-in",           // ← NEW: white flash then dissolve
        props: {
          headline: "The data doesn't lie.",
          startDelay: 10,
          countDuration: 52,
          counters: [
            { from: 0,  to: 4,   suffix: " min", label: "Between data refreshes" },
            { from: 0,  to: 200, suffix: "+",    label: "Data points per player" },
            { from: 0,  to: 68,  suffix: "%",    label: "Users placed top 3 last season" },
          ],
        } satisfies CounterRevealProps,
      },
      {
        type: "problem",
        durationInSeconds: 3,
        transition: "slide-up",
      },
      {
        type: "feature",
        durationInSeconds: 4,
        transition: "slide-up",           // ← standard but with new transition
      },
      {
        type: "social-proof",
        durationInSeconds: 3,
        transition: "fade",
      },
      {
        type: "cta",
        durationInSeconds: 3,
        transition: "rotate-in",          // ← NEW: slight CW rotation corrects
      },
      {
        type: "logo-end-card",
        durationInSeconds: 1.5,
        transition: "fade",
      },
    ],
  },
};
