// src/hooks/ReferenceData/useMarques.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Marque } from '@/types/station';

const COLLECTIONS = {
  MARQUES: 'marques'
};

export function useMarques() {
  const [marques, setMarques] = useState<Marque[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarques = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, COLLECTIONS.MARQUES), orderBy('Marque'))
        );
        const marqueList = snapshot.docs.map(doc => 
          ({ id: doc.id, ...doc.data() } as Marque)
        );
        setMarques(marqueList);
      } catch (error) {
        console.error('Error fetching marques:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarques();
  }, []);

  return { marques, loading };
}