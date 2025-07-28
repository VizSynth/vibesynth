# Development Process & Best Practices

This document defines our collaborative development workflow and best practices for maintaining and improving the Web Visual Synthesizer project.

## 🌿 Branch Management

### MANDATORY: Feature Branch Workflow
**ALL development work MUST be done in feature branches. No direct commits to main.**

### Branch Naming Convention
Branch names should follow this pattern:
- **Features**: `feat-<description>` (e.g., `feat-new-source-node-flowfield`)
- **Bug fixes**: `fix-<description>` (e.g., `fix-feedback-trail-accumulation`)
- **Refactoring**: `refactor-<description>` (e.g., `refactor-node-validation-system`)
- **Documentation**: `docs-<description>` (e.g., `docs-update-readme`)
- **Performance**: `perf-<description>` (e.g., `perf-optimize-render-loop`)

### Branch Workflow Protocol
1. **Propose branch name immediately** when starting work on a feature/bug
   - As soon as you understand the task, propose: "I'll create branch `feat-xyz` for this work"
   - Get user confirmation before proceeding
2. **Use deploy.sh for automated workflow**:
   ```bash
   ./deploy.sh --branch "feat-new-feature"
   ```
   This automatically:
   - Builds documentation
   - Creates checkpoint backup
   - Runs tests locally
   - Creates/switches to target branch
   - Commits and pushes changes
   - Triggers CI/CD pipeline
3. **Work exclusively in feature branch** until feature is complete
4. **Regular commits** within the feature branch using deploy.sh
5. **Create PR** when feature is ready for review
6. **Never commit directly to main** - all changes via PR

### When to Create a New Branch
- Starting any new feature
- Fixing any bug
- Making any non-trivial change
- Refactoring existing code
- Updating documentation

### Current Branch Awareness
- Always check current branch before starting work: `git branch --show-current`
- Include branch name in checkpoint commits
- Notify user if working in main (should switch to feature branch)

## 🚀 Automated Deployment with deploy.sh

### Quick Deploy
For any branch with your current changes:
```bash
./deploy.sh --branch "feat-my-feature"
```

### Deploy Options
```bash
# Basic deployment
./deploy.sh --branch "feat-new-feature"

# With custom commit message
./deploy.sh --branch "fix-bug" --message "fix: resolve memory leak in texture cleanup"

# Skip tests (for documentation-only changes)
./deploy.sh --branch "docs-update" --skip-tests

# Skip docs build
./deploy.sh --branch "feat-performance" --skip-docs
```

### What deploy.sh Does Automatically
1. ✅ **Builds documentation** (unless --skip-docs)
2. ✅ **Creates checkpoint backup** via backup.sh
3. ✅ **Runs full test suite** (unless --skip-tests)
4. ✅ **Fails deployment if tests fail**
5. ✅ **Creates/switches to target branch**
6. ✅ **Stages all changes**
7. ✅ **Commits with descriptive message**
8. ✅ **Pushes to remote with tracking**
9. 🤖 **Triggers GitHub Actions CI/CD**
10. 🤖 **Auto-deploys if tests pass**

## 🔖 Manual Checkpoint Protocol (Legacy)

### Trigger Words
When the user writes any of the following, create an immediate git checkpoint:
- `[Checkpoint]`
- `checkpoint`
- `make a checkpoint`
- `save progress`
- `commit this`

**Note**: Consider using `deploy.sh` instead for automated workflow!

### Manual Checkpoint Actions
1. **Use deploy.sh**: `./deploy.sh --branch "current-branch-name"`
2. **Or manually**:
   - Stage all changes: `git add -A`
   - Create descriptive commit
   - Update DEVELOPMENT.md with timestamp and changes
   - Verify commit: Show git log entry to confirm

### Commit Message Format
```
<type>: <summary>

- Detail 1
- Detail 2
- Known issues: ...
- Next: ...
```

Types: feat, fix, refactor, test, docs, style, perf, chore

## 🧪 Testing Requirements & CI/CD

### Automated Testing Pipeline
The project uses comprehensive CI/CD with GitHub Actions:
- **Every push triggers tests** automatically
- **Playwright browser tests** - 9 test scenarios
- **ESLint code quality** checks
- **Security scanning** for vulnerabilities
- **Auto-deployment** to environments when tests pass
- **Deployment blocking** when tests fail

