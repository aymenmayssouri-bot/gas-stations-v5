// src/hooks/referenceData/useCommuneCRUD.ts
import { useCallback, useState } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Commune, Province } from '@/types/station';

const COLLECTIONS = {
  COMMUNES: 'communes',
  PROVINCES: 'provinces'
};

export function useCommuneCRUD() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCommune = useCallback(async (data: { Commune: string; Province: string }) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
    try {
      // Find or create Province
      let provinceId: string;
      const existingProvinceSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.PROVINCES), where('Province', '==', data.Province.trim()))
      );

      if (!existingProvinceSnapshot.empty) {
        provinceId = existingProvinceSnapshot.docs[0].id;
      } else {
        const provinceRef = doc(collection(db, COLLECTIONS.PROVINCES));
        const province: Omit<Province, 'id'> = {
          Province: data.Province.trim()
        };
        batch.set(provinceRef, province);
        provinceId = provinceRef.id;
      }

      // Create Commune
      const communeRef = doc(collection(db, COLLECTIONS.COMMUNES));
      const commune: Omit<Commune, 'id'> = {
        Commune: data.Commune.trim(),
        ProvinceID: provinceId
      };
      batch.set(communeRef, commune);

      await batch.commit();

    } catch (err: any) {
      setError(`Failed to create commune: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCommune = useCallback(async (id: string, data: { Commune: string; Province?: string }) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);
    try {
      let communeUpdateData: Partial<Commune> = { Commune: data.Commune.trim() };
      
      if (data.Province) {
        const existingProvinceSnapshot = await getDocs(
          query(collection(db, COLLECTIONS.PROVINCES), where('Province', '==', data.Province.trim()))
        );
        let provinceId: string;
        if (!existingProvinceSnapshot.empty) {
          provinceId = existingProvinceSnapshot.docs[0].id;
        } else {
          const provinceRef = doc(collection(db, COLLECTIONS.PROVINCES));
          const province: Omit<Province, 'id'> = { Province: data.Province.trim() };
          batch.set(provinceRef, province);
          provinceId = provinceRef.id;
        }
        communeUpdateData.ProvinceID = provinceId;
      }

      const communeRef = doc(db, COLLECTIONS.COMMUNES, id);
      batch.update(communeRef, communeUpdateData);

      await batch.commit();

    } catch (err: any) {
      setError(`Failed to update commune: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCommune = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteDoc(doc(db, COLLECTIONS.COMMUNES, id));
    } catch (err: any) {
      setError(`Failed to delete commune: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createCommune, updateCommune, deleteCommune, loading, error };
}