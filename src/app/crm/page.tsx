"use client";

import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  AlertTriangle,
  Settings
} from 'lucide-react';
import Link from 'next/link';

export default function CRMPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Relationship Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage customers, leads, and sales opportunities</p>
          </div>
        </div>

        {/* Module Disabled Message */}
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  CRM Module Temporarily Disabled
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300">
                  The Customer Relationship Management module is currently under maintenance and has been temporarily disabled. 
                  Please check back later or contact your system administrator for more information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alternative Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Customer Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Customer data can still be managed through other modules:
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Operations</Badge>
                  <span className="text-sm">Equipment rental customers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Inventory</Badge>
                  <span className="text-sm">Purchase order suppliers</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access system configuration and settings:
              </p>
              <Button asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Go to Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
} 