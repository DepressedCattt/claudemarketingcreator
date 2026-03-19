# Ad Creation Learnings

Tracking what works and what doesn't across each round of feedback.
Updated after every critique session.

---

## LEGEND — What's In This File & Where To Find It

*Use this before reading the rest. Jump directly to the section you need.*

---

### CATEGORY A — Design Principles & Rules *(Start here for any new ad)*

| Section | Line | What it covers |
|---|---|---|
| **Running Principles** | 253 | Distilled rules: motion, copy, composition, pacing. The core vocabulary. |
| **What to Always Do / Never Do** | ~280 | Concrete dos and don'ts per principle area. |
| **Reference Ad: `meridian-v1` ⭐** | 300 | The quality benchmark. Scene-by-scene breakdown. Key numbers/specs. |
| **Pre-Ship Visual Audit Checklist** | 613 | Mandatory self-audit before shipping any composition. |
| **Commercial Direction System** | 1572 | Ad must sell, not just impress. Product-first, copy, hierarchy, platform safety. |

---

### CATEGORY B — Motion & Animation Techniques

| Section | Line | What it covers |
|---|---|---|
| **Premium Motion Principles** | 385 | Easing rules, arc motion, blur-resolve, float, depth de-emphasis, typography motion. |
| **Motion Library — `premiumMotion.ts`** | 396 | All hooks/exports with usage guide (`useCinematicTextReveal`, `useArcEntry`, etc.). |
| **Space Utilisation — The Real Rule** | 490 | Focal clarity vs. pixel-filling. Code patterns for centering. |
| **Element Centering & Proportions** | 570 | Critical CSS centering rules. 9:16 layout zones. |
| **Pattern: Hero Component Expansion** | 877 | 1→4 card burst transition. 7 things that make it premium. |
| **Camera Motion Wrapper** | 945 | Scale + rotateZ + translate on scene root. Linear, not eased. |
| **Layout-Aware Blur Reveal Typography** | 1011 | Premium word-by-word reveal where the layout reacts. `<WordReveal>` component. |
| **Round 5 Iteration Log** | 1150 | 6 specific problems fixed: stop-start, flexbox reflow, gap sizing, etc. |
| **Clip-Path Match-Cut Transitions** | 1745 | Brush sweep, vertical wipe, diagonal slash, iris close. Code for all four. |
| **Horizontal Light Sweep** | 1801 | Studio-light sweep effect for hook scenes. |
| **Abstract Hair Texture Visuals** | 1829 | Gradient-ellipse hair strands for beauty ads. No photos needed. |
| **Simulated Cinematography** | 2458 | Depth tier system, parallax multipliers, camera vocabulary, shot spec format. |

---

### CATEGORY C — Pacing, Timing & Commercial Theory

| Section | Line | What it covers |
|---|---|---|
| **Pacing & Composition Theory** | 1237 | The 3 layers of a strong ad. Attention beats. Stage attention over time. |
| **Pacing Theory — Attention Beats** | 1258 | Hook / Explain / Expand / Proof / Resolution beat types. |
| **Composition Theory** | 1296 | Center vs. rule-of-thirds vs. split. When to use each. |
| **Screen-Space Theory** | 1331 | Why empty space is not wasted space. The removal mindset. |
| **Camera Theory** | 1345 | Camera move types and when each is appropriate. |
| **Hierarchy Theory** | 1378 | Three levels always: primary / secondary / tertiary. |
| **Scene Composition Checklist** | 1394 | 6 questions to answer before building every scene. |
| **What Makes an Ad Feel Expensive** | 1421 | Side-by-side expensive vs. cheap ad attributes. |
| **The Motion Director Checklist** | 1441 | Per-shot decision framework (focal, composition, pacing, camera). |
| **Rhythm, Timing Grids & Music** | 1481 | BPM math table, beat grids, hard vs. soft sync, 120 BPM scene template. |

---

### CATEGORY D — 3D / Three.js Techniques

| Section | Line | What it covers |
|---|---|---|
| **3D Layer Architecture** | 1916 | Why we moved to real 3D. Two-layer DOM pattern (CSS → ThreeCanvas → text). |
| **ThreeScene Wrapper** | 1985 | `<ThreeScene>` usage, fov/cameraZ defaults, coordinate system, PPU conversions. |
| **GlassCard Material System** | 2006 | `<GlassCard>` props, material presets (smoked glass, aluminium, plastic, crystal). |
| **ParticleField — InstancedMesh** | 2034 | `<ParticleField>` ambient + burst modes. GPU particles, per-instance opacity workaround. |
| **Post-Processing Chain (Bloom)** | 2077 | Bloom calibration values, luminanceThreshold, mipmapBlur. |
| **Constructive 3D Product Models** | 2129 | Build phones/devices from primitives — no GLTF needed. Geometry vocabulary. |
| **Geometry Vocabulary** | 2140 | Primitive shapes for phones, modules, lenses, buttons, ports. |
| **Proportional Scaling System** | 2159 | Derive all dimensions from real product specs. iPhone example. |
| **Material Presets — Product Surfaces** | 2185 | Titanium, mirror metal, lens glass, screen glass, matte. |
| **Canvas 2D Screen Texture Pattern** | 2215 | `THREE.CanvasTexture`, colorSpace, emissiveMap, flipY behavior. |
| **Product Photography Lighting Rig** | 2262 | Key + fill + rim light positions. Animated reveal sweep. |
| **Product Turn Animation** | 2292 | Pacing rule (90–125f), easeInOut, post-turn oscillation. |
| **Constructive vs GLTF Decision Matrix** | 2317 | When to build vs. import. |
| **Dimension3DAd — 3D vs CSS Proof** | 2336 | 5 capability comparisons. Single persistent ThreeScene pattern. |
| **CSS fails for camera-travel shots** | ~2645 | Hard lesson: why CSS 3D rotations are fake. When to use Three.js. |

---

### CATEGORY E — GLB / Model Loading & iPhone Production

| Section | Line | What it covers |
|---|---|---|
| **GLB / Spline Model Loading — Failure Chain** | 2681 | 5 failure modes documented. `useGLTF`+`Suspense` silently broken in Remotion. |
| **Correct GLB Pattern** | 2695 | `delayRender`/`continueRender` in DOM context. `fitModelToTarget()` normalizer. |
| **Spline Export Problems** | 2720 | Material stripping, 100× scale bug, embedded lights, duplicate geometry. |
| **Phone Screen Realism (3 layers)** | 2792 | Content plane + Canvas glass specular + `MeshPhysicalMaterial` glass overlay. |
| **Black iPhone Material Overrides** | 2842 | Orange-phone fix, React Fast Refresh `useEffect` trap, metalness-based detection. |
| **Phone Screen Text Legibility** | 2880 | Mipmap blur root cause. Fix: `LinearFilter` + 2× canvas resolution. |
| **iPhone 3D Scene Code Map** | 2922 | Symbol index for `CinemaRevealAd.tsx`. What's at which line. Copy-paste patterns. |
| **Preview vs. Render Quality** | 3014 | `isRendering` gate pattern. Cost table per setting. Always-redraw rule. |
| **Screen Plane Sizing — Bezel Calibration** | ~3125 | Calibrated `SCREEN_PLANE_WIDTH/HEIGHT` values. How to adjust. |

---

### CATEGORY F — Ad Production History *(Background context — skim unless reviewing a specific round)*

| Section | Line | What it covers |
|---|---|---|
| **Round 1 — Baseline Test** | 132 | NovaSkin, FlowDesk, TrailBlaze. Screen space and element sizing first identified. |
| **Round 2 — V2 Iteration Fixes** | 188 | What changed. FlowDesk redesign. NovaSkin ingredient hero cards. |
| **Round 3 — Shared Salon Real Brand** | 229 | Venue / Freelancer / Brand ads. Three audience cuts. |
| **Round 4 — Premium Motion Showcase** | 368 | Arcflow, Luminary, Meridian. `premiumMotion.ts` library created. |
| **Session: Hero Expansion Ad** | 653 | Iterative build log. 3D perception, directional drift, prism rim, camera motion. |
| **Round 5 — Layout-Aware Typography** | 1011 | `kinetic-typography-v1`. Blur-reveal word system. Iteration problems log. |
| **Round 6 — Beauty Salon Ads** | 1732 | Élume, Haven, Lumen. Clip-path transitions. Palette differentiation. |
| **Round 7 — SharedSalonFinalAd** | 2361 | 26s product commercial. CSS iPhone frame, CameraWrap, panel flip, `sceneFade`. |

---

### QUICK REFERENCE — Most-Used Code Patterns

| Pattern | Where to find it |
|---|---|
| Camera motion wrapper (scale + roll + pan) | Line 945 (Technique: Camera Motion Wrapper) |
| `useCinematicTextReveal` / all motion hooks | Line 396 (Motion Library table) |
| `prismEdgeShadow()` — 3D card rim technique | Line ~753 (Hero Expansion session) |
| 0×0 absolute anchor for kinetic layouts | Line ~1192 |
| Clip-path transitions (brush, wipe, iris) | Line 1745 |
| `depthDeemphasis` — background recede | Line ~410 (motion library) |
| `sceneFade()` utility | Line ~2411 |
| `fitModelToTarget()` — GLB normalizer | Line 2751 |
| Single `camT` parallax system | Line ~2496 |
| `isRendering` quality gate | Line 3014 |
| Appointment card design pattern | Line 1890 |
| 9:16 vertical layout zones | Line ~591 |
| CSS iPhone frame component | Line ~2380 (Round 7) |
| Three.js coord system / PPU conversions | Line 1968 |
| BPM math + 120 BPM scene template | Line 1502 |

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

## Commercial Direction System

*Added after external review. The existing file covers motion craft well. This section adds the advertising layer that sits above craft: the ad must sell, not just impress.*

---

### Operating Checklist — Run This Before Every Ad

**Commercial**
- Start with the product, the pain, or the payoff immediately
- Make the product legible early; do not let the ad become abstract mood
- Sell one core promise per ad
- Brand through palette, type, shape language, and product surfaces from the start — not just the final logo lock

**Copy**
- Use short, scannable text
- One concept per beat
- Prefer concrete claims, real metrics, and realistic use cases over generic hype

**Hierarchy**
- One primary focal point per frame
- One secondary support element maximum
- Everything else must recede, blur, dim, shrink, or exit

**Motion**
- Motion must clarify continuity, hierarchy, and transformation — not just look slick
- Existing elements should make room for incoming elements
- Every transition should preserve object permanence
- Remove or de-emphasize unimportant elements when a new hero arrives

