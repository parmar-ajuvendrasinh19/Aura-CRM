import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
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
        organizationId: user.organizationId,
      },
      include: {
        projects: {
          include: {
            tasks: true,
            payments: true,
          },
        },
        deals: true,
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
    const validatedData = clientSchema.parse(body)

    const client = await prisma.client.updateMany({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
      data: validatedData,
    })

    if (client.count === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    const updatedClient = await prisma.client.findUnique({
      where: { id: params.id },
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

    const client = await prisma.client.deleteMany({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    })

    if (client.count === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Client deleted successfully' })
  } catch (error: any) {
    console.error('Delete client error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
