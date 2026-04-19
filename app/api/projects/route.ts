import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganization, getOrganizationWithUser } from '@/lib/getOrganization'
import { projectSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  console.log('GET /api/projects - Starting request')
  
  try {
    const organizationId = await getOrganization()
    console.log('GET /api/projects - Organization ID:', organizationId)

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const serviceType = searchParams.get('serviceType')
    const clientId = searchParams.get('clientId')

    const where: any = { organizationId }
    
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

    console.log('GET /api/projects - Successfully retrieved', projects.length, 'projects')
    return NextResponse.json(projects)
  } catch (error: any) {
    console.error('GET /api/projects - Error:', error)
    
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
  console.log('POST /api/projects - Starting request')
  
  try {
    const { organizationId, user } = await getOrganizationWithUser()
    console.log('POST /api/projects - Organization ID:', organizationId)

    const body = await request.json()
    console.log('POST /api/projects - Request body:', body)
    
    const validatedData = projectSchema.parse(body)
    console.log('POST /api/projects - Validated data:', validatedData)

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null,
        organizationId,
      },
      include: {
        client: true,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user?.userId || 'system',
        action: "CREATE_PROJECT",
        entityType: "PROJECT",
        entityId: project.id,
        description: `Created new project: ${project.name}`
      }
    })

    console.log('POST /api/projects - Project created successfully:', project.id)
    return NextResponse.json(project, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/projects - Error:', error)
    
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
