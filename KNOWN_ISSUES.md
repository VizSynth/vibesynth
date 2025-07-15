# Known Issues - Web Visual Synthesizer

## Critical Issues

### 1. Layer Node Texture Binding Failure [FIXED]
**Status**: ✅ FIXED  
**Description**: Layer nodes were not properly reading from both input textures. Both texture samplers were reading from the same texture unit.

**Solution Applied**:
- Rewrote texture binding logic to bind all textures first, then set uniforms
- Fixed texture unit assignment ensuring each sampler gets the correct unit index
- Added swap inputs button (⇄) to easily reverse base/blend layers
- Added debug indicators (disabled by default) to verify texture sampling

### 2. Input/Output Preview Canvases Not Rendering
**Status**: 🔴 CRITICAL  
**Description**: The preview canvases in the node properties panel remain blank/black.

**Symptoms**:
- Input preview canvases show "No Input" even when inputs are connected
- Output preview canvas remains black
- No WebGL errors in console related to preview rendering

**Root Cause Analysis**:
- `drawTextureToCanvas()` function may have framebuffer issues
- Possible timing issue with preview updates
- Canvas context or WebGL state conflicts

### 3. WebGL Texture Validation Errors
**Status**: 🟡 MODERATE  
**Description**: Multiple WebGL errors related to texture operations.

**Symptoms**:
- "Error getting texture parameters" warnings
- Invalid enum errors (1280) when validating textures
- Fallback textures being created unnecessarily

**Root Cause Analysis**:
- Removed problematic `gl.getTexParameter()` calls but issues persist
- Texture state validation happening at wrong times
- Possible texture deletion/recreation timing issues

## Non-Critical Issues

### 4. Control Input Connections Not Working
**Status**: 🟡 MODERATE  
**Description**: The new unified connection UI for control inputs may not be properly connecting control nodes.

**Symptoms**:
- Control input dropdowns show available nodes but connections may not update parameters
- No visual feedback for active control connections

### 5. Debug Console Spam
**Status**: 🟢 MINOR  
**Description**: Excessive console logging making it hard to diagnose issues.

**Symptoms**:
- Repeated texture binding logs
- Uniform value logs showing incorrect values
- Makes it difficult to spot actual errors

## Fix Priority Plan

### Phase 1: Fix Layer Texture Binding (CRITICAL)
1. **Diagnose why uniforms show value 0**
   - Check if shader program is active when setting uniforms
   - Verify texture unit integers are being passed correctly
   - Test with hardcoded texture units

2. **Rewrite texture binding logic**
   - Separate texture setup from uniform setting
   - Ensure proper GL state management
   - Add texture unit state tracking

3. **Verify shader compilation**
   - Check if Layer shader has all uniforms defined
   - Test with simplified shader first

### Phase 2: Fix Preview System (CRITICAL)
1. **Debug drawTextureToCanvas function**
   - Add error checking for framebuffer operations
   - Verify canvas contexts are valid
   - Check for GL state conflicts

2. **Implement robust preview pipeline**
   - Use separate framebuffers for previews
   - Add proper error recovery
   - Implement fallback rendering

### Phase 3: Clean Up WebGL Errors (MODERATE)
1. **Remove unnecessary texture validation**
   - Only validate textures when absolutely necessary
   - Trust WebGL state after successful operations

2. **Implement proper error boundaries**
   - Catch and handle specific WebGL errors
   - Provide meaningful fallbacks

### Phase 4: Verify Control System (MODERATE)
1. **Test control input connections**
   - Verify parameter updates from control nodes
   - Add visual indicators for active connections

### Phase 5: Reduce Debug Noise (MINOR)
1. **Implement debug levels**
   - Add toggleable debug categories
   - Reduce repetitive logging
   - Keep only essential error messages

## Testing Protocol

After each fix:
1. Test Layer node with two different inputs
2. Verify preview canvases update in real-time
3. Check console for WebGL errors
4. Test all blend modes
5. Verify control inputs update parameters
6. Run full node graph with multiple connections

## Success Criteria

- Layer nodes properly blend two different input textures
- All blend modes produce visually distinct results
- Preview canvases show real-time texture content
- No WebGL errors in console during normal operation
- Control inputs successfully modulate parameters
- Console output is clean and informative