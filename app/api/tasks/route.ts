import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganization, getOrganizationWithUser } from '@/lib/getOrganization'
import { taskSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  console.log('GET /api/tasks - Starting request')
  
  try {
    const { organizationId } = await getOrganizationWithUser()
    console.log('GET /api/tasks - Organization ID:', organizationId)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const projectId = searchParams.get('projectId')
    const assigneeId = searchParams.get('assigneeId')

    const where: any = {
      project: { organizationId },
    }
    
    if (status) where.status = status
    if (projectId) where.projectId = projectId
    if (assigneeId) where.assigneeId = assigneeId

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    })

    console.log('GET /api/tasks - Successfully retrieved', tasks.length, 'tasks')
    return NextResponse.json(tasks)
  } catch (error: any) {
    console.error('GET /api/tasks - Error:', error)
    
    if (error.message.includes('No organization found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/tasks - Starting request')
  
  try {
    const { organizationId, user } = await getOrganizationWithUser()
    console.log('POST /api/tasks - Organization ID:', organizationId, 'User:', user?.userId)

    const body = await request.json()
    console.log('POST /api/tasks - Request body:', body)
    
    const validatedData = taskSchema.parse(body)
    console.log('POST /api/tasks - Validated data:', validatedData)

    // Verify project belongs to organization
    const project = await prisma.project.findFirst({
      where: {
        id: validatedData.projectId,
        organizationId,
      },
    })

    if (!project) {
      console.error('POST /api/tasks - Project not found or does not belong to organization')
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

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
    
    if (error.message.includes('No organization found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
