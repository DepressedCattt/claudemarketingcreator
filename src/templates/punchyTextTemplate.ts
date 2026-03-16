/**
 * Template: Punchy Text Ad
 *
 * Fast, text-driven UGC-style ad. Short scenes, high energy.
 * Best for: Performance ads, organic social, TikTok/Reels creative testing.
 * Total default duration: ~13 seconds
 */

import { SceneConfig } from "../data/types";

export const punchyTextScenes: SceneConfig[] = [
  { type: "hook",         durationInSeconds: 2.5 },
  { type: "problem",      durationInSeconds: 2.5 },
  { type: "solution",     durationInSeconds: 2.5 },
  { type: "cta",          durationInSeconds: 3   },
  { type: "logo-end-card",durationInSeconds: 2   },
];
