---
name: academic-book-cover-architect
description: กรอบการทำงานและมาตรฐานสากลสำหรับการออกแบบ จัดทำ และเรนเดอร์หน้าปกตำราและหนังสือวิชาการคุณภาพสูง (3D Pixar Semi-realistics & XeLaTeX TikZ Transparent Architecture) ครอบคลุมการจัดวางสัดส่วนภาพ 2:3 (6x9 นิ้ว), การบริหาร Negative Space, เทคนิค Dual-Layer Micro Drop-Shadow ไร้กล่องทึบบดบังภาพ, การแก้ปัญหาวรรณยุกต์และช่องไฟภาษาไทยด้วย XeTeXlinebreakskip, และหน้าปกในเวกเตอร์ TikZ Dark Mode
---

# 🎨 Academic Book Cover Architect
### สถาปัตยกรรมและมาตรฐานการออกแบบหน้าปกตำราวิชาการระดับพรีเมียม (3D Pixar Semi-realistics & XeLaTeX TikZ)

**Academic Book Cover Architect** คือกรอบระเบียบวิธีและพิมพ์เขียวเชิงเทคนิค (Technical Blueprint & Architectural Framework) สำหรับการสร้างสรรค์หน้าปกตำราวิชาการ หนังสือเรียน เอกสารคำสอน และคู่มือปฏิบัติการขั้นสูง โดยถอดรหัสจากมาตรฐานผลงานวิชาการชั้นนำ ผสานพลังระหว่าง **ภาพอาร์ตเวิร์ก 3D Pixar Semi-realistics** เข้ากับ **ระบบเรียงพิมพ์ XeLaTeX TikZ Overlay** ที่ให้คุณภาพความคมชัดระดับเวกเตอร์ 100% อ่านง่าย สง่างาม น่าเชื่อถือตามหลักวิชาการสากล และไม่บดบังความวิจิตรของภาพศิลป์

---

## 🏛️ 1. เสาหลักการออกแบบหน้าปก 5 ประการ (5 Architectural Pillars)

```
+--------------------------------------------------------------------------+
|                        1. UPPER SKY / NEGATIVE SPACE                     |
|  - ท้องฟ้าสีพาสเทลโปร่งตา ปราศจากองค์ประกอบรบกวน                            |
|  - ชื่อชุดหนังสือ / ระดับชั้น / ประเภทเอกสาร (Category Badge)               |
|  - ชื่อเรื่องภาษาไทย (2 บรรทัดสมดุล) + ชื่อเรื่องภาษาอังกฤษ                 |
|  - เทคนิค Dual-Layer Micro Drop-Shadow (ตัวอักษรเข้ม + เงาสีขาวบาง)       |
+--------------------------------------------------------------------------+
|                        2. MIDGROUND / SUBJECT FOCAL                      |
|  - จุดนำสายตาหลัก: ตัวละคร 3D Pixar AI Companion / Robot / เซนเซอร์       |
|  - ปฏิสัมพันธ์กับบริบทวิชาการ (เช่น ใบพืช, โฮโลแกรม, แปลงทดลอง, โรงเรือน)    |
|  - แสง Cinematic Studio Lighting / Golden Hour / Soft Rim Light         |
+--------------------------------------------------------------------------+
|                        3. FOREGROUND / ROOT & SOIL ZONE                  |
|  - ภาคตัดขวางดิน / ผืนดินสีเข้ม / โครงข่ายรากพืชเรืองแสง / พารามิเตอร์      |
|  - พื้นหลังมืดธรรมชาติ (Natural Dark Canvas) สำหรับวางข้อมูลผู้แต่ง       |
|  - ชื่อผู้แต่งภาษาไทย-อังกฤษ + สังกัดสถาบัน + โครงการ/ปีงบประมาณ           |
|  - เทคนิค Dual-Layer Micro Drop-Shadow (ตัวอักษรขาวสว่าง + เงาดำสนิท)    |
+--------------------------------------------------------------------------+
```

---

