const { test, expect } = require('@playwright/test');

test.describe('VibeSynth Application', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('#glcanvas', { timeout: 10000 });
  });

  test('should load the main application', async ({ page }) => {
    // Check that the main elements are present
    await expect(page.locator('#glcanvas')).toBeVisible();
    await expect(page.locator('#left-sidebar')).toBeVisible();
    await expect(page.locator('.node-palette').first()).toBeVisible();
  });

  test('should have WebGL context', async ({ page }) => {
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.getElementById('glcanvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return !!gl;
    });
    expect(hasWebGL).toBe(true);
  });

  test('should have interactive palette', async ({ page }) => {
    // Check that palette nodes are clickable
    const oscillatorExists = await page.isVisible('[data-type="Oscillator"]');
    expect(oscillatorExists).toBe(true);
    
    // Click should be possible (test UI responsiveness)
    await page.click('[data-type="Oscillator"]');
    
    // Basic interaction test - we're not testing node creation logic
    // just that the UI responds to clicks
    const canvasExists = await page.isVisible('#glcanvas');
    expect(canvasExists).toBe(true);
  });

  test('should have built-in test functions', async ({ page }) => {
    // Check if test functions exist (but don't run them)
    const testFunctions = await page.evaluate(() => {
      return {
        hasRunAllTests: typeof runAllTests === 'function',
        hasRunTest: typeof runTest === 'function',
        hasTestRunner: typeof TestRunner !== 'undefined'
      };
    });
    
    // At least one test function should exist
    expect(testFunctions.hasRunAllTests || testFunctions.hasRunTest || testFunctions.hasTestRunner).toBe(true);
  });

  test('should respond to mouse movement', async ({ page }) => {
    // Test basic mouse interaction
    await page.mouse.move(400, 200);
    await page.waitForTimeout(100);
    
    // Check if cursor tracking exists
    const hasCursorTracking = await page.evaluate(() => {
      return typeof cursorComponents !== 'undefined' || 
             document.querySelector('[data-type="CursorInput"]') !== null;
    });
    
    // Either cursor components exist OR cursor input palette item exists
    expect(hasCursorTracking).toBe(true);
  });

  test('should have save and load buttons', async ({ page }) => {
    // Check that save/load UI exists
    const saveButton = await page.isVisible('#save-project-btn');
    const loadButton = await page.isVisible('#load-project-btn');
    
    expect(saveButton).toBe(true);
    expect(loadButton).toBe(true);
    
    // Test that buttons are clickable
    await page.click('#save-project-btn');
    await page.waitForTimeout(100);
  });

  test('should render without errors', async ({ page }) => {
    // Check for JavaScript errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Interact with the app
    await page.click('[data-type="Oscillator"]');
    await page.click('#glcanvas', { 
      position: { x: 300, y: 200 }, 
      force: true 
    });
    await page.waitForTimeout(1000);
    
    // Filter out known acceptable errors
    const criticalErrors = errors.filter(error => 
      !error.includes('DevTools') && 
      !error.includes('Extension') &&
      !error.includes('chrome-extension')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('should handle window resize', async ({ page }) => {
    // Initial size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Resize window
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);
    
    // Check that canvas is still responsive
    const canvasVisible = await page.isVisible('#glcanvas');
    expect(canvasVisible).toBe(true);
    
    // Check that sidebar is still accessible
    const sidebarVisible = await page.isVisible('#left-sidebar');
    expect(sidebarVisible).toBe(true);
  });

  test('should have proper performance', async ({ page }) => {
    // Measure page load time
    const navigationPromise = page.waitForNavigation();
    const startTime = Date.now();
    await page.goto('/');
    await navigationPromise;
    const loadTime = Date.now() - startTime;
    
    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000);
    
    // Check FPS during interaction
    await page.click('[data-type="Oscillator"]');
    await page.click('#glcanvas', { 
      position: { x: 300, y: 200 }, 
      force: true 
    });
    
    const fps = await page.evaluate(() => {
      return new Promise(resolve => {
        let frames = 0;
        const startTime = performance.now();
        
        function countFrame() {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frames);
          }
        }
        requestAnimationFrame(countFrame);
      });
    });
    
    // Should maintain reasonable framerate
    expect(fps).toBeGreaterThan(30);
  });
});