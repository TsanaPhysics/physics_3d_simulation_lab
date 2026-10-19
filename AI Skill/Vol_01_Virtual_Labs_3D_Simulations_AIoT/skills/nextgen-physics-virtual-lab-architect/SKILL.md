---
name: nextgen-physics-virtual-lab-architect
description: >-
  สถาปัตยกรรมและมาตรฐานการพัฒนาห้องปฏิบัติการฟิสิกส์ 3 มิติเสมือนจริงและเทคโนโลยีตรวจจับมือไร้สัมผัส (NextGen 3D & AR MediaPipe Virtual Physics Lab Masterclass)
  ครอบคลุมการจำลองวงจรไฟฟ้าความแม่นยำสูง (Hexagonal Resistor Network & IJSO Olympiad Standard), เอนจินลดรูปวงจรทีละขั้นตอนแบบเวกเตอร์ SVG (Step-by-Step Circuit Reduction Engine),
  การคำนวณเศษส่วนแท้ด้วย Euclidean GCD, ระบบลากย้ายอุปกรณ์ 3D แบบอิสระ (Dynamic Draggable Equipment) ทั้งเมาส์และการจีบนิ้ว MediaPipe Pinch,
  ฟิสิกส์สปริงหน้าปัดเข็มอนาล็อก/ดิจิทัล, ตัวต้านทาน 4 แถบสีพลวัต, แหล่งจ่ายไฟ DC 7-Segment, เพนดูลัมฮาร์มอนิกอย่างง่าย และแผงควบคุม Glassmorphism ย่อขยายได้อิสระ
---

# RBRU NextGen Virtual Lab & Circuit Physics Simulation Architect

กรอบมาตรฐานสถาปัตยกรรมวิศวกรรมซอฟต์แวร์และการออกแบบห้องปฏิบัติการวิทยาศาสตร์เสมือนจริง 3 มิติ (3D Interactive Virtual Laboratory & Touchless AR MediaPipe Engine) สังเคราะห์จากระบบ **RBRU Next Gen Lab 2026** มหาวิทยาลัยราชภัฏรำไพพรรณี ภายใต้การอำนวยการของ **ผศ.ดร.ชีวะ ทัศนา** ศูนย์ LEQs มหาวิทยาลัยราชภัฏรำไพพรรณี ครอบคลุมการจำลองการทดลองฟิสิกส์ระดับโอลิมปิกวิชาการ (IJSO Physics Olympiad), การลดรูปวงจรไฟฟ้ากระแสตรงแบบเวกเตอร์ SVG ละเอียดทุกขั้นตอน, การคำนวณเศษส่วนแท้ไร้การปัดเศษ, การควบคุมวัตถุ 3 มิติด้วยมือเปล่าผ่านกล้องเว็บแคม, และระบบหน้าปัดมาตรวัดฟิสิกส์สมจริง

---

## 1. บริบทวิชาการและทฤษฎีวงจรหกเหลี่ยม (Academic Context & IJSO Olympiad Standard)

### 1.1 ที่มาของโจทย์การทดลอง
ระบบจำลองวงจรไฟฟ้าหกเหลี่ยมนี้อิงข้อสอบคัดเลือกผู้แทนประเทศไทยไปแข่งขันวิทยาศาสตร์โอลิมปิกระหว่างประเทศ ระดับมัธยมศึกษาตอนต้น ครั้งที่ 20 (20th IJSO: International Junior Science Olympiad Round 3)
* **โครงสร้างวงจร:** ตัวต้านทาน 6 ตัว ต่อเรียงกันเป็นวงปิดรูปหกเหลี่ยมด้านเท่า มีจุดต่อ (Nodes) กำกับด้วยตัวอักษร $a, b, c, d, e, f$
* **ค่าความต้านทานตั้งต้น:** $R_{ab}=1\,\Omega, R_{bc}=2\,\Omega, R_{cd}=3\,\Omega, R_{de}=4\,\Omega, R_{ef}=5\,\Omega, R_{fa}=6\,\Omega$ รวมทั้งวง $\sum R = 21\,\Omega$
* **อุปกรณ์ในวงจรหลัก:**
  - แหล่งจ่ายไฟ DC ปรับค่าได้ $V_s$ (ค่ามาตรฐาน $10.0\text{ V}$, ปรับได้ $0 - 30\text{ V}$)
  - สวิตช์ใบมีด (Knife Switch) ควบคุมการเปิด-ปิดวงจร
  - ตัวต้านทานมาตรฐานคงที่ $R_{\text{มาตรฐาน}} = 10.0\,\Omega$ ต่ออนุกรมในวงจรหลัก
  - แอมมิเตอร์วัดกระแสรวมของวงจร $I$
  - โวลต์มิเตอร์วัดความต่างศักย์ตกคร่อมคู่จุดต่อที่เลือก $V_{PQ}$

