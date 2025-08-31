// src/hooks/stations/useStations.ts - FIXED VERSION

// ADDITIONAL FIX: Also check StationsTable.tsx for correct sort keys
// The sort keys in TableHeader should match these paths:
// - "NomStation" -> station.NomStation ✓
// - "NomCommune" -> commune.NomCommune ✓  
// - "Marque" -> marque.Marque ✓
// - "Province" -> province.NomProvince (NOT "Province")
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
  COMMUNES: 'communes', 
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
        ...(d.data() as Omit<Station, 'id'>),
      }));

      console.log('Base stations loaded:', baseStations);

      const results: StationWithDetails[] = [];

      for (const station of baseStations) {
        console.log('Processing station:', station.NomStation, 'with IDs:', {
          MarqueID: station.MarqueID,
          CommuneID: station.CommuneID,
          GerantID: station.GerantID,
          ProprietaireID: station.ProprietaireID
        });

        // Fetch related data - FIXED document existence checks
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
              where('StationID', '==', station.id)
            )
          ),
          getDocs(
            query(
              collection(db, COLLECTIONS.CAPACITES_STOCKAGE),
              where('StationID', '==', station.id)
            )
          ),
        ]);

        // FIXED: Proper document existence checks and data extraction
        const marque: Marque = marqueDoc?.exists() 
          ? { id: marqueDoc.id, ...marqueDoc.data() as Omit<Marque, 'id'> }
          : { id: '', Marque: 'Unknown', RaisonSociale: '' };

        const commune: Commune = communeDoc?.exists() 
          ? { id: communeDoc.id, ...communeDoc.data() as Omit<Commune, 'id'> }
          : { id: '', NomCommune: 'Unknown', ProvinceID: '' };

        // FIXED: Fetch province using the commune's ProvinceID
        let province: Province = { id: '', NomProvince: 'Unknown' };
        if (commune.ProvinceID) {
          try {
            const provDoc = await getDoc(doc(db, COLLECTIONS.PROVINCES, commune.ProvinceID));
            if (provDoc.exists()) {
              province = { 
                id: provDoc.id, 
                ...provDoc.data() as Omit<Province, 'id'> 
              };
            }
          } catch (provError) {
            console.error('Error fetching province:', provError);
          }
        }

        const gerant: Gerant = gerantDoc?.exists() 
          ? {
              id: gerantDoc.id,
              ...gerantDoc.data() as Omit<Gerant, 'id'>,
              fullName: `${(gerantDoc.data() as any)?.PrenomGerant || ''} ${(gerantDoc.data() as any)?.NomGerant || ''}`.trim(),
            }
          : { 
              id: '', 
              NomGerant: 'Unknown', 
              PrenomGerant: '', 
              CINGerant: '', 
              Telephone: '', 
              fullName: 'Unknown' 
            };

        // FIXED: Proprietaire fetching
        let proprietaire: StationWithDetails['proprietaire'] = undefined;
        if (proprietaireBaseDoc?.exists()) {
          const base = { 
            id: proprietaireBaseDoc.id, 
            ...proprietaireBaseDoc.data() as Omit<Proprietaire, 'id'> 
          };

          try {
            if (base.TypeProprietaire === 'Physique') {
              const physSnap = await getDocs(
                query(
                  collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES),
                  where('ProprietaireID', '==', proprietaireBaseDoc.id)
                )
              );
              if (!physSnap.empty) {
                const details = { 
                  id: physSnap.docs[0].id, 
                  ...physSnap.docs[0].data() as Omit<ProprietairePhysique, 'id'> 
                };
                proprietaire = { base, details };
              }
            } else if (base.TypeProprietaire === 'Morale') {
              const morSnap = await getDocs(
                query(
                  collection(db, COLLECTIONS.PROPRIETAIRES_MORALES),
                  where('ProprietaireID', '==', proprietaireBaseDoc.id)
                )
              );
              if (!morSnap.empty) {
                const details = { 
                  id: morSnap.docs[0].id, 
                  ...morSnap.docs[0].data() as Omit<ProprietaireMorale, 'id'> 
                };
                proprietaire = { base, details };
              }
            }
          } catch (propError) {
            console.error('Error fetching proprietaire details:', propError);
          }
        }

        // FIXED: Autorisations with proper date handling
        const autorisations: Autorisation[] = autorisationsSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            StationID: data.StationID,
            TypeAutorisation: data.TypeAutorisation,
            NumeroAutorisation: data.NumeroAutorisation,
            DateAutorisation: data.DateAutorisation?.toDate?.() || null,
          };
        });

        const capacites: CapaciteStockage[] = capacitesSnap.docs.map((d) => ({
          id: d.id,
          ...d.data() as Omit<CapaciteStockage, 'id'>,
        }));

        console.log('Processed station data:', {
          station: station.NomStation,
          marque: marque.Marque,
          commune: commune.NomCommune,
          province: province.NomProvince,
          gerant: gerant.fullName
        });

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

      console.log('Final results:', results);
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