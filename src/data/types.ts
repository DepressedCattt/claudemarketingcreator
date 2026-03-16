/**
 * AD ENGINE — Core Type Definitions
 *
 * These types define the shape of every ad configuration.
 * All scenes, components, and templates depend on these types.
 * Edit here if you need to add new fields to the ad config system.
 */

// ─── Template Styles ────────────────────────────────────────────────────────

/** Which visual template/style to use for the ad */
export type AdTemplate =
  // ── Original ─────────────────────────────────────────────────────────────
  | "startup-explainer"   // Premium startup/VC-style with gradient drama
  | "punchy-text"         // Fast, text-driven UGC-style
  | "product-ui-showcase" // App/SaaS UI screenshots center-stage
  | "minimalist-founder"  // Clean, founder-brand, low distraction
  | "local-service"       // Warm, offer-driven, neighborhood feel
  // ── New ──────────────────────────────────────────────────────────────────
  | "dark-cinematic"      // Slow-burn, film-grain, moody dark aesthetic
  | "neon-glow"           // High-contrast neon on black, glowing edges
  | "corporate-light"     // Light backgrounds, professional, LinkedIn-safe
  | "luxury-brand"        // Ultra-minimal whitespace, quiet confidence
  | "sports-hype"         // Bold diagonals, high energy, stadium feel
  | "editorial-magazine"; // Serif typography, editorial grid layout

// ─── Scene Types ────────────────────────────────────────────────────────────

/** The type of content a scene displays */
export type SceneType =
  // ── Core scenes ──────────────────────────────────────────────────────────
  | "hook"           // Opening attention-grabber
  | "problem"        // Pain point / problem statement
  | "solution"       // The product/service introduction
  | "feature"        // Feature or benefit highlights
  | "social-proof"   // Testimonials, stats, trust signals
  | "cta"            // Call to action
  | "logo-end-card"  // Final logo frame
  // ── Motion / text ────────────────────────────────────────────────────────
  | "kinetic-text"   // Word-by-word or line-by-line slam — TikTok energy
  | "counter-reveal" // Animated number counters that count up live
  | "split-reveal"   // Screen splits: before state vs after state collision
  | "timeline"       // Step-by-step how-it-works with cascading cards
  | "price-reveal"   // Dramatic price/offer reveal with strike-through
  // ── Data & charts ────────────────────────────────────────────────────────
  | "chart"          // Animated bar or line chart that builds up
  // ── Visual spectacle ─────────────────────────────────────────────────────
  | "particle"       // Particle system — confetti, embers, sparks, matrix
  | "flip-card"      // CSS 3D perspective card flips
  | "draw-path"      // SVG paths that draw themselves onto screen
  | "code-reveal"    // Syntax-highlighted code block typewriter reveal
  | "parallax"       // Multi-layer depth parallax with floating elements
  | "lottie"         // Frame-synced Lottie JSON animation
  | "diamond-3d"     // Full 3D gem — React Three Fiber glass crystal with bloom
  | "glb-model";     // Load any Spline-exported .glb with optional vertex distortion

// ─── Custom Scene Props ──────────────────────────────────────────────────────
// Pass these via SceneConfig.props to drive the new custom scene types.

/** Props for the kinetic-text scene */
export interface KineticTextProps {
  /** Each string is one block of text that slams in sequentially */
  lines: string[];
  /** Animation style: slam (scale bounce), drift (float up), typewriter (char-by-char) */
  style?: "slam" | "drift" | "typewriter";
  /** Font size override in px (default: 96) */
  fontSize?: number;
  /** Frames between each line appearing (default: 18) */
  lineDelay?: number;
  /** Highlight color override (default: brand accent) */
  highlightColor?: string;
  /** Which lines (0-indexed) to render in the highlight color */
  highlightLines?: number[];
}

/** A single animated counter */
export interface CounterItem {
  /** Starting value (default: 0) */
  from?: number;
  /** Target value to count up to */
  to: number;
  /** Text before the number e.g. "£" or "$" */
  prefix?: string;
  /** Text after the number e.g. "%" or "K+" */
  suffix?: string;
  /** Label below the number e.g. "Monthly Saving" */
  label: string;
}

/** Props for the counter-reveal scene */
export interface CounterRevealProps {
  counters: CounterItem[];
  /** Headline above the counters */
  headline?: string;
  /** Frames from scene start before counting begins (default: 10) */
  startDelay?: number;
  /** How many frames the count-up animation takes (default: 60) */
  countDuration?: number;
}

/** Props for the split-reveal scene */
export interface SplitRevealProps {
  /** Text/label on the left (before) panel */
  leftLabel: string;
  leftText: string;
  leftEmoji?: string;
  /** Text/label on the right (after) panel */
  rightLabel: string;
  rightText: string;
  rightEmoji?: string;
  /** Frame at which the screen splits (default: 20) */
  splitFrame?: number;
}

