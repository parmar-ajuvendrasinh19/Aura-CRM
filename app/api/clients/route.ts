import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { clientSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  console.log('GET /api/clients - Starting request')
  
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        projects: {
          select: { id: true, status: true },
        },
        _count: {
          select: {
            projects: true,
            deals: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log('GET /api/clients - Successfully retrieved', clients.length, 'clients')
    return NextResponse.json(clients)
  } catch (error: any) {
    console.error('GET /api/clients - Error:', error)
    
    // Handle specific error cases
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
  console.log('POST /api/clients - Starting request')
  
  try {
    const user = await getCurrentUser()
    console.log('POST /api/clients - User:', user?.userId)

    const body = await request.json()
    console.log('POST /api/clients - Request body:', body)
    
    const validatedData = clientSchema.parse(body)
    console.log('POST /api/clients - Validated data:', validatedData)

    const client = await prisma.client.create({
      data: validatedData,
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user?.userId || 'system',
        action: "CREATE_CLIENT",
        entityType: "CLIENT",
        entityId: client.id,
        description: `Created new client: ${client.name}`
      }
    })

    console.log('POST /api/clients - Client created successfully:', client.id)
    return NextResponse.json(client, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/clients - Error:', error)
    
    // Handle specific error cases
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
