# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeSynth is a web-based modular video synthesizer that creates real-time visual effects through node-based patching. It uses vanilla JavaScript with WebGL for high-performance graphics rendering. The application requires no build tools and runs directly in modern browsers.

## Development Commands

```bash
# Start development server
npm start  # Runs Python HTTP server on port 8080

# Run tests (in browser console)
runAllTests()           # Run all tests
runTest('testName')     # Run specific test
createTestScenario()    # Create test nodes for manual testing

# Create checkpoint (when user requests)
bash backup.sh              # Create timestamped backup
git add -A
git commit -m "type: summary"  # types: feat, fix, refactor, test, docs, style, perf, chore
```

## Architecture Overview

### Core Structure
- **script.js**: Main application logic (5000+ lines) containing WebGL engine, node system, UI interactions
- **index.html**: Modern UI with material design, sidebar node palette, center canvas with overlay
- **layout.js**: Graph layout algorithms using ELK.js and Dagre for auto-layout
- **style.css**: Dark theme UI with CSS variables

### Node Categories
1. **Sources**: Oscillator, Noise, Shape, Camera, Plasma, Voronoi, RadialGradient, FlowField, Text, VideoFileInput
2. **Effects**: Transform, ColorAdjust, Kaleidoscope, Mirror, NoiseDisplace, PolarWarp, RGBSplit, FeedbackTrail, Bloom
3. **Compositing**: Mix, Layer (12 blend modes), Composite (4-layer)
4. **Control Inputs**: MIDI, Audio, Cursor, Camera Analysis, GameController, Random, Range

### Key Systems
- **WebGL Pipeline**: Each node renders to texture, consumed by other nodes
- **Parameter Validation**: Constraint-based system with real-time validation
- **Resource Management**: Texture/framebuffer tracking and cleanup
- **Project System**: Save/load, URL sharing with compression, presets
- **Logger**: Configurable levels (ERROR, WARN, INFO, DEBUG, TRACE)

## Development Workflow

### Testing Requirements
Before any feature is complete:
1. Add tests to `test-suite.js`
2. Run `runAllTests()` in browser console
3. Fix any failing tests
4. Test edge cases and performance

### Checkpoint Protocol
When user mentions: `[Checkpoint]`, `checkpoint`, `save progress`, `commit this`:
1. Run `bash backup.sh` to create timestamped backup
2. Stage all changes with `git add -A`
3. Create descriptive commit with proper format

### Code Style
- Follow existing patterns in codebase
- Use vanilla JavaScript (no frameworks)
- Maintain WebGL resource cleanup
- Add comprehensive error handling
- Use existing Logger system for debugging

## Important Notes

1. **No Build Required**: This is vanilla JS - changes take effect on page reload
2. **Browser Testing**: Open browser console for testing and debugging
3. **WebGL Context**: Handle context loss/recovery gracefully
4. **Performance**: Test with multiple resolutions (Low/Med/High/Ultra)
5. **Cross-browser**: Ensure compatibility with Chrome, Firefox, Safari, Edge