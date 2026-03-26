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

console.log(`Image: ${width}x${height}`);

// ── Flood fill from center to find all connected screen pixels ──
// Screen = dark pixels (brightness < THRESHOLD) connected to center
const THRESHOLD = 180;
const cx = Math.floor(width / 2);  // 688
const cy = Math.floor(height / 2); // 384

const visited = new Uint8Array(width * height);
const isScreenPixel = new Uint8Array(width * height);

// Scanline flood fill
const queue = [[cx, cy]];
visited[cy * width + cx] = 1;
let fillCount = 0;

while (queue.length > 0) {
  const [sx, sy] = queue.pop();

  if (brightness(sx, sy) >= THRESHOLD) continue;

  isScreenPixel[sy * width + sx] = 1;
  fillCount++;

  // Expand in 4 directions
  const neighbors = [[sx - 1, sy], [sx + 1, sy], [sx, sy - 1], [sx, sy + 1]];
  for (const [nx, ny] of neighbors) {
    if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
    const idx = ny * width + nx;
    if (visited[idx]) continue;
    visited[idx] = 1;
    if (brightness(nx, ny) < THRESHOLD) {
      queue.push([nx, ny]);
    }
  }
}

console.log(`Flood fill found ${fillCount} screen pixels`);

// ── Extract left/right edges for each row ──
const rowEdges = {};
let topY = height, botY = 0;

for (let y = 0; y < height; y++) {
  let left = -1, right = -1;

  for (let x = 0; x < width; x++) {
    if (isScreenPixel[y * width + x]) {
      if (left === -1) left = x;
      right = x;
    }
  }

  if (left >= 0 && right >= 0 && right - left > 30) {
    rowEdges[y] = { left, right, w: right - left };
    if (y < topY) topY = y;
    if (y > botY) botY = y;
  }
}

console.log(`Screen vertical range: y=${topY} to y=${botY} (${botY - topY + 1} rows)`);

// Print edges at key positions
console.log('\nEdge contour:');
const screenRows = Object.keys(rowEdges).map(Number).sort((a, b) => a - b);
const printStep = Math.max(1, Math.floor(screenRows.length / 25));
for (let i = 0; i < screenRows.length; i += printStep) {
  const y = screenRows[i];
  const e = rowEdges[y];
  console.log(`  y=${y}: L=${e.left} R=${e.right} w=${e.w}`);
}

console.log('\nFirst 3 rows:');
screenRows.slice(0, 3).forEach(y => console.log(`  y=${y}: L=${rowEdges[y].left} R=${rowEdges[y].right} w=${rowEdges[y].w}`));
console.log('Last 3 rows:');
screenRows.slice(-3).forEach(y => console.log(`  y=${y}: L=${rowEdges[y].left} R=${rowEdges[y].right} w=${rowEdges[y].w}`));

// ── Generate clip-path polygon ──
const SCALE = 2.8125;
const CROP_X = 15;

// Use the actual screen extent for the bounding box
const minLeft = Math.min(...screenRows.map(y => rowEdges[y].left));
const maxRight = Math.max(...screenRows.map(y => rowEdges[y].right));

const divLeft = Math.floor(minLeft * SCALE - CROP_X);
const divTop = Math.floor(topY * SCALE);
const divRight = Math.ceil(maxRight * SCALE - CROP_X);
const divBot = Math.ceil(botY * SCALE);
const divW = divRight - divLeft;
const divH = divBot - divTop;

console.log(`\nBounding box (canvas): L=${divLeft} T=${divTop} R=${divRight} B=${divBot}`);
console.log(`Size: ${divW} x ${divH}`);

function toPct(srcX, srcY) {
  const cx = srcX * SCALE - CROP_X;
  const cy = srcY * SCALE;
  return {
    x: (cx - divLeft) / divW * 100,
    y: (cy - divTop) / divH * 100,
  };
}

// Sample rows for the polygon
const SAMPLE = 4;
const sampled = screenRows.filter((_, i) => i % SAMPLE === 0);
if (sampled[sampled.length - 1] !== screenRows[screenRows.length - 1]) {
  sampled.push(screenRows[screenRows.length - 1]);
}

// Left edge (top to bottom), then right edge (bottom to top)
const leftPts = sampled.map(y => {
  const p = toPct(rowEdges[y].left, y);
  return `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`;
});
const rightPts = [...sampled].reverse().map(y => {
  const p = toPct(rowEdges[y].right, y);
  return `${p.x.toFixed(1)}% ${p.y.toFixed(1)}%`;
});

const allPts = [...leftPts, ...rightPts];
console.log(`\nPolygon points: ${allPts.length}`);

const parsed = allPts.map(p => {
  const [x, y] = p.split(/[% ]+/).filter(Boolean).map(Number);
  return { x, y };
});
console.log('X range:', Math.min(...parsed.map(p => p.x)).toFixed(1), 'to', Math.max(...parsed.map(p => p.x)).toFixed(1));
console.log('Y range:', Math.min(...parsed.map(p => p.y)).toFixed(1), 'to', Math.max(...parsed.map(p => p.y)).toFixed(1));

// Output for AnimlyAd.tsx
console.log('\n=== COPY TO AnimlyAd.tsx ===\n');
console.log(`const PHOTO_SCREEN_LEFT = ${divLeft};`);
console.log(`const PHOTO_SCREEN_TOP = ${divTop};`);
console.log(`const PHOTO_SCREEN_W = ${divW};`);
console.log(`const PHOTO_SCREEN_H = ${divH};`);
console.log('');

const chunks = [];
for (let i = 0; i < allPts.length; i += 5) {
  chunks.push('  ' + allPts.slice(i, i + 5).join(', '));
}
console.log('const CRT_SCREEN_CLIP = `polygon(');
console.log(chunks.join(',\n'));
console.log(')`;');
