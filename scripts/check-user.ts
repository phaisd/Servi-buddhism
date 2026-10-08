import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "admin@app.local" } });
  console.log("isActive:", user?.isActive);
}
main().finally(() => prisma.$disconnect());
