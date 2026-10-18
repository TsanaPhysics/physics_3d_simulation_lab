/**
 * js/experiments/em-faraday.js
 * Domain: Electromagnetism & Induction (แม่เหล็กไฟฟ้าและการเหนี่ยวนำ)
 * Experiment: Faraday's Law of Induction, Lenz's Law & Moving Bar Magnet
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let emGroup = null;
  let coilMesh, magnetGroup, galvoGroup, galvoNeedleMesh, ledMesh;
  let oscCanvas, oscCtx;
  let fieldLineGroup;

  // Experiment State
  let magnetX = -3.2;          // Magnet X position (-5.0 to +5.0)
  let magnetVel = 0.0;         // Magnet velocity dx/dt
  let coilTurns = 400;         // Number of turns N
  let magnetPolarity = 1;      // +1 = N-S (North facing coil), -1 = S-N
  let isAutoOscillating = false;
  let oscTime = 0;
  let oscFreq = 1.0;           // Hz
  let oscAmp = 2.2;            // Amplitude

  // Induced EMF & Needle Dynamics
  let currentEmf = 0.0;        // Volts
  let currentGalvoDeflection = 0.0;
  let galvoNeedleVel = 0.0;
  let emfHistory = [];
  let inductionTrials = [];

  // Physics calculation
  function calcInduction(x, v) {
    // Solenoid located at x = 0, radius R = 0.8 units
    const R = 0.8;
    const mu0_M = 0.12; // Magnetic dipole moment factor * mu0 / 2pi

    // On-axis magnetic field B(x) from dipole: B(x) ~ mu0*M / (x^2 + R^2)^(3/2)
    // Flux Phi(x) ~ B(x) * Area = B(x) * (pi * R^2)
    const distSq = x * x + R * R;
    const bField = (magnetPolarity * mu0_M) / Math.pow(distSq, 1.5);
    const flux = bField * (Math.PI * R * R);

    // Spatial derivative dPhi/dx
    // d/dx [ (x^2 + R^2)^(-1.5) ] = -3x (x^2 + R^2)^(-2.5)
    const dPhi_dx = -3 * x * (magnetPolarity * mu0_M * Math.PI * R * R) / Math.pow(distSq, 2.5);

    // Faraday's Law: EMF = -N * dPhi/dt = -N * (dPhi/dx) * v
    const emf = -coilTurns * dPhi_dx * v * 0.08;

    return {
      bField,
      flux,
      dPhi_dx,
      emf
    };
  }

  // 3D Scene Initialization
  function initFaraday3D(scene) {
    emGroup = new THREE.Group();
    emGroup.visible = false;
    scene.add(emGroup);

    // 1. Wooden Lab Bench Stand
    const stand = new THREE.Mesh(
      new THREE.BoxGeometry(8.5, 0.22, 2.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })
    );
    stand.position.set(0, 0.11, 0);
    stand.receiveShadow = true;
    emGroup.add(stand);

    // 2. Solenoid Coil at Center (x = 0)
    coilMesh = new THREE.Group();
    
    // Acrylic Spool / Bobbin
    const bobbinMat = new THREE.MeshPhysicalMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.45,
      roughness: 0.15,
      transmission: 0.8
    });
    const tubeCore = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 2.4, 32, 1, true), bobbinMat);
    tubeCore.rotation.z = Math.PI / 2;
    tubeCore.position.set(0, 1.25, 0);
    coilMesh.add(tubeCore);

    const flange1 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.08, 16, 32), bobbinMat);
    flange1.rotation.y = Math.PI / 2;
    flange1.position.set(-1.18, 1.25, 0);
    coilMesh.add(flange1);

    const flange2 = flange1.clone();
    flange2.position.set(1.18, 1.25, 0);
    coilMesh.add(flange2);

    // Copper Windings
    const copperMat = new THREE.MeshStandardMaterial({
      color: 0xb45309,
      metalness: 0.85,
      roughness: 0.28
    });
    const windingCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 2.2, 32),
      copperMat
    );
    windingCylinder.rotation.z = Math.PI / 2;
    windingCylinder.position.set(0, 1.25, 0);
    coilMesh.add(windingCylinder);

    // Glowing LED Indicator on top of coil
    const ledGeom = new THREE.SphereGeometry(0.16, 16, 16);
    const ledMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x22c55e,
      emissiveIntensity: 0.1
    });
    ledMesh = new THREE.Mesh(ledGeom, ledMat);
    ledMesh.position.set(0, 2.65, 0);
    coilMesh.add(ledMesh);

    emGroup.add(coilMesh);

    // 3. Neodymium Bar Magnet (Draggable)
    magnetGroup = new THREE.Group();
    magnetGroup.userData.isDraggable = true;
    magnetGroup.userData.instrumentName = 'แท่งแม่เหล็ก (Bar Magnet)';

    const poleLen = 1.1;
    const poleRad = 0.45;
    // North Pole (Red)
    const nMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.4, roughness: 0.3 });
    const nMesh = new THREE.Mesh(new THREE.BoxGeometry(poleLen, poleRad, poleRad), nMat);
    nMesh.position.set(poleLen / 2, 1.25, 0);
    nMesh.userData.draggableRoot = magnetGroup;
    magnetGroup.add(nMesh);

    // South Pole (Blue)
    const sMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.4, roughness: 0.3 });
    const sMesh = new THREE.Mesh(new THREE.BoxGeometry(poleLen, poleRad, poleRad), sMat);
    sMesh.position.set(-poleLen / 2, 1.25, 0);
    sMesh.userData.draggableRoot = magnetGroup;
    magnetGroup.add(sMesh);

    // Magnetic Field Lines Loops (Glowing ellipses)
    fieldLineGroup = new THREE.Group();
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 4; i++) {
      const curve = new THREE.EllipseCurve(0, 1.25, 1.8 + i * 0.4, 0.7 + i * 0.25, 0, Math.PI * 2);
      const points = curve.getPoints(36);
      const geom = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, p.y, 0)));
      const line = new THREE.Line(geom, lineMat);
      line.rotation.x = (i * Math.PI) / 4;
      fieldLineGroup.add(line);
    }
    magnetGroup.add(fieldLineGroup);

    magnetGroup.position.set(magnetX, 0, 0);
    emGroup.add(magnetGroup);

    // 4. Center-Zero Galvanometer Model
    galvoGroup = new THREE.Group();
    const gCase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.9, 0.45, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    gCase.position.set(0, 0.35, -2.0);
    galvoGroup.add(gCase);

    // Galvanometer Dial Face
    const gCanvas = document.createElement('canvas');
    gCanvas.width = 256; gCanvas.height = 256;
    const gCtx = gCanvas.getContext('2d');
    gCtx.fillStyle = '#f8fafc'; gCtx.fillRect(0, 0, 256, 256);
    gCtx.strokeStyle = '#0284c7'; gCtx.lineWidth = 3;
    gCtx.beginPath(); gCtx.arc(128, 180, 100, Math.PI * 1.2, Math.PI * 1.8); gCtx.stroke();
    gCtx.fillStyle = '#0f172a'; gCtx.font = 'bold 20px monospace'; gCtx.textAlign = 'center';
    gCtx.fillText('GALVANOMETER', 128, 90);
    gCtx.fillText('-50   0   +50 μA', 128, 140);

    const dialMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(gCanvas) })
    );
    dialMesh.rotation.x = -Math.PI / 2;
    dialMesh.position.set(0, 0.58, -2.0);
    galvoGroup.add(dialMesh);

    // Moving Needle
    galvoNeedleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.02, 0.75),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    galvoNeedleMesh.position.set(0, 0.6, -2.0);
    galvoGroup.add(galvoNeedleMesh);
    emGroup.add(galvoGroup);
  }

  function updateFaraday3D() {
    if (!magnetGroup) return;
    magnetGroup.position.x = magnetX;
    if (magnetPolarity === 1) {
      magnetGroup.rotation.y = 0;
    } else {
      magnetGroup.rotation.y = Math.PI;
    }
  }

  function drawEmfOscilloscope() {
    if (!oscCanvas || !oscCtx) {
      oscCanvas = document.getElementById('faraday-osc-canvas');
      if (oscCanvas) oscCtx = oscCanvas.getContext('2d');
    }
    if (!oscCtx) return;

    const w = oscCanvas.width;
    const h = oscCanvas.height;
    oscCtx.fillStyle = '#020617';
    oscCtx.fillRect(0, 0, w, h);

    // Grid lines
    oscCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    oscCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      oscCtx.beginPath(); oscCtx.moveTo(x, 0); oscCtx.lineTo(x, h); oscCtx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
      oscCtx.beginPath(); oscCtx.moveTo(0, y); oscCtx.lineTo(w, y); oscCtx.stroke();
    }

    // Center zero line
    oscCtx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    oscCtx.beginPath();
    oscCtx.moveTo(0, h / 2); oscCtx.lineTo(w, h / 2);
    oscCtx.stroke();

    // Trace line
    if (emfHistory.length < 2) return;
    oscCtx.strokeStyle = '#38bdf8';
    oscCtx.lineWidth = 2.5;
    oscCtx.shadowColor = '#38bdf8';
    oscCtx.shadowBlur = Math.abs(currentEmf) > 0.1 ? 8 : 2;

    oscCtx.beginPath();
    for (let i = 0; i < emfHistory.length; i++) {
      const x = (i / (emfHistory.length - 1)) * w;
      // Clamp to screen height: 1.0 V = 45 pixels deflection
      const y = h / 2 - emfHistory[i] * 45;
      if (i === 0) oscCtx.moveTo(x, y);
      else oscCtx.lineTo(x, y);
    }
    oscCtx.stroke();
    oscCtx.shadowBlur = 0;
  }

  function recordInductionTrial() {
    const trial = {
      id: inductionTrials.length + 1,
      turns: coilTurns,
      speed: Math.abs(magnetVel).toFixed(2),
      peakEmf: Math.abs(currentEmf).toFixed(3),
      polarity: magnetPolarity > 0 ? 'N เข้าก่อน' : 'S เข้าก่อน',
      direction: currentEmf > 0 ? 'ตามเข็ม (+)' : 'ทวนเข็ม (-)'
    };
    inductionTrials.push(trial);
    renderInductionTable();
  }

  function renderInductionTable() {
    const tbody = document.getElementById('faraday-table-body');
    if (!tbody) return;
    tbody.innerHTML = inductionTrials.map(t => `
      <tr>
        <td style="font-weight:600; text-align:center;">${t.id}</td>
        <td>${t.turns} รอบ</td>
        <td>${t.speed} m/s</td>
        <td style="color:#38bdf8; font-weight:700;">${t.peakEmf} V</td>
        <td>${t.polarity}</td>
        <td><span class="status-pill ready">${t.direction}</span></td>
      </tr>
    `).join('');
  }

  function updateFaradayUI() {
    const valPos = document.getElementById('faraday-val-pos');
    const valVel = document.getElementById('faraday-val-vel');
    const valEmf = document.getElementById('faraday-val-emf');
    const sliderPos = document.getElementById('faraday-slider-pos');
    const valStatus = document.getElementById('faraday-val-status');

    if (valPos) valPos.textContent = `${magnetX.toFixed(2)} cm`;
    if (valVel) valVel.textContent = `${magnetVel.toFixed(2)} m/s`;
    if (valEmf) valEmf.textContent = `${currentEmf.toFixed(3)} V`;
    if (sliderPos) sliderPos.value = magnetX;

    if (valStatus) {
      if (Math.abs(currentEmf) > 0.05) {
        const dir = currentEmf > 0 ? 'ตามเข็มนาฬิกา (+)' : 'ทวนเข็มนาฬิกา (-)';
        valStatus.innerHTML = `<span style="color:#10b981; font-weight:700;">⚡ เกิดแรงเคลื่อนไฟฟ้าเหนี่ยวนำ! (${dir}) LED สว่าง</span>`;
      } else {
        valStatus.innerHTML = '<span style="color:#94a3b8;">แม่เหล็กอยู่นิ่ง / ไม่มีการเปลี่ยนแปลงฟลักซ์แม่เหล็ก (EMF = 0)</span>';
      }
    }
  }

  // Register the experiment definition
  window.PhysicsLabRegistry.registerExperiment({
    id: 'em_faraday_lenz',
    domainId: 'electromagnetism',
    title: 'การเหนี่ยวนำแม่เหล็กไฟฟ้าตามกฎของฟาราเดย์และเลนซ์ (Faraday & Lenz Induction)',
    shortTitle: '🧲 เหนี่ยวนำฟาราเดย์',
    icon: '🧲',
    status: 'active',
    keyFormula: '$$\\mathcal{E} = -N\\frac{d\\Phi_B}{dt} = -N\\left(\\frac{d\\Phi_B}{dx}\\right)\\frac{dx}{dt}$$',
    description: 'ศึกษาการเคลื่อนแท่งแม่เหล็กผ่านขดลวดโซเลนอยด์ การเกิดแรงเคลื่อนไฟฟ้าเหนี่ยวนำตามกฎของฟาราเดย์ และทิศทางกระแสเหนี่ยวนำต้านการเปลี่ยนแปลงตามกฎของเลนซ์',
    features: ['3D Magnetic Field Lines', 'Moving Coil Galvanometer', 'Real-time EMF Oscilloscope', 'LED Glow Indicator'],
    camera: { position: [0, 4.8, 7.2], target: [0, 1.2, 0] },
    topCamera: { position: [0, 9.8, 0.1], target: [0, 1.0, 0] },

    init(scene) {
      initFaraday3D(scene);
      this.group = emGroup;
      this.draggableInstruments = [
        { group: magnetGroup, name: 'แท่งแม่เหล็ก (Bar Magnet)' }
      ];
    },

    activate() {
      updateFaraday3D();
      updateFaradayUI();
      renderInductionTable();
    },

    update(dt, now) {
      let prevX = magnetX;

      if (isAutoOscillating) {
        oscTime += dt;
        magnetX = oscAmp * Math.sin(2 * Math.PI * oscFreq * oscTime);
        magnetVel = (magnetX - prevX) / dt;
      } else {
        // Slow natural damping if released
        magnetVel *= 0.92;
        if (Math.abs(magnetVel) < 0.001) magnetVel = 0;
      }

      // Physics Calculation
      const ind = calcInduction(magnetX, magnetVel);
      currentEmf = ind.emf;

      // Update EMF history for oscilloscope
      emfHistory.push(currentEmf);
      if (emfHistory.length > 120) emfHistory.shift();

      // Spring-damped needle dynamics for galvanometer
      const stiffness = 95.0;
      const damping = 13.0;
      const targetDeflection = Math.max(-1.0, Math.min(1.0, currentEmf * 1.8));
      const acc = stiffness * (targetDeflection - currentGalvoDeflection) - damping * galvoNeedleVel;
      galvoNeedleVel += acc * dt;
      currentGalvoDeflection += galvoNeedleVel * dt;

      if (galvoNeedleMesh) {
        galvoNeedleMesh.rotation.y = currentGalvoDeflection * 0.65;
      }

      // LED Glow brightness proportional to induced power
      if (ledMesh) {
        const brightness = Math.min(1.8, Math.abs(currentEmf) * 2.5);
        ledMesh.material.emissiveIntensity = brightness;
      }

      updateFaraday3D();
      drawEmfOscilloscope();
      updateFaradayUI();
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ ตัวควบคุมแท่งแม่เหล็ก & ขดลวด</span>
            <span class="badge badge-accent">Faraday Induction</span>
          </div>

          <div class="control-row">
            <span class="control-label">ตำแหน่งแท่งแม่เหล็ก ($x$)</span>
            <span id="faraday-val-pos" class="control-val">-3.20 cm</span>
          </div>
          <input type="range" id="faraday-slider-pos" min="-4.5" max="4.5" step="0.05" value="-3.2" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">ความเร็วการเคลื่อนที่ ($v$)</span>
            <span id="faraday-val-vel" class="control-val">0.00 m/s</span>
          </div>

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">จำนวนรอบขดลวด ($N$)</span>
            <span class="control-val" id="faraday-val-turns">400 รอบ</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="tab-btn" id="btn-turns-200">200 รอบ</button>
            <button class="tab-btn active" id="btn-turns-400">400 รอบ</button>
            <button class="tab-btn" id="btn-turns-800">800 รอบ</button>
          </div>

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-toggle-oscillate" class="btn-primary" style="flex:1;">
              🔄 เคลื่อนที่แกว่งอัตโนมัติ (Oscillate)
            </button>
            <button id="btn-flip-poles" class="btn-secondary" title="สลับขั้วแม่เหล็ก N-S">
              🧲 กลับขั้ว N-S
            </button>
          </div>
          <button id="btn-record-faraday" class="btn-secondary" style="width:100%; margin-top:8px;">
            📝 บันทึกข้อมูลการเหนี่ยวนำ
          </button>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📐 กฎของฟาราเดย์และเลนซ์</span>
          </div>
          <div class="formula-box">
            $$\\mathcal{E} = -N\\frac{d\\Phi_B}{dt} = -N\\left(\\frac{d\\Phi_B}{dx}\\right)\\cdot v$$
            $$I_{\\text{ind}} = \\frac{\\mathcal{E}}{R_{\\text{coil}}}$$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📈 ออสซิลโลสโคปแรงเคลื่อนไฟฟ้า ($\mathcal{E}$ vs $t$)</span>
            <span class="badge badge-accent">Live Oscilloscope</span>
          </div>
          <canvas id="faraday-osc-canvas" width="380" height="130" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
          <div id="faraday-val-status" style="margin-top:8px; font-size:0.82rem;"></div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:10px;">
            <div class="stat-tile">
              <span class="stat-tile-label">แรงเคลื่อนไฟฟ้าเหนี่ยวนำ ($\mathcal{E}$)</span>
              <span id="faraday-val-emf" class="stat-tile-val" style="color:#38bdf8;">0.000 V</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ทิศทางกระแสเหนี่ยวนำตามกฎของเลนซ์</span>
              <span class="stat-tile-val" style="font-size:0.88rem;">ต้านฟลักซ์เดิม</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกการเหนี่ยวนำฟาราเดย์</span>
            <button class="panel-size-btn" onclick="inductionTrials = []; renderInductionTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ขดลวด</th>
                  <th>ความเร็ว</th>
                  <th>$\mathcal{E}_{\text{peak}}$</th>
                  <th>ขั้วเข้า</th>
                  <th>ทิศทาง</th>
                </tr>
              </thead>
              <tbody id="faraday-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI(leftEl, rightEl) {
      const slider = document.getElementById('faraday-slider-pos');
      let lastSliderTime = performance.now();
      let lastSliderVal = magnetX;

      if (slider) {
        slider.addEventListener('input', (e) => {
          isAutoOscillating = false;
          const btnOsc = document.getElementById('btn-toggle-oscillate');
          if (btnOsc) btnOsc.classList.remove('active');

          const now = performance.now();
          const dt = (now - lastSliderTime) / 1000;
          const newX = parseFloat(e.target.value);
          if (dt > 0.005) {
            magnetVel = (newX - lastSliderVal) / dt;
            lastSliderTime = now;
            lastSliderVal = newX;
          }
          magnetX = newX;
          updateFaraday3D();
          updateFaradayUI();
        });
      }

      const btnOsc = document.getElementById('btn-toggle-oscillate');
      if (btnOsc) {
        btnOsc.addEventListener('click', () => {
          isAutoOscillating = !isAutoOscillating;
          btnOsc.classList.toggle('active', isAutoOscillating);
        });
      }

      const btnFlip = document.getElementById('btn-flip-poles');
      if (btnFlip) {
        btnFlip.addEventListener('click', () => {
          magnetPolarity *= -1;
          updateFaraday3D();
        });
      }

      const b200 = document.getElementById('btn-turns-200');
      const b400 = document.getElementById('btn-turns-400');
      const b800 = document.getElementById('btn-turns-800');

      [
        { btn: b200, n: 200 },
        { btn: b400, n: 400 },
        { btn: b800, n: 800 }
      ].forEach(item => {
        if (item.btn) {
          item.btn.addEventListener('click', () => {
            coilTurns = item.n;
            [b200, b400, b800].forEach(b => b.classList.remove('active'));
            item.btn.classList.add('active');
            const lbl = document.getElementById('faraday-val-turns');
            if (lbl) lbl.textContent = `${coilTurns} รอบ`;
          });
        }
      });

      const btnRec = document.getElementById('btn-record-faraday');
      if (btnRec) btnRec.addEventListener('click', recordInductionTrial);

      updateFaradayUI();
    }
  });

})();
