/**
 * app.js
 * Application Bootstrap, Camera Control, Physics Integration & Animation Loop
 * Fully integrated with PhysicsLabRegistry (7-Domain Extensible Architecture)
 * RBRU Next Gen Lab 2026
 */

// =========================================================================
// 1. Register Core Experiments 1 & 2 into PhysicsLabRegistry
// =========================================================================
if (window.PhysicsLabRegistry) {
  // Experiment 1: Hexagonal Resistor Circuit
  PhysicsLabRegistry.registerExperiment({
    id: 'elec_hex_loop',
    numericId: 1,
    domainId: 'electricity',
    title: 'วงจรโครงข่ายตัวต้านทาน 6 เหลี่ยม (Hexagonal Resistor Network)',
    shortTitle: '⚡ วงจร 6 เหลี่ยม',
    icon: '⚡',
    status: 'active',
    group: exp1Group,
    leftPanelId: 'left-exp1',
    rightPanelId: 'right-exp1',
    draggableInstruments: (typeof draggableInstruments !== 'undefined') ? draggableInstruments : [],
    keyFormula: '$$R_{af} = \\mathbf{\\frac{20}{21}\\,\\Omega}, \\quad I = \\mathbf{\\frac{21}{23}\\text{ A}}, \\quad V_{af} = \\mathbf{\\frac{20}{23}\\text{ V}}$$',
    description: 'ศึกษาการลดรูปวงจรตัวต้านทาน 6 เหลี่ยมคู่ขนานและอนุกรม การเลือกคู่จุดต่อ a–f ด้วย Euclid GCD และเข็มมิเตอร์สปริงหน่วง',
    features: ['3D Resistor Network', 'Euclidean GCD Algorithm', 'SVG 4-Step Reduction', 'Moving Coil Meter'],
    camera: { position: [0.3, 8.0, 10.4], target: [0.35, 0.65, 0.25] },
    topCamera: { position: [0.3, 12.8, 0.5], target: [0.3, 0, 0] },
    activate: function() {
      currentExperiment = 1;
      const tab1 = document.getElementById('tab-exp1');
      const tab2 = document.getElementById('tab-exp2');
      if (tab1) tab1.classList.add('active');
      if (tab2) tab2.classList.remove('active');
    }
  });

  // Experiment 2: Simple Harmonic Pendulum
  PhysicsLabRegistry.registerExperiment({
    id: 'mech_pendulum',
    numericId: 2,
    domainId: 'mechanics',
    title: 'ลูกตุ้มเพนดูลัมอย่างง่ายและการวัดค่า g (Simple Harmonic Pendulum)',
    shortTitle: '⏱️ ลูกตุ้มเพนดูลัม',
    icon: '⏱️',
    status: 'active',
    group: exp2Group,
    leftPanelId: 'left-exp2',
    rightPanelId: 'right-exp2',
    keyFormula: '$$T = 2\\pi\\sqrt{\\frac{L}{g}} \\implies T^2 = \\left(\\frac{4\\pi^2}{g}\\right)L$$',
    description: 'ศึกษาการแกว่งแบบฮาร์มอนิกอย่างง่าย การวัดคาบการแกว่ง 20 รอบด้วยนาฬิกาดิจิทัล และการวิเคราะห์ความชันกราฟ T² กับ L เพื่อหาค่า g',
    features: ['Retort Stand & Chrome Rod', 'Graduated Scale Ruler', '20-Cycle Stopwatch', 'Linear Regression Plotter'],
    camera: { position: [-0.2, 4.6, 9.2], target: [-0.4, 3.6, 0.2] },
    topCamera: { position: [-0.3, 11.5, 2.0], target: [-0.3, 3.5, 0] },
    activate: function() {
      currentExperiment = 2;
      const tab1 = document.getElementById('tab-exp1');
      const tab2 = document.getElementById('tab-exp2');
      if (tab1) tab1.classList.remove('active');
      if (tab2) tab2.classList.add('active');
    }
  });
}

// =========================================================================
// 2. Experiment & Camera Switching Delegator
// =========================================================================
function switchExperiment(expArg) {
  let targetId = expArg;
  if (typeof expArg === 'number') {
    targetId = (expArg === 1) ? 'elec_hex_loop' : 'mech_pendulum';
  }

  if (window.PhysicsLabRegistry) {
    PhysicsLabRegistry.switchExperiment(targetId);
    const active = PhysicsLabRegistry.getActiveExperiment();
    if (active) {
      currentExperiment = active.numericId || 1;
    }
  } else {
    // Fallback if registry not ready
    currentExperiment = (expArg === 1 || expArg === 'elec_hex_loop') ? 1 : 2;
    document.getElementById('left-exp1').classList.toggle('hidden', currentExperiment !== 1);
    document.getElementById('right-exp1').classList.toggle('hidden', currentExperiment !== 1);
    document.getElementById('left-exp2').classList.toggle('hidden', currentExperiment !== 2);
    document.getElementById('right-exp2').classList.toggle('hidden', currentExperiment !== 2);
    exp1Group.visible = (currentExperiment === 1);
    exp2Group.visible = (currentExperiment === 2);
    resetCameraView();
  }
}

