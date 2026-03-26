/**
 * compare-ads.js — Visual comparison of a reference ad vs a Remotion render.
 *
 * Usage (standalone):
 *   node scripts/compare-ads.js <reference.mp4> <rendered.mp4> <compId> [iterN]
 *   npm run compare ./reference-ads/langease.mp4 ./out/langease-v1.mp4 langease-v1
 *
 * Spawned by studio-api.js /compare-ads endpoint.
 * Progress emitted to stdout as tagged lines: [STAGE], [INFO], [PROGRESS], [DONE], [ERROR]
 *
 * Output:
 *   compare-results/<compId>-iter<N>.json  — structured score + fix list
 *
 * Requires: GEMINI_API_KEY in .env at project root.
 */

const fs   = require("fs");
const path = require("path");

// ─── Load .env ────────────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const ROOT            = path.join(__dirname, "..");
const RESULTS_DIR     = path.join(ROOT, "compare-results");

fs.mkdirSync(RESULTS_DIR, { recursive: true });

// ─── Progress logger (parsed by studio-api.js) ───────────────────────────────
function log(type, data) {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  process.stdout.write(`[${type.toUpperCase()}] ${payload}\n`);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ─── Get next iteration index for this compId ────────────────────────────────
function getNextIter(compId) {
  const files = fs.readdirSync(RESULTS_DIR).filter((f) =>
    f.startsWith(`${compId}-iter`) && f.endsWith(".json")
  );
  if (files.length === 0) return 1;
  const nums = files.map((f) => {
    const m = f.match(/-iter(\d+)\.json$/);
    return m ? parseInt(m[1], 10) : 0;
  });
  return Math.max(...nums) + 1;
}

// ─── Comparison prompt ────────────────────────────────────────────────────────
const COMPARE_PROMPT = `
You are a senior motion designer comparing two marketing video ads.

The FIRST video is the REFERENCE ad (the target to match).
The SECOND video is the ATTEMPT — a programmatic Remotion recreation.

Your job is to score the attempt, identify the most impactful discrepancies,
and output parameter-level deltas that map directly to animation engine settings.

Score the attempt across 5 categories (0–20 points each, 100 total):

1. **Color fidelity** — Does the background, text, accent color, and gradient palette match the reference? Are the exact hues correct?
2. **Motion timing** — Do scene durations, stagger timings, easing curves, and transition speeds feel the same?
3. **Typography** — Do font weight, size hierarchy, text reveal method (blur-in, slide, scale), and stagger timing match?
4. **Layout & composition** — Does element placement, focal point, negative space usage, and card/UI positioning match?
5. **Kinetic energy** — Does the overall weight, speed, snappiness, and "feel" of the motion match the reference?

For each discrepancy, provide a concrete code-level fix that a Remotion developer can apply.

PARAMETER TAXONOMY — use these exact parameter names in parameterDeltas:
  L1 Physics: spring.stiffness, spring.damping, spring.mass, easing.type, stagger.framesPerItem
  L2 Visual: blur.textReveal, blur.heroResolve, scale.textEntrance, scale.heroEntrance, translate.textDrift, translate.heroArc, float.amplitude, float.periodFrames
  L3 Composition: type.heroSize, type.headlineSize, type.bodySize, type.heroWeight, type.heroLetterSpacing, color.background, color.text, color.accent, layout.padding, layout.borderRadius
  L4 Temporal: tempo.bpm, scene.hookDuration, scene.midDuration, scene.ctaDuration, scene.total, transition.duration
  L5 Technique: technique.textReveal, technique.heroEntrance, technique.sceneTransition, technique.camera, technique.layout

STYLE PROFILES — classify the reference ad as one of:
  snappy-saas | luxury-slow | kinetic-typography | dark-tech | product-showcase

IMPORTANT: Output ONLY valid JSON. No prose before or after. No markdown code fences.

Required JSON schema:
{
  "overallScore": <number 0-100>,
  "detectedProfile": "<snappy-saas|luxury-slow|kinetic-typography|dark-tech|product-showcase>",
  "categories": {
    "colors":        { "score": <0-20>, "max": 20, "note": "<specific observation>" },
    "motionTiming":  { "score": <0-20>, "max": 20, "note": "<specific observation>" },
    "typography":    { "score": <0-20>, "max": 20, "note": "<specific observation>" },
    "layout":        { "score": <0-20>, "max": 20, "note": "<specific observation>" },
    "kineticEnergy": { "score": <0-20>, "max": 20, "note": "<specific observation>" }
  },
  "fixes": [
    {
      "priority": <1 = highest impact>,
      "category": "<colors|motionTiming|typography|layout|kineticEnergy>",
      "issue": "<what is wrong, with specific timestamps if relevant>",
      "codeHint": "<exact Remotion/CSS/value change to make, e.g. 'Change spring stiffness from 90 to 200, damping from 22 to 25'>"
    }
  ],
  "parameterDeltas": [
    {
      "parameter": "<parameter name from taxonomy above>",
      "level": "<L1|L2|L3|L4|L5>",
      "current_estimated": "<current value in the attempt, as number or string>",
      "target_estimated": "<target value to match the reference, as number or string>",
      "confidence": <0.0-1.0>,
      "reasoning": "<why this parameter needs to change>"
    }
  ],
  "iterationNote": "<single sentence: the single biggest gap to close this iteration>"
}

Provide 3–7 fixes, ordered by impact (most important first).
Provide 3–10 parameterDeltas, ordered by confidence (highest first).
Be specific: mention frame counts, pixel values, color hex codes, spring configs, easing types.
`.trim();

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const refPath      = process.argv[2];
  const renderedPath = process.argv[3];
  const compId       = process.argv[4] || "unknown";
  const forceIter    = process.argv[5] ? parseInt(process.argv[5], 10) : null;

  if (!refPath || !renderedPath) {
    log("error", "Usage: node scripts/compare-ads.js <reference.mp4> <rendered.mp4> <compId> [iterN]");
    process.exit(1);
  }
  if (!fs.existsSync(refPath)) {
    log("error", `Reference file not found: ${refPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(renderedPath)) {
    log("error", `Rendered file not found: ${renderedPath}`);
    process.exit(1);
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    log("error", "GEMINI_API_KEY not set. Add it to .env at the project root.");
    process.exit(1);
  }

  const { GoogleGenerativeAI }             = require("@google/generative-ai");
  const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");

  const fileManager = new GoogleAIFileManager(API_KEY);
  const genAI       = new GoogleGenerativeAI(API_KEY);

  // ── Step 1: Upload reference ─────────────────────────────────────────────────
  log("stage", "uploading_reference");
  log("info",  `Uploading reference: ${path.basename(refPath)}`);

  const refExt      = path.extname(refPath).toLowerCase();
  const refMime     = refExt === ".mov" ? "video/quicktime" : "video/mp4";
  const refUpload   = await fileManager.uploadFile(refPath, {
    mimeType:    refMime,
    displayName: `reference-${path.basename(refPath)}`,
  });
  log("info", `Reference uploaded. URI: ${refUpload.file.uri}`);

  // ── Step 2: Upload rendered ──────────────────────────────────────────────────
  log("stage", "uploading_rendered");
  log("info",  `Uploading rendered: ${path.basename(renderedPath)}`);

  const renExt      = path.extname(renderedPath).toLowerCase();
  const renMime     = renExt === ".mov" ? "video/quicktime" : "video/mp4";
  const renUpload   = await fileManager.uploadFile(renderedPath, {
    mimeType:    renMime,
    displayName: `rendered-${path.basename(renderedPath)}`,
  });
  log("info", `Rendered uploaded. URI: ${renUpload.file.uri}`);

  // ── Step 3: Wait for both to process ────────────────────────────────────────
  log("stage", "processing");
  log("info",  "Waiting for Gemini to process both videos...");

  let refFile = await fileManager.getFile(refUpload.file.name);
  let renFile = await fileManager.getFile(renUpload.file.name);
  let ticks   = 0;

  while (refFile.state === FileState.PROCESSING || renFile.state === FileState.PROCESSING) {
    await sleep(4000);
    [refFile, renFile] = await Promise.all([
      fileManager.getFile(refUpload.file.name),
      fileManager.getFile(renUpload.file.name),
    ]);
    ticks++;
    log("progress", ticks);
  }

  if (refFile.state === FileState.FAILED) {
    log("error", "Reference video processing failed by Gemini.");
    process.exit(1);
  }
  if (renFile.state === FileState.FAILED) {
    log("error", "Rendered video processing failed by Gemini.");
    process.exit(1);
  }

  log("info", "Both videos processed. Starting comparison...");

  // ── Step 4: Compare — Gemini 2.5 Pro sees both videos simultaneously ─────────
  log("stage", "comparing");
  log("info",  "Sending both videos to Gemini 2.5 Pro for visual comparison...");

  const proModel  = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const proResult = await proModel.generateContent([
    { text: "FIRST VIDEO — REFERENCE (target to match):" },
    { fileData: { mimeType: refFile.mimeType, fileUri: refFile.uri } },
    { text: "SECOND VIDEO — ATTEMPT (the Remotion recreation to evaluate):" },
    { fileData: { mimeType: renFile.mimeType, fileUri: renFile.uri } },
    { text: COMPARE_PROMPT },
  ]);

  const rawText = proResult.response.text();
  log("info", `Comparison complete. ${rawText.length} characters returned.`);

  // ── Step 5: Parse JSON (with fallback cleanup) ───────────────────────────────
  log("stage", "writing");

  let result;
  try {
    // Strip any accidental markdown fences Gemini might add
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    result = JSON.parse(cleaned);
  } catch (parseErr) {
    log("error", `Failed to parse Gemini JSON response: ${parseErr.message}`);
    log("error", `Raw response (first 500 chars): ${rawText.slice(0, 500)}`);
    process.exit(1);
  }

  // ── Step 6: Write result to compare-results/ ────────────────────────────────
  const iterN    = forceIter ?? getNextIter(compId);
  const filename = `${compId}-iter${iterN}.json`;
  const outPath  = path.join(RESULTS_DIR, filename);

  const output = {
    compId,
    iterN,
    timestamp:        new Date().toISOString(),
    referenceFile:    path.basename(refPath),
    renderedFile:     path.basename(renderedPath),
    overallScore:     result.overallScore     ?? 0,
    detectedProfile:  result.detectedProfile  ?? null,
    categories:       result.categories       ?? {},
    fixes:            result.fixes            ?? [],
    parameterDeltas:  result.parameterDeltas  ?? [],
    iterationNote:    result.iterationNote    ?? "",
    rawGeminiText:    rawText,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  log("info", `Result written to compare-results/${filename}`);

  log("done", JSON.stringify({
    compId,
    iterN,
    filename,
    overallScore: output.overallScore,
    fixCount:     output.fixes.length,
  }));
}

main().catch((err) => {
  log("error", err.message ?? String(err));
  process.exit(1);
});
