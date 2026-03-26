---
technique: notification-pulse-stack
level: L2+L3
primitives: [spring, Math.sin]
hooks: []
profiles: [snappy-saas, dark-tech]
use_when: "Notification cards need stacked entrance with pulse/glow effect for social proof"
---

# Notification Pulse Stack

Vertically stacked notification cards that slide in from the left with spring animation. Each card has an icon with an expanding pulse ring for attention, a colored glow border that breathes, and a timestamp. Accompanied by progress ring indicators on the side.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| card_width | 1600px (4K) | Full notification card |
| card_height | 260px | Single notification |
| card_gap | 320px (top offset) | Vertical spacing between cards |
| card_radius | 40px | Rounded corners |
| slide_distance | 400px | Slide-in from left |
| slide_scale | 0.9 → 1.0 | Scale-up during entrance |
| glow_border | `1px solid ${color}30` | Colored border |
| glow_shadow_pulse | sin(frame × 0.05 + i × 1.5) × 0.3 + 0.7 | Per-card offset |
| glow_shadow_spread | 30px × pulse | Breathing glow radius |
| icon_container_size | 100px | Icon background square |
| icon_container_radius | 28px | Rounded icon bg |
| icon_glow | `0 0 16px ${color}25` | Subtle icon glow |
| pulse_ring_border | `2px solid ${color}` | Expanding ring |
| pulse_ring_opacity | sin(frame × 0.06 + i × 2) × 0.4 | Fades in/out |
| pulse_ring_scale | 1.0 → 1.5 | Expansion range |
| stagger_delay | 8 frames | Between successive cards |
| spring.stiffness | 150 | Card entrance |
| spring.damping | 22 | Smooth settle |
| spring.mass | 0.9 | Medium |

## Code pattern — notification card

```tsx
const p = spring({ frame: Math.max(0, frame - delay), fps, config: SPR.card });
const glowPulse = Math.sin(frame * 0.05 + i * 1.5) * 0.3 + 0.7;

<div style={{
  width: 1600, height: 260, borderRadius: 40,
  background: `linear-gradient(145deg, #2D3B50, #1E293B)`,
  border: `1px solid ${color}30`,
  boxShadow: `0 0 ${30 * glowPulse}px ${color}30, 0 16px 48px rgba(0,0,0,0.3)`,
  transform: `translateX(${(1 - p) * -400}px) scale(${0.9 + p * 0.1})`,
  opacity: p,
  display: "flex", alignItems: "center", padding: "0 56px", gap: 36,
}}>
  <div style={{ /* icon container */ }} />
  <div>{/* title + description */}</div>
  <div>{/* timestamp */}</div>
</div>
```

## Code pattern — expanding pulse ring

```tsx
<div style={{
  position: "absolute",
  width: 100, height: 100, borderRadius: "50%",
  border: `2px solid ${color}`,
  opacity: Math.max(0, Math.sin(frame * 0.06 + i * 2) * 0.4),
  transform: `scale(${1 + Math.sin(frame * 0.06 + i * 2) * 0.5})`,
  pointerEvents: "none",
}} />
```

## Code pattern — progress ring

```tsx
const circumference = 2 * Math.PI * radius;

<circle cx={cx} cy={cy} r={radius}
  fill="none" stroke={color} strokeWidth={strokeWidth}
  strokeDasharray={circumference}
  strokeDashoffset={circumference * (1 - progress * 0.88)}
  strokeLinecap="round"
  transform={`rotate(-90 ${cx} ${cy})`}
  filter={`drop-shadow(0 0 8px ${color}80)`} />
```

## Observed in

- SaasMediumComponentAd Scene 3 (Illuminate) — 4 notification cards + 3 progress rings + LIVE indicator
