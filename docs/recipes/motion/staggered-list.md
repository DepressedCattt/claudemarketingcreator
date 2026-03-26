---
technique: staggered-list
level: L1+L2
primitives: [spring, easeOut4, interpolate]
hooks: [premiumStagger]
profiles: [snappy-saas, luxury-slow, dark-tech, product-showcase]
use_when: "A vertical or horizontal list of items needs sequential reveal with consistent stagger timing"
---

# Staggered List

N elements enter sequentially with a consistent delay between each. Creates a cascade effect that guides the eye through content.

## Parameter table

| Parameter | Snappy SaaS | Luxury Slow | Dark Tech | Kinetic |
|-----------|-------------|-------------|-----------|---------|
| framesPerItem | 10–14 | 14–18 | 12–15 | 8–10 |
| translateFrom | -52 to -64px | -38 to -52px | -40px | -80 to -120px |
| opacity_duration | 8f | 12f | 10f | 6f |
| easing | easeOut4 | easeOut3 | easeOut4 | easeOut4 |
| enter_direction | left / up | up | up | left |
| accent_line | yes (wipe) | optional | yes (wipe) | no |
| accent_line_delay | +14f after item | +14f | +14f | — |

## Code pattern

```tsx
const FEATURES = [
  { name: "Translate", delay: 8 },
  { name: "Dub",       delay: 22 },  // 14f stagger
  { name: "Distribute", delay: 36 }, // 14f stagger
];

{FEATURES.map((feat, i) => {
  const t       = easeOut4(clamp((frame - feat.delay) / 22, 0, 1));
  const opacity = clamp(t / 0.3, 0, 1);
  const enterX  = (1 - t) * -64;

  return (
    <div style={{ opacity, transform: `translateX(${enterX}px)` }}>
      {feat.name}
    </div>
  );
})}
```

## Using premiumStagger helper

```tsx
import { premiumStagger } from "../utils/premiumMotion";

const startFrame = premiumStagger(index, baseFrame, 12);
// index 0 → baseFrame
// index 1 → baseFrame + 12
// index 2 → baseFrame + 24
```

## Observed in

- LangEaseAd Scene 3 — features: 8, 28, 48f (20f apart), translateX -64px
- VelourAd Scene 3 — services: 6, 20, 34f (14f apart)
- HavenAd Scene 3 — moments: 6, 22, 38f (16f apart)
- FormaAd2 Scene 4 — cards: 82, 92, 102, 112 (10f apart), spring from ±160px
- PulseAd Scene 3 — features: 0, 15, 30f (15f = 1 beat at 120 BPM)
- SolaceAd Scene 3 — stats: premiumStagger(i, 6, 20)
