# GreenTask — Storyboard

**Strategy:** `docs/ads/green-task/strategy.md`
**Angle:** Transformation — productive to purposeful
**Tagline:** "Get things done, greenly."

---

## Format & Timing

| Property | Value |
|----------|-------|
| Aspect ratio | 16:9 |
| Resolution | 3840 × 2160 (4K) |
| Duration | 21 seconds |
| Frames | 630 @ 30fps |
| Scene count | 6 |
| Background | Light — #FAFDF7 (warm off-white) |
| Style profile | snappy-saas |
| Target BPM | 120 |
| Category | saas |
| Subcategories | text-animation, ui-elements, data-viz |

## Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| Background | #FAFDF7 | Primary background — warm off-white |
| Surface | #FFFFFF | Cards, panels, dashboard chrome |
| Accent | #22C55E | Primary green — buttons, eco-indicators, progress |
| Accent 2 | #3B82F6 | Sky blue — charts, secondary data highlights |
| Text | #065F46 | Deep forest green — headlines, brand text |
| Text muted | #6B7280 | Secondary text, labels, timestamps |
| Success | #10B981 | Completed tasks, positive eco-metrics |
| Warning | #F59E0B | Challenge deadlines, attention elements |

---

## Scene Breakdown

### S1 — Hook (0f–95f, 3.2s)

**Text on screen:**
> "What if your to-do list"
> "could save the planet?"

**Visual components:**
- **Two headline rows:** Line 1 "What if your to-do list" in deep forest green. Line 2 "could save the planet?" with "save the planet?" in primary green accent.
  Recipe: `word-by-word-tagline` — staggered word reveal, 10f apart
  → WordLine (primitive) × 2

- **Soft radial glow:** A large, barely-visible green radial gradient centered behind the text. 800px radius, 0.04 opacity.
  Recipe: (ambient background, sine-wave breathing)
  → (inline ambient glow — minimal, not a novel component)

