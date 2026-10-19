---
name: physics-course-visual-builder
description: >-
  Builds, formats, and deploys high-contrast modern HTML5 & inline SVG infographics,
  interactive visual cards, vector math equations, and formula highlight boxes for physics
  and microbiology courseware (Moodle, LMS, web books). Use when creating or upgrading
  course diagrams, worked examples, formulas, or visual figures across chapters.
---

# Physics Course Visual & Infographic Builder Skill

This skill provides the standard architecture, design tokens, and modular component library for building **high-contrast, responsive, non-clipping HTML5 & SVG infographics**, formula highlight boxes, worked example cards, and crystal-clear vector math typography for physics, biophysics, and microbiology courseware (e.g. Moodle LMS, digital course handouts, interactive web textbooks).

---

## 🎯 Core Principles & Anti-Patterns to Avoid

### 1. 100% Valid XML SVG Standard (CRITICAL)
* **NEVER** use HTML formatting tags (`<br>`, `<strong>`, `<b>`, `<sup>`, `<sub>`, `<span>`, `<div>`) inside SVG `<text>` elements.
* *Why:* Browsers use strict XML parsers for inline SVGs. Unclosed HTML tags like `<br>` or HTML styling tags like `<strong>` cause the XML parser to fail, halting all subsequent rendering and resulting in blank/clipped diagrams.
* **Always use valid SVG XML elements:**
  * For multi-line text: Use `<tspan x="..." dy="...">` or separate `<text>` nodes.
  * For bold text in SVG: Use `<tspan font-weight="bold">` or `<text font-weight="bold">`.
  * For subscripts/superscripts in SVG: Use `<tspan baseline-shift="super" font-size="...">` or Unicode subscript/superscript characters (`⁺`, `⁻`, `⁰`, `²`, `³`).

### 2. CSS Keyframe Animation Integrity
* `@keyframes` identifier names must **never** contain spaces (e.g., use `@keyframes moveParticleA`, NEVER `@keyframes moveParticleA Live`). Spaces in keyframe names invalidate the CSS block and disable animations across the entire SVG.

### 3. Preservation of All Existing Figures (No Figure Dropping)
* When updating or adding detail to a subtopic or chapter, **ALWAYS preserve the complete numbering and structure of all existing figures** (e.g., maintaining both Figure 12.1a and 12.1b, Figure 12.2a and 12.2b, etc.).
* Never overwrite or drop previous visual components unless explicitly requested by the user.

### 4. Zero SVG Clipping & No Coordinate Drift
* **Never** apply CSS `transform` animations (like `translateY`) on `<g>` elements inside SVG without fixed layout boundaries, as WebKit/Moodle CSS can reset coordinates back to `(0,0)`, causing elements (like badges/boxes) to jump over headers.
* **Use Pure SVG Coordinates** or **HTML5 CSS Flex/Grid Cards with Embedded Mini-SVGs** for guaranteed rendering across all screen sizes and LMS themes.

### 5. High Contrast & Dark Card Typography
* Always ensure text color on dark cards (`#0f172a`, `#1e293b`) uses high-contrast colors:
  * Headers: `#38bdf8` (Sky Blue), `#34d399` (Emerald), `#facc15` (Amber), `#c084fc` (Purple)
  * Body text: `#ffffff`, `#cbd5e1`, `#f8fafc`
  * Secondary metadata: `#94a3b8`, `#a7f3d0`, `#fef08a`
* **Never** use dark text (`#1e293b`, `#334155`) on dark backgrounds.

