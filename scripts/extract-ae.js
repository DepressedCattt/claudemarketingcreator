/**
 * extract-ae.js -- Node.js wrapper for After Effects parameter extraction.
 *
 * Orchestrates the full pipeline:
 *   1. Launches After Effects with the .aep file
 *   2. Runs ae-extract.jsx inside AE to dump raw JSON
 *   3. Transforms the raw AE data into our L1-L5 parameter manifest
 *   4. Outputs extracted/<name>.params.json (same format as extract-lottie.js)
 *
 * Usage:
 *   node scripts/extract-ae.js <file.aep> [template-name]
 *   node scripts/extract-ae.js --from-raw <raw.ae-extract.json> [template-name]
 *
 * The --from-raw mode skips the AE launch and processes an existing raw extraction.
 * This is useful when you've already run ae-extract.jsx manually in AE.
 *
 * Environment:
 *   AE_PATH  -- path to afterfx.exe (auto-detected on Windows if not set)
 */

const fs    = require("fs");
const path  = require("path");
const { spawn } = require("child_process");

const ROOT          = path.join(__dirname, "..");
const EXTRACTED_DIR = path.join(ROOT, "extracted");
const JSX_SCRIPT    = path.join(__dirname, "ae-extract.jsx");

module.exports = { transformAeExtract };

if (require.main === module) main();

// ---- CLI ----

function main() {
  const args = process.argv.slice(2);

  if (args[0] === "--from-raw") {
    const rawPath = args[1];
    const name = args[2];
    if (!rawPath) { console.error("Usage: node scripts/extract-ae.js --from-raw <raw.json> [name]"); process.exit(1); }
    const abs = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath);
    if (!fs.existsSync(abs)) { console.error("Not found: " + abs); process.exit(1); }
    const raw = JSON.parse(fs.readFileSync(abs, "utf8"));
    const templateName = name || raw.mainComposition.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const manifest = transformAeExtract(raw, templateName);
    fs.mkdirSync(EXTRACTED_DIR, { recursive: true });
    const outPath = path.join(EXTRACTED_DIR, templateName + ".params.json");
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");
    printSummary(manifest, outPath);
    return;
  }

  const aepPath = args[0];
  const name = args[1];
  if (!aepPath) {
    console.error("Usage: node scripts/extract-ae.js <file.aep> [template-name]");
    console.error("       node scripts/extract-ae.js --from-raw <raw.json> [template-name]");
    process.exit(1);
  }

  const absAep = path.isAbsolute(aepPath) ? aepPath : path.join(process.cwd(), aepPath);
  if (!fs.existsSync(absAep)) { console.error("Not found: " + absAep); process.exit(1); }

  launchAeAndExtract(absAep, name);
}

// ---- AE Launch ----

function findAfterEffects() {
  if (process.env.AE_PATH) return process.env.AE_PATH;

  if (process.platform === "win32") {
    const base = "C:\\Program Files\\Adobe";
    if (fs.existsSync(base)) {
      const dirs = fs.readdirSync(base).filter(d => d.startsWith("Adobe After Effects"));
      dirs.sort().reverse();
      for (const dir of dirs) {
        const exe = path.join(base, dir, "Support Files", "AfterFX.exe");
        if (fs.existsSync(exe)) return exe;
      }
    }
  }

  if (process.platform === "darwin") {
    const appDir = "/Applications";
    const dirs = fs.readdirSync(appDir).filter(d => d.startsWith("Adobe After Effects"));
    dirs.sort().reverse();
    for (const dir of dirs) {
      const app = path.join(appDir, dir, "Adobe After Effects " + dir.replace("Adobe After Effects ", ""), "Contents", "MacOS", "After Effects");
      if (fs.existsSync(app)) return app;
    }
  }

  return null;
}

