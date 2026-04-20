import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/users/[id]/promote
 * 
 * DISABLED: Role promotion is no longer allowed.
 * Only one admin exists and role cannot be changed.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    { error: 'Role modification is not allowed. Only one admin exists and role cannot be changed.' },
    { status: 403 }
  )
}
