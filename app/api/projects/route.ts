import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { projectSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    const clientId = searchParams.get('clientId')

    const where: any = { organizationId: user.organizationId }
    
    if (status) where.status = status
    if (serviceType) where.serviceType = serviceType
    if (clientId) where.clientId = clientId

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        tasks: {
          select: { id: true, status: true },
        },
        _count: {
          select: {
            tasks: true,
            payments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('Get projects error:', error)
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
    const validatedData = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        organizationId: user.organizationId,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
