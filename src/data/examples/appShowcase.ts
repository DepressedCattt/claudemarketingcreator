/**
 * Example Ad Config — Mobile App Showcase
 *
 * Brand: Tempo — a science-based habit tracking app.
 * Template: product-ui-showcase (5-scene, UI-forward)
 * Style: Dark with electric blue + pink accent, modern-sans
 *
 * This is a DEMO to show how the engine works.
 * Replace with your own brand data to generate a real ad.
 */

import { AdConfig } from "../../data/types";
import { productUIScenes } from "../../templates/productUITemplate";

export const appShowcaseAd: AdConfig = {
  id: "tempo-v1",
  name: "Tempo — App Showcase",
  template: "product-ui-showcase",
  aspectRatio: "9:16",

  brand: {
    name: "Tempo",
    tagline: "Build habits that actually stick.",
    colors: {
      primary: "#3B82F6",       // Blue
      secondary: "#1D4ED8",     // Darker blue
      accent: "#EC4899",        // Pink — for CTA pop
      background: "#080812",    // Near-black
      text: "#FFFFFF",
      textSecondary: "#9CA3AF",
    },
    typography: {
      preset: "modern-sans",
    },
  },

  media: {
    // Add real screenshots here when available:
    // appScreenshots: [
    //   "/public/images/tempo/screen-dashboard.jpg",
    //   "/public/images/tempo/screen-streak.jpg",
    // ],
  },

  content: {
    headline: "Finally. Habits That Last.",
    subheadline: "Science-backed streaks that actually work — for real this time",
    valueProp:
      "Tempo uses behavioral science to personalize your habits and keep you coming back — 89% of users hit 30-day streaks.",
    features: [
      {
        icon: "🧠",
        title: "Personalized Timing",
        description: "Smart reminders based on your patterns, not generic pings",
      },
      {
        icon: "🔥",
        title: "Streak Science",
        description: "Motivation system proven to cut quitting rates by 60%",
      },
      {
        icon: "📈",
        title: "Progress Insights",
        description: "See exactly why your habits are (or aren't) sticking",
      },
    ],
    testimonials: [
      {
        quote: "Tempo is the only habit app that actually worked for me. 90-day streak and counting.",
        author: "Marcus T.",
        role: "Product Designer",
        rating: 5,
      },
    ],
    stats: [
      { value: "500K+", label: "Daily Users" },
      { value: "89%",   label: "30-Day Retention" },
    ],
    cta: {
      primary: "Download Free",
      secondary: "iOS & Android",
      url: "tempoapp.io",
    },
  },

  timing: {
    fps: 30,
    scenes: productUIScenes,
  },
};
