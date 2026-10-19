---
name: motorcycle-3d-cad-architect
description: >-
  สถาปัตยกรรมและการสร้างแบบจำลอง 3 มิติรถจักรยานยนต์สปอร์ตเรซซิ่งคลาสสิก (Yamaha TZR Series - TZR150 / TZR250) 
  ครอบคลุมโครงสร้างเฟรมอลูมิเนียม Deltabox, เครื่องยนต์ 2 จังหวะวาล์ว YPVS, ชุดแฟริ่งแอโรไดนามิกรถแข่ง 90s,
  ท่อไอเสียสูตร Expansion Chamber, ระบบกันสะเทือนหน้า Telescopic และหลัง Monoshock, 
  การสร้างไฟล์พารามิเตอร์ OpenSCAD, สคริปต์สร้างเมช STL Watertight 100% และ Interactive 3D Web Viewer
---

# Motorcycle 3D CAD Architect (Yamaha TZR Racing DNA)

กรอบมาตรฐานวิศวกรรม 3 มิติและการออกแบบโครงสร้างรถจักรยานยนต์สปอร์ต 2 จังหวะระดับตำนานตระกูล **Yamaha TZR Series (TZR150 / TZR250 3MA / 3XV)** ถอดรหัสโครงสร้างเชิงลึกจากสนามแข่งกรังด์ปรีซ์ (Grand Prix Road Racing - YZR500) สู่แบบจำลอง 3 มิติที่มีสัดส่วนทางวิศวกรรมแม่นยำ เรขาคณิตปิดสนิท (100% Watertight Solid) และพร้อมสำหรับการพิมพ์ 3 มิติ (Scale Model 3D Printing) หรือการจำลองเชิงพลศาสตร์ของไหลและอากาศพลศาสตร์ (CFD & Aerodynamics)

---

## 1. การถอดรหัสเรขาคณิตและเอกลักษณ์ของ Yamaha TZR (Reverse-Engineering DNA)

รถจักรยานยนต์ตระกูล Yamaha TZR มีอัตลักษณ์ทางวิศวกรรมที่เป็นหมุดหมายสำคัญของยุคทอง 2 จังหวะ (The Golden 2-Stroke Era):

```
                       ┌───────────────────────────────────────┐
                       │     Aerodynamic Front Cowl & Screen   │ (ครอบหน้าทรงลิ่ม + ชิลด์บังลม)
                       │     Clip-on Bars + Cockpit Gauges     │
                       └──────────────────┬────────────────────┘
                                          │
 ┌────────────────────────────────────────▼────────────────────────────────────────┐
 │            Yamaha TZR Master Engineering Architecture (Deltabox Era)            │
 │                                                                                 │
 │  [Front Fork & Wheel] ──► [Deltabox Frame] ──► [2T YPVS Engine] ──► [Expansion] │
 │  (Telescopic + Disc)     (Twin-spar Box)      (Cylinder & Reed)     (Cone Pipe) │
 └────────────────────────────────────────┬────────────────────────────────────────┘
                                          │
                       ┌──────────────────▼────────────────────┐
                       │   Box Swingarm, Monoshock & Rear Wheel│ (สวิงอาร์มกล่อง + โช้คเดี่ยว)
                       └───────────────────────────────────────┘
```

### 1.1 สัดส่วนมิติวิศวกรรมหลัก (Scale & Bounding Envelope)
* **ฐานล้อ (Wheelbase):** อัตราส่วนจริง $1,335\text{ mm}$ (สำหรับสเกลจำลอง $1:12 \approx 111.2\text{ mm}$, สเกล $1:10 \approx 133.5\text{ mm}$)
* **ความยาวรวมแกน X ($\Delta X$):** ประมาณ $195 - 200\text{ mm}$ (ที่สเกลเดสก์ท็อป $1:10$)
* **ความกว้างแฮนด์แกน Y ($\Delta Y$):** ประมาณ $68 - 72\text{ mm}$ (แฮนด์จับโช้คใต้แผงคอ Clip-on)
* **ความสูงรวมแกน Z ($\Delta Z$):** ประมาณ $110 - 118\text{ mm}$ จากพื้นถึงขอบบนชิลด์หน้า
* **มุมคาสเตอร์และระยะเทรล (Rake & Trail):** มุมก้มของแกนคอโช้คหน้า $24^\circ - 25^\circ$ ระยะเทรล $90\text{ mm}$

---

## 2. กฎเหล็ก 7 ข้อในการสร้างโมเดล 3D Yamaha TZR (Engineering Design Laws)

### กฎข้อที่ 1: โครงสร้างเฟรมอลูมิเนียมเดลต้าบ็อกซ์ (Deltabox Twin-Spar Geometry)
* เฟรมต้องมีลักษณะเป็นคานกล่องคู่ (Extruded Box Section) พาดทแยงตรงจากแกนคอหน้ารถ (Steering Head) ลงมายังจุดหมุนสวิงอาร์ม (Swingarm Pivot) โดยตรง
* โครงสร้างหน้าตัดรูปสามเหลี่ยมคว่ำ (Delta Structure) ให้ความแข็งแกร่งต้านแรงบิดตัว (Torsional Rigidity) สูงสุด
* บริเวณข้อต่อคอหน้าและแท่นยึดเครื่องยนต์ต้องมีรอยต่อเชื่อมประสานแบบเรียบเนียน (Fillet & Gusset Plate)

