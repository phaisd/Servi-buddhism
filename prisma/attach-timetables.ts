import { prisma } from "../src/shared/lib/infra/prisma";
import {
  injectTimetableData,
  SAMPLE_RELIGION_PHILOSOPHY_TIMETABLE,
  SAMPLE_BUDDHIST_STUDIES_EN_TIMETABLE,
} from "../src/features/curriculum";

async function main() {
  const curriculums = await prisma.curriculum.findMany({
    include: { department: true },
  });

  console.log("Current Curriculums count:", curriculums.length);

  for (const c of curriculums) {
    console.log(`- [${c.id}] ${c.nameTh} (${c.language || "TH"})`);

    const isEn =
      c.language === "EN" ||
      (c.nameEn && c.nameEn.toLowerCase().includes("buddhist")) ||
      (c.nameTh && c.nameTh.includes("English"));

    const sample = isEn
      ? SAMPLE_BUDDHIST_STUDIES_EN_TIMETABLE
      : SAMPLE_RELIGION_PHILOSOPHY_TIMETABLE;

    const newDescTh = injectTimetableData(c.descriptionTh || "", {
      documentUrl: "/uploads/curriculum/documents/timetable-sample.pdf",
      documentName: isEn
        ? "Timetable Academic Year 2026 (BA Buddhist Studies English Program).pdf"
        : "ตารางสอนปริญญาตรี ภาคการศึกษาที่ 1 ปีการศึกษา 2569 สาขาวิชาศาสนาและปรัชญา.pdf",
      timetables: sample,
    });

    await prisma.curriculum.update({
      where: { id: c.id },
      data: {
        descriptionTh: newDescTh,
      },
    });

    console.log(`  -> Updated timetable for ${c.nameTh} successfully.`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
