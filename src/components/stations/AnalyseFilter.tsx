// src/components/stations/AnalyseFilter.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectYearDropdownProps {
  selectedYears: number[];
  onYearsChange: (years: number[]) => void;
  yearOptions: number[];
  disabled?: boolean;
  className?: string;
}

export const MultiSelectYearDropdown: React.FC<MultiSelectYearDropdownProps> = ({
  selectedYears,
  onYearsChange,
  yearOptions,
  disabled = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      onYearsChange(selectedYears.filter(y => y !== year));
    } else {
      onYearsChange([...selectedYears, year].sort((a, b) => b - a));
    }
  };

  const removeYear = (year: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onYearsChange(selectedYears.filter(y => y !== year));
  };

  const getDisplayText = () => {
    if (selectedYears.length === 0) {
      return yearOptions[0]?.toString() || ''; // Show first year or empty string
    }
    if (selectedYears.length === 1) {
      return selectedYears[0].toString();
    }
    return `${selectedYears.length} années sélectionnées`;
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-[200px] px-3 py-1.5 text-left border rounded text-sm
          flex items-center justify-between bg-white
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}
          ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-300'}
        `}
      >
        <div className="flex items-center gap-1 flex-1 min-w-0">
          {selectedYears.length > 0 && selectedYears.length <= 3 ? (
            <div className="flex flex-wrap gap-1">
              {selectedYears.map(year => (
                <span
                  key={year}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                >
                  {year}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-blue-600" 
                    onClick={(e) => removeYear(year, e)}
                  />
                </span>
              ))}
            </div>
          ) : (
            <span className={selectedYears.length === 0 ? 'text-gray-500' : ''}>
              {getDisplayText()}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            <div className="p-1">
              {yearOptions.map(year => {
                const isSelected = selectedYears.includes(year);
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => toggleYear(year)}
                    className={`
                      w-full text-left px-3 py-2 text-sm flex items-center justify-between
                      hover:bg-gray-100 rounded
                      ${isSelected ? 'bg-blue-50 text-blue-700' : ''}
                    `}
                  >
                    <span>{year}</span>
                    {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};