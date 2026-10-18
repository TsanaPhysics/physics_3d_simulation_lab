/**
 * ui-exp1.js
 * Experiment 1 UI Controllers, Data Table & Meter Mode
 * RBRU Next Gen Lab 2026
 */

function setMeterDisplayMode(mode) {
  meterDisplayMode = mode;
  document.getElementById('mode-analog-btn').classList.toggle('active', mode === 'analog');
  document.getElementById('mode-digital-btn').classList.toggle('active', mode === 'digital');
  document.getElementById('ui-volt-analog').classList.toggle('visible', mode === 'analog');
  document.getElementById('ui-amp-analog').classList.toggle('visible', mode === 'analog');
  refreshExp1UI();
}

function selectNodePair(nP, nQ) {
  selectedNodeP = nP;
  selectedNodeQ = nQ;
  refreshExp1UI();
}

function setProbeNode(probe, node) {
  if (probe === 'P') {
    if (node === selectedNodeQ) {
      const qIdx = nodesOrder.indexOf(selectedNodeQ);
      selectedNodeQ = nodesOrder[(qIdx + 1) % 6];
    }
    selectedNodeP = node;
  } else if (probe === 'Q') {
    if (node === selectedNodeP) {
      const pIdx = nodesOrder.indexOf(selectedNodeP);
      selectedNodeP = nodesOrder[(pIdx + 5) % 6];
    }
    selectedNodeQ = node;
  }
  refreshExp1UI();
}

function toggleCircuitSwitch() {
  switchClosed = !switchClosed;
  const btn = document.getElementById('switch-btn');
  const icon = document.getElementById('switch-icon');
  const txt = document.getElementById('switch-text');
  if (switchClosed) {
    btn.className = 'switch-toggle closed';
    icon.textContent = '🟢';
    txt.textContent = 'สวิตช์ปิดอยู่ (กระแสไหลครบวงจร)';
  } else {
    btn.className = 'switch-toggle open';
    icon.textContent = '🔴';
    txt.textContent = 'สวิตช์เปิดอยู่ (วงจรเปิด I = 0 A)';
  }
  refreshExp1UI();
}

function refreshExp1UI() {
  updateDynamicProbeWires();
  const phys = computeCircuitPhysics(selectedNodeP, selectedNodeQ);
  if (!phys) return;
  currentPhysState = phys;

  targetAmmeterVal = phys.iVal;
  targetVoltmeterVal = phys.vVal;

  // Auto-range bench meters for realistic ranges
  if (typeof voltmeter3D !== 'undefined' && voltmeter3D) {
    voltmeter3D.maxScale = powerSupplyVoltage > 15 ? 30.0 : (powerSupplyVoltage > 3.5 ? 15.0 : 3.5);
  }
  if (typeof ammeter3D !== 'undefined' && ammeter3D) {
    ammeter3D.maxScale = (phys.iVal > 1.0) ? 5.0 : 1.0;
  }

  // Update Back DC Power Supply dual LED screen
  updatePowerSupplyLED(powerSupplyVoltage, phys.iVal);

  syncNodeSelectors();

  document.getElementById('ui-ammeter-dec').textContent = `${phys.iVal.toFixed(3)} A`;
  document.getElementById('ui-ammeter-frac').textContent = `= ${phys.iFrac} A`;
  document.getElementById('ui-voltmeter-dec').textContent = `${phys.vVal.toFixed(3)} V`;
  document.getElementById('ui-voltmeter-frac').textContent = `= ${phys.vFrac} V`;

  const breakdownEl = document.getElementById('ui-circuit-breakdown');
  if (breakdownEl) {
    breakdownEl.innerHTML =
      `<div>คู่จุดต่อ <b>${selectedNodeP} – ${selectedNodeQ}</b>: $R_{\\text{ตรง}} = ${phys.rDirect}\\,\\Omega \\parallel R_{\\text{อ้อม}} = ${phys.rIndirect}\\,\\Omega$</div>` +
      `<div style="margin-top:4px;">$R_{\\text{ชุด}} = \\mathbf{${phys.reqLatex}\\,\\Omega} \\approx ${phys.reqVal.toFixed(3)}\\,\\Omega$ &nbsp;|&nbsp; $R_{\\text{รวม}} = \\mathbf{${phys.rTotLatex}\\,\\Omega}$</div>` +
      `<div style="margin-top:4px; color:#38bdf8; font-size:0.75rem;">แหล่งจ่าย $V_s = \\mathbf{${powerSupplyVoltage.toFixed(1)}\\text{ V}}$ &nbsp;|&nbsp; $I = \\frac{V_s}{R_{\\text{รวม}}} = \\mathbf{${phys.iLatex}\\text{ A}}$ &nbsp;|&nbsp; $V_{PQ} = \\mathbf{${phys.vLatex}\\text{ V}}$</div>`;
    if (typeof renderAcademicMath === 'function') {
      renderAcademicMath(breakdownEl);
    }
  }

  swLeverPivot.rotation.z = switchClosed ? 0 : 0.68;

  syncResistorAdjustUI();
  renderCircuitReduction(phys);

  edgeParticles.forEach((ep) => {
    if (!switchClosed) {
      ep.speed = 0;
      ep.mesh.visible = false;
    } else {
      ep.mesh.visible = true;
      const inPath1 = phys.path1Edges.includes(ep.edgeIdx);
      const branchR = inPath1 ? phys.r1 : phys.r2;
      ep.speed = (inPath1 ? 1 : -1) * (0.032 / branchR) * phys.iVal * 12;
    }
  });
}

