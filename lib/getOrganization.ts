import { prisma } from '@/lib/prisma'
import { getCurrentUser, TokenPayload } from '@/lib/auth'

/**
 * Gets the organization ID for the current request.
 * 
 * Logic:
 * - If user is authenticated → return their organization ID
 * - If no user (development mode) → fallback to first organization in DB
 * - Throw error if no organization exists
 * 
 * @returns The organization ID
 * @throws Error if no organization exists in the database
 */
export async function getOrganization(): Promise<string> {
  console.log('[getOrganization] Starting organization lookup')
  
  const user = await getCurrentUser()
  
  if (user) {
    console.log('[getOrganization] User authenticated, returning organization ID:', user.organizationId)
    return user.organizationId
  }
  
  // Development fallback: use first organization in database
  console.log('[getOrganization] No user authenticated, using development fallback')
  const organization = await prisma.organization.findFirst()
  
  if (!organization) {
    console.error('[getOrganization] No organization found in database')
    throw new Error('No organization found. Please create an organization first.')
  }
  
  console.log('[getOrganization] Using fallback organization ID:', organization.id)
  return organization.id
}

/**
 * Gets the organization ID and user info for the current request.
 * 
 * @returns Object containing organizationId and user (if authenticated)
 * @throws Error if no organization exists in the database
 */
export async function getOrganizationWithUser(): Promise<{
  organizationId: string
  user: TokenPayload | null
}> {
  console.log('[getOrganizationWithUser] Starting organization and user lookup')
  
  const user = await getCurrentUser()
  const organizationId = await getOrganization()
  
  console.log('[getOrganizationWithUser] Result:', {
    organizationId,
    hasUser: !!user,
    userId: user?.userId,
  })
  
  return { organizationId, user }
}
