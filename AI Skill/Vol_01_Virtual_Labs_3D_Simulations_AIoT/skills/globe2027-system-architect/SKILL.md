---
name: globe2027-system-architect
description: >-
  สถาปัตยกรรมและมาตรฐานการพัฒนาระบบนิเวศดิจิทัล LEQs-GLOBE มหาวิทยาลัยราชภัฏรำไพพรรณี ปีงบประมาณ 2570 (GLOBE2027 System Architect)
  ครอบคลุมการบริหารจัดการโรงเรียนเครือข่าย 8 โรงเรียน, ฐานข้อมูล 6 มิติ (การรับสมัคร, สำรวจภาคสนาม 4 ทรงกลม & 19 กิจกรรม Climate Change,
  วัดผล Pre/Post-Test, ประเมิน 5 ดาว, ทะเบียนเกียรติบัตร SHA-256, คลังโครงงานวิจัย), Dual-Backend (PHP/SQLite3 & Google Apps Script REST API Gateway),
  สถาปัตยกรรม Admin CMS Glassmorphism พร้อม Sidebar Menu, ระบบตรวจวัดภาคสนาม และการจัดทำคู่มือวิชาการตามมาตรฐาน มรภ.รำไพพรรณี (RBRU)
---

# GLOBE2027 System Architect & Digital Ecology Masterclass

กรอบมาตรฐานสถาปัตยกรรมซอฟต์แวร์และระเบียบวิธีวิศวกรรมระบบสารสนเทศสิ่งแวดล้อม **โครงการพัฒนาเครือข่าย LEQs-GLOBE มหาวิทยาลัยราชภัฏรำไพพรรณี ปีงบประมาณ 2570 (GLOBE 2027)** บูรณาการวิทยาศาสตร์สิ่งแวดล้อมโลก (Earth System Science หรือ ESS), ปัญญาประดิษฐ์ฝังตัว (AIoT), ระบบการเรียนรู้การเปลี่ยนแปลงสภาพภูมิอากาศ (Climate Change Action), สถาปัตยกรรมฐานข้อมูลคู่ขนาน (Dual-Backend Database Architecture) และระบบบริหารจัดการหลังบ้านระดับองค์กร (Enterprise Glassmorphism Admin CMS) ภายใต้การอำนวยการของ **ผศ.ดร.ชีวะ ทัศนา** ศูนย์ LEQs มหาวิทยาลัยราชภัฏรำไพพรรณี

---

## 1. บริบทโครงการและเป้าหมายเชิงระบบ (System Context & Core KPIs)

ระบบ GLOBE2027 ถูกออกแบบขึ้นเพื่อขับเคลื่อนตัวชี้วัดสำคัญของโครงการปีงบประมาณ 2570 ดังต่อไปนี้

1. **เครือข่ายโรงเรียนเป้าหมาย (Target Schools)** คัดเลือกโรงเรียนแกนนำจำนวน **8 โรงเรียน** ในจังหวัดจันทบุรีและภาคตะวันออก โดยมีโควตาโรงเรียนขนาดเล็กไม่น้อยกว่า **2 โรงเรียน**
2. **บุคลากรผู้เข้ารับการอบรม (Capacity Building)** 
   - ครูแกนนำโรงเรียนละ 5 คน รวมทั้งสิ้น **40 คน**
   - นักเรียนแกนนำโรงเรียนละ 20 คน รวมทั้งสิ้น **160 คน**
3. **การสำรวจและจัดเก็บข้อมูลภาคสนาม (Field Telemetry)** เป้าหมายชุดข้อมูลตรวจวัดสิ่งแวดล้อมคุณภาพสูงอย่างน้อย **160 ชุดข้อมูล** (เฉลี่ยโรงเรียนละ 20 ชุดข้อมูล)
4. **งบประมาณสนับสนุน (Budget Allocation)** จัดสรรเงินอุดหนุนดำเนินงานกิจกรรมสิ่งแวดล้อมโรงเรียนละ 10,000 บาท รวมงบประมาณ **80,000 บาท**
5. **การขับเคลื่อน 4 ทรงกลมสิ่งแวดล้อม (4 Earth Spheres)** ดิน (Pedosphere), น้ำ (Hydrosphere), บรรยากาศ (Atmosphere), สิ่งมีชีวิตและสิ่งปกคลุมดิน (Biosphere)
6. **คลัง 19 กิจกรรม Climate Change** ครอบคลุมการตรวจวัดอุณหภูมิผิวโลก, คุณภาพน้ำ, ความชื้นดิน, ก๊าซเรือนกระจก, และลูกน้ำยุงลายพาหะนำโรค

