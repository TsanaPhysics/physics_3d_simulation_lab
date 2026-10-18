/**
 * js/experiments/em-solenoid.js
 * Domain: Electromagnetism & Induction (แม่เหล็กไฟฟ้าและการเหนี่ยวนำ)
 * Experiment: Magnetic Field of a Solenoid & Biot-Savart Law with Axial Hall Probe
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let solGroup = null;
  let coilMesh, probeGroup, probeTipMesh;
  let fieldLinesGroup;
  let powerSupplyMesh, meterMesh;

  // Experiment State
  let currentI = 2.5;           // Solenoid Current (A)
  let turnsN = 600;             // Total turns N
  let coilLength = 0.30;        // Solenoid length L (m) = 30 cm
  let coilRadius = 0.04;        // Solenoid radius R (m) = 4 cm
  let probeX = 0.0;             // Probe position along axis (-0.25m to +0.25m)
  let isScanning = false;
  let scanDir = 1;
  let scanSpeed = 0.05;         // m/s
  let isPowered = true;

  // Physics calculation: Biot-Savart On-Axis Solenoid Field
  // B(x) = (mu0 * n * I / 2) * [ (x + L/2)/sqrt(R^2 + (x + L/2)^2) - (x - L/2)/sqrt(R^2 + (x - L/2)^2) ]
  function calcBField(x, I, N, L, R) {
    if (!isPowered || I === 0) return 0;
    const mu0 = 4 * Math.PI * 1e-7; // T*m/A
    const n = N / L;                // turns per meter
    const x1 = x + L / 2;
    const x2 = x - L / 2;
    const cosTheta1 = x1 / Math.sqrt(R * R + x1 * x1);
    const cosTheta2 = x2 / Math.sqrt(R * R + x2 * x2);
    const B_Tesla = (mu0 * n * I / 2) * (cosTheta1 - cosTheta2);
    return B_Tesla * 1000; // Return in Millitesla (mT)
  }

  // 3D Scene Initialization
  function initSolenoid3D(scene) {
    solGroup = new THREE.Group();
    solGroup.visible = false;
    scene.add(solGroup);

    // 1. Lab Table Mounting Track
    const bedMesh = new THREE.Mesh(
      new THREE.BoxGeometry(6.2, 0.16, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, roughness: 0.35 })
    );
    bedMesh.position.set(0, 0.08, 0);
    solGroup.add(bedMesh);

    // 2. Solenoid Coil (Length ~ 2.4 units in 3D, Radius ~ 0.5 units)
    coilMesh = new THREE.Group();
    
    // Clear Acrylic Core Cylinder
    const coreCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 2.4, 32, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 0.9,
        opacity: 0.95,
        transparent: true,
        roughness: 0.1
      })
    );
    coreCyl.rotation.z = Math.PI / 2;
    coilMesh.add(coreCyl);

    // Copper Wire Helix / Coils
    const coilCount = 42;
    for (let i = 0; i < coilCount; i++) {
      const zOffset = -1.15 + (i / (coilCount - 1)) * 2.3;
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.5, 0.024, 12, 32),
        new THREE.MeshStandardMaterial({
          color: 0xb45309,
          metalness: 0.85,
          roughness: 0.25
        })
      );
      ring.rotation.y = Math.PI / 2;
      ring.position.set(zOffset, 0, 0);
      coilMesh.add(ring);
    }

    // End Flanges / Collars
    const flangeGeom = new THREE.CylinderGeometry(0.62, 0.62, 0.08, 32);
    const flangeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
    
    const fl1 = new THREE.Mesh(flangeGeom, flangeMat);
    fl1.rotation.z = Math.PI / 2;
    fl1.position.set(-1.22, 0, 0);
    coilMesh.add(fl1);

    const fl2 = new THREE.Mesh(flangeGeom, flangeMat);
    fl2.rotation.z = Math.PI / 2;
    fl2.position.set(1.22, 0, 0);
    coilMesh.add(fl2);

    coilMesh.position.set(0, 0.72, 0);
    solGroup.add(coilMesh);

    // 3. Hall Sensor Probe on Sliding Carriage Rail
    probeGroup = new THREE.Group();

    // Sliding base block
    const carriage = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.15, 0.45),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.6 })
    );
    carriage.position.set(0, 0.24, 0);
    probeGroup.add(carriage);

    // Vertical mounting post
    const vPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.48, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    vPost.position.set(0, 0.48, 0);
    probeGroup.add(vPost);

    // Horizontal Stainless Steel Probe Wand (Enters coil core)
    const wandGeom = new THREE.CylinderGeometry(0.018, 0.018, 2.8, 16);
    const wandMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 });
    const wand = new THREE.Mesh(wandGeom, wandMat);
    wand.rotation.z = Math.PI / 2;
    wand.position.set(-1.4, 0.72, 0);
    probeGroup.add(wand);

    // Hall Probe Chip Sensor Tip (Small black IC with gold dot)
    const tipGeom = new THREE.BoxGeometry(0.06, 0.035, 0.035);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3 });
    probeTipMesh = new THREE.Mesh(tipGeom, tipMat);
    probeTipMesh.position.set(-2.8, 0.72, 0);
    probeGroup.add(probeTipMesh);

    probeGroup.position.set(probeX * 6.0 + 1.4, 0, 0);
    solGroup.add(probeGroup);

    // 4. DC Regulated Current Power Supply Box
    powerSupplyMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.65, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    powerSupplyMesh.position.set(-2.2, 0.48, -0.6);
    solGroup.add(powerSupplyMesh);

    // 5. Digital Teslameter / Gaussmeter Benchtop Display
    meterMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 0.55, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 })
    );
    meterMesh.position.set(2.2, 0.44, -0.6);
    solGroup.add(meterMesh);

    // 6. 3D Dynamic Magnetic Field Vectors (Arrow lattice inside & outside coil)
    fieldLinesGroup = new THREE.Group();
    for (let fx = -1.2; fx <= 1.2; fx += 0.4) {
      for (let fz of [-0.2, 0, 0.2]) {
        const arrow = new THREE.ArrowHelper(
          new THREE.Vector3(1, 0, 0),
          new THREE.Vector3(fx, 0.72, fz),
          0.3,
          0x38bdf8,
          0.06,
          0.04
        );
        fieldLinesGroup.add(arrow);
      }
    }
    solGroup.add(fieldLinesGroup);
  }

  function updateSolenoid3D() {
    if (probeGroup) {
      // Map probeX (-0.25 to +0.25m) to 3D coordinate space
      probeGroup.position.x = (probeX / 0.15) * 1.8 + 1.4;
    }
    if (fieldLinesGroup) {
      const bCenter = calcBField(0, currentI, turnsN, coilLength, coilRadius);
      fieldLinesGroup.visible = isPowered && bCenter > 0.01;
    }
  }

  function updateSolenoidUI() {
    const bMeas = calcBField(probeX, currentI, turnsN, coilLength, coilRadius);
    const bTheoCenter = calcBField(0, currentI, turnsN, coilLength, coilRadius);

    const elB = document.getElementById('sol-val-b');
    const elBCenter = document.getElementById('sol-val-bcenter');
    const elPos = document.getElementById('sol-lbl-x');
    const elI = document.getElementById('sol-lbl-i');

    if (elB) elB.textContent = `${bMeas.toFixed(3)} mT`;
    if (elBCenter) elBCenter.textContent = `${bTheoCenter.toFixed(3)} mT`;
    if (elPos) elPos.textContent = `${(probeX * 100).toFixed(1)} cm`;
    if (elI) elI.textContent = `${currentI.toFixed(2)} A`;
  }

  function drawBFieldProfile() {
    const canvas = document.getElementById('sol-plot-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
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
    ctx.fillText('x (cm)', w - 40, h - 10);
    ctx.save();
    ctx.translate(14, 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('B (mT)', 0, 0);
    ctx.restore();

    // Theoretical Curve B(x) from -25cm to +25cm
    const maxB = Math.max(0.1, calcBField(0, currentI, turnsN, coilLength, coilRadius) * 1.25);
    const minX = -0.25;
    const maxX = 0.25;

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const xVal = minX + (i / steps) * (maxX - minX);
      const bVal = calcBField(xVal, currentI, turnsN, coilLength, coilRadius);

      const px = 40 + (i / steps) * (w - 60);
      const py = (h - 25) - (bVal / maxB) * (h - 45);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Coil boundary shaded region
    const xEdge1 = 40 + ((-coilLength / 2 - minX) / (maxX - minX)) * (w - 60);
    const xEdge2 = 40 + ((coilLength / 2 - minX) / (maxX - minX)) * (w - 60);

    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fillRect(xEdge1, 15, xEdge2 - xEdge1, h - 40);

    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(xEdge1, 15);
    ctx.lineTo(xEdge1, h - 25);
    ctx.moveTo(xEdge2, 15);
    ctx.lineTo(xEdge2, h - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Current Probe Marker
    const probePx = 40 + ((probeX - minX) / (maxX - minX)) * (w - 60);
    const probeB = calcBField(probeX, currentI, turnsN, coilLength, coilRadius);
    const probePy = (h - 25) - (probeB / maxB) * (h - 45);

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(probePx, probePy, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Register in PhysicsLabRegistry
  window.PhysicsLabRegistry.registerExperiment({
    id: 'em_solenoid_field',
    domainId: 'electromagnetism',
    title: 'สนามแม่เหล็กจากกระแสไฟฟ้าในขดลวดโซเลนอยด์ (Solenoid Magnetic Field)',
    shortTitle: '🧲 ขดลวดโซเลนอยด์',
    icon: '🧲',
    status: 'active',
    keyFormula: '$$B(x) = \\frac{\\mu_0 n I}{2}\\left[\\frac{x+L/2}{\\sqrt{R^2+(x+L/2)^2}} - \\frac{x-L/2}{\\sqrt{R^2+(x-L/2)^2}}\\right]$$ \\quad (B_{\\text{center}} = \\mu_0 n I)',
    description: 'ศึกษาการกระจายตัวของความหนาแน่นฟลักซ์แม่เหล็กตามแนวแกนภายในและภายนอกโซเลนอยด์ด้วยหัววัด Hall Probe ตามกฎของบิโอต์-ซาวารต์และแอมแปร์',
    features: ['Axial Hall Effect Sensor', 'Biot-Savart Analytical Curve', 'Current & Turn Controller', 'Permeability Constant μ0'],
    camera: { position: [0, 2.6, 4.4], target: [0, 0.7, 0] },
    topCamera: { position: [0, 5.8, 0.1], target: [0, 0.7, 0] },

    init(scene) {
      initSolenoid3D(scene);
      this.group = solGroup;
      this.draggableInstruments = [
        { group: probeGroup, name: 'หัววัดสนามแม่เหล็กฮอลล์ (Hall Probe)' }
      ];
    },

    activate() {
      updateSolenoid3D();
      updateSolenoidUI();
      drawBFieldProfile();
    },

    update(dt) {
      if (isScanning) {
        probeX += scanDir * scanSpeed * dt;
        if (probeX > 0.22) {
          probeX = 0.22;
          scanDir = -1;
        } else if (probeX < -0.22) {
          probeX = -0.22;
          scanDir = 1;
        }
        const slX = document.getElementById('sol-slider-x');
        if (slX) slX.value = probeX.toString();
        updateSolenoid3D();
        updateSolenoidUI();
        drawBFieldProfile();
      }
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ ตัวควบคุมกระแส & ขดลวดโซเลนอยด์</span>
            <span class="badge badge-accent">Biot-Savart</span>
          </div>

          <div class="control-row">
            <span class="control-label">กระแสไฟฟ้าจ่าย ($I$)</span>
            <span id="sol-lbl-i" class="control-val">2.50 A</span>
          </div>
          <input type="range" id="sol-slider-i" min="0" max="5.0" step="0.1" value="2.5" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">จำนวนรอบขดลวด ($N$)</span>
            <span class="control-val" id="sol-lbl-n">600 รอบ</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="tab-btn" id="btn-sol-300">300 รอบ</button>
            <button class="tab-btn active" id="btn-sol-600">600 รอบ</button>
            <button class="tab-btn" id="btn-sol-1200">1200 รอบ</button>
          </div>

          <div class="control-row" style="margin-top:12px;">
            <span class="control-label">ตำแหน่งหัววัด Hall Probe ($x$)</span>
            <span id="sol-lbl-x" class="control-val">0.0 cm</span>
          </div>
          <input type="range" id="sol-slider-x" min="-0.22" max="0.22" step="0.005" value="0.0" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-sol-scan" class="btn-primary" style="flex:1;">
              🚗 กวาดหัววัดอัตโนมัติ (Auto Scan)
            </button>
            <button id="btn-sol-power" class="btn-secondary">
              ⚡ ปิด/เปิด แหล่งจ่าย
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📐 มิติและคุณสมบัติทางเรขาคณิต</span>
          </div>
          <div style="font-size:0.84rem; line-height:1.6; opacity:0.85;">
            • ความยาวโซเลนอยด์: $L = 30.0\\text{ cm}$<br/>
            • รัศมีเฉลี่ยขดลวด: $R = 4.0\\text{ cm}$<br/>
            • สภาพยอมรับได้ทางแม่เหล็ก: $\\mu_0 = 4\\pi \\times 10^{-7}\\text{ T}\\cdot\\text{m/A}$<br/>
            • ที่จุดกึ่งกลาง ($x=0$): $B_0 \\approx \\mu_0 \\left(\\frac{N}{L}\\right) I$<br/>
            • ที่ปลายขอบ ($x=\\pm L/2$): $B_{\\text{edge}} \\approx \\frac{1}{2} B_0$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📊 ค่าความหนาแน่นฟลักซ์แม่เหล็ก B</span>
            <span class="badge badge-accent">Digital Teslameter</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="stat-tile" style="background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3);">
              <span class="stat-tile-label">สนามแม่เหล็กที่ตำแหน่งวัด $B(x)$</span>
              <span id="sol-val-b" class="stat-tile-val" style="color:#38bdf8; font-size:1.4rem;">6.283 mT</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">สนามแม่เหล็กกึ่งกลาง $B_{\\text{center}}$</span>
              <span id="sol-val-bcenter" class="stat-tile-val" style="color:#4ade80;">6.283 mT</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📈 กราฟการกระจายตัวสนามแม่เหล็กตามแนวแกน $B(x)$</span>
            <span class="badge badge-gold">Axial Profile</span>
          </div>
          <canvas id="sol-plot-canvas" width="380" height="150" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:6px; text-align:center;">
            โซนสีส้มไฮไลต์คือความยาวภายในขดลวดโซเลนอยด์ (สนามแม่เหล็กสม่ำเสมอสูงสุด)
          </div>
        </div>
      `;
    },

    mountUI() {
      const slI = document.getElementById('sol-slider-i');
      if (slI) {
        slI.addEventListener('input', (e) => {
          currentI = parseFloat(e.target.value);
          updateSolenoid3D();
          updateSolenoidUI();
          drawBFieldProfile();
        });
      }

      const slX = document.getElementById('sol-slider-x');
      if (slX) {
        slX.addEventListener('input', (e) => {
          isScanning = false;
          const btn = document.getElementById('btn-sol-scan');
          if (btn) btn.classList.remove('active');

          probeX = parseFloat(e.target.value);
          updateSolenoid3D();
          updateSolenoidUI();
          drawBFieldProfile();
        });
      }

      const b300 = document.getElementById('btn-sol-300');
      const b600 = document.getElementById('btn-sol-600');
      const b1200 = document.getElementById('btn-sol-1200');

      [
        { btn: b300, n: 300 },
        { btn: b600, n: 600 },
        { btn: b1200, n: 1200 }
      ].forEach(item => {
        if (item.btn) {
          item.btn.addEventListener('click', () => {
            turnsN = item.n;
            [b300, b600, b1200].forEach(b => b.classList.remove('active'));
            item.btn.classList.add('active');
            const lbl = document.getElementById('sol-lbl-n');
            if (lbl) lbl.textContent = `${turnsN} รอบ`;
            updateSolenoid3D();
            updateSolenoidUI();
            drawBFieldProfile();
          });
        }
      });

      const btnScan = document.getElementById('btn-sol-scan');
      if (btnScan) {
        btnScan.addEventListener('click', () => {
          isScanning = !isScanning;
          btnScan.classList.toggle('active', isScanning);
        });
      }

      const btnPower = document.getElementById('btn-sol-power');
      if (btnPower) {
        btnPower.addEventListener('click', () => {
          isPowered = !isPowered;
          btnPower.textContent = isPowered ? '⚡ ปิดแหล่งจ่าย' : '🔌 เปิดแหล่งจ่าย';
          updateSolenoid3D();
          updateSolenoidUI();
          drawBFieldProfile();
        });
      }

      updateSolenoidUI();
      drawBFieldProfile();
    }
  });

})();
