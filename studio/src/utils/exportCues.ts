/**
 * Cue Sheet Exporter
 *
 * Formats a composition's CueEvent array into a human-readable text file
 * suitable for pasting into an AI music generator (Suno, Udio, Soundraw, etc.)
 * or handing to a sound designer.
 *
 * Usage:
 *   const text = buildCueSheet(comp);
 *   downloadText(`${comp.id}-cues.txt`, text);
 */

import type { CueEvent, CueIntensity } from "@utils/cueTypes";
import type { CompMeta } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(s: string, width: number): string {
  return s.padEnd(width, " ");
}

function frameToSec(frame: number, fps: number): string {
  return (frame / fps).toFixed(2) + "s";
}

const INTENSITY_LABEL: Record<CueIntensity, string> = {
  hard:   "HARD  ",
  medium: "MEDIUM",
  soft:   "SOFT  ",
};

const TYPE_SFX_HINT: Record<string, string> = {
  SCENE_CUT:   "Strong impact hit — this is a hard visual cut",
  TEXT_REVEAL: "Soft shimmer, air, or subtle text pop",
  TEXT_IMPACT: "Punchy snap/slam — dominant headline",
  HERO_ENTRY:  "Rising whoosh + impact on settle",
  OBJECT_LAND: "UI click or soft snap",
  WIPE:        "Short directional sweep",
  BEAT_LOCK:   "Rhythmic click/pulse sequence — establishes tempo",
  STAT_BUILD:  "Impact + decay — big number",
  CTA_REVEAL:  "Clean click or chime — conclusive feel",
  AMBIENT:     "Background shimmer or sustain",
};

// ─── Main builder ─────────────────────────────────────────────────────────────

export function buildCueSheet(comp: CompMeta): string {
  const { id, label, durationInFrames, fps, width, height, format, cues } = comp;
  const durationSec = (durationInFrames / fps).toFixed(1);
  const now         = new Date().toISOString().slice(0, 10);

  const border = "═".repeat(60);
  const divider = "─".repeat(60);

  const lines: string[] = [];

  // ── Header ────────────────────────────────────────────────────────────────
  lines.push(border);
  lines.push(`  ${label.toUpperCase()} — Animation Cue Sheet`);
  lines.push(border);
  lines.push(`  Composition : ${id}`);
  lines.push(`  Format      : ${format}  (${width}×${height})`);
  lines.push(`  Duration    : ${durationSec}s  (${durationInFrames} frames @ ${fps}fps)`);
  lines.push(`  Generated   : ${now}`);
  lines.push(border);
  lines.push("");

  // ── No cues guard ────────────────────────────────────────────────────────
  if (!cues || cues.length === 0) {
    lines.push("  No cue events have been defined for this composition.");
    lines.push("  Add a `cues` array to the registry entry to enable exports.");
    lines.push("");
    lines.push(border);
    return lines.join("\n");
  }

  // ── Cue table ─────────────────────────────────────────────────────────────
  lines.push(`${"TIME".padEnd(10)}${"FRAME".padEnd(8)}${"INTENSITY".padEnd(10)}${"TYPE".padEnd(16)}EVENT`);
  lines.push(divider);

  // Sort by frame just in case they were defined out of order
  const sorted = [...cues].sort((a, b) => a.frame - b.frame);

  for (const cue of sorted) {
    const time      = pad(frameToSec(cue.frame, fps), 10);
    const frame     = pad(`f${cue.frame}`, 8);
    const intensity = pad(INTENSITY_LABEL[cue.intensity], 10);
    const type      = pad(cue.type, 16);
    lines.push(`${time}${frame}${intensity}${type}${cue.label}`);
    if (cue.notes) {
      lines.push(`${"".padEnd(44)}↳ ${cue.notes}`);
    }
  }

  lines.push(divider);
  lines.push(`${sorted.length} events across ${durationSec}s`);
  lines.push("");

  // ── SFX recommendations ───────────────────────────────────────────────────
  lines.push(border);
  lines.push("  SYNC RECOMMENDATIONS");
  lines.push(border);
  lines.push("");

  // Collect unique event types that appear in this cue sheet
  const usedTypes = [...new Set(sorted.map((c) => c.type))];
  for (const type of usedTypes) {
    const hint = TYPE_SFX_HINT[type] ?? "See label for context";
    lines.push(`  ${pad(type, 16)} — ${hint}`);
  }

  lines.push("");

  // Detect and surface BPM info from BEAT_LOCK events or stat hints
  const beatLock = sorted.find((c) => c.type === "BEAT_LOCK");
  if (beatLock) {
    lines.push("  TEMPO NOTES");
    lines.push(divider);
    lines.push(`  ● A BEAT_LOCK event appears at f${beatLock.frame} (${frameToSec(beatLock.frame, fps)}).`);
    lines.push(`    This is where the visual rhythm identity locks in.`);
    lines.push(`    Match music BPM to the visual beat established at this moment.`);
    lines.push("");
  }

  const sceneCuts = sorted.filter((c) => c.type === "SCENE_CUT");
  if (sceneCuts.length > 1) {
    const intervals = sceneCuts
      .map((c, i) => i > 0 ? c.frame - sceneCuts[i - 1].frame : null)
      .filter(Boolean) as number[];
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const avgSec      = (avgInterval / fps).toFixed(2);

    lines.push("  SCENE RHYTHM");
    lines.push(divider);
    lines.push(`  ● ${sceneCuts.length} scene cuts at: ${sceneCuts.map((c) => frameToSec(c.frame, fps)).join(", ")}`);
    lines.push(`  ● Average scene duration: ${avgSec}s`);
    lines.push(`  ● Place musical phrase boundaries at scene cuts for best sync.`);
    lines.push("");
  }

  // HARD events summary
  const hardEvents = sorted.filter((c) => c.intensity === "hard");
  lines.push("  HARD-HIT MOMENTS (priority SFX placement)");
  lines.push(divider);
  for (const evt of hardEvents) {
    lines.push(`  ● ${frameToSec(evt.frame, fps).padEnd(8)} f${String(evt.frame).padEnd(5)} ${evt.label}`);
  }
  lines.push("");
  lines.push(border);
  lines.push("");
  lines.push("  Paste this file into your music generator's notes field,");
  lines.push("  or share with a sound designer for SFX placement.");
  lines.push(border);

  return lines.join("\n");
}

// ─── Download helper ─────────────────────────────────────────────────────────

export function downloadText(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
