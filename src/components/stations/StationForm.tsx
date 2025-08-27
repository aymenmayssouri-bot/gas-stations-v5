'use client';

import { GasStation } from '@/types/station';
import { useStationForm } from '@/hooks/useStationForm';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

interface StationFormProps {
  mode: 'create' | 'edit';
  station?: GasStation;
  onSaved?: () => void;
  onCancel?: () => void;
}

export function StationForm({ mode, station, onSaved, onCancel }: StationFormProps) {
  const { form, errors, submitting, updateField, submit } = useStationForm(mode, station);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await submit();
    if (ok && onSaved) onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors['__form'] && <ErrorMessage error={errors['__form']} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Raison sociale" name="Raison sociale" value={form['Raison sociale']} onChange={(e) => updateField('Raison sociale', e.target.value)} />
        <Input label="Marque" name="Marque" value={form['Marque']} onChange={(e) => updateField('Marque', e.target.value)} />
        <Input label="Nom de Station" name="Nom de Station" value={form['Nom de Station']} onChange={(e) => updateField('Nom de Station', e.target.value)} />
        <Input label="Propriétaire" name="Propriétaire" value={form['Propriétaire']} onChange={(e) => updateField('Propriétaire', e.target.value)} />
        <Input label="Gérant" name="Gérant" value={form['Gérant']} onChange={(e) => updateField('Gérant', e.target.value)} />
        <Input label="CIN Gérant" name="CIN Gérant" value={form['CIN Gérant']} onChange={(e) => updateField('CIN Gérant', e.target.value)} />
        <Input label="Adesse" name="Adesse" value={form['Adesse']} onChange={(e) => updateField('Adesse', e.target.value)} />
        <Input label="Latitude" name="Latitude" value={form['Latitude']} onChange={(e) => updateField('Latitude', e.target.value)} />
        <Input label="Longitude" name="Longitude" value={form['Longitude']} onChange={(e) => updateField('Longitude', e.target.value)} />
        <Input label="Commune" name="Commune" value={form['Commune']} onChange={(e) => updateField('Commune', e.target.value)} />
        <Input label="Province" name="Province" value={form['Province']} onChange={(e) => updateField('Province', e.target.value)} />
        <Input label="Type (service/remplissage)" name="Type" value={form['Type']} onChange={(e) => updateField('Type', e.target.value as any)} />
        <Input label="Type Autorisation" name="Type Autorisation" value={form['Type Autorisation']} onChange={(e) => updateField('Type Autorisation', e.target.value as any)} />
        <Input type="date" label="Date Creation" name="Date Creation" value={form['Date Creation']} onChange={(e) => updateField('Date Creation', e.target.value)} />
        <Input label="numéro de création" name="numéro de création" value={form['numéro de création']} onChange={(e) => updateField('numéro de création', e.target.value)} />
        <Input type="date" label="Date Mise en service" name="Date Mise en service" value={form['Date Mise en service']} onChange={(e) => updateField('Date Mise en service', e.target.value)} />
        <Input label="numéro de Mise en service" name="numéro de Mise en service" value={form['numéro de Mise en service']} onChange={(e) => updateField('numéro de Mise en service', e.target.value)} />
        <Input label="Capacité Gasoil (L)" name="Capacité Gasoil" value={form['Capacité Gasoil']} onChange={(e) => updateField('Capacité Gasoil', e.target.value)} />
        <Input label="Capacité SSP (L)" name="Capacité SSP" value={form['Capacité SSP']} onChange={(e) => updateField('Capacité SSP', e.target.value)} />
        <Input label="numéro de Téléphone" name="numéro de Téléphone" value={form['numéro de Téléphone']} onChange={(e) => updateField('numéro de Téléphone', e.target.value)} />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>{mode === 'create' ? 'Créer' : 'Enregistrer'}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Annuler</Button>}
      </div>
    </form>
  );
}