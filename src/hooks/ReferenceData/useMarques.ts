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

  const fetchMarques = async () => {
    setLoading(true); // Added for consistency
    try {
      const snapshot = await getDocs(
        query(collection(db, COLLECTIONS.MARQUES), orderBy('Marque'))
      );
      const marqueList = snapshot.docs.map(doc => 
        ({ id: doc.id, ...(doc.data() as unknown as Omit<Marque, 'id'>) } as Marque)
      );
      setMarques(marqueList);
    } catch (error) {
      console.error('Error fetching marques:', error);
      setMarques([]); // Set empty array on error for consistency
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarques();
  }, []);

  return { marques, loading, refetch: fetchMarques };
}