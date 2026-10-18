/**
 * js/experiments/modern-photoelectric.js
 * Domain: Modern & Quantum Physics (ฟิสิกส์ยุคใหม่และควอนตัม)
 * Experiment: Photoelectric Effect, Stopping Potential & Planck's Constant h
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let modernGroup = null;
  let phototubeMesh, lightSourceMesh, lightBeamMesh, ammeterGroup, needleMesh;
  let photoelectrons = [];
  let graphCanvas, graphCtx;

  // Physical Constants
  const H_PLANCK = 6.62607e-34;   // J * s
  const E_CHARGE = 1.60218e-19;   // Coulombs
  const C_LIGHT = 2.99792e8;      // m/s
  const H_OVER_E = H_PLANCK / E_CHARGE; // ~ 4.13567e-15 eV * s

  // Experiment Parameters
  let currentWavelengthNm = 405.0; // Violet 405 nm
  let retardingVoltage = 0.0;     // Volts (-3.0 to +3.0)
  let lightIntensityPct = 80.0;   // 10 to 100%
  let workFunctionEv = 2.14;      // Cesium = 2.14 eV
  let cathodeName = 'ซีเซียม (Cs, 2.14 eV)';

  let photoTrials = [];

  const SPECTRAL_LINES = [
    { name: 'UV (254 nm)', lambdaNm: 254.0, colorHex: 0x9333ea, hexStr: '#9333ea' },
    { name: 'UV (365 nm)', lambdaNm: 365.0, colorHex: 0x8b5cf6, hexStr: '#8b5cf6' },
    { name: 'ม่วง (405 nm)', lambdaNm: 405.0, colorHex: 0x6366f1, hexStr: '#6366f1' },
    { name: 'น้ำเงิน (436 nm)', lambdaNm: 436.0, colorHex: 0x0284c7, hexStr: '#0284c7' },
    { name: 'เขียว (546 nm)', lambdaNm: 546.0, colorHex: 0x10b981, hexStr: '#10b981' },
    { name: 'เหลือง (577 nm)', lambdaNm: 577.0, colorHex: 0xf59e0b, hexStr: '#f59e0b' },
    { name: 'แดง (650 nm)', lambdaNm: 650.0, colorHex: 0xef4444, hexStr: '#ef4444' }
  ];

  function calcPhotoelectric() {
    const lambdaM = currentWavelengthNm * 1e-9;
    const frequencyHz = C_LIGHT / lambdaM;
    const photonEnergyJ = H_PLANCK * frequencyHz;
    const photonEnergyEv = photonEnergyJ / E_CHARGE;

    // Stopping potential: V_stop = (hf - W0) / e
    let vStop = photonEnergyEv - workFunctionEv;
    const canEmit = vStop > 0;
    if (!canEmit) vStop = 0;

    // Photocurrent calculation
    let currentMicroA = 0;
    if (canEmit) {
      if (retardingVoltage >= vStop) {
        currentMicroA = 0; // Cut off!
      } else {
        // Linear drop off near V_stop, saturation at accelerating voltage
        const diff = vStop - retardingVoltage;
        const satCurrent = (lightIntensityPct / 100) * 45.0; // Max 45 uA
        currentMicroA = Math.min(satCurrent, (diff / vStop) * satCurrent);
      }
    }

    return {
      frequencyHz,
      photonEnergyEv,
      vStop,
      canEmit,
      currentMicroA
    };
  }

  // 3D Scene Initialization
  function initPhotoelectric3D(scene) {
    modernGroup = new THREE.Group();
    modernGroup.visible = false;
    scene.add(modernGroup);

    // 1. Lab Bench Stand
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.22, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.3 })
    );
    stand.position.set(0, 0.11, 0);
    stand.receiveShadow = true;
    modernGroup.add(stand);

    // 2. Quartz Envelope Phototube (Center)
    phototubeMesh = new THREE.Group();
    const glassBulb = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 32, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0x93c5fd,
        transparent: true,
        opacity: 0.28,
        roughness: 0.08,
        transmission: 0.92,
        ior: 1.54
      })
    );
    glassBulb.position.set(0, 1.8, 0);
    phototubeMesh.add(glassBulb);

    // Curved Metal Cathode (Emitter)
    const cathodeGeom = new THREE.CylinderGeometry(0.85, 0.85, 1.4, 24, 1, true, 0, Math.PI);
    const cathodeMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const cathode = new THREE.Mesh(cathodeGeom, cathodeMat);
    cathode.rotation.y = Math.PI / 2;
    cathode.position.set(-0.4, 1.8, 0);
    phototubeMesh.add(cathode);

    // Central Wire Anode (Collector)
    const anodeGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.6, 16);
    const anodeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });
    const anode = new THREE.Mesh(anodeGeom, anodeMat);
    anode.position.set(0.4, 1.8, 0);
    phototubeMesh.add(anode);

    modernGroup.add(phototubeMesh);

    // 3. Monochromatic Spectral Light Source (Left)
    lightSourceMesh = new THREE.Group();
    const lampHousing = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.3 })
    );
    lampHousing.position.set(-3.2, 1.8, 0);
    lightSourceMesh.add(lampHousing);

    const lampLens = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24),
      new THREE.MeshBasicMaterial({ color: 0x6366f1 })
    );
    lampLens.rotation.z = Math.PI / 2;
    lampLens.position.set(-2.25, 1.8, 0);
    lightSourceMesh.add(lampLens);

    // Light Beam
    const beamGeom = new THREE.ConeGeometry(0.65, 2.0, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    lightBeamMesh = new THREE.Mesh(beamGeom, beamMat);
    lightBeamMesh.rotation.z = -Math.PI / 2;
    lightBeamMesh.position.set(-1.25, 1.8, 0);
    lightSourceMesh.add(lightBeamMesh);

    modernGroup.add(lightSourceMesh);

    // 4. Photoelectron Particles inside Phototube
    const peGeom = new THREE.SphereGeometry(0.04, 8, 8);
    const peMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    for (let i = 0; i < 25; i++) {
      const pe = new THREE.Mesh(peGeom, peMat);
      pe.position.set(-0.4, 1.8 + (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.6);
      pe.userData = {
        speed: 0.04 + Math.random() * 0.06,
        t: Math.random()
      };
      phototubeMesh.add(pe);
      photoelectrons.push(pe);
    }

    // 5. Sensitive Micro-Ammeter
    ammeterGroup = new THREE.Group();
    const mCase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.9, 0.45, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    mCase.position.set(2.4, 0.35, 0);
    ammeterGroup.add(mCase);

    const mCanvas = document.createElement('canvas');
    mCanvas.width = 256; mCanvas.height = 256;
    const mCtx = mCanvas.getContext('2d');
    mCtx.fillStyle = '#f8fafc'; mCtx.fillRect(0, 0, 256, 256);
    mCtx.strokeStyle = '#0284c7'; mCtx.lineWidth = 3;
    mCtx.beginPath(); mCtx.arc(128, 180, 100, Math.PI * 1.2, Math.PI * 1.8); mCtx.stroke();
    mCtx.fillStyle = '#0f172a'; mCtx.font = 'bold 22px monospace'; mCtx.textAlign = 'center';
    mCtx.fillText('MICRO-AMMETER', 128, 100);
    mCtx.fillText('0   20   50 μA', 128, 150);

    const mDial = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(mCanvas) })
    );
    mDial.rotation.x = -Math.PI / 2;
    mDial.position.set(2.4, 0.58, 0);
    ammeterGroup.add(mDial);

    needleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.02, 0.75),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    needleMesh.position.set(2.4, 0.6, 0);
    ammeterGroup.add(needleMesh);
    modernGroup.add(ammeterGroup);

    updatePhotoelectric3D();
  }

  function updatePhotoelectric3D() {
    if (!lightBeamMesh) return;
    const curLine = SPECTRAL_LINES.find(l => Math.abs(l.lambdaNm - currentWavelengthNm) < 2) || SPECTRAL_LINES[2];
    lightBeamMesh.material.color.setHex(curLine.colorHex);
  }

  function drawPhotoelectricGraph() {
    if (!graphCanvas || !graphCtx) {
      graphCanvas = document.getElementById('modern-graph-canvas');
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

    // Axes: V_stop (V) vs Frequency f (x 10^14 Hz)
    // f from 4.0e14 to 12.0e14 Hz, V_stop from 0 to 3.0 V
    const botY = h - 20;
    const leftX = 35;

    graphCtx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    graphCtx.beginPath();
    graphCtx.moveTo(leftX, botY); graphCtx.lineTo(w, botY); // X axis
    graphCtx.moveTo(leftX, 0); graphCtx.lineTo(leftX, botY); // Y axis
    graphCtx.stroke();

    graphCtx.fillStyle = '#94a3b8';
    graphCtx.font = '10px monospace';
    graphCtx.fillText('f (×10¹⁴ Hz)', w - 75, botY + 16);
    graphCtx.fillText('V_stop (V)', 5, 14);

    // Theoretical line: V_stop = (h/e) * f - W0/e
    // Threshold frequency f0 = W0 / h
    const f0 = (workFunctionEv * E_CHARGE) / H_PLANCK;
    const fMin = 4.0e14;
    const fMax = 12.0e14;

    const xFromF = (f) => leftX + ((f - fMin) / (fMax - fMin)) * (w - leftX - 10);
    const yFromV = (v) => botY - (v / 3.0) * (botY - 15);

    graphCtx.strokeStyle = '#38bdf8';
    graphCtx.lineWidth = 2;
    graphCtx.beginPath();
    const x0 = xFromF(f0);
    graphCtx.moveTo(x0, botY);
    const xEnd = xFromF(fMax);
    const vMax = H_OVER_E * fMax - workFunctionEv;
    graphCtx.lineTo(xEnd, yFromV(vMax));
    graphCtx.stroke();

    // Plot all recorded points
    photoTrials.forEach(t => {
      const px = xFromF(t.fHz);
      const py = yFromV(t.vStop);
      if (px >= leftX && py <= botY) {
        graphCtx.fillStyle = '#10b981';
        graphCtx.beginPath();
        graphCtx.arc(px, py, 4.5, 0, Math.PI * 2);
        graphCtx.fill();
      }
    });

    // Plot current state
    const res = calcPhotoelectric();
    const curX = xFromF(res.frequencyHz);
    const curY = yFromV(res.vStop);
    if (curX >= leftX && curY <= botY) {
      graphCtx.fillStyle = '#f59e0b';
      graphCtx.beginPath();
      graphCtx.arc(curX, curY, 6, 0, Math.PI * 2);
      graphCtx.fill();
    }
  }

  function autoFindStoppingPotential() {
    const res = calcPhotoelectric();
    retardingVoltage = Math.round(res.vStop * 100) / 100;
    updatePhotoelectricUI();
  }

  function recordPhotoTrial() {
    const res = calcPhotoelectric();
    const trial = {
      id: photoTrials.length + 1,
      lambda: currentWavelengthNm.toFixed(0),
      fHz: res.frequencyHz,
      f14: (res.frequencyHz / 1e14).toFixed(2),
      ePhoton: res.photonEnergyEv.toFixed(2),
      vStop: res.vStop.toFixed(2),
      hExp: (res.frequencyHz > 0 && res.vStop > 0) ? (((res.vStop + workFunctionEv) * E_CHARGE) / res.frequencyHz).toExponential(3) : '-'
    };
    photoTrials.push(trial);
    renderPhotoTable();
  }

  function renderPhotoTable() {
    const tbody = document.getElementById('photo-table-body');
    if (!tbody) return;
    tbody.innerHTML = photoTrials.map(t => `
      <tr>
        <td style="font-weight:600; text-align:center;">${t.id}</td>
        <td>${t.lambda} nm</td>
        <td>${t.f14}</td>
        <td>${t.ePhoton} eV</td>
        <td style="color:#38bdf8; font-weight:700;">${t.vStop} V</td>
        <td>${t.hExp}</td>
      </tr>
    `).join('');
  }

  function updatePhotoelectricUI() {
    const res = calcPhotoelectric();

    const valLambda = document.getElementById('photo-val-lambda');
    const valV = document.getElementById('photo-val-v');
    const valCurrent = document.getElementById('photo-val-current');
    const valVStop = document.getElementById('photo-val-vstop');
    const sliderV = document.getElementById('photo-slider-v');
    const valStatus = document.getElementById('photo-val-status');

    if (valLambda) valLambda.textContent = `${currentWavelengthNm.toFixed(0)} nm (${(res.frequencyHz / 1e14).toFixed(2)} × 10¹⁴ Hz)`;
    if (valV) valV.textContent = `${retardingVoltage.toFixed(2)} V`;
    if (valCurrent) valCurrent.textContent = `${res.currentMicroA.toFixed(1)} μA`;
    if (valVStop) valVStop.textContent = `${res.vStop.toFixed(2)} V`;
    if (sliderV) sliderV.value = retardingVoltage;

    if (valStatus) {
      if (!res.canEmit) {
        valStatus.innerHTML = '<span style="color:#ef4444;">❌ พลังงานโฟตอนต่ำกว่าฟังก์ชันงาน ($hf < W_0$) ไม่เกิดโฟโตอิเล็กตรอน</span>';
      } else if (res.currentMicroA <= 0.05) {
        valStatus.innerHTML = '<span style="color:#10b981; font-weight:700;">🎯 กระแสโฟโตอิเล็กตรอนเป็นศูนย์ (ถึงจุดหยุดยั้ง $V \\ge V_{\\text{stop}}$)</span>';
      } else {
        valStatus.innerHTML = `<span style="color:#38bdf8;">⚡ โฟโตอิเล็กตรอนวิ่งชนขั้วแอโนด เกิดกระแส ${res.currentMicroA.toFixed(1)} μA</span>`;
      }
    }

    // Micro-ammeter needle deflection
    if (needleMesh) {
      const frac = Math.min(1.0, res.currentMicroA / 50.0);
      needleMesh.rotation.y = -0.55 + frac * 1.1;
    }
  }

  // Register experiment
  window.PhysicsLabRegistry.registerExperiment({
    id: 'modern_photoelectric',
    domainId: 'modern',
    title: 'ปรากฏการณ์โฟโตอิเล็กทริกและค่าคงตัวของพลังค์ (Photoelectric Effect & Planck Constant h)',
    shortTitle: '⚛️ โฟโตอิเล็กทริก',
    icon: '⚛️',
    status: 'active',
    keyFormula: '$$eV_{\\text{stop}} = hf - W_0 = h\\left(\\frac{c}{\\lambda}\\right) - W_0$$',
    description: 'ศึกษาการแผ่โฟโตอิเล็กตรอนเมื่อส่องแสงความถี่สูงกระทบโลหะ การหาความต่างศักย์หยุดยั้ง V_stop และการวิเคราะห์ความชันกราฟเพื่อคำนวณค่าคงตัวของพลังค์ h',
    features: ['Monochromatic Light Filters', 'Vacuum Phototube Model', 'Photoelectron Flow Visualizer', 'Planck Constant Linear Regression'],
    camera: { position: [0.2, 4.5, 7.5], target: [0, 1.8, 0] },
    topCamera: { position: [0, 9.8, 0.1], target: [0, 1.5, 0] },

    init(scene) {
      initPhotoelectric3D(scene);
      this.group = modernGroup;
    },

    activate() {
      updatePhotoelectric3D();
      updatePhotoelectricUI();
      renderPhotoTable();
    },

    update(dt, now) {
      const res = calcPhotoelectric();

      // Animate photoelectrons flow if current > 0
      const isFlowing = res.currentMicroA > 0;
      photoelectrons.forEach(pe => {
        if (!isFlowing) {
          pe.visible = false;
        } else {
          pe.visible = true;
          pe.userData.t += pe.userData.speed * (res.currentMicroA / 45.0);
          if (pe.userData.t > 1.0) pe.userData.t = 0;
          // Lerp from cathode x = -0.4 to anode x = 0.4
          pe.position.x = -0.4 + pe.userData.t * 0.8;
        }
      });

      drawPhotoelectricGraph();
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🌈 แถบสเปกตรัมแสงตกกระทบ ($\lambda$)</span>
            <span class="badge badge-accent">Monochromatic</span>
          </div>

          <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:10px;">
            ${SPECTRAL_LINES.map(line => `
              <button class="tab-btn ${line.lambdaNm === currentWavelengthNm ? 'active' : ''}" 
                      style="border-color:${line.hexStr};"
                      onclick="window.setPhotoWavelength(${line.lambdaNm})">
                ${line.name}
              </button>
            `).join('')}
          </div>

          <div class="control-row">
            <span class="control-label">ความยาวคลื่นแสง ($\lambda$)</span>
            <span id="photo-val-lambda" class="control-val">405 nm</span>
          </div>

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">ความต่างศักย์ต้าน ($V$)</span>
            <span id="photo-val-v" class="control-val">0.00 V</span>
          </div>
          <input type="range" id="photo-slider-v" min="-1.0" max="3.5" step="0.05" value="0" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-autostop-photo" class="btn-primary" style="flex:1;">
              🎯 หาจุดหยุดยั้ง (Auto $V_{\\text{stop}}$)
            </button>
            <button id="btn-record-photo" class="btn-secondary">
              📝 บันทึกผล
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📐 สมการโฟโตอิเล็กทริกของไอน์สไตน์</span>
          </div>
          <div class="formula-box">
            $$E_k^{\\text{max}} = e V_{\\text{stop}} = hf - W_0$$
            $$V_{\\text{stop}} = \\left(\\frac{h}{e}\\right)f - \\frac{W_0}{e}$$
            $$\\text{Slope } m = \\frac{h}{e} \\approx 4.136 \\times 10^{-15}\\text{ V}\\cdot\\text{s}$$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📈 กราฟความต่างศักย์หยุดยั้ง ($V_{\\text{stop}}$ vs $f$)</span>
            <span class="badge badge-accent">Planck Regression</span>
          </div>
          <canvas id="modern-graph-canvas" width="380" height="135" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
          <div id="photo-val-status" style="margin-top:8px; font-size:0.82rem;"></div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:10px;">
            <div class="stat-tile">
              <span class="stat-tile-label">กระแสโฟโตอิเล็กตรอน ($I$)</span>
              <span id="photo-val-current" class="stat-tile-val" style="color:#38bdf8;">0.0 μA</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ความต่างศักย์หยุดยั้ง ($V_{\\text{stop}}$)</span>
              <span id="photo-val-vstop" class="stat-tile-val">0.92 V</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกการวัดค่าคงตัวของพลังค์</span>
            <button class="panel-size-btn" onclick="photoTrials = []; renderPhotoTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>$\lambda$</th>
                  <th>$f$ (×10¹⁴)</th>
                  <th>$E_{\\text{photon}}$</th>
                  <th>$V_{\\text{stop}}$</th>
                  <th>$h_{\\text{exp}}$</th>
                </tr>
              </thead>
              <tbody id="photo-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI(leftEl, rightEl) {
      window.setPhotoWavelength = (nm) => {
        currentWavelengthNm = nm;
        updatePhotoelectric3D();
        updatePhotoelectricUI();
        const btns = leftEl.querySelectorAll('.section-card:first-child .tab-btn');
        btns.forEach(b => {
          b.classList.toggle('active', b.textContent.includes(`${nm} nm`));
        });
      };

      const sliderV = document.getElementById('photo-slider-v');
      if (sliderV) {
        sliderV.addEventListener('input', (e) => {
          retardingVoltage = parseFloat(e.target.value);
          updatePhotoelectricUI();
        });
      }

      const btnAuto = document.getElementById('btn-autostop-photo');
      if (btnAuto) btnAuto.addEventListener('click', autoFindStoppingPotential);

      const btnRec = document.getElementById('btn-record-photo');
      if (btnRec) btnRec.addEventListener('click', recordPhotoTrial);

      updatePhotoelectricUI();
    }
  });

})();
