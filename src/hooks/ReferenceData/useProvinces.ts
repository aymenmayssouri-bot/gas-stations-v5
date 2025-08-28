// src/hooks/ReferenceData/useProvinces.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Province } from '@/types/station';

const COLLECTIONS = {
  PROVINCES: 'provinces'
};

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, COLLECTIONS.PROVINCES), orderBy('Province'))
        );
        const provinceList = snapshot.docs.map(doc => 
          ({ id: doc.id, ...doc.data() } as Province)
        );
        setProvinces(provinceList);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinces();
  }, []);

  return { provinces, loading };
}