#!/usr/bin/env node
/**
 * mix-audio.js — Combine silent video + music track + SFX stem into final output
 *
 * Usage:
 *   node scripts/mix-audio.js --video renders/animly-v1.mp4 --music public/audio/track.mp3 --sfx renders/animly-v1-sfx-stem.wav
 *   node scripts/mix-audio.js --video renders/animly-v1.mp4 --sfx renders/animly-v1-sfx-stem.wav  (no music)
 *   node scripts/mix-audio.js --video renders/animly-v1.mp4 --music public/audio/track.mp3         (no SFX)
 *
 * Options:
 *   --music-volume 0.6    Music track volume (0.0-1.0, default 0.6)
 *   --sfx-volume 0.8      SFX stem volume (0.0-1.0, default 0.8)
 *   --fade-in 1.0         Music fade-in duration in seconds (default 0.5)
 *   --fade-out 2.0        Music fade-out duration in seconds (default 1.5)
 *   --output path.mp4     Output file path
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const RENDERS_DIR = path.join(ROOT, "renders");

fs.mkdirSync(RENDERS_DIR, { recursive: true });

function parseArgs(args) {
  const get = (flag, fallback) => {
    const idx = args.indexOf(flag);
    return idx >= 0 ? args[idx + 1] : fallback;
  };

  return {
    video:       get("--video", null),
    music:       get("--music", null),
    sfx:         get("--sfx", null),
    musicVolume: parseFloat(get("--music-volume", "0.6")),
    sfxVolume:   parseFloat(get("--sfx-volume", "0.8")),
    fadeIn:      parseFloat(get("--fade-in", "0.5")),
    fadeOut:     parseFloat(get("--fade-out", "1.5")),
    output:      get("--output", null),
  };
}

function getVideoDuration(videoPath) {
  try {
    const result = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${videoPath}"`,
      { encoding: "utf-8" }
    );
    return parseFloat(result.trim());
  } catch {
    return null;
  }
}

function mixAudio(opts) {
  if (!opts.video) {
    console.error("Error: --video is required");
    process.exit(1);
  }
  if (!opts.music && !opts.sfx) {
    console.error("Error: at least one of --music or --sfx is required");
    process.exit(1);
  }

  const videoPath = path.resolve(ROOT, opts.video);
  if (!fs.existsSync(videoPath)) {
    console.error(`Video not found: ${videoPath}`);
    process.exit(1);
  }

  const duration = getVideoDuration(videoPath);
  const baseName = path.basename(videoPath, path.extname(videoPath));
  const output = opts.output
    ? path.resolve(ROOT, opts.output)
    : path.join(RENDERS_DIR, `${baseName}-final.mp4`);

  console.log(`\nAudio Mix`);
  console.log(`  Video: ${videoPath}${duration ? ` (${duration.toFixed(1)}s)` : ""}`);

  const inputs = [`-i "${videoPath}"`];
  const filters = [];
  const audioStreams = [];
  let inputIdx = 1;

  if (opts.music) {
    const musicPath = path.resolve(ROOT, opts.music);
    if (!fs.existsSync(musicPath)) {
      console.error(`Music file not found: ${musicPath}`);
      process.exit(1);
    }
    inputs.push(`-i "${musicPath}"`);

    let musicFilter = `[${inputIdx}:a]volume=${opts.musicVolume}`;
    if (opts.fadeIn > 0) {
      musicFilter += `,afade=t=in:st=0:d=${opts.fadeIn}`;
    }
    if (opts.fadeOut > 0 && duration) {
      const fadeStart = Math.max(0, duration - opts.fadeOut);
      musicFilter += `,afade=t=out:st=${fadeStart}:d=${opts.fadeOut}`;
    }
    musicFilter += `[music]`;
    filters.push(musicFilter);
    audioStreams.push("[music]");
    inputIdx++;
    console.log(`  Music: ${musicPath} (vol ${opts.musicVolume}, fade in ${opts.fadeIn}s, fade out ${opts.fadeOut}s)`);
  }

  if (opts.sfx) {
    const sfxPath = path.resolve(ROOT, opts.sfx);
    if (!fs.existsSync(sfxPath)) {
      console.error(`SFX stem not found: ${sfxPath}`);
      process.exit(1);
    }
    inputs.push(`-i "${sfxPath}"`);
    filters.push(`[${inputIdx}:a]volume=${opts.sfxVolume}[sfx]`);
    audioStreams.push("[sfx]");
    inputIdx++;
    console.log(`  SFX:   ${sfxPath} (vol ${opts.sfxVolume})`);
  }

  let filterComplex;
  if (audioStreams.length === 2) {
    filterComplex = `${filters.join("; ")}; ${audioStreams.join("")}amix=inputs=2:duration=first[aout]`;
  } else {
    const streamName = audioStreams[0].replace("[", "").replace("]", "");
    filterComplex = filters[0].replace(`[${streamName}]`, "[aout]");
  }

  const cmd = [
    "ffmpeg -y",
    inputs.join(" "),
    `-filter_complex "${filterComplex}"`,
    '-map 0:v -map "[aout]"',
    "-c:v copy -c:a aac -b:a 192k",
    duration ? `-t ${duration}` : "",
    `"${output}"`,
  ].filter(Boolean).join(" ");

  console.log(`  Output: ${output}\n`);

  try {
    execSync(cmd, { stdio: "pipe", cwd: ROOT });
    console.log("Mix complete.");

    const stat = fs.statSync(output);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
    console.log(`Output: ${output} (${sizeMB} MB)`);
  } catch (err) {
    console.error("ffmpeg error:", err.stderr?.toString() || err.message);
    console.log("\nGenerated command (for debugging):");
    console.log(cmd);
    process.exit(1);
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help")) {
  console.log(`
Audio Mix — Combine silent video + music + SFX stem

Usage:
  node scripts/mix-audio.js --video <path> [--music <path>] [--sfx <path>] [options]

Options:
  --music-volume 0.6    Music volume (0.0-1.0)
  --sfx-volume 0.8      SFX volume (0.0-1.0)
  --fade-in 0.5         Music fade-in (seconds)
  --fade-out 1.5        Music fade-out (seconds)
  --output <path>       Output file path

Examples:
  node scripts/mix-audio.js --video out/animly-v1.mp4 --music public/audio/track.mp3 --sfx renders/animly-v1-sfx-stem.wav
  node scripts/mix-audio.js --video out/animly-v1.mp4 --sfx renders/animly-v1-sfx-stem.wav --sfx-volume 0.9
  `);
  process.exit(0);
}

mixAudio(parseArgs(args));
