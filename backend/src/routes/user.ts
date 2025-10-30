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

export const handleGetScoresHeatmap = async (req: express.Request, res: express.Response) => {
  const { userId, gameInternalName } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "Must specify userId to lookup parameters" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId as string) },
      select: { id: true, username: true, isAdmin: true }
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const oneYearAndOneDay = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const unixMs = Math.floor(oneYearAndOneDay.getTime() / 1000);

    const scores = await prisma.score.findMany({
      where: {
        userId: parseInt(userId as string),
        timestamp: { gte: unixMs },
        ...(gameInternalName && { gameInternalName: gameInternalName as string })
      },
      orderBy: { timestamp: 'desc' },
      select: {
        timestamp: true
      }
    }).then(scores => scores.map(score => ({
      ...score,
      timestamp: Number(score.timestamp)
    })))

    res.json({
      "username": user.username,
      "isAdmin": user.isAdmin,
      scores
    });
  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
