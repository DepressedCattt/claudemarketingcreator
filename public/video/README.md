# Video Background Plates

Drop AI-generated background video loops here. These are used as atmospheric
background layers beneath Remotion compositions — they never contain text, UI,
or product elements. All of that stays in the React composition.

---

## Naming Convention

```
[brand-slug]-[mood]-bg.mp4
```

Examples:
- `haven-warm-bg.mp4`
- `elume-editorial-bg.mp4`
- `sharedsalon-studio-bg.mp4`
- `flowdesk-tech-bg.mp4`
- `meridian-dark-bg.mp4`

After dropping a file here, **register it in `src/data/videoPlates.ts`**.
That's the step that makes Claude aware of it for future compositions.

---

## Export Specs

| Setting | Value |
|---|---|
| Resolution | 1080 × 1920 (9:16) |
| Codec | H.264 |
| Duration | 4–6 seconds |
| Loop | Must be seamlessly loopable |
| Audio | None / muted at export |
| Frame rate | 30fps preferred |

---

## Prompt Templates by Ad Category

Use these as starting points in Kling, Runway Gen-3, or Sora.
Adjust the tone details (colours, materials, light quality) per brand.
**Always add:** "No people, no text, no UI, no logos."

---

### Warm Luxury Salon
*For: HavenAd, LumenAd, SharedSalon venue ads*

```
Warm, softly lit luxury salon interior. Cream and terracotta tones.
Gentle bokeh from background candlelight and diffused window light.
Slow imperceptible camera drift right. Shallow depth of field.
No people, no text, no UI, no logos.
Vertical 9:16, 5 seconds, seamlessly loopable. Shot on cinema camera.
```

---

### Dark Editorial Beauty
*For: ElumeAd, dark luxury brands*

```
Cinematic dark interior. Deep silk drapes catching a single gold rim light
from the frame edge. Near-black background, champagne and amber light tones.
Abstract very slow motion. Shallow focus.
No people, no text, no UI.
9:16 vertical, 5 seconds, seamlessly loopable.
```

---

### SaaS / Tech / Dark UI
*For: FlowDesk, Meridian, SharedSalon platform ads*

```
Abstract dark blue-indigo digital environment.
Soft luminous particles of light drifting slowly upward.
Very deep bokeh, no sharp edges. Feels like looking into deep space
or a data centre through fog. No UI elements, no text, no objects.
Premium cinematic quality. 9:16 vertical, 5 seconds, seamlessly loopable.
```

---

### Clean Studio / Product
*For: NovaSkin, product-forward ads with light backgrounds*

```
Minimal white studio environment with soft diffused light from above.
Subtle light caustics moving slowly across a clean surface.
Very shallow depth. Cream and soft grey tones only.
No objects, no text, no people.
9:16 vertical, 5 seconds, seamlessly loopable.
```

---

### High Energy / Sports
*For: TrailBlaze, Apex, high-tempo ads*

```
Abstract motion blur streaks of electric blue and white light
moving diagonally through a dark space at high speed.
Cinematic motion blur, energetic, atmospheric.
No people, no text, no UI.
9:16 vertical, 5 seconds, seamlessly loopable.
```

---

## Generation Tips

1. Generate 3–5 variations and pick the most stable, drift-free one
2. If the plate has visible motion artefacts at the loop point, regenerate
3. Faces and hands will hallucinate — always include "no people" in the prompt
4. Text will hallucinate — always include "no text, no logos"
5. Request the exact aspect ratio in the prompt — do not rely on cropping after
6. Prefer plates with minimal fast movement — they blend more naturally with
   Remotion's CSS animations at low opacity