### Test Types
1. **Browser Tests** (Playwright): Application loading, UI interactions, WebGL rendering
2. **Code Quality** (ESLint): Syntax, style, and best practices
3. **Security** (npm audit): Dependency vulnerabilities
4. **Performance** (manual): Memory usage, render performance

### Running Tests Locally
```bash
# Run all tests (includes server setup)
npm test

# Run specific test suite
npm run test:playwright
npm run lint

# Deploy.sh automatically runs tests before deployment
./deploy.sh --branch "feat-test" # Tests run automatically
./deploy.sh --branch "docs-only" --skip-tests # Skip for docs-only changes
```

### Test Implementation
- **Browser tests**: Add to `tests/vibesynth.spec.js`
- **New features**: Always add corresponding tests
- **CI/CD ensures**: No broken code reaches production
- **Test failures**: Block all deployments automatically

## 🔄 Continuous Improvement

### During Every Work Session
1. **Review existing code** for:
   - Opportunities to refactor
   - Code duplication to eliminate
   - Performance improvements
   - Better error handling
   - Clearer naming/documentation

2. **Check for bugs**:
   - Review console for errors/warnings
   - Test edge cases
   - Verify all features still work
   - Update KNOWN_ISSUES.md

3. **Clean up**:
   - Remove commented debug code
   - Consolidate similar functions
   - Improve code organization
   - Update documentation

## 📋 Task Management

### Todo List Protocol
1. **Always use TodoWrite** to track tasks
2. **Update status immediately** when starting/completing tasks
3. **Break large tasks** into smaller subtasks
4. **Prioritize** bugs and user-facing issues

### Task States
- `pending`: Not started
- `in_progress`: Currently working (only ONE at a time)
- `completed`: Finished and tested
- `blocked`: Waiting on something

## 🐛 Debugging Protocol

### When Something Isn't Working
1. **Create debug plan**: Document approach in markdown
2. **Add strategic logging**: Console logs with clear prefixes (🔍, ⚠️, ✅, ❌)
3. **Test incrementally**: One change at a time
4. **Verify fixes**: Ensure nothing else broke
5. **Clean up**: Remove debug code after fixing

### Debug Markers
- `// DEBUG:` - Temporary debug code to remove
- `// TODO:` - Something to implement later
- `// FIXME:` - Known bug that needs fixing
- `// HACK:` - Temporary workaround that needs proper solution

## 📝 Documentation Standards

### Code Documentation
- **Every function** needs a JSDoc comment
- **Complex logic** needs inline comments
- **Magic numbers** need named constants
- **File headers** should explain purpose

### User Documentation
- Update README.md for new features
- Add examples for complex features
- Include screenshots when relevant
- Document keyboard shortcuts and tips

## 🎯 Feature Development Workflow

1. **Understand requirements** fully before starting
2. **Plan approach** (create design doc if complex)
3. **Implement incrementally** with tests
4. **Verify visually** that it works as expected
5. **Test edge cases**
6. **Refactor** for clarity and performance
7. **Document** the feature
8. **Checkpoint** with descriptive commit

## 🔍 Code Review Checklist

Before considering any task complete:
- [ ] No console errors or warnings
- [ ] All tests pass
- [ ] Code is clean and well-organized
- [ ] Documentation is updated
- [ ] Performance is acceptable
- [ ] Edge cases are handled
- [ ] Git commit created

## 🚀 Performance Guidelines

### Always Consider
- **Memory usage**: Clean up resources properly
- **Render performance**: 60 FPS target
- **Resource pooling**: Reuse objects when possible
- **Texture management**: Proper cleanup and size limits
- **Event handling**: Debounce/throttle when needed

## 📋 End of Session Protocol

### Before Ending Any Work Session
1. **Review DEV_PROCESS.md** (this file)
2. **Check all todos** are updated
3. **Create checkpoint** if changes were made
4. **Document** any unfinished work
5. **Test** that app still works
6. **Update** DEVELOPMENT.md with session summary

## 🔄 Regular Maintenance

### Weekly Tasks
- Review and update KNOWN_ISSUES.md
- Check for dependency updates
- Profile performance
- Review and refactor one module
- Update tests for new scenarios

## 💡 Innovation Guidelines

### When Adding New Features
1. **Check existing patterns** first
2. **Maintain consistency** with current UI/UX
3. **Consider extensibility** for future
4. **Add feature flags** for experimental features
5. **Get user feedback** early and often

---

**Remember**: Review this DEV_PROCESS.md file at the end of every work session to ensure all protocols were followed!