/** A single step in a timeline */
export interface TimelineStep {
  icon: string;
  title: string;
  subtitle?: string;
  /** Optional time/duration label e.g. "< 60 sec" */
  time?: string;
}

/** Props for the timeline scene */
export interface TimelineProps {
  steps: TimelineStep[];
  /** Headline above the timeline */
  headline?: string;
  /** Frames between each step appearing (default: 16) */
  stepDelay?: number;
}

// ── Chart scene ─────────────────────────────────────────────────────────────

/** A single data point for the chart scene */
export interface ChartDataPoint {
  label: string;
  value: number;
  /** Optional colour override — defaults to brand primary/accent cycle */
  color?: string;
}

/** Props for the chart scene */
export interface ChartSceneProps {
  type: "bar" | "line";
  data: ChartDataPoint[];
  headline?: string;
  /** Units label e.g. "£", "%", "users" */
  unit?: string;
  /** Override the Y-axis max value */
  maxValue?: number;
  /** Frames delay between each bar/point entering (default: 10) */
  enterDelay?: number;
}

// ── Particle scene ──────────────────────────────────────────────────────────

/** Props for the particle scene */
export interface ParticleSceneProps {
  /** Visual effect type */
  effect: "confetti" | "embers" | "sparks" | "bubbles" | "matrix";
  /** Number of particles (default: 80) */
  count?: number;
  /** Optional headline overlaid on the particles */
  headline?: string;
  /** Optional subtext below headline */
  subtext?: string;
}

// ── Flip-card scene ─────────────────────────────────────────────────────────

export interface FlipCardItem {
  /** Shown on the card back (before flip) */
  backIcon: string;
  backText: string;
  /** Shown on the card front (after flip) */
  frontIcon: string;
  frontTitle: string;
  frontBody: string;
  accentColor?: string;
}

/** Props for the flip-card scene */
export interface FlipCardSceneProps {
  cards: FlipCardItem[];
  /** Frames between each card flip (default: 18) */
  flipDelay?: number;
  /** Headline above the cards */
  headline?: string;
}

// ── Draw-path scene ─────────────────────────────────────────────────────────

export type DrawShape =
  | "checkmark"
  | "circle"
  | "underline"
  | "arrow-right"
  | "cross"
  | "heart"
  | "star";

export interface DrawPathItem {
  shape: DrawShape;
  /** Label text rendered beside or below the shape */
  label?: string;
  /** Colour override — defaults to brand accent */
  color?: string;
}

/** Props for the draw-path scene */
export interface DrawPathSceneProps {
  items: DrawPathItem[];
  headline?: string;
  /** Frames between each shape starting to draw (default: 20) */
  itemDelay?: number;
}

// ── Code-reveal scene ───────────────────────────────────────────────────────

/** Props for the code-reveal scene */
export interface CodeRevealSceneProps {
  /** Each string is one line of code */
  lines: string[];
  /** Language label shown in the header bar e.g. "typescript", "python" */
  language?: string;
  /** Optional headline above the code window */
  headline?: string;
  /** Characters revealed per frame (default: 2) */
  charsPerFrame?: number;
  /** Frames delay between lines starting to appear (default: 24) */
  lineDelay?: number;
}

// ── Parallax scene ──────────────────────────────────────────────────────────

export interface ParallaxLayer {
  text: string;
  fontSize?: number;
  opacity?: number;
  /** Speed multiplier — 1 = normal, 0.3 = slow/background, 2 = fast/foreground */
  speed?: number;
  color?: string;
}

/** Props for the parallax scene */
export interface ParallaxSceneProps {
  layers: ParallaxLayer[];
  /** Scroll direction (default: "up") */
  direction?: "up" | "down";
}

// ── Lottie scene ────────────────────────────────────────────────────────────

// ── Diamond 3D scene ────────────────────────────────────────────────────────

/** Props for the diamond-3d scene */
export interface Diamond3DSceneProps {
  /** Headline overlaid below the gem */
  headline?: string;
  /** Supporting line below the headline */
  subtext?: string;
  /** Size multiplier for the gem (default: 1) */
  diamondScale?: number;
  /** Rotation speed in radians/second (default: 0.3) */
  rotationSpeed?: number;
  /** Bloom glow intensity (default: 1.4) */
  bloomIntensity?: number;
  /** Override primary crystal colour (defaults to brand.colors.primary) */
  color?: string;
  /** Number of orbiting sparkle particles (default: 40) */
  sparkleCount?: number;
}

// ── GLB model scene ──────────────────────────────────────────────────────────

