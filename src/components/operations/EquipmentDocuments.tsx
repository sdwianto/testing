'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Edit, Trash2, FileText, 
  Download, ExternalLink, File, 
  BookOpen, Award, Wrench 
} from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

// ========================================
// EQUIPMENT DOCUMENTS COMPONENT
// ========================================

const documentSchema = z.object({
  documentType: z.string().min(1, 'Document type is required'),
  documentName: z.string().min(1, 'Document name is required'),
  documentUrl: z.string().min(1, 'Document URL is required'),
  description: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface EquipmentDocumentsProps {
  equipmentId: string;
}

export function EquipmentDocuments({ equipmentId }: EquipmentDocumentsProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      documentType: 'MANUAL',
      documentName: '',
      documentUrl: '',
      description: '',
    },
  });

  const { data: documents, isLoading, refetch } = trpc.ops.listEquipmentDocuments.useQuery({
    equipmentId,
  });

  const createDocument = trpc.ops.createEquipmentDocument.useMutation({
    onSuccess: () => {
      toast.success('Document created successfully');
      reset();
      setIsFormOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create document: ${error.message}`);
    },
  });

  const updateDocument = trpc.ops.updateEquipmentDocument.useMutation({
    onSuccess: () => {
      toast.success('Document updated successfully');
      reset();
      setIsFormOpen(false);
      setEditingDocument(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update document: ${error.message}`);
    },
  });

  const deleteDocument = trpc.ops.deleteEquipmentDocument.useMutation({
    onSuccess: () => {
      toast.success('Document deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete document: ${error.message}`);
    },
  });

  const onSubmit = async (data: DocumentFormData) => {
    if (editingDocument) {
      await updateDocument.mutateAsync({
        id: editingDocument,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    } else {
      await createDocument.mutateAsync({
        equipmentId,
        ...data,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const handleEdit = (document: any) => {
    setEditingDocument(document.id);
    setValue('documentType', document.documentType);
    setValue('documentName', document.documentName);
    setValue('documentUrl', document.documentUrl);
    setValue('description', document.description || '');
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument.mutateAsync({ 
        id,
        idempotencyKey: crypto.randomUUID(),
      });
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    const iconMap = {
      MANUAL: BookOpen,
      CERTIFICATE: Award,
      WARRANTY: File,
      SPECIFICATION: FileText,
      MAINTENANCE: Wrench,
      OTHER: File,
    };
    
    return iconMap[type as keyof typeof iconMap] || File;
  };

  const getDocumentTypeBadge = (type: string) => {
    const typeConfig = {
      MANUAL: { variant: 'default' as const, color: 'text-blue-600' },
      CERTIFICATE: { variant: 'secondary' as const, color: 'text-green-600' },
      WARRANTY: { variant: 'outline' as const, color: 'text-orange-600' },
      SPECIFICATION: { variant: 'destructive' as const, color: 'text-red-600' },
      MAINTENANCE: { variant: 'default' as const, color: 'text-purple-600' },
      OTHER: { variant: 'outline' as const, color: 'text-gray-600' },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.OTHER;
    const Icon = getDocumentTypeIcon(type);
    
    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
        <Icon className="h-3 w-3" />
        {type}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Equipment Documents</h3>
          <p className="text-sm text-gray-600">Manage manuals, certificates, and other documents</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Document
        </Button>
      </div>

      {/* Documents List */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents?.map((document: any) => (
                <TableRow key={document.id}>
                  <TableCell>{getDocumentTypeBadge(document.documentType)}</TableCell>
                  <TableCell className="font-medium">{document.documentName}</TableCell>
                  <TableCell className="max-w-xs truncate">{document.description || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.documentUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(document)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {(!documents || documents.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No documents found. Add some documents to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Form Modal */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingDocument ? 'Edit Document' : 'Add New Document'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="documentType">Document Type *</Label>
                  <Select onValueChange={(value) => setValue('documentType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      <SelectItem value="WARRANTY">Warranty</SelectItem>
                      <SelectItem value="SPECIFICATION">Specification</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.documentType && (
                    <p className="text-sm text-red-600">{errors.documentType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="documentName">Document Name *</Label>
                  <Input
                    id="documentName"
                    {...register('documentName')}
                    placeholder="e.g., User Manual, Safety Certificate"
                  />
                  {errors.documentName && (
                    <p className="text-sm text-red-600">{errors.documentName.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="documentUrl">Document URL *</Label>
                  <Input
                    id="documentUrl"
                    {...register('documentUrl')}
                    placeholder="https://example.com/document.pdf"
                  />
                  {errors.documentUrl && (
                    <p className="text-sm text-red-600">{errors.documentUrl.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Document description..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createDocument.isPending || updateDocument.isPending}>
                  {editingDocument ? 'Update Document' : 'Create Document'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingDocument(null);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
