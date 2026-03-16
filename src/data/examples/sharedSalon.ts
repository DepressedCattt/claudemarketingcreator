/**
 * Example Ad Config — SharedSalon
 *
 * Brand: SharedSalon — a marketplace for freelance stylists, barbers,
 *        and beauty pros to rent salon chairs and booths by the hour or day.
 * Template: startup-explainer (full 7-scene arc)
 * Style: Deep navy + electric blue, modern-sans, professional
 */

import { AdConfig } from "../../data/types";
import { startupExplainerScenes } from "../../templates/startupExplainerTemplate";

export const sharedSalonAd: AdConfig = {
  id: "sharedsalon-v1",
  name: "SharedSalon — Salon Rental for Freelancers",
  template: "startup-explainer",
  aspectRatio: "9:16",

  brand: {
    name: "SharedSalon",
    tagline: "Your chair. Your clients. Your rules.",
    colors: {
      primary: "#2563EB",      // Blue-600
      secondary: "#1D4ED8",    // Blue-700 — depth for gradients
      accent: "#38BDF8",       // Sky-400 — fresh pop on CTAs & highlights
      background: "#080F1E",   // Deep navy — premium, focused
      text: "#FFFFFF",
      textSecondary: "#93C5FD", // Blue-300 — soft contrast on dark
    },
    typography: {
      preset: "modern-sans",
    },
  },

  media: {
    // heroImage: "/public/images/sharedsalon/salon-interior.jpg",
    // productImages: ["/public/images/sharedsalon/stylist-working.jpg"],
  },

  content: {
    headline: "Stop Paying for Space You Don't Use",
    subheadline: "Rent a professional salon chair — by the hour, day, or week",
    targetAudience: "Freelance stylists, barbers & beauty pros",

    painPoints: [
      "Locked into expensive long-term leases you can't fill",
      "Working from home feels unprofessional and kills referrals",
      "Good salon space books out — and you're always last to know",
    ],

    valueProp:
      "SharedSalon connects independent beauty pros with verified salon chairs across your city. Book instantly, show up, work. No lease. No drama.",

    features: [
      {
        icon: "📍",
        title: "Book Near Your Clients",
        description: "Find chairs in your neighbourhood — filter by amenities, price & availability",
      },
      {
        icon: "⚡",
        title: "Instant Confirmation",
        description: "No back-and-forth — seats are live and bookable 24/7",
      },
      {
        icon: "💼",
        title: "Bring Your Own Clientele",
        description: "Your bookings, your income, your brand — we just provide the space",
      },
    ],

    testimonials: [
      {
        quote: "I went from a $3,000/month lease I barely filled to paying only for the days I actually work. My take-home doubled.",
        author: "Dani Reeves",
        role: "Freelance Colorist, Miami FL",
        rating: 5,
      },
    ],

    stats: [
      { value: "2,800+", label: "Verified Salon Chairs" },
      { value: "4.8★",   label: "Average Host Rating" },
    ],

    trustBadges: [
      "✓ Verified Hosts",
      "✓ Liability Coverage Included",
      "✓ Cancel Anytime",
    ],

    cta: {
      primary: "Find a Chair Today",
      secondary: "First booking 50% off",
      url: "sharedsalon.app",
    },

    offer: "50% Off Your First Booking",
  },

  timing: {
    fps: 30,
    scenes: startupExplainerScenes,
  },
};
