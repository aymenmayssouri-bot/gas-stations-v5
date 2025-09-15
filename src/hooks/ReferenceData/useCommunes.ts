import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Commune } from '@/types/station';

const COLLECTIONS = {
  COMMUNES: 'communes',
};

export function useCommunes(provinceId?: string) {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchCommunes();
  }, [provinceId]);

  return { communes, loading, refetch: fetchCommunes };
}