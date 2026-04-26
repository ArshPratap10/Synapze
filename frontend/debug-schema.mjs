import prisma from './src/lib/prisma.js';

async function main() {
  try {
    // Try to fetch one user to see which column fails
    const user = await prisma.user.findFirst();
    console.log('User found:', user);
  } catch (e) {
    console.error('Error detail:', JSON.stringify(e, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
