import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
const prisma = new PrismaClient();
async function main() {
  await prisma.loginThrottle.deleteMany();
  console.log("Cleared loginThrottle!");
}
main().finally(() => prisma.$disconnect());
