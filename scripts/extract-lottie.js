/**
 * extract-lottie.js -- Lottie JSON to structured parameter manifest.
 *
 * Reads a Lottie JSON exported from AE via Bodymovin, walks every layer,
 * and extracts animation parameters into the L1-L5 taxonomy.
 * Output: extracted/<name>.params.json
 *
 * Usage:
 *   node scripts/extract-lottie.js <lottie.json> [template-name]
 */

const fs   = require("fs");
const path = require("path");

const ROOT          = path.join(__dirname, "..");
const EXTRACTED_DIR = path.join(ROOT, "extracted");

const KNOWN_EASINGS = [
  { name: "linear",         pts: [0, 0, 1, 1] },
  { name: "ease",           pts: [0.25, 0.1, 0.25, 1.0] },
  { name: "easeIn",         pts: [0.42, 0, 1, 1] },
  { name: "easeOut",        pts: [0, 0, 0.58, 1] },
  { name: "easeInOut",      pts: [0.42, 0, 0.58, 1] },
  { name: "easeOutCubic",   pts: [0.215, 0.61, 0.355, 1] },
  { name: "easeOutQuart",   pts: [0.165, 0.84, 0.44, 1] },
  { name: "easeOutQuint",   pts: [0.23, 1, 0.32, 1] },
  { name: "easeInCubic",    pts: [0.55, 0.055, 0.675, 0.19] },
  { name: "easeInOutCubic", pts: [0.645, 0.045, 0.355, 1] },
  { name: "snapIn",         pts: [0, 0, 0.2, 1] },
];

const LAYER_TYPES = {
  0: "precomp", 1: "solid", 2: "image", 3: "null",
  4: "shape", 5: "text", 6: "audio", 13: "camera",
};

const SPRING_PRESETS = {
  "PREMIUM_SPRING.hero":   { s: 90,  d: 22, m: 1.1  },
  "PREMIUM_SPRING.text":   { s: 120, d: 28, m: 0.7  },
  "PREMIUM_SPRING.ui":     { s: 110, d: 20, m: 0.9  },
  "PREMIUM_SPRING.bg":     { s: 60,  d: 30, m: 1.2  },
  "PREMIUM_SPRING.settle": { s: 88,  d: 18, m: 1.05 },
  "SPRING.gentle":         { s: 80,  d: 18, m: 1    },
  "SPRING.snappy":         { s: 100, d: 14, m: 0.8  },
  "SPRING.crisp":          { s: 160, d: 20, m: 0.6  },
  "SPRING.bouncy":         { s: 120, d: 10, m: 0.9  },
};

module.exports = { extract };

// ---- entry point ----
if (require.main === module) main();

function main() {
  const input = process.argv[2];
  if (!input) { console.error("Usage: node scripts/extract-lottie.js <lottie.json> [name]"); process.exit(1); }
  const abs = path.isAbsolute(input) ? input : path.join(process.cwd(), input);
  if (!fs.existsSync(abs)) { console.error("Not found: " + abs); process.exit(1); }
  const name = process.argv[3] || path.basename(abs, path.extname(abs));
  const manifest = extract(abs, name);
  fs.mkdirSync(EXTRACTED_DIR, { recursive: true });
  const out = path.join(EXTRACTED_DIR, name + ".params.json");
  fs.writeFileSync(out, JSON.stringify(manifest, null, 2), "utf8");
  printSummary(manifest, out);
  if (process.env.JSON_OUTPUT === "1") {
    process.stdout.write("[RESULT] " + JSON.stringify({ templateName: name, outputPath: out }) + "\n");
  }
}

