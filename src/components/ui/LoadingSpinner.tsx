// LoadingSpinner.tsx
'use client';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function LoadingSpinner({ size = 'medium', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8', 
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`
        animate-spin rounded-full border-b-2 border-blue-600
        ${sizeClasses[size]}
      `} />
      <p className="mt-2 text-gray-600">Loading...</p>
    </div>
  );
}

