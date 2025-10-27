// src/app/api/usage/route.ts
import { NextResponse } from 'next/server';
import { getApiUsage } from '@/lib/firebase/apiUsage';

export async function GET() {
  try {
    const usage = await getApiUsage();
    return NextResponse.json({
      maps: usage.maps_js_api,
      routes: usage.routes_api ?? 0, // Handle old field
    });
  } catch (error) {
    console.error('Error fetching API usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}