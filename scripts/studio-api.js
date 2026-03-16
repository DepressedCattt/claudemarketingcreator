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
 */

const http    = require("http");
const fs      = require("fs");
const path    = require("path");
const { spawn } = require("child_process");
const { formidable } = require("formidable");

const PORT      = 3002;
const ROOT      = path.join(__dirname, "..");
const AUDIO_DIR = path.join(ROOT, "public", "audio");
const STATE_FILE = path.join(ROOT, "studio", "state.json");
const ALLOWED   = /\.(mp3|wav|aac|ogg|flac|m4a|opus)$/i;

fs.mkdirSync(AUDIO_DIR, { recursive: true });
fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });

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
  if (req.method === "POST" && url === "/render") {
    const { compId, outFile } = await readBody(req);
    if (!compId) return json(res, 400, { error: "compId required" });

    const out = outFile || `out/${compId}.mp4`;
    console.log(`\n▶ Rendering ${compId} → ${out}`);

    const proc = spawn(
      "npx",
      ["remotion", "render", "src/index.ts", compId, out],
      { cwd: ROOT, stdio: "inherit", shell: true },
    );

    proc.on("close", (code) => {
      console.log(code === 0 ? `✓ Render done: ${out}` : `✗ Render failed (exit ${code})`);
    });

    return json(res, 200, {
      started: true,
      message: `Rendering ${compId}… check terminal for progress`,
    });
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
