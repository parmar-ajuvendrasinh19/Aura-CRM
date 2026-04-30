'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, 
  LogOut,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavigation = [
  { name: 'Users', href: '/admin/users', icon: Users },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<any>(null)
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
      console.log('Admin layout - User role:', data.user.role)
      
      if (data.user.role !== 'ADMIN') {
        console.log('Admin layout - Non-admin user, redirecting to dashboard')
        router.push('/dashboard')
        return
      }

      setCurrentUser(data.user)
    } catch (err) {
      console.error('Auth check failed:', err)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <div className="flex h-full w-64 flex-col bg-slate-900">
        <div className="flex h-16 items-center justify-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary-500" />
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-4">
          {adminNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
