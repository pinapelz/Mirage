import { prisma } from '../config/db';
import express from 'express';
import { createSession } from '../utils/session'
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export const handleRegistration = async (req: express.Request, res: express.Response) => {
  try {
    const { username, password, email, code: inviteCode } = req.body;
    const requireInvite = process.env.REQUIRE_INVITE === 'true';

    if (!username || !password || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (requireInvite && !inviteCode) {
      return res.status(400).json({ error: 'Invite code is required' });
    }

    if (requireInvite && inviteCode) {
      const invite = await prisma.inviteCodes.findUnique({ where: { code: inviteCode } });
      if (!invite || invite.remaining <= 0) {
        return res.status(400).json({ error: 'Invalid invite code' });
      }
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
        isAdmin: false
      }
    });

    // Decrement invite code usage if required
    if (requireInvite && inviteCode) {
      await prisma.inviteCodes.update({
        where: { code: inviteCode },
        data: { remaining: { decrement: 1 } }
      });
    }

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
}

export const handleAuthentication = async (req: express.Request, res: express.Response) => {
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
}

export const handleLogout = async (req: express.Request, res: express.Response,) => {
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
}
