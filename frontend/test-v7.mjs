import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DUMMY_USER_ID = 'dummy-user-id-1234';

async function run() {
  try {
    console.log("Attempting to create habit with PRISMA 7 ADAPTER...");
    const habit = await prisma.habit.create({
      data: {
        userId: DUMMY_USER_ID,
        name: "Test Habit Prisma 7",
        frequency: "daily"
      }
    });
    console.log("✅ Habit created:", habit.id);
  } catch (err) {
    console.error("❌ Failed:", err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

run();