function launchAeAndExtract(aepPath, templateName) {
  const aePath = findAfterEffects();
  if (!aePath) {
    console.error("\nAfter Effects not found.");
    console.error("Set the AE_PATH environment variable to afterfx.exe location.");
    console.error('  set AE_PATH="C:\\Program Files\\Adobe\\Adobe After Effects 2025\\Support Files\\AfterFX.exe"');
    process.exit(1);
  }

  // Write config file so the JSX knows where to output
  const configPath = path.join(__dirname, "ae-extract-config.json");
  fs.writeFileSync(configPath, JSON.stringify({ outputDir: EXTRACTED_DIR.replace(/\\/g, "/") }), "utf8");

  console.log("\n  After Effects: " + aePath);
  console.log("  Project: " + aepPath);
  console.log("  Script: " + JSX_SCRIPT);
  console.log("\n  Launching After Effects...");
  console.log("  (AE will open, run the extraction script, then you can close it)");
  console.log("  Waiting for extraction output...\n");

  const proc = spawn(aePath, ["-project", aepPath, "-r", JSX_SCRIPT], {
    stdio: ["ignore", "pipe", "pipe"],
    detached: false,
  });

  proc.stdout.on("data", d => process.stdout.write("  [AE] " + d.toString()));
  proc.stderr.on("data", d => process.stderr.write("  [AE] " + d.toString()));

  proc.on("close", (code) => {
    // Clean up config
    try { fs.unlinkSync(configPath); } catch(e) {}

    if (code !== 0) {
      console.error("  After Effects exited with code " + code);
      // Don't exit -- check if the file was created anyway
    }

    // Look for the output file
    const extractedFiles = fs.existsSync(EXTRACTED_DIR)
      ? fs.readdirSync(EXTRACTED_DIR).filter(f => f.endsWith(".ae-extract.json"))
      : [];

    if (extractedFiles.length === 0) {
      console.error("\n  No extraction output found in " + EXTRACTED_DIR);
      console.error("  You may need to run ae-extract.jsx manually inside After Effects.");
      console.error("  Then use: node scripts/extract-ae.js --from-raw <output.json>");
      process.exit(1);
    }

    // Use the most recently modified file
    const latest = extractedFiles
      .map(f => ({ name: f, mtime: fs.statSync(path.join(EXTRACTED_DIR, f)).mtime.getTime() }))
      .sort((a, b) => b.mtime - a.mtime)[0];

    const rawPath = path.join(EXTRACTED_DIR, latest.name);
    console.log("  Found extraction: " + latest.name);

    const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
    const name = templateName || raw.mainComposition.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const manifest = transformAeExtract(raw, name);

    const outPath = path.join(EXTRACTED_DIR, name + ".params.json");
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), "utf8");
    printSummary(manifest, outPath);
  });
}

// ---- Transform AE raw extraction into L1-L5 manifest ----

