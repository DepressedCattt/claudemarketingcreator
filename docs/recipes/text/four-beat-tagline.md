---
technique: four-beat-tagline
level: L2
primitives: [spring, clamp01]
hooks: []
profiles: [snappy-saas, luxury-slow, kinetic-typography]
source: CalmlyAd.tsx Act 3 tagline sequence
use_when: "A 4-word tagline needs rhythmic reveal synced to music beats or visual rhythm"
---

# Four-Beat Tagline

A CTA tagline animated in **4 distinct beats**: word → word → geometric accent → punctuation drop. Each beat uses a different animation type, creating rhythm and a satisfying close.

## The 4 beats

| Beat | Content | Animation | Timing |
|------|---------|-----------|--------|
| 1 | First word(s) | Spring rise + blur reveal | Base frame |
| 2 | Key word | Spring rise, heavier weight + accent color | +6 frames |
| 3 | Underline | `scaleX` from left, smoothstep | +14 frames |
| 4 | Period | Spring fall from above with bounce | +22 frames |

## Parameter table

| Element | Spring Config | Size | Weight | Color |
|---------|--------------|------|--------|-------|
| Word 1 ("Focus,") | `{140, 16, 0.8}` | 100px | 400 | Muted/gray |
| Word 2 ("finally") | `{120, 13, 0.9}` | 100px | 700 | Accent (teal) |
| Underline | smoothstep over 10f | 210×4px | — | Accent (teal) |
| Period (".") | `{160, 10, 0.8}` | 100px | 700 | Accent (teal) |

## Code pattern

```tsx
const FOCUS_ENTER = baseFrame;
const FINALLY_ENTER = baseFrame + 6;
const UNDERLINE_START = baseFrame + 14;
const DOT_ENTER = baseFrame + 22;
const UNDERLINE_DUR = 10;

// Beat 3: Underline (straight line, scaleX from left)
const ulRaw = clamp01((frame - UNDERLINE_START) / UNDERLINE_DUR);
const ulP = ulRaw * ulRaw * (3 - 2 * ulRaw);  // smoothstep

<div style={{
  left: wordX, top: wordY + 40,
  width: 210, height: 4,
  borderRadius: 2,
  background: accentColor,
  transformOrigin: "left center",
  transform: `scaleX(${ulP})`,
}} />

// Beat 4: Period falls from above
const dotP = spring({ frame: frame - DOT_ENTER, fps,
  config: { stiffness: 160, damping: 10, mass: 0.8 } });
const dotY = (TAG_Y - 80) + 80 * dotP;  // falls 80px
```

## Variants

- **3-beat** (no underline): word → word → period. Simpler but still effective.
- **5-beat** (add icon): word → word → underline → period → small icon/logo fades in below.
- **Underline variants**: `scaleX` (straight), `strokeDashoffset` (SVG wavy — better for casual brands).

## Key insights

1. **Geometric accent (underline) between text beats** breaks up the rhythm — otherwise it's just "word, word, done"
2. **Period as a separate element with its own animation** turns punctuation into a punchline. The bounce (damping 10) adds a decisive "stamp."
3. **Word 1 should be visually restrained** (lighter weight, muted color) so Word 2 gets the emphasis
4. **Underline width should match Word 2's visual width**, not exceed it
5. **The falling period needs clearance** — position it 30+ px right of the last letter to avoid collision with descenders (y, g, etc.)

## Observed in

- CalmlyAd Act 3 — "Focus, finally." with teal underline + bouncing period
