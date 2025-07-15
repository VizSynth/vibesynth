# Fix Plan - Layer Texture Binding Issue

## Immediate Actions

### Step 1: Simplify and Test Layer Shader
Create a minimal test to verify the shader can read both textures:

```javascript
// Test shader that shows red for texture1, green for texture2
const testLayerShader = `
  precision mediump float;
  uniform sampler2D u_texture1;
  uniform sampler2D u_texture2;
  varying vec2 v_uv;
  
  void main() {
    vec4 tex1 = texture2D(u_texture1, v_uv);
    vec4 tex2 = texture2D(u_texture2, v_uv);
    
    // Debug output: red channel from tex1, green channel from tex2
    gl_FragColor = vec4(tex1.r, tex2.g, 0.0, 1.0);
  }
`;
```

### Step 2: Fix Texture Unit Assignment
The current code has issues with texture unit assignment. Fix:

```javascript
// Current problematic code:
gl.uniform1i(loc, textureUnit);

// Should be:
gl.uniform1i(loc, index); // For numbered textures (u_texture1 = 0, u_texture2 = 1)
```

### Step 3: Ensure Proper Shader State
Make sure textures are bound AFTER program is in use:

```javascript
// Correct order:
gl.useProgram(node.program);
// Set uniforms
setNodeUniforms(node);
// Then bind textures
bindNodeInputTextures(node);
```

### Step 4: Fix Preview System
The preview system needs a complete rewrite:

```javascript
function drawTextureToCanvas(texture, canvas) {
  const ctx = canvas.getContext('2d');
  
  // Save current WebGL state
  const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
  const currentFramebuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
  
  // Use copy shader to render texture
  gl.useProgram(programs.copy);
  
  // Create temporary framebuffer
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  
  // ... render to canvas ...
  
  // Restore WebGL state
  gl.useProgram(currentProgram);
  gl.bindFramebuffer(gl.FRAMEBUFFER, currentFramebuffer);
  gl.deleteFramebuffer(fb);
}
```

## Implementation Order

### Phase 1: Emergency Fix (Layer Texture Binding)
1. Remove all debugging logs temporarily
2. Hardcode texture unit assignments for Layer nodes
3. Test with simple two-color inputs
4. Verify both textures are visible

### Phase 2: Proper Fix
1. Rewrite `bindNodeInputTextures` to handle texture units correctly
2. Ensure uniforms are set with correct values (0 for TEXTURE0, 1 for TEXTURE1)
3. Add state management to track active textures
4. Implement proper error recovery

### Phase 3: Preview System
1. Implement WebGL state preservation
2. Create dedicated preview rendering pipeline
3. Add fallback to 2D canvas rendering if WebGL fails
4. Test with various node types

### Phase 4: Cleanup
1. Remove excessive logging
2. Add debug mode toggle
3. Implement proper error boundaries
4. Document the texture binding process

## Quick Test Code

Add this to console to test if shaders can access textures:

```javascript
// Test if Layer shader has correct uniforms
const layer = nodes.find(n => n.type === 'Layer');
if (layer && layer.program) {
  gl.useProgram(layer.program);
  const loc1 = gl.getUniformLocation(layer.program, 'u_texture1');
  const loc2 = gl.getUniformLocation(layer.program, 'u_texture2');
  console.log('u_texture1 location:', loc1);
  console.log('u_texture2 location:', loc2);
  
  // Try setting uniforms manually
  if (loc1 !== null) gl.uniform1i(loc1, 0);
  if (loc2 !== null) gl.uniform1i(loc2, 1);
  
  // Check values
  console.log('u_texture1 value:', gl.getUniform(layer.program, loc1));
  console.log('u_texture2 value:', gl.getUniform(layer.program, loc2));
}
```

## Verification Steps

1. After each fix, test with:
   - Two oscillators with different colors → Layer node → Canvas
   - Verify split debug view shows different content on each side
   - Test all blend modes produce different results

2. Check console for:
   - No WebGL errors
   - Uniform values are 0 and 1 (not both 0)
   - Textures are bound to correct units

3. Visual verification:
   - Normal mode: should show mostly second input
   - Multiply mode: should darken
   - Screen mode: should lighten
   - Overlay mode: should show contrast

## Root Cause Summary

The main issue appears to be that texture uniforms are being set incorrectly:
1. Both uniforms are receiving value 0 instead of 0 and 1
2. This causes both texture samplers to read from TEXTURE0
3. The shader ends up sampling the same texture twice

The fix is to ensure:
- `u_texture1` uniform is set to 0 (TEXTURE0)
- `u_texture2` uniform is set to 1 (TEXTURE1)
- Textures are bound to the correct texture units
- All of this happens while the correct shader program is active