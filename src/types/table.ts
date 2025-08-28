// src/types/table.ts

/**
 * Configuration for sorting in tables
 */
export interface SortConfig {
  key: string;             // the column key currently sorted
  direction: 'asc' | 'desc';
}

/**
 * Metadata for each table column
 */
export interface TableColumn {
  key: string;             // unique identifier (e.g. "NomStation")
  label: string;           // display name in header
  sortable?: boolean;      // can the column be sorted
}

/**
 * Information about pagination
 */
export interface PaginationInfo {
  currentPage: number;     // current active page (1-based)
  totalPages: number;      // total number of pages
  pageSize: number;        // items per page
  totalItems: number;      // total count of items
}