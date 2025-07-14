# Layer Blending Debug & Fix Plan

## Problem Statement
Layer node blend modes (Normal, Multiply, Screen, Overlay) all produce identical visual output, indicating the blending shader is not functioning correctly despite:
- ✅ Debug panel showing both inputs with valid textures
- ✅ Blend mode parameter being set correctly  
- ✅ Shader compilation success
- ✅ No texture binding errors

## Root Cause Analysis Plan

### Phase 1: Shader Uniform Verification
**Goal**: Verify blend mode uniform is reaching the shader correctly

1. **Add shader uniform logging**
   - Log exactly what value `u_blendMode` receives
   - Verify uniform location is found correctly
   - Check if uniform is being overwritten

2. **Add fragment shader debugging**
   - Insert debug colors in each blend mode branch
   - Force different colors for each blend mode to verify which branch executes

### Phase 2: Texture Input Verification  
**Goal**: Verify both textures are actually being sampled correctly

1. **Test single texture inputs**
   - Force shader to output only `u_texture1` (should show oscillator pattern)
   - Force shader to output only `u_texture2` (should show red fallback)
   
2. **Add texture sampling debug**
   - Output texture coordinates to verify UV mapping
   - Check if textures are bound to correct texture units

### Phase 3: Blend Function Testing
**Goal**: Test blend math is working correctly

1. **Test blend functions with known inputs**
   - Use solid colors instead of textures to test blend math
   - Create test patterns that should produce obvious differences

2. **Verify alpha handling**
   - Check if alpha values are interfering with blending
   - Test with fully opaque colors

### Phase 4: WebGL State Investigation
**Goal**: Check if WebGL state is interfering

1. **Verify texture unit bindings**
   - Check if texture units 0 and 1 are correctly bound
   - Verify no other code is rebinding textures

2. **Check render state**
   - Verify blend state is correct
   - Check if any other WebGL state is interfering

## Implementation Steps

### Step 1: Enhanced Debug Shader
Create a debug version of Layer shader that outputs different colors for each blend mode:

```glsl
if (u_blendMode == 0) {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red for Normal
} else if (u_blendMode == 1) {
  gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Green for Multiply  
} else if (u_blendMode == 2) {
  gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // Blue for Screen
} else if (u_blendMode == 3) {
  gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); // Yellow for Overlay
}
```

### Step 2: Texture Input Verification
Add debug mode to output each texture separately:

```glsl
// Debug: output texture 1 only
gl_FragColor = texture2D(u_texture1, v_uv);
// Debug: output texture 2 only  
gl_FragColor = texture2D(u_texture2, v_uv);
```

### Step 3: Uniform Value Logging
Add comprehensive logging of all uniform values:
- Blend mode value received
- Opacity value 
- Texture unit bindings
- Uniform locations

### Step 4: Working Blend Implementation
Once root cause is found, implement correct blending:
- Fix uniform binding if broken
- Fix texture sampling if broken  
- Fix blend math if broken
- Add proper alpha handling

## Success Criteria
- Different blend modes produce visually different results
- Screen mode significantly brighter than Multiply
- Normal mode shows proper alpha blending
- Overlay mode shows complex mixing pattern

## Next Actions
1. Implement debug shader first
2. Test each phase systematically  
3. Fix identified issues
4. Verify all blend modes work correctly