### 6. Zero-Tofu Vector & Crystal-Clear Math Typography
* **Never use Unicode combining characters** (`U+20D7` `⃗` or `U+0302` `̂`) as Thai and system fallback fonts (Prompt, Sarabun, macOS, Windows) will render them as missing glyph squares (`□` Tofu boxes).
* **Never use tall inline-flex column containers** for individual symbols as they disrupt normal text baseline and push operators (like `·` and `×`) out of alignment.
* **Use Baseline-Aligned Absolute Positioning**:
  ```python
  def vec(symbol):
      return f"""<span style="position: relative; display: inline-block; margin: 0 1px; font-weight: 700; font-style: italic; font-family: 'Times New Roman', Cambria, serif; font-size: 1.05em; line-height: 1;"><span style="position: absolute; top: -0.48em; left: 0; right: 0; text-align: center; font-size: 0.60em; font-weight: 900; font-style: normal; line-height: 1; pointer-events: none;">&rarr;</span>{symbol}</span>"""

  def hat(symbol):
      return f"""<span style="position: relative; display: inline-block; margin: 0 1px; font-weight: 700; font-style: italic; font-family: 'Times New Roman', Cambria, serif; font-size: 1.05em; line-height: 1;"><span style="position: absolute; top: -0.42em; left: 0; right: 0; text-align: center; font-size: 0.65em; font-weight: 900; font-style: normal; line-height: 1; pointer-events: none;">^</span>{symbol}</span>"""
### 7. Clean Thai Naming Standard (No 'หัวข้อ', No Colons, No Trailing English in Titles)
* **ตัดคำว่า "หัวข้อ" ออกทั้งหมด** ในชื่อหัวข้อหลักและหัวข้อย่อย (เช่น ใช้ `1.1` หรือ `บทที่ 1` โดยตรง)
* **ไม่ใส่เครื่องหมายทวิภาค (`:`)** คั่นระหว่างลำดับและชื่อเรื่อง (ใช้การเว้นวรรค 1 เคาะ เช่น `บทที่ 1 จำนวนเชิงซ้อน`, `1.1 คณิตศาสตร์เชิงลึก`)
* **ตัดคำแปลภาษาอังกฤษต่อท้ายภาษาไทยออก** จากชื่อหัวข้อหลักและหัวข้อย่อยบนระบบ MOOC/LMS เพื่อความเป็นระเบียบและอ่านง่าย

### 8. Handcrafted HTML/CSS Vector Math Architecture (Zero Raw-LaTeX Artifacts)
* **ห้ามใช้ Regex Fallback แบบอัตโนมัติที่ไม่สมบูรณ์** ในการแปลงสูตร LaTeX ที่มีความซับซ้อน เช่น `\equiv`, `\to`, `\quad`, `\exp\left(...)`, หรือเศษส่วนซ้อน เพราะจะทิ้งรอยคราบวงเล็บปีกกา `{ }` และข้อความ LaTeX ดิบไว้บนหน้าเว็บ
* **ต้องใช้การ์ดสมการที่เขียนด้วย Pure HTML/CSS Handcrafted Template 100%**:
  * ใช้ `<span>` สำหรับตัวแปรพร้อมระบุสีแยกตามความหมายทางฟิสิกส์ (`#38bdf8` ตัวแปรนำ, `#facc15` ค่าคงที่, `#34d399` อุณหภูมิ/ความดัน, `#f43f5e` พลังงาน)
  * ใช้ `<sup>` และ `<sub>` สำหรับเลขชี้กำลังและตัวห้อย
  * ใช้ `display:inline-flex; flex-direction:column; vertical-align:middle; text-align:center;` พร้อม `border-bottom:2px solid #38bdf8` สำหรับขีดคั่นเศษส่วน (Division Bar)
  * ระบุคำอธิบายตัวแปรและหน่วย SI ในกล่อง Legend แยกบรรทัดชัดเจน

---

## 📦 Component Library & Templates

### 1. Formula Highlight Box (สูตรและสมการสำคัญ)
```html
<div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 5px solid #0284c7; border-radius: 12px; padding: 18px 22px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; margin-bottom: 8px;">
    <span style="font-weight: 700; color: #0369a1; font-size: 0.95em;">📌 [ชื่อกฎ/สมการสำคัญ]</span>
    <span style="background: #bae6fd; color: #0369a1; font-size: 0.78em; font-weight: 700; padding: 2px 10px; border-radius: 12px;">[หมวดหมู่วิชา]</span>
  </div>
  
  <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 14px; text-align: center; font-size: 1.3em; color: #0f172a; margin: 12px 0; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 16px;">
    [ตัวแปรหลัก] = [สูตรคำนวณ]
  </div>

  <div style="font-size: 0.92em; color: #334155; line-height: 1.75; margin-top: 8px;">
    &bull; <strong>[ตัวแปร 1]</strong> = คำอธิบาย (หน่วย SI)<br>
    &bull; <strong>[ตัวแปร 2]</strong> = คำอธิบาย (หน่วย SI)
  </div>
</div>
```

---

