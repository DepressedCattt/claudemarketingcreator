---
technique: tapered-draw-on
level: L2
primitives: [SVG path, interpolate]
hooks: []
profiles: [snappy-saas, dark-tech]
source: FINAL_RENDER_4K.ae-extract.json (liquid_up strokes, board text lines)
use_when: "Lines or underlines need tapered draw-on effect with variable stroke width"
---

# Tapered Draw-On

SVG strokes that draw themselves on with organic thickness variation —
thicker at the start, tapering to thin at the tip, like hand-drawn ink.
In AE this uses Trim Paths + Stroke Taper with animated Start/End Length.
In Remotion we use multiple overlapping SVG paths with varying stroke widths
or a single path with animated `stroke-dasharray` combined with a gradient
stroke opacity mask.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| draw_duration | 15–25f | How long the stroke takes to draw |
| stroke_width_start | 8–14px | Thickness at the origin |
| stroke_width_end | 1–3px | Thickness at the tip |
| stroke_color | accent color | Primary stroke color |
| glow_blur | 6–10px | Optional glow around the stroke |
| roughness | 0–1 | Edge roughness (0 = smooth, 1 = hand-drawn) |

## Code pattern

```tsx
const TaperedStroke: React.FC<{
  pathD: string;
  progress: number;
  color: string;
  maxWidth?: number;
  minWidth?: number;
  pathLength?: number;
}> = ({ pathD, progress, color, maxWidth = 10, minWidth = 2, pathLength = 500 }) => {
  // Layer multiple strokes with decreasing width and increasing dash offset
  // to simulate taper
  const layers = 5;

  return (
    <svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {Array.from({ length: layers }).map((_, i) => {
        const layerProgress = Math.max(0, progress - i * 0.02);
        const width = maxWidth - (i / layers) * (maxWidth - minWidth);
        const opacity = 1 - (i / layers) * 0.5;
        return (
          <path
            key={i}
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - layerProgress)}
            opacity={opacity * progress}
            filter={i === 0 ? `drop-shadow(0 0 6px ${color}60)` : undefined}
          />
        );
      })}
    </svg>
  );
};
```

For a simpler approach, use a single path with `stroke-width` animated
alongside `stroke-dashoffset`.

## Observed in

- FINAL_RENDER_4K liquid_up strokes (Shape Layer 20/21, Stroke Taper animated)
- FINAL_RENDER_4K board text lines (trim path draw-on for placeholder text)