function extract(absInput, templateName) {
  const lottie = JSON.parse(fs.readFileSync(absInput, "utf8"));
  const fps = lottie.fr || 30;
  const totalFrames = (lottie.op || 0) - (lottie.ip || 0);
  const w = lottie.w || 0, h = lottie.h || 0;
  const assets = lottie.assets || [];
  const fonts = (lottie.fonts && lottie.fonts.list) || [];

  const layers  = resolvePrecomps(lottie.layers || [], assets, fps, 0);
  const allFlat = flattenLayers(layers);
  const ep = collectEasingsAndSprings(layers);
  const colors = collectColors(layers);
  const textStyles = collectTextStyles(layers);
  const techniques = detectTechniques(allFlat);
  const scenes = buildScenes(layers, fps);

  let totalKfs = 0;
  for (const l of allFlat) {
    if (!l.transform) continue;
    for (const p of Object.values(l.transform)) {
      if (p.animated && p.keyframes) totalKfs += p.keyframes.length;
    }
  }

  const manifest = {
    templateName, sourceFile: path.basename(absInput),
    extractedAt: new Date().toISOString(), version: lottie.v || "unknown",
    meta: { fps, width: w, height: h, totalFrames,
      totalDuration: +(totalFrames / fps).toFixed(3),
      has3D: lottie.ddd === 1, layerCount: allFlat.length,
      fontCount: fonts.length, assetCount: assets.length },
    l1_physics: { easings: ep.easings, springs: ep.springs,
      staggerPatterns: techniques.filter(t => t.name === "staggered-entrance")
        .map(t => ({ avgDelayFrames: t.avgDelayFrames, count: t.count, layers: t.layers })) },
    l2_visual: { colors, textStyles,
      fonts: fonts.map(f => ({ family: f.fFamily, name: f.fName, style: f.fStyle, weight: f.fWeight })) },
    l3_composition: {
      dimensions: { width: w, height: h, aspect: w > 0 ? w + ":" + h : null },
      layers: allFlat.map(l => ({ name: l.name, type: l.type, inPoint: l.inPoint,
        outPoint: l.outPoint, parent: l.parent, is3D: l.is3D, depth: l.depth })),
      parentChildGroups: buildParentGroups(allFlat) },
    l4_temporal: { fps, totalFrames, totalDuration: +(totalFrames / fps).toFixed(3),
      scenes, keyframeDensity: { total: totalKfs, perSecond: +(totalKfs / (totalFrames / fps || 1)).toFixed(1) } },
    l5_techniques: techniques,
    detectedProfile: null,
    layerTree: layers,
  };
  manifest.detectedProfile = detectProfile(manifest);
  return manifest;
}

// ---- bezier helpers ----

function getBezier(kf) {
  if (!kf.o || !kf.i) return null;
  const v = k => Array.isArray(k) ? k[0] : k;
  const ox = v(kf.o.x), oy = v(kf.o.y), ix = v(kf.i.x), iy = v(kf.i.y);
  if (ox == null || oy == null || ix == null || iy == null) return null;
  return [ox, oy, ix, iy];
}

function classifyBezier(b) {
  if (!b) return { name: "linear", css: "linear" };
  let best = null, bestD = Infinity;
  for (const k of KNOWN_EASINGS) {
    const d = Math.sqrt(k.pts.reduce((s, v, i) => s + (v - b[i]) ** 2, 0));
    if (d < bestD) { bestD = d; best = k; }
  }
  if (bestD <= 0.25) return { name: best.name, css: best.name };
  return { name: "custom", css: "cubic-bezier(" + b.map(v => v.toFixed(3)).join(",") + ")", bezier: b };
}

function estimateSpring(b) {
  if (!b) return null;
  const [ox, oy, ix, iy] = b;
  const hasOver = iy > 1 || oy > 1;
  const overAmt = Math.max(0, iy - 1, oy - 1);
  const sharp = 1 - ox + oy;
  const stiffness = Math.min(250, Math.max(40, Math.round(60 + sharp * 100)));
  const damping = hasOver
    ? Math.min(35, Math.max(6, Math.round(22 - overAmt * 30)))
    : Math.min(35, Math.max(6, Math.round(18 + (1 - ix) * 15)));
  const mass = Math.min(1.5, Math.max(0.4, +(0.6 + (1 - iy) * 0.6).toFixed(2)));
  return { stiffness, damping, mass };
}

function matchPreset(sp) {
  if (!sp) return null;
  let best = null, bestD = Infinity;
  for (const [name, p] of Object.entries(SPRING_PRESETS)) {
    const d = Math.sqrt(((sp.stiffness - p.s) / 100) ** 2 + ((sp.damping - p.d) / 20) ** 2 + ((sp.mass - p.m)) ** 2);
    if (d < bestD) { bestD = d; best = name; }
  }
  return bestD < 0.8 ? best : null;
}

// ---- color helpers ----

function rgb2hex(r, g, b_) { const h = v => Math.round(v * 255).toString(16).padStart(2, "0"); return "#" + h(r) + h(g) + h(b_); }
function colorFromArr(a) { return (a && a.length >= 3) ? rgb2hex(a[0], a[1], a[2]) : null; }

// ---- property extraction ----

function extractProp(prop, fps) {
  if (!prop) return null;
  if (prop.a !== 1) return { animated: false, value: prop.k };
  const kfs = (prop.k || []).filter(k => k.t != null);
  if (!kfs.length) return { animated: false, value: prop.k };
  return { animated: true, keyframes: kfs.map(kf => {
    const e = { frame: kf.t, time: +(kf.t / fps).toFixed(3), value: kf.s };
    if (kf.h === 1) { e.hold = true; return e; }
    const b = getBezier(kf);
    if (b) { e.easing = classifyBezier(b); e.spring = estimateSpring(b); const p = matchPreset(e.spring); if (p) e.springPreset = p; }
    return e;
  }) };
}

