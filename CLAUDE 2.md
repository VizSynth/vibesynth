# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VibeSynth is a web-based modular video synthesizer that creates real-time visual effects through node-based patching. It uses vanilla JavaScript with WebGL for high-performance graphics rendering. The application requires no build tools and runs directly in modern browsers.

## Development Commands

```bash
# Start development server
npm start              # Runs Python HTTP server on port 8080

# Automated deployment (RECOMMENDED)
./deploy.sh --branch "feat-feature-name"           # Full automated workflow
./deploy.sh --branch "fix-bug" --message "custom"  # With custom commit message
./deploy.sh --branch "docs-only" --skip-tests      # Skip tests for docs-only
./deploy.sh --branch "perf-update" --skip-docs     # Skip docs build

# Manual testing
npm test               # Run full test suite (Playwright + ESLint)
npm run lint           # Run ESLint only
npm run test:playwright # Run Playwright tests only

# Browser console testing (legacy)
runAllTests()          # Run all browser tests
runTest('testName')    # Run specific test
createTestScenario()   # Create test nodes for manual testing

# Manual checkpoint (legacy - use deploy.sh instead)
bash backup.sh         # Create timestamped backup
git add -A
git commit -m "type: summary"  # types: feat, fix, refactor, test, docs, style, perf, chore
```

## Architecture Overview

### Core Structure
- **script.js**: Main application logic (5000+ lines) containing WebGL engine, node system, UI interactions
- **index.html**: Modern UI with material design, sidebar node palette, center canvas with overlay
- **layout.js**: Graph layout algorithms using ELK.js and Dagre for auto-layout
- **style.css**: Dark theme UI with CSS variables
- **test-suite.js**: Browser-based testing framework with TestRunner class

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

### Branch Management (MANDATORY)
**ALL development work MUST be done in feature branches. Never commit directly to main.**

1. **Propose branch name immediately** when understanding a task
   - Features: `feat-<description>` (e.g., `feat-audio-reactive-controls`)
   - Bugs: `fix-<description>` (e.g., `fix-memory-leak`)
   - Say: "I'll create branch `feat-xyz` for this work"
2. **Use deploy.sh for ALL commits**: `./deploy.sh --branch "branch-name"`
3. **Check current branch**: `git branch --show-current`
4. **All commits go to feature branch**, PR to main when complete

### Automated CI/CD Pipeline
VibeSynth uses comprehensive automated testing and deployment:
- **Every push triggers**: Playwright tests, ESLint, security scans
- **Auto-deployment**: Development, staging, production environments
- **Deployment blocking**: Tests must pass or deployment fails
- **Zero-downtime**: No broken code reaches production

### Testing Requirements
All testing is automated via deploy.sh and CI/CD:
1. **Playwright tests**: 9 browser test scenarios (UI, WebGL, interactions)
2. **ESLint**: Code quality and style enforcement
3. **Security**: Automated vulnerability scanning
4. **Manual testing**: Add tests to `tests/vibesynth.spec.js` for new features

### Checkpoint Protocol
**RECOMMENDED**: Use deploy.sh instead of manual checkpoints
```bash
./deploy.sh --branch "current-branch"  # Automated workflow
```

**Legacy manual method** (when user mentions: `[Checkpoint]`, `checkpoint`, `save progress`, `commit this`):
1. Run `bash backup.sh` to create timestamped backup
2. Stage all changes with `git add -A`
3. Create descriptive commit with proper format
4. Include branch name in commit if not on main

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