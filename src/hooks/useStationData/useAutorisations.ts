// src/hooks/useStationData/useStationAutorisations.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Autorisation } from '@/types/station';

const COLLECTIONS = {
  AUTORISATIONS: 'autorisations',
};

export function useAutorisations(stationId: string) {
  const [autorisations, setAutorisations] = useState<Autorisation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stationId) {
      setAutorisations([]);
      setLoading(false);
      return;
    }

    const fetchAutorisations = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, COLLECTIONS.AUTORISATIONS), 
            where('StationID', '==', stationId))
        );
        const autorisationList = snapshot.docs.map(doc => 
          ({ id: doc.id, ...doc.data() } as Autorisation)
        );
        setAutorisations(autorisationList);
      } catch (error) {
        console.error('Error fetching authorizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAutorisations();
  }, [stationId]);

  return { autorisations, loading };
}