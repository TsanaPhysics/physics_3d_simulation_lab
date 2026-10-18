/**
 * labels-raycaster.js
 * 3D Floating HTML Overlay Labels & Interactive Drag & Click Controls
 * Supports Dragging Equipment with Mouse on Lab Table
 * RBRU Next Gen Lab 2026
 */

const labelItems = [];
const nodeLabelElements = {};

function createLabel(text, pos3D, className, expId, onClickFn, nodeKey) {
  const el = document.createElement('div');
  el.className = `label-3d ${className}`;
  el.innerHTML = text;
  if (onClickFn) {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      onClickFn();
    });
  }
  labelsContainer.appendChild(el);
  const item = { el, pos3D, expId, nodeKey };
  labelItems.push(item);
  if (nodeKey) nodeLabelElements[nodeKey] = el;
  return item;
}

// 1. Hexagonal Node Labels a–f
nodesOrder.forEach((n) => {
  createLabel(
    `จุด ${n}`,
    nodePositions[n].clone().add(new THREE.Vector3(0, 0.64, 0)),
    'node-label',
    1,
    () => handle3DNodeClick(n),
    n
  );
});

// 2. Resistor Midpoint Value Tags
const resistorLabelItems = [];
resistorMidpoints.forEach((rm) => {
  const item = createLabel(rm.label, rm.mid.clone().add(new THREE.Vector3(0, 0.35, 0)), 'resistor-label', 1, null);
  resistorLabelItems.push(item);
});
window.resistorLabelItems = resistorLabelItems;

// 3. Equipment Badges (Movable with Instruments)
const psuLabelItem = createLabel('🔋 แหล่งจ่ายไฟ DC 10.00 V (คลิกลากได้)', new THREE.Vector3(2.25, 2.25, -2.45), '', 1, null);
window.psuLabelItem = psuLabelItem;

function updatePowerSupply3DLabel(v) {
  if (window.psuLabelItem && window.psuLabelItem.el) {
    const volt = (typeof v === 'number') ? v : (typeof powerSupplyVoltage === 'number' ? powerSupplyVoltage : 10.0);
    window.psuLabelItem.el.textContent = `🔋 แหล่งจ่ายไฟ DC ${volt.toFixed(2)} V (คลิกลากได้)`;
  }
}
window.updatePowerSupply3DLabel = updatePowerSupply3DLabel;

const r10LabelItem = createLabel('ตัวต้านทาน 10 Ω (คลิกลากได้)', new THREE.Vector3(4.65, 1.02, -1.45), 'resistor-label', 1, null);
const switchLabelItem = createLabel('สวิตช์ใบมีด (คลิกสลับ / ลากย้าย)', new THREE.Vector3(0.15, 0.78, -1.85), '', 1, () => toggleCircuitSwitch());
const voltLabelItem = createLabel('โวลต์มิเตอร์ V (คลิกลากได้)', new THREE.Vector3(1.38, 1.45, 2.15), '', 1, null);
const ampLabelItem = createLabel('แอมมิเตอร์ A (คลิกลากได้)', new THREE.Vector3(4.35, 1.45, 2.15), '', 1, null);

createLabel('ขั้วต่อ P (แดง)', terminalPPos.clone().add(new THREE.Vector3(0, 0.56, 0)), 'node-label', 1, null);
createLabel('ขั้วต่อ Q (น้ำเงิน)', terminalQPos.clone().add(new THREE.Vector3(0, 0.56, 0)), 'node-label', 1, null);

// 4. Pendulum Labels
createLabel('0.0 cm จุดแขวน (Pivot)', new THREE.Vector3(0, pivotY + 0.35, pivotZ), 'node-label', 2, null);
const rulerDynamicLabelItem = createLabel(
  '◀ สเกล L = 50.0 cm',
  new THREE.Vector3(-2.25, pivotY - 3.0, pivotZ),
  'resistor-label',
  2,
  null
);
const rulerDynamicLabel = rulerDynamicLabelItem.el;

/**
 * Updates floating 3D label positions whenever instruments are moved
 */
function updateFloatingLabelPositions() {
  if (psuLabelItem) psuLabelItem.pos3D.set(psuGroup.position.x, 2.25, psuGroup.position.z);
  if (r10LabelItem) r10LabelItem.pos3D.set(r10Group.position.x, 1.02, r10Group.position.z);
  if (switchLabelItem) switchLabelItem.pos3D.set(switchGroup.position.x, 0.78, switchGroup.position.z);
  if (voltLabelItem) voltLabelItem.pos3D.set(voltmeter3D.group.position.x, 1.45, voltmeter3D.group.position.z);
  if (ampLabelItem) ampLabelItem.pos3D.set(ammeter3D.group.position.x, 1.45, ammeter3D.group.position.z);
}

