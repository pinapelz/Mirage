import crypto from 'crypto';
import { prisma } from '../config/db';

export const createSession = async (userId: number): Promise<string> => {
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

export const cleanupExpiredSessions = async () => {
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

export const startSessionCleanup = () => {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
};
