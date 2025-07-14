# Known Issues

## 2025-07-14 - Layer Blend Modes

**Issue**: Layer node blend modes change the output but don't produce correct Photoshop-style blending effects
**Status**: Partially fixed - blend mode value reaches shader but visual results incorrect
**Details**:
- Debug color bars change correctly (red/green/blue/yellow)
- Blend mode uniform is being set correctly
- Output changes between modes but doesn't match expected behavior
- Multiply should be darker, Screen should be brighter
**Next Steps**: 
- Verify both input textures are different
- Check if textures are binding to correct units
- Test with simplified shader to isolate issue & Bug Tracker

This file tracks known bugs, errors, and issues that need to be addressed in the visual synthesizer application.

---

## 🔴 Critical Issues

### 1. **Update Check Fetch Error**
**Error**: `script.js?v=1.6:4869 Failed to check HTML: TypeError: Failed to fetch`
**Location**: `checkForUpdates()` function at line 4847:32
**Stack Trace**: 
```
Failed to fetch
    at checkForUpdates (script.js?v=1.6:4847:32)
checkForUpdates @ script.js?v=1.6:4869
```
**Impact**: Update checking functionality is broken
**Status**: **NEEDS INVESTIGATION**
**Priority**: Medium

**Analysis Needed**:
- Determine what URL is being fetched
- Check if it's a CORS issue or network connectivity
- Verify if the update check is essential or can be disabled
- Consider fallback handling for fetch failures

---

## 🔴 Critical Issues

*No issues currently tracked*

---

## 🟡 Medium Priority Issues

*No issues currently tracked*

---

## 🟢 Low Priority Issues

*No issues currently tracked*

---

## ✅ Resolved Issues

### 3. **WebGL Invalid Operation - Using Deleted Objects** [FIXED]
**Original Error**: `WebGL: INVALID_OPERATION: bindFramebuffer: attempt to use a deleted object`
**Root Cause**: Aggressive resource management system was causing WebGL crashes that didn't exist before the "robustness" improvements
**Solution**:
- Completely removed aggressive resource tracking and cleanup system
- Simplified node deletion to use basic, reliable WebGL cleanup
- Removed automatic orphaned resource cleanup that ran every 5 minutes
- Returned to simple, direct resource management without complex tracking
- Kept essential validity checks without being overly aggressive
**Fixed in**: script.js v2.3
**Impact**: Eliminated WebGL crashes by removing the problematic resource management system that was causing issues that never existed before

### 2. **Connection Lines Misaligned During Zoom/Pan** [FIXED - PERMANENT]
**Original Error**: Connection lines between nodes drawn in wrong positions when graph is zoomed or panned
**Root Cause**: Coordinate system mismatch - port positions were calculated relative to the transformed nodes-container, but SVG uses screen coordinates
**Solution**: 
- Fixed all port calculation functions (`getInputPorts()`, `getOutputPort()`) to use SVG coordinates directly
- Updated control port connection logic to use consistent coordinate system
- Fixed drag connection logic to use SVG-relative coordinates
- All connections now use absolute screen coordinates relative to the SVG element
**Fixed in**: script.js v2.4 (permanent fix)
**Impact**: Connection lines now permanently align with node ports during all zoom/pan operations

### 1. **Update Check Fetch Error** [FIXED]
**Original Error**: `script.js?v=1.6:4869 Failed to check HTML: TypeError: Failed to fetch`
**Root Cause**: The `checkForUpdates()` function was trying to fetch local files using the fetch API, which browsers block when running from `file://` protocol for security reasons
**Solution**: 
- Added protocol check to skip update checking when running from `file://` 
- Improved error handling to suppress fetch-related console spam
- Added documentation explaining HTTP/HTTPS requirement
**Fixed in**: script.js v1.7
**Impact**: Eliminated console errors, cleaner development experience

---

## 📋 Investigation Guidelines

When investigating issues:
1. **Reproduce**: Can the issue be consistently reproduced?
2. **Isolate**: What specific conditions trigger the issue?
3. **Impact**: How does this affect user experience?
4. **Root Cause**: What's the underlying technical cause?
5. **Fix Strategy**: What's the safest way to resolve it?
6. **Testing**: How can we verify the fix works?

---

*Last Updated: 2024-12-XX*
*Issues to investigate: 0*
*Issues resolved: 3*