/**
 * Composition registry — the single source of truth for all compositions
 * available in the Studio. Mirrors what's in src/Root.tsx but with
 * richer metadata (sequences, labels, format) for the timeline UI.
 */

import { PulseAd, PulseAdCues } from "@comps/PulseAd";
import { FormaAd2 }            from "@comps/FormaAd2";
import { ArcflowAd }           from "@comps/ArcflowAd";
import { CrestAd }             from "@comps/CrestAd";
import { FlowDeskAd }          from "@comps/FlowDeskAd";
import { HeroExpansionAd }     from "@comps/HeroExpansionAd";
import { KineticTypographyAd } from "@comps/KineticTypographyAd";
import { LuminaryAd }          from "@comps/LuminaryAd";
import { MeridianAd }          from "@comps/MeridianAd";
import { NovaSkinAd }          from "@comps/NovaSkinAd";
import { SolaceAd }            from "@comps/SolaceAd";
import { TrailBlazeAd }        from "@comps/TrailBlazeAd";
import { VeridianAd }          from "@comps/VeridianAd";
import type { CompMeta } from "./types";

// Sequence colours (Premiere-style clip colours)
const CLR = {
  hook:     "#0ea5e9",  // sky
  product:  "#8b5cf6",  // violet
  features: "#10b981",  // emerald
  metrics:  "#f59e0b",  // amber
  cta:      "#ef4444",  // red
  generic:  "#6366f1",  // indigo
};

export const REGISTRY: CompMeta[] = [
  // ── PulseAd ───────────────────────────────────────────────────────────────
  {
    id:               "pulse-v1",
    label:            "Pulse",
    component:        PulseAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",     from: 0,   durationInFrames: 120, color: CLR.hook     },
      { id: "s2", label: "Demo",     from: 120, durationInFrames: 120, color: CLR.product  },
      { id: "s3", label: "Features", from: 240, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Metrics",  from: 360, durationInFrames: 60,  color: CLR.metrics  },
      { id: "s5", label: "CTA",      from: 420, durationInFrames: 120, color: CLR.cta      },
    ],
    cues: PulseAdCues,
  },

  // ── FormaAd2 ─────────────────────────────────────────────────────────────
  {
    id:               "forma2-v1",
    label:            "FormaAd 2",
    component:        FormaAd2,
    durationInFrames: 519,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",     from: 0,   durationInFrames: 112, color: CLR.hook     },
      { id: "s2", label: "Product",  from: 90,  durationInFrames: 162, color: CLR.product  },
      { id: "s3", label: "Features", from: 217, durationInFrames: 128, color: CLR.features },
      { id: "s4", label: "Metrics",  from: 331, durationInFrames: 112, color: CLR.metrics  },
      { id: "s5", label: "CTA",      from: 427, durationInFrames: 92,  color: CLR.cta      },
    ],
  },

  // ── ArcflowAd ─────────────────────────────────────────────────────────────
  {
    id:               "arcflow",
    label:            "Arcflow",
    component:        ArcflowAd,
    durationInFrames: 600,
    fps:              30,
    width:            1920,
    height:           1080,
    format:           "16:9",
    defaultProps:     {},
  },

  // ── CrestAd ───────────────────────────────────────────────────────────────
  {
    id:               "crest",
    label:            "Crest",
    component:        CrestAd,
    durationInFrames: 450,
    fps:              30,
    width:            1920,
    height:           1080,
    format:           "16:9",
    defaultProps:     {},
  },

  // ── FlowDeskAd ────────────────────────────────────────────────────────────
  {
    id:               "flowdesk",
    label:            "FlowDesk",
    component:        FlowDeskAd,
    durationInFrames: 450,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
  },

  // ── HeroExpansionAd ───────────────────────────────────────────────────────
  {
    id:               "hero-expansion",
    label:            "Hero Expansion",
    component:        HeroExpansionAd,
    durationInFrames: 300,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
  },

  // ── KineticTypographyAd ───────────────────────────────────────────────────
  {
    id:               "kinetic-type",
    label:            "Kinetic Type",
    component:        KineticTypographyAd,
    durationInFrames: 300,
    fps:              30,
    width:            1920,
    height:           1080,
    format:           "16:9",
    defaultProps:     {},
  },

  // ── LuminaryAd ────────────────────────────────────────────────────────────
  {
    id:               "luminary",
    label:            "Luminary",
    component:        LuminaryAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
  },

  // ── MeridianAd ────────────────────────────────────────────────────────────
  {
    id:               "meridian",
    label:            "Meridian",
    component:        MeridianAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
  },

  // ── NovaSkinAd ────────────────────────────────────────────────────────────
  {
    id:               "nova-skin",
    label:            "Nova Skin",
    component:        NovaSkinAd,
    durationInFrames: 450,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
  },

  // ── SolaceAd ──────────────────────────────────────────────────────────────
  {
    id:               "solace",
    label:            "Solace",
    component:        SolaceAd,
    durationInFrames: 450,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
  },

  // ── TrailBlazeAd ──────────────────────────────────────────────────────────
  {
    id:               "trailblaze",
    label:            "TrailBlaze",
    component:        TrailBlazeAd,
    durationInFrames: 450,
    fps:              30,
    width:            1920,
    height:           1080,
    format:           "16:9",
    defaultProps:     {},
  },

  // ── VeridianAd ────────────────────────────────────────────────────────────
  {
    id:               "veridian",
    label:            "Veridian",
    component:        VeridianAd,
    durationInFrames: 450,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
  },
];

export function getComp(id: string): CompMeta | undefined {
  return REGISTRY.find((c) => c.id === id);
}
