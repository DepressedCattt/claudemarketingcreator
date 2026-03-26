# L5 — Technique Selection Parameters

Which reveal method, transition type, layout approach, and camera motion to use.
This is the highest-level parameter — choosing the right technique.

---

## Text Reveal Methods

### technique.textReveal
- **Level**: L5
- **Type**: enum
- **Options**: blur-scale, cinematic-drift, word-slam, word-drift, typewriter, fade-only
- **Effect**: How text enters the scene.

| Method | Hook | Visual | Profile fit |
|--------|------|--------|-------------|
| `blur-scale` | `useSnapReveal` / spring | Blur 10→0, scale 0.95→1.0 | snappy, luxury |
| `cinematic-drift` | `useCinematicTextReveal` | Opacity + translateY drift + blur | luxury, dark |
| `word-slam` | `useWordSlam` | Scale 1.45→1, bounce, translateY | kinetic |
| `word-drift` | `useWordDrift` | Soft opacity + translateY | luxury |
| `typewriter` | `useTypewriter` | Character-by-character | product |
| `fade-only` | `useFadeIn` | Pure opacity | minimal |

---

## Element Entrance Methods

### technique.heroEntrance
- **Level**: L5
- **Type**: enum
- **Options**: arc-entry, soft-scale, slide-up, blur-resolve, spring-pop

| Method | Hook | Visual | Profile fit |
|--------|------|--------|-------------|
| `arc-entry` | `useArcEntry` | Curved spring path from offscreen | luxury, dark |
| `soft-scale` | `useSoftScaleIn` | Scale 0.92→1.0, easeOut4 | all |
| `slide-up` | `useSlideUp` | Vertical spring slide | kinetic, product |
| `blur-resolve` | `useBlurResolve` | Rack-focus blur 14→0px | luxury, dark |
| `spring-pop` | `useScaleIn` | Scale 0.85→1.0, spring | kinetic |

---

## Transition Types

### technique.sceneTransition
- **Level**: L5
- **Type**: enum
- **Options**: hard-cut, fade-overlap, element-driven, wipe, clip-path, typography-flood, headline-scatter

| Type | Description | Duration | Profile fit |
|------|-------------|----------|-------------|
| `hard-cut` | Instant switch (Sequence boundaries) | 0f | snappy, kinetic |
| `fade-overlap` | Scene overlap with opacity crossfade | 8–16f | luxury, dark |
| `element-driven` | Element from scene A travels into scene B | 10–20f | snappy, luxury |
| `wipe` | Left-to-right wipe reveal | 22f | all |
| `clip-path` | Brush sweep, iris, diagonal slash | 20–30f | luxury |
| `typography-flood` | Text scales unbounded, fills frame | 9–14f | dark |
| `headline-scatter` | Lines exit in diverging directions | 14f | kinetic |

---

## Clip-Path Transition Variants

| Variant | CSS pattern | Effect |
|---------|-------------|--------|
| Brush sweep | `inset(0 100% 0 0)` → `inset(0)` | Horizontal reveal |
| Vertical wipe | `inset(100% 0 0 0)` → `inset(0)` | Bottom-to-top |
| Diagonal slash | `polygon()` | Diagonal wipe |
| Iris close | `circle(100%)` → `circle(0%)` | Closing circle |

---

## Layout Approaches

### technique.layout
- **Level**: L5
- **Type**: enum
- **Options**: centered, split, asymmetric, grid, row-stack, fullbleed

| Layout | Description | Profile fit |
|--------|-------------|-------------|
| `centered` | Everything centered vertically+horizontally | snappy, dark |
| `split` | Left/right split (e.g., text left, image right) | product |
| `asymmetric` | Off-center focal point, dynamic tension | luxury |
| `grid` | 2x2 or 3-row grid for multiple elements | product |
| `row-stack` | Full-width rows stacked vertically (360px each) | dark, snappy |
| `fullbleed` | Element fills entire canvas | kinetic |

---

## Camera Motion

### technique.camera
- **Level**: L5
- **Type**: enum
- **Options**: none, drift, pedestal, dolly, orbit, parallax

| Motion | Description | Parameters | Profile fit |
|--------|-------------|------------|-------------|
| `none` | No camera motion | — | kinetic |
| `drift` | Subtle continuous pan + zoom + roll | zoom 1.04–1.07, roll ±0.8°, pan ±12px | luxury, dark |
| `pedestal` | Camera rises from below | clipTop 74%→0%, rotX -20°→-2° | product |
| `dolly` | Camera moves forward/back | scale 2.4→0.78 | product |
| `orbit` | Camera rotates around subject | rotY 0°→16° | product |
| `parallax` | Depth-layered movement | tier multipliers 0.02–0.55 | luxury |

### Camera drift parameters (common wrapper)

| Composition | zoom | roll | panX | panY |
|-------------|------|------|------|------|
| VelourAd | 1.065 | -0.8→0.28° | 12→-8 | 6→-4 |
| HavenAd | 1.055 | -0.65→0.22° | 10→-8 | 5→-4 |
| SolaceAd | 1.06 | -0.85→0.32° | 13→-9 | 7→-5 |
| PulseAd | 1.062 | -0.7→0.22° | 12→-10 | 7→-6 |
| VeridianAd | 1.062 | -0.8→0.3° | 12→-10 | 8→-6 |
| SeriAd | 1.048 | -0.60→0.20° | 9→-7 | 4→-3 |

---

## Depth Tiers (parallax / cinematography)

| Tier | Name | Parallax multiplier |
|------|------|---------------------|
| 0 | Background | 2–4% (camT × 0.02) |
| 1 | Mid-back | 6–10% (camT × 0.07) |
| 2 | Midground | 18–25% (camT × 0.20) |
| 3 | Hero | 0% (camera tracks) |
| 4 | Foreground | 45–70% (camT × 0.55) |

---

## 3D Perspective (CSS)

### technique.perspective
- **Level**: L5
- **Type**: number (px)
- **Range**: 800–1200
- **Typical**: 950
- **Effect**: CSS perspective distance for preserve-3d containers.
- **Source**: FormaAd2 phone tunnel: 950px

### technique.preserveDepthSpacing
- **Level**: L5
- **Type**: number (px)
- **Range**: 200–400
- **Typical**: 280
- **Effect**: Z-distance between elements in a 3D tunnel.
- **Source**: FormaAd2 PHONE_GAP: 280px
