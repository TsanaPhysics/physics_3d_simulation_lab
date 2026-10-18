/**
 * js/experiments/thermo-gas.js
 * Domain: Thermodynamics & Matter (อุณหพลศาสตร์และสสาร)
 * Experiment: Ideal Gas Law, Maxwell-Boltzmann Kinetic Particles & Absolute Zero
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let thermoGroup = null;
  let cylinderGlass, pistonMesh, heaterMesh, pressureGaugeGroup, needleMesh;
  let gasParticles = [];
  let graphCanvas, graphCtx;

  // Gas State Variables
  let gasVolumeMl = 50.0;      // Volume V (mL), 20 to 100 mL
  let gasTempC = 25.0;         // Temperature T (deg C), -50 to +150 deg C
  let gasMoles = 0.0024;       // Moles n (mol)
  const R_CONST = 8.314;       // J / (mol * K)

  let thermoTrials = [];

  function calcGasPhysics() {
    const tempK = gasTempC + 273.15;
    // V in m^3: 1 mL = 1e-6 m^3
    const volumeM3 = gasVolumeMl * 1e-6;

    // Ideal gas law: P = nRT / V (Pascals)
    const pressurePa = (gasMoles * R_CONST * tempK) / volumeM3;
    const pressureKPa = pressurePa / 1000;
    const pressureAtm = pressurePa / 101325;

    // RMS thermal speed of N2 molecules: v_rms = sqrt(3RT / M), M = 0.028 kg/mol
    const vRms = Math.sqrt((3 * R_CONST * tempK) / 0.028);

    return {
      tempK,
      volumeM3,
      pressurePa,
      pressureKPa,
      pressureAtm,
      vRms
    };
  }

  // 3D Scene Initialization
  function initThermo3D(scene) {
    thermoGroup = new THREE.Group();
    thermoGroup.visible = false;
    scene.add(thermoGroup);

    // 1. Lab Bench Stand
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(6.5, 0.22, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    stand.position.set(0, 0.11, 0);
    stand.receiveShadow = true;
    thermoGroup.add(stand);

    // 2. Electric Heating Mantle Base
    heaterMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.7, 0.7, 32),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.6, roughness: 0.3 })
    );
    heaterMesh.position.set(0, 0.55, 0);
    thermoGroup.add(heaterMesh);

    // 3. Borosilicate Glass Cylinder (Height = 5.0 units, Radius = 1.2 units)
    const cylinderHeight = 5.0;
    const cylinderRadius = 1.2;
    cylinderGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, 32, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.32,
        roughness: 0.1,
        transmission: 0.88,
        ior: 1.48
      })
    );
    cylinderGlass.position.set(0, 0.9 + cylinderHeight / 2, 0);
    thermoGroup.add(cylinderGlass);

    // Metric Graduation Scale Texture
    const scaleCanvas = document.createElement('canvas');
    scaleCanvas.width = 128; scaleCanvas.height = 512;
    const sCtx = scaleCanvas.getContext('2d');
    sCtx.fillStyle = 'rgba(2, 6, 23, 0.2)'; sCtx.fillRect(0, 0, 128, 512);
    sCtx.fillStyle = '#f8fafc'; sCtx.font = 'bold 22px monospace';
    for (let ml = 0; ml <= 100; ml += 10) {
      const y = 512 - (ml / 100) * 480 - 16;
      sCtx.fillRect(0, y, ml % 20 === 0 ? 32 : 18, 2);
      if (ml % 20 === 0) sCtx.fillText(`${ml}`, 40, y + 8);
    }
    const scaleMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, cylinderHeight * 0.95),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(scaleCanvas), transparent: true })
    );
    scaleMesh.position.set(0, 0.9 + cylinderHeight / 2, cylinderRadius + 0.01);
    thermoGroup.add(scaleMesh);

    // 4. Airtight Movable Piston
    pistonMesh = new THREE.Group();
    pistonMesh.userData.isDraggable = true;
    pistonMesh.userData.instrumentName = 'ลูกสูบแก๊ส (Gas Piston)';

    const pistonHead = new THREE.Mesh(
      new THREE.CylinderGeometry(cylinderRadius - 0.02, cylinderRadius - 0.02, 0.32, 32),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.2 })
    );
    pistonHead.position.set(0, 0.16, 0);
    pistonHead.userData.draggableRoot = pistonMesh;
    pistonMesh.add(pistonHead);

    const pistonRod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3.2, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
    );
    pistonRod.position.set(0, 1.8, 0);
    pistonRod.userData.draggableRoot = pistonMesh;
    pistonMesh.add(pistonRod);

    const pistonHandle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 })
    );
    pistonHandle.rotation.z = Math.PI / 2;
    pistonHandle.position.set(0, 3.4, 0);
    pistonHandle.userData.draggableRoot = pistonMesh;
    pistonMesh.add(pistonHandle);

    thermoGroup.add(pistonMesh);

    // 5. 3D Kinetic Gas Molecule Particles
    const pGeom = new THREE.SphereGeometry(0.065, 12, 12);
    const pMat = new THREE.MeshStandardMaterial({
      color: 0x00f5ff,
      emissive: 0x00f5ff,
      emissiveIntensity: 0.6
    });

    for (let i = 0; i < 40; i++) {
      const p = new THREE.Mesh(pGeom, pMat);
      p.userData = {
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        vz: (Math.random() - 0.5) * 2
      };
      thermoGroup.add(p);
      gasParticles.push(p);
    }

    // 6. Precision Pressure Gauge (Bourdon Gauge)
    pressureGaugeGroup = new THREE.Group();
    const gBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.8, 0.35, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    gBody.position.set(2.4, 3.0, 0);
    pressureGaugeGroup.add(gBody);

    const dialCanvas = document.createElement('canvas');
    dialCanvas.width = 256; dialCanvas.height = 256;
    const dCtx = dialCanvas.getContext('2d');
    dCtx.fillStyle = '#f8fafc'; dCtx.fillRect(0, 0, 256, 256);
    dCtx.strokeStyle = '#0284c7'; dCtx.lineWidth = 3;
    dCtx.beginPath(); dCtx.arc(128, 128, 90, 0, Math.PI * 2); dCtx.stroke();
    dCtx.fillStyle = '#0f172a'; dCtx.font = 'bold 20px monospace'; dCtx.textAlign = 'center';
    dCtx.fillText('PRESSURE', 128, 90);
    dCtx.fillText('kPa / atm', 128, 175);

    const dialMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 1.3),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(dialCanvas) })
    );
    dialMesh.position.set(2.4, 3.0, 0.18);
    pressureGaugeGroup.add(dialMesh);

    // Rotating Gauge Needle
    needleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.5, 0.01),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    needleMesh.position.set(2.4, 3.0, 0.2);
    pressureGaugeGroup.add(needleMesh);
    thermoGroup.add(pressureGaugeGroup);

    updateThermoPositions3D();
  }

  function updateThermoPositions3D() {
    if (!pistonMesh) return;
    const cylinderHeight = 5.0;
    const pistonY = 0.9 + (gasVolumeMl / 100) * (cylinderHeight * 0.95);
    pistonMesh.position.set(0, pistonY, 0);

    // Update heater glow based on temperature
    if (heaterMesh) {
      if (gasTempC > 60) {
        heaterMesh.material.color.setHex(0xef4444);
      } else if (gasTempC < 0) {
        heaterMesh.material.color.setHex(0x0284c7);
      } else {
        heaterMesh.material.color.setHex(0xd97706);
      }
    }
  }

  function drawThermoGraph() {
    if (!graphCanvas || !graphCtx) {
      graphCanvas = document.getElementById('thermo-graph-canvas');
      if (graphCanvas) graphCtx = graphCanvas.getContext('2d');
    }
    if (!graphCtx) return;

    const w = graphCanvas.width;
    const h = graphCanvas.height;
    graphCtx.fillStyle = '#020617';
    graphCtx.fillRect(0, 0, w, h);

    // Grid lines
    graphCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    graphCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      graphCtx.beginPath(); graphCtx.moveTo(x, 0); graphCtx.lineTo(x, h); graphCtx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
      graphCtx.beginPath(); graphCtx.moveTo(0, y); graphCtx.lineTo(w, y); graphCtx.stroke();
    }

    // Axes: P vs T(°C), x-axis goes from -300 °C to +150 °C
    const zeroX = (300 / 450) * w; // Location of 0 °C
    const absZeroX = (26.85 / 450) * w; // Location of -273.15 °C
    const botY = h - 20;

    graphCtx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    graphCtx.beginPath();
    graphCtx.moveTo(0, botY); graphCtx.lineTo(w, botY); // X axis
    graphCtx.moveTo(zeroX, 0); graphCtx.lineTo(zeroX, h); // Y axis (0 °C)
    graphCtx.stroke();

    // Absolute zero marker
    graphCtx.strokeStyle = '#ef4444';
    graphCtx.setLineDash([4, 4]);
    graphCtx.beginPath();
    graphCtx.moveTo(absZeroX, 0); graphCtx.lineTo(absZeroX, botY);
    graphCtx.stroke();
    graphCtx.setLineDash([]);
    graphCtx.fillStyle = '#ef4444';
    graphCtx.font = '10px monospace';
    graphCtx.fillText('-273.15°C', absZeroX + 4, 18);

    // Current state point
    const res = calcGasPhysics();
    const curX = ((gasTempC + 300) / 450) * w;
    const curY = botY - (res.pressureKPa / 300) * (botY - 20);

    // Draw theoretical linear extrapolation line: P = m * (T + 273.15)
    graphCtx.strokeStyle = '#38bdf8';
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();
    graphCtx.moveTo(absZeroX, botY);
    const topX = ((150 + 300) / 450) * w;
    const topP = (gasMoles * R_CONST * (150 + 273.15)) / (gasVolumeMl * 1e-6) / 1000;
    const topY = botY - (topP / 300) * (botY - 20);
    graphCtx.lineTo(topX, topY);
    graphCtx.stroke();

    // Plot current point
    graphCtx.fillStyle = '#f59e0b';
    graphCtx.beginPath();
    graphCtx.arc(curX, curY, 6, 0, Math.PI * 2);
    graphCtx.fill();
  }

  function recordThermoTrial() {
    const res = calcGasPhysics();
    const trial = {
      id: thermoTrials.length + 1,
      v: gasVolumeMl.toFixed(1),
      tC: gasTempC.toFixed(1),
      tK: res.tempK.toFixed(1),
      pKPa: res.pressureKPa.toFixed(1),
      pAtm: res.pressureAtm.toFixed(2)
    };
    thermoTrials.push(trial);
    renderThermoTable();
  }

  function renderThermoTable() {
    const tbody = document.getElementById('thermo-table-body');
    if (!tbody) return;
    tbody.innerHTML = thermoTrials.map(t => `
      <tr>
        <td style="font-weight:600; text-align:center;">${t.id}</td>
        <td>${t.v} mL</td>
        <td>${t.tC} °C</td>
        <td>${t.tK} K</td>
        <td style="color:#38bdf8; font-weight:700;">${t.pKPa} kPa</td>
        <td>${t.pAtm} atm</td>
      </tr>
    `).join('');
  }

  function updateThermoUI() {
    const res = calcGasPhysics();

    const valVol = document.getElementById('thermo-val-vol');
    const valTemp = document.getElementById('thermo-val-temp');
    const valP = document.getElementById('thermo-val-p');
    const valVRms = document.getElementById('thermo-val-vrms');
    const sliderVol = document.getElementById('thermo-slider-vol');
    const sliderTemp = document.getElementById('thermo-slider-temp');

    if (valVol) valVol.textContent = `${gasVolumeMl.toFixed(1)} mL`;
    if (valTemp) valTemp.textContent = `${gasTempC.toFixed(1)} °C (${res.tempK.toFixed(1)} K)`;
    if (valP) valP.textContent = `${res.pressureKPa.toFixed(1)} kPa (${res.pressureAtm.toFixed(2)} atm)`;
    if (valVRms) valVRms.textContent = `${res.vRms.toFixed(0)} m/s`;
    if (sliderVol) sliderVol.value = gasVolumeMl;
    if (sliderTemp) sliderTemp.value = gasTempC;

    // Rotate gauge needle: 0 kPa = -2.2 rad, 250 kPa = +2.2 rad
    if (needleMesh) {
      const frac = Math.min(1.0, res.pressureKPa / 250);
      needleMesh.rotation.z = -2.2 + frac * 4.4;
    }
  }

  // Register experiment
  window.PhysicsLabRegistry.registerExperiment({
    id: 'thermo_ideal_gas',
    domainId: 'thermo',
    title: 'กฎของแก๊สอุดมคติและอุณหภูมิศูนย์สัมบูรณ์ (Ideal Gas Law & Absolute Zero)',
    shortTitle: '🌡️ กฎของแก๊ส',
    icon: '🌡️',
    status: 'active',
    keyFormula: '$$PV = nRT \\implies P = \\left(\\frac{nR}{V}\\right)(T_C + 273.15)$$',
    description: 'ศึกษากฎของบอยล์ ชาร์ล และเกย์-ลูสแซก การเคลื่อนที่ของโมเลกุลแก๊สตามทฤษฎีจลน์ และการต่อกราฟหาจุดศูนย์สัมบูรณ์ (-273.15 °C)',
    features: ['3D Kinetic Gas Particles', 'Movable Airtight Piston', 'Bourdon Pressure Gauge', 'Absolute Zero Regression'],
    camera: { position: [0.2, 4.8, 7.8], target: [0, 2.5, 0] },
    topCamera: { position: [0, 9.8, 0.2], target: [0, 2.0, 0] },

    init(scene) {
      initThermo3D(scene);
      this.group = thermoGroup;
      this.draggableInstruments = [
        { group: pistonMesh, name: 'ลูกสูบแก๊ส (Gas Piston)' }
      ];
    },

    activate() {
      updateThermoPositions3D();
      updateThermoUI();
      renderThermoTable();
    },

    update(dt, now) {
      const res = calcGasPhysics();
      const speedScale = (res.vRms / 510) * 0.08;
      const maxY = 0.9 + (gasVolumeMl / 100) * 4.75;
      const minY = 0.95;
      const maxR = 1.1;

      // Animate kinetic gas molecules bouncing inside cylinder
      gasParticles.forEach(p => {
        p.position.x += p.userData.vx * speedScale;
        p.position.y += p.userData.vy * speedScale;
        p.position.z += p.userData.vz * speedScale;

        // Radial boundary collision
        const r = Math.sqrt(p.position.x * p.position.x + p.position.z * p.position.z);
        if (r > maxR) {
          p.userData.vx *= -1;
          p.userData.vz *= -1;
        }
        // Top and bottom boundary collision
        if (p.position.y > maxY || p.position.y < minY) {
          p.userData.vy *= -1;
          p.position.y = Math.max(minY, Math.min(maxY, p.position.y));
        }
      });

      drawThermoGraph();
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ ตัวควบคุมสภาวะแก๊ส ($P, V, T$)</span>
            <span class="badge badge-accent">Ideal Gas</span>
          </div>

          <div class="control-row">
            <span class="control-label">ปริมาตรกระบอกสูบ ($V$)</span>
            <span id="thermo-val-vol" class="control-val">50.0 mL</span>
          </div>
          <input type="range" id="thermo-slider-vol" min="20" max="95" step="1" value="50" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">อุณหภูมิความร้อน ($T$)</span>
            <span id="thermo-val-temp" class="control-val">25.0 °C</span>
          </div>
          <input type="range" id="thermo-slider-temp" min="-50" max="150" step="1" value="25" class="lab-slider" />

          <div style="display:flex; gap:6px; margin-top:14px;">
            <button class="tab-btn" id="btn-mode-isothermal" title="อุณหภูมิคงที่ กฎของบอยล์">Boyle (T คงที่)</button>
            <button class="tab-btn active" id="btn-mode-isochoric" title="ปริมาตรคงที่ กฎของเกย์-ลูสแซก">Gay-Lussac (V คงที่)</button>
            <button class="tab-btn" id="btn-mode-charles" title="ความดันคงที่ กฎของชาร์ล">Charles (P คงที่)</button>
          </div>

          <button id="btn-record-thermo" class="btn-secondary" style="width:100%; margin-top:10px;">
            📝 บันทึกข้อมูลสภาวะแก๊ส
          </button>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📐 สมการแก๊สอุดมคติ & ทฤษฎีจลน์</span>
          </div>
          <div class="formula-box">
            $$PV = nRT = nR(T_C + 273.15)$$
            $$v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}, \\quad P \\to 0 \\implies T_0 = -273.15^\\circ\\text{C}$$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📈 กราฟการต่อจุดหาศูนย์สัมบูรณ์ ($P$ vs $T$)</span>
            <span class="badge badge-accent">Absolute Zero</span>
          </div>
          <canvas id="thermo-graph-canvas" width="380" height="135" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:10px;">
            <div class="stat-tile">
              <span class="stat-tile-label">ความดันแก๊ส ($P$)</span>
              <span id="thermo-val-p" class="stat-tile-val" style="color:#38bdf8;">101.3 kPa</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ความเร็วเฉลี่ยโมเลกุล ($v_{\\text{rms}}$)</span>
              <span id="thermo-val-vrms" class="stat-tile-val">515 m/s</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกการวัดสภาวะแก๊ส</span>
            <button class="panel-size-btn" onclick="thermoTrials = []; renderThermoTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>$V$ (mL)</th>
                  <th>$T$ (°C)</th>
                  <th>$T$ (K)</th>
                  <th>ความดัน $P$</th>
                  <th>$P$ (atm)</th>
                </tr>
              </thead>
              <tbody id="thermo-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI(leftEl, rightEl) {
      const sliderVol = document.getElementById('thermo-slider-vol');
      const sliderTemp = document.getElementById('thermo-slider-temp');

      if (sliderVol) {
        sliderVol.addEventListener('input', (e) => {
          gasVolumeMl = parseFloat(e.target.value);
          updateThermoPositions3D();
          updateThermoUI();
        });
      }

      if (sliderTemp) {
        sliderTemp.addEventListener('input', (e) => {
          gasTempC = parseFloat(e.target.value);
          updateThermoPositions3D();
          updateThermoUI();
        });
      }

      const btnRec = document.getElementById('btn-record-thermo');
      if (btnRec) btnRec.addEventListener('click', recordThermoTrial);

      updateThermoUI();
    }
  });

})();
