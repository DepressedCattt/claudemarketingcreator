---
technique: glassmorphic-card
level: L3
primitives: []
hooks: []
profiles: [snappy-saas, luxury-slow, product-showcase]
use_when: "Cards need frosted glass effect with backdrop-blur, border glow, and transparency"
---

# Glassmorphic Card

Frosted glass UI card with blur backdrop, subtle border, and ambient shadow. Used for product preview windows, content library cards, and dashboard mockups.

## Parameter table

| Parameter | Snappy SaaS | Luxury Slow | Dark Tech |
|-----------|-------------|-------------|-----------|
| background | rgba(255,255,255,0.82–0.92) | rgba(255,255,255,0.92) | rgba(20,28,46,1.0) |
| backdropFilter | blur(12px) | blur(12px) | none |
| border | 1.5px solid rgba(accent,0.12) | 1px solid rgba(0,0,0,0.07) | 1px solid rgba(255,255,255,0.08) |
| borderRadius | 18–24px | 24–32px | 22px |
| boxShadow.ambient | `0 24px 64px rgba(accent,0.08)` | `0 32px 80px rgba(accent,0.10)` | `0 0 80px rgba(accent,0.10)` |
| boxShadow.contact | `0 4px 16px rgba(0,0,0,0.06)` | `0 4px 20px rgba(0,0,0,0.06)` | `0 8px 24px rgba(0,0,0,0.35)` |
| title_bar_height | 40px | — | 40px |
| title_bar_dots | 3 (red/yellow/green) | — | 3 (red/yellow/green) |
| status_bar_height | 32px | — | 32px |
| card_width | 460–540px | 860px | 460px |
| content_padding | 14–28px | 32–36px | 14–28px |

## Code pattern

```tsx
<div style={{
  width: 540,
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(12px)",
  borderRadius: 22,
  border: "1.5px solid rgba(58,97,255,0.12)",
  boxShadow: `0 24px 64px rgba(58,97,255,0.08),
              0 4px 16px rgba(0,0,0,0.06)`,
  overflow: "hidden",
}}>
  {/* Title bar with traffic light dots */}
  <div style={{ height: 40, background: "#0D1424", display: "flex", alignItems: "center", padding: "0 14px", gap: 8 }}>
    {["#FF5F57", "#FFBD2E", "#27C93F"].map((c, i) => (
      <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
    ))}
  </div>
  {/* Content */}
</div>
```

## Observed in

- FormaAd2 Scene 2 — glass window with blur backdrop, 540px wide
- LangEaseAd Scene 2 — content library card, 860px, rgba(255,255,255,0.92)
- FormaAd original — UiPreviewCard with sidebar, 460px, dark surface