```
       [ + ] ──── (Ammeter) ──── [Knife Switch] ──── [ R_standard = 10 Ω ] ──── (Probe P)
    Power Supply                                                                    │
      (0-30V)                                                                  [Hex Loop]
       [ - ] ────────────────────────────────────────────────────────────────── (Probe Q)
```

### 1.2 ทฤษฎีการคลี่วงจรและการลดรูป (Circuit Unfolding & Reduction Theory)
เมื่อต่อสายโพรบ $P$ และ $Q$ เข้ากับจุดต่อใดๆ วงแหวนหกเหลี่ยมจะถูกแบ่งออกเป็น 2 สายกิ่งขนานกันทันที:
1. **กิ่งที่ 1 (Path 1 / ทางตรง):** ประกอบด้วยตัวต้านทานที่อยู่ระหว่าง $P$ และ $Q$ ตามทิศทางสั้น
   $$r_1 = \sum_{k \in \text{Path 1}} R_k$$
2. **กิ่งที่ 2 (Path 2 / ทางอ้อม):** ประกอบด้วยตัวต้านทานที่เหลือรอบวงแหวน
   $$r_2 = \sum_{k \in \text{Path 2}} R_k = \left(\sum_{\text{รอบวง}} R\right) - r_1$$
3. **ความต้านทานสมมูลของชุดหกเหลี่ยม ($R_{\text{ชุด}}$):**
   $$\frac{1}{R_{\text{ชุด}}} = \frac{1}{r_1} + \frac{1}{r_2} \implies R_{\text{ชุด}} = \frac{r_1 \cdot r_2}{r_1 + r_2}$$
4. **ความต้านทานรวมทั้งวงจร ($R_{\text{รวม}}$):**
   $$R_{\text{รวม}} = R_{\text{มาตรฐาน}} + R_{\text{ชุด}} = 10 + R_{\text{ชุด}}$$
5. **กระแสไฟฟ้ารวมของวงจร ($I$):**
   $$I = \frac{V_s}{R_{\text{รวม}}} = \frac{V_s}{10 + R_{\text{ชุด}}}$$
6. **ความต่างศักย์ตกคร่อมคู่จุดต่อ ($V_{PQ}$):**
   $$V_{PQ} = I \cdot R_{\text{ชุด}}$$

### 1.3 บทวิเคราะห์คู่จุดต่อที่ให้กระแสสูงสุด (Maximum Current Optimization)
* เพื่อให้กระแสไฟฟ้า $I$ มีค่าสูงสุด ความต้านทานรวม $R_{\text{รวม}}$ ต้องมีค่าน้อยที่สุด ซึ่งหมายถึง $R_{\text{ชุด}}$ ต้องต่ำที่สุด
* ฟังก์ชัน $R_{\text{ชุด}}(r_1) = \frac{r_1(21 - r_1)}{21}$ มีค่าต่ำสุดเมื่อผลคูณ $r_1(21 - r_1)$ มีค่าน้อยที่สุด ซึ่งเกิดขึ้นเมื่อ $r_1$ มีค่าน้อยที่สุดเท่าที่เป็นไปได้ ($r_1 = 1\,\Omega$)
* ดังนั้น คู่จุดต่อ **$a - f$ (หรือ $f - a$)** ซึ่งมี $R_{af} = 1\,\Omega$ และทางอ้อม $r_2 = 20\,\Omega$ จะให้:
  $$R_{af} = \frac{1 \times 20}{1 + 20} = \mathbf{\frac{20}{21}\,\Omega} \approx 0.952\,\Omega$$
  $$R_{\text{รวม}} = 10 + \frac{20}{21} = \mathbf{\frac{230}{21}\,\Omega} \approx 10.952\,\Omega$$
  $$I = \frac{10}{\frac{230}{21}} = \mathbf{\frac{21}{23}\text{ A}} \approx 0.913\text{ A}$$
  $$V_{PQ} = \left(\frac{21}{23}\right) \times \left(\frac{20}{21}\right) = \mathbf{\frac{20}{23}\text{ V}} \approx 0.870\text{ V}$$

