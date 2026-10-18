/**
 * js/experiments/elec-wheatstone.js
 * Domain: Electricity & Circuits (ไฟฟ้าและวงจร)
 * Experiment: Wheatstone Slide-Wire Bridge & Null-Balance Galvanometer Dynamics
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let bridgeGroup = null;
  let wireMesh, jockeyMesh, galvoGroup, rStdMesh, rxMesh;
  let galvoNeedleMesh;

  // Physical State
  let jockeyPosCm = 50.0;     // Jockey contact position on 100 cm wire
  let rStdVal = 100.0;        // Standard resistance (Ohms)
  let rxActualVal = 150.0;    // True unknown resistance (Ohms)
  let rxSampleName = 'ตัวอย่าง A (150 Ω)';
  let isJockeyPressed = true; // Key pressed down

  // Spring-damped needle dynamics
  let currentGalvoDeflection = 0.0; // -1.0 to +1.0
  let galvoNeedleVel = 0.0;
  let bridgeTrials = [];

  function calcBridge() {
    const l1 = Math.max(0.1, Math.min(99.9, jockeyPosCm));
    const l2 = 100.0 - l1;

    // Bridge ratio: R_x / R_std vs L_1 / L_2
    const ratioWire = l1 / l2;
    const ratioRes = rxActualVal / rStdVal;

    // Bridge voltage imbalance (approximate sensitivity)
    const imbalance = isJockeyPressed ? (ratioWire - ratioRes) / (1 + ratioWire + ratioRes) : 0;
    const targetDeflection = Math.max(-1.0, Math.min(1.0, imbalance * 5.0));

    // Calculated Rx from current jockey position
    const rxMeasured = rStdVal * (l1 / l2);
    const errorPct = Math.abs(rxMeasured - rxActualVal) / rxActualVal * 100;
    const isBalanced = Math.abs(targetDeflection) < 0.015;

    return {
      l1,
      l2,
      targetDeflection,
      rxMeasured,
      errorPct,
      isBalanced
    };
  }

  // 3D Scene Initialization
  function initBridge3D(scene) {
    bridgeGroup = new THREE.Group();
    bridgeGroup.visible = false;
    scene.add(bridgeGroup);

    // 1. Wooden Bridge Base Board (100 cm slide wire)
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(10.4, 0.22, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x78350f, metalness: 0.1, roughness: 0.7 })
    );
    board.position.set(0, 0.11, 0);
    board.receiveShadow = true;
    bridgeGroup.add(board);

    // Thick Copper Terminal Strips (L-shaped ends and central strip)
    const copperMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.25 });
    const endStripLeft = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 2.2), copperMat);
    endStripLeft.position.set(-4.8, 0.25, 0);
    bridgeGroup.add(endStripLeft);

    const endStripRight = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 2.2), copperMat);
    endStripRight.position.set(4.8, 0.25, 0);
    bridgeGroup.add(endStripRight);

    const centerStrip = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.08, 0.4), copperMat);
    centerStrip.position.set(0, 0.25, -0.8);
    bridgeGroup.add(centerStrip);

    // 100 cm Nichrome Resistance Wire
    const wireMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.3 });
    wireMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 9.6, 16), wireMat);
    wireMesh.rotation.z = Math.PI / 2;
    wireMesh.position.set(0, 0.28, 0.8);
    bridgeGroup.add(wireMesh);

    // Sliding Jockey Key
    jockeyMesh = new THREE.Group();
    const jockeyHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.08, 0.65, 16),
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 })
    );
    jockeyHandle.position.set(0, 0.6, 0.8);
    jockeyMesh.add(jockeyHandle);

    const jockeyContact = new THREE.Mesh(
      new THREE.ConeGeometry(0.06, 0.22, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
    );
    jockeyContact.position.set(0, 0.32, 0.8);
    jockeyContact.rotation.x = Math.PI;
    jockeyMesh.add(jockeyContact);
    bridgeGroup.add(jockeyMesh);

    // 2. Sensitive Center-Zero Galvanometer
    galvoGroup = new THREE.Group();
    const galvoCase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.95, 0.45, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    galvoCase.position.set(0, 0.35, -2.1);
    galvoGroup.add(galvoCase);

    // Galvanometer Dial Face
    const gDialCanvas = document.createElement('canvas');
    gDialCanvas.width = 256; gDialCanvas.height = 256;
    const gCtx = gDialCanvas.getContext('2d');
    gCtx.fillStyle = '#f8fafc'; gCtx.fillRect(0, 0, 256, 256);
    gCtx.strokeStyle = '#0284c7'; gCtx.lineWidth = 3;
    gCtx.beginPath(); gCtx.arc(128, 180, 100, Math.PI * 1.2, Math.PI * 1.8); gCtx.stroke();
    gCtx.fillStyle = '#0f172a'; gCtx.font = 'bold 22px monospace'; gCtx.textAlign = 'center';
    gCtx.fillText('G', 128, 100);
    gCtx.fillText('-30   0   +30', 128, 150);

    const dialMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 1.6),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gDialCanvas) })
    );
    dialMesh.rotation.x = -Math.PI / 2;
    dialMesh.position.set(0, 0.58, -2.1);
    galvoGroup.add(dialMesh);

    // Galvanometer Moving Needle
    galvoNeedleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.02, 0.8),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    galvoNeedleMesh.position.set(0, 0.6, -2.1);
    galvoGroup.add(galvoNeedleMesh);
    bridgeGroup.add(galvoGroup);

    // 3. Standard Resistor Box & Unknown Resistor 3D Models
    rStdMesh = createResistorComponent('R_std (กล่องตัวต้านทานมาตรฐาน)', 0x0284c7);
    rStdMesh.position.set(-2.4, 0.28, -0.8);
    bridgeGroup.add(rStdMesh);

    rxMesh = createResistorComponent('R_x (ตัวต้านทานไม่ทราบค่า)', 0x10b981);
    rxMesh.position.set(2.4, 0.28, -0.8);
    bridgeGroup.add(rxMesh);

    updateBridge3DPositions();
  }

  function createResistorComponent(name, colorHex) {
    const comp = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.35, 0.8),
      new THREE.MeshStandardMaterial({ color: colorHex, metalness: 0.5, roughness: 0.4 })
    );
    box.position.set(0, 0.18, 0);
    comp.add(box);
    return comp;
  }

  function updateBridge3DPositions() {
    if (!jockeyMesh) return;
    const wireX = (jockeyPosCm - 50.0) * 0.096;
    jockeyMesh.position.x = wireX;
  }

  function recordBridgeTrial() {
    const res = calcBridge();
    const trial = {
      id: bridgeTrials.length + 1,
      rStd: rStdVal.toFixed(0),
      l1: res.l1.toFixed(1),
      l2: res.l2.toFixed(1),
      rx: res.rxMeasured.toFixed(1),
      balanced: res.isBalanced ? 'สมดุล (Null)' : 'ยังไม่สมดุล'
    };
    bridgeTrials.push(trial);
    renderBridgeTable();
  }

  function renderBridgeTable() {
    const tbody = document.getElementById('bridge-table-body');
    if (!tbody) return;
    tbody.innerHTML = bridgeTrials.map(t => `
      <tr>
        <td style="font-weight:600; text-align:center;">${t.id}</td>
        <td>${t.rStd} Ω</td>
        <td>${t.l1} cm</td>
        <td>${t.l2} cm</td>
        <td style="color:#38bdf8; font-weight:700;">${t.rx} Ω</td>
        <td><span class="status-pill ${t.balanced.includes('สมดุล') ? 'ready' : 'planned'}">${t.balanced}</span></td>
      </tr>
    `).join('');
  }

  function autoBalanceBridge() {
    // Calculate exact balance position: L1 = 100 * (Rx / (Rx + Rstd))
    const exactL1 = 100 * (rxActualVal / (rxActualVal + rStdVal));
    jockeyPosCm = Math.round(exactL1 * 10) / 10;
    updateBridge3DPositions();
    updateBridgeUI();
  }

  function updateBridgeUI() {
    const res = calcBridge();

    const sliderJockey = document.getElementById('bridge-slider-jockey');
    const valJockey = document.getElementById('bridge-val-jockey');
    const valL1 = document.getElementById('bridge-val-l1');
    const valL2 = document.getElementById('bridge-val-l2');
    const valRx = document.getElementById('bridge-val-rx');
    const valStatus = document.getElementById('bridge-val-status');

    if (sliderJockey) sliderJockey.value = jockeyPosCm;
    if (valJockey) valJockey.textContent = `${jockeyPosCm.toFixed(1)} cm`;
    if (valL1) valL1.textContent = `${res.l1.toFixed(1)} cm`;
    if (valL2) valL2.textContent = `${res.l2.toFixed(1)} cm`;
    if (valRx) valRx.textContent = `${res.rxMeasured.toFixed(1)} Ω`;

    if (valStatus) {
      if (res.isBalanced) {
        valStatus.innerHTML = '<span style="color:#10b981; font-weight:700;">⚖️ บริดจ์สมดุลสมบูรณ์! เข็มกัลวาโนมิเตอร์ชี้ศูนย์ (Null Balance)</span>';
      } else {
        const dir = res.targetDeflection > 0 ? 'เบนขวา (+)' : 'เบนซ้าย (-)';
        valStatus.innerHTML = `<span style="color:#f59e0b;">เข็มกัลวาโนมิเตอร์${dir} (คลาดเคลื่อน ${res.errorPct.toFixed(1)}%)</span>`;
      }
    }
  }

  // Register experiment
  window.PhysicsLabRegistry.registerExperiment({
    id: 'elec_wheatstone',
    domainId: 'electricity',
    title: 'วงจรบริดจ์ของวีตสตัน (Wheatstone Slide-Wire Bridge)',
    shortTitle: '⚡ วงจรบริดจ์',
    icon: '⚡',
    status: 'active',
    keyFormula: '$$\\frac{R_x}{R_{\\text{std}}} = \\frac{L_1}{100 - L_1} \\implies R_x = R_{\\text{std}}\\frac{L_1}{L_2}$$',
    description: 'ศึกษาการวัดค่าความต้านทานด้วยวิธีสมดุลศูนย์ (Null-Method) การปรับอัตราส่วนลวดสไลด์ และความไวของกัลวาโนมิเตอร์',
    features: ['Spring-Damped Galvanometer Needle', 'Auto-Balance Solver', 'Slide-Wire Interpolation', 'KaTeX Math'],
    camera: { position: [0, 5.5, 7.8], target: [0, 0.5, 0] },
    topCamera: { position: [0, 10.5, 0.1], target: [0, 0, 0] },

    init(scene) {
      initBridge3D(scene);
      this.group = bridgeGroup;
    },

    activate() {
      updateBridge3DPositions();
      updateBridgeUI();
      renderBridgeTable();
    },

    update(dt, now) {
      // Spring-damped needle dynamics
      const res = calcBridge();
      const stiffness = 85.0;
      const damping = 12.0;

      const acc = stiffness * (res.targetDeflection - currentGalvoDeflection) - damping * galvoNeedleVel;
      galvoNeedleVel += acc * dt;
      currentGalvoDeflection += galvoNeedleVel * dt;

      if (galvoNeedleMesh) {
        galvoNeedleMesh.rotation.y = currentGalvoDeflection * 0.65;
      }
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ ตัวควบคุมหัวสัมผัสสไลด์ (Jockey)</span>
            <span class="badge badge-accent">100 cm Slide-Wire</span>
          </div>

          <div class="control-row">
            <span class="control-label">ตำแหน่งแตะบนสายลวด ($L_1$)</span>
            <span id="bridge-val-jockey" class="control-val">50.0 cm</span>
          </div>
          <input type="range" id="bridge-slider-jockey" min="1" max="99" step="0.2" value="50" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">กล่องตัวต้านทานมาตรฐาน ($R_{\\text{std}}$)</span>
            <span class="control-val" id="bridge-val-rstd">100 Ω</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="tab-btn active" id="btn-rstd-100" onclick="rStdVal = 100; document.getElementById('bridge-val-rstd').textContent = '100 Ω'; updateBridgeUI();">100 Ω</button>
            <button class="tab-btn" id="btn-rstd-200" onclick="rStdVal = 200; document.getElementById('bridge-val-rstd').textContent = '200 Ω'; updateBridgeUI();">200 Ω</button>
            <button class="tab-btn" id="btn-rstd-50" onclick="rStdVal = 50; document.getElementById('bridge-val-rstd').textContent = '50 Ω'; updateBridgeUI();">50 Ω</button>
          </div>

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-autobalance-bridge" class="btn-primary" style="flex:1;">
              ⚖️ ปรับจุดสมดุลอัตโนมัติ (Auto-Null)
            </button>
            <button id="btn-record-bridge" class="btn-secondary">
              📝 บันทึกผล
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📐 สมการสะพานวีตสตัน</span>
          </div>
          <div class="formula-box">
            $$\\frac{R_x}{R_{\\text{std}}} = \\frac{R_{L1}}{R_{L2}} = \\frac{L_1}{100 - L_1}$$
            $$R_x = R_{\\text{std}} \\times \\frac{L_1}{L_2}$$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🧭 กัลวาโนมิเตอร์ตรวจวัดกระแสศูนย์ (Null Indicator)</span>
            <span class="badge badge-accent">Moving Coil</span>
          </div>
          <div id="bridge-val-status" style="margin-bottom:8px; font-size:0.82rem;"></div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:10px;">
            <div class="stat-tile">
              <span class="stat-tile-label">ความยาวลวด $L_1$</span>
              <span id="bridge-val-l1" class="stat-tile-val">50.0 cm</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ความยาวลวด $L_2$</span>
              <span id="bridge-val-l2" class="stat-tile-val">50.0 cm</span>
            </div>
            <div class="stat-tile" style="grid-column: span 2;">
              <span class="stat-tile-label">ค่าความต้านทานที่วัดได้ ($R_x$)</span>
              <span id="bridge-val-rx" class="stat-tile-val" style="color:#38bdf8; font-size:1.4rem;">100.0 Ω</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกการวัดสะพานวีตสตัน</span>
            <button class="panel-size-btn" onclick="bridgeTrials = []; renderBridgeTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>$R_{\\text{std}}$</th>
                  <th>$L_1$</th>
                  <th>$L_2$</th>
                  <th>$R_x$ ที่คำนวณได้</th>
                  <th>สถานะ</th>
                </tr>
              </thead>
              <tbody id="bridge-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI(leftEl, rightEl) {
      const slider = document.getElementById('bridge-slider-jockey');
      if (slider) {
        slider.addEventListener('input', (e) => {
          jockeyPosCm = parseFloat(e.target.value);
          updateBridge3DPositions();
          updateBridgeUI();
        });
      }

      const btnAuto = document.getElementById('btn-autobalance-bridge');
      if (btnAuto) btnAuto.addEventListener('click', autoBalanceBridge);

      const btnRec = document.getElementById('btn-record-bridge');
      if (btnRec) btnRec.addEventListener('click', recordBridgeTrial);

      updateBridgeUI();
    }
  });

})();
