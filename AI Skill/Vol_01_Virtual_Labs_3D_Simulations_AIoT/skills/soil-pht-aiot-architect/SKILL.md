---
name: soil-pht-aiot-architect
description: >-
  สถาปัตยกรรมและมาตรฐานการพัฒนาแอปพลิเคชันเครื่องวัด pH ดินและพารามิเตอร์ดินอัจฉริยะ (SoilpHTxAI & Soil Parameter Edge AI Architect)
  ครอบคลุมการสื่อสารฮาร์ดแวร์ USB-C RS485 Modbus RTU, การป้องกันพอร์ตชนกัน (Port Claiming), ปัญญาประดิษฐ์ประมวลผลบนขอบ (Pure Dart Edge ML OLS Trainer),
  กล้องสมาร์ทวิชันตรวจวิเคราะห์หน้าดินพร้อม Geotagging, ระบบคลาวด์ Google Drive Sync, และการทดสอบสมมติฐานทางสถิติความแม่นยำสูง
---

# SoilpHTxAI & Soil Parameter Edge AI Architect

กรอบมาตรฐานสถาปัตยกรรมและระเบียบวิธีวิศวกรรมซอฟต์แวร์สำหรับการพัฒนาแอปพลิเคชันตรวจวัดและวิเคราะห์สุขภาพดินอัจฉริยะ ผสานรวมระบบสมองกลฝังตัว (AIoT), ปัญญาประดิษฐ์ประมวลผลบนขอบ (Edge ML), และการสื่อสารกับเซนเซอร์ภาคสนามมาตรฐานอุตสาหกรรม สังเคราะห์จากงานวิจัยพัฒนาเครื่องวัด pH ดินความแม่นยำสูง มหาวิทยาลัยราชภัฏรำไพพรรณี (โครงการวิจัยทุนอุดหนุนงบประมาณ 2569) โดย **อ.ธนพัฒน์ ถิระวุฒิ (สัดส่วน 50%), ผศ.ดร.ชีวะ ทัศนา (สัดส่วน 30%), รศ.ดร.นันทพร มูลรังษี (สัดส่วน 10%), และ รศ.ดร.นิภัทร เปี่ยมอรุณ (สัดส่วน 10%)**

---

## 1. ปรัชญาและมาตรฐานเชิงสถาปัตยกรรม (Architectural Philosophy)

ระบบ Soil AI Edge System ยึดถือหลักการออกแบบ 5 ประการ ได้แก่

1. **การบูรณาการหลักการแรกทางฟิสิกส์ (First-Principles Physics Foundation)**
   ใช้สมการเนิร์นสต์ (Nernst Equation) ร่วมกับการชดเชยอุณหภูมิทางอุณหพลศาสตร์ $S(T) = \frac{2.3026 R T}{F}$ เป็นฐานการคำนวณหลัก ก่อนส่งให้แบบจำลองปัญญาประดิษฐ์ชดเชยความคลาดเคลื่อนที่ไม่เป็นเชิงเส้น (Non-linear Error Compensation)
2. **การประมวลผลบนอุปกรณ์โดยไร้การพึ่งพาคลาวด์ (Pure Edge Autonomy)**
   การอนุมานผล (Inference) และการฝึกฝนแบบจำลอง (In-App Training) ทำงานด้วยภาษา Pure Dart 100% ภายในสมาร์ทโฟนโดยตรง เพื่อให้เกษตรกรและนักวิจัยใช้งานในแปลงเกษตรห่างไกลที่ไม่มีสัญญาณอินเทอร์เน็ตได้สมบูรณ์
3. **การบริหารจัดการพอร์ตฮาร์ดแวร์และการอยู่ร่วมกันของหลายแอปพลิเคชัน (Graceful Port Lifecycle Management)**
   จัดการการเชื่อมต่อ USB Serial ผ่าน `WidgetsBindingObserver` เพื่อปล่อยสิทธิ์พอร์ต (Release Port) เมื่อแอปพลิเคชันลงสู่พื้นหลัง และยึดพอร์ตกลับ (Claim Port) เมื่อขึ้นสู่เบื้องหน้า ป้องกันปัญหาแย่งทรัพยากรเมื่อมีแอปวัดดินหลายตัวในเครื่องเดียวกัน
4. **ความแม่นยำทางตำแหน่งและหลักฐานภาพถ่ายเชิงประจักษ์ (Geotagged Visual Evidence)**
   บันทึกภาพหน้าดินผ่านกล้องสมาร์ทวิชันที่มี Reticle นำสายตา พร้อมวางเลเยอร์ Telemetry HUD (pH, mV, Temp, Moisture) และพิกัดดาวเทียมจริง (Latitude, Longitude ทศนิยม 6 ตำแหน่ง) กำกับบนภาพถ่าย
