/**
 * recolor-svg.js — Remap fill colors in an SVG based on a JSON mapping.
 *
 * Usage:
 *   node scripts/recolor-svg.js <input.svg> <output.svg> --map '{"#ff0000":"#5D4E37","#00ff00":"#4CAF50"}'
 *
 * Colors are matched case-insensitively. Unmapped colors are left unchanged.
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
let mapJson = null;
let mapFile = null;
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--map" && i + 1 < args.length) {
    mapJson = args[++i];
  } else if (args[i] === "--map-file" && i + 1 < args.length) {
    mapFile = args[++i];
  } else {
    positional.push(args[i]);
  }
}

if (!positional[0] || (!mapJson && !mapFile)) {
  console.error("Usage: node scripts/recolor-svg.js <input.svg> [output.svg] --map-file <mapping.json>");
  process.exit(1);
}

const inputAbs = path.resolve(positional[0]);
const outputAbs = positional[1] ? path.resolve(positional[1]) : inputAbs.replace(/\.svg$/, "-recolored.svg");

const colorMap = mapFile
  ? JSON.parse(fs.readFileSync(path.resolve(mapFile), "utf8").replace(/^\uFEFF/, ""))
  : JSON.parse(mapJson);
const normalizedMap = {};
for (const [from, to] of Object.entries(colorMap)) {
  normalizedMap[from.toLowerCase()] = to.toLowerCase();
}

let svg = fs.readFileSync(inputAbs, "utf8");
let replacements = 0;

svg = svg.replace(/fill="(#[0-9a-fA-F]{6})"/g, (match, hex) => {
  const lower = hex.toLowerCase();
  if (normalizedMap[lower]) {
    replacements++;
    return `fill="${normalizedMap[lower]}"`;
  }
  return match;
});

fs.writeFileSync(outputAbs, svg, "utf8");
console.log(`Recolored: ${path.basename(inputAbs)} -> ${path.basename(outputAbs)}`);
console.log(`  ${replacements} fill attributes remapped`);
console.log(`  Mapping: ${Object.entries(normalizedMap).map(([f, t]) => `${f} → ${t}`).join(", ")}`);