function extractTransform(ks, fps) {
  if (!ks) return null;
  const r = {};
  for (const [label, key] of [["anchor","a"],["position","p"],["scale","s"],["rotation","r"],["opacity","o"],
    ["rotationX","rx"],["rotationY","ry"],["rotationZ","rz"],["skew","sk"],["skewAxis","sa"]]) {
    if (ks[key]) { const v = extractProp(ks[key], fps); if (v) r[label] = v; }
  }
  return Object.keys(r).length ? r : null;
}

function extractEffects(efs, fps) {
  if (!efs || !efs.length) return [];
  return efs.map(ef => {
    const r = { name: ef.nm || "unknown", matchName: ef.mn || null, type: ef.ty };
    if (ef.ef && ef.ef.length) r.params = ef.ef.map(p => ({ name: p.nm || "param", value: extractProp(p.v, fps) })).filter(p => p.value);
    return r;
  });
}

function extractText(layer) {
  if (!layer.t || !layer.t.d) return null;
  const r = {}, k = layer.t.d.k;
  if (k && Array.isArray(k) && k.length) {
    const doc = k[0].s || k[0];
    if (doc) {
      if (doc.t) r.text = doc.t; if (doc.f) r.font = doc.f; if (doc.s) r.fontSize = doc.s;
      if (doc.fc) r.fillColor = colorFromArr(doc.fc); if (doc.sc) r.strokeColor = colorFromArr(doc.sc);
      if (doc.sw) r.strokeWidth = doc.sw;
      if (doc.j != null) r.justification = ["left","right","center"][doc.j] || doc.j;
      if (doc.lh) r.lineHeight = doc.lh; if (doc.ls) r.tracking = doc.ls;
    }
  }
  if (layer.t.a && layer.t.a.length) r.animators = layer.t.a.map(a => ({ name: a.nm || "animator", properties: a.a ? Object.keys(a.a) : [] }));
  return Object.keys(r).length ? r : null;
}

function extractShapeColors(shapes) {
  const colors = [];
  if (!shapes) return colors;
  (function walk(items) {
    for (const it of items) {
      if (it.ty === "fl" && it.c) {
        const c = it.c.a === 1 ? (it.c.k && it.c.k[0] && it.c.k[0].s ? colorFromArr(it.c.k[0].s) : null) : colorFromArr(it.c.k);
        if (c) colors.push({ type: "fill", color: c, name: it.nm || null });
      }
      if (it.ty === "st" && it.c) {
        const c = it.c.a === 1 ? (it.c.k && it.c.k[0] && it.c.k[0].s ? colorFromArr(it.c.k[0].s) : null) : colorFromArr(it.c.k);
        if (c) colors.push({ type: "stroke", color: c, name: it.nm || null });
      }
      if (it.ty === "gf") colors.push({ type: "gradient", name: it.nm || null });
      if (it.it) walk(it.it);
    }
  })(shapes);
  return colors;
}

// ---- layer extraction ----

function extractLayer(layer, fps, depth) {
  const r = {
    index: layer.ind, name: layer.nm || ("Layer " + layer.ind),
    type: LAYER_TYPES[layer.ty] || ("type_" + layer.ty),
    inPoint: layer.ip, outPoint: layer.op,
    inTime: +(layer.ip / fps).toFixed(3), outTime: +(layer.op / fps).toFixed(3),
    durationFrames: layer.op - layer.ip, durationSec: +((layer.op - layer.ip) / fps).toFixed(3),
    parent: layer.parent || null, is3D: layer.ddd === 1, hidden: layer.hd === true, depth,
  };
  const tf = extractTransform(layer.ks, fps); if (tf) r.transform = tf;
  const fx = extractEffects(layer.ef, fps); if (fx.length) r.effects = fx;
  if (layer.ty === 5) { const t = extractText(layer); if (t) r.text = t; }
  if (layer.ty === 4 && layer.shapes) { const c = extractShapeColors(layer.shapes); if (c.length) r.colors = c; }
  if (layer.ty === 0 && layer.refId) r.refId = layer.refId;
  if (layer.ty === 1) { if (layer.sc) r.solidColor = layer.sc; if (layer.sw) r.solidWidth = layer.sw; if (layer.sh) r.solidHeight = layer.sh; }
  return r;
}

