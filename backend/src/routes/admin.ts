import { prisma } from '../config/db';
import express from 'express';

export const handleCreateGame = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.session.userId !== 1){
      return res.status(403).json({ error: 'Unauthorized. You are not the admin of this instance' });
    }

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
    const { gameInternalName, gameFormattedName, gameDescription } = req.body;

    if (!gameInternalName || !gameFormattedName || !gameDescription) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const success = await prisma.game.create({
      data: {
        internalName: gameInternalName,
        formattedName: gameFormattedName,
        description: gameDescription,
      }
    });

    if (!success) {
      console.log('Failed to create game:', success);
      return res.status(500).json({ error: 'Failed to create game. Does it already exist?' });
    }
    return res.status(200).json({ message: 'Game created successfully' });


  } catch (error) {
    console.error('Game Creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
