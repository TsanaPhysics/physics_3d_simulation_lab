---
name: flutter-app-architect
description: >-
  สถาปัตยกรรมและมาตรฐานการออกแบบ พัฒนา และเขียนโค้ด Flutter Application ระดับมืออาชีพ (Flutter App Architect & Custom Icon Masterclass)
  ครอบคลุมโครงสร้าง Clean Architecture (MVVM/Provider), การจัดทำภาพไอคอนแอปเฉพาะทาง (Custom App Icon Pipeline) ทดแทนไอคอนเดิมของ Flutter,
  การรองรับหน้าจอ Multi-Screen Responsive ไร้ RenderFlex Overflow, การควบคุมคุณภาพ Static Code Analysis (0 errors/0 warnings),
  และการบิลด์ติดตั้งทดสอบจริงบนสมาร์ทโฟน Android/iOS
---

# 🚀 Flutter Application Architect & Custom Icon Masterclass

กรอบการทำงานและมาตรฐานวิศวกรรมซอฟต์แวร์สำหรับการออกแบบและพัฒนาแอปพลิเคชันด้วย **Flutter & Dart** ระดับโปรดักชัน มุ่งเน้นความสวยงาม ประสิทธิภาพสูง เสถียรภาพ และอัตลักษณ์ของแบรนด์ (Visual Brand Identity) ที่สมบูรณ์แบบ โดยกำหนดให้ **ต้องออกแบบและสร้างไอคอนแอปพลิเคชันใหม่ (Custom App Icon) ทดแทนไอคอนสีฟ้าเริ่มต้นของ Flutter เสมอ** ในทุกแอปพลิเคชันที่สร้างขึ้น

---

## 🎯 เมื่อใดที่ต้องเปิดใช้งานสกิลนี้ (When to Activate)
เปิดใช้งานสกิลนี้ทันทีเมื่อ:
1. ผู้ใช้ต้องการเริ่มต้นสร้างโปรเจกต์ Flutter ใหม่ หรือพัฒนาแอปพลิเคชันมือถือ (Android/iOS)
2. ผู้ใช้ต้องการปรับปรุงโครงสร้างสถาปัตยกรรม (Refactor) ของแอป Flutter เดิมให้เป็นระเบียบ
3. มีการสั่งให้พัฒนาแอปพลิเคชัน IoT, การเกษตรอัจฉริยะ, โดรน, เครื่องมือวิทยาศาสตร์, หรือระบบแสดงผลเซนเซอร์
4. ต้องการออกแบบภาพและสร้างชุดไอคอนแอปพลิเคชัน (Custom App Icon) สำหรับติดตั้งบนสมาร์ทโฟน

---

## 🎨 1. กฎเหล็ก: การออกแบบและสร้าง App Icon ทดแทนไอคอนเดิม (Custom Icon Requirement)

> [!IMPORTANT]
> **กฎเหล็ก (Golden Rule):** ห้ามส่งมอบ หรือนำเสนอแอปพลิเคชัน Flutter ด้วยไอคอนเริ่มต้นสีฟ้าของ Flutter (`flutter_logo` / default `ic_launcher`) โดยเด็ดขาด ทุกโปรเจกต์ต้องผ่านขั้นตอนการออกแบบและสร้างชุดไอคอนเฉพาะตัว (Domain-Specific Custom App Icon) ที่ตรงกับธีมและวัตถุประสงค์ของแอปเสมอ

### ขั้นตอนที่ 1.1: สร้างภาพไอคอนมาสเตอร์ความละเอียดสูง (1024x1024 Master Icon)
ใช้เครื่องมือ `generate_image` สร้างภาพไอคอนขนาด 1024x1024 px โดยใช้โครงสร้าง Prompt มาตรฐาน:
* **Subject:** ระบุตัวแทนฮาร์ดแวร์หรือแกนหลักของแอป (เช่น Quadcopter Drone, Soil pH Sensor, Microscope, Laser Spectrometer)
* **Domain Elements:** ผสานสัญลักษณ์เฉพาะทาง (เช่น Glowing Agri Leaf, Telemetry HUD Rings, Precision Farm Grid, Circuit Traces)
* **Color Palette:** สอดคล้องกับ `AppTheme` ของแอป (เช่น Dark Obsidian `#070A12`, Neon Cyan `#00F0FF`, Neon Green `#00FF88`, Crimson Red `#FF3366`)
* **Composition:** วางวัตถุหลักไว้ตรงกลาง (Center Aligned) ภายใน Safe Zone 72-80% พื้นหลังเต็มผืนแบบ Edge-to-Edge ไม่มีตัวอักษร ไม่มีลายน้ำ

