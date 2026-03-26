---
technique: clip-path-transitions
level: L2+L5
primitives: [interpolate, easeInOut3]
hooks: [usePremiumWipe]
profiles: [luxury-slow, dark-tech, kinetic-typography]
use_when: "Scene transitions need a directional wipe, iris, or brush-stroke reveal effect"
---

# Clip-Path Transitions

Scene-to-scene transitions using CSS `clip-path` animations. Four variants: brush sweep, vertical wipe, diagonal slash, and iris close.

## Variants

### 1. Brush Sweep (horizontal reveal)

| Parameter | Value |
|-----------|-------|
| clip-path start | `inset(0 100% 0 0)` |
| clip-path end | `inset(0 0 0 0)` |
| duration | 22–28f |
| easing | easeInOut3 |

```tsx
const wipeT = easeInOut3(clamp((frame - startF) / 24, 0, 1));
<div style={{
  clipPath: `inset(0 ${(1 - wipeT) * 100}% 0 0)`,
}}>
```

### 2. Vertical Wipe (bottom-to-top)

| Parameter | Value |
|-----------|-------|
| clip-path start | `inset(100% 0 0 0)` |
| clip-path end | `inset(0 0 0 0)` |
| duration | 20–26f |
| easing | easeInOut3 |

### 3. Diagonal Slash

| Parameter | Value |
|-----------|-------|
| clip-path start | `polygon(0 0, 0 0, 0 100%, 0 100%)` |
| clip-path end | `polygon(0 0, 100% 0, 100% 100%, 0 100%)` |
| duration | 22f |
| easing | easeOut4 |

### 4. Iris Close

| Parameter | Value |
|-----------|-------|
| clip-path start | `circle(100% at 50% 50%)` |
| clip-path end | `circle(0% at 50% 50%)` |
| duration | 18–22f |
| easing | easeInOut3 |

## Using usePremiumWipe

```tsx
const wipe = usePremiumWipe(startFrame, 22);
// Returns: 0 → 100 (percentage)
<div style={{ width: `${wipe}%` }}>  // accent line wipe
```

## Observed in

- SeriAd — scissor cut overlay using diagonal clip-path
- LEARNINGS.md line 1745 — all four variants documented
- FormaAd original — accent rule wipe (usePremiumWipe)
- VelourAd Scene 3 — accent lines with wipe
