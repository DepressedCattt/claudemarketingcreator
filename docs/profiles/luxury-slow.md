---
profile: luxury-slow
bpm: 90-100
total_duration_range: [450, 660]
scene_count: [4, 5]
---

# Luxury Slow

Warm tones, organic motion, longer holds, premium spacing. The motion has weight
and intention — elements arrive on curved arcs and settle with gentle float.
Every frame breathes. Nothing rushes.

## Reference compositions

- VelourAd (velour-v1) — Gold/dark luxury salon
- HavenAd (haven-v1) — Warm terracotta wellness
- SolaceAd (solace-v1) — Amber therapy platform
- SeriAd (seri-v1) — Mauve/champagne salon

---

## L1 Physics

| Parameter | Value | Notes |
|-----------|-------|-------|
| spring.stiffness | 60–90 | Organic — low stiffness |
| spring.damping | 22–30 | Controlled — no bounce |
| spring.mass | 1.0–1.2 | Heavier — more inertia |
| spring.preset | PREMIUM_SPRING.hero | Default for arc entries |
| easing.hero | easeOut4 / easeOut5 | Sharp deceleration on arrival |
| easing.text | easeOut3 | Smooth settle |
| easing.wipe | easeInOut3 | Accent lines, state shifts |
| stagger.standard | 14–18f | Deliberate cascade |
| stagger.tight | 10–14f | Feature rows |
| stagger.cta | 12–16f | CTA element reveals |

---

## L2 Visual

| Parameter | Value | Notes |
|-----------|-------|-------|
| blur.textReveal | 7–8px | Via useCinematicTextReveal |
| blur.heroResolve | 16–18px | Deep rack-focus on hero |
| blur.depthDeemphasis | 2.5px | Background hierarchy |
| scale.textEntrance | 0.92 | Deeper scale via useSoftScaleIn |
| scale.heroEntrance | 0.88–0.92 | More dramatic entrance |
| translate.textDrift | 16–18px | Cinematic vertical drift |
| translate.heroArc | fromX: -100 to -110, fromY: 130–140 | Curved spring path |
| translate.features | -38 to -52px | Feature row slide |
| float.amplitude | 6px | Gentle vertical idle |
| float.period | 80–90f | Slow breathing cycle |
| glow.radius | 700–900px | Warm ambient glow |
| glow.opacity | 0.04–0.06 | Subtle presence |
| glow.breathingPeriod | 90f | Slow pulsing |

---

## L3 Composition

| Parameter | Value | Notes |
|-----------|-------|-------|
| type.heroSize | 108–164px | Generous sizing |
| type.headlineSize | 64–88px | Scene headlines |
| type.bodySize | 18–22px | Supporting copy |
| type.labelSize | 10–12px | Eyebrows, badges |
| type.heroWeight | 900 | Maximum impact |
| type.bodyWeight | 300–400 | Thin, elegant |
| type.labelWeight | 700 | Always bold |
| type.heroLetterSpacing | -4 to -9 | Very tight |
| type.labelLetterSpacing | 0.10em–0.22em | Wide uppercase |
| color.background | Dark: #0A0A0A / Warm: #FAF7F3 | Depends on brand |
| color.text | On dark: #F5F0E8 / On warm: #2A1F1A | High contrast |
| color.body | Muted warm gray | Context-dependent |
| color.accent | Gold: #C9A84C / Terra: #BC7558 / Amber: #B45309 | Warm metallics |
| layout.padding | 80–90px | Generous margins |
| layout.borderRadius | 22–32px | Rounded premium feel |

---

## L4 Temporal

| Parameter | Value | Notes |
|-----------|-------|-------|
| tempo.bpm | 90–100 | Slower rhythm, longer beats |
| scene.hook | 90f (3s) | Sets the mood |
| scene.mid | 120–150f (4–5s) | Longer product showcase |
| scene.cta | 90f (3s) | Confident close |
| scene.total | 450–660f (15–22s) | Full ad |
| scene.count | 4–5 | Fewer, longer scenes |
| transition.type | fade-overlap | Smooth crossfades |
| transition.overlap | 10–14f | Scenes blend |
| transition.fadeOut | 10–12f | usePremiumFadeOut |

---

## L5 Technique

| Technique | Recipe |
|-----------|--------|
| Text reveal | blur-scale-reveal (easing / cinematic) |
| Hook | cinematic-drift reveal |
| Hero entrance | arc-entry + blur-resolve + soft-scale |
| Tagline | word-by-word-tagline (wider stagger) |
| Features | staggered-list |
| Cards | glassmorphic-card (warm variant) |
| Transition | fade-overlap, clip-path |
| Camera | camera-wrapper (drift) |
| Layout | centered or asymmetric |
| Idle | hero-float after entrance |
