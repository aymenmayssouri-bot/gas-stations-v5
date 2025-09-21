// src/hooks/stations/useStationForm.ts
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

  const empty: StationFormData = useMemo(
    () => ({
      NomStation: '',
      Adresse: '',
      Latitude: '0', // Changed to '0' for number input
      Longitude: '0', // Changed to '0' for number input
      Type: 'service',
      Marque: '',
      RaisonSociale: '',
      Commune: '',
      Province: '',
      PrenomGerant: '',
      NomGerant: '',
      CINGerant: '',
      Telephone: '',
      TypeProprietaire: 'Physique',
      PrenomProprietaire: '',
      NomProprietaire: '',
      NomEntreprise: '',
      autorisations: [{ TypeAutorisation: 'création', NumeroAutorisation: '', DateAutorisation: '' }],
      CapaciteGasoil: '0', // Changed to '0' for number input
      CapaciteSSP: '0', // Changed to '0' for number input
      TypeGerance: 'libre',
      Statut: 'en activité',
      Commentaires: '', // Changed from Commentaire to Commentaires
      NombreVolucompteur: '0' // Changed to '0' for number input
    }),
    []
  );

  const [form, setForm] = useState<StationFormData>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof StationFormData | '__form', string>>>({});
  const [submitting, setSubmitting] = useState(false);

  const loading = creating || updating;
  const error = createError || updateError;

  useEffect(() => {
    setForm(station ? stationWithDetailsToFormData(station) : empty);
    setErrors({});
  }, [station, empty]);

  // General field updater
  const updateField = useCallback((key: keyof StationFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Specific handler for updating an autorisation in the array
  const updateAutorisationField = useCallback(
    (index: number, key: 'TypeAutorisation' | 'NumeroAutorisation' | 'DateAutorisation', value: string) => {
      setForm((prev) => {
        const newAutorisations = [...prev.autorisations];
        newAutorisations[index] = { ...newAutorisations[index], [key]: value };
        return { ...prev, autorisations: newAutorisations };
      });
    },
    []
  );

  // Add a new autorisation entry
  const addAutorisation = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      autorisations: [...prev.autorisations, { TypeAutorisation: 'création', NumeroAutorisation: '', DateAutorisation: '' }]
    }));
  }, []);

  // Remove an autorisation entry by its index
  const removeAutorisation = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      autorisations: prev.autorisations.filter((_, i) => i !== index)
    }));
  }, []);

  const submit = useCallback(async () => {
    setSubmitting(true);
    setErrors({});
    const { isValid, errors: fieldErrors } = validateStationData(form);

    if (!isValid) {
      setErrors({ ...fieldErrors, __form: 'Veuillez corriger les erreurs du formulaire.' });
      setSubmitting(false);
      return false;
    }

    try {
      if (mode === 'create') {
        await createStation(form);
      } else if (mode === 'edit' && station?.station.StationID) {
        await updateStation(station.station.StationID, form);
      }
      setSubmitting(false);
      return true;
    } catch (err) {
      console.error(err);
      setErrors({ __form: "Une erreur est survenue lors de l'enregistrement." });
      setSubmitting(false);
      return false;
    }
  }, [form, mode, station?.station.StationID, createStation, updateStation]);

  return { form, updateField, submit, loading, submitting, errors, error, updateAutorisationField, addAutorisation, removeAutorisation };
}