---
name: ar-simulation-builder
description: >-
  Builds, optimizes, and reviews hyper-realistic web-based AR simulations (Physics, Chemistry, Biology, Math, AI Robotics) using MediaPipe Hands, A-Frame, and Three.js PBR Physical Shaders. Implements zero-GC loop engineering, Web Audio API live acoustic synthesizers, 21-joint 3D cyber skeletons, multi-channel canvas oscilloscopes, and GitHub Pages Global CDN standalone deployments.
---

# AR Simulation Builder (Hyper-Realistic & Cloud CDN Edition)

## Overview
This skill instructs the agent on how to architect, build, review, optimize, and deploy state-of-the-art web-based AR simulations that use A-Frame / Three.js for 3D PBR rendering and MediaPipe Hands for multi-modal spatial interaction.

It encapsulates advanced techniques:
1. **PBR Physical Materials**: Brushed aluminum, optical glass, brass micrometers, gold-pinned ceramic chips, LED emissive halos.
2. **Web Audio API Acoustic Synthesizer**: Real-time sound generation for tactile and physical interaction feedback (laser hums, micrometer ratchet clicks, photo-gate beeps, impact collisions, Doppler shifts, ultrasonic frequencies).
3. **21-Joint 3D Cyber Skeleton**: Real-time rendering of hand joints with synaptic nodes and pinch haptics.
4. **Multi-Channel Live Canvas Oscilloscopes**: Real-time phase plots, $v-t/s-t$ kinematics trackers, and Kalman split denoising scopes.
5. **Zero-GC Loop Engineering**: Pre-allocated math structures outside animation loops to maintain a locked 60 FPS.
6. **GitHub Pages Global CDN Deployment**: Standalone hosting architecture (`https://<user>.github.io/<repo>/simulators/...`) providing global HTTPS security for webcam access, CORS-enabled WebXR, and zero-latency loading.
7. **AI Seamless Author Banner Compositing**: AI Neural Background Removal (U2-Net / IsNet) + Cyan Rim Lighting + Volumetric Backlight + Smooth Bottom Feather Fade.

---

## Technical Architecture Standard

### 1. Boilerplate Generator Template
Every simulator HTML must follow this complete, self-contained architecture with `.left-panel-stack` and zero-collision 3D layout:

