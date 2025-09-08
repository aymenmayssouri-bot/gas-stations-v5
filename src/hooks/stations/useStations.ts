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
  Analyse, // ADD THIS IMPORT
} from '@/types/station';
import {
  stationConverter,
  marqueConverter,
  communeConverter,
  provinceConverter,
  gerantConverter,
  proprietaireConverter,
  proprietairePhysiqueConverter,
  proprietaireMoraleConverter,
  autorisationConverter,
  capaciteConverter,
  analyseConverter, // ADD THIS IMPORT
} from '@/lib/firebase/converters';

import { COLLECTIONS } from '@/lib/firebase/collections';

export function useStations() {
  const [stations, setStations] = useState<StationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStationsWithDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Load base stations with converter
      const stationsSnap = await getDocs(
        collection(db, COLLECTIONS.STATIONS).withConverter(stationConverter)
      );
      const baseStations: Station[] = stationsSnap.docs.map((d) => d.data());

      const results: StationWithDetails[] = [];

      for (const station of baseStations) {
        // ✅ Parallel fetches with converters - ADD analysesSnap
        const [
          marqueDoc,
          communeDoc,
          gerantDoc,
          proprietaireBaseDoc,
          autorisationsSnap,
          capacitesSnap,
          analysesSnap, 
        ] = await Promise.all([
          station.MarqueID
            ? getDoc(
                doc(db, COLLECTIONS.MARQUES, station.MarqueID).withConverter(marqueConverter)
              )
            : Promise.resolve(null),
          station.CommuneID
            ? getDoc(
                doc(db, COLLECTIONS.COMMUNES, station.CommuneID).withConverter(communeConverter)
              )
            : Promise.resolve(null),
          station.GerantID
            ? getDoc(
                doc(db, COLLECTIONS.GERANTS, station.GerantID).withConverter(gerantConverter)
              )
            : Promise.resolve(null),
          station.ProprietaireID
            ? getDoc(
                doc(db, COLLECTIONS.PROPRIETAIRES, station.ProprietaireID).withConverter(proprietaireConverter)
              )
            : Promise.resolve(null),
          getDocs(
            query(
              collection(db, COLLECTIONS.AUTORISATIONS).withConverter(autorisationConverter),
              where('StationID', '==', station.StationID)
            )
          ),
          getDocs(
            query(
              collection(db, COLLECTIONS.CAPACITES_STOCKAGE).withConverter(capaciteConverter),
              where('StationID', '==', station.StationID)
            )
          ),
          getDocs( 
            query(
              collection(db, COLLECTIONS.ANALYSES).withConverter(analyseConverter),
              where('StationID', '==', station.StationID)
            )
          ),
        ]);

        // ✅ Build related objects safely
        const marque: Marque = marqueDoc?.exists()
          ? marqueDoc.data()
          : { MarqueID: '', Marque: 'Unknown', RaisonSociale: '' };

        const commune: Commune = communeDoc?.exists()
          ? communeDoc.data()
          : { CommuneID: '', NomCommune: 'Unknown', ProvinceID: '' };

        // ✅ Province via commune
        let province: Province = { ProvinceID: '', NomProvince: 'Unknown' };
        if (commune.ProvinceID) {
          const provDoc = await getDoc(
            doc(db, COLLECTIONS.PROVINCES, commune.ProvinceID).withConverter(provinceConverter)
          );
          if (provDoc.exists()) {
            province = provDoc.data();
          }
        }

        const gerant: Gerant = gerantDoc?.exists()
          ? {
              ...gerantDoc.data(),
              fullName: `${gerantDoc.data().PrenomGerant || ''} ${gerantDoc.data().NomGerant || ''}`.trim(),
            }
          : {
              GerantID: '',
              NomGerant: 'Unknown',
              PrenomGerant: '',
              CINGerant: '',
              Telephone: '',
              fullName: 'Unknown',
            };

        // ✅ Proprietaire with nested fetch
        let proprietaire: StationWithDetails['proprietaire'] = undefined;
        if (proprietaireBaseDoc?.exists()) {
          const base = proprietaireBaseDoc.data();
          if (base.TypeProprietaire === 'Physique') {
            const physSnap = await getDocs(
              query(
                collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES).withConverter(proprietairePhysiqueConverter),
                where('ProprietaireID', '==', base.ProprietaireID)
              )
            );
            if (!physSnap.empty) {
              proprietaire = { base, details: physSnap.docs[0].data() };
            }
          } else if (base.TypeProprietaire === 'Morale') {
            const morSnap = await getDocs(
              query(
                collection(db, COLLECTIONS.PROPRIETAIRES_MORALES).withConverter(proprietaireMoraleConverter),
                where('ProprietaireID', '==', base.ProprietaireID)
              )
            );
            if (!morSnap.empty) {
              proprietaire = { base, details: morSnap.docs[0].data() };
            }
          }
        }

        // ✅ Collections with converters
        const autorisations: Autorisation[] = autorisationsSnap.docs.map((d) => ({
          ...d.data(),
          // Fix Firestore Timestamp -> Date
          DateAutorisation:
            (d.data().DateAutorisation as any)?.toDate?.() || null,
        }));

        const capacites: CapaciteStockage[] = capacitesSnap.docs.map((d) => d.data());

        // ✅ ADD ANALYSES PROCESSING
        const analyses: Analyse[] = analysesSnap.docs.map((d) => ({
          ...d.data(),
          // Fix Firestore Timestamp -> Date
          DateAnalyse: (d.data().DateAnalyse as any)?.toDate?.() || null,
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
          analyses, 
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