---
name: physics-textbook-layout-architect
description: >-
  ระบบสถาปัตยกรรมและมาตรฐานการจัดรูปแบบ เลย์เอาต์ ภาพประกอบ ข้อความ
  และโครงสร้างตำราวิชาการฟิสิกส์ระดับมหาวิทยาลัย สกัดจากการวิเคราะห์ตำราชั้นนำ
  2 เล่ม ได้แก่ Serway & Jewett (Solutions Manual) และ Tipler & Mosca (Main Textbook)
  ใช้เมื่อต้องการออกแบบ จัดทำ หรือ Refactor ตำราวิชาการ เอกสารคำสอน คู่มือเฉลย
  หรือ E-Book วิชาฟิสิกส์และวิทยาศาสตร์ให้มีมาตรฐานระดับสากล
  ทั้งในรูปแบบ HTML/CSS, PDF, EPUB และ MOOC
---

# Physics Textbook Layout Architect

สกิลนี้บรรจุมาตรฐานการออกแบบและเลย์เอาต์ตำราวิชาการฟิสิกส์ระดับโลก
สกัดจากการวิเคราะห์ตำราชั้นนำ 2 เล่มจริง:

- **Serway & Jewett** - Physics for Scientists and Engineers 8th Ed. Solutions Manual (Cengage)
- **Tipler & Mosca** - Physics for Scientists and Engineers with Modern Physics (W.H. Freeman)

อ่านเอกสารอ้างอิงฉบับเต็มได้ใน [references/](./references/) ของสกิลนี้

---

## 1. เลือกประเภทหนังสือก่อนเริ่มออกแบบ

| ประเภท | แบบจำลองอ้างอิง | คุณลักษณะหลัก |
| :--- | :--- | :--- |
| **ตำราหลัก (Main Textbook)** | Tipler & Mosca | 4 สี, Hero Chapter Opener, Sidebar กว้าง, 2 คอลัมน์, P-S-C-T Worked Examples |
| **คู่มือเฉลย / คู่มือศึกษา** | Serway Solutions Manual | 1 คอลัมน์, C-C-A-F Problem Solving, Inset Figure ชิดขวา, 5-Part Chapter Structure |
| **E-Book / MOOC** | ผสมทั้งสอง | Toggle Answer Boxes, MathJax, SVG Vectors, Active Learning |

---

## 2. Page Geometry Standards

### ตำราหลัก (Main Textbook)
```
Page Size    : Crown Quarto ~ 8.32 x 10.94 in (599 x 788 pt)
Inside Gutter: 1.25 in  (Perfect Binding)
Outside Margin: 2.0-2.5 in  (Wide Margin Sidebar Zone)
Top/Bottom   : 1.0 in
Grid System  : 2-column body + 1 Wide Margin Sidebar (Hybrid 3-Zone)
```

### คู่มือเฉลย / เอกสารคำสอน
```
Page Size    : US Letter 8.5 x 11 in (612 x 792 pt)
Inside Gutter: 1.5 in
Other Margins: 1.0 in (top/bottom/outside)
Grid System  : 1 wide column + Inset Figure Zone (right side of problem block)
```

