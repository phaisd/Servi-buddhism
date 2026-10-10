import { prisma } from "../src/shared/lib/infra/prisma";

async function main() {
  console.log("Adding columns to database...");
  await prisma.$executeRawUnsafe(`
    ALTER TABLE departments ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    ALTER TABLE curriculums ADD COLUMN IF NOT EXISTS major_th VARCHAR(255);
    ALTER TABLE curriculums ADD COLUMN IF NOT EXISTS major_en VARCHAR(255);
    ALTER TABLE curriculums ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'TH';
  `);

  console.log("Upserting the 3 required departments...");
  const tenant = await prisma.tenant.findFirst({ where: { code: "MCU", isActive: true } }) 
    ?? await prisma.tenant.findFirst({ where: { isActive: true } });

  if (!tenant) {
    throw new Error("No tenant found");
  }

  // 1. ภาควิชาพระพุทธศาสนา
  const deptBuddhism = await prisma.department.findFirst({
    where: { tenantId: tenant.id, nameTh: "ภาควิชาพระพุทธศาสนา" },
  });
  if (!deptBuddhism) {
    await prisma.department.create({
      data: {
        tenantId: tenant.id,
        nameTh: "ภาควิชาพระพุทธศาสนา",
        nameEn: "Department of Buddhist Studies",
        code: "BUDDHISM",
        type: "DEPARTMENT",
        orderIndex: 1,
      },
    });
    console.log("Created: ภาควิชาพระพุทธศาสนา");
  } else {
    await prisma.department.update({
      where: { id: deptBuddhism.id },
      data: { code: "BUDDHISM", type: "DEPARTMENT", orderIndex: 1 },
    });
    console.log("Updated: ภาควิชาพระพุทธศาสนา");
  }

  // 2. ภาควิชาศาสนาและปรัชญา (rename from ภาควิชาปรัชญา if exists)
  const oldPhilosophy = await prisma.department.findFirst({
    where: { tenantId: tenant.id, nameTh: "ภาควิชาปรัชญา" },
  });
  if (oldPhilosophy) {
    await prisma.department.update({
      where: { id: oldPhilosophy.id },
      data: {
        nameTh: "ภาควิชาศาสนาและปรัชญา",
        nameEn: "Department of Religion and Philosophy",
        code: "PHILOSOPHY",
        type: "DEPARTMENT",
        orderIndex: 2,
      },
    });
    console.log("Renamed to: ภาควิชาศาสนาและปรัชญา");
  } else {
    const deptPhil = await prisma.department.findFirst({
      where: { tenantId: tenant.id, nameTh: "ภาควิชาศาสนาและปรัชญา" },
    });
    if (!deptPhil) {
      await prisma.department.create({
        data: {
          tenantId: tenant.id,
          nameTh: "ภาควิชาศาสนาและปรัชญา",
          nameEn: "Department of Religion and Philosophy",
          code: "PHILOSOPHY",
          type: "DEPARTMENT",
          orderIndex: 2,
        },
      });
      console.log("Created: ภาควิชาศาสนาและปรัชญา");
    }
  }

  // 3. ภาควิชาบาลีและสันสกฤต
  const deptPali = await prisma.department.findFirst({
    where: { tenantId: tenant.id, nameTh: "ภาควิชาบาลีและสันสกฤต" },
  });
  if (!deptPali) {
    await prisma.department.create({
      data: {
        tenantId: tenant.id,
        nameTh: "ภาควิชาบาลีและสันสกฤต",
        nameEn: "Department of Pali and Sanskrit",
        code: "PALI_SANSKRIT",
        type: "DEPARTMENT",
        orderIndex: 3,
      },
    });
    console.log("Created: ภาควิชาบาลีและสันสกฤต");
  } else {
    await prisma.department.update({
      where: { id: deptPali.id },
      data: { code: "PALI_SANSKRIT", type: "DEPARTMENT", orderIndex: 3 },
    });
    console.log("Updated: ภาควิชาบาลีและสันสกฤต");
  }

  console.log("Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