/**
 * Props for the glb-model scene.
 *
 * Loads any Spline-exported (or other) .glb file inside a ThreeCanvas and
 * optionally re-applies the vertex-distortion animation that Spline's GLB
 * export cannot carry.
 *
 * Put your .glb files in public/models/ and reference them as
 *   "/models/my-file.glb"
 */
export interface GlbModelSceneProps {
  /**
   * Path to the .glb served from Remotion's public folder, e.g.
   * "/models/distorting_typography.glb"
   */
  src: string;

  /**
   * Animation applied to the loaded model each frame.
   *
   *  "none"    — static, no movement
   *  "rotate"  — constant Y-axis rotation
   *  "float"   — gentle up/down bob
   *  "distort" — per-vertex noise displacement (recreates Spline's distort)
   */
  animationMode?: "none" | "rotate" | "float" | "distort";

  /** Uniform scale of the entire model (default: 1) */
  scale?: number;

  /** X / Y / Z position offset from centre (default: [0, 0, 0]) */
  position?: [number, number, number];

  /** Rotation speed in radians/second for "rotate" mode (default: 0.5) */
  rotationSpeed?: number;

  /**
   * Vertex displacement strength for "distort" mode.
   * 0 = none, 0.15 = subtle, 0.4 = dramatic (default: 0.15)
   */
  distortStrength?: number;

  /**
   * Noise frequency for "distort" mode — higher = finer detail (default: 1.2)
   */
  distortFrequency?: number;

  /**
   * Speed of the distortion wave in time-units/second (default: 0.6)
   */
  distortSpeed?: number;

  /**
   * Override the material colour on ALL meshes in the model.
   * Useful when the GLB's embedded colours are too dark or washed out.
   * Accepts any CSS colour string, e.g. "#ffffff".
   */
  colorOverride?: string;

  /** Ambient light intensity (default: 1.0) */
  ambientIntensity?: number;

  /** Optional headline text overlaid on the scene */
  headline?: string;

  /** Optional subtext below the headline */
  subtext?: string;

  /** Vertical position of the text block — "top" | "center" | "bottom" */
  headlinePosition?: "top" | "center" | "bottom";

  /** Whether to keep the Spline background mesh visible (default: true) */
  showBackground?: boolean;
}

/** Props for the lottie scene */
export interface LottieSceneProps {
  /** Path to the .json Lottie file in /public e.g. "/public/lottie/check.json" */
  src: string;
  /** Playback speed multiplier (default: 1) */
  playbackRate?: number;
  /** Whether to loop the animation (default: false) */
  loop?: boolean;
  /** Optional headline above/below the animation */
  headline?: string;
  /** "above" | "below" (default: "below") */
  headlinePosition?: "above" | "below";
}

/** Props for the price-reveal scene */
export interface PriceRevealProps {
  /** The old/crossed-out price */
  originalPrice: string;
  /** The new revealed price */
  newPrice: string;
  /** Savings callout e.g. "Save £800/month" */
  savings?: string;
  /** Badge text e.g. "Limited Time" or "Founder Offer" */
  badge?: string;
  /** Subtext below the new price */
  subtext?: string;
}

/**
 * Scene-level transition animation applied to the entire scene as it enters/exits.
 * Set via SceneConfig.transition. Default is "fade".
 *
 *  fade       — opacity only (default)
 *  slide-up   — scene slides up from below on enter
 *  slide-down — scene slides down from above on enter
 *  scale-in   — scene scales from 93% to 100%
 *  zoom-out   — scene scales from 107% to 100% (push-in feel)
 *  blur-in    — scene blurs then sharpens on enter
 *  wipe-right — content reveals left-to-right via clipPath
 *  rotate-in  — slight CW rotation corrects on enter
 *  bounce-in  — bouncy spring scale from 85%
 *  flash-in   — white flash burst then settles
 */
export type TransitionMode =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "scale-in"
  | "zoom-out"
  | "blur-in"
  | "wipe-right"
  | "rotate-in"
  | "bounce-in"
  | "flash-in";

/** Per-scene configuration within a timing array */
export interface SceneConfig {
  type: SceneType;
  /** How long this scene plays in seconds */
  durationInSeconds: number;
  /**
   * Scene-level entrance/exit transition animation.
   * Applied to the entire scene container — works on any scene type.
   * Default: "fade"
   */
  transition?: TransitionMode;
  /**
   * Optional per-scene props.
   * Pass typed props objects (KineticTextProps, CounterRevealProps, etc.)
   * or arbitrary key/value overrides for standard scenes.
   */
  props?: Record<string, unknown>;
}

// ─── Brand & Visual Config ───────────────────────────────────────────────────

