# Development Process & Best Practices

This document defines our collaborative development workflow and best practices for maintaining and improving the Web Visual Synthesizer project.

## 🔖 Checkpoint Protocol

### Trigger Words
When the user writes any of the following, create an immediate git checkpoint:
- `[Checkpoint]`
- `checkpoint`
- `make a checkpoint`
- `save progress`
- `commit this`

### Checkpoint Actions
1. **Stage all changes**: `git add -A`
2. **Create descriptive commit**: Include:
   - What was changed/added/fixed
   - Current state of features
   - Any known issues
   - Next steps if applicable
3. **Update DEVELOPMENT.md**: Add entry with timestamp and changes
4. **Verify commit**: Show git log entry to confirm

### Commit Message Format
```
<type>: <summary>

- Detail 1
- Detail 2
- Known issues: ...
- Next: ...
```

Types: feat, fix, refactor, test, docs, style, perf, chore

## 🧪 Testing Requirements

### Before Any Feature is Considered Complete
1. **Unit Tests**: Test individual functions/components
2. **Integration Tests**: Test node connections and data flow
3. **Visual Tests**: Verify rendering output matches expectations
4. **Performance Tests**: Ensure no memory leaks or performance regressions
5. **Edge Case Tests**: Invalid inputs, extreme values, rapid interactions

### Test Implementation
- Add tests to `test-suite.js`
- Run all tests after changes
- Document test coverage in commits
- Fix any failing tests before moving on

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