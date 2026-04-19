import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL
});
const DUMMY_USER_ID = 'dummy-user-id-1234';

async function run() {
  try {
    console.log("Attempting to create habit...");
    const habit = await prisma.habit.create({
      data: {
        userId: DUMMY_USER_ID,
        name: "Test Habit v7",
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
