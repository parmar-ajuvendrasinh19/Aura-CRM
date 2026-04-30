import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { taskSchema } from '@/lib/validations'
import { startOfDay, isBefore } from 'date-fns'

// Helper to check and update overdue tasks
async function updateOverdueTasks() {
  const today = startOfDay(new Date())
  
  await prisma.task.updateMany({
    where: {
      status: 'PENDING',
      dueDate: {
        lt: today,
      },
      isOverdue: false,
    },
    data: {
      isOverdue: true,
    },
  })
}

export async function GET(request: NextRequest) {
  console.log('GET /api/tasks - Starting request')
  
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')
    const section = searchParams.get('section') // today, upcoming, overdue, completed

    // Update overdue status before fetching
    await updateOverdueTasks()

    const where: any = {}
    
    if (status) where.status = status
    if (type) where.type = type
    if (priority) where.priority = priority
    if (assignedTo) where.assignedTo = assignedTo
    if (clientId) where.clientId = clientId
    if (projectId) where.projectId = projectId

    // Handle section-based filtering
    const today = startOfDay(new Date())
    if (section === 'today') {
      where.dueDate = {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      }
      where.status = 'PENDING'
    } else if (section === 'upcoming') {
      where.dueDate = {
        gte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      }
      where.status = 'PENDING'
    } else if (section === 'overdue') {
      where.isOverdue = true
      where.status = 'PENDING'
    } else if (section === 'completed') {
      where.status = 'COMPLETED'
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true, ownerName: true } },
      },
      orderBy: [
        { priority: 'asc' },
        { dueDate: 'asc' },
      ],
    })

    console.log('GET /api/tasks - Successfully retrieved', tasks.length, 'tasks')
    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error('GET /api/tasks - Error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/tasks - Starting request')
  
  try {
    const user = await getCurrentUser()
    console.log('POST /api/tasks - User:', user?.userId)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('POST /api/tasks - Request body:', body)
    
    const validatedData = taskSchema.parse(body)
    console.log('POST /api/tasks - Validated data:', validatedData)

    // Check if task will be overdue
    let isOverdue = false
    if (validatedData.dueDate) {
      const dueDate = new Date(validatedData.dueDate)
      isOverdue = isBefore(startOfDay(dueDate), startOfDay(new Date()))
    }

    const task = await prisma.task.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        type: validatedData.type,
        priority: validatedData.priority,
        status: validatedData.status,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        isOverdue,
        assignedTo: validatedData.assignedTo,
        clientId: validatedData.clientId || null,
        projectId: validatedData.projectId || null,
        creatorId: user.userId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedUser: { select: { id: true, name: true, email: true, avatar: true } },
        creator: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true, ownerName: true } },
      },
    })

    console.log('POST /api/tasks - Task created successfully:', task.id)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: "CREATE_TASK",
        entityType: "TASK",
        entityId: task.id,
        description: `Created new task: ${task.title}`
      }
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/tasks - Error:', error)
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
