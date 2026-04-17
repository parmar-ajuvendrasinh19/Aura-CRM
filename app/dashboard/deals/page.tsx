'use client'

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface Deal {
  id: string
  title: string
  stage: string
  value: number | null
  probability: number | null
  client: { id: string; name: string } | null
}

interface Client {
  id: string
  name: string
}

const stages = ['LEAD', 'CONTACTED', 'PROPOSAL_SENT', 'WON', 'LOST']

const stageColors = {
  LEAD: 'bg-gray-100 border-gray-300',
  CONTACTED: 'bg-blue-100 border-blue-300',
  PROPOSAL_SENT: 'bg-yellow-100 border-yellow-300',
  WON: 'bg-green-100 border-green-300',
  LOST: 'bg-red-100 border-red-300',
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [formError, setFormError] = useState('')
  
  // Form state with controlled components
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    stage: 'LEAD',
    value: '',
    probability: '',
    clientId: '',
  })

  useEffect(() => {
    fetchDeals()
  }, [])

  useEffect(() => {
    if (showModal) {
      fetchClients()
    }
  }, [showModal])

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

  async function fetchDeals() {
    console.log('Fetching deals...')
    try {
      const response = await fetch('/api/deals')
      console.log('Deals API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Deals fetched successfully:', data.length, 'deals')
        setDeals(data)
      } else {
        const errorData = await response.json()
        console.error('Failed to fetch deals:', errorData)
        setErrorMessage(errorData.error || 'Failed to fetch deals')
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error)
      setErrorMessage('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  async function updateDealStage(dealId: string, newStage: string) {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      if (response.ok) {
        fetchDeals()
      }
    } catch (error) {
      console.error('Failed to update deal:', error)
    }
  }

  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage] = deals.filter(deal => deal.stage === stage)
    return acc
  }, {} as Record<string, Deal[]>)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals Pipeline</h1>
          <p className="mt-2 text-gray-600">Track your leads and opportunities</p>
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
            console.log('Add Deal button clicked')
            setShowModal(true)
          }}
          className="flex cursor-pointer items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Deal
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-5">
          {stages.map((stage) => (
            <div key={stage} className="flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{stage.replace('_', ' ')}</h3>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                  {dealsByStage[stage]?.length || 0}
                </span>
              </div>
              <div className="flex-1 space-y-3">
                {dealsByStage[stage]?.map((deal) => (
                  <div
                    key={deal.id}
                    className={`rounded-lg border p-4 shadow-sm ${stageColors[stage as keyof typeof stageColors]}`}
                  >
                    <h4 className="font-medium text-gray-900">{deal.title}</h4>
                    {deal.client && (
                      <p className="mt-1 text-sm text-gray-600">{deal.client.name}</p>
                    )}
                    {deal.value && (
                      <p className="mt-2 text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</p>
                    )}
                    {deal.probability && (
                      <p className="mt-1 text-xs text-gray-500">{deal.probability}% probability</p>
                    )}
                    <div className="mt-3">
                      <select
                        value={deal.stage}
                        onChange={(e) => updateDealStage(deal.id, e.target.value)}
                        className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            {s.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {dealsByStage[stage]?.length === 0 && (
                  <div className="flex-1 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center text-sm text-gray-400">
                    No deals
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Deal Modal */}
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
            <h2 className="mb-4 text-xl font-bold text-gray-900">Add New Deal</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                setErrorMessage('')
                setSuccessMessage('')
                setFormError('')
                
                // Frontend validation
                if (!formData.title.trim()) {
                  setFormError('Deal title is required')
                  return
                }
                if (!formData.clientId) {
                  setFormError('Client is required')
                  return
                }
                
                const data = {
                  title: formData.title,
                  description: formData.description || null,
                  stage: formData.stage,
                  value: formData.value ? parseFloat(formData.value) : null,
                  probability: formData.probability ? parseInt(formData.probability) : null,
                  clientId: formData.clientId,
                }

                console.log('Submitting deal:', data)

                try {
                  const response = await fetch('/api/deals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  })
                  
                  console.log('Deal API response status:', response.status)
                  
                  const responseData = await response.json()
                  console.log('Deal API response data:', responseData)
                  
                  if (response.ok) {
                    setSuccessMessage('Deal created successfully!')
                    setShowModal(false)
                    // Reset form
                    setFormData({
                      title: '',
                      description: '',
                      stage: 'LEAD',
                      value: '',
                      probability: '',
                      clientId: '',
                    })
                    fetchDeals()
                    setTimeout(() => setSuccessMessage(''), 3000)
                  } else {
                    setErrorMessage(responseData.error || 'Failed to create deal')
                  }
                } catch (error) {
                  console.error('Failed to create deal:', error)
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
                <label className="block text-sm font-medium text-gray-700">Deal Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <label className="block text-sm font-medium text-gray-700">Stage *</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                >
                  <option value="LEAD">Lead</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="WON">Won</option>
                  <option value="LOST">Lost</option>
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
                <label className="block text-sm font-medium text-gray-700">Probability (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
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
                  disabled={!formData.title || !formData.clientId}
                  className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
