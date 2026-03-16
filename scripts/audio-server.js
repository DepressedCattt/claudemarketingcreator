/**
 * Audio Import Server
 * Run with:  npm run audio
 *
 * Starts a small HTTP server on port 3001 that accepts audio file uploads
 * and saves them to /public/audio/.  The AudioEditor composition in Remotion
 * Studio communicates with this server so you can drag-and-drop files
 * directly inside the editor UI without touching the file system manually.
 *
 * API:
 *   GET  /files            — list all files in /public/audio/
 *   POST /upload           — multipart upload, saves to /public/audio/
 *   DELETE /files/:name    — delete a file from /public/audio/
 *   GET  /health           — heartbeat so the editor can detect if server is running
 */

const http = require("http");
const fs   = require("fs");
const path = require("path");
const { formidable } = require("formidable");

const PORT      = 3001;
const AUDIO_DIR = path.join(__dirname, "..", "public", "audio");
const ALLOWED_EXTENSIONS = /\.(mp3|wav|aac|ogg|flac|m4a|opus)$/i;

// Ensure audio directory exists
fs.mkdirSync(AUDIO_DIR, { recursive: true });

// ─── Helpers ────────────────────────────────────────────────────────────────

function json(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type":                "application/json",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(data));
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function listFiles() {
  return fs
    .readdirSync(AUDIO_DIR)
    .filter((f) => ALLOWED_EXTENSIONS.test(f) && f !== "README.md")
    .map((name) => {
      const stat = fs.statSync(path.join(AUDIO_DIR, name));
      return {
        name,
        path:     `/audio/${name}`,
        size:     stat.size,
        sizeHuman: formatBytes(stat.size),
        modified: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => new Date(b.modified) - new Date(a.modified));
}

// ─── Request handler ─────────────────────────────────────────────────────────

const server = http.createServer((req, res) => {
  // CORS pre-flight
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url.split("?")[0]; // strip query string

  // ── GET /health ────────────────────────────────────────────────────────────
  if (req.method === "GET" && url === "/health") {
    json(res, 200, { ok: true, port: PORT });
    return;
  }

  // ── GET /files ─────────────────────────────────────────────────────────────
  if (req.method === "GET" && url === "/files") {
    try {
      json(res, 200, listFiles());
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return;
  }

  // ── POST /upload ───────────────────────────────────────────────────────────
  if (req.method === "POST" && url === "/upload") {
    const form = formidable({
      uploadDir:   AUDIO_DIR,
      keepExtensions: true,
      maxFileSize: 200 * 1024 * 1024, // 200 MB
      filter: ({ mimetype, originalFilename }) => {
        // Accept audio files only
        return (
          (mimetype && mimetype.startsWith("audio/")) ||
          ALLOWED_EXTENSIONS.test(originalFilename || "")
        );
      },
    });

    form.parse(req, (err, _fields, files) => {
      if (err) {
        console.error("Upload error:", err.message);
        json(res, 400, { error: err.message });
        return;
      }

      const uploaded = [];
      const allFiles = Object.values(files).flat();

      for (const file of allFiles) {
        const originalName = file.originalFilename || file.newFilename;
        if (!ALLOWED_EXTENSIONS.test(originalName)) {
          // Clean up and skip non-audio
          try { fs.unlinkSync(file.filepath); } catch {}
          continue;
        }

        // Sanitise the filename
        const safeName = path.basename(originalName).replace(/[^a-zA-Z0-9._\-\s]/g, "_");
        const dest     = path.join(AUDIO_DIR, safeName);

        try {
          fs.renameSync(file.filepath, dest);
          const stat = fs.statSync(dest);
          uploaded.push({
            name:      safeName,
            path:      `/audio/${safeName}`,
            size:      stat.size,
            sizeHuman: formatBytes(stat.size),
          });
          console.log(`✓ Saved: ${safeName} (${formatBytes(stat.size)})`);
        } catch (renameErr) {
          console.error(`Failed to save ${originalName}:`, renameErr.message);
        }
      }

      if (uploaded.length === 0) {
        json(res, 400, { error: "No valid audio files found in upload. Supported: mp3, wav, aac, ogg, flac, m4a, opus" });
        return;
      }

      json(res, 200, { uploaded, files: listFiles() });
    });
    return;
  }

  // ── DELETE /files/:name ────────────────────────────────────────────────────
  if (req.method === "DELETE" && url.startsWith("/files/")) {
    const filename = decodeURIComponent(url.replace("/files/", ""));
    // Security: no path traversal
    const safeName = path.basename(filename);
    const filepath = path.join(AUDIO_DIR, safeName);

    if (!fs.existsSync(filepath)) {
      json(res, 404, { error: "File not found" });
      return;
    }
    try {
      fs.unlinkSync(filepath);
      console.log(`✕ Deleted: ${safeName}`);
      json(res, 200, { deleted: safeName, files: listFiles() });
    } catch (err) {
      json(res, 500, { error: err.message });
    }
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log("─────────────────────────────────────────────");
  console.log("  🎵  Audio Import Server");
  console.log(`       http://localhost:${PORT}`);
  console.log("─────────────────────────────────────────────");
  console.log(`  Saving files to: ${AUDIO_DIR}`);
  console.log("  Open 'audio-editor' in Remotion Studio");
  console.log("  and drag your audio files onto the import panel.");
  console.log("─────────────────────────────────────────────\n");

  // List any existing files on startup
  const existing = listFiles();
  if (existing.length > 0) {
    console.log(`  ${existing.length} existing file(s):`);
    existing.forEach((f) => console.log(`    • ${f.name} (${f.sizeHuman})`));
    console.log();
  }
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\n  ✗  Port ${PORT} is already in use.`);
    console.error(`     Kill the other process or change PORT in scripts/audio-server.js\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});