// Raycaster Node Click Handler
function handle3DNodeClick(nodeName) {
  if (nodeName === selectedNodeP || nodeName === selectedNodeQ) return;
  if (nextClickTarget === 'P') {
    selectedNodeP = nodeName;
    nextClickTarget = 'Q';
  } else {
    selectedNodeQ = nodeName;
    nextClickTarget = 'P';
  }
  refreshExp1UI();
}

// =========================================================================
// MOUSE INTERACTIVE DRAGGING ON LAB TABLE PLANE
// =========================================================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Horizontal table plane y = 0
const planeIntersection = new THREE.Vector3();
const dragOffset = new THREE.Vector3();
let activeMouseDragInstrument = null;

function getActiveDraggableList() {
  if (window.PhysicsLabRegistry && typeof window.PhysicsLabRegistry.getActiveDraggableInstruments === 'function') {
    const regList = window.PhysicsLabRegistry.getActiveDraggableInstruments();
    if (regList && regList.length > 0) return regList;
  }
  return (typeof draggableInstruments !== 'undefined') ? draggableInstruments : [];
}

// Track pointer down: select pins or start dragging instruments
renderer.domElement.addEventListener('pointerdown', (e) => {
  const activeExp = window.PhysicsLabRegistry ? window.PhysicsLabRegistry.getActiveExperiment() : null;
  const isHexLoop = !activeExp || activeExp.id === 'elec_hex_loop';

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // 1. Check if user clicked a hexagonal node pin (a–f) when in Hex loop
  if (isHexLoop && typeof nodeMeshes !== 'undefined') {
    const pins = Object.values(nodeMeshes);
    const pinIntersects = raycaster.intersectObjects(pins);
    if (pinIntersects.length > 0) {
      const hitNode = pinIntersects[0].object.userData.nodeName;
      if (hitNode) {
        handle3DNodeClick(hitNode);
        return;
      }
    }
  }

  // 2. Check if user clicked a draggable instrument in active experiment
  const currentDraggables = getActiveDraggableList();
  const allMeshes = [];
  currentDraggables.forEach((inst) => {
    if (inst.group) {
      inst.group.traverse((c) => {
        if (c.isMesh) {
          if (!c.userData.draggableRoot) c.userData.draggableRoot = inst.group;
          allMeshes.push(c);
        }
      });
    }
  });

  const intersects = raycaster.intersectObjects(allMeshes, false);
  if (intersects.length > 0) {
    const hitMesh = intersects[0].object;
    if (hitMesh.userData.draggableRoot) {
      activeMouseDragInstrument = hitMesh.userData.draggableRoot;
      controls.enabled = false; // Disable camera orbit while dragging
      renderer.domElement.style.cursor = 'grabbing';

      if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
        dragOffset.subVectors(activeMouseDragInstrument.position, planeIntersection);
        dragOffset.y = 0; // lock to horizontal plane
      }
    }
  }
});

// Pointer Move: Drag active instrument or update hover cursor
renderer.domElement.addEventListener('pointermove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  if (activeMouseDragInstrument) {
    if (raycaster.ray.intersectPlane(dragPlane, planeIntersection)) {
      const targetX = planeIntersection.x + dragOffset.x;
      const targetZ = planeIntersection.z + dragOffset.z;

      // Keep equipment safely on top of the lab bench
      const clampedX = Math.max(-7.6, Math.min(7.6, targetX));
      const clampedZ = Math.max(-5.0, Math.min(4.8, targetZ));

      activeMouseDragInstrument.position.x = clampedX;
      activeMouseDragInstrument.position.z = clampedZ;

      if (typeof updateCircuitWires === 'function') updateCircuitWires();
      if (typeof updateFloatingLabelPositions === 'function') updateFloatingLabelPositions();
    }
  } else {
    // Hover feedback
    const currentDraggables = getActiveDraggableList();
    const allMeshes = [];
    currentDraggables.forEach((inst) => {
      if (inst.group) {
        inst.group.traverse((c) => {
          if (c.isMesh) {
            if (!c.userData.draggableRoot) c.userData.draggableRoot = inst.group;
            allMeshes.push(c);
          }
        });
      }
    });

    const intersects = raycaster.intersectObjects(allMeshes, false);
    if (intersects.length > 0 && intersects[0].object.userData.draggableRoot) {
      renderer.domElement.style.cursor = 'grab';
    } else {
      renderer.domElement.style.cursor = 'default';
    }
  }
});

// Pointer Up & Cancel: Drop instrument and restore camera controls
function onPointerRelease() {
  if (activeMouseDragInstrument) {
    activeMouseDragInstrument = null;
    controls.enabled = true;
    renderer.domElement.style.cursor = 'default';
  }
}

renderer.domElement.addEventListener('pointerup', onPointerRelease);
renderer.domElement.addEventListener('pointerleave', onPointerRelease);
renderer.domElement.addEventListener('pointercancel', onPointerRelease);
