---
technique: unfurl-reveal
level: L2
primitives: [interpolate, spring]
hooks: []
profiles: [snappy-saas, dark-tech]
source: FINAL_RENDER_4K.ae-extract.json (chart, checkbox, dialog_1/2, folder, hearts)
use_when: "Text or UI elements need to unfurl from a collapsed/hidden state with elastic spring motion"
---

# Unfurl Reveal

Cards and UI widgets reveal from bottom-to-top like a window shade rolling
up. In AE this uses the Transform effect's Scale Height property with 6
keyframes. In Remotion we use `clip-path: inset()` animated from fully
clipped to fully revealed, combined with a slight scale-up.

Much more interesting than a simple opacity+translateY entrance — the
content appears to "grow" from its base edge.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| clip_start | `inset(100% 0 0 0)` | Fully clipped (hidden) |
| clip_end | `inset(0 0 0 0)` | Fully revealed |
| duration | 18–24f | Reveal time |
| easing | easeOut3 or spring | Deceleration curve |
| scale_start | 0.95 | Slight scale-up during reveal |
| scale_end | 1.0 | Final size |
| origin | `bottom center` | Transform origin — grows from bottom |

## Code pattern

```tsx
const UnfurlReveal: React.FC<{
  progress: number;
  children: React.ReactNode;
  from?: "bottom" | "top" | "left" | "right";
}> = ({ progress, children, from = "bottom" }) => {
  const clip = interpolate(progress, [0, 1], [100, 0], {
    extrapolateRight: "clamp",
  });

  const insetMap = {
    bottom: `${clip}% 0 0 0`,
    top: `0 0 ${clip}% 0`,
    left: `0 ${clip}% 0 0`,
    right: `0 0 0 ${clip}%`,
  };

  const originMap = {
    bottom: "bottom center",
    top: "top center",
    left: "center left",
    right: "center right",
  };

  const scale = 0.95 + progress * 0.05;

  return (
    <div
      style={{
        clipPath: `inset(${insetMap[from]})`,
        transform: `scale(${scale})`,
        transformOrigin: originMap[from],
        opacity: progress > 0.02 ? 1 : 0,
      }}
    >
      {children}
    </div>
  );
};
```

## Observed in

- FINAL_RENDER_4K chart (bar chart unfurls from bottom, 6 keyframes)
- FINAL_RENDER_4K checkbox (checkmark card unfurls)
- FINAL_RENDER_4K dialog_1, dialog_2 (chat bubbles unfurl)
- FINAL_RENDER_4K folder (file browser unfurls)
- FINAL_RENDER_4K hearts (reaction card unfurls)
