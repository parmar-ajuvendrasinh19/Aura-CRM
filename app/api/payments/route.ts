import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  console.log('GET /api/payments - Starting request')
  
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const clientId = searchParams.get('clientId')
    const section = searchParams.get('section')
    const overdue = searchParams.get('overdue')

    const where: any = {}
    
    if (status) where.status = status
    if (type) where.type = type
    if (clientId) where.clientId = clientId

    // Handle section-based filtering
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (section === 'overdue') {
      where.dueDate = {
        lt: today,
      }
      where.status = {
        in: ['PENDING', 'PARTIAL'],
      }
    } else if (section === 'pending') {
      where.status = 'PENDING'
    }

    // Handle overdue query param
    if (overdue === 'true') {
      where.dueDate = {
        lt: today,
      }
      where.status = {
        in: ['PENDING', 'PARTIAL'],
      }
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Add isOverdue computed field
    const paymentsWithOverdue = payments.map(payment => ({
      ...payment,
      isOverdue: payment.dueDate && new Date(payment.dueDate) < today && payment.status !== 'PAID',
    }))

    console.log('GET /api/payments - Successfully retrieved', paymentsWithOverdue.length, 'payments')
    return NextResponse.json(paymentsWithOverdue)
  } catch (error: any) {
    console.error('GET /api/payments - Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  console.log('POST /api/payments - Starting request')
  
  try {
    const user = await getCurrentUser()
    console.log('POST /api/payments - User:', user?.userId)

    const body = await request.json()
    console.log('POST /api/payments - Request body:', body)

    const { amount, status, type, dueDate, paidAt, notes, clientId, projectId } = body

    // Validate required fields
    if (!amount || !type) {
      return NextResponse.json(
        { error: 'Amount and type are required' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.create({
      data: {
        amount: parseFloat(amount),
        status: status || 'PENDING',
        type,
        dueDate: dueDate ? new Date(dueDate) : null,
        paidAt: paidAt ? new Date(paidAt) : null,
        notes,
        clientId,
        projectId,
      },
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    })

    console.log('POST /api/payments - Payment created successfully:', payment.id)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user?.userId || 'system',
        action: "CREATE_PAYMENT",
        entityType: "PAYMENT",
        entityId: payment.id,
        description: `Created new payment: $${payment.amount} for ${payment.type}`
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/payments - Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
