---
name: modern-academic-textbook
description: สกิลการจัดทำและเรนเดอร์ตำราวิชาการ หนังสือเรียน และ E-Book ระดับ Masterclass สไตล์ Modern Academic (Springer / MIT Press / Cambridge) กั้นซ้าย 1.5 นิ้ว หน้าคู่ เริ่มบทใหม่หน้าคี่ แผนผังเวกเตอร์ SVG คมชัด 100% ไร้คราบ AI พร้อมระบบเรนเดอร์ PDF และ EPUB 3.0 อัตโนมัติ
---

# 📚 Modern Academic Textbook Architecture

**Modern Academic Textbook** คือระเบียบวิธีและชุดเครื่องมืออัตโนมัติสำหรับการผลิตและจัดพิมพ์ **ตำราวิชาการ หนังสือเรียน และ E-Book คุณภาพสูงระดับโลก (Bestseller & High-Grade Academic Publication)** ผสมผสานความลุ่มลึกทางวิชาการตามมาตรฐานกระทรวง อว. เข้ากับสุนทรียศาสตร์การออกแบบร่วมสมัยสไตล์ **MIT Press, Springer, Cambridge University Press, และ O'Reilly**

---

## 📐 1. สถาปัตยกรรมการจัดหน้าและขอบกระดาษ (Page Geometry & Layout Rules)

ในการจัดทำหนังสือและเอกสารตำราฉบับสมบูรณ์ ต้องบังคับใช้กฎเรขาคณิตของหน้ากระดาษดังนี้:

### 📏 A. ระยะขอบกระดาษมาตรฐานโรงพิมพ์ (Print Margins)
* **กั้นใน / กั้นซ้าย (Inside Margin / Left Gutter):** `1.5 นิ้ว (38.1 mm)` เพื่อรองรับการเข้าเล่มสันกาว (Perfect Binding) หรือเย็บกี่
* **ขอบบน (Top Margin):** `1.0 นิ้ว (25.4 mm)`
* **ขอบล่าง (Bottom Margin):** `1.0 นิ้ว (25.4 mm)`
* **ขอบนอก / ขอบขวา (Outside Margin / Right):** `1.0 นิ้ว (25.4 mm)`

### 📖 B. การจัดหน้าคู่แบบสลับด้าน (Two-Page Spread Layout)
* **หน้าซ้าย (หน้าคู่ / Even Pages - `@page :left`):**
  * ขอบซ้าย (Outside): `1.0 in`, ขอบขวา (Inside): `1.5 in`
  * **Running Header ด้านซ้าย:** แสดงชื่อหนังสือหลัก (เช่น *วิทยาการคำนวณ 1 รากฐานแนวคิดเชิงคำนวณ*)
  * **เลขหน้า:** ชิดขอบขวาเสมอ (`text-align: right`)
* **หน้าขวา (หน้าคี่ / Odd Pages - `@page :right`):**
  * ขอบซ้าย (Inside): `1.5 in`, ขอบขวา (Outside): `1.0 in`
  * **Running Header ด้านขวา:** แสดงชื่อบทเรียน (เช่น *บทที่ 2 การออกแบบขั้นตอนวิธีและผังงานมาตรฐาน*)
  * **เลขหน้า:** ชิดขอบขวาเสมอ (`text-align: right`)

### 🌟 C. หน้าเปิดบทใหม่ (Chapter Opener on Odd Pages)
* **บังคับเริ่มบทใหม่ที่หน้าเลขคี่เสมอ:** กำหนด `break-before: right;` หรือ `page-break-before: right;`
* **รูปแบบหน้าเปิดบทที่โดดเด่น (Hero Chapter Opener):**
  * การ์ดหัวบท Gradient สีน้ำเงินเข้ม-เนวีสเลท (`#091328` ถึง `#1e293b`) พร้อมเส้นขอบซ้ายหนาสีฟ้าเทอร์ควอยซ์ (`#0ea5e9`)
  * ป้ายแบดจ์หัวบท **`CHAPTER XX • วิทยาการคำนวณ`**
  * แสดงข้อมูลผู้เขียน สังกัด และรหัสวิชา
  * **ซ่อน Running Header ที่หัวกระดาษในหน้าแรกของบท** เพื่อความสะอาดตา