---

## 2. อัลกอริทึมการคำนวณและระบบเศษส่วนแท้ (Precision Math & Euclidean GCD Engine)

เพื่อป้องกันความคลาดเคลื่อนจากการปัดเศษทศนิยม (Floating Point Rounding Error) ในงานวิชาการ ระบบต้องรักษาค่าเป็นเศษส่วนแท้ $\frac{\text{Numerator}}{\text{Denominator}}$ ควบคู่ไปกับค่าทศนิยมเสมอ

```javascript
/**
 * Euclidean Greatest Common Divisor (GCD)
 */
function gcd(a, b) {
  a = Math.round(Math.abs(a));
  b = Math.round(Math.abs(b));
  while (b > 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

/**
 * Format numerator and denominator into reduced LaTeX string
 */
function toLatexFrac(num, den) {
  if (den === 0) return '0';
  const common = gcd(num, den);
  num = Math.round(num / common);
  den = Math.round(den / common);
  if (den === 1) return `${num}`;
  return `\\frac{${num}}{${den}}`;
}
```

---

## 3. เอนจินลดรูปวงจรเวกเตอร์ SVG พลวัต (Step-by-Step SVG Reduction Engine)

ระบบต้องเรนเดอร์ขั้นตอนการลดรูปวงจร 4 ขั้นตอนแบบเวกเตอร์ SVG ชัดเจน 100% ตอบสนองตามคู่จุดต่อและค่าความต้านทานที่เปลี่ยนไปแบบ Real-time

### 3.1 สถาปัตยกรรม 4 ขั้นตอน (The 4 Reduction Steps)
1. **ขั้นตอนที่ 1 (Unfolded Parallel Branches):** คลี่วงแหวนหกเหลี่ยมออกเป็นสายกิ่งบน ($r_1$) และสายกิ่งล่าง ($r_2$) แสดงบล็อกตัวต้านทานพร้อมรหัส 4 แถบสีสากล (EIA Color Code)
2. **ขั้นตอนที่ 2 (Series Equivalent):** ยุบรวมตัวต้านทานแบบอนุกรมในแต่ละสายกิ่งให้เหลือตัวต้านทานกิ่งละ 1 ตัว ($r_1 \parallel r_2$)
3. **ขั้นตอนที่ 3 (Parallel Equivalent $R_{\text{ชุด}}$):** ยุบขนานกิ่งบนและล่างให้เหลือตัวต้านทานก้อนเดียว พร้อมสูตรคำนวณและเศษส่วนอย่างต่ำ
4. **ขั้นตอนที่ 4 (Full Circuit):** แสดงวงจรสมบูรณ์ที่ต่ออนุกรมกับ $R_{\text{มาตรฐาน}} = 10\,\Omega$ แหล่งจ่ายไฟ $V_s$ และแอมมิเตอร์

### 3.2 การแปลงค่าความต้านทานเป็นแถบสี 4 แถบ (EIA Color Code Engine)
```javascript
const EIA_COLORS = [
  '#000000', // 0: Black
  '#854d0e', // 1: Brown
  '#dc2626', // 2: Red
  '#ea580c', // 3: Orange
  '#facc15', // 4: Yellow
  '#16a34a', // 5: Green
  '#2563eb', // 6: Blue
  '#7c3aed', // 7: Violet
  '#64748b', // 8: Gray
  '#ffffff'  // 9: White
];

function getResistorBandColors(val) {
  val = Math.max(1, Math.round(val));
  const s = val.toString();
  let d1 = 0, d2 = 0, mult = 0;
  if (s.length === 1) {
    d1 = parseInt(s[0], 10);
    d2 = 0;
    mult = 0; // gold multiplier for 0.1 or standard representation
  } else {
    d1 = parseInt(s[0], 10);
    d2 = parseInt(s[1], 10);
    mult = s.length - 2;
  }
  return [
    EIA_COLORS[d1] || '#854d0e',
    EIA_COLORS[d2] || '#000000',
    EIA_COLORS[mult] || '#000000',
    '#eab308' // Gold 5% tolerance
  ];
}
```

---

## 4. สถาปัตยกรรม 3D WebGL PBR และระบบลากย้ายอุปกรณ์ (Dynamic Draggable 3D Equipment)

