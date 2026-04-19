import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { taskSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: { organizationId: user.organizationId },
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        activities: {
          include: { user: true },
          orderBy: { date: 'desc' },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error: any) {
    console.error('Get task error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    const task = await prisma.task.updateMany({
      where: {
        id: params.id,
        project: { organizationId: user.organizationId },
      },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
    })

    if (task.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updatedTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: "UPDATE_TASK",
        entityType: "TASK",
        entityId: params.id,
        description: `Updated task: ${updatedTask?.title}`
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error: any) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get task details before deletion for logging
    const taskToDelete = await prisma.task.findUnique({
      where: { id: params.id },
    })

    const task = await prisma.task.deleteMany({
      where: {
        id: params.id,
        project: { organizationId: user.organizationId },
      },
    })

    if (task.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: "DELETE_TASK",
        entityType: "TASK",
        entityId: params.id,
        description: `Deleted task: ${taskToDelete?.title}`
      }
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error: any) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