### เสาหลักที่ 1: สัดส่วนและรูปเล่มเรขาคณิต (2:3 Aspect Ratio & Full-Bleed 6 × 9 in)
* **ขนาดมาตรฐาน:** หนังสือขนาด **6 × 9 นิ้ว (15.24 × 22.86 cm)** ซึ่งเป็นมาตรฐานสากลของตำราพ็อกเก็ตบุ๊กวิชาการ (Royal/Pocket 8vo)
* **สัดส่วนภาพปก:** กำหนดสัดส่วน **2:3 อย่างเคร่งครัด** (เช่น 1600 × 2400 px หรือ 2400 × 3600 px)
* **การตัดตก (Full-Bleed):** หน้าปกต้องแสดงผลเต็มแผ่นขอบจรดขอบ 100% ไม่มีแถบขาว โดยใช้คำสั่งใน LaTeX:
  ```latex
  \begin{titlepage}
  \thispagestyle{empty}
  \begin{tikzpicture}[remember picture, overlay]
      \node[anchor=center, inner sep=0pt] at (current page.center) {
          \includegraphics[width=\paperwidth,height=\paperheight]{figures/cover_art.jpg}
      };
      ...
  \end{tikzpicture}
  \end{titlepage}
  \cleardoublepage
  ```

---

### เสาหลักที่ 2: วิศวกรรมพื้นที่ว่าง (Negative Space Engineering)
การเจนภาพหรือวาดภาพปกหนังสือ จะต้องสั่ง Prompt ให้จัดสรรพื้นที่ว่างล่วงหน้า:
1. **โซนบน (Upper 30%):** ท้องฟ้าโปร่ง อากาศสะอาด ไล่เฉดสีพาสเทลนุ่มนวล ห้ามมีกิ่งไม้ นก ยานบิน หรือรายละเอียดรก เพราะเป็นโซนวางหัวเรื่อง
2. **โซนกลาง (Middle 45%):** พื้นที่แอ็กชันและวัตถุเด่น วางตัวละครหุ่นยนต์/นักวิจัย/แปลงเกษตร
3. **โซนล่าง (Bottom 25%):** ผืนดินสีเข้มหรือพื้นผิวทึบ สำหรับวางข้อความเครดิตผู้แต่ง

---

### เสาหลักที่ 3: ระบบตัวอักษรโปร่งใสไร้กล่องทึบ (Transparent Mode with Dual-Layer Micro Shadows)
**ข้อห้ามเด็ดขาด:** อย่าใช้กล่องสี่เหลี่ยมทึบหรือแถบสีคาดขวางบดบังภาพ 3D
**แนวทางปฏิบัติ:** ใช้เทคนิค **เลเยอร์เงาซ้อนคู่ (Dual-Layer Micro Drop-Shadow)**:

#### ก. ข้อความบนท้องฟ้าสว่าง (Dark Text on Bright Sky):
* **เลเยอร์เงาสีขาว (Soft White Glow):** วางเยื้องเล็กน้อยเพื่อสกัดตัวอักษรออกจากเมฆ/ฟ้า
  ```latex
  \node[anchor=north, align=center, text width=5.2in] 
        at ([xshift=0.6pt, yshift=-0.44in]current page.north) {
      {\fontsize{18}{22}\selectfont\bfseries\color{white} ชื่อหนังสือบรรทัดที่ 1}\\[4pt]
      {\fontsize{20}{25}\selectfont\bfseries\color{white} ชื่อหนังสือบรรทัดที่ 2}
  };
  ```
* **เลเยอร์ตัวอักษรจริง (Rich Contrast Color):** วางทับด้วยสีน้ำเงินเข้ม เขียวมรกต หรือฟ้าน้ำทะเล
  ```latex
  \node[anchor=north, align=center, text width=5.2in] 
        at ([yshift=-0.45in]current page.north) {
      {\fontsize{18}{22}\selectfont\bfseries\color{blue!45!black} ชื่อหนังสือบรรทัดที่ 1}\\[4pt]
      {\fontsize{20}{25}\selectfont\bfseries\color{green!45!black} ชื่อหนังสือบรรทัดที่ 2}
  };
  ```

#### ข. ข้อความบนผืนดินมืด (Light Text on Dark Ground):
* **เลเยอร์เงาสีดำ (Drop Shadow):**
  ```latex
  \node[anchor=south, align=center, text width=5.2in] 
        at ([xshift=0.6pt, yshift=0.09in]current page.south) {
      {\fontsize{12}{15}\selectfont\bfseries\color{black} ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา}
  };
  ```
