---
technique: typography-flood
level: L2+L5
primitives: [interpolate]
hooks: []
profiles: [dark-tech, snappy-saas]
use_when: "A word from the current scene needs to scale up dramatically as a transition to the next scene"
---

# Typography Flood

A single text element scales continuously without upper clamp, filling the entire frame. The linear, accelerating growth creates a sense of overwhelming scale. Used as a scene transition — the scaled element's blur and mass consume everything.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| flood_start_frame | 79f (local) | When scaling begins |
| flood_duration | 9f | Frames over which scale multiplier = 1.0 |
| scale_formula | `1 + raw * 17` | raw = (frame - start) / dur, NO upper clamp |
| max_blur | 5px | Motion blur grows with scale |
| blur_formula | `min(raw * 2.5, 5)` | Capped at 5px |
| text_size | 148px | Starting font size |
| text_weight | 900 | Maximum impact |
| text_color | dark on cream bg | High contrast throughout |
| scene_overlap | 16f | Next scene fades in while flood is mid-scale |

## Code pattern

```tsx
const FLOOD_START = 79;
const FLOOD_DUR   = 9;
const floodRaw    = Math.max(0, (frame - FLOOD_START) / FLOOD_DUR);
const floodScale  = 1 + floodRaw * 17;

<div style={{
  transform: `scale(${floodScale})`,
  filter: `blur(${Math.min(floodRaw * 2.5, 5).toFixed(1)}px)`,
  transformOrigin: "50% 50%",
}}>
  12K
</div>
```

## Transition mechanics

The flood element is positioned OUTSIDE the scene's `usePremiumFadeOut` wrapper so it persists through the transition. The next scene's dark background fades in over 14 frames, covering the flood.

The cream background stays at full opacity throughout — the text is dark-on-cream, always legible even as it scales past the canvas edge.

## Observed in

- FormaAd original Scene 4 (331–443f) — "12K" scales from 148px → effectively fills canvas
