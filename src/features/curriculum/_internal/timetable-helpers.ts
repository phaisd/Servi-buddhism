import type { TimetableSlot, YearTimetable } from "./timetable-types";

export const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

/**
 * แปลง ISO date string (YYYY-MM-DD) หรือสตริงวันที่ใดๆ เป็นรูปแบบไทยพุทธศักราช (เช่น "9 มิถุนายน 2569")
 */
export function dateToThaiString(isoOrStr?: string): string {
  if (!isoOrStr) return "";
  const trimmed = isoOrStr.trim();
  // ถ้ามีอักษรไทยอยู่แล้ว แสดงว่าจัดรูปแบบมาแล้ว
  if (/[\u0E00-\u0E7F]/.test(trimmed)) return trimmed;

  const d = new Date(trimmed);
  if (isNaN(d.getTime())) return trimmed;

  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const beYear = d.getFullYear() + 543;
  return `${day} ${month} ${beYear}`;
}

/**
 * แปลงวันที่จากสตริงรูปแบบใดๆ (รวมถึงภาษาไทย เช่น "9 มิถุนายน 2569")
 * เป็นรูปแบบ YYYY-MM-DD สำหรับ input[type="date"]
 */
export function toDateInputValue(str?: string): string {
  if (!str) return "";
  const trimmed = str.trim();
  // ตรวจสอบ YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // ตรวจสอบรูปแบบไทย เช่น "9 มิถุนายน 2569" หรือ "9 มิ.ย. 2569"
  const thaiMatch = trimmed.match(/(\d{1,2})\s+([^\s\d]+)\s+(\d{4})/);
  if (thaiMatch) {
    const day = thaiMatch[1].padStart(2, "0");
    const mStr = thaiMatch[2];
    const rawYear = parseInt(thaiMatch[3], 10);
    const ceYear = rawYear > 2400 ? rawYear - 543 : rawYear;

    let mIdx = THAI_MONTHS.findIndex((m) => mStr.includes(m));
    if (mIdx === -1) {
      mIdx = THAI_MONTHS_SHORT.findIndex((m) => mStr.includes(m.replace(".", "")));
    }

    if (mIdx !== -1) {
      const month = String(mIdx + 1).padStart(2, "0");
      return `${ceYear}-${month}-${day}`;
    }
  }

  // ลอง Date.parse ปกติ
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  return "";
}

/**
 * แปลงวันเป็น Day Key ("Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun")
 */
export function normalizeDayKey(dayStr: string): TimetableSlot["day"] {
  const s = dayStr.trim().toLowerCase();
  if (s.includes("จันทร์") || s.startsWith("mon")) return "Mon";
  if (s.includes("อังคาร") || s.startsWith("tue")) return "Tue";
  if (s.includes("พุธ") || s.startsWith("wed")) return "Wed";
  if (s.includes("พฤหัส") || s.startsWith("thu")) return "Thu";
  if (s.includes("ศุกร์") || s.startsWith("fri")) return "Fri";
  if (s.includes("เสาร์") || s.startsWith("sat")) return "Sat";
  if (s.includes("อาทิตย์") || s.startsWith("sun")) return "Sun";
  return "Mon";
}

export function dayKeyToThai(key: string): string {
  switch (key) {
    case "Mon":
      return "วันจันทร์";
    case "Tue":
      return "วันอังคาร";
    case "Wed":
      return "วันพุธ";
    case "Thu":
      return "วันพฤหัสบดี";
    case "Fri":
      return "วันศุกร์";
    case "Sat":
      return "วันเสาร์";
    case "Sun":
      return "วันอาทิตย์";
    default:
      return key;
  }
}

/**
 * แปลงข้อมูล Slots หรือทั้ง YearTimetable ออกเป็นรูปแบบ CSV พร้อม UTF-8 BOM
 */
