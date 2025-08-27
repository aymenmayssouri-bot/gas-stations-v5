'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { GasStation, GasStationFormData } from '@/types/station';
import { stationToFormData } from '@/lib/utils/stationTransformers';
import { validateStationData } from '@/lib/validations/stationValidation';
import { useStationCRUD } from '@/hooks/useStationCRUD';

type Mode = 'create' | 'edit';

export function useStationForm(mode: Mode, station?: GasStation) {
  const { createStation, updateStation } = useStationCRUD();

  // Provide a fully-typed, empty form model
  const empty: GasStationFormData = useMemo(
    () => ({
      'Raison sociale': '',
      'Marque': '',
      'Nom de Station': '',
      'Propriétaire': '',
      'Gérant': '',
      'CIN Gérant': '',
      'Adesse': '',
      'Latitude': '',
      'Longitude': '',
      'Commune': '',
      'Province': '',
      'Type': 'service',
      'Type Autorisation': 'création',
      'Date Creation': '',
      'numéro de création': '',
      'Date Mise en service': '',
      'numéro de Mise en service': '',
      'Capacité Gasoil': '',
      'Capacité SSP': '',
      'numéro de Téléphone': '',
    }),
    []
  );

  const [form, setForm] = useState<GasStationFormData>(
    station ? stationToFormData(station) : empty
  );
  const [errors, setErrors] = useState<Partial<Record<keyof GasStationFormData | 'submit' | '__form', string>>>({});
  const [submitting, setSubmitting] = useState(false);

  // Reset when switching record
  useEffect(() => {
    setForm(station ? stationToFormData(station) : empty);
    setErrors({});
  }, [station, empty]);

  const updateField = useCallback(
    (key: keyof GasStationFormData, value: string) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const submit = useCallback(async () => {
    setSubmitting(true);
    setErrors({});

    // ✅ Your validator expects GasStationFormData *only one argument*
    const { isValid, errors: fieldErrors } = validateStationData(form);

    if (!isValid) {
      // fieldErrors is a Record<keyof GasStationFormData | 'submit', string>
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
        await createStation(form); // your CRUD will transform for Firestore
      } else if (mode === 'edit' && station?.id) {
        await updateStation(station.id, form);
      }
      setSubmitting(false);
      return true;
    } catch (err) {
      console.error(err);
      setErrors({
        __form: "Une erreur est survenue lors de l'enregistrement de la station.",
      });
      setSubmitting(false);
      return false;
    }
  }, [form, mode, station, createStation, updateStation]);

  return {
    form,
    errors,
    submitting,
    updateField,
    submit,
    setForm,
  };
}