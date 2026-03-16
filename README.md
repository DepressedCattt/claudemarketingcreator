# Ad Engine — Remotion Marketing Video System

A modular, config-driven ad generation engine for short-form vertical marketing videos.
Built with [Remotion](https://remotion.dev) · TypeScript · React

---

## Quick Start

```bash
npm install
npm run preview    # Opens Remotion Studio in browser
```

---

## Commands

| Command | Description |
|---|---|
| `npm run preview` | Open Remotion Studio (live preview) |
| `npm run render` | Render the active ad to `out/ad.mp4` |
| `npm run still` | Render a single frame still to `out/still.png` |

---

## How to Generate a New Ad

### Step 1 — Create an Ad Config

Copy one of the example files:

```
src/data/examples/startupMarketplace.ts  ← Full startup arc
src/data/examples/localService.ts        ← Local business offer
src/data/examples/appShowcase.ts         ← App UI showcase
```

Create a new file at `src/data/examples/myNewAd.ts` and fill in your brand:

```typescript
import { AdConfig } from "../../data/types";
import { startupExplainerScenes } from "../../templates/startupExplainerTemplate";

export const myNewAd: AdConfig = {
  id: "my-brand-v1",
  name: "My Brand Ad",
  template: "startup-explainer",
  aspectRatio: "9:16",

  brand: {
    name: "My Brand",
    tagline: "What we do, in one line.",
    colors: {
      primary:       "#6366F1",  // main brand color
      secondary:     "#8B5CF6",  // gradient end
      accent:        "#F59E0B",  // CTA button color
      background:    "#0A0A18",  // dark or light
      text:          "#FFFFFF",
      textSecondary: "#94A3B8",
    },
    typography: { preset: "modern-sans" },
  },

  media: {
    heroImage:      "/public/images/placeholder/hero.jpg",
    appScreenshots: ["/public/images/placeholder/screenshot.jpg"],
  },

  content: {
    headline:    "Your Attention-Grabbing Hook",
    subheadline: "The one sentence that tells them why they should care",
    painPoints:  ["The first pain point", "The second pain point"],
    valueProp:   "How your product/service solves those problems.",
    features: [
      { icon: "🎯", title: "Feature One", description: "What it does" },
      { icon: "⚡", title: "Feature Two", description: "Why it matters" },
      { icon: "✅", title: "Feature Three", description: "The benefit" },
    ],
    stats: [
      { value: "10K+", label: "Happy Users" },
      { value: "4.9★", label: "App Rating" },
    ],
    cta: {
      primary:   "Get Started Free",
      secondary: "No credit card required",
      url:       "yourdomain.com",
    },
    offer: "Limited-Time Offer: First Month Free",
  },

  timing: {
    fps:    30,
    scenes: startupExplainerScenes,  // ← swap template here
  },
};
```

### Step 2 — Set It as the Active Ad

Edit `src/data/activeAd.ts`:

```typescript
import { myNewAd } from "./examples/myNewAd";  // ← your new file
export const activeAd: AdConfig = myNewAd;
```

### Step 3 — Preview & Render

```bash
npm run preview   # Live preview in browser
npm run render    # Renders to out/ad.mp4
```

---

## Project Structure

```
├── src/
│   ├── index.ts                      # Remotion entry point (don't edit)
│   ├── Root.tsx                      # Composition registry
│   │
│   ├── compositions/
│   │   └── VerticalAd.tsx            # Main 9:16 composition (scene engine)
│   │
│   ├── scenes/                       # Scene-level components
│   │   ├── HookScene.tsx             # Opening hook
│   │   ├── ProblemScene.tsx          # Pain point display
│   │   ├── SolutionScene.tsx         # Brand introduction
│   │   ├── FeatureScene.tsx          # Feature list / screenshots
│   │   ├── SocialProofScene.tsx      # Stats + testimonials
│   │   ├── CTAScene.tsx              # Call to action
│   │   └── LogoEndCard.tsx           # Final logo frame
│   │
│   ├── components/                   # Reusable UI atoms
│   │   ├── SceneWrapper.tsx          # Fade in/out wrapper for all scenes
│   │   ├── AnimatedHeadline.tsx      # Spring-animated headline text
│   │   ├── SubtitleText.tsx          # Animated supporting text
│   │   ├── GradientBackground.tsx    # Animated gradient backdrop
│   │   ├── ImageCard.tsx             # Animated image container
│   │   ├── PhoneMockup.tsx           # CSS phone frame + screenshot
│   │   ├── StatCard.tsx              # Metric/stat display card
│   │   ├── TestimonialCard.tsx       # Quote + author card
│   │   ├── CTACard.tsx               # Animated CTA button
│   │   └── LogoLockup.tsx            # Logo + brand name unit
│   │
│   ├── templates/                    # Preset scene lists by ad style
│   │   ├── startupExplainerTemplate.ts   # 7 scenes, ~22s
│   │   ├── punchyTextTemplate.ts         # 5 scenes, ~13s
│   │   ├── productUITemplate.ts          # 5 scenes, ~16s
│   │   ├── minimalistFounderTemplate.ts  # 3 scenes, ~11s
│   │   └── localServiceTemplate.ts       # 5 scenes, ~15s
│   │
│   ├── data/
│   │   ├── types.ts                  # All TypeScript interfaces (AdConfig etc.)
│   │   ├── activeAd.ts               # ← EDIT THIS to switch active ad
│   │   └── examples/
│   │       ├── startupMarketplace.ts # Demo: Launchpad investor platform
│   │       ├── localService.ts       # Demo: CleanPro home cleaning
│   │       └── appShowcase.ts        # Demo: Tempo habit tracker app
│   │
│   └── utils/
│       ├── timing.ts                 # Frame ↔ seconds conversion, scene layout
│       ├── animation.ts              # Reusable animation hooks (fade, slide, spring)
│       └── typography.ts             # Font scale presets
│
├── public/
│   └── images/
│       └── placeholder/              # Drop your images here
│
├── out/                              # Rendered video output
├── package.json
├── tsconfig.json
└── remotion.config.ts
```

---

## Available Templates

| Template | File | Scenes | ~Duration | Best For |
|---|---|---|---|---|
| `startup-explainer` | `startupExplainerTemplate.ts` | 7 | 22s | SaaS, marketplaces, VC-facing |
| `punchy-text` | `punchyTextTemplate.ts` | 5 | 13s | Performance ads, TikTok testing |
| `product-ui-showcase` | `productUITemplate.ts` | 5 | 16s | App launches, product demos |
| `minimalist-founder` | `minimalistFounderTemplate.ts` | 3 | 11s | Personal brands, high-end B2B |
| `local-service` | `localServiceTemplate.ts` | 5 | 15s | Home services, restaurants, gyms |

---

## Typography Presets

| Preset | Feel | Best For |
|---|---|---|
| `modern-sans` | Inter 800 / system-ui | Tech, startup, clean |
| `editorial` | Serif headline + sans body | Premium, media, lifestyle |
| `bold-impact` | Impact / Arial Black | Sports, aggressive ads |
| `clean-minimal` | Helvetica Neue light | Apple-style, luxury |

---

## Prompting Claude Code for New Ads

The most effective way to ask for a new ad:

```
Make me a [DURATION]-second vertical ad for [BRAND NAME].

Brand: [brief description]
Hook: [attention-grabbing opening line]
Problem: [what pain point does it solve]
Solution: [how the brand solves it]
Features: [2–3 key features]
CTA: [button text + offer]
Colors: [describe the vibe — dark/light, color accent]
Template: [startup-explainer / punchy-text / product-ui-showcase / local-service]
```

**Example prompt:**
```
Make me a 20-second vertical ad for Shared Salon.

Brand: A marketplace for salon chair rentals — connects empty salon chairs with independent stylists.
Hook: "Every empty chair is $500/week in lost revenue"
Problem: Salon owners have unused chairs. Stylists need affordable space. Neither can find each other.
Solution: Shared Salon — book or list chairs in your area, instantly.
Features: Instant booking, flexible weekly rental, vetted stylists
CTA: "List Your Chairs Free"
Colors: Dark background, warm gold accent
Template: startup-explainer
```

---

## Adding a New Scene Type

1. Create `src/scenes/MyNewScene.tsx` following the pattern of existing scenes
2. Register it in `src/compositions/VerticalAd.tsx` under `SCENE_MAP`
3. Add the type to `SceneType` in `src/data/types.ts`
4. Use it in any scene array in your config

---

## Adding Media Assets

1. Copy images/videos to `public/images/placeholder/` (or a subfolder)
2. Reference in your AdConfig:
   ```typescript
   media: {
     heroImage:      "/public/images/placeholder/hero.jpg",
     appScreenshots: ["/public/images/placeholder/screen1.jpg"],
   }
   ```
3. Uncomment the `logoPath`, `heroImage`, or `appScreenshots` lines in your config

---

## Rendering for Different Platforms

| Platform | Command | Resolution |
|---|---|---|
| TikTok / Reels / Shorts | `npm run render` | 1080×1920 |
| Instagram Feed (square) | Enable SquareAd in Root.tsx | 1080×1080 |
