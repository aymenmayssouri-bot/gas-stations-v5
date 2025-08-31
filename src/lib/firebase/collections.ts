// src/lib/firebase/collections.ts

/**
 * Centralized Firestore collection names.
 * 
 * By using this object everywhere instead of hardcoding strings,
 * we avoid typos and keep consistency across hooks/services.
 */
export const COLLECTIONS = {
  STATIONS: 'stations',
  PROVINCES: 'provinces',
  COMMUNES: 'communes',
  MARQUES: 'marques',
  GERANTS: 'gerants',
  PROPRIETAIRES: 'proprietaires',
  PROPRIETAIRES_PHYSIQUES: 'proprietaires_physiques',
  PROPRIETAIRES_MORALES: 'proprietaires_morales',
  AUTORISATIONS: 'autorisations',
  CAPACITES_STOCKAGE: 'capacites_stockage',
} as const;

// This type ensures that if you ever mistype a key, TypeScript will catch it.
export type CollectionKey = keyof typeof COLLECTIONS;
export type CollectionName = typeof COLLECTIONS[CollectionKey];