**Composition**
- Choose center, thirds, or split layout intentionally
- Use negative space to isolate the hero
- Keep key content inside safe zones for the target placement
- Pick aspect ratio based on delivery context, not taste alone

**Timing**
- Hook fast
- Slow slightly as information density increases
- Let major reveals settle before the next element arrives
- Hard-sync structural moments; soft-sync ambient motion

**Audio**
- Use sound to reinforce scene boundaries and hero actions
- Keep music out of the way of reading moments
- Avoid excessive flashing or aggressive sound clutter during dense text moments

**QA**
- Preview on-device and in-placement, not just on canvas
- Check the first 2 seconds muted: is the proposition already visually interesting?
- Check the CTA frame with platform UI overlays mentally applied
- Blur your eyes: is the focal point still obvious?

---

### Commercial Layer — The Ad Must Sell, Not Just Impress

#### 1. Product-First Rule
If it is a product demo ad, the product must be visible early and often enough that the viewer can connect the motion to the offer. Think with Google's ABCD framework explicitly recommends hooking people from the start and, for action-oriented ads, making the product the ad and keeping it visible throughout. Do not let beautiful motion bury the product.

#### 2. One Promise Per Ad
Each ad should sell one core promise, not three. Supporting points can exist, but the viewer should be able to answer "what is this ad really about?" in one sentence. If you cannot state that sentence, the ad needs to be cut down.

#### 3. Show, Then Label
Whenever possible, reveal the visual proof first, then add the copy that explains it. This aligns with the existing "text arrives last" rule and with motion-as-clarification principles. Motion should reveal functionality and spatial logic, not decorate after the fact.

#### 4. Brand Early, But Elegantly
Do not save all branding for the final CTA. The ad should feel unmistakably branded from the opening palette, shape language, typography, or product surface — even if the logo itself is restrained. Early brand recognition reduces cognitive load on the viewer and anchors the entire ad.

---

### Copy Layer — Premium Ads Are Usually Simpler Than You Think

#### 5. Scannability Over Cleverness
For the agent, that means:
- **Hero line:** 2–6 words
- **Support line:** one idea only
- **CTA:** direct, literal, easy to process

Resist the urge to be clever. Clarity converts better than wit.

#### 6. Read-Time Rule
Never introduce more text than the scene duration can support. If the viewer has to decode copy while the layout is still moving, the ad is overloaded. The rule: text should land on a resolved frame, not a moving one.

#### 7. Concrete Language Beats Abstract Hype
"2.4× deeper focus" is stronger than "work better." "Save 3 hours a day" is stronger than "be more productive." Specificity signals confidence and credibility.

---

### Motion Theory Addendum

These rules extend the existing motion pattern library. Apply them in addition to the existing core editorial principles.

#### 8. Transitions Must Preserve Object Permanence
Every transition should answer: what survived, what transformed, what moved, and why? If the viewer cannot track continuity across a cut or transform, the transition may look slick but still feel cheap. The brain should be able to follow the object, not just admire the effect.

#### 9. Use Motion to Remove Unimportant Elements
When a new hero arrives, something else must recede, blur, dim, shrink, or exit. Motion can guide focus by turning surfaces into focal points and removing unimportant elements — it should not just add new things while old things hang around fighting for attention.

#### 10. Duration Discipline
Timing sanity checks by scale of change:
- **Micro transitions** (state changes, small reveals): feel quick and controlled — 150–250ms range
- **Bigger reconfigurations** (layout shifts, component swaps): need a touch more time — 300–500ms range
- **Long travel distance**: should never snap — motion should ease across the full path

Over-short durations for large changes feel cheap. Over-long durations for small changes feel sluggish. Match duration to the perceptual weight of the change.

---

### Composition and Platform Layer

#### 11. Safe-Zone Rule
For vertical ads, all crucial text, logos, and CTA elements must sit inside safe zones so platform UI does not obscure them. This is a hard constraint, not a final polish pass. Meta explicitly documents safe-zone concerns for Stories and Reels placements. Treat the bottom ~20% and top ~15% of vertical frames as potentially obscured by UI chrome — keep primary content out of these regions.

#### 12. Placement-Aware Composition
Aspect ratio is a delivery decision, not an aesthetic one:
- **9:16** — vertical placements: Reels, Stories, Audience Network vertical
- **1:1** — feed placements: Facebook Feed, Instagram Feed
- **16:9** — in-stream/horizontal: YouTube pre-roll, in-stream video

Choose based on the target placement first. Composing in the wrong ratio and then cropping is not the same as composing for the ratio.

#### 13. Color Has a Job
Accent color should indicate hierarchy or action, not just decorate random elements. Use color judiciously to enhance communication, provide continuity, communicate status, and help people understand information. When every element uses an accent color, nothing has accent priority.

---

### Audio Layer Addendum

These rules extend the existing beat-grid system.

#### 14. Audio Must Reinforce Hierarchy
Sound should not wallpaper the ad. Use it to mark scene boundaries, product interactions, headline impacts, and CTA clarity. The beat-grid system is the right foundation — audio accents should support only the top one or two visual priorities per moment. If two things happen simultaneously, only the more important one gets a sound accent.

#### 15. Don't Let Music Compete With Reading
If copy density rises, instrumentation should thin. If the visual is carrying the emotional payoff, the music should not also try to do a giant climax. The viewer cannot process a dense text block and a music swell simultaneously — one will lose.

#### 16. Audio Accessibility
- Avoid overly busy high-frequency sound stacks during dense text moments
- Avoid rapid flashing in central large screen regions
- Avoid repeated intense flashes above safe thresholds
- Background music should not overpower UI sound accents — the mix should be led by the structural hits, with music underneath

---

### Testing Layer

#### 17. Preview in Placement, Not Just on Canvas
Treat previewing as part of the production loop, not as optional QA. Check how the ad looks with platform UI overlays applied — profile picture, username, caption text, action buttons. These UI elements eat real estate and can obscure copy, CTAs, or the product itself.

#### 18. The First-2-Seconds Test
This is a hard test that must pass before an ad is considered done:

1. **Muted at 2 seconds** — is the proposition already visually interesting? Can a viewer tell what the ad is about with no audio and less than 2 seconds of runtime?
2. **Small on mobile** — is the hero still obvious? Does the primary focal point survive at 375px width?

If either of these fails, the hook needs to be redesigned. Most ad drop-off happens in the first 2–3 seconds. The ad cannot earn the back half if it loses people at the front.

---

## Round 6 — Three Beauty Salon Ads (Prompt-Driven Creative Direction)

**Date:** March 2026
**Compositions created:**

| ID | Brand | Format | Duration | Core Innovation |
|---|---|---|---|---|
| `elume-v1` | Élume | 9:16 | 18s | Dark silk luxury editorial — horizontal light sweep, rose-gold palette |
| `haven-v1` | Haven | 9:16 | 18s | Warm trust-building — light ivory hook, appointment card, espresso CTA |
| `lumen-v1` | Lumen | 9:16 | 18s | Kinetic one-shot — clip-path match-cut transitions between every scene |

---

### New Technique: Clip-Path Match-Cut Transitions

**What it is:**
Instead of standard opacity fade-outs, each entering scene uses a `clipPath` CSS property on its `AbsoluteFill` root to create a visually motivated reveal. The clip-path expands or sweeps as a direct style property — no extra transition component needed for most cases.

**Why it's premium:**
It creates the impression of a "continuous camera move" rather than a series of disconnected cuts. Each reveal is motivated by a real-world object or motion in the salon world.

**Four transition types implemented in LumenAd:**

```tsx
// 1. Circular brush sweep (S1 → S2) — like a round brush swept left to right
const brushT = easeOut5(clamp(frame / 26, 0, 1));
const brushW  = brushT * 220;           // 0% → 220% width
const brushX  = -15 + brushT * 65;     // center moves right
const clipPath = `ellipse(${brushW}% 75% at ${brushX}% 50%)`;

// 2. Vertical hair sweep upward (S2 → S3) — like hair lifted by a blow-dryer
const sweepT = easeOut4(clamp(frame / 24, 0, 1));
const insetTop = (1 - sweepT) * 108; // 108% → 0%
const clipPath = `inset(${insetTop}% 0 0 0)`;

// 3. Diagonal slash from top-left (S3 → S4) — like a mirror edge wipe
// DIAG_SLANT = 55 (for 9:16 aspect ratio, produces a visually 45° diagonal)
const slashT = easeOut5(clamp(frame / 26, 0, 1));
const rawTop = slashT * (100 + DIAG_SLANT);
const topX   = Math.min(100, rawTop);
const botX   = Math.max(0, rawTop - DIAG_SLANT);
const clipPath = `polygon(0% 0%, ${topX}% 0%, ${botX}% 100%, 0% 100%)`;

// 4. Iris close (S4 → S5) — black disc growing from center
// Implemented as a separate <Sequence> root-level element (renders above all scenes):
const t = easeInOut3(clamp(frame / 22, 0, 1));
const size = t * 220; // 0% → 220%
// Rendered as: <AbsoluteFill style={{ background: '#080808', clipPath: `circle(${size}% at 50% 50%)` }} />
```

**Implementation rules:**
- Apply `clipPath` AND `WebkitClipPath` on the scene's `AbsoluteFill` root for cross-browser support
- The iris close is a separate `<Sequence>` element at the root-level camera wrapper, NOT inside any scene
- For the iris close, use `zIndex: 99` on the element to ensure it renders above everything
- Content in the scene entering behind the iris should begin animating at ~frame 16 (after the iris clears)
- Vary transition type every scene — never use the same clip-path pattern twice

**The diagonal wipe math for 9:16:**
```
DIAG_SLANT = 55  (empirical for 9:16 — produces visually diagonal sweep)
rawTop = enterT * (100 + DIAG_SLANT)  // 0 → 155
topX   = min(100, rawTop)             // top edge of polygon
botX   = max(0, rawTop - DIAG_SLANT) // bottom edge of polygon
// At enterT=0: nothing visible (degenerate polygon)
// At enterT=1: full frame covered (topX=100, botX=100)
```

---

### New Technique: Horizontal Light Sweep

**What it is:**
A thin translucent beam that sweeps left-to-right in the first frames of a hook scene, simulating a studio light passing across the frame. Used in ElumeAd to signal the "shine" motif before any text appears.

