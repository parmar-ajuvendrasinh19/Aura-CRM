import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-auth'

/**
 * POST /api/admin/users/[id]/promote
 * 
 * Promotes a user to admin role.
 * Only accessible by ADMIN users.
 * Ensures only one admin exists by demoting current admin if needed.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins can promote users
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const userId = params.id

    // Find user to promote
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is already admin
    if (targetUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'User is already an admin' },
        { status: 400 }
      )
    }

    // Check if there's already an admin (should be only one)
    const currentAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (currentAdmin && currentAdmin.id !== targetUser.id) {
      // Demote current admin to USER
      await prisma.user.update({
        where: { id: currentAdmin.id },
        data: { role: 'USER' }
      })
    }

    // Promote target user to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: 'ADMIN' }
    })

    // Log admin action
    console.log(`Admin ${currentUser.email} promoted user: ${targetUser.email} (ID: ${targetUser.id}) to ADMIN`)

    return NextResponse.json({
      success: true,
      message: `User ${targetUser.email} promoted to admin successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      }
    })

  } catch (error: any) {
    console.error('Promote user error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
