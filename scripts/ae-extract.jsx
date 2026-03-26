/**
 * ae-extract.jsx -- After Effects ExtendScript
 *
 * Runs inside After Effects to extract ALL animation parameters from the
 * active composition. Walks every layer, property group, keyframe, expression,
 * effect, and style -- producing a comprehensive JSON manifest.
 *
 * Usage (from AE Script Editor or command line):
 *   afterfx.exe -project "template.aep" -r "ae-extract.jsx"
 *
 * The script reads the output path from an environment variable or uses a
 * default path next to the .aep file. You can also set the output path by
 * placing a file called "ae-extract-config.json" next to this script with:
 *   { "outputDir": "C:/path/to/extracted" }
 *
 * Output: <outputDir>/<compName>.ae-extract.json
 */

// Polyfill Date.toISOString for ExtendScript
if (typeof Date.prototype.toISOString === "undefined") {
  Date.prototype.toISOString = function() {
    function pad(n) { return n < 10 ? "0" + n : String(n); }
    return this.getUTCFullYear() + "-" + pad(this.getUTCMonth() + 1) + "-" + pad(this.getUTCDate()) +
      "T" + pad(this.getUTCHours()) + ":" + pad(this.getUTCMinutes()) + ":" + pad(this.getUTCSeconds()) + "Z";
  };
}

// Polyfill JSON for older ExtendScript environments
if (typeof JSON === "undefined") {
  // Minimal JSON.stringify for ExtendScript
  JSON = {};
  JSON.stringify = function(obj, replacer, space) {
    var indent = "";
    if (typeof space === "number") for (var si = 0; si < space; si++) indent += " ";
    return _jsonStr(obj, indent, "");
  };
  function _jsonStr(val, indent, currentIndent) {
    if (val === null || val === undefined) return "null";
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "number") {
      if (!isFinite(val)) return "null";
      return String(val);
    }
    if (typeof val === "string") {
      return '"' + val.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t") + '"';
    }
    if (val instanceof Array) {
      if (val.length === 0) return "[]";
      var items = [];
      var newIndent = currentIndent + indent;
      for (var i = 0; i < val.length; i++) {
        items.push(_jsonStr(val[i], indent, newIndent));
      }
      if (indent === "") return "[" + items.join(",") + "]";
      return "[\n" + newIndent + items.join(",\n" + newIndent) + "\n" + currentIndent + "]";
    }
    if (typeof val === "object") {
      var keys = [];
      for (var k in val) { if (val.hasOwnProperty(k)) keys.push(k); }
      if (keys.length === 0) return "{}";
      var pairs = [];
      var newIndent2 = currentIndent + indent;
      for (var j = 0; j < keys.length; j++) {
        pairs.push('"' + keys[j] + '":' + (indent ? " " : "") + _jsonStr(val[keys[j]], indent, newIndent2));
      }
      if (indent === "") return "{" + pairs.join(",") + "}";
      return "{\n" + newIndent2 + pairs.join(",\n" + newIndent2) + "\n" + currentIndent + "}";
    }
    return "null";
  }
}

// ---- Configuration ----

function getOutputDir() {
  var scriptFile = new File($.fileName);
  var configFile = new File(scriptFile.parent.fsName + "/ae-extract-config.json");
  if (configFile.exists) {
    configFile.open("r");
    var content = configFile.read();
    configFile.close();
    try {
      var config = eval("(" + content + ")");
      if (config.outputDir) return config.outputDir;
    } catch(e) {}
  }
  // Default: "extracted" folder next to the project file
  if (app.project.file) {
    return app.project.file.parent.fsName + "/extracted";
  }
  return scriptFile.parent.fsName + "/extracted";
}

// ---- Interpolation type mapping ----

var INTERP_NAMES = {};
INTERP_NAMES[KeyframeInterpolationType.LINEAR] = "linear";
INTERP_NAMES[KeyframeInterpolationType.BEZIER] = "bezier";
INTERP_NAMES[KeyframeInterpolationType.HOLD] = "hold";

// ---- Blending mode mapping ----

