const fs = require('fs');
const { PNG } = require('pngjs');
const data = fs.readFileSync('public/images/s1-crt-background.png');
const png = PNG.sync.read(data);
const { width, height } = png;

function brightness(x, y) {
  if (x < 0 || x >= width || y < 0 || y >= height) return 999;
  const idx = (y * width + x) * 4;
  return png.data[idx] + png.data[idx + 1] + png.data[idx + 2];
}

// ──── Scan top edge: for each X, find topmost dark-screen Y ────
// Scan downward from bright bezel into dark screen
const topEdge = [];
for (let x = 470; x <= 905; x += 3) {
  for (let y = 140; y < 220; y++) {
    if (brightness(x, y) > 280 && brightness(x, y + 1) < 220 && brightness(x, y + 2) < 220) {
      topEdge.push({ x, y: y + 1 });
      break;
    }
  }
}

// ──── Scan bottom edge: for each X, find bottommost dark-screen Y ────
// Scan upward from bright bezel into dark screen
const bottomEdge = [];
for (let x = 470; x <= 905; x += 3) {
  for (let y = 560; y > 440; y--) {
    if (brightness(x, y) > 280 && brightness(x, y - 1) < 220 && brightness(x, y - 2) < 220) {
      bottomEdge.push({ x, y: y - 1 });
      break;
    }
  }
}

// ──── Left/right edges at each Y ────
const sideEdges = [];
for (let y = 165; y <= 520; y += 3) {
  let left = -1, right = -1;
  for (let x = 688; x > 400; x--) {
    if (brightness(x, y) > 280) { left = x + 1; break; }
  }
  for (let x = 688; x < 960; x++) {
    if (brightness(x, y) > 280) { right = x - 1; break; }
  }
  if (left > 0 && right > 0 && right > left && (right - left) > 100) {
    sideEdges.push({ y, left, right });
  }
}

console.log("=== TOP EDGE ===");
topEdge.forEach(p => console.log(`  x=${p.x} y=${p.y}`));

console.log("\n=== BOTTOM EDGE ===");
bottomEdge.forEach(p => console.log(`  x=${p.x} y=${p.y}`));

console.log("\n=== SIDE EDGES ===");
sideEdges.forEach(p => console.log(`  y=${p.y} L=${p.left} R=${p.right} w=${p.right - p.left}`));

// ──── Build polygon ────
// Canvas conversion: scale = 2160/768 = 2.8125, cropX = (1376*2.8125 - 3840)/2 ≈ 15
const SCALE = 2.8125;
const CROP_X = 15;
function toCanvas(sx, sy) {
  return { cx: Math.round(sx * SCALE - CROP_X), cy: Math.round(sy * SCALE) };
}

// Bounding box (use extremes from all edges)
const allLeftX = sideEdges.map(e => e.left);
const allRightX = sideEdges.map(e => e.right);
const allTopY = topEdge.map(e => e.y);
const allBotY = bottomEdge.map(e => e.y);

const bbox = {
  srcLeft: Math.min(...allLeftX),
  srcTop: Math.min(...allTopY),
  srcRight: Math.max(...allRightX),
  srcBottom: Math.max(...allBotY),
};
console.log("\n=== BOUNDING BOX (source) ===");
console.log(bbox);

const cBbox = {
  left: toCanvas(bbox.srcLeft, 0).cx,
  top: toCanvas(0, bbox.srcTop).cy + CROP_X, // fix: cy only
  right: toCanvas(bbox.srcRight, 0).cx,
  bottom: toCanvas(0, bbox.srcBottom).cy,
};
cBbox.top = Math.round(bbox.srcTop * SCALE);
cBbox.bottom = Math.round(bbox.srcBottom * SCALE);
cBbox.w = cBbox.right - cBbox.left;
cBbox.h = cBbox.bottom - cBbox.top;
console.log("\n=== BOUNDING BOX (canvas) ===");
console.log(cBbox);

// Build polygon: trace clockwise from top-left
// 1. Top edge (left to right) — from topEdge data
// 2. Right edge (top to bottom) — from sideEdges right column
// 3. Bottom edge (right to left) — from bottomEdge reversed
// 4. Left edge (bottom to top) — from sideEdges left column reversed

// For the polygon, convert to percentages relative to bounding box
function toPct(srcX, srcY) {
  const cx = srcX * SCALE - CROP_X;
  const cy = srcY * SCALE;
  const px = ((cx - cBbox.left) / cBbox.w * 100).toFixed(1);
  const py = ((cy - cBbox.top) / cBbox.h * 100).toFixed(1);
  return `${px}% ${py}%`;
}

// Collect polygon points clockwise
const polyPoints = [];

// Top edge (left to right)
topEdge.forEach(p => polyPoints.push(toPct(p.x, p.y)));

// Right edge (top to bottom) - skip points already covered by top edge
const topMaxY = Math.max(...topEdge.map(e => e.y));
const botMinY = Math.min(...bottomEdge.map(e => e.y));
sideEdges
  .filter(e => e.y > topMaxY && e.y < botMinY)
  .forEach(e => polyPoints.push(toPct(e.right, e.y)));

// Bottom edge (right to left, reversed)
[...bottomEdge].reverse().forEach(p => polyPoints.push(toPct(p.x, p.y)));

// Left edge (bottom to top, reversed)
[...sideEdges]
  .filter(e => e.y > topMaxY && e.y < botMinY)
  .reverse()
  .forEach(e => polyPoints.push(toPct(e.left, e.y)));

const polygon = polyPoints.join(", ");
console.log("\n=== CLIP-PATH POLYGON ===");
console.log(`clip-path: polygon(${polygon});`);
console.log("\nTotal points:", polyPoints.length);

// Also output the constants for AnimlyAd.tsx
console.log("\n=== CONSTANTS FOR AnimlyAd.tsx ===");
console.log(`const SCREEN_LEFT = ${cBbox.left};`);
console.log(`const SCREEN_TOP = ${cBbox.top};`);
console.log(`const SCREEN_W = ${cBbox.w};`);
console.log(`const SCREEN_H = ${cBbox.h};`);