### Running Headers
- **Even Pages** : [page#]  [Chapter X - ชื่อบท]  (flush left)
- **Odd Pages**  : [ชื่อหัวข้อย่อย]  [page#]  (flush right)
- **Chapter First Page**: ซ่อน Running Header / บังคับขึ้นหน้าคี่ (page-break-before: right)

---

## 3. Chapter Architecture

### Type A - Main Textbook (Tipler / P-S-C-T)

```
CHAPTER OPENER (full page)
  - Chapter number (huge Sans-Serif Bold) + Chapter title
  - Section Outline Table (left panel, numbered sub-sections)
  - Hero Photo / Real-world Visual (right panel, full color)
  - Contextual Hook Question "?" Box (connects to a numbered Example)
  - Drop Cap first paragraph (3-line initial cap)

SECTION CONTENT (X-1, X-2, ...)
  - 2-column body text
  - Wide Margin Sidebar: micro-photos, Pitfall boxes, Concept Checks, Margin Definitions

WORKED EXAMPLES (P-S-C-T framework)

SUMMARY TABLE (2-col: TOPIC | EQUATIONS & REMARKS)

PROBLEM SETS (Tiered: Conceptual, Estimation, Section-by-Section, General, Challenge)
```

### Type B - Solutions Manual (Serway / C-C-A-F)

```
1. EQUATIONS AND CONCEPTS       - key equations, variable definitions, SI units
2. SUGGESTIONS, SKILLS & STRATEGIES - problem-solving techniques, math prerequisites
3. REVIEW CHECKLIST             - OBE learning outcomes checklist
4. ANSWERS TO SELECTED QUESTIONS - conceptual answers (~15% coverage)
5. SOLUTIONS TO PROBLEMS        - full C-C-A-F solutions (~20% of problems)
```

---

## 4. Worked Example Templates

### Template P-S-C-T (ใช้กับตำราหลัก)

```
Example X-X  [Title]                          [Badge: Context-Rich / Fermi / Bio]

[Problem statement — context-rich scenario...]

PICTURE
[Describe the physical model, list Given quantities and target unknown, plan equation selection]

SOLVE
1. [Step description]:
   (equation) = (substitution with all units) = result  units
2. [Next step]:
   ...

CHECK
[Verify: unit cancellation correct? Magnitude physically reasonable? Direction logical?]

TAKING IT FURTHER
[Connect to deeper physics / modern physics / engineering / real-world application]
```

> [!IMPORTANT]
> **มาตรฐานภาษาไทยวิชาการ (RBRU Standards):** ห้ามใส่เครื่องหมายทวิภาค (`:`) หลังป้ายกำกับ เช่น `\textbf{โจทย์}`, `\textbf{PICTURE}`, `\textbf{SOLVE}`, `\textbf{CHECK}`, `\textbf{ระดับพื้นฐาน}` และห้ามใส่ `:` ท้ายขั้นตอนคำนวณ เช่น `1. [คำอธิบายขั้นตอน]` รวมถึงห้ามใส่วงเล็บภาษาอังกฤษในชื่อหัวข้อ `\section`, `\subsection`

### Template C-C-A-F (ใช้กับคู่มือเฉลย)

```
[Problem number].  [Problem statement...]

Solution

Conceptualize:
  Visualize the physical scenario. State Given quantities and the target unknown.
  Estimate Order of Magnitude and expected units as a sanity check.

Categorize:
  Identify applicable Analysis Model (e.g., Particle Under Constant Acceleration,
  Isolated System for Energy, etc.) and simplifying assumptions.

Analyze:
  Select principal equation from the chosen model.
  Solve symbolically (algebraic manipulation first — NO numbers yet).
  Substitute numerical values WITH units for every quantity.
  Cancel units explicitly.
  State final result to 3 significant figures.                         [■ flush right]

Finalize:
  Check magnitude and direction for physical reasonableness.
  Discuss limiting cases or boundary conditions.
  Connect to real-world phenomena or extended applications.
```

**Critical Rules:**
1. Symbolic algebra FIRST — never substitute numbers before isolating the variable
2. Show ALL units during substitution so unit cancellation is visible
3. QED mark (■) appears FLUSH RIGHT on the final answer line
4. Significant figures: 3 sig figs; round ONLY at the very last step

---

## 5. Typography & Symbol Standards

### Typeface Hierarchy

| Role | Font Family | Size | Weight |
| :--- | :--- | :--- | :--- |
| Chapter number / Title | Sans-Serif (Inter / Myriad / Helvetica) | 24-48 pt | Bold |
| Section headings (X-1) | Sans-Serif | 12-14 pt | SemiBold |
| Body text | Serif (Georgia / Minion Pro / Times NR) | 10-10.5 pt | Regular |
| Step keywords (PICTURE, SOLVE, Conceptualize…) | Serif Bold or Sans-Serif Bold | 10-10.5 pt | Bold |
| Math equations | KaTeX / MathJax / Computer Modern | context | — |
| Code / listings | Monospace (Fira Code / Courier New) | 9-10 pt | Regular |

### Physics Symbol Standards

| Type | Format Rule | Examples |
| :--- | :--- | :--- |
| Scalar variables | **Italic** | x, y, t, m, v, a, E |
| Vector quantities | **Bold** OR **arrow** over letter | **v**, **F** or v-arrow, F-arrow |
| SI units | **Upright / Roman** | m/s, kg/m^3, N, J |
| Equation alignment | Align equals signs vertically | use LaTeX align environment |
| End-of-answer mark | QED black square flush right | \hfill\blacksquare |

### Vector Color Coding (enforce identically throughout the entire book)

| Quantity | Color | Hex Code |
| :--- | :--- | :--- |
| Force (F-vector) | Red | #e53e3e |
| Velocity (v-vector) | Blue | #3182ce |
| Acceleration (a-vector) | Orange | #dd6b20 |
| Position / Displacement (r-vector, s-vector) | Green | #38a169 |
| Generic vectors | Dark Gray | #2d3748 |

---

## 6. Figure & Diagram Placement Rules

1. **Problem Figures**: float right inside the problem block; body text wraps on the left; label every figure as "Figure P2.5" or "Fig. X-X"
2. **Dual-Layer Diagrams** (Real + Model side-by-side):
   - Left panel: real-world photo or rendered image
   - Right panel: SVG vector sketch with coordinate axes, labels, vector arrows in color code
3. **Margin Sidebar Figures**: max 35% page width; placed only in the Wide Margin Zone
4. **SVG Requirement (mandatory for all diagrams)**:
   - Format: SVG only (not PNG/JPEG) for print-quality sharpness
   - Required attributes: viewBox, xmlns, aria-label
   - File naming: chXX_figYY_description.svg
   - Storage path: assets/diagrams/
5. **Figure Captions**: always wrap in figure + figcaption; language matches the book's primary language

---

## 7. Special Content Boxes

### Pitfall Prevention Box
```html
<div class="box-pitfall">
  <span class="icon">⚠️</span>
  <strong>จุดที่มักเข้าใจผิด:</strong>
  [Common misconception students make at this point...]
</div>
```

### Concept Check Box (inline quiz between sections)
```html
<div class="box-concept-check">
  <span class="icon">🔍</span>
  <strong>ทดสอบความเข้าใจ:</strong>
  [1-2 quick multiple-choice or ranking questions]
  <details><summary>ดูเฉลย</summary>[Answer with brief explanation]</details>
</div>
```

### Taking It Further Box
```html
<div class="box-extension">
  <span class="icon">🔭</span>
  <strong>ต่อยอด:</strong>
  [Advanced connection to modern physics / engineering / biology]
</div>
```

### Problem Badges (attach to Example or Problem header)
```html
<span class="badge context-rich">Context-Rich</span>
<span class="badge fermi">Fermi Question</span>
<span class="badge bio">Biological App.</span>
<span class="badge eng">Engineering App.</span>
```

---

## 8. Chapter Summary Table Template

```markdown
## Summary

| TOPIC | RELEVANT EQUATIONS AND REMARKS |
| :--- | :--- |
| **[Concept 1]** | [Short definition] + key equation |
| **[Concept 2]** | [Definition] + caution note |
| **[Concept 3]** | Main equation displayed on its own line |
```

---

## 9. Tiered Problem Sets

| Symbol | Level | Description |
| :--- | :--- | :--- |
| dot | Level 1 — Single-Concept | Direct formula substitution |
| dot dot | Level 2 — Multi-Concept | Combines multiple concepts or chapters |
| dot dot dot | Level 3 — Advanced | Requires calculus or sophisticated approximation |
| star | Context-Rich | Real-world scenario; solution path not explicitly stated |
| DNA | Biological Application | Physics applied to medicine / biology |
| gear | Engineering Application | Physics applied to engineering systems |

**Recommended problem section order within each chapter:**
1. Conceptual Questions (understanding only, no calculation)
2. Estimation and Approximation / Fermi Questions
3. Section-by-Section Problems (grouped by section, with level dots)
4. General Problems (mixed, no section label)
5. Challenge Problems (Level 3 only)

---

### 9.5 Academic Tables, Chapter Banners & Bilingual Indexing Architecture
- **กล่องหัวบทวิชาการพร้อมภาพประกอบเวกเตอร์ฟิสิกส์ (Academic Chapter Banner Box):**
  - ข้อความ "บทที่ X" ขนาดใหญ่ 2 เท่า (`44pt`) สีขาว คมชัด
  - เส้นคั่นกลางสีทองหนา 2pt ยาวครึ่งหน้า (`0.50\textwidth`)
  - ข้อความ "ชื่อบท" ปรับขนาดสมดุลที่ **`25pt`** (Numbered) และ **`29pt`** (Unnumbered) จัดชิดขอบขวา (`\raggedleft`)
  - พื้นหลังไล่ระดับสีน้ำเงินเข้มหรูหรา (`rbruNavy!98!black` สู่ `rbruNavy!85!rbruSlate`) ขอบทองด้านขวา (`borderline east={4pt}{0pt}{rbruGold}`) พร้อมภาพประกอบเวกเตอร์ฟิสิกส์แบบโปร่งแสง (แกน 3 มิติ, เวกเตอร์ $\vec{F}, \vec{v}, \vec{r}$, คลื่นกล, วงโคจร)
- **ตารางสูตรและแบบจำลองทางฟิสิกส์ (Physics Model & Formula Tables):**
  - ใช้ `booktabs` เท่านั้น (`\toprule`, `\midrule`, `\bottomrule`) โดยไม่มีเส้นแบ่งแนวตั้ง (`|`)
  - แคปชันตาราง (`\caption{...}`) อยู่ด้านบนและจัดชิดขอบขวา (Flush Right) ของตาราง/หน้ากระดาษเสมอ ด้วย `justification=raggedleft, singlelinecheck=false` พร้อมระบุ `\label{tab:...}` และไม่มีเครื่องหมาย `:` คั่นลำดับ
  - ตารางจัดชิดขอบกั้นขวา 100% ด้วย `tabularx` และ `\textwidth`
  - ทุกบทต้องมีตารางสรุปสูตร/เปรียบเทียบเชิงฟิสิกส์อย่างน้อย 1–2 ตาราง
- **สารบัญภาพและตาราง (List of Figures & Tables):**
  - แสดงผลในส่วน Frontmatter พร้อมระบุคำภาษาไทย `สารบัญภาพ` และ `สารบัญตาราง`
  - เรนเดอร์ด้วยกล่องแบนเนอร์วิชาการแบบเดียวกัน และเชื่อมโยงเข้าสู่สารบัญหลัก (`\tableofcontents`)
- **ภาคผนวกสูตรและเอกลักษณ์คณิตศาสตร์ (Appendix Architecture):**
  - วางคำสั่ง `\appendix` **ก่อน** `\backmatter` พร้อมกำหนด `\renewcommand{\thechapter}{ก}` เพื่อรับกล่องแบนเนอร์เต็มรูปแบบ "ภาคผนวก ก" (44pt) และชื่อบท "สูตรคณิตศาสตร์..." (25pt) โดยรักษาเลขข้อย่อย ก.1, ก.1.1 ไม่ให้สูญหาย
- **ดัชนีสืบค้นคำสำคัญ 2 ภาษา (Bilingual Index):**
  - ติดตั้งด้วย `imakeidx` 2 คอลัมน์ เชื่อมโยงลง TOC
  - กำกับคำสำคัญทั้งภาษาไทยและภาษาอังกฤษ (`\index{คำศัพท์ (English term)}` และ `\index{English term}`)
  - แสดงผลท้ายเล่มใน `\backmatter` ด้วย `\clearpage\printindex`
- **ประวัติผู้เขียน (Author Biography Standard):**
  - จัดทำในสไตล์ Executive Monograph จบใน 1 หน้าเดียว (Single Page Fit)
  - ภาพถ่ายทรงกลม ผศ.ดร.ชีวะ ทัศนา ล้อมกรอบขอบทอง 2pt พร้อมเงาตกกระทบ
  - ส่วนล่างสองคอลัมน์สมดุล: ประวัติการศึกษา + ภาระงานสอน ฝั่งซ้าย และ ความเชี่ยวชาญ/งานวิจัย ฝั่งขวา

## 10. Pre-Publication Checklist

Before finalizing or deploying the textbook:

- [ ] Chapter Banner Box with physics vector underlay and flush-right titles is applied
- [ ] Numbered chapter titles set to 25pt, unnumbered chapter titles set to 29pt, and "บทที่ X" set to 44pt
- [ ] All Worked Examples use the correct template (P-S-C-T or C-C-A-F) consistently
- [ ] QED mark (■) appears flush right on every final answer line
- [ ] All scalar variables are in italic throughout
- [ ] All vector quantities use bold or arrow notation consistently
- [ ] All SI units are upright/roman throughout
- [ ] Every diagram is SVG stored in assets/diagrams/ with correct naming
- [ ] Vector color coding is correct and identical throughout the whole book
- [ ] Running headers: even pages = book/chapter title, odd pages = section title + page number
- [ ] Every new chapter starts on an odd page (page-break-before: right)
- [ ] All tables use `booktabs` without vertical lines, and have captions at the top without colons (`:`)
- [ ] List of Figures (สารบัญภาพ) and List of Tables (สารบัญตาราง) are generated with academic banners and linked in Table of Contents
- [ ] Appendix formulas (ภาคผนวก ก) placed before `\backmatter` with proper chapter banner and section numbering
- [ ] Bilingual Index (ดัชนีสืบค้นคำสำคัญ) with Thai & English entries is compiled and included in backmatter
- [ ] Author Biography (ประวัติผู้เขียน) includes circular gold-bordered portrait and fits cleanly on a single page
- [ ] Summary table is present at the end of every chapter
- [ ] Problem sets include all 5 category types and level badges

---

## References

Detailed analysis documents are available in the references/ folder:
- [Serway Solutions Manual Analysis](./references/serway_solutions_manual_analysis.md) — C-C-A-F, 5-Part Chapter Structure, Figure Inset Layout
- [Tipler & Mosca Textbook Analysis](./references/tipler_mosca_textbook_analysis.md) — P-S-C-T, Hybrid 3-Zone Grid, Dual-Layer Diagrams
