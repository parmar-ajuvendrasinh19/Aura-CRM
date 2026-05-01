import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('PATCH /api/payments/[id] - Starting request')
  
  try {
    const user = await getCurrentUser()
    const { id } = params

    const body = await request.json()
    console.log('PATCH /api/payments/[id] - Request body:', body)

    const { amount, status, type, dueDate, paidAt, notes, clientId, projectId } = body

    const updateData: any = {}
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (status !== undefined) updateData.status = status
    if (type !== undefined) updateData.type = type
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null
    if (paidAt !== undefined) updateData.paidAt = paidAt ? new Date(paidAt) : null
    if (notes !== undefined) updateData.notes = notes
    if (clientId !== undefined) updateData.clientId = clientId
    if (projectId !== undefined) updateData.projectId = projectId

    const payment = await prisma.payment.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, companyName: true } },
        project: { select: { id: true, name: true } },
      },
    })

    console.log('PATCH /api/payments/[id] - Payment updated successfully:', payment.id)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user?.userId || 'system',
        action: "UPDATE_PAYMENT",
        entityType: "PAYMENT",
        entityId: payment.id,
        description: `Updated payment: $${payment.amount}`
      }
    })

    return NextResponse.json(payment)
  } catch (error: any) {
    console.error('PATCH /api/payments/[id] - Error:', error)
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
  console.log('DELETE /api/payments/[id] - Starting request')
  
  try {
    const user = await getCurrentUser()
    const { id } = params

    const payment = await prisma.payment.delete({
      where: { id },
    })

    console.log('DELETE /api/payments/[id] - Payment deleted successfully:', payment.id)

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user?.userId || 'system',
        action: "DELETE_PAYMENT",
        entityType: "PAYMENT",
        entityId: payment.id,
        description: `Deleted payment: $${payment.amount}`
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/payments/[id] - Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