---

## ✍️ 2. กฎการเขียนภาษาไทยวิชาการไร้คราบ AI (Anti-AI-Slop & Academic Voice)

ตำราต้องมีความสละสลวยตามแบบแผนภาษาไทยวิชาการระดับสูง โดยกำจัดจุดบกพร่องและคำบอกใบ้ของ AI (AI-Tell Patterns) ตามมาตรฐาน `anti-ai-slop`:

### 🚫 A. บัญชีดำคำและโครงสร้างประโยค AI (Denylist Vocabulary & Clichés)
* **คำฟุ่มเฟือยและคำฮิตติดปากของ AI:**
  * ❌ ห้ามใช้: *delve (เจาะลึก/สำรวจลึกซึ้งพร่ำเพรื่อ), tapestry (สายใย/ภาพรวมที่ถักทอ), crucial/pivotal (สิ่งสำคัญยิ่งยวดแบบซ้ำซาก), seamless (อย่างราบรื่นไร้รอยต่อ), robust (แข็งแกร่งทนทานในทุกบริบท), leverage (ยกระดับ/ใช้ประโยชน์พร่ำเพรื่อ), elevate, navigate (นำทาง/ฝ่าฟันความท้าทาย), "ในขอบเขตของ...", "สิ่งสำคัญที่ต้องทราบคือ..."*
  * ❌ ห้ามใช้คำเปิดฉากสำเร็จรูป: *"ในโลกยุคปัจจุบันที่หมุนไปอย่างรวดเร็ว...", "ในยุคดิจิทัลที่ก้าวล้ำ..."*
  * ❌ ห้ามใช้โครงสร้างประโยคแบบคู่สมมาตร AI: *"ไม่เพียงแต่เป็น X เท่านั้น แต่ยังเป็น Y อีกด้วย"* (ให้ใช้ประโยคยืนยันตรงประเด็น)
* **กฎภาษาไทยวิชาการเฉพาะ:**
  * ❌ ห้ามมีเครื่องหมายทวิภาค (`:`) ในภาษาไทย: ไม่ใช้ `ผู้เขียน:`, `วัตถุประสงค์:`, `ดังนี้:`, `โจทย์:`, `PICTURE:`, `SOLVE:`, `CHECK:`, `ระดับพื้นฐาน:`, `(English: Abbr)` $\implies$ ✅ ให้ใช้ `ผู้เขียน`, `วัตถุประสงค์`, `ดังนี้`, `โจทย์`, `PICTURE`, `SOLVE`, `CHECK`, `ระดับพื้นฐาน`, `(English หรือ Abbr)`
  * ❌ ห้ามใส่เครื่องหมายคำพูด (`" "`, `“ ”`) พร่ำเพรื่อกับคำศัพท์ทั่วไป
  * ❌ ตัดคำแปลภาษาอังกฤษในวงเล็บซ้ำซ้อน: ใส่เฉพาะในตารางนิยามศัพท์หรือการกล่าวถึงครั้งแรกเท่านั้น (และห้ามใส่วงเล็บภาษาอังกฤษในชื่อหัวข้อ \section, \subsection)

### 🎵 B. ความหลากหลายของจังหวะประโยค (Sentence Rhythm & Burstiness)
* **ธรรมชาติของมนุษย์มีความแปรผัน (Burstiness):** ประโยคต้องมีทั้งประโยคสั้นกระชับ สลับกับประโยคอธิบายยาวอย่างเป็นธรรมชาติ
* **หลีกเลี่ยงความยาวประโยคที่สม่ำเสมอเกินไป (AI Uniformity):** ไม่เขียนประโยคที่มีความยาว $18\text{--}22$ คำติดต่อกันเกิน 3 ประโยค

