const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const pg = require('pg')
require('dotenv').config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding dummy user...')

  const user = await prisma.user.upsert({
    where: { email: 'dummy@projectaura.com' },
    update: {},
    create: {
      id: 'dummy-user-id-1234',
      email: 'dummy@projectaura.com',
      name: 'Test Testerson',
      goal: 'Be Fit',
      height: 175,
      weight: 70
    },
  })

  // Create some initial habits so the dashboard isn't completely empty
  await prisma.habit.upsert({
    where: { id: 'dummy-habit-1' },
    update: {},
    create: {
      id: 'dummy-habit-1',
      userId: user.id,
      name: 'Drink 2L Water',
      frequency: 'daily'
    }
  })

  console.log('Database seeded successfully!')
  console.log('Created user:', user)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
