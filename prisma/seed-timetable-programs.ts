import { prisma } from "../src/shared/lib/infra/prisma";
import {
  injectTimetableData,
  SAMPLE_RELIGION_PHILOSOPHY_TIMETABLE,
  SAMPLE_BUDDHIST_STUDIES_EN_TIMETABLE,
} from "../src/features/curriculum";

async function main() {
  const defaultTenant = await prisma.tenant.findFirst();
  if (!defaultTenant) {
    console.error("No tenant found!");
    return;
  }
  const tenantId = defaultTenant.id;

  // 1. Department 1: ภาควิชาศาสนาและปรัชญา
  const deptPhil =
    (await prisma.department.findFirst({
      where: { tenantId, nameTh: "ภาควิชาศาสนาและปรัชญา" },
    })) ??
    (await prisma.department.create({
      data: {
        tenantId,
        nameTh: "ภาควิชาศาสนาและปรัชญา",
        nameEn: "Department of Religion and Philosophy",
        type: "DEPARTMENT",
        descriptionTh: "จัดการเรียนการสอนด้านศาสนาและปรัชญา",
        orderIndex: 1,
        isActive: true,
      },
    }));

  // 2. Department 2: ภาควิชาพระพุทธศาสนา
  const deptBud =
    (await prisma.department.findFirst({
      where: { tenantId, nameTh: "ภาควิชาพระพุทธศาสนา" },
    })) ??
    (await prisma.department.create({
      data: {
        tenantId,
        nameTh: "ภาควิชาพระพุทธศาสนา",
        nameEn: "Department of Buddhist Studies",
        type: "DEPARTMENT",
        descriptionTh: "จัดการเรียนการสอนด้านพระพุทธศาสนา",
        orderIndex: 2,
        isActive: true,
      },
    }));

  // 3. Program/Major: สาขาวิชาศาสนาและปรัชญา
  const existingProgPhil = await prisma.department.findFirst({
    where: { tenantId, nameTh: "ศาสนาและปรัชญา", type: "PROGRAM" },
  });
  if (!existingProgPhil) {
    await prisma.department.create({
      data: {
        tenantId,
        nameTh: "ศาสนาและปรัชญา",
        nameEn: "Religion and Philosophy",
        type: "PROGRAM",
        orderIndex: 1,
        isActive: true,
      },
    });
  }

  // 4. Program/Major: สาขาวิชาพระพุทธศาสนา (English Program)
  const existingProgBudEn = await prisma.department.findFirst({
    where: { tenantId, nameTh: "พระพุทธศาสนา (English Program)", type: "PROGRAM" },
  });
  if (!existingProgBudEn) {
    await prisma.department.create({
      data: {
        tenantId,
        nameTh: "พระพุทธศาสนา (English Program)",
        nameEn: "Buddhist Studies (English Program)",
        type: "PROGRAM",
        orderIndex: 2,
        isActive: true,
      },
    });
  }

  // Seed / Update Curriculum 1: ศาสนศาสตรบัณฑิต / พุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา
  const currPhilDesc = injectTimetableData(
    "หลักสูตรศาสนศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย มุ่งเน้นการศึกษาปรัชญาอินเดีย โบราณ ศาสนาพราหมณ์-ฮินดู พุทธปรัชญา และจริยศาสตร์สากล",
    {
      documentUrl: "/uploads/curriculum/documents/timetable-religion-philosophy-2569.pdf",
      documentName: "ตารางสอนปริญญาตรี ภาคการศึกษาที่ 1 ปีการศึกษา 2569 สาขาวิชาศาสนาและปรัชญา.pdf",
      timetables: SAMPLE_RELIGION_PHILOSOPHY_TIMETABLE,
    }
  );

  const existingCurrPhil = await prisma.curriculum.findFirst({
    where: { tenantId, nameTh: "พุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา" },
  });

  if (existingCurrPhil) {
    await prisma.curriculum.update({
      where: { id: existingCurrPhil.id },
      data: {
        departmentId: deptPhil.id,
        majorTh: "ศาสนาและปรัชญา",
        majorEn: "Religion and Philosophy",
        language: "TH",
        degree: "BACHELOR",
        durationYears: 4,
        descriptionTh: currPhilDesc,
        isActive: true,
      },
    });
    console.log("Updated Curriculum: พุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา");
  } else {
    await prisma.curriculum.create({
      data: {
        tenantId,
        nameTh: "พุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา",
        nameEn: "Bachelor of Arts in Religion and Philosophy",
        degree: "BACHELOR",
        durationYears: 4,
        departmentId: deptPhil.id,
        majorTh: "ศาสนาและปรัชญา",
        majorEn: "Religion and Philosophy",
        language: "TH",
        descriptionTh: currPhilDesc,
        orderIndex: 1,
        isActive: true,
      },
    });
    console.log("Created Curriculum: พุทธศาสตรบัณฑิต สาขาวิชาศาสนาและปรัชญา");
  }

  // Seed / Update Curriculum 2: Bachelor of Arts Degree in Buddhist Studies (English Program)
  const currBudEnDesc = injectTimetableData(
    "Bachelor of Arts Degree in Buddhist Studies (English Program), Faculty of Buddhism, Mahachulalongkornrajavidyalaya University, Wangnoi, Ayutthaya, Thailand. Comprehensive study of Tipitaka, Buddhist Philosophy, Meditation, and Global Humanities.",
    {
      documentUrl: "/uploads/curriculum/documents/timetable-buddhist-studies-en-2026.pdf",
      documentName: "Timetable First Semester Academic Year 2026 - BA Buddhist Studies (English Program).pdf",
      timetables: SAMPLE_BUDDHIST_STUDIES_EN_TIMETABLE,
    }
  );

  const existingCurrBudEn = await prisma.curriculum.findFirst({
    where: {
      tenantId,
      OR: [
        { nameTh: "พุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (English Program)" },
        { nameEn: "Bachelor of Art Degree in Buddhist Studies (English Program)" },
      ],
    },
  });

  if (existingCurrBudEn) {
    await prisma.curriculum.update({
      where: { id: existingCurrBudEn.id },
      data: {
        nameTh: "พุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (English Program)",
        nameEn: "Bachelor of Art Degree in Buddhist Studies (English Program)",
        departmentId: deptBud.id,
        majorTh: "พระพุทธศาสนา (English Program)",
        majorEn: "Buddhist Studies (English Program)",
        language: "EN",
        degree: "BACHELOR",
        durationYears: 4,
        descriptionTh: currBudEnDesc,
        descriptionEn: currBudEnDesc,
        isActive: true,
      },
    });
    console.log("Updated Curriculum: Buddhist Studies (English Program)");
  } else {
    await prisma.curriculum.create({
      data: {
        tenantId,
        nameTh: "พุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (English Program)",
        nameEn: "Bachelor of Art Degree in Buddhist Studies (English Program)",
        degree: "BACHELOR",
        durationYears: 4,
        departmentId: deptBud.id,
        majorTh: "พระพุทธศาสนา (English Program)",
        majorEn: "Buddhist Studies (English Program)",
        language: "EN",
        descriptionTh: currBudEnDesc,
        descriptionEn: currBudEnDesc,
        orderIndex: 2,
        isActive: true,
      },
    });
    console.log("Created Curriculum: Buddhist Studies (English Program)");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
