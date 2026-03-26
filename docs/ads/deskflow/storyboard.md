# Deskflow — Storyboard

**Strategy:** `docs/ads/deskflow/strategy.md`
**Angle:** The Invisible Bleed — customers leave and you don't even know why
**Tagline:** "Stop the silent churn."

---

## Format & Timing

| Property | Value |
|----------|-------|
| Aspect ratio | 16:9 |
| Resolution | 3840 × 2160 (4K) |
| Duration | 20 seconds |
| Frames | 600 @ 30fps |
| Scene count | 7 |
| Background | Deep slate — #0B1120 |
| Style profile | snappy-saas |
| Target BPM | 120 |
| Category | saas |
| Subcategories | text-animation, ui-elements, data-viz, transitions, background-effects |

## Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | #0B1120 | Deep slate primary background |
| Surface | #162032 | Cards, panels |
| Surface Hi | #1E2D45 | Highlighted states |
| Accent | #0EA5E9 | Brand teal — solution state, CTAs |
| Warning | #F59E0B | Amber — missed tickets, the "bleed" |
| Danger | #EF4444 | Red — churn, critical |
| Text | #F1F5F9 | Primary text |
| Text muted | #94A3B8 | Labels, timestamps |

---

## Scene Breakdown

### S1 — The Accusation (0f–95f, 3.2s)

**Text on screen:**
> "A customer emailed you 3 days ago."
> "You never replied."

**Visual components:**
- **Email mockup (centred):** A single email card showing "Subject: Quick question about billing" from "Sarah M." with a timestamp that animates from "3 days ago" in grey → amber → pulsing red. The email card itself slowly fades to 30% opacity as if it's being forgotten.
  Recipe: `glow-card-entrance` for the initial card entrance
  → EmailGhost (novel) — the aging/fading behavior is story-specific
- **Ambient glow (top-right):** Warm amber glow orb, barely visible, sets the mood
  Recipe: (built-in breathing)
  → GlowOrb (primitive)

**Choreography:**
1. Line 1 text enters (blur-scale reveal, words stagger 5f apart)
2. Email card scales in from below at frame 12 (glow-card entrance)
3. Timestamp starts grey, shifts to amber at frame 30, pulses red at frame 50
4. Line 2 text enters at frame 45 — "You never replied." — heavier weight, warning colour
5. Email card opacity fades to 30% from frame 50–80 (the "forgetting")
6. Amber glow orb fades in from frame 20

**Emotional beat:** Gut-punch recognition. "Wait — have I done this?"

**Transition out:** Cross-fade 8f overlap with S2

---

### S2 — The Silent Exit (95f–195f, 3.3s)

**Text on screen:**
> "They didn't complain."
> "They just left."

**Visual components:**
- **Customer cards (3 cards stacked vertically):** Each card shows a customer name, plan type, and MRR value (e.g., "Marcus T. · Pro · $149/mo"). One by one, each card slides right and fades to nothing — a ghost trail left behind. The MRR values are in danger red.
  Recipe: `staggered-list` for entrance, custom slide-out for exit
  → ChurnCard (novel) — the ghost-trail exit is story-specific
- **Revenue counter (top-right):** A large number showing monthly revenue, counting DOWN as each customer leaves (e.g., $12,400 → $12,251 → $12,102).
  Recipe: `progress-bar-demo` (inverted — counting down)
  → RevenueCounter (novel) — inverted counter is story-specific
- **Ambient glow (left):** Red-tinted, low opacity, growing as churn accumulates
  Recipe: (built-in breathing)
  → GlowOrb (primitive)

**Choreography:**
1. Text line 1 enters (blur-scale reveal)
2. Customer cards cascade in from left, 8f stagger (staggered-list)
3. Text line 2 enters at frame 20 — "They just left."
4. First card slides right and ghosts out at frame 30
5. Revenue counter ticks down simultaneously
6. Second card exits at frame 45, third at frame 60
7. Red glow orb grows in opacity as cards disappear
8. Exit: remaining elements fade down

**Emotional beat:** Dread. The silent bleed visualised — money leaving without a sound.

**Transition out:** Iris close (recipe: `clip-path-transitions` / iris) → S3

