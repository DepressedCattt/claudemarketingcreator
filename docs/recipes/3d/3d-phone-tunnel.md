---
technique: 3d-phone-tunnel
level: L2+L5
primitives: [interpolate, easeInOut3]
hooks: []
profiles: [snappy-saas, product-showcase]
use_when: "3D phone or device needs tunnel/fly-through camera reveal animation"
---

# 3D Phone Tunnel

CSS 3D tunnel using `preserve-3d`. Multiple phone frames are positioned at increasing Z-depths, and the camera flies through them by animating a container's `translateZ`.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| perspective | 950px | CSS perspective on outer container |
| phone_count | 7 | Number of phone frames in tunnel |
| phone_spacing_z | 280px | Z-depth gap between phones |
| total_depth | 1680px | phone_spacing * (phone_count - 1) |
| phone_width | 185px | Individual phone frame width |
| phone_height | 330px | Individual phone frame height |
| phone_border_radius | 26px | Phone frame corner rounding |
| camera_easing | easeInOut3 | Smooth acceleration through tunnel |
| camera_duration | 145f | Frames to fly full depth |
| phone_fade_range | [-560, -140, 0, 160] | Z-distance based opacity (approach → pass) |
| text_stagger | 20, 60, 110f | Frame offsets for tunnel text overlays |
| transition_flash_start | 148f | When last phone triggers transition |
| transition_flash_duration | 12f | Blue radial wipe duration |

## Code pattern

```tsx
const PHONE_GAP = 280;
const N_PHONES  = 7;
const TOTAL_DEPTH = PHONE_GAP * (N_PHONES - 1);

const cameraProgress = easeInOut3(clamp(frame / 145, 0, 1));
const worldZ = interpolate(cameraProgress, [0, 1], [0, TOTAL_DEPTH]);

<div style={{ perspective: 950, overflow: "hidden" }}>
  <div style={{
    transformStyle: "preserve-3d",
    transform: `translateZ(${worldZ}px)`,
  }}>
    {Array.from({ length: N_PHONES }, (_, i) => (
      <PhoneFrame
        key={i}
        style={{
          transform: `translateZ(${-i * PHONE_GAP}px)`,
          opacity: clamp(
            interpolate(
              -i * PHONE_GAP + worldZ,
              [-560, -140, 0, 160],
              [0.2, 1, 1, 0]
            ), 0, 1
          ),
        }}
      />
    ))}
  </div>
</div>
```

## Text overlays during tunnel

Three text stages appear centered over the tunnel, each using blur-scale-reveal:

| Frame | Text | Effect |
|-------|------|--------|
| 20 | "Books." | Black hero text, scale-in |
| 60 | "Audio. Video." | Gradient + black text |
| 110 | "All In One Platform." | Gradient accent |

Each stage fades out 8f before the next appears.

## Observed in

- FormaAd2 Scene 3 (180–360f) — 7 phone tunnel, 950px perspective
- H.1 reference ad 00:07–00:10 — 3D phone tunnel with parallax

## Key insight

The easeInOut3 camera curve creates a natural acceleration-deceleration that matches real camera motion. Linear camera movement reads as robotic.
