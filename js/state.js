/**
 * state.js
 * Global State, Constants & Theoretical Physics Models
 * RBRU Next Gen Lab 2026
 */

// Global Application Mode & Meter Settings
let currentExperiment = 1; // 1 = Resistor Circuit, 2 = Simple Pendulum
let meterDisplayMode = 'analog'; // 'analog' (แบบเข็ม) or 'digital' (แบบตัวเลข)

// Damped Needle Physics State for Realistic Moving-Coil Analog Meters
let targetAmmeterVal = 0.913;
let currentAmmeterNeedle = 0.0;
let ammeterNeedleVel = 0.0;

let targetVoltmeterVal = 0.870;
let currentVoltmeterNeedle = 0.0;
let voltmeterNeedleVel = 0.0;

// =========================================================================
// Experiment 1: Hexagonal Resistor Circuit State & Constants
// =========================================================================
const nodesOrder = ['a', 'b', 'c', 'd', 'e', 'f'];

const edgeResistors = [
  { n1: 'a', n2: 'b', R: 2, colors: ['#ef4444', '#000000', '#d97706', '#fbbf24'] },
  { n1: 'b', n2: 'c', R: 3, colors: ['#f97316', '#000000', '#d97706', '#fbbf24'] },
  { n1: 'c', n2: 'd', R: 4, colors: ['#eab308', '#000000', '#d97706', '#fbbf24'] },
  { n1: 'd', n2: 'e', R: 5, colors: ['#22c55e', '#000000', '#d97706', '#fbbf24'] },
  { n1: 'e', n2: 'f', R: 6, colors: ['#3b82f6', '#000000', '#d97706', '#fbbf24'] },
  { n1: 'f', n2: 'a', R: 1, colors: ['#92400e', '#000000', '#d97706', '#fbbf24'] }
];

let selectedNodeP = 'f';
let selectedNodeQ = 'a';
let nextClickTarget = 'P';
let switchClosed = true;
let exp1RecordedRows = [];
let currentPhysState = null;

// =========================================================================
// Experiment 2: Simple Pendulum State & Exam Benchmarks
// =========================================================================
const examPendulumData = {
  50: { L_cm: 50.0, L_m: 0.50, T: 1.40, sqrtL: 7.07, T2: 1.97 },
  60: { L_cm: 60.0, L_m: 0.60, T: 1.55, sqrtL: 7.75, T2: 2.40 },
  70: { L_cm: 70.0, L_m: 0.70, T: 1.68, sqrtL: 8.37, T2: 2.81 },
  80: { L_cm: 80.0, L_m: 0.80, T: 1.76, sqrtL: 8.94, T2: 3.11 },
  90: { L_cm: 90.0, L_m: 0.90, T: 1.91, sqrtL: 9.49, T2: 3.64 }
};

let pendLengthCm = 50;
let pendReleaseAngleDeg = 8;
let pendMode = 'exam';
let pendTime = 0;
let stopwatchRunning = false;
let stopwatchElapsed = 0;
let handHoldingPendulum = false;
let exp2RecordedRows = [];

// =========================================================================
// Mathematical & Physics Calculations
// =========================================================================
function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    let t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function formatFraction(num, den) {
  const g = gcd(num, den);
  const n = Math.round(num / g);
  const d = Math.round(den / g);
  return d === 1 ? `${n}` : `${n}/${d}`;
}

function formatLatexFrac(num, den) {
  const g = gcd(num, den);
  const n = Math.round(num / g);
  const d = Math.round(den / g);
  return d === 1 ? `${n}` : `\\frac{${n}}{${d}}`;
}

const DEFAULT_EDGE_RESISTANCES = [2, 3, 4, 5, 6, 1];
let powerSupplyVoltage = 10.0; // Lab DC Power Supply HY-3005D voltage (0.0 - 30.0 V, default 10.0 V)

function getResistorBandColors(r) {
  const R = Math.max(1, Math.min(999, Math.round(r)));
  const colorMap = [
    '#000000', // 0 Black
    '#92400e', // 1 Brown
    '#ef4444', // 2 Red
    '#f97316', // 3 Orange
    '#eab308', // 4 Yellow
    '#22c55e', // 5 Green
    '#3b82f6', // 6 Blue
    '#a855f7', // 7 Violet
    '#64748b', // 8 Gray
    '#f8fafc'  // 9 White
  ];
  const gold = '#fbbf24';

  if (R < 10) {
    return [colorMap[R], colorMap[0], '#d97706', gold];
  } else if (R < 100) {
    const d1 = Math.floor(R / 10);
    const d2 = R % 10;
    return [colorMap[d1], colorMap[d2], colorMap[0], gold];
  } else {
    const d1 = Math.floor(R / 100);
    const d2 = Math.floor((R % 100) / 10);
    return [colorMap[d1], colorMap[d2], colorMap[1], gold];
  }
}

function setResistorValue(edgeIdx, newVal) {
  let val = Math.round(Number(newVal));
  if (isNaN(val) || val < 1) val = 1;
  if (val > 100) val = 100;
  if (!edgeResistors[edgeIdx]) return;
  edgeResistors[edgeIdx].R = val;
  edgeResistors[edgeIdx].colors = getResistorBandColors(val);

  if (typeof updateResistor3DVisuals === 'function') {
    updateResistor3DVisuals(edgeIdx);
  }
  if (typeof refreshExp1UI === 'function') {
    refreshExp1UI();
  }
}

