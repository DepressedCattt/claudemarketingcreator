/**
 * Shared ElevenLabs SFX prompt builder.
 * Used by CueDetailPopup (Generate button) and SfxPromptPanel.
 *
 * See docs/audio/elevenlabs-prompt-guide.md for the full reference.
 */

import type { CueEvent, CueEventType, CueIntensity } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

// ─── Style vocabulary per profile (multiple synonyms for variability) ────────

type StyleVocabPool = {
  materials:   string[];
  environment: string[];
  character:   string[];
};

const STYLE_POOLS: Record<string, StyleVocabPool> = {
  "snappy-saas": {
    materials: [
      "thin glass", "soft ceramic tap", "light polycarbonate",
      "smooth acrylic surface", "matte plastic", "delicate crystal",
    ],
    environment: [
      "quiet room, close microphone", "dampened studio",
      "intimate close-mic recording", "silent room",
    ],
    character: [
      "gentle iOS notification", "understated and minimal",
      "faint macOS system sound", "subtle Stripe-style chime",
      "delicate app UI feel", "clean digital whisper",
    ],
  },
  "dark-tech": {
    materials: [
      "smooth glass surface", "soft digital tone", "thin metallic resonance",
      "muted crystal", "dampened alloy", "quiet glass pane",
    ],
    environment: [
      "quiet dampened room", "soft padded studio",
      "hushed interior space", "muted close-mic booth",
    ],
    character: [
      "subtle futuristic UI sound", "understated and refined",
      "quiet sci-fi interface feel", "muted holographic tone",
      "gentle cyberpunk UI whisper", "faint digital dashboard sound",
    ],
  },
  "product-showcase": {
    materials: [
      "soft matte surface", "gentle ceramic", "quiet brushed finish",
      "smooth fabric", "light wood tap", "dampened leather",
    ],
    environment: [
      "quiet studio, intimate close-mic", "hushed product room",
      "silent showroom, close recording", "soft ambient studio",
    ],
    character: [
      "delicate product sound", "ASMR whisper-quiet",
      "premium unboxing feel", "gentle tactile moment",
      "intimate reveal sound", "soft luxury touch",
    ],
  },
  "kinetic-typography": {
    materials: [
      "light paper", "soft tap", "gentle click",
      "quiet snap", "faint pen stroke", "delicate stamp",
    ],
    environment: [
      "quiet dry room", "dampened studio",
      "silent recording booth", "close-mic dry space",
    ],
    character: [
      "gentle motion accent", "light and airy",
      "soft kinetic whisper", "faint typography feel",
      "quiet editorial moment", "delicate motion cue",
    ],
  },
};

const INTENSITY_POOLS: Record<CueIntensity, string[]> = {
  hard: [
    "quiet but clear, quick gentle tap",
    "soft defined onset, clean short decay",
    "understated but present, brief and controlled",
  ],
  medium: [
    "very quiet, soft and brief",
    "gentle and restrained, moderate fade",
    "faint but noticeable, smooth and short",
  ],
  soft: [
    "barely audible, whisper-quiet, ultra-gentle",
    "almost imperceptible, featherlight",
    "extremely faint, ghostly soft, airy",
  ],
};

export const CUE_TYPE_CATEGORY: Record<CueEventType, string> = {
  SCENE_CUT:   "very soft transition thud",
  TEXT_REVEAL:  "barely-there soft air whoosh",
  TEXT_IMPACT:  "gentle quiet tap",
  HERO_ENTRY:   "soft quiet swoosh",
  OBJECT_LAND:  "tiny delicate click",
  WIPE:         "gentle air movement",
  BEAT_LOCK:    "quiet soft tick",
  STAT_BUILD:   "quiet ascending soft digital beeps",
  CTA_REVEAL:   "gentle quiet chime",
  AMBIENT:      "very quiet ambient room tone",
};

export const CUE_COLORS: Record<string, string> = {
  SCENE_CUT:  "#ef4444",
  TEXT_REVEAL: "#8b5cf6",
  TEXT_IMPACT: "#f97316",
  HERO_ENTRY:  "#0ea5e9",
  OBJECT_LAND: "#10b981",
  WIPE:        "#ec4899",
  STAT_BUILD:  "#eab308",
  CTA_REVEAL:  "#06b6d4",
  AMBIENT:     "#6366f1",
  BEAT_LOCK:   "#a855f7",
};

// ─── Feedback adjustment presets ─────────────────────────────────────────────

export const FEEDBACK_PRESETS = [
  { id: "too-loud",    label: "Too loud",       modifier: "make it much quieter and more subtle" },
  { id: "too-harsh",   label: "Too harsh",      modifier: "soften the attack, remove any sharpness" },
  { id: "too-long",    label: "Too long",       modifier: "make it shorter and more abrupt" },
  { id: "too-short",   label: "Too short",      modifier: "extend the tail with a gentle fade" },
  { id: "too-bassy",   label: "Too bassy",      modifier: "remove all low frequencies, keep it thin and light" },
  { id: "too-digital", label: "Too digital",    modifier: "make it more organic and natural-sounding" },
  { id: "too-organic", label: "Too organic",     modifier: "make it more digital and synthesized" },
  { id: "more-air",    label: "More airy",      modifier: "add more breathiness and air" },
  { id: "more-click",  label: "More clicky",    modifier: "add a tiny precise click at the start" },
  { id: "more-reverb", label: "More space",     modifier: "add a very subtle room reverb tail" },
  { id: "less-reverb", label: "Less reverb",    modifier: "completely dry, no reverb or room sound" },
  { id: "more-tonal",  label: "More tonal",     modifier: "add a gentle pitched tone or chime quality" },
] as const;

export type FeedbackPresetId = typeof FEEDBACK_PRESETS[number]["id"];

/**
 * Build a context-aware ElevenLabs SFX prompt from a cue's properties,
 * the composition's style profile, and optional user feedback.
 *
 * Each call produces a slightly different prompt due to synonym randomization.
 */
export function buildElevenLabsPrompt(
  cue: CueEvent,
  fps: number,
  profile?: string,
  feedback?: string,
): string {
  const desc = cue.sfxDescription?.trim();
  const category = CUE_TYPE_CATEGORY[cue.type] ?? "";
  const primary = desc || category;
  if (!primary) return "";

  const durationSec = (cue.duration / fps).toFixed(1);
  const pool = STYLE_POOLS[profile ?? ""] ?? STYLE_POOLS["snappy-saas"];

  const materialPick  = pickN(pool.materials, 2).join(", ");
  const envPick       = pick(pool.environment);
  const shapePick     = pick(INTENSITY_POOLS[cue.intensity] ?? INTENSITY_POOLS.medium);
  const characterPick = pick(pool.character);

  const parts = [
    "Very quiet and subtle:",
    primary,
    materialPick,
    envPick,
    shapePick,
    characterPick,
    `${durationSec}s`,
  ];

  if (feedback?.trim()) {
    parts.push(feedback.trim());
  }

  parts.push("low volume, no bass, no distortion, no music, no voice");

  return parts.join(", ");
}
