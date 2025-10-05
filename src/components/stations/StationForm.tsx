// src/components/stations/StationForm.tsx
'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { StationWithDetails, StationFormData } from '@/types/station';
import { useStationForm } from '@/hooks/stations/useStationForm';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useMarques } from '@/hooks/ReferenceData/useMarques';
import { useProvinces } from '@/hooks/ReferenceData/useProvinces';
import { useCommunes } from '@/hooks/ReferenceData/useCommunes';
import { useGerants } from '@/hooks/ReferenceData/useGerants';
import { useProprietaires } from '@/hooks/ReferenceData/useProprietaires';

export interface StationFormProps {
  mode: 'create' | 'edit';
  station?: StationWithDetails | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

// Reusable Select component with consistent styling
const Select: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string; id?: string }[];
  error?: string;
  disabled?: boolean;
  name?: string;
}> = ({ label, value, onChange, options, error, disabled, name }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-900 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
    >
      {options.map((opt, idx) => (
        <option key={opt.id || `${opt.value}-${idx}`} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <span className="text-red-600 text-xs mt-1">{error}</span>}
  </div>
);

// Autocomplete Input Component
const AutocompleteInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (item: any) => void;
  suggestions: any[];
  getSuggestionText: (item: any) => string;
  error?: string;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
}> = ({ 
  label, 
  value, 
  onChange, 
  onSelect, 
  suggestions, 
  getSuggestionText, 
  error, 
  name,
  placeholder,
  disabled,
  readOnly 
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);

  useEffect(() => {
    if (value.trim() && showSuggestions) {
      const filtered = suggestions.filter((item) =>
        getSuggestionText(item).toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [value, showSuggestions, suggestions, getSuggestionText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowSuggestions(true);
  };

  const handleSelect = (item: any) => {
    onSelect(item);
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col relative">
      <label className="text-sm font-medium text-gray-900 mb-1">{label}</label>
      <input
        name={name}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      />
      {error && <span className="text-sm text-red-500 mt-1">{error}</span>}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
          {filteredSuggestions.map((item, index) => (
            <li
              key={index}
              onMouseDown={() => handleSelect(item)}
              className="cursor-pointer px-3 py-2 hover:bg-gray-100 text-sm"
            >
              {getSuggestionText(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export function StationForm({ mode, station, onSaved, onCancel }: StationFormProps) {
  const { 
    form, 
    updateField, 
    submit, 
    loading, 
    submitting, 
    errors, 
    updateAutorisationField, 
    addAutorisation, 
    removeAutorisation 
  } = useStationForm(mode, station || undefined);
  
  const { marques } = useMarques();
  const { provinces } = useProvinces();
  const { gerants } = useGerants();
  const { proprietaires } = useProprietaires();

  const selectedProvinceId = useMemo(() => {
    const p = provinces.find(p => p.NomProvince === form.Province);
    return p?.ProvinceID;
  }, [form.Province, provinces]);

  const { communes } = useCommunes(selectedProvinceId);

  const selectedMarqueRaisonSociale = useMemo(() => {
    const selectedMarque = marques.find(m => m.Marque === form.Marque);
    return selectedMarque?.RaisonSociale || '';
  }, [form.Marque, marques]);

  const autorisations = form.autorisations ?? [];

  // Get available autorisation types based on already selected types
  const getAvailableAutorisationTypes = useCallback((currentIndex: number) => {
    const selectedTypes = autorisations
      .map((a, idx) => idx !== currentIndex ? a.TypeAutorisation : null)
      .filter(Boolean);

    const allTypes: Array<'création' | 'mise en service'> = ['création', 'mise en service'];
    return allTypes.filter(type => !selectedTypes.includes(type));
  }, [autorisations]);

  // Handle autorisation type change with automatic adjustment
  const handleAutorisationTypeChange = useCallback((index: number, newType: 'création' | 'mise en service') => {
    updateAutorisationField(index, 'TypeAutorisation', newType);

    // If there's another autorisation, update it to the opposite type
    autorisations.forEach((auto, idx) => {
      if (idx !== index) {
        const oppositeType = newType === 'création' ? 'mise en service' : 'création';
        updateAutorisationField(idx, 'TypeAutorisation', oppositeType);
      }
    });
  }, [autorisations, updateAutorisationField]);

  // Handle adding autorisation - automatically set to opposite type
  const handleAddAutorisation = useCallback(() => {
    // Check what type is already used
    const existingType = autorisations[0]?.TypeAutorisation;
    const newType = existingType === 'création' ? 'mise en service' : 'création';
    
    // Add the autorisation with the opposite type
    addAutorisation();
    
    // Set the new autorisation to the opposite type after a brief delay
    // to ensure the new autorisation is added to the form state
    setTimeout(() => {
      updateAutorisationField(autorisations.length, 'TypeAutorisation', newType);
    }, 0);
  }, [autorisations, addAutorisation, updateAutorisationField]);

  // Handle gérant autocomplete selection
  const handleGerantSelect = useCallback((gerant: any) => {
    updateField('PrenomGerant', gerant.PrenomGerant || '');
    updateField('NomGerant', gerant.NomGerant || '');
    updateField('CINGerant', gerant.CINGerant || '');
    updateField('Telephone', gerant.Telephone || '');
  }, [updateField]);

  // Handle proprietaire autocomplete selection
  const handleProprietaireSelect = useCallback((prop: any) => {
    if (prop.TypeProprietaire === 'Physique') {
      updateField('TypeProprietaire', 'Physique');
      updateField('PrenomProprietaire', prop.details?.PrenomProprietaire || '');
      updateField('NomProprietaire', prop.details?.NomProprietaire || '');
      updateField('NomEntreprise', '');
    } else {
      updateField('TypeProprietaire', 'Morale');
      updateField('NomEntreprise', prop.details?.NomEntreprise || '');
      updateField('PrenomProprietaire', '');
      updateField('NomProprietaire', '');
    }
  }, [updateField]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok) {
      onSaved?.();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Filter proprietaires by type
  const filteredProprietaires = useMemo(() => {
    return proprietaires.filter(p => p.TypeProprietaire === form.TypeProprietaire);
  }, [proprietaires, form.TypeProprietaire]);

  // Create options with unique IDs for communes to avoid duplicate key warnings
  const communeOptions = useMemo(() => {
    return [
      { value: '', label: '-- choisir --', id: 'commune-empty' },
      ...communes.map((c, idx) => ({ 
        value: c.NomCommune, 
        label: c.NomCommune,
        id: c.CommuneID || `commune-${idx}` 
      }))
    ];
  }, [communes]);

  return (
    <form onSubmit={onSubmit} className="space-y-6 text-gray-900 station-form">
      {errors.__form && <ErrorMessage error={errors.__form} />}

      {/* General Information */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold border-b pb-2 w-full text-gray-900">
          Informations Générales
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nom de la station"
            name="NomStation"
            value={form.NomStation || ''}
            onChange={(e) => updateField('NomStation', e.target.value)}
            error={errors.NomStation}
          />
          <Input
            label="Adresse"
            name="Adresse"
            value={form.Adresse || ''}
            onChange={(e) => updateField('Adresse', e.target.value)}
            error={errors.Adresse}
          />
          <Input
            label="Latitude"
            name="Latitude"
            type="number"
            step="any"
            value={form.Latitude || '0'}
            onChange={(e) => updateField('Latitude', e.target.value)}
            error={errors.Latitude}
          />
          <Input
            label="Longitude"
            name="Longitude"
            type="number"
            step="any"
            value={form.Longitude || '0'}
            onChange={(e) => updateField('Longitude', e.target.value)}
            error={errors.Longitude}
          />
          <Select
            label="Type de Gérance"
            value={form.TypeGerance || 'libre'}
            onChange={(e) => updateField('TypeGerance', e.target.value)}
            options={[
              { value: 'libre', label: 'Libre', id: 'gerance-libre' },
              { value: 'direct', label: 'Direct', id: 'gerance-direct' },
              { value: 'partenariat', label: 'Partenariat', id: 'gerance-partenariat' }
            ]}
          />
          <Select
            label="Statut"
            value={form.Statut || 'en activité'}
            onChange={(e) => updateField('Statut', e.target.value)}
            options={[
              { value: 'en activité', label: 'En activité', id: 'statut-activite' },
              { value: 'en projet', label: 'En projet', id: 'statut-projet' },
              { value: 'en arrêt', label: 'En arrêt', id: 'statut-arret' },
              { value: 'archivé', label: 'Archivé', id: 'statut-archive' }
            ]}
          />
          <Textarea
            label="Commentaires"
            name="Commentaires"
            value={form.Commentaires || ''}
            onChange={(e) => updateField('Commentaires', e.target.value)}
            error={errors.Commentaires}
            rows={4}
          />
          <Input
            label="Nombre Volucompteur"
            name="NombreVolucompteur"
            type="number"
            min="0"
            value={form.NombreVolucompteur || '0'}
            onChange={(e) => updateField('NombreVolucompteur', e.target.value)}
            error={errors.NombreVolucompteur}
          />
        </div>
      </fieldset>

      {/* Marque et Localisation */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold border-b pb-2 w-full text-gray-900">
          Marque et Localisation
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Type de station"
            name="Type"
            value={form.Type || 'service'}
            onChange={(e) => updateField('Type', e.target.value as StationFormData['Type'])}
            options={[
              { value: 'service', label: 'Service', id: 'type-service' },
              { value: 'remplissage', label: 'Remplissage', id: 'type-remplissage' }
            ]}
            error={errors.Type}
          />
          <Select
            label="Marque"
            name="Marque"
            value={form.Marque || ''}
            onChange={(e) => {
              const selectedValue = e.target.value;
              const selectedMarque = marques.find(m => m.Marque === selectedValue);
              updateField('Marque', selectedValue);
              updateField('RaisonSociale', selectedMarque?.RaisonSociale || '');
            }}
            options={[
              { value: '', label: '-- choisir --', id: 'marque-empty' },
              ...marques.map(m => ({ 
                value: m.Marque, 
                label: m.Marque,
                id: m.MarqueID 
              }))
            ]}
            error={errors.Marque}
          />
          <Input
            label="Raison Sociale"
            name="RaisonSociale"
            value={selectedMarqueRaisonSociale}
            readOnly
            disabled
            className="bg-gray-100 cursor-not-allowed"
            error={errors.RaisonSociale}
          />
          <Select
            label="Province"
            value={form.Province || ''}
            onChange={(e) => updateField('Province', e.target.value)}
            options={[
              { value: '', label: '-- choisir --', id: 'province-empty' },
              ...provinces.map(p => ({ 
                value: p.NomProvince, 
                label: p.NomProvince,
                id: p.ProvinceID 
              }))
            ]}
            error={errors.Province}
          />
          <Select
            label="Commune"
            value={form.Commune || ''}
            onChange={(e) => updateField('Commune', e.target.value)}
            disabled={!selectedProvinceId}
            options={communeOptions}
            error={errors.Commune}
          />
        </div>
      </fieldset>

      {/* Gérant */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold border-b pb-2 w-full text-gray-900">
          Gérant
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AutocompleteInput
            label="Prénom du gérant"
            name="PrenomGerant"
            value={form.PrenomGerant || ''}
            onChange={(value) => updateField('PrenomGerant', value)}
            onSelect={handleGerantSelect}
            suggestions={gerants}
            getSuggestionText={(g) => `${g.PrenomGerant} ${g.NomGerant} (${g.CINGerant})`}
            error={errors.PrenomGerant}
          />
          <AutocompleteInput
            label="Nom du gérant"
            name="NomGerant"
            value={form.NomGerant || ''}
            onChange={(value) => updateField('NomGerant', value)}
            onSelect={handleGerantSelect}
            suggestions={gerants}
            getSuggestionText={(g) => `${g.PrenomGerant} ${g.NomGerant} (${g.CINGerant})`}
            error={errors.NomGerant}
          />
          <AutocompleteInput
            label="CIN du gérant"
            name="CINGerant"
            value={form.CINGerant || ''}
            onChange={(value) => updateField('CINGerant', value)}
            onSelect={handleGerantSelect}
            suggestions={gerants}
            getSuggestionText={(g) => `${g.CINGerant} - ${g.PrenomGerant} ${g.NomGerant}`}
            error={errors.CINGerant}
          />
          <AutocompleteInput
            label="Téléphone"
            name="Telephone"
            value={form.Telephone || ''}
            onChange={(value) => updateField('Telephone', value)}
            onSelect={handleGerantSelect}
            suggestions={gerants}
            getSuggestionText={(g) => `${g.Telephone || ''} - ${g.PrenomGerant} ${g.NomGerant}`}
            error={errors.Telephone}
          />
        </div>
      </fieldset>

      {/* Propriétaire */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold border-b pb-2 w-full text-gray-900">
          Propriétaire
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Type de propriétaire"
            value={form.TypeProprietaire || 'Physique'}
            onChange={(e) => updateField('TypeProprietaire', e.target.value)}
            options={[
              { value: 'Physique', label: 'Physique', id: 'prop-physique' },
              { value: 'Morale', label: 'Morale', id: 'prop-morale' }
            ]}
            error={errors.TypeProprietaire}
          />
          {form.TypeProprietaire === 'Physique' ? (
            <>
              <AutocompleteInput
                label="Prénom du propriétaire"
                name="PrenomProprietaire"
                value={form.PrenomProprietaire || ''}
                onChange={(value) => updateField('PrenomProprietaire', value)}
                onSelect={handleProprietaireSelect}
                suggestions={filteredProprietaires}
                getSuggestionText={(p) => 
                  p.details?.PrenomProprietaire && p.details?.NomProprietaire
                    ? `${p.details.PrenomProprietaire} ${p.details.NomProprietaire}`
                    : ''
                }
                error={errors.PrenomProprietaire}
              />
              <AutocompleteInput
                label="Nom du propriétaire"
                name="NomProprietaire"
                value={form.NomProprietaire || ''}
                onChange={(value) => updateField('NomProprietaire', value)}
                onSelect={handleProprietaireSelect}
                suggestions={filteredProprietaires}
                getSuggestionText={(p) => 
                  p.details?.PrenomProprietaire && p.details?.NomProprietaire
                    ? `${p.details.PrenomProprietaire} ${p.details.NomProprietaire}`
                    : ''
                }
                error={errors.NomProprietaire}
              />
            </>
          ) : (
            <AutocompleteInput
              label="Nom de l'entreprise (morale)"
              name="NomEntreprise"
              value={form.NomEntreprise || ''}
              onChange={(value) => updateField('NomEntreprise', value)}
              onSelect={handleProprietaireSelect}
              suggestions={filteredProprietaires}
              getSuggestionText={(p) => p.details?.NomEntreprise || ''}
              error={errors.NomEntreprise}
            />
          )}
        </div>
      </fieldset>

      {/* Autorisations */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold border-b pb-2 w-full text-gray-900">
          Autorisations
        </legend>
        {autorisations.length > 0 ? (
          autorisations.map((auto, index) => {
            const availableTypes = getAvailableAutorisationTypes(index);
            return (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md relative">
                <Select
                  label="Type"
                  value={auto.TypeAutorisation || 'création'}
                  onChange={(e) => handleAutorisationTypeChange(index, e.target.value as 'création' | 'mise en service')}
                  options={availableTypes.map(type => ({ 
                    value: type, 
                    label: type === 'création' ? 'Création' : 'Mise en service',
                    id: `auto-${index}-${type}` 
                  }))}
                />
                <Input
                  label="Numéro"
                  value={auto.NumeroAutorisation || ''}
                  onChange={(e) => updateAutorisationField(index, 'NumeroAutorisation', e.target.value)}
                />
                <Input
                  type="date"
                  label="Date"
                  value={auto.DateAutorisation || ''}
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
            );
          })
        ) : (
          <p className="text-sm text-gray-500">Aucune autorisation enregistrée.</p>
        )}
        {errors.autorisations && (
          <div>
            <span className="text-sm text-red-500">{errors.autorisations}</span>
          </div>
        )}
        {autorisations.length < 2 && (
          <div>
            <Button type="button" variant="secondary" onClick={handleAddAutorisation}>
              Ajouter une autre autorisation
            </Button>
          </div>
        )}
      </fieldset>

      {/* Capacités de Stockage */}
      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold border-b pb-2 w-full text-gray-900">
          Capacités de Stockage
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Capacité Gasoil (Tonnes)"
            name="CapaciteGasoil"
            type="number"
            min="0"
            value={form.CapaciteGasoil || '0'}
            onChange={(e) => updateField('CapaciteGasoil', e.target.value)}
            error={errors.CapaciteGasoil}
          />
          <Input
            label="Capacité SSP (Tonnes)"
            name="CapaciteSSP"
            type="number"
            min="0"
            value={form.CapaciteSSP || '0'}
            onChange={(e) => updateField('CapaciteSSP', e.target.value)}
            error={errors.CapaciteSSP}
          />
        </div>
      </fieldset>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={submitting || loading}>
          {mode === 'create' ? 'Créer la station' : 'Enregistrer les modifications'}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting || loading}>
          Annuler
        </Button>
        {submitting && <span className="text-sm text-gray-500">Enregistrement…</span>}
      </div>
    </form>
  );
}

export default StationForm;