/**
 * Ember — Ad: "Finally. A Wellness App That Feels Like One."
 *
 * Brand: Ember — a mental wellness app focused on daily check-ins,
 * guided breathwork and mood tracking. Calm, inclusive, zero toxic positivity.
 *
 * New features showcased:
 *   Typography : rounded (Verdana — soft, zero intimidation, approachable)
 *   Backgrounds: radial (hook — warm orb glow), glow-center (cta — pulsing light)
 *   Transitions: scale-in (hook), blur-in (problem), fade (timeline), scale-in (price-reveal), bounce-in (cta)
 *   Scenes     : kinetic-text (drift — slow, breathing-room pacing), problem, timeline, price-reveal, social-proof, cta
 *
 * Extra: retro-slab used on the "solution" scene via typography override
 */

import { AdConfig, KineticTextProps, TimelineProps, PriceRevealProps } from "../../data/types";

export const emberWellnessAd: AdConfig = {
  id: "ember-wellness-v1",
  name: "Ember — Finally a Wellness App That Feels Like One",
  template: "minimalist-founder",
  aspectRatio: "9:16",

  brand: {
    name: "Ember",
    tagline: "A minute a day. A different year.",
    colors: {
      primary: "#7C3AED",       // Violet-600 — warm, grounding, not clinical
      secondary: "#4C1D95",     // Violet-900 — deep dusk
      accent: "#FDE68A",        // Amber-200 — warm candlelight
      background: "#0D0818",    // Deep purple-black
      text: "#FAF5FF",          // Violet-50 — warm white
      textSecondary: "#C4B5FD", // Violet-300 — soft secondary
    },
    typography: {
      preset: "rounded",        // ← NEW: Verdana — friendly, zero intimidation
    },
  },

  media: {},

  content: {
    headline: "Finally. A Wellness App That Feels Like One.",
    subheadline: "No hustle culture. No toxic positivity. Just one honest minute a day.",
    targetAudience: "Adults who want to feel better without being preached at",

    painPoints: [
      "Apps that guilt-trip you for missing one day",
      "\"Meditate for 45 minutes\" — you have 2 kids and a job",
      "Wellness content that makes you feel worse for not being enlightened",
    ],

    valueProp:
      "Ember is a 60-second daily check-in, a 3-minute breathwork session, and a mood journal that actually helps you see patterns over time. That's it. No lectures.",

    features: [
      { icon: "🕐", title: "60-Second Check-In",  description: "One honest question. One honest answer. No judgment." },
      { icon: "🌬️", title: "3-Min Breathwork",   description: "Clinically validated techniques — adjusted to your mood that day" },
      { icon: "📈", title: "Mood Pattern Tracker", description: "See what's actually affecting your mental state — over weeks, not hours" },
    ],

    testimonials: [
      {
        quote: "Every other app made me feel guilty for not doing enough. Ember just... meets me where I am. After 60 days my anxiety is genuinely lower.",
        author: "Rachel K.",
        role: "Nurse & mum of two",
        rating: 5,
      },
    ],

    stats: [
      { value: "60s",  label: "Daily minimum commitment" },
      { value: "78%",  label: "Users report lower anxiety after 30 days" },
      { value: "4.9★", label: "App Store rating (47K reviews)" },
    ],

    trustBadges: [
      "✓ Clinically Validated Techniques",
      "✓ No Shame. No Streaks.",
      "✓ Built with licensed therapists",
    ],

    cta: {
      primary: "Try Ember Free for 30 Days",
      secondary: "No card required · cancel from the app",
      url: "ember.app/try",
    },

    offer: "30 Days Free — No Card Needed",
  },

  timing: {
    fps: 30,
    scenes: [
      {
        type: "kinetic-text",
        durationInSeconds: 4,
        transition: "scale-in",           // ← NEW: gentle scale-in, calm entrance
        props: {
          lines: [
            "You don't need",
            "45 minutes.",
            "You need one.",
          ],
          style: "drift",                 // ← slow, breathing-pace drift
          fontSize: 86,
          lineDelay: 32,
          highlightLines: [2],
        } satisfies KineticTextProps,
      },
      {
        type: "problem",
        durationInSeconds: 3.5,
        transition: "blur-in",            // ← NEW: soft blur-in for problem tension
      },
      {
        type: "solution",
        durationInSeconds: 3,
        transition: "fade",
      },
      {
        type: "timeline",
        durationInSeconds: 4.5,
        transition: "fade",               // ← calm, no drama
        props: {
          headline: "Your 60 seconds, every day.",
          stepDelay: 22,
          steps: [
            { icon: "🧡", title: "Check in",       subtitle: "One question: How are you actually feeling?",  time: "20 sec" },
            { icon: "🌬️", title: "Breathe",        subtitle: "A technique matched to your answer",           time: "3 min" },
            { icon: "📓", title: "Note one thing", subtitle: "What made today better or worse?",             time: "30 sec" },
          ],
        } satisfies TimelineProps,
      },
      {
        type: "social-proof",
        durationInSeconds: 4,
        transition: "slide-up",
      },
      {
        type: "price-reveal",
        durationInSeconds: 3.5,
        transition: "scale-in",           // ← soft reveal matches brand tone
        props: {
          originalPrice: "Therapy: £80/session",
          newPrice: "Ember: £4.99/month",
          savings: "30 days free to start",
          badge: "No Card Needed",
          subtext: "Not a replacement for therapy — a daily practice between sessions",
        } satisfies PriceRevealProps,
      },
      {
        type: "cta",
        durationInSeconds: 3.5,
        transition: "bounce-in",          // ← gentle bounce — not aggressive
      },
      {
        type: "logo-end-card",
        durationInSeconds: 2,
        transition: "fade",
      },
    ],
  },
};
