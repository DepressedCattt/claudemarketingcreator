/**
 * BLAZE Energy — Ad: "The Performance Test"
 *
 * Brand: BLAZE — a clean energy drink for peak performers.
 * Tone: Aggressive, high-voltage, no-fluff. Every scene hits hard.
 *
 * Scene sequence:
 *   kinetic-text   → slam hook — 4 words. Maximum punch.
 *   counter-reveal → performance stats count up (focus %, crash rate, calories)
 *   problem        → what regular energy drinks do to you
 *   price-reveal   → junk drink vs BLAZE — side by side cost reveal
 *   kinetic-text   → second kinetic hit — brand name slams on screen
 *   cta            → urgent close
 *   logo-end-card  → BLAZE holds
 *
 * Total: ~17 seconds
 */

import { AdConfig, KineticTextProps, CounterRevealProps, PriceRevealProps } from "../../data/types";

export const blazeEnergyAd: AdConfig = {
  id: "blaze-energy-v1",
  name: "BLAZE Energy — The Performance Test",
  template: "punchy-text",
  aspectRatio: "9:16",

  brand: {
    name: "BLAZE",
    tagline: "No crash. No junk. Just performance.",
    colors: {
      primary: "#DC2626",      // Red-600 — heat, intensity
      secondary: "#7F1D1D",    // Red-900 — deep shadow
      accent: "#FCD34D",       // Amber-300 — electric yellow pop
      background: "#050505",   // True black
      text: "#FFFFFF",
      textSecondary: "#FCA5A5", // Red-300 — warm secondary
    },
    typography: {
      preset: "bold-impact",
    },
  },

  media: {},

  content: {
    headline: "Perform. Don't Crash.",
    subheadline: "The first clean energy drink that actually works — no sugar spike, no 2pm crash",
    targetAudience: "Athletes, founders & high performers",

    painPoints: [
      "Sugar crash at 2pm kills your afternoon",
      "Artificial sweeteners and mystery compounds",
      "Jittery feeling that tanks your focus",
    ],

    valueProp:
      "BLAZE uses nootropics, adaptogens and zero sugar to deliver 6 hours of clean, locked-in energy — no spike, no crash, no compromise.",

    features: [
      {
        icon: "⚡",
        title: "6-Hour Clean Energy",
        description: "Sustained focus without the mid-afternoon wipeout",
      },
      {
        icon: "🧠",
        title: "Nootropic Blend",
        description: "Lion's Mane + L-Theanine — the focus stack pros use",
      },
      {
        icon: "0️⃣",
        title: "Zero Sugar. Zero Junk.",
        description: "No artificial sweeteners. No proprietary blends. Full transparency.",
      },
    ],

    testimonials: [
      {
        quote: "I replaced my double espresso and afternoon Red Bull with one BLAZE. Focus is sharper. Energy lasts all day. I'm never going back.",
        author: "Jordan Pierce",
        role: "Founder, 3x marathoner",
        rating: 5,
      },
    ],

    stats: [
      { value: "89%",   label: "Report Zero Crash" },
      { value: "6hrs",  label: "Avg. Clean Energy Window" },
      { value: "50K+",  label: "Daily Performers" },
    ],

    cta: {
      primary: "Try BLAZE Risk-Free",
      secondary: "30-day money back — no questions asked",
      url: "drinkblaze.com/try",
    },

    offer: "First Case 40% Off",
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. Kinetic slam — 4 brutal words, staggered fast ─────────────────
      {
        type: "kinetic-text",
        durationInSeconds: 2.5,
        props: {
          lines: ["FOCUS.", "PERFORM.", "NO CRASH."],
          style: "slam",
          fontSize: 108,
          lineDelay: 16,
          highlightLines: [2],
        } satisfies KineticTextProps,
      },

      // ── 2. Counter reveal — the proof lands ──────────────────────────────
      {
        type: "counter-reveal",
        durationInSeconds: 3.5,
        props: {
          headline: "The numbers don't lie.",
          startDelay: 8,
          countDuration: 50,
          counters: [
            { from: 0,  to: 89, suffix: "%",   label: "Report zero energy crash" },
            { from: 0,  to: 6,  suffix: "hrs",  label: "Clean energy window" },
            { from: 0,  to: 50, suffix: "K+",   label: "Daily performers" },
          ],
        } satisfies CounterRevealProps,
      },

      // ── 3. Problem — what other drinks do to you ──────────────────────────
      {
        type: "problem",
        durationInSeconds: 3,
      },

      // ── 4. Price reveal — cheap junk vs BLAZE investment ─────────────────
      {
        type: "price-reveal",
        durationInSeconds: 3.5,
        props: {
          originalPrice: "2pm crash",
          newPrice: "6hrs locked in",
          savings: "40% off your first case",
          badge: "Risk-Free Trial",
          subtext: "30-day money back · no questions asked",
        } satisfies PriceRevealProps,
      },

      // ── 5. Second kinetic hit — brand name alone, full screen ─────────────
      {
        type: "kinetic-text",
        durationInSeconds: 2,
        props: {
          lines: ["BLAZE."],
          style: "slam",
          fontSize: 130,
          lineDelay: 0,
          highlightLines: [0],
        } satisfies KineticTextProps,
      },

      // ── 6. CTA ────────────────────────────────────────────────────────────
      { type: "cta", durationInSeconds: 3 },

      // ── 7. Logo ───────────────────────────────────────────────────────────
      { type: "logo-end-card", durationInSeconds: 1.5 },
    ],
  },
};
