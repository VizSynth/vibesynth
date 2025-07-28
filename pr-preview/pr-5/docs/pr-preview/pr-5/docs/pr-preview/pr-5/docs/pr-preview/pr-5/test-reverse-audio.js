// Test function to verify reverse range for AudioInput
function testReverseAudioRange() {
  console.log('=== Testing AudioInput Reverse Range Feature ===');
  
  // Create nodes
  const audio = addNode('AudioInput');
  const oscillator = addNode('Oscillator');
  const transform = addNode('Transform');
  const output = addNode('FinalOutput');
  
  // Set up connections
  oscillator.inputs[0] = null;  // No input needed
  transform.inputs[0] = oscillator;
  output.inputs[0] = transform;
  
  // Connect audio to control transform scale
  transform.controlInputs = transform.controlInputs || [null, null];
  transform.controlInputs[1] = audio;  // Control scaleX
  
  // Configure audio input
  audio.params.band = 'bass';
  audio.params.min = 0.5;
  audio.params.max = 2.0;
  audio.params.reverseRange = false;
  
  console.log('Setup complete:');
  console.log('- AudioInput → Transform.scaleX');
  console.log('- Band: bass, Min: 0.5, Max: 2.0');
  console.log('- Reverse Range: OFF (normal operation)');
  console.log('');
  console.log('To test:');
  console.log('1. Enable audio input if not already enabled');
  console.log('2. Play music and observe transform scale');
  console.log('3. Toggle reverseRange in AudioInput properties');
  console.log('4. With reverseRange ON: silence = max scale, loud = min scale');
  console.log('5. With reverseRange OFF: silence = min scale, loud = max scale');
  
  // Select the audio node to show properties
  selectNode(audio);
  
  return { audio, oscillator, transform, output };
}

// Add to window for easy access
window.testReverseAudioRange = testReverseAudioRange;