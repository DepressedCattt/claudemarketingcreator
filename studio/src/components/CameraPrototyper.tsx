/**
 * CameraPrototyper — Interactive camera path builder
 *
 * Two linked 2D SVG diagrams (bird's-eye XZ + side profile YZ) let you drag
 * the camera position and lookAt target for each keyframe. The right panel
 * auto-generates a copy-pasteable CameraRig() function for any composition.
 *
 * Defaults are pre-loaded with AwesomeAd Scene 1 values.
 */
import React, { useState, useRef, useCallback, useReducer, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CamKeyframe {
  frame:  number;
  px: number; py: number; pz: number; // camera world position
  lx: number; ly: number; lz: number; // lookAt target
  fov:    number;
  easing: "eo3" | "eo4" | "eo5" | "linear";
}

type DragTarget = { dot: "cam" | "look"; view: "top" | "side" } | null;

const EASING_OPTS: CamKeyframe["easing"][] = ["eo3", "eo4", "eo5", "linear"];
const EASING_LABELS: Record<CamKeyframe["easing"], string> = {
  eo3: "ease-out³", eo4: "ease-out⁴", eo5: "ease-out⁵", linear: "linear",
};

// ─── Scene definitions (pure data — no React imports) ─────────────────────────
export interface SceneDef {
  id:         string;
  label:      string;   // sequence name
  compId:     string;   // matches registry id
  compLabel:  string;   // short composition display name
  from:       number;   // start frame (inclusive)
  to:         number;   // end frame (inclusive)
  fps:        number;
  color:      string;   // sequence accent colour
  defaults:   CamKeyframe[];
}

export const SCENE_DEFS: SceneDef[] = [
  // ── Awesome Ad ─────────────────────────────────────────────────────────────
  {
    id: "aa-rise", label: "Rise (Camera Scan Up)",
    compId: "awesome-ad", compLabel: "Awesome Ad",
    from: 0, to: 90, fps: 30, color: "#0ea5e9",
    defaults: [
      { frame: 0, px: 0, py: -3.0, pz: 2.0, lx: 0, ly: 1.5, lz: 0, fov: 36, easing: "eo4" },
    ],
  },
  {
    id: "aa-pullback", label: "Pull Back (Full Reveal)",
    compId: "awesome-ad", compLabel: "Awesome Ad",
    from: 90, to: 150, fps: 30, color: "#8b5cf6",
    defaults: [
      { frame: 90, px: 0, py: 0.5, pz: 2.0, lx: 0, ly: 0.5, lz: 0, fov: 36, easing: "eo5" },
    ],
  },
  // ── Cinema Reveal ──────────────────────────────────────────────────────────
  {
    id: "cr-rise", label: "Rise (Pedestal Up)",
    compId: "cinema-reveal", compLabel: "Cinema Reveal",
    from: 0, to: 80, fps: 30, color: "#0ea5e9",
    defaults: [
      { frame: 0, px: 0, py: -2.5, pz: 2.5, lx: 0, ly: 0.5, lz: 0, fov: 36, easing: "eo4" },
    ],
  },
  {
    id: "cr-pivot", label: "Pivot (3D Reveal)",
    compId: "cinema-reveal", compLabel: "Cinema Reveal",
    from: 80, to: 160, fps: 30, color: "#8b5cf6",
    defaults: [
      { frame: 80, px: 0.0, py: 0.5, pz: 2.5, lx: 0, ly: 0, lz: 0, fov: 36, easing: "eo4" },
    ],
  },
  {
    id: "cr-dolly", label: "Dolly Back (Wide)",
    compId: "cinema-reveal", compLabel: "Cinema Reveal",
    from: 160, to: 300, fps: 30, color: "#10b981",
    defaults: [
      { frame: 160, px: -1.5, py: 0.5, pz: 3.5, lx: 0, ly: 0, lz: 0, fov: 36, easing: "eo4" },
    ],
  },
  {
    id: "cr-orbit", label: "360° Orbit Fly-Around",
    compId: "cinema-reveal", compLabel: "Cinema Reveal",
    from: 300, to: 480, fps: 30, color: "#ef4444",
    defaults: [
      { frame: 300, px: 0.0, py: 0.5, pz: 5.0, lx: 0, ly: 0, lz: 0, fov: 36, easing: "eo4" },
    ],
  },
];

// Unique composition IDs in SCENE_DEFS for the two-level picker
const COMP_IDS = [...new Set(SCENE_DEFS.map(s => s.compId))];
const COMP_LABELS: Record<string, string> = Object.fromEntries(
  SCENE_DEFS.map(s => [s.compId, s.compLabel]),
);

// Fallback single keyframe for free mode
const DEFAULTS: CamKeyframe[] = [
  { frame: 0, px: 0, py: 0, pz: 4.0, lx: 0, ly: 0, lz: 0, fov: 36, easing: "eo4" },
];

// Phone world-space reference (matches compositions)
const PH = 1.85, PW = 0.88, PD = 0.08;

// ─── Diagram config ───────────────────────────────────────────────────────────
const DW = 340, DH = 240;
const DM = { l: 46, r: 12, t: 12, b: 32 };
const PLOT_W = DW - DM.l - DM.r; // 282
const PLOT_H = DH - DM.t - DM.b; // 196

// World-space view ranges
const Z_RANGE: [number, number] = [-1.5, 8.0];  // depth axis (horizontal in both views)
const X_RANGE: [number, number] = [-4.5, 4.5];  // bird's-eye vertical axis
const Y_RANGE: [number, number] = [-6.5, 4.0];  // side-view vertical axis

// ─── Coordinate transforms ────────────────────────────────────────────────────
// World Z → SVG x  (left = behind phone/screen, right = in front of phone)
const wz2sx = (z: number) => DM.l + ((z - Z_RANGE[0]) / (Z_RANGE[1] - Z_RANGE[0])) * PLOT_W;
const sx2wz = (sx: number) => Z_RANGE[0] + ((sx - DM.l) / PLOT_W) * (Z_RANGE[1] - Z_RANGE[0]);

// Bird's-eye (top-down): World X → SVG y  (positive X = up)
const td_wx2sy = (x: number) => DM.t + ((X_RANGE[1] - x) / (X_RANGE[1] - X_RANGE[0])) * PLOT_H;
const td_sy2wx = (sy: number) => X_RANGE[1] - ((sy - DM.t) / PLOT_H) * (X_RANGE[1] - X_RANGE[0]);

// Side profile: World Y → SVG y  (positive Y = up)
const sd_wy2sy = (y: number) => DM.t + ((Y_RANGE[1] - y) / (Y_RANGE[1] - Y_RANGE[0])) * PLOT_H;
const sd_sy2wy = (sy: number) => Y_RANGE[1] - ((sy - DM.t) / PLOT_H) * (Y_RANGE[1] - Y_RANGE[0]);

const r2 = (n: number) => Math.round(n * 100) / 100;

// ─── FOV cone polygon points ──────────────────────────────────────────────────
function fovPoly(
  cx: number, cy: number, tx: number, ty: number,
  fovDeg: number, len = 160,
): string {
  const dx = tx - cx, dy = ty - cy;
  const d = Math.sqrt(dx * dx + dy * dy);
  if (d < 0.5) return `${cx},${cy}`;
  const ux = dx / d, uy = dy / d;
  const half = (fovDeg * 0.5 * Math.PI) / 180;
  const cosH = Math.cos(half), sinH = Math.sin(half);
  // Rotate ux,uy by ±half
  const r1x = ux * cosH + uy * sinH,  r1y = -ux * sinH + uy * cosH;
  const r2x = ux * cosH - uy * sinH,  r2y =  ux * sinH + uy * cosH;
  const p1x = cx + r1x * len, p1y = cy + r1y * len;
  const p2x = cx + r2x * len, p2y = cy + r2y * len;
  return `${cx.toFixed(1)},${cy.toFixed(1)} ${p1x.toFixed(1)},${p1y.toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`;
}

// ─── Code generator ───────────────────────────────────────────────────────────
function genCode(kfs: CamKeyframe[]): string {
  const sorted = [...kfs].sort((a, b) => a.frame - b.frame);

  // Format number: drop trailing zeros after decimal
  const n = (v: number) => {
    const s = v.toFixed(2);
    return s.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  };

  // Lerp expression: "a + t * Δ" or just "a" when constant
  // Returns [expr, comment]
  const lerp = (a: number, b: number, t: string): string => {
    if (a === b) return n(a);
    const delta = b - a;
    const sign  = delta < 0 ? " - " : " + ";
    return `${n(a)}${sign}${t} * ${n(Math.abs(delta))}`;
  };

  const lines: string[] = [];
  lines.push("function CameraRig() {");
  if (sorted.length > 1) lines.push("  const frame = useCurrentFrame();");
  lines.push("  const { camera } = useThree();", "");

  if (sorted.length === 1) {
    const k = sorted[0];
    lines.push(
      `  camera.position.set(${n(k.px)}, ${n(k.py)}, ${n(k.pz)});`,
      `  (camera as THREE.PerspectiveCamera).lookAt(${n(k.lx)}, ${n(k.ly)}, ${n(k.lz)});`,
    );
  } else {
    // Easing progress vars
    sorted.slice(0, -1).forEach((k, i) => {
      const dur  = sorted[i + 1].frame - k.frame;
      const prFn = `pr(frame, ${k.frame}, ${dur})`;
      const expr = k.easing === "linear" ? prFn : `${k.easing}(${prFn})`;
      lines.push(`  const t${i + 1} = ${expr};`);
    });
    lines.push("");

    const N = sorted.length;

    if (N === 2) {
      // Single phase — inline lerp directly in camera.position.set()
      const [a, b] = sorted;
      lines.push(
        `  camera.position.set(`,
        `    ${lerp(a.px, b.px, "t1")},  // ${n(a.px)} → ${n(b.px)}`,
        `    ${lerp(a.py, b.py, "t1")},  // ${n(a.py)} → ${n(b.py)}`,
        `    ${lerp(a.pz, b.pz, "t1")},  // ${n(a.pz)} → ${n(b.pz)}`,
        `  );`,
        `  (camera as THREE.PerspectiveCamera).lookAt(`,
        `    ${lerp(a.lx, b.lx, "t1")},  // ${n(a.lx)} → ${n(b.lx)}`,
        `    ${lerp(a.ly, b.ly, "t1")},  // ${n(a.ly)} → ${n(b.ly)}`,
        `    ${lerp(a.lz, b.lz, "t1")},  // ${n(a.lz)} → ${n(b.lz)}`,
        `  );`,
      );
    } else {
      // Multi-phase — declare vars then if/else chain
      lines.push(
        "  let cx: number, cy: number, cz: number;",
        "  let lx: number, ly: number, lz: number;",
        "",
      );
      sorted.slice(0, -1).forEach((k, i) => {
        const b   = sorted[i + 1];
        const t   = `t${i + 1}`;
        const last = i === N - 2;
        if (i === 0)         lines.push(`  if (frame < ${b.frame}) {`);
        else if (!last)      lines.push(`  } else if (frame < ${b.frame}) {`);
        else                 lines.push(`  } else {`);
        lines.push(
          `    cx = ${lerp(k.px, b.px, t)};  cy = ${lerp(k.py, b.py, t)};  cz = ${lerp(k.pz, b.pz, t)};`,
          `    lx = ${lerp(k.lx, b.lx, t)};  ly = ${lerp(k.ly, b.ly, t)};  lz = ${lerp(k.lz, b.lz, t)};`,
        );
      });
      lines.push("  }", "");
      lines.push(
        "  camera.position.set(cx, cy, cz);",
        "  (camera as THREE.PerspectiveCamera).lookAt(lx, ly, lz);",
      );
    }
  }

  lines.push(
    `  (camera as THREE.PerspectiveCamera).fov  = ${sorted[0].fov};`,
    "  (camera as THREE.PerspectiveCamera).near = 0.05;",
    "  (camera as THREE.PerspectiveCamera).far  = 40;",
    "  (camera as THREE.PerspectiveCamera).updateProjectionMatrix();",
    "  return null;",
    "}",
  );
  return lines.join("\n");
}

// ─── Full-composition code generator ─────────────────────────────────────────
// Merges all saved scene keyframes for one composition and produces an annotated
// CameraRig() that covers the entire timeline.
function genCodeForComp(
  compId:    string,
  compLabel: string,
  savedKfs:  Record<string, CamKeyframe[]>,
): string {
  const compScenes = SCENE_DEFS.filter(s => s.compId === compId);
  const allKfs: CamKeyframe[] = [];
  compScenes.forEach(s => {
    const kfs = savedKfs[s.id];
    if (kfs) allKfs.push(...kfs);
  });

  if (allKfs.length === 0) return `// No keyframes saved yet for "${compLabel}"`;

  const n4  = (v: number) => v.toFixed(2).replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
  const pad = (s: string, w: number) => s.padEnd(w);
  const now = new Date().toLocaleDateString("en-AU", { year: "numeric", month: "short", day: "numeric" });

  const header = [
    `// ─── ${compLabel} — Full Composition CameraRig ${"─".repeat(Math.max(0, 44 - compLabel.length))}`,
    `// Generated: ${now}`,
    `//`,
    `// Scenes:`,
    ...compScenes.map(s => {
      const kfs = savedKfs[s.id] ?? [];
      const dur = ((s.to - s.from) / s.fps).toFixed(1);
      return `//   ${pad(s.label, 30)} f${s.from} → f${s.to}  (${dur}s)  [${kfs.length} kf]`;
    }),
    `//`,
    `// Keyframes:`,
    ...[...allKfs].sort((a, b) => a.frame - b.frame).map(k =>
      `//   f${pad(String(k.frame), 4)}  pos[${n4(k.px)}, ${n4(k.py)}, ${n4(k.pz)}]` +
      `  look[${n4(k.lx)}, ${n4(k.ly)}, ${n4(k.lz)}]  fov=${k.fov}  ease=${k.easing}`
    ),
    `//`,
  ].join("\n");

  return header + "\n" + genCode(allKfs);
}

// ─── Grid + axis helpers ──────────────────────────────────────────────────────
function GridLines({ view }: { view: "top" | "side" }) {
  const zTicks = [-1, 0, 1, 2, 3, 4, 5, 6, 7, 8];
  const xTicks = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const yTicks = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
  const vertTicks = view === "top" ? xTicks : yTicks;
  const vertFn    = view === "top" ? td_wx2sy : sd_wy2sy;
  return (
    <g>
      {/* Vertical grid (constant Z) */}
      {zTicks.map(z => (
        <line key={z} x1={wz2sx(z)} x2={wz2sx(z)} y1={DM.t} y2={DM.t + PLOT_H}
          stroke={z === 0 ? "#444" : "#2a2a2a"} strokeWidth={z === 0 ? 1.5 : 0.8} />
      ))}
      {/* Horizontal grid */}
      {vertTicks.map(v => (
        <line key={v} x1={DM.l} x2={DM.l + PLOT_W} y1={vertFn(v)} y2={vertFn(v)}
          stroke={v === 0 ? "#444" : "#2a2a2a"} strokeWidth={v === 0 ? 1.5 : 0.8} />
      ))}
      {/* Z-axis labels */}
      {[-1, 0, 2, 4, 6, 8].map(z => (
        <text key={z} x={wz2sx(z)} y={DM.t + PLOT_H + 16}
          textAnchor="middle" fill="#555" fontSize={9}>{z}</text>
      ))}
      {/* Vertical axis labels */}
      {(view === "top" ? [-4, -2, 0, 2, 4] : [-6, -4, -2, 0, 2, 4]).map(v => (
        <text key={v} x={DM.l - 6} y={vertFn(v) + 3.5}
          textAnchor="end" fill="#555" fontSize={9}>{v}</text>
      ))}
      {/* Axis name labels */}
      <text x={DM.l + PLOT_W / 2} y={DH - 4} textAnchor="middle" fill="#555" fontSize={9}>
        ← Z (depth: phone at 0, camera typically 2–6) →
      </text>
      <text
        x={10} y={DM.t + PLOT_H / 2}
        textAnchor="middle" fill="#555" fontSize={9}
        transform={`rotate(-90, 10, ${DM.t + PLOT_H / 2})`}
      >
        {view === "top" ? "X" : "Y (up/down)"}
      </text>
    </g>
  );
}

// ─── Phone shape ──────────────────────────────────────────────────────────────
function PhoneShape({ view }: { view: "top" | "side" }) {
  // Give phone body minimum visible depth in Z (PD is tiny — 0.08 units)
  const zLeft  = wz2sx(-PD / 2);
  const zRight = wz2sx( PD / 2);
  const minW   = Math.max(zRight - zLeft, 8);
  const zCenterSx = (zLeft + zRight) / 2;

  if (view === "top") {
    const top    = td_wx2sy( PW / 2);
    const bottom = td_wx2sy(-PW / 2);
    return (
      <g>
        <rect x={zCenterSx - minW / 2} y={top} width={minW} height={bottom - top}
          fill="#2a2a2a" stroke="#555" strokeWidth={1} rx={1} />
        {/* Screen face indicator (front, +Z side) */}
        <line x1={zCenterSx + minW / 2} x2={zCenterSx + minW / 2}
          y1={top} y2={bottom} stroke="#0ea5e9" strokeWidth={2.5} />
        <text x={zCenterSx + minW / 2 + 5} y={(top + bottom) / 2 + 3}
          fill="#0ea5e9" fontSize={8}>screen</text>
      </g>
    );
  }
  // Side view
  const top    = sd_wy2sy( PH / 2);
  const bottom = sd_wy2sy(-PH / 2);
  return (
    <g>
      <rect x={zCenterSx - minW / 2} y={top} width={minW} height={bottom - top}
        fill="#2a2a2a" stroke="#555" strokeWidth={1} rx={1} />
      {/* Screen face */}
      <line x1={zCenterSx + minW / 2} x2={zCenterSx + minW / 2}
        y1={top} y2={bottom} stroke="#0ea5e9" strokeWidth={2.5} />
      <text x={zCenterSx + minW / 2 + 5} y={(top + bottom) / 2 + 3}
        fill="#0ea5e9" fontSize={8}>screen</text>
    </g>
  );
}

// ─── Diagram SVG ─────────────────────────────────────────────────────────────
interface DiagramProps {
  view:       "top" | "side";
  keyframes:  CamKeyframe[];
  selIdx:     number;
  onDragStart:(dot: "cam" | "look") => void;
  onMove:     (sx: number, sy: number) => void;
  onDragEnd:  () => void;
}

const Diagram: React.FC<DiagramProps> = ({ view, keyframes, selIdx, onDragStart, onMove, onDragEnd }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  const svgCoords = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return [0, 0];
    return [e.clientX - rect.left, e.clientY - rect.top];
  }, []);

  const camSX = (kf: CamKeyframe) => wz2sx(kf.pz);
  const camSY = (kf: CamKeyframe) => view === "top" ? td_wx2sy(kf.px) : sd_wy2sy(kf.py);
  const latSX = (kf: CamKeyframe) => wz2sx(kf.lz);
  const latSY = (kf: CamKeyframe) => view === "top" ? td_wx2sy(kf.lx) : sd_wy2sy(kf.ly);
  const selKf = keyframes[selIdx];

  // Vertical fov in side view; horizontal fov (approx 9/16 ratio) in top view
  const displayFov = view === "side"
    ? selKf.fov
    : 2 * (Math.atan(Math.tan((selKf.fov / 2) * Math.PI / 180) * (9 / 16)) * 180 / Math.PI);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {view === "top" ? "🐦 Bird's-Eye  (X–Z plane)" : "↕ Side Profile  (Y–Z plane)"}
      </div>
      <svg
        ref={svgRef}
        width={DW} height={DH}
        style={{ background: "#111", borderRadius: 6, border: "1px solid #2a2a2a", cursor: "crosshair", display: "block" }}
        onMouseMove={(e) => {
          if (!isDragging.current) return;
          const [sx, sy] = svgCoords(e);
          onMove(sx, sy);
        }}
        onMouseUp={() => { isDragging.current = false; onDragEnd(); }}
        onMouseLeave={() => { isDragging.current = false; onDragEnd(); }}
      >
        <GridLines view={view} />
        <PhoneShape view={view} />

        {/* FOV cone for selected keyframe */}
        <polygon
          points={fovPoly(camSX(selKf), camSY(selKf), latSX(selKf), latSY(selKf), displayFov)}
          fill="rgba(14,165,233,0.08)"
          stroke="rgba(14,165,233,0.3)"
          strokeWidth={1}
        />

        {/* Camera travel path */}
        {keyframes.length > 1 && (
          <polyline
            points={keyframes.map(kf => `${camSX(kf)},${camSY(kf)}`).join(" ")}
            fill="none" stroke="#0ea5e934" strokeWidth={1.5} strokeDasharray="4 3"
          />
        )}
        {/* LookAt travel path */}
        {keyframes.length > 1 && (
          <polyline
            points={keyframes.map(kf => `${latSX(kf)},${latSY(kf)}`).join(" ")}
            fill="none" stroke="#f59e0b34" strokeWidth={1.5} strokeDasharray="4 3"
          />
        )}

        {/* Direction line: camera → lookAt */}
        <line
          x1={camSX(selKf)} y1={camSY(selKf)}
          x2={latSX(selKf)} y2={latSY(selKf)}
          stroke="#0ea5e966" strokeWidth={1} strokeDasharray="3 3"
        />

        {/* All keyframe dots (non-selected, dimmed) */}
        {keyframes.map((kf, i) => i === selIdx ? null : (
          <g key={i} opacity={0.35}>
            <circle cx={camSX(kf)} cy={camSY(kf)} r={5} fill="#0ea5e9" />
            <rect x={latSX(kf) - 4} y={latSY(kf) - 4} width={8} height={8}
              fill="#f59e0b" transform={`rotate(45,${latSX(kf)},${latSY(kf)})`} />
          </g>
        ))}

        {/* Selected keyframe — camera dot (draggable circle) */}
        <circle
          cx={camSX(selKf)} cy={camSY(selKf)} r={8}
          fill="#0ea5e9" stroke="#fff" strokeWidth={1.5}
          style={{ cursor: "grab" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            isDragging.current = true;
            onDragStart("cam");
          }}
        />
        <text x={camSX(selKf) + 12} y={camSY(selKf) + 4} fill="#0ea5e9" fontSize={9} fontWeight={700}>
          CAM f{selKf.frame}
        </text>

        {/* Selected keyframe — lookAt dot (draggable diamond) */}
        <rect
          x={latSX(selKf) - 6} y={latSY(selKf) - 6} width={12} height={12}
          fill="#f59e0b" stroke="#fff" strokeWidth={1.5}
          transform={`rotate(45,${latSX(selKf)},${latSY(selKf)})`}
          style={{ cursor: "grab" }}
          onMouseDown={(e) => {
            e.stopPropagation();
            isDragging.current = true;
            onDragStart("look");
          }}
        />
        <text x={latSX(selKf) + 12} y={latSY(selKf) + 4} fill="#f59e0b" fontSize={9} fontWeight={700}>
          LOOK
        </text>
      </svg>
      <div style={{ fontSize: 9, color: "#444", display: "flex", gap: 16 }}>
        <span><span style={{ color: "#0ea5e9" }}>●</span> Camera (drag)</span>
        <span><span style={{ color: "#f59e0b" }}>◆</span> LookAt (drag)</span>
        <span><span style={{ color: "#0ea5e966" }}>---</span> FOV cone</span>
      </div>
    </div>
  );
};

