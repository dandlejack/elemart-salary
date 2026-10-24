# แผนปรับปรุง UI — ELE-MART ระบบเงินเดือน

ผู้เขียน: Head of Design · อ้างอิง: `design/DESIGN.md` · วันที่: 2026-10-24

## 1. ผลรีวิว (สถานะปัจจุบัน)

**จุดที่ดีอยู่แล้ว (เก็บไว้)**
- โครงสร้างแอป (sidebar + sticky header + `.page-body`) ชัดเจน ภาษาไทยทั้งระบบ
- Flow แก้ไขปลอดภัย (draft, confirm discard, แถวสีส้มเตือน), ตัวเลขเป็น tabular-nums
- มี token เบื้องต้นใน `src/index.css` (`--app-bg`, `--line`, `--radius` …)

**ปัญหา**
1. **Token ไม่ตรง design system** — ใช้น้ำเงิน antd (`#1677ff`, `#e8f3ff`), เทา Untitled-UI (`#1d2939`, `#667085`) และมีสีฮาร์ดโค้ดกระจายใน TSX (`MonthlyBarChart.tsx` `#2a78d6`, `mockColumnTable.tsx:155` `#cf1322`) — ไม่ใช่ palette cool-blue ของ DESIGN.md (`#2563eb`, `#172033`, `#dbe4f0` …)
2. **Hierarchy ตัวอักษรแบน** — title 20px/600 ทุกหน้า ไม่มี eyebrow/label-sm, ไม่มี heavy weight สำหรับหัวข้อและตัวเลขสำคัญ
3. **Shape/Elevation** — radius 8/12px เงา hairline; DESIGN.md ใช้ radius ใหญ่ (20–28) + เงานุ่มกว้าง
4. **Dashboard ไม่ตอบคำถามแรก** — สถานะเดือนนี้เป็นแค่ `Alert` เล็ก ๆ, KPI 4 การ์ดหน้าตาเท่ากันหมด ไม่มี "outcome block" (ยอดจ่ายสุทธิ) ที่โดดเด่น, ไม่บอก workflow ประจำเดือน
5. **ปุ่ม** — สี่เหลี่ยมมุม 8px; DESIGN.md กำหนด pill
6. **Status/semantic** — Tag `green` ของ antd, สีลบเป็นแดง antd; ควรใช้ success family ของระบบ
7. **Inline style ~65 จุด** (`style={{ marginBottom: 16 }}`, `maxWidth` ฯลฯ) ทำให้ spacing ไม่สม่ำเสมอ
8. **Breakpoint** ใช้ 991px อันเดียว; DESIGN.md มี 699 / 700–989 / 990
9. `src/App.css` เป็นของเหลือจาก CRA ไม่ได้ใช้

## 2. หลักการปรับ DESIGN.md ให้เข้ากับแอปนี้

DESIGN.md มาจากหน้า onboarding (marketing/instructional) แต่แอปนี้เป็น **back-office ที่ตารางข้อมูลหนาแน่น** จึง "ยืม token และภาษาการออกแบบ" ไม่ใช่ลอก layout:

