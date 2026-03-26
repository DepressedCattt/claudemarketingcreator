/**
 * analyze-ad.js — Analyse a reference MP4 ad via Gemini 2.5 Pro video understanding.
 *
 * Usage (standalone):
 *   node scripts/analyze-ad.js <path-to-mp4> [ad-name]
 *   npm run analyze ./reference-ads/competitor.mp4 "Competitor SaaS"
 *
 * Spawned by studio-api.js /analyze-reference endpoint.
 * Progress emitted to stdout as tagged lines: [STAGE], [INFO], [PROGRESS], [DONE], [ERROR]
 *
 * Output:
 *   G section (near top) — compact 9-row summary table, agent reads this
 *   H section (bottom)   — full raw Gemini analysis, deep-dive archive
 *
 * Requires: GEMINI_API_KEY in .env at project root.
 */

const fs   = require("fs");
const path = require("path");

// ─── Load .env (no dotenv dependency) ────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const ROOT           = path.join(__dirname, "..");
const LEARNINGS_PATH = path.join(ROOT, "LEARNINGS.md");

// ─── Progress logger (parsed by studio-api.js) ───────────────────────────────
function log(type, data) {
  const payload = typeof data === "string" ? data : JSON.stringify(data);
  process.stdout.write(`[${type.toUpperCase()}] ${payload}\n`);
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ─── Index helpers ────────────────────────────────────────────────────────────
function getNextIndex(prefix) {
  if (!fs.existsSync(LEARNINGS_PATH)) return 1;
  const content = fs.readFileSync(LEARNINGS_PATH, "utf8");
  const regex   = new RegExp(`^### ${prefix}\\.(\\d+)`, "gm");
  const matches = [...content.matchAll(regex)];
  if (matches.length === 0) return 1;
  const indices = matches.map((m) => parseInt(m[1], 10));
  return Math.max(...indices) + 1;
}

// ─── Write compact summary → G section (middle of file) ──────────────────────
function insertSummaryIntoG(summaryTable, adName, gIdx) {
  const date    = new Date().toISOString().split("T")[0];
  const content = fs.readFileSync(LEARNINGS_PATH, "utf8");
  const header  = `### G.${gIdx} — ${adName} (${date})\n\n${summaryTable.trim()}`;

  const PLACEHOLDER = "*(No entries yet — run your first analysis to populate this section.)*";

  if (content.includes(PLACEHOLDER)) {
    // First ever entry — replace the placeholder line
    const updated = content.replace(PLACEHOLDER, header);
    fs.writeFileSync(LEARNINGS_PATH, updated, "utf8");
  } else {
    // Subsequent entries — insert before the H section marker
    const H_MARKER = "\n## H — Reference Ad Full Analyses";
    const splitIdx = content.indexOf(H_MARKER);
    if (splitIdx === -1) {
      // Fallback: append to end of file
      fs.appendFileSync(LEARNINGS_PATH, `\n\n---\n\n${header}\n`, "utf8");
    } else {
      const before  = content.slice(0, splitIdx);
      const after   = content.slice(splitIdx);
      fs.writeFileSync(LEARNINGS_PATH, `${before}\n\n---\n\n${header}\n${after}`, "utf8");
    }
  }
}

// ─── Write full raw analysis → H section (end of file) ───────────────────────
function appendRawToH(adName, analysis, hIdx) {
  const date       = new Date().toISOString().split("T")[0];
  const hasHSection =
    fs.existsSync(LEARNINGS_PATH) &&
    fs.readFileSync(LEARNINGS_PATH, "utf8").includes("## H —");

  const sectionHeader = hasHSection
    ? ""
    : [
        "",
        "",
        "---",
        "",
        "## H — Reference Ad Full Analyses (Raw Archive)",
        "",
        "> Full Gemini 2.5 Pro video analyses. Beat-by-beat animation sequences,",
        "> detailed motion profiles, complete Remotion recreation notes.",
        "> **Skip unless you need deep detail.** Use the compact summaries in Section G instead.",
        "",
      ].join("\n");

  const entry = sectionHeader + `\n\n---\n\n### H.${hIdx} — ${adName} (${date})\n\n${analysis.trim()}\n`;
  fs.appendFileSync(LEARNINGS_PATH, entry, "utf8");
}

// ─── Full analysis prompt (Gemini 2.5 Pro + video) ───────────────────────────
const ANALYSIS_PROMPT = `
You are a senior motion designer and creative technologist analysing a SaaS marketing video ad.
Your goal is to extract learnings that will be used to recreate similar ads in Remotion —
a React/TypeScript programmatic video framework that renders animations frame-by-frame at 30fps.

Analyse this video thoroughly and provide a structured markdown report.
Be specific and technical. Use approximate timestamps where helpful.

---

### VISUAL DESIGN SYSTEM
- **Color palette**: List primary, secondary, accent, and background colors. Use hex codes where visible.
- **Typography**: Font style (serif/sans/display/mono), dominant weights, size hierarchy, any gradient or colored text
- **Background treatment**: solid / gradient (direction + colors) / dark mesh / glassmorphism / particle field / looping video
- **Design language**: Choose 2–3 descriptors: minimal / brutalist / kinetic / premium / neon / corporate / editorial / playful
- **Text contrast strategy**: How does text stay readable over the background?

---

### MOTION PROFILE
- **Kinetic energy**: Describe the overall weight and speed of the animations using tactile language (e.g. "snappy and aggressive", "floaty and weightless", "heavy and deliberate", "bouncy and playful")
- **Dominant easing**: Describe the easing character precisely (e.g. "sharp ease-out deceleration — elements arrive fast and stop instantly", "spring with ~10px overshoot then settle", "smooth ease-in-out throughout", "linear velocity masked by motion blur")
- **Motion blur**: Is motion blur present? On which elements? What velocity does it imply?
- **Spring / bounce**: Do elements overshoot their rest position? By how much? Estimate: low stiffness (60–80) = bouncy/floaty, high stiffness (160–220) = snappy
- **Inertia feel**: Do elements feel physically heavy or weightless? Does motion feel simulated-physical or purely graphic?
- **Idle / ambient animations**: Any looping animations between action beats — floating, pulsing, shimmering, particle drift, breathing scale?

---

### ANIMATION SEQUENCE
List every major visual beat in order.
Format each line as: **[timestamp]** — [element] — [what happens] — [entrance type] — [approx duration]

Entrance types to identify: fade-in | slide-up | slide-down | slide-left | slide-right | scale-up | scale-down | clip-path-wipe | blur-in | typewriter | morph | instant-cut | parallax-scroll

---

### TYPOGRAPHY ANIMATION
- **Reveal method**: character-by-character | word-by-word | line-by-line | whole-block fade | slide-up per line | clip-path reveal | instant
- **Consistency**: Same method throughout, or different per scene?
- **Headline treatments**: gradient text / glow / shimmer sweep / outline / distortion / blur-in / none
- **Exit animations**: Do text elements animate out, or hard-cut to next scene?
- **Stagger timing**: If multiple text elements animate in sequence, approximate stagger delay (e.g. "~4 frames / 133ms between each word")

---

### TRANSITIONS & CUTS
- **Scene transition style**: hard cut | dissolve/crossfade | zoom-in punch | zoom-out pull | wipe | element morph | flash frame | motion blur smear
- **Average transition duration**: approximate milliseconds
- **Connective motion**: Any element that travels across a cut, visually connecting two scenes?

---

### PACING & RHYTHM
- **Total duration**: seconds
- **Number of distinct scenes / beats**
- **Average beat length**: seconds per beat
- **Audio sync**: Does motion sync to music beats or sound effects? Describe BPM feel (e.g. "tight 4/4 grid at ~120bpm", "free-form, emotion-driven")
- **Hook (first 2 seconds)**: What specific visual device is used to grab attention immediately?
- **CTA (final 3 seconds)**: How is the call-to-action presented and animated?

---

### PRODUCT / UI SHOWCASE
(Skip this section entirely if no product UI is shown)
- **Display method**: phone mockup / browser window / floating screens / direct screen recording / abstract representation
- **Feature highlight technique**: zoom + highlight ring / sequential screen reveal / animated cursor / callout annotation bubble / none
- **Screen content legibility**: Is the UI readable enough to understand the product, or impressionistic?

---

### REMOTION RECREATION NOTES
Specific, actionable technical recommendations for recreating this in Remotion:

1. **Spring config** to match the inertia feel (e.g. \`{ stiffness: 180, damping: 12 }\` for snappy, \`{ stiffness: 60, damping: 8 }\` for bouncy/floaty)
2. **interpolate() easing** for non-spring elements (suggest Bezier values, e.g. \`Easing.bezier(0.16, 1, 0.3, 1)\` for sharp ease-out)
3. **Key timing values** in frames at 30fps — scene durations, transition lengths, stagger offsets
4. **Core Remotion patterns** to use: spring() / interpolate() / clip-path wipe / translateY slide / opacity cascade
5. **The 2–3 most essential techniques** that define the feel — things that would be clearly wrong if missed

---

Keep the response clean, specific, and immediately useful for a developer recreating this ad.
Avoid vague adjectives unless paired with a concrete technical equivalent.
`.trim();

// ─── Compact summary prompt (Gemini 2.0 Flash, text-only) ────────────────────
function buildSummaryPrompt(analysis, hIdx) {
  return `
You are distilling an ad analysis into a compact developer reference table for quick use.

Based on the analysis below, produce a markdown table with EXACTLY these 9 rows (no heading, no extra text — just the table):

| | |
|---|---|
| **Design language** | [2-3 word descriptors · bg color · key accent color hex] |
| **Motion feel** | [tactile adjectives · easing character in one sentence] |
| **Spring config** | [\`{ stiffness: X, damping: Y }\` — when to use it] |
| **Easing** | [\`Easing.X()\` recommendation for slides and fades] |
| **Typography** | [reveal method · stagger timing in frames] |
| **Transitions** | [transition style · approx ms duration] |
| **Scene timing** | [key frame values at 30fps: scene length, transition length] |
| **Hook technique** | [the specific attention-grab device used in the first 2 seconds] |
| **Key technique to steal** | [the single most important technique that defines this ad's feel] |

Replace every placeholder in brackets with real extracted values.
The last row should end with: → H.${hIdx}

Output ONLY the table. No preamble, no explanation.

ANALYSIS TO SUMMARISE:
${analysis}
`.trim();
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const videoPath = process.argv[2];
  const adName    = process.argv[3] || path.basename(videoPath ?? "", path.extname(videoPath ?? ""));

  if (!videoPath) {
    log("error", "Usage: node scripts/analyze-ad.js <path-to-mp4> [ad-name]");
    process.exit(1);
  }

  if (!fs.existsSync(videoPath)) {
    log("error", `File not found: ${videoPath}`);
    process.exit(1);
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    log("error", "GEMINI_API_KEY not set. Add it to .env at the project root.");
    process.exit(1);
  }

  const { GoogleGenerativeAI }             = require("@google/generative-ai");
  const { GoogleAIFileManager, FileState } = require("@google/generative-ai/server");

  const fileManager = new GoogleAIFileManager(API_KEY);
  const genAI       = new GoogleGenerativeAI(API_KEY);

  // ── Step 1: Upload ───────────────────────────────────────────────────────────
  log("stage", "uploading");
  log("info",  `Uploading "${path.basename(videoPath)}" to Gemini File API...`);

  const ext      = path.extname(videoPath).toLowerCase();
  const mimeType = ext === ".mov" ? "video/quicktime" : "video/mp4";

  const uploadResponse = await fileManager.uploadFile(videoPath, {
    mimeType,
    displayName: adName,
  });

  log("info", `Upload complete. File URI: ${uploadResponse.file.uri}`);

  // ── Step 2: Wait for Gemini to process the video ─────────────────────────────
  log("stage", "processing");
  log("info",  "Waiting for Gemini to process the video...");

  let file  = await fileManager.getFile(uploadResponse.file.name);
  let ticks = 0;

  while (file.state === FileState.PROCESSING) {
    await sleep(4000);
    file = await fileManager.getFile(uploadResponse.file.name);
    ticks++;
    log("progress", ticks);
  }

  if (file.state === FileState.FAILED) {
    log("error", "Gemini video processing failed — the file may be corrupt or unsupported.");
    process.exit(1);
  }

  log("info", "Video processing complete.");

  // ── Step 3: Full analysis — Gemini 2.5 Pro ───────────────────────────────────
  log("stage", "analysing");
  log("info",  "Sending to Gemini 2.5 Pro for deep analysis...");

  const proModel = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const proResult = await proModel.generateContent([
    { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
    { text: ANALYSIS_PROMPT },
  ]);

  const analysis = proResult.response.text();
  log("info", `Full analysis complete. ${analysis.length} characters.`);

  // ── Step 4: Compact summary — Gemini 2.0 Flash (fast, text-only) ─────────────
  log("info", "Generating compact summary table...");

  const idx          = getNextIndex("G"); // G and H indices stay in sync
  const flashModel   = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const flashResult  = await flashModel.generateContent(buildSummaryPrompt(analysis, idx));
  const summaryTable = flashResult.response.text();

  log("info", "Compact summary generated.");

  // ── Step 5: Write both sections ───────────────────────────────────────────────
  log("stage", "writing");

  insertSummaryIntoG(summaryTable, adName, idx);
  log("info",  `Compact summary written as G.${idx}`);

  appendRawToH(adName, analysis, idx);
  log("info",  `Full analysis written as H.${idx}`);

  log("done", JSON.stringify({ adName, sectionIndex: idx, analysisLength: analysis.length }));
}

main().catch((err) => {
  log("error", err.message ?? String(err));
  process.exit(1);
});
