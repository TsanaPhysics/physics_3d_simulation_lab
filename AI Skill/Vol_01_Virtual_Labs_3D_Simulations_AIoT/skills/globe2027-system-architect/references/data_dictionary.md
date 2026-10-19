# พจนานุกรมข้อมูลระบบ LEQs-GLOBE RBRU 2570 (Data Dictionary)

เอกสารระบุข้อมูลจำเพาะเชิงเทคนิคของตารางฐานข้อมูลและแผ่นงาน Google Sheets ทั้ง 6 มิติ ตามมาตรฐานสถาปัตยกรรมระบบสารสนเทศสิ่งแวดล้อม มหาวิทยาลัยราชภัฏรำไพพรรณี

---

## 1. ตารางข้อมูลโรงเรียนเครือข่าย (`schools` / `การรับสมัคร`)

| ฟิลด์ (SQLite) | คอลัมน์ (Google Sheets) | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `id` | - | INTEGER | PRIMARY KEY AUTOINCREMENT | ลำดับอ้างอิงภายในระบบ |
| `reg_code` | รหัสใบสมัคร | TEXT (VARCHAR 20) | UNIQUE, NOT NULL | รหัสระบุใบสมัคร เช่น `GLB-2570-001` |
| `school_name` | ชื่อโรงเรียน | TEXT (VARCHAR 255) | NOT NULL | ชื่อสถานศึกษาอย่างเป็นทางการ |
| `province` | จังหวัด | TEXT (VARCHAR 100) | NOT NULL | จังหวัดที่ตั้งสถานศึกษา |
| `school_level` | ระดับชั้นที่เข้าร่วม | TEXT (VARCHAR 100) | NOT NULL | ช่วงชั้นการศึกษาที่เข้าร่วมโครงการ |
| `school_size` | ขนาดโรงเรียน | TEXT (VARCHAR 20) | DEFAULT 'regular' | `small` (โรงเรียนขนาดเล็ก) หรือ `regular` (โรงเรียนทั่วไป) |
| `teacher_name` | ชื่อครูผู้ประสานงาน | TEXT (VARCHAR 255) | NOT NULL | ชื่อ-นามสกุลครูแกนนำผู้รับผิดชอบโครงการ |
| `phone` | เบอร์โทรศัพท์ | TEXT (VARCHAR 50) | NOT NULL | เบอร์โทรศัพท์ติดต่อที่ใช้งานจริง |
| `email` | Email/Line | TEXT (VARCHAR 150) | NULLABLE | อีเมลติดต่อ |
| `line_id` | Email/Line | TEXT (VARCHAR 100) | NULLABLE | LINE ID สำหรับสื่อสารในกลุ่มเครือข่าย |
| `teacher_count` | ความพร้อมส่งครู (5 คน) | INTEGER | DEFAULT 5 | จำนวนครูแกนนำที่ส่งเข้ารับการอบรม (เป้าหมาย 5 คน) |
| `student_count` | ความพร้อมนักเรียน (20 คน) | INTEGER | DEFAULT 20 | จำนวนนักเรียนแกนนำที่ส่งเข้าร่วม (เป้าหมาย 20 คน) |
| `spheres` | ด้านที่สนใจ (Protocols) | TEXT | NOT NULL | ทรงกลมสิ่งแวดล้อมที่เลือกศึกษา (คั่นด้วยจุลภาค) |
| `climate_activities` | รูปแบบผลงานที่เลือก | TEXT / INTEGER | DEFAULT 2 | จำนวนหรือรายชื่อกิจกรรม Climate Change ที่เลือกปฏิบัติการ |
| `expected_data_entries` | - | INTEGER | DEFAULT 20 | จำนวนชุดข้อมูลตรวจวัดภาคสนามเป้าหมาย (อย่างน้อย 20 ชุด) |
| `note` | ประเด็นปัญหาท้องถิ่น / ความต้องการ | TEXT | NULLABLE | หมายเหตุ ประเด็นปัญหาสิ่งแวดล้อมท้องถิ่น หรือความคาดหวัง |
| `status` | สถานะการคัดเลือก | TEXT (VARCHAR 20) | DEFAULT 'pending' | `pending` (รอพิจารณา), `confirmed` (ผ่านคัดเลือก 8 โรงเรียน), `completed`, `cancelled` |
| `created_at` | ประทับเวลา | TIMESTAMP | CURRENT_TIMESTAMP | วันและเวลาที่ส่งข้อมูลเข้าระบบ |

---

