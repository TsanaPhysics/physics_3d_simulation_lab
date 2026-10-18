/**
 * js/experiments/em-helmholtz.js
 * Domain: Electromagnetism & Induction (แม่เหล็กไฟฟ้าและการเหนี่ยวนำ)
 * Experiment: Helmholtz Coils & Uniform Magnetic Field Mapping
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let helmGroup = null;
  let coil1Mesh, coil2Mesh, railMesh, probeMesh;
  let fieldArrowGroup;

  // Experiment State
  let currentI = 2.0;           // Current (A)
  let turnsN = 200;             // Turns per coil
  let coilRadius = 0.15;        // Coil Radius R (m) = 15 cm
  let separationD = 0.15;       // Separation d (m), default d = R (Helmholtz condition)
  let probeZ = 0.0;             // Hall probe Z position along axis (-0.25 to +0.25 m)

  // Biot-Savart Law for Pair of Coaxial Circular Coils:
  // B(z) = (mu0 * N * I * R^2 / 2) * [ 1/(R^2 + (z - d/2)^2)^(3/2) + 1/(R^2 + (z + d/2)^2)^(3/2) ]
  function calcHelmholtzB(z, I, N, R, d) {
    if (I === 0) return 0;
    const mu0 = 4 * Math.PI * 1e-7;
    const factor = (mu0 * N * I * R * R) / 2;

    const term1 = Math.pow(R * R + Math.pow(z - d / 2, 2), -1.5);
    const term2 = Math.pow(R * R + Math.pow(z + d / 2, 2), -1.5);

    const B_Tesla = factor * (term1 + term2);
    return B_Tesla * 1000; // Return in mT
  }

  // 3D Scene Initialization
  function initHelmholtz3D(scene) {
    helmGroup = new THREE.Group();
    helmGroup.visible = false;
    scene.add(helmGroup);

    // 1. Heavy Wooden/Metal Base Track with Metric Scale
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.15, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })
    );
    bed.position.set(0, 0.075, 0);
    helmGroup.add(bed);

    // 2. Coils Creation Function
    function createCoil(colorHex) {
      const g = new THREE.Group();
      
      // Large circular acrylic bobbin ring
      const bobbin = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.08, 16, 48),
        new THREE.MeshPhysicalMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 })
      );
      g.add(bobbin);

      // Wound copper wire bundle inside groove
      const copper = new THREE.Mesh(
        new THREE.TorusGeometry(1.2, 0.06, 16, 48),
        new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.9, roughness: 0.2 })
      );
      g.add(copper);

      // Support pillar and clamp foot
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.25, 16),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
      );
      post.position.set(0, -0.62, 0);
      g.add(post);

      const foot = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.1, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7 })
      );
      foot.position.set(0, -1.25, 0);
      g.add(foot);

      g.position.set(0, 1.35, 0);
      return g;
    }

    coil1Mesh = createCoil(0xb45309);
    coil1Mesh.rotation.y = Math.PI / 2;
    helmGroup.add(coil1Mesh);

    coil2Mesh = createCoil(0xb45309);
    coil2Mesh.rotation.y = Math.PI / 2;
    helmGroup.add(coil2Mesh);

    // 3. Hall Probe Carriage with wand
    probeMesh = new THREE.Group();
    const wand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95 })
    );
    wand.rotation.x = Math.PI / 2;
    probeMesh.add(wand);

    const tip = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.04, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xef4444 })
    );
    tip.position.set(0, 0, 0);
    probeMesh.add(tip);

    probeMesh.position.set(0, 1.35, 0);
    helmGroup.add(probeMesh);

    // 4. Vector Field Lattice in Central Uniform Region
    fieldArrowGroup = new THREE.Group();
    for (let x of [-0.3, 0, 0.3]) {
      for (let y of [-0.3, 0, 0.3]) {
        for (let z of [-0.4, 0, 0.4]) {
          const arrow = new THREE.ArrowHelper(
            new THREE.Vector3(0, 0, 1),
            new THREE.Vector3(x, 1.35 + y, z),
            0.28,
            0x38bdf8,
            0.05,
            0.03
          );
          fieldArrowGroup.add(arrow);
        }
      }
    }
    helmGroup.add(fieldArrowGroup);
  }

  function updateHelmholtz3D() {
    // 3D scale: 1m real = 8.0 units in 3D
    const halfD_3D = (separationD / 2) * 8.0;
    if (coil1Mesh) coil1Mesh.position.z = -halfD_3D;
    if (coil2Mesh) coil2Mesh.position.z = halfD_3D;
    if (probeMesh) probeMesh.position.z = probeZ * 8.0;
  }

  function updateHelmholtzUI() {
    const bProbe = calcHelmholtzB(probeZ, currentI, turnsN, coilRadius, separationD);
    const bCenter = calcHelmholtzB(0, currentI, turnsN, coilRadius, separationD);

    const elB = document.getElementById('helm-val-b');
    const elBCenter = document.getElementById('helm-val-bcenter');
    const elZ = document.getElementById('helm-lbl-z');
    const elD = document.getElementById('helm-lbl-d');
    const elI = document.getElementById('helm-lbl-i');
    const elCond = document.getElementById('helm-val-cond');

    if (elB) elB.textContent = `${bProbe.toFixed(3)} mT`;
    if (elBCenter) elBCenter.textContent = `${bCenter.toFixed(3)} mT`;
    if (elZ) elZ.textContent = `${(probeZ * 100).toFixed(1)} cm`;
    if (elD) elD.textContent = `${(separationD * 100).toFixed(1)} cm`;
    if (elI) elI.textContent = `${currentI.toFixed(2)} A`;

    if (elCond) {
      const isHelmholtz = Math.abs(separationD - coilRadius) < 0.005;
      if (isHelmholtz) {
        elCond.innerHTML = '<span class="badge badge-accent">สม่ำเสมอสูงสุด ($d = R$)</span>';
      } else if (separationD < coilRadius) {
        elCond.innerHTML = '<span class="badge badge-gold">จุดยอดกลาง ($d < R$)</span>';
      } else {
        elCond.innerHTML = '<span class="badge badge-gold">แอ่งอานม้า ($d > R$)</span>';
      }
    }
  }

  function drawHelmholtzPlot() {
    const canvas = document.getElementById('helm-plot-canvas');
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
    ctx.fillText('z (cm)', w - 40, h - 10);
    ctx.save();
    ctx.translate(14, 50);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('B (mT)', 0, 0);
    ctx.restore();

    // Plot Curves from -20cm to +20cm
    const minZ = -0.20;
    const maxZ = 0.20;
    const bRef = calcHelmholtzB(0, currentI, turnsN, coilRadius, coilRadius);
    const maxB = Math.max(0.1, bRef * 1.35);

    // Curve 1: Helmholtz Pair Total Field
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();

    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const zVal = minZ + (i / steps) * (maxZ - minZ);
      const bVal = calcHelmholtzB(zVal, currentI, turnsN, coilRadius, separationD);
      const px = 40 + (i / steps) * (w - 60);
      const py = (h - 25) - (bVal / maxB) * (h - 45);

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Coil Plane Indicators
    const zC1 = 40 + ((-separationD / 2 - minZ) / (maxZ - minZ)) * (w - 60);
    const zC2 = 40 + ((separationD / 2 - minZ) / (maxZ - minZ)) * (w - 60);

    ctx.strokeStyle = '#f59e0b';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(zC1, 15);
    ctx.lineTo(zC1, h - 25);
    ctx.moveTo(zC2, 15);
    ctx.lineTo(zC2, h - 25);
    ctx.stroke();
    ctx.setLineDash([]);

    // Probe Marker
    const probePx = 40 + ((probeZ - minZ) / (maxZ - minZ)) * (w - 60);
    const probeB = calcHelmholtzB(probeZ, currentI, turnsN, coilRadius, separationD);
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
    id: 'em_helmholtz_coils',
    domainId: 'electromagnetism',
    title: 'ขดลวดเฮล์มโฮลทซ์และสนามแม่เหล็กสม่ำเสมอ (Helmholtz Coils & Biot-Savart)',
    shortTitle: '🧲 ขดลวดเฮล์มโฮลทซ์',
    icon: '🧲',
    status: 'active',
    keyFormula: '$$B_{\\text{center}} = \\left(\\frac{4}{5}\\right)^{3/2} \\frac{\\mu_0 N I}{R} \\approx 0.7155\\,\\frac{\\mu_0 N I}{R}$$',
    description: 'ศึกษาการสร้างสนามแม่เหล็กสม่ำเสมอระหว่างขดลวดวงกลมคู่ขนาน 2 วง วางห่างกันเท่ากับรัศมี R ตามเงื่อนไขของเฮล์มโฮลทซ์',
    features: ['Dual Circular Coils', 'Uniform Region Mapper', 'Biot-Savart Analytical Sum', 'Coil Separation Slider'],
    camera: { position: [0, 3.2, 5.4], target: [0, 1.2, 0] },
    topCamera: { position: [0, 6.5, 0.1], target: [0, 1.2, 0] },

    init(scene) {
      initHelmholtz3D(scene);
      this.group = helmGroup;
      this.draggableInstruments = [
        { group: probeMesh, name: 'หัววัดสนามแม่เหล็กฮอลล์ (Hall Probe)' }
      ];
    },

    activate() {
      updateHelmholtz3D();
      updateHelmholtzUI();
      drawHelmholtzPlot();
    },

    update(dt) {
      // Static updates
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ ตัวควบคุมขดลวดเฮล์มโฮลทซ์</span>
            <span class="badge badge-accent">Helmholtz Coils</span>
          </div>

          <div class="control-row">
            <span class="control-label">กระแสไฟฟ้าจ่าย ($I$)</span>
            <span id="helm-lbl-i" class="control-val">2.00 A</span>
          </div>
          <input type="range" id="helm-slider-i" min="0" max="5.0" step="0.1" value="2.0" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">ระยะห่างระหว่างขดลวด ($d$)</span>
            <span id="helm-lbl-d" class="control-val">15.0 cm ($d = R$)</span>
          </div>
          <input type="range" id="helm-slider-d" min="0.08" max="0.25" step="0.005" value="0.15" class="lab-slider" />

          <div style="display:flex; gap:6px; margin-top:8px;">
            <button class="tab-btn" id="btn-helm-d-small">$d < R$ (แคบ)</button>
            <button class="tab-btn active" id="btn-helm-d-exact">$d = R$ (เงื่อนไข)</button>
            <button class="tab-btn" id="btn-helm-d-large">$d > R$ (กว้าง)</button>
          </div>

          <div class="control-row" style="margin-top:12px;">
            <span class="control-label">ตำแหน่งหัววัด Hall Probe ($z$)</span>
            <span id="helm-lbl-z" class="control-val">0.0 cm</span>
          </div>
          <input type="range" id="helm-slider-z" min="-0.18" max="0.18" step="0.005" value="0.0" class="lab-slider" />
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📐 ทฤษฎีและเงื่อนไขความสม่ำเสมอ</span>
          </div>
          <div style="font-size:0.84rem; line-height:1.6; opacity:0.85;">
            • รัศมีขดลวด: $R = 15.0\\text{ cm}$<br/>
            • เมื่อ $d = R$: อนุพันธ์อันดับหนึ่ง $\\frac{dB}{dz} = 0$ และอันดับสอง $\\frac{d^2B}{dz^2} = 0$<br/>
            • ทำให้เกิดบริเวณสนามแม่เหล็กที่มีความสม่ำเสมอสูงมาก (Uniform Field) ในช่วง $-R/3 < z < R/3$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📊 ผลการวัดความหนาแน่นฟลักซ์ B</span>
            <span class="badge badge-accent">Helmholtz Field</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="stat-tile" style="background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3);">
              <span class="stat-tile-label">สนามแม่เหล็กที่ตำแหน่งวัด $B(z)$</span>
              <span id="helm-val-b" class="stat-tile-val" style="color:#38bdf8; font-size:1.4rem;">2.400 mT</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">สนามแม่เหล็กกึ่งกลาง $B_{\\text{center}}$</span>
              <span id="helm-val-bcenter" class="stat-tile-val" style="color:#4ade80;">2.400 mT</span>
            </div>
            <div class="stat-tile" style="grid-column: span 2;">
              <span class="stat-tile-label">สถานะความสม่ำเสมอของสนามแม่เหล็ก</span>
              <div id="helm-val-cond" style="margin-top:4px;"></div>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📈 กราฟการกระจายตัวสนามแม่เหล็ก $B(z)$</span>
            <span class="badge badge-gold">Axial Uniformity</span>
          </div>
          <canvas id="helm-plot-canvas" width="380" height="150" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
          <div style="font-size:0.75rem; color:#94a3b8; margin-top:6px; text-align:center;">
            เส้นประสีส้มแสดงระนาบของขดลวดทั้งสองวง ($z = \\pm d/2$)
          </div>
        </div>
      `;
    },

    mountUI() {
      const slI = document.getElementById('helm-slider-i');
      if (slI) {
        slI.addEventListener('input', (e) => {
          currentI = parseFloat(e.target.value);
          updateHelmholtzUI();
          drawHelmholtzPlot();
        });
      }

      const slD = document.getElementById('helm-slider-d');
      if (slD) {
        slD.addEventListener('input', (e) => {
          separationD = parseFloat(e.target.value);
          updateHelmholtz3D();
          updateHelmholtzUI();
          drawHelmholtzPlot();
        });
      }

      const slZ = document.getElementById('helm-slider-z');
      if (slZ) {
        slZ.addEventListener('input', (e) => {
          probeZ = parseFloat(e.target.value);
          updateHelmholtz3D();
          updateHelmholtzUI();
          drawHelmholtzPlot();
        });
      }

      const bSmall = document.getElementById('btn-helm-d-small');
      const bExact = document.getElementById('btn-helm-d-exact');
      const bLarge = document.getElementById('btn-helm-d-large');

      [
        { btn: bSmall, d: 0.10 },
        { btn: bExact, d: 0.15 },
        { btn: bLarge, d: 0.22 }
      ].forEach(item => {
        if (item.btn) {
          item.btn.addEventListener('click', () => {
            separationD = item.d;
            if (slD) slD.value = separationD.toString();
            [bSmall, bExact, bLarge].forEach(b => b.classList.remove('active'));
            item.btn.classList.add('active');
            updateHelmholtz3D();
            updateHelmholtzUI();
            drawHelmholtzPlot();
          });
        }
      });

      updateHelmholtz3D();
      updateHelmholtzUI();
      drawHelmholtzPlot();
    }
  });

})();
