# L4 — Temporal Parameters

Scene durations, BPM / beat grids, total duration, transitions, and hold times.
These control pacing — how fast the ad moves and where it breathes.

---

## BPM & Beat Grid

### tempo.bpm
- **Level**: L4
- **Type**: number
- **Range**: 90–128
- **Typical**: 100–122 (premium SaaS range)
- **Default**: 120
- **Effect**: Determines the timing grid. Higher BPM = faster pace, shorter scenes.
- **Profiles**: snappy: 120–128 | luxury: 90–100 | kinetic: 110–120 | dark: 100–110

### BPM reference table

| BPM | 1 beat | 1 bar (4 beats) | 2 bars | 4 bars |
|-----|--------|-----------------|--------|--------|
| 90 | 0.667s | 2.667s | 5.333s | 10.667s |
| 100 | 0.600s | 2.400s | 4.800s | 9.600s |
| 110 | 0.545s | 2.182s | 4.364s | 8.727s |
| 120 | 0.500s | 2.000s | 4.000s | 8.000s |
| 128 | 0.469s | 1.875s | 3.750s | 7.500s |

### Frames per beat at 30fps

| BPM | 1 beat | 1 bar | 2 bars | 4 bars |
|-----|--------|-------|--------|--------|
| 100 | 18f | 72f | 144f | 288f |
| 110 | 16.4f | 65.5f | 131f | 262f |
| 120 | 15f | 60f | 120f | 240f |
| 128 | 14.1f | 56.3f | 112.5f | 225f |

---

## Scene Durations

### scene.hookDuration
- **Level**: L4
- **Type**: number (frames)
- **Range**: 75–120
- **Typical**: 90
- **Effect**: First 2.5–4 seconds. Must grab attention immediately.
- **Profiles**: snappy: 90 | luxury: 90 | kinetic: 90–120 | dark: 120

### scene.midDuration
- **Level**: L4
- **Type**: number (frames)
- **Range**: 90–180
- **Typical**: 120–150
- **Effect**: Product demo, feature showcase, metrics scenes.
- **Profiles**: snappy: 90–120 | luxury: 135–150 | kinetic: 120–165 | dark: 120

### scene.ctaDuration
- **Level**: L4
- **Type**: number (frames)
- **Range**: 60–120
- **Typical**: 75–90
- **Effect**: Closing brand/URL scene. Keep short — trust was built before this.
- **Profiles**: snappy: 60–90 | luxury: 90 | kinetic: 75 | dark: 90–120

### scene.minimum
- **Level**: L4
- **Type**: number (seconds)
- **Value**: 3–5s (90–150f at 30fps)
- **Effect**: No scene shorter than 3 seconds for comprehension.

### scene.total
- **Level**: L4
- **Type**: number (frames)
- **Range**: 450–900
- **Typical**: 450–660
- **Effect**: Total ad duration. 15–22 seconds is the sweet spot.
- **Profiles**: snappy: 450–630 | luxury: 540–660 | kinetic: 450–660 | dark: 450–540

### scene.count
- **Level**: L4
- **Type**: number
- **Range**: 4–7
- **Typical**: 5–6

---

## Observed scene structures

| Composition | Total | Scenes | Scene frames |
|-------------|-------|--------|--------------|
| FormaAd2 | 630 | 6 | 90, 90, 180, 120, 90, 60 |
| LangEaseAd | 540 | 5 | 90, 135, 135, 90, 90 |
| VelourAd | 540 | 5 | 90, 150, 120, 90, 90 |
| HavenAd | 540 | 5 | 90, 150, 120, 90, 90 |
| SolaceAd | 450 | 4 | 119, 144, 139, 90 |
| PulseAd | 480 | 5 | 120, 120, 120, 60, 120 |
| VeridianAd | 450 | 3 | 119, 209, 150 |
| TrailBlazeAd | 450 | 4 | 90, 165, 120, 75 |
| SeriAd | 540 | 5+overlays | 90, 135, 135, 90, 90 |

---

## Scene template (120 BPM default)

| Scene | Bars | Duration | Frames (30fps) |
|-------|------|----------|-----------------|
| Hook | 2 | 4s | 120f |
| Problem / Setup | 2 | 4s | 120f |
| Product Reveal | 2 | 4s | 120f |
| Feature / Expansion | 2 | 4s | 120f |
| CTA | 1–2 | 2–4s | 60–120f |
| **Total** | **9–10** | **18–20s** | **540–600f** |

Trim hook or feature to hit 15–16s.

---

## Transitions

### transition.duration
- **Level**: L4
- **Type**: number (frames)
- **Range**: 6–14
- **Typical**: 8–12
- **Effect**: Scene-to-scene transition. Faster = more energetic.
- **Profiles**: snappy: 6–10 | luxury: 10–14 | kinetic: 6–8

### transition.overlap
- **Level**: L4
- **Type**: number (frames)
- **Range**: 0–20
- **Typical**: 8–16
- **Effect**: How many frames two scenes are visible simultaneously.
- **Source**: FormaAd original: S1→S2 overlap 22f, S3→S4 overlap 14f, S4→S5 overlap 16f

### transition.fadeOutDuration
- **Level**: L4
- **Type**: number (frames)
- **Range**: 8–14
- **Typical**: 10–12
- **Effect**: `usePremiumFadeOut` duration at end of each scene.
- **Source**: `usePremiumFadeOut` default 12

---

## Hold Times

### hold.heroElement
- **Level**: L4
- **Type**: number (seconds)
- **Range**: 1.5–3.0
- **Typical**: 2.0
- **Effect**: How long a key element is visible at full opacity before transitioning.

### hold.importantNumber
- **Level**: L4
- **Type**: number (seconds)
- **Value**: 4+
- **Effect**: Big metrics/stats need at least 4 seconds for cognitive processing.

### hold.cta
- **Level**: L4
- **Type**: number (seconds)
- **Range**: 2–3
- **Effect**: CTA must hold long enough for the brand name to register.

---

## Cinematography timing

### camera.riseDuration
- **Level**: L4
- **Type**: number (frames)
- **Range**: 80–100
- **Effect**: Phase 1: camera pedestal up / dolly.
- **Source**: Simulated Cinematography f0–100

### camera.pivotDuration
- **Level**: L4
- **Type**: number (frames)
- **Range**: 60–75
- **Effect**: Phase 2: orbit / rotation.
- **Source**: Simulated Cinematography f100–175

### camera.revealDuration
- **Level**: L4
- **Type**: number (frames)
- **Range**: 100–125
- **Effect**: Phase 3: dolly back / reveal.
- **Source**: Simulated Cinematography f175–300
