---
technique: kinetic-typography-cascade
level: L2
primitives: [spring, interpolate]
hooks: []
profiles: [snappy-saas, dark-tech, kinetic-typography]
source: CalmlyAd.tsx Act 1
use_when: "Text needs dramatic word-by-word or character-by-character entrance with spring physics and stagger"
---

# Kinetic Typography Cascade

Each word in a headline enters from a **different direction** with a **unique spring config**, creating rhythmic, dynamic text reveals. Much more engaging than uniform word-by-word fades.

## How it works

1. Each word is an independent `SpringText` instance
2. Every word has a unique `fromX`/`fromY` (entry vector)
3. Spring configs vary per word — lighter words are snappier, impact words are heavier
4. Stagger timing is **uneven** — accelerating pace builds tension
5. Optional: pair a word with a narrative prop (e.g., envelope for "inbox")

## Parameter table

| Parameter | Range | Notes |
|-----------|-------|-------|
| word_count | 3–6 | More than 6 becomes cluttered |
| stagger_pattern | Accelerating (e.g., 0, 10, 22, 30) | NOT uniform; compress spacing for urgency |
| entry_vectors | Mix of: drop (Y-700), slide (X±600), scale-from-place, slam (Y+600) | Each word unique |
| spring.stiffness | 60–160 | Lower = slower/bouncier, higher = snappier |
| spring.damping | 9–20 | < 12 = visible bounce, > 16 = clean settle |
| spring.mass | 0.7–1.4 | Higher = floatier travel |
| font_size | 100–200px at 4K | Scale down proportionally for lower res |
| weight_variation | 400–800 | Heavier weight on impact words |
| color_variation | 1–2 accent colors max | Highlight the key word(s) |

## Code pattern

```tsx
const WORDS = [
  {
    text: "Your", x: CX - 500, y: CY - 40,
    fromX: CX - 500, fromY: CY - 700,  // drops from above
    enterFrame: 0, weight: 500,
    spring: { stiffness: 120, damping: 18, mass: 1.0 },
  },
  {
    text: "inbox", x: CX - 30, y: CY - 40,
    fromX: CX - 30, fromY: CY - 320,  // flies from envelope
    enterFrame: 10, weight: 700, color: BLUE,
    spring: { stiffness: 60, damping: 9, mass: 1.4 },
  },
  {
    text: "never", x: CX + 500, y: CY - 40,
    fromX: CX + 500, fromY: CY - 40,  // scales up from position
    enterFrame: 22, weight: 500,
    spring: { stiffness: 140, damping: 16, mass: 0.7 },
  },
  {
    text: "stops.", x: CX + 250, y: CY + 160,
    fromX: CX + 250, fromY: CY + 600,  // slams from below
    enterFrame: 30, weight: 800, color: PINK,
    spring: { stiffness: 160, damping: 20, mass: 1.0 },
  },
];
```

## Screen shake pairing

The final "slam" word should trigger a screen shake on the **other** words (not itself):

```tsx
const SHAKE_FRAME = slamEnterFrame + 4;  // ~4 frames after spring starts
const SHAKE_DUR = 8;
// Wrap other words in shake container, slam word sits outside it
```

## Key insights

1. **Uneven stagger > even stagger** — `[0, 10, 22, 30]` feels rhythmic; `[0, 10, 20, 30]` feels mechanical
2. **Impact word should be OUTSIDE the shake wrapper** — it causes the shake, it shouldn't shake itself
3. **Text overlap risk:** when words enter from different directions, spring overshoot temporarily extends each word's footprint. Add 30-50% extra spacing beyond the settled state
4. **Pair one word with a narrative prop** (envelope, device, icon) for memorability

## Observed in

- CalmlyAd Act 1 — "Your inbox never stops." (4 words, 4 directions, envelope prop for "inbox")
