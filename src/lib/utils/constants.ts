/**
 * Default city to select when dashboard loads
 */
export const DEFAULT_CITY = 'Rabat';

/**
 * Fuel types available in the system
 */
export const FUEL_TYPES = {
  DIESEL: 'diesel',
  GASOLINE_95: 'gasoline95',
  GASOLINE_98: 'gasoline98',
  LPG: 'lpg'
} as const;

/**
 * Common gas station brands in Morocco
 */
export const GAS_STATION_BRANDS = [
  'Shell',
  'Total',
  'Afriquia',
  'Petrom',
  'Winxo',
  'Other'
] as const;

/**
 * Common services offered at gas stations
 */
export const STATION_SERVICES = [
  'Car Wash',
  'Air Pump',
  'Oil Change',
  'Tire Service',
  'ATM',
  'Restaurant',
  'Restrooms',
  'WiFi'
] as const;

/**
 * Dashboard refresh intervals (in milliseconds)
 */
export const REFRESH_INTERVALS = {
  REAL_TIME: 5000,   // 5 seconds
  NORMAL: 30000,     // 30 seconds
  SLOW: 60000        // 1 minute
} as const;