import { prisma } from '../config/db';
import express from 'express';

export const handleGetInstanceInfo = async (req: express.Request, res: express.Response) => {
  try {
    const userCount = await prisma.user.count();
    const requireInvite = process.env.REQUIRE_INVITE || false;
    return res.status(200).json({ userCount, requireInvite });
  } catch (error) {
    console.error('Unable to get instance info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export const handleCreateInviteCode = async (req: express.Request, res: express.Response) => {
  try {
    const { uses, code } = req.body;
    if (!uses) {
      return res.status(400).json({ error: 'Missing required parameter: uses (number of maximum usages of this code)' });
    }
    const codeAlreadyExists = await prisma.inviteCodes.findUnique({ where: { code } });
    if (codeAlreadyExists) {
      return res.status(400).json({ error: 'Invite code already exists' });
    }
    const inviteCode = await prisma.inviteCodes.create({
      data: {
        code: code || Math.random().toString(36).substring(2, 15),
        remaining: uses,
      },
    });
    return res.status(200).json({ inviteCode });
  } catch (error) {
    console.error('Unable to create invite code:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
