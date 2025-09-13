import { PrismaClient,UserStatus  } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin", created_by: 0 },
  });
  const userRole = await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: { name: "user", created_by: 0 },
  });
  const cleanerRole = await prisma.role.upsert({
    where: { name: "cleaner" },
    update: {},
    create: { name: "cleaner", created_by: 0 },
  });

  // Departments (ต้องมี @unique ที่ name ใน schema แล้ว)
  const departmentIT = await prisma.department.upsert({
    where: { name: "IT" },
    update: {},
    create: { name: "IT", description: "ฝ่ายไอที", created_by: 0 },
  });
  const departmentHR = await prisma.department.upsert({
    where: { name: "HR" },
    update: {},
    create: { name: "HR", description: "ฝ่ายทรัพยากรบุคคล", created_by: 0 },
  });
  const departmentCleaner = await prisma.department.upsert({
    where: { name: "Cleaner" },
    update: {},
    create: { name: "Cleaner", description: "ฝ่ายทำความสะอาด", created_by: 0 },
  });

  // Hash password
  const hashedPassword = await bcrypt.hash("123456", 10);

  // Users (ต้องมี update:{} ใน upsert)
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@example.com",
      password: hashedPassword,
status: UserStatus.Active,
      employee_code: "EMP001",
      department_id: departmentIT.id,
      role_id: adminRole.id,
      lastLogin: null,
      created_by: 0,
    },
  });

  await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "User",
      email: "user@example.com",
      password: hashedPassword,
    status: UserStatus.Active,
      employee_code: "EMP002",
      department_id: departmentHR.id,
      role_id: userRole.id,
      lastLogin: null,
      created_by: 0,
    },
  });

  await prisma.user.upsert({
    where: { email: "cleaner@example.com" },
    update: {},
    create: {
      name: "Cleaner",
      email: "cleaner@example.com",
      password: hashedPassword,
    status: UserStatus.Active,
      employee_code: "EMP003",
      department_id: departmentCleaner.id,
      role_id: cleanerRole.id,
      lastLogin: null,
      created_by: 0,
    },
  });

  console.log("✅ Seed completed successfully");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
