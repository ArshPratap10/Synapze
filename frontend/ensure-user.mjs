import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DUMMY_USER_ID = "dummy-user-id-1234";

async function run() {
    try {
        console.log("Checking if user exists...");
        let user = await prisma.user.findUnique({ where: { id: DUMMY_USER_ID } });
        
        if (!user) {
            console.log("User not found. Creating dummy user...");
            user = await prisma.user.create({
                data: {
                    id: DUMMY_USER_ID,
                    name: "Aura Explorer",
                    goal: "Optimal Health",
                    height: 180,
                    weight: 75
                }
            });
            console.log("✅ Dummy user created.");
        } else {
            console.log("✅ User exists.");
        }
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

run();