---

## 2. สถาปัตยกรรมระบบคู่ขนาน (Dual-Backend Database Architecture)

เพื่อความทนทานต่อความล้มเหลว (High Availability) และความยืดหยุ่นในการปฏิบัติงานภาคสนาม ระบบแบ่งออกเป็น 2 ชั้นข้อมูลที่เชื่อมโยงกันแบบสองทิศทาง

```
  ┌───────────────────────────────────────────────────────────────┐
  │         Client Tier: Responsive Web Portal & Mobile UI        │
  │     (Vanilla HTML5, Modern CSS Glassmorphism, Vanilla JS)     │
  └───────────────┬───────────────────────────────┬───────────────┘
                  │                               │
        [REST API / JSON]               [Google Apps Script]
                  ▼                               ▼
  ┌───────────────────────────────┐ ┌───────────────────────────────┐
  │ Local Edge Tier: XAMPP/Apache │ │ Cloud Tier: Google Workspace  │
  │  - PHP PDO Engine (api.php)   │ │  - Spreadsheet Gateway (Code) │
  │  - Local SQLite3 (database.db)│ │  - Sheet ID: 1HzgEu8QnMH...   │
  │  - Admin CMS (admin.php)      │ │  - 6 Multi-Domain Sheets      │
  └───────────────────────────────┘ └───────────────────────────────┘
```

### 2.1 ฝั่ง Edge / Local Server (PHP + SQLite3)
- **ตำแหน่งไฟล์:** `api/api.php` และ `database.db`
- **เครื่องมือจัดการฐานข้อมูล:** `init_db.py` หรือ PHP PDO SQLite
- **จุดเด่น:** ทำงานได้รวดเร็วระดับ Microseconds บนเครือข่ายภายใน Intranet โรงเรียน หรือเซิร์ฟเวอร์ XAMPP ท้องถิ่น แม้ไม่มีอินเทอร์เน็ตภายนอก

### 2.2 ฝั่ง Cloud Server (Google Spreadsheet Gateway)
- **Spreadsheet ID:** `1HzgEu8QnMHcd4GPuvslPmyBdHHF985ZK_t1HnV_-S4w`
- **สคริปต์ควบคุม:** `Code.gs` และ `appsscript.json`
- **จุดเด่น:** เป็นคลาวด์สาธารณะที่เปิดให้โรงเรียนเครือข่าย วิทยากร สสวท. และผู้ทรงคุณวุฒิตรวจสอบข้อมูลได้แบบเรียลไทม์ พร้อมเมนูอัตโนมัติ `🌱 LEQs-GLOBE 2570`

---

## 3. สถาปัตยกรรมฐานข้อมูล 6 มิติ (6 Multi-Domain Data Schemas)

ทั้งสองฝั่ง (SQLite3 และ Google Sheets) ถือครองโครงสร้างฟิลด์ข้อมูลที่ตรงกัน 1 ต่อ 1 เพื่อป้องกันปัญหา Schema Drift

### 3.1 มิติที่ 1  การรับสมัครโรงเรียนเครือข่าย (`schools` / `การรับสมัคร`)
- `reg_code`: รหัสใบสมัคร เช่น `GLB-2570-001`
- `school_name`: ชื่อโรงเรียน
- `province`: จังหวัด (จันทบุรี, ระยอง, ตราด, สระแก้ว, ชลบุรี ฯลฯ)
- `school_level`: ระดับชั้น (ประถมศึกษาตอนปลาย, มัธยมศึกษาตอนต้น, มัธยมศึกษาตอนปลาย, ขยายโอกาส)
- `school_size`: ขนาดโรงเรียน (`small` โรงเรียนขนาดเล็ก, `regular` โรงเรียนทั่วไป)
- `teacher_name`, `phone`, `email`, `line_id`: ข้อมูลติดต่อครูแกนนำ
- `teacher_count`: จำนวนครู (ค่าตั้งต้น 5 คน)
- `student_count`: จำนวนนักเรียน (ค่าตั้งต้น 20 คน)
- `spheres`: ทรงกลมที่สนใจตรวจวัด (ดิน, น้ำ, บรรยากาศ, สิ่งมีชีวิต)
- `climate_activities`: กิจกรรม Climate Change ที่เลือกดำเนินงาน (อย่างน้อย 2 กิจกรรม)
- `expected_data_entries`: เป้าหมายการส่งข้อมูลตรวจวัด (อย่างน้อย 20 ชุด)
- `status`: สถานะ (`pending` รอตรวจสอบ, `confirmed` ผ่านการคัดเลือก 8 โรงเรียน, `completed` สิ้นสุดกิจกรรม, `cancelled` สละสิทธิ์)

