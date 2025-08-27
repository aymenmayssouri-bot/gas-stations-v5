// src/hooks/useGasStations.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { GasStation } from '@/types/station';
import { docToStation } from '@/lib/utils/stationTransformers';

const COLLECTION = 'gasStations'; // Make sure this matches your Firestore collection name

export function useGasStations() {
  const [stations, setStations] = useState<GasStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    
    console.log('Setting up Firestore listener for collection:', COLLECTION);

    try {
      const q = query(collection(db, COLLECTION), orderBy('Nom de Station'));
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          console.log('Firestore snapshot received:', {
            size: snapshot.size,
            empty: snapshot.empty,
            docs: snapshot.docs.length
          });

          const list: GasStation[] = [];
          snapshot.forEach((doc) => {
            try {
              const station = docToStation(doc.id, doc.data());
              list.push(station);
              console.log('Processed station:', doc.id, station['Nom de Station']);
            } catch (docError) {
              console.error('Error processing document:', doc.id, docError);
            }
          });
          
          console.log('Final stations list:', list.length, 'stations');
          setStations(list);
          setLoading(false);
        },
        (err) => {
          console.error('Firestore error:', err);
          console.error('Error code:', err.code);
          console.error('Error message:', err.message);
          
          setError(`Failed to load stations: ${err.message}`);
          setLoading(false);
        }
      );
      
      return unsubscribe;
    } catch (err: any) {
      console.error('Error setting up Firestore listener:', err);
      setError(`Configuration error: ${err.message}`);
      setLoading(false);
      return () => {}; // Return empty function for cleanup
    }
  }, []);

  useEffect(() => {
    const unsubscribe = refetch();
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [refetch]);

  return { stations, loading, error, refetch };
}