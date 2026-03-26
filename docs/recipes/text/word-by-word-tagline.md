---
technique: word-by-word-tagline
level: L1+L2
primitives: [spring]
hooks: [useSnapReveal]
profiles: [snappy-saas, luxury-slow]
use_when: "A tagline or slogan needs to appear word by word with controlled timing between words"
---

# Word-by-Word Tagline

Per-word spring reveal with tight stagger. Each word in the tagline gets its own blur-scale-reveal, entering 4–14 frames after the previous one. Creates a punchy, rhythmic close.

## Parameter table

| Parameter | Snappy SaaS | Luxury Slow |
|-----------|-------------|-------------|
| word_stagger | 10–14f | 16–22f |
| blur_start | 10px | 14px |
| scale_start | 0.95 | 0.92 |
| spring.stiffness | 200 | 80 |
| spring.damping | 25 | 24 |
| spring.mass | 0.8 | 1.1 |
| font_size | 96–108px | 88–108px |
| font_weight | 700 | 900 |
| letter_spacing | -5 | -4 |
| line_height | 0.92 | 0.90 |
| per_word_color | different per word | gradient |

## Code pattern

```tsx
const WORDS = [
  { word: "Translate.", startF: 8  },
  { word: "Dub.",       startF: 22 },  // 14f stagger
  { word: "Distribute.",startF: 36 },  // 14f stagger
];

{WORDS.map((w, i) => {
  const s = spring({
    frame: Math.max(0, frame - w.startF),
    fps,
    config: { stiffness: 200, damping: 25, mass: 0.8 },
  });
  return (
    <div style={{
      fontSize: 108,
      fontWeight: 700,
      opacity: s,
      transform: `scale(${0.95 + s * 0.05})`,
      filter: `blur(${((1 - s) * 10).toFixed(2)}px)`,
    }}>
      {w.word}
    </div>
  );
})}
```

## Observed in

- FormaAd2 Scene 5 (480–570f) — "Translate. Dub. Distribute." at 8, 22, 36f (14f apart)
- LangEaseAd Scene 4 (360–450f) — same tagline at 8, 18, 28f (10f apart)
- H.1 reference 00:25–00:27 — word-by-word with 4–5f stagger at source frame rate

## Key insight

The reference ad used 4–5 frame stagger between words. The Remotion recreations use 10–14f which is slightly more deliberate but still reads as rapid. For maximum fidelity to the reference, tighten to 6–8f.
