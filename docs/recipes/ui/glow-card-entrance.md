---
technique: glow-card-entrance
level: L2+L3
primitives: [spring, Math.sin]
hooks: []
profiles: [snappy-saas, dark-tech]
use_when: "Cards need entrance animation with glowing border or shadow effect"
---

# Glow Card Entrance

Spring-driven card entrance with colored box-shadow glow that pulses after settling. The card slides up and scales in while its glow radiates outward. An inner radial gradient simulates overhead lighting. Used for dashboard KPI cards, node cards, and notification items on dark backgrounds.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| entrance_translateY | 60px | Slide-up distance |
| entrance_scale | 0.85 → 1.0 | Scale-up range |
| glow_shadow_base | 40px | Base glow spread radius |
| glow_pulse_multiplier | sin(frame × 0.04) × 0.3 + 0.7 | Range: 0.4–1.0 |
| glow_color_opacity | 40% hex suffix | e.g. `#3B82F640` |
| depth_shadow_y | 16px + (depth × 4) | Progressive depth per card layer |
| depth_shadow_blur | 48px + (depth × 8) | Larger blur for deeper cards |
| depth_shadow_color | rgba(0,0,0,0.4) | Dark ambient occlusion |
| inset_top | rgba(255,255,255,0.06) | 1px top edge catch light |
| inset_bottom | rgba(0,0,0,0.2) | 1px bottom edge shadow |
| inner_light_width | 60% of card width | Radial gradient width |
| inner_light_height | 50% of card height | Positioned at top: -30% |
| inner_light_opacity | 0.15 × glowPulse | Breathes with the glow |
| spring.stiffness | 150 | Card entrance |
| spring.damping | 22 | Critically damped |
| spring.mass | 0.9 | Medium weight |

## Code pattern

```tsx
const p = spring({ frame: Math.max(0, frame - delay), fps, config: { stiffness: 150, damping: 22, mass: 0.9 } });
const glowPulse = Math.sin(frame * 0.04 + i) * 0.3 + 0.7;

<div style={{
  borderRadius: 40,
  background: `linear-gradient(145deg, #2D3B50, #1E293B)`,
  border: `1px solid ${color}40`,
  boxShadow: `0 0 ${40 * glowPulse}px ${color}40, 0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
  transform: `translateY(${(1 - p) * 60}px) scale(${0.85 + p * 0.15})`,
  opacity: p,
  overflow: "hidden",
}}>
  {/* Inner light */}
  <div style={{
    position: "absolute", top: "-30%", left: "20%",
    width: "60%", height: "50%", borderRadius: "50%",
    background: `radial-gradient(circle, ${color}40, transparent 70%)`,
    opacity: 0.15 * glowPulse,
  }} />
  {children}
</div>
```

## Observed in

- SaasMediumComponentAd Scene 1 (Orchestrate) — Revenue, Conversions, Active Users cards
- SaasMediumComponentAd Scene 2 (Connect) — Data Source, Transform, Dashboard nodes
- SaasMediumComponentAd Scene 4 (Compose) — Auth, API, Data Layer stack cards
- SaasPlaygroundAd S12 — 3 dashboard + 3 node cards in condensed sampler
