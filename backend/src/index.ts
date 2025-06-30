import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { requireAuth } from './middleware/requireAuth';
import { startSessionCleanup } from './utils/session';

// Routes
import * as authRoutes from './routes/authRoutes';
import * as userRoutes from './routes/userRoutes';

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

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

startSessionCleanup();

app.post('/api/register', authRoutes.handleRegistration);
app.post('/api/authenticate', authRoutes.handleAuthentication);
app.post('/api/logout', requireAuth, authRoutes.handleLogout);

app.get('/api/me', userRoutes.handleMeRoute);
app.get('/api/session', userRoutes.handleGetCurrentSession);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
