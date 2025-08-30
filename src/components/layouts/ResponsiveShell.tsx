'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from './DashboardLayout';
import { OfflineStatus } from '@/components/offline/OfflineStatus';
import { SimpleOfflineIndicator } from '@/components/offline/SimpleOfflineIndicator';
import { GlobalSearch } from '@/components/core/GlobalSearch';
import { NotificationCenter } from '@/components/core/NotificationCenter';
import { UserMenu } from '@/components/core/UserMenu';


// ========================================
// RESPONSIVE SHELL (P1 - Core Platform)
// ========================================

interface ResponsiveShellProps {
  children: React.ReactNode;
}

export function ResponsiveShell({ children }: ResponsiveShellProps) {
  const { data: session, status } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll for blur effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      
      // Ctrl/Cmd + N for notifications
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowNotifications(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              NextGen ERP
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please sign in to continue
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Offline indicator */}
      <SimpleOfflineIndicator />
      
      {/* Main layout */}
      <DashboardLayout>
        {/* Top bar for mobile */}
        {isMobile && (
          <div className={`sticky top-0 z-40 border-b px-4 py-1 transition-all duration-200 ${
            isScrolled 
              ? 'bg-background/80 backdrop-blur-md border-border/50' 
              : 'bg-background border-border'
          }`}>
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">NextGen ERP</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 hover:bg-muted rounded-md"
                  title="Search (Ctrl+K)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setShowNotifications(true)}
                  className="p-2 hover:bg-muted rounded-md relative"
                  title="Notifications (Ctrl+N)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5L9 15l4.5 4.5L18 15l4.5 4.5" />
                  </svg>
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>
                
                <UserMenu />
              </div>
            </div>
          </div>
        )}

        {/* Desktop top bar */}
        {!isMobile && (
          <div className={`sticky top-0 z-40 border-b px-6 py-1 transition-all duration-200 ${
            isScrolled 
              ? 'bg-background/80 backdrop-blur-md border-border/50' 
              : 'bg-background border-border'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">NextGen ERP</h1>
                
                <button
                  onClick={() => setShowSearch(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border rounded-md bg-muted/50 hover:bg-muted transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search...
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowNotifications(true)}
                  className="p-2 hover:bg-muted rounded-md relative"
                  title="Notifications (Ctrl+N)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.5 19.5L9 15l4.5 4.5L18 15l4.5 4.5" />
                  </svg>
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </button>
                
                <UserMenu />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1">
          {children}
        </div>
      </DashboardLayout>

      {/* Global Search Modal */}
      {showSearch && (
        <GlobalSearch
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
        />
      )}

      {/* Notification Center */}
      {showNotifications && (
        <NotificationCenter
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}

      {/* Offline Status */}
      <OfflineStatus />
    </div>
  );
}