### 3.2 มิติที่ 2  ข้อมูลสำรวจภาคสนาม 4 ทรงกลม (`survey_entries` / `ข้อมูลสำรวจภาคสนาม`)
- `school_id` / `ชื่อโรงเรียน`: โรงเรียนผู้ส่งข้อมูล
- `sphere`: ทรงกลมสิ่งแวดล้อม (`atmosphere`, `hydrosphere`, `pedosphere`, `biosphere`)
- `activity_code`: รหัสกิจกรรม เช่น `CLIM-01` ถึง `CLIM-19`
- `observed_at`: วันและเวลาที่ลงพื้นที่ตรวจวัดจริง
- `latitude`, `longitude`: พิกัดดาวเทียม GPS ทศนิยม 6 ตำแหน่ง
- `observer_name`: ชื่อครูหรือนักเรียนผู้ตรวจวัด
- `data_payload`: ข้อมูลพารามิเตอร์ตรวจวัดในรูปแบบ JSON Schema (เช่น Temp, RH, pH, DO, NPK, Cloud Cover, Mosquito Count)
- `photo_url`: ลิงก์รูปภาพหลักฐานเชิงประจักษ์ภาคสนาม
- `status`: สถานะการรับรอง (`pending`, `verified` รับรองแล้ว, `flagged` ข้อมูลผิดปกติ)

### 3.3 มิติที่ 3  การวัดผลการเรียนรู้ Pre-Test & Post-Test (`exam_attempts` / `การวัดผล_PrePostTest`)
- `school_id` / `ชื่อโรงเรียน`
- `participant_name`: ชื่อ-นามสกุลผู้เข้าทดสอบ
- `participant_type`: ประเภทผู้สอบ (`teacher` ครู, `student` นักเรียน)
- `exam_type`: ประเภทการทดสอบ (`pre-test` ก่อนอบรม, `post-test` หลังอบรม)
- `score`: คะแนนที่สอบได้ (เต็ม 20 ข้อ)
- `total_questions`: จำนวนข้อสอบทั้งหมด (20 ข้อ)
- `percentage`: คิดเป็นร้อยละความถูกต้อง (เกณฑ์ผ่าน 70% หรือ 14 คะแนนขึ้นไป)
- `details`: บันทึกคำตอบรายข้อและคำอธิบายเฉลยในรูปแบบ JSON

### 3.4 มิติที่ 4  การประเมินความพึงพอใจ 5 ระดับดาว (`eval_responses` / `การประเมินความพึงพอใจ`)
- `school_id` / `ชื่อโรงเรียน`
- `evaluator_name`: ชื่อผู้ประเมิน
- `evaluator_role`: บทบาท (`ครูแกนนำ`, `นักเรียนแกนนำ`, `ผู้บริหารโรงเรียน`, `วิทยากร`)
- `rating_content`: ด้านเนื้อหาหลักสูตรและกิจกรรม (1–5 ดาว)
- `rating_mentor`: ด้านวิทยากรและทีมพี่เลี้ยง มรภ.รำไพพรรณี (1–5 ดาว)
- `rating_facility`: ด้านระบบแอปพลิเคชัน อุปกรณ์ตรวจวัด และสถานที่ (1–5 ดาว)
- `rating_overall`: ภาพรวมและความคุ้มค่าของโครงการ (1–5 ดาว)
- `suggestions`: ข้อเสนอแนะเชิงพัฒนา