```html
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Lab Title] — AR Hyper-Realistic MediaPipe Lab</title>
  <link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Prompt:wght@300;400;600;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
  <style>
    :root { --theme-color: #00f0ff; --theme-dark: #030712; --panel-bg: rgba(8, 15, 30, 0.94); }
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body { background: var(--theme-dark); color: #f8fafc; font-family: 'Prompt', sans-serif; overflow: hidden; height: 100vh; width: 100vw; }
    #scene-container { position: absolute; inset: 0; z-index: 1; }
    .cam-box { position: absolute; bottom: 20px; right: 20px; width: 240px; height: 180px; border-radius: 16px; border: 2px solid var(--theme-color); overflow: hidden; z-index: 10; box-shadow: 0 10px 35px rgba(0,0,0,0.85); background: #000; }
    #camera-feed { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
    #tracking-canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 11; pointer-events: none; transform: scaleX(-1); }
    
    /* Zero-Overlap Flexbox UI Overlay */
    .ui-overlay { position: absolute; top: 0; left: 0; right: 0; z-index: 20; padding: 16px 24px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; }
    .left-panel-stack { display: flex; flex-direction: column; gap: 10px; max-width: 500px; pointer-events: auto; }
    .header-card { background: var(--panel-bg); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); border-left: 6px solid var(--theme-color); padding: 14px 20px; border-radius: 14px; box-shadow: 0 12px 40px rgba(0,0,0,0.75); }
    .header-card h1 { font-size: 1.15em; font-weight: 700; color: var(--theme-color); margin-bottom: 4px; display: flex; align-items: center; gap: 10px; font-family: 'Chakra Petch', sans-serif; }
    .header-card p { font-size: 0.82em; color: #cbd5e1; line-height: 1.5; }
    .status-badge { display: inline-flex; align-items: center; gap: 8px; margin-top: 6px; font-size: 0.78em; color: #34d399; font-weight: 600; background: rgba(6, 78, 59, 0.6); padding: 3px 12px; border-radius: 20px; border: 1px solid #10b981; }
    .dot-pulse { width: 8px; height: 8px; background: #34d399; border-radius: 50%; box-shadow: 0 0 10px #34d399; animation: pulse 1.5s infinite; }
    .gesture-guide { background: var(--panel-bg); backdrop-filter: blur(14px); border: 1px solid rgba(250, 204, 21, 0.4); padding: 12px 16px; border-radius: 14px; font-size: 0.80em; color: #fef08a; box-shadow: 0 8px 30px rgba(0,0,0,0.6); line-height: 1.6; pointer-events: auto; }
    .target-highlight { color: #00f0ff; font-weight: 700; text-shadow: 0 0 8px #00f0ff; }
    
    .hud-bar { position: absolute; bottom: 20px; left: 24px; z-index: 20; background: var(--panel-bg); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; padding: 12px 22px; display: flex; gap: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.75); }
    .hud-item { display: flex; flex-direction: column; gap: 2px; }
    .hud-label { font-size: 0.68em; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .hud-val { font-size: 1.10em; color: #facc15; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
    .control-panel { background: var(--panel-bg); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.15); padding: 12px 18px; border-radius: 16px; display: flex; flex-direction: column; gap: 8px; pointer-events: auto; }
    .btn-action { background: linear-gradient(135deg, #0284c7, var(--theme-color)); color: #020617; font-weight: 700; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 0.82em; font-family: 'Chakra Petch', sans-serif; transition: all 0.2s; }
    .btn-action:hover { transform: scale(1.05); box-shadow: 0 0 16px var(--theme-color); }
  </style>
</head>
<body>
  ...
</body>
</html>
```

### 2. Viewport & Spatial Elevation Standards
1. **Vertical Centering (Eye-Level Rule)**:
   - Always elevate the 3D model pivot to `position="0 0.95 -0.2"` with camera at `position="0 1.0 2.2"`.
   - Never leave model pivot at `(0, 0, 0)` which causes the apparatus to sink to the bottom edge of the screen.
   - Provide `⬆ เลื่อนขึ้น` and `⬇ เลื่อนลง` buttons in the `.control-panel` to adjust `scenePosY` dynamically.
2. **Zero-Overlap Flex Stack Architecture (Mandatory)**:
   - **NEVER** use `position: absolute; top: 145px;` for `.gesture-guide` or instructions.
   - **ALWAYS** nest `.header-card` and `.gesture-guide` sequentially inside `.left-panel-stack` under `.ui-overlay`.
   - `.control-panel` MUST remain on the **RIGHT** side of `.ui-overlay`.
3. **3D Hologram Screen Spacing (`<a-plane>` & `<a-text>`)**:
   - Screen plane size minimum `width="3.8" height="1.45" position="0 1.15 -0.3"`.
   - Every `<a-text>` line must have an explicit `wrap-count="45"` or `wrap-count="50"` to prevent unexpected multi-line wrapping in A-Frame.
   - Text lines must be vertically separated by at least $\Delta Y = 0.24$ (e.g. $Y = +0.52, +0.28, +0.04, -0.20, -0.44$).
   - Text strings must be concise and self-contained on a single line.
4. **3D Interactive Elements Depth Separation ($Z$-axis layering)**:
   - Base DIP switches / data selectors should be placed at $Z = 0.05$ to $0.20$.
   - Secondary action buttons (Invert, Noise, Corrupt) must be placed in front at $Z = 0.52$, elevated slightly ($Y = 0.16$), preventing visual overlap or occlusion with switch labels.
