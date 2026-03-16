/**
 * SharedSalon — Ad v3: "The Freedom Story"
 *
 * Angle: The best stylists work for themselves — not for a lease.
 * Tone: Aspirational, cinematic, empowering.
 *
 * Custom scene sequence using new animation types:
 *   kinetic-text   → hook — drifting lines, editorial feel
 *   split-reveal   → before/after: cramped lease vs open freedom
 *   timeline       → how it works — 3 steps, each under 60 seconds
 *   social-proof   → testimonial + stats
 *   kinetic-text   → second kinetic moment — brand promise as CTA build-up
 *   cta            → confident close — "Your chair is waiting"
 *   logo-end-card  → brand holds
 *
 * Total: ~22 seconds
 */

import {
  AdConfig,
  KineticTextProps,
  SplitRevealProps,
  TimelineProps,
} from "../../data/types";

export const sharedSalonFreedomAd: AdConfig = {
  id: "sharedsalon-freedom-v1",
  name: "SharedSalon — The Freedom Story",
  template: "minimalist-founder",
  aspectRatio: "9:16",

  brand: {
    name: "SharedSalon",
    tagline: "Work where you want. Earn what you deserve.",
    colors: {
      primary: "#0EA5E9",      // Sky-500 — open, airy
      secondary: "#0284C7",    // Sky-600
      accent: "#E0F2FE",       // Sky-100 — near-white, clean
      background: "#040D1A",   // Midnight navy
      text: "#F0F9FF",         // Sky-50 — warm white
      textSecondary: "#7DD3FC", // Sky-300 — airy secondary
    },
    typography: {
      preset: "editorial",
    },
  },

  media: {},

  content: {
    headline: "The Best Stylists Work For Themselves.",
    subheadline: "You built the skills. You built the clients. Now work on your own terms.",
    targetAudience: "Independent beauty professionals",

    painPoints: [
      "Long-term leases that chain you to one postcode",
      "Salon owners taking a cut of clients you brought yourself",
      "Zero flexibility when life — or your clients — move",
    ],

    valueProp:
      "SharedSalon is the network of professional salon spaces that moves with you. Book the right chair, in the right neighbourhood, whenever your clients need you.",

    features: [
      {
        icon: "🗺️",
        title: "Work Across the City",
        description: "Follow your clients — not the other way around",
      },
      {
        icon: "🧾",
        title: "Keep Everything You Earn",
        description: "No revenue splits — just an hourly space fee",
      },
      {
        icon: "🌟",
        title: "Premium Vetted Spaces",
        description: "Every salon is quality-checked — show up somewhere you're proud of",
      },
    ],

    testimonials: [
      {
        quote: "I finally feel like I run my own business. Different city every week, premium spaces, zero drama. This is the future of our industry.",
        author: "Sasha Okafor",
        role: "Independent Stylist, Manchester",
        rating: 5,
      },
    ],

    stats: [
      { value: "2,800+", label: "Premium Spaces" },
      { value: "40+",    label: "Cities" },
      { value: "4.9★",   label: "Host Rating" },
    ],

    trustBadges: [
      "✓ Fully Vetted Hosts",
      "✓ Liability Cover Included",
      "✓ No Long-Term Commitment",
    ],

    cta: {
      primary: "Your Chair Is Waiting.",
      secondary: "Book in under 60 seconds · cancel anytime",
      url: "sharedsalon.app",
    },

    offer: "First Booking 50% Off",
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. Kinetic open — editorial drift, identity-first ────────────────
      {
        type: "kinetic-text",
        durationInSeconds: 4,
        props: {
          lines: [
            "You built the skills.",
            "You built the clients.",
            "Now work on",
            "your own terms.",
          ],
          style: "drift",
          fontSize: 78,
          lineDelay: 26,
          highlightLines: [3],
        } satisfies KineticTextProps,
      },

      // ── 2. Split reveal — lease prison vs total freedom ──────────────────
      {
        type: "split-reveal",
        durationInSeconds: 4,
        props: {
          splitFrame: 18,
          leftLabel: "The old way",
          leftText: "One salon. One postcode. Someone else's rules.",
          leftEmoji: "🔒",
          rightLabel: "SharedSalon",
          rightText: "Any chair. Any neighbourhood. Your schedule.",
          rightEmoji: "🗺️",
        } satisfies SplitRevealProps,
      },

      // ── 3. Timeline — how it works in 3 steps ────────────────────────────
      {
        type: "timeline",
        durationInSeconds: 4.5,
        props: {
          headline: "Up and running in minutes.",
          stepDelay: 20,
          steps: [
            {
              icon: "📍",
              title: "Find a chair near your client",
              subtitle: "Filter by price, amenities & availability",
              time: "30 sec",
            },
            {
              icon: "⚡",
              title: "Book it instantly",
              subtitle: "No calls. No emails. Live availability 24/7",
              time: "10 sec",
            },
            {
              icon: "✂️",
              title: "Show up and work",
              subtitle: "Walk in ready to go. Walk out with every penny",
              time: "Your schedule",
            },
          ],
        } satisfies TimelineProps,
      },

      // ── 4. Social proof — real voice + credibility stats ─────────────────
      {
        type: "social-proof",
        durationInSeconds: 4,
      },

      // ── 5. Second kinetic hit — brand promise hammers home ───────────────
      {
        type: "kinetic-text",
        durationInSeconds: 3,
        props: {
          lines: ["Your chair", "is waiting."],
          style: "slam",
          fontSize: 110,
          lineDelay: 28,
          highlightLines: [],
        } satisfies KineticTextProps,
      },

      // ── 6. CTA — confident, not desperate ────────────────────────────────
      {
        type: "cta",
        durationInSeconds: 3.5,
      },

      // ── 7. Logo holds — let the brand sit ────────────────────────────────
      {
        type: "logo-end-card",
        durationInSeconds: 2.5,
      },
    ],
  },
};