function resetCameraView() {
  const active = window.PhysicsLabRegistry ? PhysicsLabRegistry.getActiveExperiment() : null;
  if (active && window.PhysicsLabRegistry) {
    PhysicsLabRegistry.applyCameraView(active);
  } else {
    if (currentExperiment === 1) {
      camera.position.set(0.3, 8.0, 10.4);
      controls.target.set(0.35, 0.65, 0.25);
    } else {
      camera.position.set(-0.2, 4.6, 9.2);
      controls.target.set(-0.4, 3.6, 0.2);
    }
    controls.update();
  }
}

function topCameraView() {
  const active = window.PhysicsLabRegistry ? PhysicsLabRegistry.getActiveExperiment() : null;
  if (active && window.PhysicsLabRegistry) {
    PhysicsLabRegistry.applyTopCameraView(active);
  } else {
    if (currentExperiment === 1) {
      camera.position.set(0.3, 12.8, 0.5);
      controls.target.set(0.3, 0, 0);
    } else {
      camera.position.set(-0.3, 11.5, 2.0);
      controls.target.set(-0.3, 3.5, 0);
    }
    controls.update();
  }
}

function toggleSolutionModal(open) {
  const modal = document.getElementById('solution-modal');
  if (modal) {
    modal.classList.toggle('open', open);
    if (open && typeof renderAcademicMath === 'function') {
      setTimeout(() => renderAcademicMath(modal), 40);
    }
  }
}

// =========================================================================
// 3. Simulated Hand Engine (Fallback when Webcam is unavailable)
// =========================================================================
function runSimulatedHandStep(dt) {
  simTime += dt;
  arOverlayCtx.fillStyle = '#020617';
  arOverlayCtx.fillRect(0, 0, arOverlayCanvas.width, arOverlayCanvas.height);

  const cx = 0.5 + 0.22 * Math.cos(simTime * 1.1);
  const cy = 0.5 + 0.18 * Math.sin(simTime * 1.6);
  const pinchPhase = Math.sin(simTime * 2.2) > 0.72;

  const fakeLandmarks = [];
  for (let i = 0; i < 21; i++) {
    fakeLandmarks.push({ x: cx + (i % 5) * 0.018, y: cy + Math.floor(i / 5) * 0.03, z: 0 });
  }
  fakeLandmarks[8] = { x: cx, y: cy, z: 0 };
  fakeLandmarks[4] = { x: cx + (pinchPhase ? 0.02 : 0.09), y: cy + (pinchPhase ? 0.02 : 0.06), z: 0 };
  fakeLandmarks[0] = { x: cx, y: cy + 0.35, z: 0 };
  fakeLandmarks[12] = { x: cx - 0.03, y: cy + 0.02, z: 0 };
  fakeLandmarks[16] = { x: cx - 0.06, y: cy + 0.05, z: 0 };
  fakeLandmarks[20] = { x: cx - 0.09, y: cy + 0.08, z: 0 };

  arOverlayCtx.strokeStyle = pinchPhase ? '#10b981' : '#06b6d4';
  arOverlayCtx.lineWidth = 3;
  arOverlayCtx.beginPath();
  arOverlayCtx.arc((1 - cx) * arOverlayCanvas.width, cy * arOverlayCanvas.height, pinchPhase ? 12 : 22, 0, Math.PI * 2);
  arOverlayCtx.stroke();

  interpretHandLandmarks(fakeLandmarks);
}

// =========================================================================
// 4. Main Animation Loop & Real-Time Physics Integration
// =========================================================================
let lastTime = performance.now();

