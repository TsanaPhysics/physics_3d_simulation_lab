/**
 * exp1-circuit.js
 * Experiment 1: Hexagonal Circuit Trainer Board, Bench Instruments, Wires & Particle Current
 * With Dynamic Draggable Equipment Support (Voltmeter, Ammeter, Power Supply, Switch, 10Ω Resistor)
 * RBRU Next Gen Lab 2026
 */

const exp1Group = new THREE.Group();
scene.add(exp1Group);

// --- 1.1 Manufactured Hexagonal Circuit Trainer Board ---
const hexCenter = new THREE.Vector3(-2.35, 0.24, 0.35);
const hexRadius = 2.45;

function createHexBoardTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle PCB grid & border ring
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(512, 512, 450, 0, Math.PI * 2);
  ctx.stroke();

  // Center silkscreen badge
  ctx.fillStyle = 'rgba(148, 163, 184, 0.55)';
  ctx.font = 'bold 28px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RBRU PHYSICS LAB', 512, 495);
  ctx.font = '22px JetBrains Mono, monospace';
  ctx.fillText('HEXAGONAL RESISTOR NETWORK (1Ω - 6Ω)', 512, 535);
  return new THREE.CanvasTexture(c);
}

const hexSubBase = new THREE.Mesh(
  new THREE.CylinderGeometry(3.6, 3.72, 0.16, 6),
  new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.45, metalness: 0.35 })
);
hexSubBase.rotation.y = Math.PI / 6;
hexSubBase.position.set(hexCenter.x, 0.08, hexCenter.z);
hexSubBase.receiveShadow = true;
exp1Group.add(hexSubBase);

const hexBoard = new THREE.Mesh(
  new THREE.CylinderGeometry(3.42, 3.46, 0.15, 6),
  new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.22,
    metalness: 0.3
  })
);
hexBoard.rotation.y = Math.PI / 6;
hexBoard.position.set(hexCenter.x, 0.20, hexCenter.z);
hexBoard.receiveShadow = true;
hexBoard.castShadow = true;
exp1Group.add(hexBoard);

const hexTopSilk = new THREE.Mesh(
  new THREE.CircleGeometry(2.85, 32),
  new THREE.MeshBasicMaterial({ map: createHexBoardTexture() })
);
hexTopSilk.rotation.x = -Math.PI / 2;
hexTopSilk.position.set(hexCenter.x, 0.28, hexCenter.z);
exp1Group.add(hexTopSilk);

// Copper PCB trace ring connecting the 6 posts
const traceRing = new THREE.Mesh(
  new THREE.RingGeometry(hexRadius - 0.05, hexRadius + 0.05, 6),
  new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.25, side: THREE.DoubleSide })
);
traceRing.rotation.x = -Math.PI / 2;
traceRing.position.set(hexCenter.x, 0.282, hexCenter.z);
exp1Group.add(traceRing);

const nodePositions = {};
const nodeMeshes = {};
const nodeAngles = [
  -2 * Math.PI / 3, // a: top-left
  -Math.PI / 3,     // b: top-right
  0,                // c: right
  Math.PI / 3,      // d: bottom-right
  2 * Math.PI / 3,  // e: bottom-left
  Math.PI           // f: left
];

nodesOrder.forEach((nodeName, i) => {
  const ang = nodeAngles[i];
  const pos = new THREE.Vector3(
    hexCenter.x + hexRadius * Math.cos(ang),
    hexCenter.y + 0.35,
    hexCenter.z + hexRadius * Math.sin(ang)
  );
  nodePositions[nodeName] = pos;

  const postGroup = new THREE.Group();
  postGroup.position.set(pos.x, hexCenter.y, pos.z);

  // Bakelite insulating collar
  const washer = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.28, 0.12, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
  );
  washer.position.y = 0.06;
  postGroup.add(washer);

  // Machined brass hex nut
  const hexNut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.20, 0.20, 0.12, 6),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.22 })
  );
  hexNut.position.y = 0.16;
  postGroup.add(hexNut);

  // Central brass binding post shaft
  const pinMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.54, 24),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.14 })
  );
  pinMesh.position.y = 0.35;
  pinMesh.userData = { nodeName };
  postGroup.add(pinMesh);

  // Knurled brass screw cap on top
  const topCap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.17, 0.15, 0.13, 24),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.2 })
  );
  topCap.position.y = 0.58;
  topCap.userData = { nodeName };
  postGroup.add(topCap);

  nodeMeshes[nodeName] = pinMesh;
  exp1Group.add(postGroup);
});

// Build 6 Precision Axial Resistors on Hexagon Edges
const resistorMidpoints = [];
const resistor3DGroups = [];

edgeResistors.forEach((edge, idx) => {
  const p1 = nodePositions[edge.n1];
  const p2 = nodePositions[edge.n2];
  const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
  resistorMidpoints.push({ mid, label: `${edge.R} Ω`, edgeIdx: idx });

  const resMeshGroup = createPrecisionResistor3D(p1, p2, edge.colors, 0xe7d3b0, 0.19);
  resMeshGroup.userData.edgeIndex = idx;
  resistor3DGroups.push(resMeshGroup);
  exp1Group.add(resMeshGroup);
});

