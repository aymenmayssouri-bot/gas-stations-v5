import { GasStationFormData } from '@/types/station';


export type FormErrors = Partial<Record<keyof GasStationFormData | 'submit', string>>;


export function validateStationData(data: GasStationFormData): { isValid: boolean; errors: FormErrors } {
const errors: FormErrors = {};


const required: (keyof GasStationFormData)[] = [
'Raison sociale',
'Marque',
'Nom de Station',
'Propriétaire',
'Gérant',
'CIN Gérant',
'Adesse',
'Latitude',
'Longitude',
'Commune',
'Province',
'Type',
'Type Autorisation',
'Date Creation',
'numéro de création',
];


for (const key of required) {
const v = data[key];
if (v === undefined || v === null || String(v).trim() === '') {
errors[key] = 'Champ obligatoire';
}
}


const toNumber = (s: string) => (s === '' ? null : Number(String(s).replace(/,/g, '.')));


const lat = toNumber(data['Latitude']);
if (lat === null || !Number.isFinite(lat) || lat < -90 || lat > 90) {
errors['Latitude'] = 'Latitude invalide';
}


const lng = toNumber(data['Longitude']);
if (lng === null || !Number.isFinite(lng) || lng < -180 || lng > 180) {
errors['Longitude'] = 'Longitude invalide';
}


const g = toNumber(data['Capacité Gasoil']);
if (data['Capacité Gasoil'] !== '' && (g === null || g < 0)) {
errors['Capacité Gasoil'] = 'Capacité Gasoil invalide';
}


const ssp = toNumber(data['Capacité SSP']);
if (data['Capacité SSP'] !== '' && (ssp === null || ssp < 0)) {
errors['Capacité SSP'] = 'Capacité SSP invalide';
}


// Simple yyyy-mm-dd check for date strings if provided
const looksLikeDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
if (data['Date Creation'] && !looksLikeDate(data['Date Creation'])) {
errors['Date Creation'] = 'Format de date attendu: YYYY-MM-DD';
}
if (data['Date Mise en service'] && !looksLikeDate(data['Date Mise en service'])) {
errors['Date Mise en service'] = 'Format de date attendu: YYYY-MM-DD';
}


return { isValid: Object.keys(errors).length === 0, errors };
}