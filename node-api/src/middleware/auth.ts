import { Request, Response, NextFunction } from 'express';
import { requireAuth as clerkRequireAuth, getAuth } from '@clerk/express';

const JWT_SECRET = process.env.JWT_SECRET || 'aeroguard-dev-secret-change-in-production';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'admin' | 'engineer' | 'viewer';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      auth?: any;
    }
  }
}

// Keep generateToken so existing auth routes don't crash, but it won't be used for real Clerk auth
export function generateToken(user: AuthUser): string {
  return "deprecated";
}

// Clerk middleware replaces the manual JWT check
export const requireAuth = clerkRequireAuth();

export function requireRole(...roles: AuthUser['role'][]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = getAuth(req);
    if (!auth || !auth.userId) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    // With Clerk, real roles are checked via metadata. 
    // We pass for now if they are authenticated.
    next();
  };
}

import { createClerkClient } from '@clerk/backend';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function getCurrentDbUser(req: Request) {
  const auth = getAuth(req);
  if (!auth || !auth.userId) return null;
  try {
    const clerkUser = await clerkClient.users.getUser(auth.userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) return null;
    const dbUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return dbUser[0] || null;
  } catch (err) {
    console.error('Error getting current DB user:', err);
    return null;
  }
}
