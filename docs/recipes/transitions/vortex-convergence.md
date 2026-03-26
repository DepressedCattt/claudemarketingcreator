---
technique: vortex-convergence
level: L3+L5
primitives: [Math.sin, Math.cos, clamp01, SVG filter]
hooks: []
profiles: [snappy-saas, dark-tech]
source: CalmlyAd.tsx MetaBlob converge phase + VortexCore
use_when: "Elements need to spiral inward to a central point for a dramatic merge/burst transition"
see_also:
  - file: epicyclic-drift.md
    tradeoff: "Epicyclic drift is for the idle phase before convergence. Use vortex convergence when elements are ready to merge."
  - file: arc-length-spline.md
    tradeoff: "Arc-length splines are for the wandering phase. When wandering ends, hand off to vortex convergence with velocity-continuous blending."
---

# Vortex Convergence

Floating elements spiral inward toward a central point, merge into a glowing vortex core, and then burst — revealing the next scene's content emerging from the energy. Used as a dramatic scene transition.

## How it works

1. Elements are already drifting (epicyclic motion) in the scene
2. At `convergeFrame`, each element begins spiraling toward the center:
   - Radius decays from current distance to zero
   - Angle progresses through 1.0–1.6 full rotations
   - Scale shrinks, opacity fades near the end
3. A `VortexCore` disc appears at center with conic gradient, growing and spinning
4. At `burstFrame`, the core expands rapidly with blur + opacity fade
5. Shockwave rings expand outward from center
6. The next scene's content (e.g., dashboard card) scales up from the center

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| converge_start | Stagger per element (193–196) | Slight stagger prevents mechanical feel |
| converge_duration | 20–24 frames | Shorter = more violent; longer = more graceful |
| converge_rotations | 1.0–1.6 | How many spiral turns before reaching center |
| radius_decay | `1 - (0.12*ct + 0.88*ct²)` | Linear+power blend for immediate velocity |
| angle_progression | `0.08*ct + 0.92*ct²` | Accelerating rotation speed |
| scale_shrink | `max(0.15, 1 - ct^2.5)` | Keeps element visible until near center |
| opacity_fade | Fades when `ct > 0.75` | Don't fade too early |
| vortex_core_blur | 14px (constant) | Soft, glowing disc |
| burst_duration | 12 frames | Quick, explosive |
| shockwave_count | 2–3 rings | Staggered 3 frames apart |

## Code pattern (convergence phase)

```tsx
if (frame >= convergeFrame && frame < convergeFrame + convergeDuration) {
  const ct = (frame - convergeFrame) / convergeDuration;

  // Start from actual drift position (not target)
  const startOffset = epicycleOffset(convergeFrame);
  const startX = targetX + startOffset.dx;
  const startY = targetY + startOffset.dy;

  // Spiral geometry
  const startRadius = Math.sqrt((startX - CX) ** 2 + (startY - CY) ** 2);
  const startAngle = Math.atan2(startY - CY, startX - CX);

  const radiusDecay = 1 - (0.12 * ct + 0.88 * ct * ct);
  const angleProg = 0.08 * ct + 0.92 * ct * ct;
  const currentRadius = startRadius * radiusDecay;
  const currentAngle = startAngle + angleProg * convergeRotations * Math.PI * 2;

  const x = CX + Math.cos(currentAngle) * currentRadius;
  const y = CY + Math.sin(currentAngle) * currentRadius;

  const scale = Math.max(0.15, 1 - Math.pow(ct, 2.5));
  const opacity = ct > 0.75 ? 1 - (ct - 0.75) / 0.25 : 1;
}
```

## Key insights

1. **Start convergence from the element's ACTUAL position** — not its original target. Use `epicycleOffset(convergeFrame)` to get where it actually is when convergence begins. Otherwise there's a visible jump.
2. **Linear+power blend** for radius decay (`0.12*ct + 0.88*ct²`) gives immediate non-zero velocity at ct=0 while still accelerating. Pure quadratic (`ct²`) creates a visible pause at the start.
3. **Stagger convergence start frames by 1–3 frames per element** — prevents all elements arriving simultaneously, which looks artificial.
4. **Background/ambient blobs should EXIT before convergence starts** — they're not part of the narrative and their sudden convergence looks like a glitch.
5. **Trail rendering should seamlessly transition** between drift and convergence — sample historical positions across the boundary without breaking.

## Observed in

- CalmlyAd Act 2 — 6 accent blobs spiral into VortexCore at center, burst reveals DashboardCard