function resolvePrecomps(ll, assets, fps, depth) {
  return ll.map(layer => {
    const ex = extractLayer(layer, fps, depth);
    if (layer.ty === 0 && layer.refId) {
      const asset = assets.find(a => a.id === layer.refId);
      if (asset && asset.layers) ex.children = resolvePrecomps(asset.layers, assets, fps, depth + 1);
    }
    return ex;
  });
}

function flattenLayers(layers) {
  const flat = [];
  (function walk(list) { for (const l of list) { flat.push(l); if (l.children) walk(l.children); } })(layers);
  return flat;
}

// ---- collectors ----

function collectEasingsAndSprings(layers) {
  const easings = [], springs = [], seen = {};
  (function walk(list) {
    for (const layer of list) {
      if (layer.transform) for (const [pn, prop] of Object.entries(layer.transform)) {
        if (!prop.animated || !prop.keyframes) continue;
        for (const kf of prop.keyframes) {
          if (kf.easing) { const k = kf.easing.name + ":" + kf.easing.css; if (!seen[k]) { seen[k] = 1; easings.push({ name: kf.easing.name, css: kf.easing.css, source: layer.name + "." + pn }); } }
          if (kf.spring) springs.push({ ...kf.spring, preset: kf.springPreset || null, source: layer.name + "." + pn });
        }
      }
      if (layer.children) walk(layer.children);
    }
  })(layers);
  return { easings, springs };
}

function collectColors(layers) {
  const colors = [], seen = {};
  (function walk(list) {
    for (const l of list) {
      if (l.colors) for (const c of l.colors) if (c.color && !seen[c.color]) { seen[c.color] = 1; colors.push(c); }
      if (l.text && l.text.fillColor && !seen[l.text.fillColor]) { seen[l.text.fillColor] = 1; colors.push({ type: "textFill", color: l.text.fillColor, name: l.name }); }
      if (l.solidColor && !seen[l.solidColor]) { seen[l.solidColor] = 1; colors.push({ type: "solid", color: l.solidColor, name: l.name }); }
      if (l.children) walk(l.children);
    }
  })(layers);
  return colors;
}

function collectTextStyles(layers) {
  const styles = [];
  (function walk(list) { for (const l of list) { if (l.text) styles.push({ layerName: l.name, ...l.text, animators: undefined, hasAnimators: !!(l.text.animators && l.text.animators.length) }); if (l.children) walk(l.children); } })(layers);
  return styles;
}

function buildParentGroups(allFlat) {
  const groups = {};
  for (const l of allFlat) {
    if (l.parent != null) {
      const p = allFlat.find(pp => pp.index === l.parent);
      const pn = p ? p.name : ("index_" + l.parent);
      if (!groups[pn]) groups[pn] = [];
      groups[pn].push(l.name);
    }
  }
  return groups;
}

// ---- scene structure ----

function buildScenes(layers, fps) {
  const top = layers.filter(l => l.depth === 0 && !l.hidden && l.type !== "null" && l.type !== "audio").sort((a, b) => a.inPoint - b.inPoint);
  const scenes = []; let cur = null;
  for (const l of top) {
    if (!cur || l.inPoint >= cur.end - 2) { if (cur) scenes.push(cur); cur = { start: l.inPoint, end: l.outPoint, layers: [l.name] }; }
    else { cur.end = Math.max(cur.end, l.outPoint); cur.layers.push(l.name); }
  }
  if (cur) scenes.push(cur);
  return scenes.map((s, i) => ({ scene: i + 1, startFrame: s.start, endFrame: s.end, durationFrames: s.end - s.start,
    startTime: +(s.start / fps).toFixed(3), endTime: +(s.end / fps).toFixed(3), durationSec: +((s.end - s.start) / fps).toFixed(3), layers: s.layers }));
}

// ---- technique detection ----

