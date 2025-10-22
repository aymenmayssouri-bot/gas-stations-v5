// src/hooks/stations/useArchiveStation.ts
import { useCallback, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { COLLECTIONS } from '@/lib/firebase/collections';

export function useArchiveStation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveStation = useCallback(async (stationId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Archiving station ${stationId}...`);
      
      const stationRef = doc(db, COLLECTIONS.STATIONS, stationId);
      
      await updateDoc(stationRef, {
        Statut: 'archivé'
      });
      
      console.log('✅ Station archived successfully');
      
    } catch (err: any) {
      console.error('Error archiving station:', err);
      setError(`Failed to archive station: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { archiveStation, loading, error };
}