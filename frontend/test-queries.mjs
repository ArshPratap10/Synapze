import { createRequire } from 'module';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const DUMMY_USER_ID = "dummy-user-id-1234";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { id: DUMMY_USER_ID }
    });
    console.log("User ok");

    const habits = await prisma.habit.findMany({
      where: { userId: DUMMY_USER_ID }
    });
    console.log("Habits ok", habits.length);

    const foodLogs = await prisma.foodLog.findMany({
      where: {
        userId: DUMMY_USER_ID,
        loggedAt: { gte: today }
      }
    });
    console.log("Food logs ok");

    const activityLogs = await prisma.activityLog.findMany({
      where: {
        userId: DUMMY_USER_ID,
        loggedAt: { gte: today }
      }
    });
    console.log("Activity logs ok");

    const dailyScore = await prisma.dailyScore.findFirst({
      where: {
        userId: DUMMY_USER_ID,
        date: today
      }
    });
    console.log("Daily score ok");
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  } finally {
    process.exit(0);
  }
}
run();
