# CI/CD Pipeline for VibeSynth

## Overview

This CI/CD pipeline automatically tests, validates, and deploys VibeSynth using GitHub Actions.

## Pipeline Components

### 🧪 Testing (`test` job)
- **Browser Testing**: Uses Playwright to test in real Chrome browser
- **WebGL Validation**: Ensures WebGL context works correctly
- **Cursor Input Testing**: Validates Y-coordinate fix (top=1, bottom=0)
- **Performance Testing**: Checks FPS and load times
- **Integration Testing**: Tests node creation, connections, save/load

### 🔍 Code Quality (`lint` job)
- **ESLint**: JavaScript code quality and consistency
- **Security Patterns**: Scans for common security issues
- **Browser Compatibility**: Ensures modern JS standards

### 🔒 Security (`security` job)
- **Code Scanning**: Looks for dangerous patterns (eval, innerHTML)
- **Dependency Audit**: Checks for known vulnerabilities
- **Static Analysis**: Reviews code for security issues

### 🚀 Deployment
- **Staging**: Auto-deploy to GitHub Pages on main branch
- **Production**: Deploy to vibesynth.one on releases
- **CNAME Management**: Automatically includes custom domain

## Workflow Triggers - YOUR DAD'S REQUIREMENTS ✅

| Trigger | Jobs Run | Deployment | Tests Required |
|---------|----------|------------|----------------|
| **Every Commit** on any branch | test, lint, security | ❌ BLOCKED if tests fail | ✅ YES |
| **Pull Request** | test, lint, security | None | ✅ Must pass to merge |
| **Push to feat-*,fix-*,docs-*,perf-*,refactor-*** | test, lint, security → **deploy-dev** | Development Environment | ✅ Must pass |
| **Push to main** | test, lint, security → **deploy-staging** | Staging Environment | ✅ Must pass |
| **Release** | test, lint, security → **deploy-production** | Production (vibesynth.one) | ✅ Must pass |

### 🚨 **DEPLOYMENT BLOCKING**: 
- If ANY test fails → **ALL deployments are blocked**
- You get **immediate notification** of test failures
- **No broken code** can reach any environment

## Local Development

### Setup
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Testing
```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Debug tests
npm run test:debug

# Run linting
npm run lint

# Fix lint issues
npm run lint:fix

# Run full CI pipeline locally
npm run ci
```

### Manual Deployment
```bash
# Deploy to docs folder
npm run deploy

# Or use bash script
npm run deploy:bash
```

## Test Coverage

### Browser Tests
- ✅ Application loads correctly
- ✅ WebGL context initialization
- ✅ Node creation and placement
- ✅ Cursor input Y-coordinate behavior
- ✅ Save/load functionality
- ✅ Performance benchmarks
- ✅ Error handling
- ✅ Responsive design

### Built-in Tests
- ✅ Runs existing test-suite.js
- ✅ Validates all internal tests pass
- ✅ Ensures no regressions

## Performance Benchmarks

| Metric | Target | Test |
|--------|--------|------|
| Load Time | < 5 seconds | ✅ |
| FPS | > 30 fps | ✅ |
| Memory | No leaks | ✅ |
| WebGL | Context available | ✅ |

## Security Measures

- ❌ No `eval()` usage
- ❌ No `innerHTML` with user data
- ❌ No `document.write()`
- ✅ CSP-friendly code
- ✅ Dependency vulnerability scanning

## 🌍 Deployment Environments - AUTO-DEPLOY TO ALL

### 1. **Development** 🚀
- **URL**: https://vizsynth.github.io/vibesynth/dev
- **Trigger**: Push to `feat-*`, `fix-*`, `docs-*`, `perf-*`, `refactor-*` branches
- **Purpose**: Feature testing and development
- **Tests Required**: ✅ YES - blocks deployment if failed

### 2. **Staging** 🎯  
- **URL**: https://vizsynth.github.io/vibesynth
- **Trigger**: Push to `main` branch
- **Purpose**: Pre-production testing and review
- **Tests Required**: ✅ YES - blocks deployment if failed

### 3. **Production** 🌍
- **URL**: https://vibesynth.one
- **Trigger**: GitHub releases
- **Purpose**: Public production site
- **Tests Required**: ✅ YES - blocks deployment if failed

## 🧪 YOUR DAD'S CI/CD REQUIREMENTS - IMPLEMENTED ✅

### ✅ **Every Commit Auto-Tests**
- **ALL commits** on **ANY branch** automatically run the full test suite
- You know **immediately** if tests are failing
- **No manual testing required**

### ✅ **Auto-Deploy to Every Environment**  
- **Development**: Feature branches auto-deploy (if tests pass)
- **Staging**: Main branch auto-deploys (if tests pass)
- **Production**: Releases auto-deploy (if tests pass)

### ✅ **Deployment Blocking**
- **Tests MUST pass** before any deployment
- **Failed tests = NO deployment** to any environment
- **Broken code cannot reach users**

## Environment Variables

No environment variables required - this is a static vanilla JS application.

## Monitoring

### Success Indicators
- ✅ All tests pass
- ✅ No lint errors
- ✅ No security issues
- ✅ Performance benchmarks met
- ✅ Successful deployment

### Failure Notifications
- ❌ Test failures block deployment
- ❌ Lint errors reported as warnings
- ❌ Security issues block deployment
- ❌ Performance regressions flagged

## Maintenance

### Adding New Tests
1. Add test cases to `tests/vibesynth.spec.js`
2. Use Playwright selectors and APIs
3. Follow existing test patterns

### Updating Dependencies
1. Update `package.json` devDependencies
2. Test locally before committing
3. Pipeline will validate changes

### Modifying Deployment
1. Edit `.github/workflows/ci-cd.yml`
2. Test with feature branch first
3. Merge to main when stable

## Troubleshooting

### Common Issues

**Tests fail locally but pass in CI:**
- Clear browser cache: `npx playwright install --force`
- Check browser versions match CI

**Deployment fails:**
- Verify CNAME file exists in docs/
- Check GitHub Pages settings
- Confirm domain DNS is correct

**Performance tests fail:**
- Check for memory leaks in new code
- Verify WebGL context cleanup
- Monitor FPS during development

**Lint errors:**
- Run `npm run lint:fix` to auto-fix
- Check `.eslintrc.js` for rule config
- Add `// eslint-disable-next-line` for exceptions

### Getting Help

1. Check GitHub Actions logs for detailed errors
2. Run tests locally: `npm run test:debug`
3. Validate deployment: `npm run deploy`
4. Review this documentation for common solutions

## Future Enhancements

- [ ] Visual regression testing
- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Mobile device testing
- [ ] Performance monitoring alerts
- [ ] Automated accessibility testing
- [ ] Integration with external monitoring services