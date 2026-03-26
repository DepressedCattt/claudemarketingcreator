/**
 * AssetPreviewPanel — modal for browsing SVG assets and AI-generated
 * reference images used during the Art Director workflow.
 *
 * Views:  SVG  |  Reference  |  Compare (side-by-side)
 *
 * Assets are discovered from  public/svg/<comp>/       (SVGs)
 *                              public/svg/<comp>/ref/   (reference images)
 */
import React, { useState, useEffect, useCallback } from "react";
import { listAssets, previewSvg } from "../api";
import type { AssetFolder, AssetFileEntry, SvgPreviewResult } from "../api";

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:      "#111113",
  panel:   "#18181b",
  border:  "#2a2a2e",
  text:    "#e4e4e7",
  muted:   "#71717a",
  accent:  "#10b981",
  accentDim: "#065f46",
  inputBg: "#09090b",
  hover:   "#1e1e22",
  selected: "#0d2818",
  selectedBorder: "#16a34a",
};

type ViewMode = "svg" | "reference" | "compare" | "rendered";

// ─── Shared primitives ──────────────────────────────────────────────────────

const Btn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
> = ({ active, style, children, ...rest }) => (
  <button
    style={{
      height: 28,
      padding: "0 12px",
      borderRadius: 5,
      border: active ? `1px solid ${C.accent}` : `1px solid ${C.border}`,
      background: active ? C.accentDim : "#222",
      color: active ? "#a7f3d0" : C.muted,
      fontSize: 11,
      fontWeight: active ? 600 : 400,
      cursor: rest.disabled ? "not-allowed" : "pointer",
      opacity: rest.disabled ? 0.4 : 1,
      transition: "all 0.12s",
      ...style,
    }}
    {...rest}
  >
    {children}
  </button>
);

const checkerBg = `repeating-conic-gradient(#1a1a1a 0% 25%, #141414 0% 50%) 0 0 / 24px 24px`;

// ─── File tree sidebar ──────────────────────────────────────────────────────