function syncResistorAdjustUI() {
  edgeResistors.forEach((edge, idx) => {
    const inputEl = document.getElementById(`res-input-${idx}`);
    const valEl = document.getElementById(`res-val-${idx}`);
    const sliderEl = document.getElementById(`res-slider-${idx}`);
    if (valEl) valEl.textContent = `${edge.R} Ω`;
    if (inputEl && document.activeElement !== inputEl) {
      inputEl.value = edge.R;
    }
    if (sliderEl) sliderEl.value = edge.R;
  });

  const totalR = edgeResistors.reduce((sum, e) => sum + e.R, 0);
  const loopTotEl = document.getElementById('ui-loop-total');
  if (loopTotEl) {
    loopTotEl.innerHTML = `ผลรวมความต้านทานรอบวงแหวน: $\\sum R = \\mathbf{${totalR}\\,\\Omega}$`;
    if (typeof renderAcademicMath === 'function') {
      renderAcademicMath(loopTotEl);
    }
  }

  // Update Voltage Controls
  const voltInputEl = document.getElementById('psu-voltage-input');
  const voltSliderEl = document.getElementById('psu-voltage-slider');
  if (voltInputEl && document.activeElement !== voltInputEl) {
    voltInputEl.value = powerSupplyVoltage.toFixed(1);
  }
  if (voltSliderEl) {
    voltSliderEl.value = powerSupplyVoltage;
  }
  document.querySelectorAll('.preset-chip').forEach((btn) => {
    const val = parseFloat(btn.getAttribute('data-v'));
    btn.classList.toggle('active', Math.abs(val - powerSupplyVoltage) < 0.05);
  });

  // Update pair button texts with current resistor values
  const pairBtnAB = document.querySelector('button[data-pair="a-b"]');
  if (pairBtnAB) pairBtnAB.textContent = `คู่ a – b (${edgeResistors[0].R} Ω)`;
  const pairBtnBC = document.querySelector('button[data-pair="b-c"]');
  if (pairBtnBC) pairBtnBC.textContent = `คู่ b – c (${edgeResistors[1].R} Ω)`;
  const pairBtnCD = document.querySelector('button[data-pair="c-d"]');
  if (pairBtnCD) pairBtnCD.textContent = `คู่ c – d (${edgeResistors[2].R} Ω)`;
  const pairBtnDE = document.querySelector('button[data-pair="d-e"]');
  if (pairBtnDE) pairBtnDE.textContent = `คู่ d – e (${edgeResistors[3].R} Ω)`;
  const pairBtnEF = document.querySelector('button[data-pair="e-f"]');
  if (pairBtnEF) pairBtnEF.textContent = `คู่ e – f (${edgeResistors[4].R} Ω)`;
  const pairBtnFA = document.querySelector('button[data-pair="f-a"]');
  if (pairBtnFA) pairBtnFA.textContent = `คู่ f – a (${edgeResistors[5].R} Ω)`;
}

