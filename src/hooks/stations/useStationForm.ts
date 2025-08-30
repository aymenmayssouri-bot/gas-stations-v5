// src/hooks/stations/useStationForm.ts
// Form hook for the normalized station structure

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { StationWithDetails, StationFormData } from '@/types/station';
import { stationWithDetailsToFormData } from '@/utils/stationFormUtils';
import { validateStationData } from '@/lib/validations/stationValidation';
import { useCreateStation } from '@/hooks/stations/useCreateStation';
import { useUpdateStation } from '@/hooks/stations/useUpdateStation';

type Mode = 'create' | 'edit';

export function useStationForm(mode: Mode, station?: StationWithDetails) {
  const { createStation, loading: creating, error: createError } = useCreateStation();
  const { updateStation, loading: updating, error: updateError } = useUpdateStation();

  // Provide a fully-typed, empty form model - FIXED
  const empty: StationFormData = useMemo(
    () => ({
      NomStation: '',
      Adresse: '',
      Latitude: '',
      Longitude: '',
      Type: 'service',
      
      // Marque fields
      Marque: '',
      RaisonSociale: '',
      
      // Location fields
      Commune: '',
      Province: '',
      
      // Manager fields - FIX: Use separate first/last name fields
      PrenomGerant: '',
      NomGerant: '',
      CINGerant: '',
      Telephone: '',

      // Owner fields - FIX: Add missing PrenomProprietaire
      TypeProprietaire: 'Physique',
      PrenomProprietaire: '',
      NomProprietaire: '',
      NomEntreprise: '',

      // Authorization fields
      TypeAutorisation: 'création',
      NumeroAutorisation: '',
      DateAutorisation: '',

      // Capacity fields
      CapaciteGasoil: '',
      CapaciteSSP: '',
    }),
    []
  );

  const [form, setForm] = useState<StationFormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof StationFormData | '__form', string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Combine loading and error states from CRUD hooks
  const loading = creating || updating;
  const error = createError || updateError;

  // Reset form when switching between create and edit mode, or when the station object changes
  useEffect(() => {
    setForm(station ? stationWithDetailsToFormData(station) : empty);
    setErrors({});
  }, [station, empty]);

  const updateField = useCallback(
    (key: keyof StationFormData, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const submit = useCallback(async () => {
    setSubmitting(true);
    setErrors({});

    const { isValid, errors: fieldErrors } = validateStationData(form);

    if (!isValid) {
      const combinedMessage = Object.values(fieldErrors ?? {})
        .filter(Boolean)
        .join('\n');

      setErrors({
        ...fieldErrors,
        __form: combinedMessage || 'Veuillez corriger les erreurs du formulaire.',
      });
      setSubmitting(false);
      return false;
    }

    try {
      if (mode === 'create') {
        await createStation(form);
      } else if (mode === 'edit' && station?.station.id) {
        await updateStation(station.station.id, form);
      }
      setSubmitting(false);
      return true;
    } catch (err) {
      console.error(err);
      setErrors({
        __form: "Une erreur est survenue lors de l'enregistrement.",
      });
      setSubmitting(false);
      return false;
    }
  }, [form, mode, station?.station.id, createStation, updateStation]);

  return { form, updateField, submit, loading, submitting, errors, error };
}