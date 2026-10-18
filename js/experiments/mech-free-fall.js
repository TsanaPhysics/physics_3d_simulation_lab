/**
 * js/experiments/mech-free-fall.js
 * Domain: Mechanics & Dynamics (กลศาสตร์และการเคลื่อนที่)
 * Experiment: Free Fall & Acceleration of Gravity (g) with Optical Photogate Tower
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let fallGroup = null;
  let poleMesh, ballMesh, catcherMesh;
  let gate1Mesh, gate2Mesh, gate3Mesh;
  let gate1Led, gate2Led, gate3Led;
  let audioCtx = null;

  // Experiment State
  let ballY = 2.4;              // Ball initial drop height (m)
  let ballVel = 0.0;            // Ball velocity (m/s)
  let currentY = 2.4;           // Current ball height
  let isDropping = false;
  let hasLanded = false;
  let dropStartTime = 0;
  let planet = 'earth';         // 'earth' (9.807) | 'moon' (1.62) | 'mars' (3.71)
  let gConstant = 9.807;

  // 3 Photogate Heights from base
  let h1 = 1.8;                 // Gate 1 height (m)
  let h2 = 1.1;                 // Gate 2 height (m)
  let h3 = 0.4;                 // Gate 3 height (m)
  let t1 = 0, t2 = 0, t3 = 0;   // Measured times at gates (s)
  let trialData = [];

  function playDropSound(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'release') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } else if (type === 'gate') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.035);
      } else if (type === 'thud') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.13);
      }
    } catch (e) {}
  }

  // 3D Scene Initialization
  function initFreeFall3D(scene) {
    fallGroup = new THREE.Group();
    fallGroup.visible = false;
    scene.add(fallGroup);

    // 1. Heavy Cast-Iron Triangular Base
    const baseMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.75, 0.15, 6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    baseMesh.position.set(0, 0.075, 0);
    fallGroup.add(baseMesh);

    // 2. Vertical Stainless Steel Metric Pole (Height = 2.8m)
    const poleGeom = new THREE.CylinderGeometry(0.04, 0.04, 2.7, 24);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    poleMesh = new THREE.Mesh(poleGeom, poleMat);
    poleMesh.position.set(0, 1.45, 0);
    poleMesh.castShadow = true;
    fallGroup.add(poleMesh);

    // Millimeter Metric Scale running down pole
    const rulerGeom = new THREE.PlaneGeometry(0.035, 2.6);
    const rulerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const ruler = new THREE.Mesh(rulerGeom, rulerMat);
    ruler.position.set(0, 1.45, 0.041);
    fallGroup.add(ruler);

    // 3. Top Electromagnetic Release Solenoid
    const magnetHead = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.25 })
    );
    magnetHead.position.set(0.28, ballY + 0.12, 0);
    fallGroup.add(magnetHead);

    const armBracket = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.05, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7 })
    );
    armBracket.position.set(0.14, ballY + 0.12, 0);
    fallGroup.add(armBracket);

    // 4. Polished Steel Sphere (Diameter = 4 cm)
    const ballGeom = new THREE.SphereGeometry(0.065, 32, 32);
    const ballMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.98,
      roughness: 0.08
    });
    ballMesh = new THREE.Mesh(ballGeom, ballMat);
    ballMesh.position.set(0.28, ballY, 0);
    ballMesh.castShadow = true;
    fallGroup.add(ballMesh);

    // 5. Foam Safety Cushion Landing Tray at base
    catcherMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.26, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.8 })
    );
    catcherMesh.position.set(0.28, 0.07, 0);
    fallGroup.add(catcherMesh);

    // 6. Three Optical Photogates mounted on pole brackets
    function createGate(yPos, label) {
      const g = new THREE.Group();
      
      // Clamp arm from pole to drop line
      const arm = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.03, 0.05),
        new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6 })
      );
      arm.position.set(0.14, 0, 0);
      g.add(arm);

      // U-shaped Photogate fork straddling the falling path
      const forkBack = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.04, 0.26), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      forkBack.position.set(0.38, 0, 0);
      g.add(forkBack);

      const forkLeft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      forkLeft.position.set(0.33, 0, -0.11);
      g.add(forkLeft);

      const forkRight = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      forkRight.position.set(0.33, 0, 0.11);
      g.add(forkRight);

      // IR Diode status LED
      const diode = new THREE.Mesh(
        new THREE.SphereGeometry(0.018, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8 })
      );
      diode.position.set(0.38, 0.035, 0);
      g.add(diode);

      g.position.set(0, yPos, 0);
      return { group: g, led: diode };
    }

    const g1 = createGate(h1, 'Gate 1');
    gate1Mesh = g1.group;
    gate1Led = g1.led;
    fallGroup.add(gate1Mesh);

    const g2 = createGate(h2, 'Gate 2');
    gate2Mesh = g2.group;
    gate2Led = g2.led;
    fallGroup.add(gate2Mesh);

    const g3 = createGate(h3, 'Gate 3');
    gate3Mesh = g3.group;
    gate3Led = g3.led;
    fallGroup.add(gate3Mesh);
  }

  function updateFreeFall3D() {
    if (ballMesh) ballMesh.position.y = currentY;
    if (gate1Mesh) gate1Mesh.position.y = h1;
    if (gate2Mesh) gate2Mesh.position.y = h2;
    if (gate3Mesh) gate3Mesh.position.y = h3;
  }

  function updateFreeFallUI() {
    const elT1 = document.getElementById('fall-val-t1');
    const elT2 = document.getElementById('fall-val-t2');
    const elT3 = document.getElementById('fall-val-t3');
    const elGExp = document.getElementById('fall-val-gexp');
    const elErr = document.getElementById('fall-val-err');

    if (elT1) elT1.textContent = t1 > 0 ? `${(t1 * 1000).toFixed(1)} ms` : '-- ms';
    if (elT2) elT2.textContent = t2 > 0 ? `${(t2 * 1000).toFixed(1)} ms` : '-- ms';
    if (elT3) elT3.textContent = t3 > 0 ? `${(t3 * 1000).toFixed(1)} ms` : '-- ms';

    // Calculate g from photogate data if t3 is reached
    if (t3 > 0) {
      const d1 = ballY - h1;
      const d2 = ballY - h2;
      const d3 = ballY - h3;

      // Fit h = 0.5 * g * t^2
      const g1_calc = (2 * d1) / (t1 * t1);
      const g2_calc = (2 * d2) / (t2 * t2);
      const g3_calc = (2 * d3) / (t3 * t3);
      const g_avg = (g1_calc + g2_calc + g3_calc) / 3;
      const err = Math.abs((g_avg - gConstant) / gConstant) * 100;

      if (elGExp) elGExp.textContent = `${g_avg.toFixed(3)} m/s²`;
      if (elErr) elErr.textContent = `${err.toFixed(2)} %`;
    }
  }

  function drawRegressionPlot() {
    const canvas = document.getElementById('fall-plot-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

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

    // Axis Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('0', 28, h - 22);
    ctx.fillText('t² (s²)', w - 40, h - 10);
    ctx.save();
    ctx.translate(14, 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('h (m)', 0, 0);
    ctx.restore();

    // Plot Points if measured
    if (t3 > 0) {
      const d1 = ballY - h1;
      const d2 = ballY - h2;
      const d3 = ballY - h3;

      const pts = [
        { t2: t1 * t1, d: d1 },
        { t2: t2 * t2, d: d2 },
        { t2: t3 * t3, d: d3 }
      ];

      const maxT2 = Math.max(0.6, pts[2].t2 * 1.25);
      const maxD = Math.max(2.5, d3 * 1.2);

      // Best Fit Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, h - 25);
      const xEnd = 40 + (pts[2].t2 / maxT2) * (w - 60);
      const yEnd = (h - 25) - (pts[2].d / maxD) * (h - 45);
      ctx.lineTo(xEnd, yEnd);
      ctx.stroke();

      // Data Circles
      pts.forEach((p, idx) => {
        const px = 40 + (p.t2 / maxT2) * (w - 60);
        const py = (h - 25) - (p.d / maxD) * (h - 45);

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(px, py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = '9px monospace';
        ctx.fillText(`P${idx + 1}`, px + 6, py - 4);
      });
    }
  }

  function renderFreeFallTable() {
    const tbody = document.getElementById('fall-table-body');
    if (!tbody) return;
    if (trialData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; opacity:0.6;">ยังไม่มีการทดลอง — กดปุ่ม "🎯 ปล่อยวัตถุตกอิสระ" เพื่อเริ่ม</td></tr>';
      return;
    }
    tbody.innerHTML = trialData.map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${d.planet}</td>
        <td>${(d.t1 * 1000).toFixed(1)} / ${(d.t2 * 1000).toFixed(1)} / ${(d.t3 * 1000).toFixed(1)} ms</td>
        <td><span class="badge badge-accent">${d.g_calc.toFixed(3)} m/s²</span></td>
        <td>${d.err.toFixed(2)} %</td>
      </tr>
    `).join('');
  }

  function releaseBall() {
    if (isDropping) return;
    currentY = ballY;
    ballVel = 0.0;
    t1 = 0;
    t2 = 0;
    t3 = 0;
    hasLanded = false;
    isDropping = true;
    dropStartTime = performance.now();
    playDropSound('release');
    if (gate1Led) gate1Led.material.emissiveIntensity = 0.8;
    if (gate2Led) gate2Led.material.emissiveIntensity = 0.8;
    if (gate3Led) gate3Led.material.emissiveIntensity = 0.8;
  }

  function resetBall() {
    isDropping = false;
    currentY = ballY;
    ballVel = 0.0;
    hasLanded = false;
    t1 = 0;
    t2 = 0;
    t3 = 0;
    if (gate1Led) gate1Led.material.emissiveIntensity = 0.8;
    if (gate2Led) gate2Led.material.emissiveIntensity = 0.8;
    if (gate3Led) gate3Led.material.emissiveIntensity = 0.8;
    updateFreeFall3D();
    updateFreeFallUI();
    drawRegressionPlot();
  }

  // Register in PhysicsLabRegistry
  window.PhysicsLabRegistry.registerExperiment({
    id: 'mech_free_fall',
    domainId: 'mechanics',
    title: 'การตกอย่างอิสระและการวัดค่าความเร่งโน้มถ่วง g (Free Fall Photogate)',
    shortTitle: '⚙️ การตกอิสระ',
    icon: '⚙️',
    status: 'active',
    keyFormula: '$$s = \\frac{1}{2}gt^2 \\implies g = \\frac{2h}{t^2} = 2 \\times \\text{Slope}(h \\text{ vs } t^2)$$',
    description: 'ปล่อยลูกเหล็กตกภายใต้แรงโน้มถ่วง ตัดลำแสงโฟโตเกต 3 ระดับความสูง วัดเวลาด้วยความแม่นยำระดับไมโครวินาที และวิเคราะห์กราฟความสัมพันธ์เชิงเส้นเพื่อหาค่า g',
    features: ['Electromagnetic Dropper', '3-Channel Photogates', 'Planet Gravity Selector', 'Linear Regression h vs t²'],
    camera: { position: [0, 1.8, 3.8], target: [0.2, 1.3, 0] },
    topCamera: { position: [0.2, 3.8, 0.1], target: [0.2, 1.3, 0] },

    init(scene) {
      initFreeFall3D(scene);
      this.group = fallGroup;
      this.draggableInstruments = [
        { group: ballMesh, name: 'ลูกเหล็กทรงกลม (Steel Ball)' }
      ];
    },

    activate() {
      updateFreeFall3D();
      updateFreeFallUI();
      drawRegressionPlot();
      renderFreeFallTable();
    },

    update(dt) {
      if (!isDropping) return;

      const elapsed = (performance.now() - dropStartTime) / 1000;

      // Kinematics: y = y0 - 0.5 * g * t^2
      ballVel += gConstant * dt;
      currentY -= ballVel * dt;

      // Photogate trigger checks
      if (currentY <= h1 && t1 === 0) {
        t1 = elapsed;
        playDropSound('gate');
        if (gate1Led) gate1Led.material.emissiveIntensity = 2.5;
      }
      if (currentY <= h2 && t2 === 0) {
        t2 = elapsed;
        playDropSound('gate');
        if (gate2Led) gate2Led.material.emissiveIntensity = 2.5;
      }
      if (currentY <= h3 && t3 === 0) {
        t3 = elapsed;
        playDropSound('gate');
        if (gate3Led) gate3Led.material.emissiveIntensity = 2.5;
      }

      // Ball hits bottom cushion
      if (currentY <= 0.14) {
        currentY = 0.14;
        isDropping = false;
        hasLanded = true;
        playDropSound('thud');

        // Record trial
        if (t3 > 0) {
          const d1 = ballY - h1;
          const d2 = ballY - h2;
          const d3 = ballY - h3;
          const g_avg = ((2 * d1) / (t1 * t1) + (2 * d2) / (t2 * t2) + (2 * d3) / (t3 * t3)) / 3;
          const err = Math.abs((g_avg - gConstant) / gConstant) * 100;
          trialData.unshift({
            planet: planet === 'earth' ? 'โลก (Earth)' : planet === 'moon' ? 'ดวงจันทร์ (Moon)' : 'ดาวอังคาร (Mars)',
            t1, t2, t3,
            g_calc: g_avg,
            err
          });
          if (trialData.length > 8) trialData.pop();
          renderFreeFallTable();
        }
      }

      updateFreeFall3D();
      updateFreeFallUI();
      drawRegressionPlot();
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ ตัวควบคุมการปล่อยวัตถุ & สภาพแวดล้อม</span>
            <span class="badge badge-accent">Free Fall</span>
          </div>

          <div class="control-row">
            <span class="control-label">ดาวเคราะห์ / สนามโน้มถ่วง</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="tab-btn active" id="btn-planet-earth">🌍 โลก ($9.8\text{ m/s}^2$)</button>
            <button class="tab-btn" id="btn-planet-moon">🌕 ดวงจันทร์ ($1.62\text{ m/s}^2$)</button>
            <button class="tab-btn" id="btn-planet-mars">🔴 ดาวอังคาร ($3.71\text{ m/s}^2$)</button>
          </div>

          <div class="control-row" style="margin-top:12px;">
            <span class="control-label">ความสูงตำแหน่งปล่อย ($h_0$)</span>
            <span id="fall-lbl-h0" class="control-val">2.40 m</span>
          </div>
          <input type="range" id="fall-slider-h0" min="2.0" max="2.6" step="0.05" value="2.4" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-fall-release" class="btn-primary" style="flex:1;">
              🎯 ปล่อยวัตถุตกอิสระ (Release)
            </button>
            <button id="btn-fall-reset" class="btn-secondary">
              🔄 รีเซ็ต (Reset)
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📏 ระดับความสูงโฟโตเกต 3 ระดับ</span>
          </div>
          <div class="control-row">
            <span class="control-label">โฟโตเกต 1 ($h_1$)</span>
            <span id="fall-lbl-h1" class="control-val">1.80 m</span>
          </div>
          <input type="range" id="fall-slider-h1" min="1.5" max="2.0" step="0.05" value="1.8" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">โฟโตเกต 2 ($h_2$)</span>
            <span id="fall-lbl-h2" class="control-val">1.10 m</span>
          </div>
          <input type="range" id="fall-slider-h2" min="0.8" max="1.4" step="0.05" value="1.1" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">โฟโตเกต 3 ($h_3$)</span>
            <span id="fall-lbl-h3" class="control-val">0.40 m</span>
          </div>
          <input type="range" id="fall-slider-h3" min="0.2" max="0.7" step="0.05" value="0.4" class="lab-slider" />
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>⏱️ เวลาตัดลำแสง & ค่าความเร่งโน้มถ่วง g</span>
            <span class="badge badge-accent">Multi-Channel Chronometer</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:6px;">
            <div class="stat-tile">
              <span class="stat-tile-label">เวลาเกต 1 ($t_1$)</span>
              <span id="fall-val-t1" class="stat-tile-val" style="color:#38bdf8;">-- ms</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">เวลาเกต 2 ($t_2$)</span>
              <span id="fall-val-t2" class="stat-tile-val" style="color:#38bdf8;">-- ms</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">เวลาเกต 3 ($t_3$)</span>
              <span id="fall-val-t3" class="stat-tile-val" style="color:#38bdf8;">-- ms</span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px;">
            <div class="stat-tile" style="background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3);">
              <span class="stat-tile-label">ความเร่ง $g_{\text{exp}}$ ที่คำนวณได้</span>
              <span id="fall-val-gexp" class="stat-tile-val" style="color:#4ade80; font-size:1.3rem;">-- m/s²</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ความคลาดเคลื่อนเทียบค่าจริง</span>
              <span id="fall-val-err" class="stat-tile-val" style="color:#f59e0b;">-- %</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📈 กราฟความสัมพันธ์เชิงเส้น $h$ กับ $t^2$</span>
            <span class="badge badge-gold">Slope = g/2</span>
          </div>
          <canvas id="fall-plot-canvas" width="380" height="150" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกการตกอิสระ</span>
            <button class="panel-size-btn" onclick="trialData = []; renderFreeFallTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 140px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ครั้ง</th>
                  <th>สถานที่</th>
                  <th>$t_1 / t_2 / t_3$</th>
                  <th>$g_{\text{exp}}$</th>
                  <th>% Error</th>
                </tr>
              </thead>
              <tbody id="fall-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI() {
      const bEarth = document.getElementById('btn-planet-earth');
      const bMoon = document.getElementById('btn-planet-moon');
      const bMars = document.getElementById('btn-planet-mars');

      [
        { btn: bEarth, p: 'earth', g: 9.807 },
        { btn: bMoon, p: 'moon', g: 1.62 },
        { btn: bMars, p: 'mars', g: 3.71 }
      ].forEach(item => {
        if (item.btn) {
          item.btn.addEventListener('click', () => {
            planet = item.p;
            gConstant = item.g;
            [bEarth, bMoon, bMars].forEach(b => b.classList.remove('active'));
            item.btn.classList.add('active');
            resetBall();
          });
        }
      });

      const slH0 = document.getElementById('fall-slider-h0');
      if (slH0) {
        slH0.addEventListener('input', (e) => {
          ballY = parseFloat(e.target.value);
          currentY = ballY;
          const lbl = document.getElementById('fall-lbl-h0');
          if (lbl) lbl.textContent = `${ballY.toFixed(2)} m`;
          updateFreeFall3D();
        });
      }

      const slH1 = document.getElementById('fall-slider-h1');
      if (slH1) {
        slH1.addEventListener('input', (e) => {
          h1 = parseFloat(e.target.value);
          const lbl = document.getElementById('fall-lbl-h1');
          if (lbl) lbl.textContent = `${h1.toFixed(2)} m`;
          updateFreeFall3D();
        });
      }

      const slH2 = document.getElementById('fall-slider-h2');
      if (slH2) {
        slH2.addEventListener('input', (e) => {
          h2 = parseFloat(e.target.value);
          const lbl = document.getElementById('fall-lbl-h2');
          if (lbl) lbl.textContent = `${h2.toFixed(2)} m`;
          updateFreeFall3D();
        });
      }

      const slH3 = document.getElementById('fall-slider-h3');
      if (slH3) {
        slH3.addEventListener('input', (e) => {
          h3 = parseFloat(e.target.value);
          const lbl = document.getElementById('fall-lbl-h3');
          if (lbl) lbl.textContent = `${h3.toFixed(2)} m`;
          updateFreeFall3D();
        });
      }

      const btnRel = document.getElementById('btn-fall-release');
      if (btnRel) btnRel.addEventListener('click', releaseBall);

      const btnRes = document.getElementById('btn-fall-reset');
      if (btnRes) btnRes.addEventListener('click', resetBall);

      updateFreeFallUI();
      drawRegressionPlot();
      renderFreeFallTable();
    }
  });

})();
