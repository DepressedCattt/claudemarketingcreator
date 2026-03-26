---
technique: ai-background-plate
level: L2
primitives: [staticFile, Img, clipPath, polygon, transformOrigin]
hooks: []
profiles: [dark-tech, snappy-saas, luxury-slow]
source: AnimlyAd.tsx S1 Hook (CRT monitor scene)
use_when: "Scene needs a photorealistic environment (office, device, room) with animated content overlaid on a specific region"
see_also:
  - file: ../camera/camera-wrapper.md
    tradeoff: "Camera wrapper adds motion to the entire scene including the background plate. Combine them — plate provides realism, wrapper provides motion."
---

# AI-Generated Background Plate

Use AI image generation to create a photorealistic static background, then animate Remotion content on top of mapped regions. Produces cinematic results that would be extremely difficult to build purely in code.

## When to use

- Hook scenes needing photorealistic environments
- Scenes where a physical object (monitor, phone, billboard, tablet) displays animated content
- When code-only backgrounds would look flat or take too long

## Workflow

### Step 1: Generate the image

Use image generation (DALL-E, Midjourney, etc.) to create a photorealistic scene. Requirements:
- Resolution must match or exceed composition (4K = 3840×2160 minimum)
- Target areas for animation overlay should be clearly visible and unobstructed
- Lighting should have drama (directional light, shadows, depth) — flat-lit images look stock
- Save as PNG to `public/images/`

### Step 2: Place as full-bleed background

```tsx
<img
  src={staticFile("images/my-background.png")}
  style={{
    position: "absolute", inset: 0,
    width: "100%", height: "100%",
    objectFit: "cover",
  }}
/>
```

### Step 3: Map the interactive region

Measure the pixel coordinates of the area where animation will overlay. For rectangular screens this is a bounding box; for curved surfaces use a polygon.

```tsx
// Bounding box from the generated image (measure in an image editor)
const SCREEN_LEFT = 1329;
const SCREEN_TOP = 497;
const SCREEN_W = 1182;
const SCREEN_H = 929;

// For curved/irregular surfaces, trace a polygon clipPath
const SCREEN_CLIP = `polygon(
  34.3% 0.1%, 11.9% 1.3%, 2.9% 2.5%, ...
)`;
```

**Tip:** Use a flood-fill contour trace tool or manually trace the screen boundary. For CRT monitors, TVs, or rounded displays, a 40-60 vertex polygon captures barrel distortion accurately.

### Step 4: Overlay animated content

```tsx
<div style={{
  position: "absolute",
  left: SCREEN_LEFT, top: SCREEN_TOP,
  width: SCREEN_W, height: SCREEN_H,
  clipPath: SCREEN_CLIP,  // masks to the exact screen shape
  overflow: "hidden",
}}>
  {/* All your Remotion animation goes here */}
  <div style={{ position: "absolute", inset: 0, background: "#0a1a0a" }}>
    {/* Animated content... */}
  </div>
</div>
```

### Step 5: Apply camera motion to the combined result

Wrap both the background plate and the overlay in a single transform container:

```tsx
const FOCAL_X = SCREEN_LEFT + SCREEN_W / 2;
const FOCAL_Y = SCREEN_TOP + SCREEN_H / 2;

<div style={{
  position: "absolute", inset: 0,
  transform: `scale(${zoom}) translate(${shakeX}px, ${shakeY}px) rotate(${shakeRot}deg)`,
  transformOrigin: `${FOCAL_X}px ${FOCAL_Y}px`,
  willChange: "transform",
}}>
  <img src={staticFile("images/my-background.png")} ... />
  <div style={{ left: SCREEN_LEFT, top: SCREEN_TOP, ... }}>
    {/* animated overlay */}
  </div>
</div>
```

Setting `transformOrigin` to the screen center creates a natural "zoom into the screen" effect.

## Parameter reference (from AnimlyAd)

| Parameter | Value | Notes |
|-----------|-------|-------|
| Image resolution | 3840×2160 (4K) | Must match composition |
| Screen bounding box | 1329, 497, 1182×929 | Measured from generated image |
| clipPath vertices | 62 | Enough for smooth barrel distortion |
| Zoom range | 1.0 → 5.45 | Ambient 1.45 + rush 4.0 |
| transformOrigin | Screen center | Natural focal zoom |

## Limitations

- **No parallax** — the image is flat. Foreground/background objects don't move independently.
- **Manual measurement** — screen regions must be pixel-measured per image. Different images need different coordinates.
- **Resolution ceiling** — zooming beyond the image resolution reveals pixels. Plan max zoom at generation time.
- **Static lighting** — lighting in the image doesn't respond to animated content. Use CSS glows/shadows on the overlay to fake light interaction.

## Observed in

- AnimlyAd S1 Hook — CRT monitor on desk, animated "bad animation demos" playing on the screen, camera zooms into the screen as transition to S2
