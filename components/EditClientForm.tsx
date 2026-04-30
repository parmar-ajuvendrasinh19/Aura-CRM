'use client'

import { useState, useEffect } from 'react'
import Input from './ui/Input'
import { Loader2 } from 'lucide-react'

interface Client {
  id: string
  companyName: string
  ownerName: string
  email: string | null
  phone: string
  services: string[]
  address: string | null
  notes: string | null
}

interface EditClientFormProps {
  client: Client
  onSuccess?: () => void
  onCancel?: () => void
}

const SERVICE_OPTIONS = [
  { value: 'WEBSITE', label: 'Website' },
  { value: 'MARKETING', label: 'Marketing' },
]

export default function EditClientForm({ client, onSuccess, onCancel }: EditClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setCompanyName(client.companyName)
    setOwnerName(client.ownerName)
    setEmail(client.email || '')
    setPhone(client.phone)
    setServices(client.services)
    setAddress(client.address || '')
    setNotes(client.notes || '')
  }, [client])

  const toggleService = (serviceValue: string) => {
    if (services.includes(serviceValue)) {
      setServices(services.filter((s) => s !== serviceValue))
    } else {
      setServices([...services, serviceValue])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data = {
      companyName,
      ownerName,
      phone,
      email,
      services,
      address,
      notes,
    }

    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        alert('Client updated successfully')
        onSuccess?.()
      } else {
        alert('Error updating client')
      }
    } catch (error) {
      console.error('Error updating client:', error)
      alert('Error updating client')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="companyName"
          label="Company Name"
          placeholder="Enter company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
        />

        <Input
          id="ownerName"
          label="Owner Name"
          placeholder="Enter owner name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
        />

        <Input
          id="email"
          label="Email"
          type="email"
          placeholder="client@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          id="phone"
          label="Phone"
          type="tel"
          placeholder="1234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block mb-3 text-sm font-medium text-gray-700">
          Services <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {SERVICE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                value={option.value}
                checked={services.includes(option.value)}
                onChange={() => toggleService(option.value)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="ml-3 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="address"
          label="Address"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <div className="md:col-span-2">
          <label htmlFor="notes" className="block mb-2 text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Additional notes about the client"
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Client'
          )}
        </button>
      </div>
    </form>
  )
}
