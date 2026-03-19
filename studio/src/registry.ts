/**
 * Composition registry — the single source of truth for all compositions
 * available in the Studio. Mirrors what's in src/Root.tsx but with
 * richer metadata (sequences, labels, format) for the timeline UI.
 */

import { PulseAd, PulseAdCues } from "@comps/PulseAd";
import { ApexAd, ApexAdCues }  from "@comps/ApexAd";
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
import { VelourAd }           from "@comps/VelourAd";
import { BloomAd }            from "@comps/BloomAd";
import { MaisonCielAd }       from "@comps/MaisonCielAd";
import { ElumeAd }            from "@comps/ElumeAd";
import { HavenAd }            from "@comps/HavenAd";
import { LumenAd }            from "@comps/LumenAd";
import { AuraSalonAd }       from "@comps/AuraSalonAd";
import { SeriAd }            from "@comps/SeriAd";
import { Dimension3DAd }     from "@comps/Dimension3DAd";
import { IPhoneAd }          from "@comps/IPhoneAd";
import { SharedSalonFinalAd } from "@comps/SharedSalonFinalAd";
import { SharedSalonOneShot }    from "@comps/SharedSalonOneShot";
import { SharedSalonKineticAd }  from "@comps/SharedSalonKineticAd";
import { SharedSalonCinemaAd }   from "@comps/SharedSalonCinemaAd";
import { CinemaRevealAd }        from "@comps/CinemaRevealAd";
import { AwesomeAd }             from "@comps/AwesomeAd";
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
  // ── ApexAd ────────────────────────────────────────────────────────────────
  {
    id:               "apex-v1",
    label:            "Apex — Close faster.",
    component:        ApexAd,
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
    cues: ApexAdCues,
  },

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

  // ── Beauty Industry Ads ───────────────────────────────────────────────────

  // ── VelourAd ─────────────────────────────────────────────────────────────
  {
    id:               "velour-v1",
    label:            "Velour — Cut above the rest.",
    component:        VelourAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",     from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Booking",  from: 90,  durationInFrames: 150, color: CLR.product  },
      { id: "s3", label: "Services", from: 240, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Proof",    from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "CTA",      from: 450, durationInFrames: 90,  color: CLR.cta      },
    ],
  },

  // ── BloomAd ──────────────────────────────────────────────────────────────
  {
    id:               "bloom-v1",
    label:            "Bloom — Where nature becomes art.",
    component:        BloomAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",        from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Arrangement", from: 90,  durationInFrames: 150, color: CLR.product  },
      { id: "s3", label: "Services",    from: 240, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Proof",       from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "CTA",         from: 450, durationInFrames: 90,  color: CLR.cta      },
    ],
  },

  // ── MaisonCielAd ─────────────────────────────────────────────────────────
  {
    id:               "maison-ciel-v1",
    label:            "Maison Ciel — Style is a language.",
    component:        MaisonCielAd,
    durationInFrames: 540,
    fps:              30,
    width:            1920,
    height:           1080,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",       from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Collection", from: 90,  durationInFrames: 150, color: CLR.product  },
      { id: "s3", label: "Features",   from: 240, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Editorial",  from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "CTA",        from: 450, durationInFrames: 90,  color: CLR.cta      },
    ],
  },

  // ── Beauty Salon — Three New Ads ─────────────────────────────────────────

  // ── ElumeAd ──────────────────────────────────────────────────────────────
  {
    id:               "elume-v1",
    label:            "Élume — You were meant to shine.",
    component:        ElumeAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",           from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Transformation", from: 90,  durationInFrames: 150, color: CLR.product  },
      { id: "s3", label: "Services",       from: 240, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Social Proof",   from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "CTA",            from: 450, durationInFrames: 90,  color: CLR.cta      },
    ],
  },

  // ── HavenAd ──────────────────────────────────────────────────────────────
  {
    id:               "haven-v1",
    label:            "Haven — Your chair is waiting.",
    component:        HavenAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",         from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Consultation", from: 90,  durationInFrames: 150, color: CLR.product  },
      { id: "s3", label: "Moments",      from: 240, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Trust",        from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "CTA",          from: 450, durationInFrames: 90,  color: CLR.cta      },
    ],
  },

  // ── LumenAd ──────────────────────────────────────────────────────────────
  {
    id:               "lumen-v1",
    label:            "Lumen — The full experience. (Kinetic)",
    component:        LumenAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Arrival",    from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Detail",     from: 90,  durationInFrames: 150, color: CLR.product  },
      { id: "s3", label: "Craft",      from: 240, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Confidence", from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "CTA",        from: 450, durationInFrames: 90,  color: CLR.cta      },
    ],
  },

  // ── SeriAd ────────────────────────────────────────────────────────────────
  {
    id:               "seri-v1",
    label:            "Seri — Your best self begins here. (Motion Design)",
    component:        SeriAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Opening",   from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Salon",     from: 90,  durationInFrames: 135, color: CLR.product  },
      { id: "s3", label: "Tools",     from: 225, durationInFrames: 135, color: CLR.features },
      { id: "s4", label: "Transform", from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "CTA",       from: 450, durationInFrames: 90,  color: CLR.cta      },
    ],
  },

  // ── IPhoneAd ──────────────────────────────────────────────────────────────
  {
    id:               "iphone-v1",
    label:            "iPhone 17 Pro — The most personal device.",
    component:        IPhoneAd,
    durationInFrames: 450,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Dark Reveal",  from: 0,   durationInFrames: 30,  color: CLR.hook     },
      { id: "s2", label: "Epic Turn",    from: 30,  durationInFrames: 125, color: CLR.product  },
      { id: "s3", label: "Front Hero",   from: 155, durationInFrames: 140, color: CLR.features },
      { id: "s4", label: "Camera",       from: 295, durationInFrames: 83,  color: CLR.metrics  },
      { id: "s5", label: "CTA",          from: 378, durationInFrames: 72,  color: CLR.cta      },
    ],
  },

  // ── Dimension3DAd ─────────────────────────────────────────────────────────
  {
    id:               "dimension-3d-v1",
    label:            "Dimension — A New Era of 3D Motion. (Showcase)",
    component:        Dimension3DAd,
    durationInFrames: 450,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Glass Orbits",    from: 0,   durationInFrames: 90, color: CLR.hook     },
      { id: "s2", label: "Particle Storm",  from: 90,  durationInFrames: 90, color: CLR.product  },
      { id: "s3", label: "Material Live",   from: 180, durationInFrames: 90, color: CLR.features },
      { id: "s4", label: "Helix Depth",     from: 270, durationInFrames: 90, color: CLR.metrics  },
      { id: "s5", label: "Bloom Burst",     from: 360, durationInFrames: 90, color: CLR.cta      },
    ],
  },

  // ── AuraSalonAd ───────────────────────────────────────────────────────────
  {
    id:               "aura-salon-v1",
    label:            "Aurore — Transform Your Look. (Kinetic Transitions)",
    component:        AuraSalonAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Scissors",  from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Salon",     from: 90,  durationInFrames: 135, color: CLR.product  },
      { id: "s3", label: "BlowDryer", from: 225, durationInFrames: 90,  color: CLR.features },
      { id: "s4", label: "HairFlow",  from: 315, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "Curl",      from: 405, durationInFrames: 75,  color: CLR.generic  },
      { id: "s6", label: "CTA",       from: 480, durationInFrames: 60,  color: CLR.cta      },
    ],
  },

  // ── SharedSalonFinalAd ───────────────────────────────────────────────────────
  {
    id:               "shared-salon-final",
    label:            "Shared Salon — The Platform (Premium, 26s)",
    component:        SharedSalonFinalAd,
    durationInFrames: 780,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Phone Reveal",   from: 0,   durationInFrames: 120, color: CLR.hook     },
      { id: "s2", label: "UI Alive",       from: 120, durationInFrames: 120, color: CLR.product  },
      { id: "s3", label: "Card Flip",      from: 240, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Marketplace",    from: 360, durationInFrames: 120, color: CLR.metrics  },
      { id: "s5", label: "Create Listing", from: 480, durationInFrames: 120, color: CLR.generic  },
      { id: "s6", label: "Payoff",         from: 600, durationInFrames: 120, color: CLR.features },
      { id: "s7", label: "Brand Close",    from: 720, durationInFrames: 60,  color: CLR.cta      },
    ],
  },

  // ── SharedSalonOneShot ────────────────────────────────────────────────────
  {
    id:               "shared-salon-oneshot",
    label:            "Shared Salon — The Long Take (One-Shot, 26s)",
    component:        SharedSalonOneShot,
    durationInFrames: 780,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "p1", label: "Phone Enter",     from: 0,   durationInFrames: 60,  color: CLR.hook     },
      { id: "p2", label: "Zoom In",         from: 60,  durationInFrames: 70,  color: CLR.product  },
      { id: "p3", label: "Text Escapes",    from: 130, durationInFrames: 140, color: CLR.features },
      { id: "p4", label: "Step Cards",      from: 270, durationInFrames: 155, color: CLR.metrics  },
      { id: "p5", label: "Panel Flip",      from: 425, durationInFrames: 130, color: CLR.generic  },
      { id: "p6", label: "Dark Listing",    from: 555, durationInFrames: 90,  color: CLR.cta      },
      { id: "p7", label: "Payoff + Brand",  from: 645, durationInFrames: 135, color: CLR.hook     },
    ],
  },

  // ── SharedSalonCinemaAd ───────────────────────────────────────────────────
  {
    id:               "shared-salon-cinema",
    label:            "Shared Salon — The Cinematic Reveal (Seq 1: 3D iPhone, 4s)",
    component:        SharedSalonCinemaAd,
    durationInFrames: 120,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "c1", label: "Camera Rise",   from: 0,  durationInFrames: 60, color: CLR.hook    },
      { id: "c2", label: "Pivot & Pull",  from: 60, durationInFrames: 60, color: CLR.product },
    ],
  },

  // ── SharedSalonKineticAd ──────────────────────────────────────────────────
  {
    id:               "shared-salon-kinetic",
    label:            "Shared Salon — The Kinetic Chain (Playful Camera, 25s)",
    component:        SharedSalonKineticAd,
    durationInFrames: 756,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "k1", label: "Bezel Rise",      from: 0,   durationInFrames: 124, color: CLR.hook     },
      { id: "k2", label: "Portal Push",     from: 124, durationInFrames: 116, color: CLR.product  },
      { id: "k3", label: "Chair → Cards",   from: 240, durationInFrames: 204, color: CLR.features },
      { id: "k4", label: "Panel Orbit",     from: 444, durationInFrames: 96,  color: CLR.metrics  },
      { id: "k5", label: "Listing Flow",    from: 540, durationInFrames: 116, color: CLR.generic  },
      { id: "k6", label: "Bloom",           from: 656, durationInFrames: 64,  color: CLR.cta      },
      { id: "k7", label: "Brand",           from: 720, durationInFrames: 36,  color: CLR.hook     },
    ],
  },

  // ── CinemaRevealAd ────────────────────────────────────────────────────────
  // Reference composition demonstrating simulated cinematography:
  // depth tier system, virtual camera path, and parallax-by-layer.
  {
    id:               "cinema-reveal",
    label:            "Cinema Reveal — iPhone 3D + 360° Orbit (16s)",
    component:        CinemaRevealAd,
    durationInFrames: 480,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "cr1", label: "Rise (Pedestal Up)",     from: 0,   durationInFrames: 80,  color: CLR.hook     },
      { id: "cr2", label: "Pivot (3D Reveal)",      from: 80,  durationInFrames: 80,  color: CLR.product  },
      { id: "cr3", label: "Dolly Back (Wide)",      from: 160, durationInFrames: 140, color: CLR.features },
      { id: "cr4", label: "360° Orbit Fly-Around",  from: 300, durationInFrames: 180, color: CLR.cta      },
    ],
  },

  // ── AwesomeAd — Scene 1 ───────────────────────────────────────────────────
  // 9:16, 5s — "Rise & Reveal": camera starts at the bottom of the phone
  // looking up, scans the screen face, then pulls back to a flat-on full reveal.
  {
    id:               "awesome-ad",
    label:            "Awesome Ad — Scene 1: Rise & Reveal (5s)",
    component:        AwesomeAd,
    durationInFrames: 150,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "aa1", label: "Rise (Camera Scan Up)",       from: 0,  durationInFrames: 90,  color: CLR.hook    },
      { id: "aa2", label: "Pull Back (Full Reveal)",     from: 90, durationInFrames: 60,  color: CLR.product },
    ],
  },
];

export function getComp(id: string): CompMeta | undefined {
  return REGISTRY.find((c) => c.id === id);
}