### 3.5 มิติที่ 5  ทะเบียนเกียรติบัตรอิเล็กทรอนิกส์ (`cert_records` / `ทะเบียนเกียรติบัตร`)
- `cert_code`: รหัสเกียรติบัตรมาตรฐาน เช่น `CERT-GLOBE-2570-0001`
- `recipient_name`: ชื่อ-สกุลผู้ได้รับเกียรติบัตร
- `recipient_role`: ตำแหน่ง/บทบาท
- `cert_title`: ชื่อหลักสูตรหรือผลงาน
- `issue_date`: วันที่ออกเกียรติบัตร
- `verification_hash`: รหัสแฮชความปลอดภัย **SHA-256 (16 Hex-digits)** สร้างจาก `cert_code + recipient_name + timestamp`
- `qr_link`: ลิงก์ URL สแกนตรวจสอบความถูกต้องผ่านหน้าเว็บแบบเรียลไทม์

### 3.6 มิติที่ 6  คลังโครงงานวิจัยเยาวชน GLOBE (`research_projects` / `โครงงานวิจัยเยาวชน`)
- `school_id` / `ชื่อโรงเรียน`
- `sphere`: ทรงกลมวิทยาศาสตร์โลก
- `title_th`: ชื่อโครงงานภาษาไทย
- `title_en`: ชื่อโครงงานภาษาอังกฤษ
- `authors`: รายชื่อคณะนักเรียนผู้วิจัย
- `advisors`: รายชื่อครูที่ปรึกษา
- `abstract`: บทคัดย่อโครงงาน
- `poster_url`: ลิงก์ไฟล์โปสเตอร์วิชาการความละเอียดสูง
- `paper_pdf_url`: ลิงก์เอกสารรายงานวิจัยฉบับสมบูรณ์ (PDF)
- `video_clip_url`: ลิงก์คลิปวิดีโอนำเสนอผลงานบน YouTube
- `award_status`: สถานะรางวัลและการประกวดของ สสวท. หรือ มรภ.รำไพพรรณี

---

## 4. สถาปัตยกรรมระบบหลังบ้าน Admin CMS (`admin.php`)

ระบบ Admin CMS ใช้การออกแบบระดับพรีเมียมด้วย Dark Theme Glassmorphism และ Responsive Sidebar Navigation

### 4.1 การจัดหมวดหมู่เมนูด้านข้าง (Sidebar Navigation Structure)
1. **หมวดภาพรวม & บริหารจัดการ (Management Group)**
   - 📊 `kpi`: ภาพรวม & KPIs โครงการ (การกระจายตัวงบประมาณ, เป้าหมาย 8 โรงเรียน, อัตราส่วนโรงเรียนขนาดเล็ก)
   - 🏫 `schools`: ข้อมูลโรงเรียน & อนุมัติ (ตารางค้นหา, กรองสถานะ, จัดการรายชื่อครูและนักเรียน)
   - 🏆 `confirmed`: ประกาศ 8 โรงเรียน (หน้าพรีวิวสรุป 8 โรงเรียนที่ผ่านการคัดเลือกเป็นทางการ)
2. **หมวดข้อมูลสำรวจ & งานวิจัย (Data & Research Group)**
   - 🛰️ `surveys`: ข้อมูลสำรวจ 4 ทรงกลม (Live Telemetry Table, กรองราย Sphere, ดู JSON Payload, ตรวจสอบภาพถ่าย)
   - 📝 `assessments`: วัดผล & ประเมิน (สถิติ Pre/Post-Test, ค่าเฉลี่ยความพึงพอใจ 4 มิติ 5 ดาว)
   - 🎓 `certificates`: ทะเบียนเกียรติบัตร (ตารางออกเกียรติบัตร, ตรวจสอบรหัส SHA-256, ลิงก์สแกน QR Code)
   - 🔬 `research`: คลังโครงงานวิจัย (จัดการบทคัดย่อ, ลิงก์โปสเตอร์และคลิปวิดีโอนักเรียน)
3. **หมวดเนื้อหา & สื่อการเรียนรู้ (Content & Media Group)**
   - 📚 `activities`: คลัง 19 กิจกรรม (คู่มือและโปรโตคอลการตรวจวัด Climate Change)
   - ⚙️ `settings`: ตั้งค่าหน้าเพจ (ปรับแต่งข้อความประชาสัมพันธ์, ผู้ประสานงาน, วันปิดรับสมัคร)

