'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import PasswordInput from '@/components/ui/PasswordInput'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Invalid email format'
    }

    if (!formData.password) {
      errors.password = 'Password is required'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isFormValid = () => {
    return formData.email.trim() && formData.password
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      })

      if (response.ok) {
        router.push('/dashboard')
      } else {
        const data = await response.json()
        setError(data.error || 'Login failed')
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
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
            <p className="mt-2 text-gray-600">
              Welcome back to Aura CRM
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="john@company.com"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={fieldErrors.email}
              required
            />

            <div>
              <PasswordInput
                id="password"
                label="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={fieldErrors.password}
                autoComplete="current-password"
                placeholder="Enter your password"
                required
              />
              <div className="mt-2 flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={!isFormValid() || isLoading}
              className="w-full flex items-center justify-center rounded-lg bg-red-600 px-4 py-3.5 text-base font-semibold text-white shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/signup" className="font-semibold text-red-600 hover:text-red-500">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
