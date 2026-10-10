export interface TimetableSlot {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  timeRange: string; // e.g. "09.00-11.30", "13.00-15.30", "15.30-17.00"
  courseCode: string; // e.g. "000 102", "112 305"
  courseName: string; // e.g. "กฎหมายทั่วไป", "General Law"
  instructors: string; // e.g. "พระมหามงคลกานต์ ฐิตธมฺโม, รศ. ดร.*"
  room?: string; // e.g. "D 516/1", "D 220/2"
  isMidtermExam?: boolean; // ข้อสอบกลาง (*)
  startPeriod?: number; // คาบเริ่มต้น (0-indexed หรือ 1-indexed)
  periodSpan?: number; // จำนวนคาบที่ครอบคลุม เช่น 2 หรือ 3 คาบ
  note?: string;
}

export interface YearTimetable {
  yearLevel: number; // 1, 2, 3, 4
  semester: number; // 1, 2
  academicYear: string; // "2569" or "2026"
  startDate?: string; // "9 มิถุนายน 2569" or "June 9, 2026"
  endDate?: string; // "25 กันยายน 2569" or "September 25, 2026"
  defaultRoom: string; // "D 516/1", "D 517-518"
  notes?: string[];
  slots: TimetableSlot[];
}

export interface CurriculumTimetableData {
  documentUrl?: string;
  documentName?: string;
  timetables: YearTimetable[];
}

const TIMETABLE_MARKER_REGEX = /<!-- TIMETABLE_DATA:(.*?) -->/;
const LEGACY_DOC_MARKER_REGEX = /<!-- TIMETABLE_DOC:(.*?) -->/;

/**
 * สกัดข้อมูล Timetable และล้าง description ให้สะอาด
 */
export function extractTimetableData(
  descTh?: string | null,
  descEn?: string | null
): {
  cleanDescTh: string;
  cleanDescEn: string;
  timetableData: CurriculumTimetableData | null;
} {
  let cleanDescTh = descTh || "";
  let cleanDescEn = descEn || "";
  let timetableData: CurriculumTimetableData | null = null;

  // 1. ตรวจสอบ TIMETABLE_DATA แบบสมบูรณ์
  const matchDataTh = cleanDescTh.match(TIMETABLE_MARKER_REGEX);
  const matchDataEn = cleanDescEn.match(TIMETABLE_MARKER_REGEX);
  const dataMatch = matchDataTh || matchDataEn;

  if (dataMatch) {
    try {
      timetableData = JSON.parse(dataMatch[1]) as CurriculumTimetableData;
    } catch {
      timetableData = null;
    }
    cleanDescTh = cleanDescTh.replace(TIMETABLE_MARKER_REGEX, "").trim();
    cleanDescEn = cleanDescEn.replace(TIMETABLE_MARKER_REGEX, "").trim();
  }

  // 2. ตรวจสอบ TIMETABLE_DOC แบบเก่า (ถ้ายังไม่มี TIMETABLE_DATA)
  const matchDocTh = cleanDescTh.match(LEGACY_DOC_MARKER_REGEX);
  const matchDocEn = cleanDescEn.match(LEGACY_DOC_MARKER_REGEX);
  const docMatch = matchDocTh || matchDocEn;

  if (docMatch) {
    try {
      const parsedDoc = JSON.parse(docMatch[1]);
      if (!timetableData) {
        timetableData = {
          documentUrl: parsedDoc.url,
          documentName: parsedDoc.name,
          timetables: [],
        };
      } else if (!timetableData.documentUrl) {
        timetableData.documentUrl = parsedDoc.url;
        timetableData.documentName = parsedDoc.name;
      }
    } catch {
      if (!timetableData) {
        timetableData = {
          documentUrl: docMatch[1],
          documentName: "ตารางเรียนและแผนการศึกษา",
          timetables: [],
        };
      }
    }
    cleanDescTh = cleanDescTh.replace(LEGACY_DOC_MARKER_REGEX, "").trim();
    cleanDescEn = cleanDescEn.replace(LEGACY_DOC_MARKER_REGEX, "").trim();
  }

  return { cleanDescTh, cleanDescEn, timetableData };
}

/**
 * ประกอบข้อมูล Timetable Data เข้ากับ descriptionTh
 */
export function injectTimetableData(
  descTh: string,
  timetableData: CurriculumTimetableData
): string {
  const clean = descTh
    .replace(TIMETABLE_MARKER_REGEX, "")
    .replace(LEGACY_DOC_MARKER_REGEX, "")
    .trim();

  // สร้าง marker ทั้ง DATA และ DOC เพื่อให้ Backward compatible
  const dataMarker = `<!-- TIMETABLE_DATA:${JSON.stringify(timetableData)} -->`;
  let result = clean ? `${clean}\n\n${dataMarker}` : dataMarker;

  if (timetableData.documentUrl) {
    const docMarker = `<!-- TIMETABLE_DOC:${JSON.stringify({
      url: timetableData.documentUrl,
      name: timetableData.documentName || "ตารางเรียนและแผนการศึกษา",
    })} -->`;
    result = `${result}\n\n${docMarker}`;
  }

  return result.trim();
}
