import { describe, it, expect } from "vitest";
import {
  dateToThaiString,
  toDateInputValue,
  normalizeDayKey,
  generateTimetableCsv,
  generateCsvTemplate,
  parseTimetableCsv,
  generatePrintableTimetableHtml,
  resolveSlotPlacement,
  getSlotColorTheme,
} from "./timetable-helpers";
import type { TimetableSlot, YearTimetable } from "./timetable-types";

describe("Timetable Helpers", () => {
  it("converts ISO date to Thai Buddhist Era string", () => {
    expect(dateToThaiString("2026-06-09")).toBe("9 มิถุนายน 2569");
    expect(dateToThaiString("2026-09-25")).toBe("25 กันยายน 2569");
    expect(dateToThaiString("9 มิถุนายน 2569")).toBe("9 มิถุนายน 2569");
  });

  it("converts Thai date and ISO date to input[type='date'] format YYYY-MM-DD", () => {
    expect(toDateInputValue("2026-06-09")).toBe("2026-06-09");
    expect(toDateInputValue("9 มิถุนายน 2569")).toBe("2026-06-09");
    expect(toDateInputValue("25 กันยายน 2569")).toBe("2026-09-25");
  });

  it("normalizes Thai and English day names", () => {
    expect(normalizeDayKey("วันจันทร์")).toBe("Mon");
    expect(normalizeDayKey("จันทร์")).toBe("Mon");
    expect(normalizeDayKey("Monday")).toBe("Mon");
    expect(normalizeDayKey("วันพุธ")).toBe("Wed");
    expect(normalizeDayKey("ศุกร์")).toBe("Fri");
  });

  it("generates CSV and parses it back accurately with Thai characters", () => {
    const slots: TimetableSlot[] = [
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
    ];

    const csvText = generateTimetableCsv(slots, { yearLevel: 1 });
    expect(csvText).toContain("000 102");
    expect(csvText).toContain("กฎหมายทั่วไป");

    const templateText = generateCsvTemplate();
    expect(templateText).toContain("ชั้นปี");

    const parsed = parseTimetableCsv(csvText);
    expect(parsed.length).toBe(1);
    expect(parsed[0].yearLevel).toBe(1);
    expect(parsed[0].slot.courseCode).toBe("000 102");
    expect(parsed[0].slot.courseName).toBe("กฎหมายทั่วไป");
    expect(parsed[0].slot.isMidtermExam).toBe(true);
    expect(parsed[0].slot.periodSpan).toBe(3);
  });

  it("generates printable HTML with official MCU structure", () => {
    const timetable: YearTimetable = {
      yearLevel: 1,
      semester: 1,
      academicYear: "2569",
      startDate: "2026-06-09",
      endDate: "2026-09-25",
      defaultRoom: "ชั้น 5 ห้อง D 516/1",
      slots: [
        {
          day: "Mon",
          timeRange: "09.00-11.30",
          courseCode: "000 102",
          courseName: "กฎหมายทั่วไป",
          instructors: "พระมหามงคลกานต์",
        },
      ],
    };

    const html = generatePrintableTimetableHtml({
      curriculumName: "พุทธศาสตรบัณฑิต",
      timetable,
    });

    expect(html).toContain("มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย");
    expect(html).toContain("พุทธศาสตรบัณฑิต");
    expect(html).toContain("000 102");
    expect(html).toContain("กฎหมายทั่วไป");
    expect(html).toContain("9 มิถุนายน 2569");
  });

  it("accurately calculates period placement and spans for morning and afternoon classes", () => {
    // 3 คาบเช้า (09.00 - 11.30)
    expect(
      resolveSlotPlacement({
        day: "Mon",
        timeRange: "09.00-11.30",
        courseCode: "000 102",
        courseName: "วิชาเช้า 3 คาบ",
        instructors: "อาจารย์",
      })
    ).toEqual({ startPeriod: 1, span: 3 });

    // 2 คาบเช้าแรก (09.00 - 10.40)
    expect(
      resolveSlotPlacement({
        day: "Tue",
        timeRange: "09.00-10.40",
        courseCode: "000 999",
        courseName: "วิชาเช้า 2 คาบแรก",
        instructors: "อาจารย์",
      })
    ).toEqual({ startPeriod: 1, span: 2 });

    // 2 คาบเช้าหลัง (09.50 - 11.30)
    expect(
      resolveSlotPlacement({
        day: "Wed",
        timeRange: "09.50-11.30",
        courseCode: "000 101",
        courseName: "วิชาเช้า 2 คาบหลัง",
        instructors: "อาจารย์",
      })
    ).toEqual({ startPeriod: 2, span: 2 });

    // 3 คาบบ่าย (12.30 - 15.10 หรือ 13.00 - 15.30)
    expect(
      resolveSlotPlacement({
        day: "Thu",
        timeRange: "12.30-15.10",
        courseCode: "000 140",
        courseName: "วิชาบ่าย 3 คาบ",
        instructors: "อาจารย์",
      })
    ).toEqual({ startPeriod: 4, span: 3 });

    expect(
      resolveSlotPlacement({
        day: "Thu",
        timeRange: "13.00-15.30",
        courseCode: "000 140",
        courseName: "วิชาบ่าย 3 คาบ",
        instructors: "อาจารย์",
      })
    ).toEqual({ startPeriod: 4, span: 3 });

    // 2 คาบบ่ายแรก (12.30 - 14.10 หรือ 13.00 - 14.40)
    expect(
      resolveSlotPlacement({
        day: "Fri",
        timeRange: "12.30-14.10",
        courseCode: "000 136",
        courseName: "วิชาบ่าย 2 คาบแรก",
        instructors: "อาจารย์",
      })
    ).toEqual({ startPeriod: 4, span: 2 });

    // 2 คาบบ่ายหลัง / เย็น (14.30 - 16.50)
    expect(
      resolveSlotPlacement({
        day: "Fri",
        timeRange: "14.30-16.50",
        courseCode: "112 102",
        courseName: "วิชาบ่ายหลัง 2 คาบ",
        instructors: "อาจารย์",
      })
    ).toEqual({ startPeriod: 6, span: 2 });

    // 1 คาบเดี่ยว (15.10 - 16.50)
    expect(
      resolveSlotPlacement({
        day: "Mon",
        timeRange: "15.10-16.50",
        courseCode: "SP 101",
        courseName: "วิชาเสริม",
        instructors: "อาจารย์",
      })
    ).toEqual({ startPeriod: 7, span: 1 });

    // Explicit overrides
    expect(
      resolveSlotPlacement({
        day: "Mon",
        timeRange: "กำหนดเอง",
        courseCode: "000 001",
        courseName: "กำหนดเอง",
        instructors: "อาจารย์",
        startPeriod: 5,
        periodSpan: 2,
      })
    ).toEqual({ startPeriod: 5, span: 2 });
  });

  it("provides color themes for different period spans and periods", () => {
    const morning3 = getSlotColorTheme(1, 3);
    expect(morning3.periodLabel).toContain("เช้า 3 คาบ");
    expect(morning3.bg).toContain("sky");

    const morning2 = getSlotColorTheme(1, 2);
    expect(morning2.periodLabel).toContain("เช้า 2 คาบแรก");
    expect(morning2.bg).toContain("emerald");

    const afternoon3 = getSlotColorTheme(4, 3);
    expect(afternoon3.periodLabel).toContain("บ่าย 3 คาบ");
    expect(afternoon3.bg).toContain("indigo");
  });
});