function blendModeName(bm) {
  var names = {};
  names[BlendingMode.NORMAL] = "normal";
  names[BlendingMode.ADD] = "add";
  names[BlendingMode.MULTIPLY] = "multiply";
  names[BlendingMode.SCREEN] = "screen";
  names[BlendingMode.OVERLAY] = "overlay";
  names[BlendingMode.SOFT_LIGHT] = "softLight";
  names[BlendingMode.HARD_LIGHT] = "hardLight";
  names[BlendingMode.COLOR_DODGE] = "colorDodge";
  names[BlendingMode.COLOR_BURN] = "colorBurn";
  names[BlendingMode.DARKEN] = "darken";
  names[BlendingMode.LIGHTEN] = "lighten";
  names[BlendingMode.DIFFERENCE] = "difference";
  names[BlendingMode.EXCLUSION] = "exclusion";
  names[BlendingMode.HUE] = "hue";
  names[BlendingMode.SATURATION] = "saturation";
  names[BlendingMode.COLOR] = "color";
  names[BlendingMode.LUMINOSITY] = "luminosity";
  return names[bm] || "unknown";
}

// ---- Track matte mapping ----

function trackMatteTypeName(tt) {
  if (tt === TrackMatteType.ALPHA) return "alpha";
  if (tt === TrackMatteType.ALPHA_INVERTED) return "alphaInverted";
  if (tt === TrackMatteType.LUMA) return "luma";
  if (tt === TrackMatteType.LUMA_INVERTED) return "lumaInverted";
  if (tt === TrackMatteType.NO_TRACK_MATTE) return "none";
  return "unknown";
}

// ---- Layer type mapping ----

function layerTypeName(layer) {
  if (layer instanceof CameraLayer) return "camera";
  if (layer instanceof LightLayer) return "light";
  if (layer instanceof TextLayer) return "text";
  if (layer instanceof ShapeLayer) return "shape";
  if (layer instanceof AVLayer) {
    if (layer.source instanceof CompItem) return "precomp";
    try { if (layer.nullLayer) return "null"; } catch(e) {}
    try { if (layer.adjustmentLayer) return "adjustment"; } catch(e2) {}
    try { if (layer.guideLayer) return "guide"; } catch(e3) {}
    // Solid = FootageItem whose mainSource is SolidSource
    try {
      if (layer.source && layer.source.mainSource && layer.source.mainSource instanceof SolidSource) return "solid";
    } catch(e4) {}
    return "avLayer";
  }
  return "unknown";
}

// ---- Auto-orient mapping ----

function autoOrientName(ao) {
  try {
    if (ao === AutoOrientType.ALONG_PATH) return "alongPath";
    if (ao === AutoOrientType.CAMERA_OR_POINT_OF_INTEREST) return "cameraOrPOI";
    if (ao === AutoOrientType.CHARACTERS_TOWARD_CAMERA) return "charsTowardCamera";
    if (ao === AutoOrientType.NO_AUTO_ORIENT) return "none";
  } catch(e) {}
  return "none";
}

// ---- Value serialization ----

function serializeValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return roundN(val, 4);
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val;
  if (val instanceof Array) {
    var arr = [];
    for (var i = 0; i < val.length; i++) arr.push(serializeValue(val[i]));
    return arr;
  }
  // AE Shape objects (path vertex data)
  if (typeof val === "object" && val.vertices !== undefined) {
    return serializeShape(val);
  }
  // AE TextDocument objects
  if (typeof val === "object" && val.text !== undefined && val.font !== undefined) {
    return serializeTextDoc(val);
  }
  // Generic object fallback — try to extract known properties
  if (typeof val === "object") {
    try {
      var obj = {};
      for (var k in val) {
        if (val.hasOwnProperty(k)) {
          obj[k] = serializeValue(val[k]);
        }
      }
      return obj;
    } catch(e) {}
  }
  return String(val);
}

function serializeShape(shape) {
  var result = { closed: false, vertices: [], inTangents: [], outTangents: [] };
  try { result.closed = shape.closed; } catch(e) {}
  try {
    var verts = shape.vertices;
    for (var i = 0; i < verts.length; i++) {
      result.vertices.push(serializeValue(verts[i]));
    }
  } catch(e2) {}
  try {
    var inT = shape.inTangents;
    for (var j = 0; j < inT.length; j++) {
      result.inTangents.push(serializeValue(inT[j]));
    }
  } catch(e3) {}
  try {
    var outT = shape.outTangents;
    for (var k = 0; k < outT.length; k++) {
      result.outTangents.push(serializeValue(outT[k]));
    }
  } catch(e4) {}
  return result;
}

