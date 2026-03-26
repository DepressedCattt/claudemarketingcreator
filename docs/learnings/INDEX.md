# Knowledge Index

The learning system is organized into focused topic files. Use this index to find what you need.

---

## Routing: "I need to..." → Read this

| Task | File |
|------|------|
| Start a new ad / understand design principles | [principles.md](principles.md) |
| Implement motion or animation technique | [motion.md](motion.md) |
| Design scene pacing or timing | [pacing.md](pacing.md) |
| Work with 3D / Three.js / iPhone models | [three-d.md](three-d.md) |
| Use video background plates | [video-workflow.md](video-workflow.md) |
| Create SVG assets via AI pipeline | [svg-pipeline.md](svg-pipeline.md) |
| See what worked for a specific ad | [ads/](ads/) (per-ad post-mortems) |
| Check spring config ranges | [../params/physics.md](../params/physics.md) |
| Choose a style profile | [../profiles/](../profiles/) |
| Find a specific technique recipe | [../recipes/](../recipes/) |
| Understand production history | [ARCHIVE.md](ARCHIVE.md) (full original file) |

---

## Topic Files

| File | What it contains | Max target size |
|------|-----------------|-----------------|
| `principles.md` | Design rules, commercial direction, composition guidelines, pre-ship audit, reference ad (meridian-v1) | 800 lines |
| `motion.md` | Premium motion library, easing rules, arc/blur/float, camera wrappers, clip-path transitions, cinematography, SVG proportioning | 800 lines |
| `pacing.md` | Attention beats, composition theory, camera theory, hierarchy, BPM/timing grids, rhythm | 800 lines |
| `three-d.md` | Three.js architecture, GlassCard, particles, constructive models, GLB loading, iPhone production, screen realism | 800 lines |
| `video-workflow.md` | Hybrid video plates, VideoPlate component, scrim table, Kling prompt templates | 400 lines |
| `svg-pipeline.md` | Sighted SVG pipeline, semantic color maps, render-read-refine loop | 400 lines |

---

## Per-Ad Post-Mortems (`ads/`)

| File | Ad | Key lessons |
|------|------|------------|
| `ads/calmly.md` | CalmlyAd | Kinetic typography, epicyclic blobs, coast phase, dynamic camera, narrative drag |
| `ads/animly.md` | AnimlyAd/SmallSpotAd | Arc-length splines, velocity-continuous handoffs, Gaussian sweeps, SVG-HTML swaps, goo morphing |
| `ads/shared-salon.md` | SharedSalonFinalAd | CSS iPhone frame, panel flip, sceneFade utility, 26s commercial pacing |

---

## Where to put NEW learnings

Follow the decision tree in `.cursor/rules/knowledge-maintenance.mdc`:

1. **Hard constraint?** → Add to appropriate `.mdc` rule
2. **Reusable code pattern?** → Create/update a `docs/recipes/` file
3. **Per-ad post-mortem?** → Write to `docs/learnings/ads/{name}.md`
4. **General theory/principle?** → Route by topic to the matching file above

When a topic file exceeds 800 lines, split it by subsection into two files and update this INDEX.

---

## Graduation Protocol

When a lesson has been:
1. Validated across 2+ ads, AND
2. Fully captured in a `.mdc` rule OR `docs/recipes/` file

...condense the learnings entry to a one-liner reference:
```markdown
#### Topic [GRADUATED → path/to/rule-or-recipe]
One sentence summary. See rule/recipe for full details.
```
