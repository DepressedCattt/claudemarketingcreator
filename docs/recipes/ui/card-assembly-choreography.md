---
technique: card-assembly-choreography
level: L2+L3
primitives: [spring, interpolate]
hooks: []
profiles: [snappy-saas, dark-tech, product-showcase]
use_when: "Multiple cards need to assemble into a grid or layout with choreographed motion"
---

# Card Assembly Choreography

Multiple architecture/feature cards enter independently with staggered spring entrances, then slide into an overlapping stacked formation. Each card has progressive depth shadows that increase with stack position. Accompanied by a status checklist panel that confirms each layer as "Ready" with checkmarks.

## Parameter table

| Parameter | Value | Notes |
|-----------|-------|-------|
| card_count | 3 | Typical stack size |
| card_width | 1200px (4K) | Per-card width |
| card_height | 700px (4K) | Per-card height |
| initial_spread_x | 200 + i × 600 | Spread-out horizontal positions |
| initial_spread_y | 600 | Shared Y when spread |
| stacked_offset_x | 400 + i × 100 | Overlapping X positions |
| stacked_offset_y | 500 + i × 100 | Cascading Y positions |
| assemble_trigger_frame | 50 (relative to scene) | When assembly begins |
| assemble_spring.stiffness | 100 | Slow, satisfying slide |
| assemble_spring.damping | 24 | No overshoot |
| assemble_spring.mass | 0.95 | Weighty feel |
| depth_shadow_base_y | 16px | First card shadow Y |
| depth_shadow_increment | 4px per layer | Deeper cards cast longer shadows |
| depth_shadow_blur_base | 48px | First card blur |
| depth_shadow_blur_increment | 8px per layer | Progressive blur increase |
| item_stagger | 4 frames | Between sub-items within a card |
| item_slide_x | 30px | Sub-item slide distance |
| checklist_spring.stiffness | 200 | Snappy checkmarks |
| checklist_spring.damping | 20 | Quick settle |

## Code pattern — assembly interpolation

```tsx
const assembleProgress = spring({ frame: Math.max(0, frame - 50), fps,
  config: { stiffness: 100, damping: 24, mass: 0.95 } });
const assembled = assembleProgress > 0.5;

const stackOffset = assembled
  ? interpolate(assembleProgress, [0.5, 1], [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  : 0;

const currentX = interpolate(stackOffset, [0, 1], [spreadX, stackedX]);
const currentY = interpolate(stackOffset, [0, 1], [spreadY, stackedY]);
```

## Code pattern — status checklist

```tsx
const checkP = spring({ frame: Math.max(0, frame - (60 + j * 6)), fps,
  config: { stiffness: 200, damping: 20, mass: 0.7 } });

<div style={{ display: "flex", alignItems: "center", gap: 16 }}>
  <div style={{
    width: 28, height: 28, borderRadius: "50%",
    background: checkP > 0.8 ? "#10B981" : "rgba(100,116,139,0.4)",
    boxShadow: checkP > 0.8 ? "0 0 10px #10B981" : "none",
  }}>
    {checkP > 0.8 && <CheckmarkSVG />}
  </div>
  <span style={{ color: checkP > 0.8 ? "#F8FAFC" : "#64748B" }}>{name}</span>
  <span style={{ color: "#10B981", marginLeft: "auto" }}>
    {checkP > 0.8 ? "Ready" : "..."}
  </span>
</div>
```

## Notes

- The "assemble" threshold at `progress > 0.5` creates a visual two-phase effect: cards first spread out independently, then pull together into a stack.
- Progressive depth shadows (`depth * 4px` Y offset, `depth * 8px` blur increment) prevent the stack from looking flat — deeper cards cast longer, softer shadows.
- The checklist panel acts as narrative confirmation — each layer lights up green in sequence after the assembly completes.

## Observed in

- SaasMediumComponentAd Scene 4 (Compose) — Auth, API Gateway, Data Layer stacking into architecture diagram with status checklist
