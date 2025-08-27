// src/components/dashboard/StationStats.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

export function StationStats() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'gasStations'), snapshot => {
      setCount(snapshot.size);
      console.log('StationStats: Found', snapshot.size, 'stations');
    });
    return () => unsub();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white shadow rounded-lg p-4">
        <p className="text-gray-500">Total Stations</p>
        <p className="text-2xl font-bold">{count}</p>
      </div>
      {/* Add more stat cards later */}
    </div>
  );
}