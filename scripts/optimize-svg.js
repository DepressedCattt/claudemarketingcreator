/**
 * optimize-svg.js — Post-process a vtracer SVG to make it animation-ready.
 *
 * Modes:
 *   "bands"    (default) — K-means color quantization, vertical band grouping
 *   "semantic" — Match paths to a provided color map, group by semantic name
 *
 * Usage:
 *   node scripts/optimize-svg.js <input.svg> [output.svg] [--colors N] [--precision N] [--min-area N] [--bands N]
 *   node scripts/optimize-svg.js <input.svg> [output.svg] --mode semantic --color-map '{"#FF0000":"stem","#00FF00":"leaves"}'
 *
 * Defaults: --colors 8  --precision 1  --min-area 400  --bands 5  --mode bands
 */

const fs = require("fs");
const path = require("path");

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith("--") && i + 1 < args.length) {
    flags[args[i].slice(2)] = args[++i]; // store as string; cast to Number where needed
  } else {
    positional.push(args[i]);
  }
}

const inputFile = positional[0];
if (!inputFile) {
  console.error(
    "Usage: node scripts/optimize-svg.js <input.svg> [output.svg] [--mode bands|semantic] [--color-map JSON] [--colors N] [--precision N]",
  );
  process.exit(1);
}

const inputAbs = path.resolve(inputFile);
const outputAbs = positional[1]
  ? path.resolve(positional[1])
  : inputAbs.replace(/\.svg$/, "-opt.svg");

const MODE = flags.mode || "bands";
let COLOR_MAP = null;
if (flags["color-map-file"]) {
  COLOR_MAP = JSON.parse(fs.readFileSync(path.resolve(flags["color-map-file"]), "utf8").replace(/^\uFEFF/, ""));
} else if (flags["color-map"]) {
  COLOR_MAP = JSON.parse(flags["color-map"]);
}
const NUM_COLORS = Number(flags.colors) || 8;
const PRECISION = flags.precision != null ? Number(flags.precision) : 1;
const MIN_AREA = Number(flags["min-area"]) || 400;
const NUM_BANDS = Number(flags.bands) || 5;

if (MODE === "semantic" && !COLOR_MAP) {
  console.error("--mode semantic requires --color-map JSON, e.g. --color-map '{\"#FF0000\":\"stem\"}'");
  process.exit(1);
}

