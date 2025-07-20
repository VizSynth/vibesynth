/**
 * Visual Synthesizer Test Suite
 * 
 * Run these tests by opening the browser console and calling:
 * runAllTests() or runTest('testName')
 */

class TestRunner {
  constructor() {
    this.tests = {};
    this.results = [];
  }

  addTest(name, testFunction) {
    this.tests[name] = testFunction;
  }

  async runTest(name) {
    if (!this.tests[name]) {
      console.error(`Test "${name}" not found`);
      return false;
    }

    console.log(`🧪 Running test: ${name}`);
    try {
      await this.tests[name]();
      console.log(`✅ PASSED: ${name}`);
      this.results.push({ name, status: 'PASSED' });
      return true;
    } catch (error) {
      console.error(`❌ FAILED: ${name}`, error.message);
      this.results.push({ name, status: 'FAILED', error: error.message });
      return false;
    }
  }

  async runAllTests() {
    console.log('🚀 Starting test suite...');
    this.results = [];
    
    const testNames = Object.keys(this.tests);
    for (const name of testNames) {
      await this.runTest(name);
    }

    console.log('\n📊 Test Results:');
    this.results.forEach(result => {
      const icon = result.status === 'PASSED' ? '✅' : '❌';
      console.log(`${icon} ${result.name}: ${result.status}`);
      if (result.error) console.log(`   Error: ${result.error}`);
    });

    const passed = this.results.filter(r => r.status === 'PASSED').length;
    const total = this.results.length;
    console.log(`\n🎯 Summary: ${passed}/${total} tests passed`);
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertNotNull(value, message) {
    if (value == null) {
      throw new Error(message || 'Value should not be null/undefined');
    }
  }
}

const testRunner = new TestRunner();

// MAIN OUTPUT SYNCHRONIZATION TESTS
testRunner.addTest('mainOutputDropdownSync', () => {
  // Test that dropdown selection matches actual main output
  const dropdown = document.getElementById('main-output-select');
  const selectedValue = parseInt(dropdown.value);
  const actualMainOutputId = mainOutputNode?.id;
  
  testRunner.assertEqual(selectedValue, actualMainOutputId, 
    'Main output dropdown should match actual main output node');
});

testRunner.addTest('mainOutputVisualIndicator', () => {
  // Test that visual indicator matches main output
  const mainOutputElements = document.querySelectorAll('.graph-node.main-output');
  
  if (mainOutputNode) {
    testRunner.assertEqual(mainOutputElements.length, 1, 
      'Should have exactly one node with main-output class');
    
    const indicatorNode = mainOutputElements[0];
    const expectedNodeId = parseInt(indicatorNode.dataset.nodeId);
    testRunner.assertEqual(expectedNodeId, mainOutputNode.id,
      'Visual indicator should be on the correct node');
  } else {
    testRunner.assertEqual(mainOutputElements.length, 0,
      'Should have no main-output indicator when no main output set');
  }
});

testRunner.addTest('createNodeUpdatesMainOutput', () => {
  const initialNodeCount = nodes.length;
  const wasMainOutputNull = mainOutputNode === null;
  
  // Create a new node
  const newNode = createNode('Noise', 400, 300);
  
  testRunner.assert(nodes.length === initialNodeCount + 1, 
    'Node should be added to nodes array');
  
  if (wasMainOutputNull) {
    testRunner.assertEqual(mainOutputNode, newNode,
      'First node should become main output automatically');
  }
  
  // Cleanup
  deleteNode(newNode);
});

testRunner.addTest('deleteMainOutputUpdatesSelection', () => {
  // Create two nodes
  const node1 = createNode('Oscillator', 100, 100);
  const node2 = createNode('Noise', 200, 100);
  
  // Set first node as main output
  setMainOutput(node1);
  testRunner.assertEqual(mainOutputNode, node1, 'Node1 should be main output');
  
  // Delete the main output node
  deleteNode(node1);
  
  // Main output should auto-update to remaining node
  testRunner.assertEqual(mainOutputNode, node2, 
    'Main output should auto-update to remaining node after deletion');
  
  // Cleanup
  deleteNode(node2);
});

// AUDIO MAPPING TESTS
testRunner.addTest('audioMappingCreation', () => {
  const node = createNode('Oscillator', 100, 100);
  const initialMappingCount = Object.keys(controlInputs.audio).length;
  
  // Create audio mapping
  createAudioMapping(node, 'frequency', 'bass');
  
  testRunner.assert(controlInputs.audio.bass, 'Bass audio mapping should exist');
  testRunner.assert(controlInputs.audio.bass.length > 0, 'Bass mapping should have entries');
  
  const mapping = controlInputs.audio.bass.find(m => m.nodeId === node.id && m.param === 'frequency');
  testRunner.assertNotNull(mapping, 'Should find frequency mapping for the node');
  
  // Cleanup
  deleteNode(node);
});

testRunner.addTest('audioMappingRemoval', () => {
  const node = createNode('Oscillator', 100, 100);
  
  // Create and then remove mapping
  createAudioMapping(node, 'frequency', 'bass');
  removeAllMappingsForParam(node.id, 'frequency');
  
  const mapping = controlInputs.audio.bass?.find(m => m.nodeId === node.id && m.param === 'frequency');
  testRunner.assert(!mapping, 'Mapping should be removed');
  
  // Cleanup
  deleteNode(node);
});

// COLOR PALETTE TESTS
testRunner.addTest('colorPaletteMapping', () => {
  const node = createNode('Oscillator', 100, 100);
  
  // Test color palette parameter exists
  testRunner.assert('colorPalette' in node.params, 'Oscillator should have colorPalette parameter');
  
  // Test palette switching
  const originalPalette = node.params.colorPalette;
  node.params.colorPalette = 'sunset';
  testRunner.assertEqual(node.params.colorPalette, 'sunset', 'Should be able to change palette');
  
  // Test audio mapping to palette
  createAudioMapping(node, 'colorPalette', 'overall');
  
  // Simulate audio input (0.5 should select middle palette)
  applyControlInput(node.id, 'colorPalette', 0.5);
  
  const paletteNames = Object.keys(colorPalettes);
  const expectedIndex = Math.floor(0.5 * paletteNames.length);
  const expectedPalette = paletteNames[Math.min(expectedIndex, paletteNames.length - 1)];
  
  testRunner.assertEqual(node.params.colorPalette, expectedPalette,
    'Audio value should map to correct palette');
  
  // Cleanup
  deleteNode(node);
});

// SHADER AND RENDERING TESTS
testRunner.addTest('shaderProgramsExist', () => {
  const requiredPrograms = ['oscillator', 'noise', 'shape', 'copy'];
  
  requiredPrograms.forEach(programName => {
    testRunner.assertNotNull(programs[programName], 
      `Program "${programName}" should exist`);
  });
});

testRunner.addTest('nodeShaderAssignment', () => {
  const node = createNode('Oscillator', 100, 100);
  
  testRunner.assertNotNull(node.program, 'Node should have shader program assigned');
  testRunner.assertEqual(node.program, programs.oscillator, 
    'Oscillator node should have oscillator program');
  
  // Cleanup
  deleteNode(node);
});

// PROJECT SAVE/LOAD TESTS
testRunner.addTest('projectSerialization', () => {
  // Create a test setup
  const node1 = createNode('Oscillator', 100, 100);
  const node2 = createNode('Noise', 200, 100);
  setMainOutput(node2);
  
  // Serialize project
  const projectData = serializeProject();
  
  testRunner.assertNotNull(projectData.nodes, 'Project should have nodes data');
  testRunner.assertEqual(projectData.nodes.length, 2, 'Should serialize both nodes');
  testRunner.assertEqual(projectData.mainOutputNodeId, node2.id, 
    'Should serialize correct main output');
  
  // Cleanup
  deleteNode(node1);
  deleteNode(node2);
});

testRunner.addTest('mainOutputSerializationRestoration', () => {
  // Create a complex setup with connections
  const osc = createNode('Oscillator', 100, 100);
  const kaleid = createNode('Kaleidoscope', 300, 100);
  const noise = createNode('Noise', 100, 300);
  
  // Connect oscillator to kaleidoscope
  kaleid.inputs[0] = osc;
  
  // Set kaleidoscope as main output (not the first node)
  setMainOutput(kaleid);
  
  // Verify initial state
  testRunner.assertEqual(mainOutputNode, kaleid, 'Kaleidoscope should be main output');
  
  // Serialize and then restore
  const projectData = serializeProject();
  testRunner.assertEqual(projectData.mainOutputNodeId, kaleid.id, 
    'Should serialize kaleidoscope as main output');
  
  // Clear and restore (simulating page reload)
  clearProject();
  deserializeProject(projectData);
  
  // Find the restored kaleidoscope node
  const restoredKaleid = nodes.find(n => n.type === 'Kaleidoscope');
  testRunner.assertNotNull(restoredKaleid, 'Kaleidoscope should be restored');
  
  // Verify main output is correctly restored
  testRunner.assertEqual(mainOutputNode, restoredKaleid, 
    'Main output should be restored to kaleidoscope');
  
  // Verify dropdown matches
  const dropdown = document.getElementById('main-output-select');
  const dropdownValue = parseInt(dropdown.value);
  testRunner.assertEqual(dropdownValue, restoredKaleid.id,
    'Dropdown should match restored main output');
  
  // Verify visual indicator
  const mainOutputElements = document.querySelectorAll('.graph-node.main-output');
  testRunner.assertEqual(mainOutputElements.length, 1, 
    'Should have exactly one main output indicator');
  
  const indicatorNodeId = parseInt(mainOutputElements[0].dataset.nodeId);
  testRunner.assertEqual(indicatorNodeId, restoredKaleid.id,
    'Visual indicator should be on kaleidoscope');
  
  // Cleanup
  [...nodes].forEach(node => deleteNode(node));
});

// UI CONSISTENCY TESTS
testRunner.addTest('propertiesPanelUpdates', () => {
  const node = createNode('Oscillator', 100, 100);
  
  // Select node and check properties panel
  selectNode(node);
  
  const propertiesPanel = document.getElementById('properties-panel');
  const nodeNameElement = propertiesPanel.querySelector('h5');
  
  testRunner.assertNotNull(nodeNameElement, 'Properties panel should show node name');
  testRunner.assert(nodeNameElement.textContent.includes(node.name),
    'Properties panel should show correct node name');
  
  // Cleanup
  deleteNode(node);
});

testRunner.addTest('noDoubleInitialization', () => {
  // This test checks that we don't have duplicate nodes after page refresh
  // It's mainly for awareness - in practice this would be tested by refreshing
  
  const initialNodeCount = nodes.length;
  testRunner.assert(initialNodeCount >= 1, 'Should have at least one node after initialization');
  
  // Check for duplicate oscillators at similar positions
  const oscillators = nodes.filter(n => n.type === 'Oscillator');
  const positions = oscillators.map(n => `${Math.round(n.x/50)},${Math.round(n.y/50)}`);
  const uniquePositions = new Set(positions);
  
  testRunner.assertEqual(positions.length, uniquePositions.size,
    'Should not have multiple oscillators at the same position (duplicate initialization)');
});

testRunner.addTest('autosaveSystem', () => {
  // Clear any existing autosave
  localStorage.removeItem('visual_synthesizer_autosave');
  
  // Create a test setup
  const node1 = createNode('Oscillator', 100, 100);
  const node2 = createNode('Kaleidoscope', 300, 100);
  node2.inputs[0] = node1;
  setMainOutput(node2);
  
  // Manually trigger autosave
  saveAutosaveProject();
  
  // Check that autosave was created
  const autosaveData = localStorage.getItem('visual_synthesizer_autosave');
  testRunner.assertNotNull(autosaveData, 'Autosave should be created');
  
  const parsed = JSON.parse(autosaveData);
  testRunner.assertNotNull(parsed.project, 'Autosave should contain project data');
  testRunner.assertEqual(parsed.project.nodes.length, 2, 'Should save both nodes');
  testRunner.assertEqual(parsed.project.mainOutputNodeId, node2.id, 'Should save correct main output');
  
  // Test restoration
  const originalNodeCount = nodes.length;
  clearProject();
  
  const restored = restoreAutosavedProject();
  testRunner.assert(restored, 'Should successfully restore from autosave');
  testRunner.assertEqual(nodes.length, originalNodeCount, 'Should restore same number of nodes');
  
  const restoredKaleid = nodes.find(n => n.type === 'Kaleidoscope');
  testRunner.assertEqual(mainOutputNode, restoredKaleid, 'Should restore correct main output');
  
  // Cleanup
  [...nodes].forEach(node => deleteNode(node));
  localStorage.removeItem('visual_synthesizer_autosave');
});

testRunner.addTest('urlSharingSystem', () => {
  // Create a test project
  const osc = createNode('Oscillator', 100, 100);
  const kaleid = createNode('Kaleidoscope', 300, 100);
  kaleid.inputs[0] = osc;
  setMainOutput(kaleid);
  
  // Set some specific parameters for testing
  osc.params.frequency = 15.5;
  kaleid.params.slices = 8;
  
  // Test URL creation
  const shareData = createShareableURL();
  testRunner.assertNotNull(shareData, 'Should create shareable URL');
  testRunner.assert(shareData.url.includes('?project='), 'URL should contain project parameter');
  testRunner.assert(shareData.compressedSize < shareData.originalSize, 'Should compress data');
  testRunner.assert(shareData.urlLength < 2000, 'URL should be reasonable length for simple project');
  
  // Test project export/import via URL
  const originalNodeCount = nodes.length;
  const originalMainOutput = mainOutputNode;
  
  // Export the current project as if it was shared
  const projectData = serializeProject();
  const shareProjectData = {
    nodes: projectData.nodes,
    mainOutputNodeId: projectData.mainOutputNodeId,
    groups: projectData.groups,
    graphVisible: projectData.graphVisible,
    nodeCount: projectData.nodeCount,
    groupCount: projectData.groupCount,
    controlInputs: projectData.controlInputs,
    name: projectData.name
  };
  
  // Clear current project
  clearProject();
  
  // Import via text (simulating URL sharing)
  const success = importProjectFromText(JSON.stringify(shareProjectData));
  testRunner.assert(success, 'Should successfully import project data');
  testRunner.assertEqual(nodes.length, originalNodeCount, 'Should restore correct number of nodes');
  
  // Verify specific node parameters were preserved
  const restoredOsc = nodes.find(n => n.type === 'Oscillator');
  const restoredKaleid = nodes.find(n => n.type === 'Kaleidoscope');
  
  testRunner.assertNotNull(restoredOsc, 'Should restore oscillator');
  testRunner.assertNotNull(restoredKaleid, 'Should restore kaleidoscope');
  testRunner.assertEqual(restoredOsc.params.frequency, 15.5, 'Should preserve oscillator frequency');
  testRunner.assertEqual(restoredKaleid.params.slices, 8, 'Should preserve kaleidoscope slices');
  
  // Verify connections were preserved
  testRunner.assertEqual(restoredKaleid.inputs[0], restoredOsc, 'Should preserve node connections');
  
  // Verify main output was preserved
  testRunner.assertEqual(mainOutputNode, restoredKaleid, 'Should restore correct main output');
  
  // Cleanup
  [...nodes].forEach(node => deleteNode(node));
});

// CURSOR AND CAMERA INPUT TESTS
testRunner.addTest('cursorInputSystem', () => {
  const node = createNode('Oscillator', 100, 100);
  
  // Test cursor mapping creation
  createCursorMapping(node, 'frequency', 'x');
  
  testRunner.assert(controlInputs.cursor.x, 'X cursor mapping should exist');
  testRunner.assert(controlInputs.cursor.x.length > 0, 'X mapping should have entries');
  
  const mapping = controlInputs.cursor.x.find(m => m.nodeId === node.id && m.param === 'frequency');
  testRunner.assertNotNull(mapping, 'Should find frequency mapping for the node');
  
  // Test cursor value application
  cursorComponents.x.value = 0.5;
  applyCursorMappings();
  
  // Cleanup
  deleteNode(node);
});

testRunner.addTest('cameraInputSystem', () => {
  const node = createNode('Oscillator', 100, 100);
  
  // Test camera mapping creation
  createCameraMapping(node, 'frequency', 'brightness');
  
  testRunner.assert(controlInputs.camera.brightness, 'Brightness camera mapping should exist');
  testRunner.assert(controlInputs.camera.brightness.length > 0, 'Brightness mapping should have entries');
  
  const mapping = controlInputs.camera.brightness.find(m => m.nodeId === node.id && m.param === 'frequency');
  testRunner.assertNotNull(mapping, 'Should find frequency mapping for the node');
  
  // Test camera value application
  cameraComponents.brightness.value = 0.7;
  applyCameraMappings();
  
  // Cleanup
  deleteNode(node);
});

testRunner.addTest('newInputsSerialization', () => {
  // Create test setup with all input types
  const node1 = createNode('Oscillator', 100, 100);
  const node2 = createNode('Kaleidoscope', 300, 100);
  
  // Create mappings for each input type
  createAudioMapping(node1, 'frequency', 'bass');
  createColorMapping(node1, 'colorIndex', 'red');
  createCursorMapping(node2, 'slices', 'x');
  createCameraMapping(node2, 'mix', 'brightness');
  
  // Serialize project
  const projectData = serializeProject();
  
  testRunner.assertNotNull(projectData.controlInputs.audio, 'Project should have audio mappings');
  testRunner.assertNotNull(projectData.controlInputs.color, 'Project should have color mappings');
  testRunner.assertNotNull(projectData.controlInputs.cursor, 'Project should have cursor mappings');
  testRunner.assertNotNull(projectData.controlInputs.camera, 'Project should have camera mappings');
  
  // Clear and restore
  clearProject();
  deserializeProject(projectData);
  
  // Verify restoration
  testRunner.assert(controlInputs.audio.bass, 'Audio mappings should be restored');
  testRunner.assert(controlInputs.color.red, 'Color mappings should be restored');
  testRunner.assert(controlInputs.cursor.x, 'Cursor mappings should be restored');
  testRunner.assert(controlInputs.camera.brightness, 'Camera mappings should be restored');
  
  // Cleanup
  [...nodes].forEach(node => deleteNode(node));
});

// UTILITY FUNCTIONS FOR MANUAL TESTING
function createTestScenario() {
  console.log('🎬 Creating test scenario...');
  
  // Clear existing nodes
  [...nodes].forEach(node => deleteNode(node));
  
  // Create test setup
  const osc = createNode('Oscillator', 100, 100);
  const noise = createNode('Noise', 300, 100);
  const mix = createNode('Mix', 500, 100);
  
  // Connect them
  mix.inputs[0] = osc;
  mix.inputs[1] = noise;
  
  // Set mix as main output
  setMainOutput(mix);
  
  // Add some mappings
  createAudioMapping(osc, 'frequency', 'bass');
  createAudioMapping(osc, 'colorPalette', 'overall');
  
  updateConnections();
  console.log('✅ Test scenario created');
  
  return { osc, noise, mix };
}

function validateState() {
  console.log('🔍 Validating application state...');
  
  const issues = [];
  
  // Check main output consistency
  const dropdown = document.getElementById('main-output-select');
  const selectedValue = parseInt(dropdown.value);
  if (selectedValue !== mainOutputNode?.id) {
    issues.push(`Main output dropdown (${selectedValue}) doesn't match actual main output (${mainOutputNode?.id})`);
  }
  
  // Check visual indicators
  const mainOutputElements = document.querySelectorAll('.graph-node.main-output');
  if (mainOutputNode && mainOutputElements.length !== 1) {
    issues.push(`Expected 1 main output indicator, found ${mainOutputElements.length}`);
  }
  
  // Check for orphaned mappings
  Object.values(controlInputs.audio).forEach(mappings => {
    mappings.forEach(mapping => {
      const nodeExists = nodes.find(n => n.id === mapping.nodeId);
      if (!nodeExists) {
        issues.push(`Found orphaned audio mapping for non-existent node ${mapping.nodeId}`);
      }
    });
  });
  
  if (issues.length === 0) {
    console.log('✅ All state validations passed');
  } else {
    console.log('❌ State validation issues found:');
    issues.forEach(issue => console.log(`  - ${issue}`));
  }
  
  return issues;
}

// ===== CONTROL INPUT MANAGER TESTS =====

testRunner.addTest('controlInputManager_initialization', async () => {
  // Test that Control Input Manager elements exist
  const existingSelect = document.getElementById('existing-control-inputs');
  const newTypeSelect = document.getElementById('new-control-input-type');
  const statusSpan = document.getElementById('control-input-status');
  
  assert(existingSelect, 'Existing control inputs select should exist');
  assert(newTypeSelect, 'New control input type select should exist');
  assert(statusSpan, 'Control input status span should exist');
  
  // Test that new type select has all expected options
  const options = Array.from(newTypeSelect.options).map(opt => opt.value).filter(v => v);
  const expectedTypes = ['MIDIInput', 'AudioInput', 'CursorInput', 'CameraInput', 'RandomInput'];
  
  expectedTypes.forEach(type => {
    assert(options.includes(type), `Should have option for ${type}`);
  });
});

testRunner.addTest('controlInputManager_createMIDIInput', async () => {
  // Clear any existing input nodes
  const initialInputNodes = nodes.filter(n => n.category === 'input');
  initialInputNodes.forEach(node => deleteNode(node));
  
  // Test creating MIDI input
  const node = createControlInputNode('MIDIInput');
  assert(node, 'Should create MIDI input node');
  assert(node.type === 'MIDIInput', 'Node should be MIDIInput type');
  assert(node.category === 'input', 'Node should be input category');
  assert(node.params.ccNumber, 'Should have ccNumber parameter');
  
  // Test that it appears in existing control inputs dropdown
  updateExistingControlInputs();
  const existingSelect = document.getElementById('existing-control-inputs');
  const options = Array.from(existingSelect.options);
  const nodeOption = options.find(opt => parseInt(opt.value) === node.id);
  assert(nodeOption, 'Created node should appear in existing control inputs dropdown');
});

testRunner.addTest('controlInputManager_createAllTypes', async () => {
  // Clear any existing input nodes
  const initialInputNodes = nodes.filter(n => n.category === 'input');
  initialInputNodes.forEach(node => deleteNode(node));
  
  const types = ['MIDIInput', 'AudioInput', 'CursorInput', 'CameraInput', 'RandomInput'];
  const createdNodes = [];
  
  // Test creating each type
  for (const type of types) {
    const node = createControlInputNode(type);
    assert(node, `Should create ${type} node`);
    assert(node.type === type, `Node should be ${type} type`);
    assert(node.category === 'input', `${type} should be input category`);
    createdNodes.push(node);
  }
  
  // Test that all appear in dropdown
  updateExistingControlInputs();
  const existingSelect = document.getElementById('existing-control-inputs');
  
  createdNodes.forEach(node => {
    const options = Array.from(existingSelect.options);
    const nodeOption = options.find(opt => parseInt(opt.value) === node.id);
    assert(nodeOption, `${node.type} should appear in dropdown`);
  });
});

testRunner.addTest('controlInputManager_groupingByType', async () => {
  // Clear and create multiple nodes of same type
  const initialInputNodes = nodes.filter(n => n.category === 'input');
  initialInputNodes.forEach(node => deleteNode(node));
  
  // Create multiple MIDI inputs
  const midi1 = createControlInputNode('MIDIInput');
  const midi2 = createControlInputNode('MIDIInput');
  const audio1 = createControlInputNode('AudioInput');
  
  updateExistingControlInputs();
  const existingSelect = document.getElementById('existing-control-inputs');
  
  // Test that optgroups are created
  const optgroups = existingSelect.querySelectorAll('optgroup');
  assert(optgroups.length >= 2, 'Should have optgroups for different types');
  
  // Test that MIDI Controller group has 2 options
  const midiGroup = Array.from(optgroups).find(group => group.label === 'MIDI Controller');
  assert(midiGroup, 'Should have MIDI Controller optgroup');
  assert(midiGroup.children.length === 2, 'MIDI Controller group should have 2 options');
});

testRunner.addTest('controlInputManager_invalidTypeHandling', async () => {
  // Test creating invalid type
  const node = createControlInputNode('InvalidType');
  assert(!node, 'Should not create node for invalid type');
  
  // Test that error status is set
  const statusSpan = document.getElementById('control-input-status');
  assert(statusSpan.classList.contains('error'), 'Should show error status');
  assert(statusSpan.textContent.includes('Invalid'), 'Should show invalid type error');
});

testRunner.addTest('controlInputManager_nodeSelection', async () => {
  // Clear and create a test node
  const initialInputNodes = nodes.filter(n => n.category === 'input');
  initialInputNodes.forEach(node => deleteNode(node));
  
  const testNode = createControlInputNode('AudioInput');
  
  // Simulate selecting the node from dropdown
  const existingSelect = document.getElementById('existing-control-inputs');
  updateExistingControlInputs();
  
  // Find the option for our test node
  const options = Array.from(existingSelect.options);
  const nodeOption = options.find(opt => parseInt(opt.value) === testNode.id);
  assert(nodeOption, 'Test node should be in dropdown');
  
  // Simulate selection
  existingSelect.value = testNode.id;
  existingSelect.dispatchEvent(new Event('change'));
  
  // Check that node is selected
  assert(selectedNode === testNode, 'Test node should be selected');
  
  // Check that success status is shown
  const statusSpan = document.getElementById('control-input-status');
  assert(statusSpan.classList.contains('success'), 'Should show success status');
});

testRunner.addTest('controlInputManager_positionCalculation', async () => {
  // Clear existing input nodes
  const initialInputNodes = nodes.filter(n => n.category === 'input');
  initialInputNodes.forEach(node => deleteNode(node));
  
  // Create nodes and test positioning
  const node1 = createControlInputNode('MIDIInput');
  const node2 = createControlInputNode('AudioInput');
  const node3 = createControlInputNode('CursorInput');
  
  // Test that nodes are positioned correctly (left side, stacked)
  assert(node1.x === 50, 'First node should be at x=50');
  assert(node1.y === 80, 'First node should be at y=80');
  
  assert(node2.x === 50, 'Second node should be at x=50');
  assert(node2.y === 200, 'Second node should be at y=200 (80 + 120)');
  
  assert(node3.x === 50, 'Third node should be at x=50');
  assert(node3.y === 320, 'Third node should be at y=320 (80 + 2*120)');
});

testRunner.addTest('controlInputManager_updateOnNodeDeletion', async () => {
  // Create test nodes
  const testNode = createControlInputNode('RandomInput');
  
  // Verify it appears in dropdown
  updateExistingControlInputs();
  const existingSelect = document.getElementById('existing-control-inputs');
  let options = Array.from(existingSelect.options);
  let nodeOption = options.find(opt => parseInt(opt.value) === testNode.id);
  assert(nodeOption, 'Node should be in dropdown before deletion');
  
  // Delete the node
  deleteNode(testNode);
  
  // Verify it's removed from dropdown
  options = Array.from(existingSelect.options);
  nodeOption = options.find(opt => parseInt(opt.value) === testNode.id);
  assert(!nodeOption, 'Node should be removed from dropdown after deletion');
});

testRunner.addTest('controlInputManager_statusMessages', async () => {
  const statusSpan = document.getElementById('control-input-status');
  
  // Test setting different status types
  setControlInputStatus('Test message', 'success');
  assert(statusSpan.textContent === 'Test message', 'Should set status text');
  assert(statusSpan.classList.contains('success'), 'Should add success class');
  
  setControlInputStatus('Error message', 'error');
  assert(statusSpan.textContent === 'Error message', 'Should update status text');
  assert(statusSpan.classList.contains('error'), 'Should add error class');
  assert(!statusSpan.classList.contains('success'), 'Should remove previous class');
  
  setControlInputStatus('Normal message');
  assert(statusSpan.textContent === 'Normal message', 'Should set normal status');
  assert(!statusSpan.classList.contains('error'), 'Should remove error class');
});

testRunner.addTest('controlInputManager_typeLabels', async () => {
  // Test type label mappings
  assert(getControlInputTypeLabel('MIDIInput') === 'MIDI Controller', 'MIDI label should be correct');
  assert(getControlInputTypeLabel('AudioInput') === 'Audio Analysis', 'Audio label should be correct');
  assert(getControlInputTypeLabel('CursorInput') === 'Mouse/Cursor', 'Cursor label should be correct');
  assert(getControlInputTypeLabel('CameraInput') === 'Camera Motion', 'Camera label should be correct');
  assert(getControlInputTypeLabel('RandomInput') === 'Random Generator', 'Random label should be correct');
  assert(getControlInputTypeLabel('UnknownType') === 'UnknownType', 'Unknown type should return itself');
});

testRunner.addTest('canvasDisplay_positioning', async () => {
  // Test that Canvas node is positioned in bottom right area
  const canvasDisplayNode = nodes.find(n => n.name === 'Canvas');
  assert(canvasDisplayNode, 'Canvas node should exist');
  
  // Initial position should be in bottom right area
  assert(canvasDisplayNode.x >= 1000, 'Canvas should be positioned far right (x >= 1000)');
  assert(canvasDisplayNode.y >= 400, 'Canvas should be positioned in bottom area (y >= 400)');
  
  // Create some other nodes and trigger auto-layout
  const testNode1 = createNode('Oscillator', 100, 100);
  const testNode2 = createNode('Noise', 200, 100);
  
  // Trigger auto-layout
  performAutoLayout();
  
  // Wait for animation and verify Canvas stays in bottom right
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const otherNodes = nodes.filter(n => n.name !== 'Canvas');
  const maxOtherX = Math.max(...otherNodes.map(n => n.x));
  const maxOtherY = Math.max(...otherNodes.map(n => n.y));
  
  assert(canvasDisplayNode.x > maxOtherX, 'Canvas should be rightmost node after auto-layout');
  assert(canvasDisplayNode.y > maxOtherY, 'Canvas should be bottommost node after auto-layout');
  
  // Cleanup
  deleteNode(testNode1);
  deleteNode(testNode2);
});

testRunner.addTest('feedbackTrail_accumulation', async () => {
  // Regression test for FeedbackTrail effect
  const osc = createNode('Oscillator', 100, 100);
  const trail = createNode('FeedbackTrail', 300, 100);
  const finalOut = nodes.find(n => n.type === 'FinalOutput');
  
  // Connect them
  trail.inputs[0] = osc;
  finalOut.inputs[0] = trail;
  
  // Set parameters for visible effect
  trail.params.decay = 0.8;
  trail.params.blur = 2.0;
  osc.params.frequency = 5.0;
  
  // Render multiple frames to accumulate trail
  let frameCount = 0;
  const renderFrames = () => {
    return new Promise(resolve => {
      const renderLoop = () => {
        renderNode(osc, frameCount * 0.1);
        renderNode(trail, frameCount * 0.1);
        frameCount++;
        
        if (frameCount < 10) {
          requestAnimationFrame(renderLoop);
        } else {
          resolve();
        }
      };
      renderLoop();
    });
  };
  
  await renderFrames();
  
  // Verify trail has valid output texture
  assert(trail.texture && gl.isTexture(trail.texture), 'FeedbackTrail should have valid output texture');
  assert(trail.feedbackTexture && gl.isTexture(trail.feedbackTexture), 'FeedbackTrail should have valid feedback texture');
  
  // Cleanup
  trail.inputs[0] = null;
  finalOut.inputs[0] = null;
  deleteNode(osc);
  deleteNode(trail);
});

testRunner.addTest('feedbackTrail_brightness_accumulation', async () => {
  // Regression test ensuring FeedbackTrail accumulates brightness over frames
  const osc = createNode('Oscillator', 100, 100);
  const trail = createNode('FeedbackTrail', 300, 100);
  
  // Connect them
  trail.inputs[0] = osc;
  
  // Set parameters for accumulation test
  trail.params.decay = 0.9;
  trail.params.blur = 0.0;  // No blur for clearer brightness test
  osc.params.frequency = 2.0;
  
  // Capture initial brightness after first frame
  renderNode(osc, 0);
  renderNode(trail, 0);
  
  // Read pixels to calculate initial brightness
  const initialPixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, trail.fbo);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, initialPixels);
  
