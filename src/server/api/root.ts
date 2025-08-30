/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { router } from './config/trpc';
import { operationsRouter } from './routers/operations';
import { inventoryRouter } from './routers/inventory';
import { coreRouter } from './routers/core';
import { purchaseRouter } from './routers/purchase';
import { kpiRouter } from './routers/kpi';
import { workflowRouter } from './routers/workflow';

// ========================================
// MAIN tRPC ROUTER (P1 - Core Platform)
// ========================================

export const appRouter = router({
  ops: operationsRouter,
  inv: inventoryRouter,
  core: coreRouter,
  purchase: purchaseRouter,
  kpi: kpiRouter,
  workflow: workflowRouter,
});

export type AppRouter = typeof appRouter;
