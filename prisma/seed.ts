import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { seedCore, seedUser } from "./lib/seed-core";
import { requireDatabaseUrl } from "./lib/require-database-url";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requireDatabaseUrl() }) });

/** รหัสผ่านทุกบัญชีตัวอย่าง */
export const DEV_PASSWORD = "Passw0rd!vibe";

async function main() {
  if (process.env.NODE_ENV === "production" && process.env.SEED_ALLOW_PROD !== "1") {
    console.error("[seed] ปฏิเสธ: NODE_ENV=production — ใช้ npm run db:bootstrap แทน");
    process.exit(1);
  }
  const core = await seedCore(prisma, { tenantCode: "DEMO", nameTh: "องค์กรตัวอย่าง", nameEn: "Sample Organization" });
  const hash = await bcrypt.hash(DEV_PASSWORD, 12);
  const users = [
    { email: "admin@app.local", name: "ผู้ดูแลสูงสุด", roles: ["SUPER_ADMIN"] },
    { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
    { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
    { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
    { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
  ];
  for (const u of users) {
    await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
  }

  // สร้างข่าวสารตัวอย่างสำหรับคณะพุทธศาสตร์
  const adminUser = await prisma.user.findUnique({ where: { email: "admin@app.local" } });
  if (adminUser) {
    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: "admission-buddhist-studies-2569" } },
      update: {},
      create: {
        tenantId: core.tenantId,
        authorId: adminUser.id,
        titleTh: "คณะพุทธศาสตร์ เปิดรับสมัครนิสิตใหม่ ระดับปริญญาตรี ประจำปีการศึกษา 2569",
        titleEn: "Faculty of Buddhism Opens Applications for Undergraduate Programs (AY 2026)",
        slug: "admission-buddhist-studies-2569",
        summaryTh: "เปิดรับสมัครผู้สนใจเข้าศึกษาต่อสาขาวิชาพระพุทธศาสนา สาขาวิชาปรัชญา และสาขาวิชาบาลีพุทธศาสตร์ ทุนการศึกษาเต็มจำนวนสำหรับพระภิกษุสามเณร",
        summaryEn: "Admission is open for Bachelor of Arts in Buddhist Studies, Philosophy, and Pali-Buddhist Studies with scholarships.",
        contentTh: "คณะพุทธศาสตร์ มหาวิทยาลัยมหาจุฬาลงกรณราชวิทยาลัย มีความประสงค์เปิดรับสมัครบุคคลเข้าศึกษาในระดับปริญญาตรี (พธ.บ.) ประจำปีการศึกษา 2569\n\nสาขาวิชาที่เปิดรับสมัคร:\n1. สาขาวิชาพระพุทธศาสนา\n2. สาขาวิชาปรัชญา\n3. สาขาวิชาบาลีพุทธศาสตร์\n\nคุณสมบัติผู้สมัคร:\n- พระภิกษุ สามเณร และคฤหัสถ์ผู้สำเร็จการศึกษาระดับมัธยมศึกษาตอนปลาย (ม.6) หรือเทียบเท่า หรือสอบได้เปรียญธรรม ๓ ประโยคขึ้นไป",
        contentEn: "The Faculty of Buddhism invites applications for undergraduate degree programs for the academic year 2026.",
        category: "ACADEMIC",
        status: "PUBLISHED",
        isPinned: true,
        pinOrder: 1,
        publishedAt: new Date(),
        viewCount: 142,
      },
    });

    await prisma.newsArticle.upsert({
      where: { tenantId_slug: { tenantId: core.tenantId, slug: "buddhist-conference-2026" } },
      update: {},
      create: {
        tenantId: core.tenantId,
        authorId: adminUser.id,
        titleTh: "โครงการสัมมนาวิชาการระดับนานาชาติ เรื่อง พุทธปรัชญากับปัญญาประดิษฐ์ในยุคดิจิทัล",
        titleEn: "International Academic Conference: Buddhist Philosophy and AI in the Digital Era",
        slug: "buddhist-conference-2026",
        summaryTh: "ขอเชิญคณาจารย์ นักวิจัย และนิสิต ร่วมฟังการเสวนาและนำเสนอผลงานวิชาการพุทธศาสนาร่วมสมัย",
        summaryEn: "Inviting faculty, researchers, and students to attend the international academic conference.",
        contentTh: "ขอเชิญคณาจารย์ นักวิจัย และนิสิต ร่วมรับฟังการเสวนาและนำเสนอผลงานวิชาการ ในงานสัมมนาวิชาการระดับนานาชาติ เรื่อง พุทธปรัชญากับปัญญาประดิษฐ์ในยุคดิจิทัล\n\nณ ห้องประชุมใหญ่ คณะพุทธศาสตร์",
        contentEn: "Conference on Buddhist Philosophy and AI in the Digital Era.",
        category: "EVENT",
        status: "PUBLISHED",
        isPinned: false,
        publishedAt: new Date(),
        viewCount: 88,
      },
    });

    // Seed Certificates
    const certType1 = await prisma.certificateType.create({
      data: {
        tenantId: core.tenantId,
        name: "หนังสือรับรองสภาพนิสิต",
        description: "รับรองสถานะการเป็นนิสิตปัจจุบัน สำหรับใช้ติดต่อหน่วยงานราชการหรือขอทุนการศึกษา",
        isActive: true,
      }
    });

    const certType2 = await prisma.certificateType.create({
      data: {
        tenantId: core.tenantId,
        name: "ใบรายงานผลการศึกษา (Transcript)",
        description: "ใบแสดงผลการศึกษาอย่างไม่เป็นทางการ",
        isActive: true,
      }
    });

    const viewerUser = await prisma.user.findUnique({ where: { email: "viewer@app.local" } });
    if (viewerUser) {
      await prisma.certificateRequest.create({
        data: {
          tenantId: core.tenantId,
          userId: viewerUser.id,
          certificateTypeId: certType1.id,
          status: "PENDING",
          note: "นำไปขอทุนการศึกษาครับ",
        }
      });
      await prisma.certificateRequest.create({
        data: {
          tenantId: core.tenantId,
          userId: viewerUser.id,
          certificateTypeId: certType2.id,
          status: "APPROVED",
          issuedDocumentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        }
      });
    }
    // Seed Personnel
    const dept1 = await prisma.department.create({
      data: {
        tenantId: core.tenantId,
        nameTh: "ภาควิชาพระพุทธศาสนา",
        nameEn: "Department of Buddhist Studies",
        orderIndex: 1,
      }
    });

    const dept2 = await prisma.department.create({
      data: {
        tenantId: core.tenantId,
        nameTh: "ภาควิชาปรัชญา",
        nameEn: "Department of Philosophy",
        orderIndex: 2,
      }
    });

    await prisma.personnel.create({
      data: {
        tenantId: core.tenantId,
        departmentId: dept1.id,
        firstNameTh: "พระมหาบุญชู",
        lastNameTh: "ญาณวิโรจน์",
        positionTh: "คณบดีคณะพุทธศาสตร์",
        type: "EXECUTIVE",
        email: "boonchoo@app.local",
        phoneNumber: "02-123-4567",
        orderIndex: 1,
      }
    });

    await prisma.personnel.create({
      data: {
        tenantId: core.tenantId,
        departmentId: dept1.id,
        firstNameTh: "สมชาย",
        lastNameTh: "ใจดี",
        positionTh: "อาจารย์ประจำภาควิชา",
        type: "ACADEMIC",
        email: "somchai@app.local",
        orderIndex: 2,
      }
    });

    await prisma.personnel.create({
      data: {
        tenantId: core.tenantId,
        departmentId: dept2.id,
        firstNameTh: "สมหญิง",
        lastNameTh: "รักดี",
        positionTh: "อาจารย์ประจำภาควิชา",
        type: "ACADEMIC",
        email: "somying@app.local",
        orderIndex: 1,
      }
    });
    // Seed Curriculum
    await prisma.curriculum.create({
      data: {
        tenantId: core.tenantId,
        nameTh: "พุทธศาสตรบัณฑิต สาขาวิชาพระพุทธศาสนา",
        nameEn: "Bachelor of Arts in Buddhist Studies",
        degree: "BACHELOR",
        durationYears: 4,
        descriptionTh: "ศึกษาหลักธรรมคำสอนในพระพุทธศาสนา ประวัติศาสตร์ และการประยุกต์ใช้ในสังคมปัจจุบัน",
        orderIndex: 1,
      }
    });

    await prisma.curriculum.create({
      data: {
        tenantId: core.tenantId,
        nameTh: "พุทธศาสตรมหาบัณฑิต สาขาวิชาปรัชญา",
        nameEn: "Master of Arts in Philosophy",
        degree: "MASTER",
        durationYears: 2,
        descriptionTh: "ศึกษาและวิจัยเชิงลึกในปรัชญาตะวันออกและตะวันตก",
        orderIndex: 2,
      }
    });
    // Seed Administration
    await prisma.adminDocument.create({
      data: {
        tenantId: core.tenantId,
        title: "คู่มือการปฏิบัติงานสำหรับบุคลากรใหม่",
        description: "อธิบายโครงสร้าง สวัสดิการ และการทำงานเบื้องต้น",
        fileUrl: "https://example.com/docs/manual-new-staff.pdf",
        category: "MANUAL",
        visibility: "INTERNAL",
      }
    });

    await prisma.adminDocument.create({
      data: {
        tenantId: core.tenantId,
        title: "แบบฟอร์มขอลาพักผ่อน",
        description: "แบบฟอร์มสำหรับยื่นขอลาพักผ่อนประจำปี",
        fileUrl: "https://example.com/docs/leave-form.pdf",
        category: "FORM",
        visibility: "PUBLIC",
      }
    });
    // Seed Meetings
    const room1 = await prisma.meetingRoom.create({
      data: {
        tenantId: core.tenantId,
        name: "ห้องประชุม 1 (พุทธปัญญา)",
        capacity: 30,
        equipment: "Projector, Whiteboard, Mic",
      }
    });

    await prisma.meetingRoom.create({
      data: {
        tenantId: core.tenantId,
        name: "ห้องประชุม 2 (สัมมาทิฏฐิ)",
        capacity: 10,
        equipment: "Smart TV, Video Conference",
      }
    });

    await prisma.meetingBooking.create({
      data: {
        tenantId: core.tenantId,
        roomId: room1.id,
        requesterId: adminUser!.id,
        title: "ประชุมอาจารย์ประจำภาควิชา",
        startTime: new Date(Date.now() + 86400000), // Tomorrow
        endTime: new Date(Date.now() + 86400000 + 7200000), // +2 hours
        status: "APPROVED",
        remark: "ขอเตรียมน้ำดื่ม 30 ขวด",
      }
    });
    // Seed Attendance
    const attClass = await prisma.attendanceClass.create({
      data: {
        tenantId: core.tenantId,
        courseCode: "BUD101",
        courseName: "พุทธประวัติและวรรณกรรมทางพระพุทธศาสนา",
        term: "1/2569",
        instructorId: adminUser!.id,
      }
    });

    const session1 = await prisma.attendanceSession.create({
      data: {
        tenantId: core.tenantId,
        classId: attClass.id,
        date: new Date(Date.now() - 86400000), // Yesterday
        topic: "แนะนำรายวิชาและปฐมนิเทศ",
      }
    });

    await prisma.attendanceRecord.create({
      data: {
        tenantId: core.tenantId,
        sessionId: session1.id,
        studentCode: "660001",
        studentName: "นาย สมชาย ใจดี",
        status: "PRESENT",
      }
    });
    // Seed Events
    const evt = await prisma.event.create({
      data: {
        tenantId: core.tenantId,
        title: "ค่ายพุทธธรรมนำชีวิต",
        description: "กิจกรรมเข้าค่ายปฏิบัติธรรม 3 วัน 2 คืน สำหรับนิสิตใหม่",
        location: "วัดมหาธาตุ",
        startDate: new Date(Date.now() + 86400000 * 7), // Next week
        endDate: new Date(Date.now() + 86400000 * 9),
        capacity: 50,
      }
    });

    await prisma.eventRegistration.create({
      data: {
        tenantId: core.tenantId,
        eventId: evt.id,
        studentCode: "660001",
        studentName: "นาย สมชาย ใจดี",
        status: "REGISTERED",
      }
    });
  }

  console.log(`[seed] เสร็จ — login: admin@app.local / ${DEV_PASSWORD}`);
}

main().finally(() => prisma.$disconnect());