const FileTree: React.FC<{
  folders: AssetFolder[];
  selected: AssetFileEntry | null;
  onSelect: (entry: AssetFileEntry, type: "svg" | "reference") => void;
}> = ({ folders, selected, onSelect }) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    folders.forEach((f) => (init[f.comp] = true));
    return init;
  });

  const toggle = (comp: string) =>
    setExpanded((prev) => ({ ...prev, [comp]: !prev[comp] }));

  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: `1px solid ${C.border}`,
        overflowY: "auto",
        padding: "10px 0",
      }}
    >
      {folders.length === 0 && (
        <div style={{ padding: "20px 14px", fontSize: 12, color: C.muted, textAlign: "center" }}>
          No assets found.
          <br />
          <span style={{ fontSize: 11, color: "#444" }}>
            Place SVGs in public/svg/&lt;comp&gt;/
          </span>
        </div>
      )}
      {folders.map((folder) => (
        <div key={folder.comp}>
          <div
            onClick={() => toggle(folder.comp)}
            style={{
              padding: "6px 14px",
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              userSelect: "none",
            }}
          >
            <span style={{ fontSize: 10, opacity: 0.5, transition: "transform 0.15s", transform: expanded[folder.comp] ? "rotate(90deg)" : "rotate(0deg)" }}>
              ▶
            </span>
            {folder.comp}
            <span style={{ fontSize: 10, color: C.muted, marginLeft: "auto" }}>
              {folder.svgs.length + folder.references.length}
            </span>
          </div>

          {expanded[folder.comp] && (
            <div style={{ paddingLeft: 12 }}>
              {folder.svgs.length > 0 && (
                <div style={{ padding: "4px 14px 2px", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  SVG
                </div>
              )}
              {folder.svgs.map((f) => (
                <FileRow
                  key={f.path}
                  entry={f}
                  icon="◆"
                  isSelected={selected?.path === f.path}
                  onClick={() => onSelect(f, "svg")}
                />
              ))}

              {folder.references.length > 0 && (
                <div style={{ padding: "8px 14px 2px", fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Reference
                </div>
              )}
              {folder.references.map((f) => (
                <FileRow
                  key={f.path}
                  entry={f}
                  icon="◇"
                  isSelected={selected?.path === f.path}
                  onClick={() => onSelect(f, "reference")}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const FileRow: React.FC<{
  entry: AssetFileEntry;
  icon: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ entry, icon, isSelected, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: "5px 14px",
      fontSize: 11,
      color: isSelected ? "#a7f3d0" : "#aaa",
      background: isSelected ? C.selected : "transparent",
      borderLeft: isSelected ? `2px solid ${C.selectedBorder}` : "2px solid transparent",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      transition: "all 0.1s",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }}
    onMouseEnter={(e) => {
      if (!isSelected) e.currentTarget.style.background = C.hover;
    }}
    onMouseLeave={(e) => {
      if (!isSelected) e.currentTarget.style.background = "transparent";
    }}
  >
    <span style={{ fontSize: 9, opacity: 0.6 }}>{icon}</span>
    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{entry.name}</span>
    <span style={{ fontSize: 9, color: "#444", marginLeft: "auto", flexShrink: 0 }}>
      {entry.sizeHuman}
    </span>
  </div>
);

// ─── Preview pane ───────────────────────────────────────────────────────────

const PreviewImage: React.FC<{ src: string; zoom: number; label: string }> = ({
  src,
  zoom,
  label,
}) => (
  <div
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflow: "auto",
      background: checkerBg,
      position: "relative",
      minWidth: 0,
    }}
  >
    <div style={{ position: "absolute", top: 8, left: 12, fontSize: 10, color: "#555", zIndex: 1, pointerEvents: "none" }}>
      {label}
    </div>
    <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
      <img
        src={src}
        alt={label}
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          width: `${zoom * 100}%`,
          objectFit: "contain",
          imageRendering: zoom > 2 ? "pixelated" : "auto",
          transition: "width 0.15s",
        }}
        draggable={false}
      />
    </div>
  </div>
);

const EmptyPreview: React.FC = () => (
  <div
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#333",
      fontSize: 13,
      background: C.inputBg,
    }}
  >
    Select a file to preview
  </div>
);

// ─── Main panel ─────────────────────────────────────────────────────────────

export const AssetPreviewPanel: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [folders, setFolders] = useState<AssetFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<AssetFileEntry | null>(null);
  const [selectedType, setSelectedType] = useState<"svg" | "reference">("svg");
  const [view, setView] = useState<ViewMode>("svg");
  const [zoom, setZoom] = useState(1);

  const [companionSvg, setCompanionSvg] = useState<AssetFileEntry | null>(null);
  const [companionRef, setCompanionRef] = useState<AssetFileEntry | null>(null);

  const [rendered, setRendered] = useState<SvgPreviewResult | null>(null);
  const [rendering, setRendering] = useState(false);
  const [renderErr, setRenderErr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listAssets();
      setFolders(data);

      if (!selected && data.length > 0) {
        const first = data[0];
        if (first.svgs.length > 0) {
          setSelected(first.svgs[0]);
          setSelectedType("svg");
        } else if (first.references.length > 0) {
          setSelected(first.references[0]);
          setSelectedType("reference");
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [selected]);

  useEffect(() => { refresh(); }, []);

  const handleSelect = useCallback(
    (entry: AssetFileEntry, type: "svg" | "reference") => {
      setSelected(entry);
      setSelectedType(type);
      setView(type);
      setZoom(1);

      const folder = folders.find((f) =>
        [...f.svgs, ...f.references].some((e) => e.path === entry.path)
      );
      if (folder) {
        setCompanionSvg(folder.svgs[0] ?? null);
        setCompanionRef(folder.references[0] ?? null);
      }
    },
    [folders],
  );

  const handleRender = useCallback(async () => {
    const svgEntry = companionSvg ?? (selectedType === "svg" ? selected : null);
    if (!svgEntry) return;
    setRendering(true);
    setRenderErr(null);
    try {
      const r = await fetch(svgEntry.path);
      if (!r.ok) throw new Error(`Failed to fetch SVG: ${r.status}`);
      const svgText = await r.text();
      const result = await previewSvg(svgText, 1200);
      setRendered(result);
      setView("rendered");
    } catch (e) {
      setRenderErr(e instanceof Error ? e.message : String(e));
    } finally {
      setRendering(false);
    }
  }, [companionSvg, selected, selectedType]);

  const canCompare = companionSvg && companionRef;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 960,
          maxWidth: "95vw",
          height: "82vh",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px #000a",
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 15 }}>🎨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
              Asset Preview
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
              SVG assets and AI reference images
            </div>
          </div>

          {/* View mode tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            <Btn active={view === "svg"} onClick={() => setView("svg")}>
              SVG
            </Btn>
            <Btn
              active={view === "reference"}
              onClick={() => setView("reference")}
            >
              Reference
            </Btn>
            <Btn
              active={view === "compare"}
              onClick={() => setView("compare")}
              disabled={!canCompare}
            >
              Compare
            </Btn>
            <Btn
              active={view === "rendered"}
              onClick={() => setView("rendered")}
              disabled={!rendered}
            >
              Rendered
            </Btn>
          </div>

          {/* Server-side render trigger */}
          <Btn
            onClick={handleRender}
            disabled={rendering || !(companionSvg ?? (selectedType === "svg" ? selected : null))}
            style={{
              marginLeft: 4,
              background: rendering ? "#1a1a2e" : "#1a2040",
              border: `1px solid ${rendering ? "#334" : "#3b82f6"}`,
              color: rendering ? "#666" : "#93c5fd",
            }}
          >
            {rendering ? "Rendering..." : "Render PNG"}
          </Btn>

          {/* Zoom controls */}
          <div
            style={{
              display: "flex",
              gap: 2,
              marginLeft: 8,
              alignItems: "center",
            }}
          >
            <Btn
              onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
              style={{ padding: "0 8px", fontSize: 14, fontWeight: 700 }}
            >
              -
            </Btn>
            <span
              style={{
                fontSize: 11,
                color: C.muted,
                width: 44,
                textAlign: "center",
                fontFamily: "monospace",
              }}
            >
              {Math.round(zoom * 100)}%
            </span>
            <Btn
              onClick={() => setZoom((z) => Math.min(4, z + 0.25))}
              style={{ padding: "0 8px", fontSize: 14, fontWeight: 700 }}
            >
              +
            </Btn>
            <Btn onClick={() => setZoom(1)} style={{ marginLeft: 4 }}>
              Fit
            </Btn>
          </div>

          {/* Refresh */}
          <Btn onClick={refresh} style={{ marginLeft: 4 }}>
            ↻
          </Btn>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "#555",
              fontSize: 18,
              cursor: "pointer",
              padding: "2px 6px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Sidebar */}
          <FileTree
            folders={folders}
            selected={selected}
            onSelect={handleSelect}
          />

          {/* Preview area */}
          {loading ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: C.muted,
                fontSize: 13,
              }}
            >
              Loading assets...
            </div>
          ) : error ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: 24,
              }}
            >
              <div style={{ fontSize: 13, color: "#dc2626", fontWeight: 600 }}>
                Failed to load assets
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: C.muted,
                  fontFamily: "monospace",
                }}
              >
                {error}
              </div>
              <Btn onClick={refresh} style={{ marginTop: 8 }}>
                Retry
              </Btn>
            </div>
          ) : view === "rendered" && rendered ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                overflow: "auto",
                background: checkerBg,
                position: "relative",
                minWidth: 0,
              }}
            >
              <div style={{ position: "absolute", top: 8, left: 12, fontSize: 10, color: "#555", zIndex: 1, pointerEvents: "none" }}>
                SERVER-RENDERED PNG ({rendered.width}×{rendered.height})
              </div>
              <div style={{ padding: 32, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100%" }}>
                <img
                  src={rendered.dataUrl}
                  alt="Rendered PNG"
                  style={{
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: `${zoom * 100}%`,
                    objectFit: "contain",
                    imageRendering: zoom > 2 ? "pixelated" : "auto",
                    transition: "width 0.15s",
                  }}
                  draggable={false}
                />
              </div>
              {renderErr && (
                <div style={{ position: "absolute", bottom: 12, left: 12, right: 12, padding: "8px 12px", background: "#2d1111", border: "1px solid #dc2626", borderRadius: 6, fontSize: 11, color: "#fca5a5" }}>
                  {renderErr}
                </div>
              )}
            </div>
          ) : view === "compare" && canCompare ? (
            <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
              <PreviewImage
                src={companionRef!.path}
                zoom={zoom}
                label="REFERENCE"
              />
              <div
                style={{
                  width: 2,
                  background: C.accent,
                  flexShrink: 0,
                  opacity: 0.5,
                }}
              />
              <PreviewImage
                src={companionSvg!.path}
                zoom={zoom}
                label="SVG"
              />
            </div>
          ) : view === "reference" ? (
            companionRef ? (
              <PreviewImage
                src={companionRef.path}
                zoom={zoom}
                label="REFERENCE"
              />
            ) : (
              <EmptyPreview />
            )
          ) : selected ? (
            <PreviewImage
              src={
                selectedType === "svg"
                  ? selected.path
                  : companionSvg
                    ? companionSvg.path
                    : selected.path
              }
              zoom={zoom}
              label="SVG"
            />
          ) : (
            <EmptyPreview />
          )}
        </div>

        {/* Render error toast (visible on any tab) */}
        {renderErr && view !== "rendered" && (
          <div
            style={{
              padding: "6px 18px",
              background: "#2d1111",
              borderTop: "1px solid #dc2626",
              fontSize: 11,
              color: "#fca5a5",
            }}
          >
            Render failed: {renderErr}
          </div>
        )}

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div
          style={{
            padding: "8px 18px",
            borderTop: `1px solid ${C.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {selected && (
            <>
              <span
                style={{ fontSize: 11, color: C.muted, fontFamily: "monospace" }}
              >
                {selected.path}
              </span>
              <span style={{ fontSize: 11, color: "#333" }}>·</span>
              <span style={{ fontSize: 11, color: "#444" }}>
                {selected.sizeHuman}
              </span>
              <span style={{ fontSize: 11, color: "#333" }}>·</span>
              <span style={{ fontSize: 11, color: "#444" }}>
                {new Date(selected.modified).toLocaleString()}
              </span>
            </>
          )}
          <div style={{ flex: 1 }} />
          <div
            style={{
              background: "#0d1f14",
              border: `1px solid ${C.accentDim}`,
              borderRadius: 6,
              padding: "5px 10px",
              fontSize: 10,
              color: "#6ee7b7",
              lineHeight: 1.5,
            }}
          >
            Ref images → <code style={{ background: "#06332a", padding: "0 4px", borderRadius: 2, fontSize: 10 }}>public/svg/&lt;comp&gt;/ref/</code>
          </div>
        </div>
      </div>
    </div>
  );
};
