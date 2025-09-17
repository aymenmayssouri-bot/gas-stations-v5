import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const origins = searchParams.get('origins');
    const destinations = searchParams.get('destinations');
    const mode = searchParams.get('mode') || 'driving';
    const units = searchParams.get('units') || 'metric';
    const language = searchParams.get('language') || 'fr';
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    console.log('Server-side API Key:', apiKey);
    console.log('Origins:', origins);
    console.log('Destinations:', destinations);

    if (!apiKey || !origins || !destinations) {
      return NextResponse.json(
        { error: 'Missing API key, origins, or destinations' },
        { status: 400 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&units=${units}&language=${language}&key=${apiKey}`;
    console.log('Proxy fetching:', url);

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Proxy HTTP Error:', response.status, response.statusText, data);
      return NextResponse.json(
        { error: `HTTP Error: ${response.status} ${response.statusText} - ${data.error_message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    if (data.status !== 'OK') {
      console.error('Proxy API Error:', data.error_message, data.status);
      return NextResponse.json(
        { error: data.error_message || `API Error: ${data.status}` },
        { status: 400 }
      );
    }

    console.log('Proxy API Response:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Distance Matrix API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}