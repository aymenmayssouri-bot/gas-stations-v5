import { useCallback, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  runTransaction,
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
import {
  stationConverter,
  marqueConverter,
  provinceConverter,
  communeConverter,
  gerantConverter,
  proprietaireConverter,
  proprietairePhysiqueConverter,
  proprietaireMoraleConverter,
  autorisationConverter,
  capaciteConverter,
} from '@/lib/firebase/converters';
import { COLLECTIONS } from '@/lib/firebase/collections';

// Helper to atomically get the next station code (serial)
async function getNextStationCode(): Promise<number> {
  const { doc, increment } = await import('firebase/firestore');
  return await runTransaction(db, async (tx) => {
    const counterRef = doc(db, 'meta', 'counters');
    const snap = await tx.get(counterRef);
    const base = 1000;
    if (!snap.exists()) {
      const next = base + 1;
      tx.set(counterRef, { stationCode: next });
      return next;
    } else {
      const current = (snap.data() as any).stationCode ?? base;
      const next = current + 1;
      tx.update(counterRef, { stationCode: next });
      return next;
    }
  });
}

export function useCreateStation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStation = useCallback(async (formData: StationFormData) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);

    try {
      // 1. Marque
      let marqueId: string;
      const marqueSnap = await getDocs(
        query(
          collection(db, COLLECTIONS.MARQUES).withConverter(marqueConverter),
          where('Marque', '==', formData.Marque.trim())
        )
      );

      if (!marqueSnap.empty) {
        marqueId = marqueSnap.docs[0].id;
        if (formData.RaisonSociale.trim()) {
          batch.update(marqueSnap.docs[0].ref, {
            RaisonSociale: formData.RaisonSociale.trim(),
          });
        }
      } else {
        const marqueRef = doc(
          collection(db, COLLECTIONS.MARQUES).withConverter(marqueConverter)
        );
        const marque: Marque = {
          MarqueID: marqueRef.id,
          Marque: formData.Marque.trim(),
          RaisonSociale: formData.RaisonSociale.trim(),
        };
        batch.set(marqueRef, marque);
        marqueId = marqueRef.id;
      }

      // 2. Province
      let provinceId: string;
      const provSnap = await getDocs(
        query(
          collection(db, COLLECTIONS.PROVINCES).withConverter(provinceConverter),
          where('NomProvince', '==', formData.Province.trim())
        )
      );

      if (!provSnap.empty) {
        provinceId = provSnap.docs[0].id;
      } else {
        const provRef = doc(
          collection(db, COLLECTIONS.PROVINCES).withConverter(provinceConverter)
        );
        const province: Province = {
          ProvinceID: provRef.id,
          NomProvince: formData.Province.trim(),
        };
        batch.set(provRef, province);
        provinceId = provRef.id;
      }

      // 3. Commune
      let communeId: string;
      const commSnap = await getDocs(
        query(
          collection(db, COLLECTIONS.COMMUNES).withConverter(communeConverter),
          where('NomCommune', '==', formData.Commune.trim()),
          where('ProvinceID', '==', provinceId)
        )
      );

      if (!commSnap.empty) {
        communeId = commSnap.docs[0].id;
      } else {
        const commRef = doc(
          collection(db, COLLECTIONS.COMMUNES).withConverter(communeConverter)
        );
        const commune: Commune = {
          CommuneID: commRef.id,
          NomCommune: formData.Commune.trim(),
          ProvinceID: provinceId,
        };
        batch.set(commRef, commune);
        communeId = commRef.id;
      }

      // 4. Gerant
      let gerantId: string;
      const gerantSnap = await getDocs(
        query(
          collection(db, COLLECTIONS.GERANTS).withConverter(gerantConverter),
          where('CINGerant', '==', formData.CINGerant.trim())
        )
      );

      if (!gerantSnap.empty) {
        gerantId = gerantSnap.docs[0].id;
        batch.update(gerantSnap.docs[0].ref, {
          PrenomGerant: formData.PrenomGerant.trim(),
          NomGerant: formData.NomGerant.trim(),
          Telephone: formData.Telephone.trim() || undefined,
        });
      } else {
        const gerantRef = doc(
          collection(db, COLLECTIONS.GERANTS).withConverter(gerantConverter)
        );
        const gerant: Gerant = {
          GerantID: gerantRef.id,
          PrenomGerant: formData.PrenomGerant.trim(),
          NomGerant: formData.NomGerant.trim(),
          CINGerant: formData.CINGerant.trim(),
          Telephone: formData.Telephone.trim() || undefined,
        };
        batch.set(gerantRef, gerant);
        gerantId = gerantRef.id;
      }

      // 5. Proprietaire
      let proprietaireId: string | undefined;
      const proprietaireName =
        formData.TypeProprietaire === 'Physique'
          ? formData.NomProprietaire.trim()
          : formData.NomEntreprise.trim();

      if (
        proprietaireName &&
        (formData.TypeProprietaire !== 'Physique' || formData.PrenomProprietaire.trim())
      ) {
        // Check for existing owner
        let existingPropId: string | undefined;
        if (formData.TypeProprietaire === 'Physique') {
          const physQuery = query(
            collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES).withConverter(proprietairePhysiqueConverter),
            where('NomProprietaire', '==', formData.NomProprietaire.trim()),
            where('PrenomProprietaire', '==', formData.PrenomProprietaire.trim())
          );
          const physSnap = await getDocs(physQuery);
          if (!physSnap.empty) {
            existingPropId = physSnap.docs[0].data().ProprietaireID;
          }
        } else {
          const morQuery = query(
            collection(db, COLLECTIONS.PROPRIETAIRES_MORALES).withConverter(proprietaireMoraleConverter),
            where('NomEntreprise', '==', formData.NomEntreprise.trim())
          );
          const morSnap = await getDocs(morQuery);
          if (!morSnap.empty) {
            existingPropId = morSnap.docs[0].data().ProprietaireID;
          }
        }

        // Use existing ProprietaireID or create new
        proprietaireId = existingPropId;
        if (!proprietaireId) {
          const propRef = doc(
            collection(db, COLLECTIONS.PROPRIETAIRES).withConverter(proprietaireConverter)
          );
          proprietaireId = propRef.id;
          const proprietaire: Proprietaire = {
            ProprietaireID: proprietaireId,
            TypeProprietaire: formData.TypeProprietaire,
          };
          console.log('Creating proprietaire with ID:', proprietaireId);
          batch.set(propRef, proprietaire);

          if (formData.TypeProprietaire === 'Physique') {
            const physRef = doc(
              collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES).withConverter(proprietairePhysiqueConverter)
            );
            const physique: ProprietairePhysique = {
              ProprietaireID: proprietaireId,
              NomProprietaire: formData.NomProprietaire.trim(),
              PrenomProprietaire: formData.PrenomProprietaire.trim(),
            };
            console.log('Creating proprietaire_physique with ID:', proprietaireId);
            batch.set(physRef, physique);
          } else {
            const morRef = doc(
              collection(db, COLLECTIONS.PROPRIETAIRES_MORALES).withConverter(proprietaireMoraleConverter)
            );
            const morale: ProprietaireMorale = {
              ProprietaireID: proprietaireId,
              NomEntreprise: formData.NomEntreprise.trim(),
            };
            console.log('Creating proprietaire_morale with ID:', proprietaireId, 'NomEntreprise:', formData.NomEntreprise.trim());
            batch.set(morRef, morale);
          }
        } else {
          // Update existing owner if needed
          const propRef = doc(db, COLLECTIONS.PROPRIETAIRES, proprietaireId).withConverter(proprietaireConverter);
          batch.set(propRef, { ProprietaireID: proprietaireId, TypeProprietaire: formData.TypeProprietaire }, { merge: true });
        }
      }

      // 6. Station
      const stationRef = doc(
        collection(db, COLLECTIONS.STATIONS).withConverter(stationConverter)
      );
      const station: Station = {
        Code: await getNextStationCode(),
        Statut: 'en activité',
        StationID: stationRef.id,
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
      console.log('Creating station with ProprietaireID:', proprietaireId);
      batch.set(stationRef, station);
      const stationId = stationRef.id;

      // 7. Autorisation
      for (const autoData of formData.autorisations) {
        if (autoData.NumeroAutorisation.trim()) {
          const autoRef = doc(collection(db, COLLECTIONS.AUTORISATIONS).withConverter(autorisationConverter));
          const autorisation: Autorisation = {
            AutorisationID: autoRef.id,
            StationID: stationId,
            TypeAutorisation: autoData.TypeAutorisation,
            NumeroAutorisation: autoData.NumeroAutorisation.trim(),
            DateAutorisation: autoData.DateAutorisation ? new Date(autoData.DateAutorisation) : null,
          };
          batch.set(autoRef, autorisation);
        }
      }

      // 8. Capacites
      if (formData.CapaciteGasoil.trim()) {
        const capRef = doc(
          collection(db, COLLECTIONS.CAPACITES_STOCKAGE).withConverter(capaciteConverter)
        );
        const cap: CapaciteStockage = {
          CapaciteID: capRef.id,
          StationID: stationId,
          TypeCarburant: 'Gasoil',
          CapaciteLitres: parseFloat(formData.CapaciteGasoil),
        };
        batch.set(capRef, cap);
      }

      if (formData.CapaciteSSP.trim()) {
        const capRef = doc(
          collection(db, COLLECTIONS.CAPACITES_STOCKAGE).withConverter(capaciteConverter)
        );
        const cap: CapaciteStockage = {
          CapaciteID: capRef.id,
          StationID: stationId,
          TypeCarburant: 'SSP',
          CapaciteLitres: parseFloat(formData.CapaciteSSP),
        };
        batch.set(capRef, cap);
      }

      console.log('Committing batch for station creation');
      await batch.commit();
      console.log('Batch committed successfully');
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