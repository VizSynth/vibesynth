# Code Cleanup Plan - Web Visual Synthesizer

## 🎯 Objectives
1. Convert all logging to the new Logger framework
2. Remove debug code and temporary fixes
3. Normalize code style and improve organization
4. Fix incorrect comments and documentation
5. Remove duplicate or dead code
6. Ensure all features work correctly after cleanup

## 📋 Cleanup Tasks

### 1. Logging Conversion (High Priority)
- [ ] Search for all `console.log` calls and convert to appropriate Logger level
- [ ] Search for all `console.warn` calls and convert to `Logger.warn`
- [ ] Search for all `console.error` calls and convert to `Logger.error`
- [ ] Add appropriate log levels to initialization messages
- [ ] Remove excessive/redundant logging
- [ ] Keep only essential error messages and important state changes

### 2. Debug Code Removal (High Priority)
- [ ] Remove temporary debug comments (// DEBUG:, // TEMP:, etc.)
- [ ] Remove the debug indicators from Layer shader (now that it's working)
- [ ] Clean up Layer testing functions that are no longer needed
- [ ] Remove console helper messages that are redundant
- [ ] Remove any `debugger` statements
- [ ] Clean up temporary test functions

### 3. Code Style Normalization (Medium Priority)
- [ ] Ensure consistent indentation (2 spaces)
- [ ] Fix inconsistent bracket placement
- [ ] Normalize function declarations (consistent arrow vs function)
- [ ] Add missing semicolons
- [ ] Fix long lines (break at 120 characters)
- [ ] Ensure consistent quote usage (single vs double)

### 4. Documentation Fixes (Medium Priority)
- [ ] Update function JSDoc comments
- [ ] Fix incorrect inline comments
- [ ] Remove outdated TODOs
- [ ] Add missing function documentation
- [ ] Update file headers with correct information

### 5. Dead Code Removal (Medium Priority)
- [ ] Remove commented-out code blocks
- [ ] Remove unused functions
- [ ] Remove duplicate utility functions
- [ ] Clean up unused variables
- [ ] Remove old shader versions

### 6. Code Organization (Low Priority)
- [ ] Group related functions together
- [ ] Move utility functions to a utilities section
- [ ] Organize initialization code
- [ ] Group shader definitions together
- [ ] Organize event handlers

## 🔍 Search Patterns

### Console Logging
```
console\.log
console\.warn
console\.error
console\.info
console\.debug
```

### Debug Markers
```
// DEBUG:
// TEMP:
// TODO:
// FIXME:
// HACK:
debugger;
```

### Temporary Functions
```
test.*Layer
debug.*Layer
window\.test
window\.debug
```

### Style Issues
```
\t           # tabs instead of spaces
\{\s*$       # opening brace on same line
\s+;         # space before semicolon
\s+$         # trailing whitespace
```

## ✅ Verification Steps

1. **Before cleanup**: Run all tests, verify Layer blending works
2. **After each major change**: Test basic functionality
3. **After cleanup**: Full test suite + manual testing of all features

## 🚫 Do NOT Remove

1. Error handling for critical failures
2. WebGL error recovery code
3. Resource cleanup functions
4. Fallback mechanisms
5. User-facing error messages
6. Performance monitoring code

## 📊 Success Metrics

- Zero console.log/warn/error calls (all using Logger)
- No temporary debug code remaining
- Consistent code style throughout
- All tests passing
- No functionality regressions
- Cleaner, more maintainable codebase

## 🔄 Process

1. Create pre-cleanup checkpoint ✅
2. Execute cleanup tasks in order
3. Test after each major section
4. Document any issues found
5. Create post-cleanup checkpoint
6. Update documentation