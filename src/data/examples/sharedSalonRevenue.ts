/**
 * SharedSalon — Ad v2: "The Revenue Story"
 *
 * Angle: Every empty appointment slot is money you're not making.
 * Tone: Urgent, punchy, numbers-driven.
 *
 * Custom scene sequence using new animation types:
 *   kinetic-text   → hook — words slam in one at a time
 *   problem        → rapid-fire pain points slide in from left
 *   counter-reveal → live-counting income stats (most dramatic scene)
 *   price-reveal   → old lease cost struck through, new "pay per hour" revealed
 *   cta            → urgency close with free first hour offer
 *   logo-end-card  → brand burn
 *
 * Total: ~17 seconds
 */

import { AdConfig, KineticTextProps, CounterRevealProps, PriceRevealProps } from "../../data/types";

export const sharedSalonRevenueAd: AdConfig = {
  id: "sharedsalon-revenue-v1",
  name: "SharedSalon — The Revenue Story",
  template: "startup-explainer",
  aspectRatio: "9:16",

  brand: {
    name: "SharedSalon",
    tagline: "Your chair. Your clients. Your rules.",
    colors: {
      primary: "#1E40AF",      // Blue-800 — authoritative
      secondary: "#1D4ED8",    // Blue-700
      accent: "#F59E0B",       // Amber — money energy
      background: "#03060F",   // Near-black
      text: "#FFFFFF",
      textSecondary: "#BFDBFE",
    },
    typography: {
      preset: "bold-impact",
    },
  },

  media: {},

  content: {
    headline: "Every Empty Slot Costs You Money.",
    subheadline: "Freelance stylists lose £800/month to chairs they're not sitting in.",
    targetAudience: "Freelance stylists & barbers",

    painPoints: [
      "Full lease costs — even on your slow days",
      "Clients who book last minute — from the wrong end of town",
      "Earnings eaten by space you can't fill",
    ],

    valueProp:
      "SharedSalon lets you drop into vetted salon chairs the moment a client books — pay only for the hours you actually use.",

    features: [
      {
        icon: "💸",
        title: "Pay Per Hour",
        description: "No lease, no fixed overheads",
      },
      {
        icon: "🔔",
        title: "Last-Minute Slots",
        description: "Snap up same-day chairs when clients book short notice",
      },
      {
        icon: "📊",
        title: "Track Your Earnings",
        description: "See exactly what you're making in real time",
      },
    ],

    testimonials: [
      {
        quote: "I cut my studio costs by 70% and banked an extra £1,200 last month.",
        author: "Marcus Webb",
        role: "Freelance Barber, London",
        rating: 5,
      },
    ],

    stats: [
      { value: "1200", label: "Avg. Extra Monthly Earnings (£)" },
      { value: "70",   label: "Average Cost Reduction (%)" },
      { value: "2800", label: "Available Chairs" },
    ],

    cta: {
      primary: "Stop Losing Money. Start Now.",
      secondary: "First hour free — no card needed",
      url: "sharedsalon.app/start",
    },

    offer: "Your First Hour Is On Us",
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. Kinetic hook — words slam in one by one ───────────────────────
      {
        type: "kinetic-text",
        durationInSeconds: 3,
        props: {
          lines: ["EMPTY CHAIR.", "EMPTY WALLET.", "There's a fix."],
          style: "slam",
          fontSize: 100,
          lineDelay: 22,
          highlightLines: [2],
        } satisfies KineticTextProps,
      },

      // ── 2. Problem — pain points slide in ────────────────────────────────
      {
        type: "problem",
        durationInSeconds: 3,
      },

      // ── 3. Counter reveal — income stats count up live ───────────────────
      {
        type: "counter-reveal",
        durationInSeconds: 4,
        props: {
          headline: "Here's what other freelancers gained.",
          startDelay: 10,
          countDuration: 55,
          counters: [
            { from: 0, to: 1200, prefix: "£", suffix: "",    label: "Avg. extra earned/month" },
            { from: 100, to: 30, prefix: "",  suffix: "%",   label: "Of old costs remaining" },
            { from: 0, to: 2800, prefix: "",  suffix: "+",   label: "Chairs available now" },
          ],
        } satisfies CounterRevealProps,
      },

      // ── 4. Price reveal — lease struck through, pay-per-hour revealed ────
      {
        type: "price-reveal",
        durationInSeconds: 4,
        props: {
          originalPrice: "£2,800/mo",
          newPrice: "Pay per hour",
          savings: "Save £800+ every month",
          badge: "No Lock-In",
          subtext: "Pay only for the hours you actually work",
        } satisfies PriceRevealProps,
      },

      // ── 5. CTA — free first hour urgency close ───────────────────────────
      {
        type: "cta",
        durationInSeconds: 3,
      },

      // ── 6. Logo burn ─────────────────────────────────────────────────────
      {
        type: "logo-end-card",
        durationInSeconds: 1.5,
      },
    ],
  },
};
