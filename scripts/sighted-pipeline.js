/**
 * sighted-pipeline.js — End-to-end semantic SVG pipeline.
 *
 * Runs the full chain: trace → semantic optimize → recolor → split → render preview.
 * One command after GenerateImage produces animation-ready layer SVGs.
 *
 * Usage:
 *   node scripts/sighted-pipeline.js <reference-image> <output-dir> --color-map-file <map.json> --recolor-file <recolor.json>
 *
 * Example:
 *   node scripts/sighted-pipeline.js public/svg/green-task/ref/semantic-plant-reference.png public/svg/green-task --color-map-file public/svg/green-task/ref/color-map.json --recolor-file public/svg/green-task/ref/recolor-map.json
 *
 * Outputs:
 *   <output-dir>/traced.svg         — raw vtracer output
 *   <output-dir>/semantic.svg       — optimized with semantic groups
 *   <output-dir>/final.svg          — recolored to brand palette
 *   <output-dir>/layers/<group>.svg — one SVG per semantic group
 *   <output-dir>/preview.png        — rendered preview of final SVG
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--") && i + 1 < args.length) {
    flags[args[i].slice(2)] = args[++i];
  } else {
    positional.push(args[i]);
  }
}

const refImage = positional[0];
const outDir = positional[1];

if (!refImage || !outDir || !flags["color-map-file"]) {
  console.error([
    "Usage: node scripts/sighted-pipeline.js <reference-image> <output-dir>",
    "         --color-map-file <map.json> [--recolor-file <recolor.json>]",
    "         [--precision N] [--min-area N]",
  ].join("\n"));
  process.exit(1);
}

const refAbs = path.resolve(refImage);
const outAbs = path.resolve(outDir);
const scriptsDir = __dirname;

if (!fs.existsSync(refAbs)) {
  console.error(`Reference image not found: ${refAbs}`);
  process.exit(1);
}
if (!fs.existsSync(outAbs)) fs.mkdirSync(outAbs, { recursive: true });

const refDir = path.join(outAbs, "ref");
if (!fs.existsSync(refDir)) fs.mkdirSync(refDir, { recursive: true });

const archivedRef = path.join(refDir, path.basename(refAbs));
if (path.resolve(refAbs) !== path.resolve(archivedRef)) {
  fs.copyFileSync(refAbs, archivedRef);
  console.log(`Archived reference: ${path.basename(refAbs)} -> ${path.relative(process.cwd(), archivedRef)}`);
}

const traced = path.join(outAbs, "traced.svg");
const semantic = path.join(outAbs, "semantic.svg");
const final_ = path.join(outAbs, "final.svg");
const layersDir = path.join(outAbs, "layers");
const preview = path.join(outAbs, "preview.png");

const precision = flags.precision || "1";
const minArea = flags["min-area"] || "200";

function run(label, cmd) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${label}`);
  console.log(`${"=".repeat(60)}`);
  try {
    execSync(cmd, { encoding: "utf8", stdio: "inherit", timeout: 120000 });
  } catch (e) {
    console.error(`\nFAILED at step: ${label}`);
    console.error(e.message);
    process.exit(1);
  }
}

// Step 1: Trace
run("Step 1/5 — Trace reference image with vtracer",
  `node "${path.join(scriptsDir, "trace-image.js")}" "${refAbs}" "${traced}" --no-optimize`);

// Step 2: Semantic optimize
run("Step 2/5 — Semantic optimization (group by color)",
  `node "${path.join(scriptsDir, "optimize-svg.js")}" "${traced}" "${semantic}" --mode semantic --color-map-file "${path.resolve(flags["color-map-file"])}" --precision ${precision} --min-area ${minArea}`);

// Step 3: Recolor (optional — skip if no recolor file)
if (flags["recolor-file"]) {
  run("Step 3/5 — Recolor to brand palette",
    `node "${path.join(scriptsDir, "recolor-svg.js")}" "${semantic}" "${final_}" --map-file "${path.resolve(flags["recolor-file"])}"`);
} else {
  console.log("\n  [Step 3/5 — Recolor skipped (no --recolor-file provided)]");
  fs.copyFileSync(semantic, final_);
}

// Step 4: Split into layers
run("Step 4/5 — Split into per-group layer SVGs",
  `node "${path.join(scriptsDir, "split-svg-groups.js")}" "${final_}" "${layersDir}"`);

// Step 5: Render preview
run("Step 5/5 — Render preview PNG",
  `node "${path.join(scriptsDir, "render-svg.js")}" "${final_}" "${preview}" --width 1024`);

console.log(`\n${"=".repeat(60)}`);
console.log("  PIPELINE COMPLETE");
console.log(`${"=".repeat(60)}`);
console.log(`  Preview:  ${preview}`);
console.log(`  Layers:   ${layersDir}/`);
const layers = fs.readdirSync(layersDir).filter(f => f.endsWith(".svg"));
layers.forEach(l => console.log(`            - ${l}`));
console.log();