---

### S3 — The Visibility Gap (195f–290f, 3.2s)

**Text on screen:**
> "You think response times are fine."
> "They're 14 hours."

**Visual components:**
- **Perception gauge (left half):** A stylised meter showing "Team Perception" with a comfortable green indicator at "~2 hours" — a naive, self-assured view. Clean, calm, green tint.
  → PerceptionGauge (novel) — the split perception/reality concept is story-specific
- **Reality gauge (right half):** The same meter style but showing "Actual Data" with a harsh amber/red indicator slamming to "14h 22m". Harsh, data-driven, amber/red tint.
  → PerceptionGauge (novel) — same component, different data and colour
- **Dividing line (centre):** A vertical line that draws on to separate the two halves.
  Recipe: `svg-connector-draw` (straight vertical variant)
  → AnimatedConnector (primitive)

**Choreography:**
1. Left gauge fades in with blur-scale (comfortable, green — "~2 hours")
2. Vertical divider draws on from top to bottom at frame 15
3. Text line 1 enters at frame 8 — "You think response times are fine."
4. Right gauge slams in at frame 25 — fast spring, harsh amber, "14h 22m"
5. Text line 2 enters at frame 30 — "They're 14 hours." — large, warning colour
6. Left gauge dims to 40% opacity (depth-deemphasis) — the comfortable lie fades
7. Exit: both gauges fade down

**Emotional beat:** Confrontation. The gap between belief and reality, visualised.

**Transition out:** Cross-fade 8f overlap with S4

---

### S4 — The Control Shift (290f–400f, 3.7s)

**Text on screen:**
> "Every ticket. Owned."
> "Every SLA. Tracked."

**Visual components:**
- **Deskflow inbox UI:** A full dashboard shell showing the Deskflow product — nav bar with "Deskflow" brand, tabs (Inbox, Tickets, Analytics, Settings). Inside: 4 ticket rows, each with an owner avatar circle, subject line, SLA countdown badge (e.g., "Reply in 2h 14m"), and a status pill (Open, In Progress, Waiting, Resolved).
  Recipe: `glow-card-entrance` for the overall panel
  → DashboardShell (primitive) for the chrome
  → TicketRow (novel) — the ticket row with SLA timer is story-specific
- **SVG connectors (between tickets):** Thin lines connecting the "Resolved" ticket to a "CSAT sent" indicator, showing the automated flow.
  Recipe: `svg-connector-draw`
  → AnimatedConnector (primitive)
- **Ambient glow (behind dashboard):** Teal-tinted, solution-state atmosphere
  Recipe: (built-in breathing)
  → GlowOrb (primitive)

**Choreography:**
1. Teal glow orb fades in (background atmosphere)
2. DashboardShell chrome slides in from top at frame 4
3. Text line 1 enters (blur-scale) at frame 6
4. Ticket rows cascade top-to-bottom, 6f stagger, starting frame 12
5. SLA badges animate their countdown text one by one
6. Text line 2 enters at frame 30
7. SVG connector draws from resolved ticket to CSAT indicator at frame 40
8. Subtle camera drift begins at frame 25 (scale 1.0 → 1.015)

**Emotional beat:** Relief. Order from chaos. "This is what it looks like when it works."

**Transition out:** Cross-fade 8f overlap with S5

---

### S5 — The Proof (400f–500f, 3.3s)

**Text on screen:**
> "See everything. Fix anything."

**Visual components:**
- **Metrics dashboard (3 cards across):** Three GlowCards showing live metrics:
  1. "CSAT" — ProgressRing animating to 94%, teal accent
  2. "Avg First Reply" — large "8 min" with a trend arrow (↓ from 14h), success green
  3. "Resolution Rate" — ProgressRing animating to 97%, teal accent
  Recipe: `glow-card-entrance` for cards, `progress-bar-demo` for rings/counters
  → GlowCard (primitive), ProgressRing (primitive)
  → TrendArrow (novel) — animated trend indicator with before/after is story-specific
- **Ambient glow orbs (2):** Teal-tinted, solution confidence
  → GlowOrb (primitive)

