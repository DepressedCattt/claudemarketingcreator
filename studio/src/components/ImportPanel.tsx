/**
 * ImportPanel -- modal for importing After Effects animation templates.
 *
 * Supports three import methods:
 *   1. Lottie JSON (.json from Bodymovin) -- basic extraction (~40-60% data)
 *   2. AE Raw Extract (.ae-extract.json) -- comprehensive extraction (~90-95% data)
 *   3. AE Project (.aep) -- launches After Effects to extract (requires AE installed)
 *
 * All methods produce the same L1-L5 parameter manifest for downstream use.
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  extractParams,
  extractAeParams,
  generateComposition,
  listExtracted,
  getExtractedManifest,
  getAnalysisStatus,
} from "../api";
import type {
  ExtractedFile,
  ExtractedManifest,
  ExtractionResult,
  GenerationResult,
  AeExtractionResult,
} from "../api";

const C = {
  bg:      "#111113",
  panel:   "#18181b",
  border:  "#2a2a2e",
  text:    "#e4e4e7",
  muted:   "#71717a",
  accent:  "#059669",
  blue:    "#0070f3",
  amber:   "#d97706",
  red:     "#dc2626",
  inputBg: "#09090b",
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
    {children}
  </div>
);

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { accent?: boolean }> = ({
  accent, style, children, ...rest
}) => (
  <button
    style={{
      height: 32, padding: "0 14px", borderRadius: 6,
      background: accent ? C.accent : "#27272a",
      border: accent ? "none" : `1px solid ${C.border}`,
      color: accent ? "#fff" : C.text,
      fontSize: 12, fontWeight: accent ? 600 : 400,
      cursor: rest.disabled ? "not-allowed" : "pointer",
      opacity: rest.disabled ? 0.45 : 1,
      transition: "opacity 0.12s",
      display: "flex", alignItems: "center", gap: 6,
      ...style,
    }}
    onMouseEnter={(e) => { if (!rest.disabled) (e.currentTarget as HTMLElement).style.opacity = "0.8"; }}
    onMouseLeave={(e) => { if (!rest.disabled) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
    {...rest}
  >
    {children}
  </button>
);

type FileType = "lottie" | "ae-raw" | "aep";

function classifyFile(f: File): FileType | null {
  const name = f.name.toLowerCase();
  if (name.endsWith(".ae-extract.json")) return "ae-raw";
  if (name.endsWith(".json")) return "lottie";
  if (name.endsWith(".aep") || name.endsWith(".aepx")) return "aep";
  return null;
}

interface Props { onClose: () => void }

export const ImportPanel: React.FC<Props> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<FileType | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manifest, setManifest] = useState<ExtractedManifest | null>(null);
  const [genResult, setGenResult] = useState<GenerationResult | null>(null);
  const [existingFiles, setExistingFiles] = useState<ExtractedFile[]>([]);
  const [selectedExisting, setSelectedExisting] = useState<string | null>(null);
  const [aeJobId, setAeJobId] = useState<string | null>(null);
  const [aeJobStatus, setAeJobStatus] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    listExtracted().then(setExistingFiles).catch(() => {});
  }, [manifest]);

  // Poll AE extraction job status
  useEffect(() => {
    if (!aeJobId) return;
    const interval = setInterval(async () => {
      try {
        const status = await getAnalysisStatus(aeJobId);
        setAeJobStatus(status.stage || "processing...");
        if (status.done) {
          clearInterval(interval);
          setExtracting(false);
          if (status.failed) {
            setError(status.errorMsg || "After Effects extraction failed");
            setAeJobId(null);
          } else {
            const tName = templateName || file?.name.replace(/\.(aep|aepx)$/i, "") || "ae-template";
            try {
              const m = await getExtractedManifest(tName);
              setManifest(m);
            } catch {
              setError("Extraction completed but could not load manifest. Check the extracted/ folder.");
            }
            setAeJobId(null);
          }
        }
      } catch {
        // Network error, keep polling
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [aeJobId, templateName, file]);

  const handleFile = useCallback((f: File) => {
    const type = classifyFile(f);
    if (!type) {
      setError("Accepted: .json (Lottie), .ae-extract.json (AE raw), .aep/.aepx (AE project)");
      return;
    }
    setFile(f);
    setFileType(type);
    setError(null);
    setManifest(null);
    setGenResult(null);
    setAeJobId(null);
    if (!templateName) {
      const baseName = f.name.replace(/\.(ae-extract\.json|json|aep|aepx)$/i, "");
      setTemplateName(baseName);
    }
  }, [templateName]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleExtract = async () => {
    if (!file || !fileType) return;
    setExtracting(true); setError(null);
    try {
      if (fileType === "lottie") {
        const result: ExtractionResult = await extractParams(file, templateName);
        setManifest(result.manifest);
        setExtracting(false);
      } else {
        const result: AeExtractionResult = await extractAeParams(file, templateName);
        if (result.manifest) {
          setManifest(result.manifest);
          setExtracting(false);
        } else if (result.started && result.jobId) {
          setAeJobId(result.jobId);
          setAeJobStatus("launching After Effects...");
        } else {
          setError("Unexpected response from server");
          setExtracting(false);
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Extraction failed");
      setExtracting(false);
    }
  };

  const handleSelectExisting = async (name: string) => {
    setSelectedExisting(name);
    setError(null);
    try {
      const tName = name.replace(".params.json", "");
      const m = await getExtractedManifest(tName);
      setManifest(m);
      setTemplateName(tName);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load manifest");
    }
  };

  const handleGenerate = async () => {
    if (!manifest) return;
    setGenerating(true); setError(null);
    try {
      const result = await generateComposition(manifest.templateName);
      setGenResult(result);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
    setGenerating(false);
  };

  const handleReset = () => {
    setManifest(null);
    setFile(null);
    setFileType(null);
    setGenResult(null);
    setTemplateName("");
    setAeJobId(null);
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: C.bg, border: `1px solid ${C.border}`, borderRadius: 12,
        width: 660, maxHeight: "85vh", overflow: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>&#x1F4E5;</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>Import AE Template</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 18, lineHeight: 1 }}
          >
            x
          </button>
        </div>

        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Existing extractions */}
          {existingFiles.length > 0 && !manifest && (
            <div>
              <Label>Previously Extracted</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {existingFiles.map((ef) => (
                  <button
                    key={ef.name}
                    onClick={() => handleSelectExisting(ef.name)}
                    style={{
                      padding: "4px 10px", borderRadius: 4, fontSize: 11,
                      background: selectedExisting === ef.name ? C.accent : "#27272a",
                      border: `1px solid ${selectedExisting === ef.name ? C.accent : C.border}`,
                      color: C.text, cursor: "pointer",
                    }}
                  >
                    {ef.meta?.templateName || ef.name.replace(".params.json", "")}
                    {ef.meta?.profile && <span style={{ color: C.muted, marginLeft: 4 }}>({ef.meta.profile})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* File upload */}
          {!manifest && (
            <>
              <div>
                <Label>Upload Animation Source</Label>
                <div
                  ref={dropRef}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragOver ? C.accent : C.border}`,
                    borderRadius: 8, padding: 24, textAlign: "center",
                    cursor: "pointer", background: dragOver ? "#05966910" : C.inputBg,
                    transition: "border-color 0.2s, background 0.2s",
                  }}
                >
                  {file ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <span style={{
                        padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: fileType === "aep" ? "#7c3aed30" : fileType === "ae-raw" ? C.accent + "30" : C.blue + "30",
                        color: fileType === "aep" ? "#a78bfa" : fileType === "ae-raw" ? C.accent : C.blue,
                      }}>
                        {fileType === "aep" ? "AE Project" : fileType === "ae-raw" ? "AE Extract" : "Lottie JSON"}
                      </span>
                      <span style={{ fontSize: 12, color: C.text }}>{file.name}</span>
                      <span style={{ fontSize: 10, color: C.muted }}>({(file.size / 1024).toFixed(0)} KB)</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>
                        Drop file here or click to browse
                      </div>
                      <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: 10 }}>
                        <span style={{ padding: "2px 6px", borderRadius: 3, background: "#7c3aed20", color: "#a78bfa" }}>.aep / .aepx</span>
                        <span style={{ padding: "2px 6px", borderRadius: 3, background: C.accent + "20", color: C.accent }}>.ae-extract.json</span>
                        <span style={{ padding: "2px 6px", borderRadius: 3, background: C.blue + "20", color: C.blue }}>.json (Lottie)</span>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".json,.aep,.aepx"
                    style={{ display: "none" }}
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </div>

                {fileType && (
                  <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 4, background: C.inputBg, border: `1px solid ${C.border}`, fontSize: 10, color: C.muted }}>
                    {fileType === "aep" && (
                      <>
                        <strong style={{ color: "#a78bfa" }}>AE Project mode</strong> — Requires After Effects installed. Will launch AE, run ExtendScript extraction, and capture ~90-95% of animation data including expressions, effects, 3D cameras, and text animators.
                      </>
                    )}
                    {fileType === "ae-raw" && (
                      <>
                        <strong style={{ color: C.accent }}>AE Raw Extract mode</strong> — Processing pre-exported ExtendScript data. Captures ~90-95% of animation parameters including expressions, all effects, 3D cameras/lights, layer styles, and text animators.
                      </>
                    )}
                    {fileType === "lottie" && (
                      <>
                        <strong style={{ color: C.blue }}>Lottie JSON mode</strong> — Exported via Bodymovin plugin. Captures ~40-60% of animation data. For higher fidelity, use ExtendScript extraction instead.
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label>Template Name</Label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. snappy-saas-promo"
                  style={{
                    width: "100%", padding: "6px 10px", borderRadius: 4,
                    background: C.inputBg, border: `1px solid ${C.border}`,
                    color: C.text, fontSize: 12, outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {aeJobId ? (
                <div style={{ padding: 10, borderRadius: 6, background: "#052e16", border: "1px solid #166534", fontSize: 12 }}>
                  <div style={{ color: "#4ade80", fontWeight: 600, marginBottom: 4 }}>After Effects extraction in progress...</div>
                  <div style={{ color: "#86efac", fontSize: 11 }}>{aeJobStatus}</div>
                  <div style={{ marginTop: 4, fontSize: 10, color: C.muted }}>
                    AE must be open with the correct composition selected. This may take 30-120 seconds.
                  </div>
                </div>
              ) : (
                <Btn accent onClick={handleExtract} disabled={!file || extracting}>
                  {extracting ? "Extracting..." : fileType === "aep" ? "Launch AE Extraction" : "Extract Parameters"}
                </Btn>
              )}
            </>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: 10, borderRadius: 6, background: "#3f0a0a", border: "1px solid #7f1d1d", fontSize: 12, color: "#fca5a5" }}>
              {error}
            </div>
          )}

          {/* Results */}
          {manifest && (
            <>
              <div style={{ padding: 12, borderRadius: 8, background: C.panel, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  {manifest.templateName}
                  {manifest.extractionMethod && (
                    <span style={{
                      padding: "2px 8px", borderRadius: 10, fontSize: 9, fontWeight: 600,
                      background: manifest.extractionMethod === "extendscript" ? "#7c3aed30" : C.blue + "30",
                      color: manifest.extractionMethod === "extendscript" ? "#a78bfa" : C.blue,
                    }}>
                      {manifest.extractionMethod === "extendscript" ? "ExtendScript ~95%" : "Lottie ~50%"}
                    </span>
                  )}
                  {manifest.detectedProfile && (
                    <span style={{ padding: "2px 8px", borderRadius: 10, background: C.accent + "30", color: C.accent, fontSize: 10, fontWeight: 600 }}>
                      {manifest.detectedProfile.profile}
                    </span>
                  )}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, fontSize: 11 }}>
                  <MetricCard label="Duration" value={manifest.meta.totalDuration + "s"} sub={manifest.meta.totalFrames + "f @ " + manifest.meta.fps + "fps"} />
                  <MetricCard label="Dimensions" value={manifest.meta.width + "x" + manifest.meta.height} sub={manifest.l3_composition.dimensions.aspect || ""} />
                  <MetricCard label="Layers" value={String(manifest.meta.layerCount)} sub={manifest.meta.fontCount + " fonts"} />
                  <MetricCard
                    label="Extras"
                    value={String(manifest.meta.effectCount ?? 0) + " fx"}
                    sub={String(manifest.meta.expressionCount ?? 0) + " expressions"}
                  />
                </div>
              </div>

              {/* Physics */}
              <CollapsibleSection title={"L1 Physics (" + manifest.l1_physics.easings.length + " easings, " + manifest.l1_physics.springs.length + " springs)"}>
                {manifest.l1_physics.springs.length > 0 && (
                  <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>
                    <strong style={{ color: C.text }}>Spring estimates:</strong>
                    {manifest.l1_physics.springs.slice(0, 5).map((s, i) => (
                      <div key={i} style={{ marginLeft: 8 }}>
                        s={s.stiffness} d={s.damping} m={s.mass}
                        {s.preset && <span style={{ color: C.accent }}> ~ {s.preset}</span>}
                        <span style={{ color: "#555" }}> ({s.source})</span>
                      </div>
                    ))}
                    {manifest.l1_physics.springs.length > 5 && <div style={{ marginLeft: 8, color: "#555" }}>...and {manifest.l1_physics.springs.length - 5} more</div>}
                  </div>
                )}
                {manifest.l1_physics.easings.length > 0 && (
                  <div style={{ fontSize: 11, color: C.muted }}>
                    <strong style={{ color: C.text }}>Easings:</strong>
                    {manifest.l1_physics.easings.map((e, i) => (
                      <span key={i} style={{ marginLeft: 6, padding: "1px 5px", borderRadius: 3, background: "#27272a", fontSize: 10 }}>
                        {e.name}
                      </span>
                    ))}
                  </div>
                )}
              </CollapsibleSection>

              {/* Visual */}
              <CollapsibleSection title={"L2 Visual (" + manifest.l2_visual.colors.length + " colors)"}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {manifest.l2_visual.colors.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 4, background: "#27272a", fontSize: 10 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: c.color, border: "1px solid #444" }} />
                      <span style={{ color: C.muted }}>{c.color}</span>
                    </div>
                  ))}
                </div>
                {manifest.l2_visual.fonts.length > 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: C.muted }}>
                    <strong style={{ color: C.text }}>Fonts:</strong> {manifest.l2_visual.fonts.map(f => f.family || f.name).join(", ")}
                  </div>
                )}
              </CollapsibleSection>

              {/* Temporal */}
              <CollapsibleSection title={"L4 Temporal (" + manifest.l4_temporal.scenes.length + " scenes)"}>
                <div style={{ fontSize: 11 }}>
                  {manifest.l4_temporal.scenes.map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, color: C.muted, padding: "2px 0" }}>
                      <span style={{ color: C.text, fontWeight: 500, minWidth: 50 }}>Scene {s.scene}</span>
                      <span>{s.startTime}s - {s.endTime}s</span>
                      <span style={{ color: "#555" }}>({s.durationFrames}f)</span>
                      <span style={{ color: "#555" }}>{s.layers.length} layers</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 4, fontSize: 10, color: C.muted }}>
                  Keyframe density: {manifest.l4_temporal.keyframeDensity.total} total ({manifest.l4_temporal.keyframeDensity.perSecond}/sec)
                </div>
              </CollapsibleSection>

              {/* Techniques */}
              <CollapsibleSection title={"L5 Techniques (" + manifest.l5_techniques.length + ")"}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {manifest.l5_techniques.map((t, i) => (
                    <span key={i} style={{
                      padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 500,
                      background: t.confidence > 0.8 ? C.accent + "20" : "#27272a",
                      color: t.confidence > 0.8 ? C.accent : C.muted,
                      border: `1px solid ${t.confidence > 0.8 ? C.accent + "40" : C.border}`,
                    }}>
                      {t.name} ({(t.confidence * 100).toFixed(0)}%)
                    </span>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Expressions (ExtendScript only) */}
              {manifest.expressions && manifest.expressions.length > 0 && (
                <CollapsibleSection title={"Expressions (" + manifest.expressions.length + ")"}>
                  <div style={{ fontSize: 11 }}>
                    {manifest.expressions.slice(0, 10).map((expr, i) => (
                      <div key={i} style={{ padding: "4px 0", borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 2 }}>
                          <span style={{ color: C.text, fontWeight: 500 }}>{expr.layer}</span>
                          <span style={{ color: C.muted }}>{expr.propertyName}</span>
                        </div>
                        <pre style={{
                          margin: 0, padding: 4, borderRadius: 3, background: C.inputBg,
                          fontSize: 10, color: "#a78bfa", overflow: "auto", maxHeight: 60,
                          whiteSpace: "pre-wrap", wordBreak: "break-all",
                        }}>
                          {expr.expression.slice(0, 200)}{expr.expression.length > 200 ? "..." : ""}
                        </pre>
                      </div>
                    ))}
                    {manifest.expressions.length > 10 && (
                      <div style={{ padding: "4px 0", color: C.muted, fontSize: 10 }}>
                        ...and {manifest.expressions.length - 10} more expressions
                      </div>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* Precompositions (ExtendScript only) */}
              {manifest.precompositions && manifest.precompositions.length > 0 && (
                <CollapsibleSection title={"Precompositions (" + manifest.precompositions.length + ")"}>
                  <div style={{ fontSize: 11 }}>
                    {manifest.precompositions.map((pc, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, color: C.muted, padding: "2px 0" }}>
                        <span style={{ color: C.text, fontWeight: 500, minWidth: 120 }}>{pc.name}</span>
                        <span>{pc.width}x{pc.height}</span>
                        <span>{pc.duration?.toFixed(1)}s</span>
                        <span>{pc.layerCount} layers</span>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <Btn accent onClick={handleGenerate} disabled={generating}>
                  {generating ? "Generating..." : "Generate Remotion Composition"}
                </Btn>
                <Btn onClick={handleReset}>
                  Import Another
                </Btn>
              </div>

              {/* Generation result */}
              {genResult && (
                <div style={{ padding: 12, borderRadius: 8, background: "#052e16", border: "1px solid #166534" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#4ade80", marginBottom: 6 }}>
                    Composition generated!
                  </div>
                  <div style={{ fontSize: 11, color: "#86efac" }}>
                    <div>File: <code>{genResult.filePath}</code></div>
                    <div>Component: <code>{genResult.compName}</code></div>
                    <div>ID: <code>{genResult.compId}</code></div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: C.muted }}>
                    Add the import and Composition entry to Root.tsx and registry.ts to register it.
                    The registration snippets have been printed to the server console.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <div style={{ padding: 8, borderRadius: 6, background: C.inputBg, border: `1px solid ${C.border}` }}>
    <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{value}</div>
    <div style={{ fontSize: 9, color: C.muted }}>{sub}</div>
  </div>
);

const CollapsibleSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderRadius: 6, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", padding: "8px 12px", background: C.panel,
          border: "none", color: C.text, fontSize: 11, fontWeight: 500,
          cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
          textAlign: "left",
        }}
      >
        <span style={{ transition: "transform 0.2s", transform: open ? "rotate(90deg)" : "rotate(0)" }}>
          &#x25B6;
        </span>
        {title}
      </button>
      {open && (
        <div style={{ padding: 12, background: C.bg }}>
          {children}
        </div>
      )}
    </div>
  );
};
