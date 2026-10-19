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

## 🛠️ รายการสกิลต้นฉบับและไฟล์ SKILL.md ประจำเล่ม (Agent Skills Inventory)

| ลำดับ | ชื่อสกิล (Skill Name) | รายละเอียดและขอบเขตความสามารถ | ลิงก์ไฟล์ข้อกำหนด (SKILL.md) |
| :---: | :--- | :--- | :--- |
| 1 | `a11y-debugging` | Uses Chrome DevTools MCP for accessibility (a11y) debugging and auditing based on web.dev guidelines. Use when testing semantic HTML, ARIA l... | [📄 ดูเนื้อหา SKILL.md](skills/a11y-debugging/SKILL.md) |
| 2 | `chrome-devtools` | Uses Chrome DevTools via MCP for efficient debugging, troubleshooting and browser automation. Use when debugging web pages, automating brows... | [📄 ดูเนื้อหา SKILL.md](skills/chrome-devtools/SKILL.md) |
| 3 | `chrome-extensions` | > Build and publish Chrome Extensions using Manifest V3 best practices. Use this skill whenever the user asks to create, modify, debug, or u... | [📄 ดูเนื้อหา SKILL.md](skills/chrome-extensions/SKILL.md) |
| 4 | `dart-add-unit-test` | Write and organize unit tests for functions, methods, and classes using `package:test`. Use when creating new logic or fixing bugs to ensure... | [📄 ดูเนื้อหา SKILL.md](skills/dart-add-unit-test/SKILL.md) |
| 5 | `dart-build-cli-app` | Entrypoint structure, exit codes, cross-platform scripts. Use when building command line utilities, scripts, or applications. model: models/... | [📄 ดูเนื้อหา SKILL.md](skills/dart-build-cli-app/SKILL.md) |
| 6 | `dart-collect-coverage` | Collect coverage using the coverage packge and create an LCOV report model: models/gemini-3.1-pro-preview last_modified: Fri, 24 Apr 2026 15... | [📄 ดูเนื้อหา SKILL.md](skills/dart-collect-coverage/SKILL.md) |
| 7 | `dart-fix-runtime-errors` | Uses get_runtime_errors and lsp to fetch an active stack trace, locate the failing line, apply a fix, and verify resolution via hot_reload. ... | [📄 ดูเนื้อหา SKILL.md](skills/dart-fix-runtime-errors/SKILL.md) |
| 8 | `dart-generate-test-mocks` | Define and generate mock objects for external dependencies using `package:mockito` and `build_runner`. Use when unit testing classes that de... | [📄 ดูเนื้อหา SKILL.md](skills/dart-generate-test-mocks/SKILL.md) |
| 9 | `dart-migrate-to-checks-package` | |- Replace the usage of `expect` and similar functions from `package:matcher` to `package:checks` equivalents. model: models/gemini-3.1-pro-... | [📄 ดูเนื้อหา SKILL.md](skills/dart-migrate-to-checks-package/SKILL.md) |
| 10 | `dart-resolve-package-conflicts` | Workflow for fixing package version conflicts. Use this when `pub get` fails due to incompatible package versions. model: models/gemini-3.1-... | [📄 ดูเนื้อหา SKILL.md](skills/dart-resolve-package-conflicts/SKILL.md) |
| 11 | `dart-run-static-analysis` | Execute `dart analyze` to identify warnings and errors, and use `dart fix --apply` to automatically resolve mechanical lint issues. Use duri... | [📄 ดูเนื้อหา SKILL.md](skills/dart-run-static-analysis/SKILL.md) |
| 12 | `dart-setup-ffi-assets` | "Guides agents in compiling and packaging C/C++ source code into dynamic or static libraries (Code Assets) using Dart's Native Assets hook s... | [📄 ดูเนื้อหา SKILL.md](skills/dart-setup-ffi-assets/SKILL.md) |
| 13 | `dart-use-ffigen` | Guide agents to use `package:ffigen` to automatically generate FFI bindings instead of writing them manually. Use this skill when a task inv... | [📄 ดูเนื้อหา SKILL.md](skills/dart-use-ffigen/SKILL.md) |
| 14 | `dart-use-pattern-matching` | Use switch expressions and pattern matching where appropriate model: models/gemini-3.1-pro-preview last_modified: Fri, 24 Apr 2026 15:08:55 ... | [📄 ดูเนื้อหา SKILL.md](skills/dart-use-pattern-matching/SKILL.md) |
| 15 | `dart-use-primary-constructors` | > Help users write syntactically and semantically correct primary constructors in Dart, and migrate/use the new constructor syntax, empty-bo... | [📄 ดูเนื้อหา SKILL.md](skills/dart-use-primary-constructors/SKILL.md) |
| 16 | `dart-write-documentation` | "Rules and formatting guidelines for writing Dart /// API documentation and doc comments. Use when documenting Dart code, writing doc commen... | [📄 ดูเนื้อหา SKILL.md](skills/dart-write-documentation/SKILL.md) |
| 17 | `debug-optimize-lcp` | Guides debugging and optimizing Largest Contentful Paint (LCP) using Chrome DevTools MCP tools. Use this skill whenever the user asks about ... | [📄 ดูเนื้อหา SKILL.md](skills/debug-optimize-lcp/SKILL.md) |
| 18 | `flutter-add-integration-test` | Configures Flutter Driver for app interaction and converts MCP actions into permanent integration tests. Use when adding integration testing... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-add-integration-test/SKILL.md) |
| 19 | `flutter-add-widget-preview` | Adds interactive widget previews to the project using the previews.dart system. Use when creating new UI components or updating existing scr... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-add-widget-preview/SKILL.md) |
| 20 | `flutter-add-widget-test` | Implement a component-level test using `WidgetTester` to verify UI rendering and user interactions (tapping, scrolling, entering text). Use ... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-add-widget-test/SKILL.md) |
| 21 | `flutter-app-architect` | สถาปัตยกรรมและมาตรฐานการออกแบบ พัฒนา และเขียนโค้ด Flutter Application ระดับมืออาชีพ (Flutter App Architect & Custom Icon Masterclass) ครอบคล... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-app-architect/SKILL.md) |
| 22 | `flutter-apply-architecture-best-practices` | Architects a Flutter application using the recommended layered approach (UI, Logic, Data). Use when structuring a new project or refactoring... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-apply-architecture-best-practices/SKILL.md) |
| 23 | `flutter-build-responsive-layout` | Use `LayoutBuilder`, `MediaQuery`, or `Expanded/Flexible` to create a layout that adapts to different screen sizes. Use when you need the UI... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-build-responsive-layout/SKILL.md) |
| 24 | `flutter-fix-layout-issues` | Fixes Flutter layout errors (overflows, unbounded constraints) using Dart and Flutter MCP tools. Use when addressing "RenderFlex overflowed"... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-fix-layout-issues/SKILL.md) |
| 25 | `flutter-implement-json-serialization` | Create model classes with `fromJson` and `toJson` methods using `dart:convert`. Use when manually mapping JSON keys to class properties for ... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-implement-json-serialization/SKILL.md) |
| 26 | `flutter-setup-declarative-routing` | Configure `MaterialApp.router` using a package like `go_router` for advanced URL-based navigation. Use when developing web applications or m... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-setup-declarative-routing/SKILL.md) |
| 27 | `flutter-setup-localization` | Add `flutter_localizations` and `intl` dependencies, enable "generate true" in `pubspec.yaml`, and create an `l10n.yaml` configuration file.... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-setup-localization/SKILL.md) |
| 28 | `flutter-use-http-package` | Use the `http` package to execute GET, POST, PUT, or DELETE requests. Use when you need to fetch from or send data to a REST API. model: mod... | [📄 ดูเนื้อหา SKILL.md](skills/flutter-use-http-package/SKILL.md) |
| 29 | `memory-leak-debugging` | Diagnoses and resolves memory leaks in JavaScript/Node.js applications. Use when a user reports high memory usage, OOM errors, or wants to a... | [📄 ดูเนื้อหา SKILL.md](skills/memory-leak-debugging/SKILL.md) |
| 30 | `modern-web-guidance` | | Search tool for modern web development best practices. MANDATORY: Execute FIRST for all HTML/CSS and clientside JS tasks. Do NOT skip — we... | [📄 ดูเนื้อหา SKILL.md](skills/modern-web-guidance/SKILL.md) |
| 31 | `skills` | Provides instructions for installing and using the `android` CLI. The `android` command-line tool is a critical tool for Android development... | [📄 ดูเนื้อหา SKILL.md](skills/skills/SKILL.md) |
| 32 | `troubleshooting` | Uses Chrome DevTools MCP and documentation to troubleshoot connection and target issues. Trigger this skill when list_pages, new_page, or na... | [📄 ดูเนื้อหา SKILL.md](skills/troubleshooting/SKILL.md) |
