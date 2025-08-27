// TablePagination.tsx
'use client';

import { PaginationInfo } from '@/types/table';
import { generatePageNumbers } from '@/lib/utils/tableUtils';
import  Button  from '@/components/ui/Button';

interface TablePaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function TablePagination({ pagination, onPageChange }: TablePaginationProps) {
  const { currentPage, totalPages } = pagination;
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Showing {pagination.startIndex + 1} to {pagination.endIndex} of{' '}
        {pagination.totalItems} results
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>

        <div className="flex gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
                  ...
                </span>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}