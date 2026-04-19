'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  async function fetchUserData() {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setOrganization(data.organization)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action is irreversible and will delete all your data.'
    )
    
    if (!confirmed) return

    setIsDeleting(true)
    
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Redirect to login page after successful deletion
        router.push('/login')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('An error occurred while deleting your account')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account and organization settings</p>
      </div>

      <div className="space-y-6">
        {/* User Profile */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{user?.name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user?.email || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1 text-sm text-gray-900">{user?.role || '-'}</p>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Organization</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Organization Name</label>
              <p className="mt-1 text-sm text-gray-900">{organization?.name || '-'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{organization?.email || '-'}</p>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="rounded-lg bg-red-50 p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-red-900">Danger Zone</h2>
          <p className="mb-4 text-sm text-red-700">
            These actions are irreversible. Please be careful.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="rounded-lg border border-red-300 bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