function updateResistor3DVisuals(edgeIdx) {
  const edge = edgeResistors[edgeIdx];
  if (!edge) return;

  // 1. Update 3D label floating above resistor
  if (window.resistorLabelItems && window.resistorLabelItems[edgeIdx]) {
    window.resistorLabelItems[edgeIdx].el.textContent = `${edge.R} Ω`;
  }

  // 2. Update color bands on 3D resistor mesh
  const grp = resistor3DGroups[edgeIdx];
  if (grp && grp.userData && grp.userData.bandMeshes) {
    grp.userData.bandMeshes.forEach((mesh, bIdx) => {
      if (edge.colors && edge.colors[bIdx]) {
        mesh.material.color.set(edge.colors[bIdx]);
      }
    });
  }
}
window.updateResistor3DVisuals = updateResistor3DVisuals;

// --- 1.2 ULTRA-REALISTIC BENCHTOP DC POWER SUPPLY (AT BACK: DEFAULT z = -2.45) ---
const psuGroup = new THREE.Group();
psuGroup.position.set(2.25, 0, -2.45);
psuGroup.userData = { isDraggable: true, instrumentName: 'แหล่งจ่ายไฟ DC (Power Supply)' };

// 4 Rubber feet
[
  [-1.15, -0.7], [1.15, -0.7],
  [-1.15, 0.7], [1.15, 0.7]
].forEach(([fx, fz]) => {
  const foot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, 0.12, 16),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
  );
  foot.position.set(fx, 0.06, fz);
  psuGroup.add(foot);
});

// Outer painted sheet-metal enclosure
const psuBody = new THREE.Mesh(
  new THREE.BoxGeometry(2.85, 1.72, 1.85),
  new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.38, metalness: 0.28 })
);
psuBody.position.y = 0.96;
psuBody.castShadow = true;
psuBody.receiveShadow = true;
psuGroup.add(psuBody);

// Top carrying handle
const handleBar = new THREE.Mesh(
  new THREE.BoxGeometry(1.1, 0.08, 0.18),
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
);
handleBar.position.set(0, 1.96, 0);
psuGroup.add(handleBar);
[-0.48, 0.48].forEach((hx) => {
  const leg = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.16, 12),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 })
  );
  leg.position.set(hx, 1.86, 0);
  psuGroup.add(leg);
});

// Dark recessed front instrument bezel
const psuFrontPanel = new THREE.Mesh(
  new THREE.BoxGeometry(2.68, 1.54, 0.08),
  new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.32, metalness: 0.2 })
);
psuFrontPanel.position.set(0, 0.96, 0.91);
psuGroup.add(psuFrontPanel);

// Dynamic Dual 7-Segment LED Display Canvas on Power Supply (Shows 10.00 V and real-time current I)
const psuLedCanvas = document.createElement('canvas');
psuLedCanvas.width = 512;
psuLedCanvas.height = 256;
const psuLedCtx = psuLedCanvas.getContext('2d');
const psuLedTex = new THREE.CanvasTexture(psuLedCanvas);

function updatePowerSupplyLED(voltVal, currentAmpVal) {
  const v = (typeof voltVal === 'number') ? voltVal : (typeof powerSupplyVoltage === 'number' ? powerSupplyVoltage : 10.0);
  const i = (typeof currentAmpVal === 'number') ? currentAmpVal : ((typeof currentPhysState !== 'undefined' && currentPhysState) ? currentPhysState.iVal : 0);

  psuLedCtx.fillStyle = '#020617';
  psuLedCtx.fillRect(0, 0, 512, 256);

  // Bezel border
  psuLedCtx.strokeStyle = '#334155';
  psuLedCtx.lineWidth = 8;
  psuLedCtx.strokeRect(4, 4, 504, 248);

  // Header brand bar
  psuLedCtx.fillStyle = '#94a3b8';
  psuLedCtx.font = 'bold 20px Prompt, sans-serif';
  psuLedCtx.textAlign = 'left';
  psuLedCtx.fillText('RBRU LAB DC POWER SUPPLY  HY-3005D', 22, 34);

  // Voltage LED Window
  psuLedCtx.fillStyle = '#090d16';
  psuLedCtx.fillRect(20, 48, 285, 88);
  psuLedCtx.strokeStyle = '#1e293b';
  psuLedCtx.lineWidth = 3;
  psuLedCtx.strokeRect(20, 48, 285, 88);

  psuLedCtx.fillStyle = '#ef4444';
  psuLedCtx.font = 'bold 58px JetBrains Mono, monospace';
  psuLedCtx.textAlign = 'right';
  psuLedCtx.fillText(v.toFixed(2), 248, 112);
  psuLedCtx.font = 'bold 28px sans-serif';
  psuLedCtx.fillText('V', 292, 110);

  // Current LED Window
  psuLedCtx.fillStyle = '#090d16';
  psuLedCtx.fillRect(20, 148, 285, 88);
  psuLedCtx.strokeRect(20, 148, 285, 88);

  psuLedCtx.fillStyle = '#10b981';
  psuLedCtx.font = 'bold 58px JetBrains Mono, monospace';
  psuLedCtx.fillText(i.toFixed(3), 248, 212);
  psuLedCtx.font = 'bold 28px sans-serif';
  psuLedCtx.fillText('A', 292, 210);

  // CV / CC Indicator LEDs & Labels
  psuLedCtx.textAlign = 'left';
  psuLedCtx.fillStyle = '#22c55e';
  psuLedCtx.beginPath();
  psuLedCtx.arc(335, 78, 9, 0, Math.PI * 2);
  psuLedCtx.fill();
  psuLedCtx.fillStyle = '#e2e8f0';
  psuLedCtx.font = 'bold 18px sans-serif';
  psuLedCtx.fillText(`C.V. (คงที่ ${v.toFixed(1)}V)`, 354, 84);

  psuLedCtx.fillStyle = switchClosed ? '#f59e0b' : '#334155';
  psuLedCtx.beginPath();
  psuLedCtx.arc(335, 116, 9, 0, Math.PI * 2);
  psuLedCtx.fill();
  psuLedCtx.fillStyle = '#e2e8f0';
  psuLedCtx.fillText(switchClosed ? 'OUTPUT ON' : 'STANDBY', 354, 122);

  psuLedTex.needsUpdate = true;
}

const psuScreenMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1.72, 0.92),
  new THREE.MeshBasicMaterial({ map: psuLedTex })
);
psuScreenMesh.position.set(-0.38, 1.18, 0.96);
psuGroup.add(psuScreenMesh);

// 4 Knurled Aluminum Adjustment Knobs
[
  [0.72, 1.42], [1.08, 1.42],
  [0.72, 1.02], [1.08, 1.02]
].forEach(([kx, ky]) => {
  const knobGroup = new THREE.Group();
  knobGroup.position.set(kx, ky, 0.96);

  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.08, 24),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  skirt.rotation.x = Math.PI / 2;
  knobGroup.add(skirt);

  const dial = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.18, 24),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.22 })
  );
  dial.rotation.x = Math.PI / 2;
  dial.position.z = 0.06;
  knobGroup.add(dial);

  const indicator = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.09, 0.02),
    new THREE.MeshBasicMaterial({ color: 0xef4444 })
  );
  indicator.position.set(0, 0.05, 0.16);
  knobGroup.add(indicator);

  psuGroup.add(knobGroup);
});

// Illuminated Red Power Rocker Switch
const psuPowerSwitch = new THREE.Mesh(
  new THREE.BoxGeometry(0.24, 0.32, 0.12),
  new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xef4444,
    emissiveIntensity: 0.45,
    roughness: 0.25
  })
);
psuPowerSwitch.position.set(-1.05, 0.44, 0.95);
psuGroup.add(psuPowerSwitch);

// 3 Color-Coded Output Binding Posts (+ Red, GND Green, - Black)
const psuPlusPosLocal = new THREE.Vector3(0.55, 0.44, 1.02);
const psuGndPosLocal  = new THREE.Vector3(0.82, 0.44, 1.02);
const psuMinusPosLocal = new THREE.Vector3(1.09, 0.44, 1.02);

[
  { pos: psuPlusPosLocal, col: 0xef4444 },
  { pos: psuGndPosLocal,  col: 0x10b981 },
  { pos: psuMinusPosLocal, col: 0x1e293b }
].forEach((term) => {
  const nut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.22, 16),
    new THREE.MeshStandardMaterial({ color: term.col, roughness: 0.3 })
  );
  nut.rotation.x = Math.PI / 2;
  nut.position.copy(term.pos);
  psuGroup.add(nut);

  const brassCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.28, 14),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.15 })
  );
  brassCore.rotation.x = Math.PI / 2;
  brassCore.position.copy(term.pos);
  psuGroup.add(brassCore);
});

// Plugs inserted directly into PSU binding posts
psuGroup.add(createBananaPlug3D(psuPlusPosLocal, 0xef4444, Math.PI / 2, 0));
psuGroup.add(createBananaPlug3D(psuMinusPosLocal, 0x1e293b, Math.PI / 2, 0));

exp1Group.add(psuGroup);

// Helper for PSU world coordinates
function getPsuPlusWorld() {
  return psuGroup.position.clone().add(psuPlusPosLocal).add(new THREE.Vector3(0, 0, 0.28));
}
function getPsuMinusWorld() {
  return psuGroup.position.clone().add(psuMinusPosLocal).add(new THREE.Vector3(0, 0, 0.28));
}

// --- 1.3 REALISTIC KNIFE SWITCH (AT BACK-LEFT: DEFAULT z = -1.85) ---
const switchGroup = new THREE.Group();
switchGroup.position.set(0.15, 0.12, -1.85);
switchGroup.userData = { isDraggable: true, instrumentName: 'สวิตช์ใบมีด (Knife Switch)' };