### 2. High-Contrast Modern Visual Card (รูปประกอบ & แผนภาพ)
```html
<div style="margin: 26px 0; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 1px solid #334155; border-radius: 18px; padding: 24px; box-shadow: 0 12px 30px -5px rgba(15, 23, 42, 0.45); color: #ffffff;">
  <!-- Card Header -->
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; border-bottom: 1px solid #334155; padding-bottom: 14px;">
    <div style="font-weight: 700; font-size: 1.12em; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
      <span>[Icon]</span> <strong>รูปที่ X.X: [ชื่อรูปภาพ / แผนภาพ]</strong>
    </div>
    <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); font-size: 0.8em; font-weight: 600; padding: 4px 12px; border-radius: 20px;">
      [หมวดหมู่แผนภาพ]
    </span>
  </div>

  <!-- Main Visual Grid or Embedded Vector Graphic -->
  <div style="margin-bottom: 16px;">
    <!-- Embedded SVG or Interactive Visuals -->
  </div>

  <!-- Bottom Explanatory Callout -->
  <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid #334155; border-radius: 10px; padding: 12px 18px; font-size: 0.9em; color: #cbd5e1;">
    💡 <strong>สรุปสาระสำคัญ:</strong> [คำอธิบายหลักการทางฟิสิกส์และการประยุกต์]
  </div>
</div>
```

---

### 3. Step-by-Step Worked Example (ตัวอย่างโจทย์คำนวณพร้อมเฉลยละเอียด)
```html
<div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 14px; margin-bottom: 20px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
  <div style="background: #f8fafc; padding: 14px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
    <span style="font-weight: 700; color: #1e40af; font-size: 1.02em;">📝 ตัวอย่างที่ X.X: [ชื่อหัวข้อโจทย์]</span>
    <span style="background: #dbeafe; color: #1e40af; font-size: 0.78em; font-weight: 600; padding: 3px 10px; border-radius: 20px;">[หมวดโจทย์]</span>
  </div>
  <div style="padding: 18px 22px; color: #334155;">
    <p style="margin-top: 0; font-weight: 500;">
      <strong>โจทย์:</strong> [คำถามและข้อมูลที่โจทย์กำหนด]
    </p>
    
    <details style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px 18px; cursor: pointer;">
      <summary style="font-weight: 700; color: #1e40af; outline: none; user-select: none;">👉 คลิกเพื่อดูวิธีทำและขั้นตอนคำนวณอย่างละเอียด</summary>
      <div style="margin-top: 14px; padding-top: 14px; border-top: 1px dashed #cbd5e1; color: #1e293b; line-height: 1.85;">
        
        <!-- STEP 1 -->
        <div style="margin-bottom: 12px;">
          <span style="display: inline-block; background: #3b82f6; color: #fff; width: 24px; height: 24px; border-radius: 50%; text-align: center; line-height: 24px; font-size: 0.85em; font-weight: 700; margin-right: 8px;">1</span>
          <strong>[ขั้นตอนที่ 1: ตั้งสมการ]</strong>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; margin: 8px 0 8px 32px; font-size: 1.15em; text-align: center;">
            [สมการ]
          </div>
        </div>

        <!-- RESULT CALLOUT -->
        <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 12px 18px; border-radius: 8px; font-weight: 600; color: #065f46; margin-top: 14px;">
          🎯 <strong><u>สรุปคำตอบ</u>:</strong> [คำตอบพร้อมหน่วยที่ถูกต้อง]
        </div>
      </div>
    </details>
  </div>
</div>
```

---

## 🛠️ Python Template Module

All scripts can import the standardized template library directly from:
`from resources.infographic_templates import vec, hat, dot, cross, html_fraction, formula_box, visual_infographic_card, worked_example_card`

---

## 🚀 How to Apply Across Chapters 1–12

When asked to update or develop any chapter:
1. Identify all core physical laws in that chapter and wrap each in a **Formula Highlight Box**.
2. Identify all key physical concepts and generate **High-Contrast Modern Visual Cards** with embedded vector SVG illustrations.
3. For all worked calculation examples, structure into **Step-by-Step solutions** with numbered step badges and Emerald Green conclusion alert boxes.
4. Ensure all math equations utilize **`html_fraction`**, **`vec()`**, **`hat()`**, and Greek Unicode entities for 100% crisp, non-clipping, baseline-aligned typography across all client devices.
5. Accompany all visual diagrams with **Key Concept Highlight Callout Cards** and structured summary tables for rich biological & physics contextualization.
