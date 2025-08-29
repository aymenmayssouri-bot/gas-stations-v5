// src/components/stations/StationForm.tsx
// Form for the normalized schema, powered by useStationForm hook

'use client';

import React, { useMemo } from 'react';
import { StationWithDetails, StationFormData } from '@/types/station';
import { useStationForm } from '@/hooks/stations/useStationForm';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useMarques } from '@/hooks/ReferenceData/useMarques';
import { useProvinces } from '@/hooks/ReferenceData/useProvinces';
import { useCommunes } from '@/hooks/ReferenceData/useCommunes';

export interface StationFormProps {
  mode: 'create' | 'edit';
  station?: StationWithDetails | null;
  onSaved?: () => void; // <-- added
}

export function StationForm({ mode, station, onSaved }: StationFormProps) {
  const { form, updateField, submit, loading, submitting, errors } = useStationForm(mode, station || undefined);
  const { marques } = useMarques();
  const { provinces } = useProvinces();
  const selectedProvinceId = useMemo(() => {
    const p = provinces.find(p => p.Province === form.Province);
    return p?.id;
  }, [form.Province, provinces]);
  const { communes } = useCommunes(selectedProvinceId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      onSaved?.();
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {errors.__form && <ErrorMessage error={errors.__form} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Identity */}
        <Input label="Nom de la station" name="NomStation" value={form.NomStation} onChange={(e) => updateField('NomStation', e.target.value)} />
        <Input label="Adresse" name="Adresse" value={form.Adresse} onChange={(e) => updateField('Adresse', e.target.value)} />

        <Input label="Latitude" name="Latitude" value={form.Latitude} onChange={(e) => updateField('Latitude', e.target.value)} />
        <Input label="Longitude" name="Longitude" value={form.Longitude} onChange={(e) => updateField('Longitude', e.target.value)} />

        {/* Type */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Type</label>
          <select
            className="border rounded px-3 py-2"
            value={form.Type}
            onChange={(e) => updateField('Type', e.target.value as StationFormData['Type'])}
          >
            <option value="service">service</option>
            <option value="remplissage">remplissage</option>
          </select>
          {errors.Type && <span className="text-red-600 text-xs mt-1">{errors.Type}</span>}
        </div>

        {/* Marque / Raison sociale */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Marque</label>
          <select
            className="border rounded px-3 py-2"
            value={form.Marque}
            onChange={(e) => updateField('Marque', e.target.value)}
          >
            <option value="">-- choisir --</option>
            {marques.map(m => (
              <option key={m.id} value={m.Marque}>{m.Marque}</option>
            ))}
          </select>
          {errors.Marque && <span className="text-red-600 text-xs mt-1">{errors.Marque}</span>}
        </div>
        <Input label="Raison sociale" name="RaisonSociale" value={form.RaisonSociale} onChange={(e) => updateField('RaisonSociale', e.target.value)} />

        {/* Province / Commune */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Province</label>
          <select
            className="border rounded px-3 py-2"
            value={form.Province}
            onChange={(e) => updateField('Province', e.target.value)}
          >
            <option value="">-- choisir --</option>
            {provinces.map(p => (
              <option key={p.id} value={p.Province}>{p.Province}</option>
            ))}
          </select>
          {errors.Province && <span className="text-red-600 text-xs mt-1">{errors.Province}</span>}
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Commune</label>
          <select
            className="border rounded px-3 py-2"
            value={form.Commune}
            onChange={(e) => updateField('Commune', e.target.value)}
          >
            <option value="">-- choisir --</option>
            {communes.map(c => (
              <option key={c.id} value={c.Commune}>{c.Commune}</option>
            ))}
          </select>
          {errors.Commune && <span className="text-red-600 text-xs mt-1">{errors.Commune}</span>}
        </div>

        {/* Gérant */}
        <Input label="Prénom du gérant" name="PrenomGerant" value={form.PrenomGerant} onChange={(e) => updateField('PrenomGerant', e.target.value)} />
        <Input label="Nom du gérant" name="NomGerant" value={form.NomGerant} onChange={(e) => updateField('NomGerant', e.target.value)} />
        <Input label="CIN du gérant" name="CINGerant" value={form.CINGerant} onChange={(e) => updateField('CINGerant', e.target.value)} />
        <Input label="Téléphone" name="Telephone" value={form.Telephone} onChange={(e) => updateField('Telephone', e.target.value)} />

        {/* Propriétaire */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Type de propriétaire</label>
          <select
            className="border rounded px-3 py-2"
            value={form.TypeProprietaire}
            onChange={(e) => updateField('TypeProprietaire', e.target.value as StationFormData['TypeProprietaire'])}
          >
            <option value="Physique">Physique</option>
            <option value="Morale">Morale</option>
          </select>
          {errors.TypeProprietaire && <span className="text-red-600 text-xs mt-1">{errors.TypeProprietaire}</span>}
        </div>

        {form.TypeProprietaire === 'Physique' ? (
          <>
            <Input label="Prénom du propriétaire" name="PrenomProprietaire" value={form.PrenomProprietaire} onChange={(e) => updateField('PrenomProprietaire', e.target.value)} />
            <Input label="Nom du propriétaire" name="NomProprietaire" value={form.NomProprietaire} onChange={(e) => updateField('NomProprietaire', e.target.value)} />
          </>
        ) : (
          <Input label="Nom de l'entreprise (morale)" name="NomEntreprise" value={form.NomEntreprise} onChange={(e) => updateField('NomEntreprise', e.target.value)} />
        )}

        {/* Autorisation */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Type d'autorisation</label>
          <select
            className="border rounded px-3 py-2"
            value={form.TypeAutorisation}
            onChange={(e) => updateField('TypeAutorisation', e.target.value as StationFormData['TypeAutorisation'])}
          >
            <option value="création">création</option>
            <option value="transformation">transformation</option>
            <option value="transfert">transfert</option>
            <option value="changement de marques">changement de marques</option>
          </select>
          {errors.TypeAutorisation && <span className="text-red-600 text-xs mt-1">{errors.TypeAutorisation}</span>}
        </div>
        <Input label="Numéro d'autorisation" name="NumeroAutorisation" value={form.NumeroAutorisation} onChange={(e) => updateField('NumeroAutorisation', e.target.value)} />
        <Input type="date" label="Date d'autorisation" name="DateAutorisation" value={form.DateAutorisation} onChange={(e) => updateField('DateAutorisation', e.target.value)} />

        {/* Capacités */}
        <Input label="Capacité Gasoil (L)" name="CapaciteGasoil" value={form.CapaciteGasoil} onChange={(e) => updateField('CapaciteGasoil', e.target.value)} />
        <Input label="Capacité SSP (L)" name="CapaciteSSP" value={form.CapaciteSSP} onChange={(e) => updateField('CapaciteSSP', e.target.value)} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || loading}>
          {mode === 'create' ? 'Créer la station' : 'Enregistrer les modifications'}
        </Button>
        {submitting && <span className="text-sm text-gray-500">Enregistrement…</span>}
      </div>
    </form>
  );
}

export default StationForm;