export function generateTimetableCsv(
  slots: TimetableSlot[],
  options?: {
    yearLevel?: number;
    curriculumName?: string;
    majorName?: string;
    semester?: number;
    academicYear?: string;
  }
): string {
  const headers = [
    "ชั้นปี",
    "วัน",
    "เวลา",
    "รหัสวิชา",
    "ชื่อรายวิชา",
    "อาจารย์ผู้สอน",
    "ห้องเรียน",
    "สอบกลาง",
    "คาบเริ่มต้น",
    "จำนวนคาบ",
  ];

  const escapeCell = (val: string | number | boolean | undefined) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = slots.map((s) => [
    escapeCell(options?.yearLevel || 1),
    escapeCell(dayKeyToThai(s.day)),
    escapeCell(s.timeRange),
    escapeCell(s.courseCode),
    escapeCell(s.courseName),
    escapeCell(s.instructors),
    escapeCell(s.room || ""),
    escapeCell(s.isMidtermExam ? "ใช่" : "ไม่ใช่"),
    escapeCell(s.startPeriod || ""),
    escapeCell(s.periodSpan || ""),
  ]);

  const csvRows = [headers.join(","), ...rows.map((r) => r.join(","))];
  // ใส่ UTF-8 BOM (\uFEFF) เพื่อให้ Excel ภาษาไทยเปิดได้ถูกต้อง
  return "\uFEFF" + csvRows.join("\r\n");
}

/**
 * สร้างเทมเพลต CSV ตัวอย่างสำหรับดาวน์โหลดไปกรอก
 */
export function generateCsvTemplate(): string {
  const sampleSlots: TimetableSlot[] = [
    {
      day: "Mon",
      timeRange: "09.00-11.30",
      courseCode: "000 102",
      courseName: "กฎหมายทั่วไป",
      instructors: "พระมหามงคลกานต์ ฐิตธมฺโม, รศ. ดร.*",
      room: "ชั้น 5 ห้อง D 516/1",
      isMidtermExam: true,
      startPeriod: 1,
      periodSpan: 3,
    },
    {
      day: "Mon",
      timeRange: "12.30-15.10",
      courseCode: "101 101",
      courseName: "พระไตรปิฎกศึกษา",
      instructors: "ผศ.ดร.บุญมี พสุนนท์",
      room: "ชั้น 5 ห้อง D 516/1",
      isMidtermExam: false,
      startPeriod: 4,
      periodSpan: 3,
    },
    {
      day: "Tue",
      timeRange: "09.00-11.30",
      courseCode: "000 101",
      courseName: "มนุษย์กับสังคม",
      instructors: "พระมหาวรรณชัย วรรณสิทฺโธ, ดร.",
      room: "ชั้น 5 ห้อง D 516/1",
      isMidtermExam: false,
      startPeriod: 1,
      periodSpan: 3,
    },
  ];

  return generateTimetableCsv(sampleSlots, { yearLevel: 1 });
}

/**
 * สร้างไฟล์ CSV รวมตารางเรียนทุกหลักสูตร/ทุกชั้นปี (Batch CSV Export)
 */
