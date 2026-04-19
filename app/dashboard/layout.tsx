'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        router.push('/login')
        return
      }

      const data = await response.json()
      console.log('Dashboard layout - User role:', data.user.role)
      
      // Redirect admin users to admin panel
      if (data.user.role === 'ADMIN') {
        console.log('Dashboard layout - Admin user, redirecting to admin panel')
        router.push('/admin/users')
        return
      }

      // Allow MANAGER and MEMBER to access dashboard
      if (data.user.role === 'MANAGER' || data.user.role === 'MEMBER') {
        console.log('Dashboard layout - Authorized user')
        return
      }

      // Unknown role, redirect to dashboard as default
      router.push('/dashboard')
    } catch (err) {
      console.error('Auth check failed:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