## 2. ตารางข้อมูลตรวจวัดภาคสนาม (`survey_entries` / `ข้อมูลสำรวจภาคสนาม`)

| ฟิลด์ (SQLite) | คอลัมน์ (Google Sheets) | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `id` | ID_สำรวจ | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสชุดข้อมูลตรวจวัดภาคสนาม |
| `school_id` | ชื่อโรงเรียน | INTEGER | FOREIGN KEY -> schools(id) | รหัสเชื่อมโยงโรงเรียนผู้บันทึกข้อมูล |
| `activity_code` | รหัสกิจกรรม | TEXT (VARCHAR 20) | NOT NULL | รหัสกิจกรรมมาตรฐาน เช่น `CLIM-01` ถึง `CLIM-19` |
| `sphere` | ทรงกลม (Sphere) | TEXT (VARCHAR 50) | NOT NULL | `atmosphere`, `hydrosphere`, `pedosphere`, `biosphere` |
| `observed_at` | วันเวลาที่ตรวจวัด | DATETIME | NOT NULL | วันและเวลาที่ลงพื้นที่เก็บข้อมูลจริง |
| `latitude` | ละติจูด (Lat) | REAL (DECIMAL 10,6) | NOT NULL | พิกัดภูมิศาสตร์ละติจูด (GPS Decimal Degrees) |
| `longitude` | ลองจิจูด (Lng) | REAL (DECIMAL 10,6) | NOT NULL | พิกัดภูมิศาสตร์ลองจิจูด (GPS Decimal Degrees) |
| `observer_name` | ชื่อผู้ตรวจวัด | TEXT (VARCHAR 255) | NOT NULL | ชื่อครูหรือนักเรียนผู้รับผิดชอบการอ่านค่า |
| `data_payload` | ข้อมูลตรวจวัด (JSON) | TEXT (JSON) | NOT NULL | ค่าพารามิเตอร์ตรวจวัดตามโปรโตคอล (จัดเก็บแบบ JSON Payload) |
| `photo_url` | ลิงก์รูปภาพ | TEXT (VARCHAR 500) | NULLABLE | ที่อยู่ไฟล์ภาพถ่ายหลักฐานเชิงประจักษ์ภาคสนาม |
| `status` | สถานะการรับรอง | TEXT (VARCHAR 20) | DEFAULT 'verified' | `pending`, `verified` (รับรองผลแล้ว), `flagged` (ผิดปกติ) |

---

## 3. ตารางการวัดผล Pre-Test / Post-Test (`exam_attempts` / `การวัดผล_PrePostTest`)

| ฟิลด์ (SQLite) | คอลัมน์ (Google Sheets) | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `id` | ID_ผลสอบ | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสการส่งกระดาษคำตอบ |
| `school_id` | ชื่อโรงเรียน | INTEGER | FOREIGN KEY -> schools(id) | โรงเรียนต้นสังกัดของผู้สอบ |
| `participant_name` | ชื่อผู้เข้าสอบ | TEXT (VARCHAR 255) | NOT NULL | ชื่อ-นามสกุลครูหรือนักเรียน |
| `participant_type` | สถานะผู้สอบ | TEXT (VARCHAR 50) | DEFAULT 'student' | `teacher` (ครูแกนนำ) หรือ `student` (นักเรียน) |
| `exam_type` | ประเภทการสอบ | TEXT (VARCHAR 50) | NOT NULL | `pre-test` (ก่อนอบรม) หรือ `post-test` (หลังอบรม) |
| `score` | คะแนนที่ได้ | INTEGER | NOT NULL | จำนวนข้อที่ตอบถูกต้อง |
| `total_questions` | คะแนนเต็ม | INTEGER | DEFAULT 20 | จำนวนข้อสอบทั้งหมดในชุด |
| - | คิดเป็นร้อยละ (%) | REAL | COMPUTED | ร้อยละของคะแนนสอบ `(score / total) * 100` |
| `answers_detail` | รายละเอียดคำตอบ (JSON)| TEXT (JSON) | NULLABLE | รายละเอียดบันทึกการตอบรายข้อ |
| `created_at` | ประทับเวลา | TIMESTAMP | CURRENT_TIMESTAMP | วันและเวลาที่ส่งกระดาษคำตอบ |

---

## 4. ตารางแบบประเมินความพึงพอใจ (`eval_responses` / `การประเมินความพึงพอใจ`)

