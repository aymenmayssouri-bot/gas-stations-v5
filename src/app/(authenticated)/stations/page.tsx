// src/app/(authenticated)/stations/page.tsx
"use client";

import StationsTable from "@/components/stations/StationsTable";
import { useStations } from "@/hooks/stations/useStations";
import { useState, useMemo } from "react";
import { PaginationInfo, SortConfig } from "@/types/table";
import { StationWithDetails } from "@/types/station";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

export default function StationsPage() {
  const { stations, loading, error } = useStations();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "NomStation", direction: "asc" });

  // Simple client-side paging for now
  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = Math.max(1, Math.ceil((stations?.length ?? 0) / pageSize));

  const handlePageChange = (page: number) => {
    const p = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(p);
  };

  const handleEdit = (s: StationWithDetails) => {
    // navigate to edit page or open modal
    console.log("Edit", s);
  };

  const handleDelete = (s: StationWithDetails) => {
    // call delete hook
    console.log("Delete", s);
  };

  const handleSortChange = (config: SortConfig) => {
    setSortConfig(config);
    // If you want to sort client-side, implement sorting here; or pass the config to a backend fetch.
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Stations</h1>

      <StationsTable
        stations={stations}
        onEdit={handleEdit}
        onDelete={handleDelete}
        sortConfig={sortConfig}
        onSortChange={handleSortChange}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        pageSize={pageSize}
      />
    </div>
  );
}