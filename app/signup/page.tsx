'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'
import PhoneInput from '@/components/ui/PhoneInput'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    organizationName: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number'
    }

    if (!formData.organizationName.trim()) {
      errors.organizationName = 'Organization name is required'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isFormValid = () => {
    return (
      formData.fullName.trim() &&
      formData.email.trim() &&
      formData.password &&
      formData.phone.trim() &&
      formData.organizationName.trim() &&
      agreedToTerms
    )
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          organizationName: formData.organizationName,
        }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Signup failed')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-2 text-gray-600">
              Start managing your agency projects
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              error={fieldErrors.fullName}
              required
            />

            <Input
              id="email"
              label="Work Email"
              type="email"
              placeholder="john@company.com"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={fieldErrors.email}
              required
            />

            <PasswordInput
              id="password"
              label="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              error={fieldErrors.password}
              autoComplete="new-password"
              placeholder="Create a strong password"
              required
            />

            <PhoneInput
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              error={fieldErrors.phone}
              required
            />

            <Input
              id="organizationName"
              label="Organization Name"
              type="text"
              placeholder="Your Company"
              value={formData.organizationName}
              onChange={(e) => handleInputChange('organizationName', e.target.value)}
              error={fieldErrors.organizationName}
              required
            />

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                required
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-red-600 hover:text-red-500">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-red-600 hover:text-red-500">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full flex items-center justify-center rounded-lg bg-red-600 px-4 py-3.5 text-base font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Get Started'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-red-600 hover:text-red-500">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
