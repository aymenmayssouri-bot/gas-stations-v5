'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, onSnapshot, FirestoreError } from 'firebase/firestore';
import { Gerant } from '@/types/station';

const COLLECTIONS = {
  GERANTS: 'gerants',
};

export function useGerants() {
  const [gerants, setGerants] = useState<Gerant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, COLLECTIONS.GERANTS));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const gerantData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            GerantID: doc.id,
            CINGerant: data.CINGerant || '',
            PrenomGerant: data.PrenomGerant || '',
            NomGerant: data.NomGerant || '',
            Telephone: data.Telephone || '',
          } as Gerant;
        });
        setGerants(gerantData);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        console.error('Error fetching gerants:', err.message);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { gerants, loading, error };
}