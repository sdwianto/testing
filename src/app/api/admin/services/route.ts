import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { BackgroundServices } from '@/server/api/services/background';

// ========================================
// ADMIN SERVICES API (P1 - Service Management)
// ========================================

export async function GET() {
  try {
    const isRunning = BackgroundServices.isRunning();
    
    return NextResponse.json({
      success: true,
      data: {
        isRunning,
        services: {
          eventPublisher: isRunning,
          // Add other services here
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to get service status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get service status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json() as { action: string };

    switch (action) {
      case 'start':
        BackgroundServices.start();
        return NextResponse.json({
          success: true,
          message: 'Background services started'
        });

      case 'stop':
        BackgroundServices.stop();
        return NextResponse.json({
          success: true,
          message: 'Background services stopped'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('❌ Failed to manage services:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to manage services' },
      { status: 500 }
    );
  }
}

