import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Province } from '@/types/station';

const COLLECTIONS = { PROVINCES: 'provinces' };

export function useProvinces() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProvinces = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, COLLECTIONS.PROVINCES), orderBy('NomProvince'));
      const snap = await getDocs(q);
      setProvinces(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Province[]);
    } catch (e) {
      console.error('Error fetching provinces', e);
      setProvinces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProvinces();
  }, []);

  return { provinces, loading, refetch: fetchProvinces };
}