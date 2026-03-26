---
technique: headline-scatter
level: L2+L5
primitives: [easeOut3, interpolate]
hooks: []
profiles: [kinetic-typography, snappy-saas]
use_when: "Hook scene needs rapid-fire scattered words or phrases flying across screen for energy"
---

# Headline Scatter

Multiple text lines exit simultaneously in different directions, creating an explosion/dispersal effect. The diverging velocity vectors make it feel like an event, not a dismiss.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| scatter_start | 80f (local) | When scatter begins |
| scatter_duration | 14f | Animation length |
| easing | easeOut3 | Smooth deceleration |
| line_count | 3 | Number of diverging lines |
| opacity_multiplier | 1.2 | Fade faster than translate |
| blur_additive | 4px per scatterT | Blur increases during scatter |
| bg_fade | simultaneous | Background fades to transparent during scatter |

## Direction vectors (example)

| Line | Text | dx | dy | Direction |
|------|------|-----|-----|-----------|
| 0 | "Design at" | -130 | -140 | Upper-left |
| 1 | "the speed" | -20 | -160 | Straight up |
| 2 | "of shipping." | +120 | +130 | Lower-right |

## Code pattern

```tsx
const SCATTER_START = 80;
const SCATTER_DUR   = 14;

{SCATTER_LINES.map((line, i) => {
  const scatterT = easeOut3(clamp((frame - SCATTER_START) / SCATTER_DUR, 0, 1));
  return (
    <div style={{
      opacity: enter.opacity * (1 - scatterT * 1.2),
      filter: `blur(${enter.blur + scatterT * 4}px)`,
      transform: `
        translateX(${scatterT * line.dx}px)
        translateY(${enter.translateY + scatterT * line.dy}px)
      `,
    }}>
      {line.text}
    </div>
  );
})}
```

## Transition mechanics

The scatter happens while Scene 1's background fades to transparent (`opacity: bgFadeOut`), revealing Scene 2's dark background underneath. Scene 1 uses `zIndex: 5` so the flying fragments remain visible over Scene 2's content. This creates a seamless, motivated transition.

## Observed in

- FormaAd original Scene 1 (0–112f) — 3 headlines scatter at frame 80, 14f duration