```tsx
// Runs over first ~22 frames of the hook
const sweepT = easeOut5(clamp(frame / 22, 0, 1));
const sweepX = -15 + sweepT * 115; // -15% → 100%

<div style={{
  position: "absolute",
  top: 0, bottom: 0,
  left: `${sweepX}%`,
  width: "28%",
  background: `linear-gradient(90deg, transparent, rgba(240,230,211,0.055), transparent)`,
  transform: "skewX(-6deg)",  // slight skew makes it feel like angled light
}} />
```

**Calibration:**
- Opacity of the beam: 0.04–0.07 (too visible reads as an effect, not a signal)
- Width: 20–35% of canvas width
- Skew: -4° to -10° for the angled-light feel
- Duration: 18–26 frames (fast sweep is more elegant)

---

### New Technique: Abstract Hair Texture Visuals

**What it is:**
Instead of photos, use layered gradient ellipses at consistent angles to simulate the look of dimensional, glossy hair. Combined with a narrow gloss sweep overlay, this reads as a premium hair texture visualization.

```tsx
// Diagonal hair strand layers — graduated, dimensional
{[
  { y: -20, w: 900, h: 70, rot: -14, op: 0.22, c: '#B97C56' },
  { y: 20,  w: 800, h: 55, rot: -11, op: 0.16, c: '#E8C89A' },
  // ... more layers
].map((layer, i) => (
  <div style={{
    position: "absolute",
    width: layer.w, height: layer.h,
    left: -20, top: layer.y,
    borderRadius: `${layer.h * 0.5}px`,  // pill shape = strand
    background: layer.c,
    opacity: layer.op,
    transform: `rotate(${layer.rot}deg)`,
  }} />
))}

// Gloss streak overlay
<div style={{
  position: "absolute",
  top: 0, bottom: 0,
  left: "28%", width: "12%",
  background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent)`,
  transform: "skewX(-12deg)",
}} />
```

**Rules for convincing hair texture:**
- All strands should angle in the SAME general direction (±5° variation)
- Use 5–8 layers with increasing opacity variation
- Strand heights: 50–80px (narrow ellipses look like hair strands)
- Strand widths: 780–950px (extends beyond canvas edges for seamless feel)
- Rotation range: -8° to -18° for a natural downward hair angle
- Gloss streak should be narrow (8–14%) and skewed (-8° to -15°)
- Two gloss streaks at different positions look more dimensional than one

---

### Palette Differentiation — Beauty Ads

Three visually distinct beauty salon palettes that don't clash with each other:

| Brand | Primary | Accent | Background | Mood |
|---|---|---|---|---|
| Élume | Near-black `#0C0A0D` | Rose-gold `#C9837A` | Silk black | High-fashion editorial luxury |
| Haven | Warm ivory `#FAF7F3` | Terracotta `#BC7558` | Warm espresso CTA | Welcoming, human, trustworthy |
| Lumen | Architectural white `#F9F9F8` | Burnished copper `#B97C56` | Jet black `#080808` | Precision, cinema, Scandinavian |

**Why these work together:**
- All use a copper/warm-metal accent family but expressed differently (rose-gold vs terracotta vs copper)
- Background strategies are opposite: Élume = dark throughout, Haven = light throughout, Lumen = light→dark transition
- Haven is the only one that uses a LIGHT hook — consistent with the "warm trust" positioning

---

### Appointment Card Design Pattern

A warm, human-detailed booking card communicates "personalised service" better than any testimonial quote. Key elements:

1. **Confirmed status dot** — green pulsing indicator signals "active, bookable salon"
2. **Date/time block** — real specificity (Saturday, 11:00am) is more believable than generic
3. **Stylist profile** — avatar initial + name + years experience = instant trust signal
4. **First visit note** — proactively addressing hesitation in the card itself ("First visit? We'll take care of everything.")
5. **Service label** — not just the service name, but the category ("Cut & Color Consultation" not "Haircut")

---

### The Missing Mindset

The existing file covers motion craft. This addendum adds the commercial direction layer. The combined question to ask about every ad is not just:

> "Does this animation look premium?"

But:

> "Does this communicate the offer clearly, early, memorably, and safely in a real ad placement?"

Both must be true. A technically excellent ad that buries the product, confuses the offer, or gets clipped by platform UI has failed — regardless of how good the motion is.

---

## 3D Layer Architecture — Real Three.js in Remotion

### Why We Moved to Real 3D

The CSS `rotateX/Y` "3D" technique used in earlier compositions hit a hard ceiling:

```
filter: blur() or drop-shadow() on a parent element ALWAYS breaks
transform-style: preserve-3d on all descendants.
→ Every CSS 3D card was actually flat. Depth was an illusion via boxShadow math.
```

The prism rim `boxShadow` technique (see §603–656) was a workaround. Real Three.js removes the limitation entirely. What we now get for free:

- **Real environment map reflections** on card surfaces (IBL via `<Environment>` from drei)
- **MeshPhysicalMaterial**: roughness, metalness, transmission (glass refraction)
- **GPU-accelerated particles**: InstancedMesh handles 500–2000 particles at the same cost as 22 CSS divs
- **Post-processing Bloom**: real light bleed on emissive surfaces, not `box-shadow` approximations
- **No `preserve-3d` constraints**: lights, shadows, and materials work correctly regardless of parent filters

### All Dependencies Already Installed

No new installs required — these were already in `package.json`:

| Package | Role |
|---|---|
| `@remotion/three` | ThreeCanvas — connects R3F to Remotion's frame system |
| `@react-three/fiber` | React renderer for Three.js inside ThreeCanvas |
| `@react-three/drei` | Helpers: Environment, PerspectiveCamera, RoundedBox |
| `@react-three/postprocessing` | EffectComposer, Bloom, DepthOfField |
| `three` | Core engine |

### The Two-Layer Architecture

Every composition using 3D follows this DOM order (later = on top):

```
<AbsoluteFill background>          ← Layer 1: CSS backgrounds, glow gradients
<ThreeScene alpha=true>            ← Layer 2: 3D objects (transparent BG)
  <GlassCard />
  <ParticleField />
  <pointLight />
</ThreeScene>
<div text overlays>                ← Layer 3: all text, UI, buttons
```

DOM order is the z-ordering mechanism. No explicit `z-index` needed.
The ThreeCanvas `alpha: true` makes the canvas background transparent — Layer 1 CSS elements
behind it show through the transparent areas (around 3D objects).

**Critical rule:** All text/UI JSX must come AFTER the ThreeScene element in the JSX tree.

### Coordinate System

Camera defaults: `fov=40`, `cameraZ=6`, vertical FOV.

| Canvas size | Frustum height at z=0 | PPU (pixels per world unit) |
|---|---|---|
| 1080 × 1080 | 4.37 units | 247 px/unit |
| 1080 × 1920 | 4.37 units | 439 px/unit (both axes) |

Converting CSS pixel offsets (from canvas centre) to world units:
```ts
worldX =  cssOffsetX / PPU;  // X axis: same direction as CSS
worldY = -cssOffsetY / PPU;  // Y axis: INVERTED (Three.js Y is up, CSS Y is down)
```

Use `canvasPosToWorld(canvasX, canvasY, width, height, PPU)` from `src/utils/three`.

### ThreeScene Wrapper

```tsx
import { ThreeScene } from "../utils/three";

// Inside any composition — takes width/height from useVideoConfig() automatically
<ThreeScene
  fov={40}
  cameraZ={6}
  environment="studio"    // 'studio', 'sunset', 'warehouse', etc.
  enableBloom={true}
  bloomIntensity={0.9}
  bloomThreshold={0.35}
>
  {/* R3F content here */}
</ThreeScene>
```

**Performance constraint:** Set `gl={{ antialias: false }}` (the default) — disabling MSAA on the WebGL context saves ~30% render cost. Bloom compensates visually for aliasing.
Limit to ≤ 2 post-processing passes per composition.

### GlassCard Material System

`GlassCard` from `src/utils/three` replicates the full ApexAd DealCard entry animation in 3D:

```tsx
<GlassCard
  entryFrame={0}           // Local Sequence frame when card enters
  fromX={-110}             // Arc entry offset in CSS px (same values as CSS version)
  fromY={150}
  exitFrame={120}          // Local frame when card fades out
  deemphasizeFrame={120}   // Optional: card shifts right + recedes (for Features scene)
  accentColor="#F97316"
  roughness={0.06}         // 0 = mirror, 0.06 = glass-smooth, 1 = matte
  metalness={0.1}          // Slight metalness adds reflective sheen
  transmission={0.20}      // 0 = opaque, 0.20 = dark smoked glass
  envMapIntensity={2.0}    // IBL reflection strength — higher = more mirror-like
/>
```

The same `useArcEntry`, `useHeroFloatDelayed`, `depthDeemphasis` hooks from `premiumMotion.ts`
drive the animation — pixel values are divided by PPU to get world units.

**Material presets:**
- `roughness: 0.06, metalness: 0.1, transmission: 0.20` — dark smoked glass (default)
- `roughness: 0.02, metalness: 0.8, transmission: 0.0` — brushed aluminium
- `roughness: 0.4,  metalness: 0.3, transmission: 0.0` — matte soft plastic
- `roughness: 0.05, metalness: 0.1, transmission: 0.85` — clear crystal glass

### ParticleField — InstancedMesh System

Replaces inline `<div>` particle arrays. GPU-accelerated — 500 particles costs less than 22 CSS div radial-gradient particles.

```tsx
import { ParticleField } from "../utils/three";

// Ambient atmospheric particles (background atmosphere)
<ParticleField
  count={500}
  mode="ambient"
  spread={2.8}       // Radius in world units (2.8 ≈ 692px on 1080px canvas)
  color="#F97316"
  size={0.018}       // 0.018 ≈ 4.4px — sub-pixel dots
  opacity={0.2}
  speed={1.0}
/>

// Directed burst (blow dryer, spark jets, etc.)
<ParticleField
  count={350}
  mode="burst"
  emitterPos={[-0.09, 0.64, 0]}  // World-space emitter (use canvasPosToWorld)
  burstAngle={Math.PI}            // Direction: Math.PI = going left (-X)
  burstSpread={0.62}              // ±35° spread in radians
  burstFrame={6}                  // Local frame when burst starts
  burstDuration={52}              // Life of each particle in frames
  burstDelayRange={22}            // Stagger range in frames
  burstLoop={false}               // One-shot burst
  burstVelocity={0.022}          // Units per frame (0.022 ≈ 9.6px/frame @ 439 PPU)
  color="#FFF0D2"
  size={0.024}
  opacity={0.72}
/>
```

