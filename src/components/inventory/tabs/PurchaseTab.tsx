'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ShoppingCart } from 'lucide-react';

// ========================================
// PURCHASE TAB COMPONENT
// Separated for better code splitting
// ========================================

interface PurchaseTabProps {
  onShowPRForm: () => void;
}

export function PurchaseTab({ onShowPRForm }: PurchaseTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={onShowPRForm}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Purchase Request (PR)</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <ShoppingCart className="h-6 w-6" />
              <span className="text-sm">Purchase Order (PO)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
