const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'extracted/FINAL_RENDER_4K.ae-extract.json'), 'utf-8'));

const mainScene = data.compositions['MainScene'];
if (!mainScene) {
  console.error('MainScene not found');
  process.exit(1);
}

const FRAME_LIMIT = 150;

const targetPatterns = [
  /^text \d+$/i,
  /arrow/i,
  /liquid_up/i,
  /liquid_board/i,
  /hand_/i,
  /folder/i,
  /dot/i,
  /splash/i,
  /grid/i,
  /chart/i,
  /checkbox/i,
  /dialog/i,
  /hearts/i,
];

function isTargetLayer(name) {
  return targetPatterns.some(p => p.test(name));
}

function extractTransformKeyframes(transform) {
  if (!transform || !transform.properties) return {};
  const result = {};
  for (const prop of transform.properties) {
    const mn = prop.matchName;
    if (['ADBE Anchor Point', 'ADBE Position', 'ADBE Scale', 'ADBE Rotate Z', 'ADBE Rotation', 'ADBE Opacity',
         'ADBE Position_0', 'ADBE Position_1', 'ADBE Position_2'].includes(mn)) {
      const entry = {
        name: prop.name,
        matchName: mn,
        numKeys: prop.numKeys || 0,
        value: prop.value,
      };
      if (prop.numKeys > 0 && prop.keyframes) {
        entry.keyframes = prop.keyframes.map(kf => ({
          frame: kf.frame,
          value: kf.value,
          inInterp: kf.inInterpolationType,
          outInterp: kf.outInterpolationType,
          easeIn: kf.temporalEase ? kf.temporalEase.easeIn : undefined,
          easeOut: kf.temporalEase ? kf.temporalEase.easeOut : undefined,
        }));
      }
      if (prop.expressionEnabled && prop.expression) {
        entry.expression = prop.expression;
      }
      result[mn] = entry;
    }
  }
  return result;
}

function extractEffects(effectsGroup) {
  if (!effectsGroup || !effectsGroup.properties) return [];
  const effects = [];
  for (const eff of effectsGroup.properties) {
    const effData = {
      name: eff.name,
      matchName: eff.matchName,
      properties: [],
    };
    if (eff.properties) {
      for (const prop of eff.properties) {
        if (prop.numKeys > 0 && prop.keyframes) {
          effData.properties.push({
            name: prop.name,
            matchName: prop.matchName,
            numKeys: prop.numKeys,
            value: prop.value,
            keyframes: prop.keyframes.map(kf => ({
              frame: kf.frame,
              value: kf.value,
            })),
          });
        } else if (prop.value !== undefined) {
          effData.properties.push({
            name: prop.name,
            matchName: prop.matchName,
            value: prop.value,
          });
        }
        // Recurse into sub-groups of effect properties
        if (prop.properties) {
          for (const subProp of prop.properties) {
            if (subProp.numKeys > 0 && subProp.keyframes) {
              effData.properties.push({
                name: `${prop.name} > ${subProp.name}`,
                matchName: subProp.matchName,
                numKeys: subProp.numKeys,
                value: subProp.value,
                keyframes: subProp.keyframes.map(kf => ({
                  frame: kf.frame,
                  value: kf.value,
                })),
              });
            }
          }
        }
      }
    }
    effects.push(effData);
  }
  return effects;
}

function extractLayerData(layer) {
  const info = {
    index: layer.index,
    name: layer.name,
    type: layer.type,
    enabled: layer.enabled,
    inFrame: layer.inFrame,
    outFrame: layer.outFrame,
    startTime: layer.startTime,
  };
  if (layer.parentIndex) {
    info.parentIndex = layer.parentIndex;
    info.parentName = layer.parentName;
  }
  info.threeDLayer = layer.threeDLayer;
  info.blendingMode = layer.blendingMode;
  info.trackMatteType = layer.trackMatteType;
  info.isTrackMatte = layer.isTrackMatte;
  info.hasTrackMatte = layer.hasTrackMatte;
  
  info.transform = extractTransformKeyframes(layer.transform);
  
  if (layer.effects) {
    info.effects = extractEffects(layer.effects);
  }
  
  if (layer.type === 'precomp' && layer.sourceCompName) {
    info.sourceCompName = layer.sourceCompName;
    info.sourceCompId = layer.sourceCompId;
  }
  
  if (layer.type === 'text' && layer.textDocument) {
    info.textDocument = layer.textDocument;
  }
  
  // For text layers, also capture text animators
  if (layer.text && layer.text.properties) {
    const animators = layer.text.properties.find(p => p.matchName === 'ADBE Text Animators');
    if (animators && animators.properties && animators.properties.length > 0) {
      info.textAnimators = extractTextAnimators(animators);
    }
  }
  
  return info;
}

function extractTextAnimators(animatorsGroup) {
  if (!animatorsGroup || !animatorsGroup.properties) return [];
  const result = [];
  for (const animator of animatorsGroup.properties) {
    const animData = { name: animator.name, properties: [] };
    if (animator.properties) {
      for (const prop of animator.properties) {
        if (prop.properties) {
          for (const subProp of prop.properties) {
            const entry = {
              name: `${prop.name} > ${subProp.name}`,
              matchName: subProp.matchName,
              value: subProp.value,
            };
            if (subProp.numKeys > 0 && subProp.keyframes) {
              entry.keyframes = subProp.keyframes.map(kf => ({
                frame: kf.frame,
                value: kf.value,
              }));
            }
            animData.properties.push(entry);
          }
        } else {
          const entry = {
            name: prop.name,
            matchName: prop.matchName,
            value: prop.value,
          };
          if (prop.numKeys > 0 && prop.keyframes) {
            entry.keyframes = prop.keyframes.map(kf => ({
              frame: kf.frame,
              value: kf.value,
            }));
          }
          animData.properties.push(entry);
        }
      }
    }
    result.push(animData);
  }
  return result;
}

function extractSubComp(compName, compositions) {
  const comp = compositions[compName];
  if (!comp) return null;
  const layers = [];
  for (const layer of comp.layers) {
    const layerData = extractLayerData(layer);
    if (layer.type === 'precomp' && layer.sourceCompName) {
      layerData.subCompLayers = extractSubComp(layer.sourceCompName, compositions);
    }
    layers.push(layerData);
  }
  return layers;
}

// Extract all MainScene layers with inFrame < 150 that match target patterns
const result = {
  composition: 'MainScene',
  width: mainScene.width,
  height: mainScene.height,
  fps: mainScene.fps,
  duration: mainScene.duration,
  totalFrames: mainScene.totalFrames,
  layers: [],
};

// First pass: list ALL layers with their inFrame for reference
console.log('=== ALL MainScene Layers ===');
for (const layer of mainScene.layers) {
  console.log(`  [${layer.index}] "${layer.name}" type=${layer.type} inFrame=${layer.inFrame} outFrame=${layer.outFrame} enabled=${layer.enabled}`);
}
console.log('');

// Second pass: extract target layers
for (const layer of mainScene.layers) {
  if (layer.inFrame < FRAME_LIMIT && isTargetLayer(layer.name)) {
    const layerData = extractLayerData(layer);
    if (layer.type === 'precomp' && layer.sourceCompName) {
      layerData.subCompLayers = extractSubComp(layer.sourceCompName, data.compositions);
    }
    result.layers.push(layerData);
  }
}

const outputPath = path.join(__dirname, 'extracted/FINAL_RENDER_4K-keyframes.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`Extracted ${result.layers.length} target layers to ${outputPath}`);
