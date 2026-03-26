---
technique: procedural-dot-grid
level: L2
primitives: [loop, spring, Math operations]
hooks: []
profiles: [snappy-saas, dark-tech]
source: FINAL_RENDER_4K.ae-extract.json (grid composition)
use_when: "Background needs procedural animated dot grid for tech/data visualization aesthetic"
---

# Procedural Dot Grid

A grid of small dots/circles that fade in with a radial wave pattern —
dots closer to the center appear first, radiating outward. In AE this uses
Vector Repeater to generate the grid and Luma Key for visibility control.

This creates a subtle, tech-aesthetic background element that's more
interesting than a flat dark background but doesn't compete with foreground
content.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| cols | 20–40 | Number of columns |
| rows | 12–24 | Number of rows |
| dot_size | 3–6px | Circle radius |
| dot_color | textDim or accent at 15% | Very subtle |
| spacing | 80–120px | Distance between dots |
| wave_speed | 0.3–0.6 | How fast the radial wave spreads |
| wave_origin | center or custom | Where the wave starts |
| max_opacity | 0.15–0.3 | Dots should be very subtle |

## Code pattern

```tsx
const DotGrid: React.FC<{
  progress: number;
  cols?: number;
  rows?: number;
  dotSize?: number;
  color?: string;
  spacing?: number;
  originX?: number;
  originY?: number;
}> = ({
  progress,
  cols = 30, rows = 18,
  dotSize = 4, color = "#94A3B8",
  spacing = 100,
  originX = 1920, originY = 1080,
}) => {
  const frame = useCurrentFrame();
  const totalW = cols * spacing;
  const totalH = rows * spacing;
  const startX = (3840 - totalW) / 2;
  const startY = (2160 - totalH) / 2;

  const maxDist = Math.sqrt(
    Math.pow(totalW / 2, 2) + Math.pow(totalH / 2, 2)
  );

  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * spacing;
      const y = startY + r * spacing;
      const dist = Math.sqrt(
        Math.pow(x - originX, 2) + Math.pow(y - originY, 2)
      );
      const normalDist = dist / maxDist;
      const dotProgress = Math.max(0, progress * 2 - normalDist);
      const breathe = Math.sin(frame * 0.02 + c * 0.3 + r * 0.2) * 0.15 + 0.85;

      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={x}
          cy={y}
          r={dotSize * Math.min(1, dotProgress)}
          fill={color}
          opacity={Math.min(0.25, dotProgress * 0.25) * breathe}
        />
      );
    }
  }

  return (
    <svg
      width={3840}
      height={2160}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      {dots}
    </svg>
  );
};
```

The radial wave entrance (dots closer to origin appear first) creates a
"ripple" feel that's much more alive than having all dots appear at once.

## Observed in

- FINAL_RENDER_4K grid (525x296, Vector Repeater + Luma Key)
- Common in SaaS ads as subtle background texture
