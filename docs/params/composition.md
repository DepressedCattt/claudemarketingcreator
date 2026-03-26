# L3 — Composition Parameters

Typography, color palette, layout positioning, and element sizing.
These control the visual design language of the ad.

---

## Typography

### type.heroSize
- **Level**: L3
- **Type**: number (px)
- **Range**: 72–230
- **Typical**: 96–164
- **Effect**: Main headline / hero number size. Bigger = more impact, fewer characters.
- **Profiles**: snappy: 96–128 | luxury: 108–164 | kinetic: 110–210 | dark: 96–158
- **Source**: FormaAd2 128, LangEaseAd 112, VelourAd 164, HavenAd 108, PulseAd 158, TrailBlazeAd 210

### type.headlineSize
- **Level**: L3
- **Type**: number (px)
- **Range**: 48–112
- **Typical**: 64–96
- **Effect**: Secondary headlines, scene titles.
- **Source**: FormaAd2 72–96, LangEaseAd 64–96, VelourAd 64–88, SolaceAd 84–108

### type.bodySize
- **Level**: L3
- **Type**: number (px)
- **Range**: 14–26
- **Typical**: 18–22
- **Effect**: Supporting copy, descriptions, proof lines.
- **Source**: Most compositions 18–22

### type.labelSize
- **Level**: L3
- **Type**: number (px)
- **Range**: 9–14
- **Typical**: 11–13
- **Effect**: Eyebrow labels, badges, metadata.
- **Source**: Most compositions 11–13

### type.heroWeight
- **Level**: L3
- **Type**: number
- **Range**: 700–900
- **Typical**: 700–900
- **Effect**: 700 (Bold) = reference-accurate for most SaaS. 900 (Black) = more impact.
- **Profiles**: snappy: 700 | luxury: 900 | kinetic: 900 | dark: 900

### type.bodyWeight
- **Level**: L3
- **Type**: number
- **Range**: 300–600
- **Typical**: 400–500
- **Effect**: Regular body text weight.

### type.labelWeight
- **Level**: L3
- **Type**: number
- **Value**: 700
- **Effect**: Labels/eyebrows are always bold.

### type.heroLetterSpacing
- **Level**: L3
- **Type**: number (px or em)
- **Range**: -10 to -2
- **Typical**: -3 to -6
- **Effect**: Tight tracking for large headlines. More negative = tighter.
- **Source**: FormaAd2 -6, LangEaseAd -5, VelourAd -9, TrailBlazeAd -10

### type.labelLetterSpacing
- **Level**: L3
- **Type**: string (em)
- **Range**: 0.06em–0.22em
- **Typical**: 0.10em–0.14em
- **Effect**: Wide tracking for uppercase labels/eyebrows.

### type.fontFamily
- **Level**: L3
- **Type**: string
- **Default**: `-apple-system, "SF Pro Display", Inter, "Helvetica Neue", sans-serif`
- **Mono**: `"SF Mono", "Fira Code", monospace`

---

## Observed typography per composition

| Composition | Hero size | Hero weight | Hero tracking | Body size | Label size |
|-------------|-----------|-------------|---------------|-----------|------------|
| FormaAd2 | 128px | 700 | -6 | 20px | 11px |
| LangEaseAd | 112px | 900 | -5 | 22px | 13px |
| VelourAd | 164px | 900 | -9 | 18px | 12px |
| HavenAd | 108px | 900 | -5 | 22px | 12px |
| SolaceAd | 158px | 900 | -0.045em | 22px | 10px |
| PulseAd | 158px | 900 | -8 | 19px | 12px |
| VeridianAd | 140px | 700 | -0.04em | — | — |
| TrailBlazeAd | 210px | 900 | -10 | 26px | 12px |
| SeriAd | 148px | 900 | -8 | 18px | 12px |

---

## Color Systems

### color.background
- **Level**: L3
- **Profiles**:
  - snappy: `#FDFDFE` (off-white)
  - luxury: `#0A0A0A` (near-black) or `#FAF7F3` (warm cream)
  - kinetic: high-contrast bg matching brand
  - dark: `#080B14` (deep navy)

### color.text
- **Level**: L3
- **Profiles**:
  - snappy: `#1E1E1E` (near-black on light bg)
  - luxury: `#F5F0E8` (cream on dark) or `#281F1A` (dark on warm)
  - dark: `#F0EEFF` (light on dark)

### color.accent
- **Level**: L3
- **Profiles**:
  - snappy: `#2076FF`/`#629DFF` (blue gradient)
  - luxury: `#C9A84C` (gold), `#BC7558` (terracotta), `#B45309` (amber)
  - kinetic: `#FF6B35` (orange), `#3DBA6F` (green)
  - dark: `#7C6BFF` (violet), `#06B6D4` (cyan)

### color.gradient
- **Level**: L3
- **Effect**: Gradient text via `-webkit-background-clip: text`
- **Profiles**:
  - snappy: `linear-gradient(90deg, #629DFF, #2076FF)`
  - luxury: `linear-gradient(135deg, gold1, gold2)`
  - dark: `linear-gradient(135deg, violet, pink)`

### Observed palettes

| Composition | Profile | Background | Text | Accent |
|-------------|---------|------------|------|--------|
| FormaAd2 | snappy | #FDFDFE | #1E1E1E | #2076FF / #629DFF |
| LangEaseAd | snappy | #FDFDFE | #1E1E1E | #3A61FF / #5B7FFF |
| VelourAd | luxury | #0A0A0A | #F5F0E8 | #C9A84C / #E5C974 |
| HavenAd | luxury | #FAF7F3 | #2A1F1A | #BC7558 / #D9A994 |
| SolaceAd | luxury | #FAF7F2 | #1C1410 | #B45309 / #FEF3C7 |
| PulseAd | dark | #080B14 | #F0EEFF | #7C6BFF / #E879F9 |
| TrailBlazeAd | kinetic | #080F0A | #F5FFF7 | #FF6B35 / #3DBA6F |
| SeriAd | luxury | #F6F3F0 | #1A1614 | #A07890 / #C8B898 |
| VeridianAd | dark | #F5F6FA | #0D0F14 | #5B47F5 |

---

## Layout & Sizing

### layout.heroHeight
- **Level**: L3
- **Type**: percentage
- **Range**: 40–60%
- **Typical**: 50%
- **Effect**: Hero element should occupy 40–60% of frame height.

### layout.padding
- **Level**: L3
- **Type**: number (px)
- **Range**: 60–100
- **Typical**: 80–90
- **Effect**: Horizontal padding from canvas edge for text content.
- **Source**: FormaAd2 80, most compositions 80–90

### layout.cardWidth
- **Level**: L3
- **Type**: number (px)
- **Range**: 300–860
- **Typical**: 460–540
- **Effect**: Width of UI preview cards. Minimum 300px.

### layout.borderRadius
- **Level**: L3
- **Type**: number (px)
- **Range**: 6–32
- **Typical**: 14–24
- **Effect**: Corner rounding for cards and UI elements.
- **Source**: FormaAd2 16–26, LangEaseAd 14–32, most compositions 10–24

### layout.cardShadow
- **Level**: L3
- **Type**: string (CSS box-shadow)
- **Profiles**:
  - snappy: `0 24px 64px rgba(58,97,255,0.08), 0 4px 16px rgba(0,0,0,0.06)`
  - dark: `0 0 80px rgba(accent,0.10), 0 8px 24px rgba(0,0,0,0.35)`
  - luxury: `0 32px 80px rgba(accent,0.10), 0 4px 20px rgba(0,0,0,0.06)`
