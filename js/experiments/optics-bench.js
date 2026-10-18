/**
 * js/experiments/optics-bench.js
 * Domain: Optics (ทัศนศาสตร์และแสง)
 * Experiment: Thin Lens Optical Bench, 3D Ray Tracing & Gaussian Lens Equation
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let opticsGroup = null;
  let railMesh, objMesh, lensMesh, screenMesh;
  let rayLine1, rayLine2, rayLine3, focalMarker1, focalMarker2;
  let screenCanvas, screenCtx, screenTexture;

  // Optical bench state (in cm)
  let objPos = 10.0;       // Fixed light source at x = 10 cm
  let lensPos = 40.0;      // Lens at x = 40 cm (s = 30 cm)
  let screenPos = 70.0;    // Screen at x = 70 cm
  let focalLength = 15.0;  // Default +15 cm (Convex)
  let objHeight = 4.0;     // Object height in cm

  let opticsTrials = [];

  function calcOptics() {
    const s = Math.max(0.1, lensPos - objPos);
    let sPrime = Infinity;
    let isVirtual = false;

    if (Math.abs(s - focalLength) < 0.001) {
      sPrime = Infinity;
    } else {
      sPrime = (focalLength * s) / (s - focalLength);
      if (sPrime < 0) isVirtual = true;
    }

    const mag = isFinite(sPrime) ? -sPrime / s : 0;
    const imgHeight = isFinite(mag) ? objHeight * mag : 0;
    const sharpScreenPos = isFinite(sPrime) ? lensPos + sPrime : null;

    // Blur circle calculation on screen
    const screenDist = screenPos - lensPos;
    let blurAmount = 0;
    if (isFinite(sPrime) && !isVirtual) {
      const delta = Math.abs(screenDist - sPrime);
      blurAmount = Math.min(25, delta * 1.8);
    } else {
      blurAmount = 25; // Virtual or infinite
    }

    return {
      s,
      sPrime,
      isVirtual,
      mag,
      imgHeight,
      sharpScreenPos,
      blurAmount
    };
  }

  // 3D Scene Initialization
  function initOptics3D(scene) {
    opticsGroup = new THREE.Group();
    opticsGroup.visible = false;
    scene.add(opticsGroup);

    // 1. Optical Bench Rail (100 cm graduated rail on table)
    // Scale: 10 cm = 1.0 unit in 3D world (bench length = 10.0 units, from X = -5.0 to +5.0)
    const railGeom = new THREE.BoxGeometry(10.2, 0.22, 0.65);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.85,
      roughness: 0.25
    });
    railMesh = new THREE.Mesh(railGeom, railMat);
    railMesh.position.set(0, 0.11, 0);
    railMesh.receiveShadow = true;
    opticsGroup.add(railMesh);

    // Dual Chrome Guide Rods
    const rodMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 });
    const rod1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 10.0, 16), rodMat);
    rod1.rotation.z = Math.PI / 2;
    rod1.position.set(0, 0.26, 0.2);
    opticsGroup.add(rod1);

    const rod2 = rod1.clone();
    rod2.position.set(0, 0.26, -0.2);
    opticsGroup.add(rod2);

    // Bench Millimeter Scale Texture
    const scaleCanvas = document.createElement('canvas');
    scaleCanvas.width = 1024;
    scaleCanvas.height = 64;
    const sctx = scaleCanvas.getContext('2d');
    sctx.fillStyle = '#1e293b';
    sctx.fillRect(0, 0, 1024, 64);
    sctx.fillStyle = '#38bdf8';
    sctx.font = 'bold 20px monospace';
    sctx.textAlign = 'center';
    for (let cm = 0; cm <= 100; cm += 5) {
      const x = (cm / 100) * 1024;
      sctx.fillRect(x - 1, 0, 2, cm % 10 === 0 ? 30 : 18);
      if (cm % 10 === 0) {
        sctx.fillText(`${cm}`, x, 52);
      }
    }
    const scaleTex = new THREE.CanvasTexture(scaleCanvas);
    const scalePlate = new THREE.Mesh(
      new THREE.PlaneGeometry(10.0, 0.18),
      new THREE.MeshBasicMaterial({ map: scaleTex })
    );
    scalePlate.rotation.x = -Math.PI / 2;
    scalePlate.position.set(0, 0.23, 0);
    opticsGroup.add(scalePlate);

    // 2. Light Source Carrier at objPos
    objMesh = createCarrier('🔦 แหล่งกำเนิดแสง (วัตถุ)', 0xf59e0b);
    const arrowGeom = new THREE.ConeGeometry(0.12, 0.35, 16);
    const arrowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.8
    });
    const arrow = new THREE.Mesh(arrowGeom, arrowMat);
    arrow.position.set(0, 1.45, 0);
    objMesh.add(arrow);

    const arrowStem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12),
      arrowMat
    );
    arrowStem.position.set(0, 1.15, 0);
    objMesh.add(arrowStem);
    opticsGroup.add(objMesh);

    // 3. Lens Carrier & Glass Mesh
    lensMesh = createCarrier('🔍 เลนส์บาง (Lens Carrier)', 0x06b6d4);
    const lensRim = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.06, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 })
    );
    lensRim.position.set(0, 1.25, 0);
    lensMesh.add(lensRim);

    const glassGeom = new THREE.CylinderGeometry(0.63, 0.63, 0.06, 32);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x93c5fd,
      transmission: 0.92,
      opacity: 1,
      transparent: true,
      roughness: 0.08,
      ior: 1.52,
      thickness: 0.5
    });
    const glass = new THREE.Mesh(glassGeom, glassMat);
    glass.rotation.z = Math.PI / 2;
    glass.position.set(0, 1.25, 0);
    lensMesh.add(glass);
    opticsGroup.add(lensMesh);

    // Focal Point Markers
    const fGeom = new THREE.SphereGeometry(0.06, 16, 16);
    const fMat = new THREE.MeshBasicMaterial({ color: 0xec4899 });
    focalMarker1 = new THREE.Mesh(fGeom, fMat);
    focalMarker2 = new THREE.Mesh(fGeom, fMat);
    opticsGroup.add(focalMarker1);
    opticsGroup.add(focalMarker2);

    // 4. Projection Screen Carrier
    screenMesh = createCarrier('⬜ ฉากรับภาพ (Screen)', 0x10b981);
    screenCanvas = document.createElement('canvas');
    screenCanvas.width = 256;
    screenCanvas.height = 256;
    screenCtx = screenCanvas.getContext('2d');
    screenTexture = new THREE.CanvasTexture(screenCanvas);

    const screenPlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 1.4, 1.2),
      new THREE.MeshStandardMaterial({
        map: screenTexture,
        roughness: 0.4,
        metalness: 0.1
      })
    );
    screenPlate.position.set(0, 1.25, 0);
    screenMesh.add(screenPlate);
    opticsGroup.add(screenMesh);

    // 5. 3D Ray Tracing Lines
    const rayMat1 = new THREE.LineBasicMaterial({ color: 0xff3b30, linewidth: 2 });
    const rayMat2 = new THREE.LineBasicMaterial({ color: 0x34c759, linewidth: 2 });
    const rayMat3 = new THREE.LineBasicMaterial({ color: 0x007aff, linewidth: 2 });

    rayLine1 = new THREE.Line(new THREE.BufferGeometry(), rayMat1);
    rayLine2 = new THREE.Line(new THREE.BufferGeometry(), rayMat2);
    rayLine3 = new THREE.Line(new THREE.BufferGeometry(), rayMat3);
    opticsGroup.add(rayLine1);
    opticsGroup.add(rayLine2);
    opticsGroup.add(rayLine3);

    updateOpticsPositions3D();
  }

  function createCarrier(name, accentColor) {
    const carrier = new THREE.Group();
    carrier.userData.isDraggable = true;
    carrier.userData.instrumentName = name;

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.32, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6, roughness: 0.4 })
    );
    base.position.set(0, 0.28, 0);
    base.userData.draggableRoot = carrier;
    carrier.add(base);

    const indicator = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12),
      new THREE.MeshBasicMaterial({ color: accentColor })
    );
    indicator.position.set(0, 0.28, 0.42);
    carrier.add(indicator);

    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
    );
    post.position.set(0, 0.75, 0);
    post.userData.draggableRoot = carrier;
    carrier.add(post);

    return carrier;
  }

  function cmToWorldX(cm) {
    return (cm - 50.0) * 0.1;
  }

  function updateOpticsPositions3D() {
    if (!opticsGroup) return;

    const objX = cmToWorldX(objPos);
    const lensX = cmToWorldX(lensPos);
    const screenX = cmToWorldX(screenPos);
    const fDist = focalLength * 0.1;

    objMesh.position.x = objX;
    lensMesh.position.x = lensX;
    screenMesh.position.x = screenX;

    focalMarker1.position.set(lensX - fDist, 1.25, 0);
    focalMarker2.position.set(lensX + fDist, 1.25, 0);

    // Update 3D Ray Tracing Lines
    const res = calcOptics();
    const arrowTipY = 1.45;
    const centerLensY = 1.25;

    // Ray 1: Parallel to Axis -> through rear focus
    const p1_start = new THREE.Vector3(objX, arrowTipY, 0);
    const p1_lens = new THREE.Vector3(lensX, arrowTipY, 0);
    let p1_end;
    if (res.sharpScreenPos !== null && isFinite(res.sPrime)) {
      p1_end = new THREE.Vector3(cmToWorldX(res.sharpScreenPos), centerLensY + res.imgHeight * 0.05, 0);
    } else {
      p1_end = new THREE.Vector3(lensX + fDist * 2, arrowTipY - 0.4, 0);
    }
    rayLine1.geometry.setFromPoints([p1_start, p1_lens, p1_end]);

    // Ray 2: Through Optical Center (Undeviated)
    const p2_start = new THREE.Vector3(objX, arrowTipY, 0);
    const p2_lens = new THREE.Vector3(lensX, centerLensY, 0);
    const dir2 = p2_lens.clone().sub(p2_start).normalize();
    const p2_end = p2_start.clone().add(dir2.multiplyScalar(8.0));
    rayLine2.geometry.setFromPoints([p2_start, p2_lens, p2_end]);

    // Ray 3: Through Front Focus -> emerges parallel to axis
    const p3_start = new THREE.Vector3(objX, arrowTipY, 0);
    const p3_focus = new THREE.Vector3(lensX - fDist, centerLensY, 0);
    const dir3 = p3_focus.clone().sub(p3_start).normalize();
    const t3 = (lensX - objX) / dir3.x;
    const p3_lens = p3_start.clone().add(dir3.multiplyScalar(t3));
    const p3_end = new THREE.Vector3(p3_lens.x + 5.0, p3_lens.y, 0);
    rayLine3.geometry.setFromPoints([p3_start, p3_lens, p3_end]);

    // Update Image on Screen Canvas
    renderScreenImage(res);
  }

  function renderScreenImage(res) {
    if (!screenCtx || !screenTexture) return;

    screenCtx.fillStyle = '#f8fafc';
    screenCtx.fillRect(0, 0, 256, 256);

    // Screen crosshair
    screenCtx.strokeStyle = '#cbd5e1';
    screenCtx.lineWidth = 1;
    screenCtx.beginPath();
    screenCtx.moveTo(128, 0); screenCtx.lineTo(128, 256);
    screenCtx.moveTo(0, 128); screenCtx.lineTo(256, 128);
    screenCtx.stroke();

    const cx = 128;
    const cy = 128;
    const h = res.imgHeight * 18; // Canvas pixels

    screenCtx.save();
    if (res.blurAmount > 0.5) {
      screenCtx.filter = `blur(${Math.min(res.blurAmount, 16)}px)`;
    }

    screenCtx.fillStyle = res.blurAmount < 3 ? '#ea580c' : '#fdba74';
    screenCtx.strokeStyle = '#c2410c';
    screenCtx.lineWidth = 3;

    // Draw illuminated arrow image (inverted if real)
    screenCtx.beginPath();
    screenCtx.moveTo(cx, cy);
    screenCtx.lineTo(cx, cy - h);
    screenCtx.stroke();

    // Arrowhead
    const tipY = cy - h;
    const arrowDir = Math.sign(-h) || 1;
    screenCtx.beginPath();
    screenCtx.moveTo(cx, tipY);
    screenCtx.lineTo(cx - 12, tipY + arrowDir * 20);
    screenCtx.lineTo(cx + 12, tipY + arrowDir * 20);
    screenCtx.closePath();
    screenCtx.fill();

    screenCtx.restore();
    screenTexture.needsUpdate = true;
  }

  // Auto-focus helper
  function autoFocusScreen() {
    const res = calcOptics();
    if (res.sharpScreenPos !== null && !res.isVirtual && res.sharpScreenPos <= 98) {
      screenPos = Math.round(res.sharpScreenPos * 10) / 10;
      updateOpticsUI();
      updateOpticsPositions3D();
    }
  }

  function recordOpticsTrial() {
    const res = calcOptics();
    const trial = {
      id: opticsTrials.length + 1,
      s: res.s.toFixed(1),
      sPrime: isFinite(res.sPrime) ? res.sPrime.toFixed(1) : '∞',
      invS: (1 / res.s).toFixed(4),
      invSPrime: isFinite(res.sPrime) ? (1 / res.sPrime).toFixed(4) : '0',
      fExp: isFinite(res.sPrime) && !res.isVirtual ? ((res.s * res.sPrime) / (res.s + res.sPrime)).toFixed(2) : '-',
      mag: isFinite(res.mag) ? Math.abs(res.mag).toFixed(2) : '-',
      nature: res.isVirtual ? 'ภาพเสมือนหัวตั้ง' : 'ภาพจริงหัวกลับ'
    };
    opticsTrials.push(trial);
    renderOpticsTable();
  }

  function renderOpticsTable() {
    const tbody = document.getElementById('optics-table-body');
    if (!tbody) return;
    tbody.innerHTML = opticsTrials.map(t => `
      <tr>
        <td style="font-weight:600; text-align:center;">${t.id}</td>
        <td>${t.s}</td>
        <td>${t.sPrime}</td>
        <td>${t.invS}</td>
        <td>${t.invSPrime}</td>
        <td style="color:#38bdf8; font-weight:700;">${t.fExp}</td>
        <td>${t.mag}</td>
        <td><span class="status-pill ${t.nature.includes('จริง') ? 'ready' : 'planned'}">${t.nature}</span></td>
      </tr>
    `).join('');
  }

  function updateOpticsUI() {
    const res = calcOptics();

    const sliderLens = document.getElementById('optics-slider-lens');
    const sliderScreen = document.getElementById('optics-slider-screen');
    const valLens = document.getElementById('optics-val-lens');
    const valScreen = document.getElementById('optics-val-screen');
    const valS = document.getElementById('optics-val-s');
    const valSPrime = document.getElementById('optics-val-sprime');
    const valMag = document.getElementById('optics-val-mag');
    const valStatus = document.getElementById('optics-val-status');

    if (sliderLens) sliderLens.value = lensPos;
    if (sliderScreen) sliderScreen.value = screenPos;
    if (valLens) valLens.textContent = `${lensPos.toFixed(1)} cm`;
    if (valScreen) valScreen.textContent = `${screenPos.toFixed(1)} cm`;
    if (valS) valS.textContent = `${res.s.toFixed(1)} cm`;
    if (valSPrime) valSPrime.textContent = isFinite(res.sPrime) ? `${res.sPrime.toFixed(1)} cm` : 'ระยะอนันต์ (∞)';
    if (valMag) valMag.textContent = isFinite(res.mag) ? `${Math.abs(res.mag).toFixed(2)} เท่า` : '-';
    if (valStatus) {
      if (res.isVirtual) {
        valStatus.innerHTML = '<span style="color:#f43f5e;">🔍 ภาพเสมือน หัวตั้ง (ไม่ปรากฏบนฉาก)</span>';
      } else if (res.blurAmount < 2.0) {
        valStatus.innerHTML = '<span style="color:#10b981;">🎯 คมชัดสูงสุดบนฉาก (In Focus)</span>';
      } else {
        valStatus.innerHTML = `<span style="color:#f59e0b;">⚠️ ภาพเบลอ (คลาดเคลื่อน ${Math.abs(screenPos - (lensPos + res.sPrime)).toFixed(1)} cm)</span>`;
      }
    }
  }

  // Register the experiment definition
  window.PhysicsLabRegistry.registerExperiment({
    id: 'optics_bench',
    domainId: 'optics',
    title: 'การเกิดภาพจากเลนส์บางและรางทัศนศาสตร์ (Thin Lens Optical Bench)',
    shortTitle: '💡 รางทัศนศาสตร์',
    icon: '💡',
    status: 'active',
    keyFormula: '$$\\frac{1}{f} = \\frac{1}{s} + \\frac{1}{s\'}$$',
    description: 'ศึกษาการเกิดภาพจริงและภาพเสมือน การคำนวณระยะภาพ กำลังขยาย และความสัมพันธ์เชิงเส้นตรงตามสมการเลนส์บางแบบเกาส์',
    features: ['3D Ray Tracing', 'Gaussian Blur Shader', 'Auto Focus', 'KaTeX Formula', 'Pinch Drag Lens'],
    camera: { position: [0.2, 5.2, 7.8], target: [0, 1.2, 0] },
    topCamera: { position: [0, 10.5, 0.2], target: [0, 0, 0] },

    init(scene) {
      initOptics3D(scene);
      this.group = opticsGroup;
      this.draggableInstruments = [
        { group: lensMesh, name: 'เลนส์บาง (Lens Carrier)' },
        { group: screenMesh, name: 'ฉากรับภาพ (Screen)' }
      ];
    },

    activate() {
      updateOpticsPositions3D();
      updateOpticsUI();
      renderOpticsTable();
    },

    update(dt, now) {
      // Gentle ray luminescence animation
      if (rayLine1 && rayLine1.material) {
        const pulse = 0.8 + 0.2 * Math.sin(now * 0.004);
        rayLine1.material.opacity = pulse;
      }
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>⚙️ ตำแหน่งอุปกรณ์บนรางทัศนศาสตร์</span>
            <span class="badge badge-accent">100 cm Rail</span>
          </div>

          <div class="control-row">
            <span class="control-label">🔦 แหล่งกำเนิดแสง ($x_{\\text{obj}}$)</span>
            <span class="control-val">10.0 cm (คงที่)</span>
          </div>

          <div class="control-row">
            <span class="control-label">🔍 ตำแหน่งเลนส์ ($x_L$)</span>
            <span id="optics-val-lens" class="control-val">40.0 cm</span>
          </div>
          <input type="range" id="optics-slider-lens" min="20" max="80" step="0.5" value="40" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">⬜ ตำแหน่งฉาก ($x_S$)</span>
            <span id="optics-val-screen" class="control-val">70.0 cm</span>
          </div>
          <input type="range" id="optics-slider-screen" min="25" max="95" step="0.5" value="70" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-autofocus" class="btn-primary" style="flex:1;">
              🎯 โฟกัสภาพชัดอัตโนมัติ
            </button>
            <button id="btn-record-optics" class="btn-secondary">
              📝 บันทึกข้อมูล
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📐 สมบัติเลนส์ & ความยาวโฟกัส ($f$)</span>
          </div>
          <div style="display:flex; gap:6px; margin-bottom:10px;">
            <button id="btn-lens-15" class="tab-btn active" style="flex:1; justify-content:center;">เลนส์นูน +15 cm</button>
            <button id="btn-lens-20" class="tab-btn" style="flex:1; justify-content:center;">เลนส์นูน +20 cm</button>
            <button id="btn-lens-concave" class="tab-btn" style="flex:1; justify-content:center;">เลนส์เว้า -15 cm</button>
          </div>
          <div class="formula-box">
            $$\\frac{1}{f} = \\frac{1}{s} + \\frac{1}{s'} \\implies s' = \\frac{f \\cdot s}{s - f}$$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>👁️ ตัวตรวจจับภาพบนฉาก (Screen Image Sensor)</span>
            <span class="badge badge-accent">Real-time Ray Trace</span>
          </div>
          <div id="optics-val-status" style="margin-bottom:8px; font-weight:600; font-size:0.82rem;"></div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:10px;">
            <div class="stat-tile">
              <span class="stat-tile-label">ระยะวัตถุ ($s$)</span>
              <span id="optics-val-s" class="stat-tile-val">30.0 cm</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ระยะภาพ ($s'$)</span>
              <span id="optics-val-sprime" class="stat-tile-val">30.0 cm</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">กำลังขยาย ($|M|$)</span>
              <span id="optics-val-mag" class="stat-tile-val">1.00 เท่า</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ความยาวโฟกัส ($f$)</span>
              <span class="stat-tile-val" style="color:#38bdf8;">+15.0 cm</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกผลการทดลอง</span>
            <button class="panel-size-btn" onclick="opticsTrials = []; renderOpticsTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>$s$ (cm)</th>
                  <th>$s'$ (cm)</th>
                  <th>$1/s$</th>
                  <th>$1/s'$</th>
                  <th>$f_{\\text{exp}}$ (cm)</th>
                  <th>$|M|$</th>
                  <th>ลักษณะภาพ</th>
                </tr>
              </thead>
              <tbody id="optics-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI(leftEl, rightEl) {
      const sliderLens = document.getElementById('optics-slider-lens');
      const sliderScreen = document.getElementById('optics-slider-screen');

      if (sliderLens) {
        sliderLens.addEventListener('input', (e) => {
          lensPos = parseFloat(e.target.value);
          if (screenPos < lensPos + 5) screenPos = lensPos + 5;
          updateOpticsPositions3D();
          updateOpticsUI();
        });
      }

      if (sliderScreen) {
        sliderScreen.addEventListener('input', (e) => {
          screenPos = parseFloat(e.target.value);
          updateOpticsPositions3D();
          updateOpticsUI();
        });
      }

      const btnAuto = document.getElementById('btn-autofocus');
      if (btnAuto) btnAuto.addEventListener('click', autoFocusScreen);

      const btnRec = document.getElementById('btn-record-optics');
      if (btnRec) btnRec.addEventListener('click', recordOpticsTrial);

      const b15 = document.getElementById('btn-lens-15');
      const b20 = document.getElementById('btn-lens-20');
      const bConcave = document.getElementById('btn-lens-concave');

      if (b15) {
        b15.addEventListener('click', () => {
          focalLength = 15.0;
          [b15, b20, bConcave].forEach(b => b.classList.remove('active'));
          b15.classList.add('active');
          updateOpticsPositions3D();
          updateOpticsUI();
        });
      }
      if (b20) {
        b20.addEventListener('click', () => {
          focalLength = 20.0;
          [b15, b20, bConcave].forEach(b => b.classList.remove('active'));
          b20.classList.add('active');
          updateOpticsPositions3D();
          updateOpticsUI();
        });
      }
      if (bConcave) {
        bConcave.addEventListener('click', () => {
          focalLength = -15.0;
          [b15, b20, bConcave].forEach(b => b.classList.remove('active'));
          bConcave.classList.add('active');
          updateOpticsPositions3D();
          updateOpticsUI();
        });
      }

      updateOpticsUI();
    }
  });

})();
