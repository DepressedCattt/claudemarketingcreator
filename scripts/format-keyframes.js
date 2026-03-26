const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted/FINAL_RENDER_4K.ae-extract.json'), 'utf-8'));
const mainScene = data.compositions['MainScene'];
const FRAME_LIMIT = 150;
const lines = [];

function log(s = '') { lines.push(s); }

const targetPatterns = [
  /^text \d+$/i, /arrow/i, /liquid_up/i, /liquid_board/i, /hand_/i,
  /^folder/i, /dot/i, /splash/i, /grid/i, /chart/i, /checkbox/i,
  /dialog/i, /hearts/i, /^Shape Layer/i,
];

function isTargetLayer(name) {
  return targetPatterns.some(p => p.test(name));
}

function fmtVal(v) {
  if (Array.isArray(v)) return `[${v.map(x => typeof x === 'number' ? Math.round(x * 10000) / 10000 : x).join(', ')}]`;
  if (typeof v === 'number') return `${Math.round(v * 10000) / 10000}`;
  return JSON.stringify(v);
}

function printTransform(transform, indent = '  ') {
  if (!transform || !transform.properties) return;
  const props = transform.properties;
  for (const prop of props) {
    const mn = prop.matchName;
    if (!['ADBE Anchor Point', 'ADBE Position', 'ADBE Scale', 'ADBE Rotate Z', 'ADBE Rotation', 'ADBE Opacity'].includes(mn)) continue;
    
    if (prop.numKeys > 0 && prop.keyframes) {
      log(`${indent}${prop.name} (${prop.numKeys} keyframes):`);
      for (const kf of prop.keyframes) {
        let easeInfo = '';
        if (kf.temporalEase) {
          const ein = kf.temporalEase.easeIn;
          const eout = kf.temporalEase.easeOut;
          if (ein && eout) {
            easeInfo = ` | ease-in: speed=${fmtVal(ein[0]?.speed)},influence=${fmtVal(ein[0]?.influence)}% | ease-out: speed=${fmtVal(eout[0]?.speed)},influence=${fmtVal(eout[0]?.influence)}%`;
          }
        }
        let interpInfo = '';
        if (kf.inInterpolationType || kf.outInterpolationType) {
          interpInfo = ` [in=${kf.inInterpolationType || '?'}, out=${kf.outInterpolationType || '?'}]`;
        }
        log(`${indent}  frame ${kf.frame}: ${fmtVal(kf.value)}${interpInfo}${easeInfo}`);
      }
    } else {
      log(`${indent}${prop.name}: ${fmtVal(prop.value)} (static)`);
    }
  }
}

function printEffects(effectsGroup, indent = '  ') {
  if (!effectsGroup || !effectsGroup.properties || effectsGroup.properties.length === 0) return;
  log(`${indent}Effects:`);
  for (const eff of effectsGroup.properties) {
    log(`${indent}  - ${eff.name} (${eff.matchName})`);
    if (eff.properties) {
      for (const prop of eff.properties) {
        if (prop.numKeys > 0 && prop.keyframes) {
          log(`${indent}    ${prop.name} (${prop.numKeys} keyframes):`);
          for (const kf of prop.keyframes) {
            log(`${indent}      frame ${kf.frame}: ${fmtVal(kf.value)}`);
          }
        }
        if (prop.properties) {
          for (const sub of prop.properties) {
            if (sub.numKeys > 0 && sub.keyframes) {
              log(`${indent}    ${prop.name} > ${sub.name} (${sub.numKeys} keyframes):`);
              for (const kf of sub.keyframes) {
                log(`${indent}      frame ${kf.frame}: ${fmtVal(kf.value)}`);
              }
            }
          }
        }
      }
    }
  }
}

function printTextAnimators(textGroup, indent = '  ') {
  if (!textGroup || !textGroup.properties) return;
  const animators = textGroup.properties.find(p => p.matchName === 'ADBE Text Animators');
  if (!animators || !animators.properties || animators.properties.length === 0) return;
  log(`${indent}Text Animators:`);
  for (const animator of animators.properties) {
    log(`${indent}  - ${animator.name}`);
    if (animator.properties) {
      for (const prop of animator.properties) {
        if (prop.properties) {
          for (const sub of prop.properties) {
            if (sub.numKeys > 0 && sub.keyframes) {
              log(`${indent}    ${prop.name} > ${sub.name} (${sub.numKeys} keyframes):`);
              for (const kf of sub.keyframes) {
                log(`${indent}      frame ${kf.frame}: ${fmtVal(kf.value)}`);
              }
            } else if (sub.value !== undefined) {
              log(`${indent}    ${prop.name} > ${sub.name}: ${fmtVal(sub.value)} (static)`);
            }
          }
        } else {
          if (prop.numKeys > 0 && prop.keyframes) {
            log(`${indent}    ${prop.name} (${prop.numKeys} keyframes):`);
            for (const kf of prop.keyframes) {
              log(`${indent}      frame ${kf.frame}: ${fmtVal(kf.value)}`);
            }
          } else if (prop.value !== undefined) {
            log(`${indent}    ${prop.name}: ${fmtVal(prop.value)} (static)`);
          }
        }
      }
    }
  }
}

