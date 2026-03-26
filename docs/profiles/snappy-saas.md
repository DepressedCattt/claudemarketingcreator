---
profile: snappy-saas
bpm: 120
total_duration_range: [450, 660]
scene_count: [5, 7]
---

# Snappy SaaS

Apple-clean, critically damped, fast cuts, off-white background, blue gradient accents.
The motion is digital, precise, and weightless — zero bounce, zero overshoot.
Every element snaps to position as if magnetically guided.

## Reference compositions

- FormaAd2 (forma2-v1) — LangEase recreation
- LangEaseAd (langease-v1) — LangEase SaaS ad
- H.1 reference analysis (LEARNINGS.md line 3389)

---

## L1 Physics

| Parameter | Value | Notes |
|-----------|-------|-------|
| spring.stiffness | 180–220 | Critically damped — high stiffness |
| spring.damping | 22–28 | Zero bounce — high damping |
| spring.mass | 0.7–0.9 | Light, digital feel |
| easing.hero | easeOut4 | Sharp deceleration |
| easing.text | easeOut3 | Smooth settle |
| easing.wipe | easeInOut3 | Symmetric transitions |
| stagger.tight | 3–5f | Word-by-word reveals |
| stagger.standard | 10–14f | List items, feature rows |
| stagger.beat | 22–30f | Hook concept beats (1 beat at 120 BPM) |

---

## L2 Visual

| Parameter | Value | Notes |
|-----------|-------|-------|
| blur.textReveal | 10px | Spring-driven blur-in |
| blur.heroResolve | 10–12px | Cards, UI elements |
| blur.glass | 12px | Glassmorphic backdrop |
| scale.textEntrance | 0.95 | Subtle scale-up |
| scale.heroEntrance | 0.92–0.94 | Cards scale in |
| scale.button | 0.90 | CTA button pop |
| translate.textDrift | 0px | No drift — blur+scale only |
| translate.heroArc | none | No arc — spring from below or spring-in |
| translate.cardFrom | ±120–160px | Cards fly from off-screen |
| float.amplitude | none | No float — static after entrance |
| glow.radius | 700–900px | Soft blue radial bg glow |
| glow.opacity | 0.04–0.055 | Barely visible |

---

## L3 Composition

| Parameter | Value | Notes |
|-----------|-------|-------|
| type.heroSize | 96–128px | Dominant word |
| type.headlineSize | 64–96px | Scene headlines |
| type.bodySize | 18–22px | Supporting copy |
| type.labelSize | 11–13px | Eyebrows, badges |
| type.heroWeight | 700 | Bold, NOT Black (key finding) |
| type.bodyWeight | 400–500 | Regular |
| type.labelWeight | 700 | Always bold |
| type.heroLetterSpacing | -3 to -6 | Tight tracking |
| type.labelLetterSpacing | 0.06em–0.12em | Wide uppercase |
| color.background | #FDFDFE | Off-white |
| color.text | #1E1E1E | Near-black |
| color.body | #6B7280 | Muted gray |
| color.accent | #2076FF / #629DFF | Blue gradient |
| color.gradient | `linear-gradient(90deg, #629DFF, #2076FF)` | Key words |
| color.success | #10B981 | Checkmarks, completion |
| layout.padding | 80px | Horizontal content padding |
| layout.borderRadius | 16–26px | Card corners |

---

## L4 Temporal

| Parameter | Value | Notes |
|-----------|-------|-------|
| tempo.bpm | 120–128 | Fast, precise rhythm |
| scene.hook | 90f (3s) | Rapid-fire concepts |
| scene.mid | 90–180f (3–6s) | Tunnel, demo, features |
| scene.cta | 60–90f (2–3s) | Short close |
| scene.total | 450–660f (15–22s) | Full ad |
| scene.count | 5–7 | |
| transition.type | hard-cut | Sequence boundaries |
| transition.fadeOut | 8–10f | usePremiumFadeOut |

---

## L5 Technique

| Technique | Recipe |
|-----------|--------|
| Text reveal | blur-scale-reveal (spring) |
| Hook | rapid-fire-hook (hard cuts) |
| Hero entrance | spring from off-screen |
| Tagline | word-by-word-tagline |
| Demo | progress-bar-demo |
| Tunnel | 3d-phone-tunnel |
| Cards | glassmorphic-card |
| Transition | hard-cut |
| Camera | none (static) |
| Layout | centered |
