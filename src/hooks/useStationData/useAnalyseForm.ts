'use client';

import { useCallback, useEffect, useState } from 'react';
import { Analyse } from '@/types/station';
import { useAnalyseCRUD } from '@/hooks/useStationData/useAnalyseCRUD';

type Mode = 'create' | 'edit';

interface AnalyseFormData {
  ProduitAnalyse: 'Gasoil' | 'SSP';
  DateAnalyse: string; // Stores date as dd/mm/yyyy string
  CodeAnalyse: string;
  ResultatAnalyse: 'Positif' | 'Négatif';
}

interface Errors {
  forms: Partial<Record<keyof AnalyseFormData, string>>[];
  __form?: string;
}

export function useAnalyseForm(mode: Mode, stationId: string, initialAnalyses: Analyse[] = []) {
  const { createAnalyse, updateAnalyse, deleteAnalyse: deleteAnalyseMutation, loading, error } = useAnalyseCRUD();

  const emptyForm: AnalyseFormData = {
    ProduitAnalyse: 'Gasoil',
    DateAnalyse: '',
    CodeAnalyse: '',
    ResultatAnalyse: 'Positif',
  };

  const [forms, setForms] = useState<AnalyseFormData[]>([emptyForm]);
  const [errors, setErrors] = useState<Errors>({ forms: [{}] });
  const [submitting, setSubmitting] = useState(false);

  // Load existing analyse data in edit mode or initialize with provided analyses
  useEffect(() => {
    if (mode === 'edit' && initialAnalyses.length > 0) {
      const formattedForms = initialAnalyses.map(analyse => {
        let dateString = '';
        if (analyse.DateAnalyse) {
          try {
            const date = analyse.DateAnalyse instanceof Date
              ? analyse.DateAnalyse
              : new Date(analyse.DateAnalyse);
            if (!isNaN(date.getTime())) {
              dateString = date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });
            }
          } catch (err) {
            console.warn('Invalid date in analyse:', analyse.DateAnalyse);
          }
        }

        return {
          ProduitAnalyse: analyse.ProduitAnalyse || 'Gasoil',
          DateAnalyse: dateString,
          CodeAnalyse: analyse.CodeAnalyse || '',
          ResultatAnalyse: analyse.ResultatAnalyse || 'Positif',
        };
      });
      setForms(formattedForms);
      setErrors({ forms: Array(formattedForms.length).fill({}) });
    } else {
      setForms([emptyForm]);
      setErrors({ forms: [{}] });
    }
  }, [mode, initialAnalyses]);

  // Add a new empty form
  const addForm = useCallback(() => {
    setForms(prev => [...prev, emptyForm]);
    setErrors(prev => ({ ...prev, forms: [...prev.forms, {}] }));
  }, []);

  // Remove a form by index
  const removeForm = useCallback((index: number) => {
    setForms(prev => prev.filter((_, i) => i !== index));
    setErrors(prev => ({
      ...prev,
      forms: prev.forms.filter((_, i) => i !== index),
    }));
  }, []);

  // Update field in a specific form
  const updateField = useCallback((index: number, key: keyof AnalyseFormData, value: string) => {
    setForms(prev => {
      const newForms = [...prev];
      newForms[index] = { ...newForms[index], [key]: value };
      return newForms;
    });
    setErrors(prev => {
      const newFormsErrors = [...prev.forms];
      newFormsErrors[index] = { ...newFormsErrors[index], [key]: undefined };
      return { ...prev, forms: newFormsErrors };
    });
  }, []);

  // Validate all forms
  const validateForm = useCallback((): boolean => {
    const newErrors: Errors = { forms: forms.map(() => ({})) };
    let isValid = true;

    forms.forEach((form, index) => {
      if (!form.CodeAnalyse.trim()) {
        newErrors.forms[index].CodeAnalyse = "Code d'analyse requis";
        isValid = false;
      }

      if (!form.ResultatAnalyse.trim()) {
        newErrors.forms[index].ResultatAnalyse = "Résultat d'analyse requis";
        isValid = false;
      }

      if (!form.DateAnalyse) {
        newErrors.forms[index].DateAnalyse = "Date d'analyse requise";
        isValid = false;
      } else {
        const [day, month, year] = form.DateAnalyse.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        if (
          isNaN(date.getTime()) ||
          date.getDate() !== day ||
          date.getMonth() !== month - 1 ||
          date.getFullYear() !== year
        ) {
          newErrors.forms[index].DateAnalyse = 'Date invalide (format: jj/mm/aaaa)';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [forms]);

  // Submit all forms
  const submit = useCallback(async (): Promise<boolean> => {
    setSubmitting(true);
    setErrors({ forms: forms.map(() => ({})) });

    if (!validateForm()) {
      setErrors(prev => ({ ...prev, __form: 'Veuillez corriger les erreurs du formulaire.' }));
      setSubmitting(false);
      return false;
    }

    try {
      for (let i = 0; i < forms.length; i++) {
        const form = forms[i];
        const [day, month, year] = form.DateAnalyse.split('/').map(Number);
        const date = new Date(year, month - 1, day);

        const analyseData: Omit<Analyse, 'AnalyseID'> = {
          StationID: stationId,
          ProduitAnalyse: form.ProduitAnalyse,
          DateAnalyse: date,
          CodeAnalyse: form.CodeAnalyse.trim(),
          ResultatAnalyse: form.ResultatAnalyse as 'Positif' | 'Négatif',
        };

        if (mode === 'create') {
          await createAnalyse(analyseData);
        } else if (mode === 'edit' && initialAnalyses[i]?.AnalyseID) {
          await updateAnalyse(initialAnalyses[i].AnalyseID, analyseData);
        }
      }

      setSubmitting(false);
      return true;
    } catch (err) {
      console.error('Error saving analyses:', err);
      setErrors({ forms: forms.map(() => ({})), __form: "Une erreur est survenue lors de l'enregistrement." });
      setSubmitting(false);
      return false;
    }
  }, [forms, mode, stationId, initialAnalyses, createAnalyse, updateAnalyse, validateForm]);

  return {
    forms,
    addForm,
    removeForm,
    updateField,
    submit,
    deleteAnalyse: async (analyseId: string) => {
      return await deleteAnalyseMutation(analyseId);
    },
    loading,
    submitting,
    errors,
    error,
  };
}