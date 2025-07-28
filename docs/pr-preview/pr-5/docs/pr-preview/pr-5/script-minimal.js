// MINIMAL WORKING WEBGL IMPLEMENTATION
// This is a simplified version to get visualizations working immediately

// Keep only essential globals
let gl, canvas, programs = {}, nodes = [], mainOutputNode;
let quadBuffer, startTime = Date.now();
let animationFrameId;

// Simple node class
class SynthNode {
  constructor(type, x, y) {
    this.id = Date.now() + Math.random();
    this.type = type;
    this.name = type;
    this.x = x;
    this.y = y;
    this.inputs = [null];
    this.params = { frequency: 10.0 };
    this.enabled = true;
    this.deleted = false;
  }
}

// Initialize WebGL
function initWebGL() {
  canvas = document.getElementById('glcanvas');
  gl = canvas.getContext('webgl');
  
  if (!gl) {
    console.error('WebGL not supported');
    return false;
  }
  
  // Create basic shader program
  const vertexShader = createShader(gl.VERTEX_SHADER, `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `);
  
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_frequency;
    
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float wave = sin(uv.x * u_frequency + u_time);
      gl_FragColor = vec4(wave * 0.5 + 0.5, uv.y, 1.0 - uv.x, 1.0);
    }
  `);
  
  programs.oscillator = createProgram(vertexShader, fragmentShader);
  programs.copy = createProgram(vertexShader, createShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    uniform sampler2D u_texture;
    uniform vec2 u_resolution;
    
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      gl_FragColor = texture2D(u_texture, uv);
    }
  `));
  
  // Create quad buffer
  quadBuffer = {
    buf: gl.createBuffer(),
    numItems: 4
  };
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer.buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  
  return true;
}

function createShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

function createProgram(vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

// Simple render node
function renderNode(node, time) {
  if (!node.program || !node.fbo) return;
  
  gl.useProgram(node.program);
  gl.uniform2f(gl.getUniformLocation(node.program, "u_resolution"), canvas.width, canvas.height);
  gl.uniform1f(gl.getUniformLocation(node.program, "u_time"), time);
  gl.uniform1f(gl.getUniformLocation(node.program, "u_frequency"), node.params.frequency);
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, node.fbo);
  gl.viewport(0, 0, canvas.width, canvas.height);
  
  const posLoc = gl.getAttribLocation(node.program, "a_position");
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer.buf);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
  
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

// Simple render loop
function startRenderLoop() {
  function render() {
    animationFrameId = requestAnimationFrame(render);
    
    const elapsed = (Date.now() - startTime) / 1000.0;
    
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    // Render all nodes
    nodes.forEach(node => {
      if (node.enabled && !node.deleted) {
        renderNode(node, elapsed);
      }
    });
    
    // Render final output
    if (mainOutputNode && mainOutputNode.texture && programs.copy) {
      gl.useProgram(programs.copy);
      gl.uniform1i(gl.getUniformLocation(programs.copy, "u_texture"), 0);
      gl.uniform2f(gl.getUniformLocation(programs.copy, "u_resolution"), canvas.width, canvas.height);
      
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, mainOutputNode.texture);
      
      const posLoc = gl.getAttribLocation(programs.copy, "a_position");
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer.buf);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  }
  
  render();
}

// Create a simple oscillator node for testing
function createTestNode() {
  const node = new SynthNode('Oscillator', 100, 100);
  node.program = programs.oscillator;
  
  // Create texture and framebuffer
  node.texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, node.texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  
  node.fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, node.fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, node.texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  nodes.push(node);
  mainOutputNode = node;
  
  return node;
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  if (initWebGL()) {
    createTestNode();
    startRenderLoop();
    console.log('✅ Minimal WebGL visualization working!');
  }
});