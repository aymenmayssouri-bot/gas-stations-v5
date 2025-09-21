import { NextResponse } from 'next/server';

// --- CONFIGURATION ---
const MAX_DESTINATIONS = 25; // Google Maps API limit for free tier
const CACHE_TTL_MS = 1000 * 60 * 5; // 5-minute cache lifetime

// --- CACHE SETUP ---
// A simple in-memory cache attached to globalThis to persist across requests in dev/serverless environments.
// In a production environment with multiple instances, a shared cache like Redis would be more robust.
type CacheEntry = { data: any; timestamp: number };
const cache = (globalThis as any).__distanceCache ||= new Map<string, CacheEntry>();

/**
 * Clears expired entries from the cache.
 */
function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }
}
// Periodically clean up the cache to prevent memory leaks
setInterval(cleanupCache, CACHE_TTL_MS);


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origins = searchParams.get('origins');
    const destinations = searchParams.get('destinations');
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    // --- VALIDATION ---
    if (!apiKey || !origins || !destinations) {
      return NextResponse.json(
        { error: 'Missing API key, origins, or destinations' },
        { status: 400 }
      );
    }
    
    // Validate the number of destinations to prevent overly large requests.
    const destinationCount = destinations.split('|').length;
    if (destinationCount > MAX_DESTINATIONS) {
      return NextResponse.json(
        { error: `Request exceeds the maximum of ${MAX_DESTINATIONS} destinations.` },
        { status: 400 }
      );
    }

    // --- CACHING LOGIC ---
    const cacheKey = `${origins}|${destinations}`;
    const cachedEntry = cache.get(cacheKey);
    const now = Date.now();

    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL_MS)) {
      console.log('Serving from cache:', cacheKey);
      return NextResponse.json(cachedEntry.data);
    }

    // --- API REQUEST ---
    const mode = searchParams.get('mode') || 'driving';
    const units = searchParams.get('units') || 'metric';
    const language = searchParams.get('language') || 'fr';
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&units=${units}&language=${language}&key=${apiKey}`;
    
    console.log('Proxy fetching from Google Maps API...');
    const response = await fetch(url);
    const data = await response.json();

    // --- ERROR HANDLING ---
    if (!response.ok) {
      console.error('Proxy HTTP Error:', response.status, response.statusText, data);
      
      // Gracefully handle rate limiting (429 Too Many Requests)
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: `HTTP Error: ${response.status} - ${data.error_message || 'Unknown Google Maps API error'}` },
        { status: response.status }
      );
    }
    
    // --- CACHE AND RESPOND ---
    if (data.status === 'OK') {
      console.log('Storing in cache:', cacheKey);
      cache.set(cacheKey, { data, timestamp: Date.now() });
    } else {
      console.error('Proxy API Error:', data.error_message, data.status);
    }

    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Distance Matrix API proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}