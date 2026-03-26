# Ad Creative Pipeline

This folder contains the strategy and storyboard documents for every ad
produced by this project. Each subfolder is one client/campaign.

## Folder Structure

```
docs/ads/
  {client-name}/
    strategy.md      ← Creative Strategist output
    storyboard.md    ← Storyboard Architect output
```

The final composition lives at `src/compositions/{Name}Ad.tsx`.

## The Pipeline

Every new ad follows three sequential steps. Do not skip steps.

```
Step 1: Creative Strategist   →  strategy.md
Step 2: Storyboard Architect  →  storyboard.md
Step 3: Prompt Director       →  {Name}Ad.tsx + registration
```

### Quick Start — Full Pipeline

Say: **"Make a new ad — here's the client brief: ..."**

The agent will run all three steps automatically in order.

### Run Individual Steps

| Want to... | Say... |
|------------|--------|
| Define strategy only | "Use the creative strategist skill" |
| Design scenes only | "Use the storyboard architect skill for {name}" |
| Build code only | "Use the prompt director skill for {name}" |
| Redo strategy | "Redo the strategy for {name} with a different angle" |
| Redo storyboard | "Redo the storyboard for {name}" |
| Tweak existing ad | Just edit directly — pipeline only applies to new ads |

### Iteration

- Rerunning a step overwrites its output file
- Downstream files are NOT auto-updated — rerun those steps too
- Example: new strategy → must also rerun storyboard → must also rerun code

## Reference Example

See `flowpilot/` for a complete example of both strategy and storyboard
documents. The matching composition is `src/compositions/FlowPilotAd.tsx`.

## Skills Location

```
.cursor/skills/creative-strategist/SKILL.md
.cursor/skills/storyboard-architect/SKILL.md
.cursor/skills/prompt-director/SKILL.md
```

## Orchestration Rule

`.cursor/rules/ad-creation-pipeline.mdc` — auto-enforces the pipeline
order when creating new ad compositions.
