import express from 'express';
import { prisma } from '../config/db';

export const handleScoreUpload = async (req: express.Request, res: express.Response) => {
  try {
    const { meta, scores } = req.body;
    const userId = req.session.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Please log in to upload scores.' });
    }

    // Basic universal validation
    if (!meta || !meta.game || !meta.service || !scores) {
      return res.status(400).json({ error: 'Invalid request format. Expected meta with game/service and scores array' });
    }
    let game = await prisma.game.findUnique({
      where: { internalName: meta.game }
    });
    if (!game) {
      game = await prisma.game.findFirst({
        where: { formattedName: meta.game }
      });
    }
    if (!game) {
      return res.status(400).json({ error: `Game '${meta.game}' is not supported. Ensure that you are using the case-sensitive version of either the internal name or formatted name` });
    }
    const internalGameName = game.internalName;
    const scoresArray = Array.isArray(scores) ? scores : [scores];

    // Create score records
    const createdScores = await prisma.score.createMany({
      data: scoresArray.map(scoreData => ({
        gameInternalName: internalGameName,
        userId: userId,
        data: scoreData
      }))
    });

    res.status(200).json({
      message: 'Score upload received successfully',
      game: meta.game,
      service: meta.service,
      scoreCount: createdScores.count
    });

  } catch (error) {
    console.error('Score upload endpoint error:', error);
    res.status(500).json({ error: 'Internal server error. Unable to process score upload' });
  }
}
