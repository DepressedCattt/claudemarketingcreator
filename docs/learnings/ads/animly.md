# AnimlyAd / SmallSpotAd — Blob Morphing + CTA Brand Ad

**Composition:** `animly-v1` / `smallspot-v1`
**Format:** 16:9 4K (3840×2160), ~23s (706 frames @ 30fps)
**Category:** saas
**Profile:** dark-tech
**Scenes:** S1 Hook (CRT screen) → S2 Problem (card vortex) → S3 Reveal (blob morph + CTA)

---

## Process: AI-Generated Background Plate Workflow

AnimlyAd S1 pioneered a workflow where an AI-generated PNG (`s1-crt-background.png`) serves as a static photographic background plate, with all animation layered on top:

1. **Generate the image** — Use image generation to create a photorealistic scene (in this case, a CRT monitor on a desk with dramatic lighting). The image is purely static — no animation needed from the AI.
2. **Place as full-bleed background** — `<img src={staticFile("images/...")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />`
3. **Map interactive regions** — Identify pixel coordinates of areas where animation will overlay (e.g., the screen surface). Use a `clipPath: polygon(...)` to precisely mask the overlay to the target region, including any barrel distortion or rounded corners.
4. **Animate on top** — All Remotion animation happens in a positioned `<div>` clipped to the mapped region. The static image provides photorealistic context that would be extremely difficult to build in code.
5. **Camera motion on the whole thing** — Apply zoom, pan, shake to a parent wrapper (`transform: scale() translate() rotate()`) with `transformOrigin` pointed at the focal area (e.g., screen center). The static image moves with the animation layer seamlessly.

**Key measurements from AnimlyAd:**
- Screen bounding box: `left: 1329, top: 497, width: 1182, height: 929` (from flood-fill contour trace of the generated image)
- CRT barrel distortion: 62-vertex polygon `clipPath` capturing the curved screen edges
- Zoom range: 1.0 → 5.45 (ambient 1.45 + rush zoom 4.0)
- `transformOrigin` set to screen center for natural zoom-into-screen effect

**When to use this workflow:**
- Hook scenes that need photorealistic environments (offices, devices, rooms)
- Any scene where a physical object (monitor, phone, billboard) displays animated content
- When code-only backgrounds would look flat or take excessive development time

**Limitations:**
- The image is static — no parallax between foreground/background objects
- Screen region mapping requires manual pixel measurement per image
- Image resolution must match or exceed the composition resolution (4K = 3840x2160)

---

## What Worked (Keep Doing)

### 1. Arc-Length Parameterized Catmull-Rom Splines (S3 blobs)
True constant-speed motion along complex paths. Built a LUT by sampling the spline at high resolution, then used binary search to map uniform distance → spline parameter `t`. Eliminated all perceived starts/stops.
**Recipe:** `docs/recipes/motion/arc-length-spline.md`

### 2. Velocity-Continuous Phase Handoffs (S3 burst → wander → convergence)
Captured ending velocity vector from each phase, projected it forward as an "inertia path," and blended into the next trajectory using quadratic blend (`ct * ct`). Zero pauses between phases.
**Rule:** `animation-fluidity.mdc` Training Rule T2

### 3. Gaussian Bell Curves for Letter Color Wash (S3 CTA)
`Math.exp(-dist * dist * N)` creates smooth organic brightness curves. Far superior to linear triangle waves which looked mechanical. Two-layer text-shadow (tight + diffuse) for cinematic bloom.
**Rule:** `animation-fluidity.mdc` Training Rule T3

### 4. SVG Goo Filter Blob Morphing (S3)
`feGaussianBlur` + `feColorMatrix` threshold creates liquid metaball effect. Blobs merge visually when close, creating organic transitions. Filter applied during motion phases, removed at solidify for crisp text.

### 5. Layered Impact Effects (S2 explosion)
Single shockwave rings look amateur. The shipped version uses: decaying screen shake (`Math.exp(-t * 0.25) * amplitude`), radial white flash, 8 staggered ShockwaveRings, 18 particle debris circles, conic-gradient color wash ring.
**Rule:** `animation-fluidity.mdc` Training Rule T5

### 6. Animated Nebula Backgrounds (S3)
Three drifting radial gradients (accent/cyan/rose) on sine/cosine paths with gentle opacity pulsing. Heavy blur (80-120px) keeps them atmospheric. Eliminates flat static backgrounds.

### 7. Natural Camera Shake (S1 hook)
Multiple sine frequencies (not just one) with 2-4px translation, 0.09-0.16deg rotation. Ramped in gradually, never started at full intensity.
**Rule:** `animation-fluidity.mdc` Training Rule T4

