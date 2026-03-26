/**
 * render-svg.js — Render an SVG file to a PNG on disk using @resvg/resvg-js.
 *
 * Usage:
 *   node scripts/render-svg.js <input.svg> [output.png] [--width N] [--bg COLOR]
 *
 * Defaults: --width 1024  --bg transparent
 */

const fs = require("fs");
const path = require("path");
const { Resvg } = require("@resvg/resvg-js");

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

const inputFile = positional[0];
if (!inputFile) {
  console.error("Usage: node scripts/render-svg.js <input.svg> [output.png] [--width N] [--bg COLOR]");
  process.exit(1);
}

const inputAbs = path.resolve(inputFile);
if (!fs.existsSync(inputAbs)) {
  console.error(`File not found: ${inputAbs}`);
  process.exit(1);
}

const outputAbs = positional[1]
  ? path.resolve(positional[1])
  : inputAbs.replace(/\.svg$/, ".png");

const width = Number(flags.width) || 1024;

const svgContent = fs.readFileSync(inputAbs, "utf8").replace(/^\uFEFF/, "");

const opts = { fitTo: { mode: "width", value: width } };
if (flags.bg) opts.background = flags.bg;

const resvg = new Resvg(Buffer.from(svgContent, "utf8"), opts);
const rendered = resvg.render();
const png = rendered.asPng();

fs.writeFileSync(outputAbs, png);
console.log(`Rendered: ${path.basename(inputAbs)} -> ${path.basename(outputAbs)}`);
console.log(`  ${rendered.width}x${rendered.height}px, ${(png.length / 1024).toFixed(1)} KB`);
