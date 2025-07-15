"use strict";

/**
 * Modern Node-Based Visual Synthesizer
 * Features a sleek, graph-based interface with visual node connections,
 * drag-and-drop functionality, and professional visual compositing capabilities.
 */

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
  
  // Random node parameters
  interval: { type: 'number', min: 0.01, max: 10, step: 0.01, default: 0.1 },
  min: { type: 'number', min: -100, max: 100, step: 0.01, default: 0.0 },
  max: { type: 'number', min: -100, max: 100, step: 0.01, default: 1.0 },
  
  // Input node parameters
  ccNumber: { type: 'integer', min: 1, max: 127, step: 1, default: 1 },
  band: { type: 'string', values: ['overall', 'bass', 'lowMids', 'mids', 'highMids', 'highs'], default: 'overall' },
  component: { type: 'string', values: ['x', 'y', 'velocity', 'click', 'motionX', 'brightness', 'motion', 'contrast'], default: 'x' },
  
  // String parameters with allowed values
  colorPalette: { type: 'string', values: ['rainbow', 'sunset', 'ocean', 'forest', 'fire', 'purple', 'monochrome'], default: 'rainbow' },
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
          error: clampedNum !== num ? `${paramName} clamped to range [${constraint.min}, ${constraint.max}]` : undefined
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
          error: clampedInt !== int ? `${paramName} clamped to range [${constraint.min}, ${constraint.max}]` : undefined
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
    console.error(errorMessage);
    lastWebGLError = { operation, error, errorName, timestamp: Date.now() };
    
    // Notify error callbacks
    webglErrorCallbacks.forEach(callback => {
      try {
        callback(lastWebGLError);
      } catch (e) {
        console.error('Error in WebGL error callback:', e);
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
    console.warn(`Skipping ${description} - WebGL not available`);
    return fallbackValue;
  }
  
  try {
    const result = operation();
    if (!checkWebGLError(description)) {
      return fallbackValue;
    }
    return result;
  } catch (error) {
    console.error(`Exception in ${description}:`, error);
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
  console.log('🔍 Detecting WebGL features...');
  
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
    
    console.log('✅ WebGL supported');
  } else {
    console.warn('❌ WebGL not supported');
    featureSupport.fallbackMode = true;
  }
  
  // Test getUserMedia support
  featureSupport.getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  
  // Test Web Audio API support
  featureSupport.audioContext = !!(window.AudioContext || window.webkitAudioContext);
  
  // Test MIDI support
  featureSupport.midi = !!navigator.requestMIDIAccess;
  
  console.log('📊 Feature Support:', featureSupport);
  return featureSupport;
}

/**
 * Get fallback shader for unsupported features
 */
function getFallbackShader(nodeType, reason = 'feature unsupported') {
  console.log(`⚠️ Using fallback shader for ${nodeType}: ${reason}`);
  
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
  console.log(`🔧 Creating fallback program for ${nodeType} due to: ${originalError}`);
  
  const vertShader = compileShader(gl.VERTEX_SHADER, `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `);
  
  if (!vertShader) {
    console.error('Even fallback vertex shader failed!');
    return null;
  }
  
  const fallbackFragSource = getFallbackShader(nodeType, originalError);
  const fragShader = compileShader(gl.FRAGMENT_SHADER, fallbackFragSource);
  
  if (!fragShader) {
    console.error('Fallback fragment shader failed!');
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
  console.log(`🎭 Creating fallback node for ${nodeType}: ${reason}`);
  
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
  console.log('🧹 Force cleaning orphaned resources...');
  
  const nodeIds = new Set(nodes.map(n => n.id));
  
  // Clean up resources for nodes that no longer exist
  ['textures', 'framebuffers', 'buffers', 'videoStreams'].forEach(type => {
    const tracker = resourceTracker[type];
    for (const tracked of tracker) {
      if (tracked.nodeId && !nodeIds.has(tracked.nodeId)) {
        console.log(`🗑️ Cleaning orphaned ${type.slice(0, -1)} from deleted node ${tracked.nodeId}`);
        const resourceType = type.slice(0, -1); // Remove 's'
        cleanupResource(resourceType, tracked.resource);
      }
    }
  });
  
  // Clean up event listeners for deleted nodes
  for (const [nodeId, listeners] of resourceTracker.eventListeners) {
    if (!nodeIds.has(nodeId)) {
      console.log(`🗑️ Cleaning orphaned event listeners from deleted node ${nodeId}`);
      listeners.forEach(({ element, event, handler }) => {
        try {
          element.removeEventListener(event, handler);
        } catch (error) {
          console.warn('Error removing orphaned event listener:', error);
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

// Debug mode for Layer nodes - set to true to see split view
window.debugLayerSplit = true;

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
let autoLayoutEnabled = true;
const LAYOUT_CONFIG = {
  // Layer positions from left to right
  layers: {
    input: { x: 50, label: 'Inputs' },
    source: { x: 250, label: 'Sources' }, 
    effect: { x: 450, label: 'Effects' },
    compositing: { x: 650, label: 'Compositing' },
    system: { x: 850, label: 'Output' }
  },
  // Spacing between nodes
  nodeSpacing: { x: 200, y: 120 },
  // Padding around the layout
  padding: { x: 50, y: 80 }
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

const colorPalettes = {
  'rainbow': ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'],
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
  name: 'Untitled Synthesis',
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
        controlInputs: [null, null, null, null, null, null], // frequency, sync, offset, colorPalette, colorIndex, colorSpeed
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
      Mix: {
        inputs: [null, null],
        controlInputs: [null], // mix
        params: { mix: 0.5 },
        icon: 'merge_type',
        category: 'compositing'
      },
      Layer: {
        inputs: [null, null],
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
        params: { band: 'overall', min: 0.0, max: 1.0 },
        icon: 'graphic_eq',
        category: 'input'
      },
      CursorInput: {
        inputs: [],
        params: { component: 'x', min: 0.0, max: 1.0 },
        icon: 'mouse',
        category: 'input'
      },
      CameraInput: {
        inputs: [],
        params: { component: 'motionX', min: 0.0, max: 1.0 },
        icon: 'videocam',
        category: 'input'
      },
      RandomInput: {
        inputs: [],
        params: { min: 0.0, max: 1.0, interval: 0.1 },
        icon: 'casino',
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
      this.program = programs[this.type.toLowerCase()];
      
      // Initialize Random nodes with a random value
      if (this.type === 'RandomInput') {
        this.randomValue = Math.random();
        this.lastRandomUpdate = Date.now();
        this.currentValue = this.params.min + (this.randomValue * (this.params.max - this.params.min));
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
  handleResolutionChange('Medium');
  
  // Create the permanent Final Output node
  createFinalOutputNode();
  
  // Initialize update and project system (may restore saved project)
  const projectWasRestored = initUpdateSystem();
  
  // Only create initial node if no project was restored
  if (!projectWasRestored) {
    console.log('📄 No saved project found, creating default oscillator');
    const initialOsc = createNode('Oscillator', 300, 200);
    const finalOutputNode = nodes.find(n => n.type === 'FinalOutput');
    if (finalOutputNode) {
      finalOutputNode.inputs[0] = initialOsc;
      updateConnections();
    }
  } else {
    console.log('📄 Project restored from saved state, skipping default node creation');
  }
  
  // Initialize graceful degradation system
  if (!initializeGracefulDegradation()) {
    console.error('Critical features unavailable - app may not function properly');
    return;
  }
  
  // Validate data model consistency
  validateDataModelConsistency();
  
  startRenderLoop();
  startColorAnalysis();
  startCursorTracking();
  startCameraAnalysis();
  startMemoryMonitoring();
  
  // Perform initial auto-layout after everything is initialized
  setTimeout(() => {
    if (autoLayoutEnabled) {
      performAutoLayout();
    }
  }, 500); // Give time for all nodes to be created and rendered
}

/**
 * Start automatic memory monitoring and cleanup
 */
function startMemoryMonitoring() {
  // Memory monitoring every 30 seconds
  const memoryMonitorInterval = setInterval(() => {
    const stats = getMemoryStats();
    console.log('📊 Memory Stats:', stats);
    
    // DISABLED: Aggressive orphaned resource cleanup was causing crashes
    // The original code worked fine without this aggressive cleanup
    // if (now - lastCleanup > 300000) { // Every 5 minutes
    //   window.lastOrphanCleanup = now;
    //   forceCleanupOrphanedResources();
    // }
    
    // Warn if resource count is getting high
    const totalResources = stats.textures + stats.framebuffers + stats.buffers;
    if (totalResources > 100) {
      console.warn(`⚠️ High resource count detected: ${totalResources} WebGL resources`);
    }
    
    // Check for potential memory leaks
    if (stats.eventListeners > nodes.length * 2) {
      console.warn(`⚠️ Potential event listener leak: ${stats.eventListeners} listeners for ${nodes.length} nodes`);
    }
  }, 30000);
  
  // Simple interval tracking
  window.memoryMonitorInterval = memoryMonitorInterval;
  
  // Removed aggressive cleanup - was causing crashes
  
  // Memory stats command for development
  window.getMemoryStats = getMemoryStats;
  
  console.log('🔍 Memory monitoring started - use forceMemoryCleanup() or getMemoryStats() in console');
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    console.log('🧹 Page unloading - cleaning up all resources');
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
        console.warn('Error stopping video stream during cleanup:', error);
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
        console.warn('Error deleting WebGL resources during cleanup:', error);
      }
    });
    
    // Clean up quad buffer
    if (quadBuffer.buf && gl.isBuffer(quadBuffer.buf)) {
      gl.deleteBuffer(quadBuffer.buf);
    }
  }
  
  console.log('✅ All resources cleaned up');
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
  
  console.log('✅ Created fallback texture for failed nodes');
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
    
    console.log('✅ WebGL initialized successfully');
    return true;
    
  } catch (error) {
    console.error('WebGL initialization failed:', error);
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
    console.warn('🔴 WebGL context lost');
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
    console.log('🟢 WebGL context restored, reinitializing...');
    webglContextLost = false;
    
    // Reinitialize WebGL
    setTimeout(() => {
      if (initWebGL()) {
        // Recreate all node textures and programs
        restoreWebGLResources();
        // Restart rendering
        startRenderLoop();
        console.log('✅ WebGL recovery complete');
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
  
  console.log('🔄 WebGL resources restored');
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
    console.error('Failed to compile vertex shader');
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
    console.warn('⚠️ Oscillator shader compilation failed, using fallback');
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
    console.warn('⚠️ Noise shader compilation failed, using fallback');
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

  // Layer shader with blend modes
  const fragLayer = `
    precision mediump float;
    uniform sampler2D u_texture1;
    uniform sampler2D u_texture2;
    uniform float u_opacity;
    uniform float u_blendMode;
    varying vec2 v_uv;
    
    vec3 blendMultiply(vec3 base, vec3 blend) { return base * blend; }
    vec3 blendScreen(vec3 base, vec3 blend) { return 1.0 - (1.0 - base) * (1.0 - blend); }
    vec3 blendOverlay(vec3 base, vec3 blend) {
      return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
    }
    
    void main() {
      vec4 base = texture2D(u_texture1, v_uv);
      vec4 blend = texture2D(u_texture2, v_uv);
      
      // Debug mode: show split view when blendMode is negative
      if (u_blendMode < -0.5) {
        // Split screen debug view
        if (v_uv.x < 0.5) {
          gl_FragColor = vec4(base.rgb, 1.0); // Left half: texture1
        } else {
          gl_FragColor = vec4(blend.rgb, 1.0); // Right half: texture2
        }
        return;
      }
      
      vec3 result;
      float mode = u_blendMode;
      
      // Photoshop-style blend modes
      vec3 blended;
      
      if (mode < 0.5) {
        // Normal: standard alpha blending - just use the blend color
        blended = blend.rgb;
      } else if (mode < 1.5) {
        // Multiply: darkens (base * blend)
        blended = base.rgb * blend.rgb;
      } else if (mode < 2.5) {
        // Screen: lightens (inverse multiply)
        blended = vec3(1.0) - (vec3(1.0) - base.rgb) * (vec3(1.0) - blend.rgb);
      } else if (mode < 3.5) {
        // Overlay: combines multiply and screen
        vec3 overlayed;
        overlayed.r = base.r < 0.5 ? (2.0 * base.r * blend.r) : (1.0 - 2.0 * (1.0 - base.r) * (1.0 - blend.r));
        overlayed.g = base.g < 0.5 ? (2.0 * base.g * blend.g) : (1.0 - 2.0 * (1.0 - base.g) * (1.0 - blend.g));
        overlayed.b = base.b < 0.5 ? (2.0 * base.b * blend.b) : (1.0 - 2.0 * (1.0 - base.b) * (1.0 - blend.b));
        blended = overlayed;
      } else {
        // Fallback to normal
        blended = blend.rgb;
      }
      
      // Apply opacity to blend between base and blended result
      vec3 result = mix(base.rgb, blended, u_opacity);
      
      gl_FragColor = vec4(result, 1.0);
    }
  `;
  programs.layer = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragLayer));
  if (!programs.layer) {
    console.error('❌ Layer shader compilation failed!');
    programs.layer = createFallbackProgram('Layer', 'Layer shader compilation failed');
  } else {
    console.log('✅ Layer shader compiled successfully');
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
      vec4 result = vec4(0.0, 0.0, 0.0, 1.0);
      
      if (u_activeInputs >= 1) {
        vec4 layer1 = texture2D(u_texture1, v_uv);
        result.rgb = mix(result.rgb, layer1.rgb, layer1.a * u_opacity1);
      }
      if (u_activeInputs >= 2) {
        vec4 layer2 = texture2D(u_texture2, v_uv);
        result.rgb = mix(result.rgb, layer2.rgb, layer2.a * u_opacity2);
      }
      if (u_activeInputs >= 3) {
        vec4 layer3 = texture2D(u_texture3, v_uv);
        result.rgb = mix(result.rgb, layer3.rgb, layer3.a * u_opacity3);
      }
      if (u_activeInputs >= 4) {
        vec4 layer4 = texture2D(u_texture4, v_uv);
        result.rgb = mix(result.rgb, layer4.rgb, layer4.a * u_opacity4);
      }
      
      gl_FragColor = result;
    }
  `;
  programs.composite = createProgram(vertShader, compileShader(gl.FRAGMENT_SHADER, fragComposite));

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
    console.error('❌ Copy shader compilation failed - this is critical!');
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
  
  // Final Output shader - uses copy shader for passthrough
  programs.finaloutput = programs.copy;
  
  // Check if all essential programs compiled successfully (including fallbacks)
  const requiredPrograms = ['oscillator', 'noise', 'shape', 'copy'];
  const missingPrograms = requiredPrograms.filter(name => !programs[name]);
  
  if (missingPrograms.length > 0) {
    console.error('❌ Critical shader programs missing even after fallback attempts:', missingPrograms);
    return false;
  }
  
  // Count fallback programs
  const fallbackCount = Object.values(programs).filter(program => program && program.isFallback).length;
  if (fallbackCount > 0) {
    console.warn(`⚠️ ${fallbackCount} shader programs using fallbacks - some features may be simplified`);
  }
  
  console.log('✅ All essential shader programs available (including any fallbacks)');
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
      console.error("Shader compile error:", error);
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }, `shader compilation (${type === gl.VERTEX_SHADER ? 'vertex' : 'fragment'})`, null);
}

function createProgram(vs, fs) {
  if (!vs || !fs) {
    console.error("Cannot create program: missing shaders");
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
      console.error("Shader program link error:", error);
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
  document.getElementById('auto-layout-btn').addEventListener('click', () => {
    autoLayoutEnabled = !autoLayoutEnabled;
    const btn = document.getElementById('auto-layout-btn');
    if (autoLayoutEnabled) {
      btn.classList.add('active');
      btn.title = 'Auto Layout (On)';
      performAutoLayout(); // Apply layout immediately when enabled
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
    const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true';
    
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
  
  console.log('🖥️ Created permanent Canvas node');
  
  return finalOutputNode;
}

/**
 * Auto-layout system - organizes nodes in clean layers
 */
function performAutoLayout() {
  if (!autoLayoutEnabled) return;
  
  console.log('🎨 Performing auto-layout...');
  
  // Show visual feedback that auto-layout is active
  showAutoLayoutFeedback();
  
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
  console.log(`🔍 Canvas node search: found=${!!canvasDisplayNode}`);
  if (canvasDisplayNode) {
    console.log(`🔍 Canvas details: name=${canvasDisplayNode.name}, type=${canvasDisplayNode.type}, category=${canvasDisplayNode.category}, position=(${canvasDisplayNode.x}, ${canvasDisplayNode.y})`);
  }
  
  // Debug: show which nodes are in each category
  Object.keys(nodesByCategory).forEach(category => {
    if (nodesByCategory[category].length > 0) {
      console.log(`📂 ${category}: ${nodesByCategory[category].map(n => n.name).join(', ')}`);
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
  console.log(`🎯 Attempting to position Canvas node: ${canvasDisplayNode ? `found ${canvasDisplayNode.name} at (${canvasDisplayNode.x}, ${canvasDisplayNode.y})` : 'NOT FOUND'}`);
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
    
    console.log(`🖥️ Canvas positioning calculation:
      - Other nodes rightmost X: ${rightmostX}
      - Other nodes bottom Y: ${bottomY}  
      - Canvas target position: (${canvasX}, ${canvasY})
      - Canvas current position: (${canvasDisplayNode.x}, ${canvasDisplayNode.y})`);
    
    // FORCE immediate positioning without animation for debugging
    canvasDisplayNode.x = canvasX;
    canvasDisplayNode.y = canvasY;
    canvasDisplayNode.element.style.left = canvasX + 'px';
    canvasDisplayNode.element.style.top = canvasY + 'px';
    
    console.log(`🖥️ Canvas position FORCED to (${canvasDisplayNode.x}, ${canvasDisplayNode.y})`);
    
    // DEBUG: Set up monitoring to catch when Canvas gets moved
    if (canvasDisplayNode.element) {
      // Monitor style property changes
      let currentLeft = canvasDisplayNode.element.style.left;
      let currentTop = canvasDisplayNode.element.style.top;
      
      const checkPositionChange = () => {
        if (canvasDisplayNode.element.style.left !== currentLeft || canvasDisplayNode.element.style.top !== currentTop) {
          console.log(`🚨 CANVAS MOVED! From (${currentLeft}, ${currentTop}) to (${canvasDisplayNode.element.style.left}, ${canvasDisplayNode.element.style.top})`);
          console.trace('Canvas position change detected');
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
  if (node.type !== 'Video') {
    allocateNodeFBO(node);
  } else {
    setupVideoNode(node);
  }

  // Create visual representation
  createNodeElement(node);
  updateConnections();
  updateMainOutputDropdown();
  updateExistingControlInputs(); // Update control input manager

  // Perform auto-layout after adding node (only if system is fully initialized)
  if (autoLayoutEnabled && nodes.length > 1) { // Don't auto-layout if only Canvas exists
    setTimeout(() => performAutoLayout(), 100); // Small delay for DOM updates
  }

  // Save state for undo
  saveState(`Add ${type} Node`);

  return node;
}

/**
 * Delete a node and clean up connections
 */
function deleteNode(node) {
  console.log(`🗑️ Deleting node: ${node.name} (${node.id})`);
  
  // Prevent double deletion
  if (node.deleted) {
    console.warn(`Node ${node.name} already deleted - skipping`);
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
      console.warn('Error deleting framebuffer:', e);
    }
  }
  if (node.texture && gl && !webglContextLost) {
    try {
      if (gl.isTexture(node.texture)) {
        gl.deleteTexture(node.texture);
      }
    } catch (e) {
      console.warn('Error deleting texture:', e);
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
    console.log('Main output auto-updated after node deletion:', newMainOutput?.name || 'None');
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
  
  console.log(`✅ Node ${node.name} successfully deleted and cleaned up`);

  // Update UI
  updateConnections();
  updateMainOutputDropdown();
  updateExistingControlInputs(); // Update control input manager
  
  // Trigger auto-layout after node deletion
  if (autoLayoutEnabled) {
    setTimeout(() => performAutoLayout(), 100);
  }
  
  // Save state for undo
  saveState(`Delete ${node.type} Node`);
}

function allocateNodeFBO(node) {
  console.log('🔧 PHASE 2: Testing FBO allocation for node:', node.name);
  
  return safeWebGLOperation(() => {
    const width = canvas.width;
    const height = canvas.height;
    
    // Create texture with detailed logging
    console.log(`Creating texture for ${node.name}...`);
    node.texture = gl.createTexture();
    if (!node.texture) {
      console.error(`Failed to create texture for ${node.name}`);
      return false;
    }
    
    gl.bindTexture(gl.TEXTURE_2D, node.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    setTextureParams();
    
    // Create framebuffer with detailed logging
    console.log(`Creating framebuffer for ${node.name}...`);
    node.fbo = gl.createFramebuffer();
    if (!node.fbo) {
      console.error(`Failed to create framebuffer for ${node.name}`);
      if (gl.isTexture(node.texture)) gl.deleteTexture(node.texture);
      node.texture = null;
      return false;
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, node.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, node.texture, 0);
    
    // Check framebuffer completeness
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error(`Framebuffer incomplete for ${node.name}:`, status);
      if (gl.isTexture(node.texture)) gl.deleteTexture(node.texture);
      if (gl.isFramebuffer(node.fbo)) gl.deleteFramebuffer(node.fbo);
      node.texture = null;
      node.fbo = null;
      return false;
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    // Assign shader program
    const programKey = node.type.toLowerCase();
    if (programs[programKey]) {
      node.program = programs[programKey];
    } else {
      console.error('No shader program found for node type:', node.type);
      return false;
    }
    
    console.log(`✅ Successfully allocated FBO for ${node.name}`);
    return true;
  }, `FBO allocation for node ${node.name}`, false);
}

function setTextureParams() {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}

function setupVideoNode(node) {
  console.warn('🚨 Video node setup disabled during WebGL debugging for node:', node.name);
  // TEMPORARILY DISABLED: WebGL operations during debugging
  node.texture = null;
  return false;
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

  // Control input ports for effect nodes
  const controlPorts = node.controlInputs && node.controlInputs.length > 0 ? `
    <div class="control-ports-section">
      <div class="control-ports-header">
        Controls
        ${node.controlInputs.length > 4 ? '<button class="control-toggle" data-expanded="false">−</button>' : ''}
      </div>
      <div class="control-ports-list ${node.controlInputs.length > 4 ? 'collapsible' : ''}">
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

  nodeEl.innerHTML = `
    <div class="node-header">
      <span class="material-icons node-icon">${node.icon}</span>
      <span class="node-title">${node.name}</span>
      <div class="node-enabled ${node.enabled ? 'checked' : ''}"></div>
      ${node.category === 'system' ? '' : '<button class="node-delete">×</button>'}
    </div>
    <div class="node-body">
      <div class="node-ports">
        ${inputPorts}
        ${controlPorts}
        ${outputPort}
      </div>
    </div>
  `;

  container.appendChild(nodeEl);
  node.element = nodeEl;

  // Add event listeners
  nodeEl.addEventListener('click', () => selectNode(node));
  
  const enableToggle = nodeEl.querySelector('.node-enabled');
  enableToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    node.enabled = !node.enabled;
    enableToggle.classList.toggle('checked', node.enabled);
    nodeEl.classList.toggle('disabled', !node.enabled);
  });

  const deleteBtn = nodeEl.querySelector('.node-delete');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteNode(node);
    });
  }

  // Control ports toggle functionality
  const controlToggle = nodeEl.querySelector('.control-toggle');
  if (controlToggle) {
    controlToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = controlToggle.dataset.expanded === 'true';
      const controlPortsList = nodeEl.querySelector('.control-ports-list');
      
      if (isExpanded) {
        // Collapse - hide control ports
        controlPortsList.classList.add('collapsed');
        controlToggle.textContent = '+';
        controlToggle.dataset.expanded = 'false';
      } else {
        // Expand - show control ports
        controlPortsList.classList.remove('collapsed');
        controlToggle.textContent = '−';
        controlToggle.dataset.expanded = 'true';
      }
      
      // Update connections after collapse/expand
      setTimeout(() => updateConnections(), 50);
    });
    
    // Auto-collapse nodes with >4 control inputs
    if (node.controlInputs && node.controlInputs.length > 4) {
      const controlPortsList = nodeEl.querySelector('.control-ports-list');
      controlPortsList.classList.add('collapsed');
      controlToggle.textContent = '+';
      controlToggle.dataset.expanded = 'false';
    }
  }
  
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
  console.log('🔍 Validating data model consistency...');
  
  // Skip dropdown validation since Canvas logic is different
  // The dropdown now controls what feeds Canvas, not what Canvas is
  
  // Check Final Output Node exists and is properly configured
  const finalOutputNode = nodes.find(n => n.type === 'FinalOutput');
  if (!finalOutputNode) {
    console.warn('🚨 Final Output Node missing! Creating...');
    createFinalOutputNode();
    return; // Re-validate after creation
  }
  
  // Ensure Final Output Node has proper shader program
  if (!finalOutputNode.program) {
    console.warn('🚨 Final Output Node missing shader program! Fixing...');
    finalOutputNode.program = programs.finaloutput || programs.copy;
  }
  
  // Check if Final Output Node has valid input connections
  if (finalOutputNode.inputs[0] === null) {
    console.log('ℹ️ Final Output Node has no input connection');
  } else if (finalOutputNode.inputs[0] && !finalOutputNode.inputs[0].texture) {
    console.warn('🚨 Final Output Node input missing texture!', finalOutputNode.inputs[0]);
  }
  
  // Validate node input connections
  nodes.forEach(node => {
    node.inputs.forEach((input, index) => {
      if (input && !nodes.find(n => n === input)) {
        console.warn(`🚨 Invalid input connection found in ${node.name} input ${index}`);
        node.inputs[index] = null;
      }
    });
  });
  
  console.log('✅ Data model validation complete');
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
      
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
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
          // Output to input connection
          targetNode.inputs[targetInputIndex] = connectionStart.node;
          updateConnections();
          // Trigger auto-layout after connection
          if (autoLayoutEnabled) {
            setTimeout(() => performAutoLayout(), 100);
          }
          saveState(`Connect ${connectionStart.node.name} → ${targetNode.name}`);
        } else if (connectionStart.isOutput && isTargetControl && targetControlIndex !== null) {
          // Output to control input connection
          if (!targetNode.controlInputs) targetNode.controlInputs = [];
          targetNode.controlInputs[targetControlIndex] = connectionStart.node;
          updateConnections();
          // Trigger auto-layout after control connection
          if (autoLayoutEnabled) {
            setTimeout(() => performAutoLayout(), 100);
          }
          saveState(`Connect ${connectionStart.node.name} → ${targetNode.name} (control)`);
        } else if (!connectionStart.isOutput && isTargetOutput && connectionStart.inputIndex !== null) {
          // Input to output connection
          connectionStart.node.inputs[connectionStart.inputIndex] = targetNode;
          updateConnections();
          // Trigger auto-layout after connection
          if (autoLayoutEnabled) {
            setTimeout(() => performAutoLayout(), 100);
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
              console.log(`✅ Disconnected control input: ${outputNode.name} → ${inputNode.name} (control ${draggedConnection.controlIndex})`);
            }
          } else {
            // Remove main input connection
            if (draggedConnection.inputIndex !== null) {
              inputNode.inputs[draggedConnection.inputIndex] = null;
              console.log(`✅ Disconnected: ${outputNode.name} → ${inputNode.name} (input ${draggedConnection.inputIndex})`);
            }
          }
          
          // Update connections and save state
          updateConnections();
          // Trigger auto-layout after disconnection
          if (autoLayoutEnabled) {
            setTimeout(() => performAutoLayout(), 100);
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
          const controlPortsList = node.element?.querySelector('.control-ports-list');
          const isCollapsed = controlPortsList?.classList.contains('collapsed');
          let controlPort;
          
          if (controlPortElement && !isCollapsed) {
            // Control ports are visible - use actual port position
            const rect = controlPortElement.getBoundingClientRect();
            const svgRect = document.getElementById('connections-svg').getBoundingClientRect();
            
            // Use absolute screen coordinates relative to the SVG
            controlPort = {
              x: rect.left + rect.width / 2 - svgRect.left,
              y: rect.top + rect.height / 2 - svgRect.top
            };
          } else if (isCollapsed) {
            // Control ports are collapsed - connect to left edge of node
            const nodeRect = node.element.getBoundingClientRect();
            const svgRect = document.getElementById('connections-svg').getBoundingClientRect();
            controlPort = {
              x: nodeRect.left - svgRect.left,
              y: nodeRect.top + nodeRect.height / 2 - svgRect.top + (controlIndex - node.controlInputs.length / 2) * 8
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
  console.log('🎯 selectNode called with:', node ? node.name : 'null');
  
  // Deselect previous
  if (selectedNode) {
    selectedNode.element.classList.remove('selected');
  }

  selectedNode = node;
  if (node && node.element) {
    node.element.classList.add('selected');
  }
  
  showNodeProperties(node);
  updateCopyPasteButtons();
}

function showNodeProperties(node) {
  const panel = document.getElementById('properties-panel');
  
  if (!node) {
    panel.innerHTML = '<div class="properties-empty">Select a node to edit its properties</div>';
    return;
  }

  console.log('📋 Showing properties for node:', node.name, node.type);

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
      <h5><span class="section-icon">📥</span> Data Inputs</h5>`;
    
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

  // Add special controls for input nodes
  if (node.type === 'AudioInput') {
    html += `<div class="property-field">
      <div class="property-label">Audio Access</div>
      <button id="enable-audio-btn-${node.id}" class="create-btn" style="width: 100%;">
        ${audioEnabled ? 'Audio Input Active' : 'Enable Audio Input'}
      </button>
    </div>`;
  } else if (node.type === 'CameraInput') {
    html += `<div class="property-field">
      <div class="property-label">Camera Access</div>
      <button id="enable-camera-btn-${node.id}" class="create-btn" style="width: 100%;">
        ${cameraEnabled ? 'Camera Input Active' : 'Enable Camera Input'}
      </button>
    </div>`;
  } else if (node.type === 'RandomInput') {
    // Calculate the current mapped value for display
    const rawValue = node.randomValue || 0;
    const mappedValue = node.params.min + (rawValue * (node.params.max - node.params.min));
    const displayValue = mappedValue.toFixed(3);
    html += `<div class="property-field">
      <div class="property-label">Current Output</div>
      <div class="current-value-display">${displayValue}</div>
      <div class="help-text">Live random value (updates every ${node.params.interval} seconds)</div>
    </div>`;
  }

    // Generate property controls based on node type
    Object.entries(node.params).forEach(([key, value]) => {
    // Add units to certain parameter labels
    let labelText = key;
    if (key === 'interval' && node.type === 'RandomInput') {
      labelText = 'interval (seconds)';
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
      } else {
        html += `<input type="text" class="property-input" data-param="${key}" id="${inputId}" value="${value}">`;
      }
    }
    
    
      html += '</div>';
    });
    
    html += `</div>`;
  }
  
  // 4. Visual Preview Section (show input/output previews)
  if (node.category !== 'output') {
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
  
  // Start rendering previews
  if (node.category !== 'output') {
    requestAnimationFrame(() => updateNodePreviews(node));
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
          console.log(`Connected ${sourceNode.name} to ${node.name} input ${inputIndex}`);
        }
      } else {
        node.inputs[inputIndex] = null;
        console.log(`Disconnected input ${inputIndex} from ${node.name}`);
      }
      
      updateConnections();
      markUnsaved();
      saveState(`Change input connection`);
    });
  });
  
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
          console.log(`Connected ${controlNode.name} to ${node.name} ${paramName} control`);
        }
      } else {
        node.controlInputs[paramIndex] = null;
        console.log(`Disconnected ${paramName} control from ${node.name}`);
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
      
      console.log('Removing mapping:', { type, key, index }); // Debug log
      
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
      
      console.log('✅ Mapping removed successfully');
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
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.3;
          
          microphone.connect(analyser);
          frequencyData = new Uint8Array(analyser.frequencyBinCount);
          audioEnabled = true;
          
          audioBtn.textContent = 'Audio Input Active';
          audioBtn.disabled = true;
          audioBtn.style.background = '#10b981';
          
          console.log('✅ Audio input enabled via node properties');
        } catch (error) {
          console.error('Audio initialization failed:', error);
          audioBtn.textContent = 'Audio Access Denied';
          audioBtn.style.background = '#ef4444';
        }
      }
    });
  }

  // Add camera input button event listener
  const cameraBtn = panel.querySelector(`#enable-camera-btn-${node.id}`);
  if (cameraBtn) {
    cameraBtn.addEventListener('click', async () => {
      if (!cameraEnabled) {
        try {
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
          cameraBtn.textContent = 'Camera Input Active';
          cameraBtn.disabled = true;
          cameraBtn.style.background = '#10b981';
          
          console.log('✅ Camera input enabled via node properties');
        } catch (error) {
          console.error('Camera access error:', error);
          cameraBtn.textContent = 'Camera Access Denied';
          cameraBtn.style.background = '#ef4444';
        }
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
  
  console.log('Created audio mapping:', { audioBand, nodeId: node.id, param, min, max }); // Debug log
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
  
  
  console.log('Removed all mappings for:', { nodeId, param }); // Debug log
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
  
  console.log('Created cursor mapping:', { cursorComponent, nodeId: node.id, param, min, max });
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
  
  console.log('Created camera mapping:', { cameraComponent, nodeId: node.id, param, min, max });
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
      
      console.log('Removing mapping:', { type, key, index }); // Debug log
      
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
  const width = canvas.width;
  const height = canvas.height;
  
  // Create a temporary framebuffer to read the texture
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
    // Read pixels from the framebuffer
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    
    // Create ImageData and draw to canvas
    const imageData = ctx.createImageData(width, height);
    
    // Flip vertically while copying (WebGL has Y axis flipped)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIndex = ((height - 1 - y) * width + x) * 4;
        const dstIndex = (y * width + x) * 4;
        imageData.data[dstIndex] = pixels[srcIndex];
        imageData.data[dstIndex + 1] = pixels[srcIndex + 1];
        imageData.data[dstIndex + 2] = pixels[srcIndex + 2];
        imageData.data[dstIndex + 3] = pixels[srcIndex + 3];
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  } else {
    // Framebuffer incomplete - show error state
    ctx.fillStyle = '#440000';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#ff6666';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Error', width/2, height/2);
  }
  
  // Clean up
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(fb);
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
      console.warn(`Circular dependency detected involving node ${node.name}`);
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
        value = controlInputs.midi[ccNum].lastValue || 0.0;
      }
      break;
      
    case 'AudioInput':
      if (audioEnabled && frequencyData) {
        // Get audio level for the selected band
        const band = node.params.band;
        value = getAudioLevel(band);
      }
      break;
      
    case 'CursorInput':
      const component = node.params.component;
      if (component === 'x') {
        value = (mousePos.x / canvas.width);
      } else if (component === 'y') {
        value = (mousePos.y / canvas.height);
      }
      break;
      
    case 'CameraInput':
      // For now, just oscillate as a demo
      value = (Math.sin(time * 2) + 1) / 2;
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
      
      value = node.randomValue;
      break;
  }
  
  // Map value to node's min/max range
  const mappedValue = node.params.min + (value * (node.params.max - node.params.min));
  node.currentValue = mappedValue;
  
  // Update the properties panel display if this node is selected and it's a RandomInput
  if (node.type === 'RandomInput' && selectedNode === node) {
    const currentValueDisplay = document.querySelector('.current-value-display');
    if (currentValueDisplay) {
      currentValueDisplay.textContent = mappedValue.toFixed(3);
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
      console.warn('Skipping render frame - WebGL not healthy');
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
          console.error(`Error rendering node ${node.name}:`, error);
        }
      });

      // Temporarily disable I/O preview updates in render loop
      // if (selectedNode) {
      //   updateIOPreviews(selectedNode);
      // }

      // Render final output to canvas
      renderFinalOutput();
      
    } catch (error) {
      console.error('Error in render loop:', error);
    }
  }
  
  // Only start render loop if WebGL is healthy
  if (isWebGLHealthy()) {
    render();
  } else {
    console.warn('Cannot start render loop - WebGL not healthy');
  }
}

/**
 * Render final output - RESTORED TO SIMPLE VERSION
 */
function renderFinalOutput() {
  const finalOutputNode = nodes.find(n => n.type === 'FinalOutput');
  if (!finalOutputNode) {
    console.warn('🚨 No FinalOutput node found');
    return;
  }
  
  const connectedNode = finalOutputNode.inputs[0];
  if (!connectedNode) {
    console.warn('🚨 FinalOutput has no input connected');
    return;
  }
  
  if (!connectedNode.texture) {
    console.warn(`🚨 Connected node "${connectedNode.name}" has no texture`);
    return;
  }
  
  console.log(`🖥️ Rendering final output from: ${connectedNode.name} (${connectedNode.type})`);
  
  // Validate connected node's texture
  if (!gl.isTexture(connectedNode.texture)) {
    console.error(`🚨 Connected node "${connectedNode.name}" has invalid texture`);
    return;
  }
  
  gl.useProgram(programs.copy);
  
  const textureLocation = gl.getUniformLocation(programs.copy, "u_texture");
  if (textureLocation) {
    gl.uniform1i(textureLocation, 0);
  }
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, finalOutputNode.inputs[0].texture);
  bindQuad();
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadBuffer.numItems);
}

