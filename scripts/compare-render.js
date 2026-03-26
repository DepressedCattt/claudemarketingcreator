/**
 * compare-render.js — Render an SVG to PNG and compare against a reference PNG.
 *
 * Reports text-based metrics so the agent can assess quality without reading
 * the image (saves context window). For visual verification, use render-svg.js
 * and read the PNG directly.
 *
 * Usage:
 *   node scripts/compare-render.js <input.svg> <reference.png> [--width N]
 *
 * Outputs:
 *   - File size comparison (SVG and both PNGs)
 *   - Dimension comparison
 *   - Unique color count in each image
 *   - Pixel-level difference percentage (sampled)
 */

const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");
const { PNG } = require("pngjs");

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

const svgFile = positional[0];
const refFile = positional[1];

if (!svgFile || !refFile) {
  console.error("Usage: node scripts/compare-render.js <input.svg> <reference.png> [--width N]");
  process.exit(1);
}

const svgAbs = path.resolve(svgFile);
const refAbs = path.resolve(refFile);

if (!fs.existsSync(svgAbs)) { console.error(`SVG not found: ${svgAbs}`); process.exit(1); }
if (!fs.existsSync(refAbs)) { console.error(`Reference not found: ${refAbs}`); process.exit(1); }

const width = Number(flags.width) || 1024;

const svgContent = fs.readFileSync(svgAbs, "utf8").replace(/^\uFEFF/, "");
const svgBytes = Buffer.byteLength(svgContent, "utf8");

const resvg = new Resvg(Buffer.from(svgContent, "utf8"), {
  fitTo: { mode: "width", value: width },
});
const rendered = resvg.render();
const svgPng = rendered.asPng();
const svgPixels = new Uint8Array(rendered.pixels);
const svgW = rendered.width;
const svgH = rendered.height;

const refPngBuf = fs.readFileSync(refAbs);
const refImg = PNG.sync.read(refPngBuf);
const refPixels = new Uint8Array(refImg.data);
const refW = refImg.width;
const refH = refImg.height;

function countUniqueColors(pixels, w, h) {
  const colors = new Set();
  const step = Math.max(1, Math.floor((w * h) / 50000));
  for (let i = 0; i < w * h; i += step) {
    const off = i * 4;
    if (pixels[off + 3] < 10) continue;
    colors.add(`${pixels[off]},${pixels[off + 1]},${pixels[off + 2]}`);
  }
  return colors.size;
}

function computeDiffPercent(pxA, wA, hA, pxB, wB, hB) {
  const minW = Math.min(wA, wB);
  const minH = Math.min(hA, hB);
  const sampleStep = Math.max(1, Math.floor((minW * minH) / 100000));
  let diffCount = 0;
  let total = 0;
  const threshold = 30;

  for (let y = 0; y < minH; y += Math.max(1, Math.floor(Math.sqrt(sampleStep)))) {
    for (let x = 0; x < minW; x += Math.max(1, Math.floor(Math.sqrt(sampleStep)))) {
      const offA = (y * wA + x) * 4;
      const offB = (y * wB + x) * 4;
      const dr = Math.abs(pxA[offA] - pxB[offB]);
      const dg = Math.abs(pxA[offA + 1] - pxB[offB + 1]);
      const db = Math.abs(pxA[offA + 2] - pxB[offB + 2]);
      if (dr > threshold || dg > threshold || db > threshold) diffCount++;
      total++;
    }
  }
  return total > 0 ? (diffCount / total) * 100 : 0;
}

const svgColors = countUniqueColors(svgPixels, svgW, svgH);
const refColors = countUniqueColors(refPixels, refW, refH);
const diffPct = computeDiffPercent(svgPixels, svgW, svgH, refPixels, refW, refH);

console.log("╔══════════════════════════════════════════════════╗");
console.log("║           SVG vs Reference Comparison           ║");
console.log("╠══════════════════════════════════════════════════╣");
console.log(`║  SVG file:       ${path.basename(svgAbs).padEnd(32)}║`);
console.log(`║  Reference:      ${path.basename(refAbs).padEnd(32)}║`);
console.log("╠──────────────────────────────────────────────────╣");
console.log(`║  SVG source size:  ${(svgBytes / 1024).toFixed(1).padStart(8)} KB                  ║`);
console.log(`║  SVG render size:  ${(svgPng.length / 1024).toFixed(1).padStart(8)} KB  (${svgW}x${svgH})`.padEnd(51) + "║");
console.log(`║  Ref image size:   ${(refPngBuf.length / 1024).toFixed(1).padStart(8)} KB  (${refW}x${refH})`.padEnd(51) + "║");
console.log("╠──────────────────────────────────────────────────╣");
console.log(`║  SVG unique colors:  ${String(svgColors).padStart(6)}                    ║`);
console.log(`║  Ref unique colors:  ${String(refColors).padStart(6)}                    ║`);
console.log("╠──────────────────────────────────────────────────╣");
console.log(`║  Pixel diff:         ${diffPct.toFixed(1).padStart(5)}%                    ║`);

let verdict;
if (diffPct < 5) verdict = "EXCELLENT — nearly identical";
else if (diffPct < 15) verdict = "GOOD — minor differences";
else if (diffPct < 30) verdict = "FAIR — noticeable differences";
else verdict = "POOR — significant mismatch";

console.log(`║  Verdict:  ${verdict.padEnd(38)}║`);
console.log("╚══════════════════════════════════════════════════╝");
