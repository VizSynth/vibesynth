// Test script to validate cursor input and circular dependency fixes
// Run this in the browser console after loading VibeSynth

function testCursorInputFix() {
  console.log('🧪 Testing Cursor Input Fix...');
  
  // Test 1: Check that cursorComponents exists with all expected components
  const expectedComponents = ['x', 'y', 'velocity', 'click'];
  let allComponentsExist = true;
  
  expectedComponents.forEach(component => {
    if (!cursorComponents[component]) {
      console.error(`❌ Component '${component}' missing from cursorComponents`);
      allComponentsExist = false;
    } else {
      console.log(`✅ Component '${component}' exists:`, cursorComponents[component]);
    }
  });
  
  if (!allComponentsExist) return false;
  
  // Test 2: Create cursor input node and test all components
  try {
    const cursorNode = createControlInputNode('CursorInput');
    console.log('✅ Created CursorInput node:', cursorNode);
    
    expectedComponents.forEach(component => {
      cursorNode.params.component = component;
      const value = getValue(cursorNode);
      console.log(`✅ Component '${component}' getValue: ${value} (type: ${typeof value})`);
      
      if (typeof value !== 'number') {
        console.error(`❌ Component '${component}' should return number, got ${typeof value}`);
        return false;
      }
    });
    
    // Test 3: Range mapping
    cursorNode.params.component = 'x';
    cursorNode.params.min = 0.2;
    cursorNode.params.max = 0.8;
    
    // Simulate mouse position
    cursorComponents.x.value = 0.5;
    const mappedValue = getValue(cursorNode);
    const expectedValue = 0.2 + (0.5 * (0.8 - 0.2)); // Should be 0.5
    
    console.log(`✅ Range mapping: value=${mappedValue}, expected=${expectedValue}`);
    
    if (Math.abs(mappedValue - expectedValue) > 0.001) {
      console.error(`❌ Range mapping failed`);
      return false;
    }
    
    // Cleanup
    deleteNode(cursorNode);
    console.log('✅ Cursor input test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing cursor input:', error);
    return false;
  }
}

function testCircularDependencyFix() {
  console.log('🧪 Testing Circular Dependency Fix...');
  
  try {
    // Test 1: Create a node and give it a self-reference
    const testNode = createNode('Oscillator', 100, 100);
    console.log('✅ Created test node:', testNode.name);
    
    // Artificially create self-reference
    testNode.inputs[0] = testNode;
    console.log('✅ Created artificial self-reference');
    
    // Test the removal function
    const fixedCount = removeSelfReferences();
    console.log(`✅ Fixed ${fixedCount} self-reference(s)`);
    
    if (fixedCount !== 1) {
      console.error(`❌ Expected to fix 1 self-reference, fixed ${fixedCount}`);
      return false;
    }
    
    if (testNode.inputs[0] !== null) {
      console.error(`❌ Self-reference not removed`);
      return false;
    }
    
    // Test 2: Test that normal connections are preserved
    const testNode2 = createNode('Noise', 200, 100);
    testNode.inputs[0] = testNode2;
    
    const fixedCount2 = removeSelfReferences();
    if (fixedCount2 !== 0) {
      console.error(`❌ Valid connection was incorrectly removed`);
      return false;
    }
    
    if (testNode.inputs[0] !== testNode2) {
      console.error(`❌ Valid connection was lost`);
      return false;
    }
    
    // Cleanup
    deleteNode(testNode);
    deleteNode(testNode2);
    
    console.log('✅ Circular dependency test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Error testing circular dependency fix:', error);
    return false;
  }
}

function runAllFixTests() {
  console.log('🚀 Running all fix tests...');
  
  const cursorTest = testCursorInputFix();
  const circularTest = testCircularDependencyFix();
  
  if (cursorTest && circularTest) {
    console.log('🎉 All tests passed! Fixes are working correctly.');
  } else {
    console.log('❌ Some tests failed. Check the logs above.');
  }
  
  return cursorTest && circularTest;
}

// Auto-run tests after a short delay to ensure everything is loaded
setTimeout(() => {
  console.log('🔧 Starting automatic test of fixes...');
  runAllFixTests();
}, 2000);