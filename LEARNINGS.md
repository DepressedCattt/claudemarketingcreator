# Ad Creation Learnings

**This file has been restructured.** The full original content is preserved at `docs/learnings/ARCHIVE.md`.

---

## Quick Navigation

| What you need | Where to find it |
|---------------|-----------------|
| Full routing table | [docs/learnings/INDEX.md](docs/learnings/INDEX.md) |
| Design principles, commercial direction, pre-ship audit | [docs/learnings/ARCHIVE.md](docs/learnings/ARCHIVE.md) § Running Principles, § Commercial Direction System, § Pre-Ship Visual Audit |
| Premium motion, easing, arc/blur/float | [docs/learnings/ARCHIVE.md](docs/learnings/ARCHIVE.md) § Premium Motion Principles |
| Pacing theory, attention beats, timing | [docs/learnings/ARCHIVE.md](docs/learnings/ARCHIVE.md) § Pacing & Composition Theory |
| 3D / Three.js / iPhone | [docs/learnings/ARCHIVE.md](docs/learnings/ARCHIVE.md) § 3D Layer Architecture |
| Video background plates | [docs/learnings/ARCHIVE.md](docs/learnings/ARCHIVE.md) § Hybrid Video Workflow |
| SVG asset pipeline | [docs/learnings/ARCHIVE.md](docs/learnings/ARCHIVE.md) § Sighted SVG Pipeline |
| Spring configs | [docs/params/physics.md](docs/params/physics.md) (single source of truth) |
| Technique recipes | [docs/recipes/](docs/recipes/) (organized by category) |
| Per-ad post-mortems | [docs/learnings/ads/](docs/learnings/ads/) |
| Reference ad analyses | [docs/learnings/ARCHIVE.md](docs/learnings/ARCHIVE.md) § G — Reference Ad Insights |

---

## Per-Ad Post-Mortems

- [AnimlyAd / SmallSpotAd](docs/learnings/ads/animly.md) — Arc-length splines, velocity-continuous handoffs, Gaussian sweeps, SVG-HTML swaps
- [CalmlyAd](docs/learnings/ads/calmly.md) — Kinetic typography, epicyclic blobs, coast phase, dynamic camera, narrative drag
- SharedSalonFinalAd — See ARCHIVE.md § Round 7

---

## Knowledge Governance

New learnings are routed per `.cursor/rules/knowledge-maintenance.mdc`:
1. Hard constraints → `.cursor/rules/*.mdc`
2. Reusable code patterns → `docs/recipes/{category}/*.md`
3. Per-ad post-mortems → `docs/learnings/ads/{name}.md`
4. General theory → `docs/learnings/ARCHIVE.md` (until topic files are split out)

Graduation protocol: After validation in 2+ ads, condense to one-liner + reference to rule/recipe.
