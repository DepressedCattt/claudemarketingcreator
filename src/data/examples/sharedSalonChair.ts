/**
 * Shared Salon — Ad: "Rent a Chair Without a Care"
 *
 * Brand: Shared Salon — a premium marketplace helping salon venue owners
 *        list unused chairs and earn during quieter periods.
 *
 * Angle: Empty chairs during slow periods = lost income. Fix it in 2 minutes.
 * Tone:  Airy, polished, editorial beauty-tech SaaS. Closely matches the
 *        Shared Salon homepage aesthetic — soft cream, pale blue gradients,
 *        electric blue accents, dark navy editorial type.
 *
 * Visual identity:
 *   - Soft cream + pale blue backgrounds (not dark/moody)
 *   - Electric blue (#2563EB) for highlights, buttons, emphasis
 *   - Soft gold (#E7D3A7) as a warm accent — sparkles, beauty touches
 *   - Dark navy (#0B1730) for editorial headline weight
 *   - Clean UI cards with rounded corners, elegant whitespace
 *   - Salon-inspired motion: scissor-slice reveals, comb-line wipes,
 *     floating beauty icons, subtle sparkles, soft mirror reflections
 *
 * Scene sequence (15s vertical — Reels / TikTok / paid social):
 *   hook          (3s)  → Scissor-slice headline on cream + pale blue gradient
 *   split-reveal  (3s)  → Muted unused chair → glowing listed revenue stream
 *   feature       (4s)  → 3 premium SaaS-style floating cards, staggered entry
 *   kinetic-text  (3s)  → Slam typography — final line "New revenue." in blue
 *   cta           (2s)  → Soft gradient end card with beta CTA in brand blue
 *
 * All transitions: slide-up (clean upward reveal — editorial and airy)
 */

import {
  AdConfig,
  KineticTextProps,
  SplitRevealProps,
} from "../../data/types";

export const sharedSalonChairAd: AdConfig = {
  id: "sharedsalon-chair-v1",
  name: "Shared Salon — Rent a Chair Without a Care (Chair Revenue)",
  template: "luxury-brand",
  aspectRatio: "9:16",

  brand: {
    name: "Shared Salon",
    tagline: "Rent a Chair Without a Care",
    colors: {
      primary:       "#2563EB", // Electric blue — brand blue, buttons, emphasis
      secondary:     "#DCE8FF", // Pale sky blue — backgrounds, card tints
      accent:        "#E7D3A7", // Soft champagne gold — sparkles, beauty accents
      background:    "#FAF8F5", // Soft warm cream — matches homepage
      text:          "#0B1730", // Deep navy — editorial, authoritative
      textSecondary: "#4A6FA5", // Mid blue — supporting copy, subtext
    },
    typography: {
      preset: "editorial", // Georgia serif, elegant weight, editorial rhythm
    },
  },

  media: {},

  content: {
    headline:    "Turn Empty Chairs Into Revenue",
    subheadline: "Help your salon earn more during quieter periods by listing unused chairs on Shared Salon",
    targetAudience: "Salon venue owners with unused chairs or spare capacity",

    painPoints: [
      "Empty chairs generate no income during slow periods",
      "Rent and overhead still need to be covered",
      "Finding renters manually is inconsistent and time-consuming",
    ],

    valueProp:
      "Shared Salon helps salon owners turn unused chairs into bookable revenue through a simple, premium platform built for flexible listings and verified professionals.",

    features: [
      {
        icon: "💸",
        title: "Extra Revenue",
        description: "Monetise chairs that would otherwise sit empty",
      },
      {
        icon: "⚡",
        title: "Quick Setup",
        description: "List your space in under 2 minutes",
      },
      {
        icon: "✅",
        title: "Verified Professionals",
        description: "Connect through a trusted platform with vetted freelancers",
      },
    ],

    stats: [
      { value: "2 min",     label: "To list your chair" },
      { value: "Verified",  label: "Professionals only" },
    ],

    trustBadges: [
      "✓ Verified Professionals",
      "✓ Flexible Listings",
      "✓ Simple Setup",
    ],

    cta: {
      primary:   "Join the Beta",
      secondary: "List your chair now",
      url:       "sharedsalon.com.au",
    },

    offer: "Beta access now open for salon venues",
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. Hook (0–3s) ────────────────────────────────────────────────────
      // Soft cream + pale blue gradient background.
      // Premium salon chair silhouette floats on the right.
      // Headline animates in with scissor-slice / elegant line-cut reveal.
      // Subtle sparkles and beauty-editorial motion accents complete the scene.
      {
        type: "hook",
        durationInSeconds: 3,
        transition: "slide-up",
      },

      // ── 2. Split Reveal (3–6s) ────────────────────────────────────────────
      // Clean before/after split with soft vertical dividing line.
      // Left: muted, still, underused — empty chair during downtime.
      // Right: brighter, glowing, active — listed chair earning income.
      // Minimal, high-end, cream-and-blue palette throughout.
      {
        type: "split-reveal",
        durationInSeconds: 3,
        transition: "slide-up",
        props: {
          splitFrame: 20,
          leftLabel: "Unused Chair",
          leftText:  "Empty chair during down time",
          leftEmoji: "💺",
          rightLabel: "Revenue Stream",
          rightText:  "Listed chair earning income",
          rightEmoji: "✨",
        } satisfies SplitRevealProps,
      },

      // ── 3. Feature Scene (6–10s) ──────────────────────────────────────────
      // 3 premium floating SaaS-style cards with rounded corners.
      // Staggered entry animation with elegant depth and soft shadows.
      // Cards feel like components lifted directly from the Shared Salon UI.
      {
        type: "feature",
        durationInSeconds: 4,
        transition: "slide-up",
      },

      // ── 4. Kinetic Text (10–13s) ──────────────────────────────────────────
      // Full-screen bold editorial slam typography on cream background.
      // "Empty chairs." and "Quiet periods." land in dark navy.
      // "New revenue." lands with stronger electric blue emphasis — brand payoff.
      {
        type: "kinetic-text",
        durationInSeconds: 3,
        transition: "slide-up",
        props: {
          lines: [
            "Empty chairs.",
            "Quiet periods.",
            "New revenue.",
          ],
          style:          "slam",
          fontSize:       92,
          lineDelay:      28,
          highlightLines: [2], // Final line hits in electric blue
        } satisfies KineticTextProps,
      },

      // ── 5. CTA (13–15s) ───────────────────────────────────────────────────
      // Soft cream + pale blue gradient end card.
      // "Join the Beta" CTA button in Shared Salon electric blue.
      // Subtext: "List your chair with Shared Salon"
      // URL: sharedsalon.com.au
      // Closes with a subtle glow / reflection sweep for brand polish.
      {
        type: "cta",
        durationInSeconds: 2,
        transition: "slide-up",
      },
    ],
  },
};
