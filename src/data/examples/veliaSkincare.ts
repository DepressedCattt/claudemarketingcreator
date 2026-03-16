/**
 * Velia Skincare — Ad: "What Your Skin Has Been Waiting For"
 *
 * Brand: Velia — a clean luxury skincare brand. Botanical actives,
 * refillable packaging, no compromise on efficacy or ethics.
 *
 * New features showcased:
 *   Typography : luxury (ultra-light Georgia, wide spacing — quiet expensive feel)
 *   Backgrounds: vignette (hook — dark edges, precious centre), glow-center (solution)
 *   Transitions: zoom-out (hook — push-back cinematic), blur-in (solution), slide-down (social-proof), fade (cta)
 *   Scenes     : kinetic-text (drift — slow, editorial), split-reveal (old routine vs Velia), timeline, social-proof
 */

import { AdConfig, KineticTextProps, SplitRevealProps, TimelineProps } from "../../data/types";

export const veliaSkinAd: AdConfig = {
  id: "velia-skincare-v1",
  name: "Velia Skincare — What Your Skin Has Been Waiting For",
  template: "luxury-brand",
  aspectRatio: "9:16",

  brand: {
    name: "Velia",
    tagline: "Clean actives. Botanical science. Refillable.",
    colors: {
      primary: "#9D7B5A",       // Warm taupe — earthy, natural luxury
      secondary: "#5C3D2E",     // Deep terracotta
      accent: "#F5ECD7",        // Cream — clean, light, precious
      background: "#1A120B",    // Deep warm brown-black
      text: "#FAF7F2",          // Warm off-white
      textSecondary: "#C4A882", // Muted gold — secondary
    },
    typography: {
      preset: "luxury",         // ← NEW: ultra-light Georgia, wide letter spacing
    },
  },

  media: {},

  content: {
    headline: "What Your Skin Has Been Waiting For.",
    subheadline: "Clean actives. Zero compromise. Refillable from day one.",
    targetAudience: "Conscious beauty consumers",

    painPoints: [
      "Ingredients lists that read like a chemistry exam",
      "\"Clean\" products that don't actually do anything",
      "Buying 7 products that could be 2",
    ],

    valueProp:
      "Velia distils your entire routine into two botanically-active formulas. Clinically tested. Refillable packaging. Nothing hidden on the label.",

    features: [
      { icon: "🌿", title: "Botanical Actives",  description: "Bakuchiol, niacinamide & ceramides — backed by peer-reviewed studies" },
      { icon: "🔄", title: "Refill Programme",   description: "Return your empty, get the next one — 40% less plastic, always" },
      { icon: "📋", title: "Full Transparency",  description: "Every ingredient listed with its exact purpose. No hiding." },
    ],

    testimonials: [
      {
        quote: "I replaced a 9-step routine with Velia's two products. My skin has never looked like this. I feel like I've been lied to for a decade.",
        author: "Camille B.",
        role: "Dermatology nurse, Paris",
        rating: 5,
      },
    ],

    stats: [
      { value: "94%",  label: "Saw visible results in 28 days" },
      { value: "2",    label: "Products replace your entire routine" },
      { value: "40%",  label: "Less plastic vs single-use packaging" },
    ],

    trustBadges: ["✓ Dermatologist Tested", "✓ Cruelty Free", "✓ Refillable Programme"],

    cta: {
      primary: "Begin Your Ritual",
      secondary: "Free 14-day trial · returns always free",
      url: "velia.co/ritual",
    },

    offer: "Free 14-Day Trial Kit",
  },

  timing: {
    fps: 30,
    scenes: [
      {
        type: "kinetic-text",
        durationInSeconds: 4,
        transition: "zoom-out",           // ← NEW: cinematic push-back zoom
        props: {
          lines: [
            "Your skin knows",
            "the difference.",
          ],
          style: "drift",                 // ← slow, editorial float
          fontSize: 90,
          lineDelay: 36,
          highlightLines: [],
        } satisfies KineticTextProps,
      },
      {
        type: "split-reveal",
        durationInSeconds: 4.5,
        transition: "slide-up",
        props: {
          splitFrame: 20,
          leftLabel: "Your current routine",
          leftText: "9 products. 23 ingredients you can't pronounce. Still not working.",
          leftEmoji: "😔",
          rightLabel: "Velia",
          rightText: "Two products. Every ingredient explained. It actually works.",
          rightEmoji: "✨",
        } satisfies SplitRevealProps,
      },
      {
        type: "solution",
        durationInSeconds: 3,
        transition: "blur-in",            // ← NEW: blurs then sharpens
      },
      {
        type: "timeline",
        durationInSeconds: 4.5,
        transition: "fade",
        props: {
          headline: "The 28-day difference.",
          stepDelay: 20,
          steps: [
            { icon: "1️⃣", title: "Day 1 — Apply morning & evening",    subtitle: "Two minutes. That's the whole routine.", time: "2 min/day" },
            { icon: "🗓️", title: "Day 7 — Skin texture visibly smoother", subtitle: "94% of testers reported this by day 7", time: "Week 1" },
            { icon: "🌟", title: "Day 28 — Full clinical results",       subtitle: "Clinically measured improvement in tone, hydration & firmness", time: "Day 28" },
          ],
        } satisfies TimelineProps,
      },
      {
        type: "social-proof",
        durationInSeconds: 4,
        transition: "slide-down",         // ← NEW: slides down from above
      },
      {
        type: "cta",
        durationInSeconds: 3.5,
        transition: "fade",
      },
      {
        type: "logo-end-card",
        durationInSeconds: 2.5,
        transition: "fade",
      },
    ],
  },
};
