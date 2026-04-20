'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Building2, Shield, AlertTriangle, Camera, Save, Key, LogOut } from 'lucide-react'

type TabType = 'profile' | 'account' | 'organization' | 'security' | 'danger'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('profile')
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  
  // Organization form state
  const [orgForm, setOrgForm] = useState({ name: '' })
  const [isSavingOrg, setIsSavingOrg] = useState(false)
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Logout devices state
  const [isLoggingOutDevices, setIsLoggingOutDevices] = useState(false)

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
        setProfileForm({ name: data.user?.name || '', phone: data.user?.phone || '' })
        setOrgForm({ name: data.organization?.name || '' })
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveProfile() {
    setIsSavingProfile(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      })
      
      if (response.ok) {
        setUser({ ...user, ...profileForm })
        alert('Profile updated successfully')
      } else {
        alert('Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('An error occurred while updating profile')
    } finally {
      setIsSavingProfile(false)
    }
  }

  async function handleSaveOrganization() {
    setIsSavingOrg(true)
    try {
      const response = await fetch('/api/organization/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm)
      })
      
      if (response.ok) {
        setOrganization({ ...organization, ...orgForm })
        alert('Organization updated successfully')
      } else {
        alert('Failed to update organization')
      }
    } catch (error) {
      console.error('Failed to update organization:', error)
      alert('An error occurred while updating organization')
    } finally {
      setIsSavingOrg(false)
    }
  }

  async function handleChangePassword() {
    setIsChangingPassword(true)
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm)
      })
      
      if (response.ok) {
        setPasswordForm({ currentPassword: '', newPassword: '' })
        alert('Password changed successfully')
      } else {
        alert('Failed to change password')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      alert('An error occurred while changing password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  async function handleLogoutAllDevices() {
    setIsLoggingOutDevices(true)
    try {
      const response = await fetch('/api/auth/logout-all', {
        method: 'POST'
      })
      
      if (response.ok) {
        alert('Logged out from all devices successfully')
      } else {
        alert('Failed to logout from all devices')
      }
    } catch (error) {
      console.error('Failed to logout from all devices:', error)
      alert('An error occurred while logging out from all devices')
    } finally {
      setIsLoggingOutDevices(false)
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true)
    
    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE'
      })
      
      if (response.ok) {
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
      setShowDeleteModal(false)
      setDeleteConfirmation('')
    }
  }

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'account' as TabType, label: 'Account', icon: Mail },
    { id: 'organization' as TabType, label: 'Organization', icon: Building2 },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'danger' as TabType, label: 'Danger Zone', icon: AlertTriangle },
  ]

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  const isAdmin = user?.role === 'ADMIN'

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Manage your account and organization settings</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
            
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                  {user?.name ? (
                    <span className="text-3xl font-bold text-gray-600">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors">
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Profile Photo</h3>
                <p className="text-sm text-gray-500 mt-1">JPG, PNG or GIF. Max size 2MB</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingProfile ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Account Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{user?.email || '-'}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Password</h3>
                <button
                  onClick={() => setActiveTab('security')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Organization Tab */}
        {activeTab === 'organization' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Organization Settings</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                {isAdmin ? (
                  <input
                    type="text"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                    placeholder="Enter organization name"
                  />
                ) : (
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{organization?.name || '-'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Users Count</label>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{organization?._count?.users || 0} members</span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveOrganization}
                    disabled={isSavingOrg}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSavingOrg ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>Change Password</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                      placeholder="Enter new password"
                    />
                  </div>
                  <button
                    onClick={handleChangePassword}
                    disabled={isChangingPassword}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                  <LogOut className="w-5 h-5" />
                  <span>Sessions</span>
                </h3>
                <p className="text-sm text-gray-600 mb-4">Log out from all devices including your current session.</p>
                <button
                  onClick={handleLogoutAllDevices}
                  disabled={isLoggingOutDevices}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoggingOutDevices ? 'Logging out...' : 'Logout All Devices'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Danger Zone</h2>
            
            <div className="border border-red-200 rounded-lg bg-red-50 p-6">
              <h3 className="font-semibold text-red-900 mb-2">Delete Account</h3>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-900">Delete Account</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action is irreversible and will delete all your data.
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="font-mono font-bold">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all font-mono"
                placeholder="DELETE"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setDeleteConfirmation('')
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
