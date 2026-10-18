# 📓 เล่มที่ 5: ปัญญาประดิษฐ์กับวิศวกรรมข้อมูลคลาวด์ BigQuery และการเรียนรู้ของเครื่อง
### Series of AI SKILL — Volume 05: AI for Cloud Data Engineering, BigQuery & Machine Learning

**ผู้เขียน:** ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา  
**สำนักพิมพ์:** ศูนย์ความเป็นเลิศด้านสิ่งแวดล้อมและพลังงาน (LEQs) มหาวิทยาลัยราชภัฏรำไพพรรณี  
**ขนาดรูปเล่ม:** 6x9 นิ้ว (152.4 x 228.6 มม.) มาตรฐานสากล

---

## 🎯 วัตถุประสงค์เชิงพฤติกรรม (OBE Learning Outcomes)
1. สามารถเขียนและปรับแต่งคิวรี SQL บน Google BigQuery เพื่อรองรับข้อมูลขนาดใหญ่ (Terabyte Scale) โดยลดค่าใช้จ่ายและเวลาประมวลผลสูงสุด
2. สามารถพัฒนาไปป์ไลน์การแปลงข้อมูลแบบ ELT ด้วย Dataform SQLX และ dbt พร้อมระบบทดสอบคุณภาพข้อมูลอัตโนมัติ (Data Quality Assertions)
3. สามารถพัฒนาโค้ด PySpark บน Dataproc Serverless เพื่อประมวลผล Big Data และรันโมเดลการเรียนรู้ของเครื่อง (Machine Learning) แบบไร้เซิร์ฟเวอร์

---

## 📑 สารบัญบทเรียน (Table of Contents)

### บทที่ 1: การออกแบบและปรับแต่งประสิทธิภาพ SQL บน Google BigQuery
- 1.1 สถาปัตยกรรมกระจายการประมวลผลแบบแยกพื้นที่จัดเก็บ (Dremel & Colossus Architecture)
- 1.2 เทคนิค Partitioning, Clustering และการลดทอน Slot Contention
- 1.3 กลยุทธ์การเขียนคำสั่ง SQL เพื่อหลีกเลี่ยง Data Shuffling และค่าใช้จ่ายส่วนเกิน

### บทที่ 2: การสร้างโมเดิร์นไปป์ไลน์ ELT ด้วย Dataform และ dbt
- 2.1 วงจรชีวิตของข้อมูลใน Data Warehouse: สถาปัตยกรรมเหรียญทอง (Medallion Architecture)
- 2.2 การสร้าง Dataform Actions ด้วย SQLX และการจัดการ Dependencies แบบ DAG
- 2.3 การสร้างโมเดล dbt บน BigQuery และการทดสอบคุณภาพข้อมูลแบบอัตโนมัติ

### บทที่ 3: การประมวลผล Big Data และโมเดลการเรียนรู้ของเครื่องด้วย Dataproc Serverless
- 3.1 สถาปัตยกรรม Apache Spark บน Dataproc Serverless ไร้ภาระการดูแลคลัสเตอร์
- 3.2 การปรับแต่งหน่วยความจำ Spark Driver และ Executor เพื่อขจัดปัญหา Out-Of-Memory (OOM)
- 3.3 การสร้างไปป์ไลน์แมชชีนเลิร์นนิงสำหรับงานทำนายและจัดกลุ่มข้อมูลเซนเซอร์ภาคสนาม

---

## 🚀 การคอมไพล์เล่ม (XeLaTeX)
```bash
/Library/TeX/texbin/xelatex -interaction=nonstopmode main.tex
```