function serializeTextDoc(doc) {
  var result = {};
  try { result.text = doc.text; } catch(e) {}
  try { result.font = doc.font; } catch(e2) {}
  try { result.fontSize = doc.fontSize; } catch(e3) {}
  try { result.fillColor = serializeValue(doc.fillColor); } catch(e4) {}
  try { result.strokeColor = serializeValue(doc.strokeColor); } catch(e5) {}
  try { result.strokeWidth = doc.strokeWidth; } catch(e6) {}
  try { result.tracking = doc.tracking; } catch(e7) {}
  try { result.leading = doc.leading; } catch(e8) {}
  try { result.justification = String(doc.justification); } catch(e9) {}
  try { result.applyFill = doc.applyFill; } catch(e10) {}
  try { result.applyStroke = doc.applyStroke; } catch(e11) {}
  // Text type (point vs box/paragraph)
  try { result.pointText = doc.pointText; } catch(ePT) {}
  try { result.boxText = doc.boxText; } catch(eBT) {}
  try { result.boxTextSize = serializeValue(doc.boxTextSize); } catch(eBTS) {}
  // Style flags
  try { result.fauxBold = doc.fauxBold; } catch(eFB) {}
  try { result.fauxItalic = doc.fauxItalic; } catch(eFI) {}
  try { result.allCaps = doc.allCaps; } catch(eAC) {}
  try { result.smallCaps = doc.smallCaps; } catch(eSC) {}
  try { result.horizontalScale = doc.horizontalScale; } catch(eHS) {}
  try { result.verticalScale = doc.verticalScale; } catch(eVS) {}
  try { result.baselineShift = doc.baselineShift; } catch(eBS) {}
  try { result.direction = String(doc.direction); } catch(eDir) {}
  return result;
}

function roundN(n, d) {
  var f = Math.pow(10, d);
  return Math.round(n * f) / f;
}

// ---- Keyframe extraction ----

function extractKeyframes(prop, fps) {
  var keyframes = [];
  for (var k = 1; k <= prop.numKeys; k++) {
    var kf = {
      index: k,
      time: roundN(prop.keyTime(k), 4),
      frame: Math.round(prop.keyTime(k) * fps),
      value: serializeValue(prop.keyValue(k))
    };

    // Interpolation types
    try {
      var inType = prop.keyInInterpolationType(k);
      var outType = prop.keyOutInterpolationType(k);
      kf.inInterp = INTERP_NAMES[inType] || "unknown";
      kf.outInterp = INTERP_NAMES[outType] || "unknown";
    } catch(e) {}

    // Temporal ease (speed + influence)
    try {
      var inEase = prop.keyInTemporalEase(k);
      var outEase = prop.keyOutTemporalEase(k);
      kf.inEase = [];
      kf.outEase = [];
      for (var d = 0; d < inEase.length; d++) {
        kf.inEase.push({ speed: roundN(inEase[d].speed, 4), influence: roundN(inEase[d].influence, 2) });
      }
      for (var d2 = 0; d2 < outEase.length; d2++) {
        kf.outEase.push({ speed: roundN(outEase[d2].speed, 4), influence: roundN(outEase[d2].influence, 2) });
      }
    } catch(e2) {}

    // Spatial tangents (for position properties)
    try {
      kf.inSpatialTangent = serializeValue(prop.keyInSpatialTangent(k));
      kf.outSpatialTangent = serializeValue(prop.keyOutSpatialTangent(k));
    } catch(e3) {}

    // Roving
    try { kf.roving = prop.keyRoving(k); } catch(e4) {}

    // Continuity / auto-bezier flags
    try { kf.temporalContinuous = prop.keyTemporalContinuous(k); } catch(eTC) {}
    try { kf.temporalAutoBezier = prop.keyTemporalAutoBezier(k); } catch(eTAB) {}
    try { kf.spatialContinuous = prop.keySpatialContinuous(k); } catch(eSC) {}
    try { kf.spatialAutoBezier = prop.keySpatialAutoBezier(k); } catch(eSAB) {}

    keyframes.push(kf);
  }
  return keyframes;
}

// ---- Property extraction ----

