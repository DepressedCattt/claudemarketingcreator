import React, { useState, useMemo, useCallback } from "react";
import { useStudio } from "../store/useStudio";
import { getComp }   from "../registry";
import { saveCues }  from "../api";
import type { CueEvent } from "../types";
import {
  buildElevenLabsPrompt,
  CUE_COLORS,
  FEEDBACK_PRESETS,
} from "../utils/sfxPromptBuilder";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getCurrentScene(
  sequences: { id: string; label: string; from: number; durationInFrames: number }[],
  frame: number,
): { label: string; from: number; durationInFrames: number } | null {
  for (const s of sequences) {
    if (frame >= s.from && frame < s.from + s.durationInFrames) return s;
  }
  return null;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
}

// ─── Expanded cue editor (extracted for clarity) ─────────────────────────────

const CuePromptEditor: React.FC<{
  cue:      CueEvent;
  fps:      number;
  profile?: string;
  prompt:   string;
  isDraft:  boolean;
  onDraft:  (text: string) => void;
  onSave:   (text: string) => void;
  onCopy:   (text: string) => void;
}> = ({ cue, fps, profile, prompt, isDraft, onDraft, onSave, onCopy }) => {
  // Per-cue feedback text and active preset tags
  const [feedback, setFeedback]     = useState("");
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [copied, setCopied]         = useState(false);

  const toggleTag = (id: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleRegenerate = () => {
    const tagModifiers = FEEDBACK_PRESETS
      .filter((p) => activeTags.has(p.id))
      .map((p) => p.modifier);
    const allFeedback = [feedback.trim(), ...tagModifiers]
      .filter(Boolean)
      .join(", ");

    const gen = buildElevenLabsPrompt(cue, fps, profile, allFeedback || undefined);
    onDraft(gen);
  };

  const handleCopy = () => {
    onCopy(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{ padding: "0 8px 8px", borderTop: "1px solid #2a2a2a" }}>
      {/* SFX description context */}
      {cue.sfxDescription && (
        <div style={{ fontSize: 10, color: "#666", padding: "6px 0 4px", fontStyle: "italic" }}>
          {cue.sfxDescription}
        </div>
      )}

      {/* Prompt textarea */}
      <textarea
        value={prompt}
        onChange={(e) => onDraft(e.target.value)}
        rows={4}
        style={{
          width: "100%", background: "#222",
          border: isDraft ? "1px solid #0ea5e9" : "1px solid #383838",
          borderRadius: 3, color: "#ddd", fontSize: 10,
          fontFamily: "monospace", padding: "6px",
          boxSizing: "border-box", resize: "vertical",
          lineHeight: 1.5,
        }}
        placeholder="ElevenLabs prompt..."
      />

      {/* Quick adjustment tags */}
      <div style={{ marginTop: 6, marginBottom: 2 }}>
        <div style={{ fontSize: 9, color: "#666", marginBottom: 4, fontWeight: 500 }}>
          Quick adjustments:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {FEEDBACK_PRESETS.map((p) => {
            const active = activeTags.has(p.id);
            return (
              <button
                key={p.id}
                onClick={() => toggleTag(p.id)}
                title={p.modifier}
                style={{
                  height: 20, fontSize: 9, padding: "0 6px",
                  borderRadius: 10, cursor: "pointer", fontWeight: 500,
                  border: active ? "1px solid #f59e0b" : "1px solid #333",
                  background: active ? "#451a0340" : "#1a1a1a",
                  color: active ? "#fbbf24" : "#777",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom feedback input */}
      <div style={{ marginTop: 4, marginBottom: 6 }}>
        <input
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Custom feedback: e.g. &quot;needs more shimmer&quot;, &quot;too metallic&quot;..."
          style={{
            width: "100%", height: 24, background: "#1e1e1e",
            border: "1px solid #333", borderRadius: 3,
            color: "#ccc", fontSize: 10, padding: "0 6px",
            boxSizing: "border-box",
          }}
          onKeyDown={(e) => { if (e.key === "Enter") handleRegenerate(); }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 4 }}>
        <button
          onClick={handleCopy}
          style={{
            ...smallBtn,
            background: copied ? "#065f46" : "#14532d",
            borderColor: "#22c55e",
            color: "#4ade80",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <button onClick={handleRegenerate} style={{ ...smallBtn, background: "#1e293b", borderColor: "#334155", color: "#94a3b8" }}>
          Regenerate
        </button>
        {isDraft && (
          <button
            onClick={() => onSave(prompt)}
            style={{ ...smallBtn, background: "#1e3a5f", borderColor: "#0070f3", color: "#60a5fa" }}
          >
            Save
          </button>
        )}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, color: "#444", alignSelf: "center" }}>
          {cue.intensity} · {(cue.duration / fps).toFixed(1)}s
        </span>
      </div>
    </div>
  );
};

// ─── Panel ───────────────────────────────────────────────────────────────────

export const SfxPromptPanel: React.FC = () => {
  const { activeCompId, frame, cues: cuesMap, setCues } = useStudio();
  const comp = getComp(activeCompId);

  const fps       = comp?.fps ?? 30;
  const profile   = (comp as { profile?: string })?.profile;
  const sequences = (comp as { sequences?: { id: string; label: string; from: number; durationInFrames: number }[] })?.sequences ?? [];
  const cues      = cuesMap[activeCompId] ?? [];

  const currentScene = useMemo(() => getCurrentScene(sequences, frame), [sequences, frame]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [drafts, setDrafts]         = useState<Record<string, string>>({});

  const sorted = useMemo(() => [...cues].sort((a, b) => a.frame - b.frame), [cues]);

  const sceneCues = useMemo(() => {
    if (!currentScene) return sorted;
    return sorted.filter(
      (c) => c.frame >= currentScene.from && c.frame < currentScene.from + currentScene.durationInFrames,
    );
  }, [sorted, currentScene]);

  const [sceneOnly, setSceneOnly] = useState(false);
  const displayCues = sceneOnly ? sceneCues : sorted;

  const getPrompt = useCallback((cue: CueEvent) => {
    if (drafts[cue.id] !== undefined) return drafts[cue.id];
    return cue.elevenLabsPrompt || buildElevenLabsPrompt(cue, fps, profile);
  }, [drafts, fps, profile]);

  const handleSavePrompt = useCallback(async (cueId: string, prompt: string) => {
    const next = cues.map((c) =>
      c.id === cueId ? { ...c, elevenLabsPrompt: prompt } : c,
    );
    setCues(activeCompId, next);
    setDrafts((d) => { const n = { ...d }; delete n[cueId]; return n; });
    try { await saveCues(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, cues, setCues]);

  const handleGenerateAll = useCallback(async () => {
    const next = cues.map((c) => ({
      ...c,
      elevenLabsPrompt: buildElevenLabsPrompt(c, fps, profile),
    }));
    setCues(activeCompId, next);
    setDrafts({});
    try { await saveCues(activeCompId, next); } catch { /* offline */ }
  }, [activeCompId, cues, fps, profile, setCues]);

  if (!comp) {
    return (
      <div style={{ padding: 16, color: "#555", fontSize: 12 }}>
        Select a composition to generate SFX prompts.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontSize: 11 }}>
      {/* Header */}
      <div style={{
        padding: "10px 12px 8px",
        borderBottom: "1px solid #2a2a2a",
        flexShrink: 0,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: "#0ea5e9",
          letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6,
        }}>
          SFX Prompt Generator
        </div>

        {/* Scene context */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
          <span style={{ color: "#888", fontSize: 10 }}>Scene:</span>
          <span style={{ color: "#ddd", fontWeight: 500 }}>
            {currentScene ? currentScene.label : "—"}
          </span>
          <span style={{ color: "#555", fontSize: 10, marginLeft: "auto" }}>
            f{frame} ({(frame / fps).toFixed(2)}s)
          </span>
        </div>

        {/* Profile + cue count */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <span style={{ color: "#888", fontSize: 10 }}>Profile:</span>
          <span style={{
            fontSize: 9, padding: "1px 6px", borderRadius: 3,
            background: "#1e293b", border: "1px solid #334155", color: "#94a3b8",
          }}>
            {profile ?? "default"}
          </span>
          <span style={{ marginLeft: "auto", fontSize: 9, color: "#555" }}>
            {displayCues.length} / {cues.length} cues
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={handleGenerateAll} style={actionBtn}>
            Generate All
          </button>
          <button
            onClick={() => setSceneOnly(!sceneOnly)}
            style={{ ...actionBtn, background: "#1e1e1e", borderColor: "#444", color: "#888" }}
          >
            {sceneOnly ? "Show All" : "Scene Only"}
          </button>
        </div>
      </div>

      {/* Cue list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {displayCues.length === 0 && (
          <div style={{ padding: "20px 12px", color: "#555", textAlign: "center" }}>
            {cues.length === 0
              ? "No cues for this composition. Generate a cue list first."
              : "No cues in the current scene. Click \"Show All\" to see all."}
          </div>
        )}

        {displayCues.map((cue) => {
          const color = CUE_COLORS[cue.type] ?? "#888";
          const expanded = expandedId === cue.id;
          const prompt = getPrompt(cue);
          const isDraft = drafts[cue.id] !== undefined;
          const isNearPlayhead = Math.abs(cue.frame - frame) < 15;

          return (
            <div
              key={cue.id}
              style={{
                margin: "2px 6px",
                borderRadius: 4,
                border: `1px solid ${isNearPlayhead ? `${color}66` : "#2a2a2a"}`,
                background: isNearPlayhead ? `${color}0a` : "#1a1a1a",
                overflow: "hidden",
              }}
            >
              {/* Cue header row */}
              <div
                onClick={() => setExpandedId(expanded ? null : cue.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 8px", cursor: "pointer",
                }}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: 2,
                  background: color, flexShrink: 0,
                }} />
                <span style={{ color: "#aaa", fontSize: 9, fontFamily: "monospace", flexShrink: 0 }}>
                  f{cue.frame}
                </span>
                <span style={{
                  color: "#ddd", fontSize: 11, fontWeight: 500,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  flex: 1,
                }}>
                  {cue.label}
                </span>
                <span style={{
                  fontSize: 8, color, fontWeight: 600,
                  letterSpacing: "0.04em", flexShrink: 0,
                }}>
                  {cue.type.replace(/_/g, " ")}
                </span>
                <span style={{ color: "#555", fontSize: 10 }}>
                  {expanded ? "▾" : "▸"}
                </span>
              </div>

              {/* Expanded: prompt editor with feedback */}
              {expanded && (
                <CuePromptEditor
                  cue={cue}
                  fps={fps}
                  profile={profile}
                  prompt={prompt}
                  isDraft={isDraft}
                  onDraft={(text) => setDrafts((d) => ({ ...d, [cue.id]: text }))}
                  onSave={(text) => handleSavePrompt(cue.id, text)}
                  onCopy={copyText}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Shared styles ───────────────────────────────────────────────────────────

const actionBtn: React.CSSProperties = {
  flex: 1, height: 26, background: "#0c2d48",
  border: "1px solid #0ea5e9", borderRadius: 4,
  color: "#7dd3fc", fontSize: 10, fontWeight: 600,
  cursor: "pointer", letterSpacing: "0.03em",
};

const smallBtn: React.CSSProperties = {
  height: 22, border: "1px solid", borderRadius: 3,
  fontSize: 9, padding: "0 8px", cursor: "pointer",
  fontWeight: 500,
};