### 4.2 มาตรการความมั่นคงปลอดภัย (Security Specifications)
- **ระบบยืนยันตัวตน (Authentication):** ตรวจสอบผ่านตาราง `admin_users` ด้วยรหัสผ่านแบบ Hashed Session
- **การป้อนข้อมูล (Input Sanitization):** ป้องกัน SQL Injection ด้วย Prepared Statements (PDO) ทุกคำสั่ง 100%
- **การแยกสิทธิ์ (Role Separation):** ป้องกันไม่ให้บุคคลภายนอกเข้าถึงฟังก์ชันลบหรืออนุมัติสถานะโรงเรียน

---

## 5. อนุกรมวิธาน 19 กิจกรรมการเรียนรู้ Climate Change (19 Activities Taxonomy)

ระบบจัดโครงสร้าง 19 กิจกรรมออกเป็น 4 หมวดตามหลัก Earth System Science (ESS):

### 5.1 ด้านบรรยากาศ (Atmosphere Protocols  CLIM-01 ถึง CLIM-05)
- `CLIM-01` การตรวจวัดอุณหภูมิผิวโลกและการถ่ายเทความร้อน (Surface Temperature & Urban Heat Island)
- `CLIM-02` การสำรวจเมฆและสัดส่วนการปกคลุมท้องฟ้า (Cloud Types & Sky Cover)
- `CLIM-03` การตรวจวัดฝน ปริมาณน้ำฟ้า และค่าความเป็นกรด-ด่างของน้ำฝน (Precipitation & Rain pH)
- `CLIM-04` การตรวจวัดความกดอากาศและความชื้นสัมพัทธ์ (Barometric Pressure & Relative Humidity)
- `CLIM-05` การตรวจวัดละอองลอยและฝุ่นละอองในบรรยากาศ (Aerosols & PM2.5 Observation)

### 5.2 ด้านอุทกวิทยา (Hydrosphere Protocols  CLIM-06 ถึง CLIM-10)
- `CLIM-06` การตรวจวัดอุณหภูมิน้ำและผลกระทบต่อสิ่งมีชีวิต (Water Temperature Dynamics)
- `CLIM-07` การตรวจวัดออกซิเจนละลายในน้ำ (Dissolved Oxygen หรือ DO)
- `CLIM-08` การตรวจวัดค่าความเป็นกรด-ด่างของแหล่งน้ำธรรมชาติ (Water pH & Buffer Capacity)
- `CLIM-09` การตรวจวัดความโปร่งใสและความขุ่นของน้ำ (Water Transparency & Turbidity)
- `CLIM-10` การตรวจวัดการนำไฟฟ้าและความเค็มของน้ำ (Electrical Conductivity & Salinity)

### 5.3 ด้านปฐพีวิทยา (Pedosphere Protocols  CLIM-11 ถึง CLIM-14)
- `CLIM-11` การตรวจวัดอุณหภูมิดินในระดับความลึกต่างๆ (Soil Temperature Profiles)
- `CLIM-12` การตรวจวัดความชื้นในดินและวัฏจักรน้ำ (Soil Moisture Dynamics)
- `CLIM-13` การศึกษาลักษณะเนื้อดินและโครงสร้างดิน (Soil Characterization & Texture)
- `CLIM-14` การตรวจวัดค่าความเป็นกรด-ด่างของดิน (Soil pH & Nutrient Availability)

### 5.4 ด้านชีวมณฑลและสิ่งปกคลุมดิน (Biosphere Protocols  CLIM-15 ถึง CLIM-19)
- `CLIM-15` การสำรวจแหล่งเพาะพันธุ์ลูกน้ำยุงและการระบาดของโรค (Mosquito Larvae Habitat Survey)
- `CLIM-16` การสำรวจการเปลี่ยนแปลงของสิ่งปกคลุมดิน (Land Cover Classification & MUC)
- `CLIM-17` การศึกษาการผลิใบและผลัดใบของพรรณไม้ท้องถิ่น (Green-Up & Green-Down Phenology)
- `CLIM-18` การตรวจวัดชีวมวลและความสามารถในการกักเก็บคาร์บอน (Biomass & Carbon Sequestration)
- `CLIM-19` การตรวจวัดความหลากหลายทางชีวภาพและชนิดพันธุ์พืชเด่น (Biodiversity Index & Canopy Cover)

---

