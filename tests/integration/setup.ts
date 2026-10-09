import { config } from "dotenv";
import { beforeEach, afterAll } from "vitest";
config({ path: ".env" });
// process.env.NODE_ENV เป็น readonly ตามชนิดที่ Next.js ประกาศไว้ — ใช้ Object.assign แทนการเซ็ตตรง ๆ
Object.assign(process.env, { NODE_ENV: "test" });
if (!process.env.DATABASE_URL) throw new Error("ต้องมี DATABASE_URL ใน .env สำหรับ integration test (createdb ums_dev)");
if (!process.env.AUTH_SECRET) process.env.AUTH_SECRET = "integration-test-secret-32-bytes!!";
process.env.APP_URL ??= "http://localhost:3010";

const { prisma } = await import("@/shared/lib/infra/prisma");

/** ล้างทุกตารางก่อนแต่ละเทสต์ — แต่ละเทสต์ seed เองเท่าที่ต้องใช้ */
export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "audit_logs","login_throttles","auth_tokens","role_permissions","user_roles","roles","user_tenants","users","permissions","tenants" RESTART IDENTITY CASCADE',
  );
}

beforeEach(async () => { await resetDb(); });
afterAll(async () => {
  try {
    const { seedCore, seedUser } = await import("../../prisma/lib/seed-core");
    const core = await seedCore(prisma, {
      tenantCode: "MCU",
      nameTh: "คณะพุทธศาสตร์",
      nameEn: "Faculty of Buddhism",
      logoUrl: "/uploads/mcu-logo.png",
    });
    await seedCore(prisma, {
      tenantCode: "DEMO",
      nameTh: "คณะพุทธศาสตร์ (Demo)",
      nameEn: "Faculty of Buddhism (Demo)",
      logoUrl: "/uploads/mcu-logo.png",
    });
    const bcrypt = (await import("bcryptjs")).default;
    const hash = await bcrypt.hash("Passw0rd!vibe", 12);
    const users = [
      { email: "admin@buddhist.mcu.ac.th", name: "ผู้ดูแลระบบ คณะพุทธศาสตร์", roles: ["SUPER_ADMIN"] },
      { email: "admin@app.local", name: "ผู้ดูแลสูงสุด (Local Dev)", roles: ["SUPER_ADMIN"] },
      { email: "staff@buddhist.mcu.ac.th", name: "เจ้าหน้าที่บริหารงานทั่วไป", roles: ["STAFF"] },
      { email: "staff@app.local", name: "เจ้าหน้าที่", roles: ["STAFF"] },
      { email: "student@buddhist.mcu.ac.th", name: "พระมหาธีรภัทร นิสิตชั้นปีที่ 3", roles: ["VIEWER"] },
      { email: "viewer@app.local", name: "ผู้ดู", roles: ["VIEWER"] },
      { email: "lockme@app.local", name: "บัญชีทดสอบล็อก", roles: ["VIEWER"] },
      { email: "forced@app.local", name: "บัญชีบังคับเปลี่ยนรหัส", roles: ["VIEWER"], mustChangePassword: true },
    ];
    for (const u of users) {
      await seedUser(prisma, core.tenantId, { ...u, passwordHash: hash, roleIds: u.roles.map((c) => core.roleIds[c]) });
    }
  } catch (err) {
    console.error("Failed to re-seed after integration tests:", err);
  } finally {
    await prisma.$disconnect();
  }
});
