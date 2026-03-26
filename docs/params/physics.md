# L1 — Physics Parameters

Spring configs, easing curve selection, and stagger timing.
These control the fundamental *feel* of motion — snappy vs organic, bouncy vs damped.

---

## Spring Configs

### spring.stiffness
- **Level**: L1
- **Type**: number
- **Range**: 60–220
- **Typical**: 90–150
- **Effect**: Higher = faster snap to target, more digital/precise. Lower = slower, more organic.
- **Profiles**: snappy: 180–220 | luxury: 60–90 | kinetic: 120–160 | dark: 90–120
- **Source**: premiumMotion.ts `PREMIUM_SPRING`, FormaAd2 `SNAP`

### spring.damping
- **Level**: L1
- **Type**: number
- **Range**: 9–30
- **Typical**: 18–25
- **Effect**: Higher = less oscillation, more controlled. Lower = more bounce/overshoot. Minimum 18 for premium feel.
- **Profiles**: snappy: 22–28 | luxury: 22–30 | kinetic: 9–15 | dark: 18–22
- **Source**: premiumMotion.ts `PREMIUM_SPRING` (min damping 18 for hero)

### spring.mass
- **Level**: L1
- **Type**: number
- **Range**: 0.55–1.2
- **Typical**: 0.7–1.0
- **Effect**: Higher = heavier, more inertia, slower start. Lower = lighter, snappier response.
- **Profiles**: snappy: 0.7–0.9 | luxury: 1.0–1.2 | kinetic: 0.6–0.8 | dark: 0.8–1.0
- **Source**: premiumMotion.ts `PREMIUM_SPRING`, animation.ts `SPRING`

---

## Spring Presets (premiumMotion.ts)

| Preset | stiffness | damping | mass | Use case |
|--------|-----------|---------|------|----------|
| `hero` | 90 | 22 | 1.1 | Main focal elements, arc entries |
| `text` | 120 | 28 | 0.7 | Text entrances, cinematic reveals |
| `ui` | 110 | 20 | 0.9 | UI elements, cards, buttons |
| `bg` | 60 | 30 | 1.2 | Background shifts, ambient motion |
| `settle` | 88 | 18 | 1.05 | Post-entrance settle, clone cards |

## Spring Presets (animation.ts)

| Preset | stiffness | damping | mass | Use case |
|--------|-----------|---------|------|----------|
| `gentle` | 80 | 18 | 1.0 | Soft, organic motion |
| `snappy` | 100 | 14 | 0.8 | Quick UI motion |
| `crisp` | 160 | 20 | 0.6 | Word slam settle |
| `bouncy` | 120 | 10 | 0.9 | Impact, word slams (high overshoot) |

## Ad-specific Spring Configs

| Composition | stiffness | damping | mass | Feel |
|-------------|-----------|---------|------|------|
| FormaAd2 (SNAP) | 200 | 25 | 0.8 | Critically damped, zero bounce |
| LangEaseAd (SNAPPY) | 200 | 25 | 0.8 | Same as FormaAd2 |
| SharedSalonPainAd | 160–200 | 9–11 | 0.75–0.8 | Slam-style, aggressive |
| SharedSalonPremium | 100–150 | 10–18 | 0.55–1.0 | Mixed per scene |
| SharedSalonEmptyChairAd | 110 | 12 | 0.9 | Moderate bounce |
| AnimlyAd SPR.text | 200 | 24 | 0.8 | Standard text entrance |
| AnimlyAd SPR.hero | 160 | 18 | 0.9 | Card entrances |
| AnimlyAd SPR.ui | 140 | 20 | 0.85 | Dashboard elements |
| AnimlyAd SPR.bounce | 120 | 10 | 0.7 | Playful elements |
| AnimlyAd SPR.heavy | 50 | 16 | 1.3 | Large reveals |
| AnimlyAd SPR.snap | 280 | 22 | 0.5 | Quick reactions |
| AnimlyAd CTA tilt | 80 | 12 | 0.8 | Subtle 3D perspective |
| AnimlyAd tagline unfurl | 100 | 14 | 0.7 | Per-word stagger |

---

## Easing Curves

### easing.type
- **Level**: L1
- **Type**: enum
- **Options**: easeOut3, easeOut4, easeOut5, easeInOut2, easeInOut3
- **Effect**: Higher power = sharper deceleration (easeOut5 stops harder than easeOut3)

| Easing | Power | Use case |
|--------|-------|----------|
| `easeOut3` (cubic) | 3 | Smooth settles, text entrances, opacity fades |
| `easeOut4` (quartic) | 4 | Hero arrivals, blur resolve, larger motion |
| `easeOut5` (quintic) | 5 | Hero impact, arc Y-axis, scale snap, "easeSnap" |
| `easeInOut2` (quad) | 2 | Gentle state transitions |
| `easeInOut3` (cubic) | 3 | Wipes, bg shifts, depth de-emphasis, 3D flips |

---

## Stagger Timing

### stagger.framesPerItem
- **Level**: L1
- **Type**: number (frames)
- **Range**: 3–25
- **Typical**: 12–16
- **Effect**: Lower = tighter cascade (rapid-fire). Higher = more deliberate, one-by-one.

| Context | Frames | Profile |
|---------|--------|---------|
| Word-by-word tagline | 3–5 | snappy |
| General animation.ts | 8 | — |
| Premium stagger default | 12 | premium |
| Feature list items | 12–16 | luxury, dark |
| Word slam / kinetic text | 15–17 | kinetic |
| Deliberate entries | 18–25 | luxury |

### Observed stagger patterns

| Composition | Pattern | Values |
|-------------|---------|--------|
| FormaAd2 hook beats | hard cut per beat | 0, 30, 60f (30f each) |
| FormaAd2 tagline words | spring stagger | 8, 22, 36f (14f apart) |
| FormaAd2 cards | spring stagger | 82+0, 82+10, 82+20, 82+30 (10f apart) |
| LangEaseAd hook concepts | hard cut | 0, 22, 44, 66f (22f each) |
| LangEaseAd tagline | tight stagger | 8, 18, 28f (10f apart) |
| VelourAd services | moderate stagger | 6, 20, 34f (14f apart) |
| SolaceAd clones | tight stagger | 0, 7, 13f (6–7f apart) |
| PulseAd features | beat-synced | 0, 15, 30f (15f apart / 1 beat) |
