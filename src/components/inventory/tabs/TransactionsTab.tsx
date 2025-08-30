'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

// ========================================
// TRANSACTIONS TAB COMPONENT
// Separated for better code splitting
// ========================================

interface TransactionsTabProps {
  onShowGRNForm: () => void;
  onShowGIForm: () => void;
}

export function TransactionsTab({ onShowGRNForm, onShowGIForm }: TransactionsTabProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Inventory Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={onShowGRNForm}
            >
              <TrendingUp className="h-6 w-6 text-green-500" />
              <span className="text-sm">Goods Receipt Note (GRN)</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={onShowGIForm}
            >
              <TrendingUp className="h-6 w-6 text-red-500 rotate-180" />
              <span className="text-sm">Goods Issue (GI)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