| DESIGN.md | ใช้ในแอปนี้ |
|---|---|
| Palette ทั้งหมด | ใช้ตรงตัว (เป็น token กลาง) |
| Roboto | `Roboto` สำหรับละติน/ตัวเลข + fallback `IBM Plex Sans Thai` สำหรับภาษาไทย (Roboto ไม่มี glyph ไทย) — stack: `'Roboto', 'IBM Plex Sans Thai', -apple-system, 'Segoe UI', Tahoma, sans-serif`. โหลด Roboto 400/500/700/900 และ Plex Thai 400/500/600/700 |
| Heavy 800/900 | เฉพาะ page title, section title, ตัวเลข KPI, label-sm (ไทยจะ render ที่ 700 สูงสุด — ยอมรับได้) |
| hero-title 56px | **ไม่ใช้** — page title 24px/800, dashboard hero title 28px/800 |
| section-title 36 / card-title 22 | section-title → 18px/800, card-title → 16px/700 (ความหนาแน่นของ admin) |
| body-md 15px / lh 1.6 | ข้อความทั่วไป 14px/1.6, **ตารางคง 14px lh ปกติ** |
| label-sm 12px/800 | eyebrow + micro-label (uppercase ไม่จำเป็นสำหรับไทย, letter-spacing .02em) |
| rounded card 20 / card-lg 24 / panel 28 | การ์ดทั่วไป 20px, panel เด่น (hero/outcome) 24px, **ตาราง wrapper 16px**, input 10px, modal 20px, pill 999px |
| shadow.card | ใช้กับการ์ด/ตาราง; shadow.panel-dark กับ outcome panel; shadow.support กับ hero CTA panel |
| button 48px pill | pill ทุกปุ่ม; ความสูงปกติ 40px, small 32px, **48px เฉพาะ CTA ใน hero** |
| container 1180 | ใช้กับ Dashboard และ Setting; หน้าตารางเต็มความกว้าง |
| breakpoints 699/990 | ใช้ตามนั้นใน media query |
| Journey 7 steps + animated path | ดัดแปลงเป็น **workflow เงินเดือนประจำเดือน 4 ขั้น** ใน dashboard, เส้นเชื่อม dashed **นิ่ง** (ไม่ animate — "operationally calm") |
| Deliverables dark panel | ใช้กับ **"ยอดจ่ายสุทธิ"** = outcome ของเดือน |
| Checklist (green check) | ใช้ในหน้าตั้งค่า (ผลทดสอบการเชื่อมต่อ) และขั้น workflow ที่เสร็จแล้ว |
| Do/Don't | น้ำเงินเป็น accent เดียว; ส้ม (warning) และแดง (ลบ/ติดลบ) ใช้ **เฉพาะความหมายเชิง semantic** เท่านั้น |

**ห้ามแตะ:** `Payslip.tsx`, `A4.css`, `payslipPdf.tsx` (เอกสาร A4/PDF ต้องคงรูปแบบพิมพ์) — ยกเว้นการ์ดที่ห่อ preview

## 3. แผนงาน (เรียงตามลำดับ implement)

### Phase 1 — Token layer (`src/index.css`)
- แทนที่ `:root` เดิมด้วย token ชื่อ `--ds-*` ครบตาม DESIGN.md: colors (background, on-background, surface, surface-soft, outline, primary, primary-strong, primary-soft, success, success-soft, dark-surface, dark-panel, dark-on-surface, dark-on-surface-muted), เพิ่ม `--ds-text-muted: #5b6b82`, `--ds-line-soft: #eef2f7`, `--ds-warning: #c2410c`, `--ds-warning-soft: #fff4e6`, `--ds-danger: #dc2626`
- radius (`--ds-radius-input:10px`, `-table:16px`, `-card:20px`, `-panel:24px`, `-modal:20px`, `-pill:999px`), shadows 3 ตัว, motion (`--ds-hover:180ms ease`), spacing (gutter 16/24, card padding 22/24)
- แทนทุกสีฮาร์ดโค้ดใน `index.css` ด้วย token; ลบ `src/App.css` และ import ใน `App.tsx`
- สร้าง `src/theme/tokens.ts` export ค่าสีเดียวกันสำหรับ JS (chart.js, inline semantic) — ห้ามมีสี hex ใน TSX อีก
- เปลี่ยน font import + font stack ตามตารางข้อ 2

### Phase 2 — App shell
- **Sidebar** (`SiderComponent.tsx` + CSS): พื้น surface, ขอบ outline; โลโก้ + label-sm "ระบบเงินเดือน" สี muted; เมนู pill (radius pill หรือ 12px), active = `primary-soft` + ตัวหนังสือ `primary-strong` 600 + ไอคอน primary; hover = `--ds-background`; transition 180ms
- **Header** (`HeaderComponent.tsx`): เพิ่ม prop optional `eyebrow` (label-sm สี primary เหนือ title) — ใช้บอกหมวด เช่น "รายงานเงินเดือน" บนหน้า detail; title 24px/800 สี on-background; subtitle body สี muted; ปุ่ม back เป็นวงกลม 36px ขอบ outline; พื้นหลัง blur โปร่งจาก `--ds-background`; เมื่อ scroll ให้มีเส้นล่าง outline (ใช้ class ผ่าน scroll listener บน `.right-content` หรือคงเส้นตลอดก็ได้ — เลือกแบบง่าย)
- Media queries: ≤699 (gutter 16, ปุ่มใน toolbar เต็มความกว้าง, ซ่อน subtitle), 700–989 (gutter 16), ≥990 (gutter 24–32)
- `.page-container` (max-width 1180, margin auto) สำหรับ Dashboard/Setting

