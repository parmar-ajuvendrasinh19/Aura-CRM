'use client'

import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Client {
  id: string
  name: string
  company: string | null
  email: string | null
  phone: string | null
  _count: {
    projects: number
    deals: number
  }
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    console.log('Fetching clients...')
    try {
      const response = await fetch('/api/clients')
      console.log('Clients API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Clients fetched successfully:', data.length, 'clients')
        setClients(data)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch clients:', errorData)
        setErrorMessage(errorData.error || 'Failed to fetch clients')
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your client relationships</p>
        </div>
        {successMessage && (
          <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800">
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
            console.log('Add Client button clicked')
            setShowModal(true)
          }}
          className="btn-primary flex cursor-pointer items-center"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Clients Table */}
      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : filteredClients.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">
            {searchQuery ? 'No clients found matching your search.' : 'No clients yet. Add your first client to get started.'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-soft border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Deals
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    {client.phone && (
                      <div className="text-xs text-gray-500">{client.phone}</div>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {client.company || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {client.email || '-'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {client._count.projects}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {client._count.deals}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            console.log('Modal backdrop clicked')
            setShowModal(false)
          }}
        >
          <div
            className="w-full max-w-md card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-bold text-gray-900">Add New Client</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setErrorMessage('')
                setSuccessMessage('')
                
                const formData = new FormData(e.currentTarget)
                const data = {
                  name: formData.get('name') as string,
                  company: formData.get('company') as string,
                  email: formData.get('email') as string,
                  phone: formData.get('phone') as string,
                  notes: formData.get('notes') as string,
                }

                console.log('Submitting client:', data)

                try {
                  const response = await fetch('/api/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  })
                  
                  console.log('API response status:', response.status)
                  
                  const responseData = await response.json()
                  console.log('API response data:', responseData)
                  
                  if (response.ok) {
                    setSuccessMessage('Client created successfully!')
                    setShowModal(false)
                    fetchClients()
                    setTimeout(() => setSuccessMessage(''), 3000)
                  } else {
                    setErrorMessage(responseData.error || 'Failed to create client')
                  }
                } catch (error) {
                  console.error('Failed to create client:', error)
                  setErrorMessage('Network error. Please try again.')
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  name="company"
                  type="text"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  name="phone"
                  type="text"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="input-field"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Cancel button clicked')
                    setShowModal(false)
                  }}
                  className="btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary cursor-pointer"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
