import prisma from './src/lib/prisma.js';

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log(`Total users in DB: ${userCount}`);
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Sample users:', JSON.stringify(users, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
