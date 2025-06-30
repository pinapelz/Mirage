import express from 'express';
import { prisma } from '../config/db';

export const handleGetSupportedGames = async (req: express.Request, res: express.Response) => {
  try {
    const supportedGames = await prisma.game.findMany({
      select: {
        internalName: true,
        formattedName: true,
        description: true
      }
    });
    res.status(200).json(supportedGames);

  } catch (error) {
    console.error('Supported Games endpoint error:', error);
    res.status(500).json({ error: 'Internal server error. Unable to fetch supported games' });
  }
}
