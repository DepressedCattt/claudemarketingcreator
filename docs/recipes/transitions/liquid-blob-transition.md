---
technique: liquid-blob-transition
level: L2+L5
primitives: [SVG filter, interpolate, Math.sin]
hooks: []
profiles: [snappy-saas, dark-tech]
source: FINAL_RENDER_4K.ae-extract.json (liquid_up_1–11, liquid_board_1–4, drop)
use_when: "Organic, liquid-feeling transition between scenes using morphing blob shapes"
---

# Liquid Blob Transition

Organic, morphing blob shapes that flow across the screen as scene
transitions. The signature technique from the FINAL_RENDER 4K AE template.

In AE this uses Echo + Fractal Noise + Luma Key + Roughen Edges + Box Blur
on an adjustment layer over scaling ellipses. In Remotion/SVG we replicate
the look using SVG filter chains: `feTurbulence` for organic texture,
`feGaussianBlur` for softness, and `feColorMatrix` for high-contrast
thresholding that turns the blur into crisp blob edges.

## How it works

1. Render 3-5 animated ellipses that scale and move
2. Apply an SVG filter to the container that:
   - Blurs everything together (`feGaussianBlur`)
   - Applies high-contrast threshold (`feColorMatrix`) to create crisp blob edges
3. The blob edges appear organic because the overlapping blurred circles
   merge and separate as they move
4. Add `feTurbulence` displacement for rougher edges (optional, expensive)

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| blob_count | 3–5 | Number of animated ellipses |
| blob_size_range | 200–600px | Ellipse radius range |
| blob_scale_keys | 3 | Grow/shrink cycles |
| blur_stdDeviation | 30–50 | Higher = smoother blob merge |
| threshold_contrast | 18–25 | Higher = crisper edges |
| duration | 20–30f | Transition length |
| fill_color | accent or bg color | The blob fill |
| displacement_scale | 0–15 | feTurbulence roughness (0 = smooth, 15 = organic) |

## Code pattern

```tsx
const LiquidBlob: React.FC<{
  progress: number;
  color: string;
  direction?: "up" | "down" | "left" | "right";
}> = ({ progress, color, direction = "up" }) => {
  const frame = useCurrentFrame();

  const blobs = [
    { cx: 1400, cy: 1800, r: 400, phase: 0, speed: 0.04 },
    { cx: 1920, cy: 1900, r: 350, phase: 1.5, speed: 0.035 },
    { cx: 2400, cy: 1700, r: 300, phase: 3, speed: 0.045 },
    { cx: 1700, cy: 2000, r: 250, phase: 4.5, speed: 0.03 },
  ];

  const translateY = interpolate(progress, [0, 1], [800, -600]);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={3840} height={2160} style={{ position: "absolute" }}>
        <defs>
          <filter id="liquid-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="40" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 20 -10"
              result="goo"
            />
          </filter>
        </defs>
        <g
          filter="url(#liquid-goo)"
          transform={`translate(0, ${translateY})`}
        >
          {blobs.map((b, i) => {
            const scale = 1 + Math.sin(frame * b.speed + b.phase) * 0.3;
            const wobbleX = Math.sin(frame * 0.02 + b.phase) * 60;
            const wobbleY = Math.cos(frame * 0.025 + b.phase * 0.7) * 40;
            return (
              <ellipse
                key={i}
                cx={b.cx + wobbleX}
                cy={b.cy + wobbleY}
                rx={b.r * scale}
                ry={b.r * scale * 0.85}
                fill={color}
              />
            );
          })}
          {/* Base rectangle that the blobs merge into */}
          <rect
            x={0}
            y={1200}
            width={3840}
            height={2000}
            fill={color}
            rx={0}
          />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
```

The feColorMatrix with values `0 0 0 0 0 / 0 0 0 0 0 / 0 0 0 0 0 / 0 0 0 20 -10`
is the key: it multiplies the alpha channel by 20 and subtracts 10, creating
a high-contrast threshold that turns the gaussian blur into crisp blob edges.
Where blurred circles overlap, the alpha accumulates and exceeds the threshold,
creating the organic "gooey" merge effect.

## Variants

### Upward flow (scene transition)
Blobs flow from bottom to top, filling the screen with the next scene's
background color before content appears.

### Drop (exit transition)
A single ellipse with complex position keyframes (10 keys) that bounces
and drips downward. Use spring physics with very low damping.

### Horizontal flow
Same technique but translateX instead of translateY.

## Observed in

- FINAL_RENDER_4K liquid_up_1 through liquid_up_11 (16 compositions)
- FINAL_RENDER_4K liquid_board_1 through liquid_board_4
- FINAL_RENDER_4K drop composition (exit drip)
