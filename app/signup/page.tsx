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
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Enter a valid email address'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (!passwordRegex.test(formData.password)) {
      errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number'
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required'
    } else if (formData.phone.length !== 10) {
      errors.phone = 'Enter valid 10-digit phone number'
    }


    if (!agreedToTerms) {
      errors.terms = 'You must agree to the terms and conditions'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isFormValid = () => {
    const errors: Record<string, string> = {}

    if (!formData.fullName.trim()) errors.fullName = 'required'
    if (!formData.email.trim()) errors.email = 'required'
    else if (!emailRegex.test(formData.email)) errors.email = 'invalid'
    if (!formData.password) errors.password = 'required'
    else if (!passwordRegex.test(formData.password)) errors.password = 'invalid'
    if (!formData.phone.trim()) errors.phone = 'required'
    else if (formData.phone.length !== 10) errors.phone = 'invalid'
    if (!agreedToTerms) errors.terms = 'required'

    return Object.keys(errors).length === 0
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
          phone: formData.phone,
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    handleInputChange('phone', value)
  }

  const handleBlur = (field: string) => {
    const errors: Record<string, string> = { ...fieldErrors }

    if (field === 'fullName' && !formData.fullName.trim()) {
      errors.fullName = 'Full name is required'
    }
    if (field === 'email') {
      if (!formData.email.trim()) {
        errors.email = 'Email is required'
      } else if (!emailRegex.test(formData.email)) {
        errors.email = 'Enter a valid email address'
      }
    }
    if (field === 'password') {
      if (!formData.password) {
        errors.password = 'Password is required'
      } else if (!passwordRegex.test(formData.password)) {
        errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number'
      }
    }
    if (field === 'phone') {
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required'
      } else if (formData.phone.length !== 10) {
        errors.phone = 'Enter valid 10-digit phone number'
      }
    }

    setFieldErrors(errors)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
            <p className="mt-1 text-sm text-gray-500">
              Start managing your agency projects
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
              onBlur={() => handleBlur('fullName')}
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
              onBlur={() => handleBlur('email')}
              error={fieldErrors.email}
              required
            />

            <PasswordInput
              id="password"
              label="Password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
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
              onChange={handlePhoneChange}
              onBlur={() => handleBlur('phone')}
              error={fieldErrors.phone}
              required
            />


            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked)
                  if (fieldErrors.terms) {
                    setFieldErrors(prev => ({ ...prev, terms: '' }))
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-primary hover:text-primary/80">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-primary hover:text-primary/80">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {fieldErrors.terms && (
              <p className="text-sm text-red-500">{fieldErrors.terms}</p>
            )}

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="btn-primary w-full"
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

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
