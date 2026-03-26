---
technique: magnet-snap-float
level: L1+L2
primitives: [spring, interpolate]
hooks: []
profiles: [snappy-saas, dark-tech, product-showcase]
source: FINAL_RENDER_4K.ae-extract.json (board_1–5 foreground instances)
use_when: "Elements need to snap to positions with magnetic attraction and then float gently"
---

# Magnet Snap Float

Cards drift loosely — translating and rotating with gentle momentum — then
snap to their final position as if pulled by a magnet. In AE this uses the
Transform effect with animated Position + Rotation creating a drift-then-
settle feel, plus Drop Shadow for depth.

This is fundamentally different from our standard card entrance which is a
simple `translateY + opacity`. The magnet snap adds:
1. **Horizontal drift** (not just vertical)
2. **Rotation** during the approach
3. **Overshoot + settle** at the snap point
4. **3D shadow** that changes with position

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| drift_x | ±200–400px | Horizontal drift range |
| drift_y | ±100–200px | Vertical drift range |
| rotation_range | ±8–15° | Rotation during drift |
| snap_spring.stiffness | 120–160 | Medium-firm snap |
| snap_spring.damping | 16–20 | Slight overshoot allowed |
| snap_spring.mass | 0.8–1.0 | Medium weight |
| shadow_blur_range | 20–60px | Shadow softens during drift |
| shadow_y_range | 8–30px | Shadow stretches during drift |
| float_after | true/false | Gentle float after settling |

## Code pattern

```tsx
const MagnetCard: React.FC<{
  children: React.ReactNode;
  progress: number;
  driftX?: number;
  driftY?: number;
  driftRotation?: number;
  width: number;
  height: number;
}> = ({
  children, progress,
  driftX = -200, driftY = 150, driftRotation = -8,
  width, height,
}) => {
  const frame = useCurrentFrame();

  const x = (1 - progress) * driftX;
  const y = (1 - progress) * driftY;
  const rot = (1 - progress) * driftRotation;

  // Shadow depth increases as card approaches final position
  const shadowBlur = 20 + progress * 40;
  const shadowY = 8 + progress * 22;

  // Subtle float after settling
  const floatY = progress > 0.95
    ? Math.sin(frame * 0.015) * 4
    : 0;

  return (
    <div
      style={{
        width,
        height,
        borderRadius: 24,
        transform: `translate(${x}px, ${y + floatY}px) rotate(${rot}deg)`,
        boxShadow: `0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.25)`,
        opacity: Math.min(1, progress * 2),
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
};
```

Use a spring config with damping ~18 (slight overshoot) instead of
critically damped ~25. The overshoot is what makes the "snap" feel
satisfying — the card slightly overshoots its position then bounces back.

## Observed in

- FINAL_RENDER_4K board_1–5 foreground instances (4–5 position keys + rotation)
- Each board has a Tinted shadow copy behind it for depth