function extractProperty(prop, fps, depth, forceAll) {
  if (depth > 16) return null; // safety limit

  var result = {
    name: prop.name,
    matchName: prop.matchName
  };

  if (prop.propertyType === PropertyType.PROPERTY) {
    // Leaf property with value
    result.type = "property";
    result.propertyValueType = String(prop.propertyValueType);
    result.numKeys = prop.numKeys;

    // Current value
    try { result.value = serializeValue(prop.value); } catch(e) {}

    // Dimension separation (Position split into X/Y/Z)
    try {
      if (prop.dimensionsSeparated !== undefined) {
        result.dimensionsSeparated = prop.dimensionsSeparated;
      }
    } catch(eDimSep) {}
    try {
      if (prop.isSeparationLeader !== undefined) {
        result.isSeparationLeader = prop.isSeparationLeader;
      }
    } catch(eSepLead) {}
    try {
      if (prop.isSeparationFollower !== undefined && prop.isSeparationFollower) {
        result.isSeparationFollower = true;
        result.separationDimension = prop.separationDimension;
      }
    } catch(eSepFollow) {}

    // Expression
    try {
      if (prop.canSetExpression) {
        result.expressionEnabled = prop.expressionEnabled;
        if (prop.expression && prop.expression.length > 0) {
          result.expression = prop.expression;
        }
      }
    } catch(e2) {}

    // Keyframes
    if (prop.numKeys > 0) {
      result.keyframes = extractKeyframes(prop, fps);
    }

  } else if (prop.propertyType === PropertyType.INDEXED_GROUP ||
             prop.propertyType === PropertyType.NAMED_GROUP) {
    // Property group -- recurse
    result.type = "group";
    result.numProperties = prop.numProperties;
    result.properties = [];

    // Determine pruning threshold: shape content + mask paths get deeper extraction
    var pruneDepth = forceAll ? 999 : 5;

    for (var i = 1; i <= prop.numProperties; i++) {
      try {
        var child = prop.property(i);
        // Skip unmodified properties in deep groups to save space
        if (depth > pruneDepth && !isModified(child)) continue;
        var extracted = extractProperty(child, fps, depth + 1, forceAll);
        if (extracted) result.properties.push(extracted);
      } catch(e3) {}
    }
    if (result.properties.length === 0) delete result.properties;
  }

  return result;
}

function isModified(prop) {
  try {
    if (prop.propertyType === PropertyType.PROPERTY) {
      if (prop.numKeys > 0) return true;
      if (prop.expressionEnabled) return true;
      if (!prop.isModified) return false;
      return true;
    }
    // For groups, check if any child is modified
    for (var i = 1; i <= prop.numProperties; i++) {
      if (isModified(prop.property(i))) return true;
    }
  } catch(e) {}
  return false;
}

// ---- Transform extraction (common to most layers) ----

function extractTransformGroup(layer, fps) {
  try {
    var tf = layer.property("ADBE Transform Group");
    if (!tf) return null;
    return extractProperty(tf, fps, 0);
  } catch(e) {
    return null;
  }
}

// ---- Effects extraction ----

function extractEffects(layer, fps) {
  try {
    var efGroup = layer.property("ADBE Effect Parade");
    if (!efGroup || efGroup.numProperties === 0) return [];
    var effects = [];
    for (var i = 1; i <= efGroup.numProperties; i++) {
      var ef = efGroup.property(i);
      var extracted = {
        name: ef.name,
        matchName: ef.matchName,
        enabled: ef.enabled,
        params: []
      };
      for (var j = 1; j <= ef.numProperties; j++) {
        try {
          var param = extractProperty(ef.property(j), fps, 1, false);
          if (param) extracted.params.push(param);
        } catch(e2) {}
      }
      effects.push(extracted);
    }
    return effects;
  } catch(e) {
    return [];
  }
}

// ---- Text extraction ----

function extractTextDocument(layer) {
  try {
    var textProp = layer.property("ADBE Text Properties").property("ADBE Text Document");
    if (!textProp) return null;
    var doc = textProp.value;
    var result = serializeTextDoc(doc);
    // Additional properties available via layer context
    try { result.baselineLocs = serializeValue(doc.baselineLocs); } catch(e10) {}
    try { result.strokeOverFill = doc.strokeOverFill; } catch(e13) {}
    // Keyframed text document (text changes over time)
    if (textProp.numKeys > 0) {
      result.keyframes = [];
      for (var ki = 1; ki <= textProp.numKeys; ki++) {
        var kDoc = textProp.keyValue(ki);
        result.keyframes.push({
          time: roundN(textProp.keyTime(ki), 4),
          frame: Math.round(textProp.keyTime(ki) * layer.containingComp.frameRate),
          value: serializeTextDoc(kDoc)
        });
      }
    }
    return result;
  } catch(e) {
    return null;
  }
}

