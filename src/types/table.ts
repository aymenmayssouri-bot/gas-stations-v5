import { GasStation } from './station';

export interface SortConfig {
  key: keyof GasStation | string;
  direction: 'asc' | 'desc';
}

export interface StationsTableState {
  ui: {
    showAddForm: boolean;
    selectedStation: GasStation | null;
    searchQuery: string;
    sortConfig: SortConfig;
    currentPage: number;
    itemsPerPage: number;
  };
  actions: {
    openAddForm: () => void;
    closeAddForm: () => void;
    openEditForm: (station: GasStation) => void;
    closeEditForm: () => void;
    setSearchQuery: (query: string) => void;
    setSortConfig: (config: SortConfig) => void;
    setCurrentPage: (page: number) => void;
    deleteStation: (id: string) => Promise<void>;
    refreshStations: () => void;
  };
}

export interface TableColumn {
  key: keyof GasStation | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, station: GasStation) => React.ReactNode;
  width?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

export interface TableFilters {
  search: string;
  city?: string;
  brand?: string;
  hasShop?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
    fuelType?: string;
  };
}