5. **Typography & Clean Text Rules**:
   - Never output unparsed LaTeX formulas inside HTML strings, HUD text, or 3D text (e.g. avoid `$0 \leftrightarrow 1$`).
   - Always use clean Unicode characters (e.g. `0° ↔ 360°`, `0 ↔ 1`, `d₇ ↔ d₀`, `2⁻¹ ↔ 2⁻⁸`).
6. **360° Hand-Tilt & Mouse Orbit Navigation**:
   - Calculate wrist-to-middle knuckle tilt angle: `tiltDeg = Math.atan2(dxW, -dyW) * (180 / Math.PI)`.
   - Rotate the 3D pivot smoothly when `|tiltDeg| > 25°` or via mouse canvas drag.

---

## ⚡ 70 Hyper-Realistic AR Curricula Matrix — Digital Electronics 2026 (Course DE2026)

| บทที่ | หัวข้อหลัก | ชุดปฏิบัติการเสมือนจริง 5 ห้องทดลอง AR MediaPipe (Digital Electronics) |
| :---: | :--- | :--- |
| **1** | **ระบบตัวเลขและการแปลงฐาน** | 1.1 8-Bit Binary Switch Lab, 1.2 Repeated Division Ladder, 1.3 BCD & 7-Segment Decoder, 1.4 Rotary Optical Encoder & Gray Code, 1.5 Binary Fractions & Precision |
| **2** | **รหัสดิจิทัลและการตรวจจับ Error** | 2.1 ASCII & Bit-5 Case Shifter, 2.2 BCD Adder & +6 Correction, 2.3 Excess-3 & 9's Complement, 2.4 Parity Bus & Single-Bit Error, 2.5 Hamming(7,4) SEC & Syndrome Decoder |
| **3** | **พีชคณิตบูลีนและการลดรูปวงจร** | 3.1 Basic Gates (AND/OR/NOT) Logic Board, 3.2 Universal NAND/NOR Builder, 3.3 De Morgan Waveform Comparator, 3.4 3D Karnaugh Map 4-Var Cube, 3.5 Quine-McCluskey Prime Implicant Lab |
| **4** | **วงจรตรรกะแบบคอมบิเนชันมาตรฐาน** | 4.1 Multiplexer 8:1 Data Routing, 4.2 Demultiplexer & Decoder 3-to-8, 4.3 Priority Encoder 8-to-3 with Valid Bit, 4.4 Magnitude Comparator 4-Bit (A>B, A=B, A<B), 4.5 Parity Generator/Checker 8-Bit |
| **5** | **วงจรคำนวณและ ALU** | 5.1 Half/Full Adder Interactive Rig, 5.2 4-Bit Ripple Carry vs Lookahead, 5.3 2's Complement Adder/Subtractor, 5.4 4-Bit Binary Multiplier Array, 5.5 74LS181 4-Bit Multi-Function ALU |
| **6** | **ฟลิปฟล็อปและวงจรซีเควนเชียล** | 6.1 SR Latch & Race Condition Visualizer, 6.2 D Flip-Flop & Transparent Latch, 6.3 JK Master-Slave Toggle Studio, 6.4 T Flip-Flop Frequency Divider, 6.5 Setup/Hold Timing Metastability Lab |
| **7** | **รีจิสเตอร์และการเลื่อนข้อมูลและตัวนับ** | 7.1 SISO/SIPO/PISO/PIPO 4-Bit Shift Register, 7.2 Universal Shift Register 74HC194, 7.3 Asynchronous Ripple Counter (MOD-16), 7.4 Synchronous Decade Counter 74HC190, 7.5 Ring & Johnson Counter 3D Waveform |
| **8** | **เครื่องสถานะจำกัด (FSM)** | 8.1 Mealy vs Moore State Graph 3D, 8.2 Traffic Light Controller FSM, 8.3 Digital Sequence Detector (1011), 8.4 Vending Machine Coin FSM, 8.5 State Transition Matrix & ASM Chart |
| **9** | **หน่วยความจำและอุปกรณ์โปรแกรมได้** | 9.1 SRAM 6T Cell Read/Write Core, 9.2 DRAM 1T1C Refresh Timing Studio, 9.3 EEPROM/Flash Floating Gate Charge, 9.4 PAL/PLA Diode Matrix Fuse Lab, 9.5 FPGA LUT & CLB Routing Visualizer |
| **10**| **วงจรแปลงสัญญาณ DAC/ADC** | 10.1 R-2R Ladder vs Binary Weighted DAC, 10.2 Flash ADC Simultaneous Comparator, 10.3 SAR (Successive Approx) ADC Steps, 10.4 Dual-Slope Integrating Voltmeter, 10.5 Aliasing & Nyquist Sampling Studio |
| **11**| **โพรโทคอลสื่อสารดิจิทัล** | 11.1 UART Frame & Baud Rate Clock, 11.2 I2C Master-Slave ACK/NACK Bus, 11.3 SPI 4-Wire Full-Duplex Transfer, 11.4 CAN Bus Differential Dominant/Recessive, 11.5 USB Packet NRZI Bit Stuffing |
| **12**| **ตระกูลลอจิกและคุณสมบัติทางไฟฟ้า** | 12.1 CMOS Inverter Voltage Transfer (VTC), 12.2 TTL Totem-Pole Current Spikes, 12.3 Noise Margin & Fan-Out Loading, 12.4 Propagation Delay & Power-Delay Product, 12.5 Open-Drain & Tri-State Bus Contention |
| **13**| **ภาษาฮาร์ดแวร์ VHDL & Verilog** | 13.1 Verilog Gate-Level Netlist, 13.2 VHDL Entity & Architecture RTL, 13.3 Non-Blocking (<=) vs Blocking (=), 13.4 Testbench Waveform Stimulus Generator, 13.5 RTL Logic Synthesis Schematic Viewer |
| **14**| **โครงงานระบบดิจิทัลและการบูรณาการ** | 14.1 8-Bit SAP-1 Breadboard CPU, 14.2 VGA Display Signal Generator 640x480, 14.3 Digital Stop-Watch & Lap Timer, 14.4 Digital Audio Synth & PWM DAC, 14.5 Digital Electronics Capstone Innovation Hub |

