---
technique: horizontal-card-scroll
level: L1+L2
primitives: [interpolate, spring]
hooks: []
profiles: [snappy-saas, product-showcase]
source: FINAL_RENDER_4K.ae-extract.json (board_6–10)
use_when: "Cards need horizontal scrolling carousel animation to showcase multiple items"
---

# Horizontal Card Scroll

Cards slide horizontally across the frame in a smooth, continuous scroll.
Each card is a feature/widget showcase with a tinted monochrome illustration
inside. In AE these use Position-only animation with 5-6 keyframes creating
a smooth carousel effect.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| card_count | 4–6 | Number of scrolling cards |
| card_width | 750–900px | Individual card size |
| card_gap | 60–100px | Spacing between cards |
| scroll_speed | ~800px per second | Horizontal velocity |
| initial_offset | right of screen | Start offscreen right |
| easing | easeInOut3 | Smooth acceleration/deceleration |
| tint | monochrome or brand | Cards tinted to brand palette |

## Code pattern

```tsx
const HorizontalScroll: React.FC<{
  cards: Array<{ content: React.ReactNode }>;
  progress: number;
  cardWidth?: number;
  cardGap?: number;
  y?: number;
}> = ({ cards, progress, cardWidth = 800, cardGap = 80, y = 600 }) => {
  const totalWidth = cards.length * (cardWidth + cardGap);
  const scrollX = interpolate(
    progress,
    [0, 1],
    [3840, -totalWidth + 3840 * 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 3840, height: 2160 - y, overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          gap: cardGap,
          transform: `translateX(${scrollX}px)`,
          position: "absolute",
          top: 0,
        }}
      >
        {cards.map((card, i) => (
          <div
            key={i}
            style={{
              width: cardWidth,
              flexShrink: 0,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            {card.content}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Observed in

- FINAL_RENDER_4K board_6–10 (5 cards scrolling horizontally, frames 336–446)
- Each board contains a featured widget precomp (chart, checkbox, dialog, etc.)
