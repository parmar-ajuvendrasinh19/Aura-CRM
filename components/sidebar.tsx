'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  TrendingUp,
  DollarSign,
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

const userMenu = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare },
  { name: 'Deals', href: '/dashboard/deals', icon: TrendingUp },
  { name: 'Payments', href: '/dashboard/payments', icon: DollarSign },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

const adminMenu = [
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          console.log('Sidebar - User role:', data.user.role)
          setUserRole(data.user.role)
        }
      } catch (error) {
        console.error('Failed to fetch user role:', error)
      }
    }
    fetchUserRole()
  }, [])

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">Aura CRM</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {userRole === 'ADMIN' && (
          <Link
            href="/admin/users"
            className={cn(
              'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-2',
              pathname.startsWith('/admin')
                ? 'bg-purple-600 text-white'
                : 'text-purple-300 hover:bg-purple-900 hover:text-white'
            )}
          >
            <Shield className="mr-3 h-5 w-5" />
            Admin Panel
          </Link>
        )}

        {(userRole === 'ADMIN' ? adminMenu : userMenu).map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
