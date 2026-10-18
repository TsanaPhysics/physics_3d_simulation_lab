/**
 * js/experiments/thermo-calorimeter.js
 * Domain: Thermodynamics & Matter (อุณหพลศาสตร์และสมบัติสาร)
 * Experiment: Specific Heat Capacity & Thermal Equilibrium by Calorimetry
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let calGroup = null;
  let calCanMesh, heaterMesh, sampleMesh, probeMesh, stirrerMesh;
  let steamParticles = [];

  // Experiment State
  let selectedMetal = 'copper';  // 'copper' | 'aluminum' | 'iron' | 'lead'
  const METALS = {
    copper: { name: 'ทองแดง (Copper Cu)', c_theo: 385, color: 0xb45309 },
    aluminum: { name: 'อลูมิเนียม (Aluminum Al)', c_theo: 900, color: 0x94a3b8 },
    iron: { name: 'เหล็ก (Iron Fe)', c_theo: 450, color: 0x475569 },
    lead: { name: 'ตะกั่ว (Lead Pb)', c_theo: 128, color: 0x334155 }
  };

  let metalMass = 0.100;         // kg (100 g)
  let waterMass = 0.200;         // kg (200 g)
  let calMass = 0.080;          // Aluminum calorimeter cup (80 g)
  let c_water = 4186;            // J/kg*K
  let c_cal = 900;               // J/kg*K (Aluminum)

  let tempSample = 100.0;        // Initial boiling water temp (°C)
  let tempWater = 24.0;          // Initial room temp water (°C)
  let currentTemp = 24.0;        // Current calorimeter water temp (°C)
  let finalTemp = 24.0;          // Equilibrium temperature

  let isHeating = true;
  let isTransferred = false;
  let isEquilibrating = false;
  let eqTime = 0;
  let tempHistory = [];
  let trialLogs = [];

  // Equilibrium final temp calculation:
  // Q_loss = Q_gain => m_s * c_s * (T_s - T_f) = (m_w * c_w + m_cal * c_cal) * (T_f - T_w)
  // T_f = [ m_s * c_s * T_s + (m_w * c_w + m_cal * c_cal) * T_w ] / [ m_s * c_s + m_w * c_w + m_cal * c_cal ]
  function calcEquilibrium(metalKey, ms, mw) {
    const cs = METALS[metalKey].c_theo;
    const C_total_water = mw * c_water + calMass * c_cal;
    const numerator = ms * cs * tempSample + C_total_water * tempWater;
    const denominator = ms * cs + C_total_water;
    return numerator / denominator;
  }

  // 3D Scene Initialization
  function initCalorimeter3D(scene) {
    calGroup = new THREE.Group();
    calGroup.visible = false;
    scene.add(calGroup);

    // 1. Lab Bench Base
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.15, 2.4), tableMat);
    bench.position.set(0, 0.075, 0);
    calGroup.add(bench);

    // 2. Electric Hotplate & Boiling Water Beaker (Left side x = -1.2)
    heaterMesh = new THREE.Group();
    
    // Hotplate body
    const hpBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.28, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
    );
    hpBody.position.set(0, 0.29, 0);
    heaterMesh.add(hpBody);

    // Circular heating coil disk (Red glow when heating)
    const coilDisk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.04, 24),
      new THREE.MeshStandardMaterial({ color: 0xd97706, emissive: 0xd97706, emissiveIntensity: 0.7 })
    );
    coilDisk.position.set(0, 0.44, 0);
    heaterMesh.add(coilDisk);

    // Pyrex Glass Beaker with boiling water
    const beakerGeom = new THREE.CylinderGeometry(0.38, 0.38, 0.85, 24, 1, true);
    const beakerMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.95,
      opacity: 0.9,
      transparent: true,
      roughness: 0.1
    });
    const beaker = new THREE.Mesh(beakerGeom, beakerMat);
    beaker.position.set(0, 0.88, 0);
    heaterMesh.add(beaker);

    // Water level inside beaker
    const waterGeom = new THREE.CylinderGeometry(0.36, 0.36, 0.6, 24);
    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transmission: 0.8,
      transparent: true,
      opacity: 0.75
    });
    const beakerWater = new THREE.Mesh(waterGeom, waterMat);
    beakerWater.position.set(0, 0.76, 0);
    heaterMesh.add(beakerWater);

    heaterMesh.position.set(-1.3, 0, 0);
    calGroup.add(heaterMesh);

    // 3. Insulated Double-Walled Calorimeter (Right side x = 1.0)
    calCanMesh = new THREE.Group();
    
    // Outer wooden/plastic insulating jacket
    const outerCan = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.55, 1.0, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.4 })
    );
    outerCan.position.set(0, 0.65, 0);
    calCanMesh.add(outerCan);

    // Inner Polished Aluminum Cup
    const innerCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.85, 32, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.15 })
    );
    innerCup.position.set(0, 0.72, 0);
    calCanMesh.add(innerCup);

    // Acrylic Transparent Lid
    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.57, 0.57, 0.06, 32),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, transparent: true })
    );
    lid.position.set(0, 1.18, 0);
    calCanMesh.add(lid);

    // Water in Calorimeter
    const calWater = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 0.5, 24),
      new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transmission: 0.8, transparent: true, opacity: 0.7 })
    );
    calWater.position.set(0, 0.55, 0);
    calCanMesh.add(calWater);

    // Digital Immersion Temperature Probe
    const probeWand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.9, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95 })
    );
    probeWand.position.set(0.15, 0.95, 0);
    calCanMesh.add(probeWand);

    // Stirrer Rod with top ring
    stirrerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.95, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8 })
    );
    stirrerMesh.position.set(-0.15, 1.0, 0);
    calCanMesh.add(stirrerMesh);

    calCanMesh.position.set(1.1, 0, 0);
    calGroup.add(calCanMesh);

    // 4. Metal Sample Block (Copper/Al/Fe/Pb)
    const sampleGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.28, 16);
    const sampleMat = new THREE.MeshStandardMaterial({
      color: METALS[selectedMetal].color,
      metalness: 0.85,
      roughness: 0.25
    });
    sampleMesh = new THREE.Mesh(sampleGeom, sampleMat);
    sampleMesh.position.set(-1.3, 0.65, 0); // Inside boiling water
    sampleMesh.castShadow = true;
    calGroup.add(sampleMesh);
  }

  function updateCalorimeter3D() {
    if (sampleMesh) {
      sampleMesh.material.color.setHex(METALS[selectedMetal].color);
      if (isTransferred) {
        sampleMesh.position.set(1.1, 0.45, 0); // Inside calorimeter
      } else {
        sampleMesh.position.set(-1.3, 0.65, 0); // Inside boiling beaker
      }
    }
  }

  function updateCalorimeterUI() {
    const elTemp = document.getElementById('cal-val-temp');
    const elTf = document.getElementById('cal-val-tf');
    const elCs = document.getElementById('cal-val-cs');
    const elCsTheo = document.getElementById('cal-val-cstheo');
    const elErr = document.getElementById('cal-val-err');

    if (elTemp) elTemp.textContent = `${currentTemp.toFixed(2)} °C`;
    if (elTf) elTf.textContent = `${finalTemp.toFixed(2)} °C`;

    if (isTransferred && eqTime > 2.0) {
      // Calculate experimental cs:
      // cs_exp = [ (mw * cw + mcal * ccal) * (Tf - Tw) ] / [ ms * (Ts - Tf) ]
      const C_water_cup = waterMass * c_water + calMass * c_cal;
      const Q_gain = C_water_cup * (currentTemp - tempWater);
      const cs_exp = Q_gain / (metalMass * (tempSample - currentTemp));
      const cs_theo = METALS[selectedMetal].c_theo;
      const err = Math.abs((cs_exp - cs_theo) / cs_theo) * 100;

      if (elCs) elCs.textContent = `${cs_exp.toFixed(1)} J/kg·K`;
      if (elCsTheo) elCsTheo.textContent = `${cs_theo} J/kg·K`;
      if (elErr) elErr.textContent = `${err.toFixed(2)} %`;
    }
  }

  function drawThermalCurve() {
    const canvas = document.getElementById('cal-plot-canvas');
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
    ctx.fillText('0', 30, h - 22);
    ctx.fillText('t (s)', w - 30, h - 10);
    ctx.save();
    ctx.translate(14, 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('T (°C)', 0, 0);
    ctx.restore();

    // Plot Temperature History
    if (tempHistory.length > 1) {
      const maxT = Math.max(35, finalTemp * 1.25);
      const minT = 20;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      tempHistory.forEach((pt, i) => {
        const px = 40 + (i / Math.max(1, tempHistory.length - 1)) * (w - 60);
        const py = (h - 25) - ((pt - minT) / (maxT - minT)) * (h - 45);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Horizontal dashed line for Tf
      const pyFinal = (h - 25) - ((finalTemp - minT) / (maxT - minT)) * (h - 45);
      ctx.strokeStyle = '#4ade80';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(40, pyFinal);
      ctx.lineTo(w - 10, pyFinal);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  function renderCalorimeterTable() {
    const tbody = document.getElementById('cal-table-body');
    if (!tbody) return;
    if (trialLogs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.6;">ยังไม่มีผลการวัด — กดปุ่ม "📥 จุ่มโลหะลงแคลอริมิเตอร์"</td></tr>';
      return;
    }
    tbody.innerHTML = trialLogs.map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${d.metal}</td>
        <td>${(d.ms * 1000).toFixed(0)}g / ${(d.mw * 1000).toFixed(0)}g</td>
        <td>${d.tf.toFixed(2)} °C</td>
        <td><span class="badge badge-accent">${d.cs_exp.toFixed(1)} J/kg·K</span></td>
        <td>${d.err.toFixed(2)} %</td>
      </tr>
    `).join('');
  }

  function transferMetal() {
    if (isTransferred) return;
    isTransferred = true;
    isEquilibrating = true;
    eqTime = 0;
    finalTemp = calcEquilibrium(selectedMetal, metalMass, waterMass);
    tempHistory = [currentTemp];
    updateCalorimeter3D();
  }

  function resetCalorimeter() {
    isTransferred = false;
    isEquilibrating = false;
    eqTime = 0;
    currentTemp = tempWater;
    finalTemp = tempWater;
    tempHistory = [];
    updateCalorimeter3D();
    updateCalorimeterUI();
    drawThermalCurve();
  }

  // Register in PhysicsLabRegistry
  window.PhysicsLabRegistry.registerExperiment({
    id: 'thermo_calorimeter',
    domainId: 'thermo',
    title: 'ความร้อนจำเพาะและการถ่ายโอนความร้อนด้วยแคลอริมิเตอร์ (Specific Heat Calorimetry)',
    shortTitle: '🌡️ แคลอริมิเตอร์',
    icon: '🌡️',
    status: 'active',
    keyFormula: '$$Q_{\\text{loss}} = Q_{\\text{gain}} \\implies m_s c_s (T_s - T_f) = (m_w c_w + C_{\\text{cal}})(T_f - T_w)$$',
    description: 'วัดความจุความร้อนจำเพาะของก้อนโลหะ (ทองแดง อลูมิเนียม เหล็ก ตะกั่ว) โดยการถ่ายโอนความร้อนลงในกระป๋องแคลอริมิเตอร์หุ้มฉนวนสองชั้น',
    features: ['Thermal Transfer Simulation', 'Newton Cooling Equilibration', 'Multi-Metal Library', 'Live Temperature Probe'],
    camera: { position: [0, 2.5, 4.4], target: [0, 0.7, 0] },
    topCamera: { position: [0, 5.5, 0.1], target: [0, 0.7, 0] },

    init(scene) {
      initCalorimeter3D(scene);
      this.group = calGroup;
      this.draggableInstruments = [
        { group: sampleMesh, name: 'ก้อนตัวอย่างโลหะ (Metal Sample)' }
      ];
    },

    activate() {
      updateCalorimeter3D();
      updateCalorimeterUI();
      drawThermalCurve();
      renderCalorimeterTable();
    },

    update(dt) {
      if (isEquilibrating) {
        eqTime += dt;
        // Thermal equilibration curve: T(t) = Tf + (T0 - Tf) * exp(-t / tau)
        const tau = 4.0; // Time constant in seconds
        currentTemp = finalTemp + (tempWater - finalTemp) * Math.exp(-eqTime / tau);
        tempHistory.push(currentTemp);
        if (tempHistory.length > 120) tempHistory.shift();

        // Stirrer gentle oscillation
        if (stirrerMesh) {
          stirrerMesh.position.y = 1.0 + Math.sin(eqTime * 8) * 0.05;
        }

        if (eqTime > 16.0) {
          isEquilibrating = false;
          currentTemp = finalTemp;
          // Log trial
          const C_water_cup = waterMass * c_water + calMass * c_cal;
          const Q_gain = C_water_cup * (finalTemp - tempWater);
          const cs_exp = Q_gain / (metalMass * (tempSample - finalTemp));
          const cs_theo = METALS[selectedMetal].c_theo;
          const err = Math.abs((cs_exp - cs_theo) / cs_theo) * 100;

          trialLogs.unshift({
            metal: METALS[selectedMetal].name.split(' ')[0],
            ms: metalMass,
            mw: waterMass,
            tf: finalTemp,
            cs_exp,
            err
          });
          if (trialLogs.length > 8) trialLogs.pop();
          renderCalorimeterTable();
        }

        updateCalorimeterUI();
        drawThermalCurve();
      }
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ พารามิเตอร์โลหะ & แคลอริมิเตอร์</span>
            <span class="badge badge-accent">Calorimetry</span>
          </div>

          <div class="control-row">
            <span class="control-label">ชนิดของโลหะตัวอย่าง</span>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:6px;">
            <button class="tab-btn active" id="btn-metal-copper">🟤 ทองแดง (Cu)</button>
            <button class="tab-btn" id="btn-metal-aluminum">⚪ อลูมิเนียม (Al)</button>
            <button class="tab-btn" id="btn-metal-iron">🔘 เหล็ก (Fe)</button>
            <button class="tab-btn" id="btn-metal-lead">⚫ ตะกั่ว (Pb)</button>
          </div>

          <div class="control-row" style="margin-top:12px;">
            <span class="control-label">มวลของโลหะ ($m_s$)</span>
            <span id="cal-lbl-ms" class="control-val">100 g</span>
          </div>
          <input type="range" id="cal-slider-ms" min="50" max="250" step="10" value="100" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">มวลของน้ำในกระป๋อง ($m_w$)</span>
            <span id="cal-lbl-mw" class="control-val">200 g</span>
          </div>
          <input type="range" id="cal-slider-mw" min="100" max="400" step="20" value="200" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-cal-transfer" class="btn-primary" style="flex:1;">
              📥 จุ่มโลหะลงแคลอริมิเตอร์ (Transfer)
            </button>
            <button id="btn-cal-reset" class="btn-secondary">
              🔄 รีเซ็ต (Reset)
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>🌡️ อุณหภูมิเริ่มต้นระบบ</span>
          </div>
          <div style="font-size:0.84rem; line-height:1.6; opacity:0.85;">
            • อุณหภูมิโลหะต้มเดือด ($T_s$): $\\mathbf{100.0\\,^\\circ\\text{C}}$<br/>
            • อุณหภูมิน้ำในแคลอริมิเตอร์ ($T_w$): $\\mathbf{24.0\\,^\\circ\\text{C}}$<br/>
            • ความจุความร้อนจำเพาะน้ำ ($c_w$): $4,186\\text{ J/kg}\\cdot\\text{K}$<br/>
            • ค่าคงที่กระป๋องแคลอริมิเตอร์ ($C_{\\text{cal}}$): $72\\text{ J/K}$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📊 อุณหภูมิ & ความจุความร้อนจำเพาะ</span>
            <span class="badge badge-accent">Thermal Equilibrium</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="stat-tile" style="background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3);">
              <span class="stat-tile-label">อุณหภูมิน้ำปัจจุบัน ($T$)</span>
              <span id="cal-val-temp" class="stat-tile-val" style="color:#f87171; font-size:1.35rem;">24.00 °C</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">อุณหภูมิสมดุลสุดท้าย ($T_f$)</span>
              <span id="cal-val-tf" class="stat-tile-val" style="color:#4ade80;">24.00 °C</span>
            </div>
            <div class="stat-tile" style="background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3);">
              <span class="stat-tile-label">ค่า $c_s$ จากการทดลอง</span>
              <span id="cal-val-cs" class="stat-tile-val" style="color:#38bdf8; font-size:1.25rem;">-- J/kg·K</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ค่าทฤษฎี ($c_{\\text{theo}}$)</span>
              <span id="cal-val-cstheo" class="stat-tile-val">385 J/kg·K</span>
            </div>
            <div class="stat-tile" style="grid-column: span 2;">
              <span class="stat-tile-label">เปอร์เซ็นต์ความคลาดเคลื่อน (% Error)</span>
              <span id="cal-val-err" class="stat-tile-val" style="color:#f59e0b;">-- %</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📈 กราฟการเข้าสู่สมดุลความร้อน $T(t)$</span>
            <span class="badge badge-gold">Equilibration Curve</span>
          </div>
          <canvas id="cal-plot-canvas" width="380" height="150" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกผลแคลอริมิเตอร์</span>
            <button class="panel-size-btn" onclick="trialLogs = []; renderCalorimeterTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 140px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ครั้ง</th>
                  <th>โลหะ</th>
                  <th>$m_s / m_w$</th>
                  <th>$T_f$</th>
                  <th>$c_{\\text{exp}}$</th>
                  <th>% Error</th>
                </tr>
              </thead>
              <tbody id="cal-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI() {
      const bCu = document.getElementById('btn-metal-copper');
      const bAl = document.getElementById('btn-metal-aluminum');
      const bFe = document.getElementById('btn-metal-iron');
      const bPb = document.getElementById('btn-metal-lead');

      [
        { btn: bCu, k: 'copper' },
        { btn: bAl, k: 'aluminum' },
        { btn: bFe, k: 'iron' },
        { btn: bPb, k: 'lead' }
      ].forEach(item => {
        if (item.btn) {
          item.btn.addEventListener('click', () => {
            selectedMetal = item.k;
            [bCu, bAl, bFe, bPb].forEach(b => b.classList.remove('active'));
            item.btn.classList.add('active');
            resetCalorimeter();
          });
        }
      });

      const slMs = document.getElementById('cal-slider-ms');
      if (slMs) {
        slMs.addEventListener('input', (e) => {
          metalMass = parseInt(e.target.value) / 1000;
          const lbl = document.getElementById('cal-lbl-ms');
          if (lbl) lbl.textContent = `${(metalMass * 1000).toFixed(0)} g`;
          resetCalorimeter();
        });
      }

      const slMw = document.getElementById('cal-slider-mw');
      if (slMw) {
        slMw.addEventListener('input', (e) => {
          waterMass = parseInt(e.target.value) / 1000;
          const lbl = document.getElementById('cal-lbl-mw');
          if (lbl) lbl.textContent = `${(waterMass * 1000).toFixed(0)} g`;
          resetCalorimeter();
        });
      }

      const btnTrans = document.getElementById('btn-cal-transfer');
      if (btnTrans) btnTrans.addEventListener('click', transferMetal);

      const btnReset = document.getElementById('btn-cal-reset');
      if (btnReset) btnReset.addEventListener('click', resetCalorimeter);

      updateCalorimeterUI();
      drawThermalCurve();
      renderCalorimeterTable();
    }
  });

})();
