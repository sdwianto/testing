import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@/server/api/root';

// ========================================
// tRPC CLIENT (P1 - Frontend Integration)
// ========================================

export const trpc = createTRPCReact<AppRouter>();