function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.08);
  lastTime = now;

  controls.update();

  if (arEnabled && simulatedHandActive) {
    runSimulatedHandStep(dt);
  }

  const activeExp = window.PhysicsLabRegistry ? PhysicsLabRegistry.getActiveExperiment() : null;
  const activeExpId = activeExp ? activeExp.id : (currentExperiment === 1 ? 'elec_hex_loop' : 'mech_pendulum');

  // Physics updates per experiment
  if (activeExpId === 'elec_hex_loop') {
    // Spring-damped needle dynamics for realistic 3D & 2D moving-coil analog meter response
    const stiffness = 115;
    const damping = 13.5;

    const accA = stiffness * (targetAmmeterVal - currentAmmeterNeedle) - damping * ammeterNeedleVel;
    ammeterNeedleVel += accA * dt;
    currentAmmeterNeedle += ammeterNeedleVel * dt;

    const accV = stiffness * (targetVoltmeterVal - currentVoltmeterNeedle) - damping * voltmeterNeedleVel;
    voltmeterNeedleVel += accV * dt;
    currentVoltmeterNeedle += voltmeterNeedleVel * dt;

    if (currentPhysState) {
      renderMeterGraphics(
        voltmeter3D,
        'ui-volt-analog',
        currentVoltmeterNeedle,
        `${currentPhysState.vVal.toFixed(3)} V`,
        `${currentPhysState.vFrac} V`
      );
      renderMeterGraphics(
        ammeter3D,
        'ui-amp-analog',
        currentAmmeterNeedle,
        `${currentPhysState.iVal.toFixed(3)} A`,
        `${currentPhysState.iFrac} A`
      );
    }

    edgeParticles.forEach((ep) => {
      if (ep.mesh.visible && ep.speed !== 0) {
        ep.t = (ep.t + ep.speed * dt + 10) % 1;
        const edge = edgeResistors[ep.edgeIdx];
        const p1 = nodePositions[edge.n1];
        const p2 = nodePositions[edge.n2];
        ep.mesh.position.lerpVectors(p1, p2, ep.t);
      }
    });
  } else if (activeExpId === 'mech_pendulum') {
    // Experiment 2: Harmonic Simple Pendulum Oscillation Physics
    const st = getCurrentPendulumStats(pendLengthCm);
    const omega = (2 * Math.PI) / st.T;
    const speedMult = stopwatchRunning ? 5.0 : 1.0;

    if (handHoldingPendulum) {
      pendulumPivot.rotation.z = THREE.MathUtils.degToRad(pendReleaseAngleDeg);
    } else {
      pendTime += dt * speedMult;
      const theta0 = THREE.MathUtils.degToRad(pendReleaseAngleDeg);
      const theta = theta0 * Math.cos(omega * pendTime);
      pendulumPivot.rotation.z = theta;
    }

    if (stopwatchRunning && !handHoldingPendulum) {
      stopwatchElapsed += dt * speedMult;
      const swings = Math.floor(stopwatchElapsed / st.T);
      if (swings >= 20) {
        instantMeasure20();
      } else {
        const timerVal = document.getElementById('ui-timer-val');
        const swingCount = document.getElementById('ui-swing-count');
        if (timerVal) timerVal.textContent = `${stopwatchElapsed.toFixed(2)} s`;
        if (swingCount) swingCount.textContent = `จำนวนรอบ: ${swings} / 20`;
      }
    }
  }

  // Call generic modular experiment update if available
  if (activeExp && typeof activeExp.update === 'function') {
    try {
      activeExp.update(dt, now);
    } catch (e) {
      console.warn(`Error in ${activeExp.id} update:`, e);
    }
  }

  // Project 3D Positions to 2D Screen Space for Floating Labels
  if (typeof labelItems !== 'undefined') {
    labelItems.forEach((item) => {
      const isVisible = (item.expId === activeExpId || (activeExp && item.expId === activeExp.numericId));
      if (!isVisible) {
        item.el.style.display = 'none';
        return;
      }
      const v = item.pos3D.clone().project(camera);
      if (v.z > 1) {
        item.el.style.display = 'none';
      } else {
        item.el.style.display = 'block';
        const x = (v.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
        item.el.style.left = `${x}px`;
        item.el.style.top = `${y}px`;
      }
    });
  }

  renderer.render(scene, camera);
}

// Window Responsive Resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// =========================================================================
// 5. Initial Bootstrap
// =========================================================================
refreshExp1UI();
recordAllAdjacentPairs();
updatePendulumLength(50);
fillAllPendulumData();

// Initialize in registry
if (window.PhysicsLabRegistry) {
  PhysicsLabRegistry.initAllExperiments(scene);
  PhysicsLabRegistry.switchExperiment('elec_hex_loop');
} else {
  resetCameraView();
}

// Initialize Main Portal & Agentic AI Bot
if (typeof initPortal === 'function') {
  initPortal();
}
if (window.AIBot && typeof window.AIBot.init === 'function') {
  window.AIBot.init();
}

requestAnimationFrame(animate);

// Export switchExperiment globally
window.switchExperiment = switchExperiment;
window.resetCameraView = resetCameraView;
window.topCameraView = topCameraView;
window.toggleSolutionModal = toggleSolutionModal;
