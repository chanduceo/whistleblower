import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Admin
  const adminPwd = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@city.gov" },
    update: {},
    create: { email: "admin@city.gov", passwordHash: adminPwd, name: "Admin", role: Role.ADMIN },
  });

  // ACO (top level)
  const acoPwd = await bcrypt.hash("Aco@123", 10);
  const aco = await prisma.user.upsert({
    where: { email: "aco@city.gov" },
    update: {},
    create: { email: "aco@city.gov", passwordHash: acoPwd, name: "ACO", role: Role.ACO },
  });

  // Official (Supervisor)
  const supPwd = await bcrypt.hash("Supervisor@123", 10);
  const sup = await prisma.user.upsert({
    where: { email: "supervisor@city.gov" },
    update: {},
    create: { email: "supervisor@city.gov", passwordHash: supPwd, name: "Supervisor", role: Role.OFFICIAL, reportsToId: aco.id },
  });

  // Accused person’s direct reports (employees)
  const empPwd = await bcrypt.hash("User@123", 10);
  await prisma.user.upsert({
    where: { email: "employee1@city.gov" },
    update: {},
    create: { email: "employee1@city.gov", passwordHash: empPwd, name: "Employee One", role: Role.USER, reportsToId: sup.id },
  });

  console.log({ admin, aco, sup });
}

main().finally(() => prisma.$disconnect());