// ─── Numeric slider row ───────────────────────────────────────────────────────
const SliderRow: React.FC<{
  label: string; value: number;
  min: number; max: number; step: number;
  color?: string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, color = "#ccc", onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, height: 22 }}>
    <span style={{ width: 20, fontSize: 10, color: "#888", textAlign: "right" }}>{label}</span>
    <input
      type="range" min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      style={{ flex: 1, accentColor: color, cursor: "pointer" }}
    />
    <input
      type="number" min={min} max={max} step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      style={{
        width: 52, padding: "2px 4px", background: "#1a1a1a",
        border: "1px solid #333", borderRadius: 3,
        color: "#ddd", fontSize: 11, textAlign: "right",
      }}
    />
  </div>
);

// ─── History reducer ──────────────────────────────────────────────────────────
interface HistoryState { stack: CamKeyframe[][]; idx: number }
type HistoryAction =
  | { type: "commit"; kfs: CamKeyframe[] }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "reset"; kfs: CamKeyframe[] };  // scene switch — clears stack

function histReducer(s: HistoryState, a: HistoryAction): HistoryState {
  switch (a.type) {
    case "commit": {
      const newStack = [...s.stack.slice(0, s.idx + 1), a.kfs].slice(-80);
      return { stack: newStack, idx: newStack.length - 1 };
    }
    case "undo":  return s.idx > 0 ? { ...s, idx: s.idx - 1 } : s;
    case "redo":  return s.idx < s.stack.length - 1 ? { ...s, idx: s.idx + 1 } : s;
    case "reset": return { stack: [a.kfs], idx: 0 };
    default:      return s;
  }
}