// ─── Step 0: Parse SVG ──────────────────────────────────────────────────────
const raw = fs.readFileSync(inputAbs, "utf8");
const svgMatch = raw.match(
  /<svg[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*/,
);
const svgW = svgMatch ? Number(svgMatch[1]) : 1376;
const svgH = svgMatch ? Number(svgMatch[2]) : 768;

const pathRegex = /<path\s+d="([^"]*)"\s+fill="([^"]*)"\s+transform="translate\(([^)]*)\)"\/>/g;
const entries = [];
let m;
while ((m = pathRegex.exec(raw)) !== null) {
  entries.push({ d: m[1], fill: m[2], translate: m[3] });
}

console.log(`Input: ${path.basename(inputAbs)}`);
console.log(`  ${entries.length} paths, ${(raw.length / 1024).toFixed(0)} KB`);
console.log(
  `  Settings: colors=${NUM_COLORS} precision=${PRECISION} min-area=${MIN_AREA} bands=${NUM_BANDS}`,
);

// ─── Step 1: Round coordinates ──────────────────────────────────────────────
function roundPath(d, prec) {
  return d.replace(/-?\d+\.\d+/g, (n) => {
    const r = parseFloat(n).toFixed(prec);
    return r === "-0.0" ? "0" : r.replace(/\.0$/, "");
  });
}

for (const e of entries) {
  e.d = roundPath(e.d, PRECISION);
  const [tx, ty] = e.translate.split(",").map((s) => parseFloat(s).toFixed(PRECISION));
  e.translate = `${tx},${ty}`;
}

// ─── Step 2: Parse hex colors → RGB ─────────────────────────────────────────
function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]) {
  return (
    "#" +
    [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")
  );
}
function colorDist([r1, g1, b1], [r2, g2, b2]) {
  return (r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2;
}

// ─── Step 3: Color quantization (mode-dependent) ────────────────────────────
if (MODE === "semantic") {
  // Semantic mode: match each path to the nearest color in the provided color-map
  const semanticTargets = Object.entries(COLOR_MAP).map(([hex, name]) => ({
    hex: hex.toLowerCase(),
    name,
    rgb: hexToRgb(hex),
  }));

  for (const e of entries) {
    const rgb = hexToRgb(e.fill);
    let bestDist = Infinity;
    let bestTarget = semanticTargets[0];
    for (const t of semanticTargets) {
      const d = colorDist(rgb, t.rgb);
      if (d < bestDist) {
        bestDist = d;
        bestTarget = t;
      }
    }
    e.quantizedFill = bestTarget.hex;
    e.semanticName = bestTarget.name;
  }

  console.log(`\nSemantic mapping (${semanticTargets.length} groups):`);
  for (const t of semanticTargets) {
    const count = entries.filter((e) => e.semanticName === t.name).length;
    console.log(`  ${t.hex} → "${t.name}" — ${count} paths`);
  }
} else {
  // Bands mode: K-means color quantization
  const allRgb = entries.map((e) => hexToRgb(e.fill));

  function kMeans(points, k, maxIter = 30) {
    const sorted = [...points].sort(
      (a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]),
    );
    let centroids = [];
    for (let i = 0; i < k; i++) {
      centroids.push(sorted[Math.floor((i / k) * sorted.length)].slice());
    }

    let assignments = new Array(points.length).fill(0);

    for (let iter = 0; iter < maxIter; iter++) {
      let changed = false;
      for (let i = 0; i < points.length; i++) {
        let best = 0;
        let bestDist = Infinity;
        for (let c = 0; c < k; c++) {
          const d = colorDist(points[i], centroids[c]);
          if (d < bestDist) {
            bestDist = d;
            best = c;
          }
        }
        if (assignments[i] !== best) {
          assignments[i] = best;
          changed = true;
        }
      }
      if (!changed) break;

      for (let c = 0; c < k; c++) {
        const members = points.filter((_, idx) => assignments[idx] === c);
        if (members.length === 0) continue;
        centroids[c] = [
          members.reduce((s, m) => s + m[0], 0) / members.length,
          members.reduce((s, m) => s + m[1], 0) / members.length,
          members.reduce((s, m) => s + m[2], 0) / members.length,
        ];
      }
    }

    return { centroids, assignments };
  }

  const { centroids, assignments } = kMeans(allRgb, NUM_COLORS);
  const palette = centroids.map(rgbToHex);

  for (let i = 0; i < entries.length; i++) {
    entries[i].quantizedFill = palette[assignments[i]];
  }

  console.log(`\nPalette (${palette.length} colors):`);
  palette.forEach((c, i) => {
    const count = assignments.filter((a) => a === i).length;
    console.log(`  ${c} — ${count} paths`);
  });
}

// ─── Step 4: Compute bounding boxes ─────────────────────────────────────────
function pathBBox(d, translate) {
  const [tx, ty] = translate.split(",").map(Number);
  const nums = d.match(/-?\d+(\.\d+)?/g);
  if (!nums || nums.length < 2) return { minX: tx, minY: ty, maxX: tx, maxY: ty, area: 0 };

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < nums.length - 1; i += 2) {
    const x = parseFloat(nums[i]) + tx;
    const y = parseFloat(nums[i + 1]) + ty;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return { minX, minY, maxX, maxY, area: (maxX - minX) * (maxY - minY) };
}

for (const e of entries) {
  e.bbox = pathBBox(e.d, e.translate);
  e.centerY = (e.bbox.minY + e.bbox.maxY) / 2;
}

// ─── Step 5: Filter small paths ─────────────────────────────────────────────
const before = entries.length;
const filtered = entries.filter((e) => e.bbox.area >= MIN_AREA);
console.log(
  `\nFiltered: ${before} → ${filtered.length} paths (removed ${before - filtered.length} below ${MIN_AREA}px² area)`,
);

// ─── Step 6: Merge same-color paths into compound paths ─────────────────────
const colorGroups = {};
for (const e of filtered) {
  const key = e.quantizedFill;
  if (!colorGroups[key]) colorGroups[key] = [];
  colorGroups[key].push(e);
}

const merged = [];
for (const [fill, group] of Object.entries(colorGroups)) {
  const compoundD = group
    .map((e) => {
      const [tx, ty] = e.translate.split(",").map(Number);
      return translatePathData(e.d, tx, ty);
    })
    .join(" ");

  const allBBox = {
    minX: Math.min(...group.map((e) => e.bbox.minX)),
    minY: Math.min(...group.map((e) => e.bbox.minY)),
    maxX: Math.max(...group.map((e) => e.bbox.maxX)),
    maxY: Math.max(...group.map((e) => e.bbox.maxY)),
  };
  allBBox.area = (allBBox.maxX - allBBox.minX) * (allBBox.maxY - allBBox.minY);

  merged.push({
    fill,
    d: compoundD,
    bbox: allBBox,
    centerY: (allBBox.minY + allBBox.maxY) / 2,
    semanticName: group[0].semanticName || null,
  });
}

console.log(
  `Merged: ${filtered.length} paths → ${merged.length} compound paths`,
);

function translatePathData(d, tx, ty) {
  if (tx === 0 && ty === 0) return d;

  let result = "";
  const tokens = d.match(/[A-Za-z]|-?\d+(\.\d+)?/g) || [];
  let i = 0;

  while (i < tokens.length) {
    const cmd = tokens[i];
    if (/[A-Za-z]/.test(cmd)) {
      result += cmd + " ";
      i++;
      const upper = cmd.toUpperCase();
      // Relative commands don't need translation
      if (cmd !== upper) {
        while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
          result += tokens[i] + " ";
          i++;
        }
        continue;
      }
      if (upper === "Z") continue;
      // Absolute commands — translate coordinate pairs
      const pairsPerCmd = { M: 1, L: 1, H: 0, V: 0, C: 3, S: 2, Q: 2, T: 1, A: 0 };
      const pairs = pairsPerCmd[upper];
      if (pairs === undefined || pairs === 0) {
        // H/V/A — just pass through (rare in traced SVGs)
        while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
          result += tokens[i] + " ";
          i++;
        }
        continue;
      }
      while (i < tokens.length && !/[A-Za-z]/.test(tokens[i])) {
        for (let p = 0; p < pairs && i + 1 < tokens.length; p++) {
          const x = parseFloat(tokens[i]) + tx;
          const y = parseFloat(tokens[i + 1]) + ty;
          result += round(x) + " " + round(y) + " ";
          i += 2;
        }
      }
    } else {
      result += tokens[i] + " ";
      i++;
    }
  }

  return result.trim();
}