**Per-instance opacity limitation:** InstancedMesh only supports per-instance color (RGB), not
per-instance opacity. Fade effects are approximated via scale: life-cycle scale ramps `0→1→0`
over a particle's `burstDuration`. This creates a visually equivalent fade without a custom shader.

**Stable pseudo-random:** Uses golden ratio fractional sequence — no `Math.random()` during render.
All positions are deterministic from seed, matching Remotion's frame-by-frame rendering model.

### Post-Processing Chain

```tsx
// Inside ThreeScene, enableBloom activates EffectComposer:
<ThreeScene enableBloom bloomIntensity={0.9} bloomThreshold={0.35}>
  {/* Objects with emissive material or bright surfaces bloom */}
  <mesh>
    <meshStandardMaterial emissive="#F97316" emissiveIntensity={3.0} />
  </mesh>
</ThreeScene>
```

**Bloom calibration:**
- `intensity: 0.6–0.9` — subtle premium glow (product quality)
- `intensity: 1.0–1.5` — cinematic bloom (sci-fi / tech ads)
- `intensity: > 2.0` — over-done, reads cheap
- `luminanceThreshold: 0.3–0.4` — only very bright areas bloom (keeps dark surfaces clean)
- `mipmapBlur: true` — always on; smoother falloff

### Particle Upgrade Reference: AuraSalonAd

**Before:** 22 inline `<div>` particles with CSS `radial-gradient`, rendered as styled divs.
**After:** 510 InstancedMesh particles in two layers (350 primary + 160 secondary).

The nozzle position for a 1080×1920 canvas (`NOZZLE_X=500, NOZZLE_Y=680`) converts to:
```ts
const AURA_PPU = 439;  // 1 world unit = 439px for 1080×1920 with fov=40, cameraZ=6
const NOZZLE_WORLD = [-40 / AURA_PPU, 280 / AURA_PPU, 0]; // ≈ [-0.091, 0.638, 0]
// CSS offset from centre: (500-540, 680-960) = (-40, -280) px
// Three.js Y is up: negate the CSS Y offset
```

### What Stays CSS (Never Replace These)

- All text entrances — `useCinematicTextReveal` stays CSS (`filter: blur`, `translateY`)
- `clipPath` scene transitions — CSS only, ThreeCanvas can't do 2D clip paths
- Camera motion wrapper (outer `scale + rotateZ + translateX/Y` div) — CSS transforms
  work on the ThreeCanvas element exactly like any other HTML element
- Scene backgrounds and gradient glows — CSS is cheaper and sufficient for 2D gradients

### Reference Implementation

`src/compositions/ApexAd3D.tsx` — registered as `id="apex-3d-v1"` in Root.tsx.

Compare it side-by-side with `src/compositions/ApexAd.tsx` (`id="apex-v1"`) to see:
- Scene 2 (Demo): CSS DealCard → GlassCard + ThreeScene
- CSS glow div visible through transparent ThreeCanvas
- Text/UI positioned after ThreeScene in DOM (renders on top automatically)
- Scenes 1, 3, 4, 5: unchanged from CSS version

---

## Constructive 3D Product Models — No GLTF Required

**Reference compositions:** `IPhoneAd.tsx` (`id="iphone-v1"`), `Dimension3DAd.tsx` (`id="dimension-3d-v1"`)

The instinct when building a product-hero ad is to reach for a pre-made `.glb` model.
That creates a hard dependency on external assets and async loading that fights Remotion's
synchronous, frame-exact rendering model. The learnings below show how to build a
convincingly realistic product from Three.js primitives alone.

---

### Geometry Vocabulary for Constructive Modelling

A realistic complex object is assembled from a small number of primitive shapes. iPhone as example:

| Part | Geometry | Key config |
|---|---|---|
| Body chassis | `<RoundedBox>` | `radius` ≈ 4–5% of height; `smoothness={6}` |
| Screen bezel gap | Omit — body edge IS the bezel | Use `PW - 0.030` for screen width |
| Camera module | `<RoundedBox>` | Slightly raised (`z` offset = protrusion amount) |
| Camera lenses | `<cylinderGeometry>` | Rotate X by `π/2` so cap faces Z (back of phone) |
| Lens rings | Two concentric cylinders, `LROUT` and `LR` | Outer = titanium ring, inner = glass |
| Buttons | `<boxGeometry>` | Thin width, positioned at `±PW/2 + protrusion/2` |
| Ports/grilles | `<boxGeometry>` | Flush at `y = -PH/2 + ε` for bottom edge |

**Key principle:** Every part is a separate `<mesh>` in a `<group>`. The group handles shared
position/rotation. Positioning is always relative to the body's world-space centre.

---

### Proportional Scaling System

Never invent dimensions — derive everything from real product specs.
For any rectangular device (phone, laptop, tablet, box):

```ts
// 1. Pick a world-unit height that looks right at your camera settings.
//    At cameraZ=5, fov=36 on 1080×1080 canvas:
//    1 world unit ≈ 332px → PHONE_H = 1.85 → ~615px ≈ 57% of frame height

const REAL_H_MM = 163;      // iPhone 16 Pro
const PHONE_H   = 1.85;     // chosen scale

// 2. Derive all other dims from real aspect ratios
const PHONE_W = PHONE_H * (77.6  / 163);  // real width / real height
const PHONE_D = PHONE_H * (8.25  / 163);  // real depth / real height

// 3. Sub-components follow the same ratio
const MODULE  = PHONE_H * (40.4  / 163);  // camera module square
const LENS_R  = PHONE_H * (6.2   / 163);  // lens inner radius
```

This guarantees the model will look like the actual product regardless of world scale.

---

### Material Presets for Common Product Surfaces

Calibrated for `environment="studio"` (IBL source). Different environments shift all values.

```ts
// Natural Titanium (iPhone Pro chassis, watches, aerospace parts)
const titanium = { color: "#ABABAB", metalness: 0.88, roughness: 0.14, envMapIntensity: 2.0 };

// Polished Mirror Metal (jewellery, lens rings)
const mirror   = { color: "#C8C8C8", metalness: 0.98, roughness: 0.02, envMapIntensity: 2.8 };

// Camera Lens Glass (dark, slight transmission)
const lensGlass = { color: "#050507", roughness: 0.02, metalness: 0.08, transmission: 0.22, thickness: 0.05 };

// Screen Glass (very slight transmission = realistic depth to screen)
const screenGlass = { color: "#050506", roughness: 0.015, metalness: 0.0, transmission: 0.08, thickness: 0.06 };

// Matte Plastic / Ceramic
const matte = { color: "#18181B", metalness: 0.05, roughness: 0.80 };
```

**Stacking glass layers:** For a realistic screen, use TWO planes at slightly different Z:
1. Screen texture plane (`map` + `emissiveMap`)
2. Glass plane slightly in front (`transmission`, `envMapIntensity` for IBL reflections)

The glass plane captures studio IBL reflections that slide across the screen as the phone
rotates — exactly what real tempered glass does.

---

### Canvas 2D Screen Texture Pattern

Use `THREE.CanvasTexture` to paint realistic UI content. This avoids async image loading
and works perfectly in Remotion's synchronous rendering environment.

```ts
function buildScreenCanvas(): HTMLCanvasElement {
  const W = 512, H = 1108;  // maintain device aspect ratio (390:844 = iPhone)
  const c  = document.createElement("canvas");
  c.width  = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  // 1. Wallpaper: radial gradient aurora blobs
  // 2. System chrome: Dynamic Island, status bar, home indicator
  // 3. UI content: time, notification cards, dock
  return c;
}

// In the R3F component:
const screenTexture = useMemo(() => {
  const t = new THREE.CanvasTexture(buildScreenCanvas());
  t.colorSpace = THREE.SRGBColorSpace;  // critical — without this, colours are dim
  return t;
}, []);

useEffect(() => () => { screenTexture.dispose(); }, [screenTexture]);

// On the mesh:
<meshStandardMaterial
  map={screenTexture}
  emissiveMap={screenTexture}           // same texture drives both colour AND glow
  emissive={new THREE.Color(1, 1, 1)}
  emissiveIntensity={0.45}              // 0.4–0.5 = realistic lit-from-within feel
/>
```

**`colorSpace = THREE.SRGBColorSpace`** — without this, Canvas 2D colours are treated as
linear, making them dim and washed out. Always set on canvas-generated textures.

**`emissiveMap = screenTexture`** — makes the screen emit light that feeds into Bloom
post-processing, creating the soft halo visible around a real phone screen in a dark room.

**Canvas Y-axis:** `CanvasTexture` sets `flipY = true` by default, correcting Canvas 2D
top-left origin to OpenGL bottom-left. Draw normally — it will appear the right way up.

---

### Product Photography Lighting Rig

Three-point product lighting differs from the ambient fill used in graphic/brand ads:

```tsx
{/* Key — warm, strong, upper-right-front. Primary illumination. */}
<pointLight position={[1.8, 2.2, 2.8]} color="#FFF8F0" intensity={5.5} distance={9} decay={1.5} />

{/* Fill — cool, opposite side, lower. Opens up shadow side. */}
<pointLight position={[-2.5, 0.4, 1.8]} color="#EEF4FF" intensity={2.0} distance={8} decay={2} />

{/* Rim — from BEHIND the product. Creates the edge "catch" highlight. */}
<pointLight position={[0.5, 0.8, -3.2]} color="#FFFFFF" intensity={4.0} distance={7} decay={1.8} />
```

**Animated reveal sweep** — a moving point light timed to the product's turn animation.
Highest-impact single addition for product photography quality:

```tsx
const sweepX = interpolate(frame, [TURN_START, TURN_END], [-2.8, 2.8], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});
<pointLight position={[sweepX, 1.5, 2.2]} color="#FFFFFF" intensity={peakAtCentre} />
```

**Rim light importance:** Position at `z = -(DEPTH/2 + 0.5)` to catch the back edge of a
metallic chassis. This is what makes titanium read as titanium rather than painted plastic.

---

### Product Turn Animation — Pacing for Impact

The back-to-front turn is the hero moment of any product reveal:

```ts
// Rule: 90–125 frames (3–4.2s) for an epic turn. Below 60f = cheap. Above 150f = boring.
// Always easeInOut. Always born-moving (start angle slightly less than π).

const TURN_FRAMES = 125;  // 4.17s — cinematic

const t    = easeInOut3((frame - TURN_START) / TURN_FRAMES);
const rotY = (1 - t) * Math.PI * 0.88;  // starts at 158°, decelerates to 0
```

**Post-turn oscillation:** Prevents snap-to-static feel after the turn lands:
```ts
const settle = easeOut4(Math.min(1, localFrame / 35));  // amplitude decays
const rotY   = Math.sin(localFrame / 88 * Math.PI) * 0.065 * settle;
```