const swBase = new THREE.Mesh(
  new THREE.BoxGeometry(1.25, 0.22, 0.84),
  new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.15 })
);
swBase.castShadow = true;
switchGroup.add(swBase);

[-0.38, 0.38].forEach((sx) => {
  const jaw = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.26, 0.20),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.88, roughness: 0.2 })
  );
  jaw.position.set(sx, 0.21, 0);
  switchGroup.add(jaw);

  const screw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, 0.24, 16),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.15 })
  );
  screw.position.set(sx, 0.22, 0.22);
  switchGroup.add(screw);
});

const swLeverPivot = new THREE.Group();
swLeverPivot.position.set(-0.38, 0.26, 0);
const swBlade = new THREE.Mesh(
  new THREE.BoxGeometry(0.82, 0.08, 0.09),
  new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.92, roughness: 0.14 })
);
swBlade.position.x = 0.38;
swLeverPivot.add(swBlade);

const swHandle = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.065, 0.36, 18),
  new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.28 })
);
swHandle.rotation.z = Math.PI / 2;
swHandle.position.x = 0.92;
swLeverPivot.add(swHandle);

switchGroup.add(swLeverPivot);
exp1Group.add(switchGroup);

function getSwitchRightWorld() {
  return switchGroup.position.clone().add(new THREE.Vector3(0.38, 0.22, 0.22));
}
function getSwitchLeftWorld() {
  return switchGroup.position.clone().add(new THREE.Vector3(-0.38, 0.22, 0.22));
}

// --- 1.4 REALISTIC 10 Ω PRECISION SERIES RESISTOR MODULE (AT BACK-RIGHT: DEFAULT z = -1.45) ---
const r10Group = new THREE.Group();
r10Group.position.set(4.65, 0.14, -1.45);
r10Group.userData = { isDraggable: true, instrumentName: 'ตัวต้านทานมาตรฐาน 10 Ω (Standard Resistor)' };

const r10Board = new THREE.Mesh(
  new THREE.BoxGeometry(1.75, 0.24, 1.02),
  new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.38, metalness: 0.2 })
);
r10Board.castShadow = true;
r10Group.add(r10Board);

// Printed Label Plate on 10 Ω Resistor Board
const r10LabelCanvas = document.createElement('canvas');
r10LabelCanvas.width = 256;
r10LabelCanvas.height = 96;
const r10Ctx = r10LabelCanvas.getContext('2d');
r10Ctx.fillStyle = '#0f172a';
r10Ctx.fillRect(0, 0, 256, 96);
r10Ctx.strokeStyle = '#fbbf24';
r10Ctx.lineWidth = 4;
r10Ctx.strokeRect(4, 4, 248, 88);
r10Ctx.fillStyle = '#fde047';
r10Ctx.font = 'bold 34px JetBrains Mono, monospace';
r10Ctx.textAlign = 'center';
r10Ctx.fillText('10.0 Ω ±1%', 128, 48);
r10Ctx.fillStyle = '#94a3b8';
r10Ctx.font = 'bold 16px sans-serif';
r10Ctx.fillText('SERIES STANDARD RESISTOR', 128, 76);
const r10Plate = new THREE.Mesh(
  new THREE.PlaneGeometry(1.35, 0.45),
  new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(r10LabelCanvas) })
);
r10Plate.rotation.x = -Math.PI / 2;
r10Plate.position.set(0, 0.13, 0.22);
r10Group.add(r10Plate);

const r10LeftPost = new THREE.Vector3(-0.62, 0.44, -0.12);
const r10RightPost = new THREE.Vector3(0.62, 0.44, -0.12);
[r10LeftPost, r10RightPost].forEach((lp) => {
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.52, 20),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.15 })
  );
  post.position.set(lp.x, 0.32, lp.z);
  r10Group.add(post);

  const nut = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.12, 6),
    new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.22 })
  );
  nut.position.set(lp.x, 0.16, lp.z);
  r10Group.add(nut);
});

const r10PrecisionMesh = createPrecisionResistor3D(
  r10LeftPost,
  r10RightPost,
  ['#92400e', '#000000', '#000000', '#fbbf24'],
  0x38bdf8,
  0.22
);
r10Group.add(r10PrecisionMesh);
exp1Group.add(r10Group);

function getR10LeftWorld() {
  return r10Group.position.clone().add(r10LeftPost);
}
function getR10RightWorld() {
  return r10Group.position.clone().add(r10RightPost);
}

