/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';

// ========================================
// NEXT AUTH CONFIGURATION (P1 - SSO/RBAC)
// ========================================

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma), // Temporarily disabled for testing
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Auth attempt:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        // Check for demo credentials first
        if (credentials.email === 'admin@nextgen.com' && credentials.password === 'admin123') {
          console.log('✅ Demo credentials accepted');
          return {
            id: 'demo-user-id',
            email: credentials.email,
            name: 'Demo Admin',
            role: 'ADMIN',
            tenantId: 'CA-MINE',
            tenantName: 'CA Mine',
          };
        }

        // For now, skip database lookup and use simple authentication
        console.log('🔍 Checking credentials...');
        
        if (credentials.password !== 'admin123') {
          console.log('❌ Invalid password');
          return null;
        }

        console.log('✅ Credentials valid, returning user');
        return {
          id: 'demo-user-id',
          email: credentials.email,
          name: 'Demo Admin',
          role: 'ADMIN',
          tenantId: 'CA-MINE',
          tenantName: 'CA Mine',
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.tenantId = (user as any).tenantId;
        token.tenantName = (user as any).tenantName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).role = token.role as string;
        (session.user as any).tenantId = token.tenantId as string;
        (session.user as any).tenantName = token.tenantName as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
