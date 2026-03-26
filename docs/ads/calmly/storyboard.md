# CalmlyAd — Storyboard & Technical Reference

**Product:** Calmly — team focus/productivity app  
**Theme:** Chaos → Calm (noise → clarity)  
**Format:** 16:9 4K (3840 × 2160), 390 frames @ 30fps (13s)  
**File:** `src/compositions/CalmlyAd.tsx`

## Act Structure

| Act | Frames | Duration | Name | Core Animation |
|-----|--------|----------|------|----------------|
| 1 | 0–90 | 3.0s | Chaos | Kinetic typography cascade + notification swarm |
| 2 | 90–220 | 4.3s | The Click | Blob burst → epicyclic drift → vortex convergence |
| 3 | 220–390 | 5.7s | Calm | Dashboard unfurl + narrative drag + camera tracking + tagline |

## Act 1: "Your inbox never stops."

**Technique:** Kinetic Typography Cascade (see `docs/recipes/kinetic-typography-cascade.md`)

| Element | Frame | Entry | Spring |
|---------|-------|-------|--------|
| "Your" | 0 | Drops from above (Y-700) | `{120, 18, 1.0}` |
| Envelope | 3 | Scale-in, flap opens at +4 | `{140, 18, 0.9}` / `{80, 14, 1.0}` |
| "inbox" | 10 | Flies from envelope, blue, bold | `{60, 9, 1.4}` |
| "never" | 22 | Scales up from position | `{140, 16, 0.7}` |
| "stops." | 30 | Slams from below, pink, screen shake at 34 | `{160, 20, 1.0}` |
| NotifWidgets | 34–62 | Stagger at 4f intervals, 8 widgets | `{200, 12, 0.6}` |
| All Act 1 | 90–108 | Cubic exit toward center offsets | 18f exit window |

## Act 2: The Click — Vortex Transition

**Techniques:** Metaball blobs (`docs/recipes/liquid-blob-transition.md`), Epicyclic Drift (`docs/recipes/epicyclic-drift.md`), Vortex Convergence (`docs/recipes/vortex-convergence.md`)

| Element | Frame | Animation |
|---------|-------|-----------|
| ShockwaveRings | 98, 101, 104 | 3 expanding rings (pink, blue, amber) |
| MetaBlobs (accent, 6x) | 99–225 | Flight → coast → epicyclic drift → spiral convergence |
| MetaBlobs (soft, 4x) | 98–180 | Background blobs, fade out before vortex |
| "What if" | 116 | Spring text, exits 192–206 |
| "it could?" | 122 | Spring text, exits 192–206 |
| VortexCore | 202–229 | Growing conic gradient disc → burst at 217 |

## Act 3: Calm — Dashboard + Tagline

**Techniques:** Dynamic Camera Focus (`docs/recipes/dynamic-camera-focus.md`), Narrative Drag Interaction (`docs/recipes/narrative-drag-interaction.md`), Four-Beat Tagline (`docs/recipes/four-beat-tagline.md`)

| Element | Frame | Animation |
|---------|-------|-----------|
| DashboardCard | 215 | Clip-path unfurl + scale reveal |
| "Calmly." | 235 | Heavy spring text `{60, 10, 1.5}` |
| FloatingTask | 250–292 | Bobbing, tilted card (chaos representation) |
| Camera zoom in | 260 | Spring zoom 1.0→1.6, focus on floating card |
| AnimCursor | 280–325 | Approach → click → drag path |
| DragCard | 288–315 | Smoothstep flight, rotation straightens |
| Drop impact | 315 | Squish + bounce + counter + check + flash + shake + punch |
| Camera zoom out | 340 | Spring pull-back for CTA reveal |
| "Focus," | 352 | Spring rise, muted |
| "finally" | 358 | Spring rise, teal, bold |
| Underline | 366–376 | scaleX from left, smoothstep |
| Period "." | 374 | Spring fall from above, bouncy |

## Camera System (Act 3)

5 layered effects on one transform + vignette overlay:

1. **Zoom:** `scale(1 + 0.6 * zoomIn - 0.6 * zoomOut) * (1 + punch)`
2. **Pan:** `translate(-(focus-CX) * panStrength * 0.45)`
3. **Handheld drift:** 1-2px sine breathing, 0.12° rotation
4. **Drag tilt:** 0.4° roll during drag (sine arc)
5. **Drop punch:** 3.5% scale pop, 12 frame decay
6. **Vignette:** Radial gradient, opacity tied to zoom state

## Design Tokens

```
bg: #F5F0EB    blue: #4A6CF7    pink: #FF6B8A
amber: #FFB74D  teal: #26C6A0   text: #1A1A2E
textMid: #7B7B90  textLt: #B0B0C0  white: #FFFFFF
Font: Inter / SF Pro Display / system
```

## Iteration History

~20 rounds of feedback. Major pivots:
- Continuous camera drift → reverted (unnatural on focused interactions)
- Sin/cos blob drift → epicyclic motion (much more varied paths)
- Quadratic ease-in → linear (preserved momentum between phases)
- Wavy pen underline → straight scaleX (cleaner for corporate aesthetic)
- 10s duration → 12s → 13s (transitions and tagline needed breathing room)
