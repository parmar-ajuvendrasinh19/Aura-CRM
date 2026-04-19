import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

/**
 * DELETE /api/admin/users/[id]
 * 
 * Deletes a user and handles related records securely.
 * Only accessible by ADMIN users.
 * 
 * Transaction includes:
 * - Refresh tokens: deleted
 * - Assigned tasks: unassigned (assigneeId set to null)
 * - Created tasks: deleted (cascade)
 * - Activities: userId set to null
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can delete users
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const userId = params.id

    // Prevent self-deletion
    if (userId === currentUser.userId) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    // Find user to delete
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent deleting the last admin
    const adminCount = await prisma.user.count({
      where: { role: 'ADMIN' }
    })

    if (adminCount === 1 && targetUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot delete the last admin in the system' },
        { status: 400 }
      )
    }

    // Log admin action
    console.log(`Admin ${currentUser.email} deleted user: ${targetUser.email} (ID: ${targetUser.id})`)

    // Delete user and related records in transaction
    await prisma.$transaction(async (tx) => {
      // Delete refresh tokens
      await tx.refreshToken.deleteMany({
        where: { userId: targetUser.id }
      })

      // Unassign tasks (set assigneeId to null)
      await tx.task.updateMany({
        where: { assigneeId: targetUser.id },
        data: { assigneeId: null }
      })

      // Delete tasks created by user (cascade)
      await tx.task.deleteMany({
        where: { creatorId: targetUser.id }
      })

      // Update activities (set userId to null)
      await tx.activity.updateMany({
        where: { userId: targetUser.id },
        data: { userId: null }
      })

      // Delete user
      await tx.user.delete({
        where: { id: targetUser.id }
      })
    })

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.email} deleted successfully`,
      deletedUser: {
        id: targetUser.id,
        email: targetUser.email,
        name: targetUser.name,
      },
      affectedRecords: {
        refreshTokens: targetUser._count.refreshTokens,
        unassignedTasks: targetUser._count.assignedTasks,
        deletedTasks: targetUser._count.createdTasks,
        activitiesUpdated: targetUser._count.activities,
      }
    })

  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