**Camera swing for back reveal:** After the front hero, tilt the phone back using two equal
easeInOut segments (swing out + swing back). Return journey = same duration as forward.

---

### Constructive 3D vs Imported Models — Decision Matrix

| Scenario | Approach |
|---|---|
| Clean geometric products (phones, laptops, tablets, bottles, boxes) | Constructive primitives ✓ |
| Organic shapes (people, animals, cars, furniture) | GLTF import (manage async carefully) |
| Abstract brand geometry | Always constructive |
| Animated sub-components (folding, iris, opening) | Constructive — direct frame control |
| Photo-real hero shot needing PBR textures | GLTF if available; constructive otherwise |

**Constructive advantages over GLTF:**
- No async loading — synchronous, works with Remotion frame-exact model
- Full material control — any property animatable per-frame
- Dimensions derived from real specs — guaranteed accurate proportions
- Composable R3F sub-components (`<CameraModule />`, `<SideButtons />`)
- No external file dependency — self-contained composition

---

### Dimension3DAd — 5 Proof Points for 3D vs CSS

`src/compositions/Dimension3DAd.tsx` (`id="dimension-3d-v1"`) — use this as a reference
when pitching the 3D approach or explaining the capability delta to collaborators.

| Scene | 3D capability | CSS equivalent |
|---|---|---|
| Glass Orbits | 3 `MeshPhysicalMaterial` types on identical geometry under shared IBL | `box-shadow` pseudo-rim — cannot vary by material |
| Particle Storm | 1,200 GPU particles with per-instance colour | ~22 CSS divs hard cap before jank |
| Material Live | `roughness/metalness/transmission` animated simultaneously | Impossible — CSS has no material model |
| Helix Depth | 800 particles with real perspective foreshortening in Z | `z-index` is binary, not physical |
| Bloom Burst | Post-processing light bleed from emissive surfaces | `box-shadow`/`radial-gradient` fake shape only |

**Single persistent ThreeScene pattern** — the correct architecture for multi-scene 3D
compositions. All scenes share ONE `ThreeCanvas`; each component self-gates with `null`:

```tsx
<ThreeScene enableBloom>
  <SceneOneContent />   {/* returns null outside f0–90 */}
  <SceneTwoContent />   {/* returns null outside f90–180 */}
</ThreeScene>
```

---

## Round 7 — SharedSalonFinalAd: Premium 26-Second Product Commercial

**Date:** March 2026
**Composition:** `shared-salon-final` (`src/compositions/SharedSalonFinalAd.tsx`)
**Format:** 9:16, 1080 × 1920, 780 frames @ 30fps (26 seconds)
**Rhythm:** 120 BPM — 1 bar = 60f, major transitions hard-synced to bar boundaries

### Scene Breakdown

| Scene | Frames | Duration | Concept | Key Technique |
|---|---|---|---|---|
| S1 Phone Reveal | f0–119 | 4s | Hero device cinematic upward track | clipPath inset shrinks from bottom + scale dolly-back |
| S2 UI Alive | f120–209 | 3s | Elements lift off screen into depth | Staggered floating divs with translateY + blur resolve |
| S3 Card Flip | f210–329 | 4s | How it works — 3D card sequence | perspective + rotateX from 78° → 0° per card |
| S4 Marketplace | f330–449 | 4s | Two-sided market panel reveal | CSS 3D `preserve-3d` panel with backfaceVisibility hidden |
| S5 Create Listing | f450–569 | 4s | Venue owner journey — list & launch | Progress bar fill + checklist + button press animation |
| S6 Payoff | f570–689 | 4s | Results — listing goes live | Booking cards, revenue counter, benefit statements |
| S7 Brand Close | f690–779 | 3s | Premium CTA landing | SHARED SALON word slam + breathing glow button |

### New Patterns Established

**CSS iPhone Frame Component:**
A reusable premium CSS-based iPhone (no Three.js). Key details:
- `PH_W × PH_H = 412 × 870` at 77.6:163 aspect ratio (iPhone 16 Pro)
- Titanium frame: `linear-gradient(160deg, #3A3D4A → #1C1E27 → #1A1C24 → #252830 → #2E313C)`
- Edge highlights: thin left/right/top gradient overlays at 3–6% of phone width
- Side buttons as `4px` wide absolute divs with matching metallic gradient
- Dynamic Island: `128 × 34px` pill at `top: 13, centered`, `background: #0B0D14`
- Screen inset: `10px LR, 16px top, 12px bottom`, `borderRadius: 42`
- `boxShadow` with 6-layer shadow stack for convincing depth and ambient shadow
- Gloss overlay: `linear-gradient(145deg)` diagonal reflection at ~3.5% opacity

**CameraWrap component:**
Generic camera motion wrapper usable on any scene. Accepts `zoom`, `rollRange`, `panX`, `panY`.
Linear motion (not eased) per established principle. Default: 3% zoom, ±0.3° roll, ±8px pan.

**AppScreen component (Shared Salon miniaturized UI):**
A full CSS representation of the Shared Salon landing page at phone-screen scale (392 × 842px).
Key elements: status bar, Dynamic Island space, nav, badge, 25px headline, CTA buttons, trust row, "Up & running" section with step cards, "Whether you cut or host" dual panels.
Font sizes range from 8px (labels) to 25px (headline) — appropriate for phone-screen rendering.

**3D Panel Flip (Scene 4):**
Two-sided CSS 3D flip using `preserve-3d` + `backfaceVisibility: hidden`.
- Parent: `perspective: 2200px, perspectiveOrigin: 50% 50%`
- Container: `transformStyle: preserve-3d, rotateY(0→180deg)`
- Front face: Stylist panel (blue gradient)
- Back face: Venue panel (dark warm) — pre-rotated `rotateY(180deg)`
- Energy midpoint glow: `interpolate(rotY, [60, 90, 120], [0, 1, 0])` driving a radial glow burst
- Easing: `eio3` (ease-in-out cubic) for physical card flip feel

**sceneFade utility:**
```tsx
function sceneFade(frame: number, dur: number, fadeLen = 12): number {
  return interpolate(frame, [dur - fadeLen, dur], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
}
```
Apply to the `opacity` of every scene's `AbsoluteFill`. Prevents jarring cuts.

**120 BPM Phone Reveal (clipPath upward track):**
```tsx
// Camera track upward: clip inset shrinks from top
const clipTop = (1 - trackT) * 70;  // 70% → 0%
// Apply: clipPath: `inset(${clipTop}% 0 0 0 round ${PH_CR}px)`

// Parallax: screen content starts scrolled down, rises to show full UI
const scrollY = (1 - eo4(trackT)) * 380;  // 380px → 0px

// Camera dolly-back: starts zoomed in, pulls to natural
const camScale = 1.0 + (1 - eo4(pr(frame, 0, 80))) * 0.10;  // 1.10 → 1.0
```

### What Made It Work

1. **The `clipPath inset` reveal**: Instead of moving the phone, clipping the viewport gives the impression of camera movement along a fixed subject. Much more cinematic than a simple translateY.

2. **Parallax scrollY on screen content**: The app screen starts "scrolled down" and eases to zero scroll as the clip reveals. This means as the camera "rises," it sees increasingly higher parts of the screen — authentic parallax behavior.

3. **3D card flip with `rotateX` from 78°→0°**: Each step card enters tilted back (nearly flat/hidden) and rotates to face-on. The `perspective: 1400px` + `transformOrigin: "top center"` creates a satisfying "flip forward" that matches the storyboard description.

4. **Staggered booking cards in S6**: Left/right alternating entry directions (not just bottom-up) give the results scene a genuine "incoming" feeling.

5. **The energy midpoint glow on panel flip**: Interpolating glow opacity from the `rotY` angle with `[60, 90, 120] → [0, 1, 0]` gives a natural energy burst at the exact midpoint of the flip.

6. **CameraWrap on every scene**: Consistent 2–3% dolly-in + ±0.3° roll makes the entire 26s feel like a cohesive camera production, not isolated static scenes.

### What to Use from This Ad

- `IPhoneFrame` and `AppScreen` components: copy-paste ready for any phone-based ad
- `CameraWrap` component: reusable across any future composition
- `sceneFade()` utility: standard pattern — use everywhere
- The clipPath phone reveal technique: for any "camera tracking upward" effect
- The CSS 3D panel flip: for any two-sided marketplace or comparison reveal

---

## Simulated Cinematography — Depth Tiers, Parallax, and Virtual Cameras

**Source:** Deliberate study session on translating real cinematography principles into a Remotion/CSS scene graph.
**Reference composition:** `CinemaRevealAd` (`src/compositions/CinemaRevealAd.tsx`) — 9:16, 10s, gold luxury fragrance reveal.

---

### The Core Mental Shift

Wrong way to think:
> "Place 2D element on screen → animate transform properties."

Right way to think:
> "Build a composed 3D stage out of layered 2D planes → move a virtual camera through that stage."

The one-sentence principle to encode:
> **Do not animate objects on a screen. Build a layered world and move a camera through it.**

Without this shift, even technically impressive animations read as *motion graphics*, not *cinematography*.

---

### The Depth Tier System

Every scene must be blocked in depth before any animation is written. Assign each element to exactly one tier:

| Tier | Name | Parallax multiplier | Notes |
|------|------|---------------------|-------|
| 0 | Background | 2–4% | Near-anchored; feels like a distant wall |
| 1 | Mid-back | 6–10% | Ambient planes, glow blobs |
| 2 | Midground | 18–25% | Feature cards, secondary UI, labels |
| 3 | Hero | 0% | The camera's subject — stays centered |
| 4 | Foreground | 45–70% | Blurred bokeh; can and should cross frame edges |

**The differential between Tier 0 and Tier 4 is the proof of space.** If they move at the same rate, there is no space.

---

### The Single Camera Value Pattern

All parallax should reference a **single camera travel variable** (`camT`), not individual per-element velocities. Each layer multiplies `camT` by its tier factor:

```tsx
// One value drives the entire world
const camT = pr(frame, 0, totalFrames); // 0→1 over clip duration

// Each depth tier uses a different multiplier
const bgDrift         = camT * 0.02 * WORLD_HEIGHT;   // Tier 0 — almost anchored
const midBackDrift    = camT * 0.07 * WORLD_HEIGHT;   // Tier 1
const midgroundDrift  = camT * 0.20 * WORLD_HEIGHT;   // Tier 2
// Hero (Tier 3) = 0 — camera tracks the hero
const foregroundDrift = camT * 0.55 * WORLD_HEIGHT;   // Tier 4 — crosses frame
```

