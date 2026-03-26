# L2 — Visual Parameters

Blur, scale, translate, opacity, and rotation values.
These control the entrance/exit appearance of individual elements.

---

## Blur

### blur.textReveal
- **Level**: L2
- **Type**: number (px)
- **Range**: 6–10
- **Typical**: 7–8
- **Effect**: Starting blur for text entrances. Higher = more dramatic "rack focus" feel.
- **Profiles**: snappy: 10 | luxury: 8 | kinetic: 6
- **Source**: `useCinematicTextReveal` blurMax default 7, documented range 6–10

### blur.heroResolve
- **Level**: L2
- **Type**: number (px)
- **Range**: 12–28
- **Typical**: 14–18
- **Effect**: Starting blur for hero elements (cards, images). Higher = more cinematic.
- **Profiles**: snappy: 10–12 | luxury: 16–18 | kinetic: 14 | dark: 16
- **Source**: `useBlurResolve` maxBlur default 14, documented range 12–18

### blur.depthDeemphasis
- **Level**: L2
- **Type**: number (px)
- **Range**: 0–2.5
- **Typical**: 2.5
- **Effect**: Background blur when de-emphasizing for hierarchy. Always 2.5px target.
- **Source**: `depthDeemphasis()` hardcoded 0→2.5px

### Observed blur values

| Composition | Element | Blur (px) |
|-------------|---------|-----------|
| FormaAd2 | Text reveal | 10→0 |
| FormaAd2 | Card blur | 5→0 |
| FormaAd2 | Glass window | 12 (backdrop) |
| LangEaseAd | useSnapReveal | 8→0 |
| LangEaseAd | Tagline words | 10→0 |
| VelourAd | useBlurResolve | 16→0 (28f) |
| SolaceAd | Hero | 16→0 |
| SolaceAd | Burst | 28 |
| SolaceAd | Clones | 24→0 |
| PulseAd | useBlurResolve | 16→0 |
| VeridianAd | Hero | 16→0 |
| VeridianAd | Clones | 26→0 |

---

## Scale

### scale.textEntrance
- **Level**: L2
- **Type**: number (ratio)
- **Range**: 0.92–0.97
- **Typical**: 0.95
- **Effect**: Starting scale for text blur-in reveals. Closer to 1.0 = more subtle.
- **Profiles**: snappy: 0.95 | luxury: 0.92 | kinetic: 0.97
- **Source**: FormaAd2 useSnapReveal, LangEaseAd useSnapReveal

### scale.heroEntrance
- **Level**: L2
- **Type**: number (ratio)
- **Range**: 0.85–0.92
- **Typical**: 0.88–0.92
- **Effect**: Starting scale for hero element (card, image). Lower = more dramatic entrance.
- **Profiles**: snappy: 0.92 | luxury: 0.90 | dark: 0.88
- **Source**: `useSoftScaleIn` default 0.92, documented range 0.88–0.96

### scale.buttonEntrance
- **Level**: L2
- **Type**: number (ratio)
- **Range**: 0.88–0.92
- **Typical**: 0.90
- **Effect**: CTA button scale-in start.
- **Source**: LangEaseAd CTA button 0.9→1.0

### scale.depthDeemphasis
- **Level**: L2
- **Type**: number (ratio)
- **Value**: 0.97
- **Effect**: Background elements scale down slightly when de-emphasised.
- **Source**: `depthDeemphasis()` hardcoded 1.0→0.97

### Observed scale values

| Composition | Element | From→To |
|-------------|---------|---------|
| FormaAd2 | Text | 0.95→1.0 |
| FormaAd2 | Cards | 0.94→1.0 |
| FormaAd2 | Checkmark | 0.92→1.0 |
| LangEaseAd | useSnapReveal | 0.93→1.0 |
| LangEaseAd | Card | 0.92→1.0 |
| LangEaseAd | CTA button | 0.9→1.0 |
| VelourAd | useSoftScaleIn | 0.90→1.0 |
| SolaceAd | Hero | 0.90→1.0 |
| PulseAd | useSoftScaleIn | 0.88→1.0 |
| VeridianAd | Logo | 0.86→1.0 |

---

## Translate

### translate.textDrift
- **Level**: L2
- **Type**: number (px)
- **Range**: 12–20
- **Typical**: 16–18
- **Effect**: Vertical drift distance for text reveals. Keep ≤20 for text.
- **Source**: `useCinematicTextReveal` driftPx default 16

### translate.heroArc
- **Level**: L2
- **Type**: { fromX: number, fromY: number } (px)
- **Range**: fromX -90 to -130, fromY 120–180
- **Typical**: fromX -110, fromY 130
- **Effect**: Curved entry path origin for hero elements.
- **Source**: `useArcEntry` — VelourAd (-100, 140), SolaceAd (-110, 130), PulseAd (-110, 150)

### translate.slideUp
- **Level**: L2
- **Type**: number (px)
- **Range**: 18–80
- **Typical**: 30–40
- **Effect**: Vertical slide distance for general entrances.
- **Source**: `useSlideUp` default 40, `useTextEntrance` default 30

### translate.slideHorizontal
- **Level**: L2
- **Type**: number (px)
- **Range**: 38–160
- **Typical**: 52–80
- **Effect**: Horizontal slide distance for feature/card entrances.
- **Source**: FormaAd2 cards ±160, LangEaseAd features -64, SolaceAd stats 18

---

## Opacity

### opacity.depthDeemphasis
- **Level**: L2
- **Type**: number (ratio)
- **Value**: 0.38
- **Effect**: Minimum opacity for de-emphasised background elements. Floor ≥ 0.35.
- **Source**: `depthDeemphasis()` hardcoded 1.0→0.38

### opacity.fadeInDuration
- **Level**: L2
- **Type**: number (frames)
- **Range**: 10–20
- **Typical**: 12–15
- **Effect**: How many frames for opacity 0→1 transitions.
- **Source**: `useFadeIn` default 15, `usePremiumFadeOut` default 12

---

## Float (ambient idle)

### float.amplitude
- **Level**: L2
- **Type**: number (px)
- **Range**: 4–8
- **Typical**: 6
- **Effect**: Vertical oscillation for idle hero elements. Keep ≤8 to avoid seasickness.
- **Source**: `useHeroFloat` default 6, documented ≤8

### float.periodFrames
- **Level**: L2
- **Type**: number (frames)
- **Range**: 70–120
- **Typical**: 80–90
- **Effect**: One full float cycle. Keep ≥70 (≥2.3s @ 30fps).
- **Source**: `useHeroFloat` default 80, documented ≥70

---

## Glow (breathing)

### glow.periodFrames
- **Level**: L2
- **Type**: number (frames)
- **Range**: 60–120
- **Typical**: 90
- **Effect**: Breathing cycle period. Faster than 60 reads as anxiety.
- **Source**: `useBreathingGlow` default 90, documented ≥60

### glow.range
- **Level**: L2
- **Type**: [min, max]
- **Value**: [0.55, 1.0]
- **Effect**: Opacity multiplier range for ambient glow pulses.
- **Source**: `useBreathingGlow` defaults 0.55–1.0
