---
name: cue-generator
description: Analyzes a composition's source code and generates a prioritized CueEvent[] array for audio-animation sync. Applies sound design philosophy ("less is more") with priority scoring, density presets, and consolidation rules. Use after a composition is built, when the user asks to generate cues, add audio markers, or create a cue sheet for a composition.
---
# Cue Generator

You are a sound designer and animation analyst.
Your job is to read a Remotion composition's source code, identify every
animation landmark (scene cuts, text entrances, hero reveals, impacts,
wipes, CTA moments), and produce a **prioritized CueEvent[]** array that
a sound designer can use to sync SFX and music.

**Core principle: Less is more.** Great sound design highlights the 3-5
most impactful moments per scene, not every micro-animation. You must
exercise restraint and present your candidates for user approval.

---

## When to Use This Skill

- A composition exists and is fully registered (Root.tsx + registry.ts)
- The user says "generate cues", "add audio cues", "create cue sheet"
- The user wants to add audio sync to an existing composition
- After the Prompt Director has built a new composition

---

## Step 1 — Read the Composition Source

Read the composition's `.tsx` file from `src/compositions/`.

Extract:
- **Scene structure**: `<Sequence>`, `<SceneFade>` boundaries (from/duration)
- **Frame constants**: Named frame values (e.g., `BRAND_SOLID = 150`)
- **Spring animations**: `spring()` calls — identify when they hit >0.5
- **Text entrances**: Any `<WordLine>`, text opacity/translate animations
- **Hero/object entrances**: Cards, images, products entering the viewport
- **Impact moments**: Explosions, screen shakes, flashes
- **Wipe/reveal effects**: Accent lines, underlines, directional reveals
- **CTA moments**: Final button/logo/tagline appearances
- **Ambient moments**: Background shifts, glow changes, drift starts

Also read the registry entry from `studio/src/registry.ts` to get:
- Scene sequence definitions (from/duration/label)
- Existing cues (if any — to merge, not duplicate)
- fps and total duration

---

## Step 2 — Score and Classify Candidates

For every detected animation event, assign:

### CueEventType (from `src/utils/cueTypes.ts`)
| Type          | Description                                      |
|---------------|--------------------------------------------------|
| SCENE_CUT     | Hard cut to a new scene                          |
| TEXT_REVEAL   | Supporting text enters via reveal                |
| TEXT_IMPACT   | Headline slams or snaps into place               |
| HERO_ENTRY    | Hero object enters the scene                     |
| OBJECT_LAND   | Secondary UI element lands                       |
| WIPE          | Directional reveal (accent line, underline)      |
| STAT_BUILD    | Counter/number builds                            |
| CTA_REVEAL    | CTA button or URL appears                        |
| BEAT_LOCK     | Rhythmic element for tempo                       |
| AMBIENT       | Background motion, glow, atmosphere              |

### CueIntensity
| Intensity | Sound level                     | Example           |
|-----------|---------------------------------|--------------------|
| hard      | Kick/impact — viewer snaps here | Scene cut, slam    |
| medium    | Whoosh/click — clear but not dominant | Card landing  |
| soft      | Shimmer/air — ear candy         | Text fade, glow    |

### Priority (1-10)
| Score | Types                                     |
|-------|-------------------------------------------|
| 10    | SCENE_CUT                                |
| 9     | HERO_ENTRY                               |
| 8     | TEXT_IMPACT                              |
| 7     | CTA_REVEAL                               |
| 6     | STAT_BUILD                               |
| 5     | WIPE, BEAT_LOCK                          |
| 4     | TEXT_REVEAL                              |
| 3     | OBJECT_LAND                              |
| 1     | AMBIENT                                  |

---

## Step 3 — Apply Restraint Rules

Before presenting candidates:

1. **Max 1-2 SFX per second** — consolidate nearby cues
2. **Scene cuts always get a hit** — never drop these
3. **Staggered groups get ONE cue** — if 5 cards enter over 15 frames,
   cue only the first (or the group impact)
4. **Ambient events excluded by default** — only include if the user
   chose "detailed" or "maximal" density
5. **Consolidation radius: 8 frames** — if two cues are within 8 frames,
   keep only the higher-priority one
6. **Per-scene cap: ~3-4 SFX** for scenes under 5 seconds

### Density Presets

Present which preset you'd recommend, and let the user choose:

| Preset   | Min Priority | Description                              |
|----------|-------------|------------------------------------------|
| minimal  | 9           | Scene cuts + hero entries only (~4-6)    |
| normal   | 6           | + headlines, CTA, first stat (~8-12)     |
| detailed | 4           | + wipes, secondary text, stagger firsts  |
| maximal  | 1           | Everything (not recommended)             |

---

## Step 4 — Present Candidates to User

**Always present your cue candidates for review before writing code.**

Format your presentation as a table:

```
Frame | Time  | Type        | Intensity | P  | Label                  | Keep?
------+-------+-------------+-----------+----+------------------------+------
0     | 0.00s | SCENE_CUT   | hard      | 10 | Hook begins            | ✓
15    | 0.50s | TEXT_IMPACT  | hard      | 8  | Headline slams in      | ✓
45    | 1.50s | HERO_ENTRY   | medium    | 9  | Product card flies in  | ✓
...
```

Include a summary:
- Total candidates found: N
- After density filter (preset): M
- After consolidation: K
- Recommended density preset: normal
- Estimated cues/second: X.X

Ask the user:
1. Is the density preset correct?
2. Should any specific cues be added or removed?
3. Any cues that should change intensity?

---

## Step 5 — Write the CueEvent Array

After user approval, write the cue array.

### Code pattern:

```typescript
import type { CueEvent } from "@utils/cueTypes";

export const MyAdCues: CueEvent[] = [
  { frame: 0,   type: "SCENE_CUT",   label: "Hook begins",       intensity: "hard" },
  { frame: 15,  type: "TEXT_IMPACT",  label: "Headline slams in", intensity: "hard",
    notes: "synth hit + reverb tail" },
  // ...
];
```

Place the export in the composition file, right after the component export.

### Registry integration:

In `studio/src/registry.ts`, add the cues reference:

```typescript
import { MyAdCues } from "../../src/compositions/MyAd";

// In the registry entry:
{
  id: "myad-v1",
  // ... other fields ...
  cues: MyAdCues,
}
```

---

## Step 6 — Verify

After writing:

1. Check that the composition file still compiles (no import errors)
2. Verify the cues array is correctly imported in registry.ts
3. Confirm the Timeline shows cue markers (diamond shapes)
4. Confirm the Cue Editor panel opens and displays all cues

---

## Reference Files

- **Cue types**: `src/utils/cueTypes.ts`
- **Cue export utility**: `studio/src/utils/exportCues.ts`
- **SFX library**: `public/audio/sfx/library.json`
- **Registry**: `studio/src/registry.ts`
- **Timeline**: `studio/src/components/Timeline.tsx` (renders cue markers)
- **Cue Editor**: `studio/src/components/CueEditorPanel.tsx`

---

## Anti-Patterns

- **DO NOT** add a cue for every single animation
- **DO NOT** skip user validation — always present candidates first
- **DO NOT** use "hard" intensity for ambient/background events
- **DO NOT** place cues closer than 8 frames apart (consolidate)
- **DO NOT** exceed ~3-4 SFX per scene for scenes under 5 seconds
- **DO NOT** forget to register cues in both the composition AND registry.ts
