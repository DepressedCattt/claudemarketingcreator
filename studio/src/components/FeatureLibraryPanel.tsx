/**
 * FeatureLibraryPanel — browsable reference for the category taxonomy.
 *
 * Shows every category and subcategory with:
 *   • Description and linked compositions
 *   • Parameter ranges (springs, stagger, blur, scale, duration)
 *   • Technique/recipe references
 *   • Color palette swatches
 *   • Typography & temporal guidelines
 *
 * Opens as a wide modal overlay from the Header toolbar.
 */
import React, { useState, useMemo } from "react";
import {
  CATEGORY_REGISTRY,
  getCompositionsForCategory,
} from "@data/categories";
import type { Category, SubCategory, SpringRange } from "@data/categories";
import { REGISTRY } from "../registry";

// ─── Design tokens ──────────────────────────────────────────────────────────
const C = {
  bg:       "#111113",
  panel:    "#18181b",
  card:     "#1e1e22",
  border:   "#2a2a2e",
  text:     "#e4e4e7",
  muted:    "#71717a",
  accent:   "#0ea5e9",
  purple:   "#8b5cf6",
  green:    "#10b981",
  amber:    "#f59e0b",
  red:      "#ef4444",
  inputBg:  "#09090b",
  pink:     "#ec4899",
  gold:     "#d4a017",
  goldLight:"#f5d060",
};

function isPlayground(compId: string): boolean {
  const meta = REGISTRY.find((c) => c.id === compId);
  return !!(meta as { playground?: boolean } | undefined)?.playground;
}

const SUBCAT_ICONS: Record<string, string> = {
  "text-animation":    "Aa",
  "ui-elements":       "▣",
  "data-viz":          "#",
  "transitions":       "⇄",
  "background-effects":"◉",
  "spring-physics":    "⌁",
};

// ─── Primitives ─────────────────────────────────────────────────────────────

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    fontSize: 10, fontWeight: 700, color: C.muted,
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6,
  }}>
    {children}
  </div>
);

const Pill: React.FC<{ children: React.ReactNode; color?: string; onClick?: () => void }> = ({
  children, color = C.accent, onClick,
}) => (
  <span
    onClick={onClick}
    style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 4,
      background: `${color}18`, border: `1px solid ${color}33`,
      color, fontSize: 11, fontWeight: 500, lineHeight: "18px",
      cursor: onClick ? "pointer" : "default",
      transition: "opacity 0.1s",
    }}
    onMouseEnter={(e) => { if (onClick) e.currentTarget.style.opacity = "0.7"; }}
    onMouseLeave={(e) => { if (onClick) e.currentTarget.style.opacity = "1"; }}
  >
    {children}
  </span>
);

const Swatch: React.FC<{ color: string }> = ({ color }) => (
  <div
    title={color}
    style={{
      width: 24, height: 24, borderRadius: 4,
      background: color, border: "1px solid #333",
      cursor: "default", flexShrink: 0,
    }}
  />
);

// ─── Range bar — visual representation of [min, max] ────────────────────────

const RangeBar: React.FC<{
  label: string; min: number; max: number;
  absMin?: number; absMax?: number; unit?: string; color?: string;
}> = ({ label, min, max, absMin = 0, absMax, unit = "", color = C.accent }) => {
  const aMax = absMax ?? max * 1.5;
  const leftPct = ((min - absMin) / (aMax - absMin)) * 100;
  const widthPct = ((max - min) / (aMax - absMin)) * 100;

  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 10, color: C.muted, marginBottom: 2,
      }}>
        <span>{label}</span>
        <span style={{ fontFamily: "monospace", color: C.text }}>
          {min}{unit} – {max}{unit}
        </span>
      </div>
      <div style={{
        height: 6, borderRadius: 3, background: "#222",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, height: "100%", borderRadius: 3,
          left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
        }} />
      </div>
    </div>
  );
};

// ─── Spring preset card ─────────────────────────────────────────────────────

const SpringCard: React.FC<{ name: string; range: SpringRange }> = ({ name, range }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
    padding: "10px 12px", flex: "1 1 140px", minWidth: 140,
  }}>
    <div style={{
      fontSize: 11, fontWeight: 700, color: C.purple,
      marginBottom: 8, textTransform: "capitalize",
    }}>
      {name}
    </div>
    <RangeBar label="Stiffness" min={range.stiffness[0]} max={range.stiffness[1]} absMax={250} color={C.purple} />
    <RangeBar label="Damping"   min={range.damping[0]}   max={range.damping[1]}   absMax={35}  color={C.accent} />
    <RangeBar label="Mass"      min={range.mass[0]}      max={range.mass[1]}      absMax={2}   color={C.green} />
  </div>
);

// ─── Subcategory detail ─────────────────────────────────────────────────────

