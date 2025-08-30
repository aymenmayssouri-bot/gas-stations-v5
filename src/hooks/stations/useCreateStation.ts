// src/hooks/stations/useCreateStation.ts
import { useCallback, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Station,
  Marque,
  Province,
  Commune,
  Gerant,
  Proprietaire,
  ProprietairePhysique,
  ProprietaireMorale,
  Autorisation,
  CapaciteStockage,
  StationFormData,
} from '@/types/station';

const COLLECTIONS = {
  STATIONS: 'stations',
  PROVINCES: 'provinces',
  COMMUNES: 'Communes', // Note: capital C to match your existing data
  MARQUES: 'marques',
  GERANTS: 'gerants',
  PROPRIETAIRES: 'proprietaires',
  PROPRIETAIRES_PHYSIQUES: 'proprietaires_physiques',
  PROPRIETAIRES_MORALES: 'proprietaires_morales',
  AUTORISATIONS: 'autorisations',
  CAPACITES_STOCKAGE: 'capacites_stockage',
};

export function useCreateStation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStation = useCallback(async (formData: StationFormData) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);

    try {
      // 1. Create or find Marque
      let marqueId: string;
      const existingMarqueSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.MARQUES), where('Marque', '==', formData.Marque.trim()))
      );

      if (!existingMarqueSnapshot.empty) {
        marqueId = existingMarqueSnapshot.docs[0].id;
        // Update RaisonSociale if it's different
        if (formData.RaisonSociale.trim()) {
          batch.update(existingMarqueSnapshot.docs[0].ref, {
            RaisonSociale: formData.RaisonSociale.trim()
          });
        }
      } else {
        const marqueRef = doc(collection(db, COLLECTIONS.MARQUES));
        const marque: Omit<Marque, 'id'> = {
          Marque: formData.Marque.trim(),
          RaisonSociale: formData.RaisonSociale.trim(),
        };
        batch.set(marqueRef, marque);
        marqueId = marqueRef.id;
      }

      // 2. Create or find Province
      let provinceId: string;
      const existingProvinceSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.PROVINCES), where('Province', '==', formData.Province.trim()))
      );

      if (!existingProvinceSnapshot.empty) {
        provinceId = existingProvinceSnapshot.docs[0].id;
      } else {
        const provinceRef = doc(collection(db, COLLECTIONS.PROVINCES));
        const province: Omit<Province, 'id'> = { 
          Province: formData.Province.trim(),
          NomProvince: formData.Province.trim() // Add this field to match your data structure
        };
        batch.set(provinceRef, province);
        provinceId = provinceRef.id;
      }

      // 3. Create or find Commune
      let communeId: string;
      const existingCommuneSnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.COMMUNES),
          where('Commune', '==', formData.Commune.trim()),
          where('ProvinceID', '==', provinceId)
        )
      );

      if (!existingCommuneSnapshot.empty) {
        communeId = existingCommuneSnapshot.docs[0].id;
      } else {
        const communeRef = doc(collection(db, COLLECTIONS.COMMUNES));
        const commune: Omit<Commune, 'id'> = {
          Commune: formData.Commune.trim(),
          NomCommune: formData.Commune.trim(), // Add this field to match your data structure
          ProvinceID: provinceId,
        };
        batch.set(communeRef, commune);
        communeId = communeRef.id;
      }

      // 4. Create or find Gerant - FIX: Use the correct field names
      let gerantId: string;
      const fullGerantName = `${formData.PrenomGerant.trim()} ${formData.NomGerant.trim()}`.trim();
      
      const existingGerantSnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.GERANTS),
          where('CINGerant', '==', formData.CINGerant.trim())
        )
      );

      if (!existingGerantSnapshot.empty) {
        gerantId = existingGerantSnapshot.docs[0].id;
        // Update gerant info if needed
        batch.update(existingGerantSnapshot.docs[0].ref, {
          PrenomGerant: formData.PrenomGerant.trim(),
          NomGerant: formData.NomGerant.trim(),
          Telephone: formData.Telephone.trim() || undefined,
        });
      } else {
        const gerantRef = doc(collection(db, COLLECTIONS.GERANTS));
        const gerant: Omit<Gerant, 'id'> = {
          PrenomGerant: formData.PrenomGerant.trim(),
          NomGerant: formData.NomGerant.trim(),
          CINGerant: formData.CINGerant.trim(),
          Telephone: formData.Telephone.trim() || undefined,
        };
        batch.set(gerantRef, gerant);
        gerantId = gerantRef.id;
      }

      // 5. Create Proprietaire if provided
      let proprietaireId: string | undefined;
      const proprietaireName = formData.TypeProprietaire === 'Physique' 
        ? formData.NomProprietaire.trim() 
        : formData.NomEntreprise.trim();

      if (proprietaireName) {
        const proprietaireRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES));
        const proprietaire: Omit<Proprietaire, 'id'> = { 
          TypeProprietaire: formData.TypeProprietaire 
        };
        batch.set(proprietaireRef, proprietaire);
        proprietaireId = proprietaireRef.id;

        if (formData.TypeProprietaire === 'Physique') {
          const physiqueRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES));
          const physique: Omit<ProprietairePhysique, 'id'> = {
            ProprietaireID: proprietaireId,
            NomProprietaire: formData.NomProprietaire.trim(),
            PrenomProprietaire: formData.PrenomProprietaire.trim(),
          };
          batch.set(physiqueRef, physique);
        } else {
          const moraleRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES));
          const morale: Omit<ProprietaireMorale, 'id'> = {
            ProprietaireID: proprietaireId,
            NomEntreprise: formData.NomEntreprise.trim(),
          };
          batch.set(moraleRef, morale);
        }
      }

      // 6. Create Station
      const stationRef = doc(collection(db, COLLECTIONS.STATIONS));
      const station: Omit<Station, 'id'> = {
        NomStation: formData.NomStation.trim(),
        Adresse: formData.Adresse.trim(),
        Latitude: formData.Latitude ? parseFloat(formData.Latitude) : 0,
        Longitude: formData.Longitude ? parseFloat(formData.Longitude) : 0,
        Type: formData.Type,
        MarqueID: marqueId,
        CommuneID: communeId,
        GerantID: gerantId,
        ProprietaireID: proprietaireId || '',
      };
      batch.set(stationRef, station);
      const stationId = stationRef.id;

      // 7. Create Autorisation
      if (formData.NumeroAutorisation.trim()) {
        const autorisationRef = doc(collection(db, COLLECTIONS.AUTORISATIONS));
        const autorisation: Omit<Autorisation, 'id'> = {
          StationID: stationId,
          TypeAutorisation: formData.TypeAutorisation,
          NumeroAutorisation: formData.NumeroAutorisation.trim(),
          DateAutorisation: formData.DateAutorisation ?
            Timestamp.fromDate(new Date(formData.DateAutorisation)).toDate() : null,
        };
        batch.set(autorisationRef, autorisation);
      }

      // 8. Create Capacites
      if (formData.CapaciteGasoil.trim()) {
        const capaciteRef = doc(collection(db, COLLECTIONS.CAPACITES_STOCKAGE));
        const capacite: Omit<CapaciteStockage, 'id'> = {
          StationID: stationId,
          TypeCarburant: 'Gasoil',
          CapaciteLitres: parseFloat(formData.CapaciteGasoil),
        };
        batch.set(capaciteRef, capacite);
      }

      if (formData.CapaciteSSP.trim()) {
        const capaciteRef = doc(collection(db, COLLECTIONS.CAPACITES_STOCKAGE));
        const capacite: Omit<CapaciteStockage, 'id'> = {
          StationID: stationId,
          TypeCarburant: 'SSP',
          CapaciteLitres: parseFloat(formData.CapaciteSSP),
        };
        batch.set(capaciteRef, capacite);
      }

      await batch.commit();
      
    } catch (err: any) {
      console.error('Error creating station:', err);
      setError(`Failed to create station: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createStation, loading, error };
}