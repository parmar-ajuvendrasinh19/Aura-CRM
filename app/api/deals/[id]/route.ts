import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { dealSchema } from '@/lib/validations'

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
    const validatedData = dealSchema.parse(body)

    // Get current deal
    const currentDeal = await prisma.deal.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    })

    if (!currentDeal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    // Auto-convert to project when stage changes to WON
    if (validatedData.stage === 'WON' && currentDeal.stage !== 'WON') {
      const project = await prisma.project.create({
        data: {
          name: currentDeal.title,
          description: currentDeal.description,
          value: currentDeal.value,
          organizationId: user.organizationId,
          clientId: currentDeal.clientId,
          dealId: currentDeal.id,
          status: 'ACTIVE',
          serviceType: 'OTHER',
        },
      })

      // Update deal with project reference
      await prisma.deal.update({
        where: { id: params.id },
        data: { projectId: project.id },
      })

      // Log activity
      await prisma.activity.create({
        data: {
          type: 'STATUS_CHANGE',
          title: `Deal won and converted to project: ${currentDeal.title}`,
          organizationId: user.organizationId,
          userId: user.userId,
          dealId: params.id,
          projectId: project.id,
        },
      })
    }

    const deal = await prisma.deal.updateMany({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
      data: {
        ...validatedData,
        expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : undefined,
      },
    })

    if (deal.count === 0) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    const updatedDeal = await prisma.deal.findUnique({
      where: { id: params.id },
      include: {
        client: true,
        project: true,
      },
    })

    return NextResponse.json(updatedDeal)
  } catch (error: any) {
    console.error('Update deal error:', error)
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

    const deal = await prisma.deal.deleteMany({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    })

    if (deal.count === 0) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Deal deleted successfully' })
  } catch (error: any) {
    console.error('Delete deal error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