### ⚖️ C. การสงวนข้อความกำกวมที่มีหลักฐานรองรับ (Warranted Hedges vs Empty Hedging)
* **ตัดคำหลบเลี่ยงกลวงๆ (Empty Hedging):** ตัดวลีเช่น *"อาจกล่าวได้ว่าโดยทั่วไปแล้ว", "ในหลายๆ กรณีอาจเป็นไปได้ว่า"*
* **คงการระบุความไม่แน่นอนทางวิทยาศาสตร์ที่แท้จริง (Warranted Uncertainty):** ผลการทดลองที่ยังเป็นสมมติฐานหรือมีเงื่อนไขจำกัด ให้คงการระบุขอบเขตความเชื่อมั่นไว้อย่างเคร่งครัดตามหลักวิชาการ

---

## 🎨 3. การแสดงผลแผนผังเวกเตอร์ SVG และสื่อภาพ (100% Vector Crispness)

* **ห้ามปล่อยบล็อกโค้ด Mermaid (````mermaid ... ````) ค้างไว้ในหนังสือ:**
  * ต้องแปลงผังงาน ทฤษฎี และโฟลว์ชาร์ตทั้งหมดเป็น **ไฟล์ภาพเวกเตอร์ SVG คุณภาพสูง** ในโฟลเดอร์ `assets/diagrams/`
  * ฝังภาพด้วยแท็ก HTML/Markdown พร้อมคำบรรยายใต้ภาพ:
    ```html
    <div align="center" style="margin: 24px 0; page-break-inside: avoid;">
      <img src="../assets/diagrams/ch02_fig01_algorithm_properties.svg" alt="แผนผังขั้นตอนวิธี" style="max-width: 100%; max-height: 480px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);" />
      <p style="color: #64748b; font-size: 0.88em; margin-top: 6px;"><em>ภาพที่ 2.1 แผนผังโครงสร้าง 5 คุณสมบัติของขั้นตอนวิธีที่ดี</em></p>
    </div>
    ```
* **การป้องกันองค์ประกอบแตกข้ามหน้า (Page-fit Control):**
  * ตาราง (`table`), กล่องโค้ด (`pre`), กล่องข้อความ (`.alert-box`, `blockquote`), และรูปภาพ (`img`) ต้องกำหนด `page-break-inside: avoid;` เสมอ

---

## 💻 4. โค้ดคอมพิวเตอร์และสมการคณิตศาสตร์

* **Syntax Highlighting:** ใช้ชุดสี **Atom One Dark** ควบคู่กับฟอนต์ **Fira Code** พร้อมระบุภาษาอย่างชัดเจน
* **Mathematical Typography:** ใช้ **KaTeX** สำหรับเรนเดอร์สมการคณิตศาสตร์ทั้งแบบ Inline (`$...$`) และ Display Block (`$$...$$`) คมชัดระดับ Vector

---

## 🚀 5. คำสั่งและสคริปต์คอมไพเลอร์อัตโนมัติ (Automated Build Commands)

### 📄 คำสั่งเรนเดอร์ Academic Luxury PDF (Chrome Headless)
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless --disable-gpu --no-sandbox \
  --run-all-compositor-stages-before-draw --virtual-time-budget=4000 \
  --print-to-pdf="dist_ebooks/book1_computing_science.pdf" \
  --no-pdf-header-footer \
  "file:///Applications/XAMPP/xamppfiles/htdocs/rbrumooc/cs2026_series/dist_ebooks/chapter02_style1_academic_mit_springer.html"
```

### 📱 คำสั่งสร้าง EPUB 3.0 E-Book (Pandoc)
```bash
pandoc input_book.md -o output_book.epub \
  --epub-cover-image="assets/book1_images/fig_cover_book1.jpg" \
  --metadata title="วิทยาการคำนวณ 1 รากฐานแนวคิดเชิงคำนวณ" \
  --metadata author="ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา" \
  --metadata publisher="สำนักพิมพ์มหาวิทยาลัยราชภัฏรำไพพรรณี" \
  --metadata language="th" \
  --toc --webtex
