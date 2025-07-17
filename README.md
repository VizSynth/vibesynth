# vibesynth

vibesynth is a **web-based modular video synthesizer**. It lets you create realtime visual effects and synthesize video by patching together sources and effects in your browser. The app is implemented in JavaScript with WebGL for high-performance graphics, ensuring cross-platform compatibility (runs on modern browsers on any OS). The design takes inspiration from tools like **Hydra** (live-coded browser synth) and the **Video Synthesis Ecosphere RPI** by Andrei Jay, using multiple framebuffers to mix and chain visual outputs. The interface is analogous to analog modular synths – instead of audio, you connect **video source modules** and **effect modules** in a patch.

## Features

- **Real-time Video Synthesis:** Generate visuals from scratch (oscillator patterns, noise textures, shapes).
- **Video Input:** Incorporate a webcam feed as a source module (if available).
- **Modular Patching Interface:** Graphical interface (via dat.GUI) to add modules and route their outputs. Each module appears in the GUI with adjustable parameters and input selectors.
- **Advanced Compositing:** Professional-grade layer compositing with Photoshop-style blend modes (Normal, Multiply, Screen, Overlay, Soft Light, Hard Light, Color Dodge, Color Burn, Darken, Lighten, Difference, Exclusion).
- **Transform Controls:** Position, scale, rotate, and adjust opacity of any source with pixel-perfect control.
- **Multi-layer Compositing:** Composite up to 4 layers simultaneously with individual opacity controls.
- **Node Organization:** Enable/disable individual nodes and organize them into named groups for complex project management.
- **Effects and Filters:** Color adjustment (brightness/contrast/saturation, invert), kaleidoscope (multi-symmetry), and blending effects allow complex effect chains.
- **MIDI Input Support:** Uses Web MIDI API to accept MIDI CC (Control Change) messages for parameter control, auto-connecting to the first MIDI device. The GUI displays the last CC number received for easy mapping reference. (You can extend the code to map CCs to specific parameters.)
- **Fullscreen & Resolution Control:** Switch to fullscreen display with one click. Adjust rendering resolution (Low/Med/High/Ultra) on the fly to balance quality and performance.
- **Live Preview:** The main output canvas updates in real-time as you tweak parameters, showing the result of your current patch.

## Usage Guide

**Running the Synth:** Simply open the `index.html` (Replit should preview it automatically when you run the project). You'll see the main canvas (initially showing a default oscillator pattern) and a dat.GUI panel on the top-right.

**Adding Modules:** In the GUI, open the **"Add Node"** folder. Click a button to add a module:

