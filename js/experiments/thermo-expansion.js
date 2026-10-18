/**
 * js/experiments/thermo-expansion.js
 * Domain: Thermodynamics & Matter (อุณหพลศาสตร์และสมบัติสาร)
 * Experiment: Linear Thermal Expansion of Metals with Dial Micrometer Indicator
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let expGroup = null;
  let bedMesh, tubeMesh, dialMesh, dialNeedleMesh, boilerMesh;

  // Experiment State
  let selectedMetal = 'brass';  // 'brass' | 'copper' | 'aluminum' | 'steel'
  const METALS = {
    brass: { name: 'ทองเหลือง (Brass)', alpha_theo: 19.0e-6, color: 0xeab308 },
    copper: { name: 'ทองแดง (Copper)', alpha_theo: 16.5e-6, color: 0xb45309 },
    aluminum: { name: 'อลูมิเนียม (Aluminum)', alpha_theo: 23.1e-6, color: 0x94a3b8 },
    steel: { name: 'เหล็กกล้า (Steel)', alpha_theo: 12.0e-6, color: 0x475569 }
  };

  let initialL = 0.600;         // Initial length L0 (m) = 600 mm
  let roomTemp = 24.0;          // Room temperature (°C)
  let currentTemp = 24.0;       // Tube temperature (°C)
  let isSteamOn = false;
  let elongation_mm = 0.0;      // ΔL in millimeters
  let dialAngle = 0.0;          // Rotation angle of needle

  // Physics calculation:
  // ΔL = α * L0 * (T - T0)
  function calcElongation(metalKey, L0, T) {
    const alpha = METALS[metalKey].alpha_theo;
    const deltaT = Math.max(0, T - roomTemp);
    const deltaL_meters = alpha * L0 * deltaT;
    return deltaL_meters * 1000; // Return in mm
  }

  // 3D Scene Initialization
  function initExpansion3D(scene) {
    expGroup = new THREE.Group();
    expGroup.visible = false;
    scene.add(expGroup);

    // 1. Heavy Cast-Iron Rigid Test Bed (Length ~ 5.4m)
    const bedGeom = new THREE.BoxGeometry(5.6, 0.22, 1.4);
    const bedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    bedMesh = new THREE.Mesh(bedGeom, bedMat);
    bedMesh.position.set(0, 0.11, 0);
    expGroup.add(bedMesh);

    // 2. Fixed End Stop Clamp (Left side x = -1.8)
    const fixedClamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.5, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
    );
    fixedClamp.position.set(-1.8, 0.36, 0);
    expGroup.add(fixedClamp);

    // 3. Hollow Metal Sample Tube (Mounted horizontally between clamps)
    const tubeGeom = new THREE.CylinderGeometry(0.045, 0.045, 3.6, 24);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: METALS[selectedMetal].color,
      metalness: 0.9,
      roughness: 0.18
    });
    tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    tubeMesh.rotation.z = Math.PI / 2;
    tubeMesh.position.set(0, 0.42, 0);
    tubeMesh.castShadow = true;
    expGroup.add(tubeMesh);

    // 4. Steam Generator Boiler (Far left x = -2.4)
    boilerMesh = new THREE.Group();
    const flask = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.35, 0.65, 24),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.85 })
    );
    flask.position.set(0, 0.35, 0);
    boilerMesh.add(flask);

    // Silicone steam delivery hose
    const hose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
    );
    hose.rotation.z = Math.PI / 2;
    hose.position.set(0.3, 0.42, 0);
    boilerMesh.add(hose);

    boilerMesh.position.set(-2.2, 0.11, 0);
    expGroup.add(boilerMesh);

    // 5. Precision Dial Micrometer Indicator Gauge (Right end x = 1.9)
    dialMesh = new THREE.Group();
    
    // Circular gauge outer housing
    const gaugeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.34, 0.14, 32),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 })
    );
    gaugeBody.rotation.x = Math.PI / 2;
    dialMesh.add(gaugeBody);

    // White dial face
    const dialFace = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
    );
    dialFace.position.set(0, 0, 0.072);
    dialMesh.add(dialFace);

    // Rotating Needle (Red pointer)
    const needleGeom = new THREE.BoxGeometry(0.015, 0.24, 0.005);
    needleGeom.translate(0, 0.1, 0.075);
    const needleMat = new THREE.MeshStandardMaterial({ color: 0xef4444 });
    dialNeedleMesh = new THREE.Mesh(needleGeom, needleMat);
    dialMesh.add(dialNeedleMesh);

    // Feeler spindle touching end of tube
    const spindle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 })
    );
    spindle.rotation.z = Math.PI / 2;
    spindle.position.set(-0.25, 0, 0);
    dialMesh.add(spindle);

    dialMesh.position.set(2.0, 0.42, 0);
    expGroup.add(dialMesh);
  }

  function updateExpansion3D() {
    if (tubeMesh) {
      tubeMesh.material.color.setHex(METALS[selectedMetal].color);
    }
    // Needle rotation: 1.0 mm elongation = 360 degrees (2pi radians)
    if (dialNeedleMesh) {
      dialNeedleMesh.rotation.z = -dialAngle;
    }
  }

  function updateExpansionUI() {
    elongation_mm = calcElongation(selectedMetal, initialL, currentTemp);
    dialAngle = (elongation_mm / 1.0) * Math.PI * 2; // 1 full turn per mm

    const elTemp = document.getElementById('exp-val-temp');
    const elDeltaL = document.getElementById('exp-val-deltal');
    const elAlphaExp = document.getElementById('exp-val-alphaexp');
    const elAlphaTheo = document.getElementById('exp-val-alphatheo');
    const elErr = document.getElementById('exp-val-err');

    if (elTemp) elTemp.textContent = `${currentTemp.toFixed(1)} °C`;
    if (elDeltaL) elDeltaL.textContent = `${elongation_mm.toFixed(3)} mm`;

    const deltaT = currentTemp - roomTemp;
    if (deltaT > 5.0) {
      const alpha_exp = (elongation_mm / 1000) / (initialL * deltaT);
      const alpha_theo = METALS[selectedMetal].alpha_theo;
      const err = Math.abs((alpha_exp - alpha_theo) / alpha_theo) * 100;

      if (elAlphaExp) elAlphaExp.textContent = `${(alpha_exp * 1e6).toFixed(2)} × 10⁻⁶ K⁻¹`;
      if (elAlphaTheo) elAlphaTheo.textContent = `${(alpha_theo * 1e6).toFixed(1)} × 10⁻⁶ K⁻¹`;
      if (elErr) elErr.textContent = `${err.toFixed(2)} %`;
    }
  }

  function drawExpansionPlot() {
    const canvas = document.getElementById('exp-plot-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(56,189,248,0.12)';
    ctx.lineWidth = 1;
    for (let x = 40; x < w; x += 35) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h - 25);
      ctx.stroke();
    }
    for (let y = 15; y < h - 25; y += 25) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40, 15);
    ctx.lineTo(40, h - 25);
    ctx.lineTo(w - 10, h - 25);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('24', 26, h - 22);
    ctx.fillText('T (°C)', w - 35, h - 10);
    ctx.save();
    ctx.translate(14, 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('ΔL (mm)', 0, 0);
    ctx.restore();

    // Plot Linear Expansion line ΔL vs T (24 to 100 °C)
    const maxDeltaL = calcElongation('aluminum', initialL, 100) * 1.25; // Aluminum expands most

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const tVal = roomTemp + (i / steps) * (100 - roomTemp);
      const dL = calcElongation(selectedMetal, initialL, tVal);
      const px = 40 + (i / steps) * (w - 60);
      const py = (h - 25) - (dL / maxDeltaL) * (h - 45);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Current State Marker
    const curPx = 40 + ((currentTemp - roomTemp) / (100 - roomTemp)) * (w - 60);
    const curPy = (h - 25) - (elongation_mm / maxDeltaL) * (h - 45);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(curPx, curPy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Register in PhysicsLabRegistry
  window.PhysicsLabRegistry.registerExperiment({
    id: 'thermo_thermal_exp',
    domainId: 'thermo',
    title: 'การขยายตัวเชิงเส้นของโลหะเมื่อได้รับความร้อน (Linear Thermal Expansion)',
    shortTitle: '🌡️ การขยายตัวเชิงเส้น',
    icon: '🌡️',
    status: 'active',
    keyFormula: '$$\\Delta L = \\alpha L_0 \\Delta T \\implies \\alpha = \\frac{\\Delta L}{L_0 (T - T_0)}$$',
    description: 'วัดการยืดตัวของท่อโลหะเมื่อผ่านไอน้ำร้อน 100°C ด้วยไดอัลเกจ (Dial Indicator) ความละเอียด 0.01 mm เพื่อหาค่าสัมประสิทธิ์การขยายตัวทางความร้อน',
    features: ['Steam Generator Dilatometer', 'Dial Indicator Micrometer Needle', 'Coefficient α Solver', 'Multi-Metal Tube Library'],
    camera: { position: [0.6, 2.2, 3.8], target: [0.6, 0.4, 0] },
    topCamera: { position: [0.6, 4.8, 0.1], target: [0.6, 0.4, 0] },

    init(scene) {
      initExpansion3D(scene);
      this.group = expGroup;
      this.draggableInstruments = [
        { group: dialMesh, name: 'ไดอัลเกจวัดการยืดตัว (Dial Indicator)' }
      ];
    },

    activate() {
      updateExpansion3D();
      updateExpansionUI();
      drawExpansionPlot();
    },

    update(dt) {
      if (isSteamOn) {
        // Temperature rises toward 100°C
        currentTemp += (100.0 - currentTemp) * (dt * 0.4);
      } else {
        // Cools down toward 24°C
        currentTemp += (roomTemp - currentTemp) * (dt * 0.25);
      }
      updateExpansion3D();
      updateExpansionUI();
      drawExpansionPlot();
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ พารามิเตอร์ท่อโลหะ & ไอน้ำร้อน</span>
            <span class="badge badge-accent">Thermal Dilatometer</span>
          </div>

          <div class="control-row">
            <span class="control-label">ชนิดท่อโลหะตัวอย่าง</span>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:6px;">
            <button class="tab-btn active" id="btn-metal-brass">🟡 ทองเหลือง (Brass)</button>
            <button class="tab-btn" id="btn-metal-copper">🟤 ทองแดง (Copper)</button>
            <button class="tab-btn" id="btn-metal-aluminum">⚪ อลูมิเนียม (Al)</button>
            <button class="tab-btn" id="btn-metal-steel">🔘 เหล็กกล้า (Steel)</button>
          </div>

          <div class="control-row" style="margin-top:12px;">
            <span class="control-label">ความยาวเริ่มต้นท่อ ($L_0$)</span>
            <span id="exp-lbl-l0" class="control-val">600 mm</span>
          </div>
          <input type="range" id="exp-slider-l0" min="400" max="800" step="20" value="600" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-exp-steam" class="btn-primary" style="flex:1;">
              💨 จ่ายไอน้ำร้อน 100°C (Steam ON)
            </button>
            <button id="btn-exp-cool" class="btn-secondary">
              ❄️ ระบายความร้อน (Cool)
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📏 มาตรวัดความละเอียดไดอัลเกจ</span>
          </div>
          <div style="font-size:0.84rem; line-height:1.6; opacity:0.85;">
            • ความละเอียดสเกล: $\\mathbf{0.01\\text{ mm/ขีด}}$<br/>
            • เข็มหมุนครบ 1 รอบ ($360^\\circ$) = การยืดตัว $\\mathbf{1.00\\text{ mm}}$<br/>
            • อุณหภูมิห้องทดลอง ($T_0$): $\\mathbf{24.0\\,^\\circ\\text{C}}$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📊 ผลการวัดการยืดตัว & สัมประสิทธิ์ α</span>
            <span class="badge badge-accent">Live Dial Telemetry</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="stat-tile" style="background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3);">
              <span class="stat-tile-label">อุณหภูมิท่อโลหะ ($T$)</span>
              <span id="exp-val-temp" class="stat-tile-val" style="color:#f87171; font-size:1.35rem;">24.0 °C</span>
            </div>
            <div class="stat-tile" style="background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3);">
              <span class="stat-tile-label">การยืดตัวเชิงเส้น ($\\Delta L$)</span>
              <span id="exp-val-deltal" class="stat-tile-val" style="color:#38bdf8; font-size:1.35rem;">0.000 mm</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">สัมประสิทธิ์จากการทดลอง ($\\alpha_{\\text{exp}}$)</span>
              <span id="exp-val-alphaexp" class="stat-tile-val" style="color:#4ade80;">-- × 10⁻⁶ K⁻¹</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">สัมประสิทธิ์ตามทฤษฎี ($\\alpha_{\\text{theo}}$)</span>
              <span id="exp-val-alphatheo" class="stat-tile-val">19.0 × 10⁻⁶ K⁻¹</span>
            </div>
            <div class="stat-tile" style="grid-column: span 2;">
              <span class="stat-tile-label">เปอร์เซ็นต์ความคลาดเคลื่อน (% Error)</span>
              <span id="exp-val-err" class="stat-tile-val" style="color:#f59e0b;">-- %</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📈 กราฟการยืดตัวตามอุณหภูมิ $\\Delta L$ กับ $T$</span>
            <span class="badge badge-gold">Linear Slope = α L0</span>
          </div>
          <canvas id="exp-plot-canvas" width="380" height="150" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
        </div>
      `;
    },

    mountUI() {
      const bBrass = document.getElementById('btn-metal-brass');
      const bCu = document.getElementById('btn-metal-copper');
      const bAl = document.getElementById('btn-metal-aluminum');
      const bSteel = document.getElementById('btn-metal-steel');

      [
        { btn: bBrass, k: 'brass' },
        { btn: bCu, k: 'copper' },
        { btn: bAl, k: 'aluminum' },
        { btn: bSteel, k: 'steel' }
      ].forEach(item => {
        if (item.btn) {
          item.btn.addEventListener('click', () => {
            selectedMetal = item.k;
            [bBrass, bCu, bAl, bSteel].forEach(b => b.classList.remove('active'));
            item.btn.classList.add('active');
            updateExpansion3D();
            updateExpansionUI();
            drawExpansionPlot();
          });
        }
      });

      const slL0 = document.getElementById('exp-slider-l0');
      if (slL0) {
        slL0.addEventListener('input', (e) => {
          initialL = parseInt(e.target.value) / 1000;
          const lbl = document.getElementById('exp-lbl-l0');
          if (lbl) lbl.textContent = `${(initialL * 1000).toFixed(0)} mm`;
          updateExpansionUI();
          drawExpansionPlot();
        });
      }

      const btnSteam = document.getElementById('btn-exp-steam');
      if (btnSteam) {
        btnSteam.addEventListener('click', () => {
          isSteamOn = true;
          btnSteam.classList.add('active');
          const btnCool = document.getElementById('btn-exp-cool');
          if (btnCool) btnCool.classList.remove('active');
        });
      }

      const btnCool = document.getElementById('btn-exp-cool');
      if (btnCool) {
        btnCool.addEventListener('click', () => {
          isSteamOn = false;
          btnCool.classList.add('active');
          const btnSteam = document.getElementById('btn-exp-steam');
          if (btnSteam) btnSteam.classList.remove('active');
        });
      }

      updateExpansion3D();
      updateExpansionUI();
      drawExpansionPlot();
    }
  });

})();