---

## 50 Hyper-Realistic AR Curricula Matrix — Computing Science (CS2026 / Course 259)

| บทที่ | หัวข้อหลัก | ชุดปฏิบัติการเสมือนจริง 5 ห้องทดลอง AR MediaPipe (Computing Science) |
| :---: | :--- | :--- |
| **1** | **ตรรกะและกระบวนการคิดเชิงคำนวณ** | 1.0 River Crossing State Transition, 1.1 Decomposition Tree Builder, 1.2 Waveform & Pattern Recognition, 1.3 3D Point-Mass Abstraction, 1.4 Robot Grid Navigator 5x5 |
| **2** | **การออกแบบขั้นตอนวิธีและผังงาน** | 2.0 Visual Flowchart Simulator, 2.1 Pseudocode Linter Engine, 2.2 Flowchart Block Builder, 2.3 Decision Branching Lab, 2.4 Trace Table Step Runner |
| **3** | **พื้นฐานการเขียนโปรแกรมและการจัดการข้อมูล** | 3.0 In-Browser Python Sandbox, 3.1 Variable Memory Visualizer, 3.2 Datatype Typecasting Lab, 3.3 PEMDAS Order Evaluator, 3.4 Kinetic Energy Calculator |
| **4** | **โครงสร้างควบคุม เงื่อนไข และการทำซ้ำ** | 4.0 Automated Decision System, 4.1 Branching If-Else Sandbox, 4.2 Greenhouse Climate Controller, 4.3 For-Loop Range Visualizer, 4.4 Sensor Polling While-Loop |
| **5** | **โครงสร้างข้อมูลและอัลกอริทึมการค้นหา** | 5.0 Data Storage Architecture, 5.1 Dynamic List Visualizer, 5.2 Hash Table Dictionary Sandbox, 5.3 Linear Search Visualizer, 5.4 Binary vs Linear Speed Race |
| **6** | **อัลกอริทึมการจัดเรียงและการวิเคราะห์ Big-O** | 6.0 Data Center Sorting Energy, 6.1 Big-O Curve Comparator, 6.2 Bubble & Selection Sorting 3D, 6.3 Card Insertion Playground, 6.4 Divide & Conquer Merge Tree |
| **7** | **การเขียนโปรแกรมเชิงโมดูลและฟังก์ชันเรียกซ้ำ** | 7.0 Clean Code & SRP Visualizer, 7.1 LEGB Scope Simulator, 7.2 Vector Math Module Runner, 7.3 Live CSV/JSON Parser, 7.4 3D Tower of Hanoi Recursion |
| **8** | **วิทยาศาสตร์เชิงคำนวณและแบบจำลองฟิสิกส์** | 8.0 Multi-Scale Universe Sim, 8.1 NumPy Vector Speed Sandbox, 8.2 Matplotlib 2D Plotter, 8.3 3D Projectile Cannon, 8.4 3D Spring Oscillator & Oscilloscope |
| **9** | **ปัญญาประดิษฐ์ คอมพิวเตอร์วิทัศน์ และ IoT** | 9.0 Smart Agro-Factory Map, 9.1 ML Classifier Sandbox, 9.2 Real-Time Color Tracker, 9.3 3D Cyber Skeleton Tracker, 9.4 Cloud IoT Telemetry Dashboard |
| **10**| **การพัฒนาโครงงานและการประมวลความรู้** | 10.0 Innovation Showcase Gallery, 10.1 Project Roadmap & Kanban, 10.2 Code Security & Quality Scanner, 10.3 Thesis Formatter APA 7th, 10.4 16:9 Poster Pitch & MOOC Exam |

