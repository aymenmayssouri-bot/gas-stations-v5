// src/components/stations/AnalyseForm.tsx
'use client';

import React from 'react';
import { Analyse } from '@/types/station';
import { useAnalyseForm } from '@/hooks/useStationData/useAnalyseForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export interface AnalyseFormProps {
  mode: 'create' | 'edit';
  stationId: string;
  analyse?: Analyse | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function AnalyseForm({ mode, stationId, analyse, onSaved, onCancel }: AnalyseFormProps) {
  const { form, updateField, submit, loading, submitting, errors, error } = useAnalyseForm(
    mode,
    stationId,
    analyse || undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submit();
    if (success) {
      onSaved?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
      {error && <ErrorMessage message={error} />}
      {errors.__form && <ErrorMessage message={errors.__form} />}

      <fieldset className="space-y-6">
        {/* Remove legend since the title is already in the modal header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Produit Analyse */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-900 mb-1">Produit Analysé</label>
            <select
              value={form.ProduitAnalyse}
              onChange={(e) => updateField('ProduitAnalyse', e.target.value as 'Gasoil' | 'SSP')}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Gasoil">Gasoil</option>
              <option value="SSP">SSP</option>
            </select>
          </div>

          {/* Date Analyse */}
          <Input
            label="Date d'Analyse"
            type="date"
            value={form.DateAnalyse}
            onChange={(e) => updateField('DateAnalyse', e.target.value)}
            error={errors.DateAnalyse}
            required
          />

          {/* Code Analyse */}
          <Input
            label="Code d'Analyse"
            value={form.CodeAnalyse}
            onChange={(e) => updateField('CodeAnalyse', e.target.value)}
            error={errors.CodeAnalyse}
            placeholder="Ex: AN2024001"
            required
          />

          {/* Resultat Analyse */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-900 mb-1">Résultat d'Analyse</label>
            <select
              value={form.ResultatAnalyse}
              onChange={(e) => updateField('ResultatAnalyse', e.target.value as 'Positive' | 'Négative')}
              className="border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">-- Sélectionner --</option>
              <option value="Positif">Positif</option>
              <option value="Négatif">Négatif</option>
            </select>
            {errors.ResultatAnalyse && <span className="text-red-500 text-sm">{errors.ResultatAnalyse}</span>}
          </div>
        </div>
      </fieldset>

      {/* Form Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || loading}>
          {mode === 'create' ? 'Créer l\'Analyse' : 'Enregistrer les Modifications'}
        </Button>
        
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
        )}
        
        {submitting && <span className="text-sm text-gray-500">Enregistrement…</span>}
      </div>
    </form>
  );
}

export default AnalyseForm;