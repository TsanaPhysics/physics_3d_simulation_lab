/**
 * exp2-pendulum.js
 * Experiment 2: Simple Pendulum, Retort Stand, Graduated Meter Ruler & Protractor
 * RBRU Next Gen Lab 2026
 */

const exp2Group = new THREE.Group();
exp2Group.visible = false;
scene.add(exp2Group);

// Stand Base
const standBase = new THREE.Mesh(
  new THREE.BoxGeometry(2.8, 0.26, 1.9),
  new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.65, roughness: 0.35 })
);
standBase.position.set(0, 0.13, -1.2);
standBase.castShadow = true;
standBase.receiveShadow = true;
exp2Group.add(standBase);

// Vertical Chrome Retort Rod
const rodHeight = 7.4;
const standRod = new THREE.Mesh(
  new THREE.CylinderGeometry(0.11, 0.11, rodHeight, 24),
  new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.18 })
);
standRod.position.set(0, rodHeight / 2, -1.2);
standRod.castShadow = true;
exp2Group.add(standRod);

const pivotY = 6.8;
const pivotZ = 0.2;
const clampArm = new THREE.Mesh(
  new THREE.BoxGeometry(0.38, 0.3, 1.7),
  new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.75, roughness: 0.28 })
);
clampArm.position.set(0, pivotY, -0.5);
exp2Group.add(clampArm);

// High-Precision Protractor Texture & Mesh
function createProtractorMesh() {
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 512;
  pCanvas.height = 280;
  const pCtx = pCanvas.getContext('2d');

  const cx = 256, cy = 24, rOuter = 230, rInner = 135;
  pCtx.clearRect(0, 0, 512, 280);

  pCtx.fillStyle = 'rgba(248, 250, 252, 0.88)';
  pCtx.beginPath();
  pCtx.arc(cx, cy, rOuter, Math.PI * 0.22, Math.PI * 0.78);
  pCtx.arc(cx, cy, rInner, Math.PI * 0.78, Math.PI * 0.22, true);
  pCtx.closePath();
  pCtx.fill();
  pCtx.strokeStyle = '#0284c7';
  pCtx.lineWidth = 4;
  pCtx.stroke();

  pCtx.textAlign = 'center';
  pCtx.textBaseline = 'middle';
  for (let deg = -40; deg <= 40; deg += 1) {
    const rad = Math.PI / 2 - THREE.MathUtils.degToRad(deg);
    const isTen = (deg % 10 === 0);
    const isFive = (deg % 5 === 0);
    const tickLen = isTen ? 24 : (isFive ? 15 : 8);

    const x1 = cx + (rOuter - tickLen) * Math.cos(rad);
    const y1 = cy + (rOuter - tickLen) * Math.sin(rad);
    const x2 = cx + rOuter * Math.cos(rad);
    const y2 = cy + rOuter * Math.sin(rad);

    pCtx.strokeStyle = deg === 0 ? '#dc2626' : '#0f172a';
    pCtx.lineWidth = isTen ? 3 : (isFive ? 2 : 1);
    pCtx.beginPath();
    pCtx.moveTo(x1, y1);
    pCtx.lineTo(x2, y2);
    pCtx.stroke();

    if (isTen) {
      const tx = cx + (rOuter - 40) * Math.cos(rad);
      const ty = cy + (rOuter - 40) * Math.sin(rad);
      pCtx.fillStyle = deg === 0 ? '#dc2626' : '#0f172a';
      pCtx.font = 'bold 18px JetBrains Mono, monospace';
      pCtx.fillText(`${Math.abs(deg)}°`, tx, ty);
    }
  }

  const pTex = new THREE.CanvasTexture(pCanvas);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.3, 1.25),
    new THREE.MeshBasicMaterial({ map: pTex, transparent: true, side: THREE.DoubleSide })
  );
  plane.position.set(0, pivotY - 0.52, pivotZ - 0.06);
  return plane;
}
exp2Group.add(createProtractorMesh());

// Pendulum Pivot & Bob Assembly
const pendulumPivot = new THREE.Group();
pendulumPivot.position.set(0, pivotY, pivotZ);
exp2Group.add(pendulumPivot);

const stringMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
let stringMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 12), stringMat);
pendulumPivot.add(stringMesh);

const bobMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.32, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.88, roughness: 0.14 })
);
bobMesh.castShadow = true;
pendulumPivot.add(bobMesh);

