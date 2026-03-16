/**
 * AD ENGINE — Typography Utilities
 *
 * Font scale and font family definitions for each typography preset.
 * Components import getTypography() and use the returned scale object.
 */

import { TypographyPreset } from "../data/types";

/** Full typography scale — all size and family values for a preset */
export interface TypographyScale {
  /** Very large display size — hero moments */
  display: number;
  /** Standard headline size — primary scene text */
  headline: number;
  /** Supporting headline — subheadline, section titles */
  subheadline: number;
  /** Body copy */
  body: number;
  /** Small supporting text, captions */
  caption: number;
  /** Headline / display font family string */
  headlineFont: string;
  /** Body / supporting font family string */
  bodyFont: string;
  /** Headline font weight */
  headlineWeight: number;
  /** Body font weight */
  bodyWeight: number;
  /** Letter spacing for headlines */
  headlineLetterSpacing: string;
  /** Line height for headlines */
  headlineLineHeight: number;
}

// ─── Preset Definitions ───────────────────────────────────────────────────────

export const TYPOGRAPHY_PRESETS: Record<TypographyPreset, TypographyScale> = {
  // ── Original 4 ────────────────────────────────────────────────────────────

  /**
   * Modern Sans — clean startup aesthetic
   * Feels like Notion, Linear, Vercel
   */
  "modern-sans": {
    display: 96,
    headline: 68,
    subheadline: 40,
    body: 30,
    caption: 22,
    headlineFont: "Inter, system-ui, -apple-system, sans-serif",
    bodyFont: "Inter, system-ui, -apple-system, sans-serif",
    headlineWeight: 800,
    bodyWeight: 400,
    headlineLetterSpacing: "-0.025em",
    headlineLineHeight: 1.05,
  },

  /**
   * Editorial — premium serif headlines, clean sans body
   * Feels like NYT, Vogue, editorial fashion brands
   */
  editorial: {
    display: 104,
    headline: 76,
    subheadline: 44,
    body: 30,
    caption: 24,
    headlineFont: "Georgia, 'Times New Roman', serif",
    bodyFont: "Inter, system-ui, sans-serif",
    headlineWeight: 700,
    bodyWeight: 400,
    headlineLetterSpacing: "-0.01em",
    headlineLineHeight: 1.1,
  },

  /**
   * Bold Impact — high-energy punchy advertising
   * Feels like sports brands, aggressive DTC ads
   */
  "bold-impact": {
    display: 112,
    headline: 84,
    subheadline: 48,
    body: 32,
    caption: 26,
    headlineFont: "'Arial Black', Impact, 'Haettenschweiler', sans-serif",
    bodyFont: "Arial, Helvetica, sans-serif",
    headlineWeight: 900,
    bodyWeight: 700,
    headlineLetterSpacing: "-0.02em",
    headlineLineHeight: 1.0,
  },

  /**
   * Clean Minimal — understated luxury
   * Feels like Apple, high-end lifestyle brands
   */
  "clean-minimal": {
    display: 88,
    headline: 64,
    subheadline: 38,
    body: 28,
    caption: 22,
    headlineFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    bodyFont: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    headlineWeight: 300,
    bodyWeight: 300,
    headlineLetterSpacing: "0.02em",
    headlineLineHeight: 1.15,
  },

  // ── New 6 ─────────────────────────────────────────────────────────────────

  /**
   * Futurist — Courier monospace, technical & uncompromising
   * Feels like a terminal, crypto brand, or hard-tech startup
   * Character: every letter is deliberate. Cold precision.
   */
  futurist: {
    display: 86,
    headline: 62,
    subheadline: 36,
    body: 26,
    caption: 20,
    headlineFont: "'Courier New', 'Lucida Console', monospace",
    bodyFont: "'Courier New', 'Lucida Console', monospace",
    headlineWeight: 700,
    bodyWeight: 400,
    headlineLetterSpacing: "0.04em",
    headlineLineHeight: 1.08,
  },

  /**
   * Luxury — ultra-light serif, vast letter spacing
   * Feels like Bottega Veneta, Aesop, Glossier
   * Character: expensive silence. Nothing shouts.
   */
  luxury: {
    display: 80,
    headline: 58,
    subheadline: 34,
    body: 26,
    caption: 20,
    headlineFont: "Georgia, Palatino, 'Book Antiqua', serif",
    bodyFont: "'Helvetica Neue', Helvetica, sans-serif",
    headlineWeight: 400,
    bodyWeight: 300,
    headlineLetterSpacing: "0.08em",
    headlineLineHeight: 1.2,
  },

  /**
   * Condensed — tall narrow text, maximum information density
   * Feels like a newspaper header, Bloomberg terminal, financial data
   * Character: authoritative. Built for speed-readers.
   */
  condensed: {
    display: 110,
    headline: 82,
    subheadline: 50,
    body: 32,
    caption: 24,
    headlineFont: "Trebuchet MS, 'Arial Narrow', Arial, sans-serif",
    bodyFont: "Trebuchet MS, Arial, sans-serif",
    headlineWeight: 900,
    bodyWeight: 600,
    headlineLetterSpacing: "-0.01em",
    headlineLineHeight: 0.95,
  },

  /**
   * Rounded — Verdana-based, soft and approachable
   * Feels like Duolingo, Notion, friendly consumer apps
   * Character: warm, inclusive, zero intimidation.
   */
  rounded: {
    display: 90,
    headline: 66,
    subheadline: 40,
    body: 28,
    caption: 22,
    headlineFont: "Verdana, Geneva, Tahoma, sans-serif",
    bodyFont: "Verdana, Geneva, Tahoma, sans-serif",
    headlineWeight: 700,
    bodyWeight: 400,
    headlineLetterSpacing: "-0.01em",
    headlineLineHeight: 1.1,
  },

  /**
   * Retro Slab — bold Georgia, warm nostalgia
   * Feels like a 1970s brand, Americana, trusted institution
   * Character: dependable, warm, has been around longer than you.
   */
  "retro-slab": {
    display: 98,
    headline: 72,
    subheadline: 42,
    body: 30,
    caption: 22,
    headlineFont: "Georgia, 'Times New Roman', serif",
    bodyFont: "Georgia, 'Times New Roman', serif",
    headlineWeight: 900,
    bodyWeight: 700,
    headlineLetterSpacing: "0.01em",
    headlineLineHeight: 1.05,
  },

  /**
   * Technical — wide-tracked monospace, data-forward
   * Feels like a live dashboard, SaaS metrics, medical device
   * Character: dispassionate precision. The numbers speak.
   */
  technical: {
    display: 80,
    headline: 58,
    subheadline: 34,
    body: 24,
    caption: 18,
    headlineFont: "'Courier New', monospace",
    bodyFont: "'Courier New', monospace",
    headlineWeight: 700,
    bodyWeight: 400,
    headlineLetterSpacing: "0.12em",
    headlineLineHeight: 1.15,
  },
};

// ─── Accessor ─────────────────────────────────────────────────────────────────

/** Get the typography scale for a given preset */
export function getTypography(preset: TypographyPreset): TypographyScale {
  return TYPOGRAPHY_PRESETS[preset];
}
