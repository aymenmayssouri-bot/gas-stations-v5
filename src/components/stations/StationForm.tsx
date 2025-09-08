// src/components/stations/StationForm.tsx
// Form for the normalized schema, powered by useStationForm hook

'use client';

import React, { useMemo } from 'react';
import { StationWithDetails, StationFormData } from '@/types/station';
import { useStationForm } from '@/hooks/stations/useStationForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useMarques } from '@/hooks/ReferenceData/useMarques';
import { useProvinces } from '@/hooks/ReferenceData/useProvinces';
import { useCommunes } from '@/hooks/ReferenceData/useCommunes';

export interface StationFormProps {
  mode: 'create' | 'edit';
  station?: StationWithDetails | null;
  onSaved?: () => void;
}

export function StationForm({ mode, station, onSaved }: StationFormProps) {
  const { form, updateField, submit, loading, submitting, errors, updateAutorisationField, addAutorisation, removeAutorisation } = useStationForm(mode, station || undefined);
  const { marques } = useMarques();
  const { provinces } = useProvinces();
  const selectedProvinceId = useMemo(() => {
    const p = provinces.find(p => p.NomProvince === form.Province);
    return p?.ProvinceID;
  }, [form.Province, provinces]);
  const { communes } = useCommunes(selectedProvinceId);

  // Memoized value for RaisonSociale
  const selectedMarqueRaisonSociale = useMemo(() => {
    const selectedMarque = marques.find(m => m.Marque === form.Marque);
    return selectedMarque?.RaisonSociale || '';
  }, [form.Marque, marques]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      onSaved?.();
    }
  };

  // Ensure autorisations is always an array
  const autorisations = form.autorisations ?? [];

  return (
    <form onSubmit={onSubmit} className="space-y-6 text-gray-900 station-form">
      {errors.__form && <ErrorMessage error={errors.__form} />}

      {/* General Information */}
      <fieldset className="space-y-6">
        <legend className="form.station-form fieldset .station-form-legend !text-lg !font-semibold border-b pb-2 w-full text-gray-900 !important">
          <span className="text-gray-900 !important">Informations Générales</span>
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Nom de la station" 
            name="NomStation" 
            value={form.NomStation} 
            onChange={(e) => updateField('NomStation', e.target.value)} 
            error={errors.NomStation}
          />
          <Input 
            label="Adresse" 
            name="Adresse" 
            value={form.Adresse} 
            onChange={(e) => updateField('Adresse', e.target.value)} 
            error={errors.Adresse}
          />
          <Input 
            label="Latitude" 
            name="Latitude" 
            type="number"
            step="any"
            value={form.Latitude} 
            onChange={(e) => updateField('Latitude', e.target.value)} 
            error={errors.Latitude}
          />
          <Input 
            label="Longitude" 
            name="Longitude" 
            type="number"
            step="any"
            value={form.Longitude} 
            onChange={(e) => updateField('Longitude', e.target.value)} 
            error={errors.Longitude}
          />
        </div>
      </fieldset>

      {/* Marque et Localisation */}
      <fieldset className="space-y-6">
        <legend className="form.station-form fieldset .station-form-legend !text-lg !font-semibold border-b pb-2 w-full text-gray-900 !important">
          <span className="text-gray-900 !important">Marque et Localisation</span>
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-900 mb-1">Type</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.Type}
              onChange={(e) => updateField('Type', e.target.value as StationFormData['Type'])}
            >
              <option value="service">Service</option>
              <option value="remplissage">Remplissage</option>
            </select>
            {errors.Type && <span className="text-red-600 text-xs mt-1">{errors.Type}</span>}
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-gray-900">Marque</label>
            <select
              name="Marque"
              value={form.Marque}
              onChange={(e) => {
                const selectedValue = e.target.value;
                const selectedMarque = marques.find(m => m.Marque === selectedValue);
                updateField('Marque', selectedValue);
                updateField('RaisonSociale', selectedMarque?.RaisonSociale || '');
              }}
              className="p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">-- choisir --</option>
              {marques.map((m) => (
                <option key={m.MarqueID} value={m.Marque}>
                  {m.Marque}
                </option>
              ))}
            </select>
            {errors.Marque && <ErrorMessage message={errors.Marque} />}
          </div>
          <div className="flex flex-col">
            <Input
              label="Raison Sociale"
              name="RaisonSociale"
              value={selectedMarqueRaisonSociale}
              readOnly
              disabled={true}
              className="bg-gray-100 cursor-not-allowed"
              error={errors.RaisonSociale}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-900 mb-1">Province</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.Province}
              onChange={(e) => updateField('Province', e.target.value)}
            >
              <option value="">-- choisir --</option>
              {provinces.map(p => (
                <option key={p.ProvinceID} value={p.NomProvince}>{p.NomProvince}</option>
              ))}
            </select>
            {errors.Province && <span className="text-red-600 text-xs mt-1">{errors.Province}</span>}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-900 mb-1">Commune</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.Commune}
              onChange={(e) => updateField('Commune', e.target.value)}
              disabled={!selectedProvinceId}
            >
              <option value="">-- choisir --</option>
              {communes.map(c => (
                <option key={c.CommuneID} value={c.NomCommune}>{c.NomCommune}</option>
              ))}
            </select>
            {errors.Commune && <span className="text-red-600 text-xs mt-1">{errors.Commune}</span>}
          </div>
        </div>
      </fieldset>

      {/* Gérant */}
      <fieldset className="space-y-6">
        <legend className="form.station-form fieldset .station-form-legend !text-lg !font-semibold border-b pb-2 w-full text-gray-900 !important">
          <span className="text-gray-900 !important">Gérant</span>
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Prénom du gérant" 
            name="PrenomGerant" 
            value={form.PrenomGerant} 
            onChange={(e) => updateField('PrenomGerant', e.target.value)} 
            error={errors.PrenomGerant}
          />
          <Input 
            label="Nom du gérant" 
            name="NomGerant" 
            value={form.NomGerant} 
            onChange={(e) => updateField('NomGerant', e.target.value)} 
            error={errors.NomGerant}
          />
          <Input 
            label="CIN du gérant" 
            name="CINGerant" 
            value={form.CINGerant} 
            onChange={(e) => updateField('CINGerant', e.target.value)} 
            error={errors.CINGerant}
          />
          <Input 
            label="Téléphone" 
            name="Telephone" 
            value={form.Telephone} 
            onChange={(e) => updateField('Telephone', e.target.value)} 
            error={errors.Telephone}
          />
        </div>
      </fieldset>

      {/* Propriétaire */}
      <fieldset className="space-y-6">
        <legend className="form.station-form fieldset .station-form-legend !text-lg !font-semibold border-b pb-2 w-full text-gray-900 !important">
          <span className="text-gray-900 !important">Propriétaire</span>
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-900 mb-1">Type de propriétaire</label>
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <Input 
                label="Prénom du propriétaire" 
                name="PrenomProprietaire" 
                value={form.PrenomProprietaire} 
                onChange={(e) => updateField('PrenomProprietaire', e.target.value)} 
                error={errors.PrenomProprietaire}
              />
              <Input 
                label="Nom du propriétaire" 
                name="NomProprietaire" 
                value={form.NomProprietaire} 
                onChange={(e) => updateField('NomProprietaire', e.target.value)} 
                error={errors.NomProprietaire}
              />
            </>
          ) : (
            <Input 
              label="Nom de l'entreprise (morale)" 
              name="NomEntreprise" 
              value={form.NomEntreprise} 
              onChange={(e) => updateField('NomEntreprise', e.target.value)} 
              error={errors.NomEntreprise}
            />
          )}
        </div>
      </fieldset>

      {/* Autorisations */}
      <fieldset className="space-y-6">
        <legend className="form.station-form fieldset .station-form-legend !text-lg !font-semibold border-b pb-2 w-full text-gray-900 !important">
          <span className="text-gray-900 !important">Autorisations</span>
        </legend>
        {autorisations.length > 0 ? (
          autorisations.map((auto, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md relative">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-900 mb-1">Type</label>
                <select
                  className="border border-gray-300 rounded-md px-3 py-2"
                  value={auto.TypeAutorisation}
                  onChange={(e) => updateAutorisationField(index, 'TypeAutorisation', e.target.value)}
                >
                  <option value="création">Création</option>
                  <option value="transformation">Transformation</option>
                  <option value="transfert">Transfert</option>
                  <option value="changement de marques">Changement de marques</option>
                </select>
              </div>
              <Input 
                label="Numéro" 
                value={auto.NumeroAutorisation} 
                onChange={(e) => updateAutorisationField(index, 'NumeroAutorisation', e.target.value)} 
              />
              <Input 
                type="date" 
                label="Date" 
                value={auto.DateAutorisation} 
                onChange={(e) => updateAutorisationField(index, 'DateAutorisation', e.target.value)} 
              />
              {autorisations.length > 1 && (
                <div className="flex items-end">
                  <Button type="button" variant="danger" size="sm" onClick={() => removeAutorisation(index)}>
                    Supprimer
                  </Button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">Aucune autorisation enregistrée.</p>
        )}
        <Button type="button" variant="secondary" onClick={addAutorisation}>
          Ajouter une autre autorisation
        </Button>
      </fieldset>

      {/* Capacités de Stockage */}
      <fieldset className="space-y-6">
        <legend className="form.station-form fieldset .station-form-legend !text-lg !font-semibold border-b pb-2 w-full text-gray-900 !important">
          <span className="text-gray-900 !important">Capacités de Stockage</span>
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Capacité Gasoil (L)" 
            name="CapaciteGasoil" 
            type="number"
            value={form.CapaciteGasoil} 
            onChange={(e) => updateField('CapaciteGasoil', e.target.value)} 
            error={errors.CapaciteGasoil}
          />
          <Input 
            label="Capacité SSP (L)" 
            name="CapaciteSSP" 
            type="number"
            value={form.CapaciteSSP} 
            onChange={(e) => updateField('CapaciteSSP', e.target.value)} 
            error={errors.CapaciteSSP}
          />
        </div>
      </fieldset>

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