export function generateBatchTimetablesCsv(
  items: Array<{
    curriculumName: string;
    majorName?: string;
    timetables: YearTimetable[];
  }>
): string {
  const headers = [
    "หลักสูตร",
    "สาขาวิชา",
    "ชั้นปี",
    "ภาคเรียน",
    "ปีการศึกษา",
    "วัน",
    "เวลา",
    "รหัสวิชา",
    "ชื่อรายวิชา",
    "อาจารย์ผู้สอน",
    "ห้องเรียน",
    "สอบกลาง",
    "คาบเริ่มต้น",
    "จำนวนคาบ",
  ];

  const escapeCell = (val: string | number | boolean | undefined) => {
    if (val === undefined || val === null) return "";
    const str = String(val);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows: string[][] = [];

  for (const item of items) {
    for (const yt of item.timetables) {
      for (const s of yt.slots) {
        rows.push([
          escapeCell(item.curriculumName),
          escapeCell(item.majorName || ""),
          escapeCell(yt.yearLevel),
          escapeCell(yt.semester),
          escapeCell(yt.academicYear || "2569"),
          escapeCell(dayKeyToThai(s.day)),
          escapeCell(s.timeRange),
          escapeCell(s.courseCode),
          escapeCell(s.courseName),
          escapeCell(s.instructors),
          escapeCell(s.room || yt.defaultRoom || ""),
          escapeCell(s.isMidtermExam ? "ใช่" : "ไม่ใช่"),
          escapeCell(s.startPeriod || ""),
          escapeCell(s.periodSpan || ""),
        ]);
      }
    }
  }

  const csvRows = [headers.join(","), ...rows.map((r) => r.join(","))];
  return "\uFEFF" + csvRows.join("\r\n");
}

/**
 * ปรับปรุงปีการศึกษาให้เป็นปี พ.ศ. สม่ำเสมอ (เช่น "2025" -> "2568", "2568" -> "2568")
 */
export function normalizeAcademicYear(yearStr?: string): string {
  if (!yearStr) return "2569";
  const cleaned = yearStr.trim();
  const num = parseInt(cleaned, 10);
  if (!isNaN(num) && num > 1900 && num < 2500) {
    return String(num + 543);
  }
  return cleaned;
}

export interface ParsedCsvSlotItem {
  curriculumName?: string;
  majorName?: string;
  semester?: number;
  academicYear?: string;
  yearLevel: number;
  slot: TimetableSlot;
}

/**
 * ตัวแยกส่วน CSV (รองรับ quoted strings, เครื่องหมายจุลภาคภายในเครื่องหมายคำพูด, และบรรทัดใหม่)
 */
export function parseTimetableCsv(csvText: string): ParsedCsvSlotItem[] {
  // นำ BOM ออกหากมี
  const cleanText = csvText.replace(/^\uFEFF/, "").trim();
  if (!cleanText) return [];

  // Parse lines considering quotes
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentField.trim());
        currentField = "";
      } else if (char === "\r") {
        // ignore carriage return
      } else if (char === "\n") {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          lines.push(currentRow);
        }
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Push last field & row if remaining
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  if (lines.length <= 1) return [];

  // ตรวจสอบหัวตาราง (Header mapping)
  const headerRow = lines[0].map((h) => h.toLowerCase());
  const colIndex = {
    curriculum: headerRow.findIndex((h) => h.includes("หลักสูตร") || h.includes("curriculum")),
    major: headerRow.findIndex((h) => h.includes("สาขา") || h.includes("major")),
    semester: headerRow.findIndex((h) => h.includes("ภาคเรียน") || h.includes("semester")),
    academicYear: headerRow.findIndex((h) => h.includes("ปีการศึกษา") || h.includes("academic")),
    year: headerRow.findIndex((h) => h.includes("ชั้นปี") || h.includes("year")),
    day: headerRow.findIndex((h) => h.includes("วัน") || h.includes("day")),
    time: headerRow.findIndex((h) => h.includes("เวลา") || h.includes("time")),
    code: headerRow.findIndex((h) => h.includes("รหัส") || h.includes("code")),
    name: headerRow.findIndex(
      (h) => (h.includes("ชื่อ") || h.includes("name") || h.includes("วิชา")) && !h.includes("รหัส") && !h.includes("code")
    ),
    instructors: headerRow.findIndex(
      (h) => h.includes("อาจารย์") || h.includes("ผู้สอน") || h.includes("instructor")
    ),
    room: headerRow.findIndex((h) => h.includes("ห้อง") || h.includes("room")),
    midterm: headerRow.findIndex((h) => h.includes("กลาง") || h.includes("midterm") || h.includes("สอบ")),
    startPeriod: headerRow.findIndex((h) => h.includes("เริ่มต้น") || h.includes("start")),
    periodSpan: headerRow.findIndex((h) => h.includes("จำนวนคาบ") || h.includes("span")),
  };

  const results: ParsedCsvSlotItem[] = [];

  for (let r = 1; r < lines.length; r++) {
    const row = lines[r];
    if (row.length === 0 || !row.some((cell) => cell.length > 0)) continue;

    const getVal = (idx: number, fallback = "") => (idx !== -1 && row[idx] !== undefined ? row[idx] : fallback);

    const curriculumName = getVal(colIndex.curriculum, "");
    const majorName = getVal(colIndex.major, "");
    const semesterRaw = getVal(colIndex.semester, "");
    const semester = semesterRaw ? parseInt(semesterRaw, 10) : undefined;
    const rawAcademicYear = getVal(colIndex.academicYear, "");
    const academicYear = rawAcademicYear ? normalizeAcademicYear(rawAcademicYear) : undefined;

    const yearRaw = getVal(colIndex.year, "1");
    const yearLevel = parseInt(yearRaw.replace(/\D/g, ""), 10) || 1;

    const dayRaw = getVal(colIndex.day, "Mon");
    const day = normalizeDayKey(dayRaw);

    const timeRange = getVal(colIndex.time, "09.00-11.30");
    const courseCode = getVal(colIndex.code, "");
    const courseName = getVal(colIndex.name, "");
    const instructors = getVal(colIndex.instructors, "");
    const room = getVal(colIndex.room, "");

    const midtermRaw = getVal(colIndex.midterm, "").toLowerCase();
    const isMidtermExam =
      midtermRaw === "ใช่" ||
      midtermRaw === "true" ||
      midtermRaw === "1" ||
      midtermRaw === "yes" ||
      midtermRaw === "y" ||
      midtermRaw.includes("*");

    const startPeriodRaw = getVal(colIndex.startPeriod, "");
    const startPeriod = startPeriodRaw ? parseInt(startPeriodRaw, 10) : undefined;

    const periodSpanRaw = getVal(colIndex.periodSpan, "");
    const periodSpan = periodSpanRaw ? parseInt(periodSpanRaw, 10) : undefined;

    if (courseCode || courseName) {
      results.push({
        curriculumName: curriculumName || undefined,
        majorName: majorName || undefined,
        semester,
        academicYear: academicYear || undefined,
        yearLevel,
        slot: {
          day,
          timeRange,
          courseCode,
          courseName,
          instructors,
          room: room || undefined,
          isMidtermExam,
          startPeriod: startPeriod && !isNaN(startPeriod) ? startPeriod : undefined,
          periodSpan: periodSpan && !isNaN(periodSpan) ? periodSpan : undefined,
        },
      });
    }
  }

  return results;
}


