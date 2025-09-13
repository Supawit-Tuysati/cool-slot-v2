import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ✅ Roles (unique by name)
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

  const department = await prisma.department.upsert({
    where: { name: "IT" },
    update: {},
    create: { name: "IT", description: "ฝ่ายไอที", created_by: 0 },
  });

  // ✅ Hash password (ใช้ bcrypt)/*  */
  const hashedPassword = await bcrypt.hash("123456", 10);

  // ✅ User admin
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {}, // ถ้าอยากรีเซ็ตรหัสทุกครั้ง ใส่: { password: hashedPassword }
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword, // <<<<< hash แล้ว
      employee_code: "EMP001",
      department_id: department.id,
      role_id: adminRole.id,
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
