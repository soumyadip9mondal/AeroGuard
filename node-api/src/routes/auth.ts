import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../db/client';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '../middleware/auth';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Validation failed.',
        details: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
      });
    }

    const { email, password } = parsed.data;
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = result[0];

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as 'admin' | 'engineer' | 'viewer',
    });

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed.' });
  }
});

router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'aeroguard-dev-secret-change-in-production';
    const decoded = jwt.default.verify(authHeader.slice(7), JWT_SECRET) as { userId: string };

    const result = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    }).from(users).where(eq(users.id, decoded.userId)).limit(1);

    if (!result[0]) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.status(200).json(result[0]);
  } catch {
    return res.status(401).json({ error: 'Invalid token.' });
  }
});

router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, role } = req.body;
    
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    let dbRole = role || 'Quality Inspector';

    if (existingUser.length === 0) {
      await db.insert(users).values({
        email,
        passwordHash: 'clerk_sso',
        firstName: firstName || '',
        lastName: lastName || '',
        role: dbRole as any,
      });
    } else {
      await db.update(users).set({ role: dbRole as any }).where(eq(users.email, email));
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({ error: 'Sync failed' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt,
    }).from(users);
    
    return res.status(200).json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

export default router;
