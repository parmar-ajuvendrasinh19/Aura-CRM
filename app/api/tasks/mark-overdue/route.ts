import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { taskIds } = body

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'taskIds array is required' }, { status: 400 })
    }

    let count = 0
    for (const taskId of taskIds) {
      await prisma.task.update({
        where: { id: taskId },
        data: { isOverdue: true } as any
      })
      count++
    }

    // Log activity for each marked task
    for (const taskId of taskIds) {
      await prisma.activityLog.create({
        data: {
          userId: user.userId,
          action: "MARK_TASK_OVERDUE",
          entityType: "TASK",
          entityId: taskId,
          description: `Marked task as overdue: ${taskId}`
        }
      })
    }

    return NextResponse.json({ message: 'Tasks marked as overdue', count })
  } catch (error: any) {
    console.error('Mark overdue error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
