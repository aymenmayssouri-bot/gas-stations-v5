// src/hooks/useUpdateStation.ts
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
  Station,
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
    const batch = writeBatch(db);

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
      // ✅ Marque exists
      const existing = marqueSnap.docs[0].data();
      marqueId = existing.MarqueID;

      batch.update(doc(db, COLLECTIONS.MARQUES, marqueId).withConverter(marqueConverter), {
        RaisonSociale: formData.RaisonSociale.trim(),
      });
    } else {
      // ✅ Create new Marque
      const newRef = doc(collection(db, COLLECTIONS.MARQUES)).withConverter(marqueConverter);
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
    // Province
    let provinceId: string;
    const provinceQuery = query(
      collection(db, COLLECTIONS.PROVINCES).withConverter(provinceConverter),
      where('NomProvince', '==', formData.Province.trim())
    );
    const provinceSnap = await getDocs(provinceQuery);

    if (!provinceSnap.empty) {
      const existing = provinceSnap.docs[0].data();
      provinceId = existing.ProvinceID;
    } else {
      const newRef = doc(collection(db, COLLECTIONS.PROVINCES)).withConverter(provinceConverter);
      const newProvince: Province = {
        ProvinceID: newRef.id,
        NomProvince: formData.Province.trim(),
      };
      batch.set(newRef, newProvince);
      provinceId = newRef.id;
    }

    // Commune
    let communeId: string;
    const communeQuery = query(
      collection(db, COLLECTIONS.COMMUNES).withConverter(communeConverter),
      where('NomCommune', '==', formData.Commune.trim()),
      where('ProvinceID', '==', provinceId)
    );
    const communeSnap = await getDocs(communeQuery);

    if (!communeSnap.empty) {
      const existing = communeSnap.docs[0].data();
      communeId = existing.CommuneID;
    } else {
      const newRef = doc(collection(db, COLLECTIONS.COMMUNES)).withConverter(communeConverter);
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
      const existing = gerantSnap.docs[0].data();
      gerantId = existing.GerantID;

      batch.update(doc(db, COLLECTIONS.GERANTS, gerantId).withConverter(gerantConverter), {
        NomGerant: formData.NomGerant.trim(),
        PrenomGerant: formData.PrenomGerant.trim(),
        Telephone: formData.Telephone.trim(),
      });
    } else {
      const newRef = doc(collection(db, COLLECTIONS.GERANTS)).withConverter(gerantConverter);
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
    let proprietaireId: string;
    const proprietaireQuery = query(
      collection(db, COLLECTIONS.PROPRIETAIRES).withConverter(proprietaireConverter),
      where('TypeProprietaire', '==', formData.TypeProprietaire)
    );
    const proprietaireSnap = await getDocs(proprietaireQuery);

    if (!proprietaireSnap.empty) {
      const existing = proprietaireSnap.docs[0].data();
      proprietaireId = existing.ProprietaireID;
    } else {
      const newRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES)).withConverter(proprietaireConverter);
      const newProprietaire: Proprietaire = {
        ProprietaireID: newRef.id,
        TypeProprietaire: formData.TypeProprietaire,
      };
      batch.set(newRef, newProprietaire);
      proprietaireId = newRef.id;
    }

    if (formData.TypeProprietaire === 'Physique') {
      const physiqueRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES)).withConverter(proprietairePhysiqueConverter);
      const physique: ProprietairePhysique = {
        ProprietaireID: proprietaireId,
        NomProprietaire: formData.NomProprietaire.trim(),
        PrenomProprietaire: formData.PrenomProprietaire.trim(),
      };
      batch.set(physiqueRef, physique);
    } else {
      const moraleRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES)).withConverter(proprietaireMoraleConverter);
      const morale: ProprietaireMorale = {
        ProprietaireID: proprietaireId,
        NomEntreprise: formData.NomEntreprise.trim(),
      };
      batch.set(moraleRef, morale);
    }

    /** -------------------------------
     * 5. Update Station
     * ------------------------------ */
    const stationRef = doc(db, COLLECTIONS.STATIONS, stationId).withConverter(stationConverter);
    const stationData: Station = {
      StationID: stationId,
      NomStation: formData.NomStation.trim(),
      Adresse: formData.Adresse.trim(),
      Latitude: parseFloat(formData.Latitude),
      Longitude: parseFloat(formData.Longitude),
      Type: formData.Type,
      MarqueID: marqueId,
      CommuneID: communeId,
      GerantID: gerantId,
      ProprietaireID: proprietaireId,
    };
    batch.set(stationRef, stationData, { merge: true });

    /** -------------------------------
     * 6. Update Autorisation
     * ------------------------------ */
    const autorisationQuery = query(
      collection(db, COLLECTIONS.AUTORISATIONS).withConverter(autorisationConverter),
      where('StationID', '==', stationId)
    );
    const autorisationSnap = await getDocs(autorisationQuery);

    if (!autorisationSnap.empty) {
      const ref = autorisationSnap.docs[0].ref.withConverter(autorisationConverter);
      batch.update(ref, {
        TypeAutorisation: formData.TypeAutorisation,
        NumeroAutorisation: formData.NumeroAutorisation.trim(),
        DateAutorisation: formData.DateAutorisation
          ? new Date(formData.DateAutorisation)
          : null,
      });
    } else {
      const newRef = doc(collection(db, COLLECTIONS.AUTORISATIONS)).withConverter(autorisationConverter);
      const newAutorisation: Autorisation = {
        AutorisationID: newRef.id,
        StationID: stationId,
        TypeAutorisation: formData.TypeAutorisation,
        NumeroAutorisation: formData.NumeroAutorisation.trim(),
        DateAutorisation: formData.DateAutorisation
          ? new Date(formData.DateAutorisation)
          : null,
      };
      batch.set(newRef, newAutorisation);
    }

    /** -------------------------------
     * 7. Update Capacités
     * ------------------------------ */
    const capacitesQuery = query(
      collection(db, COLLECTIONS.CAPACITES_STOCKAGE).withConverter(capaciteConverter),
      where('StationID', '==', stationId)
    );
    const capacitesSnap = await getDocs(capacitesQuery);

    // Delete existing capacities before replacing
    capacitesSnap.forEach((docSnap) => batch.delete(docSnap.ref));

    const gasoilRef = doc(collection(db, COLLECTIONS.CAPACITES_STOCKAGE)).withConverter(capaciteConverter);
    const sspRef = doc(collection(db, COLLECTIONS.CAPACITES_STOCKAGE)).withConverter(capaciteConverter);

    const gasoil: CapaciteStockage = {
      CapaciteID: gasoilRef.id,
      StationID: stationId,
      TypeCarburant: 'Gasoil',
      CapaciteLitres: parseFloat(formData.CapaciteGasoil),
    };
    const ssp: CapaciteStockage = {
      CapaciteID: sspRef.id,
      StationID: stationId,
      TypeCarburant: 'SSP',
      CapaciteLitres: parseFloat(formData.CapaciteSSP),
    };

    batch.set(gasoilRef, gasoil);
    batch.set(sspRef, ssp);

    /** -------------------------------
     * Commit
     * ------------------------------ */
    await batch.commit();
  }, []);

  return { updateStation, loading, error };
}