function round(n) {
  const r = n.toFixed(PRECISION);
  return r === `-0.${"0".repeat(PRECISION)}` ? "0" : r.replace(/\.0+$/, "");
}

// ─── Step 7: Group paths for output ──────────────────────────────────────────
let svgOut = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}">\n`;
let groupCount = 0;
let groupLabel = "";

if (MODE === "semantic") {
  // Semantic mode: group by semantic name, preserving color-map key order
  const orderedNames = Object.values(COLOR_MAP);
  const semanticGroups = {};
  for (const e of merged) {
    const name = e.semanticName || "unknown";
    if (!semanticGroups[name]) semanticGroups[name] = [];
    semanticGroups[name].push(e);
  }

  for (const name of orderedNames) {
    if (name.startsWith("_")) continue; // skip groups like _background
    const group = semanticGroups[name];
    if (!group || group.length === 0) continue;
    svgOut += `  <g id="${name}">\n`;
    for (const e of group) {
      svgOut += `    <path d="${e.d}" fill="${e.fill}"/>\n`;
    }
    svgOut += `  </g>\n`;
    groupCount++;
  }
  const discarded = orderedNames.filter((n) => n.startsWith("_") && semanticGroups[n]?.length);
  if (discarded.length) console.log(`\nDiscarded groups: ${discarded.join(", ")}`);
  groupLabel = orderedNames.filter((n) => !n.startsWith("_") && semanticGroups[n]?.length).join(" | ");
} else {
  // Bands mode: assign to vertical bands
  const allMinY = Math.min(...merged.map((e) => e.bbox.minY));
  const allMaxY = Math.max(...merged.map((e) => e.bbox.maxY));
  const bandHeight = (allMaxY - allMinY) / NUM_BANDS;

  const bandNames = [];
  for (let b = 0; b < NUM_BANDS; b++) {
    const pct = Math.round(((b + 0.5) / NUM_BANDS) * 100);
    bandNames.push(b === 0 ? "crown" : b === NUM_BANDS - 1 ? "base" : `mid-${pct}`);
  }

  for (const e of merged) {
    const band = Math.min(
      NUM_BANDS - 1,
      Math.floor((e.centerY - allMinY) / bandHeight),
    );
    e.band = band;
    e.bandName = bandNames[band];
  }

  const bandGroups = {};
  for (const e of merged) {
    if (!bandGroups[e.band]) bandGroups[e.band] = [];
    bandGroups[e.band].push(e);
  }

  for (let b = 0; b < NUM_BANDS; b++) {
    const group = bandGroups[b] || [];
    if (group.length === 0) continue;
    svgOut += `  <g id="${bandNames[b]}" data-band="${b}">\n`;
    for (const e of group) {
      svgOut += `    <path d="${e.d}" fill="${e.fill}"/>\n`;
    }
    svgOut += `  </g>\n`;
  }
  groupCount = Object.keys(bandGroups).length;
  groupLabel = bandNames.join(" | ");
}

svgOut += `</svg>\n`;

fs.writeFileSync(outputAbs, svgOut, "utf8");

const savedPct = Math.round((1 - svgOut.length / raw.length) * 100);
console.log(`\nOutput: ${path.basename(outputAbs)}`);
console.log(
  `  ${merged.length} paths in ${groupCount} groups, ${(svgOut.length / 1024).toFixed(0)} KB (${savedPct}% smaller)`,
);
console.log(`  Groups: ${groupLabel}`);
