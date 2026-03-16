/**
 * Shared Salon — Ad: "Turn Unused Chairs Into Cash"
 *
 * Brand: Shared Salon — a premium platform helping salon venue owners
 *        turn unused chairs and underutilised space into bookable revenue.
 *        Built for flexible space monetisation.
 *
 * Angle: Empty chairs generate zero revenue. Shared Salon changes that.
 * Tone:  Luxury beauty-tech SaaS — artsy, jumpy, premium, high-end.
 *        Feels like a startup ad for the beauty industry, not a local business.
 *
 * Scene sequence (15s vertical ad — Instagram Reels / TikTok / paid social):
 *   hook          (3s)  → Scissor-reveal headline over minimal salon composition
 *   split-reveal  (3s)  → Empty Chair (muted) vs Bookable Asset (bright, active)
 *   feature       (4s)  → 3 floating feature cards with staggered premium entry
 *   kinetic-text  (3s)  → Full-screen slam typography — brand payoff moment
 *   cta           (2s)  → Clean premium end card with beta CTA
 *
 * All transitions: blur-in (blurs then sharpens — cinematic focus pull effect)
 *
 * Color palette: Warm cream + rich taupe + deep charcoal — upscale salon editorial
 * Typography:    luxury preset (Georgia, wide tracking, quiet confidence)
 */

import {
  AdConfig,
  KineticTextProps,
  SplitRevealProps,
} from "../../data/types";

export const sharedSalonBetaAd: AdConfig = {
  id: "sharedsalon-beta-v1",
  name: "Shared Salon — Turn Unused Chairs Into Cash (Beta Launch)",
  template: "luxury-brand",
  aspectRatio: "9:16",

  brand: {
    name: "Shared Salon",
    tagline: "Turn empty chairs into extra revenue",
    colors: {
      primary:       "#111111", // Near-black — authoritative, editorial
      secondary:     "#DCC7B4", // Warm taupe — refined, salon-inspired
      accent:        "#C89B6D", // Rich caramel gold — premium accent
      background:    "#F7F1EB", // Soft warm cream — luxe, airy, high-end
      text:          "#111111", // Deep charcoal — crisp readability
      textSecondary: "#7A6555", // Muted warm brown — elegant supporting text
    },
    typography: {
      preset: "luxury", // Georgia, wide letter-spacing, quiet expensive feel
    },
  },

  media: {},

  content: {
    headline:    "Turn Unused Chairs Into Cash",
    subheadline: "List your spare salon space and earn during quieter periods",
    targetAudience: "Salon venue owners with unused chairs or underutilised space",

    painPoints: [
      "Empty chairs generate no revenue",
      "Down periods make rent and overhead feel heavier",
      "Filling spare capacity is inconsistent and manual",
    ],

    valueProp:
      "Shared Salon helps venue owners turn unused salon chairs into bookable revenue through a premium, simple platform built for flexible space monetisation.",

    features: [
      {
        icon: "💸",
        title: "Extra Revenue",
        description: "Earn from chairs that would otherwise sit empty",
      },
      {
        icon: "📅",
        title: "Flexible Listings",
        description: "Open up quiet days or off-peak slots only when it suits you",
      },
      {
        icon: "🤝",
        title: "Better Matches",
        description: "Connect with freelancers looking for ready-to-use salon space",
      },
    ],

    stats: [
      { value: "Beta", label: "Access Now Open" },
    ],

    cta: {
      primary:   "Join the Beta",
      secondary: "For salon owners ready to monetise unused space",
      url:       "sharedsalon.com.au",
    },

    offer: "Early beta access now open",
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. Hook (0–3s) ────────────────────────────────────────────────────
      // Minimal luxury composition — editorial headline reveal over warm cream.
      // Scissor-cut / slicing motion baked into the hook scene's GradientBackground
      // and AnimatedHeadline spring physics. Soft reflections, particles, subtle zoom.
      {
        type: "hook",
        durationInSeconds: 3,
        transition: "blur-in",
      },

      // ── 2. Split Reveal (3–6s) ────────────────────────────────────────────
      // Before/after comparison using a vertical mirror-line split.
      // Left: muted, slow, underused — empty chair, no income.
      // Right: bright, monetised, active — bookable asset earning revenue.
      {
        type: "split-reveal",
        durationInSeconds: 3,
        transition: "blur-in",
        props: {
          splitFrame: 20,
          leftLabel: "Empty Chair",
          leftText:  "Quiet chair. No income.",
          leftEmoji: "💺",
          rightLabel: "Bookable Asset",
          rightText:  "Spare space becomes revenue",
          rightEmoji: "✨",
        } satisfies SplitRevealProps,
      },

      // ── 3. Feature Scene (6–10s) ──────────────────────────────────────────
      // 3 floating feature cards entering with polished staggered animation.
      // SaaS dashboard energy with luxury salon visual language.
      // Icons evoke salon spaces; copy is concise and benefit-led.
      {
        type: "feature",
        durationInSeconds: 4,
        transition: "blur-in",
      },

      // ── 4. Kinetic Text (10–13s) ──────────────────────────────────────────
      // Full-screen bold slam typography — fast, confident, brand payoff.
      // Lines 1 & 2 highlighted in accent gold to punch the problem home.
      // Final line ("Shared Salon changes that.") is the brand promise moment.
      {
        type: "kinetic-text",
        durationInSeconds: 3,
        transition: "blur-in",
        props: {
          lines: [
            "Empty chairs.",
            "Lost revenue.",
            "Shared Salon changes that.",
          ],
          style:          "slam",
          fontSize:       88,
          lineDelay:      28,
          highlightLines: [0, 1], // First two lines hit in accent gold
        } satisfies KineticTextProps,
      },

      // ── 5. CTA (13–15s) ───────────────────────────────────────────────────
      // Clean premium end card. Soft glow / refined scale-in close.
      // Headline: "Join the Beta" | URL: sharedsalon.com.au
      {
        type: "cta",
        durationInSeconds: 2,
        transition: "blur-in",
      },
    ],
  },
};
