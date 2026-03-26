---
technique: arc-length-spline
level: L4
primitives: [Math.hypot, clamp01, binary-search]
hooks: []
profiles: [dark-tech, snappy-saas]
source: AnimlyAd.tsx S3 blob motion
use_when: "Elements must travel along a complex path at truly constant speed with no perceived starts/stops"
see_also:
  - file: epicyclic-drift.md
    tradeoff: "Epicyclic drift is simpler and better for ambient floating with no fixed path. Use arc-length splines when elements must follow a specific trajectory at constant speed."
  - file: vortex-convergence.md
    tradeoff: "Vortex convergence is for spiraling elements inward to a point. Use arc-length splines for the wandering phase before convergence begins."
---

# Arc-Length Parameterized Catmull-Rom Splines

True constant-speed motion along complex curved paths. Standard Catmull-Rom splines with uniform `t` parameterization cause speed variation because spline segments have different arc lengths. This recipe fixes that with a lookup table (LUT) approach.

## Why not uniform t?

With uniform `t ∈ [0,1]`, the spline evaluator advances through control points at equal parameter increments. But if segment A is 200px long and segment B is 400px long, the element moves twice as fast through B. Users perceive this as "starting and stopping" at control points.

## How it works

1. **Sample the spline** at high resolution (200+ samples) and measure cumulative arc length
2. **Build a lookup table** mapping sample index to cumulative distance
3. **At render time**, convert a uniform distance fraction `u` to the correct spline parameter `t` using binary search on the LUT

## Catmull-Rom spline evaluator

```tsx
function catmullRom(pts: [number, number][], t: number): { x: number; y: number } {
  const n = pts.length - 1;
  const raw = t * n;
  const i = Math.min(Math.floor(raw), n - 1);
  const f = raw - i;

  const p0 = pts[Math.max(0, i - 1)];
  const p1 = pts[i];
  const p2 = pts[Math.min(n, i + 1)];
  const p3 = pts[Math.min(n, i + 2)];

  const f2 = f * f;
  const f3 = f2 * f;

  return {
    x: 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * f +
        (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * f2 +
        (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * f3),
    y: 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * f +
        (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * f2 +
        (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * f3),
  };
}
```

## Arc-length LUT construction

```tsx
const SAMPLES = 200;

function buildArcLUT(pts: [number, number][]): number[] {
  const lut: number[] = [0];
  for (let i = 1; i <= SAMPLES; i++) {
    const prev = catmullRom(pts, (i - 1) / SAMPLES);
    const curr = catmullRom(pts, i / SAMPLES);
    lut.push(lut[i - 1] + Math.hypot(curr.x - prev.x, curr.y - prev.y));
  }
  return lut;
}
```

## Uniform-to-t conversion (binary search)

```tsx
function uniformToT(lut: number[], u: number): number {
  const target = u * lut[lut.length - 1];
  let lo = 0;
  let hi = lut.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (lut[mid] < target) lo = mid;
    else hi = mid;
  }
  const frac = (target - lut[lo]) / (lut[hi] - lut[lo] || 1);
  return (lo + frac) / (lut.length - 1);
}
```

## Usage at render time

```tsx
const WANDER_DUR = 120; // frames for full traversal
const u = clamp01(wanderFrame / WANDER_DUR); // uniform distance fraction
const t = uniformToT(arcLUT, u);             // correct spline parameter
const pos = catmullRom(blobPath, t);         // position at constant speed
```

## Velocity-continuous phase handoffs

When transitioning FROM this spline to another motion phase (e.g., convergence spiral), capture the ending velocity and blend:

```tsx
// Capture velocity at end of spline
const endPos = catmullRom(path, uniformToT(lut, 1.0));
const nearEnd = catmullRom(path, uniformToT(lut, 0.98));
const velX = endPos.x - nearEnd.x;
const velY = endPos.y - nearEnd.y;

// Inertia path: continue at same velocity
const inertiaX = endPos.x + velX * cf * 3;
const inertiaY = endPos.y + velY * cf * 3;

// Quadratic blend into new trajectory
const ct = clamp01(cf / CONVERGE_DUR);
const x = inertiaX * (1 - ct * ct) + targetX * (ct * ct);
const y = inertiaY * (1 - ct * ct) + targetY * (ct * ct);
```

**Use `ct * ct` (quadratic) blend**, not linear. Linear creates a visible direction change at the handoff. Quadratic starts at 100% inertia and curves smoothly to the target.

## Path design guidelines

- **Start at the element's current position** — first control point must be where the element already is
- **Use 6-10 control points** for a 4-second wander (too few = straight lines, too many = overcomplicated)
- **Distribute points across the full canvas** for dynamic motion
- **End near the convergence target** to minimize the handoff blend distance
- **No sharp angles** — control points should suggest smooth arcs, not zigzags

## Key insights

1. **200 LUT samples** is sufficient for smooth results. 100 may show slight speed variation on tight curves.
2. **Build the LUT once**, not per frame. It's deterministic for a given path.
3. **Catmull-Rom tension** is fixed at 0.5 (standard). Custom tension isn't needed for ad motion.
4. **Multiple elements** on different paths should each have their own LUT and speed.

## Observed in

- AnimlyAd S3 — 6 blobs wandering across screen at constant speed, then converging with velocity-continuous handoff
- SmallSpotAd S3 — 9 blobs, same technique with expanded paths
