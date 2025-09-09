// src/hooks/stations/useUpdateStation.ts
'use client';
import { useState, useCallback } from 'react';
import {
  doc,
  getDoc,
  getDocs,
  writeBatch,
  collection,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';
import {
  Marque,
  Commune,
  Province,
  Gerant,
  Proprietaire,
  ProprietairePhysique,
  ProprietaireMorale,
  Autorisation,
  CapaciteStockage,
  StationFormData,
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
} from '@/lib/firebase/converters';

export function useUpdateStation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStation = useCallback(async (stationId: string, formData: StationFormData) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);

    try {
      // Fetch current station to get existing ProprietaireID
      const stationRef = doc(db, COLLECTIONS.STATIONS, stationId).withConverter(stationConverter);
      const stationSnap = await getDoc(stationRef);
      if (!stationSnap.exists()) {
        throw new Error('Station not found');
      }
      const currentStation = stationSnap.data();
      const oldProprietaireId = currentStation?.ProprietaireID || '';

      /** -------------------------------
       * 1. Update Marque
       * ------------------------------ */
      let marqueId: string;
      const marqueQuery = query(
        collection(db, COLLECTIONS.MARQUES).withConverter(marqueConverter),
        where('Marque', '==', formData.Marque.trim())
      );
      const marqueSnap = await getDocs(marqueQuery);

      if (!marqueSnap.empty) {
        marqueId = marqueSnap.docs[0].id;
        batch.update(marqueSnap.docs[0].ref, {
          RaisonSociale: formData.RaisonSociale.trim(),
        });
      } else {
        const newRef = doc(collection(db, COLLECTIONS.MARQUES).withConverter(marqueConverter));
        const newMarque: Marque = {
          MarqueID: newRef.id,
          Marque: formData.Marque.trim(),
          RaisonSociale: formData.RaisonSociale.trim(),
        };
        batch.set(newRef, newMarque);
        marqueId = newRef.id;
      }

      /** -------------------------------
       * 2. Update Province & Commune
       * ------------------------------ */
      let provinceId: string;
      const provinceQuery = query(
        collection(db, COLLECTIONS.PROVINCES).withConverter(provinceConverter),
        where('NomProvince', '==', formData.Province.trim())
      );
      const provinceSnap = await getDocs(provinceQuery);

      if (!provinceSnap.empty) {
        provinceId = provinceSnap.docs[0].id;
      } else {
        const newRef = doc(collection(db, COLLECTIONS.PROVINCES).withConverter(provinceConverter));
        const newProvince: Province = {
          ProvinceID: newRef.id,
          NomProvince: formData.Province.trim(),
        };
        batch.set(newRef, newProvince);
        provinceId = newRef.id;
      }

      let communeId: string;
      const communeQuery = query(
        collection(db, COLLECTIONS.COMMUNES).withConverter(communeConverter),
        where('NomCommune', '==', formData.Commune.trim()),
        where('ProvinceID', '==', provinceId)
      );
      const communeSnap = await getDocs(communeQuery);

      if (!communeSnap.empty) {
        communeId = communeSnap.docs[0].id;
      } else {
        const newRef = doc(collection(db, COLLECTIONS.COMMUNES).withConverter(communeConverter));
        const newCommune: Commune = {
          CommuneID: newRef.id,
          NomCommune: formData.Commune.trim(),
          ProvinceID: provinceId,
        };
        batch.set(newRef, newCommune);
        communeId = newRef.id;
      }

      /** -------------------------------
       * 3. Update Gérant
       * ------------------------------ */
      let gerantId: string;
      const gerantQuery = query(
        collection(db, COLLECTIONS.GERANTS).withConverter(gerantConverter),
        where('CINGerant', '==', formData.CINGerant.trim())
      );
      const gerantSnap = await getDocs(gerantQuery);

      if (!gerantSnap.empty) {
        gerantId = gerantSnap.docs[0].id;
        batch.update(gerantSnap.docs[0].ref, {
          NomGerant: formData.NomGerant.trim(),
          PrenomGerant: formData.PrenomGerant.trim(),
          Telephone: formData.Telephone.trim(),
        });
      } else {
        const newRef = doc(collection(db, COLLECTIONS.GERANTS).withConverter(gerantConverter));
        const newGerant: Gerant = {
          GerantID: newRef.id,
          NomGerant: formData.NomGerant.trim(),
          PrenomGerant: formData.PrenomGerant.trim(),
          CINGerant: formData.CINGerant.trim(),
          Telephone: formData.Telephone.trim(),
        };
        batch.set(newRef, newGerant);
        gerantId = newRef.id;
      }

      /** -------------------------------
       * 4. Update Proprietaire
       * ------------------------------ */
      let proprietaireId: string | undefined;
      const proprietaireName =
        formData.TypeProprietaire === 'Physique'
          ? formData.NomProprietaire.trim()
          : formData.NomEntreprise.trim();

      if (!proprietaireName) {
        // Unlink owner if no name provided
        proprietaireId = '';
        // Delete old owner details if they exist
        if (oldProprietaireId) {
          const oldPropRef = doc(db, COLLECTIONS.PROPRIETAIRES, oldProprietaireId).withConverter(proprietaireConverter);
          const oldPropSnap = await getDoc(oldPropRef);
          if (oldPropSnap.exists()) {
            const oldType = oldPropSnap.data().TypeProprietaire;
            const oldDetailsCollection = oldType === 'Physique' ? COLLECTIONS.PROPRIETAIRES_PHYSIQUES : COLLECTIONS.PROPRIETAIRES_MORALES;
            const oldDetailsQuery = query(
              collection(db, oldDetailsCollection),
              where('ProprietaireID', '==', oldProprietaireId)
            );
            const oldDetailsSnap = await getDocs(oldDetailsQuery);
            oldDetailsSnap.forEach((docSnap) => batch.delete(docSnap.ref));
            batch.delete(oldPropRef);
          }
        }
      } else {
        // Check if existing ProprietaireID can be reused
        let isTypeChanged = false;
        let oldType: 'Physique' | 'Morale' | undefined;

        if (oldProprietaireId) {
          const oldPropRef = doc(db, COLLECTIONS.PROPRIETAIRES, oldProprietaireId).withConverter(proprietaireConverter);
          const oldPropSnap = await getDoc(oldPropRef);
          if (oldPropSnap.exists()) {
            oldType = oldPropSnap.data().TypeProprietaire;
            isTypeChanged = oldType !== formData.TypeProprietaire;

            // Update type if changed
            if (isTypeChanged) {
              batch.update(oldPropRef, { TypeProprietaire: formData.TypeProprietaire });
            }
            proprietaireId = oldProprietaireId;

            // Delete old details if type changed
            if (isTypeChanged && oldType) {
              const oldDetailsCollection = oldType === 'Physique' ? COLLECTIONS.PROPRIETAIRES_PHYSIQUES : COLLECTIONS.PROPRIETAIRES_MORALES;
              const oldDetailsQuery = query(
                collection(db, oldDetailsCollection),
                where('ProprietaireID', '==', oldProprietaireId)
              );
              const oldDetailsSnap = await getDocs(oldDetailsQuery);
              oldDetailsSnap.forEach((docSnap) => batch.delete(docSnap.ref));
            }

            // Update or create details
            if (formData.TypeProprietaire === 'Physique') {
              const detailsQuery = query(
                collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES).withConverter(proprietairePhysiqueConverter),
                where('ProprietaireID', '==', proprietaireId)
              );
              const detailsSnap = await getDocs(detailsQuery);

              if (!detailsSnap.empty && !isTypeChanged) {
                // Update existing Physique details
                const detailsRef = detailsSnap.docs[0].ref;
                batch.update(detailsRef, {
                  NomProprietaire: formData.NomProprietaire.trim(),
                  PrenomProprietaire: formData.PrenomProprietaire.trim(),
                });
              } else {
                // Create new Physique details
                const newDetailsRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES)).withConverter(proprietairePhysiqueConverter);
                const physData: ProprietairePhysique = {
                  ProprietaireID: proprietaireId,
                  NomProprietaire: formData.NomProprietaire.trim(),
                  PrenomProprietaire: formData.PrenomProprietaire.trim(),
                };
                batch.set(newDetailsRef, physData);
              }
            } else {
              const detailsQuery = query(
                collection(db, COLLECTIONS.PROPRIETAIRES_MORALES).withConverter(proprietaireMoraleConverter),
                where('ProprietaireID', '==', proprietaireId)
              );
              const detailsSnap = await getDocs(detailsQuery);

              if (!detailsSnap.empty && !isTypeChanged) {
                // Update existing Morale details
                const detailsRef = detailsSnap.docs[0].ref;
                batch.update(detailsRef, {
                  NomEntreprise: formData.NomEntreprise.trim(),
                });
              } else {
                // Create new Morale details
                const newDetailsRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES)).withConverter(proprietaireMoraleConverter);
                const morData: ProprietaireMorale = {
                  ProprietaireID: proprietaireId,
                  NomEntreprise: formData.NomEntreprise.trim(),
                };
                batch.set(newDetailsRef, morData);
              }
            }
          }
        }

        // Create new proprietaire only if no existing one
        if (!proprietaireId) {
          const newPropRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES).withConverter(proprietaireConverter));
          const newProp: Proprietaire = {
            ProprietaireID: newPropRef.id,
            TypeProprietaire: formData.TypeProprietaire,
          };
          batch.set(newPropRef, newProp);
          proprietaireId = newPropRef.id;

          // Create details
          if (formData.TypeProprietaire === 'Physique') {
            const newDetailsRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES)).withConverter(proprietairePhysiqueConverter);
            const physData: ProprietairePhysique = {
              ProprietaireID: proprietaireId,
              NomProprietaire: formData.NomProprietaire.trim(),
              PrenomProprietaire: formData.PrenomProprietaire.trim(),
            };
            batch.set(newDetailsRef, physData);
          } else {
            const newDetailsRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES)).withConverter(proprietaireMoraleConverter);
            const morData: ProprietaireMorale = {
              ProprietaireID: proprietaireId,
              NomEntreprise: formData.NomEntreprise.trim(),
            };
            batch.set(newDetailsRef, morData);
          }
        }
      }

      /** -------------------------------
       * 5. Update Station
       * ------------------------------ */
      const stationUpdateData: any = {
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

      batch.update(stationRef, stationUpdateData);

      /** -------------------------------
       * 6. Update Autorisations
       * ------------------------------ */
      const oldAutorisationsQuery = query(
        collection(db, COLLECTIONS.AUTORISATIONS),
        where('StationID', '==', stationId)
      );
      const oldAutorisationsSnap = await getDocs(oldAutorisationsQuery);
      oldAutorisationsSnap.forEach((docSnap) => batch.delete(docSnap.ref));

      for (const autoData of formData.autorisations) {
        if (autoData.NumeroAutorisation.trim()) {
          const newRef = doc(collection(db, COLLECTIONS.AUTORISATIONS).withConverter(autorisationConverter));
          const newAutorisation: Autorisation = {
            AutorisationID: newRef.id,
            StationID: stationId,
            TypeAutorisation: autoData.TypeAutorisation,
            NumeroAutorisation: autoData.NumeroAutorisation.trim(),
            DateAutorisation: autoData.DateAutorisation ? new Date(autoData.DateAutorisation) : null,
          };
          batch.set(newRef, newAutorisation);
        }
      }

      /** -------------------------------
       * 7. Update Capacités
       * ------------------------------ */
      const capacitesQuery = query(
        collection(db, COLLECTIONS.CAPACITES_STOCKAGE),
        where('StationID', '==', stationId)
      );
      const capacitesSnap = await getDocs(capacitesQuery);
      capacitesSnap.forEach((docSnap) => batch.delete(docSnap.ref));

      if (formData.CapaciteGasoil.trim()) {
        const gasoilRef = doc(collection(db, COLLECTIONS.CAPACITES_STOCKAGE).withConverter(capaciteConverter));
        const gasoil: CapaciteStockage = {
          CapaciteID: gasoilRef.id,
          StationID: stationId,
          TypeCarburant: 'Gasoil',
          CapaciteLitres: parseFloat(formData.CapaciteGasoil),
        };
        batch.set(gasoilRef, gasoil);
      }

      if (formData.CapaciteSSP.trim()) {
        const sspRef = doc(collection(db, COLLECTIONS.CAPACITES_STOCKAGE).withConverter(capaciteConverter));
        const ssp: CapaciteStockage = {
          CapaciteID: sspRef.id,
          StationID: stationId,
          TypeCarburant: 'SSP',
          CapaciteLitres: parseFloat(formData.CapaciteSSP),
        };
        batch.set(sspRef, ssp);
      }

      /** -------------------------------
       * Commit
       * ------------------------------ */
      await batch.commit();

    } catch (err: any) {
      console.error('Failed to update station:', err);
      setError(`Failed to update station: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { updateStation, loading, error };
}