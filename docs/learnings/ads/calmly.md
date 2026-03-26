# CalmlyAd — Chaos-to-Calm Narrative Ad

**Composition:** `calmly-v1`
**Format:** 16:9 4K (3840×2160), 13s (390 frames @ 30fps)
**Category:** saas
**Profile:** dark-tech
**Scenes:** S1 Chaos (kinetic typography) → S2 Click (vortex transition) → S3 Calm (dashboard + tagline)

Most iterated ad — iterative development log captured extensive technique insights.
[see: docs/learnings/ARCHIVE.md §3700–§3877 for full detail]

---

## What Worked

1. **Kinetic Typography Cascade** — per-word entry from different directions with unique springs. Conveyed "chaos" effectively.
2. **SVG Envelope Component** — narrative prop for email/inbox concepts
3. **Epicyclic Drift** — smooth, varied organic motion for floating blobs [RECIPE: docs/recipes/motion/epicyclic-drift.md]
4. **Dynamic Camera Focus** — transformOrigin tracking a moving element [RECIPE: docs/recipes/camera/dynamic-camera-focus.md]
5. **Layered Camera Stack** — drift + tilt + punch + vignette on one transform
6. **4-Beat Tagline** — word → word → geometric accent → punctuation drop [RECIPE: docs/recipes/text/four-beat-tagline.md]
7. **Narrative Drag Interaction** — cursor + floating card → dashboard integration [RECIPE: docs/recipes/interaction/narrative-drag-interaction.md]
8. **Coast Phase** — momentum preservation between animation phases
9. **Goo Filter Metaballs** — SVG feGaussianBlur + feColorMatrix for organic blob merging

---

## What Didn't Work

1. **Continuous drift applied to everything** — background drifted with foreground, destroying depth.
2. **Dashboard breathing animation too strong** — scale 1.0→1.02 was noticeable and distracting.
3. **Scale overshoot on dashboard** — 1.0→1.06 entrance overshot and clipped edges.
4. **Sine/Cosine blob movement** — Lissajous figures all look similar. Replaced with epicyclic drift.
5. **Quadratic ease-in for drift start** — created visible ~10 frame stall. Linear ease-in is correct for momentum preservation.
6. **Instant blob spawning/despawning** — most frequently reported visual glitch (~5 reports). Led to `animation-fluidity.mdc` rule.
7. **"Pen-drawn" wavy underline** — looked messy in corporate context. Clean geometric animations (straight line + `scaleX`) are better.
8. **Text overlap** — words entering from different directions need 30-50% more spacing. Test at peak overshoot frame.

---

## Act Duration Ratios

- Act 1 (Chaos): 90f / 3.0s — 23%
- Act 2 (Transition): 130f / 4.3s — 33%
- Act 3 (Calm + CTA): 170f / 5.7s — 44%

Key: Act 2 was originally 2.3s — doubled to 4.3s. Complex transitions need at least 4 seconds.

---

## Reusable Patterns Extracted

All 10 patterns from CalmlyAd are now captured as recipes. See `docs/recipes/` for:
- `motion/epicyclic-drift.md`
- `camera/dynamic-camera-focus.md`
- `text/four-beat-tagline.md`
- `text/kinetic-typography-cascade.md`
- `interaction/narrative-drag-interaction.md`
- `transitions/vortex-convergence.md`