/** Color palette for the ad */
export interface ColorConfig {
  primary: string;       // Main brand color (buttons, highlights)
  secondary: string;     // Secondary brand color (gradients)
  accent: string;        // Pop color for CTA, emphasis
  background: string;    // Base background color
  text: string;          // Primary text color
  textSecondary: string; // Muted/secondary text color
}

/** Typography style presets */
export type TypographyPreset =
  // ── Original ─────────────────────────────────────────────────────────────
  | "modern-sans"     // Inter / system-ui — clean startup feel
  | "editorial"       // Serif + sans — premium editorial
  | "bold-impact"     // Impact / Arial Black — high-energy, punchy
  | "clean-minimal"   // Thin Helvetica — minimalist premium
  // ── New ──────────────────────────────────────────────────────────────────
  | "futurist"        // Courier New monospace — tech / code aesthetic
  | "luxury"          // Ultra-light Georgia — quiet, expensive feel
  | "condensed"       // Trebuchet MS — tall narrow, dense information
  | "rounded"         // Trebuchet / Verdana — friendly, approachable
  | "retro-slab"      // Georgia Bold — warm, authoritative, nostalgic
  | "technical";      // Courier New wide-track — data / dashboard feel

export interface TypographyConfig {
  preset: TypographyPreset;
  /** Override the headline font family (optional) */
  headlineFont?: string;
  /** Override the body font family (optional) */
  bodyFont?: string;
}

/** Everything that defines the visual brand identity */
export interface BrandConfig {
  name: string;
  tagline?: string;
  /** Relative path to logo file in /public */
  logoPath?: string;
  colors: ColorConfig;
  typography: TypographyConfig;
}

// ─── Media / Asset Config ────────────────────────────────────────────────────

/** Audio track configuration */
export interface AudioConfig {
  /** Path to audio file in /public e.g. "/public/audio/track.mp3" */
  src: string;
  /** Volume 0–1 (default: 0.6) */
  volume?: number;
  /** Frame offset to start playback from (default: 0) */
  startFrom?: number;
  /** Frame to stop playback (default: end of composition) */
  endAt?: number;
}

/** Paths to media files used in the ad */
export interface MediaConfig {
  /** Main hero/product image */
  heroImage?: string;
  /** App UI screenshots (for phone mockup or showcase scenes) */
  appScreenshots?: string[];
  /** Background video loop — shown behind gradient overlays */
  backgroundVideo?: string;
  /** Per-scene background video overrides keyed by scene type or index */
  sceneVideos?: Record<string, string>;
  /** Additional product/lifestyle images */
  productImages?: string[];
  /** Opacity of the background video (0–1, default 0.35) */
  videoOpacity?: number;
  /** Optional background audio track */
  audio?: AudioConfig;
}

// ─── Content Config ──────────────────────────────────────────────────────────

/** A single feature or benefit bullet point */
export interface FeatureItem {
  icon?: string;        // Emoji or icon identifier
  title: string;        // Short feature name
  description?: string; // Supporting sentence
}

/** A testimonial / social proof quote */
export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;  // Path to avatar image
  rating?: number;  // 1–5 stars
}

/** A stat / metric highlight */
export interface StatItem {
  value: string;  // e.g. "$2.4B", "10,000+"
  label: string;  // e.g. "Capital Deployed"
}

/** Call to action config */
export interface CTAConfig {
  primary: string;    // Primary button text
  secondary?: string; // Subtext under CTA (e.g. "Free for 14 days")
  url?: string;       // Display URL (not functional in video)
}

/** All the words/content that appear in the ad */
export interface ContentConfig {
  headline: string;
  subheadline?: string;
  targetAudience?: string;
  painPoints?: string[];
  valueProp?: string;
  features?: FeatureItem[];
  testimonials?: Testimonial[];
  stats?: StatItem[];
  trustBadges?: string[];  // e.g. ["As seen on Forbes", "SOC 2 Certified"]
  cta: CTAConfig;
  offer?: string;          // Promotional offer text
}

// ─── Timing Config ───────────────────────────────────────────────────────────

/** Controls frame rate and the sequence of scenes */
export interface TimingConfig {
  fps: number;
  scenes: SceneConfig[];
}

// ─── Top-Level Ad Config ─────────────────────────────────────────────────────

/**
 * The complete configuration object for a single ad.
 * This is the single source of truth — everything Claude Code
 * needs to generate a specific ad lives here.
 */
export interface AdConfig {
  /** Unique identifier for this ad */
  id: string;
  /** Human-readable name for the ad */
  name: string;
  /** Which visual template to use */
  template: AdTemplate;
  /** Output aspect ratio */
  aspectRatio: "9:16" | "1:1" | "16:9";
  brand: BrandConfig;
  media: MediaConfig;
  content: ContentConfig;
  timing: TimingConfig;
}
