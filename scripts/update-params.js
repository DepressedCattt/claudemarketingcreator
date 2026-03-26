/**
 * update-params.js — Parameter log updater.
 *
 * Two modes:
 *   1. Post-comparison: reads compare-results/<compId>-iter<N>.json, extracts deltas.
 *      node scripts/update-params.js <compId>
 *
 *   2. From extraction: reads an extracted params manifest and populates docs/.
 *      node scripts/update-params.js --from-extraction <extracted.params.json>
 *
 * Spawned automatically by studio-api.js after a comparison completes,
 * or run manually after any compare-ads or extract-lottie run.
 */

const fs   = require("fs");
const path = require("path");

const ROOT         = path.join(__dirname, "..");
const RESULTS_DIR  = path.join(ROOT, "compare-results");
const LOG_PATH     = path.join(ROOT, "docs", "parameter-log.json");
const PROFILES_DIR = path.join(ROOT, "docs", "profiles");
const RECIPES_DIR  = path.join(ROOT, "docs", "recipes");
const PARAMS_DIR   = path.join(ROOT, "docs", "params");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function findLatestResult(compId) {
  if (!fs.existsSync(RESULTS_DIR)) return null;
  const files = fs.readdirSync(RESULTS_DIR)
    .filter((f) => f.startsWith(`${compId}-iter`) && f.endsWith(".json"))
    .sort();
  if (files.length === 0) return null;
  const latest = files[files.length - 1];
  return JSON.parse(fs.readFileSync(path.join(RESULTS_DIR, latest), "utf8"));
}

function findPreviousResult(compId, currentIterN) {
  if (!fs.existsSync(RESULTS_DIR) || currentIterN <= 1) return null;
  const prevFile = `${compId}-iter${currentIterN - 1}.json`;
  const prevPath = path.join(RESULTS_DIR, prevFile);
  if (!fs.existsSync(prevPath)) return null;
  return JSON.parse(fs.readFileSync(prevPath, "utf8"));
}

function loadLog() {
  if (!fs.existsSync(LOG_PATH)) {
    return { description: "Parameter evolution log", entries: [] };
  }
  return JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
}

function saveLog(log) {
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2), "utf8");
}

// ─── Extraction Mode ─────────────────────────────────────────────────────────

