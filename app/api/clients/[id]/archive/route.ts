export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

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
    const { isArchived } = body

    if (typeof isArchived !== 'boolean') {
      return NextResponse.json({ error: 'isArchived must be a boolean' }, { status: 400 })
    }

    const client = await prisma.client.updateMany({
      where: {
        id: params.id,
      },
      data: {
        isArchived,
      },
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
        action: isArchived ? "ARCHIVE_CLIENT" : "UNARCHIVE_CLIENT",
        entityType: "CLIENT",
        entityId: params.id,
        description: `${isArchived ? 'Archived' : 'Unarchived'} client: ${updatedClient?.companyName}`
      }
    })

    return NextResponse.json(updatedClient)
  } catch (error: any) {
    console.error('Archive client error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