```

---

## 📊 5. สถาปัตยกรรมเอกสาร LaTeX วิชาการ (LaTeX Textbook Architecture)

ในการจัดทำตำราวิชาการระดับ Masterclass ด้วย LaTeX (XeLaTeX) ต้องยึดถือข้อกำหนดโครงสร้างดังนี้:

### A. ตารางทางวิชาการและคำบรรยายภาพ-ตารางมาตรฐานสากล (Universal Academic Tables & Captions)
* ใช้แพ็กเกจ `booktabs` (`\toprule`, `\midrule`, `\bottomrule`) โดยปราศจากเส้นคั่นแนวตั้ง (`|`)
* **ตำแหน่ง Caption:** คำบรรยายตาราง (`\caption{...}`) ต้องอยู่ **ด้านบน** และ **จัดชิดขอบขวา** ของตาราง/หน้ากระดาษ (Flush Right ด้วย `justification=raggedleft, singlelinecheck=false`) เสมอ (ต่างจากภาพที่อยู่ด้านล่างและจัดกึ่งกลาง)
* **การบังคับใช้ภาษาไทย "ภาพที่" และ "ตารางที่" (100% Thai Caption & \mbox Binding):**
  - ใน XeLaTeX ต้องประกาศทั้งใน Preamble และภายใน `\AtBeginDocument{...}` เพื่อป้องกันการถูกเขียนทับเป็น "Figure" หรือ "Table"
  - ครอบด้วย `\mbox{ภาพที่}` และ `\mbox{ตารางที่}` เสมอ เพื่อป้องกัน `\XeTeXlinebreaklocale "th_TH"` แทรกช่องว่างวรรคตอนกลายเป็น `"ภาพ ที่"` ในพื้นที่แคบ
    ```latex
    \renewcommand{\figurename}{\mbox{ภาพที่}}
    \renewcommand{\tablename}{\mbox{ตารางที่}}
    \AtBeginDocument{
        \gdef\figurename{\mbox{ภาพที่}}
        \gdef\tablename{\mbox{ตารางที่}}
        \captionsetup[figure]{name={\mbox{ภาพที่}}}
        \captionsetup[table]{name={\mbox{ตารางที่}}}
    }
    ```
* **การป้องกันแผนภาพเวกเตอร์ TikZ / SVG ล้นขอบกั้นซ้าย 1.5 นิ้ว (Strict 1.5" Left-Margin Compliance):**
  - หนังสือตำรา RBRU กั้นซ้าย 1.5 นิ้ว (38.1 mm) เพื่อการเข้าเล่ม
  - ครอบแผนภาพ TikZ ด้วย `\resizebox{0.88\textwidth}{!}{...}` หรือ `0.85\textwidth` เพื่อให้มี Safety Margin ทั้งสองด้าน
  - แผนภาพที่มีลูปวนกลับด้านขวา ต้องใส่พิกัดสมดุลด้านซ้าย `\path (leftmost.west) ++(-X,0) coordinate (lb);` เพื่อป้องกัน TeX จัดกึ่งกลาง Bounding Box แล้วผลักบล็อกซ้ายกินพื้นที่ขอบกั้นซ้าย
  - ล็อกความสูงรูปภาพใน Minipage คู่: `\includegraphics[height=5.0cm,width=\textwidth,keepaspectratio]{...}` ป้องกันล้นขอบกระดาษ

### B. สารบัญภาพและสารบัญตาราง (List of Figures & List of Tables)
* กำหนดชื่อภาษาไทยมาตรฐาน:
  ```latex
  \renewcommand{\listfigurename}{สารบัญภาพ}
  \renewcommand{\listtablename}{สารบัญตาราง}
  ```
* เชื่อมโยงลงสารบัญหลัก (`\tableofcontents`) อย่างถูกต้อง:
  ```latex
  \clearpage\phantomsection\addcontentsline{toc}{chapter}{\listfigurename}\listoffigures
  \clearpage\phantomsection\addcontentsline{toc}{chapter}{\listtablename}\listoftables
  ```

### C. ระบบดัชนีสืบค้นคำสำคัญ 2 ภาษา (Bilingual Indexing System)
* ใช้แพ็กเกจ `imakeidx` จัดเลย์เอาต์ 2 คอลัมน์ เชื่อมโยงลง TOC:
  ```latex
  \RequirePackage{imakeidx}
  \makeindex[columns=2, title=ดัชนีสืบค้นคำสำคัญ, intoc]
  ```
* แทรกคำค้นทั้งภาษาไทยและภาษาอังกฤษในทุกบทเรียน:
  `\index{คำศัพท์ภาษาไทย (English Term)}` และ `\index{English Term}`
* วาง `\clearpage\printindex` ในส่วน `\backmatter` ท้ายเล่ม
* การคอมไพล์ที่สมบูรณ์แบบ:
  ```bash
  xelatex -interaction=nonstopmode main.tex && makeindex main.idx && xelatex -interaction=nonstopmode main.tex
  ```

### D. กล่องหัวบทวิชาการระดับ Masterclass (Academic Chapter Banner Architecture)
* ใช้ `tcolorbox` แบบเต็มหน้ากระดาษ (`width=\textwidth`) ร่วมกับ TikZ Vector Underlay แบบโปร่งแสง
* พื้นหลังไล่ระดับสีน้ำเงินเข้มหรูหรา ขอบทองด้านขวาหนา 4pt (`borderline east={4pt}{0pt}{rbruGold}`)
* การจัดวางชิดขอบขวา (`\raggedleft`):
  - **"บทที่ X"**: ขนาดใหญ่ 2 เท่าที่ **`44pt`** (`\fontsize{44}{50}\selectfont\bfseries\color{white}`)
  - **เส้นคั่นทอง**: ยาว 0.50\textwidth หนา 2pt
  - **"ชื่อบท" (Numbered Chapters)**: ปรับขนาดสมดุลที่ **`25pt`** (`\fontsize{25}{31}\selectfont\bfseries\color{white}`) สวยงาม ไม่แออัด และตัดคำอัตโนมัติอย่างลงตัว
  - **หัวบทไม่มีหมายเลข (Unnumbered Chapters)**: ใช้ขนาด **`29pt`** (`\fontsize{29}{35}\selectfont\bfseries\color{white}`) สำหรับคำนำ สารบัญ บรรณานุกรม ดัชนีสืบค้น และประวัติผู้เขียน

### E. ภาคผนวกและระบบนับเลขวิชาการ (Appendix Architecture)
* ใน LaTeX `book.cls` ต้องวางคำสั่ง `\appendix` **ก่อน** `\backmatter` เสมอ
* กำหนดระบบนับเลขบทเป็นอักษรไทย: `\renewcommand{\thechapter}{ก}`
* ผลลัพธ์: จะได้รับกล่องแบนเนอร์หัวบทเต็มรูปแบบ **"ภาคผนวก ก"** (44pt) และชื่อบท "สูตรคณิตศาสตร์และเอกลักษณ์เวกเตอร์พื้นฐาน" (25pt) พร้อมรักษาระดับการนับเลขหัวข้อย่อยเป็น **ก.1, ก.1.1** ถูกต้อง

### F. หน้าประวัติผู้เขียนระดับ Masterclass (Executive Monograph Biography)
* บังคับจัดวางให้สมบูรณ์จบใน **1 หน้าเดียว (Single Page Fit)** ปราศจากการล้นหน้า
* **ภาพถ่ายทรงกลม:** ภาพถ่ายผู้เขียนทรงกลมล้อมกรอบทอง 2pt (`draw=rbruGold, line width=2pt`) พร้อมเงาตกกระทบแบบโปร่งแสง
* **ตำแหน่งและชื่อ:** ระบุ "ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา"
* **การแบ่งเลย์เอาต์:**
  - ส่วนบน: ซ้ายภาพถ่าย (`0.28\textwidth`) ขนานกับชื่อ ตำแหน่ง สังกัด และอีเมล (`0.69\textwidth`)
  - คั่นด้วยเส้น horizontal rule สีสุภาพ
  - ส่วนล่างแบบสองคอลัมน์สมดุล (`0.48\textwidth` ทั้งสองฝั่ง):
    - ฝั่งซ้าย: **ประวัติการศึกษา** (ปร.ด. ฟิสิกส์ประยุกต์ สจล., วท.ม. ฟิสิกส์ประยุกต์ สจล., วท.บ. ฟิสิกส์ คอมพิวเตอร์และอิเล็กทรอนิกส์ ม.นเรศวร) และ **ภาระงานสอนประจำ**
    - ฝั่งขวา: **ความเชี่ยวชาญและงานวิจัยที่สนใจ** (ฟิสิกส์เชิงคำนวณ, เกษตรอัจฉริยะ, ปัญญาประดิษฐ์และการเรียนรู้เชิงลึก)

### G. สถาปัตยกรรมหน้าปก 3D Vector TikZ ระดับ Masterclass และการคุมพิกัด (Zero-Margin Titlepage)
* **การคุมพิกัดขอบหน้ากระดาษแท้จริง (Zero Margin Boundary):**
  - ในส่วนหน้าปก `\begin{titlepage}` ต้องประกาศ `\newgeometry{margin=0pt}` ทันที และจบด้วย `\restoregeometry` หลัง `\end{titlepage}`
  - เพื่อให้พิกัด `(current page.south west)` และ `(current page.north east)` ของ TikZ ทาบทับลงบนแผ่นกระดาษขนาด 210 x 297 mm ได้อย่างสมบูรณ์แบบ ไม่ถูกเลื่อนหลุดตามขอบกระดาษเล่มปกติ (1.5 นิ้ว / 1.0 นิ้ว)
  - **การคอมไพล์ 2 รอบ:** คำสั่ง TikZ `[remember picture, overlay]` บันทึกค่าพิกัดลงในไฟล์ `.aux` จึงต้องคอมไพล์ด้วย XeLaTeX อย่างน้อย 2 รอบเสมอเพื่อให้การ์ดและป้ายข้อความวางตำแหน่งถูกต้อง 100%
* **การจัดวาง Header ด้านบนแบบไร้การเหลื่อมล้ำ (No-Overlap Header & Ribbon):**
  - ใช้ TikZ Node บริสุทธิ์แยกตำแหน่งซ้าย-ขวาอย่างอิสระ:
    - ฝั่งซ้าย: `\node[anchor=north west, align=left] at ($(current page.north west)+(1.8, -1.5)$)` บรรจุชื่อโครงการตำราเฉลิมพระเกียรติ มหาวิทยาลัยราชภัฏรำไพพรรณี
    - ฝั่งขวา: `\node[anchor=north east, align=center, rounded corners=2.5mm, ...] at ($(current page.north east)+(-1.8, -1.5)$)` บรรจุป้ายชื่อหมวดหมู่วิชาการ
  - หลีกเลี่ยงการซ้อน `minipage` ขนาดกว้างเกินไป หรือซ้อน `tcolorbox` ในโหนดลอยโดยไม่กำหนดกรอบความกว้างที่รัดกุม

### H. ฐานข้อมูลและโครงสร้างชุดตำราวิชาการ 4 เล่มใหม่ (RBRU 2026 Textbook Corpus Architecture)
1. **เล่ม 08: จุลชีววิทยาสิ่งแวดล้อมและการวิเคราะห์คุณภาพน้ำ (`08_MicroEnvi`)**
   - 12 บทเรียนสมบูรณ์ + นวัตกรรมบำบัดน้ำเสีย Bioblock
   - พาเลตต์สี: Oceanic Navy (`#061426`), Aqua Cyan (`#06B6D4`), Emerald Green (`#10B981`), Amber Gold (`#F59E0B`)
