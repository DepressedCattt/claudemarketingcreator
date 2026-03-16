/**
 * Template: Local Service Offer
 *
 * Warm, benefit-driven, offer-forward. Trust signals and CTA.
 * Best for: Cleaning, landscaping, home services, gyms, clinics, restaurants.
 * Total default duration: ~15 seconds
 */

import { SceneConfig } from "../data/types";

export const localServiceScenes: SceneConfig[] = [
  { type: "hook",         durationInSeconds: 3   },
  { type: "problem",      durationInSeconds: 3   },
  { type: "solution",     durationInSeconds: 3   },
  { type: "social-proof", durationInSeconds: 3   },
  { type: "cta",          durationInSeconds: 3   },
];
