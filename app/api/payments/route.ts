import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  console.log('GET /api/payments - Starting request')
  
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const projectId = searchParams.get('projectId')

    const where: any = {}
    
    if (status) where.status = status
    if (clientId) where.clientId = clientId
    if (projectId) where.projectId = projectId

    const payments = await prisma.payment.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    })

    console.log('GET /api/payments - Successfully retrieved', payments.length, 'payments')
    return NextResponse.json(payments)
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
    const body = await request.json()
    console.log('POST /api/payments - Request body:', body)
    
    const validatedData = paymentSchema.parse(body)
    console.log('POST /api/payments - Validated data:', validatedData)

    const payment = await prisma.payment.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        paidDate: validatedData.paidDate ? new Date(validatedData.paidDate) : null,
      },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    })

    console.log('POST /api/payments - Payment created successfully:', payment.id)
    return NextResponse.json(payment, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/payments - Error:', error)
    
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