2. **เล่ม 09: เกษตรอัจฉริยะและปัญญาประดิษฐ์เพื่อการจัดการสวนทุเรียนและคุณภาพดิน (`09_Smart_Agriculture_AIoT`)**
   - 8 บทเรียนสมบูรณ์ + ฟิสิกส์ทุเรียน + SoilAI ภาพถ่ายสมาร์ทโฟน + ระบบน้ำอัจฉริยะสวนทุเรียนจันทบุรี
   - พาเลตต์สี: Deep Forest Green (`#064E3B`), Durian Gold (`#D97706`), Leaf Soft (`#A7F3D0`)
3. **เล่ม 10: ฟิสิกส์สิ่งแวดล้อม การตรวจวัด PM2.5 และนวัตกรรมพลังงานชีวมวล (`10_Environmental_Physics_Biomass`)**
   - 8 บทเรียนสมบูรณ์ + การตรวจวัด PM2.5 ด้วยภาพถ่ายสมาร์ทโฟน + งานวิจัยถ่านอัดแท่งคาร์บอนแบล็ค (Thassana & Nuleg) + คาร์บอนเครดิต T-VER
   - พาเลตต์สี: Carbon Navy (`#0F172A`), Sky Blue (`#0284C7`), Flame Amber (`#EA580C`), Clean Green (`#059669`)