function transformAeExtract(raw, templateName) {
  const mainCompName = raw.mainComposition;
  const mainComp = raw.compositions[mainCompName];
  if (!mainComp) throw new Error("Main composition not found: " + mainCompName);

  const fps = mainComp.fps;
  const totalFrames = mainComp.totalFrames;
  const layers = mainComp.layers;

  // Aggregate layers from ALL compositions (main + precomps)
  const allLayers = [];
  let totalLayerCount = 0;
  for (const [compName, compData] of Object.entries(raw.compositions)) {
    const cl = compData.layers || [];
    totalLayerCount += cl.length;
    for (const l of cl) {
      allLayers.push({ ...l, _compName: compName });
    }
  }

  // Collect data across ALL layers in all compositions
  const allEasings = [];
  const allSprings = [];
  const allColors = [];
  const allTextStyles = [];
  const allEffectNames = [];
  const allExpressions = [];
  const seenEasings = {};
  const seenColors = {};

  walkLayers(allLayers, function(layer) {
    // Collect effects
    if (layer.effects) {
      for (const ef of layer.effects) {
        allEffectNames.push({ name: ef.name, matchName: ef.matchName, layer: layer.name, enabled: ef.enabled });
      }
    }

    // Collect text styles
    if (layer.textDocument) {
      allTextStyles.push({ layerName: layer.name, ...layer.textDocument });
    }

    // Collect easings from transform keyframes
    collectEasingsFromGroup(layer.transform, layer.name, allEasings, allSprings, seenEasings, fps);

    // Collect expressions from transform
    collectExpressionsFromGroup(layer.transform, layer.name, allExpressions);

    // Also collect expressions from effects
    if (layer.effects) {
      for (const ef of layer.effects) {
        for (const p of (ef.params || [])) {
          collectExpressionsFromGroup(p, layer.name + "/" + ef.name, allExpressions);
        }
      }
    }
  });

  // Collect colors from all comp backgrounds
  for (const [compName, compData] of Object.entries(raw.compositions)) {
    if (compData.bgColor) {
      const hex = rgbToHex(compData.bgColor);
      if (hex && !seenColors[hex]) { seenColors[hex] = 1; allColors.push({ type: "compBg", color: hex, name: compName + " bg" }); }
    }
  }

  // Collect colors from text fills
  for (const ts of allTextStyles) {
    if (ts.fillColor) {
      const hex = rgbToHex(ts.fillColor);
      if (hex && !seenColors[hex]) { seenColors[hex] = 1; allColors.push({ type: "textFill", color: hex, name: ts.layerName }); }
    }
    if (ts.strokeColor) {
      const hex = rgbToHex(ts.strokeColor);
      if (hex && !seenColors[hex]) { seenColors[hex] = 1; allColors.push({ type: "textStroke", color: hex, name: ts.layerName }); }
    }
  }

  // Collect colors from shape layers by scanning effect/shape properties for color values
  walkLayers(allLayers, function(layer) {
    if (layer.shapeContent) collectColorsFromPropertyTree(layer.shapeContent, layer.name, allColors, seenColors);
    if (layer.effects) {
      for (const ef of layer.effects) {
        for (const p of (ef.params || [])) {
          collectColorsFromPropertyTree(p, layer.name + "/" + ef.name, allColors, seenColors);
        }
      }
    }
  });

  // Detect techniques across all layers
  const techniques = detectTechniques(allLayers, mainComp);

  // Build scenes from main comp layers
  const scenes = buildScenes(layers, fps);

  // Count keyframes across all compositions
  let totalKfs = 0;
  walkLayers(allLayers, function(layer) {
    totalKfs += countKeyframesInGroup(layer.transform);
    if (layer.effects) {
      for (const ef of layer.effects) {
        for (const p of (ef.params || [])) totalKfs += countKeyframesInTree(p);
      }
    }
  });

  // Build fonts list
  const fonts = [];
  const seenFonts = {};
  for (const ts of allTextStyles) {
    if (ts.font && !seenFonts[ts.font]) {
      seenFonts[ts.font] = 1;
      fonts.push({ family: ts.font, name: ts.font, style: "Regular", weight: 400 });
    }
  }

  const manifest = {
    templateName,
    sourceFile: raw.projectName || "unknown.aep",
    extractedAt: raw.extractedAt || new Date().toISOString(),
    extractionMethod: "extendscript",
    version: raw.extractorVersion || "1.0.0",

    meta: {
      fps,
      width: mainComp.width,
      height: mainComp.height,
      totalFrames,
      totalDuration: +(mainComp.duration).toFixed(3),
      has3D: allLayers.some(l => l.threeDLayer),
      layerCount: totalLayerCount,
      fontCount: fonts.length,
      assetCount: Object.keys(raw.compositions).length - 1,
      effectCount: allEffectNames.length,
      expressionCount: allExpressions.length,
    },

    l1_physics: {
      easings: allEasings,
      springs: allSprings,
      staggerPatterns: techniques.filter(t => t.name === "staggered-entrance")
        .map(t => ({ avgDelayFrames: t.avgDelayFrames, count: t.count, layers: t.layers })),
    },

    l2_visual: {
      colors: allColors,
      textStyles: allTextStyles.map(ts => ({
        layerName: ts.layerName, text: ts.text, font: ts.font,
        fontSize: ts.fontSize, fillColor: ts.fillColor ? rgbToHex(ts.fillColor) : null,
        tracking: ts.tracking, leading: ts.leading,
        justification: ts.justification, hasAnimators: false,
      })),
      fonts,
      effects: allEffectNames,
    },

    l3_composition: {
      dimensions: { width: mainComp.width, height: mainComp.height, aspect: mainComp.width + ":" + mainComp.height },
      layers: layers.map(l => ({
        name: l.name, type: l.type, inPoint: l.inFrame || 0, outPoint: l.outFrame || totalFrames,
        parent: l.parentIndex || null, is3D: l.threeDLayer || false, depth: 0,
        blendingMode: l.blendingMode || "normal",
        trackMatteType: l.trackMatteType || "none",
        motionBlur: l.motionBlur || false,
      })),
      parentChildGroups: buildParentGroups(layers),
    },

    l4_temporal: {
      fps,
      totalFrames,
      totalDuration: +(mainComp.duration).toFixed(3),
      scenes,
      keyframeDensity: { total: totalKfs, perSecond: +(totalKfs / (mainComp.duration || 1)).toFixed(1) },
    },

    l5_techniques: techniques,

    expressions: allExpressions,

    precompositions: Object.keys(raw.compositions).filter(k => k !== mainCompName).map(k => {
      const c = raw.compositions[k];
      return { name: k, width: c.width, height: c.height, fps: c.fps, duration: c.duration, layerCount: c.layers.length };
    }),

    detectedProfile: null,

    rawSource: "ae-extract",
  };

  manifest.detectedProfile = detectProfile(manifest);
  return manifest;
}

