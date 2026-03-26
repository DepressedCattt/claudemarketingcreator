import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  listSfx, rateSfx, setDefaultSfx, deleteSfx, generateSfx,
  type SfxEntry, type SfxLibrary,
} from "../api";

const CATEGORIES = [
  "SCENE_CUT", "TEXT_REVEAL", "TEXT_IMPACT", "HERO_ENTRY",
  "OBJECT_LAND", "WIPE", "STAT_BUILD", "CTA_REVEAL", "AMBIENT", "BEAT_LOCK",
] as const;

const INTENSITIES = ["hard", "medium", "soft"] as const;

const CAT_COLORS: Record<string, string> = {
  SCENE_CUT:  "#ef4444",
  TEXT_REVEAL: "#8b5cf6",
  TEXT_IMPACT: "#f97316",
  HERO_ENTRY:  "#0ea5e9",
  OBJECT_LAND: "#10b981",
  WIPE:        "#ec4899",
  STAT_BUILD:  "#eab308",
  CTA_REVEAL:  "#06b6d4",
  AMBIENT:     "#6366f1",
  BEAT_LOCK:   "#a855f7",
};

const INT_COLORS: Record<string, string> = {
  hard:   "#ef4444",
  medium: "#f59e0b",
  soft:   "#6ee7b7",
};

// ── Star rating ──────────────────────────────────────────────────────────────
const Stars: React.FC<{ rating: number; onChange: (r: number) => void }> = ({
  rating, onChange,
}) => (
  <div style={{ display: "flex", gap: 1 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        onClick={() => onChange(n === rating ? 0 : n)}
        style={{
          background: "transparent",
          border: "none",
          color: n <= rating ? "#eab308" : "#333",
          fontSize: 12,
          cursor: "pointer",
          padding: 0,
          lineHeight: 1,
        }}
      >
        ★
      </button>
    ))}
  </div>
);

