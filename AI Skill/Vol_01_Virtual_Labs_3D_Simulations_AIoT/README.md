# 📘 เล่มที่ 1: ปัญญาประดิษฐ์เพื่อการจำลองฟิสิกส์ 3 มิติ ห้องปฏิบัติการเสมือนจริง และ AIoT
### Series of AI SKILL — Volume 01: AI for Virtual Labs, 3D Physics Simulation & AIoT

**ผู้เขียน:** ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา  
**สำนักพิมพ์:** ศูนย์ความเป็นเลิศด้านสิ่งแวดล้อมและพลังงาน (LEQs) มหาวิทยาลัยราชภัฏรำไพพรรณี  
**ขนาดรูปเล่ม:** 6x9 นิ้ว (152.4 x 228.6 มม.) มาตรฐานสากล

---

## 🎯 วัตถุประสงค์เชิงพฤติกรรม (OBE Learning Outcomes)
1. สามารถออกแบบและพัฒนาสภาพแวดล้อม 3 มิติเสมือนจริงด้วย Three.js และ PBR Physical Shaders ได้อย่างสมจริง
2. สามารถประยุกต์ใช้โมเดลคอมพิวเตอร์วิทัศน์ MediaPipe Hands ตรวจจับพิกัด 21 ข้อต่อของมือ เพื่อสร้างการควบคุมเสมือนจริงแบบไร้สัมผัส (Touchless AR Control)
3. สามารถเชื่อมต่อสัญญาณฮาร์ดแวร์เซนเซอร์วัดค่าดินผ่านโปรโตคอล RS485 Modbus RTU และฝึกสอนอัลกอริทึม Edge AI บนอุปกรณ์ประมวลผลขนาดเล็กได้

---

## 📑 สารบัญบทเรียน (Table of Contents)

### บทที่ 1: สถาปัตยกรรมการจำลองฟิสิกส์ 3 มิติด้วย Three.js และ PBR Shaders
- 1.1 รากฐานของระบบเรนเดอร์ WebGL และการบริหาร Memory บนเบราว์เซอร์
- 1.2 การสร้างพื้นผิวแบบ Physically Based Rendering (PBR) และการจัดแสงสมจริง
- 1.3 การจำลองระบบฟิสิกส์ 60 FPS: ลูกตุ้มเพนดูลัมฮาร์มอนิก และการลดรูปวงจรไฟฟ้า 6 เหลี่ยม

### บทที่ 2: ระบบตรวจจับและสั่งการไร้สัมผัสด้วย AR MediaPipe Hands
- 2.1 โครงสร้างเชิงเรขาคณิตของมือมนุษย์ 21 จุดข้อต่อ (21-Joint Cyber Skeleton)
- 2.2 อัลกอริทึมการคำนวณเวกเตอร์ท่าทาง: การตรวจจับการจีบนิ้ว (Pinch) และกำมือ (Fist)
- 2.3 การออกแบบลูปประมวลผล Zero-GC (Zero Garbage Collection) เพื่อความลื่นไหลระดับสูง

### บทที่ 3: ระบบ AIoT และการประมวลผลปัญญาประดิษฐ์ฝังตัวบนขอบ (Edge AI)
- 3.1 การสื่อสารฮาร์ดแวร์วัดคุณภาพดินผ่านพอร์ต USB-C RS485 Modbus RTU
- 3.2 การสร้างแบบจำลองการถดถอยเชิงเส้นพหุคูณ (Ordinary Least Squares) ด้วย Pure Dart
- 3.3 การจัดเก็บข้อมูลขึ้น Google Drive Cloud Sync และการสร้างระบบแจ้งเตือนแบบเรียลไทม์

---

## 🚀 การคอมไพล์เล่ม (XeLaTeX)
```bash
/Library/TeX/texbin/xelatex -interaction=nonstopmode main.tex
```

## 🛠️ รายการสกิลต้นฉบับและไฟล์ SKILL.md ประจำเล่ม (Agent Skills Inventory)