const SubCategoryDetail: React.FC<{ sub: SubCategory }> = ({ sub }) => {
  const pr = sub.parameterRanges;
  const springEntries = Object.entries(pr.springs);

  const compMetas = sub.compositions
    .map((id) => REGISTRY.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Description */}
      <div style={{
        fontSize: 13, color: C.text, lineHeight: 1.7,
        background: `${C.accent}08`, border: `1px solid ${C.accent}15`,
        borderRadius: 8, padding: "12px 14px",
      }}>
        {sub.description}
      </div>

      {/* Spring presets */}
      <div>
        <Label>Spring Presets</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {springEntries.map(([name, range]) => (
            <SpringCard key={name} name={name} range={range} />
          ))}
        </div>
      </div>

      {/* Other parameter ranges */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12,
      }}>
        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "10px 12px",
        }}>
          <Label>Motion Parameters</Label>
          <RangeBar label="Stagger"  min={pr.stagger.min}       max={pr.stagger.max}       absMax={35}  unit="f" color={C.amber} />
          <RangeBar label="Blur"     min={pr.blur.min}          max={pr.blur.max}          absMax={55}  unit="px" color={C.pink} />
          <RangeBar label="Scale"    min={pr.scale.entrance[0]} max={pr.scale.entrance[1]} absMin={0.5} absMax={1.05} color={C.green} />
          <RangeBar label="Duration" min={pr.duration.min}      max={pr.duration.max}      absMax={700} unit="f" color={C.accent} />
        </div>

        <div style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 8,
          padding: "10px 12px",
        }}>
          <Label>Easing Functions</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            {pr.easing.map((e) => <Pill key={e} color={C.muted}>{e}</Pill>)}
          </div>

          {sub.aeMapping && sub.aeMapping.length > 0 && (
            <>
              <Label>AE Layer Mapping</Label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {sub.aeMapping.map((m) => <Pill key={m} color={C.amber}>{m}</Pill>)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Techniques */}
      {sub.techniques.length > 0 && (
        <div>
          <Label>Techniques (Recipes)</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {sub.techniques.map((t) => (
              <Pill key={t} color={C.green}>
                docs/recipes/{t}.md
              </Pill>
            ))}
          </div>
        </div>
      )}

      {/* Compositions */}
      {compMetas.length > 0 && (
        <div>
          <Label>Example Compositions</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {compMetas.map((comp) => {
              if (!comp) return null;
              const pg = isPlayground(comp.id);
              return (
                <div key={comp.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: pg ? `${C.gold}0c` : C.card,
                  border: `1px solid ${pg ? `${C.gold}30` : C.border}`,
                  borderRadius: 6, padding: "8px 12px",
                }}>
                  {pg && <span style={{ fontSize: 11, flexShrink: 0 }}>★</span>}
                  <span style={{
                    fontSize: 10, fontWeight: 600,
                    color: pg ? C.gold : C.muted,
                    background: pg ? `${C.gold}18` : "#222",
                    padding: "2px 6px", borderRadius: 3, fontFamily: "monospace",
                  }}>
                    {comp.format}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: pg ? 600 : 500,
                    color: pg ? C.gold : C.text,
                  }}>
                    {comp.label}
                  </span>
                  <span style={{ fontSize: 10, color: pg ? `${C.gold}66` : "#444", fontFamily: "monospace" }}>
                    {comp.id}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: 10, color: pg ? `${C.gold}88` : C.muted }}>
                    {pg ? "★ Playground" : `${comp.durationInFrames}f @ ${comp.fps}fps`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Category guidelines panel ──────────────────────────────────────────────

const CategoryGuidelines: React.FC<{ cat: Category }> = ({ cat }) => {
  const compIds = getCompositionsForCategory(cat.id);
  const compMetas = compIds
    .map((id) => REGISTRY.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Description */}
      <div style={{
        fontSize: 13, color: C.text, lineHeight: 1.7,
        background: `${C.accent}08`, border: `1px solid ${C.accent}15`,
        borderRadius: 8, padding: "12px 14px",
      }}>
        {cat.description}
      </div>

      {/* Profile */}
      {cat.profiles.length > 0 && (
        <div>
          <Label>Linked Profiles</Label>
          <div style={{ display: "flex", gap: 6 }}>
            {cat.profiles.map((p) => (
              <Pill key={p} color={C.purple}>docs/profiles/{p}.md</Pill>
            ))}
          </div>
        </div>
      )}

      {/* Color palette */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
      }}>
        {(["backgrounds", "accents", "text"] as const).map((group) => (
          <div key={group} style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "10px 12px",
          }}>
            <Label>{group}</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {cat.colorGuidelines[group].map((c) => (
                <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                  <Swatch color={c} />
                  <span style={{ fontSize: 9, color: "#555", fontFamily: "monospace" }}>{c}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Typography */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "12px 14px",
      }}>
        <Label>Typography</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <RangeBar label="Hero Size"     min={cat.typographyGuidelines.sizes.hero[0]}     max={cat.typographyGuidelines.sizes.hero[1]}     absMax={220} unit="px" color={C.accent} />
            <RangeBar label="Headline Size" min={cat.typographyGuidelines.sizes.headline[0]} max={cat.typographyGuidelines.sizes.headline[1]} absMax={150} unit="px" color={C.purple} />
            <RangeBar label="Body Size"     min={cat.typographyGuidelines.sizes.body[0]}     max={cat.typographyGuidelines.sizes.body[1]}     absMax={30}  unit="px" color={C.green} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>Weights</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
              {cat.typographyGuidelines.weights.map((w) => (
                <Pill key={w} color={C.muted}>{w}</Pill>
              ))}
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Letter Spacing</div>
            <div style={{ fontSize: 12, color: C.text }}>
              Hero: <code style={{ color: C.accent }}>{cat.typographyGuidelines.letterSpacing.hero}</code>
              {" · "}
              Body: <code style={{ color: C.accent }}>{cat.typographyGuidelines.letterSpacing.body}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Temporal */}
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 8, padding: "12px 14px",
      }}>
        <Label>Temporal Guidelines</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <RangeBar label="BPM"            min={cat.temporalGuidelines.bpm[0]}                 max={cat.temporalGuidelines.bpm[1]}                 absMax={140} color={C.red} />
            <RangeBar label="Hook Duration"  min={cat.temporalGuidelines.sceneDuration.hook[0]}  max={cat.temporalGuidelines.sceneDuration.hook[1]}  absMax={200} unit="f" color={C.accent} />
            <RangeBar label="Mid Duration"   min={cat.temporalGuidelines.sceneDuration.mid[0]}   max={cat.temporalGuidelines.sceneDuration.mid[1]}   absMax={200} unit="f" color={C.purple} />
            <RangeBar label="CTA Duration"   min={cat.temporalGuidelines.sceneDuration.cta[0]}   max={cat.temporalGuidelines.sceneDuration.cta[1]}   absMax={200} unit="f" color={C.green} />
          </div>
          <div>
            <RangeBar label="Total Duration"  min={cat.temporalGuidelines.totalDuration[0]} max={cat.temporalGuidelines.totalDuration[1]} absMax={700} unit="f" color={C.amber} />
            <RangeBar label="Scene Count"     min={cat.temporalGuidelines.sceneCount[0]}    max={cat.temporalGuidelines.sceneCount[1]}    absMax={10}  color={C.accent} />
            <RangeBar label="Fade-Out"        min={cat.temporalGuidelines.fadeOutFrames[0]} max={cat.temporalGuidelines.fadeOutFrames[1]} absMax={20}  unit="f" color={C.pink} />
            <div style={{ marginTop: 8, fontSize: 11, color: C.muted }}>
              Transition: <span style={{ color: C.text }}>{cat.temporalGuidelines.transitionType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Composition guidelines */}
      <div>
        <Label>Composition Rules</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(["spatialUtilization", "visualHierarchy", "colorContrast"] as const).map((key) => {
            const g = cat.compositionGuidelines[key];
            return (
              <details key={key} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "10px 12px",
              }}>
                <summary style={{
                  fontSize: 12, fontWeight: 600, color: C.text,
                  cursor: "pointer", userSelect: "none",
                  listStyle: "none",
                }}>
                  <span style={{ color: C.accent, marginRight: 8 }}>▸</span>
                  {g.description.split(".")[0]}
                </summary>
                <ul style={{
                  marginTop: 8, paddingLeft: 16,
                  fontSize: 11, color: C.muted, lineHeight: 1.8,
                }}>
                  {g.rules.map((r, i) => (
                    <li key={i} style={{ marginBottom: 2 }}>{r}</li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      </div>

      {/* All compositions in this category */}
      <div>
        <Label>All Compositions ({compMetas.length})</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {compMetas.map((comp) => {
            if (!comp) return null;
            const pg = isPlayground(comp.id);
            return (
              <div key={comp.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: pg ? `${C.gold}0c` : C.card,
                border: `1px solid ${pg ? `${C.gold}30` : C.border}`,
                borderRadius: 6, padding: "6px 10px",
              }}>
                {pg && <span style={{ fontSize: 11, flexShrink: 0 }}>★</span>}
                <span style={{
                  fontSize: 10, fontWeight: 600,
                  color: pg ? C.gold : C.muted,
                  background: pg ? `${C.gold}18` : "#222",
                  padding: "2px 6px", borderRadius: 3, fontFamily: "monospace",
                }}>
                  {comp.format}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: pg ? 600 : 500,
                  color: pg ? C.gold : C.text,
                }}>
                  {comp.label}
                </span>
                <span style={{ fontSize: 10, color: pg ? `${C.gold}66` : "#444", fontFamily: "monospace" }}>
                  {comp.id}
                </span>
                {pg && (
                  <span style={{ marginLeft: "auto", fontSize: 9, fontWeight: 700, color: C.gold, letterSpacing: "0.06em" }}>
                    ★ PLAYGROUND
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main panel ─────────────────────────────────────────────────────────────

export const FeatureLibraryPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const categories = CATEGORY_REGISTRY.categories as Category[];
  const [activeCatId, setActiveCatId] = useState<string>(categories[0]?.id ?? "");
  const [activeSubId, setActiveSubId] = useState<string | null>(null);

  const activeCat = useMemo(
    () => categories.find((c) => c.id === activeCatId),
    [categories, activeCatId],
  );

  const activeSub = useMemo(
    () => activeSubId ? activeCat?.subcategories.find((sc) => sc.id === activeSubId) : null,
    [activeCat, activeSubId],
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.72)", display: "flex",
        alignItems: "center", justifyContent: "center",
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 960, maxWidth: "92vw",
          height: "85vh",
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 24px 80px #000a",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{
          padding: "14px 18px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: 15 }}>📚</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
              Feature Library
            </div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
              Category taxonomy · Parameter ranges · Technique reference
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", color: "#555",
              fontSize: 18, cursor: "pointer", padding: "2px 6px", lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* ── Body: sidebar + detail ────────────────────────────────────── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Sidebar */}
          <div style={{
            width: 240, flexShrink: 0,
            borderRight: `1px solid ${C.border}`,
            overflowY: "auto",
            padding: "12px 0",
          }}>
            {categories.map((cat) => (
              <div key={cat.id}>
                {/* Category heading */}
                <div
                  onClick={() => { setActiveCatId(cat.id); setActiveSubId(null); }}
                  style={{
                    padding: "8px 16px",
                    cursor: "pointer",
                    background: activeCatId === cat.id && !activeSubId ? `${C.accent}12` : "transparent",
                    borderLeft: activeCatId === cat.id && !activeSubId
                      ? `3px solid ${C.accent}` : "3px solid transparent",
                    transition: "all 0.1s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${C.accent}0a`; }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      activeCatId === cat.id && !activeSubId ? `${C.accent}12` : "transparent";
                  }}
                >
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: C.text,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ color: C.accent }}>◆</span>
                    {cat.label}
                  </div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                    {cat.subcategories.length} subcategories
                  </div>
                </div>

                {/* Subcategories */}
                {activeCatId === cat.id && cat.subcategories.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => setActiveSubId(sc.id)}
                    style={{
                      padding: "6px 16px 6px 28px",
                      cursor: "pointer",
                      background: activeSubId === sc.id ? `${C.purple}12` : "transparent",
                      borderLeft: activeSubId === sc.id
                        ? `3px solid ${C.purple}` : "3px solid transparent",
                      display: "flex", alignItems: "center", gap: 8,
                      transition: "all 0.1s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = `${C.purple}0a`; }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        activeSubId === sc.id ? `${C.purple}12` : "transparent";
                    }}
                  >
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: C.purple,
                      width: 18, textAlign: "center", flexShrink: 0,
                      fontFamily: "monospace",
                    }}>
                      {SUBCAT_ICONS[sc.id] ?? "·"}
                    </span>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: C.text }}>
                        {sc.label}
                      </div>
                      <div style={{ fontSize: 9, color: C.muted }}>
                        {sc.compositions.length} comp{sc.compositions.length !== 1 ? "s" : ""}
                        {sc.techniques.length > 0 && ` · ${sc.techniques.length} recipe${sc.techniques.length !== 1 ? "s" : ""}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Detail pane */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "18px 22px",
          }}>
            {/* Breadcrumb */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              marginBottom: 16, fontSize: 12,
            }}>
              <span
                onClick={() => setActiveSubId(null)}
                style={{
                  color: activeSubId ? C.accent : C.text,
                  cursor: activeSubId ? "pointer" : "default",
                  fontWeight: activeSubId ? 400 : 700,
                }}
              >
                {activeCat?.label ?? ""}
              </span>
              {activeSub && (
                <>
                  <span style={{ color: "#333" }}>/</span>
                  <span style={{ color: C.text, fontWeight: 700 }}>{activeSub.label}</span>
                </>
              )}
            </div>

            {/* Content */}
            {activeSub ? (
              <SubCategoryDetail sub={activeSub} />
            ) : activeCat ? (
              <CategoryGuidelines cat={activeCat} />
            ) : (
              <div style={{ color: C.muted, fontSize: 13 }}>
                Select a category from the sidebar to explore.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