| ฟิลด์ (SQLite) | คอลัมน์ (Google Sheets) | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `id` | ID_ประเมิน | INTEGER | PRIMARY KEY AUTOINCREMENT | ลำดับการประเมินผล |
| `school_id` | ชื่อโรงเรียน | INTEGER | FOREIGN KEY -> schools(id) | โรงเรียนของผู้ประเมิน |
| `evaluator_name` | ชื่อผู้ประเมิน | TEXT (VARCHAR 255) | NOT NULL | ชื่อ-นามสกุลของผู้ตอบแบบประเมิน |
| `evaluator_role` | บทบาท | TEXT (VARCHAR 50) | DEFAULT 'teacher' | บทบาทหน้าที่ เช่น ครูแกนนำ นักเรียนแกนนำ ผู้บริหาร |
| `rating_content` | 1.ด้านเนื้อหาหลักสูตร (5)| INTEGER | CHECK (1-5) | ระดับความพึงพอใจด้านเนื้อหาและการจัดกิจกรรม (1 ถึง 5 ดาว) |
| `rating_mentor` | 2.ด้านวิทยากร/พี่เลี้ยง (5)| INTEGER | CHECK (1-5) | ระดับความพึงพอใจด้านวิทยากรและทีมพี่เลี้ยง มรภ.รำไพพรรณี |
| `rating_facility`| 3.ด้านระบบ/อุปกรณ์ (5) | INTEGER | CHECK (1-5) | ระดับความพึงพอใจด้านอุปกรณ์เครื่องมือและระบบแอปพลิเคชัน |
| `rating_overall` | 4.ภาพรวมโครงการ (5) | INTEGER | CHECK (1-5) | ระดับความพึงพอใจต่อภาพรวมความคุ้มค่าและประโยชน์ |
| `suggestions` | ข้อเสนอแนะเพิ่มเติม | TEXT | NULLABLE | ข้อเสนอแนะเชิงสร้างสรรค์เพื่อการปรับปรุงในอนาคต |
| `created_at` | ประทับเวลา | TIMESTAMP | CURRENT_TIMESTAMP | วันเวลาที่บันทึกผลการประเมิน |

---

## 5. ตารางทะเบียนเกียรติบัตร (`cert_records` / `ทะเบียนเกียรติบัตร`)

| ฟิลด์ (SQLite) | คอลัมน์ (Google Sheets) | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `id` | - | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสระเบียนทะเบียน |
| `cert_code` | รหัสเกียรติบัตร | TEXT (VARCHAR 50) | UNIQUE, NOT NULL | รหัสเกียรติบัตร เช่น `CERT-GLOBE-2570-0001` |
| `school_id` | โรงเรียน | INTEGER | FOREIGN KEY -> schools(id) | โรงเรียนของผู้รับเกียรติบัตร |
| `recipient_name` | ชื่อ-นามสกุล | TEXT (VARCHAR 255) | NOT NULL | ชื่อ-สกุลผู้ได้รับเกียรติบัตร |
| `recipient_role` | บทบาท | TEXT (VARCHAR 100) | NOT NULL | บทบาท เช่น ครูผู้สอน, นักเรียนแกนนำ |
| `cert_title` | หลักสูตร/กิจกรรม | TEXT (VARCHAR 255) | NOT NULL | ชื่อหลักสูตรการอบรมหรือประเภทผลงาน |
| `issue_date` | วันที่ออกเอกสาร | DATE | NOT NULL | วันที่ออกวุฒิบัตรอย่างเป็นทางการ |
| `verification_hash`| SHA-256 Hash | TEXT (VARCHAR 64) | NOT NULL | รหัสแฮชความปลอดภัย SHA-256 ป้องกันการปลอมแปลง |
| - | ลิงก์ตรวจสอบ QR | TEXT (URL) | COMPUTED | ลิงก์สำหรับสแกนตรวจสอบความถูกต้องผ่านระบบออนไลน์ |
| `status` | สถานะ | TEXT (VARCHAR 20) | DEFAULT 'active' | สถานะการใช้งานของเกียรติบัตร |

---

## 6. ตารางคลังโครงงานวิจัยเยาวชน (`research_projects` / `โครงงานวิจัยเยาวชน`)