**Choreography:**
1. Text enters (blur-scale reveal)
2. Three GlowCards cascade left-to-right, 8f stagger, starting frame 10
3. ProgressRings begin animating at frame 18 (after cards are visible)
4. "8 min" counter animates up simultaneously
5. TrendArrow on middle card draws on at frame 28 (after the number lands)
6. Glow orbs breathe gently in background throughout

**Emotional beat:** Confidence. Hard proof that the system works — numbers, not promises.

**Transition out:** Cross-fade 8f overlap with S6

---

### S6 — Tagline (500f–555f, 1.8s)

**Text on screen:**
> "Stop the silent churn."

**Visual components:**
- **Tagline (centred):** Large, staggered word-by-word reveal. "Stop" and "silent" and "churn" in accent teal, "the" in muted text. 180px, weight 700.
  Recipe: `word-by-word-tagline`
  → WordLine (primitive)
- **Ambient glow (centred):** Subtle teal pulse behind text
  → GlowOrb (primitive)

**Choreography:**
1. Background glow fades in
2. Words stagger in: "Stop" → "the" → "silent" → "churn." at 5f intervals
3. Brief hold (15f) for the message to land
4. Exit: text fades down

**Emotional beat:** Resolution. The problem has a name and a solution.

**Transition out:** Cross-fade 8f overlap with S7

---

### S7 — CTA (555f–600f, 1.5s)

**Text on screen:**
> "Deskflow"
> "Start your free trial"
> "deskflow.io"

**Visual components:**
- **Brand name (centred, large):** "Deskflow" at 200px, weight 800, teal accent
  Recipe: `blur-scale-reveal`
  → BlurWord (primitive)
- **CTA button:** "Start your free trial" — pill-shaped, teal background, white text, subtle pulse
  Recipe: (spring scale-in + pulse)
  → BlurWord (primitive) for the text, inline for the pill shape
- **URL (below button):** "deskflow.io" at 48px, muted text
  Recipe: `blur-scale-reveal`
  → BlurWord (primitive)

**Choreography:**
1. "Deskflow" enters (blur-scale reveal, 200px, teal)
2. CTA button scales in at frame 8 with subtle bounce
3. URL fades in at frame 14
4. CTA button pulse begins at frame 18 (gentle, not aggressive)

**Emotional beat:** Action. The viewer knows what to do.

---

## Pacing Notes

- **Acceleration:** S1→S2 builds urgency (accusation → consequence). S3 is the emotional peak — the confrontation.
- **Breathing room:** S4 is the longest scene (3.7s) — the product reveal needs time to feel real and trustworthy.
- **Climax:** S3 (The Visibility Gap) is the hinge — the moment the viewer sees the truth about their support quality.

## Visual Continuity

- **Amber threading:** Amber (#F59E0B) appears in S1 (aging timestamp), S2 (revenue counter), S3 (reality gauge) — it represents the "bleed." It disappears in S4+ when the solution takes over.
- **Teal threading:** Teal (#0EA5E9) appears first in S4 and dominates S5-S7 — it represents control and confidence. The palette literally shifts from warm warning to cool control.
- **Dashboard echoes:** The email mockup in S1 and the ticket inbox in S4 are visually related — same surface colours, same card radius — showing the "before" and "after" of the same inbox.

## CTA Specification

- **Brand name:** "Deskflow" — 200px, weight 800, teal (#0EA5E9)
- **Action:** "Start your free trial" — 64px, weight 600, white text on teal pill
- **URL:** "deskflow.io" — 48px, weight 400, muted (#94A3B8)
- **Trust line:** None — the proof in S5 serves as trust

## Novel Components Summary

| Component | Scene | What it does |
|-----------|-------|-------------|
| EmailGhost | S1 | Email card that ages — timestamp turns amber → red, card fades to 30% |
| ChurnCard | S2 | Customer card that slides out with a ghost trail, representing silent churn |
| RevenueCounter | S2 | Inverted animated counter — counts DOWN as customers leave |
| PerceptionGauge | S3 | Split gauge showing comfortable perception vs harsh reality data |
| TicketRow | S4 | Helpdesk ticket row with owner avatar, SLA timer badge, status pill |
| TrendArrow | S5 | Animated trend indicator showing improvement (14h → 8min) |
