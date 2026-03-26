---
technique: narrative-drag-interaction
level: L3
primitives: [spring, interpolate]
hooks: []
profiles: [snappy-saas, product-showcase]
source: CalmlyAd.tsx Act 3
use_when: "Element needs simulated drag interaction to demonstrate a product feature"
---

# Narrative Drag Interaction

An animated cursor picks up a "messy" floating element and drags it into a clean, organized component. The destination reacts with impact animation, counter updates, and visual feedback. This **tells a product story** through interaction choreography.

## Components (5-part system)

| Component | Role | Lifecycle |
|-----------|------|-----------|
| `FloatingTask` | Chaotic, bobbing card (represents the problem) | Visible until grabbed |
| `AnimCursor` | Keyframed cursor with click ripple | Enters → approaches → clicks → drags → exits |
| `DragCard` | The card in transit (duplicate of FloatingTask content) | Spawns on grab → travels to destination → disappears on drop |
| `DashboardCard` | The organized destination (represents the solution) | Already visible; reacts to drop with squish/bounce/counter/flash |
| Camera | Dynamic focus tracking the card | Zooms into float card → follows drag → holds on dashboard |

## Timeline choreography

```
Frame:  250        280    286  288       302        315    325
        │           │      │    │         │          │      │
        FloatingTask│ Cursor│  GRAB    mid-drag   DROP  Cursor
        enters      enters  hovers             card    exits
                                              drops
```

## Code patterns

### FloatingTask (chaos card)
```tsx
// Bob animation + slight tilt = "messy, unorganized"
const bobY = Math.sin(frame * 0.06) * 8 * (1 - grabP);
const rot = 5 + Math.sin(frame * 0.04 + 1) * 2 * (1 - grabP);

// Shrinks when grabbed (4-frame transition)
const grabP = clamp01((frame - grabFrame) / 4);
const grabScale = 1 - 0.5 * grabP;
```

### DragCard (in-transit)
```tsx
// Smoothstep flight from float position to drop zone
const flightP = clamp01((frame - grabFrame) / (dropFrame - grabFrame));
const eased = flightP * flightP * (3 - 2 * flightP);
const cx = FLOAT_X + (dropTargetX - FLOAT_X) * eased;

// Rotation straightens during flight (chaos → order)
const rot = interpolate(eased, [0, 0.5, 1], [5, 2, 0]);
// Scale shrinks slightly as it "enters" the dashboard context
const scale = interpolate(eased, [0, 0.8, 1], [1, 0.95, 0.85]);
```

### Drop impact on DashboardCard
```tsx
// Impact squish (frames 0–4 after drop)
const impactP = clamp01(dropLocalF / 5);
const squish = Math.sin(impactP * Math.PI);
const dropScaleY = 1 - 0.18 * squish;
const dropScaleX = 1 + 0.06 * squish;

// Recovery bounce (starts frame 5)
const recoveryP = spring({
  frame: dropLocalF - 5,
  config: { stiffness: 280, damping: 10, mass: 0.5 }
});

// Counter increments, checkmark draws on, teal flash overlay
```

## Key insights

1. **FloatingTask must look "messy"** — bob, tilt, warm accent color, "Urgent" label. The contrast with the clean dashboard is the story.
2. **DragCard is a separate component from FloatingTask** — don't try to reparent. FloatingTask shrinks away while DragCard spawns at the same position.
3. **Rotation straightens during drag** — subtle `[5°, 2°, 0°]` interpolation sells the "chaos → order" narrative physically.
4. **Impact has two phases:** instant squish (4 frames, sin-based) then spring recovery (bouncy). This reads as a physical "thunk."
5. **Counter update waits for spring > 0.8** — don't update the number during the bounce, only when settled.
6. **Camera should zoom into the float card BEFORE the cursor arrives** — creates anticipation.

## Observed in

- CalmlyAd Act 3 — "API Migration" card dragged into "Calmly" dashboard