### 8. Instant SVG-to-HTML Swap (S3 brand text)
When replacing SVG text with HTML for per-character styling, the swap is instantaneous (same frame, zero overlap). HTML positioned with `display: flex; alignItems: center; justifyContent: center` to match SVG's `dominantBaseline="central"`.
**Rule:** `text-spacing.mdc` — SVG-to-HTML Element Swaps

### 9. Composition Duplication Workflow (SmallSpotAd)
Duplicated AnimlyAd for different brand. Key structural changes: blob count scaled to letter count (6 → 9), blob paths expanded, text targets recalculated, all text references updated.

---

## What Didn't Work (Mistakes & Fixes)

### 1. Triangle Wave for Letter Sweep — REPLACED WITH GAUSSIAN
Linear ramp up/down (`washP < 0.5 ? washP * 2 : 2 - washP * 2`) looked mechanical and choppy. Replaced with `Math.exp(-dist * dist * 2.5)` for smooth bell curve.

### 2. Lissajous Curves for "Constant" Motion — REPLACED
Independent sin/cos on X/Y produced figure-8 patterns with perceived speed variation at inflection points. User reported "starting and stopping."

### 3. Uniform Catmull-Rom Parameterization — REPLACED WITH ARC-LENGTH
Even with Catmull-Rom splines, uniform `t` parameterization caused speed variation because spline segments had different arc lengths. Arc-length LUT + binary search fixed this.

### 4. Cross-Fading Between Misaligned Duplicates — FIXED
SVG "Animly" text and HTML letter-wash "Animly" had different coordinates. During 8-frame cross-fade, both were visible simultaneously. Fixed by making swap instantaneous (zero overlap frames).

### 5. Camera Shake Too Strong on First Attempt — TUNED
Initial values (4px, 0.15deg) were too exaggerated. Needed 2 rounds of tuning. Lesson: start subtle (2px, 0.09deg) and increase from there.

### 6. Variable Declaration Order Crash — FIXED
Camera shake variables referenced `rushP` before it was declared, causing `ReferenceError`. Moved shake block after the zoom/rush block.

### 7. Static Flat Backgrounds — REPLACED
Plain `background: C.bg` looked amateur in S3. Replaced with animated drifting gradient nebula.

### 8. Radial Speed Lines — REMOVED
User rejected them as looking "shitty." Replaced with colorful convergence glow using blob colors (radial + conic gradients expanding from origin).

---

## Spring Config Reference (AnimlyAd)

| Element | stiffness | damping | mass | Notes |
|---------|-----------|---------|------|-------|
| Text entrance (SPR.text) | 200 | 24 | 0.8 | Standard text spring |
| Hero element (SPR.hero) | 160 | 18 | 0.9 | Card entrances |
| UI component (SPR.ui) | 140 | 20 | 0.85 | Dashboard elements |
| Bounce (SPR.bounce) | 120 | 10 | 0.7 | Playful elements |
| Heavy (SPR.heavy) | 50 | 16 | 1.3 | Large reveals |
| Snap (SPR.snap) | 280 | 22 | 0.5 | Quick reactions |
| CTA tilt | 80 | 12 | 0.8 | Subtle 3D perspective |
| Tagline unfurl | 100 | 14 | 0.7 | Per-word stagger |

---

## Timing & Pacing

| Phase | Frames | Duration | Notes |
|-------|--------|----------|-------|
| S1 Hook | 156f | 5.2s | CRT screen, camera shake, typography flood exit |
| S2 Problem | 258f | 8.6s | Card entrances → melt → vortex → explosion |
| S3 Reveal | 330f | 11.0s | Blob burst → wander → converge → morph → CTA |
| S3 Fly phase | 120f | 4.0s | Blobs on arc-length splines |
| S3 Converge | 30f | 1.0s | Velocity-continuous spiral to center |
| S3 Morph | 25f | 0.83s | Goo filter text formation |
| S3 CTA hold | ~80f | 2.7s | Letter wash + tagline + accent line + dots |

---

## Reusable Patterns

1. **Arc-length parameterized spline motion** — for any element needing constant speed along a complex path
2. **Velocity-continuous phase blending** — quadratic blend (`ct * ct`) from inertia path to new trajectory
3. **Gaussian sweep effect** — `Math.exp(-dist * dist * N)` for any L→R or sequential glow/color effect
4. **Multi-layer impact composition** — screen shake + flash + rings + particles + color wash
5. **Animated nebula background** — 3 drifting radial gradients with sine/cosine paths and pulsing opacity
6. **SVG goo filter morph** — `feGaussianBlur` + `feColorMatrix` for liquid metaball merging
7. **Instant element swap** — same-frame opacity toggle when replacing SVG with HTML rendering
8. **Composition duplication** — scale blob count/paths/targets to match new brand name length
