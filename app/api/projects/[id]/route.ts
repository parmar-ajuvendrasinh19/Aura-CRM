export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { projectSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: params.id,
      },
      include: {
        client: true,
        tasks: {
          include: {
            assignee: true,
            creator: true,
          },
          orderBy: { dueDate: 'asc' },
        },
        activities: {
          include: { user: true },
          orderBy: { date: 'desc' },
        },
        payments: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error: any) {
    console.error('Get project error:', error)
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
    const validatedData = projectSchema.parse(body)

    const project = await prisma.project.updateMany({
      where: {
        id: params.id,
      },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
      },
    })

    if (project.count === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const updatedProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: { client: true },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: "UPDATE_PROJECT",
        entityType: "PROJECT",
        entityId: params.id,
        description: `Updated project: ${updatedProject?.name}`
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error: any) {
    console.error('Update project error:', error)
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

    // Get project details before deletion for logging
    const projectToDelete = await prisma.project.findUnique({
      where: { id: params.id },
    })

    const project = await prisma.project.deleteMany({
      where: {
        id: params.id,
      },
    })

    if (project.count === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: "DELETE_PROJECT",
        entityType: "PROJECT",
        entityId: params.id,
        description: `Deleted project: ${projectToDelete?.name}`
      }
    })

    return NextResponse.json({ message: 'Project deleted successfully' })
  } catch (error: any) {
    console.error('Delete project error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