// ---- Utility functions ----

function walkLayers(layers, fn) {
  for (const l of layers) fn(l);
}

function rgbToHex(arr) {
  if (!arr || arr.length < 3) return null;
  const toHex = v => {
    const n = typeof v === "number" ? (v <= 1 ? Math.round(v * 255) : Math.round(v)) : 0;
    return n.toString(16).padStart(2, "0");
  };
  return "#" + toHex(arr[0]) + toHex(arr[1]) + toHex(arr[2]);
}

function collectEasingsFromGroup(group, layerName, easings, springs, seen, fps) {
  if (!group || !group.properties) return;
  for (const prop of group.properties) {
    if (prop.type === "property" && prop.keyframes && prop.keyframes.length > 0) {
      for (const kf of prop.keyframes) {
        if (kf.inEase && kf.outEase) {
          const easeKey = kf.inInterp + ":" + JSON.stringify(kf.inEase) + ":" + JSON.stringify(kf.outEase);
          const easingInfo = classifyAeEasing(kf);
          if (!seen[easingInfo.name + ":" + easingInfo.css]) {
            seen[easingInfo.name + ":" + easingInfo.css] = 1;
            easings.push({ name: easingInfo.name, css: easingInfo.css, source: layerName + "." + prop.matchName });
          }
          const springEst = estimateSpringFromAeEasing(kf);
          if (springEst) {
            springs.push({ ...springEst, source: layerName + "." + prop.matchName });
          }
        }
      }
    }
    if (prop.type === "group" && prop.properties) {
      collectEasingsFromGroup(prop, layerName, easings, springs, seen, fps);
    }
  }
}

function collectExpressionsFromGroup(group, layerName, expressions) {
  if (!group || !group.properties) return;
  for (const prop of group.properties) {
    if (prop.type === "property" && prop.expressionEnabled && prop.expression) {
      expressions.push({
        layer: layerName,
        property: prop.matchName,
        propertyName: prop.name,
        expression: prop.expression,
      });
    }
    if (prop.type === "group" && prop.properties) {
      collectExpressionsFromGroup(prop, layerName, expressions);
    }
  }
}

function collectColorsFromPropertyTree(node, sourceName, colors, seen) {
  if (!node) return;
  if (node.type === "property" && node.value && Array.isArray(node.value) && node.value.length >= 3 && node.value.length <= 4) {
    const allNormalized = node.value.every(v => typeof v === "number" && v >= 0 && v <= 1);
    if (allNormalized && (node.matchName || "").toLowerCase().includes("color") ||
        (node.name || "").toLowerCase().includes("color") ||
        (node.name || "").toLowerCase().includes("fill")) {
      const hex = rgbToHex(node.value);
      if (hex && !seen[hex]) { seen[hex] = 1; colors.push({ type: "shape", color: hex, name: sourceName }); }
    }
  }
  if (node.properties) {
    for (const p of node.properties) collectColorsFromPropertyTree(p, sourceName, colors, seen);
  }
  if (node.params) {
    for (const p of node.params) collectColorsFromPropertyTree(p, sourceName, colors, seen);
  }
}

