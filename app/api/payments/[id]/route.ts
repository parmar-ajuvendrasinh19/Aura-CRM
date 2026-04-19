import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'
import { paymentSchema } from '@/lib/validations'

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
    const validatedData = paymentSchema.parse(body)

    const payment = await prisma.payment.updateMany({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
        paidDate: validatedData.paidDate ? new Date(validatedData.paidDate) : undefined,
      },
    })

    if (payment.count === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const updatedPayment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(updatedPayment)
  } catch (error: any) {
    console.error('Update payment error:', error)
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

    const payment = await prisma.payment.deleteMany({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    })

    if (payment.count === 0) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Payment deleted successfully' })
  } catch (error: any) {
    console.error('Delete payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
