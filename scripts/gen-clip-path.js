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

const SCALE = 2.8125;
const CROP_X = 15;

// Collect side-edge data (most reliable method)
const edges = {};
for (let y = 175; y <= 515; y++) {
  let left = -1, right = -1;
  for (let x = 688; x > 400; x--) {
    if (brightness(x, y) > 280) { left = x + 1; break; }
  }
  for (let x = 688; x < 960; x++) {
    if (brightness(x, y) > 280) { right = x - 1; break; }
  }
  if (left > 0 && right > 0 && right - left > 50) {
    edges[y] = { left, right };
  }
}

// Overlay div coordinates (canvas px) — keep existing values
const DIV_LEFT = 1318;
const DIV_TOP = 487;
const DIV_W = 1204;
const DIV_H = 950;

function toPctInDiv(srcX, srcY) {
  const cx = srcX * SCALE - CROP_X;
  const cy = srcY * SCALE;
  return {
    x: ((cx - DIV_LEFT) / DIV_W * 100),
    y: ((cy - DIV_TOP) / DIV_H * 100),
  };
}

function fmt(srcX, srcY) {
  const p = toPctInDiv(srcX, srcY);
  return `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`;
}

// Sample Y positions for the polygon (every 10 source pixels)
const ys = [];
for (let y = 183; y <= 504; y += 7) ys.push(y);
// Ensure we include the critical corner points
[183, 186, 190, 195, 200, 490, 495, 498, 501, 504].forEach(y => {
  if (!ys.includes(y)) ys.push(y);
});
ys.sort((a, b) => a - b);
// Remove duplicates
const uniqueYs = [...new Set(ys)].filter(y => edges[y]);

// Build polygon clockwise: left edge top→bottom, then right edge bottom→top
const leftPts = uniqueYs.map(y => fmt(edges[y].left, y));
const rightPts = [...uniqueYs].reverse().map(y => fmt(edges[y].right, y));
const allPts = [...leftPts, ...rightPts];

console.log(`Polygon points: ${allPts.length}`);

// Verify all points are within reasonable bounds
const parsed = allPts.map(p => {
  const parts = p.split(/[% ]+/).filter(Boolean);
  return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
});
console.log('X range:', Math.min(...parsed.map(p => p.x)).toFixed(1), 'to', Math.max(...parsed.map(p => p.x)).toFixed(1));
console.log('Y range:', Math.min(...parsed.map(p => p.y)).toFixed(1), 'to', Math.max(...parsed.map(p => p.y)).toFixed(1));

// Output the polygon
const polygon = allPts.join(', ');
console.log(`\nclip-path: polygon(${polygon});`);

// Format for TypeScript
const chunks = [];
for (let i = 0; i < allPts.length; i += 5) {
  chunks.push('  ' + allPts.slice(i, i + 5).join(', '));
}
console.log('\n// TypeScript constant:');
console.log('const CRT_SCREEN_CLIP = `polygon(');
console.log(chunks.join(',\n'));
console.log(')`;');

// Print summary of shape
console.log('\n=== Shape summary (left% / right% at key Y positions) ===');
[183, 200, 250, 310, 345, 400, 450, 490, 504].forEach(y => {
  if (!edges[y]) return;
  const l = toPctInDiv(edges[y].left, y);
  const r = toPctInDiv(edges[y].right, y);
  console.log(`  y=${y} (${l.y.toFixed(1)}%): left=${l.x.toFixed(1)}% right=${r.x.toFixed(1)}% width=${(r.x - l.x).toFixed(1)}%`);
});
