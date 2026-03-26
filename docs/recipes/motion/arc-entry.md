---
technique: arc-entry
level: L1+L2
primitives: [spring]
hooks: [useArcEntry]
profiles: [luxury-slow, dark-tech]
use_when: "Hero elements need curved arc entry path using spring X + easeOut Y for premium feel"
---

# Arc Entry

Hero element enters on a curved spring path from offscreen. The arc creates a sense of weight and intention that a straight slide lacks.

## Parameter table

| Parameter | Luxury Slow | Dark Tech | Product |
|-----------|-------------|-----------|---------|
| fromX | -100 to -110px | -110px | -90px |
| fromY | 130–140px | 150px | 120px |
| spring.stiffness | 90 | 90 | 110 |
| spring.damping | 22 | 22 | 20 |
| spring.mass | 1.1 | 1.1 | 0.9 |
| arc_duration (internal) | 28f | 28f | 28f |

## Code pattern

```tsx
const arc = useArcEntry(startFrame, -110, 130, PREMIUM_SPRING.hero);
// Returns: { translateX, translateY }

<div style={{
  transform: `
    translateX(calc(-50% + ${arc.translateX}px))
    translateY(calc(-50% + ${arc.translateY}px))
  `,
}}>
```

## Combining with other effects

Always pair arc-entry with blur-resolve and soft-scale for a complete hero entrance:

```tsx
const arc     = useArcEntry(0, -110, 130, PREMIUM_SPRING.hero);
const blur    = useBlurResolve(0, 24, 16);
const scale   = useSoftScaleIn(0, 0.90, 28);
const opacity = easeOut3(clamp(frame / 18, 0, 1));

<div style={{
  transform: `translate(...) scale(${scale})`,
  filter: `blur(${blur}px)`,
  opacity,
}}>
```

## Observed in

- VelourAd Scene 2 — card from (-100, 140) with hero spring (luxury)
- HavenAd Scene 2 — card arc (luxury)
- SolaceAd Scene 1 — hero from (-110, 130) (luxury)
- PulseAd Scene 1 — hero from (-110, 150) (dark)
- VeridianAd Scene 1 — hero from (-90, 120) (dark)