## 6. แนวปฏิบัติสำหรับการพัฒนาและดูแลรักษาระบบ (Maintenance & Best Practices)

1. **การซิงโครไนซ์ 2 โฟลเดอร์:**
   ระบบมี 2 โฟลเดอร์คู่ขนานใน XAMPP:
   - โฟลเดอร์หลัก: `/Applications/XAMPP/xamppfiles/htdocs/G4_Environment_Climate_Energy/globe2027/`
   - โฟลเดอร์คู่ขนาน: `/Applications/XAMPP/xamppfiles/htdocs/G4_Environment_Climate_Energy/10_Environmental_Energy/globe2027/`
   *กฎเหล็ก:* เมื่อมีการแก้ไขโค้ดใดๆ ต้องทำการคัดลอกทับ (Sync Mirror) ทั้งสองโฟลเดอร์ให้ตรงกันเสมอ พร้อมกำหนดสิทธิ์ไฟล์ `chmod -R 755` และ `database.db` เป็น `chmod 666`
2. **การอัปเดต Google Apps Script:**
   - โค้ดต้นฉบับอยู่ที่ `Code.gs`
   - หากมีการปรับ Schema ใน SQLite ต้องอัปเดต Header ใน `Code.gs` และรัน `initializeAllSheets` เพื่อให้โครงสร้างตรงกัน
3. **การส่งออกรายงาน CSV:**
   - ใช้ UTF-8 BOM (`0xEF, 0xBB, 0xBF`) เสมอใน PHP และ Apps Script เพื่อให้เปิดใน Microsoft Excel ภาษาไทยได้ถูกต้องโดยตัวอักษรไม่เป็นภาษาต่างดาว

---

## 7. สถาปัตยกรรมระบบการแจ้งเตือนและการสื่อสารอัตโนมัติ 3 มิติ (Automated Multi-Channel Notification Architecture)

เพื่อสร้างประสบการณ์ใช้งานที่ไร้รอยต่อ และช่วยให้ผู้บริหารโครงการสามารถติดตามการรับสมัครได้แบบทันท่วงที (Real-time Monitoring) ระบบได้วางโครงสร้างการแจ้งเตือนแบบ 3 มิติคู่ขนาน:

```
  ┌─────────────────────────────────────────────────────────────────┐
  │         ผู้สมัครส่งแบบฟอร์มลงทะเบียน (Registration Form)         │
  └───────────────────────────────┬─────────────────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
  │  แนวทางที่ 1 │         │  แนวทางที่ 2 │         │  แนวทางที่ 3 │
  │ Client Modal │         │  HTML Email  │         │ LINE Msg API │
  │ สรุปรหัส + QR│         │ หนังสือตอบรับ│         │ ยิงเข้า บอท  │
  └──────────────┘         └──────────────┘         └──────────────┘
```

### 7.1 มิติที่ 1: การตอบรับเชิงประจักษ์บนหน้าเว็บ (Client Real-time Feedback & LINE Community CTA)
- ทันทีที่ API ตอบกลับสถานะสำเร็จ หน้าต่าง SweetAlert2 จะปรากฏขึ้นแบบ Modal Overlay
- **ข้อมูลที่แสดง:** รหัสใบสมัครทางการ (`GLB-2570-xxx`), ชื่อสถานศึกษา, ครูผู้ประสานงาน, ป้ายสถานะ `รอพิจารณาคัดเลือก (Pending)`
- **LINE Community CTA:** ปุ่มสีเขียวมาตรฐาน LINE `👉 กดเข้าร่วมกลุ่ม LINE ทันที` (`https://line.me/ti/g/LEQsGLOBE2570`) สำหรับเปิดแอปพลิเคชัน LINE เข้าสู่กลุ่มครูเครือข่าย พร้อมภาพ QR Code และปุ่มกดดาวน์โหลดไฟล์ภาพ

### 7.2 มิติที่ 2: ระบบส่งอีเมลตอบรับอัตโนมัติ (Automated Official HTML Confirmation Email)
- รองรับการจัดส่งจากทั้ง 2 แบ็กเอนด์:
  - ฝั่ง PHP Server: ฟังก์ชัน `sendConfirmationEmailPHP($schoolData, $regCode)` ส่งผ่าน PHP `mail()` พร้อม Header UTF-8
  - ฝั่ง Google Apps Script: ฟังก์ชัน `sendConfirmationEmail_(data, regCode)` ผ่านบริการคลาวด์ `GmailApp.sendEmail()`
