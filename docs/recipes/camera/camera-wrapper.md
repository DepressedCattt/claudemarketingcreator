---
technique: camera-wrapper
level: L2+L5
primitives: [interpolate]
hooks: []
profiles: [luxury-slow, dark-tech]
use_when: "Scene needs subtle camera motion (pan, scale, rotation) applied to the entire scene root"
---

# Camera Wrapper

Subtle continuous camera drift applied to the scene root: slow zoom + rotation + horizontal/vertical pan. Creates the feeling of a physical camera observing the composition, adding dimension without distracting.

## Parameter table

| Parameter | Range | Typical | Notes |
|-----------|-------|---------|-------|
| zoom_start | 1.0 | 1.0 | Always starts at 1.0 |
| zoom_end | 1.04–1.07 | 1.055 | Slight zoom in over duration |
| zoom_formula | `1.0 + (frame / total) * 0.05` | — | Linear is intentional |
| roll_start | -0.6° to -0.85° | -0.7° | Slight counter-clockwise |
| roll_end | 0.20° to 0.32° | 0.25° | Settles near level |
| roll_keyframes | 4-point interpolation | — | Not monotonic — has mid-swing |
| panX_start | 9 to 13px | 10px | Slight right offset |
| panX_end | -7 to -10px | -8px | Drifts left |
| panY_start | 4 to 8px | 6px | Slight down offset |
| panY_end | -3 to -6px | -4px | Drifts up |

## Code pattern

```tsx
function useCameraTransform(totalFrames: number) {
  const frame = useCurrentFrame();
  const zoom = 1.0 + (frame / totalFrames) * 0.055;
  const panX = interpolate(frame, [0, totalFrames], [10, -8],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const panY = interpolate(frame, [0, totalFrames], [6, -4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const roll = interpolate(
    frame,
    [0, 80, 240, totalFrames],
    [-0.7, -0.2, 0.1, 0.25],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  return `scale(${zoom}) rotateZ(${roll}deg) translateX(${panX}px) translateY(${panY}px)`;
}
```

## Application

Apply to a wrapper `<div>` around all scene content. The camera transform is computed once at the root and passed down:

```tsx
export const Ad: React.FC = () => {
  const cam = useCameraTransform(540);
  return (
    <AbsoluteFill>
      <Sequence ...><SceneHook cam={cam} /></Sequence>
      <Sequence ...><SceneProduct cam={cam} /></Sequence>
    </AbsoluteFill>
  );
};

// Inside each scene:
<div style={{ transform: cam, transformOrigin: "center center" }}>
```

## Important: zoom is LINEAR, not eased

The camera zoom uses linear interpolation intentionally. Easing the zoom creates visible start/stop points. Linear zoom is imperceptible because the rate of change is so small (0.05 over 18 seconds = ~0.003 per second).

## Observed values per composition

| Composition | zoom | roll range | panX | panY |
|-------------|------|------------|------|------|
| VelourAd | 1.065 | -0.8→0.28° | 12→-8 | 6→-4 |
| HavenAd | 1.055 | -0.65→0.22° | 10→-8 | 5→-4 |
| SolaceAd | 1.06 | -0.85→0.32° | 13→-9 | 7→-5 |
| PulseAd | 1.062 | -0.7→0.22° | 12→-10 | 7→-6 |
| VeridianAd | 1.062 | -0.8→0.3° | 12→-10 | 8→-6 |
| SeriAd | 1.048 | -0.60→0.20° | 9→-7 | 4→-3 |
| FormaAd orig | 1.05 | -0.4→0.25° | 6→-5 | 4→-3 |
