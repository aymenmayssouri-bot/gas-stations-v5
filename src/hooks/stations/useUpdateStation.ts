// src/hooks/stations/useUpdateStation.ts
import { useCallback, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
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
  COMMUNES: 'communes', // Note: capital C to match existing data
  MARQUES: 'marques',
  GERANTS: 'gerants',
  PROPRIETAIRES: 'proprietaires',
  PROPRIETAIRES_PHYSIQUES: 'proprietaires_physiques',
  PROPRIETAIRES_MORALES: 'proprietaires_morales',
  AUTORISATIONS: 'autorisations',
  CAPACITES_STOCKAGE: 'capacites_stockage',
};

export function useUpdateStation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStation = useCallback(async (stationId: string, formData: StationFormData) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
    const stationRef = doc(db, COLLECTIONS.STATIONS, stationId);

    try {
      // 1. Find or create Marque
      let marqueId: string;
      const existingMarqueSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.MARQUES), where('Marque', '==', formData.Marque.trim()))
      );
      if (!existingMarqueSnapshot.empty) {
        marqueId = existingMarqueSnapshot.docs[0].id;
        // Update RaisonSociale if provided
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

      // 2. Find or create Province
      let provinceId: string;
      const existingProvinceSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.PROVINCES), where('Province', '==', formData.Province.trim()))
      );
      if (!existingProvinceSnapshot.empty) {
        provinceId = existingProvinceSnapshot.docs[0].id;
      } else {
        const provinceRef = doc(collection(db, COLLECTIONS.PROVINCES));
        const province: Omit<Province, 'id'> = { 
          NomProvince: formData.Province.trim()
        };
        batch.set(provinceRef, province);
        provinceId = provinceRef.id;
      }

      // 3. Find or create Commune
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
          NomCommune: formData.Commune.trim(),
          ProvinceID: provinceId,
        };
        batch.set(communeRef, commune);
        communeId = communeRef.id;
      }

      // 4. Find or create Gerant - FIX: Use the correct field names
      let gerantId: string;
      const existingGerantSnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.GERANTS),
          where('CINGerant', '==', formData.CINGerant.trim())
        )
      );
      if (!existingGerantSnapshot.empty) {
        gerantId = existingGerantSnapshot.docs[0].id;
        // Update gerant details
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

      // 5. Update Station document
      const updatedStationData: Partial<Station> = {
        NomStation: formData.NomStation.trim(),
        Adresse: formData.Adresse.trim(),
        Latitude: formData.Latitude ? parseFloat(formData.Latitude) : 0,
        Longitude: formData.Longitude ? parseFloat(formData.Longitude) : 0,
        Type: formData.Type,
        MarqueID: marqueId,
        CommuneID: communeId,
        GerantID: gerantId,
      };
      batch.update(stationRef, updatedStationData);

      // 6. Handle Proprietaire Update (similar to your existing logic)
      const oldStationDoc = await getDoc(stationRef);
      const oldProprietaireID = oldStationDoc.data()?.ProprietaireID;

      // Delete old proprietaire details if type changes
      if (oldProprietaireID) {
        const oldProprietaireDoc = await getDoc(doc(db, COLLECTIONS.PROPRIETAIRES, oldProprietaireID));
        if (oldProprietaireDoc.exists()) {
          const oldType = oldProprietaireDoc.data()?.TypeProprietaire;
          if (oldType !== formData.TypeProprietaire) {
            batch.delete(oldProprietaireDoc.ref);
            if (oldType === 'Physique') {
              const oldPhysiqueSnapshot = await getDocs(query(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES), where('ProprietaireID', '==', oldProprietaireID)));
              oldPhysiqueSnapshot.docs.forEach(d => batch.delete(d.ref));
            } else {
              const oldMoraleSnapshot = await getDocs(query(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES), where('ProprietaireID', '==', oldProprietaireID)));
              oldMoraleSnapshot.docs.forEach(d => batch.delete(d.ref));
            }
          }
        }
      }

      // Create or update new proprietaire
      let newProprietaireId = oldProprietaireID;
      const proprietaireName = formData.TypeProprietaire === 'Physique' ? formData.NomProprietaire.trim() : formData.NomEntreprise.trim();
      
      if (proprietaireName) {
        if (oldProprietaireID && oldStationDoc.data()?.TypeProprietaire === formData.TypeProprietaire) {
          if (formData.TypeProprietaire === 'Physique') {
            const physiqueSnapshot = await getDocs(query(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES), where('ProprietaireID', '==', oldProprietaireID)));
            if (!physiqueSnapshot.empty) {
              batch.update(physiqueSnapshot.docs[0].ref, { 
                NomProprietaire: formData.NomProprietaire.trim(),
                PrenomProprietaire: formData.PrenomProprietaire.trim()
              });
            }
          } else {
            const moraleSnapshot = await getDocs(query(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES), where('ProprietaireID', '==', oldProprietaireID)));
            if (!moraleSnapshot.empty) {
              batch.update(moraleSnapshot.docs[0].ref, { NomEntreprise: formData.NomEntreprise.trim() });
            }
          }
        } else {
          const proprietaireRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES));
          const proprietaire: Omit<Proprietaire, 'id'> = { TypeProprietaire: formData.TypeProprietaire };
          batch.set(proprietaireRef, proprietaire);
          newProprietaireId = proprietaireRef.id;

          if (formData.TypeProprietaire === 'Physique') {
            const physiqueRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES));
            const physique: Omit<ProprietairePhysique, 'id'> = { 
              ProprietaireID: newProprietaireId, 
              NomProprietaire: formData.NomProprietaire.trim(),
              PrenomProprietaire: formData.PrenomProprietaire.trim()
            };
            batch.set(physiqueRef, physique);
          } else {
            const moraleRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES));
            const morale: Omit<ProprietaireMorale, 'id'> = { 
              ProprietaireID: newProprietaireId, 
              NomEntreprise: formData.NomEntreprise.trim() 
            };
            batch.set(moraleRef, morale);
          }
        }
      }
      
      batch.update(stationRef, { ProprietaireID: newProprietaireId });

      // 7. Delete and re-create Autorisations
      const oldAutorisationsSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.AUTORISATIONS), where('StationID', '==', stationId))
      );
      oldAutorisationsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

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

      // 8. Delete and re-create Capacites
      const oldCapacitesSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.CAPACITES_STOCKAGE), where('StationID', '==', stationId))
      );
      oldCapacitesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

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
      console.error('Error updating station:', err);
      setError(`Failed to update station: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStation, loading, error };
}