import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedUser } from "../prisma/lib/seed-core";

const connectionString = process.env.PROD_DATABASE_URL || "postgresql://vibe_admin:VibeProdPass2026!SecureKey@127.0.0.1:5439/vibe_production?schema=public";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  console.log("[seed-prod] กำลังเชื่อมต่อไปยัง Production Database...");

  // 1. ค้นหา Tenant หลัก
  const tenant = await prisma.tenant.findFirst({ where: { code: "MCU" } }) ?? await prisma.tenant.findFirst();
  if (!tenant) {
    console.error("[seed-prod] ไม่พบ Tenant ในระบบ กรุณารัน bootstrap ก่อน");
    process.exit(1);
  }
  const tenantId = tenant.id;
  console.log(`[seed-prod] ใช้งาน Tenant: ${tenant.nameTh} (${tenant.code}) [${tenantId}]`);

  // 2. ดึงบทบาท
  const roles = await prisma.role.findMany({ where: { tenantId } });
  const roleMap = Object.fromEntries(roles.map((r) => [r.code, r.id]));

  const defaultPasswordHash = await bcrypt.hash("Passw0rd!vibe", 12);

  // 3. สร้าง/ตรวจสอบผู้ใช้ Staff และ Student (Viewer)
  const adminUser = await prisma.user.findFirst({ where: { email: "admin@buddhist.mcu.ac.th" } });
  const authorId = adminUser?.id;

  if (roleMap["STAFF"]) {
    await seedUser(prisma, tenantId, {
      email: "staff@buddhist.mcu.ac.th",
      name: "เจ้าหน้าที่บริหารงานทั่วไป",
      passwordHash: defaultPasswordHash,
      roleIds: [roleMap["STAFF"]],
    });
    console.log("[seed-prod] ผู้ใช้ Staff: staff@buddhist.mcu.ac.th (Passw0rd!vibe)");
  }

  if (roleMap["VIEWER"]) {
    await seedUser(prisma, tenantId, {
      email: "student@buddhist.mcu.ac.th",
      name: "พระมหาธีรภัทร นิสิตชั้นปีที่ 3",
      passwordHash: defaultPasswordHash,
      roleIds: [roleMap["VIEWER"]],
    });
    console.log("[seed-prod] ผู้ใช้ นิสิต/ผู้ใช้ทั่วไป: student@buddhist.mcu.ac.th (Passw0rd!vibe)");
  }

  // 4. สร้างภาควิชา
  const dept1 = await prisma.department.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      tenantId,
      nameTh: "ภาควิชาพระพุทธศาสนา",
      nameEn: "Department of Buddhist Studies",
      orderIndex: 1,
    },
  });

  const dept2 = await prisma.department.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      tenantId,
      nameTh: "ภาควิชาปรัชญา",
      nameEn: "Department of Philosophy",
      orderIndex: 2,
    },
  });

  const dept3 = await prisma.department.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      tenantId,
      nameTh: "ภาควิชาบาลีพุทธศาสตร์",
      nameEn: "Department of Pali and Buddhist Studies",
      orderIndex: 3,
    },
  });
  console.log("[seed-prod] สร้างภาควิชา 3 ภาคเรียบร้อย");

  // 5. สร้างคณาจารย์
  await prisma.personnel.upsert({
    where: { id: "00000000-0000-0000-0000-000000000011" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000011",
      tenantId,
      departmentId: dept1.id,
      firstNameTh: "พระธรรมวัชรบัณฑิต (สมจินต์)",
      lastNameTh: "สมฺมาปญฺโญ, ศ.ดร.",
      firstNameEn: "Ven. Prof. Dr. Somjin",
      lastNameEn: "Sammapannyo",
      positionTh: "อธิการบดี / ศาสตราจารย์ประจำภาควิชาพระพุทธศาสนา",
      positionEn: "Rector / Professor of Buddhist Studies",
      type: "EXECUTIVE",
      email: "somjin@mcu.ac.th",
      orderIndex: 1,
    },
  });

  await prisma.personnel.upsert({
    where: { id: "00000000-0000-0000-0000-000000000012" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000012",
      tenantId,
      departmentId: dept1.id,
      firstNameTh: "พระสุธีรัตนบัณฑิต (สุทิตย์)",
      lastNameTh: "อาภากโร, รศ.ดร.",
      firstNameEn: "Assoc. Prof. Dr. Suthit",
      lastNameEn: "Apakaro",
      positionTh: "คณบดีคณะพุทธศาสตร์",
      positionEn: "Dean of Faculty of Buddhism",
      type: "EXECUTIVE",
      email: "dean.buddhist@mcu.ac.th",
      orderIndex: 2,
    },
  });

  await prisma.personnel.upsert({
    where: { id: "00000000-0000-0000-0000-000000000013" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000013",
      tenantId,
      departmentId: dept2.id,
      firstNameTh: "ผศ.ดร.เมธา",
      lastNameTh: "บุณยรัตน์",
      firstNameEn: "Asst. Prof. Dr. Metha",
      lastNameEn: "Bunyarat",
      positionTh: "หัวหน้าภาควิชาปรัชญา",
      positionEn: "Head of Philosophy Department",
      type: "ACADEMIC",
      email: "metha@mcu.ac.th",
      orderIndex: 3,
    },
  });
  console.log("[seed-prod] สร้างทำเนียบคณาจารย์เรียบร้อย");

  // 6. สร้างข่าวสาร
  if (authorId) {
    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId, slug: "admission-buddhist-2569" } },
      update: {},
      create: {
        tenantId,
        authorId,
        titleTh: "คณะพุทธศาสตร์ เปิดรับสมัครนิสิตใหม่ระดับปริญญาตรี ประจำปีการศึกษา 2569",
        titleEn: "Faculty of Buddhism Opens Applications for Undergraduate Programs (AY 2026)",
        slug: "admission-buddhist-2569",
        summaryTh: "เปิดรับสมัครผู้สนใจเข้าศึกษาต่อสาขาวิชาพระพุทธศาสนา สาขาวิชาปรัชญา และสาขาวิชาบาลีพุทธศาสตร์ ทุนการศึกษาเต็มจำนวนสำหรับพระภิกษุสามเณร",
        summaryEn: "Admission is now open for Buddhist Studies, Philosophy, and Pali Studies with scholarships.",
        contentTh: "คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย เปิดรับสมัครบุคคลเข้าศึกษาในระดับปริญญาตรี (พธ.บ.) ประจำปีการศึกษา 2569\n\nสาขาวิชาที่เปิดรับสมัคร:\n1. สาขาวิชาพระพุทธศาสนา\n2. สาขาวิชาปรัชญา\n3. สาขาวิชาบาลีพุทธศาสตร์\n\nเปิดรับสมัครตั้งแต่บัดนี้เป็นต้นไป ติดต่อฝ่ายทะเบียนคณะพุทธศาสตร์ โทร. 035-248-000",
        contentEn: "The Faculty of Buddhism invites applications for undergraduate degree programs for the academic year 2026.",
        category: "ACADEMIC",
        status: "PUBLISHED",
        isPinned: true,
        pinOrder: 1,
        publishedAt: new Date(),
        viewCount: 185,
      },
    });

    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId, slug: "international-conference-ai-buddhism" } },
      update: {},
      create: {
        tenantId,
        authorId,
        titleTh: "โครงการประชุมวิชาการระดับนานาชาติ: พุทธปรัชญากับปัญญาประดิษฐ์และความฉลาดทางจริยธรรม",
        titleEn: "International Conference: Buddhist Philosophy and Artificial Intelligence",
        slug: "international-conference-ai-buddhism",
        summaryTh: "ขอเชิญคณาจารย์ นักวิชาการ และผู้สนใจ ร่วมรับฟังการปาฐกถาพิเศษและการนำเสนอผลงานวิจัยจากนักวิชาการทั่วโลก",
        summaryEn: "Join leading scholars worldwide discussing the intersection of Buddhist ethics and modern AI systems.",
        contentTh: "การประชุมวิชาการระดับนานาชาติ จัดขึ้น ณ อาคาร มวก. 48 พรรษา มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย และระบบออนไลน์ Zoom",
        contentEn: "International hybrid conference held at MCU main campus and online via Zoom.",
        category: "EVENT",
        status: "PUBLISHED",
        isPinned: false,
        publishedAt: new Date(),
        viewCount: 94,
      },
    });
    console.log("[seed-prod] สร้างข่าวสารประชาสัมพันธ์เรียบร้อย");
  }

  // 7. สร้างหลักสูตร
  await prisma.curriculum.upsert({
    where: { id: "00000000-0000-0000-0000-000000000021" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000021",
      tenantId,
      nameTh: "หลักสูตรพุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา (พธ.บ.)",
      nameEn: "Bachelor of Arts in Buddhist Studies (B.A.)",
      degree: "BACHELOR",
      durationYears: 4,
      descriptionTh: "มุ่งผลิตบัณฑิตให้มีความรู้ความเข้าใจในพระไตรปิฎก หลักพุทธธรรม และสามารถประยุกต์ใช้เพื่อการพัฒนาจิตใจและสังคม",
      descriptionEn: "Deep study of Buddhist texts, scriptures, ethics, and contemporary application.",
      orderIndex: 1,
      isActive: true,
    },
  });

  await prisma.curriculum.upsert({
    where: { id: "00000000-0000-0000-0000-000000000022" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000022",
      tenantId,
      nameTh: "หลักสูตรพุทธศาสตรมหาบัณฑิต สาขาวิชาปรัชญา (พธ.ม.)",
      nameEn: "Master of Arts in Philosophy (M.A.)",
      degree: "MASTER",
      durationYears: 2,
      descriptionTh: "การศึกษาค้นคว้าเชิงลึกเกี่ยวกับปรัชญาตะวันออกและตะวันตก เปรียบเทียบกับพุทธปรัชญาเพื่อการวิจัยระดับสากล",
      descriptionEn: "Comparative research in Eastern and Western philosophy alongside Buddhist thought.",
      orderIndex: 2,
      isActive: true,
    },
  });
  console.log("[seed-prod] สร้างหลักสูตรการศึกษาเรียบร้อย");

  // 8. สร้างประเภทคำร้อง / หนังสือรับรอง
  await prisma.certificateType.upsert({
    where: { id: "00000000-0000-0000-0000-000000000031" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000031",
      tenantId,
      name: "หนังสือรับรองสถานภาพนิสิต (Certificate of Student Status)",
      description: "เอกสารรับรองการเป็นนิสิตปัจจุบัน สำหรับขอทุนการศึกษา ยื่นสมัครงาน หรือติดต่อหน่วยงานราชการ",
      isActive: true,
    },
  });

  await prisma.certificateType.upsert({
    where: { id: "00000000-0000-0000-0000-000000000032" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000032",
      tenantId,
      name: "ใบรายงานผลการศึกษาอย่างไม่เป็นทางการ (Unofficial Transcript)",
      description: "เอกสารสรุปผลการเรียนและคะแนนสะสม (GPAX) ทุกภาคการศึกษา",
      isActive: true,
    },
  });
  console.log("[seed-prod] สร้างประเภทคำร้องหนังสือรับรองเรียบร้อย");

  // 9. สร้างห้องประชุม
  await prisma.meetingRoom.upsert({
    where: { id: "00000000-0000-0000-0000-000000000041" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000041",
      tenantId,
      name: "ห้องประชุมสมเด็จพระพุฒาจารย์ (ห้อง B201 อาคารเรียนรวม ชั้น 2)",
      capacity: 50,
      equipment: "ระบบจอโปรเจคเตอร์ 4K, ไมโครโฟนไร้สาย 4 ตัว, ระบบ Zoom Rooms ไฮบริด, เครื่องปรับอากาศ",
      isActive: true,
    },
  });

  await prisma.meetingRoom.upsert({
    where: { id: "00000000-0000-0000-0000-000000000042" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000042",
      tenantId,
      name: "ห้องสัมมนาวิชาการพุทธศาสตร์ (ห้อง B305 อาคารเรียนรวม ชั้น 3)",
      capacity: 25,
      equipment: "Smart TV 75 นิ้ว, กล้องประชุมทางไกล, กระดานอัจฉริยะ, WiFi ความเร็วสูง",
      isActive: true,
    },
  });
  console.log("[seed-prod] สร้างห้องประชุมออนไลน์เรียบร้อย");

  console.log("[seed-prod] ✅ นำเข้าข้อมูลตัวอย่างสำหรับทดสอบ Production เสร็จสมบูรณ์แล้ว 100%!");
}

main()
  .catch((e) => {
    console.error("[seed-prod] เกิดข้อผิดพลาด:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
