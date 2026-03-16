/**
 * Parenthesis — Ad: "The Bootcamp That Doesn't Waste Your Time"
 *
 * Brand: Parenthesis — an online coding bootcamp for adults who already
 * have a job and can't afford to disappear for 12 weeks.
 *
 * New features showcased:
 *   Typography : technical (wide-tracked Courier — code/dashboard aesthetic, on-brand)
 *   Backgrounds: duotone (split-reveal), solid (timeline — clean, no distraction)
 *   Transitions: wipe-right (kinetic hook — code "types" in from left), rotate-in (timeline), blur-in (social-proof), scale-in (cta)
 *   Scenes     : kinetic-text (typewriter — very on-brand for code), timeline, counter-reveal, split-reveal, cta
 */

import { AdConfig, KineticTextProps, TimelineProps, CounterRevealProps, SplitRevealProps } from "../../data/types";

export const parenthesisAd: AdConfig = {
  id: "parenthesis-bootcamp-v1",
  name: "Parenthesis — The Bootcamp That Doesn't Waste Your Time",
  template: "dark-cinematic",
  aspectRatio: "9:16",

  brand: {
    name: "Parenthesis",
    tagline: "Learn to code. Keep your job. Change careers.",
    colors: {
      primary: "#0E7490",       // Cyan-700 — cool technical blue
      secondary: "#164E63",     // Cyan-900 — deep code-editor dark
      accent: "#67E8F9",        // Cyan-300 — terminal cursor
      background: "#030711",    // Very dark blue-black — IDE background
      text: "#E2E8F0",          // Slate-200 — code editor text
      textSecondary: "#38BDF8", // Sky-400 — syntax highlight colour
    },
    typography: {
      preset: "technical",      // ← NEW: wide-tracked Courier, code feel
    },
  },

  media: {},

  content: {
    headline: "Learn to code without quitting your job.",
    subheadline: "10 hours a week. 6 months. Job-ready in full-stack development.",
    targetAudience: "Working adults wanting to transition into tech",

    painPoints: [
      "12-week bootcamps that require you to quit first",
      "Self-paced courses with zero accountability",
      "Learning theory — not how to build real things",
    ],

    valueProp:
      "Parenthesis is built for people with jobs and lives. 10 hours a week, live mentors, real projects. Graduate job-ready in 6 months without losing your income.",

    features: [
      { icon: "⏰", title: "10 hrs/week",      description: "Evenings and weekends — structured so you actually finish" },
      { icon: "👨‍💻", title: "Live Mentors",    description: "Every student gets a senior dev mentor — not a chatbot" },
      { icon: "🏗️", title: "Real Projects",    description: "Build 4 production-grade apps. Your portfolio is your CV." },
    ],

    testimonials: [
      {
        quote: "I kept my job, learned to code in 6 months, and was hired as a junior dev 3 weeks after graduating. The structure made all the difference.",
        author: "Temi A.",
        role: "Junior Dev → £48K → ex-retail manager",
        rating: 5,
      },
    ],

    stats: [
      { value: "84%",  label: "Graduates employed in tech within 3 months" },
      { value: "6",    label: "Months to job-ready (part-time)" },
      { value: "£48K", label: "Average graduate first salary" },
    ],

    cta: {
      primary: "Apply for Next Cohort",
      secondary: "Free intro week · no payment until you're in",
      url: "parenthesis.dev/apply",
    },

    offer: "Free Intro Week — No Card Required",
  },

  timing: {
    fps: 30,
    scenes: [
      {
        type: "kinetic-text",
        durationInSeconds: 4,
        transition: "wipe-right",         // ← NEW: code types in left-to-right
        props: {
          lines: [
            "// you want to code.",
            "// you have a job.",
            "// we solved this.",
          ],
          style: "typewriter",            // ← comment-style typewriter is perfect here
          fontSize: 72,
          lineDelay: 38,
          highlightLines: [2],
        } satisfies KineticTextProps,
      },
      {
        type: "timeline",
        durationInSeconds: 5,
        transition: "rotate-in",          // ← NEW: slight rotation corrects on enter
        props: {
          headline: "6 months. Keep your job.",
          stepDelay: 22,
          steps: [
            { icon: "📐", title: "Months 1–2: Foundations",   subtitle: "HTML, CSS, JS, Git — the real fundamentals, not the fluff", time: "~10 hrs/wk" },
            { icon: "⚙️", title: "Months 3–4: Full-Stack",    subtitle: "React, Node, databases — build your first real app", time: "~10 hrs/wk" },
            { icon: "🚀", title: "Months 5–6: Ship + Hire",  subtitle: "Portfolio projects, code reviews, job prep, offers", time: "~10 hrs/wk" },
          ],
        } satisfies TimelineProps,
      },
      {
        type: "counter-reveal",
        durationInSeconds: 3.5,
        transition: "slide-up",
        props: {
          headline: "The numbers from our last cohort.",
          startDelay: 8,
          countDuration: 50,
          counters: [
            { from: 0, to: 84,  suffix: "%",   label: "Hired in tech within 3 months" },
            { from: 0, to: 48,  prefix: "£",   suffix: "K", label: "Average first salary" },
            { from: 0, to: 6,   suffix: " mo", label: "Time to job-ready, part-time" },
          ],
        } satisfies CounterRevealProps,
      },
      {
        type: "split-reveal",
        durationInSeconds: 4,
        transition: "blur-in",            // ← NEW: blurs then sharpens
        props: {
          splitFrame: 18,
          leftLabel: "Other bootcamps",
          leftText: "Quit your job. Move. Pay £15K upfront. Hope for the best.",
          leftEmoji: "😰",
          rightLabel: "Parenthesis",
          rightText: "10hrs/week. Keep your income. Graduate in 6 months.",
          rightEmoji: "💻",
        } satisfies SplitRevealProps,
      },
      {
        type: "cta",
        durationInSeconds: 3.5,
        transition: "scale-in",           // ← NEW: scales from 93%
      },
      {
        type: "logo-end-card",
        durationInSeconds: 2,
        transition: "fade",
      },
    ],
  },
};
