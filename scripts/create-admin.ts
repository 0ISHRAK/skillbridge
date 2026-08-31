import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.argv[2] || "admin@skillbridge.com";
  const password = process.argv[3] || "admin123";
  const name = process.argv[4] || "Admin";

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "admin", isEmailVerified: true },
    });
    console.log(`✅ Updated existing user "${email}" to admin role.`);
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "admin",
        isEmailVerified: true,
        tokenBalance: 9999,
      },
    });
    console.log(`✅ Created admin user: ${email} (password: ${password})`);
  }

  console.log(`\n   Login at: http://localhost:3000/auth?mode=login`);
  console.log(`   Admin panel: http://localhost:3000/admin\n`);
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
