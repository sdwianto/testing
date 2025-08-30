/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, @typescript-eslint/no-inferrable-types, @typescript-eslint/no-misused-promises, @typescript-eslint/no-empty-function */
import { prisma } from '@/lib/prisma';
import { EventPublisher } from './eventPublisher';

// ========================================
// WORKFLOW ENGINE (P1 - Approval Processes)
// Per Implementation Guide: Lite → Advanced workflow engine
// ========================================

export interface ApprovalThreshold {
  level: number;
  min: number;
  max?: number;
  roles: string[];
}

export interface ApprovalHistory {
  level: number;
  actorId: string;
  action: 'approve' | 'reject';
  at: string;
  note?: string;
}

export interface WorkflowInstance<T = any> {
  id: string;
  docType: 'PR' | 'PO' | 'WO' | 'AP_INV' | 'GL_JE';
  docId: string;
  status: 'pending' | 'approved' | 'rejected';
  currentLevel: number;
  thresholds: ApprovalThreshold[];
  history: ApprovalHistory[];
  data: T;
  createdAt: string;
  updatedAt: string;
}

export class WorkflowService {
  // Create workflow instance
  static async createWorkflow<T extends Record<string, unknown>>(
    docType: WorkflowInstance<T>['docType'],
    docId: string,
    data: T,
    thresholds: ApprovalThreshold[]
  ): Promise<WorkflowInstance<T>> {
    const workflow: WorkflowInstance<T> = {
      id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      docType,
      docId,
      status: 'pending',
      currentLevel: 1,
      thresholds,
      history: [],
      data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in database (using SystemConfig for now, could be separate table)
    await prisma.systemConfig.create({
      data: {
        tenantId: 'CA-MINE', // TODO: Get from context
        key: `workflow:${workflow.id}`,
        value: JSON.stringify(workflow),
        type: 'json',
        description: `Workflow instance for ${docType} ${docId}`,
      },
    });

    // Route to first approval level
    await this.routeWorkflow(workflow);

    // Publish workflow created event
    await EventPublisher.publishEvent('CA-MINE', {
      type: 'workflow.created',
      entity: 'Workflow',
      entityId: workflow.id,
      payload: workflow,
      version: 1,
    });

    return workflow;
  }

  // Route workflow to appropriate approval level
  static async routeWorkflow<T extends Record<string, unknown>>(workflow: WorkflowInstance<T>): Promise<void> {
    const { data, thresholds, docType } = workflow;
    
    // Determine approval level based on data (e.g., total amount)
    let targetLevel = 1;
    
    if (docType === 'PO' && 'total' in data) {
      const total = (data as unknown as { total: number }).total;
      const threshold = thresholds.find(t => 
        total >= t.min && (t.max ? total <= t.max : true)
      );
      targetLevel = threshold?.level ?? 1;
    } else if (docType === 'PR' && 'totalAmount' in data) {
      const totalAmount = (data as unknown as { totalAmount: number }).totalAmount;
      const threshold = thresholds.find(t => 
        totalAmount >= t.min && (t.max ? totalAmount <= t.max : true)
      );
      targetLevel = threshold?.level ?? 1;
    }

    workflow.currentLevel = targetLevel;
    workflow.updatedAt = new Date().toISOString();

    // Update in database
    await this.updateWorkflow(workflow);

    // Notify approvers
    await this.notifyApprovers(workflow);
  }

  // Process approval/rejection
  static async processApproval(
    workflowId: string,
    actorId: string,
    action: 'approve' | 'reject',
    note?: string
  ): Promise<WorkflowInstance> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    if (workflow.status !== 'pending') {
      throw new Error('Workflow is not in pending status');
    }

    // Add to history
    const historyEntry: ApprovalHistory = {
      level: workflow.currentLevel,
      actorId,
      action,
      at: new Date().toISOString(),
      note,
    };

    workflow.history.push(historyEntry);
    workflow.updatedAt = new Date().toISOString();

    if (action === 'reject') {
      workflow.status = 'rejected';
    } else {
      // Check if this was the final approval
      const currentThreshold = workflow.thresholds.find(t => t.level === workflow.currentLevel);
      if (!currentThreshold || workflow.currentLevel >= Math.max(...workflow.thresholds.map(t => t.level))) {
        workflow.status = 'approved';
      } else {
        // Move to next level
        workflow.currentLevel++;
        await this.routeWorkflow(workflow);
      }
    }

    // Update in database
    await this.updateWorkflow(workflow);

    // Publish approval event
    await EventPublisher.publishEvent('CA-MINE', {
      type: `workflow.${action}`,
      entity: 'Workflow',
      entityId: workflow.id,
      payload: {
        workflow,
        historyEntry,
      },
      version: 1,
    });

    return workflow;
  }

  // Get workflow instance
  static async getWorkflow(workflowId: string): Promise<WorkflowInstance | null> {
    try {
      const config = await prisma.systemConfig.findFirst({
        where: {
          tenantId: 'CA-MINE',
          key: `workflow:${workflowId}`,
        },
      });

      if (!config) return null;

      return JSON.parse(config.value) as WorkflowInstance;
    } catch (error) {
      console.error('Failed to get workflow:', error);
      return null;
    }
  }

