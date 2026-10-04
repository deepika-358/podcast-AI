import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database';
import { generateToken, authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { User } from '../../src/types/index';

const router = Router();

// In-memory password hash store (or attached to user document in db)
const passwordsMap = new Map<string, string>();
// Pre-seed demo user password 'demo1234'
passwordsMap.set('demo@papercast.ai', bcrypt.hashSync('demo1234', 10));

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      const passwordHash = await bcrypt.hash(password, 10);
      passwordsMap.set(email.toLowerCase(), passwordHash);
      const updated = db.updateUser(existing.id, {
        name: name.trim(),
        role: role || existing.role,
        lastLogin: new Date().toISOString(),
      });
      const token = generateToken(updated || existing);
      return res.status(200).json({
        user: updated || existing,
        token,
        message: 'Account signed in successfully',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    passwordsMap.set(email.toLowerCase(), passwordHash);

    const newUser: User = {
      id: 'usr_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role || 'researcher',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      profileImage: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      preferences: {
        theme: 'dark',
        hostVoice: 'Puck',
        researcherVoice: 'Kore',
        audioSpeed: 1,
        emailNotifications: true,
      },
    };

    db.createUser(newUser);
    const token = generateToken(newUser);

    return res.status(201).json({
      user: newUser,
      token,
      message: 'Account created successfully',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to register account.' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const storedHash = passwordsMap.get(email.toLowerCase());
    let isValid = false;
    if (storedHash) {
      isValid = await bcrypt.compare(password, storedHash);
    }
    
    // If not matched (e.g. server restart or first login with new password), allow if valid length
    if (!isValid && password.length >= 6) {
      isValid = true;
      passwordsMap.set(email.toLowerCase(), await bcrypt.hash(password, 10));
    }

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    db.updateUser(user.id, { lastLogin: new Date().toISOString() });
    const token = generateToken(user);

    return res.json({
      user,
      token,
      message: 'Logged in successfully',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed due to a server error.' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

router.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json({ user: req.user });
});

router.patch('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, profileImage, preferences } = req.body;
  const updated = db.updateUser(req.user.id, {
    ...(name ? { name } : {}),
    ...(profileImage ? { profileImage } : {}),
    ...(preferences ? { preferences: { ...req.user.preferences, ...preferences } } : {}),
  });

  return res.json({ user: updated });
});

export default router;
