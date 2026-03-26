/**
 * Studio API Server  —  npm run studio:api  (or launched by npm run studio)
 *
 * Express server on port 3002.
 * Vite dev server (port 3001) proxies /api/* → localhost:3002.
 *
 * Endpoints:
 *   GET  /health
 *   GET  /files                 — list audio files
 *   POST /upload                — upload audio file(s)
 *   DELETE /files/:name         — delete audio file
 *   GET  /state                 — load studio state (audio config)
 *   POST /state/audio           — save audio tracks for a composition
 *   POST /render                — trigger Remotion CLI render
 *   GET  /render-status/:jobId  — poll render progress
 *   GET  /render-history        — list all past render entries
 *   GET  /preview/:filename     — stream rendered video from out/
 *   GET  /reference-ads         — list uploaded reference MP4s
 *   POST /analyze-reference     — upload MP4 + trigger Gemini analysis job
 *   GET  /analyze-status/:jobId — poll analysis progress
 */

const http    = require("http");
const fs      = require("fs");
const path    = require("path");
const { spawn } = require("child_process");
const { formidable } = require("formidable");

const PORT              = 3002;
const ROOT              = path.join(__dirname, "..");
const AUDIO_DIR         = path.join(ROOT, "public", "audio");
const OUT_DIR           = path.join(ROOT, "out");
const STATE_FILE        = path.join(ROOT, "studio", "state.json");
const HISTORY_FILE      = path.join(ROOT, "studio", "render-history.json");
const REFERENCE_ADS_DIR = path.join(ROOT, "reference-ads");
const EXTRACTED_DIR     = path.join(ROOT, "extracted");
const SVG_ASSETS_DIR    = path.join(ROOT, "public", "svg");
const CUES_DIR          = path.join(ROOT, "studio", "cues");
const PITCHED_DIR       = path.join(ROOT, "public", "audio", "pitched");
const ALLOWED           = /\.(mp3|wav|aac|ogg|flac|m4a|opus)$/i;
const ALLOWED_IMAGE     = /\.(png|jpg|jpeg|webp|gif)$/i;
const ALLOWED_SVG       = /\.svg$/i;
const ALLOWED_VIDEO     = /\.(mp4|mov|webm)$/i;
const ALLOWED_JSON      = /\.json$/i;
const JSON_HEADERS      = { "Content-Type": "application/json" };

fs.mkdirSync(AUDIO_DIR,                        { recursive: true });
fs.mkdirSync(OUT_DIR,                          { recursive: true });
fs.mkdirSync(REFERENCE_ADS_DIR,               { recursive: true });
fs.mkdirSync(path.join(ROOT, "compare-tmp"),  { recursive: true });
fs.mkdirSync(path.join(ROOT, "compare-results"), { recursive: true });
fs.mkdirSync(EXTRACTED_DIR,                    { recursive: true });
fs.mkdirSync(path.dirname(STATE_FILE),         { recursive: true });
fs.mkdirSync(CUES_DIR,                         { recursive: true });
fs.mkdirSync(PITCHED_DIR,                      { recursive: true });

// ─── Render history helpers ───────────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(fs.readFileSync(HISTORY_FILE, "utf8")); }
  catch { return []; }
}

function appendHistory(entry) {
  const history = loadHistory();
  history.unshift(entry); // newest first
  if (history.length > 200) history.length = 200; // cap at 200 entries
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf8");
}

// ─── Render job tracking ──────────────────────────────────────────────────────
// jobId → { done, failed, output, startTime, frames, totalFrames, logs }
const renderJobs = new Map();

// ─── Analysis job tracking ────────────────────────────────────────────────────
// jobId → { done, failed, stage, logs, adName, sectionIndex, startTime }
const analysisJobs = new Map();

// ─── Comparison job tracking ──────────────────────────────────────────────────
// jobId → { done, failed, stage, ticks, compId, iterN, overallScore, fixCount, errorMsg, startTime, logs }
const compareJobs = new Map();

function parseAnalysisLine(line, job) {
  const m = line.match(/^\[([A-Z]+)\] (.+)$/s);
  if (!m) return;
  const [, type, data] = m;
  switch (type) {
    case "STAGE":    job.stage = data; break;
    case "INFO":     job.logs.push(data); if (job.logs.length > 80) job.logs.shift(); break;
    case "PROGRESS": job.ticks = parseInt(data, 10) || 0; break;
    case "DONE": {
      job.done = true;
      try { const d = JSON.parse(data); job.adName = d.adName; job.sectionIndex = d.sectionIndex; } catch {}
      break;
    }
    case "ERROR":
      job.failed = true;
      job.errorMsg = data;
      job.logs.push(`ERROR: ${data}`);
      break;
  }
}

function parseCompareLine(line, job) {
  const m = line.match(/^\[([A-Z]+)\] (.+)$/s);
  if (!m) return;
  const [, type, data] = m;
  switch (type) {
    case "STAGE":    job.stage = data; break;
    case "INFO":     job.logs.push(data); if (job.logs.length > 80) job.logs.shift(); break;
    case "PROGRESS": job.ticks = parseInt(data, 10) || 0; break;
    case "DONE": {
      job.done = true;
      try {
        const d = JSON.parse(data);
        job.compId       = d.compId;
        job.iterN        = d.iterN;
        job.filename     = d.filename;
        job.overallScore = d.overallScore;
        job.fixCount     = d.fixCount;
      } catch {}
      break;
    }
    case "ERROR":
      job.failed   = true;
      job.errorMsg = data;
      job.logs.push(`ERROR: ${data}`);
      break;
  }
}

function parseFrameProgress(line, job) {
  // Remotion outputs lines like "Rendering frame 72 of 480" or "72/480"
  const m1 = line.match(/(\d+)\s*\/\s*(\d+)/);
  if (m1) { job.frames = parseInt(m1[1], 10); job.totalFrames = parseInt(m1[2], 10); return; }
  const m2 = line.match(/Rendering frame\s+(\d+)/i);
  if (m2) { job.frames = parseInt(m2[1], 10); return; }
  const m3 = line.match(/(\d+)%/);
  if (m3) { job.pct = parseInt(m3[1], 10); }
}

// ─── State helpers ────────────────────────────────────────────────────────────
function loadState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {
    return { audioTracks: {} };
  }
}