function handleExtraction(manifestPath) {
  const abs = path.isAbsolute(manifestPath) ? manifestPath : path.join(process.cwd(), manifestPath);
  if (!fs.existsSync(abs)) {
    console.error("Manifest not found: " + abs);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(abs, "utf8"));
  const name = manifest.templateName;
  console.log("\n  Importing extracted params: " + name);

  const log = loadLog();
  const entry = {
    compId:      name,
    iterN:       0,
    timestamp:   manifest.extractedAt,
    score:       null,
    profile:     manifest.detectedProfile ? manifest.detectedProfile.profile : null,
    scoreChange: null,
    deltasCount: 0,
    deltas:      [],
    source:      "extraction",
    sourceFile:  manifest.sourceFile,
  };

  const existingIdx = log.entries.findIndex(
    (e) => e.compId === name && e.source === "extraction"
  );
  if (existingIdx >= 0) {
    log.entries[existingIdx] = entry;
  } else {
    log.entries.push(entry);
  }
  saveLog(log);

  // Update profile doc if detected
  if (manifest.detectedProfile) {
    const dp = manifest.detectedProfile;
    const profileFile = path.join(PROFILES_DIR, dp.profile + ".md");
    if (fs.existsSync(profileFile)) {
      let content = fs.readFileSync(profileFile, "utf8");
      if (!content.includes(manifest.templateName)) {
        const refIdx = content.indexOf("## Reference compositions");
        if (refIdx >= 0) {
          const nextSection = content.indexOf("\n---", refIdx + 10);
          const insertAt = nextSection >= 0 ? nextSection : content.length;
          const refLine = "\n- " + name + " (extracted from " + manifest.sourceFile + ")";
          content = content.slice(0, insertAt) + refLine + "\n" + content.slice(insertAt);
          fs.writeFileSync(profileFile, content, "utf8");
          console.log("  Updated profile: " + dp.profile);
        }
      }
    }
  }

  // Update recipe docs for detected techniques
  fs.mkdirSync(RECIPES_DIR, { recursive: true });
  for (const tech of manifest.l5_techniques) {
    const recipeFile = path.join(RECIPES_DIR, tech.name + ".md");
    if (fs.existsSync(recipeFile)) {
      let content = fs.readFileSync(recipeFile, "utf8");
      if (!content.includes(name)) {
        content += "\n- Seen in: " + name + " (confidence: " + tech.confidence + ")\n";
        fs.writeFileSync(recipeFile, content, "utf8");
        console.log("  Updated recipe: " + tech.name);
      }
    }
  }

  // Update physics doc with extracted spring averages
  const physFile = path.join(PARAMS_DIR, "physics.md");
  if (fs.existsSync(physFile)) {
    let content = fs.readFileSync(physFile, "utf8");
    if (!content.includes(name)) {
      const springs = manifest.l1_physics.springs;
      if (springs.length > 0) {
        const avgS = Math.round(springs.reduce((s, v) => s + v.stiffness, 0) / springs.length);
        const avgD = Math.round(springs.reduce((s, v) => s + v.damping, 0) / springs.length);
        const avgM = +(springs.reduce((s, v) => s + v.mass, 0) / springs.length).toFixed(2);
        const line = "\n\n## Extracted Sources\n\n- **" + name + "**: avg stiffness=" + avgS +
          ", damping=" + avgD + ", mass=" + avgM + "\n";
        content += line;
        fs.writeFileSync(physFile, content, "utf8");
        console.log("  Updated physics doc");
      }
    }
  }

  console.log("  Done: log + docs updated for " + name + "\n");
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  if (process.argv[2] === "--from-extraction") {
    const manifestPath = process.argv[3];
    if (!manifestPath) {
      console.error("Usage: node scripts/update-params.js --from-extraction <params.json>");
      process.exit(1);
    }
    return handleExtraction(manifestPath);
  }

  const compId = process.argv[2];
  if (!compId) {
    console.error("Usage: node scripts/update-params.js <compId>");
    console.error("       node scripts/update-params.js --from-extraction <params.json>");
    process.exit(1);
  }

  const result = findLatestResult(compId);
  if (!result) {
    console.error(`No compare-results found for compId: ${compId}`);
    process.exit(1);
  }

  const prev = findPreviousResult(compId, result.iterN);
  const scoreChange = prev ? result.overallScore - prev.overallScore : null;

  const deltas = (result.parameterDeltas || []).map((d) => ({
    param:      d.parameter,
    level:      d.level,
    from:       d.current_estimated,
    to:         d.target_estimated,
    confidence: d.confidence,
  }));

  const entry = {
    compId:         result.compId,
    iterN:          result.iterN,
    timestamp:      result.timestamp,
    score:          result.overallScore,
    profile:        result.detectedProfile || null,
    scoreChange,
    deltasCount:    deltas.length,
    deltas,
  };

  const log = loadLog();

  // Avoid duplicate entries for the same compId + iterN
  const existingIdx = log.entries.findIndex(
    (e) => e.compId === entry.compId && e.iterN === entry.iterN
  );
  if (existingIdx >= 0) {
    log.entries[existingIdx] = entry;
    console.log(`Updated existing entry: ${compId} iter${result.iterN}`);
  } else {
    log.entries.push(entry);
    console.log(`Appended new entry: ${compId} iter${result.iterN}`);
  }

  saveLog(log);

  // ── Summary output ──────────────────────────────────────────────────────────
  console.log(`\n  Score: ${result.overallScore}/100` +
    (scoreChange !== null ? ` (${scoreChange >= 0 ? "+" : ""}${scoreChange} from iter${result.iterN - 1})` : ""));
  console.log(`  Profile: ${result.detectedProfile || "unknown"}`);
  console.log(`  Parameter deltas: ${deltas.length}`);

  if (deltas.length > 0) {
    console.log("\n  High-confidence deltas (>= 0.8):");
    const highConf = deltas.filter((d) => d.confidence >= 0.8);
    if (highConf.length === 0) {
      console.log("    (none)");
    } else {
      for (const d of highConf) {
        const improved = scoreChange !== null && scoreChange > 0;
        const marker = improved ? " ✓ (score improved)" : "";
        console.log(`    ${d.param}: ${d.from} → ${d.to} (${(d.confidence * 100).toFixed(0)}% conf)${marker}`);
      }
    }
  }

  // ── Report parameter trends ─────────────────────────────────────────────────
  const compEntries = log.entries.filter((e) => e.compId === compId);
  if (compEntries.length >= 2) {
    console.log(`\n  Score trend for ${compId}:`);
    for (const e of compEntries) {
      const changeStr = e.scoreChange !== null
        ? ` (${e.scoreChange >= 0 ? "+" : ""}${e.scoreChange})`
        : "";
      console.log(`    iter${e.iterN}: ${e.score}/100${changeStr}`);
    }
  }

  console.log(`\n  Log saved to docs/parameter-log.json\n`);
}

main();
