// EmptyState.tsx
'use client';

interface EmptyStateProps {
  hasSearch: boolean;
  searchQuery: string;
  totalStations: number;
}

export function EmptyState({ hasSearch, searchQuery, totalStations }: EmptyStateProps) {
  if (hasSearch) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-12 text-center">
        <div className="mx-auto w-24 h-24 mb-4 text-gray-400">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No stations found
        </h3>
        <p className="text-gray-600 mb-4">
          No stations match your search for "{searchQuery}".
        </p>
        <p className="text-sm text-gray-500">
          Try adjusting your search terms or browse all {totalStations} stations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
      <div className="mx-auto w-24 h-24 mb-4 text-gray-400">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No gas stations yet
      </h3>
      <p className="text-gray-600 mb-4">
        Get started by adding your first gas station to the database.
      </p>
    </div>
  );
}