function renderNode(node, time) {
  // Skip deleted nodes
  if (node.deleted) {
    return;
  }
  
  if (!node.program && node.type !== 'Video' && node.category !== 'input') {
    console.warn(`🚨 SKIPPING ${node.name} (${node.type}): No program assigned`);
    return;
  }
  
  // Debug log for Layer and Mix nodes
  if (node.type === 'Layer' || node.type === 'Mix') {
    const validInputs = node.inputs.filter(n => n && !n.deleted && n.texture);
    console.log(`🎯 Rendering ${node.type} node: ${node.name}, valid inputs: ${validInputs.length}/2 [${validInputs.map(n => n.name).join(', ')}]`);
    
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
      
      console.log(`🔍 Layer ${node.name} details:`, layerInfo);
      updateDebugPanel('layer', layerInfo);
    }
    
    // Warn if insufficient inputs for blending
    if (validInputs.length < 2) {
      console.warn(`⚠️ ${node.type} node "${node.name}" has only ${validInputs.length} valid input(s), blending may not work properly`);
    }
  }
  
  if (node.type === 'Video') {
    if (node.video && node.video.readyState === node.video.HAVE_ENOUGH_DATA) {
      gl.bindTexture(gl.TEXTURE_2D, node.texture);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, node.video);
        setTextureParams();
      } catch(e) {
        // Handle video texture errors
      }
    }
    return;
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
          const value = controlNode.currentValue; // 0-1 range from input node
          
          // Handle different parameter types
          if (paramName === 'colorPalette') {
            // Map 0-1 value to available color palettes
            const paletteNames = Object.keys(colorPalettes);
            const paletteIndex = Math.floor(value * paletteNames.length);
            const clampedIndex = Math.min(paletteIndex, paletteNames.length - 1);
            node.params[paramName] = paletteNames[clampedIndex];
          } else if (paramName === 'colorIndex') {
            // Map 0-1 value to color index range (usually 0-12)
            const maxIndex = 12;
            node.params[paramName] = value * maxIndex;
          } else if (typeof node.params[paramName] === 'number') {
            // Handle numeric parameters
            let scaledValue = value;
            
            // Scale based on parameter type
            if (paramName === 'rotation') {
              scaledValue = value * 360; // 0-360 degrees
            } else if (paramName === 'positionX' || paramName === 'positionY') {
              scaledValue = (value - 0.5) * 2; // -1 to 1 range
            } else if (paramName === 'scaleX' || paramName === 'scaleY') {
              scaledValue = value * 3; // 0-3 range
            } else if (paramName === 'frequency') {
              scaledValue = value * 50; // 0-50 range
            } else if (paramName === 'slices') {
              scaledValue = Math.floor(value * 12) + 1; // 1-12 range
            }
            
            // Apply the scaled value to the parameter
            node.params[paramName] = scaledValue;
          }
        }
      }
    });
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
    console.warn(`Node ${node.name} has invalid framebuffer - skipping render`);
    return;
  }
  
  // CRITICAL: Check for framebuffer-texture feedback loop before rendering
  const hasTextureAttachedToCurrentFBO = node.inputs.some(inputNode => {
    if (!inputNode || inputNode.deleted || !inputNode.texture) return false;
    
    // Check if any input texture is attached to the framebuffer we're about to render to
    if (inputNode.fbo === node.fbo) {
      console.warn(`🚨 FRAMEBUFFER-TEXTURE FEEDBACK DETECTED: ${node.name} trying to use texture from same framebuffer`);
      return true;
    }
    return false;
  });
  
  if (hasTextureAttachedToCurrentFBO) {
    console.warn(`🚨 FEEDBACK LOOP: Skipping render for ${node.name} (${node.type}) to prevent WebGL feedback loop`);
    return;
  }
  
  try {
    bindQuad();
    
    // Clear any errors before framebuffer operations
    let error = gl.getError();
    while (error !== gl.NO_ERROR) {
      console.warn(`Clearing previous error before ${node.name} framebuffer ops:`, error);
      error = gl.getError();
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, node.fbo);
    
    // Check for framebuffer binding errors
    error = gl.getError();
    if (error !== gl.NO_ERROR) {
      console.error(`🚨 Error binding framebuffer for ${node.name}:`, error);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return;
    }
    
    // Check framebuffer status before rendering
    const fbStatus = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (fbStatus !== gl.FRAMEBUFFER_COMPLETE) {
      console.error(`🚨 Framebuffer incomplete for ${node.name}:`, fbStatus);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return;
    }
  } catch (e) {
    console.error(`Exception during framebuffer setup for ${node.name}:`, e);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return;
  }
  
  gl.viewport(0, 0, canvas.width, canvas.height);
  
  // Clear any previous WebGL errors before drawing
  let error = gl.getError();
  while (error !== gl.NO_ERROR) {
    console.warn(`Clearing previous WebGL error before ${node.name} render:`, error);
    error = gl.getError();
  }
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, quadBuffer.numItems);
  
  // Check for errors after drawing
  error = gl.getError();
  if (error !== gl.NO_ERROR) {
    console.error(`🚨 WebGL error after rendering ${node.name}:`, error);
  }
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
      console.warn('I/O preview error:', error);
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
        
        // Check for debug mode
        if (window.debugLayerSplit && node.type === 'Layer') {
          modeValue = -1; // This triggers split view in shader
          console.log(`🔍 Layer ${node.name} in DEBUG SPLIT VIEW mode`);
        }
        
        console.log(`🎨 Setting blend mode for ${node.name}: "${value}" -> ${modeValue}, loc:`, loc);
        if (loc !== null && loc !== -1) {
          gl.uniform1f(loc, parseFloat(modeValue));
          // Verify the uniform was set
          const error = gl.getError();
          if (error !== gl.NO_ERROR) {
            console.error(`WebGL error setting blendMode uniform:`, error);
          }
        } else {
          console.error(`❌ Could not find uniform location for u_blendMode in ${node.name}`);
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
          console.error('Color palette not found:', value);
        }
      }
    }
  });

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
 */
