/**
 * Category Taxonomy Schema
 *
 * Defines the structure for compartmentalizing animation knowledge by ad type.
 * Each category (e.g. "saas") contains subcategories (e.g. "text-animation")
 * with tightly scoped parameter ranges, technique references, and example
 * compositions. This prevents overgeneralization — a SaaS text reveal should
 * never inherit luxury-slow easing, and vice versa.
 */

// ─── Spring / Physics ───────────────────────────────────────────────────────

export interface SpringRange {
  stiffness: [min: number, max: number];
  damping: [min: number, max: number];
  mass: [min: number, max: number];
}

export interface StaggerRange {
  /** Frames between consecutive items */
  min: number;
  max: number;
}

// ─── Subcategory ────────────────────────────────────────────────────────────

export interface SubCategory {
  id: string;
  label: string;
  description: string;

  parameterRanges: {
    springs: Record<string, SpringRange>;
    easing: string[];
    stagger: StaggerRange;
    blur: { min: number; max: number };
    scale: { entrance: [min: number, max: number] };
    duration: { min: number; max: number };
  };

  /** Recipe IDs from docs/recipes/ that apply to this subcategory */
  techniques: string[];

  /** Composition IDs that demonstrate this subcategory well */
  compositions: string[];

  /** AE layer/effect types that map to this subcategory (for extraction) */
  aeMapping?: string[];
}

// ─── Category ───────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  label: string;
  description: string;

  /** Linked profile IDs from docs/profiles/ */
  profiles: string[];

  subcategories: SubCategory[];

  colorGuidelines: {
    backgrounds: string[];
    accents: string[];
    text: string[];
  };

  typographyGuidelines: {
    weights: number[];
    sizes: {
      hero: [min: number, max: number];
      headline: [min: number, max: number];
      body: [min: number, max: number];
    };
    letterSpacing: {
      hero: string;
      body: string;
    };
  };

  temporalGuidelines: {
    bpm: [min: number, max: number];
    sceneDuration: {
      hook: [min: number, max: number];
      mid: [min: number, max: number];
      cta: [min: number, max: number];
    };
    totalDuration: [min: number, max: number];
    sceneCount: [min: number, max: number];
    transitionType: string;
    fadeOutFrames: [min: number, max: number];
  };

  compositionGuidelines: {
    spatialUtilization: {
      description: string;
      rules: string[];
      focalElementMinSize: {
        widthPercent: [min: number, max: number];
        heightPercent: [min: number, max: number];
      };
      supportingElementMaxSize: {
        widthPercent: [min: number, max: number];
      };
    };
    visualHierarchy: {
      description: string;
      rules: string[];
    };
    colorContrast: {
      description: string;
      rules: string[];
      minimumContrastRatio: number;
    };
  };
}

// ─── Registry ───────────────────────────────────────────────────────────────

export interface CategoryRegistry {
  version: string;
  categories: Category[];
}
