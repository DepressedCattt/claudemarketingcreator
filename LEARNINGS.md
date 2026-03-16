# Ad Creation Learnings

Tracking what works and what doesn't across each round of feedback.
Updated after every critique session.

---

## Round 1 — Baseline Test

**Ads produced:**
| ID | Brand | Format | Style | Key Techniques |
|---|---|---|---|---|
| `novaskin-v1` | NovaSkin (Skincare) | 9:16 | Warm luxury, slow pacing | Floating serum bottle, petal particles, italic serif, mauve/gold palette |
| `flowdesk-v1` | FlowDesk (Productivity SaaS) | 1:1 | Dark technical, medium pacing | Typing reveal, grid background, green/navy, dashboard card reveals |
| `trailblaze-v1` | TrailBlaze (Running App) | 16:9 | High energy, fast pacing | GPS route draw, HR wave, stat counters, orange/forest green |

**Hypotheses going in:**
- Luxury/slow pacing feels premium but might lose attention early
- Dark mode ads may feel more "tech" but less immediately visually grabbing
- Kinetic text with big bold statements tends to be the most memorable scene in any ad
- 16:9 landscape is unusual for social — could feel cinematic or could feel wrong for the platform
- Particle systems and floating elements add depth but risk looking "busy"
- The before/after or problem→solution structure is reliable but predictable

**Feedback received:** Round 1 complete.

### What Worked
- Strong motion and animation quality across all three
- Color palettes were well-chosen and complementary in all ads
- Kinetic text scenes consistently the strongest — bold pacing, good contrast
- Scene-level concepts were clear and on-brand per industry
- TrailBlaze route draw and metrics animations effectively communicated the product
- NovaSkin style/aesthetic and CTA were well received
- FlowDesk animations and pop-in physics were noted as good

### What Didn't Work
- **Screen space utilization** — recurring problem across ALL THREE ads. Elements too small, centered with large dead zones. Need to fill the frame aggressively.
- **FlowDesk felt "vibe-coded"** — generic dashboard UI, default-looking text, cliché SaaS widget styling. Needs a completely original visual concept, not just styled divs.
- **NovaSkin ingredient scene** — text too small, features not amplified enough. Each ingredient should feel like a hero moment, not a small card.

### Specific Notes Per Ad

**NovaSkin:**
- ✅ Style, animations, colors, CTA all good
- ❌ Scene 1: Bottle too small, ~half screen empty — needs to fill the frame
- ❌ Scene 2: Text too small, ingredients not impactful enough — "amplify the features"
- Fix: Much larger bottle + headline in Scene 1. Full-width, large ingredient heroes in Scene 2.

**FlowDesk:**
- ✅ Animations and pop-ins are good technically
- ❌ Looks "vibe-coded" — generic, unoriginal, cliché SaaS widgets
- ❌ Default text styling throughout
- Fix: Complete visual redesign. Original concept, not dashboard UI. Think editorial/abstract.

**TrailBlaze:**
- ✅ Scene 1 (Route): All good — animation, style, colors, concept
- ⚠️ Scene 2 (Metrics): Pop-ins good but ~50% dead space — stat cards too small for 16:9
- ✅ Scene 3 (Kinetic): Strong — colors, text, side animations work
- ⚠️ Scene 4 (CTA): Good colors/animations but poor screen utilization
- Fix: Scene 2 → fill full 1920x1080 with larger stat layout. Scene 4 → both sides much larger.

---

## Round 2 — Iteration (V2 fixes applied)

**Changes made based on feedback:**

| Ad | Scene | Change |
|---|---|---|
| TrailBlaze | Scene 2 (Metrics) | Replaced 4-card row with corner-anchored hero stats (210px Distance + 210px Pace), full-width HR wave at bottom |
| TrailBlaze | Scene 4 (CTA) | Left half: 180px "500K / RUNNERS" + subtext. Right half: large card filling the column |
| NovaSkin | Scene 1 (Hook) | Switched from centered layout to editorial split: text left, large bottle (300×510) right |
| NovaSkin | Scene 2 (Ingredients) | Replaced small offset cards with full-width 952px hero cards at 52px name font, 28px benefit |
| FlowDesk | All scenes | Complete redesign: new palette (soft lavender + deep indigo + hot pink), editorial word-slam, full-screen kanban, beat-driven stats |

**Feedback received (Round 3):**

### What Worked — Round 3
- **Brand V1 = best ad overall**: Word slam, split-screen two-sides, connection arc animation, dual CTA
- **Freelancer opening** (chaos wipe): Best hook — immediately engaging, great animation, good storytelling
- **Freelancer scene 2** (venue discovery cards): Shows how the app works clearly
- **Freelancer scene 3** (editorial trust: VERIFIED/2 MINUTES): Strong, good animations
- **Venue scene 3** (booking cards): Very good — "interactive" feel showing real value in action
- **Brand scene 2** (split screen): Space used well, good animations
- **Brand scene 3** (connection arc + popups): Most impressive — scissors/arc, space usage excellent
- **Venue scene 2** ($12,480 cost): Good visual concept

### What Didn't Work — Round 3
- **Venue hook too dark** — lighter colors work better for hooks (cream/pale blue preferred)
- **Venue opening text got clipped** — translateX animation + tight containers causes clipping
- **Venue hook not engaging** — statement is too flat, question-based hook would land better
- **Cost scene ($12,480) not engaging enough** — needs more dynamism, not just a static number
- **Chair SVG** — user still doesn't like it; avoid or significantly improve in future ads
- **Freelancer CTA labeled "Seek Fall"** — unclear what this is, likely rendering label issue

### Key Upgrade for Round 4 (30-second ads)
- **Light backgrounds for ALL hook scenes** — cream/pale blue, never dark as the opener
- **Question hooks beat statement hooks** — "WHAT IF YOUR QUIET DAYS PAID YOU?" > "YOUR CHAIRS SIT EMPTY."
- **No chair SVG** — replaced with other metaphors (booking cards, revenue counters, venue maps)
- **Fix text clipping** — use translateY (vertical reveal) instead of translateX to avoid edge clipping
- **Use top 5 proven elements**: chaos wipe, booking cards, word slam, split-screen, connection animation

---

## Round 3 — Shared Salon Product Ads (with real brand context)

**What changed vs Round 2:**
- Real product context provided (two-sided marketplace for salon industry)
- Full Shared Salon color palette maintained consistently across all three
- Designed for three distinct audiences: venue owners, freelancers, brand/both

**Ads created:**

| ID | Format | Concept | Key Design Decisions |
|---|---|---|---|
| `sharedsalon-venue-v1` | 9:16 | Venue owner — "empty chairs cost you $12,480/year" | Dark hook, $12,480 slam to full screen, 6 booking cards + monthly projection filling frame |
| `sharedsalon-freelancer-v1` | 16:9 | Freelancer — "stop chasing, start booking" | Chaos words swept by blue wipe, 3 full-height venue cards filling landscape, editorial trust moments |
| `sharedsalon-brand-v1` | 1:1 | Brand/marketplace — "two sides, one platform" | SHARED/SALON word slam, split dark/light halves, connection arc animation, dual CTA buttons |

**Design principles applied from learnings:**
- All scenes fill the 100% of the canvas at all times
- Typography: 160–240px for hero moments, 68–108px for headlines, 44px+ for supporting text
- No generic SaaS widgets — real booking data, real venue cards, real brand content
- Every scene has a signature motion: word slam, counter reveal, chaos wipe, split converge, arc animation
- Real Shared Salon product copy throughout (no placeholder text)

---

## Running Principles

*(Patterns that emerge across multiple rounds — these become the rules)*

### Motion Design
- **Word slams beat fades** — aggressive entry from edges (translateX ±100–300px) looks premium and intentional
- **Scale snap (easeSnap, power-5)** for cards and numbers — creates satisfying "click into place" feeling
- **Stagger entries** by 15–25 frames per element, never show everything at once
- **Something always moving** — ambient float, particle pulse, counter climbing. Static frames feel cheap.
- **Blue wipe/line reveal** is a strong transition mechanic — feels like a brand gesture

### Copy & Messaging
- **Problem first** — open with the pain (empty chair, chaos of finding spaces). Makes the solution feel earned.
- **Big numbers tell the story** — "$12,480/year" is more visceral than "you lose money". Show the scale.
- **Real data beats generic data** — "Jessica M. · Monday 9am · $95" feels real. "User booked" does not.
- **Per-audience precision** — venue owner copy and freelancer copy should never be the same. The pain points are different.

### Visual Composition
- **Focal clarity over pixel-filling** — the question is "where does the viewer's eye go?" not "is the canvas full?". Breathing room around a clear hero is premium. An unclear focal point with space everywhere is the error.
- **Hero element at 40–60% of frame height** — a number, a card list, a venue grid. Not a tiny icon.
- **Hook scene backgrounds** — light/cream/pale blue hooks tend to land better than dark openers. Dark backgrounds work well mid-ad for emphasis, but hooks benefit from brightness and contrast.
- **Typography IS the visual** in text-heavy scenes — set it big, set it bold, set it precisely
- **Split screens** for before/after or two-sided stories — cleaner and more readable than overlays

