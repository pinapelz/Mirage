import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

const app = express();
const port = 5000;

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173"
  ],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());


app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

const prisma = new PrismaClient();


declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

// Middleware to check if user is authenticated
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, email: true }
    });

    if (!user) {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Attach user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create session in database
const createSession = async (userId: number): Promise<string> => {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt
    }
  });

  return sessionId;
};

// Clean up expired sessions
const cleanupExpiredSessions = async () => {
  try {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
};

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(password + salt, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        salt,
        email,
      }
    });

    // Create session for the new user
    req.session.userId = user.id;
    const sessionId = await createSession(user.id);

    res.status(201).json({
      id: user.id,
      username: user.username,
      email: user.email,
      sessionId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password + user.salt, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session
    req.session.userId = user.id;
    const sessionId = await createSession(user.id);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      sessionId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId;

    // Remove all sessions for this user from database
    await prisma.session.deleteMany({
      where: { userId }
    });

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }

      res.clearCookie('connect.sid'); // Clear the session cookie
      res.json({ message: 'Logged out successfully' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/me', requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    res.json(user);
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Users endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check session status
app.get('/api/session', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, email: true }
    });

    if (!user) {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