* **เลเยอร์ตัวอักษรจริง (Crisp White & Warm Gold):**
  ```latex
  \node[anchor=south, align=center, text width=5.2in] 
        at ([yshift=0.10in]current page.south) {
      {\fontsize{12}{15}\selectfont\bfseries\color{white} ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา}\\[2pt]
      {\fontsize{8.5}{11}\selectfont\color{white!95} สาขาวิชาปัญญาประดิษฐ์เพื่อเกษตรดิจิทัลและสิ่งแวดล้อม คณะวิทยาศาสตร์และเทคโนโลยี}\\[4pt]
      {\fontsize{8}{10}\selectfont\color{yellow!90!white} มหาวิทยาลัยราชภัฏรำไพพรรณี \textbullet\ พ.ศ. 2569}
  };
  ```

---

### เสาหลักที่ 4: การแก้ปัญหาช่องไฟและวรรณยุกต์ภาษาไทย (XeTeX Linebreak Skip Fix)
ใน XeLaTeX เมื่อใช้ `align=center` ตัวระบบมักจะกระจายช่องไฟระหว่างพยางค์ภาษาไทยทำให้คำแตกและอ่านไม่รู้เรื่อง  
**สูตรสำเร็จที่ต้องใช้เสมอ:**
```latex
\begingroup
\setlength{\XeTeXlinebreakskip}{0pt}
% บล็อกโค้ด TikZ สำหรับหน้าปกทั้งหมด
\end{tikzpicture}
\endgroup
```
คำสั่งนี้จะล็อคระยะห่างระหว่างพยางค์ให้แนบชิดเป็นธรรมชาติ สระบน-ล่างและวรรณยุกต์จะไม่ลอยหรือกระจัดกระจาย

---

### เสาหลักที่ 5: ลำดับชั้นตัวอักษรวิชาการมาตรฐาน (Typographic Hierarchy)

| ลำดับชั้น (Level) | ตัวอย่างข้อความ | ขนาดฟอนต์ | สีที่แนะนำ |
| :--- | :--- | :---: | :--- |
| **1. Category Badge** | `HANDS-ON WORKSHOP HANDBOOK • เอกสารประกอบการอบรม` | 8.5 pt Bold | `teal!80!black` / `white` |
| **2. Main Title Line 1** | `คู่มือการจัดเตรียมชุดข้อมูลและการฝึกอบรม` | 18–20 pt Bold | `blue!45!black` / Navy |
| **3. Main Title Line 2** | `ปัญญาประดิษฐ์เพื่อเกษตรดิจิทัลและสิ่งแวดล้อม` | 20–24 pt Bold | `green!45!black` / Emerald |
| **4. English Subtitle** | `SMART AGRICULTURE & SOIL-PLANT AI SYSTEM HANDBOOK` | 8.5–9 pt Bold | `gray!80!black` / Cyan |
| **5. Author Name** | `ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา` | 12–14 pt Bold | Pure White (`white`) |
| **6. Academic Affiliation**| `สาขาวิชา... คณะวิทยาศาสตร์และเทคโนโลยี มรภ.รำไพพรรณี` | 8.5–9.5 pt Regular | White 95% (`white!95`) |
| **7. Fiscal / Edition** | `โครงการวิจัยและพัฒนา... พ.ศ. 2569` | 8–8.5 pt Regular | Golden Yellow (`yellow!90!white`) |

---

## 🌌 2. สถาปัตยกรรมหน้าปกในเวกเตอร์ (Vector Inner Title Page)

หน้าปกใน (Inner Title Page) ควรสื่อถึงความทันสมัยในสไตล์ **Academic Dark-Mode Vector Art**:
* **พื้นหลัง:** ใช้คำสั่ง `\pagecolor{black!94}` และจบหน้าด้วย `\pagecolor{white}` เสมอ
* **ภาพประกอบกึ่งกลาง:** ใช้วิธีวาดด้วย **TikZ Bezier Curves** (ไม่ใช้ไฟล์ภาพราสเตอร์) เพื่อความคมชัด 100% ไม่แตกแม้ซูม 1000%
  * องค์ประกอบ: พระอาทิตย์เรืองแสง (`circle`), ทิวเขาระยะไกลและใกล้ (`.. controls ..`), คันดินและแปลงปลูกโค้งนำสายตา, โหนดเซนเซอร์ AI และต้นกล้าอ่อน
* **การคุมความยาว:** ต้องจัดองค์ประกอบให้จบลงพอดีใน **1 หน้าเดียว** อย่างสง่างามเสมอ โดยไม่ล้นไปหน้าถัดไป

---

## 🎨 3. สูตรพรอมต์สร้างภาพปก 3D Pixar (Prompt Engineering Formula)

