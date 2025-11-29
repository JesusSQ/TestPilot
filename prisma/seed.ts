import { PrismaClient, Role, Status } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  const ADMIN_PASSWORD = "Admin123!";
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@testpilot.com" },
    update: {},
    create: {
      email: "admin@testpilot.com",
      password: hashedPassword,
      role: Role.ADMIN,
      status: Status.ACTIVE,
      mustChangePassword: true,
      firstName: "Super",
      lastName: "Admin",
    },
  });

  console.log(
    `Created admin user with id: ${adminUser.id} and password: ${ADMIN_PASSWORD}`
  );
  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error("Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
