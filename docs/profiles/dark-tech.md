---
profile: dark-tech
bpm: 100-110
total_duration_range: [450, 540]
scene_count: [4, 5]
---

# Dark Tech

Dark backgrounds, cyan/violet/emerald accents, glow effects, ambient particles.
Motion is precise and controlled. The aesthetic channels a digital dashboard —
data-driven, modern, mysterious. Depth and light create hierarchy.

## Reference compositions

- PulseAd (pulse-v1) — Violet analytics platform
- FormaAd original (forma-v1) — Cyan design system (dark scenes)
- VeridianAd (veridian-v1) — Indigo design tool

---

## L1 Physics

| Parameter | Value | Notes |
|-----------|-------|-------|
| spring.stiffness | 88–120 | Moderate — not as snappy as SaaS |
| spring.damping | 18–22 | Controlled settle |
| spring.mass | 0.9–1.1 | Medium weight |
| spring.preset | PREMIUM_SPRING.hero | Default |
| easing.hero | easeOut4 / easeOut5 | Sharp arrival |
| easing.text | easeOut3 | Smooth text |
| easing.wipe | easeInOut3 | Progress bars, transitions |
| stagger.standard | 12–15f | Feature list |
| stagger.beat | 15f | Beat-synced (120 BPM) |

---

## L2 Visual

| Parameter | Value | Notes |
|-----------|-------|-------|
| blur.textReveal | 7–10px | useCinematicTextReveal |
| blur.heroResolve | 16px | Deep focus rack |
| blur.depthDeemphasis | 2.5px | Standard |
| scale.textEntrance | via useCinematicTextReveal | Drift + blur |
| scale.heroEntrance | 0.88 | Deeper start |
| translate.heroArc | fromX: -110, fromY: 150 | Large dramatic arc |
| translate.features | -40px | Standard slide |
| float.amplitude | 6px | Gentle float |
| float.period | 80f | Standard |
| glow.radius | 700–900px | Accent-color radial glow |
| glow.opacity | 0.05–0.13 | More visible on dark bg |
| glow.breathingPeriod | 88–90f | Slow pulse |
| glow.color | accent at 10–13% opacity | Cyan / violet tint |

---

## L3 Composition

| Parameter | Value | Notes |
|-----------|-------|-------|
| type.heroSize | 96–158px | Bold numerics |
| type.headlineSize | 72–96px | Scene headlines |
| type.bodySize | 15–22px | Supporting copy |
| type.labelSize | 11–13px | Uppercase labels |
| type.heroWeight | 900 | Maximum presence |
| type.bodyWeight | 400–500 | Regular |
| type.heroLetterSpacing | -5 to -8 | Tight |
| type.labelLetterSpacing | 0.12em–0.18em | Very wide caps |
| color.background | #080B14 (navy), #0B0F1E (dark) | Deep, rich darks |
| color.surface | #141C2E | Card surfaces |
| color.text | #F0EEFF / white | Light on dark |
| color.body | #8B82B8 / rgba(255,255,255,0.40) | Muted light |
| color.accent | #7C6BFF (violet), #06B6D4 (cyan), #E879F9 (pink) | Glowing accents |
| color.dimBorder | rgba(255,255,255,0.08) | Subtle borders |
| layout.padding | 80–90px | Standard |
| layout.borderRadius | 14–22px | Moderate rounding |
| layout.shadow | `0 0 80px rgba(accent,0.10), 0 8px 24px rgba(0,0,0,0.35)` | Glow halo |

---

## L4 Temporal

| Parameter | Value | Notes |
|-----------|-------|-------|
| tempo.bpm | 100–110 | Moderate pace |
| scene.hook | 120f (4s) | Build atmosphere |
| scene.mid | 120f (4s) | Even scene distribution |
| scene.cta | 90–120f (3–4s) | Confident close |
| scene.total | 450–540f (15–18s) | Tight duration |
| scene.count | 4–5 | |
| transition.type | fade-overlap, typography-flood | Dark blends |
| transition.overlap | 12–16f | Smooth blends |
| transition.fadeOut | 10–12f | Standard |

---

## L5 Technique

| Technique | Recipe |
|-----------|--------|
| Text reveal | blur-scale-reveal (cinematic) |
| Hook | cinematic-drift + arc-entry |
| Hero entrance | arc-entry + blur-resolve |
| Features | staggered-list |
| Transition | fade-overlap, typography-flood |
| Camera | camera-wrapper (drift) |
| Layout | centered, row-stack |
| Idle | hero-float, breathing-glow |
| Hierarchy | depth-deemphasis |
