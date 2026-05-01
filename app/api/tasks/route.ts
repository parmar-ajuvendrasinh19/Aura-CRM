import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { taskSchema } from '@/lib/validations'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  console.log('GET /api/tasks - Starting request')
  
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const priority = searchParams.get('priority')
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')
    const clientId = searchParams.get('clientId')
    const section = searchParams.get('section')
    const isCompleted = searchParams.get('isCompleted')
    const overdue = searchParams.get('overdue')

    const where: any = {}
    
    if (status) where.status = status
    if (type) where.type = type
    if (priority) where.priority = priority
    if (projectId) where.projectId = projectId
    if (assigneeId) where.assigneeId = assigneeId
    if (clientId) where.clientId = clientId
    if (isCompleted !== null) where.isCompleted = isCompleted === 'true'

    // Handle section-based filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (section === 'today') {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      where.dueDate = {
        gte: today,
        lt: tomorrow,
      }
      where.isCompleted = false
    } else if (section === 'upcoming') {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      where.dueDate = {
        gte: tomorrow,
      }
      where.isCompleted = false
    } else if (section === 'overdue') {
      where.dueDate = {
        lt: today,
      }
      where.isCompleted = false
    } else if (section === 'completed') {
      where.isCompleted = true
    }

    // Handle overdue query param
    if (overdue === 'true') {
      where.dueDate = {
        lt: today,
      }
      where.isCompleted = false
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true } },
      },
      orderBy: { dueDate: 'asc' },
    })

    // Add isOverdue computed field and assignedUser alias
    const tasksWithOverdue = tasks.map(task => ({
      ...task,
      assignedUser: task.assignee,
      isOverdue: task.dueDate && new Date(task.dueDate) < today && !task.isCompleted,
    }))

    console.log('GET /api/tasks - Successfully retrieved', tasksWithOverdue.length, 'tasks')
    return NextResponse.json(tasksWithOverdue)
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

    const body = await request.json()
    console.log('POST /api/tasks - Request body:', body)
    
    const validatedData = taskSchema.parse(body)
    console.log('POST /api/tasks - Validated data:', validatedData)

    const task = await prisma.task.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        creatorId: user?.userId || 'system',
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
        client: { select: { id: true, companyName: true } },
      },
    })

    console.log('POST /api/tasks - Task created successfully:', task.id)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user?.userId || 'system',
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
