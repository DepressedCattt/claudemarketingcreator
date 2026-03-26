/**
 * generate-composition.js -- Generate a Remotion .tsx skeleton from extracted params.
 *
 * Reads an extracted parameter manifest (from extract-lottie.js) and produces
 * a starter composition file with correct timing, easing, transforms, and colors.
 *
 * Usage:
 *   node scripts/generate-composition.js <params.json> [comp-id]
 *
 * Output: src/compositions/<CompName>Ad.tsx
 * Also prints Root.tsx and registry.ts snippets to stdout.
 */

const fs   = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

module.exports = { generate };

if (require.main === module) main();

function main() {
  const input = process.argv[2];
  if (!input) { console.error("Usage: node scripts/generate-composition.js <params.json> [comp-id]"); process.exit(1); }
  const abs = path.isAbsolute(input) ? input : path.join(process.cwd(), input);
  if (!fs.existsSync(abs)) { console.error("Not found: " + abs); process.exit(1); }
  const manifest = JSON.parse(fs.readFileSync(abs, "utf8"));
  const compId = process.argv[3] || manifest.templateName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const result = generate(manifest, compId);
  fs.writeFileSync(result.filePath, result.code, "utf8");
  console.log("\n  Generated: " + result.filePath);
  console.log("\n  -- Add to src/Root.tsx: --");
  console.log(result.rootSnippet);
  console.log("\n  -- Add to studio/src/registry.ts: --");
  console.log(result.registrySnippet);
  console.log("");
}

function generate(manifest, compId) {
  const m = manifest.meta;
  const compName = toPascalCase(compId) + "Ad";
  const filePath = path.join(ROOT, "src", "compositions", compName + ".tsx");

  const scenes = manifest.l4_temporal.scenes;
  const profile = manifest.detectedProfile;
  const springs = manifest.l1_physics.springs;
  const colors = manifest.l2_visual.colors;
  const textStyles = manifest.l2_visual.textStyles;
  const techniques = manifest.l5_techniques;

  // Pick best spring config
  const springConfig = pickSpringConfig(springs, profile);

  // Determine format
  const format = getFormat(m.width, m.height);

  // Build scene components
  const sceneComponents = scenes.map((scene, i) => buildSceneComponent(scene, i, textStyles, colors, springConfig, techniques));

  // Build the full composition code
  const code = buildCompositionCode(compName, m, scenes, sceneComponents, springConfig, colors, textStyles, techniques);

  // Build registration snippets
  const rootSnippet = buildRootSnippet(compName, compId, m);
  const registrySnippet = buildRegistrySnippet(compName, compId, m, format, scenes);

  return { filePath, code, rootSnippet, registrySnippet, compId, compName };
}

// ---- helpers ----

function toPascalCase(str) {
  return str.replace(/(^|[-_ ])(\w)/g, (_, _sep, c) => c.toUpperCase());
}

function getFormat(w, h) {
  const ratio = w / h;
  if (Math.abs(ratio - 9 / 16) < 0.05) return "9:16";
  if (Math.abs(ratio - 16 / 9) < 0.05) return "16:9";
  if (Math.abs(ratio - 1) < 0.05) return "1:1";
  return w + ":" + h;
}

function pickSpringConfig(springs, profile) {
  if (springs.length === 0) {
    if (profile && profile.profile === "snappy-saas") return { stiffness: 200, damping: 25, mass: 0.8 };
    if (profile && profile.profile === "luxury-slow") return { stiffness: 80, damping: 26, mass: 1.1 };
    return { stiffness: 120, damping: 20, mass: 0.9 };
  }
  const avg = (arr, fn) => arr.reduce((s, v) => s + fn(v), 0) / arr.length;
  return {
    stiffness: Math.round(avg(springs, s => s.stiffness)),
    damping:   Math.round(avg(springs, s => s.damping)),
    mass:      +avg(springs, s => s.mass).toFixed(2),
  };
}

function pickColor(colors, type, fallback) {
  const match = colors.find(c => c.type === type);
  return match ? match.color : fallback;
}