// --- 1.5 ULTRA-REALISTIC SLOPED BENCHTOP VOLTMETER & AMMETER (AT FRONT) ---
function createUltraRealisticBenchMeter3D(title, symbolUnit, maxScale, accentColor, pos, rangeLabels) {
  const group = new THREE.Group();
  group.position.copy(pos);
  group.userData = { isDraggable: true, instrumentName: title };

  // 4 Rubber feet
  [[-1.05, -0.65], [1.05, -0.65], [-1.05, 0.65], [1.05, 0.65]].forEach(([fx, fz]) => {
    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.16, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.85 })
    );
    foot.position.set(fx, 0.05, fz);
    group.add(foot);
  });

  // Lower dark-charcoal deck base
  const lowerDeck = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.44, 1.72),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.38, metalness: 0.25 })
  );
  lowerDeck.position.y = 0.26;
  lowerDeck.castShadow = true;
  lowerDeck.receiveShadow = true;
  group.add(lowerDeck);

  // Sloped upper instrument housing
  const slopeAngle = -0.34;
  const upperHousingGroup = new THREE.Group();
  upperHousingGroup.position.set(0, 0.94, -0.16);
  upperHousingGroup.rotation.x = slopeAngle;
  group.add(upperHousingGroup);

  const upperBody = new THREE.Mesh(
    new THREE.BoxGeometry(2.42, 1.44, 1.18),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.34, metalness: 0.22 })
  );
  upperBody.castShadow = true;
  upperHousingGroup.add(upperBody);

  // Dark metallic bezel frame around the meter window
  const bezelFrame = new THREE.Mesh(
    new THREE.BoxGeometry(2.26, 1.28, 0.12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.28, metalness: 0.4 })
  );
  bezelFrame.position.set(0, 0.02, 0.56);
  upperHousingGroup.add(bezelFrame);

  // High-Res Canvas Texture for Scale Plate
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 340;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);

  const dialPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.08, 1.14),
    new THREE.MeshBasicMaterial({ map: tex })
  );
  dialPlane.position.set(0, 0.02, 0.625);
  upperHousingGroup.add(dialPlane);

  // REAL 3D PHYSICAL MOVING-COIL NEEDLE
  const needlePivot3D = new THREE.Group();
  needlePivot3D.position.set(0, -0.40, 0.645);
  upperHousingGroup.add(needlePivot3D);

  const needleBlade3D = new THREE.Mesh(
    new THREE.ConeGeometry(0.022, 0.82, 8),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2 })
  );
  needleBlade3D.position.y = 0.41;
  needlePivot3D.add(needleBlade3D);

  const pivotCover3D = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.12, 0.05, 24),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.2 })
  );
  pivotCover3D.rotation.x = Math.PI / 2;
  needlePivot3D.add(pivotCover3D);

  // Glossy Transparent Glass Cover Pane
  const glassPane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.10, 1.16),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.16,
      roughness: 0.05,
      metalness: 0.9
    })
  );
  glassPane.position.set(0, 0.02, 0.675);
  upperHousingGroup.add(glassPane);

  // Zero-adjust screw
  const zeroScrew = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 })
  );
  zeroScrew.rotation.x = Math.PI / 2;
  zeroScrew.position.set(0, -0.52, 0.64);
  upperHousingGroup.add(zeroScrew);

  // 3 Binding Posts on Front Deck
  const postPositionsLocal = [
    new THREE.Vector3(-0.72, 0.50, 0.62), // COM (-)
    new THREE.Vector3(0.05, 0.50, 0.62),  // Active Range (+)
    new THREE.Vector3(0.76, 0.50, 0.62)   // High Range (+)
  ];
  const postColors = [0x1e293b, 0xef4444, 0xdc2626];

  postPositionsLocal.forEach((pLoc, idx) => {
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.125, 0.14, 0.22, 20),
      new THREE.MeshStandardMaterial({ color: postColors[idx], roughness: 0.28 })
    );
    collar.position.copy(pLoc);
    group.add(collar);

    const brassStud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.32, 16),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.92, roughness: 0.15 })
    );
    brassStud.position.copy(pLoc).add(new THREE.Vector3(0, 0.08, 0));
    group.add(brassStud);
  });

  // Terminal Range Labels Plate on Front Deck
  const deckCanvas = document.createElement('canvas');
  deckCanvas.width = 512;
  deckCanvas.height = 64;
  const dCtx = deckCanvas.getContext('2d');
  dCtx.fillStyle = '#0f172a';
  dCtx.fillRect(0, 0, 512, 64);
  dCtx.fillStyle = '#f8fafc';
  dCtx.font = 'bold 26px JetBrains Mono, monospace';
  dCtx.textAlign = 'center';
  dCtx.fillText(rangeLabels[0], 105, 42);
  dCtx.fillStyle = '#fca5a5';
  dCtx.fillText(rangeLabels[1], 265, 42);
  dCtx.fillText(rangeLabels[2], 415, 42);
  const deckLabelPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.15, 0.24),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(deckCanvas) })
  );
  deckLabelPlane.rotation.x = -Math.PI / 2;
  deckLabelPlane.position.set(0, 0.485, 0.82);
  group.add(deckLabelPlane);

  // Plugs directly inside group so they move along when dragged!
  group.add(createBananaPlug3D(postPositionsLocal[0].clone().add(new THREE.Vector3(0, 0.14, 0)), 0x0284c7));
  group.add(createBananaPlug3D(postPositionsLocal[1].clone().add(new THREE.Vector3(0, 0.14, 0)), 0xef4444));

  exp1Group.add(group);

  return {
    group,
    canvas,
    ctx,
    tex,
    title,
    unit: symbolUnit,
    maxScale,
    accentColor,
    needlePivot3D,
    getPlusWorld: () => group.position.clone().add(postPositionsLocal[1]).add(new THREE.Vector3(0, 0.32, 0)),
    getMinusWorld: () => group.position.clone().add(postPositionsLocal[0]).add(new THREE.Vector3(0, 0.32, 0))
  };
}

