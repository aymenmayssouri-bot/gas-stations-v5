// src/app/(authenticated)/stations/page.tsx
"use client";

import { useStations } from "@/hooks/stations/useStations";
import StationsTable from "@/components/stations/StationsTable";
import { useState } from "react";
import { StationWithDetails } from "@/types/station";
import { PaginationInfo, SortConfig } from "@/types/table";

export default function StationsPage() {
  const { stations, loading, error } = useStations();

  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: stations.length,
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "NomStation",
    direction: "asc",
  });

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const handleEdit = (station: StationWithDetails) => {
    console.log("Edit", station);
  };

  const handleDelete = async (station: StationWithDetails) => {
    console.log("Delete", station);
  };

  const handleSortChange = (config: SortConfig) => {
  setSortConfig(config);
};

  if (loading) return <div className="p-4">Loading stations...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stations</h1>

      {stations.length === 0 ? (
        <div>No stations found.</div>
      ) : (
        <StationsTable
          stations={stations}
          pagination={pagination}
          onPageChange={handlePageChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          sortConfig={{ key: "NomStation", direction: "asc" }}
          onSortChange={handleSortChange}
        />
      )}
    </div>
  );
}