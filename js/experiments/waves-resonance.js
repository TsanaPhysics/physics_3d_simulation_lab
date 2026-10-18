/**
 * js/experiments/waves-resonance.js
 * Domain: Waves & Acoustics (คลื่นและเสียง)
 * Experiment: Acoustic Resonance Tube, Standing Sound Waves & Speed of Sound
 * Features Web Audio API Live Synthesizer & Canvas Oscilloscope
 * RBRU Next Gen Lab 2026
 */

(function () {
  'use strict';

  let wavesGroup = null;
  let tubeOuterMesh, waterColumnMesh, speakerMesh;
  let standingWaveLines = [];
  let oscCanvas, oscCtx;

  // Web Audio Context & Synthesizer
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  let isAudioPlaying = false;

  // Physical parameters
  let soundFreq = 512.0;       // Hz (Tuning Fork / Speaker)
  let airColumnLenCm = 17.0;   // Length of air column L (cm)
  let airTempC = 25.0;         // Temperature (deg C)
  let tubeDiameterCm = 4.0;    // Tube inner diameter (cm)
  let endCorrection = 0.61 * (tubeDiameterCm / 2); // Delta L = 0.61 * r

  let resonanceTrials = [];

  function getSpeedOfSoundTheoretical(tempC) {
    return 331.3 * Math.sqrt(1 + (tempC / 273.15));
  }

  function calcResonance() {
    const vTheory = getSpeedOfSoundTheoretical(airTempC);
    const lambdaCm = (vTheory / soundFreq) * 100; // cm

    // Resonance positions for one closed end: L_n = (2n - 1) * lambda / 4 - endCorrection
    const resPositions = [
      (1 * lambdaCm) / 4 - endCorrection,
      (3 * lambdaCm) / 4 - endCorrection,
      (5 * lambdaCm) / 4 - endCorrection
    ].filter(pos => pos > 0 && pos <= 100);

    // Calculate resonance proximity (how close current L is to nearest resonance point)
    let minDiff = Infinity;
    let closestHarmonic = 1;
    resPositions.forEach((pos, idx) => {
      const diff = Math.abs(airColumnLenCm - pos);
      if (diff < minDiff) {
        minDiff = diff;
        closestHarmonic = 2 * idx + 1;
      }
    });

    // Resonance factor: 1.0 at perfect resonance, decays sharply outside 2 cm
    const resonanceQ = Math.max(0, 1.0 - (minDiff / 2.2));
    const isAtResonance = resonanceQ > 0.45;

    return {
      vTheory,
      lambdaCm,
      resPositions,
      minDiff,
      closestHarmonic,
      resonanceQ,
      isAtResonance
    };
  }

  // Web Audio Synth
  function initAudioSynth() {
    if (audioCtx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(soundFreq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
    } catch (e) {
      console.warn('Web Audio note:', e);
    }
  }

  function toggleAudio() {
    initAudioSynth();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    isAudioPlaying = !isAudioPlaying;
    const btn = document.getElementById('btn-waves-audio');
    if (btn) {
      btn.textContent = isAudioPlaying ? '🔊 ปิดเสียงลำโพง' : '🔈 เปิดเสียงลำโพง (Web Audio)';
      btn.classList.toggle('active', isAudioPlaying);
    }
    updateAudioVolume();
  }

  function updateAudioVolume() {
    if (!gainNode || !audioCtx) return;
    if (!isAudioPlaying) {
      gainNode.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05);
      return;
    }
    const res = calcResonance();
    // Base volume 0.08, swells up to 0.45 at acoustic resonance peak!
    const targetVol = 0.06 + 0.42 * res.resonanceQ;
    gainNode.gain.setTargetAtTime(targetVol, audioCtx.currentTime, 0.04);
    oscillator.frequency.setTargetAtTime(soundFreq, audioCtx.currentTime, 0.02);
  }

  // 3D Scene Initialization
  function initWaves3D(scene) {
    wavesGroup = new THREE.Group();
    wavesGroup.visible = false;
    scene.add(wavesGroup);

    // Laboratory Retort Stand
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.22, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 })
    );
    base.position.set(0, 0.11, 0);
    wavesGroup.add(base);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 7.5, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.15 })
    );
    mast.position.set(-0.8, 3.8, 0);
    wavesGroup.add(mast);

    // Transparent Glass/Acrylic Resonance Tube (Length 100 cm -> 6.0 Three.js units)
    const tubeHeight = 6.0;
    const tubeRadius = 0.45;
    tubeOuterMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, tubeHeight, 32, 1, true),
      new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.85,
        ior: 1.49
      })
    );
    tubeOuterMesh.position.set(0, 3.3, 0);
    wavesGroup.add(tubeOuterMesh);

    // Speaker / Audio Source at top mouth of the tube
    speakerMesh = new THREE.Group();
    const spCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 0.35, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 })
    );
    spCone.position.set(0, 6.45, 0);
    speakerMesh.add(spCone);

    const spDriver = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8, roughness: 0.2 })
    );
    spDriver.position.set(0, 6.7, 0);
    speakerMesh.add(spDriver);
    wavesGroup.add(speakerMesh);

    // Water Column Mesh inside tube
    waterColumnMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeRadius - 0.02, tubeRadius - 0.02, 1.0, 32),
      new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.72,
        roughness: 0.2,
        metalness: 0.3
      })
    );
    wavesGroup.add(waterColumnMesh);

    // Standing Wave Luminescent Curve
    const curveMat = new THREE.LineBasicMaterial({ color: 0x00f5ff, linewidth: 3, transparent: true, opacity: 0.85 });
    const waveGeom = new THREE.BufferGeometry();
    const waveLine = new THREE.Line(waveGeom, curveMat);
    standingWaveLines.push(waveLine);
    wavesGroup.add(waveLine);

    updateWaves3D();
  }

  function updateWaves3D() {
    if (!wavesGroup) return;

    const tubeBottomY = 0.3;
    const tubeHeight = 6.0;
    const waterHeightRatio = (100 - airColumnLenCm) / 100;
    const waterYLen = Math.max(0.01, tubeHeight * waterHeightRatio);

    waterColumnMesh.scale.set(1, waterYLen, 1);
    waterColumnMesh.position.set(0, tubeBottomY + waterYLen / 2, 0);

    // Update standing wave geometry inside the air column (from water surface to tube mouth)
    const res = calcResonance();
    const airBottomY = tubeBottomY + waterYLen;
    const airTopY = tubeBottomY + tubeHeight;
    const airHeight = airTopY - airBottomY;

    const pts = [];
    const segments = 60;
    for (let i = 0; i <= segments; i++) {
      const frac = i / segments;
      const y = airBottomY + frac * airHeight;
      // Standing wave equation: node at water surface (y = 0), antinode at open mouth
      const spatialFrac = frac * (res.closestHarmonic * Math.PI * 0.5);
      const amp = (0.28 * res.resonanceQ + 0.04) * Math.sin(spatialFrac);
      pts.push(new THREE.Vector3(amp, y, 0));
    }
    standingWaveLines[0].geometry.setFromPoints(pts);

    // Tube glow intensity when in resonance
    if (res.isAtResonance) {
      tubeOuterMesh.material.color.setHex(0x06b6d4);
      tubeOuterMesh.material.opacity = 0.65;
    } else {
      tubeOuterMesh.material.color.setHex(0x38bdf8);
      tubeOuterMesh.material.opacity = 0.35;
    }

    updateAudioVolume();
  }

  function drawOscilloscope(now) {
    if (!oscCanvas || !oscCtx) {
      oscCanvas = document.getElementById('waves-osc-canvas');
      if (oscCanvas) oscCtx = oscCanvas.getContext('2d');
    }
    if (!oscCtx) return;

    const w = oscCanvas.width;
    const h = oscCanvas.height;
    oscCtx.fillStyle = '#020617';
    oscCtx.fillRect(0, 0, w, h);

    // Oscilloscope grid lines
    oscCtx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    oscCtx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      oscCtx.beginPath(); oscCtx.moveTo(x, 0); oscCtx.lineTo(x, h); oscCtx.stroke();
    }
    for (let y = 0; y < h; y += 24) {
      oscCtx.beginPath(); oscCtx.moveTo(0, y); oscCtx.lineTo(w, y); oscCtx.stroke();
    }

    // Oscilloscope waveform trace
    const res = calcResonance();
    const amp = 8 + 38 * (isAudioPlaying ? (0.2 + 0.8 * res.resonanceQ) : 0.05);

    oscCtx.strokeStyle = res.isAtResonance ? '#00f5ff' : '#38bdf8';
    oscCtx.lineWidth = 2.5;
    oscCtx.shadowColor = '#00f5ff';
    oscCtx.shadowBlur = res.isAtResonance ? 10 : 3;

    oscCtx.beginPath();
    for (let x = 0; x < w; x++) {
      const t = now * 0.008 + (x / w) * (soundFreq * 0.06);
      const y = h / 2 + amp * Math.sin(t);
      if (x === 0) oscCtx.moveTo(x, y);
      else oscCtx.lineTo(x, y);
    }
    oscCtx.stroke();
    oscCtx.shadowBlur = 0;
  }

  function recordResonanceTrial() {
    const res = calcResonance();
    const trial = {
      id: resonanceTrials.length + 1,
      f: soundFreq.toFixed(0),
      l: airColumnLenCm.toFixed(1),
      harmonic: `n = ${res.closestHarmonic}`,
      status: res.isAtResonance ? 'สั่นพ้องชัดเจน' : 'ปกติ'
    };
    resonanceTrials.push(trial);
    renderResonanceTable();
  }

  function renderResonanceTable() {
    const tbody = document.getElementById('waves-table-body');
    if (!tbody) return;
    tbody.innerHTML = resonanceTrials.map(t => `
      <tr>
        <td style="font-weight:600; text-align:center;">${t.id}</td>
        <td>${t.f}</td>
        <td>${t.l}</td>
        <td>${t.harmonic}</td>
        <td><span class="status-pill ${t.status.includes('ชัดเจน') ? 'ready' : 'planned'}">${t.status}</span></td>
      </tr>
    `).join('');
  }

  function updateWavesUI() {
    const res = calcResonance();

    const valFreq = document.getElementById('waves-val-freq');
    const valL = document.getElementById('waves-val-l');
    const valTemp = document.getElementById('waves-val-temp');
    const sliderL = document.getElementById('waves-slider-l');
    const sliderFreq = document.getElementById('waves-slider-freq');
    const valVTheory = document.getElementById('waves-val-vtheory');
    const valStatus = document.getElementById('waves-val-status');
    const valResPos = document.getElementById('waves-val-respos');

    if (valFreq) valFreq.textContent = `${soundFreq.toFixed(0)} Hz`;
    if (valL) valL.textContent = `${airColumnLenCm.toFixed(1)} cm`;
    if (valTemp) valTemp.textContent = `${airTempC.toFixed(1)} °C`;
    if (sliderL) sliderL.value = airColumnLenCm;
    if (sliderFreq) sliderFreq.value = soundFreq;
    if (valVTheory) valVTheory.textContent = `${res.vTheory.toFixed(2)} m/s`;
    if (valResPos) valResPos.textContent = res.resPositions.map(p => `${p.toFixed(1)} cm`).join(', ');

    if (valStatus) {
      if (res.isAtResonance) {
        valStatus.innerHTML = `<span style="color:#00f5ff; font-weight:700;">🌊 เกิดการสั่นพ้อง (Resonance) เสียงกังวานชัดเจน! (ฮาร์มอนิกที่ ${res.closestHarmonic})</span>`;
      } else {
        valStatus.innerHTML = `<span style="color:#94a3b8;">เสียงระดับปกติ (ห่างจากจุดสั่นพ้อง ${res.minDiff.toFixed(1)} cm)</span>`;
      }
    }
  }

  // Register experiment
  window.PhysicsLabRegistry.registerExperiment({
    id: 'waves_resonance',
    domainId: 'waves',
    title: 'การสั่นพ้องของคลื่นเสียงในหลอดเรโซแนนซ์ (Acoustic Resonance Tube)',
    shortTitle: '🌊 หลอดเรโซแนนซ์',
    icon: '🌊',
    status: 'active',
    keyFormula: '$$L_n = (2n - 1)\\frac{\\lambda}{4} - \\Delta L \\quad (v = f\\lambda)$$',
    description: 'ศึกษาการเกิดคลื่นนิ่งในท่อปลายปิด 1 ด้าน ปรากฏการณ์กำทอนเสียง การวัดความยาวคลื่น และการหาความเร็วเสียงในอากาศ',
    features: ['Web Audio API Live Tone', 'Real-time Oscilloscope', 'Standing Wave Shaders', 'Acoustic Swell'],
    camera: { position: [0.3, 4.2, 7.5], target: [0, 3.2, 0] },
    topCamera: { position: [0, 9.5, 0.2], target: [0, 3.0, 0] },

    init(scene) {
      initWaves3D(scene);
      this.group = wavesGroup;
    },

    activate() {
      updateWaves3D();
      updateWavesUI();
      renderResonanceTable();
    },

    deactivate() {
      if (isAudioPlaying) toggleAudio();
    },

    update(dt, now) {
      drawOscilloscope(now);
      // Gentle standing wave breathing
      if (standingWaveLines.length > 0) {
        const pulse = 0.8 + 0.2 * Math.sin(now * 0.005);
        standingWaveLines[0].material.opacity = pulse;
      }
    },

    getLeftPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>🎛️ ตัวควบคุมความถี่ & ระดับลำอากาศ</span>
            <span class="badge badge-accent">Web Audio Synth</span>
          </div>

          <div class="control-row">
            <span class="control-label">ความถี่เสียงลำโพง ($f$)</span>
            <span id="waves-val-freq" class="control-val">512 Hz</span>
          </div>
          <input type="range" id="waves-slider-freq" min="256" max="1024" step="4" value="512" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">ความยาวลำอากาศในท่อ ($L$)</span>
            <span id="waves-val-l" class="control-val">17.0 cm</span>
          </div>
          <input type="range" id="waves-slider-l" min="5" max="85" step="0.5" value="17" class="lab-slider" />

          <div class="control-row" style="margin-top:10px;">
            <span class="control-label">อุณหภูมิห้อง ($T$)</span>
            <span id="waves-val-temp" class="control-val">25.0 °C</span>
          </div>
          <input type="range" id="waves-slider-temp" min="15" max="40" step="0.5" value="25" class="lab-slider" />

          <div style="display:flex; gap:8px; margin-top:14px;">
            <button id="btn-waves-audio" class="btn-primary" style="flex:1;">
              🔈 เปิดเสียงลำโพง (Web Audio)
            </button>
            <button id="btn-record-waves" class="btn-secondary">
              📝 บันทึกผล
            </button>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📐 ทฤษฎีความเร็วเสียง & การสั่นพ้อง</span>
          </div>
          <div class="formula-box">
            $$v = 331.3\\sqrt{1 + \\frac{T}{273.15}}\\text{ m/s}$$
            $$L_1 = \\frac{\\lambda}{4} - \\Delta L, \\quad L_2 = \\frac{3\\lambda}{4} - \\Delta L$$
            $$\\lambda = 2(L_2 - L_1) \\implies v = 2f(L_2 - L_1)$$
          </div>
        </div>
      `;
    },

    getRightPanelHTML() {
      return `
        <div class="section-card">
          <div class="section-title">
            <span>📈 ออสซิลโลสโคปจำลองคลื่นเสียง (Live Oscilloscope)</span>
            <span class="badge badge-accent">60 FPS Sound Wave</span>
          </div>
          <canvas id="waves-osc-canvas" width="380" height="130" style="width:100%; border-radius:8px; background:#020617; border:1px solid rgba(56,189,248,0.25);"></canvas>
          <div id="waves-val-status" style="margin-top:8px; font-size:0.82rem;"></div>
          
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:10px;">
            <div class="stat-tile">
              <span class="stat-tile-label">ความเร็วเสียงตามทฤษฎี ($v_{\\text{theo}}$)</span>
              <span id="waves-val-vtheory" class="stat-tile-val">346.3 m/s</span>
            </div>
            <div class="stat-tile">
              <span class="stat-tile-label">ตำแหน่งสั่นพ้องที่คาดหมาย ($L_n$)</span>
              <span id="waves-val-respos" class="stat-tile-val" style="font-size:0.85rem;">15.7 cm, 49.6 cm</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <span>📊 ตารางบันทึกตำแหน่งการสั่นพ้อง</span>
            <button class="panel-size-btn" onclick="resonanceTrials = []; renderResonanceTable();">ล้างตาราง</button>
          </div>
          <div style="max-height: 180px; overflow-y: auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>ลำดับ</th>
                  <th>ความถี่ $f$ (Hz)</th>
                  <th>ความยาว $L$ (cm)</th>
                  <th>ฮาร์มอนิก</th>
                  <th>สถานะการสั่นพ้อง</th>
                </tr>
              </thead>
              <tbody id="waves-table-body">
                <!-- Dynamically populated -->
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    mountUI(leftEl, rightEl) {
      const sliderFreq = document.getElementById('waves-slider-freq');
      const sliderL = document.getElementById('waves-slider-l');
      const sliderTemp = document.getElementById('waves-slider-temp');

      if (sliderFreq) {
        sliderFreq.addEventListener('input', (e) => {
          soundFreq = parseFloat(e.target.value);
          updateWaves3D();
          updateWavesUI();
        });
      }

      if (sliderL) {
        sliderL.addEventListener('input', (e) => {
          airColumnLenCm = parseFloat(e.target.value);
          updateWaves3D();
          updateWavesUI();
        });
      }

      if (sliderTemp) {
        sliderTemp.addEventListener('input', (e) => {
          airTempC = parseFloat(e.target.value);
          updateWaves3D();
          updateWavesUI();
        });
      }

      const btnAudio = document.getElementById('btn-waves-audio');
      if (btnAudio) btnAudio.addEventListener('click', toggleAudio);

      const btnRec = document.getElementById('btn-record-waves');
      if (btnRec) btnRec.addEventListener('click', recordResonanceTrial);

      updateWavesUI();
    }
  });

})();
