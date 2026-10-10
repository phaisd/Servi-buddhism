import { prisma } from "../src/shared/lib/infra/prisma";

async function main() {
  console.log("Upserting sample majors (Programs) by degree levels...");

  const tenant = await prisma.tenant.findFirst({ where: { code: "MCU", isActive: true } }) 
    ?? await prisma.tenant.findFirst({ where: { isActive: true } });

  if (!tenant) {
    throw new Error("No tenant found");
  }

  const programs = [
    // ปริญญาตรี
    {
      nameTh: "สาขาวิชาพระพุทธศาสนา",
      nameEn: "Buddhism Program",
      code: "PROG_BUD_BA",
      type: "PROGRAM",
      descriptionTh: "ระดับปริญญาตรี ภาควิชาพระพุทธศาสนา",
      orderIndex: 1,
    },
    {
      nameTh: "สาขาวิชาศาสนาและปรัชญา",
      nameEn: "Religion and Philosophy Program",
      code: "PROG_PHI_BA",
      type: "PROGRAM",
      descriptionTh: "ระดับปริญญาตรี ภาควิชาศาสนาและปรัชญา",
      orderIndex: 2,
    },
    {
      nameTh: "สาขาวิชาบาลีสันสกฤต",
      nameEn: "Pali and Sanskrit Program",
      code: "PROG_PALI_BA",
      type: "PROGRAM",
      descriptionTh: "ระดับปริญญาตรี ภาควิชาบาลีและสันสกฤต",
      orderIndex: 3,
    },
    // ปริญญาโท / เอก
    {
      nameTh: "สาขาวิชาพระไตรปิฎกศึกษา",
      nameEn: "Tipitaka Studies Program",
      code: "PROG_TIPITAKA",
      type: "PROGRAM",
      descriptionTh: "ระดับปริญญาโทและปริญญาเอก ศึกษาพระไตรปิฎกเชิงลึก",
      orderIndex: 4,
    },
    {
      nameTh: "สาขาวิชาศาสนาเปรียบเทียบ",
      nameEn: "Comparative Religion Program",
      code: "PROG_COMP_REL",
      type: "PROGRAM",
      descriptionTh: "ระดับปริญญาโทและปริญญาเอก",
      orderIndex: 5,
    },
    // ประกาศนียบัตร
    {
      nameTh: "สาขาวิชาพระพุทธศาสนา (ประกาศนียบัตร)",
      nameEn: "Buddhism Certificate Program",
      code: "PROG_BUD_CERT",
      type: "PROGRAM",
      descriptionTh: "ระดับประกาศนียบัตร",
      orderIndex: 6,
    },
    {
      nameTh: "สาขาวิชาวิปัสสนาภาวนากับโลกสมัยใหม่",
      nameEn: "Vipassana Meditation and Modern World Program",
      code: "PROG_VIPASSANA",
      type: "PROGRAM",
      descriptionTh: "ระดับประกาศนียบัตร การเจริญวิปัสสนาภาวนากับโลกสมัยใหม่",
      orderIndex: 7,
    },
  ];

  for (const prog of programs) {
    const existing = await prisma.department.findFirst({
      where: { tenantId: tenant.id, nameTh: prog.nameTh },
    });

    if (existing) {
      await prisma.department.update({
        where: { id: existing.id },
        data: {
          nameEn: prog.nameEn,
          code: prog.code,
          type: "PROGRAM",
          descriptionTh: prog.descriptionTh,
          orderIndex: prog.orderIndex,
          isActive: true,
        },
      });
      console.log(`Updated Program: ${prog.nameTh}`);
    } else {
      await prisma.department.create({
        data: {
          tenantId: tenant.id,
          nameTh: prog.nameTh,
          nameEn: prog.nameEn,
          code: prog.code,
          type: "PROGRAM",
          descriptionTh: prog.descriptionTh,
          orderIndex: prog.orderIndex,
          isActive: true,
        },
      });
      console.log(`Created Program: ${prog.nameTh}`);
    }
  }

  console.log("Seeding initial majors completed successfully!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
