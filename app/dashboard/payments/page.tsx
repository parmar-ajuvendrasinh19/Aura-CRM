'use client'

import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Payment {
  id: string
  amount: number
  status: string
  dueDate: string | null
  paidDate: string | null
  project: { id: string; name: string } | null
  client: { id: string; name: string } | null
}

interface Project {
  id: string
  name: string
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [formError, setFormError] = useState('')
  
  // Form state with controlled components
  const [formData, setFormData] = useState({
    amount: '',
    status: 'PENDING',
    dueDate: '',
    projectId: '',
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    if (showModal) {
      fetchProjects()
    }
  }, [showModal])

  async function fetchProjects() {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  async function fetchPayments() {
    console.log('Fetching payments...')
    try {
      const response = await fetch('/api/payments')
      console.log('Payments API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Payments fetched successfully:', data.length, 'payments')
        setPayments(data)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch payments:', errorData)
        setErrorMessage(errorData.error || 'Failed to fetch payments')
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.project?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || payment.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-green-100 text-green-800',
    OVERDUE: 'bg-red-100 text-red-800',
  }

  return (
    <div className="p-8">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
          <p className="mt-2 text-gray-600">Track project payments and revenue</p>
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
            console.log('Add Payment button clicked')
            setShowModal(true)
          }}
          className="flex cursor-pointer items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">
            {searchQuery || statusFilter ? 'No payments found matching your filters.' : 'No payments yet. Add your first payment to get started.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {payment.project?.name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {payment.client?.name || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {payment.dueDate ? formatDate(payment.dueDate) : '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[payment.status as keyof typeof statusColors]}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Payment Modal */}
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
            <h2 className="mb-4 text-xl font-bold text-gray-900">Add New Payment</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setErrorMessage('')
                setSuccessMessage('')
                setFormError('')
                
                // Frontend validation
                if (!formData.amount) {
                  setFormError('Amount is required')
                  return
                }
                if (parseFloat(formData.amount) <= 0) {
                  setFormError('Amount must be positive')
                  return
                }
                if (!formData.projectId) {
                  setFormError('Project is required')
                  return
                }
                
                const data = {
                  amount: parseFloat(formData.amount),
                  status: formData.status,
                  dueDate: formData.dueDate || null,
                  projectId: formData.projectId,
                }

                console.log('Submitting payment:', data)

                try {
                  const response = await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  })
                  
                  console.log('Payment API response status:', response.status)
                  
                  const responseData = await response.json()
                  console.log('Payment API response data:', responseData)
                  
                  if (response.ok) {
                    setSuccessMessage('Payment created successfully!')
                    setShowModal(false)
                    // Reset form
                    setFormData({
                      amount: '',
                      status: 'PENDING',
                      dueDate: '',
                      projectId: '',
                    })
                    fetchPayments()
                    setTimeout(() => setSuccessMessage(''), 3000)
                  } else {
                    setErrorMessage(responseData.error || 'Failed to create payment')
                  }
                } catch (error) {
                  console.error('Failed to create payment:', error)
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
                <label className="block text-sm font-medium text-gray-700">Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Project *</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                >
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
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
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                  disabled={!formData.amount || !formData.projectId}
                  className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}
