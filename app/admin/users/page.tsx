'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Trash2, 
  Shield, 
  Filter,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Activity
} from 'lucide-react'
import { format } from 'date-fns'

interface User {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  createdAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: User | null }>({
    show: false,
    user: null,
  })
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [searchTerm, roleFilter, pagination?.page])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (roleFilter) params.append('role', roleFilter)
      params.append('page', (pagination?.page || 1).toString())
      params.append('limit', '50')

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data = await response.json()
      setUsers(data.users)
      setPagination(data.pagination)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to fetch users' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ show: true, user })
    setDeleteConfirmation('')
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user || deleteConfirmation !== 'DELETE') return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/users/${deleteModal.user.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete user')
      }

      setMessage({ type: 'success', text: `User ${deleteModal.user.email} deleted successfully` })
      setDeleteModal({ show: false, user: null })
      setDeleteConfirmation('')
      fetchUsers()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete user' })
    } finally {
      setDeleting(false)
    }
  }

  const handlePromote = async (user: User) => {
    try {
      setPromoting(true)
      const response = await fetch(`/api/admin/users/${user.id}/promote`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to promote user')
      }

      setMessage({ type: 'success', text: `User ${user.email} promoted to admin successfully` })
      fetchUsers()
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to promote user' })
    } finally {
      setPromoting(false)
    }
  }

  const handlePageChange = (newPage: number) => {
    if (pagination && newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination({ ...pagination, page: newPage })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'USER':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">Manage users in your organization</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
          <button
            onClick={() => setMessage(null)}
            className="ml-4 text-sm underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              if (pagination) setPagination({ ...pagination, page: 1 })
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                if (pagination) setPagination({ ...pagination, page: 1 })
              }}
              className="rounded-lg border border-gray-300 py-2 pl-10 pr-8 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Created Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}/activity`)}
                        className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
                      >
                        <Activity className="mr-1.5 h-4 w-4" />
                        Activity
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handlePromote(user)}
                          disabled={promoting}
                          className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <UserPlus className="mr-1.5 h-4 w-4" />
                          Make Admin
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(user)}
                        className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="mr-1.5 h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center">
              <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete User
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-4 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-800">
                You are about to delete <strong>{deleteModal.user.name}</strong> (
                {deleteModal.user.email}). This will:
              </p>
              <ul className="mt-2 ml-4 list-disc text-sm text-red-700">
                <li>Delete all their refresh tokens</li>
                <li>Unassign them from all tasks</li>
                <li>Delete all tasks they created</li>
                <li>Remove their association from activities</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Type <span className="font-mono font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, user: null })}
                disabled={deleting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteConfirmation !== 'DELETE' || deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
