---
technique: rapid-fire-hook
level: L1+L4
primitives: [spring, Sequence]
hooks: [useSnapReveal]
profiles: [snappy-saas]
use_when: "Hook scene needs rapid text replacement cycling through multiple concepts in 2-4 seconds"
---

# Rapid-Fire Hook

Beat-synced concept replacements with hard cuts. Each concept occupies one beat (or half-bar), enters with a blur-scale reveal, and hard-cuts to the next. Used for the opening 2–3 seconds to grab attention.

## Parameter table

| Parameter | Snappy SaaS | Notes |
|-----------|-------------|-------|
| beat_duration | 22–30f | Duration per concept (1 beat at ~120 BPM) |
| concepts | 3–4 | Number of rapid concepts |
| total_duration | 66–90f | Hook scene length |
| reveal_duration | 12–15f | Blur-scale-in time |
| reveal_stagger | 3f | Delay between top/hero lines |
| transition_type | hard-cut | Sequence boundaries = instant switch |
| bg_color | off-white | Clean, uncluttered |
| hero_font_size | 112–128px | Dominant word |
| secondary_font_size | 56–68px | Supporting word |
| hero_color | gradient or black | Alternates per beat |
| secondary_color | muted gray | Always subdued |

## Code pattern

```tsx
const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <Sequence from={0}  durationInFrames={30}>
      <HookBeat top="Turn" hero="Books" heroGrad />
    </Sequence>
    <Sequence from={30} durationInFrames={30}>
      <HookBeat hero="Audio" heroGrad />
    </Sequence>
    <Sequence from={60} durationInFrames={30}>
      <HookBeat top="Any" hero="Language" heroGrad />
    </Sequence>
  </AbsoluteFill>
);
```

## Beat indicator (optional)

A row of dots at the bottom showing which beat is active:

```tsx
{[0, 30, 60].map((beatF, i) => (
  <div style={{
    width: frame >= beatF && frame < beatF + 30 ? 28 : 8,
    height: 8,
    borderRadius: 4,
    background: active ? accent : `${accent}30`,
  }} />
))}
```

## Observed in

- FormaAd2 Scene 1 (0–90f) — 3 beats × 30f: "Turn Books", "Audio", "Any Language"
- LangEaseAd Scene 1 (0–90f) — 4 beats × 22f: "Turn Books", "Into Audio", "Any Language", "Drop & Go."
- H.1 reference 00:00–00:02 — rapid text beats synced to "one, two, three, four"