function classifyAeEasing(kf) {
  if (kf.inInterp === "hold") return { name: "hold", css: "steps(1)" };
  if (kf.inInterp === "linear" && kf.outInterp === "linear") return { name: "linear", css: "linear" };

  // Use influence values to classify
  const inInfluence = kf.inEase && kf.inEase[0] ? kf.inEase[0].influence : 33.33;
  const outInfluence = kf.outEase && kf.outEase[0] ? kf.outEase[0].influence : 33.33;

  if (outInfluence > 70 && inInfluence < 30) return { name: "easeOut", css: "ease-out" };
  if (outInfluence < 30 && inInfluence > 70) return { name: "easeIn", css: "ease-in" };
  if (outInfluence > 50 && inInfluence > 50) return { name: "easeInOut", css: "ease-in-out" };
  if (outInfluence > 80) return { name: "easeOutStrong", css: "cubic-bezier(0.0,0.0,0.2,1.0)" };

  return {
    name: "custom",
    css: "ease (in:" + inInfluence.toFixed(0) + "% out:" + outInfluence.toFixed(0) + "%)",
    inInfluence, outInfluence
  };
}

function estimateSpringFromAeEasing(kf) {
  if (kf.inInterp === "hold" || (kf.inInterp === "linear" && kf.outInterp === "linear")) return null;

  const inInf = kf.inEase && kf.inEase[0] ? kf.inEase[0].influence : 33.33;
  const outInf = kf.outEase && kf.outEase[0] ? kf.outEase[0].influence : 33.33;
  const inSpd = kf.inEase && kf.inEase[0] ? Math.abs(kf.inEase[0].speed) : 0;
  const outSpd = kf.outEase && kf.outEase[0] ? Math.abs(kf.outEase[0].speed) : 0;

  // Higher out-influence + lower in-influence = more ease-out = higher stiffness
  const stiffness = Math.min(250, Math.max(40, Math.round(60 + (outInf / 100) * 140)));
  // Higher in-influence = more damping
  const damping = Math.min(35, Math.max(6, Math.round(10 + (inInf / 100) * 25)));
  // Speed relates to mass inversely
  const maxSpd = Math.max(inSpd, outSpd, 1);
  const mass = Math.min(1.5, Math.max(0.4, +(1.0 / (maxSpd / 500 + 1)).toFixed(2)));

  return { stiffness, damping, mass, preset: matchPreset({ stiffness, damping, mass }) };
}

function matchPreset(sp) {
  const presets = {
    "PREMIUM_SPRING.hero":   { s: 90,  d: 22, m: 1.1  },
    "PREMIUM_SPRING.text":   { s: 120, d: 28, m: 0.7  },
    "PREMIUM_SPRING.ui":     { s: 110, d: 20, m: 0.9  },
    "PREMIUM_SPRING.bg":     { s: 60,  d: 30, m: 1.2  },
    "SPRING.snappy":         { s: 100, d: 14, m: 0.8  },
    "SPRING.crisp":          { s: 160, d: 20, m: 0.6  },
    "SPRING.bouncy":         { s: 120, d: 10, m: 0.9  },
  };
  let best = null, bestD = Infinity;
  for (const [name, p] of Object.entries(presets)) {
    const d = Math.sqrt(((sp.stiffness - p.s) / 100) ** 2 + ((sp.damping - p.d) / 20) ** 2 + ((sp.mass - p.m)) ** 2);
    if (d < bestD) { bestD = d; best = name; }
  }
  return bestD < 0.8 ? best : null;
}

function countKeyframesInGroup(group) {
  if (!group || !group.properties) return 0;
  let count = 0;
  for (const p of group.properties) {
    if (p.type === "property" && p.numKeys) count += p.numKeys;
    if (p.type === "group") count += countKeyframesInGroup(p);
  }
  return count;
}

function countKeyframesInTree(node) {
  if (!node) return 0;
  let count = 0;
  if (node.type === "property" && node.numKeys) count += node.numKeys;
  if (node.properties) for (const p of node.properties) count += countKeyframesInTree(p);
  if (node.params) for (const p of node.params) count += countKeyframesInTree(p);
  return count;
}

