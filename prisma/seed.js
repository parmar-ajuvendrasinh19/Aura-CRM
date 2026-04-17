const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create default organization
  const organization = await prisma.organization.upsert({
    where: { email: 'default@agency-crm.com' },
    update: {},
    create: {
      name: 'Default Agency',
      email: 'default@agency-crm.com',
      phone: '+1-555-0100',
      address: '123 Main Street, City, State 12345',
    },
  })

  console.log('Created organization:', organization.name)

  // Create default admin user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@agency-crm.com' },
    update: {},
    create: {
      email: 'admin@agency-crm.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
      organizationId: organization.id,
    },
  })

  console.log('Created user:', user.email)
  console.log('Default login credentials:')
  console.log('Email: admin@agency-crm.com')
  console.log('Password: password123')
  console.log('Organization ID:', organization.id)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