Apply as `top: baseY + drift` or `translateY(${drift}px)`. The background stays still; the foreground sweeps. That differential IS the depth.

---

### Camera Vocabulary — Build Blocks for Shots

| Term | Description | CSS implementation |
|------|-------------|-------------------|
| **Pedestal up** | Camera moves vertically upward | `clipTop` 75%→0% + `scale` decrease + `rotateX` levels out |
| **Dolly out** | Camera moves backward | `scale` 2.4→0.78 with easing |
| **Orbit / pivot** | Camera arcs around subject | `rotateY` 0°→16° with `perspective` |
| **Tilt up/down** | Camera rotates vertically | `rotateX` change |
| **Parallax drift** | Depth proof via differential motion | `camT` × tier multipliers |
| **Rack focus sim** | Emphasis shift between layers | `blur()` change on foreground vs hero |
| **Hero reveal** | Movement ends on clear subject shot | Camera settles + text fades in |

For the pedestal-up + dolly-back move specifically:
```tsx
// Phase 1: Camera Rise (f0–100)
const clipTop = (1 - eo5(riseT)) * 74;    // 74% → 0%
const rotX    = -20 + eo4(riseT) * 18;    // -20° → -2° (levels out)
const scale   = 2.4 - eo4(riseT) * 0.85;  // 2.4 → 1.55

// Phase 2: Pivot (f100–175)
const rotY = eo5(pivotT) * 16; // 0° → 16° (3D dimensionality reveal)

// Phase 3: Dolly Back (f175–300)
const scale = 1.30 - eo4(revealT) * 0.52; // 1.30 → 0.78
```

---

### The Shot Spec Format

Write this as the header comment block of every cinematic composition before writing any animation code:

```
Shot Intent:    [What emotion or information does the move deliver?]
Hero Object:    [What is the anchor?]

Scene Layers:
  foreground:   [Blurred/close elements]      — X% parallax
  midground:    [Feature cards, secondary UI]  — X% parallax
  hero:         [Main product/object]          — 0% (anchor)
  mid-back:     [Ambient light, glow planes]   — X% parallax
  background:   [Gradient, grid, environment]  — X% parallax

Camera Path:
  f0–N:    [Phase name] — transforms, direction, start→end values
  fN–M:    [Phase name] — ...
  fM–end:  [Phase name] — ...

Depth Behavior:
  Foreground drifts [X]px over clip. Background drifts [Y]px. Delta = proof of space.

Composition Goal:
  End frame — what the final composed shot looks like.
```

**Why this matters:** Writing the spec forces you to define layers before animating. If you can't fill in the depth behavior row, you don't understand the shot yet.

---

### Simulating 3D Volume Without Three.js

A product object can feel three-dimensional using stacked CSS planes:

```tsx
// Backing shadow plane — implies depth exists behind the object
<div style={{ background: "rgba(0,0,0,0.55)", filter: "blur(26px)", transform: "translateX(6px) translateY(10px)" }} />

// Side face — revealed as rotateY increases, proves the object has thickness
{sideVisible > 0.01 && (
  <div style={{ width: sideW, opacity: sideVisible * 0.85 }} />
)}

// Front face — specular stripe shifts horizontally as camera pivots (fakes IBL reflection)
const specularLeft = `${18 - sideVisible * 12}%`; // moves left as rotateY increases

// Cap, label, engravings — complete the object's identity
```

The key: the **specular stripe shifts position** as `rotateY` increases. That movement = simulated environment reflection = volume without Three.js.

---

### Parallax Direction Reference

When camera pedestals **up** or **pulls back**:
- Near objects (high angular velocity) → appear to drift **down** in frame faster
- Far objects (low angular velocity) → appear to barely move

CSS implementation:
```tsx
// Camera rises → foreground top increases → orb moves DOWN (correct — proves it's close)
top: baseY + camT * parallaxMultiplier * WORLD_HEIGHT

// Background barely moves
backgroundPosition: `0 ${camT * 4}px`  // 4px over entire clip = essentially anchored
```

**Sanity check at end of clip:** Foreground elements should have drifted significantly (possibly off frame). Background should look nearly identical to frame 0. If they've moved the same amount, there is no depth.

---

### When Camera Motion Feels Real vs. Fake

**Reads as real camera work:**
- Different layers move at different rates (parallax differential)
- Motion is eased, not linear (eo4/eo5, not lerp)
- Organic micro-drift on top of programmatic motion (handheld feel)
- `clipPath` reveal instead of `translateY` reveal (viewport moves, object is still)
- Text appears *after* the move settles, not during it
- Foreground elements partially exit frame

**Reads as motion graphics:**
- All elements scale/translate at the same rate
- Background is visually dead while hero moves
- Text animates simultaneously with camera motion
- Everything moves as if glued to one flat plane

**The clipPath trick (most important):** `clipPath: inset(X% 0 0 0)` shrinking from top gives the impression the camera is *rising to see* the object, not that the object is sliding down. The object stays fixed in world space; only the viewport changes. This is the single best technique for faking camera motion with CSS.

---

### Five Rules — Always Apply

1. **Block depth before animating.** Assign every element to a tier. Do not write animation code before this is done.
2. **Use one `camT` value for all parallax.** Do not invent individual animation curves per element — they'll feel disconnected from each other.
3. **The hero is the anchor.** Camera tracks the hero. The world moves around a centered hero.
4. **Keep foreground blurred.** Foreground elements should always have `blur()`. Sharp foreground competes with the hero.
5. **Text enters after the camera settles.** Motion = camera traveling. Text = camera has arrived. Never show both simultaneously.

---

### Why CSS Fails for Camera-Travel Shots (Hard Lesson)

The first version of `CinemaRevealAd` attempted to simulate a "camera rising along a product" using CSS — `clipPath` opening from the top, `rotateX` leveling out, `scale` decreasing. It looked terrible. Specifically:

**Problem 1: CSS side faces are a lie.** The "side face" was a separate div positioned next to the bottle with `sideVisible * 42px` width. It had no perspective, no shared lighting, no physical connection to the front face. It looked like a grey card stuck to the side of the bottle.

**Problem 2: CSS `rotateX/Y/Z` is fake rotation.** When you rotate a 2D element in CSS 3D, only one face gets lighter/darker based on ambient rules. There are no real normals, no real material response. You can't simulate IBL (image-based lighting) with CSS gradients.

**Problem 3: There is no camera in CSS.** `clipPath` + `scale` simulate what a camera *at a fixed angle* might see at different zoom levels. But a camera that *travels through space* requires that every object in the scene responds with its own correct perspective shift as the camera moves past it. CSS applies all transforms to one DOM subtree uniformly — there is no Z-axis that all objects share.

**The specific failure:** A pedestal-up shot requires that the camera physically rises in 3D space, and every object in the scene shows parallax proportional to its Z depth. Objects in front appear to move faster; objects behind appear to move slower. This is only possible if there is a shared 3D coordinate system with real depth.

**Rule:** For any shot where the camera *travels through space relative to a solid object*, use Three.js. CSS is only appropriate for flat layer animations where depth is an illusion, not a requirement.

---

### What Was Built

**`CinemaRevealAd` v2** — `src/compositions/CinemaRevealAd.tsx` — 9:16 portrait, 300 frames (10s), registered as `cinema-reveal`.

A Three.js product reveal with a real animated camera (not CSS tricks). Generic phone slab device, `CameraRig` physically moves `camera.position` and `camera.lookAt()` each frame, 3-tier particle system at different Z depths for real parallax.

The v1 CSS version (fragrance bottle) demonstrating all five principles:
- 5-tier depth system (bg grid → mid-back blobs → midground cards → hero bottle → foreground bokeh)
- Pedestal rise (clipPath + rotateX + scale) → 3D pivot (rotateY) → dolly back (scale)
- Single `camT` driving all parallax — multipliers ranging from 0.02 to 0.70
- CSS volume simulation: backing shadow plane + side face reveal + specular stripe shift
- Handheld micro-drift (3 frequency components) on top of programmatic motion
- Text enters only after camera settles at f208 — never during camera travel

The end frame shows the full ecosystem: feature cards at left/right, background grid visible, bottle centered — a composed reveal shot where space has been proven by differential motion.

---

## GLB / Spline Model Loading in Remotion + React Three Fiber — Root Cause Analysis

After an extended debugging session trying to render a Spline-exported GLB inside a Remotion + R3F (`@remotion/three`) composition, a complete failure chain was identified. Documented here so future sessions avoid every one of these traps.

### The Failure Chain (in order of discovery)

**1. `useGLTF` + `Suspense` inside `ThreeCanvas` is invisible to Remotion's renderer.**

Remotion's headless frame-capture pipeline takes a screenshot the moment React finishes painting the DOM. It does not observe Suspense boundaries inside `ThreeCanvas` — those run inside R3F's separate React reconciler. When Remotion screenshots the frame, `<Suspense fallback={null}>` is still in the suspended/loading state, so nothing renders. There is no error; just a blank frame.

`useGLTF.preload()` also does not help in headless renders — it fires an XHR but there is no guarantee it completes before the capture deadline.

**Rule:** Never use `useGLTF` + `Suspense` inside `ThreeCanvas` in a Remotion composition. It works in interactive browser previews but fails silently in headless renders.

---

**2. The correct pattern: `delayRender`/`continueRender` in the DOM context (outside `ThreeCanvas`).**

GLB loading must happen in a regular React component *above* the canvas, using Remotion's native async-gate mechanism:

```tsx
// The delayRender handle must be created synchronously at mount time
const [handle] = useState(() => delayRender("Loading model"));

useEffect(() => {
  new GLTFLoader().loadAsync(url)
    .then((gltf) => {
      setScene(gltf.scene);
      continueRender(handle);
    })
    .catch(() => continueRender(handle)); // always unblock, even on error
}, []);
```

Key points:
- `delayRender()` must be called inside the `useState(() => ...)` initializer — not inside `useEffect` — to guarantee it fires before the first render attempt.
- This component lives in the DOM React tree (outside `ThreeCanvas`) so Remotion's capture pipeline sees the delay handle.
- The loaded `THREE.Group` is passed down as a prop to the R3F component tree.

---

**3. Spline GLB exports have systematic material, scale, and node-transform problems.**