function stepResistorValue(edgeIdx, delta) {
  if (!edgeResistors[edgeIdx]) return;
  const current = edgeResistors[edgeIdx].R;
  setResistorValue(edgeIdx, current + delta);
}

function onResistorSliderChange(edgeIdx, val) {
  setResistorValue(edgeIdx, val);
}

function onResistorInputChange(edgeIdx, val) {
  const num = parseFloat(val);
  if (isNaN(num)) return;
  setResistorValue(edgeIdx, num);
}

function stepVoltage(delta) {
  setPowerSupplyVoltage(powerSupplyVoltage + delta);
}

function onVoltageInputChange(val) {
  const num = parseFloat(val);
  if (isNaN(num)) return;
  setPowerSupplyVoltage(num);
}

function onVoltageSliderChange(val) {
  setPowerSupplyVoltage(val);
}

function setPresetVoltage(val) {
  setPowerSupplyVoltage(val);
}

function resetResistorValues() {
  resetAllResistorValues();
  setPowerSupplyVoltage(10.0);
}

function recordCurrentPair() {
  const savedSwitch = switchClosed;
  switchClosed = true;
  const phys = computeCircuitPhysics(selectedNodeP, selectedNodeQ);
  switchClosed = savedSwitch;
  if (!phys) return;

  const existingIdx = exp1RecordedRows.findIndex(
    (r) => r.pairLabel === phys.pairLabel
  );
  if (existingIdx >= 0) exp1RecordedRows[existingIdx] = phys;
  else exp1RecordedRows.push(phys);
  renderExp1Table();
}

function recordAllAdjacentPairs() {
  const pairs = [['a', 'b'], ['b', 'c'], ['c', 'd'], ['d', 'e'], ['e', 'f'], ['f', 'a']];
  const savedSwitch = switchClosed;
  switchClosed = true;
  exp1RecordedRows = pairs.map(([p, q]) => computeCircuitPhysics(p, q));
  switchClosed = savedSwitch;
  renderExp1Table();
}

function clearExp1Table() {
  exp1RecordedRows = [];
  renderExp1Table();
}