| ลำดับ | ชื่อสกิล (Skill Name) | รายละเอียดและขอบเขตความสามารถ | ลิงก์ไฟล์ข้อกำหนด (SKILL.md) |
| :---: | :--- | :--- | :--- |
| 1 | `aiot-fullstack-latex-architect` | สถาปัตยกรรมและระบบอัตโนมัติสำหรับการสร้างเว็บแอปพลิเคชัน AIoT (Frontend Web Portal, Interactive Simulators, Virtual Lab), ระบบฐานข้อมูล SQLi... | [📄 ดูเนื้อหา SKILL.md](skills/aiot-fullstack-latex-architect/SKILL.md) |
| 2 | `ar-simulation-builder` | Builds, optimizes, and reviews hyper-realistic web-based AR simulations (Physics, Chemistry, Biology, Math, AI Robotics) using MediaPipe Han... | [📄 ดูเนื้อหา SKILL.md](skills/ar-simulation-builder/SKILL.md) |
| 3 | `digital-agri-mobile-latex-architect` | สถาปัตยกรรมและกระบวนการพัฒนาแอปพลิเคชันสมาร์ทโฟนเกษตรดิจิทัล (Flutter Mobile Edge AI & BLE Telemetry) จากชุดคำสั่ง Context Prompt สู่การสร้า... | [📄 ดูเนื้อหา SKILL.md](skills/digital-agri-mobile-latex-architect/SKILL.md) |
| 4 | `globe2027-system-architect` | สถาปัตยกรรมและมาตรฐานการพัฒนาระบบนิเวศดิจิทัล LEQs-GLOBE มหาวิทยาลัยราชภัฏรำไพพรรณี ปีงบประมาณ 2570 (GLOBE2027 System Architect) ครอบคลุมการ... | [📄 ดูเนื้อหา SKILL.md](skills/globe2027-system-architect/SKILL.md) |
| 5 | `interactive-3d-lab-builder` | Upgrades 2D HTML Canvas physics experiments into hyper-realistic 3D Virtual Labs using Three.js and A-Frame PBR shaders. Integrates Web Audi... | [📄 ดูเนื้อหา SKILL.md](skills/interactive-3d-lab-builder/SKILL.md) |
| 6 | `motorcycle-3d-cad-architect` | สถาปัตยกรรมและการสร้างแบบจำลอง 3 มิติรถจักรยานยนต์สปอร์ตเรซซิ่งคลาสสิก (Yamaha TZR Series - TZR150 / TZR250) ครอบคลุมโครงสร้างเฟรมอลูมิเนียม... | [📄 ดูเนื้อหา SKILL.md](skills/motorcycle-3d-cad-architect/SKILL.md) |
| 7 | `nextgen-physics-virtual-lab-architect` | สถาปัตยกรรมและมาตรฐานการพัฒนาห้องปฏิบัติการฟิสิกส์ 3 มิติเสมือนจริงและเทคโนโลยีตรวจจับมือไร้สัมผัส (NextGen 3D & AR MediaPipe Virtual Physic... | [📄 ดูเนื้อหา SKILL.md](skills/nextgen-physics-virtual-lab-architect/SKILL.md) |
| 8 | `physics-course-visual-builder` | Builds, formats, and deploys high-contrast modern HTML5 & inline SVG infographics, interactive visual cards, vector math equations, and form... | [📄 ดูเนื้อหา SKILL.md](skills/physics-course-visual-builder/SKILL.md) |
| 9 | `soil-pht-aiot-architect` | สถาปัตยกรรมและมาตรฐานการพัฒนาแอปพลิเคชันเครื่องวัด pH ดินและพารามิเตอร์ดินอัจฉริยะ (SoilpHTxAI & Soil Parameter Edge AI Architect) ครอบคลุมก... | [📄 ดูเนื้อหา SKILL.md](skills/soil-pht-aiot-architect/SKILL.md) |
| 10 | `spectrometer-3d-chassis-architect` | สถาปัตยกรรมและการออกแบบโมเดล 3 มิติสำหรับเครื่องสเปกโทรโฟโตมิเตอร์ทางการเกษตรและห้องปฏิบัติการ ถอดรหัสจากต้นแบบวิศวกรรม SpectorV4.stl และผลง... | [📄 ดูเนื้อหา SKILL.md](skills/spectrometer-3d-chassis-architect/SKILL.md) |
