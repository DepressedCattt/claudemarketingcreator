---
technique: blur-scale-reveal
level: L1+L2
primitives: [spring, interpolate]
hooks: [useSnapReveal, useCinematicTextReveal]
profiles: [snappy-saas, luxury-slow, kinetic-typography, dark-tech]
use_when: "Text needs cinematic blur-to-sharp reveal with subtle scale animation for premium feel"
---

# Blur-Scale Reveal

The signature text/element entrance. Element resolves from blurred + scaled-down to sharp + full-size. This is the single most-used animation technique in the system.

## Parameter table

| Parameter | Snappy SaaS | Luxury Slow | Kinetic Type | Dark Tech |
|-----------|-------------|-------------|--------------|-----------|
| blur_start | 10px | 8px | 6px | 10px |
| blur_end | 0px | 0px | 0px | 0px |
| scale_start | 0.95 | 0.92 | 0.97 | 0.95 |
| scale_end | 1.0 | 1.0 | 1.0 | 1.0 |
| spring.stiffness | 200 | 80 | 150 | 120 |
| spring.damping | 25 | 24 | 18 | 22 |
| spring.mass | 0.8 | 1.1 | 0.7 | 0.9 |
| duration_approx | 12–15f | 24–30f | 16–20f | 18–22f |
| opacity_start | 0 | 0 | 0 | 0 |
| opacity_end | 1 | 1 | 1 | 1 |

## Code pattern — spring-driven (FormaAd2 style)

```tsx
function useSnapReveal(startF: number) {
  const frame   = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: Math.max(0, frame - startF),
    fps,
    config: { stiffness: 200, damping: 25, mass: 0.8 },
  });
  return {
    opacity:   s,
    transform: `scale(${0.95 + s * 0.05})`,
    filter:    `blur(${((1 - s) * 10).toFixed(2)}px)`,
  };
}
```

## Code pattern — easing-driven (premiumMotion style)

```tsx
const reveal = useCinematicTextReveal(startFrame, 16, 7);
// Returns: { opacity, translateY, blur }
// Apply: opacity={reveal.opacity} transform={`translateY(${reveal.translateY}px)`}
//        filter={`blur(${reveal.blur}px)`}
```

## Observed in

- FormaAd2 Scene 1 hook beats — `useSnapReveal` (snappy)
- FormaAd2 Scene 5 tagline — spring per-word (snappy)
- LangEaseAd Scene 1 hook — `useSnapReveal` (snappy)
- LangEaseAd Scene 4 tagline — blur 10→0, scale 0.93→1.0 (snappy)
- VelourAd Scene 1 — `useCinematicTextReveal` + `useBlurResolve` (luxury)
- HavenAd Scene 1 — `useCinematicTextReveal` (luxury)
- PulseAd Scene 1 — `useCinematicTextReveal` + `useBlurResolve` (dark)

## Key insight

The spring-driven variant (FormaAd2) is *faster* and *snappier* than the easing-driven variant. Use spring for SaaS / snappy profiles. Use `useCinematicTextReveal` for luxury / organic feels where the drift + slow blur resolve adds weight.
