import { Config } from "@remotion/cli/config";

// Output format — jpeg is faster to render than png for video
Config.setVideoImageFormat("jpeg");

// Always overwrite existing output files
Config.setOverwriteOutput(true);

// Codec — h264 is the most compatible for social platforms
Config.setCodec("h264");

// ── GPU acceleration ──────────────────────────────────────────────────────────
// "angle" uses the ANGLE abstraction layer which routes WebGL through the
// system GPU (Direct3D 11 on Windows). This replaces the SwiftShader software
// renderer and typically gives 10–20× faster frame renders for Three.js scenes.
Config.setChromiumOpenGlRenderer("angle");

// ── Concurrency ───────────────────────────────────────────────────────────────
// Each worker is a separate headless Chrome tab — they all share the same GPU
// so raising this doesn't multiply GPU cost the way it would CPU cores.
// 4 is a good default; raise to 6–8 if renders are still slow.
Config.setConcurrency(4);
