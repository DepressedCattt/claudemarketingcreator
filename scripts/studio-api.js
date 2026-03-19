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
 */

const http    = require("http");
const fs      = require("fs");
const path    = require("path");
const { spawn } = require("child_process");
const { formidable } = require("formidable");

const PORT         = 3002;
const ROOT         = path.join(__dirname, "..");
const AUDIO_DIR    = path.join(ROOT, "public", "audio");
const OUT_DIR      = path.join(ROOT, "out");
const STATE_FILE   = path.join(ROOT, "studio", "state.json");
const HISTORY_FILE = path.join(ROOT, "studio", "render-history.json");
const ALLOWED      = /\.(mp3|wav|aac|ogg|flac|m4a|opus)$/i;

fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(OUT_DIR,   { recursive: true });
fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });

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
