/**
 * NightOwl Coffee — Ad: "Brewed Different"
 *
 * Brand: NightOwl — a premium single-origin cold brew subscription.
 * A specialty coffee brand doing a deliberate tech/futurist aesthetic play.
 *
 * New features showcased:
 *   Typography : futurist (Courier monospace — techy, precise, intentional)
 *   Backgrounds: aurora (hook/solution), glow-center (counter), solid (cta)
 *   Transitions: flash-in (hook punch), wipe-right (counter-reveal), blur-in (solution), bounce-in (cta)
 *   Scenes     : kinetic-text (typewriter), counter-reveal, price-reveal, cta
 */

import { AdConfig, KineticTextProps, CounterRevealProps, PriceRevealProps } from "../../data/types";

export const nightOwlCoffeeAd: AdConfig = {
  id: "nightowl-coffee-v1",
  name: "NightOwl Coffee — Brewed Different",
  template: "startup-explainer",
  aspectRatio: "9:16",

  brand: {
    name: "NightOwl",
    tagline: "Brewed different. Shipped to your door.",
    colors: {
      primary: "#92400E",       // Amber-800 — roasted depth
      secondary: "#451A03",     // Deep espresso brown
      accent: "#FCD34D",        // Amber-300 — bright crema
      background: "#0A0500",    // Almost-black with warm undertone
      text: "#FFFBEB",          // Amber-50 — warm white
      textSecondary: "#D97706", // Amber-600 — secondary warmth
    },
    typography: {
      preset: "futurist",       // ← NEW: Courier monospace
    },
  },

  media: {},

  content: {
    headline: "Your coffee shop charges £6 for mediocre.",
    subheadline: "NightOwl delivers single-origin cold brew — brewed 18 hours, bottled same day.",
    targetAudience: "Specialty coffee drinkers",

    painPoints: [
      "£6 a cup for coffee you can't even pronounce correctly",
      "Supermarket cold brew that tastes like chilled regret",
      "Subscriptions that send the same bland blend every month",
    ],

    valueProp:
      "18-hour cold brew from rotating single-origin farms. Delivered weekly. Cancel when you feel like it.",

    features: [
      { icon: "🌍", title: "Rotating Single-Origin", description: "New farm, new country, new flavour profile every month" },
      { icon: "⏱️", title: "18-Hour Brew Cycle",    description: "Never rushed. Every batch brewed overnight, shipped at dawn" },
      { icon: "📦", title: "Zero Commitment",        description: "Pause or cancel in 30 seconds. No phone call required." },
    ],

    testimonials: [
      {
        quote: "I haven't bought a coffee out in 3 months. NightOwl is better than anything within 2 miles of my flat.",
        author: "Priya M.",
        role: "Architect, Edinburgh",
        rating: 5,
      },
    ],

    stats: [
      { value: "18",   label: "Hours per brew cycle" },
      { value: "94%",  label: "Subscribers still active after 6 months" },
      { value: "£1.40",label: "Cost per cup vs £5.80 café average" },
    ],

    cta: {
      primary: "Start Your First Box",
      secondary: "First box 50% off · cancel anytime",
      url: "nightowl.coffee/start",
    },

    offer: "50% Off Your First Box",
  },

  timing: {
    fps: 30,
    scenes: [
      {
        type: "kinetic-text",
        durationInSeconds: 3.5,
        transition: "flash-in",          // ← White flash punch on first frame
        props: {
          lines: ["£6.", "For that?", "There's a better way."],
          style: "typewriter",            // ← NEW: typewriter style
          fontSize: 88,
          lineDelay: 30,
          highlightLines: [2],
        } satisfies KineticTextProps,
      },
      {
        type: "counter-reveal",
        durationInSeconds: 4,
        transition: "wipe-right",         // ← NEW: left-to-right clip reveal
        props: {
          headline: "The numbers are embarrassing.",
          startDelay: 8,
          countDuration: 55,
          counters: [
            { from: 580, to: 140, prefix: "£", suffix: "",   label: "Cost per cup (pence)" },
            { from: 0,   to: 18,  prefix: "",  suffix: "hrs", label: "Brew time per batch" },
            { from: 0,   to: 94,  prefix: "",  suffix: "%",  label: "Still subscribed after 6 months" },
          ],
        } satisfies CounterRevealProps,
      },
      {
        type: "solution",
        durationInSeconds: 3,
        transition: "blur-in",            // ← NEW: blurs then sharpens on enter
      },
      {
        type: "price-reveal",
        durationInSeconds: 4,
        transition: "slide-up",
        props: {
          originalPrice: "£6/cup at a café",
          newPrice: "£1.40/cup delivered",
          savings: "Save £180+ every month",
          badge: "Specialty Grade",
          subtext: "18-hour cold brew · single-origin · shipped at dawn",
        } satisfies PriceRevealProps,
      },
      {
        type: "cta",
        durationInSeconds: 3,
        transition: "bounce-in",          // ← NEW: bouncy spring entrance
      },
      {
        type: "logo-end-card",
        durationInSeconds: 2,
        transition: "fade",
      },
    ],
  },
};
