'use client';

import React from 'react';

interface CityFilterProps {
  communes: string[];
  selected: string[];
  onCommuneChange: (commune: string, checked: boolean) => void;
  onAllChange: (checked: boolean) => void;
}

export default function CityFilters({ communes, selected, onCommuneChange, onAllChange }: CityFilterProps) {
  const isAll = selected.length === communes.length;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isAll} onChange={(e) => onAllChange(e.target.checked)} />
        <span>Tout sélectionner</span>
      </label>
      <div className="max-h-64 overflow-auto space-y-1">
        {communes.map((c) => (
          <label key={c} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.includes(c)}
              onChange={(e) => onCommuneChange(c, e.target.checked)}
            />
            <span>{c}</span>
          </label>
        ))}
      </div>
    </div>
  );
}