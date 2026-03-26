---
technique: bounce-pop-stagger
level: L1
primitives: [spring]
hooks: []
profiles: [snappy-saas, dark-tech, product-showcase]
source: FINAL_RENDER_4K.ae-extract.json (hearts, board avatars, chart bars)
use_when: "Multiple UI elements need bouncy pop-in entrance with staggered timing"
---

# Bounce Pop Stagger

Elements scale from 0 → overshoot → settle with a bouncy spring, staggered
by 2-4 frames per element. In AE this uses 3 Scale keyframes
(0% → ~115% → 100%) with 2-frame offset between elements.

This is different from our current stagger which uses critically-damped
springs (no bounce). The bounce creates a playful, energetic feel — each
element "pops" into existence.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| spring.stiffness | 200–260 | Higher = faster snap |
| spring.damping | 12–16 | LOW damping = visible bounce |
| spring.mass | 0.6–0.8 | Light = snappy |
| stagger_frames | 2–4f | Tight offset between elements |
| scale_from | 0 | Start invisible |
| overshoot | ~115% | Approximate peak before settling |
| settle | 100% | Final scale |

## Code pattern

```tsx
const BOUNCE_SPRING = { stiffness: 240, damping: 14, mass: 0.7 };

const BouncePop: React.FC<{
  delay: number;
  children: React.ReactNode;
}> = ({ delay, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: BOUNCE_SPRING,
  });

  return (
    <div
      style={{
        transform: `scale(${p})`,
        opacity: p > 0.01 ? 1 : 0,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};

// Usage — stagger by 3 frames:
{items.map((item, i) => (
  <BouncePop key={i} delay={baseDelay + i * 3}>
    <ItemComponent {...item} />
  </BouncePop>
))}
```

The key is the LOW DAMPING (12-16). Our current springs use damping 22-28
which produces critically-damped motion (no bounce). Dropping to 14 creates
a visible overshoot that settles — this is what makes elements feel "alive"
instead of "sliding into place."

## Observed in

- FINAL_RENDER_4K hearts (3 hearts, 2-frame offset, Scale 3 keys)
- FINAL_RENDER_4K board avatars (3 dot avatars per board, staggered pop)
- FINAL_RENDER_4K chart bars (4 bars with Scale pop-in)