### ขั้นตอนที่ 1.2: รันสคริปต์สร้างชุดไอคอนทุกแพลตฟอร์มอัตโนมัติ (Automated Generation)
เรียกใช้สคริปต์อัตโนมัติที่อยู่ในสกิลนี้เพื่อแปลงภาพมาสเตอร์เป็นไอคอนทุกขนาด พร้อมอัปเดตไฟล์คอนฟิกูเรชันทันที:

```bash
python3 /Users/chewathassana/.gemini/config/skills/flutter-app-architect/scripts/generate_icons.py \
  --project-path "/path/to/flutter_project" \
  --icon-source "/path/to/master_icon.png" \
  --app-name "My App Title"
```

สิ่งที่สคริปต์จะดำเนินการให้อัตโนมัติ:
1. บันทึก Master Icon ใน `assets/icons/app_icon.png` (พร้อมไฟล์ขอบมน `app_icon_round.png` และโปร่งใส `app_icon_transparent.png`)
2. สร้างไอคอน Android Mipmap ทั้งแบบสี่เหลี่ยมและแบบกลม (`ic_launcher.png`, `ic_launcher_round.png`) ครบทุกความหนาแน่น:
   - `mipmap-mdpi` (48x48)
   - `mipmap-hdpi` (72x72)
   - `mipmap-xhdpi` (96x96)
   - `mipmap-xxhdpi` (144x144)
   - `mipmap-xxxhdpi` (192x192)
3. สร้างชุด iOS `AppIcon.appiconset` ครบ 15 ขนาดมาตรฐานพร้อม `Contents.json`
4. สร้างชุด Web Icons (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `Icon-192.png`, `Icon-512.png`)
5. อัปเดต `pubspec.yaml` เพื่อลงทะเบียน `assets/icons/` และกำหนดค่า `flutter_launcher_icons`
6. อัปเดต `android/app/src/main/AndroidManifest.xml` ให้ชี้ไปยัง `android:icon="@mipmap/ic_launcher"` และ `android:roundIcon="@mipmap/ic_launcher_round"`

### ขั้นตอนที่ 1.3: นำไอคอนเข้าสู่ UI ภายในแอป (In-App Branding)
ใส่โลโก้ไอคอนบนแถบ Header/AppBar และ About Dialog:
```dart
ClipRRect(
  borderRadius: BorderRadius.circular(6),
  child: Image.asset(
    'assets/icons/app_icon.png',
    width: 28,
    height: 28,
    fit: BoxFit.cover,
    errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
  ),
)
```

---

## 🏛️ 2. โครงสร้างสถาปัตยกรรมแอปพลิเคชัน (Clean Architecture & MVVM)

จัดระเบียบโค้ดตามรูปแบบ Clean Architecture แบบแยกเลเยอร์ชัดเจน:

```text
flutter_app/
├── assets/
│   └── icons/                # ชุดภาพไอคอนแบรนด์ทุกขนาด
├── lib/
│   ├── core/
│   │   ├── constants/        # ค่าคงที่ระบบ, คำสั่งโปรโตคอล, ค่าพอร์ต
│   │   └── theme/            # AppTheme, Colors, Typography (Dark Space Theme)
│   ├── models/               # โครงสร้างข้อมูล (Data Classes, Packet Encoders/Decoders)
│   ├── services/             # การติดต่อฮาร์ดแวร์ / เครือข่าย (UDP, USB, Bluetooth, HTTP)
│   ├── providers/            # State Management ด้วย ChangeNotifier
│   ├── ui/
│   │   ├── screens/          # หน้าจอหลักของแอปพลิเคชัน
│   │   └── widgets/          # วิดเจ็ตที่นำกลับมาใช้ใหม่ได้ (Gauges, HUD, Cards)
│   └── main.dart             # จุดเริ่มต้นแอป + MultiProvider Injection
├── android/
├── ios/
├── web/
└── pubspec.yaml
```