function buildParentGroups(layers) {
  const groups = {};
  for (const l of layers) {
    if (l.parentIndex) {
      const parent = layers.find(p => p.index === l.parentIndex);
      const pn = parent ? parent.name : ("index_" + l.parentIndex);
      if (!groups[pn]) groups[pn] = [];
      groups[pn].push(l.name);
    }
  }
  return groups;
}

function buildScenes(layers, fps) {
  const visible = layers
    .filter(l => l.enabled && l.type !== "camera" && l.type !== "light")
    .sort((a, b) => (a.inFrame || 0) - (b.inFrame || 0));

  const scenes = [];
  let cur = null;
  for (const l of visible) {
    const inF = l.inFrame || 0;
    const outF = l.outFrame || 0;
    if (!cur || inF >= cur.end - 2) {
      if (cur) scenes.push(cur);
      cur = { start: inF, end: outF, layers: [l.name] };
    } else {
      cur.end = Math.max(cur.end, outF);
      cur.layers.push(l.name);
    }
  }
  if (cur) scenes.push(cur);

  return scenes.map((s, i) => ({
    scene: i + 1, startFrame: s.start, endFrame: s.end,
    durationFrames: s.end - s.start,
    startTime: +(s.start / fps).toFixed(3),
    endTime: +(s.end / fps).toFixed(3),
    durationSec: +((s.end - s.start) / fps).toFixed(3),
    layers: s.layers,
  }));
}

function detectTechniques(layers, comp) {
  const tech = [];

  // 3D camera
  const cams = layers.filter(l => l.type === "camera");
  const has3D = layers.some(l => l.threeDLayer);
  if (cams.length || has3D) {
    tech.push({ name: "3d-camera-scene", cameraLayers: cams.map(l => l.name), has3DLayers: has3D, confidence: 0.95 });
  }

  // Lights
  const lights = layers.filter(l => l.type === "light");
  if (lights.length) {
    tech.push({ name: "3d-lighting", lightLayers: lights.map(l => l.name), count: lights.length, confidence: 0.9 });
  }

  // Track mattes
  const mattes = layers.filter(l => l.trackMatteType && l.trackMatteType !== "none");
  if (mattes.length) {
    tech.push({ name: "track-mattes", layers: mattes.map(l => l.name), count: mattes.length, confidence: 0.9 });
  }

  // Expressions
  const exprLayers = layers.filter(l => {
    if (!l.transform || !l.transform.properties) return false;
    return l.transform.properties.some(p => p.expressionEnabled);
  });
  if (exprLayers.length) {
    tech.push({ name: "expressions", layers: exprLayers.map(l => l.name), count: exprLayers.length, confidence: 0.85 });
  }

  // Time remapping
  const timeRemapped = layers.filter(l => l.timeRemapEnabled);
  if (timeRemapped.length) {
    tech.push({ name: "time-remapping", layers: timeRemapped.map(l => l.name), count: timeRemapped.length, confidence: 0.9 });
  }

  // Layer styles
  const styled = layers.filter(l => l.layerStyles);
  if (styled.length) {
    tech.push({ name: "layer-styles", layers: styled.map(l => l.name), count: styled.length, confidence: 0.85 });
  }

  // Text animators
  const textAnim = layers.filter(l => l.textAnimators && l.textAnimators.length > 0);
  if (textAnim.length) {
    tech.push({ name: "text-animator", layers: textAnim.map(l => l.name), count: textAnim.length, confidence: 0.85 });
  }

  // Stagger detection
  const sorted = layers.filter(l => l.enabled && l.type !== "camera" && l.type !== "light").sort((a, b) => (a.inFrame || 0) - (b.inFrame || 0));
  if (sorted.length > 0) {
    let grp = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const gap = (sorted[i].inFrame || 0) - (sorted[i - 1].inFrame || 0);
      if (gap > 0 && gap <= 15) grp.push(sorted[i]);
      else { if (grp.length >= 3) pushStagger(tech, grp); grp = [sorted[i]]; }
    }
    if (grp.length >= 3) pushStagger(tech, grp);
  }

  // Specific effect detection
  const effectNames = layers.flatMap(l => (l.effects || []).map(e => e.matchName || e.name));
  if (effectNames.some(n => n.includes("Gaussian Blur"))) tech.push({ name: "gaussian-blur", confidence: 0.9 });
  if (effectNames.some(n => n.includes("CC Particle"))) tech.push({ name: "particle-system", confidence: 0.9 });
  if (effectNames.some(n => n.includes("Glow"))) tech.push({ name: "glow-effect", confidence: 0.85 });
  if (effectNames.some(n => n.includes("Drop Shadow"))) tech.push({ name: "drop-shadow", confidence: 0.8 });

  // Shape layer presence
  const shapeLayers = layers.filter(l => l.type === "shape" && l.shapeContent);
  if (shapeLayers.length >= 3) tech.push({ name: "shape-animation", layers: shapeLayers.map(l => l.name), count: shapeLayers.length, confidence: 0.7 });

  return tech;
}

