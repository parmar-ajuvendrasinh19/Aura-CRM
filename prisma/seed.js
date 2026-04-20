const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create default admin user
  const hashedPassword = await bcrypt.hash('ajjurutansh1115', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'webauraelevating@gmail.com' },
    update: {},
    create: {
      email: 'webauraelevating@gmail.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })

  console.log('Created user:', user.email)
  console.log('Default login credentials:')
  console.log('Email: webauraelevating@gmail.com')
  console.log('Password: ajjurutansh1115')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