// ─── Timeline strip ───────────────────────────────────────────────────────────
const TimelineStrip: React.FC<{
  keyframes: CamKeyframe[];
  selIdx:    number;
  frameMin:  number;
  frameMax:  number;
  fps:       number;
  color:     string;
  onSelect:  (i: number) => void;
}> = ({ keyframes, selIdx, frameMin, frameMax, fps, color, onSelect }) => {
  const W      = DW;          // match diagram width
  const H      = 44;
  const ML     = DM.l;
  const MR     = DM.r;
  const plotW  = W - ML - MR;
  const range  = Math.max(1, frameMax - frameMin);
  const dur    = (range / fps).toFixed(1);
  const fx2sx  = (f: number) => ML + ((Math.max(frameMin, Math.min(frameMax, f)) - frameMin) / range) * plotW;
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  return (
    <svg width={W} height={H} style={{ display: "block", flexShrink: 0 }}>
      {/* Track */}
      <rect x={ML} y={H / 2 - 2} width={plotW} height={4} rx={2} fill="#252525" />

      {/* Connector lines between adjacent KFs */}
      {sorted.map((kf, i) => {
        if (i === 0) return null;
        return (
          <line key={i}
            x1={fx2sx(sorted[i - 1].frame)} y1={H / 2}
            x2={fx2sx(kf.frame)}             y2={H / 2}
            stroke={color + "55"} strokeWidth={2}
          />
        );
      })}

      {/* Range labels */}
      <text x={ML}          y={H - 4} fill="#444" fontSize={8} textAnchor="middle">f{frameMin}</text>
      <text x={ML + plotW}  y={H - 4} fill="#444" fontSize={8} textAnchor="middle">f{frameMax}</text>
      <text x={ML + plotW / 2} y={H - 4} fill="#555" fontSize={8} textAnchor="middle">{dur}s @ {fps}fps</text>

      {/* Keyframe dots */}
      {keyframes.map((kf, i) => {
        const sx      = fx2sx(kf.frame);
        const inRange = kf.frame >= frameMin && kf.frame <= frameMax;
        const active  = i === selIdx;
        return (
          <g key={i} onClick={() => onSelect(i)} style={{ cursor: "pointer" }}>
            {/* Hit area */}
            <circle cx={sx} cy={H / 2} r={10} fill="transparent" />
            <circle cx={sx} cy={H / 2} r={5}
              fill={active ? color : "#1e1e1e"}
              stroke={inRange ? color : "#ef4444"} strokeWidth={active ? 2 : 1.5}
            />
            <text x={sx} y={H / 2 - 8} fill={active ? color : "#555"} fontSize={8} textAnchor="middle">
              f{kf.frame}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const CameraPrototyper: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [hist, dispatch] = useReducer(histReducer, { stack: [DEFAULTS], idx: 0 });
  const [selIdx, setSelIdx]       = useState(0);
  const [copied, setCopied]       = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showKeys, setShowKeys]   = useState(false);
  const [selSceneId, setSelSceneId] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

  // Per-scene keyframe storage, pre-loaded from localStorage on mount
  const [savedSceneKfs, setSavedSceneKfs] = useState<Record<string, CamKeyframe[]>>(() => {
    const out: Record<string, CamKeyframe[]> = {};
    SCENE_DEFS.forEach(s => {
      try {
        const raw = localStorage.getItem(`cam-proto:${s.id}`);
        if (raw) out[s.id] = JSON.parse(raw) as CamKeyframe[];
      } catch { /* ignore corrupt data */ }
    });
    return out;
  });

  // Derived scene bounds (null scene = free mode, no constraints)
  const sceneDef = selSceneId ? (SCENE_DEFS.find(s => s.id === selSceneId) ?? null) : null;
  const frameMin = sceneDef?.from ?? 0;
  const frameMax = sceneDef?.to   ?? 3600;
  const sceneFps = sceneDef?.fps  ?? 30;

  // During drag we stage keyframes here so we don't flood the undo stack
  const [stagingKfs, setStagingKfs]  = useState<CamKeyframe[] | null>(null);
  const isDraggingRef = useRef(false);
  const dragTarget    = useRef<DragTarget>(null);

  // Always display staging while dragging, otherwise latest history snapshot
  const keyframes = stagingKfs ?? hist.stack[hist.idx];
  const sorted    = [...keyframes].sort((a, b) => a.frame - b.frame);
  const selKf     = keyframes[Math.min(selIdx, keyframes.length - 1)];

  // ── Auto-save current keyframes to localStorage whenever they change ────────
  useEffect(() => {
    if (!selSceneId) return;
    const kfs = hist.stack[hist.idx];
    try {
      localStorage.setItem(`cam-proto:${selSceneId}`, JSON.stringify(kfs));
      setSavedSceneKfs(prev => ({ ...prev, [selSceneId]: kfs }));
      setLastSavedAt(Date.now());
    } catch { /* storage full or unavailable */ }
  }, [hist, selSceneId]);

  // ── Scene switcher: save current → load saved / derive continuity ──────────
  // Not useCallback intentionally — needs fresh closure on every call
  const switchScene = (id: string | null) => {
    // 1. Persist current scene before leaving
    if (selSceneId) {
      const kfs = hist.stack[hist.idx];
      try { localStorage.setItem(`cam-proto:${selSceneId}`, JSON.stringify(kfs)); } catch { /* ignore */ }
      setSavedSceneKfs(prev => ({ ...prev, [selSceneId]: kfs }));
    }

    setStagingKfs(null);
    setSelSceneId(id);
    setSelIdx(0);

    if (!id) { dispatch({ type: "reset", kfs: DEFAULTS }); return; }

    const newDef = SCENE_DEFS.find(s => s.id === id)!;

    // 2. Prefer previously saved keyframes for this scene
    let kfs: CamKeyframe[] | null = null;
    try {
      const raw = localStorage.getItem(`cam-proto:${id}`);
      if (raw) kfs = JSON.parse(raw) as CamKeyframe[];
    } catch { /* ignore */ }

    // 3. No saved data — derive first keyframe from the end of the preceding scene
    if (!kfs) {
      const prevScene = SCENE_DEFS.find(
        s => s.compId === newDef.compId && s.to === newDef.from,
      );
      if (prevScene) {
        // Check in-memory saved state first, then localStorage
        const prevKfs = savedSceneKfs[prevScene.id] ?? (() => {
          try {
            const raw = localStorage.getItem(`cam-proto:${prevScene.id}`);
            return raw ? JSON.parse(raw) as CamKeyframe[] : null;
          } catch { return null; }
        })();
        if (prevKfs && prevKfs.length > 0) {
          const lastKf = [...prevKfs].sort((a, b) => a.frame - b.frame).at(-1)!;
          // Start the new scene from the exact camera state where the prev scene left off
          kfs = [{ ...lastKf, frame: newDef.from }];
        }
      }
    }

    // 4. Fall back to scene defaults
    dispatch({ type: "reset", kfs: kfs ?? newDef.defaults });
  };

  // ── Commit helpers ─────────────────────────────────────────────────────────
  const commit = useCallback((kfs: CamKeyframe[]) => dispatch({ type: "commit", kfs }), []);

  const upd = useCallback((patch: Partial<CamKeyframe>) => {
    const p = { ...patch };
    // Clamp frame value to scene range when a scene is active
    if (sceneDef && "frame" in p && p.frame !== undefined) {
      p.frame = Math.max(sceneDef.from, Math.min(sceneDef.to, p.frame));
    }
    const next = keyframes.map((k, i) => i === selIdx ? { ...k, ...p } : k);
    commit(next);
  }, [keyframes, selIdx, commit, sceneDef]);

  // ── Drag: update staging only; commit once on mouse-up ────────────────────
  const handleDragStart = useCallback((dot: "cam" | "look", view: "top" | "side") => {
    isDraggingRef.current = true;
    dragTarget.current    = { dot, view };
    setStagingKfs([...hist.stack[hist.idx]]);
  }, [hist]);

  const handleMove = useCallback((view: "top" | "side", sx: number, sy: number) => {
    if (!isDraggingRef.current || !dragTarget.current || dragTarget.current.view !== view) return;
    const wz     = r2(sx2wz(sx));
    // Capture before the async setStagingKfs callback — dragTarget.current can be
    // nulled by handleDragEnd between now and when the updater runs.
    const target = dragTarget.current;
    setStagingKfs(prev => {
      if (!prev || !target) return prev;
      const si = Math.min(selIdx, prev.length - 1);
      return prev.map((k, i) => {
        if (i !== si) return k;
        if (target.dot === "cam") {
          return view === "top"
            ? { ...k, pz: wz, px: r2(td_sy2wx(sy)) }
            : { ...k, pz: wz, py: r2(sd_sy2wy(sy)) };
        } else {
          return view === "top"
            ? { ...k, lz: wz, lx: r2(td_sy2wx(sy)) }
            : { ...k, lz: wz, ly: r2(sd_sy2wy(sy)) };
        }
      });
    });
  }, [selIdx]);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    dragTarget.current    = null;
    setStagingKfs(prev => {
      if (prev) commit(prev);
      return null;
    });
  }, [commit]);

  // ── Add / remove keyframes ─────────────────────────────────────────────────
  const addKeyframe = useCallback(() => {
    const last    = [...keyframes].sort((a, b) => a.frame - b.frame).at(-1)!;
    const rawFrame = last.frame + 30;
    // Clamp new keyframe frame into scene range (or just bump by 60 in free mode)
    const frame   = sceneDef
      ? Math.max(sceneDef.from, Math.min(sceneDef.to, rawFrame))
      : rawFrame;
    const next = [...keyframes, { ...last, frame }];
    commit(next);
    setSelIdx(next.length - 1);
  }, [keyframes, commit, sceneDef]);

  const removeKeyframe = useCallback((i: number) => {
    if (keyframes.length <= 1) return;
    commit(keyframes.filter((_, j) => j !== i));
    setSelIdx(s => Math.max(0, s >= i ? s - 1 : s));
  }, [keyframes, commit]);

  // ── Copy code ──────────────────────────────────────────────────────────────
  const copyCode = useCallback(() => {
    navigator.clipboard.writeText(genCode(sorted)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [sorted]);

  const copyAllScenes = useCallback(() => {
    const compId = sceneDef?.compId;
    if (!compId) return;
    const compLabel = COMP_LABELS[compId] ?? compId;
    const text = genCodeForComp(compId, compLabel, savedSceneKfs);
    navigator.clipboard.writeText(text).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2500);
    });
  }, [sceneDef, savedSceneKfs]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const inInput = () =>
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement;

    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Undo / Redo (always active)
      if (ctrl && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "undo" });
        setStagingKfs(null);
        return;
      }
      if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        dispatch({ type: "redo" });
        return;
      }
      // Copy code
      if (ctrl && e.key === "c" && !inInput()) {
        e.preventDefault();
        navigator.clipboard.writeText(genCode(sorted)).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return;
      }

      // Close
      if (e.key === "Escape") { onClose(); return; }

      // Shortcuts that must not fire while typing in an input
      if (inInput()) return;

      // Cycle keyframes
      if (e.key === "Tab") {
        e.preventDefault();
        setSelIdx(i => (i + (e.shiftKey ? -1 + keyframes.length : 1)) % keyframes.length);
        return;
      }

      // Delete selected keyframe
      if (e.key === "Delete" || e.key === "Backspace") {
        removeKeyframe(selIdx);
        return;
      }

      // Add keyframe
      if (e.key === "+" || e.key === "=") { addKeyframe(); return; }

      // Jump to keyframe by number key
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= keyframes.length) {
        setSelIdx(num - 1);
        return;
      }

      // Arrow keys — nudge camera position (hold Alt to nudge lookAt instead)
      const step = e.shiftKey ? 0.5 : 0.1;
      const alt  = e.altKey;
      if (e.key === "ArrowUp")    { e.preventDefault(); upd(alt ? { ly: r2(selKf.ly + step) } : { py: r2(selKf.py + step) }); }
      if (e.key === "ArrowDown")  { e.preventDefault(); upd(alt ? { ly: r2(selKf.ly - step) } : { py: r2(selKf.py - step) }); }
      if (e.key === "ArrowRight") { e.preventDefault(); upd(alt ? { lz: r2(selKf.lz + step) } : { pz: r2(selKf.pz + step) }); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); upd(alt ? { lz: r2(selKf.lz - step) } : { pz: r2(selKf.pz - step) }); }
      // [ / ] to nudge FOV
      if (e.key === "[") upd({ fov: Math.max(15, selKf.fov - (e.shiftKey ? 5 : 1)) });
      if (e.key === "]") upd({ fov: Math.min(90, selKf.fov + (e.shiftKey ? 5 : 1)) });
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, onClose, selIdx, keyframes.length, selKf, upd, removeKeyframe, addKeyframe, sorted, switchScene]);

  const canUndo = hist.idx > 0;
  const canRedo = hist.idx < hist.stack.length - 1;
  const code    = genCode(sorted);

  // ── Styles ─────────────────────────────────────────────────────────────────
  const S = {
    overlay: {
      position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.7)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
    },
    dialog: {
      background: "#161616", border: "1px solid #2a2a2a", borderRadius: 10,
      width: "min(98vw, 1140px)", maxHeight: "92vh",
      display: "flex", flexDirection: "column" as const,
      overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
    },
    header: {
      padding: "12px 20px", borderBottom: "1px solid #222",
      display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
    },
    body: { display: "flex", flex: 1, overflow: "hidden" },
    leftPanel: {
      padding: 16, display: "flex", flexDirection: "column" as const,
      gap: 14, overflowY: "auto" as const, flexShrink: 0,
    },
    rightPanel: {
      flex: 1, borderLeft: "1px solid #222", padding: "14px 16px",
      display: "flex", flexDirection: "column" as const, gap: 12, overflow: "hidden",
    },
    section: {
      background: "#1b1b1b", border: "1px solid #252525",
      borderRadius: 6, padding: "10px 12px",
    },
    sectionTitle: {
      fontSize: 10, color: "#666", fontWeight: 700,
      textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8,
    },
    kfChip: (active: boolean) => ({
      padding: "4px 10px", borderRadius: 4, fontSize: 11, cursor: "pointer",
      border: active ? "1px solid #0ea5e9" : "1px solid #2a2a2a",
      background: active ? "#0ea5e918" : "#1a1a1a",
      color: active ? "#0ea5e9" : "#999", userSelect: "none" as const,
    }),
    addBtn: {
      padding: "4px 8px", borderRadius: 4, fontSize: 11, cursor: "pointer",
      border: "1px solid #333", background: "#1a1a1a", color: "#666",
    },
    delBtn: {
      padding: "2px 6px", borderRadius: 3, fontSize: 10, cursor: "pointer",
      border: "1px solid #2a2a2a", background: "transparent", color: "#555", marginLeft: 4,
    },
    histBtn: (enabled: boolean) => ({
      padding: "3px 8px", borderRadius: 4, fontSize: 11, cursor: enabled ? "pointer" : "default",
      border: "1px solid #2a2a2a", background: "#1a1a1a",
      color: enabled ? "#aaa" : "#3a3a3a", userSelect: "none" as const,
    } as React.CSSProperties),
  };

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.dialog}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={S.header}>
          <span style={{ fontSize: 16 }}>🎥</span>
          <div>
            <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 14 }}>Camera Prototyper</div>
            <div style={{ fontSize: 10, color: "#555", marginTop: 1 }}>Drag dots · Arrow keys nudge · Ctrl+Z/Y undo/redo</div>
          </div>
          <div style={{ flex: 1 }} />
          {/* Undo / Redo */}
          <button
            onClick={() => dispatch({ type: "undo" })}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={S.histBtn(canUndo)}
          >↩ Undo</button>
          <button
            onClick={() => dispatch({ type: "redo" })}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            style={S.histBtn(canRedo)}
          >↪ Redo</button>
          <span style={{ fontSize: 9, color: "#444", minWidth: 60, textAlign: "center" }}>
            {hist.idx + 1} / {hist.stack.length}
          </span>

          {/* Copy All Scenes — only shown when a composition is active */}
          {sceneDef && (
            <button
              onClick={copyAllScenes}
              title={`Copy full CameraRig for all scenes in "${COMP_LABELS[sceneDef.compId]}"`}
              style={{
                padding: "3px 10px", fontSize: 11, borderRadius: 4, cursor: "pointer",
                border: copiedAll ? "1px solid #10b981" : "1px solid #f59e0b44",
                background: copiedAll ? "#10b98118" : "#f59e0b08",
                color: copiedAll ? "#10b981" : "#f59e0b",
              }}
            >
              {copiedAll ? "✓ Copied!" : "⎘ Copy All Scenes"}
            </button>
          )}

          {/* Hotkey legend toggle */}
          <button
            onClick={() => setShowKeys(s => !s)}
            title="Show keyboard shortcuts"
            style={{ ...S.histBtn(true), borderColor: showKeys ? "#a78bfa44" : "#2a2a2a", color: showKeys ? "#a78bfa" : "#555" }}
          >⌨ Keys</button>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#555", fontSize: 18, cursor: "pointer", padding: "0 4px" }}>✕</button>
        </div>

        {/* ── Scene picker — two-level hierarchy ──────────────────────────── */}
        <div style={{
          borderBottom: "1px solid #222", flexShrink: 0,
          display: "flex", flexDirection: "column", gap: 0,
        }}>

          {/* Row 1: Composition */}
          <div style={{
            padding: "8px 20px",
            display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
            borderBottom: selSceneId ? "1px solid #1e1e1e" : "none",
          }}>
            <span style={{ fontSize: 10, color: "#444", width: 84, flexShrink: 0 }}>COMPOSITION</span>
            <button
              onClick={() => switchScene(null)}
              style={{
                padding: "3px 9px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                border: !selSceneId ? "1px solid #6366f1" : "1px solid #2a2a2a",
                background: !selSceneId ? "#6366f118" : "#1a1a1a",
                color: !selSceneId ? "#a5b4fc" : "#555",
              }}
              title="Free mode — no frame constraints"
            >Free</button>
            {COMP_IDS.map(cid => {
              const activeCid = selSceneId ? SCENE_DEFS.find(s => s.id === selSceneId)?.compId : null;
              const active = activeCid === cid;
              return (
                <button key={cid}
                  onClick={() => {
                    const first = SCENE_DEFS.find(s => s.compId === cid);
                    if (first) switchScene(first.id);
                  }}
                  style={{
                    padding: "3px 9px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                    border: active ? "1px solid #0ea5e9" : "1px solid #2a2a2a",
                    background: active ? "#0ea5e918" : "#1a1a1a",
                    color: active ? "#7dd3fc" : "#666",
                  }}
                >{COMP_LABELS[cid]}</button>
              );
            })}
          </div>

          {/* Row 2: Scene — only visible once a composition is chosen */}
          {selSceneId && (() => {
            const activeCid = SCENE_DEFS.find(s => s.id === selSceneId)?.compId;
            const seqs = SCENE_DEFS.filter(s => s.compId === activeCid);
            return (
              <div style={{
                padding: "8px 20px",
                display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
              }}>
                <span style={{ fontSize: 10, color: "#444", width: 84, flexShrink: 0 }}>SCENE</span>
                {seqs.map(s => (
                  <button key={s.id}
                    onClick={() => switchScene(s.id)}
                    style={{
                      padding: "3px 9px", borderRadius: 4, fontSize: 11, cursor: "pointer",
                      border: selSceneId === s.id ? `1px solid ${s.color}` : "1px solid #2a2a2a",
                      background: selSceneId === s.id ? s.color + "18" : "#1a1a1a",
                      color: selSceneId === s.id ? s.color : "#555",
                    }}
                  >{s.label}</button>
                ))}
                {/* Frame range badge + autosaved indicator */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                  {lastSavedAt && (
                    <span style={{ fontSize: 9, color: "#10b981", display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ fontSize: 7 }}>●</span> Autosaved
                    </span>
                  )}
                  {sceneDef && (
                    <span style={{
                      fontSize: 10, color: "#666",
                      background: "#1a1a1a", border: "1px solid #252525",
                      padding: "2px 8px", borderRadius: 4, fontFamily: "monospace",
                    }}>
                      f{sceneDef.from} → f{sceneDef.to}
                      &nbsp;·&nbsp;{((sceneDef.to - sceneDef.from) / sceneDef.fps).toFixed(1)}s
                      &nbsp;@&nbsp;{sceneDef.fps}fps
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ── Hotkey legend ───────────────────────────────────────────────── */}
        {showKeys && (
          <div style={{
            background: "#111", borderBottom: "1px solid #222",
            padding: "10px 20px", display: "flex", flexWrap: "wrap", gap: "8px 24px",
            flexShrink: 0,
          }}>
            {[
              ["Ctrl+Z",          "Undo"],
              ["Ctrl+Y / Ctrl+⇧Z","Redo"],
              ["Ctrl+C",          "Copy code"],
              ["↑ ↓ ← →",         "Nudge cam Y/Z  (+⇧ = ×5)"],
              ["Alt + ↑↓←→",      "Nudge lookAt Y/Z"],
              ["[ / ]",           "FOV −/+  (+⇧ = ±5°)"],
              ["Tab / ⇧Tab",      "Next / prev keyframe"],
              ["1–9",             "Jump to keyframe #"],
              ["Delete",          "Remove selected keyframe"],
              ["+ / =",           "Add keyframe"],
              ["Esc",             "Close"],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 10 }}>
                <code style={{
                  background: "#1e1e2e", border: "1px solid #333", borderRadius: 3,
                  padding: "1px 5px", color: "#a78bfa", fontFamily: "monospace", whiteSpace: "nowrap",
                }}>{key}</code>
                <span style={{ color: "#555" }}>{desc}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div style={S.body}>

          {/* Left: diagrams + timeline */}
          <div style={S.leftPanel}>
            <Diagram
              view="side"
              keyframes={keyframes}
              selIdx={selIdx}
              onDragStart={(dot) => handleDragStart(dot, "side")}
              onMove={(sx, sy) => handleMove("side", sx, sy)}
              onDragEnd={handleDragEnd}
            />
            <Diagram
              view="top"
              keyframes={keyframes}
              selIdx={selIdx}
              onDragStart={(dot) => handleDragStart(dot, "top")}
              onMove={(sx, sy) => handleMove("top", sx, sy)}
              onDragEnd={handleDragEnd}
            />
            {/* Timeline strip */}
            <div style={{
              background: "#1b1b1b", border: "1px solid #252525",
              borderRadius: 6, padding: "6px 10px",
            }}>
              <div style={{ fontSize: 9, color: "#555", marginBottom: 2 }}>
                TIMELINE {sceneDef ? `— ${sceneDef.compLabel}: ${sceneDef.label}` : "— Free mode"}
              </div>
              <TimelineStrip
                keyframes={keyframes}
                selIdx={selIdx}
                frameMin={frameMin}
                frameMax={frameMax === 3600 ? Math.max(...keyframes.map(k => k.frame)) + 30 : frameMax}
                fps={sceneFps}
                color={sceneDef?.color ?? "#6366f1"}
                onSelect={setSelIdx}
              />
            </div>
          </div>

          {/* Right: controls + code */}
          <div style={S.rightPanel}>

            {/* Keyframe selector */}
            <div style={S.section}>
              <div style={S.sectionTitle}>Keyframes</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                {keyframes.map((kf, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center" }}>
                    <span onClick={() => setSelIdx(i)} style={S.kfChip(i === selIdx)} title={`Press ${i + 1}`}>
                      f{kf.frame}
                    </span>
                    <button
                      onClick={() => removeKeyframe(i)}
                      style={S.delBtn}
                      disabled={keyframes.length <= 1}
                      title="Remove keyframe (Delete)"
                    >✕</button>
                  </div>
                ))}
                <button onClick={addKeyframe} style={S.addBtn} title="Add keyframe +30 frames (+)">+ Add</button>
              </div>
            </div>

            {/* Sliders for selected keyframe */}
            <div style={S.section}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={S.sectionTitle}>Keyframe f{selKf.frame} — values</div>
                <input
                  type="number"
                  min={frameMin} max={frameMax === 3600 ? 9999 : frameMax} step={1}
                  value={selKf.frame}
                  onChange={(e) => upd({ frame: parseInt(e.target.value) || 0 })}
                  title={sceneDef ? `Frame must be between ${sceneDef.from} and ${sceneDef.to}` : "Frame number"}
                  style={{
                    width: 60, padding: "2px 4px", background: "#1a1a1a",
                    border: (sceneDef && (selKf.frame < sceneDef.from || selKf.frame > sceneDef.to))
                      ? "1px solid #ef4444" : "1px solid #333",
                    borderRadius: 3, color: "#ddd", fontSize: 11, textAlign: "right",
                  }}
                />
              </div>

              <div style={{ fontSize: 10, color: "#555", marginBottom: 5 }}>Camera Position <span style={{ color: "#2a2a2a" }}>(↑↓ = py, ←→ = pz)</span></div>
              <SliderRow label="px" value={selKf.px} min={-5} max={5}  step={0.05} color="#0ea5e9" onChange={(v) => upd({ px: v })} />
              <SliderRow label="py" value={selKf.py} min={-8} max={5}  step={0.05} color="#0ea5e9" onChange={(v) => upd({ py: v })} />
              <SliderRow label="pz" value={selKf.pz} min={-1} max={10} step={0.05} color="#0ea5e9" onChange={(v) => upd({ pz: v })} />

              <div style={{ fontSize: 10, color: "#555", margin: "8px 0 5px" }}>LookAt Target <span style={{ color: "#2a2a2a" }}>(Alt+↑↓ = ly, Alt+←→ = lz)</span></div>
              <SliderRow label="lx" value={selKf.lx} min={-3} max={3}  step={0.05} color="#f59e0b" onChange={(v) => upd({ lx: v })} />
              <SliderRow label="ly" value={selKf.ly} min={-5} max={5}  step={0.05} color="#f59e0b" onChange={(v) => upd({ ly: v })} />
              <SliderRow label="lz" value={selKf.lz} min={-3} max={3}  step={0.05} color="#f59e0b" onChange={(v) => upd({ lz: v })} />

              <div style={{ fontSize: 10, color: "#555", margin: "8px 0 5px" }}>Camera Settings <span style={{ color: "#2a2a2a" }}>( [ / ] keys)</span></div>
              <SliderRow label="fov" value={selKf.fov} min={15} max={90} step={1} color="#a78bfa" onChange={(v) => upd({ fov: v })} />

              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, color: "#555", width: 56 }}>Easing in</span>
                <div style={{ display: "flex", gap: 4 }}>
                  {EASING_OPTS.map(e => (
                    <button
                      key={e}
                      onClick={() => upd({ easing: e })}
                      style={{
                        padding: "3px 7px", fontSize: 10, borderRadius: 3, cursor: "pointer",
                        border: selKf.easing === e ? "1px solid #a78bfa" : "1px solid #2a2a2a",
                        background: selKf.easing === e ? "#a78bfa18" : "#1a1a1a",
                        color: selKf.easing === e ? "#a78bfa" : "#666",
                      }}
                    >{EASING_LABELS[e]}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick summary of all keyframes */}
            <div style={{ ...S.section, flexShrink: 0 }}>
              <div style={S.sectionTitle}>Camera path summary</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {sorted.map((kf, i) => (
                  <div key={i} style={{ fontSize: 10, color: "#666", fontFamily: "monospace" }}>
                    <span style={{ color: "#888", marginRight: 6 }}>f{kf.frame}</span>
                    <span style={{ color: "#0ea5e9" }}>pos[{kf.px.toFixed(1)}, {kf.py.toFixed(1)}, {kf.pz.toFixed(1)}]</span>
                    <span style={{ color: "#555", margin: "0 4px" }}>→</span>
                    <span style={{ color: "#f59e0b" }}>look[{kf.lx.toFixed(1)}, {kf.ly.toFixed(1)}, {kf.lz.toFixed(1)}]</span>
                    <span style={{ color: "#555", marginLeft: 6 }}>fov={kf.fov}°</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Generated code */}
            <div style={{ ...S.section, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={S.sectionTitle}>Generated CameraRig()</div>
                <button
                  onClick={copyCode}
                  style={{
                    padding: "3px 10px", fontSize: 11, borderRadius: 4, cursor: "pointer",
                    border: copied ? "1px solid #10b981" : "1px solid #333",
                    background: copied ? "#10b98118" : "#1a1a1a",
                    color: copied ? "#10b981" : "#888",
                  }}
                  title="Copy to clipboard (Ctrl+C)"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              </div>
              <pre style={{
                flex: 1, overflowY: "auto", margin: 0,
                padding: "10px 12px", background: "#111", borderRadius: 4,
                fontSize: 10.5, lineHeight: 1.65, color: "#a3b4c8",
                fontFamily: "monospace", border: "1px solid #222",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {code}
              </pre>
              <div style={{ fontSize: 9, color: "#444", marginTop: 6 }}>
                Paste this CameraRig function into your composition. Requires: <code style={{ color: "#555" }}>cl, eo3/4/5, pr</code> easing helpers from the file header.
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
