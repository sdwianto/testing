'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useScroll, useTransform, useMotionValueEvent, motion } from 'framer-motion';

import { DashboardLayout } from './DashboardLayout';
import { OfflineStatus } from '@/components/offline/OfflineStatus';
import { SimpleOfflineIndicator } from '@/components/offline/SimpleOfflineIndicator';
import { NotificationCenter } from '@/components/core/NotificationCenter';
import { UserMenu } from '@/components/core/UserMenu';
import { Input } from '@/components/ui/input';
import { trpc } from '@/lib/trpc';




// ========================================
// RESPONSIVE SHELL (P1 - Core Platform)
// ========================================

interface ResponsiveShellProps {
  children: React.ReactNode;
}

export function ResponsiveShell({ children }: ResponsiveShellProps) {
  const { status } = useSession();
  const [, setIsMobile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 1) Use window scroll instead of container scroll to avoid hydration issues
  const { scrollY } = useScroll();

  // Background semi-transparan bertahap (jangan 0.8, terlalu tebal)
  const bg = useTransform(
    scrollY,
    [0, 10, 60],
    ['rgba(10,10,12,0.00)', 'rgba(10,10,12,0.10)', 'rgba(10,10,12,0.22)']
  );

  // Blur bertahap
  const blur = useTransform(
    scrollY,
    [0, 10, 60],
    ['saturate(100%) blur(0px)', 'saturate(115%) blur(8px)', 'saturate(140%) blur(14px)']
  );

  // Shadow & border tipis saat scroll
  const shadow = useTransform(
    scrollY,
    [0, 60],
    ['0 0 0 rgba(0,0,0,0)', '0 10px 30px rgba(0,0,0,0.25)']
  );

  const borderColor = useTransform(
    scrollY,
    [0, 60],
    ['rgba(255,255,255,0.00)', 'rgba(255,255,255,0.10)']
  );

  // (Opsional) debug: pastikan scrollY berubah
  useMotionValueEvent(scrollY, 'change', (v) => {
    console.log('container scrollY =', v);
  });

  // Sidebar state placeholder removed (not used here)

  // Search queries
  const { data: searchResults = [], isLoading: isSearchLoading } = trpc.core.search.global.useQuery(
    { query: searchQuery, limit: 5 },
    { enabled: searchQuery.length > 2 && showSearch }
  );

  const { data: suggestions = [] } = trpc.core.search.suggestions.useQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 && searchQuery.length <= 2 && showSearch }
  );

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);





  // Handle keyboard shortcuts and search navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      
      // Ctrl/Cmd + N for notifications
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowNotifications(true);
      }

      // Search navigation when search is open
      if (showSearch) {
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, searchResults.length - 1));
            break;
          case 'ArrowUp':
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
            break;
          case 'Enter':
            e.preventDefault();
            if (searchResults[selectedIndex]) {
              window.location.href = searchResults[selectedIndex].url;
              setShowSearch(false);
              setSearchQuery('');
            }
            break;
          case 'Escape':
            setShowSearch(false);
            setSearchQuery('');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, searchResults, selectedIndex]);

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
      
      {/* Main layout with sidebar and header */}
      <DashboardLayout>
        {/* Fixed Header with blur effect - positioned after sidebar */}
        <motion.header
          style={{
            // Header dimulai setelah sidebar dengan responsive behavior
            left: 'var(--sidebar-width, 16rem)',
            width: 'calc(100% - var(--sidebar-width, 16rem))',

            backgroundColor: bg,
            backdropFilter: blur,
            WebkitBackdropFilter: blur,

            boxShadow: shadow,
            borderBottom: '1px solid',
            borderColor,
            willChange:
              'background-color, backdrop-filter, box-shadow, border-color, left, width',
          }}
          className="fixed top-0 z-50 transition-[left,width] duration-200 
                     md:left-[var(--sidebar-width)] md:w-[calc(100%-var(--sidebar-width))]
                     group-data-[collapsible=icon]:md:left-[var(--sidebar-width-icon)] group-data-[collapsible=icon]:md:w-[calc(100%-var(--sidebar-width-icon))]
                     group-data-[collapsible=offcanvas]:md:left-0 group-data-[collapsible=offcanvas]:md:w-full
                     max-md:left-0 max-md:w-full"
        >
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Search Input - takes up available space */}
            <div className="flex-1 max-w-md relative">
              {showSearch ? (
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    placeholder="Search equipment, items, customers, orders..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedIndex(0);
                    }}
                    className="pl-10 pr-10"
                    onBlur={() => {
                      // Close search after a delay to allow clicking on results
                      setTimeout(() => {
                        if (!searchQuery) {
                          setShowSearch(false);
                        }
                      }, 200);
                    }}
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  
                  {/* Search Results Dropdown */}
                  {(searchResults.length > 0 || suggestions.length > 0) && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                      {searchQuery.length <= 2 && suggestions.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs text-muted-foreground mb-2">Suggestions</div>
                          {suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => setSearchQuery(suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-muted rounded text-sm"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <div className="p-2">
                          <div className="text-xs text-muted-foreground mb-2">Results</div>
                          {searchResults.map((result, index) => (
                            <button
                              key={index}
                              onClick={() => {
                                window.location.href = result.url;
                                setShowSearch(false);
                                setSearchQuery('');
                              }}
                              className={`w-full text-left px-3 py-2 hover:bg-muted rounded text-sm flex items-center gap-2 ${
                                index === selectedIndex ? 'bg-muted' : ''
                              }`}
                            >
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {result.type}
                              </span>
                              <span className="flex-1">{result.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {isSearchLoading && (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Searching...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full text-left px-3 py-2 text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-md transition-colors"
                  title="Search (Ctrl+K)"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm">Search...</span>
                    <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
                  </div>
                </button>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 ml-4">
              {/* Notifications button */}
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
              
              {/* User Menu */}
              <UserMenu />
            </div>
          </div>
        </motion.header>

        {/* 4) CONTENT AREA */}
        <div className="flex-1 pt-16">
          {children}
        </div>
      </DashboardLayout>



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
