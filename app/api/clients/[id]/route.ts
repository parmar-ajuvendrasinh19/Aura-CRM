import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { clientSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
      },
      include: {
        projects: {
          include: {
            tasks: true,
            payments: true,
          },
        },
        activities: {
          include: { user: true },
          orderBy: { date: 'desc' },
        },
        payments: true,
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error: any) {
    console.error('Get client error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = clientSchema.parse(body)

    const client = await prisma.client.updateMany({
      where: {
        id: params.id,
      },
      data: validatedData,
    })

    if (client.count === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const updatedClient = await prisma.client.findUnique({
      where: { id: params.id },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: "UPDATE_CLIENT",
        entityType: "CLIENT",
        entityId: params.id,
        description: `Updated client: ${updatedClient?.companyName}`
      }
    })

    return NextResponse.json(updatedClient)
  } catch (error: any) {
    console.error('Update client error:', error)
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

    // Get client details before deletion for logging
    const clientToDelete = await prisma.client.findUnique({
      where: { id: params.id },
    })

    const client = await prisma.client.deleteMany({
      where: {
        id: params.id,
      },
    })

    if (client.count === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.userId,
        action: "DELETE_CLIENT",
        entityType: "CLIENT",
        entityId: params.id,
        description: `Deleted client: ${clientToDelete?.companyName}`
      }
    })

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error: any) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
