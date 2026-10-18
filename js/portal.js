/**
 * js/portal.js
 * Main Portal / Landing Dashboard Controller
 * NextGen Physics Laboratory 2026 - RBRU
 */

(function () {
  'use strict';

  let currentDomainFilter = 'all';
  let searchQuery = '';

  const DOMAIN_DATA = {
    electricity: { name: 'ไฟฟ้าและวงจร', icon: '⚡', color: '#38bdf8' },
    mechanics: { name: 'กลศาสตร์และการเคลื่อนที่', icon: '⚙️', color: '#f59e0b' },
    waves: { name: 'คลื่นและสวนศาสตร์', icon: '🌊', color: '#06b6d4' },
    optics: { name: 'ทัศนศาสตร์และแสง', icon: '💡', color: '#eab308' },
    electromagnetism: { name: 'แม่เหล็กไฟฟ้าและการเหนี่ยวนำ', icon: '🧲', color: '#a855f7' },
    thermo: { name: 'อุณหพลศาสตร์และสมบัติสาร', icon: '🌡️', color: '#ef4444' },
    modern: { name: 'ฟิสิกส์ยุคใหม่และควอนตัม', icon: '⚛️', color: '#10b981' }
  };

  function initPortal() {
    renderPortalStats();
    renderDomainChips();
    renderLabCards();

    // Search input listener
    const searchInput = document.getElementById('portal-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderLabCards();
      });
    }

    // Escape key closes portal if lab is active
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const portal = document.getElementById('portal-view');
        if (portal && portal.classList.contains('active')) {
          togglePortalView(false);
        }
      }
    });
  }

  function togglePortalView(show) {
    const portal = document.getElementById('portal-view');
    if (!portal) return;

    const isActive = (typeof show === 'boolean') ? show : !portal.classList.contains('active');
    portal.classList.toggle('active', isActive);

    if (isActive) {
      renderLabCards();
      if (typeof renderAcademicMath === 'function') {
        setTimeout(() => renderAcademicMath(portal), 60);
      }
    }
  }

  function renderPortalStats() {
    const statGrid = document.getElementById('portal-stats-bar');
    if (!statGrid || !window.PhysicsLabRegistry) return;

    const allExps = window.PhysicsLabRegistry.getAllExperiments();
    const domains = window.PhysicsLabRegistry.getAllDomains();

    statGrid.innerHTML = `
      <div class="portal-stat-card">
        <span class="stat-card-val">${allExps.length}</span>
        <span class="stat-card-lbl">ปฏิบัติการพร้อมใช้งาน</span>
      </div>
      <div class="portal-stat-card">
        <span class="stat-card-val">${domains.length}</span>
        <span class="stat-card-lbl">กลุ่มสาขาวิชาฟิสิกส์</span>
      </div>
      <div class="portal-stat-card">
        <span class="stat-card-val" style="color:#4ade80;">100%</span>
        <span class="stat-card-lbl">3D PBR Physics Simulation</span>
      </div>
      <div class="portal-stat-card">
        <span class="stat-card-val" style="color:#a855f7;">60 FPS</span>
        <span class="stat-card-lbl">AR MediaPipe Tracking</span>
      </div>
      <div class="portal-stat-card">
        <span class="stat-card-val" style="color:#f59e0b;">Agentic</span>
        <span class="stat-card-lbl">Dr. Newton AI Copilot</span>
      </div>
    `;
  }

  function renderDomainChips() {
    const chipsContainer = document.getElementById('portal-domain-chips');
    if (!chipsContainer || !window.PhysicsLabRegistry) return;

    const allExps = window.PhysicsLabRegistry.getAllExperiments();
    const domains = window.PhysicsLabRegistry.getAllDomains();

    let html = `
      <button class="domain-chip ${currentDomainFilter === 'all' ? 'active' : ''}" onclick="window.filterPortalByDomain('all')">
        <span>🌟 ทั้งหมด</span>
        <span class="chip-count">${allExps.length}</span>
      </button>
    `;

    domains.forEach(d => {
      const count = allExps.filter(e => e.domainId === d.id).length;
      const isAct = currentDomainFilter === d.id;
      html += `
        <button class="domain-chip ${isAct ? 'active' : ''}" onclick="window.filterPortalByDomain('${d.id}')">
          <span>${d.icon} ${d.nameTh}</span>
          <span class="chip-count">${count}</span>
        </button>
      `;
    });

    chipsContainer.innerHTML = html;
  }

  function filterPortalByDomain(domId) {
    currentDomainFilter = domId;
    renderDomainChips();
    renderLabCards();
  }

  function renderLabCards() {
    const grid = document.getElementById('portal-cards-grid');
    if (!grid || !window.PhysicsLabRegistry) return;

    const allExps = window.PhysicsLabRegistry.getAllExperiments();
    const activeId = window.PhysicsLabRegistry.getActiveExperimentId();

    let filtered = allExps;

    // Domain filter
    if (currentDomainFilter !== 'all') {
      filtered = filtered.filter(e => e.domainId === currentDomainFilter);
    }

    // Search query filter
    if (searchQuery) {
      filtered = filtered.filter(e => {
        const text = `${e.title} ${e.shortTitle} ${e.description || ''} ${e.keyFormula || ''}`.toLowerCase();
        return text.includes(searchQuery);
      });
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; color: #94a3b8;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
          <h3>ไม่พบการทดลองที่ตรงกับคำค้นหา</h3>
          <p style="font-size: 0.88rem; margin-top: 6px;">ลองพิมพ์คำค้นอื่น หรือคลิกเลือกกลุ่มวิชาทั้งหมด</p>
        </div>
      `;
      return;
    }

    let cardsHTML = '';
    filtered.forEach(exp => {
      const dom = DOMAIN_DATA[exp.domainId] || { name: 'ฟิสิกส์', icon: '⚡', color: '#38bdf8' };
      const isActive = exp.id === activeId;
      const features = exp.features || ['3D Interactive', 'KaTeX Math', 'AR MediaPipe'];

      cardsHTML += `
        <div class="portal-lab-card ${isActive ? 'active-lab' : ''}" style="border-top: 3px solid ${dom.color};">
          <div>
            <div class="card-top-row">
              <span class="card-domain-tag" style="background: ${dom.color}20; color: ${dom.color}; border: 1px solid ${dom.color}40;">
                ${dom.icon} ${dom.name}
              </span>
              <span class="card-status-pill">
                <span>●</span> พร้อมใช้งาน
              </span>
            </div>

            <h3 class="card-lab-title">${exp.title}</h3>
            <p class="card-lab-desc">${exp.description || 'การทดลองจำลอง 3 มิติเชิงปฏิสัมพันธ์ระดับห้องปฏิบัติการมาตรฐาน'}</p>

            ${exp.keyFormula ? `
              <div class="card-formula-preview">
                ${exp.keyFormula}
              </div>
            ` : ''}

            <div class="card-tags-list">
              ${features.map(f => `<span class="card-tag-item">✔ ${f}</span>`).join('')}
            </div>
          </div>

          <div class="card-actions-row">
            <button class="btn-card-launch" onclick="window.launchLabFromPortal('${exp.id}')">
              <span>🚀 เข้าสู่ปฏิบัติการ 3D</span>
            </button>
            <button class="btn-card-ai-ask" onclick="window.askAIAboutLab('${exp.id}')" title="ปรึกษา Dr. Newton AI เกี่ยวกับแล็บนี้">
              <span>🤖 ถาม AI</span>
            </button>
          </div>
        </div>
      `;
    });

    grid.innerHTML = cardsHTML;

    // Render KaTeX for formulas inside portal
    if (typeof renderAcademicMath === 'function') {
      setTimeout(() => renderAcademicMath(grid), 50);
    }
  }

  function launchLabFromPortal(expId) {
    if (window.PhysicsLabRegistry) {
      window.PhysicsLabRegistry.switchExperiment(expId);
    }
    togglePortalView(false);
  }

  function askAIAboutLab(expId) {
    launchLabFromPortal(expId);
    if (window.AIBot) {
      window.AIBot.openChat();
      window.AIBot.sendUserMessage(`ช่วยแนะนำและสรุปแนวคิดของปฏิบัติการนี้ (${expId}) รวมถึงขั้นตอนการทดลองอย่างละเอียด`);
    }
  }

  // Export to global scope
  window.togglePortalView = togglePortalView;
  window.filterPortalByDomain = filterPortalByDomain;
  window.launchLabFromPortal = launchLabFromPortal;
  window.askAIAboutLab = askAIAboutLab;
  window.initPortal = initPortal;

})();