5. **การเชื่อมประสานคลาวด์และการแลกเปลี่ยนข้อมูลแบบเปิด (Open Cloud & Drive Ingestion)**
   รองรับการส่งออกข้อมูลสอบเทียบและข้อมูลแปลงสำรวจในรูปแบบมาตรฐาน CSV และ JSON ผ่าน Android Native Share Sheet เพื่อส่งตรงเข้าสู่ Google Drive, Cloud API, หรือระบบสารสนเทศภูมิศาสตร์ (GIS)

---

## 2. ข้อมูลจำเพาะโปรโตคอลฮาร์ดแวร์เซนเซอร์ (Hardware Sensor Protocol)

### 2.1 โครงสร้างสายสัญญาณ USB-C RS485 Modbus RTU
* **Baud Rate:** 9600 bps
* **Data Bits:** 8 bits, **Parity:** None, **Stop Bits:** 1 bit
* **Slave Address:** `0x01`
* **Function Code:** `0x03` (Read Holding Registers)
* **Register Address:** `0x0000` (จำนวน 4 Registers รวม 8 Bytes)

### 2.2 โครงสร้างเฟรมคำสั่ง (Command Frame)
```
[0x01, 0x03, 0x00, 0x00, 0x00, 0x04, 0x44, 0x09]
 └──┬──┘ └──┬──┘ └────────┬────────┘ └────────┬────────┘
 Slave     Func      Start Reg & Qty        CRC-16
```

### 2.3 การถอดรหัสข้อมูลผลการวัด (Payload Parsing)
เมื่อได้รับเฟรมตอบกลับความยาว 13 ไบต์ `[0x01, 0x03, 0x08, D0, D1, D2, D3, D4, D5, D6, D7, CRC_L, CRC_H]`:
1. ตรวจสอบ CRC-16 Modbus (Polynomial `0xA001`, Initial `0xFFFF`)
2. ความชื้นในดิน (Moisture): `((D0 << 8) | D1) / 10.0` (% RH)
3. อุณหภูมิดิน (Temperature): `((D2 << 8) | D3) / 10.0` (°C)
4. การนำไฟฟ้าในดิน (EC): `((D4 << 8) | D5)` (µS/cm)
5. ความเป็นกรด-ด่าง (Soil pH): `((D6 << 8) | D7) / 100.0` (pH)

---

## 3. การแก้ปัญหาพอร์ตชนกันในระบบปฏิบัติการ Android (Multi-App USB Conflict Resolution)

### 3.1 การปลด Intent Filter เพื่อป้องกันแอปเปิดชนกัน
ในไฟล์ `AndroidManifest.xml` ต้อง **ลบ** หรือ **ไม่ประกาศ** intent-filter ประเภท `android.hardware.usb.action.USB_DEVICE_ATTACHED` ในทุกแอปพลิเคชัน เพื่อป้องกันระบบ Android เด้งถามและเปิดหลายแอปพร้อมกันเมื่อเสียบสาย USB-C

### 3.2 การจัดการวงจรชีวิตพอร์ตแบบ Foreground Claim / Background Release
นำ `WidgetsBindingObserver` ไปติดตั้งใน Main Navigation View:

```dart
@override
void didChangeAppLifecycleState(AppLifecycleState state) {
  super.didChangeAppLifecycleState(state);
  final vm = context.read<SoilPhtViewModel>();
  if (state == AppLifecycleState.resumed) {
    // ยึดพอร์ตและเริ่มอ่านค่าเมื่อแอปกลับมาเบื้องหน้า
    vm.connectUsb();
  } else if (state == AppLifecycleState.paused || state == AppLifecycleState.inactive) {
    // ปล่อยพอร์ตทันทีเมื่อสลับไปแอปอื่น เพื่อให้แอปถัดไปใช้งานต่อได้
    vm.disconnectUsb();
  }
}
```

---

## 4. สถาปัตยกรรมแบบจำลองปัญญาประดิษฐ์บนขอบ (Edge ML Architecture)

### 4.1 สมการชดเชยพหุนามที่ไม่เป็นเชิงเส้น (Polynomial Mapping Equation)
$$pH_{pred} = w_0 + w_1 E + w_2 T + w_3 (E \cdot T) + w_4 E^2 + w_5 T^2$$

### 4.2 ระบบคำนวณสมการปรกติบนอุปกรณ์ (Pure Dart Normal Equation Solver)
สร้างเมทริกซ์ $A = X^T X$ ขนาด $6 \times 6$ และเวกเตอร์ $B = X^T Y$ ขนาด $6 \times 1$ จากข้อมูลฝึกสอน $n$ จุด:
$$x_i = [1.0, E_i, T_i, E_i T_i, E_i^2, T_i^2]$$

