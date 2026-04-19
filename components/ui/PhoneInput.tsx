'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface PhoneInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  countryCode?: string
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, countryCode = '+91', className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block mb-2 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="flex">
          <span className="inline-flex items-center px-4 py-3 text-base font-medium text-gray-700 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
            {countryCode}
          </span>
          <input
            ref={ref}
            className={`flex-1 px-4 py-3 text-base border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export default PhoneInput
