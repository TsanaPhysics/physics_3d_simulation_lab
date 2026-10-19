---
name: interactive-3d-lab-builder
description: >-
  Upgrades 2D HTML Canvas physics experiments into hyper-realistic 3D Virtual Labs using Three.js and A-Frame PBR shaders. Integrates Web Audio live acoustic synthesizers, MediaPipe AR hand tracking, dynamic draggable equipment on table planes, step-by-step vector circuit reduction, spring-damped needle dynamics, and live multi-channel oscilloscopes.
---

# Interactive 3D Lab Builder (Hyper-Realistic & NextGen Virtual Physics Lab Edition)

## Overview
This skill guides the agent through upgrading standard 2D physics simulations into fully immersive, hyper-realistic 3D Virtual Labs. It uses Three.js / A-Frame with Physical Based Rendering (PBR) shaders, realistic lighting, soft contact shadows, interactive instrumentation, touchless AR hand tracking, and step-by-step vector circuit reduction while maintaining strict academic physics fidelity and zero-GC performance.

---

## Core Pillars of Hyper-Realistic 3D Labs

1. **PBR Materials & Dynamic Lighting**:
   - Use `MeshStandardMaterial` / `MeshPhysicalMaterial` with realistic `metalness`, `roughness`, and `clearcoat` properties (e.g., brushed steel, optical glass, polished brass, ceramic resistors).
   - Directional key light with `castShadow = true` (PCFSoftShadowMap), subtle ambient fill light, and LED emissive segment displays.
2. **Dynamic Draggable 3D Equipment Engine (Table Plane $y = 0$)**:
   - Enable independent dragging of laboratory equipment (Voltmeters, Ammeters, DC Power Supplies, Knife Switches, Standard Resistors) across the table surface.
   - Automatically disable camera `OrbitControls` during dragging to prevent perspective jitter.
   - Dynamically recompute flexible silicone leads (`THREE.CatmullRomCurve3`) in real time with catenary gravity droop.
   - Provide instant bench reset functionality (`resetInstrumentPositions()`).
3. **Step-by-Step Vector Circuit Reduction (SVG Engine)**:
   - Dynamic unfolding of closed circuit loops (e.g., Hexagonal Resistor Network) into parallel branch lines.
   - Step 1: Unfolded parallel branches with live EIA 4-band color resistor coding.
   - Step 2: Series sum of resistors on each branch ($r_1 \parallel r_2$).
   - Step 3: Parallel reduction to single equivalent resistance ($R_{\text{ชุด}}$) with Euclidean GCD exact fractions.
   - Step 4: Complete circuit equation with internal resistance ($10\,\Omega$), power supply voltage ($V_s$), and total current ($I$).
4. **Touchless AR MediaPipe Hand Tracking**:
   - 21-joint 3D cyber skeleton tracking.
   - Real-time pinch gesture detection ($d_{\text{pinch}} < 0.045$) for touchless grabbing and moving of 3D instruments.
   - Fist gesture for 3D camera orbiting.
   - Peace / V-sign gesture for toggling knife switches or starting stopwatches.
   - Built-in automated Simulated Hand fallback when webcam is unavailable.
5. **Spring-Damped Needle Dynamics (Second-Order Harmonic Oscillator)**:
   - Semi-Implicit Euler integration for moving-coil galvanometers:
     $\theta_{t+\Delta t} = \theta_t + \omega_t \Delta t$, $\omega_{t+\Delta t} = \omega_t + (k_s(\theta_{\text{target}} - \theta) - c_d \omega)\Delta t$
   - Anti-parallax curved mirror strips under pointer needles.
   - Dual meter support: Real-time toggle between analog needle gauges and digital 7-segment / exact fractional readouts.
6. **Resizable & Collapsible Glassmorphism Sidebars**:
   - Draggable vertical resize handles (`onpointerdown`, `setPointerCapture`).
   - Quick zoom buttons (➖ ย่อ / ➕ ขยาย) and collapsible tabs.
   - Dark Navy Glassmorphism (`backdrop-filter: blur(14px)`, `background: rgba(15, 23, 42, 0.78)`) allowing background 3D observation.
7. **Web Audio Real-time Synthesizer & Multi-Channel Oscilloscopes**:
   - Synthesize acoustic feedback for knife switch clicks, ratchet clicks, collision impacts, and resonance tones.
   - Render real-time waveforms ($V-t$, $s-t$, $T^2-L$ linear regression) on floating HTML5 Canvas elements.

---

## Cross-Reference Skills
- For specialized circuit olympiad problems and detailed mathematical derivations, refer to `nextgen-physics-virtual-lab-architect`.
- For standalone A-Frame VR & Cloud CDN deployments, refer to `ar-simulation-builder`.
