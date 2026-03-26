---
technique: epicyclic-drift
level: L3
primitives: [Math.sin, Math.cos, Math.atan2]
hooks: []
profiles: [snappy-saas, dark-tech, luxury-slow]
source: CalmlyAd.tsx MetaBlob component
use_when: "Elements need ambient, organic floating motion without a fixed path — roaming blobs, floating cards, idle particles"
see_also:
  - file: arc-length-spline.md
    tradeoff: "Arc-length splines guarantee constant speed along a fixed trajectory. Use epicyclic drift when you want organic, unpredictable wandering without a predetermined path."
  - file: vortex-convergence.md
    tradeoff: "Vortex convergence spirals elements inward. Use epicyclic drift for the idle/wandering phase before convergence begins."
---

# Epicyclic Drift

Smooth, continuously-varying organic motion for floating elements using **dual-rotor epicycles** — two layered circular motions with same-direction rotation. Produces naturalistic paths that never reverse, stall, or look repetitive.

## Why not sin/cos?

Simple `sin(t) * A` on X and `cos(t) * B` on Y creates **Lissajous figures** — all instances look similar regardless of parameters. Elements appear to "bounce between walls." Epicyclic motion produces genuinely unique, flowing trajectories.

## How it works

Two concentric circles rotating in the **same direction** (both positive angular velocity). The element sits on the rim of the smaller circle, which orbits on the rim of the larger. The compound path is a smooth curve that never has zero velocity (as long as `R1 * w1 ≠ R2 * w2`).

## Parameter table

| Parameter | Range | Constraint | Notes |
|-----------|-------|------------|-------|
| R1 (primary radius) | 130–300px | — | Larger = wider roaming |
| w1 (primary speed) | 0.026–0.048 | R1*w1 > 2.5 * R2*w2 | Primary must dominate |
| R2 (secondary radius) | 18–30px | — | Adds wobble/variation |
| w2 (secondary speed) | 0.085–0.19 | See constraint above | Faster = tighter loops |
| phi1 (phase) | Align to prior motion | `flightAngle + π/2 - driftStart * w1` | Preserves momentum |
| phi2 (phase) | Offset per element | `phi1 + idOffset * 1.7` | Prevents sync |

## Variant diversity

Use 4–6 preset configurations keyed by element ID for visual variety:

```tsx
const VARIANTS = [
  { R1: 280, w1: 0.033, R2: 25, w2: 0.13  },  // Wide, slow sweep
  { R1: 150, w1: 0.042, R2: 22, w2: 0.11  },  // Compact, moderate
  { R1: 300, w1: 0.026, R2: 18, w2: 0.19  },  // Widest, slowest primary
  { R1: 130, w1: 0.048, R2: 20, w2: 0.15  },  // Tight, fastest primary
  { R1: 250, w1: 0.030, R2: 30, w2: 0.085 },  // Wide, gentle secondary
  { R1: 140, w1: 0.040, R2: 18, w2: 0.12  },  // Balanced
];
const variant = VARIANTS[elementId % VARIANTS.length];
```

## Code pattern

```tsx
function epicycleOffset(f: number, driftStart: number, params: Variant, phi1: number, phi2: number) {
  // Position at frame f
  const px = params.R1 * Math.cos(f * params.w1 + phi1) + params.R2 * Math.cos(f * params.w2 + phi2);
  const py = params.R1 * Math.sin(f * params.w1 + phi1) + params.R2 * Math.sin(f * params.w2 + phi2);

  // Position at driftStart (so displacement starts at zero)
  const px0 = params.R1 * Math.cos(driftStart * params.w1 + phi1) + params.R2 * Math.cos(driftStart * params.w2 + phi2);
  const py0 = params.R1 * Math.sin(driftStart * params.w1 + phi1) + params.R2 * Math.sin(driftStart * params.w2 + phi2);

  return { dx: px - px0, dy: py - py0 };
}
```

## Phase alignment (momentum preservation)

When an element arrives at its drift position from a preceding flight, align the epicycle's initial velocity with the flight direction:

```tsx
const flightAngle = Math.atan2(targetY - originY, targetX - originX);
const phi1 = flightAngle + Math.PI / 2 - driftStart * w1;
```

The `+ π/2` offset converts from position phase to velocity phase (derivative of cos is -sin, shifted by π/2).

## Coast phase

Combine with a **decelerating coast** in the flight direction for smooth handoff:

```tsx
const COAST_DUR = 18;
const coastSpeed = R1 * w1 * 1.4;
const df = f - driftStart;
const coastT = Math.min(df, COAST_DUR);
const coastDist = coastSpeed * (coastT - coastT * coastT / (2 * COAST_DUR));
const coastDx = Math.cos(flightAngle) * coastDist;
const coastDy = Math.sin(flightAngle) * coastDist;

// Epicycle ease-in (linear over coast duration for immediate velocity)
const easeIn = clamp01(df / COAST_DUR);
const epOffset = epicycleOffset(f, driftStart, variant, phi1, phi2);
const totalDx = coastDx + epOffset.dx * easeIn;
const totalDy = coastDy + epOffset.dy * easeIn;
```

## Key insights

1. **Same-direction rotation is essential.** Opposite-direction creates velocity zeros where the two rotors cancel.
2. **Phase-centering** (`pos(f) - pos(driftStart)`) ensures zero displacement at the start — no position jump.
3. **Linear ease-in (not quadratic)** for the epicycle when combining with a coast. Quadratic has zero initial velocity which defeats the purpose.
4. **R1*w1 > 2.5 * R2*w2** prevents the secondary rotor from stalling the primary.

## Observed in

- CalmlyAd Act 2 — MetaBlob drift phase (6 variants, 6–8 blobs, combined with SVG goo trail)
