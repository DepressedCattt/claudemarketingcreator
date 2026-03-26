/**
 * Video Plate Registry
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for all AI-generated video background plates.
 *
 * HOW TO ADD A NEW PLATE:
 *   1. Generate a loopable background MP4 using the prompt templates in
 *      public/video/README.md
 *   2. Drop the file into public/video/ using the naming convention:
 *        [brand-slug]-[mood]-bg.mp4
 *   3. Add one entry to VIDEO_PLATES below
 *   4. Claude will automatically pick it up in future composition sessions
 *      (via the Cursor rule in .cursor/rules/video-plates.mdc)
 *
 * HOW TO USE IN A COMPOSITION:
 *   import { VideoPlate } from "../components/VideoPlate";
 *
 *   // Registry reference (recommended — settings pre-tuned):
 *   <VideoPlate plateId="haven-warm" scrimColor={C.bg} />
 *
 *   // Manual override (when you need full control):
 *   <VideoPlate src={staticFile("video/custom.mp4")} opacity={0.3} scrimColor="#000" scrimOpacity={0.4} />
 *
 * PLACEMENT: Always the first child inside the composition's root AbsoluteFill,
 * before any camera motion wrappers or scene Sequences.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { staticFile } from "remotion";

// ─── Registry ────────────────────────────────────────────────────────────────

export const VIDEO_PLATES = {

  // ── Salon / Beauty / Wellness ──────────────────────────────────────────────

  "haven-warm": {
    src:                staticFile("video/haven-warm-bg.mp4"),
    mood:               "warm luxury salon interior, cream and terracotta bokeh, slow camera drift",
    paletteHint:        "#FAF7F3",  // bg color to use as scrimColor
    defaultOpacity:     0.40,
    defaultScrimOpacity: 0.58,
    duration:           5,
    suitableFor:        ["HavenAd", "LumenAd", "warm-luxury-salon"],
  },

  "elume-editorial": {
    src:                staticFile("video/elume-editorial-bg.mp4"),
    mood:               "dark cinematic interior, silk drapes, gold rim light, near-black",
    paletteHint:        "#0C0A0D",
    defaultOpacity:     0.35,
    defaultScrimOpacity: 0.45,
    duration:           5,
    suitableFor:        ["ElumeAd", "dark-editorial-beauty"],
  },

  "lumen-warm": {
    src:                staticFile("video/lumen-warm-bg.mp4"),
    mood:               "warm salon interior, rose and ivory tones, soft window light bokeh",
    paletteHint:        "#FAF8F5",
    defaultOpacity:     0.40,
    defaultScrimOpacity: 0.55,
    duration:           5,
    suitableFor:        ["LumenAd", "warm-luxury-salon"],
  },

  // ── SaaS / Tech / Platform ─────────────────────────────────────────────────

  "sharedsalon-studio": {
    src:                staticFile("video/sharedsalon-studio-bg.mp4"),
    mood:               "clean professional studio, cool light, minimal, platform feel",
    paletteHint:        "#080F1E",
    defaultOpacity:     0.30,
    defaultScrimOpacity: 0.50,
    duration:           5,
    suitableFor:        ["SharedSalonAds", "platform-saas"],
  },

  "flowdesk-tech": {
    src:                staticFile("video/flowdesk-tech-bg.mp4"),
    mood:               "abstract dark blue-indigo digital environment, soft light particles drifting",
    paletteHint:        "#0A0F1E",
    defaultOpacity:     0.30,
    defaultScrimOpacity: 0.55,
    duration:           5,
    suitableFor:        ["FlowDeskAd", "saas-dark-ui"],
  },

  "meridian-dark": {
    src:                staticFile("video/meridian-dark-bg.mp4"),
    mood:               "deep dark abstract, soft glowing particles, premium SaaS atmosphere",
    paletteHint:        "#0F0B08",
    defaultOpacity:     0.28,
    defaultScrimOpacity: 0.50,
    duration:           5,
    suitableFor:        ["MeridianAd", "dark-premium-saas"],
  },

  // ── Product / Clean Studio ─────────────────────────────────────────────────

  "novaskin-studio": {
    src:                staticFile("video/novaskin-studio-bg.mp4"),
    mood:               "minimal white studio, soft diffused light, cream and grey, light caustics",
    paletteHint:        "#FAFAF8",
    defaultOpacity:     0.35,
    defaultScrimOpacity: 0.60,
    duration:           5,
    suitableFor:        ["NovaSkinAd", "clean-product-studio"],
  },

  // ── High Energy / Sports ───────────────────────────────────────────────────

  "trailblaze-energy": {
    src:                staticFile("video/trailblaze-energy-bg.mp4"),
    mood:               "motion blur streaks of electric blue and white light, dark background, high energy",
    paletteHint:        "#0A1A0A",
    defaultOpacity:     0.40,
    defaultScrimOpacity: 0.40,
    duration:           5,
    suitableFor:        ["TrailBlazeAd", "ApexAd", "high-energy-sports"],
  },

} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type VideoPlateId = keyof typeof VIDEO_PLATES;

export type VideoPlateEntry = {
  readonly src: string;
  readonly mood: string;
  readonly paletteHint: string;
  readonly defaultOpacity: number;
  readonly defaultScrimOpacity: number;
  readonly duration: number;
  readonly suitableFor: readonly string[];
};
