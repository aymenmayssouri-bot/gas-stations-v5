// src/hooks/useApiUsage.ts
import { useState, useEffect } from 'react';
import { getApiUsage, getQuotaInfo, ApiUsageData, ApiType } from '@/lib/firebase/apiUsage';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  exceeded: boolean;
}

interface ApiUsageState {
  maps: QuotaInfo;
  routes: QuotaInfo;
}

function getTodayId(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useApiUsage() {
  const [usage, setUsage] = useState<ApiUsageState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch
    const fetchUsage = async () => {
      try {
        setLoading(true);
        const data = await getApiUsage();
        
        setUsage({
          maps: getQuotaInfo('maps_js_api', data.maps_js_api),
          routes: getQuotaInfo('routes_api', data.routes_api),
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching API usage:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();

    // Real-time listener for updates
    const docRef = doc(db, 'api_usage', getTodayId());
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() ?? {};
          setUsage({
            maps: getQuotaInfo('maps_js_api', data.maps_js_api ?? 0),
            routes: getQuotaInfo('routes_api', data.routes_api ?? data.distance_matrix_api ?? 0),
          });
        } else {
          // Document doesn't exist yet today
          setUsage({
            maps: getQuotaInfo('maps_js_api', 0),
            routes: getQuotaInfo('routes_api', 0),
          });
        }
      },
      (err) => {
        console.error('Error listening to usage updates:', err);
        setError(err.message);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { usage, loading, error };
}