const voltmeter3D = createUltraRealisticBenchMeter3D(
  'โวลต์มิเตอร์ (DC Voltmeter)',
  'V',
  3.5,
  '#06b6d4',
  new THREE.Vector3(1.38, 0, 2.15),
  ['- COM', '+ 3.5V', '+ 15V']
);

const ammeter3D = createUltraRealisticBenchMeter3D(
  'แอมมิเตอร์ (DC Ammeter)',
  'A',
  1.0,
  '#f59e0b',
  new THREE.Vector3(4.35, 0, 2.15),
  ['- COM', '+ 1.0A', '+ 5.0A']
);

// Render Scale Graphics AND Rotate Real 3D Physical Needle
function renderMeterGraphics(meterObj, uiCanvasId, currentVal, decText, fracText) {
  const { ctx, canvas, tex, title, unit, maxScale, accentColor, needlePivot3D } = meterObj;
  const W = canvas.width;
  const H = canvas.height;

  const clampedRatio = Math.max(0, Math.min(1.04, currentVal / maxScale));

  if (meterDisplayMode === 'digital') {
    if (needlePivot3D) needlePivot3D.visible = false;

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, W - 12, H - 12);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`DIGITAL ${title} (${unit})`, W / 2, 52);

    ctx.fillStyle = '#090d16';
    ctx.fillRect(36, 76, W - 72, 134);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(36, 76, W - 72, 134);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 74px JetBrains Mono, monospace';
    ctx.fillText(decText, W / 2, 166);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 40px JetBrains Mono, monospace';
    ctx.fillText(`Exact: ${fracText}`, W / 2, 276);
  } else {
    if (needlePivot3D) {
      needlePivot3D.visible = true;
      const rotZ = (0.5 - clampedRatio) * (Math.PI * 0.56);
      needlePivot3D.rotation.z = rotZ;
    }

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, W - 12, H - 12);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(15, 15, W - 30, H - 30);

    const pivotX = W / 2;
    const pivotY = H - 38;
    const radius = 216;
    const startAngle = -Math.PI * 0.78;
    const endAngle = -Math.PI * 0.22;

    // Anti-parallax curved mirror band
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 15;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, radius - 28, startAngle, endAngle);
    ctx.stroke();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, radius, startAngle, endAngle);
    ctx.stroke();

    const numMajor = unit === 'A' ? 5 : 7;
    const numMinorPerMajor = 5;
    const totalTicks = numMajor * numMinorPerMajor;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= totalTicks; i++) {
      const frac = i / totalTicks;
      const ang = startAngle + frac * (endAngle - startAngle);
      const isMajor = (i % numMinorPerMajor === 0);
      const innerR = isMajor ? radius - 22 : radius - 12;
      const outerR = radius;

      const x1 = pivotX + innerR * Math.cos(ang);
      const y1 = pivotY + innerR * Math.sin(ang);
      const x2 = pivotX + outerR * Math.cos(ang);
      const y2 = pivotY + outerR * Math.sin(ang);

      ctx.strokeStyle = isMajor ? '#0f172a' : '#475569';
      ctx.lineWidth = isMajor ? 3.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      if (isMajor) {
        const valLabel = (frac * maxScale).toFixed(1);
        const tx = pivotX + (radius + 24) * Math.cos(ang);
        const ty = pivotY + (radius + 24) * Math.sin(ang);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 22px JetBrains Mono, monospace';
        ctx.fillText(valLabel, tx, ty);
      }
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 42px Prompt, sans-serif';
    ctx.fillText(unit, pivotX, pivotY - 112);
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`CLASS 1.0  MOVING-COIL ${title}`, pivotX, pivotY - 76);

    // Digital sub-readout window
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(pivotX - 98, pivotY - 62, 196, 32);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 20px JetBrains Mono, monospace';
    ctx.fillText(`${decText} (${fracText})`, pivotX, pivotY - 46);

    // 2D needle on dial texture
    const needleAng = startAngle + clampedRatio * (endAngle - startAngle);
    ctx.save();
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(pivotX + 4, pivotY + 4);
    ctx.lineTo(pivotX + 4 + (radius + 8) * Math.cos(needleAng), pivotY + 4 + (radius + 8) * Math.sin(needleAng));
    ctx.stroke();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(pivotX - 20 * Math.cos(needleAng), pivotY - 20 * Math.sin(needleAng));
    ctx.lineTo(pivotX + (radius + 10) * Math.cos(needleAng), pivotY + (radius + 10) * Math.sin(needleAng));
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  tex.needsUpdate = true;

  const uiCanvas = document.getElementById(uiCanvasId);
  if (uiCanvas) {
    const uCtx = uiCanvas.getContext('2d');
    uCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    uCtx.drawImage(canvas, 0, 0, uiCanvas.width, uiCanvas.height);
  }
}

