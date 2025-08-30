/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-floating-promises */
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye,
  ArrowRight,
  Clock,
  User
} from "lucide-react";
import { format } from "date-fns";

// ========================================
// CONFLICT RESOLUTION UI (P1 - Offline Backbone)
// Per Implementation Guide: "Conflicts" inbox with actions
// ========================================

export interface ConflictData {
  id: string;
  type: string;
  entity: string;
  entityId: string;
  localData: any;
  serverData: any;
  conflictType: 'version_mismatch' | 'field_conflict' | 'deletion_conflict';
  createdAt: string;
  lastAttempt: string;
  retryCount: number;
  description: string;
}

interface ConflictResolutionProps {
  conflicts: ConflictData[];
  onResolve: (conflictId: string, action: ConflictAction, data?: any) => Promise<void>;
  onRetry: (conflictId: string) => Promise<void>;
  onDismiss: (conflictId: string) => void;
}

export type ConflictAction = 
  | 'accept_server' 
  | 'override_server' 
  | 'merge_fields' 
  | 'create_adjustment'
  | 'retry';

export function ConflictResolution({ 
  conflicts, 
  onResolve, 
  onRetry, 
  onDismiss 
}: ConflictResolutionProps) {
  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [mergeData, setMergeData] = useState<any>(null);

  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'version_mismatch':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />;
      case 'field_conflict':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'deletion_conflict':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConflictVariant = (type: string) => {
    switch (type) {
      case 'version_mismatch':
        return 'outline';
      case 'field_conflict':
        return 'destructive';
      case 'deletion_conflict':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const handleResolve = async (action: ConflictAction, data?: any) => {
    if (!selectedConflict) return;
    
    setIsResolving(true);
    try {
      await onResolve(selectedConflict.id, action, data);
      setSelectedConflict(null);
      setMergeData(null);
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const handleRetry = async (conflictId: string) => {
    try {
      await onRetry(conflictId);
    } catch (error) {
      console.error('Failed to retry conflict:', error);
    }
  };

  const renderConflictDetails = (conflict: ConflictData) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Local Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(conflict.localData, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Server Data */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Server State
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto max-h-40">
                {JSON.stringify(conflict.serverData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>

        {/* Conflict Description */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {conflict.description}
          </AlertDescription>
        </Alert>

        {/* Resolution Actions */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Resolution Options:</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResolve('accept_server')}
              disabled={isResolving}
              className="justify-start"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept Server Version
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResolve('override_server')}
              disabled={isResolving}
              className="justify-start"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Override with Local
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResolve('merge_fields')}
              disabled={isResolving}
              className="justify-start"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Merge Fields
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResolve('create_adjustment')}
              disabled={isResolving}
              className="justify-start"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Create Adjustment
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (conflicts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Conflicts</h3>
          <p className="text-gray-600 text-center">
            All your offline changes have been successfully synchronized.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conflict Resolution</h2>
          <p className="text-gray-600">
            {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''} require{conflicts.length === 1 ? 's' : ''} your attention
          </p>
        </div>
        <Badge variant="destructive" className="text-sm">
          {conflicts.length} Pending
        </Badge>
      </div>

      {/* Conflicts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {conflicts.map((conflict) => (
          <Card 
            key={conflict.id} 
            className={`cursor-pointer transition-colors ${
              selectedConflict?.id === conflict.id 
                ? 'ring-2 ring-blue-500' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedConflict(conflict)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getConflictIcon(conflict.conflictType)}
                  <CardTitle className="text-sm">
                    {conflict.entity} - {conflict.type}
                  </CardTitle>
                </div>
                <Badge variant={getConflictVariant(conflict.conflictType)}>
                  {conflict.conflictType.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 line-clamp-2">
                  {conflict.description}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(conflict.createdAt), 'MMM dd, HH:mm')}
                  </div>
                  
                  {conflict.retryCount > 0 && (
                    <div className="flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      {conflict.retryCount} retries
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedConflict(conflict);
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRetry(conflict.id);
                    }}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conflict Details Modal */}
      {selectedConflict && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getConflictIcon(selectedConflict.conflictType)}
                Resolve Conflict: {selectedConflict.entity}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConflict(null)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {renderConflictDetails(selectedConflict)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}