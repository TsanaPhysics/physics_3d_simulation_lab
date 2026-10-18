/**
 * experiments-registry.js
 * Extensible Physics Laboratory Registry & 7-Domain Curriculum Architecture
 * RBRU Next Gen Lab 2026
 * 
 * Supports dynamic registration of physics experiments across 7 domains:
 * 1. Electricity & DC/AC Circuits (ไฟฟ้าและวงจร)
 * 2. Electromagnetism & Induction (แม่เหล็กไฟฟ้า)
 * 3. Mechanics & Dynamics (กลศาสตร์และการเคลื่อนที่)
 * 4. Waves & Acoustics (คลื่นและเสียง)
 * 5. Optics & Wave Optics (ทัศนศาสตร์และแสง)
 * 6. Thermodynamics & Matter (อุณหพลศาสตร์และสสาร)
 * 7. Modern & Quantum Physics (ฟิสิกส์ยุคใหม่และควอนตัม)
 */

(function (window) {
  'use strict';

  // 1. Definition of 7 Fundamental Physics Domains
  const DOMAINS = {
    electricity: {
      id: 'electricity',
      nameTh: 'ไฟฟ้าและวงจรไฟฟ้า',
      nameEn: 'Electricity & Circuits',
      icon: '⚡',
      color: '#38bdf8',
      gradient: 'linear-gradient(135deg, #0284c7, #38bdf8)',
      description: 'ศึกษาทฤษฎีวงจรไฟฟ้ากระแสตรง กฎของโอห์ม กฎของเคอร์ชอฟฟ์ วงจรลดรูป 6 เหลี่ยม วงจรบริดจ์ และวงจรตัวเก็บประจุ RC'
    },
    electromagnetism: {
      id: 'electromagnetism',
      nameTh: 'แม่เหล็กไฟฟ้าและการเหนี่ยวนำ',
      nameEn: 'Electromagnetism & Induction',
      icon: '🧲',
      color: '#f43f5e',
      gradient: 'linear-gradient(135deg, #e11d48, #f43f5e)',
      description: 'ศึกษาการเหนี่ยวนำแม่เหล็กไฟฟ้า กฎของฟาราเดย์และเลนซ์ สนามแม่เหล็กในขดลวดโซเลนอยด์ และแรงแม่เหล็กลอเรนซ์'
    },
    mechanics: {
      id: 'mechanics',
      nameTh: 'กลศาสตร์และการเคลื่อนที่',
      nameEn: 'Mechanics & Dynamics',
      icon: '⚙️',
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
      description: 'ศึกษาการเคลื่อนที่แบบฮาร์มอนิกอย่างง่าย ลูกตุ้มเพนดูลัม การอนุรักษ์โมเมนตัม แรงเสียดทาน และการวัดความเร่ง g'
    },
    waves: {
      id: 'waves',
      nameTh: 'คลื่นและเสียง',
      nameEn: 'Waves & Acoustics',
      icon: '🌊',
      color: '#06b6d4',
      gradient: 'linear-gradient(135deg, #0891b2, #06b6d4)',
      description: 'ศึกษาปรากฏการณ์การสั่นพ้องในหลอดเรโซแนนซ์ คลื่นนิ่งในเส้นเชือก ความเร็วเสียงในอากาศ การกำทอน และการได้ยิน'
    },
    optics: {
      id: 'optics',
      nameTh: 'ทัศนศาสตร์และแสง',
      nameEn: 'Optics & Wave Optics',
      icon: '💡',
      color: '#a855f7',
      gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)',
      description: 'ศึกษาการเกิดภาพจากเลนส์บางและกระจกบนรางทัศนศาสตร์ กฎการสะท้อนและการหักเห การแทรกสอดสลิตคู่ และเกรตติงเลี้ยวเบน'
    },
    thermo: {
      id: 'thermo',
      nameTh: 'อุณหพลศาสตร์และสสาร',
      nameEn: 'Thermodynamics & Matter',
      icon: '🌡️',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #b91c1c, #ef4444)',
      description: 'ศึกษากฎของแก๊สอุดมคติ ความร้อนจำเพาะ การถ่ายโอนความร้อน และการวัดสัมประสิทธิ์การขยายตัวเชิงเส้นของโลหะ'
    },
    modern: {
      id: 'modern',
      nameTh: 'ฟิสิกส์ยุคใหม่และควอนตัม',
      nameEn: 'Modern & Quantum Physics',
      icon: '⚛️',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #059669, #10b981)',
      description: 'ศึกษาปรากฏการณ์โฟโตอิเล็กทริก ค่าคงตัวของพลังค์ การทดลองของฟรังก์-เฮิรตซ์ สเปกตรัมของอะตอม และการสลายตัวของสารกัมมันตรังสี'
    }
  };

  // 2. Experiment Registry Storage
  const experiments = {};
  let activeExperimentId = 'elec_hex_loop';
  const listeners = {
    'change': [],
    'register': []
  };

  // 3. Registry Core Class
  const PhysicsLabRegistry = {
    DOMAINS,

    /**
     * Register a new experiment into the laboratory ecosystem
     * @param {Object} expDef 
     */
    registerExperiment(expDef) {
      if (!expDef.id) throw new Error('Experiment must have a unique id');
      if (!expDef.domainId || !DOMAINS[expDef.domainId]) {
        console.warn(`Experiment ${expDef.id} domain ${expDef.domainId} not found, defaulting to electricity`);
        expDef.domainId = 'electricity';
      }

      // Default attributes
      expDef.status = expDef.status || 'ready'; // 'active' | 'ready' | 'planned'
      expDef.draggableInstruments = expDef.draggableInstruments || [];

      // Auto-initialize 3D meshes if scene is already instantiated
      if (window.scene && !expDef.isInitialized && typeof expDef.init === 'function') {
        try {
          expDef.init(window.scene);
          expDef.isInitialized = true;
          if (expDef.group) {
            expDef.group.visible = (expDef.id === activeExperimentId);
          }
        } catch (e) {
          console.error(`Error initializing 3D on register for ${expDef.id}:`, e);
        }
      }

      experiments[expDef.id] = expDef;
      // Trigger register callbacks
      listeners['register'].forEach(fn => fn(expDef));
      return expDef;
    },

    /**
     * Pre-initialize all registered experiments with 3D scene
     */
    initAllExperiments(sceneRef) {
      const s = sceneRef || window.scene;
      if (!s) return;
      Object.values(experiments).forEach(exp => {
        if (!exp.isInitialized && typeof exp.init === 'function') {
          try {
            exp.init(s);
            exp.isInitialized = true;
            if (exp.group) {
              exp.group.visible = (exp.id === activeExperimentId);
            }
          } catch (e) {
            console.error(`Error initializing 3D for ${exp.id}:`, e);
          }
        }
      });
    },

    /**
     * Retrieve an experiment by ID
     */
    getExperiment(id) {
      return experiments[id] || null;
    },

    /**
     * Retrieve active experiment object
     */
    getActiveExperiment() {
      return experiments[activeExperimentId] || null;
    },

    /**
     * Retrieve active experiment ID
     */
    getActiveExperimentId() {
      return activeExperimentId;
    },

    /**
     * Retrieve all registered experiments
     */
    getAllExperiments() {
      return Object.values(experiments);
    },

    /**
     * Retrieve experiments grouped by domain
     */
    getExperimentsByDomain(domainId) {
      return Object.values(experiments).filter(e => e.domainId === domainId);
    },

    /**
     * Retrieve domain metadata
     */
    getDomain(domainId) {
      return DOMAINS[domainId] || null;
    },

    /**
     * Retrieve all domains
     */
    getAllDomains() {
      return Object.values(DOMAINS);
    },

    /**
     * Switch currently active experiment
     * @param {string} expId 
     */
    switchExperiment(expId) {
      const targetExp = experiments[expId];
      if (!targetExp) {
        console.error(`Cannot switch to unknown experiment: ${expId}`);
        return;
      }

      const prevExp = experiments[activeExperimentId];
      if (prevExp && typeof prevExp.deactivate === 'function') {
        try {
          prevExp.deactivate();
        } catch (e) {
          console.warn(`Error deactivating ${prevExp.id}:`, e);
        }
      }

      activeExperimentId = expId;

      // 1. Ensure target experiment is initialized with 3D scene
      if (!targetExp.isInitialized && typeof targetExp.init === 'function') {
        try {
          targetExp.init(window.scene);
          targetExp.isInitialized = true;
        } catch (e) {
          console.error(`Error initializing 3D for ${expId}:`, e);
        }
      }

      // 2. Hide all other experiment 3D groups and show target group
      Object.values(experiments).forEach(exp => {
        if (exp.group) {
          exp.group.visible = (exp.id === expId);
        }
      });

      // Hide all panels
      document.querySelectorAll('.side-panel.left-panel').forEach(p => p.classList.add('hidden'));
      document.querySelectorAll('.side-panel.right-panel').forEach(p => p.classList.add('hidden'));

      // Activate target experiment
      if (typeof targetExp.activate === 'function') {
        try {
          targetExp.activate();
        } catch (e) {
          console.error(`Error activating ${expId}:`, e);
        }
      }

      // Update UI panels
      this.mountExperimentPanels(targetExp);

      // Apply camera view
      this.applyCameraView(targetExp);

      // Re-render floating 3D labels for this experiment
      if (typeof labelItems !== 'undefined') {
        labelItems.forEach(item => {
          if (item.expId === expId || item.expId === targetExp.numericId) {
            item.el.style.display = 'block';
          } else {
            item.el.style.display = 'none';
          }
        });
      }

      // Update Topbar navigation tabs & dropdown
      this.updateTopbarUI();

      // Trigger change callbacks
      listeners['change'].forEach(fn => fn(targetExp, prevExp));

      // KaTeX math re-typeset
      if (typeof renderAcademicMath === 'function') {
        setTimeout(() => renderAcademicMath(document.body), 50);
      }
    },

    /**
     * Mounts panels for the active experiment
     */
    mountExperimentPanels(exp) {
      // 1. If experiment has static panel IDs (e.g. left-exp1, left-exp2)
      if (exp.leftPanelId && exp.rightPanelId) {
        const lp = document.getElementById(exp.leftPanelId);
        const rp = document.getElementById(exp.rightPanelId);
        if (lp) lp.classList.remove('hidden');
        if (rp) rp.classList.remove('hidden');
        
        // Preserve collapse states
        if (typeof leftPanelCollapsed !== 'undefined' && lp) {
          lp.classList.toggle('collapsed', leftPanelCollapsed);
        }
        if (typeof rightPanelCollapsed !== 'undefined' && rp) {
          rp.classList.toggle('collapsed', rightPanelCollapsed);
        }
        return;
      }

      // 2. Dynamic Panel Mounting into #dynamic-left-panel & #dynamic-right-panel
      let dynLeft = document.getElementById('dynamic-left-panel');
      let dynRight = document.getElementById('dynamic-right-panel');

      if (!dynLeft) {
        dynLeft = document.createElement('aside');
        dynLeft.id = 'dynamic-left-panel';
        dynLeft.className = 'side-panel left-panel';
        document.body.appendChild(dynLeft);
      }
      if (!dynRight) {
        dynRight = document.createElement('aside');
        dynRight.id = 'dynamic-right-panel';
        dynRight.className = 'side-panel right-panel';
        document.body.appendChild(dynRight);
      }

      dynLeft.classList.remove('hidden');
      dynRight.classList.remove('hidden');

      if (typeof leftPanelCollapsed !== 'undefined') {
        dynLeft.classList.toggle('collapsed', leftPanelCollapsed);
      }
      if (typeof rightPanelCollapsed !== 'undefined') {
        dynRight.classList.toggle('collapsed', rightPanelCollapsed);
      }

      // Render Dynamic Left Panel HTML
      if (typeof exp.getLeftPanelHTML === 'function') {
        dynLeft.innerHTML = `
          <div class="panel-resize-handle" onpointerdown="initPanelResize(event, 'left')" title="คลิกลากซ้าย-ขวา เพื่อย่อ/ขยายความกว้าง"></div>
          <div class="panel-header-bar">
            <span class="panel-header-title">${exp.icon || '🎛️'} ${exp.title}</span>
            <div class="panel-header-actions">
              <button class="panel-size-btn" onclick="adjustPanelWidth('left', -40)" title="ย่อความกว้าง">➖ ย่อ</button>
              <button class="panel-size-btn" onclick="adjustPanelWidth('left', 40)" title="ขยายความกว้าง">➕ ขยาย</button>
              <button class="panel-collapse-btn" onclick="toggleSidePanel('left')" title="พับเก็บแผงซ้าย">◀ พับเก็บ</button>
            </div>
          </div>
          ${exp.getLeftPanelHTML()}
        `;
      }

      // Render Dynamic Right Panel HTML
      if (typeof exp.getRightPanelHTML === 'function') {
        dynRight.innerHTML = `
          <div class="panel-resize-handle" onpointerdown="initPanelResize(event, 'right')" title="คลิกลากซ้าย-ขวา เพื่อย่อ/ขยายความกว้าง"></div>
          <div class="panel-header-bar">
            <span class="panel-header-title">📊 ผลการวัด & การวิเคราะห์เชิงฟิสิกส์</span>
            <div class="panel-header-actions">
              <button class="panel-size-btn" onclick="adjustPanelWidth('right', -40)" title="ย่อความกว้าง">➖ ย่อ</button>
              <button class="panel-size-btn" onclick="adjustPanelWidth('right', 40)" title="ขยายความกว้าง">➕ ขยาย</button>
              <button class="panel-collapse-btn" onclick="toggleSidePanel('right')" title="พับเก็บแผงขวา">พับเก็บ ▶</button>
            </div>
          </div>
          ${exp.getRightPanelHTML()}
        `;
      }

      // Call mountUI if provided
      if (typeof exp.mountUI === 'function') {
        exp.mountUI(dynLeft, dynRight);
      }
    },

    /**
     * Apply default camera position for experiment
     */
    applyCameraView(exp) {
      if (!window.camera || !window.controls) return;
      const cam = exp.camera || { position: [0, 8, 10], target: [0, 0, 0] };
      camera.position.set(cam.position[0], cam.position[1], cam.position[2]);
      controls.target.set(cam.target[0], cam.target[1], cam.target[2]);
      controls.update();
    },

    /**
     * Apply top camera position for experiment
     */
    applyTopCameraView(exp) {
      if (!window.camera || !window.controls) return;
      const topCam = exp.topCamera || { position: [0, 13, 0.5], target: [0, 0, 0] };
      camera.position.set(topCam.position[0], topCam.position[1], topCam.position[2]);
      controls.target.set(topCam.target[0], topCam.target[1], topCam.target[2]);
      controls.update();
    },

    /**
     * Update Topbar UI elements to reflect current experiment & domain
     */
    updateTopbarUI() {
      const active = this.getActiveExperiment();
      if (!active) return;

      const domain = DOMAINS[active.domainId] || DOMAINS.electricity;

      // Update Domain Selector Badge
      const domainBtn = document.getElementById('topbar-domain-btn');
      if (domainBtn) {
        domainBtn.innerHTML = `
          <span class="domain-pill" style="background: ${domain.color}22; border-color: ${domain.color}; color: ${domain.color};">
            ${domain.icon} ${domain.nameTh}
          </span>
          <span class="exp-title-current">${active.shortTitle || active.title}</span>
          <span class="dropdown-caret">▾</span>
        `;
      }

      // Update tabs if rendered
      const tabs = document.querySelectorAll('.mode-tabs .tab-btn');
      tabs.forEach(btn => {
        const id = btn.getAttribute('data-exp-id');
        btn.classList.toggle('active', id === activeExperimentId);
      });
    },

    /**
     * Get Draggable Instruments from currently active experiment
     */
    getActiveDraggableInstruments() {
      const exp = this.getActiveExperiment();
      if (!exp) return [];
      if (Array.isArray(exp.draggableInstruments)) {
        return exp.draggableInstruments;
      }
      return [];
    },

    /**
     * Subscribe to registry events
     */
    on(event, fn) {
      if (listeners[event]) listeners[event].push(fn);
    },

    /**
     * Open the 7-Domain Physics Lab Hub Modal
     */
    openHubModal(domainFilter) {
      let modal = document.getElementById('lab-hub-modal');
      if (!modal) {
        this.createHubModalDOM();
        modal = document.getElementById('lab-hub-modal');
      }
      this.renderHubModalContent(domainFilter || 'all');
      modal.classList.add('open');
      if (typeof renderAcademicMath === 'function') {
        setTimeout(() => renderAcademicMath(modal), 50);
      }
    },

    /**
     * Close the Hub Modal
     */
    closeHubModal() {
      const modal = document.getElementById('lab-hub-modal');
      if (modal) modal.classList.remove('open');
    },

    /**
     * Create the DOM structure for the Hub Modal
     */
    createHubModalDOM() {
      const modal = document.createElement('div');
      modal.id = 'lab-hub-modal';
      modal.className = 'hub-modal-backdrop';
      modal.innerHTML = `
        <div class="hub-modal-card">
          <div class="hub-modal-header">
            <div class="hub-header-title-box">
              <span class="hub-badge">RBRU VIRTUAL PHYSICS LAB ECOSYSTEM</span>
              <h2>🌐 ศูนย์รวมปฏิบัติการฟิสิกส์เสมือนจริง 7 กลุ่มวิชา</h2>
              <p>ระบบจำลองการทดลอง 3 มิติเชิงโต้ตอบ (Three.js WebGL) และเทคโนโลยีควบคุมไร้สัมผัส AR MediaPipe Hands</p>
            </div>
            <button class="hub-close-btn" onclick="PhysicsLabRegistry.closeHubModal()" title="ปิดหน้าต่าง">✕</button>
          </div>

          <div class="hub-domain-nav" id="hub-domain-tabs">
            <!-- Rendered dynamically -->
          </div>

          <div class="hub-experiments-grid" id="hub-experiments-grid">
            <!-- Rendered dynamically -->
          </div>

          <div class="hub-modal-footer">
            <div class="hub-footer-info">
              💡 <b>ความยืดหยุ่นของระบบ:</b> เพิ่มปฏิบัติการใหม่ได้ง่ายเพียงเขียนโมดูล JavaScript และเรียก <code>PhysicsLabRegistry.registerExperiment({...})</code>
            </div>
            <button class="btn-primary" onclick="PhysicsLabRegistry.openNewLabGuide()">
              ✨ ดูวิธีเพิ่มปฏิบัติการใหม่ (Developer / Instructor Guide)
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeHubModal();
      });
    },

    /**
     * Render the Hub Modal's domain tabs & experiment cards
     */
    renderHubModalContent(filterDomain) {
      const tabsContainer = document.getElementById('hub-domain-tabs');
      const gridContainer = document.getElementById('hub-experiments-grid');
      if (!tabsContainer || !gridContainer) return;

      // 1. Render Domain Category Tabs
      let tabsHTML = `
        <button class="hub-domain-tab ${filterDomain === 'all' ? 'active' : ''}" onclick="PhysicsLabRegistry.renderHubModalContent('all')">
          🌟 ทุกกลุ่มวิชา (${Object.keys(experiments).length})
        </button>
      `;

      Object.values(DOMAINS).forEach(d => {
        const count = Object.values(experiments).filter(e => e.domainId === d.id).length;
        const isActive = filterDomain === d.id;
        tabsHTML += `
          <button class="hub-domain-tab ${isActive ? 'active' : ''}" 
                  style="${isActive ? `border-bottom-color: ${d.color}; color: #fff;` : ''}"
                  onclick="PhysicsLabRegistry.renderHubModalContent('${d.id}')">
            ${d.icon} ${d.nameTh} <span class="count-badge">${count}</span>
          </button>
        `;
      });
      tabsContainer.innerHTML = tabsHTML;

      // 2. Render Experiment Cards
      let expList = Object.values(experiments);
      if (filterDomain !== 'all') {
        expList = expList.filter(e => e.domainId === filterDomain);
      }

      let cardsHTML = '';
      expList.forEach(exp => {
        const domain = DOMAINS[exp.domainId] || DOMAINS.electricity;
        const isCurrent = exp.id === activeExperimentId;
        const isReady = exp.status === 'active' || exp.status === 'ready';

        cardsHTML += `
          <div class="hub-exp-card ${isCurrent ? 'current-active' : ''}" style="border-top: 3px solid ${domain.color};">
            <div class="card-header">
              <span class="card-domain-badge" style="background: ${domain.color}22; color: ${domain.color}; border: 1px solid ${domain.color}44;">
                ${domain.icon} ${domain.nameTh}
              </span>
              <span class="card-status-badge ${isReady ? 'ready' : 'planned'}">
                ${isReady ? '🟢 พร้อมใช้งาน' : '🟡 แผนพัฒนา'}
              </span>
            </div>

            <h3 class="card-title">${exp.title}</h3>
            <p class="card-desc">${exp.description || 'การทดลองจำลองฟิสิกส์ 3 มิติเชิงปฏิสัมพันธ์'}</p>

            ${exp.keyFormula ? `
              <div class="card-formula-box">
                <span class="formula-label">สมการหลัก:</span>
                <span class="formula-math">${exp.keyFormula}</span>
              </div>
            ` : ''}

            <div class="card-features">
              ${(exp.features || ['3D Interactive', 'KaTeX Math', 'AR MediaPipe']).map(f => `<span class="feature-tag">✔ ${f}</span>`).join('')}
            </div>

            <div class="card-action-bar">
              ${isReady ? `
                <button class="card-launch-btn ${isCurrent ? 'btn-active-now' : ''}" onclick="PhysicsLabRegistry.switchExperiment('${exp.id}'); PhysicsLabRegistry.closeHubModal();">
                  ${isCurrent ? '⭐ กำลังเปิดใช้อยู่' : '🚀 เข้าสู่การทดลอง'}
                </button>
              ` : `
                <button class="card-launch-btn disabled" disabled title="อยู่ระหว่างเตรียมการติดตั้ง">
                  ⚙️ อยู่ในโครงร่างพัฒนา
                </button>
              `}
            </div>
          </div>
        `;
      });

      gridContainer.innerHTML = cardsHTML;
    },

    /**
     * Show Instructor / Developer Guide on how to add experiments
     */
    openNewLabGuide() {
      const guideHTML = `
        <div style="background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 12px; padding: 20px; color: #f8fafc; max-width: 720px; margin: 20px auto; font-family: 'Prompt', sans-serif;">
          <h3 style="color: #38bdf8; margin-bottom: 10px;">🛠️ สถาปัตยกรรม Plug & Play: วิธีการเพิ่มปฏิบัติการใหม่</h3>
          <p style="font-size: 0.86rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 14px;">
            ระบบ RBRU NextGen Lab ถูกออกแบบให้ <b>ยืดหยุ่นสูงสุด (Ultra-Extensible)</b> โดยการเพิ่มปฏิบัติการใหม่ไม่ต้องแก้ไขโค้ดเดิม เพียงสร้างไฟล์ใน <code>js/experiments/your-lab.js</code> และลงทะเบียนดังนี้:
          </p>
          <pre style="background: #020617; padding: 12px; border-radius: 8px; font-size: 0.76rem; color: #a5f3fc; overflow-x: auto; font-family: 'JetBrains Mono', monospace; line-height: 1.4;">
PhysicsLabRegistry.registerExperiment({
  id: 'my_new_experiment',
  domainId: 'optics', // 1 ใน 7 กลุ่ม: electricity, electromagnetism, mechanics, waves, optics, thermo, modern
  title: 'ชื่อการทดลองเต็ม',
  shortTitle: '💡 ชื่อย่อบนแท็บ',
  description: 'คำอธิบายจุดประสงค์การทดลอง',
  keyFormula: '$$\\\\frac{1}{f} = \\\\frac{1}{s} + \\\\frac{1}{s\'}$$',
  camera: { position: [0, 6, 9], target: [0, 1, 0] },
  status: 'active',
  
  init(scene) {
    // 1. สร้าง THREE.Group และเพิ่มอุปกรณ์ 3D เข้า scene
    this.group = new THREE.Group();
    scene.add(this.group);
  },
  update(dt, now) {
    // 2. คำนวณฟิสิกส์แอนิเมชัน 60 FPS
  },
  getLeftPanelHTML() {
    // 3. ส่งคืน HTML สไลเดอร์และปุ่มควบคุมด้านซ้าย
    return \`&lt;div class="section-card"&gt;...&lt;/div&gt;\`;
  },
  getRightPanelHTML() {
    // 4. ส่งคืน HTML ตารางและกราฟวิเคราะห์ผลด้านขวา
    return \`&lt;div class="section-card"&gt;...&lt;/div&gt;\`;
  },
  mountUI(leftEl, rightEl) {
    // 5. ผูก Event Listeners
  }
});
          </pre>
          <div style="text-align: right; margin-top: 14px;">
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">เข้าใจแล้ว ปิดคำแนะนำ</button>
          </div>
        </div>
      `;

      const grid = document.getElementById('hub-experiments-grid');
      if (grid) {
        grid.insertAdjacentHTML('afterbegin', guideHTML);
      }
    }
  };

  // Expose to global window
  window.PhysicsLabRegistry = PhysicsLabRegistry;

})(window);
