// src/components/dashboard/StationsByBrandChart.tsx
'use client';

import React, { useMemo } from 'react';
import { StationWithDetails } from '@/types/station';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui';

interface StationsByBrandChartProps {
  stations: StationWithDetails[];
}

export default function StationsByBrandChart({ stations }: StationsByBrandChartProps) {
  const chartDataByMarque = useMemo(() => {
    const map = new Map<string, number>();
    stations.forEach((s) => {
      const name = s.marque.Marque?.trim() || '—';
      map.set(name, (map.get(name) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [stations]);

  return (
    <Card>
      <h2 className="text-lg font-semibold mb-4">Stations par Marque</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartDataByMarque} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            {/* The YAxis is now configured to only show integers */}
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}