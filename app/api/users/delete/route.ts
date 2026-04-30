import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

/**
 * DELETE /api/users/delete
 * Body: { email?: string, id?: string } (for admin deletion)
 * Body: {} (for self-deletion, no params needed)
 * 
 * Deletes a user and handles related records:
 * - Refresh tokens: deleted
 * - Assigned tasks: unassigned (assigneeId set to null)
 * - Created tasks: deleted (cascade)
 * - Activities: userId set to null
 * 
 * Supports:
 * - Admin deleting other users (provide email or id)
 * - User deleting their own account (no params needed)
 */

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate current user
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { email, id } = body

    // Determine if this is self-deletion or admin deletion
    const isSelfDeletion = !email && !id

    if (isSelfDeletion) {
      // Self-deletion: any authenticated user can delete their own account
      const targetUser = await prisma.user.findUnique({
        where: { id: currentUser.userId },
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

      // Perform self-deletion
      await deleteUserAndRelatedRecords(targetUser)

      return NextResponse.json({
        success: true,
        message: 'Account deleted successfully',
      })
    } else {
      // Admin deletion: only admins can delete other users
      if (currentUser.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
      }

      if (!email && !id) {
        return NextResponse.json(
          { error: 'Bad Request - Provide email or id' },
          { status: 400 }
        )
      }

      // Find user to delete
      const whereClause = email ? { email } : { id }
      
      const targetUser = await prisma.user.findUnique({
        where: whereClause,
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

      // Prevent self-deletion via admin endpoint
      if (targetUser.id === currentUser.userId) {
        return NextResponse.json(
          { error: 'Cannot delete yourself through admin endpoint' },
          { status: 400 }
        )
      }

      // Perform admin deletion
      await deleteUserAndRelatedRecords(targetUser)

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
    }
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function deleteUserAndRelatedRecords(targetUser: any) {
  await prisma.$transaction(async (tx) => {
    // Delete refresh tokens
    await tx.refreshToken.deleteMany({
      where: { userId: targetUser.id }
    })

    // Unassign tasks
    await tx.task.updateMany({
      where: { assigneeId: targetUser.id },
      data: { assigneeId: null }
    })

    // Delete tasks created by user
    await tx.task.deleteMany({
      where: { creatorId: targetUser.id }
    })

    // Update activities
    await tx.activity.updateMany({
      where: { userId: targetUser.id },
      data: { userId: null }
    })

    // Delete user
    await tx.user.delete({
      where: { id: targetUser.id }
    })
  })
}