---

## 📱 3. มาตรฐานการพัฒนาส่วนต่อประสานผู้ใช้ (UI Engineering)

1. **Zero RenderFlex Overflow:**
   - ห้ามเกิดข้อผิดพลาด RenderFlex Overflow บนหน้าจอขนาดใดก็ตาม
   - ใช้ `LayoutBuilder`, `SingleChildScrollView`, `FittedBox`, และ `Flexible` ในจุดที่มีข้อความยาวหรือคอนเทนเนอร์แปรผัน
2. **Theme System (Dark Space & Neon High-Tech):**
   - ใช้งานธีมพื้นหลัง Dark Obsidian (`#070A12`) ผสาน Glassmorphism
   - เส้นขอบการ์ดใช้สไตล์นีออนเรืองแสงบางเบา `BorderSide(color: Color(0x3300F0FF))`
3. **การรองรับแนวหน้าจอ (Orientation Handling):**
   - หากเป็นแอป Cockpit/โดรน ให้ล็อคแนวนอนผ่าน `SystemChrome.setPreferredOrientations([DeviceOrientation.landscapeLeft, DeviceOrientation.landscapeRight])` และกำหนด `android:screenOrientation="sensorLandscape"` ใน AndroidManifest.xml
   - หากเป็นแดชบอร์ดทั่วไป ให้รองรับทั้งแนวตั้งและแนวนอนอย่างลื่นไหล

---

## 🧪 4. การควบคุมคุณภาพและการตรวจสอบโค้ด (Quality Assurance)

ก่อนนำเสนอหรือส่งมอบแอปพลิเคชัน ต้องผ่านการทดสอบ 3 ขั้นตอน:

1. **Static Code Analysis (0 Errors / 0 Warnings):**
   ```bash
   dart analyze
   ```
   *ต้องได้ผลลัพธ์ `No issues found!` หรือมีเพียงคำแนะนำ Hint เล็กน้อย โดยห้ามมี Warning หรือ Error ค้างอยู่เด็ดขาด*

2. **Automated Widget & Logic Smoke Tests:**
   ```bash
   flutter test
   ```

3. **การคอมไพล์ APK และติดตั้งบนสมาร์ทโฟนจริง:**
   ```bash
   # ตรวจสอบหมายเลขเครื่องสมาร์ทโฟน
   flutter devices
   adb devices -l

   # คอมไพล์ APK ดีบัก
   flutter build apk --debug

   # ติดตั้งลงเครื่องสมาร์ทโฟนผ่าน ADB
   adb -s <DEVICE_ID> install -r build/app/outputs/flutter-apk/app-debug.apk

   # รันสดพร้อม Hot Reload & Hot Restart
   flutter run -d <DEVICE_ID>
   ```

---

## 📋 เช็คลิสต์การสร้างแอปใหม่ (New Flutter App Checklist)
- [ ] 1. สร้างโครงสร้างโปรเจกต์ Flutter ด้วย `flutter create`
- [ ] 2. กำหนดธีมสีใน `lib/core/theme/app_theme.dart`
- [ ] 3. **ออกแบบภาพไอคอนหลัก (1024x1024 px) ด้วย `generate_image`**
- [ ] 4. **รันสคริปต์ `generate_icons.py` เพื่อสร้างชุดไอคอนทุกแพลตฟอร์ม**
- [ ] 5. ติดตั้ง State Management (`provider`) และ Services
- [ ] 6. สร้างหน้าจอ UI พร้อมใส่โลโก้ไอคอนแบรนด์บน Header
- [ ] 7. รัน `dart analyze` ตรวจสอบ 0 errors / 0 warnings
- [ ] 8. บิลด์ APK และติดตั้งทดสอบบนสมาร์ทโฟนจริง