**Choreography:**
1. Line 1 words enter one by one left-to-right, 10f stagger (frame 6, 16, 26, 36, 46)
2. Line 2 begins at frame 38 — slight overlap with line 1's tail
3. "save the planet?" words are green (#22C55E), rest is forest (#065F46)
4. Radial glow breathes gently behind (sin wave, nearly imperceptible)
5. Exit: all text fades down over 10f

**Emotional beat:** Curiosity — "Wait, how is that possible?"

**Transition out:** Hard cut (snappy-saas default)

---

### S2 — The Gap (88f–205f, 3.9s)

**Text on screen:**
> "You check tasks off."
> "But do you see the impact?"

**Visual components:**
- **Headline text (2 lines):** "You check tasks off." in forest green, weight 700. "But do you see the impact?" in muted gray, weight 500.
  Recipe: `blur-scale-reveal` — spring-driven blur+scale entrance
  → BlurWord (primitive) × 2 rows

- **Animated task checklist (5 items):** A clean task list on a white card. Tasks like "Review Q3 report", "Schedule team standup", "Update project brief", "Reply to client email", "Finalize budget draft". Each checks off in sequence with a green checkmark drawing on — but the list feels incomplete, purely functional.
  Recipe: `staggered-list` — 12f stagger per item, slide from left
  → TaskChecklist (novel) — white card with animated check-offs

**Choreography:**
1. Headline line 1 blur-reveals at frame 6
2. Headline line 2 blur-reveals at frame 18
3. Task list card enters from right (spring translateX 400→0) at frame 20
4. Tasks check off one by one starting frame 30, every 12f
5. After all tasks checked, a subtle "?" pulse appears where impact data would be — empty space
6. Exit: card and text fade down over 10f

**Emotional beat:** Recognition — "That's my workflow, but something's missing"

**Transition out:** Diagonal slash clip-path (recipe: `clip-path-transitions` / diagonal) — sweeping away the old way

---

### S3 — The Reveal (195f–330f, 4.5s)

**Text on screen:**
> "GreenTask"
> "Productivity that cares."

**Visual components:**
- **Brand name slam:** "GreenTask" at 180px, weight 800, deep forest green. Enters with blur-scale-reveal.
  Recipe: `blur-scale-reveal`
  → BlurWord (primitive)

- **Tagline:** "Productivity that cares." at 64px, muted gray, enters word-by-word below the brand name.
  Recipe: `word-by-word-tagline`
  → WordLine (primitive)

- **Dashboard shell entrance:** After the brand name lands, a full DashboardShell slides up from below. Nav bar shows "GreenTask" brand name, nav items: "Tasks", "Dashboard", "Challenges", "Teams". Active on "Dashboard". Surface color white, accent green.
  Recipe: spring from below (translateY 400→0)
  → DashboardShell (primitive)

- **Inside the dashboard — split view:** Left side: a mini task board (3 columns: To Do, In Progress, Done — 2 cards each). Right side: a sustainability widget showing a ProgressRing eco-score and a "CO₂ Saved" counter.
  → EcoTaskBoard (novel) — simplified task board with green eco-badges on completed tasks
  → CarbonWidget (novel) — counter + progress ring combo

**Choreography:**
1. "GreenTask" blur-reveals at frame 0 (of this scene), centered at 35% height
2. Tagline words enter at frame 12, staggered 8f apart
3. Both text elements begin de-emphasis at frame 40 (opacity→0.3, slight scale-down)
4. DashboardShell springs up from below at frame 35
5. Inside dashboard: task board columns cascade left-to-right, 8f stagger (frame 55, 63, 71)
6. Right-side sustainability widget fades in at frame 65
7. ProgressRing arc animates to 73% over frames 70–100
8. Carbon counter climbs from 0 to "1.2t" over frames 72–105
9. Subtle camera drift begins at frame 50 (scale 1.0→1.02)

**Emotional beat:** Discovery — "Oh, it's a real product. And it looks great."

**Transition out:** Hard cut

---

### S4 — Impact Dashboard (320f–450f, 4.3s)

**Text on screen:**
> "Track your impact"
> "in real time."

**Visual components:**
- **Headline (2 lines):** "Track your impact" weight 700 forest green, "in real time." weight 500 muted gray. Positioned top-left editorial style.
  Recipe: `blur-scale-reveal`
  → BlurWord (primitive)

- **Three impact stat cards (hero row):** Centered horizontally, large. Each card shows an icon area, a large animated number, a label, and a mini trend line.
  - Card 1: "2.4 tonnes" / "CO₂ Saved" / green glow
  - Card 2: "847 kWh" / "Energy Reduced" / blue glow
  - Card 3: "156 kg" / "Waste Diverted" / green glow
  Recipe: `glow-card-entrance` — breathing glow shadows, inner radial light
  → GlowCard (primitive) × 3, with adapted bg gradients for light palette: `["#E8FFF0", "#D1FAE5"]` greens and `["#EFF6FF", "#DBEAFE"]` blues

- **Animated counters inside cards:** Numbers climb from 0 to their final value over 40 frames.
  Recipe: `progress-bar-demo` (counter pattern) — spring-driven count-up
  → ImpactCounter (novel) — animated number with unit suffix and trend sparkline

- **Eco-score ring (right side):** Large ProgressRing showing team eco-score at 87%.
  Recipe: built-in ProgressRing
  → ProgressRing (primitive)

**Choreography:**
1. Headline line 1 blur-reveals at frame 0
2. Headline line 2 at frame 10
3. Card 1 glow-enters at frame 14, card 2 at frame 22, card 3 at frame 30 (8f stagger)
4. Counters inside cards begin climbing at frame 20 (staggered with card entrances)
5. ProgressRing enters at frame 36, arc animates to 87% over 30 frames
6. All card glows breathe continuously (sin wave)
7. Camera drift continues from S3 (scale 1.02→1.035)
8. Exit: elements fade down over 10f

**Emotional beat:** Proof — "These are real numbers. This is measurable."

**Transition out:** Hard cut

---

### S5 — Gamification (440f–555f, 3.8s)

**Text on screen:**
> "Compete. Challenge. Lead."

**Visual components:**
- **Headline:** "Compete. Challenge. Lead." — three words, each a different weight. "Compete." in green, "Challenge." in blue, "Lead." in forest green. Large, centered.
  Recipe: `word-by-word-tagline` — 12f stagger
  → WordLine (primitive)

- **Team leaderboard card:** A white surface card showing a ranked list of 4 team members with names, eco-scores, and green progress bars. Avatars are colored circles with initials.
  - #1: "Sarah K." — 2,340 pts — 92% bar
  - #2: "James L." — 2,180 pts — 86% bar
  - #3: "Priya M." — 1,960 pts — 78% bar
  - #4: "You" — 1,840 pts — 73% bar (highlighted with accent border)
  Recipe: `staggered-list` — rows cascade 10f apart
  → TeamLeaderboard (novel) — ranked list with animated progress bars

- **Achievement badges (3):** Small pill-shaped badges floating beside the leaderboard. "🌱 First Green Week", "⚡ Energy Saver", "🏆 Team Champion". Enter with bounce-pop.
  Recipe: spring entrance with slight bounce (damping 18)
  → EcoBadge (novel) — pill badge with icon + label

**Choreography:**
1. Headline words enter at frame 0, 12, 24 (12f stagger)
2. Leaderboard card springs up from below at frame 16 (translateY 200→0)
3. Leaderboard rows cascade starting frame 26, 10f apart
4. Progress bars animate width from 0→target% starting frame 32
5. "You" row pulses with green border glow at frame 62
6. Achievement badges pop in at frames 50, 58, 66 (8f stagger), slight overshoot spring
7. Exit: elements fade down

**Emotional beat:** Excitement — "I want to compete. I want to see my score."

**Transition out:** Hard cut

---

### S6 — CTA (548f–630f, 2.7s)

**Text on screen:**
> "GreenTask"
> "Get things done, greenly."
> "Start free →"

**Visual components:**
- **Background shift:** Scene background transitions from warm off-white (#FAFDF7) to deep forest green (#065F46). This tonal shift signals resolution and brand confidence.
  Recipe: (background color transition, easeInOut3)

- **Brand name:** "GreenTask" at 160px, weight 800, white text.
  Recipe: `blur-scale-reveal`
  → BlurWord (primitive)

- **Tagline:** "Get things done, greenly." at 72px, weight 500, soft leaf green (#A7F3D0).
  Recipe: `word-by-word-tagline` — 8f stagger
  → WordLine (primitive)

- **CTA button:** Pill-shaped button "Start free →", white text on primary green (#22C55E) background. Breathing glow shadow in green.
  Recipe: spring scale entrance (0.9→1.0) + breathing glow
  → CTAButton (novel) — pill with glow pulse

- **Accent glow:** Large radial glow behind the brand name, primary green at 0.08 opacity, slow breathing.
  Recipe: (ambient glow, sine-wave)

**Choreography:**
1. Background color shifts from #FAFDF7 to #065F46 over first 12f (easeInOut3)
2. "GreenTask" blur-reveals at frame 6, large and centered
3. Tagline words enter at frame 16, staggered 8f apart
4. CTA button springs in at frame 36 (scale 0.9→1.0, damping 20)
5. CTA button begins breathing glow at frame 44 (sin wave, subtle)
6. Hold until end — confident close

**Emotional beat:** Motivated — "I'm ready to try this."

---

## Pacing Notes

- **Acceleration:** S1→S2 establishes the problem quickly. S3 is the longest scene — the reveal gets breathing room to land.
- **Breathing room:** S3's dashboard entrance has a deliberate hold after the brand name to let it sink in before the UI appears.
- **Climax:** S4 is the peak — three impact cards with animated counters is the proof moment. This is where the viewer is convinced.

## Visual Continuity

- **Green threading:** Primary green (#22C55E) appears in every scene — accent words (S1), checkmarks (S2), eco-badges and dashboard (S3), card glows and counters (S4), badges and progress bars (S5), CTA button and glow (S6).
- **Typography consistency:** Deep forest green (#065F46) for all headlines. Muted gray (#6B7280) for all supporting text. Never deviates.
- **Surface evolution:** Scenes 1–5 use warm off-white background. Scene 6 shifts to deep forest green for the CTA — a confident tonal resolution.
- **Dashboard persistence:** The dashboard UI introduced in S3 provides the visual language for S4 and S5's cards and data.

## CTA Specification

- **Brand name:** "GreenTask" at 160px, weight 800, white (#FFFFFF)
- **Action:** "Start free →" in a pill button, white text on #22C55E, 48px, weight 600
- **Tagline echo:** "Get things done, greenly." at 72px, weight 500, #A7F3D0
- **Trust line:** None — the ad builds trust through data visualization, not text claims

## Component → Recipe → Source Mapping

```
Storyboard component        → Recipe                    → React component        → Source
─────────────────────────────────────────────────────────────────────────────────────────────
"scene wrapper"              → (built-in)                → SceneFade              → PRIMITIVE
"hook headline rows"         → word-by-word-tagline      → WordLine               → PRIMITIVE
"headline text entrances"    → blur-scale-reveal         → BlurWord               → PRIMITIVE
"brand name slam"            → blur-scale-reveal         → BlurWord               → PRIMITIVE
"tagline word-by-word"       → word-by-word-tagline      → WordLine               → PRIMITIVE
"dashboard frame"            → spring from below         → DashboardShell         → PRIMITIVE
"3 impact stat cards"        → glow-card-entrance        → GlowCard               → PRIMITIVE
"eco-score progress ring"    → (built-in)                → ProgressRing           → PRIMITIVE
"S2→S3 diagonal transition"  → clip-path-transitions     → (inline clipPath)      → NOVEL (build)
"animated task checklist"    → staggered-list            → TaskChecklist          → NOVEL (build)
"dashboard eco-task board"   → staggered-list            → EcoTaskBoard           → NOVEL (build)
"carbon widget + counter"    → progress-bar-demo         → CarbonWidget           → NOVEL (build)
"animated impact counter"    → progress-bar-demo         → ImpactCounter          → NOVEL (build)
"team leaderboard"           → staggered-list            → TeamLeaderboard        → NOVEL (build)
"eco achievement badges"     → spring entrance           → EcoBadge               → NOVEL (build)
"CTA pill button + glow"     → spring scale + breathing  → CTAButton              → NOVEL (build)
"camera drift"               → camera-wrapper            → (inline transform)     → NOVEL (build)
```

Recipes used (8 distinct): blur-scale-reveal, word-by-word-tagline, glow-card-entrance, progress-bar-demo, staggered-list, clip-path-transitions, camera-wrapper, depth-deemphasis
