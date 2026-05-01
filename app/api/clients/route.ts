import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { clientSchema } from '@/lib/validations'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  console.log('GET /api/clients - Starting request')
  
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const archived = searchParams.get('archived')

    const where: any = {}

    if (archived === 'true') {
      where.isArchived = true
    } else if (archived === 'false') {
      where.isArchived = false
    } else {
      where.isArchived = false
    }

    if (search) {
      where.OR = [
        { ownerName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    console.log('GET /api/clients - Successfully retrieved', clients.length, 'clients')
    return NextResponse.json(clients)
  } catch (error: any) {
    console.error('GET /api/clients - Error:', error)
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
        description: `Created new client: ${client.companyName}`
      }
    })

    console.log('POST /api/clients - Client created successfully:', client.id)
    return NextResponse.json(client, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/clients - Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