---

## ⚛️ 40 Hyper-Realistic AR Curricula Matrix — Nanotechnological Physics (Course 263)

| บทที่ | หัวข้อหลัก | ชุดปฏิบัติการเสมือนจริง 5 ห้องทดลอง AR MediaPipe (Nanophysics) |
| :---: | :--- | :--- |
| **1** | **พื้นฐานฟิสิกส์นาโนสเกล** | 1.1 Nanoscale Scaling Ladder 10⁻¹⁰ to 10⁻³ m, 1.2 Surface-to-Volume 3D Cube Exploder, 1.3 Brownian Colloidal DLVO Potential, 1.4 SEM/TEM Caliper Size Metrology, 1.5 Cleanroom BET & Brus Hub |
| **2** | **การกักขังเชิงควอนตัม** | 2.1 Brus 3D Particle-in-a-Sphere, 2.2 Quantum Dots Photoluminescence & QLED, 2.3 Gold/Silver LSPR Dipole Resonator, 2.4 Quantized Conductance (2e²/h) & Superparamagnetism, 2.5 Master Quantum Optics Studio |
| **3** | **การสังเคราะห์วัสดุนาโน** | 3.1 Top-Down Milling vs Bottom-Up Nucleation, 3.2 Sol-Gel Hydrolysis & Network Gelation, 3.3 CVD Reactor & Graphene Growth Kinetics, 3.4 Extreme UV & E-Beam Nanolithography, 3.5 Master Synthesis & LaMer Studio |
| **4** | **เทคนิคการวิเคราะห์และมาตรวิทยา** | 4.1 HR-TEM Relativistic Electron Optics, 4.2 AFM Tapping Mode & STM Tunneling, 4.3 XRD Goniometer & Scherrer Solver, 4.4 DLS Size & Zeta Potential Mobility, 4.5 Master Nanometrology & EELS Studio |
| **5** | **วัสดุคาร์บอนและโครงสร้างมิติต่ำ** | 5.1 Graphene Dirac Cone & Ballistic Transport, 5.2 Carbon Nanotube Chirality (n,m) Roller, 5.3 Quantum Wire 1D Subbands & Density of States, 5.4 GMR Spin Valve & Spintronics MRAM, 5.5 Nano-FET Field Effect Transistor Studio |
| **6** | **การประยุกต์ใช้นาโนเทคโนโลยี** | 6.1 Perovskite & Quantum Dot Solar Cells (PCE), 6.2 Nano-Supercapacitor Energy & Power Density, 6.3 Nanomedicine Core-Shell Drug Delivery (EPR Effect), 6.4 Nanofiltration & Heavy Metal Adsorption, 6.5 Nanomaterial Chemical & Gas Sensor Array |
| **7** | **ความปลอดภัยและนาโนพิษวิทยา** | 7.1 ISO 14644 Cleanroom Airflow Dynamics, 7.2 MTT Cell Viability Cytotoxicity Assay, 7.3 Nano-Toxicology Safe Exposure Limit (OEL/NOAEL), 7.4 Eco-Toxicology Aquatic Risk Quotient, 7.5 FMEA Risk Priority Matrix for Nanomaterials |
| **8** | **เทคโนโลยีนาโนขั้นสูงสู่อนาคต** | 8.1 Density Functional Theory (DFT) Quantum Simulator, 8.2 Molecular Electronics & Qubit Coherence, 8.3 High-Throughput Roll-to-Roll Nano-Manufacturing, 8.4 AI-Driven Inverse Design & Property Prediction, 8.5 Masterclass Capstone Innovation Showcase Hub |

