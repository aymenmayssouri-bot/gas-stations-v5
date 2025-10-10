// src/app/api/usage/increment-maps/route.ts
import { NextResponse } from 'next/server';

// --- CONFIGURATION ---
const MAX_DESTINATIONS = 25;
const CACHE_TTL_MS = 1000 * 60 * 5;

type CacheEntry = { data: any; timestamp: number };
const cache = (globalThis as any).__distanceCache ||= new Map<string, CacheEntry>();

function cleanupCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      cache.delete(key);
    }
  }
}
setInterval(cleanupCache, CACHE_TTL_MS);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origins = searchParams.get('origins');
    const destinations = searchParams.get('destinations');
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey || !origins || !destinations) {
      return NextResponse.json(
        { error: 'Missing API key, origins, or destinations' },
        { status: 400 }
      );
    }
    
    const destinationCount = destinations.split('|').length;
    if (destinationCount > MAX_DESTINATIONS) {
      return NextResponse.json(
        { error: `Request exceeds the maximum of ${MAX_DESTINATIONS} destinations.` },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${origins}|${destinations}`;
    const cachedEntry = cache.get(cacheKey);
    const now = Date.now();

    if (cachedEntry && (now - cachedEntry.timestamp < CACHE_TTL_MS)) {
      console.log('Serving from cache:', cacheKey);
      return NextResponse.json(cachedEntry.data);
    }

    // Make API request
    const mode = searchParams.get('mode') || 'driving';
    const units = searchParams.get('units') || 'metric';
    const language = searchParams.get('language') || 'fr';
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&units=${units}&language=${language}&key=${apiKey}`;
    
    console.log('Fetching from Google Maps API...');
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('API HTTP Error:', response.status, response.statusText, data);
      return NextResponse.json(
        { error: `HTTP Error: ${response.status} - ${data.error_message || 'Unknown error'}` },
        { status: response.status }
      );
    }
    
    // If successful, cache the result
    if (data.status === 'OK') {
      console.log('Storing in cache:', cacheKey);
      cache.set(cacheKey, { data, timestamp: Date.now() });
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