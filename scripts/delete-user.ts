/**
 * Standalone script to delete a user from the database
 * Run with: npx ts-node scripts/delete-user.ts
 */

import { prisma } from '../lib/prisma'

const TARGET_EMAIL = 'parmarajuvendrasinh@gmail.com'

async function deleteUser() {
  try {
    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: TARGET_EMAIL },
      include: {
        _count: {
          select: {
            refreshTokens: true,
            assignedTasks: true,
            createdTasks: true,
            activities: true,
          }
        }
      }
    })

    if (!user) {
      console.log(`❌ User not found: ${TARGET_EMAIL}`)
      process.exit(1)
    }

    console.log(`\n👤 Found user:`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Name: ${user.name}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Organization: ${user.organizationId}`)
    console.log(`\n📊 Related records:`)
    console.log(`   Refresh Tokens: ${user._count.refreshTokens}`)
    console.log(`   Assigned Tasks: ${user._count.assignedTasks}`)
    console.log(`   Created Tasks: ${user._count.createdTasks} (will be deleted)`)
    console.log(`   Activities: ${user._count.activities}`)

    // 2. Handle created tasks - reassign to admin or delete
    const createdTasks = await prisma.task.findMany({
      where: { creatorId: user.id },
      select: { id: true, title: true }
    })

    if (createdTasks.length > 0) {
      console.log(`\n⚠️  User created ${createdTasks.length} task(s) that will be deleted:`)
      createdTasks.forEach(t => console.log(`   - ${t.title} (${t.id})`))
    }

    // 3. Delete in transaction
    console.log(`\n🗑️  Deleting user...`)
    
    await prisma.$transaction(async (tx) => {
      // Delete refresh tokens
      const deletedTokens = await tx.refreshToken.deleteMany({
        where: { userId: user.id }
      })
      console.log(`   ✓ Deleted ${deletedTokens.count} refresh tokens`)

      // Assigned tasks will have assigneeId set to null (SetNull behavior)
      const updatedAssignedTasks = await tx.task.updateMany({
        where: { assigneeId: user.id },
        data: { assigneeId: null }
      })
      console.log(`   ✓ Unassigned ${updatedAssignedTasks.count} tasks`)

      // Delete tasks created by user (Cascade behavior)
      const deletedTasks = await tx.task.deleteMany({
        where: { creatorId: user.id }
      })
      console.log(`   ✓ Deleted ${deletedTasks.count} tasks created by user`)

      // Activities will have userId set to null (SetNull behavior)
      const updatedActivities = await tx.activity.updateMany({
        where: { userId: user.id },
        data: { userId: null }
      })
      console.log(`   ✓ Updated ${updatedActivities.count} activities`)

      // Finally delete user
      await tx.user.delete({
        where: { id: user.id }
      })
      console.log(`   ✓ Deleted user`)
    })

    console.log(`\n✅ Successfully deleted user: ${TARGET_EMAIL}`)

  } catch (error) {
    console.error('\n❌ Error deleting user:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run if executed directly
if (require.main === module) {
  deleteUser()
}

export { deleteUser }