// --- 1.6 FIXED TERMINALS P-Q & DYNAMIC SYSTEM WIRES ---
const terminalPPos = new THREE.Vector3(0.05, 0.38, 1.15);
const terminalQPos = new THREE.Vector3(2.82, 0.38, 1.15);

[
  { pos: terminalPPos, col: 0xef4444 },
  { pos: terminalQPos, col: 0x0284c7 }
].forEach((t) => {
  const block = new THREE.Mesh(
    new THREE.CylinderGeometry(0.20, 0.22, 0.22, 24),
    new THREE.MeshStandardMaterial({ color: t.col, roughness: 0.3 })
  );
  block.position.set(t.pos.x, 0.11, t.pos.z);
  exp1Group.add(block);

  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.44, 18),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.15 })
  );
  post.position.copy(t.pos);
  exp1Group.add(post);

  exp1Group.add(createBananaPlug3D(t.pos.clone().add(new THREE.Vector3(0, 0.15, 0)), t.col));
});

// Dynamic Circuit Wires Array
let circuitWires = [];

/**
 * Recalculates and redraws all 7 connecting silicone wires
 * whenever ANY equipment is moved or dragged on the table!
 */
function updateCircuitWires() {
  circuitWires.forEach((w) => exp1Group.remove(w));
  circuitWires = [];

  const termPTop = terminalPPos.clone().add(new THREE.Vector3(0, 0.42, 0));
  const termQTop = terminalQPos.clone().add(new THREE.Vector3(0, 0.42, 0));

  // Wire 1: PSU (+) Red -> Knife Switch Right Screw
  const psuPlus = getPsuPlusWorld();
  const swRight = getSwitchRightWorld();
  const mid1 = new THREE.Vector3().lerpVectors(psuPlus, swRight, 0.5).add(new THREE.Vector3(0, 0.32, 0));
  const wire1 = createInsulatedLead([psuPlus, mid1, swRight], 0xef4444);
  circuitWires.push(wire1);
  exp1Group.add(wire1);

  // Wire 2: Knife Switch Left Screw -> Terminal P
  const swLeft = getSwitchLeftWorld();
  const mid2 = new THREE.Vector3().lerpVectors(swLeft, termPTop, 0.5).add(new THREE.Vector3(0, 0.28, 0));
  const wire2 = createInsulatedLead([swLeft, mid2, termPTop], 0xef4444);
  circuitWires.push(wire2);
  exp1Group.add(wire2);

  // Wire 3: PSU (-) Black -> 10 Ω Resistor Left Post
  const psuMinus = getPsuMinusWorld();
  const r10Left = getR10LeftWorld();
  const mid3 = new THREE.Vector3().lerpVectors(psuMinus, r10Left, 0.5).add(new THREE.Vector3(0, 0.34, 0));
  const wire3 = createInsulatedLead([psuMinus, mid3, r10Left], 0x1e293b);
  circuitWires.push(wire3);
  exp1Group.add(wire3);

  // Wire 4: 10 Ω Resistor Right Post -> Ammeter (+) Post
  const r10Right = getR10RightWorld();
  const ampPlus = ammeter3D.getPlusWorld();
  const mid4 = new THREE.Vector3().lerpVectors(r10Right, ampPlus, 0.5).add(new THREE.Vector3(0, 0.38, 0));
  const wire4 = createInsulatedLead([r10Right, mid4, ampPlus], 0xf59e0b);
  circuitWires.push(wire4);
  exp1Group.add(wire4);

  // Wire 5: Ammeter (- COM) -> Terminal Q
  const ampMinus = ammeter3D.getMinusWorld();
  const mid5 = new THREE.Vector3().lerpVectors(ampMinus, termQTop, 0.5).add(new THREE.Vector3(0, 0.32, 0));
  const wire5 = createInsulatedLead([ampMinus, mid5, termQTop], 0x0284c7);
  circuitWires.push(wire5);
  exp1Group.add(wire5);

  // Wire 6: Voltmeter (+) -> Terminal P
  const voltPlus = voltmeter3D.getPlusWorld();
  const mid6 = new THREE.Vector3().lerpVectors(voltPlus, termPTop, 0.5).add(new THREE.Vector3(0, 0.35, 0));
  const wire6 = createInsulatedLead([voltPlus, mid6, termPTop], 0xef4444);
  circuitWires.push(wire6);
  exp1Group.add(wire6);

  // Wire 7: Voltmeter (- COM) -> Terminal Q
  const voltMinus = voltmeter3D.getMinusWorld();
  const mid7 = new THREE.Vector3().lerpVectors(voltMinus, termQTop, 0.5).add(new THREE.Vector3(0, 0.35, 0));
  const wire7 = createInsulatedLead([voltMinus, mid7, termQTop], 0x0284c7);
  circuitWires.push(wire7);
  exp1Group.add(wire7);
}