4. **เล่ม 11: ฟิสิกส์พื้นฐานและคู่มือปฏิบัติการสำหรับวิทยาศาสตร์ชีวภาพและสิ่งแวดล้อม (`11_General_Physics_LifeSciences`)**
   - 13 บทเรียนสมบูรณ์ + คู่มือปฏิบัติการวัดละเอียดเวอร์เนียร์/ไมโครมิเตอร์/สเฟียโรมิเตอร์ + ชุดข้อสอบประยุกต์ชีวภาพ
   - พาเลตต์สี: Deep Royal Blue (`#1E3A8A`), Sky Cyan (`#0284C7`), Physics Amber (`#D97706`), Bio Emerald (`#059669`)



### I. สถาปัตยกรรมหน้าปกแอปพลิเคชันสมาร์ทโฟนระดับเรือธงและภาพ 3D PR (Flagship Smartphone UI & PR Cover Architecture)
เพื่อสะท้อนนวัตกรรมซอฟต์แวร์ คอมพิวเตอร์วิทัศน์ และปัญญาประดิษฐ์บนอุปกรณ์พกพา หน้าปกสามารถออกแบบในลักษณะหน้าจอแอปพลิเคชันสมาร์ทโฟนระดับเรือธง (Flagship Smartphone Application Screen):
* **ตัวเครื่องสมาร์ทโฟนไทเทเนียมและจอ OLED ขอบมน:** ใช้กรอบ TikZ วาดตัวเครื่อง Dark Obsidian พร้อมเส้นสะท้อนแสงโลหะ rounded corners 1.4cm และจอภาพโค้งมน rounded corners 1.2cm
* **แถบสถานะสมาร์ทโฟนและ Dynamic Island:** 
  - ซ้าย: เวลาดิจิทัล 13:40 และเครือข่ายความเร็วสูง 5G RBRU-AGRI
  - กลาง: แคปซูล Dynamic Island สีดำสนิทขอบนีออน บรรจุเลนส์กล้องหน้า เซนเซอร์ และข้อความสถานะ SOIL AI VISION PRO
  - ขวา: สัญญาณ GPS, Wi-Fi 6, และระดับแบตเตอรี่ [ 100% ]