เมื่อต้องสร้างภาพปกใหม่สำหรับหนังสือเล่มอื่นๆ ให้ใช้โครงสร้าง Prompt ดังนี้:

```text
3D Pixar animation style, semi-realistic digital art.
Subject: [ตัวละคร เช่น A friendly cute white AI agricultural robot / scientist] interacting with [หัวเรื่อง เช่น glowing durian fruit on tree / soil layers with root network / solar panels / drone].
Environment: Beautiful sunny lush Thai agricultural farm, rolling terraces, modern hi-tech greenhouse in distant background.
Lighting: Warm golden hour cinematic studio lighting, soft glowing rim lights, crystal-clear atmosphere.
Composition: 
- STRICT 2:3 vertical aspect ratio (for 6x9 inch book cover).
- EXPANSIVE open pastel sky at the top 35% with NO clutter, perfectly clean empty space for book title typography.
- Detailed focused subject in the center.
- Deep rich textured ground/soil at the bottom 25% with glowing roots and scientific icons, creating a dark natural canvas for author metadata.
Ultra high definition, 8k render, Unreal Engine 5 aesthetic, photorealistic textures, clean and inspiring educational masterpiece. --ar 2:3
```

---

## 📋 4. รายการตรวจสอบความสมบูรณ์ของปก (Cover Pre-Flight Audit Checklist)

ก่อนนำปกไปคอมไพล์หรือส่งพิมพ์ ให้ตรวจสอบตามเกณฑ์ 8 ข้อ:
- [ ] **สัดส่วน 2:3 เป๊ะ:** ไฟล์ภาพปกมีสัดส่วน 2:3 ตรงกับหน้าตัด 6 × 9 นิ้ว
- [ ] **Full-Bleed ไร้ขอบขาว:** วางโหนดที่ `current page.center` กว้างและสูงเท่ากับ `\paperwidth` และ `\paperheight`
- [ ] **Negative Space บน-ล่าง:** ท้องฟ้าด้านบนว่างพอสำหรับชื่อเรื่อง ผืนดินด้านล่างมืดพอสำหรับชื่อผู้แต่ง
- [ ] **ตัวอักษรโปร่งใส 100%:** ไม่ใช้กล่องสี่เหลี่ยมทึบคาดบังภาพ
- [ ] **มีเลเยอร์เงาซ้อนคู่:** ข้อความบนฟ้ามีเงาขาว ข้อความบนดินมีเงาดำ อ่านง่าย คมชัดทุกสภาพแสง
- [ ] **วรรณยุกต์และช่องไฟเกาะกลุ่ม:** มี `\setlength{\XeTeXlinebreakskip}{0pt}` ครอบบล็อกปก
- [ ] **หน้าปกในเป็นเวกเตอร์:** หน้าปกในคมกริบ จบพอดีใน 1 หน้า ไม่ล้น
- [ ] **คืนค่าสีหน้ากระดาษ:** หน้าถัดไปคืนค่าด้วย `\pagecolor{white}` และ `\cleardoublepage` ถูกต้อง

---

## 🌈 5. สถาปัตยกรรมหัวเรื่องขนาดใหญ่พิเศษหลากสี (2.5x Giant Multicolor Spectroscopy Title)

เมื่อต้องการเน้นย้ำชื่อเรื่องหลักให้โดดเด่นสะดุดตาขั้นสูงสุดด้วยขนาด **2.5 เท่า (50-60 pt)** พร้อมชุดสีสเปกตรัมหลากสี (Multicolor Plasma Spectroscopy):

### ก. กฎเหล็กการตัดคำภาษาไทย (Thai Cluster-Safe Coloring Rule)
ใน XeTeX ห้ามแยกคำระดับพยัญชนะกับสระบน-ล่าง/วรรณยุกต์ด้วยคำสั่ง `\color` เด็ดขาด (เช่น `{\color{red}ฟ}{\color{blue}ิ}`) เพราะจะทำให้วรรณยุกต์ลอยหรือกระจัดกระจาย  
**แนวทางปฏิบัติที่ถูกต้อง:** ให้จัดกลุ่มสีตาม **พยางค์หรือกลุ่มพยัญชนะ-สระควบแน่น (Consonant-Vowel Clusters)**:
```latex
% ตัวอย่าง: "พลาสมาฟิสิกส์" ขนาด 55pt หลากสีสเปกตรัมพลาสมา
{\fontsize{55}{62}\selectfont\bfseries%
{\color{specViolet}พลาส}%   % N2 UV & High Voltage Violet (#6B21A8)
{\color{specCyan}มา}%       % ·OH Radical Cyan (#0284C7)
{\color{specEmerald}ฟิ}%    % Agri Nitrogen Bio-Emerald (#047857)
{\color{specCoral}สิกส์}%   % Atomic Oxygen Solar Coral (#C2410C)
}
```