### Pacing & Timing
- **3s for problem, 4s for scale, 5.5s for solution** — problem scenes can be shorter than solution scenes
- **Give important numbers 4+ seconds** — $12,480 needs time to land before moving on
- **Scene 3 should always be the most information-dense** — by then the hook has worked, earn the detail
- **CTA at 2–3s** — short. People don't need to read the CTA for long if the ad was good.
- **Stated durations are NOT hard limits.** If a brief says "15 seconds", that is a target/guide, not a ceiling. Going to 18-22s for pacing reasons is always acceptable unless the user explicitly says "must stay within X seconds". Cramming scenes to hit a time target destroys quality — go over if the story needs it.

### What to Always Do
- Keep the brand color scheme locked (C.primary, C.text, C.secondary, C.accent always the same)
- Put real product use-cases in the content (real names, real amounts, real venue names)
- Use `easeSnap` (power-5) for punchy arrivals, `easeOut3` for smooth settles
- Fill the frame with the right amount of hierarchy — one hero, one secondary, one supporting
- Background glow (radial-gradient) makes scenes feel lit and premium

### What to Never Do
- Never use placeholder text ("Name", "Amount", "Title") in a finished ad
- Never stack all content in a centered column with empty sides
- Never show a feature card smaller than 300px wide — if it needs to be smaller, show fewer cards
- Never open on a light, empty background with small text — it reads as unfinished
- Never rely on opacity fade alone — always pair with a translateX, scale, or clip

---

## Reference Ad — `meridian-v1` ⭐ CLOSEST TO TARGET QUALITY

**Status: Approved as quality benchmark. Use this as the reference when building future ads.**

`meridian-v1` is the closest ad produced so far to the premium SaaS commercial target.
When building a new ad, open this composition first and ask: "does my ad feel like this?"

### What makes it work

**Palette — warm cream `#F9F6F1` + warm dark `#1C1917` + terracotta `#C2410C`**
The warm palette is differentiated from generic blue-on-white SaaS. It feels human and considered.
The terracotta accent is distinctive — not indigo (too common), not green (too generic).

**Scene 1 — Hook (pure typography, 3s)**
- Badge + two headline lines + rule + sub copy. Nothing else.
- `useCinematicTextReveal` on every line — drift + opacity + blur-resolve.
- Lines stagger 10–12 frames apart. Never all at once.
- The restraint is the quality signal. No particle effects, no background animation.

**Scene 2 — Hero Demo (profile card, 5s)**
- Card enters from BOTTOM-LEFT arc (not bottom-right — variation matters).
- `useBlurResolve` from 16px → 0 as card settles (rack-focus hierarchy signal).
- `useHeroFloatDelayed` — float only starts after card seats (~frame 38).
- Slight X-axis sway in addition to Y float — makes the float feel physical, not mechanical.
- Context copy waits until frame 36 before entering — never fights the hero for attention.

**Scene 3 — Features (left list + de-emphasised card, 4s)**
- Card persists but at `opacity: ~0.38, blur: ~2.5px, scale: ~0.97` via `depthDeemphasis`.
- Features enter from LEFT (translateX negative → 0) — reads naturally left-to-right.
- Each feature: icon chip + title (24px) + body (15px) + short wipe underline.
- Stagger: 14 frames between features.

**Scene 4 — Metrics (3 stats, each centred in its zone, 3s)** ← KEY SCENE
- `flex: 1` on each row → each metric owns exactly 360px of the 1080px canvas.
- `alignItems: center` + `textAlign: center` → number is unmistakably the focal point.
- Value: 164px dominant. Label: 28px subordinate. Sub: 17px context.
- Short centred accent dot below each stat (not full-bleed rule).
- Thin `borderBottom` dividers between rows create visible structure without decoration.
- **This is the correct pattern for any N-metric scene: flex rows + centred content.**

**Scene 5 — CTA (warm dark close, 3s)**
- Background shifts to `#1C1917` — confident tone change signals resolution.
- Terracotta radial glow (slow `useBreathingGlow`) — ambient warmth on dark bg.
- Two headline lines + sub + single button + URL. Nothing extra.
- Button uses terracotta with matching box-shadow glow — tactile and premium.

### Key numbers / specs
| Property | Value |
|---|---|
| Format | 1:1 square (1080 × 1080) |
| Duration | 18s (540 frames @ 30fps) |
| Palette | `#F9F6F1` bg / `#1C1917` dark / `#C2410C` accent |
| Hero font size | 108px (hook) / 164px (metrics) |
| Body font size | 24px (hook sub) / 15–17px (feature body) |
| Hero float | amplitude 6px, period 90f, X-axis phase offset π/2 |
| Arc entry | BOTTOM-LEFT (`fromX: -110, fromY: 130`) |
| Blur-resolve | `maxBlur: 16px`, resolves over 30 frames |
| Spring config | `PREMIUM_SPRING.hero` (damping 22, stiffness 90, mass 1.1) |

### What to replicate in future ads
1. Warm/distinctive palette — avoid the default indigo-on-white SaaS look
2. Scene 2 hero entry arc from a non-standard direction (not always bottom-right)
3. Scene 4 metric structure — `flex: 1` rows, centred, 164px values
4. The restraint of Scene 1 — just typography, nothing animated in the background
5. CTA tone shift — background colour change signals the emotional resolution of the ad

---

## Round 4 — Premium Motion Showcase (Three Placeholder Ads)

**Goal:** Improve animation quality by internalising Apple HIG, Material Design choreography, and NN/G motion principles. Create a reusable `premiumMotion.ts` library and demonstrate its techniques in three placeholder-brand showcase ads.

**What was created:**

| ID | Brand | Format | Duration | Motion Focus |
|---|---|---|---|---|
| `arcflow-v1` | Arcflow (Project Mgmt SaaS) | 16:9 | 20s | Arc entry, blur-resolve, hero float, shared element, depth de-emphasis |
| `luminary-v1` | Luminary (Analytics SaaS) | 9:16 | 18s | Pure typographic hook, rack-focus hero entry, 3-direction orbit chips, dark proof scene |
| `meridian-v1` | Meridian (HR/People Ops) | 1:1 | 18s | Warm palette, bottom-left arc entry, left-anchored feature wipes, graceful hero exit |

**New library created:** `src/utils/premiumMotion.ts`
All premium motion primitives are documented and reusable across future compositions.

---

## Premium Motion Principles (The Quality Upgrade)

*Sourced from Apple HIG, Material Design choreography guidance, and Nielsen Norman Group motion research.*

### The Core Rule
**Motion should CLARIFY hierarchy, not decorate.**
If you can't explain what a motion is communicating, remove it.
The premium SaaS look comes from fewer moving parts, not more.

---

### Motion Library — `src/utils/premiumMotion.ts`

All new compositions should use these primitives instead of rolling custom easing:

| Hook / Export | What it does | When to use |
|---|---|---|
| `PREMIUM_SPRING` | Spring configs: `hero`, `text`, `ui`, `bg`, `settle` | Replace all `SPRING.*` usages for premium feel |
| `easeOut3/4/5` | Cubic/quartic/quintic ease-out curves | Hero arrivals — the core easing vocabulary |
| `easeInOut3` | Smooth ease-in-out cubic | State transitions, background shifts |
| `useCinematicTextReveal` | Opacity + drift + blur-resolve combined | Every text entrance, always |
| `useBlurResolve` | Blur px → 0 on element arrival | Hero object entry (the "rack focus" signal) |
| `useArcEntry` | X spring + Y ease-out5 → curved path | Any hero object entering the scene |
| `useHeroFloat` | Sinusoidal float loop, amplitude ≤ 8px | Hero objects during hold — keeps them alive |
| `useHeroFloatDelayed` | Float that fades in after entrance | Combine with arc entry — wait for settle first |
| `depthDeemphasis` | opacity → 0.38, scale → 0.97, blur → 2.5px | Background elements when hero takes focus |
| `useSoftScaleIn` | Scale from 0.92 → 1.0, no bounce | Any object that needs to "grow on screen" |
| `usePremiumWipe` | ease-in-out wipe 0→100% | Accent rules, underlines, progress bars |
| `useBreathingGlow` | Slow sinusoidal 0→1 pulse | Ambient radial glows behind hero objects |
| `usePremiumFadeOut` | Clean fade at scene end | Every scene component, without exception |
| `premiumStagger` | Returns start frame for nth item (12f spacing) | Feature lists, stat cards, any staggered group |
| `sharedElementScale` | Interpolate hero scale across scene boundary | Shared-element continuity between scenes |

---

### Easing Rules

- **Hero arrivals:** `easeOut4` or `easeOut5` — decisive, decelerating
- **Text entrances:** `easeOut3` — quick but gentle
- **State transitions:** `easeInOut3` — smooth, not abrupt
- **NEVER use linear** — linear motion reads as template/cheap on any hero element
- **Avoid aggressive bounce** — `damping ≥ 18` on any PREMIUM_SPRING config
- The "settle" spring (`damping: 18, stiffness: 88`) is the maximum acceptable bounce for hero objects

