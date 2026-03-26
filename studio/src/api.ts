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

// ─── Reference ad analysis ────────────────────────────────────────────────────

export interface ReferenceAdFile {
  name:       string;
  size:       number;
  sizeHuman:  string;
  modified:   string;
}

export interface AnalysisStatus {
  done:         boolean;
  failed:       boolean;
  stage:        string;
  ticks:        number;
  adName:       string;
  sectionIndex: number | null;
  errorMsg:     string | null;
  elapsed:      number;
  logs:         string[];
}

export async function listReferenceAds(): Promise<ReferenceAdFile[]> {
  return get<ReferenceAdFile[]>("/reference-ads");
}

export async function startAnalysis(
  file:   File,
  adName: string,
): Promise<{ started: boolean; jobId: string; adName: string; message: string }> {
  const form = new FormData();
  form.append("file",   file);
  form.append("adName", adName);
  const r = await fetch(`${BASE}/analyze-reference`, { method: "POST", body: form });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
    throw new Error(err.error ?? `HTTP ${r.status}`);
  }
  return r.json();
}

export async function getAnalysisStatus(jobId: string): Promise<AnalysisStatus> {
  return get<AnalysisStatus>(`/analyze-status/${jobId}`);
}

// ─── Visual comparison ────────────────────────────────────────────────────────

export interface RenderedFile {
  name:      string;
  size:      number;
  sizeHuman: string;
  modified:  string;
}

export interface ComparisonCategory {
  score: number;
  max:   number;
  note:  string;
}

export interface ComparisonFix {
  priority:  number;
  category:  string;
  issue:     string;
  codeHint:  string;
}

export interface ParameterDelta {
  parameter:         string;
  level:             string;
  current_estimated: string | number;
  target_estimated:  string | number;
  confidence:        number;
  reasoning:         string;
}

export interface ComparisonResult {
  compId:           string;
  iterN:            number;
  timestamp:        string;
  referenceFile:    string;
  renderedFile:     string;
  overallScore:     number;
  detectedProfile:  string | null;
  categories: {
    colors:        ComparisonCategory;
    motionTiming:  ComparisonCategory;
    typography:    ComparisonCategory;
    layout:        ComparisonCategory;
    kineticEnergy: ComparisonCategory;
  };
  fixes:            ComparisonFix[];
  parameterDeltas:  ParameterDelta[];
  iterationNote:    string;
}

export interface ComparisonStatus {
  done:         boolean;
  failed:       boolean;
  stage:        string;
  ticks:        number;
  compId:       string;
  iterN:        number | null;
  filename:     string | null;
  overallScore: number | null;
  fixCount:     number | null;
  errorMsg:     string | null;
  elapsed:      number;
  logs:         string[];
}

export async function listRenderedFiles(): Promise<RenderedFile[]> {
  return get<RenderedFile[]>("/rendered-files");
}

export async function startComparison(
  compId:           string,
  referenceFile:    File | null,
  referenceFilename: string | null,
  renderedFile:     File | null,
  renderedFilename: string | null,
): Promise<{ started: boolean; jobId: string; compId: string; message: string }> {
  const form = new FormData();
  form.append("compId", compId);
  if (referenceFile)     form.append("referenceFile",     referenceFile);
  if (referenceFilename) form.append("referenceFilename", referenceFilename);
  if (renderedFile)      form.append("renderedFile",      renderedFile);
  if (renderedFilename)  form.append("renderedFilename",  renderedFilename);
  const r = await fetch(`${BASE}/compare-ads`, { method: "POST", body: form });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
    throw new Error(err.error ?? `HTTP ${r.status}`);
  }
  return r.json();
}

export async function getComparisonStatus(jobId: string): Promise<ComparisonStatus> {
  return get<ComparisonStatus>(`/compare-status/${jobId}`);
}

export async function getComparisonResult(
  compId: string,
): Promise<{ latest: ComparisonResult | null; history: string[] }> {
  return get(`/compare-results/${encodeURIComponent(compId)}`);
}

// ─── Lottie extraction & code generation ──────────────────────────────────────

export interface ExtractedManifestMeta {
  templateName:   string;
  fps:            number;
  totalFrames:    number;
  width:          number;
  height:         number;
  layerCount:     number;
  profile:        string | null;
  techniqueCount: number;
}

export interface ExtractedFile {
  name:      string;
  size:      number;
  sizeHuman: string;
  modified:  string;
  meta:      ExtractedManifestMeta | null;
}

export interface ExtractedManifest {
  templateName:      string;
  sourceFile:        string;
  extractedAt:       string;
  extractionMethod?: string;
  version:           string;
  meta:              { fps: number; width: number; height: number; totalFrames: number; totalDuration: number; has3D: boolean; layerCount: number; fontCount: number; assetCount: number; effectCount?: number; expressionCount?: number };
  l1_physics:        { easings: Array<{ name: string; css: string; source: string }>; springs: Array<{ stiffness: number; damping: number; mass: number; preset: string | null; source: string }>; staggerPatterns: unknown[] };
  l2_visual:         { colors: Array<{ type: string; color: string; name: string | null }>; textStyles: unknown[]; fonts: Array<{ family: string; name: string; style: string; weight: number }> };
  l3_composition:    { dimensions: { width: number; height: number; aspect: string | null }; layers: unknown[]; parentChildGroups: Record<string, string[]> };
  l4_temporal:       { fps: number; totalFrames: number; totalDuration: number; scenes: Array<{ scene: number; startFrame: number; endFrame: number; durationFrames: number; startTime: number; endTime: number; durationSec: number; layers: string[] }>; keyframeDensity: { total: number; perSecond: number } };
  l5_techniques:     Array<{ name: string; confidence: number; layers?: string[]; count?: number }>;
  detectedProfile:   { profile: string; score: number; all: Record<string, number> } | null;
  expressions?:      Array<{ layer: string; property: string; propertyName: string; expression: string }>;
  precompositions?:  Array<{ name: string; width: number; height: number; fps: number; duration: number; layerCount: number }>;
}

