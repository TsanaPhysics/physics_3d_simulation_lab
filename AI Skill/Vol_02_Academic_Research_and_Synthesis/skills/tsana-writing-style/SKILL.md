---
name: tsana-writing-style
description: >-
  Guides the agent on how to draft textbooks, handouts, and explanations in the unique writing style, language, and layout of Dr. Chewa Thassana and Dr. Jirapat Janthamalee for the RBRU MicroBio Series.
---

# MicroBio Series Writing Style Guidance (RBRU)

## Overview
This skill provides specific writing, language, and formatting guidelines to mimic the pedagogical style of Dr. Jirapat Janthamalee and Dr. Chewa Thassana for the MicroBio Series (textbooks for Rambhai Barni Rajabhat University). It ensures that all textbook chapters, lecture notes, and diagrams align with the series' standards in vocabulary, tone, historical context, math derivations, chapter syllabi, and vector graphics.

---

## 1. Page Geometry & Fonts (RBRU Standard)
*   **Dimensions**: Trade book size (6" x 9" / 15.24 cm x 22.86 cm).
*   **Margins**: Top/Bottom = 0.85 in, Inner = 0.75 in, Outer = 0.6 in.
*   **Fonts**: `Sarabun` (Regular, Bold, Italic) for both Thai body text and headings.
*   **Line Spacing**: 1.25. Paragraph skip: 8pt.
*   **Engine**: XeLaTeX with `polyglossia` (default: Thai, secondary: English).

---

## 2. Writing & Tone Guidelines

### 2.1 Tone and Vocabulary
*   **Target Audience**: Undergraduate science students (Pure, Applied, and Science Education/ครุศาสตร์).
*   **Academic Transitions**: Use standard academic Thai connectors:
    *   `นั่นคือ` (that is / which means)
    *   `จะได้` (we obtain / yielding)
    *   `พิจารณา` (consider / looking at)
    *   `เนื่องจาก... ดังนั้น...` (since... therefore...)
*   **Bilingual Nomenclature**: Always write English scientific terms in parentheses adjacent to their Thai translations upon first mention, and periodically for clarity.
    *   *Examples*: `ปั๊มคาร์บอนทางชีวภาพ (biological carbon pump)`, `การส่งต่ออิเล็กตรอนภายนอกเซลล์ (extracellular electron transfer)`, `พลาสติกย่อยสลายได้ทางชีวภาพ (biodegradable plastics)`

### 2.2 Historical Context
Every major scientific discovery or theory must be introduced with its historical background: the year of the breakthrough, full name of the scientist, and their nationality.
*   *Example*: `ในคริสต์ศักราช 1911 ไมเคิล ครอส พอตเตอร์ (Michael Cressé Potter, 1858-1948) นักพฤกษศาสตร์ชาวอังกฤษ ได้ทดลองผลิตกระแสไฟฟ้าจากแบคทีเรีย...`

### 2.3 Strict Constraints (No Colons, Clean Thai Titles)
*   **NO Colons (`:`) in Prose & Titles**: Do not use the colon character (`:`) in any Thai sentences, chapter titles, subheadings, lists, figure captions, or box headers. Use spaces, dashes (`—`), parentheses, or format the sentence naturally.
    *   *Incorrect*: `ประเภทของแบคทีเรีย: 1. แบคทีเรียกลุ่มแอโรบิก...`
    *   *Correct*: `ประเภทของแบคทีเรียมีสองกลุ่มหลัก ได้แก่` followed by list items.
*   **Clean Thai Titles for MOOC/LMS**:
    *   ตัดคำว่า "หัวข้อ" หรือ "หัวข้อที่" ออกทั้งหมด
    *   ตัดคำแปลภาษาอังกฤษต่อท้ายภาษาไทยออกจากชื่อหัวข้อหลักและหัวข้อย่อยทั้งหมดบนระบบ MOOC/LMS (เช่น ใช้ `บทที่ 1 จำนวนเชิงซ้อน` แทน `บทที่ 1: จำนวนเชิงซ้อน (Complex Numbers)`)
