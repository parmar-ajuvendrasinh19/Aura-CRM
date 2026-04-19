'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Input from './Input'

interface PasswordInputProps {
  label?: string
  error?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  name?: string
  id?: string
  required?: boolean
  autoComplete?: string
  placeholder?: string
}

export default function PasswordInput({
  label,
  error,
  value,
  onChange,
  name,
  id,
  required,
  autoComplete,
  placeholder,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className={`w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm pr-12 ${error ? 'border-red-500' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
