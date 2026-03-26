#!/usr/bin/env node
/**
 * render-sfx-stem.js — Generate an SFX audio stem from a composition's CueEvents
 *
 * Reads the composition's cue array, maps each cue to an SFX library entry,
 * and uses ffmpeg to combine them into a single audio stem at the correct time offsets.
 *
 * Usage:
 *   node scripts/render-sfx-stem.js --comp animly-v1
 *   node scripts/render-sfx-stem.js --comp pulse-v1 --density normal
 *   node scripts/render-sfx-stem.js --comp apex-v1 --output renders/apex-sfx.wav
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SFX_DIR = path.join(ROOT, "public", "audio", "sfx");
const LIBRARY_PATH = path.join(SFX_DIR, "library.json");
const OUT_DIR = path.join(ROOT, "renders");

fs.mkdirSync(OUT_DIR, { recursive: true });

function loadLibrary() {
  return JSON.parse(fs.readFileSync(LIBRARY_PATH, "utf-8"));
}

function getDefaultSfx(lib, category, intensity) {
  const key = `${category}:${intensity}`;
  const defaultId = lib.defaults[key];
  if (defaultId) {
    const entry = lib.entries.find(e => e.id === defaultId);
    if (entry) return entry;
  }
  const candidates = lib.entries.filter(
    e => e.category === category && e.intensity === intensity && e.rating > 0
  );
  if (candidates.length > 0) {
    candidates.sort((a, b) => b.rating - a.rating);
    return candidates[0];
  }
  const any = lib.entries.find(
    e => e.category === category && e.intensity === intensity
  );
  return any || null;
}

function loadCues(compId) {
  const registryPath = path.join(ROOT, "studio", "src", "registry.ts");
  const registryContent = fs.readFileSync(registryPath, "utf-8");

  const idMatch = registryContent.match(new RegExp(`id:\\s*"${compId}"[\\s\\S]*?cues:\\s*(\\w+)`));
  if (!idMatch) {
    console.error(`No cues found for composition "${compId}" in registry.ts`);
    console.error("Make sure the composition has a 'cues' field in its registry entry.");
    return null;
  }

  const cuesVarName = idMatch[1];
  const compFiles = fs.readdirSync(path.join(ROOT, "src", "compositions"))
    .filter(f => f.endsWith(".tsx") || f.endsWith(".ts"));

  for (const file of compFiles) {
    const content = fs.readFileSync(path.join(ROOT, "src", "compositions", file), "utf-8");
    if (content.includes(`export const ${cuesVarName}`)) {
      const match = content.match(new RegExp(`export const ${cuesVarName}[^=]*=\\s*(\\[[\\s\\S]*?\\]);`));
      if (match) {
        try {
          const cleaned = match[1]
            .replace(/\/\/[^\n]*/g, "")
            .replace(/,\s*]/g, "]")
            .replace(/,\s*}/g, "}")
            .replace(/(\w+):/g, '"$1":');
          return JSON.parse(cleaned);
        } catch {
          console.error(`Failed to parse cues from ${file}. Export them as JSON instead.`);
          return null;
        }
      }
    }
  }

  console.error(`Could not find exported ${cuesVarName} in any composition file.`);
  return null;
}

