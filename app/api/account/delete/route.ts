import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

/**
 * DELETE /api/account/delete
 * 
 * Allows a user to delete their own account.
 * Handles related records:
 * - Refresh tokens: deleted
 * - Assigned tasks: unassigned (assigneeId set to null)
 * - Created tasks: deleted (cascade)
 * - Activities: userId set to null
 */

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate current user
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Find user to delete (must be themselves)
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

    // 3. Delete user and related records in transaction
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

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    })

  } catch (error: any) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
