// src/hooks/ReferenceData/useGerants.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Gerant } from '@/types/station';

const COLLECTIONS = {
  GERANTS: 'gerants',
};

export function useGerants() {
  const [gerants, setGerants] = useState<Gerant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGerants = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, COLLECTIONS.GERANTS), orderBy('Gerant'))
        );
        const gerantList = snapshot.docs.map(doc => 
          ({ id: doc.id, ...doc.data() } as Gerant)
        );
        setGerants(gerantList);
      } catch (error) {
        console.error('Error fetching gerants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGerants();
  }, []);

  return { gerants, loading };
}