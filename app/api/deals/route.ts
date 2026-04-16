import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { dealSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const clientId = searchParams.get('clientId')

    const where: any = { organizationId: user.organizationId }
    
    if (stage) where.stage = stage
    if (clientId) where.clientId = clientId

    const deals = await prisma.deal.findMany({
      where,
      include: {
        client: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(deals)
  } catch (error: any) {
    console.error('Get deals error:', error)
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
    const validatedData = dealSchema.parse(body)

    const deal = await prisma.deal.create({
      data: {
        ...validatedData,
        expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : null,
        organizationId: user.organizationId,
      },
      include: {
        client: true,
      },
    })

    return NextResponse.json(deal, { status: 201 })
  } catch (error: any) {
    console.error('Create deal error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