function renderExp1Table() {
  const tbody = document.getElementById('exp1-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const maxI = Math.max(0, ...exp1RecordedRows.map((r) => r.iVal));

  exp1RecordedRows.forEach((r) => {
    const tr = document.createElement('tr');
    if (maxI > 0 && Math.abs(r.iVal - maxI) < 1e-4) {
      tr.className = 'highlight-max';
    }
    tr.innerHTML = `
      <td><b>${r.pairLabel}</b></td>
      <td class="mono">${r.rDirect}</td>
      <td class="mono">${r.rIndirect}</td>
      <td class="mono">${r.reqFrac} (${r.reqVal.toFixed(2)})</td>
      <td class="mono">${r.iFrac} (${r.iVal.toFixed(3)})</td>
      <td class="mono">${r.vFrac} (${r.vVal.toFixed(3)})</td>
      <td class="mono">${r.iVal > 0 ? (r.vVal / r.iVal).toFixed(2) : '0.00'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function syncNodeSelectors() {
  document.querySelectorAll('#node-p-chips .node-chip').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-node') === selectedNodeP);
  });
  document.querySelectorAll('#node-q-chips .node-chip').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-node') === selectedNodeQ);
  });

  document.querySelectorAll('#left-exp1 .pair-btn').forEach((b) => {
    const p = b.getAttribute('data-pair');
    const match = (p === `${selectedNodeP}-${selectedNodeQ}` || p === `${selectedNodeQ}-${selectedNodeP}`);
    b.classList.toggle('active', match);
  });
}

function renderCircuitReduction(phys) {
  if (!phys) return;

  const pill = document.getElementById('reduction-pair-pill');
  if (pill) pill.textContent = `คู่จุดต่อ ${phys.nP} – ${phys.nQ}`;

  const redP = document.getElementById('red-p-name');
  if (redP) redP.textContent = phys.nP;
  const redQ = document.getElementById('red-q-name');
  if (redQ) redQ.textContent = phys.nQ;

  // 1. STEP 1: Two Parallel Branches SVG
  const svg1Container = document.getElementById('reduction-svg-step1');
  if (svg1Container) {
    svg1Container.innerHTML = generateStep1SVG(phys);
  }

  // Branch 1 & Branch 2 Math Breakdown
  const mathDetails = document.getElementById('reduction-branch-math');
  if (mathDetails) {
    const b1Formula = phys.branch1Resistors.map((r) => `${r.name}(${r.R}\\,\\Omega)`).join(' + ');
    const b2Formula = phys.branch2Resistors.map((r) => `${r.name}(${r.R}\\,\\Omega)`).join(' + ');
    mathDetails.innerHTML =
      `<div class="branch-math-row branch-math-top"><span class="badge-top">กิ่งบน (สาย 1):</span> $r_1 = ${b1Formula} = \\mathbf{${phys.r1}\\,\\Omega}$</div>` +
      `<div class="branch-math-row branch-math-bot"><span class="badge-bot">กิ่งล่าง (สาย 2):</span> $r_2 = ${b2Formula} = \\mathbf{${phys.r2}\\,\\Omega}$</div>`;
    if (typeof renderAcademicMath === 'function') {
      renderAcademicMath(mathDetails);
    }
  }

  // 2. STEP 2: Series Sum to Parallel Pair SVG
  const svg2Container = document.getElementById('reduction-svg-step2');
  if (svg2Container) {
    svg2Container.innerHTML = generateStep2SVG(phys);
  }

  // 3. STEP 3: Parallel Reduction SVG & Math
  const svg3Container = document.getElementById('reduction-svg-step3');
  if (svg3Container) {
    svg3Container.innerHTML = generateStep3SVG(phys);
  }
  const math3 = document.getElementById('reduction-step3-math');
  if (math3) {
    math3.innerHTML =
      `<div>สูตรความต้านทานขนาน: $\\frac{1}{R_{\\text{ชุด}}} = \\frac{1}{r_1} + \\frac{1}{r_2} = \\frac{1}{${phys.r1}} + \\frac{1}{${phys.r2}}$</div>` +
      `<div style="margin-top:4px;">$R_{\\text{ชุด}} = \\frac{r_1 \\times r_2}{r_1 + r_2} = \\frac{${phys.r1} \\times ${phys.r2}}{${phys.r1 + phys.r2}} = \\mathbf{${phys.reqLatex}\\,\\Omega} \\approx ${phys.reqVal.toFixed(3)}\\,\\Omega$</div>`;
    if (typeof renderAcademicMath === 'function') {
      renderAcademicMath(math3);
    }
  }

  // 4. STEP 4: Full Circuit SVG & Math
  const svg4Container = document.getElementById('reduction-svg-step4');
  if (svg4Container) {
    svg4Container.innerHTML = generateStep4SVG(phys);
  }
  const math4 = document.getElementById('reduction-step4-math');
  if (math4) {
    math4.innerHTML =
      `<div>$R_{\\text{รวม}} = R_{\\text{มาตรฐาน}} + R_{\\text{ชุด}} = 10 + ${phys.reqLatex} = \\mathbf{${phys.rTotLatex}\\,\\Omega} \\approx ${phys.rTotVal.toFixed(3)}\\,\\Omega$</div>` +
      `<div style="margin-top:4px; color:#38bdf8;">กระแสไฟฟ้ารวม (แอมมิเตอร์): $I = \\frac{V_s}{R_{\\text{รวม}}} = \\frac{${phys.powerSupplyVoltage.toFixed(1)}}{${phys.rTotLatex}} = \\mathbf{${phys.iLatex}\\text{ A}} \\approx ${phys.iVal.toFixed(3)}\\text{ A}$</div>` +
      `<div style="margin-top:4px; color:#fde047;">ความต่างศักย์คร่อม P–Q (โวลต์มิเตอร์): $V_{PQ} = I \\times R_{\\text{ชุด}} = \\mathbf{${phys.vLatex}\\text{ V}} \\approx ${phys.vVal.toFixed(3)}\\text{ V}$</div>`;
    if (typeof renderAcademicMath === 'function') {
      renderAcademicMath(math4);
    }
  }
}

function generateStep1SVG(phys) {
  const W = 460;
  const H = 140;
  const b1 = phys.branch1Resistors;
  const b2 = phys.branch2Resistors;

  let s = `<svg viewBox="0 0 ${W} ${H}" class="reduction-svg" xmlns="http://www.w3.org/2000/svg">`;
  const pX = 35, pY = 70;
  const qX = 425, qY = 70;
  const topY = 32, botY = 108;
  const splitLeftX = 70, splitRightX = 390;

  s += `<line x1="${pX}" y1="${pY}" x2="${splitLeftX}" y2="${pY}" stroke="#ef4444" stroke-width="2.5" />`;
  s += `<path d="M ${splitLeftX} ${pY} L ${splitLeftX + 20} ${topY} L ${splitRightX - 20} ${topY} L ${splitRightX} ${qY}" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" />`;
  s += `<path d="M ${splitLeftX} ${pY} L ${splitLeftX + 20} ${botY} L ${splitRightX - 20} ${botY} L ${splitRightX} ${qY}" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" />`;
  s += `<line x1="${splitRightX}" y1="${qY}" x2="${qX}" y2="${qY}" stroke="#0284c7" stroke-width="2.5" />`;

  // Draw Resistors on Top Branch (b1)
  const n1 = b1.length;
  const startX1 = splitLeftX + 20;
  const endX1 = splitRightX - 20;
  const stepX1 = (endX1 - startX1) / (n1 + 1);
  const rWidth = Math.min(46, Math.max(34, Math.floor(220 / n1))), rHeight = 20;

  b1.forEach((res, idx) => {
    const cx = startX1 + stepX1 * (idx + 1);
    const rx = cx - rWidth / 2;
    const ry = topY - rHeight / 2;
    s += `<rect x="${rx}" y="${ry}" width="${rWidth}" height="${rHeight}" rx="4" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>`;
    const colors = getResistorBandColors(res.R);
    colors.forEach((c, cIdx) => {
      s += `<rect x="${rx + 6 + cIdx * 7}" y="${ry}" width="4" height="${rHeight}" fill="${c}"/>`;
    });
    s += `<text x="${cx}" y="${ry - 5}" text-anchor="middle" fill="#fde047" font-size="11" font-weight="700" font-family="JetBrains Mono">${res.label} (${res.R}Ω)</text>`;
  });

  // Draw Resistors on Bottom Branch (b2)
  const n2 = b2.length;
  const startX2 = splitLeftX + 20;
  const endX2 = splitRightX - 20;
  const stepX2 = (endX2 - startX2) / (n2 + 1);

  b2.forEach((res, idx) => {
    const cx = startX2 + stepX2 * (idx + 1);
    const rx = cx - rWidth / 2;
    const ry = botY - rHeight / 2;
    s += `<rect x="${rx}" y="${ry}" width="${rWidth}" height="${rHeight}" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>`;
    const colors = getResistorBandColors(res.R);
    colors.forEach((c, cIdx) => {
      s += `<rect x="${rx + 6 + cIdx * 7}" y="${ry}" width="4" height="${rHeight}" fill="${c}"/>`;
    });
    s += `<text x="${cx}" y="${ry + rHeight + 13}" text-anchor="middle" fill="#7dd3fc" font-size="11" font-weight="700" font-family="JetBrains Mono">${res.label} (${res.R}Ω)</text>`;
  });

  // Terminal P
  s += `<circle cx="${pX}" cy="${pY}" r="7" fill="#ef4444" stroke="#ffffff" stroke-width="2" />`;
  s += `<text x="${pX}" y="${pY - 12}" text-anchor="middle" fill="#f87171" font-size="12" font-weight="800">P (${phys.nP})</text>`;

  // Terminal Q
  s += `<circle cx="${qX}" cy="${qY}" r="7" fill="#0284c7" stroke="#ffffff" stroke-width="2" />`;
  s += `<text x="${qX}" y="${qY - 12}" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="800">Q (${phys.nQ})</text>`;

  s += `</svg>`;
  return s;
}

function generateStep2SVG(phys) {
  const W = 460;
  const H = 96;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="reduction-svg" xmlns="http://www.w3.org/2000/svg">`;
  const pX = 35, pY = 48;
  const qX = 425, qY = 48;
  const topY = 24, botY = 72;
  const splitLeftX = 90, splitRightX = 370;

  s += `<line x1="${pX}" y1="${pY}" x2="${splitLeftX}" y2="${pY}" stroke="#ef4444" stroke-width="2.5" />`;
  s += `<path d="M ${splitLeftX} ${pY} L ${splitLeftX + 25} ${topY} L ${splitRightX - 25} ${topY} L ${splitRightX} ${qY}" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" />`;
  s += `<path d="M ${splitLeftX} ${pY} L ${splitLeftX + 25} ${botY} L ${splitRightX - 25} ${botY} L ${splitRightX} ${qY}" fill="none" stroke="#64748b" stroke-width="2.2" stroke-linecap="round" />`;
  s += `<line x1="${splitRightX}" y1="${qY}" x2="${qX}" y2="${qY}" stroke="#0284c7" stroke-width="2.5" />`;

  const midX = (splitLeftX + splitRightX) / 2;
  const rw = 126, rh = 24;

  // Top equivalent resistor r1
  s += `<rect x="${midX - rw/2}" y="${topY - rh/2}" width="${rw}" height="${rh}" rx="5" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>`;
  s += `<text x="${midX}" y="${topY + 5}" text-anchor="middle" fill="#fde047" font-size="12" font-weight="800" font-family="JetBrains Mono">r₁ = ${phys.r1} Ω</text>`;

  // Bottom equivalent resistor r2
  s += `<rect x="${midX - rw/2}" y="${botY - rh/2}" width="${rw}" height="${rh}" rx="5" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>`;
  s += `<text x="${midX}" y="${botY + 5}" text-anchor="middle" fill="#7dd3fc" font-size="12" font-weight="800" font-family="JetBrains Mono">r₂ = ${phys.r2} Ω</text>`;

  // Node P and Q
  s += `<circle cx="${pX}" cy="${pY}" r="7" fill="#ef4444" stroke="#ffffff" stroke-width="2" />`;
  s += `<text x="${pX}" y="${pY - 12}" text-anchor="middle" fill="#f87171" font-size="12" font-weight="800">P (${phys.nP})</text>`;
  s += `<circle cx="${qX}" cy="${qY}" r="7" fill="#0284c7" stroke="#ffffff" stroke-width="2" />`;
  s += `<text x="${qX}" y="${qY - 12}" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="800">Q (${phys.nQ})</text>`;

  s += `</svg>`;
  return s;
}

function generateStep3SVG(phys) {
  const W = 460;
  const H = 68;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="reduction-svg" xmlns="http://www.w3.org/2000/svg">`;
  const pX = 40, pY = 34;
  const qX = 420, qY = 34;
  const midX = 230;
  const rw = 196, rh = 30;

  s += `<line x1="${pX}" y1="${pY}" x2="${midX - rw/2}" y2="${pY}" stroke="#ef4444" stroke-width="3" />`;
  s += `<rect x="${midX - rw/2}" y="${pY - rh/2}" width="${rw}" height="${rh}" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="2.5"/>`;
  s += `<text x="${midX}" y="${pY + 5}" text-anchor="middle" fill="#4ade80" font-size="12.5" font-weight="800" font-family="JetBrains Mono">R_ชุด = ${phys.reqFrac} Ω (${phys.reqVal.toFixed(3)} Ω)</text>`;
  s += `<line x1="${midX + rw/2}" y1="${pY}" x2="${qX}" y2="${pY}" stroke="#0284c7" stroke-width="3" />`;

  s += `<circle cx="${pX}" cy="${pY}" r="7" fill="#ef4444" stroke="#ffffff" stroke-width="2" />`;
  s += `<text x="${pX}" y="${pY - 12}" text-anchor="middle" fill="#f87171" font-size="12" font-weight="800">P (${phys.nP})</text>`;
  s += `<circle cx="${qX}" cy="${qY}" r="7" fill="#0284c7" stroke="#ffffff" stroke-width="2" />`;
  s += `<text x="${qX}" y="${qY - 12}" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="800">Q (${phys.nQ})</text>`;

  s += `</svg>`;
  return s;
}

function generateStep4SVG(phys) {
  const W = 460;
  const H = 100;
  let s = `<svg viewBox="0 0 ${W} ${H}" class="reduction-svg" xmlns="http://www.w3.org/2000/svg">`;

  // Loop schematic
  s += `<path d="M 50 48 L 50 25 L 395 25 L 395 85 L 50 85 L 50 68" fill="none" stroke="#64748b" stroke-width="2.5" />`;

  // DC Power Supply (50, 58)
  s += `<rect x="22" y="38" width="56" height="30" rx="4" fill="#0f172a" stroke="#ef4444" stroke-width="2"/>`;
  s += `<text x="50" y="56" text-anchor="middle" fill="#f87171" font-size="11" font-weight="800" font-family="JetBrains Mono">${phys.powerSupplyVoltage.toFixed(1)}V</text>`;
  s += `<text x="50" y="32" text-anchor="middle" fill="#94a3b8" font-size="9">Vs แหล่งจ่าย</text>`;

  // Switch (115, 25)
  s += `<circle cx="102" cy="25" r="3.5" fill="#22c55e"/>`;
  s += `<circle cx="128" cy="25" r="3.5" fill="#22c55e"/>`;
  s += `<line x1="102" y1="25" x2="128" y2="25" stroke="#22c55e" stroke-width="2.5"/>`;
  s += `<text x="115" y="16" text-anchor="middle" fill="#86efac" font-size="9">สวิตช์ (ปิด)</text>`;

  // Ammeter A (175, 25)
  s += `<circle cx="175" cy="25" r="13" fill="#0f172a" stroke="#f59e0b" stroke-width="2"/>`;
  s += `<text x="175" y="29" text-anchor="middle" fill="#fbbf24" font-size="12" font-weight="900" font-family="JetBrains Mono">A</text>`;
  s += `<text x="175" y="48" text-anchor="middle" fill="#fbbf24" font-size="10" font-family="JetBrains Mono">${phys.iFrac}A</text>`;

  // Standard Resistor 10 Ω (255, 25)
  s += `<rect x="220" y="14" width="70" height="22" rx="4" fill="#1e293b" stroke="#cbd5e1" stroke-width="2"/>`;
  s += `<text x="255" y="29" text-anchor="middle" fill="#e2e8f0" font-size="11" font-weight="700" font-family="JetBrains Mono">10 Ω</text>`;
  s += `<text x="255" y="47" text-anchor="middle" fill="#94a3b8" font-size="9">R_มาตรฐาน</text>`;

  // Parallel Block R_ชุด on right side (395, 55)
  s += `<rect x="340" y="42" width="105" height="28" rx="5" fill="#0f172a" stroke="#10b981" stroke-width="2"/>`;
  s += `<text x="392" y="59" text-anchor="middle" fill="#34d399" font-size="10.5" font-weight="800" font-family="JetBrains Mono">R_ชุด=${phys.reqFrac}Ω</text>`;

  // Voltmeter V across R_ชุด
  s += `<path d="M 340 48 C 305 48 305 62 340 62" fill="none" stroke="#06b6d4" stroke-width="1.8" stroke-dasharray="3 2"/>`;
  s += `<circle cx="310" cy="55" r="10" fill="#0f172a" stroke="#06b6d4" stroke-width="1.8"/>`;
  s += `<text x="310" y="59" text-anchor="middle" fill="#67e8f9" font-size="10" font-weight="900">V</text>`;

  s += `</svg>`;
  return s;
}

// Global exposure
window.selectNodePair = selectNodePair;
window.setProbeNode = setProbeNode;
window.stepResistorValue = stepResistorValue;
window.onResistorSliderChange = onResistorSliderChange;
window.onResistorInputChange = onResistorInputChange;
window.stepVoltage = stepVoltage;
window.onVoltageInputChange = onVoltageInputChange;
window.onVoltageSliderChange = onVoltageSliderChange;
window.setPresetVoltage = setPresetVoltage;
window.resetResistorValues = resetResistorValues;
window.syncResistorAdjustUI = syncResistorAdjustUI;
window.renderCircuitReduction = renderCircuitReduction;