- **เทมเพลตอีเมล:** ดีไซน์โทนสีเขียวมรกต (`#065f46`) หัวจดหมายศูนย์วิทยาศาสตร์ มรภ.รำไพพรรณี ตารางสรุปข้อมูล 5 รายการ และปุ่มลิงก์เข้ากลุ่ม LINE ผู้ประสานงาน

### 7.3 มิติที่ 3: ระบบส่งการแจ้งเตือนผ่าน LINE Messaging API (Real-time LINE Broadcast)
- ใช้สถาปัตยกรรม LINE Messaging API ของ LINE Official Account
- **ค่าคอนฟิกูเรชันหลัก:**
  - `Channel ID`: `2012064163`
  - `Channel Secret`: `d30ec86a1a83a1c0f6712c57f0977458`
- **กลไกการทำงาน:**
  1. ส่ง HTTP POST ไปยัง `https://api.line.me/v2/oauth/accessToken` ด้วย grant type `client_credentials` เพื่อรับ Access Token แบบชั่วคราวที่มีความปลอดภัยสูงสุด
  2. จัดโครงสร้างข้อความสรุปข้อมูลโรงเรียนที่สมัครใหม่ (ชื่อโรงเรียน, จังหวัด, ครูแกนนำ, เบอร์โทร, ด้านที่ตรวจวัด, รหัสใบสมัคร)
  3. ยิง HTTP POST Broadcast Message ไปยัง `https://api.line.me/v2/bot/message/broadcast` ส่งผลให้ข้อความเด้งเตือนในมือถือของคณะทำงานที่ติดตามบอททันที

---

## 8. กระบวนการซิงโครไนซ์ข้อมูลสองทิศทางและขั้นตอน Go-Live เคลียร์ระบบ (Data Sync & Go-Live Protocol)

### 8.1 การดึงข้อมูลจากเว็บเซิร์ฟเวอร์เข้าสู่ Google Sheets (`syncSchoolsFromWebServer`)
- ในกรณีที่ระบบรับสมัครทำงานบนเว็บเซิร์ฟเวอร์ภายนอก (Apache/PHP) ข้อมูลจะถูกบันทึกใน SQLite ก่อน
- ผู้ดูแลระบบสามารถซิงก์ข้อมูลทั้งหมดเข้าสู่ Google Sheets ได้ด้วยคลิกเดียวผ่านเมนู:  
  **`🌱 LEQs-GLOBE 2570` > `🌐 5. ดึงข้อมูลใบสมัครจากเว็บไซต์ (Sync from Web Server)`**
- ฟังก์ชันจะเรียก `UrlFetchApp.fetch('https://scicenter.rbru.ac.th/globe2027/api/api.php?endpoint=schools')` และนำข้อมูลที่ยังไม่มีในแผ่นงาน `การรับสมัคร` มาเขียนต่อท้ายให้อัตโนมัติ

### 8.2 ระเบียบวิธีการเคลียร์ข้อมูลทดสอบเพื่อเปิดรับสมัครจริง (Go-Live Reset Protocol)
1. **การเคลียร์ใน Google Sheets:**  
   คลิกเมนู **`🌱 LEQs-GLOBE 2570` > `🧹 6. ล้างข้อมูลทดสอบทั้งหมดเพื่อเริ่มงานจริง (Reset All Sheets)`** ฟังก์ชัน `clearAllTestData()` จะลบเฉพาะแถวข้อมูลตั้งแต่แถวที่ 2 ลงไปในชีตทั้ง 6 มิติ โดยคงหัวตารางและสีพื้นหลังไว้ 100%
2. **การเคลียร์ในฐานข้อมูล SQLite บนเซิร์ฟเวอร์:**  
   เรียกใช้ Endpoint `api/api.php?endpoint=reset_database` ด้วยเมธอด `POST` และส่งรหัสผ่านแอดมิน `admin_password: LEQs@2570` ระบบจะสั่ง `DELETE` ข้อมูลใน 6 ตารางพร้อมรีเซ็ต `sqlite_sequence` เพื่อให้รหัสใบสมัครเริ่มต้นนับหนึ่งใหม่ที่ `GLB-2570-001`

