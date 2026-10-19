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

## 🛠️ รายการสกิลต้นฉบับและไฟล์ SKILL.md ประจำเล่ม (Agent Skills Inventory)

| ลำดับ | ชื่อสกิล (Skill Name) | รายละเอียดและขอบเขตความสามารถ | ลิงก์ไฟล์ข้อกำหนด (SKILL.md) |
| :---: | :--- | :--- | :--- |
| 1 | `bigquery-data-transfer-service` | Discovers and inspects BigQuery Data Transfer Service (DTS) configurations. Use this to identify existing ingestion pipelines and extract da... | [📄 ดูเนื้อหา SKILL.md](skills/bigquery-data-transfer-service/SKILL.md) |
| 2 | `bigquery-sql` | Provides BigQuery SQL query optimization techniques, execution best practices, and performance tuning rules for high-efficiency querying. Us... | [📄 ดูเนื้อหา SKILL.md](skills/bigquery-sql/SKILL.md) |
| 3 | `data-autocleaning` | Automated data quality and transformation capabilities for Dataform/dbt/BigQuery pipelines. Processes data sourced from BigQuery or Cloud St... | [📄 ดูเนื้อหา SKILL.md](skills/data-autocleaning/SKILL.md) |
| 4 | `dataform-bigquery` | Expertise in generating clean, correct, and efficient Dataform pipeline code for BigQuery ELT. Use this when creating or modifying Dataform ... | [📄 ดูเนื้อหา SKILL.md](skills/dataform-bigquery/SKILL.md) |
| 5 | `dbt-bigquery` | Expert guidance for creating, modifying, and optimizing dbt pipelines for BigQuery. Use this skill whenever user asks for generating or modi... | [📄 ดูเนื้อหา SKILL.md](skills/dbt-bigquery/SKILL.md) |
| 6 | `discovering-gcp-data-assets` | | Finds and inspects data assets within Google Cloud. Relevant when any of the following conditions are true: 1. The user request involves f... | [📄 ดูเนื้อหา SKILL.md](skills/discovering-gcp-data-assets/SKILL.md) |
| 7 | `enforcing-resource-attribution` | 'Enforces resource attribution for CLI commands. Use this skill whenever you are running `bq` or `gcloud` commands via `run_command`. It ens... | [📄 ดูเนื้อหา SKILL.md](skills/enforcing-resource-attribution/SKILL.md) |
| 8 | `gcp-data-pipelines` | 'Primary entry point for building, managing, and orchestrating data pipelines on Google Cloud. Guides users to the appropriate skill for dbt... | [📄 ดูเนื้อหา SKILL.md](skills/gcp-data-pipelines/SKILL.md) |
| 9 | `gcp-dataflow` | | Guides writing, packaging, executing, and troubleshooting Apache Beam pipelines on Dataflow. Use when creating new pipelines, configuring ... | [📄 ดูเนื้อหา SKILL.md](skills/gcp-dataflow/SKILL.md) |
| 10 | `gcp-pipeline-orchestration` | This skill helps the agent generate or update orchestration pipeline definitions for Google Cloud Composer to initialize orchestration pipel... | [📄 ดูเนื้อหา SKILL.md](skills/gcp-pipeline-orchestration/SKILL.md) |
| 11 | `gcp-pipeline-resource-provisioning` | | Automates declarative resource creation and provisioning for data pipelines, supporting BigQuery, Dataform, Dataproc, BigQuery Data Transf... | [📄 ดูเนื้อหา SKILL.md](skills/gcp-pipeline-resource-provisioning/SKILL.md) |
| 12 | `gcp-spark` | | Develops, optimizes and runs PySpark/Spark code on Managed Spark (Dataproc clusters and Serverless) on Google Cloud. Use when: - Authoring... | [📄 ดูเนื้อหา SKILL.md](skills/gcp-spark/SKILL.md) |
| 13 | `gcp-spark-troubleshooting` | Provides expert guidance for troubleshooting Google Cloud Spark and Dataproc workloads (Dataproc Serverless batches and standard Dataproc cl... | [📄 ดูเนื้อหา SKILL.md](skills/gcp-spark-troubleshooting/SKILL.md) |
| 14 | `google-cloud-auth-verification` | Mandatory Step 0 pre-flight execution order and authentication verification for Google Cloud Platform (GCP), Application Default Credentials... | [📄 ดูเนื้อหา SKILL.md](skills/google-cloud-auth-verification/SKILL.md) |
| 15 | `managing-python-dependencies` | | Ensures proper Python dependency management, avoiding global `pip install` and adhering to project-specific tooling. Use this skill if any... | [📄 ดูเนื้อหา SKILL.md](skills/managing-python-dependencies/SKILL.md) |
| 16 | `ml-best-practices` | | CRITICAL RULE: You MUST use this skill whenever the task involves any machine learning tasks or data analysis. Use this skill if the user'... | [📄 ดูเนื้อหา SKILL.md](skills/ml-best-practices/SKILL.md) |
| 17 | `notebook-guidance` | |- This skill guides the use of Jupyter notebooks for data analysis, exploration, and visualization, particularly with BigQuery. It outlines... | [📄 ดูเนื้อหา SKILL.md](skills/notebook-guidance/SKILL.md) |
| 18 | `schema-mapping` | Guides the process of analyzing, mapping, and documenting transformations between source and target schemas for any database, data warehouse... | [📄 ดูเนื้อหา SKILL.md](skills/schema-mapping/SKILL.md) |
| 19 | `uv` | Checks whether the uv Python package manager is installed and installs it if missing. Ensures uv is on PATH. Use when another skill requires... | [📄 ดูเนื้อหา SKILL.md](skills/uv/SKILL.md) |