### Arc Motion Rule
**Hero objects must never travel in a straight line.**
`useArcEntry` achieves the arc by having:
- X axis: spring physics (slight natural overshoot, then settle)
- Y axis: `easeOut5` (decelerates faster → concave arc path)
The visual effect is that the hero object "glides" in rather than "slides" in.

### Blur-Resolve Rule
**Blur resolving = hierarchy signal.**
When a hero element enters blurry (12–18px) and sharpens on settle, it communicates:
*"The camera — and the viewer's attention — has just found its subject."*
- Use `maxBlur: 14–18px` for hero objects
- Use `maxBlur: 6–8px` for text entrances
- Do NOT use blur on every element — overuse destroys the hierarchy signal

### Float Rule
- Amplitude: **≤ 8px** (6px is ideal for most hero objects)
- Period: **≥ 80 frames** (2.67s @ 30fps minimum)
- Any faster or larger reads as template-style animation
- Use `useHeroFloatDelayed` — the float should START after the entrance animation completes
- For multiple floating elements: use `phaseOffset` to prevent synchronised "breathing"

### Depth De-Emphasis Rule
When a hero takes focus, background elements must visually recede:
- **Opacity:** 1.0 → 0.38 (never go below 0.35 — still needs to be visible as context)
- **Scale:** 1.0 → 0.97 (barely perceptible, but real)
- **Blur:** 0px → 2.5px (cinematic softening, NOT a heavy blur)
Use `depthDeemphasis(progress)` from premiumMotion.ts. The transition itself should be `easeInOut3` over ~20 frames.

### Typography Motion Rules
- **`useCinematicTextReveal`** on all text — drift (16–18px) + opacity + blur-resolve
- Stagger text lines by 12–16 frames — never reveal all lines simultaneously
- Font sizes for premium ads: 80–130px for hero headlines, 20–30px for body
- `letterSpacing: -4 to -6` on large headlines (tighter = more premium)
- Text should NEVER bounce or overshoot — `useCinematicTextReveal` handles this

