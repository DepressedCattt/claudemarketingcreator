---
technique: svg-connector-draw
level: L2
primitives: [spring, interpolate]
hooks: []
profiles: [snappy-saas, dark-tech, product-showcase]
use_when: "SVG lines or connectors need animated draw-on effect between elements"
---

# SVG Connector Draw-On

Animated SVG path connecting two component nodes with a quadratic bezier curve. The path draws on via `strokeDashoffset`, with a traveling dot particle following the curve. A ghost path at low opacity provides a visible track before the draw-on completes.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| stroke_width | 3px | Connector line width |
| ghost_stroke_opacity | 20% hex suffix | Pre-draw visible track |
| glow_filter | `drop-shadow(0 0 6px ${color})` | Glow around drawn path |
| curve_control_offset | dy × 0.25 (x), dx × 0.15 (y) | Bezier curvature factor |
| path_length_multiplier | 1.2 | Approx bezier length vs straight |
| dot_radius | 5–6px | Traveling indicator dot |
| dot_glow_filter | `drop-shadow(0 0 8px ${color})` | Dot glow radius |
| dot_visibility | progress > 0.05 && progress < 0.95 | Hidden at endpoints |
| spring.stiffness | 100 | Draw-on speed |
| spring.damping | 24 | Smooth deceleration |
| spring.mass | 0.95 | Medium weight |

## Code pattern

```tsx
const progress = spring({ frame: Math.max(0, frame - delay), fps,
  config: { stiffness: 100, damping: 24, mass: 0.95 } });

const dx = x2 - x1;
const dy = y2 - y1;
const mx = (x1 + x2) / 2 + dy * 0.25;
const my = (y1 + y2) / 2 - dx * 0.15;
const pathD = `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`;
const pathLen = Math.sqrt(dx * dx + dy * dy) * 1.2;

<svg style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
  {/* Ghost track */}
  <path d={pathD} fill="none" stroke={`${color}20`} strokeWidth={3} />
  {/* Animated draw-on */}
  <path d={pathD} fill="none" stroke={color} strokeWidth={3}
    strokeLinecap="round"
    strokeDasharray={pathLen}
    strokeDashoffset={pathLen * (1 - progress)}
    filter={`drop-shadow(0 0 6px ${color})`} />
  {/* Traveling dot */}
  <circle
    cx={interpolate(progress, [0, 1], [x1, x2])}
    cy={interpolate(progress, [0, 1], [y1, y2])}
    r={5} fill={color}
    opacity={progress > 0.05 && progress < 0.95 ? 1 : 0}
    filter={`drop-shadow(0 0 8px ${color})`} />
</svg>
```

## Notes

- The traveling dot follows a linear interpolation between endpoints, not the actual bezier curve. For short connectors this is visually indistinguishable.
- For long curved paths, compute the actual point-on-curve using `t` parameterization of the quadratic bezier for more accurate tracking.
- Ghost track renders behind the animated path to show the full route before draw-on completes.

## Observed in

- SaasMediumComponentAd Scene 2 (Connect) — 5 connectors between data-flow nodes
- SaasPlaygroundAd S12 — 2 connectors between Source → Transform → Output nodes
