let isRefreshing = false
let refreshPromise: Promise<any> | null = null

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, options)

  // If 401, try to refresh token and retry
  if (response.status === 401 && !url.includes('/auth/refresh')) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshToken()
    }

    try {
      await refreshPromise
      // Retry the original request
      return fetch(url, options)
    } catch (error) {
      console.error('Token refresh failed:', error)
      // Redirect to login if refresh fails
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw error
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  }

  return response
}

async function refreshToken(): Promise<void> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      throw new Error('Token refresh failed')
    }

    const data = await response.json()
    console.log('Token refreshed successfully')
  } catch (error) {
    console.error('Token refresh error:', error)
    throw error
  }
}
