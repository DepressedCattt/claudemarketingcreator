---
technique: depth-deemphasis
level: L2
primitives: [easeInOut3, interpolate]
hooks: [depthDeemphasis]
profiles: [luxury-slow, dark-tech]
use_when: "Background elements need to visually recede (blur, scale, opacity) when a hero element takes focus"
---

# Depth De-emphasis

Background layer fades to reduced opacity, scales down slightly, and gains subtle blur. This creates hierarchy — the de-emphasised element recedes while the new focal point claims attention.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| opacity_target | 0.38 | From 1.0. Floor ≥ 0.35 |
| scale_target | 0.97 | From 1.0. Subtle shrink |
| blur_target | 2.5px | From 0px. Gentle defocus |
| transition_duration | ~20f | How long the de-emphasis takes |
| easing | easeInOut3 | Smooth state transition |

## Code pattern — using the helper

```tsx
import { depthDeemphasis } from "../utils/premiumMotion";

const deProgress = easeInOut3(clamp((frame - startFrame) / 20, 0, 1));
const de = depthDeemphasis(deProgress);

<div style={{
  opacity: de.opacity,    // 1.0 → 0.38
  transform: `scale(${de.scale})`,  // 1.0 → 0.97
  filter: `blur(${de.blur}px)`,     // 0 → 2.5px
}}>
  {backgroundContent}
</div>
```

## When to use

- When a hero card enters over a text block (the text de-emphasises)
- When transitioning from one focal element to another
- When showing before/after hierarchy changes
- Never on the hero element itself

## Observed in

- PulseAd — background de-emphasis during demo scene
- SolaceAd — hero burst de-emphasises surrounding elements
- premiumMotion.ts — hardcoded values in `depthDeemphasis()`