function extractTextAnimators(layer, fps) {
  try {
    var animators = layer.property("ADBE Text Properties").property("ADBE Text Animators");
    if (!animators || animators.numProperties === 0) return [];
    var result = [];
    for (var i = 1; i <= animators.numProperties; i++) {
      var animator = animators.property(i);
      result.push(extractProperty(animator, fps, 1));
    }
    return result;
  } catch(e) {
    return [];
  }
}

// ---- Layer Styles extraction ----

function extractLayerStyles(layer, fps) {
  try {
    var styles = layer.property("ADBE Layer Styles");
    if (!styles || styles.numProperties === 0) return null;
    return extractProperty(styles, fps, 1);
  } catch(e) {
    return null;
  }
}

// ---- Mask extraction ----

function extractMasks(layer, fps) {
  try {
    var maskGroup = layer.property("ADBE Mask Parade");
    if (!maskGroup || maskGroup.numProperties === 0) return [];
    var masks = [];
    for (var i = 1; i <= maskGroup.numProperties; i++) {
      var mask = maskGroup.property(i);
      masks.push(extractProperty(mask, fps, 1, true));
    }
    return masks;
  } catch(e) {
    return [];
  }
}

// ---- Camera-specific properties ----

function extractCameraOptions(layer, fps) {
  try {
    var opts = layer.property("ADBE Camera Options Group");
    if (!opts) return null;
    return extractProperty(opts, fps, 0);
  } catch(e) {
    return null;
  }
}

// ---- Light-specific properties ----

function extractLightOptions(layer, fps) {
  try {
    var opts = layer.property("ADBE Light Options Group");
    if (!opts) return null;
    return extractProperty(opts, fps, 0);
  } catch(e) {
    return null;
  }
}

// ---- Marker extraction ----

function extractMarkers(markerProp) {
  if (!markerProp || markerProp.numKeys === 0) return [];
  var markers = [];
  for (var i = 1; i <= markerProp.numKeys; i++) {
    var mv = markerProp.keyValue(i);
    markers.push({
      time: roundN(markerProp.keyTime(i), 4),
      comment: mv.comment || "",
      duration: mv.duration || 0,
      chapter: mv.chapter || ""
    });
  }
  return markers;
}

// ---- Layer extraction ----

