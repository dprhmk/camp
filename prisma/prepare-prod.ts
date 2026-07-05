/**
 * Production preparation: wipe ALL data except the super-admin account,
 * create a fresh empty camp and pre-generate a pool of QR codes for printing.
 *
 * Run with `npm run db:prepare`. ⚠️ Destructive — deletes every camp, squad,
 * member, schedule entry, pool code and every non-super-admin account in the
 * database that DATABASE_URL points to.
 */
import { PrismaClient } from "@prisma/client";
import { generateCode } from "../src/lib/member-utils";

const KEEP_ADMIN_EMAIL = "admin@camp.local";
const CAMP_NAME = "Табір 2026";
const CAMP_YEAR = 2026;
const POOL_SIZE = 65;

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: KEEP_ADMIN_EMAIL } });
  if (!admin) {
    throw new Error(`Super-admin ${KEEP_ADMIN_EMAIL} not found — aborting, nobody could log in.`);
  }

  console.log("Wiping data…");
  // Camps cascade to squads, members, schedule entries and pool codes.
  await prisma.camp.deleteMany();
  const removedUsers = await prisma.user.deleteMany({
    where: { email: { not: KEEP_ADMIN_EMAIL } },
  });
  console.log(`Removed ${removedUsers.count} accounts, kept ${KEEP_ADMIN_EMAIL}.`);

  const camp = await prisma.camp.create({
    data: { name: CAMP_NAME, year: CAMP_YEAR },
  });

  const codes = new Set<string>();
  while (codes.size < POOL_SIZE) codes.add(generateCode());
  await prisma.poolCode.createMany({
    data: [...codes].map((code) => ({ campId: camp.id, code })),
  });

  console.log(`Created camp "${camp.name}" with ${POOL_SIZE} pool codes. Ready to print at /qr-codes.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
