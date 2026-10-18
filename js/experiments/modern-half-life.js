/**
 * js/experiments/modern-half-life.js
 * Domain: Modern & Quantum Physics (ฟิสิกส์ยุคใหม่และควอนตัม)
 * Experiment: Radioactive Decay, Half-Life & Geiger-Müller Counter
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let hlGroup = null;
  let castleMesh, gmTubeMesh, sampleMesh, cableMesh, counterBoxMesh;
  let absorberMesh;
  let audioCtx = null;

  // Experiment State
  let isotope = 'iso_fast';     // 'iso_fast' (T1/2 = 12s) | 'iso_med' (T1/2 = 30s) | 'iso_slow' (T1/2 = 60s)
  const ISOTOPES = {
    iso_fast: { name: 'ไอโซโทป A (อายุสั้น)', T_half: 12.0, N0: 2000, color: 0xef4444 },
    iso_med: { name: 'ไอโซโทป B (ปานกลาง)', T_half: 30.0, N0: 2000, color: 0xf59e0b },
    iso_slow: { name: 'ไอโซโทป C (อายุยาว)', T_half: 60.0, N0: 2000, color: 0x10b981 }
  };

  let distanceR = 0.05;         // Distance sample-to-tube (m) = 5 cm
  let absorberType = 'none';    // 'none' | 'paper' | 'aluminum' | 'lead'
  const ABSORBERS = {
    none: { name: 'ไม่มี (อากาศ)', trans: 1.0 },
    paper: { name: 'กระดาษ (Paper α)', trans: 0.88 },
    aluminum: { name: 'แผ่นอลูมิเนียม (Al β)', trans: 0.45 },
    lead: { name: 'แผ่นตะกั่ว (Pb γ)', trans: 0.08 }
  };

  let isDecaying = false;
  let isSoundEnabled = true;
  let simTime = 0.0;
  let remainingNuclei = 2000;
  let currentCPS = 0;
  let totalCounts = 0;
  let countHistory = [];
  let decayLogs = [];

  // Web Audio Geiger Click Generator (Realistic Geiger-Müller discharge click)
  function playGeigerClick() {
    if (!isSoundEnabled) return;
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();

      // Sharp burst of noise / impulse
      const bufferSize = audioCtx.sampleRate * 0.003; // 3 ms click
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1800;

      const gain = audioCtx.createGain();
      gain.gain.value = 0.25;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      noise.start();
    } catch (e) {}
  }

  // 3D Scene Initialization
  function initHalfLife3D(scene) {
    hlGroup = new THREE.Group();
    hlGroup.visible = false;
    scene.add(hlGroup);

    // 1. Heavy Lab Table
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.16, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 })
    );
    bench.position.set(0, 0.08, 0);
    hlGroup.add(bench);

    // 2. Lead Castle Shielded Chamber with Trefoil Hazard Warning
    castleMesh = new THREE.Group();
    
    // Cylindrical lead casing with open side
    const leadOuter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.75, 0.75, 0.85, 32, 1, false, 0, Math.PI * 1.5),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.4 })
    );
    leadOuter.position.set(0, 0.52, 0);
    castleMesh.add(leadOuter);

    // Lead Castle Base Plate
    const leadBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.85, 0.85, 0.12, 32),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
    );
    leadBase.position.set(0, 0.14, 0);
    castleMesh.add(leadBase);

    castleMesh.position.set(-0.8, 0, 0);
    hlGroup.add(castleMesh);

    // 3. Radioactive Sample Capsule Disc
    sampleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.04, 24),
      new THREE.MeshStandardMaterial({
        color: ISOTOPES[isotope].color,
        emissive: ISOTOPES[isotope].color,
        emissiveIntensity: 0.6,
        roughness: 0.3
      })
    );
    sampleMesh.position.set(-0.8, 0.35, 0);
    hlGroup.add(sampleMesh);

    // 4. Geiger-Müller (GM) Tube on Adjustable Rail
    gmTubeMesh = new THREE.Group();
    
    // Stainless steel tube casing with thin mica end-window
    const tubeBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.65, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
    );
    tubeBody.rotation.z = Math.PI / 2;
    gmTubeMesh.add(tubeBody);

    // Mica window tip (Facing sample)
    const windowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.075, 24),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 })
    );
    windowMesh.rotation.y = -Math.PI / 2;
    windowMesh.position.set(-0.33, 0, 0);
    gmTubeMesh.add(windowMesh);

    // Tube support bracket and clamp
    const clamp = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.28, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 })
    );
    clamp.position.set(0.1, -0.14, 0);
    gmTubeMesh.add(clamp);

    gmTubeMesh.position.set(-0.8 + distanceR * 8.0 + 0.45, 0.35, 0);
    hlGroup.add(gmTubeMesh);

    // 5. Interchangeable Absorber Plate (Interposed between sample and GM tube)
    const absGeom = new THREE.BoxGeometry(0.02, 0.4, 0.3);
    const absMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });
    absorberMesh = new THREE.Mesh(absGeom, absMat);
    absorberMesh.position.set(-0.8 + (distanceR * 4.0) + 0.22, 0.35, 0);
    absorberMesh.visible = (absorberType !== 'none');
    hlGroup.add(absorberMesh);

    // 6. Benchtop Digital Scaler-Ratemeter Unit
    counterBoxMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.7, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.5 })
    );
    counterBoxMesh.position.set(1.4, 0.45, -0.2);
    hlGroup.add(counterBoxMesh);
  }

  function updateHalfLife3D() {
    if (sampleMesh) {
      sampleMesh.material.color.setHex(ISOTOPES[isotope].color);
      sampleMesh.material.emissive.setHex(ISOTOPES[isotope].color);
      // Brightness fades as remaining nuclei decay
      const ratio = remainingNuclei / ISOTOPES[isotope].N0;
      sampleMesh.material.emissiveIntensity = 0.1 + ratio * 0.7;
    }
    if (gmTubeMesh) {
      gmTubeMesh.position.x = -0.8 + distanceR * 8.0 + 0.45;
    }
    if (absorberMesh) {
      absorberMesh.position.x = -0.8 + distanceR * 4.0 + 0.22;
      absorberMesh.visible = (absorberType !== 'none');
      if (absorberType === 'paper') absorberMesh.material.color.setHex(0xf8fafc);
      else if (absorberType === 'aluminum') absorberMesh.material.color.setHex(0x94a3b8);
      else if (absorberType === 'lead') absorberMesh.material.color.setHex(0x334155);
    }
  }

  function updateHalfLifeUI() {
    const elN = document.getElementById('hl-val-n');
    const elCPS = document.getElementById('hl-val-cps');
    const elTot = document.getElementById('hl-val-tot');
    const elTime = document.getElementById('hl-val-time');
    const elThalf = document.getElementById('hl-val-thalf');

    if (elN) elN.textContent = `${Math.round(remainingNuclei)} อนุภาค`;
    if (elCPS) elCPS.textContent = `${Math.round(currentCPS)} CPS`;
    if (elTot) elTot.textContent = `${totalCounts} นับ`;
    if (elTime) elTime.textContent = `${simTime.toFixed(1)} s`;
    if (elThalf) elThalf.textContent = `${ISOTOPES[isotope].T_half.toFixed(1)} s`;
  }

  function drawDecayPlot() {
    const canvas = document.getElementById('hl-plot-canvas');
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
    ctx.fillText('N(t)', 0, 0);
    ctx.restore();

    // Plot Theoretical Exponential Curve N(t) = N0 * 2^(-t / T1/2)
    const T_half = ISOTOPES[isotope].T_half;
    const maxT = T_half * 3.5;
    const N0 = ISOTOPES[isotope].N0;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const t = (i / 60) * maxT;
      const n_theo = N0 * Math.pow(0.5, t / T_half);
      const px = 40 + (t / maxT) * (w - 60);
      const py = (h - 25) - (n_theo / N0) * (h - 45);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Plot Real-time Monte Carlo Points
    if (countHistory.length > 1) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      countHistory.forEach((pt, i) => {
        const px = 40 + (pt.t / maxT) * (w - 60);
        const py = (h - 25) - (pt.n / N0) * (h - 45);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Half-life line marker
      const pxHalf = 40 + (T_half / maxT) * (w - 60);
      const pyHalf = (h - 25) - 0.5 * (h - 45);

      ctx.strokeStyle = '#f59e0b';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pxHalf, h - 25);
      ctx.lineTo(pxHalf, pyHalf);
      ctx.lineTo(40, pyHalf);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`T₁/₂ (${T_half}s)`, pxHalf + 4, pyHalf - 6);
    }
  }

  function startDecay() {
    isDecaying = true;
  }

  function pauseDecay() {
    isDecaying = false;
  }

  function resetDecay() {
    isDecaying = false;
    simTime = 0.0;
    remainingNuclei = ISOTOPES[isotope].N0;
    totalCounts = 0;
    currentCPS = 0;
    countHistory = [{ t: 0, n: remainingNuclei }];
    updateHalfLife3D();
    updateHalfLifeUI();
    drawDecayPlot();
  }

  // Register in PhysicsLabRegistry
  window.PhysicsLabRegistry.registerExperiment({
    id: 'modern_half_life',
    domainId: 'modern',
    title: 'การสลายตัวของสารกัมมันตรังสีและครึ่งชีวิต (Radioactive Decay & Half-Life Simulation)',
    shortTitle: '⚛️ ครึ่งชีวิตสารรังสี',
    icon: '⚛️',
    status: 'active',
    keyFormula: '$$N(t) = N_0 e^{-\\lambda t} = N_0 \\left(\\frac{1}{2}\\right)^{\\frac{t}{T_{1/2}}} \\quad (\\lambda = \\frac{\\ln 2}{T_{1/2}})$$',
    description: 'จำลองการสลายตัวแบบสุ่มมอนติคาร์โลของนิวเคลียสกัมมันตรังสี การวัดอัตราการแผ่รังสีด้วยหัววัด Geiger-Müller (GM Counter) พร้อมเสียงคลิกจริง',
    features: ['Geiger-Müller Audio Clicks', 'Monte Carlo Stochastic Decay', 'Half-Life T1/2 Solver', 'Absorber Shielding Library'],
    camera: { position: [0.2, 2.6, 4.4], target: [0.2, 0.5, 0] },
    topCamera: { position: [0.2, 5.5, 0.1], target: [0.2, 0.5, 0] },

    init(scene) {
      initHalfLife3D(scene);
      this.group = hlGroup;
      this.draggableInstruments = [
        { group: gmTubeMesh, name: 'หัววัดไกเกอร์-มึลเลอร์ (GM Tube)' }
      ];
    },

    activate() {
      updateHalfLife3D();
      updateHalfLifeUI();
      drawDecayPlot();
    },

    update(dt) {
      if (!isDecaying) return;

      simTime += dt;
      const T_half = ISOTOPES[isotope].T_half;
      const lambda = Math.LN2 / T_half;

      // Stochastic decay step: dN = -lambda * N * dt
      const decayProb = 1 - Math.exp(-lambda * dt);
      const decayedInDt = remainingNuclei * decayProb;
      remainingNuclei = Math.max(0, remainingNuclei - decayedInDt);

      // Geiger detection rate: Activity * geometric factor * absorber transmission
      const geomFactor = 1.0 / (1.0 + Math.pow(distanceR / 0.05, 2));
      const trans = ABSORBERS[absorberType].trans;
      const trueActivity = remainingNuclei * lambda;
      currentCPS = Math.max(0.5, trueActivity * 0.15 * geomFactor * trans + (Math.random() * 0.6));

      // Audio clicks based on Poisson probability
      const expectedClicks = currentCPS * dt;
      if (Math.random() < expectedClicks) {
        playGeigerClick();
        totalCounts++;
      }

      countHistory.push({ t: simTime, n: remainingNuclei });
      if (countHistory.length > 150) countHistory.shift();

      if (remainingNuclei < 5) {
        isDecaying = false;
      }

      updateHalfLife3D();
      updateHalfLifeUI();
      drawDecayPlot();
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ สารกัมมันตรังสี & ตัวดูดกลืน</span>
            <span class="badge badge-accent">GM Counter</span>
          </div>

          <div class="control-row">
            <span class="control-label">ชนิดไอโซโทป / ครึ่งชีวิต ($T_{1/2}$)</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
            <button class="tab-btn active" id="btn-iso-fast">🔴 ไอโซโทป A ($T_{1/2} = 12.0\\text{ s}$)</button>
            <button class="tab-btn" id="btn-iso-med">🟡 ไอโซโทป B ($T_{1/2} = 30.0\\text{ s}$)</button>
            <button class="tab-btn" id="btn-iso-slow">🟢 ไอโซโทป C ($T_{1/2} = 60.0\\text{ s}$)</button>
          </div>

          <div class="control-row" style="margin-top:12px;">
            <span class="control-label">แผ่นกั้นดูดกลืนรังสี (Absorber)</span>
          </div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px; margin-top:6px;">
            <button class="tab-btn active" id="btn-abs-none">อากาศ (None)</button>
            <button class="tab-btn" id="btn-abs-paper">กระดาษ ($\alpha$)</button>
            <button class="tab-btn" id="btn-abs-al">อลูมิเนียม ($\beta$)</button>
            <button class="tab-btn" id="btn-abs-pb">ตะกั่ว ($\gamma$)</button>
          </div>

          <div class="control-row" style="margin-top:12px;">
            <span class="control-label">ระยะห่างสารกับหัววัด ($r$)</span>
            <span id="hl-lbl-r" class="control-val">5.0 cm</span>
          </div>
          <input type="range" id="hl-slider-r" min="0.03" max="0.18" step="0.01" value="0.05" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-hl-start" class="btn-primary" style="flex:1;">
              ▶️ เริ่มการสลายตัว (Start)
            </button>
            <button id="btn-hl-reset" class="btn-secondary">
              🔄 รีเซ็ต (Reset)
            </button>
          </div>
          <button id="btn-hl-sound" class="btn-secondary" style="width:100%; margin-top:8px;">
            🔊 เสียงคลิกไกเกอร์: เปิด
          </button>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>☣️ กฎการสลายตัวของสารรังสี</span>
          </div>
          <div style="font-size:0.84rem; line-height:1.6; opacity:0.85;">
            • กัมมันตภาพ: $A(t) = \\lambda N(t)$<br/>
            • ค่าคงตัวการสลายตัว: $\\lambda = \\frac{\\ln 2}{T_{1/2}} = \\frac{0.693}{T_{1/2}}$<br/>
            • เมื่อเวลาผ่านไปเท่ากับ $T_{1/2}$ จำนวนนิวเคลียสจะลดลงเหลือครึ่งหนึ่งของเดิม ($N_0 / 2$)
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📊 อัตราการนับรังสี & นิวเคลียสคงเหลือ</span>
            <span class="badge badge-accent">Radiation Scaler</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="stat-tile" style="background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3);">
              <span class="stat-tile-label">อัตราการนับรังสี (Ratemeter)</span>
              <span id="hl-val-cps" class="stat-tile-val" style="color:#f87171; font-size:1.35rem;">0 CPS</span>
            </div>
            <div class="stat-tile" style="background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3);">
              <span class="stat-tile-label">จำนวนนิวเคลียสที่ยังไม่สลายตัว ($N$)</span>
              <span id="hl-val-n" class="stat-tile-val" style="color:#38bdf8; font-size:1.25rem;">2000 อนุภาค</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">เวลาย่อยที่ผ่านไป ($t$)</span>
              <span id="hl-val-time" class="stat-tile-val">0.0 s</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ครึ่งชีวิตตามทฤษฎี ($T_{1/2}$)</span>
              <span id="hl-val-thalf" class="stat-tile-val" style="color:#4ade80;">12.0 s</span>
            </div>
            <div class="stat-tile" style="grid-column: span 2;">
              <span class="stat-tile-label">ยอดนับรวมสะสม (Total Accumulated Counts)</span>
              <span id="hl-val-tot" class="stat-tile-val">0 นับ</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📈 เส้นโค้งการสลายตัวตามเวลา $N(t)$</span>
            <span class="badge badge-gold">Decay Curve</span>
          </div>
          <canvas id="hl-plot-canvas" width="380" height="150" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:6px; text-align:center;">
            เส้นประสีส้มแสดงค่าครึ่งชีวิต $T_{1/2}$ และระดับ $N_0 / 2$
          </div>
        </div>
      `;
    },

    mountUI() {
      const bFast = document.getElementById('btn-iso-fast');
      const bMed = document.getElementById('btn-iso-med');
      const bSlow = document.getElementById('btn-iso-slow');

      [
        { btn: bFast, k: 'iso_fast' },
        { btn: bMed, k: 'iso_med' },
        { btn: bSlow, k: 'iso_slow' }
      ].forEach(item => {
        if (item.btn) {
          item.btn.addEventListener('click', () => {
            isotope = item.k;
            [bFast, bMed, bSlow].forEach(b => b.classList.remove('active'));
            item.btn.classList.add('active');
            resetDecay();
          });
        }
      });

      const bNone = document.getElementById('btn-abs-none');
      const bPap = document.getElementById('btn-abs-paper');
      const bAl = document.getElementById('btn-abs-al');
      const bPb = document.getElementById('btn-abs-pb');

      [
        { btn: bNone, k: 'none' },
        { btn: bPap, k: 'paper' },
        { btn: bAl, k: 'aluminum' },
        { btn: bPb, k: 'lead' }
      ].forEach(item => {
        if (item.btn) {
          item.btn.addEventListener('click', () => {
            absorberType = item.k;
            [bNone, bPap, bAl, bPb].forEach(b => b.classList.remove('active'));
            item.btn.classList.add('active');
            updateHalfLife3D();
          });
        }
      });

      const slR = document.getElementById('hl-slider-r');
      if (slR) {
        slR.addEventListener('input', (e) => {
          distanceR = parseFloat(e.target.value);
          const lbl = document.getElementById('hl-lbl-r');
          if (lbl) lbl.textContent = `${(distanceR * 100).toFixed(1)} cm`;
          updateHalfLife3D();
        });
      }

      const btnStart = document.getElementById('btn-hl-start');
      if (btnStart) {
        btnStart.addEventListener('click', () => {
          if (!isDecaying) {
            startDecay();
            btnStart.textContent = '⏸️ พักชั่วคราว (Pause)';
          } else {
            pauseDecay();
            btnStart.textContent = '▶️ ดำเนินการต่อ (Resume)';
          }
        });
      }

      const btnReset = document.getElementById('btn-hl-reset');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          resetDecay();
          if (btnStart) btnStart.textContent = '▶️ เริ่มการสลายตัว (Start)';
        });
      }

      const btnSound = document.getElementById('btn-hl-sound');
      if (btnSound) {
        btnSound.addEventListener('click', () => {
          isSoundEnabled = !isSoundEnabled;
          btnSound.textContent = isSoundEnabled ? '🔊 เสียงคลิกไกเกอร์: เปิด' : '🔇 เสียงคลิกไกเกอร์: ปิด';
        });
      }

      resetDecay();
    }
  });

})();