แก้ระบบสมการ $A W = B$ ด้วยการขจัดแบบเกาส์เซียน (Gaussian Elimination with Partial Pivoting):
* เวลาคำนวณเฉลี่ยบนสมาร์ทโฟน: 80 - 150 มิลลิวินาที
* สัมประสิทธิ์การตัดสินใจ: $R^2 > 0.999$
* รองรับ Dynamic Weight Injection สลับระหว่างค่าน้ำหนักมาตรฐาน RBRU Baseline กับค่าน้ำหนักที่เทรนใหม่บนเครื่องได้แบบสด (Hot-Swapping)

---

## 5. การทดสอบและเกณฑ์มาตรฐานคุณภาพ (Quality & Testing Standards)

1. **Zero RenderFlex Overflow:** ทุกมุมมองต้องผ่านการทดสอบเรนเดอร์บนหน้าจอขนาด 320x568 (iPhone SE/ขนาดเล็ก), 360x640 (Android Compact), 393x852 (มาตรฐาน), และ 412x915 (Android หน้าจอยาว) โดยไม่มีการล้นจอเด็ดขาด
2. **Static Code Analysis:** รหัสผ่านการตรวจสอบ `flutter analyze` โดยต้องรายงาน **No issues found!** เสมอ
3. **Automated Unit & Protocol Tests:** ต้องครอบคลุมการทดสอบคำนวณ CRC-16, การแยกแพ็กเก็ต Modbus RTU, การคำนวณสมการเนิร์นสต์, และการลู่เข้าของ OLS Normal Equation

---

## 6. คำสั่งสำคัญสำหรับนักพัฒนา (Essential Developer Commands)

* **ตรวจสอบความถูกต้องของซอร์สโค้ด:**
  ```bash
  /Users/chewathassana/flutter/bin/flutter analyze
  ```
* **รันชุดทดสอบระบบทั้งหมด:**
  ```bash
  /Users/chewathassana/flutter/bin/flutter test
  ```
* **คอมไพล์ APK และติดตั้งลงเครื่องทดสอบผ่าน USB Debugging:**
  ```bash
  /Users/chewathassana/flutter/bin/flutter build apk --debug
  adb -s <DEVICE_ID> install -r build/app/outputs/flutter-apk/app-debug.apk
  ```
* **เปิดแอปพลิเคชันบนสมาร์ทโฟน:**
  ```bash
  adb -s <DEVICE_ID> shell monkey -p com.rbru.soilphtxai.soil_pht_x_ai -c android.intent.category.LAUNCHER 1
  ```

---

## 7. มาตรฐานการออกแบบอัตลักษณ์และ App Icon ทดแทนไอคอนเดิม (Custom Icon Requirement)

* **ห้ามใช้ไอคอนเริ่มต้นของ Flutter เด็ดขาด:** ทุกโปรเจกต์ต้องจัดทำภาพไอคอนเฉพาะตัว (Domain-Specific Icon) ความละเอียด 1024x1024 px สะท้อนภาพลักษณ์ของเซนเซอร์เกษตรอัจฉริยะ โดรน หรืออุปกรณ์ตรวจวัด
* **โครงสร้างชุดไอคอนมาตรฐาน:**
  * Master Asset: `assets/icons/app_icon.png` (1024x1024 px แบบ Edge-to-Edge)
  * Android Mipmaps: ครอบคลุมตั้งแต่ `mipmap-mdpi` จนถึง `mipmap-xxxhdpi` (ทั้งแบบมาตรฐานและ `ic_launcher_round.png`)
  * iOS AppIcon: รองรับชุดไอคอนตั้งแต่ 20x20 จนถึง 1024x1024 px ใน `Assets.xcassets/AppIcon.appiconset`
  * Web / Favicon: `favicon.ico`, `favicon-32x32.png`, `apple-touch-icon.png`, `Icon-192.png`, `Icon-512.png`
* **การติดตั้งและคอนฟิกูเรชันอัตโนมัติ:**
  กำหนดค่าใน `pubspec.yaml` ด้วย `flutter_launcher_icons` พร้อมรัน `dart run flutter_launcher_icons` และลงทะเบียนโฟลเดอร์ `assets/icons/`
* **การผสานอัตลักษณ์ใน UI:**
  นำไอคอนมาแสดงผลในส่วน Header ของ Dashboard, Status Bar และหน้าต่างข้อมูลแอปพลิเคชัน เพื่อตอกย้ำความเป็นมืออาชีพระดับสากล

---
*เอกสารนี้จัดทำขึ้นโดย ผศ.ดร.ชีวะ ทัศนา หน่วยวิจัยปัญญาประดิษฐ์เพื่อเกษตรดิจิทัล คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏรำไพพรรณี*