function buildSceneComponent(scene, index, textStyles, colors, springConfig, techniques) {
  const sceneTexts = textStyles.filter(ts => {
    // match text styles that belong to layers in this scene
    return scene.layers.some(ln => ln === ts.layerName);
  });

  const hasBlurReveal = techniques.some(t =>
    t.name === "blur-scale-reveal" && t.layers.some(l => scene.layers.includes(l))
  );

  return {
    name: "Scene" + (index + 1),
    scene,
    texts: sceneTexts,
    hasBlurReveal,
  };
}

function buildCompositionCode(compName, meta, scenes, sceneComponents, springConfig, colors, textStyles, techniques) {
  const hasBlurReveal = techniques.some(t => t.name === "blur-scale-reveal" || t.name === "scale-fade-reveal");
  const has3D = techniques.some(t => t.name === "3d-camera-scene");

  const bgColor = pickColor(colors, "solid", "#FDFDFE");
  const accentColor = pickColor(colors, "fill", "#0070f3");
  const textColor = pickColor(colors, "textFill", "#1E1E1E");

  let code = "";

  // Imports
  code += 'import React from "react";\n';
  code += 'import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";\n';
  code += "\n";

  // Spring config
  code += "const SPRING_CONFIG = " + JSON.stringify(springConfig) + ";\n\n";

  // Color palette
  code += "const COLORS = {\n";
  code += '  bg: "' + bgColor + '",\n';
  code += '  accent: "' + accentColor + '",\n';
  code += '  text: "' + textColor + '",\n';
  const uniqueColors = [...new Set(colors.map(c => c.color).filter(Boolean))].slice(0, 6);
  uniqueColors.forEach((c, i) => { code += '  color' + i + ': "' + c + '",\n'; });
  code += "};\n\n";

  // Blur-scale reveal hook if needed
  if (hasBlurReveal) {
    code += "function useSnapReveal(startFrame: number) {\n";
    code += "  const frame = useCurrentFrame();\n";
    code += "  const { fps } = useVideoConfig();\n";
    code += "  const progress = spring({ frame: frame - startFrame, fps, config: SPRING_CONFIG });\n";
    code += "  return {\n";
    code += "    opacity: progress,\n";
    code += "    transform: `scale(${0.95 + progress * 0.05})`,\n";
    code += "    filter: `blur(${(1 - progress) * 10}px)`,\n";
    code += "  };\n";
    code += "}\n\n";
  }

  // Scene components
  for (const sc of sceneComponents) {
    code += buildSceneFunction(sc, hasBlurReveal, textStyles, colors);
  }

  // Main composition
  code += "export const " + compName + ": React.FC = () => {\n";
  code += "  return (\n";
  code += '    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>\n';

  for (let i = 0; i < scenes.length; i++) {
    const s = scenes[i];
    code += "      <Sequence from={" + s.startFrame + "} durationInFrames={" + s.durationFrames + "}>\n";
    code += "        <Scene" + (i + 1) + " />\n";
    code += "      </Sequence>\n";
  }

  code += "    </AbsoluteFill>\n";
  code += "  );\n";
  code += "};\n";

  return code;
}