// ── Entry row ────────────────────────────────────────────────────────────────
const EntryRow: React.FC<{
  entry: SfxEntry;
  onRate: (id: string, r: number) => void;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ entry, onRate, onSetDefault, onDelete }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) {
      const url = `/api/sfx-audio/${entry.file}`;
      audioRef.current = new Audio(url);
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }
    if (playing) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const catColor = CAT_COLORS[entry.category] ?? "#888";
  const intColor = INT_COLORS[entry.intensity] ?? "#888";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "5px 8px",
      borderRadius: 4,
      background: entry.default ? "#1a2f1a" : "#181818",
      border: `1px solid ${entry.default ? "#22c55e33" : "#262626"}`,
      marginBottom: 2,
    }}>
      {/* Play button */}
      <button
        onClick={togglePlay}
        style={{
          width: 24, height: 24, borderRadius: 12,
          background: playing ? "#ef4444" : "#222",
          border: `1px solid ${playing ? "#ef4444" : "#444"}`,
          color: "#fff", fontSize: 10, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {playing ? "■" : "▶"}
      </button>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
          <span style={{
            fontSize: 8, fontWeight: 700, color: catColor,
            background: `${catColor}18`, border: `1px solid ${catColor}33`,
            borderRadius: 3, padding: "1px 4px", letterSpacing: "0.05em",
          }}>
            {entry.category}
          </span>
          <span style={{
            fontSize: 8, fontWeight: 600, color: intColor,
            background: `${intColor}18`, border: `1px solid ${intColor}33`,
            borderRadius: 3, padding: "1px 4px",
          }}>
            {entry.intensity}
          </span>
          {entry.default && (
            <span style={{
              fontSize: 8, fontWeight: 700, color: "#22c55e",
              letterSpacing: "0.05em",
            }}>
              DEFAULT
            </span>
          )}
        </div>
        <div style={{
          fontSize: 10, color: "#999", fontFamily: "monospace",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {entry.id}
        </div>
      </div>

      {/* Rating */}
      <Stars rating={entry.rating} onChange={(r) => onRate(entry.id, r)} />

      {/* Set default */}
      {!entry.default && (
        <button
          onClick={() => onSetDefault(entry.id)}
          title="Set as default for this category"
          style={{
            background: "#1e3a5f", border: "1px solid #0070f3",
            borderRadius: 3, color: "#60a5fa", fontSize: 9,
            padding: "2px 5px", cursor: "pointer", flexShrink: 0,
          }}
        >
          Use
        </button>
      )}

      {/* Delete */}
      <button
        onClick={() => onDelete(entry.id)}
        style={{
          background: "transparent", border: "none", color: "#555",
          fontSize: 12, padding: "2px", cursor: "pointer", lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
};

// ── Generate panel ──────────────────────────────────────────────────────────
const GenerateForm: React.FC<{ onGenerated: () => void }> = ({ onGenerated }) => {
  const [type, setType] = useState<string>("SCENE_CUT");
  const [intensity, setIntensity] = useState<string>("medium");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setStatus("Generating...");
    try {
      const res = await generateSfx(type, intensity, prompt || undefined);
      setStatus(res.id ? `Generated: ${res.id}` : "Generated successfully");
      onGenerated();
    } catch (e) {
      setStatus(`Error: ${e instanceof Error ? e.message : "Unknown"}`);
    }
    setLoading(false);
  };

  return (
    <div style={{
      padding: 8,
      borderBottom: "1px solid #2a2a2a",
    }}>
      <div style={{ fontSize: 10, color: "#888", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Generate SFX
      </div>
      <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{
            flex: 1, background: "#222", border: "1px solid #333",
            borderRadius: 3, color: "#ccc", fontSize: 10, padding: "3px 4px",
          }}
        >
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={intensity}
          onChange={(e) => setIntensity(e.target.value)}
          style={{
            width: 70, background: "#222", border: "1px solid #333",
            borderRadius: 3, color: "#ccc", fontSize: 10, padding: "3px 4px",
          }}
        >
          {INTENSITIES.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>
      <div style={{ display: "flex", gap: 4 }}>
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Custom prompt (optional)"
          style={{
            flex: 1, background: "#222", border: "1px solid #333",
            borderRadius: 3, color: "#ccc", fontSize: 10, padding: "4px 6px",
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          style={{
            background: loading ? "#333" : "#0070f3",
            border: "none", borderRadius: 3,
            color: "#fff", fontSize: 10, fontWeight: 600,
            padding: "4px 10px", cursor: loading ? "wait" : "pointer",
            flexShrink: 0,
          }}
        >
          {loading ? "..." : "Generate"}
        </button>
      </div>
      {status && (
        <div style={{
          marginTop: 4, fontSize: 10, padding: "3px 6px",
          borderRadius: 3,
          background: status.startsWith("Error") ? "#450a0a" : "#064e3b",
          color: status.startsWith("Error") ? "#fca5a5" : "#6ee7b7",
        }}>
          {status}
        </div>
      )}
    </div>
  );
};

// ── Main panel ──────────────────────────────────────────────────────────────
export const SFXLibraryPanel: React.FC = () => {
  const [lib, setLib] = useState<SfxLibrary | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await listSfx();
      setLib(data);
    } catch { /* offline */ }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRate = async (id: string, rating: number) => {
    try {
      await rateSfx(id, rating);
      refresh();
    } catch { /* */ }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultSfx(id);
      refresh();
    } catch { /* */ }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSfx(id);
      refresh();
    } catch { /* */ }
  };

  if (loading) {
    return <div style={{ padding: 16, color: "#555", fontSize: 11 }}>Loading SFX library...</div>;
  }

  const entries = lib?.entries ?? [];
  const filtered = filter === "all"
    ? entries
    : entries.filter((e) => e.category === filter);

  const grouped: Record<string, SfxEntry[]> = {};
  for (const e of filtered) {
    const key = `${e.category}:${e.intensity}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(e);
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      background: "#161616", overflow: "hidden",
    }}>
      <GenerateForm onGenerated={refresh} />

      {/* Filter bar */}
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 3,
        padding: "6px 8px", borderBottom: "1px solid #2a2a2a",
      }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            background: filter === "all" ? "#333" : "transparent",
            border: `1px solid ${filter === "all" ? "#555" : "#2a2a2a"}`,
            borderRadius: 3, color: filter === "all" ? "#fff" : "#666",
            fontSize: 9, padding: "2px 6px", cursor: "pointer",
          }}
        >
          ALL ({entries.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = entries.filter((e) => e.category === cat).length;
          if (count === 0 && filter !== cat) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat === filter ? "all" : cat)}
              style={{
                background: filter === cat ? `${CAT_COLORS[cat]}22` : "transparent",
                border: `1px solid ${filter === cat ? CAT_COLORS[cat] : "#2a2a2a"}`,
                borderRadius: 3,
                color: filter === cat ? CAT_COLORS[cat] : "#555",
                fontSize: 9, padding: "2px 5px", cursor: "pointer",
              }}
            >
              {cat.replace("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {/* Entry list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px 8px" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center", color: "#444", fontSize: 11 }}>
            {entries.length === 0
              ? "Library empty — generate some SFX above or run: npm run sfx:batch"
              : `No entries for ${filter}`
            }
          </div>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, items]) => (
              <div key={key} style={{ marginBottom: 4 }}>
                {items.map((e) => (
                  <EntryRow
                    key={e.id}
                    entry={e}
                    onRate={handleRate}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ))
        )}
      </div>
    </div>
  );
};