// Initial Wire Generation
updateCircuitWires();

// Dynamic Alligator Clip Probes (P & Q connecting to hexagonal posts)
let probeWireP = null;
let probeWireQ = null;
const clipProbeP = createAlligatorClipProbe3D(0xef4444);
const clipProbeQ = createAlligatorClipProbe3D(0x0284c7);
exp1Group.add(clipProbeP);
exp1Group.add(clipProbeQ);

function updateDynamicProbeWires() {
  if (probeWireP) exp1Group.remove(probeWireP);
  if (probeWireQ) exp1Group.remove(probeWireQ);

  const targetP = nodePositions[selectedNodeP].clone().add(new THREE.Vector3(0, 0.26, 0));
  const targetQ = nodePositions[selectedNodeQ].clone().add(new THREE.Vector3(0, 0.26, 0));

  clipProbeP.position.copy(targetP).add(new THREE.Vector3(0, 0.08, 0));
  clipProbeP.rotation.set(0.18, 0, -0.15);

  clipProbeQ.position.copy(targetQ).add(new THREE.Vector3(0, 0.08, 0));
  clipProbeQ.rotation.set(0.18, 0, 0.15);

  const startP = terminalPPos.clone().add(new THREE.Vector3(0, 0.42, 0));
  const startQ = terminalQPos.clone().add(new THREE.Vector3(0, 0.42, 0));
  const wireEndP = clipProbeP.position.clone().add(new THREE.Vector3(0.08, 0.56, 0.1));
  const wireEndQ = clipProbeQ.position.clone().add(new THREE.Vector3(-0.08, 0.56, 0.1));

  const midP1 = new THREE.Vector3().lerpVectors(startP, wireEndP, 0.35).add(new THREE.Vector3(0, 1.05, 0.3));
  const midP2 = new THREE.Vector3().lerpVectors(startP, wireEndP, 0.72).add(new THREE.Vector3(0, 1.35, 0.15));
  probeWireP = createInsulatedLead([startP, midP1, midP2, wireEndP], 0xef4444, 0.052);
  exp1Group.add(probeWireP);

  const midQ1 = new THREE.Vector3().lerpVectors(startQ, wireEndQ, 0.35).add(new THREE.Vector3(0, 1.25, 0.4));
  const midQ2 = new THREE.Vector3().lerpVectors(startQ, wireEndQ, 0.72).add(new THREE.Vector3(0, 1.55, 0.2));
  probeWireQ = createInsulatedLead([startQ, midQ1, midQ2, wireEndQ], 0x0284c7, 0.052);
  exp1Group.add(probeWireQ);
}

// Electron current flow particle markers
const edgeParticles = [];
for (let i = 0; i < 6; i++) {
  const pMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
  );
  exp1Group.add(pMesh);
  edgeParticles.push({ edgeIdx: i, t: 0.5, speed: 0, mesh: pMesh });
}

// =========================================================================
// 1.7 DRAGGABLE INSTRUMENTS REGISTRATION & RECURSIVE TAGGING
// =========================================================================
const draggableInstruments = [
  {
    group: voltmeter3D.group,
    name: 'โวลต์มิเตอร์ (DC Voltmeter)',
    defaultPos: new THREE.Vector3(1.38, 0, 2.15)
  },
  {
    group: ammeter3D.group,
    name: 'แอมมิเตอร์ (DC Ammeter)',
    defaultPos: new THREE.Vector3(4.35, 0, 2.15)
  },
  {
    group: psuGroup,
    name: 'แหล่งจ่ายไฟ DC (Power Supply)',
    defaultPos: new THREE.Vector3(2.25, 0, -2.45)
  },
  {
    group: switchGroup,
    name: 'สวิตช์ใบมีด (Knife Switch)',
    defaultPos: new THREE.Vector3(0.15, 0.12, -1.85)
  },
  {
    group: r10Group,
    name: 'ตัวต้านทาน 10 Ω (Standard Resistor)',
    defaultPos: new THREE.Vector3(4.65, 0.14, -1.45)
  }
];

// Recursively tag all child meshes of draggable groups
draggableInstruments.forEach((item) => {
  item.group.traverse((child) => {
    if (child.isMesh) {
      child.userData.draggableRoot = item.group;
      child.userData.instrumentName = item.name;
    }
  });
});

/**
 * Resets all movable instruments to their factory lab layout positions
 */
function resetInstrumentPositions() {
  draggableInstruments.forEach((item) => {
    item.group.position.copy(item.defaultPos);
  });
  updateCircuitWires();
  if (typeof updateFloatingLabelPositions === 'function') {
    updateFloatingLabelPositions();
  }
}