function pushStagger(tech, grp) {
  const gaps = [];
  for (let i = 1; i < grp.length; i++) gaps.push((grp[i].inFrame || 0) - (grp[i - 1].inFrame || 0));
  tech.push({
    name: "staggered-entrance",
    layers: grp.map(l => l.name),
    avgDelayFrames: +(gaps.reduce((s, v) => s + v, 0) / gaps.length).toFixed(1),
    count: grp.length,
    confidence: 0.8,
  });
}

function detectProfile(m) {
  const sc = { "snappy-saas": 0, "luxury-slow": 0, "kinetic-typography": 0, "dark-tech": 0, "product-showcase": 0 };
  const sp = m.l1_physics.springs;
  const avgS = sp.length ? sp.reduce((s, v) => s + v.stiffness, 0) / sp.length : 100;
  const avgD = sp.length ? sp.reduce((s, v) => s + v.damping, 0) / sp.length : 18;
  if (avgS > 140) sc["snappy-saas"] += 3;
  if (avgD > 20) sc["snappy-saas"] += 2;
  if (avgS < 100) sc["luxury-slow"] += 3;
  if (avgD > 22) sc["luxury-slow"] += 2;
  const ll = m.l3_composition.layers;
  if (ll.filter(l => l.type === "text").length / (ll.length || 1) > 0.4) sc["kinetic-typography"] += 3;
  if (avgD < 15) sc["kinetic-typography"] += 2;
  if (m.l2_visual.colors.some(c => c.color && c.color[1] <= "2")) sc["dark-tech"] += 3;
  if (m.l5_techniques.some(t => t.name === "3d-camera-scene")) sc["product-showcase"] += 2;
  if (m.l5_techniques.some(t => t.name === "3d-lighting")) sc["dark-tech"] += 2;
  if (m.meta.expressionCount > 3) sc["product-showcase"] += 1;
  const sorted = Object.entries(sc).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] === 0 ? null : { profile: sorted[0][0], score: sorted[0][1], all: Object.fromEntries(sorted) };
}

function printSummary(m, outPath) {
  console.log("\n  Template: " + m.templateName + " (via " + m.extractionMethod + ")");
  console.log("  FPS: " + m.meta.fps + " | Duration: " + m.meta.totalDuration + "s (" + m.meta.totalFrames + "f)");
  console.log("  Dimensions: " + m.meta.width + "x" + m.meta.height);
  console.log("  Layers: " + m.meta.layerCount + " | Effects: " + m.meta.effectCount + " | Expressions: " + m.meta.expressionCount);
  console.log("  Scenes: " + m.l4_temporal.scenes.length);
  console.log("  Easings: " + m.l1_physics.easings.length + " | Springs: " + m.l1_physics.springs.length);
  console.log("  Colors: " + m.l2_visual.colors.length + " | Text: " + m.l2_visual.textStyles.length + " | Fonts: " + m.l2_visual.fonts.length);
  console.log("  Techniques: " + (m.l5_techniques.map(t => t.name).join(", ") || "none"));
  const dp = m.detectedProfile;
  console.log("  Profile: " + (dp ? dp.profile + " (score " + dp.score + ")" : "unknown"));
  if (m.precompositions.length > 0) console.log("  Precomps: " + m.precompositions.map(p => p.name).join(", "));
  console.log("\n  -> " + outPath + "\n");
}
