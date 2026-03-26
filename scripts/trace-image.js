/**
 * trace-image.js — Trace a reference PNG/JPG into an SVG using vtracer (Python),
 * then automatically post-process with optimize-svg.js.
 *
 * Usage:
 *   node scripts/trace-image.js <input-image> [output-svg] [--no-optimize] [--colors N] [--precision N]
 *
 * Examples:
 *   node scripts/trace-image.js public/svg/green-task/ref/plant-reference.png
 *   node scripts/trace-image.js public/svg/green-task/ref/plant-reference.png public/svg/green-task/plant.svg
 *   node scripts/trace-image.js input.png --no-optimize
 *   node scripts/trace-image.js input.png --colors 12 --precision 0
 *
 * Output: writes the raw traced SVG (-traced.svg) and the optimized version (-opt.svg).
 * If --no-optimize is passed, only the raw trace is produced.
 *
 * Requires: python with vtracer installed (pip install vtracer)
 */

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const args = process.argv.slice(2);
const skipOptimize = args.includes("--no-optimize");
const positional = args.filter((a) => !a.startsWith("--"));
const passthrough = args
  .filter((a) => a.startsWith("--") && a !== "--no-optimize")
  .join(" ");

const input = positional[0];
if (!input) {
  console.error(
    "Usage: node scripts/trace-image.js <input-image> [output-svg] [--no-optimize] [--colors N] [--precision N]",
  );
  process.exit(1);
}

const inputAbs = path.resolve(input);
if (!fs.existsSync(inputAbs)) {
  console.error(`Input file not found: ${inputAbs}`);
  process.exit(1);
}

const outputArg = positional[1];
const tracedAbs = outputArg
  ? path.resolve(outputArg)
  : inputAbs.replace(/\.[^.]+$/, "-traced.svg");

const pyScript = [
  "import vtracer, sys",
  "vtracer.convert_image_to_svg_py(sys.argv[1], sys.argv[2])",
  "print('OK')",
].join("\n");

const tmpPy = path.join(os.tmpdir(), "vtracer_run.py");
fs.writeFileSync(tmpPy, pyScript, "utf8");

console.log(`Tracing: ${path.basename(inputAbs)}`);
console.log(`Output:  ${path.basename(tracedAbs)}`);

try {
  const result = execSync(
    `python "${tmpPy}" "${inputAbs}" "${tracedAbs}"`,
    { encoding: "utf8", timeout: 60000 },
  );
  if (result.includes("OK")) {
    const stat = fs.statSync(tracedAbs);
    console.log(`\nTraced SVG written (${(stat.size / 1024).toFixed(1)} KB)`);
    console.log(`  ${tracedAbs}`);
  }
} catch (e) {
  console.error("vtracer failed:", e.message);
  process.exit(1);
} finally {
  try { fs.unlinkSync(tmpPy); } catch {}
}

if (!skipOptimize) {
  const optAbs = tracedAbs.replace(/\.svg$/, "-opt.svg");
  console.log(`\n--- Post-processing: optimize-svg.js ---`);
  try {
    const optScript = path.join(__dirname, "optimize-svg.js");
    const cmd = `node "${optScript}" "${tracedAbs}" "${optAbs}" ${passthrough}`.trim();
    execSync(cmd, { encoding: "utf8", stdio: "inherit", timeout: 30000 });
  } catch (e) {
    console.error("Optimizer failed:", e.message);
  }
}
