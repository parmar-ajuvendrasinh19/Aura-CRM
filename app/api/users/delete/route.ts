import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

/**
 * DELETE /api/users/delete
 * Body: { email?: string, id?: string }
 * 
 * Deletes a user and handles related records:
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

    // Only admins can delete users
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // 2. Parse request body
    const body = await request.json()
    const { email, id } = body

    if (!email && !id) {
      return NextResponse.json(
        { error: 'Bad Request - Provide email or id' },
        { status: 400 }
      )
    }

    // 3. Find user to delete
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

    // Prevent self-deletion
    if (targetUser.id === currentUser.userId) {
      return NextResponse.json(
        { error: 'Cannot delete yourself' },
        { status: 400 }
      )
    }

    // 4. Delete user and related records in transaction
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
