/**
 * Example Ad Config — Startup Marketplace
 *
 * Brand: Launchpad — a founder-to-investor matching marketplace.
 * Template: startup-explainer (full 7-scene arc)
 * Style: Dark navy + indigo/purple gradient, modern-sans typography
 *
 * This is a DEMO to show how the engine works.
 * Replace with your own brand data to generate a real ad.
 */

import { AdConfig } from "../../data/types";
import { startupExplainerScenes } from "../../templates/startupExplainerTemplate";

export const startupMarketplaceAd: AdConfig = {
  id: "launchpad-v1",
  name: "Launchpad — Startup Marketplace",
  template: "startup-explainer",
  aspectRatio: "9:16",

  brand: {
    name: "Launchpad",
    tagline: "Where founders meet capital.",
    // logoPath: "/public/images/placeholder/logo.png", // Uncomment when you have a logo
    colors: {
      primary: "#6366F1",       // Indigo
      secondary: "#8B5CF6",     // Violet
      accent: "#F59E0B",        // Amber — for CTA and highlights
      background: "#0A0A18",    // Deep navy
      text: "#FFFFFF",
      textSecondary: "#94A3B8",
    },
    typography: {
      preset: "modern-sans",
    },
  },

  media: {
    // heroImage: "/public/images/placeholder/hero.jpg",
    // appScreenshots: ["/public/images/placeholder/screenshot.jpg"],
  },

  content: {
    headline: "Stop Pitching in the Dark",
    subheadline: "Connect with investors who already fund your space",
    targetAudience: "Early-stage founders",
    painPoints: [
      "Months of cold outreach with no replies",
      "Getting rejected without any feedback",
      "Watching others close rounds through warm intros",
    ],
    valueProp:
      "Launchpad matches founders with investors who have already backed similar companies — so every intro is warm.",
    features: [
      {
        icon: "🎯",
        title: "Smart Matching",
        description: "AI pairs you with investors who fund your exact vertical and stage",
      },
      {
        icon: "🤝",
        title: "Warm Intros",
        description: "Get introduced through your network automatically",
      },
      {
        icon: "📁",
        title: "Deal Room",
        description: "Manage your entire raise in one place — data room, updates, docs",
      },
    ],
    testimonials: [
      {
        quote: "We closed our seed round in 6 weeks. I got more quality intros in a month than in 8 months of cold email.",
        author: "Sarah Chen",
        role: "Founder, FlowAI",
        rating: 5,
      },
    ],
    stats: [
      { value: "$2.4B", label: "Capital Raised" },
      { value: "3,200+", label: "Funded Startups" },
    ],
    cta: {
      primary: "Start Your Raise",
      secondary: "Free for founders",
      url: "launchpad.io",
    },
  },

  timing: {
    fps: 30,
    scenes: startupExplainerScenes,
  },
};