### 4.1 การสร้างฉากและการจัดแสง PBR (Physically Based Rendering)
* **Renderer:** `THREE.WebGLRenderer({ antialias: true, alpha: true })` พร้อม `shadowMap.enabled = true` แบบ `PCFSoftShadowMap`
* **แสงหลัก (Key Light):** Directional Light ทำมุม $45^\circ$ ทอดเงาลงบนระนาบโต๊ะ
* **แสงเติม (Fill Light):** Ambient Light อบอุ่น ให้ความชัดเจนในจุดอับแสง
* **โต๊ะทดลอง (Bench Plane):** แผ่นกระจกสีเข้มสะท้อนแสงบางเบา อยู่ที่พิกัดระนาบ $y = 0$

### 4.2 ระบบ Drag & Drop บนระนาบ 3D ($y = 0$)
รองรับการคลิกลากอุปกรณ์ (โวลต์มิเตอร์, แอมมิเตอร์, แหล่งจ่ายไฟ DC, สวิตช์, ตัวต้านทาน 10 Ω) อย่างอิสระ:
```javascript
let isDraggingEquipment = false;
let draggedEquipment = null;
const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const planeIntersectPoint = new THREE.Vector3();
const dragOffset = new THREE.Vector3();

function onPointerDown(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // ค้นหาอุปกรณ์ที่อนุญาตให้ลาก
  const intersects = raycaster.intersectObjects(draggableObjects, true);
  if (intersects.length > 0) {
    const rootItem = findRootDraggable(intersects[0].object);
    if (rootItem) {
      isDraggingEquipment = true;
      draggedEquipment = rootItem;
      controls.enabled = false; // ปิด OrbitControls ทันทีเพื่อป้องกันกล้องหมุน
      
      raycaster.ray.intersectPlane(dragPlane, planeIntersectPoint);
      dragOffset.copy(planeIntersectPoint).sub(rootItem.position);
    }
  }
}

function onPointerMove(event) {
  if (!isDraggingEquipment || !draggedEquipment) return;
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  if (raycaster.ray.intersectPlane(dragPlane, planeIntersectPoint)) {
    const newPos = planeIntersectPoint.sub(dragOffset);
    // Clamp ตำแหน่งให้อยู่ภายในขอบเขตหน้าโต๊ะทดลอง
    draggedEquipment.position.x = Math.max(-28, Math.min(28, newPos.x));
    draggedEquipment.position.z = Math.max(-18, Math.min(18, newPos.z));
    
    // อัปเดตตำแหน่งสายไฟซิลิโคนดัดโค้งตามอุปกรณ์แบบ Real-time
    updateDynamicWires();
  }
}

function onPointerUp() {
  isDraggingEquipment = false;
  draggedEquipment = null;
  controls.enabled = true; // เปิดใช้งาน OrbitControls อีกครั้ง
}
```

### 4.3 ระบบสายไฟซิลิโคนดัดโค้งพลวัต (Dynamic Catmull-Rom Leads)
สายไฟเชื่อมต่อระหว่างแจ็คบานาน่าและปากคีบจระเข้ถูกสร้างขึ้นด้วย `THREE.CatmullRomCurve3` โดยจุดควบคุม (Control Points) จะผูกเข้ากับ World Position ของอุปกรณ์:
```javascript
function updateInsulatedLeadGeometry(leadMesh, startVec3, endVec3, droopFactor = 2.5) {
  const midPoint = new THREE.Vector3().addVectors(startVec3, endVec3).multiplyScalar(0.5);
  midPoint.y -= droopFactor; // สายหย่อนตามแรงโน้มถ่วงโลก
  
  const curve = new THREE.CatmullRomCurve3([startVec3, midPoint, endVec3]);
  const newGeometry = new THREE.TubeGeometry(curve, 24, 0.12, 8, false);
  leadMesh.geometry.dispose();
  leadMesh.geometry = newGeometry;
}
```

---

## 5. การควบคุมแบบไร้สัมผัสผ่านเว็บแคม (Touchless AR MediaPipe Hands Pipeline)