  let initialBrightness = 0;
  for (let i = 0; i < initialPixels.length; i += 4) {
    initialBrightness += (initialPixels[i] + initialPixels[i+1] + initialPixels[i+2]) / 3;
  }
  
  // Render 3 more frames
  for (let t = 1; t <= 3; t++) {
    renderNode(osc, t * 0.1);
    renderNode(trail, t * 0.1);
  }
  
  // Read pixels after accumulation
  const accumulatedPixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, trail.fbo);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, accumulatedPixels);
  
  let accumulatedBrightness = 0;
  for (let i = 0; i < accumulatedPixels.length; i += 4) {
    accumulatedBrightness += (accumulatedPixels[i] + accumulatedPixels[i+1] + accumulatedPixels[i+2]) / 3;
  }
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  // Verify brightness increased
  assert(accumulatedBrightness > initialBrightness, 
    'FeedbackTrail should accumulate brightness over multiple frames');
  
  // Cleanup
  trail.inputs[0] = null;
  deleteNode(osc);
  deleteNode(trail);
});

testRunner.addTest('feedbackTrail_with_layer_graph', async () => {
  // Regression test for exact graph: Oscillator → FeedbackTrail → Layer(+Voronoi) → Canvas
  const osc = createNode('Oscillator', 100, 100);
  const trail = createNode('FeedbackTrail', 300, 100);
  const voronoi = createNode('Voronoi', 100, 300);
  const layer = createNode('Layer', 500, 200);
  
  // Connect the graph
  trail.inputs[0] = osc;
  layer.inputs[0] = trail;
  layer.inputs[1] = voronoi;
  
  // Set parameters
  osc.params.frequency = 5.0;
  trail.params.decay = 0.9;
  trail.params.blur = 1.0;
  layer.params.opacity = 1.0;
  layer.params.blendMode = 'Normal';
  
  // Render three frames
  for (let frame = 0; frame < 3; frame++) {
    const time = frame * 0.1;
    renderNode(osc, time);
    renderNode(voronoi, time);
    renderNode(trail, time);
    renderNode(layer, time);
  }
  
  // Read pixels from layer output
  const pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.bindFramebuffer(gl.FRAMEBUFFER, layer.fbo);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  
  // Calculate average green channel (should be > 0.02 if trail is accumulating)
  let totalGreen = 0;
  for (let i = 1; i < pixels.length; i += 4) {
    totalGreen += pixels[i] / 255.0;
  }
  const avgGreen = totalGreen / (canvas.width * canvas.height);
  
  assert(avgGreen > 0.02, 
    `FeedbackTrail should accumulate in Layer output (avg green: ${avgGreen.toFixed(4)})`);
  
  // Cleanup
  trail.inputs[0] = null;
  layer.inputs[0] = null;
  layer.inputs[1] = null;
  deleteNode(osc);
  deleteNode(trail);
  deleteNode(voronoi);
  deleteNode(layer);
});

