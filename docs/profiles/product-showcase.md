---
profile: product-showcase
bpm: 110-120
total_duration_range: [480, 900]
scene_count: [5, 7]
---

# Product Showcase

UI cards, dashboards, cursor demos, progress animations, phone reveals.
Motion serves comprehension — elements enter to demonstrate a feature,
not just to look good. The camera and layout guide the viewer through
a product workflow.

## Reference compositions

- SharedSalonPhoneAd — phone reveal with app demo
- SharedSalonBookingAd — booking flow demonstration
- FormaAd2 Scene 4 — progress bar + media card grid
- FormaAd original Scene 2 — UI preview card with sidebar

---

## L1 Physics

| Parameter | Value | Notes |
|-----------|-------|-------|
| spring.stiffness | 100–150 | Moderate — not too fast for comprehension |
| spring.damping | 14–22 | Some settle, not too sharp |
| spring.mass | 0.8–1.0 | Standard weight |
| spring.preset | PREMIUM_SPRING.ui | UI elements |
| easing.hero | easeOut3 | Smooth arrivals |
| easing.text | easeOut3 | Standard |
| easing.wipe | easeInOut3 | Progress bars, transitions |
| stagger.standard | 10–15f | Card grids, list items |
| stagger.tight | 6–10f | Rapid card cascade |

---

## L2 Visual

| Parameter | Value | Notes |
|-----------|-------|-------|
| blur.textReveal | 7px | useCinematicTextReveal default |
| blur.heroResolve | 14px | Standard |
| blur.cardEntrance | 5–8px | Cards blur-in |
| scale.cardEntrance | 0.92–0.94 | Cards scale up |
| translate.cardFrom | ±120–160px | Diagonal/cardinal directions |
| translate.phoneReveal | clipTop 70%→0%, scrollY 380→0 | Phone pedestal |

---

## L3 Composition

| Parameter | Value | Notes |
|-----------|-------|-------|
| type.heroSize | 72–112px | Moderate — UI is the star |
| type.headlineSize | 46–64px | Context labels |
| type.bodySize | 14–20px | UI text, descriptions |
| type.labelSize | 10–13px | Metadata, badges |
| type.heroWeight | 700–900 | Variable |
| type.uiTextSize | 11–14px | Inside mock UI cards |
| type.uiTextFont | monospace | Code/path breadcrumbs |
| color.background | #FDFDFE or brand-appropriate | Clean backdrop |
| color.cardSurface | white or brand surface | UI card fill |
| color.cardBorder | rgba(accent, 0.12) | Subtle |
| layout.cardWidth | 300–540px | UI cards |
| layout.gridColumns | 2 | 2x2 card grid |
| layout.gridGap | 14–16px | Card grid spacing |
| layout.borderRadius | 10–22px | Functional rounding |

---

## L4 Temporal

| Parameter | Value | Notes |
|-----------|-------|-------|
| tempo.bpm | 110–120 | Standard pace |
| scene.hook | 90f (3s) | Quick context |
| scene.demo | 120–180f (4–6s) | Product walkthrough |
| scene.features | 120f (4s) | Feature highlights |
| scene.cta | 90–105f (3–3.5s) | Close with brand |
| scene.total | 480–900f (16–30s) | Can be longer for demos |
| scene.count | 5–7 | More scenes for walkthroughs |
| transition.type | element-driven, fade-overlap | UI continuity |
| transition.fadeOut | 10–12f | Standard |

---

## L5 Technique

| Technique | Recipe |
|-----------|--------|
| Text reveal | blur-scale-reveal or cinematic-drift |
| Hero entrance | soft-scale or slide-up |
| Product demo | progress-bar-demo |
| Cards | glassmorphic-card, staggered-list |
| Phone reveal | pedestal camera + clipTop |
| Transition | element-driven (card → dashboard) |
| Camera | pedestal, dolly, or none |
| Layout | centered, split, grid |
| Interactive | animated cursor, button press |

---

## Interactive element patterns

### Animated cursor

```tsx
const cursorX = interpolate(frame, [startF, endF], [fromX, toX]);
const cursorY = interpolate(frame, [startF, endF], [fromY, toY]);
// Pointer SVG or div follows the path, clicks at endF
```

### Button press

```tsx
const press = spring({ frame: Math.max(0, frame - clickFrame), fps, config: SNAP });
// Scale 1.0 → 0.95 → 1.0, color change on press
```

### Phone pedestal reveal

```tsx
const clipTop = interpolate(frame, [0, 80], [70, 0], { extrapolateRight: "clamp" });
const scrollY = interpolate(frame, [0, 80], [380, 0], { extrapolateRight: "clamp" });
const camScale = interpolate(frame, [0, 80], [1.10, 1.0], { extrapolateRight: "clamp" });
```
