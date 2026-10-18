/**
 * ar-mediapipe.js
 * AR MediaPipe Hand Tracking Engine, Gestures, Pinch Detection & Virtual Hand Cursor
 * With Touchless 3D Equipment Drag & Reposition Support
 * RBRU Next Gen Lab 2026
 */

let arEnabled = false;
let arPassthrough = false;
let mpHands = null;
let videoStream = null;
let isProcessingVideo = false;
let simulatedHandActive = false;
let simTime = 0;

let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let prevHandX = null;
let prevHandY = null;
let wasPinching = false;
let peaceSignCooldown = 0;

// AR Equipment Drag State
let activeArDragInstrument = null;
const arDragOffset = new THREE.Vector3();
const arPlaneIntersect = new THREE.Vector3();
const handRay = new THREE.Vector2();

const handCursorEl = document.getElementById('hand-cursor');
const handCursorLabelEl = document.getElementById('hand-cursor-label');
const arInputVideo = document.getElementById('ar-input-video');
const arBgVideo = document.getElementById('ar-bg-video');
const arOverlayCanvas = document.getElementById('ar-overlay-canvas');
const arOverlayCtx = arOverlayCanvas.getContext('2d');

async function toggleARHandControl() {
  const btn = document.getElementById('btn-toggle-ar');
  const hud = document.getElementById('ar-hud-panel');

  if (!arEnabled) {
    arEnabled = true;
    btn.classList.add('active');
    btn.innerHTML = '🛑 ปิดควบคุมด้วยมือ AR';
    hud.classList.add('open');
    handCursorEl.style.display = 'block';
    await initMediaPipeHands();
  } else {
    arEnabled = false;
    simulatedHandActive = false;
    activeArDragInstrument = null;
    btn.classList.remove('active');
    btn.innerHTML = '🖐️ เปิดควบคุมด้วยมือ AR (MediaPipe)';
    hud.classList.remove('open');
    handCursorEl.style.display = 'none';
    if (arPassthrough) toggleARPassthrough();
    if (videoStream) {
      videoStream.getTracks().forEach((t) => t.stop());
      videoStream = null;
    }
  }
}

function toggleARPassthrough() {
  arPassthrough = !arPassthrough;
  const btn = document.getElementById('btn-ar-bg');
  if (arPassthrough) {
    arBgVideo.classList.add('active');
    scene.background = null;
    scene.fog = null;
    tableMat.opacity = 0.65;
    btn.textContent = '🌐 พื้นหลังกล้อง AR: เปิดอยู่';
  } else {
    arBgVideo.classList.remove('active');
    scene.background = new THREE.Color(0x0b1120);
    scene.fog = new THREE.FogExp2(0x0b1120, 0.016);
    tableMat.opacity = 1.0;
    btn.textContent = '🌐 พื้นหลังกล้อง AR: ปิด';
  }
}

async function initMediaPipeHands() {
  const statusEl = document.getElementById('ar-cam-status');
  try {
    if (!mpHands) {
      statusEl.textContent = 'กำลังโหลดโมเดล MediaPipe Hands...';
      mpHands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      mpHands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.65,
        minTrackingConfidence: 0.65
      });
      mpHands.onResults(onMediaPipeHandResults);
    }

    statusEl.textContent = 'กำลังขอสิทธิ์เปิดกล้องเว็บแคม...';
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' }
    });
    arInputVideo.srcObject = videoStream;
    arBgVideo.srcObject = videoStream;
    await arInputVideo.play();
    await arBgVideo.play();
    statusEl.textContent = '🟢 กล้อง AR พร้อมใช้งาน';
    requestAnimationFrame(processVideoFrameLoop);
  } catch (err) {
    console.warn('Webcam unavailable or permission denied, activating Simulated Hand Demo:', err);
    statusEl.textContent = '⚠️ ไม่พบกล้อง — เปิดโหมดมือจำลอง';
    simulatedHandActive = true;
  }
}