### Phase 3 — Base components (CSS override antd v4, prefix `body` เหมือนเดิม)
- **Button**: pill ทุกตัว, height 40 / small 32 / large 48, primary `#2563eb` hover `#1d4ed8`, shadow `0 6px 16px rgba(37,99,235,.24)` ตอน hover, default = transparent + ขอบ outline + ตัวอักษร on-background, danger คงแดง; `:focus-visible` ring `0 0 0 3px primary-soft`
- อัปเดตกฎ radius ของ input-search / input-group / radio-button ให้เข้ากับ pill (Radio.Group button style → segmented pill: container พื้น background, item selected พื้น surface + shadow เล็ก + ตัวอักษร primary)
- **Input/Select/Picker**: radius 10, ขอบ outline, focus ขอบ primary + ring primary-soft
- **Card**: radius 20, ขอบ outline, shadow.card, head ไม่มีเส้นใต้หนา, title 16/700, padding 22/24
- **Table wrapper**: radius 16, shadow.card; thead พื้น `--ds-background` ตัวอักษร label 13px/600 muted; row hover `primary-soft` อ่อน (`#f3f7ff`); summary row พื้น `surface-soft`, ตัวเลขหนา 700; edit mode ring = primary + `0 0 0 4px primary-soft`
- **Tag**: pill; status "ทำงานอยู่" = success-soft/success, "ลาออก" = background/muted — ทำเป็น component `StatusTag` หรือ className
- **Alert**: radius 16, info = primary-soft + ขอบ `#bfd4fb`, success = success-soft, warning = warning-soft
- **Modal**: radius 20, shadow.panel-dark อ่อนลง, title 18/800
- **Empty / LoadError**: LoadError เปลี่ยนเป็นการ์ดศูนย์กลาง (ไอคอนในวงกลม soft, หัวข้อ card-title, คำอธิบาย, ปุ่ม pill 2 ปุ่มแนวนอน) — ข้อความ/logic เดิมทั้งหมด
- ตัวเลขติดลบ (`mockColumnTable.tsx:155`) ใช้ class `.money-negative` (สี `--ds-danger`) แทน inline hex

### Phase 4 — Dashboard (`DashboardPage.tsx`) — งานหลัก
โครงใหม่ภายใน `.page-container`:
1. **Hero สถานะเดือนนี้** (แทน Alert): การ์ด panel radius 24, พื้น surface + gradient จาง `surface-soft` มุมขวา; eyebrow "เงินเดือนประจำเดือน"; title 28/800 `formatMonthReport(thisMonth)`; ย่อหน้าบอกสถานะ ("สร้างรายงานแล้ว · N คน" หรือ "ยังไม่ได้สร้างรายงาน — เริ่มจากนำเข้าไฟล์ Excel"); dual CTA 48px: primary (`เปิดรายงาน` / `สร้างรายงาน` — action เดิม) + secondary (`ดูรายงานทั้งหมด` → `/salary-list`)
2. **Workflow 4 ขั้น** (journey-step adapted) ในแถวเดียวกับ hero (desktop: hero 2/3, steps 1/3 แนวตั้ง; tablet/mobile: ซ้อนกัน): `01 สร้าง/นำเข้ารายงาน` → `02 ตรวจสอบและแก้ไข` → `03 ออกสลิปเงินเดือน` → `04 ส่งออก Excel`. badge วงกลม 32px (primary, ตัวเลข 800); ขั้น 01 แสดง check สีเขียว + success-soft เมื่อมีรายงานเดือนนี้; ขั้น 02–04 เป็นลิงก์ไปหน้ารายงานเดือนนี้ (disabled/สีจางถ้ายังไม่มีรายงาน). เส้นเชื่อม dashed outline นิ่ง. **ห้ามเดาสถานะที่ไม่มีข้อมูล** — เฉพาะขั้น 01 เท่านั้นที่มี done state
3. **KPI row**: การ์ดแรก "ยอดจ่ายสุทธิ" = **outcome panel มืด** (gradient deliverables-panel, ตัวอักษรขาว, ตัวเลข 32/900, delta สี dark-on-surface-muted); อีก 3 การ์ดเป็น resource-card style: ไอคอนในสี่เหลี่ยมมน 36px พื้น primary-soft สี primary, micro-label (label-sm muted), ตัวเลข 26/800, บรรทัดรอง muted. Delta ใช้สี neutral (ค่าใช้จ่ายขึ้น/ลงไม่ใช่ดี/ร้าย) — คง logic `Delta` เดิม
4. **Chart + รายงานล่าสุด**: คง layout 16/8; chart ใช้ `tokens.primary` แท่ง, hover `primary-strong`, grid `outline`, ตัวอักษรแกน muted, font family ตาม stack; แท่งเดือนล่าสุดเข้ม/อื่นอ่อนกว่า (`#93b4f5`) เพื่อเน้นเดือนปัจจุบัน
5. Hover lift (`translateY(-2px)`, 180ms) เฉพาะการ์ดที่คลิกได้ (workflow steps, ลิงก์) — ไม่ใส่กับ KPI ที่คลิกไม่ได้; เคารพ `prefers-reduced-motion`

