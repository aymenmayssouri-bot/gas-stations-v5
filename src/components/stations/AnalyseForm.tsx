'use client';

import React, { useCallback } from 'react';
import { Analyse } from '@/types/station';
import { useAnalyseForm } from '@/hooks/useStationData/useAnalyseForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatDateForInput } from '@/utils/format';

export interface AnalyseFormProps {
  mode: 'create' | 'edit';
  stationId: string;
  stationCode: string; // New prop for station code
  analyse?: Analyse | null; // Kept for backward compatibility but not used
  initialAnalyses?: Analyse[];
  onSaved?: () => void;
  onCancel?: () => void;
}

export function AnalyseForm({ mode, stationId, stationCode, initialAnalyses = [], onSaved, onCancel }: AnalyseFormProps) {
  const { forms, addForm, removeForm, updateField, submit, deleteAnalyse, loading, submitting, errors, error } = useAnalyseForm(
    mode,
    stationId,
    initialAnalyses
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await submit();
      if (success) {
        onSaved?.();
      }
    } catch (error) {
      // Optional: handle error case
      console.error('Failed to submit:', error);
    }
  };

  const handleDelete = async () => {
    if (mode === 'edit' && initialAnalyses[0]?.AnalyseID) {
      if (confirm("Êtes-vous sûr de vouloir supprimer cette analyse ?")) {
        try {
          const success = await deleteAnalyse(initialAnalyses[0].AnalyseID);
          if (success) {
            onSaved?.();
          }
        } catch (error) {
          console.error('Failed to delete analyse:', error);
        }
      }
    }
  };

  const handleAddAnalyse = () => {
    if (forms.length < 2) {
      addForm();
    }
  };

  const handleRemoveAnalyse = (index: number) => {
    removeForm(index);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-gray-900">
      <h2 className="text-lg font-medium text-gray-900">
        Analyse Form: Station - {stationCode}
      </h2>
      {error && <ErrorMessage message={error} />}
      {errors.__form && <ErrorMessage message={errors.__form} />}

      {forms.map((form, index) => (
        <fieldset key={index} className="space-y-6 border-b pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Produit Analyse */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-900 mb-1">Produit Analysé</label>
              <select
                value={form.ProduitAnalyse}
                onChange={(e) => updateField(index, 'ProduitAnalyse', e.target.value as 'Gasoil' | 'SSP')}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Gasoil">Gasoil</option>
                <option value="SSP">SSP</option>
              </select>
            </div>

            {/* Date Analyse */}
            <Input
              label="Date d'Analyse (dd/mm/yyyy)"
              type="text"
              value={formatDateForInput(form.DateAnalyse ? new Date(form.DateAnalyse) : null)}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 10) {
                  let formattedValue = value.replace(/\D/g, '');
                  if (formattedValue.length > 2) {
                    formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
                  }
                  if (formattedValue.length > 5) {
                    formattedValue = formattedValue.slice(0, 5) + '/' + formattedValue.slice(5);
                  }
                  updateField(index, 'DateAnalyse', formattedValue);
                }
              }}
              placeholder="JJ/MM/AAAA"
              error={errors.forms?.[index]?.DateAnalyse}
              required
            />

            {/* Code Analyse */}
            <Input
              label="Code d'Analyse"
              value={form.CodeAnalyse}
              onChange={(e) => updateField(index, 'CodeAnalyse', e.target.value)}
              error={errors.forms?.[index]?.CodeAnalyse}
              placeholder="Ex: AN2024001"
              required
            />

            {/* Resultat Analyse */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-900 mb-1">Résultat d'Analyse</label>
              <select
                value={form.ResultatAnalyse}
                onChange={(e) => updateField(index, 'ResultatAnalyse', e.target.value as 'Positif' | 'Négatif')}
                className="border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">-- Sélectionner --</option>
                <option value="Positif">Positif</option>
                <option value="Négatif">Négatif</option>
              </select>
              {errors.forms?.[index]?.ResultatAnalyse && (
                <span className="text-red-500 text-sm">{errors.forms[index].ResultatAnalyse}</span>
              )}
            </div>
          </div>

          {forms.length > 1 && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => handleRemoveAnalyse(index)}
            >
              Supprimer cette analyse
            </Button>
          )}
        </fieldset>
      ))}

      {forms.length < 2 && mode === 'create' && (
        <Button type="button" variant="secondary" onClick={handleAddAnalyse}>
          Ajouter une analyse
        </Button>
      )}

      {/* Form Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || loading}>
          {mode === 'edit' ? "Modifier l'Analyse" : forms.length > 1 ? "Créer les Analyses" : "Créer l'Analyse"}
        </Button>

        {mode === 'edit' && initialAnalyses[0]?.AnalyseID && (
          <Button type="button" variant="destructive" onClick={handleDelete}>
            Supprimer l'Analyse
          </Button>
        )}
        
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