async function processVideoFrameLoop() {
  if (!arEnabled || !videoStream) return;
  if (arInputVideo.readyState >= 2 && !isProcessingVideo) {
    isProcessingVideo = true;
    try {
      await mpHands.send({ image: arInputVideo });
    } catch (e) {
      console.warn(e);
    }
    isProcessingVideo = false;
  }
  requestAnimationFrame(processVideoFrameLoop);
}

function toggleSimulatedHandDemo() {
  simulatedHandActive = !simulatedHandActive;
  const btn = document.getElementById('btn-sim-hand');
  const statusEl = document.getElementById('ar-cam-status');
  if (simulatedHandActive) {
    btn.textContent = '⏹️ หยุดทดสอบมือเสมือนอัตโนมัติ';
    statusEl.textContent = '🤖 โหมดจำลองมือเสมือนทำงานอยู่';
    handCursorEl.style.display = 'block';
  } else {
    btn.textContent = '🤖 ทดสอบมือเสมือนอัตโนมัติ (กรณีไม่มีกล้อง)';
    statusEl.textContent = videoStream ? '🟢 กล้อง AR พร้อมใช้งาน' : 'พร้อมใช้งาน';
  }
}

function onMediaPipeHandResults(results) {
  if (simulatedHandActive) return;

  arOverlayCtx.save();
  arOverlayCtx.clearRect(0, 0, arOverlayCanvas.width, arOverlayCanvas.height);
  if (results.image) {
    arOverlayCtx.drawImage(results.image, 0, 0, arOverlayCanvas.width, arOverlayCanvas.height);
  }

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm = results.multiHandLandmarks[0];
    if (window.drawConnectors && window.HAND_CONNECTIONS) {
      drawConnectors(arOverlayCtx, lm, HAND_CONNECTIONS, { color: '#06b6d4', lineWidth: 3 });
      drawLandmarks(arOverlayCtx, lm, { color: '#f59e0b', lineWidth: 1, radius: 3 });
    }
    interpretHandLandmarks(lm);
  } else {
    document.getElementById('ar-gesture-text').textContent = '🖐️ ยกมือขึ้นหน้ากล้องเพื่อควบคุม...';
    prevHandX = null;
    prevHandY = null;
  }
  arOverlayCtx.restore();
}

