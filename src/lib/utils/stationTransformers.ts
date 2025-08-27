import { Timestamp } from 'firebase/firestore';
import {
  GasStation,
  GasStationFormData,
  StationAuthorization,
  StationType,
} from '@/types/station';

/** Helpers */
function toDate(input: any): Date | null {
  if (!input) return null;
  if (input instanceof Timestamp) return input.toDate();
  if (input instanceof Date) return input;
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}
function toNumber(input: any): number | null {
  if (input === undefined || input === null || input === '') return null;
  const n = Number(input);
  return Number.isNaN(n) ? null : n;
}

/** Firestore doc → GasStation (strong type) */
export function docToStation(id: string, data: any): GasStation {
  return {
    id,
    'Raison sociale': data['Raison sociale'] ?? '',
    'Marque': data['Marque'] ?? '',
    'Nom de Station': data['Nom de Station'] ?? '',
    'Propriétaire': data['Propriétaire'] ?? '',
    'Gérant': data['Gérant'] ?? '',
    'CIN Gérant': data['CIN Gérant'] ?? '',
    'Adesse': data['Adesse'] ?? '',
    'Latitude': toNumber(data['Latitude']),
    'Longitude': toNumber(data['Longitude']),
    'Commune': data['Commune'] ?? '',
    'Province': data['Province'] ?? '',
    'Type': (data['Type'] ?? 'service') as StationType,
    'Type Autorisation': (data['Type Autorisation'] ?? 'création') as StationAuthorization,
    'Date Creation': toDate(data['Date Creation']),
    'numéro de création': data['numéro de création'] ?? '',
    'Date Mise en service': toDate(data['Date Mise en service']),
    'numéro de Mise en service': data['numéro de Mise en service'] ?? '',
    'Capacité Gasoil': toNumber(data['Capacité Gasoil']),
    'Capacité SSP': toNumber(data['Capacité SSP']),
    'numéro de Téléphone': data['numéro de Téléphone'] ?? '',
  };
}

/** GasStation → form (all strings) */
export function stationToFormData(s: GasStation): GasStationFormData {
  return {
    id: s.id,
    'Raison sociale': s['Raison sociale'] ?? '',
    'Marque': s['Marque'] ?? '',
    'Nom de Station': s['Nom de Station'] ?? '',
    'Propriétaire': s['Propriétaire'] ?? '',
    'Gérant': s['Gérant'] ?? '',
    'CIN Gérant': s['CIN Gérant'] ?? '',
    'Adesse': s['Adesse'] ?? '',
    'Latitude': s['Latitude']?.toString() ?? '',
    'Longitude': s['Longitude']?.toString() ?? '',
    'Commune': s['Commune'] ?? '',
    'Province': s['Province'] ?? '',
    'Type': (s['Type'] ?? 'service') as StationType,
    'Type Autorisation': (s['Type Autorisation'] ?? 'création') as StationAuthorization,
    'Date Creation': s['Date Creation'] ? s['Date Creation'].toISOString().slice(0, 10) : '',
    'numéro de création': s['numéro de création'] ?? '',
    'Date Mise en service': s['Date Mise en service'] ? s['Date Mise en service'].toISOString().slice(0, 10) : '',
    'numéro de Mise en service': s['numéro de Mise en service'] ?? '',
    'Capacité Gasoil': s['Capacité Gasoil']?.toString() ?? '',
    'Capacité SSP': s['Capacité SSP']?.toString() ?? '',
    'numéro de Téléphone': s['numéro de Téléphone'] ?? '',
  };
}

/** form → Firestore payload */
export function formDataToFirestore(input: GasStationFormData): Record<string, any> {
  const dateFromStr = (s: string): Timestamp | null =>
    s ? Timestamp.fromDate(new Date(s)) : null;

  return {
    'Raison sociale': input['Raison sociale'].trim(),
    'Marque': input['Marque'].trim(),
    'Nom de Station': input['Nom de Station'].trim(),
    'Propriétaire': input['Propriétaire'].trim(),
    'Gérant': input['Gérant'].trim(),
    'CIN Gérant': input['CIN Gérant'].trim(),
    'Adesse': input['Adesse'].trim(),
    'Latitude': toNumber(input['Latitude']),
    'Longitude': toNumber(input['Longitude']),
    'Commune': input['Commune'].trim(),
    'Province': input['Province'].trim(),
    'Type': input['Type'] as StationType,
    'Type Autorisation': input['Type Autorisation'] as StationAuthorization,
    'Date Creation': dateFromStr(input['Date Creation']),
    'numéro de création': input['numéro de création'].trim(),
    'Date Mise en service': dateFromStr(input['Date Mise en service']),
    'numéro de Mise en service': input['numéro de Mise en service'].trim(),
    'Capacité Gasoil': toNumber(input['Capacité Gasoil']),
    'Capacité SSP': toNumber(input['Capacité SSP']),
    'numéro de Téléphone': input['numéro de Téléphone'].trim(),
  };
}
