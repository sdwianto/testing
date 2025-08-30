import { EventPublisher } from './eventPublisher';

// ========================================
// BACKGROUND SERVICES (P1 - Event Processing)
// ========================================

export class BackgroundServices {
  private static isStarted = false;

  // Start all background services
  static start() {
    if (this.isStarted) {
      console.log('⚠️ Background services already started');
      return;
    }

    console.log('🚀 Starting background services...');

    // Start event publisher
    EventPublisher.startBackgroundProcessing();

    // Start other background services here
    // - Cleanup old audit logs
    // - Process sync queues
    // - Send notifications
    // - Generate reports

    this.isStarted = true;
    console.log('✅ Background services started successfully');
  }

  // Stop all background services
  static stop() {
    if (!this.isStarted) {
      console.log('⚠️ Background services not started');
      return;
    }

    console.log('🛑 Stopping background services...');
    
    // Stop event publisher and other services
    // Note: In a real application, you'd want to properly clean up intervals
    
    this.isStarted = false;
    console.log('✅ Background services stopped');
  }

  // Check if services are running
  static isRunning() {
    return this.isStarted;
  }
}

// Auto-start in production
if (process.env.NODE_ENV === 'production') {
  // Start services after a short delay to ensure everything is initialized
  setTimeout(() => {
    BackgroundServices.start();
  }, 1000);
}




