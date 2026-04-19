'use client'

import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={props.id} className="block mb-2 text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