  // Update workflow instance
  static async updateWorkflow<T>(workflow: WorkflowInstance<T>): Promise<void> {
    await prisma.systemConfig.updateMany({
      where: {
        tenantId: 'CA-MINE',
        key: `workflow:${workflow.id}`,
      },
      data: {
        value: JSON.stringify(workflow),
        updatedAt: new Date(),
      },
    });
  }

  // Notify approvers (placeholder - would integrate with notification service)
  static async notifyApprovers<T>(workflow: WorkflowInstance<T>): Promise<void> {
    const currentThreshold = workflow.thresholds.find(t => t.level === workflow.currentLevel);
    if (!currentThreshold) return;

    // Get users with required roles
    const approvers = await prisma.user.findMany({
      where: {
        role: {
          name: {
            in: currentThreshold.roles,
          },
        },
        isActive: true,
      },
    });

    // Create notifications for each approver
    for (const approver of approvers) {
      await prisma.notification.create({
        data: {
          tenantId: 'CA-MINE',
          type: 'info',
          title: `${workflow.docType} Approval Required`,
          message: `${workflow.docType} ${workflow.docId} requires your approval (Level ${workflow.currentLevel})`,
          userId: approver.id,
          data: {
            workflowId: workflow.id,
            docType: workflow.docType,
            docId: workflow.docId,
            level: workflow.currentLevel,
          },
        },
      });
    }

    console.log(`📧 Notified ${approvers.length} approvers for ${workflow.docType} ${workflow.docId}`);
  }

  // Get workflows for user
  static async getWorkflowsForUser(userId: string): Promise<WorkflowInstance[]> {
    try {
      // Get user's roles
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user) return [];

      // Get all pending workflows
      const configs = await prisma.systemConfig.findMany({
        where: {
          tenantId: 'CA-MINE',
          key: {
            startsWith: 'workflow:',
          },
        },
      });

      const workflows: WorkflowInstance[] = [];
      
      for (const config of configs) {
        try {
          const workflow = JSON.parse(config.value) as WorkflowInstance;
          
          if (workflow.status === 'pending') {
            const currentThreshold = workflow.thresholds.find(t => t.level === workflow.currentLevel);
            
            // Check if user has required role for current level
            if (currentThreshold?.roles.includes(user.role.name)) {
              workflows.push(workflow);
            }
          }
        } catch (error) {
          console.error('Failed to parse workflow:', error);
        }
      }

      return workflows;
    } catch (error) {
      console.error('Failed to get workflows for user:', error);
      return [];
    }
  }

  // Get workflow history
  static async getWorkflowHistory(workflowId: string): Promise<ApprovalHistory[]> {
    const workflow = await this.getWorkflow(workflowId);
    return workflow?.history ?? [];
  }

  // Cancel workflow
  static async cancelWorkflow(workflowId: string, reason: string): Promise<void> {
    const workflow = await this.getWorkflow(workflowId);
    if (!workflow) return;

    workflow.status = 'rejected';
    workflow.updatedAt = new Date().toISOString();
    
    // Add cancellation to history
    workflow.history.push({
      level: workflow.currentLevel,
      actorId: 'system',
      action: 'reject',
      at: new Date().toISOString(),
      note: `Workflow cancelled: ${reason}`,
    });

    await this.updateWorkflow(workflow);

    // Publish cancellation event
    await EventPublisher.publishEvent('CA-MINE', {
      type: 'workflow.cancelled',
      entity: 'Workflow',
      entityId: workflow.id,
      payload: {
        workflow,
        reason,
      },
      version: 1,
    });
  }
}

// ========================================
// WORKFLOW CONFIGURATIONS (P1 - Predefined Workflows)
// ========================================

export const WorkflowConfigs = {
  // Purchase Order approval workflow
  PO_APPROVAL: [
    { level: 1, min: 0, max: 1000, roles: ['Manager'] },
    { level: 2, min: 1000, max: 5000, roles: ['Director'] },
    { level: 3, min: 5000, roles: ['CEO'] },
  ] as ApprovalThreshold[],

  // Purchase Request approval workflow
  PR_APPROVAL: [
    { level: 1, min: 0, max: 500, roles: ['Supervisor'] },
    { level: 2, min: 500, max: 2000, roles: ['Manager'] },
    { level: 3, min: 2000, roles: ['Director'] },
  ] as ApprovalThreshold[],

  // Work Order approval workflow
  WO_APPROVAL: [
    { level: 1, min: 0, max: 2000, roles: ['Maintenance Manager'] },
    { level: 2, min: 2000, roles: ['Operations Director'] },
  ] as ApprovalThreshold[],

  // AP Invoice approval workflow
  AP_INVOICE_APPROVAL: [
    { level: 1, min: 0, max: 1000, roles: ['Accountant'] },
    { level: 2, min: 1000, max: 5000, roles: ['Finance Manager'] },
    { level: 3, min: 5000, roles: ['CFO'] },
  ] as ApprovalThreshold[],
};
