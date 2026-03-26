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
import { LangEaseAd }           from "@comps/LangEaseAd";
import { SaasExplainerAd }      from "@comps/SaasExplainerAd";
import { SaasExplainerV2 }     from "@comps/SaasExplainerV2";
import { SaasShowcaseAd }     from "@comps/SaasShowcaseAd";
import { SaasShowcase2Ad }    from "@comps/SaasShowcase2Ad";
import { SaasPlaygroundAd }  from "@comps/SaasPlaygroundAd";
import { SaasCameraAd }     from "@comps/SaasCameraAd";
import { Saas3DRealmAd }   from "@comps/Saas3DRealmAd";
import { Saas3DRealm2Ad } from "@comps/Saas3DRealm2Ad";
import { SaasSimpleComponentAd } from "@comps/SaasSimpleComponentAd";
import { SaasMediumComponentAd } from "@comps/SaasMediumComponentAd";
import { TerrraSurfaceAd } from "@comps/TerrraSurfaceAd";
import { FlowPilotAd } from "@comps/FlowPilotAd";
import { FlowPilotV2Ad } from "@comps/FlowPilotV2Ad";
import { DeskflowAd } from "@comps/DeskflowAd";
import { AnimTestAd } from "@comps/AnimTestAd";
import { AeReplicaAd } from "@comps/AeReplicaAd";
import { CalmlyAd } from "@comps/CalmlyAd";
import { GreenTaskAd } from "@comps/GreenTaskAd";
import { AnimDrillAd } from "@comps/AnimDrillAd";
import { AnimlyAd, AnimlyAdCues } from "@comps/AnimlyAd";
import { SmallSpotAd } from "@comps/SmallSpotAd";
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
  // ══ PLAYGROUND — canonical feature reference (always first) ═══════════════
  {
    id:               "saas-playground",
    label:            "SaaS Playground — Feature Reference",
    component:        SaasPlaygroundAd,
    durationInFrames: 1120,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1",  label: "Text Animation",       from: 0,   durationInFrames: 90,  color: "#d4a017" },
      { id: "s2",  label: "UI Elements",          from: 82,  durationInFrames: 103, color: "#d4a017" },
      { id: "s3",  label: "Data Viz",             from: 178, durationInFrames: 90,  color: "#d4a017" },
      { id: "s4",  label: "Spring Physics",       from: 260, durationInFrames: 95,  color: "#d4a017" },
      { id: "s5",  label: "Background FX",        from: 348, durationInFrames: 97,  color: "#d4a017" },
      { id: "s6",  label: "Transitions",          from: 438, durationInFrames: 70,  color: "#d4a017" },
      { id: "s7",  label: "Combined Stack",       from: 500, durationInFrames: 70,  color: "#d4a017" },
      { id: "s8",  label: "CTA",                  from: 562, durationInFrames: 38,  color: "#d4a017" },
      { id: "s9",  label: "2D Camera Sweeps",     from: 592, durationInFrames: 108, color: "#d4a017" },
      { id: "s10", label: "3D Realm Camera",      from: 692, durationInFrames: 118, color: "#d4a017" },
      { id: "s11", label: "Simple Component Sampler", from: 802,  durationInFrames: 158, color: "#d4a017" },
      { id: "s12", label: "Medium Component Sampler", from: 952, durationInFrames: 168, color: "#60A5FA" },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "data-viz", "transitions", "background-effects", "spring-physics", "2d-camera-sweeps", "3d-realm-camera", "component-animation", "component-animation-medium"],
    playground: true,
  },

  // ── SaasCameraAd — "Corner Growth" camera movement showcase ─────────────
  {
    id:               "saas-camera",
    label:            "SaaS Camera — Corner Growth Sweep",
    component:        SaasCameraAd,
    durationInFrames: 450,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Dynamic (→ BR)",  from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Creative (→ TR)", from: 82,  durationInFrames: 93,  color: CLR.product  },
      { id: "s3", label: "Bold (→ BL)",     from: 168, durationInFrames: 92,  color: CLR.features },
      { id: "s4", label: "Fluid (→ TL)",    from: 253, durationInFrames: 97,  color: CLR.metrics  },
      { id: "s5", label: "CTA",             from: 343, durationInFrames: 107, color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["2d-camera-sweeps"],
  },

  // ── Saas3DRealmAd — "Prism" 3D realm camera + objects showcase ─────────
  {
    id:               "saas-3d-realm",
    label:            "SaaS 3D Realm — Prism",
    component:        Saas3DRealmAd,
    durationInFrames: 540,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Orbit",       from: 0,   durationInFrames: 110, color: CLR.hook     },
      { id: "s2", label: "Depth",       from: 102, durationInFrames: 108, color: CLR.product  },
      { id: "s3", label: "Tumble",      from: 203, durationInFrames: 108, color: CLR.features },
      { id: "s4", label: "Fly-Through", from: 304, durationInFrames: 112, color: CLR.metrics  },
      { id: "s5", label: "CTA",         from: 410, durationInFrames: 130, color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["3d-realm-camera"],
  },

  // ── Saas3DRealm2Ad — "Aether" 3D realm warm variant ──────────────────
  {
    id:               "saas-3d-realm-2",
    label:            "SaaS 3D Realm 2 — Aether",
    component:        Saas3DRealm2Ad,
    durationInFrames: 540,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Orbit",       from: 0,   durationInFrames: 110, color: "#E8624A" },
      { id: "s2", label: "Depth",       from: 102, durationInFrames: 108, color: "#D4A853" },
      { id: "s3", label: "Tumble",      from: 203, durationInFrames: 108, color: "#6B9B7D" },
      { id: "s4", label: "Fly-Through", from: 304, durationInFrames: 112, color: "#8E4585" },
      { id: "s5", label: "CTA",         from: 410, durationInFrames: 130, color: "#E8624A" },
    ],
    category: "saas",
    subcategories: ["3d-realm-camera"],
  },

  // ── SaasSimpleComponentAd — "MotionRam" simple component animation ──────
  {
    id:               "saas-simple-component",
    label:            "SaaS Simple Components — MotionRam",
    component:        SaasSimpleComponentAd,
    durationInFrames: 540,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Build (Buttons)",     from: 0,   durationInFrames: 100, color: CLR.hook     },
      { id: "s2", label: "Measure (Stats)",      from: 92,  durationInFrames: 110, color: CLR.product  },
      { id: "s3", label: "Connect (Reviews)",    from: 195, durationInFrames: 100, color: CLR.features },
      { id: "s4", label: "Ship (Toggles)",       from: 288, durationInFrames: 100, color: CLR.metrics  },
      { id: "s5", label: "CTA",                  from: 380, durationInFrames: 160, color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["component-animation"],
  },

  // ── SaasMediumComponentAd — "ComponentForge" medium-complexity animation ──
  {
    id:               "saas-medium-component",
    label:            "SaaS Medium Components — ComponentForge",
    component:        SaasMediumComponentAd,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Orchestrate (Glow Cards)", from: 0,   durationInFrames: 120, color: CLR.hook     },
      { id: "s2", label: "Connect (Data Flow)",      from: 112, durationInFrames: 120, color: CLR.product  },
      { id: "s3", label: "Illuminate (Notifications)", from: 225, durationInFrames: 120, color: CLR.features },
      { id: "s4", label: "Compose (Assembly)",        from: 338, durationInFrames: 120, color: CLR.metrics  },
      { id: "s5", label: "CTA",                       from: 450, durationInFrames: 150, color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["component-animation-medium"],
  },

  // ── TerrraSurfaceAd — "Terrra" narrative SaaS ad ────────────────────────────
  {
    id:               "terrra-surface-v1",
    label:            "Terrra — Software as a Surface. (Narrative, 30s)",
    component:        TerrraSurfaceAd,
    durationInFrames: 900,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook (Dead Desk)",          from: 0,   durationInFrames: 105, color: CLR.hook     },
      { id: "s2", label: "Problem (47B sq ft)",       from: 97,  durationInFrames: 120, color: CLR.metrics  },
      { id: "s3", label: "The Seed (3D Bloom)",       from: 202, durationInFrames: 135, color: CLR.features },
      { id: "s4", label: "Product (Living Dashboard)", from: 322, durationInFrames: 135, color: CLR.product  },
      { id: "s5", label: "Ecosystem (Data Vines)",    from: 442, durationInFrames: 135, color: CLR.features },
      { id: "s6", label: "Impact (Tree-Ring Stats)",  from: 562, durationInFrames: 135, color: CLR.metrics  },
      { id: "s7", label: "Benefit (Grow)",            from: 682, durationInFrames: 135, color: CLR.generic  },
      { id: "s8", label: "CTA",                       from: 802, durationInFrames: 105, color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "data-viz", "transitions", "background-effects", "2d-camera-sweeps", "3d-realm-camera", "component-animation-medium"],
  },

  // ── FlowPilotAd — "Chaos to Control" SaaS paid ad ─────────────────────────
  {
    id:               "flowpilot-v1",
    label:            "FlowPilot — Less admin. More momentum.",
    component:        FlowPilotAd,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",          from: 0,   durationInFrames: 95,  color: CLR.hook     },
      { id: "s2", label: "Problem",       from: 88,  durationInFrames: 97,  color: CLR.metrics  },
      { id: "s3", label: "The Shift",     from: 178, durationInFrames: 87,  color: CLR.generic  },
      { id: "s4", label: "Product Reveal", from: 258, durationInFrames: 97,  color: CLR.product  },
      { id: "s5", label: "Features",      from: 348, durationInFrames: 92,  color: CLR.features },
      { id: "s6", label: "Stats",         from: 433, durationInFrames: 77,  color: CLR.metrics  },
      { id: "s7", label: "Tagline",       from: 503, durationInFrames: 65,  color: CLR.generic  },
      { id: "s8", label: "CTA",           from: 560, durationInFrames: 40,  color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "data-viz", "transitions", "background-effects"],
  },

  // ── FlowPilotV2Ad — "Professionalise the Business" SaaS paid ad ────────────
  {
    id:               "flowpilot-v2",
    label:            "FlowPilot V2 — Run it like you mean it.",
    component:        FlowPilotV2Ad,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",            from: 0,   durationInFrames: 100, color: CLR.hook     },
      { id: "s2", label: "The Cringe",      from: 95,  durationInFrames: 90,  color: CLR.metrics  },
      { id: "s3", label: "The Pivot",       from: 180, durationInFrames: 80,  color: CLR.generic  },
      { id: "s4", label: "Professional",    from: 255, durationInFrames: 105, color: CLR.product  },
      { id: "s5", label: "Behind Scenes",   from: 353, durationInFrames: 92,  color: CLR.features },
      { id: "s6", label: "Tagline",         from: 438, durationInFrames: 92,  color: CLR.generic  },
      { id: "s7", label: "CTA",            from: 523, durationInFrames: 77,  color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "transitions", "background-effects"],
  },

  // ── DeskflowAd — "The Invisible Bleed" SaaS paid ad ───────────────────────
  {
    id:               "deskflow-v1",
    label:            "Deskflow — Stop the silent churn.",
    component:        DeskflowAd,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "The Accusation",    from: 0,   durationInFrames: 95,  color: CLR.hook     },
      { id: "s2", label: "The Silent Exit",   from: 90,  durationInFrames: 105, color: CLR.metrics  },
      { id: "s3", label: "Visibility Gap",    from: 190, durationInFrames: 100, color: CLR.generic  },
      { id: "s4", label: "Control Shift",     from: 285, durationInFrames: 115, color: CLR.product  },
      { id: "s5", label: "The Proof",         from: 395, durationInFrames: 105, color: CLR.features },
      { id: "s6", label: "Tagline",           from: 495, durationInFrames: 60,  color: CLR.generic  },
      { id: "s7", label: "CTA",              from: 550, durationInFrames: 50,  color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "data-viz", "transitions", "background-effects"],
  },

  // ── AeReplicaAd ────────────────────────────────────────────────────────────
  {
    id:               "ae-replica",
    label:            "AE Replica — First 5 seconds of FINAL_RENDER_4K",
    component:        AeReplicaAd,
    durationInFrames: 150,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Text Morphing: Most workdays...",  from: 0,   durationInFrames: 67,  color: CLR.hook     },
      { id: "s2", label: "Liquid Eruption + Not enough?",    from: 67,  durationInFrames: 48,  color: CLR.generic  },
      { id: "s3", label: "Cursor Drag + Transmutation",      from: 100, durationInFrames: 50,  color: CLR.product  },
    ],
    category: "saas",
    subcategories: ["complex-animations"],
  },

  // ── CalmlyAd — "Calmly" chaos-to-calm SaaS ad ─────────────────────────────
  {
    id:               "calmly-v1",
    label:            "Calmly — Focus, finally.",
    component:        CalmlyAd,
    durationInFrames: 390,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Chaos: Your inbox never stops", from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "The Click: Vortex Transition",  from: 90,  durationInFrames: 130, color: CLR.generic  },
      { id: "s3", label: "Calm: Dashboard + Tagline",     from: 220, durationInFrames: 170, color: CLR.product  },
    ],
    category: "saas",
    subcategories: ["complex-animations", "text-animation", "transitions"],
    profile: "dark-tech",
  },

  // ── AnimTestAd ─────────────────────────────────────────────────────────────
  {
    id:               "anim-test",
    label:            "Animation Test — Complex techniques from AE reference",
    component:        AnimTestAd,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Dot Grid + Text",        from: 0,   durationInFrames: 100, color: CLR.hook     },
      { id: "s2", label: "Liquid Blob Transition",  from: 95,  durationInFrames: 50,  color: CLR.generic  },
      { id: "s3", label: "Magnet-Snap Cards",       from: 140, durationInFrames: 140, color: CLR.product  },
      { id: "s4", label: "Liquid Blob Transition 2", from: 275, durationInFrames: 50,  color: CLR.generic  },
      { id: "s5", label: "Horizontal Card Scroll",  from: 320, durationInFrames: 170, color: CLR.features },
      { id: "s6", label: "Tagline + CTA",           from: 485, durationInFrames: 115, color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["liquid-blob-transition", "procedural-dot-grid", "magnet-snap-float", "unfurl-reveal", "bounce-pop-stagger", "tapered-draw-on", "horizontal-card-scroll"],
  },

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

  // ── FormaAd2 — iter2 rebuild: LangEase recreation ────────────────────────
  {
    id:               "forma2-v1",
    label:            "LangEase — Turn Books Into Global Content",
    component:        FormaAd2,
    durationInFrames: 630,
    fps:              30,
    width:            1080,
    height:           1080,
    format:           "1:1",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",     from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "UI Intro", from: 90,  durationInFrames: 90,  color: CLR.product  },
      { id: "s3", label: "Tunnel",   from: 180, durationInFrames: 180, color: CLR.features },
      { id: "s4", label: "Demo",     from: 360, durationInFrames: 120, color: CLR.metrics  },
      { id: "s5", label: "Tagline",  from: 480, durationInFrames: 90,  color: CLR.generic  },
      { id: "s6", label: "CTA",      from: 570, durationInFrames: 60,  color: CLR.cta      },
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

  // ── LangEaseAd ────────────────────────────────────────────────────────────
  {
    id:               "langease-v1",
    label:            "LangEase — Translate. Dub. Distribute.",
    component:        LangEaseAd,
    durationInFrames: 540,
    fps:              30,
    width:            1080,
    height:           1920,
    format:           "9:16",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",     from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Platform", from: 90,  durationInFrames: 135, color: CLR.product  },
      { id: "s3", label: "Features", from: 225, durationInFrames: 135, color: CLR.features },
      { id: "s4", label: "Tagline",  from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s5", label: "CTA",      from: 450, durationInFrames: 90,  color: CLR.cta      },
    ],
  },

  // ── SaasExplainerAd — extracted from AE template via ExtendScript ───────
  {
    id:               "saas-explainer",
    label:            "SaaS Explainer — Focusly",
    component:        SaasExplainerAd,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Stats",        from: 0,   durationInFrames: 82,  color: CLR.metrics  },
      { id: "s2", label: "Hook",         from: 69,  durationInFrames: 105, color: CLR.hook     },
      { id: "s3", label: "Solution",     from: 124, durationInFrames: 80,  color: CLR.product  },
      { id: "s4", label: "Boards",       from: 165, durationInFrames: 114, color: CLR.features },
      { id: "s5", label: "Brand",        from: 279, durationInFrames: 141, color: CLR.generic  },
      { id: "s6", label: "Social Proof", from: 360, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s7", label: "Benefits",     from: 441, durationInFrames: 75,  color: CLR.product  },
      { id: "s8", label: "CTA",          from: 525, durationInFrames: 75,  color: CLR.cta      },
    ],
  },

  // ── SaasExplainerV2 — clean recreation inspired by AE template styles ─────
  {
    id:               "saas-explainer-v2",
    label:            "SaaS Explainer V2 — Focusly",
    component:        SaasExplainerV2,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",         from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "Problem",      from: 78,  durationInFrames: 90,  color: CLR.metrics  },
      { id: "s3", label: "Feature A",    from: 160, durationInFrames: 88,  color: CLR.product  },
      { id: "s4", label: "Feature B",    from: 240, durationInFrames: 90,  color: CLR.features },
      { id: "s5", label: "Social Proof", from: 322, durationInFrames: 118, color: CLR.generic  },
      { id: "s6", label: "Stats",        from: 432, durationInFrames: 78,  color: CLR.metrics  },
      { id: "s7", label: "Benefit",      from: 502, durationInFrames: 66,  color: CLR.product  },
      { id: "s8", label: "CTA",          from: 560, durationInFrames: 40,  color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "data-viz", "transitions", "background-effects", "spring-physics"],
  },

  // ── SaasShowcaseAd — "Vertex" full SaaS technique showcase ──────────────
  {
    id:               "saas-showcase",
    label:            "SaaS Showcase — Vertex",
    component:        SaasShowcaseAd,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Text Animation",    from: 0,   durationInFrames: 90,  color: CLR.hook     },
      { id: "s2", label: "UI Elements",       from: 82,  durationInFrames: 103, color: CLR.product  },
      { id: "s3", label: "Data Viz",          from: 178, durationInFrames: 90,  color: CLR.metrics  },
      { id: "s4", label: "Spring Physics",    from: 260, durationInFrames: 95,  color: CLR.features },
      { id: "s5", label: "Background FX",     from: 348, durationInFrames: 97,  color: CLR.generic  },
      { id: "s6", label: "Transitions",       from: 438, durationInFrames: 70,  color: CLR.hook     },
      { id: "s7", label: "Combined Stack",    from: 500, durationInFrames: 70,  color: CLR.product  },
      { id: "s8", label: "CTA",               from: 562, durationInFrames: 38,  color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "data-viz", "transitions", "background-effects", "spring-physics"],
  },

  // ── SaasShowcase2Ad — "Ember" red/black/cream SaaS showcase ─────────────
  {
    id:               "saas-showcase-2",
    label:            "SaaS Showcase 2 — Ember",
    component:        SaasShowcase2Ad,
    durationInFrames: 600,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Text Animation",    from: 0,   durationInFrames: 90,  color: "#A3080B" },
      { id: "s2", label: "UI Elements",       from: 82,  durationInFrames: 103, color: "#000000" },
      { id: "s3", label: "Data Viz",          from: 178, durationInFrames: 90,  color: "#A3080B" },
      { id: "s4", label: "Spring Physics",    from: 260, durationInFrames: 95,  color: "#F5D4B7" },
      { id: "s5", label: "Background FX",     from: 348, durationInFrames: 97,  color: "#A3080B" },
      { id: "s6", label: "Transitions",       from: 438, durationInFrames: 70,  color: "#000000" },
      { id: "s7", label: "Combined Stack",    from: 500, durationInFrames: 70,  color: "#A3080B" },
      { id: "s8", label: "CTA",               from: 562, durationInFrames: 38,  color: "#A3080B" },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "data-viz", "transitions", "background-effects", "spring-physics"],
  },

  // ── GreenTaskAd — eco-conscious task management SaaS ──────────────────────
  {
    id:               "greentask-v1",
    label:            "GreenTask — Get things done, greenly.",
    component:        GreenTaskAd,
    durationInFrames: 670,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",             from: 0,   durationInFrames: 135, color: CLR.hook     },
      { id: "s2", label: "The Gap",          from: 128, durationInFrames: 129, color: CLR.product  },
      { id: "s3", label: "The Reveal",       from: 235, durationInFrames: 135, color: CLR.features },
      { id: "s4", label: "Impact Dashboard", from: 360, durationInFrames: 130, color: CLR.metrics  },
      { id: "s5", label: "Gamification",     from: 480, durationInFrames: 115, color: CLR.generic  },
      { id: "s6", label: "CTA",             from: 588, durationInFrames: 82,  color: CLR.cta      },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "data-viz"],
  },

  // ── AnimDrillAd — Single-technique animation training bench ─────────────────
  {
    id:               "anim-drill",
    label:            "Animation Drill — Training Bench",
    component:        AnimDrillAd,
    durationInFrames: 150,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Drill", from: 0, durationInFrames: 150, color: CLR.generic },
    ],
    category: "saas",
    subcategories: ["spring-physics"],
  },

  // ── AnimlyAd — Animation training playground ────────────────────────────────
  {
    id:               "animly-v1",
    label:            "Animly — Motion, perfected.",
    component:        AnimlyAd,
    durationInFrames: 706,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",     from: 0,   durationInFrames: 156, color: CLR.hook     },
      { id: "s2", label: "Problem",  from: 146, durationInFrames: 258, color: CLR.generic  },
      { id: "s3", label: "Reveal",   from: 376, durationInFrames: 330, color: CLR.features },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "transitions", "spring-physics", "background-effects"],
    profile: "dark-tech",
    cues: AnimlyAdCues,
  },

  // ── SmallSpotAd — SMB Marketing (AnimlyAd duplicate with different text) ───
  {
    id:               "smallspot-v1",
    label:            "SmallSpot — SMB Marketing",
    component:        SmallSpotAd,
    durationInFrames: 706,
    fps:              30,
    width:            3840,
    height:           2160,
    format:           "16:9",
    defaultProps:     {},
    sequences: [
      { id: "s1", label: "Hook",     from: 0,   durationInFrames: 156, color: CLR.hook     },
      { id: "s2", label: "Problem",  from: 146, durationInFrames: 258, color: CLR.generic  },
      { id: "s3", label: "Reveal",   from: 376, durationInFrames: 330, color: CLR.features },
    ],
    category: "saas",
    subcategories: ["text-animation", "ui-elements", "transitions", "spring-physics", "background-effects"],
    profile: "dark-tech",
  },
];

export function getComp(id: string): CompMeta | undefined {
  return REGISTRY.find((c) => c.id === id);
}
