# 📘 เล่มที่ 6: ปัญญาประดิษฐ์กับการพัฒนาระบบคลาวด์ฟูลสแตกและแบ็กเอนด์อัจฉริยะ Firebase
### Series of AI SKILL — Volume 06: AI for Full-Stack Cloud & Firebase Intelligent Backend

**ผู้เขียน:** ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา  
**สำนักพิมพ์:** ศูนย์ความเป็นเลิศด้านสิ่งแวดล้อมและพลังงาน (LEQs) มหาวิทยาลัยราชภัฏรำไพพรรณี  
**ขนาดรูปเล่ม:** 6x9 นิ้ว (152.4 x 228.6 มม.) มาตรฐานสากล

---

## 🎯 วัตถุประสงค์เชิงพฤติกรรม (OBE Learning Outcomes)
1. สามารถผสานโมเดลมัลติโมดัล AI (Gemini API) เข้ากับเว็บแอปพลิเคชันผ่าน Firebase AI Logic ได้อย่างปลอดภัยและมีประสิทธิภาพ
2. สามารถออกแบบสกีมาฐานข้อมูลเชิงสัมพันธ์ PostgreSQL และสร้าง API แบบ Type-safe ด้วย Firebase Data Connect
3. สามารถกำหนดกฎความปลอดภัยแบบ Zero-Trust (Firestore & Storage Security Rules) และดีพลอยระบบขึ้นสู่ Firebase App Hosting ได้อย่างมั่นคง

---

## 📑 สารบัญบทเรียน (Table of Contents)

### บทที่ 1: การผสาน Multimodal AI ด้วย Firebase AI Logic
- 1.1 สถาปัตยกรรม Firebase AI Logic: การส่งต่อคำสั่งและการรับผลลัพธ์แบบสตรีมมิง
- 1.2 การประมวลผลอินพุตแบบมัลติโมดัล: ข้อความ, รูปภาพ, และเซนเซอร์เทเลเมตรี
- 1.3 การบังคับโครงสร้างเอาต์พุต (Structured Outputs) ด้วย JSON Schema Validation

### บทที่ 2: สถาปัตยกรรมฐานข้อมูลเชิงสัมพันธ์ด้วย Firebase Data Connect
- 2.1 การเปลี่ยนผ่านจาก NoSQL สู่ Relational Database บน Firebase ผ่าน PostgreSQL
- 2.2 การออกแบบ Schema, Table Relations และ Mutations ผ่าน GraphQL
- 2.3 การสร้าง Type-Safe Web/Mobile SDK แบบอัตโนมัติเพื่อลดข้อผิดพลาดในโค้ด

### บทที่ 3: ระบบความปลอดภัย Zero-Trust และการดีพลอยระดับองค์กร
- 3.1 การเขียนและตรวจสอบ Security Rules เพื่อป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต
- 3.2 สถาปัตยกรรม Firebase App Hosting สำหรับ Next.js และแอปพลิเคชัน Full-Stack
- 3.3 การตรวจสอบความเสถียรของแอปพลิเคชันแบบเรียลไทม์ด้วย Firebase Crashlytics

---

## 🚀 การคอมไพล์เล่ม (XeLaTeX)
```bash
/Library/TeX/texbin/xelatex -interaction=nonstopmode main.tex
```

## 🛠️ รายการสกิลต้นฉบับและไฟล์ SKILL.md ประจำเล่ม (Agent Skills Inventory)

| ลำดับ | ชื่อสกิล (Skill Name) | รายละเอียดและขอบเขตความสามารถ | ลิงก์ไฟล์ข้อกำหนด (SKILL.md) |
| :---: | :--- | :--- | :--- |
| 1 | `firebase-ai-logic-basics` | Official skill for integrating Firebase AI Logic (Gemini API) into web applications. Covers setup, multimodal inference, structured output, ... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-ai-logic-basics/SKILL.md) |
| 2 | `firebase-app-hosting-basics` | Deploy and manage web apps with Firebase App Hosting. Use this skill when deploying Next.js/Angular apps with backends. | [📄 ดูเนื้อหา SKILL.md](skills/firebase-app-hosting-basics/SKILL.md) |
| 3 | `firebase-auth-basics` | Guide for setting up and using Firebase Authentication. Use this skill when the user's app requires user sign-in, user management, or secure... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-auth-basics/SKILL.md) |
| 4 | `firebase-basics` | Provides foundational setup, authentication, and project management workflows for Firebase using the Firebase CLI. Use when checking Firebas... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-basics/SKILL.md) |
| 5 | `firebase-crashlytics` | Comprehensive guide for Firebase Crashlytics, including provisioning and SDK usage. Use this skill when the user needs help setting up Crash... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-crashlytics/SKILL.md) |
| 6 | `firebase-data-connect` | Builds and deploys Firebase SQL Connect (aka Firebase Data Connect) backends with PostgreSQL securely. Use when designing schemas with table... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-data-connect/SKILL.md) |
| 7 | `firebase-firestore` | Sets up, manages, and executes queries against Cloud Firestore database instances. You MUST unconditionally activate this skill if you plan ... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-firestore/SKILL.md) |
| 8 | `firebase-hosting-basics` | Skill for working with Firebase Hosting (Classic). Use this when you want to deploy static web apps, Single Page Apps (SPAs), or simple micr... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-hosting-basics/SKILL.md) |
| 9 | `firebase-remote-config-basics` | Comprehensive guide for Firebase Remote Config, including template management and SDK usage. Use this skill when the user needs help setting... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-remote-config-basics/SKILL.md) |
| 10 | `firebase-security-rules-auditor` | A skill to evaluate how secure Firestore security rules are. Use this when Firestore security rules are updated to ensure that the generated... | [📄 ดูเนื้อหา SKILL.md](skills/firebase-security-rules-auditor/SKILL.md) |
| 11 | `xcode-project-setup` | Safely modifies Xcode projects (.pbxproj) to add Swift Packages and link files. Use this skill whenever an iOS project needs dependencies in... | [📄 ดูเนื้อหา SKILL.md](skills/xcode-project-setup/SKILL.md) |