* **ชื่อหนังสือขนาดใหญ่พิเศษ 2.5 เท่า (2.5x Hero Title Billboard):** 
  - ชื่อเรื่องหลักขยายใหญ่ระดับ 36pt ถึง 44pt เพื่อสร้างจุดนำสายตาระดับ Masterclass คมชัด โดดเด่น
  - แบ่งวรรคตอนภาษาไทยอย่างประณีต คำนำหน้าชื่อ (ขาว 42pt), คีย์เวิร์ดวัตถุประสงค์ (ฟ้าไซเบอร์ 40pt), วิธีการทางฟิสิกส์ (ขาว 36pt), นวัตกรรมปัญญาประดิษฐ์ (เขียวมรกต 32pt)
* **ช่องมองภาพกล้องสดและเรดาร์วิทัศน์ผสานภาพ 3D PR (Live Camera HUD & 3D PR Viewport):**
  - ฝังภาพเรนเดอร์ 3 มิติคุณภาพสูงจากคลังภาพประชาสัมพันธ์ (assets/pr เช่น jc_soil_ai_pr_square_1x1.jpg, jc_soil_ai_pr_vertical_9x16.jpg, หรือ jc_soil_ai_pr_banner_16x9.jpg) ไว้ภายในกรอบช่องมองภาพ
  - สวมทับด้วยกรอบช่วยเล็ง HUD 4 มุม, สถานะการบันทึก REC 60 FPS | WB 5000K CRI >= 95, วงแหวนเรขาคณิต Circular Reticle และเส้นปิดรูปทรงโพลีกอนอิสระ (Interactive Polygon ROI) สีเขียวนีออนโปร่งแสง
