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

### 2. Input/Output Preview Canvases [FIXED]
**Status**: ✅ FIXED  
**Description**: The preview canvases in the node properties panel were blank/black.

**Solution Applied**:
- Implemented complete `drawTextureToCanvas()` function with proper error handling
- Added WebGL state preservation and restoration
- Proper framebuffer creation and cleanup
- Error states show "Error" text instead of black canvas

### 3. WebGL Texture Validation Errors [FIXED]
**Status**: ✅ FIXED  
**Description**: Multiple WebGL errors related to texture operations.

**Solution Applied**:
- Removed all problematic `gl.getTexParameter()` calls
- Eliminated unnecessary texture validation
- No more "Error getting texture parameters" or Invalid enum (1280) errors
- Textures are trusted after successful creation

## Non-Critical Issues

### 4. Control Input Connections [FIXED]
**Status**: ✅ FIXED  
**Description**: Control input connections now properly visualized and functional.

**Solution Applied**:
- Control connections are drawn with proper visual feedback
- Handles both expanded and collapsed control port states
- Visual connections update in real-time
- Control inputs successfully modulate parameters

### 5. Debug Console Spam [FIXED]
**Status**: ✅ FIXED  
**Description**: Excessive console logging making it hard to diagnose issues.

**Solution Applied**:
- Implemented Logger framework with configurable levels (ERROR, WARN, INFO, DEBUG, TRACE)
- Converted all console.log/warn/error calls to use Logger
- Removed temporary debug functions and test helpers
- Default log level set to INFO for clean console output

## Currently Open Issues

### 1. Composite Node Rendering [FIXED]
**Status**: ✅ FIXED  
**Description**: Composite nodes were showing black output instead of blended inputs.

**Solution Applied**:
- Fixed u_activeInputs uniform handling
- Rewrote shader to use additive blending with opacity normalization
- Converted integer comparisons to float for WebGL ES compatibility

### 2. Auto-Layout System [ENHANCED]
**Status**: ✅ ENHANCED  
**Description**: Auto-layout system has been modernized with ELK.js and Dagre.

**Recent Improvements**:
- Integrated ELK.js for professional layered graph layouts
- Added Dagre as fallback for hierarchical layouts
- Auto-layout enabled by default
- Disables automatically when user drags nodes
- Re-runs after connection changes
- Visual feedback during layout operation

## Testing Protocol

Regular testing should include:
1. Test Layer node with multiple blend modes
2. Verify preview canvases show real-time updates
3. Check console remains clean (use Logger panel to adjust verbosity)
4. Test control input parameter modulation
5. Verify auto-layout behavior with complex graphs
6. Test Composite node with 1-4 inputs

## Success Criteria

✅ Layer nodes properly blend textures with all blend modes
✅ Preview canvases display real-time content
✅ No WebGL errors during normal operation
✅ Control inputs successfully modulate parameters
✅ Clean console output with configurable logging
✅ Professional auto-layout with user-friendly behavior
✅ Composite nodes blend multiple inputs correctly

## Future Enhancements

1. **Performance Optimization**
   - Implement texture pooling for better memory management
   - Add level-of-detail for complex graphs
   
2. **User Experience**
   - Add more keyboard shortcuts
   - Implement node search/filter functionality
   
3. **Advanced Features**
   - Add more node types (Feedback, Delay, etc.)
   - Implement node presets/templates
   - Add MIDI learn functionality