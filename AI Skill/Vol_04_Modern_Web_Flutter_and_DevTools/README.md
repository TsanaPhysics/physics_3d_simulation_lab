# 📗 เล่มที่ 4: ปัญญาประดิษฐ์กับการพัฒนาเว็บสมัยใหม่ แอปพลิเคชันมือถือ Flutter และ DevTools
### Series of AI SKILL — Volume 04: AI for Modern Web, Flutter Mobile & High-Performance DevTools

**ผู้เขียน:** ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา  
**สำนักพิมพ์:** ศูนย์ความเป็นเลิศด้านสิ่งแวดล้อมและพลังงาน (LEQs) มหาวิทยาลัยราชภัฏรำไพพรรณี  
**ขนาดรูปเล่ม:** 6x9 นิ้ว (152.4 x 228.6 มม.) มาตรฐานสากล

---

## 🎯 วัตถุประสงค์เชิงพฤติกรรม (OBE Learning Outcomes)
1. สามารถประยุกต์ใช้สถาปัตยกรรม Clean Architecture (MVVM/Provider) ในการพัฒนาแอปพลิเคชัน Flutter ให้มีโค้ดสะอาดระดับ 0 Linter Warnings
2. สามารถพัฒนาเว็บแอปพลิเคชันที่ตอบสนองลื่นไหล 60 FPS ด้วยเทคนิค Zero-GC Loop และ Container Queries
3. สามารถใช้ Chrome DevTools MCP ในการวิเคราะห์ Heap Snapshot ตรวจจับปัญหา Memory Leak และเพิ่มประสิทธิภาพ Core Web Vitals (LCP, INP, CLS)

---

## 📑 สารบัญบทเรียน (Table of Contents)

### บทที่ 1: สถาปัตยกรรม Clean Architecture และการพัฒนาแอปพลิเคชัน Flutter
- 1.1 การแบ่งเลเยอร์ตามหลัก Clean Architecture: Presentation, Domain, Data
- 1.2 การจัดการสถานะ (State Management) ด้วย Provider และ ChangeNotifier
- 1.3 การทดสอบระดับหน่วย (Unit Testing) และวิดเจ็ตเทสต์ (Widget Testing)

### บทที่ 2: สถาปัตยกรรมเว็บสมัยใหม่และการประมวลผล 60 FPS
- 2.1 วิวัฒนาการของ CSS สมัยใหม่: Container Queries, `:has()`, และ View Transitions
- 2.2 การบริหารหน่วยความจำใน JavaScript: การป้องกัน Garbage Collection Trashing
- 2.3 การประมวลผลพื้นหลังด้วย Web Workers เพื่อไม่ให้ขัดขวาง Main Thread

### บทที่ 3: การดีบั๊กขั้นสูงด้วย Chrome DevTools และการปรับแต่ง Core Web Vitals
- 3.1 การตรวจสอบและวิเคราะห์การรั่วไหลของหน่วยความจำ (Memory Leak & Heap Retainer Tree)
- 3.2 การปรับแต่งความเร็วการแสดงผลหน้าเว็บ LCP (Largest Contentful Paint)
- 3.3 การตรวจสอบมาตรฐานการเข้าถึงเว็บตามหลักการสากล (Web Accessibility a11y)

---

## 🚀 การคอมไพล์เล่ม (XeLaTeX)
```bash
/Library/TeX/texbin/xelatex -interaction=nonstopmode main.tex
```