function extractLayer(layer, fps) {
  var result = {
    index: layer.index,
    name: layer.name,
    type: layerTypeName(layer),
    enabled: layer.enabled,
    solo: layer.solo,
    shy: layer.shy,
    locked: layer.locked,
    inPoint: roundN(layer.inPoint, 4),
    outPoint: roundN(layer.outPoint, 4),
    startTime: roundN(layer.startTime, 4),
    inFrame: Math.round(layer.inPoint * fps),
    outFrame: Math.round(layer.outPoint * fps),
    durationSec: roundN(layer.outPoint - layer.inPoint, 4),
    durationFrames: Math.round((layer.outPoint - layer.inPoint) * fps)
  };

  // Parent
  if (layer.parent) {
    result.parentIndex = layer.parent.index;
    result.parentName = layer.parent.name;
  }

  // 3D
  try { result.threeDLayer = layer.threeDLayer; } catch(e) {}

  // Layer flags
  try { result.nullLayer = layer.nullLayer; } catch(eNull) {}
  try { result.adjustmentLayer = layer.adjustmentLayer; } catch(eAdj) {}
  try { result.guideLayer = layer.guideLayer; } catch(eGuide) {}
  try { result.preserveTransparency = layer.preserveTransparency; } catch(ePT) {}

  // Auto-orient
  try { result.autoOrient = autoOrientName(layer.autoOrient); } catch(eAO) {}

  // Blend mode
  try { result.blendingMode = blendModeName(layer.blendingMode); } catch(e2) {}

  // Track matte — both "uses matte" and "is matte"
  try {
    if (layer.trackMatteType !== undefined) {
      result.trackMatteType = trackMatteTypeName(layer.trackMatteType);
    }
  } catch(e3) {}
  try { result.hasTrackMatte = layer.hasTrackMatte; } catch(eHTM) {}
  try { result.isTrackMatte = layer.isTrackMatte; } catch(eITM) {}

  // Source info — dimensions, solid color, footage path
  try {
    if (layer instanceof AVLayer && layer.source) {
      result.sourceWidth = layer.source.width;
      result.sourceHeight = layer.source.height;
      result.sourceName = layer.source.name;
      // Solid color
      try {
        if (layer.source.mainSource && layer.source.mainSource instanceof SolidSource) {
          result.solidColor = serializeValue(layer.source.mainSource.color);
        }
      } catch(eSolid) {}
      // Footage file path
      try {
        if (layer.source.mainSource && layer.source.mainSource.file) {
          result.sourceFilePath = layer.source.mainSource.file.fsName;
        }
      } catch(eFoot) {}
    }
  } catch(eSrc) {}

  // Layer dimensions (pixel bounds)
  try { result.width = layer.width; } catch(eW) {}
  try { result.height = layer.height; } catch(eH) {}

  // Time remap
  try {
    result.timeRemapEnabled = layer.timeRemapEnabled;
    if (layer.timeRemapEnabled) {
      var trProp = layer.property("ADBE Time Remapping");
      if (trProp) result.timeRemap = extractProperty(trProp, fps, 0);
    }
  } catch(e4) {}

  // Motion blur
  try { result.motionBlur = layer.motionBlur; } catch(e5) {}

  // Collapse transformations / continuously rasterize
  try { result.collapseTransformation = layer.collapseTransformation; } catch(e6) {}

  // Frame blending
  try {
    if (layer.frameBlendingType !== undefined) {
      result.frameBlending = String(layer.frameBlendingType);
    }
  } catch(eFB) {}

  // Time stretch (100 = normal speed; <100 = slower, >100 = faster)
  try { result.stretch = roundN(layer.stretch, 2); } catch(eStretch) {}

  // Effects active toggle (global on/off for all effects on this layer)
  try { result.effectsActive = layer.effectsActive; } catch(eEA) {}

  // Layer comment (designer notes)
  try {
    if (layer.comment && layer.comment.length > 0) {
      result.comment = layer.comment;
    }
  } catch(eComment) {}

  // Transform
  var transform = extractTransformGroup(layer, fps);
  if (transform) result.transform = transform;

  // Effects
  var effects = extractEffects(layer, fps);
  if (effects.length > 0) result.effects = effects;

  // Masks
  var masks = extractMasks(layer, fps);
  if (masks.length > 0) result.masks = masks;

  // Layer styles
  var styles = extractLayerStyles(layer, fps);
  if (styles) result.layerStyles = styles;

  // Text-specific
  if (layer instanceof TextLayer) {
    var textDoc = extractTextDocument(layer);
    if (textDoc) result.textDocument = textDoc;
    var animators = extractTextAnimators(layer, fps);
    if (animators.length > 0) result.textAnimators = animators;

    // Text path, more options
    try {
      var moreOpts = layer.property("ADBE Text Properties").property("ADBE Text More Options");
      if (moreOpts) result.textMoreOptions = extractProperty(moreOpts, fps, 1);
    } catch(e7) {}
  }

  // Camera-specific
  if (layer instanceof CameraLayer) {
    var camOpts = extractCameraOptions(layer, fps);
    if (camOpts) result.cameraOptions = camOpts;
  }

  // Light-specific
  if (layer instanceof LightLayer) {
    var lightOpts = extractLightOptions(layer, fps);
    if (lightOpts) result.lightOptions = lightOpts;
  }

  // Source composition (for precomps)
  if (layer instanceof AVLayer && layer.source instanceof CompItem) {
    result.sourceCompName = layer.source.name;
    result.sourceCompId = layer.source.id;
  }

  // Layer markers
  try {
    var markers = extractMarkers(layer.property("ADBE Marker"));
    if (markers.length > 0) result.markers = markers;
  } catch(e8) {}

  // Shape layer content — use forceAll=true to prevent pruning of fills/strokes/paths
  if (layer instanceof ShapeLayer) {
    try {
      var contents = layer.property("ADBE Root Vectors Group");
      if (contents) result.shapeContent = extractProperty(contents, fps, 0, true);
    } catch(e9) {}
  }

  return result;
}

// ---- Composition extraction ----