### Shared Element Continuity Rule
If a hero object appeared in the previous scene, it should persist into the next:
- Keep the same hero component in the DOM (don't remove and re-add)
- Use `depthDeemphasis` to recede it when other content takes focus
- The hero transitions from "focal element" → "depth anchor" as the scene progresses
This is what creates the "connected" feeling that makes premium ads feel like one continuous piece.

### Focal Hierarchy Rule
**One focal point per frame. Always.**
Ask: "What is the viewer supposed to look at right now?"
If the answer is ambiguous, something needs to be de-emphasised or removed.
- Scene S1: typography is the hero → no UI objects competing for attention
- Scene S2: hero object arrives → surrounding text de-emphasises
- Scene S3: feature list becomes focal → hero object recedes via depthDeemphasis
This is the single most impactful quality difference between template motion and premium motion.

### Breathing Room Rule
**Spacing is motion design too.**
- Vertical canvas: never use more than 3 distinct element groups in one scene
- Timing: 3–5 seconds per scene minimum — don't rush the reveal
- After a big element arrives, give it 1+ seconds before adding context copy
- CTA scenes: 2–3 seconds is correct. The ad already built the case.

---

### Space Utilisation — The Real Rule

**It is NOT about filling every pixel. It is about focal clarity.**

The question to ask for every scene is: *"Where is the viewer's eye supposed to go?"*
If the answer is clear, the scene is correct — regardless of how much empty space exists.
White space around a hero element is premium. White space that has nothing to anchor to is amateur.

**The failure mode is not "empty canvas" — it's "hero not clearly the hero."**

Examples:
- A scene with one large stat: the stat should be centred on the canvas, large, and dominant.
  Breathing room around it is correct. Having the stat in the corner at 96px is the error.
- A scene with 3 metrics: each metric should own its zone, centred within it.
  Three tiny numbers left-aligned at the top of the canvas is the error.
- A split-screen with a board and feature list: each element centred in its half.
  Board at far left, feature list at far right, 535px hole between them = no clear focal path.

**The practical test: blur your eyes. Can you still tell what the scene is about?**
If yes, the focal hierarchy is correct. If not, the hero isn't dominant enough.

**Pattern — single hero stat on screen:**
```tsx
// Centre it. It's the only thing. Own that.
<div style={{
  position: "absolute", inset: 0,
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center", textAlign: "center",
}}>
  <div style={{ fontSize: 200, fontWeight: 900, color: accent }}>$4.2M</div>
  <div style={{ fontSize: 32, color: bodyText }}>Total pipeline</div>
</div>
```

**Pattern — N items each owning their zone:**
```tsx
<div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
  {items.map((item, i) => (
    <div key={i} style={{
      flex: 1,                               // Each item = canvas height / N
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",  // Centred WITHIN its zone
      textAlign: "center",
      borderBottom: i < N-1 ? "1.5px solid ..." : "none",
    }}>
      <div style={{ fontSize: 160, fontWeight: 900 }}>{item.value}</div>  {/* Hero */}
      <div style={{ fontSize: 28, fontWeight: 700 }}>{item.label}</div>   {/* Support */}
      <div style={{ fontSize: 17, color: bodyText }}>{item.sub}</div>     {/* Context */}
    </div>
  ))}
</div>
```

**Pattern — split-screen landscape (16:9):**
- Left element: centred in the left half → `left = canvas_width/4 - element_width/2`
- Right element: centred in the right half → `left = canvas_width*3/4 - element_width/2`
- A thin vertical divider at `left: "50%"` makes the composition intentional
- Gaps ≤ 160px are breathing room. Gaps > 300px with nothing in them are errors.

### What to Always Do — Premium Motion Version
- Use `useCinematicTextReveal` for ALL text entrances (never raw interpolate for text)
- Use `useArcEntry` for ALL hero object arrivals
- Use `useBlurResolve` on hero objects to signal focus
- Use `depthDeemphasis` whenever a second element becomes focal
- Use `useBreathingGlow` on all background radial glows — ambient life
- Use `usePremiumFadeOut` in every scene component
- Vary entry direction between scenes (bottom-right, bottom-left, top, etc.)
- Use `premiumStagger` with 12–14 frames spacing for staggered groups

### What to Never Do — Premium Motion Version
- Never use `SPRING.bouncy` on any hero or text element in a premium composition
- Never travel in a straight line — always pair springX with easeOut5Y for arc
- Never start float loop simultaneously with entrance animation
- Never blur every element — blur-resolve is a hierarchy signal, not decoration
- Never reveal staggered items faster than 10 frames apart
- Never skip `usePremiumFadeOut` on a scene — scene cuts without it look jarring
- Never use more than one "entrance from below" in the same scene (vary directions)

---

## Element Centering & Proportions — Critical Rules

**The #1 recurring technical error: using hardcoded pixel left values for elements that should be centered.**

### Wrong approach (what was causing off-center renders):
```tsx
// WRONG: div is 300px wide. left=255 puts visual center at 255+150=405px, NOT 540px.
<div style={{ position: "absolute", left: 255, top: 620 }}>
  <SalonChairIllustration scale={1.9} ... />
</div>
```

### Correct approach (use CSS centering, never hardcode left for center-aligned elements):
```tsx
// CORRECT: left "50%" + translateX(-50%) = perfectly centered regardless of element width.
// CSS scale() transform-origin defaults to 50%/50% of the element, so scale keeps it centered.
<div style={{ position: "absolute", left: "50%", top: 620, transform: "translateX(-50%)" }}>
  <SalonChairIllustration scale={1.6} ... />
</div>
```

### Hero element sizing for 9:16 (1080×1920):
- A hero SVG/component at scale=1.6 → visual width=480px (44% of 1080) — good for side label space
- A hero SVG/component at scale=1.9+ → visual width=570px+ (53%+) — leaves only 255px each side, too tight for labels
- Rule: If labels or callouts appear on both sides, cap hero element at ~44% of canvas width
- Rule: Hero visual height should be 35–45% of canvas height. For 9:16 that's 672–864px.

### Vertical layout zones for 9:16 (1080×1920):
```
  Top zone (text/header): 0–460px
  Chair/hero visual top:  ~480–500px
  Hero center:            ~820px (42–45% down the frame)
  Hero visual bottom:     ~1140–1180px
  Bottom zone (CTA/URL):  1200–1920px (720px for text — use this space, don't leave it blank)
```

### Positioning ALL text overlays:
- Center all text using `left: 0, right: 0, textAlign: "center"` — never use a fixed left offset for centered copy
- Use `padding: "0 64px"` or similar to prevent text touching edges
- Use `bottom: 80–200` for CTA elements at the bottom — don't hardcode `top` for bottom-anchored elements

---

## Pre-Ship Visual Audit — MANDATORY Before Every Finalised Composition

**Before considering any composition complete, always self-audit it against the checklist below.**
This is not optional. The audit must happen before presenting the video as finished.
Catch problems now, not after the user watches it.

### Audit Checklist

**Typography & overflow**
- [ ] Does every text element fit within the 1080px canvas width without clipping? Calculate: longest line × font-size × ~0.55 ≈ pixel width. If > 920px, reduce font size or break into separate lines.
- [ ] Is `textAlign: "center"` set on every centered text div? A div can be centered in a flex column but text inside it will still left-anchor without this.
- [ ] Are `padding: "0 64px"` (or equivalent) guards in place to prevent text touching canvas edges?
- [ ] Is all text at least 28px? Nothing below that is readable on a phone screen.

**Frame utilisation**
- [ ] Is every scene using the full 1920px height? Mentally divide the canvas into top (0–600px), mid (600–1300px), bottom (1300–1920px) — all three zones should have intentional content.
- [ ] Is there any dead zone larger than ~300px with no text, visual, or ambient element? If yes, fill it.
- [ ] Does the hero element (number, card list, visual) occupy 40–60% of the frame height?

**Animation logic**
- [ ] Do all `translateX` animations on wide elements risk clipping the canvas edge? Prefer `translateY` for elements that touch the horizontal bounds.
- [ ] Is every `transform: scale()` using `transformOrigin: "50% 50%"` (or the intended origin) explicitly?
- [ ] Does "something always move" in every scene — counter, ambient dots, breathing glow, particle, or ticker?

**Scene transitions**
- [ ] Does each scene cleanly fade/wipe out before the next begins? Check the last 10–15 frames of each Sequence.
- [ ] Are all root-level transitions (SceneWipe, BrightFlash, etc.) placed OUTSIDE of any `<Sequence>` wrapper?

**Content sanity**
- [ ] Are there any placeholder strings ("Name", "Amount", "Title", "TODO")? Replace all with real product data.
- [ ] Does the CTA scene include: headline, sub-copy, at least one button, and the URL?
- [ ] Is the total duration (frames ÷ fps) within a reasonable range for the format (Instagram: 15–60s)?

### When to Run This Audit
- After writing the full composition but BEFORE adding it to Root.tsx and presenting it
- Mentally step through each scene's first, middle, and last frame
- If any checklist item fails → fix it before shipping

---

## Session: Hero Expansion Ad — Iterative Build & Editorial Training

**Date:** March 2026
**Composition built:** `hero-expansion-v1` (`src/compositions/HeroExpansionAd.tsx`)
**Format:** 1:1 square, 1080×1080, 300 frames @ 30fps (10s)

This session was explicitly about training editorial judgment. Each iteration below represents a feedback round and what it taught about premium motion design.

---

### Iteration 1 → 2: From flat to 3D, from small to present

**Feedback received:**
- "Make it look 3D instead of 2D — it should be moving irrespective of the background"
- "The background should not be plain white"
- "Cards should take up more space — there's not much going on"
- "Cards need continual rotational movement — right now they just look 2D"

**What this revealed:**
When cards sit on a white/light background without continuous rotation, they look like screenshots in a slideshow. The brain doesn't read them as objects in space. Three things are required simultaneously for "3D in space" perception:
1. A dark, rich background (light backgrounds flatten everything)
2. Continuous 3D rotation on each element (even 10° rotateY oscillation signals depth)
3. Objects large enough to read as dominant — not thumbnails floating in dead space

**Changes made:**
- Background → deep indigo/navy/purple gradient (`#07060E` base + colored radial pockets)
- Card size → 290×350 (up from 240×292, +46% area)
- Added `contRotYAmp`/`contRotXAmp` per card for continuous 3D rotation after landing

**Key learning:** Dark backgrounds are not a style choice — they are a perception architecture choice. Dark backgrounds give depth, separation, and make white cards pop as premium surfaces. Light backgrounds require much more sophisticated motion to achieve the same perceived quality.

---

### Iteration 2 → 3: Motion must be continuous and directional from birth

**Feedback received:**
- "The starting card needs to be continuously moving from the beginning, slightly increasing in size"
- "Right now it's just like it becomes apparent and then it's static"
- "When the cards get separated they fragment but then are still for 10-15 frames"
- "They need to be constantly moving the entire time — like floating in one direction"
- "They shouldn't float back and forth — they should float in one sort of direction each"
- "Flying out of the screen or something"

**What this revealed:**
Two critical principles emerged:

**Principle: Zero static frames.** Any element that stops moving — even for 10 frames — reads as a "settle" event. The brain registers this as "the animation is done." For cards that should feel like they're alive in 3D space, motion must be present from frame 1 of the element's existence and must NEVER stop.

**Principle: Directional drift vs. oscillation.** `sin(frame)` oscillation reads as "floating animation" (cheap, template-like). A slow constant-direction drift (`cardAge * spinRate`) reads as "object in physical space." The distinction is: oscillation has no direction; drift has intent. Each card should have its own unique directional vector so no two cards move the same way.

**Changes made:**
- Hero card: `heroRotY = -10 + frame * 0.09` (continuous drift from frame 0, no "idle" phase)
- Hero card: `heroScale = 0.88 + heroEnterT * 0.08 + frame * 0.00085` (grows the entire time)
- Clone cards: removed `contBlend` delay entirely — rotation starts at `cardAge = 1`
- Clone cards: replaced `sin()` oscillation with `cardAge * card.spinY` (directional)
- Added `driftVX/driftVY` outward diagonal vectors so cards slowly escape their corners

**Key code pattern:**
```tsx
// OLD (oscillating — reads template-like):
const contRotY = Math.sin((frame / 108) * 2 * Math.PI + phase) * 10 * contBlend;

// NEW (directional — reads cinematic):
const totalRotY = card.restRotY + cardAge * card.contRotYAmp;  // starts immediately, never stops
const driftX = cardAge * card.driftVX * flySpring;             // outward drift compounds over time
```

**Calibration values that work:**
- Spin rate (Y axis): ±0.055–0.065°/frame (1.65–1.95°/second)
- Spin rate (X axis): ±0.035–0.042°/frame (1.05–1.26°/second)
- Drift velocity: 0.32–0.38 px/frame per axis (≈65–75px total over 200 active frames)
- Hero scale growth: 0.00085/frame (≈7.6% total growth over hero's 68-frame visible life)

---

### Iteration 3 → 4: Prism rim — simulating physical card depth

**Feedback received:**
- "Add a 3D-ish border to make them look like rectangular prisms instead of 2D squares — only slightly thick"
- Reference images showed: thick colored accent border + rotation = perceived card thickness

**What this revealed:**
The technique used in high-end product UI ads is NOT CSS `transform-style: preserve-3d` (which breaks when `filter:` is used on a parent, which it always is during blur phases). The technique is:

1. A colored **padding wrapper** ("rim") creates a thick visible band around the card face
2. A **hard box-shadow** (0px blur) extends that rim in the exact direction the current rotation angle would expose the physical edge

This simulates the effect of a card with physical thickness because:
- The rim IS the card's edge color (accent-matched)
- The hard shadow IS the card's edge face appearing as the card rotates
- The shadow direction updates every frame based on `sin(rotY)` and `sin(rotX)`

**Key technical insight — why this works without preserve-3d:**
`filter: blur/drop-shadow` on a parent breaks `transform-style: preserve-3d` on all descendants (creates a flattened stacking context). The rim + computed shadow approach requires only normal `boxShadow` so it is unaffected.

**Implementation:**
```tsx
const CARD_RIM   = 7;    // px — visible rim around card face
const DEPTH_MULT = 22;   // px per unit sin — shadow reach for "thickness"

function prismEdgeShadow(rotYDeg: number, rotXDeg: number, accent: string): string {
  // Correct formula: -sin(rotY) because when rotY>0, right side recedes, LEFT edge visible
  const sx = -Math.sin(rotYDeg * Math.PI / 180) * DEPTH_MULT;
  const sy = -Math.sin(rotXDeg * Math.PI / 180) * DEPTH_MULT;
  return `${sx.toFixed(1)}px ${sy.toFixed(1)}px 0px 0px ${accent}CC,
          ${(sx*1.8).toFixed(1)}px ${(sy*1.8).toFixed(1)}px 3px -1px ${accent}44`;
}

// In JSX — wrap UICard:
<div style={{
  padding: CARD_RIM,
  background: `linear-gradient(150deg, ${accent}FF, ${accent}AA)`,
  borderRadius: CARD_RADIUS + CARD_RIM,
  boxShadow: prismEdgeShadow(s.rotY, s.rotX, accent),
}}>
  <UICard ... />
</div>
```

**The shadow direction formula, explained:**
- `rotY > 0` → right side recedes → LEFT edge of card should appear visible → shadow goes LEFT → `sx = -sin(positive) = negative` ✓
- `rotY < 0` → left side recedes → RIGHT edge appears → shadow goes RIGHT → `sx = -sin(negative) = positive` ✓
- Same logic applies for rotX / top-bottom edges

**Calibration:**
- `CARD_RIM`: 5–8px for a visible but not heavy rim. Below 4px is too subtle; above 10px looks chunky.
- `DEPTH_MULT`: 18–24 for convincing depth. Scale this proportionally to card size.
- Shadow color: `accent + "CC"` (80% opacity) for primary; `accent + "44"` (27% opacity) for falloff.

---

### Iteration 4 → 5: Camera motion wrapper

**Feedback received:**
- "One of the main things that impacts quality is having the camera or making it appear as if the camera is moving along with the images"
- "Zooming in at a certain speed as well as rotating the camera slightly along the plane the images are in"

**What this revealed:**
Camera motion is arguably the single highest-leverage quality signal in any video composition. It is felt rather than seen. The reason it's so powerful is that the human brain uses camera movement as a primary heuristic for "this is real footage" vs. "this is a computer animation." Even 6% zoom over 10 seconds registers as "someone pointed a camera at this."

Three components make up convincing camera motion:
1. **Dolly push-in** (`scale`) — camera moving toward subject. Always zoom IN, never out, for premium product ads.
2. **Camera roll** (`rotateZ`) — slow drift of camera's horizontal axis. Should pass through 0° during text moments.
3. **Pan/tilt** (`translateX/Y`) — lateral drift. Should cross center axis so elements feel *tracked*, not adrift.

**Critical calibration rule — use LINEAR, not eased:**
Easing on camera motion reads as "consumer software Ken Burns effect." Linear motion reads as a controlled professional dolly/crane arm. The distinction matters.

**Implementation:**
```tsx
const cameraZoom = 1.0 + (frame / TOTAL_FRAMES) * 0.065;  // linear, NOT eased
const cameraRoll = interpolate(frame, [0, 70, 170, 260, TOTAL_FRAMES], [-0.9, -0.25, 0.55, 0.80, 0.35], ...);
const cameraPanX = interpolate(frame, [0, TOTAL_FRAMES], [14, -10], ...);  // crosses 0
const cameraPanY = interpolate(frame, [0, TOTAL_FRAMES], [8, -6], ...);

// ONE wrapper div around ENTIRE scene inside AbsoluteFill:
<div style={{
  position: "absolute", inset: 0,
  transform: `scale(${cameraZoom}) rotateZ(${cameraRoll}deg) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`,
  transformOrigin: "center center",
}}>
  {/* everything */}
</div>
```

**Calibration:**
| Parameter | Safe range | Value used | Effect |
|-----------|-----------|------------|--------|
| Zoom total | 4–8% | 6.5% | Barely perceptible push-in |
| Roll range | ±0.8–1.5° | −0.9° to +0.8° | Subtle camera operator drift |
| Roll at headline | near 0° | ≈0.2° at frame 178 | Text stays legible/level |
| Pan total | 15–25px per axis | 24px X, 14px Y | Feels tracked, not floating |

---

### Master vocabulary — terms the user uses and what they mean

| User's phrase | Technical meaning | Implementation |
|---------------|-------------------|----------------|
| "Looks 2D" | No depth cues — flat plane, no rotation variation, no shadow shift | Add rotateX/Y tilt, dynamic drop-shadow, perspective |
| "Static" | Zero motion on settled elements | Add continuous directional spin from frame 1 |
| "Floating back and forth" | `sin()` oscillation | Replace with `cardAge * spinRate` linear drift |
| "Flying in one direction" | Unidirectional drift | `driftVX/driftVY` per-card outward velocity |
| "3D border / rectangular prism" | Colored rim + computed edge shadow | `prismEdgeShadow()` technique |
| "Camera moving along with" | Camera motion wrapper | `scale + rotateZ + translate` on scene root |
| "Zooming in" | Dolly push-in | `scale: 1.0 → 1.065` linear |
| "Rotating along the plane" | Camera roll | `rotateZ` drift on scene root |
| "Not much going on" | Elements too small, dead space | Fill >60% of frame, cards 290px+ |
| "Template-like" / "vibe-coded" | Generic, default styling, no original concept | Original visual language, specific typography, intentional color |

---

### Core editorial principles established in this session

These apply to ALL future compositions, not just hero-expansion-v1:

1. **Nothing is ever still.** Every element should have some motion at every frame it's visible. Even 2px/frame drift is enough. Static = dead.

2. **Dark backgrounds are a premium signal.** Light/white backgrounds require much more sophisticated motion to read as premium. Dark backgrounds give depth, shadow, and card surface contrast for free.

3. **Directional motion reads smarter than oscillation.** Linear drift has intent. Back-and-forth oscillation reads as an "animation" checkbox, not a design decision.

4. **Fill the frame aggressively.** Cards/elements should feel like they're present, not floating in dead space. Default instinct is always too small. When in doubt, 40% larger.

5. **Camera motion is the highest-leverage quality signal.** Add it to every composition. 6% zoom + 1.5° roll + 20px pan over the full duration. Always linear.

6. **The prism rim technique replaces flat borders.** Any card that is going to rotate in 3D should use the `prismEdgeShadow()` technique. Flat borders look flat when rotated.

7. **Born moving.** Clone cards/elements should have motion from frame 1 of their existence, not after they settle. Remove all `contBlend` settle delays.

8. **Burst-then-calm rhythm.** One intense transformation moment followed by spacious resolution. The contrast between intensity and calm is what reads as "expensive."

9. **Text arrives last.** The spatial system must be understood before the message lands. Headline always enters AFTER the key visual moment has resolved.

10. **Vary every element slightly.** Identical rotation, identical timing, identical size on multiple elements reads as a loop/template. Every card needs a slightly different spin rate, phase, drift vector, and landing angle.

---

## Motion Pattern Library

Reusable premium animation patterns. Each has a reference implementation in `src/compositions/`.

---

### Pattern: Hero Component Expansion Transition

**Reference composition:** `hero-expansion-v1` (`src/compositions/HeroExpansionAd.tsx`)

**What it is:**
A single dominant UI card transforms through a brief 3D motion burst into multiple related cards, resolving into an organized spatial layout that supports a product message. The critical quality is *continuity* — the viewer reads the output cards as descendants of the original, not as copies.

**Core concept:**
> "Transform one hero component into a distributed set of related components while preserving continuity, hierarchy, and premium motion design."
> NOT: "duplicate the card 4 times" or "spin cards around."

**Animation sequence (10s @ 30fps):**
1. **(0–50f) Hero Establish** — Card arcs in with blur-resolve + rack focus. Settles with slight `rotateX` / `rotateY` 3D tilt. This signals tactile, physical presence.
2. **(50–65f) Interaction Cue** — Cursor arrives via eased path and "clicks." Establishes the card as an active, responsive object.
3. **(65–96f) Burst** — Card sweeps from `rotateY(-12deg)` toward `rotateY(90deg)` (edge-on = vanishes into space). `filter: blur()` builds to 28–30px at peak, concealing the duplication mechanics. A faint expanding ring signals the energy moment.
4. **(96–175f) Resolution** — 4 clone cards spring-diverge from the burst center to corner positions. Each card starts at 26px blur and resolves staggered. Rotations build as each card travels. Spring config: `PREMIUM_SPRING.settle` for controlled deceleration with near-zero overshoot.
5. **(175–300f) Final** — Central headline drifts in with `useCinematicTextReveal`. All 4 cards float on `sin()` loops with phase offsets. Composition breathes.

**The 7 things that make it premium:**
1. **Identity continuity** — all 4 final cards share the same card template, border, accent color family, and type system as the hero.
2. **Blur as concealment** — the exact moment of duplication is hidden inside the blur peak. Brain reads transformation, not clone.
3. **Rotation with perspective** — `perspective(1100px)` + `rotateY` makes the card feel like it passes through 3D space, not slide on a flat plane.
4. **One energetic burst, then calm** — a single intense motion moment followed by a stable, spacious landing. The contrast reads as expensive.
5. **Strong spacing in the final layout** — 4 cards at corners, generous center space for headline. Never cluttered.
6. **Slight rotational variation** — each card lands at a different `rotateZ/X/Y`. Designed, not mechanically identical.
7. **Text arrives last** — headline only appears once the eye has understood the card expansion. Hierarchy is temporal.

**Key implementation details:**

```tsx
// The burst sweep: hero card rotateY from rest (-12°) to edge-on (90°)
const burstSweepT   = easeOut5(prog(BURST_START, BURST_PEAK - BURST_START));
const heroRotYBurst = heroRotYRest + burstSweepT * (90 - heroRotYRest);

// Blur peak at BURST_PEAK — conceals duplication
const heroBurstBlur = easeInOut3(prog(BURST_START, BURST_PEAK - BURST_START)) * 30;

// Clone cards: start at hero center position, spring to corner positions
// dx = HERO_LEFT - card.left  (offset that pushes card to hero center)
// dy = HERO_TOP  - card.top
const flySpring = spring({ frame: frame - start, fps, config: PREMIUM_SPRING.settle });
const tx = dx * (1 - flySpring);   // animates from dx → 0
const ty = dy * (1 - flySpring);   // animates from dy → 0

// Blur resolves staggered on each clone (born blurry, sharpen on land)
const blur = (1 - easeOut4(prog(start, CLONE_BLUR_DUR))) * 26;
```

**Allowed variations:**
- 1 → 3 cards (triangle layout)
- 1 → 4 cards (corner layout) ← reference implementation
- 1 → 6 cards (grid layout, 2×3)
- 1 card → stack of cards (depth instead of expansion)
- Card splits into localized variants (same content, different languages)
- Card splits into use-case variants (same template, different metrics)

**Self-check before shipping:**
- [ ] Does the transition feel like one object evolving, not random duplication?
- [ ] Is the blur peak timed to coincide with the exact moment of split?
- [ ] Does the rotation feel spatial (perspective) rather than flat (scaleX)?
- [ ] Is the final layout balanced with clear center space for messaging?
- [ ] Do all output cards retain visual DNA from the hero (border, type, accent system)?
- [ ] Is there a clear burst-then-settle rhythm? (Not sustained chaos)
- [ ] Does the headline arrive AFTER the eye understands the card expansion?
- [ ] Does the whole thing feel like a polished SaaS commercial vs. a template effect?

---

### Technique: Camera Motion Wrapper

**What it is:**
Applying slow `scale`, `rotateZ`, and `translateX/Y` to a wrapper div that contains the entire scene. This simulates a physical camera moving — and is the single biggest quality signal that separates premium SaaS ads from amateur motion graphics.

**Why it works:**
The human visual system is trained to detect "camera movement" as a sign of live, intentional cinematography. A completely static viewport signals "rendered by a computer." Even a 6% zoom and 1.5° roll over 10 seconds makes the brain classify the content as photographed, not rendered.

**Implementation:**
```tsx
// Add to any composition — one wrapper div around ALL scene content
const cameraProg = frame / TOTAL_FRAMES;
const cameraZoom = 1.0 + cameraProg * 0.065;   // +6.5% dolly-in over full duration

const cameraRoll = interpolate(
  frame,
  [0, 70, 170, 260, TOTAL_FRAMES],
  [-0.9, -0.25, 0.55, 0.80, 0.35],             // drifts through ≈0° during headline
  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
);

const cameraPanX = interpolate(frame, [0, TOTAL_FRAMES], [14, -10], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const cameraPanY = interpolate(frame, [0, TOTAL_FRAMES], [8,  -6],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

// In JSX — wrap everything inside AbsoluteFill:
<div style={{
  position: "absolute",
  inset: 0,
  transform: `scale(${cameraZoom}) rotateZ(${cameraRoll}deg) translateX(${cameraPanX}px) translateY(${cameraPanY}px)`,
  transformOrigin: "center center",
}}>
  {/* entire scene */}
</div>
```

**Calibration rules:**
- **Zoom**: 4–8% total over full duration. Less = too subtle. More = obvious Ken Burns.
- **Roll**: ±0.8–1.5° total swing. Pass through 0° while text is on screen so headline stays level.
- **Pan**: 15–25px total travel. Should cross the center axis so objects feel *tracked*, not drifted.
- **Use linear interpolation**, NOT ease-in-out. Easing on camera movement reads as cheap/consumer. Linear reads as a controlled professional dolly/crane.
- **Keyframe the roll** so it passes near 0° when the main message/headline is on screen.

**What NOT to do:**
- Don't ease the zoom (linear or very gentle ease is fine, strong ease looks like a GIF)
- Don't oscillate/ping-pong the camera (drift in ONE direction per motion axis)
- Don't exceed 10% zoom or 2° roll — it will be consciously noticed and look like an effect
- Don't apply the camera to a subset of elements — wrap the ENTIRE scene, otherwise elements move through each other

---

### The math: CSS scale from center
When a div with width W and height H has `transform: scale(S)` applied:
- Visual width  = W × S  →  visual left  = center_x - (W/2 × S)
- Visual height = H × S  →  visual top   = center_y - (H/2 × S)
- Using `left: 50%, translateX(-50%)` sets center_x = screen_width/2 = 540 for 1080px canvas
- Always verify: visual_left = 540 - (W/2 × S) should be positive and leave room for side elements

---

## Round 5 — Layout-Aware Blur Reveal Typography

**Reference composition:** `kinetic-typography-v1` (`src/compositions/KineticTypographyAd.tsx`)
**Format:** 16:9 (1920 × 1080), 10s @ 30fps

---

### Technique: Layout-Aware Blur Reveal Typography

**What it is:**
A premium kinetic typography system where new words are introduced through a soft blur-to-sharp focal-plane reveal while existing words in the composition gently glide to make room. The defining principle is that the layout REACTS to each new word — the composition reorganises itself rather than just having words appear.

This is the animation style used in premium SaaS commercials (Linear, Vercel, Apple, Notion) to create a sense that type exists in physical space and has compositional weight.

**Why it feels premium:**
The blur alone is not what makes it expensive. What makes it expensive is that the surrounding layout moves. The viewer subconsciously reads this as: the design knows this word is coming, and has prepared space for it. That intentionality is the quality signal.

**Core animation pattern (per word reveal):**

```
Step 1: Determine final composition
  Before animating anything, know where every word ends.

Step 2: Identify room-making movement
  Existing words glide to their final positions slightly before or
  simultaneously with the new word arrival.

Step 3: Reveal new word with:
  - blur:      starts at 8–12px, resolves to 0 over ~26 frames
  - translateX: starts 24–36px from final position (never vertical drift)
  - opacity:   fast rise — reaches 1.0 before motion completes

Step 4: Settle and hold
  After each beat, the composition holds for 8–15+ frames.
  Do not rush to the next reveal.
```

**Implementation: `<WordReveal>` component:**
```tsx
// Encapsulates the full blur-reveal pattern in one reusable component
const WordReveal: React.FC<{
  frame: number;
  revealStart: number;
  driftX?: number;   // px — 24–36 for words, keep horizontal only
  blurMax?: number;  // px — 8–12 for typography
}> = ({ frame, revealStart, driftX = 28, blurMax = 9, children }) => {
  const t = easeOut4(rawProgress(frame, revealStart, 26));
  const opacity    = clamp(easeOut3(rawProgress(frame, revealStart, 18)), 0, 1);
  const translateX = (1 - t) * driftX;
  const blur       = (1 - t) * blurMax;
  return (
    <span style={{ display: "inline-block", transform: `translateX(${translateX}px)`, filter: `blur(${blur}px)`, opacity }}>
      {children}
    </span>
  );
};
```

**Room-making movement:**
```tsx
// Plain function (no hooks) — use inside render for glide calculations
function useGlide(frame: number, start: number, fromX: number, toX: number): number {
  const t = easeInOut3(rawProgress(frame, start, 22));
  return fromX + (toX - fromX) * t;
}

// Example: "Make" starts centred, glides left when "work" arrives at frame 48
const makeX = frame < B2_START
  ? 0
  : useGlide(frame, B2_START, 0, -310);
```

**Calibration rules:**

| Property | Value | Reasoning |
|---|---|---|
| Word blur max | 8–12px | Recognisable during transition — not fog |
| Horizontal drift | 24–36px | Small enough to feel decisive, not dramatic |
| Room-making distance | 20–50px | Gliding, not jumping |
| Reveal duration | 22–28f | ~0.75s — let the blur resolve smoothly |
| Room-make duration | 20–24f | Slightly shorter — space arrives ahead of word |
| Hold between beats | 8–18f | Let the eye register the composition |
| Opacity easing | easeOut3, shorter window | Opacity leads — word visible before fully sharp |
| Motion easing | easeOut4 | Controlled deceleration, no bounce |

**Typography system for this style:**
```css
/* Font: SF Pro Display / Inter — the design language of premium SaaS */
font-family: -apple-system, "SF Pro Display", "Inter", "Helvetica Neue", sans-serif;

/* Sizes — large to enormous. Emptiness around text IS the premium feel. */
font-size: 110–140px;  /* 16:9 canvas */
font-size: 90–120px;   /* 9:16 canvas */

/* Weight roles:
   600 = primary keyword (the thing)
   700 = payoff word — arrives last, heaviest
   300 = connecting/supporting word — arrives with text
*/

/* Tracking — always tight on large type */
letter-spacing: -0.03em to -0.04em;
```

**Colour/weight hierarchy:**
- Primary keyword: `font-weight: 600`, `color: near-black`
- Accent payoff word: `font-weight: 700`, `color: accent blue`
- Supporting/connective: `font-weight: 300`, `opacity: 0.78–0.85`, `color: near-black`
- Sub-label: `font-size: 22–28px`, `letter-spacing: 0.18em`, `text-transform: uppercase`, `opacity: 0.5`

**What to avoid:**

| Avoid | Why |
|---|---|
| Vertical drift for word reveals | Horizontal only — vertical reads as template motion |
| blurMax > 14px for words | Becomes fog/smear. Must stay recognisable. |
| All words same weight | Destroys hierarchy — one word must feel like the payoff |
| Animating every element independently | Words must react to each other. Isolated reveals feel disconnected. |
| Revealing too quickly after previous word | Let each beat settle. Breathe. |
| Typewriter, bounce, scale pops | Antithetical to this style |
| Crowded layouts | Negative space is 50% of the premium signal |

**Scene structure for a 10s clip:**
```
Beat 1 ( 0– 50f):  First word enters — centres cleanly — hold
Beat 2 (48–115f):  Second word resolves — first shifts left — hold
Beat 3 (108–190f): Third word lands — prior words shift further — hold
Beat 4 (185–250f): Scene clears — new line enters as a unit — hold
Beat 5 (248–300f): Payoff word arrives — entire composition locks — hold
```

**Thinking process checklist (use before every composition):**
- [ ] Have I defined the final position of every word before coding frame 0?
- [ ] Does each word arrival trigger a visible (but subtle) repositioning of existing words?
- [ ] Is there a single "payoff" word that arrives last and feels heaviest?
- [ ] Is the blur peak at a blur value where the word is still recognisable?
- [ ] Are all motion distances below 50px? (If you feel like more, use less)
- [ ] Is there a hold beat after every reveal? Does it breathe?
- [ ] Is the canvas mostly empty? (If not, remove elements)
- [ ] Would a designer at Linear/Vercel think this looks intentional?

**Instruction shorthand for future use:**
> "Use premium layout-aware blur reveal typography: reveal each new word from soft focus into crisp clarity while existing text subtly glides to make room, maintaining a spacious, balanced SaaS-style composition."

---

### Round 5 — Iteration Log (what went wrong and how it was fixed)

**Problem 1: Room-making for nothing**
- **What happened:** Words spread apart but nothing filled the gap. The layout looked broken — creating space without a reason.
- **Root cause:** The composition was designed around the movement pattern without first deciding what object would be revealed into the gap.
- **Fix:** Always design the final three-part composition first (left element · centre object · right element), then work backwards to the spread distance. The gap must be sized to the object, not a default large value.
- **Rule going forward:** Before writing a single line of spread animation, answer: what object is being invited? What is its rendered size? The spread target = (object width / 2) + comfortable padding (~80–120px each side).

---

**Problem 2: Instant repositioning when the second word appeared**
- **What happened:** "Move" was perfectly still until the frame "fast" appeared, then instantly lurched into motion at the same moment — making it look like the appearance of "fast" *caused* a sudden jump.
- **Root cause:** The spread keyframe array had a flat `[0, 0]` plateau that held until `T.fastIn`, then immediately started moving. The motion and the appearance were perfectly synchronised — which read as a snap.
- **Fix:** Start the spread motion *before* the second word appears. `T.spreadStart = 28`, `T.fastIn = 52`. By the time "fast" reveals, "Move" has already been moving for 24 frames. The viewer reads it as the layout preparing, not reacting.
- **Rule going forward:** Pre-motion is the key. Existing elements should begin their room-making movement 20–30 frames before the new word appears. The new word arrives into already-moving space.

---

**Problem 3: Stop-start motion (move, pause, move, pause)**
- **What happened:** "Move" would drift left, decelerate to near-stop, then start moving again, then stop again — multiple times.
- **Root cause:** Multiple `easeInOut3` segments chained in sequence. Each segment has its own decelerate-then-accelerate curve. Three segments = three complete S-curves = three perceived "moves." The `easeInOut3` easing applied across segment boundaries creates artificial rest points.
- **Fix:** Replace multi-segment keyframe arrays with a **single `easeInOut3` arc** from start to final value. One S-curve = one perceived motion.
- **Rule going forward:** For any continuous positional animation that should read as ONE movement, use a single easing call: `easeInOut3(rawProgress(frame, start, duration)) * targetValue`. Never chain multiple easeInOut segments for a value that should feel like one thing moving.

```tsx
// WRONG — creates stop-start at each segment boundary
const spread = ci(frame,
  [0, 30, 55, 90, 120, 157],
  [0,  0, 100, 180, 195, 380],
  easeInOut3  // ← applied per segment = multiple S-curves
);

// CORRECT — one S-curve, one perceived motion
const FINAL_SPREAD = 220;
const spread = easeInOut3(rawProgress(frame, T.spreadStart, T.spreadEnd - T.spreadStart)) * FINAL_SPREAD;
```

---

**Problem 4: Flexbox reflow causing layout snaps**
- **What happened:** When "fast" mounted (became visible), the flex container grew wider and physically shoved "Move" left as a layout side effect — layered on top of the transform, causing a double-movement snap.
- **Root cause:** Both words were children of a `display: flex` container. When a new child mounts, flexbox recalculates and repositions all siblings. This happens instantly (no easing), creating a hard jump.
- **Fix:** Use a `0×0` absolute anchor at `50% 50%` and position every element with `position: absolute` + explicit transforms from that centre point. Container size never changes, so mounting new elements causes zero reflow.
- **Rule going forward:** For any composition where elements appear over time and need to be symmetrical around centre, use a 0×0 anchor — never a flex container. Flex is for static layouts only.

```tsx
// Anchor — sits at screen centre, zero size, no reflow ever
<div style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0 }}>
  {/* "Move" — right edge at centre, pulls left by spread */}
  <div style={{ position: "absolute", top: "50%", left: 0,
    transform: `translate(calc(-100% + ${moveX}px), -50%)` }} />
  {/* "fast" — left edge at centre, pushes right by spread */}
  <div style={{ position: "absolute", top: "50%", left: 0,
    transform: `translate(${fastX}px, -50%)` }} />
</div>
```

---

**Problem 5: Gap too large for the object**
- **What happened:** Final spread was 380px each side (760px total) for an 88px logo card. The words looked like they were fleeing the scene.
- **Root cause:** Spread value was tuned to "feel like enough room" in isolation without being calculated against the actual object size.
- **Fix:** Calculate: `spread = (objectWidth / 2) + sidePadding`. For a 160px card: `(160/2) + 130 = 210px`. Used 220px.
- **Rule going forward:** The gap should look *snug but comfortable* around the object. If you could fit two more of the same object in the gap, it's too wide.

---

**Problem 6: Object too small to read as the centre of attention**
- **What happened:** 88px logo card was dwarfed by 138px type, making it read as a footnote rather than the hero.
- **Fix:** Scaled to 160px card / 96px icon. At 16:9 with 138px type, the hero object should be at minimum 140px — ideally 160–200px.
- **Rule going forward:** In a three-part composition of `[word] [object] [word]`, the object should be visually heavier than either word alone. Size it so it anchors the frame, not floats in it.

---

**Corrected calibration table (supersedes the original above):**

| Property | Correct value | What to avoid |
|---|---|---|
| Spread distance | `(objectWidth/2) + 100–130px padding` | Hardcoded large values without measuring the object |
| Pre-motion lead | 20–30f before new word appears | Starting motion at the same frame as word appearance |
| Spread easing | Single `easeInOut3` arc, start→end | Multiple chained easeInOut segments |
| Positioning strategy | 0×0 absolute anchor + explicit transforms | Flex container with conditionally-mounted children |
| Object size vs type | Object ≥ type fontSize * 1.1 to feel like hero | Scaling object down to "not take up too much room" |
| `ci()` usage | Only for multi-phase values that genuinely have distinct phases (e.g. logoY) | Driving a single continuous motion through multiple segments |

---

## Pacing & Composition Theory — Creative Direction Framework

*This is the highest-level framework. All motion, animation, and layout decisions should flow from these principles.*

---

### The 3 Layers of a Strong Ad

Every scene, at every moment, must answer three questions **in this order:**

1. **What is the viewer meant to understand right now?**
   At every moment, one dominant idea. Not: text + icon + background motion + card movement + camera move + glow all competing. Just: what is the single thing the viewer should notice first?

2. **How long should that idea stay on screen?**
   This is pacing. The sweet spot: long enough to register, short enough to keep momentum.

3. **Where should the eye go?**
   This is composition and camera placement. If the eye doesn't know where to look, the ad feels amateur even if the animation is technically clean.

---

### Pacing Theory — Ads Are Sequences of Attention Beats

An ad is not a sequence of animations. It is a sequence of **attention beats**. Each beat does one job.

**Beat types:**

| Beat | Purpose | Pacing feel |
|---|---|---|
| **Hook beat** | Immediate intrigue, fast clarity, something visually strong | Fastest — confident and immediate |
| **Explain beat** | Shows the product, function, or promise | Slightly slower — viewer is interested, give them time to understand |
| **Expand beat** | Adds supporting detail without overwhelming | Moderate |
| **Proof beat** | Demonstrates capability, quality, speed, simplicity | Moderate — motion intensity okay, but one point at a time |
| **Resolution / CTA beat** | Clearest takeaway | Clean and decisive — conclusive, not rushed |

**The pacing rule that most AI ads break:**

> **High information density → slower rhythm. Low information density → quicker rhythm.**

If a scene contains one short phrase + one icon + one motion cue → it can move fast.
If a scene contains product UI + text + object reveal + feature explanation → it needs breathing room.

Template-level ads keep the same tempo regardless of information density. Premium ads do not.

**The attention handoff rule:**
Every new beat must inherit attention from the previous beat. If text is the focus now, transition so the eye naturally lands on the next object. The viewer should never have to *search* for the next focal point. That is premium pacing.

**Practical pacing rules:**
- Introduce one core idea at a time
- Let each focal element land before adding the next
- Overlap motion slightly, but not so much that focus splits
- Keep early scenes more immediate
- Slow slightly for explanation or proof
- End with a strong visual hold
- After a major reveal, allow a brief "read moment"
- **Not every second must contain motion.** Small stillness moments make motion feel more intentional.

---

### Composition Theory — Stage Attention, Not Elements

Stop thinking: *"Where can I fit the elements?"*
Start thinking: *"What composition best sells this message?"*

**Every frame must have a clear focal zone.**

**Center focus** — best when:
- Revealing one key word or one object/product
- Making a strong, simple statement
- Aiming for clarity and symmetry
- The message is singular and should feel iconic

**Rule-of-thirds** — best when:
- Text and object need to coexist
- You want asymmetry and visual sophistication
- One side introduces, the other side supports
- The scene has two important elements (one primary, one supporting)

**Split composition** — best when:
- Showing a comparison
- Text on one side, object/UI on the other
- Building a bridge between concept and product (very common in SaaS ads)

**When to use each:**

| Situation | Composition |
|---|---|
| Message is singular, scene should feel iconic | Center |
| Scene has two important elements | Thirds |
| Wide negative space for elegance and isolation | Negative space / sparse center |
| Text + product side-by-side | Split |

---

### Screen-Space Theory — Empty Space Is Not Wasted Space

In premium ads, space does 3 jobs:
1. Isolates the message
2. Creates hierarchy
3. Gives motion room to breathe

Bad generated ads try to *fill* the frame. Premium ads do the opposite — they let the frame stay sparse so the focal element feels important.

**The question to ask every scene is:**
> *What can be removed from this frame?* (Not: what else can be added?)

---

### Camera Theory — Camera Movement Has Purpose

Even in non-literal camera setups, think in camera language. A move should do one of these things:
- Reveal
- Emphasize
- Follow hierarchy
- Create scale
- Transition attention

Not just "add energy."

**Camera move types and when to use them:**

| Move | When to use |
|---|---|
| **Static frame** | When the layout is already strong. Very underrated. Feels premium if composition is good. |
| **Slow push-in** | Makes something feel important. Good for headline or product emphasis. |
| **Slight parallax drift** | Adds life without distraction. Good for premium SaaS/object scenes. |
| **Lateral glide** | When text and object share space and the eye needs guiding. |
| **Reframe** | When moving from one focal zone to another. |

**Camera movement rules:**
- Keep moves subtle
- Tie movement to meaning
- Avoid constant camera drift
- Do not move camera and every object aggressively at the same time
- Let the frame settle after important moments
- When in doubt, reduce movement

> A premium look comes from **confidence**, not hyperactivity.

---

### Hierarchy Theory — Three Levels Always

At any given moment, there are exactly three levels:

| Level | Role |
|---|---|
| **Primary** | What must be seen first |
| **Secondary** | What supports the first thing |
| **Tertiary** | Ambient detail or supporting motion |

If two elements both feel primary, the scene weakens. If the viewer can't immediately identify the most important element, the scene is broken.

**The one-sentence rule:** At any frame, if you can't answer "the viewer is supposed to look at ___" without hesitation, the hierarchy is wrong.

---

### Scene Composition Checklist — Use Before Building Every Scene

For each scene, answer these 6 questions:

1. **Focal point** — What is the eye supposed to hit first?
2. **Supporting element** — What explains or reinforces it?
3. **White space** — Where does the composition breathe?
4. **Motion direction** — Where should the eye move next?
5. **Exit path** — How does this scene transition into the next?
6. **Information density** — Is this a fast scene or a slow scene?

This is how scenes start feeling like a sequence instead of isolated animations.

---

### Pacing by Scene Type

| Scene type | Pacing | Notes |
|---|---|---|
| **Headline scene** | Quick setup | Strong read clarity, minimal competing motion |
| **Product reveal scene** | Slower and deliberate | Allow appreciation; use centered or carefully balanced composition |
| **Feature explanation scene** | Slightly longer | Use spatial organization; keep text and object clearly separated |
| **Proof / transformation scene** | Stronger motion okay | Still one main point at a time |
| **CTA scene** | Shortest | Simplest scene in the ad; cleanest hierarchy; no clutter |

---

### What Makes an Ad Feel Expensive vs. Cheap

**Expensive-feeling ads have:**
- Fewer elements
- Stronger hierarchy
- Better spacing
- Better timing
- More controlled motion
- Cleaner transitions
- More confident holds

**Cheap-feeling ads have:**
- Too many things moving
- No focal discipline
- Pacing that never breathes
- Every scene shouting equally loudly
- Compositions that feel accidental

---

### The Motion Director Checklist — For Every Shot

Before building any scene, answer:

- What is the viewer meant to notice first?
- Where should that element sit in frame?
- How much empty space is needed to make it feel premium?
- How long does the viewer need to understand the moment?
- What should move, and what should stay still?
- Where should the eye go next?

**Composition choice:**
- Center focus → singular strong statements
- Rule-of-thirds → elegant text/object relationships
- Split composition → text + product layouts

**Pacing choice:**
- Fast → hooks and simple reveals
- Slower → explanation and product understanding
- Clean final hold → CTA or payoff

**Camera choice:**
- Static → if composition is already strong
- Slow push → for emphasis
- Lateral drift → for guided attention
- Reframe → only when transitioning focal zones

> Do not let multiple elements compete equally for attention.

---

### The Fundamental Shift

Stop training the agent to **animate elements**.
Start training it to **stage attention over time**.

The ad is not a showcase of animations. It is a sequence of moments, each one handing off the viewer's attention to the next with clarity and intention.

---

## Rhythm, Timing Grids, and Music-Aware Editing

*Added after discussion on audio workflow and music-aware ad production.*

### Core Principle

Every ad has a hidden rhythm grid. Visual transitions should align to musical landmarks — beats, bars, phrase boundaries — but not every motion must be locked rigidly to the beat. Major visual events snap to strong rhythmic points; secondary motion remains fluid between them.

### The Workflow (for this project)

We produce audio externally after the first cut. That means the agent's job is to build a **timing-first, music-aware structure** — then audio is sourced or generated to fit that grid.

**Do not:**
- Animate randomly then throw music under it
- Force visuals to chase an existing song with no pre-planned structure

**Do:**
1. Decide total duration, target BPM range, and where key transitions land — before animating
2. Assign scene lengths in bars, not arbitrary frame counts
3. Export the first cut, then source/generate audio at the matching BPM
4. Drop audio into the studio and sync to beat markers

### BPM Math Reference

| BPM | 1 beat | 1 bar (4 beats) | 2 bars | 4 bars |
|-----|--------|-----------------|--------|--------|
| 100 | 0.60s  | 2.40s           | 4.80s  | 9.60s  |
| 110 | 0.545s | 2.18s           | 4.36s  | 8.73s  |
| 120 | 0.50s  | 2.00s           | 4.00s  | 8.00s  |
| 128 | 0.469s | 1.875s          | 3.75s  | 7.50s  |

**Premium SaaS ad range: 100–122 BPM.** 120 BPM is a useful default — clean math, 1 bar = 2 seconds.

### Scene Length Template (120 BPM)

A strong repeatable structure for ~16-second ads:

| Scene | Bars | Duration |
|-------|------|----------|
| Hook | 2 bars | 4s |
| Problem / Setup | 2 bars | 4s |
| Product Reveal | 2 bars | 4s |
| Feature / Expansion | 2 bars | 4s |
| CTA | 2 bars | 4s |

Total: 10 bars / 20s — trim hook or feature to hit 15–16s.

### Hard Sync vs Soft Sync

**Hard sync these** (must land on beat 1 of a bar, or a strong beat):
- Scene transitions / cuts
- Major text reveals (headline copy)
- Object impacts / landings
- CTA entrance
- Major wipes or motion bridges

**Soft sync these** (can float between beats — keeps the ad feeling human):
- Blur resolves
- Drift motion
- Subtle camera push
- Secondary UI elements
- Background parallax
- Ambient motion

> Over-quantizing everything makes the ad feel robotic. The rule is: strong structural moments snap to rhythm, everything else breathes around it.

### Ad Rhythm Layers (build in this order)

1. **Ad structure** — decide the visual story (hook → feature → payoff → CTA)
2. **Timing grid** — assign BPM, bar lengths, transition points
3. **Animate** — build scenes against the grid, with hard/soft sync in mind
4. **Audio selection** — source or generate music at the target BPM
5. **Micro-sync** — add hits, whooshes, risers, UI clicks, impact sounds, mutes, swells

### What the Agent Should Do When Building a New Ad

- State the target BPM at the start of composition planning
- Assign each scene a bar count, not just a frame count
- Confirm that major visual events (scene changes, text reveals, CTA) land on bar starts or beat 1
- Allow secondary motion (drift, blur, ambient) to live between beats
- Note the total bar count so audio can be matched externally

### Timeline Feature Goals (studio implementation)

- Show BPM beat and bar markers on the ruler
- Snap-to-beat toggle for audio clip positioning
- Scene blocks labelled with their bar length
- Phrase boundary markers at 2-bar and 4-bar intervals

---