### 5.1 ตรรกะการตรวจจับท่าทางมือ (Gesture Recognition Logic)
ระบบใช้ MediaPipe Hands สตรีมผ่าน Web Worker แบบ Zero-GC:
1. **ท่าจีบนิ้ว (Pinch Gesture):** ตรวจวัดระยะระหว่างปลายนิ้วชี้ (Landmark 8) และปลายนิ้วโป้ง (Landmark 4)
   $$d_{\text{pinch}} = \sqrt{(x_8 - x_4)^2 + (y_8 - y_4)^2 + (z_8 - z_4)^2}$$
   หาก $d_{\text{pinch}} < 0.05$ ถือเป็นสถานะ **Pinch (หยิบจับ)** ใช้สำหรับหยิบเลื่อนอุปกรณ์บนโต๊ะ 3D
2. **ท่ากำมือ (Fist Gesture):** ปลายนิ้วทั้ง 4 (นิ้วชี้ กลาง นาง ก้อย) งอชิดเข้าสู่โคนนิ้วหรือข้อมือ ใช้สำหรับสั่ง **Orbit Rotate** หมุนมุมมองกล้อง 3D
3. **ท่าชูสองนิ้ว (Peace / V-Sign):** นิ้วชี้และนิ้วกลางเหยียดตรง นิ้วนางและก้อยพับชิด ใช้สำหรับ **Toggle Switch** เปิด/ปิดสวิตช์ใบมีด หรือสั่งเริ่มจับเวลานาฬิกา

```javascript
function processHandGestures(landmarks) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  
  const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
  const isPinching = pinchDist < 0.045;
  
  if (isPinching) {
    handleVirtualHandPinch(indexTip);
  } else {
    releaseVirtualHand();
  }
}
```

### 5.2 กลไกจำลองมืออัตโนมัติ (Simulated Hand Fallback)
กรณีเครื่องของผู้ใช้งานไม่มีกล้องเว็บแคม หรือไม่ได้รับอนุญาตให้เข้าถึงกล้อง ระบบจะเปิดใช้งานโหมด **Simulated Hand Engine** โดยอัตโนมัติ ซึ่งจะเคลื่อนที่วนรอบอุปกรณ์เพื่อสาธิตการควบคุมแบบไร้สัมผัสให้ผู้เรียนเห็นทันทีโดยไม่เกิดข้อผิดพลาด

---

## 6. ฟิสิกส์เข็มมิเตอร์และการสั่นหน่วง (Spring-Damped Needle Dynamics)

### 6.1 สมการเชิงอนุพันธ์ของเข็มขดลวดเคลื่อนที่ (Moving-Coil Galvanometer)
เข็มวัดแบบอนาล็อกถูกจำลองด้วยระบบฮาร์มอนิกสั่นหน่วงอันดับ 2 (Second-Order Damped Harmonic Oscillator):
$$\frac{d^2\theta}{dt^2} + 2\zeta\omega_n \frac{d\theta}{dt} + \omega_n^2 (\theta - \theta_{\text{target}}) = 0$$

โดยใช้ Semi-Implicit Euler ในแอนิเมชันลูป 60 FPS:
```javascript
class MeterNeedlePhysics {
  constructor(damping = 0.82, spring = 0.16) {
    this.currentAngle = 0;
    this.velocity = 0;
    this.damping = damping;
    this.spring = spring;
  }

  update(targetAngle) {
    const force = (targetAngle - this.currentAngle) * this.spring;
    this.velocity = (this.velocity + force) * this.damping;
    this.currentAngle += this.velocity;
    return this.currentAngle;
  }
}
```

### 6.2 สเกลสะท้อนกระจกเงา (Anti-Parallax Mirror Strip)
หน้าปัดอนาล็อกทั้ง 3D และ 2D มีแถบกระจกโค้ง (Mirror Strip) ใต้เข็มชี้ เมื่อผู้ใช้มองตรง จะเห็นเงาเข็มทับกับตัวเข็มจริงพอดี ช่วยลดความคลาดเคลื่อนจากการมองภาพเหลือบ (Parallax Error) ตามมาตรฐานเครื่องมือวัดในห้องปฏิบัติการ

---

## 7. แผงควบคุม Glassmorphism ย่อขยายและพับเก็บได้อิสระ (Resizable Sidebars)

### 7.1 โครงสร้าง CSS Glassmorphism
```css
.side-panel {
  position: absolute;
  top: 60px;
  bottom: 20px;
  width: 380px;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
}

.panel-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 8px;
  cursor: col-resize;
  z-index: 30;
}
.left-panel .panel-resize-handle { right: -4px; }
.right-panel .panel-resize-handle { left: -4px; }
```