---

## 🖐️ Touchless AI Gesture Interaction Standards
1. **Pinch Gesture (🤏):** Index Tip (Landmark 8) to Thumb Tip (Landmark 4) distance $< 0.08$ triggers Pick & Place with 880 Hz Audio Chime.
2. **Pointing (☝️):** Landmark 8 vector projects raycast to hover and highlight 3D nodes with cyan outline.
3. **Spatial Orbit (✊):** Closed fist drag rotates the entire 3D scene around the center of mass.
4. **Holographic Menu (🖐️):** Open palm facing camera opens the glassmorphism HUD options.

---

## Loop Engineering & Memory Rules
- **NEVER** use `new THREE.Vector3()` or `new Object()` inside `onResults()`, `requestAnimationFrame()`, or `tick()`.
- Allocate global math variables at script root (`const _vec = new THREE.Vector3()`).
- Always check `isPinching` with Euclidean threshold (`< 0.08`).
- Keep camera canvas dimensions locked to $240 \times 180$ to preserve GPU memory for Three.js rendering.
- Synthesize all sound effects via Web Audio API oscillators (no external mp3/wav assets).

---

## 📐 3D Spatial Layout & Text Overlap Zero-Collision Standard
1. **2D Overlay Stack:**
   - Always enclose `.header-card` and `.gesture-guide` sequentially inside a `.left-panel-stack` container (`display: flex; flex-direction: column; gap: 10px; pointer-events: auto;`).
   - Never use absolute vertical positioning for instructions beneath headers.
2. **3D Hologram Screen Spacing (`<a-plane>` & `<a-text>`):**
   - Screen plane size minimum `width="3.8" height="1.4" position="0 1.15 -0.3"`.
   - Every `<a-text>` line must have an explicit `wrap-count="45"` or `wrap-count="50"` to prevent unexpected multi-line wrapping in A-Frame.
   - Text lines must be vertically separated by at least $\Delta Y = 0.22$ to $0.24$ (e.g. $Y = +0.52, +0.28, +0.04, -0.20, -0.44$).
   - Text strings must be concise and self-contained on a single line.
3. **3D Interactive Elements Depth Separation:**
   - Base DIP switches / data selectors should be placed at $Z = 0.05$ to $0.20$.
   - Secondary action buttons (Invert, Noise, Corrupt) must be placed in front at $Z = 0.50$ to $0.55$, elevated slightly ($Y = 0.16$), preventing visual overlap or occlusion with switch labels.


