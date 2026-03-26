---
profile: kinetic-typography
bpm: 110-120
total_duration_range: [450, 660]
scene_count: [4, 6]
---

# Kinetic Typography

Text-dominant motion. Word slams, high contrast, rapid stagger, big bold type
that demands attention. The screen is a stage for words. Elements
enter with force and intention.

## Reference compositions

- SharedSalonPainAd — aggressive word slams
- TrailBlazeAd — outdoor/adventure kinetic text
- KineticTypographyAd — pure text motion

---

## L1 Physics

| Parameter | Value | Notes |
|-----------|-------|-------|
| spring.stiffness | 120–160 | Fast but with some follow-through |
| spring.damping | 9–15 | Allows bounce/overshoot |
| spring.mass | 0.6–0.8 | Light, responsive |
| spring.preset | SPRING.bouncy or SPRING.crisp | Word slams |
| easing.hero | easeOut4 | Sharp stop |
| easing.text | easeOut3 / easeOut4 | Quick settle |
| stagger.tight | 6–10f | Rapid cascade |
| stagger.standard | 12–15f | Feature items |
| stagger.slam | per-word spring | Individual word timing |

---

## L2 Visual

| Parameter | Value | Notes |
|-----------|-------|-------|
| blur.textReveal | 6px | Minimal — text is the hero |
| blur.heroResolve | 14px | Standard |
| scale.textEntrance | 0.97 | Very subtle scale (text clarity) |
| scale.wordSlam | 1.45→1.0 | Dramatic overshoot slam |
| translate.wordSlam | -24→0px | Vertical impact |
| translate.slideHorizontal | -80 to -120px | Large horizontal movement |
| translate.textDrift | 28→0px | Via useWordDrift |
| float.amplitude | none | No float — static tension |

---

## L3 Composition

| Parameter | Value | Notes |
|-----------|-------|-------|
| type.heroSize | 110–210px | MASSIVE type dominates |
| type.headlineSize | 64–140px | Still large |
| type.bodySize | 22–30px | Readable supporting text |
| type.labelSize | 12–14px | Eyebrows |
| type.heroWeight | 900 | Maximum black weight |
| type.bodyWeight | 500–700 | Medium to bold |
| type.heroLetterSpacing | -4 to -10 | Very tight tracking |
| type.labelLetterSpacing | 0.06em–0.12em | Wide caps |
| color.background | High contrast (dark: #080F0A, light: varies) | Maximum contrast |
| color.text | Inverse of bg | White on dark or black on light |
| color.accent | Bold: #FF6B35, #3DBA6F, brand colors | Saturated |
| layout.padding | 60–80px | Slightly tighter |

---

## L4 Temporal

| Parameter | Value | Notes |
|-----------|-------|-------|
| tempo.bpm | 110–120 | Fast but not frantic |
| scene.hook | 90–120f (3–4s) | Immediate impact |
| scene.mid | 120–165f (4–5.5s) | Stats, metrics, kinetic showcase |
| scene.cta | 75f (2.5s) | Quick close |
| scene.total | 450–660f (15–22s) | |
| scene.count | 4–6 | |
| transition.type | hard-cut, headline-scatter | Energetic |
| transition.fadeOut | 8–10f | Quick fade |

---

## L5 Technique

| Technique | Recipe |
|-----------|--------|
| Text reveal | word-slam or blur-scale-reveal (minimal blur) |
| Hook | rapid-fire-hook or headline-scatter |
| Hero entrance | slide-up or spring-pop |
| Tagline | word-by-word-tagline (tight stagger 6–8f) |
| Features | staggered-list (fast, from left) |
| Transition | hard-cut, headline-scatter |
| Camera | none (static) |
| Layout | centered or fullbleed |
