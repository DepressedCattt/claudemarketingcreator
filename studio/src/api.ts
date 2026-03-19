/**
 * API client — thin wrappers around the studio-api.js Express server.
 * All requests go to /api/* which Vite proxies to localhost:3002.
 */

import type { AudioFile, AudioTrack, StudioState } from "./types";

const BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status}`);
  return r.json() as Promise<T>;
}

// ─── Health ──────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

// ─── Audio files ─────────────────────────────────────────────────────────────
export async function listAudioFiles(): Promise<AudioFile[]> {
  return get<AudioFile[]>("/files");
}

export async function uploadAudioFiles(files: FileList): Promise<{ uploaded: AudioFile[]; files: AudioFile[] }> {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append("file", f));
  const r = await fetch(`${BASE}/upload`, { method: "POST", body: form });
  if (!r.ok) throw new Error(`Upload failed: ${r.status}`);
  return r.json();
}

export async function deleteAudioFile(name: string): Promise<AudioFile[]> {
  const r = await fetch(`${BASE}/files/${encodeURIComponent(name)}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`Delete failed: ${r.status}`);
  const data = await r.json();
  return data.files as AudioFile[];
}

// ─── Studio state (audio config per composition) ─────────────────────────────
export async function loadStudioState(): Promise<StudioState> {
  return get<StudioState>("/state");
}

export async function saveAudioTracks(
  compId: string,
  tracks: AudioTrack[],
): Promise<void> {
  await post("/state/audio", { compId, tracks });
}

// ─── Render ───────────────────────────────────────────────────────────────────

export interface RenderOptions {
  compId:         string;
  outFile?:       string;
  quality?:       "normal" | "hq";
  /** WebGL canvas pixel multiplier. 1 = native, 2 = 2× resolution. */
  scale?:         number;
  /** H.264/H.265 CRF. Lower = better quality. 0 = lossless. */
  crf?:           number;
  /** JPEG quality for PNG→JPEG frame encoding (0–100). */
  jpegQuality?:   number;
  /** Output codec: h264 | h265 | vp8 | vp9 | prores */
  codec?:         string;
  /** Render every N-th frame (2 = half speed, useful for draft previews). */
  everyNthFrame?: number;
  /** Inclusive start frame for partial renders. */
  startFrame?:    number;
  /** Inclusive end frame for partial renders. */
  endFrame?:      number;
}

export async function renderComp(
  compId:  string,
  outFile: string,
): Promise<{ started: boolean; jobId: string; message: string }> {
  return post("/render", { compId, outFile, quality: "normal" });
}

export async function startRender(
  opts: RenderOptions,
): Promise<{ started: boolean; jobId: string; message: string }> {
  return post("/render", opts);
}

export async function renderCompHQ(
  compId:  string,
  outFile: string,
): Promise<{ started: boolean; jobId: string; message: string }> {
  return post("/render", { compId, outFile, quality: "hq" });
}

export interface RenderStatus {
  done:        boolean;
  failed:      boolean;
  frames:      number;
  totalFrames: number;
  pct:         number;
  elapsed:     number;
  output:      string;
}

export async function getRenderStatus(jobId: string): Promise<RenderStatus> {
  return get<RenderStatus>(`/render-status/${jobId}`);
}

/** URL to stream a rendered video file from out/ directory. */
export function previewUrl(filename: string): string {
  return `/api/preview/${encodeURIComponent(filename.replace(/^out\//, ""))}`;
}

// ─── Render history ───────────────────────────────────────────────────────────

export interface RenderHistoryEntry {
  id:              string;
  compId:          string;
  startedAt:       string;
  finishedAt:      string;
  durationSec:     number;
  success:         boolean;
  settings: {
    scale:         number;
    crf:           number;
    jpegQuality:   number;
    codec:         string;
    everyNthFrame: number;
    preset:        string;
    startFrame?:   number;
    endFrame?:     number;
  };
  outputFile:      string;
  outputSizeBytes: number | null;
  totalFrames:     number;
  framesPerSec:    number | null;
  exitCode:        number;
}

export async function getRenderHistory(): Promise<RenderHistoryEntry[]> {
  return get<RenderHistoryEntry[]>("/render-history");
}