| Problem | Cause | Fix |
|---|---|---|
| Model invisible or fully transparent | Spline's shader materials don't map to GLTF PBR; opacity/alphaMode is often wrong | After load, traverse all meshes and replace materials with `MeshStandardMaterial` |
| Model 100× too large | Spline uses centimeters internally; GLTF/Three.js expects meters | Root node carries `scale = 0.01` to compensate — do not apply additional scale to the root |
| Scene overexposed / blown out | Spline embeds its own `PointLight` / `DirectionalLight` nodes in the GLB | `gltf.scene.traverse(n => { if (n.isLight) { n.intensity = 0; n.visible = false; } })` |
| Duplicate geometry | Spline scenes often contain multiple model copies | Use `getObjectByName` to identify and hide unwanted nodes |

**Spline does NOT export:** Environment maps, post-processing, animation states, physics, or events. Anything relying on those is silently stripped.

---

**4. `getObjectByName` + `<primitive>` causes scale compounding and offset displacement.**

If you extract a child node to render independently:
- The child carries its *local-space* position offset (which can be hundreds of Spline units from the origin).
- The parent's `scale = 0.01` correction is no longer applied. If you apply your own scale on top, it compounds the raw Spline units — making the model microscopic or enormous.
- `Box3.setFromObject()` on an un-parented child gives incorrect world-space bounds unless `updateWorldMatrix(true, true)` is called first.

**Rule:** Always work on `gltf.scene` (the root group), never on extracted child nodes.

---

**5. The correct approach: bounding-box normalization after load.**

Do not assume known dimensions or node names. After loading, measure and normalize:

```ts
function fitModelToTarget(scene: THREE.Group, targetHeight: number): void {
  scene.updateWorldMatrix(true, true);
  const box    = new THREE.Box3().setFromObject(scene);
  const size   = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const scale = targetHeight / size.y;      // make phone targetHeight world-units tall
  scene.scale.setScalar(scale);

  // Re-measure after scaling, then offset to center at origin
  box.setFromObject(scene);
  box.getCenter(center);
  scene.position.sub(center);               // centroid → world origin
}
```

---

### Why the Primitive Model Was Built Instead

After hitting every one of the above failures, the decision was made to build the phone from Three.js primitives (`RoundedBox`, `cylinderGeometry`, canvas textures, `MeshPhysicalMaterial`). This is always the most reliable path in Remotion:
- No external asset dependency — no GLB parsing, node-name guessing, or scale archaeology
- Full control over material properties, UV layout, and lighting response
- Zero async loading — no `delayRender` needed
- Renders identically in studio preview and headless render

### When to Use a GLB in Remotion (Future Sessions)

GLBs are worth using for complex organic geometry. The pattern that works:

1. Load in DOM context with `delayRender`/`continueRender` in `useState` initializer
2. Traverse and strip all embedded lights: `n.isLight → n.intensity = 0; n.visible = false`
3. Replace all materials with known `MeshStandardMaterial` properties
4. Run `fitModelToTarget` to normalize scale and centering on `gltf.scene` (the root)
5. Pass resolved `gltf.scene` as a prop into `ThreeCanvas`
6. Render as `<primitive object={scene} />` — never extract child nodes

For Spline exports specifically, always prefer primitives unless the geometry is truly irreplaceable.

---

## Phone Screen Realism in Three.js / Remotion

*Added after CinemaRevealAd iPhone 17 Pro Max session.*

A real phone screen has three distinct optical layers that must all be simulated for a convincing result:

### Layer 1 — Content plane (`MeshBasicMaterial`)
The animated canvas texture. `MeshBasicMaterial` is correct here — self-lit, unaffected by scene lights. Using `MeshStandardMaterial` causes the screen to go dark or oversaturated depending on scene lighting.

```tsx
<meshBasicMaterial map={canvasTexture} transparent depthWrite={false} toneMapped={false} />
```

### Layer 2 — Screen glass specular (Canvas 2D)
Drawn directly on the canvas, above the content but below the Dynamic Island/home indicator overlays. An angled `createLinearGradient` from top-left → bottom-right at ~18 % opacity. Breathing the opacity slowly (`sin(frame/180 * π)`) prevents it from looking frozen.

```ts
const breathe = 0.55 + 0.45 * Math.abs(Math.sin(frame / 180 * Math.PI));
const grad = ctx.createLinearGradient(0, 0, W * 0.65, H * 0.35);
grad.addColorStop(0,    `rgba(255,255,255,${0.18 * breathe})`);
grad.addColorStop(0.45, `rgba(255,255,255,${0.07 * breathe})`);
grad.addColorStop(1,    "rgba(255,255,255,0)");
ctx.fillStyle = grad;
ctx.fillRect(0, 0, W, H * 0.38);
```

### Layer 3 — Glass gloss plane (`MeshPhysicalMaterial`)
A second `<mesh>` plane 2 mm in front of the content plane. `clearcoat=1` is the key property — it simulates the thin-film glass-on-OLED effect you see on real iPhones under studio lights. `envMapIntensity=0.55` drives the IBL reflection visible when the camera orbits.

```tsx
<mesh position={[SCREEN_X - 0.002, 0, 0]} rotation={[0, -Math.PI/2, 0]} renderOrder={2}>
  <planeGeometry args={[W, H]} />
  <meshPhysicalMaterial
    color="#F0F5FF"        // very subtle cool tint — matches iPhone OLED
    transparent opacity={0.10}
    roughness={0.04}       // nearly mirror
    metalness={0}
    envMapIntensity={0.55}
    clearcoat={1.0}
    clearcoatRoughness={0.03}
    depthWrite={false}
    toneMapped={false}
  />
</mesh>
```

**Why this matters:** Without the glass layer, the screen looks like a sticker on plastic. With all three layers, the specular changes as the camera orbits, and the glass picks up environment colour — exactly as it would in a product shoot.

---

## Black iPhone Material Overrides — Lessons Learned

### The orange-phone problem
GLB files from Sketchfab and similar sources bake the original product colours (often a warm copper/orange) into `baseColorFactor`. Simply loading the model gives you a Halloween-orange phone. The fix is to traverse all meshes after load and override `m.color`.

### React Fast Refresh skips `useEffect([], [])`
React Fast Refresh (Vite HMR) does "soft updates" — re-renders without unmounting. This means `useEffect([], [])` does NOT re-fire after a hot reload. Any material overrides placed only inside that effect will be silently skipped.

**Pattern that works:** apply overrides in the **render body** gated by a `useRef` version check:

```tsx
const colorAppliedRef = useRef(-1);
// In render body (not in useEffect):
if (scene && colorAppliedRef.current !== CACHE_VER) {
  colorAppliedRef.current = CACHE_VER;
  scene.traverse(child => { /* apply colors */ });
}
```

Bump `CACHE_VER` whenever you change material values. This is O(1) per frame (only traverses once per version).

### Differentiate materials by original metalness
Without knowing exact mesh names (they vary by source file), read `m.metalness` *before* any override. The artist's original intent is encoded there:

| Original metalness | Mesh type | Black Titanium treatment |
|---|---|---|
| > 0.65 | Frame / rails | `#252528`, metalness 0.88, roughness 0.20 — brushed metallic |
| 0.25–0.65 | Body / back panel | `#1C1C1E`, metalness 0.45, roughness 0.48 — matte dark |
| < 0.25 | Camera glass / sensors | `#111114`, metalness 0.10, roughness 0.08 — glossy dark |

### envMapIntensity is the orange-blooming culprit
`envMapIntensity` defaults to `1.0` in `MeshStandardMaterial`. On a near-black surface with the "city" HDRI, even 30 % IBL contribution looks orange. Keep it at `0.08–0.20` for phone body materials.

### Name-agnostic is always safer
Mesh names in Three.js come from GLTF node names, which vary by exporter and version. Never rely on exact name matching for material overrides in production. Use name fragments (`n.includes('glass')`) or property thresholds (`m.transparent && m.opacity < 0.5`) instead.

---

## Phone Screen Text Legibility — Texture Resolution & Filtering

### Root cause: mipmap blur at near-1:1 scale
When a `CanvasTexture` is rendered at a size close to but slightly smaller than the source canvas, Three.js trilinear filtering (`LinearMipmapLinearFilter`) interpolates between the full-resolution mipmap and the next (half-resolution) mipmap. At 90 % scale this blend is ~20 % of the blurry lower mip — enough to make small text illegible. This is especially visible on retina (2×) displays where the rendered texel size is half a CSS pixel.

### Fix: disable mipmaps, double canvas resolution
```ts
// WRONG — mipmaps blur text at near-100% scale
t.minFilter       = THREE.LinearMipmapLinearFilter;
t.generateMipmaps = true;

// RIGHT — full-resolution sampling, no mip interpolation
t.minFilter       = THREE.LinearFilter;
t.generateMipmaps = false;
```
Also increase `SCR_W`/`SCR_H` from `1024×2214` to `2048×4428`. At 2× canvas density the rendering is 2.3× oversampled relative to the output plane — even `LinearFilter` produces perfectly sharp text.

### Scale all canvas draw coordinates
When changing `SCR_W`, hard-coded pixel constants (corner radii, Dynamic Island, home indicator, status bar strip) must scale proportionally. Define:
```ts
const S = W / 1024; // scale factor, e.g. 2 at SCR_W=2048
```
Then multiply every canvas constant by `S`:
```ts
ctx.roundRect(0, 0, W, H, 175 * S);                          // clip radius
ctx.roundRect((W - 448 * S) / 2, 28 * S, 448 * S, 80 * S, 40 * S); // Dynamic Island
ctx.roundRect(W / 2 - 144 * S, H - 36 * S, 288 * S, 14 * S, 7 * S); // home bar
ctx.fillRect(0, 0, W, 130 * S);                               // status bar strip
```

### Retina renderer support
Add `dpr={[1, 2]}` to `ThreeCanvas` — Remotion's Three.js canvas will use the device pixel ratio (up to 2×) so it renders at native resolution on HiDPI screens.

### HQ export scripts
`--scale 2` in Remotion doubles the output resolution (e.g. 1080 → 2160) and renders all assets at 2× detail. `--crf 8` ensures minimal H.264 compression artefacts:
```
npm run render:iphone:hq   # 2× scale, CRF 8, 100% JPEG quality
npm run still:iphone:hq    # single frame at 2× for inspection
```

---

## iPhone 3D Scene — Code Map

Everything needed to build a new iPhone scene lives in one file. **Do not recreate any of this — import or copy from there.**

### Primary file
`src/compositions/CinemaRevealAd.tsx` — 1121 lines

### What's inside and where