### 7.2 ตรรกะการขยาย/ย่อ และพับเก็บ (Resize & Collapse Interaction)
```javascript
function initPanelResize(event, side) {
  event.preventDefault();
  const panel = document.getElementById(side === 'left' ? 'left-exp1' : 'right-exp1');
  const startX = event.clientX;
  const startW = panel.offsetWidth;

  function onPointerMove(e) {
    const delta = side === 'left' ? (e.clientX - startX) : (startX - e.clientX);
    const newWidth = Math.max(260, Math.min(640, startW + delta));
    panel.style.width = `${newWidth}px`;
  }

  function onPointerUp() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  }

  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
}
```

---

## 8. กิจกรรมเพนดูลัมและการวิเคราะห์ความโน้มถ่วง (Harmonic Pendulum & Linear Fit)

### 8.1 ฟิสิกส์การแกว่งฮาร์มอนิกอย่างง่าย
$$T = 2\pi \sqrt{\frac{L}{g}} \implies T^2 = \left(\frac{4\pi^2}{g}\right) L$$

### 8.2 การถดถอยเชิงเส้นด้วย Ordinary Least Squares (OLS)
เมื่อบันทึกความยาวเชือก $L$ และคาบยกกำลังสอง $T^2$ ลงตาราง ระบบจะคำนวณความชัน $m$ และจุดตัดแกน $c$ ผ่าน Canvas พล็อตเตอร์:
$$m = \frac{N \sum (L \cdot T^2) - \sum L \sum T^2}{N \sum L^2 - (\sum L)^2}$$
$$g_{\text{คำนวณ}} = \frac{4\pi^2}{m}$$

---

## 9. โครงสร้างโปรเจกต์มาตรฐานและการประเมินคุณภาพ (Modular Structure & Quality Checklist)

```text
virtual_lab/
├── index.html                   # HTML Semantic, Viewport, Meta SEO & Modal
├── css/
│   ├── main.css                 # Dark Mode Tokens, Reset, Layout & Topbar
│   ├── panels.css               # Glassmorphism Sidebars, Sliders, Tables, Math Boxes
│   ├── meters.css               # Analog Gauges & Digital Segment Styles
│   ├── ar.css                   # Webcam PIP, Tracking Canvas & Reticle
│   └── modal.css                # Formula Explanation & Theory Breakdown
└── js/
    ├── state.js                 # Global State, Physics Engine & Euclidean GCD
    ├── scene.js                 # Three.js PBR Scene, Lighting & 3D Object Creators
    ├── exp1-circuit.js          # Hex Board, DC Supply, Knife Switch, Moving Meters
    ├── exp2-pendulum.js         # Retort Stand, Protractor, Meter Stick & Pendulum
    ├── labels-raycaster.js      # Raycasting, 3D Labels & Mouse Drag Plane Engine
    ├── ui-exp1.js               # Circuit UI, Step-by-Step Reduction SVG, Resistor Sliders
    ├── ui-exp2.js               # Stopwatch, Period Table, Canvas Linear Regression
    ├── ar-mediapipe.js          # Touchless Hand Tracking, Pinch Drag & Virtual Hand
    └── app.js                   # 60 FPS Render Loop, Needle Damping & Bootstrap
```

### เกณฑ์การตรวจสอบคุณภาพระดับ Masterclass (Checklist)
- [x] **0 Errors / 0 Warnings:** โค้ด JavaScript ทุกบรรทัดทำงานแบบ Non-blocking
- [x] **Dual Meter Mode:** สลับระหว่างเข็มอนาล็อกและตัวเลขดิจิทัลได้แบบ Real-time
- [x] **Independent Drag:** ลากย้ายเครื่องมือวัดได้อย่างอิสระโดยไม่ทำให้มุมกล้องเลื่อน
- [x] **Step-by-Step Reduction:** แสดงขั้นตอนการคลี่วงจร ยุบอนุกรม ยุบขนาน และวงจรสมบูรณ์ด้วย SVG พร้อมแถบสีตัวต้านทานตรงตามค่าจริง
- [x] **Academic Math:** สมการคณิตศาสตร์แสดงผลด้วย MathJax คมชัดระดับตำราวิชาการสากล
- [x] **Standalone Running:** ใช้งานได้ทันทีบนเว็บเบราว์เซอร์มาตรฐานโดยไม่ต้องพึ่งพา Node.js build process