* **แดชบอร์ดค่าวิเคราะห์ AI (Multimodal AI Telemetry Dashboard Card):**
  - กล่องกระจกโปร่งแสง Dark Glassmorphism บรรจุการ์ดตัวชี้วัดสำคัญ 4 ช่อง (SOM %, Optical pH, Delta pH Consistency, N-P-K) และแถบเซนเซอร์กายภาพ 7-in-1
* **แถบนำทางและขีดสัมผัสโฮม (Bottom Navigation & Home Gesture Bar):**
  - แถบเมนู 4 แท็บล่างสุด [กล้องสตรีมสด] [สัมผัส ROI] [ฟิวชัน 16 มิติ] [สอบเทียบมาตรฐาน]
  - แถบสัมผัสโฮมสีขาวโปร่งแสงความหนา 3.0pt
* **ข้อบังคับปลอดเครื่องหมายทวิภาค (Strict Zero-Colon Enforcement):** ห้ามใช้เครื่องหมายโคลอน (:) ในข้อความบรรยาย แคปชัน หรือหัวข้อย่อยภาษาไทยบนหน้าปกโดยเด็ดขาด

### J. การจัดสารบัญ สารบัญตาราง และสารบัญภาพ กึ่งกลางหน้ากระดาษ (Centered Thai TOC/LOT/LOF Architecture)
ตามแบบแผนสิ่งพิมพ์ทางวิชาการและระเบียบมหาวิทยาลัยราชภัฏรำไพพรรณี (RBRU):
* **การแปลงชื่อภาษาอังกฤษสู่ภาษาไทย:**
  - Contents -> สารบัญ
  - List of Tables -> สารบัญตาราง
  - List of Figures -> สารบัญภาพ
  - Bibliography -> บรรณานุกรม
* **การกำหนดแมโครในไฟล์สไตล์ (rbru_style.sty):**
  - กำหนด contentsname, listtablename, listfigurename, bibname ให้เป็นภาษาไทยทั้งในส่วนต้นและใน AtBeginDocument
* **การจัดตำแหน่งกึ่งกลางหน้ากระดาษ (Horizontal Centering):**
  - กำหนดให้แบนเนอร์บทที่ไม่ระบุหมายเลข (rbruunnumberedchapterbanner) วางข้อความแบบกึ่งกลางสมบูรณ์ (halign=center และ \centering)
  - ใช้เส้นขลิบทองราชภัฏสมมาตรทั้งขอบบนและล่าง (borderline north และ borderline south)
  - ห้ามจัดชิดขวา (halign=right) สำหรับสารบัญ สารบัญตาราง และสารบัญภาพ
