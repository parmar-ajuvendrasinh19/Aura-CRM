'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, AlertCircle, Loader2 } from 'lucide-react'

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount)
}

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

interface Payment {
  id: string
  amount: number
  status: string
  type: string
  dueDate: string | null
  paidAt: string | null
  notes: string | null
  createdAt: string
  isOverdue: boolean
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchClient()
      fetchPayments()
    }
  }, [params.id])

  const fetchClient = async () => {
    try {
      const res = await fetch(`/api/clients/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setClient(data)
      }
    } catch (error) {
      console.error('Error fetching client:', error)
    }
  }

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/payments?clientId=${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPayments(data)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'PARTIAL':
        return 'bg-blue-100 text-blue-700'
      case 'OVERDUE':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WEBSITE':
        return 'bg-purple-100 text-purple-700'
      case 'MARKETING':
        return 'bg-orange-100 text-orange-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0)

  const totalPending = payments
    .filter((p) => p.status === 'PENDING' || p.status === 'PARTIAL')
    .reduce((sum, p) => sum + p.amount, 0)

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Client not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{client.companyName}</h1>
        <p className="mt-1 text-sm text-gray-500">{client.ownerName}</p>
      </div>

      {/* Client Info */}
      <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{client.email || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-900">{client.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="text-sm font-medium text-gray-900">{client.address || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Services</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {client.services.map((service) => (
                <span
                  key={service}
                  className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        </div>
        {client.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Notes</p>
            <p className="text-sm text-gray-900 mt-1">{client.notes}</p>
          </div>
        )}
      </div>

      {/* Payment Summary */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="mt-2 text-3xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">{formatCurrency(totalPending)}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments recorded for this client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                      {payment.isOverdue && (
                        <div className="flex items-center mt-1 text-xs text-red-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(payment.type)}`}>
                        {payment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