function buildSfxStem(compId, densityPreset = "normal", outputPath) {
  const lib = loadLibrary();
  const densityConfig = lib.densityPresets[densityPreset];
  if (!densityConfig) {
    console.error(`Unknown density preset: ${densityPreset}`);
    process.exit(1);
  }

  const cues = loadCues(compId);
  if (!cues || cues.length === 0) {
    console.error("No cues to render.");
    process.exit(1);
  }

  const priorityMap = {
    SCENE_CUT: 10, HERO_ENTRY: 9, TEXT_IMPACT: 8, CTA_REVEAL: 7,
    STAT_BUILD: 6, WIPE: 5, TEXT_REVEAL: 4, OBJECT_LAND: 3,
    BEAT_LOCK: 5, AMBIENT: 1,
  };

  let filtered = cues
    .map(c => ({ ...c, priority: priorityMap[c.type] || 3 }))
    .filter(c => c.priority >= densityConfig.minPriority);

  filtered.sort((a, b) => a.frame - b.frame);
  const consolidated = [];
  for (const cue of filtered) {
    const last = consolidated[consolidated.length - 1];
    if (last && Math.abs(cue.frame - last.frame) <= 8) {
      if (cue.priority > last.priority) {
        consolidated[consolidated.length - 1] = cue;
      }
    } else {
      consolidated.push(cue);
    }
  }

  console.log(`\nComposition: ${compId}`);
  console.log(`Density: ${densityPreset} (priority >= ${densityConfig.minPriority})`);
  console.log(`Cues: ${cues.length} total → ${consolidated.length} after filtering + consolidation\n`);

  const sfxPlacements = [];
  const volumeScale = { hard: 1.0, medium: 0.7, soft: 0.4 };

  for (const cue of consolidated) {
    const sfx = getDefaultSfx(lib, cue.type, cue.intensity);
    if (!sfx) {
      console.log(`  [SKIP] f${cue.frame} ${cue.type}:${cue.intensity} — no SFX in library`);
      continue;
    }
    const timeSec = cue.frame / 30;
    const vol = volumeScale[cue.intensity] || 0.7;
    sfxPlacements.push({
      file: path.join(SFX_DIR, sfx.file),
      time: timeSec,
      volume: vol,
      label: cue.label,
      cue,
    });
    console.log(`  [SFX] ${timeSec.toFixed(2)}s f${cue.frame} ${cue.type}:${cue.intensity} → ${sfx.id} (vol ${vol})`);
  }

  if (sfxPlacements.length === 0) {
    console.log("\nNo SFX mapped. Library may be empty. Run: node scripts/generate-sfx.js --batch");
    return;
  }

  const output = outputPath || path.join(OUT_DIR, `${compId}-sfx-stem.wav`);

  const maxDuration = Math.max(...sfxPlacements.map(p => p.time + 3)) + 1;
  const inputs = sfxPlacements.map((p, i) => `-i "${p.file}"`).join(" ");
  const delays = sfxPlacements.map((p, i) => {
    const delayMs = Math.round(p.time * 1000);
    return `[${i}]adelay=${delayMs}|${delayMs},volume=${p.volume}[s${i}]`;
  }).join("; ");
  const mixInputs = sfxPlacements.map((_, i) => `[s${i}]`).join("");
  const filterComplex = `${delays}; ${mixInputs}amix=inputs=${sfxPlacements.length}:duration=longest[out]`;

  const cmd = `ffmpeg -y ${inputs} -filter_complex "${filterComplex}" -map "[out]" -t ${maxDuration} "${output}"`;

  console.log(`\nRendering SFX stem → ${output}`);
  try {
    execSync(cmd, { stdio: "pipe", cwd: ROOT });
    console.log("SFX stem rendered successfully.");
  } catch (err) {
    console.error("ffmpeg error:", err.stderr?.toString() || err.message);
    console.log("\nGenerated command (for debugging):");
    console.log(cmd);
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const compIdx = args.indexOf("--comp");
const densityIdx = args.indexOf("--density");
const outputIdx = args.indexOf("--output");

if (compIdx < 0) {
  console.log(`
SFX Stem Renderer

Usage:
  node scripts/render-sfx-stem.js --comp <composition-id> [--density normal] [--output path.wav]

Density presets: minimal, normal (default), detailed, maximal
Requires ffmpeg installed and SFX library populated.
  `);
  process.exit(0);
}

const compId = args[compIdx + 1];
const density = densityIdx >= 0 ? args[densityIdx + 1] : "normal";
const output = outputIdx >= 0 ? args[outputIdx + 1] : null;

buildSfxStem(compId, density, output);