*   **Ampersand Escaping**: Ampersands (`&`) in headings or captions must be escaped as `\&` to prevent XeLaTeX compilation errors.

---

## 3. Chapter Structure & Layout

### 3.1 Chapter Syllabus (แผนบริหารการสอนประจำบท)
Every chapter must begin with a formal RBRU syllabus page using the following structure:
```latex
\chapter{ชื่อบทเรียน}

% ==========================================================
% แผนบริหารการสอนประจำบท (Chapter Syllabus)
% ==========================================================
\section*{แผนบริหารการสอนประจำบทที่ X}
\addcontentsline{toc}{section}{แผนบริหารการสอนประจำบทที่ X}

\textbf{หัวข้อเนื้อหาประจำบท}
\begin{enumerate}
    \item หัวข้อย่อยที่ 1
    \item หัวข้อย่อยที่ 2
\end{enumerate}

\textbf{วัตถุประสงค์เชิงพฤติกรรม}
\begin{itemize}
    \item อธิบาย...ได้
    \item คำนวณหา...ได้
\end{itemize}

\textbf{กิจกรรมการเรียนการสอน}
\begin{itemize}
    \item การบรรยายอภิปราย...
\end{itemize}

\textbf{สื่อการเรียนการสอน}
\begin{itemize}
    \item เอกสารคำสอนบทที่ X
\end{itemize}

\textbf{การประเมินผล}
\begin{itemize}
    \item การตรวจรายงานการคำนวณ...
\end{itemize}

\newpage
```

### 3.2 Worked Examples (ตัวอย่างข้อคำนวณ)
Calculations must be placed in a `worked` environment block with clear step-by-step math and explanations:
```latex
\begin{worked}
ตัวอย่างที่ X.Y [โจทย์คำนวณอย่างละเอียด]

วิธีทำ 1. [อธิบายขั้นตอนแรกและการคำนวณ]
      $$สมการทางคณิตศาสตร์ \quad\quad\quad\quad (X.EquationNumber)$$
      2. [แทนค่าคำนวณและสรุปหน่วยคำตอบให้ชัดเจน]
      นั่นคือ [คำตอบสุดท้าย]
\end{worked}
```

---

### 3.3 Academic Chapter Banner Typography & Flush-Right Alignment
*   **Chapter Numbers ("บทที่ X")**: Set to **`44pt`** bold white text inside the banner box.
*   **Chapter Titles**:
    *   Numbered chapters: Set to **`25pt`** bold white text (`\fontsize{25}{31}`), flush right (`\raggedleft`), separated from the chapter number by a 2pt gold horizontal rule (`\rule{0.50\textwidth}{2pt}`).
    *   Unnumbered chapters (Preface, TOC, Bibliography, Appendix, Biography): Set to **`29pt`** bold white text (`\fontsize{29}{35}`).
*   **Vector Underlay**: Deep Navy gradient background with subtle vector physics/math illustrations (`opacity=0.22`) and a 4pt gold border along the right margin.

### 3.4 Executive Author Biography Standard (ผศ.ดร.ชีวะ ทัศนา)
*   **Academic Title & Name**: Always use the official academic rank: **ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา** (Asst. Prof. Dr. Chewa Thassana).
*   **Portrait Specification**: High-resolution circular image framed with an RBRU gold ring (`draw=rbruGold, line width=2pt`) and soft drop shadow.
*   **Strict Single-Page Constraint**: The entire biography must fit completely on a single page without spilling over.
*   **Layout Structure**:
    *   Top Header: Circular portrait on left (`0.28\textwidth`), Name, Rank, Affiliation, and Email on right (`0.69\textwidth`).
    *   Divider: Subtle horizontal rule (`rbruSlate!30`).
    *   Bottom Balanced Columns:
        *   Left (`0.48\textwidth`): Education degrees (B.Sc., M.Sc., Ph.D.) and Regular Teaching Duties.
        *   Right (`0.48\textwidth`): Specialization & Research Interests (Theoretical Physics, Computational Physics, AR/VR/XR, AI in Education).

