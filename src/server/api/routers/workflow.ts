/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-floating-promises */
import { z } from 'zod';
import { router, protectedProcedure } from '../config/trpc';
import { WorkflowService, WorkflowConfigs, type WorkflowInstance, type ApprovalThreshold } from '../services/workflowService';
import { TRPCError } from '@trpc/server';

// ========================================
// WORKFLOW ROUTER (P1 - Approval Processes)
// ========================================

export const workflowRouter = router({
  // Create workflow instance
  createWorkflow: protectedProcedure
    .input(z.object({
      docType: z.enum(['PR', 'PO', 'WO', 'AP_INV', 'GL_JE']),
      docId: z.string(),
      data: z.any(),
      thresholds: z.array(z.object({
        level: z.number(),
        min: z.number(),
        max: z.number().optional(),
        roles: z.array(z.string()),
      })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { docType, docId, data, thresholds } = input;
      
      // Use predefined thresholds if not provided
      let approvalThresholds: ApprovalThreshold[];
      
      switch (docType) {
        case 'PO':
          approvalThresholds = WorkflowConfigs.PO_APPROVAL;
          break;
        case 'PR':
          approvalThresholds = WorkflowConfigs.PR_APPROVAL;
          break;
        case 'WO':
          approvalThresholds = WorkflowConfigs.WO_APPROVAL;
          break;
        case 'AP_INV':
          approvalThresholds = WorkflowConfigs.AP_INVOICE_APPROVAL;
          break;
        default:
          approvalThresholds = thresholds ?? [];
      }
      
      const workflow = await WorkflowService.createWorkflow(
        docType,
        docId,
        data,
        approvalThresholds
      );
      
      return workflow;
    }),

  // Process approval/rejection
  processApproval: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      action: z.enum(['approve', 'reject']),
      note: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { workflowId, action, note } = input;
      
      const workflow = await WorkflowService.processApproval(
        workflowId,
        ctx.userId,
        action,
        note
      );
      
      return workflow;
    }),

  // Get workflow instance
  getWorkflow: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const workflow = await WorkflowService.getWorkflow(input.workflowId);
      
      if (!workflow) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workflow not found',
        });
      }
      
      return workflow;
    }),

  // Get workflows for current user
  getMyWorkflows: protectedProcedure
    .query(async ({ ctx }) => {
      const workflows = await WorkflowService.getWorkflowsForUser(ctx.userId);
      return workflows;
    }),

  // Get workflow history
  getWorkflowHistory: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const history = await WorkflowService.getWorkflowHistory(input.workflowId);
      return history;
    }),

  // Cancel workflow
  cancelWorkflow: protectedProcedure
    .input(z.object({
      workflowId: z.string(),
      reason: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await WorkflowService.cancelWorkflow(input.workflowId, input.reason);
      return { success: true };
    }),

  // Get workflow configurations
  getWorkflowConfigs: protectedProcedure
    .query(async ({ ctx }) => {
      return {
        PO_APPROVAL: WorkflowConfigs.PO_APPROVAL,
        PR_APPROVAL: WorkflowConfigs.PR_APPROVAL,
        WO_APPROVAL: WorkflowConfigs.WO_APPROVAL,
        AP_INVOICE_APPROVAL: WorkflowConfigs.AP_INVOICE_APPROVAL,
      };
    }),

  // Get workflows by document type
  getWorkflowsByDocType: protectedProcedure
    .input(z.object({
      docType: z.enum(['PR', 'PO', 'WO', 'AP_INV', 'GL_JE']),
      status: z.enum(['pending', 'approved', 'rejected']).optional(),
    }))
    .query(async ({ ctx, input }) => {
      // This would need to be implemented in WorkflowService
      // For now, return empty array
      return [];
    }),

  // Get workflow statistics
  getWorkflowStats: protectedProcedure
    .query(async ({ ctx }) => {
      // This would need to be implemented in WorkflowService
      // For now, return mock data
      return {
        totalWorkflows: 0,
        pendingWorkflows: 0,
        approvedWorkflows: 0,
        rejectedWorkflows: 0,
        averageApprovalTime: 0,
      };
    }),
});
