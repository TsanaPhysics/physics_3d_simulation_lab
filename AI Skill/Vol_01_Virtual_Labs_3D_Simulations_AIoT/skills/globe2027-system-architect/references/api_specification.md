# ข้อกำหนดและสถาปัตยกรรม REST API ระบบ GLOBE2027 (API Specification)

คู่มือการเชื่อมต่อ REST API ระหว่างไคลเอนต์ (Web/Mobile Portal), เซิร์ฟเวอร์ภายใน (PHP SQLite3), และคลาวด์เกตเวย์ (Google Apps Script)

---

## 1. Local PHP API (`api/api.php`)

### 1.1 Base URL & Headers
- **Local Endpoint:** `http://localhost/G4_Environment_Climate_Energy/globe2027/api/api.php`
- **Headers:** `Content-Type: application/json; charset=utf-8`

### 1.2 Endpoints Summary

#### 1. สรุปภาพรวมและตัวชี้วัด (KPIs)
- **Method:** `GET`
- **Query:** `?endpoint=kpi`
- **Response Format:**
```json
{
  "success": true,
  "kpi": {
    "target_schools": 8,
    "registered_schools": 2,
    "small_schools": 1,
    "target_small_schools": 2,
    "total_teachers": 11,
    "target_teachers": 40,
    "total_students": 45,
    "target_students": 160,
    "target_budget": 80000,
    "allocated_budget": 20000,
    "by_status": {
      "pending": 1,
      "confirmed": 1,
      "completed": 0,
      "cancelled": 0
    }
  }
}
```

#### 2. การจัดการข้อมูลโรงเรียน (`schools`)
- **GET All / Filter:** `?endpoint=schools&q=วัดท่าใหม่&status=confirmed`
- **POST Create:** `?endpoint=schools` (ส่ง Body เป็น JSON รายละเอียดโรงเรียน)
- **POST Update Status:** `?endpoint=schools&action=update_status` (ส่ง Body `{"id": 1, "status": "confirmed"}`)
- **POST Update Data:** `?endpoint=schools&action=update` (ส่ง Body แก้ไขข้อมูลโรงเรียน)
- **POST Delete:** `?endpoint=schools&action=delete` (ส่ง Body `{"id": 1}`)

#### 3. ข้อมูลตรวจวัดภาคสนาม (`survey_entries`)
- **GET Surveys:** `?endpoint=survey_entries&school_id=1&sphere=atmosphere`
- **POST New Survey:** `?endpoint=survey_entries`
  ```json
  {
    "school_id": 1,
    "activity_code": "CLIM-01",
    "sphere": "atmosphere",
    "observed_at": "2026-10-17 10:30:00",
    "latitude": 12.6095,
    "longitude": 102.1032,
    "observer_name": "ด.ช.ธนกฤต แจ่มใส",
    "data_payload": {
      "surface_temp_c": 31.5,
      "air_temp_c": 30.2,
      "humidity_pct": 68.0,
      "cloud_cover": "scattered"
    },
    "photo_url": "https://..."
  }
  ```
- **POST Verify Survey:** `?endpoint=survey_entries&action=verify` (`{"id": 10, "status": "verified"}`)

#### 4. การวัดผล Pre-Test / Post-Test (`exams`)
- **GET Questions:** `?endpoint=exams&sphere=pedosphere`
- **GET Stats:** `?endpoint=exams&action=stats`
- **POST Submit Exam:** `?endpoint=exams&action=submit`
  ```json
  {
    "school_id": 1,
    "participant_name": "ครูสมศรี เจริญพร",
    "participant_type": "teacher",
    "exam_type": "post-test",
    "answers": {
      "1": 0,
      "2": 2,
      "3": 1
    }
  }
  ```

#### 5. แบบประเมินความพึงพอใจ (`evaluations`)
- **GET Summary:** `?endpoint=evaluations`
- **POST Evaluation:** `?endpoint=evaluations`
  ```json
  {
    "school_id": 1,
    "evaluator_name": "ครูสมศรี เจริญพร",
    "evaluator_role": "ครูแกนนำ",
    "rating_content": 5,
    "rating_mentor": 5,
    "rating_facility": 5,
    "rating_overall": 5,
    "suggestions": "ระบบใช้งานง่ายมาก อยากให้จัดกิจกรรมต่อเนื่องทุกปี"
  }
  ```

