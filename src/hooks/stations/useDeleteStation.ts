// src/hooks/stations/useDeleteStation.ts
import { useCallback, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const COLLECTIONS = {
  STATIONS: 'stations',
  AUTORISATIONS: 'autorisations',
  CAPACITES_STOCKAGE: 'capacites_stockage',
};

export function useDeleteStation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteStation = useCallback(async (stationId: string) => {
    setLoading(true);
    setError(null);
    const batch = writeBatch(db);

    try {
      // Get a reference to the station document
      const stationRef = doc(db, COLLECTIONS.STATIONS, stationId);
      
      // Delete related autorisations
      const autorisationsSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.AUTORISATIONS), where('StationID', '==', stationId))
      );
      autorisationsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete related capacites
      const capacitesSnapshot = await getDocs(
        query(collection(db, COLLECTIONS.CAPACITES_STOCKAGE), where('StationID', '==', stationId))
      );
      capacitesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete the station document itself
      batch.delete(stationRef);

      await batch.commit();
      
    } catch (err: any) {
      console.error('Error deleting station:', err);
      setError(`Failed to delete station: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteStation, loading, error };
}