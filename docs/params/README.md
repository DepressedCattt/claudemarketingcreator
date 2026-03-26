# Animation Parameter Space

A structured taxonomy of every tuneable parameter in the Remotion ad engine.
Machine-parseable tables with YAML-style frontmatter for pipeline integration.

---

## Parameter Levels

| Level | Name | What it controls | File |
|-------|------|------------------|------|
| **L1** | Physics | Spring configs, easing curves, stagger timing | [physics.md](physics.md) |
| **L2** | Visual | Blur, scale, translate, opacity, rotation | [visual.md](visual.md) |
| **L3** | Composition | Typography, color palette, layout, sizing | [composition.md](composition.md) |
| **L4** | Temporal | Scene durations, BPM, beat grids, transitions | [temporal.md](temporal.md) |
| **L5** | Technique | Reveal methods, transition types, camera motion | [techniques.md](techniques.md) |

---

## How to read parameter entries

Each parameter follows this format:

```
### parameter.name
- **Level**: L1–L5
- **Type**: number | string | enum
- **Range**: min–max (observed across all compositions)
- **Typical**: common working range
- **Effect**: what changing the value does visually
- **Profiles**: per-profile recommended values
- **Source**: where the value is defined/used
```

---

## Profile shorthand

| Profile | Shorthand | Key feel |
|---------|-----------|----------|
| Snappy SaaS | `snappy` | Apple-clean, critically damped, fast |
| Luxury Slow | `luxury` | Warm, organic, longer holds |
| Kinetic Typography | `kinetic` | Text-dominant, word slams, rapid |
| Dark Tech | `dark` | Glowing, ambient, precise |
| Product Showcase | `product` | UI cards, demos, progress bars |

---

## Utility files

Parameters are implemented via hooks in two utility files:

- `src/utils/premiumMotion.ts` — premium motion primitives (PREMIUM_SPRING, useCinematicTextReveal, etc.)
- `src/utils/animation.ts` — general animation hooks (SPRING, useWordSlam, etc.)

---

## Pipeline integration

The compare pipeline (`scripts/compare-ads.js`) outputs `parameterDeltas` referencing
parameters by their `parameter.name` from this taxonomy. The update script
(`scripts/update-params.js`) reads those deltas and refines ranges in the recipe
and profile docs.