### ข. การซ้อนเลเยอร์เงาขาวบริสุทธิ์ (Pure White Micro Drop-Shadow)
เนื่องจากตัวอักษรหลากสีมีค่าความสว่างที่แตกต่างกัน ต้องวางเงาสีขาว `\color{white}` ขนาด 55pt เท่ากัน เยื้อง 0.6 pt ซ้อนใต้ตัวอักษรเสมอ เพื่อให้ทุกพยางค์ลอยเด่นอย่างคมชัด 100% เหนือท้องฟ้าพาสเทล

---

## ⚡ 6. โมดูลพลาสมาเกษตรและการตรึงไนโตรเจนเป็นปุ๋ยยูเรีย (Atmospheric N₂-to-Urea Synthesis Architecture)

สำหรับตำราหรือโครงการที่เน้น **พลาสมาเกษตรดิจิทัลและการฟื้นฟูสิ่งแวดล้อม (Plasma Agri-Physics & Environmental Science)** การออกแบบภาพปกควรผสานองค์ประกอบวิชาการ 4 ชั้น:

1. **Atmospheric Air Inflow (อากาศบรรยากาศ N₂ 78%):**
   - แสดงกระแสอนุภาคอากาศไหลวนเข้าสู่เครื่องปฏิกรณ์
2. **Plasma Arc Cleavage (การสลายพันธะ N≡N ด้วยพลาสมาอาร์ก):**
   - ท่อแก้วควอตซ์ทรงกระบอกคายประจุอาร์กเกลียวสีม่วง-ฟ้า (Gliding Arc / DBD Discharge) ขับเคลื่อนด้วยพลังงานแสงอาทิตย์ (Solar PV Canopy)
3. **Green Urea & Bio-Nitrate Synthesis (การสังเคราะห์ยูเรียและไนเตรต):**
   - แผนภาพการทำปฏิกิริยา $\text{N}_2 + \text{CO}_2 + 2\text{H}_2\text{O} \to (\text{NH}_2)_2\text{CO} + 2\text{O}_2$
   - ท่อส่งปุ๋ยยูเรียเหลวเรืองแสงเชื่อมต่อสู่ระบบน้ำหยด (Precision Fertigation Nano-mist)
4. **In-Situ Optical Emission Spectroscopy (OES Telemetry):**
   - แผงควบคุมโฮโลแกรมแสดงพีคสเปกโตรสโกปีของ $\cdot\text{OH}$ ($309\text{ nm}$), $\text{N}_2$ ($337\text{ nm}$) และ $\text{O}\text{ I}$ ($777\text{ nm}$)

---

## 🐍 7. ไปป์ไลน์การเรนเดอร์ภาพปกความละเอียดสูงผ่าน Python / Google Colab

การสร้างภาพปกความละเอียดสูง (6 × 9 นิ้วที่ 200–300 DPI, 1200×1800 ถึง 1800×2700 px) สามารถรันอัตโนมัติบน Google Colab หรือ Local Environment ด้วยสคริปต์ Python (Pillow + NumPy):
1. **โหลดภาพพื้นฐาน:** รองรับไฟล์ภาพตัวละคร 3D Pixar หรือบุคคลจริงในชุดวิจัย
2. **สร้างเลเยอร์ฟิสิกส์พลาสมา:** วาดลำเจ็ตพลาสมา (Multi-layered Gaussian blurred glow) พร้อมโมเลกุลชีวกัมมันต์ ($\cdot\text{OH}, \text{O}_3, \text{NO}_3^-, \text{H}_2\text{O}_2, \text{ONOO}^-$)
3. **โอเวอร์เลย์โฮโลแกรม OES:** เรนเดอร์เส้นโค้งสเปกตรัมการแตกตัวของไนโตรเจน
4. **ส่งออกไฟล์อาร์ตเวิร์ก:** เซฟเป็นไฟล์ JPEG/PNG คุณภาพ 96% เพื่อให้ XeLaTeX ดึงไปประกอบกับระบบตัวอักษรเวกเตอร์ TikZ ได้ทันที
