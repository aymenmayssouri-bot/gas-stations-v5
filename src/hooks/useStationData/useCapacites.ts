// src/hooks/useStationData/useStationCapacites.ts
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { CapaciteStockage } from '@/types/station';

const COLLECTIONS = {
  CAPACITES_STOCKAGE: 'capacites_stockage',
};

export function useCapacites(stationId: string) {
  const [capacites, setCapacites] = useState<CapaciteStockage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!stationId) {
      setCapacites([]);
      setLoading(false);
      return;
    }

    const fetchCapacites = async () => {
      try {
        const snapshot = await getDocs(
          query(collection(db, COLLECTIONS.CAPACITES_STOCKAGE), 
            where('StationID', '==', stationId))
        );
        const capaciteList = snapshot.docs.map(doc => 
          ({ id: doc.id, ...doc.data() } as CapaciteStockage)
        );
        setCapacites(capaciteList);
      } catch (error) {
        console.error('Error fetching capacities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCapacites();
  }, [stationId]);

  return { capacites, loading };
}