function extractComp(comp) {
  var fps = comp.frameRate;
  var result = {
    name: comp.name,
    id: comp.id,
    width: comp.width,
    height: comp.height,
    pixelAspect: comp.pixelAspect,
    fps: fps,
    duration: roundN(comp.duration, 4),
    totalFrames: Math.round(comp.duration * fps),
    displayStartTime: roundN(comp.displayStartTime, 4),
    bgColor: serializeValue(comp.bgColor),
    motionBlur: comp.motionBlur,
    motionBlurSamplesPerFrame: comp.motionBlurSamplesPerFrame,
    motionBlurAdaptiveSampleLimit: comp.motionBlurAdaptiveSampleLimit,
    shutterAngle: comp.shutterAngle,
    shutterPhase: comp.shutterPhase,
    renderer: comp.renderer,
    preserveNestedFrameRate: comp.preserveNestedFrameRate,
    preserveNestedResolution: comp.preserveNestedResolution
  };

  // Comp markers
  try {
    var compMarkers = extractMarkers(comp.markerProperty);
    if (compMarkers.length > 0) result.markers = compMarkers;
  } catch(e) {}

  // Layers
  result.layers = [];
  for (var i = 1; i <= comp.numLayers; i++) {
    result.layers.push(extractLayer(comp.layer(i), fps));
  }

  return result;
}

// ---- Precomp resolution ----

function findAllPrecomps(compData, project) {
  var precompIds = [];
  for (var i = 0; i < compData.layers.length; i++) {
    var layer = compData.layers[i];
    if (layer.type === "precomp" && layer.sourceCompId) {
      precompIds.push(layer.sourceCompId);
    }
  }
  return precompIds;
}

function extractAllComps(mainComp, project) {
  var allComps = {};
  var queue = [mainComp];
  var visited = {};

  while (queue.length > 0) {
    var comp = queue.shift();
    if (visited[comp.id]) continue;
    visited[comp.id] = true;

    var data = extractComp(comp);
    allComps[comp.name] = data;

    // Find precomp references and add to queue
    for (var i = 0; i < data.layers.length; i++) {
      var layer = data.layers[i];
      if (layer.type === "precomp" && layer.sourceCompId) {
        // Find the comp in the project
        for (var j = 1; j <= project.numItems; j++) {
          if (project.item(j) instanceof CompItem && project.item(j).id === layer.sourceCompId) {
            queue.push(project.item(j));
            break;
          }
        }
      }
    }
  }

  return allComps;
}

// ---- Main ----

function main() {
  if (!app.project || !app.project.activeItem || !(app.project.activeItem instanceof CompItem)) {
    alert("ae-extract: Please select a composition before running this script.");
    return;
  }

  var comp = app.project.activeItem;
  var outputDir = getOutputDir();

  // Ensure output directory exists
  var outFolder = new Folder(outputDir);
  if (!outFolder.exists) outFolder.create();

  var safeName = comp.name.replace(/[^a-zA-Z0-9_\-]/g, "_");
  var outputPath = outputDir + "/" + safeName + ".ae-extract.json";

  $.writeln("[STAGE] Extracting composition: " + comp.name);
  $.writeln("[INFO] Output: " + outputPath);

  // Extract main comp and all precomps
  var allComps = extractAllComps(comp, app.project);

  // Project-level metadata
  var projectInfo = {};
  try { projectInfo.bitsPerChannel = app.project.bitsPerChannel; } catch(eBPC) {}
  try { projectInfo.linearBlending = app.project.linearBlending; } catch(eLB) {}
  try { projectInfo.expressionEngine = app.project.expressionEngine; } catch(eEE) {}
  try { projectInfo.gpuAccelType = String(app.project.gpuAccelType); } catch(eGPU) {}

  // Build the manifest
  var manifest = {
    extractorVersion: "2.0.0",
    extractedAt: new Date().toISOString(),
    projectName: app.project.file ? app.project.file.name : "untitled",
    projectPath: app.project.file ? app.project.file.fsName : null,
    projectSettings: projectInfo,
    mainComposition: comp.name,
    compositions: allComps
  };

  // Write JSON
  var outFile = new File(outputPath);
  outFile.encoding = "UTF-8";
  outFile.open("w");
  outFile.write(JSON.stringify(manifest, null, 2));
  outFile.close();

  $.writeln("[DONE] " + outputPath);
  $.writeln("[INFO] Extracted " + countKeys(allComps) + " compositions");

  // Also show alert in GUI mode
  try {
    alert("ae-extract complete!\n\nSaved to:\n" + outputPath +
          "\n\nCompositions: " + countKeys(allComps) +
          "\nMain comp layers: " + allComps[comp.name].layers.length);
  } catch(e) {}
}

function countKeys(obj) {
  var c = 0;
  for (var k in obj) { if (obj.hasOwnProperty(k)) c++; }
  return c;
}

main();
