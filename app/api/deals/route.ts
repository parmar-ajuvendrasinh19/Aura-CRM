import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganization } from '@/lib/getOrganization'
import { dealSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  console.log('GET /api/deals - Starting request')
  
  try {
    const organizationId = await getOrganization()
    console.log('GET /api/deals - Organization ID:', organizationId)

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')
    const clientId = searchParams.get('clientId')

    const where: any = { organizationId }
    
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
    const organizationId = await getOrganization()
    console.log('POST /api/deals - Organization ID:', organizationId)

    const body = await request.json()
    console.log('POST /api/deals - Request body:', body)
    
    const validatedData = dealSchema.parse(body)
    console.log('POST /api/deals - Validated data:', validatedData)

    const deal = await prisma.deal.create({
      data: {
        ...validatedData,
        expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : null,
        organizationId,
      },
      include: {
        client: true,
      },
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
