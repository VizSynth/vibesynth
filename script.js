"use strict";

/**
 * Modern Node-Based Visual Synthesizer
 * Features a sleek, graph-based interface with visual node connections,
 * drag-and-drop functionality, and professional visual compositing capabilities.
 */

/** Logging System with Levels */
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

const Logger = {
  level: LogLevel.INFO, // Default log level

  setLevel(level) {
    this.level = level;
  },

  error(...args) {
    if (this.level >= LogLevel.ERROR) console.error(...args);
  },

  warn(...args) {
    if (this.level >= LogLevel.WARN) console.warn(...args);
  },

  info(...args) {
    if (this.level >= LogLevel.INFO) console.log(...args);
  },

  debug(...args) {
    if (this.level >= LogLevel.DEBUG) console.log('🔍', ...args);
  },

  trace(...args) {
    if (this.level >= LogLevel.TRACE) console.log('🔬', ...args);
  }
};

// Make logger globally accessible
window.Logger = Logger;
window.LogLevel = LogLevel;


/** Parameter Validation System */
const PARAMETER_CONSTRAINTS = {
  // Numeric parameters with ranges
  frequency: { type: 'number', min: 0, max: 50, step: 0.1, default: 10.0 },
  sync: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.1 },
  mix: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.5 },
  opacity: { type: 'number', min: 0, max: 1, step: 0.01, default: 1.0 },
  brightness: { type: 'number', min: -1, max: 1, step: 0.01, default: 0.0 },
  contrast: { type: 'number', min: 0, max: 2, step: 0.01, default: 1.0 },
  saturation: { type: 'number', min: 0, max: 2, step: 0.01, default: 1.0 },
  radius: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.5 },
  softness: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.1 },
  colorIndex: { type: 'number', min: 0, max: 12, step: 0.1, default: 0.0 },
  colorSpeed: { type: 'number', min: 0, max: 10, step: 0.1, default: 1.0 },
  rotation: { type: 'number', min: 0, max: 360, step: 1, default: 0 },
  positionX: { type: 'number', min: -1, max: 1, step: 0.01, default: 0.0 },
  positionY: { type: 'number', min: -1, max: 1, step: 0.01, default: 0.0 },
  scaleX: { type: 'number', min: 0, max: 3, step: 0.01, default: 1.0 },
  scaleY: { type: 'number', min: 0, max: 3, step: 0.01, default: 1.0 },
  slices: { type: 'integer', min: 1, max: 12, step: 1, default: 6 },
  offset: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.5 },
  
  // New source node parameters
  octaves: { type: 'integer', min: 1, max: 8, step: 1, default: 5 },
  lacunarity: { type: 'number', min: 1, max: 4, step: 0.1, default: 2.1 },
  gain: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.5 },
  speed: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.08 },
  scale: { type: 'number', min: 1, max: 20, step: 0.1, default: 6 },
  exponent: { type: 'number', min: 0.1, max: 5, step: 0.1, default: 1.6 },
  fieldScale: { type: 'number', min: 0.1, max: 5, step: 0.1, default: 1.7 },
  timeWarp: { type: 'number', min: 0, max: 2, step: 0.01, default: 0.4 },
  resolution: { type: 'integer', min: 240, max: 1920, step: 80, default: 640 },
  fps: { type: 'integer', min: 15, max: 60, step: 5, default: 30 },
  
  // New effect node parameters
  mode: { type: 'string', values: ['horizontal', 'vertical', 'radial'], default: 'radial' },
  sides: { type: 'integer', min: 2, max: 16, step: 1, default: 6 },
  amplitude: { type: 'number', min: 0, max: 0.5, step: 0.01, default: 0.08 },
  innerRadius: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.1 },
  twist: { type: 'number', min: -3, max: 3, step: 0.1, default: 0.3 },
  falloff: { type: 'number', min: 0, max: 2, step: 0.01, default: 0.85 },
  decay: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.92 },
  blur: { type: 'number', min: 0, max: 10, step: 0.1, default: 2 },
  threshold: { type: 'number', min: 0, max: 1, step: 0.01, default: 0.75 },
  strength: { type: 'number', min: 0, max: 3, step: 0.1, default: 1.2 },

  // Random node parameters
  interval: { type: 'number', min: 0.01, max: 10, step: 0.01, default: 0.1 },
  min: { type: 'number', min: -100, max: 100, step: 0.01, default: 0.0 },
  max: { type: 'number', min: -100, max: 100, step: 0.01, default: 1.0 },

  // Input node parameters
  ccNumber: { type: 'integer', min: 1, max: 127, step: 1, default: 1 },
  band: { type: 'string', values: ['overall', 'bass', 'lowMids', 'mids', 'highMids', 'highs'], default: 'overall' },
  component: {
    type: 'string',
    values: ['x', 'y', 'velocity', 'click', 'motionX', 'brightness', 'motion', 'contrast'],
    default: 'x'
  },
  deadzone: { type: 'number', min: 0, max: 0.5, step: 0.01, default: 0.1 },
  smoothing: { type: 'number', min: 0, max: 0.99, step: 0.01, default: 0.0 },

  // String parameters with allowed values
  colorPalette: {
    type: 'string',
    values: ['rainbow', 'sunset', 'ocean', 'forest', 'fire', 'purple', 'monochrome'],
    default: 'rainbow'
  },
  curve: {
    type: 'string',
    values: ['linear', 'exponential', 'logarithmic', 'sine', 'bounce'],
    default: 'linear'
  },
  direction: {
    type: 'string',
    values: ['up', 'down'],
    default: 'up'
  },
  mode: {
    type: 'string', 
    values: ['one-way', 'round-trip'],
    default: 'one-way'
  },
  blendMode: { type: 'string', values: ['Normal', 'Multiply', 'Screen', 'Overlay'], default: 'Normal' },
  color: { type: 'color', default: '#ff0000' }
};

/**
 * Validates a parameter value against its constraints
 * @param {string} paramName - The parameter name
 * @param {any} value - The value to validate
 * @returns {Object} { isValid: boolean, value: any, error?: string }
 */
function validateParameter(paramName, value) {
  const constraint = PARAMETER_CONSTRAINTS[paramName];

  if (!constraint) {
    // No constraints defined, allow any value
    return { isValid: true, value: value };
  }

  try {
    switch (constraint.type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) {
          return { isValid: false, value: constraint.default, error: `${paramName} must be a number` };
        }
        const clampedNum = Math.max(constraint.min, Math.min(constraint.max, num));
        return {
          isValid: clampedNum === num,
          value: clampedNum,
          error: clampedNum !== num
            ? `${paramName} clamped to range [${constraint.min}, ${constraint.max}]`
            : undefined
        };

      case 'integer':
        const int = parseInt(value);
        if (isNaN(int)) {
          return { isValid: false, value: constraint.default, error: `${paramName} must be an integer` };
        }
        const clampedInt = Math.max(constraint.min, Math.min(constraint.max, int));
        return {
          isValid: clampedInt === int,
          value: clampedInt,
          error: clampedInt !== int
            ? `${paramName} clamped to range [${constraint.min}, ${constraint.max}]`
            : undefined
        };

      case 'string':
        if (constraint.values && !constraint.values.includes(value)) {
          return {
            isValid: false,
            value: constraint.default,
            error: `${paramName} must be one of: ${constraint.values.join(', ')}`
          };
        }
        return { isValid: true, value: value };

      case 'color':
        const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!colorRegex.test(value)) {
          return {
            isValid: false,
            value: constraint.default,
            error: `${paramName} must be a valid hex color (e.g., #ff0000)`
          };
        }
        return { isValid: true, value: value };

      default:
        return { isValid: true, value: value };
    }
  } catch (error) {
    return {
      isValid: false,
      value: constraint.default,
      error: `Validation error for ${paramName}: ${error.message}`
    };
  }
}

/**
 * Gets parameter constraints for UI generation
 * @param {string} paramName - The parameter name
 * @returns {Object|null} The constraint object or null if none exists
 */
function getParameterConstraints(paramName) {
  return PARAMETER_CONSTRAINTS[paramName] || null;
}

/**
 * Validates all parameters for a node
 * @param {Object} node - The node to validate
 * @returns {Object} { isValid: boolean, errors: Array, correctedParams: Object }
 */
function validateNodeParameters(node) {
  const errors = [];
  const correctedParams = { ...node.params };
  let hasChanges = false;

  for (const [paramName, value] of Object.entries(node.params)) {
    const result = validateParameter(paramName, value);
    if (!result.isValid) {
      errors.push(result.error);
      correctedParams[paramName] = result.value;
      hasChanges = true;
    } else if (result.value !== value) {
      // Value was clamped
      correctedParams[paramName] = result.value;
      hasChanges = true;
      if (result.error) {
        errors.push(result.error);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
    correctedParams: hasChanges ? correctedParams : null
  };
}

/** Global WebGL variables */
let gl;
let canvas;
const programs = {};
const quadBuffer = {};

/** WebGL Error Handling & Recovery System */
let webglSupported = true;
let webglContextLost = false;
let lastWebGLError = null;
const webglErrorCallbacks = new Set();

/**
 * Check for WebGL errors and handle them gracefully
 * @param {string} operation - Description of the operation that might have failed
 * @returns {boolean} - True if no errors, false if errors occurred
 */
function checkWebGLError(operation = 'WebGL operation') {
  if (!gl || webglContextLost) return false;

  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    const errorName = getWebGLErrorName(error);
    const errorMessage = `WebGL Error in ${operation}: ${errorName} (${error})`;
    Logger.error(errorMessage);
    lastWebGLError = { operation, error, errorName, timestamp: Date.now() };

    // Notify error callbacks
    webglErrorCallbacks.forEach(callback => {
      try {
        callback(lastWebGLError);
      } catch (e) {
        Logger.error('Error in WebGL error callback:', e);
      }
    });

    return false;
  }
  return true;
}

/**
 * Convert WebGL error code to human-readable name
 */
function getWebGLErrorName(error) {
  if (!gl) return 'Unknown';

  const errorNames = {
    [gl.NO_ERROR]: 'NO_ERROR',
    [gl.INVALID_ENUM]: 'INVALID_ENUM',
    [gl.INVALID_VALUE]: 'INVALID_VALUE',
    [gl.INVALID_OPERATION]: 'INVALID_OPERATION',
    [gl.INVALID_FRAMEBUFFER_OPERATION]: 'INVALID_FRAMEBUFFER_OPERATION',
    [gl.OUT_OF_MEMORY]: 'OUT_OF_MEMORY',
    [gl.CONTEXT_LOST_WEBGL]: 'CONTEXT_LOST_WEBGL'
  };

  return errorNames[error] || `Unknown Error (${error})`;
}

/**
 * Safe wrapper for WebGL operations with error handling
 * @param {Function} operation - The WebGL operation to perform
 * @param {string} description - Description for error reporting
 * @param {any} fallbackValue - Value to return if operation fails
 * @returns {any} - Result of operation or fallback value
 */
function safeWebGLOperation(operation, description, fallbackValue = null) {
  if (!gl || webglContextLost) {
    Logger.warn(`Skipping ${description} - WebGL not available`);
    return fallbackValue;
  }

  try {
    const result = operation();
    if (!checkWebGLError(description)) {
      return fallbackValue;
    }
    return result;
  } catch (error) {
    Logger.error(`Exception in ${description}:`, error);
    return fallbackValue;
  }
}

/**
 * Register callback for WebGL errors
 */
function onWebGLError(callback) {
  webglErrorCallbacks.add(callback);
  return () => webglErrorCallbacks.delete(callback);
}

/**
 * Check if WebGL is in a usable state
 */
function isWebGLHealthy() {
  return webglSupported && !webglContextLost && gl && gl.isContextLost && !gl.isContextLost();
}

/** Feature Detection & Graceful Degradation System */
const featureSupport = {
  webgl: false,
  webgl2: false,
  oes_texture_float: false,
  oes_texture_half_float: false,
  webgl_depth_texture: false,
  ext_frag_depth: false,
  webgl_draw_buffers: false,
  getUserMedia: false,
  audioContext: false,
  midi: false,
  fallbackMode: false
};

/**
 * Detect WebGL and extension support
 */
function detectWebGLFeatures() {
  Logger.debug('Detecting WebGL features...');

  // Test basic WebGL support
  const testCanvas = document.createElement('canvas');
  const testGL = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');

  if (testGL) {
    featureSupport.webgl = true;

    // Test WebGL 2.0
    const testGL2 = testCanvas.getContext('webgl2');
    featureSupport.webgl2 = !!testGL2;

    // Test extensions
    featureSupport.oes_texture_float = !!testGL.getExtension('OES_texture_float');
    featureSupport.oes_texture_half_float = !!testGL.getExtension('OES_texture_half_float');
    featureSupport.webgl_depth_texture = !!testGL.getExtension('WEBGL_depth_texture');
    featureSupport.ext_frag_depth = !!testGL.getExtension('EXT_frag_depth');
    featureSupport.webgl_draw_buffers = !!testGL.getExtension('WEBGL_draw_buffers');

    Logger.info('WebGL supported');
  } else {
    Logger.error('WebGL not supported');
    featureSupport.fallbackMode = true;
  }

  // Test getUserMedia support
  featureSupport.getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  // Test Web Audio API support
  featureSupport.audioContext = !!(window.AudioContext || window.webkitAudioContext);

  // Test MIDI support
  featureSupport.midi = !!navigator.requestMIDIAccess;

  Logger.info('Feature Support:', featureSupport);
  return featureSupport;
}

/**
 * Get fallback shader for unsupported features
 */
function getFallbackShader(nodeType, reason = 'feature unsupported') {
  Logger.warn(`Using fallback shader for ${nodeType}: ${reason}`);

  // Simple fallback fragment shader that just shows a solid color or pattern
  return `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    varying vec2 v_uv;

    void main() {
      // Simple animated gradient fallback
      float t = u_time * 0.5;
      vec3 color1 = vec3(0.5 + 0.5 * sin(t), 0.5 + 0.5 * cos(t), 0.7);
      vec3 color2 = vec3(0.8, 0.4 + 0.4 * sin(t * 1.3), 0.6);

      float gradient = smoothstep(0.0, 1.0, v_uv.y);
      vec3 color = mix(color1, color2, gradient);

      // Add some pattern to indicate this is a fallback
      float pattern = sin(v_uv.x * 20.0) * sin(v_uv.y * 20.0) * 0.1;
      color += pattern;

      gl_FragColor = vec4(color, 1.0);
    }
  `;
}

/**
 * Create fallback program for nodes that can't compile their shaders
 */
function createFallbackProgram(nodeType, originalError) {
  Logger.debug(`Creating fallback program for ${nodeType} due to: ${originalError}`);

  const vertShader = compileShader(gl.VERTEX_SHADER, `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `);

  if (!vertShader) {
    Logger.error('Even fallback vertex shader failed!');
    return null;
  }

  const fallbackFragSource = getFallbackShader(nodeType, originalError);
  const fragShader = compileShader(gl.FRAGMENT_SHADER, fallbackFragSource);

  if (!fragShader) {
    Logger.error('Fallback fragment shader failed!');
    return null;
  }

  const program = createProgram(vertShader, fragShader);
  if (program) {
    program.isFallback = true;
    program.fallbackReason = originalError;
  }
  return program;
}

/**
 * Handle unsupported node creation gracefully
 */
function createFallbackNode(nodeType, x, y, reason) {
  Logger.debug(`Creating fallback node for ${nodeType}: ${reason}`);

  // Create a basic node with fallback behavior
  const node = {
    id: generateNodeId(),
    type: nodeType,
    name: `${nodeType} (Fallback)`,
    category: 'fallback',
    x: x,
    y: y,
    enabled: true,
    inputs: [],
    controlInputs: [],
    params: {
      // Basic params that work everywhere
      opacity: 1.0,
      mix: 0.5
    },
    fallbackReason: reason,
    isFallback: true
  };

  return node;
}

/**
 * Show fallback notification to user
 */
function showFallbackNotification(feature, reason, impact) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: #f59e0b;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 9999;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease-out;
  `;

  notification.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 4px;">⚠️ Feature Limitation</div>
    <div style="font-size: 14px; margin-bottom: 8px;">${feature}: ${reason}</div>
    <div style="font-size: 12px; opacity: 0.9;">${impact}</div>
    <button onclick="this.parentElement.remove()"
            style="position: absolute; top: 4px; right: 8px; background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
  `;

  document.body.appendChild(notification);

  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
}

/**
 * Initialize fallback systems based on feature detection
 */
function initializeGracefulDegradation() {
  detectWebGLFeatures();

  // Set up fallback behaviors
  if (!featureSupport.webgl) {
    showFallbackNotification(
      'WebGL',
      'Not supported in this browser',
      'Visual synthesis disabled. Please use a modern browser with WebGL support.'
    );
    featureSupport.fallbackMode = true;
    return false;
  }

  if (!featureSupport.oes_texture_float) {
    showFallbackNotification(
      'Floating Point Textures',
      'Extension not available',
      'Some advanced effects may appear simplified.'
    );
  }

  if (!featureSupport.getUserMedia) {
    showFallbackNotification(
      'Camera Access',
      'getUserMedia not supported',
      'Video input nodes will not function.'
    );
  }

  if (!featureSupport.audioContext) {
    showFallbackNotification(
      'Web Audio API',
      'Not supported in this browser',
      'Audio analysis features disabled.'
    );
  }

  if (!featureSupport.midi) {
    showFallbackNotification(
      'MIDI Support',
      'Web MIDI API not available',
      'MIDI input nodes will not function.'
    );
  }

  return true;
}

/** Memory Management & Resource Tracking System */
const resourceTracker = {
  textures: new Set(),
  framebuffers: new Set(),
  buffers: new Set(),
  programs: new Set(),
  shaders: new Set(),
  videoStreams: new Set(),
  eventListeners: new Map(),
  intervalIds: new Set(),
  animationIds: new Set()
};

/**
 * Track WebGL resource creation - DISABLED to prevent framebuffer crashes
 */
function trackResource(type, resource, nodeId = null) {
  // DISABLED: Resource tracking was causing WebGL crashes with deleted framebuffers
  // Simply return the resource without tracking
  return resource;
}

/**
 * Untrack and cleanup WebGL resource
 */
function cleanupResource(type, resource) {
  // DISABLED: Resource cleanup tracking was causing WebGL crashes with deleted framebuffers
  // The original code worked fine without this aggressive tracking system
  return;
}

/**
 * Cleanup all resources for a specific node - DISABLED to prevent crashes
 */
function cleanupNodeResources(nodeId) {
  // DISABLED: Resource tracking cleanup was causing WebGL crashes with deleted framebuffers
  // Let the direct node deletion handle cleanup instead
  return;
}

/**
 * Track event listener for cleanup
 */
function trackEventListener(nodeId, element, event, handler) {
  if (!resourceTracker.eventListeners.has(nodeId)) {
    resourceTracker.eventListeners.set(nodeId, []);
  }
  resourceTracker.eventListeners.get(nodeId).push({ element, event, handler });
}

/**
 * Get memory usage statistics
 */
function getMemoryStats() {
  return {
    textures: resourceTracker.textures.size,
    framebuffers: resourceTracker.framebuffers.size,
    buffers: resourceTracker.buffers.size,
    programs: resourceTracker.programs.size,
    shaders: resourceTracker.shaders.size,
    videoStreams: resourceTracker.videoStreams.size,
    eventListeners: resourceTracker.eventListeners.size,
    intervals: resourceTracker.intervalIds.size,
    animations: resourceTracker.animationIds.size
  };
}

/**
 * Force cleanup of orphaned resources
 */
function forceCleanupOrphanedResources() {
  Logger.debug('Force cleaning orphaned resources...');

  const nodeIds = new Set(nodes.map(n => n.id));

  // Clean up resources for nodes that no longer exist
  ['textures', 'framebuffers', 'buffers', 'videoStreams'].forEach(type => {
    const tracker = resourceTracker[type];
    for (const tracked of tracker) {
      if (tracked.nodeId && !nodeIds.has(tracked.nodeId)) {
        Logger.debug(`Cleaning orphaned ${type.slice(0, -1)} from deleted node ${tracked.nodeId}`);
        const resourceType = type.slice(0, -1); // Remove 's'
        cleanupResource(resourceType, tracked.resource);
      }
    }
  });

  // Clean up event listeners for deleted nodes
  for (const [nodeId, listeners] of resourceTracker.eventListeners) {
    if (!nodeIds.has(nodeId)) {
      Logger.debug(`Cleaning orphaned event listeners from deleted node ${nodeId}`);
      listeners.forEach(({ element, event, handler }) => {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          Logger.warn('Error removing orphaned event listener:', error);
        }
      });
      resourceTracker.eventListeners.delete(nodeId);
    }
  }
}

/** Animation state */
let startTime = Date.now();
let animationFrameId;

/** Node system */
const nodes = [];
let nodeCount = 0;
let selectedNode = null;
let mainOutputNode = null;


// Node type definitions for UI
const nodeDefinitions = {
  // Sources
  Oscillator: { inputs: [] },
  Noise: { inputs: [] },
  Shape: { inputs: [] },
  Video: { inputs: [] },
  Camera: { inputs: [] },
  Plasma: { inputs: [] },
  Voronoi: { inputs: [] },
  RadialGradient: { inputs: [] },
  FlowField: { inputs: [] },
  Text: { inputs: [] },
  VideoFileInput: { inputs: [] },

  // Effects
  Transform: { inputs: [{ name: 'Input' }] },
  ColorAdjust: { inputs: [{ name: 'Input' }] },
  Kaleidoscope: { inputs: [{ name: 'Input' }] },
  Mirror: { inputs: [{ name: 'Input' }] },
  NoiseDisplace: { inputs: [{ name: 'Input' }] },
  PolarWarp: { inputs: [{ name: 'Input' }] },
  RGBSplit: { inputs: [{ name: 'Input' }] },
  FeedbackTrail: { inputs: [{ name: 'Input' }] },
  Bloom: { inputs: [{ name: 'Input' }] },

  // Compositing
  Mix: { inputs: [{ name: 'Input 1' }, { name: 'Input 2' }] },
  Layer: { inputs: [{ name: 'Base (Bottom)' }, { name: 'Blend (Top)' }] },
  Composite: { inputs: [{ name: 'Input 1' }, { name: 'Input 2' }, { name: 'Input 3' }, { name: 'Input 4' }] },

  // Control Inputs
  MIDIInput: { inputs: [] },
  AudioInput: { inputs: [] },
  CursorInput: { inputs: [] },
  CameraInput: { inputs: [] },
  GameControllerInput: { inputs: [] },
  RandomInput: { inputs: [] },
  RangeInput: { inputs: [] },

  // System
  Canvas: { inputs: [{ name: 'Input' }] },
  FinalOutput: { inputs: [{ name: 'Input' }] }
};

/** Undo/Redo system */
const undoStack = [];
const redoStack = [];
const MAX_UNDO_STATES = 50;
let isRestoringState = false;
let parameterChangeTimeout = null;

/** Copy/Paste system */
let clipboard = null;
const PASTE_OFFSET = 30; // Pixels to offset pasted nodes

/** Input tracking */
let mousePos = { x: 0, y: 0 };

/** Graph navigation */
let graphTransform = { x: 0, y: 0, scale: 1 };
window.graphTransform = graphTransform; // Make globally accessible
let isPanning = false;
let panStart = { x: 0, y: 0 };

/** Graph UI state */
let graphVisible = true;
let draggedNode = null;
let dragOffset = { x: 0, y: 0 };
let connectionStart = null;
let tempConnection = null;
let connectionUpdateTimer = null;

/** Auto-layout system */
let autoLayoutEnabled = true; // Enabled by default for better initial experience
const LAYOUT_CONFIG = {
  // Layer positions from left to right
  layers: {
    input: { x: 50, label: 'Inputs' },
    source: { x: 280, label: 'Sources' },
    effect: { x: 510, label: 'Effects' },
    compositing: { x: 740, label: 'Compositing' },
    system: { x: 970, label: 'Output' }
  },
  // Spacing between nodes - increased for better visibility
  nodeSpacing: { x: 220, y: 150 },
  // Padding around the layout
  padding: { x: 60, y: 100 }
};

/** Group system */
const groups = {};
let groupCount = 0;

/** MIDI integration */
let midiAccess = null;
let midiIn = null;
let lastMidiCC = null;
const midiMappings = {};

/** Audio integration */
let audioContext = null;
let microphone = null;
let analyser = null;
let frequencyData = null;
let audioEnabled = false;

// Audio analysis bands with enhanced metrics
const audioBands = {
  bass: { min: 0, max: 120, value: 0, rms: 0, peak: 0 },      // 0-120Hz bass
  lowMids: { min: 120, max: 500, value: 0, rms: 0, peak: 0 }, // 120-500Hz low mids
  mids: { min: 500, max: 2000, value: 0, rms: 0, peak: 0 },   // 500-2000Hz mids
  highMids: { min: 2000, max: 8000, value: 0, rms: 0, peak: 0 }, // 2-8kHz high mids
  highs: { min: 8000, max: 20000, value: 0, rms: 0, peak: 0 }, // 8-20kHz highs
  overall: { value: 0, rms: 0, peak: 0, lufs: 0 }              // Overall metrics
};

// Audio analysis state
let audioAnalysisBuffer = [];
let peakHoldTime = 0;

// Permission tracking system
const permissions = {
  audio: {
    requested: false,
    granted: false,
    denied: false
  },
  camera: {
    requested: false,
    granted: false,
    denied: false
  }
};

// Track which nodes need permissions
const nodesNeedingPermissions = {
  audio: new Set(),
  camera: new Set()
};

/**
 * Update permission UI based on current state
 */
function updatePermissionUI() {
  // Update any existing permission banner
  const existingBanner = document.getElementById('permission-banner');
  if (existingBanner) {
    existingBanner.remove();
  }
  
  // Check if any nodes need permissions
  nodesNeedingPermissions.audio.clear();
  nodesNeedingPermissions.camera.clear();
  
  nodes.forEach(node => {
    if (node.type === 'AudioInput' && !permissions.audio.granted) {
      nodesNeedingPermissions.audio.add(node.id);
    }
    if (node.type === 'Camera' && !permissions.camera.granted) {
      nodesNeedingPermissions.camera.add(node.id);
    }
  });
  
  // Show banner if permissions are needed
  const needsAudio = nodesNeedingPermissions.audio.size > 0 && !permissions.audio.denied;
  const needsCamera = nodesNeedingPermissions.camera.size > 0 && !permissions.camera.denied;
  
  if (needsAudio || needsCamera) {
    const banner = document.createElement('div');
    banner.id = 'permission-banner';
    banner.style.cssText = `
      position: fixed;
      top: 70px;
      left: 20px;
      background: #f59e0b;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideIn 0.3s ease-out;
    `;
    
    // Add animation CSS if not already present
    if (!document.getElementById('permission-banner-styles')) {
      const style = document.createElement('style');
      style.id = 'permission-banner-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        #permission-banner button:hover {
          opacity: 0.9;
          transform: scale(1.05);
          transition: all 0.2s ease;
        }
      `;
      document.head.appendChild(style);
    }
    
    let html = '<span class="material-icons">warning</span><div>';
    
    if (needsAudio && needsCamera) {
      html += 'Audio and Camera permissions needed';
    } else if (needsAudio) {
      html += 'Audio permission needed for Audio Input nodes';
    } else {
      html += 'Camera permission needed for Camera Input nodes';
    }
    
    html += '</div>';
    
    if (needsAudio) {
      html += `<button onclick="window.requestAudioPermission()" style="
        background: white;
        color: #f59e0b;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Enable Audio</button>`;
    }
    
    if (needsCamera) {
      html += `<button onclick="window.requestCameraPermission()" style="
        background: white;
        color: #f59e0b;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
      ">Enable Camera</button>`;
    }
    
    banner.innerHTML = html;
    document.body.appendChild(banner);
  }
  
  // Update node UI elements if properties panel is open
  if (selectedNode) {
    showNodeProperties(selectedNode);
  }
  
  // Refresh node elements to update permission buttons
  nodes.forEach(node => {
    if ((node.type === 'AudioInput' || node.type === 'Camera') && node.element) {
      // Re-create the node element to update permission button visibility
      const oldElement = node.element;
      createNodeElement(node);
      if (oldElement && oldElement.parentNode) {
        oldElement.remove();
      }
    }
  });
}

// Global functions for permission requests
window.requestAudioPermission = async function() {
  if (!audioEnabled) {
    try {
      permissions.audio.requested = true;
      updatePermissionUI();
      
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      microphone = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 4096;
      analyser.smoothingTimeConstant = 0.85;
      microphone.connect(analyser);
      frequencyData = new Uint8Array(analyser.frequencyBinCount);
      
      audioEnabled = true;
      permissions.audio.granted = true;
      permissions.audio.denied = false;
      updatePermissionUI();
      
      Logger.info('Audio permission granted');
    } catch (error) {
      Logger.error('Audio permission denied:', error);
      permissions.audio.denied = true;
      permissions.audio.granted = false;
      updatePermissionUI();
    }
  }
};

window.requestCameraPermission = async function() {
  if (!cameraEnabled) {
    await enableCameraInput();
  }
};

window.enableCameraForNode = async function(nodeId) {
  const node = nodes.find(n => n.id === nodeId);
  
  if (node && node.type === 'Camera') {
    try {
      await enableWebcamForNode(node);
      
      // Update the button on the node
      const btn = node.element?.querySelector('.node-permission-btn');
      if (btn) {
        btn.textContent = 'Camera Active';
        btn.disabled = true;
        btn.style.opacity = '0.5';
      }
      // Update properties panel if this node is selected
      if (selectedNode === node) {
        showNodeProperties(node);
      }
    } catch (error) {
      Logger.error('Failed to enable camera for node:', error);
      // Update button to show error
      const btn = node.element?.querySelector('.node-permission-btn');
      if (btn) {
        btn.textContent = 'Camera Denied';
        btn.style.background = '#ef4444';
      }
    }
  }
};

// Control input system
const controlInputs = {
  midi: {},        // MIDI CC mappings: { ccNumber: { nodeId, param, min, max } }
  audio: {},       // Audio mappings: { bandName: [{ nodeId, param, min, max }] }
  color: {},       // Color component mappings: { componentName: [{ nodeId, param, min, max }] }
  cursor: {},      // Cursor position mappings: { componentName: [{ nodeId, param, min, max }] }
  camera: {},      // Camera-based mappings: { componentName: [{ nodeId, param, min, max }] }
};


/** Color System */
const colorComponents = {
  red: { value: 0, name: 'Red (0-1)' },
  green: { value: 0, name: 'Green (0-1)' },
  blue: { value: 0, name: 'Blue (0-1)' },
  hue: { value: 0, name: 'Hue (0-360)' },
  saturation: { value: 0, name: 'Saturation (0-1)' },
  brightness: { value: 0, name: 'Brightness (0-1)' },
  luminance: { value: 0, name: 'Luminance (0-1)' }
};

/** Cursor Input System */
const cursorComponents = {
  x: { value: 0, name: 'X Position (0-1)' },
  y: { value: 0, name: 'Y Position (0-1)' },
  velocity: { value: 0, name: 'Movement Velocity (0-1)' },
  click: { value: 0, name: 'Click State (0-1)' }
};

/** Camera Input System */
let cameraVideoElement = null;
let cameraCanvas = null;
let cameraContext = null;
let cameraEnabled = false;
let lastCameraFrame = null;

const cameraComponents = {
  brightness: { value: 0, name: 'Average Brightness (0-1)' },
  motion: { value: 0, name: 'Motion Detection (0-1)' },
  redAvg: { value: 0, name: 'Average Red (0-1)' },
  greenAvg: { value: 0, name: 'Average Green (0-1)' },
  blueAvg: { value: 0, name: 'Average Blue (0-1)' },
  contrast: { value: 0, name: 'Image Contrast (0-1)' }
};

/** Game Controller Input System */
const gamepadState = {
  controllers: {},
  scanning: false,
  pollInterval: null
};

// Standard gamepad button mapping
const GAMEPAD_BUTTONS = [
  'A/Cross',          // 0
  'B/Circle',         // 1
  'X/Square',         // 2
  'Y/Triangle',       // 3
  'Left Bumper',      // 4
  'Right Bumper',     // 5
  'Left Trigger',     // 6
  'Right Trigger',    // 7
  'Back/Select',      // 8
  'Start',            // 9
  'Left Stick',       // 10
  'Right Stick',      // 11
  'D-Pad Up',         // 12
  'D-Pad Down',       // 13
  'D-Pad Left',       // 14
  'D-Pad Right',      // 15
  'Home/Guide'        // 16
];

// Standard gamepad axis mapping
const GAMEPAD_AXES = [
  'Left Stick X',     // 0
  'Left Stick Y',     // 1
  'Right Stick X',    // 2
  'Right Stick Y'     // 3
];

// Controller input components
const controllerComponents = {};

// Initialize components for all possible inputs
GAMEPAD_BUTTONS.forEach((name, index) => {
  controllerComponents[`button${index}`] = { value: 0, name: name };
});

GAMEPAD_AXES.forEach((name, index) => {
  controllerComponents[`axis${index}`] = { value: 0, name: name };
});

const colorPalettes = {
  'rainbow': [
    '#ff0000', '#ff8000', '#ffff00', '#80ff00',
    '#00ff00', '#00ff80', '#00ffff', '#0080ff',
    '#0000ff', '#8000ff', '#ff00ff', '#ff0080'
  ],
  'sunset': ['#ff6b35', '#f7931e', '#ffd700', '#ff8c42', '#ff5722', '#e91e63', '#9c27b0', '#673ab7'],
  'ocean': ['#006994', '#0085b8', '#00a1c9', '#2eb8d4', '#5ccfe0', '#89e5eb', '#b6fcf7'],
  'forest': ['#2d5016', '#3e6b1f', '#4f8328', '#60a032', '#71bd3b', '#8dd85e', '#aae382'],
  'fire': ['#8b0000', '#dc143c', '#ff4500', '#ff6347', '#ff7f50', '#ffa500', '#ffd700', '#ffff00'],
  'purple': ['#4b0082', '#6a0dad', '#7b68ee', '#9370db', '#ba55d3', '#da70d6', '#dda0dd', '#e6e6fa'],
  'monochrome': ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff']
};

/** Project Management System */
let currentProject = {
  id: null,
  name: 'Untitled',
  description: '',
  createdAt: null,
  modifiedAt: null,
  autoSave: true
};

const STORAGE_KEY = 'visual_synthesizer_projects';
const AUTOSAVE_INTERVAL = 10000; // 10 seconds
let autoSaveTimer = null;
let hasUnsavedChanges = false;

/** Auto-Update System */
const APP_VERSION = '1.2.0'; // Update this when making changes
const UPDATE_CHECK_INTERVAL = 30000; // Check every 30 seconds
const LAST_PROJECT_KEY = 'visual_synthesizer_last_project';
const AUTOSAVE_KEY = 'visual_synthesizer_autosave';
let updateCheckTimer = null;
let updateAvailable = false;
let lastFileModTimes = new Map();
let updateNotificationShown = false;

// Node class with graph positioning
class SynthNode {
  constructor(type, x = 100, y = 100) {
    this.id = ++nodeCount;
    this.type = type;
    this.name = `${type} ${this.id}`;
    this.x = x;
    this.y = y;
    this.width = 160;
    this.height = 80;
    this.inputs = [];
    this.texture = null;
    this.fbo = null;
    this.program = null;
    this.enabled = true;
    this.groupName = null;
    this.element = null;
    this.connections = [];
    this.setupType();
  }

  setupType() {
    const configs = {
      Oscillator: {
        inputs: [],
        // frequency, sync, offset, colorPalette, colorIndex, colorSpeed
        controlInputs: [null, null, null, null, null, null],
        params: {
          frequency: 10.0,
          sync: 0.1,
          offset: 0.5,
          colorPalette: 'rainbow',
          colorIndex: 0.0,
          colorSpeed: 1.0
        },
        icon: 'waves',
        category: 'source'
      },
      Noise: {
        inputs: [],
        controlInputs: [null, null], // frequency, speed
        params: { frequency: 8.0, speed: 0.5 },
        icon: 'grain',
        category: 'source'
      },
      Shape: {
        inputs: [],
        controlInputs: [null, null, null], // radius, softness, color
        params: { radius: 0.3, softness: 0.1, color: '#ffffff' },
        icon: 'circle',
        category: 'source'
      },
      Video: {
        inputs: [],
        params: {},
        icon: 'videocam',
        category: 'video'
      },
      // New source nodes
      Plasma: {
        inputs: [],
        controlInputs: [null, null, null, null], // octaves, lacunarity, gain, speed
        params: { octaves: 5, lacunarity: 2.1, gain: 0.5, speed: 0.08 },
        icon: 'water',
        category: 'source'
      },
      Voronoi: {
        inputs: [],
        controlInputs: [null, null], // scale, speed
        params: { scale: 6, speed: 0.2 },
        icon: 'hexagon',
        category: 'source'
      },
      RadialGradient: {
        inputs: [],
        controlInputs: [null], // exponent
        params: { innerColor: '#ffe8d9', outerColor: '#292929', exponent: 1.6 },
        icon: 'lens',
        category: 'source'
      },
      FlowField: {
        inputs: [],
        controlInputs: [null, null], // fieldScale, timeWarp
        params: { fieldScale: 1.7, timeWarp: 0.4 },
        icon: 'air',
        category: 'source'
      },
      Text: {
        inputs: [],
        params: { text: 'Hello', font: 'Inter Bold 96pt', fillColor: '#ffffff' },
        icon: 'text_fields',
        category: 'source'
      },
      VideoFileInput: {
        inputs: [],
        params: { playbackRate: 1.0, loop: true },
        icon: 'video_library',
        category: 'source'
      },
      Transform: {
        inputs: [null], // Main input
        controlInputs: [null, null, null, null, null, null], // positionX, positionY, scaleX, scaleY, rotation, opacity
        params: { positionX: 0.0, positionY: 0.0, scaleX: 1.0, scaleY: 1.0, rotation: 0.0, opacity: 1.0 },
        icon: 'transform',
        category: 'effect'
      },
      ColorAdjust: {
        inputs: [null], // Main input
        controlInputs: [null, null, null], // brightness, contrast, saturation
        params: { brightness: 0.0, contrast: 1.0, saturation: 1.0, invert: false },
        icon: 'tune',
        category: 'effect'
      },
      Kaleidoscope: {
        inputs: [null],
        controlInputs: [null], // slices
        params: { slices: 6.0 },
        icon: 'auto_fix_high',
        category: 'effect'
      },
      // New transform/post-fx nodes
      Mirror: {
        inputs: [null],
        controlInputs: [null], // sides (for radial mode)
        params: { mode: 'radial', sides: 6 },
        icon: 'flip',
        category: 'effect'
      },
      NoiseDisplace: {
        inputs: [null],
        controlInputs: [null, null], // amplitude, frequency
        params: { amplitude: 0.08, frequency: 2.5 },
        icon: 'blur_on',
        category: 'effect'
      },
      PolarWarp: {
        inputs: [null],
        controlInputs: [null, null], // innerRadius, twist
        params: { innerRadius: 0.1, twist: 0.3 },
        icon: 'panorama_fish_eye',
        category: 'effect'
      },
      RGBSplit: {
        inputs: [null],
        controlInputs: [null, null], // offset, falloff
        params: { offset: 3, falloff: 0.85 },
        icon: 'blur_linear',
        category: 'effect'
      },
      FeedbackTrail: {
        inputs: [null],
        controlInputs: [null, null], // decay, blur
        params: { decay: 0.92, blur: 2 },
        icon: 'history',
        category: 'effect'
      },
      Bloom: {
        inputs: [null],
        controlInputs: [null, null, null], // threshold, strength, radius
        params: { threshold: 0.75, strength: 1.2, radius: 0.4 },
        icon: 'flare',
        category: 'effect'
      },
      Mix: {
        inputs: [null, null],
        controlInputs: [null], // mix
        params: { mix: 0.5 },
        icon: 'merge_type',
        category: 'compositing'
      },
      Layer: {
        inputs: [null, null],
        controlInputs: [null, null], // opacity, blendMode
        params: { opacity: 1.0, blendMode: 'Normal' },
        icon: 'layers',
        category: 'compositing'
      },
      Composite: {
        inputs: [null, null, null, null],
        params: { opacity1: 1.0, opacity2: 1.0, opacity3: 1.0, opacity4: 1.0 },
        icon: 'view_quilt',
        category: 'compositing'
      },
      // Input nodes for control
      MIDIInput: {
        inputs: [],
        params: { ccNumber: 1, min: 0.0, max: 1.0 },
        icon: 'piano',
        category: 'input'
      },
      AudioInput: {
        inputs: [],
        params: { band: 'overall', min: 0.0, max: 1.0, reverseRange: false },
        icon: 'graphic_eq',
        category: 'input'
      },
      CursorInput: {
        inputs: [],
        params: { component: 'x', min: 0.0, max: 1.0 },
        icon: 'mouse',
        category: 'input'
      },
      Camera: {
        inputs: [],
        params: {},
        icon: 'videocam',
        category: 'source'
      },
      CameraInput: {
        inputs: [],
        params: { component: 'brightness', min: 0.0, max: 1.0 },
        icon: 'video_camera_back',
        category: 'input'
      },
      GameControllerInput: {
        inputs: [],
        params: { 
          component: 'button0',
          min: 0.0, 
          max: 1.0,
          deadzone: 0.1,
          smoothing: 0.0
        },
        icon: 'sports_esports',
        category: 'input'
      },
      RandomInput: {
        inputs: [],
        params: { min: 0.0, max: 1.0, interval: 0.1 },
        icon: 'casino',
        category: 'input'
      },
      RangeInput: {
        inputs: [],
        params: { 
          min: 0.0, 
          max: 1.0, 
          step: 0.01, 
          speed: 1.0,
          curve: 'linear',
          loop: true,
          direction: 'up', // 'up' or 'down'
          mode: 'one-way' // 'one-way' or 'round-trip'
        },
        icon: 'timeline',
        category: 'input'
      },
      // System nodes
      FinalOutput: {
        inputs: [null], // Single input for the final result
        params: {},
        icon: 'monitor',
        category: 'system'
      }
    };

    const config = configs[this.type];
    if (config) {
      this.inputs = [...config.inputs];
      this.controlInputs = config.controlInputs ? [...config.controlInputs] : [];
      this.params = { ...config.params };
      this.icon = config.icon;
      this.category = config.category;
      // Handle program assignment with proper case handling
      let programName = this.type.toLowerCase();
      
      // Special cases for compound names
      if (this.type === 'RadialGradient') programName = 'radialgradient';
      if (this.type === 'FlowField') programName = 'flowfield';
      if (this.type === 'VideoFileInput') programName = 'videofileinput';
      if (this.type === 'Camera') programName = 'camera';
      if (this.type === 'CameraInput') programName = 'camerainput';
      if (this.type === 'NoiseDisplace') programName = 'noisedisplace';
      if (this.type === 'PolarWarp') programName = 'polarwarp';
      if (this.type === 'RGBSplit') programName = 'rgbsplit';
      if (this.type === 'FeedbackTrail') programName = 'feedbacktrail';
      
      this.program = programs[programName];

      // Initialize Random nodes with a random value
      if (this.type === 'RandomInput') {
        this.randomValue = Math.random();
        this.lastRandomUpdate = Date.now();
        this.currentValue = this.params.min + (this.randomValue * (this.params.max - this.params.min));
      }
      
      // Initialize Range nodes
      if (this.type === 'RangeInput') {
        this.rangeProgress = 0; // 0 to 1 progress through the range
        this.lastRangeUpdate = Date.now();
        this.currentValue = this.params.min;
      }
    }
  }

  getInputPorts() {
    return this.inputs.map((_, index) => {
      // Get the actual port element position
      const portElement = this.element?.querySelector(`[data-input="${index}"]`);
      if (portElement) {
        const rect = portElement.getBoundingClientRect();
        const svgRect = document.getElementById('connections-svg').getBoundingClientRect();

        // Use absolute screen coordinates relative to the SVG
        const x = rect.left + rect.width / 2 - svgRect.left;
        const y = rect.top + rect.height / 2 - svgRect.top;

        return {
          index,
          x,
          y,
          connected: this.inputs[index] !== null
        };
      }
      // Fallback to estimated position
      const nodeRect = this.element.getBoundingClientRect();
      const svgRect = document.getElementById('connections-svg').getBoundingClientRect();
      return {
        index,
        x: nodeRect.left + 5 - svgRect.left,
        y: nodeRect.top + 48 + index * 24 - svgRect.top,
        connected: this.inputs[index] !== null
      };
    });
  }

  getOutputPort() {
    // Get the actual port element position
    const portElement = this.element?.querySelector('[data-output="0"]');
    if (portElement) {
      const rect = portElement.getBoundingClientRect();
      const svgRect = document.getElementById('connections-svg').getBoundingClientRect();

      // Use absolute screen coordinates relative to the SVG
      const x = rect.left + rect.width / 2 - svgRect.left;
      const y = rect.top + rect.height / 2 - svgRect.top;

      return {
        x,
        y,
        connected: this.hasConnections()
      };
    }

    // Fallback to estimated position
    const nodeRect = this.element.getBoundingClientRect();
    const svgRect = document.getElementById('connections-svg').getBoundingClientRect();
    return {
      x: nodeRect.right - 5 - svgRect.left,
      y: nodeRect.top + 48 + this.inputs.length * 24 - svgRect.top,
      connected: this.hasConnections()
    };
  }

  hasConnections() {
    return nodes.some(node => node.inputs.includes(this));
  }
}

class NodeGroup {
  constructor(name) {
    this.id = ++groupCount;
    this.name = name || `Group ${this.id}`;
    this.enabled = true;
    this.nodes = [];
  }
}

/**
 * Initialize the application
 */
function init() {
  initWebGL();
  initUI();
  initMIDI();
  initAudio();
  initCursor();
  initCamera();
  initGamepad();
  handleResolutionChange('Medium');

  // Create the permanent Final Output node
  createFinalOutputNode();

  // Initialize update and project system (may restore saved project)
  const projectWasRestored = initUpdateSystem();
  
  // Remove any self-references that may exist
  removeSelfReferences();

  // Only create initial node if no project was restored
  if (!projectWasRestored) {
    Logger.info('No saved project found, creating default oscillator');
    const initialOsc = createNode('Oscillator', 300, 200);
    const finalOutputNode = nodes.find(n => n.type === 'FinalOutput');
    if (finalOutputNode) {
      finalOutputNode.inputs[0] = initialOsc;
      updateConnections();
    }
  } else {
    Logger.info('Project restored from saved state, skipping default node creation');
  }

  // Initialize graceful degradation system
  if (!initializeGracefulDegradation()) {
    Logger.error('Critical features unavailable - app may not function properly');
    return;
  }

  // Validate data model consistency
  validateDataModelConsistency();

  startRenderLoop();
  startColorAnalysis();
  startAudioAnalysis();
  startCursorTracking();
  startCameraAnalysis();
  startGamepadPolling();
  startMemoryMonitoring();
  
  // Check for nodes needing permissions after project restore
  setTimeout(() => {
    updatePermissionUI();
  }, 500);

  // Don't perform auto-layout on initialization - let user trigger it manually
}

/**
 * Start automatic memory monitoring and cleanup
 */
function startMemoryMonitoring() {
  // Memory monitoring every 30 seconds
  const memoryMonitorInterval = setInterval(() => {
    const stats = getMemoryStats();
    Logger.debug('Memory Stats:', stats);

    // DISABLED: Aggressive orphaned resource cleanup was causing crashes
    // The original code worked fine without this aggressive cleanup
    // if (now - lastCleanup > 300000) { // Every 5 minutes
    //   window.lastOrphanCleanup = now;
    //   forceCleanupOrphanedResources();
    // }

    // Warn if resource count is getting high
    const totalResources = stats.textures + stats.framebuffers + stats.buffers;
    if (totalResources > 100) {
      Logger.warn(`High resource count detected: ${totalResources} WebGL resources`);
    }

    // Check for potential memory leaks
    if (stats.eventListeners > nodes.length * 2) {
      Logger.warn(`Potential event listener leak: ${stats.eventListeners} listeners for ${nodes.length} nodes`);
    }
  }, 30000);

  // Simple interval tracking
  window.memoryMonitorInterval = memoryMonitorInterval;

  // Removed aggressive cleanup - was causing crashes

  // Memory stats command for development
  window.getMemoryStats = getMemoryStats;

  Logger.debug('Memory monitoring started - use forceMemoryCleanup() or getMemoryStats() in console');

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    Logger.info('Page unloading - cleaning up all resources');
    cleanupAllResources();
  });

  // Cleanup on visibility change (tab hidden for extended period)
  let hiddenTime = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      hiddenTime = Date.now();
    } else {
      // Removed aggressive cleanup on tab focus - was causing crashes
      hiddenTime = 0;
    }
  });
}

/**
 * Clean up all tracked resources (called on page unload)
 */
function cleanupAllResources() {
  // Stop the memory monitor interval if it exists
  if (window.memoryMonitorInterval) {
    clearInterval(window.memoryMonitorInterval);
    window.memoryMonitorInterval = null;
  }

  // Stop video streams on all nodes directly
  nodes.forEach(node => {
    if (node.video && node.video.srcObject) {
      try {
        node.video.srcObject.getTracks().forEach(track => track.stop());
      } catch (error) {
        Logger.warn('Error stopping video stream during cleanup:', error);
      }
    }
    if (node.intervalId) {
      clearInterval(node.intervalId);
      node.intervalId = null;
    }
  });

  // Simple cleanup without aggressive tracking

  // Clean up WebGL resources on all nodes directly
  if (gl && !webglContextLost) {
    nodes.forEach(node => {
      try {
        if (node.texture && gl.isTexture(node.texture)) {
          gl.deleteTexture(node.texture);
        }
        if (node.fbo && gl.isFramebuffer(node.fbo)) {
          gl.deleteFramebuffer(node.fbo);
        }
      } catch (error) {
        Logger.warn('Error deleting WebGL resources during cleanup:', error);
      }
    });

    // Clean up quad buffer
    if (quadBuffer.buf && gl.isBuffer(quadBuffer.buf)) {
      gl.deleteBuffer(quadBuffer.buf);
    }
  }

  Logger.info('All resources cleaned up');
}

// Fallback texture for failed nodes
let fallbackTexture = null;

function createFallbackTexture() {
  if (fallbackTexture) return fallbackTexture;

  fallbackTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, fallbackTexture);

  // Create a simple 2x2 red texture as fallback
  const fallbackData = new Uint8Array([
    255, 0, 0, 255,   // Red
    255, 100, 100, 255,  // Light red
    255, 100, 100, 255,  // Light red
    255, 0, 0, 255    // Red
  ]);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, fallbackData);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  Logger.debug('Created fallback texture for failed nodes');
  return fallbackTexture;
}

/**
 * Initialize WebGL and compile shaders with error handling
 */
function initWebGL() {
  canvas = document.getElementById("glcanvas");

  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      webglSupported = false;
      showWebGLError("WebGL not supported in this browser. Please try a different browser or enable WebGL.");
      return false;
    }

    // Set up context loss recovery
    setupWebGLContextRecovery();

    // Configure WebGL with error checking
    const success = safeWebGLOperation(() => {
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      return true;
    }, 'WebGL blend setup', false);

    if (!success) {
      showWebGLError("Failed to configure WebGL blending.");
      return false;
    }

    // Compile shaders and create buffers
    if (!compileShaders()) {
      showWebGLError("Failed to compile shaders.");
      return false;
    }

    if (!initFullscreenQuad()) {
      showWebGLError("Failed to create rendering buffers.");
      return false;
    }

    webglSupported = true;
    webglContextLost = false;

    // Create fallback texture for failed nodes
    createFallbackTexture();

    Logger.info('WebGL initialized successfully');
    return true;

  } catch (error) {
    Logger.error('WebGL initialization failed:', error);
    webglSupported = false;
    showWebGLError(`WebGL initialization failed: ${error.message}`);
    return false;
  }
}

/**
 * Set up WebGL context loss and recovery handlers
 */
function setupWebGLContextRecovery() {
  canvas.addEventListener('webglcontextlost', (event) => {
    Logger.warn('WebGL context lost');
    event.preventDefault();
    webglContextLost = true;

    // Stop rendering
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    showWebGLError("WebGL context lost. Attempting to recover...");
  });

  canvas.addEventListener('webglcontextrestored', (event) => {
    Logger.info('WebGL context restored, reinitializing...');
    webglContextLost = false;

    // Reinitialize WebGL
    setTimeout(() => {
      if (initWebGL()) {
        // Recreate all node textures and programs
        restoreWebGLResources();
        // Restart rendering
        startRenderLoop();
        Logger.info('WebGL recovery complete');
        hideWebGLError();
      } else {
        showWebGLError("Failed to recover WebGL context.");
      }
    }, 100);
  });
}

/**
 * Restore WebGL resources after context recovery
 */
function restoreWebGLResources() {
  // Recreate textures for all nodes
  nodes.forEach(node => {
    if (node.texture) {
      createNodeTexture(node);
    }
  });

  Logger.info('WebGL resources restored');
}

/**
 * Show WebGL error message to user
 */
function showWebGLError(message) {
  // Create or update error overlay
  let errorOverlay = document.getElementById('webgl-error-overlay');
  if (!errorOverlay) {
    errorOverlay = document.createElement('div');
    errorOverlay.id = 'webgl-error-overlay';
    errorOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ef4444;
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
    `;
    document.body.appendChild(errorOverlay);
  }

  errorOverlay.innerHTML = `
    <h3>WebGL Error</h3>
    <p>${message}</p>
    <button onclick="this.parentElement.style.display='none'"
            style="margin-top: 10px; padding: 8px 16px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer;">
      Close
    </button>
  `;
  errorOverlay.style.display = 'block';
}

/**
 * Hide WebGL error message
 */
function hideWebGLError() {
  const errorOverlay = document.getElementById('webgl-error-overlay');
  if (errorOverlay) {
    errorOverlay.style.display = 'none';
  }
}

/**
 * Compile all shader programs
 */
function compileShaders() {
  const vertSrc = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
  const vertShader = compileShader(gl.VERTEX_SHADER, vertSrc);

  if (!vertShader) {
    Logger.error('Failed to compile vertex shader');
    return false;
  }

  // Oscillator shader with color palette support
  const fragOsc = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_frequency;
    uniform float u_sync;
    uniform float u_offset;
    uniform float u_colorindex;
    uniform float u_colorspeed;
    uniform vec3 u_color0;
    uniform vec3 u_color1;
    uniform vec3 u_color2;
    uniform vec3 u_color3;
    uniform vec3 u_color4;
    uniform vec3 u_color5;
    uniform vec3 u_color6;
    uniform vec3 u_color7;
    uniform float u_palettesize;
    varying vec2 v_uv;

    vec3 getPaletteColor(float t) {
      t = clamp(t, 0.0, 1.0);
      float scaledT = t * (u_palettesize - 1.0);
      float index = floor(scaledT);
      float frac = scaledT - index;

      vec3 color1, color2;

      // Use if-else chain instead of array indexing
      if (index < 0.5) {
        color1 = u_color0;
        color2 = u_color1;
      } else if (index < 1.5) {
        color1 = u_color1;
        color2 = u_color2;
      } else if (index < 2.5) {
        color1 = u_color2;
        color2 = u_color3;
      } else if (index < 3.5) {
        color1 = u_color3;
        color2 = u_color4;
      } else if (index < 4.5) {
        color1 = u_color4;
        color2 = u_color5;
      } else if (index < 5.5) {
        color1 = u_color5;
        color2 = u_color6;
      } else if (index < 6.5) {
        color1 = u_color6;
        color2 = u_color7;
      } else {
        color1 = u_color7;
        color2 = u_color0; // Wrap around
      }

      return mix(color1, color2, frac);
    }

    void main() {
      float x = v_uv.x;

      // Create oscillation pattern
      float wave = sin((x - u_offset/u_frequency + u_time * u_sync) * u_frequency * 6.2831);
      wave = wave * 0.5 + 0.5;

      // Calculate color index based on position and time
      float colorT = fract(u_colorindex / u_palettesize + x * 0.5 + u_time * u_colorspeed * 0.1);

      // Get base color from palette
      vec3 baseColor = getPaletteColor(colorT);

      // Modulate with wave pattern
      vec3 finalColor = baseColor * (0.3 + 0.7 * wave);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
  programs.oscillator = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragOsc));
  if (!programs.oscillator) {
    Logger.warn('Oscillator shader compilation failed, using fallback');
    programs.oscillator = createFallbackProgram('Oscillator', 'shader compilation failed');
  }

  // Noise shader
  const fragNoise = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_frequency;
    uniform float u_speed;
    varying vec2 v_uv;
    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = rand(i);
      float b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0));
      float d = rand(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    void main() {
      vec2 uv = v_uv * u_frequency;
      uv.x += u_time * u_speed;
      uv.y += u_time * u_speed;
      float n = noise(uv);
      gl_FragColor = vec4(vec3(n), 1.0);
    }
  `;
  programs.noise = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragNoise));
  if (!programs.noise) {
    Logger.warn('Noise shader compilation failed, using fallback');
    programs.noise = createFallbackProgram('Noise', 'shader compilation failed');
  }

  // Shape shader
  const fragShape = `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_radius;
    uniform float u_softness;
    uniform vec3 u_color;
    varying vec2 v_uv;
    void main() {
      vec2 aspect = vec2(u_resolution.y / u_resolution.x, 1.0);
      vec2 centered = (v_uv - 0.5) * 2.0;
      centered *= aspect;
      float dist = length(centered);
      float edge0 = u_radius * (1.0 - u_softness);
      float edge1 = u_radius * (1.0 + u_softness);
      float alpha = 1.0 - smoothstep(edge0, edge1, dist);
      vec3 color = u_color;
      gl_FragColor = vec4(color * alpha, 1.0);
    }
  `;
  programs.shape = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragShape));

  // Transform shader
  const fragTransform = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform vec2 u_position;
    uniform vec2 u_scale;
    uniform float u_rotation;
    uniform float u_opacity;
    varying vec2 v_uv;
    void main() {
      vec2 centered = v_uv - 0.5;
      float cos_r = cos(u_rotation);
      float sin_r = sin(u_rotation);
      vec2 rotated = vec2(
        centered.x * cos_r - centered.y * sin_r,
        centered.x * sin_r + centered.y * cos_r
      );
      vec2 scaled = rotated / u_scale;
      vec2 finalUV = scaled + 0.5 + u_position;
      if (finalUV.x < 0.0 || finalUV.x > 1.0 || finalUV.y < 0.0 || finalUV.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      } else {
        vec4 color = texture2D(u_texture, finalUV);
        gl_FragColor = vec4(color.rgb, color.a * u_opacity);
      }
    }
  `;
  programs.transform = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragTransform));

  // ColorAdjust shader
  const fragColorAdj = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform float u_brightness;
    uniform float u_contrast;
    uniform float u_saturation;
    uniform int u_invert;
    varying vec2 v_uv;
    void main() {
      vec4 color = texture2D(u_texture, v_uv);
      color.rgb += u_brightness;
      color.rgb = (color.rgb - 0.5) * u_contrast + 0.5;
      float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      color.rgb = mix(vec3(gray), color.rgb, u_saturation);
      if(u_invert == 1) {
        color.rgb = 1.0 - color.rgb;
      }
      gl_FragColor = vec4(color.rgb, 1.0);
    }
  `;
  programs.coloradjust = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragColorAdj));

  // Kaleidoscope shader
  const fragKaleido = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform float u_slices;
    varying vec2 v_uv;
    void main() {
      vec2 centered = v_uv * 2.0 - 1.0;
      float r = length(centered);
      float theta = atan(centered.y, centered.x);
      float n = floor(u_slices + 0.5);
      if(n < 1.0) {
        gl_FragColor = texture2D(u_texture, v_uv);
        return;
      }
      float angle = 6.2831 / n;
      theta = mod(theta, angle) - angle/2.0;
      vec2 newPos = vec2(cos(theta), sin(theta)) * r;
      vec2 sampleUV = newPos * 0.5 + 0.5;
      sampleUV = mod(sampleUV, 1.0);
      gl_FragColor = texture2D(u_texture, sampleUV);
    }
  `;
  programs.kaleidoscope = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragKaleido));

  // Mix shader
  const fragMix = `
    precision mediump float;
    uniform sampler2D u_texture1;
    uniform sampler2D u_texture2;
    uniform float u_mix;
    varying vec2 v_uv;
    void main() {
      vec4 col1 = texture2D(u_texture1, v_uv);
      vec4 col2 = texture2D(u_texture2, v_uv);
      gl_FragColor = mix(col1, col2, u_mix);
    }
  `;
  programs.mix = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragMix));

  // Layer shader - complete rewrite for proper blending
  const fragLayer = `
    precision mediump float;
    uniform sampler2D u_texture1;  // Base layer (bottom)
    uniform sampler2D u_texture2;  // Blend layer (top)
    uniform float u_opacity;
    uniform float u_blendMode;
    varying vec2 v_uv;

    void main() {
      // Sample both textures
      vec4 baseColor = texture2D(u_texture1, v_uv);
      vec4 blendColor = texture2D(u_texture2, v_uv);

      // Extract RGB values
      vec3 base = baseColor.rgb;
      vec3 blend = blendColor.rgb;

      // Debug mode: show split view when blendMode is negative
      if (u_blendMode < -0.5) {
        if (v_uv.x < 0.5) {
          gl_FragColor = vec4(base, 1.0);  // Left: base texture
        } else {
          gl_FragColor = vec4(blend, 1.0); // Right: blend texture
        }
        return;
      }


      // Calculate blended result based on mode
      vec3 result;
      float mode = u_blendMode;

      if (mode < 0.5) {
        // Normal mode - just the blend layer
        result = blend;
      }
      else if (mode < 1.5) {
        // Multiply mode - darkens
        result = base * blend;
      }
      else if (mode < 2.5) {
        // Screen mode - lightens
        result = vec3(1.0) - (vec3(1.0) - base) * (vec3(1.0) - blend);
      }
      else if (mode < 3.5) {
        // Overlay mode - combination of multiply and screen
        result = vec3(
          base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r)),
          base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g)),
          base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b))
        );
      }
      else {
        // Fallback to normal
        result = blend;
      }

      // Apply opacity
      vec3 finalColor = mix(base, result, u_opacity);

      // Output with full alpha
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;
  programs.layer = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragLayer));
  if (!programs.layer) {
    Logger.error('Layer shader compilation failed!');
    programs.layer = createFallbackProgram('Layer', 'Layer shader compilation failed');
  } else {
    Logger.info('Layer shader compiled successfully');
  }

  // Composite shader
  const fragComposite = `
    precision mediump float;
    uniform sampler2D u_texture1;
    uniform sampler2D u_texture2;
    uniform sampler2D u_texture3;
    uniform sampler2D u_texture4;
    uniform float u_opacity1;
    uniform float u_opacity2;
    uniform float u_opacity3;
    uniform float u_opacity4;
    uniform int u_activeInputs;
    varying vec2 v_uv;

    void main() {
      vec4 result = vec4(0.0, 0.0, 0.0, 0.0);
      float totalOpacity = 0.0;
      
      // Use float comparison for WebGL ES compatibility
      float activeCount = float(u_activeInputs);
      
      // Layer 1
      if (activeCount >= 0.5) {
        vec4 layer1 = texture2D(u_texture1, v_uv);
        float opacity1 = u_opacity1;
        result.rgb += layer1.rgb * opacity1;
        totalOpacity += opacity1;
      }
      
      // Layer 2
      if (activeCount >= 1.5) {
        vec4 layer2 = texture2D(u_texture2, v_uv);
        float opacity2 = u_opacity2;
        result.rgb += layer2.rgb * opacity2;
        totalOpacity += opacity2;
      }
      
      // Layer 3
      if (activeCount >= 2.5) {
        vec4 layer3 = texture2D(u_texture3, v_uv);
        float opacity3 = u_opacity3;
        result.rgb += layer3.rgb * opacity3;
        totalOpacity += opacity3;
      }
      
      // Layer 4
      if (activeCount >= 3.5) {
        vec4 layer4 = texture2D(u_texture4, v_uv);
        float opacity4 = u_opacity4;
        result.rgb += layer4.rgb * opacity4;
        totalOpacity += opacity4;
      }
      
      // Normalize the result by total opacity
      if (totalOpacity > 0.0) {
        result.rgb /= totalOpacity;
        result.a = 1.0;
      } else {
        result = vec4(0.0, 0.0, 0.0, 1.0);
      }
      
      gl_FragColor = result;
    }
  `;
  programs.composite = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragComposite));
  if (!programs.composite) {
    Logger.error('Composite shader compilation failed!');
  } else {
    Logger.info('Composite shader compiled successfully');
  }

  // Plasma shader - fBm-based plasma effect
  const fragPlasma = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_octaves;
    uniform float u_lacunarity;
    uniform float u_gain;
    uniform float u_speed;
    varying vec2 v_uv;
    
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      
      for (int i = 0; i < 8; i++) {
        if (float(i) >= u_octaves) break;
        value += amplitude * noise(p * frequency);
        frequency *= u_lacunarity;
        amplitude *= u_gain;
      }
      return value;
    }
    
    void main() {
      vec2 uv = v_uv * 2.0 - 1.0;
      float t = u_time * u_speed;
      
      float n1 = fbm(uv * 3.0 + vec2(t * 0.5, t * 0.3));
      float n2 = fbm(uv * 4.0 - vec2(t * 0.3, t * 0.5));
      float n3 = fbm(uv * 5.0 + vec2(t * 0.2, -t * 0.4));
      
      vec3 color = vec3(
        0.5 + 0.5 * sin(n1 * 6.28 + t),
        0.5 + 0.5 * sin(n2 * 6.28 + t + 2.094),
        0.5 + 0.5 * sin(n3 * 6.28 + t + 4.188)
      );
      
      // Pastel palette
      color = mix(color, vec3(0.9, 0.8, 0.85), 0.3);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  programs.plasma = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragPlasma));

  // Voronoi shader - Worley noise cells
  const fragVoronoi = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_scale;
    uniform float u_speed;
    varying vec2 v_uv;
    
    vec2 random2(vec2 p) {
      return fract(sin(vec2(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3))
      )) * 43758.5453);
    }
    
    void main() {
      vec2 uv = v_uv * u_scale;
      vec2 iuv = floor(uv);
      vec2 fuv = fract(uv);
      
      float minDist = 1.0;
      
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = random2(iuv + neighbor);
          point = 0.5 + 0.5 * sin(u_time * u_speed + 6.2831 * point);
          vec2 diff = neighbor + point - fuv;
          float dist = length(diff);
          minDist = min(minDist, dist);
        }
      }
      
      vec3 color = vec3(minDist);
      color = 1.0 - color;
      color *= vec3(0.9, 0.85, 1.0);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  programs.voronoi = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragVoronoi));

  // Radial Gradient shader
  const fragRadialGradient = `
    precision mediump float;
    uniform vec3 u_innerColor;
    uniform vec3 u_outerColor;
    uniform float u_exponent;
    varying vec2 v_uv;
    
    void main() {
      vec2 center = v_uv - 0.5;
      float dist = length(center) * 2.0;
      dist = pow(dist, u_exponent);
      dist = clamp(dist, 0.0, 1.0);
      
      vec3 color = mix(u_innerColor, u_outerColor, dist);
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  programs.radialgradient = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragRadialGradient));

  // Flow Field shader - curl noise flow field
  const fragFlowField = `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_fieldscale;
    uniform float u_timewarp;
    varying vec2 v_uv;
    
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i = floor(v + dot(v, C.yy));
      vec2 x0 = v - i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m; m = m*m;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
      vec3 g;
      g.x = a0.x * x0.x + h.x * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }
    
    void main() {
      vec2 uv = v_uv * u_fieldscale;
      float t = u_time * u_timewarp;
      
      // Multiple octaves for richer flow
      float n1 = 0.0;
      float n2 = 0.0;
      float amp = 1.0;
      float freq = 1.0;
      
      for (int i = 0; i < 3; i++) {
        n1 += amp * snoise(uv * freq + vec2(t * 0.1, t * 0.15));
        n2 += amp * snoise(uv * freq * 1.5 - vec2(t * 0.05, t * 0.1));
        amp *= 0.5;
        freq *= 2.0;
      }
      
      // Create flow direction from noise
      vec2 flow = vec2(n1, n2);
      float flowMag = length(flow);
      
      // Convert to angle for hue
      float angle = atan(flow.y, flow.x);
      float hue = (angle + 3.14159) / (2.0 * 3.14159);
      
      // HSV to RGB conversion
      vec3 c = vec3(hue, 0.8, 0.9);
      vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
      vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
      vec3 color = c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      
      // Add some brightness variation based on magnitude
      color *= 0.7 + 0.3 * flowMag;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;
  programs.flowfield = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragFlowField));

  // Text shader - solid color (actual text rendering happens in canvas)
  const fragText = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_uv;
    
    void main() {
      gl_FragColor = texture2D(u_texture, v_uv);
    }
  `;
  programs.text = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragText));
  if (!programs.text) {
    Logger.error('Failed to create Text shader program');
  }

  // VideoFileInput shader - flips Y coordinate to correct video orientation
  const fragVideoFileInput = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_uv;
    
    void main() {
      // Flip Y coordinate to correct video orientation
      vec2 flippedUV = vec2(v_uv.x, 1.0 - v_uv.y);
      gl_FragColor = texture2D(u_texture, flippedUV);
    }
  `;
  
  const videoFileInputFragShader = compileShader(gl.FRAGMENT_SHADER, fragVideoFileInput);
  if (videoFileInputFragShader) {
    programs.videofileinput = createProgram(vertShader, videoFileInputFragShader);
    if (!programs.videofileinput) {
      Logger.error('Failed to create VideoFileInput shader program');
      // Fallback to text shader if custom shader fails
      programs.videofileinput = programs.text;
    }
  } else {
    Logger.error('Failed to compile VideoFileInput fragment shader, using text shader as fallback');
    programs.videofileinput = programs.text;
  }
  
  // Camera shader - flips Y coordinate to correct orientation and maintains aspect ratio
  const fragCamera = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    uniform vec2 u_videoSize;
    varying vec2 v_uv;
    
    void main() {
      vec2 uv = v_uv;
      
      // Calculate aspect ratios
      float canvasAspect = u_resolution.x / u_resolution.y;
      float videoAspect = u_videoSize.x / u_videoSize.y;
      
      // Adjust UV coordinates to maintain aspect ratio (fit mode)
      if (videoAspect > canvasAspect) {
        // Video is wider - add letterboxing top/bottom
        float scale = canvasAspect / videoAspect;
        uv.y = (uv.y - 0.5) * scale + 0.5;
      } else {
        // Video is taller - add letterboxing left/right
        float scale = videoAspect / canvasAspect;
        uv.x = (uv.x - 0.5) * scale + 0.5;
      }
      
      // Flip Y coordinate to correct video orientation
      vec2 flippedUV = vec2(uv.x, 1.0 - uv.y);
      
      // Sample with black outside bounds
      if (flippedUV.x < 0.0 || flippedUV.x > 1.0 || flippedUV.y < 0.0 || flippedUV.y > 1.0) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = texture2D(u_texture, flippedUV);
      }
    }
  `;
  programs.camera = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragCamera));
  
  if (!programs.camera) {
    Logger.error('Failed to create Camera shader program');
  }
  
  // CameraInput shader - for control input nodes
  programs.camerainput = programs.copy;

  // Mirror shader
  const fragMirror = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform float u_mode; // 0: horizontal, 1: vertical, 2: radial
    uniform float u_sides;
    varying vec2 v_uv;
    
    void main() {
      vec2 uv = v_uv;
      
      if (u_mode < 0.5) {
        // Horizontal mirror
        uv.x = uv.x < 0.5 ? uv.x : 1.0 - uv.x;
      } else if (u_mode < 1.5) {
        // Vertical mirror
        uv.y = uv.y < 0.5 ? uv.y : 1.0 - uv.y;
      } else {
        // Radial mirror
        vec2 center = uv - 0.5;
        float angle = atan(center.y, center.x);
        float radius = length(center);
        float segmentAngle = 6.28318 / u_sides;
        angle = mod(angle, segmentAngle);
        if (angle > segmentAngle * 0.5) {
          angle = segmentAngle - angle;
        }
        uv = vec2(cos(angle), sin(angle)) * radius + 0.5;
      }
      
      gl_FragColor = texture2D(u_texture, uv);
    }
  `;
  programs.mirror = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragMirror));

  // Noise Displace shader
  const fragNoiseDisplace = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform float u_time;
    uniform float u_amplitude;
    uniform float u_frequency;
    varying vec2 v_uv;
    
    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }
    
    void main() {
      vec2 uv = v_uv;
      vec2 offset = vec2(
        noise(uv * u_frequency + u_time) - 0.5,
        noise(uv * u_frequency + u_time + 100.0) - 0.5
      ) * u_amplitude;
      
      uv += offset;
      gl_FragColor = texture2D(u_texture, uv);
    }
  `;
  programs.noisedisplace = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragNoiseDisplace));

  // Polar Warp shader
  const fragPolarWarp = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform float u_innerRadius;
    uniform float u_twist;
    varying vec2 v_uv;
    
    void main() {
      vec2 center = v_uv - 0.5;
      float radius = length(center);
      float angle = atan(center.y, center.x);
      
      radius = mix(u_innerRadius, radius, radius);
      angle += u_twist * (1.0 - radius);
      
      vec2 uv = vec2(cos(angle), sin(angle)) * radius + 0.5;
      gl_FragColor = texture2D(u_texture, uv);
    }
  `;
  programs.polarwarp = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragPolarWarp));

  // RGB Split shader
  const fragRGBSplit = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform float u_offset;
    uniform float u_falloff;
    varying vec2 v_uv;
    
    void main() {
      vec2 center = v_uv - 0.5;
      float dist = length(center);
      float offset = u_offset * 0.01 * pow(dist, u_falloff);
      
      vec2 dir = normalize(center);
      vec2 rOffset = dir * offset;
      vec2 bOffset = -dir * offset;
      
      float r = texture2D(u_texture, v_uv + rOffset).r;
      float g = texture2D(u_texture, v_uv).g;
      float b = texture2D(u_texture, v_uv + bOffset).b;
      
      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `;
  programs.rgbsplit = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragRGBSplit));

  // Feedback Trail shader
  const fragFeedbackTrail = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform sampler2D u_feedbackTexture;
    uniform float u_decay;
    uniform float u_blur;
    varying vec2 v_uv;
    
    void main() {
      vec4 current = texture2D(u_texture, v_uv);
      
      // Sample feedback with slight blur
      vec4 feedback = vec4(0.0);
      float blurSize = u_blur * 0.002;
      for (float x = -1.0; x <= 1.0; x += 1.0) {
        for (float y = -1.0; y <= 1.0; y += 1.0) {
          vec2 offset = vec2(x, y) * blurSize;
          feedback += texture2D(u_feedbackTexture, v_uv + offset);
        }
      }
      feedback /= 9.0;
      
      feedback *= u_decay;
      
      gl_FragColor = max(current, feedback);
    }
  `;
  programs.feedbacktrail = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragFeedbackTrail));

  // Bloom shader - simplified bloom effect
  const fragBloom = `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform float u_threshold;
    uniform float u_strength;
    uniform float u_radius;
    varying vec2 v_uv;
    
    void main() {
      vec4 color = texture2D(u_texture, v_uv);
      
      // Extract bright areas
      float brightness = dot(color.rgb, vec3(0.299, 0.587, 0.114));
      vec4 bright = color * smoothstep(u_threshold - 0.1, u_threshold, brightness);
      
      // Blur bright areas
      vec4 blur = vec4(0.0);
      float total = 0.0;
      float rad = u_radius * 0.01;
      
      for (float x = -2.0; x <= 2.0; x += 1.0) {
        for (float y = -2.0; y <= 2.0; y += 1.0) {
          vec2 offset = vec2(x, y) * rad;
          float weight = 1.0 - length(vec2(x, y)) / 3.0;
          vec4 sample = texture2D(u_texture, v_uv + offset);
          float sampleBright = dot(sample.rgb, vec3(0.299, 0.587, 0.114));
          blur += sample * smoothstep(u_threshold - 0.1, u_threshold, sampleBright) * weight;
          total += weight;
        }
      }
      blur /= total;
      
      gl_FragColor = color + blur * u_strength;
    }
  `;
  programs.bloom = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragBloom));

  // Copy shader - simple texture passthrough
  const fragCopy = `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_uv;

    void main() {
      gl_FragColor = texture2D(u_texture, v_uv);
    }
  `;
  programs.copy = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragCopy));
  if (!programs.copy) {
    Logger.error('Copy shader compilation failed - this is critical!');
    programs.copy = createFallbackProgram('Copy', 'critical shader compilation failed');
  }

  // Input node shader - solid color based on input value
  const fragInput = `
    precision mediump float;
    uniform float u_value;
    uniform vec3 u_color;
    varying vec2 v_uv;
    void main() {
      float intensity = u_value;
      gl_FragColor = vec4(u_color * intensity, 1.0);
    }
  `;
  programs.midiinput = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragInput));
  programs.audioinput = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragInput));
  programs.cursorinput = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragInput));
  programs.camerainput = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragInput));
  programs.gamecontrollerinput = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragInput));
  programs.randominput = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragInput));
  programs.rangeinput = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragInput));

  // Final Output shader - uses copy shader for passthrough
  programs.finaloutput = programs.copy;

  // Check if all essential programs compiled successfully (including fallbacks)
  const requiredPrograms = ['oscillator', 'noise', 'shape', 'copy'];
  const missingPrograms = requiredPrograms.filter(name => !programs[name]);

  if (missingPrograms.length > 0) {
    Logger.error('Critical shader programs missing even after fallback attempts:', missingPrograms);
    return false;
  }

  // Count fallback programs
  const fallbackCount = Object.values(programs).filter(program => program && program.isFallback).length;
  if (fallbackCount > 0) {
    Logger.warn(`${fallbackCount} shader programs using fallbacks - some features may be simplified`);
  }

  Logger.info('All essential shader programs available (including any fallbacks)');
  return true;
}

function compileShader(type, source) {
  return safeWebGLOperation(() => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const error = gl.getShaderInfoLog(shader);
      Logger.error("Shader compile error:", error);
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }, `shader compilation (${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'})`, null);
}

function createProgram(vs, fs) {
  if (!vs || !fs) {
    Logger.error("Cannot create program: missing shaders");
    return null;
  }

  return safeWebGLOperation(() => {
    const prog = gl.createProgram();
    if (!prog) return null;

    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const error = gl.getProgramInfoLog(prog);
      Logger.error("Shader program link error:", error);
      gl.deleteProgram(prog);
      return null;
    }
    return prog;
  }, 'shader program creation', null);
}

function initFullscreenQuad() {
  return safeWebGLOperation(() => {
    const quadVerts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    quadBuffer.buf = gl.createBuffer();
    if (!quadBuffer.buf) return false;

    // Quad buffer for rendering (simple, no tracking)

    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer.buf);
    gl.bufferData(gl.ARRAY_BUFFER, quadVerts, gl.STATIC_DRAW);
    quadBuffer.itemSize = 2;
    quadBuffer.numItems = 4;
    return true;
  }, 'fullscreen quad buffer creation', false);
}

/**
 * Initialize the modern UI
 */
function initUI() {
  // Initialize graph visibility
  const nodeGraph = document.getElementById('node-graph');
  const toggleBtn = document.getElementById('toggle-graph-btn');

  if (graphVisible) {
    nodeGraph.classList.add('visible');
  }

  // Toolbar event listeners
  document.getElementById('fullscreen-btn').addEventListener('click', () => {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    }
  });

  document.getElementById('resolution-select').addEventListener('change', (e) => {
    handleResolutionChange(e.target.value);
  });

  // Project management event listeners
  document.getElementById('new-project-btn').addEventListener('click', newProject);
  document.getElementById('save-project-btn').addEventListener('click', () => saveProject());
  document.getElementById('load-project-btn').addEventListener('click', showProjectBrowser);
  document.getElementById('rename-project-btn').addEventListener('click', showRenameModal);
  document.getElementById('share-project-btn').addEventListener('click', showShareModal);

  // Undo/Redo event listeners
  document.getElementById('undo-btn').addEventListener('click', undo);
  document.getElementById('redo-btn').addEventListener('click', redo);

  // Copy/Paste event listeners
  document.getElementById('copy-btn').addEventListener('click', copySelectedNodes);
  document.getElementById('paste-btn').addEventListener('click', pasteNodes);

  // Modal event listeners
  document.getElementById('close-modal-btn').addEventListener('click', hideProjectBrowser);
  document.getElementById('sort-projects').addEventListener('change', refreshProjectsList);
  document.getElementById('save-rename-btn').addEventListener('click', saveRename);
  document.getElementById('cancel-rename-btn').addEventListener('click', hideRenameModal);

  // Share modal event listeners
  document.getElementById('close-share-modal-btn').addEventListener('click', hideShareModal);
  document.getElementById('copy-url-btn').addEventListener('click', copyShareURL);
  document.getElementById('import-project-btn').addEventListener('click', () => {
    const importData = document.getElementById('import-data').value;
    if (importProjectFromText(importData)) {
      hideShareModal();
    }
  });

  // Close modals on backdrop click
  document.getElementById('project-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideProjectBrowser();
  });
  document.getElementById('rename-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideRenameModal();
  });
  document.getElementById('share-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) hideShareModal();
  });

  // Enter key handling for rename input
  document.getElementById('project-name-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveRename();
  });

  // Graph controls
  toggleBtn.addEventListener('click', () => {
    graphVisible = !graphVisible;
    if (graphVisible) {
      nodeGraph.classList.add('visible');
      toggleBtn.classList.add('active');
    } else {
      nodeGraph.classList.remove('visible');
      toggleBtn.classList.remove('active');
    }
  });

  document.getElementById('fit-graph-btn').addEventListener('click', fitGraphToView);

  // Node palette
  document.querySelectorAll('.palette-node').forEach(node => {
    node.addEventListener('click', (e) => {
      const type = e.currentTarget.dataset.type;
      const rect = document.getElementById('center-area').getBoundingClientRect();
      const x = Math.random() * (rect.width - 200) + 100;
      const y = Math.random() * (rect.height - 120) + 100;
      createNode(type, x, y);
    });
  });

  // Group creation
  document.getElementById('create-group-btn').addEventListener('click', () => {
    const name = prompt("Enter group name:");
    if (name && !groups[name]) {
      createGroup(name);
    }
  });

  // Graph interaction
  setupGraphInteraction();

  // Mini-map interaction
  setupMiniMapInteraction();

  // Graph controls
  document.getElementById('fit-graph-btn').addEventListener('click', fitGraphToView);
  document.getElementById('reset-zoom-btn').addEventListener('click', resetGraphZoom);

  // Auto-layout toggle
  document.getElementById('auto-layout-btn').addEventListener('click', async () => {
    autoLayoutEnabled = !autoLayoutEnabled;
    const btn = document.getElementById('auto-layout-btn');
    if (autoLayoutEnabled) {
      btn.classList.add('active');
      btn.title = 'Auto Layout (On)';
      await applyAutoLayout(); // Apply layout immediately when enabled
    } else {
      btn.classList.remove('active');
      btn.title = 'Auto Layout (Off)';
    }
  });

  // Minimap toggle
  document.getElementById('toggle-minimap-btn').addEventListener('click', () => {
    const minimap = document.getElementById('mini-map');
    const btn = document.getElementById('toggle-minimap-btn');
    if (minimap.style.display === 'none') {
      minimap.style.display = 'block';
      btn.classList.add('active');
      btn.title = 'Hide Overview';
      updateMiniMap(); // Refresh minimap when shown
    } else {
      minimap.style.display = 'none';
      btn.classList.remove('active');
      btn.title = 'Show Overview';
    }
  });

  // Control Input Manager
  initControlInputManager();

  // Track mouse position for cursor input nodes
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mousePos.x = e.clientX - rect.left;
    mousePos.y = e.clientY - rect.top;
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Check if user is typing in an input field
    const isTyping = e.target.tagName === 'INPUT' ||
                     e.target.tagName === 'TEXTAREA' ||
                     e.target.contentEditable === 'true';

    // Copy/Paste shortcuts (work even when typing)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      copySelectedNodes();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      pasteNodes();
    }
    // Undo/Redo shortcuts (work even when typing for global undo)
    else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      undo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && !isTyping) {
      e.preventDefault();
      redo();
    }
    // Delete node shortcut (ONLY when not typing)
    else if ((e.key === 'Delete' || e.key === 'Backspace') && !isTyping) {
      if (selectedNode) {
        e.preventDefault();
        deleteNode(selectedNode);
      }
    }
  });
}

/**
 * Create the permanent Final Output node
 */
function createFinalOutputNode() {
  // Position Canvas in bottom right area
  const x = 1000; // Far right position
  const y = 400;  // Bottom area position

  const finalOutputNode = new SynthNode('FinalOutput', x, y);
  finalOutputNode.name = 'Canvas';

  // Ensure inputs array is properly initialized
  if (!finalOutputNode.inputs) {
    finalOutputNode.inputs = [null];
  }

  nodes.push(finalOutputNode);

  // Setup WebGL resources (it needs a framebuffer like other nodes)
  allocateNodeFBO(finalOutputNode);

  // Create visual representation
  createNodeElement(finalOutputNode);
  updateConnections();
  updateMainOutputDropdown();

  // Set as main output initially
  setMainOutput(finalOutputNode);

  Logger.info('Created permanent Canvas node');

  return finalOutputNode;
}

// Layout configuration
const LAYOUT_ENGINE = "elk";      // quickly swap to "dagre" to compare
const DIR          = "RIGHT";     // "RIGHT", "DOWN", etc.

/**
 * Modern auto-layout using ELK.js or Dagre
 */
async function applyAutoLayout() {
  if (!autoLayoutEnabled) return;
  
  Logger.info(`Applying auto-layout with ${LAYOUT_ENGINE}...`);
  
  // Show visual feedback
  const btn = document.getElementById('auto-layout-btn');
  const originalTitle = btn.title;
  btn.classList.add('loading');
  btn.title = 'Applying layout...';
  showAutoLayoutFeedback();
  
  try {
    // Prepare nodes and edges for layout
    const layoutNodes = [];
    const layoutEdges = [];
    
    // Get all nodes (excluding Canvas/FinalOutput)
    nodes.forEach(node => {
      if (node.type !== 'FinalOutput' && node.name !== 'Canvas') {
        layoutNodes.push({
          id: node.id.toString(),
          width: node.width || 160,
          height: node.height || 80
        });
      }
    });
    
    // Get all connections/edges
    nodes.forEach(node => {
      // Main inputs
      if (node.inputs) {
        node.inputs.forEach((input, idx) => {
          if (input && input.id) {
            layoutEdges.push({
              from: input.id.toString(),
              to: node.id.toString()
            });
          }
        });
      }
      
      // Control inputs
      if (node.controlInputs) {
        node.controlInputs.forEach((input, idx) => {
          if (input && input.id) {
            layoutEdges.push({
              from: input.id.toString(),
              to: node.id.toString()
            });
          }
        });
      }
    });
    
    // Apply the selected layout engine
    const pos = LAYOUT_ENGINE === "elk"
      ? await elkLayout(layoutNodes, layoutEdges, DIR)
      : dagreLayout(layoutNodes, layoutEdges, DIR === "RIGHT" ? "LR" : "TB");
    
    // Apply positions to nodes with animation
    for (const node of nodes) {
      const nodePos = pos.get(node.id.toString());
      if (nodePos) {
        const { x, y } = nodePos;
        // Add offset for better positioning
        animateNodeToPosition(node, x + 100, y + 100);
      }
    }
    
    // Special handling for Canvas node
    const canvasNode = nodes.find(n => n.type === 'FinalOutput' || n.name === 'Canvas');
    if (canvasNode) {
      // Find the rightmost node position
      let maxX = 100;
      let avgY = 100;
      let nodeCount = 0;
      
      nodes.forEach(node => {
        if (node !== canvasNode && pos.has(node.id.toString())) {
          const nodePos = pos.get(node.id.toString());
          maxX = Math.max(maxX, nodePos.x + (node.width || 160));
          avgY += nodePos.y;
          nodeCount++;
        }
      });
      
      if (nodeCount > 0) {
        avgY = avgY / nodeCount;
      }
      
      // Position Canvas to the right of all nodes
      animateNodeToPosition(canvasNode, maxX + 250, avgY);
    }
    
    // Update connections after layout
    setTimeout(() => {
      updateConnections();
      // Restore button state
      btn.classList.remove('loading');
      btn.title = originalTitle;
    }, 600);
    
  } catch (error) {
    Logger.error(`Layout with ${LAYOUT_ENGINE} failed:`, error);
    // Restore button state
    btn.classList.remove('loading');
    btn.title = originalTitle;
    
    // Fallback to the other engine
    if (LAYOUT_ENGINE === "elk") {
      Logger.info('Falling back to Dagre...');
      await applyAutoLayoutWithDagre();
    } else {
      Logger.info('Falling back to manual layout...');
      performAutoLayoutManual();
    }
  }
}

/**
 * Fallback to Dagre if ELK fails
 */
async function applyAutoLayoutWithDagre() {
  try {
    const layoutNodes = [];
    const layoutEdges = [];
    
    nodes.forEach(node => {
      if (node.type !== 'FinalOutput' && node.name !== 'Canvas') {
        layoutNodes.push({
          id: node.id.toString(),
          width: node.width || 160,
          height: node.height || 80
        });
      }
    });
    
    nodes.forEach(node => {
      if (node.inputs) {
        node.inputs.forEach((input, idx) => {
          if (input && input.id) {
            layoutEdges.push({
              from: input.id.toString(),
              to: node.id.toString()
            });
          }
        });
      }
      
      if (node.controlInputs) {
        node.controlInputs.forEach((input, idx) => {
          if (input && input.id) {
            layoutEdges.push({
              from: input.id.toString(),
              to: node.id.toString()
            });
          }
        });
      }
    });
    
    const pos = dagreLayout(layoutNodes, layoutEdges, "LR");
    
    for (const node of nodes) {
      const nodePos = pos.get(node.id.toString());
      if (nodePos) {
        const { x, y } = nodePos;
        animateNodeToPosition(node, x + 100, y + 100);
      }
    }
    
    const canvasNode = nodes.find(n => n.type === 'FinalOutput' || n.name === 'Canvas');
    if (canvasNode) {
      let maxX = 100;
      let avgY = 100;
      let nodeCount = 0;
      
      nodes.forEach(node => {
        if (node !== canvasNode && pos.has(node.id.toString())) {
          const nodePos = pos.get(node.id.toString());
          maxX = Math.max(maxX, nodePos.x + (node.width || 160));
          avgY += nodePos.y;
          nodeCount++;
        }
      });
      
      if (nodeCount > 0) {
        avgY = avgY / nodeCount;
      }
      
      animateNodeToPosition(canvasNode, maxX + 250, avgY);
    }
    
    setTimeout(() => {
      updateConnections();
    }, 600);
    
  } catch (error) {
    Logger.error('Dagre layout also failed:', error);
    performAutoLayoutManual();
  }
}

/**
 * Legacy auto-layout system - uses ELK.js for professional graph layout
 */
async function performAutoLayout() {
  if (!autoLayoutEnabled) return;

  Logger.info('Performing auto-layout with ELK.js...');
  showAutoLayoutFeedback();

  try {
    // Prepare nodes and edges for layout
    const layoutNodes = [];
    const layoutEdges = [];
    
    // Convert our nodes to layout format
    nodes.forEach(node => {
      if (node.type !== 'FinalOutput' && node.name !== 'Canvas') {
        layoutNodes.push({
          id: node.id.toString(),
          width: node.width || 160,
          height: node.height || 80
        });
      }
    });
    
    // Build edges from connections
    nodes.forEach(node => {
      // Main inputs
      node.inputs.forEach((input, idx) => {
        if (input && input.id) {
          layoutEdges.push({
            from: input.id.toString(),
            to: node.id.toString()
          });
        }
      });
      
      // Control inputs
      if (node.controlInputs) {
        node.controlInputs.forEach((input, idx) => {
          if (input && input.id) {
            layoutEdges.push({
              from: input.id.toString(),
              to: node.id.toString()
            });
          }
        });
      }
    });
    
    // Use ELK to calculate positions
    const positions = await elkLayout(layoutNodes, layoutEdges, "RIGHT");
    
    // Apply positions with animation
    const startOffset = { x: 100, y: 100 };
    nodes.forEach(node => {
      if (positions.has(node.id.toString())) {
        const pos = positions.get(node.id.toString());
        animateNodeToPosition(node, pos.x + startOffset.x, pos.y + startOffset.y);
      }
    });
    
    // Position Canvas node
    const canvasNode = nodes.find(n => n.type === 'FinalOutput' || n.name === 'Canvas');
    if (canvasNode) {
      // Find rightmost position
      let maxX = startOffset.x;
      let centerY = startOffset.y;
      let nodeCount = 0;
      
      nodes.forEach(node => {
        if (node !== canvasNode) {
          maxX = Math.max(maxX, node.x + (node.width || 160));
          centerY += node.y;
          nodeCount++;
        }
      });
      
      if (nodeCount > 0) {
        centerY = centerY / nodeCount;
      }
      
      // Position Canvas to the right
      animateNodeToPosition(canvasNode, maxX + 200, centerY);
    }
    
    // Update connections after animation
    setTimeout(() => {
      updateConnections();
      fitGraphToView();
    }, 600);
    
  } catch (error) {
    Logger.error('ELK layout failed, falling back to dagre:', error);
    
    // Fallback to dagre
    performAutoLayoutDagre();
  }
}

/**
 * Fallback layout using Dagre
 */
function performAutoLayoutDagre() {
  Logger.info('Using Dagre fallback layout...');
  
  try {
    // Prepare nodes and edges
    const layoutNodes = [];
    const layoutEdges = [];
    
    nodes.forEach(node => {
      if (node.type !== 'FinalOutput' && node.name !== 'Canvas') {
        layoutNodes.push({
          id: node.id.toString(),
          width: node.width || 160,
          height: node.height || 80
        });
      }
    });
    
    nodes.forEach(node => {
      node.inputs.forEach((input, idx) => {
        if (input && input.id) {
          layoutEdges.push({
            from: input.id.toString(),
            to: node.id.toString()
          });
        }
      });
      
      if (node.controlInputs) {
        node.controlInputs.forEach((input, idx) => {
          if (input && input.id) {
            layoutEdges.push({
              from: input.id.toString(),
              to: node.id.toString()
            });
          }
        });
      }
    });
    
    // Use Dagre to calculate positions
    const positions = dagreLayout(layoutNodes, layoutEdges, "LR");
    
    // Apply positions
    const startOffset = { x: 100, y: 100 };
    nodes.forEach(node => {
      if (positions.has(node.id.toString())) {
        const pos = positions.get(node.id.toString());
        animateNodeToPosition(node, pos.x + startOffset.x, pos.y + startOffset.y);
      }
    });
    
    // Position Canvas node
    const canvasNode = nodes.find(n => n.type === 'FinalOutput' || n.name === 'Canvas');
    if (canvasNode) {
      let maxX = startOffset.x;
      let centerY = startOffset.y;
      let nodeCount = 0;
      
      nodes.forEach(node => {
        if (node !== canvasNode) {
          maxX = Math.max(maxX, node.x + (node.width || 160));
          centerY += node.y;
          nodeCount++;
        }
      });
      
      if (nodeCount > 0) {
        centerY = centerY / nodeCount;
      }
      
      animateNodeToPosition(canvasNode, maxX + 200, centerY);
    }
    
    setTimeout(() => {
      updateConnections();
      fitGraphToView();
    }, 600);
    
  } catch (error) {
    Logger.error('Dagre layout also failed:', error);
    // Fall back to the original manual layout
    performAutoLayoutManual();
  }
}

/**
 * Original manual layout as final fallback
 */
function performAutoLayoutManual() {
  Logger.info('Using manual fallback layout...');
  
  // Improved layout configuration
  const SPACING = {
    x: 300,      // Horizontal spacing between columns (increased)
    y: 180,      // Vertical spacing between nodes (increased)
    groupGap: 250, // Gap between disconnected groups
    startX: 100,
    startY: 100,
    canvasOffset: { x: 250, y: 150 }
  };

  // Categorize nodes
  const canvasNode = nodes.find(n => n.type === 'FinalOutput' || n.name === 'Canvas');
  const regularNodes = nodes.filter(n => n !== canvasNode);
  
  // Build connection map
  const connections = new Map();
  const reverseConnections = new Map();
  
  regularNodes.forEach(node => {
    connections.set(node.id, []);
    reverseConnections.set(node.id, []);
  });
  
  // Map all connections
  regularNodes.forEach(node => {
    // Main inputs
    node.inputs.forEach((input, idx) => {
      if (input && input.id) {
        connections.get(input.id).push({ node: node, port: idx });
        reverseConnections.get(node.id).push({ node: input, port: idx });
      }
    });
    
    // Control inputs
    if (node.controlInputs) {
      node.controlInputs.forEach((input, idx) => {
        if (input && input.id) {
          connections.get(input.id).push({ node: node, port: node.inputs.length + idx, isControl: true });
          reverseConnections.get(node.id).push({ node: input, port: node.inputs.length + idx, isControl: true });
        }
      });
    }
  });
  
  // Find connected components (groups of connected nodes)
  const visited = new Set();
  const groups = [];
  
  regularNodes.forEach(node => {
    if (!visited.has(node.id)) {
      const group = [];
      const queue = [node];
      
      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current.id)) continue;
        
        visited.add(current.id);
        group.push(current);
        
        // Add connected nodes to queue
        connections.get(current.id).forEach(conn => {
          if (!visited.has(conn.node.id)) queue.push(conn.node);
        });
        reverseConnections.get(current.id).forEach(conn => {
          if (!visited.has(conn.node.id)) queue.push(conn.node);
        });
      }
      
      groups.push(group);
    }
  });
  
  // Sort groups by size (largest first)
  groups.sort((a, b) => b.length - a.length);
  
  let currentY = SPACING.startY; // Start position
  
  // Layout each group
  groups.forEach((group, groupIndex) => {
    Logger.debug(`Laying out group ${groupIndex} with ${group.length} nodes`);
    // Calculate depth for each node in the group
    const depths = new Map();
    const sources = group.filter(n => {
      // Control input nodes are always sources
      if (n.category === 'input') return true;
      // Other nodes with no inputs are sources
      return !reverseConnections.get(n.id) || reverseConnections.get(n.id).length === 0;
    });
    
    // If no sources found, make the first node a source
    if (sources.length === 0 && group.length > 0) {
      sources.push(group[0]);
    }
    
    // BFS to assign depths
    sources.forEach(source => depths.set(source.id, 0));
    const queue = [...sources];
    
    while (queue.length > 0) {
      const current = queue.shift();
      const currentDepth = depths.get(current.id) || 0;
      
      connections.get(current.id).forEach(conn => {
        if (!depths.has(conn.node.id) || depths.get(conn.node.id) > currentDepth + 1) {
          depths.set(conn.node.id, currentDepth + 1);
          queue.push(conn.node);
        }
      });
    }
    
    // Group nodes by depth
    const layers = new Map();
    group.forEach(node => {
      const depth = depths.get(node.id) || 0;
      if (!layers.has(depth)) layers.set(depth, []);
      layers.get(depth).push(node);
    });
    
    // Sort each layer to minimize crossings
    layers.forEach((layerNodes, depth) => {
      if (depth > 0) {
        // Sort by connection to previous layer
        layerNodes.sort((a, b) => {
          // Find which port each connects to
          let aMinPort = Infinity;
          let bMinPort = Infinity;
          
          reverseConnections.get(a.id).forEach(conn => {
            if (depths.get(conn.node.id) === depth - 1) {
              aMinPort = Math.min(aMinPort, conn.port);
            }
          });
          
          reverseConnections.get(b.id).forEach(conn => {
            if (depths.get(conn.node.id) === depth - 1) {
              bMinPort = Math.min(bMinPort, conn.port);
            }
          });
          
          return aMinPort - bMinPort;
        });
      }
    });
    
    // Position nodes in this group
    let maxY = currentY;
    
    // Handle single unconnected nodes differently
    if (group.length === 1 && sources.length === 1) {
      // Simple placement for isolated nodes
      const node = group[0];
      const x = SPACING.startX + (groupIndex % 3) * SPACING.x;
      const y = currentY;
      animateNodeToPosition(node, x, y);
      maxY = y;
      currentY = y + SPACING.y;
      return; // Skip the complex layout for single nodes
    }
    
    // Layout by depth with proper spacing
    const sortedDepths = Array.from(layers.keys()).sort((a, b) => a - b);
    let groupHeight = 0;
    
    sortedDepths.forEach(depth => {
      const layerNodes = layers.get(depth);
      const x = SPACING.startX + (depth * SPACING.x);
      
      // Calculate total height needed for this layer
      const layerHeight = layerNodes.length * SPACING.y;
      groupHeight = Math.max(groupHeight, layerHeight);
      
      // Center the layer vertically within the group
      const layerStartY = currentY + (groupHeight - layerHeight) / 2;
      
      layerNodes.forEach((node, idx) => {
        const y = layerStartY + (idx * SPACING.y);
        animateNodeToPosition(node, x, y);
        maxY = Math.max(maxY, y);
      });
    });
    
    // Add gap before next group
    currentY = Math.max(currentY + groupHeight, maxY) + SPACING.groupGap;
  });
  
  // Position Canvas node with proper offset
  if (canvasNode) {
    // Find rightmost and bottommost regular node positions
    let maxX = SPACING.startX;
    let maxY = SPACING.startY;
    let rightmostNodeX = SPACING.startX;
    
    regularNodes.forEach(node => {
      // Track actual rightmost position including node width
      if (node.x > rightmostNodeX) {
        rightmostNodeX = node.x;
      }
      maxX = Math.max(maxX, node.x);
      maxY = Math.max(maxY, node.y);
    });
    
    // Position Canvas to the right and slightly below
    const canvasX = rightmostNodeX + SPACING.canvasOffset.x;
    const canvasY = maxY + SPACING.canvasOffset.y;
    
    Logger.debug(`Positioning Canvas node at (${canvasX}, ${canvasY})`);
    animateNodeToPosition(canvasNode, canvasX, canvasY);
  }
  
  // Update connections after animation
  setTimeout(() => {
    updateConnections();
    fitGraphToView();
  }, 600);
}

/**
 * Draw a preview of the curve function for Range nodes
 */
function drawCurvePreview(canvas, curveType, mode = 'one-way') {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Clear canvas
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);
  
  // Draw grid
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, height/2);
  ctx.lineTo(width, height/2);
  ctx.moveTo(width/2, 0);
  ctx.lineTo(width/2, height);
  ctx.stroke();
  
  // Draw curve
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  const steps = 100;
  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let value = t;
    
    // Apply curve function
    switch (curveType) {
      case 'exponential':
        value = Math.pow(t, 2);
        break;
      case 'logarithmic':
        if (t <= 0) {
          value = 0;
        } else {
          value = Math.log(1 + t * 9) / Math.log(10);
        }
        break;
      case 'sine':
        value = (Math.sin((t - 0.5) * Math.PI) + 1) / 2;
        break;
      case 'bounce':
        // Single bounce instead of double
        value = Math.abs(Math.sin(t * Math.PI));
        break;
      // 'linear' is default
    }
    
    // Apply round-trip mode if enabled
    if (mode === 'round-trip') {
      // Special handling for different curves in round-trip mode
      switch (curveType) {
        case 'sine':
          // Full sine wave: 0 -> 1 -> 0
          value = (Math.sin(t * Math.PI * 2 - Math.PI/2) + 1) / 2;
          break;
          
        case 'bounce':
          // Single bounce: just use sine for smooth up and down
          value = Math.sin(t * Math.PI);
          break;
          
        case 'exponential':
          // Exponential up, exponential down
          if (t <= 0.5) {
            value = Math.pow(t * 2, 2);
          } else {
            value = Math.pow((1 - t) * 2, 2);
          }
          break;
          
        case 'logarithmic':
          // Logarithmic up, logarithmic down
          if (t <= 0.5) {
            const progress = t * 2;
            value = Math.log(1 + progress * 9) / Math.log(10);
          } else {
            const progress = (1 - t) * 2;
            value = Math.log(1 + progress * 9) / Math.log(10);
          }
          break;
          
        default: // linear
          // Triangle wave
          if (t <= 0.5) {
            value = t * 2;
          } else {
            value = 2 - (t * 2);
          }
      }
    }
    
    const x = t * width;
    const y = height - (value * height);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.stroke();
  
  // Draw curve type label
  ctx.fillStyle = '#888';
  ctx.font = '10px Inter, sans-serif';
  ctx.fillText(curveType, 4, 12);
}

/**
 * Build a graph representation of nodes and their connections
 * [DEPRECATED - Kept for compatibility]
 */
function buildNodeGraph() {
  const graph = {
    nodes: new Map(),
    edges: []
  };
  
  // Initialize node data
  nodes.forEach(node => {
    graph.nodes.set(node.id, {
      node: node,
      inputs: [],
      outputs: [],
      depth: -1,
      position: null,
      isCanvas: node.type === 'FinalOutput' || node.name === 'Canvas'
    });
  });
  
  // Build connection data
  nodes.forEach(node => {
    const nodeData = graph.nodes.get(node.id);
    
    // Track inputs
    node.inputs.forEach((input, index) => {
      if (input) {
        nodeData.inputs.push({ from: input.id, toPort: index });
        const inputData = graph.nodes.get(input.id);
        if (inputData) {
          inputData.outputs.push({ to: node.id, fromPort: 0 });
        }
        graph.edges.push({ from: input.id, to: node.id });
      }
    });
    
    // Track control inputs
    if (node.controlInputs) {
      node.controlInputs.forEach((input, index) => {
        if (input) {
          nodeData.inputs.push({ from: input.id, toPort: index + node.inputs.length, isControl: true });
          const inputData = graph.nodes.get(input.id);
          if (inputData) {
            inputData.outputs.push({ to: node.id, fromPort: 0, isControl: true });
          }
          graph.edges.push({ from: input.id, to: node.id, isControl: true });
        }
      });
    }
  });
  
  // Calculate depth (distance from source nodes)
  calculateNodeDepths(graph);
  
  return graph;
}

/**
 * Calculate depth of each node in the graph
 */
function calculateNodeDepths(graph) {
  // Find source nodes (no inputs, excluding Canvas)
  const sources = [];
  graph.nodes.forEach((data, id) => {
    if (!data.isCanvas && data.inputs.length === 0) {
      data.depth = 0;
      sources.push(id);
    }
  });
  
  // BFS to calculate depths
  const queue = [...sources];
  while (queue.length > 0) {
    const nodeId = queue.shift();
    const nodeData = graph.nodes.get(nodeId);
    
    nodeData.outputs.forEach(output => {
      const targetData = graph.nodes.get(output.to);
      if (targetData.depth === -1 || targetData.depth > nodeData.depth + 1) {
        targetData.depth = nodeData.depth + 1;
        queue.push(output.to);
      }
    });
  }
  
  // Handle disconnected nodes
  graph.nodes.forEach((data, id) => {
    if (data.depth === -1) {
      data.depth = 0;
    }
  });
}

/**
 * Calculate optimal layout positions to minimize crossings
 */
function calculateOptimalLayout(graph) {
  const positions = new Map();
  
  // Group nodes by depth (excluding Canvas)
  const layers = new Map();
  graph.nodes.forEach((data, id) => {
    if (!data.isCanvas) {
      if (!layers.has(data.depth)) {
        layers.set(data.depth, []);
      }
      layers.get(data.depth).push(id);
    }
  });
  
  // Position nodes layer by layer
  const layerX = new Map();
  const baseX = 50;
  const xSpacing = 200;
  
  // Calculate X positions for each layer
  for (let depth = 0; depth <= Math.max(...layers.keys()); depth++) {
    layerX.set(depth, baseX + (depth * xSpacing));
  }
  
  // Position nodes within each layer to minimize crossings
  layers.forEach((layerNodes, depth) => {
    // Sort nodes in this layer based on their connections to previous layer
    if (depth > 0) {
      // Sort nodes based on which nodes they connect TO
      // This ensures proper alignment with downstream nodes
      layerNodes.sort((a, b) => {
        const aData = graph.nodes.get(a);
        const bData = graph.nodes.get(b);
        
        // Find the minimum port index each node connects to
        const getMinOutputPort = (nodeData) => {
          let minPort = Infinity;
          
          // Look through the actual node's outputs to find port connections
          const actualNode = nodeData.node;
          nodes.forEach(targetNode => {
            targetNode.inputs.forEach((input, portIndex) => {
              if (input && input.id === actualNode.id) {
                minPort = Math.min(minPort, portIndex);
              }
            });
          });
          
          return minPort === Infinity ? 999 : minPort;
        };
        
        // Also check input connections for secondary sorting
        const getBarycenter = (nodeData) => {
          if (nodeData.inputs.length === 0) return 999;
          
          let totalY = 0;
          let count = 0;
          
          nodeData.inputs.forEach(input => {
            const inputPos = positions.get(input.from);
            if (inputPos) {
              totalY += inputPos.y;
              count++;
            }
          });
          
          return count > 0 ? totalY / count : 999;
        };
        
        // First sort by which port they connect to (top ports first)
        const aMinPort = getMinOutputPort(aData);
        const bMinPort = getMinOutputPort(bData);
        
        Logger.debug(`Sorting ${aData.node.name} (port ${aMinPort}) vs ${bData.node.name} (port ${bMinPort})`);
        
        if (aMinPort !== bMinPort) {
          return aMinPort - bMinPort;
        }
        
        // Then by input positions
        return getBarycenter(aData) - getBarycenter(bData);
      });
    } else {
      // For the first layer, sort by which ports they connect to
      layerNodes.sort((a, b) => {
        const aData = graph.nodes.get(a);
        const bData = graph.nodes.get(b);
        
        // Find the minimum port index each node connects to
        const getMinOutputPort = (nodeData) => {
          let minPort = Infinity;
          let minTargetId = Infinity;
          
          // Look through actual nodes to find port connections
          const actualNode = nodeData.node;
          nodes.forEach(targetNode => {
            if (targetNode.type !== 'FinalOutput' && targetNode.name !== 'Canvas') {
              targetNode.inputs.forEach((input, portIndex) => {
                if (input && input.id === actualNode.id) {
                  // Use port index as primary sort, target node ID as secondary
                  if (portIndex < minPort || (portIndex === minPort && targetNode.id < minTargetId)) {
                    minPort = portIndex;
                    minTargetId = targetNode.id;
                  }
                }
              });
            }
          });
          
          return { port: minPort === Infinity ? 999 : minPort, targetId: minTargetId };
        };
        
        const aOutput = getMinOutputPort(aData);
        const bOutput = getMinOutputPort(bData);
        
        // Sort by port index first
        if (aOutput.port !== bOutput.port) {
          return aOutput.port - bOutput.port;
        }
        
        // Then by target node ID if connecting to same port
        if (aOutput.targetId !== bOutput.targetId) {
          return aOutput.targetId - bOutput.targetId;
        }
        
        // Finally by node type for consistency
        return aData.node.type.localeCompare(bData.node.type);
      });
    }
    
    // Assign Y positions within the layer
    const ySpacing = 120;
    const startY = 80;
    
    // Check if we need multiple columns for this layer
    const maxNodesPerColumn = 5;
    const columns = Math.ceil(layerNodes.length / maxNodesPerColumn);
    
    layerNodes.forEach((nodeId, index) => {
      const column = Math.floor(index / maxNodesPerColumn);
      const rowInColumn = index % maxNodesPerColumn;
      
      const x = layerX.get(depth) + (column * 150); // Sub-columns
      const y = startY + (rowInColumn * ySpacing);
      positions.set(nodeId, { x, y });
    });
  });
  
  // Special handling for Canvas node (check both name and type)
  const canvasNode = nodes.find(n => n.type === 'FinalOutput' || n.name === 'Canvas');
  if (canvasNode) {
    // Find the rightmost and bottommost positions of all other nodes
    let maxX = 0;
    let maxY = 0;
    let rightmostNodeY = 0;
    let nodeCount = 0;
    
    positions.forEach((pos, id) => {
      if (id !== canvasNode.id) {
        nodeCount++;
        if (pos.x >= maxX) {
          maxX = pos.x;
          rightmostNodeY = pos.y; // Y position of the rightmost node
        }
        maxY = Math.max(maxY, pos.y);
      }
    });
    
    // If no other nodes positioned yet, use defaults
    if (nodeCount === 0) {
      maxX = 250;
      maxY = 200;
      rightmostNodeY = 200;
    }
    
    // Position Canvas to the right and below
    // Use the Y position of the rightmost node plus offset to avoid overlap
    const canvasX = maxX + 250; // Further right to avoid overlap
    const canvasY = Math.max(rightmostNodeY + 150, maxY + 150); // Below rightmost or bottommost
    
    Logger.debug(`Canvas positioning: rightmost=(${maxX}, ${rightmostNodeY}), bottommost=${maxY}, ` +
                 `Canvas will be at (${canvasX}, ${canvasY})`);
    
    positions.set(canvasNode.id, {
      x: canvasX,
      y: canvasY
    });
  }
  
  return positions;
}

/**
 * Further optimize layout to minimize crossings using iterative refinement
 */
function optimizeLayoutCrossings(graph, positions) {
  // Group nodes by their X position (layers)
  const layers = new Map();
  
  positions.forEach((pos, nodeId) => {
    if (!layers.has(pos.x)) {
      layers.set(pos.x, []);
    }
    layers.get(pos.x).push(nodeId);
  });
  
  // Sort layers by X position
  const sortedLayers = Array.from(layers.keys()).sort((a, b) => a - b);
  
  // Perform multiple passes to minimize crossings
  const maxPasses = 5; // More passes for better optimization
  for (let pass = 0; pass < maxPasses; pass++) {
    let totalCrossings = 0;
    let improved = false;
    
    // Try both forward and backward passes
    const layerOrder = pass % 2 === 0 ? sortedLayers : [...sortedLayers].reverse();
    
    // For each adjacent pair of layers
    for (let i = 0; i < layerOrder.length - 1; i++) {
      const leftLayerX = layerOrder[i];
      const rightLayerX = layerOrder[i + 1];
      const leftNodes = layers.get(leftLayerX);
      const rightNodes = layers.get(rightLayerX);
      
      if (!leftNodes || !rightNodes) continue;
      
      // Sort nodes in the right layer by barycenter method
      const nodePositions = new Map();
      rightNodes.forEach(nodeId => {
        const nodeData = graph.nodes.get(nodeId);
        let barycenter = 0;
        let count = 0;
        
        // Calculate barycenter based on connected nodes in left layer
        nodeData.inputs.forEach(input => {
          if (leftNodes.includes(input.from)) {
            const leftPos = positions.get(input.from);
            if (leftPos) {
              barycenter += leftPos.y;
              count++;
            }
          }
        });
        
        nodePositions.set(nodeId, count > 0 ? barycenter / count : Infinity);
      });
      
      // Sort right layer nodes by their barycenter
      rightNodes.sort((a, b) => nodePositions.get(a) - nodePositions.get(b));
      
      // Update positions based on new order
      const startY = 80;
      const ySpacing = 120;
      rightNodes.forEach((nodeId, index) => {
        const pos = positions.get(nodeId);
        const newY = startY + (index * ySpacing);
        if (Math.abs(pos.y - newY) > 1) {
          improved = true;
          positions.set(nodeId, { x: pos.x, y: newY });
        }
      });
    }
    
    // Count total crossings after this pass
    for (let i = 0; i < sortedLayers.length - 1; i++) {
      const leftNodes = layers.get(sortedLayers[i]);
      const rightNodes = layers.get(sortedLayers[i + 1]);
      if (leftNodes && rightNodes) {
        totalCrossings += countCrossings(graph, positions, leftNodes, rightNodes);
      }
    }
    
    Logger.debug(`Layout optimization pass ${pass + 1}: ${totalCrossings} crossings`);
    
    // Stop if no improvements were made
    if (!improved) break;
  }
}

/**
 * Count edge crossings between two layers
 */
function countCrossings(graph, positions, leftNodes, rightNodes) {
  let crossings = 0;
  
  // For each pair of edges between the layers
  for (let i = 0; i < leftNodes.length; i++) {
    const leftNodeData = graph.nodes.get(leftNodes[i]);
    
    for (let j = i + 1; j < leftNodes.length; j++) {
      const otherLeftNodeData = graph.nodes.get(leftNodes[j]);
      
      // Check all connections from these left nodes
      leftNodeData.outputs.forEach(output1 => {
        if (rightNodes.includes(output1.to)) {
          otherLeftNodeData.outputs.forEach(output2 => {
            if (rightNodes.includes(output2.to) && output1.to !== output2.to) {
              // Check if edges cross
              const pos1From = positions.get(leftNodes[i]);
              const pos1To = positions.get(output1.to);
              const pos2From = positions.get(leftNodes[j]);
              const pos2To = positions.get(output2.to);
              
              if (pos1From && pos1To && pos2From && pos2To) {
                // Simple crossing check: if the relative Y positions are inverted
                const crossed = (pos1From.y - pos2From.y) * (pos1To.y - pos2To.y) < 0;
                if (crossed) crossings++;
              }
            }
          });
        }
      });
    }
  }
  
  return crossings;
}

/**
 * Apply calculated positions to nodes
 */
function applyLayoutPositions(positions) {
  positions.forEach((pos, nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      animateNodeToPosition(node, pos.x, pos.y);
    }
  });
  
  // Update connections after layout
  setTimeout(() => {
    updateConnections();
    fitGraphToView();
  }, 600);
}

/**
 * Legacy performAutoLayout for backward compatibility
 */
function performAutoLayoutLegacy() {
  // Group nodes by category, with special handling for Canvas
  const nodesByCategory = {
    input: nodes.filter(n => n.category === 'input' && n.name !== 'Canvas'),
    source: nodes.filter(n => n.category === 'source' && n.name !== 'Canvas'),
    effect: nodes.filter(n => n.category === 'effect' && n.name !== 'Canvas'),
    compositing: nodes.filter(n => n.category === 'compositing' && n.name !== 'Canvas'),
    system: nodes.filter(n => n.category === 'system' && n.name !== 'Canvas')
  };

  // Find Canvas node for special positioning
  const canvasDisplayNode = nodes.find(n => n.name === 'Canvas');
  Logger.debug(`Canvas node search: found=${!!canvasDisplayNode}`);
  if (canvasDisplayNode) {
    Logger.debug(`Canvas details: name=${canvasDisplayNode.name}, ` +
                 `type=${canvasDisplayNode.type}, category=${canvasDisplayNode.category}, ` +
                 `position=(${canvasDisplayNode.x}, ${canvasDisplayNode.y})`);
  }

  // Debug: show which nodes are in each category
  Object.keys(nodesByCategory).forEach(category => {
    if (nodesByCategory[category].length > 0) {
      Logger.debug(`${category}: ${nodesByCategory[category].map(n => n.name).join(', ')}`);
    }
  });

  // Calculate positions for each category
  Object.keys(nodesByCategory).forEach(category => {
    const categoryNodes = nodesByCategory[category];
    if (categoryNodes.length === 0) return;

    const layerConfig = LAYOUT_CONFIG.layers[category];
    const startY = LAYOUT_CONFIG.padding.y;

    // Sort nodes intelligently:
    // 1. By connection complexity (more connected nodes higher)
    // 2. By data flow depth (sources that feed many things higher)
    categoryNodes.sort((a, b) => {
      // Count input connections
      const aInputs = a.inputs.filter(i => i !== null).length +
                     (a.controlInputs ? a.controlInputs.filter(c => c !== null).length : 0);
      const bInputs = b.inputs.filter(i => i !== null).length +
                     (b.controlInputs ? b.controlInputs.filter(c => c !== null).length : 0);

      // Count output connections (how many nodes use this node)
      const aOutputs = nodes.filter(n =>
        n.inputs.includes(a) || (n.controlInputs && n.controlInputs.includes(a))
      ).length;
      const bOutputs = nodes.filter(n =>
        n.inputs.includes(b) || (n.controlInputs && n.controlInputs.includes(b))
      ).length;

      // Prioritize by total connections, then by outputs (feeding many nodes)
      const aTotalConnections = aInputs + aOutputs;
      const bTotalConnections = bInputs + bOutputs;

      if (aTotalConnections !== bTotalConnections) {
        return bTotalConnections - aTotalConnections;
      }

      return bOutputs - aOutputs; // More outputs = higher priority
    });

    // Create sub-columns for nodes with many connections
    let currentColumn = 0;
    let currentColumnHeight = 0;
    const maxColumnHeight = 4; // Max nodes per sub-column

    categoryNodes.forEach((node, index) => {
      if (index > 0 && index % maxColumnHeight === 0) {
        currentColumn++;
        currentColumnHeight = 0;
      }

      const x = layerConfig.x + (currentColumn * 180); // Sub-column spacing
      const y = startY + (currentColumnHeight * LAYOUT_CONFIG.nodeSpacing.y);
      currentColumnHeight++;

      // Animate to new position
      animateNodeToPosition(node, x, y);
    });
  });

  // Position Canvas node just a bit to the right of other nodes (user requirement)
  Logger.debug(`Attempting to position Canvas node: ${canvasDisplayNode ? `found ${canvasDisplayNode.name} at (${canvasDisplayNode.x}, ${canvasDisplayNode.y})` : 'NOT FOUND'}`);
  if (canvasDisplayNode) {
    // Find the actual rightmost and bottommost nodes (not layout config)
    const otherNodes = nodes.filter(n => n !== canvasDisplayNode);

    let rightmostX = 250; // Default if no other nodes
    let bottomY = 200;    // Default if no other nodes

    if (otherNodes.length > 0) {
      rightmostX = Math.max(...otherNodes.map(n => n.x));
      bottomY = Math.max(...otherNodes.map(n => n.y));
    }

    // Position Canvas just a bit to the right and down - much smaller offsets
    const canvasX = rightmostX + 180; // Just a bit to the right (one node width)
    const canvasY = bottomY + 100;    // Just a bit below (less than one node height)

    Logger.debug(`Canvas positioning calculation:
      - Other nodes rightmost X: ${rightmostX}
      - Other nodes bottom Y: ${bottomY}
      - Canvas target position: (${canvasX}, ${canvasY})
      - Canvas current position: (${canvasDisplayNode.x}, ${canvasDisplayNode.y})`);

    // FORCE immediate positioning without animation for debugging
    canvasDisplayNode.x = canvasX;
    canvasDisplayNode.y = canvasY;
    canvasDisplayNode.element.style.left = canvasX + 'px';
    canvasDisplayNode.element.style.top = canvasY + 'px';

    Logger.debug(`Canvas position FORCED to (${canvasDisplayNode.x}, ${canvasDisplayNode.y})`);

    if (canvasDisplayNode.element) {
      // Monitor style property changes
      let currentLeft = canvasDisplayNode.element.style.left;
      let currentTop = canvasDisplayNode.element.style.top;

      const checkPositionChange = () => {
        if (canvasDisplayNode.element.style.left !== currentLeft || canvasDisplayNode.element.style.top !== currentTop) {
          Logger.error(`CANVAS MOVED! From (${currentLeft}, ${currentTop}) to (${canvasDisplayNode.element.style.left}, ${canvasDisplayNode.element.style.top})`);
          Logger.debug('Canvas position change detected');
          currentLeft = canvasDisplayNode.element.style.left;
          currentTop = canvasDisplayNode.element.style.top;
        }
      };

      // Check position changes frequently
      const monitor = setInterval(checkPositionChange, 50);
      setTimeout(() => clearInterval(monitor), 5000); // Monitor for 5 seconds
    }
  }

  // Update connections after layout
  setTimeout(() => {
    updateConnections();
    fitGraphToView();
  }, 600); // Wait for animation to complete
}

/**
 * Show visual feedback when auto-layout is triggered
 */
function showAutoLayoutFeedback() {
  const btn = document.getElementById('auto-layout-btn');
  if (!btn) return;

  // Add a brief pulse animation
  btn.style.transform = 'scale(1.1)';
  btn.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.5)';

  setTimeout(() => {
    btn.style.transform = '';
    btn.style.boxShadow = '';
  }, 200);
}

/**
 * Animate a node to a new position
 */
function animateNodeToPosition(node, targetX, targetY, duration = 500) {
  if (!node.element) return;

  const startX = node.x;
  const startY = node.y;
  const startTime = Date.now();

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Smooth easing function
    const easeProgress = 1 - Math.pow(1 - progress, 3);

    const currentX = startX + (targetX - startX) * easeProgress;
    const currentY = startY + (targetY - startY) * easeProgress;

    // Update node position
    node.x = currentX;
    node.y = currentY;
    node.element.style.left = currentX + 'px';
    node.element.style.top = currentY + 'px';

    // Update connections during animation
    updateConnections();

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}

/**
 * Create a new node
 */
function createNode(type, x = 100, y = 100) {
  const node = new SynthNode(type, x, y);
  nodes.push(node);

  // Setup WebGL resources
  if (node.type === 'Camera') {
    setupCameraNode(node);
  } else if (node.type === 'VideoFileInput') {
    setupVideoFileNode(node);
  } else {
    allocateNodeFBO(node);
  }

  // Create visual representation
  createNodeElement(node);
  updateConnections();
  updateMainOutputDropdown();
  updateExistingControlInputs(); // Update control input manager
  
  // Check if this node needs permissions
  if (type === 'AudioInput' || type === 'Camera') {
    updatePermissionUI();
  }
  
  // Update gamepad status for controller nodes
  if (type === 'GameControllerInput') {
    updateGamepadStatus();
  }

  // Don't auto-layout on every node addition - it causes constant repositioning
  // Auto-layout should only happen on initial load or manual trigger

  // Save state for undo
  saveState(`Add ${type} Node`);

  return node;
}

/**
 * Delete a node and clean up connections
 */
function deleteNode(node) {
  Logger.debug(`Deleting node: ${node.name} (${node.id})`);

  // Prevent double deletion
  if (node.deleted) {
    Logger.warn(`Node ${node.name} already deleted - skipping`);
    return;
  }
  node.deleted = true;

  // SIMPLIFIED: Go back to basic cleanup - the tracking system was problematic
  // cleanupNodeResources(node.id);

  // Remove from nodes array
  const index = nodes.indexOf(node);
  if (index !== -1) {
    nodes.splice(index, 1);
  }
  
  // Update permissions UI if we deleted a node that needed permissions
  if (node.type === 'AudioInput' || node.type === 'Camera') {
    updatePermissionUI();
  }

  // Remove connections to this node from other nodes
  nodes.forEach(otherNode => {
    // Remove regular input connections
    otherNode.inputs.forEach((inputNode, inputIndex) => {
      if (inputNode === node) {
        otherNode.inputs[inputIndex] = null;
      }
    });

    // Remove control input connections
    if (otherNode.controlInputs) {
      otherNode.controlInputs.forEach((controlNode, controlIndex) => {
        if (controlNode === node) {
          otherNode.controlInputs[controlIndex] = null;
        }
      });
    }
  });

  // Remove from group if in one
  if (node.groupName && groups[node.groupName]) {
    const group = groups[node.groupName];
    const groupIndex = group.nodes.indexOf(node);
    if (groupIndex !== -1) {
      group.nodes.splice(groupIndex, 1);
    }
    // If group is now empty, remove it
    if (group.nodes.length === 0) {
      delete groups[node.groupName];
      updateGroupsList();
    }
  }

  // Clean up WebGL resources (back to simple, reliable approach)
  if (node.fbo && gl && !webglContextLost) {
    try {
      if (gl.isFramebuffer(node.fbo)) {
        gl.deleteFramebuffer(node.fbo);
      }
    } catch (e) {
      Logger.warn('Error deleting framebuffer:', e);
    }
  }
  if (node.texture && gl && !webglContextLost) {
    try {
      if (gl.isTexture(node.texture)) {
        gl.deleteTexture(node.texture);
      }
    } catch (e) {
      Logger.warn('Error deleting texture:', e);
    }
  }

  // Stop video stream if it's a video node
  if (node.video && node.video.srcObject) {
    node.video.srcObject.getTracks().forEach(track => track.stop());
  }

  // Clean up any intervals or timers associated with this node
  if (node.intervalId) {
    clearInterval(node.intervalId);
  }

  // Remove visual element and its event listeners
  if (node.element) {
    // Remove all event listeners on the element
    const newElement = node.element.cloneNode(true);
    node.element.parentNode.replaceChild(newElement, node.element);
    newElement.remove();
  }

  // Update main output if this was the selected output
  if (mainOutputNode === node) {
    // Set to the first available node, or null if no nodes left
    const newMainOutput = nodes.length > 0 ? nodes[0] : null;
    setMainOutput(newMainOutput);
    Logger.info('Main output auto-updated after node deletion:', newMainOutput?.name || 'None');
  }

  // Clear selection if this was the selected node
  if (selectedNode === node) {
    selectedNode = null;
    showNodeProperties(null);
    updateCopyPasteButtons();
  }

  // Clear any references to the node
  node.inputs = null;
  node.controlInputs = null;
  node.element = null;
  node.texture = null;
  node.fbo = null;
  node.video = null;

  Logger.info(`Node ${node.name} successfully deleted and cleaned up`);

  // Update UI
  updateConnections();
  updateMainOutputDropdown();
  updateExistingControlInputs(); // Update control input manager

  // Don't auto-layout on deletion - causes constant repositioning

  // Save state for undo
  saveState(`Delete ${node.type} Node`);
}

function allocateNodeFBO(node) {
  Logger.debug('PHASE 2: Testing FBO allocation for node:', node.name);

  return safeWebGLOperation(() => {
    const width = canvas.width;
    const height = canvas.height;

    // Create texture
    node.texture = gl.createTexture();
    if (!node.texture) {
      Logger.error(`Failed to create texture for ${node.name}`);
      return false;
    }

    gl.bindTexture(gl.TEXTURE_2D, node.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    setTextureParams();

    // Create framebuffer
    node.fbo = gl.createFramebuffer();
    if (!node.fbo) {
      Logger.error(`Failed to create framebuffer for ${node.name}`);
      if (gl.isTexture(node.texture)) gl.deleteTexture(node.texture);
      node.texture = null;
      return false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, node.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, node.texture, 0);

    // Check framebuffer completeness
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      Logger.error(`Framebuffer incomplete for ${node.name}:`, status);
      if (gl.isTexture(node.texture)) gl.deleteTexture(node.texture);
      if (gl.isFramebuffer(node.fbo)) gl.deleteFramebuffer(node.fbo);
      node.texture = null;
      node.fbo = null;
      return false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Assign shader program
    let programKey = node.type.toLowerCase();
    
    // Special cases for compound names
    if (node.type === 'RadialGradient') programKey = 'radialgradient';
    if (node.type === 'FlowField') programKey = 'flowfield';
    if (node.type === 'VideoFileInput') programKey = 'videofileinput';
    if (node.type === 'Camera') programKey = 'camera';
    if (node.type === 'CameraInput') programKey = 'camerainput';
    if (node.type === 'NoiseDisplace') programKey = 'noisedisplace';
    if (node.type === 'PolarWarp') programKey = 'polarwarp';
    if (node.type === 'RGBSplit') programKey = 'rgbsplit';
    if (node.type === 'FeedbackTrail') programKey = 'feedbacktrail';
    
    if (programs[programKey]) {
      node.program = programs[programKey];
      Logger.debug(`Assigned program '${programKey}' to node ${node.name} (${node.type})`);
    } else {
      Logger.warn(`No shader program found for node type: ${node.type} (key: ${programKey}), using fallback`);
      // Use copy shader as fallback for input nodes
      if (node.category === 'input' && programs.copy) {
        node.program = programs.copy;
        Logger.info(`Using copy shader as fallback for ${node.type}`);
      } else {
        Logger.error('No shader program and no fallback available for node type:', node.type);
        return false;
      }
    }

    Logger.info(`Successfully allocated FBO for ${node.name}`);
    return true;
  }, `FBO allocation for node ${node.name}`, false);
}

function setTextureParams() {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function setupCameraNode(node) {
  // Allocate FBO like other nodes - this creates node.texture for output
  const fboResult = allocateNodeFBO(node);
  if (!fboResult) {
    Logger.error(`Failed to allocate FBO for Camera node ${node.name}`);
    return false;
  }
  
  // Create a SEPARATE texture for video upload
  node.videoTexture = gl.createTexture();
  if (!node.videoTexture) {
    Logger.error(`Failed to create video texture for Camera node ${node.name}`);
    return false;
  }
  
  // Initialize video texture with dummy data
  gl.bindTexture(gl.TEXTURE_2D, node.videoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
                new Uint8Array([0, 0, 0, 255])); // Black pixel
  setTextureParams();
  gl.bindTexture(gl.TEXTURE_2D, null);
  
  Logger.debug(`Camera ${node.name}: Created separate video texture and output texture`);
  
  // Create video element
  node.video = document.createElement('video');
  node.video.autoplay = true;
  node.video.playsInline = true;
  node.video.muted = true;
  
  // Mark node as not ready until video is initialized
  node.videoReady = false;
  
  // Set up video ready handler
  node.video.addEventListener('loadedmetadata', () => {
    Logger.debug(`Camera node ${node.name}: Video metadata loaded`);
    node.videoReady = true;
  });
  
  // Setup webcam when permission is granted
  if (cameraEnabled) {
    enableWebcamForNode(node);
  }
  
  return true;
}

function setupVideoFileNode(node) {
  // Allocate FBO like other nodes
  allocateNodeFBO(node);
  
  // Create a SEPARATE texture for video upload (like Camera node)
  node.videoTexture = gl.createTexture();
  if (!node.videoTexture) {
    Logger.error(`Failed to create video texture for VideoFileInput node ${node.name}`);
    return false;
  }
  
  // Initialize video texture with dummy data
  gl.bindTexture(gl.TEXTURE_2D, node.videoTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, 
                new Uint8Array([0, 0, 0, 255])); // Black pixel
  setTextureParams();
  gl.bindTexture(gl.TEXTURE_2D, null);
  
  Logger.debug(`VideoFileInput ${node.name}: Created separate video texture and output texture`);
  
  // Create video element
  node.video = document.createElement('video');
  node.video.autoplay = true;
  node.video.loop = node.params.loop || true;
  node.video.playbackRate = node.params.playbackRate || 1.0;
  node.video.muted = true;
  
  return true;
}

function initCameraNode(node) {
  setupCameraNode(node);
}

function initVideoFileNode(node) {
  setupVideoFileNode(node);
}

/**
 * Create visual node element in the graph
 */
function createNodeElement(node) {
  const container = document.getElementById('nodes-container');
  const nodeEl = document.createElement('div');
  nodeEl.className = `graph-node ${node.category}`;
  nodeEl.style.left = node.x + 'px';
  nodeEl.style.top = node.y + 'px';
  nodeEl.dataset.nodeId = node.id;

  // Create node structure with compact port alignment
  const inputPorts = node.inputs.map((_, i) => `
    <div class="node-port">
      <div class="port input" data-input="${i}"></div>
      <span>In ${i + 1}</span>
    </div>
  `).join('');

  // Control input ports for effect nodes - always expanded
  const controlPorts = node.controlInputs && node.controlInputs.length > 0 ? `
    <div class="control-ports-section">
      <div class="control-ports-header">
        <span class="control-ports-title">Controls</span>
      </div>
      <div class="control-ports-list">
        ${node.controlInputs.map((_, i) => {
          const paramNames = Object.keys(node.params);
          const paramName = paramNames[i] || `Ctrl ${i + 1}`;
          return `
            <div class="node-port control-port">
              <div class="port control-input" data-control="${i}"></div>
              <span class="control-label">${paramName}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  ` : '';

  const outputPort = (node.category === 'system') ? '' : `
    <div class="node-port" style="justify-content: flex-end;">
      <span>Out</span>
      <div class="port output" data-output="0"></div>
    </div>
  `;

  // Show permission button for nodes that need it
  let permissionButton = '';
  if (node.type === 'AudioInput' && !audioEnabled && !permissions.audio.denied) {
    permissionButton = `
      <button class="node-permission-btn" onclick="window.requestAudioPermission()" title="Enable microphone access">
        <span class="material-icons">mic</span>
        Enable Audio
      </button>
    `;
  } else if (node.type === 'Camera' && !node.stream && !permissions.camera.denied) {
    permissionButton = `
      <button class="node-permission-btn" onclick="window.enableCameraForNode(${node.id})" title="Enable camera access">
        <span class="material-icons">videocam</span>
        Enable Camera
      </button>
    `;
  }

  // Add controller status indicator for GameControllerInput nodes
  let statusIndicator = '';
  if (node.type === 'GameControllerInput') {
    const controllerCount = Object.keys(gamepadState.controllers).length;
    statusIndicator = `
      <span class="controller-status" title="${controllerCount > 0 ? controllerCount + ' controller(s) connected' : 'No controllers connected'}">
        ${controllerCount > 0 ? '🎮' : '⚠️'}
      </span>
    `;
  }

  nodeEl.innerHTML = `
    <div class="node-header">
      <span class="material-icons node-icon">${node.icon}</span>
      <span class="node-title">${node.name}</span>
      ${statusIndicator}
      <div class="node-enabled ${node.enabled ? 'checked' : ''}">
        ${node.enabled ? '<span class="material-icons">check</span>' : ''}
      </div>
      ${node.category === 'system' ? '' : '<button class="node-delete">×</button>'}
    </div>
    <div class="node-body">
      <div class="node-ports">
        ${inputPorts}
        ${controlPorts}
        ${outputPort}
      </div>
    </div>
    ${permissionButton}
  `;
  
  // Add CSS for permission button and node styles if not already present
  if (!document.getElementById('node-permission-styles')) {
    const style = document.createElement('style');
    style.id = 'node-permission-styles';
    style.textContent = `
      .node-permission-btn {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%) translateY(4px);
        background: #f59e0b;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        z-index: 10;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }
      
      .node-permission-btn:hover {
        background: #dc9a05;
        transform: translateX(-50%) translateY(4px) scale(1.05);
      }
      
      .node-permission-btn .material-icons {
        font-size: 14px;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add node layout styles if not already present
  if (!document.getElementById('node-layout-styles')) {
    const style = document.createElement('style');
    style.id = 'node-layout-styles';
    style.textContent = `
      .graph-node {
        position: absolute;
        background: #2a2a2a;
        border: 1px solid #444;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        min-width: 160px;
        font-size: 12px;
        user-select: none;
        transition: box-shadow 0.2s ease;
      }
      
      .graph-node:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
      }
      
      .graph-node.selected {
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
      }
      
      .node-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: #1a1a1a;
        border-radius: 8px 8px 0 0;
        border-bottom: 1px solid #333;
      }
      
      .node-icon {
        font-size: 18px;
        color: #888;
      }
      
      .node-title {
        flex: 1;
        font-weight: 500;
        color: #fff;
      }
      
      .node-enabled {
        width: 16px;
        height: 16px;
        background: #333;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .node-enabled.checked {
        background: #10b981;
      }
      
      .node-delete {
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s ease;
      }
      
      .node-delete:hover {
        color: #ef4444;
      }
      
      .node-body {
        padding: 6px;
      }
      
      .node-ports {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      /* === Ports & labels ========================================= */
      .node-port {
        display: flex;
        align-items: center;
        gap: 4px;            /* <<  tighten label-to-circle distance */
        padding: 2px 6px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .port {
        width: 14px;          /* larger hit area                     */
        height: 14px;
        background: #555;
        border: 2px solid #333;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.2s ease;
        flex-shrink: 0;
      }
      
      /* Nice micro-interaction */
      .port:hover {
        background: #888;
        box-shadow: 0 0 6px rgba(99,102,241,.4);
      }
      
      /* Keep inputs left, outputs right via flex order instead of margins */
      .port.input  { order: 0; }
      .port.output { order: 1; }
      
      /* Label text gets the opposite order so it sits beside the circle */
      .node-port span { order: 2; }
      
      .port.connected {
        background: #3b82f6;
        border-color: #2563eb;
      }
      
      .control-ports-section {
        margin-top: 6px;
        border-top: 1px solid #333;
        padding-top: 6px;
      }
      
      .control-ports-header {
        padding: 4px 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .control-ports-title {
        font-size: 11px;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .control-ports-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      
      .control-port {
        padding: 2px 6px;
      }
      
      .control-port .port {
        width: 10px;
        height: 10px;
        background: #f59e0b;
        border-color: #dc9a05;
      }
      
      .control-port .port:hover {
        background: #dc9a05;
        border-color: #b87c04;
      }
      
      .control-port .port.connected {
        background: #f59e0b;
        border-color: #dc9a05;
      }
      
      .control-label {
        font-size: 10px;
        color: #aaa;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100px;
      }
      
      /* Node categories */
      .graph-node.source .node-icon {
        color: #10b981;
      }
      
      .graph-node.effect .node-icon {
        color: #3b82f6;
      }
      
      .graph-node.compositing .node-icon {
        color: #8b5cf6;
      }
      
      .graph-node.input .node-icon {
        color: #f59e0b;
      }
      
      .graph-node.system .node-icon {
        color: #ef4444;
      }
      
      .graph-node.system .node-header {
        background: #1f1414;
      }
      
      /* Disabled state */
      .graph-node.disabled {
        opacity: 0.6;
      }
      
      .graph-node.disabled .node-header {
        background: #1a1a1a;
      }
      
      /* Controller status indicator */
      .controller-status {
        margin-left: auto;
        margin-right: 8px;
        font-size: 16px;
      }
      
      /* Controller visualization styles */
      .controller-visualization {
        background: #1a1a1a;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 12px;
        margin-top: 8px;
        overflow: visible;
        min-height: 260px;
      }
      
      .controller-viz-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
      }
      
      .controller-main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        width: 100%;
        max-width: 400px;
      }
      
      /* D-Pad */
      .controller-dpad {
        position: relative;
        width: 90px;
        height: 90px;
      }
      
      .dpad-button {
        position: absolute;
        width: 24px;
        height: 24px;
        background: #333;
        border: 1px solid #555;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #888;
        cursor: pointer;
        transition: all 0.1s ease;
      }
      
      .dpad-button.pressed {
        background: #3b82f6;
        color: white;
        transform: scale(0.95);
      }
      
      .dpad-up { top: 0; left: 33px; }
      .dpad-down { bottom: 0; left: 33px; }
      .dpad-left { left: 0; top: 33px; }
      .dpad-right { left: 66px; top: 33px; }
      .controller-dpad .dpad-button:hover {
        background: #444;
      }
      
      /* Analog sticks */
      .controller-sticks {
        display: flex;
        gap: 15px;
      }
      
      .stick-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      
      .stick-base {
        width: 50px;
        height: 50px;
        background: #2a2a2a;
        border: 2px solid #444;
        border-radius: 50%;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .stick-position {
        width: 20px;
        height: 20px;
        background: #555;
        border-radius: 50%;
        position: absolute;
        transition: background 0.1s ease;
      }
      
      .stick-position.active {
        background: #f59e0b;
      }
      
      .stick-label {
        font-size: 10px;
        color: #666;
      }
      
      /* Face buttons */
      .controller-face-buttons {
        position: relative;
        width: 90px;
        height: 90px;
      }
      
      .face-button {
        position: absolute;
        width: 24px;
        height: 24px;
        background: #333;
        border: 1px solid #555;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: #888;
        cursor: pointer;
        transition: all 0.1s ease;
      }
      
      .face-button.pressed {
        background: #10b981;
        color: white;
        transform: scale(0.95);
      }
      
      .button-y { top: 0; left: 33px; }
      .button-a { bottom: 0; left: 33px; }
      .button-x { left: 0; top: 33px; }
      .button-b { left: 66px; top: 33px; }
      
      /* Shoulders and triggers */
      .controller-shoulders {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        width: 100%;
        justify-content: center;
      }
      
      .shoulder-button, .trigger {
        padding: 4px 12px;
        background: #333;
        border: 1px solid #555;
        border-radius: 4px;
        font-size: 10px;
        color: #888;
        transition: all 0.1s ease;
      }
      
      .shoulder-button.pressed, .trigger.pressed {
        background: #8b5cf6;
        color: white;
      }
      
      .trigger {
        min-width: 30px;
      }
      
      /* Center buttons */
      .controller-center-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
      }
      
      .center-button {
        padding: 4px 10px;
        background: #333;
        border: 1px solid #555;
        border-radius: 4px;
        font-size: 9px;
        color: #888;
        transition: all 0.1s ease;
      }
      
      .center-button.pressed {
        background: #666;
        color: white;
      }
      
      /* Selected input highlight */
      .selected-input {
        box-shadow: 0 0 0 2px #f59e0b;
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(nodeEl);
  node.element = nodeEl;

  // Add event listeners
  nodeEl.addEventListener('click', (e) => {
    Logger.debug('Node clicked:', node.name);
    e.stopPropagation();
    selectNode(node);
  });

  const enableToggle = nodeEl.querySelector('.node-enabled');
  enableToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    node.enabled = !node.enabled;
    enableToggle.classList.toggle('checked', node.enabled);
    nodeEl.classList.toggle('disabled', !node.enabled);
    
    // Update the checkbox icon
    if (node.enabled) {
      enableToggle.innerHTML = '<span class="material-icons">check</span>';
    } else {
      enableToggle.innerHTML = '';
    }
  });

  const deleteBtn = nodeEl.querySelector('.node-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNode(node);
    });
  }

  // No toggle functionality - control ports are always visible

  // Update node width based on actual DOM element
  setTimeout(() => {
    if (node.element) {
      node.width = node.element.offsetWidth;
    }
  }, 0);

  // Port interaction will be handled in setupGraphInteraction
}

/**
 * Update graph transform (pan and zoom)
 */
function updateGraphTransform() {
  const container = document.getElementById('nodes-container');
  const svg = document.getElementById('connections-svg');

  const transform = `translate(${graphTransform.x}px, ${graphTransform.y}px) scale(${graphTransform.scale})`;
  container.style.transform = transform;

  // DON'T transform the SVG - it should remain in screen coordinates
  // The connections will be calculated in screen space
  svg.style.transform = '';

  // Update window reference for port calculations
  window.graphTransform = { ...graphTransform };

  // Redraw connections with accurate port positions
  updateConnections();

  // Update mini-map if it exists
  updateMiniMap();
}

/**
 * Update mini-map display
 */
function updateMiniMap() {
  const miniMapContent = document.getElementById('mini-map-content');
  const viewport = document.getElementById('mini-map-viewport');

  if (!miniMapContent || !viewport) return;

  // Clear existing mini-map nodes
  const existingNodes = miniMapContent.querySelectorAll('.mini-node');
  existingNodes.forEach(node => node.remove());

  // Calculate mini-map scale
  const mapWidth = 200;
  const mapHeight = 118; // 150 - 32px header
  const graphBounds = calculateGraphBounds();
  const scaleX = mapWidth / Math.max(graphBounds.width, 800);
  const scaleY = mapHeight / Math.max(graphBounds.height, 600);
  const scale = Math.min(scaleX, scaleY) * 0.8; // Leave some padding

  // Add mini-map nodes
  nodes.forEach(node => {
    const miniNode = document.createElement('div');
    miniNode.className = 'mini-node';
    miniNode.style.cssText = `
      position: absolute;
      width: ${Math.max(3, 8 * scale)}px;
      height: ${Math.max(3, 6 * scale)}px;
      background: ${node.category === 'input' ? '#8b5cf6' :
                   node.category === 'system' ? '#ef4444' : '#6366f1'};
      left: ${(node.x - graphBounds.minX) * scale + 10}px;
      top: ${(node.y - graphBounds.minY) * scale + 10}px;
      border-radius: 2px;
      opacity: 0.8;
    `;
    miniMapContent.appendChild(miniNode);
  });

  // Update viewport indicator
  const centerArea = document.getElementById('center-area');
  const centerWidth = centerArea.clientWidth;
  const centerHeight = centerArea.clientHeight;

  // Calculate visible area in graph coordinates
  const viewWidth = centerWidth / graphTransform.scale;
  const viewHeight = centerHeight / graphTransform.scale;
  const viewX = -graphTransform.x / graphTransform.scale;
  const viewY = -graphTransform.y / graphTransform.scale;

  viewport.style.left = `${(viewX - graphBounds.minX) * scale + 10}px`;
  viewport.style.top = `${(viewY - graphBounds.minY) * scale + 10}px`;
  viewport.style.width = `${viewWidth * scale}px`;
  viewport.style.height = `${viewHeight * scale}px`;
}

/**
 * Calculate bounding box of all nodes
 */
function calculateGraphBounds() {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600, width: 800, height: 600 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  nodes.forEach(node => {
    minX = Math.min(minX, node.x);
    minY = Math.min(minY, node.y);
    maxX = Math.max(maxX, node.x + 120); // Approximate node width
    maxY = Math.max(maxY, node.y + 80);  // Approximate node height
  });

  return {
    minX: minX - 50,
    minY: minY - 50,
    maxX: maxX + 50,
    maxY: maxY + 50,
    width: maxX - minX + 100,
    height: maxY - minY + 100
  };
}

/**
 * Validate and fix data model consistency
 */
function validateDataModelConsistency() {
  Logger.debug('Validating data model consistency...');

  // Skip dropdown validation since Canvas logic is different
  // The dropdown now controls what feeds Canvas, not what Canvas is

  // Check Final Output Node exists and is properly configured
  const finalOutputNode = nodes.find(n => n.type === 'FinalOutput');
  if (!finalOutputNode) {
    Logger.warn('Final Output Node missing! Creating...');
    createFinalOutputNode();
    return; // Re-validate after creation
  }

  // Ensure Final Output Node has proper shader program
  if (!finalOutputNode.program) {
    Logger.warn('Final Output Node missing shader program! Fixing...');
    finalOutputNode.program = programs.finaloutput || programs.copy;
  }

  // Check if Final Output Node has valid input connections
  if (finalOutputNode.inputs[0] === null) {
    Logger.info('Final Output Node has no input connection');
  } else if (finalOutputNode.inputs[0] && !finalOutputNode.inputs[0].texture) {
    Logger.warn('Final Output Node input missing texture!', finalOutputNode.inputs[0]);
  }

  // Validate node input connections
  nodes.forEach(node => {
    node.inputs.forEach((input, index) => {
      if (input && !nodes.find(n => n === input)) {
        Logger.warn(`Invalid input connection found in ${node.name} input ${index}`);
        node.inputs[index] = null;
      }
    });
  });

  Logger.info('Data model validation complete');
}

/**
 * Reset graph zoom to 100% and center position
 */
function resetGraphZoom() {
  graphTransform.scale = 1;
  graphTransform.x = 0;
  graphTransform.y = 0;

  // Apply transform to nodes container
  const nodesContainer = document.getElementById('nodes-container');
  const svg = document.getElementById('connections-svg');
  if (nodesContainer) {
    const transform = `translate(${graphTransform.x}px, ${graphTransform.y}px) scale(${graphTransform.scale})`;
    nodesContainer.style.transform = transform;
    if (svg) svg.style.transform = transform;
  }

  // Update window reference for port calculations
  window.graphTransform = { ...graphTransform };

  // Update mini-map
  updateMiniMap();
}

/**
 * Update existing node element (refresh icon and title)
 */
function updateNodeElement(node) {
  if (!node.element) return;

  const iconElement = node.element.querySelector('.node-icon');
  const titleElement = node.element.querySelector('.node-title');

  if (iconElement) {
    iconElement.textContent = node.icon || 'help';
  }
  if (titleElement) {
    titleElement.textContent = node.name;
  }
}

/**
 * Setup graph interaction (dragging, connecting)
 */
function setupGraphInteraction() {
  const container = document.getElementById('nodes-container');
  const svg = document.getElementById('connections-svg');
  const nodeGraph = document.getElementById('node-graph');

  let isDragging = false;
  let isConnecting = false;

  // Apply initial transform
  updateGraphTransform();

  container.addEventListener('mousedown', (e) => {
    const nodeEl = e.target.closest('.graph-node');
    const port = e.target.closest('.port');

    if (port) {
      // Start connection
      isConnecting = true;
      connectionStart = {
        node: getNodeFromElement(nodeEl),
        port: port,
        isOutput: port.classList.contains('output'),
        inputIndex: port.dataset.input ? parseInt(port.dataset.input) : null,
        controlIndex: port.dataset.control ? parseInt(port.dataset.control) : null
      };
      e.preventDefault();
    } else if (nodeEl) {
      // Start node drag
      isDragging = true;
      draggedNode = getNodeFromElement(nodeEl);

      // Calculate drag offset in the transformed coordinate space
      const nodeGraphRect = document.getElementById('node-graph').getBoundingClientRect();
      const mouseX = (e.clientX - nodeGraphRect.left - graphTransform.x) / graphTransform.scale;
      const mouseY = (e.clientY - nodeGraphRect.top - graphTransform.y) / graphTransform.scale;

      dragOffset.x = mouseX - draggedNode.x;
      dragOffset.y = mouseY - draggedNode.y;
      e.preventDefault();
    }
  });

  // Pan with middle mouse or two-finger scroll
  nodeGraph.addEventListener('mousedown', (e) => {
    if (e.button === 1) { // Middle mouse button
      isPanning = true;
      panStart.x = e.clientX - graphTransform.x;
      panStart.y = e.clientY - graphTransform.y;
      e.preventDefault();
    }
  });

  // Wheel events for panning and zooming
  nodeGraph.addEventListener('wheel', (e) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom with Ctrl+scroll or pinch
      const rect = nodeGraph.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Make zoom 5x less sensitive (20% of original sensitivity)
      const scaleFactor = e.deltaY > 0 ? 0.98 : 1.02;
      const newScale = Math.max(0.1, Math.min(3, graphTransform.scale * scaleFactor));

      // Zoom towards mouse position
      const scaleRatio = newScale / graphTransform.scale;
      graphTransform.x = mouseX - (mouseX - graphTransform.x) * scaleRatio;
      graphTransform.y = mouseY - (mouseY - graphTransform.y) * scaleRatio;
      graphTransform.scale = newScale;
    } else {
      // Pan with scroll
      graphTransform.x -= e.deltaX;
      graphTransform.y -= e.deltaY;
    }

    updateGraphTransform();
  });

  document.addEventListener('mousemove', (e) => {
    if (isPanning) {
      // Pan the graph
      graphTransform.x = e.clientX - panStart.x;
      graphTransform.y = e.clientY - panStart.y;
      updateGraphTransform();
    } else if (isDragging && draggedNode) {
      // Disable auto-layout when user drags a node
      if (autoLayoutEnabled) {
        autoLayoutEnabled = false;
        const btn = document.getElementById('auto-layout-btn');
        btn.classList.remove('active');
        btn.title = 'Auto Layout (Off)';
        Logger.info('Auto-layout disabled due to manual node dragging');
      }
      
      // Calculate position in the transformed coordinate space
      const nodeGraphRect = document.getElementById('node-graph').getBoundingClientRect();

      // Convert mouse position to container coordinate space (accounting for transform)
      const mouseX = (e.clientX - nodeGraphRect.left - graphTransform.x) / graphTransform.scale;
      const mouseY = (e.clientY - nodeGraphRect.top - graphTransform.y) / graphTransform.scale;

      const x = mouseX - dragOffset.x;
      const y = mouseY - dragOffset.y;

      // Update node position
      draggedNode.x = Math.max(0, x);
      draggedNode.y = Math.max(0, y);

      draggedNode.element.style.left = draggedNode.x + 'px';
      draggedNode.element.style.top = draggedNode.y + 'px';

      // Update connections with throttling to improve performance during rapid dragging
      if (connectionUpdateTimer) {
        clearTimeout(connectionUpdateTimer);
      }
      connectionUpdateTimer = setTimeout(() => {
        updateConnections();
        connectionUpdateTimer = null;
      }, 16); // ~60fps
    } else if (isConnecting && connectionStart) {
      // Draw temporary connection line
      drawTempConnection(e);
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (isPanning) {
      isPanning = false;
    } else if (isConnecting) {
      const targetElement = e.target.closest('.port');
      const targetNodeEl = e.target.closest('.graph-node');

      if (targetElement && targetNodeEl) {
        const targetNode = getNodeFromElement(targetNodeEl);
        const isTargetOutput = targetElement.classList.contains('output');
        const isTargetControl = targetElement.classList.contains('control-input');
        const targetInputIndex = targetElement.dataset.input ? parseInt(targetElement.dataset.input) : null;
        const targetControlIndex = targetElement.dataset.control ? parseInt(targetElement.dataset.control) : null;

        // Create connection if valid
        if (connectionStart.isOutput && !isTargetOutput && targetInputIndex !== null) {
          // Prevent self-connection
          if (connectionStart.node === targetNode) {
            Logger.warn(`Cannot connect node ${targetNode.name} to itself`);
            return;
          }
          // Output to input connection
          targetNode.inputs[targetInputIndex] = connectionStart.node;
          updateConnections();
          // Auto-layout after connection if enabled
          if (autoLayoutEnabled) {
            setTimeout(() => applyAutoLayout(), 100);
          }
          saveState(`Connect ${connectionStart.node.name} → ${targetNode.name}`);
        } else if (connectionStart.isOutput && isTargetControl && targetControlIndex !== null) {
          // Prevent self-connection
          if (connectionStart.node === targetNode) {
            Logger.warn(`Cannot connect node ${targetNode.name} to itself (control)`);
            return;
          }
          // Output to control input connection
          if (!targetNode.controlInputs) targetNode.controlInputs = [];
          targetNode.controlInputs[targetControlIndex] = connectionStart.node;
          updateConnections();
          // Auto-layout after connection if enabled
          if (autoLayoutEnabled) {
            setTimeout(() => applyAutoLayout(), 100);
          }
          saveState(`Connect ${connectionStart.node.name} → ${targetNode.name} (control)`);
        } else if (!connectionStart.isOutput && isTargetOutput && connectionStart.inputIndex !== null) {
          // Prevent self-connection
          if (connectionStart.node === targetNode) {
            Logger.warn(`Cannot connect node ${connectionStart.node.name} to itself`);
            return;
          }
          // Input to output connection
          connectionStart.node.inputs[connectionStart.inputIndex] = targetNode;
          updateConnections();
          // Auto-layout after connection if enabled
          if (autoLayoutEnabled) {
            setTimeout(() => applyAutoLayout(), 100);
          }
          saveState(`Connect ${targetNode.name} → ${connectionStart.node.name}`);
        }
      }

      // Clear temp connection
      if (tempConnection) {
        tempConnection.remove();
        tempConnection = null;
      }
    }

    isDragging = false;
    isConnecting = false;

    // Clear any pending connection updates and do a final update
    if (connectionUpdateTimer) {
      clearTimeout(connectionUpdateTimer);
      connectionUpdateTimer = null;
    }
    if (draggedNode) {
      updateConnections(); // Final update when dragging ends
      saveState(`Move ${draggedNode.name}`); // Save state for undo
    }

    draggedNode = null;
    connectionStart = null;
  });

  // Add connection dragging for pull-to-disconnect
  setupConnectionDragging();
}

/**
 * Setup connection dragging for pull-to-disconnect functionality
 */
function setupConnectionDragging() {
  const svg = document.getElementById('connections-svg');
  let draggedConnection = null;
  let dragStart = { x: 0, y: 0 };
  const DISCONNECT_THRESHOLD = 40; // pixels to drag before disconnecting

  // Use event delegation for connection paths
  svg.addEventListener('mousedown', (e) => {
    const path = e.target.closest('.connection');
    if (path && path.dataset.outputNodeId) {
      draggedConnection = {
        path: path,
        outputNodeId: parseInt(path.dataset.outputNodeId),
        inputNodeId: parseInt(path.dataset.inputNodeId),
        inputIndex: path.dataset.inputIndex ? parseInt(path.dataset.inputIndex) : null,
        controlIndex: path.dataset.controlIndex ? parseInt(path.dataset.controlIndex) : null,
        connectionType: path.dataset.connectionType
      };

      dragStart.x = e.clientX;
      dragStart.y = e.clientY;

      // Visual feedback - make connection semi-transparent
      path.style.opacity = '0.5';
      path.style.strokeWidth = '3';

      e.preventDefault();
      e.stopPropagation();
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (draggedConnection) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - dragStart.x, 2) +
        Math.pow(e.clientY - dragStart.y, 2)
      );

      // Change visual feedback based on distance
      if (distance > DISCONNECT_THRESHOLD) {
        draggedConnection.path.style.stroke = '#ef4444'; // Red when ready to disconnect
        draggedConnection.path.style.strokeDasharray = '5 5';
      } else {
        draggedConnection.path.style.stroke = ''; // Default color
        draggedConnection.path.style.strokeDasharray = '';
      }
    }
  });

  document.addEventListener('mouseup', (e) => {
    if (draggedConnection) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - dragStart.x, 2) +
        Math.pow(e.clientY - dragStart.y, 2)
      );

      // Disconnect if dragged far enough
      if (distance > DISCONNECT_THRESHOLD) {
        const outputNode = nodes.find(n => n.id === draggedConnection.outputNodeId);
        const inputNode = nodes.find(n => n.id === draggedConnection.inputNodeId);

        if (outputNode && inputNode) {
          if (draggedConnection.connectionType === 'control') {
            // Remove control input connection
            if (inputNode.controlInputs && draggedConnection.controlIndex !== null) {
              inputNode.controlInputs[draggedConnection.controlIndex] = null;
              Logger.info(`Disconnected control input: ${outputNode.name} → ${inputNode.name} (control ${draggedConnection.controlIndex})`);
            }
          } else {
            // Remove main input connection
            if (draggedConnection.inputIndex !== null) {
              inputNode.inputs[draggedConnection.inputIndex] = null;
              Logger.info(`Disconnected: ${outputNode.name} → ${inputNode.name} (input ${draggedConnection.inputIndex})`);
            }
          }

          // Update connections and save state
          updateConnections();
          // Auto-layout after disconnection if enabled
          if (autoLayoutEnabled) {
            setTimeout(() => applyAutoLayout(), 100);
          }
          saveState('Disconnect Connection');
        }
      } else {
        // Reset visual feedback if not disconnected
        draggedConnection.path.style.opacity = '';
        draggedConnection.path.style.strokeWidth = '';
        draggedConnection.path.style.stroke = '';
        draggedConnection.path.style.strokeDasharray = '';
      }

      draggedConnection = null;
    }
  });
}

/**
 * Setup mini-map interaction (viewport dragging)
 */
function setupMiniMapInteraction() {
  const viewport = document.getElementById('mini-map-viewport');
  const miniMapContent = document.getElementById('mini-map-content');

  if (!viewport || !miniMapContent) return;

  let isDraggingViewport = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialTransformX = 0;
  let initialTransformY = 0;

  viewport.addEventListener('mousedown', (e) => {
    isDraggingViewport = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialTransformX = graphTransform.x;
    initialTransformY = graphTransform.y;

    viewport.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDraggingViewport) return;

    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    // Calculate mini-map scale
    const mapWidth = 200;
    const mapHeight = 118;
    const graphBounds = calculateGraphBounds();
    const scaleX = mapWidth / Math.max(graphBounds.width, 800);
    const scaleY = mapHeight / Math.max(graphBounds.height, 600);
    const scale = Math.min(scaleX, scaleY) * 0.8;

    // Convert mini-map delta to graph coordinates
    const graphDeltaX = -deltaX / scale;
    const graphDeltaY = -deltaY / scale;

    // Update graph transform
    graphTransform.x = initialTransformX + graphDeltaX;
    graphTransform.y = initialTransformY + graphDeltaY;

    // Apply transform
    updateGraphTransform();

    e.preventDefault();
  });

  document.addEventListener('mouseup', () => {
    if (isDraggingViewport) {
      isDraggingViewport = false;
      viewport.style.cursor = 'grab';
    }
  });

  // Set initial cursor
  viewport.style.cursor = 'grab';
}

function getNodeFromElement(element) {
  const nodeId = parseInt(element.dataset.nodeId);
  return nodes.find(n => n.id === nodeId);
}

function drawTempConnection(e) {
  const svg = document.getElementById('connections-svg');

  if (tempConnection) {
    tempConnection.remove();
  }

  const startNode = connectionStart.node;
  const svgRect = document.getElementById('connections-svg').getBoundingClientRect();

  let startX, startY;
  if (connectionStart.isOutput) {
    const outputPort = startNode.getOutputPort();
    startX = outputPort.x;
    startY = outputPort.y;
  } else {
    const inputPorts = startNode.getInputPorts();
    const inputPort = inputPorts[connectionStart.inputIndex];
    startX = inputPort.x;
    startY = inputPort.y;
  }

  const endX = e.clientX - svgRect.left;
  const endY = e.clientY - svgRect.top;

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const d = createConnectionPath(startX, startY, endX, endY);
  path.setAttribute('d', d);
  path.setAttribute('class', 'connection');
  path.style.opacity = '0.5';

  svg.appendChild(path);
  tempConnection = path;
}

function createConnectionPath(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const controlOffset = Math.abs(dx) * 0.5;
  const cp1x = x1 + controlOffset;
  const cp2x = x2 - controlOffset;

  return `M ${x1} ${y1} C ${cp1x} ${y1} ${cp2x} ${y2} ${x2} ${y2}`;
}

/**
 * Update all connection visuals
 */
function updateConnections() {
  const svg = document.getElementById('connections-svg');
  svg.innerHTML = ''; // Clear existing connections

  nodes.forEach(node => {
    node.inputs.forEach((inputNode, inputIndex) => {
      if (inputNode) {
        const inputPorts = node.getInputPorts();
        const outputPort = inputNode.getOutputPort();
        const inputPort = inputPorts[inputIndex];

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = createConnectionPath(outputPort.x, outputPort.y, inputPort.x, inputPort.y);
        path.setAttribute('d', d);
        path.setAttribute('class', 'connection');

        // Add connection metadata for drag-to-disconnect
        path.dataset.outputNodeId = inputNode.id;
        path.dataset.inputNodeId = node.id;
        path.dataset.inputIndex = inputIndex;
        path.dataset.connectionType = 'main';

        svg.appendChild(path);
      }
    });

    // Draw control input connections
    if (node.controlInputs) {
      node.controlInputs.forEach((controlNode, controlIndex) => {
        if (controlNode) {
          const outputPort = controlNode.getOutputPort();

          // Get the actual control port element position
          const controlPortElement = node.element?.querySelector(`[data-control="${controlIndex}"]`);
          let controlPort;

          if (controlPortElement) {
            // Control port is visible - use actual port position
            const rect = controlPortElement.getBoundingClientRect();
            const svgRect = document.getElementById('connections-svg').getBoundingClientRect();

            // Use absolute screen coordinates relative to the SVG
            controlPort = {
              x: rect.left + rect.width / 2 - svgRect.left,
              y: rect.top + rect.height / 2 - svgRect.top
            };
          } else {
            // Fallback to estimated position
            const nodeRect = node.element.getBoundingClientRect();
            const svgRect = document.getElementById('connections-svg').getBoundingClientRect();
            controlPort = {
              x: nodeRect.left + 5 - svgRect.left,
              y: nodeRect.top + 48 + node.inputs.length * 24 + 32 + controlIndex * 20 - svgRect.top
            };
          }

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const d = createConnectionPath(outputPort.x, outputPort.y, controlPort.x, controlPort.y);
          path.setAttribute('d', d);
          path.setAttribute('class', 'connection control-connection');

          // Add connection metadata for drag-to-disconnect
          path.dataset.outputNodeId = controlNode.id;
          path.dataset.inputNodeId = node.id;
          path.dataset.controlIndex = controlIndex;
          path.dataset.connectionType = 'control';

          svg.appendChild(path);
        }
      });
    }
  });

  // Update the canvas display whenever connections change
}

/**
 * Select a node and show its properties
 */
function selectNode(node) {
  Logger.debug('selectNode called with:', node ? node.name : 'null');

  // Deselect previous
  if (selectedNode && selectedNode.element) {
    selectedNode.element.classList.remove('selected');
  }

  selectedNode = node;
  if (node && node.element) {
    node.element.classList.add('selected');
    Logger.info('Node selected:', node.name, 'Element:', node.element);
  }

  showNodeProperties(node);
  updateCopyPasteButtons();
}

function showNodeProperties(node) {
  const panel = document.getElementById('properties-panel');

  if (!panel) {
    Logger.error('Properties panel not found!');
    return;
  }

  if (!node) {
    panel.innerHTML = '<div class="properties-empty">Select a node to edit its properties</div>';
    return;
  }

  Logger.debug('Showing properties for node:', node.name, node.type);

  try {
    let html = `<div class="property-group node-header">
      <h4>${node.name}</h4>
      <div class="node-type-badge">${node.type}</div>
    </div>`;

  // Get available source nodes for dropdowns (exclude self and nodes that would create cycles)
  const getAvailableSourceNodes = () => {
    return nodes.filter(n => n !== node && !nodeHasDependency(n, node) && n.category !== 'output');
  };

  // Get control input nodes
  const getControlInputNodes = () => {
    return nodes.filter(n => n.category === 'input');
  };

  // 1. Data Inputs Section (for nodes that accept texture inputs)
  const nodeDefinition = nodeDefinitions[node.type];
  if (nodeDefinition && nodeDefinition.inputs && nodeDefinition.inputs.length > 0) {
    html += `<div class="property-group">
      <h5><span class="section-icon">📥</span> Data Inputs`;

    // Add swap button for nodes with exactly 2 inputs
    if (nodeDefinition.inputs.length === 2 && (node.type === 'Layer' || node.type === 'Mix')) {
      html += ` <button class="swap-inputs-btn" title="Swap inputs" style="float: right; font-size: 18px; background: none; border: none; cursor: pointer; color: #999;">⇄</button>`;
    }

    html += `</h5>`;

    nodeDefinition.inputs.forEach((inputDef, index) => {
      const currentInput = node.inputs[index];
      const inputId = `input-${node.id}-${index}`;

      html += `<div class="connection-field">
        <label class="connection-label" for="${inputId}">${inputDef.name}</label>
        <select class="connection-select" data-input-index="${index}" id="${inputId}">
          <option value="">— None —</option>`;

      getAvailableSourceNodes().forEach(sourceNode => {
        const selected = currentInput === sourceNode ? 'selected' : '';
        html += `<option value="${sourceNode.id}" ${selected}>${sourceNode.name} (${sourceNode.type})</option>`;
      });

      html += `</select>
      </div>`;
    });

    html += `</div>`;
  }

  // 2. Control Inputs Section (for parameter modulation)
  if (node.category !== 'input' && Object.keys(node.params).length > 0) {
    const mappableParams = Object.entries(node.params).filter(([key, value]) => {
      return typeof value === 'number' || key === 'colorPalette';
    });

    if (mappableParams.length > 0) {
      html += `<div class="property-group">
        <h5><span class="section-icon">🎛️</span> Control Inputs</h5>`;

      // Show control inputs for each parameter
      const paramNames = Object.keys(node.params).filter(key => {
        const value = node.params[key];
        return typeof value === 'number' || key === 'colorPalette';
      });

      paramNames.forEach((paramName, paramIndex) => {
        const currentControl = node.controlInputs ? node.controlInputs[paramIndex] : null;
        const controlId = `control-${node.id}-${paramIndex}`;

        html += `<div class="connection-field">
          <label class="connection-label" for="${controlId}">${paramName} control</label>
          <select class="control-select" data-param-index="${paramIndex}" data-param-name="${paramName}" id="${controlId}">
            <option value="">— None —</option>`;

        getControlInputNodes().forEach(controlNode => {
          const selected = currentControl === controlNode ? 'selected' : '';
          const displayName = controlNode.type === 'MIDIInput' ?
            `MIDI CC${controlNode.params.ccNumber}` : controlNode.name;
          html += `<option value="${controlNode.id}" ${selected}>${displayName}</option>`;
        });

        html += `</select>
        </div>`;
      });

      html += `</div>`;
    }
  }

  // 3. Parameters Section
  if (Object.keys(node.params).length > 0) {
    html += `<div class="property-group">
      <h5><span class="section-icon">⚙️</span> Parameters</h5>`;

  // Add special controls and live value displays for input nodes
  if (node.type === 'MIDIInput') {
    const currentValue = node.currentValue || 0;
    html += `<div class="property-field">
      <div class="property-label">Current Output</div>
      <div class="current-value-display">${currentValue.toFixed(3)}</div>
      <div class="help-text">MIDI CC${node.params.ccNumber} value</div>
    </div>`;
  } else if (node.type === 'AudioInput') {
    const currentValue = node.currentValue || 0;
    html += `<div class="property-field">
      <div class="property-label">Current Output</div>
      <div class="current-value-display">${currentValue.toFixed(3)}</div>
      <div class="help-text">Audio ${node.params.band} level</div>
    </div>`;
    html += `<div class="property-field">
      <div class="property-label">Audio Access</div>
      <button id="enable-audio-btn-${node.id}" class="create-btn" style="width: 100%;">
        ${audioEnabled ? 'Audio Input Active' : 'Enable Audio Input'}
      </button>
    </div>`;
  } else if (node.type === 'CursorInput') {
    const currentValue = node.currentValue || 0;
    html += `<div class="property-field">
      <div class="property-label">Current Output</div>
      <div class="current-value-display">${currentValue.toFixed(3)}</div>
      <div class="help-text">Cursor ${node.params.component} value</div>
    </div>`;
  } else if (node.type === 'Camera') {
    html += `<div class="property-field">
      <div class="property-label">Camera Status</div>
      <div class="help-text">${node.stream ? 'Webcam active' : 'No webcam connected'}</div>
    </div>`;
    html += `<div class="property-field">
      <div class="property-label">Camera Access</div>
      <button id="enable-camera-btn-${node.id}" class="create-btn" style="width: 100%;">
        ${node.stream ? 'Camera Active' : 'Enable Camera'}
      </button>
    </div>`;
  } else if (node.type === 'CameraInput') {
    const currentValue = node.currentValue || 0;
    const currentComponent = node.params.component || 'brightness';
    html += `<div class="property-field">
      <div class="property-label">Current Output</div>
      <div class="current-value-display">${currentValue.toFixed(3)}</div>
      <div class="help-text">${cameraComponents[currentComponent]?.name || currentComponent}</div>
    </div>`;
    
    // Component selector
    html += `<div class="property-field">
      <label class="property-label" for="camera-component-${node.id}">Analysis Type</label>
      <select id="camera-component-${node.id}" class="property-input" data-param="component">
        ${Object.entries(cameraComponents).map(([key, comp]) => 
          `<option value="${key}" ${currentComponent === key ? 'selected' : ''}>${comp.name}</option>`
        ).join('')}
      </select>
    </div>`;
    
    html += `<div class="property-field">
      <div class="property-label">Camera Access</div>
      <button id="enable-camera-btn-${node.id}" class="create-btn" style="width: 100%;">
        ${cameraEnabled ? 'Camera Analysis Active' : 'Enable Camera Analysis'}
      </button>
    </div>`;
  } else if (node.type === 'VideoFileInput') {
    html += `<div class="property-field">
      <div class="property-label">Video File</div>
      <input type="file" id="video-file-input-${node.id}" accept="video/*" style="width: 100%;">
      ${node.videoSrc ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">Current: ${node.videoSrc.split('/').pop()}</div>` : ''}
    </div>`;
    if (node.video) {
      html += `<div class="property-field">
        <div class="property-label">Playback Controls</div>
        <div style="display: flex; gap: 10px;">
          <button id="play-btn-${node.id}" class="create-btn" style="flex: 1;">
            ${node.video.paused ? 'Play' : 'Pause'}
          </button>
          <button id="stop-btn-${node.id}" class="create-btn" style="flex: 1;">Stop</button>
        </div>
      </div>`;
    }
  } else if (node.type === 'GameControllerInput') {
    const controllerComponent = node.params.component || 'button0';
    const currentValue = node.currentValue || 0;
    const controllerCount = Object.keys(gamepadState.controllers).length;
    const firstController = Object.values(gamepadState.controllers)[0];
    
    html += `<div class="property-field">
      <div class="property-label">Current Output</div>
      <div class="current-value-display">${currentValue.toFixed(3)}</div>
      <div class="help-text">${controllerComponents[controllerComponent]?.name || controllerComponent}</div>
    </div>`;
    
    html += `<div class="property-field">
      <div class="property-label">Controller Status</div>
      <div class="controller-status-display">
        ${controllerCount > 0 ? 
          `<span style="color: #10b981;">🎮 ${controllerCount} controller(s) connected</span>` : 
          '<span style="color: #f59e0b;">⚠️ No controllers connected - Press any button</span>'}
      </div>
      ${firstController ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">${firstController.id}</div>` : ''}
      <button id="detect-gamepad-btn" class="create-btn" style="margin-top: 8px; width: 100%;">
        <span class="material-icons">gamepad</span>
        Detect Gamepad
      </button>
    </div>`;
    
    // Controller visualization
    html += `<div class="property-field">
      <div class="property-label">Controller Input Monitor</div>
      <div id="controller-viz-${node.id}" class="controller-visualization">
        ${controllerCount > 0 ? createControllerVisualization(firstController, controllerComponent) : 
          '<div style="text-align: center; padding: 20px; color: #666;">Connect a controller and press any button</div>'}
      </div>
    </div>`;
    
    // Component selector with all available inputs
    html += `<div class="property-field">
      <label class="property-label" for="controller-component-${node.id}">Input Source</label>
      <select id="controller-component-${node.id}" class="property-input" data-param="component">
        <optgroup label="Buttons">
          ${GAMEPAD_BUTTONS.map((name, i) => 
            `<option value="button${i}" ${controllerComponent === `button${i}` ? 'selected' : ''}>${name}</option>`
          ).join('')}
        </optgroup>
        <optgroup label="Axes">
          ${GAMEPAD_AXES.map((name, i) => 
            `<option value="axis${i}" ${controllerComponent === `axis${i}` ? 'selected' : ''}>${name}</option>`
          ).join('')}
        </optgroup>
      </select>
    </div>`;
  } else if (node.type === 'RandomInput') {
    // Show the actual output value directly
    const outputValue = node.currentValue || 0;
    const displayValue = outputValue.toFixed(3);
    html += `<div class="property-field">
      <div class="property-label">Current Output</div>
      <div class="current-value-display">${displayValue}</div>
      <div class="help-text">Live random value (updates every ${node.params.interval} seconds)</div>
    </div>`;
  } else if (node.type === 'RangeInput') {
    // Show the actual output value directly
    const outputValue = node.currentValue || 0;
    const displayValue = outputValue.toFixed(3);
    const progress = node.rangeProgress || 0;
    const progressPercent = (progress * 100).toFixed(1);
    html += `<div class="property-field">
      <div class="property-label">Current Output</div>
      <div class="current-value-display">${displayValue}</div>
      <div class="help-text">Progress: ${progressPercent}% • ${node.params.loop ? 'Looping' : 'One-shot'}</div>
    </div>`;
  }

    // Generate property controls based on node type
    Object.entries(node.params).forEach(([key, value]) => {
    // Skip component parameter for GameControllerInput as it's handled above
    if (node.type === 'GameControllerInput' && key === 'component') {
      return;
    }
    
    // Add units to certain parameter labels
    let labelText = key;
    if (key === 'interval' && node.type === 'RandomInput') {
      labelText = 'interval (seconds)';
    } else if (key === 'reverseRange' && node.type === 'AudioInput') {
      labelText = 'Reverse Range';
    }

    const inputId = `param-${node.id}-${key}`;
    html += `<div class="property-field">
      <label class="property-label" for="${inputId}">${labelText}</label>`;

    if (typeof value === 'number') {
      const constraints = getParameterConstraints(key);
      const isSlider = constraints && constraints.type === 'number' &&
                       constraints.min !== undefined && constraints.max !== undefined;
      if (isSlider) {
        const min = getParamMin(key);
        const max = getParamMax(key);
        const step = getParamStep(key);
        html += `<div class="dual-input-container">
          <input type="range" class="property-slider" data-param="${key}" id="${inputId}-slider"
                 value="${value}" min="${min}" max="${max}" step="${step}">
          <input type="number" class="property-number" data-param="${key}" id="${inputId}-number"
                 value="${value}" min="${min}" max="${max}" step="${step}">
        </div>`;
      } else {
        html += `<input type="number" class="property-input" data-param="${key}" id="${inputId}" value="${value}">`;
      }
    } else if (typeof value === 'boolean') {
      html += `<input type="checkbox" class="property-input" data-param="${key}" id="${inputId}" ${value ? 'checked' : ''}>`;
    } else if (typeof value === 'string') {
      const constraints = getParameterConstraints(key);

      if (key === 'color' || (constraints && constraints.type === 'color')) {
        html += `<input type="color" class="property-input" data-param="${key}" id="${inputId}" value="${value}">`;
      } else if (constraints && constraints.values) {
        // Generate dropdown from constraint values
        html += `<select class="property-input" data-param="${key}" id="${inputId}">
          ${constraints.values.map(option => `<option value="${option}" ${option === value ? 'selected' : ''}>${option.charAt(0).toUpperCase() + option.slice(1)}</option>`).join('')}
        </select>`;

        // Add color palette preview for colorPalette
        if (key === 'colorPalette') {
          html += `<div class="color-palette-preview" data-palette="${value}">
            ${colorPalettes[value].map(color => `<div class="color-swatch" style="background-color: ${color}"></div>`).join('')}
          </div>`;
        }
        
        // Add curve preview for RangeInput
        if (node.type === 'RangeInput' && key === 'curve') {
          html += `<canvas class="curve-preview" id="curve-preview-${node.id}" width="120" height="60" style="margin-top: 8px; border: 1px solid #333; border-radius: 4px; display: block;"></canvas>`;
        }
      } else {
        html += `<input type="text" class="property-input" data-param="${key}" id="${inputId}" value="${value}">`;
      }
    }


      html += '</div>';
    });

    html += `</div>`;
  }

  // 4. Visual Preview Section (show input/output previews)
  // Skip visual preview for control input nodes - they don't have visual output
  if (node.category !== 'output' && node.category !== 'input') {
    html += `<div class="property-group">
      <h5><span class="section-icon">👁️</span> Visual Preview</h5>
      <div class="preview-container">`;

    // Input previews
    if (nodeDefinition && nodeDefinition.inputs && nodeDefinition.inputs.length > 0) {
      html += `<div class="preview-inputs">`;
      nodeDefinition.inputs.forEach((inputDef, index) => {
        const hasInput = node.inputs[index] && node.inputs[index].texture;
        html += `<div class="preview-item">
          <div class="preview-label">${inputDef.name}</div>
          <canvas class="preview-canvas ${hasInput ? '' : 'empty'}"
                  data-preview-type="input"
                  data-input-index="${index}"
                  width="80" height="60">
          </canvas>
        </div>`;
      });
      html += `</div>`;
    }

    // Output preview
    html += `<div class="preview-output">
      <div class="preview-item">
        <div class="preview-label">Output</div>
        <canvas class="preview-canvas"
                data-preview-type="output"
                width="120" height="90">
        </canvas>
      </div>
    </div>`;

    html += `</div></div>`;
  }

  // 5. Output Connections Section (show what nodes use this as input)
  const outputConnections = nodes.filter(n => n.inputs.includes(node));
  if (outputConnections.length > 0) {
    html += `<div class="property-group">
      <h5><span class="section-icon">📤</span> Output Connections</h5>
      <div class="output-connections-list">`;

    outputConnections.forEach(targetNode => {
      const inputIndex = targetNode.inputs.indexOf(node);
      const inputDef = nodeDefinitions[targetNode.type]?.inputs?.[inputIndex];
      const inputName = inputDef ? inputDef.name : `Input ${inputIndex + 1}`;

      html += `<div class="output-connection-item">
        <span class="connection-arrow">→</span>
        <span class="connection-target">${targetNode.name}</span>
        <span class="connection-input">(${inputName})</span>
      </div>`;
    });

    html += `</div></div>`;
  }

  panel.innerHTML = html;

  } catch (error) {
    Logger.error('Error in showNodeProperties:', error);
    panel.innerHTML = '<div class="properties-empty">Error loading node properties</div>';
    return;
  }

  // Start rendering previews
  if (node.category !== 'output') {
    requestAnimationFrame(() => updateNodePreviews(node));
  }
  
  // Draw curve preview for RangeInput nodes
  if (node.type === 'RangeInput') {
    const canvas = document.getElementById(`curve-preview-${node.id}`);
    if (canvas) {
      drawCurvePreview(canvas, node.params.curve, node.params.mode);
    }
  }


  // Add event listener for gamepad detection button
  const detectGamepadBtn = panel.querySelector('#detect-gamepad-btn');
  if (detectGamepadBtn) {
    detectGamepadBtn.addEventListener('click', () => {
      detectGamepadBtn.textContent = 'Press any gamepad button...';
      detectGamepadBtn.disabled = true;
      
      // Start intensive polling for gamepad detection
      let detectionAttempts = 0;
      const maxAttempts = 30; // 3 seconds
      const detectionInterval = setInterval(() => {
        const gamepads = navigator.getGamepads();
        let foundGamepad = false;
        
        for (let i = 0; i < gamepads.length; i++) {
          const gamepad = gamepads[i];
          if (gamepad && gamepad.connected) {
            // Check if any button is pressed
            for (let j = 0; j < gamepad.buttons.length; j++) {
              if (gamepad.buttons[j].pressed) {
                foundGamepad = true;
                
                // Add to gamepad state if not already there
                if (!gamepadState.controllers[gamepad.index]) {
                  gamepadState.controllers[gamepad.index] = {
                    index: gamepad.index,
                    id: gamepad.id,
                    timestamp: gamepad.timestamp
                  };
                  Logger.info('Gamepad detected via manual detection:', gamepad.id);
                }
                
                // Update the properties panel to show the detected controller
                showNodeProperties(node);
                break;
              }
            }
            if (foundGamepad) break;
          }
        }
        
        if (foundGamepad || ++detectionAttempts >= maxAttempts) {
          clearInterval(detectionInterval);
          if (!foundGamepad) {
            detectGamepadBtn.innerHTML = '<span class="material-icons">error</span> No gamepad detected';
            setTimeout(() => {
              detectGamepadBtn.innerHTML = '<span class="material-icons">gamepad</span> Detect Gamepad';
              detectGamepadBtn.disabled = false;
            }, 2000);
          }
        }
      }, 100);
    });
  }

  // Add event listeners for property changes
  panel.querySelectorAll('.property-input, .property-slider, .property-number').forEach(input => {
    input.addEventListener('input', (e) => {
      const param = e.target.dataset.param;
      let value = e.target.value;

      if (e.target.type === 'number' || e.target.type === 'range') {
        value = parseFloat(value);

        // Sync between slider and number input for dual controls
        if (e.target.classList.contains('property-slider') || e.target.classList.contains('property-number')) {
          const container = e.target.closest('.dual-input-container');
          if (container) {
            const slider = container.querySelector('.property-slider');
            const numberInput = container.querySelector('.property-number');
            if (e.target === slider) {
              numberInput.value = value;
            } else if (e.target === numberInput) {
              slider.value = value;
            }
          }
        }
      } else if (e.target.type === 'checkbox') {
        value = e.target.checked;
      }

      // Validate parameter value before setting
      const validation = validateParameter(param, value);
      if (!validation.isValid && validation.error) {
        // Show validation error briefly
        const input = e.target;
        input.style.borderColor = '#ef4444';
        input.title = validation.error;
        setTimeout(() => {
          input.style.borderColor = '';
          input.title = '';
        }, 3000);
      }

      // Use validated/corrected value
      node.params[param] = validation.value;

      // Debug logging for Layer blend mode changes
      if (node.type === 'Layer' && (param === 'blendMode' || param === 'opacity')) {
        Logger.info(`Layer ${node.name} ${param} changed to: ${validation.value}`);
      }
      
      // Update curve preview for RangeInput
      if (node.type === 'RangeInput' && (param === 'curve' || param === 'mode')) {
        const canvas = document.getElementById(`curve-preview-${node.id}`);
        if (canvas) {
          const curveType = param === 'curve' ? validation.value : node.params.curve;
          const mode = param === 'mode' ? validation.value : node.params.mode;
          drawCurvePreview(canvas, curveType, mode);
        }
      }

      // Update input to show corrected value if it was changed
      if (validation.value !== value) {
        e.target.value = validation.value;
        // Also update the paired input for dual controls
        if (e.target.classList.contains('property-slider') || e.target.classList.contains('property-number')) {
          const container = e.target.closest('.dual-input-container');
          if (container) {
            const slider = container.querySelector('.property-slider');
            const numberInput = container.querySelector('.property-number');
            slider.value = validation.value;
            numberInput.value = validation.value;
          }
        }
      }

      markUnsaved();

      // Debounced save state for undo
      clearTimeout(parameterChangeTimeout);
      parameterChangeTimeout = setTimeout(() => {
        saveState(`Change ${param}`);
      }, 1000); // Wait 1 second after last change

      // Update color palette preview if it's a colorPalette parameter
      if (param === 'colorPalette') {
        const preview = panel.querySelector('.color-palette-preview');
        if (preview) {
          preview.innerHTML = colorPalettes[value].map(color =>
            `<div class="color-swatch" style="background-color: ${color}"></div>`
          ).join('');
        }
      }
    });
  });

  // Add event listeners for data input connections
  panel.querySelectorAll('.connection-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const inputIndex = parseInt(e.target.dataset.inputIndex);
      const sourceNodeId = e.target.value;

      if (sourceNodeId) {
        const sourceNode = nodes.find(n => n.id === sourceNodeId);
        if (sourceNode) {
          node.inputs[inputIndex] = sourceNode;
          Logger.info(`Connected ${sourceNode.name} to ${node.name} input ${inputIndex}`);
        }
      } else {
        node.inputs[inputIndex] = null;
        Logger.info(`Disconnected input ${inputIndex} from ${node.name}`);
      }

      updateConnections();
      markUnsaved();
      saveState(`Change input connection`);
      
      // Refresh the properties panel to show updated connections
      // This is important for Composite nodes to show their inputs properly
      setTimeout(() => showNodeProperties(node), 10);
    });
  });

  // Add event listener for swap inputs button
  const swapBtn = panel.querySelector('.swap-inputs-btn');
  if (swapBtn) {
    swapBtn.addEventListener('click', (e) => {
      e.preventDefault();

      // Swap the inputs
      const temp = node.inputs[0];
      node.inputs[0] = node.inputs[1];
      node.inputs[1] = temp;

      Logger.info(`Swapped inputs for ${node.name}`);

      // Update the UI to reflect the swap
      showNodeProperties(node);
      updateConnections();
      markUnsaved();
      saveState('Swap inputs');
    });
  }

  // Add event listeners for control input connections
  panel.querySelectorAll('.control-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const paramIndex = parseInt(e.target.dataset.paramIndex);
      const paramName = e.target.dataset.paramName;
      const controlNodeId = e.target.value;

      // Initialize controlInputs array if needed
      if (!node.controlInputs) {
        node.controlInputs = [];
      }

      if (controlNodeId) {
        const controlNode = nodes.find(n => n.id === controlNodeId);
        if (controlNode) {
          node.controlInputs[paramIndex] = controlNode;
          Logger.info(`Connected ${controlNode.name} to ${node.name} ${paramName} control`);
        }
      } else {
        node.controlInputs[paramIndex] = null;
        Logger.info(`Disconnected ${paramName} control from ${node.name}`);
      }

      updateConnections();
      markUnsaved();
      saveState(`Change control connection`);
    });
  });

  // Clear all mappings button
  panel.querySelectorAll('.remove-all-mappings').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const param = e.currentTarget.dataset.param;
      removeAllMappingsForParam(node.id, param);
      updateControlMappingDisplay(node);
      showNodeProperties(node); // Refresh the entire properties panel
    });
  });

  // Individual mapping remove buttons
  panel.querySelectorAll('.remove-mapping').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const type = e.currentTarget.dataset.type;
      const key = e.currentTarget.dataset.key;
      const index = e.currentTarget.dataset.index;

      Logger.debug('Removing mapping:', { type, key, index });

      if (type === 'midi') {
        delete controlInputs.midi[key];
      } else if (type === 'audio') {
        if (controlInputs.audio[key]) {
          controlInputs.audio[key].splice(parseInt(index), 1);
          if (controlInputs.audio[key].length === 0) {
            delete controlInputs.audio[key];
          }
        }
      } else if (type === 'color') {
        if (controlInputs.color[key]) {
          controlInputs.color[key].splice(parseInt(index), 1);
          if (controlInputs.color[key].length === 0) {
            delete controlInputs.color[key];
          }
        }
      } else if (type === 'cursor') {
        if (controlInputs.cursor[key]) {
          controlInputs.cursor[key].splice(parseInt(index), 1);
          if (controlInputs.cursor[key].length === 0) {
            delete controlInputs.cursor[key];
          }
        }
      } else if (type === 'camera') {
        if (controlInputs.camera[key]) {
          controlInputs.camera[key].splice(parseInt(index), 1);
          if (controlInputs.camera[key].length === 0) {
            delete controlInputs.camera[key];
          }
        }
      }

      Logger.info('Mapping removed successfully');
      showNodeProperties(node); // Refresh the entire properties panel
      saveState('Remove Control Mapping');
    });
  });

  // Add audio input button event listener
  const audioBtn = panel.querySelector(`#enable-audio-btn-${node.id}`);
  if (audioBtn) {
    audioBtn.addEventListener('click', async () => {
      if (!audioEnabled) {
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();

          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false
            }
          });

          microphone = audioContext.createMediaStreamSource(stream);
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 4096;
          analyser.smoothingTimeConstant = 0.85;

          microphone.connect(analyser);
          frequencyData = new Uint8Array(analyser.frequencyBinCount);
          audioEnabled = true;

          audioBtn.textContent = 'Audio Input Active';
          audioBtn.disabled = true;
          audioBtn.style.background = '#10b981';

          Logger.info('Audio input enabled via node properties');
        } catch (error) {
          Logger.error('Audio initialization failed:', error);
          audioBtn.textContent = 'Audio Access Denied';
          audioBtn.style.background = '#ef4444';
        }
      }
    });
  }

  // Add camera button event listener
  const cameraBtn = panel.querySelector(`#enable-camera-btn-${node.id}`);
  if (cameraBtn) {
    cameraBtn.addEventListener('click', async () => {
      if (node.type === 'Camera') {
        // For Camera source nodes - just enable webcam
        if (!node.stream) {
          try {
            await enableWebcamForNode(node);
            cameraBtn.textContent = 'Camera Active';
            cameraBtn.disabled = true;
            cameraBtn.style.background = '#10b981';
          } catch (error) {
            cameraBtn.textContent = 'Camera Access Denied';
            cameraBtn.style.background = '#ef4444';
          }
        }
      } else if (node.type === 'CameraInput') {
        // For CameraInput control nodes - enable camera analysis
        if (!cameraEnabled) {
          try {
            await enableCameraInput();
            cameraBtn.textContent = 'Camera Analysis Active';
            cameraBtn.disabled = true;
            cameraBtn.style.background = '#10b981';
          } catch (error) {
            cameraBtn.textContent = 'Camera Access Denied';
            cameraBtn.style.background = '#ef4444';
          }
        }
      }
    });
  }
  
  // Add video file input event listener
  const videoFileInput = panel.querySelector(`#video-file-input-${node.id}`);
  if (videoFileInput) {
    videoFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        node.videoSrc = file.name;
        
        if (node.video) {
          node.video.src = url;
          node.video.load();
          node.video.play();
          
          // Update the display to show current file
          const fileDisplay = panel.querySelector(`#video-file-input-${node.id} + div`);
          if (fileDisplay) {
            fileDisplay.textContent = `Current: ${file.name}`;
          }
          
          markUnsaved();
          saveState('Load video file');
        }
      }
    });
  }
  
  // Add video playback control event listeners
  const playBtn = panel.querySelector(`#play-btn-${node.id}`);
  if (playBtn && node.video) {
    playBtn.addEventListener('click', () => {
      if (node.video.paused) {
        node.video.play();
        playBtn.textContent = 'Pause';
      } else {
        node.video.pause();
        playBtn.textContent = 'Play';
      }
    });
  }
  
  const stopBtn = panel.querySelector(`#stop-btn-${node.id}`);
  if (stopBtn && node.video) {
    stopBtn.addEventListener('click', () => {
      node.video.pause();
      node.video.currentTime = 0;
      const playBtn = panel.querySelector(`#play-btn-${node.id}`);
      if (playBtn) playBtn.textContent = 'Play';
    });
  }
  
  // Add camera component selector event listener
  const cameraComponentSelect = panel.querySelector(`#camera-component-${node.id}`);
  if (cameraComponentSelect) {
    cameraComponentSelect.addEventListener('change', (e) => {
      node.params.component = e.target.value;
      markUnsaved();
      saveState('Change camera analysis type');
      
      // Update help text
      const helpText = panel.querySelector(`#node-properties-${node.id} .help-text`);
      if (helpText && cameraComponents[e.target.value]) {
        helpText.textContent = cameraComponents[e.target.value].name;
      }
    });
  }
  
  // Add game controller component selector event listener
  const controllerComponentSelect = panel.querySelector(`#controller-component-${node.id}`);
  if (controllerComponentSelect) {
    controllerComponentSelect.addEventListener('change', (e) => {
      node.params.component = e.target.value;
      markUnsaved();
      saveState('Change controller input');
      
      // Update help text
      const helpText = panel.querySelector('.help-text');
      if (helpText && controllerComponents[e.target.value]) {
        helpText.textContent = controllerComponents[e.target.value].name;
      }
      
      // Update visualization to highlight new selection
      const firstController = Object.values(gamepadState.controllers)[0];
      if (firstController) {
        updateControllerVisualization(firstController);
      }
    });
  }
}

/**
 * Start MIDI mapping mode for a parameter
 */
function startMIDIMapping(node, param) {
  const originalText = document.getElementById('midi-cc').textContent;
  document.getElementById('midi-cc').textContent = 'Move a MIDI control...';

  const tempHandler = (msg) => {
    const data = msg.data;
    if ((data[0] & 0xF0) === 0xB0) {
      const ccNum = data[1];

      // Create MIDI mapping
      const min = getParamMin(param);
      const max = getParamMax(param);

      controlInputs.midi[ccNum] = {
        nodeId: node.id,
        param: param,
        min: min,
        max: max
      };

      document.getElementById('midi-cc').textContent = `CC${ccNum} → ${param}`;

      // Remove temporary handler
      if (midiIn) {
        midiIn.onmidimessage = handleMIDIMessage;
      }

      updateControlMappingDisplay(node);
    }
  };

  if (midiIn) {
    midiIn.onmidimessage = tempHandler;
  }
}

/**
 * Create audio mapping for a parameter
 */
function createAudioMapping(node, param, audioBand) {
  if (!controlInputs.audio[audioBand]) {
    controlInputs.audio[audioBand] = [];
  }

  const min = getParamMin(param);
  const max = getParamMax(param);

  // Remove any existing mappings for this node/param combination from ALL bands
  Object.keys(controlInputs.audio).forEach(band => {
    controlInputs.audio[band] = controlInputs.audio[band].filter(
      mapping => !(mapping.nodeId === node.id && mapping.param === param)
    );
    // Clean up empty bands
    if (controlInputs.audio[band].length === 0) {
      delete controlInputs.audio[band];
    }
  });

  // Re-initialize the target band if it was deleted
  if (!controlInputs.audio[audioBand]) {
    controlInputs.audio[audioBand] = [];
  }

  // Add new mapping
  controlInputs.audio[audioBand].push({
    nodeId: node.id,
    param: param,
    min: min,
    max: max
  });

  Logger.debug('Created audio mapping:', { audioBand, nodeId: node.id, param, min, max });
  updateControlMappingDisplay(node);
}

/**
 * Remove all mappings for a specific node and parameter
 */
function removeAllMappingsForParam(nodeId, param) {
  // Remove from MIDI
  Object.keys(controlInputs.midi).forEach(ccNum => {
    const mapping = controlInputs.midi[ccNum];
    if (mapping && mapping.nodeId === nodeId && mapping.param === param) {
      delete controlInputs.midi[ccNum];
    }
  });

  // Remove from audio
  Object.keys(controlInputs.audio).forEach(band => {
    controlInputs.audio[band] = controlInputs.audio[band].filter(
      mapping => !(mapping.nodeId === nodeId && mapping.param === param)
    );
    if (controlInputs.audio[band].length === 0) {
      delete controlInputs.audio[band];
    }
  });

  // Remove from color
  Object.keys(controlInputs.color).forEach(component => {
    controlInputs.color[component] = controlInputs.color[component].filter(
      mapping => !(mapping.nodeId === nodeId && mapping.param === param)
    );
    if (controlInputs.color[component].length === 0) {
      delete controlInputs.color[component];
    }
  });

  // Remove from cursor
  Object.keys(controlInputs.cursor).forEach(component => {
    controlInputs.cursor[component] = controlInputs.cursor[component].filter(
      mapping => !(mapping.nodeId === nodeId && mapping.param === param)
    );
    if (controlInputs.cursor[component].length === 0) {
      delete controlInputs.cursor[component];
    }
  });

  // Remove from camera
  Object.keys(controlInputs.camera).forEach(component => {
    controlInputs.camera[component] = controlInputs.camera[component].filter(
      mapping => !(mapping.nodeId === nodeId && mapping.param === param)
    );
    if (controlInputs.camera[component].length === 0) {
      delete controlInputs.camera[component];
    }
  });


  Logger.debug('Removed all mappings for:', { nodeId, param });
}

/**
 * Create color mapping for a parameter
 */
function createColorMapping(node, param, colorComponent) {
  if (!controlInputs.color[colorComponent]) {
    controlInputs.color[colorComponent] = [];
  }

  const min = getParamMin(param);
  const max = getParamMax(param);

  // Remove existing mapping for this node/param combination
  controlInputs.color[colorComponent] = controlInputs.color[colorComponent].filter(
    mapping => !(mapping.nodeId === node.id && mapping.param === param)
  );

  // Add new mapping
  controlInputs.color[colorComponent].push({
    nodeId: node.id,
    param: param,
    min: min,
    max: max
  });

  updateControlMappingDisplay(node);
}

/**
 * Create cursor mapping for a parameter
 */
function createCursorMapping(node, param, cursorComponent) {
  if (!controlInputs.cursor[cursorComponent]) {
    controlInputs.cursor[cursorComponent] = [];
  }

  const min = getParamMin(param);
  const max = getParamMax(param);

  // Remove existing mapping for this node/param combination from ALL cursor components
  Object.keys(controlInputs.cursor).forEach(component => {
    controlInputs.cursor[component] = controlInputs.cursor[component].filter(
      mapping => !(mapping.nodeId === node.id && mapping.param === param)
    );
    if (controlInputs.cursor[component].length === 0) {
      delete controlInputs.cursor[component];
    }
  });

  // Re-initialize the target component if it was deleted
  if (!controlInputs.cursor[cursorComponent]) {
    controlInputs.cursor[cursorComponent] = [];
  }

  // Add new mapping
  controlInputs.cursor[cursorComponent].push({
    nodeId: node.id,
    param: param,
    min: min,
    max: max
  });

  Logger.debug('Created cursor mapping:', { cursorComponent, nodeId: node.id, param, min, max });
  updateControlMappingDisplay(node);
}

/**
 * Create camera mapping for a parameter
 */
function createCameraMapping(node, param, cameraComponent) {
  if (!controlInputs.camera[cameraComponent]) {
    controlInputs.camera[cameraComponent] = [];
  }

  const min = getParamMin(param);
  const max = getParamMax(param);

  // Remove existing mapping for this node/param combination from ALL camera components
  Object.keys(controlInputs.camera).forEach(component => {
    controlInputs.camera[component] = controlInputs.camera[component].filter(
      mapping => !(mapping.nodeId === node.id && mapping.param === param)
    );
    if (controlInputs.camera[component].length === 0) {
      delete controlInputs.camera[component];
    }
  });

  // Re-initialize the target component if it was deleted
  if (!controlInputs.camera[cameraComponent]) {
    controlInputs.camera[cameraComponent] = [];
  }

  // Add new mapping
  controlInputs.camera[cameraComponent].push({
    nodeId: node.id,
    param: param,
    min: min,
    max: max
  });

  Logger.debug('Created camera mapping:', { cameraComponent, nodeId: node.id, param, min, max });
  updateControlMappingDisplay(node);
}


/**
 * Update the control mapping display for a node
 */
function updateControlMappingDisplay(node) {
  const container = document.getElementById('control-mappings');
  if (!container) return;

  let html = '';

  // Show MIDI mappings
  Object.entries(controlInputs.midi).forEach(([ccNum, mapping]) => {
    if (mapping.nodeId === node.id) {
      html += `<div class="mapping-item">
        <span>MIDI CC${ccNum} → ${mapping.param}</span>
        <button class="remove-mapping" data-type="midi" data-key="${ccNum}">×</button>
      </div>`;
    }
  });

  // Show audio mappings
  Object.entries(controlInputs.audio).forEach(([bandName, mappings]) => {
    mappings.forEach((mapping, index) => {
      if (mapping.nodeId === node.id) {
        html += `<div class="mapping-item">
          <span>Audio ${bandName} → ${mapping.param}</span>
          <button class="remove-mapping" data-type="audio" data-key="${bandName}" data-index="${index}">×</button>
        </div>`;
      }
    });
  });

  // Show color mappings
  Object.entries(controlInputs.color).forEach(([componentName, mappings]) => {
    mappings.forEach((mapping, index) => {
      if (mapping.nodeId === node.id) {
        html += `<div class="mapping-item">
          <span>Color ${componentName} → ${mapping.param}</span>
          <button class="remove-mapping" data-type="color" data-key="${componentName}" data-index="${index}">×</button>
        </div>`;
      }
    });
  });

  // Show cursor mappings
  Object.entries(controlInputs.cursor).forEach(([componentName, mappings]) => {
    mappings.forEach((mapping, index) => {
      if (mapping.nodeId === node.id) {
        html += `<div class="mapping-item">
          <span>Cursor ${componentName} → ${mapping.param}</span>
          <button class="remove-mapping" data-type="cursor" data-key="${componentName}" data-index="${index}">×</button>
        </div>`;
      }
    });
  });

  // Show camera mappings
  Object.entries(controlInputs.camera).forEach(([componentName, mappings]) => {
    mappings.forEach((mapping, index) => {
      if (mapping.nodeId === node.id) {
        html += `<div class="mapping-item">
          <span>Camera ${componentName} → ${mapping.param}</span>
          <button class="remove-mapping" data-type="camera" data-key="${componentName}" data-index="${index}">×</button>
        </div>`;
      }
    });
  });


  if (html === '') {
    html = '<div class="mapping-empty">No control inputs mapped</div>';
  }

  container.innerHTML = html;

  // Add remove event listeners
  container.querySelectorAll('.remove-mapping').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const type = e.currentTarget.dataset.type;
      const key = e.currentTarget.dataset.key;
      const index = e.currentTarget.dataset.index;

      Logger.debug('Removing mapping:', { type, key, index });

      if (type === 'midi') {
        delete controlInputs.midi[key];
      } else if (type === 'audio') {
        if (controlInputs.audio[key]) {
          controlInputs.audio[key].splice(parseInt(index), 1);
          if (controlInputs.audio[key].length === 0) {
            delete controlInputs.audio[key];
          }
        }
      } else if (type === 'color') {
        if (controlInputs.color[key]) {
          controlInputs.color[key].splice(parseInt(index), 1);
          if (controlInputs.color[key].length === 0) {
            delete controlInputs.color[key];
          }
        }
      } else if (type === 'cursor') {
        if (controlInputs.cursor[key]) {
          controlInputs.cursor[key].splice(parseInt(index), 1);
          if (controlInputs.cursor[key].length === 0) {
            delete controlInputs.cursor[key];
          }
        }
      } else if (type === 'camera') {
        if (controlInputs.camera[key]) {
          controlInputs.camera[key].splice(parseInt(index), 1);
          if (controlInputs.camera[key].length === 0) {
            delete controlInputs.camera[key];
          }
        }
      }

      // Refresh the control mapping display
      updateControlMappingDisplay(node);

      // Also refresh the properties panel if this node is selected
      if (selectedNode === node) {
        showNodeProperties(node);
      }
    });
  });
}

/**
 * Update preview canvases in the properties panel
 */
function updateNodePreviews(node) {
  if (!node || selectedNode !== node) return;

  const panel = document.getElementById('properties-panel');
  if (!panel) return;

  // Update input previews
  const inputCanvases = panel.querySelectorAll('[data-preview-type="input"]');
  inputCanvases.forEach(canvas => {
    const ctx = canvas.getContext('2d');
    const inputIndex = parseInt(canvas.dataset.inputIndex);
    const inputNode = node.inputs[inputIndex];

    if (inputNode && inputNode.texture && gl.isTexture(inputNode.texture)) {
      // Draw the input texture
      drawTextureToCanvas(inputNode.texture, canvas);
    } else {
      // Clear canvas for empty input
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#666';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No Input', canvas.width/2, canvas.height/2);
    }
  });

  // Update output preview
  const outputCanvas = panel.querySelector('[data-preview-type="output"]');
  if (outputCanvas && node.texture && gl.isTexture(node.texture)) {
    drawTextureToCanvas(node.texture, outputCanvas);
  }

  // Continue updating if node is still selected
  if (selectedNode === node) {
    requestAnimationFrame(() => updateNodePreviews(node));
  }
}

/**
 * Draw a WebGL texture to a 2D canvas
 */
function drawTextureToCanvas(texture, canvas) {
  const ctx = canvas.getContext('2d');
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Save current WebGL state
  const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
  const currentFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  const currentViewport = gl.getParameter(gl.VIEWPORT);

  try {
    // Use the copy shader to render the texture
    gl.useProgram(programs.copy);

    // Create a temporary framebuffer
    const tempFb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, tempFb);

    // Create a temporary texture to render to
    const tempTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tempTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvasWidth, canvasHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Attach the texture to framebuffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tempTexture, 0);

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
      // Set viewport to match preview size
      gl.viewport(0, 0, canvasWidth, canvasHeight);

      // Bind the source texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      // Set uniform
      const texLoc = gl.getUniformLocation(programs.copy, 'u_texture');
      gl.uniform1i(texLoc, 0);

      // Render the texture to our temporary framebuffer
      bindQuad();
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Read pixels from the temporary framebuffer
      const pixels = new Uint8Array(canvasWidth * canvasHeight * 4);
      gl.readPixels(0, 0, canvasWidth, canvasHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      // Create ImageData and draw to canvas
      const imageData = ctx.createImageData(canvasWidth, canvasHeight);

      // Flip vertically while copying (WebGL has Y axis flipped)
      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          const srcIndex = ((canvasHeight - 1 - y) * canvasWidth + x) * 4;
          const dstIndex = (y * canvasWidth + x) * 4;
          imageData.data[dstIndex] = pixels[srcIndex];
          imageData.data[dstIndex + 1] = pixels[srcIndex + 1];
          imageData.data[dstIndex + 2] = pixels[srcIndex + 2];
          imageData.data[dstIndex + 3] = pixels[srcIndex + 3];
        }
      }

      ctx.putImageData(imageData, 0, 0);
    }

    // Clean up temporary resources
    gl.deleteTexture(tempTexture);
    gl.deleteFramebuffer(tempFb);

  } catch (error) {
    Logger.error('Error drawing texture to canvas:', error);
    // Show error state
    ctx.fillStyle = '#440000';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = '#ff6666';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Error', canvasWidth/2, canvasHeight/2);
  } finally {
    // Always restore WebGL state
    gl.bindFramebuffer(gl.FRAMEBUFFER, currentFramebuffer);
    gl.useProgram(currentProgram);
    gl.viewport(currentViewport[0], currentViewport[1], currentViewport[2], currentViewport[3]);
  }
}

/**
 * Update node properties UI (for refreshing during control input)
 */
function updateNodeProperties(node) {
  if (selectedNode === node) {
    showNodeProperties(node);
  }
}

function getParamMin(key) {
  const constraints = getParameterConstraints(key);
  return constraints ? constraints.min : 0;
}

function getParamMax(key) {
  const constraints = getParameterConstraints(key);
  return constraints ? constraints.max : 1;
}

function getParamStep(key) {
  const constraints = getParameterConstraints(key);
  return constraints ? constraints.step : 0.01;
}

/**
 * Detect and remove self-references from all nodes
 */
function removeSelfReferences() {
  let fixedCount = 0;
  
  nodes.forEach(node => {
    // Check regular inputs
    for (let i = 0; i < node.inputs.length; i++) {
      if (node.inputs[i] === node) {
        Logger.warn(`Removing self-reference from ${node.name} input ${i}`);
        node.inputs[i] = null;
        fixedCount++;
      }
    }
    
    // Check control inputs
    if (node.controlInputs) {
      for (let i = 0; i < node.controlInputs.length; i++) {
        if (node.controlInputs[i] === node) {
          Logger.warn(`Removing self-reference from ${node.name} control input ${i}`);
          node.controlInputs[i] = null;
          fixedCount++;
        }
      }
    }
  });
  
  if (fixedCount > 0) {
    Logger.info(`Fixed ${fixedCount} self-reference(s)`);
    updateConnections();
  }
  
  return fixedCount;
}

/**
 * Sort nodes in dependency order using topological sort
 * Ensures nodes render after their dependencies
 */
function getSortedNodesForRendering() {
  const visited = new Set();
  const visiting = new Set();
  const result = [];

  function visit(node) {
    if (visiting.has(node.id)) {
      // Circular dependency detected - skip this node to avoid infinite loop
      Logger.warn(`Circular dependency detected involving node ${node.name}`);
      return;
    }

    if (visited.has(node.id)) {
      return;
    }

    visiting.add(node.id);

    // Visit all dependencies first
    node.inputs.forEach(inputNode => {
      if (inputNode) {
        visit(inputNode);
      }
    });

    visiting.delete(node.id);
    visited.add(node.id);
    result.push(node);
  }

  // Visit all nodes
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      visit(node);
    }
  });

  return result;
}

/**
 * Update input node values based on their type
 */
function updateInputNodeValue(node, time) {
  let value = 0.0;

  switch (node.type) {
    case 'MIDIInput':
      const ccNum = node.params.ccNumber;
      if (controlInputs.midi[ccNum]) {
        const rawValue = controlInputs.midi[ccNum].lastValue || 0.0;
        // Map to configured min/max range
        const midiMin = node.params.min || 0;
        const midiMax = node.params.max || 1;
        value = midiMin + (rawValue * (midiMax - midiMin));
      }
      break;

    case 'AudioInput':
      if (audioEnabled && frequencyData) {
        // Get audio level for the selected band (0-1)
        const band = node.params.band;
        const rawValue = getAudioLevel(band);
        
        // Map to configured min/max range
        const audioMin = node.params.min || 0;
        const audioMax = node.params.max || 1;
        
        // Apply reverse range if enabled
        const reverseRange = node.params.reverseRange || false;
        if (reverseRange) {
          // When reverse is on, high audio = low output, low audio = high output
          value = audioMax - (rawValue * (audioMax - audioMin));
        } else {
          // Normal operation: low audio = low output, high audio = high output
          value = audioMin + (rawValue * (audioMax - audioMin));
        }
        
        // Debug logging
        if (selectedNode === node) {
          Logger.debug(`AudioInput update:
            - Band: ${band}
            - Raw audio level: ${rawValue}
            - Min/Max: ${audioMin}/${audioMax}
            - Reverse Range: ${reverseRange}
            - Output value: ${value}`);
        }
      }
      break;

    case 'CursorInput':
      const component = node.params.component;
      let rawCursorValue = 0;
      if (component === 'x') {
        rawCursorValue = cursorComponents.x.value;
      } else if (component === 'y') {
        rawCursorValue = cursorComponents.y.value;
      } else if (component === 'velocity') {
        rawCursorValue = cursorComponents.velocity.value;
      } else if (component === 'click') {
        rawCursorValue = cursorComponents.click.value;
      }
      // Map to configured min/max range
      const cursorMin = node.params.min || 0;
      const cursorMax = node.params.max || 1;
      value = cursorMin + (rawCursorValue * (cursorMax - cursorMin));
      break;

    case 'CameraInput':
      // Get camera analysis component value
      const cameraComponent = node.params.component || 'brightness';
      const rawCameraValue = cameraComponents[cameraComponent]?.value || 0;
      // Map to configured min/max range
      const cameraMin = node.params.min || 0;
      const cameraMax = node.params.max || 1;
      value = cameraMin + (rawCameraValue * (cameraMax - cameraMin));
      break;
      
    case 'GameControllerInput':
      const controllerComponent = node.params.component || 'button0';
      const rawControllerValue = controllerComponents[controllerComponent]?.value || 0;
      const deadzone = node.params.deadzone || 0.1;
      const smoothing = node.params.smoothing || 0.0;
      
      // Apply deadzone for analog inputs
      let processedValue = rawControllerValue;
      if (controllerComponent.startsWith('axis')) {
        // For axes, apply deadzone
        if (Math.abs(rawControllerValue - 0.5) < deadzone / 2) {
          processedValue = 0.5;
        }
      }
      
      // Apply smoothing
      if (smoothing > 0 && node.lastControllerValue !== undefined) {
        processedValue = node.lastControllerValue + (processedValue - node.lastControllerValue) * (1 - smoothing);
      }
      node.lastControllerValue = processedValue;
      
      // Map to configured min/max range
      const controllerMin = node.params.min || 0;
      const controllerMax = node.params.max || 1;
      value = controllerMin + (processedValue * (controllerMax - controllerMin));
      break;

    case 'RandomInput':
      // Generate random values at the specified interval (in seconds)
      const intervalSeconds = node.params.interval || 1.0;
      const intervalMs = intervalSeconds * 1000; // Convert seconds to milliseconds

      // Ensure random value and last update time are initialized (should be done in constructor)
      if (!node.randomValue) {
        node.randomValue = Math.random();
      }
      if (!node.lastRandomUpdate) {
        node.lastRandomUpdate = Date.now();
      }

      const now = Date.now();
      const timeSinceLastUpdate = now - node.lastRandomUpdate;
      if (timeSinceLastUpdate >= intervalMs) {
        node.randomValue = Math.random();
        node.lastRandomUpdate = now;
      }

      // Output the actual value directly (min-max range)
      const randomMin = node.params.min || 0;
      const randomMax = node.params.max || 1;
      value = randomMin + (node.randomValue * (randomMax - randomMin));
      break;
      
    case 'RangeInput':
      // Update range progress based on speed and time
      if (!node.rangeProgress) node.rangeProgress = 0;
      if (!node.lastRangeUpdate) node.lastRangeUpdate = Date.now();
      
      const nowRange = Date.now();
      const deltaTime = (nowRange - node.lastRangeUpdate) / 1000; // Convert to seconds
      node.lastRangeUpdate = nowRange;
      
      // Calculate step progress
      const range = node.params.max - node.params.min;
      const steps = Math.max(1, Math.abs(range / (node.params.step || 0.01)));
      const speed = Math.max(0.000001, node.params.speed || 1); // Allow very slow speeds
      const stepDuration = 1 / (speed * steps); // Time per step
      
      // Update progress
      const progressDelta = deltaTime / stepDuration;
      
      if (node.params.direction === 'up') {
        node.rangeProgress += progressDelta;
      } else {
        node.rangeProgress -= progressDelta;
      }
      
      // Handle looping - ensure progress stays in valid range
      if (node.params.loop) {
        // Use modulo to wrap around properly
        node.rangeProgress = node.rangeProgress % 1;
        if (node.rangeProgress < 0) node.rangeProgress += 1;
      } else {
        // Clamp to 0-1 range
        node.rangeProgress = Math.max(0, Math.min(1, node.rangeProgress));
      }
      
      // Apply curve function
      let curvedProgress = node.rangeProgress;
      switch (node.params.curve) {
        case 'exponential':
          curvedProgress = Math.pow(node.rangeProgress, 2);
          break;
        case 'logarithmic':
          // Safe logarithmic curve that stays in 0-1 range
          if (node.rangeProgress <= 0) {
            curvedProgress = 0;
          } else {
            // Use a logarithmic curve from 0 to 1
            curvedProgress = Math.log(1 + node.rangeProgress * 9) / Math.log(10);
          }
          break;
        case 'sine':
          curvedProgress = (Math.sin((node.rangeProgress - 0.5) * Math.PI) + 1) / 2;
          break;
        case 'bounce':
          // Single bounce instead of double
          curvedProgress = Math.abs(Math.sin(node.rangeProgress * Math.PI));
          break;
        // 'linear' is default
      }
      
      // Ensure curvedProgress is always in 0-1 range
      curvedProgress = Math.max(0, Math.min(1, curvedProgress));
      
      // Apply round-trip mode if enabled
      if (node.params.mode === 'round-trip') {
        // Special handling for different curves in round-trip mode
        switch (node.params.curve) {
          case 'sine':
            // Full sine wave: 0 -> 1 -> 0
            curvedProgress = (Math.sin(node.rangeProgress * Math.PI * 2 - Math.PI/2) + 1) / 2;
            break;
            
          case 'bounce':
            // Single bounce: just use sine for smooth up and down
            curvedProgress = Math.sin(node.rangeProgress * Math.PI);
            break;
            
          case 'exponential':
            // Exponential up, exponential down
            if (node.rangeProgress <= 0.5) {
              curvedProgress = Math.pow(node.rangeProgress * 2, 2);
            } else {
              curvedProgress = Math.pow((1 - node.rangeProgress) * 2, 2);
            }
            break;
            
          case 'logarithmic':
            // Logarithmic up, logarithmic down
            if (node.rangeProgress <= 0.5) {
              const t = node.rangeProgress * 2;
              curvedProgress = Math.log(1 + t * 9) / Math.log(10);
            } else {
              const t = (1 - node.rangeProgress) * 2;
              curvedProgress = Math.log(1 + t * 9) / Math.log(10);
            }
            break;
            
          default: // linear
            // Triangle wave: linear up, linear down
            if (node.rangeProgress <= 0.5) {
              curvedProgress = node.rangeProgress * 2;
            } else {
              curvedProgress = 2 - (node.rangeProgress * 2);
            }
        }
      }
      
      // Output the actual value directly (min-max range)
      const rangeMin = node.params.min || 0;
      const rangeMax = node.params.max || 1;
      value = rangeMin + (curvedProgress * (rangeMax - rangeMin));
      
      // Final safety check - ensure value is within min/max bounds
      value = Math.max(rangeMin, Math.min(rangeMax, value));
      break;
  }

  // For control inputs, store the raw value (already in correct range)
  // Don't double-map it
  node.currentValue = value;

  // Update the properties panel display if this node is selected
  if (selectedNode === node && node.category === 'input') {
    const currentValueDisplay = document.querySelector('.current-value-display');
    if (currentValueDisplay) {
      currentValueDisplay.textContent = value.toFixed(3);
    }
    
    // Update help text for specific node types
    if (node.type === 'RangeInput') {
      const helpText = document.querySelector('.property-field .help-text');
      if (helpText && node.rangeProgress !== undefined) {
        const progressPercent = (node.rangeProgress * 100).toFixed(1);
        helpText.textContent = `Progress: ${progressPercent}% • ${node.params.loop ? 'Looping' : 'One-shot'}`;
      }
    } else if (node.type === 'MIDIInput') {
      const helpText = document.querySelector('.property-field .help-text');
      if (helpText) {
        helpText.textContent = `MIDI CC${node.params.ccNumber} value`;
      }
    } else if (node.type === 'AudioInput') {
      const helpText = document.querySelector('.property-field .help-text');
      if (helpText) {
        helpText.textContent = `Audio ${node.params.band} level`;
      }
    } else if (node.type === 'CursorInput') {
      const helpText = document.querySelector('.property-field .help-text');
      if (helpText) {
        helpText.textContent = `Cursor ${node.params.component} value`;
      }
    } else if (node.type === 'CameraInput') {
      // Update current value display
      const valueDisplay = document.querySelector(`#node-properties-${node.id} .current-value-display`);
      if (valueDisplay) {
        valueDisplay.textContent = value.toFixed(3);
      }
      // Update help text
      const helpText = document.querySelector(`#node-properties-${node.id} .help-text`);
      if (helpText && cameraComponents[node.params.component]) {
        helpText.textContent = cameraComponents[node.params.component].name;
      }
    }
  }
}

/**
 * Main rendering loop - RESTORED TO SIMPLE WORKING VERSION
 */
function startRenderLoop() {
  function render() {
    // Skip rendering if WebGL is not healthy
    if (!isWebGLHealthy()) {
      Logger.warn('Skipping render frame - WebGL not healthy');
      if (!webglContextLost) {
        animationFrameId = requestAnimationFrame(render);
      }
      return;
    }

    animationFrameId = requestAnimationFrame(render);

    try {
      const elapsed = (Date.now() - startTime) / 1000.0;

      // Clear screen
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.disable(gl.DEPTH_TEST);

      // Render nodes in dependency order
      const sortedNodes = getSortedNodesForRendering();


      sortedNodes.forEach(node => {
        if (!node.enabled) return;
        if (node.groupName && groups[node.groupName] && !groups[node.groupName].enabled) return;

        // PREVENT FEEDBACK LOOP: Don't render FinalOutput node in the main loop
        // It will be handled separately in renderFinalOutput()
        if (node.type === 'FinalOutput') {
          return;
        }

        try {
          renderNode(node, elapsed);
        } catch (error) {
          Logger.error(`Error rendering node ${node.name}:`, error);
        }
      });

      // Temporarily disable I/O preview updates in render loop
      // if (selectedNode) {
      //   updateIOPreviews(selectedNode);
      // }

      // Render final output to canvas
      renderFinalOutput();

    } catch (error) {
      Logger.error('Error in render loop:', error);
    }
  }

  // Only start render loop if WebGL is healthy
  if (isWebGLHealthy()) {
    render();
  } else {
    Logger.warn('Cannot start render loop - WebGL not healthy');
  }
}

/**
 * Render final output - RESTORED TO SIMPLE VERSION
 */
function renderFinalOutput() {
  const finalOutputNode = nodes.find(n => n.type === 'FinalOutput');
  if (!finalOutputNode) {
    Logger.warn('No FinalOutput node found');
    return;
  }

  const connectedNode = finalOutputNode.inputs[0];
  if (!connectedNode) {
    Logger.warn('FinalOutput has no input connected');
    return;
  }

  if (!connectedNode.texture) {
    Logger.warn(`Connected node "${connectedNode.name}" has no texture`);
    return;
  }

  Logger.info(`Rendering final output from: ${connectedNode.name} (${connectedNode.type})`);

  // Validate connected node's texture
  if (!gl.isTexture(connectedNode.texture)) {
    Logger.error(`Connected node "${connectedNode.name}" has invalid texture`);
    return;
  }
  
  // Camera nodes now render properly with separate textures
  if (connectedNode.type === 'Camera') {
    Logger.trace(`Final output rendering Camera ${connectedNode.name}`);
  }

  gl.useProgram(programs.copy);

  const textureLocation = gl.getUniformLocation(programs.copy, "u_texture");
  if (textureLocation) {
    gl.uniform1i(textureLocation, 0);
  }

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, connectedNode.texture);
  bindQuad();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  
  // Clear before drawing to see if anything renders
  gl.clearColor(0.1, 0.1, 0.1, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadBuffer.numItems);
  
  // Check for errors
  const error = gl.getError();
  if (error !== gl.NO_ERROR) {
    Logger.error(`Error rendering final output: ${error}`);
  }
}

function renderNode(node, time) {
  // Skip deleted nodes
  if (node.deleted) {
    return;
  }
  
  // Debug Camera nodes (only if trace logging enabled)
  if (node.type === 'Camera') {
    Logger.trace(`Starting Camera render for ${node.name}`);
  }

  // Skip Camera/VideoFileInput nodes if video isn't ready yet - do this EARLY before any GL state changes
  if ((node.type === 'Camera' || node.type === 'VideoFileInput') && 
      (!node.video || node.video.readyState !== node.video.HAVE_ENOUGH_DATA)) {
    Logger.trace(`${node.type} node ${node.name}: Video not ready, skipping render early`);
    return;
  }

  if (!node.program && node.category !== 'input') {
    Logger.warn(`SKIPPING ${node.name} (${node.type}): No program assigned`);
    return;
  }

  // Debug log for Layer, Mix and Composite nodes
  if (node.type === 'Layer' || node.type === 'Mix' || node.type === 'Composite') {
    const validInputs = node.inputs.filter(n => n && !n.deleted && n.texture);
    const expectedInputs = node.type === 'Composite' ? 4 : 2;
    Logger.debug(`Rendering ${node.type} node: ${node.name}, valid inputs: ${validInputs.length}/${expectedInputs} [${validInputs.map(n => n.name).join(', ')}]`);

    // Special debugging for Layer nodes
    if (node.type === 'Layer') {
      const layerInfo = {
        name: node.name,
        blendMode: node.params.blendMode,
        opacity: node.params.opacity,
        input1: node.inputs[0]?.name || 'none',
        input1HasTexture: !!node.inputs[0]?.texture,
        input2: node.inputs[1]?.name || 'none',
        input2HasTexture: !!node.inputs[1]?.texture,
        hasProgram: !!node.program
      };

      Logger.debug(`Layer ${node.name} details:`, layerInfo);
      updateDebugPanel('layer', layerInfo);
    }
  }

  if (node.type === 'Camera' || node.type === 'VideoFileInput') {
    // Debug logging for Camera nodes
    if (node.type === 'Camera') {
      Logger.debug(`Camera node ${node.name} state:`, {
        hasVideo: !!node.video,
        videoReady: node.video?.readyState === node.video?.HAVE_ENOUGH_DATA,
        hasTexture: !!node.texture,
        textureValid: node.texture && gl.isTexture(node.texture),
        hasProgram: !!node.program,
        programValid: node.program && gl.isProgram(node.program),
        hasFBO: !!node.fbo,
        fboValid: node.fbo && gl.isFramebuffer(node.fbo)
      });
    }
    
    
    if (node.video && node.video.readyState === node.video.HAVE_ENOUGH_DATA) {
      Logger.trace(`${node.type} node ${node.name} ready to render with video`);
      
      // Check if we have valid textures
      if (!node.videoTexture || !gl.isTexture(node.videoTexture)) {
        Logger.error(`${node.type} node ${node.name} has no valid video texture`);
        return;
      }
      if (!node.texture || !gl.isTexture(node.texture)) {
        Logger.error(`${node.type} node ${node.name} has no valid output texture`);
        return;
      }
      
      // Save current texture binding
      const currentTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
      
      // Update the node's VIDEO texture with the current video frame
      gl.bindTexture(gl.TEXTURE_2D, node.videoTexture);
      try {
        // Clear any pending errors
        gl.getError();
        
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, node.video);
        setTextureParams();
        
        // Check for errors
        const error = gl.getError();
        if (error !== gl.NO_ERROR) {
          Logger.error(`${node.type} video texture upload error:`, error);
        } else {
          Logger.trace(`${node.type} video texture uploaded successfully to videoTexture`);
        }
      } catch(e) {
        // Handle video texture errors
        Logger.error(`${node.type} video texture update error:`, e);
      }
      
      // CRITICAL: Unbind the texture to prevent feedback loop
      gl.bindTexture(gl.TEXTURE_2D, null);
      
      // Continue to render the texture to FBO
      // Don't return early - let it continue to the normal rendering flow
    } else {
      // Video not ready yet
      Logger.trace(`${node.type} video not ready, skipping`);
      return;
    }
  }
  
  
  // Handle Text node - render text to canvas then upload as texture
  if (node.type === 'Text') {
    if (!node.textCanvas) {
      node.textCanvas = document.createElement('canvas');
      node.textCanvas.width = canvas.width;
      node.textCanvas.height = canvas.height;
      node.textCtx = node.textCanvas.getContext('2d');
    }
    
    // Clear canvas
    node.textCtx.clearRect(0, 0, node.textCanvas.width, node.textCanvas.height);
    
    // Set text properties
    node.textCtx.font = node.params.font || 'Inter Bold 96pt';
    node.textCtx.fillStyle = node.params.fillColor || '#ffffff';
    node.textCtx.textAlign = 'center';
    node.textCtx.textBaseline = 'middle';
    
    // Draw text
    node.textCtx.fillText(
      node.params.text || 'Hello',
      node.textCanvas.width / 2,
      node.textCanvas.height / 2
    );
    
    // Upload canvas to texture
    gl.bindTexture(gl.TEXTURE_2D, node.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, node.textCanvas);
    setTextureParams();
    
    // Don't return - let it render normally with the texture
  }

  // Handle input nodes - they just update values and don't render
  if (node.category === 'input') {
    updateInputNodeValue(node, time);
    return; // Input nodes don't need WebGL rendering
  }

  // Apply control input values to node parameters
  if (node.controlInputs) {
    node.controlInputs.forEach((controlNode, controlIndex) => {
      if (controlNode && controlNode.currentValue !== undefined) {
        const paramNames = Object.keys(node.params);
        const paramName = paramNames[controlIndex];
        if (paramName) {
          // Get the control value directly - no normalization needed!
          // The control input nodes output exactly what they display
          let value = controlNode.currentValue || 0;
          
          // Debug logging
          if (controlNode.type === 'AudioInput' && paramName === 'slices') {
            Logger.debug(`AudioInput → Kaleidoscope slices:
              - Direct value: ${value} → ${paramName}`);
          }

          // Handle different parameter types
          if (paramName === 'colorPalette') {
            // For string parameters that need selection, use value as index
            const paletteNames = Object.keys(colorPalettes);
            const paletteIndex = Math.floor(value) % paletteNames.length;
            node.params[paramName] = paletteNames[paletteIndex];
          } else if (paramName === 'blendMode') {
            // For blend modes, use value as index
            const blendModes = ['Normal', 'Multiply', 'Screen', 'Overlay'];
            const modeIndex = Math.floor(value) % blendModes.length;
            node.params[paramName] = blendModes[modeIndex];
          } else if (typeof node.params[paramName] === 'number') {
            // For numeric parameters, use the value directly
            const paramDef = PARAMETER_CONSTRAINTS[paramName];
            
            if (paramDef) {
              // Clamp to parameter's min/max range
              let clampedValue = value;
              if (paramDef.min !== undefined) {
                clampedValue = Math.max(paramDef.min, clampedValue);
              }
              if (paramDef.max !== undefined) {
                clampedValue = Math.min(paramDef.max, clampedValue);
              }
              
              // For integer parameters, round to nearest integer
              if (paramDef.type === 'integer') {
                clampedValue = Math.round(clampedValue);
              }
              
              node.params[paramName] = clampedValue;
              
              // Debug logging
              if (paramName === 'slices' && value !== clampedValue) {
                Logger.debug(`Slices clamped: ${value} → ${clampedValue}`);
              }
            } else {
              // No constraints defined, use value directly
              node.params[paramName] = value;
            }
          }
        }
      }
    });
  }

  // Validate program before use
  if (!node.program) {
    Logger.error(`No program assigned to ${node.name} (${node.type})`);
    return;
  }
  
  if (!gl.isProgram(node.program)) {
    Logger.error(`Invalid program for ${node.name} (${node.type})`);
    return;
  }

  gl.useProgram(node.program);

  // Set common uniforms
  const resLoc = gl.getUniformLocation(node.program, "u_resolution");
  if (resLoc) gl.uniform2f(resLoc, canvas.width, canvas.height);

  const timeLoc = gl.getUniformLocation(node.program, "u_time");
  if (timeLoc) gl.uniform1f(timeLoc, time);

  // Set node-specific uniforms
  setNodeUniforms(node);

  // Bind input textures AFTER setting uniforms
  bindNodeInputTextures(node);

  // Ensure oscillator color palette is always set
  if (node.type === 'Oscillator' && node.params.colorPalette) {
    const palette = colorPalettes[node.params.colorPalette];
    if (palette) {
      const paletteRGB = palette.map(hexToRgb).filter(Boolean);

      // Set individual color uniforms
      for (let i = 0; i < 8; i++) {
        const colorLoc = gl.getUniformLocation(node.program, `u_color${i}`);
        if (colorLoc) {
          if (i < paletteRGB.length) {
            const color = paletteRGB[i];
            gl.uniform3f(colorLoc, color.r, color.g, color.b);
          } else {
            const lastColor = paletteRGB[paletteRGB.length - 1] || { r: 1, g: 1, b: 1 };
            gl.uniform3f(colorLoc, lastColor.r, lastColor.g, lastColor.b);
          }
        }
      }

      // Set palette size
      const sizeLoc = gl.getUniformLocation(node.program, 'u_palettesize');
      if (sizeLoc) {
        gl.uniform1f(sizeLoc, Math.min(paletteRGB.length, 8));
      }
    }
  }

  // Render to node's framebuffer
  if (!node.fbo || !gl.isFramebuffer(node.fbo)) {
    Logger.warn(`Node ${node.name} has invalid framebuffer - skipping render`);
    return;
  }

  // CRITICAL: Check for framebuffer-texture feedback loop before rendering
  const hasTextureAttachedToCurrentFBO = node.inputs.some(inputNode => {
    if (!inputNode || inputNode.deleted || !inputNode.texture) return false;

    // Check if any input texture is attached to the framebuffer we're about to render to
    if (inputNode.fbo === node.fbo) {
      return true;
    }
    return false;
  });

  if (hasTextureAttachedToCurrentFBO) {
    Logger.warn(`FEEDBACK LOOP: Skipping render for ${node.name} (${node.type}) to prevent WebGL feedback loop`);
    return;
  }

  try {
    bindQuad();

    // Clear any errors before framebuffer operations
    let error = gl.getError();
    while (error !== gl.NO_ERROR) {
      Logger.trace(`Clearing previous error before ${node.name} framebuffer ops:`, error);
      error = gl.getError();
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, node.fbo);
    
    // Camera FBO binding is now safe with separate textures
    if (node.type === 'Camera') {
      Logger.trace(`Camera ${node.name} binding to FBO`);
    }

    // Check for framebuffer binding errors
    error = gl.getError();
    if (error !== gl.NO_ERROR) {
      Logger.error(`Error binding framebuffer for ${node.name}:`, error);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return;
    }

    // Check framebuffer status before rendering
    const fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (fbStatus !== gl.FRAMEBUFFER_COMPLETE) {
      Logger.error(`Framebuffer incomplete for ${node.name}:`, fbStatus);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return;
    }
  } catch (e) {
    Logger.error(`Exception during framebuffer setup for ${node.name}:`, e);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return;
  }

  gl.viewport(0, 0, canvas.width, canvas.height);

  // IMPORTANT: Clear the framebuffer before rendering
  // This prevents accumulation of data and ensures clean output
  gl.clearColor(0, 0, 0, 0);  // Clear to transparent black
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Clear any previous WebGL errors before drawing
  let error = gl.getError();
  while (error !== gl.NO_ERROR) {
    Logger.trace(`Clearing previous WebGL error before ${node.name} render:`, error);
    error = gl.getError();
  }

  // Clear any errors before draw
  while (gl.getError() !== gl.NO_ERROR) {}
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadBuffer.numItems);
  
  // Log successful render for Camera nodes (trace level)
  if (node.type === 'Camera' || node.type === 'VideoFileInput') {
    Logger.trace(`${node.type} node ${node.name} rendered successfully to FBO`);
  }

  // Check for errors after drawing
  error = gl.getError();
  if (error !== gl.NO_ERROR) {
    const errorName = error === 1282 ? 'GL_INVALID_OPERATION' : 
                     error === 1281 ? 'GL_INVALID_VALUE' :
                     error === 1280 ? 'GL_INVALID_ENUM' : `Unknown (${error})`;
    Logger.error(`WebGL error after rendering ${node.name} (${node.type}): ${errorName}`);
    
    // Additional debug info for GL_INVALID_OPERATION
    if (error === 1282) {
      Logger.debug(`  Program valid: ${!!node.program}`);
      Logger.debug(`  Program is WebGL program: ${node.program && gl.isProgram(node.program)}`);
      Logger.debug(`  Current program: ${gl.getParameter(gl.CURRENT_PROGRAM)}`);
      Logger.debug(`  Texture valid: ${!!node.texture && gl.isTexture(node.texture)}`);
      Logger.debug(`  FBO valid: ${!!node.fbo && gl.isFramebuffer(node.fbo)}`);
      Logger.debug(`  Quad buffer valid: ${!!quadBuffer.buf && gl.isBuffer(quadBuffer.buf)}`);
      
      // Check vertex attrib state
      const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
      if (currentProgram) {
        const posLoc = gl.getAttribLocation(currentProgram, "a_position");
        Logger.debug(`  a_position location: ${posLoc}`);
        if (posLoc !== -1) {
          Logger.debug(`  Vertex attrib ${posLoc} enabled: ${gl.getVertexAttrib(posLoc, gl.VERTEX_ATTRIB_ARRAY_ENABLED)}`);
        }
      }
    }
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  // >>> SINGLE SOURCE OF TRUTH – do not duplicate! <<<
  // Special post-processing for FeedbackTrail
  if (node.type === 'FeedbackTrail') {
    // 1. Allocate feedback FBO/texture once
    if (!node.feedbackTexture) {
      node.feedbackTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, node.feedbackTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    canvas.width, canvas.height, 0,
                    gl.RGBA, gl.UNSIGNED_BYTE, null);
      setTextureParams();

      node.feedbackFbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, node.feedbackFbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        node.feedbackTexture,
        0
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    // 2. COPY current render → feedbackTexture (no swapping!)
    gl.bindFramebuffer(gl.FRAMEBUFFER, node.feedbackFbo);
    gl.useProgram(programs.copy);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, node.texture);
    const uTex = gl.getUniformLocation(programs.copy, 'u_texture');
    if (uTex) gl.uniform1i(uTex, 0);

    bindQuad();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }
}

/**
 * Render I/O previews for the properties panel
 */
function updateIOPreviews(node) {
  if (!node || !selectedNode || selectedNode.id !== node.id) return;

  const ioCanvases = document.querySelectorAll('.io-preview-canvas');

  ioCanvases.forEach(canvas => {
    const type = canvas.dataset.type;
    const index = parseInt(canvas.dataset.index);
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    try {
      if (type === 'input') {
        // Render input texture preview
        const inputNode = node.inputs[index - 1];
        if (inputNode && inputNode.texture) {
          renderTextureToCanvas(inputNode.texture, canvas, ctx);
        } else {
          // Show empty input placeholder
          ctx.fillStyle = '#333';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#666';
          ctx.font = '10px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Empty', canvas.width/2, canvas.height/2 + 3);
        }
      } else if (type === 'output') {
        // Render output texture preview
        if (node.texture) {
          renderTextureToCanvas(node.texture, canvas, ctx);

          // Update output info
          const outputInfo = document.getElementById(`output-info-${node.id}`);
          if (outputInfo) {
            outputInfo.textContent = `${canvas.width}×${canvas.height}`;
          }
        } else {
          // Show processing placeholder
          ctx.fillStyle = '#222';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#888';
          ctx.font = '9px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Processing...', canvas.width/2, canvas.height/2 + 3);
        }
      }
    } catch (error) {
      // Show error state
      ctx.fillStyle = '#400';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f88';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Error', canvas.width/2, canvas.height/2 + 2);
      Logger.warn('I/O preview error:', error);
    }
  });
}

/**
 * Render WebGL texture to a 2D canvas for preview
 */
function renderTextureToCanvas(texture, canvas, ctx) {
  if (!texture || !gl) return;

  try {
    // Simple approach: just show a color pattern based on node type for now
    // This avoids complex framebuffer operations that could cause errors
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#4a90e2');
    gradient.addColorStop(1, '#357abd');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add a simple pattern to indicate this is a texture preview
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < canvas.width; i += 8) {
      for (let j = 0; j < canvas.height; j += 8) {
        if ((i + j) % 16 === 0) {
          ctx.fillRect(i, j, 4, 4);
        }
      }
    }

    // Add "TEX" label
    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TEX', canvas.width/2, canvas.height/2 + 3);

  } catch (error) {
    // Show error pattern
    ctx.fillStyle = '#440';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f88';
    ctx.font = '8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Error', canvas.width/2, canvas.height/2 + 2);
  }
}

function setNodeUniforms(node) {
  const program = node.program;

  // Set parameters as uniforms
  Object.entries(node.params).forEach(([key, value]) => {
    // Special case for blendMode to maintain camelCase
    const uniformName = key === 'blendMode' ? 'u_blendMode' : `u_${key.toLowerCase()}`;
    const loc = gl.getUniformLocation(program, uniformName);

    if (loc) {
      if (typeof value === 'number') {
        // Convert rotation from degrees to radians
        if (key === 'rotation') {
          gl.uniform1f(loc, value * Math.PI / 180);
        } else {
          gl.uniform1f(loc, value);
          // Debug logging for slices
          if (key === 'slices' && node.type === 'Kaleidoscope') {
            Logger.debug(`Setting kaleidoscope slices uniform: ${value}`);
          }
        }
      } else if (typeof value === 'boolean') {
        gl.uniform1i(loc, value ? 1 : 0);
      } else if (typeof value === 'string' && key === 'color') {
        const hex = value.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16) / 255;
        const g = parseInt(hex.substr(2, 2), 16) / 255;
        const b = parseInt(hex.substr(4, 2), 16) / 255;
        gl.uniform3f(loc, r, g, b);
      } else if (key === 'blendMode') {
        const modes = { 'Normal': 0, 'Multiply': 1, 'Screen': 2, 'Overlay': 3 };
        let modeValue = modes[value] || 0;

        // Store the numeric value for debugging
        node.params.blendModeValue = modeValue;


        if (loc !== null && loc !== -1) {
          gl.uniform1f(loc, parseFloat(modeValue));
          // Verify the uniform was set
          const error = gl.getError();
          if (error !== gl.NO_ERROR) {
            Logger.error(`WebGL error setting blendMode uniform:`, error);
          }
        } else {
          Logger.error(`Could not find uniform location for u_blendMode in ${node.name}`);
        }
      } else if (key === 'colorPalette' && node.type === 'Oscillator') {
        // Handle color palette for oscillator
        const palette = colorPalettes[value];
        if (palette) {
          // Convert hex colors to RGB
          const paletteRGB = palette.map(hexToRgb).filter(Boolean);

          // Set individual color uniforms (up to 8 colors)
          for (let i = 0; i < 8; i++) {
            const colorLoc = gl.getUniformLocation(program, `u_color${i}`);
            if (colorLoc) {
              if (i < paletteRGB.length) {
                const color = paletteRGB[i];
                gl.uniform3f(colorLoc, color.r, color.g, color.b);
              } else {
                // Use last color for padding
                const lastColor = paletteRGB[paletteRGB.length - 1] || { r: 1, g: 1, b: 1 };
                gl.uniform3f(colorLoc, lastColor.r, lastColor.g, lastColor.b);
              }
            }
          }

          // Set palette size
          const sizeLoc = gl.getUniformLocation(program, 'u_palettesize');
          if (sizeLoc) {
            gl.uniform1f(sizeLoc, Math.min(paletteRGB.length, 8));
          }
        } else {
          Logger.error('Color palette not found:', value);
        }
      }
    }
  });

  // Special handling for new nodes with color parameters
  if (node.type === 'RadialGradient') {
    // Inner color
    const innerColorHex = node.params.innerColor.replace('#', '');
    const innerR = parseInt(innerColorHex.substr(0, 2), 16) / 255;
    const innerG = parseInt(innerColorHex.substr(2, 2), 16) / 255;
    const innerB = parseInt(innerColorHex.substr(4, 2), 16) / 255;
    const innerLoc = gl.getUniformLocation(program, 'u_innerColor');
    if (innerLoc) {
      gl.uniform3f(innerLoc, innerR, innerG, innerB);
    }
    
    // Outer color
    const outerColorHex = node.params.outerColor.replace('#', '');
    const outerR = parseInt(outerColorHex.substr(0, 2), 16) / 255;
    const outerG = parseInt(outerColorHex.substr(2, 2), 16) / 255;
    const outerB = parseInt(outerColorHex.substr(4, 2), 16) / 255;
    const outerLoc = gl.getUniformLocation(program, 'u_outerColor');
    if (outerLoc) {
      gl.uniform3f(outerLoc, outerR, outerG, outerB);
    }
  }
  
  if (node.type === 'Text') {
    // Fill color
    const fillColorHex = node.params.fillColor.replace('#', '');
    const fillR = parseInt(fillColorHex.substr(0, 2), 16) / 255;
    const fillG = parseInt(fillColorHex.substr(2, 2), 16) / 255;
    const fillB = parseInt(fillColorHex.substr(4, 2), 16) / 255;
    const fillLoc = gl.getUniformLocation(program, 'u_fillColor');
    if (fillLoc) {
      gl.uniform3f(fillLoc, fillR, fillG, fillB);
    }
  }
  
  if (node.type === 'Mirror') {
    // Convert mode string to numeric value
    const modeValue = node.params.mode === 'horizontal' ? 0 : 
                      node.params.mode === 'vertical' ? 1 : 2; // radial
    const modeLoc = gl.getUniformLocation(program, 'u_mode');
    if (modeLoc) {
      gl.uniform1f(modeLoc, modeValue);
    }
  }
  

  // Special handling for Transform node vec2 uniforms
  if (node.type === 'Transform') {
    const posLoc = gl.getUniformLocation(program, 'u_position');
    if (posLoc) {
      gl.uniform2f(posLoc, node.params.positionX || 0.0, node.params.positionY || 0.0);
    }

    const scaleLoc = gl.getUniformLocation(program, 'u_scale');
    if (scaleLoc) {
      gl.uniform2f(scaleLoc, node.params.scaleX || 1.0, node.params.scaleY || 1.0);
    }
  }
  
  // Special handling for Composite node
  if (node.type === 'Composite') {
    // Count how many inputs are connected
    const activeInputs = node.inputs.filter(input => input !== null).length;
    Logger.debug(`Composite node ${node.name}: ${activeInputs} active inputs`);
    
    const activeInputsLoc = gl.getUniformLocation(program, 'u_activeInputs');
    if (activeInputsLoc) {
      gl.uniform1i(activeInputsLoc, activeInputs);
      Logger.debug(`Set u_activeInputs to ${activeInputs}`);
    } else {
      Logger.warn(`Could not find u_activeInputs uniform for Composite node ${node.name}`);
    }
    
    // Set opacity uniforms
    for (let i = 1; i <= 4; i++) {
      const opacityLoc = gl.getUniformLocation(program, `u_opacity${i}`);
      if (opacityLoc) {
        const opacityValue = node.params[`opacity${i}`] || 1.0;
        gl.uniform1f(opacityLoc, opacityValue);
        Logger.debug(`Set u_opacity${i} to ${opacityValue}`);
      }
    }
  }

  // Special handling for Camera node
  if (node.type === 'Camera' && node.video && node.video.videoWidth > 0) {
    const videoSizeLoc = gl.getUniformLocation(program, 'u_videoSize');
    if (videoSizeLoc) {
      gl.uniform2f(videoSizeLoc, node.video.videoWidth, node.video.videoHeight);
    }
  }
  
  // Special handling for input nodes
  if (node.category === 'input') {
    const valueLoc = gl.getUniformLocation(program, 'u_value');
    if (valueLoc) {
      gl.uniform1f(valueLoc, node.currentValue || 0.0);
    }

    const colorLoc = gl.getUniformLocation(program, 'u_color');
    if (colorLoc) {
      // Different colors for different input types
      const colors = {
        'MIDIInput': [1.0, 0.7, 0.0],    // Orange
        'AudioInput': [0.0, 1.0, 0.5],   // Green
        'CursorInput': [0.5, 0.5, 1.0],  // Blue
        'CameraInput': [1.0, 0.5, 1.0]   // Purple
      };
      const color = colors[node.type] || [1.0, 1.0, 1.0];
      gl.uniform3f(colorLoc, color[0], color[1], color[2]);
    }
  }

}

/**
 * Bind input textures for a node
 * *** SINGLE SOURCE OF TRUTH ***
 */
function bindNodeInputTextures(node) {
  // CRITICAL FIX: For multi-texture nodes, bind ALL textures FIRST, then set uniforms
  // This ensures all texture units remain bound when the shader executes

  if (node.type === 'Layer' || node.type === 'Composite') {
    Logger.info(`Binding textures for ${node.type} ${node.name}:`);
  }

  // Special handling for Camera and VideoFileInput nodes - they use their own texture
  if ((node.type === 'Camera' || node.type === 'VideoFileInput')) {
    Logger.trace(`${node.type} Texture Binding Debug`);
    
    // Both Camera and VideoFileInput nodes use videoTexture for input
    const textureToUse = node.videoTexture;
    
    if (!textureToUse || !gl.isTexture(textureToUse)) {
      Logger.error(`${node.type} has invalid or missing texture`);
      return;
    }
    
    // Check current program
    const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
    Logger.debug(`Current program: ${currentProgram}, node.program: ${node.program}`);
    
    if (currentProgram !== node.program) {
      Logger.error(`Program mismatch! Current: ${currentProgram}, Expected: ${node.program}`);
    }
    
    Logger.debug(`${node.type} binding its ${node.type === 'Camera' ? 'video' : 'own'} texture`);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textureToUse);
    
    // Check for texture binding errors
    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
      Logger.error(`${node.type} texture binding error:`, error);
      return;
    }
    
    const texLoc = gl.getUniformLocation(node.program, 'u_texture');
    Logger.debug(`${node.type} u_texture location: ${texLoc}`);
    if (texLoc !== null && texLoc !== -1) {
      gl.uniform1i(texLoc, 0);
      
      // Check for uniform setting errors
      error = gl.getError();
      if (error !== gl.NO_ERROR) {
        Logger.error(`${node.type} uniform setting error:`, error);
      } else {
        Logger.debug(`${node.type} set u_texture uniform to texture unit 0 successfully`);
      }
    } else {
      Logger.error(`${node.type} could not find u_texture uniform in shader`);
    }
    
    Logger.trace(`End ${node.type} Texture Binding`);
    return; // Camera/VideoFileInput nodes don't have inputs
  }

  // First pass: Bind all textures to their respective texture units
  const textureBindings = [];
  node.inputs.forEach((inputNode, index) => {
    if (inputNode && inputNode.texture && !inputNode.deleted) {
      // PREVENT FEEDBACK LOOP: Enhanced detection for Mix/Layer nodes
      if (inputNode === node) {
        Logger.warn(`Preventing direct feedback loop: ${node.name} cannot use itself as input`);
        // Use fallback texture instead of skipping
        const fallback = createFallbackTexture();
        if (fallback) {
          gl.activeTexture(gl.TEXTURE0 + index);
          gl.bindTexture(gl.TEXTURE_2D, fallback);
          textureBindings.push({
            unit: gl.TEXTURE0 + index,
            texture: fallback,
            index: index
          });
        }
        return;
      }

      // PREVENT INDIRECT FEEDBACK LOOP: Check if inputNode depends on current node
      if (nodeHasDependency(inputNode, node)) {
        Logger.warn(`Preventing indirect feedback loop: ${node.name} -> ${inputNode.name} -> ... -> ${node.name}`);
        // Use fallback texture instead of skipping
        const fallback = createFallbackTexture();
        if (fallback) {
          gl.activeTexture(gl.TEXTURE0 + index);
          gl.bindTexture(gl.TEXTURE_2D, fallback);
          textureBindings.push({
            unit: gl.TEXTURE0 + index,
            texture: fallback,
            index: index
          });
        }
        return;
      }

      // Validate texture before binding
      if (!gl.isTexture(inputNode.texture)) {
        Logger.warn(`Input node ${inputNode.name} has invalid texture - using fallback`);
        inputNode.texture = createFallbackTexture();
        if (!inputNode.texture) {
          Logger.error(`Failed to create fallback texture for ${inputNode.name}`);
          return;
        }
      }

      // Activate and bind texture to its unit
      const textureUnit = index;
      gl.activeTexture(gl.TEXTURE0 + textureUnit);
      gl.bindTexture(gl.TEXTURE_2D, inputNode.texture);

      if (node.type === 'Layer' || node.type === 'Composite') {
        Logger.info(`  Texture unit ${textureUnit}: ${inputNode.name}`);
      }

      // Store binding info for uniform setting
      textureBindings.push({
        index: index,
        textureUnit: textureUnit,
        inputNode: inputNode
      });
    }
  });

  // For multi-input nodes, ensure all expected texture slots are filled
  const isMultiInputNode = node.type === 'Mix' || node.type === 'Layer' || node.type === 'Composite';
  if (isMultiInputNode) {
    const expectedInputs = node.type === 'Composite' ? 4 : 2;
    
    // Fill any missing texture slots with fallback textures
    for (let i = 0; i < expectedInputs; i++) {
      const hasBinding = textureBindings.some(b => b.index === i);
      if (!hasBinding) {
        const fallback = createFallbackTexture();
        if (fallback) {
          gl.activeTexture(gl.TEXTURE0 + i);
          gl.bindTexture(gl.TEXTURE_2D, fallback);
          textureBindings.push({
            index: i,
            textureUnit: i,
            texture: fallback
          });
          Logger.debug(`Bound fallback texture to unit ${i} for missing input`);
        }
      }
    }
  }

  // Second pass: Set all uniforms AFTER all textures are bound
  textureBindings.forEach(binding => {
    const isMultiInputNode = node.type === 'Mix' || node.type === 'Layer' || node.type === 'Composite';
    
    const uniformName = isMultiInputNode
      ? `u_texture${binding.index + 1}`          // u_texture1,2,3...
      : (binding.index === 0
           ? 'u_texture'                         // first (and often only) inlet
           : `u_texture${binding.index + 1}`);   // future extra ports

    const loc = gl.getUniformLocation(node.program, uniformName);
    if (loc !== null && loc !== -1) {
      gl.uniform1i(loc, binding.textureUnit);

      if (node.type === 'Layer' || node.type === 'Composite') {
        // Verify the uniform was set correctly
        const uniformValue = gl.getUniform(node.program, loc);
        Logger.info(`  ${uniformName} uniform set to: ${uniformValue}`);
      }
    } else {
      // Only warn if this is actually an expected uniform (not just an unconnected optional input)
      if (binding.index < 2 || node.type === 'Composite') { // First 2 inputs or Composite node
        Logger.warn(`Could not find uniform ${uniformName} for ${node.name}`);
      }
    }
  });
  
  // Special handling for FeedbackTrail's feedback texture
  if (node.type === 'FeedbackTrail' && node.feedbackTexture) {
    const feedbackLoc = gl.getUniformLocation(node.program, 'u_feedbackTexture');
    if (feedbackLoc) {
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, node.feedbackTexture);
      gl.uniform1i(feedbackLoc, 1);
    }
  }
}

/**
 * Check if a node has a dependency on another node (prevents circular dependencies)
 */
function nodeHasDependency(node, targetNode, visited = new Set()) {
  // Prevent infinite recursion
  if (visited.has(node)) {
    return false;
  }
  visited.add(node);

  // Check if any of this node's inputs depend on the target
  for (const inputNode of node.inputs) {
    if (inputNode) {
      if (inputNode === targetNode) {
        return true; // Direct dependency found
      }
      if (nodeHasDependency(inputNode, targetNode, visited)) {
        return true; // Indirect dependency found
      }
    }
  }

  return false;
}

function bindQuad() {
  // Check if quad buffer exists
  if (!quadBuffer.buf) {
    Logger.error('bindQuad called but quadBuffer not initialized');
    return;
  }
  
  const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
  if (!currentProgram) {
    Logger.error('bindQuad called with no active shader program');
    return;
  }
  
  const posLoc = gl.getAttribLocation(currentProgram, "a_position");
  if (posLoc === -1) {
    Logger.error('a_position attribute not found in current shader program');
    return;
  }
  
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer.buf);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
}

/**
 * Utility functions
 */
function setMainOutput(node) {
  mainOutputNode = node;
  updateMainOutputDropdown();
  updateMainOutputVisualIndicator();
}

function updateMainOutputDropdown() {
  const select = document.getElementById('main-output-select');
  if (!select) return; // Guard against missing DOM element

  // Find the Canvas node (formerly Final Output)
  const canvasDisplayNode = nodes.find(n => n.type === 'FinalOutput');
  if (!canvasDisplayNode) return; // Guard against missing node

  // Always use Canvas as the main output (it shows whatever is connected to it)
  mainOutputNode = canvasDisplayNode;

  select.innerHTML = '<option value="">None</option>';

  // Show what's currently connected to Canvas
  const connectedNode = canvasDisplayNode.inputs && canvasDisplayNode.inputs[0];
  if (connectedNode && connectedNode.name) {
    const connectedOption = document.createElement('option');
    connectedOption.value = connectedNode.id;
    connectedOption.textContent = connectedNode.name;
    connectedOption.selected = true;
    select.appendChild(connectedOption);
  }

  // Add all other non-system nodes as options
  nodes.forEach(node => {
    if (node && node.category !== 'system' && node !== connectedNode && node.name) {
      const option = document.createElement('option');
      option.value = node.id;
      option.textContent = node.name;
      select.appendChild(option);
    }
  });

  select.onchange = (e) => {
    const canvasDisplayNode = nodes.find(n => n.type === 'FinalOutput');
    if (!canvasDisplayNode) return;

    if (e.target.value === '') {
      // Disconnect from Canvas
      canvasDisplayNode.inputs[0] = null;
    } else {
      // Connect selected node to Canvas
      const nodeId = parseInt(e.target.value);
      const nodeToConnect = nodes.find(n => n.id === nodeId);
      if (nodeToConnect) {
        canvasDisplayNode.inputs[0] = nodeToConnect;
      }
    }

    updateConnections();
      saveState('Change Canvas Input');
  };

}


function updateMainOutputVisualIndicator() {
  // Remove main-output class from all nodes
  nodes.forEach(node => {
    if (node.element) {
      node.element.classList.remove('main-output');
    }
  });

  // Add main-output class to the current main output node
  if (mainOutputNode && mainOutputNode.element) {
    mainOutputNode.element.classList.add('main-output');
  }

  // Update connections to highlight main output path
  updateConnections();
}

function handleResolutionChange(resolution) {
  const sizes = {
    'Low': [640, 360],
    'Medium': [854, 480],
    'High': [1280, 720],
    'Ultra': [1920, 1080]
  };

  const [w, h] = sizes[resolution] || sizes['Medium'];
  canvas.width = w;
  canvas.height = h;
  gl.viewport(0, 0, w, h);

  // Reallocate node FBOs
  nodes.forEach(node => {
    if (node.fbo) {
      gl.deleteFramebuffer(node.fbo);
      gl.deleteTexture(node.texture);
      allocateNodeFBO(node);
    }
  });
}

function fitGraphToView() {
  // Auto-arrange nodes in a grid (EXCLUDE Canvas node to preserve its lower-right positioning)
  const nodesToFit = nodes.filter(n => n.name !== 'Canvas');

  nodesToFit.forEach((node, index) => {
    const cols = Math.ceil(Math.sqrt(nodesToFit.length));
    const col = index % cols;
    const row = Math.floor(index / cols);

    // Increased spacing for better visibility
    node.x = 80 + col * 300;  // Increased from 250 to 300
    node.y = 80 + row * 200;  // Increased from 150 to 200

    if (node.element) {
      node.element.style.left = node.x + 'px';
      node.element.style.top = node.y + 'px';
    }
  });

  Logger.debug(`fitGraphToView: Arranged ${nodesToFit.length} nodes in grid (Canvas excluded)`);
  updateConnections();
}

function createGroup(name) {
  const group = new NodeGroup(name);
  groups[name] = group;
  updateGroupsList();
  return group;
}

function updateGroupsList() {
  const container = document.getElementById('groups-list');
  container.innerHTML = '';

  Object.values(groups).forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'group-item';
    groupEl.innerHTML = `
      <span class="group-name">${group.name}</span>
      <button class="group-copy-btn" title="Copy Group">
        <span class="material-icons">content_copy</span>
      </button>
      <div class="group-toggle ${group.enabled ? 'enabled' : ''}"></div>
    `;

    const toggle = groupEl.querySelector('.group-toggle');
    toggle.addEventListener('click', () => {
      group.enabled = !group.enabled;
      toggle.classList.toggle('enabled', group.enabled);
    });

    const copyBtn = groupEl.querySelector('.group-copy-btn');
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyGroup(group.name);
    });

    container.appendChild(groupEl);
  });
}

/**
 * MIDI initialization
 */
function initMIDI() {
  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({ sysex: false })
      .then(midi => {
        midiAccess = midi;
        const inputs = midiAccess.inputs.values();
        for (let input of inputs) {
          midiIn = input;
          break;
        }
        if (midiIn) {
          midiIn.onmidimessage = handleMIDIMessage;
          Logger.info("Connected to MIDI device:", midiIn.name);
        }
      })
      .catch(err => Logger.warn("MIDI access failed:", err));
  }
}

function handleMIDIMessage(msg) {
  const data = msg.data;
  const status = data[0] & 0xF0;

  if (status === 0xB0) {
    const ccNum = data[1];
    const ccVal = data[2];
    lastMidiCC = ccNum;

    document.getElementById('midi-cc').textContent = ccNum;

    // Handle control input mappings
    if (controlInputs.midi[ccNum]) {
      const mapping = controlInputs.midi[ccNum];
      // Direct value from MIDI CC (0-127)
      applyControlInput(mapping.nodeId, mapping.param, ccVal);
    }

    if (midiMappings[ccNum]) {
      midiMappings[ccNum](ccVal);
    }
  }
}

/**
 * Initialize Audio API and microphone input
 */
function initAudio() {
  // Audio controls are now integrated into individual AudioInput node properties
  // No global audio section needed anymore
}

/**
 * Get audio level for a specific band
 */
function getAudioLevel(band) {
  if (!audioEnabled || !audioBands[band]) return 0;
  
  // Return the normalized value (0-1) for the requested band
  return audioBands[band].value || 0;
}

/**
 * Analyze audio input with advanced processing
 */
function analyzeAudio() {
  if (!audioEnabled || !analyser) return;

  analyser.getByteFrequencyData(frequencyData);

  const sampleRate = audioContext.sampleRate;
  const nyquist = sampleRate / 2;
  const binWidth = nyquist / frequencyData.length;

  // Get time domain data for RMS and peak calculation
  const timeData = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(timeData);

  // Reset band values
  Object.keys(audioBands).forEach(band => {
    audioBands[band].value = 0;
    audioBands[band].rms = 0;
    audioBands[band].peak = 0;
  });

  let overallSum = 0;
  let overallRmsSum = 0;
  let overallPeak = 0;
  let totalBins = 0;

  // Analyze each frequency bin
  for (let i = 0; i < frequencyData.length; i++) {
    const frequency = i * binWidth;
    const amplitude = frequencyData[i] / 255; // Normalize to 0-1

    overallSum += amplitude;
    totalBins++;

    // Distribute into frequency bands
    Object.keys(audioBands).forEach(bandName => {
      const band = audioBands[bandName];
      if (band.min !== undefined && frequency >= band.min && frequency <= band.max) {
        band.value = Math.max(band.value, amplitude);
      }
    });
  }

  // Calculate RMS and peak from time domain data
  for (let i = 0; i < timeData.length; i++) {
    const sample = timeData[i];
    overallRmsSum += sample * sample;
    overallPeak = Math.max(overallPeak, Math.abs(sample));
  }

  // Calculate overall metrics
  audioBands.overall.value = overallSum / totalBins;
  audioBands.overall.rms = Math.sqrt(overallRmsSum / timeData.length);
  audioBands.overall.peak = overallPeak;

  // Calculate approximate LUFS (simplified EBU R128)
  audioBands.overall.lufs = calculateLUFS(audioBands.overall.rms);

  // Store analysis data for LUFS averaging
  audioAnalysisBuffer.push({
    rms: audioBands.overall.rms,
    timestamp: Date.now()
  });

  // Keep only last 3 seconds of data for LUFS
  const now = Date.now();
  audioAnalysisBuffer = audioAnalysisBuffer.filter(data => now - data.timestamp < 3000);

  // Update peak hold
  peakHoldTime = Math.max(peakHoldTime - 16, overallPeak * 1000); // 16ms decay

  // Apply audio control mappings with different metrics
  Object.keys(controlInputs.audio).forEach(bandName => {
    const mappings = controlInputs.audio[bandName];
    if (!mappings) return;

    mappings.forEach(mapping => {
      let bandValue = 0;

      // Select metric based on mapping type
      if (bandName.includes('rms')) {
        bandValue = audioBands[bandName.replace('_rms', '')]?.rms || audioBands.overall.rms;
      } else if (bandName.includes('peak')) {
        bandValue = audioBands[bandName.replace('_peak', '')]?.peak || audioBands.overall.peak;
      } else if (bandName === 'lufs') {
        bandValue = (audioBands.overall.lufs + 70) / 70; // Normalize LUFS to 0-1
      } else {
        bandValue = audioBands[bandName]?.value || 0;
      }

      // Direct value from audio analysis (already normalized 0-1)
      applyControlInput(mapping.nodeId, mapping.param, bandValue);
    });
  });

  // Update visual meters
  updateAudioMeters();
}

/**
 * Start continuous color analysis
 */
function startColorAnalysis() {
  function analyzeColors() {
    updateColorComponents();
    requestAnimationFrame(analyzeColors);
  }
  analyzeColors();
}

/**
 * Start continuous audio analysis
 */
function startAudioAnalysis() {
  function updateAudio() {
    if (audioEnabled) {
      analyzeAudio();
    }
    requestAnimationFrame(updateAudio);
  }
  updateAudio();
}

/**
 * Update debug panel with real-time info
 */
function updateDebugPanel(type, data) {
  const debugContent = document.getElementById('debug-content');
  if (!debugContent) return;

  if (type === 'layer') {
    debugContent.innerHTML = `
      <div style="color: #6366f1; font-weight: bold;">Layer: ${data.name}</div>
      <div>Blend Mode: <span style="color: #8b5cf6;">${data.blendMode}</span></div>
      <div>Opacity: <span style="color: #8b5cf6;">${data.opacity}</span></div>
      <div>Input 1: <span style="color: ${data.input1HasTexture ? '#10b981' : '#ef4444'};">${data.input1} ${data.input1HasTexture ? '✓' : '✗'}</span></div>
      <div>Input 2: <span style="color: ${data.input2HasTexture ? '#10b981' : '#ef4444'};">${data.input2} ${data.input2HasTexture ? '✓' : '✗'}</span></div>
      <div>Program: <span style="color: ${data.hasProgram ? '#10b981' : '#ef4444'};">${data.hasProgram ? 'Loaded ✓' : 'Missing ✗'}</span></div>
      <div style="font-size: 10px; color: #71717a; margin-top: 4px;">Last update: ${new Date().toLocaleTimeString()}</div>
    `;
  }
}

/**
 * Update visual level meters
 */
function updateAudioMeters() {
  const bassBar = document.getElementById('bass-meter');
  const overallBar = document.getElementById('overall-meter');
  const lufsDisplay = document.getElementById('lufs-display');

  if (bassBar) {
    const bassLevel = Math.min(100, audioBands.bass.value * 100);
    bassBar.style.width = `${bassLevel}%`;
    bassBar.style.backgroundColor = bassLevel > 80 ? '#ef4444' : bassLevel > 60 ? '#f59e0b' : '#10b981';
  }

  if (overallBar) {
    const overallLevel = Math.min(100, audioBands.overall.rms * 200);
    overallBar.style.width = `${overallLevel}%`;
    overallBar.style.backgroundColor = overallLevel > 80 ? '#ef4444' : overallLevel > 60 ? '#f59e0b' : '#10b981';
  }

  if (lufsDisplay) {
    const lufs = audioBands.overall.lufs;
    lufsDisplay.textContent = lufs <= -70 ? '-∞' : `${lufs.toFixed(1)}`;
    lufsDisplay.style.color = lufs > -23 ? '#ef4444' : lufs > -32 ? '#f59e0b' : '#10b981';
  }
}

/**
 * Calculate LUFS using simplified EBU R128
 */
function calculateLUFS(rmsValue) {
  if (rmsValue === 0) return -70; // Silence threshold

  // Simplified LUFS calculation (not full EBU R128 but close approximation)
  const lufs = 20 * Math.log10(rmsValue) - 0.691;
  return Math.max(-70, Math.min(0, lufs)); // Clamp to reasonable range
}

/**
 * Start continuous audio analysis
 */
function startAudioAnalysis() {
  function analyze() {
    analyzeAudio();
    requestAnimationFrame(analyze);
  }
  analyze();
}

/**
 * Apply control input value to a node parameter
 */
function applyControlInput(nodeId, paramName, value) {
  const node = nodes.find(n => n.id === nodeId);
  if (node && node.params.hasOwnProperty(paramName)) {
    // Get parameter constraints to determine the type
    const constraints = getParameterConstraints(paramName);
    
    // Apply the value directly - what the control outputs is what gets applied
    if (paramName === 'colorPalette') {
      // For discrete string parameters, round to nearest integer index
      const paletteNames = Object.keys(colorPalettes);
      const index = Math.round(value);
      const clampedIndex = Math.max(0, Math.min(index, paletteNames.length - 1));
      node.params[paramName] = paletteNames[clampedIndex];
    } else if (constraints && constraints.type === 'integer') {
      // For integer parameters, round the value
      node.params[paramName] = Math.round(value);
    } else if (constraints && constraints.type === 'boolean') {
      // For boolean parameters, treat > 0.5 as true
      node.params[paramName] = value > 0.5;
    } else if (constraints && constraints.values) {
      // For discrete enum parameters, round to nearest index
      const values = constraints.values;
      const index = Math.round(value);
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      node.params[paramName] = values[clampedIndex];
    } else {
      // For continuous numeric parameters, use the value directly
      node.params[paramName] = value;
    }
    
    updateNodeProperties(node); // Refresh UI if node is selected

    // Save state for parameter changes
    clearTimeout(parameterChangeTimeout);
    parameterChangeTimeout = setTimeout(() => {
      saveState(`Control Change ${paramName}`);
    }, 1000);
  }
}

/**
 * COLOR ANALYSIS SYSTEM
 */

/**
 * Convert hex color to RGB components
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null;
}

/**
 * Convert RGB to HSB
 */
function rgbToHsb(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  if (diff !== 0) {
    if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : diff / max;
  const brightness = max;

  return { h, s, b: brightness };
}

/**
 * Calculate luminance from RGB
 */
function calculateLuminance(r, g, b) {
  // Using relative luminance formula
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Get current color from oscillator palette
 */
function getCurrentOscillatorColor(node) {
  if (node.type !== 'Oscillator' || !node.params.colorPalette) {
    return { r: 1, g: 1, b: 1 }; // White fallback
  }

  const palette = colorPalettes[node.params.colorPalette];
  if (!palette) return { r: 1, g: 1, b: 1 };

  // Calculate current color index based on time and colorSpeed
  const elapsed = (Date.now() - startTime) / 1000.0;
  const animatedIndex = (node.params.colorIndex + elapsed * node.params.colorSpeed) % palette.length;
  const colorIndex = Math.floor(animatedIndex);
  const nextColorIndex = (colorIndex + 1) % palette.length;
  const t = animatedIndex - colorIndex;

  // Interpolate between current and next color
  const currentColor = hexToRgb(palette[colorIndex]);
  const nextColor = hexToRgb(palette[nextColorIndex]);

  if (!currentColor || !nextColor) return { r: 1, g: 1, b: 1 };

  return {
    r: currentColor.r + (nextColor.r - currentColor.r) * t,
    g: currentColor.g + (nextColor.g - currentColor.g) * t,
    b: currentColor.b + (nextColor.b - currentColor.b) * t
  };
}

/**
 * Update color components from active oscillators
 */
function updateColorComponents() {
  // Reset all color components
  Object.keys(colorComponents).forEach(key => {
    colorComponents[key].value = 0;
  });

  // Find active oscillator nodes and blend their colors
  const activeOscillators = nodes.filter(node =>
    node.type === 'Oscillator' && node.enabled &&
    (!node.groupName || groups[node.groupName]?.enabled !== false)
  );

  if (activeOscillators.length === 0) return;

  // Average the color components from all active oscillators
  let totalR = 0, totalG = 0, totalB = 0;

  activeOscillators.forEach(node => {
    const color = getCurrentOscillatorColor(node);
    totalR += color.r;
    totalG += color.g;
    totalB += color.b;
  });

  const avgR = totalR / activeOscillators.length;
  const avgG = totalG / activeOscillators.length;
  const avgB = totalB / activeOscillators.length;

  // Update RGB components
  colorComponents.red.value = avgR;
  colorComponents.green.value = avgG;
  colorComponents.blue.value = avgB;

  // Convert to HSB
  const hsb = rgbToHsb(avgR, avgG, avgB);
  colorComponents.hue.value = hsb.h;
  colorComponents.saturation.value = hsb.s;
  colorComponents.brightness.value = hsb.b;

  // Calculate luminance
  colorComponents.luminance.value = calculateLuminance(avgR, avgG, avgB);

  // Apply color control mappings
  Object.keys(controlInputs.color).forEach(componentName => {
    const mappings = controlInputs.color[componentName];
    const componentValue = colorComponents[componentName]?.value || 0;

    mappings.forEach(mapping => {
      // Direct value from color component
      applyControlInput(mapping.nodeId, mapping.param, componentValue);
    });
  });
}

/**
 * CURSOR INPUT SYSTEM
 */

/**
 * Initialize cursor tracking system
 */
function initCursor() {
  // Create cursor input section in right sidebar
  const rightSidebar = document.getElementById('right-sidebar');
  const cursorSection = document.createElement('div');
  cursorSection.className = 'sidebar-section';
  cursorSection.innerHTML = `
    <h4>Cursor Input</h4>
    <div class="midi-info">
      <div>X: <span id="cursor-x">0.0</span></div>
      <div>Y: <span id="cursor-y">0.0</span></div>
      <div>Velocity: <span id="cursor-velocity">0.0</span></div>
      <div>Click: <span id="cursor-click">0</span></div>
    </div>
  `;

  // Insert after MIDI section
  const midiSection = rightSidebar.querySelector('.sidebar-section:last-child');
  midiSection.parentNode.insertBefore(cursorSection, midiSection.nextSibling);

  Logger.info('Cursor input system initialized');
}

/**
 * Start cursor tracking
 */
function startCursorTracking() {
  let lastMousePos = { x: 0, y: 0 };
  let lastTime = Date.now();
  let isMouseDown = false;

  const canvas = document.getElementById('glcanvas');

  // Track mouse movement
  document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Clamp to 0-1 range
    cursorComponents.x.value = Math.max(0, Math.min(1, x));
    cursorComponents.y.value = Math.max(0, Math.min(1, y));

    // Calculate velocity
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000; // seconds
    const deltaX = x - lastMousePos.x;
    const deltaY = y - lastMousePos.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / deltaTime;

    cursorComponents.velocity.value = Math.min(1, velocity); // Clamp to 0-1

    lastMousePos = { x, y };
    lastTime = now;

    updateCursorDisplay();
    applyCursorMappings();
  });

  // Track mouse clicks
  document.addEventListener('mousedown', () => {
    isMouseDown = true;
    cursorComponents.click.value = 1;
    updateCursorDisplay();
    applyCursorMappings();
  });

  document.addEventListener('mouseup', () => {
    isMouseDown = false;
    cursorComponents.click.value = 0;
    updateCursorDisplay();
    applyCursorMappings();
  });

  Logger.debug('Cursor tracking started');
}

/**
 * Update cursor display in UI
 */
function updateCursorDisplay() {
  document.getElementById('cursor-x').textContent = cursorComponents.x.value.toFixed(3);
  document.getElementById('cursor-y').textContent = cursorComponents.y.value.toFixed(3);
  document.getElementById('cursor-velocity').textContent = cursorComponents.velocity.value.toFixed(3);
  document.getElementById('cursor-click').textContent = cursorComponents.click.value.toString();
}

/**
 * Apply cursor control mappings
 */
function applyCursorMappings() {
  Object.keys(controlInputs.cursor).forEach(componentName => {
    const mappings = controlInputs.cursor[componentName];
    if (!mappings) return;

    const componentValue = cursorComponents[componentName]?.value || 0;

    mappings.forEach(mapping => {
      // Direct value from color component
      applyControlInput(mapping.nodeId, mapping.param, componentValue);
    });
  });
}

/**
 * CAMERA INPUT SYSTEM
 */

/**
 * Initialize camera input system
 */
function initCamera() {
  // Camera controls are now integrated into individual CameraInput node properties
  // No global camera section needed anymore
}

/**
 * Initialize gamepad support
 */
function initGamepad() {
  // Check for gamepad API support
  if (!navigator.getGamepads) {
    Logger.warn('Gamepad API not supported');
    return;
  }

  // Listen for gamepad connection events
  window.addEventListener('gamepadconnected', (e) => {
    Logger.info(`Gamepad connected: ${e.gamepad.id}`);
    gamepadState.controllers[e.gamepad.index] = e.gamepad;
    updateGamepadStatus();
  });

  window.addEventListener('gamepaddisconnected', (e) => {
    Logger.info(`Gamepad disconnected: ${e.gamepad.id}`);
    delete gamepadState.controllers[e.gamepad.index];
    updateGamepadStatus();
  });
  
  // Chrome requires a user gesture to enable gamepad API
  // Add click handler to detect controllers
  document.addEventListener('click', () => {
    if (!gamepadState.scanning) {
      gamepadState.scanning = true;
      const gamepads = navigator.getGamepads();
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          if (!gamepadState.controllers[i]) {
            Logger.info(`Gamepad detected after user interaction: ${gamepads[i].id}`);
            gamepadState.controllers[i] = gamepads[i];
            updateGamepadStatus();
          }
        }
      }
    }
  }, { once: false });
}

/**
 * Start polling for gamepad state
 */
function startGamepadPolling() {
  if (gamepadState.pollInterval) return;
  
  // Chrome requires user interaction before gamepad API works
  // Poll more frequently and check for new connections
  gamepadState.pollInterval = setInterval(() => {
    // Get current gamepad states
    const gamepads = navigator.getGamepads();
    let hasActiveController = false;
    
    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;
      
      hasActiveController = true;
      
      // Check if this is a new connection
      if (!gamepadState.controllers[i]) {
        Logger.info(`Gamepad detected: ${gamepad.id}`);
        gamepadState.controllers[i] = gamepad;
        updateGamepadStatus();
      }
      
      // Update stored state
      gamepadState.controllers[i] = gamepad;
      
      // Update component values
      updateGamepadComponents(gamepad);
    }
    
    // Check for disconnections
    Object.keys(gamepadState.controllers).forEach(index => {
      if (!gamepads[index]) {
        delete gamepadState.controllers[index];
        updateGamepadStatus();
      }
    });
  }, 16); // ~60fps polling
}

/**
 * Update gamepad component values
 */
function updateGamepadComponents(gamepad) {
  // Update button states
  gamepad.buttons.forEach((button, index) => {
    const componentKey = `button${index}`;
    if (controllerComponents[componentKey]) {
      // For buttons, value is pressure-sensitive (0-1)
      controllerComponents[componentKey].value = button.value;
    }
  });
  
  // Update axis states
  gamepad.axes.forEach((axis, index) => {
    const componentKey = `axis${index}`;
    if (controllerComponents[componentKey]) {
      // Axes range from -1 to 1, normalize to 0-1
      controllerComponents[componentKey].value = (axis + 1) / 2;
    }
  });
  
  // Update visualization if a GameControllerInput node is selected
  if (selectedNode && selectedNode.type === 'GameControllerInput') {
    updateControllerVisualization(gamepad);
  }
}

/**
 * Update controller visualization in real-time
 */
function updateControllerVisualization(gamepad) {
  if (!gamepad) return;
  
  const vizContainer = document.querySelector('.controller-visualization');
  if (!vizContainer || !selectedNode) return;
  
  // Update button states
  gamepad.buttons.forEach((button, index) => {
    const buttonEl = vizContainer.querySelector(`[data-button="${index}"]`);
    if (buttonEl) {
      if (button.pressed) {
        buttonEl.classList.add('pressed');
      } else {
        buttonEl.classList.remove('pressed');
      }
      
      // Update trigger opacity
      if (index === 6 || index === 7) {
        buttonEl.style.opacity = 0.3 + button.value * 0.7;
      }
    }
  });
  
  // Update stick positions
  const leftStick = vizContainer.querySelector('.stick-container:first-child .stick-position');
  if (leftStick) {
    leftStick.style.transform = `translate(${gamepad.axes[0] * 15}px, ${gamepad.axes[1] * 15}px)`;
    if (selectedNode.params.component === 'axis0' || selectedNode.params.component === 'axis1') {
      leftStick.classList.add('active');
    } else {
      leftStick.classList.remove('active');
    }
  }
  
  const rightStick = vizContainer.querySelector('.stick-container:last-child .stick-position');
  if (rightStick) {
    rightStick.style.transform = `translate(${gamepad.axes[2] * 15}px, ${gamepad.axes[3] * 15}px)`;
    if (selectedNode.params.component === 'axis2' || selectedNode.params.component === 'axis3') {
      rightStick.classList.add('active');
    } else {
      rightStick.classList.remove('active');
    }
  }
  
  // Highlight selected component
  const selectedComponent = selectedNode.params.component;
  vizContainer.querySelectorAll('[data-button]').forEach(el => {
    el.classList.remove('selected-input');
  });
  
  if (selectedComponent.startsWith('button')) {
    const buttonIndex = parseInt(selectedComponent.substring(6));
    const selectedButton = vizContainer.querySelector(`[data-button="${buttonIndex}"]`);
    if (selectedButton) {
      selectedButton.classList.add('selected-input');
    }
  }
}

/**
 * Update gamepad connection status UI
 */
function updateGamepadStatus() {
  const connectedCount = Object.keys(gamepadState.controllers).length;
  
  // Update any GameControllerInput nodes
  nodes.forEach(node => {
    if (node.type === 'GameControllerInput' && node.element) {
      const statusEl = node.element.querySelector('.controller-status');
      if (statusEl) {
        statusEl.textContent = connectedCount > 0 ? '🎮' : '⚠️';
        statusEl.title = connectedCount > 0 ? 
          `${connectedCount} controller(s) connected` : 
          'No controllers connected';
      }
    }
  });
  
  // Update properties panel if a GameControllerInput node is selected
  if (selectedNode && selectedNode.type === 'GameControllerInput') {
    showNodeProperties(selectedNode);
  }
  
  // Update permission UI if needed
  updatePermissionUI();
}

/**
 * Create controller visualization HTML
 */
function createControllerVisualization(gamepad, selectedComponent) {
  if (!gamepad) return '';
  
  let html = '<div class="controller-viz-container">';
  
  // D-Pad and face buttons container
  html += '<div class="controller-main">';
  
  // Left side - D-Pad
  html += '<div class="controller-dpad">';
  html += `<div class="dpad-button dpad-up ${gamepad.buttons[12]?.pressed ? 'pressed' : ''}" data-button="12">↑</div>`;
  html += `<div class="dpad-button dpad-left ${gamepad.buttons[14]?.pressed ? 'pressed' : ''}" data-button="14">←</div>`;
  html += `<div class="dpad-button dpad-right ${gamepad.buttons[15]?.pressed ? 'pressed' : ''}" data-button="15">→</div>`;
  html += `<div class="dpad-button dpad-down ${gamepad.buttons[13]?.pressed ? 'pressed' : ''}" data-button="13">↓</div>`;
  html += '</div>';
  
  // Center - Sticks
  html += '<div class="controller-sticks">';
  
  // Left stick
  html += '<div class="stick-container">';
  html += '<div class="stick-base">';
  const leftX = gamepad.axes[0] || 0;
  const leftY = gamepad.axes[1] || 0;
  html += `<div class="stick-position ${selectedComponent === 'axis0' || selectedComponent === 'axis1' ? 'active' : ''}" 
           style="transform: translate(${leftX * 15}px, ${leftY * 15}px);"></div>`;
  html += '</div>';
  html += '<div class="stick-label">L</div>';
  html += '</div>';
  
  // Right stick
  html += '<div class="stick-container">';
  html += '<div class="stick-base">';
  const rightX = gamepad.axes[2] || 0;
  const rightY = gamepad.axes[3] || 0;
  html += `<div class="stick-position ${selectedComponent === 'axis2' || selectedComponent === 'axis3' ? 'active' : ''}" 
           style="transform: translate(${rightX * 15}px, ${rightY * 15}px);"></div>`;
  html += '</div>';
  html += '<div class="stick-label">R</div>';
  html += '</div>';
  
  html += '</div>';
  
  // Right side - Face buttons
  html += '<div class="controller-face-buttons">';
  html += `<div class="face-button button-y ${gamepad.buttons[3]?.pressed ? 'pressed' : ''}" data-button="3">Y</div>`;
  html += `<div class="face-button button-x ${gamepad.buttons[2]?.pressed ? 'pressed' : ''}" data-button="2">X</div>`;
  html += `<div class="face-button button-b ${gamepad.buttons[1]?.pressed ? 'pressed' : ''}" data-button="1">B</div>`;
  html += `<div class="face-button button-a ${gamepad.buttons[0]?.pressed ? 'pressed' : ''}" data-button="0">A</div>`;
  html += '</div>';
  
  html += '</div>';
  
  // Shoulders and triggers
  html += '<div class="controller-shoulders">';
  html += `<div class="shoulder-button lb ${gamepad.buttons[4]?.pressed ? 'pressed' : ''}" data-button="4">LB</div>`;
  html += `<div class="trigger lt ${gamepad.buttons[6]?.pressed ? 'pressed' : ''}" data-button="6" 
           style="opacity: ${0.3 + gamepad.buttons[6]?.value * 0.7};">LT</div>`;
  html += `<div class="trigger rt ${gamepad.buttons[7]?.pressed ? 'pressed' : ''}" data-button="7" 
           style="opacity: ${0.3 + gamepad.buttons[7]?.value * 0.7};">RT</div>`;
  html += `<div class="shoulder-button rb ${gamepad.buttons[5]?.pressed ? 'pressed' : ''}" data-button="5">RB</div>`;
  html += '</div>';
  
  // Center buttons
  html += '<div class="controller-center-buttons">';
  html += `<div class="center-button select ${gamepad.buttons[8]?.pressed ? 'pressed' : ''}" data-button="8">SEL</div>`;
  html += `<div class="center-button start ${gamepad.buttons[9]?.pressed ? 'pressed' : ''}" data-button="9">START</div>`;
  html += '</div>';
  
  // Highlight selected component
  if (selectedComponent.startsWith('button')) {
    const buttonIndex = parseInt(selectedComponent.substring(6));
    html = html.replace(`data-button="${buttonIndex}"`, `data-button="${buttonIndex}" class="selected-input"`);
  }
  
  html += '</div>';
  
  return html;
}

/**
 * Initialize Control Input Manager
 */
function initControlInputManager() {
  const existingSelect = document.getElementById('existing-control-inputs');
  const newTypeSelect = document.getElementById('new-control-input-type');
  const statusSpan = document.getElementById('control-input-status');

  if (!existingSelect || !newTypeSelect || !statusSpan) {
    Logger.warn('Control Input Manager elements not found');
    return;
  }

  // Update existing control inputs when the dropdown is opened
  existingSelect.addEventListener('focus', updateExistingControlInputs);

  // Handle existing control input selection
  existingSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      const nodeId = parseInt(e.target.value);
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        selectNode(node);
        setControlInputStatus(`Selected ${node.name}`, 'success');
        // Reset selection after a moment
        setTimeout(() => {
          e.target.value = '';
          setControlInputStatus('Ready');
        }, 1500);
      }
    }
  });

  // Handle new control input type selection
  newTypeSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      createControlInputNode(e.target.value);
      e.target.value = ''; // Reset selection
    }
  });

  // Initial update
  updateExistingControlInputs();
}

/**
 * Update the existing control inputs dropdown
 */
function updateExistingControlInputs() {
  const select = document.getElementById('existing-control-inputs');
  if (!select) return;

  // Find all control input nodes in the graph
  const controlInputNodes = nodes.filter(node => node.category === 'input');

  select.innerHTML = '<option value="">Select to focus node...</option>';

  if (controlInputNodes.length === 0) {
    select.innerHTML = '<option value="">No control inputs in graph</option>';
    return;
  }

  // Group by type for better organization
  const nodesByType = {};
  controlInputNodes.forEach(node => {
    if (!nodesByType[node.type]) {
      nodesByType[node.type] = [];
    }
    nodesByType[node.type].push(node);
  });

  // Add options grouped by type
  Object.keys(nodesByType).sort().forEach(type => {
    const group = document.createElement('optgroup');
    group.label = getControlInputTypeLabel(type);

    nodesByType[type].forEach(node => {
      const option = document.createElement('option');
      option.value = node.id;
      option.textContent = node.name;
      group.appendChild(option);
    });

    select.appendChild(group);
  });
}

/**
 * Create a new control input node
 */
function createControlInputNode(type) {
  try {
    // Validate type
    const validTypes = ['MIDIInput', 'AudioInput', 'CursorInput', 'CameraInput', 'GameControllerInput', 'RandomInput', 'RangeInput'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid control input type: ${type}`);
    }

    // Find a good position for the new node (left side, stacked)
    const existingInputNodes = nodes.filter(n => n.category === 'input');
    const x = 50;
    const y = 80 + (existingInputNodes.length * 120);

    // Create the node
    const node = createNode(type, x, y);

    // Select the new node and show properties
    selectNode(node);

    // Update the existing control inputs dropdown
    updateExistingControlInputs();

    setControlInputStatus(`Created ${getControlInputTypeLabel(type)}`, 'success');

    Logger.info(`Created ${type} node:`, node.name);

    return node;

  } catch (error) {
    Logger.error('Error creating control input node:', error);
    setControlInputStatus(`Error: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Get user-friendly label for control input type
 */
function getControlInputTypeLabel(type) {
  const labels = {
    'MIDIInput': 'MIDI Controller',
    'AudioInput': 'Audio Analysis',
    'CursorInput': 'Mouse/Cursor',
    'CameraInput': 'Camera Motion',
    'GameControllerInput': 'Game Controller',
    'RandomInput': 'Random Generator',
    'RangeInput': 'Range/Increment'
  };
  return labels[type] || type;
}

/**
 * Set status message for control input manager
 */
function setControlInputStatus(message, type = '') {
  const statusSpan = document.getElementById('control-input-status');
  if (!statusSpan) return;

  statusSpan.textContent = message;
  statusSpan.className = 'control-input-status';
  if (type) {
    statusSpan.classList.add(type);
  }
}

/**
 * Enable camera input
 */
async function enableCameraInput() {
  if (permissions.camera.granted) {
    return true;
  }

  try {
    permissions.camera.requested = true;
    updatePermissionUI();
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240 } // Low resolution for analysis
    });

    // Create hidden video element
    cameraVideoElement = document.createElement('video');
    cameraVideoElement.srcObject = stream;
    cameraVideoElement.play();
    cameraVideoElement.style.display = 'none';
    document.body.appendChild(cameraVideoElement);

    // Create canvas for frame analysis
    cameraCanvas = document.createElement('canvas');
    cameraCanvas.width = 320;
    cameraCanvas.height = 240;
    cameraContext = cameraCanvas.getContext('2d');

    cameraEnabled = true;

    Logger.info('Camera input enabled');

  } catch (error) {
    Logger.error('Camera access error:', error);
  }
}

/**
 * Enable webcam for a specific camera node
 */
async function enableWebcamForNode(node) {
  if (!node.video) {
    Logger.error('No video element on node:', node.name);
    return;
  }
  
  try {
    const constraints = {
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    };
    
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    
    node.video.srcObject = stream;
    node.stream = stream;
    
    // Wait for video to be ready before playing
    await new Promise((resolve) => {
      node.video.onloadedmetadata = () => {
        resolve();
      };
    });
    
    // Ensure video plays
    try {
      await node.video.play();
    } catch (playError) {
      if (playError.name === 'AbortError') {
        // Retry once after a small delay
        await new Promise(resolve => setTimeout(resolve, 100));
        await node.video.play();
      } else {
        throw playError;
      }
    }
    
    // Mark video as ready
    node.videoReady = true;
    
    // Update permissions
    permissions.camera.granted = true;
    permissions.camera.requested = true;
    updatePermissionUI();
    
    Logger.debug(`Webcam enabled for node: ${node.name}`);
    
    // Force a re-render to show the video
    if (selectedNode === node) {
      showNodeProperties(node);
    }
  } catch (error) {
    Logger.error(`Failed to enable webcam for node ${node.name}:`, error);
    permissions.camera.denied = true;
    updatePermissionUI();
    throw error; // Re-throw so the button handler can show the error
  }
}

/**
 * Start camera analysis
 */
function startCameraAnalysis() {
  function analyzeCameraFrame() {
    if (cameraEnabled && cameraVideoElement && cameraVideoElement.readyState >= 2) {
      // Draw current frame to canvas
      cameraContext.drawImage(cameraVideoElement, 0, 0, 320, 240);
      const currentFrame = cameraContext.getImageData(0, 0, 320, 240);

      // Analyze the frame
      analyzeCameraData(currentFrame);

      // Store frame for motion detection
      lastCameraFrame = currentFrame;
    }

    requestAnimationFrame(analyzeCameraFrame);
  }
  analyzeCameraFrame();
}

/**
 * Analyze camera frame data
 */
function analyzeCameraData(frameData) {
  const pixels = frameData.data;
  let totalR = 0, totalG = 0, totalB = 0;
  let totalBrightness = 0;
  let minBrightness = 1, maxBrightness = 0;
  let motionAmount = 0;

  const pixelCount = pixels.length / 4;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] / 255;
    const g = pixels[i + 1] / 255;
    const b = pixels[i + 2] / 255;

    totalR += r;
    totalG += g;
    totalB += b;

    // Calculate brightness (luminance)
    const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
    totalBrightness += brightness;
    minBrightness = Math.min(minBrightness, brightness);
    maxBrightness = Math.max(maxBrightness, brightness);

    // Calculate motion if we have a previous frame
    if (lastCameraFrame) {
      const lastR = lastCameraFrame.data[i] / 255;
      const lastG = lastCameraFrame.data[i + 1] / 255;
      const lastB = lastCameraFrame.data[i + 2] / 255;

      const diff = Math.abs(r - lastR) + Math.abs(g - lastG) + Math.abs(b - lastB);
      motionAmount += diff / 3; // Average the color channel differences
    }
  }

  // Update camera components
  cameraComponents.brightness.value = totalBrightness / pixelCount;
  cameraComponents.motion.value = Math.min(1, motionAmount / pixelCount * 10); // Scale motion
  cameraComponents.redAvg.value = totalR / pixelCount;
  cameraComponents.greenAvg.value = totalG / pixelCount;
  cameraComponents.blueAvg.value = totalB / pixelCount;
  cameraComponents.contrast.value = maxBrightness - minBrightness;

  updateCameraDisplay();
  applyCameraMappings();
}

/**
 * Update camera display in UI
 */
function updateCameraDisplay() {
  // Only update if elements exist (for CameraInput control nodes)
  const brightnessEl = document.getElementById('camera-brightness');
  const motionEl = document.getElementById('camera-motion');
  const redEl = document.getElementById('camera-red');
  const greenEl = document.getElementById('camera-green');
  const blueEl = document.getElementById('camera-blue');
  const contrastEl = document.getElementById('camera-contrast');
  
  if (brightnessEl) brightnessEl.textContent = cameraComponents.brightness.value.toFixed(3);
  if (motionEl) motionEl.textContent = cameraComponents.motion.value.toFixed(3);
  if (redEl) redEl.textContent = cameraComponents.redAvg.value.toFixed(3);
  if (greenEl) greenEl.textContent = cameraComponents.greenAvg.value.toFixed(3);
  if (blueEl) blueEl.textContent = cameraComponents.blueAvg.value.toFixed(3);
  if (contrastEl) contrastEl.textContent = cameraComponents.contrast.value.toFixed(3);
}

/**
 * Apply camera control mappings
 */
function applyCameraMappings() {
  Object.keys(controlInputs.camera).forEach(componentName => {
    const mappings = controlInputs.camera[componentName];
    if (!mappings) return;

    const componentValue = cameraComponents[componentName]?.value || 0;

    mappings.forEach(mapping => {
      // Direct value from color component
      applyControlInput(mapping.nodeId, mapping.param, componentValue);
    });
  });
}

/**
 * PROJECT MANAGEMENT SYSTEM
 */

/**
 * Undo/Redo System
 */
function saveState(actionName = 'Action') {
  if (isRestoringState) return; // Don't save during undo/redo

  const state = {
    timestamp: Date.now(),
    action: actionName,
    data: serializeProject()
  };

  undoStack.push(state);

  // Limit stack size
  if (undoStack.length > MAX_UNDO_STATES) {
    undoStack.shift();
  }

  // Clear redo stack when new action is performed
  redoStack.length = 0;

  updateUndoRedoButtons();
}

function undo() {
  if (undoStack.length === 0) return;

  // Save current state to redo stack
  const currentState = {
    timestamp: Date.now(),
    action: 'Current State',
    data: serializeProject()
  };
  redoStack.push(currentState);

  // Restore previous state
  const previousState = undoStack.pop();
  isRestoringState = true;

  try {
    clearProject();
    deserializeProject(previousState.data);
    Logger.info(`Undid: ${previousState.action}`);
  } finally {
    isRestoringState = false;
  }

  updateUndoRedoButtons();
}

function redo() {
  if (redoStack.length === 0) return;

  // Save current state to undo stack
  const currentState = {
    timestamp: Date.now(),
    action: 'Undo State',
    data: serializeProject()
  };
  undoStack.push(currentState);

  // Restore next state
  const nextState = redoStack.pop();
  isRestoringState = true;

  try {
    clearProject();
    deserializeProject(nextState.data);
    Logger.info(`Redid: ${nextState.action}`);
  } finally {
    isRestoringState = false;
  }

  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  const undoBtn = document.getElementById('undo-btn');
  const redoBtn = document.getElementById('redo-btn');

  if (undoBtn) {
    undoBtn.disabled = undoStack.length === 0;
    undoBtn.title = undoStack.length > 0 ? `Undo: ${undoStack[undoStack.length - 1].action}` : 'Nothing to undo';
  }

  if (redoBtn) {
    redoBtn.disabled = redoStack.length === 0;
    redoBtn.title = redoStack.length > 0 ? `Redo: ${redoStack[redoStack.length - 1].action}` : 'Nothing to redo';
  }
}

/**
 * Copy/Paste System
 */
function copySelectedNodes() {
  if (!selectedNode) {
    Logger.info('No node selected to copy');
    return;
  }

  const selectedNodes = getSelectedNodes();
  if (selectedNodes.length === 0) return;

  // Create clipboard data with node information and connections
  clipboard = {
    type: 'nodes',
    timestamp: Date.now(),
    nodes: selectedNodes.map(node => ({
      type: node.type,
      params: { ...node.params },
      enabled: node.enabled,
      groupName: node.groupName,
      x: node.x,
      y: node.y,
      originalId: node.id // Keep reference for connection reconstruction
    })),
    // Store internal connections between copied nodes
    connections: []
  };

  // Find connections between copied nodes
  selectedNodes.forEach((node, nodeIndex) => {
    node.inputs.forEach((inputNode, inputIndex) => {
      if (inputNode && selectedNodes.includes(inputNode)) {
        const sourceIndex = selectedNodes.indexOf(inputNode);
        clipboard.connections.push({
          targetIndex: nodeIndex,
          inputIndex: inputIndex,
          sourceIndex: sourceIndex
        });
      }
    });
  });

  Logger.info(`Copied ${selectedNodes.length} node(s) to clipboard`);
  updateCopyPasteButtons();
}

function pasteNodes() {
  if (!clipboard || clipboard.type !== 'nodes') {
    Logger.info('Nothing to paste');
    return;
  }

  const pastedNodes = [];
  const nodeIdMap = new Map(); // Map original IDs to new nodes

  // Create new nodes from clipboard
  clipboard.nodes.forEach((nodeData, index) => {
    const newNode = createNode(
      nodeData.type,
      nodeData.x + PASTE_OFFSET,
      nodeData.y + PASTE_OFFSET
    );

    // Copy parameters
    newNode.params = { ...nodeData.params };
    newNode.enabled = nodeData.enabled;
    newNode.groupName = nodeData.groupName;

    // Update visual element
    updateNodeElement(newNode);

    pastedNodes.push(newNode);
    nodeIdMap.set(index, newNode);
  });

  // Restore connections between pasted nodes
  clipboard.connections.forEach(conn => {
    const targetNode = nodeIdMap.get(conn.targetIndex);
    const sourceNode = nodeIdMap.get(conn.sourceIndex);
    if (targetNode && sourceNode) {
      targetNode.inputs[conn.inputIndex] = sourceNode;
    }
  });

  // Update UI
  updateConnections();
  updateMainOutputDropdown();

  // Select the first pasted node
  if (pastedNodes.length > 0) {
    selectNode(pastedNodes[0]);
  }

  Logger.info(`Pasted ${pastedNodes.length} node(s)`);
  saveState(`Paste ${pastedNodes.length} Node(s)`);
}

function copyGroup(groupName) {
  const groupNodes = nodes.filter(node => node.groupName === groupName);
  if (groupNodes.length === 0) return;

  // Temporarily select all nodes in the group
  const originalSelected = selectedNode;

  // Copy all nodes in the group
  clipboard = {
    type: 'group',
    timestamp: Date.now(),
    groupName: groupName,
    nodes: groupNodes.map(node => ({
      type: node.type,
      params: { ...node.params },
      enabled: node.enabled,
      groupName: node.groupName,
      x: node.x,
      y: node.y,
      originalId: node.id
    })),
    connections: []
  };

  // Find all connections between nodes in the group
  groupNodes.forEach((node, nodeIndex) => {
    node.inputs.forEach((inputNode, inputIndex) => {
      if (inputNode && groupNodes.includes(inputNode)) {
        const sourceIndex = groupNodes.indexOf(inputNode);
        clipboard.connections.push({
          targetIndex: nodeIndex,
          inputIndex: inputIndex,
          sourceIndex: sourceIndex
        });
      }
    });
  });

  Logger.info(`Copied group "${groupName}" (${groupNodes.length} nodes) to clipboard`);
  updateCopyPasteButtons();
}

function getSelectedNodes() {
  // For now, just return the single selected node
  // Later this could be expanded to support multi-selection
  return selectedNode ? [selectedNode] : [];
}

function updateCopyPasteButtons() {
  const copyBtn = document.getElementById('copy-btn');
  const pasteBtn = document.getElementById('paste-btn');

  if (copyBtn) {
    copyBtn.disabled = !selectedNode;
    copyBtn.title = selectedNode ? `Copy ${selectedNode.name}` : 'Select a node to copy';
  }

  if (pasteBtn) {
    pasteBtn.disabled = !clipboard;
    if (clipboard) {
      const count = clipboard.nodes.length;
      const type = clipboard.type === 'group' ? `group "${clipboard.groupName}"` : `${count} node(s)`;
      pasteBtn.title = `Paste ${type}`;
    } else {
      pasteBtn.title = 'Nothing to paste';
    }
  }
}

/**
 * Serialize current synthesis graph to JSON
 */
function serializeProject() {
  const projectData = {
    id: currentProject.id,
    name: currentProject.name,
    description: currentProject.description,
    createdAt: currentProject.createdAt,
    modifiedAt: Date.now(),
    version: '1.0',

    // Serialize nodes (exclude system nodes like FinalOutput)
    nodes: nodes.filter(node => node.category !== 'system').map(node => ({
      id: node.id,
      type: node.type,
      name: node.name,
      x: node.x,
      y: node.y,
      params: { ...node.params },
      enabled: node.enabled,
      groupName: node.groupName,
      // Serialize inputs as node IDs
      inputs: node.inputs.map(inputNode => inputNode ? inputNode.id : null),
      // Serialize control inputs as node IDs (if they exist)
      controlInputs: node.controlInputs ? node.controlInputs.map(inputNode => inputNode ? inputNode.id : null) : []
    })),

    // Serialize FinalOutput connections separately
    finalOutputInput: (() => {
      const finalOutput = nodes.find(n => n.type === 'FinalOutput');
      return finalOutput && finalOutput.inputs[0] ? finalOutput.inputs[0].id : null;
    })(),

    // Serialize groups
    groups: Object.entries(groups).map(([name, group]) => ({
      name,
      enabled: group.enabled
    })),

    // Serialize main output
    mainOutputNodeId: mainOutputNode ? mainOutputNode.id : null,

    // Serialize control inputs
    controlInputs: {
      midi: { ...controlInputs.midi },
      audio: { ...controlInputs.audio },
      color: { ...controlInputs.color },
      cursor: { ...controlInputs.cursor },
      camera: { ...controlInputs.camera }
    },

    // Serialize graph state
    graphVisible: graphVisible,
    nodeCount: nodeCount,
    groupCount: groupCount
  };

  return projectData;
}

/**
 * Load synthesis graph from serialized data
 */
function deserializeProject(projectData) {
  try {
    // Clear current state
    clearProject();

    // Restore project metadata
    currentProject = {
      id: projectData.id,
      name: projectData.name || 'Untitled',
      description: projectData.description || '',
      createdAt: projectData.createdAt,
      modifiedAt: projectData.modifiedAt,
      autoSave: true
    };

    // Restore counters
    nodeCount = projectData.nodeCount || 0;
    groupCount = projectData.groupCount || 0;

    // Restore groups
    if (projectData.groups) {
      projectData.groups.forEach(groupData => {
        groups[groupData.name] = {
          enabled: groupData.enabled
        };
      });
    }

    // Restore nodes (first pass - create nodes without connections)
    const nodeMap = new Map(); // id -> node
    if (projectData.nodes) {
      projectData.nodes.forEach(nodeData => {
        const node = new SynthNode(nodeData.type, nodeData.x, nodeData.y);
        node.id = nodeData.id;
        node.name = nodeData.name;
        // Merge saved params with defaults to handle new parameters
        node.params = { ...node.params, ...nodeData.params };
        node.enabled = nodeData.enabled;
        node.groupName = nodeData.groupName;

        // Initialize node (create textures, programs, etc.)
        if (node.type === 'Camera') {
          initCameraNode(node);
        } else if (node.type === 'VideoFileInput') {
          initVideoFileNode(node);
        } else {
          allocateNodeFBO(node);
        }

        nodes.push(node);
        nodeMap.set(node.id, node);

        // Create UI element
        createNodeElement(node);

        // Force icon refresh for kaleidoscope nodes (fix legacy saves)
        if (node.type === 'Kaleidoscope' && node.icon !== 'auto_fix_high') {
          node.icon = 'auto_fix_high';
          updateNodeElement(node);
        }
      });
    }

    // Second pass - restore connections
    if (projectData.nodes) {
      projectData.nodes.forEach(nodeData => {
        const node = nodeMap.get(nodeData.id);
        if (node && nodeData.inputs) {
          node.inputs = nodeData.inputs.map(inputId =>
            inputId ? nodeMap.get(inputId) || null : null
          );
        }
        // Restore control inputs if they exist
        if (node && nodeData.controlInputs) {
          node.controlInputs = nodeData.controlInputs.map(inputId =>
            inputId ? nodeMap.get(inputId) || null : null
          );
        }
      });
    }

    // Restore FinalOutput connection
    const finalOutputNode = nodes.find(n => n.type === 'FinalOutput');
    if (finalOutputNode && projectData.finalOutputInput) {
      const connectedNode = nodeMap.get(projectData.finalOutputInput);
      if (connectedNode) {
        finalOutputNode.inputs[0] = connectedNode;
        Logger.info('Restored Canvas connection to:', connectedNode.name);
      }
    }

    // Ensure FinalOutput node is always the main output
    if (finalOutputNode) {
      setMainOutput(finalOutputNode);
      Logger.info('Set FinalOutput as main output after project restore');
    }

    // Restore control inputs
    if (projectData.controlInputs) {
      Object.assign(controlInputs.midi, projectData.controlInputs.midi || {});
      Object.assign(controlInputs.audio, projectData.controlInputs.audio || {});
      Object.assign(controlInputs.color, projectData.controlInputs.color || {});
      Object.assign(controlInputs.cursor, projectData.controlInputs.cursor || {});
      Object.assign(controlInputs.camera, projectData.controlInputs.camera || {});
    }

    // Restore graph state
    graphVisible = projectData.graphVisible !== false;

    // Remove any self-references that may have been restored
    removeSelfReferences();
    
    // Update UI
    updateMainOutputDropdown();
    updateMainOutputVisualIndicator();
    updateConnections();
    updateGroupsList();
    updateProjectTitle();

    // Final verification of main output consistency
    // The Canvas node is always the main output, dropdown shows what's connected to it
    const canvasNode = nodes.find(n => n.type === 'FinalOutput');
    if (canvasNode) {
      updateMainOutputDropdown();
      Logger.debug('Updated main output dropdown after project load');
    }

    hasUnsavedChanges = false;
    Logger.info(`Loaded project: ${currentProject.name}`);

  } catch (error) {
    Logger.error('Failed to load project:', error);
    alert('Failed to load project. The save file may be corrupted.');
  }
}

/**
 * Clear current project
 */
function clearProject() {
  // Clear nodes
  nodes.forEach(node => {
    if (node.texture) gl.deleteTexture(node.texture);
    if (node.fbo) gl.deleteFramebuffer(node.fbo);
    if (node.element) node.element.remove();
  });
  nodes.length = 0;

  // Clear groups
  Object.keys(groups).forEach(key => delete groups[key]);

  // Clear control inputs
  Object.keys(controlInputs.midi).forEach(key => delete controlInputs.midi[key]);
  Object.keys(controlInputs.audio).forEach(key => delete controlInputs.audio[key]);
  Object.keys(controlInputs.color).forEach(key => delete controlInputs.color[key]);
  Object.keys(controlInputs.cursor).forEach(key => delete controlInputs.cursor[key]);
  Object.keys(controlInputs.camera).forEach(key => delete controlInputs.camera[key]);

  // Reset state
  selectedNode = null;
  mainOutputNode = null;
  draggedNode = null;
  connectionStart = null;

  // Clear UI
  document.getElementById('nodes-container').innerHTML = '';
  document.getElementById('connections-svg').innerHTML = '';

  // Recreate the permanent FinalOutput node
  createFinalOutputNode();
}

/**
 * Save current project to LocalStorage
 */
function saveProject(name = null) {
  if (name) {
    currentProject.name = name;
  }

  if (!currentProject.id) {
    currentProject.id = generateProjectId();
    currentProject.createdAt = Date.now();
  }

  currentProject.modifiedAt = Date.now();

  const projectData = serializeProject();
  const projects = getStoredProjects();
  projects[currentProject.id] = projectData;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    hasUnsavedChanges = false;
    updateProjectTitle();
    Logger.info(`Saved project: ${currentProject.name}`);
    showNotification(`Saved "${currentProject.name}"`);
  } catch (error) {
    Logger.error('Failed to save project:', error);
    alert('Failed to save project. LocalStorage may be full.');
  }
}

/**
 * Load project from LocalStorage
 */
function loadProject(projectId) {
  const projects = getStoredProjects();
  const projectData = projects[projectId];

  if (projectData) {
    deserializeProject(projectData);
    startAutoSave();

    // Clear autosave since we loaded a specific project
    localStorage.removeItem(AUTOSAVE_KEY);
  } else {
    alert('Project not found.');
  }
}

/**
 * Delete project from LocalStorage
 */
function deleteProject(projectId) {
  const projects = getStoredProjects();
  const projectName = projects[projectId]?.name || 'Unknown';

  if (confirm(`Delete "${projectName}"? This cannot be undone.`)) {
    delete projects[projectId];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));

    // If deleting current project, create new one
    if (currentProject.id === projectId) {
      newProject();
    }

    showNotification(`Deleted "${projectName}"`);
  }
}

/**
 * Create new project
 */
function newProject() {
  if (hasUnsavedChanges && !confirm('Discard unsaved changes?')) {
    return;
  }

  clearProject();

  currentProject = {
    id: null,
    name: 'Untitled',
    description: '',
    createdAt: null,
    modifiedAt: null,
    autoSave: true
  };

  // Create initial node
  const initialOsc = createNode('Oscillator', 300, 200);
  setMainOutput(initialOsc);

  hasUnsavedChanges = false;
  updateProjectTitle();
  startAutoSave();

  // Clear autosave since we're starting fresh
  localStorage.removeItem(AUTOSAVE_KEY);
}

/**
 * Get all stored projects
 */
function getStoredProjects() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    Logger.error('Failed to read projects from storage:', error);
    return {};
  }
}

/**
 * Generate unique project ID
 */
function generateProjectId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Mark project as having unsaved changes
 */
function markUnsaved() {
  if (!hasUnsavedChanges) {
    hasUnsavedChanges = true;
    updateProjectTitle();
  }
}

/**
 * Start auto-save timer
 */
function startAutoSave() {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
  }

  autoSaveTimer = setInterval(() => {
    if (hasUnsavedChanges && currentProject.autoSave) {
      saveProject();
    }
  }, AUTOSAVE_INTERVAL);
}

/**
 * Update project title in UI
 */
function updateProjectTitle() {
  const titleElement = document.querySelector('.logo span:last-child');
  if (titleElement) {
    const unsavedMark = hasUnsavedChanges ? ' •' : '';
    titleElement.textContent = `${currentProject.name}${unsavedMark}`;
  }
}

/**
 * Show notification
 */
function showNotification(message) {
  // Simple notification - could be enhanced with a proper toast system
  Logger.info(`${message}`);
}

/**
 * AUTO-UPDATE SYSTEM
 */

/**
 * Check for file updates by monitoring modification times
 * Note: This only works when served over HTTP/HTTPS, not file:// protocol
 */
async function checkForUpdates() {
  // Skip update checking if running from file:// protocol
  if (location.protocol === 'file:') {
    return;
  }

  try {
    const filesToCheck = [
      { url: './script.js', name: 'JavaScript' },
      { url: './style.css', name: 'CSS' },
      { url: './index.html', name: 'HTML' }
    ];

    let hasChanges = false;
    const currentModTimes = new Map();

    for (const file of filesToCheck) {
      try {
        const response = await fetch(file.url + '?t=' + Date.now(), {
          method: 'HEAD',
          cache: 'no-cache'
        });

        if (response.ok) {
          const lastModified = response.headers.get('Last-Modified');
          const etag = response.headers.get('ETag');
          const identifier = lastModified || etag || 'unknown';

          currentModTimes.set(file.name, identifier);

          // Check if this file has changed
          if (lastFileModTimes.has(file.name)) {
            const lastIdentifier = lastFileModTimes.get(file.name);
            if (lastIdentifier !== identifier) {
              Logger.info(`${file.name} file updated`);
              hasChanges = true;
            }
          }
        }
      } catch (error) {
        // Silently fail for individual files to avoid console spam
        // Only log if it's not a typical CORS/fetch restriction
        if (!error.message.includes('fetch')) {
          Logger.warn(`Failed to check ${file.name}:`, error);
        }
      }
    }

    // Update stored modification times
    lastFileModTimes = currentModTimes;

    if (hasChanges && !updateNotificationShown) {
      updateAvailable = true;
      updateStatusIndicator('available');
      showUpdateNotification();
    } else if (!hasChanges) {
      updateStatusIndicator('active');
    }

  } catch (error) {
    Logger.warn('Update check failed:', error);
  }
}

/**
 * Show update notification
 */
function showUpdateNotification() {
  if (updateNotificationShown) return;
  updateNotificationShown = true;

  // Create update notification overlay
  const overlay = document.createElement('div');
  overlay.className = 'update-notification';
  overlay.innerHTML = `
    <div class="update-content">
      <div class="update-header">
        <span class="material-icons">update</span>
        <h3>App Update Available</h3>
      </div>
      <p>A new version of Visual Synthesizer is available. Your current synthesis will be automatically saved and restored after updating.</p>
      <div class="update-actions">
        <button id="update-now-btn" class="create-btn default-action">
          <span class="material-icons">save</span>
          Save & Update
        </button>
        <button id="update-later-btn" class="toolbar-btn">Update Later</button>
      </div>
      <div class="update-note">
        <small>✓ Current synthesis will be preserved</small>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add event listeners
  const updateNowBtn = document.getElementById('update-now-btn');
  const updateLaterBtn = document.getElementById('update-later-btn');

  updateNowBtn.addEventListener('click', performUpdate);
  updateLaterBtn.addEventListener('click', () => {
    overlay.remove();
    updateNotificationShown = false;
    // Check again in 5 minutes
    setTimeout(() => {
      if (updateAvailable) showUpdateNotification();
    }, 300000);
  });

  // Make "Save & Update" the default action (Enter key)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performUpdate();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      updateLaterBtn.click();
    }
  };

  overlay.addEventListener('keydown', handleKeyPress);
  document.addEventListener('keydown', handleKeyPress);

  // Focus the default button
  updateNowBtn.focus();

  // Clean up keyboard listener when overlay is removed
  const cleanup = () => {
    document.removeEventListener('keydown', handleKeyPress);
    updateNotificationShown = false;
  };

  overlay.addEventListener('remove', cleanup);

  // Auto-dismiss after 30 seconds if no action
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.remove();
      cleanup();
    }
  }, 30000);
}

/**
 * Perform the app update
 */
function performUpdate() {
  // Save current project state for restoration
  saveLastProjectState();

  // Show update progress
  const overlay = document.querySelector('.update-notification');
  if (overlay) {
    overlay.querySelector('.update-content').innerHTML = `
      <div class="update-header">
        <span class="material-icons updating">refresh</span>
        <h3>Updating...</h3>
      </div>
      <p>Applying updates and restoring your project...</p>
    `;
  }

  // Reload the page after a brief delay
  setTimeout(() => {
    window.location.reload(true);
  }, 1500);
}

/**
 * Save current project state for post-update restoration
 */
function saveLastProjectState() {
  try {
    const lastProjectData = {
      timestamp: Date.now(),
      version: APP_VERSION,
      project: serializeProject(),
      wasUnsaved: hasUnsavedChanges
    };

    localStorage.setItem(LAST_PROJECT_KEY, JSON.stringify(lastProjectData));
    Logger.info('Saved project state for update restoration');
  } catch (error) {
    Logger.error('Failed to save project state:', error);
  }
}

/**
 * Save current project for autosave (browser refresh persistence)
 */
function saveAutosaveProject() {
  try {
    if (nodes.length === 0) return; // Don't save empty projects

    const autosaveData = {
      project: serializeProject(),
      timestamp: Date.now(),
      wasUnsaved: hasUnsavedChanges
    };

    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(autosaveData));
  } catch (error) {
    Logger.error('Error saving autosave project:', error);
  }
}

/**
 * Restore autosaved project (browser refresh)
 */
function restoreAutosavedProject() {
  try {
    const stored = localStorage.getItem(AUTOSAVE_KEY);
    if (!stored) return false;

    const autosaveData = JSON.parse(stored);

    // Check if this autosave is recent (within 24 hours)
    const timeSinceAutosave = Date.now() - autosaveData.timestamp;
    if (timeSinceAutosave > 86400000) { // 24 hours
      localStorage.removeItem(AUTOSAVE_KEY);
      return false;
    }

    // Clear the current project and restore from autosave
    Logger.info('Restoring autosaved project...');
    clearProject();
    deserializeProject(autosaveData.project);
    Logger.info(`Restored autosaved project with ${nodes.length} nodes`);

    // Update main output dropdown after restoration
    updateMainOutputDropdown();
    Logger.debug('Updated main output dropdown after autosave restoration');

    // Restore unsaved status
    hasUnsavedChanges = autosaveData.wasUnsaved;
    updateProjectTitle();

    // Show restoration notification
    Logger.info('Project restored from autosave');

    return true;

  } catch (error) {
    Logger.error('Failed to restore autosaved project:', error);
    localStorage.removeItem(AUTOSAVE_KEY);
    return false;
  }
}

/**
 * Restore project after update
 */
function restoreLastProject() {
  try {
    const stored = localStorage.getItem(LAST_PROJECT_KEY);
    if (!stored) return false;

    const lastProjectData = JSON.parse(stored);

    // Check if this restoration is recent (within 5 minutes)
    const timeSinceUpdate = Date.now() - lastProjectData.timestamp;
    if (timeSinceUpdate > 300000) {
      localStorage.removeItem(LAST_PROJECT_KEY);
      return false;
    }

    // Clear the current project and restore from saved state
    Logger.info('Clearing current project and restoring from backup...');
    clearProject();
    deserializeProject(lastProjectData.project);
    Logger.info(`Restored project with ${nodes.length} nodes`);

    // Update main output dropdown after restoration
    updateMainOutputDropdown();
    Logger.debug('Updated main output dropdown after project restoration');

    // Restore unsaved status
    hasUnsavedChanges = lastProjectData.wasUnsaved;
    updateProjectTitle();

    // Clean up the restoration data
    localStorage.removeItem(LAST_PROJECT_KEY);

    // Show restoration notification
    showTemporaryNotification('✅ Project restored after update', 3000);

    Logger.info('Successfully restored project after update');
    return true;

  } catch (error) {
    Logger.error('Failed to restore project:', error);
    localStorage.removeItem(LAST_PROJECT_KEY);
    return false;
  }
}

/**
 * Show temporary notification
 */
function showTemporaryNotification(message, duration = 3000) {
  const notification = document.createElement('div');
  notification.className = 'temp-notification';
  notification.textContent = message;

  document.body.appendChild(notification);

  // Fade in
  setTimeout(() => notification.classList.add('visible'), 100);

  // Fade out and remove
  setTimeout(() => {
    notification.classList.remove('visible');
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Update the status indicator
 */
function updateStatusIndicator(status) {
  const indicator = document.getElementById('update-status');
  if (!indicator) return;

  indicator.className = 'update-status';

  switch (status) {
    case 'checking':
      indicator.classList.add('checking');
      indicator.title = 'Checking for updates...';
      break;
    case 'available':
      indicator.classList.add('available');
      indicator.title = 'Update available! Click to update.';
      indicator.style.cursor = 'pointer';
      indicator.onclick = showUpdateNotification;
      break;
    case 'active':
    default:
      indicator.title = 'Auto-update monitoring active';
      indicator.style.cursor = 'help';
      indicator.onclick = null;
      break;
  }
}

/**
 * Start update checking
 */
function startUpdateChecking() {
  updateStatusIndicator('checking');

  // Initial check for modification times (without triggering notifications)
  checkForUpdates().then(() => {
    // Start periodic checking after initial load
    updateCheckTimer = setInterval(() => {
      updateStatusIndicator('checking');
      checkForUpdates();
    }, UPDATE_CHECK_INTERVAL);
  });
}

/**
 * Stop update checking
 */
function stopUpdateChecking() {
  if (updateCheckTimer) {
    clearInterval(updateCheckTimer);
    updateCheckTimer = null;
  }
}

/**
 * Initialize update system
 */
function initUpdateSystem() {
  // First try to load project from URL parameter (shared projects)
  let restored = loadProjectFromURL();

  if (!restored) {
    // Then try to restore autosaved project (normal browser refresh)
    restored = restoreAutosavedProject();
  }

  if (!restored) {
    // Then try to restore project after potential update
    restored = restoreLastProject();
  }

  if (!restored) {
    // If no restoration happened, start with normal initialization
    currentProject.createdAt = Date.now();
  }

  // Start monitoring for updates
  startUpdateChecking();

  // Save project state periodically for update safety
  setInterval(saveLastProjectState, 60000); // Every minute

  // Save autosave state periodically for browser refreshes
  setInterval(saveAutosaveProject, 5000); // Every 5 seconds

  // Initialize undo/redo and copy/paste buttons
  updateUndoRedoButtons();
  updateCopyPasteButtons();

  Logger.info(`Visual Synthesizer v${APP_VERSION} initialized`);

  // Return whether a project was restored
  return restored;
}

/**
 * PROJECT BROWSER UI
 */

/**
 * Show project browser modal
 */
function showProjectBrowser() {
  const modal = document.getElementById('project-modal');
  modal.classList.add('visible');
  refreshProjectsList();
}

/**
 * Hide project browser modal
 */
function hideProjectBrowser() {
  const modal = document.getElementById('project-modal');
  modal.classList.remove('visible');
}

/**
 * Show rename project modal
 */
function showRenameModal() {
  const modal = document.getElementById('rename-modal');
  const input = document.getElementById('project-name-input');
  input.value = currentProject.name;
  modal.classList.add('visible');
  input.focus();
  input.select();
}

/**
 * Hide rename project modal
 */
function hideRenameModal() {
  const modal = document.getElementById('rename-modal');
  modal.classList.remove('visible');
}

/**
 * Save project rename
 */
function saveRename() {
  const input = document.getElementById('project-name-input');
  const newName = input.value.trim();

  if (newName && newName !== currentProject.name) {
    saveProject(newName);
  }

  hideRenameModal();
}

/**
 * Refresh projects list in browser
 */
function refreshProjectsList() {
  const container = document.getElementById('projects-list');
  const sortBy = document.getElementById('sort-projects').value;
  const projects = getStoredProjects();

  // Convert to array and sort
  const projectArray = Object.values(projects);

  projectArray.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return (b.createdAt || 0) - (a.createdAt || 0);
      case 'modified':
      default:
        return (b.modifiedAt || 0) - (a.modifiedAt || 0);
    }
  });

  if (projectArray.length === 0) {
    container.innerHTML = '<div class="projects-empty">No saved syntheses yet.<br>Create and save your first synthesis!</div>';
    return;
  }

  container.innerHTML = projectArray.map(project => {
    const isCurrentProject = project.id === currentProject.id;
    const createdDate = project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown';
    const modifiedDate = project.modifiedAt ? new Date(project.modifiedAt).toLocaleDateString() : 'Unknown';
    const nodeCount = project.nodes ? project.nodes.length : 0;

    return `
      <div class="project-item ${isCurrentProject ? 'current' : ''}" data-project-id="${project.id}">
        <div class="project-info">
          <div class="project-name">${escapeHtml(project.name)}</div>
          <div class="project-meta">
            <span>${nodeCount} nodes</span>
            <span>Created: ${createdDate}</span>
            <span>Modified: ${modifiedDate}</span>
          </div>
        </div>
        <div class="project-actions">
          <button class="project-action-btn" data-action="load" title="Load">
            <span class="material-icons">folder_open</span>
          </button>
          <button class="project-action-btn delete" data-action="delete" title="Delete">
            <span class="material-icons">delete</span>
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Add event listeners to project items
  container.querySelectorAll('.project-item').forEach(item => {
    const projectId = item.dataset.projectId;

    // Load project on main area click
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.project-actions')) {
        loadProject(projectId);
        hideProjectBrowser();
      }
    });

    // Handle action buttons
    item.querySelectorAll('.project-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;

        if (action === 'load') {
          loadProject(projectId);
          hideProjectBrowser();
        } else if (action === 'delete') {
          deleteProject(projectId);
          refreshProjectsList();
        }
      });
    });
  });
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Initialize project system
 */
function initProjectSystem() {
  currentProject.createdAt = Date.now();
  startAutoSave();
  updateProjectTitle();
}

// Hook into existing functions to mark unsaved changes
const originalCreateNode = createNode;
createNode = function(...args) {
  const result = originalCreateNode.apply(this, args);
  markUnsaved();
  return result;
};

const originalDeleteNode = deleteNode;
deleteNode = function(...args) {
  const result = originalDeleteNode.apply(this, args);
  markUnsaved();
  return result;
};

const originalSetMainOutput = setMainOutput;
setMainOutput = function(...args) {
  const result = originalSetMainOutput.apply(this, args);
  markUnsaved();
  return result;
};

// Hook into parameter changes
const originalApplyControlInput = applyControlInput;
applyControlInput = function(...args) {
  const result = originalApplyControlInput.apply(this, args);
  markUnsaved();
  return result;
};

/**
 * URL SHARING SYSTEM
 */

/**
 * Simple LZ-string compression implementation
 */
const LZString = {
  compress: function(input) {
    if (input == null) return "";
    let dictionary = {};
    let data = (input + "").split("");
    let out = [];
    let dictSize = 256;
    let w = "";

    for (let i = 0; i < data.length; i++) {
      let c = data[i];
      let wc = w + c;
      if (dictionary[wc]) {
        w = wc;
      } else {
        out.push(dictionary[w] || w.charCodeAt(0));
        dictionary[wc] = dictSize++;
        w = c;
      }
    }

    if (w !== "") {
      out.push(dictionary[w] || w.charCodeAt(0));
    }

    return String.fromCharCode.apply(null, out);
  },

  decompress: function(compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;

    let dictionary = {};
    let data = compressed.split("");
    let w = String.fromCharCode(data[0].charCodeAt(0));
    let result = [w];
    let dictSize = 256;

    for (let i = 1; i < data.length; i++) {
      let k = data[i].charCodeAt(0);
      let entry;

      if (dictionary[k]) {
        entry = dictionary[k];
      } else if (k === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return null;
      }

      result.push(entry);
      dictionary[dictSize++] = w + entry.charAt(0);
      w = entry;
    }

    return result.join('');
  }
};

/**
 * Create shareable URL for current project
 */
function createShareableURL() {
  try {
    const projectData = serializeProject();

    // Remove unnecessary metadata for sharing
    const shareData = {
      nodes: projectData.nodes,
      mainOutputNodeId: projectData.mainOutputNodeId,
      groups: projectData.groups,
      graphVisible: projectData.graphVisible,
      nodeCount: projectData.nodeCount,
      groupCount: projectData.groupCount,
      controlInputs: projectData.controlInputs,
      name: projectData.name
    };

    const jsonString = JSON.stringify(shareData);
    const compressed = LZString.compress(jsonString);
    const base64 = btoa(unescape(encodeURIComponent(compressed)));

    const baseURL = window.location.origin + window.location.pathname;
    const shareURL = `${baseURL}?project=${base64}`;

    return {
      url: shareURL,
      originalSize: jsonString.length,
      compressedSize: compressed.length,
      base64Size: base64.length,
      urlLength: shareURL.length
    };

  } catch (error) {
    Logger.error('Error creating shareable URL:', error);
    return null;
  }
}

/**
 * Load project from URL parameter
 */
function loadProjectFromURL() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const projectParam = urlParams.get('project');

    if (!projectParam) return false;

    Logger.info('Loading project from URL...');

    const compressed = decodeURIComponent(escape(atob(projectParam)));
    const jsonString = LZString.decompress(compressed);

    if (!jsonString) {
      Logger.error('Failed to decompress project data');
      return false;
    }

    const projectData = JSON.parse(jsonString);

    // Add missing metadata for compatibility
    projectData.id = null;
    projectData.createdAt = Date.now();
    projectData.modifiedAt = Date.now();

    // Clear current project and load shared one
    clearProject();
    deserializeProject(projectData);

    Logger.info(`Loaded shared project: ${projectData.name || 'Untitled'}`);

    // Clear URL parameter
    window.history.replaceState({}, document.title, window.location.pathname);

    return true;

  } catch (error) {
    Logger.error('Error loading project from URL:', error);
    return false;
  }
}

/**
 * Import project from text (URL or JSON)
 */
function importProjectFromText(text) {
  try {
    text = text.trim();

    if (!text) {
      alert('Please enter a URL or JSON data');
      return false;
    }

    let projectData = null;

    // Check if it's a URL
    if (text.startsWith('http')) {
      const url = new URL(text);
      const projectParam = url.searchParams.get('project');

      if (!projectParam) {
        alert('No project data found in URL');
        return false;
      }

      const compressed = decodeURIComponent(escape(atob(projectParam)));
      const jsonString = LZString.decompress(compressed);
      projectData = JSON.parse(jsonString);

    } else {
      // Try to parse as JSON directly
      projectData = JSON.parse(text);
    }

    if (!projectData || !projectData.nodes) {
      alert('Invalid project data');
      return false;
    }

    // Add missing metadata
    projectData.id = null;
    projectData.createdAt = Date.now();
    projectData.modifiedAt = Date.now();

    // Clear current project and load imported one
    clearProject();
    deserializeProject(projectData);

    Logger.info(`Imported project: ${projectData.name || 'Untitled'}`);
    return true;

  } catch (error) {
    Logger.error('Error importing project:', error);
    alert('Failed to import project. Please check the data format.');
    return false;
  }
}

/**
 * Show share modal
 */
function showShareModal() {
  const modal = document.getElementById('share-modal');
  const shareURL = createShareableURL();

  if (!shareURL) {
    alert('Failed to create shareable URL');
    return;
  }

  // Update URL field
  document.getElementById('share-url').value = shareURL.url;

  // Update statistics
  document.getElementById('stats-nodes').textContent = nodes.length;
  document.getElementById('stats-size').textContent = `${shareURL.originalSize} bytes`;
  document.getElementById('stats-compressed').textContent = `${shareURL.compressedSize} bytes`;
  document.getElementById('stats-url-length').textContent = `${shareURL.urlLength} chars`;

  // Show warning if URL is very long
  if (shareURL.urlLength > 2000) {
    document.getElementById('stats-url-length').style.color = '#ef4444';
    document.getElementById('stats-url-length').title = 'Warning: Very long URL may not work in all browsers';
  } else {
    document.getElementById('stats-url-length').style.color = '';
    document.getElementById('stats-url-length').title = '';
  }

  modal.classList.add('visible');
}

/**
 * Hide share modal
 */
function hideShareModal() {
  document.getElementById('share-modal').classList.remove('visible');
}

/**
 * Copy URL to clipboard
 */
async function copyShareURL() {
  const urlField = document.getElementById('share-url');

  try {
    await navigator.clipboard.writeText(urlField.value);

    // Visual feedback
    const button = document.getElementById('copy-url-btn');
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="material-icons">check</span>Copied!';

    setTimeout(() => {
      button.innerHTML = originalText;
    }, 2000);

  } catch (error) {
    // Fallback for older browsers
    urlField.select();
    document.execCommand('copy');
    Logger.info('URL copied to clipboard');
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);