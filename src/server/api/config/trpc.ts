/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any */
import { initTRPC, TRPCError } from '@trpc/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create Prisma client instance
const prisma = new PrismaClient();

// ========================================
// CONTEXT CREATION (P1 - Multi-tenant)
// ========================================

interface CreateContextOptions {
  req: Request;
  res?: Response;
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  const { req } = opts;
  
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);
    
    // Extract tenant from session or headers (R2 - tenant-scoped)
    const tenantId = (session?.user as any)?.tenantId ?? req.headers.get('x-tenant-id') ?? 'CA-MINE';
    
    return {
      session,
      tenantId,
      userId: (session?.user as any)?.id ?? null,
      prisma,
      req,
    };
  } catch (error) {
    console.error('Error creating tRPC context:', error);
    // Fallback context
    return {
      session: null,
      tenantId: 'CA-MINE',
      userId: null,
      prisma,
      req,
    };
  }
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// ========================================
// tRPC INITIALIZATION
// ========================================

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof z.ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ========================================
// MIDDLEWARE (P1 - RBAC, Audit, Idempotency)
// ========================================

// Tenant scoping middleware (R2)
const tenantMiddleware = t.middleware(({ ctx, next }) => {
  if (!ctx.tenantId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Tenant ID is required',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      tenantId: ctx.tenantId,
    },
  });
});

// Authentication middleware
const authMiddleware = t.middleware(({ ctx, next }) => {
  // For now, allow access even without session (demo mode)
  // TODO: Implement proper authentication check
  const user = ctx.session?.user ?? {
    id: 'demo-user-id',
    email: 'demo@nextgen.com',
    name: 'Demo User',
    role: 'ADMIN',
    tenantId: ctx.tenantId,
    tenantName: 'CA Mine',
  };
  
  return next({
    ctx: {
      ...ctx,
      user,
    },
  });
});

// RBAC middleware
const rbacMiddleware = t.middleware(({ ctx, next, meta }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  // TODO: Implement proper RBAC check based on user roles
  const requiredPermissions = (meta as any)?.permissions as string[] || [];
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.session.user,
    },
  });
});

// Idempotency middleware (R4) - Mock implementation for now
const idempotencyMiddleware = t.middleware(async ({ ctx, next, input }) => {
  const idempotencyKey = (input as any)?.idempotencyKey;
  
  // TODO: Implement proper idempotency with IdempotencyLog model
  // For now, just pass through
  const result = await next();
  
  return result;
});

// ========================================
// PROCEDURES (P1 - Protected, Public)
// ========================================

export const router = t.router;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure.use(tenantMiddleware);
export const protectedProcedure = t.procedure
  .use(tenantMiddleware)
  .use(authMiddleware);
export const rbacProcedure = t.procedure
  .use(tenantMiddleware)
  .use(rbacMiddleware);
export const idempotentProcedure = t.procedure
  .use(tenantMiddleware)
  .use(authMiddleware)
  .use(idempotencyMiddleware);

// ========================================
// UTILITIES
// ========================================

export const createCallerFactory = t.createCallerFactory;