| Symbol | Line | What it is |
|---|---|---|
| `MODEL_URL` | 45 | `staticFile("models/iphone17.glb")` — GLB path |
| `SCREEN_IMG_URL` | 56 | `staticFile("images/shared-salon.png")` — screen content |
| `CACHE_VER` | 50 | Bump this integer to force a GLB material reload |
| `cachedScene` | 52 | Module-level GLB cache — survives hot-reloads, shared in session |
| `cachedScreenImg` | 53 | Module-level PNG cache |
| `cl / eo3 / eo4 / eo5 / pr` | 59–63 | Easing helpers (clamp, ease-out-3/4/5, progress-range) |
| `PH / PW / PD / CR` | 71–74 | Phone world-space dimensions (height 1.85 units) |
| `PHONE_HALF_H` | 75 | `PH / 2 ≈ 0.925` — used to position floor and lights |
| `SW / SH` | 78–79 | Screen area (minimal bezels) |
| `SCR_W / SCR_H` | 94–95 | Canvas texture size: `2048 × 4428` |
| `drawScreenFrame()` | 110 | Draws one frame of screen content to a 2D canvas context |
| `GLBPhoneModel` | ~530 | R3F component — renders the loaded GLB + screen plane + glass overlay |
| `IPhoneModel` | ~640 | Fallback placeholder shown while GLB is loading |
| `StudioFloor` | 707 | Shadow-receiving plane for white studio look |
| `ProductLighting` | ~670 | Directional + point lights tuned for white studio |
| `bindScreenMat()` | 908 | Applies Black Titanium materials to all GLB meshes by metalness |
| `CinemaRevealAd` (root) | 840 | Main component — holds delayRender, canvas, GLB loading, color patch |

### Key patterns to reuse in every new iPhone scene

**1. GLB + screen loading (copy the useState + useEffect block, lines 855–1003)**
```tsx
// Canvas texture
const [screenCanvas, screenTexture] = useMemo(() => { ... }, []);
// Image load with delayRender (60s timeout)
const [imgHandle] = useState(() => cachedScreenImg ? null : delayRender("...", { timeoutInMilliseconds: 60_000 }));
// GLB load with delayRender (120s timeout)
const [handle] = useState(() => cachedScene ? null : delayRender("...", { timeoutInMilliseconds: 120_000 }));
```

**2. Render-body color patch (lines 1014–~1050)**  
Must run in render body (not useEffect) gated by `colorAppliedRef.current !== CACHE_VER`. Traverses scene and applies Black Titanium by original metalness value.

**3. Camera rig pattern**  
Define a `CameraRig` component that calls `useThree()` to get `camera`, then sets `camera.position` and `camera.lookAt()` based on `useCurrentFrame()`. Use `eo4(pr(frame, start, duration))` for all easing.

**4. Scene JSX template (with preview/render quality gate)**
```tsx
// At top of component, BEFORE useMemo:
const { isRendering } = getRemotionEnvironment();
const canvasW = isRendering ? SCR_W : SCR_W / 4;
const canvasH = isRendering ? SCR_H : SCR_H / 4;

// ThreeCanvas JSX:
<ThreeCanvas
  width={width} height={height}
  shadows={isRendering ? { type: THREE.PCFShadowMap } : false}
  dpr={isRendering ? [1, 2] : [1, 1]}
  gl={{ antialias: isRendering, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 0.82 }}
>
  <CameraRig />
  <ambientLight intensity={0.40} color="#FFFFFF" />
  <Environment preset="studio" resolution={isRendering ? 512 : 64} background={false} />
  <ProductLighting />
  <StudioFloor />
  {phoneScene ? <GLBPhoneModel scene={phoneScene} texture={screenTexture} /> : <IPhoneModel />}
  {isRendering && <EffectComposer multisampling={4}><SMAA /></EffectComposer>}
</ThreeCanvas>
```

### Assets
| File | Description |
|---|---|
| `public/models/iphone17.glb` | iPhone 17 Pro Max (Sketchfab, ~20 MB) |
| `public/images/shared-salon.png` | Screen content screenshot |

### Registry + Root entries
- `src/Root.tsx` — add `<Composition id="..." component={...} ... />`
- `studio/src/registry.ts` — add entry to `REGISTRY` array for studio timeline

### Render commands
```
npm run render:iphone        # normal quality → out/cinema-reveal.mp4
npm run render:iphone:hq     # 2× scale, CRF 8 → out/cinema-reveal-hq.mp4
npm run still:iphone         # single frame still
npm run still:iphone:hq      # single frame still at 2×
```
Or use the **⬆ Render…** button in the studio UI for full options.

---

## Preview vs. Render Quality — Two-Mode System

Every 3D composition should gate expensive settings behind `getRemotionEnvironment().isRendering`.  
`isRendering` is `false` in Remotion Studio (browser), `true` in headless Chrome (actual render).  
It is **constant for the lifetime of the page** — safe to use in `useMemo` dep arrays.

### Root cause of low preview FPS

The main bottleneck is **CPU → GPU texture uploads**, not GPU render time itself.  
Three.js uses WebGL (GPU), but uploading a 2048×4428 RGBA canvas texture costs ~36 MB **per frame** on the main thread. At 30fps that's ~1 GB/s — which tanks preview scrubbing.

### Standard quality gate pattern

```tsx
import { getRemotionEnvironment } from "remotion";

export const MyAd: React.FC = () => {
  // Call BEFORE any useMemo/useState so canvas is sized correctly from creation.
  // isRendering is constant per session — no stale closure issues.
  const { isRendering } = getRemotionEnvironment();

  // 4× smaller canvas in preview → 16× fewer pixels to upload per frame
  const canvasW = isRendering ? SCR_W : SCR_W / 4;  // 2048 → 512
  const canvasH = isRendering ? SCR_H : SCR_H / 4;  // 4428 → 1107

  const [screenCanvas, screenTexture] = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width  = canvasW;
    canvas.height = canvasH;
    const t = new THREE.CanvasTexture(canvas);
    t.minFilter       = THREE.LinearFilter;
    t.generateMipmaps = false;
    t.anisotropy      = isRendering ? 16 : 1;  // anisotropic filtering preview-off
    return [canvas, t] as const;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ... inside JSX:
  return (
    <ThreeCanvas
      shadows={isRendering ? { type: THREE.PCFShadowMap } : false}
      dpr={isRendering ? [1, 2] : [1, 1]}
      gl={{ antialias: isRendering, ... }}
    >
      <Environment resolution={isRendering ? 512 : 64} ... />
      {isRendering && <EffectComposer multisampling={4}><SMAA /></EffectComposer>}
    </ThreeCanvas>
  );
};
```

### Draw function — always use `ctx.canvas.width/height`, never hardcoded constants

```tsx
// ✅ Correct — works at any resolution
function drawScreenFrame(ctx, frame, img) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const S = W / 1024; // scale all authored-at-1024 constants proportionally
  ...
}

// ❌ Wrong — breaks when canvas is smaller for preview
function drawScreenFrame(ctx, frame, img) {
  const W = SCR_W, H = SCR_H;  // hardcoded — ignores actual canvas size
  ...
}
```

### Static screen content — DO NOT try to skip redraws via useRef

It's tempting to draw the canvas once and skip all subsequent `needsUpdate` calls using a `useRef(false)` flag. **Do not do this.** It breaks on React Fast Refresh hot-reloads:

- `useMemo` re-runs on hot-reload → new **blank** canvas + new texture
- `useRef` value is **preserved** across hot-reloads (not reset)
- The flag stays `true` → draw is skipped → screen stays blank permanently

The canvas size reduction (512px in preview) already makes the per-frame draw + upload cost negligible (~2.25 MB vs ~36 MB). Just always redraw:

```tsx
// ✅ Correct — always draw; canvas is small in preview, cost is low
const screenCtx = screenCanvas.getContext("2d")!;
drawScreenContent(screenCtx, screenImg);
screenTexture.needsUpdate = true;

// ❌ Wrong — ref survives hot-reload, new blank canvas never gets painted
const screenReadyRef = useRef(false);
if (!screenReadyRef.current) {
  drawScreenContent(screenCtx, screenImg);
  screenTexture.needsUpdate = true;
  if (screenImg?.complete) screenReadyRef.current = true;
}
```

### Summary of what each setting costs in preview

| Setting | Preview cost | Final render |
|---|---|---|
| Canvas texture 2048×4428 | ~36 MB/frame upload | Needed for sharp text |
| `dpr={[1, 2]}` | 4× more pixels to render | Needed for retina |
| `antialias: true` | Extra GPU pass | Needed for clean edges |
| `shadows` (PCFShadowMap) | Shadow map recompute/frame | Needed for studio floor |
| `Environment resolution={512}` | Large IBL cube texture | Needed for accurate reflections |
| `EffectComposer` SMAA + 4× MSAA | Extra render pass | Needed for edge quality |
| `anisotropy={16}` | Anisotropic texture filter | Needed for oblique screen angles |

### Files this is implemented in
- `src/compositions/CinemaRevealAd.tsx` — animated scroll screen, 480 frames
- `src/compositions/AwesomeAd.tsx` — static screen, 150 frames

---

## Screen Plane Sizing — Bezel Calibration

The screen overlay plane should be **inset from the GLB screen mesh** so the Black Titanium frame shows clearly on all four sides. Sizing it to match the GLB mesh exactly makes the bezels invisible.

### Phone world-space reference dimensions
| Symbol | Value | What it is |
|---|---|---|
| `PW` | `0.880` | Phone width (world units) |
| `PH` | `1.850` | Phone height (world units) |
| GLB screen mesh | `0.853 × 1.827` | Original screen.001_0 mesh size (don't use this) |

### Current calibrated values (both CinemaRevealAd + AwesomeAd)
```ts
const SCREEN_PLANE_WIDTH  = 0.816;   // side bezel gap = (0.880 - 0.816) / 2 = 0.032 per side
const SCREEN_PLANE_HEIGHT = 1.778;   // top/btm gap   = (1.850 - 1.778) / 2 = 0.036 per side
```

### How to adjust
Every `0.010` change in width shifts each side bezel by ~5.7mm equivalent in world scale.  
- **Too thin (screen too large):** decrease both values  
- **Too thick (screen too small):** increase both values  
- Keep the width/height ratio at `0.816 / 1.778 ≈ 0.459` to stay proportional

### Why not use the GLB mesh size
The `screen.001_0` mesh in `iphone17.glb` extends almost to the phone frame edge. Using its exact dimensions (0.853 × 1.827) leaves only ~1.5% gap per side — invisible at most camera angles. The inset overlay approach gives full control over bezel width independent of the GLB.

---
