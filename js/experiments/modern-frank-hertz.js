/**
 * js/experiments/modern-frank-hertz.js
 * Domain: Modern & Quantum Physics (ฟิสิกส์ยุคใหม่และควอนตัม)
 * Experiment: The Franck-Hertz Experiment & Atomic Energy Quantization
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let fhGroup = null;
  let ovenMesh, tubeMesh, windowMesh;
  let filamentGlowMesh, electronCloudMesh;
  let powerSupplyMesh, pAmMesh;

  // Experiment State
  let accelVoltage = 0.0;       // U1 / Va accelerating voltage (0 - 30 V)
  let retardingVoltage = 1.5;   // U2 retarding potential (V)
  let ovenTemp = 175.0;         // Temperature (°C)
  let isAutoSweeping = false;
  let sweepDir = 1;
  let isFilamentOn = true;

  // Franck-Hertz Current Model:
  // Mercury (Hg) first excited state is 4.86 eV (~4.9 eV)
  // At voltages: 4.9V, 9.8V, 14.7V, 19.6V, 24.5V, electrons undergo inelastic collision
  // losing energy and failing to cross the retarding potential barrier, dropping the collector current.
  function calcAnodeCurrent(Va, Vr) {
    if (!isFilamentOn || Va <= 0.5) return 0.0;
    const deltaE = 4.86; // eV excitation threshold for Hg (6^3P_1)
    
    // Base rising space-charge current I ~ Va^1.5 (Child-Langmuir law trend)
    const baseEnvelope = Math.pow(Va / 30.0, 1.35) * 18.0; // nA peak scale

    // Inelastic drop modulation:
    // When remainder (Va % 4.86) is near 0, electrons just gave up their energy and can't beat Vr
    const nCollisions = Math.floor(Va / deltaE);
    const remainder = Va - nCollisions * deltaE;

    // Fractional energy available to cross barrier Vr
    let transmission = 0.0;
    if (remainder > Vr) {
      transmission = Math.pow((remainder - Vr) / (deltaE - Vr), 1.2);
    } else {
      transmission = 0.04; // Small leakage
    }

    // Current rises with voltage cycle, drops at collision threshold
    const oscillation = 0.25 + 0.75 * transmission;
    const current_nA = baseEnvelope * oscillation + (Math.random() * 0.08);
    return Math.max(0.0, current_nA);
  }

  // 3D Scene Initialization
  function initFranckHertz3D(scene) {
    fhGroup = new THREE.Group();
    fhGroup.visible = false;
    scene.add(fhGroup);

    // 1. Lab Table Base
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.16, 2.2), tableMat);
    bench.position.set(0, 0.08, 0);
    fhGroup.add(bench);

    // 2. Heated Oven Chamber with Ceramic Insulation (Center x = -0.5)
    ovenMesh = new THREE.Group();
    
    // Metallic Oven Outer Box
    const ovenBox = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.4, 1.4),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.3 })
    );
    ovenBox.position.set(0, 0.85, 0);
    ovenMesh.add(ovenBox);

    // Circular Observation Window with Quartz Glass
    const winRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.38, 0.06, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 })
    );
    winRing.rotation.x = Math.PI / 2;
    winRing.position.set(0, 0.85, 0.71);
    ovenMesh.add(winRing);

    const winGlass = new THREE.Mesh(
      new THREE.CircleGeometry(0.32, 32),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.92,
        opacity: 0.95,
        transparent: true,
        roughness: 0.05
      })
    );
    winGlass.position.set(0, 0.85, 0.74);
    ovenMesh.add(winGlass);

    // Internal Tetrode Tube visible through window
    tubeMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.7, 24),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transmission: 0.85,
        transparent: true,
        opacity: 0.75,
        roughness: 0.1
      })
    );
    tubeMesh.position.set(0, 0.85, 0.1);
    ovenMesh.add(tubeMesh);

    // Cathode Filament Glow (Orange / Yellow)
    filamentGlowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.8 })
    );
    filamentGlowMesh.position.set(0, 0.62, 0.1);
    ovenMesh.add(filamentGlowMesh);

    // Accelerating Grid Wire Mesh Cylinders (G1 and G2)
    const grid1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.5, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true })
    );
    grid1.position.set(0, 0.85, 0.1);
    ovenMesh.add(grid1);

    const grid2 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.5, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true })
    );
    grid2.position.set(0, 0.85, 0.1);
    ovenMesh.add(grid2);

    // Digital Oven Thermostat Display on side
    const thermoDisp = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.25, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x090d16 })
    );
    thermoDisp.position.set(-0.55, 1.35, 0.71);
    ovenMesh.add(thermoDisp);

    ovenMesh.position.set(-0.6, 0, 0);
    fhGroup.add(ovenMesh);

    // 3. DC Accelerating Voltage Power Supply Unit (Right x = 1.4)
    powerSupplyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.75, 0.85),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.25 })
    );
    powerSupplyMesh.position.set(1.4, 0.48, -0.3);
    fhGroup.add(powerSupplyMesh);

    // 4. Ultra-Sensitive Picoammeter / Electrometer Display (x = 1.4, y = 1.0)
    pAmMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.45, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 })
    );
    pAmMesh.position.set(1.4, 1.05, -0.3);
    fhGroup.add(pAmMesh);
  }

  function updateFranckHertz3D() {
    if (filamentGlowMesh) {
      filamentGlowMesh.visible = isFilamentOn;
      // Mercury vapor excitation glow when voltage is high
      if (tubeMesh) {
        const glow = Math.min(1.2, accelVoltage / 20.0);
        tubeMesh.material.color.setRGB(0.2 + glow * 0.3, 0.7, 1.0);
      }
    }
  }

  function updateFranckHertzUI() {
    const current_nA = calcAnodeCurrent(accelVoltage, retardingVoltage);

    const elVa = document.getElementById('fh-lbl-va');
    const elIa = document.getElementById('fh-val-ia');
    const elDeltaE = document.getElementById('fh-val-deltae');
    const elLambda = document.getElementById('fh-val-lambda');

    if (elVa) elVa.textContent = `${accelVoltage.toFixed(1)} V`;
    if (elIa) elIa.textContent = `${current_nA.toFixed(2)} nA`;
    if (elDeltaE) elDeltaE.textContent = `4.86 eV (Hg 6³P₁)`;
    if (elLambda) elLambda.textContent = `253.7 nm (UV)`;
  }

  function drawFranckHertzCurve() {
    const canvas = document.getElementById('fh-plot-canvas');
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
    ctx.fillText('Va (V)', w - 35, h - 10);
    ctx.save();
    ctx.translate(14, 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Ia (nA)', 0, 0);
    ctx.restore();

    // Plot Full Theoretical Franck-Hertz Oscillation Curve (0 to 30 V)
    const maxVa = 30.0;
    const maxIa = 20.0;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const v = (i / steps) * maxVa;
      const iVal = calcAnodeCurrent(v, retardingVoltage);
      const px = 40 + (v / maxVa) * (w - 60);
      const py = (h - 25) - (iVal / maxIa) * (h - 45);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Highlight 4.9 V Resonance Peak Droplines
    const peaks = [4.9, 9.8, 14.7, 19.6, 24.5];
    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([3, 3]);

    peaks.forEach(pv => {
      const px = 40 + (pv / maxVa) * (w - 60);
      ctx.beginPath();
      ctx.moveTo(px, 15);
      ctx.lineTo(px, h - 25);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = '9px monospace';
      ctx.fillText(`${pv}V`, px - 10, 26);
    });
    ctx.setLineDash([]);

    // Current Operating Marker
    const curPx = 40 + (accelVoltage / maxVa) * (w - 60);
    const curIa = calcAnodeCurrent(accelVoltage, retardingVoltage);
    const curPy = (h - 25) - (curIa / maxIa) * (h - 45);

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
    id: 'modern_frank_hertz',
    domainId: 'modern',
    title: 'การทดลองของฟรังก์-เฮิรตซ์และระดับพลังงานของอะตอม (Franck-Hertz Experiment)',
    shortTitle: '⚛️ ฟรังก์-เฮิรตซ์',
    icon: '⚛️',
    status: 'active',
    keyFormula: '$$\\Delta E = e\\,\\Delta V = 4.86\\text{ eV (Mercury Hg)} \\implies \\lambda = \\frac{hc}{\\Delta E} \\approx 253.7\\text{ nm}$$',
    description: 'ศึกษาการชนแบบไม่ยืดหยุ่นระหว่างอิเล็กตรอนกับอะตอมไอปรอท แสดงการมีอยู่ของระดับพลังงานที่ไม่ต่อเนื่องของอะตอมตามแบบจำลองของบอร์',
    features: ['Mercury Vapor Tetrode Tube', 'Periodic 4.86 V Current Drops', 'Auto Voltage Sweep (0-30V)', 'Bohr Quantization Solver'],
    camera: { position: [0.3, 2.4, 4.4], target: [0.3, 0.7, 0] },
    topCamera: { position: [0.3, 5.5, 0.1], target: [0.3, 0.7, 0] },

    init(scene) {
      initFranckHertz3D(scene);
      this.group = fhGroup;
      this.draggableInstruments = [
        { group: powerSupplyMesh, name: 'แหล่งจ่ายแรงดันเร่ง (Accelerating Power Supply)' }
      ];
    },

    activate() {
      updateFranckHertz3D();
      updateFranckHertzUI();
      drawFranckHertzCurve();
    },

    update(dt) {
      if (isAutoSweeping) {
        accelVoltage += sweepDir * (dt * 4.0); // Sweep 4 V per second
        if (accelVoltage >= 30.0) {
          accelVoltage = 30.0;
          sweepDir = -1;
        } else if (accelVoltage <= 0.0) {
          accelVoltage = 0.0;
          sweepDir = 1;
        }

        const slVa = document.getElementById('fh-slider-va');
        if (slVa) slVa.value = accelVoltage.toString();

        updateFranckHertz3D();
        updateFranckHertzUI();
        drawFranckHertzCurve();
      }
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ แรงดันไฟฟ้าเร่ง & ตัวควบคุมเตาอบ</span>
            <span class="badge badge-accent">Franck-Hertz</span>
          </div>

          <div class="control-row">
            <span class="control-label">แรงดันเร่งขั้วบวก ($V_a$)</span>
            <span id="fh-lbl-va" class="control-val">0.0 V</span>
          </div>
          <input type="range" id="fh-slider-va" min="0" max="30.0" step="0.2" value="0.0" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">แรงดันต้านย้อนกลับ ($V_r$)</span>
            <span id="fh-lbl-vr" class="control-val">1.5 V</span>
          </div>
          <input type="range" id="fh-slider-vr" min="1.0" max="2.5" step="0.1" value="1.5" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">อุณหภูมิเตาอบไอปรอท ($T$)</span>
            <span class="control-val">175 °C (คงที่)</span>
          </div>

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-fh-sweep" class="btn-primary" style="flex:1;">
              ⚡ กวาดแรงดันอัตโนมัติ (Auto Sweep)
            </button>
            <button id="btn-fh-filament" class="btn-secondary">
              💡 ไส้หลอด: เปิด
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>⚛️ ทฤษฎีระดับพลังงานควอนตัมของบอร์</span>
          </div>
          <div style="font-size:0.84rem; line-height:1.6; opacity:0.85;">
            • ไอปรอทสถานะพื้น: $6^1S_0$<br/>
            • สถานะกระตุ้นแรก: $6^3P_1$ (พลังงาน $\mathbf{4.86\\text{ eV}}$)<br/>
            • เมื่ออิเล็กตรอนมี $E_k \\ge 4.86\\text{ eV}$ จะถ่ายโอนพลังงานทั้งหมดให้อะตอม ทำให้กระแสแอนโหนดตกลงทุกๆ รอบ $4.86\\text{ V}$<br/>
            • โฟตอนที่คายออกมา: $\\lambda = \\frac{hc}{\\Delta E} = \\mathbf{253.7\\text{ nm}}$ (รังสีอัลตราไวโอเลต)
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📊 กระแสไฟฟ้าคอลเล็กเตอร์ & ค่าพลังงานกระตุ้น</span>
            <span class="badge badge-accent">Electrometer</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="stat-tile" style="background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3);">
              <span class="stat-tile-label">กระแสคอลเล็กเตอร์ ($I_A$)</span>
              <span id="fh-val-ia" class="stat-tile-val" style="color:#38bdf8; font-size:1.4rem;">0.00 nA</span>
            </div>
            <div class="stat-tile" style="background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3);">
              <span class="stat-tile-label">พลังงานกระตุ้น ($\Delta E$)</span>
              <span id="fh-val-deltae" class="stat-tile-val" style="color:#4ade80;">4.86 eV</span>
            </div>
            <div class="stat-tile" style="grid-column: span 2;">
              <span class="stat-tile-label">ความยาวคลื่นโฟตอนที่แผ่ออกมา ($\lambda$)</span>
              <span id="fh-val-lambda" class="stat-tile-val" style="color:#f59e0b;">253.7 nm (UV)</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📈 เส้นโค้งลักษณะสมบัติฟรังก์-เฮิรตซ์ $I_A$ กับ $V_a$</span>
            <span class="badge badge-gold">Periodic Peaks (ΔV = 4.9V)</span>
          </div>
          <canvas id="fh-plot-canvas" width="380" height="150" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:6px; text-align:center;">
            เส้นประสีส้มแสดงตำแหน่งเกิดการชนแบบไม่ยืดหยุ่น ($4.9\\text{V}, 9.8\\text{V}, 14.7\\text{V}, 19.6\\text{V}, 24.5\\text{V}$)
          </div>
        </div>
      `;
    },

    mountUI() {
      const slVa = document.getElementById('fh-slider-va');
      if (slVa) {
        slVa.addEventListener('input', (e) => {
          isAutoSweeping = false;
          const btn = document.getElementById('btn-fh-sweep');
          if (btn) btn.classList.remove('active');

          accelVoltage = parseFloat(e.target.value);
          updateFranckHertz3D();
          updateFranckHertzUI();
          drawFranckHertzCurve();
        });
      }

      const slVr = document.getElementById('fh-slider-vr');
      if (slVr) {
        slVr.addEventListener('input', (e) => {
          retardingVoltage = parseFloat(e.target.value);
          const lbl = document.getElementById('fh-lbl-vr');
          if (lbl) lbl.textContent = `${retardingVoltage.toFixed(1)} V`;
          updateFranckHertzUI();
          drawFranckHertzCurve();
        });
      }

      const btnSweep = document.getElementById('btn-fh-sweep');
      if (btnSweep) {
        btnSweep.addEventListener('click', () => {
          isAutoSweeping = !isAutoSweeping;
          btnSweep.classList.toggle('active', isAutoSweeping);
        });
      }

      const btnFil = document.getElementById('btn-fh-filament');
      if (btnFil) {
        btnFil.addEventListener('click', () => {
          isFilamentOn = !isFilamentOn;
          btnFil.textContent = isFilamentOn ? '💡 ไส้หลอด: เปิด' : '🔌 ไส้หลอด: ปิด';
          updateFranckHertz3D();
          updateFranckHertzUI();
          drawFranckHertzCurve();
        });
      }

      updateFranckHertz3D();
      updateFranckHertzUI();
      drawFranckHertzCurve();
    }
  });

})();
