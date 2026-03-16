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
export async function renderComp(
  compId:    string,
  outFile:   string,
): Promise<{ started: boolean; message: string }> {
  return post("/render", { compId, outFile });
}