---

## 4. Illustrations & TikZ Vector Graphics (RBRU Standards)
To maintain a high-quality, self-contained, and vector-based academic presentation (and to bypass image generation quota limits), all figures from Chapter 4 onwards must be coded using TikZ inside the document (at least 3 illustrations per chapter).

### 4.1 TikZ Guidelines
*   **Colors**: Use only the designated book color scheme defined in `env_style.sty`:
    *   `envDarkGreen` (Deep Emerald Green - primary borders/headers)
    *   `envMidGreen` (Ecosystem green)
    *   `envMint` (Light green - cell backgrounds/fill)
    *   `envBrown` (Earth/Soil accent)
    *   `envGold` (Golden Yellow highlights)
    *   `envRed` (Warning/Pathogens)
    *   `envBlue` (Insights/Water)
    *   `envPurple` (Protocol/Laboratory)
*   **Text inside Diagrams**: Labels inside TikZ nodes must be in Thai, with English in parentheses where appropriate.
*   **Captions**: Always start with `ภาพที่ X.Y  [คำอธิบายภาพในภาษาไทย]` (no colon `:`) and place bibliography references at the end in parentheses if applicable.
    *   *Example*: `\caption{แสดงกลไกการทำงานของ... (Atlas, 1989)}`

---

## 5. Review Checklist for Agents
1.  Are there any unescaped `&` characters in section headers, captions, or comments? (Change them to `\&` or `and`).
2.  Is there any colon (`:`) in Thai text paragraphs, headings, table/figure captions, or Python box titles? (Remove them and use spaces `\quad` or dashes).
3.  Does every chapter have a full RBRU syllabus at the beginning?
4.  Are chapter banners formatted with 44pt chapter number and 25pt flush-right title?
5.  Are appendix formulas placed before `\backmatter` with `\renewcommand{\thechapter}{ก}`?
6.  Does the author biography use the title "ผู้ช่วยศาสตราจารย์ ดร.ชีวะ ทัศนา" with circular gold portrait and fit on a single page?
7.  Are scientific terms accompanied by their English equivalents in parentheses?
8.  Are historical breakthroughs introduced with the year, full scientist name, and nationality?
9.  Are bilingual headers inside `div` blocks pre-processed to raw `<h3>` tags to prevent Markdown compilation bypass?
10. Are single bold options (e.g. `** A **` or `**B**`) styled as `<strong class="orange-text">`?
11. Do stylesheets specify `break-after: avoid` for headings and `break-inside: avoid` with `max-height` limits for figures to prevent page split issues?

---

## 6. Bilingual HTML/CSS Book Layout Guidelines (EPUB/PDF)
*   **Bilingual Headers**: Raw Markdown headings like `### English` or `### ภาษาไทย` inside HTML block elements (like `div`) are ignored by standard Markdown parsers. Pre-process them to `<h3>English</h3>` and `<h3>ภาษาไทย</h3>` to ensure they render and apply class-based border styles.
*   **Single-Character Bold Terms**: Single bold characters/options (e.g. `** A **`, `**B**`, `**1**`, `**0**`) must be styled as bold orange using `<strong class="orange-text">X</strong>` (with asterisks removed).
*   **Heading Orphans**: Set `break-after: avoid; page-break-after: avoid;` on all headings (`h1` through `h6`) to prevent them from staying at the bottom of a page without content.
*   **Figure Break Prevention**: Apply `break-inside: avoid; page-break-inside: avoid;` to `.figure` blocks.
*   **Image Dimensions**: To prevent images from exceeding page height and splitting across pages, restrict image heights:
    *   **A4 PDF**: `.figure img { max-height: 180mm; object-fit: contain; }`
    *   **ePocket B6 PDF**: `.figure img { max-height: 90mm; object-fit: contain; }`

