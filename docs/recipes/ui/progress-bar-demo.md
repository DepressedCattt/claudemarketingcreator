---
technique: progress-bar-demo
level: L2+L3
primitives: [interpolate, spring]
hooks: []
profiles: [snappy-saas, product-showcase]
use_when: "Progress bar or loading indicator needs animated fill with label"
---

# Progress Bar Demo

Animated progress bar with counter, shimmer sweep, and checkmark + confetti completion burst. Used for product demo scenes showing processing/conversion.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| bar_height | 10px | Progress bar track height |
| bar_radius | 6px | Border radius |
| bar_track_color | `${accent}12` | 12% opacity of accent |
| bar_fill_gradient | `linear-gradient(90deg, accentLight, accent)` | Two-tone fill |
| fill_start_frame | 10f | When bar starts filling |
| fill_end_frame | 65f | When bar reaches target % |
| fill_target | 81% | Penultimate value |
| done_frame | 68f | When bar jumps to final value |
| done_value | 99% or 100% | Final state |
| counter_font | monospace | Percentage display font |
| counter_size | 22–28px | Percentage display size |
| counter_weight | 700–800 | Bold counter |
| shimmer_width | 40% | Width of sweeping highlight |
| shimmer_opacity | 0.3 | Shimmer highlight opacity |
| checkmark_frame | 72f | When checkmark appears |
| checkmark_size | 24–28px | Circle diameter |
| checkmark_color | #10B981 | Green success |
| confetti_dot_count | 8 | Number of burst dots |
| confetti_radius | 60–75px | Burst distance |
| confetti_duration | 16f | Burst animation duration |
| confetti_easing | easeOut4 | Outward burst |

## Code pattern — progress bar fill

```tsx
const progressRaw = interpolate(frame, [10, 65], [0, 81], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});
const isDone   = frame >= 68;
const progress = isDone ? 99 : progressRaw;

<div style={{ height: 10, background: `${accent}12`, borderRadius: 6 }}>
  <div style={{
    height: "100%",
    width: `${progress}%`,
    background: `linear-gradient(90deg, ${accentLight}, ${accent})`,
    borderRadius: 6,
  }} />
</div>
```

## Code pattern — confetti burst

```tsx
const confettiT = easeOut4(clamp((frame - 72) / 16, 0, 1));
const dots = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * 360;
  const rad   = (angle * Math.PI) / 180;
  const dist  = 60 + (i % 3) * 5;
  return {
    x: Math.cos(rad) * dist * confettiT,
    y: Math.sin(rad) * dist * confettiT,
    opacity: 1 - confettiT * 0.6,
  };
});
```

## Observed in

- FormaAd2 Scene 4 (360–480f) — 0→81→99%, checkmark at 72f, confetti burst
- LangEaseAd Scene 2 (90–225f) — 0→81→100%, checkmark with "Ready in 50+ languages"
