// src/hooks/useStationData/useAnalyseForm.ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { Analyse } from '@/types/station';
import { useAnalyseCRUD } from '@/hooks/useStationData/useAnalyseCRUD';

type Mode = 'create' | 'edit';

interface AnalyseFormData {
  ProduitAnalyse: 'Gasoil' | 'SSP';
  DateAnalyse: string;
  CodeAnalyse: string;
  ResultatAnalyse: 'Positif' | 'Négatif';
}

export function useAnalyseForm(mode: Mode, stationId: string, analyse?: Analyse) {
  const { createAnalyse, updateAnalyse, loading, error } = useAnalyseCRUD();

  const emptyForm: AnalyseFormData = {
    ProduitAnalyse: 'Gasoil',
    DateAnalyse: '',
    CodeAnalyse: '',
    ResultatAnalyse: 'Positif',
  };

  const [form, setForm] = useState<AnalyseFormData>(emptyForm);
  const [errors, setErrors] = useState<Partial<Record<keyof AnalyseFormData | '__form', string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Load existing analyse data in edit mode
  useEffect(() => {
    if (mode === 'edit' && analyse) {
      // Ensure DateAnalyse is properly converted to string for input
      let dateString = '';
      if (analyse.DateAnalyse) {
        try {
          const date = analyse.DateAnalyse instanceof Date ? 
            analyse.DateAnalyse : 
            new Date(analyse.DateAnalyse);
          
          if (!isNaN(date.getTime())) {
            dateString = date.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Invalid date in analyse:', analyse.DateAnalyse);
        }
      }

      setForm({
        ProduitAnalyse: analyse.ProduitAnalyse || 'Gasoil',
        DateAnalyse: dateString,
        CodeAnalyse: analyse.CodeAnalyse || '',
        ResultatAnalyse: analyse.ResultatAnalyse || 'Positif',
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [mode, analyse]);

  // General field updater
  const updateField = useCallback((key: keyof AnalyseFormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when field is updated
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  }, [errors]);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof AnalyseFormData, string>> = {};

    if (!form.CodeAnalyse.trim()) {
      newErrors.CodeAnalyse = 'Code d\'analyse requis';
    }

    if (!form.ResultatAnalyse.trim()) {
      newErrors.ResultatAnalyse = 'Résultat d\'analyse requis';
    }

    if (!form.DateAnalyse) {
      newErrors.DateAnalyse = 'Date d\'analyse requise';
    } else {
      const date = new Date(form.DateAnalyse);
      if (isNaN(date.getTime())) {
        newErrors.DateAnalyse = 'Date invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Submit function
  const submit = useCallback(async (): Promise<boolean> => {
    setSubmitting(true);
    setErrors({});

    if (!validateForm()) {
      setErrors(prev => ({ ...prev, __form: 'Veuillez corriger les erreurs du formulaire.' }));
      setSubmitting(false);
      return false;
    }

    try {
      const analyseData: Omit<Analyse, 'AnalyseID'> = {
        StationID: stationId,
        ProduitAnalyse: form.ProduitAnalyse,
        DateAnalyse: new Date(form.DateAnalyse),
        CodeAnalyse: form.CodeAnalyse.trim(),
        ResultatAnalyse: form.ResultatAnalyse as 'Positif' | 'Négatif',
      };

      if (mode === 'create') {
        await createAnalyse(analyseData);
      } else if (mode === 'edit' && analyse?.AnalyseID) {
        await updateAnalyse(analyse.AnalyseID, analyseData);
      }


      
      setSubmitting(false);
      return true;
    } catch (err) {
      console.error('Error saving analyse:', err);
      setErrors({ __form: "Une erreur est survenue lors de l'enregistrement." });
      setSubmitting(false);
      return false;
    }
  }, [form, mode, stationId, analyse?.AnalyseID, createAnalyse, updateAnalyse, validateForm]);

  return {
    form,
    updateField,
    submit,
    loading,
    submitting,
    errors,
    error,
  };
}