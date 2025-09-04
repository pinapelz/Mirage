// Routes about self (or users in general)
import express from 'express';
import { prisma } from '../config/db';

export const handleMeRoute = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.userId) {
      return res.status(403).json({ error: 'Not Authenticated' });
    }
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.session.userId },
      select: { id: true, username: true, isAdmin: true }
    });
    const isAdmin = user.id === 1 || user.isAdmin;
    res.json({user, isAdmin});
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const handleGetCurrentSession =  async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.userId) {
      return res.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, isAdmin: true }
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
}