function detectTechniques(layers) {
  const tech = [];
  for (const l of layers) {
    if (!l.transform) continue;
    const hasOp = l.transform.opacity && l.transform.opacity.animated;
    const hasSc = l.transform.scale && l.transform.scale.animated;
    const hasBlur = (l.effects || []).some(e => (e.matchName || "").includes("Gaussian Blur") || (e.name || "").toLowerCase().includes("blur"));
    if (hasOp && hasSc) tech.push({ name: hasBlur ? "blur-scale-reveal" : "scale-fade-reveal", layers: [l.name], confidence: hasBlur ? 0.9 : 0.7 });
  }
  // stagger
  const sorted = layers.filter(l => l.type !== "null" && l.type !== "camera" && !l.hidden).sort((a, b) => a.inPoint - b.inPoint);
  if (sorted.length > 0) {
    let grp = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].inPoint - sorted[i - 1].inPoint;
      if (gap > 0 && gap <= 15) grp.push(sorted[i]);
      else { if (grp.length >= 3) pushStagger(tech, grp); grp = [sorted[i]]; }
    }
    if (grp.length >= 3) pushStagger(tech, grp);
  }
  // 3D
  const cams = layers.filter(l => l.type === "camera");
  const has3D = layers.some(l => l.is3D);
  if (cams.length || has3D) tech.push({ name: "3d-camera-scene", cameraLayers: cams.map(l => l.name), has3DLayers: has3D, confidence: 0.95 });
  // parallax
  const posAnim = layers.filter(l => l.transform && l.transform.position && l.transform.position.animated && l.type !== "null" && l.type !== "camera");
  if (posAnim.length >= 2) tech.push({ name: "parallax-motion", layers: posAnim.map(l => l.name), count: posAnim.length, confidence: 0.6 });
  // text animators
  const txAnim = layers.filter(l => l.type === "text" && l.text && l.text.animators && l.text.animators.length);
  if (txAnim.length) tech.push({ name: "text-animator", layers: txAnim.map(l => l.name), count: txAnim.length, confidence: 0.85 });
  return tech;
}

function pushStagger(tech, grp) {
  const gaps = []; for (let i = 1; i < grp.length; i++) gaps.push(grp[i].inPoint - grp[i - 1].inPoint);
  tech.push({ name: "staggered-entrance", layers: grp.map(l => l.name), avgDelayFrames: +(gaps.reduce((s, v) => s + v, 0) / gaps.length).toFixed(1), count: grp.length, confidence: 0.8 });
}

// ---- profile detection ----

function detectProfile(m) {
  const sc = { "snappy-saas": 0, "luxury-slow": 0, "kinetic-typography": 0, "dark-tech": 0, "product-showcase": 0 };
  const sp = m.l1_physics.springs;
  const avgS = sp.length ? sp.reduce((s, v) => s + v.stiffness, 0) / sp.length : 100;
  const avgD = sp.length ? sp.reduce((s, v) => s + v.damping, 0) / sp.length : 18;
  if (avgS > 140) sc["snappy-saas"] += 3; if (avgD > 20) sc["snappy-saas"] += 2;
  if (avgS < 100) sc["luxury-slow"] += 3; if (avgD > 22) sc["luxury-slow"] += 2;
  const ll = m.l3_composition.layers;
  if (ll.filter(l => l.type === "text").length / (ll.length || 1) > 0.4) sc["kinetic-typography"] += 3;
  if (avgD < 15) sc["kinetic-typography"] += 2;
  if (m.l2_visual.colors.some(c => c.color && (c.color[1] <= "2"))) sc["dark-tech"] += 3;
  if (ll.filter(l => l.type === "image").length >= 2) sc["product-showcase"] += 3;
  if (m.l5_techniques.some(t => t.name === "3d-camera-scene")) sc["product-showcase"] += 2;
  const eoRatio = m.l1_physics.easings.filter(e => e.name.includes("Out")).length / (m.l1_physics.easings.length || 1);
  if (eoRatio > 0.5) { sc["snappy-saas"] += 1; sc["luxury-slow"] += 1; }
  const sorted = Object.entries(sc).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] === 0 ? null : { profile: sorted[0][0], score: sorted[0][1], all: Object.fromEntries(sorted) };
}

function printSummary(m, outPath) {
  console.log("\n  Extracting: " + m.sourceFile + " -> " + m.templateName);
  console.log("  FPS: " + m.meta.fps + " | Duration: " + m.meta.totalDuration + "s (" + m.meta.totalFrames + "f)");
  console.log("  Dimensions: " + m.meta.width + "x" + m.meta.height);
  console.log("  Layers: " + m.meta.layerCount + " | Scenes: " + m.l4_temporal.scenes.length);
  console.log("  Easings: " + m.l1_physics.easings.length + " | Springs: " + m.l1_physics.springs.length);
  console.log("  Colors: " + m.l2_visual.colors.length + " | Text: " + m.l2_visual.textStyles.length + " | Fonts: " + m.l2_visual.fonts.length);
  console.log("  Techniques: " + (m.l5_techniques.map(t => t.name).join(", ") || "none"));
  const dp = m.detectedProfile;
  console.log("  Profile: " + (dp ? dp.profile + " (score " + dp.score + ")" : "unknown"));
  console.log("\n  -> " + outPath + "\n");
}
