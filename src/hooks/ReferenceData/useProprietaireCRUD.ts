// src/hooks/referenceData/useProprietaireCRUD.ts
import { useCallback, useState } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import {
  Proprietaire,
  ProprietairePhysique,
  ProprietaireMorale,
} from '@/types/station';

const COLLECTIONS = {
  PROPRIETAIRES: 'proprietaires',
  PROPRIETAIRES_PHYSIQUES: 'proprietaires_physiques',
  PROPRIETAIRES_MORALES: 'proprietaires_morales',
};

export function useProprietaireCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProprietaire = useCallback(async (data: {
    TypeProprietaire: 'Physique' | 'Morale';
    NomProprietaire?: string;
    NomEntreprise?: string;
  }) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
    try {
      const proprietaireRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES));
      const proprietaire: Omit<Proprietaire, 'id'> = {
        TypeProprietaire: data.TypeProprietaire,
      };
      batch.set(proprietaireRef, proprietaire);

      if (data.TypeProprietaire === 'Physique' && data.NomProprietaire) {
        const physiqueRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES));
        const physique: Omit<ProprietairePhysique, 'id'> = {
          ProprietaireID: proprietaireRef.id,
          NomProprietaire: data.NomProprietaire,
        };
        batch.set(physiqueRef, physique);
      } else if (data.TypeProprietaire === 'Morale' && data.NomEntreprise) {
        const moraleRef = doc(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES));
        const morale: Omit<ProprietaireMorale, 'id'> = {
          ProprietaireID: proprietaireRef.id,
          NomEntreprise: data.NomEntreprise,
        };
        batch.set(moraleRef, morale);
      }

      await batch.commit();
    } catch (err: any) {
      setError(`Failed to create proprietaire: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProprietaire = useCallback(async (
    id: string,
    data: {
      TypeProprietaire: 'Physique' | 'Morale';
      NomProprietaire?: string;
      NomEntreprise?: string;
    },
  ) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
    try {
      const proprietaireRef = doc(db, COLLECTIONS.PROPRIETAIRES, id);
      const proprietaireData = { TypeProprietaire: data.TypeProprietaire };
      batch.update(proprietaireRef, proprietaireData);

      if (data.TypeProprietaire === 'Physique' && data.NomProprietaire) {
        const physiqueSnapshot = await getDocs(
          query(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES), where('ProprietaireID', '==', id)),
        );
        if (!physiqueSnapshot.empty) {
          batch.update(physiqueSnapshot.docs[0].ref, { NomProprietaire: data.NomProprietaire });
        }
      } else if (data.TypeProprietaire === 'Morale' && data.NomEntreprise) {
        const moraleSnapshot = await getDocs(
          query(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES), where('ProprietaireID', '==', id)),
        );
        if (!moraleSnapshot.empty) {
          batch.update(moraleSnapshot.docs[0].ref, { NomEntreprise: data.NomEntreprise });
        }
      }

      await batch.commit();
    } catch (err: any) {
      setError(`Failed to update proprietaire: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProprietaire = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
    try {
      batch.delete(doc(db, COLLECTIONS.PROPRIETAIRES, id));

      const physiqueSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.PROPRIETAIRES_PHYSIQUES), where('ProprietaireID', '==', id)),
      );
      physiqueSnapshot.docs.forEach(d => batch.delete(d.ref));

      const moraleSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.PROPRIETAIRES_MORALES), where('ProprietaireID', '==', id)),
      );
      moraleSnapshot.docs.forEach(d => batch.delete(d.ref));

      await batch.commit();
    } catch (err: any) {
      setError(`Failed to delete proprietaire: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProprietaire, updateProprietaire, deleteProprietaire, loading, error };
}