/**
 * สร้างหน้าเอกสารตารางเรียนรูปแบบพิมพ์ทางการสำหรับ Print / Save as PDF
 */
export function generatePrintableTimetableHtml(options: {
  curriculumName: string;
  departmentName?: string;
  majorName?: string;
  timetable: YearTimetable;
}): string {
  const { curriculumName, departmentName, majorName, timetable } = options;

  const DAYS = [
    { key: "Mon", th: "วันจันทร์", color: "#b45309" },
    { key: "Tue", th: "วันอังคาร", color: "#be185d" },
    { key: "Wed", th: "วันพุธ", color: "#047857" },
    { key: "Thu", th: "วันพฤหัสบดี", color: "#c2410c" },
    { key: "Fri", th: "วันศุกร์", color: "#0284c7" },
  ];

  const resolvePlacement = (slot: TimetableSlot) => {
    if (slot.startPeriod && slot.periodSpan) {
      return { startPeriod: slot.startPeriod, span: slot.periodSpan };
    }
    const t = slot.timeRange;
    if (t.includes("09.00") && t.includes("11.30")) return { startPeriod: 1, span: 3 };
    if (t.includes("12.30") && (t.includes("15.10") || t.includes("15.00"))) return { startPeriod: 4, span: 3 };
    if (t.includes("13.00") && t.includes("15.30")) return { startPeriod: 4, span: 3 };
    if (t.includes("15.30") || t.includes("15.10")) return { startPeriod: 7, span: 1 };
    return { startPeriod: 1, span: 2 };
  };

  // Generate table rows
  const tableRowsHtml = DAYS.map((d) => {
    const daySlots = timetable.slots.filter((s) => s.day === d.key);
    const placed = daySlots.map((s) => ({ slot: s, ...resolvePlacement(s) }));

    let cellsHtml = "";
    let p = 1;
    while (p <= 7) {
      if (p === 4) {
        // Lunch cell is handled at row level or spanned, here as middle spacer
      }
      const match = placed.find((item) => item.startPeriod === p);
      if (match) {
        const span = Math.min(match.span, p <= 3 ? 4 - p : 8 - p);
        const s = match.slot;
        const examStar = s.isMidtermExam ? '<span style="color:#dc2626;font-weight:bold;">*</span>' : '';
        cellsHtml += `
          <td colspan="${span}" style="padding:6px;border:1px solid #000;background:#fbfbfb;vertical-align:top;font-size:11px;">
            <div style="font-weight:bold;color:#1e3a8a;">${s.courseCode} ${s.courseName}${examStar}</div>
            <div style="color:#374151;font-size:10px;margin-top:2px;">${s.instructors}</div>
            <div style="color:#6b7280;font-size:9.5px;margin-top:2px;">ห้อง ${s.room || timetable.defaultRoom}</div>
          </td>
        `;
        p += span;
      } else {
        // empty cell
        cellsHtml += `<td style="padding:4px;border:1px solid #000;background:#fff;text-align:center;color:#9ca3af;font-size:10px;">-</td>`;
        p += 1;
      }
    }

    return `
      <tr>
        <td style="padding:6px;border:1px solid #000;font-weight:bold;text-align:center;background:#f3f4f6;width:90px;font-size:11px;color:${d.color};">
          ${d.th}
        </td>
        ${cellsHtml}
      </tr>
    `;
  }).join("");

  const startDateTh = dateToThaiString(timetable.startDate) || "9 มิถุนายน 2569";
  const endDateTh = dateToThaiString(timetable.endDate) || "25 กันยายน 2569";

  const notesHtml = (timetable.notes || [
    "วันพระและวันนักขัตฤกษ์เป็นวันหยุดทั่วไป (ตารางเรียนวันใดตรงกับวันพระให้ยกไปเรียนวันศุกร์)",
    "เครื่องหมายดอกจัน (*) อยู่หลังชื่อรายวิชา หมายถึง ข้อสอบกลาง",
  ])
    .map((n, i) => `<li style="margin-bottom:3px;">${i + 1}. ${n}</li>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <title>ตารางการเรียนการสอน - ${curriculumName} ชั้นปีที่ ${timetable.yearLevel}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 12mm 10mm 12mm 10mm;
    }
    body {
      font-family: 'Sarabun', 'TH Sarabun New', 'Angsana New', sans-serif;
      color: #111;
      margin: 0;
      padding: 10px;
      line-height: 1.35;
      background: #fff;
    }
    .header-box {
      text-align: center;
      margin-bottom: 12px;
    }
    .header-box h2 {
      margin: 0;
      font-size: 17px;
      font-weight: bold;
    }
    .header-box h3 {
      margin: 3px 0;
      font-size: 15px;
      font-weight: bold;
    }
    .header-box p {
      margin: 2px 0;
      font-size: 12.5px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: avoid;
    }
    th {
      border: 1px solid #000;
      background: #e5e7eb;
      font-size: 11px;
      padding: 5px 2px;
      text-align: center;
      font-weight: bold;
    }
    .notes-box {
      margin-top: 10px;
      font-size: 11px;
      border-top: 1px dashed #666;
      padding-top: 6px;
    }
    .notes-box ul {
      margin: 4px 0 0 16px;
      padding: 0;
    }
    .footer-sign {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
      text-align: center;
      font-size: 11px;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 12px; padding: 10px; background: #e0f2fe; border: 1px solid #7dd3fc; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
    <div><strong>ตัวอย่างเอกสารสำหรับพิมพ์ / บันทึก PDF</strong> (ขนาด A4 แนวนอน)</div>
    <button onclick="window.print()" style="padding: 6px 16px; background: #0284c7; color: #fff; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
      🖨️ สั่งพิมพ์ / บันทึกเป็น PDF
    </button>
  </div>

  <div class="header-box">
    <h2>มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย</h2>
    <h3>ตารางการเรียนการสอน ระดับปริญญาตรี ประจำภาคการศึกษาที่ ${timetable.semester} ปีการศึกษา ${timetable.academicYear || "2569"}</h3>
    <p>
      <strong>หลักสูตร:</strong> ${curriculumName} 
      ${departmentName ? `&nbsp;|&nbsp; <strong>คณะ/ภาควิชา:</strong> ${departmentName}` : ""}
      ${majorName ? `&nbsp;|&nbsp; <strong>สาขาวิชา:</strong> ${majorName}` : ""}
      &nbsp;|&nbsp; <strong>ชั้นปีที่:</strong> ${timetable.yearLevel}
      &nbsp;|&nbsp; <strong>ห้องเรียนประจำ:</strong> ${timetable.defaultRoom || "-"}
    </p>
    <p style="color:#374151;font-size:11.5px;">
      เปิดภาคเรียนวันที่ ${startDateTh} – สิ้นสุดภาคเรียนวันที่ ${endDateTh}
    </p>
  </div>

  <table>
    <thead>
      <tr>
        <th rowspan="2" style="width: 85px;">วัน / เวลา</th>
        <th>คาบ 1</th>
        <th>คาบ 2</th>
        <th>คาบ 3</th>
        <th rowspan="2" style="width: 45px; background: #fef08a; font-size: 10px;">11.30-12.30<br>พักฉันเพล</th>
        <th>คาบ 4</th>
        <th>คาบ 5</th>
        <th>คาบ 6</th>
        <th>คาบ 7</th>
      </tr>
      <tr>
        <th style="font-weight:normal;font-size:9.5px;">09.00 - 09.50</th>
        <th style="font-weight:normal;font-size:9.5px;">09.50 - 10.40</th>
        <th style="font-weight:normal;font-size:9.5px;">10.50 - 11.30</th>
        <th style="font-weight:normal;font-size:9.5px;">12.30 - 13.20</th>
        <th style="font-weight:normal;font-size:9.5px;">13.20 - 14.10</th>
        <th style="font-weight:normal;font-size:9.5px;">14.20 - 15.10</th>
        <th style="font-weight:normal;font-size:9.5px;">15.10 - 16.50</th>
      </tr>
    </thead>
    <tbody>
      ${tableRowsHtml}
    </tbody>
  </table>

  <div class="notes-box">
    <strong>หมายเหตุ:</strong>
    <ul>
      ${notesHtml}
    </ul>
  </div>

  <div class="footer-sign">
    <div style="width: 250px;">
      <p style="margin-bottom: 30px;">ลงชื่อ..........................................................<br>(หัวหน้าภาควิชา)</p>
    </div>
    <div style="width: 250px;">
      <p style="margin-bottom: 30px;">ลงชื่อ..........................................................<br>(คณบดี / ผู้มีอำนาจลงนาม)</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * คำนวณคาบเริ่มต้นและจำนวนคาบที่ครอบคลุม (colspan) จากช่วงเวลาหรือรหัสวิชา
 * ตามโครงสร้างคาบเรียนของ มจร. (7 คาบต่อวัน แบ่งเป็นเช้า 3 คาบ, พักเพล, บ่าย 4 คาบ)
 */
export function resolveSlotPlacement(slot: TimetableSlot): { startPeriod: number; span: number } {
  if (slot.startPeriod && slot.periodSpan) {
    return { startPeriod: slot.startPeriod, span: slot.periodSpan };
  }

  const tr = (slot.timeRange || "").replace(/\s+/g, "").replace(/:/g, ".");
  const match = tr.match(/(\d{1,2}\.\d{2})[-–—](\d{1,2}\.\d{2})/);
  if (!match) {
    return { startPeriod: 1, span: 1 };
  }

  const parseMinutes = (tStr: string) => {
    const [h, m] = tStr.split(".").map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const startMin = parseMinutes(match[1]);
  const endMin = parseMinutes(match[2]);
  const duration = Math.max(0, endMin - startMin);

  // คำนวณคาบเริ่มต้นตามเวลาที่เริ่ม
  let startPeriod = 1;
  if (startMin < 570) {
    // ก่อน 09.30 -> คาบที่ 1 (09.00 - 09.50)
    startPeriod = 1;
  } else if (startMin < 625) {
    // 09.30 - 10.25 -> คาบที่ 2 (09.50 - 10.40)
    startPeriod = 2;
  } else if (startMin < 720) {
    // 10.25 - 12.00 -> คาบที่ 3 (10.40/10.50 - 11.30)
    startPeriod = 3;
  } else if (startMin < 805) {
    // 12.00 - 13.25 -> คาบที่ 4 (12.30 - 13.20 หรือเริ่ม 13.00)
    startPeriod = 4;
  } else if (startMin < 855) {
    // 13.25 - 14.15 -> คาบที่ 5 (13.20 - 14.10)
    startPeriod = 5;
  } else if (startMin < 905) {
    // 14.15 - 15.05 -> คาบที่ 6 (14.20 - 15.10 หรือเริ่ม 14.30)
    startPeriod = 6;
  } else {
    // 15.05 เป็นต้นไป -> คาบที่ 7 (15.10 - 16.50)
    startPeriod = 7;
  }

  // คำนวณจำนวนคาบ (span) ตามระยะเวลา
  let rawSpan = 1;
  if (duration >= 130) {
    rawSpan = 3;
  } else if (duration >= 75) {
    rawSpan = 2;
  } else {
    rawSpan = 1;
  }

  // ป้องกันการข้ามช่วงพักเที่ยง หรือเกินคาบที่ 7
  let span = rawSpan;
  if (startPeriod <= 3) {
    // ช่วงเช้า ไม่เกินคาบ 3 (ก่อนพักเพล)
    span = Math.min(rawSpan, 3 - startPeriod + 1);
  } else {
    // ช่วงบ่าย ไม่เกินคาบ 7
    span = Math.min(rawSpan, 7 - startPeriod + 1);
  }

  return { startPeriod, span: Math.max(1, span) };
}

export interface SlotColorTheme {
  bg: string;
  border: string;
  tagBg: string;
  timeBg: string;
  codeColor: string;
  titleColor: string;
  periodLabel: string;
  accentBar: string;
}

/**
 * กำหนดธีมสีพื้นหลังและแทบสีแสดงช่วงเวลาของวิชานั้นๆ ให้สวยงามและสังเกตง่าย
 */
export function getSlotColorTheme(startPeriod: number, span: number): SlotColorTheme {
  // ช่วงเช้า 3 คาบ (09.00 - 11.30)
  if (startPeriod === 1 && span >= 3) {
    return {
      bg: "bg-sky-500/10 dark:bg-sky-950/40 hover:bg-sky-500/15",
      border: "border-sky-500/30 dark:border-sky-700/50",
      tagBg: "bg-sky-500/20 text-sky-800 dark:text-sky-200 border-sky-400/40",
      timeBg: "bg-sky-600 text-white dark:bg-sky-500 font-mono",
      codeColor: "text-sky-700 dark:text-sky-300 font-bold",
      titleColor: "text-foreground font-bold",
      periodLabel: "เช้า 3 คาบเต็ม (09.00-11.30)",
      accentBar: "bg-sky-500",
    };
  }

  // ช่วงเช้า 2 คาบแรก (09.00 - 10.40)
  if (startPeriod === 1 && span === 2) {
    return {
      bg: "bg-emerald-500/10 dark:bg-emerald-950/40 hover:bg-emerald-500/15",
      border: "border-emerald-500/30 dark:border-emerald-700/50",
      tagBg: "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-400/40",
      timeBg: "bg-emerald-600 text-white dark:bg-emerald-500 font-mono",
      codeColor: "text-emerald-700 dark:text-emerald-300 font-bold",
      titleColor: "text-foreground font-bold",
      periodLabel: "เช้า 2 คาบแรก (09.00-10.40)",
      accentBar: "bg-emerald-500",
    };
  }

  // ช่วงเช้า 2 คาบหลัง (09.50 - 11.30)
  if (startPeriod === 2 && span === 2) {
    return {
      bg: "bg-teal-500/10 dark:bg-teal-950/40 hover:bg-teal-500/15",
      border: "border-teal-500/30 dark:border-teal-700/50",
      tagBg: "bg-teal-500/20 text-teal-800 dark:text-teal-200 border-teal-400/40",
      timeBg: "bg-teal-600 text-white dark:bg-teal-500 font-mono",
      codeColor: "text-teal-700 dark:text-teal-300 font-bold",
      titleColor: "text-foreground font-bold",
      periodLabel: "เช้า 2 คาบหลัง (09.50-11.30)",
      accentBar: "bg-teal-500",
    };
  }

  // ช่วงบ่าย 3 คาบ (12.30 - 15.10 หรือ 13.00 - 15.30)
  if (startPeriod === 4 && span >= 3) {
    return {
      bg: "bg-indigo-500/10 dark:bg-indigo-950/40 hover:bg-indigo-500/15",
      border: "border-indigo-500/30 dark:border-indigo-700/50",
      tagBg: "bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 border-indigo-400/40",
      timeBg: "bg-indigo-600 text-white dark:bg-indigo-500 font-mono",
      codeColor: "text-indigo-700 dark:text-indigo-300 font-bold",
      titleColor: "text-foreground font-bold",
      periodLabel: "บ่าย 3 คาบ (12.30-15.30)",
      accentBar: "bg-indigo-500",
    };
  }

  // ช่วงบ่าย 2 คาบแรก (12.30 - 14.10 หรือ 13.00 - 14.40)
  if (startPeriod === 4 && span === 2) {
    return {
      bg: "bg-purple-500/10 dark:bg-purple-950/40 hover:bg-purple-500/15",
      border: "border-purple-500/30 dark:border-purple-700/50",
      tagBg: "bg-purple-500/20 text-purple-800 dark:text-purple-200 border-purple-400/40",
      timeBg: "bg-purple-600 text-white dark:bg-purple-500 font-mono",
      codeColor: "text-purple-700 dark:text-purple-300 font-bold",
      titleColor: "text-foreground font-bold",
      periodLabel: "บ่าย 2 คาบแรก (12.30-14.10)",
      accentBar: "bg-purple-500",
    };
  }

  // ช่วงบ่าย/เย็น 2 คาบหลัง (14.20 - 16.00 หรือ 14.30 - 16.50)
  if (startPeriod >= 5 && span === 2) {
    return {
      bg: "bg-amber-500/10 dark:bg-amber-950/40 hover:bg-amber-500/15",
      border: "border-amber-500/30 dark:border-amber-700/50",
      tagBg: "bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-400/40",
      timeBg: "bg-amber-600 text-white dark:bg-amber-500 font-mono",
      codeColor: "text-amber-700 dark:text-amber-300 font-bold",
      titleColor: "text-foreground font-bold",
      periodLabel: "บ่าย/เย็น 2 คาบ (14.30-16.50)",
      accentBar: "bg-amber-500",
    };
  }

  // 1 คาบเดี่ยว (09.00-09.50, 10.50-11.30, 15.10-16.50 ฯลฯ)
  return {
    bg: "bg-muted/40 dark:bg-muted/20 hover:bg-muted/60",
    border: "border-border/80",
    tagBg: "bg-muted text-muted-foreground border-border",
    timeBg: "bg-muted-foreground/80 text-background font-mono",
    codeColor: "text-primary font-bold",
    titleColor: "text-foreground font-semibold",
    periodLabel: `${span} คาบ`,
    accentBar: "bg-primary/50",
  };
}
