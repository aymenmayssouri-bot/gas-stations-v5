'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}: InputProps) {
  const inputId = props.id || props.name;
  
  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="h-5 w-5 text-gray-400">
              {leftIcon}
            </div>
          </div>
        )}
        
        {/* Input */}
        <input
          {...props}
          id={inputId}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error 
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }
            ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
          `}
        />
        
        {/* Right Icon */}
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="h-5 w-5 text-gray-400">
              {rightIcon}
            </div>
          </div>
        )}
      </div>
      
      {/* Helper Text or Error */}
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${
          error ? 'text-red-600' : 'text-gray-500'
        }`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}