### กฎข้อที่ 2: สถาปัตยกรรมเครื่องยนต์ 2 จังหวะและวาล์ว YPVS (2-Stroke Engine Core)
* เสื้อสูบวางเอียงไปข้างหน้าประมาณ $45^\circ - 60^\circ$ พร้อมฝาสูบและครีบระบายความร้อนหม้อน้ำ (Radiator Block)
* แคร้งก์เครื่องยนต์ทรงกลมมนพร้อมฝาครอบคลัตช์ฝั่งขวา และจานไฟฝั่งซ้าย
* ชุดวาล์วเปิด-ปิดไอเสียควบคุมด้วยเซอร์โวมอเตอร์ **YPVS (Yamaha Power Valve System)** เหนือพอร์ตไอเสีย

### กฎข้อที่ 3: ท่อไอเสียสูตรทรงกรวยผ่า (Tuned Expansion Chamber)
* ท่อไอเสียต้องถอดรหัสหลักการสะท้อนคลื่นเสียง (Pressure Wave Reflection) 4 ช่วงชัดเจน:
  1. **Header Pipe:** ท่อโค้งออกจากเสื้อสูบ
  2. **Divergent Diffuser Cone:** กรวยขยายเส้นผ่านศูนย์กลางสร้างคลื่นแรงดันลบ (Scavenging Pulse)
  3. **Belly Section:** ช่วงกระบอกกว้างสุดใต้ท้องรถ
  4. **Convergent Baffle Cone:** กรวยสอบปลายสะท้อนคลื่นแรงดันบวกดันไอดีกลับเข้ากระบอกสูบ
  5. **Silencer:** ปลายท่อเก็บเสียงทรงกระบอกอลูมิเนียมยกเชิดขึ้นทางขวาด้านท้าย

### กฎข้อที่ 4: ชุดแฟริ่งแอโรไดนามิกยุค 90 (Classic 90s Racing Fairing)
* แฟริ่งหน้า (Upper Cowl) ทรงลิ่มตัดอากาศ พร้อมช่องไฟหน้าทรงเหลี่ยมคลาสสิก หรือไฟหน้าคู่กลม (3XV Endurance style)
* ชิลด์บังลมโปร่งใสทรงฟองสบู่ (Bubble Windscreen)
* แฟริ่งข้าง (Side Fairings) มีช่องดักลมระบายความร้อนหม้อน้ำ (NACA Duct / Louver Vents)
* แฟริ่งท้าย (Tail Cowl) ทรงตูดเป็ดหรือทรงแบนยกสูง พร้อมไฟท้ายเหลี่ยมและบังโคลน

### กฎข้อที่ 5: ระบบกันสะเทือนและล้อแม็กสปอร์ต (Suspension & Wheel Dynamics)
* ล้อหน้า-หลัง: ล้อแม็กอัลลอย 3 ก้านทรงสปอร์ต หรือ 6 ก้านคลาสสิก พร้อมยางเรเดียลหน้ากว้าง
* ระบบเบรก: จานดิสก์เบรกหน้าเดี่ยว/คู่เจาะรูระบายความร้อน (Perforated Rotor) พร้อมคาลิปเปอร์เบรก
* โช้คอัพหลัง: ระบบ Monocross กระเดื่องทดแรง ซ่อนตัวอยู่ระหว่างแคร้งก์เครื่องยนต์และสวิงอาร์ม

### กฎข้อที่ 6: การยศาสตร์และการควบคุม (Ergonomics & Controls)
* ถังน้ำมันทรงเพรียวยาว เว้ารับหัวเข่าทั้งสองฝั่ง (Knee Recesses)
* เบาะนั่งแบบสองตอนต่างระดับ (Stepped Sport Seat)
* แฮนด์จับโช้ค Clip-on ต่ำกว่าระดับถังน้ำมัน ให้ท่านั่งก้มหมอบแบบ Racing Tuck

### กฎข้อที่ 7: ความสมบูรณ์แบบของเมชสำหรับพิมพ์ 3 มิติ (Watertight Manifold Solid)
* ชิ้นส่วนทุกชิ้นต้องหลอมรวมทางคณิตศาสตร์เป็น **Watertight Solid 100% (0 Boundary Edges)**
* รายละเอียดขนาดเล็ก (เช่น โซ่ ซี่ล้อ ก้านเบรก) ต้องมีความหนาอย่างน้อย $1.0 - 1.2\text{ mm}$ ในสเกลพิมพ์จริง เพื่อไม่ให้หักขณะพิมพ์หรือแกะ Support

---

## 3. รูปแบบโค้ดพารามิเตอร์ OpenSCAD สำหรับ Yamaha TZR

```openscad
// =============================================================================
// Yamaha TZR Series - Parametric OpenSCAD Architecture
// =============================================================================
$fn = 40;

module deltabox_spar(len=110, w=16, h=28) {
    // Twin-spar beam geometry with hollow reinforcement ribs
    difference() {
        cube([len, w, h], center=true);
        cube([len-10, w-4, h-6], center=true);
    }
}

module expansion_chamber() {
    // Procedural multi-cone 2-stroke exhaust
    // Header -> Diffuser -> Belly -> Baffle -> Stinger -> Silencer
}
```

---

## 4. ไปป์ไลน์การเรนเดอร์และสร้างเมช STL ด้วย Python

* ใช้ Signed Distance Fields (SDF) ร่วมกับการดัดโค้งทรงกระบอก (Twisted Cylinder / Swept Polyline)
* สร้างท่อไอเสียแบบกรวยด้วยการจำลองวงกลมรัศมีแปรผันตามแนวเส้นทางเดิน ($r(t)$ along spline)
* ส่งออก Binary STL ความละเอียดสูงที่พร้อมพิมพ์ 3D หรือแสดงผลบน WebGL / Three.js
