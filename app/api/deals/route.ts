import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { dealSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  console.log('GET /api/deals - Starting request')
  
  try {
    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const clientId = searchParams.get('clientId')

    const where: any = {}
    
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

    console.log('GET /api/deals - Successfully retrieved', deals.length, 'deals')
    return NextResponse.json(deals)
  } catch (error: any) {
    console.error('GET /api/deals - Error:', error)
    
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
  console.log('POST /api/deals - Starting request')
  
  try {
    const user = await getCurrentUser()
    console.log('POST /api/deals - User:', user?.userId)

    const body = await request.json()
    console.log('POST /api/deals - Request body:', body)
    
    const validatedData = dealSchema.parse(body)
    console.log('POST /api/deals - Validated data:', validatedData)

    const deal = await prisma.deal.create({
      data: {
        ...validatedData,
        expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : null,
      },
      include: {
        client: true,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user?.userId || 'system',
        action: "CREATE_DEAL",
        entityType: "DEAL",
        entityId: deal.id,
        description: `Created new deal: ${deal.title}`
      }
    })

    console.log('POST /api/deals - Deal created successfully:', deal.id)
    return NextResponse.json(deal, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/deals - Error:', error)
    
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
