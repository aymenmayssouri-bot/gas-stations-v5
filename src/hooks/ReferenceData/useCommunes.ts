// src/hooks/ReferenceData/useCommunes.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Commune } from '@/types/station';

const COLLECTIONS = {
  COMMUNES: 'Communes', // NOTE: capital C
};

export function useCommunes(provinceId?: string) {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunes = async () => {
      setLoading(true);
      try {
        const base = collection(db, COLLECTIONS.COMMUNES);
        const q = provinceId
          ? query(base, where('ProvinceID', '==', provinceId), orderBy('NomCommune'))
          : query(base, orderBy('NomCommune'));
        const snap = await getDocs(q);
        setCommunes(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Commune[]);
      } catch (e) {
        console.error('Error fetching communes', e);
        setCommunes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCommunes();
  }, [provinceId]);

  return { communes, loading };
}