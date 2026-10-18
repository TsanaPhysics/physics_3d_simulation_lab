/**
 * ui-exp2.js
 * Experiment 2 UI Controllers, Stopwatch, Data Table & Canvas Graph Plotter
 * RBRU Next Gen Lab 2026
 */

function updatePendulumLength(val) {
  pendLengthCm = Number(val);
  document.getElementById('slider-length').value = pendLengthCm;
  document.getElementById('ui-length-val').textContent = `${pendLengthCm.toFixed(1)} cm (${(pendLengthCm / 100).toFixed(2)} m)`;

  [50, 60, 70, 80, 90].forEach((len) => {
    const btn = document.getElementById(`len-btn-${len}`);
    if (btn) btn.classList.toggle('active', len === pendLengthCm);
  });

  updatePendulum3DGeometry();

  const len3D = (pendLengthCm / 100) * 6.0;
  rulerDynamicLabel.innerHTML = `◀ สเกล L = ${pendLengthCm.toFixed(1)} cm`;
  const rulerLabelItem = labelItems.find((it) => it.el === rulerDynamicLabel);
  if (rulerLabelItem) {
    rulerLabelItem.pos3D.set(-2.25, pivotY - len3D, pivotZ);
  }

  const st = getCurrentPendulumStats(pendLengthCm);
  document.getElementById('ui-period-val').textContent = `${st.T.toFixed(2)} s`;
  document.getElementById('ui-t2-val').textContent = `T² = ${st.T2.toFixed(2)} s²`;
  renderExp2TableAndGraph();
}

function updatePendulumAngle(val) {
  pendReleaseAngleDeg = Math.max(4, Math.min(15, Number(val)));
  document.getElementById('slider-angle').value = pendReleaseAngleDeg;
  document.getElementById('ui-angle-val').textContent = `${pendReleaseAngleDeg.toFixed(1)}°`;
}

function updatePendulumMode() {
  pendMode = document.getElementById('pendulum-data-mode').value;
  updatePendulumLength(pendLengthCm);
  fillAllPendulumData();
}

function startStopwatch20() {
  stopwatchRunning = true;
  stopwatchElapsed = 0;
  document.getElementById('btn-start-timer').textContent = '⏳ กำลังจับเวลา 20 รอบ (เร่งความเร็ว 5x)...';
}

function instantMeasure20() {
  stopwatchRunning = false;
  const st = getCurrentPendulumStats(pendLengthCm);
  document.getElementById('ui-timer-val').textContent = `${st.t20.toFixed(2)} s`;
  document.getElementById('ui-swing-count').textContent = `จำนวนรอบ: 20 / 20 (ครบ!)`;
  document.getElementById('btn-start-timer').textContent = '▶️ เริ่มจับเวลา 20 รอบ';

  const idx = exp2RecordedRows.findIndex((r) => r.L_cm === st.L_cm);
  if (idx >= 0) exp2RecordedRows[idx] = st;
  else exp2RecordedRows.push(st);
  exp2RecordedRows.sort((a, b) => a.L_cm - b.L_cm);

  renderExp2TableAndGraph();
}

function fillAllPendulumData() {
  exp2RecordedRows = [50, 60, 70, 80, 90].map((len) => getCurrentPendulumStats(len));
  const st = getCurrentPendulumStats(pendLengthCm);
  document.getElementById('ui-timer-val').textContent = `${st.t20.toFixed(2)} s`;
  document.getElementById('ui-swing-count').textContent = `จำนวนรอบ: 20 / 20`;
  renderExp2TableAndGraph();
}

function clearPendulumTable() {
  exp2RecordedRows = [];
  renderExp2TableAndGraph();
}

function renderExp2TableAndGraph() {
  const tbody = document.getElementById('exp2-tbody');
  tbody.innerHTML = '';
  exp2RecordedRows.forEach((r) => {
    const tr = document.createElement('tr');
    if (r.L_cm === pendLengthCm) tr.className = 'highlight-max';
    tr.innerHTML = `
      <td class="mono">${r.L_cm.toFixed(1)}</td>
      <td class="mono">${r.L_m.toFixed(2)}</td>
      <td class="mono">${r.t20.toFixed(2)}</td>
      <td class="mono">${r.T.toFixed(2)}</td>
      <td class="mono">${r.sqrtL.toFixed(2)}</td>
      <td class="mono"><b>${r.T2.toFixed(2)}</b></td>
    `;
    tbody.appendChild(tr);
  });
  drawPendulumGraph();
}

function drawPendulumGraph() {
  const canvas = document.getElementById('graph-canvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const padL = 48, padR = 20, padT = 18, padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxL = 1.0, maxT2 = 4.0;

  const toX = (L) => padL + (L / maxL) * plotW;
  const toY = (T2) => padT + plotH - (T2 / maxT2) * plotH;

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px monospace';

  for (let l = 0; l <= 1.0; l += 0.2) {
    const x = toX(l);
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillText(l.toFixed(1), x, H - 16);
  }

  for (let t2 = 0; t2 <= 4.0; t2 += 1.0) {
    const y = toY(t2);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.fillText(t2.toFixed(1), padL - 6, y + 4);
  }

  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.font = 'bold 11px Prompt, sans-serif';
  ctx.fillText('ความยาวเชือก L (m)', padL + plotW / 2, H - 3);
  ctx.save();
  ctx.translate(14, padT + plotH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('คาบกำลังสอง T² (s²)', 0, 0);
  ctx.restore();

  if (exp2RecordedRows.length >= 2) {
    const first = exp2RecordedRows[0];
    const last = exp2RecordedRows[exp2RecordedRows.length - 1];
    const slope = (last.T2 - first.T2) / (last.L_m - first.L_m);
    const intercept = first.T2 - slope * first.L_m;
    const gCalc = (4 * Math.PI * Math.PI) / slope;

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(intercept));
    ctx.lineTo(toX(0.95), toY(slope * 0.95 + intercept));
    ctx.stroke();
    ctx.setLineDash([]);

    const statsEl = document.getElementById('ui-graph-stats');
    if (statsEl) {
      statsEl.innerHTML =
        `<div><b>สมการเส้นตรง:</b> $T^2 = \\left(\\frac{4\\pi^2}{g}\\right) L$</div>` +
        `<div style="margin-top:4px;"><b>ความชัน $(m)$:</b> $m = \\frac{\\Delta T^2}{\\Delta L} = \\frac{${last.T2.toFixed(2)} - ${first.T2.toFixed(2)}}{${last.L_m.toFixed(2)} - ${first.L_m.toFixed(2)}} = \\mathbf{${slope.toFixed(3)}\\text{ s}^2/\\text{m}}$</div>` +
        `<div style="margin-top:4px;"><b>ความเร่งโน้มถ่วง $(g)$:</b> $g = \\frac{4\\pi^2}{m} = \\mathbf{${gCalc.toFixed(2)}\\text{ m/s}^2}$ ` +
        (pendMode === 'exam' ? `$\\left(\\text{แม่นตรง: } \\mathbf{\\frac{160\\pi^2}{167}\\text{ m/s}^2}\\right)$` : '') +
        `</div>`;
      if (typeof renderAcademicMath === 'function') {
        renderAcademicMath(statsEl);
      }
    }
  }

  exp2RecordedRows.forEach((r) => {
    const x = toX(r.L_m);
    const y = toY(r.T2);
    ctx.fillStyle = r.L_cm === pendLengthCm ? '#f59e0b' : '#38bdf8';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}
