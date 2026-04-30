import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { taskSchema } from '@/lib/validations'
import { startOfDay, isBefore } from 'date-fns'

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
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true, ownerName: true } },
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
    
    // Build update data from body (partial updates allowed)
    const updateData: any = {}
    
    if (body.title !== undefined) updateData.title = body.title
    if (body.description !== undefined) updateData.description = body.description
    if (body.type !== undefined) updateData.type = body.type
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.status !== undefined) updateData.status = body.status
    if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo
    if (body.clientId !== undefined) updateData.clientId = body.clientId || null
    if (body.projectId !== undefined) updateData.projectId = body.projectId || null
    
    // Handle due date and overdue calculation
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null
      
      // Recalculate overdue status
      if (updateData.dueDate && body.status !== 'COMPLETED') {
        updateData.isOverdue = isBefore(startOfDay(updateData.dueDate), startOfDay(new Date()))
      }
    }
    
    // When marking as completed, clear overdue flag
    if (body.status === 'COMPLETED') {
      updateData.isOverdue = false
    }

    const task = await prisma.task.updateMany({
      where: {
        id: params.id,
      },
      data: updateData,
    })

    if (task.count === 0) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updatedTask = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true, ownerName: true } },
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

    if (!taskToDelete) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: {
        id: params.id,
      },
    })

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
