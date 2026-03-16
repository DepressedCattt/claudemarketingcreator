/**
 * Template: Startup Explainer
 *
 * Full story arc — hook → problem → solution → features → proof → CTA → logo.
 * Best for: SaaS, marketplaces, investor-facing content, Series A–B brands.
 * Total default duration: ~22 seconds
 */

import { SceneConfig } from "../data/types";

export const startupExplainerScenes: SceneConfig[] = [
  { type: "hook",         durationInSeconds: 3   },
  { type: "problem",      durationInSeconds: 3.5 },
  { type: "solution",     durationInSeconds: 3   },
  { type: "feature",      durationInSeconds: 4   },
  { type: "social-proof", durationInSeconds: 3.5 },
  { type: "cta",          durationInSeconds: 3   },
  { type: "logo-end-card",durationInSeconds: 2   },
];
