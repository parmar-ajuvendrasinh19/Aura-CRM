'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Filter, Clock, Activity } from 'lucide-react'

interface ActivityLog {
  id: string
  userId: string
  action: string
  entityType: string | null
  entityId: string | null
  description: string
  createdAt: string
}

interface UserDetails {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  avatar: string | null
  isActive: boolean
  createdAt: string
  activityLogs: ActivityLog[]
}

export default function UserActivityPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const fetchUserDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user details')
      }

      const data = await response.json()
      setUserDetails(data)
    } catch (error: any) {
      console.error('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatIST = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const getActionColor = (action: string) => {
    if (action.startsWith('CREATE')) return 'bg-green-100 text-green-800 border-green-200'
    if (action.startsWith('UPDATE')) return 'bg-blue-100 text-blue-800 border-blue-200'
    if (action.startsWith('DELETE')) return 'bg-red-100 text-red-800 border-red-200'
    if (action === 'LOGIN') return 'bg-purple-100 text-purple-800 border-purple-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getActionIcon = (action: string) => {
    return <Clock className="h-4 w-4" />
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </button>
        <h1 className="text-3xl font-bold text-gray-900">User Activity Timeline</h1>
        <p className="mt-2 text-gray-600">View all actions performed by this user</p>
      </div>

      {/* User Details Card */}
      {!loading && userDetails && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">User Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-900">{userDetails.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-900">{userDetails.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{userDetails.phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-900">{userDetails.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Account Created</p>
              <p className="font-medium text-gray-900">{formatIST(userDetails.createdAt)} (IST)</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-gray-900">
                {userDetails.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            Loading activity logs...
          </div>
        ) : !userDetails || userDetails.activityLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Activity className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-2">No activity logs found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {userDetails.activityLogs.map((log: ActivityLog) => (
              <div key={log.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                    {getActionIcon(log.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getActionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                      {log.entityType && (
                        <span className="text-xs text-gray-500">
                          • {log.entityType}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm font-medium text-gray-900">
                      {log.description}
                    </p>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatIST(log.createdAt)} (IST)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {!loading && userDetails && userDetails.activityLogs.length > 0 && (
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 shadow">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{userDetails.activityLogs.length}</span> activity logs
          </p>
        </div>
      )}
    </div>
  )
}
