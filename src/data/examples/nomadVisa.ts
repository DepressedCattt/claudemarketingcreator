/**
 * Nomad — Ad: "The Life You Keep Postponing"
 *
 * Brand: Nomad — a digital nomad visa & relocation concierge service.
 * Tone: Slow burn to a gut-punch. Aspirational but with an edge of guilt.
 *       Speaks to the person who has been "thinking about it" for 2 years.
 *
 * Scene sequence:
 *   kinetic-text   → drift style open — the thought everyone has had
 *   split-reveal   → trapped office life vs working from Lisbon
 *   timeline       → exactly how Nomad gets you there (visa → move → thrive)
 *   counter-reveal → proof of concept — numbers from their community
 *   kinetic-text   → the gut-punch close — "You've been saying next year."
 *   cta            → apply now, limited spots
 *   logo-end-card  → Nomad holds
 *
 * Total: ~23 seconds
 */

import {
  AdConfig,
  KineticTextProps,
  SplitRevealProps,
  TimelineProps,
  CounterRevealProps,
} from "../../data/types";

export const nomadVisaAd: AdConfig = {
  id: "nomad-visa-v1",
  name: "Nomad — The Life You Keep Postponing",
  template: "minimalist-founder",
  aspectRatio: "9:16",

  brand: {
    name: "Nomad",
    tagline: "Live where you want. Work from anywhere.",
    colors: {
      primary: "#D97706",      // Amber-600 — warm, sunset, travel
      secondary: "#92400E",    // Amber-800 — rich earth
      accent: "#FDE68A",       // Amber-200 — golden light
      background: "#0C0A06",   // Warm near-black
      text: "#FFFBEB",         // Amber-50 — warm white
      textSecondary: "#FCD34D", // Amber-300 — warm secondary
    },
    typography: {
      preset: "editorial",
    },
  },

  media: {},

  content: {
    headline: "The Life You Keep Postponing Starts Here.",
    subheadline: "Nomad handles your digital nomad visa, relocation logistics, and community — so you can just go.",
    targetAudience: "Remote workers, freelancers & location-independent professionals",

    painPoints: [
      "Drowning in visa paperwork you don't understand",
      "No idea where to start with banking, tax, or housing abroad",
      "\"I'll do it next year\" — and it never happens",
    ],

    valueProp:
      "Nomad is your full-stack relocation partner. We handle the visa, the bank account, the tax advice and the community — you just pick the country.",

    features: [
      {
        icon: "🛂",
        title: "Visa Handled End-to-End",
        description: "We prepare, submit and track every document. Approval guaranteed or full refund.",
      },
      {
        icon: "🏦",
        title: "Banking & Tax Setup",
        description: "Local bank account + expat tax guidance sorted before you land",
      },
      {
        icon: "🌍",
        title: "47 Countries Available",
        description: "Portugal, UAE, Thailand, Mexico and 43 more — you choose, we execute",
      },
    ],

    testimonials: [
      {
        quote: "I'd been 'planning' to move abroad for three years. Nomad had my Portuguese D8 visa approved in 6 weeks. I'm writing this from a café in Lisbon.",
        author: "Alex Mercer",
        role: "UX Designer → Lisbon, Portugal",
        rating: 5,
      },
    ],

    stats: [
      { value: "4,200", label: "Nomads Relocated" },
      { value: "47",    label: "Countries Available" },
      { value: "6wks",  label: "Avg. Visa Approval Time" },
    ],

    cta: {
      primary: "Apply Now — Limited Spots",
      secondary: "Free 15-min call with a relocation advisor",
      url: "gonmad.co/apply",
    },

    offer: "First Month Free with Annual Plan",
  },

  timing: {
    fps: 30,
    scenes: [
      // ── 1. Drift open — the thought everyone's had ────────────────────────
      {
        type: "kinetic-text",
        durationInSeconds: 4,
        props: {
          lines: [
            "What if you just",
            "packed up",
            "and went?",
          ],
          style: "drift",
          fontSize: 88,
          lineDelay: 30,
          highlightLines: [2],
        } satisfies KineticTextProps,
      },

      // ── 2. Split reveal — office prison vs Lisbon café ────────────────────
      {
        type: "split-reveal",
        durationInSeconds: 4,
        props: {
          splitFrame: 22,
          leftLabel: "Right now",
          leftText: "Same desk. Same commute. Same view.",
          leftEmoji: "🏢",
          rightLabel: "After Nomad",
          rightText: "Same work. Different country. Your rules.",
          rightEmoji: "🌅",
        } satisfies SplitRevealProps,
      },

      // ── 3. Timeline — exactly how it works ───────────────────────────────
      {
        type: "timeline",
        durationInSeconds: 5,
        props: {
          headline: "We do the hard part.",
          stepDelay: 22,
          steps: [
            {
              icon: "📋",
              title: "Pick your country",
              subtitle: "We match you to the best visa for your income & lifestyle",
              time: "Day 1",
            },
            {
              icon: "📁",
              title: "We prepare everything",
              subtitle: "Documents, translations, applications — fully handled",
              time: "Weeks 1–4",
            },
            {
              icon: "✈️",
              title: "You land. We're there.",
              subtitle: "Local SIM, bank account, tax setup — done before you arrive",
              time: "Week 6",
            },
          ],
        } satisfies TimelineProps,
      },

      // ── 4. Counter reveal — community proof ───────────────────────────────
      {
        type: "counter-reveal",
        durationInSeconds: 3.5,
        props: {
          headline: "4,200 people stopped waiting.",
          startDelay: 10,
          countDuration: 52,
          counters: [
            { from: 0, to: 4200, suffix: "",     label: "Nomads relocated" },
            { from: 0, to: 47,   suffix: "",     label: "Countries available" },
            { from: 0, to: 6,    suffix: " wks", label: "Avg. visa approval" },
          ],
        } satisfies CounterRevealProps,
      },

      // ── 5. Gut-punch kinetic close ────────────────────────────────────────
      {
        type: "kinetic-text",
        durationInSeconds: 3,
        props: {
          lines: [
            "You've been saying",
            "next year",
            "for 3 years.",
          ],
          style: "slam",
          fontSize: 84,
          lineDelay: 22,
          highlightLines: [1],
        } satisfies KineticTextProps,
      },

      // ── 6. CTA ────────────────────────────────────────────────────────────
      { type: "cta", durationInSeconds: 3.5 },

      // ── 7. Logo holds ─────────────────────────────────────────────────────
      { type: "logo-end-card", durationInSeconds: 2 },
    ],
  },
};
