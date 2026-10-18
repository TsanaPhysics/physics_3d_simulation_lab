/**
 * js/experiments/mech-air-track.js
 * Domain: Mechanics & Dynamics (กลศาสตร์และการเคลื่อนที่)
 * Experiment: Linear Momentum Conservation & Collisions on Air Track
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let trackGroup = null;
  let trackMesh, glider1Mesh, glider2Mesh;
  let gate1Mesh, gate2Mesh, gate1Led, gate2Led;
  let gate1Display, gate2Display;
  let audioCtx = null;

  // Experiment State
  let m1 = 150;                // Mass of Glider 1 (g)
  let m2 = 150;                // Mass of Glider 2 (g)
  let u1 = 1.2;                // Initial velocity of Glider 1 (m/s)
  let u2 = 0.0;                // Initial velocity of Glider 2 (m/s)
  let pos1 = -1.8;             // Glider 1 Position (m)
  let pos2 = 0.2;              // Glider 2 Position (m)
  let v1 = 0.0;                // Current velocity of Glider 1
  let v2 = 0.0;                // Current velocity of Glider 2
  let collisionMode = 'elastic'; // 'elastic' (e=1.0) | 'inelastic' (e=0.0)
  let isSimulating = false;
  let hasCollided = false;

  // Photogates
  const flagWidth = 0.05;      // 5 cm flag width
  let gate1Pos = -0.8;         // Photogate 1 position (m)
  let gate2Pos = 1.0;          // Photogate 2 position (m)
  let gate1Time = 0.0;         // Measured transit time (s)
  let gate2Time = 0.0;         // Measured transit time (s)
  let collisionData = [];

  // Web Audio collision clack sound
  function playCollisionSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = collisionMode === 'elastic' ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(collisionMode === 'elastic' ? 620 : 280, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.09);
      gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}
  }

  // 3D Scene Initialization
  function initAirTrack3D(scene) {
    trackGroup = new THREE.Group();
    trackGroup.visible = false;
    scene.add(trackGroup);

    // 1. Triangular Extruded Aluminum Air Track (Length = 5.2m, rotated horizontally)
    const trackShape = new THREE.Shape();
    trackShape.moveTo(0, 0.55);
    trackShape.lineTo(0.45, 0.0);
    trackShape.lineTo(-0.45, 0.0);
    trackShape.closePath();

    const extrudeSettings = { steps: 1, depth: 5.4, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
    const trackGeom = new THREE.ExtrudeGeometry(trackShape, extrudeSettings);
    trackGeom.center();
    trackGeom.rotateY(Math.PI / 2);

    const trackMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.88,
      roughness: 0.22
    });
    trackMesh = new THREE.Mesh(trackGeom, trackMat);
    trackMesh.position.set(0, 0.45, 0);
    trackMesh.castShadow = true;
    trackMesh.receiveShadow = true;
    trackGroup.add(trackMesh);

    // Metric ruler stripe along the top ridge
    const rulerGeom = new THREE.PlaneGeometry(5.2, 0.04);
    const rulerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
    const rulerMesh = new THREE.Mesh(rulerGeom, rulerMat);
    rulerMesh.rotation.x = -Math.PI / 2;
    rulerMesh.position.set(0, 0.73, 0);
    trackGroup.add(rulerMesh);

    // 2. Cast Iron Heavy Support Stands with leveling screws
    const standGeom = new THREE.BoxGeometry(0.3, 0.45, 1.2);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6, metalness: 0.5 });
    
    const leftStand = new THREE.Mesh(standGeom, standMat);
    leftStand.position.set(-2.4, 0.22, 0);
    trackGroup.add(leftStand);

    const rightStand = new THREE.Mesh(standGeom, standMat);
    rightStand.position.set(2.4, 0.22, 0);
    trackGroup.add(rightStand);

    // Air supply inlet hose at left end
    const hoseGeom = new THREE.CylinderGeometry(0.08, 0.08, 1.2, 16);
    const hoseMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const hose = new THREE.Mesh(hoseGeom, hoseMat);
    hose.rotation.z = Math.PI / 2;
    hose.position.set(-2.8, 0.45, 0);
    trackGroup.add(hose);

    // 3. Glider 1 (Cyan) & Glider 2 (Amber)
    function createGlider(colorHex, name) {
      const g = new THREE.Group();
      
      // Inverted V-rider saddle
      const riderShape = new THREE.Shape();
      riderShape.moveTo(0, 0.58);
      riderShape.lineTo(0.48, 0.02);
      riderShape.lineTo(0.44, 0.0);
      riderShape.lineTo(0, 0.53);
      riderShape.lineTo(-0.44, 0.0);
      riderShape.lineTo(-0.48, 0.02);
      riderShape.closePath();

      const riderGeom = new THREE.ExtrudeGeometry(riderShape, { steps: 1, depth: 0.45, bevelEnabled: false });
      riderGeom.center();
      riderGeom.rotateY(Math.PI / 2);

      const riderMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        metalness: 0.75,
        roughness: 0.25
      });
      const body = new THREE.Mesh(riderGeom, riderMat);
      body.position.set(0, 0.46, 0);
      body.castShadow = true;
      g.add(body);

      // Vertical Interrupter Flag for Photogate (5 cm width)
      const flagGeom = new THREE.BoxGeometry(0.05, 0.22, 0.005);
      const flagMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
      const flag = new THREE.Mesh(flagGeom, flagMat);
      flag.position.set(0, 0.82, 0);
      g.add(flag);

      // Spring bumper tips at both ends
      const bumperGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
      const bumperMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 });
      
      const bFront = new THREE.Mesh(bumperGeom, bumperMat);
      bFront.rotation.z = Math.PI / 2;
      bFront.position.set(0.26, 0.48, 0);
      g.add(bFront);

      const bBack = new THREE.Mesh(bumperGeom, bumperMat);
      bBack.rotation.z = Math.PI / 2;
      bBack.position.set(-0.26, 0.48, 0);
      g.add(bBack);

      return g;
    }

    glider1Mesh = createGlider(0x06b6d4, 'Glider 1 (Cyan)');
    glider1Mesh.position.set(pos1, 0, 0);
    trackGroup.add(glider1Mesh);

    glider2Mesh = createGlider(0xf59e0b, 'Glider 2 (Amber)');
    glider2Mesh.position.set(pos2, 0, 0);
    trackGroup.add(glider2Mesh);

    // 4. Optical Photogates (Gate 1 & Gate 2)
    function createPhotogate(xPos, label) {
      const g = new THREE.Group();
      
      // Arch post straddling the track
      const postGeom = new THREE.BoxGeometry(0.06, 0.7, 0.06);
      const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
      
      const postL = new THREE.Mesh(postGeom, postMat);
      postL.position.set(0, 0.65, -0.42);
      g.add(postL);

      const postR = new THREE.Mesh(postGeom, postMat);
      postR.position.set(0, 0.65, 0.42);
      g.add(postR);

      const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.9), postMat);
      topBar.position.set(0, 0.98, 0);
      g.add(topBar);

      // IR beam emitter & receiver diodes
      const diodeGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.06, 8);
      const diodeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8 });
      const led = new THREE.Mesh(diodeGeom, diodeMat);
      led.rotation.x = Math.PI / 2;
      led.position.set(0, 0.82, -0.38);
      g.add(led);

      // Digital micro LCD timer display module on top
      const dispBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.12, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x090d16, roughness: 0.4 })
      );
      dispBox.position.set(0, 1.08, 0);
      g.add(dispBox);

      g.position.set(xPos, 0, 0);
      return { group: g, led: led };
    }

    const g1 = createPhotogate(gate1Pos, 'Gate A');
    gate1Mesh = g1.group;
    gate1Led = g1.led;
    trackGroup.add(gate1Mesh);

    const g2 = createPhotogate(gate2Pos, 'Gate B');
    gate2Mesh = g2.group;
    gate2Led = g2.led;
    trackGroup.add(gate2Mesh);
  }

  function updateAirTrack3D() {
    if (glider1Mesh) glider1Mesh.position.x = pos1;
    if (glider2Mesh) glider2Mesh.position.x = pos2;
    if (gate1Mesh) gate1Mesh.position.x = gate1Pos;
    if (gate2Mesh) gate2Mesh.position.x = gate2Pos;
  }

  function updateAirTrackUI() {
    const elV1 = document.getElementById('air-val-v1');
    const elV2 = document.getElementById('air-val-v2');
    const elP1 = document.getElementById('air-val-p1');
    const elP2 = document.getElementById('air-val-p2');
    const elPtot = document.getElementById('air-val-ptot');
    const elKtot = document.getElementById('air-val-ktot');
    const elT1 = document.getElementById('air-gate1-time');
    const elT2 = document.getElementById('air-gate2-time');

    const m1_kg = m1 / 1000;
    const m2_kg = m2 / 1000;
    const p_tot = m1_kg * v1 + m2_kg * v2;
    const k_tot = 0.5 * m1_kg * v1 * v1 + 0.5 * m2_kg * v2 * v2;

    if (elV1) elV1.textContent = `${v1.toFixed(3)} m/s`;
    if (elV2) elV2.textContent = `${v2.toFixed(3)} m/s`;
    if (elP1) elP1.textContent = `${(m1_kg * v1).toFixed(3)} kg·m/s`;
    if (elP2) elP2.textContent = `${(m2_kg * v2).toFixed(3)} kg·m/s`;
    if (elPtot) elPtot.textContent = `${p_tot.toFixed(3)} kg·m/s`;
    if (elKtot) elKtot.textContent = `${k_tot.toFixed(4)} J`;
    if (elT1) elT1.textContent = gate1Time > 0 ? `${(gate1Time * 1000).toFixed(1)} ms` : '-- ms';
    if (elT2) elT2.textContent = gate2Time > 0 ? `${(gate2Time * 1000).toFixed(1)} ms` : '-- ms';
  }

  function renderAirTrackTable() {
    const tbody = document.getElementById('air-table-body');
    if (!tbody) return;
    if (collisionData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; opacity:0.6;">ยังไม่มีข้อมูลการชน — กดปุ่ม "🚀 ปล่อยรถทดลอง" เพื่อเริ่ม</td></tr>';
      return;
    }
    tbody.innerHTML = collisionData.map((d, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><span class="badge ${d.mode === 'elastic' ? 'badge-accent' : 'badge-gold'}">${d.mode === 'elastic' ? 'ยืดหยุ่น' : 'ไม่ยืดหยุ่น'}</span></td>
        <td>${d.m1}g / ${d.m2}g</td>
        <td>${d.p_before.toFixed(3)}</td>
        <td>${d.p_after.toFixed(3)}</td>
        <td>${d.delta_k.toFixed(4)} J</td>
      </tr>
    `).join('');
  }

  function launchCollision() {
    pos1 = -1.8;
    pos2 = 0.2;
    v1 = u1;
    v2 = u2;
    hasCollided = false;
    gate1Time = 0.0;
    gate2Time = 0.0;
    isSimulating = true;
    updateAirTrack3D();
  }

  function resetGliders() {
    isSimulating = false;
    pos1 = -1.8;
    pos2 = 0.2;
    v1 = 0.0;
    v2 = 0.0;
    hasCollided = false;
    gate1Time = 0.0;
    gate2Time = 0.0;
    if (gate1Led) gate1Led.material.emissiveIntensity = 0.8;
    if (gate2Led) gate2Led.material.emissiveIntensity = 0.8;
    updateAirTrack3D();
    updateAirTrackUI();
  }

  // Register in PhysicsLabRegistry
  window.PhysicsLabRegistry.registerExperiment({
    id: 'mech_air_track',
    domainId: 'mechanics',
    title: 'การอนุรักษ์โมเมนตัมและการชนในหนึ่งมิติด้วยรางเบาะลม (Air Track Linear Collision)',
    shortTitle: '⚙️ การชนบนรางลม',
    icon: '⚙️',
    status: 'active',
    keyFormula: '$$m_1 u_1 + m_2 u_2 = m_1 v_1 + m_2 v_2 \\quad (e = 1.0 \\text{ vs } 0.0)$$',
    description: 'ทดสอบการชนแบบยืดหยุ่นและการชนแบบไม่ยืดหยุ่นบนรางเบาะลมไร้แรงเสียดทาน วัดความเร็วผ่านโฟโตเกตและระบบจับเวลาความแม่นยำสูง',
    features: ['Zero-Friction Air Track', 'Dual Optical Photogates', 'Elastic / Inelastic Flag', 'Kinetic Energy Loss Chart'],
    camera: { position: [0, 2.8, 4.8], target: [0, 0.6, 0] },
    topCamera: { position: [0, 6.5, 0.1], target: [0, 0.5, 0] },

    init(scene) {
      initAirTrack3D(scene);
      this.group = trackGroup;
      this.draggableInstruments = [
        { group: glider1Mesh, name: 'รถทดลอง 1 (Glider 1)' },
        { group: glider2Mesh, name: 'รถทดลอง 2 (Glider 2)' }
      ];
    },

    activate() {
      updateAirTrack3D();
      updateAirTrackUI();
      renderAirTrackTable();
    },

    update(dt) {
      if (!isSimulating) return;

      const m1_kg = m1 / 1000;
      const m2_kg = m2 / 1000;
      const gliderLength = 0.48;

      // Move gliders
      pos1 += v1 * dt;
      pos2 += v2 * dt;

      // Photogate beam detection
      // Gate 1 triggers when glider 1 flag is inside [gate1Pos - 0.025, gate1Pos + 0.025]
      if (Math.abs(pos1 - gate1Pos) < flagWidth && v1 > 0 && gate1Time === 0) {
        gate1Time = flagWidth / Math.abs(v1);
        if (gate1Led) gate1Led.material.emissiveIntensity = 2.5;
      }
      // Gate 2 triggers when glider 2 flag is inside
      if (Math.abs(pos2 - gate2Pos) < flagWidth && v2 > 0 && gate2Time === 0) {
        gate2Time = flagWidth / Math.abs(v2);
        if (gate2Led) gate2Led.material.emissiveIntensity = 2.5;
      }

      // Collision Detection between Glider 1 and Glider 2
      if (!hasCollided && (pos1 + gliderLength / 2) >= (pos2 - gliderLength / 2)) {
        hasCollided = true;
        const p_before = m1_kg * v1 + m2_kg * v2;
        const k_before = 0.5 * m1_kg * v1 * v1 + 0.5 * m2_kg * v2 * v2;

        playCollisionSound();

        if (collisionMode === 'elastic') {
          // Elastic Collision 1D (e = 1.0)
          const new_v1 = ((m1_kg - m2_kg) * v1 + 2 * m2_kg * v2) / (m1_kg + m2_kg);
          const new_v2 = (2 * m1_kg * v1 + (m2_kg - m1_kg) * v2) / (m1_kg + m2_kg);
          v1 = new_v1;
          v2 = new_v2;
        } else {
          // Inelastic Collision (e = 0.0, stick together)
          const common_v = (m1_kg * v1 + m2_kg * v2) / (m1_kg + m2_kg);
          v1 = common_v;
          v2 = common_v;
        }

        const p_after = m1_kg * v1 + m2_kg * v2;
        const k_after = 0.5 * m1_kg * v1 * v1 + 0.5 * m2_kg * v2 * v2;

        collisionData.unshift({
          mode: collisionMode,
          m1,
          m2,
          p_before,
          p_after,
          delta_k: k_after - k_before
        });
        if (collisionData.length > 8) collisionData.pop();
        renderAirTrackTable();
      }

      // End of track bounce / stop
      if (pos2 > 2.2 || pos1 < -2.3) {
        isSimulating = false;
      }

      updateAirTrack3D();
      updateAirTrackUI();
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ พารามิเตอร์การชน & รางเบาะลม</span>
            <span class="badge badge-accent">Air Track 1D</span>
          </div>

          <div class="control-row">
            <span class="control-label">รูปแบบการชน (Collision Mode)</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="tab-btn active" id="btn-col-elastic">🟢 ยืดหยุ่นสมบูรณ์ ($e = 1$)</button>
            <button class="tab-btn" id="btn-col-inelastic">🟠 ไม่ยืดหยุ่นสมบูรณ์ ($e = 0$)</button>
          </div>

          <div class="control-row" style="margin-top:12px;">
            <span class="control-label">มวลรถคันที่ 1 ($m_1$)</span>
            <span id="air-lbl-m1" class="control-val">150 g</span>
          </div>
          <input type="range" id="air-slider-m1" min="50" max="300" step="10" value="150" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">มวลรถคันที่ 2 ($m_2$)</span>
            <span id="air-lbl-m2" class="control-val">150 g</span>
          </div>
          <input type="range" id="air-slider-m2" min="50" max="300" step="10" value="150" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">ความเร็วต้นคันที่ 1 ($u_1$)</span>
            <span id="air-lbl-u1" class="control-val">1.20 m/s</span>
          </div>
          <input type="range" id="air-slider-u1" min="0.4" max="2.5" step="0.1" value="1.2" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-air-launch" class="btn-primary" style="flex:1;">
              🚀 ปล่อยรถทดลอง (Launch)
            </button>
            <button id="btn-air-reset" class="btn-secondary">
              🔄 รีเซ็ต (Reset)
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>⏱️ ตำแหน่งโฟโตเกต (Photogates)</span>
          </div>
          <div class="control-row">
            <span class="control-label">ตำแหน่งโฟโตเกต 1 (Gate A)</span>
            <span id="air-lbl-gate1" class="control-val">-0.80 m</span>
          </div>
          <input type="range" id="air-slider-gate1" min="-1.5" max="-0.2" step="0.05" value="-0.8" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">ตำแหน่งโฟโตเกต 2 (Gate B)</span>
            <span id="air-lbl-gate2" class="control-val">1.00 m</span>
          </div>
          <input type="range" id="air-slider-gate2" min="0.5" max="1.8" step="0.05" value="1.0" class="lab-slider" />
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>⚡ การอนุรักษ์โมเมนตัม & พลังงานจลน์</span>
            <span class="badge badge-accent">Live Telemetry</span>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
            <div class="stat-tile">
              <span class="stat-tile-label">ความเร็ว $v_1$ (คันที่ 1)</span>
              <span id="air-val-v1" class="stat-tile-val" style="color:#06b6d4;">0.000 m/s</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ความเร็ว $v_2$ (คันที่ 2)</span>
              <span id="air-val-v2" class="stat-tile-val" style="color:#f59e0b;">0.000 m/s</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">โมเมนตัม $p_1$</span>
              <span id="air-val-p1" class="stat-tile-val">0.000 kg·m/s</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">โมเมนตัม $p_2$</span>
              <span id="air-val-p2" class="stat-tile-val">0.000 kg·m/s</span>
            </div>
            <div class="stat-tile" style="grid-column: span 2; background: rgba(56,189,248,0.1); border-color: rgba(56,189,248,0.3);">
              <span class="stat-tile-label">โมเมนตัมรวมของระบบ ($p_{\text{tot}} = p_1 + p_2$)</span>
              <span id="air-val-ptot" class="stat-tile-val" style="color:#38bdf8; font-size:1.25rem;">0.000 kg·m/s</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">พลังงานจลน์รวม ($K_{\text{tot}}$)</span>
              <span id="air-val-ktot" class="stat-tile-val">0.0000 J</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">เวลาตัดลำแสงโฟโตเกต A</span>
              <span id="air-gate1-time" class="stat-tile-val" style="color:#ef4444;">-- ms</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกผลการชน</span>
            <button class="panel-size-btn" onclick="collisionData = []; renderAirTrackTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ครั้ง</th>
                  <th>โหมด</th>
                  <th>มวล ($m_1/m_2$)</th>
                  <th>$p_{\text{ก่อน}}$</th>
                  <th>$p_{\text{หลัง}}$</th>
                  <th>$\Delta K$</th>
                </tr>
              </thead>
              <tbody id="air-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI() {
      const btnEl = document.getElementById('btn-col-elastic');
      const btnInel = document.getElementById('btn-col-inelastic');
      if (btnEl && btnInel) {
        btnEl.addEventListener('click', () => {
          collisionMode = 'elastic';
          btnEl.classList.add('active');
          btnInel.classList.remove('active');
        });
        btnInel.addEventListener('click', () => {
          collisionMode = 'inelastic';
          btnInel.classList.add('active');
          btnEl.classList.remove('active');
        });
      }

      const slM1 = document.getElementById('air-slider-m1');
      if (slM1) {
        slM1.addEventListener('input', (e) => {
          m1 = parseInt(e.target.value);
          const lbl = document.getElementById('air-lbl-m1');
          if (lbl) lbl.textContent = `${m1} g`;
        });
      }

      const slM2 = document.getElementById('air-slider-m2');
      if (slM2) {
        slM2.addEventListener('input', (e) => {
          m2 = parseInt(e.target.value);
          const lbl = document.getElementById('air-lbl-m2');
          if (lbl) lbl.textContent = `${m2} g`;
        });
      }

      const slU1 = document.getElementById('air-slider-u1');
      if (slU1) {
        slU1.addEventListener('input', (e) => {
          u1 = parseFloat(e.target.value);
          const lbl = document.getElementById('air-lbl-u1');
          if (lbl) lbl.textContent = `${u1.toFixed(2)} m/s`;
        });
      }

      const slG1 = document.getElementById('air-slider-gate1');
      if (slG1) {
        slG1.addEventListener('input', (e) => {
          gate1Pos = parseFloat(e.target.value);
          const lbl = document.getElementById('air-lbl-gate1');
          if (lbl) lbl.textContent = `${gate1Pos.toFixed(2)} m`;
          updateAirTrack3D();
        });
      }

      const slG2 = document.getElementById('air-slider-gate2');
      if (slG2) {
        slG2.addEventListener('input', (e) => {
          gate2Pos = parseFloat(e.target.value);
          const lbl = document.getElementById('air-lbl-gate2');
          if (lbl) lbl.textContent = `${gate2Pos.toFixed(2)} m`;
          updateAirTrack3D();
        });
      }

      const btnLaunch = document.getElementById('btn-air-launch');
      if (btnLaunch) btnLaunch.addEventListener('click', launchCollision);

      const btnReset = document.getElementById('btn-air-reset');
      if (btnReset) btnReset.addEventListener('click', resetGliders);

      updateAirTrackUI();
      renderAirTrackTable();
    }
  });

})();
