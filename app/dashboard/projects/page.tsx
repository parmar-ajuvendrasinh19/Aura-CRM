'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Project {
  id: string
  name: string
  serviceType: string
  status: string
  value: number | null
  deadline: string | null
  client: { id: string; name: string } | null
  _count: {
    tasks: number
    payments: number
  }
}

interface Client {
  id: string
  name: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [formError, setFormError] = useState('')
  
  // Form state with controlled components
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serviceType: '',
    status: 'ACTIVE',
    value: '',
    deadline: '',
    clientId: '',
  })

  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [])

  async function fetchClients() {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
    }
  }

  async function fetchProjects() {
    console.log('Fetching projects...')
    try {
      const response = await fetch('/api/projects')
      console.log('Projects API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Projects fetched successfully:', data.length, 'projects')
        setProjects(data)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch projects:', errorData)
        setErrorMessage(errorData.error || 'Failed to fetch projects')
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.client?.name && project.client.name.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesStatus = !statusFilter || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    ON_HOLD: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="mt-2 text-gray-600">Manage your agency projects</p>
        </div>
        {successMessage && (
          <div className="rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-800">
            {errorMessage}
          </div>
        )}
        <button
          onClick={() => {
            console.log('Add Project button clicked')
            setShowModal(true)
          }}
          className="flex cursor-pointer items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">
            {searchQuery || statusFilter ? 'No projects found matching your filters.' : 'No projects yet. Create your first project to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <div key={project.id} className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-4 flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium">Client:</span> {project.client?.name || 'No client'}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Service:</span> {project.serviceType.replace('_', ' ')}
                </p>
                {project.value && (
                  <p className="text-gray-600">
                    <span className="font-medium">Value:</span> {formatCurrency(project.value)}
                  </p>
                )}
                {project.deadline && (
                  <p className="text-gray-600">
                    <span className="font-medium">Deadline:</span> {formatDate(project.deadline)}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{project._count.tasks} tasks</span>
                <span>{project._count.payments} payments</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            console.log('Modal backdrop clicked')
            setShowModal(false)
          }}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-xl font-bold text-gray-900">Add New Project</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setErrorMessage('')
                setSuccessMessage('')
                setFormError('')
                
                // Frontend validation
                if (!formData.name.trim()) {
                  setFormError('Project name is required')
                  return
                }
                if (!formData.serviceType) {
                  setFormError('Service type is required')
                  return
                }
                if (!formData.clientId) {
                  setFormError('Client is required')
                  return
                }
                
                const data = {
                  name: formData.name,
                  description: formData.description || null,
                  serviceType: formData.serviceType,
                  status: formData.status,
                  value: formData.value ? parseFloat(formData.value) : null,
                  deadline: formData.deadline || null,
                  clientId: formData.clientId,
                }

                console.log('Submitting project:', data)

                try {
                  const response = await fetch('/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  })
                  
                  console.log('Project API response status:', response.status)
                  
                  const responseData = await response.json()
                  console.log('Project API response data:', responseData)
                  
                  if (response.ok) {
                    setSuccessMessage('Project created successfully!')
                    setShowModal(false)
                    // Reset form
                    setFormData({
                      name: '',
                      description: '',
                      serviceType: '',
                      status: 'ACTIVE',
                      value: '',
                      deadline: '',
                      clientId: '',
                    })
                    fetchProjects()
                    setTimeout(() => setSuccessMessage(''), 3000)
                  } else {
                    setErrorMessage(responseData.error || 'Failed to create project')
                  }
                } catch (error) {
                  console.error('Failed to create project:', error)
                  setErrorMessage('Network error. Please try again.')
                }
              }}
              className="space-y-4"
            >
              {formError && (
                <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-800">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Service Type *</label>
                <select
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                >
                  <option value="">Select service type</option>
                  <option value="SEO">SEO</option>
                  <option value="WEBSITE_DEVELOPMENT">Website Development</option>
                  <option value="SOCIAL_MEDIA">Social Media</option>
                  <option value="ADS">Ads</option>
                  <option value="CONTENT_MARKETING">Content Marketing</option>
                  <option value="EMAIL_MARKETING">Email Marketing</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client *</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                >
                  <option value="">Select client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Value (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Cancel button clicked')
                    setShowModal(false)
                  }}
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name || !formData.serviceType || !formData.clientId}
                  className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
