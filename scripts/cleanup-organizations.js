const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupOrganizations() {
  console.log('Starting organization cleanup...')

  // Get all organizations
  const organizations = await prisma.organization.findMany()
  console.log(`Found ${organizations.length} organizations`)

  if (organizations.length === 0) {
    console.log('No organizations found. Creating default organization...')
    const defaultOrg = await prisma.organization.create({
      data: {
        name: 'Default Organization',
      },
    })
    console.log(`Created default organization with ID: ${defaultOrg.id}`)
    return
  }

  if (organizations.length === 1) {
    console.log('Only one organization exists. No cleanup needed.')
    console.log(`Organization ID: ${organizations[0].id}, Name: ${organizations[0].name}`)
    return
  }

  // Keep the first organization, reassign all users to it
  const keepOrg = organizations[0]
  const deleteOrgIds = organizations.slice(1).map(org => org.id)

  console.log(`Keeping organization: ${keepOrg.name} (ID: ${keepOrg.id})`)
  console.log(`Will delete ${deleteOrgIds.length} organizations: ${deleteOrgIds.join(', ')}`)

  // Reassign all users from organizations to be deleted to the kept organization
  for (const orgId of deleteOrgIds) {
    const usersToUpdate = await prisma.user.findMany({
      where: { organizationId: orgId },
    })

    if (usersToUpdate.length > 0) {
      console.log(`Reassigning ${usersToUpdate.length} users from org ${orgId} to org ${keepOrg.id}`)
      await prisma.user.updateMany({
        where: { organizationId: orgId },
        data: { organizationId: keepOrg.id },
      })
    }

    // Reassign clients
    const clientsToUpdate = await prisma.client.findMany({
      where: { organizationId: orgId },
    })

    if (clientsToUpdate.length > 0) {
      console.log(`Reassigning ${clientsToUpdate.length} clients from org ${orgId} to org ${keepOrg.id}`)
      await prisma.client.updateMany({
        where: { organizationId: orgId },
        data: { organizationId: keepOrg.id },
      })
    }

    // Reassign projects
    const projectsToUpdate = await prisma.project.findMany({
      where: { organizationId: orgId },
    })

    if (projectsToUpdate.length > 0) {
      console.log(`Reassigning ${projectsToUpdate.length} projects from org ${orgId} to org ${keepOrg.id}`)
      await prisma.project.updateMany({
        where: { organizationId: orgId },
        data: { organizationId: keepOrg.id },
      })
    }

    // Reassign deals
    const dealsToUpdate = await prisma.deal.findMany({
      where: { organizationId: orgId },
    })

    if (dealsToUpdate.length > 0) {
      console.log(`Reassigning ${dealsToUpdate.length} deals from org ${orgId} to org ${keepOrg.id}`)
      await prisma.deal.updateMany({
        where: { organizationId: orgId },
        data: { organizationId: keepOrg.id },
      })
    }

    // Reassign activities
    const activitiesToUpdate = await prisma.activity.findMany({
      where: { organizationId: orgId },
    })

    if (activitiesToUpdate.length > 0) {
      console.log(`Reassigning ${activitiesToUpdate.length} activities from org ${orgId} to org ${keepOrg.id}`)
      await prisma.activity.updateMany({
        where: { organizationId: orgId },
        data: { organizationId: keepOrg.id },
      })
    }

    // Reassign payments
    const paymentsToUpdate = await prisma.payment.findMany({
      where: { organizationId: orgId },
    })

    if (paymentsToUpdate.length > 0) {
      console.log(`Reassigning ${paymentsToUpdate.length} payments from org ${orgId} to org ${keepOrg.id}`)
      await prisma.payment.updateMany({
        where: { organizationId: orgId },
        data: { organizationId: keepOrg.id },
      })
    }
  }

  // Delete the extra organizations
  console.log('Deleting extra organizations...')
  await prisma.organization.deleteMany({
    where: { id: { in: deleteOrgIds } },
  })

  console.log('Cleanup completed successfully!')
  console.log(`Remaining organization: ${keepOrg.name} (ID: ${keepOrg.id})`)

  // Verify cleanup
  const finalOrgs = await prisma.organization.findMany()
  console.log(`Final organization count: ${finalOrgs.length}`)
}

cleanupOrganizations()
  .catch((e) => {
    console.error('Error during cleanup:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
