import { NextResponse } from 'next/server';

// Cache the response for better performance
let cachedResponse: NextResponse | null = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5000; // 5 seconds cache

export async function GET() {
  try {
    const now = Date.now();
    
    // Return cached response if still valid
    if (cachedResponse && (now - lastCacheTime) < CACHE_DURATION) {
      return cachedResponse;
    }

    // Simple health check without database queries
    const response = NextResponse.json(
      { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        message: 'Server is running',
        cache: 'fresh'
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    // Cache the response
    cachedResponse = response;
    lastCacheTime = now;

    return response;
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}