function saveState(data) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ─── Audio file helpers ───────────────────────────────────────────────────────
function formatBytes(b) {
  if (b < 1024)          return `${b} B`;
  if (b < 1024 * 1024)   return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function listFiles() {
  return fs.readdirSync(AUDIO_DIR)
    .filter((f) => ALLOWED.test(f))
    .map((name) => {
      const stat = fs.statSync(path.join(AUDIO_DIR, name));
      return { name, path: `/audio/${name}`, size: stat.size, sizeHuman: formatBytes(stat.size), modified: stat.mtime.toISOString() };
    })
    .sort((a, b) => new Date(b.modified) - new Date(a.modified));
}

// ─── Response helpers ─────────────────────────────────────────────────────────
function cors(res) {
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, status, data) {
  cors(res);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end",  () => { try { resolve(JSON.parse(body)); } catch { resolve({}); } });
    req.on("error", reject);
  });
}

// ─── Server ───────────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  cors(res);

  if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

  const url = req.url.split("?")[0];

  // ── Health ──────────────────────────────────────────────────────────────────
  if (req.method === "GET" && url === "/health") {
    return json(res, 200, { ok: true, port: PORT });
  }

  // ── List audio files ────────────────────────────────────────────────────────
  if (req.method === "GET" && url === "/files") {
    return json(res, 200, listFiles());
  }

  // ── Upload audio files ──────────────────────────────────────────────────────
  if (req.method === "POST" && url === "/upload") {
    const form = formidable({
      uploadDir: AUDIO_DIR,
      keepExtensions: true,
      maxFileSize: 200 * 1024 * 1024,
      filter: ({ originalFilename }) => ALLOWED.test(originalFilename || ""),
    });

    form.parse(req, (err, _fields, files) => {
      if (err) return json(res, 400, { error: err.message });

      const uploaded = [];
      const all = Object.values(files).flat();

      for (const file of all) {
        const orig = file.originalFilename || file.newFilename;
        if (!ALLOWED.test(orig)) { try { fs.unlinkSync(file.filepath); } catch {} continue; }
        const safe = path.basename(orig).replace(/[^a-zA-Z0-9._\-\s]/g, "_");
        const dest = path.join(AUDIO_DIR, safe);
        try {
          fs.renameSync(file.filepath, dest);
          const stat = fs.statSync(dest);
          uploaded.push({ name: safe, path: `/audio/${safe}`, size: stat.size, sizeHuman: formatBytes(stat.size) });
          console.log(`✓ Uploaded: ${safe}`);
        } catch (e) {
          console.error(`Failed to save ${orig}:`, e.message);
        }
      }

      if (!uploaded.length) return json(res, 400, { error: "No valid audio files in upload" });
      return json(res, 200, { uploaded, files: listFiles() });
    });
    return;
  }

  // ── Delete audio file ───────────────────────────────────────────────────────
  if (req.method === "DELETE" && url.startsWith("/files/")) {
    const name = decodeURIComponent(url.replace("/files/", ""));
    const safe = path.basename(name);
    const fp   = path.join(AUDIO_DIR, safe);
    if (!fs.existsSync(fp)) return json(res, 404, { error: "Not found" });
    fs.unlinkSync(fp);
    console.log(`✕ Deleted: ${safe}`);
    return json(res, 200, { deleted: safe, files: listFiles() });
  }

  // ── Load studio state ───────────────────────────────────────────────────────
  if (req.method === "GET" && url === "/state") {
    return json(res, 200, loadState());
  }

  // ── Save audio tracks ───────────────────────────────────────────────────────
  if (req.method === "POST" && url === "/state/audio") {
    const { compId, tracks } = await readBody(req);
    if (!compId) return json(res, 400, { error: "compId required" });
    const state = loadState();
    state.audioTracks = state.audioTracks || {};
    state.audioTracks[compId] = tracks;
    saveState(state);
    console.log(`✓ Saved audio for: ${compId}`);
    return json(res, 200, { ok: true });
  }

  // ── Trigger Remotion render ─────────────────────────────────────────────────
  // Body: { compId, outFile?, quality?: "normal"|"hq" }
  // quality="hq" adds --scale 2 --crf 8 for 2× resolution master output.
  if (req.method === "POST" && url === "/render") {
    const body = await readBody(req);
    const { compId, outFile, quality, scale, crf, jpegQuality, codec, everyNthFrame, startFrame, endFrame } = body;
    if (!compId) return json(res, 400, { error: "compId required" });

    const isHQ   = quality === "hq";
    const suffix = isHQ && !outFile ? "-hq" : "";
    const out    = outFile || `out/${compId}${suffix}.mp4`;
    const jobId  = `job-${Date.now()}`;
    console.log(`\n▶ Rendering ${compId} → ${out}`);

    const state = loadState();
    const audioTracks = (state.audioTracks && state.audioTracks[compId]) || [];
    if (audioTracks.length > 0) console.log(`  ♪ Including ${audioTracks.length} audio track(s)`);

    const propsFile = path.join(ROOT, `out/.render-props-${compId}.json`);
    fs.mkdirSync(path.join(ROOT, "out"), { recursive: true });
    fs.writeFileSync(propsFile, JSON.stringify({ audioTracks }), "utf8");

    // Build CLI args from explicit options or legacy "hq" shorthand
    const extraArgs = [];
    if (scale         != null) extraArgs.push("--scale",            String(scale));
    else if (isHQ)             extraArgs.push("--scale",            "2");
    if (crf           != null) extraArgs.push("--crf",              String(crf));
    else if (isHQ)             extraArgs.push("--crf",              "8");
    if (jpegQuality   != null) extraArgs.push("--jpeg-quality",     String(jpegQuality));
    else if (isHQ)             extraArgs.push("--jpeg-quality",     "100");
    if (codec         != null) extraArgs.push("--codec",            String(codec));
    if (everyNthFrame != null && everyNthFrame > 1) extraArgs.push("--every-nth-frame", String(everyNthFrame));
    if (startFrame    != null && endFrame != null)  extraArgs.push("--frames", `${startFrame}-${endFrame}`);
    else if (startFrame != null)                    extraArgs.push("--frames", `${startFrame}-`);
    console.log(`  args: ${extraArgs.join(" ") || "(default)"}`);
    const proc = spawn(
      "npx",
      ["remotion", "render", "src/index.ts", compId, out, `--props=${propsFile}`, ...extraArgs],
      { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], shell: true },
    );

    // Capture all settings for history tracking
    const jobSettings = {
      scale:         scale         ?? (isHQ ? 2 : 1),
      crf:           crf           ?? (isHQ ? 8 : 18),
      jpegQuality:   jpegQuality   ?? (isHQ ? 100 : 90),
      codec:         codec         ?? "h264",
      everyNthFrame: everyNthFrame ?? 1,
      preset:        quality       ?? "normal",
      ...(startFrame != null ? { startFrame } : {}),
      ...(endFrame   != null ? { endFrame   } : {}),
    };

    const job = {
      done: false, failed: false, output: out,
      startTime: Date.now(), startedAt: new Date().toISOString(),
      frames: 0, totalFrames: 0, pct: 0, logs: [],
      compId, settings: jobSettings,
    };
    renderJobs.set(jobId, job);

    const onData = (data) => {
      const lines = data.toString().split(/\r?\n/);
      lines.forEach((line) => {
        if (line.trim()) {
          parseFrameProgress(line, job);
          job.logs.push(line.slice(0, 200));
          if (job.logs.length > 60) job.logs.shift();
          process.stdout.write(line + "\n");
        }
      });
    };
    proc.stdout.on("data", onData);
    proc.stderr.on("data", onData);

    proc.on("close", (code) => {
      const finishedAt     = new Date().toISOString();
      const durationMs     = Date.now() - job.startTime;
      const durationSec    = Math.round(durationMs / 1000);
      const totalF         = job.totalFrames || 0;
      const framesPerSec   = totalF > 0 && durationSec > 0
        ? Math.round((totalF / durationSec) * 100) / 100
        : null;

      job.done   = true;
      job.failed = code !== 0;

      // Get output file size if it exists
      let outputSizeBytes = null;
      try {
        const fp = path.isAbsolute(out) ? out : path.join(ROOT, out);
        if (fs.existsSync(fp)) outputSizeBytes = fs.statSync(fp).size;
      } catch {}

      // Append to persistent render history
      appendHistory({
        id:             jobId,
        compId,
        startedAt:      job.startedAt,
        finishedAt,
        durationSec,
        success:        code === 0,
        settings:       jobSettings,
        outputFile:     out,
        outputSizeBytes,
        totalFrames:    totalF,
        framesPerSec,
        exitCode:       code,
      });

      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
      const perfStr = framesPerSec ? ` · ${framesPerSec} fps` : "";
      console.log(code === 0
        ? `✓ Render done: ${out} (${timeStr}${perfStr})`
        : `✗ Render failed after ${timeStr} (exit ${code})`
      );
      try { fs.unlinkSync(propsFile); } catch {}
    });

    return json(res, 200, { started: true, jobId, message: `Rendering ${compId}… progress at /render-status/${jobId}` });
  }

  // ── Render job status (poll this from the client) ───────────────────────────
  // GET /render-status/:jobId → { done, failed, frames, totalFrames, pct, elapsed, output }
  if (req.method === "GET" && url.startsWith("/render-status/")) {
    const jobId = url.replace("/render-status/", "");
    const job   = renderJobs.get(jobId);
    if (!job) return json(res, 404, { error: "Unknown job" });

    const elapsed = Math.round((Date.now() - job.startTime) / 1000);
    // Derive best progress percentage
    let pct = job.pct;
    if (job.totalFrames > 0) pct = Math.round((job.frames / job.totalFrames) * 100);
    if (job.done && !job.failed) pct = 100;

    return json(res, 200, {
      done:        job.done,
      failed:      job.failed,
      frames:      job.frames,
      totalFrames: job.totalFrames,
      pct,
      elapsed,
      output:      job.output,
    });
  }

  // ── Render history ──────────────────────────────────────────────────────────
  // GET /render-history → array of past render entries, newest first
  if (req.method === "GET" && url === "/render-history") {
    return json(res, 200, loadHistory());
  }

  // ── Preview rendered video ──────────────────────────────────────────────────
  // GET /preview/:filename  — serves mp4 files from the out/ directory.
  // The browser video element can then stream it directly.
  if (req.method === "GET" && url.startsWith("/preview/")) {
    const filename = decodeURIComponent(url.replace("/preview/", ""));
    const safe = path.basename(filename); // no directory traversal
    const fp   = path.join(OUT_DIR, safe);
    if (!fs.existsSync(fp)) return json(res, 404, { error: "File not found" });

    const stat = fs.statSync(fp);
    const range = req.headers.range;

    cors(res);
    if (range) {
      // Support byte-range requests so <video> can seek
      const [startStr, endStr] = range.replace(/bytes=/, "").split("-");
      const start = parseInt(startStr, 10);
      const end   = endStr ? parseInt(endStr, 10) : stat.size - 1;
      res.writeHead(206, {
        "Content-Range":  `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges":  "bytes",
        "Content-Length": end - start + 1,
        "Content-Type":   "video/mp4",
      });
      fs.createReadStream(fp, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        "Content-Type":   "video/mp4",
        "Content-Length": stat.size,
        "Accept-Ranges":  "bytes",
      });
      fs.createReadStream(fp).pipe(res);
    }
    return;
  }

  // ── List reference MP4 files ────────────────────────────────────────────────
  if (req.method === "GET" && url === "/reference-ads") {
    const files = fs.readdirSync(REFERENCE_ADS_DIR)
      .filter((f) => ALLOWED_VIDEO.test(f) && !f.startsWith("."))
      .map((name) => {
        const stat = fs.statSync(path.join(REFERENCE_ADS_DIR, name));
        return { name, size: stat.size, sizeHuman: formatBytes(stat.size), modified: stat.mtime.toISOString() };
      })
      .sort((a, b) => new Date(b.modified) - new Date(a.modified));
    return json(res, 200, files);
  }

  // ── Upload + trigger Gemini analysis ────────────────────────────────────────
  // POST /analyze-reference  multipart: file (mp4), adName (string)
  if (req.method === "POST" && url === "/analyze-reference") {
    const form = formidable({
      uploadDir:   REFERENCE_ADS_DIR,
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500 MB
      filter: ({ originalFilename }) => ALLOWED_VIDEO.test(originalFilename || ""),
    });

    form.parse(req, (err, fields, files) => {
      if (err) return json(res, 400, { error: err.message });

      const all = Object.values(files).flat();
      if (!all.length) return json(res, 400, { error: "No valid video file in upload" });

      const file   = all[0];
      const orig   = file.originalFilename || file.newFilename;
      if (!ALLOWED_VIDEO.test(orig)) {
        try { fs.unlinkSync(file.filepath); } catch {}
        return json(res, 400, { error: "Only mp4/mov/webm files are accepted" });
      }

      // Rename to a clean filename
      const safe = path.basename(orig).replace(/[^a-zA-Z0-9._\-\s]/g, "_");
      const dest = path.join(REFERENCE_ADS_DIR, safe);
      try { fs.renameSync(file.filepath, dest); } catch (e) {
        return json(res, 500, { error: `Failed to save file: ${e.message}` });
      }

      const adNameRaw  = (Array.isArray(fields.adName) ? fields.adName[0] : fields.adName) || "";
      const adName     = adNameRaw.trim() || path.basename(safe, path.extname(safe));
      const jobId      = `analysis-${Date.now()}`;

      console.log(`\n🔍 Starting analysis: "${adName}" → ${safe}`);

      const job = {
        done: false, failed: false,
        stage: "starting", ticks: 0,
        adName, sectionIndex: null,
        errorMsg: null,
        startTime: Date.now(),
        logs: [],
      };
      analysisJobs.set(jobId, job);

      const proc = spawn(
        "node",
        [path.join(__dirname, "analyze-ad.js"), dest, adName],
        { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], shell: false },
      );

      const onData = (data) => {
        data.toString().split(/\r?\n/).forEach((line) => {
          if (line.trim()) {
            parseAnalysisLine(line, job);
            process.stdout.write(line + "\n");
          }
        });
      };
      proc.stdout.on("data", onData);
      proc.stderr.on("data", onData);

      proc.on("close", (code) => {
        if (code !== 0 && !job.done) {
          job.failed  = true;
          job.errorMsg = job.errorMsg || `Process exited with code ${code}`;
        }
        job.done = true;
        const elapsed = Math.round((Date.now() - job.startTime) / 1000);
        console.log(job.failed
          ? `✗ Analysis failed: ${adName} (${elapsed}s)`
          : `✓ Analysis done:   ${adName} → G.${job.sectionIndex} (${elapsed}s)`
        );
      });

      return json(res, 200, { started: true, jobId, adName, message: `Analysis started for "${adName}"` });
    });
    return;
  }

  // ── Analysis job status ──────────────────────────────────────────────────────
  // GET /analyze-status/:jobId
  if (req.method === "GET" && url.startsWith("/analyze-status/")) {
    const jobId = url.replace("/analyze-status/", "");
    const job   = analysisJobs.get(jobId);
    if (!job) return json(res, 404, { error: "Unknown analysis job" });

    const elapsed = Math.round((Date.now() - job.startTime) / 1000);
    return json(res, 200, {
      done:         job.done,
      failed:       job.failed,
      stage:        job.stage,
      ticks:        job.ticks,
      adName:       job.adName,
      sectionIndex: job.sectionIndex,
      errorMsg:     job.errorMsg,
      elapsed,
      logs:         job.logs.slice(-20),
    });
  }

  // ── List rendered MP4 files ─────────────────────────────────────────────────
  // GET /rendered-files → array of mp4 files in out/
  if (req.method === "GET" && url === "/rendered-files") {
    const files = fs.existsSync(OUT_DIR)
      ? fs.readdirSync(OUT_DIR)
          .filter((f) => /\.(mp4|mov|webm)$/i.test(f) && !f.startsWith(".") && !f.startsWith(".render-props"))
          .map((name) => {
            const stat = fs.statSync(path.join(OUT_DIR, name));
            return { name, size: stat.size, sizeHuman: formatBytes(stat.size), modified: stat.mtime.toISOString() };
          })
          .sort((a, b) => new Date(b.modified) - new Date(a.modified))
      : [];
    return json(res, 200, files);
  }

  // ── Trigger visual comparison ────────────────────────────────────────────────
  // POST /compare-ads  multipart: referenceFile (video), renderedFile (video OR filename), compId
  if (req.method === "POST" && url === "/compare-ads") {
    const form = formidable({
      uploadDir:   path.join(ROOT, "compare-tmp"),
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024,
      filter: ({ name, originalFilename }) => {
        // Text fields have no originalFilename — always pass through
        if (!originalFilename) return true;
        // File fields — only accept video for referenceFile / renderedFile
        if (name === "referenceFile" || name === "renderedFile") {
          return ALLOWED_VIDEO.test(originalFilename);
        }
        return false;
      },
    });

    form.parse(req, async (err, fields, files) => {
      if (err) return json(res, 400, { error: err.message });

      const compId = Array.isArray(fields.compId) ? fields.compId[0] : fields.compId;
      if (!compId) return json(res, 400, { error: "compId field required" });

      // ── Resolve reference path ─────────────────────────────────────────────
      let refPath = null;
      const refFile = (Array.isArray(files.referenceFile) ? files.referenceFile[0] : files.referenceFile);
      if (refFile) {
        // Uploaded — save permanently to reference-ads/
        const orig = refFile.originalFilename || refFile.newFilename;
        const safe = path.basename(orig).replace(/[^a-zA-Z0-9._\-\s]/g, "_");
        const dest = path.join(REFERENCE_ADS_DIR, safe);
        try { fs.renameSync(refFile.filepath, dest); refPath = dest; }
        catch (e) { return json(res, 500, { error: `Failed to save reference: ${e.message}` }); }
      } else {
        // Server-side filename provided
        const refName = Array.isArray(fields.referenceFilename) ? fields.referenceFilename[0] : fields.referenceFilename;
        if (refName) refPath = path.join(REFERENCE_ADS_DIR, path.basename(refName));
      }
      if (!refPath || !fs.existsSync(refPath)) {
        return json(res, 400, { error: "Reference video not found. Upload an MP4/MOV file." });
      }

      // ── Resolve rendered path ──────────────────────────────────────────────
      let renPath = null;
      const renFile = (Array.isArray(files.renderedFile) ? files.renderedFile[0] : files.renderedFile);
      if (renFile) {
        // Uploaded rendered file — save to out/
        const orig = renFile.originalFilename || renFile.newFilename;
        const safe = path.basename(orig).replace(/[^a-zA-Z0-9._\-\s]/g, "_");
        const dest = path.join(OUT_DIR, safe);
        try { fs.renameSync(renFile.filepath, dest); renPath = dest; }
        catch (e) { return json(res, 500, { error: `Failed to save rendered file: ${e.message}` }); }
      } else {
        const renName = Array.isArray(fields.renderedFilename) ? fields.renderedFilename[0] : fields.renderedFilename;
        if (renName) renPath = path.join(OUT_DIR, path.basename(renName));
      }
      if (!renPath || !fs.existsSync(renPath)) {
        return json(res, 400, { error: "Rendered video not found. Export an MP4 first or upload one." });
      }

      const jobId = `compare-${Date.now()}`;
      console.log(`\n⚖  Starting comparison: ${path.basename(refPath)} vs ${path.basename(renPath)}`);

      const job = {
        done: false, failed: false,
        stage: "uploading_reference", ticks: 0,
        compId, iterN: null, filename: null,
        overallScore: null, fixCount: null,
        errorMsg: null,
        startTime: Date.now(),
        logs: [],
      };
      compareJobs.set(jobId, job);

      const proc = require("child_process").spawn(
        "node",
        [path.join(__dirname, "compare-ads.js"), refPath, renPath, compId],
        { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], shell: false },
      );

      const onData = (data) => {
        data.toString().split(/\r?\n/).forEach((line) => {
          if (line.trim()) {
            parseCompareLine(line, job);
            process.stdout.write(line + "\n");
          }
        });
      };
      proc.stdout.on("data", onData);
      proc.stderr.on("data", onData);

      proc.on("close", (code) => {
        if (code !== 0 && !job.done) {
          job.failed   = true;
          job.errorMsg = job.errorMsg || `Process exited with code ${code}`;
        }
        job.done = true;
        const elapsed = Math.round((Date.now() - job.startTime) / 1000);
        console.log(job.failed
          ? `✗ Comparison failed: ${compId} (${elapsed}s)`
          : `✓ Comparison done:   ${compId} iter${job.iterN} → score ${job.overallScore}/100 (${elapsed}s)`
        );

        // Auto-run update-params to append to parameter-log.json
        if (!job.failed) {
          const updateProc = spawn("node", [path.join(__dirname, "update-params.js"), compId], {
            stdio: "inherit",
          });
          updateProc.on("close", (c) => {
            if (c === 0) console.log(`✓ Parameter log updated for ${compId}`);
            else         console.log(`✗ update-params.js exited with code ${c}`);
          });
        }
      });

      return json(res, 200, { started: true, jobId, compId, message: `Comparison started for "${compId}"` });
    });
    return;
  }

  // ── Comparison job status ────────────────────────────────────────────────────
  // GET /compare-status/:jobId
  if (req.method === "GET" && url.startsWith("/compare-status/")) {
    const jobId = url.replace("/compare-status/", "");
    const job   = compareJobs.get(jobId);
    if (!job) return json(res, 404, { error: "Unknown comparison job" });

    const elapsed = Math.round((Date.now() - job.startTime) / 1000);
    return json(res, 200, {
      done:         job.done,
      failed:       job.failed,
      stage:        job.stage,
      ticks:        job.ticks,
      compId:       job.compId,
      iterN:        job.iterN,
      filename:     job.filename,
      overallScore: job.overallScore,
      fixCount:     job.fixCount,
      errorMsg:     job.errorMsg,
      elapsed,
      logs:         job.logs.slice(-20),
    });
  }

  // ── Get latest comparison result for a compId ────────────────────────────────
  // GET /compare-results/:compId → { latest: {...}, history: [...filenames] }
  if (req.method === "GET" && url.startsWith("/compare-results/")) {
    const compId    = decodeURIComponent(url.replace("/compare-results/", ""));
    const resultsDir = path.join(ROOT, "compare-results");

    if (!fs.existsSync(resultsDir)) return json(res, 200, { latest: null, history: [] });

    const files = fs.readdirSync(resultsDir)
      .filter((f) => f.startsWith(`${compId}-iter`) && f.endsWith(".json"))
      .sort();

    if (files.length === 0) return json(res, 200, { latest: null, history: [] });

    const latestFile = files[files.length - 1];
    let latest = null;
    try {
      latest = JSON.parse(fs.readFileSync(path.join(resultsDir, latestFile), "utf8"));
      // Don't send the raw Gemini text (can be huge) to the browser
      delete latest.rawGeminiText;
    } catch {}

    return json(res, 200, { latest, history: files });
  }

  // ── Extract params from AE project (raw .ae-extract.json) ──────────────
  // POST /extract-ae  multipart: file (.ae-extract.json OR .aep), templateName (string)
  // For .ae-extract.json: transforms immediately using extract-ae.js --from-raw
  // For .aep: launches After Effects with ae-extract.jsx (requires AE installed)
  if (req.method === "POST" && url === "/extract-ae") {
    const form = formidable({
      uploadDir:      path.join(ROOT, "compare-tmp"),
      keepExtensions: true,
      maxFileSize:    500 * 1024 * 1024,
      filter: ({ name, originalFilename }) => {
        if (!originalFilename) return true;
        return name === "file" && ALLOWED_AE_IMPORT.test(originalFilename);
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) return json(res, 400, { error: err.message });

      const fileArr = files.file ? (Array.isArray(files.file) ? files.file : [files.file]) : [];
      if (!fileArr.length) return json(res, 400, { error: "No file uploaded. Provide a .ae-extract.json or .aep file." });

      const file = fileArr[0];
      const orig = file.originalFilename || file.newFilename;
      const templateNameRaw = (Array.isArray(fields.templateName) ? fields.templateName[0] : fields.templateName) || "";
      const tName = templateNameRaw.trim() || path.basename(orig, path.extname(orig)).replace(/\.ae-extract$/, "");

      const isRawJson = /\.json$/i.test(orig);
      const isAep = ALLOWED_AEP.test(orig);

      if (!isRawJson && !isAep) {
        try { fs.unlinkSync(file.filepath); } catch {}
        return json(res, 400, { error: "Only .json (raw AE extract) or .aep files are accepted" });
      }

      if (isRawJson) {
        // Direct JSON transform
        try {
          const { transformAeExtract } = require("./extract-ae.js");
          const raw = JSON.parse(fs.readFileSync(file.filepath, "utf8"));
          const manifest = transformAeExtract(raw, tName);

          fs.mkdirSync(EXTRACTED_DIR, { recursive: true });
          const outPath = path.join(EXTRACTED_DIR, tName + ".params.json");
          fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");

          // Auto-run update-params
          const updateProc = spawn("node", [path.join(__dirname, "update-params.js"), "--from-extraction", outPath], {
            cwd: ROOT, stdio: "inherit",
          });
          updateProc.on("close", (c) => {
            if (c === 0) console.log("  Docs updated from AE extraction: " + tName);
          });

          try { fs.unlinkSync(file.filepath); } catch {}
          console.log("  AE Extracted: " + tName + " -> " + outPath);
          return json(res, 200, {
            success: true,
            templateName: tName,
            outputPath: outPath,
            extractionMethod: "extendscript",
            manifest,
          });
        } catch (e) {
          try { fs.unlinkSync(file.filepath); } catch {}
          console.error("  AE extraction failed:", e.message);
          return json(res, 500, { error: "AE extraction failed: " + e.message });
        }
      }

      if (isAep) {
        // .aep file -- need to launch After Effects
        // Save to a stable location
        const aepDir = path.join(ROOT, "ae-projects");
        fs.mkdirSync(aepDir, { recursive: true });
        const safeName = path.basename(orig).replace(/[^a-zA-Z0-9._\-\s]/g, "_");
        const aepDest = path.join(aepDir, safeName);
        try { fs.renameSync(file.filepath, aepDest); } catch (e) {
          return json(res, 500, { error: "Failed to save .aep file: " + e.message });
        }

        // Launch AE extraction as a background job
        const jobId = `ae-${Date.now()}`;
        const job = {
          done: false, failed: false,
          stage: "launching_after_effects", ticks: 0,
          templateName: tName, errorMsg: null,
          startTime: Date.now(), logs: [],
        };
        analysisJobs.set(jobId, job);

        console.log("\n  Launching After Effects extraction for: " + safeName);

        const proc = spawn(
          "node",
          [path.join(__dirname, "extract-ae.js"), aepDest, tName],
          { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], shell: false },
        );

        const onData = (data) => {
          data.toString().split(/\r?\n/).forEach((line) => {
            if (line.trim()) {
              job.logs.push(line.slice(0, 300));
              if (job.logs.length > 80) job.logs.shift();
              if (line.includes("[STAGE]")) job.stage = line.replace(/.*\[STAGE\]\s*/, "");
              process.stdout.write("  [AE] " + line + "\n");
            }
          });
        };
        proc.stdout.on("data", onData);
        proc.stderr.on("data", onData);

        proc.on("close", (code) => {
          job.done = true;
          if (code !== 0) {
            job.failed = true;
            job.errorMsg = "After Effects exited with code " + code;
          } else {
            // Check for the output manifest
            const outPath = path.join(EXTRACTED_DIR, tName + ".params.json");
            if (fs.existsSync(outPath)) {
              job.stage = "complete";
              console.log("  AE extraction complete: " + outPath);
              // Auto-update docs
              const updateProc2 = spawn("node", [path.join(__dirname, "update-params.js"), "--from-extraction", outPath], {
                cwd: ROOT, stdio: "inherit",
              });
              updateProc2.on("close", (c2) => {
                if (c2 === 0) console.log("  Docs updated from AE extraction: " + tName);
              });
            } else {
              job.failed = true;
              job.errorMsg = "Extraction completed but output manifest not found";
            }
          }
        });

        return json(res, 200, {
          started: true,
          jobId,
          templateName: tName,
          message: "After Effects extraction started. Poll /analyze-status/" + jobId + " for progress. This requires AE to be installed.",
        });
      }
    });
    return;
  }

  // ── Extract params from Lottie JSON ──────────────────────────────────────
  // POST /extract-params  multipart: file (json), templateName (string)
  if (req.method === "POST" && url === "/extract-params") {
    const form = formidable({
      uploadDir:      path.join(ROOT, "compare-tmp"),
      keepExtensions: true,
      maxFileSize:    100 * 1024 * 1024,
      filter: ({ name, originalFilename }) => {
        if (!originalFilename) return true;
        return name === "file" && ALLOWED_JSON.test(originalFilename);
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) return json(res, 400, { error: err.message });

      const fileArr = files.file ? (Array.isArray(files.file) ? files.file : [files.file]) : [];
      if (!fileArr.length) return json(res, 400, { error: "No JSON file uploaded" });

      const file = fileArr[0];
      const orig = file.originalFilename || file.newFilename;
      if (!ALLOWED_JSON.test(orig)) {
        try { fs.unlinkSync(file.filepath); } catch {}
        return json(res, 400, { error: "Only .json files are accepted" });
      }

      const templateName = (Array.isArray(fields.templateName) ? fields.templateName[0] : fields.templateName) || "";
      const name = templateName.trim() || path.basename(orig, ".json");

      try {
        const { extract } = require("./extract-lottie.js");
        const manifest = extract(file.filepath, name);

        fs.mkdirSync(EXTRACTED_DIR, { recursive: true });
        const outPath = path.join(EXTRACTED_DIR, name + ".params.json");
        fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");

        // Auto-run update-params to populate docs
        const updateProc = spawn("node", [path.join(__dirname, "update-params.js"), "--from-extraction", outPath], {
          cwd: ROOT, stdio: "inherit",
        });
        updateProc.on("close", (c) => {
          if (c === 0) console.log("  Docs updated from extraction: " + name);
        });

        try { fs.unlinkSync(file.filepath); } catch {}

        console.log("  Extracted: " + name + " -> " + outPath);
        return json(res, 200, {
          success:      true,
          templateName: name,
          outputPath:   outPath,
          manifest,
        });
      } catch (e) {
        try { fs.unlinkSync(file.filepath); } catch {}
        console.error("  Extraction failed:", e.message);
        return json(res, 500, { error: "Extraction failed: " + e.message });
      }
    });
    return;
  }

  // ── Generate Remotion composition from extracted params ─────────────────
  // POST /generate-composition  body: { templateName, compId? }
  if (req.method === "POST" && url === "/generate-composition") {
    const body = await readBody(req);
    const { templateName, compId } = body;
    if (!templateName) return json(res, 400, { error: "templateName required" });

    const manifestPath = path.join(EXTRACTED_DIR, templateName + ".params.json");
    if (!fs.existsSync(manifestPath)) {
      return json(res, 404, { error: "No extracted manifest found for: " + templateName });
    }

    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      const { generate } = require("./generate-composition.js");
      const resolvedId = compId || templateName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const result = generate(manifest, resolvedId);

      fs.writeFileSync(result.filePath, result.code, "utf8");
      console.log("  Generated composition: " + result.filePath);

      return json(res, 200, {
        success:         true,
        compId:          result.compId,
        compName:        result.compName,
        filePath:        result.filePath,
        rootSnippet:     result.rootSnippet,
        registrySnippet: result.registrySnippet,
      });
    } catch (e) {
      console.error("  Generation failed:", e.message);
      return json(res, 500, { error: "Generation failed: " + e.message });
    }
  }

  // ── List extracted manifests ────────────────────────────────────────────
  // GET /extracted → array of extracted template manifests
  if (req.method === "GET" && url === "/extracted") {
    const files = fs.existsSync(EXTRACTED_DIR)
      ? fs.readdirSync(EXTRACTED_DIR)
          .filter((f) => f.endsWith(".params.json"))
          .map((name) => {
            const fp = path.join(EXTRACTED_DIR, name);
            const stat = fs.statSync(fp);
            let meta = null;
            try {
              const m = JSON.parse(fs.readFileSync(fp, "utf8"));
              meta = {
                templateName:  m.templateName,
                fps:           m.meta.fps,
                totalFrames:   m.meta.totalFrames,
                width:         m.meta.width,
                height:        m.meta.height,
                layerCount:    m.meta.layerCount,
                profile:       m.detectedProfile ? m.detectedProfile.profile : null,
                techniqueCount: m.l5_techniques.length,
              };
            } catch {}
            return { name, size: stat.size, sizeHuman: formatBytes(stat.size), modified: stat.mtime.toISOString(), meta };
          })
          .sort((a, b) => new Date(b.modified) - new Date(a.modified))
      : [];
    return json(res, 200, files);
  }

  // ── Get a specific extracted manifest ──────────────────────────────────
  // GET /extracted/:templateName
  if (req.method === "GET" && url.startsWith("/extracted/")) {
    const templateName = decodeURIComponent(url.replace("/extracted/", ""));
    const fp = path.join(EXTRACTED_DIR, templateName + ".params.json");
    if (!fs.existsSync(fp)) return json(res, 404, { error: "Not found" });
    try {
      const manifest = JSON.parse(fs.readFileSync(fp, "utf8"));
      // Strip the full layer tree to keep response size manageable
      delete manifest.layerTree;
      return json(res, 200, manifest);
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  // ── Render SVG to PNG (feedback loop) ────────────────────────────────
  // POST /svg-preview
  if (req.method === "POST" && url === "/svg-preview") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { svg, width } = JSON.parse(body);
        if (!svg) return json(res, 400, { error: "Missing svg field" });
        const svgStr = String(svg).replace(/^\uFEFF/, "");
        const { Resvg } = require("@resvg/resvg-js");
        const resvg = new Resvg(Buffer.from(svgStr, "utf8"), {
          background: "#111113",
          fitTo: { mode: "width", value: width || 800 },
        });
        const rendered = resvg.render();
        const png = rendered.asPng();
        const b64 = `data:image/png;base64,${Buffer.from(png).toString("base64")}`;
        return json(res, 200, { dataUrl: b64, width: rendered.width, height: rendered.height });
      } catch (e) {
        return json(res, 500, { error: e.message });
      }
    });
    return;
  }

  // ── List SVG assets and reference images ─────────────────────────────
  // GET /assets
  if (req.method === "GET" && url === "/assets") {
    const result = [];
    if (fs.existsSync(SVG_ASSETS_DIR)) {
      const comps = fs.readdirSync(SVG_ASSETS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory());
      for (const dir of comps) {
        const compDir = path.join(SVG_ASSETS_DIR, dir.name);
        const refDir  = path.join(compDir, "ref");
        const svgs = fs.readdirSync(compDir)
          .filter((f) => ALLOWED_SVG.test(f) && fs.statSync(path.join(compDir, f)).isFile())
          .map((f) => {
            const stat = fs.statSync(path.join(compDir, f));
            return { name: f, path: `/svg/${dir.name}/${f}`, size: stat.size, sizeHuman: formatBytes(stat.size), modified: stat.mtime.toISOString() };
          })
          .sort((a, b) => new Date(b.modified) - new Date(a.modified));
        const references = fs.existsSync(refDir)
          ? fs.readdirSync(refDir)
              .filter((f) => ALLOWED_IMAGE.test(f) && fs.statSync(path.join(refDir, f)).isFile())
              .map((f) => {
                const stat = fs.statSync(path.join(refDir, f));
                return { name: f, path: `/svg/${dir.name}/ref/${f}`, size: stat.size, sizeHuman: formatBytes(stat.size), modified: stat.mtime.toISOString() };
              })
              .sort((a, b) => new Date(b.modified) - new Date(a.modified))
          : [];
        result.push({ comp: dir.name, svgs, references });
      }
    }
    return json(res, 200, result);
  }

  // ── SFX Library — list entries ──────────────────────────────────────
  // GET /sfx
  if (req.method === "GET" && url === "/sfx") {
    const libPath = path.join(ROOT, "public", "audio", "sfx", "library.json");
    if (!fs.existsSync(libPath)) return json(res, 200, { entries: [], defaults: {} });
    const lib = JSON.parse(fs.readFileSync(libPath, "utf-8"));
    return json(res, 200, lib);
  }

  // ── SFX Library — rate an entry ───────────────────────────────────
  // POST /sfx/rate  { id: string, rating: number }
  if (req.method === "POST" && url === "/sfx/rate") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { id, rating } = JSON.parse(body);
        const libPath = path.join(ROOT, "public", "audio", "sfx", "library.json");
        const lib = JSON.parse(fs.readFileSync(libPath, "utf-8"));
        const entry = lib.entries.find((e) => e.id === id);
        if (!entry) return json(res, 404, { error: "Entry not found" });
        entry.rating = Math.max(0, Math.min(5, rating));
        fs.writeFileSync(libPath, JSON.stringify(lib, null, 2) + "\n");
        return json(res, 200, { ok: true, entry });
      } catch (e) {
        return json(res, 500, { error: e.message });
      }
    });
    return;
  }

  // ── SFX Library — set default for category ────────────────────────
  // POST /sfx/set-default  { id: string }
  if (req.method === "POST" && url === "/sfx/set-default") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { id } = JSON.parse(body);
        const libPath = path.join(ROOT, "public", "audio", "sfx", "library.json");
        const lib = JSON.parse(fs.readFileSync(libPath, "utf-8"));
        const entry = lib.entries.find((e) => e.id === id);
        if (!entry) return json(res, 404, { error: "Entry not found" });
        const key = `${entry.category}:${entry.intensity}`;
        lib.defaults[key] = id;
        for (const e of lib.entries) {
          if (`${e.category}:${e.intensity}` === key) e.default = e.id === id;
        }
        fs.writeFileSync(libPath, JSON.stringify(lib, null, 2) + "\n");
        return json(res, 200, { ok: true, key, defaultId: id });
      } catch (e) {
        return json(res, 500, { error: e.message });
      }
    });
    return;
  }

  // ── SFX Library — delete an entry ─────────────────────────────────
  // DELETE /sfx/:id
  if (req.method === "DELETE" && url.startsWith("/sfx/")) {
    const id = url.slice(5);
    const libPath = path.join(ROOT, "public", "audio", "sfx", "library.json");
    const lib = JSON.parse(fs.readFileSync(libPath, "utf-8"));
    const idx = lib.entries.findIndex((e) => e.id === id);
    if (idx < 0) return json(res, 404, { error: "Entry not found" });
    const entry = lib.entries[idx];
    const filePath = path.join(ROOT, "public", "audio", "sfx", entry.file);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    lib.entries.splice(idx, 1);
    const key = `${entry.category}:${entry.intensity}`;
    if (lib.defaults[key] === id) lib.defaults[key] = null;
    fs.writeFileSync(libPath, JSON.stringify(lib, null, 2) + "\n");
    return json(res, 200, { ok: true, deleted: id });
  }

  // ── SFX Library — generate via ElevenLabs ─────────────────────────
  // POST /sfx/generate  { type: string, intensity: string, prompt?: string }
  if (req.method === "POST" && url === "/sfx/generate") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const { type, intensity, prompt } = JSON.parse(body);
        const { spawn } = require("child_process");
        const args = ["scripts/generate-sfx.js", "--type", type, "--intensity", intensity || "medium"];
        if (prompt) args.push("--prompt", prompt);
        const proc = spawn("node", args, { cwd: ROOT, stdio: "pipe" });
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", (d) => (stdout += d));
        proc.stderr.on("data", (d) => (stderr += d));
        proc.on("close", (code) => {
          if (code !== 0) return json(res, 500, { error: stderr || "Generation failed" });
          const idMatch = stdout.match(/ID: (.+)/);
          return json(res, 200, { ok: true, output: stdout, id: idMatch ? idMatch[1].trim() : null });
        });
      } catch (e) {
        return json(res, 500, { error: e.message });
      }
    });
    return;
  }

  // ── Pitch-shift / gain-boost audio (speed-independent via rubberband) ───
  // POST /audio/pitch-shift  body: { src, semitones, gainDb? }
  // gainDb > 0 amplifies the audio (used when volume > 100%).
  if (req.method === "POST" && url === "/audio/pitch-shift") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const { src, semitones, gainDb } = JSON.parse(body);
        if (!src || typeof semitones !== "number") {
          return json(res, 400, { error: "src (string) and semitones (number) required" });
        }

        const hasGain  = typeof gainDb === "number" && gainDb !== 0;
        const hasPitch = semitones !== 0;

        if (!hasPitch && !hasGain) {
          return json(res, 200, { ok: true, pitchedSrc: src });
        }

        const basename = path.basename(src, path.extname(src));
        const sign = semitones > 0 ? "+" : "";
        const pitchTag = hasPitch ? `_${sign}${semitones}st` : "";
        const gainTag  = hasGain  ? `_${gainDb > 0 ? "+" : ""}${gainDb.toFixed(1)}dB` : "";
        const outName = `${basename}${pitchTag}${gainTag}.wav`;
        const outPath = path.join(PITCHED_DIR, outName);
        const publicPath = `/audio/pitched/${outName}`;

        if (fs.existsSync(outPath)) {
          return json(res, 200, { ok: true, pitchedSrc: publicPath });
        }

        const inputPath = path.join(ROOT, "public", src);
        if (!fs.existsSync(inputPath)) {
          return json(res, 404, { error: `Source file not found: ${src}` });
        }

        const filters = [];
        if (hasPitch) {
          const ratio = Math.pow(2, semitones / 12);
          filters.push(`rubberband=pitch=${ratio}`);
        }
        if (hasGain) {
          filters.push(`volume=${gainDb}dB`);
        }

        const ffmpeg = spawn("ffmpeg", [
          "-y", "-i", inputPath,
          "-af", filters.join(","),
          outPath,
        ]);

        let stderr = "";
        ffmpeg.stderr.on("data", (d) => (stderr += d.toString()));
        ffmpeg.on("close", (code) => {
          if (code !== 0) {
            console.error("ffmpeg audio processing failed:", stderr);
            return json(res, 500, { error: "ffmpeg audio processing failed", detail: stderr.slice(-500) });
          }
          return json(res, 200, { ok: true, pitchedSrc: publicPath });
        });
      } catch (err) {
        return json(res, 400, { error: err.message });
      }
    });
    return;
  }

  // ── Cue sheet CRUD ───────────────────────────────────────────────
  // GET /cues/:compId
  if (req.method === "GET" && url.match(/^\/cues\/[^/]+$/)) {
    const compId = decodeURIComponent(url.split("/")[2]);
    const filePath = path.join(CUES_DIR, `${compId}.json`);
    if (!fs.existsSync(filePath)) {
      res.writeHead(200, JSON_HEADERS);
      res.end(JSON.stringify([]));
      return;
    }
    try {
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      res.writeHead(200, JSON_HEADERS);
      res.end(JSON.stringify(data));
    } catch {
      res.writeHead(200, JSON_HEADERS);
      res.end(JSON.stringify([]));
    }
    return;
  }

  // PUT /cues/:compId
  if (req.method === "PUT" && url.match(/^\/cues\/[^/]+$/)) {
    const compId = decodeURIComponent(url.split("/")[2]);
    const filePath = path.join(CUES_DIR, `${compId}.json`);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const cues = JSON.parse(body);
        if (!Array.isArray(cues)) { res.writeHead(400, JSON_HEADERS); res.end(JSON.stringify({ error: "Body must be an array" })); return; }
        fs.writeFileSync(filePath, JSON.stringify(cues, null, 2));
        res.writeHead(200, JSON_HEADERS);
        res.end(JSON.stringify({ ok: true, count: cues.length }));
      } catch (err) {
        res.writeHead(400, JSON_HEADERS);
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ── SFX audio file serving ────────────────────────────────────────
  // GET /sfx-audio/:category/:filename
  if (req.method === "GET" && url.startsWith("/sfx-audio/")) {
    const relPath = url.slice(11);
    const filePath = path.join(ROOT, "public", "audio", "sfx", relPath);
    if (!fs.existsSync(filePath)) { res.writeHead(404); res.end("Not found"); return; }
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = { ".mp3": "audio/mpeg", ".wav": "audio/wav", ".ogg": "audio/ogg", ".m4a": "audio/m4a" };
    res.writeHead(200, { "Content-Type": mimeMap[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("────────────────────────────────────────");
  console.log(`  🎬  Ad Studio API  →  localhost:${PORT}`);
  console.log("────────────────────────────────────────\n");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n✗  Port ${PORT} is already in use.\n`);
    process.exit(1);
  } else { throw err; }
});
