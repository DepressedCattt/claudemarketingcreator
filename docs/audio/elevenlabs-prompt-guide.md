# ElevenLabs SFX Prompt Guide

How to write prompts that produce usable sound effects from ElevenLabs' text-to-SFX API.

**CRITICAL: ElevenLabs defaults to aggressive, loud output.** Every prompt must
actively fight this by leading with volume/energy anchors and ending with exclusions.

## Core Principles

1. **Lead with "Very quiet and subtle:"** — this is the single most important phrase.
   ElevenLabs skews loud; you must anchor softness at the start of every prompt.
2. **Be specific about materials** — "thin glass tap" not "glass sound"
3. **Name a quiet environment** — "quiet dampened room" or "intimate close-mic"
4. **Describe gentle temporal shape** — "soft onset, quick fade" not "sharp attack"
5. **Specify duration** — always include seconds (ElevenLabs caps at 22s)
6. **End with exclusions** — "low volume, no bass, no distortion, no music, no voice"
7. **Set prompt_influence to 0.8** for precise SFX (default 0.3 is too loose for UI sounds)

## What NOT to Do

- Don't use aggressive words: "punchy", "slam", "hit", "crash", "blast", "powerful"
- Don't say "impact" — ElevenLabs interprets this as a loud cinematic boom
- Don't say "sound effect" or "high quality" — these are filler that dilute the prompt
- Don't describe the *visual* animation — describe the *sound* you want to hear
- Don't use words like "electromagnetic", "pressurized", "percussive" — too intense
- Don't skip the softness anchor — without it, results will be 3x louder than needed

---

## Style Vocabularies

Each ad category has a distinct sonic palette. All vocabularies are intentionally
**soft and understated** — ElevenLabs defaults to aggressive output, so every
descriptor must actively push toward quiet, subtle results.

### SaaS / Dashboard (`saas`, `snappy-saas`)

Quiet, minimal, clean. Think the softest iOS notification you've heard,
or a very faint Stripe checkout chime played at 20% volume.

| Use for | Vocabulary |
|---------|-----------|
| Materials | thin glass, soft ceramic, light plastic |
| Textures | airy, delicate, wispy, featherlight |
| Actions | gentle tap, quiet click, faint slide |
| Environment | quiet room, close microphone, dampened |
| Character | faint iOS notification, barely-there digital chime |

**Example prompts:**
- `Very quiet and subtle: gentle glass tap, thin ceramic surface, quiet room close-mic, soft quick fade, faint iOS notification feel, 0.3s, low volume, no bass, no distortion, no music, no voice`
- `Very quiet and subtle: faint digital chime, two quiet ascending tones, quiet dampened room, gentle onset soft fade, understated and minimal, 0.8s, low volume, no bass, no distortion, no music, no voice`

### Dark Tech (`dark-tech`)

Still quiet and refined — dark tone but whisper-quiet energy.
Think a muted sci-fi interface hum, not a cinematic explosion.

| Use for | Vocabulary |
|---------|-----------|
| Materials | smooth glass, soft digital tone, thin metal |
| Textures | muted, dampened, understated, refined |
| Actions | quiet hum, gentle tone, faint shimmer |
| Environment | quiet dampened room, soft close-mic |
| Character | subtle futuristic UI sound, understated and refined |

**Example prompts:**
- `Very quiet and subtle: faint digital shimmer with gentle glass overtone, quiet dampened room, soft onset quick fade, subtle futuristic UI feel, 1.0s, low volume, no bass, no distortion, no music, no voice`
- `Very quiet and subtle: quiet soft ping tone, smooth glass surface, dampened room, gentle and brief, understated and refined, 0.4s, low volume, no bass, no distortion, no music, no voice`

### Product Showcase (`product-showcase`)

Intimate, ASMR-adjacent. Whisper-quiet and tactile.

| Use for | Vocabulary |
|---------|-----------|
| Materials | soft matte surface, gentle ceramic, smooth fabric |
| Textures | velvety, intimate, delicate |
| Actions | quiet placement, gentle touch, soft settle |
| Environment | quiet studio, intimate close-mic |
| Character | ASMR whisper-quiet, delicate product sound |

**Example prompts:**
- `Very quiet and subtle: gentle device placed on soft surface, quiet matte tap, intimate close-mic, soft and brief, ASMR whisper-quiet, 0.5s, low volume, no bass, no distortion, no music, no voice`

### Kinetic Typography (`kinetic-typography`)

Light and airy, not percussive. Gentle accents, not hits.

| Use for | Vocabulary |
|---------|-----------|
| Materials | light paper, soft tap, gentle click |
| Textures | light, airy, wispy, brief |
| Actions | quiet whoosh, gentle air, soft tick |
| Environment | quiet dry room, close-mic |
| Character | gentle motion accent, light and airy |

**Example prompts:**
- `Very quiet and subtle: gentle air whoosh, light paper feel, quiet dry room, soft onset instant fade, light and airy motion accent, 0.4s, low volume, no bass, no distortion, no music, no voice`

---

## Cue Type → Sound Category Map

All categories are soft by default. Even "hard" intensity should still be quiet.

| Cue Type | Sound Category | Typical Duration |
|----------|---------------|-----------------|
| SCENE_CUT | Very soft transition thud | 0.2–0.5s |
| TEXT_REVEAL | Barely-there soft air whoosh | 0.3–1.0s |
| TEXT_IMPACT | Gentle quiet tap | 0.2–0.5s |
| HERO_ENTRY | Soft quiet swoosh | 0.5–1.5s |
| OBJECT_LAND | Tiny delicate click | 0.2–0.6s |
| WIPE | Gentle air movement | 0.3–0.8s |
| BEAT_LOCK | Quiet soft tick | 0.1–0.3s |
| STAT_BUILD | Quiet ascending soft digital beeps | 0.5–2.0s |
| CTA_REVEAL | Gentle quiet chime | 0.3–0.8s |
| AMBIENT | Very quiet ambient room tone | 1.0–5.0s |

---

## Prompt Template

Always start with the softness anchor:

```
Very quiet and subtle: [specific sound action], [material/texture],
[quiet environment], [gentle temporal shape], [understated style reference],
[duration]s, low volume, no bass, no distortion, no music, no voice
```

Example:
```
Very quiet and subtle: gentle glass tap, thin ceramic surface,
quiet room close-mic, soft quick fade,
faint iOS notification feel,
0.3s, low volume, no bass, no distortion, no music, no voice
```
