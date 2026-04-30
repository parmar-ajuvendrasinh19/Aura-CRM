'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Archive, Trash2, Loader2, X, RotateCcw } from 'lucide-react'
import ClientForm from '@/components/ClientForm'
import EditClientForm from '@/components/EditClientForm'

interface Client {
  id: string
  companyName: string
  ownerName: string
  email: string | null
  phone: string
  services: string[]
  address: string | null
  notes: string | null
  isArchived: boolean
  createdAt: string
}

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const fetchClients = async () => {
    try {
      const res = await fetch(`/api/clients?archived=${showArchived}`)
      if (res.ok) {
        const data = await res.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [showArchived])

  const handleSuccess = () => {
    setShowForm(false)
    fetchClients()
  }

  const handleEditClick = (client: Client) => {
    setSelectedClient(client)
    setShowEditModal(true)
  }

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client)
    setShowDeleteDialog(true)
  }

  const handleArchiveClick = async (client: Client) => {
    if (!confirm(`Are you sure you want to archive ${client.companyName}?`)) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/clients/${client.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true }),
      })
      if (res.ok) {
        fetchClients()
      } else {
        alert('Error archiving client')
      }
    } catch (error) {
      console.error('Error archiving client:', error)
      alert('Error archiving client')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/clients/${selectedClient.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setShowDeleteDialog(false)
        setSelectedClient(null)
        fetchClients()
      } else {
        alert('Error deleting client')
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      alert('Error deleting client')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setSelectedClient(null)
    fetchClients()
  }

  const handleRestoreClick = async (client: Client) => {
    if (!confirm(`Are you sure you want to restore ${client.companyName}?`)) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/clients/${client.id}/restore`, {
        method: 'PATCH',
      })
      if (res.ok) {
        fetchClients()
      } else {
        alert('Error restoring client')
      }
    } catch (error) {
      console.error('Error restoring client:', error)
      alert('Error restoring client')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your client relationships</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                !showArchived
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
                showArchived
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Archived
            </button>
          </div>
          {!showArchived && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 active:scale-[0.95]"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          )}
        </div>
      </div>

      {showForm ? (
        <div className="rounded-xl bg-white p-6 shadow-soft border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Add New Client</h2>
            <p className="mt-1 text-sm text-gray-500">Fill in the details below to create a new client</p>
          </div>
          <ClientForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
          ) : (
        <div className="rounded-xl bg-white shadow-soft border border-gray-100">
          {loading ? (
            <div className="p-5">
              <p className="text-sm text-gray-500">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="p-5">
              <p className="text-sm text-gray-500">
                {showArchived
                  ? 'No archived clients yet.'
                  : 'No clients yet. Click "Add Client" to create one.'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4 p-4">
                {clients.map((client) => (
                  <div key={client.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{client.companyName}</h3>
                        <p className="text-sm text-gray-600">{client.ownerName}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="text-gray-600">
                        {client.email && <span>{client.email}</span>}
                        {client.phone && <span>{client.email && ' • '}{client.phone}</span>}
                      </div>
                      {client.services.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {client.services.map((service) => (
                            <span
                              key={service}
                              className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => window.location.href = `/dashboard/clients/${client.id}`}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-[0.95]"
                      >
                        View Details
                      </button>
                      {!showArchived ? (
                        <>
                          <button
                            onClick={() => handleEditClick(client)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 active:scale-[0.95]"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchiveClick(client)}
                            disabled={actionLoading}
                            className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200 active:scale-[0.95] disabled:opacity-50"
                            title="Archive"
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleRestoreClick(client)}
                          disabled={actionLoading}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Restore"
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteClick(client)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop List View */}
              <div className="hidden lg:block divide-y divide-gray-100">
                {clients.map((client) => (
                  <div key={client.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => window.location.href = `/dashboard/clients/${client.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{client.companyName}</h3>
                        <p className="text-sm text-gray-600">{client.ownerName}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
                          {client.email && <span>{client.email}</span>}
                          {client.phone && <span>• {client.phone}</span>}
                        </div>
                        {client.services.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {client.services.map((service) => (
                              <span
                                key={service}
                                className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-xs text-gray-400">
                          {new Date(client.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-1">
                          {!showArchived ? (
                            <>
                              <button
                                onClick={() => handleEditClick(client)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleArchiveClick(client)}
                                disabled={actionLoading}
                                className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Archive"
                              >
                                {actionLoading ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Archive className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleRestoreClick(client)}
                              disabled={actionLoading}
                              className="p-3 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 active:scale-[0.95] disabled:opacity-50"
                              title="Restore"
                            >
                              {actionLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RotateCcw className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(client)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 active:scale-[0.95]"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Edit Client</h2>
                  <p className="mt-1 text-sm text-gray-500">Update client information</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <EditClientForm
                client={selectedClient}
                onSuccess={handleEditSuccess}
                onCancel={() => setShowEditModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Delete Client</h2>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>{selectedClient.companyName}</strong>? This will permanently remove the client and all associated data.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setSelectedClient(null)
                  }}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={actionLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Client'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
