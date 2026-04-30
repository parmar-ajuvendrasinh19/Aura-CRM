import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { activitySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')
    const taskId = searchParams.get('taskId')
    const dealId = searchParams.get('dealId')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    
    if (clientId) where.clientId = clientId
    if (projectId) where.projectId = projectId
    if (taskId) where.taskId = taskId
    if (dealId) where.dealId = dealId

    const activities = await prisma.activity.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
      },
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json(activities)
  } catch (error: any) {
    console.error('Get activities error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = activitySchema.parse(body)

    const activity = await prisma.activity.create({
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
        userId: user.userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
        deal: { select: { id: true, title: true } },
      },
    })

    return NextResponse.json(activity, { status: 201 })
  } catch (error: any) {
    console.error('Create activity error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