### Phase 5 — หน้าอื่น
- **รายการรายงาน / สมุดเงินสดย่อย / พนักงาน**: ใช้ toolbar class แทน inline width (`.toolbar-search` width 280, ≤699 เต็มความกว้าง); เดือนในตารางเป็นลิงก์ตัวหนา 600 สี on-background hover primary; ปุ่ม action ในแถวเป็น text/pill เล็ก
- **รายงานเงินเดือน detail / เงินสดย่อย detail**: ใช้ `eyebrow` ใน header; แถบสรุปเหนือตาราง (summary strip): ชิป 3 ตัว (`N คน`, `รวมเงินได้`, `ยอดสุทธิ`) แบบ pill พื้น surface-soft ตัวเลข 700 — ข้อมูลจากค่าที่คำนวณอยู่แล้ว (สำหรับ salary ใช้ `calcSalaryTotals`, เงินสดย่อยใช้ `pettyCashSummary`/balance ที่มีอยู่); Alert โหมดแก้ไขใช้ style info ใหม่
- **พนักงาน detail**: การ์ดข้อมูลพนักงานตาม card style; การ์ด payslip preview คง `.payslip-sheet` (เงา md) แต่ radius 20
- **ตั้งค่า**: อยู่ใน `.page-container` max 640; ผลทดสอบสำเร็จแสดงเป็น checklist item (ไอคอน check วงกลม success-soft/success + ข้อความ) แทน Alert success; ผิดพลาดคง Alert error
- **ฟอร์ม/Modal** (AddEmployee/AddSalary/AddPettyCash): label 13/600, ระยะ form item 20, ปุ่มท้ายฟอร์มจัดขวา pill; upload dragger radius 16 พื้น `--ds-background` ขอบ dashed outline hover primary

### Phase 6 — Cleanup
- เปลี่ยน inline `style={{ marginBottom: 16 }}` บน Alert/Row เป็น utility class (`.mb-16` หรือ `.stack > * + *` gap) — ทำเฉพาะใน layout ของหน้า ไม่ต้องแตะ column definitions ที่ซับซ้อน
- ไม่มี hex ใน TSX ยกเว้น Payslip

## 4. ข้อกำหนดและเกณฑ์ผ่าน
- **ไม่เปลี่ยน logic/ข้อมูล/API/ข้อความเชิงธุรกิจ** — เป็นงาน visual + โครง layout เท่านั้น (ยกเว้นเพิ่ม prop `eyebrow`, `StatusTag`, workflow component, summary strip ที่ใช้ข้อมูลที่มีอยู่)
- Working tree มีงานที่ยังไม่ commit ของผู้ใช้ — ทำต่อบนนั้น ห้าม revert/stash/commit; ห้ามแตะ `.eslintcache`
- `npx tsc --noEmit` ผ่าน, `set CI=true && npm test -- --watchAll=false` ผ่าน, `npm run build` ผ่าน
- Contrast: ข้อความ ≥ 4.5:1 (muted `#5b6b82` บน `#f6f8fb` ผ่าน), focus-visible ทุก control
- ตรวจด้วยตาที่ 3 ความกว้าง: 390, 820, 1440px