function interpretHandLandmarks(lm) {
  const indexTip = lm[8];
  const thumbTip = lm[4];
  const middleTip = lm[12];
  const ringTip = lm[16];
  const pinkyTip = lm[20];
  const wrist = lm[0];

  const targetX = (1 - indexTip.x) * window.innerWidth;
  const targetY = indexTip.y * window.innerHeight;

  cursorX = cursorX * 0.65 + targetX * 0.35;
  cursorY = cursorY * 0.65 + targetY * 0.35;

  handCursorEl.style.left = `${cursorX}px`;
  handCursorEl.style.top = `${cursorY}px`;

  const pinchDist = Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y);
  const indexExt = Math.hypot(indexTip.x - wrist.x, indexTip.y - wrist.y);
  const middleExt = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y);
  const ringExt = Math.hypot(ringTip.x - wrist.x, ringTip.y - wrist.y);
  const pinkyExt = Math.hypot(pinkyTip.x - wrist.x, pinkyTip.y - wrist.y);

  const isPinching = pinchDist < 0.058;
  const isFist = (indexExt < 0.23 && middleExt < 0.23 && ringExt < 0.23 && pinkyExt < 0.23);
  const isPeaceSign = (indexExt > 0.30 && middleExt > 0.30 && ringExt < 0.24 && pinkyExt < 0.24 && !isPinching);

  const gestureBadge = document.getElementById('ar-gesture-text');
  Object.values(nodeLabelElements).forEach((el) => el.classList.remove('hand-hover'));

  // 1. FIST ORBIT GESTURE
  if (isFist) {
    activeArDragInstrument = null;
    handCursorEl.className = 'orbiting';
    handCursorLabelEl.textContent = '✊ หมุนมุมกล้อง 3D';
    gestureBadge.textContent = '✊ กำมือลาก: หมุนมุมมองกล้อง 3D';

    if (prevHandX !== null && prevHandY !== null) {
      const dx = (cursorX - prevHandX) * 0.008;
      const dy = (cursorY - prevHandY) * 0.006;
      const offset = camera.position.clone().sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta -= dx;
      spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, spherical.phi - dy));
      offset.setFromSpherical(spherical);
      camera.position.copy(controls.target).add(offset);
      controls.update();
    }
    prevHandX = cursorX;
    prevHandY = cursorY;
    wasPinching = false;
    return;
  }

  prevHandX = cursorX;
  prevHandY = cursorY;

  // 2. PEACE SIGN GESTURE
  if (isPeaceSign && performance.now() > peaceSignCooldown) {
    activeArDragInstrument = null;
    peaceSignCooldown = performance.now() + 1400;
    handCursorLabelEl.textContent = '✌️ สั่งงานด่วน!';
    if (currentExperiment === 1) {
      toggleCircuitSwitch();
      gestureBadge.textContent = '✌️ ชู 2 นิ้ว: สลับสวิตช์วงจรไฟฟ้า!';
    } else {
      startStopwatch20();
      gestureBadge.textContent = '✌️ ชู 2 นิ้ว: เริ่มจับเวลา 20 รอบ!';
    }
    return;
  }

  // 3. PINCH GESTURE: DRAG EQUIPMENT OR SELECT NODES
  if (isPinching) {
    handCursorEl.className = 'pinching';

    if (currentExperiment === 2) {
      // Experiment 2: Pull pendulum
      handHoldingPendulum = true;
      const normX = (cursorX / window.innerWidth) - 0.5;
      const newAngle = Math.max(4, Math.min(15, Math.round(Math.abs(normX) * 32)));
      updatePendulumAngle(newAngle);

      const normY = cursorY / window.innerHeight;
      const snappedLen = Math.min(90, Math.max(50, Math.round(((normY * 60) + 35) / 10) * 10));
      if (snappedLen !== pendLengthCm) updatePendulumLength(snappedLen);
      handCursorLabelEl.textContent = '🤏 ดึงปรับมุมปล่อยลูกตุ้ม';
      gestureBadge.textContent = '🤏 ดึงลูกตุ้มเพื่อปรับมุมและความยาว';
    } else {
      // Experiment 1: Move Draggable Lab Equipment or Click Nodes
      if (activeArDragInstrument) {
        handRay.x = (cursorX / window.innerWidth) * 2 - 1;
        handRay.y = -(cursorY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(handRay, camera);

        if (raycaster.ray.intersectPlane(dragPlane, arPlaneIntersect)) {
          const targetX = arPlaneIntersect.x + arDragOffset.x;
          const targetZ = arPlaneIntersect.z + arDragOffset.z;

          const clampedX = Math.max(-7.6, Math.min(7.6, targetX));
          const clampedZ = Math.max(-5.0, Math.min(4.8, targetZ));

          activeArDragInstrument.position.x = clampedX;
          activeArDragInstrument.position.z = clampedZ;

          updateCircuitWires();
          updateFloatingLabelPositions();
        }

        const instName = activeArDragInstrument.userData.instrumentName || 'อุปกรณ์';
        handCursorLabelEl.textContent = `🤏 กำลังย้าย ${instName}`;
        gestureBadge.textContent = `🤏 จีบนิ้ว: กำลังเลื่อน ${instName} ไปตามตำแหน่งมือ`;
      } else if (!wasPinching) {
        // Pinch began: Check if pinching over a hexagonal node a–f first
        const nearestNode = findNearestNodeOnScreen(cursorX, cursorY, 48);
        if (nearestNode) {
          handle3DNodeClick(nearestNode);
          handCursorLabelEl.textContent = `⚡ เชื่อมต่อขั้ว ${nearestNode}`;
          gestureBadge.textContent = `⚡ ต่อหัววัดไปยังขั้ว ${nearestNode}`;
        } else {
          // Check if pinching over a draggable instrument
          handRay.x = (cursorX / window.innerWidth) * 2 - 1;
          handRay.y = -(cursorY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(handRay, camera);

          const allMeshes = [];
          draggableInstruments.forEach((inst) => {
            inst.group.traverse((c) => {
              if (c.isMesh) allMeshes.push(c);
            });
          });

          const intersects = raycaster.intersectObjects(allMeshes, false);
          if (intersects.length > 0 && intersects[0].object.userData.draggableRoot) {
            activeArDragInstrument = intersects[0].object.userData.draggableRoot;
            if (raycaster.ray.intersectPlane(dragPlane, arPlaneIntersect)) {
              arDragOffset.subVectors(activeArDragInstrument.position, arPlaneIntersect);
              arDragOffset.y = 0;
            }
            const instName = activeArDragInstrument.userData.instrumentName || 'อุปกรณ์';
            handCursorLabelEl.textContent = `🤏 จับ ${instName}`;
            gestureBadge.textContent = `🤏 จีบนิ้ว: จับ ${instName} เพื่อเลื่อนตำแหน่ง`;
          } else {
            triggerHandClickAt(cursorX, cursorY);
          }
        }
      }
    }
    wasPinching = true;
  } else {
    // 4. POINTING / HOVERING
    handCursorEl.className = '';
    handCursorLabelEl.textContent = '👆 ชี้ตำแหน่ง';
    gestureBadge.textContent = '👆 ชี้นิ้วชี้: เลื่อนเคอร์เซอร์ / ชี้อุปกรณ์เพื่อย้าย';

    if (wasPinching) {
      if (handHoldingPendulum && currentExperiment === 2) {
        handHoldingPendulum = false;
        pendTime = 0;
        startStopwatch20();
        gestureBadge.textContent = '🚀 ปล่อยลูกตุ้มแกว่ง & เริ่มจับเวลา!';
      }
      if (activeArDragInstrument) {
        const instName = activeArDragInstrument.userData.instrumentName || 'อุปกรณ์';
        gestureBadge.textContent = `🚀 วาง ${instName} เข้าที่เรียบร้อย`;
        activeArDragInstrument = null;
      }
    }
    wasPinching = false;

    if (currentExperiment === 1) {
      // Hover detection on hexagonal pins
      const nearestNode = findNearestNodeOnScreen(cursorX, cursorY, 48);
      if (nearestNode && nodeLabelElements[nearestNode]) {
        nodeLabelElements[nearestNode].classList.add('hand-hover');
        handCursorLabelEl.textContent = `👆 จีบนิ้วเพื่อคีบขั้ว ${nearestNode}`;
      } else {
        // Hover detection on draggable equipment
        handRay.x = (cursorX / window.innerWidth) * 2 - 1;
        handRay.y = -(cursorY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(handRay, camera);

        const allMeshes = [];
        draggableInstruments.forEach((inst) => {
          inst.group.traverse((c) => {
            if (c.isMesh) allMeshes.push(c);
          });
        });

        const intersects = raycaster.intersectObjects(allMeshes, false);
        if (intersects.length > 0 && intersects[0].object.userData.draggableRoot) {
          const hitName = intersects[0].object.userData.instrumentName || 'อุปกรณ์';
          handCursorLabelEl.textContent = `👆 จีบนิ้วเพื่อย้าย ${hitName}`;
          gestureBadge.textContent = `👆 ชี้ไปที่: ${hitName} (จีบนิ้วเพื่อเลื่อนตำแหน่ง)`;
        }
      }
    }
  }
}

function findNearestNodeOnScreen(x, y, maxDistPx) {
  let bestNode = null;
  let bestDist = maxDistPx;
  nodesOrder.forEach((n) => {
    const v = nodePositions[n].clone().project(camera);
    const sx = (v.x * 0.5 + 0.5) * window.innerWidth;
    const sy = (-(v.y * 0.5) + 0.5) * window.innerHeight;
    const dist = Math.hypot(x - sx, y - sy);
    if (dist < bestDist) {
      bestDist = dist;
      bestNode = n;
    }
  });
  return bestNode;
}

function triggerHandClickAt(x, y) {
  if (currentExperiment === 1) {
    const hitNode = findNearestNodeOnScreen(x, y, 52);
    if (hitNode) {
      handle3DNodeClick(hitNode);
      return;
    }
  }
  const el = document.elementFromPoint(x, y);
  if (el && (el.tagName === 'BUTTON' || el.classList.contains('label-3d'))) {
    el.click();
  }
}