function printTextDocument(layer, indent = '  ') {
  if (layer.textDocument) {
    const td = layer.textDocument;
    log(`${indent}Text Content: "${td.text || ''}"`);
    if (td.fontSize) log(`${indent}Font Size: ${td.fontSize}`);
    if (td.font) log(`${indent}Font: ${td.font}`);
    if (td.fillColor) log(`${indent}Fill Color: ${fmtVal(td.fillColor)}`);
    if (td.justification) log(`${indent}Justification: ${td.justification}`);
  }
}

function printLayer(layer, indent = '', depth = 0) {
  const parent = layer.parentIndex ? ` | parent: [${layer.parentIndex}] "${layer.parentName}"` : '';
  log(`${indent}[${layer.index}] "${layer.name}" (${layer.type}) | in=${layer.inFrame} out=${layer.outFrame} | enabled=${layer.enabled}${parent}`);
  if (layer.blendingMode && layer.blendingMode !== 'normal') log(`${indent}  Blending: ${layer.blendingMode}`);
  if (layer.trackMatteType && layer.trackMatteType !== 'none') log(`${indent}  Track Matte: ${layer.trackMatteType}`);
  if (layer.hasTrackMatte) log(`${indent}  Has Track Matte: true`);
  if (layer.isTrackMatte) log(`${indent}  Is Track Matte: true`);
  if (layer.threeDLayer) log(`${indent}  3D Layer: true`);
  
  printTextDocument(layer, indent + '  ');
  printTransform(layer.transform, indent + '  ');
  printEffects(layer.effects, indent + '  ');
  if (layer.text) printTextAnimators(layer.text, indent + '  ');
  
  if (layer.type === 'precomp' && layer.sourceCompName) {
    log(`${indent}  Source Comp: "${layer.sourceCompName}"`);
  }
}

function printSubComp(compName, indent = '    ', depth = 0) {
  const comp = data.compositions[compName];
  if (!comp) { log(`${indent}(sub-comp "${compName}" not found)`); return; }
  log(`${indent}--- Sub-comp "${compName}" (${comp.width}x${comp.height}, ${comp.totalFrames}f @ ${comp.fps}fps) ---`);
  for (const layer of comp.layers) {
    printLayer(layer, indent, depth);
    if (layer.type === 'precomp' && layer.sourceCompName && depth < 2) {
      printSubComp(layer.sourceCompName, indent + '    ', depth + 1);
    }
  }
}

// Group layers by name for clarity
log('═══════════════════════════════════════════════════════════════');
log('FINAL_RENDER_4K → MainScene: KEYFRAME EXTRACTION (frames 0-150)');
log(`Comp: ${mainScene.width}x${mainScene.height}, ${mainScene.fps}fps, ${mainScene.totalFrames} total frames`);
log('═══════════════════════════════════════════════════════════════');
log('');

// Process layers in order of inFrame
const targetLayers = mainScene.layers
  .filter(l => l.inFrame < FRAME_LIMIT && isTargetLayer(l.name))
  .sort((a, b) => a.inFrame - b.inFrame);

let lastSection = '';
for (const layer of targetLayers) {
  const section = layer.name.replace(/ \d+$/, '').replace(/_\d+$/, '');
  if (section !== lastSection) {
    log('');
    log('───────────────────────────────────────────────────────────────');
    log(`SECTION: ${section.toUpperCase()} layers`);
    log('───────────────────────────────────────────────────────────────');
    lastSection = section;
  }
  log('');
  printLayer(layer, '');
  if (layer.type === 'precomp' && layer.sourceCompName) {
    printSubComp(layer.sourceCompName, '    ');
  }
}

const output = lines.join('\n');
fs.writeFileSync(path.join(__dirname, 'extracted/FINAL_RENDER_4K-keyframes-report.txt'), output);
console.log(`Report written: ${lines.length} lines`);
console.log(output);
