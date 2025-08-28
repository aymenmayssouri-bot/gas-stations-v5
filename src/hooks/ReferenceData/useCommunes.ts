// src/hooks/ReferenceData/useCommunes.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Commune } from '@/types/station';

const COLLECTIONS = {
  COMMUNES: 'communes'
};

export function useCommunes(provinceId?: string) {
  const [communes, setCommunes] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommunes = async () => {
      try {
        let q = query(collection(db, COLLECTIONS.COMMUNES), orderBy('Commune'));
        
        if (provinceId) {
          q = query(collection(db, COLLECTIONS.COMMUNES), 
            where('ProvinceID', '==', provinceId), 
            orderBy('Commune')
          );
        }

        const snapshot = await getDocs(q);
        const communeList = snapshot.docs.map(doc => 
          ({ id: doc.id, ...doc.data() } as Commune)
        );
        setCommunes(communeList);
      } catch (error) {
        console.error('Error fetching communes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunes();
  }, [provinceId]);

  return { communes, loading };
}