| ฟิลด์ (SQLite) | คอลัมน์ (Google Sheets) | ชนิดข้อมูล | เงื่อนไข | คำอธิบาย |
| :--- | :--- | :--- | :--- | :--- |
| `id` | ID_โครงงาน | INTEGER | PRIMARY KEY AUTOINCREMENT | รหัสประจำโครงงานวิจัย |
| `school_id` | ชื่อโรงเรียน | INTEGER | FOREIGN KEY -> schools(id) | โรงเรียนผู้จัดทำโครงงาน |
| `sphere` | ทรงกลมสิ่งแวดล้อม | TEXT (VARCHAR 50) | NOT NULL | `atmosphere`, `hydrosphere`, `pedosphere`, `biosphere` |
| `title_th` | ชื่อโครงงาน (ภาษาไทย) | TEXT (VARCHAR 255) | NOT NULL | ชื่อโครงงานวิจัยภาษาไทย |
| `title_en` | ชื่อโครงงาน (ภาษาอังกฤษ)| TEXT (VARCHAR 255) | NULLABLE | ชื่อโครงงานวิจัยภาษาอังกฤษ |
| `authors` | คณะผู้วิจัย (นักเรียน) | TEXT | NOT NULL | รายชื่อนักเรียนผู้จัดทำโครงงาน |
| `advisors` | ครูที่ปรึกษา | TEXT | NOT NULL | รายชื่อครูที่ปรึกษาโครงงาน |
| `abstract` | บทคัดย่อ (Abstract) | TEXT | NOT NULL | บทคัดย่อสรุปวัตถุประสงค์ วิธีการ และผลการวิจัย |
| `poster_url` | ลิงก์โปสเตอร์/PDF | TEXT (URL) | NULLABLE | ที่อยู่ไฟล์โปสเตอร์นำเสนอผลงานวิชาการ |
| `paper_pdf_url` | ลิงก์โปสเตอร์/PDF | TEXT (URL) | NULLABLE | ที่อยู่ไฟล์รายงานวิจัยฉบับสมบูรณ์ (PDF) |
| `video_clip_url`| ลิงก์คลิปวิดีโอ YouTube | TEXT (URL) | NULLABLE | ลิงก์คลิปวิดีโอการนำเสนอผลงานบน YouTube |
| `award_status` | รางวัล/สถานะ | TEXT (VARCHAR 100) | DEFAULT 'อยู่ระหว่างพิจารณา'| ผลการประกวดรางวัลระดับเขต สสวท. หรือมหาวิทยาลัย |

---

## 7. โครงสร้างข้อมูลการแจ้งเตือนและการล้างระบบ (Notification & System Reset Specifications)

### 7.1 โครงสร้างข้อมูลส่งออกการแจ้งเตือนอัตโนมัติ (Automated Notification Payload)

| ฟิลด์ข้อมูล | ชนิดข้อมูล | ตัวอย่างค่า | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `reg_code` | STRING | `GLB-2570-001` | รหัสใบสมัครอ้างอิงของสถานศึกษา |
| `school_name` | STRING | `โรงเรียนตัวอย่างวิทยา` | ชื่อสถานศึกษา |
| `province` | STRING | `จันทบุรี` | จังหวัดที่ตั้งโรงเรียน |
| `teacher_name` | STRING | `นายสมบูรณ์ ใจดี` | ชื่อครูผู้ประสานงานหลัก |
| `phone` | STRING | `0812345678` | เบอร์โทรศัพท์ครูผู้ประสานงาน |
| `email` | STRING | `teacher@example.com` | อีเมลสำหรับจัดส่งหนังสือตอบรับอัตโนมัติ |
| `teacher_count` | INTEGER | `5` | จำนวนครูแกนนำที่ส่งเข้าร่วม |
| `student_count` | INTEGER | `20` | จำนวนนักเรียนแกนนำที่ส่งเข้าร่วม |
| `spheres` | STRING | `atmosphere, biosphere` | ด้านสิ่งแวดล้อมที่สนใจศึกษา |
| `line_openchat_url` | URL | `https://line.me/ti/g/LEQsGLOBE2570` | ลิงก์กลุ่มเครือข่ายครูโครงการ LEQs-GLOBE 2570 |

### 7.2 โครงสร้างพารามิเตอร์คำสั่งล้างข้อมูลระบบ (System Reset Parameters)

| พารามิเตอร์ | ชนิดข้อมูล | ค่าที่กำหนด | คำอธิบาย |
| :--- | :--- | :--- | :--- |
| `action` | STRING | `reset_database` | คำสั่ง Endpoint ในการตัดตอนและรีเซ็ตฐานข้อมูล |
| `confirm_reset`| BOOLEAN | `true` | ยืนยันความยินยอมในการล้างข้อมูลเพื่อเริ่มงานจริง |
| `secret_key` | STRING | `LEQs-GLOBE-2027-RESET` | กุญแจความปลอดภัยยืนยันสิทธิ์ผู้ดูแลระบบ |
