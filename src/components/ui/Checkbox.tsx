import React from 'react';

export type CheckboxProps = {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
};

export function Checkbox({ id, checked, onCheckedChange, children }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center space-x-2 cursor-pointer">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
      />
      {children && <span className="text-sm text-gray-700">{children}</span>}
    </label>
  );
}
