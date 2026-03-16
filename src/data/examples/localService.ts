/**
 * Example Ad Config — Local Service Business
 *
 * Brand: CleanPro — a professional home cleaning service.
 * Template: local-service (5-scene, offer-forward)
 * Style: Emerald green + white, warm and trustworthy
 *
 * This is a DEMO to show how the engine works.
 * Replace with your own brand data to generate a real ad.
 */

import { AdConfig } from "../../data/types";
import { localServiceScenes } from "../../templates/localServiceTemplate";

export const localServiceAd: AdConfig = {
  id: "cleanpro-v1",
  name: "CleanPro — Local Cleaning Service",
  template: "local-service",
  aspectRatio: "9:16",

  brand: {
    name: "CleanPro",
    tagline: "Your home, spotless.",
    colors: {
      primary: "#059669",       // Emerald
      secondary: "#10B981",     // Lighter emerald
      accent: "#F59E0B",        // Amber — for CTA
      background: "#FFFFFF",    // White — warm local feel
      text: "#111827",          // Near-black
      textSecondary: "#6B7280",
    },
    typography: {
      preset: "modern-sans",
    },
  },

  media: {
    // heroImage: "/public/images/placeholder/hero.jpg",
  },

  content: {
    headline: "Spotless Home. Zero Stress.",
    subheadline: "Professional cleaning in your neighborhood — same-day booking",
    targetAudience: "Homeowners",
    painPoints: [
      "Spending your weekend scrubbing instead of living",
      "Unreliable cleaners who cancel last minute",
      "No time but guests arriving Friday",
    ],
    valueProp:
      "Vetted, insured local cleaners available today. Book in 60 seconds. Happiness guaranteed.",
    features: [
      {
        icon: "⚡",
        title: "Same-Day Booking",
        description: "Book a slot in under 60 seconds, same day available",
      },
      {
        icon: "🛡️",
        title: "Vetted & Insured",
        description: "Every cleaner is background-checked and fully insured",
      },
      {
        icon: "✅",
        title: "Happiness Guarantee",
        description: "Not happy? We come back and clean again for free",
      },
    ],
    testimonials: [
      {
        quote: "Booked at 9am, they were at my house by 1pm. Absolutely spotless. I'll never clean my own home again.",
        author: "Jamie R.",
        role: "Homeowner, Austin TX",
        rating: 5,
      },
    ],
    stats: [
      { value: "10,000+", label: "Happy Homes" },
      { value: "4.9★",    label: "Average Rating" },
    ],
    trustBadges: ["✓ Background Checked", "✓ Fully Insured", "✓ Same-Day Available"],
    cta: {
      primary: "Book Your Clean",
      secondary: "$20 off your first booking",
      url: "cleanpro.com",
    },
    offer: "$20 Off Your First Clean",
  },

  timing: {
    fps: 30,
    scenes: localServiceScenes,
  },
};
