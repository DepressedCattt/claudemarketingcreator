---
technique: medium-component-animation
level: L1+L2+L3
primitives: [spring, interpolate, Math.sin]
hooks: []
profiles: [snappy-saas, dark-tech, product-showcase]
use_when: "Standard UI component (button, input, toggle) needs animated state transition"
---

# Medium Component Animation

Overview technique for medium-complexity animated UI components. Steps up from simple component animation (slide + scale + opacity) by adding glow effects, inter-component choreography, ambient lighting, layered depth, and animated SVG connectors. Dark SaaS palette with colored glow accents per card/node.

## What separates "medium" from "simple"

| Aspect | Simple | Medium |
|--------|--------|--------|
| Background | Light blue (#5EB1FF) | Dark slate (#0F172A → #1E293B) |
| Card surface | White (#F8F8F8) | Dark gradient (linear-gradient 145deg) |
| Lighting | None | Glow box-shadow, inner radial gradient, ambient orbs |
| Depth | Flat shadows | Multi-layer box-shadow (glow + depth + inset) |
| Choreography | Independent stagger | Connected via SVG paths, cascading state |
| Effects | None | Pulse rings, breathing glow, traveling dots |

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| bg_color | #0F172A | Dark navy slate |
| surface_gradient | `linear-gradient(145deg, #2D3B50, #1E293B)` | Card surface |
| glow_box_shadow | `0 0 ${40 * pulse}px ${accentGlow}` | Pulsing colored glow |
| glow_pulse_freq | 0.04 rad/frame | Sin wave for glow amplitude |
| glow_pulse_range | 0.7–1.0 | Multiplier range |
| inner_light_opacity | 0.15 | Radial gradient overlay inside card |
| inner_light_position | top: -30% of height, left: 20% | Simulates overhead light |
| depth_shadow | `0 16px 48px rgba(0,0,0,0.4)` | Base depth shadow |
| inset_highlight | `inset 0 1px 0 rgba(255,255,255,0.06)` | Top edge catch-light |
| inset_shadow | `inset 0 -1px 0 rgba(0,0,0,0.2)` | Bottom edge shadow |
| border | `1px solid ${accent}40` | Subtle colored border |
| card_border_radius | 32–40px | Rounded corners |
| ambient_orb_size | 400–900px | Large radial gradient circles |
| ambient_orb_opacity | 0.6 × progress × breathe | Multiplied by breath cycle |
| ambient_bob_freq | 0.015 rad/frame | Gentle vertical bob |
| ambient_bob_amp | 6px | Bob amplitude |
| status_dot_size | 10–14px | Active/inactive indicator |
| status_dot_glow | `0 0 10px ${color}` | Glow around status dot |

## Spring presets

| Element | Stiffness | Damping | Mass | Feel |
|---------|-----------|---------|------|------|
| card | 150 | 22 | 0.9 | Firm but not harsh |
| glow | 80 | 26 | 1.1 | Slow, organic reveal |
| text | 170 | 25 | 0.8 | Crisp text entrance |
| connect | 100 | 24 | 0.95 | SVG draw-on flow |
| icon | 200 | 20 | 0.7 | Snappy badges |
| cta | 120 | 18 | 0.9 | Slight bounce for attention |

## Code pattern — glow card

```tsx
const glowPulse = Math.sin(frame * 0.04 + depth) * 0.3 + 0.7;

<div style={{
  borderRadius: 40,
  background: `linear-gradient(145deg, #2D3B50, #1E293B)`,
  border: `1px solid ${glowColor}40`,
  boxShadow: [
    `0 0 ${40 * glowPulse}px ${glowColor}`,
    `0 ${16 + depth * 4}px ${48 + depth * 8}px rgba(0,0,0,0.4)`,
    `inset 0 1px 0 rgba(255,255,255,0.06)`,
    `inset 0 -1px 0 rgba(0,0,0,0.2)`,
  ].join(", "),
  transform: `translateY(${(1 - p) * 60}px) scale(${0.85 + p * 0.15})`,
  opacity: p,
}}>
  {/* Inner light simulation */}
  <div style={{
    position: "absolute", top: "-30%", left: "20%",
    width: "60%", height: "50%", borderRadius: "50%",
    background: `radial-gradient(circle, ${glowColor}, transparent 70%)`,
    opacity: 0.15 * glowPulse,
  }} />
  {children}
</div>
```

## Observed in

- SaasMediumComponentAd Scene 1 — 5 dashboard cards with per-category glow colors
- SaasMediumComponentAd Scene 2 — 6 data-flow nodes with glow + status indicators
- SaasMediumComponentAd Scene 3 — notification stack with colored glow borders
- SaasMediumComponentAd Scene 4 — architecture assembly cards with layered depth
- SaasPlaygroundAd S12 — condensed sampler with glow cards + data-flow nodes

## AE reference

- Final_Comp_1–10: Glow effect (ADBE Glo2) on shape layers
- Final_Comp_1–10: Drop Shadow + Inner Shadow layer styles
- Final_Comp_1–10: Nested precomps with multi-layer compositing
