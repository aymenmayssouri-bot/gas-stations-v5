// src/hooks/stations/useStations.ts
import { useEffect, useState, useCallback } from 'react';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Station,
  StationWithDetails,
  Marque,
  Commune,
  Province,
  Gerant,
  Proprietaire,
  ProprietairePhysique,
  ProprietaireMorale,
  Autorisation,
  CapaciteStockage,
} from '@/types/station';

const COLLECTIONS = {
  STATIONS: 'stations',
  MARQUES: 'marques',
  COMMUNES: 'Communes', // NOTE: capital C matches your data
  PROVINCES: 'provinces',
  GERANTS: 'gerants',
  PROPRIETAIRES: 'proprietaires',
  PROPRIETAIRES_PHYSIQUES: 'proprietaires_physiques',
  PROPRIETAIRES_MORALES: 'proprietaires_morales',
  AUTORISATIONS: 'autorisations',
  CAPACITES_STOCKAGE: 'capacites_stockage',
} as const;

export function useStations() {
  const [stations, setStations] = useState<StationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStationsWithDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const stationsSnap = await getDocs(collection(db, COLLECTIONS.STATIONS));
      const baseStations: Station[] = stationsSnap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Station),
      }));

      const results: StationWithDetails[] = [];

      for (const station of baseStations) {
        // Fetch related data in parallel where possible
        const [
          marqueDoc,
          communeDoc,
          gerantDoc,
          proprietaireBaseDoc,
          autorisationsSnap,
          capacitesSnap,
        ] = await Promise.all([
          station.MarqueID
            ? getDoc(doc(db, COLLECTIONS.MARQUES, station.MarqueID))
            : Promise.resolve(null),
          station.CommuneID
            ? getDoc(doc(db, COLLECTIONS.COMMUNES, station.CommuneID))
            : Promise.resolve(null),
          station.GerantID
            ? getDoc(doc(db, COLLECTIONS.GERANTS, station.GerantID))
            : Promise.resolve(null),
          station.ProprietaireID
            ? getDoc(doc(db, COLLECTIONS.PROPRIETAIRES, station.ProprietaireID))
            : Promise.resolve(null),
          getDocs(
            query(
              collection(db, COLLECTIONS.AUTORISATIONS),
              where('StationID', '==', station.id as string)
            )
          ),
          getDocs(
            query(
              collection(db, COLLECTIONS.CAPACITES_STOCKAGE),
              where('StationID', '==', station.id as string)
            )
          ),
        ]);

        // Marque
        const marque: Marque = marqueDoc && 'exists' in (marqueDoc as any) && (marqueDoc as any).exists()
          ? ({ id: (marqueDoc as any).id, ...((marqueDoc as any).data() as any) })
          : ({ id: '', Marque: '', RaisonSociale: '' });

        // Commune + Province (via commune.ProvinceID)
        const commune: Commune = communeDoc && 'exists' in (communeDoc as any) && (communeDoc as any).exists()
          ? ({ id: (communeDoc as any).id, ...((communeDoc as any).data() as any) })
          : ({ id: '', NomCommune: '', ProvinceID: '' });

        let province: Province = { id: '', NomProvince: '' };
        if (commune?.ProvinceID) {
          const provDoc = await getDoc(doc(db, COLLECTIONS.PROVINCES, commune.ProvinceID));
          if ('exists' in (provDoc as any) && (provDoc as any).exists()) {
            province = { id: (provDoc as any).id, ...((provDoc as any).data() as any) } as Province;
          }
        }

        // Gérant (split first/last names)
        const gerant: Gerant = gerantDoc && 'exists' in (gerantDoc as any) && (gerantDoc as any).exists()
          ? ({
              id: (gerantDoc as any).id,
              ...((gerantDoc as any).data() as any),
              fullName: `${((gerantDoc as any).data() as any).PrenomGerant || ''} ${((gerantDoc as any).data() as any).NomGerant || ''}`.trim(),
            })
          : ({ id: '', NomGerant: '', PrenomGerant: '', CINGerant: '', Telephone: undefined, fullName: '' });

        // Propriétaire
        let proprietaire: StationWithDetails['proprietaire'] = undefined;
        if (proprietaireBaseDoc && 'exists' in (proprietaireBaseDoc as any) && (proprietaireBaseDoc as any).exists()) {
          const base = { id: (proprietaireBaseDoc as any).id, ...((proprietaireBaseDoc as any).data() as Proprietaire) };

          if (base.TypeProprietaire === 'Physique') {
            const physSnap = await getDocs(
              query(
                collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES),
                where('ProprietaireID', '==', (proprietaireBaseDoc as any).id)
              )
            );
            if (!physSnap.empty) {
              const d = physSnap.docs[0];
              const details = { id: d.id, ...(d.data() as ProprietairePhysique) };
              proprietaire = { base, details };
            }
          } else if (base.TypeProprietaire === 'Morale') {
            const morSnap = await getDocs(
              query(
                collection(db, COLLECTIONS.PROPRIETAIRES_MORALES),
                where('ProprietaireID', '==', (proprietaireBaseDoc as any).id)
              )
            );
            if (!morSnap.empty) {
              const d = morSnap.docs[0];
              const details = { id: d.id, ...(d.data() as ProprietaireMorale) };
              proprietaire = { base, details };
            }
          }
        }

        // Autorisations & capacités
        const autorisations: Autorisation[] = autorisationsSnap.docs.map((d) => {
          const raw = d.data() as any;
          return {
            id: d.id,
            StationID: raw.StationID,
            TypeAutorisation: raw.TypeAutorisation,
            NumeroAutorisation: raw.NumeroAutorisation,
            DateAutorisation: raw.DateAutorisation?.toDate?.() ?? null,
          } as Autorisation;
        });

        const capacites: CapaciteStockage[] = capacitesSnap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as CapaciteStockage),
        }));

        results.push({
          station,
          marque,
          commune,
          province,
          gerant,
          proprietaire,
          autorisations,
          capacites,
        });
      }

      setStations(results);
    } catch (err: any) {
      console.error('Failed to load stations:', err);
      setError(err?.message || 'Failed to load stations');
      setStations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStationsWithDetails();
  }, [fetchStationsWithDetails]);

  return { stations, loading, error, refetch: fetchStationsWithDetails };
}