testRunner.addTest('circular_dependency_prevention', () => {
  // Test that circular dependencies are prevented and don't cause black output
  const layer1 = createNode('Layer', 100, 100);
  const layer2 = createNode('Layer', 300, 100);
  
  // Create circular dependency
  layer1.inputs[0] = layer2;
  layer2.inputs[0] = layer1;
  
  // Set some test parameters
  layer1.params.opacity = 1.0;
  layer1.params.blendMode = 'Normal';
  layer2.params.opacity = 0.5;
  layer2.params.blendMode = 'Screen';
  
  // Attempt to render - should not crash or produce errors
  try {
    renderNode(layer1, 0);
    renderNode(layer2, 0);
  } catch (e) {
    assert(false, 'Circular dependency caused rendering error: ' + e.message);
  }
  
  // Verify fallback textures were used
  assert(layer1.texture && gl.isTexture(layer1.texture), 'Layer1 should have valid output texture despite circular dependency');
  assert(layer2.texture && gl.isTexture(layer2.texture), 'Layer2 should have valid output texture despite circular dependency');
  
  // Cleanup
  layer1.inputs[0] = null;
  layer2.inputs[0] = null;
  deleteNode(layer1);
  deleteNode(layer2);
});

// Global functions for easy access
window.runAllTests = () => testRunner.runAllTests();
window.runTest = (name) => testRunner.runTest(name);
window.createTestScenario = createTestScenario;
window.validateState = validateState;

console.log('🧪 Test suite loaded! Available commands:');
console.log('  runAllTests() - Run all tests');
console.log('  runTest("testName") - Run specific test');
console.log('  createTestScenario() - Create test nodes and connections');
console.log('  validateState() - Check application state consistency');