*Source Modules:*
- **Oscillator:** Generates moving colored stripes (sine wave patterns).
- **Noise:** Generates a pseudo-random noise texture.
- **Shape:** Draws a basic shape (default is a circle) with adjustable size and softness.
- **Video:** Captures your webcam video as a texture (you'll be prompted for camera permission).
- **Plasma:** Creates beautiful fBm-based plasma effects with pastel colors.
- **Voronoi:** Generates Worley noise cellular patterns.
- **Radial Gradient:** Creates smooth radial gradient fills.
- **Flow Field:** Produces curl noise flow field animations.
- **Text:** Renders custom text as a texture source.
- **Video File:** Loads and plays video files as texture input.

*Effect Modules:*
- **Transform:** Position, scale, rotate, and adjust opacity of any input source.
- **ColorAdjust:** Adjusts brightness/contrast/saturation and can invert colors of an input.
- **Kaleidoscope:** Applies a kaleidoscopic symmetry effect to an input (adjust slices count).

*Beauty Effects:*
- **Mirror:** Creates horizontal, vertical, or radial mirror reflections.
- **Noise Displace:** Applies Perlin noise-based displacement warping.
- **Polar Warp:** Transforms Cartesian coordinates to polar with twist effects.
- **RGB Split:** Creates chromatic aberration by splitting color channels.
- **Feedback Trail:** Generates motion trails with decay and blur.
- **Bloom:** Adds a beautiful glow effect to bright areas.

*Compositing Modules:*
- **Mix:** Simple crossfade blend between two sources with a mix factor.
- **Layer:** Advanced Photoshop-style blending with 12 different blend modes (Multiply, Screen, Overlay, etc.).
- **Composite:** Multi-layer compositor that can blend up to 4 input sources with individual opacity controls.

Each new module appears as a folder in the GUI with controls:
- **Source modules** (Oscillator, Noise, Shape, Video) have settings like frequency, speed, color, etc.
- **Effect modules** (Mix, ColorAdjust, Kaleidoscope) have dropdowns to select their **Input** sources and parameters for the effect (e.g., mix amount, brightness, slices).
- **Remove** button in each folder deletes that module from the patch.

**Patching Connections:** To route outputs between modules:
- For an **Effect/Kaleidoscope**, use its **Input** dropdown to choose a source (or even another effect) to process.
- For a **Mix**, select **Input A** and **Input B** from existing module names. The Mix will blend those two inputs (set "mix" to 0 = all A, 1 = all B, or in-between for crossfade).
- You can chain multiple effects by setting an effect's input to the output of another effect, and so on. This is analogous to connecting patch cables between video synth modules.
- The system prevents direct self-feedback loops via the dropdown (a module won't list itself), although feedback can be achieved by creative patching (e.g., using a Mix to blend a source with a delayed version of itself).

**Main Output:** The **"Main Output"** dropdown (in Settings) determines which module's output is shown on the canvas. By default, the newest added non-source module becomes the main output (e.g., if you add a ColorAdjust on an oscillator, the ColorAdjust's result is displayed). You can manually select any module's output to view via this dropdown at any time.

**MIDI Control:** If you have a MIDI controller:
- Connect it and refresh the page. The app will automatically connect to the first MIDI input device.
- Turn a knob/slider on your controller – the GUI **MIDI** section will show the CC number of the last moved control ("Last CC"). You can use this to map that CC to a parameter:
  - Currently, mappings are not set by default (except the display). To map, open **script.js** and in the `midiMappings` object, assign the CC number to a function that sets a parameter. For example, to have CC 10 control an oscillator's frequency, you could add: `midiMappings[10] = val => oscillatorNode.frequency = val/127 * 50;` (assuming `oscillatorNode` is your node reference).
  - This manual step is for advanced users; a full MIDI learn system could be added. The inclusion of Web MIDI here demonstrates feasibility (as seen in Pixel Synth).
- MIDI Note: The app listens for Control Change messages (MIDI CC). Note-on/off or other messages can be handled by extending `handleMIDIMessage`.

**OSC Support:** The browser doesn't natively support OSC, but you can receive OSC by running a small bridge (e.g., using osc-js or via a websocket server that translates OSC to WebSockets). If integrated, you could map OSC messages to similar parameter functions as MIDI. This is noted as *feasible* but not enabled by default for simplicity.

**Audio Reactivity:** While this synthesizer focuses on video, you can bring audio into the mix. Hydra, for example, can interface with Tone.js for audio. In this project, you could:
- Use the Web Audio API or Tone.js to analyze sound (microphone input or an audio track).
- Feed audio levels (e.g., an FFT band or amplitude) into a uniform or parameter. For instance, you could modulate an effect's intensity by microphone input in the code.
- This would require writing a bit of code in `script.js` to get audio data in `render()` and then apply it (similar to how `elapsed time` is passed as `u_time` uniform).
- Though not implemented out-of-the-box, the code structure is ready for such extensions.

**Node Organization & Project Management:**

*Enable/Disable Nodes:*
- Each node has an **"Enabled"** checkbox in its GUI folder. Unchecked nodes are completely skipped during rendering, improving performance and allowing you to temporarily disable effects or sources.
- Disabled nodes still maintain their connections and parameter settings – they just don't render.

*Grouping System:*
- Use the **"Groups"** folder to create named groups (like "Background Elements", "Foreground Effects", etc.).
- Assign nodes to groups using the **"Group"** dropdown in each node's controls.
- Groups have their own **"Group Enabled"** toggle – disabling a group disables all nodes in that group.
- Groups appear as **📁 Group Name** folders in the GUI with rename and remove options.
- Perfect for organizing complex projects with many layers and effects.

*Advanced Compositing Workflows:*
- Use **Transform** nodes to position and scale multiple sources on screen simultaneously.
- **Layer** nodes provide professional blend modes: try Multiply for darkening effects, Screen for brightening, Overlay for contrast, or Difference for psychedelic results.
- **Composite** nodes let you stack up to 4 sources with individual opacity controls – perfect for complex layered compositions.
- Chain multiple **Layer** and **Mix** nodes to create sophisticated blend hierarchies.

**Performance Tips:** 
- Start with Medium or High resolution. Ultra (1080p) may be demanding with multiple layers.
- You can reduce the **mix** of noise or complexity of shapes to improve frame rates. The rendering loop is optimized with offscreen framebuffers so only used modules are rendered each frame, but heavy shaders or many modules can still tax the GPU.
- If the GUI becomes unresponsive or frames drop, try lowering resolution or removing some effects.

**Inspiration and Credits:** 
- This project is inspired by **Andrei Jay's Video Synthesis Ecosphere** and the idea of running modular video synths on small hardware (Raspberry Pi) with open-source tools. It aims to bring that experience into the browser.
- The approach to chaining framebuffers and functions is heavily influenced by **Hydra** by Olivia Jack, which demonstrates the power of functional video synthesis in WebGL.
- The use of **dat.GUI** for a modular interface and **Web MIDI** for interactivity is informed by projects like Don Hanson's **Pixel Synth** and the **VirtualMixerProject** which implemented a browser-based VJ framework with chainable components.
- The shader code uses common techniques from the GLSL community (noise generation, kaleidoscope math, etc.), and the default oscillator shader is adapted to produce multi-color stripes akin to Hydra's osc() output.
- Big thanks to the open-source libraries and examples that made this possible: **dat.GUI**, **Web MIDI API**, and numerous creative coding references.

Enjoy creating visuals! Feel free to tweak and extend the code – add new shader modules, implement audio-reactive uniforms, or build a more advanced patch editor. This project provides a foundation for a browser-based, fully-featured visual synthesizer. Happy coding and VJing!