// src/components/ui/Input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, value, ...props }, ref) => {
    // Ensure value is always defined to prevent controlled/uncontrolled switches
    const safeValue = type === 'number' ? (value ?? '0') : (value ?? '');

    return (
      <div className="flex flex-col">
        {label && (
          <label className="text-sm font-medium text-gray-900 mb-1">
            {label}
          </label>
        )}
        <input
          type={type}
          value={safeValue}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-red-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };