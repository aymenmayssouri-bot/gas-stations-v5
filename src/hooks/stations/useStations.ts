// src/hooks/stations/useStations.ts
import { useEffect, useState, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  query,
  where,
  orderBy
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
  CapaciteStockage
} from '@/types/station';

const COLLECTIONS = {
  STATIONS: 'stations',
  PROVINCES: 'provinces',
  COMMUNES: 'communes',
  MARQUES: 'marques',
  GERANTS: 'gerants',
  PROPRIETAIRES: 'proprietaires',
  PROPRIETAIRES_PHYSIQUES: 'proprietaires_physiques',
  PROPRIETAIRES_MORALES: 'proprietaires_morales',
  AUTORISATIONS: 'autorisations',
  CAPACITES_STOCKAGE: 'capacites_stockage'
};

export function useStations() {
  const [stations, setStations] = useState<StationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStationsWithDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const stationsSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.STATIONS), orderBy('NomStation'))
      );

      const stationDetails: StationWithDetails[] = [];

      for (const stationDoc of stationsSnapshot.docs) {
        const station = { id: stationDoc.id, ...stationDoc.data() } as Station;

        try {
          const marqueDoc = await getDoc(doc(db, COLLECTIONS.MARQUES, station.MarqueID));
          const marque = marqueDoc.exists() ? 
            { id: marqueDoc.id, ...marqueDoc.data() } as Marque : null;

          const communeDoc = await getDoc(doc(db, COLLECTIONS.COMMUNES, station.CommuneID));
          const commune = communeDoc.exists() ? 
            { id: communeDoc.id, ...communeDoc.data() } as Commune : null;

          let province: Province | null = null;
          if (commune) {
            const provinceDoc = await getDoc(doc(db, COLLECTIONS.PROVINCES, commune.ProvinceID));
            province = provinceDoc.exists() ? 
              { id: provinceDoc.id, ...provinceDoc.data() } as Province : null;
          }

          const gerantDoc = await getDoc(doc(db, COLLECTIONS.GERANTS, station.GerantID));
          const gerant = gerantDoc.exists() ? 
            { id: gerantDoc.id, ...gerantDoc.data() } as Gerant : null;

          let proprietaire: StationWithDetails['proprietaire'] = undefined;
          if (station.ProprietaireID) {
            const proprietaireDoc = await getDoc(doc(db, COLLECTIONS.PROPRIETAIRES, station.ProprietaireID));
            if (proprietaireDoc.exists()) {
              const proprietaireBase = { id: proprietaireDoc.id, ...proprietaireDoc.data() } as Proprietaire;
              
              if (proprietaireBase.TypeProprietaire === 'Physique') {
                const physiqueSnapshot = await getDocs(
                  query(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES), 
                    where('ProprietaireID', '==', station.ProprietaireID))
                );
                if (!physiqueSnapshot.empty) {
                  const physiqueData = { id: physiqueSnapshot.docs[0].id, ...physiqueSnapshot.docs[0].data() } as ProprietairePhysique;
                  proprietaire = {
                    base: proprietaireBase,
                    details: physiqueData
                  };
                }
              } else {
                const moraleSnapshot = await getDocs(
                  query(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES), 
                    where('ProprietaireID', '==', station.ProprietaireID))
                );
                if (!moraleSnapshot.empty) {
                  const moraleData = { id: moraleSnapshot.docs[0].id, ...moraleSnapshot.docs[0].data() } as ProprietaireMorale;
                  proprietaire = {
                    base: proprietaireBase,
                    details: moraleData
                  };
                }
              }
            }
          }

          const autorisationsSnapshot = await getDocs(
            query(collection(db, COLLECTIONS.AUTORISATIONS), 
              where('StationID', '==', station.id))
          );
          const autorisations = autorisationsSnapshot.docs.map(doc => 
            ({ id: doc.id, ...doc.data() } as Autorisation)
          );

          const capacitesSnapshot = await getDocs(
            query(collection(db, COLLECTIONS.CAPACITES_STOCKAGE), 
              where('StationID', '==', station.id))
          );
          const capacites = capacitesSnapshot.docs.map(doc => 
            ({ id: doc.id, ...doc.data() } as CapaciteStockage)
          );

          if (marque && commune && province && gerant) {
            stationDetails.push({
              station,
              marque,
              commune,
              province,
              gerant,
              proprietaire,
              autorisations,
              capacites
            });
          } else {
            console.warn(`Skipping station ${station.NomStation} - missing required references`);
          }
        } catch (err) {
          console.error(`Error fetching details for station ${station.NomStation}:`, err);
        }
      }

      setStations(stationDetails);
      
    } catch (err: any) {
      console.error('Error fetching stations:', err);
      setError(`Failed to load stations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStationsWithDetails();
  }, [fetchStationsWithDetails]);

  return {
    stations,
    loading,
    error,
    refetch: fetchStationsWithDetails
  };
}