"use client";

import { 
  Building2, 
  Settings,
  Activity,
  Cloud,
  Wifi
} from "lucide-react";
import React, { type ReactNode } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "../ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";


// Dashboard header component
interface DashboardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const DashboardHeader = ({
  children,
  className = "",
}: DashboardHeaderProps) => {
  return <header className={`mb-6 space-y-2 ${className}`}>{children}</header>;
};

// Dashboard title component
interface DashboardTitleProps {
  children: ReactNode;
  className?: string;
}

export const DashboardTitle = ({
  children,
  className = "",
}: DashboardTitleProps) => {
  return (
    <h1 className={`text-2xl font-bold tracking-tight ${className}`}>
      {children}
    </h1>
  );
};

// Dashboard description component
interface DashboardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export const DashboardDescription = ({
  children,
  className = "",
}: DashboardDescriptionProps) => {
  return <p className={`text-muted-foreground ${className}`}>{children}</p>;
};

// Main dashboard layout component
interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  // Connection status states - copied from ConnectionStatusCard
  const [isOnline, setIsOnline] = useState(true);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Connection status logic - improved with better internet detection
  useEffect(() => {
    // Check internet connection with actual network test
    const checkInternetConnection = async () => {
      try {
        // Test with a reliable external service
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(3000),
        });
        setIsOnline(true);
        console.log('🌐 Internet connection active');
      } catch (error) {
        setIsOnline(false);
        setIsRealtimeConnected(false);
        console.log('🌐 Internet connection lost');
      }
    };

    // Check realtime connection with actual implementation
    const checkRealtimeConnection = async () => {
      if (isChecking) return; // Prevent multiple simultaneous checks
      
      setIsChecking(true);
      try {
        // Test connection to our API
        const response = await fetch('/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(2000), // 2 second timeout for faster response
        });
        
        if (response.ok) {
          setIsRealtimeConnected(true);
          setLastSync(new Date());
          setConnectionError(null);
          console.log('✅ Real-time connection active');
        } else {
          setIsRealtimeConnected(false);
          setConnectionError(`Server error: ${response.status}`);
          console.log('❌ Real-time connection failed:', response.status);
        }
      } catch (error) {
        setIsRealtimeConnected(false);
        const errorMessage = error instanceof Error ? error.message : 'Connection timeout';
        setConnectionError(errorMessage);
        console.log('❌ Real-time connection error:', error);
      } finally {
        setIsChecking(false);
      }
    };

    // Combined check function
    const checkConnections = async () => {
      await checkInternetConnection();
      await checkRealtimeConnection();
    };

    // Initial check
    void checkConnections();

    // Check every 3 seconds for more responsive updates
    const interval = setInterval(() => void checkConnections(), 3000);

    // Also listen to browser online/offline events as backup
    const handleOnline = () => {
      console.log('🌐 Browser online event');
      void checkConnections();
    };
    
    const handleOffline = () => {
      console.log('🌐 Browser offline event');
      setIsOnline(false);
      setIsRealtimeConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isChecking]);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    console.log('🔄 Attempting to reconnect...');
    
    try {
      // Test connection to our API
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(5000), // 5 second timeout for reconnect
      });
      
      if (response.ok) {
        setIsRealtimeConnected(true);
        setLastSync(new Date());
        setConnectionError(null);
        console.log('✅ Reconnection successful');
      } else {
        setConnectionError(`Server error: ${response.status}`);
        console.log('❌ Reconnection failed:', response.status);
        // Keep trying every 2 seconds
        setTimeout(() => {
          if (!isRealtimeConnected) {
            void handleReconnect();
          }
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection timeout';
      setConnectionError(errorMessage);
      console.log('❌ Reconnection error:', error);
      // Keep trying every 2 seconds
      setTimeout(() => {
        if (!isRealtimeConnected) {
          void handleReconnect();
        }
      }, 2000);
    } finally {
      setIsReconnecting(false);
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <h2 className="text-xl font-bold">NextGen ERP</h2>
            <p className="text-xs text-muted-foreground">Enterprise Resource Planning</p>
          </SidebarHeader>
          <SidebarContent className="px-4">
            
            {/* Main Dashboard */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Dashboard"
                  isActive={isActive("/dashboard")}
                >
                  <Link href="/dashboard">
                    <Activity className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarSeparator className="my-2" />

            {/* Business Management */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Customer Management"
                  isActive={isActive("/crm")}
                >
                  <Link href="/crm">
                    <Building2 className="mr-2 h-4 w-4" />
                    CRM
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarSeparator className="my-2" />

            {/* System */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="System Settings"
                  isActive={isActive("/settings")}
                >
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip="Offline Sync"
                  isActive={isActive("/sync")}
                >
                  <Link href="/sync">
                    <Cloud className="mr-2 h-4 w-4" />
                    Offline Sync
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <div className="flex items-start justify-between gap-3">
              {/* Left side - App info */}
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">NextGen ERP v1.0</p>
                <p className="text-muted-foreground text-xs">Papua New Guinea</p>
                <div className="flex items-center gap-2 mt-2">
                  <ThemeToggle />
                </div>
              </div>
              
              {/* Right side - Connection Status - Compact */}
              <TooltipProvider>
                <div className="bg-card/95 backdrop-blur-sm border border-border/50 rounded-md p-1.5 flex-shrink-0 w-24">
                  {/* Header - Compact */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-0.5">
                      {isOnline ? (
                        <Wifi className="h-2.5 w-2.5 text-green-500" />
                      ) : (
                        <WifiOff className="h-2.5 w-2.5 text-red-500" />
                      )}
                      <span className="text-[10px] font-medium">Connection</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`w-1 h-1 rounded-full cursor-help transition-all duration-200 ${
                          isOnline && isRealtimeConnected 
                            ? 'bg-green-500 animate-pulse' 
                            : 'bg-red-500'
                        }`} />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">
                          {isOnline && isRealtimeConnected 
                            ? 'All systems operational' 
                            : connectionError ?? 'Connection issues detected'
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                
                  {/* Status Rows - Compact with Labels */}
                  <div className="space-y-0.5">
                    {/* Live Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        <Activity className="h-2 w-2 text-blue-500" />
                        <span className="text-[8px]">Live</span>
                      </div>
                      <Badge 
                        variant={isRealtimeConnected ? "default" : "destructive"}
                        className={`text-[8px] px-0.5 py-0 h-2.5 text-[8px] transition-all duration-200 ${
                          isRealtimeConnected ? 'animate-pulse' : ''
                        }`}
                      >
                        {isRealtimeConnected ? 'ON' : 'OFF'}
                      </Badge>
                    </div>

                    {/* Internet Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5">
                        {isOnline ? (
                          <Wifi className="h-2 w-2 text-green-500" />
                        ) : (
                          <WifiOff className="h-2 w-2 text-red-500" />
                        )}
                        <span className="text-[8px]">Internet</span>
                      </div>
                      <Badge 
                        variant={isOnline ? "default" : "destructive"}
                        className={`text-[8px] px-0.5 py-0 h-2.5 text-[8px] transition-all duration-200 ${
                          isOnline ? 'animate-pulse' : ''
                        }`}
                      >
                        {isOnline ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                  </div>

                  {/* Reconnect Button - Compact with Label */}
                  <Button 
                    onClick={handleReconnect}
                    disabled={isReconnecting || isRealtimeConnected}
                    size="sm"
                    variant={isRealtimeConnected ? "ghost" : "outline"}
                    className="w-full mt-1 h-4 text-[8px] p-0.5"
                  >
                    <div className="flex items-center gap-0.5">
                      {isReconnecting ? (
                        <RefreshCw className="h-2 w-2 animate-spin" />
                      ) : isRealtimeConnected ? (
                        <RefreshCw className="h-2 w-2" />
                      ) : (
                        <RefreshCw className="h-2 w-2" />
                      )}
                      <span className="text-[8px]">
                        {isReconnecting ? 'Conn...' : isRealtimeConnected ? 'OK' : 'Retry'}
                      </span>
                    </div>
                  </Button>
                </div>
              </TooltipProvider>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="relative flex-1 overflow-auto p-6">
          <div className="md:hidden mb-4">
            <SidebarTrigger />
          </div>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};
