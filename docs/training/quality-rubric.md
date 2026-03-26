# Animation Quality Rubric

Self-assessment framework for evaluating animation quality. Use this before presenting work for critique to catch obvious issues early.

---

## Scoring Scale

- **1 — Amateur:** Looks like a first attempt. Mechanical, flat, no personality.
- **2 — Functional:** Moves correctly but feels generic. Template motion.
- **3 — Competent:** Smooth and intentional. A viewer wouldn't complain but wouldn't notice either.
- **4 — Professional:** Polished, purposeful, personality in the motion. Feels like a real product ad.
- **5 — Exceptional:** Motion tells a story. Every frame is considered. Would win awards.

Target: consistently hit 4 across all criteria.

---

## Criteria

### 1. Timing & Pacing

How elements are distributed across time.

| Score | Description |
|-------|-------------|
| 1 | Everything enters at the same time or with uniform stagger. Dead frames between actions. |
| 2 | Basic stagger exists but is mechanical (fixed interval, e.g. every 8 frames). |
| 3 | Stagger varies by element importance. No dead frames. Scenes feel paced. |
| 4 | Stagger creates rhythm. Important elements get breathing room. Supporting elements layer in naturally. Overlap between scenes is intentional. |
| 5 | Timing creates emotional beats. Pauses are dramatic, not empty. The ad has musical pacing even without audio. |

**Amateur tells:**
- All staggers are the same interval (e.g. `i * 8` for every list)
- Long gaps where nothing moves
- Exit animations missing entirely (elements just vanish at sequence boundary)

**Professional markers:**
- Hero element gets 2-3x the stagger gap of supporting elements
- Overlapping sequences create smooth scene flow (no black frames between)
- Exits begin before the next scene's entrances complete

---

### 2. Physics & Spring Feel

How spring configs create motion personality.

| Score | Description |
|-------|-------------|
| 1 | One spring config for everything. Motion feels like a jQuery animation from 2010. |
| 2 | 2-3 presets exist but are applied without consideration. Damping is always safe (20+). |
| 3 | Different presets for text vs UI vs hero. Springs feel appropriate for element weight. |
| 4 | Springs match element semantics (heavy things feel heavy, light things feel light). Intentional underdamping for impact moments. Overshoot is a design choice, not an accident. |
| 5 | Springs create character. You can feel the "brand personality" in the motion alone. |

**Amateur tells:**
- Damping always > 20 (nothing ever bounces — feels sterile)
- Mass is always 0.8-1.0 (no variation in perceived weight)
- Stiffness doesn't vary by more than 40 across the entire ad
- Every element uses the same preset

**Professional markers:**
- Hero/impact moments use lower damping (12-16) for visible overshoot
- Small detail elements use higher stiffness + lower mass (snappy, lightweight)
- Background/ambient elements use lower stiffness + higher mass (slow, heavy)
- At least 4-5 distinct spring feels per ad

---

### 3. Choreography & Relationships

How elements relate to each other during motion.

| Score | Description |
|-------|-------------|
| 1 | Every element animates independently. No awareness of neighbors. |
| 2 | Basic parent-child relationships (container enters, then children). |
| 3 | Elements anticipate and react to each other. Leader-follower patterns. |
| 4 | Motion tells a spatial story — elements emerge from, orbit around, or flow into each other. Cause and effect is visible. |
| 5 | Choreography creates narrative. Motion reveals meaning (e.g., plant grows FROM the checkbox, not just NEAR it). |

**Amateur tells:**
- Cards appear independently in a grid (no wave, no cascade direction)
- Text appears separately from its container
- Elements animate on a flat plane with no depth relationship

**Professional markers:**
- Entrance direction communicates origin (slide from left = coming from previous, slide up = emerging)
- Stagger direction matches reading order or visual flow
- Parent elements partially animate before children begin
- Overlapping element motion creates depth (front elements lead, back follows)

---

### 4. Secondary Motion & Polish

Follow-through, ambient movement, micro-details.

| Score | Description |
|-------|-------------|
| 1 | Elements move to position and stop. Static after entrance. |
| 2 | Basic glow or shadow exists but is static. |
| 3 | Subtle breathing/pulsing on ambient elements. Glows respond to state. |
| 4 | Overshoot creates follow-through. Elements settle with personality. Ambient motion uses multiple frequencies (not a single sine wave). |
| 5 | Motion has texture — you can feel weight, air resistance, elasticity. Details reward close viewing. |

**Amateur tells:**
- Single-frequency sine for all breathing (`Math.sin(frame * 0.05)`)
- No motion after initial entrance — scene becomes a static slide
- Glow intensity is constant
- No transform-origin consideration (everything scales from center)

**Professional markers:**
- Dual-frequency breathing: `sin(f * 0.03) * 0.6 + sin(f * 0.07) * 0.4`
- Elements continue subtle movement after entrance (drift, breathe, pulse)
- Transform origins match physical anchor points (bottom for growth, center for emphasis)
- Shadow/glow intensity varies with element state or time

---

### 5. Transitions & Scene Flow

How scenes connect to each other.

| Score | Description |
|-------|-------------|
| 1 | Hard cuts between scenes. No exit animations. |
| 2 | Fade-to-black between scenes. Generic, safe, boring. |
| 3 | Overlap timing so exits and entrances coexist briefly. |
| 4 | Element-driven transitions — an element from scene N morphs into or spawns scene N+1. Momentum carries across the cut. |
| 5 | Scenes feel like chapters of one continuous motion, not separate slides stitched together. |

**Amateur tells:**
- `SceneFade` with default settings on every scene
- No overlap between `<Sequence>` blocks
- Scenes are completely independent — could be reordered with no impact

**Professional markers:**
- Sequence overlap of 5-15 frames for smooth handoff
- At least one element-driven transition per ad (wipe, morph, shared element)
- Exit animations mirror or invert the entrance approach
- Camera/scale continuity between scenes (zoom doesn't reset to 1.0 between scenes)

---

### 6. Visual Depth & Layering

Spatial relationships and perceived depth.

| Score | Description |
|-------|-------------|
| 1 | Everything on one flat plane. No shadows, no overlap, no parallax. |
| 2 | Basic box-shadow exists. Elements are layered in z-order. |
| 3 | Depth communicated through blur, scale, and opacity differences between layers. |
| 4 | Parallax or differential motion creates perceived depth. Background moves differently than foreground. Glow/shadow responds to depth position. |
| 5 | Scene has atmosphere — elements at different depths interact with light differently. |

**Amateur tells:**
- All elements at the same scale and opacity regardless of importance
- Shadows are uniform (`0 8px 32px rgba(0,0,0,0.1)` everywhere)
- No blur differentiation between foreground and background

**Professional markers:**
- Background elements: lower contrast, subtle blur, slower motion
- Foreground elements: sharp, saturated, faster/snappier motion
- Shadow intensity and spread vary by element elevation
- At least 2-3 distinct depth planes per scene

---

## Quick Self-Check (Before Presenting)

Before sharing animation output for critique, score each criterion 1-5 and total:

| Criterion | Score |
|-----------|-------|
| Timing & Pacing | /5 |
| Physics & Spring Feel | /5 |
| Choreography & Relationships | /5 |
| Secondary Motion & Polish | /5 |
| Transitions & Scene Flow | /5 |
| Visual Depth & Layering | /5 |
| **Total** | **/30** |

- Below 18: Don't present — fix the obvious issues first
- 18-23: Functional but needs polish — present for targeted feedback
- 24-27: Professional quality — present for refinement
- 28+: Exceptional — ready for production