function bindNodeInputTextures(node) {
  // Debug Layer inputs before binding
  if (node.type === 'Layer') {
    console.log(`🎯 Layer ${node.name} has ${node.inputs.length} inputs:`, 
      node.inputs.map((inp, i) => inp ? `${i}: ${inp.name}` : `${i}: empty`));
    
    // Verify both inputs have valid textures
    node.inputs.forEach((inp, i) => {
      if (inp && inp.texture) {
        console.log(`   Input ${i} (${inp.name}): texture=${inp.texture}, valid=${gl.isTexture(inp.texture)}`);
      } else {
        console.log(`   Input ${i}: NO TEXTURE`);
      }
    });
  }

  // Set input textures
  node.inputs.forEach((inputNode, index) => {
    if (inputNode && inputNode.texture && !inputNode.deleted) {
      // PREVENT FEEDBACK LOOP: Enhanced detection for Mix/Layer nodes
      if (inputNode === node) {
        console.warn(`Preventing direct feedback loop: ${node.name} cannot use itself as input`);
        return;
      }
      
      // PREVENT INDIRECT FEEDBACK LOOP: Check if inputNode depends on current node
      if (nodeHasDependency(inputNode, node)) {
        console.warn(`Preventing indirect feedback loop: ${node.name} -> ${inputNode.name} -> ... -> ${node.name}`);
        return;
      }
      
      // Validate texture before binding
      if (!gl.isTexture(inputNode.texture)) {
        console.warn(`Input node ${inputNode.name} has invalid texture - using fallback`);
        inputNode.texture = createFallbackTexture();
        if (!inputNode.texture) {
          console.error(`Failed to create fallback texture for ${inputNode.name}`);
          return;
        }
      }
      
      // Simple texture binding without problematic validation
      try {
        gl.bindTexture(gl.TEXTURE_2D, inputNode.texture);
      } catch (e) {
        console.warn(`Failed to bind texture for ${inputNode.name}, using fallback`);
        inputNode.texture = createFallbackTexture();
        gl.bindTexture(gl.TEXTURE_2D, inputNode.texture);
      }
      
      // Special handling for multi-input nodes that expect numbered textures starting from 1
      const isMultiInputNode = node.type === 'Mix' || node.type === 'Layer' || node.type === 'Composite';
      const uniformName = isMultiInputNode ? `u_texture${index + 1}` : (index === 0 ? "u_texture" : `u_texture${index + 1}`);
      const loc = gl.getUniformLocation(node.program, uniformName);
      if (loc !== null && loc !== -1) {
        // For Layer/Mix/Composite nodes, texture unit should match the uniform number
        const textureUnit = isMultiInputNode ? index : index;
        gl.activeTexture(gl.TEXTURE0 + textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, inputNode.texture);
        gl.uniform1i(loc, textureUnit);
        
        // Debug logging for Layer nodes
        if (node.type === 'Layer') {
          console.log(`🔗 Layer ${node.name} binding: Input ${index} (${inputNode.name}) -> ${uniformName} on texture unit ${textureUnit}, uniform location: ${loc}`);
          
          // Test if we can read back the uniform value
          const testVal = gl.getUniform(node.program, loc);
          console.log(`   Uniform ${uniformName} value after setting: ${testVal}`);
          
          // Verify texture is bound
          gl.activeTexture(gl.TEXTURE0 + textureUnit);
          const boundTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
          console.log(`   Texture unit ${textureUnit} has texture: ${boundTexture === inputNode.texture ? '✅ Correct' : '❌ Wrong'} (${boundTexture})`);
        }
        
        // Verify texture binding succeeded
        const bindError = gl.getError();
        if (bindError !== gl.NO_ERROR) {
          console.error(`🚨 Error binding texture for ${inputNode.name} to ${uniformName}:`, bindError);
        }
      } else {
        // Only warn if this is actually an expected uniform (not just an unconnected optional input)
        if (node.type === 'Layer' || node.type === 'Mix' || node.type === 'Composite') {
          console.warn(`⚠️ Could not find uniform ${uniformName} in ${node.name} shader - this may indicate a shader compilation issue`);
        }
      }
    }
  });
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
  const posLoc = gl.getAttribLocation(gl.getParameter(gl.CURRENT_PROGRAM), "a_position");
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
      const selectedNode = nodes.find(n => n.id === nodeId);
      if (selectedNode) {
        canvasDisplayNode.inputs[0] = selectedNode;
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
    
    node.x = 50 + col * 250;
    node.y = 50 + row * 150;
    
    if (node.element) {
      node.element.style.left = node.x + 'px';
      node.element.style.top = node.y + 'px';
    }
  });
  
  console.log(`📐 fitGraphToView: Arranged ${nodesToFit.length} nodes in grid (Canvas excluded)`);
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
          console.log("Connected to MIDI device:", midiIn.name);
        }
      })
      .catch(err => console.warn("MIDI access failed:", err));
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
      const normalizedValue = ccVal / 127;
      const mappedValue = mapping.min + normalizedValue * (mapping.max - mapping.min);
      applyControlInput(mapping.nodeId, mapping.param, mappedValue);
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
      
      const mappedValue = mapping.min + bandValue * (mapping.max - mapping.min);
      applyControlInput(mapping.nodeId, mapping.param, mappedValue);
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
    // Special handling for string parameters
    if (paramName === 'colorPalette') {
      // Map 0-1 audio value to available color palettes
      const paletteNames = Object.keys(colorPalettes);
      const index = Math.floor(value * paletteNames.length);
      const clampedIndex = Math.min(index, paletteNames.length - 1);
      node.params[paramName] = paletteNames[clampedIndex];
    } else {
      // Normal numeric parameter
      node.params[paramName] = value;
    }
    updateNodeProperties(node); // Refresh UI if node is selected
    
    // Save state for MIDI parameter changes
    clearTimeout(parameterChangeTimeout);
    parameterChangeTimeout = setTimeout(() => {
      saveState(`MIDI Change ${paramName}`);
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
      const mappedValue = mapping.min + componentValue * (mapping.max - mapping.min);
      applyControlInput(mapping.nodeId, mapping.param, mappedValue);
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
  
  console.log('🖱️ Cursor input system initialized');
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
  
  console.log('🖱️ Cursor tracking started');
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
      const mappedValue = mapping.min + componentValue * (mapping.max - mapping.min);
      applyControlInput(mapping.nodeId, mapping.param, mappedValue);
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
 * Initialize Control Input Manager
 */
function initControlInputManager() {
  const existingSelect = document.getElementById('existing-control-inputs');
  const newTypeSelect = document.getElementById('new-control-input-type');
  const statusSpan = document.getElementById('control-input-status');
  
  if (!existingSelect || !newTypeSelect || !statusSpan) {
    console.warn('Control Input Manager elements not found');
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
    const validTypes = ['MIDIInput', 'AudioInput', 'CursorInput', 'CameraInput', 'RandomInput'];
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
    
    console.log(`✅ Created ${type} node:`, node.name);
    
    return node;
    
  } catch (error) {
    console.error('Error creating control input node:', error);
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
    'RandomInput': 'Random Generator'
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
  
  try {
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
    
    console.log('📸 Camera input enabled');
    
  } catch (error) {
    console.error('Camera access error:', error);
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
  document.getElementById('camera-brightness').textContent = cameraComponents.brightness.value.toFixed(3);
  document.getElementById('camera-motion').textContent = cameraComponents.motion.value.toFixed(3);
  document.getElementById('camera-red').textContent = cameraComponents.redAvg.value.toFixed(3);
  document.getElementById('camera-green').textContent = cameraComponents.greenAvg.value.toFixed(3);
  document.getElementById('camera-blue').textContent = cameraComponents.blueAvg.value.toFixed(3);
  document.getElementById('camera-contrast').textContent = cameraComponents.contrast.value.toFixed(3);
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
      const mappedValue = mapping.min + componentValue * (mapping.max - mapping.min);
      applyControlInput(mapping.nodeId, mapping.param, mappedValue);
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
    console.log(`↶ Undid: ${previousState.action}`);
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
    console.log(`↷ Redid: ${nextState.action}`);
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
    console.log('No node selected to copy');
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
  
  console.log(`📋 Copied ${selectedNodes.length} node(s) to clipboard`);
  updateCopyPasteButtons();
}

function pasteNodes() {
  if (!clipboard || clipboard.type !== 'nodes') {
    console.log('Nothing to paste');
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
  
  console.log(`📋 Pasted ${pastedNodes.length} node(s)`);
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
  
  console.log(`📋 Copied group "${groupName}" (${groupNodes.length} nodes) to clipboard`);
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
      name: projectData.name || 'Untitled Synthesis',
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
        if (node.type === 'Video') {
          initVideoNode(node);
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
        console.log('✅ Restored Canvas connection to:', connectedNode.name);
      }
    }
    
    // Ensure FinalOutput node is always the main output
    if (finalOutputNode) {
      setMainOutput(finalOutputNode);
      console.log('✅ Set FinalOutput as main output after project restore');
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
    
    // Update UI
    updateMainOutputDropdown();
    updateMainOutputVisualIndicator();
    updateConnections();
    updateGroupsList();
    updateProjectTitle();
    
    // Final verification of main output consistency
    const dropdown = document.getElementById('main-output-select');
    const dropdownValue = dropdown?.value;
    const dropdownNodeId = dropdownValue ? parseInt(dropdownValue) : null;
    const actualMainOutputId = mainOutputNode?.id;
    
    // Handle empty dropdown value (happens during undo/redo)
    if (!dropdownValue || isNaN(dropdownNodeId)) {
      console.warn('⚠️ Main output dropdown has invalid value during undo/redo, fixing...');
      updateMainOutputDropdown();
    } else if (dropdownNodeId !== actualMainOutputId) {
      console.error('🚨 Main output sync error detected!', {
        dropdown: dropdownNodeId,
        actual: actualMainOutputId,
        mainOutputNode: mainOutputNode?.name
      });
      // Force sync by calling setMainOutput again
      setMainOutput(mainOutputNode);
    } else {
      console.log('✅ Main output sync verified:', mainOutputNode?.name, `(ID: ${actualMainOutputId})`);
    }
    
    hasUnsavedChanges = false;
    console.log(`📄 Loaded project: ${currentProject.name}`);
    
  } catch (error) {
    console.error('Failed to load project:', error);
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
    console.log(`Saved project: ${currentProject.name}`);
    showNotification(`Saved "${currentProject.name}"`);
  } catch (error) {
    console.error('Failed to save project:', error);
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
    name: 'Untitled Synthesis',
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
    console.error('Failed to read projects from storage:', error);
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
  console.log(`📁 ${message}`);
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
              console.log(`🔄 ${file.name} file updated`);
              hasChanges = true;
            }
          }
        }
      } catch (error) {
        // Silently fail for individual files to avoid console spam
        // Only log if it's not a typical CORS/fetch restriction
        if (!error.message.includes('fetch')) {
          console.warn(`Failed to check ${file.name}:`, error);
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
    console.warn('Update check failed:', error);
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
    console.log('💾 Saved project state for update restoration');
  } catch (error) {
    console.error('Failed to save project state:', error);
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
    console.error('Error saving autosave project:', error);
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
    console.log('🔄 Restoring autosaved project...');
    clearProject();
    deserializeProject(autosaveData.project);
    console.log(`✅ Restored autosaved project with ${nodes.length} nodes`);
    
    // Verify main output consistency after restoration
    const dropdown = document.getElementById('main-output-select');
    const dropdownNodeId = parseInt(dropdown.value);
    const actualMainOutputId = mainOutputNode?.id;
    
    if (dropdownNodeId !== actualMainOutputId) {
      console.error('🚨 Main output sync error after autosave restoration!', {
        dropdown: dropdownNodeId,
        actual: actualMainOutputId,
        mainOutputNode: mainOutputNode?.name
      });
      // Force sync
      setMainOutput(mainOutputNode);
    } else {
      console.log('✅ Main output sync verified after autosave restoration:', mainOutputNode?.name);
    }
    
    // Restore unsaved status
    hasUnsavedChanges = autosaveData.wasUnsaved;
    updateProjectTitle();
    
    // Show restoration notification
    console.log('📄 Project restored from autosave');
    
    return true;
    
  } catch (error) {
    console.error('Failed to restore autosaved project:', error);
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
    console.log('🔄 Clearing current project and restoring from backup...');
    clearProject();
    deserializeProject(lastProjectData.project);
    console.log(`✅ Restored project with ${nodes.length} nodes`);
    
    // Verify main output consistency after restoration
    const dropdown = document.getElementById('main-output-select');
    const dropdownNodeId = parseInt(dropdown.value);
    const actualMainOutputId = mainOutputNode?.id;
    
    if (dropdownNodeId !== actualMainOutputId) {
      console.error('🚨 Main output sync error after restoration!', {
        dropdown: dropdownNodeId,
        actual: actualMainOutputId,
        mainOutputNode: mainOutputNode?.name
      });
      // Force sync
      setMainOutput(mainOutputNode);
    } else {
      console.log('✅ Main output sync verified after restoration:', mainOutputNode?.name);
    }
    
    // Restore unsaved status
    hasUnsavedChanges = lastProjectData.wasUnsaved;
    updateProjectTitle();
    
    // Clean up the restoration data
    localStorage.removeItem(LAST_PROJECT_KEY);
    
    // Show restoration notification
    showTemporaryNotification('✅ Project restored after update', 3000);
    
    console.log('🔄 Successfully restored project after update');
    return true;
    
  } catch (error) {
    console.error('Failed to restore project:', error);
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
  
  console.log(`🚀 Visual Synthesizer v${APP_VERSION} initialized`);
  
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
    console.error('Error creating shareable URL:', error);
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
    
    console.log('🔗 Loading project from URL...');
    
    const compressed = decodeURIComponent(escape(atob(projectParam)));
    const jsonString = LZString.decompress(compressed);
    
    if (!jsonString) {
      console.error('Failed to decompress project data');
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
    
    console.log(`✅ Loaded shared project: ${projectData.name || 'Untitled'}`);
    
    // Clear URL parameter
    window.history.replaceState({}, document.title, window.location.pathname);
    
    return true;
    
  } catch (error) {
    console.error('Error loading project from URL:', error);
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
    
    console.log(`✅ Imported project: ${projectData.name || 'Untitled'}`);
    return true;
    
  } catch (error) {
    console.error('Error importing project:', error);
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
    console.log('URL copied to clipboard');
  }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);