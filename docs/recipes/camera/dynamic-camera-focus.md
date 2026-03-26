---
technique: dynamic-camera-focus
level: L3
primitives: [spring, interpolate]
hooks: []
profiles: [snappy-saas, product-showcase]
source: CalmlyAd.tsx Act 3 camera IIFE
use_when: "Camera needs to dynamically track and focus on different elements within a scene"
---

# Dynamic Camera Focus

Camera zoom + pan that **tracks a moving element** rather than zooming to a fixed point. The `transformOrigin` follows the subject through multiple phases, creating a documentary/observational camera feel.

## How it works

Instead of a fixed `transformOrigin: "center center"`, the origin tracks through 3 phases:
1. **Pre-action:** Locked on the subject's starting position
2. **During action:** Follows the subject as it moves
3. **Post-action:** Settles back to scene center

Combined with a scale zoom, pan translation, and layered micro-effects.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| ZOOM_TARGET | 0.5–0.7 | Scale added to base 1.0 |
| zoom_in_spring | `{60, 12, 1.0}` | Gradual with slight overshoot |
| zoom_out_spring | `{55, 14, 1.2}` | Heavier, unhurried pull-back |
| pan_strength | 0.35–0.50 | Fraction of focus-to-center offset applied as translation |
| settle_spring | `{30, 16, 1.5}` | Very slow/heavy for post-action drift |
| drift_amplitude | 1–2px | Handheld breathing while zoomed |
| drift_rotation | 0.1–0.15° | Subtle roll |
| drag_tilt | 0.3–0.5° | Roll during tracking (sine arc) |
| drop_punch | 0.03–0.04 | Brief scale impulse on impact |
| vignette_opacity | 0.08–0.18 | Edge darkening while zoomed |

## Code pattern

```tsx
// 1. Zoom springs
const zoomInP = frame >= ZOOM_IN ? spring({...}) : 0;
const zoomOutP = frame >= ZOOM_OUT ? spring({...}) : 0;
const zoom = (1 + TARGET * zoomInP - TARGET * zoomOutP) * (1 + punch);

// 2. Dynamic focus point
let focusX, focusY;
if (frame < GRAB) {
  focusX = subjectStartX;
  focusY = subjectStartY;
} else if (frame < DROP) {
  focusX = subjectCurrentX;  // mirrors subject's movement logic
  focusY = subjectCurrentY;
} else {
  const settle = spring({ frame: frame - DROP, fps, config: SETTLE_CONFIG });
  focusX = subjectEndX + (CX - subjectEndX) * settle;
  focusY = subjectEndY + (CY - subjectEndY) * settle;
}

// 3. Pan (tied to zoom level)
const panStrength = zoomInP * (1 - zoomOutP);
const panX = -(focusX - CX) * panStrength * 0.45;
const panY = -(focusY - CY) * panStrength * 0.45;

// 4. Micro effects (all scaled by zoom envelope)
const env = zoomInP * (1 - zoomOutP * 0.8);
const driftX = (Math.sin(frame * 0.11) * 1.5 + Math.sin(frame * 0.073) * 1.0) * env;
const driftRot = Math.sin(frame * 0.09) * 0.12 * env;

// 5. Apply
<div style={{
  transform: `scale(${zoom}) translate(${panX + driftX}px, ${panY + driftY}px) rotate(${rot}deg)`,
  transformOrigin: `${focusX}px ${focusY}px`,
}}>
```

## Layered effects stack

All effects are composited into **one** `transform` string on **one** wrapper div:

| Layer | Effect | Envelope |
|-------|--------|----------|
| Scale | `zoom * (1 + punch)` | Full timeline |
| Translate | `panX + shakeX + driftX, panY + driftY` | Pan: zoom envelope; shake: impact window; drift: zoom envelope |
| Rotate | `driftRot + dragTilt` | Drift: zoom envelope; tilt: drag window only |

Plus a **separate** vignette overlay div with `opacity: α * zoomInP * (1 - zoomOutP)`.

## Key insights

1. **`transformOrigin` must be dynamic** — if it's fixed at center while you're panning, the zoom creates a "sliding" effect instead of a "zooming into" effect
2. **Pan strength must be tied to zoom level** — `panStrength = zoomInP * (1 - zoomOutP)` ensures pan fades during zoom-out, preventing a jarring snap-back
3. **Multiple sine frequencies for drift** — single frequency drift looks periodic and robotic; 2+ frequencies (e.g., 0.11, 0.073) create organic variation
4. **Vignette lifts during zoom-out** — this coincides with the "reveal" of the full scene, opening up the frame for the CTA

## Observed in

- CalmlyAd Act 3 — camera tracks API migration card from float position → dashboard drop zone → settle on center