export interface ExtractionResult {
  success:      boolean;
  templateName: string;
  outputPath:   string;
  manifest:     ExtractedManifest;
}

export interface GenerationResult {
  success:         boolean;
  compId:          string;
  compName:        string;
  filePath:        string;
  rootSnippet:     string;
  registrySnippet: string;
}

export async function listExtracted(): Promise<ExtractedFile[]> {
  return get<ExtractedFile[]>("/extracted");
}

export async function getExtractedManifest(templateName: string): Promise<ExtractedManifest> {
  return get<ExtractedManifest>(`/extracted/${encodeURIComponent(templateName)}`);
}

export async function extractParams(
  file: File,
  templateName: string,
): Promise<ExtractionResult> {
  const form = new FormData();
  form.append("file", file);
  if (templateName) form.append("templateName", templateName);
  const r = await fetch(`${BASE}/extract-params`, { method: "POST", body: form });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
    throw new Error(err.error ?? `HTTP ${r.status}`);
  }
  return r.json();
}

export interface AeExtractionResult {
  success?:          boolean;
  started?:          boolean;
  jobId?:            string;
  templateName:      string;
  outputPath?:       string;
  extractionMethod?: string;
  manifest?:         ExtractedManifest;
  message?:          string;
}

export async function extractAeParams(
  file: File,
  templateName: string,
): Promise<AeExtractionResult> {
  const form = new FormData();
  form.append("file", file);
  if (templateName) form.append("templateName", templateName);
  const r = await fetch(`${BASE}/extract-ae`, { method: "POST", body: form });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
    throw new Error(err.error ?? `HTTP ${r.status}`);
  }
  return r.json();
}

export async function generateComposition(
  templateName: string,
  compId?: string,
): Promise<GenerationResult> {
  return post<GenerationResult>("/generate-composition", { templateName, compId });
}

// ─── SVG / reference-image asset browser ───────────────────────────────────

export interface AssetFileEntry {
  name:      string;
  path:      string;
  size:      number;
  sizeHuman: string;
  modified:  string;
}

export interface AssetFolder {
  comp:       string;
  svgs:       AssetFileEntry[];
  references: AssetFileEntry[];
}

export async function listAssets(): Promise<AssetFolder[]> {
  return get<AssetFolder[]>("/assets");
}

export interface SvgPreviewResult {
  dataUrl: string;
  width:   number;
  height:  number;
}

export async function previewSvg(svg: string, width = 800): Promise<SvgPreviewResult> {
  return post<SvgPreviewResult>("/svg-preview", { svg, width });
}

// ─── Cues ─────────────────────────────────────────────────────────────────────

async function put<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PUT ${path} → ${r.status}`);
  return r.json() as Promise<T>;
}

export async function loadCues(compId: string): Promise<import("./types").CueEvent[]> {
  return get<import("./types").CueEvent[]>(`/cues/${encodeURIComponent(compId)}`);
}

export async function saveCues(compId: string, cues: import("./types").CueEvent[]): Promise<{ ok: boolean; count: number }> {
  return put<{ ok: boolean; count: number }>(`/cues/${encodeURIComponent(compId)}`, cues);
}

// ─── Pitch shift ──────────────────────────────────────────────────────────────

export async function pitchShiftAudio(
  src: string,
  semitones: number,
  gainDb?: number,
): Promise<{ ok: boolean; pitchedSrc: string }> {
  return post<{ ok: boolean; pitchedSrc: string }>("/audio/pitch-shift", { src, semitones, gainDb });
}

// ─── SFX Library ──────────────────────────────────────────────────────────────

export interface SfxEntry {
  id:         string;
  file:       string;
  category:   string;
  intensity:  string;
  tags:       string[];
  durationMs: number;
  source:     string;
  prompt:     string;
  rating:     number;
  default:    boolean;
  createdAt:  string;
}

export interface SfxLibrary {
  version:        number;
  densityPresets: Record<string, { minPriority: number; description: string }>;
  defaults:       Record<string, string | null>;
  entries:        SfxEntry[];
}

export async function listSfx(): Promise<SfxLibrary> {
  return get<SfxLibrary>("/sfx");
}

export async function rateSfx(id: string, rating: number): Promise<{ ok: boolean; entry: SfxEntry }> {
  return post<{ ok: boolean; entry: SfxEntry }>("/sfx/rate", { id, rating });
}

export async function setDefaultSfx(id: string): Promise<{ ok: boolean; key: string; defaultId: string }> {
  return post<{ ok: boolean; key: string; defaultId: string }>("/sfx/set-default", { id });
}

export async function deleteSfx(id: string): Promise<{ ok: boolean; deleted: string }> {
  const r = await fetch(`${BASE}/sfx/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(`DELETE /sfx/${id} → ${r.status}`);
  return r.json();
}

export async function generateSfx(
  type: string, intensity: string, prompt?: string
): Promise<{ ok: boolean; output: string; id: string | null }> {
  return post<{ ok: boolean; output: string; id: string | null }>("/sfx/generate", { type, intensity, prompt });
}
