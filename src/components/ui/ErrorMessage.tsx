// src/components/ui/ErrorMessage.tsx
import React from 'react';

export type ErrorMessageProps = {
  message?: string;
  error?: string;
  onRetry?: () => void;
};

export function ErrorMessage({ message, error, onRetry }: ErrorMessageProps) {
  const errorText = message || error || 'An error occurred';

  return (
    <div className="text-red-600 text-sm p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-center justify-between">
        <span>{errorText}</span>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="ml-4 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}