#### 6. ระบบเกียรติบัตรอิเล็กทรอนิกส์ SHA-256 (`certificates`)
- **GET Verification:** `?endpoint=certificates&code=CERT-GLOBE-2570-0001`
- **POST Issue Certificate:** `?endpoint=certificates`
  ```json
  {
    "school_id": 1,
    "recipient_name": "ครูสมศรี เจริญพร",
    "recipient_role": "ครูแกนนำ",
    "cert_title": "ผ่านการอบรมเชิงปฏิบัติการวิทยาศาสตร์สิ่งแวดล้อม GLOBE ประจำปี 2570",
    "issue_date": "2026-10-17"
  }
  ```

---

#### 7. การล้างข้อมูลทดสอบเพื่อเปิดรับสมัครจริง (`reset_database`)
- **Method:** `POST`
- **Query:** `?endpoint=reset_database`
- **Request Body:**
  ```json
  {
    "admin_password": "LEQs@2570"
  }
  ```
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "ล้างข้อมูลทดสอบทั้งหมดเรียบร้อยแล้ว ฐานข้อมูลสะอาดพร้อมเริ่มรับสมัครจริง รหัสจะเริ่มต้นที่ GLB-2570-001"
  }
  ```

#### 8. การแจ้งเตือน LINE Messaging API & Email อัตโนมัติ (Triggered on Registration)
- **Trigger:** เรียกใช้อัตโนมัติเมื่อมีการ `POST ?endpoint=schools` สำเร็จ
- **LINE Broadcast Endpoint:** `POST https://api.line.me/v2/bot/message/broadcast`
  - `Header:` `Authorization: Bearer <accessToken>` (ขอจาก OAuth `client_credentials`)
  - `Body:` ข้อความสรุปใบสมัครส่งไปยังผู้ติดตามบอท (Channel ID `2012064163`)
- **Confirmation Email:** ส่งหนังสือยืนยันรูปแบบ HTML สวยงามไปยังอีเมลของผู้สมัคร

---

## 2. Cloud Google Apps Script Web App API (`Code.gs`)

### 2.1 GET Requests (`doGet`)
- `?api=dashboard` : เรียกข้อมูล KPIs สรุปผลจากทุก Sheet
- `?api=schools` : รายชื่อโรงเรียนและสถานะการคัดเลือก
- `?api=surveys` : ข้อมูลสำรวจภาคสนามพร้อม JSON Payload
- `?api=exams` : ผลคะแนนและการทดสอบความรู้
- `?api=evaluations` : ค่าเฉลี่ยความพึงพอใจ 5 ดาว
- `?api=certificates` : ตรวจสอบข้อมูลเกียรติบัตรผ่าน SHA-256
- `?api=research` : คลังผลงานวิจัยเยาวชน

### 2.2 POST Requests (`doPost`)
- `action=submit_application` : บันทึกใบสมัครโรงเรียนใหม่ (ส่งอีเมลตอบรับอัตโนมัติ + ยิง LINE Broadcast)
- `action=submit_survey` : บันทึกข้อมูลสำรวจภาคสนาม
- `action=submit_exam` : ส่งผลการทดสอบ Pre/Post-Test
- `action=submit_eval` : ส่งแบบประเมินความพึงพอใจ
- `action=issue_cert` : ออกเกียรติบัตรและสแตมป์ SHA-256 Hash
- `action=submit_research` : ส่งผลงานโครงงานวิจัยเยาวชน

### 2.3 Web Server Synchronization Function (`syncSchoolsFromWebServer`)
- เรียกดึงข้อมูล JSON จาก `https://scicenter.rbru.ac.th/globe2027/api/api.php?endpoint=schools`
- ตรวจสอบ `existingCodes` และ `existingNames` เพื่อป้องกันการบันทึกซ้ำ
- นำข้อมูลสถานศึกษาที่เพิ่งลงทะเบียนมาเขียนลงแผ่นงาน `การรับสมัคร` อัตโนมัติ