function buildSceneFunction(sc, hasBlurReveal, allTextStyles, colors) {
  let code = "";
  code += "const " + sc.name + ": React.FC = () => {\n";
  code += "  const frame = useCurrentFrame();\n";
  code += "  const { fps } = useVideoConfig();\n\n";

  // spring-driven entrance
  code += "  const enter = spring({ frame, fps, config: SPRING_CONFIG });\n";

  if (hasBlurReveal && sc.hasBlurReveal) {
    code += "  const reveal = useSnapReveal(0);\n";
  }

  // Fade out at end
  code += "  const fadeOut = interpolate(frame, [" + (sc.scene.durationFrames - 10) + ", " + sc.scene.durationFrames + "], [1, 0], { extrapolateLeft: \"clamp\", extrapolateRight: \"clamp\" });\n";
  code += "\n";

  code += "  return (\n";
  code += "    <AbsoluteFill\n";
  code += "      style={{\n";
  code += "        opacity: fadeOut,\n";
  code += "        display: \"flex\",\n";
  code += "        flexDirection: \"column\",\n";
  code += "        alignItems: \"center\",\n";
  code += "        justifyContent: \"center\",\n";
  code += "        padding: 60,\n";
  code += "      }}\n";
  code += "    >\n";

  // Render text elements from this scene
  if (sc.texts.length > 0) {
    for (let i = 0; i < sc.texts.length; i++) {
      const t = sc.texts[i];
      const staggerDelay = i * 8;
      code += "      <div\n";
      code += "        style={{\n";
      if (hasBlurReveal && sc.hasBlurReveal) {
        code += "          ...useSnapReveal(" + staggerDelay + "),\n";
      } else {
        code += "          opacity: spring({ frame: frame - " + staggerDelay + ", fps, config: SPRING_CONFIG }),\n";
        code += "          transform: `translateY(${(1 - spring({ frame: frame - " + staggerDelay + ", fps, config: SPRING_CONFIG })) * 20}px)`,\n";
      }
      if (t.fontSize) code += "          fontSize: " + t.fontSize + ",\n";
      if (t.fillColor) code += '          color: "' + t.fillColor + '",\n';
      else code += "          color: COLORS.text,\n";
      if (t.font) code += '          fontFamily: "' + t.font + '",\n';
      code += "          fontWeight: 600,\n";
      if (t.justification === "center") code += '          textAlign: "center",\n';
      code += "        }}\n";
      code += "      >\n";
      code += "        " + (t.text || "Text " + (i + 1)) + "\n";
      code += "      </div>\n";
    }
  } else {
    // Placeholder content
    code += "      {/* Scene " + sc.name + " - " + sc.scene.layers.length + " layers */}\n";
    code += "      <div\n";
    code += "        style={{\n";
    code += "          opacity: enter,\n";
    code += "          transform: `scale(${0.95 + enter * 0.05})`,\n";
    code += "          fontSize: 48,\n";
    code += "          fontWeight: 700,\n";
    code += "          color: COLORS.text,\n";
    code += '          textAlign: "center",\n';
    code += "        }}\n";
    code += "      >\n";
    code += "        " + sc.name + "\n";
    code += "      </div>\n";
  }

  code += "    </AbsoluteFill>\n";
  code += "  );\n";
  code += "};\n\n";
  return code;
}

function buildRootSnippet(compName, compId, meta) {
  let s = "";
  s += '  // Add this import:\n';
  s += '  // import { ' + compName + ' } from "./compositions/' + compName + '";\n\n';
  s += '  // Add this <Composition>:\n';
  s += '  <Composition\n';
  s += '    id="' + compId + '"\n';
  s += '    component={' + compName + '}\n';
  s += '    durationInFrames={' + meta.totalFrames + '}\n';
  s += '    fps={' + meta.fps + '}\n';
  s += '    width={' + meta.width + '}\n';
  s += '    height={' + meta.height + '}\n';
  s += '    defaultProps={{}}\n';
  s += '  />';
  return s;
}

function buildRegistrySnippet(compName, compId, meta, format, scenes) {
  const CLR_MAP = ["hook", "product", "features", "metrics", "generic", "cta"];
  let s = "";
  s += '  // Add import: import { ' + compName + ' } from "@comps/' + compName + '";\n\n';
  s += '  {\n';
  s += '    id: "' + compId + '",\n';
  s += '    label: "' + manifest2label(compId) + '",\n';
  s += '    component: ' + compName + ',\n';
  s += '    durationInFrames: ' + meta.totalFrames + ',\n';
  s += '    fps: ' + meta.fps + ',\n';
  s += '    width: ' + meta.width + ',\n';
  s += '    height: ' + meta.height + ',\n';
  s += '    format: "' + format + '",\n';
  s += '    defaultProps: {},\n';
  if (scenes.length > 0) {
    s += '    sequences: [\n';
    scenes.forEach((sc, i) => {
      const clr = CLR_MAP[i % CLR_MAP.length];
      s += '      { id: "s' + (i + 1) + '", label: "Scene ' + (i + 1) + '", from: ' + sc.startFrame + ', durationInFrames: ' + sc.durationFrames + ', color: CLR.' + clr + ' },\n';
    });
    s += '    ],\n';
  }
  s += '  },';
  return s;
}

function manifest2label(compId) {
  return compId.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