// Graduated Wooden Meter Stick Texture
function createGraduatedMeterStickTexture() {
  const rCanvas = document.createElement('canvas');
  rCanvas.width = 256;
  rCanvas.height = 2048;
  const rCtx = rCanvas.getContext('2d');

  const grad = rCtx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#fde047');
  grad.addColorStop(0.5, '#fef08a');
  grad.addColorStop(1, '#facc15');
  rCtx.fillStyle = grad;
  rCtx.fillRect(0, 0, 256, 2048);

  rCtx.strokeStyle = '#713f12';
  rCtx.lineWidth = 6;
  rCtx.strokeRect(3, 3, 250, 2042);

  for (let mm = 0; mm <= 1000; mm += 2) {
    const y = (mm / 1000) * 2048;
    const isTenCm = (mm % 100 === 0);
    const isFiveCm = (mm % 50 === 0);
    const isOneCm = (mm % 10 === 0);

    let tickW = 28;
    let lineW = 1.5;
    let strokeCol = '#451a03';

    if (isTenCm) {
      tickW = 105;
      lineW = 4.5;
      strokeCol = '#b91c1c';
    } else if (isFiveCm) {
      tickW = 80;
      lineW = 3.2;
    } else if (isOneCm) {
      tickW = 56;
      lineW = 2.4;
    }

    rCtx.strokeStyle = strokeCol;
    rCtx.lineWidth = lineW;
    rCtx.beginPath();
    rCtx.moveTo(256 - tickW, y);
    rCtx.lineTo(256, y);
    rCtx.stroke();

    if (isOneCm) {
      rCtx.beginPath();
      rCtx.moveTo(0, y);
      rCtx.lineTo(tickW * 0.45, y);
      rCtx.stroke();
    }

    if (isFiveCm) {
      const cmVal = mm / 10;
      rCtx.fillStyle = isTenCm ? '#b91c1c' : '#1e293b';
      rCtx.font = isTenCm ? 'bold 34px JetBrains Mono, monospace' : 'bold 26px JetBrains Mono, monospace';
      rCtx.textAlign = 'right';
      rCtx.textBaseline = 'middle';
      const textY = Math.max(22, Math.min(2026, y));
      rCtx.fillText(`${cmVal}`, 142, textY);
      if (isTenCm) {
        rCtx.font = 'bold 18px sans-serif';
        rCtx.fillText('cm', 142, textY + 22);
      }
    }
  }

  const tex = new THREE.CanvasTexture(rCanvas);
  tex.anisotropy = 4;
  return tex;
}

const rulerGroup = new THREE.Group();
rulerGroup.position.set(-1.55, pivotY - 3.0, pivotZ);

const rulerTex = createGraduatedMeterStickTexture();
const rulerSideMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.45 });
const rulerFrontMat = new THREE.MeshStandardMaterial({ map: rulerTex, roughness: 0.35 });

const rulerBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.46, 6.0, 0.08),
  [rulerSideMat, rulerSideMat, rulerSideMat, rulerSideMat, rulerFrontMat, rulerFrontMat]
);
rulerBody.castShadow = true;
rulerGroup.add(rulerBody);

const topZeroLine = new THREE.Mesh(
  new THREE.BoxGeometry(1.55, 0.03, 0.03),
  new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
);
topZeroLine.position.set(0.78, 3.0, 0);
rulerGroup.add(topZeroLine);

const rulerPointerGroup = new THREE.Group();
const redCollar = new THREE.Mesh(
  new THREE.BoxGeometry(0.54, 0.14, 0.14),
  new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25 })
);
rulerPointerGroup.add(redCollar);

const pointerNeedle = new THREE.Mesh(
  new THREE.ConeGeometry(0.08, 0.28, 16),
  new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 })
);
pointerNeedle.rotation.z = -Math.PI / 2;
pointerNeedle.position.x = 0.36;
rulerPointerGroup.add(pointerNeedle);

const comLine = new THREE.Mesh(
  new THREE.BoxGeometry(1.55, 0.025, 0.025),
  new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75 })
);
comLine.position.x = 0.78;
rulerPointerGroup.add(comLine);

rulerGroup.add(rulerPointerGroup);
exp2Group.add(rulerGroup);

function updatePendulum3DGeometry() {
  const len3D = (pendLengthCm / 100) * 6.0;
  stringMesh.scale.set(1, len3D, 1);
  stringMesh.position.y = -len3D / 2;
  bobMesh.position.y = -len3D;
  rulerPointerGroup.position.y = 3.0 - len3D;
}
updatePendulum3DGeometry();