function setPowerSupplyVoltage(newVal) {
  let v = Number(newVal);
  if (isNaN(v)) return;
  v = Math.max(0, Math.min(30, Math.round(v * 10) / 10)); // 0.0 to 30.0 V with 0.1 precision
  powerSupplyVoltage = v;

  if (typeof updatePowerSupply3DLabel === 'function') {
    updatePowerSupply3DLabel(powerSupplyVoltage);
  }
  if (typeof refreshExp1UI === 'function') {
    refreshExp1UI();
  }
}

function resetAllResistorValues() {
  DEFAULT_EDGE_RESISTANCES.forEach((val, idx) => {
    edgeResistors[idx].R = val;
    edgeResistors[idx].colors = getResistorBandColors(val);
    if (typeof updateResistor3DVisuals === 'function') {
      updateResistor3DVisuals(idx);
    }
  });
  powerSupplyVoltage = 10.0;
  if (typeof updatePowerSupply3DLabel === 'function') {
    updatePowerSupply3DLabel(10.0);
  }
  if (typeof refreshExp1UI === 'function') {
    refreshExp1UI();
  }
}

function computeCircuitPhysics(nP, nQ) {
  const idxP = nodesOrder.indexOf(nP);
  const idxQ = nodesOrder.indexOf(nQ);
  if (idxP === -1 || idxQ === -1 || idxP === idxQ) return null;

  let r1 = 0;
  let cur = idxP;
  const path1Edges = [];
  while (cur !== idxQ) {
    r1 += edgeResistors[cur].R;
    path1Edges.push(cur);
    cur = (cur + 1) % 6;
  }

  const path2Edges = [];
  cur = idxQ;
  while (cur !== idxP) {
    path2Edges.push(cur);
    cur = (cur + 1) % 6;
  }

  const branch1Resistors = path1Edges.map((i) => ({
    edgeIdx: i,
    name: `R_{${edgeResistors[i].n1}${edgeResistors[i].n2}}`,
    label: `R_${edgeResistors[i].n1}${edgeResistors[i].n2}`,
    R: edgeResistors[i].R
  }));

  const branch2Resistors = path2Edges.map((i) => ({
    edgeIdx: i,
    name: `R_{${edgeResistors[i].n1}${edgeResistors[i].n2}}`,
    label: `R_${edgeResistors[i].n1}${edgeResistors[i].n2}`,
    R: edgeResistors[i].R
  }));

  const totalLoopR = edgeResistors.reduce((sum, e) => sum + e.R, 0);
  const r2 = totalLoopR - r1;
  const rDirect = Math.min(r1, r2);
  const rIndirect = Math.max(r1, r2);

  const reqNum = rDirect * rIndirect;
  const reqDen = totalLoopR;
  const reqVal = reqNum / reqDen;

  // Standard series resistor is 10 Ω
  const rTotNum = 10 * reqDen + reqNum;
  const rTotDen = reqDen;
  const rTotVal = rTotNum / rTotDen;

  // Exact rational arithmetic with power supply voltage
  let vsNum = Math.round(powerSupplyVoltage * 10);
  let vsDen = 10;
  const gVs = gcd(vsNum, vsDen);
  vsNum /= gVs;
  vsDen /= gVs;

  const iNum = vsNum * reqDen;
  const iDen = vsDen * rTotNum;
  const iVal = switchClosed ? (iNum / iDen) : 0;

  const vNum = vsNum * reqNum;
  const vDen = vsDen * rTotNum;
  const vVal = switchClosed ? (vNum / vDen) : 0;

  return {
    nP,
    nQ,
    pairLabel: `${nP}-${nQ}`,
    rDirect,
    rIndirect,
    totalLoopR,
    reqVal,
    reqFrac: formatFraction(reqNum, reqDen),
    reqLatex: formatLatexFrac(reqNum, reqDen),
    rTotVal,
    rTotFrac: formatFraction(rTotNum, rTotDen),
    rTotLatex: formatLatexFrac(rTotNum, rTotDen),
    iVal,
    iFrac: switchClosed ? formatFraction(iNum, iDen) : '0',
    iLatex: switchClosed ? formatLatexFrac(iNum, iDen) : '0',
    vVal,
    vFrac: switchClosed ? formatFraction(vNum, vDen) : '0',
    vLatex: switchClosed ? formatLatexFrac(vNum, vDen) : '0',
    r1,
    r2,
    path1Edges,
    path2Edges,
    branch1Resistors,
    branch2Resistors,
    powerSupplyVoltage
  };
}

function getCurrentPendulumStats(lenCm) {
  const L_m = lenCm / 100;
  if (pendMode === 'exam' && examPendulumData[lenCm]) {
    const d = examPendulumData[lenCm];
    return { L_cm: d.L_cm, L_m: d.L_m, t20: d.T * 20, T: d.T, sqrtL: d.sqrtL, T2: d.T2 };
  } else {
    const g = 9.80;
    const T = 2 * Math.PI * Math.sqrt(L_m / g);
    return {
      L_cm: lenCm,
      L_m: L_m,
      t20: T * 20,
      T: Number(T.toFixed(2)),
      sqrtL: Number(Math.sqrt(lenCm).toFixed(2)),
      T2: Number((T * T).toFixed(2))
    };
  }
}

window.powerSupplyVoltage = powerSupplyVoltage;
window.setPowerSupplyVoltage = setPowerSupplyVoltage;
window.setResistorValue = setResistorValue;
window.resetAllResistorValues = resetAllResistorValues;
