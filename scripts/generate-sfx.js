#!/usr/bin/env node
/**
 * generate-sfx.js — Generate SFX via ElevenLabs Sound Effects API
 *
 * Usage:
 *   node scripts/generate-sfx.js --type SCENE_CUT --intensity hard --prompt "cinematic impact hit with reverb tail"
 *   node scripts/generate-sfx.js --batch                    # Generate candidates for all categories
 *   node scripts/generate-sfx.js --list                     # List library contents
 *   node scripts/generate-sfx.js --set-default <id>         # Set an entry as default for its category
 *
 * Requires ELEVENLABS_API_KEY in .env
 */

const fs   = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

// Load .env manually (no extra dependency)
const envPath = path.join(ROOT, ".env");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([^#=]+?)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const SFX_DIR      = path.join(ROOT, "public", "audio", "sfx");
const LIBRARY_PATH = path.join(SFX_DIR, "library.json");
const API_KEY      = process.env.ELEVENLABS_API_KEY;
const API_URL      = "https://api.elevenlabs.io/v1/sound-generation";

const CATEGORY_PROMPTS = {
  "SCENE_CUT:hard":     "cinematic impact hit, dramatic whoosh with reverb tail, film trailer transition",
  "SCENE_CUT:medium":   "medium weight transition whoosh, clean and modern",
  "TEXT_REVEAL:soft":    "subtle soft shimmer, gentle air movement, delicate text appearance",
  "TEXT_IMPACT:hard":    "punchy snap impact, sharp text slam, bold and decisive",
  "TEXT_IMPACT:medium":  "clean click snap, moderate text entrance, crisp",
  "HERO_ENTRY:hard":    "rising swoosh building to impact, object flying into frame, cinematic arrival",
  "HERO_ENTRY:medium":  "smooth glide in sound, gentle arrival, modern UI element appearing",
  "OBJECT_LAND:medium": "soft UI click, card snapping into place, satisfying digital interaction",
  "OBJECT_LAND:soft":   "very subtle pop, tiny click, minimal interface sound",
  "WIPE:medium":        "directional sweep sound, horizontal brush stroke, clean reveal",
  "STAT_BUILD:hard":    "counter building impact, number reveal hit, data visualization emphasis",
  "STAT_BUILD:medium":  "moderate counting tick, stat appearance, clean digital",
  "CTA_REVEAL:medium":  "bright chime, call to action bell, conclusive and inviting",
  "AMBIENT:soft":       "gentle background shimmer, soft atmospheric pad, subtle ambience",
  "BEAT_LOCK:medium":   "rhythmic pulse click, tempo establishing beat, clean metronome tick",
};

const CATEGORY_DIRS = {
  SCENE_CUT:  "scene-cut",
  TEXT_REVEAL: "text-reveal",
  TEXT_IMPACT: "text-impact",
  HERO_ENTRY:  "hero-entry",
  OBJECT_LAND: "object-land",
  WIPE:        "wipe",
  STAT_BUILD:  "stat-build",
  CTA_REVEAL:  "cta-reveal",
  AMBIENT:     "ambient",
  BEAT_LOCK:   "scene-cut",
};

function loadLibrary() {
  return JSON.parse(fs.readFileSync(LIBRARY_PATH, "utf-8"));
}

function saveLibrary(lib) {
  fs.writeFileSync(LIBRARY_PATH, JSON.stringify(lib, null, 2) + "\n");
}

function nextId(lib, category, intensity) {
  const prefix = `${CATEGORY_DIRS[category] || category.toLowerCase()}-${intensity}`;
  const existing = lib.entries.filter(e => e.id.startsWith(prefix));
  const num = String(existing.length + 1).padStart(3, "0");
  return `${prefix}-${num}`;
}

async function generateSfx(type, intensity, prompt, durationSeconds) {
  durationSeconds = durationSeconds || 1.0;
  if (!API_KEY) {
    console.error("Error: ELEVENLABS_API_KEY not set in .env");
    process.exit(1);
  }

  const effectivePrompt = prompt || CATEGORY_PROMPTS[`${type}:${intensity}`] || `${type} ${intensity} sound effect`;

  console.log(`Generating: ${type}:${intensity}`);
  console.log(`  Prompt: "${effectivePrompt}"`);
  console.log(`  Duration: ${durationSeconds}s`);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "xi-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: effectivePrompt,
      duration_seconds: durationSeconds,
      prompt_influence: 0.5,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs API error (${res.status}): ${err}`);
  }

  const lib = loadLibrary();
  const id = nextId(lib, type, intensity);
  const dir = CATEGORY_DIRS[type] || type.toLowerCase();
  const filename = `${id}.mp3`;
  const filepath = path.join(SFX_DIR, dir, filename);

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  const entry = {
    id,
    file: `${dir}/${filename}`,
    category: type,
    intensity,
    tags: effectivePrompt.split(/[,\s]+/).filter(w => w.length > 3),
    durationMs: Math.round(durationSeconds * 1000),
    source: "elevenlabs",
    prompt: effectivePrompt,
    rating: 0,
    default: false,
    createdAt: new Date().toISOString(),
  };

  lib.entries.push(entry);
  saveLibrary(lib);

  console.log(`  Saved: ${filepath}`);
  console.log(`  ID: ${id}`);
  return entry;
}

async function batchGenerate(count) {
  count = count || 2;
  const categories = Object.keys(CATEGORY_PROMPTS);
  console.log(`Batch generating ${count} candidate(s) for ${categories.length} categories...\n`);

  for (const key of categories) {
    const [type, intensity] = key.split(":");
    for (let i = 0; i < count; i++) {
      try {
        await generateSfx(type, intensity, null, intensity === "soft" ? 0.8 : 1.0);
      } catch (err) {
        console.error(`  Failed: ${err.message}`);
      }
      if (i < count - 1) await new Promise(r => setTimeout(r, 500));
    }
    console.log();
  }
  console.log("Batch generation complete.");
}

function listLibrary() {
  const lib = loadLibrary();
  if (lib.entries.length === 0) {
    console.log("Library is empty. Run with --batch to generate initial SFX.");
    return;
  }

  console.log(`\nSFX Library (${lib.entries.length} entries)\n`);
  console.log("ID".padEnd(28) + "Category".padEnd(16) + "Intensity".padEnd(10) + "Rating".padEnd(8) + "Default");
  console.log("-".repeat(75));

  const grouped = {};
  for (const e of lib.entries) {
    const key = `${e.category}:${e.intensity}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  }

  for (const [key, entries] of Object.entries(grouped).sort()) {
    for (const e of entries) {
      const def = e.default || lib.defaults[key] === e.id ? " *" : "";
      console.log(
        e.id.padEnd(28) +
        e.category.padEnd(16) +
        e.intensity.padEnd(10) +
        String(e.rating || 0).padEnd(8) +
        def
      );
    }
  }
}

function setDefault(id) {
  const lib = loadLibrary();
  const entry = lib.entries.find(e => e.id === id);
  if (!entry) {
    console.error(`Entry "${id}" not found.`);
    process.exit(1);
  }

  const key = `${entry.category}:${entry.intensity}`;
  lib.defaults[key] = id;

  for (const e of lib.entries) {
    if (`${e.category}:${e.intensity}` === key) {
      e.default = e.id === id;
    }
  }

  saveLibrary(lib);
  console.log(`Set "${id}" as default for ${key}`);
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--list")) {
  listLibrary();
} else if (args.includes("--batch")) {
  const countIdx = args.indexOf("--count");
  const count = countIdx >= 0 ? parseInt(args[countIdx + 1], 10) : 2;
  batchGenerate(count).catch(err => { console.error(err); process.exit(1); });
} else if (args.includes("--set-default")) {
  const idx = args.indexOf("--set-default");
  setDefault(args[idx + 1]);
} else if (args.includes("--type")) {
  const typeIdx = args.indexOf("--type");
  const intIdx = args.indexOf("--intensity");
  const promptIdx = args.indexOf("--prompt");
  const durIdx = args.indexOf("--duration");

  const type = args[typeIdx + 1];
  const intensity = intIdx >= 0 ? args[intIdx + 1] : "medium";
  const prompt = promptIdx >= 0 ? args[promptIdx + 1] : null;
  const duration = durIdx >= 0 ? parseFloat(args[durIdx + 1]) : 1.0;

  generateSfx(type, intensity, prompt, duration).catch(err => {
    console.error(err);
    process.exit(1);
  });
} else {
  console.log(`
SFX Generator — ElevenLabs Sound Effects API

Usage:
  node scripts/generate-sfx.js --type SCENE_CUT --intensity hard [--prompt "..."] [--duration 1.0]
  node scripts/generate-sfx.js --batch [--count 2]
  node scripts/generate-sfx.js --list
  node scripts/generate-sfx.js --set-default <entry-id>

Environment:
  ELEVENLABS_API_KEY must be set in .env
  `);
}
