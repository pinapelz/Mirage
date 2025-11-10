import { prisma } from '../config/db';
import express from 'express';

export const handleCreateGame = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, isAdmin: true }
    });

    if (!user) {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ error: 'Invalid session' });
    }

    if (user.id !== 1 && !user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. You are not an admin of this instance' });
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

export const handleDeleteUser = async (req: express.Request, res: express.Response) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, username: true, isAdmin: true }
    });

    if (!user) {
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      return res.status(401).json({ error: 'Invalid session' });
    }

    if (user.id !== 1 && !user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized. You are not an admin of this instance' });
    }

    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const targetUserId = parseInt(userId);
    if (isNaN(targetUserId) || targetUserId <= 0) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (targetUserId === user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, username: true, isAdmin: true }
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    await prisma.user.delete({
      where: { id: targetUserId }
    });

    return res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: targetUser.id,
        username: targetUser.username
      }
    });

  } catch (error) {
    console.error('User deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
